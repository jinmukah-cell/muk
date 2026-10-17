import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as model from '../dist/model.mjs';

// A deliberately small DOM/storage stand-in tests data-loss paths independently
// of the browser. These checks do not substitute for visual/browser QA.
const source=(await readFile(new URL('../dist/app.mjs',import.meta.url),'utf8')).replace(/^import[^\n]*\n/,'');
function session(storage=new Map(),faults={}){
  const mainHandlers={},windowHandlers={},documentHandlers={},nodes=new Map();
  const node=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){}},focus(){},scrollIntoView(){},addEventListener(name,handler){if(selector==='#main')mainHandlers[name]=handler;}});
    return nodes.get(selector);
  };
  const localStorage={
    getItem(key){if(faults.read)throw new Error('storage disabled');return storage.get(key)??null;},
    setItem(key,value){if(faults.write)throw new Error('quota exceeded');storage.set(key,value);},
    removeItem(key){if(faults.write)throw new Error('storage disabled');storage.delete(key);},
  };
  const sandbox={...model,localStorage,location:{hash:'#/writing'},document:{querySelector:node,addEventListener(name,handler){documentHandlers[name]=handler;},visibilityState:'visible'},window:{addEventListener(name,handler){windowHandlers[name]=handler;},scrollTo(){}},setTimeout(){return 1;},clearTimeout(){},console};
  vm.createContext(sandbox);
  vm.runInContext(`${source}\n;this.testHooks={save,getDraft:()=>draft,getBlocked:()=>blocked,getDirty:()=>dirty};`,sandbox);
  return {
    storage,faults,nodes,hooks:sandbox.testHooks,
    input(key,value){mainHandlers.input({target:{dataset:{field:key},value}});},
    flush(){sandbox.testHooks.save();},
    external(raw){if(raw===null)storage.delete(model.KEY);else storage.set(model.KEY,raw);windowHandlers.storage({key:model.KEY,newValue:raw});},
    async action(name){await mainHandlers.click({target:{closest:()=>({dataset:{action:name}})}});},
    hide(){documentHandlers.visibilitychange();},
    snapshot(){return JSON.parse(JSON.stringify(sandbox.testHooks.getDraft()));},
  };
}

test('자동 저장과 새 세션 복원은 한글 답변 및 직접 편집 내용을 유지',()=>{
  const s=session();s.input('topic','기다려 주는 수업');s.input('title','교실의 여백');s.flush();
  const restored=session(s.storage);assert.equal(restored.snapshot().answers.topic,'기다려 주는 수업');assert.equal(restored.snapshot().title,'교실의 여백');
  restored.input('finalText','직접 다듬은 문장');restored.flush();assert.equal(session(s.storage).snapshot().finalText,'직접 다듬은 문장');
});
test('손상 데이터는 자동으로 덮어쓰거나 삭제하지 않음',()=>{
  const storage=new Map([[model.KEY,'broken original']]);const s=session(storage);
  s.input('topic','새 생각');s.flush();assert.equal(s.hooks.getBlocked(),'corrupt');assert.equal(storage.get(model.KEY),'broken original');assert.equal(s.snapshot().answers.topic,'새 생각');
});
test('저장 공간 부족에도 현재 입력을 유지하고 성공 상태를 표시하지 않음',()=>{
  const s=session(new Map(),{write:true});s.input('topic','잃으면 안 되는 글');s.flush();
  assert.equal(s.snapshot().answers.topic,'잃으면 안 되는 글');assert.equal(s.hooks.getBlocked(),'unavailable');assert.equal(s.hooks.getDirty(),true);assert.ok(s.nodes.get('#save-label').textContent.includes('저장되지 않음'));
});
test('다른 탭 저장 이벤트를 받으면 현재 글과 다른 탭 글을 모두 보존',()=>{
  const s=session();s.input('topic','내 탭의 글');const other={...model.fresh(),title:'다른 탭'};const raw=JSON.stringify(other);s.external(raw);s.flush();
  assert.equal(s.hooks.getBlocked(),'conflict');assert.equal(s.snapshot().answers.topic,'내 탭의 글');assert.equal(s.storage.get(model.KEY),raw);
});
test('storage 이벤트 전이라도 저장 직전 충돌을 감지',()=>{
  const s=session();s.input('topic','첫 탭');const raw=JSON.stringify({...model.fresh(),title:'둘째 탭'});s.storage.set(model.KEY,raw);s.flush();
  assert.equal(s.hooks.getBlocked(),'conflict');assert.equal(s.storage.get(model.KEY),raw);
});
test('저장 재시도 시 외부 변경을 덮어쓰지 않고 충돌로 전환',async()=>{
  const s=session(new Map(),{read:true});assert.equal(s.hooks.getBlocked(),'unavailable');
  s.input('topic','내 글');s.faults.read=false;const raw=JSON.stringify({...model.fresh(),title:'다른 글'});s.storage.set(model.KEY,raw);await s.action('retry');
  assert.equal(s.hooks.getBlocked(),'conflict');assert.equal(s.storage.get(model.KEY),raw);
});
