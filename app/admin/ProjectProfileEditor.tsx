"use client";
import {useState} from 'react';
import {emptyProfile,profileLimits,type ProjectProfile} from '../project-profile';

export default function ProjectProfileEditor({item,refresh}:{item:{id:string;title:string}&Partial<ProjectProfile>;refresh:()=>Promise<void>}){
 const [fields,setFields]=useState({...emptyProfile,...item});
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
  const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'project-profile',id:item.id,...Object.fromEntries(Object.keys(profileLimits).map(key=>[key,fields[key as keyof typeof profileLimits]])),maintainerConsent:consent})});
  const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error||'Could not save project details.');await refresh();setMessage('Public project details saved.');
 }catch(error){setMessage(error instanceof Error?error.message:'Could not save project details.')}finally{setBusy(false)}}
 const field=(key:keyof typeof profileLimits,label:string,placeholder:string,multiline=false)=>{const id=`profile-${item.id}-${key}`;const props={id,value:fields[key],maxLength:profileLimits[key],placeholder,onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setFields({...fields,[key]:e.target.value})};return <div key={key}><label htmlFor={id}>{label}</label>{multiline?<textarea {...props} rows={3}/>:<input {...props} type={key.endsWith('Url')?'url':'text'}/>}</div>};
 return <details className="profile-editor"><summary>Edit public project details</summary><form onSubmit={save} aria-label={'Project details for '+item.title}><p className="fine-print">Everything below appears publicly. Use only details the maintainer has agreed to share. Leave unknown fields blank; private submission contacts are never copied here.</p>
  {field('maintainerName','Maintainer name or team (optional)','Leave blank until confirmed')}
  {field('maintainerUrl','Public maintainer profile (optional)','https://…')}
  <label className="consent"><input type="checkbox" checked={consent} required={Boolean(fields.maintainerName.trim())} onChange={e=>setConsent(e.target.checked)}/> I have permission to publish this maintainer’s name and profile.</label>
  {field('worksNow','What works now (optional)','Describe what someone can actually try today, including limitations.',true)}
  {field('helpNeeded','Specific help needed (optional)','For example: three residents to try the route and share feedback.',true)}
  {field('sourceUrl','Public source-code link (optional)','https://github.com/…')}
  <button className="primary" disabled={busy}>{busy?'Saving…':'Save project details'}</button><p role="status">{message}</p>
 </form></details>;
}
