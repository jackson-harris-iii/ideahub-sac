import {headers} from "next/headers";
import {isAdmin} from "../admin-access";
import {chatGPTSignInPath,chatGPTSignOutPath} from "../chatgpt-auth";
import AdminBoard from "./AdminBoard";
export const dynamic='force-dynamic';
export const metadata={title:'Submission review | Sacramento',robots:{index:false,follow:false}};
export default async function Admin(){const h=await headers();return <main className="admin-page"><a href="/ideas">← Back to the ideas board</a><p className="eyebrow">JACKSON’S REVIEW DESK</p><h1>Community ideas</h1>{isAdmin(h)?<><span hidden data-analytics-owner="true"/><p>Review suggestions before they appear publicly. Votes update as you refresh.</p><a href={chatGPTSignOutPath('/admin')} target="_top">Sign out</a><AdminBoard/></>:<section><h2>Owner sign-in required</h2><p>This page is private. Sign in with the ChatGPT account that owns this site to review submissions.</p><a className="primary" target="_top" href={chatGPTSignInPath('/admin')}>Sign in with ChatGPT</a>{h.get('oai-authenticated-user-id')&&<p>This signed-in account does not have admin access. <a href={chatGPTSignOutPath('/admin')} target="_top">Sign out to switch accounts</a>.</p>}</section>}</main>}
