import {statusLabels,type ProjectStatus} from './project-status';
export default function ProjectStatusBadge({status}:{status:ProjectStatus}){return <span className={'project-status project-status-'+status}>{statusLabels[status]}</span>}
