import assert from 'node:assert/strict';
import fs from 'node:fs';
const ideas=JSON.parse(fs.readFileSync('app/ideas.json','utf8'));
const builds=JSON.parse(fs.readFileSync('app/community-builds.json','utf8'));
const originalIds=['soq-coach','benefits-decoder','scam-check','heat-smoke-checkin','skills-bridge','council-agenda','resource-finder','ai-at-work','sacvoice','letterlens','readysac','storypins'];
assert.deepEqual(ideas.slice(0,12).map(i=>i.id),originalIds);
assert.equal(new Set(ideas.map(i=>i.id)).size,14);
assert.deepEqual(builds.map(b=>[b.id,b.url]),[['glass-onion','https://glassonion-sac.netlify.app/'],['mercy-holistic-connect','https://mercy-holistic-connect.replit.app/']]);
for(const build of builds){assert.equal(ideas.filter(i=>i.id===build.id).length,1);assert.equal(ideas.find(i=>i.id===build.id).theme,'Community builds');}
const base='http://127.0.0.1:18766';
const res=await fetch(base+'/api/community');assert.equal(res.status,200);const poll=await res.json();
for(const build of builds)assert.ok(poll.ideas.some(i=>i.id===build.id));
for(const path of ['/','/about','/ideas','/submit','/participate','/resources','/guide','/slides','/room'])assert.equal((await fetch(base+path)).status,200,path);
console.log('PASS: original 12 IDs preserved; 2 unique community builds and correct destinations; both present in public API; all 9 public routes respond.');
