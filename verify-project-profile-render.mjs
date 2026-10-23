import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const nodeRequire=createRequire(import.meta.url);
const cache={};
function load(name){
 if(cache[name])return cache[name];const exports={};cache[name]=exports;
 const file=name==='ProjectDetails'?'app/ProjectDetails.tsx':`app/${name}.ts`;
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,URL,Intl,Date,require:p=>p==='./project-profile'?load('project-profile'):p==='./project-status'?load('project-status'):p==='./community-builds.json'?JSON.parse(readFileSync('app/community-builds.json','utf8')):nodeRequire(p)});
 return exports;
}
const {renderToStaticMarkup}=nodeRequire('react-dom/server');
const Details=load('ProjectDetails').default;
const html=renderToStaticMarkup(Details({project:{id:'test & project',maintainerName:'<script>alert(1)</script>',worksNow:'A working <map>',helpNeeded:'Keyboard testing',sourceUrl:'https://example.test/code',profileUpdatedAt:Date.UTC(2026,9,22)}}));
assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Oct 22, 2026'));assert.ok(html.includes('/participate?idea=test%20%26%20project'));assert.ok(html.includes('View source code'));
const empty=renderToStaticMarkup(Details({project:{id:'unknown'}}));assert.ok(empty.includes('Maintainer not yet confirmed'));assert.ok(empty.includes('No working version has been confirmed'));assert.ok(empty.includes('Project details awaiting an update'));assert.ok(!empty.includes('datetime='));
console.log('PASS: escaped project text, explicit unknown states, true update date, source link and encoded project-specific help route.');
