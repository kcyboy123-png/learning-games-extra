import{match,step,snapshot,training,progress,resolve,queued,landingRows,attack,TICK,DURATION,W,H,TOP}from'./engine.mjs';
import{drawBoard,drawNext,drawFlights,flightDuration,flightHits}from'./render.mjs';
import{Sound}from'./audio.mjs';
import{RIVALS,accessible,completeStage,advanceSeries,createBot,rivalActions}from'./rivals.mjs';
const shapeNames=['막대','네모','ㅗ 모양','ㄴ 모양','ㄱ 모양','계단 모양','반대 계단 모양'];
const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,document.getElementById(id));return elements.get(id);},sound=new Sound();
const state={mode:'home',local:null,game:null,slot:0,actions:[],effects:[[],[]],lastEvent:0,paused:false,stage:0,stageDone:false,rival:0,selected:0,cleared:0,series:{wins:[0,0],winner:null},bot:null,seenResult:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,settings:{},toastTimer:0,inputEpoch:0};
state.flights=[];
try{state.settings=JSON.parse(localStorage.getItem('blockpop-settings-v1')||'{}');}catch{}
if(!state.settings||typeof state.settings!=='object'||Array.isArray(state.settings))state.settings={};
state.reduced=typeof state.settings.reduced==='boolean'?state.settings.reduced:state.reduced;sound.volume=Number.isFinite(state.settings.volume)?Math.max(0,Math.min(1,state.settings.volume)):.65;sound.setEnabled(state.settings.sound!==false);
function setText(id,value){const el=$(id),text=String(value);if(el.textContent!==text)el.textContent=text;}
function settings(){document.body.classList.toggle('reduced',state.reduced);$('reducedMotion').checked=state.reduced;$('volume').value=Math.round(sound.volume*100);setText('soundButton',sound.enabled?'♪':'♪̸');$('soundButton').setAttribute('aria-pressed',String(sound.enabled));$('soundButton').setAttribute('aria-label',sound.enabled?'소리 끄기':'소리 켜기');setText('soundTest',!sound.enabled||sound.volume===0?'소리 켜고 들어 보기 ♪':'효과음 들어 보기 ♪');try{localStorage.setItem('blockpop-settings-v1',JSON.stringify({reduced:state.reduced,sound:sound.enabled,volume:sound.volume}));}catch{}}
settings();
function toast(text){setText('toast',text);$('toast').classList.add('visible');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function open(id){stopInput();if(!$(id).open)$(id).showModal();}
function close(id){$(id).close();}
function closeAll(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());}
function animate(el,name){el.classList.remove(name);el.getAnimations({subtree:true});el.classList.add(name);}
document.addEventListener('animationend',e=>{if(e.animationName==='attackRim'||e.animationName==='attackHit')e.target.classList.remove('attack-hit');});
function character(el,index){el.className='character '+(index===-1?'lumi':'rival r'+index);el.setAttribute('aria-label',index===-1?'루미':RIVALS[index].name);}
function renderRivals(){
 const grid=$('rivalGrid');grid.replaceChildren();
 RIVALS.forEach((r,i)=>{
  const unlocked=accessible(i,state.cleared),done=i<state.cleared,b=document.createElement('button');
  b.type='button';b.className='rival-card'+(done?' cleared':'')+(!unlocked?' locked':'')+(state.selected===i?' selected':'');
  b.dataset.rival=i;b.setAttribute('aria-pressed',String(state.selected===i));b.setAttribute('aria-disabled',String(!unlocked));
  b.setAttribute('aria-label',`${i+1}단계 ${r.name}. ${done?'완료':unlocked?'도전 가능':i+'단계를 이기면 열려요'}`);
  const number=document.createElement('span');number.className='rival-number';number.textContent=i+1;
  const art=document.createElement('span');character(art,i);art.setAttribute('aria-hidden','true');
  const name=document.createElement('strong');name.textContent=r.name;
  const status=document.createElement('small');status.textContent=i===state.selected?'✓ 선택됨':done?'✓ 완료':unlocked?'도전 가능':`${i}단계 2승 후`;
  b.append(number,art,name,status);b.onclick=()=>{if(!unlocked){toast(`${i}단계에서 먼저 2승하면 ${r.name}와 대결할 수 있어!`);return;}state.selected=i;renderRivals();grid.children[i].focus({preventScroll:true});};grid.append(b);
 });
 const r=RIVALS[state.selected];setText('selectedTitle',`${state.selected+1}단계 · ${r.name}`);setText('selectedLine',r.line);setText('rivalPace',r.pace);
 setText('challengeButton',state.selected<state.cleared?`${r.name}와 다시 대결 →`:`${r.name}에게 도전하기 →`);setText('completedCount',`${state.cleared} / 9 완료`);
}
function view(mode){
 window.scrollTo(0,0);state.mode=mode;$('home').hidden=mode!=='home';$('game').hidden=mode==='home';$('pauseButton').hidden=mode==='home';
 $('trainingBar').hidden=mode!=='training';$('holdButton').hidden=mode==='training'&&state.stage!==3;
 $('game').classList.toggle('hold-training',mode==='training'&&state.stage===3);$('game').classList.toggle('training',mode==='training');
 const r=RIVALS[state.rival];setText('headerMode',mode==='home'?'9명의 라이벌에게 도전!':mode==='training'?'하나씩 해 보면 준비 끝':`${state.rival+1}단계 · ${r.title}`);
 setText('gameMode',mode==='training'?`처음 해 보기 ${state.stage+1} / 4`:`${state.rival+1}단계 · ${r.name}`);
 setText('opponentName','AI · '+r.name);character($('opponentArt'),state.rival);
 const [myWins,theirWins]=state.series.wins;
 setText('roundRule',mode==='training'?'천천히 해도 괜찮아':`${myWins+theirWins+1}판 · ${myWins===1&&theirWins===1?'마지막 판!':myWins===1?'한 번만 더!':'먼저 2승'}`);
 setText('matchScore',mode==='training'?'':`나 ${state.series.wins[0]} : ${state.series.wins[1]} ${r.name}`);
 if(mode==='home')renderRivals();
}
function resetRound(){stopInput();clearTimeout(state.toastTimer);$('toast').classList.remove('visible');state.inputPiece=null;$('battleLane').querySelectorAll('.comet').forEach(el=>el.remove());for(const id of ['immediateBoard','nextBoard'])$(id).setAttribute('aria-label','다음 블록 준비 중');drawNext($('holdBoard'),[]);$('holdBoard').hidden=true;$('holdIcon').hidden=false;for(const id of ['myShell','otherShell','comboBadge','myQueueBox'])$(id).classList.remove('impact','defend','pop','reconnected');state.stageDone=false;state.game=null;$('myBoard').setAttribute('aria-label','내 블록판, 새 판 준비 중');drawBoard($('myBoard'),null);drawBoard($('otherBoard'),null);drawNext($('immediateBoard'),[]);drawNext($('nextBoard'),[]);$('comboBadge').classList.remove('hot');for(const id of ['comboNumber','myScore','otherScore','otherQueueCount'])$(id).textContent='0';setText('comboLabel','콤보 준비');setText('bestLabel','최고 0콤보');setText('mobileScore','내 0점');setText('timer','03:00');$('myQueueCount').innerHTML='0<span>줄</span>';$('myQueue').replaceChildren();$('myQueueBox').dataset.phase='empty';setText('queueHint','오는 공격 없음');setText('actionHint','준비가 끝나면 같이 시작해!');clearTimeout(state.comboTimer);$('comboImpact').hidden=true;$('gameMode').hidden=false;state.lastEvent=0;state.effects=[[],[]];state.actions=[];state.bot=null;state.seenResult=false;state.paused=false;$('countdown').hidden=true;$('eventBadge').className='event-badge';$('eventBadge').innerHTML='<span>차곡차곡 쌓아서</span><b>한 줄을 채워 봐!</b>';}
async function localStart(mode='challenge',stage=0){
 clearTimeout(state.eventTimer);closeAll();resetRound();state.slot=0;state.stage=stage;state.stageDone=false;state.trainingRetrySuggested=false;
 state.bot=createBot(state.rival);state.local=mode==='training'?training(stage):match(Math.floor(Math.random()*2147483646)+1);state.game=snapshot(state.local);view(mode);$('myBoard').focus({preventScroll:true});const started=state.local;void sound.unlock().then(()=>{if(state.local===started&&state.mode===mode)sound.play('start');});
 setText('actionHint',mode==='training'?['점선 자리에 내려놓으면 한 줄 완성!','두 줄씩 터뜨려 6콤보에 도전!','한 줄만 지워도 공격을 막을 수 있어!'][stage]:'점선이 놓일 자리야. 옮기고, 돌리고, 내려놓기!');
 setText('trainingText',['① 한 줄 채우기','② 두 줄씩 터뜨려 6콤보','③ 오는 공격 막기','④ 저장하고 다음 블록 꺼내기'][stage]);$('trainingNext').hidden=true;update();
}
function startChallenge(index=state.selected){if(!accessible(index,state.cleared))return;state.rival=index;state.selected=index;state.series={wins:[0,0],winner:null};void localStart('challenge');}
function home(){stopInput();clearTimeout(state.eventTimer);state.local=null;state.game=null;closeAll();$('countdown').hidden=true;view('home');$('challengeButton').focus();}
function setEvent(title,sub='',defense=false){clearTimeout(state.eventTimer);$('eventBadge').innerHTML='';const a=document.createElement('span'),b=document.createElement('b');a.textContent=sub;b.textContent=title;$('eventBadge').append(a,b);$('eventBadge').className='event-badge'+(defense?' defense':'');animate($('eventBadge'),'animate');state.eventTimer=setTimeout(()=>{a.textContent='다음 블록도 차근차근';b.textContent='한 줄을 채워 봐!';$('eventBadge').className='event-badge';},2400);}
function comboImpact(e){
 const el=$('comboImpact');clearTimeout(state.comboTimer);el.hidden=false;$('gameMode').hidden=true;
 el.dataset.tier=e.lines===4||e.combo>=6?'ultra':e.lines===3||e.combo>=4?'super':'normal';el.dataset.lines=e.lines;
 setText('impactKicker',e.combo>=6?'눈부신 연속 성공!':e.combo>=4?'멈출 수 없는 콤보!':e.combo>=2?'연속으로 터뜨렸어!':'첫 줄부터 짜릿하게!');
 setText('impactNumber',e.combo>=2?e.combo:e.lines);
 setText('impactLabel',e.combo>=2?'콤보!':'줄 완성!');
 el.dataset.digits=String(Math.min(4,String(e.combo).length));
 setText('impactDetail',e.resumed?`+${e.lines}콤보 · 다시 연결!`:`${e.lines}줄 팡! · +${e.lines}콤보`);
 $('comboBadge').dataset.record=String(e.newBest&&e.combo>=4);
 const duration=e.resumed?1600:1100;el.style.animationDuration=`${duration}ms`;
 if(e.combo>=2||e.lines>=2){$('myShell').dataset.comboTier=el.dataset.tier;animate($('myShell'),'combo-strike');}
 animate(el,'burst');state.comboTimer=setTimeout(()=>{el.hidden=true;$('gameMode').hidden=false;},duration);
}
function launchAttack(e,game){
 const own=e.player===state.slot,n=Math.min(4,e.n),from=$(own?'myBoard':'otherBoard'),to=$(own?'otherBoard':'myBoard');
 if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){animate($(own?'otherShell':'myQueueBox'),'defend');return;}
 const lock=game.events.findLast(x=>x.type==='lock'&&x.player===e.player&&x.time===e.time);
 const row=lock?.rows?.length?lock.rows.reduce((a,b)=>a+b,0)/lock.rows.length:null;
 state.flights.push({own,n,from,to,color:lock?.fragments?.[0]?.[2]||2,sourceY:row===null?.85:Math.max(.05,Math.min(.96,(row-TOP+.5)/(H-TOP))),born:performance.now(),hit:false,hits:0});
 if(state.flights.length>12)state.flights.shift();
}
function recoil(el,strength=1){el.style.setProperty('--kick',`${Math.min(9,2+strength*1.1)}px`);animate(el,'impact');}
function events(game){
 let ownClear=null,ownSent=0,clashed=0;
 for(const e of game.events||[]){if(e.id<=state.lastEvent)continue;state.lastEvent=e.id;
  if(e.type==='lock'){
   state.effects[e.player].push({...e,born:performance.now()});
   if(e.player===state.slot){
    if(e.lines)recoil($('myShell'),e.lines+Math.min(2,Math.max(0,e.combo-1))*.5);
    if(e.lines){ownClear=e;sound.play('clear',e.combo,e.lines);comboImpact(e);$('comboBadge').classList.remove('pop','reconnected');animate($('comboBadge'),e.resumed?'reconnected':'pop');}
    else{sound.play('land');if(e.previousCombo){if(!e.combo){clearTimeout(state.comboTimer);$('comboImpact').hidden=true;$('gameMode').hidden=false;}if(e.combo)setEvent(`${e.combo}콤보 유지!`,e.comboMisses===1?'한 블록 더 쉬어도 괜찮아':'이번 블록으로 이어 보자!');else setEvent(e.previousCombo>=2?`${e.previousCombo}콤보 마무리!`:'다시 한 줄부터!', '최고 기록은 그대로 남아 있어');}}
    if(e.defended){sound.play('defend');animate($('myQueueBox'),'defend');setEvent(`${e.defended}줄 막았어!`,'지워서 지켜냈어',true);setText('actionHint','오는 공격이 줄었어. 다음 줄도 채워 보자!');}
   }
  }else if(e.type==='send'){
   if(e.player===state.slot){ownSent+=e.n;sound.play('send');setEvent(e.counter?`반격 ${e.n}줄`:`보낸 공격 ${e.n}줄`,e.counter?`${game.events.findLast(x=>x.type==='lock'&&x.player===state.slot&&x.time===e.time)?.defended||0}줄 막고, ${e.n}줄 보내기`:'상대의 예고 칸으로');}
   else{sound.play('start');setText('actionHint',`공격 ${e.n}줄이 왔어. 줄을 지워 막아 봐!`);}
   launchAttack(e,game);
  }else if(e.type==='clash'){clashed+=e.n;setEvent(`${e.n}줄 서로 막기`,'두 공격이 만났어',true);sound.play('defend');}
  else if(e.type==='rise'){if(e.player===state.slot){sound.play('rise');setEvent(`${e.n}줄 올라왔어`,'빈칸을 채우면 지울 수 있어');}recoil(e.player===state.slot?$('myShell'):$('otherShell'),3);}
 }
 if(ownClear){const e=ownClear,sub=e.defended?(ownSent?`${e.defended}줄 막고 ${ownSent}줄 반격`:`${e.defended}줄 방어 성공`):ownSent?`공격 ${ownSent}줄 보냈어`:clashed?`${clashed}줄 서로 막았어`:e.newBest&&e.combo>=4?'내 최고 콤보 기록!':e.normal===0?'회색 줄 정리 · 득점은 그대로':`${e.lines}줄을 함께 지웠어`;setEvent(e.resumed?`${e.combo}콤보 연결!`:e.combo>=2?`${e.combo}콤보!`:'한 줄 완성!',sub,!!e.defended);}
}
function update(){
 const g=state.game;if(!g)return;events(g);const p=g.players[state.slot],other=g.players[1-state.slot];
 if(state.inputPiece!==p.pieceId){for(const source of repeating.keys())stopRepeat(source);state.inputPiece=p.pieceId;}
 setText('myScore',p.score);setText('mobileScore',`내 ${p.score}점`);setText('otherScore',other.score);setText('comboNumber',p.combo||'0');setText('comboLabel',p.combo&&p.comboMisses?'콤보 유지':p.combo>=2?'콤보!':p.combo===1?'첫 성공!':'콤보 준비');$('comboBadge').classList.toggle('hot',p.combo>=4);setText('bestLabel',`최고 ${p.best}콤보`);
 $('comboBadge').dataset.digits=String(Math.min(4,String(p.combo).length));$('comboBadge').dataset.grace=String(p.comboMisses);if(!p.combo||p.comboMisses)$('comboBadge').dataset.record='false';
 $('comboGrace').hidden=!p.combo;setText('graceLabel',p.comboMisses===2?'지워야 유지!':`${2-p.comboMisses}블록 여유`);
 $('comboGrace').setAttribute('aria-label',p.comboMisses===2?'이번 블록으로 줄을 지우면 콤보가 이어져요':`줄을 지우지 않아도 블록 ${2-p.comboMisses}개까지 콤보 유지`);
 $('comboGrace').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('available',i<2-p.comboMisses));
 const rows=landingRows(p);
 $('actionHint').classList.toggle('ready-clear',!!rows.length&&!state.stageDone);
 let hint=state.stageDone?(state.stage===3?'보관 성공! 라이벌에게 도전하기를 눌러 봐.':'성공! 다음 체험 버튼을 눌러 봐.'):rows.length?`내려놓으면 ${rows.length}줄 → ${p.combo+rows.length}콤보!`:'점선이 놓일 자리야 · 한 줄을 채워 봐!';
 if(!state.stageDone&&p.combo&&!rows.length)hint=p.comboMisses===2?'이번 블록으로 줄을 지워 이어 봐!':p.comboMisses===1?'한 블록 더 놓아도 콤보 유지!':'줄 안 지워도 2블록까지 유지!';
 if(state.mode==='training'&&state.stage===3&&!state.stageDone&&p.hold===null)hint='막대는 잠깐 저장! 보관함을 눌러 봐.';
 const q=queued(p),due=p.queue.filter(x=>x.due<=g.time).reduce((n,x)=>n+x.n,0);const count=$('myQueueCount').firstChild;if(count.data!==String(q))count.data=q;setText('otherQueueCount',queued(other));const dots=$('myQueue');if(dots.children.length!==8)dots.replaceChildren(...Array.from({length:8},()=>document.createElement('i')));for(let i=0;i<8;i++){const name=i<q?'on'+(i<due?' due':''):'';if(dots.children[i].className!==name)dots.children[i].className=name;}
 const ready=due>0;
 if(!state.stageDone&&ready&&!rows.length)hint=`줄을 못 지우면 ${Math.min(2,due)}줄 올라와!`;
 if(state.mode==='training'&&state.stage===2&&!state.stageDone&&rows.length)hint='내려놓으면 공격을 막아!';
 setText('actionHint',hint);
 $('myQueueBox').dataset.phase=q?(ready?'ready':'waiting'):'empty';
 const willBlock=rows.length?Math.min(q,Math.max(rows.length,attack(rows.length,p.combo+rows.length))):0;
 setText('queueHint',willBlock?`이번에 ${willBlock}줄 방어!`:q?(ready?`못 지우면 ${Math.min(2,due)}줄 올라와`:'줄을 지우면 막아!'):'오는 공격 없음');
 $('myQueueBox').setAttribute('aria-label',q?`오는 공격 ${q}줄. 줄을 지우면 막을 수 있어요.`:'오는 공격 없음');

 const left=Math.max(0,Math.ceil((DURATION-g.time)/1000));setText('timer',state.mode==='training'?'천천히':`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`);
 $('timer').dataset.urgent=String(state.mode==='challenge'&&left>0&&left<=30);
 $('timer').setAttribute('aria-label',state.mode==='training'?'시간 제한 없이 연습':`남은 시간 ${Math.floor(left/60)}분 ${left%60}초. 시간이 끝나면 득점이 높은 쪽이 이겨요.`);
 $('timer').title=state.mode==='training'?'시간 제한 없이 연습':'3분이 끝나면 득점이 높은 쪽이 이겨요';
 $('myBoard').setAttribute('aria-label',`내 블록판, 일반 줄 ${p.score}, ${p.combo}콤보, 오는 공격 ${q}줄`);drawNext($('immediateBoard'),(p.next||[]).slice(0,1),true);drawNext($('nextBoard'),(p.next||[]).slice(1));
 $('immediateBoard').setAttribute('aria-label','바로 다음: '+shapeNames[p.next?.[0]]);
 $('nextBoard').setAttribute('aria-label','그다음: '+(p.next||[]).slice(1).map(t=>shapeNames[t]).join(', '));
 drawNext($('holdBoard'),p.hold==null?[]:[p.hold]);$('holdBoard').hidden=p.hold==null;$('holdIcon').hidden=p.hold!=null;
 setText('holdLabel','보관함');setText('holdHint',state.stageDone?'대결에서 사용':p.holdUsed?'내려놓은 뒤 사용':p.hold==null?'지금 블록 넣기':`${shapeNames[p.hold].replace(' 모양','')} 꺼내기`);
 $('holdButton').setAttribute('aria-label',state.stageDone?'체험 완료. 라이벌에게 도전하기를 눌러 주세요':p.holdUsed?'블록을 놓으면 다시 바꿀 수 있어요':p.hold==null?'현재 블록을 보관하고 다음 블록 꺼내기':'보관한 블록과 바꾸기');
 if(p.hold!=null)$('holdButton').setAttribute('aria-label',shapeNames[p.hold]+' 보관 중. '+$('holdButton').getAttribute('aria-label'));
 $('holdButton').classList.toggle('gold',state.mode==='training'&&state.stage===3&&p.hold===null&&!state.stageDone);
 document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!canAct(b.dataset.action));
 const retry=state.mode==='training'&&state.trainingRetrySuggested&&!state.stageDone;
 $('trainingSkip').hidden=state.mode==='training'&&state.stage===3&&state.stageDone;
 const suggestRetry=retry&&!p.combo;
 setText('trainingRetry',retry?'연습판 다시 준비':'이 체험 다시');$('trainingRetry').classList.toggle('gold',suggestRetry);$('trainingRetry').classList.toggle('text-button',!suggestRetry);
 if(retry)setText('trainingText',p.combo?'다시 시작했어! 6콤보까지 이어 보자.':'콤보가 끊겼어. 연습판을 다시 준비해 볼까?');
 if(g.done&&!state.seenResult)showResult();
}
function canPlay(){return state.game&&!state.game.done&&!state.paused&&!state.stageDone&&!document.querySelector('dialog[open]');}
function pendingFirstHold(p){return state.mode==='training'&&state.stage===3&&p.hold===null?state.actions.find(a=>a.action==='hold'&&a.pieceId===p.pieceId&&a.isCurrent()):null;}
function canAct(name){
 if(!canPlay())return false;const p=state.game.players[state.slot];
 if(name==='hold'&&(p.holdUsed||(state.mode==='training'&&state.stage!==3)))return false;
 return !(state.mode==='training'&&state.stage===3&&p.hold===null&&name!=='hold'&&!pendingFirstHold(p));
}

