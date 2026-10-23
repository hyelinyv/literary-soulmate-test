(function() {
  'use strict';
  const data=window.SoulData, engine=window.SoulEngine;
  const root=document.getElementById('soul-design');
  const $=selector=>root.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key='literary-resonance-beta';
  let answers={},currentIndex=0,screen='home',result=null,storageOk=true,modalFocus=null,posterUrl=null;
  const authors=Object.fromEntries(data.authors.map(a=>[a.id,a]));
  function say(text){$('#status-message').textContent=text;}
  function save(){try{localStorage.setItem(key,JSON.stringify({contentVersion:data.contentVersion,matchingVersion:data.matchingVersion,answers,currentIndex,screen}));}catch{storageOk=false;}}
  try{const progress=engine.validProgress(data,JSON.parse(localStorage.getItem(key)||'null'));if(progress){answers=progress.answers;currentIndex=progress.currentIndex;screen=progress.screen;}}catch{storageOk=false;}
  function top(){window.scrollTo({top:0,left:0,behavior:'auto'});}
  function showPage(page){screen=page;root.querySelectorAll('[data-page]').forEach(el=>el.hidden=el.dataset.page!==page);save();top();document.title=page==='result'?'我的文学知音 · '+authors[result.primary.authorId].name:'你的灵魂，与谁同频？';}
  function updateHome(){
    const count=Object.keys(answers).length;
    $('[data-action="start"]').innerHTML=(count?(count===24?'查看我的结果':'继续寻找 · '+count+' / 24'):'开始寻找')+'<span aria-hidden="true">→</span>';
    if(!storageOk&&!$('.sf-storage-note')){const p=document.createElement('p');p.className='sf-storage-note';p.textContent='当前浏览器无法保存进度。请在本次打开期间完成答题。';$('.sf-home-invite').appendChild(p);}
  }
  function scaleMarkup(q){
    return '<div class="sf-scale sf-glass" role="group" aria-label="选择符合程度"><div class="sf-scale-endpoints" aria-hidden="true"><span>很不符合</span><span>很符合</span></div><div class="sf-scale-track">'+data.agreementScale.map(o=>'<label class="sf-scale-step"><input class="sf-scale-input" type="radio" name="agreement" value="'+o.id+'" aria-label="'+esc(o.label)+'" '+(answers[q.id]===o.id?'checked':'')+'><span class="sf-scale-circle" aria-hidden="true"><span class="sf-check">✓</span></span></label>').join('')+'</div><p class="sf-scale-current">'+esc(data.agreementScale.find(o=>o.id===answers[q.id])?.label||'点击圆点选择')+'</p></div>';
  }
  function renderQuestion(){
    const q=data.questions[currentIndex];
    $('#question-content').className=q.type==='agreement'?'sf-statement':'';
    $('#question-content').innerHTML='<div class="sf-question"><h2>'+esc(q.prompt)+'</h2></div>'+(q.type==='agreement'?scaleMarkup(q):'<div class="sf-option-group sf-glass" role="group" aria-label="请选择一项">'+q.options.map(o=>'<button type="button" class="sf-option" data-option="'+o.id+'" aria-pressed="'+(answers[q.id]===o.id)+'"><span class="sf-option-letter">'+o.id+'</span><span class="sf-option-text">'+esc(o.label)+'</span><span class="sf-choice-mark" aria-hidden="true"></span></button>').join('')+'</div>');
    $('[data-progress-label]').textContent=String(currentIndex+1).padStart(2,'0')+' / 24';
    $('[role="progressbar"]').setAttribute('aria-valuenow',currentIndex+1);
    $('.sf-progress-fill').style.width=((currentIndex+1)/24*100)+'%';
    $('[data-next-label]').textContent=currentIndex===23?'遇见我的知音':'下一题';
    $('[data-action="next"]').disabled=!answers[q.id];
    $('[data-action="back"]').setAttribute('aria-label',currentIndex===0?'返回首页':'上一题');
    $('#question-content').querySelectorAll('[data-option]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.option)));
    $('#question-content').querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>select(input.value,false)));
  }
  function select(value,rerender=true){answers[data.questions[currentIndex].id]=value;save();if(rerender)renderQuestion();else{$('.sf-scale-current').textContent=data.agreementScale.find(o=>o.id===value).label;$('[data-action="next"]').disabled=false;}say('已选择。');}
  function art(author){return '<div class="sf-result-art" data-art="'+author.id+'" role="img" aria-label="'+esc(author.typeName)+'的平面抽象图形"><span class="sf-moon"></span><span class="sf-sun"></span><span class="sf-small-dot"></span></div>';}
  function sourceLinks(author,ids){return ids.map(id=>author.sources.find(s=>s.id===id)).filter(Boolean).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗<small>'+esc(s.locator)+'</small></a>').join('');}
  function evidenceMarkup(author,evidence){
    if(!evidence.length)return '<p class="sf-source-copy">目前还没有足够集中的回答线索。可以把推荐作品作为一个阅读起点。</p>';
    return evidence.slice(0,3).map(e=>{const q=data.questions.find(q=>q.id===e.questionId);const label=q.type==='choice'?q.options.find(o=>o.id===e.answer).label:data.agreementScale.find(o=>o.id===e.answer).label;return '<section class="sf-reason"><div class="sf-evidence-kind">'+(e.relation==='direct'?'从你的回答看见':'一条补充线索')+' · '+q.id+'</div><h3>'+esc(e.facet.label)+'</h3><p>'+esc(q.prompt)+'</p><blockquote class="sf-answer-quote">'+esc(label)+'</blockquote><p>'+(e.relation==='context'?'这让我们想到作品里的一处讨论：':'与这条回答相呼应的文本主题是：')+esc(e.facet.description)+'</p><div class="sf-source-links">'+sourceLinks(author,e.sourceIds)+'</div></section>';}).join('');
  }
  function renderResult(){
    result=engine.matchAnswers(data,answers);
    const a=authors[result.primary.authorId], strong=result.mode==='resonance';
    const near=result.near.slice(0,2);
    $('#result-content').innerHTML='<div class="sf-result-main sf-glass"><p class="sf-kicker">'+(strong?'这次，与你同频的是':'先从这位思想者读起')+'</p><h1 class="'+(a.name.length>4?'sf-long-name':'')+'">'+esc(a.name)+'</h1><p class="sf-author-name">'+esc(a.fullName||a.name)+'</p><p class="sf-type-label">'+(strong?'你的共鸣类型':'本次阅读主题')+'</p><h2 class="sf-type-name">'+esc(a.typeName)+'</h2>'+art(a)+'<button type="button" class="sf-primary" data-action="type">了解'+(strong?'你的类型':'这次相遇')+'<span aria-hidden="true">↓</span></button></div><div class="sf-result-sections"><section id="sf-type-description" class="sf-type-description"><p class="sf-kicker">'+esc(a.typeName)+' · 类型解读</p><h2>'+esc(a.summary)+'</h2><p class="sf-result-intro">'+esc(a.typeDescription)+'</p>'+(!strong?'<p class="sf-result-intro">这次的回答还没有形成足以清楚区分人物的线索。这里提供的是一个阅读起点，你可以结合下面的具体回答，再判断哪一处真正与你相近。</p>':'')+(near.length?'<div class="sf-near">'+(Math.abs(result.primary.score-near[0].score)<1e-9?'这次有不止一位与你相近：':'你也与这位人物留下一处接近的线索：')+near.map(n=>'<button type="button" data-near="'+n.authorId+'">'+esc(authors[n.authorId].name)+' · '+esc(authors[n.authorId].typeName)+' →</button>').join('')+'</div>':'')+'</section><details id="sf-reasons"><summary>从你的回答看见 <span aria-hidden="true">⌄</span></summary>'+evidenceMarkup(a,result.primary.evidence)+'</details><details id="sf-sources"><summary>对方曾怎样思考 <span aria-hidden="true">⌄</span></summary><div class="sf-source-copy">'+a.facets.map(f=>'<p><strong>'+esc(f.label)+'</strong><br>'+esc(f.description)+'</p>').join('')+'<div class="sf-source-links">'+sourceLinks(a,a.sources.map(s=>s.id))+'</div><p class="sf-source-note">以上是对所列作品的中文转述，类型名由本项目拟定，并非作者原话或人格诊断。</p></div></details><section class="sf-reading sf-glass"><div class="sf-reading-label">推荐你读这部作品</div><h3>'+esc(a.book.title)+'</h3><p>'+esc(a.book.reason)+'</p><a href="'+esc(a.book.url)+'" target="_blank" rel="noopener noreferrer">查看作品与原文入口 ↗</a></section></div><div class="sf-secondary-actions"><button type="button" data-action="poster">保存结果卡</button><button type="button" data-action="copy-link">复制测试链接</button></div><details class="sf-feedback"><summary>给这次试测留一点反馈</summary><p>可以记下难理解的题、没有合适选项的地方，或结果中与你不相近的句子。反馈不会自动上传；点击下方按钮后，你可以自行发给邀请你试测的人。</p><textarea id="feedback-text" aria-label="试测反馈" placeholder="哪一处让你停顿，或觉得不像自己？"></textarea><button type="button" data-action="feedback">复制反馈与答题记录</button></details><div class="sf-result-bottom"><button type="button" data-action="edit">回看我的答案</button><button type="button" data-action="restart">再寻找一次</button><button type="button" data-action="method">关于测试与资料</button></div><p class="sf-small-print">'+esc(data.contentVersion)+' · '+esc(data.matchingVersion)+'<br>一次有文本依据的文学与哲学共鸣探索。<br>答题记录保存在本机，可由“再寻找一次”清除。</p>';
  }
  function openModal(title,html){modalFocus=document.activeElement;$('#modal-title').textContent=title;$('#modal-content').innerHTML=html;$('#modal').hidden=false;document.body.style.overflow='hidden';$('[data-action="close-modal"]').focus();}
  function closeModal(){ $('#modal').hidden=true;document.body.style.overflow='';if(posterUrl){URL.revokeObjectURL(posterUrl);posterUrl=null;}modalFocus?.focus(); }
  async function copyText(text,success){
    try{if(!navigator.clipboard||!window.isSecureContext)throw new Error('fallback');await navigator.clipboard.writeText(text);say(success);openModal('已复制','<p>'+esc(success)+'</p><button type="button" class="sf-primary" data-action="close-modal">知道了</button>');}
    catch{openModal('长按复制','<p>当前浏览器可以手动复制以下内容。</p><textarea class="sf-copy-field" aria-label="待复制内容" readonly>'+esc(text)+'</textarea>');const field=$('.sf-copy-field');field.focus();field.select();}
  }
  function report(){return {contentVersion:data.contentVersion,matchingVersion:data.matchingVersion,result:result.primary.authorId,mode:result.mode,feedback:$('#feedback-text')?.value||'',answers:data.questions.map(q=>({id:q.id,prompt:q.prompt,answer:answers[q.id],label:(q.type==='choice'?q.options:data.agreementScale).find(o=>o.id===answers[q.id]).label})),matching:result.ranking.map(r=>({authorId:r.authorId,score:Number(r.score.toFixed(6)),supportQuestions:r.questionIds,eligible:r.eligible}))};}
  function poster(){
    const a=authors[result.primary.authorId],canvas=document.createElement('canvas');canvas.width=750;canvas.height=1100;const c=canvas.getContext('2d');
    c.fillStyle='#f4f2f8';c.fillRect(0,0,750,1100);c.fillStyle='#fff';c.fillRect(36,36,678,1028);c.textAlign='center';c.fillStyle='#746a83';c.font='24px sans-serif';c.fillText(result.mode==='resonance'?'这次，与我同频的是':'我的一处阅读起点',375,110);c.fillStyle='#302a3b';c.font=(a.name.length>4?'58':'72')+'px serif';c.fillText(a.name,375,224);c.fillStyle='#79648e';c.font='36px serif';c.fillText(a.typeName,375,298);c.fillStyle='#c6baf2';c.beginPath();c.arc(305,465,120,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(352,465,62,0,Math.PI*2);c.fill();c.fillStyle='#a4d5ed';c.beginPath();c.arc(484,465,82,0,Math.PI*2);c.fill();
    c.fillStyle='#453b52';c.font='30px serif';wrap(a.summary,375,650,570,51);c.fillStyle='#746a83';c.font='23px sans-serif';c.fillText('你的灵魂，与谁同频？',375,860);c.font='20px sans-serif';c.fillText('24 道问题 · 12 位作家与哲学家',375,906);c.font='16px sans-serif';wrap(location.origin,375,975,600,26);
    function wrap(text,x,y,maxWidth,lineHeight){let line='';for(const char of text){if(c.measureText(line+char).width>maxWidth){c.fillText(line,x,y);line=char;y+=lineHeight;}else line+=char;}if(line)c.fillText(line,x,y);}
    canvas.toBlob(blob=>{if(!blob){say('图片暂时无法生成，请稍后再试。');return;}posterUrl=URL.createObjectURL(blob);openModal('留住这次相遇','<img src="'+posterUrl+'" alt="'+esc(a.name)+' · '+esc(a.typeName)+'结果卡"><p>在微信中可长按图片保存。卡片只含人物、类型和一句共鸣，不含你的答题记录。</p><a class="sf-primary" href="'+posterUrl+'" download="我的文学知音.png">下载图片</a>');},'image/png');
  }
  function method(){openModal('关于这次寻找','<p>这是一组原创的文学与哲学问题。我们比较的是你实际选择的理由，与12位人物在具体作品中表达的主题。</p><p>类型名称为本项目的编辑命名。按主题限制重复线索，再比较人物；接近或不足时会明确说明。这里不报告匹配百分比，也不把结果用于心理诊断。</p><p>题库与规则已经过文本和程序核对，目前仍处于真人试测阶段。</p><p>答案仅保存在当前浏览器；浏览器清理数据后可能丢失。本站不上传答题记录，不接入登录或广告统计。</p><p><a href="./method.html" target="_blank" rel="noopener">查看版本、匹配方法与全部资料 ↗</a></p><p>任何问题请联系开发者 <a href="mailto:3332873535@qq.com">3332873535@qq.com</a></p>');}
  root.addEventListener('click',event=>{
    const near=event.target.closest('[data-near]');if(near){const a=authors[near.dataset.near],r=result.ranking.find(r=>r.authorId===a.id);openModal(a.name+' · '+a.typeName,'<p>'+esc(a.summary)+'</p>'+evidenceMarkup(a,r.evidence));return;}
    const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
    if(action==='start'){if(engine.validateAnswers(data,answers)){renderResult();showPage('result');}else{const first=data.questions.findIndex(q=>!answers[q.id]);currentIndex=first<0?currentIndex:first;renderQuestion();showPage('quiz');}}
    else if(action==='next'){if(!answers[data.questions[currentIndex].id])return;if(currentIndex<23){currentIndex++;renderQuestion();showPage('quiz');}else{renderResult();showPage('result');}}
    else if(action==='back'){if(currentIndex>0){currentIndex--;renderQuestion();showPage('quiz');}else{updateHome();showPage('home');}}
    else if(action==='home'){updateHome();showPage('home');}
    else if(action==='edit'){currentIndex=23;renderQuestion();showPage('quiz');}
    else if(action==='restart')openModal('重新开始寻找？','<p>重新开始会清除这台设备上本次测试的答案与结果。</p><button type="button" class="sf-primary" data-action="confirm-restart">重新开始</button><button type="button" class="sf-link" data-action="close-modal">保留这次相遇</button>');
    else if(action==='confirm-restart'){answers={};currentIndex=0;result=null;closeModal();updateHome();showPage('home');}
    else if(action==='type')$('#sf-type-description').scrollIntoView({block:'start',behavior:'auto'});
    else if(action==='about'||action==='method')method();
    else if(action==='close-modal')closeModal();
    else if(action==='copy-link')copyText(location.origin+location.pathname,'测试链接已复制，可以发给想邀请的人。');
    else if(action==='poster')poster();
    else if(action==='feedback')copyText(JSON.stringify(report(),null,2),'反馈与本次答题记录已复制，请自行发给邀请你试测的人。');
  });
  $('#modal').addEventListener('click',event=>{if(event.target===$('#modal'))closeModal();});
  document.addEventListener('keydown',event=>{if($('#modal').hidden)return;if(event.key==='Escape'){closeModal();return;}if(event.key==='Tab'){const focusable=[...$('#modal').querySelectorAll('button,a[href],textarea,input')].filter(e=>!e.disabled);const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  updateHome();if(screen==='result'){renderResult();showPage('result');}else showPage('home');
})();
