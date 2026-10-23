export const followUpStates=['new','contacted','matched','closed'] as const;
export type FollowUpState=typeof followUpStates[number];
export type FollowUpItem={key:string;kind:'contribution'|'submission'|'interest';id:string;title:string;description:string;details:string;contact:string;originalIdea:string;moderation:string;consent:string;createdAt:number;state:FollowUpState;owner:string;notes:string;matchedIdea:string;updatedAt:number|null;revision:number};
export type FollowUpData={items:FollowUpItem[];projects:{id:string;title:string}[];truncated:boolean};
export function parseFollowUp(b:Record<string,unknown>){
 if(!['contribution','submission','interest'].includes(b.kind as string)||typeof b.id!=='string'||!/^[0-9a-f-]{36}$/i.test(b.id))return {error:'Choose an existing inbox item.'} as const;
 if(!followUpStates.includes(b.state as FollowUpState))return {error:'Choose a valid follow-up state.'} as const;
 if(!Number.isSafeInteger(b.revision)||(b.revision as number)<0)return {error:'Refresh this item before saving.'} as const;
 for(const [key,limit] of [['owner',100],['notes',2000],['matchedIdea',150]] as const)if(typeof b[key]!=='string'||b[key].length>limit)return {error:`Check ${key} (maximum ${limit} characters).`} as const;
 const owner=(b.owner as string).trim(),matchedIdea=(b.matchedIdea as string).trim();
 if(!owner)return {error:'Add the person responsible for follow-up.'} as const;
 if(b.state==='matched'&&!matchedIdea)return {error:'Choose a project before marking this item matched.'} as const;
 return {value:{kind:b.kind as FollowUpItem['kind'],id:b.id,state:b.state as FollowUpState,owner,notes:(b.notes as string).trim(),matchedIdea,revision:b.revision as number}} as const;
}
