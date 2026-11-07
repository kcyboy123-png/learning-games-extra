// Hiking-life activities of the walk (animal journal, litter, water, two meals): a pure state module shared by app.mjs,
// world.mjs, props.mjs and node:test. No DOM, no three.js. Positions are trail coordinates (s metres along the trail,
// lateral offset from pathX). Everything here is optional for the child: no penalty, no timer, no score, nothing is
// recorded unless the action really completed. A new walk starts from createLife() again.
import {halfWidth,forkGap,walkable,SUMMIT} from '../trail.mjs';
import {POSES} from './protocol.mjs';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const seconds=v=>Number.isFinite(v)&&v>0?v:0;

// ---- Animal journal -------------------------------------------------------------------------------------------------
// Three animals already living in the world (the perch bird at 115, the flower-lane butterfly, the 다람쥐 at 475). `tile` is
// the column of public/assets/animal-journal.webp (0 bird, 1 chipmunk, 2 butterfly). The entry text is deliberately broad:
// the small generic models never name a precise species.
export const ANIMALS=[
  {id:'bird',name:'작은 숲새',s:115,r:8,offset:2.8,tile:0,label:'새를 수첩에 그리기',hint:'가지 위의 새를 조용히 올려다봐요. 새가 고개를 들고 한 번 폴짝 뛰어요.',duration:3,
    where:'햇살 숲의 가지 위',entry:'가지 위에서 노래하던 작은 새예요. 어떤 새인지는 가까이서 오래 봐야 알 수 있어요. 깃 색과 노랫소리를 기억해 둬요.'},
  {id:'butterfly',name:'노란 나비',s:290,r:7,offset:-2.7,tile:2,label:'나비 살펴보기',hint:'꽃길의 나비가 꽃에 앉을 때까지 가만히 봐요. 날개를 천천히 접어요.',duration:3,
    where:'두 갈래 숲길의 꽃길',entry:'꽃길에서 꽃을 찾아 날던 노란 나비예요. 날개를 접고 쉴 때 가만히 보면 무늬가 보여요. 손으로 잡지 않고 눈으로만 봐요.'},
  {id:'chipmunk',name:'다람쥐',s:475,r:10,offset:3.6,tile:1,label:'다람쥐를 수첩에 그리기',hint:'거리를 두고 다람쥐가 하는 일을 지켜봐요. 앞발로 열매를 쥐고 고개를 들어요.',duration:3,
    where:'다람쥐 숲의 수풀',entry:'땅과 나무를 오가며 열매를 모으던 다람쥐예요. 조용히 거리를 두면 더 오래 볼 수 있어요. 먹이는 주지 않아요.'}];
export const animalById=id=>ANIMALS.find(a=>a.id===id)||null;
export const animalNear=s=>ANIMALS.find(a=>Math.abs(a.s-s)<a.r)||null;
export const journalEntries=life=>ANIMALS.map(a=>({...a,seen:life.journal.includes(a.id)}));
// Looking at an animal for its entry: a short animal-focused reaction (camera + animal), then the entry opens once.
// Looking again is allowed (same reaction) but never duplicates the entry; walking away before the end records nothing.
export function startFocus(life,id){const a=animalById(id);if(!a||life.focus)return null;life.focus={id,elapsed:0,duration:a.duration,done:false};return life.focus;}
export function stepFocus(life,dt){
  const f=life.focus;dt=seconds(dt);if(!f||!dt)return null;
  f.elapsed=Math.min(f.duration,f.elapsed+dt);if(f.elapsed<f.duration)return null;
  const fresh=!life.journal.includes(f.id);if(fresh)life.journal.push(f.id);
  life.focus=null;return {id:f.id,fresh};
}
export const cancelFocus=life=>{life.focus=null;};
export const focusProgress=life=>life.focus?clamp(life.focus.elapsed/life.focus.duration,0,1):0;

