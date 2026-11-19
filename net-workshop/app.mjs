import {playSuccess} from './media.mjs';
import {STAGES,TIERS,TIER_COLORS,STAGE_KEY,stageTier,readStages,stageOpen,mergeStage,stageRecordMessage} from './stage-game.mjs';
import {faceFoldPlan} from './direct-fold.mjs';
import {ChallengeClock,savedChallenge,clockText} from './challenge.mjs';
import {makeNet,CUBE_NETS,CROSS_NET,analyze,poses,corners,marks,opposite,key,foldAngles,findFoldSequence,intersections} from './geometry.mjs';
import {TYPES,grade,sameResponse} from './questions.mjs';
import {createScene,COLORS} from './scene.mjs';
import {BANK,CHAPTERS,getQuestion,questionCount,chapterFor,gridKey,parseGrid} from './curriculum.mjs';
import {PROGRESS_KEY,readProgress} from './progress.mjs';

const $=id=>document.getElementById(id),svg=$('net-svg'),scene=createScene($('scene'));
const nextButton=$('next'),nextHome=nextButton.parentNode;
const exploreTools=['#selected-view','#ghost','.view-settings','.fold-more'].map(selector=>{const node=document.querySelector(selector);return [node,node.parentNode];});
const exploreActions=['explore-action','explore-opposite'].map(id=>{const node=$(id);return [node,node.parentNode];});
const learningActions=[$('selection-note'),document.querySelector('.answer-actions')].map(node=>[node,node.parentNode]);
$('extra-tools-body').append($('hint'),document.querySelector('.fold-tools'),$('teacher-open'),$('help-open'),$('save-state'),$('explore-tools'),document.querySelector('.legend-help'));
const LABELS=['가','나','다','라','마','바'],NS='http://www.w3.org/2000/svg';
let mode='explore',net=makeNet(CROSS_NET),labels=LABELS,selected=null,progress=0,animation=0,sequence=[];
let q=null,qIndex=0,practice='course',assistance='auto',helped=false,attempts=0,solved=false,revealed=false,locked=false;
let explorerIndex=-1,dimensions=[1,1,1],createCells=[[0,0]],undoStack=[],session=[],records=[],diagnostic=null;
let freeMaker={cells:[[0,0]],undo:[]};
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motionPreference.matches,motionOverride=false,privateSession=false;
let pendingFaces=[];
let folding=false,lastSubmitted=null,exploreOpposite=false,journeyState='';
let pendingProgress=null,restoring=false,visitRecords=[],answerPreview=0,hintStage=0;
let challengeMode=true,challengeActive=false,challengeReading=false,stageAssisted=false;const challengeClock=new ChallengeClock();let challengeSaveSecond=-1;
function updateChallenge(){
 const running=challengeActive&&mode==='lesson'&&!solved&&!revealed&&!document.hidden&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('entrance-open')&&!document.body.classList.contains('course-finished');
 challengeClock.advance(performance.now(),running);
 $('challenge-status').hidden=!challengeActive||mode!=='lesson';
 const stage=STAGES.find(s=>practice==='bank:'+s.id);
 if(!stage)return;
 const remaining=Math.max(0,stage.limit*1000-challengeClock.elapsed-session.filter(r=>!r.correct).length*10000);
 const stageLabel=(STAGES.indexOf(stage)+1)+'단계',stageHeading=$('challenge-status').querySelector('b');if(stageHeading.textContent!==stageLabel)stageHeading.textContent=stageLabel;
 const shownTime=clockText(Math.ceil(remaining/1000)*1000);if($('challenge-clock').textContent!==shownTime)$('challenge-clock').textContent=shownTime;
 const clockState=remaining===0?'시간 끝 · 계속 풀어도 돼요':running?'남은 시간':'잠시 멈춤';
 if($('challenge-state').textContent!==clockState)$('challenge-state').textContent=clockState;
 $('challenge-status').classList.toggle('time-low',remaining>0&&remaining<=30000);
}
let penaltyAnimation=null;
function clearPenalty(){penaltyAnimation?.cancel();penaltyAnimation=null;clearTimeout(showPenalty.timer);$('time-penalty').textContent='';$('time-penalty').style.opacity='';}
function showPenalty(){
 const badge=$('time-penalty');badge.textContent='−10초';penaltyAnimation?.cancel();
 if(!reduced)penaltyAnimation=badge.animate([{opacity:1,transform:'translateY(6px)'},{opacity:1,offset:.65},{opacity:0,transform:'translateY(-10px)'}],{duration:1200,fill:'forwards'});
 else{badge.style.opacity='1';clearTimeout(showPenalty.timer);showPenalty.timer=setTimeout(()=>badge.style.opacity='0',1200);}
 updateChallenge();
}

