import resources from "./research/resources.json";
import {community} from "./community.config";
const topics:Record<string,string[]>={storypins:["story","stories","history","heritage","recording","archive"],readysac:["emergency","preparedness","evacuation","flood","wildfire"],"heat-smoke-checkin":["heat","smoke","check-in","air quality","cooling"],"resource-finder":["food","pantry","benefit","referral","sms","assistance"]};
export function matchResources(idea:string,text:string){const lower=text.toLowerCase();const ids=new Set([idea,...Object.entries(topics).filter(([,words])=>words.some(w=>lower.includes(w))).map(([id])=>id)]);return resources.filter(r=>r.ideas.some(id=>ids.has(id))).map(r=>r.id)}
export function reportValues(subject:string,idea:string,text:string,trigger:string){return [subject,text,JSON.stringify(matchResources(idea,text)),community.researchVersion,Date.now(),trigger]}
export const reportSql="INSERT INTO research_reports(subject,snapshot,sources,version,created_at,trigger) VALUES(?,?,?,?,?,?) ON CONFLICT(subject) DO UPDATE SET snapshot=excluded.snapshot,sources=excluded.sources,version=excluded.version,created_at=excluded.created_at,trigger=excluded.trigger";