// ---- Litter -----------------------------------------------------------------------------------------------------------
// Three small, different pieces on the trail edges by the creek: two before the bridge, one after it. Picking one up is a
// crouch-and-reach of a couple of seconds; the piece leaves the ground only when that finishes.
export const LITTER=[
  {id:'wrapper',name:'과자 봉지',s:196,offset:1.9},
  {id:'cap',name:'병뚜껑',s:201,offset:-1.8},
  {id:'cup',name:'종이컵',s:226.8,offset:1.9}];
export const PICKUP={reach:2.2,seconds:2.2};
export const litterById=id=>LITTER.find(l=>l.id===id)||null;
export function nearestLitter(life,pos,reach=PICKUP.reach){
  let best=null,score=reach;
  for(const l of LITTER){if(!life.litter.left.includes(l.id))continue;const d=Math.hypot(l.s-pos.s,l.offset-(Number(pos.x)||0));if(d<score){score=d;best=l.id;}}
  return best;
}
export function startPickup(life,pos,reach=PICKUP.reach){
  if(life.litter.pickup)return null;const id=nearestLitter(life,pos,reach);if(!id)return null;
  life.litter.pickup={id,elapsed:0,duration:PICKUP.seconds};return life.litter.pickup;
}
export function stepPickup(life,dt,time=0){
  const p=life.litter.pickup;dt=seconds(dt);if(!p||!dt)return null;
  p.elapsed=Math.min(p.duration,p.elapsed+dt);if(p.elapsed<p.duration)return null;
  life.litter.pickup=null;const i=life.litter.left.indexOf(p.id);if(i<0)return null;
  life.litter.left.splice(i,1);life.litter.picked.push(p.id);life.litter.lastPickedAt=time;return {id:p.id,count:life.litter.picked.length};
}
export const cancelPickup=life=>{life.litter.pickup=null;};
export const pickupProgress=life=>life.litter.pickup?clamp(life.litter.pickup.elapsed/life.litter.pickup.duration,0,1):0;

// ---- Water --------------------------------------------------------------------------------------------------------------
// Thirst is a soft cue from metres walked since the last sip (never wall-clock, never the camera); two gentle suggestions
// at most per walk, skipped when the child drank recently. Nothing slows down or hurts; drinking is always voluntary.
export const WATER={cues:[180,480],recent:120,full:480,seconds:2.6};
export const WATER_CUES=['꽤 걸었어요. 목이 마르면 가방의 물병으로 한 모금 마셔도 좋아요.','오르막이 이어져요. 물 한 모금 쉬어 가도 좋아요.'];
export function walk(life,metres){
  const m=Number(metres);if(!(m>0))return null;
  const w=life.water,before=w.walked;w.walked+=m;w.since+=m;
  for(const [i,at] of WATER.cues.entries()){
    if(before<at&&w.walked>=at&&!w.cued.includes(i)){w.cued.push(i);if(w.since>=WATER.recent)return WATER_CUES[i];}
  }
  return null;
}
export const thirst=life=>clamp(life.water.since/WATER.full,0,1);
export function startDrink(life){if(life.water.drink)return null;life.water.drink={elapsed:0,duration:WATER.seconds};return life.water.drink;}
export function stepDrink(life,dt){
  const d=life.water.drink;dt=seconds(dt);if(!d||!dt)return false;
  d.elapsed=Math.min(d.duration,d.elapsed+dt);if(d.elapsed<d.duration)return false;
  life.water.drink=null;life.water.drinks++;life.water.since=0;return true;
}
export const cancelDrink=life=>{life.water.drink=null;};
export const drinkProgress=life=>life.water.drink?clamp(life.water.drink.elapsed/life.water.drink.duration,0,1):0;

