import {KEY,questions,programs,fresh,decode,compile,wordCount,fileName,exportText} from './model.mjs';

const main=document.querySelector('#main');
let draft=fresh(), lastRaw=null, blocked='', dirty=false, timer, toastTimer, savingLabel='이 브라우저에 자동 저장', composing=false;
try { lastRaw=localStorage.getItem(KEY); if(lastRaw!==null) draft=decode(lastRaw); }
catch(error) { blocked=lastRaw!==null?'corrupt':'unavailable'; }

const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const isWriting=()=>location.hash.startsWith('#/writing');
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4200);}
function confirmAction(title,message,accept='계속하기'){
  const dialog=document.querySelector('#confirm-dialog');
  document.querySelector('#dialog-title').textContent=title;
  document.querySelector('#dialog-message').textContent=message;
  document.querySelector('#dialog-accept').textContent=accept;
  dialog.returnValue='cancel';dialog.showModal();
  return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
}
function status(){
  const label=blocked==='conflict'?'다른 탭 변경 · 저장 일시 중지':blocked==='corrupt'?'저장된 글 확인 필요':blocked==='unavailable'?'이 브라우저에 저장되지 않음':savingLabel;
  const el=document.querySelector('#save-label');if(el)el.textContent=label;
}
function warning(){
  if(!blocked)return '';
  const info={
    conflict:['다른 곳에서 이 글이 변경되었어요.','현재 입력은 이 화면에 남아 있어요. 먼저 현재 글을 내려받은 뒤, 저장된 글을 불러오거나 현재 내용으로 저장해 주세요.'],
    corrupt:['저장된 글을 불러올 수 없어요.','저장 데이터의 형식이 올바르지 않아 자동 저장을 멈췄어요. 원본은 아직 지우지 않았어요. 필요한 내용을 내려받은 뒤 초기화할 수 있어요.'],
    unavailable:['자동 저장을 사용할 수 없어요.','브라우저가 저장을 허용하지 않거나 저장 공간이 부족해요. 작성은 계속할 수 있지만, 창을 닫기 전에 글을 내려받아 주세요.'],
  }[blocked];
  return `<section class="warning-panel" aria-labelledby="warning-title"><h2 id="warning-title">${info[0]}</h2><p>${info[1]}</p><div class="button-group"><button class="button primary" data-action="download">현재 글 내려받기 ↓</button>${blocked==='conflict'?'<button class="button ghost" data-action="reload">저장된 글 불러오기</button><button class="button ghost" data-action="overwrite">현재 글로 저장</button>':blocked==='corrupt'?'<button class="button ghost" data-action="reset">저장 내용 초기화</button>':'<button class="button ghost" data-action="retry">저장 다시 시도</button>'}</div></section>`;
}
function updateWarning(){const area=document.querySelector('#warning');if(area)area.innerHTML=warning();status();}
function save(){
  clearTimeout(timer);
  if(!dirty || blocked){status();return;}
  try{
    const current=localStorage.getItem(KEY);
    if(current!==lastRaw){blocked='conflict';updateWarning();return;}
    const value={...draft,updatedAt:new Date().toISOString()};
    const raw=JSON.stringify(value);localStorage.setItem(KEY,raw);draft=value;lastRaw=raw;dirty=false;
    savingLabel=`저장됨 · ${new Date(value.updatedAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}`;
  }catch{blocked='unavailable';updateWarning();}
  status();
}
function scheduleSave(){dirty=true;savingLabel='저장 중…';status();clearTimeout(timer);timer=setTimeout(save,350);}
function home(){
  document.title='임진묵 교사의 도구함';
  main.innerHTML=`<div class="wrap"><section class="hero" aria-labelledby="home-heading"><div class="hero-top"><span class="eyebrow">SMALL TOOLS, MEANINGFUL DAYS</span><span class="issue">작은 도구 모음집 · 01</span></div><h1 id="home-heading">가르치는 일에 여유를,<br>생각하는 일에 <em>즐거움을.</em></h1><div class="hero-bottom"><p class="hero-description">수업과 일상에 필요한 도구를 하나씩 만듭니다.<br>임진묵 교사가 만들고, <strong>동료 선생님들과 나누는 작은 도구함.</strong></p><div class="button-group"><a class="button primary" href="#/writing">글쓰기 시작하기 <span aria-hidden="true">↗</span></a><a class="button ghost" href="#/about">도구함 이야기</a></div></div></section><div class="intro-rule"></div><section id="tools" aria-labelledby="tools-heading"><div class="section-heading"><h2 id="tools-heading">오늘 꺼내 쓸 도구 <span class="small-note">(${String(programs.length).padStart(2,'0')})</span></h2><span class="small-note">설치 없이, 가볍게 시작하세요.</span></div><div class="tools-grid"><div class="tool-list">${programs.map((p,i)=>`<article class="tool-card"><div class="tool-card-top"><span class="category">${esc(p.category||'교사를 위한 도구')}</span><span class="tool-number">${String(i+1).padStart(2,'0')}</span></div>${p.id==='writing'?`<div class="writing-art" aria-hidden="true"><div class="paper-art"><small>A LITTLE THOUGHT</small><p>작은 생각이 모여<br>하나의 글이 됩니다.</p><div class="paper-line"></div><div class="paper-line"></div><div class="paper-line short"></div></div><div class="art-caption">질문을 따라, 한 문장씩 ↗</div></div>`:''}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="tool-actions"><a class="button primary" href="${esc(p.path)}">${p.id==='writing'?'글쓰기 시작하기':'도구 열기'} <span aria-hidden="true">↗</span></a><span class="tool-meta">${p.id==='writing'?'다섯 질문 · 자동 저장 · 파일 보관':'브라우저에서 바로 시작'}</span></div></article>`).join('')}</div><aside class="note-card" aria-labelledby="note-heading"><div><span class="eyebrow">A NOTE FROM JINMUK</span><div class="asterisk" aria-hidden="true">✳</div><h2 id="note-heading">좋은 도구는<br>생각할 시간을<br>돌려준다고 믿어요.</h2><p>조금 덜 번거롭게, 조금 더 나답게.<br>교실에서 시작된 작은 아이디어들을<br>이곳에 차곡차곡 담아갑니다.</p></div><div class="note-signature">교사 임진묵</div></aside></div></section><section class="principles" aria-label="도구함의 세 가지 약속"><div class="principle"><span class="principle-num">01</span><div><h3>문턱 없이 시작해요</h3><p>설치나 회원가입 없이,<br>브라우저에서 바로 사용하세요.</p></div></div><div class="principle"><span class="principle-num">02</span><div><h3>내 글은 내 곁에</h3><p>작성한 글은 서버로 보내지 않고<br>브라우저 또는 선택한 로컬 폴더에 보관해요.</p></div></div><div class="principle"><span class="principle-num">03</span><div><h3>하나씩, 함께 쌓아가요</h3><p>필요에서 시작한 도구들을<br>동료 선생님들과 나눕니다.</p></div></div></section></div>`;
}
function about(){
  document.title='도구함 소개 · 임진묵';
  main.innerHTML=`<section class="about wrap"><span class="eyebrow">ABOUT THE TOOLBOX</span><h1>교실에서 떠올린 생각을,<br>일상에 쓰이는 도구로.</h1><p>안녕하세요. 교사 임진묵입니다. 수업을 준비하고, 생각을 기록하며 느꼈던 작은 불편에서 이 도구함을 시작했습니다. 앞으로 만드는 프로그램들을 이곳에서 동료 선생님들과 나누려 합니다.</p><p>첫 도구는 ‘생각을 잇는 글쓰기’입니다. 다섯 가지 질문에 답하고, 답변을 모아 직접 글을 다듬을 수 있습니다. AI가 대신 쓰지 않아요. 선생님의 생각이 선생님의 문장으로 이어지도록 돕습니다.</p><p>글은 사용하는 브라우저에만 저장됩니다. 다른 기기에서는 이어지지 않으며, 브라우저 데이터를 지우면 사라집니다. 중요한 글은 텍스트 파일로 내려받아 보관해 주세요. 공용 PC에서는 사용 후 ‘새 글 쓰기’로 저장 내용을 삭제해 주세요.</p><p>누구나 주소로 접속할 수 있는 도구함입니다. 학생의 실명이나 성적·상담 내용 등 민감한 정보는 입력하지 말아 주세요.</p><div class="button-group"><a class="button primary" href="#/writing">글쓰기 시작하기 ↗</a><a class="button ghost" href="#/">도구함으로 돌아가기</a></div></section>`;
}
function writing(focus=false){
  document.title='생각을 잇는 글쓰기 · 임진묵의 도구함';
  const step=draft.currentStep,final=step===5,q=questions[step];
  if(final&&!draft.finalTextInitialized){draft.finalText=compile(draft);draft.finalTextInitialized=true;draft.compiledRevision=draft.answersRevision;scheduleSave();}
  const completed=questions.filter(item=>draft.answers[item.key].trim()).length;
  main.innerHTML=`<div class="wrap studio"><div class="studio-top"><div class="breadcrumb"><a href="#/">← 도구함</a><span>/</span><strong>생각을 잇는 글쓰기</strong></div><div class="save-state" role="status" aria-live="polite"><span class="tiny-dot" aria-hidden="true"></span><span id="save-label"></span></div></div><div class="studio-heading"><div><h1>생각을 잇는 글쓰기</h1><p>다섯 가지 질문을 따라, 나만의 문장을 발견하세요.</p></div><button class="text-button" data-action="reset">새 글 쓰기 ↗</button></div><div id="warning">${warning()}</div><div class="studio-grid"><aside><nav aria-label="글쓰기 단계"><ol class="steps">${[...questions,{name:'글 모아보기'}].map((item,i)=>`<li><button class="step-button ${step===i?'active':''} ${i<5&&draft.answers[questions[i].key].trim()?'done':''}" data-step="${i}" ${step===i?'aria-current="step"':''}><span class="step-index" aria-hidden="true">${i<5&&draft.answers[questions[i].key].trim()&&step!==i?'✓':i===5?'↗':String(i+1).padStart(2,'0')}</span>${item.name}</button></li>`).join('')}</ol></nav><div class="sidebar-note"><strong>서두르지 않아도 괜찮아요.</strong>순서대로 답하지 않아도,<br>모든 칸을 채우지 않아도 돼요.<br>지금 떠오르는 것부터 써 보세요.<br><br><span id="completion">${completed} / 5개의 생각을 담았어요.</span></div></aside><section aria-labelledby="question-heading"><div class="editor-card"><div class="editor-meta"><span>${final?'YOUR WORDS, YOUR STORY':`STEP ${String(step+1).padStart(2,'0')} / 05`}</span><div class="progress-track" aria-label="${final?'글 모아보기':`5단계 중 ${step+1}단계`}">${questions.map((_,i)=>`<span class="${i<=step?'filled':''}"></span>`).join('')}</div></div>${final?finalEditor():`<h2 class="question-heading" id="question-heading" tabindex="-1">${esc(q.title).replace('\n','<br>')}</h2><p class="question-hint">${esc(q.hint)}</p>${step===0?titleInput():''}<label class="input-label" for="answer">나의 ${q.name}<span class="optional">편하게 적어 주세요 · 선택</span></label><textarea class="answer-input" id="answer" data-field="${q.key}" placeholder="${esc(q.placeholder)}">${esc(draft.answers[q.key])}</textarea><div class="input-bottom"><span>짧은 메모로 시작해도 좋아요.</span><span id="char-count">${wordCount(draft.answers[q.key])}자 · 공백 포함</span></div><p class="writing-tip"><span aria-hidden="true">i</span><span>${esc(q.tip)}</span></p><div class="editor-actions">${step===0?'<a class="button ghost" href="#/">← 도구함</a>':`<button class="button ghost" data-step="${step-1}">← 이전 질문</button>`}<button class="button primary" data-step="${step+1}">${step===4?'글 모아보기':'다음 질문'} <span aria-hidden="true">→</span></button></div><p class="step-hint">아직 떠오르지 않으면 다음 질문으로 넘어가도 괜찮아요.</p>`}</div><p class="privacy-note">내 글은 이 브라우저에만 저장돼요. 중요한 글은 파일로 내려받아 보관하세요.<br>공용 PC에서는 사용 후 ‘새 글 쓰기’로 저장 내용을 삭제해 주세요.</p></section></div></div>`;
  status();if(focus){document.querySelector('#question-heading')?.focus({preventScroll:true});document.querySelector('.editor-card')?.scrollIntoView({block:'nearest',behavior:'instant'});}
}
function titleInput(){return `<label class="input-label" for="title">글 제목<span class="optional">나중에 정해도 괜찮아요</span></label><input class="title-input" id="title" data-field="title" value="${esc(draft.title)}" placeholder="이 글에 이름을 붙여 주세요">`;}
function finalEditor(){return `<h2 class="question-heading final-heading" id="question-heading" tabindex="-1">생각이 모여,<br>한 편의 글이 되었어요.</h2><p class="question-hint">이제 선생님의 말투로 다듬어 보세요. 문장 사이를 잇거나 순서를 바꿔도 좋아요.</p>${draft.answers.audience.trim()?`<div class="audience-note"><strong>이 글을 전할 사람</strong><br>${esc(draft.answers.audience)}</div>`:''}<div class="final-toolbar"><button class="text-button" data-action="recompile">답변으로 다시 모으기 ↻${draft.answersRevision!==draft.compiledRevision?' · 답변이 바뀌었어요':''}</button><div class="button-group"><button class="button ghost" data-action="copy">글 복사</button><button class="button primary" data-action="download">내려받기 ↓</button></div></div>${titleInput()}<label class="input-label" for="final-text">나의 글<span class="optional">자유롭게 편집하세요</span></label><textarea class="answer-input final-area" id="final-text" data-field="finalText" placeholder="아직 모인 생각이 없어요. 질문에 답하거나 여기에 바로 글을 써 보세요.">${esc(draft.finalText)}</textarea><div class="input-bottom"><span>답변을 순서대로 모았어요. 문장은 직접 다듬어 주세요.</span><span id="char-count">${wordCount(draft.finalText)}자 · 공백 포함</span></div><div class="editor-actions"><button class="button ghost" data-step="4">← 질문으로 돌아가기</button><a class="button ghost" href="#/">도구함으로 →</a></div><p class="step-hint">TXT 파일에는 제목과 완성 글이 담겨요. 질문별 작성 상태는 포함되지 않아요.</p>`;}
function route(){save();if(isWriting())writing();else if(location.hash==='#/about')about();else home();if(location.hash==='#/#tools')document.querySelector('#tools')?.scrollIntoView();else window.scrollTo({top:0,behavior:'instant'});}
function goStep(index){if(composing)return;draft.currentStep=index;scheduleSave();writing(true);}
function download(){const blob=new Blob(['\uFEFF',exportText(draft)],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=fileName(draft.title);document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('텍스트 파일로 내려받았어요. 파일을 안전한 곳에 보관해 주세요.');}
async function reset(){
  if(!await confirmAction('새 글을 시작할까요?','이 브라우저에 저장된 글과 현재 작성 내용을 삭제합니다. 중요한 글은 먼저 내려받아 주세요.','삭제하고 새로 쓰기'))return;
  clearTimeout(timer);
  try{localStorage.removeItem(KEY);lastRaw=null;blocked='';}catch{blocked='unavailable';}
  draft=fresh();dirty=false;savingLabel='새 글 · 아직 작성한 내용이 없어요';writing(true);toast('새 글을 시작해요.');
}
main.addEventListener('compositionstart',()=>{composing=true;});
main.addEventListener('compositionend',()=>{composing=false;});
main.addEventListener('input',event=>{
  const key=event.target.dataset.field;if(!key)return;
  if(key==='title'||key==='finalText')draft[key]=event.target.value;
  else{draft.answers[key]=event.target.value;draft.answersRevision++;}
  scheduleSave();
  if(key!=='title'){const count=document.querySelector('#char-count');if(count)count.textContent=`${wordCount(event.target.value)}자 · 공백 포함`;}
  const completion=document.querySelector('#completion');if(completion)completion.textContent=`${questions.filter(q=>draft.answers[q.key].trim()).length} / 5개의 생각을 담았어요.`;
});
main.addEventListener('click',async event=>{
  const button=event.target.closest('[data-step],[data-action]');if(!button)return;
  if(button.dataset.step!==undefined){goStep(Number(button.dataset.step));return;}
  const action=button.dataset.action;
  if(action==='download')download();
  else if(action==='reset')await reset();
  else if(action==='copy'){
    try{await navigator.clipboard.writeText(exportText(draft));toast('제목과 글을 복사했어요.');}
    catch{const textarea=document.querySelector('#final-text');textarea?.focus();textarea?.select();toast('자동 복사가 어려워요. 선택된 글을 직접 복사해 주세요.');}
  }else if(action==='recompile'){
    if(draft.finalText!==compile(draft)&&!await confirmAction('답변을 다시 모을까요?','직접 다듬은 완성 글을 현재 답변으로 바꿉니다. 필요하면 먼저 글을 내려받아 주세요.','답변으로 바꾸기'))return;
    draft.finalText=compile(draft);draft.finalTextInitialized=true;draft.compiledRevision=draft.answersRevision;scheduleSave();writing(true);toast('현재 답변으로 글을 다시 모았어요.');
  }else if(action==='reload'){
    if(!await confirmAction('저장된 글을 불러올까요?','현재 화면의 입력이 저장된 글로 바뀝니다. 필요한 내용은 먼저 내려받아 주세요.','불러오기'))return;
    clearTimeout(timer);
    try{const raw=localStorage.getItem(KEY);const incoming=raw===null?fresh():decode(raw);draft=incoming;lastRaw=raw;blocked='';dirty=false;savingLabel='저장된 글을 불러왔어요';writing(true);}
    catch{toast('저장된 글을 읽을 수 없어요. 현재 입력은 유지했어요.');}
  }else if(action==='overwrite'){
    if(!await confirmAction('현재 글로 저장할까요?','다른 탭에서 저장한 글을 현재 화면의 글로 바꿉니다.','현재 글로 저장'))return;
    try{lastRaw=localStorage.getItem(KEY);blocked='';dirty=true;save();updateWarning();}catch{blocked='unavailable';updateWarning();}
  }else if(action==='retry'){
    try{const current=localStorage.getItem(KEY);if(current!==lastRaw){blocked='conflict';updateWarning();return;}blocked='';dirty=true;save();updateWarning();}catch{blocked='unavailable';updateWarning();}
  }
});
window.addEventListener('storage',event=>{
  if(event.key!==KEY&&event.key!==null)return;
  const newRaw=event.key===null?null:event.newValue;
  if(newRaw===lastRaw)return;clearTimeout(timer);blocked='conflict';updateWarning();
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
window.addEventListener('pagehide',save);
window.addEventListener('beforeunload',event=>{save();if(dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('hashchange',()=>{route();main.focus({preventScroll:true});});
route();
