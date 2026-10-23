import type {ProjectProfile} from './project-profile';
import {profileDate} from './project-profile';

export default function ProjectDetails({project}:{project:Partial<ProjectProfile>&{id:string;projectStatus?:string}}){
 const date=profileDate(project.profileUpdatedAt);
 return <section className="project-details" aria-label="Project details">
  <div className="project-maintainer"><span className="eyebrow">WHO’S MAINTAINING IT</span><p>{project.maintainerName?<><strong>{project.maintainerName}</strong>{project.maintainerUrl&&<> · <a href={project.maintainerUrl} target="_blank" rel="noopener noreferrer">Public profile ↗</a></>}</>:<>Maintainer not yet confirmed.</>}</p></div>
  <div className="project-details-grid"><div><h3>What works now</h3><p>{project.worksNow||(project.projectStatus==='ready'?'A linked prototype is available. Its current features have not been confirmed on this board yet.':'No working version has been confirmed on this board yet.')}</p></div><div><h3>Help needed</h3><p>{project.helpNeeded||'A specific request has not been posted yet. You can offer feedback, time or skills to help shape the next step.'}</p></div></div>
  <div className="board-actions"><a className="primary" href={'/participate?idea='+encodeURIComponent(project.id)}>Offer help with this project →</a>{project.sourceUrl&&<a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">View source code ↗</a>}</div>
  <p className="fine-print">{date?<>Project details updated <time dateTime={new Date(project.profileUpdatedAt!).toISOString()}>{date}</time>. </>:'Project details awaiting an update. '}Maintainer details are published with permission. A source link does not by itself confirm an open-source license.</p>
 </section>;
}
