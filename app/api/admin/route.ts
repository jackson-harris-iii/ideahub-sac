import {env} from "cloudflare:workers";
import {isAdmin} from "../../admin-access";
import {publicIdeas} from "../../community-data";
import {reportSql,reportValues} from "../../research-match";
import {deliverNotifications,emailConfigured} from "../../notifications";
import {projectStatuses,validDemoUrl} from "../../project-status";
import {parseProjectProfile} from '../../project-profile';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function GET(req:Request){
 if(!isAdmin(req.headers))return reply({error:'Owner sign-in required.'},403);
 try{
 const rows=await env.DB!.prepare('SELECT id,title,audience,problem,approach,created_at,status FROM submissions ORDER BY created_at DESC').all();
 const votes=await env.DB!.prepare('SELECT idea, COUNT(*) AS count FROM votes GROUP BY idea').all<{idea:string;count:number}>();
 const counts=Object.fromEntries(votes.results.map(v=>[v.idea,v.count]));
 const rankings=(await publicIdeas()).map(i=>({id:i.id,title:i.title,votes:counts[i.id]||0,projectStatus:i.projectStatus,demoUrl:i.demoUrl,maintainerName:i.maintainerName,maintainerUrl:i.maintainerUrl,worksNow:i.worksNow,helpNeeded:i.helpNeeded,sourceUrl:i.sourceUrl,profileUpdatedAt:i.profileUpdatedAt})).sort((a,b)=>b.votes-a.votes||a.title.localeCompare(b.title));
 const contributions=await env.DB!.prepare('SELECT id,idea,kind,description,details,contact,created_at,status FROM contributions ORDER BY created_at DESC LIMIT 500').all();
 const reports=await env.DB!.prepare('SELECT subject,sources,version,created_at,trigger FROM research_reports ORDER BY created_at DESC LIMIT 500').all();
 const interests=await env.DB!.prepare('SELECT id,name,email,interests,note,consent_version,created_at,status FROM interests ORDER BY created_at DESC LIMIT 500').all();
 const followups=await env.DB!.prepare("SELECT subject,state FROM participation_followups WHERE subject LIKE 'interest:%'").all<{subject:string;state:string}>();
 const notifications=await env.DB!.prepare('SELECT id,kind,status,attempts,error,created_at FROM notification_outbox ORDER BY created_at DESC LIMIT 100').all();
 return reply({interests:interests.results.map(i=>{const f=followups.results.find(f=>f.subject==='interest:'+i.id);return {...i,status:f?(f.state==='closed'?'archived':f.state):i.status}}),submissions:rows.results,rankings,contributions:contributions.results,reports:reports.results,notifications:notifications.results,emailConfigured:emailConfigured()});
 }catch{return reply({error:'Could not load the review board. Please retry.'},503)}
}
export async function POST(req:Request){
 if(!isAdmin(req.headers))return reply({error:'Owner sign-in required.'},403);
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Use the admin page to review ideas.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required.'},415);
 try{const raw=await req.text();if(raw.length>5000)return reply({error:'Request too large.'},413);const b=JSON.parse(raw);
 if(b?.type==='project-profile'){
 if(typeof b.id!=='string')return reply({error:'Choose a public project.'},400);
 const parsed=parseProjectProfile(b);if(parsed.error)return reply({error:parsed.error},400);
 if(!(await publicIdeas()).some(i=>i.id===b.id))return reply({error:'Choose an idea currently approved for the board.'},404);
 const p=parsed.value!,now=Date.now();
 await env.DB!.batch([
 env.DB!.prepare('INSERT INTO project_profiles(idea,maintainer_name,maintainer_url,works_now,help_needed,source_url,maintainer_consent,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(idea) DO UPDATE SET maintainer_name=excluded.maintainer_name,maintainer_url=excluded.maintainer_url,works_now=excluded.works_now,help_needed=excluded.help_needed,source_url=excluded.source_url,maintainer_consent=excluded.maintainer_consent,updated_at=excluded.updated_at').bind(b.id,p.maintainerName,p.maintainerUrl,p.worksNow,p.helpNeeded,p.sourceUrl,p.maintainerName?1:0,now),
 env.DB!.prepare('INSERT INTO moderation_events(id,subject,status,created_at) VALUES(?,?,?,?)').bind(crypto.randomUUID(),b.id,'project:profile',now)]);
 return reply({ok:true});
 }
 if(b?.type==='project-progress'){
 if(typeof b.id!=='string'||!projectStatuses.includes(b.status)||typeof b.demoUrl!=='string'||b.demoUrl.length>500)return reply({error:'Invalid project status.'},400);
 const demoUrl=b.demoUrl.trim();
 if((demoUrl&&!validDemoUrl(demoUrl))||(b.status==='ready'&&!demoUrl))return reply({error:'Ready to try needs an HTTPS demo link. Links cannot contain usernames or passwords.'},400);
 if(!(await publicIdeas()).some(i=>i.id===b.id))return reply({error:'Choose an idea currently approved for the board.'},404);
 await env.DB!.batch([
 env.DB!.prepare('INSERT INTO project_progress(idea,status,demo_url,updated_at) VALUES(?,?,?,?) ON CONFLICT(idea) DO UPDATE SET status=excluded.status,demo_url=excluded.demo_url,updated_at=excluded.updated_at').bind(b.id,b.status,demoUrl,Date.now()),
 env.DB!.prepare('INSERT INTO moderation_events(id,subject,status,created_at) VALUES(?,?,?,?)').bind(crypto.randomUUID(),b.id,'project:'+b.status,Date.now())]);
 return reply({ok:true});
 }
 if(b?.type==='interest'){
 if(typeof b.id!=='string'||!['new','contacted','archived','delete'].includes(b.status))return reply({error:'Invalid interest action.'},400);
 const found=await env.DB!.prepare('SELECT id FROM interests WHERE id=?').bind(b.id).first();if(!found)return reply({error:'Interest not found.'},404);
 if(b.status==='delete'){await env.DB!.batch([env.DB!.prepare('DELETE FROM interests WHERE id=?').bind(b.id),env.DB!.prepare('DELETE FROM participation_followups WHERE subject=?').bind('interest:'+b.id),env.DB!.prepare('DELETE FROM notification_outbox WHERE id=?').bind('interest-'+b.id)])}else{await env.DB!.batch([env.DB!.prepare('UPDATE interests SET status=? WHERE id=?').bind(b.status,b.id),env.DB!.prepare("INSERT INTO participation_followups(subject,state,owner,notes,matched_idea,updated_at,revision) VALUES(?,?,'Site owner','','',?,1) ON CONFLICT(subject) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at,revision=participation_followups.revision+1").bind('interest:'+b.id,b.status==='archived'?'closed':b.status,Date.now())])}
 return reply({ok:true});
 }
 if(b?.action==='test-notification'){
 if(!emailConfigured())return reply({error:'Configure the email sender first.'},409);
 // One deterministic job per minute prevents repeat clicks from sending duplicates.
 const id='test-'+Math.floor(Date.now()/60000);
 await env.DB!.prepare("INSERT INTO notification_outbox(id,kind,created_at) VALUES(?,'test alert',?) ON CONFLICT(id) DO NOTHING").bind(id,Date.now()).run();
 await deliverNotifications(1,id);
 const result=await env.DB!.prepare('SELECT status FROM notification_outbox WHERE id=?').bind(id).first<{status:string}>();
 return reply({ok:result?.status==='accepted',message:result?.status==='accepted'?'Test alert accepted by Resend. Check your inbox.':'Test alert saved but not accepted. Check recent delivery status.'},result?.status==='accepted'?200:502);
 }
 if(b?.action==='retry-notifications'){await deliverNotifications(10);return reply({ok:true})}
 if(!b||typeof b.id!=='string'||!['pending','approved','rejected'].includes(b.status))return reply({error:'Invalid review action.'},400);
 const table=b.type==='contribution'?'contributions':'submissions';
 const row=await env.DB!.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(b.id).first<Record<string,string>>();if(!row)return reply({error:'Submission not found.'},404);
 const subject=(table==='contributions'?'contribution-':'idea-')+b.id;
 const text=table==='contributions'?row.description+' '+row.details:row.title+' '+row.problem+' '+row.approach;
 await env.DB!.batch([
 env.DB!.prepare(`UPDATE ${table} SET status=? WHERE id=?`).bind(b.status,b.id),
 env.DB!.prepare(reportSql).bind(...reportValues(subject,row.idea||'',text,'review:'+b.status)),
 env.DB!.prepare('INSERT INTO moderation_events(id,subject,status,created_at) VALUES(?,?,?,?)').bind(crypto.randomUUID(),subject,b.status,Date.now())]);
 return reply({ok:true});
 }catch{return reply({error:'Could not save the review. Please retry.'},503)}
}
