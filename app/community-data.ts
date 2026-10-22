import {env} from "cloudflare:workers";
import seed from "./ideas.json";
export async function publicIdeas(){
 const rows=await env.DB!.prepare("SELECT id,title,audience,problem,approach FROM submissions WHERE status='approved' ORDER BY created_at,id").all<{id:string;title:string;audience:string;problem:string;approach:string}>();
 return [...seed,...rows.results.map(s=>({id:'submission-'+s.id,title:s.title,theme:'Community ideas',person:s.problem,demo:s.approach||'Explore a small first version with the community.',guardrail:s.audience?'Who it could help: '+s.audience:'Community suggestion · reviewed for the board.'}))];
}
