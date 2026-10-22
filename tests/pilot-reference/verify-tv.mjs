import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const origin='http://127.0.0.1:18766';
const page=await fetch(origin+'/tv');assert.equal(page.status,200);const html=await page.text();
for(const text of ['SCAN TO JOIN IN','ideahubsac.org/?utm_source=good_day_sacramento','No account needed. Everyone welcome.','/tv-qr.svg'])assert.ok(html.includes(text),text);
const qr=await fetch(origin+'/tv-qr.svg');assert.equal(qr.status,200);assert.match(await qr.text(),/<svg/);
const builds=JSON.parse(await readFile('app/community-builds.json','utf8'));
for(const build of builds){assert.ok(build.previewAlt.length>20);const img=await fetch(origin+build.preview);assert.equal(img.status,200);assert.match(img.headers.get('content-type'),/image\/jpeg/);assert.ok((await img.arrayBuffer()).byteLength>10000);}
const home=await(await fetch(origin)).text();for(const build of builds)assert.ok(home.includes(build.preview));assert.ok(home.includes('href="/tv"'));
console.log('PASS: TV route, viewer link and QR asset; both public screenshots and alt text; homepage previews and TV entry link.');
