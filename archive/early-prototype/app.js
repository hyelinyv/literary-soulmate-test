import {questions,rankAnswers} from './quiz.mjs';

const $ = id => document.getElementById(id);
const screens = {home:$('home-screen'),quiz:$('quiz-screen'),result:$('result-screen')};
const storageKey = 'soul-frequency-draft-v1';
let answers = Array(questions.length).fill(null);
let current = 0;
let resultProfile = null;
let toastTimer;

function saveProgress() {
  try {sessionStorage.setItem(storageKey,JSON.stringify({answers,current}));} catch { /* 隐私浏览中仍可正常完成。 */ }
}

function restoreProgress() {
  try {
    const data = JSON.parse(sessionStorage.getItem(storageKey));
    if(!data || !Array.isArray(data.answers) || data.answers.length!==questions.length) return;
    if(data.answers.some((a,i)=>a!==null && (!Number.isInteger(a)||a<0||a>=questions[i].options.length))) return;
    answers=data.answers;
    current=Number.isInteger(data.current)?Math.max(0,Math.min(questions.length-1,data.current)):0;
    if(answers.some(a=>a!==null)) $('start-button').firstElementChild.textContent='继续寻找';
  } catch { /* 损坏或禁用的本地存储不会阻止探索。 */ }
}

function showScreen(name) {
  for(const [key,screen] of Object.entries(screens)) screen.hidden=key!==name;
  document.body.dataset.screen=name;
  window.scrollTo({top:0,behavior:'instant'});
}

function focusQuestion() { $('question-title').focus({preventScroll:true}); }

function renderQuestion() {
  const question=questions[current];
  $('question-topic').textContent=question.topic;
  $('question-number').textContent=`${String(current+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;
  $('question-title').textContent=question.title;
  const answered=answers.filter(a=>a!==null).length;
  $('progress-fill').style.width=`${answered/questions.length*100}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow',String(answered));
  $('options').replaceChildren();
  question.options.forEach((option,index)=>{
    const label=document.createElement('label');label.className='option';
    const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=String(index);radio.checked=answers[current]===index;
    const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+index);letter.setAttribute('aria-hidden','true');
    const text=document.createElement('span');text.textContent=option.text;
    label.append(radio,letter,text);$('options').append(label);
    radio.addEventListener('change',()=>{
      answers[current]=index;saveProgress();updateNext();
      const completed=answers.filter(a=>a!==null).length;
      $('progress-fill').style.width=`${completed/questions.length*100}%`;
      document.querySelector('.progress-track').setAttribute('aria-valuenow',String(completed));
    });
  });
  $('back-button').lastElementChild.textContent=current===0?'返回首页':'上一题';
  updateNext();
}

function updateNext() {
  const button=$('next-button');button.disabled=answers[current]===null;
  button.replaceChildren(document.createTextNode(current===questions.length-1?'遇见同频灵魂 ':'下一题 '));
  const arrow=document.createElement('span');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');button.append(arrow);
}

function renderResult() {
  resultProfile=rankAnswers(answers)[0].profile;
  $('result-name').textContent=resultProfile.name;
  $('result-english').textContent=resultProfile.english;
  $('result-tags').replaceChildren(...resultProfile.tags.map(tag=>{const el=document.createElement('span');el.textContent=tag;return el;}));
  $('result-interpretation').textContent=resultProfile.interpretation;
  $('result-clue').textContent=resultProfile.clue;
  $('result-book').textContent=resultProfile.book;
  $('result-book-note').textContent=resultProfile.bookNote;
  $('result-source').href=resultProfile.source;
  $('result-card').dataset.profile=resultProfile.id;
  showScreen('result');$('result-name').focus({preventScroll:true});
}

$('start-button').addEventListener('click',()=>{
  if(answers.every(a=>a!==null)){renderResult();return;}
  current=answers.findIndex(a=>a===null);if(current<0) current=0;
  renderQuestion();showScreen('quiz');focusQuestion();saveProgress();
});

$('question-form').addEventListener('submit',event=>{
  event.preventDefault();if(answers[current]===null) return;
  if(current===questions.length-1){renderResult();return;}
  current++;saveProgress();renderQuestion();window.scrollTo({top:0,behavior:'instant'});focusQuestion();
});

$('back-button').addEventListener('click',()=>{
  if(current===0){goHome();return;}
  current--;saveProgress();renderQuestion();focusQuestion();
});

function goHome() {
  $('start-button').firstElementChild.textContent=answers.some(a=>a!==null)?'继续寻找':'开始寻找';
  showScreen('home');$('home-title').setAttribute('tabindex','-1');$('home-title').focus({preventScroll:true});
}
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();goHome();});

$('restart-button').addEventListener('click',()=>{
  answers=Array(questions.length).fill(null);current=0;resultProfile=null;saveProgress();renderQuestion();showScreen('quiz');focusQuestion();
});

function toast(text) {
  clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;
  toastTimer=setTimeout(()=>{$('toast').hidden=true;},3000);
}

$('copy-button').addEventListener('click',async()=>{
  if(!resultProfile) return;
  const text=`我的同频灵魂是${resultProfile.name}。\n${resultProfile.tags.join(' · ')}\n来「同频」寻找你的灵魂共鸣：${location.origin}${location.pathname}`;
  try {await navigator.clipboard.writeText(text);toast('已复制，分享这场灵魂相遇吧。');}
  catch {
    const fallback=document.createElement('textarea');fallback.value=text;fallback.setAttribute('aria-label','复制你的结果');fallback.style.cssText='position:fixed;left:20px;right:20px;bottom:20px;width:calc(100% - 40px);height:120px;z-index:20;padding:18px;border-radius:16px;background:white;color:#334d52;border:1px solid #9acabc;font:14px sans-serif';
    document.body.append(fallback);fallback.focus();fallback.select();
    toast('请长按或按 Ctrl+C 复制，点空白处收起。');
    fallback.addEventListener('blur',()=>fallback.remove(),{once:true});
  }
});

const about=$('about-dialog');
$('about-button').addEventListener('click',()=>about.showModal());
$('close-about').addEventListener('click',()=>about.close());
$('about-done').addEventListener('click',()=>about.close());
about.addEventListener('click',event=>{
  if(event.target!==about) return;
  const rect=about.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) about.close();
});

restoreProgress();