function rotationFeedback(turned,type){if(turned)sound.play('rotate');else setEvent(type===1?'네모는 같은 모양!':'돌릴 공간이 부족해',type===1?'그대로 놓아도 괜찮아':'옆으로 옮겨서 놓아 봐');}
function action(name,isCurrent=()=>true){if(!canAct(name))return;void sound.unlock();const p=state.game.players[state.slot];if(!p.piece)return;
 const firstHold=name!=='hold'&&pendingFirstHold(p);
 state.actions.push({action:name,pieceId:p.pieceId,isCurrent:firstHold?()=>isCurrent()&&firstHold.isCurrent():isCurrent,onRotate:name==='rotate'?rotationFeedback:undefined,onHold:name==='hold'?()=>sound.play('rotate'):undefined});
}
// Own repeat timing keeps keyboard and touch independent of the OS delay.
const repeating=new Map();
function stopRepeat(source){const r=repeating.get(source);if(!r)return;clearTimeout(r.delay);clearInterval(r.timer);r.button?.classList.remove('pressed');repeating.delete(source);}
function stopInput(){state.inputEpoch++;state.actions=[];state.flights=[];document.querySelectorAll('.combo-strike,.attack-hit').forEach(el=>el.classList.remove('combo-strike','attack-hit'));for(const source of repeating.keys())stopRepeat(source);for(const token of pointerActions.values())token.cancelled=true;pointerActions.clear();document.querySelectorAll('.controls .pressed,.hold-button.pressed').forEach(b=>b.classList.remove('pressed'));}
function startRepeat(name,source,button,initialCurrent=()=>true){
 if(repeating.has(source)||!canAct(name))return;
 const r={name,button,busy:false};repeating.set(source,r);button?.classList.add('pressed');action(name,initialCurrent);
 const current=()=>repeating.get(source)===r&&(name==='soft'||[...repeating.values()].findLast(x=>x.name!=='soft')===r);
 const tick=()=>{
  if(repeating.get(source)!==r)return;if(!canAct(name)){stopRepeat(source);return;}
  if(!current())return;
  if(r.busy)return;r.busy=true;
  Promise.resolve(action(name,current)).finally(()=>{r.busy=false;});
 };
 r.delay=setTimeout(()=>{tick();if(repeating.get(source)===r)r.timer=setInterval(tick,60);},100);
}
const pointerActions=new Map();
for(const b of document.querySelectorAll('[data-action]')){
 b.addEventListener('contextmenu',e=>e.preventDefault());
 b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);const source='pointer:'+e.pointerId;
  const token={cancelled:false};pointerActions.set(e.pointerId,token);
  if(['left','right'].includes(b.dataset.action))startRepeat(b.dataset.action,source,b,()=>!token.cancelled);else{b.classList.add('pressed');action(b.dataset.action,()=>!token.cancelled);}
 });
 const release=e=>{const token=pointerActions.get(e.pointerId);if(token&&e.type!=='pointerup')token.cancelled=true;pointerActions.delete(e.pointerId);stopRepeat('pointer:'+e.pointerId);b.classList.remove('pressed');};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('click',e=>{if(e.detail===0)action(b.dataset.action);});
}
const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'soft',' ':'drop',c:'hold',C:'hold'};
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||document.activeElement.isContentEditable||(e.key===' '&&document.activeElement.matches('button')))return;
 const name=e.code==='KeyC'?'hold':keys[e.key];
 if(name&&state.mode!=='home'&&!document.querySelector('dialog[open]')){
  e.preventDefault();if(e.repeat)return;
  const button=document.querySelector(`[data-action="${name}"]`);
  if(['left','right','soft'].includes(name))startRepeat(name,'key:'+e.key,button);else{if(canAct(name))button?.classList.add('pressed');action(name);}
 }
 if(e.key==='Escape'&&canPlay())pause();
});
window.addEventListener('keyup',e=>{stopRepeat('key:'+e.key);const name=e.code==='KeyC'?'hold':keys[e.key];if(name&&!['left','right','soft'].includes(name))document.querySelector(`[data-action="${name}"]`)?.classList.remove('pressed');});window.addEventListener('blur',()=>{stopInput();if(['challenge','training'].includes(state.mode)&&canPlay())pause();});
document.addEventListener('visibilitychange',()=>{stopInput();if(document.hidden&&['challenge','training'].includes(state.mode)&&canPlay())pause();});
function botActions(){return rivalActions(state.bot,state.local.players[1],state.local.time);}
function takeActions(now){
 state.actions=state.actions.filter(a=>a.isCurrent());
 // Keep an intentional fast drop until the existing 150ms landing guard opens.
 if(now-state.local.players[state.slot].lastLock<150&&state.actions.some(a=>a.action==='drop'))return [];
 return state.actions.splice(0);
}
setInterval(()=>{
 if(!state.local||state.mode==='home'||state.paused||state.local.done||document.querySelector('dialog[open]')||state.stageDone)return;
 if(state.mode==='training'){
  state.local.time+=TICK;const p=state.local.players[0];p.gravity=-1000;const l=progress(p,takeActions(state.local.time),TICK,state.local.time);resolve(state.local,[l,null]);if(state.stage===1&&l?.lines&&p.combo<6)p.piece.x=W/2-1;
  if(state.stage===1&&l?.previousCombo&&!l.combo)state.trainingRetrySuggested=true;
  if((state.stage===0&&p.lines>=1)||(state.stage===1&&p.combo>=6)||(state.stage===2&&p.blocked>=1)||(state.stage===3&&p.hold!==null&&p.lines>=1)){
   state.stageDone=true;$('trainingNext').hidden=false;setText('trainingNext',state.stage===3?'라이벌에게 도전하기 →':'다음 체험 →');setText('trainingText',['좋아! 한 줄을 완성했어.',`${p.combo}콤보! 줄을 이어서 성공!`,'공격 1줄을 막았어!','저장하고 바꿔서 한 줄 완성!'][state.stage]);$('trainingNext').focus();
  }else if(p.dead){void localStart('training',state.stage);setText('trainingText','판이 가득 찼어. 새 판에서 다시 해 보자!');return;}
 }else step(state.local,[takeActions(state.local.time+TICK),botActions()]);
 state.game=snapshot(state.local);update();
},TICK);
function frame(){const g=state.game,now=performance.now();if(g&&state.mode!=='home'){
 state.effects=state.effects.map(es=>es.filter(e=>now-e.born<850));drawBoard($('myBoard'),g.players[state.slot],state.effects[state.slot],now,state.reduced);drawBoard($('otherBoard'),g.players[1-state.slot],state.effects[1-state.slot],now,state.reduced);
 if(state.reduced||state.paused)state.flights=[];
 state.flights=state.flights.filter(f=>now-f.born<flightDuration(f.n));
 for(const f of state.flights){const hits=flightHits(now-f.born,f.n);if(hits>f.hits){animate($(f.own?'otherShell':'myShell'),'attack-hit');if(!f.hit){if(f.own)sound.play('hit',f.n,f.n);else animate($('myQueueBox'),'attack-hit');}f.hit=true;f.hits=hits;}}
 }drawFlights($('battleEffects'),state.flights,now);requestAnimationFrame(frame);}requestAnimationFrame(frame);