// ---- Meals --------------------------------------------------------------------------------------------------------------
// Two staged meals: gimbap at the shelter (open → bite ×n → pack) and cup noodles at the summit (the teacher pours → bite ×n →
// pack the empty cup). Each step is a short visible action; a meal counts as a memory only when it was packed after at least
// `minBites`. Packing early is allowed (no memory, the box can be opened again); leaving keeps the stage, never duplicates.
export const MEALS={
  picnic:{stop:362,name:'쉼터 김밥',pieces:3,minBites:2,first:'open',memory:'쉼터에서 친구와 나눠 먹은 김밥',
    actions:{open:{label:'도시락 열기',seconds:1.2},bite:{label:'김밥 한 입',seconds:1.4},pack:{label:'도시락 정리하기',seconds:1.2}},
    lines:{none:'가방에 김밥 도시락이 있어요. 자리에 앉아 꺼내 볼까요?',open:'김밥이 {n}개 남았어요. 천천히 먹어요.',again:'도시락을 다시 열 수 있어요.',done:'김밥을 맛있게 먹고 도시락을 정리했어요.'}},
  noodle:{stop:SUMMIT.platform,name:'정상 컵라면',pieces:3,minBites:2,first:'pour',memory:'정상에서 선생님이 물을 부어 주신 컵라면',
    actions:{pour:{label:'컵라면 받기',seconds:2.5},bite:{label:'후루룩 한 입',seconds:1.4},pack:{label:'빈 컵 챙기기',seconds:1.2}},
    lines:{none:'선생님 보온병에 뜨거운 물이 있어요. 컵라면을 받아 볼까요?',open:'김이 모락모락. {n}입 더 먹을 수 있어요.',again:'컵라면을 다시 받을 수 있어요.',done:'컵라면을 먹고 빈 컵을 가방에 챙겼어요. 불은 쓰지 않았어요.'}}};
export const MEAL_KINDS=Object.keys(MEALS);
export function mealActions(life,kind){
  const m=MEALS[kind],st=life.meals[kind];if(!m||!st||st.completed)return [];
  if(st.stage!=='open')return [m.first];
  const out=[];if(st.bites<m.pieces)out.push('bite');out.push('pack');return out;
}
export const mealLabel=(kind,id)=>MEALS[kind]?.actions[id]?.label||'';
export function startMeal(life,kind,id){
  const m=MEALS[kind],st=life.meals[kind];if(!m||!st||st.action||!mealActions(life,kind).includes(id))return null;
  st.action={id,elapsed:0,duration:m.actions[id].seconds};return st.action;
}
export function stepMeal(life,kind,dt){
  const m=MEALS[kind],st=life.meals[kind],a=st?.action;dt=seconds(dt);if(!a||!dt)return null;
  a.elapsed=Math.min(a.duration,a.elapsed+dt);if(a.elapsed<a.duration)return null;
  st.action=null;
  if(a.id===m.first){st.stage='open';return {kind,id:a.id};}
  if(a.id==='bite'){st.bites=Math.min(m.pieces,st.bites+1);return {kind,id:'bite',bites:st.bites,left:m.pieces-st.bites};}
  st.stage='packed';if(st.bites>=m.minBites&&!st.completed){st.completed=true;return {kind,id:'pack',completed:true,bites:st.bites};}
  return {kind,id:'pack',completed:false,bites:st.bites};
}
export const cancelMeal=(life,kind)=>{if(life.meals[kind])life.meals[kind].action=null;};
export const mealActive=(life,kind)=>{const st=life.meals[kind];return !!st&&(st.stage==='open'||!!st.action);};
export const mealPieces=(life,kind)=>Math.max(0,MEALS[kind].pieces-life.meals[kind].bites);
export const mealProgress=(life,kind)=>{const a=life.meals[kind]?.action;return a?clamp(a.elapsed/a.duration,0,1):0;};
export function mealLine(life,kind){
  const m=MEALS[kind],st=life.meals[kind];
  if(st.completed)return m.lines.done+' · '+st.bites+'입';
  if(st.stage==='open'&&mealPieces(life,kind)===0)return '다 먹었어요. '+(kind==='picnic'?'도시락을':'빈 컵을')+' 챙기고 출발해요.';
  if(st.stage==='open')return m.lines.open.replace('{n}',String(mealPieces(life,kind)));
  return st.stage==='packed'?m.lines.again:m.lines.none;
}
// Where the picnic is laid out, per shelter seat (bench 0 / log 1): the mat on the ground in front of the seat, the box on it,
// and the shelter friend sitting across the mat facing the child. The summit cup noodles use one mat beside the deck's right rail.
export const picnicLayouts=[
  {seat:0,mat:{s:358.9,offset:-2.75,yaw:.35},box:{s:359.05,offset:-2.55},friend:{s:358.1,offset:-2.0,yaw:'face'}},
  {seat:1,mat:{s:365.6,offset:1.7,yaw:-Math.PI*.35},box:{s:365.7,offset:1.9},friend:{s:364.9,offset:.6,yaw:'face'}}];
