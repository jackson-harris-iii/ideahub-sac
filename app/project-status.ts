import builds from "./community-builds.json";
export const projectStatuses = ['idea', 'building', 'ready'] as const;
export type ProjectStatus = typeof projectStatuses[number];
export const statusLabels: Record<ProjectStatus,string> = {idea:'Idea',building:'Being built',ready:'Ready to try'};
export function defaultProgress(id:string){const build=builds.find(b=>b.id===id);return {projectStatus:(build?'ready':'idea') as ProjectStatus,demoUrl:build?.url||''};}
export function validDemoUrl(value:string){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false}}
