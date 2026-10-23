(function(root) {
  'use strict';
  function answerValue(question, answer, rule) {
    if (!rule.answers.includes(String(answer))) return 0;
    return question.type === 'agreement' ? (String(answer) === '5' ? 1 : .6) * rule.weight : rule.weight;
  }
  function validateAnswers(data, answers) {
    return data.questions.every(q => (q.type === 'choice' ? q.options.map(o=>o.id) : data.agreementScale.map(o=>o.id)).includes(String(answers[q.id])));
  }
  function compile(data) {
    const questions = Object.fromEntries(data.questions.map(q=>[q.id,q]));
    const rules = data.rules.map(r=>({...r, question:questions[r.questionId]}));
    const models = data.authors.map(author=>{
      const ownRules = rules.filter(r=>r.authorId===author.id);
      const facets = author.facets.map(facet=>{
        const facetRules = ownRules.filter(r=>r.facetId===facet.id);
        const byQuestion = {};
        facetRules.forEach(r=>{ (byQuestion[r.questionId] || (byQuestion[r.questionId]=[])).push(r); });
        const distributions = Object.keys(byQuestion).map(qid=>{
          const q=questions[qid]; const options=q.type==='choice'?q.options:data.agreementScale;
          return options.map(o=>Math.max(0,...byQuestion[qid].map(r=>answerValue(q,o.id,r))));
        });
        const levels = [...new Set(distributions.flat())].filter(v=>v>0).sort((a,b)=>a-b);
        let expected=0, previous=0;
        levels.forEach(level=>{
          const probability=1-distributions.reduce((p,values)=>p*(1-values.filter(v=>v>=level-1e-10).length/values.length),1);
          expected+=(level-previous)*probability; previous=level;
        });
        return { facet, rules:facetRules, capacity:levels[levels.length-1]||0, expected };
      }).filter(f=>f.capacity>0);
      return { author, facets, capacity:facets.reduce((s,f)=>s+f.capacity,0), expected:facets.reduce((s,f)=>s+f.expected,0) };
    });
    return {questions,models};
  }
  const compiled = new WeakMap();
  function matchAnswers(data, answers) {
    if(!validateAnswers(data,answers)) throw new Error('请先完成全部24题。');
    if(!compiled.has(data)) compiled.set(data,compile(data));
    const model=compiled.get(data);
    const ranking=model.models.map(item=>{
      const evidence=[]; let observed=0;
      item.facets.forEach(f=>{
        const hits=f.rules.map(rule=>({rule,value:answerValue(rule.question,answers[rule.questionId],rule)})).filter(h=>h.value>0);
        observed+=Math.max(0,...hits.map(h=>h.value));
        hits.forEach(h=>evidence.push({authorId:item.author.id,facetId:f.facet.id,facet:f.facet,questionId:h.rule.questionId,answer:String(answers[h.rule.questionId]),relation:h.rule.relation,weight:h.value,boundary:h.rule.boundary||'',sourceIds:f.facet.sourceIds}));
      });
      const questionIds=[...new Set(evidence.map(e=>e.questionId))];
      const hasDirect=evidence.some(e=>e.relation==='direct');
      const eligible=hasDirect&&questionIds.length>=2;
      const centered=item.capacity>item.expected?(observed-item.expected)/(item.capacity-item.expected):0;
      const coverage=Math.min(1,questionIds.length/3);
      const score=centered*coverage;
      const unique=[]; const seen=new Set();
      evidence.sort((a,b)=>(b.relation==='direct')-(a.relation==='direct')||b.weight-a.weight||a.questionId.localeCompare(b.questionId)).forEach(e=>{ if(!seen.has(e.questionId)){seen.add(e.questionId);unique.push(e);} });
      return {authorId:item.author.id,score,observed,capacity:item.capacity,expected:item.expected,eligible,hasDirect,questionIds,evidence:unique};
    }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||b.questionIds.length-a.questionIds.length||a.authorId.localeCompare(b.authorId));
    const primary=ranking[0];
    const near=ranking.filter(r=>r.authorId!==primary.authorId&&r.eligible===primary.eligible&&r.evidence.length>0&&Math.abs(primary.score-r.score)<=.04);
    const mode=primary.eligible&&primary.score>0?'resonance':'explore';
    return {contentVersion:data.contentVersion,matchingVersion:data.matchingVersion,mode,primary,near,ranking};
  }
  function validProgress(data,saved) {
    if(!saved||saved.contentVersion!==data.contentVersion||saved.matchingVersion!==data.matchingVersion) return null;
    const answers={};
    data.questions.forEach(q=>{const options=q.type==='choice'?q.options:data.agreementScale; if(options.some(o=>o.id===String(saved.answers?.[q.id]))) answers[q.id]=String(saved.answers[q.id]);});
    const currentIndex=Number.isInteger(saved.currentIndex)?Math.max(0,Math.min(data.questions.length-1,saved.currentIndex)):0;
    return {answers,currentIndex,screen:saved.screen==='result'&&validateAnswers(data,answers)?'result':'home'};
  }
  root.SoulEngine={matchAnswers,validateAnswers,validProgress,compile};
})(typeof window !== 'undefined' ? window : globalThis);
