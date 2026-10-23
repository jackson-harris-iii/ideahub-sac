import {validDemoUrl} from './project-status';

export type ProjectProfile = {
 maintainerName:string; maintainerUrl:string; worksNow:string; helpNeeded:string; sourceUrl:string;
 profileUpdatedAt:number|null;
};
export const emptyProfile:ProjectProfile={maintainerName:'',maintainerUrl:'',worksNow:'',helpNeeded:'',sourceUrl:'',profileUpdatedAt:null};
export const profileLimits={maintainerName:100,maintainerUrl:500,worksNow:1000,helpNeeded:600,sourceUrl:500} as const;
export function parseProjectProfile(input:Record<string,unknown>):{value:Omit<ProjectProfile,'profileUpdatedAt'>;error?:never}|{error:string;value?:never}{
 const value={maintainerName:'',maintainerUrl:'',worksNow:'',helpNeeded:'',sourceUrl:''};
 for(const key of Object.keys(profileLimits) as (keyof typeof profileLimits)[]){
  if(typeof input[key]!=='string'||input[key].length>profileLimits[key])return {error:`Check ${key} (maximum ${profileLimits[key]} characters).`};
  value[key]=input[key].trim();
 }
 if(value.maintainerName&&input.maintainerConsent!==true)return {error:'Confirm the maintainer agreed to be named publicly.'};
 if(value.maintainerUrl&&!value.maintainerName)return {error:'Add a confirmed maintainer name before a profile link.'};
 for(const link of [value.maintainerUrl,value.sourceUrl])if(link&&!validDemoUrl(link))return {error:'Public links must use HTTPS and cannot contain usernames or passwords.'};
 return {value};
}
export function profileDate(timestamp:number|null|undefined){return timestamp?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(timestamp):null;}
