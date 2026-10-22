/* 수군 학익진 협동 훈련 (naval-v9)
 * 자립형 모듈: 외부 의존 없음. mountNavalBattle({root,onComplete,onFailure,isReduced}) => cleanup
 * 게임 규칙은 순수 함수(createBattle / spawnShip / advance / shoot)로 분리되어 있어 단독 테스트가 가능해요.
 */

const here=import.meta.url;
const asset=name=>new URL('./assets/naval/'+name,here).href;
const STYLE_ID='naval-v9-style';

export const RULES=Object.freeze({
 winHits:50,          // 50척을 막으면 성공
 maxBreach:5,         // 5척을 놓치면 실패
 spawnEarly:.76,      // 처음 10척까지 등장 간격(초)
 spawnLate:.38,       // 11척째부터 등장 간격(초)
 lateAfter:10,
 maxSpawn:55,         // 최대 등장 수
 cooldownNormal:.28,  // 일반 포격 재장전(초)
 cooldownCombo:.09,   // 협공 구역 포격 재장전(초)
 goldTop:40,goldBottom:68, // 금빛 협공 구역(y %)
 breachY:82,          // 이 선을 넘으면 방어선 통과
 startY:-12,
 baseSpeed:7.5,       // % / 초
 maxStep:.05          // 한 프레임 최대 진행 시간(초) — 탭 복귀 시 시간 점프 방지
});

export const inGoldZone=y=>y>=RULES.goldTop&&y<=RULES.goldBottom;
export const spawnInterval=state=>state.spawned>=RULES.lateAfter?RULES.spawnLate:RULES.spawnEarly;
export const waveNumber=state=>Math.min(5,Math.floor(state.spawned/10)+1);

export function createBattle(){
 return {hit:0,breach:0,spawned:0,clock:0,cooldown:0,ships:[],ended:false,won:null,nextId:1};
}
function makeShip(state){
 return {id:state.nextId,x:10+(state.spawned*19%72),y:RULES.startY,speed:RULES.baseSpeed+Math.min(3,Math.floor(state.hit/10)),dead:false};
}
/** 적선 한 척을 즉시 등장시켜요. => {state, ship} (등장 한도에 도달하면 ship=null) */
export function spawnShip(s){
 if(s.ended||s.spawned>=RULES.maxSpawn)return {state:s,ship:null};
 const ship=makeShip(s);
 return {state:{...s,ships:[...s.ships,ship],spawned:s.spawned+1,nextId:s.nextId+1,clock:0},ship};
}
/** dt초만큼 진행. => {state, spawned:[ship], breached:[ship], finished} */
export function advance(s,dt){
 dt=Math.max(0,Math.min(RULES.maxStep,Number(dt)||0));
 if(s.ended||dt===0)return {state:s,spawned:[],breached:[],finished:false};
 let state={...s,ships:s.ships.map(e=>({...e}))};
 state.cooldown=Math.max(0,state.cooldown-dt);
 state.clock+=dt;
 const spawned=[],breached=[];
 if(state.clock>=spawnInterval(state)&&state.spawned<RULES.maxSpawn){
  const r=spawnShip(state);state=r.state;spawned.push(r.ship);
 }
 for(const e of state.ships){
  e.y+=dt*e.speed;
  if(e.y>RULES.breachY){e.dead=true;breached.push(e);state.breach++;}
 }
 state.ships=state.ships.filter(e=>!e.dead);
 let finished=false;
 if(state.breach>=RULES.maxBreach){state.ended=true;state.won=false;finished=true;}
 return {state,spawned,breached,finished};
}
/** 적선 id를 포격. => {state, ok, reason?, combo?, ship?, finished} */
export function shoot(s,id){
 if(s.ended)return {state:s,ok:false,reason:'ended',finished:true};
 if(s.cooldown>0)return {state:s,ok:false,reason:'cooldown',finished:false};
 const ship=s.ships.find(e=>e.id===id&&!e.dead);
 if(!ship)return {state:s,ok:false,reason:'missing',finished:false};
 if(ship.y<0)return {state:s,ok:false,reason:'far',finished:false};
 const combo=inGoldZone(ship.y);
 const state={...s,ships:s.ships.filter(e=>e.id!==id),cooldown:combo?RULES.cooldownCombo:RULES.cooldownNormal,hit:s.hit+1};
 if(state.hit>=RULES.winHits){state.ended=true;state.won=true;}
 return {state,ok:true,combo,ship,finished:state.ended};
}

