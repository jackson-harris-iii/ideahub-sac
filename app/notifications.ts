import {env} from "cloudflare:workers";
import {community} from "./community.config";
type Settings={RESEND_API_KEY?:string;NOTIFICATION_FROM?:string;ADMIN_EMAIL?:string;NOTIFICATION_TO?:string};
export function emailConfigured(){const s=env as unknown as Settings;return Boolean(s.RESEND_API_KEY&&s.NOTIFICATION_FROM&&(s.NOTIFICATION_TO||s.ADMIN_EMAIL))}
// Durable outbox: submission success is independent of provider availability.
export async function deliverNotifications(limit=1,subject?:string){
 if(!emailConfigured())return;
 const s=env as unknown as Settings;
 const rows=await env.DB!.prepare("SELECT id,kind,attempts,created_at,attempted_at FROM notification_outbox WHERE status IN ('pending','retry','sending') AND attempts<5 AND (? IS NULL OR id=?) AND (attempted_at IS NULL OR attempted_at<?) ORDER BY created_at LIMIT ?").bind(subject??null,subject??null,Date.now()-60000,limit).all<{id:string;kind:string;attempts:number;created_at:number;attempted_at:number|null}>();
 for(const row of rows.results){
 // Resend idempotency lasts 24h. Do not automatically retry uncertain old sends.
 if(row.attempts>0&&Date.now()-row.created_at>23*3600000){await env.DB!.prepare("UPDATE notification_outbox SET status='needs_review',error='Delivery uncertain beyond retry window; review manually.' WHERE id=?").bind(row.id).run();continue}
 const claimed=await env.DB!.prepare("UPDATE notification_outbox SET status='sending',attempts=attempts+1,attempted_at=? WHERE id=? AND attempts=? AND (attempted_at IS NULL OR attempted_at<?)").bind(Date.now(),row.id,row.attempts,Date.now()-60000).run();if(!claimed.meta.changes)continue;
 try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${s.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`community-${row.id}`},body:JSON.stringify({from:s.NOTIFICATION_FROM,to:[s.NOTIFICATION_TO||s.ADMIN_EMAIL],subject:`${community.name}: new ${row.kind} to review`,text:`A new ${row.kind} was saved for private review.

Open ${community.url}/admin

No participant contact information is included in this email.`}),signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error(`Email provider returned ${r.status}.`);const body=await r.json() as {id?:string};if(!body.id)throw Error('Email provider did not confirm acceptance.');await env.DB!.prepare("UPDATE notification_outbox SET status='accepted',provider_id=?,error=NULL WHERE id=?").bind(body.id,row.id).run()}catch(e){await env.DB!.prepare("UPDATE notification_outbox SET status=?,error=? WHERE id=?").bind(row.attempts>=4?'needs_review':'retry',e instanceof Error?e.message:'Delivery failed.',row.id).run()}
 }
}
