import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {randomUUID} from 'node:crypto';
const seed=JSON.parse(readFileSync('app/ideas.json','utf8'));
const jsx=(type,props)=>({type,props});
async function check(file,overrides,choose,expected,ok){
 let index=0;const tracked=[];
 const exports={};
 const require=name=>{
  if(name==='react')return {useState:initial=>[Object.hasOwn(overrides,index)?overrides[index++]:(index++,initial),()=>{}],useRef:value=>({current:value}),useId:()=> 'test',useEffect:()=>{}};
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='./analytics')return {trackParticipation:(...args)=>tracked.push(args)};
  if(name==='./ideas.json')return seed;
  if(name==='./community-builds.json')return [];
  if(name==='./project-status')return {defaultProgress:()=>({projectStatus:'idea'})};
  if(name==='./interest-options')return {interestOptions:[['build','Build']]};
  return {};
 };
 const code=ts.transpileModule(readFileSync('app/'+file+'.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(code,{exports,require,crypto:{randomUUID},fetch:async()=>({ok,json:async()=>ok?{ideas:seed,counts:{},myVote:seed[0].id}:{error:'Rejected'}}),FormData:class{*[Symbol.iterator](){yield ['title','Synthetic'];yield ['problem','Synthetic test only'];}},setTimeout,URLSearchParams});
 const tree=exports.default(file==='CommunityPage'?{view:'ideas'}:{}),nodes=[];
 function walk(n){if(!n)return;if(Array.isArray(n)){n.forEach(walk);return}if(typeof n==='object'){nodes.push(n);walk(n.props?.children)}}walk(tree);
 const handler=choose(nodes);assert.ok(handler,file+' handler exists');
 await handler({preventDefault(){},currentTarget:{reset(){}}});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(tracked.length,ok?1:0,file+' success-only tracking');
 if(ok){assert.equal(tracked[0][0],expected);assert.ok(!JSON.stringify(tracked).includes('Synthetic'));}
}
for(const ok of [false,true]){
 await check('IdeaSubmission',{},nodes=>nodes.find(n=>n.type==='form').props.onSubmit,'idea_submitted',ok);
 await check('InterestForm',{2:['build']},nodes=>nodes.find(n=>n.type==='form').props.onSubmit,'interest_signed_up',ok);
 await check('ParticipationWizard',{0:3,1:'resources',3:seed[0].id,8:true,12:true},nodes=>nodes.find(n=>n.type==='button'&&n.props.children==='Send for review →').props.onClick,'contribution_submitted',ok);
 await check('ParticipationWizard',{0:3,1:'idea',8:true,12:true},nodes=>nodes.find(n=>n.type==='button'&&n.props.children==='Send for review →').props.onClick,'idea_submitted',ok);
 await check('CommunityPage',{2:true,4:seed[0]},nodes=>nodes.find(n=>n.type==='button'&&n.props.children==='I’d like to see this built').props.onClick,'vote_cast',ok);
}
console.log('PASS: actual vote, both idea forms, offer wizard and interest signup handlers emit only after successful API responses; rejected requests emit no participation events.');
