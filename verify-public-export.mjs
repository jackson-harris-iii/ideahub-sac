import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {canonicalRedirect} from './lib/canonical-domain.mjs';
const manifest=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8'));
assert.equal(manifest.project_id,undefined,'No production Site identity');
for(const url of ['https://another-community.example/ideas','https://ideahubsac.com/ideas?idea=storypins','https://www.ideahubsac.org/admin'])assert.equal(canonicalRedirect(new Request(url)),null,'A fork must never redirect to the pilot');
const source=fs.readFileSync('app/admin-access.ts','utf8').replace('import {env} from "cloudflare:workers";','');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const headers=new Headers({'oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'owner@example.test'});
function authorized(env,h=headers){const context={exports:{},env};vm.runInNewContext(code,context);return context.exports.isAdmin(h);}
assert.equal(authorized({ADMIN_EMAIL:'owner@example.test'}),false,'Identity trust must be explicit');
assert.equal(authorized({ADMIN_EMAIL:'owner@example.test',TRUST_SITES_IDENTITY:'true'}),true);
assert.equal(authorized({ADMIN_EMAIL:'someone-else@example.test',TRUST_SITES_IDENTITY:'true'}),false);
assert.equal(authorized({ADMIN_EMAIL:'owner@example.test',TRUST_SITES_IDENTITY:'true'},new Headers()),false);
const analytics=fs.readFileSync('public/analytics.js','utf8');assert.ok(!analytics.includes('fetch(')&&!analytics.includes('phc_'),'No live analytics');
for(const name of ['0000_magenta_power_pack.sql','0001_serious_crystal.sql','0002_noisy_madame_web.sql'])assert.ok(fs.existsSync('drizzle/'+name),name);
console.log('PASS: no production Site binding; forks do not redirect; admin fails closed without trust or matching identity; analytics disabled; all migrations included.');
