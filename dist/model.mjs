export const KEY = 'jinmuk-hub:writing:v1';
export const questions = [
  {key:'topic', name:'주제', title:'어떤 이야기를\n시작하고 싶나요?', hint:'마음에 남은 장면이나, 함께 나누고 싶은 생각에서 시작해 보세요.', placeholder:'예: 수업에서 아이들의 질문을 기다려 주는 시간에 대해 쓰고 싶어요.', tip:'완벽한 첫 문장이 아니어도 괜찮아요. 지금 떠오르는 생각을 편하게 적어 보세요.'},
  {key:'audience', name:'독자', title:'이 글을 누구에게\n전하고 싶나요?', hint:'글을 읽을 한 사람을 떠올리면, 이야기가 조금 더 또렷해져요.', placeholder:'예: 수업 속 침묵이 어색하게 느껴지는 동료 선생님에게.', tip:'독자는 글을 쓰는 동안 참고하는 메모예요. 완성 글의 본문에는 자동으로 들어가지 않아요.'},
  {key:'message', name:'핵심 메시지', title:'꼭 전하고 싶은\n한 가지는 무엇인가요?', hint:'독자의 마음에 남았으면 하는 생각을 한두 문장으로 적어 보세요.', placeholder:'예: 기다림은 수업을 멈추는 시간이 아니라 아이들의 생각이 자라는 시간이에요.', tip:'생각이 여러 개라면, 지금 가장 중요하게 느껴지는 하나를 골라 보세요.'},
  {key:'evidence', name:'근거·예시', title:'그 생각을 뒷받침할\n이야기가 있나요?', hint:'작은 경험 하나, 구체적인 장면 하나가 글을 단단하게 해 줘요.', placeholder:'예: 질문 후 조금 더 기다렸더니, 평소 조용하던 아이가 처음으로 손을 들었어요.', tip:'실제 이름이나 민감한 정보 대신, 가상의 이름과 사례를 사용해 주세요.'},
  {key:'ending', name:'마무리', title:'마지막으로 어떤 말을\n남기고 싶나요?', hint:'작은 제안이나 질문으로, 독자에게 생각할 여백을 건네 보세요.', placeholder:'예: 내일 수업에서는 질문 뒤에 마음속으로 다섯을 세어 보면 어떨까요?', tip:'앞의 생각을 반복하기보다, 독자가 해 볼 수 있는 작은 행동을 제안해도 좋아요.'},
];
export const programs = [
  {id:'diary', name:'하루 한 장 · 일기장', description:'오늘의 장면과 마음을 나만의 문장으로. 일기를 쓰고, 검색하고, 내 컴퓨터의 폴더에 보관하세요.', path:'./diary/index.html', category:'일상 기록 · 로컬 폴더 저장'},
  {id:'writing', name:'생각을 잇는 글쓰기', description:'막막한 첫 문장 대신, 다섯 가지 질문으로. 흩어진 생각을 모아 나만의 글을 완성하세요.', path:'#/writing', category:'생각 정리 · 글쓰기'},
  {id:'selah', name:'셀라 · 오늘의 말씀', description:'잠시 멈추고 오늘의 마음을 살핀 뒤, 말씀과 묵상 질문 앞에 조용히 머물러 보세요.', path:'./selah/index.html', category:'개인 묵상 · 성경 말씀'},
  {id:'pdf', name:'PDF 글자 수 세기', description:'PDF 파일을 업로드하지 않고, 이 브라우저에서 글자 수와 단어 수를 확인하세요.', path:'./pdf/index.html', category:'문서 분석 · 글자 수'}
];
export function fresh() { return {schemaVersion:1,title:'',answers:Object.fromEntries(questions.map(q=>[q.key,''])),currentStep:0,finalText:'',finalTextInitialized:false,answersRevision:0,compiledRevision:0,updatedAt:null}; }
export function decode(raw) {
  const d = JSON.parse(raw);
  if (!d || d.schemaVersion!==1 || typeof d.title!=='string' || !d.answers || questions.some(q=>typeof d.answers[q.key]!=='string') || !Number.isInteger(d.currentStep) || d.currentStep<0 || d.currentStep>5 || typeof d.finalText!=='string' || typeof d.finalTextInitialized!=='boolean' || !Number.isInteger(d.answersRevision) || d.answersRevision<0 || !Number.isInteger(d.compiledRevision) || d.compiledRevision<0 || d.compiledRevision>d.answersRevision || !(d.updatedAt===null || (typeof d.updatedAt==='string' && Number.isFinite(Date.parse(d.updatedAt))))) throw new Error('Invalid saved draft');
  return {schemaVersion:1,title:d.title,answers:Object.fromEntries(questions.map(q=>[q.key,d.answers[q.key]])),currentStep:d.currentStep,finalText:d.finalText,finalTextInitialized:d.finalTextInitialized,answersRevision:d.answersRevision,compiledRevision:d.compiledRevision,updatedAt:d.updatedAt};
}
export function compile(d) { return ['topic','message','evidence','ending'].map(k=>d.answers[k].trim()).filter(Boolean).join('\n\n'); }
export function wordCount(text) { return Array.from(text).length; }
export function fileName(title) { const stem=title.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/,'').slice(0,80) || '제목 없는 글'; return `${stem}.txt`; }
export function exportText(d) { return `${d.title.trim() || '제목 없는 글'}\n\n${d.finalTextInitialized ? d.finalText : compile(d)}`; }
