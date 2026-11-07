import {setupLobby} from './lobby.mjs?v=forest-public-20261108';
import * as T from './vendor/three.module.js';
import {createWorld,createChild,actorActivity} from './world.mjs?v=forest-public-20261108';
import {advance,worldAt,pathSlope,elevation,grade,terrain,riverX,place,nearby,LENGTH,SPEED,clamp,BRIDGE,SUMMIT,SCENIC,sections,sectionIndex,laneName,forkGap,seats,seatFor} from './trail.mjs?v=forest-public-20261108';
import {ForestSound} from './sound.mjs?v=forest-public-20261108';
import {turnView,sightTarget} from './lib/look.mjs?v=forest-public-20261108';
import {observations,reflections,beginObservation,advanceObservation,availableChoices,reflect,chosenNote,memoryLine,resultText} from './lib/observations.mjs?v=forest-public-20261108';
import {guideSpot,guideSpots,nextExperience,distanceText,heightText,groupTarget,autoWalkInput,gatherText,gatherSpot,followLabel,followStartText,arrivedText,companionText,startText,sectionSpan,paceText,planText,stayText} from './lib/course.mjs?v=forest-public-20261108';
import {Classroom} from './net.mjs?v=forest-public-20261108';
import {groupOf} from './lib/mealgroup.mjs';
import {createExplorer} from './explore.mjs';
import {TRACKS} from './lib/exploration.mjs';
import {createDining} from './dining.mjs';
import {LOOK} from './lib/protocol.mjs?v=forest-public-20261108';
import {createLead,stepLead} from './lib/npcmotion.mjs?v=forest-public-20261108';
import {ANIMALS,animalById,animalNear,journalEntries,startFocus,stepFocus,focusProgress,nearestLitter,startPickup,stepPickup,litterById,walk,thirst,startDrink,stepDrink,MEALS,MEAL_KINDS,mealActions,mealLabel,startMeal,stepMeal,mealActive,mealLine,picnicLayout,NOODLE_SPOT,createLife,cancelFree,cancelCard,cancelFocus,netPose,lifePose,lifeSnapshot,summaryLines} from './lib/life.mjs?v=forest-public-20261108';
const $=id=>document.getElementById(id),canvas=$('forest');
$('plan-note').textContent=planText();
await document.fonts.load('600 16px SUIT');
let world;try{world=await createWorld(canvas);}catch(e){$('intro').hidden=true;$('error').hidden=false;throw e;}
const {scene,renderer,camera,panorama}=world;
// Hiking-life props (props.mjs): litter, bag, flask, picnic and cup noodles. Optional: if the module or its cloth texture fails,
// the walk still opens and every activity keeps working with its state, text and poses (props simply stay absent).
let props=null;try{props=await import('./props.mjs?v=forest-public-20261108').then(m=>m.createLifeProps(scene));}catch(e){console.warn('life props unavailable',e);props=null;}
const dining=createDining(scene,props?.mealTemplates);
// Look presets: limited bag / hair / hat variation so classmates are told apart from behind.
const looks=[{variant:0,hat:0,bag:0,name:'노란 배낭'},{variant:1,hat:1,bag:1,name:'파란 배낭 · 모자'},{variant:2,hat:0,bag:2,name:'주황 배낭'},{variant:3,hat:2,bag:3,name:'초록 배낭 · 털모자'},{variant:0,hat:1,bag:4,name:'보라 배낭 · 모자'},{variant:1,hat:0,bag:5,name:'귤색 배낭'},{variant:2,hat:2,bag:1,name:'파란 배낭 · 털모자'},{variant:3,hat:0,bag:0,name:'노란 배낭 · 머리끈'}];
let lookIndex=0,hero=createChild(scene,LOOK.bags[0],false,0,0);
// hero.mjs (parent-owned Tripo "yellow backpack" child) stands in for look 0 when it loads; every other look, and any load
// failure, keeps the procedural createChild. Loaded lazily so a missing module never blocks the walk.
let tripoHero=null;
const heroReady=import('./hero.mjs?v=forest-public-20261108').then(m=>m.loadHero(scene)).then(h=>{tripoHero=h;h.root.visible=false;applyLook();return h;}).catch(()=>null);
function applyLook(){const look=looks[lookIndex];if(hero!==tripoHero)scene.remove(hero.root);else hero.root.visible=false;
  if(lookIndex===0&&tripoHero){hero=tripoHero;if(!hero.root.parent)scene.add(hero.root);hero.root.visible=true;}else hero=createChild(scene,LOOK.bags[look.bag],false,look.variant,look.hat);
  $('look-name').textContent=look.name;position(true);}
$('look-next').onclick=()=>{lookIndex=(lookIndex+1)%looks.length;applyLook();};
// Solo teacher: procedural at once, swapped for the Tripo teacher (npc.mjs, parent-owned) when its asset exists.
let guide=createChild(scene,'#bba366',true);
const npcModule=import('./npc.mjs?v=forest-public-20261108').catch(()=>null);
// Solo teacher motion state (lib/npcmotion.mjs): walks ahead of the child in trail coordinates; feet follow the metres the
// placed root actually moves (guideTraveled), so the summit photo glide and the lead walk share one cadence.
let lead=createLead(guideSpots[0]),leadSnap=true,guideTraveled=0,heroSpeed=0;const guidePrev=new T.Vector3();
const guideReady=npcModule.then(m=>m&&m.loadNPC(scene,'teacher')).then(t=>{if(!t)return null;t.root.position.copy(guide.root.position);t.root.rotation.copy(guide.root.rotation);t.root.visible=guide.root.visible;scene.remove(guide.root);guide=t;return t;}).catch(()=>null);
const memories=new Map();let observation=null;
const sound=new ForestSound(),keys=new Set(),touch=new Set();let state={x:0,y:0},mode='intro',time=0,last=performance.now(),idle=0,traveled=0,reached=false,lastPlace='',noteUntil=8,pulse=null,pauseFrom='playing',waveUntil=0,autoWalk=null,lastSection=-1,forkNoted=false,lookNoted=false;
const motionQuery=matchMedia('(prefers-reduced-motion:reduce)');let reduced=motionQuery.matches;motionQuery.addEventListener('change',e=>reduced=e.matches);
// Hiking life (lib/life.mjs): journal, litter, water, meals. `journal` is a dialog mode of its own: the world is frozen like
// pause, and closing returns to the mode (and the control) it was opened from. Hand positions are read from the rigs once a
// frame into reusable vectors for props.mjs.
let exploreFrom='playing';
function openAdventure(kind,id){if(!['playing','rest','finished','journal'].includes(mode)||diningKind())return;if(mode==='journal')closeJournal(true);exploreFrom=mode;cancelFree(life);cancelCard(life);explorer.open(kind,id);}
let life=createLife(),journalFrom=null,journalOpener=null,heroActivity='stand',lastThirst=-1,lastDrinkFlag=false,mealSeq=0,departAfterMeal=false;
const diningKind=()=>picnicShown()?'picnic':noodleShown()?'noodle':null;
function sharedMeal(){const kind=diningKind();if(!kind)return null;const st=life.meals[kind];return {kind,action:st.action?(st.action.id==='bite'?'bite':st.action.id==='pack'?'pack':'prepare'):'ready',bites:st.bites,seq:mealSeq};}
function startDiningFrame(){
 const focus=diningKind(),nearMeal=classroom.connected?[...peers.values()].find(p=>p.online&&p.target.meal&&Math.abs(p.target.y-state.y)<15):null,kind=focus||nearMeal?.target.meal.kind;
 if(!kind){dining.begin(null,[]);return;}
 const slot=classroom.token?classroom.mealSlot:0,group=groupOf(slot),self={id:'me',slot,...sharedMeal()};
 const members=focus?[self]:[];
 if(classroom.connected){for(const p of peers.values())if(p.online&&p.target.meal?.kind===kind)members.push({id:p.id,slot:p.mealSlot,...p.target.meal});}
 else if(!classroom.token)for(const n of [1,4])members.push({id:'npc-'+n,slot:n,action:'ready',bites:0});
 dining.begin({kind,slot,group,watch:!focus},members);
 const near=members.filter(m=>groupOf(m.slot)===group).length,others=members.length-near;
 const text=(classroom.token?(group<0?'선생님 쉼터':(group+1)+'모둠'):'산책 친구')+' · 가까이 '+near+'명'+(others?' · 다른 모둠 '+others+'명도 식사 중':'')+' · 준비되면 먼저 출발해도 돼요.';
 const el=document.querySelector('.meal-active .dining-info');if(el&&el.textContent!==text)el.textContent=text;
}
function departMeal(){cancelCard(life);departAfterMeal=false;observation=null;resetView();modeTo('playing');renderLifeRows();focusGame();}
function packAndLeave(kind){cancelCard(life);if(life.meals[kind].stage==='open'){departAfterMeal=true;beginMeal(kind,'pack');}else departMeal();}

