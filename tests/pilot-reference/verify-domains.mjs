import assert from 'node:assert/strict';
import {canonicalRedirect} from './lib/canonical-domain.mjs';
for(const host of ['ideahubsac.com','www.ideahubsac.com','www.ideahubsac.org','sacramento-ideas.jacksonthedev.chatgpt.site']){
 const r=canonicalRedirect(new Request(`https://${host}/ideas?idea=storypins&utm_source=reddit`));
 assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://ideahubsac.org/ideas?idea=storypins&utm_source=reddit');
}
for(const host of ['ideahubsac.org','127.0.0.1','example.org'])assert.equal(canonicalRedirect(new Request(`https://${host}/join`)),null);
for(const path of ['/admin','/api/community','/signin-with-chatgpt','/signout-with-chatgpt','/callback'])assert.equal(canonicalRedirect(new Request(`https://sacramento-ideas.jacksonthedev.chatgpt.site${path}`)),null);
assert.equal(canonicalRedirect(new Request('https://sacramento-ideas.jacksonthedev.chatgpt.site/api/community',{method:'POST'})),null);
console.log('PASS: canonical redirects, query/path preservation, no redirect loop, original admin/auth/API preserved.');
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const analytics=readFileSync('public/analytics.js','utf8');
function captures(hostname,pathname='/',doNotTrack='0'){
 const events=[];const memory=new Map();const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
 vm.runInNewContext(analytics,{location:{hostname,host:hostname,pathname,origin:`https://${hostname}`,href:`https://${hostname}${pathname}?utm_source=test&email=private@example.test`},navigator:{doNotTrack},crypto:{randomUUID:()=> 'anonymous-test'},localStorage:storage,sessionStorage:storage,URL,Date,document:{referrer:''},fetch:(_url,init)=>{events.push(JSON.parse(init.body));return Promise.resolve()}});return events;
}
assert.equal(captures('ideahubsac.org').length,1);
assert.equal(captures('ideahubsac.org','/admin').length,0);
assert.equal(captures('ideahubsac.org','/','1').length,0);
assert.equal(captures('127.0.0.1').length,0);
const event=captures('ideahubsac.org')[0];assert.equal(event.properties.utm_source,'test');assert.ok(!JSON.stringify(event).includes('private@example.test'));
console.log('PASS: new-domain analytics, campaign attribution, admin/DNT exclusion and URL privacy.');
