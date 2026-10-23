// Call only after the community API confirms success. Never pass form values.
type ParticipationEvent = 'vote_cast' | 'idea_submitted' | 'contribution_submitted' | 'interest_signed_up';
type Properties = {idea_id?:string; contribution_kind?:string; placement?:string; vote_changed?:boolean};
type Track = (event:ParticipationEvent, properties:Properties, once?:string)=>void;
declare global { interface Window { ideaHubTrack?:Track; ideaHubQueue?:Parameters<Track>[] } }
export function trackParticipation(event:ParticipationEvent, properties:Properties, once?:string) {
  try {
    if (typeof window === 'undefined') return;
    if (window.ideaHubTrack) window.ideaHubTrack(event, properties, once);
    else (window.ideaHubQueue ||= []).push([event, properties, once]);
  } catch { /* A blocked analytics request must never break a successful submission. */ }
}