/* ---------- 그림 ---------- */
const ATLAS={src:asset('naval-sprites.webp'),w:1536,h:1024};
const RECT={ally:[150,0,580,639],enemy:[895,0,535,639],flash:[60,642,710,382],splash:[810,640,726,384]};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mountSerial=0;

function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;
 const link=document.createElement('link');link.id=STYLE_ID;link.rel='stylesheet';link.href=new URL('./naval-battle.css',here).href;document.head.append(link);
}

/**
 * 수군 훈련 모듈을 root 안에 띄워요.
 * - onComplete({kind:'naval-v9',hit:50,breach}) : 성공 후 사용자가 '다음' 버튼을 눌렀을 때 한 번만
 * - onFailure() => charged(boolean) : 실패한 도전마다 한 번만 호출. 사용자는 다시 도전할 수 있어요.
 * - isReduced() : 움직임 줄이기 여부
 * 반환값은 cleanup 함수. RAF/타이머/리스너를 모두 해제하고 이후 콜백을 보내지 않아요.
 */
export function mountNavalBattle({root,onComplete=()=>{},onFailure=()=>false,isReduced=()=>false}={}){
 if(!root||!root.isConnected)throw new Error('mountNavalBattle: root가 문서에 연결되어 있어야 해요.');
 ensureStyle();
 const prefix='naval-v9-'+(++mountSerial);
 const host=root.closest('dialog');
 let closed=false,raf=0,attempt=0;
 const timers=new Set();
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!closed)fn();},ms);timers.add(id);return id;};
 const safe=fn=>(...a)=>{if(closed)return;fn(...a);};

 const wrapper=document.createElement('div');wrapper.className='naval-v9';
 wrapper.innerHTML=`<svg class="naval-defs" aria-hidden="true" focusable="false"><defs>${Object.entries(RECT).map(([k,[x,y,w,h]])=>`<clipPath id="${prefix}-${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`).join('')}</defs></svg><div class="naval-screen"></div>`;
 root.replaceChildren(wrapper);
 const screen=wrapper.querySelector('.naval-screen');
 const sprite=(name,label='',cls='')=>{const [x,y,w,h]=RECT[name];return `<svg class="naval-sprite naval-sprite-${name} ${cls}" viewBox="${x} ${y} ${w} ${h}" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'} focusable="false"><image href="${ATLAS.src}" width="${ATLAS.w}" height="${ATLAS.h}" clip-path="url(#${prefix}-${name})"/></svg>`;};

 // 문서 숨김 리스너 — 숨겨지면 사용자 일시정지로 전환해 복귀 후 직접 이어가도록 해요.
 let game=null;
 const onVisibility=()=>{if(closed||!game)return;if(document.hidden){game.userPaused=true;game.last=0;game.paintPause();}};
 document.addEventListener('visibilitychange',onVisibility);

 function syncReduced(){wrapper.classList.toggle('is-reduced',!!isReduced());}

 /* ---------- 출항 전 안내 ---------- */
 function intro(note=''){
  syncReduced();
  screen.innerHTML=`<section class="naval-intro">
   <div class="naval-poster" aria-hidden="true"><img class="naval-poster-sea" src="${asset('naval-sea.webp')}" alt="" decoding="async">${sprite('ally','','naval-poster-left')}<img class="naval-poster-turtle" src="${asset('turtle-ship.webp')}" alt="" decoding="async">${sprite('ally','','naval-poster-right')}${sprite('enemy','','naval-poster-enemy')}</div>
   <div class="naval-intro-text">
    <span class="naval-eyebrow">수군의 준비 · 학익진 협동 훈련</span>
    <h3>학의 날개처럼 펼쳐라!</h3>
    <p>가운데 <b>거북선</b>과 양옆 <b>판옥선</b>이 힘을 모아 바닷길을 지켜요.</p>
    <ol class="naval-howto">
     <li><b>다가오는 적선을 눌러</b> 조준하세요. 한 번 쏘면 잠시 재장전해요.</li>
     <li>적선이 <b>금빛 협공 구역</b>에 들어오면 재장전이 빨라져 연속으로 공격할 수 있어요.</li>
     <li>적선 <b>50척</b>을 막으면 성공! <b>5척</b>을 놓치면 도전 실패예요. 실패한 도전마다 <b>−10점</b>이며 다시 도전할 수 있어요.</li>
    </ol>
    <p class="naval-note">배 3척과 적선 50척은 훈련 게임의 수치예요. 실제 전투의 함대 수가 아니에요.</p><p class="naval-note">움직임 줄이기를 켜면 장식 효과를 줄이고 적선이 70% 속도로 움직여요. 조준에 필요한 적선 이동은 유지돼요.</p>
    ${note?`<p class="naval-retry-note" role="status">${note}</p>`:''}
    <button type="button" class="naval-gold naval-sail">세 척과 함께 출항 →</button>
   </div>
  </section>`;
  const sail=screen.querySelector('.naval-sail');sail.onclick=safe(()=>battle());
  if(note)sail.focus();
 }

 /* ---------- 실시간 훈련 ---------- */
 function battle(){
  attempt++;
  let state=createBattle();let last=0,userPaused=false,failureReported=false,completed=false;
  const buttons=new Map();
  screen.innerHTML=`<div class="naval-hud">
    <b class="naval-hit">막은 적선 0 / ${RULES.winHits}</b>
    <span class="naval-wave">첫 번째 물결</span>
    <span class="naval-breach">놓친 적선 0 / ${RULES.maxBreach}</span>
    <button type="button" class="naval-pause" aria-pressed="false" aria-label="훈련 잠시 멈춤">⏸ 잠시 멈춤</button>
   </div>
   <div class="naval-field" role="group" aria-label="바다 훈련장. 다가오는 적선 버튼을 눌러 조준해요.">
    <div class="naval-water"></div>
    <div class="naval-warning" role="status" hidden>적선이 몰려와요!<small>이제 두 배 빠르게 나타나요</small></div>
    <div class="naval-zone" aria-hidden="true"><svg class="naval-zone-ripples" viewBox="0 0 800 100" preserveAspectRatio="none"><path d="M0 6 Q100 0 200 6 T400 6 T600 6 T800 6"/><path d="M0 94 Q100 100 200 94 T400 94 T600 94 T800 94"/></svg><span>금빛 협공 구역 · 빠르게 연속 공격!</span></div>
    ${[0,1,2].map(i=>`<div class="naval-ally naval-ally-${i}" aria-hidden="true">${i===1?`<img class="naval-turtle" src="${asset('turtle-ship.webp')}" alt="" decoding="async">`:sprite('ally')}<span class="naval-flash">${sprite('flash')}</span><b>${['왼쪽 · 판옥선','중앙 · 거북선','오른쪽 · 판옥선'][i]}</b></div>`).join('')}
    <div class="naval-shore" aria-hidden="true">우리 수군의 방어선</div>
    <span class="naval-ready" aria-hidden="true">조준할 적선을 눌러요</span>
    <div class="naval-pause-layer" hidden><p class="naval-pause-text"></p><button type="button" class="naval-resume naval-gold">▶ 이어서 훈련하기</button></div>
   </div>
   <div class="naval-feedback" role="status">가운데 거북선과 양옆 판옥선이 힘을 모아요. 적선을 눌러 조준해요!</div>`;
  const $=s=>screen.querySelector(s);
  const field=$('.naval-field'),feedback=$('.naval-feedback'),pauseBtn=$('.naval-pause'),pauseLayer=$('.naval-pause-layer'),pauseText=$('.naval-pause-text'),ready=$('.naval-ready');
  const hitEl=$('.naval-hit'),waveEl=$('.naval-wave'),breachEl=$('.naval-breach');

  const hud=()=>{hitEl.textContent=`막은 적선 ${state.hit} / ${RULES.winHits}`;breachEl.textContent=`놓친 적선 ${state.breach} / ${RULES.maxBreach}`;waveEl.textContent=`${waveNumber(state)}번째 물결`;};
  const blocked=()=>{
   if(document.hidden)return 'hidden';
   if(host&&!host.open)return 'closed';
   for(const d of document.querySelectorAll('dialog[open]'))if(d!==host&&!wrapper.contains(d))return 'dialog';
   try{if(document.querySelector(':popover-open'))return 'dialog';}catch{}
   return null;
  };
  const isPaused=()=>userPaused||!!blocked();
  const paintPause=()=>{
   const why=blocked()||(userPaused?'user':null);const on=!!why&&!state.ended;
   wrapper.classList.toggle('is-paused',on);field.classList.toggle('reloading',state.cooldown>0);
   pauseLayer.hidden=!on;pauseBtn.setAttribute('aria-pressed',String(userPaused));pauseBtn.textContent=userPaused?'▶ 이어하기':'⏸ 잠시 멈춤';
   if(on){pauseText.textContent=why==='user'?'훈련을 잠시 멈췄어요. 적선도 함께 멈춰 있어요.':'다른 창이 열려 있어 훈련이 멈춰 있어요. 창을 닫으면 이어져요.';$('.naval-resume').hidden=why!=='user';}
  };
  game={get userPaused(){return userPaused;},set userPaused(v){userPaused=v;},set last(v){last=v;},paintPause};

  const focusSomething=(removed)=>{
   const a=document.activeElement;if(a!==removed&&a!==document.body&&wrapper.contains(a))return;
   const next=[...buttons.values()].find(b=>!b.disabled&&b.isConnected);(next||pauseBtn).focus({preventScroll:true});
  };
  const effect=(x,y,combo)=>{
   const e=document.createElement('div');e.className='naval-impact'+(combo?' is-combo':'');e.style.left=x+'%';e.style.top=y+'%';
   e.innerHTML=`<span class="naval-splash">${sprite('splash')}</span><b>${combo?'협공!':'명중!'}</b>`;field.append(e);later(()=>e.remove(),650);
   field.querySelectorAll('.naval-ally').forEach(b=>{b.classList.remove('firing');void b.offsetWidth;b.classList.add('firing');});
   hitEl.classList.remove('bump');void hitEl.offsetWidth;hitEl.classList.add('bump');
  };
  const place=(ship,b)=>{b.style.left=ship.x+'%';b.style.top=ship.y+'%';b.disabled=ship.y<0||state.ended;b.classList.toggle('in-zone',inGoldZone(ship.y));};
  const addShip=ship=>{
   const b=document.createElement('button');b.type='button';b.className='naval-enemy';b.dataset.ship=ship.id;
   b.setAttribute('aria-label',`${state.spawned}번째 적선 조준`);b.innerHTML=sprite('enemy')+'<span>적선</span>';
   b.onclick=()=>fire(ship.id,b);
   place(ship,b);field.append(b);buttons.set(ship.id,b);
   field.dataset.spawned=state.spawned;
   if(state.spawned===RULES.lateAfter+1){const w=$('.naval-warning');w.hidden=false;feedback.textContent='적선이 두 배 빠르게 나타나요. 금빛 협공 구역을 활용해요!';later(()=>{if(w.isConnected)w.hidden=true;},2800);}
  };
  const fire=(id,b)=>{
   if(closed||state.ended||isPaused())return;
   const r=shoot(state,id);
   if(!r.ok){if(r.reason==='cooldown'){ready.textContent='재장전 중…';}return;}
   state=r.state;buttons.delete(id);
   effect(r.ship.x+5,r.ship.y+5,r.combo);b.classList.add('sunk');b.disabled=true;later(()=>b.remove(),260);
   ready.textContent=r.combo?'협공! 바로 다음 적선!':'명중! 조준할 적선을 눌러요';
   if(r.combo)feedback.textContent=`협공 성공! 재장전이 빨라요. (${state.hit} / ${RULES.winHits})`;
   hud();focusSomething(b);
   if(r.finished)finish(true);
  };
  const finish=ok=>{
   state={...state,ended:true,won:ok};cancelAnimationFrame(raf);raf=0;
   buttons.forEach(b=>{b.disabled=true;});field.classList.add('is-over');wrapper.classList.remove('is-paused');pauseLayer.hidden=true;pauseBtn.disabled=true;
   if(ok){
    feedback.innerHTML=`<h3>준비와 협력으로 바닷길을 지켰어요!</h3><p>한산도 대첩에서는 적을 넓은 바다로 유인하고 학익진으로 포위했어요. 명량 해전에서는 울돌목의 지형과 조류를 이용했어요.</p><p class="naval-note">막은 적선 ${state.hit}척 · 놓친 적선 ${state.breach}척</p><button type="button" class="naval-gold naval-next">수군의 활약 기록하기 →</button>`;
    const next=$('.naval-next');next.onclick=safe(()=>{if(completed)return;completed=true;next.disabled=true;onComplete({kind:'naval-v9',hit:RULES.winHits,breach:state.breach});});next.focus();
   }else{
    let charged=false;if(!failureReported){failureReported=true;try{charged=onFailure()===true;}catch(err){console.error(err);}}
    feedback.innerHTML=`<h3>적선 ${RULES.maxBreach}척이 방어선을 통과했어요.</h3><p>${charged?'도전 실패 −10점. ':''}막은 적선은 ${state.hit}척이에요. 금빛 협공 구역에서 연속 공격하면 더 많이 막을 수 있어요.</p><button type="button" class="naval-gold naval-retry">다시 힘을 모으기 →</button>`;
    const retry=$('.naval-retry');retry.onclick=safe(()=>intro(`${attempt}번째 도전에서 적선 ${RULES.maxBreach}척을 놓쳤어요. 다시 출항해요!`));retry.focus();
   }
  };
  const step=dt=>{
   const r=advance(state,dt);state=r.state;
   for(const s of r.spawned)addShip(s);
   for(const s of r.breached){const b=buttons.get(s.id);buttons.delete(s.id);if(b){b.classList.add('breached');b.disabled=true;later(()=>b.remove(),300);focusSomething(b);}feedback.textContent=`적선이 방어선을 지났어요. (놓친 적선 ${state.breach} / ${RULES.maxBreach})`;}
   for(const s of state.ships){const b=buttons.get(s.id);if(b)place(s,b);}
   if(r.spawned.length||r.breached.length)hud();
   field.classList.toggle('reloading',state.cooldown>0);
   if(state.cooldown===0&&ready.textContent==='재장전 중…')ready.textContent='조준할 적선을 눌러요';
   if(r.finished)finish(false);
  };
  const frame=t=>{
   raf=0;if(closed)return;
   if(!root.isConnected||!wrapper.isConnected){teardown();return;}
   const why=blocked();if(why==='closed'){teardown();return;}
   syncReduced();
   if(why||userPaused){last=0;paintPause();}
   else{if(wrapper.classList.contains('is-paused'))paintPause();const dt=last?(t-last)/1000:0;last=t;step(isReduced()?dt*.7:dt);}
   if(!state.ended&&!closed)raf=requestAnimationFrame(frame);
  };
  pauseBtn.onclick=()=>{if(state.ended)return;userPaused=!userPaused;last=0;paintPause();};
  $('.naval-resume').onclick=()=>{if(state.ended)return;userPaused=false;last=0;paintPause();pauseBtn.focus({preventScroll:true});};

  const first=spawnShip(state);state=first.state;if(first.ship)addShip(first.ship);
  hud();paintPause();raf=requestAnimationFrame(frame);
 }

 function teardown(){
  if(closed)return;closed=true;
  cancelAnimationFrame(raf);raf=0;
  timers.forEach(clearTimeout);timers.clear();
  document.removeEventListener('visibilitychange',onVisibility);
  game=null;
  if(wrapper.isConnected)wrapper.remove();
 }

 intro();
 return teardown;
}