const counting=()=>q?.type==='basics'&&['N006','N007','N008'].includes(q.id);
try{const saved=localStorage.getItem('net-workshop-reduced');if(saved==='true'||saved==='false'){reduced=saved==='true';motionOverride=true;}}catch{}
const isChosen=id=>Array.isArray(selected)?selected.includes(id):selected===id;
const canCheckAnswer=()=>!solved&&!revealed&&selected!==null&&(q?.type!=='build'||createCells.length===6)&&!sameResponse(selected,lastSubmitted);
const markerKind=()=>q?.type==='vertex'||q?.focusKind==='vertex'?'vertex':'edge';
const inputSeed=Number(new URL(location.href).searchParams.get('seed'));
let seed=Number.isInteger(inputSeed)&&inputSeed>0&&inputSeed<=999999?inputSeed:511;
try{const saved=JSON.parse(localStorage.getItem('net-workshop-v1')||'[]');if(Array.isArray(saved))records=saved.filter(r=>typeof r.id==='string'&&typeof r.correct==='boolean').slice(-500);}catch{$('save-state').textContent='저장 공간을 읽지 못했어요. 지금 활동은 계속할 수 있어요.';}
try{privateSession=localStorage.getItem('net-workshop-private')==='true';if(!privateSession)pendingProgress=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{}
let personalStages=Array(8).fill(null),visitStages=Array(8).fill(null);
try{personalStages=readStages(localStorage.getItem(STAGE_KEY));}catch{}
const oldCorrect=new Set(records.filter(r=>r.correct).map(r=>r.id));
CHAPTERS.forEach((c,i)=>{if(!personalStages[i]&&BANK.filter(q=>q.chapter===c.id).every(q=>oldCorrect.has(q.id)))personalStages[i]={complete:true,legacy:true,tier:null,seconds:null};});
const stageResults=()=>privateSession?visitStages:personalStages;
const stageIndex=()=>STAGES.findIndex(s=>practice==='bank:'+s.id);
$('private-session').checked=privateSession;
$('seed-input').value=seed;$('reduced').checked=reduced;
motionPreference.addEventListener('change',e=>{if(!motionOverride){reduced=e.matches;$('reduced').checked=reduced;}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveProgress(){
  if(restoring||privateSession||mode!=='lesson'||!q)return;
  try{
    if(document.body.classList.contains('course-finished')){localStorage.removeItem(PROGRESS_KEY);return;}
    localStorage.setItem(PROGRESS_KEY,JSON.stringify({version:1,challenge:challengeActive?{version:2,elapsed:challengeClock.elapsed,assisted:stageAssisted}:null,seed,index:qIndex,practice,assistance,answerPreview,hintStage,ghost:$('ghost').getAttribute('aria-pressed')==='true',selected,lastSubmitted,attempts,solved,revealed,helped,locked,progress,makerCells:q.type==='build'?createCells:null,viewModel:$('workbench').classList.contains('view-model'),session:session.slice(-500)}));
  }catch{$('save-state').textContent='진도를 저장하지 못했어요. 지금 활동은 계속할 수 있어요.';}
}
function canResumeChapter(id){return !privateSession&&pendingProgress?.practice===id;}
function showResume(){
  if(pendingProgress&&(!chapterFor(pendingProgress.practice)||!stageOpen(stageResults(),STAGES.findIndex(s=>pendingProgress.practice==='bank:'+s.id))))pendingProgress=null;
  $('resume-banner').hidden=!pendingProgress;
  if(!pendingProgress)return;
  const timed=!!savedChallenge(pendingProgress.challenge);$('resume-lesson').textContent='이어가기 →';$('fresh-lesson').textContent='처음부터';
  const {practice,index}=pendingProgress,count=questionCount(practice);
  $('resume-banner').querySelector('p').textContent=`${STAGES.findIndex(s=>practice==='bank:'+s.id)+1}단계 · ${index+1} / ${count}문제${pendingProgress.solved?' · 정답 확인 완료':''}`;
}
function resumeProgress(){
  const s=pendingProgress;if(!s||privateSession)return;restoring=true;pendingProgress=null;
  challengeMode=true;seed=s.seed;practice=s.practice;assistance=s.assistance;startMode('lesson');qIndex=s.index;loadQuestion();
  if(q.type==='build'){const saved=parseGrid(s.selected)??[];createCells=s.makerCells??[...q.initialCells,...saved.filter(p=>!q.initialCells.some(c=>key(c)===key(p)))];setNet(makeNet(createCells),q.labels);}
  else if(Array.isArray(s.selected))s.selected.forEach(choose);else if(s.selected!==null)choose(s.selected);
  ({selected,lastSubmitted,attempts,solved,revealed,helped,locked,session}=s);
  answerPreview=q.type==='complete'&&q.answerMode==='all'&&Number.isInteger(s.answerPreview)&&s.answerPreview>=0&&s.answerPreview<q.answers.length?s.answerPreview:0;
  hintStage=!solved&&!revealed&&Number.isInteger(s.hintStage)&&s.hintStage>=0&&s.hintStage<=2?s.hintStage:0;
  $('hint').textContent=hintStage===0?'힌트 보기':['edge','vertex'].includes(q.type)&&hintStage===1?'다음 힌트':'힌트 다시 보기';
  if(typeof s.ghost==='boolean')setGhost(s.ghost);
  if(counting())locked=false;
  if(revealed)prepareAnswerNet();renderNet();renderChoices();foldTo(solved?(counting()?1:0):s.progress,false);smallView(solved?counting():s.viewModel);
  $('check').disabled=!canCheckAnswer();$('check').hidden=solved||revealed;$('next').hidden=!(solved||revealed);$('hint').hidden=solved||revealed;
  if(solved||revealed)feedback(revealed?'설명과 함께 다시 배워요':attempts===1?'내 생각이 맞았어요!':'다시 살펴보고 찾았어요!',q.explanation,solved);
  else if(attempts)feedback('이어서 한 번 더 생각해 봐요',q.hint,false,retryControls());
  else if(helped)feedback('이어서 살펴봐요',q.hint,false,retryControls());
  $('selection-note').textContent=solved||revealed?'확인한 문제예요. 접힌 모습을 비교하고 다음으로 가요.':q.answerMode==='all'?`이어서 풀어요. ${selected?.length??0}곳 선택했어요. 가능한 자리를 모두 고른 뒤 확인해요.`:q.type==='build'?`이어서 만들어요. 지금 ${createCells.length} / 6 면이에요. 주어진 면은 그대로 두어요.`:selected===null?'이어서 풀어요. 답을 하나 골라요.':`고른 답과 접힌 모습을 그대로 불러왔어요. ${sameResponse(selected,lastSubmitted)?'다른 답을 골라 다시 생각해 봐요.':'생각을 확인해 보세요.'}`;
  if(q.type==='build'&&!solved&&!revealed&&createCells.length<6)$('selection-note').textContent=`이어서 만들어요. ${6-createCells.length}면을 더 놓으면 생각을 확인할 수 있어요.`;
  syncJourney();restoring=false;if(challengeActive){challengeClock.reset(savedChallenge(s.challenge)?.elapsed??0);stageAssisted=!!s.challenge?.assisted||s.challenge?.version!==2;}updateChallenge();saveProgress();
  if(canCheckAnswer()){
    challengeReading=false;updateChallenge();$('check').focus({preventScroll:true});
    if($('check').getBoundingClientRect().top<0||$('check').getBoundingClientRect().bottom>innerHeight)$('check').scrollIntoView({block:'nearest',behavior:'instant'});
  }else if(solved||revealed||attempts||helped){
    if(solved||revealed)$('instruction').textContent=solved?'정답을 확인했어요. ‘'+$('next').textContent+'’를 눌러요.':'설명을 보고 ‘'+$('next').textContent+'’를 눌러요.';
    (solved||revealed?nextButton:$('feedback')).focus({preventScroll:true});
    const resumeTarget=solved?nextButton:$('feedback');if(resumeTarget.getBoundingClientRect().top<0||resumeTarget.getBoundingClientRect().bottom>innerHeight)resumeTarget.scrollIntoView({block:'nearest',behavior:'instant'});
  }else focusActivity();
}
function feedback(title,text,good=false,extra=''){
  if(mode==='lesson'&&solved&&good&&!document.body.classList.contains('course-finished')){
    clearFeedback();const status=document.createElement('span');status.id='correct-status';status.setAttribute('role','status');status.textContent='✓ 정답';
    nextHome.prepend(status);nextHome.append(nextButton);return;
  }
  challengeReading=true;
  if(mode==='lesson'&&attempts&&!solved&&!revealed&&!extra)extra=retryControls();
  
  if(q?.paper&&(solved||revealed)&&!document.body.classList.contains('course-finished')){
    if(q.answerMode==='all')extra+=`<p>가능한 자리 ${q.answers.length}곳은 <b>한 면씩 따로 붙이는 서로 다른 방법</b>이에요.</p><p id="preview-caption">지금은 ${q.options.find(o=>o.id===q.answers[answerPreview]).label}번에 한 면을 붙인 모습이에요.</p><button class="secondary" data-action="preview-answer">다른 정답 접어 보기</button>`;
    extra+=`<p><a class="paper-link" href="./printables/question-nets.pdf#page=${q.paper.page}" target="_blank" rel="noopener">✂ ${q.paper.kind==='example'?'한 가지 완성 도안':'이 모양 도안'} · ${q.id} · ${q.paper.page}쪽</a></p>`;
  }
  if(q?.type==='length'&&(solved||revealed)&&!document.body.classList.contains('course-finished'))extra+=`<div class="length-comparison"><b>★ ${q.length} cm</b><span>접으면 만나요</span><b>＝ ${q.length} cm</b><button class="secondary" data-action="compare-length">펼쳐서 두 모서리 보기</button></div>`;
  nextHome.append(nextButton);
  $('feedback').hidden=false;$('feedback').className=`feedback${good?' good':''}${mode==='lesson'&&(attempts||helped)&&!solved&&!revealed?' retry-feedback':''}`;$('feedback').innerHTML=`<div class="feedback-heading"><strong><span class="feedback-symbol" aria-hidden="true">${good?'✓':'?'}</span>${esc(title)}</strong></div><p>${esc(text)}</p>${extra}`;
  if(mode==='lesson'&&(solved||revealed)&&!document.body.classList.contains('course-finished'))$('feedback').querySelector('.feedback-heading').append(nextButton);
}
function clearFeedback(){$('correct-status')?.remove();challengeReading=false;nextHome.append(nextButton);$('feedback').hidden=true;$('feedback').replaceChildren();}
function compactActivity(){return matchMedia('(max-width:900px)').matches||(mode==='lesson'&&matchMedia('(max-width:1366px)').matches);}
function smallView(model,bringIntoView=false){if(mode==='explore'&&document.body.classList.contains('direct-fold'))return;document.body.classList.toggle('counting-question',mode==='lesson'&&counting());$('workbench').classList.toggle('view-model',model);$('show-net').setAttribute('aria-pressed',String(!model));$('show-model').setAttribute('aria-pressed',String(model));if(bringIntoView&&compactActivity())document.querySelector(model?(mode==='explore'?'#net-context':'.scene-wrap'):'#net-wrap').scrollIntoView({block:mode==='explore'&&model?'start':'center',behavior:'instant'});}
function returnToAnswers(){challengeReading=false;if(mode==='lesson'&&!attempts&&!solved&&!revealed)clearFeedback();if(mode==='create'){diagnostic=null;if(progress>0)foldTo(0,false);clearFeedback();renderGrid();if(createCells.length===6){$('instruction').textContent='바꿀 면을 눌러 지운 뒤, ＋를 눌러 다른 자리에 놓아요.';$('selection-note').textContent='바꿀 면을 톡 눌러 지워요. 새 자리에 놓은 뒤 다시 접어 보세요.';}}smallView(false,true);const numberButtons=mode==='lesson'&&!solved&&!revealed&&['edge','vertex'].includes(q?.type)&&compactActivity();const target=(numberButtons?$('choices').querySelector('button[aria-pressed=true]:not(:disabled)')??$('choices').querySelector('button:not(:disabled)'):null)??svg.querySelector('[aria-pressed=true]:not([aria-disabled=true])')??svg.querySelector('[data-action]:not([aria-disabled=true])')??$('choices').querySelector('button:not(:disabled)')??$('net-title');target.focus({preventScroll:true});if(target.namespaceURI!==NS)(numberButtons?$('choices'):target).scrollIntoView({block:'nearest',behavior:'instant'});}
function focusActivity(){if(mode==='path'&&!$('resume-banner').hidden){$('resume-lesson').focus({preventScroll:true});$('resume-banner').scrollIntoView({block:'start',behavior:'instant'});return;}const heading=$(mode==='path'?'path-title':'task-title');const entry=mode==='create'&&compactActivity()?(innerHeight<550?svg.querySelector('[data-action=cell]'):$('learning-controls')):heading;entry.focus({preventScroll:true});if(compactActivity()&&!document.body.classList.contains('course-finished')){const target=mode==='create'?$('learning-controls'):heading;target.scrollIntoView({block:'start',behavior:'instant'});if(mode==='create'&&innerHeight<550)$('net-wrap').scrollIntoView({block:'center',behavior:'instant'});}}
function showActionIfBelow(id){const action=$(id);if(action&&!restoring&&!action.hidden&&!action.disabled&&compactActivity()&&(action.getBoundingClientRect().top<0||action.getBoundingClientRect().bottom>innerHeight))action.scrollIntoView({block:'nearest',behavior:'instant'});}
function retryControls(){return `<div class="row"><button class="secondary" data-action="choose-again">답 다시 고르기</button>${!net.connected||net.cycle?'<span class="muted">이 모양은 펼친 종이에서 연결된 부분을 살펴봐요.</span>':`<button class="secondary" data-action="fold-help">${progress>.999?'펼쳐서 다시 살펴보기':'한 면씩 접기'}</button>`}${attempts>=2&&!challengeActive?'<button class="secondary" data-action="reveal">설명과 정답 보기</button>':''}</div>`;}
function cloneNet(prefix){
  const copy=svg.cloneNode(true);copy.removeAttribute('id');
  // Hidden originals must not own the paint definitions of the visible mini-net or print copy.
  copy.querySelectorAll('[id]').forEach(e=>e.id=`${prefix}-${e.id}`);
  copy.querySelectorAll('[fill],[filter]').forEach(e=>{for(const attr of ['fill','filter']){const value=e.getAttribute(attr);if(value?.startsWith('url(#'))e.setAttribute(attr,value.replace('url(#',`url(#${prefix}-`));}});
  return copy;
}
function syncContext(){
  const inlineFold=mode==='explore'&&document.body.classList.contains('direct-fold');
  svg.setAttribute('aria-hidden',String(inlineFold));
  if(inlineFold)svg.querySelectorAll('[tabindex]').forEach(e=>e.setAttribute('tabindex','-1'));
  if(mode!=='explore')$('face-taps').replaceChildren();
  if(mode==='explore')labels.forEach((label,i)=>{
    const button=$('face-taps').querySelector('[data-value="'+i+'"]')??document.createElement('button');
    if(!button.firstChild)button.append(document.createTextNode(label));else button.firstChild.nodeValue=label;
    button.disabled=i===net.root;button.dataset.action='choose';button.dataset.value=String(i);
    const link=net.links.findIndex(l=>l.child===i),folded=link>=0&&foldAngles(net,progress,sequence)[link]>.999;
    const state=button.querySelector('small')??document.createElement('small');state.textContent=i===net.root?'고정':folded?'펼치기':'접기';state.setAttribute('aria-hidden','true');if(!state.parentNode)button.append(state);
    button.setAttribute('aria-pressed',String(folded));button.setAttribute('aria-label',label+' 면 '+(i===net.root?'고정':folded?'펼치기':'접기'));
    if(!button.parentNode)$('face-taps').append(button);
  });

  if(mode==='explore'&&!$('face-taps').querySelector('[data-action=reset-camera]')){const reset=document.createElement('button');reset.className='quiet';reset.dataset.action='reset-camera';reset.innerHTML='↺<small>처음 방향</small>';reset.setAttribute('aria-label','처음 방향으로 보기. 접힌 상태는 유지해요.');$('face-taps').append(reset);}
  const faceMarks=markerItems().filter(m=>m.kind==='face');$('face-marker-key').hidden=faceMarks.length===0;$('face-marker-key').textContent=mode==='explore'?'푸른 테두리와 금빛 테두리의 면이 마주 봐요.':'종이의 ★는 입체에서 푸른 테두리 면이에요.';
  $('context-back').textContent=mode==='create'?'펼쳐서 고쳐 만들기':solved||revealed?'펼쳐서 비교':q?.type==='build'?'계속 만들기':'답 고르기';
  const copy=cloneNet('mini');copy.removeAttribute('aria-label');
  if(svg.dataset.contentBox)copy.setAttribute('viewBox',svg.dataset.contentBox);
  if(q?.type==='complete'&&(solved||revealed)){
    const shown=q.answerMode==='all'?q.answers[answerPreview]:selected;
    copy.querySelectorAll('[data-action=choose]').forEach(g=>{if(g.dataset.value!==shown)g.remove();else{g.querySelector('rect')?.setAttribute('fill','#edd0a5');const label=g.querySelector('text');if(label){label.textContent='새';label.style.fill='#303236';}}});
  }
  if(q?.marks)copy.querySelectorAll('[data-action="choose"]').forEach(e=>{if(e.dataset.value!==selected)e.remove();});
  if(mode!=='explore')copy.querySelectorAll('[data-action]').forEach(e=>{['tabindex','role','data-action','data-value','aria-label'].forEach(a=>e.removeAttribute(a));});
  $('mini-net').replaceChildren(copy);$('mini-net').setAttribute('aria-hidden',String(mode!=='explore'));
  const option=q?.options?.find(o=>o.id===selected);
  $('selected-view').textContent=q?.type==='edge'?'고른 모서리의 면':q?.type==='vertex'?'고른 꼭짓점의 면':'고른 면 보기';
  $('selected-view').setAttribute('aria-label',q?.type==='edge'?'고른 모서리가 있는 면을 정면으로 보기':q?.type==='vertex'?'고른 꼭짓점이 있는 면을 정면으로 보기':'고른 면을 정면으로 보기');
  $('selected-view').hidden=selected===null||mode!=='explore'&&!['opposite','edge','vertex'].includes(q?.type);
  $('context-label').textContent=mode==='explore'?(selected===null?(progress>.999?'면을 누르면 다시 펼쳐져요.':'접고 싶은 면을 눌러 보세요.'):`${labels[Number(selected)]} 면을 다시 누르면 ${foldAngles(net,progress,sequence)[net.links.findIndex(l=>l.child===Number(selected))]>.999?'펼쳐져요':'접혀요'}.`):option?`내가 고른 답: ${['edge','vertex','complete'].includes(q.type)?option.label+'번':option.label}`:'펼친 종이와 같은 글자·표시를 찾아요.';
  if(q?.answerMode==='all'&&(solved||revealed))$('context-label').textContent=`지금은 ${q.options.find(o=>o.id===q.answers[answerPreview]).label}번에 한 면을 붙였어요.`;
}
function syncJourney(){
  const stage=mode==='explore'?(progress>.999?2:selected!==null?1:0):mode==='lesson'?(solved||revealed?2:q?.type==='build'?(createCells.length===6?1:0):selected!==null?1:0):diagnostic?.valid?2:createCells.length===6?1:0;
  const folded=Math.floor(progress*net.links.length+.00001);
  const state=[mode,stage,selected,folding,progress>0,folded,net.root,labels.join('')].join('|');if(state===journeyState)return;journeyState=state;
  $('path-fold').lastChild.textContent=mode==='lesson'?' 생각 확인':' 접어 보기';
  $('path-pick').lastChild.textContent=q?.type==='build'||mode==='create'?' 톡, 면 놓기':q?.answerMode==='all'?' 모두 고르기':' 톡, 고르기';
  $('path-find').lastChild.textContent=mode==='lesson'?' 접어서 비교':' 생각 확인';
  ['path-pick','path-fold','path-find'].forEach((id,i)=>{if(i===stage)$(id).setAttribute('aria-current','step');else $(id).removeAttribute('aria-current');$(id).classList.toggle('done',i<stage);});
  $('explore-action').hidden=mode!=='explore';$('explore-opposite').hidden=true;
  if(mode!=='explore')return;
  $('explore-action').disabled=folding;
  $('explore-action').textContent=folding?'움직이는 중…':progress>.999?'모두 펼치기':'모두 접기';
  $('task-title').textContent='면을 톡, 접어 보세요';
  $('instruction').textContent='면을 누르면 접혀요. 다시 누르면 펼쳐져요. 고정된 면은 움직이지 않아요.';
  $('explore-cue').textContent=folding?'연결된 면이 함께 움직이는 모습을 보세요.':progress>.999?'상자 완성! 면을 다시 누르면 펼쳐져요.':'종이의 면을 눌러 하나씩 접어 보세요.';
  $('selection-note').textContent=selected===null?'접고 싶은 면을 눌러요':labels[Number(selected)]+' 면 · '+folded+' / '+net.links.length+' 접힘';
  const preview=false;
  $('model-title').textContent=preview||progress>.999?'완성 모양':progress===0?'펼친 모습':'접히는 모습';
  if(preview){scene.update(1,null,[]);$('fold-stage').textContent='이런 상자가 돼요. 면을 고르면 시작해요.';}
}
function setGhost(on){$('ghost').textContent=on?'속 보기 켜짐':'속 보기 꺼짐';$('ghost').setAttribute('aria-pressed',String(on));scene.transparent(on);}
function selectedFace(){if(mode==='explore')return selected===null?null:Number(selected);if(q?.type==='opposite'&&selected!==null)return Number(selected);return null;}
function markerItems(){
  if(mode==='explore'&&selected!==null&&exploreOpposite)return [{face:Number(selected),kind:'face',target:true,text:'①'},{face:opposite(net,Number(selected)),kind:'face',target:false,text:'②'}];
  if(q?.type==='opposite'||q?.focusKind==='face')return [{face:q.target,kind:'face',target:true,text:'★'}];
  if(!q?.marks)return [];
  const result=[],target=q.marks.find(m=>m.id===q.target),choice=q.options.find(o=>o.id===selected);
  if(target)result.push({...target,kind:markerKind(),target:true,text:'★'});
  if(q.type==='length'&&(solved||revealed)){
    const mate=q.marks.find(m=>m.id!==target.id&&m.foldedKey===target.foldedKey);
    if(mate&&progress<.98)result.push({...mate,kind:'edge',target:false,text:'＝'});
    else if(mate)result[0].text='★＝';
  }
  if(choice?.mark){if(progress>.98&&choice.mark.foldedKey===target.foldedKey)result[0].text=`★${choice.label}`;else result.push({...choice.mark,kind:q.type,target:false,text:choice.label});}return result;
}
function foldTo(value,animate=true,faceAction=false){
  if(!faceAction)pendingFaces=[];
  cancelAnimationFrame(animation);folding=false;const target=Math.max(0,Math.min(1,value));
  if(locked)return;
  if(mode==='lesson'&&!attempts&&target>0)helped=true;
  if(!net.connected||net.cycle){if(!solved)feedback('먼저 종이 모양을 살펴봐요',analyze(net).message);if(solved||revealed)showActionIfBelow('next');return;}
  const finishAction=()=>{if(target!==1||!(solved||revealed||diagnostic))return;if(innerHeight<550&&compactActivity()){$('fold-stage').textContent=mode==='create'?'아래로 내려 ‘펼쳐서 고쳐 만들기’를 눌러요.':'아래로 내려 ‘다음 문제’를 눌러요.';}else showActionIfBelow(mode==='create'?'edit-maker':'next');};
  const start=progress,t0=performance.now(),duration=reduced||!animate?0:Math.max(450,Math.abs(target-start)*2400);
  const frame=now=>{
    const t=duration?Math.min(1,(now-t0)/duration):1;const next=start+(target-start)*(t*t*(3-2*t));
    if(target>start&&intersections(net,foldAngles(net,next,sequence)).length){
      folding=false;
      if(!solved&&!revealed)feedback('여기에서 두 면이 겹쳐요','종이는 서로 통과할 수 없어요. 펼친 종이에서 같은 자리를 덮는 면을 찾아 보세요.',false,mode==='create'?'<button class="secondary" id="edit-maker" data-action="edit-maker">펼쳐서 고쳐 만들기</button>':'');updateFoldControls();$('fold-stage').textContent='두 면이 겹치기 전에 멈췄어요';saveProgress();finishAction();return;
    }
    progress=next;folding=t<1;scene.update(progress,selectedFace(),markerItems());updateFoldControls();if(t<1)animation=requestAnimationFrame(frame);else{if(hintStage>1||mode==='explore')renderNet();saveProgress();finishAction();if(mode==='explore'&&pendingFaces.length)tapFace(pendingFaces.shift());}
  };frame(t0);
}
function inspectFold(target=1){
  if(folding)return;
  if(mode==='create'){check();return;}
  if(mode==='lesson'&&target>0&&(solved||revealed))prepareAnswerNet();
  locked=false;
  smallView(true);
  updateFoldControls();
  foldTo(target);
  saveProgress();
}
function updateFoldControls(){
  $('model-fold').hidden=mode!=='lesson';
  $('model-fold').disabled=folding;
  $('model-fold').textContent=folding?'움직이는 중…':progress>.001?'다시 펼치기':'접어 보기';
  scene.setBusy(mode==='explore'?pendingFaces.length>=8:folding);
  if(mode==='explore'){$('face-taps').setAttribute('aria-busy',String(folding));$('face-taps').querySelectorAll('[data-action=choose]').forEach(b=>{const face=Number(b.dataset.value),waiting=pendingFaces.filter(f=>f===face).length;b.disabled=pendingFaces.length>=8||face===net.root;const state=b.querySelector('small');if(state)state.textContent=waiting?'대기 '+waiting:face===net.root?'고정':foldAngles(net,progress,sequence)[net.links.findIndex(l=>l.child===face)]>.999?'펼치기':'접기';b.setAttribute('aria-label',labels[face]+' 면 '+(waiting?'접기·펼치기 '+waiting+'회 대기':state?.textContent??''));});}
  if(mode==='lesson'&&q&&!document.body.classList.contains('course-finished'))$('chapter').textContent=`${chapterFor(practice)?.title??TYPES[q.type]} · ${locked?'먼저 예상해요':solved||revealed?'접어서 비교해요':helped?'도움을 받아 살펴봐요':'접으며 알아봐요'}`;
  $('fold-range').value=Math.round(progress*100);
  $('fold-range').style.setProperty('--fold',`${Math.round(progress*100)}%`);
  $('fold-range').setAttribute('aria-valuetext',progress<.001?'활짝 펼침':progress>.999?'모두 접힘':`${Math.round(progress*100)}% 접힘`);
  document.body.dataset.locked=String(locked);
  const count=net.links.length;
  $('fold-stage').textContent=progress<.001?'종이가 활짝 펼쳐져 있어요':progress>.999?(net.faces.length===6?'접힌 모습을 여러 방향에서 살펴봐요':`${6-net.faces.length}면이 부족해요. 빈자리를 찾아요`):`${Math.min(count,Math.floor(progress*count)+1)}번째 접는 선을 따라 움직여요`;
  if(!net.connected||net.cycle)$('fold-stage').textContent=net.cycle?'네 면이 둘러 붙어 접을 수 없어요.':'면이 떨어져 있어 함께 접을 수 없어요.';
  $('step-fold').textContent=progress>.999?'모두 접었어요 ✓':'한 면 접기 ↗';
  ['unfold','step-fold','play-fold','fold-range'].forEach(id=>$(id).disabled=locked||!net.connected||net.cycle||!count||mode==='explore'&&selected===null);
  $('unfold').disabled||=progress<.001;
  $('step-fold').disabled||=progress>.999||folding;$('play-fold').disabled||=folding||progress>.999;
  $('play-fold').textContent=progress>.999?'모두 접었어요 ✓':'모두 접기';
  $('model-cover').hidden=!locked;
  const active=sequence[Math.min(sequence.length-1,Math.floor(progress*sequence.length+.00001))];
  document.querySelectorAll('#net-svg [data-hinge],#mini-net [data-hinge]').forEach(line=>line.classList.toggle('active-hinge',folding&&Number(line.dataset.hinge)===active));
  document.querySelectorAll('[data-action=fold-help]').forEach(b=>{b.textContent=progress>.999?'펼쳐서 다시 살펴보기':'한 면씩 접기';b.disabled=folding;});
  syncJourney();
}
function zoomCamera(delta){const level=scene.zoom(delta);$('zoom-in').disabled=!Number.isFinite(level)||level>=1.14/1.1;$('zoom-out').disabled=!Number.isFinite(level)||level<=.65;$('zoom-in').title=$('zoom-in').disabled?'도형 전체가 보이는 최대 크기예요.':'상자 크게 보기';$('zoom-out').title=$('zoom-out').disabled?'가장 작은 크기예요.':'상자 작게 보기';}
function setNet(next,nextLabels=labels){pendingFaces=[];next.monochrome=!!q?.monochrome;cancelAnimationFrame(animation);folding=false;net=next;labels=nextLabels;progress=0;sequence=net.connected&&!net.cycle?(findFoldSequence(net)??net.links.map((_,i)=>i)):[];scene.setNet(net,labels);scene.reset();zoomCamera(0);updateFoldControls();}
function element(tag,attrs,text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs||{}))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;}
function distanceToSegment(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-t*dx,y-ay-t*dy);}
function svgButton(parent,attrs,aria,action,value){const g=element('g',{...attrs,role:'button',tabindex:solved||revealed?-1:0,'aria-label':aria,'data-action':action,'data-value':value,class:`hit ${attrs?.class||''}`});if(solved||revealed)g.setAttribute('aria-disabled','true');if(action==='choose')g.setAttribute('aria-pressed',String(mode==='explore'?foldAngles(net,progress,sequence)[net.links.findIndex(l=>l.child===Number(value))]>.999:isChosen(value)));parent.append(g);return g;}
function renderNet(){
  svg.replaceChildren();
  $('fixed-face-key').hidden=mode!=='lesson'||q?.type==='build';
  $('fixed-face-key').textContent=`고정 면: ${labels[net.root]}`;
  svg.setAttribute('aria-label',['basics','valid','length'].includes(q?.type)?'관찰할 전개도. 도형을 살펴본 뒤 답 버튼에서 골라요.':q?.type==='complete'?'전개도. 번호가 있는 빈자리를 눌러 골라요.':'전개도. 면이나 숫자가 붙은 곳을 눌러 선택해요.');
  if(mode==='create'||q?.type==='build'){renderGrid();return;}
  svg.setAttribute('viewBox','0 0 600 400');
  const display=q?.type==='complete'?q.net:net;
  if(!display.connected){syncContext();return;}
  const frames=poses(display,0),pts=display.faces.flatMap((f,i)=>corners(f,frames[i]));
  const candidatePoints=q?.type==='complete'?q.options.flatMap(o=>{const root=q.cells[display.root];return [[o.cell[0]-root[0]-.5,o.cell[1]-root[1]-.5,0],[o.cell[0]-root[0]+.5,o.cell[1]-root[1]+.5,0]];}):[];
  const all=[...pts,...candidatePoints],xmin=Math.min(...all.map(p=>p[0])),xmax=Math.max(...all.map(p=>p[0])),ymin=Math.min(...all.map(p=>p[1])),ymax=Math.max(...all.map(p=>p[1]));
  const scale=Math.min(490/(xmax-xmin),300/(ymax-ymin)),ox=300-(xmin+xmax)*scale/2,oy=200+(ymin+ymax)*scale/2;
  const padding=mode==='explore'?8:q?.marks?76:q?.type==='complete'?12:24;
  svg.dataset.contentBox=[300-(xmax-xmin)*scale/2-padding,200-(ymax-ymin)*scale/2-padding,(xmax-xmin)*scale+padding*2,(ymax-ymin)*scale+padding*2].join(' ');
  svg.setAttribute('viewBox',svg.dataset.contentBox);
  const defs=element('defs');defs.innerHTML='<filter id="paper-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" seed="17" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".06"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter><linearGradient id="paper-light" x2=".7" y2="1"><stop stop-color="#fff9ee"/><stop offset="1" stop-color="#e8dfd0"/></linearGradient><linearGradient id="paper-gold" x2=".7" y2="1"><stop stop-color="#ffdc9f"/><stop offset="1" stop-color="#e5ae65"/></linearGradient>';svg.append(defs);
  const xy=p=>[ox+p[0]*scale,oy-p[1]*scale];
  const group=element('g');svg.append(group);
  display.faces.forEach((f,i)=>{
    const [x,y]=xy(frames[i].c),w=f.w*scale,h=f.h*scale,isTarget=(q?.type==='opposite'||q?.focusKind==='face')&&q.target===i,isSelected=selectedFace()===i;
    const canSelect=mode==='explore'&&i!==display.root||q?.type==='opposite'&&i!==q.target;
    const g=canSelect?svgButton(group,{class:'face'},`${labels[i]} 면 ${mode==='explore'?(foldAngles(net,progress,sequence)[net.links.findIndex(l=>l.child===i)]>.999?'펼치기':'접기'):'선택'}`,'choose',String(i)):element('g');if(!canSelect)group.append(g);
    g.append(element('rect',{class:'paper-face',x:x-w/2,y:y-h/2,width:w,height:h,fill:isSelected?'url(#paper-gold)':isTarget?'#efe0c5':q?.monochrome?'#e9e7e1':'url(#paper-light)',stroke:isSelected?'#bc8a4e':isTarget?'#303236':'none','stroke-width':isSelected?3:isTarget?5:0,rx:1,filter:'url(#paper-grain)'}));
    g.append(element('text',{x,y,'dominant-baseline':'central','text-anchor':'middle','font-size':Math.max(mode==='lesson'?22:16,Math.min(mode==='explore'?40:30,scale*(mode==='explore'?.40:.32)))},labels[i]));
    if(isSelected){
      g.append(element('rect',{class:'selected-outline',x:x-w/2+4,y:y-h/2+4,width:w-8,height:h-8,rx:2,fill:'none',stroke:'#8e5e27','stroke-width':1.5,'pointer-events':'none'}));
      g.append(element('circle',{cx:x+w/2-16,cy:y-h/2+17,r:10,fill:'#65503a','pointer-events':'none'}));
      const tick=element('text',{x:x+w/2-16,y:y-h/2+22,'font-size':14,'text-anchor':'middle'},'✓');tick.style.fill='#fff5e4';g.append(tick);
    }
    if(mode==='explore'&&i!==display.root&&foldAngles(net,progress,sequence)[net.links.findIndex(l=>l.child===i)]>.999)g.append(element('text',{class:'folded-label',x,y:y+h/2-7,'text-anchor':'middle','font-size':17},'접힘'));
    if(isTarget){g.append(element('text',{x,y:y-h*.25,'font-size':19,'text-anchor':'middle'},'★'));}
    if((hintStage||q?.type==='length')&&q?.marks?.find(m=>m.id===q.target)?.face===i)g.append(element('rect',{class:'hint-face',x:x-w/2+3,y:y-h/2+3,width:w-6,height:h-6,fill:'#e6bf8726',stroke:'#996321','stroke-width':4,'pointer-events':'none'}));
    if(i===display.root){if(mode!=='explore')g.append(element('rect',{x:x-w/2+5,y:y-h/2+5,width:w-10,height:h-10,fill:'none',stroke:'#5b554c','stroke-width':1.4,'stroke-dasharray':'3 3','pointer-events':'none'}));if(mode!=='lesson')g.append(element('text',{class:'fixed-label',x,y:y+h/2-6,'text-anchor':'middle','font-size':mode==='explore'?10:14},'고정'));}
  });
  marks(display,'edge').forEach(m=>{const [a,b]=m.flatEnds.map(xy),line=element('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:m.refs.length>1?'#57514a':'#fff7e8','stroke-width':m.refs.length>1?1:1.1,'stroke-dasharray':m.refs.length>1?'5 4':'none','pointer-events':'none'});if(mode==='explore'&&m.refs.length===2){const faces=m.refs.map(r=>r.face),index=net.links.findIndex(l=>faces.includes(l.parent)&&faces.includes(l.child));if(index>=0)line.dataset.hinge=index;}group.append(line);});
  if(q?.type==='valid'&&(solved||revealed)){const result=analyze(display);
    if(result.reason==='cycle')for(const m of marks(display,'vertex').filter(m=>m.refs.length>=4)){const [x,y]=xy(m.flat);group.append(element('circle',{cx:x,cy:y,r:18,fill:'#f2d4a8',stroke:'#885022','stroke-width':3}));group.append(element('text',{x,y:y+6,'font-size':19,'text-anchor':'middle'},'!'));}
    if(result.pair)result.pair.forEach(i=>{const f=display.faces[i],[x,y]=xy(frames[i].c);group.append(element('rect',{x:x-f.w*scale/2+3,y:y-f.h*scale/2+3,width:f.w*scale-6,height:f.h*scale-6,fill:'none',stroke:'#a84d36','stroke-width':5}));});
  }
  if(q?.type==='complete'){
    const root=q.cells[display.root];q.options.forEach(o=>{const [x,y]=xy([o.cell[0]-root[0],o.cell[1]-root[1],0]),g=svgButton(group,{},`${o.label}번 빈칸 선택`,'choose',o.id);
      g.append(element('rect',{x:x-scale/2+4,y:y-scale/2+4,width:scale-8,height:scale-8,fill:isChosen(o.id)&&q.answerMode!=='all'?'#e6bf87':'#303236',stroke:isChosen(o.id)?'#a9762f':'#8a8276','stroke-width':isChosen(o.id)?3:1.5,'stroke-dasharray':isChosen(o.id)?'none':'5 4',rx:7,class:'hit-bg'}));
      const label=element('text',{x,y:y+8,'text-anchor':'middle','font-size':24},String(o.label));label.style.fill=isChosen(o.id)&&q.answerMode!=='all'?'#303236':'#f2eee7';g.append(label);
    });
  }
  if(q?.marks){
    const target=q.marks.find(m=>m.id===q.target),items=[{...target,text:'★',target:true},...q.options.filter(o=>o.mark).map(o=>({...o.mark,text:o.label,choiceId:o.id}))];
    if(q.type==='length'&&(solved||revealed)){const mate=q.marks.find(m=>m.id!==target.id&&m.foldedKey===target.foldedKey);if(mate)items.push({...mate,text:'＝',comparison:true});}
    const markerPositions=[];
    for(const m of items){
      const [px,py]=xy(m.flat),face=frames[m.face].c;
      const center=markerKind()==='vertex'&&m.refs?.length?m.refs.reduce((c,r)=>c.map((v,i)=>v+frames[r.face].c[i]/m.refs.length),[0,0,0]):face;
      let dx=m.flat[0]-center[0],dy=-(m.flat[1]-center[1]),len=Math.hypot(dx,dy);if(!len){dy=-1;len=1;}
      let x=px+dx/len*40,y=py+dy/len*40,best=Infinity;
      // Separate badges and keep their connecting lines clear of earlier badges.
      for(let offset=40;offset<=274;offset+=26)for(const side of [0,52,-52,104,-104]){
        const nx=px+(dx*offset-dy*side)/len,ny=py+(dy*offset+dx*side)/len;
        const score=offset-40+Math.abs(side)+markerPositions.reduce((sum,p)=>sum+(Math.hypot(nx-p.x,ny-p.y)<52?1000000:0)+(distanceToSegment(p.x,p.y,px,py,nx,ny)<29?10000:0)+(distanceToSegment(nx,ny,p.px,p.py,p.x,p.y)<29?10000:0),0);
        if(score<best){best=score;x=nx;y=ny;}
      }
      if(q.focusKind==='hinge'){x=px;y=py;}
      markerPositions.push({x,y,px,py,width:q.type==='length'&&m.target?48:23});
      const g=m.target||m.comparison?element('g'):svgButton(group,{},`${m.text}번 ${markerKind()==='vertex'?'꼭짓점':'모서리'} 선택`,'choose',m.choiceId);if(m.target||m.comparison)group.append(g);
      const chosen=m.comparison||isChosen(m.choiceId);
      if(m.flatEnds){const [a,b]=m.flatEnds.map(xy);for(const [stroke,width]of [['#fff8e9',10],[m.target?'#4c3821':chosen?'#a9762f':'#6f706d',5]])g.append(element('line',{class:'marked-edge',x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke,'stroke-width':width,'stroke-linecap':'round','stroke-dasharray':q?.focusKind==='hinge'?'8 7':'none'}));}
      g.append(element('line',{x1:px,y1:py,x2:x,y2:y,stroke:'#dfc49b','stroke-width':2,'pointer-events':'none'}));
      if(markerKind()==='vertex')g.append(element('circle',{class:'exact-vertex',cx:px,cy:py,r:5,fill:'#4c3821',stroke:'#fff8e9','stroke-width':2}));
      const unknown=q.type==='length'&&m.target;
      g.append(element(unknown?'rect':'circle',unknown?{x:x-48,y:y-22,width:96,height:44,rx:12,fill:'#303236',stroke:'#efd0a3','stroke-width':2}:{cx:x,cy:y,r:23,fill:m.target?'#303236':chosen?'#e6bf87':'#f2eee7',stroke:m.target?'#efd0a3':chosen?'#9b6c2b':'#777a7d','stroke-width':2,class:'hit-bg'}));
      const t=element('text',{x,y:y+7,'text-anchor':'middle','font-size':unknown?20:22},unknown?'★ ? cm':m.text);if(m.target)t.style.fill='white';g.append(t);
    }
    const box=svg.dataset.contentBox.split(' ').map(Number),left=Math.min(box[0],...markerPositions.map(p=>p.x-p.width-6)),top=Math.min(box[1],...markerPositions.map(p=>p.y-29)),right=Math.max(box[0]+box[2],...markerPositions.map(p=>p.x+p.width+6)),bottom=Math.max(box[1]+box[3],...markerPositions.map(p=>p.y+29));
    svg.dataset.contentBox=[left,top,right-left,bottom-top].join(' ');svg.setAttribute('viewBox',svg.dataset.contentBox);

  }
  if(hintStage>1&&q?.marks&&progress<.999){
    const link=net.links[sequence[Math.min(sequence.length-1,Math.floor(progress*sequence.length+.001))]];
    if(link){const hinge=marks(display,'edge').find(m=>m.refs.some(r=>r.face===link.parent)&&m.refs.some(r=>r.face===link.child));if(hinge){const [a,b]=hinge.flatEnds.map(xy);group.append(element('line',{class:'hint-hinge',x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'#b77b2c','stroke-width':7,'stroke-dasharray':'9 5','pointer-events':'none'}));}}
  }
  syncContext();
}
function reasonIcon(id){
  const shapes={valid:'<path d="M8 14 24 5 40 14 40 33 24 42 8 33Z M8 14 24 23 40 14 M24 23V42"/>',overlap:'<rect x="7" y="7" width="23" height="23"/><rect x="18" y="18" width="23" height="23" fill="currentColor" fill-opacity=".3"/>',cycle:'<path d="M6 6H42V42H6Z M24 6V42 M6 24H42"/><circle cx="24" cy="24" r="4" fill="currentColor"/>',count:'<path d="M18 5H30V17H42V29H30V41H18V29H6V17H18Z M18 17H30V29H18Z"/>'};
  return `<svg class="reason-icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">${shapes[id]??''}</svg>`;
}
function renderChoices(){
  const sheet=document.querySelector('.sheet-panel');
  sheet.append($('choices'));
  if(mode==='create'||q?.type==='build'){renderGrid();return;}
  $('choices').replaceChildren();
  if(!solved&&!revealed&&['edge','vertex'].includes(q?.type)){const guide=document.createElement('div');guide.className='choice-guide';guide.textContent='그림의 번호와 같은 버튼을 눌러요.';$('choices').append(guide);}
  if(q?.type==='length'){
    const target=q.marks.find(m=>m.id===q.target),f=q.net.faces[target.face],scale=Math.min(130/f.w,85/f.h),w=f.w*scale,h=f.h*scale,cx=140,cy=95;
    const guide=document.createElement('div');guide.className='length-detail';guide.innerHTML=`<b>${esc(q.labels[target.face])} 면을 크게 보아요 · ★ 길이 찾기</b>`;
    const detail=element('svg',{viewBox:'0 0 280 190',role:'img','aria-label':`${q.labels[target.face]} 면의 알려 준 두 변과 구할 변 확대`});guide.append(detail);
    detail.append(element('rect',{x:cx-w/2,y:cy-h/2,width:w,height:h,rx:2,fill:'#eee9df',stroke:'#bca989'}));
    const faceLabel=element('text',{x:cx,y:cy+6,'text-anchor':'middle','font-size':19,fill:'#303236'},q.labels[target.face]);detail.append(faceLabel);
    const points=corners(f,poses(q.net,0)[target.face]),center=poses(q.net,0)[target.face].c,xy=p=>[cx+(p[0]-center[0])*scale,cy-(p[1]-center[1])*scale];
    for(const side of [target.corner,(target.corner+2)%4,target.corner%2===0?1:2]){
      const a=xy(points[side]),b=xy(points[(side+1)%4]),mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,d=Math.hypot(mx-cx,my-cy),nx=(mx-cx)/d,ny=(my-cy)/d,unknown=side===target.corner;
      detail.append(element('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:unknown?'#9b6929':'#766044','stroke-width':unknown?5:2}));
      if(!unknown){detail.append(element('line',{x1:a[0]+nx*10,y1:a[1]+ny*10,x2:b[0]+nx*10,y2:b[1]+ny*10,stroke:'#dfc49b','stroke-width':1.5}));for(const p of [a,b])detail.append(element('line',{x1:p[0],y1:p[1],x2:p[0]+nx*14,y2:p[1]+ny*14,stroke:'#dfc49b','stroke-width':1.5}));}
      detail.append(element('text',{x:mx+nx*39,y:my+ny*27+6,'text-anchor':'middle','font-size':18,fill:'#f2dfc3'},unknown?'★ ? cm':`${side%2===0?f.w:f.h} cm`));
    }
    $('choices').append(guide);
  }
  if(q?.type==='complete'){
    const guide=document.createElement('div');guide.className='choice-guide';guide.setAttribute('role','status');
    guide.innerHTML=q.answerMode==='all'?`<span class="single-paper" aria-hidden="true">□ → ① / □ → ②</span><b class="multi-choice-callout">가능한 자리 <strong>모두</strong> 골라요</b><small class="choice-count">${Array.isArray(selected)?selected.length:0}곳 선택</small><span>한 면만 옮겨 가며 생각해요. 여러 면을 함께 붙이지 않아요.</span>`:'<b>빈자리 하나를 톡!</b><span>밝은 칸은 종이 · 테두리 칸은 붙여 볼 자리</span>';
    $('choices').append(guide);
  }
  const options=mode==='explore'?net.faces.map(f=>({id:String(f.id),label:`${labels[f.id]} 면`,face:f.id})):q?.options??[];
  for(const o of options){const button=document.createElement('button');button.disabled=solved||revealed;button.dataset.action='choose';button.dataset.value=o.id;button.classList.toggle('selected',isChosen(o.id));button.setAttribute('aria-pressed',String(isChosen(o.id)));
    if(o.face!==undefined){const dot=document.createElement('span');dot.className='face-dot';dot.style.background=COLORS[o.face];button.append(dot);}
    if(q?.type==='valid'){button.innerHTML=reasonIcon(o.id);button.setAttribute('aria-label',o.label);}
    if(q?.answerMode!=='all'){const check=document.createElement('span');check.className='answer-check';check.setAttribute('aria-hidden','true');check.textContent='✓';button.append(check);}
    if(q?.answerMode==='all'){const tick=document.createElement('span');tick.className='choice-tick';tick.setAttribute('aria-hidden','true');tick.textContent=isChosen(o.id)?'☑':'☐';button.append(tick);}
    button.append(document.createTextNode(q?.type==='edge'||q?.type==='vertex'||q?.type==='complete'?`${o.label}번`:q?.type==='valid'?({valid:'상자가 돼요',overlap:'면이 겹쳐요',cycle:'네 면이 한 점에 모여요',count:'면이 부족해요'}[o.id]??o.label):o.label));$('choices').append(button);
  }
}
function renderGrid(){
  svg.replaceChildren();
  svg.setAttribute('aria-label','전개도 만들기. 빈칸을 누르면 면을 놓고, 내가 놓은 면을 다시 누르면 지워요. 고정된 면은 지울 수 없어요.');
  svg.setAttribute('viewBox','148.5 48.5 303 303');svg.dataset.contentBox='148.5 48.5 303 303';
  const size=57,ox=300,oy=200;
  for(let y=2;y>=-2;y--)for(let x=-2;x<=2;x++){
    const index=createCells.findIndex(p=>p[0]===x&&p[1]===y),fixed=q?.initialCells?.some(p=>p[0]===x&&p[1]===y),g=svgButton(svg,{},`${x+3}열 ${3-y}행 ${fixed?'주어진 면':index<0?'면 놓기':'면 지우기'}`,'cell',`${x},${y}`);
    g.append(element('rect',{x:ox+x*size-size/2+4,y:oy-y*size-size/2+4,width:size-8,height:size-8,rx:5,fill:index<0?'#393b3f':q?.monochrome?'#e9e7e1':q?.type==='build'&&!fixed?'#edd0a5':COLORS[index],stroke:diagnostic?.pair?.includes(index)?'#a84d36':index<0?'#81848a':'#8a8276','stroke-width':diagnostic?.pair?.includes(index)?5:index<0?1:2,'stroke-dasharray':index<0?'3 4':'none',class:index<0?'hit-bg empty-cell':''}));
    g.append(element('text',{x:ox+x*size,y:oy-y*size+6,'text-anchor':'middle','font-size':index<0?16:21,class:index<0?'empty-label':''},index<0?'＋':labels[index]));
    if(index>=0&&q?.type==='build'&&!fixed){g.classList.add('placed-face');g.append(element('text',{x:ox+x*size,y:oy-y*size+21,'text-anchor':'middle','font-size':10},'내가 놓음'));}
    if(fixed){g.setAttribute('aria-disabled','true');g.setAttribute('tabindex','-1');g.setAttribute('aria-label',`${x+3}열 ${3-y}행 주어진 면 · 고정`);}
    if(fixed)g.append(element('text',{x:ox+x*size,y:oy-y*size+21,'text-anchor':'middle','font-size':10},'고정된 면'));
  }
  if(q?.type==='build'){$('check').disabled=!canCheckAnswer();}
  else if(mode==='create'){$('check').hidden=Boolean(diagnostic);$('show-model').disabled=createCells.length!==6;$('show-model').title=createCells.length!==6?'여섯 면을 놓으면 접힌 모습을 확인할 수 있어요.':'내 전개도가 상자가 되는지 확인해요.';$('check').disabled=createCells.length!==6;$('check').textContent=createCells.length===6?'내 전개도 접어 보기':`${6-createCells.length}면 더 놓아요`;
    $('instruction').textContent=diagnostic?(diagnostic.valid?'상자가 완성됐어요. 펼쳐서 다른 모양으로 바꿔 볼까요?':'상자가 되지 않았어요. 펼쳐서 면의 자리를 바꿔 보세요.'):createCells.length<6?`＋를 눌러 ${6-createCells.length}면 더 놓아요.`:'여섯 면을 놓았어요. 내 전개도 접어 보기를 눌러 확인해요.';}
  $('choices').innerHTML=`<span class="create-count">${createCells.length} / 6 면${q?.type==='build'?' · 주어진 면은 그대로':''}<span class="face-meter" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i class="${i<createCells.length?'filled':''}"></i>`).join('')}</span></span><button data-action="undo" ${undoStack.length&&!solved&&!revealed?'':'disabled'}>한 번 되돌리기</button><button data-action="clear-grid" ${solved||revealed||gridKey(createCells)===gridKey(q?.initialCells??[[0,0]])?'disabled':''}>${q?.type==='build'?'내가 놓은 면 지우기':'처음 한 면만 남기기'}</button>`;syncContext();syncJourney();
  $('selection-note').textContent=mode==='create'&&diagnostic?(diagnostic.valid?'상자가 완성됐어요. 펼치거나 다른 모양도 만들어봐요.':diagnostic.message):solved||revealed?'완성한 모양을 접어 확인해요. 다음 문제도 해 볼까요?':`지금 ${createCells.length}개의 면을 놓았어요. ${createCells.length<6?`＋를 눌러 ${6-createCells.length}면 더 이어 주세요.`:'상자가 될지 확인해요. 옮기려면 내가 놓은 면을 먼저 눌러 지워요.'}`;
}
function renderTools(){
  if(mode==='explore')$('mode-tools').innerHTML=`<label class="tool-label" for="shape">상자</label><select id="shape"><option value="cube" ${dimensions[0]===1?'selected':''}>정육면체</option><option value="cuboid" ${dimensions[0]!==1?'selected':''}>직육면체 · 4 × 3 × 2</option></select><label class="tool-label" for="net-list">전개도</label><select id="net-list"><option value="-1">기본 모양</option>${CUBE_NETS.map((_,i)=>`<option value="${i}" ${i===explorerIndex?'selected':''}>모양 ${i+1}</option>`).join('')}</select>`;
  else if(mode==='lesson')$('mode-tools').innerHTML=`<label class="tool-label" for="practice">활동</label><select id="practice">${CHAPTERS.filter((c,i)=>stageOpen(stageResults(),i)).map(c=>`<option value="bank:${c.id}" ${practice==='bank:'+c.id?'selected':''}>${c.title} · ${c.count}문제</option>`).join('')}</select><label class="tool-label" for="assistance">접기 도움</label><select id="assistance"><option value="auto" ${assistance==='auto'?'selected':''}>점점 혼자 해 보기</option><option value="guided" ${assistance==='guided'?'selected':''}>함께 접으며 풀기</option><option value="predict" ${assistance==='predict'?'selected':''}>먼저 예상하기</option></select>`;
  else $('mode-tools').innerHTML='<span class="pill">정육면체 만들기</span><span class="muted">빈칸을 누르면 면이 생겨요. 다시 누르면 지워져요.</span>';
}
function tapFace(face){
  if(face===net.root)return;
  if(folding){if(pendingFaces.length<8)pendingFaces.push(face);updateFoldControls();return;}
  if(Math.abs(progress*net.links.length-Math.round(progress*net.links.length))>.001)foldTo(Math.floor(progress*net.links.length)/net.links.length,false);
  const plan=faceFoldPlan(net,sequence,progress,face);
  if(!plan)return;
  selected=String(face);exploreOpposite=false;clearFeedback();
  if(plan.blocked){const hadPending=pendingFaces.length>0;pendingFaces=[];updateFoldControls();feedback('이 면은 잠깐 기다려요','다른 면을 먼저 접거나, 접힌 면을 눌러 펼쳐 보세요. 연결된 종이는 서로 통과할 수 없어요.'+(hadPending?' 대기한 접기도 멈췄어요.':''));return;}
  sequence=plan.sequence;scene.setSequence(sequence);
  renderNet();if(!document.body.classList.contains('direct-fold'))smallView(true);foldTo(plan.progress,true,true);
}
function choose(value){
  if(mode==='explore'){tapFace(Number(value));return;}
  if(solved||revealed)return;
  if(mode==='create'||q?.type==='build')return;
  if(mode==='lesson'&&!q.options.some(o=>o.id===value))return;
  if(q?.answerMode==='all'){const values=Array.isArray(selected)?selected.slice():[];selected=values.includes(value)?values.filter(id=>id!==value):[...values,value];if(!selected.length)selected=null;}else selected=value;$('check').disabled=selected===null||sameResponse(selected,lastSubmitted);exploreOpposite=false;
  if(mode==='explore'){
    clearFeedback();
  }else{
    const option=q.options.find(o=>o.id===value);if(!option)return;
    $('selection-note').textContent=sameResponse(selected,lastSubmitted)?'이 답은 이미 확인했어요. 다른 답을 고르거나 접어 봐요.':`내 생각: ${q.type==='edge'||q.type==='vertex'||q.type==='complete'?option.label+'번':option.label} · 확인 전에는 바꿀 수 있어요.`;
    if(q.answerMode==='all')$('selection-note').textContent=`${selected?.length??0}곳 골랐어요. 가능한 자리를 모두 고른 뒤 확인해요.`;
    if(q.type==='complete'&&q.answerMode!=='all'){const oldLocked=locked;setNet(makeNet([...q.cells,option.cell]),[...q.labels.slice(0,5),'새']);locked=oldLocked;updateFoldControls();}
    if(attempts){
      const repeated=sameResponse(selected,lastSubmitted);
      feedback(repeated?'이 답은 이미 확인했어요':selected===null?'다시 골라 볼까요?':'답을 바꿨어요',repeated?'다른 답을 고르거나 한 면씩 접어 살펴봐요.':selected===null?'가능한 자리를 고르면 다시 확인할 수 있어요.':'바꾼 답은 아직 확인하지 않았어요. ‘내 생각 확인’을 눌러요.',false,retryControls());
    }
  }
  challengeReading=false;renderNet();renderChoices();scene.update(progress,selectedFace(),markerItems());updateFoldControls();syncJourney();
  if(mode==='explore'||mode==='lesson'&&q.answerMode!=='all')showActionIfBelow(mode==='explore'?'explore-action':'check');
}
function startMode(next){pendingFaces=[];clearPenalty();
  if(next==='lesson'){
    if(!stageOpen(stageResults(),stageIndex())){const first=stageResults().findIndex(r=>!r?.complete);practice='bank:'+STAGES[first<0?7:first].id;}
    challengeMode=true;stageAssisted=false;
  }
  if(mode==='lesson'&&next==='explore')stageAssisted=true;

  if(next==='lesson')pendingProgress=null;
  challengeClock.advance(performance.now(),false);
  hintStage=0;delete document.body.dataset.questionType;
  if(mode==='lesson'&&next!=='lesson')saveProgress();
  challengeActive=next==='lesson'&&practice.startsWith('bank:');if(challengeActive){challengeClock.reset();challengeSaveSecond=-1;}
  if(mode==='create')freeMaker={cells:createCells,undo:undoStack};
  if(next==='create')({cells:createCells,undo:undoStack}=freeMaker);
  for(const [node,parent]of exploreTools)(next==='explore'?$('explore-tools'):parent).append(node);
  for(const [node,parent]of exploreActions)(next==='explore'?$('explore-primary-controls'):parent).append(node);
  $('explore-controls').hidden=next!=='explore';
  $('show-model').disabled=false;$('show-model').removeAttribute('title');
  for(const [node,parent]of learningActions)(next==='lesson'||next==='create'?$('learning-controls'):parent).append(node);
  (next==='lesson'?document.querySelector('.answer-actions'):$('net-context')).prepend($('context-back'));
  $('learning-controls').hidden=next!=='lesson'&&next!=='create';
  $('lesson-utilities').hidden=next!=='lesson';
  if(next==='lesson'){
    $('workbench').after($('learning-controls'),$('lesson-utilities'));
    $('lesson-utilities').append($('challenge-status'));
  }else{
    $('workbench').before($('learning-controls'));
    
    document.querySelector('.mobile-switch').before($('challenge-status'));
  }
  $('extra-tools').open=false;
  if(next==='explore')document.querySelector('.task-heading').before(document.querySelector('.activity-bar'));
  else $('extra-tools-body').prepend(document.querySelector('.activity-bar'));
  $('extra-tools-body').prepend($('hint'));
  document.querySelector('.legend-help').open=false;
  if(next==='explore'){$('workbench').after($('explore-controls'),$('resume-banner'));$('explore-controls').prepend($('selection-note'));}
  else{document.querySelector('main').prepend($('resume-banner'));$('workbench').before($('explore-controls'));}
  cancelAnimationFrame(animation);folding=false;journeyState='';
  $('resume-banner').hidden=true;
  document.body.classList.remove('course-finished');
  document.body.classList.toggle('maker-mode',next==='create');
  window.scrollTo({top:0,behavior:'instant'});
  smallView(false);
  setGhost(false);diagnostic=null;
  document.body.classList.toggle('path-mode',next==='path');$('path-screen').hidden=next!=='path';
  mode=next;
  const directReady=scene.setDirect(mode==='explore'?tapFace:null);
  document.body.classList.toggle('direct-fold',mode==='explore'&&directReady);
  (mode==='explore'&&directReady?$('net-wrap'):document.querySelector('.scene-wrap')).prepend($('scene'));
  updateChallenge();document.body.dataset.mode=mode;selected=null;q=null;solved=false;revealed=false;locked=false;lastSubmitted=null;exploreOpposite=false;clearFeedback();
  document.body.classList.remove('counting-question');
  document.querySelector('.skip').href=mode==='path'?'#path-title':'#task-title';
  $('model-title').textContent='접어서 확인';
  document.querySelector('.fold-more').open=false;
  document.querySelector('.view-settings').open=false;
  $('activity-settings').open=false;$('settings-label').textContent=mode==='lesson'?'활동과 도움 고르기':mode==='create'?'만드는 방법 보기':`다른 모양 · ${dimensions[0]===1?'정육면체':'직육면체'}`;
  $('shape-position').textContent=explorerIndex<0?'기본 모양':`모양 ${explorerIndex+1} / 11`;
  document.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode||b.dataset.mode==='path'&&mode==='lesson')));
  $('lesson-progress').hidden=mode!=='lesson';$('hint').hidden=mode!=='lesson';$('check').hidden=mode==='explore';$('next').hidden=true;$('check').disabled=mode!=='create';
  if(mode==='path'){renderPath();return;}
  renderTools();
  if(mode==='explore'){
    $('chapter').textContent='종이에서 상자로';$('task-title').textContent='접으면, 어떤 면이 만날까?';$('instruction').textContent='면을 누르면 접혀요. 다시 누르면 펼쳐져요.';$('selection-note').textContent='왼쪽에서 면 하나를 눌러 보세요.';
    setNet(makeNet(explorerIndex<0?CROSS_NET:CUBE_NETS[explorerIndex],dimensions),LABELS);
  }else if(mode==='lesson'){qIndex=0;session=[];loadQuestion();return;}
  else{$('chapter').textContent='내 손으로 만드는 상자';$('task-title').textContent='6면으로 상자 만들기';$('instruction').textContent='칸을 눌러 면을 놓아요. 모서리를 맞대어 이어 주세요.';$('selection-note').textContent='모양을 만든 뒤 상자가 되는지 확인해요.';$('check').textContent='내 전개도 접어 보기';setNet(makeNet(createCells),LABELS);}
  $('net-badge').textContent=dimensions[0]===1||mode==='create'?'정육면체':'직육면체 · cm';renderNet();renderChoices();if(mode==='create')renderGrid();syncJourney();
  if(mode==='explore'){pendingProgress=null;if(!privateSession)try{pendingProgress=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{}showResume();}
}
function needsPrediction(){if(counting())return false;return assistance==='predict'||assistance==='auto'&&(chapterFor(practice)?q.difficulty!=='함께':practice!=='course'||qIndex%2===1);}
function loadQuestion(){
  clearPenalty();
  $('extra-tools').open=false;document.querySelector('.legend-help').open=false;
  smallView(false);
  selected=null;attempts=0;solved=false;revealed=false;helped=false;lastSubmitted=null;clearFeedback();
  hintStage=0;$('hint').textContent='힌트 보기';q=getQuestion(practice,seed,qIndex);smallView(false);document.body.dataset.questionType=q.type;const type=q.type,count=questionCount(practice),chapter=chapterFor(practice);answerPreview=0;diagnostic=null;undoStack=[];
  document.body.classList.toggle('maker-mode',type==='build');
  if(type==='build'){createCells=q.initialCells.map(p=>p.slice());selected=gridKey(createCells);}
  locked=needsPrediction();
  setNet(type==='build'?makeNet(createCells):q.net,q.labels);setGhost(['edge','vertex','length'].includes(type));scene.update(0,null,markerItems());renderTools();renderNet();renderChoices();
  if(counting()){foldTo(1,false);helped=false;smallView(true);}
  document.querySelector('.view-settings').open=counting();$('model-title').textContent=counting()?'돌려 보며 세어요':'접어서 확인';
  document.body.dataset.answerMode=q.answerMode??'single';
  $('chapter').textContent=`${chapter?.title??TYPES[type]} · ${locked?'먼저 예상해요':'접으며 알아봐요'}`;$('task-title').textContent=q.title;$('instruction').textContent=counting()?'상자를 돌려 보며 세고, 아래에서 답을 골라요.':q.instruction;
  $('lesson-progress').hidden=false;$('lesson-progress').innerHTML=count?`${qIndex+1} / ${count}<span class="progress-track"><i style="width:${(qIndex+1)/count*100}%"></i></span>`:`연습 ${qIndex+1}`;
  $('net-badge').textContent=q.dimensions?.some(d=>d!==q.dimensions[0])?'직육면체 · cm':'정육면체';$('selection-note').textContent=type==='build'?`주어진 ${q.initialCells.length}면은 그대로! ＋를 눌러 여섯 면을 만들어요.`:q.answerMode==='all'?'가능한 자리를 모두 눌러요. 다시 누르면 선택이 풀려요.':'답을 하나 고른 뒤 내 생각을 확인해요.';
  $('check').hidden=false;$('check').disabled=true;$('check').textContent='내 생각 확인';$('next').hidden=true;$('hint').hidden=false;
  $('next').textContent=count&&qIndex===count-1?(challengeActive?'도전 결과 보기':'탐험 마무리 ✓'):'다음 문제 →';
  syncJourney();
}
function logAttempt(correct){const record={id:q.id,type:q.type,seed,index:qIndex,attempt:attempts,choice:selected,correct,helped,time:new Date().toISOString()};session.push(record);if(privateSession){visitRecords.push(record);return;}records.push(record);records=records.slice(-500);try{localStorage.setItem('net-workshop-v1',JSON.stringify(records));}catch{$('save-state').textContent='저장 공간이 부족해요. 현재 활동은 계속할 수 있어요.';}}
function check(){
  const keyboard=$('check').matches(':focus-visible');
  if(mode==='create'){
    const result=analyze(makeNet(createCells));diagnostic=result;setNet(makeNet(createCells),LABELS);renderGrid();feedback(result.valid?'상자가 완성돼요!':'이 부분을 다시 살펴봐요',result.message,result.valid,'<button class="secondary" id="edit-maker" data-action="edit-maker">펼쳐서 고쳐 만들기</button>');if(result.valid){smallView(true,true);foldTo(1);}else if(result.reason==='overlap'){smallView(true,true);foldTo(1);}if(keyboard)$('feedback').focus();else if(!result.valid)$('feedback').scrollIntoView({block:'nearest',behavior:'instant'});return;
  }
  if(!q||!canCheckAnswer())return;lastSubmitted=Array.isArray(selected)?selected.slice():selected;attempts++;const correct=grade(q,selected);logAttempt(correct);locked=false;updateFoldControls();
  if(!correct&&challengeActive)showPenalty();
  if(correct){playSuccess();solved=true;$('check').hidden=true;$('next').hidden=false;$('hint').hidden=true;feedback('정답','',true);renderNet();renderChoices();updateFoldControls();updateChallenge();saveProgress();showActionIfBelow('next');}
  else{helped=true;smallView(false);feedback('괜찮아요. 한 번 더 생각해 볼까요?',wrongHint(),false,retryControls());$('check').disabled=true;$('selection-note').textContent='힌트를 보고 다른 답을 골라요. 필요하면 접어 봐도 돼요.';$('feedback').scrollIntoView({block:'nearest',behavior:'instant'});}
  syncJourney();if(keyboard)(correct?nextButton:$('feedback')).focus();
}
function reveal(){if(challengeActive)return;const keyboard=document.activeElement.matches(':focus-visible');helped=true;revealed=true;locked=false;const last=session.findLast(r=>r.id===q.id);if(last){last.helped=true;last.revealed=true;if(!privateSession)try{const record=records.findLast(r=>r.id===last.id&&r.time===last.time&&r.attempt===last.attempt);if(record)Object.assign(record,{helped:true,revealed:true});localStorage.setItem('net-workshop-v1',JSON.stringify(records));}catch{}}selected=q.answerMode==='all'?q.answers.slice():q.answers[0];if(q.type==='build'){createCells=q.solutionCells.map(p=>p.slice());selected=gridKey(createCells);setNet(makeNet(createCells),q.labels);}prepareAnswerNet();
  renderNet();renderChoices();smallView(true,true);$('check').hidden=true;$('next').hidden=false;$('hint').hidden=true;feedback('설명과 함께 다시 배워요',q.explanation,false,q.type==='build'?'<p>지금은 완성할 수 있는 한 가지 모양이에요. 펼쳐서 주어진 면과 새로 놓은 면을 비교해요.</p>':`<p>가능한 답: ${q.options.filter(o=>q.answers.includes(o.id)).map(o=>esc(o.label)+(q.type==='edge'||q.type==='vertex'||q.type==='complete'?'번':'')).join(', ')}</p>`);foldTo(1);syncJourney();if(keyboard)nextButton.focus();
}
function prepareAnswerNet(){
  if(q.type==='complete'){const id=q.answerMode==='all'?q.answers[answerPreview]:selected;const option=q.options.find(o=>o.id===id);if(option)setNet(makeNet([...q.cells,option.cell]),[...q.labels.slice(0,5),'새']);}
}
function wrongHint(){
  if(q.type==='build')return analyze(makeNet(createCells)).message;
  if(q.answerMode==='all')return selected.every(id=>q.answers.includes(id))?'고른 자리는 가능해요. 아직 다른 가능한 자리도 있어요. 한 면씩 따로 붙인다고 생각해 봐요.':'고른 자리 중에는 상자가 되지 않는 곳이 있어요. 한 면씩 따로 붙여 머릿속으로 접어 봐요.';
  return q.options.find(o=>o.id===selected)?.feedback||q.hint;
}
function chapterArtwork(id){
  const paths={basics:'M24 5 42 15 24 25 6 15Z M6 15V34L24 44 42 34V15 M24 25V44',opposite:'M5 11H19V35H5Z M29 11H43V35H29Z M20 23H28 M23 20 20 23 23 26 M25 20 28 23 25 26',vertex:'M24 7 41 17 24 27 7 17Z M7 17V34L24 44 41 34V17 M24 27V44 M20 3 28 11 M28 3 20 11 M20 23 28 31 M28 23 20 31',edge:'M8 9H37V38H8Z M12 13 33 34 M5 8 8 5 11 8 M5 39 8 42 11 39',valid:'M6 12H25V32H6Z M18 28 26 36 43 15',complete:'M6 17H18V29H6Z M18 17H30V29H18Z M30 17H42V29H30Z M18 5H30V17H18Z M18 29H30V41H18 M24 33V39 M21 36H27',length:'M8 9H40V31H8Z M8 40H40 M12 36 8 40 12 44 M36 36 40 40 36 44',build:'M6 6H20V20H6Z M28 6H42V20H28Z M6 28H20V42H6Z M35 28V42 M28 35H42'};
  return '<svg class="chapter-icon" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[id]+'"/></svg>';
}
function renderPath(){
 pendingProgress=null;if(!privateSession)try{pendingProgress=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{}
 showResume();
 const results=stageResults();
 $('tier-ladder').innerHTML=TIERS.map((name,i)=>({name,color:TIER_COLORS[i]})).reverse().map(t=>'<li style="--tier:'+t.color+'"><span class="tier-gem" aria-hidden="true"></span>'+t.name+'</li>').join('');
 $('chapter-cards').innerHTML=CHAPTERS.map((c,i)=>{
   const open=stageOpen(results,i),result=results[i],resume=canResumeChapter('bank:'+c.id);
   const tier=result&&!result.legacy?TIERS[result.tier]:result?'완료':'';
   const time=result&&!result.legacy?clockText(Math.ceil(result.seconds)*1000):'';
   const action=resume?'이어가기':result?'다시 도전':open?'시작':'잠김';
   return '<div class="stage-entry"><button class="chapter-card'+(result?' completed':'')+(open&&!result?' recommended':'')+'" data-action="start-bank" data-value="'+c.id+'" '+(open?'':'disabled')+' aria-label="'+(i+1)+'단계 '+c.title+' · '+action+(tier?' · '+tier+' '+time:'')+'"><span class="stage-orb" aria-hidden="true">'+(open?(result?'✓':'↗'):'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>')+'</span><span><b>'+(i+1)+'단계</b>'+(tier?'<small>'+tier+(time?' <time title="오답 시간 포함 기록">'+time+'</time>':'')+'</small>':'')+'</span><span class="stage-chip" aria-hidden="true">'+(resume?'이어가기':result?'↻':open?'→':'')+'</span></button><button class="stage-restart" data-action="restart-bank" data-value="'+c.id+'" '+(open?'':'disabled')+' aria-label="'+(i+1)+'단계 새로 시작" title="첫 문제부터 시작 · 최고 기록 유지">새로 시작</button></div>';

 }).join('');
 $('tier-rules').innerHTML='<p>완주하면 브론즈, 시간 안에 완주하면 실버 이상.</p><p>챌린저는 오답·도움 없이! 오답은 10초 차감.</p><p>힌트·접기 중에도 시간은 흘러요. 정답 확인 후·다른 활동에서는 멈춰요.</p><div class="tier-table-wrap"><table><caption>각 티어의 기록 상한(분:초)</caption><thead><tr><th>단계</th>'+TIERS.slice(0,6).map(t=>'<th scope="col">'+t+'</th>').join('')+'</tr></thead><tbody>'+STAGES.map((s,i)=>'<tr><th>'+(i+1)+'</th>'+s.cutoffs.map(t=>'<td>'+clockText(t*1000)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function finishStage(){
 updateChallenge();challengeClock.advance(performance.now(),false);
 const index=stageIndex(),chapter=CHAPTERS[index],wrong=session.filter(r=>!r.correct).length;
 const rank=stageTier(index,challengeClock.elapsed,wrong,stageAssisted||session.some(r=>r.helped));
 const previousBest=stageResults()[index];
 const cleared=BANK.filter(q=>q.chapter===chapter.id).every(q=>session.some(r=>r.id===q.id&&r.correct));
 if(cleared){playSuccess(true);const results=stageResults();results[index]=mergeStage(results[index],rank);if(!privateSession)try{localStorage.setItem(STAGE_KEY,JSON.stringify({version:1,results}));}catch{$('save-state').textContent='기록은 이번 방문 동안만 유지돼요.';}}
 document.body.classList.add('course-finished');cancelAnimationFrame(animation);folding=false;
 $('lesson-progress').hidden=true;$('task-title').textContent=cleared&&index===7?'8단계 모두 클리어!':(index+1)+'단계 '+(cleared?'클리어!':'다시 도전해요');
 $('instruction').textContent='';$('next').hidden=true;
 const next=cleared&&index<7?'<button class="primary" data-action="start-bank" data-value="'+CHAPTERS[index+1].id+'">'+(index+2)+'단계 도전 →</button>':'<button class="primary" data-mode="path">전체 기록 보기</button>';
 const tierReason=rank.tier===1&&rank.seconds<=STAGES[index].cutoffs[0]?(wrong?'오답이 있어 마스터':'도움 사용으로 마스터'):'';
 const bestNote=[tierReason,cleared?stageRecordMessage(previousBest,rank):''].filter(Boolean).join(' · ');
 const badge=cleared?'<div class="tier-medal" style="--tier:'+TIER_COLORS[rank.tier]+'"><svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 70 21V57L40 76 10 57V21Z"/><path d="m22 45-3-19 14 10 7-19 7 19 14-10-3 19Z M24 53h32"/></svg><strong>'+rank.name+'</strong></div><p class="tier-caption">'+bestNote+'</p>':'<p>모든 문제를 맞히면 다음 단계가 열려요.</p>';
 feedback('', '',true,'<section class="stage-result">'+badge+'<p>풀이 '+clockText(Math.ceil(challengeClock.elapsed/1000)*1000)+' · 오답 '+wrong+'회'+(wrong?' <span>(−'+wrong*10+'초)</span>':'')+'</p><p>남은 시간 '+clockText(Math.floor(rank.remaining)*1000)+'</p><div class="row">'+next+'<button class="secondary" data-action="restart">'+(index+1)+'단계 다시 도전</button>'+(index<7?'<button class="quiet" data-mode="path">단계 보기</button>':'')+'</div></section>');
 $('feedback').querySelector('.feedback-heading')?.remove();$('feedback').querySelector(':scope>p')?.remove();
 saveProgress();updateChallenge();window.scrollTo({top:0,behavior:'instant'});$('feedback').tabIndex=-1;$('feedback').focus({preventScroll:true});
}

function nextQuestion(){
 if(!solved&&!revealed)return;
 if(qIndex===questionCount(practice)-1){finishStage();return;}
 qIndex++;loadQuestion();window.scrollTo({top:0,behavior:'instant'});focusActivity();
}

function updateMaker(cells){if(solved||revealed)return;if(q?.initialCells?.some(p=>!cells.some(c=>key(c)===key(p)))){feedback('주어진 면은 남겨 두어요','＋를 눌러 새 면을 붙여요. 내가 붙인 면은 다시 눌러 지울 수 있어요.');return;}if(cells.length>6){feedback('면은 여섯 개까지만 놓아요','다른 자리에 놓으려면 이미 놓은 면을 눌러 지워 주세요.');return;}if(!cells.length){feedback('첫 면 하나는 남겨 두어요','빈칸에 새 면을 놓은 뒤 원래 면을 지우면 옮길 수 있어요.');return;}diagnostic=null;undoStack.push(createCells.map(p=>p.slice()));createCells=cells;if(q?.type==='build')selected=gridKey(cells);clearFeedback();setNet(makeNet(createCells),LABELS);renderGrid();$('selection-note').textContent=`지금 ${createCells.length}개의 면을 놓았어요. ${createCells.length<6?`＋를 눌러 ${6-createCells.length}면 더 이어 주세요.`:'상자가 될지 확인해요. 옮기려면 내가 놓은 면을 먼저 눌러 지워요.'}`;if(createCells.length===6)showActionIfBelow('check');}
document.addEventListener('click',event=>{
  const b=event.target.closest('button,[data-action]');if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
  if(b.dataset.mode){if(b.closest('nav')&&b.dataset.mode===mode)return;startMode(b.dataset.mode);focusActivity();return;}
  const fromMini=!!b.closest('#mini-net');const value=b.dataset.value;
  switch(b.dataset.action){case 'reset-camera':$('camera-reset').click();break;case 'choose':choose(value);break;case 'cell':{const cell=value.split(',').map(Number),found=createCells.some(p=>key(p)===value);updateMaker(found?createCells.filter(p=>key(p)!==value):[...createCells,cell]);break;}
    case 'undo':if(!solved&&!revealed&&undoStack.length){createCells=undoStack.pop();if(q?.type==='build')selected=gridKey(createCells);diagnostic=null;clearFeedback();setNet(makeNet(createCells),LABELS);renderGrid();if(createCells.length===6)showActionIfBelow('check');}break;
    case 'clear-grid':updateMaker(q?.initialCells?.map(p=>p.slice())??[[0,0]]);break;
    case 'show-opposite':feedback(`${labels[value]} 면과 마주 봐요`,'두 면은 상자의 서로 반대쪽에 있어요. 모서리나 꼭짓점을 함께 쓰지 않아요.',true);foldTo(1);break;
    case 'choose-again':returnToAnswers();break;
    case 'edit-maker':if(progress>0)foldTo(0,false);returnToAnswers();break;
    case 'fold-help':helped=true;locked=false;smallView(progress<.999,true);foldTo(progress>.999?0:Math.min(1,(Math.floor(progress*net.links.length+.001)+1)/Math.max(1,net.links.length)));break;
    case 'compare-length':smallView(false,true);foldTo(0);break;
    case 'restart-bank':case 'start-bank':if(!stageOpen(stageResults(),STAGES.findIndex(s=>s.id===value)))break;if(b.dataset.action==='start-bank'&&canResumeChapter('bank:'+value))resumeProgress();else{practice='bank:'+value;startMode('lesson');focusActivity();}break;
    case 'preview-answer':smallView(true,true);answerPreview=(answerPreview+1)%q.answers.length;prepareAnswerNet();syncContext();$('preview-caption').textContent=`지금은 ${q.options.find(o=>o.id===q.answers[answerPreview]).label}번에 한 면을 붙인 모습이에요.`;foldTo(1);break;
    case 'reveal':reveal();break;case 'restart':seed=seed%999998+1;startMode('lesson');focusActivity();break;}
  // Redrawing a selected SVG/button must not drop keyboard focus back to the page.
  if(!b.isConnected&&b.dataset.action){
    const area=fromMini?$('mini-net'):b.namespaceURI===NS?svg:$('choices');
    const same=area.querySelector(`[data-action="${CSS.escape(b.dataset.action)}"]${value===undefined?'':`[data-value="${CSS.escape(value)}"]`}:not(:disabled):not([aria-disabled=true])`);
    (same??area.querySelector('button:not(:disabled)')??svg.querySelector('[data-action]:not([aria-disabled=true])')??$('net-title')).focus({preventScroll:true});
  }
});
document.addEventListener('keydown',e=>{
  if(!e.target.closest('#net-svg,#mini-net'))return;
  const step={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];
  if(step&&e.target.matches('[data-action=cell]')){
    e.preventDefault();let cell=e.target.dataset.value.split(',').map(Number);
    for(let i=0;i<4;i++){cell=cell.map((v,k)=>v+step[k]);if(cell.some(v=>Math.abs(v)>2))break;const next=svg.querySelector(`[data-value="${cell.join(',')}"]:not([aria-disabled=true])`);if(next){next.focus();break;}}
  }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-action]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
});
document.addEventListener('pointerdown',e=>{document.querySelectorAll('main details[open]').forEach(d=>{if(d.id!=='extra-tools'&&!d.classList.contains('legend-help')&&!d.contains(e.target)&&!(counting()&&d.classList.contains('view-settings')))d.open=false;});});
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;const open=[...document.querySelectorAll('main details[open]')].find(d=>!(counting()&&d.classList.contains('view-settings')));if(open){e.preventDefault();open.open=false;open.querySelector('summary').focus();}});
document.addEventListener('change',e=>{
  const refocus=e.target===document.activeElement;
  if(e.target.id==='shape'){dimensions=e.target.value==='cube'?[1,1,1]:[4,3,2];startMode('explore');}
  if(e.target.id==='net-list'){explorerIndex=Number(e.target.value);startMode('explore');}
  if(e.target.id==='practice'){$('activity-settings').open=false;practice=e.target.value;startMode('lesson');focusActivity();}
  if(e.target.id==='assistance'){$('activity-settings').open=false;if(refocus)$('settings-label').focus({preventScroll:true});assistance=e.target.value;locked=!attempts&&!helped&&!solved&&!revealed&&needsPrediction();updateFoldControls();$('chapter').textContent=`${chapterFor(practice)?.title??TYPES[q.type]} · ${locked?'먼저 예상해요':'접으며 알아봐요'}`;}
  if(refocus&&!e.target.isConnected)$('settings-label').focus({preventScroll:true});
});
$('unfold').onclick=()=>{smallView(false,true);foldTo(0);};$('step-fold').onclick=()=>{smallView(true,true);foldTo((Math.floor(progress*net.links.length+.001)+1)/net.links.length);};$('play-fold').onclick=()=>{smallView(true,true);foldTo(1);};
$('previous-shape').onclick=()=>{explorerIndex=explorerIndex<=-1?CUBE_NETS.length-1:explorerIndex-1;startMode('explore');};
$('next-shape').onclick=()=>{explorerIndex=explorerIndex>=CUBE_NETS.length-1?-1:explorerIndex+1;startMode('explore');};
$('show-net').onclick=()=>{if(mode==='create')returnToAnswers();else smallView(false);};$('show-model').onclick=()=>inspectFold();
$('model-fold').onclick=()=>inspectFold(progress>.001?0:1);
$('context-back').onclick=returnToAnswers;
$('explore-action').onclick=()=>{if(folding)return;if(progress>.999){smallView(false,true);foldTo(0);}else{smallView(true,true);foldTo(1);}};
$('explore-opposite').onclick=()=>{if(selected===null)return;exploreOpposite=true;const other=opposite(net,Number(selected));feedback(`${labels[Number(selected)]} 면과 ${labels[other]} 면이 마주 봐요`,'두 면은 상자의 서로 반대쪽에 있어요. 푸른 테두리와 금빛 테두리를 찾아보세요.',true);smallView(true,true);scene.update(progress,selectedFace(),markerItems());};
$('fold-range').oninput=e=>foldTo(Number(e.target.value)/100,false);
$('fold-range').onchange=()=>{if(!$('fold-range').matches(':focus-visible'))smallView(true,true);};
$('rotate-left').onclick=()=>scene.rotate(-1);$('rotate-right').onclick=()=>scene.rotate(1);$('camera-reset').onclick=()=>{scene.reset();zoomCamera(0);};$('zoom-in').onclick=()=>zoomCamera(.15);$('zoom-out').onclick=()=>zoomCamera(-.15);
$('ghost').onclick=()=>setGhost($('ghost').getAttribute('aria-pressed')!=='true');
$('selected-view').onclick=()=>{const face=selectedFace()??q?.options?.find(o=>o.id===selected)?.mark?.face;if(face!==undefined&&face!==null){smallView(true,true);scene.lookAtFace(face);zoomCamera(0);}};
$('unlock').onclick=()=>{helped=true;locked=false;smallView(true,true);foldTo(1);$('chapter').textContent=`${chapterFor(practice)?.title??TYPES[q.type]} · 도움을 받아 살펴봐요`;};
$('hint').onclick=()=>{
  $('extra-tools').open=false;
  helped=true;locked=false;hintStage=Math.min(2,hintStage+1);$('hint').textContent=['edge','vertex'].includes(q.type)&&hintStage===1?'다음 힌트':'힌트 다시 보기';updateFoldControls();
  let title='힌트',message=q.hint,extra=attempts?retryControls():`<button class="secondary" data-action="choose-again">${q.type==='build'?'면 놓기':'답 고르기'}</button>`;
  if(['edge','vertex'].includes(q.type)){
    smallView(false,true);renderNet();
    title=progress>.999?'다시 펼쳐서 따라가요':hintStage>1?'접는 선을 따라가요':title;
    message=progress>.999?'‘펼쳐서 다시 살펴보기’를 눌러 ★와 번호를 따라가요.':hintStage===1?'테두리로 밝힌 면에서 ★를 찾아요. 이 면이 접힐 때 ★도 함께 움직여요.':'금빛으로 표시한 접는 선을 찾아요. 한 면씩 접으며 ★와 번호가 어디로 가는지 따라가요.';
    extra=retryControls();
  }
  feedback(title,message,false,extra);$('feedback').focus({preventScroll:true});$('feedback').scrollIntoView({block:'nearest',behavior:'instant'});
};
$('check').onclick=check;$('next').onclick=nextQuestion;
$('help-open').onclick=()=>{
  const steps=mode==='lesson'?[['답을 골라요','문제의 표시를 보고 답을 골라요. 모두 고르기 문제는 가능한 자리를 모두 눌러요.'],['생각을 확인해요','내 생각 확인을 눌러요. 다른 답으로 바꾸어 다시 생각해도 괜찮아요.'],['막히면 힌트를 봐요','힌트와 접기 도움을 볼 때도 시간이 흘러요. 챌린저는 오답·도움 없이 도전해요.']]:mode==='create'?[['면을 놓아요','빈칸을 눌러 여섯 면을 모서리끼리 이어 놓아요.'],['상자가 되는지 확인해요','내 전개도 접어 보기를 눌러요.'],['다시 고쳐 만들어요','펼쳐서 고쳐 만들기를 누르면 놓은 면을 바꿀 수 있어요.']]:mode==='path'?[['열린 단계부터 시작해요','1단계부터 시작해요. 풀던 문제가 있으면 이어가기를 눌러요.'],['오답은 10초 차감돼요','시간이 끝나도 계속 풀 수 있어요. 끝까지 풀면 브론즈를 받아요.'],['다음 단계가 열려요','모든 문제를 맞히면 다음 단계가 열려요. 다시 도전해 최고 티어를 높여 보세요.']]:[['면을 눌러 접어요','종이에서 접고 싶은 면을 눌러요. 연결된 면도 함께 움직여요.'],['다시 눌러 펼쳐요','같은 면을 다시 누르면 펼쳐져요. 고정된 면은 움직이지 않아요. 모두 접기로 한 번에 접을 수도 있어요.'],['만나는 면을 살펴봐요','완전히 접은 뒤 마주 보는 면을 확인하거나 펼쳐서 다시 살펴봐요.']];
  $('help-dialog').querySelector('h2').textContent='지금 활동은 이렇게 해요';$('help-dialog').querySelector('.help-steps').innerHTML=steps.map(([title,text])=>'<li><b>'+title+'</b><span>'+text+'</span></li>').join('');$('help-dialog').showModal();
};$('teacher-open').onclick=()=>{$('seed-input').removeAttribute('aria-invalid');$('teacher-status').textContent='';$('seed-input').value=seed;$('teacher-assistance').value=assistance;$('export').disabled=(privateSession?visitRecords:records).length===0;$('export').textContent=privateSession?`이번 공용 기록 ${visitRecords.length}건 저장`:'이 기기 기록 저장';const printable=mode!=='path'&&!document.body.classList.contains('course-finished');$('print').disabled=!printable;$('print').textContent=printable?'현재 화면 관찰 학습지':'활동 화면에서 학습지 인쇄';$('teacher-dialog').showModal();};
document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('reduced').onchange=e=>{motionOverride=true;reduced=e.target.checked;try{localStorage.setItem('net-workshop-reduced',String(reduced));}catch{$('teacher-status').textContent='움직임 설정은 지금 활동에만 적용돼요. 다음에 열면 다시 선택해 주세요.';}};$('private-session').onchange=e=>{privateSession=e.target.checked;$('export').disabled=(privateSession?visitRecords:records).length===0;$('export').textContent=privateSession?`이번 공용 기록 ${visitRecords.length}건 저장`:'이 기기 기록 저장';try{localStorage.setItem('net-workshop-private',String(privateSession));}catch{$('teacher-status').textContent='설정을 저장하지 못했어요. 다시 열면 공용 모드를 다시 켜 주세요.';}$('resume-banner').hidden=true;$('save-state').textContent=privateSession?'공용 기기 모드 · 지금 활동은 저장하지 않아요':'기록은 이 기기에만 저장돼요';if(mode==='path')renderPath();else if(mode==='explore'&&!privateSession){try{pendingProgress=readProgress(localStorage.getItem(PROGRESS_KEY));}catch{pendingProgress=null;}showResume();}};
function readSeedInput(){
  const value=Number($('seed-input').value);
  if(!Number.isInteger(value)||value<1||value>999999){$('teacher-status').textContent='1부터 999999 사이의 정수를 입력해 주세요.';$('seed-input').setAttribute('aria-invalid','true');$('seed-input').focus();return null;}
  $('seed-input').removeAttribute('aria-invalid');return value;
}
$('apply-seed').onclick=()=>{const value=readSeedInput();if(value===null)return;seed=value;assistance=$('teacher-assistance').value;practice='course';history.replaceState(null,'',`?seed=${seed}`);$('teacher-dialog').close();startMode('lesson');focusActivity();};
$('copy-link').onclick=async()=>{
  const value=readSeedInput();if(value===null)return;
  const url=new URL(location.href);url.searchParams.set('seed',String(value));
  url.searchParams.set('practice','course');url.searchParams.set('assistance',$('teacher-assistance').value);
  try{await navigator.clipboard.writeText(url.href);$('teacher-status').textContent=`${value}번 묶음 링크를 복사했어요.`+(location.hostname==='127.0.0.1'||location.hostname==='localhost'?' 현재 로컬 주소는 이 컴퓨터에서만 열려요.':'');}
  catch{$('teacher-status').textContent=`복사하지 못했어요. 이 주소를 복사해 주세요: ${url.href}`;}
};
$('print').onclick=()=>{
  if(mode==='path'||document.body.classList.contains('course-finished'))return;
  const clone=cloneNet('print');clone.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
  clone.querySelectorAll('.empty-cell').forEach(e=>e.setAttribute('fill','#fff'));clone.querySelectorAll('.empty-label').forEach(e=>e.setAttribute('fill','#444'));
  $('print-sheet').innerHTML=`<h1>전개도 공작소</h1><p>이름: ____________________　날짜: ____________________</p><h2>${esc($('task-title').textContent)}</h2><p>${esc($('instruction').textContent)}</p>${clone.outerHTML}<p>${q?q.options.map(o=>esc(o.label)+(q.type==='complete'||q.type==='vertex'||q.type==='edge'?'번':'')).join('　　'):''}</p><p>내 예상: ____________________　접어 본 뒤 알게 된 것:</p><div class="write-lines"></div><p>문제 번호: ${esc(q?.id??'explore-'+explorerIndex)} · 이 그림은 관찰용이며 오려 접기용 실측 도안이 아닙니다.</p><p>인쇄 비율 확인: 아래 정사각형의 한 변은 1 cm입니다.</p><div class="calibration"></div>`;
  $('teacher-dialog').close();window.print();
};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),records:privateSession?visitRecords:records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='전개도_학습기록.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('teacher-status').textContent=`${privateSession?'이번 방문의 공용':'이 기기의'} 풀이 기록 ${privateSession?visitRecords.length:records.length}건을 파일로 저장했어요.`;};
const linkedLesson=new URL(location.href).searchParams;
if(linkedLesson.get('practice')==='course'){
  const help=linkedLesson.get('assistance');assistance=['auto','guided','predict'].includes(help)?help:'auto';
  restoring=!!pendingProgress;startMode('lesson');restoring=false;
}else startMode('explore');
showResume();
if(privateSession)$('save-state').textContent='공용 기기 모드 · 지금 활동은 저장하지 않아요';
$('resume-lesson').onclick=resumeProgress;
$('fresh-lesson').onclick=()=>{const saved=pendingProgress;pendingProgress=null;try{localStorage.removeItem(PROGRESS_KEY);}catch{}if(saved&&!privateSession){challengeMode=true;seed=saved.seed;practice=saved.practice;assistance=saved.assistance;startMode('lesson');focusActivity();}else startMode('explore');};
['click','change','input'].forEach(type=>document.addEventListener(type,()=>queueMicrotask(saveProgress)));
window.addEventListener('pagehide',saveProgress);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress();});
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{if(!privateSession&&$('save-state').textContent==='기록은 이 기기에만 저장돼요')$('save-state').textContent='오프라인 준비 완료 · 기록은 이 기기에만 저장돼요';}).catch(()=>{});


for(const event of ['click','change','visibilitychange'])document.addEventListener(event,()=>queueMicrotask(updateChallenge));document.addEventListener('close',updateChallenge,true);
setInterval(()=>{if(!challengeActive||document.hidden)return;updateChallenge();const second=Math.floor(challengeClock.elapsed/5000);if(challengeActive&&second!==challengeSaveSecond){challengeSaveSecond=second;saveProgress();}},250);
window.addEventListener('pagehide',()=>{challengeClock.advance(performance.now(),false);saveProgress();});
updateChallenge();

document.documentElement.dataset.appState='ready';window.dispatchEvent(new Event('nets-ready'));
