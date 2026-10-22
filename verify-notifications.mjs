import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('app/notifications.ts','utf8').replace('import {env} from "cloudflare:workers";','').replace('import {community} from "./community.config";','');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function run({configured=true,status=200,attempts=0,old=false}={}){
 const job={id:'contribution-test',kind:'resources',attempts,created_at:Date.now()-(old?25*3600000:0),attempted_at:null};const writes=[];let sends=0;
 const database={prepare(sql){return {bind(...values){return {all:async()=>({results:[job]}),run:async()=>{writes.push({sql,values});return {meta:{changes:1}}}}}}}};
 const env={...(configured?{RESEND_API_KEY:'test-key',NOTIFICATION_FROM:'test@example.test',ADMIN_EMAIL:'owner@example.test'}:{}),DB:database};
 const context={exports:{},env,community:{name:'Test board',url:'https://board.example.test'},Date,AbortSignal,Error,fetch:async(url,init)=>{sends++;assert.equal(url,'https://api.resend.com/emails');const b=JSON.parse(init.body);assert.deepEqual(b.to,['owner@example.test']);assert.ok(b.text.includes('/admin'));assert.ok(!b.text.includes('test-key'));assert.equal(init.headers['Idempotency-Key'],'community-contribution-test');return {ok:status===200,status,json:async()=>({id:'provider-id'})}}};vm.runInNewContext(code,context);await context.exports.deliverNotifications();return {sends,writes};
}
assert.equal((await run({configured:false})).sends,0);
let result=await run();assert.equal(result.sends,1);assert.ok(result.writes.some(w=>w.sql.includes("status='accepted'")));
result=await run({status:429});assert.ok(result.writes.some(w=>w.values[0]==='retry'));
result=await run({status:500,attempts:4});assert.ok(result.writes.some(w=>w.values[0]==='needs_review'));
result=await run({old:true,attempts:1});assert.equal(result.sends,0);assert.ok(result.writes.some(w=>w.sql.includes("status='needs_review'")));
console.log('PASS: missing config, private minimal payload, stable idempotency, provider acceptance, retry, attempt cap, expired idempotency window. No real emails sent.');
