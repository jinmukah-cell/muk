import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,decode,compile,fileName,exportText,wordCount} from '../dist/model.mjs';
test('작성 데이터 왕복 복원 및 수정한 빈 최종 글 보존',()=>{
  const d=fresh();d.title='수업의 여백';d.answers.topic='기다림';d.currentStep=5;d.finalTextInitialized=true;d.finalText='';
  assert.deepEqual(decode(JSON.stringify(d)),d);assert.equal(exportText(d),'수업의 여백\n\n');
});
test('독자는 본문에서 제외하고 빈 항목을 건너뛰어 조합',()=>{
  const d=fresh();d.answers={topic:' 주제 ',audience:'비공개 독자',message:'',evidence:'예시',ending:'끝'};
  assert.equal(compile(d),'주제\n\n예시\n\n끝');
});
test('잘못된 버전·단계·필드와 손상 데이터 거부',()=>{
  for(const value of ['bad','null','{}',JSON.stringify({...fresh(),schemaVersion:2}),JSON.stringify({...fresh(),currentStep:6}),JSON.stringify({...fresh(),answers:{}}),JSON.stringify({...fresh(),compiledRevision:1}),JSON.stringify({...fresh(),updatedAt:123})])assert.throws(()=>decode(value));
});
test('파일 이름 정리와 본문 텍스트 보존',()=>{
  assert.equal(fileName('A/B:수업?'),'A_B_수업_.txt');assert.equal(fileName('   '),'제목 없는 글.txt');
  const d=fresh();d.finalTextInitialized=true;d.finalText='<script>alert("한글")</script>\n😀';
  assert.ok(exportText(d).includes(d.finalText));assert.equal(wordCount('한글😀'),3);
});
