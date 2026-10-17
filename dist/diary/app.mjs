import {empty,decode,read,commit} from './store.mjs';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dir=null,db=empty(),raw=null,id=null,dirty=false,busy=false;
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function notice(s){$('notice').textContent=s;}
function controls(){for(const key of ['save','connect','new','search','month','date','mood','title','body']) $(key).disabled=busy||(key==='save'&&!dir)||(key==='connect'&&!window.showDirectoryPicker);$('delete').disabled=busy||!id;$('list').inert=busy;}
function renderList(){
  $('total').textContent=db.entries.length;
  const q=$('search').value.trim().toLocaleLowerCase(), month=$('month').value;
  const entries=db.entries.filter(e=>(!month||e.date.startsWith(month))&&`${e.title}\n${e.body}`.toLocaleLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt));
  $('list').innerHTML=entries.length?entries.map(e=>`<button type="button" class="entry ${e.id===id?'selected':''}" data-id="${esc(e.id)}" ${e.id===id?'aria-current="true"':''}><small>${esc(e.date.replaceAll('-','.'))} · ${esc(e.mood)}</small><strong>${esc(e.title||'제목 없는 하루')}</strong><p>${esc(e.body.slice(0,90)||'아직 본문이 없어요.')}</p></button>`).join(''):`<p class="empty">${dir?(db.entries.length?'검색한 기록이 없어요.':'첫 번째 하루를 남겨 보세요.'):'폴더를 연결하면<br>보관한 일기가 여기에 나타나요.'}</p>`;
  controls();
}
function changed(){dirty=true;$('status').textContent='아직 저장하지 않은 내용';$('count').textContent=`${Array.from($('body').value).length.toLocaleString()}자 · 공백 포함`;}
function mayLeave(){return !dirty||confirm('아직 저장하지 않은 내용이 있습니다. 저장하지 않고 이동할까요? 필요한 글은 TXT로 먼저 내려받으세요.');}
function openEntry(entry){
  id=entry?.id||null;
  $('date').value=entry?.date||today();$('mood').value=entry?.mood||'평온';
  if(!$('mood').value) $('mood').value='평온';
  $('title').value=entry?.title||'';$('body').value=entry?.body||'';
  dirty=false;$('count').textContent=`${Array.from($('body').value).length.toLocaleString()}자 · 공백 포함`;
  $('status').textContent=entry?'로컬 폴더에 저장된 일기':dir?'새로운 하루를 기록하세요':'폴더를 연결한 뒤 기록하세요';renderList();
}
async function locked(fn){if(!navigator.locks) throw Error('안전한 파일 저장을 지원하는 PC용 Chrome 또는 Edge에서 열어 주세요.');return navigator.locks.request('jinmuk-diary-db',fn);}
$('connect').onclick=async()=>{
  if(busy||!mayLeave()) return;
  if(!window.showDirectoryPicker){notice('이 브라우저에서는 폴더 직접 저장이 지원되지 않습니다. 주소를 PC용 Chrome 또는 Edge에서 열어 주세요.');return;}
  try {
    const candidate=await window.showDirectoryPicker({id:'jinmuk-diary',mode:'readwrite',startIn:'documents'});
    busy=true;controls();
    const loaded=await locked(async()=>{let text=await read(candidate);if(text===null)text=await commit(candidate,null,empty());return {text,data:decode(text)};});
    dir=candidate;raw=loaded.text;db=loaded.data;
    $('folder').textContent=`연결됨 · ${dir.name}`;$('folder-note').textContent='diary-db.json에 저장합니다. 저장 버튼을 누르면 기록과 이전 버전 백업이 갱신됩니다.';
    $('connect').textContent='폴더 다시 연결 ↗';openEntry(null);notice('로컬 데이터베이스를 연결했습니다. 일기를 쓰고 ‘일기 저장’을 눌러 주세요.');
  }catch(e){if(e.name!=='AbortError')notice(`폴더 연결 실패: ${e.message}`);}
  finally{busy=false;controls();}
};
$('editor').onsubmit=async e=>{
  e.preventDefault();if(busy||!dir)return;
  if(!$('title').value.trim()&&!$('body').value.trim()){notice('제목이나 내용을 먼저 적어 주세요.');$('body').focus();return;}
  const now=new Date().toISOString(),prev=db.entries.find(e=>e.id===id);
  const entry={id:id||crypto.randomUUID(),date:$('date').value,mood:$('mood').value,title:$('title').value.trim(),body:$('body').value,createdAt:prev?.createdAt||now,updatedAt:now};
  const next={...db,entries:[...db.entries.filter(e=>e.id!==entry.id),entry]};
  busy=true;controls();
  try {raw=await locked(()=>commit(dir,raw,next));db=next;id=entry.id;
    // Inputs remain editable during disk writes. Only mark saved if they still match the written entry.
    dirty=entry.date!==$('date').value||entry.mood!==$('mood').value||entry.title!==$('title').value.trim()||entry.body!==$('body').value;
    $('status').textContent=dirty?'새 변경 내용 · 저장 필요':`폴더에 저장됨 · ${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}`;
    notice(dirty?'이전 입력을 저장했습니다. 새로 입력한 내용은 다시 저장해 주세요.':'일기를 로컬 폴더에 저장했습니다.');renderList();
  }catch(err){notice(`저장하지 못했습니다: ${err.message} 현재 입력은 화면에 남아 있습니다.`);$('status').textContent='저장 실패 · TXT로 보관하세요';}
  finally{busy=false;controls();}
};
$('delete').onclick=async()=>{
  if(busy||!id||!confirm('이 일기를 삭제할까요? 삭제 직전 데이터는 diary-db.backup.json에 남습니다.'))return;
  busy=true;controls();const next={...db,entries:db.entries.filter(e=>e.id!==id)};
  try{raw=await locked(()=>commit(dir,raw,next));db=next;openEntry(null);notice('일기를 삭제했습니다.');}catch(e){notice(`삭제하지 못했습니다: ${e.message}`);}finally{busy=false;controls();}
};
$('new').onclick=()=>{if(mayLeave()){openEntry(null);notice('');$('title').focus();}};
$('list').onclick=e=>{const button=e.target.closest('[data-id]');if(button&&mayLeave())openEntry(db.entries.find(e=>e.id===button.dataset.id));};
$('search').oninput=renderList;$('month').oninput=renderList;
for(const key of ['date','mood','title','body']) $(key).addEventListener('input',changed);
$('download').onclick=()=>{
  const text=`${$('title').value.trim()||'제목 없는 하루'}\n${$('date').value} · ${$('mood').value}\n\n${$('body').value}`;
  const url=URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`일기-${$('date').value||today()}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notice('현재 글을 TXT로 내려받았습니다. 데이터베이스 저장은 ‘일기 저장’을 눌러 주세요.');
};
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
openEntry(null);
if(!window.showDirectoryPicker){notice('폴더 직접 저장은 PC용 Chrome·Edge에서 지원합니다. 이 주소를 해당 브라우저에서 열어 주세요.');$('connect').disabled=true;}
