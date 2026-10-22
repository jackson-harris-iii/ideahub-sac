import {redirect} from "next/navigation";
import CommunityPage from "./CommunityPage";
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;const screen=q.screen??q.scren;if(typeof screen==='string'&&/^(auto|[0-4])$/.test(screen))redirect('/room?screen='+screen);return <CommunityPage view="home"/>}