const handL=new T.Vector3(),handR=new T.Vector3(),teacherHand=new T.Vector3(),animalPos=new T.Vector3(),hands={heroL:null,heroR:null,teacherR:null,heroForward:new T.Vector3(),teacherForward:new T.Vector3()},lifeView={focus:null,focusT:0,picnic:{active:false,seat:0,eating:false},noodle:{active:false,eating:false},cheerUntil:-99},propView={picnicShown:false,noodleShown:false,seat:0};
const frozen=()=>mode==='paused'||mode==='journal';
const picnicShown=()=>mode==='rest'&&nearby(state.y)?.s===MEALS.picnic.stop&&mealActive(life,'picnic'),noodleShown=()=>mode==='finished'&&mealActive(life,'noodle');
const camPos=new T.Vector3(),look=new T.Vector3(),desired=new T.Vector3(),guideSlot=new T.Vector3();
const view={yaw:0,pitch:0};let lookDrag=null;
const canLook=()=>['playing','rest','finished'].includes(mode);
function resetView(){view.yaw=0;view.pitch=0;}
function endLookDrag(){const pointer=lookDrag?.id;lookDrag=null;canvas.classList.remove('dragging');if(pointer!==undefined&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);}
function modeTo(next){if(next==='finished'&&mode!=='paused')resetView();mode=next;document.body.dataset.mode=next;for(const id of ['intro','paused','rest','finish','error'])$(id).hidden=true;if(next==='intro')$('intro').hidden=false;if(next==='paused')$('paused').hidden=false;if(next==='rest')$('rest').hidden=false;if(next==='finished')$('finish').hidden=false;if(next==='error')$('error').hidden=false;$('journey').hidden=next==='intro'||next==='error';$('journey').inert=next!=='playing';canvas.tabIndex=canLook()?0:-1;$('reset-view').disabled=!canLook();document.querySelector('header').inert=next==='paused'||next==='error';$('pause').disabled=next==='intro';$('journal-open').disabled=next==='intro'||next==='error'||next==='explore';$('lesson').hidden=!(classroom.role==='teacher'&&next!=='intro'&&next!=='error');if(next!=='playing')closeTeacher();clearInput();}
function clearInput(){keys.clear();touch.clear();pulse=null;autoWalk=null;$('follow').setAttribute('aria-pressed','false');endLookDrag();document.querySelectorAll('#pad button').forEach(b=>b.classList.remove('active'));}
function focusGame(){canvas.focus({preventScroll:true});}
function announce(text,seconds=6){$('note').textContent=text;noteUntil=time+seconds;}
async function audioStart(){try{await sound.start();}catch{sound.enabled=false;updateSound();announce('소리를 켜려면 오른쪽 위 소리 버튼을 눌러 주세요.');}}
function updateSound(){$('sound').textContent=sound.enabled?'소리 켜짐':'소리 꺼짐';$('sound').setAttribute('aria-pressed',String(sound.enabled));$('sound').setAttribute('aria-label',sound.enabled?'자연 소리 끄기':'자연 소리 켜기');}
function reset(){explorer.reset();closeJournal(true);resetView();memories.clear();observation=null;hideAsks();life=createLife();departAfterMeal=false;mealSeq++;props?.reset();$('journal-open').classList.remove('new');lastThirst=-1;renderLifeRows();$('observe-choices').replaceChildren();$('finish-choices').replaceChildren();world.resetWildlife();renderMemories();state=startState();idle=0;traveled=0;reached=false;time=0;lastPlace='';lastSection=-1;forkNoted=false;lookNoted=false;waveUntil=0;sound.nextBird=4;sound.lastStep=null;modeTo('playing');leadSnap=true;position(true);announce(startText(looks[lookIndex].name),9);audioStart();focusGame();}
// Solo walk starts at the gate itself; in a classroom the server hands each member its own gate slot (a few metres apart) so nobody spawns inside the teacher.
function startState(){return classroom.token&&classroom.start?{x:classroom.start.x,y:classroom.start.y}:{x:0,y:0};}
$('start').disabled=false;$('start').textContent='산책 시작';$('start').onclick=reset;
$('reset-view').onclick=()=>{resetView();if(canLook())focusGame();};
$('sound').onclick=async()=>{try{await sound.toggle();updateSound();}catch{announce('브라우저에서 소리를 허용한 뒤 다시 눌러 주세요.');}if(mode==='paused')sound.pause();else if(mode==='playing')focusGame();};
// Pausing from the journal closes it first and remembers the mode underneath, so "계속 걷기" returns there (not to the journal).
function pause(){if(mode==='intro'||mode==='paused'||mode==='error')return;if(mode==='journal')closeJournal(true);pauseFrom=mode;modeTo('paused');sound.pause();$('resume').focus();}
function resume(){modeTo(pauseFrom);last=performance.now();audioStart();classroom.resume();if(pauseFrom==='rest')$('leave-rest').focus();else if(pauseFrom==='finished')$('stay').focus();else focusGame();}
$('pause').onclick=()=>mode==='paused'?resume():pause();$('resume').onclick=resume;$('restart').onclick=reset;$('again').onclick=reset;
// "풍경 더 보기" returns to free walking at the summit; the child may also walk back down and look at any place again (E),
// and "처음부터 걷기" restarts with empty memories.
$('stay').onclick=()=>{cancelCard(life);renderLifeRows();modeTo('playing');announce('바람을 느끼며 더 머물러도 좋아요. 길을 되짚어 내려가 폭포나 전망대를 다시 봐도 되고, E로 정상 카드를 다시 열 수 있어요.',8);focusGame();};
function renderMemories(){
  $('memories').replaceChildren();
  for(const entry of memories.values()){
    const item=document.createElement('li'),icon=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');
    icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');use.setAttribute('href','#mark-'+entry.mark);icon.append(use);
    const text=document.createElement('span');text.textContent=memoryLine(entry);item.append(icon,text);$('memories').append(item);
  }
  // The list folds (details) so the photo / stay / restart buttons never scroll out of the sheet; the count stays visible.
  $('memory-title').textContent=memories.size?'오늘 마음에 남은 것 · '+memories.size:'나만의 속도로 걸었어요';
  $('memory-empty').hidden=memories.size>0;$('memory-page').open=memories.size<=3;
  renderSummary($('life-summary'));
}
// ---- Hiking life UI: summary lines (summit card + journal), journal dialog, action rows in the rest/summit cards ----------
function renderSummary(host,emptyText=null){
  host.replaceChildren();const lines=[...summaryLines(life),...explorer.summary().map(text=>({mark:'journal',text}))];
  for(const l of lines){const li=document.createElement('li'),icon=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');use.setAttribute('href','#mark-'+l.mark);icon.append(use);const t=document.createElement('span');t.textContent=l.text;li.append(icon,t);host.append(li);}
  if(!lines.length&&emptyText){const li=document.createElement('li');li.textContent=emptyText;host.append(li);}
  host.hidden=!lines.length&&!emptyText;
}
// Journal: one illustrated entry per animal (atlas tile = 1/3 of animal-journal.webp). An animal not yet drawn shows only a soft
// blurred shadow of its tile and a hint of where to look; nothing is marked as missed.
function renderJournal(){
  const list=$('journal-entries');list.replaceChildren();
  for(const e of journalEntries(life)){
    const li=document.createElement('li');li.className=e.seen?'seen':'unseen';
    const art=document.createElement('div');art.className='journal-art '+(e.seen?'seen':'unseen');art.style.backgroundPosition=(e.tile*50)+'% 0';art.setAttribute('role','img');art.setAttribute('aria-label',e.seen?e.name+' 그림':'아직 만나지 못한 동물의 흐린 그림자');
    const text=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');
    h.textContent=e.seen?e.name:'아직 만나지 못했어요';p.textContent=e.seen?e.entry:e.where+' 근처에서 조용히 살펴보면 만날 수 있어요.';
    text.append(h,p);li.append(art,text);list.append(li);
  }
  renderSummary($('journal-summary'),'오늘 한 일은 아직 없어요. 길에서 만나는 것들을 천천히 살펴봐요.');
}
function openJournal(opener=null){
  if(!['playing','rest','finished'].includes(mode))return;
  journalFrom=mode;journalOpener=opener||document.activeElement;renderJournal();
  mode='journal';document.body.dataset.mode='journal';$('journal').hidden=false;for(const id of ['journey','rest','finish'])$(id).inert=true;
  $('journal-open').setAttribute('aria-expanded','true');$('journal-open').classList.remove('new');canvas.tabIndex=-1;$('reset-view').disabled=true;clearInput();closeTeacher();sound.pause();$('journal-close').focus();
}
function closeJournal(silent=false){
  if(mode!=='journal')return;
  $('journal').hidden=true;for(const id of ['rest','finish'])$(id).inert=false;mode=journalFrom;journalFrom=null;document.body.dataset.mode=mode;$('journey').inert=mode!=='playing';
  $('journal-open').setAttribute('aria-expanded','false');canvas.tabIndex=canLook()?0:-1;$('reset-view').disabled=!canLook();
  const opener=journalOpener;journalOpener=null;if(silent)return;audioStart();
  if(opener&&opener.isConnected&&!opener.hidden&&!opener.disabled&&!opener.closest('[inert]'))opener.focus();else if(mode==='rest')$('leave-rest').focus();else if(mode==='finished')$('stay').focus();else focusGame();
}
$('journal-open').onclick=()=>mode==='journal'?closeJournal():openJournal($('journal-open'));$('journal-close').onclick=()=>closeJournal();
function renderLifeRows(){$('rest').classList.toggle('meal-active',mode==='rest'&&mealActive(life,'picnic'));$('finish').classList.toggle('meal-active',mode==='finished'&&mealActive(life,'noodle'));fillLifeRow($('rest-life'),mode==='rest'?nearby(state.y)?.s??null:null);fillLifeRow($('finish-life'),mode==='finished'?SUMMIT.platform:null);}
function fillLifeRow(host,spot){
  const line=host.querySelector('.life-line'),buttons=host.querySelector('.life-buttons'),hadFocus=host.contains(document.activeElement);buttons.replaceChildren();
  if(spot===null){host.hidden=true;return;}
  const items=[];let text='';
  const animal=ANIMALS.find(a=>a.s===spot);
  if(animal){const seen=life.journal.includes(animal.id),busy=life.focus?.id===animal.id;text=seen?animal.name+' 그림이 수첩에 있어요.':'조용히 살펴보면 '+animal.name+' 그림을 수첩에 담을 수 있어요.';
    items.push({label:busy?'살펴보는 중…':TRACKS[animal.id]?'흔적 찾아보기':seen?'다시 살펴보기':animal.label,disabled:!!life.focus,working:busy,on:()=>TRACKS[animal.id]?openAdventure('track',animal.id):beginFocus(animal.id)});}
  const kind=MEAL_KINDS.find(k=>MEALS[k].stop===spot);
  if(kind){text=(text?text+' ':'')+mealLine(life,kind);const act=life.meals[kind].action;
    if(mealActive(life,kind)){
      items.push({label:act?(act.id==='bite'?'먹는 중…':act.id==='pack'?'정리하는 중…':'준비하는 중…'):life.meals[kind].bites>=3?'다 먹었어요':'한 입 먹기',disabled:!!act||life.meals[kind].bites>=3,working:!!act,on:()=>beginMeal(kind,'bite')});
      items.push({label:'정리하고 출발',disabled:act?.id==='pack',on:()=>packAndLeave(kind)});
    }else for(const id of mealActions(life,kind))items.push({label:kind==='picnic'?'도시락 먹기':'컵라면 먹기',disabled:false,on:()=>beginMeal(kind,id)});}
  if(spot===210){text='출발 자리를 골라 나뭇잎의 물길을 따라가 볼까요?';items.push({label:'나뭇잎 여행',on:()=>openAdventure('leaf')});}
  if(!kind||!mealActive(life,kind))items.push({label:'사진 찍기',on:()=>openAdventure('photo')});
  if(!items.length&&!text){host.hidden=true;return;}
  line.textContent=text;host.querySelector('.dining-info')?.remove();if(kind&&mealActive(life,kind)){const info=document.createElement('p');info.className='dining-info';info.textContent='내 자리에 앉았어요. 친구를 기다리지 않아도 돼요.';line.after(info);}
  for(const it of items){const b=document.createElement('button');b.type='button';b.textContent=it.label;b.disabled=it.disabled;b.classList.toggle('working',!!it.working);b.onclick=it.on;buttons.append(b);}
  host.hidden=false;
  if(hadFocus)(buttons.querySelector('button:not([disabled])')||$(mode==='rest'?'leave-rest':'stay')).focus();
}
function beginFocus(id){
  if(life.focus)return;if(mode==='playing'){cancelFree(life);stopAutoWalk();}else cancelCard(life);
  const a=animalById(id);if(!a||!startFocus(life,id))return;
  announce(a.hint,5);if(id==='bird')sound.chirp();if(id==='chipmunk')sound.rustle(.5);renderLifeRows();
}
function beginMeal(kind,id){
  if(kind==='picnic'){if(mode!=='rest'||nearby(state.y)?.s!==MEALS.picnic.stop)return;if(observation?.id!=='sit'){seatIndex=seatFor(state.x,state.y);chooseObservation(MEALS.picnic.stop,'sit');}}
  if(kind==='noodle'){if(mode!=='finished')return;if(observation&&!observation.done){observation=null;for(const b of $('finish-choices').children)b.setAttribute('aria-pressed','false');}state={x:NOODLE_SPOT.seat.offset,y:NOODLE_SPOT.seat.s};}
  cancelFocus(life);if(!startMeal(life,kind,id))return;mealSeq++;
  if(id==='pour')sound.pour(2.2);if(id==='open')sound.rustle(.3);renderLifeRows();
}
function mealEvent(ev){
  const st=life.meals[ev.kind];
  if(ev.kind==='picnic'){
    if(ev.id==='open')announce('도시락을 열었어요. 김밥 '+(MEALS.picnic.pieces-st.bites)+'개가 보여요. 친구도 곁에 와서 앉아요.',5);
    else if(ev.id==='bite'){sound.bite();announce('냠, 김밥 한 입. '+ev.left+'개 남았어요.',4);}
    else announce(ev.completed?'도시락을 정리했어요. 쉼터 김밥 기억을 수첩에 남겼어요.':'도시락을 정리했어요. 더 먹고 싶으면 다시 열 수 있어요.',6);
  }else{
    if(ev.id==='pour')announce('선생님이 보온병의 뜨거운 물을 부어 주셨어요. 김이 모락모락 나요.',5);
    else if(ev.id==='bite'){sound.bite();announce('후루룩, 컵라면 한 입. '+(ev.left?ev.left+'입 더 먹을 수 있어요.':'다 먹었어요.'),4);}
    else{announce(ev.completed?'빈 컵을 가방에 챙겼어요. 정상 컵라면 기억을 수첩에 남겼어요.':'빈 컵을 가방에 챙겼어요.',6);if(mode==='finished')renderMemories();}
  }
}
function pickLitter(){if(mode!=='playing'||life.litter.pickup)return;cancelFree(life);stopAutoWalk();const p=startPickup(life,{s:state.y,x:state.x});if(!p)return;announce('허리를 굽혀 '+litterById(p.id).name+'을 집어요. 방향키를 누르면 그만둬요.',4);}
function drinkWater(){if(mode!=='playing'||life.water.drink)return;cancelFree(life);stopAutoWalk();if(!startDrink(life))return;announce('물병을 꺼내 한 모금 마셔요.',3);}
$('flask').onclick=()=>{drinkWater();focusGame();};$('pick').onclick=()=>{pickLitter();focusGame();};
// Steps every life action with the world clock (never while paused, in the journal or hidden) and turns completions into text,
// sound and card updates. Unfinished actions record nothing.
function stepLife(dt){
  if(mode==='playing'){
    if(stepDrink(life,dt)){sound.sip();announce('시원하게 한 모금 마셨어요. 오늘 '+life.water.drinks+'번째 물이에요.',4);}
    const target=life.litter.pickup&&litterById(life.litter.pickup.id);
    const picked=target&&Math.hypot(target.s-state.y,target.offset-state.x)<=.75?stepPickup(life,dt,time):null;if(picked){sound.rustle(.45);announce('가방에 '+litterById(picked.id).name+' 하나를 담았어요 · 모두 '+picked.count+'개',5);}
  }
  const seen=stepFocus(life,dt);
  if(seen){explorer.onAnimal(seen.id);const a=animalById(seen.id);announce(seen.fresh?'숲 수첩에 '+a.name+' 그림을 담았어요. 위의 수첩(N)에서 볼 수 있어요.':a.name+'을 다시 살펴봤어요. 수첩에는 이미 있어요.',6);if(seen.fresh)$('journal-open').classList.add('new');renderLifeRows();}
  for(const kind of MEAL_KINDS){const ev=stepMeal(life,kind,dt);if(ev){mealEvent(ev);if(ev.id==='pack'&&departAfterMeal)departMeal();renderLifeRows();}}
}
function animalWorld(id){if(id==='bird')return world.songbird.getWorldPosition(animalPos);if(id==='butterfly')return animalPos.copy(world.butterfly.position);return animalPos.copy(world.squirrel.position).add({x:0,y:.3,z:0});}
function readHands(){
  hands.heroForward.set(Math.sin(hero.root.rotation.y),0,Math.cos(hero.root.rotation.y));hands.teacherForward.set(Math.sin(guide.root.rotation.y),0,Math.cos(guide.root.rotation.y));
  const hl=hero.sides?hero.sides[0].hand.bone:hero.hands?.[0],hr=hero.sides?hero.sides[1].hand.bone:hero.hands?.[1],tr=guide.sides?guide.sides[1].hand.bone:guide.hands?.[1];
  hands.heroL=hl?hl.getWorldPosition(handL):null;hands.heroR=hr?hr.getWorldPosition(handR):null;hands.teacherR=tr&&guide.root.visible?tr.getWorldPosition(teacherHand):null;
}
// Summit photo: render once more, then save the canvas. Nothing leaves the device. After "다 같이 사진 찍기" the camera is
// still framing the group, so the saved picture is the group photo.
$('photo').onclick=()=>{renderer.render(scene,camera);const done=blob=>{if(!blob){$('photo').textContent='사진 저장이 안 돼요';return announce('이 브라우저에서는 사진 저장이 되지 않아요.');}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=observation?.id==='group'?'바람봉-단체사진.png':'바람봉-풍경.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);$('photo').textContent='사진을 저장했어요';};try{canvas.toBlob(done,'image/png');}catch{done(null);}};
// One card per place: the first look starts at once; where the place offers other ways of looking (bird, waterfall, lookout
// direction, summit group photo) they stay as small toggles, and a follow-up (creek "잎 따라가 보기") appears only once its
// first look has been completed here. Nothing has to be chosen, and any direction key walks on.
const choiceHost=spot=>spot===SUMMIT.platform?$('finish-choices'):$('observe-choices');
function renderChoices(spot){
  const host=choiceHost(spot),list=availableChoices(spot,memories);host.replaceChildren();if(list.length<2)return;
  for(const choice of list){const b=document.createElement('button');b.type='button';b.textContent=choice.label;b.dataset.choice=choice.id;b.setAttribute('aria-pressed',String(observation?.spot===spot&&observation?.id===choice.id));b.onclick=()=>chooseObservation(spot,choice.id);host.append(b);}
}
function chooseObservation(spot,id){
  observation=beginObservation(spot,id);if(!observation)return;
  for(const b of choiceHost(spot).children)b.setAttribute('aria-pressed',String(b.dataset.choice===id));
  if(spot===SUMMIT.platform){$('photo').textContent=id==='group'?'단체 사진 저장':'풍경 사진 저장';$('finish-text').textContent=observation.hint;hideAsks();if(memories.has(spot))showAsk();}
  else{$('observe-feedback').textContent=observation.hint;$('observe-saved').textContent='천천히 바라봐요. 방향키를 누르면 바로 다시 걸어요.';$('leave-rest').textContent=id==='sit'?'일어나서 다시 걷기':'다시 걷기';}
  if(spot===115)sound.chirp();if(spot===475)sound.rustle(.8);if(spot===30)sendWave();if(id==='falls')sound.rustle(.5);if(id==='group')sendWave();
}
// One light question per place (observations.mjs `reflections`), shown in the rest card once the scene has reacted, or at
// once when this place already holds a memory from an earlier visit. The summit question sits in the finish card.
// Nothing has to be answered; a chosen line is attached to that place's memory and can be changed while still here.
const askHost=spot=>spot===SUMMIT.platform?$('finish-ask'):$('observe-ask');
function hideAsks(){$('observe-ask').hidden=true;$('finish-ask').hidden=true;}
function showAsk(){
  const ask=observation&&reflections[observation.spot];if(!ask)return;
  const host=askHost(observation.spot),chosen=chosenNote(observation,memories),options=host.querySelector('.ask-options');
  if(host.dataset.spot!==String(observation.spot)){host.open=false;host.dataset.spot=String(observation.spot);}
  host.querySelector('summary').textContent=chosen?'마음 한 줄 · '+ask.options.find(o=>o.id===chosen).label:'마음 한 줄 남기기 (선택)';
  host.querySelector('.ask-prompt').textContent=ask.prompt;options.replaceChildren();
  for(const option of ask.options){const b=document.createElement('button');b.type='button';b.textContent=option.label;b.dataset.option=option.id;b.setAttribute('aria-pressed',String(option.id===chosen));b.onclick=()=>answerAsk(option.id);options.append(b);}
  host.hidden=false;
}
function answerAsk(id){
  if(!observation)return;const stored=reflect(observation,id,memories);
  const host=askHost(observation.spot);host.querySelector('summary').textContent='마음 한 줄 · '+reflections[observation.spot].options.find(o=>o.id===id).label;host.open=false;
  for(const b of askHost(observation.spot).querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.option===id));
  if(mode==='finished')renderMemories();else $('observe-saved').textContent=stored?'고른 한 줄도 이 장면의 기억에 함께 남겼어요.':'풍경을 다 보면 고른 한 줄도 함께 남겨요.';
}
function interact(){
  const spot=nearby(state.y);if(mode!=='playing')return;
  // Away from the stops, E reaches for litter within arm's length first, then looks at an animal here (the butterfly), then waves.
  // At a stop the stop keeps E; litter there is reached from the pack button instead.
  if(!spot){
    if(nearestLitter(life,{s:state.y,x:state.x})){pickLitter();return;}
    const animal=animalNear(state.y);if(animal){beginFocus(animal.id);return;}
    if(peersNear().length){sendWave();waveUntil=time+2.5;announce('친구에게 손을 흔들었어요.',3);}return;}
  cancelFree(life);
  // Summit card: the view starts at once; "다 같이 사진 찍기" is the second toggle. The intro line shows the current action
  // and, once it has finished, the stay suggestion or the action's own result line (same <p>, so the card does not grow).
  if(spot.s===SUMMIT.platform){observation=null;resetView();modeTo('finished');$('photo').textContent='풍경 사진 저장';renderMemories();renderChoices(spot.s);chooseObservation(spot.s,'view');renderLifeRows();$('stay').focus();return;}
  observation=null;resetView();modeTo('rest');$('rest-title').textContent=spot.name;$('rest-text').textContent=stayText(spot.s);
  $('observe-saved').textContent='';hideAsks();renderChoices(spot.s);
  chooseObservation(spot.s,observations[spot.s].choices[0].id);renderLifeRows();$('leave-rest').focus();
}
$('action').onclick=interact;$('leave-rest').onclick=()=>{cancelCard(life);observation=null;resetView();modeTo('playing');renderLifeRows();focusGame();};
// Camera flash for the group photo (CSS animation; skipped under reduced motion).
function flash(){if(reduced)return;const f=$('flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
window.addEventListener('keydown',e=>{
  if(mode==='explore')return;
  if(e.code==='KeyC'&&!e.repeat&&!e.target.matches('input,textarea,select')){openAdventure('photo');return;}
  if(mode==='paused'&&e.code==='Tab'){const first=$('resume'),last=$('restart');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
  // Journal dialog: its only control is the close button (Tab stays there); Esc or J closes it and focus returns to the opener.
  if(mode==='journal'){if(e.code==='Tab'){e.preventDefault();const bs=[$('album-open'),$('journal-close')],i=bs.indexOf(document.activeElement);bs[(i+(e.shiftKey?-1:1)+bs.length)%bs.length].focus();}else if(e.code==='Escape'||e.code==='KeyN'){e.preventDefault();closeJournal();}return;}
  if(e.code==='Escape'){e.preventDefault();if(mode==='paused')resume();else if(mode==='rest'){$('leave-rest').click();}else if(!$('teacher').hidden)closeTeacher();else pause();return;}
  if(e.target.matches('input,textarea,[contenteditable=true]'))return;
  // N opens the notebook (J is already "look left"); F takes a sip while free walking only.
  if(e.code==='KeyN'&&!e.repeat&&['playing','rest','finished'].includes(mode)){e.preventDefault();openJournal();return;}
  if(e.code==='KeyF'&&!e.repeat&&mode==='playing'){e.preventDefault();drinkWater();return;}
  if(canLook()&&!e.target.matches('input,textarea,[contenteditable=true]')&&['KeyI','KeyJ','KeyK','KeyL','KeyR'].includes(e.code)){
    e.preventDefault();if(e.code==='KeyR')resetView();else keys.add(e.code);return;
  }
  // While resting, a walking key simply walks on: no need to find the "다시 걷기" button first.
  if(mode==='rest'&&!e.repeat&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD'].includes(e.code)&&!e.target.matches('input,textarea')){e.preventDefault();$('leave-rest').click();keys.add(e.code);return;}
  if(mode!=='playing'||e.target.matches('input,textarea'))return;
  if(e.target.closest('button')&&(e.code==='Space'||e.code==='Enter'))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','Space'].includes(e.code)){e.preventDefault();if((e.code==='KeyE'||e.code==='Space')&&!e.repeat)interact();else{keys.add(e.code);stopAutoWalk();cancelFree(life);}}
});window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{clearInput();if(mode!=='intro'&&mode!=='paused')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();sound.pause();}else classroom.resume();});
for(const b of document.querySelectorAll('#pad button')){b.onpointerdown=e=>{if(mode!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.dir);b.classList.add('active');stopAutoWalk();cancelFree(life);};const release=()=>{touch.delete(b.dataset.dir);b.classList.remove('active');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;b.onclick=e=>{if(e.detail===0&&mode==='playing'){pulse={dir:b.dataset.dir,until:time+.22};stopAutoWalk();}};}
canvas.addEventListener('pointerdown',e=>{
  if(!canLook()||lookDrag||e.button!==0)return;e.preventDefault();focusGame();
  lookDrag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove',e=>{
  if(!lookDrag||e.pointerId!==lookDrag.id)return;
  const sensitivity=1.8/Math.min(innerWidth,innerHeight);
  turnView(view,(e.clientX-lookDrag.x)*sensitivity,(lookDrag.y-e.clientY)*sensitivity);
  lookDrag.x=e.clientX;lookDrag.y=e.clientY;
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(e.pointerId===lookDrag?.id)endLookDrag();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();modeTo('error');sound.pause();$('error-text').textContent='3D 화면 연결이 끊어졌어요. 다시 열면 처음부터 시작해요.';$('error').querySelector('button').focus();});
function input(){const has=(dir,...codes)=>touch.has(dir)||(pulse?.dir===dir&&time<pulse.until)||codes.some(c=>keys.has(c));return {x:Number(has('right','ArrowRight','KeyD'))-Number(has('left','ArrowLeft','KeyA')),y:Number(has('up','ArrowUp','KeyW'))-Number(has('down','ArrowDown','KeyS'))};}
// ---- Classroom (only when the same origin runs server.mjs; static hosting keeps the solo walk) ----
const classroom=new Classroom('api/'),peers=new Map();let gather=null,teacherPeer=null,roomClosedNote='';
const lobby=setupLobby(classroom,peers);
window.addEventListener('offline',()=>classroom.abort?.abort());
window.addEventListener('online',()=>classroom.resume());
classroom.detect().then(ok=>{$('classroom').hidden=!ok;$('solo-note').hidden=ok;if(ok){$('classroom').after($('start'));$('start').textContent='혼자 먼저 둘러보기';}});
$('teach').onclick=async()=>{$('teach').disabled=true;$('join').disabled=true;try{const r=await classroom.create();adoptRoom(r);$('join-note').textContent='방 코드 '+r.code+' · 학생에게 이 코드를 알려 주세요.';}catch(e){$('join-note').textContent='방을 만들지 못했어요 ('+e.message+'). 잠시 후 다시 시도해 주세요.';}$('teach').disabled=false;$('join').disabled=false;};
$('join-form').onsubmit=async e=>{e.preventDefault();const code=$('join-code').value.trim().toUpperCase();$('join').disabled=true;$('teach').disabled=true;try{const look=looks[lookIndex];const r=await classroom.join(code,{variant:look.variant,hat:look.hat,bag:look.bag});adoptRoom(r);$('join-note').textContent='방 '+r.code+'에 들어왔어요. 산책 시작을 눌러요.';}catch(e){$('join-note').textContent={'no-room':'그 코드의 방이 없어요. 다시 확인해 주세요.','bad-code':'코드는 여섯 글자예요.','room-full':'방이 가득 찼어요 (30명).','too-many-attempts':'잠시 후 다시 시도해 주세요.'}[e.message]||'들어가지 못했어요 ('+e.message+').';}$('join').disabled=false;$('teach').disabled=false;};
function adoptRoom(r){lobby.adopt();$('teach').hidden=true;$('join-form').hidden=true;$('look-next').disabled=true;$('room-status').hidden=false;updateRoomStatus();if(r.role==='teacher'){buildLessonList();$('teacher-code').textContent=r.code;}}
function updateRoomStatus(){lobby.update();if(!classroom.token||classroom.closed)return;const n=[...peers.values()].filter(p=>p.online).length;$('room-status').textContent=companionText(classroom.role,classroom.code,n)+(classroom.connected?'':' · 연결 중…');}
// Peers stay procedural (look variants tell classmates apart); a real teacher is upgraded to the Tripo teacher when available.
function addPeer(m){if(m.id===classroom.id||peers.has(m.id))return;const teacher=m.role==='teacher';const child=teacher?createChild(scene,'#bba366',true):createChild(scene,LOOK.bags[m.look?.bag||0],false,m.look?.variant||0,m.look?.hat||0);const s=m.state||{x:0,y:0,yaw:0,pitch:0,pose:'stand',seat:-1};const peer={id:m.id,role:m.role,mealSlot:m.mealSlot??-1,mealAt:time,leafAt:time,child,cur:{x:s.x,y:s.y},target:{...s},yaw:Math.PI,traveled:0,waveUntil:0,online:m.online!==false,moving:false};peers.set(m.id,peer);if(teacher){teacherPeer=peer;guide.root.visible=false;npcModule.then(n=>n&&n.loadNPC(scene,'teacher')).then(t=>{if(!t)return;if(peers.get(m.id)!==peer){scene.remove(t.root);return;}t.root.position.copy(child.root.position);t.root.rotation.copy(child.root.rotation);scene.remove(child.root);peer.child=t;}).catch(()=>{});}updateRoomStatus();}
function removePeer(id){const p=peers.get(id);if(!p)return;scene.remove(p.child.root);peers.delete(id);if(teacherPeer===p){teacherPeer=null;guide.root.visible=true;}updateRoomStatus();}
classroom.addEventListener('hello',e=>{for(const id of [...peers.keys()])if(!e.detail.members.some(m=>m.id===id))removePeer(id);for(const m of e.detail.members)addPeer(m);for(const m of e.detail.members){const p=peers.get(m.id);if(p){p.online=m.online!==false;p.target={...m.state};}}gather=e.detail.gather;showGather();updateRoomStatus();});
classroom.addEventListener('joined',e=>{addPeer(e.detail.member);if(mode==='playing')announce('친구가 숲에 들어왔어요.',3);});
classroom.addEventListener('left',e=>removePeer(e.detail.id));
classroom.addEventListener('away',e=>{const p=peers.get(e.detail.id);if(p){p.online=false;updateRoomStatus();if(classroom.role==='teacher')announce('학생 한 명의 연결이 잠시 끊겼어요.',4);}});
classroom.addEventListener('back',e=>{const p=peers.get(e.detail.id);if(p){p.online=true;updateRoomStatus();if(classroom.role==='teacher')announce('학생이 다시 연결됐어요.',3);}});
classroom.addEventListener('states',e=>{for(const s of e.detail.members){const p=peers.get(s.id);if(p){if(p.target.meal?.seq!==s.meal?.seq||p.target.meal?.action!==s.meal?.action)p.mealAt=time;if(p.target.leaf?.seq!==s.leaf?.seq||p.target.leaf?.age!==s.leaf?.age)p.leafAt=time;p.target=s;}}});
classroom.addEventListener('wave',e=>{const p=peers.get(e.detail.id);if(p)p.waveUntil=time+2.5;});
classroom.addEventListener('gather',e=>{const next=e.detail.section===null?null:{section:e.detail.section};const changed=(next?.section??null)!==(gather?.section??null);gather=next;showGather();if(gather&&classroom.role!=='teacher')announce(gatherText(gather.section),8);if(changed)gatherChanged();if(classroom.role==='teacher')markLesson();});
// When the meeting place changes or is cleared, an automatic walk toward the old place stops here and the HUD line shows the new guidance. The child decides whether to press the button again.
function gatherChanged(){if(!autoWalk)return;stopAutoWalk();announce(gather?'모이는 곳이 바뀌어 여기서 멈췄어요. 버튼을 누르면 새로 모이는 곳으로 가요.':'모이기 안내가 끝나 여기서 멈췄어요.',6);}
classroom.addEventListener('status',e=>{const st=e.detail.state;if(st==='reconnecting')announce('연결이 끊겼어요. 다시 연결하는 중… 혼자 계속 걸어도 돼요.',8);if(st==='connected'&&roomClosedNote!=='first'){announce('교실 방에 연결됐어요.',3);}roomClosedNote='first';if(st==='closed'){for(const id of [...peers.keys()])removePeer(id);gather=null;showGather();$('room-status').textContent={'teacher-left':'선생님이 방을 닫았어요 · 혼자 걷기','idle':'방이 오래 비어 닫혔어요 · 혼자 걷기','expired':'방 시간이 끝났어요 · 혼자 걷기'}[e.detail.reason]||'교실 연결이 끝났어요 · 혼자 걷기';}updateRoomStatus();});
function showGather(){const line=$('gather-status');if(!gather){line.hidden=true;return;}const spot=gatherSpot(gather.section);line.hidden=false;line.textContent=(classroom.role==='teacher'?'모이기 안내: ':'선생님: ')+spot.name+'에 모여요';}
function peersNear(radius=6){const out=[];for(const p of peers.values())if(p.online&&Math.hypot(p.cur.y-state.y,(p.cur.x-state.x)*1)<radius)out.push(p);return out;}
function sendWave(){if(classroom.connected)classroom.wave();waveUntil=time+2.5;}
function stopAutoWalk(){if(autoWalk){autoWalk=null;$('follow').setAttribute('aria-pressed','false');}}
$('follow').onclick=()=>{if(autoWalk){stopAutoWalk();announce('여기서 멈췄어요.',3);focusGame();return;}const target=followTarget();if(!target)return;autoWalk=target;$('follow').setAttribute('aria-pressed','true');announce(followStartText(target.reason),6);focusGame();};
function followTarget(){const others=[...peers.values()].filter(p=>p.online).map(p=>({y:p.cur.y}));const gatherAt=gather?gatherSpot(gather.section):null;return groupTarget(others,{s:state.y},{gather:gatherAt&&gatherAt.s>state.y+6?gatherAt:null});}
// Teacher lesson panel: eight recommended sections (walk + stay timetable from course.mjs) with a gather prompt each. Students never see it.
function buildLessonList(){$('teacher-plan').textContent=planText()+' 모이기 안내를 누르면 학생 화면에 짧은 안내가 보여요.';$('lesson-list').replaceChildren();sections.forEach((z,i)=>{const li=document.createElement('li');const text=document.createElement('div');const b=document.createElement('b');b.textContent=sectionSpan(i)+' '+z.name;const small=document.createElement('small');small.textContent=z.guide+' ('+paceText(i)+')';text.append(b,small);const btn=document.createElement('button');btn.type='button';btn.textContent='모이기';btn.setAttribute('aria-pressed','false');btn.onclick=async()=>{try{await classroom.gather(i);gather={section:i};showGather();gatherChanged();announce(gatherText(i,'self').replace('선생님: ','')+' 학생들에게 안내했어요.',4);markLesson();}catch(e){announce('안내를 보내지 못했어요 ('+e.message+').',4);}};li.append(text,btn);$('lesson-list').append(li);});markLesson();}
function markLesson(){const current=sectionIndex(state.y);[...$('lesson-list').children].forEach((li,i)=>{li.classList.toggle('current',i===current);li.querySelector('button').setAttribute('aria-pressed',String(gather?.section===i));});}
$('lesson').onclick=()=>{const open=$('teacher').hidden;$('teacher').hidden=!open;$('lesson').setAttribute('aria-expanded',String(open));if(open){markLesson();$('teacher-close').focus();}else focusGame();};
function closeTeacher(){$('teacher').hidden=true;$('lesson').setAttribute('aria-expanded','false');}
$('teacher-close').onclick=()=>{closeTeacher();focusGame();};
$('gather-clear').onclick=async()=>{try{await classroom.gather(null);gather=null;showGather();gatherChanged();markLesson();announce('모이기 안내를 지웠어요.',3);}catch{}};
// ---- Scene placement and camera ----
function seatWorld(index){const seat=seats[index]||seats[0],g=world.seatGroups[index]||world.seatGroups[0];return {x:g.position.x,y:Math.max(g.position.y,terrain(g.position.x,-g.position.z)+.09),z:g.position.z,yaw:seat.yaw};}
let seatIndex=0;
// Group photo: active while the summit "다 같이 사진 찍기" look runs and afterwards while the child stays on the deck.
const groupPhotoActive=()=>!noodleShown()&&(mode==='finished'&&observation?.id==='group'||mode!=='rest'&&world.photoPosed()&&state.y>SUMMIT.from+4);
function currentPose(moving){const spot=nearby(state.y)?.s;if(mode==='rest'&&observation?.id==='sit')return 'sit';if(time<waveUntil||mode==='rest'&&spot===30||mode==='finished'&&observation?.id==='group')return 'wave';if(mode==='rest'&&(spot===475||observation?.id==='falls'))return 'observe';if(moving)return 'walk';return 'stand';}
function position(snap=false,dt=.016,moving=false){
  hero.root.visible=mode!=='explore';
  const p=worldAt(state.y,state.x),slope=pathSlope(state.y),angle=Math.atan2(slope,-1);hero.root.position.set(p.x,p.y,p.z);
  const noodling=noodleShown(),diningNow=diningKind();guide.root.visible=diningNow?(diningNow==='noodle'&&life.meals.noodle.action?.id==='pour'):!teacherPeer;
  const spot=nearby(state.y)?.s,wildlife=mode==='rest'&&spot===475,falls=mode==='rest'&&observation?.id==='falls',followLeaf=mode==='rest'&&observation?.id==='follow',lookAhead=mode==='rest'&&spot===578&&observation?.id==='ahead',groupPhoto=mode==='finished'&&observation?.id==='group'&&!noodling;
  const waterRest=mode==='rest'&&[210,362].includes(spot)&&!['sit','falls','follow'].includes(observation?.id),greeting=mode==='rest'&&spot===30,lookback=mode==='rest'&&spot===578&&!lookAhead;
  const sitting=mode==='rest'&&observation?.id==='sit';
  if(sitting){const seat=seatWorld(seatIndex);hero.root.position.set(seat.x,seat.y,seat.z);}
  // Hiking life this frame: the summit cup noodles seat the child on the mat; a journal look faces the animal; a litter reach
  // faces the piece; the picnic keeps the bench seat. `lifeAct` is the hand/seat pose an active action asks for.
  const picnicking=sitting&&picnicShown(),focusAnimal=life.focus?animalWorld(life.focus.id):null,pickTarget=life.litter.pickup&&props?props.litter.get(life.litter.pickup.id)?.userData.home:null,drinking=!!life.water.drink,lifeAct=lifePose(life);
  if(noodling){const seat=worldAt(NOODLE_SPOT.seat.s,NOODLE_SPOT.seat.offset);hero.root.position.set(seat.x,seat.y,seat.z);}
  const dir=input();const animal=world.squirrel.position,F=world.falls,L=world.leaf.position;
  let yaw=noodling?NOODLE_SPOT.seat.yaw:sitting?seatWorld(seatIndex).yaw:focusAnimal?Math.atan2(focusAnimal.x-p.x,focusAnimal.z-p.z):pickTarget?Math.atan2(pickTarget.x-p.x,pickTarget.z-p.z):wildlife?angle+Math.atan2(Math.sin(Math.atan2(animal.x-p.x,animal.z-p.z)-angle),Math.cos(Math.atan2(animal.x-p.x,animal.z-p.z)-angle))*.52:falls?Math.atan2(F.x-p.x,F.z-p.z):followLeaf?Math.atan2(L.x-p.x,L.z-p.z):waterRest?Math.atan2(riverX(state.y-2)-p.x,2):greeting?Math.PI/2-.4:lookback?-Math.PI*.2:groupPhoto?0:angle;if(moving){const dx=dir.x+slope*dir.y,dz=-dir.y;yaw=Math.atan2(dx,dz);}
  if(diningNow){const q=dining.point(classroom.token?classroom.mealSlot:0);hero.root.position.set(q.x,q.y,q.z);yaw=q.yaw;}
  hero.root.rotation.y+=Math.atan2(Math.sin(yaw-hero.root.rotation.y),Math.cos(yaw-hero.root.rotation.y))*(snap?1:1-Math.exp(-dt*12));
  const activity=lifeAct||(diningNow?'sit':currentPose(moving));heroActivity=activity;
  hero.pose(traveled,moving,time,mode==='rest'||time<waveUntil||groupPhoto||!!lifeAct||noodling,reduced,sitting||noodling?0:grade(state.y)*-Math.cos(hero.root.rotation.y),actorActivity(hero,activity==='walk'||activity==='stand'?'look':activity));
  if(!sitting&&!wildlife&&!lifeAct&&!noodling){hero.head.rotation.y-=clamp(view.yaw,-1,1)*.55;hero.head.rotation.x-=clamp(view.pitch,-.6,.6)*.5;}
  // Solo teacher (hidden when a real teacher is in the room). For the summit group photo the teacher glides over to the
  // child's left and waves (lerp only on the deck). Otherwise the teacher walks ahead on the trail (starts when the child comes within ~5 m, stops ~12 m ahead and turns to watch)
  // and waits at each landmark; a landmark snap only on reset/goto, reduced motion or when the child is far away (stepLead).
  const gs=guideSpot(state.y),posing=groupPhotoActive();
  stepLead(lead,gs,{s:state.y,offset:state.x,moving,speed:heroSpeed},snap?0:dt,{snap:snap&&leadSnap,reduced});leadSnap=false;
  const g=worldAt(lead.s,lead.offset);
  // Cup noodles: the teacher glides (deck lerp, as for the photo) to the far side of the mat, kneels, and pours while the action runs.
  if(posing)guideSlot.set(p.x-1.15,p.y,p.z+.05);else if(noodling){const t=worldAt(NOODLE_SPOT.teacher.s,NOODLE_SPOT.teacher.offset);guideSlot.set(t.x,t.y,t.z);}else guideSlot.set(g.x,g.y,g.z);
  if(diningNow){const q=dining.teacherPoint();guideSlot.set(q.x,q.y,q.z);}
  const glide=!diningNow&&!snap&&gs===guideSpots.at(-1)&&state.y>SUMMIT.from-6;
  guidePrev.copy(guide.root.position);
  if(glide)guide.root.position.lerp(guideSlot,1-Math.exp(-dt*2.6));else guide.root.position.copy(guideSlot);
  const guideStep=snap?0:Math.hypot(guide.root.position.x-guidePrev.x,guide.root.position.z-guidePrev.z),guideMoving=guideStep>dt*.25;
  guideTraveled+=guideStep;
  const guideYaw=diningNow?dining.teacherPoint().yaw:posing?0:noodling?NOODLE_SPOT.teacher.yaw:lead.yaw;guide.root.rotation.y+=Math.atan2(Math.sin(guideYaw-guide.root.rotation.y),Math.cos(guideYaw-guide.root.rotation.y))*(glide?1-Math.exp(-dt*4):1);
  const teacherAct=posing?'wave':noodling?(life.meals.noodle.action?.id==='pour'?'pour':'crouch'):guideMoving?'look':lead.activity;
  guide.pose(guideTraveled,guideMoving,time,!guideMoving,reduced,guideMoving?grade(lead.s)*-Math.cos(guide.root.rotation.y):0,actorActivity(guide,teacherAct));
  readHands();
  const creekView=clamp((state.y-184)/12,0,1)*(1-clamp((state.y-218)/16,0,1));
  const ahead=worldAt(Math.min(LENGTH+6,state.y+5+creekView*2.5),0),back=worldAt(state.y-5.4+creekView*.30,state.x*.2);
  desired.set(back.x+(camera.aspect<1?.25:.55)-creekView*2.3,p.y+2.55-creekView*.15,back.z);
  const target=new T.Vector3(p.x+(ahead.x-p.x)*(.45+creekView*.30)+(camera.aspect<1?0:.15+creekView*.65),p.y+1.5-creekView*.12+Math.min(.65,(ahead.y-p.y)*.25),ahead.z);
  const creekShelf=T.MathUtils.smoothstep(state.y,335,345)*(1-T.MathUtils.smoothstep(state.y,425,435));
  desired.x-=creekShelf*.35;target.x-=creekShelf*.65;
  const shore=[210,362].includes(spot)?Math.sign(riverX(state.y-2)-p.x)||1:1;
  if(mode==='rest'){desired.set(p.x+shore*2,p.y+3.8,p.z+7.5);target.set(p.x+shore*1.4,p.y+.8,p.z-1.5);}
  if(mode==='rest'&&camera.aspect<1){const backWide=worldAt(state.y-10,shore*1.4);desired.set(backWide.x,p.y+5.2,backWide.z);target.set(p.x+shore*2,p.y+1,p.z-1);}
  if(waterRest){
    // At the bridge the camera aims a little downstream of the deck edge, where the floated leaf drifts into open water.
    const rs=spot===210?206:364,ts=spot===210?201.5:rs;
    target.set(riverX(ts),elevation(ts)+.25,-ts);
    // Stay above the open channel at the bridge; the bank-side camera was hidden by a foreground tree.
    const backS=rs-(camera.aspect<1?8:9);
    desired.set(spot===210?riverX(backS)+.6:riverX(rs)+(camera.aspect<1?.6:7),elevation(rs)+(camera.aspect<1?6:5.5),-backS);
  }
  if(followLeaf){
    // 시냇물: a three-quarter view that travels with the leaf down the creek. The camera hangs above the open channel a few
    // metres downstream (riverX of its own s, left of centre) and 3 m up, looking down past the bed stones at the leaf; the old
    // right-bank position (L.x+2.4, 2.2 up) ended behind a foreground boulder when the leaf settled at its resting stone.
    const cs=-L.z-(camera.aspect<1?4.6:3.8);desired.set(riverX(cs)-(camera.aspect<1?-.1:.5),L.y+(camera.aspect<1?3.8:3.0),-cs);target.set(L.x,L.y+.05,L.z-.5);
  }
  if(falls){
    // 폭포: the camera stands on the creek bank below the shelter and looks up the water at the ledge (spray, pool, rainbow).
    const bs=SCENIC.waterfall.stop+7;desired.set(riverX(bs)+2.6,elevation(bs)+(camera.aspect<1?2.4:1.7),-(bs-(camera.aspect<1?.5:1.5)));target.set(F.x,F.y+1.3,F.z);
  }
  if(sitting){
    const b=hero.root.position;
    if(camera.aspect<1){desired.set(b.x+2,b.y+5.5,b.z+9);target.set(b.x,b.y+1.5,b.z);}
    else{desired.set(b.x+5,b.y+4,b.z+7);target.set(b.x+.6,b.y+1,b.z);}
  }
  if(greeting){const f=worldAt(30,2.4);target.set((p.x+f.x)/2,p.y+1.1,(p.z+f.z)/2);desired.set(target.x-1.5,p.y+(camera.aspect<1?4.5:2.6),target.z+(camera.aspect<1?8:5.5));}
  if(mode==='rest'&&spot===115){
    const bird=world.bp;target.set((p.x+bird.x)/2,p.y+1.25,(p.z+bird.z)/2);
    desired.set(target.x-2,p.y+(camera.aspect<1?5.5:3.6),Math.max(p.z,bird.z)+(camera.aspect<1?9:6));
  }
  if(wildlife){
    const gap=Math.hypot(animal.x-p.x,animal.z-p.z);
    target.set((p.x+animal.x)/2,p.y+.65,(p.z+animal.z)/2);
    desired.set(target.x-.85,p.y+(camera.aspect<1?3.8:2.8),target.z+Math.max(camera.aspect<1?9:5.5,gap+3)+(observation?.id==='space'?1.2:0));
  }
  if(lookback){
    // Stand beside the lookout rock and face the valley. The camera is a little up the trail, nearly in line with the child
    // (x-.5 instead of -1.2), and aims back down past the squirrel forest toward the shelter valley; the child stays on the
    // left third of the frame instead of being cut off. The bridge is hidden by the forest and is not promised in the text.
    const far=worldAt(state.y-70,-13);desired.set(p.x-.5,p.y+2.5,p.z-5.2);target.set(far.x,Math.min(far.y,p.y-7)+2,far.z);
    if(camera.aspect<1)desired.set(p.x-.3,p.y+3,p.z-6);
  }
  if(lookAhead){
    // 전망대 "정상 쪽 보기": the real summit flag (717) is hidden from here by the 580–625 rise, so the camera aims from behind-left
    // of the child at the nearer trail-marker flag on the next rise (world.lookoutFlag, ~27 m ahead on the valley edge); the child
    // stays in the lower frame. On portrait the aim shifts right so the flag sits left of the top-right rest card.
    const M=world.lookoutFlag;desired.set(p.x-1.0,p.y+2.0,p.z+(camera.aspect<1?5.2:4.0));target.set(M.x+(camera.aspect<1?1.5:0),M.y+(camera.aspect<1?1.6:2.0),M.z);
  }
  desired.y=Math.max(desired.y,terrain(desired.x,-desired.z)+1.2);
  if(state.y>SUMMIT.from-4&&mode!=='rest'){
    // G09: on a portrait tablet the finish card sits bottom-right (≈355–745 px of 768). Slide camera and aim together
    // 1.3 m to the right (pure translation, same view direction) so the child stands on the left third beside the card
    // instead of under it. Landscape and the walk up are unchanged; the deck is |offset| <= 4.4 so the camera stays on it.
    const opening=clamp((state.y-SUMMIT.from+4)/10,0,1),side=(camera.aspect<1&&mode==='finished')?1.3:0,summitBack=worldAt(state.y-6.5,state.x*.2+side),summitAhead=worldAt(state.y+6,side);
    desired.lerp(new T.Vector3(summitBack.x,p.y+3.25,summitBack.z),opening);target.lerp(new T.Vector3(summitAhead.x,p.y+.8,summitAhead.z),opening);
  }
  if(groupPhoto){
    // 정상 단체 사진: camera on the trail side looking at the row (teacher · child · friend) with the panorama behind them,
    // framed clear of the finish card. Landscape (card bottom-right, ≥580 px of 1024): camera and aim slide right together
    // (1.2 m × aspect, pure translation) and sit 6.2 m back, so the row fills the left ~half hat-to-shoes. Portrait (card at
    // the bottom): the camera tilts down a little so the row stands in the upper 15–41 % of the frame above the card.
    if(camera.aspect<1){desired.set(p.x-.05,p.y+1.7,p.z+6.4);target.set(p.x-.05,p.y-.75,p.z);}
    else{const side=camera.aspect*1.2;desired.set(p.x+side,p.y+1.5,p.z+6.2);target.set(p.x+side-.1,p.y+.9,p.z);}
  }
  // ---- Hiking-life framings (after the place cameras, so they win while an action runs) ----
  {const h=hero.root.position,yawH=hero.root.rotation.y,fx=Math.sin(yawH),fz=Math.cos(yawH),rx=fz,rz=-fx,portrait=camera.aspect<1;
    if(focusAnimal){
      // Over the shoulder toward the animal: camera behind the child on the side away from the animal, aim between head and animal.
      const a=focusAnimal,sideSign=Math.sign((a.x-h.x)*rx+(a.z-h.z)*rz)||1;
      desired.set(h.x-fx*2.3-rx*sideSign*1.3,h.y+1.8+(portrait?.6:0),h.z-fz*2.3-rz*sideSign*1.3+(portrait?.8:0));
      target.set(h.x+(a.x-h.x)*.7,h.y+1.35+(a.y-(h.y+1.35))*.7,h.z+(a.z-h.z)*.7);
    }else if(pickTarget){
      desired.set(h.x-fx*2.0+rx*1.4,h.y+1.8+(portrait?.6:0),h.z-fz*2.0+rz*1.4);target.set(pickTarget.x,pickTarget.y+.15,pickTarget.z);
    }else if(drinking){
      desired.set(h.x+fx*2.4+rx*1.1,h.y+1.75,h.z+fz*2.4+rz*1.1);target.set(h.x,h.y+1.25,h.z);
    }else if(picnicking||noodling){
      // Child, mat (box or cup) and friend together: camera to the side of the child→mat line, looking across the mat.
      const L=noodling?NOODLE_SPOT.mat:picnicLayout(seatIndex).mat,m=worldAt(L.s,L.offset),mx=(h.x+m.x)/2,mz=(h.z+m.z)/2;
      let dx=m.x-h.x,dz=m.z-h.z;const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const sx=dz*(noodling?-1:1),sz=-dx*(noodling?-1:1),dist=portrait?5.0:noodling?4.3:3.9;
      desired.set(mx+sx*dist+(noodling&&!portrait?1.0:0),h.y+(portrait?3.1:2.4),mz+sz*dist);target.set(mx+(noodling&&!portrait?1.0:0),h.y+.45-(noodling&&portrait?.5:0),mz);
    }
    desired.y=Math.max(desired.y,terrain(desired.x,-desired.z)+1.0);}
  if(diningNow){const c=dining.center,portrait=camera.aspect<1;desired.set(c.x+1.3,c.y+(portrait?5.8:4.4),c.z+(portrait?8.7:7.2));target.set(c.x+(portrait?0:1.0),c.y+(portrait?-.55:.65),c.z);}
  if(canLook()){
    turnView(view,(Number(keys.has('KeyL'))-Number(keys.has('KeyJ')))*dt*1.2,(Number(keys.has('KeyI'))-Number(keys.has('KeyK')))*dt*.9);
    target.copy(sightTarget(desired,target,view));
  }
  const blend=snap||reduced?1:1-Math.exp(-dt*4);camPos.lerp(desired,blend);look.lerp(target,blend);camera.position.copy(camPos);camera.lookAt(look);
}
// Peers: smoothed trail coordinates, walking phase from real displacement, gaze from the sent view, wave and seat states.
function placePeers(dt){
  for(const p of peers.values()){
    if(mode==='explore'){p.child.root.visible=false;continue;}
    const t=p.target,kind=diningKind();
    if(kind){
      p.child.root.visible=classroom.connected&&p.online&&t.meal?.kind===kind;
      if(p.child.root.visible){const q=dining.point(p.mealSlot,groupOf(p.mealSlot));p.child.root.position.set(q.x,q.y,q.z);p.child.root.rotation.y=q.yaw;
        const eating=t.meal.action==='bite'&&time-p.mealAt<1.6;p.child.pose(p.traveled,false,time,true,reduced,0,actorActivity(p.child,eating?'eat':'sit'));}
      continue;
    }
    if(t.meal){
      p.child.root.visible=classroom.connected&&p.online&&Math.abs(t.y-state.y)<15;
      if(p.child.root.visible){const q=dining.point(p.mealSlot,groupOf(p.mealSlot));p.child.root.position.set(q.x,q.y,q.z);p.child.root.rotation.y=q.yaw;p.child.pose(p.traveled,false,time,true,reduced,0,actorActivity(p.child,t.meal.action==='bite'&&time-p.mealAt<1.6?'eat':'sit'));}
      continue;
    }
    const k=1-Math.exp(-dt*6);const before={x:p.cur.x,y:p.cur.y};
    p.cur.x+=(t.x-p.cur.x)*k;p.cur.y+=(t.y-p.cur.y)*k;
    const step=Math.hypot(p.cur.x-before.x,p.cur.y-before.y);p.traveled+=step;const moving=t.pose==='walk'&&step>.002;
    const far=Math.abs(p.cur.y-state.y)>55;p.child.root.visible=!far;if(far)continue;
    const w=worldAt(p.cur.y,p.cur.x),sit=t.pose==='sit';
    if(sit&&!t.meal){const seat=seatWorld(Math.max(0,t.seat));p.child.root.position.set(seat.x,seat.y,seat.z);p.child.root.rotation.y=seat.yaw;}
    else{p.child.root.position.set(w.x,w.y,w.z);let yaw=p.yaw;if(moving){const dx=(p.cur.x-before.x)+pathSlope(p.cur.y)*(p.cur.y-before.y),dz=-(p.cur.y-before.y);yaw=Math.atan2(dx,dz);}else yaw=Math.atan2(pathSlope(p.cur.y),-1);p.yaw+=Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw))*(1-Math.exp(-dt*8));p.child.root.rotation.y=p.yaw;}
    const waving=time<p.waveUntil||t.pose==='wave',activity=sit?'sit':waving?'wave':t.pose==='observe'?'observe':t.pose==='crouch'?'crouch':'look';
    p.child.pose(p.traveled,moving,time+p.id*.37,!moving&&(sit||waving||t.pose==='observe'||!p.online),reduced,sit?0:grade(p.cur.y)*-Math.cos(p.yaw),actorActivity(p.child,activity));
    if(!sit){p.child.head.rotation.y-=clamp(t.yaw||0,-1,1)*.55;p.child.head.rotation.x-=clamp(t.pitch||0,-.6,.6)*.5;}
  }
}
const explorer=createExplorer({world,canvas,enter:()=>modeTo('explore'),leave:()=>{modeTo(exploreFrom);renderLifeRows();if(mode==='finished')renderSummary($('life-summary'));position(true);focusGame();},running:()=>mode==='explore',animalAt:animalWorld,observe:beginFocus,getS:()=>state.y,
 getPeers:()=>classroom.connected?[...peers.values()].filter(p=>p.online&&p.target.leaf&&groupOf(p.mealSlot)===groupOf(classroom.mealSlot)).slice(0,4).map(p=>({...p.target.leaf,age:Math.min(18,p.target.leaf.age+Math.min(1.1,time-p.leafAt))})):[]});
$('camera-tool').onclick=()=>openAdventure('photo');$('album-open').onclick=()=>openAdventure('album');
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?65:45;camera.updateProjectionMatrix();const ratio=(panorama.image.width/panorama.image.height)/camera.aspect;panorama.repeat.set(Math.min(1,1/ratio),Math.min(1,ratio));panorama.offset.set((1-panorama.repeat.x)/2,(1-panorama.repeat.y)/2);}window.addEventListener('resize',resize);resize();position(true);
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden||mode==='error')return;
  let moving=false;heroSpeed=0;if(!frozen()&&mode!=='intro'){time+=dt;if(mode==='playing'){const before=state,walked=traveled;let dir=input();let scale=1;if(autoWalk){const auto=autoWalkInput({s:state.y},autoWalk);if(auto&&!dir.x&&!dir.y){dir=auto;scale=1.45;}else if(!auto){const reason=autoWalk.reason;stopAutoWalk();announce(arrivedText(reason),4);}}
      if(dir.x||dir.y)cancelFree(life);
      else if(life.litter.pickup){const item=litterById(life.litter.pickup.id),dx=item.offset-state.x,dy=item.s-state.y,d=Math.hypot(dx,dy);if(d>.7)dir={x:dx/d,y:dy/d};}
      state=advance(state,dir,dt,undefined,scale);moving=state.moving;const oldPos=worldAt(before.y,before.x),newPos=worldAt(state.y,state.x);traveled+=Math.hypot(newPos.x-oldPos.x,newPos.z-oldPos.z);heroSpeed=dt>0?(traveled-walked)/dt:0;if(autoWalk&&!moving)stopAutoWalk();
      const cue=walk(life,traveled-walked);if(cue)announce(cue,7);}idle=moving?0:idle+dt;
    const lane=laneName(state.x,state.y),current=place(state.y)+(lane?' · '+lane:'');if(current!==lastPlace){lastPlace=current;$('place').textContent=current;}
    const section=sectionIndex(state.y);if(section!==lastSection&&mode==='playing'){const first=lastSection<0;lastSection=section;if(!first)announce(sections[section].guide,7);if(section===5)sound.rustle(.5);if(classroom.role==='teacher')markLesson();}
    if(!forkNoted&&forkGap(state.y+6)>0){forkNoted=true;announce('왼쪽은 꽃길, 오른쪽은 고사리길. 어느 쪽이든 같은 쉼터에서 만나요.',8);}
    if(!lookNoted&&traveled>8&&mode==='playing'){lookNoted=true;announce('화면을 드래그하거나 I J K L로 주위를 둘러봐요.',7);}
    const next=nextExperience(state.y);if($('next-experience').textContent!==next)$('next-experience').textContent=next;
    const remaining=distanceText(state.y),height=heightText(state.y);
    if($('distance').textContent!==remaining)$('distance').textContent=remaining;
    if($('height').textContent!==height)$('height').textContent=height;
    $('progress').value=state.y;
    const spot=nearby(state.y),reachable=mode==='playing'?nearestLitter(life,{s:state.y,x:state.x}):null,litterHere=!spot&&reachable,animalHere=!spot&&!litterHere&&mode==='playing'?animalNear(state.y):null,near=!spot&&!litterHere&&!animalHere&&classroom.connected&&peersNear().length>0;
    $('action').hidden=!(spot||litterHere||animalHere||near)||mode!=='playing';const label=spot?spot.name:litterHere?'쓰레기 줍기':animalHere?animalHere.label:'손 흔들기';if($('action').dataset.spot!==label){$('action').dataset.spot=label;$('action').innerHTML=label+' <kbd>E</kbd>';}
    const pickable=!!reachable&&!life.litter.pickup;if($('pick').hidden===pickable)$('pick').hidden=!pickable;
    const th=Math.round(thirst(life)*100);if(th!==lastThirst){lastThirst=th;$('flask').style.setProperty('--thirst',String(th/100));$('flask').title='물 마시기 (F) · 걸은 만큼 목이 말라요 '+th+'%';}
    const drinkFlag=!!life.water.drink;if(drinkFlag!==lastDrinkFlag){lastDrinkFlag=drinkFlag;$('flask').setAttribute('aria-pressed',String(drinkFlag));}
    if(spot?.s===362&&mode==='playing')seatIndex=seatFor(state.x,state.y);
    const followable=mode==='playing'&&classroom.connected&&(autoWalk||followTarget());$('follow').hidden=!followable;if(followable&&!autoWalk){const t=followTarget();$('follow').textContent=followLabel(t.reason);}else if(autoWalk)$('follow').textContent='멈추기';
    if(time>noteUntil)$('note').textContent='';
    if((mode==='rest'||mode==='finished')&&advanceObservation(observation,dt,memories)){
      if(mode==='rest'){$('observe-feedback').textContent=observation.memory;$('observe-saved').textContent=observation.note?'이 장면과 고른 한 줄을 산책 기억에 남겼어요.':'이 장면을 산책 기억에 남겼어요.';}
      else{renderMemories();$('finish-text').textContent=resultText(observation,stayText(SUMMIT.platform));if(observation.id==='group'){flash();sound.chirp();}}
      renderChoices(observation.spot);showAsk();
    }
    stepLife(dt);
    if(state.y>SUMMIT.platform-2&&!reached){reached=true;announce('바람봉 정상이에요. 전망 자리에서 E를 눌러 풍경을 보고, 다 같이 사진도 찍어요. 선생님 보온병의 컵라면도 있어요.',10);}
    sound.tick(time,state.y,moving,traveled);
    if(classroom.connected)classroom.sendState({x:state.x,y:state.y,yaw:view.yaw,pitch:view.pitch,leaf:explorer.packet(),meal:sharedMeal(),pose:netPose(heroActivity),seat:mode==='rest'&&observation?.id==='sit'?seatIndex:-1},now);
  }
  if(!frozen()){
    lifeView.focus=explorer.focus||life.focus?.id||null;lifeView.focusT=focusProgress(life);lifeView.picnic.active=picnicShown();lifeView.picnic.seat=seatIndex;lifeView.picnic.eating=life.meals.picnic.action?.id==='bite';
    lifeView.noodle.active=noodleShown();lifeView.noodle.eating=life.meals.noodle.action?.id==='bite';lifeView.cheerUntil=life.litter.lastPickedAt+3.2;
    startDiningFrame();
    const events=world.update(time,state.y,idle,reduced,(mode==='rest'||mode==='finished')?observation:null,{x:hero.root.position.x,z:hero.root.position.z,moving},lifeView);if(events.leafKick)sound.rustle(.6);position(false,dt,moving);placePeers(dt);
    const diningNow=diningKind();if(mode==='explore')guide.root.visible=false;
    for(const [key,npc] of Object.entries(world.friends)){npc.root.visible=!diningNow&&mode!=='explore';if(diningNow&&!classroom.token&&['shelterFriend','summitFriend'].includes(key)){
      const q=dining.point(key==='shelterFriend'?1:4,0);npc.root.visible=true;npc.root.position.set(q.x,q.y,q.z);npc.root.rotation.y=q.yaw;npc.pose(0,false,time,true,reduced,0,actorActivity(npc,'sit'));}}
    if(props){propView.picnicShown=lifeView.picnic.active;propView.noodleShown=lifeView.noodle.active;propView.seat=seatIndex;props.update(time,life,hands,propView,reduced);if(diningNow)props.hideMeals();}
    if(diningNow)dining.update(time,hands,life.meals[diningNow],reduced);
    explorer.update(dt,time,reduced);
  }renderer.render(scene,camera);
}requestAnimationFrame(frame);
// ---- QA hooks: only on localhost with ?qa=1 (parent's browser checks inject their own helper; nothing in the UI uses them) ----
if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&new URLSearchParams(location.search).get('qa')==='1')window.forestQA={
  state:()=>({mode,s:state.y,x:state.x,observation:observation&&{spot:observation.spot,id:observation.id,elapsed:observation.elapsed,done:observation.done},memories:[...memories.entries()],photoPosed:world.photoPosed(),fallsSeen:world.fallsSeen(),leafRested:world.leafRested(),bridgeAssets:world.bridge.userData.assets,bridgeSpan:world.bridge.userData.span,hero:hero.root.name,guide:guide.root.name,friends:Object.fromEntries(Object.entries(world.friends).map(([k,v])=>[k,v.root.name]))}),
  goto(s,x=0){if(mode==='intro')reset();closeJournal(true);if(mode!=='playing'){cancelCard(life);observation=null;modeTo('playing');renderLifeRows();}state={x,y:clamp(s,0,LENGTH)};leadSnap=true;position(true);},
  interact,choose:id=>{const spot=nearby(state.y);if(spot&&mode!=='playing')chooseObservation(spot.s,id);},
  ready:()=>Promise.all([heroReady,guideReady,world.upgrades]),scenic:SCENIC,falls:world.falls,
  // Read-only hiking-life snapshot: pure state (life.mjs), prop visibility/positions (props.mjs), journal dialog state and the
  // pose currently applied to the hero. Nothing here changes state; actions go through the real buttons/keys (or `life` helpers below).
  life:()=>({state:lifeSnapshot(life),pose:heroActivity,journal:{open:mode==='journal',from:journalFrom},hands:Object.fromEntries(Object.entries(hands).map(([k,v])=>[k,v?{x:+v.x.toFixed(2),y:+v.y.toFixed(2),z:+v.z.toFixed(2)}:null])),props:props?props.snapshot():null,litterSpots:props?props.litterSpots():null}),
  dining:()=>({...dining.snapshot(),connected:classroom.connected,mealSlot:classroom.mealSlot,peers:[...peers.values()].map(p=>({id:p.id,slot:p.mealSlot,online:p.online,meal:p.target.meal,visible:p.child.root.visible,position:p.child.root.position.toArray()}))}),
  exploration:()=>explorer.snapshot(),
  lifeDo:{drink:drinkWater,pick:pickLitter,focus:beginFocus,meal:beginMeal,journal:()=>mode==='journal'?closeJournal():openJournal()}
};

