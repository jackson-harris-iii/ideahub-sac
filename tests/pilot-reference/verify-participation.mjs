import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:18766';
const browser=await chromium.launch();
try{
const visitor=await browser.newContext(),owner=await browser.newContext();
await owner.addCookies([{name:'__sites_local_auth',value:'1',url:base}]);
await visitor.request.get(base+'/api/community');
const post=(c,path,data,origin=base)=>c.request.post(base+path,{headers:{origin},data});
const payload={action:'contribute',id:randomUUID(),kind:'resources',idea:'storypins',description:'I can offer microphones and editing help for neighborhood stories.',details:'Available for a Saturday pilot, subject to scheduling.',contact:'private@example.test',consent:true};
assert.equal((await post(visitor,'/api/community',payload,'https://other.example')).status(),403);
assert.equal((await post(visitor,'/api/community',{...payload,consent:false})).status(),400);
assert.equal((await post(visitor,'/api/community',{...payload,contact:'not-email'})).status(),400);
assert.equal((await post(visitor,'/api/community',{...payload,idea:'nonexistent'})).status(),400);
assert.equal((await post(visitor,'/api/community',payload)).status(),201);
assert.equal((await post(visitor,'/api/community',payload)).status(),200);
const other=await browser.newContext();assert.equal((await post(other,'/api/community',payload)).status(),409);
let pub=await(await visitor.request.get(base+'/api/community')).json();assert.ok(!JSON.stringify(pub).includes(payload.description));assert.ok(!JSON.stringify(pub).includes(payload.contact));
let admin=await(await owner.request.get(base+'/api/admin')).json();
assert.equal(admin.contributions.filter(c=>c.id===payload.id).length,1);
let report=admin.reports.find(r=>r.subject==='contribution-'+payload.id);assert.ok(JSON.parse(report.sources).includes('sac-room'));assert.equal(report.trigger,'submission');
assert.equal(admin.notifications.filter(n=>n.id==='contribution-'+payload.id).length,1);assert.equal(admin.emailConfigured,false);
assert.equal((await post(owner,'/api/admin',{type:'contribution',id:payload.id,status:'approved'})).status(),200);
pub=await(await visitor.request.get(base+'/api/community')).json();assert.ok(pub.contributions.some(c=>c.id===payload.id));assert.ok(!JSON.stringify(pub).includes(payload.contact));assert.ok(!JSON.stringify(pub).includes('visitor'));
admin=await(await owner.request.get(base+'/api/admin')).json();report=admin.reports.find(r=>r.subject==='contribution-'+payload.id);assert.equal(report.trigger,'review:approved');
const page=await visitor.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/ideas?idea=storypins');await page.locator('dialog:modal').waitFor();await page.getByText(payload.description,{exact:true}).waitFor();await page.getByRole('link',{name:'Help this idea →'}).click();
await page.getByRole('button',{name:/Offer funding interest/}).click();await page.getByRole('button',{name:'Continue →'}).click();await page.locator('#contribution-idea').waitFor();await page.waitForFunction(()=>document.querySelector('#contribution-idea')?.value==='storypins');
await page.getByLabel('What kind of support could you explore?').fill('I would like to discuss sponsoring a small storytelling pilot.');await page.getByLabel('Availability, conditions or an amount range').fill('Up to $100, subject to discussing a plan.');await page.getByLabel('Email for private follow-up').fill('sponsor@example.test');await page.getByRole('button',{name:'Review contribution →'}).click();assert.equal(await page.getByRole('button',{name:'Send for review →'}).isDisabled(),true);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Send for review →'}).click();await page.getByText('Thanks for being part of this.').waitFor();
for(const kind of ['support','solution','resources']){assert.equal((await post(visitor,'/api/community',{...payload,id:randomUUID(),kind,contact:''})).status(),201)}
assert.equal((await post(visitor,'/api/community',{...payload,id:randomUUID()})).status(),429);
assert.equal((await post(owner,'/api/admin',{type:'contribution',id:payload.id,status:'rejected'})).status(),200);pub=await(await visitor.request.get(base+'/api/community')).json();assert.ok(!pub.contributions.some(c=>c.id===payload.id));
const fresh=await browser.newContext();const newPage=await fresh.newPage();await newPage.goto(base+'/participate');await newPage.getByRole('button',{name:/Share a new idea/}).click();await newPage.getByRole('button',{name:'Continue →'}).click();await newPage.getByLabel('Give your idea a short name').fill('Local story booth');await newPage.getByLabel('What would you like to make easier?').fill('Help neighbors preserve and share their neighborhood history.');await newPage.getByRole('button',{name:'Review contribution →'}).click();await newPage.getByRole('checkbox').check();await newPage.getByRole('button',{name:'Send for review →'}).click();await newPage.getByText('Thanks for being part of this.').waitFor();
await page.goto(base+'/resources');assert.equal(await page.locator('.research-brief').count(),4);assert.equal(await page.locator('.resource-card').count(),21);await page.getByRole('button',{name:'StoryPins',exact:true}).click();assert.equal(await page.locator('.research-brief').count(),1);await page.screenshot({path:'/tmp/community-research.png',fullPage:true});
await page.setViewportSize({width:390,height:844});for(const path of ['/participate','/resources','/ideas']){await page.goto(base+path);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path)}await page.goto(base+'/participate');await page.screenshot({path:'/tmp/community-wizard-mobile.png',fullPage:true});
const adminPage=await owner.newPage();await adminPage.goto(base+'/admin');await adminPage.getByRole('heading',{name:'Community offers & solutions'}).waitFor();await adminPage.getByText('Private contact: sponsor@example.test',{exact:true}).first().waitFor();await adminPage.screenshot({path:'/tmp/community-admin.png',fullPage:true});assert.deepEqual(errors,[]);
console.log('PASS: open wizard, all contribution kinds, funding review, private contact, CSRF, validation, idempotency, ownership, rate limit, moderation, matching triggers, durable outbox, public filtering, research filters, mobile and JavaScript errors.');
}finally{await browser.close()}
