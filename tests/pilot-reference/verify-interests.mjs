import assert from 'node:assert/strict';
const base=process.env.TEST_BASE||'http://127.0.0.1:18766';
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('This test writes synthetic data and is restricted to a local preview.');
let cookie='';
async function post(body,origin=base){const r=await fetch(base+'/api/community',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});cookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;return r}
const sample={action:'interest',id:crypto.randomUUID(),name:'Local QA only',email:'local-interest-qa@example.test',interests:['build','office-hours'],note:'Synthetic local test. No real person.',consent:true};
assert.equal((await post(sample,'https://elsewhere.example')).status,403);
assert.equal((await post({...sample,consent:false})).status,400);
assert.equal((await post({...sample,email:'invalid'})).status,400);
assert.equal((await post({...sample,interests:[]})).status,400);
assert.equal((await post({...sample,interests:['unlisted']})).status,400);
assert.equal((await post({...sample,website:'spam.example'})).status,400);
assert.equal((await post({...sample,note:'x'.repeat(601)})).status,400);
assert.equal((await post(sample)).status,201);
assert.equal((await post(sample)).status,200,'Retry is idempotent');
const ownerCookie=cookie;cookie='';assert.equal((await post(sample)).status,409,'Another visitor cannot reuse a saved ID');cookie=ownerCookie;
for(let i=0;i<2;i++)assert.equal((await post({...sample,id:crypto.randomUUID()})).status,201);
assert.equal((await post({...sample,id:crypto.randomUUID()})).status,429,'Local visitor submission cap');
const publicData=await (await fetch(base+'/api/community')).text();
assert.ok(!publicData.includes(sample.email));assert.ok(!publicData.includes(sample.note));assert.ok(!publicData.includes('consent_version'));
assert.equal((await fetch(base+'/api/admin')).status,403);
assert.equal((await fetch(base+'/api/admin',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({type:'interest',id:sample.id,status:'contacted'})})).status,403);
for(const path of ['/','/about','/join','/ideas','/guide','/slides','/room','/tv','/participate'])assert.equal((await fetch(base+path)).status,200,path);
const home=await (await fetch(base)).text();for(const expected of ['/join','/community-mark.svg','/social/linkedin.svg','https://github.com/jackson-harris-iii','https://jacksonthedev.com/learn'])assert.ok(home.includes(expected),expected);
console.log('PASS: validation, consent, origin checks, honeypot, idempotency, cross-visitor collision, rate limit, public privacy, unauthorized admin, preserved routes and key links. Synthetic records exist only in the local test database.');
const login=await fetch(base+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});
const adminCookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
const admin=await fetch(base+'/api/admin',{headers:{Cookie:adminCookie}});assert.equal(admin.status,200,'Configure local ADMIN_EMAIL=seedy@sites.test');
const inbox=await admin.json();assert.ok(inbox.interests.some(i=>i.id===sample.id&&i.email===sample.email&&i.consent_version==='interest-followup-v1'));
async function adminAction(status,origin=base){return fetch(base+'/api/admin',{method:'POST',headers:{Cookie:adminCookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({type:'interest',id:sample.id,status})})}
assert.equal((await adminAction('approved')).status,400,'An interest cannot be approved onto the public board');
assert.equal((await adminAction('contacted','https://elsewhere.example')).status,403);
for(const state of ['contacted','archived','new']){assert.equal((await adminAction(state)).status,200);const current=await (await fetch(base+'/api/admin',{headers:{Cookie:adminCookie}})).json();assert.equal(current.interests.find(i=>i.id===sample.id).status,state)}
assert.equal((await adminAction('delete')).status,200);const deleted=await (await fetch(base+'/api/admin',{headers:{Cookie:adminCookie}})).json();assert.ok(!deleted.interests.some(i=>i.id===sample.id));assert.ok(!deleted.notifications.some(i=>i.id==='interest-'+sample.id));
console.log('PASS: authenticated private inbox, consent record, private-only statuses, admin origin check, persisted contact/archive states and deletion with notification cleanup.');
