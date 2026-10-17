import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {empty,decode,read,commit} from '../dist/diary/store.mjs';
test('real file create, reopen, update backup, conflict and delete',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'diary-test-'));
  const dir={async getFileHandle(name,{create=false}={}){const file=path.join(root,name);if(!create){try{await readFile(file);}catch(e){if(e.code==='ENOENT')e.name='NotFoundError';throw e;}}return {async getFile(){return {text:()=>readFile(file,'utf8')};},async createWritable(){let data;return {async write(value){data=value;},async close(){await writeFile(file,data);},async abort(){}};}};}};
  try{
    assert.equal(await read(dir),null);
    let raw=await commit(dir,null,empty());assert.deepEqual(decode(await read(dir)),empty());
    const entry={id:'one',date:'2026-10-17',title:'오늘',body:'마음에 남은 장면 🌿',mood:'평온',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    const db={schemaVersion:1,entries:[entry]};
    const first=raw;raw=await commit(dir,raw,db);
    assert.equal(await readFile(path.join(root,'diary-db.backup.json'),'utf8'),first);
    assert.equal(decode(await read(dir)).entries[0].body,entry.body);
    await assert.rejects(commit(dir,first,empty()),/다른 창/);assert.equal(await read(dir),raw);
    const changed={...db,entries:[{...entry,body:'수정한 내용'}]};raw=await commit(dir,raw,changed);assert.equal(decode(raw).entries[0].body,'수정한 내용');
    await commit(dir,raw,empty());assert.equal(decode(await read(dir)).entries.length,0);assert.equal(decode(await readFile(path.join(root,'diary-db.backup.json'),'utf8')).entries.length,1);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('corrupt and duplicate data rejected',()=>{
  assert.throws(()=>decode('{'));
  assert.throws(()=>decode('{"schemaVersion":2,"entries":[]}'));
  assert.throws(()=>decode('{"schemaVersion":1,"entries":[{}]}'));
});
