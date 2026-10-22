import {guideHtml} from "../guide-document";
export async function GET(){return new Response(guideHtml.replace(/<title>.*?<\/title>/, "<title>Presentation slides | Sacramento</title>"),{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"}})}