export const picnicLayout=i=>picnicLayouts[i]||picnicLayouts[0];
export const NOODLE_SPOT={mat:{s:707,offset:2.4,yaw:0},cup:{s:707,offset:2.25},seat:{s:707,offset:1.45,yaw:Math.PI/2},teacher:{s:707,offset:3.05,yaw:-Math.PI/2},friend:{s:708.3,offset:2.9,yaw:'face'}};

// ---- Whole-walk state -----------------------------------------------------------------------------------------------------
export function createLife(){
  return {journal:[],focus:null,
    litter:{left:LITTER.map(l=>l.id),picked:[],pickup:null,lastPickedAt:-99},
    water:{since:0,walked:0,drinks:0,cued:[],drink:null},
    meals:Object.fromEntries(MEAL_KINDS.map(k=>[k,{stage:'none',bites:0,action:null,completed:false}]))};
}
// Cancels every free-walking action (nothing is recorded for an unfinished sip, reach or look).
export function cancelFree(life){cancelDrink(life);cancelPickup(life);cancelFocus(life);}
export function cancelCard(life){cancelFocus(life);for(const k of MEAL_KINDS)cancelMeal(life,k);}
// The hero pose an active life action asks for (null = whatever the walk/observation would do), and its network form.
export const LIFE_POSES={observe:'observe',reach:'crouch',drink:'stand',eat:'sit',pour:'stand'};
export const netPose=p=>POSES.includes(p)?p:(LIFE_POSES[p]||'stand');
export function lifePose(life){
  if(life.focus)return 'observe';if(life.litter.pickup)return 'reach';if(life.water.drink)return 'drink';
  const a=life.meals.picnic.action||life.meals.noodle.action;if(a)return a.id==='bite'?'eat':'sit';
  return null;
}
export const lifeBusy=life=>!!(life.focus||life.litter.pickup||life.water.drink||MEAL_KINDS.some(k=>life.meals[k].action));
export function lifeSummary(life){
  return {animals:ANIMALS.filter(a=>life.journal.includes(a.id)).map(a=>a.name),litter:life.litter.picked.length,drinks:life.water.drinks,
    meals:MEAL_KINDS.filter(k=>life.meals[k].completed).map(k=>({id:k,name:MEALS[k].name,bites:life.meals[k].bites,memory:MEALS[k].memory}))};
}
// Lines for the summit card and the journal: only what really happened; a skipped activity leaves no line at all.
export function summaryLines(life){
  const s=lifeSummary(life),out=[];
  if(s.animals.length)out.push({mark:'journal',text:'숲 수첩에 담은 동물: '+s.animals.join(', ')});
  if(s.litter)out.push({mark:'litter',text:'길가의 쓰레기 '+s.litter+'개를 주워 가방에 담았어요'});
  if(s.drinks)out.push({mark:'flask',text:'물을 '+s.drinks+'번 마셨어요'});
  for(const m of s.meals)out.push({mark:'meal',text:m.memory+' · '+m.bites+'입'});
  return out;
}
export const lifeSnapshot=life=>JSON.parse(JSON.stringify(life));
// Layout sanity used by tests and QA: every laid-out point is on the trail/verge or the summit deck.
export const onCourse=(s,offset)=>walkable(offset,s)||(s>SUMMIT.from&&s<=SUMMIT.rail&&Math.abs(offset)<=4.4)||(Math.abs(offset)<=halfWidth(s)+2&&forkGap(s)===0);
