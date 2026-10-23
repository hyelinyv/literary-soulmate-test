import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
await import('../dist/engine.js');
const engine=globalThis.SoulEngine;
const data=JSON.parse(fs.readFileSync(new URL('../dist/content.json',import.meta.url),'utf8'));
const baseline=JSON.parse(fs.readFileSync(new URL('../content-source/questions-v1.3.json',import.meta.url),'utf8'));
const previous=JSON.parse(fs.readFileSync(new URL('../content-source/questions-v1.1.json',import.meta.url),'utf8'));
assert.deepEqual(data.questions,baseline.questions,'题干与选项必须与统一底稿一致');
assert.deepEqual(data.questions.filter(q=>q.id!=='Q18'),previous.questions.filter(q=>q.id!=='Q18'),'本轮只改Q18，其余23题保留');
assert.equal(data.contentVersion,'q24-v1.3-beta1');assert.equal(data.matchingVersion,'m1.1-editorial');
const expectedTypes={camus:'清醒行者',woolf:'感受捕手',beauvoir:'自由同行者',montaigne:'对话探寻者',shi:'生命寻路人',nietzsche:'价值追问者',epictetus:'内心掌舵者',arendt:'公共行动者',rilke:'内在诗人',luxun:'呐喊者',hesse:'自我旅人',buber:'相遇者'};
assert.deepEqual(Object.fromEntries(data.authors.map(a=>[a.id,a.typeName])),expectedTypes,'12个名称采用用户确认版，伍尔夫保持感受捕手');
assert.equal(data.questions.length,24);assert.equal(data.authors.length,12);
for(const r of data.rules){const a=data.authors.find(a=>a.id===r.authorId);assert.ok(a);const facet=a.facets.find(f=>f.id===r.facetId);assert.ok(facet);assert.ok(facet.sourceIds.every(id=>a.sources.some(s=>s.id===id)));const q=data.questions.find(q=>q.id===r.questionId);assert.ok(q);assert.ok(r.answers.every(answer=>(q.type==='choice'?q.options:data.agreementScale).some(o=>o.id===answer)));}
assert.throws(()=>engine.matchAnswers(data,{}));
assert.equal(engine.validProgress(data,{contentVersion:'old',matchingVersion:'old',answers:{}}),null);
assert.equal(engine.validProgress(data,{contentVersion:'q24-v1.2-beta1',matchingVersion:'m1.0-editorial',answers:{Q18:'A'},currentIndex:17,screen:'quiz'}),null,'旧Q18的选择不能作为新版答案恢复');
assert.ok(!data.rules.some(r=>r.authorId==='hesse'&&r.questionId==='Q23'&&r.answers.includes('1')),'不沿用旧反向规则');
assert.ok(!data.rules.some(r=>r.questionId==='Q22'&&['camus','luxun'].includes(r.authorId)),'新版Q22不继承旧线索');
const reasonAnswers=Object.fromEntries(data.questions.map(q=>[q.id,q.type==='choice'?'D':'1']));
reasonAnswers.Q04='B';reasonAnswers.Q11='C';reasonAnswers.Q18='A';
const voiced=engine.matchAnswers(data,reasonAnswers);
assert.equal(voiced.primary.authorId,'luxun','Q18-A的发声理由与Q04-B的回应线索可形成鲁迅结果');
const voiceEvidence=voiced.primary.evidence.find(e=>e.questionId==='Q18');
assert.equal(voiceEvidence.answer,'A');assert.ok(voiceEvidence.sourceIds.includes('LU-02'),'呐喊者的Q18解释包含呐喊自序依据');
const shared=engine.matchAnswers(data,{...reasonAnswers,Q18:'B'});
assert.equal(shared.primary.authorId,'arendt','Q18-B的公共参与理由与Q11-C共同支持阿伦特');
assert.ok(!shared.ranking.find(r=>r.authorId==='luxun').evidence.some(e=>e.questionId==='Q18'),'不把公共参与选项套用成鲁迅发声理由');
const practical=engine.matchAnswers(data,{...reasonAnswers,Q18:'C'});
assert.ok(practical.ranking.every(r=>!r.evidence.some(e=>e.questionId==='Q18')),'新版Q18-C只记录可行性理由，不强行绑定人物');
let seed=847391;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const witnesses={},counts={},modes={};
for(let i=0;i<24000;i++){
 const answers=Object.fromEntries(data.questions.map(q=>{const options=q.type==='choice'?q.options:data.agreementScale;return[q.id,options[Math.floor(random()*options.length)].id];}));
 const result=engine.matchAnswers(data,answers);assert.ok(result.ranking.every(r=>Number.isFinite(r.score)));assert.ok(result.primary.evidence.every(e=>e.answer===answers[e.questionId]));
 counts[result.primary.authorId]=(counts[result.primary.authorId]||0)+1;modes[result.mode]=(modes[result.mode]||0)+1;
 if(result.mode==='resonance'&&!witnesses[result.primary.authorId])witnesses[result.primary.authorId]=answers;
}
assert.equal(Object.keys(witnesses).length,12,'全部12种结果均须存在可达路径');
for(const [id,answers] of Object.entries(witnesses)){
 const result=engine.matchAnswers(data,answers);assert.equal(result.primary.authorId,id);assert.equal(result.mode,'resonance');assert.ok(result.primary.questionIds.length>=2);
 const reordered={...data,authors:[...data.authors].reverse()};assert.equal(engine.matchAnswers(reordered,answers).primary.authorId,id,'人物数据顺序不应改变计算');
 const saved=engine.validProgress(data,{contentVersion:data.contentVersion,matchingVersion:data.matchingVersion,answers,currentIndex:23,screen:'result'});assert.equal(saved.screen,'result');assert.deepEqual(saved.answers,answers);
}
const base=data.authors[0],sample=data.rules.find(r=>r.authorId===base.id&&r.relation==='direct');
const twin={...data,authors:[base,{...base,id:'twin'}],rules:[...data.rules.filter(r=>r.authorId===base.id),...data.rules.filter(r=>r.authorId===base.id).map(r=>({...r,authorId:'twin'}))]};
const tied=engine.matchAnswers(twin,witnesses[base.id]);assert.ok(tied.near.some(r=>r.authorId==='twin'));
fs.mkdirSync(new URL('../tests/output/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../tests/output/witnesses.json',import.meta.url),JSON.stringify(witnesses,null,2));
const report={status:'passed',contentVersion:data.contentVersion,matchingVersion:data.matchingVersion,questions:24,authors:12,rules:data.rules.length,approvedNames:true,unchangedQuestions:23,q18ReasonSeparation:true,oldQ18ProgressRejected:true,randomCases:24000,resultPaths:counts,modes,note:'随机案例只检查程序路径、有限数值及可达性，不代表受试者、准确率或类型人群比例。'};
fs.writeFileSync(new URL('../tests/output/report.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