function pause(){stopInput();state.paused=true;open('pauseDialog');setText('pauseTitle','잠깐 쉬어 가자');setText('pauseText',state.mode==='challenge'?`현재 ${state.series.wins[0]} : ${state.series.wins[1]}. 계속하기를 누르면 이어서 해요. 목록으로 나가면 이번 대결은 0 : 0부터 다시 시작해요.`:'준비되면 이어서 할 수 있어.');setText('leaveButton',state.mode==='challenge'?'대결 끝내고 목록':'라이벌 목록');$('resumeButton').disabled=false;setText('resumeButton','계속하기');update();}
function showResult(){
 state.seenResult=true;stopInput();close('pauseDialog');const g=state.game,p=g.players[0],win=g.winner===0,before=state.cleared;
 state.series=advanceSeries(state.series,g.winner);
 const seriesWin=state.series.winner===0,seriesDone=state.series.winner!==null,wins=state.series.wins,round=wins[0]+wins[1];
 state.cleared=completeStage(state.cleared,state.rival,state.series.winner);
 const newlyUnlocked=state.cleared>before&&state.cleared<9,finished=seriesWin&&state.rival===8;
 state.resultNext=seriesWin&&state.rival<8?state.rival+1:state.rival;
 $('resultDialog').dataset.outcome=win?'win':'retry';
 setText('resultTitle',finished?'9단계 모두 승리!':seriesWin?`${state.rival+1}단계 승리!`:seriesDone?'괜찮아, 다시 도전!':g.winner===null?'무승부! 한 판 더':win?`${round}판 승리!`:`${round}판 패배 · 아직 기회!`);
 setText('resultSubtitle',finished?'먼저 2승! 모든 라이벌을 이긴 챔피언이야.':newlyUnlocked?'먼저 2승! 새로운 라이벌이 열렸어요':seriesWin?'먼저 2승! 다음 라이벌에게 도전해 볼까?':seriesDone?`${RIVALS[state.rival].name}의 2승. 다시 0 : 0부터 도전해 보자.`:g.winner===null?'승수는 그대로! 같은 판을 다시 해 보자.':wins[0]===1&&wins[1]===1?'1 : 1! 마지막 한 판으로 승부를 가려요.':win?(state.rival===8?'한 번만 더 이기면 챔피언!':state.rival<before?'한 번만 더 이기면 이번 대결 승리!':'한 번만 더 이기면 다음 라이벌이 열려요.'):'다음 판에서 따라잡아 보자. 먼저 2승하면 이겨요.');
 setText('resultSeries',`나 ${wins[0]} : ${wins[1]} ${RIVALS[state.rival].name}`);
 setText('resultRound',(g.reason==='time'?'3분 종료':g.winner===null?'둘 다 블록이 가득 찼어요':win?'상대 블록이 가득 찼어요':'내 블록이 가득 찼어요')+` · 나 ${p.score}점 / ${RIVALS[state.rival].name} ${g.players[1].score}점`);
 const r=RIVALS[state.resultNext];character($('resultRival'),state.resultNext);setText('unlockTitle',finished?'챔피언 · 루미':`${state.resultNext+1}단계 · ${r.name}`);setText('unlockDetail',finished?'모든 라이벌을 다시 만날 수 있어요':seriesDone?r.title:'같은 라이벌과 다음 판!');
 if(finished)character($('resultRival'),-1);
 $('resultProgress').hidden=!seriesDone;
 setText('resultHome',seriesDone?'라이벌 목록':'대결 끝내고 목록');
 $('resultProgress').replaceChildren(...RIVALS.map((r,i)=>{const el=document.createElement('span');el.className=i<state.cleared?'done':i===state.cleared?'available':'';el.textContent=`${i+1}${i<state.cleared?' ✓':''}`;el.setAttribute('aria-label',`${i+1}단계 ${i<state.cleared?'완료':i===state.cleared?'도전 가능':'잠김'}`);return el;}));
 setText('resultCombo',p.best);setText('resultBlocked',p.blocked);setText('resultScore',p.score);
 $('againButton').disabled=false;setText('againButton',finished?'챔피언과 다시 대결':seriesWin?`${r.name}에게 도전하기 →`:seriesDone?'다시 도전하기':g.winner===null?`${round+1}판 다시 하기 →`:`${round+1}판 시작하기 →`);
 open('resultDialog');$('againButton').focus();sound.play(win?'win':'start',3);
}
$('challengeButton').onclick=()=>startChallenge();$('learnButton').onclick=()=>localStart('training');
$('leaveButton').onclick=home;$('resultHome').onclick=()=>{state.selected=state.resultNext;home();};
$('homeButton').onclick=()=>state.mode==='home'?null:state.game&&!state.game.done?pause():home();$('pauseButton').onclick=pause;
function focusPlay(){ $(state.mode==='training'&&state.stageDone&&!$('trainingNext').hidden?'trainingNext':'myBoard').focus({preventScroll:true}); }
function resume(){void sound.unlock();state.paused=false;close('pauseDialog');update();focusPlay();}
$('resumeButton').onclick=resume;
$('againButton').onclick=()=>state.series.winner===null?localStart('challenge'):startChallenge(state.resultNext);
$('trainingNext').onclick=()=>state.stage<3?localStart('training',state.stage+1):startChallenge();$('trainingSkip').onclick=()=>startChallenge();
$('trainingRetry').onclick=()=>localStart('training',state.stage);
$('soundButton').onclick=async()=>{sound.setEnabled(!sound.enabled);settings();await sound.unlock();if(sound.enabled)sound.play('start');};
$('settingsButton').onclick=()=>{stopInput();if(state.mode!=='home')state.paused=true;open('settingsDialog');update();};
function restoreAfterSettings(){
 if($('settingsDialog').open)return;
 if($('resultDialog').open){$('againButton').focus({preventScroll:true});return;}
 if($('pauseDialog').open){$('resumeButton').focus({preventScroll:true});return;}
 if(state.mode==='home')return;
 state.paused=false;update();focusPlay();
}
function closeSettings(){close('settingsDialog');restoreAfterSettings();}
$('settingsDialog').addEventListener('close',restoreAfterSettings);
$('settingsDialog').addEventListener('cancel',e=>{e.preventDefault();closeSettings();});
$('volume').oninput=()=>{sound.setVolume($('volume').value/100);settings();};$('reducedMotion').onchange=()=>{state.reduced=$('reducedMotion').checked;settings();};$('soundTest').onclick=async()=>{if(!sound.enabled||sound.volume===0){sound.setEnabled(true);if(sound.volume===0)sound.setVolume(.5);settings();}if(await sound.unlock())sound.play('clear',4);else toast('이 브라우저에서 소리를 시작하지 못했어요.');};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').id==='settingsDialog'?closeSettings():b.closest('dialog').close());
$('pauseDialog').addEventListener('cancel',e=>{e.preventDefault();resume();});
$('resultDialog').addEventListener('cancel',e=>{e.preventDefault();$('againButton').focus();});
try{sessionStorage.removeItem('blockpop-session-v1');}catch{}
view('home');
