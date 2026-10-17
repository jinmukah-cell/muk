export const FILE = 'diary-db.json';
export const empty = () => ({schemaVersion:1, entries:[]});
export function decode(raw) {
  const db=JSON.parse(raw);
  if(!db || db.schemaVersion!==1 || !Array.isArray(db.entries)) throw Error('일기 데이터베이스 형식을 확인해 주세요. 원본 파일은 변경하지 않았습니다.');
  const ids=new Set();
  for(const e of db.entries) {
    if(!e || typeof e.id!=='string' || !e.id || ids.has(e.id) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isFinite(Date.parse(e.date)) || !['title','body','mood','createdAt','updatedAt'].every(k=>typeof e[k]==='string') || !Number.isFinite(Date.parse(e.updatedAt)) || !Number.isFinite(Date.parse(e.createdAt))) throw Error('일기 데이터가 손상되어 불러오기를 멈췄습니다. 원본 파일을 보관해 주세요.');
    ids.add(e.id);
  }
  return db;
}
export async function read(dir) {
  try { return await (await (await dir.getFileHandle(FILE)).getFile()).text(); }
  catch(e) { if(e.name==='NotFoundError') return null; throw e; }
}
async function write(dir,name,text) {
  const handle=await dir.getFileHandle(name,{create:true});
  const stream=await handle.createWritable();
  try { await stream.write(text); await stream.close(); }
  catch(e) { try { await stream.abort(); } catch {} throw e; }
}
export async function commit(dir,expected,db) {
  const actual=await read(dir);
  if(actual!==expected) throw Error('다른 창이나 프로그램에서 파일이 변경되었습니다. 현재 글을 TXT로 내려받은 후 폴더를 다시 연결해 주세요.');
  const next=JSON.stringify(db,null,2); decode(next);
  if(actual!==null) await write(dir,'diary-db.backup.json',actual);
  await write(dir,FILE,next);
  return next;
}
