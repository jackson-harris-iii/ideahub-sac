import {env} from "cloudflare:workers";
// Identity headers are supplied by Sites after authentication, never by client code.
export function isAdmin(headers:Headers){
 // Only enable behind the trusted Sites dispatcher. Other hosts need verified authentication.
 if((env as unknown as {TRUST_SITES_IDENTITY?:string}).TRUST_SITES_IDENTITY!=='true')return false;
 const allowed=(env as unknown as {ADMIN_EMAIL?:string}).ADMIN_EMAIL;
 return Boolean(allowed && headers.get('oai-authenticated-user-id') && headers.get('oai-authenticated-user-email')?.toLowerCase()===allowed.toLowerCase());
}
