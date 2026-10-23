import {env} from "cloudflare:workers";
import seed from "./ideas.json";
import {defaultProgress,projectStatuses,type ProjectStatus} from "./project-status";
import {emptyProfile} from './project-profile';
export async function publicIdeas(){
 const profiles=await env.DB!.prepare('SELECT idea,maintainer_name,maintainer_url,works_now,help_needed,source_url,maintainer_consent,updated_at FROM project_profiles').all<{idea:string;maintainer_name:string;maintainer_url:string;works_now:string;help_needed:string;source_url:string;maintainer_consent:number;updated_at:number}>();
 const rows=await env.DB!.prepare("SELECT id,title,audience,problem,approach FROM submissions WHERE status='approved' ORDER BY created_at,id").all<{id:string;title:string;audience:string;problem:string;approach:string}>();
 const progress=await env.DB!.prepare("SELECT idea,status,demo_url FROM project_progress").all<{idea:string;status:string;demo_url:string}>();
 return [...seed,...rows.results.map(s=>({id:'submission-'+s.id,title:s.title,theme:'Community ideas',person:s.problem,demo:s.approach||'Explore a small first version with the community.',guardrail:s.audience?'Who it could help: '+s.audience:'Community suggestion · reviewed for the board.'}))].map(idea=>{const saved=progress.results.find(p=>p.idea===idea.id);const profile=profiles.results.find(p=>p.idea===idea.id);return {...idea,...(profile?{maintainerName:profile.maintainer_consent===1?profile.maintainer_name:'',maintainerUrl:profile.maintainer_consent===1?profile.maintainer_url:'',worksNow:profile.works_now,helpNeeded:profile.help_needed,sourceUrl:profile.source_url,profileUpdatedAt:profile.updated_at}:emptyProfile),...(saved&&projectStatuses.includes(saved.status as ProjectStatus)?{projectStatus:saved.status as ProjectStatus,demoUrl:saved.demo_url}:defaultProgress(idea.id))}});
}
