import { env } from "cloudflare:workers";
import {interestOptions} from "../../interest-options";
import {publicIdeas} from "../../community-data";
import {reportValues} from "../../research-match";
import {deliverNotifications} from "../../notifications";
export const dynamic="force-dynamic";

const validId=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function visitor(req:Request){const value=req.headers.get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith("sac_visitor="))?.slice(12);return validId(value)?value:crypto.randomUUID()}
function reply(req:Request,id:string,body:unknown,status=200){return Response.json(body,{status,headers:{"Cache-Control":"no-store","Vary":"Cookie","Set-Cookie":`sac_visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(req.url).protocol==='https:'?'; Secure':''}`}})}
async function totals(id:string){const counts=await env.DB!.prepare("SELECT idea, COUNT(*) AS count FROM votes GROUP BY idea").all<{idea:string,count:number}>();const vote=await env.DB!.prepare("SELECT idea FROM votes WHERE visitor=?").bind(id).first<{idea:string}>();const ideas=await publicIdeas();const ids=new Set(ideas.map(i=>i.id));const offers=await env.DB!.prepare("SELECT id,idea,kind,description,details FROM contributions WHERE status='approved' ORDER BY created_at DESC LIMIT 200").all();return {contributions:offers.results.filter(x=>ids.has(x.idea as string)),ideas,counts:Object.fromEntries(counts.results.filter(x=>ids.has(x.idea)).map(x=>[x.idea,x.count])),myVote:vote&&ids.has(vote.idea)?vote.idea:null}}
export async function GET(req:Request){const id=visitor(req);try{return reply(req,id,await totals(id))}catch{return reply(req,id,{error:"Votes are temporarily unavailable. Please try again shortly."},503)}}
export async function POST(req:Request){const id=visitor(req);const fail=(error:string,status=400)=>reply(req,id,{error},status);if(req.headers.get('origin')!==new URL(req.url).origin)return fail("Please submit from this website.",403);if(!req.headers.get('content-type')?.startsWith('application/json'))return fail('Please use the form on this page.',415);if(Number(req.headers.get('content-length')||0)>10000)return fail('That submission is too long.',413);
try{const raw=await req.text();if(raw.length>10000)return fail('That submission is too long.',413);let b;try{b=JSON.parse(raw)}catch{return fail('Please check your submission.')}if(!b||typeof b!=='object'||Array.isArray(b))return fail('Please check your submission.');if(b.website)return fail('Please leave the website field blank.');
if(b.action==='interest'){
 if(!validId(b.id))return fail('Please refresh and try again.');
 for(const [key,min,max] of [['name',0,100],['email',3,200],['note',0,600]] as const){if(typeof b[key]!=='string'||b[key].trim().length<min||b[key].trim().length>max)return fail(`Please check the ${key} field.`)}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim()))return fail('Please enter a valid email.');
 if(!Array.isArray(b.interests)||b.interests.length<1||b.interests.length>interestOptions.length||!b.interests.every((x:unknown)=>interestOptions.some(([key])=>key===x)))return fail('Choose at least one of the listed interests.');
 if(b.consent!==true)return fail('Please confirm that Jackson may contact you about your interests.');
 const existing=await env.DB!.prepare('SELECT visitor FROM interests WHERE id=?').bind(b.id).first<{visitor:string}>();if(existing)return existing.visitor===id?reply(req,id,{ok:true}):fail('Please refresh and try again.',409);
 const now=Date.now(),subject='interest-'+b.id;
 const result=await env.DB!.batch([
 env.DB!.prepare("INSERT INTO interests(id,visitor,name,email,interests,note,consent_version,created_at,status) SELECT ?,?,?,?,?,?,?,?,'new' WHERE (SELECT COUNT(*) FROM interests WHERE visitor=? AND created_at>?)<3 ON CONFLICT(id) DO NOTHING").bind(b.id,id,b.name.trim(),b.email.trim(),JSON.stringify([...new Set(b.interests)]),b.note.trim(),'interest-followup-v1',now,id,now-3600000),
 env.DB!.prepare("INSERT INTO notification_outbox(id,kind,created_at) SELECT ?,'interest',? WHERE EXISTS(SELECT 1 FROM interests WHERE id=? AND visitor=?) ON CONFLICT(id) DO NOTHING").bind(subject,now,b.id,id)
 ]);
 if(!result[0].meta.changes){const saved=await env.DB!.prepare('SELECT visitor FROM interests WHERE id=?').bind(b.id).first<{visitor:string}>();if(saved?.visitor!==id)return fail('Your earlier interests are saved. Please wait an hour before sending more.',429)}
 try{await deliverNotifications()}catch{/* The private interest and notification remain saved. */}
 return reply(req,id,{ok:true},201)
}
if(b.action==='vote'){if(!(await publicIdeas()).some(i=>i.id===b.idea))return fail('Please choose an idea from the list.');await env.DB!.prepare("INSERT INTO votes(visitor,idea,updated_at) VALUES(?,?,?) ON CONFLICT(visitor) DO UPDATE SET idea=excluded.idea, updated_at=excluded.updated_at").bind(id,b.idea,Date.now()).run();return reply(req,id,await totals(id))}
if(b.action==='submit'){if(!validId(b.id))return fail('Please refresh and try again.');const fields=[['title',5,100],['audience',0,160],['problem',15,1200],['approach',0,1200]] as const;for(const [key,min,max] of fields){if(typeof b[key]!=='string'||b[key].trim().length<min||b[key].trim().length>max)return fail(`Please check the ${key} field (${min}–${max} characters).`)}
const existing=await env.DB!.prepare('SELECT visitor FROM submissions WHERE id=?').bind(b.id).first<{visitor:string}>();if(existing)return existing.visitor===id?reply(req,id,{ok:true}):fail('Please refresh and try again.',409);
const now=Date.now();const subject='idea-'+b.id;
const result=await env.DB!.batch([
 env.DB!.prepare("INSERT INTO submissions(id,visitor,title,audience,problem,approach,created_at,status) SELECT ?,?,?,?,?,?,?, 'pending' WHERE (SELECT COUNT(*) FROM submissions WHERE visitor=? AND created_at>?) < 3 ON CONFLICT(id) DO NOTHING").bind(b.id,id,b.title.trim(),b.audience.trim(),b.problem.trim(),b.approach.trim(),now,id,now-3600000),
 env.DB!.prepare("INSERT INTO research_reports(subject,snapshot,sources,version,created_at,trigger) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND visitor=?) ON CONFLICT(subject) DO NOTHING").bind(...reportValues(subject,'',b.title+' '+b.problem+' '+b.approach,'submission'),b.id,id),
 env.DB!.prepare("INSERT INTO notification_outbox(id,kind,created_at) SELECT ?,'idea',? WHERE EXISTS(SELECT 1 FROM submissions WHERE id=? AND visitor=?) ON CONFLICT(id) DO NOTHING").bind(subject,now,b.id,id)
]);if(!result[0].meta.changes){const saved=await env.DB!.prepare('SELECT visitor FROM submissions WHERE id=?').bind(b.id).first<{visitor:string}>();if(saved?.visitor!==id)return fail('Thanks for sharing ideas! Please wait an hour before sending more.',429)}
try{await deliverNotifications()}catch{/* Saved outbox remains available for retry. */}return reply(req,id,{ok:true},201)}
if(b.action==='contribute'){
 if(!validId(b.id)||!['support','solution','resources','funding'].includes(b.kind))return fail('Please choose how you would like to help.');
 if(!(await publicIdeas()).some(i=>i.id===b.idea))return fail('Please choose a current public idea.');
 for(const [key,min,max] of [['description',15,1200],['details',0,600],['contact',0,200]] as const){if(typeof b[key]!=='string'||b[key].trim().length<min||b[key].trim().length>max)return fail(`Please check the ${key} field (${min}–${max} characters).`)}
 if(b.contact&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact.trim()))return fail('Please enter a valid email or leave contact blank.');
 if(b.consent!==true)return fail('Please confirm that your contribution can be reviewed for publication.');
 const existing=await env.DB!.prepare('SELECT visitor FROM contributions WHERE id=?').bind(b.id).first<{visitor:string}>();if(existing)return existing.visitor===id?reply(req,id,{ok:true}):fail('Please refresh and try again.',409);
 const now=Date.now(),subject='contribution-'+b.id;
 const result=await env.DB!.batch([
 env.DB!.prepare("INSERT INTO contributions(id,visitor,idea,kind,description,details,contact,created_at,status) SELECT ?,?,?,?,?,?,?,?,'pending' WHERE (SELECT COUNT(*) FROM contributions WHERE visitor=? AND created_at>?)<5 ON CONFLICT(id) DO NOTHING").bind(b.id,id,b.idea,b.kind,b.description.trim(),b.details.trim(),b.contact.trim(),now,id,now-3600000),
 env.DB!.prepare("INSERT INTO research_reports(subject,snapshot,sources,version,created_at,trigger) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM contributions WHERE id=? AND visitor=?) ON CONFLICT(subject) DO NOTHING").bind(...reportValues(subject,b.idea,b.description+' '+b.details,'submission'),b.id,id),
 env.DB!.prepare("INSERT INTO notification_outbox(id,kind,created_at) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM contributions WHERE id=? AND visitor=?) ON CONFLICT(id) DO NOTHING").bind(subject,b.kind,now,b.id,id)
 ]);
 if(!result[0].meta.changes){const saved=await env.DB!.prepare('SELECT visitor FROM contributions WHERE id=?').bind(b.id).first<{visitor:string}>();if(saved?.visitor!==id)return fail('Thanks for participating! Please wait an hour before sending more.',429)}
 try{await deliverNotifications()}catch{/* Retry privately; never lose the submission. */}return reply(req,id,{ok:true},201)
}return fail('Unknown action.');
}catch{return fail('We could not save that yet. Please try again.',503)}}
