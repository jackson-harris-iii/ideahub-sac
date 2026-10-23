import {env} from 'cloudflare:workers';
import {isAdmin} from '../../../admin-access';
import {publicIdeas} from '../../../community-data';
import {parseFollowUp,type FollowUpItem} from '../../../follow-up';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
const sources=`SELECT 'contribution:'||id AS key,'contribution' AS kind,id,kind AS title,description,details,contact,idea AS originalIdea,status AS moderation,'' AS consent,created_at AS createdAt,'new' AS initialState FROM contributions
 UNION ALL SELECT 'submission:'||id,'submission',id,title,problem,approach,'','',''||status,'',created_at,'new' FROM submissions
 UNION ALL SELECT 'interest:'||id,'interest',id,CASE WHEN name='' THEN 'Community member' ELSE name END,note,interests,email,'','private',consent_version,created_at,CASE status WHEN 'contacted' THEN 'contacted' WHEN 'archived' THEN 'closed' ELSE 'new' END FROM interests`;
export async function GET(req:Request){
 if(!isAdmin(req.headers))return reply({error:'Owner sign-in required.'},403);
 try{
 const rows=await env.DB!.prepare(`SELECT s.*,COALESCE(f.state,s.initialState) AS state,COALESCE(f.owner,'Site owner') AS owner,COALESCE(f.notes,'') AS notes,COALESCE(f.matched_idea,'') AS matchedIdea,f.updated_at AS updatedAt,COALESCE(f.revision,0) AS revision FROM (${sources}) s LEFT JOIN participation_followups f ON f.subject=s.key ORDER BY s.createdAt DESC,s.key LIMIT 1501`).all<FollowUpItem>();
 return reply({items:rows.results.slice(0,1500),projects:(await publicIdeas()).map(p=>({id:p.id,title:p.title})),truncated:rows.results.length>1500});
 }catch{return reply({error:'Could not load the private inbox. Please retry.'},503)}
}
export async function POST(req:Request){
 if(!isAdmin(req.headers))return reply({error:'Owner sign-in required.'},403);
 if(req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Use the private inbox to save follow-up.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required.'},415);
 try{
 const raw=await req.text();if(raw.length>6000)return reply({error:'Request too large.'},413);
 let body;try{body=JSON.parse(raw)}catch{return reply({error:'Check the follow-up fields.'},400)}
 if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Check the follow-up fields.'},400);
 const parsed=parseFollowUp(body);if(parsed.error)return reply({error:parsed.error},400);const v=parsed.value;
 const table={contribution:'contributions',submission:'submissions',interest:'interests'}[v.kind];
 if(!await env.DB!.prepare(`SELECT id FROM ${table} WHERE id=?`).bind(v.id).first())return reply({error:'This inbox item no longer exists.'},404);
 const subject=v.kind+':'+v.id;
 const previous=await env.DB!.prepare('SELECT matched_idea FROM participation_followups WHERE subject=?').bind(subject).first<{matched_idea:string}>();
 // A removed project can be retained as historical context, but cannot become a new match.
 if(v.matchedIdea&&!(await publicIdeas()).some(p=>p.id===v.matchedIdea)&&!(v.state!=='matched'&&previous?.matched_idea===v.matchedIdea))return reply({error:'Choose a project currently approved for the board.'},400);
 const result=await env.DB!.prepare(`INSERT INTO participation_followups(subject,state,owner,notes,matched_idea,updated_at,revision) SELECT ?,?,?,?,?,?,1 WHERE EXISTS(SELECT 1 FROM ${table} WHERE id=?) AND (?=0 OR EXISTS(SELECT 1 FROM participation_followups WHERE subject=?)) ON CONFLICT(subject) DO UPDATE SET state=excluded.state,owner=excluded.owner,notes=excluded.notes,matched_idea=excluded.matched_idea,updated_at=excluded.updated_at,revision=participation_followups.revision+1 WHERE participation_followups.revision=?`).bind(subject,v.state,v.owner,v.notes,v.matchedIdea,Date.now(),v.id,v.revision,subject,v.revision).run();
 if(!result.meta.changes)return reply({error:'This item changed in another view. Refresh the inbox before saving again.'},409);
 return reply({ok:true,message:'Follow-up saved. No message was sent.'});
 }catch{return reply({error:'Could not save follow-up. Please retry.'},503)}
}
