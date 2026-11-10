// app.mjs — screens (숲속 걷기 / 숲 꾸미기), placement flow, selection, saves, photos, postcard.
import {KEY,LEGACY_KEY,LIMIT,MATERIALS,DRAWERS,MISSIONS,SCALES,ROTATION_STEP,TAGS,material,initial,item,uuid,clone,normRot,parse,validate,History,observe,sample,evaluate,evaluateGroup,groupCandidates,deckLocked,ENTRANCE,isLegacy,insideSite,WALK_MARGIN} from './core.mjs';
import {walkable,safeSpot,walkHeight,deckSurfaces,EYE,BODY} from './walk.mjs';
import {ForestWorld} from './world.mjs';
import {texturesReady} from './textures.mjs';
import {assetsReady,modelsReady,modelStatus} from './materials.mjs';
import {ambience} from './loading-audio.mjs';
import {ForestAvatar} from './avatar.mjs';
import {enterGarden} from './entrance.mjs';
await Promise.all([assetsReady,modelsReady,texturesReady]);
await new Promise(resolve=>setTimeout(resolve,0));
const nodes=new Map();const $=s=>{if(!/^#[\w-]+$/.test(s))return document.querySelector(s);if(!nodes.has(s))nodes.set(s,document.getElementById(s.slice(1)));return nodes.get(s);},$$=s=>[...document.querySelectorAll(s)];
export let state=initial();let restored=false,saveFailed=false,writeBlocked=false,unreadable=null;
// An unreadable or unsupported record is never overwritten: its raw text is copied to a recovery key first.
// If that copy cannot be made, autosave to the original key is blocked and the student is told to export.
const BACKUP_KEY=KEY+'-unreadable-backup';
try{const raw=localStorage.getItem(KEY);if(raw){let parsed=null;try{parsed=JSON.parse(raw);}catch{parsed=null;}
 if(parsed&&parsed.version===1){try{if(!localStorage.getItem(LEGACY_KEY))localStorage.setItem(LEGACY_KEY,raw);}catch{}}
 try{state=validate(parsed);restored=true;}catch(e){unreadable=raw;state=initial();console.warn('저장 기록을 읽지 못했어요',e);}
 if(unreadable!==null){saveFailed=true;try{
   // Never overwrite an earlier recovery copy that holds a different record: use a dated key instead.
   let key=BACKUP_KEY;const existing=localStorage.getItem(key);if(existing!==null&&existing!==unreadable)key=BACKUP_KEY+'-'+Date.now();
   localStorage.setItem(key,unreadable);if(localStorage.getItem(key)!==unreadable)throw Error('backup mismatch');}
  catch(e){writeBlocked=true;console.warn('복구 사본을 만들지 못해 자동저장을 멈춥니다',e);}}}}
catch(e){saveFailed=true;writeBlocked=true;console.warn('저장소에 접근하지 못했어요',e);}
const history=new History();let mode='walk',tab='rec',placing=null,selected=null,confirmation=null,toastTimer,thumbs=new Map(),walkSaveTimer=0,orbitFitted=false,editArrivalStamp='';

export let world;
const terrain=()=>state.terrain.id;
function toast(message,long=false){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),long?6500:4200);}
function save(){if(writeBlocked){saveFailed=true;$('#saveWarning').hidden=false;return;}try{localStorage.setItem(KEY,JSON.stringify(state));saveFailed=false;$('#saveWarning').hidden=true;}catch{saveFailed=true;$('#saveWarning').hidden=false;toast('자동저장이 어려워요. 메뉴의 ‘작업 파일’에서 지금 작품을 저장해 주세요.');}}
function modal(id){document.querySelectorAll('dialog[open]').forEach(x=>x.close());if(world)world.move={x:0,z:0};releaseKeys();$(id).showModal();}
function edit(change){history.push(state);change();save();render();}
// ---- rendering of UI state ----
function render(){world.setItems(state.items,terrain());$('#gardenTitle').textContent=$('#viewTitle').textContent=state.title||'너를 위한 작은 숲';$('#count').textContent=state.items.length+' / '+LIMIT;$('#undo').disabled=!history.states.length;$('#missionName').textContent=MISSIONS[state.mission].name;$('#missionHint').textContent='의뢰 · '+MISSIONS[state.mission].short;$('#missionHint').hidden=!state.items.length;$('#observation').textContent=observe(state.items);$('#legacyNote').hidden=!isLegacy(state);if(selected&&!state.items.some(x=>x.id===selected))clearSelection();selection();if(mode==='view')world.setMarker(walkPos().x,walkPos().z);}
function walkPos(){return state.walk??ENTRANCE[terrain()];}
// ---- screens ----
function setScreen(next){mode=next;$('#walkHud').hidden=next!=='walk';$('#viewHud').hidden=next!=='view';$('#stage').classList.toggle('view-mode',next==='view');if(!world.reduced){$('#stage').classList.remove('fade');void $('#stage').offsetWidth;$('#stage').classList.add('fade');}}
function toView(){if(mode==='view')return;editArrivalStamp=world.itemStamp;$('#intro').hidden=true;$('#walkInvitation').hidden=true;$('#firstPlant').hidden=true;if(state.before===null){state.before={items:clone(state.items),pose:world.walkPose()};}
 state.walk={x:world.walk.x,z:world.walk.z,yaw:world.walk.yaw,pitch:world.walk.pitch};if(!state.intro){state.intro=true;$('#intro').hidden=true;}save();
 world.setMode('view');setScreen('view');palette();if(!orbitFitted)fitOverview();world.setMarker(state.walk.x,state.walk.z);
 if(state.tutorial===0)toast('‘현재 위치’ 표시가 방금 서 있던 자리예요. 아래 서랍에서 나무나 꽃을 골라 미리 보고 놓아요.',true);}
function toWalk(){if(mode==='walk')return;const viewed=state.items.find(it=>it.id===selected)??state.items.at(-1),changed=world.itemStamp!==editArrivalStamp;$('#firstSuccess').hidden=true;cancelPlacing();clearSelection();
 const want=walkPos();let spot=safeSpot(state.items,want.x,want.z);let note='';if(!spot){const e=ENTRANCE[terrain()];spot=safeSpot(state.items,e.x,e.z)??{x:e.x,z:e.z};note='이전 자리가 새 물건으로 막혀서 입구로 이동했어요.';}
 else if(Math.hypot(spot.x-want.x,spot.z-want.z)>.05)note='이전 자리가 막혀서 가까운 자리에서 시작해요.';
 const yaw=changed&&viewed&&Math.hypot(viewed.x-spot.x,viewed.z-spot.z)>.3?Math.atan2(spot.x-viewed.x,spot.z-viewed.z):(want.yaw??0);world.setWalkPose({x:spot.x,z:spot.z,yaw,pitch:want.pitch??.03});state.walk={x:spot.x,z:spot.z,yaw,pitch:want.pitch??.03};if(state.tutorial<2&&state.items.length)state.tutorial=2;save();world.setMode('walk');setScreen('walk');inviteWalk();if(note)toast(note);else if(state.items.length)toast('방금 놓은 것을 눈높이에서 살펴보세요. 다시 ‘숲 꾸미기’로 고칠 수 있어요.');}
$('#toView').onclick=toView;$('#toWalk').onclick=toWalk;
// ---- morning / night: a view setting kept beside the work (own key), never inside the saved work record ----
const ENV_KEY=KEY+'-env';export let environment='morning';
function applyEnv(name,announce){environment=name==='night'?'night':'morning';world.setEnvironment(environment);const night=environment==='night';for(const id of ['#envWalk','#envView']){const b=$(id);b.textContent=night?'🌙 밤':'☀️ 아침';b.setAttribute('aria-pressed',String(night));b.setAttribute('aria-label',night?'지금은 밤이에요. 누르면 아침으로 바꿔요.':'지금은 아침이에요. 누르면 밤으로 바꿔요.');}
 try{localStorage.setItem(ENV_KEY,environment);}catch{}if(announce)toast(night?'밤이 되었어요. 등불과 정자 주변이 따뜻하게 빛나고 반딧불이가 날아요.':'아침이 되었어요. 햇살이 빈터에 가득해요.');}
export function toggleEnvironment(){applyEnv(environment==='night'?'morning':'night',true);}
$('#envWalk').onclick=toggleEnvironment;$('#envView').onclick=toggleEnvironment;
$('#toEntrance').onclick=()=>{$('#walkMenuDialog').close();const e=ENTRANCE[terrain()];const spot=safeSpot(state.items,e.x,e.z)??{x:e.x,z:e.z};world.setWalkPose({x:spot.x,z:spot.z,yaw:e.yaw,pitch:e.pitch});state.walk={x:spot.x,z:spot.z,yaw:e.yaw,pitch:e.pitch};save();toast('입구로 돌아왔어요.');};
// ---- walking input ----
const keys=new Set();const vec={w:[0,-1],a:[-1,0],s:[0,1],d:[1,0],ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0]};let joy={x:0,z:0};
function sendMove(){if(entrancePending||world.entrance){releaseKeys();return;}let x=joy.x,z=joy.z;for(const k of keys){x+=vec[k][0];z+=vec[k][1];}world.move={x:Math.max(-1,Math.min(1,x)),z:Math.max(-1,Math.min(1,z))};}
function releaseKeys(){keys.clear();joy={x:0,z:0};$('#joyThumb').style.transform='';if(world)world.move={x:0,z:0};}
document.addEventListener('keydown',e=>{if(entrancePending||world.entrance)return;if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||document.querySelector('dialog[open]'))return;const k=e.key.length===1?e.key.toLowerCase():e.key;
 if(mode==='walk'&&vec[k]){e.preventDefault();if(!keys.has(k)){keys.add(k);sendMove();ambience.unlock();}return;}
 if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();undo();return;}
 if(e.target.closest?.('.cam-tools'))return;
 if(mode==='view'&&placing){const d={ArrowLeft:[-.25,0],ArrowRight:[.25,0],ArrowUp:[0,-.25],ArrowDown:[0,.25]}[e.key];if(d){e.preventDefault();placing.x+=d[0];placing.z+=d[1];updateGhost();}if(e.key==='Enter'){e.preventDefault();confirmPlacing();}if(e.key==='Escape'){e.preventDefault();cancelPlacing();}}
 else if(mode==='view'&&e.key==='Escape'){clearSelection();}});
document.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keys.delete(k))sendMove();});
window.addEventListener('blur',releaseKeys);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseKeys();});
{const joyEl=$('#joystick'),thumb=$('#joyThumb');let jid=null,joyRect;new ResizeObserver(()=>joyRect=null).observe(joyEl);joyEl.addEventListener('pointerdown',e=>{if(jid!==null)return;jid=e.pointerId;joyRect=joyEl.getBoundingClientRect();joyEl.setPointerCapture(e.pointerId);ambience.unlock();track(e);});
 const track=e=>{const r=joyRect??(joyRect=joyEl.getBoundingClientRect());let dx=(e.clientX-(r.left+r.width/2))/(r.width/2),dz=(e.clientY-(r.top+r.height/2))/(r.height/2);const l=Math.hypot(dx,dz);if(l>1){dx/=l;dz/=l;}const dead=.12;joy={x:Math.abs(dx)<dead?0:dx,z:Math.abs(dz)<dead?0:dz};thumb.style.transform=`translate(${dx*r.width*.3}px,${dz*r.height*.3}px)`;sendMove();};
 joyEl.addEventListener('pointermove',e=>{if(e.pointerId===jid)track(e);});const end=e=>{if(e.pointerId!==jid)return;jid=null;joy={x:0,z:0};thumb.style.transform='';sendMove();};joyEl.addEventListener('pointerup',end);joyEl.addEventListener('pointercancel',end);joyEl.addEventListener('lostpointercapture',end);}

$('#sound').onclick=()=>{const on=ambience.toggle();$('#sound').setAttribute('aria-pressed',String(on));$('#sound').textContent=on?'소리 켬':'소리 끔';};
$('#sound').setAttribute('aria-pressed',String(ambience.on));$('#sound').textContent=ambience.on?'소리 켬':'소리 끔';
// ---- overview: palette and drawers ----
const thumbPending=new Map();let thumbTimer;
function ensureThumbs(){if(thumbTimer||!thumbPending.size||(mode!=='view'&&!$('#starterDialog').open))return;thumbTimer=setTimeout(()=>{thumbTimer=null;if((mode!=='view'&&!$('#starterDialog').open)||!thumbPending.size)return;const [kind,nodes]=thumbPending.entries().next().value;thumbPending.delete(kind);if(![...nodes].some(img=>img.isConnected)){ensureThumbs();return;}try{const src=thumbs.get(kind)??world.thumbnail(kind);thumbs.set(kind,src);for(const img of nodes)if(img.isConnected)img.src=src;}catch(e){console.warn('재료 미리보기 생성 실패',kind,e);}world.render();ensureThumbs();},32);}
function queueThumb(kind,img){if(!thumbPending.has(kind))thumbPending.set(kind,new Set());thumbPending.get(kind).add(img);ensureThumbs();}
function thumbImage(kind,img){if(thumbs.has(kind)){img.src=thumbs.get(kind);return;}if(!modelStatus[kind]||modelStatus[kind]==='ok'){img.onerror=()=>{img.onerror=null;queueThumb(kind,img);};img.src='assets/material-thumbs/'+kind+'.webp?v=visual45';}else queueThumb(kind,img);}
const paletteLists=new Map([['rec',MATERIALS.filter(m=>m.recommended)],...[...new Set(MATERIALS.map(m=>m.drawer))].map(id=>[id,MATERIALS.filter(m=>m.drawer===id)])]);
let paletteTab=null;
function palette(){const target=$('#palette');if(paletteTab===tab){for(const b of target.children){const pressed=String(placing?.kind===b.dataset.material&&!placing.id);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);}return;}paletteTab=tab;target.replaceChildren();thumbPending.clear();const list=paletteLists.get(tab)??[],fragment=document.createDocumentFragment();
 for(const m of list){const b=document.createElement('button');b.className='material';b.dataset.material=m.id;b.setAttribute('aria-pressed',String(placing?.kind===m.id&&!placing.id));b.setAttribute('aria-label',m.name+' · '+m.tag);const img=new Image();img.alt='';thumbImage(m.id,img);const title=document.createElement('strong');title.textContent=m.name;const tag=document.createElement('small');tag.textContent=m.tag;b.append(img,title,tag);b.onclick=()=>startPlacing(m.id);fragment.append(b);}target.append(fragment);
 $$('#tabs button').forEach(t=>{t.classList.toggle('active',t.dataset.tab===tab);t.setAttribute('aria-selected',String(t.dataset.tab===tab));});}
$('#tabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;tab=b.dataset.tab;palette();};
// ---- placement: material → translucent preview → position/rotation/size → confirm or cancel ----
function startPlacing(kind){clearSelection();const keep=placing&&!placing.id?placing:null;const o=world.orbit;const spot=keep?{x:keep.x,z:keep.z}:{x:o.tx,z:o.tz};placing={kind,x:spot.x,z:spot.z,scale:keep?.scale??1,rotation:keep?.rotation??0,n:material(kind).group?(keep?.n??1):1,seed:uuid(),id:null};palette();showPlaceBar();updateGhost();if(!keep)toast(material(kind).name+' 미리보기가 나타났어요. 바닥을 누르거나 끌어서 자리를 정한 뒤 ‘여기에 놓기’를 눌러요.');}
function showPlaceBar(){const m=material(placing.kind);$('#placeBar').hidden=false;$('#selectBar').hidden=true;$('#placeName').textContent=(placing.id?'옮기는 중 · ':'')+m.name;$('#bundle').hidden=!(m.group&&!placing.id);$$('#bundle button').forEach(b=>{b.classList.toggle('active',+b.dataset.n===placing.n);b.setAttribute('aria-pressed',String(+b.dataset.n===placing.n));});}
function candidates(){if(placing.id)return [{id:placing.id,kind:placing.kind,x:placing.x,z:placing.z,scale:placing.scale,rotation:placing.rotation,group:placing.group,on:null}];return groupCandidates(placing.kind,placing.x,placing.z,placing.scale,placing.rotation,placing.n,placing.seed);}
let lastEval=null,lastGhostKey='';
function updateGhost(){if(!placing)return;const cands=candidates(),key=JSON.stringify([cands,world.itemStamp,terrain()]);if(lastEval&&key===lastGhostKey)return;lastGhostKey=key;lastEval=evaluateGroup(state.items,cands,terrain());world.setGhost(cands,lastEval.results);const message=lastEval.ok?(placing.n>1?'묶음 전체를 이 모양으로 놓을 수 있어요.':'여기에 놓을 수 있어요. 끌어서 옮기거나 회전·크기를 바꿔 보세요.'):lastEval.message;if($('#placeMsg').textContent!==message)$('#placeMsg').textContent=message;$('#placeMsg').classList.toggle('warn',!lastEval.ok);$('#confirm').disabled=!lastEval.ok;}
function cancelPlacing(){firstPlanting=false;if(!placing)return;placing=null;lastEval=null;world.setGhost(null);$('#placeBar').hidden=true;palette();}
function confirmPlacing(){if(!placing||!lastEval?.ok)return;const cands=candidates(),results=lastEval.results;
 if(placing.id){edit(()=>{const o=state.items.find(x=>x.id===placing.id);if(o){o.x=cands[0].x;o.z=cands[0].z;o.scale=cands[0].scale;o.rotation=cands[0].rotation;o.on=results[0].on;}});const id=placing.id;placing=null;world.setGhost(null);$('#placeBar').hidden=true;selected=id;selection();toast('옮겼어요.');return;}
 if(state.items.length+cands.length>LIMIT){toast(`한 빈터에는 ${LIMIT}개까지 놓을 수 있어요. 재료를 옮기거나 덜어 보세요.`);return;}
 const name=material(placing.kind).name,n=cands.length;edit(()=>{cands.forEach((c,i)=>state.items.push({...item(c.kind,c.x,c.z,c.scale,c.rotation,c.group),on:results[i].on}));if(state.tutorial===0)state.tutorial=1;});
 if(firstPlanting){firstPlanting=false;firstTree={...state.items[state.items.length-1]};cancelPlacing();$('#firstSuccess').hidden=false;$('#addFirstFlowers').focus();toast('첫 나무가 자리를 잡았어요. 나무 옆에 꽃을 놓으면 작은 풍경이 돼요.');return;}
 placing.seed=uuid();updateGhost();toast(n>1?`${name} ${n}개를 함께 놓았어요. 하나씩 따로 고칠 수도 있어요.`:`${name}를 놓았어요. 같은 자리의 미리보기를 끌어 다음 자리를 정하거나 ‘취소’로 마쳐요.`);}
$('#confirm').onclick=confirmPlacing;$('#cancel').onclick=cancelPlacing;
$('#bundle').onclick=e=>{const b=e.target.closest('[data-n]');if(!b||!placing)return;placing.n=+b.dataset.n;showPlaceBar();updateGhost();};
const rot=d=>{if(!placing)return;placing.rotation=normRot(placing.rotation+d);updateGhost();};const size=d=>{if(!placing)return;const i=SCALES.findIndex(s=>Math.abs(s-placing.scale)<1e-6);const next=SCALES[Math.max(0,Math.min(SCALES.length-1,(i<0?2:i)+d))];placing.scale=next;updateGhost();};
$('#rotL').onclick=()=>rot(-ROTATION_STEP);$('#rotR').onclick=()=>rot(ROTATION_STEP);$('#smaller').onclick=()=>size(-1);$('#bigger').onclick=()=>size(1);
// ---- selection: tap selects only; 이동 starts a move preview ----
function clearSelection(){selected=null;world.select(null);$('#selectBar').hidden=true;}
function selection(){const o=state.items.find(x=>x.id===selected);$('#selectBar').hidden=!o||!!placing;if(!o)return;$('#selName').textContent=material(o.kind).name+(o.group?' (묶음)':'');world.select(selected);}
function selectedItem(){return state.items.find(x=>x.id===selected);}
function changeSelected(fn,what){const o=selectedItem();if(!o)return;if(material(o.kind).base==='deck'&&deckLocked(state.items,o.id)){toast('위에 놓인 물건을 먼저 옮겨 주세요.');return;}const cand={...o};fn(cand);const r=evaluate(state.items,cand,terrain());if(!r.ok){toast(r.message);return;}edit(()=>{Object.assign(o,{x:cand.x,z:cand.z,scale:cand.scale,rotation:cand.rotation,on:r.on});});selection();}
$('#moveBtn').onclick=()=>{const o=selectedItem();if(!o)return;if(material(o.kind).base==='deck'&&deckLocked(state.items,o.id)){toast('위에 놓인 물건을 먼저 옮겨 주세요.');return;}placing={kind:o.kind,x:o.x,z:o.z,scale:o.scale,rotation:o.rotation,n:1,seed:o.id,id:o.id,group:o.group};world.select(null);$('#selectBar').hidden=true;showPlaceBar();updateGhost();toast('바닥을 누르거나 끌어 새 자리를 정하고 ‘여기에 놓기’를 눌러요.');};
$('#selRotL').onclick=()=>changeSelected(c=>c.rotation=normRot(c.rotation-ROTATION_STEP));$('#selRotR').onclick=()=>changeSelected(c=>c.rotation=normRot(c.rotation+ROTATION_STEP));
$('#selSmaller').onclick=()=>changeSelected(c=>{const i=SCALES.findIndex(s=>Math.abs(s-c.scale)<1e-6);c.scale=SCALES[Math.max(0,(i<0?2:i)-1)];});$('#selBigger').onclick=()=>changeSelected(c=>{const i=SCALES.findIndex(s=>Math.abs(s-c.scale)<1e-6);c.scale=SCALES[Math.min(SCALES.length-1,(i<0?2:i)+1)];});
$('#remove').onclick=()=>{const o=selectedItem();if(!o)return;if(material(o.kind).base==='deck'&&deckLocked(state.items,o.id)){toast('위에 놓인 물건을 먼저 옮겨 주세요.');return;}edit(()=>state.items=state.items.filter(x=>x.id!==o.id));clearSelection();toast('지웠어요. ‘되돌리기’로 되살릴 수 있어요.');};
$('#deselect').onclick=clearSelection;
function undo(){const prev=history.undo();if(!prev)return;prev.walk=state.walk;prev.intro=state.intro;state=prev;cancelPlacing();clearSelection();save();render();toast('한 단계 되돌렸어요.');}
$('#undo').onclick=undo;
// ---- world callbacks ----
function onTap(x,z,id){if(mode!=='view')return;
 if(placing){placing.x=x;placing.z=z;updateGhost();return;}
 if(id){if(id!==selected){selected=id;selection();}return;}
 clearSelection();}
world=await (async()=>{try{return await ForestWorld.create($('#stage'),{onTap,ghostAt:(x,z)=>!!placing&&Math.hypot(placing.x-x,placing.z-z)<1.1*placing.scale+(placing.n>1?.6:0),ghostMove:(x,z)=>{if(placing){placing.x=x;placing.z=z;updateGhost();}},ghostDrop:()=>{},onWalk:(w,moved)=>{if(moved)ambience.step(performance.now()/1000);const now=performance.now();if(now-walkSaveTimer>1500){walkSaveTimer=now;inviteWalk();state.walk={x:w.x,z:w.z,yaw:w.yaw,pitch:w.pitch};save();}},onLook:()=>{}});}catch(e){$('#loading').textContent='3D 화면을 열지 못했어요. WebGL을 지원하는 브라우저에서 다시 열어 주세요.';throw e;}})();
world.preparing=true;
// ---- overview tools ----
$('#turnLeft').onclick=()=>world.orbitBy(-.35,0,1);$('#turnRight').onclick=()=>world.orbitBy(.35,0,1);$('#zoomIn').onclick=()=>world.orbitBy(0,0,.8);$('#zoomOut').onclick=()=>world.orbitBy(0,0,1.25);
function fitOverview(){world.orbit.yaw=0;world.orbit.elev=.95;world.orbit.tx=0;world.orbit.tz=0;world.fitSite({top:$('#viewHud .hud-top').getBoundingClientRect().bottom+8,bottom:$('#drawer').getBoundingClientRect().height+12,left:70,right:60});orbitFitted=true;}
$('#fitGarden').onclick=()=>{fitOverview();toast('숲 전체가 보이는 자리로 돌아왔어요.');};
// Camera motion is separate from artwork/ghost coordinates, so panning while placing never moves a material.
function panView(x,z,factor=1){if(mode!=='view'||world.entrance||document.querySelector('dialog[open]'))return;const step=Math.max(.35,Math.min(1.2,world.orbit.dist*.05))*factor;world.orbit.tx+=x*step;world.orbit.tz+=z*step;world.updateCamera();world.dirty=true;}
let panTimer;const stopPan=()=>{clearTimeout(panTimer);panTimer=null;};
for(const button of $$('[data-pan]')){const [x,z]={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]}[button.dataset.pan];
 button.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopPan();e.preventDefault();button.focus({preventScroll:true});button.setPointerCapture(e.pointerId);panView(x,z);const repeat=()=>{if(mode!=='view'||world.entrance||document.querySelector('dialog[open]')){stopPan();return;}panView(x,z,.35);panTimer=setTimeout(repeat,80);};panTimer=setTimeout(repeat,300);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,stopPan);
 button.onclick=e=>{if(e.detail===0)panView(x,z);};
}
window.addEventListener('blur',stopPan);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPan();});
// ---- menu, mission, intention ----
$('#walkMenu').onclick=()=>modal('#walkMenuDialog');$('#walkArtwork').onclick=()=>modal('#menuDialog');
$('#menu').onclick=()=>modal('#menuDialog');$('#help').onclick=()=>modal('#helpDialog');$('#menuHelp').onclick=()=>modal('#helpDialog');
let missionChoice=state.mission;function missions(){const root=$('#missionCards');root.replaceChildren();MISSIONS.forEach((m,i)=>{const b=document.createElement('button');b.classList.toggle('active',i===missionChoice);b.setAttribute('aria-pressed',String(i===missionChoice));const title=document.createElement('strong');title.textContent=m.name;const p=document.createElement('span');p.textContent=m.letter;const small=document.createElement('small');small.textContent=m.focus+' · '+m.question;const image=document.createElement('img');image.src='./assets/letters/'+m.image+'.webp';image.alt=m.imageAlt;image.width=960;image.height=640;image.loading='lazy';image.decoding='async';const copy=document.createElement('div');copy.className='letter-copy';copy.append(title,p,small);b.append(image,copy);b.onclick=()=>{missionChoice=i;root.querySelectorAll('button').forEach((card,j)=>{card.classList.toggle('active',j===i);card.setAttribute('aria-pressed',String(j===i));});};root.append(b);});}
$('#missionHint').onclick=()=>$('#missionOpen').click();$('#firstMission').onclick=()=>$('#missionOpen').click();
$('#missionOpen').onclick=()=>{missionChoice=state.mission;missions();modal('#missionDialog');};
$('#begin').onclick=()=>{edit(()=>state.mission=missionChoice);$('#missionDialog').close();toast(MISSIONS[state.mission].from+' 기다리고 있어요. '+MISSIONS[state.mission].question);};
function openIntent(){$('#titleInput').value=state.title;$('#intentionInput').value=state.intention;modal('#intentDialog');}
$('#intentOpen').onclick=openIntent;$('#editWords').onclick=openIntent;
$('#ideaChips').onclick=e=>{if(e.target.tagName==='BUTTON')$('#intentionInput').value=(e.target.textContent+' 숲을 만들고 싶어요.');};
$('#saveIntent').onclick=()=>{edit(()=>{state.title=$('#titleInput').value.trim().slice(0,30)||'너를 위한 작은 숲';state.intention=$('#intentionInput').value.trim().slice(0,120);if(state.intention)state.tutorial=3;});$('#intentDialog').close();};
// ---- photos: before/after from one absolute pose ----
function currentPose(){if(mode==='walk')return world.walkPose();const w=walkPos();return {x:w.x,y:walkHeight(w.x,w.z,terrain(),world.surfaces)+EYE,z:w.z,yaw:w.yaw??0,pitch:w.pitch??.03,fov:62,aspect:1.6};}
function comparison(){if(state.before===null){state.before={items:clone(state.items),pose:currentPose()};save();}const b=state.before;const before=world.capture(b.items,b.pose);$('#beforeImg').src=before;$('#afterImg').src=JSON.stringify(b.items)===JSON.stringify(state.items)?before:world.capture(state.items,b.pose);$('#poseNote').textContent=`같은 자리 (x ${b.pose.x.toFixed(1)}, z ${b.pose.z.toFixed(1)}), 같은 방향·화각·빛으로 비교해요. 새 물체가 시야를 가렸다면 그 가림도 그대로 보여요.`;}
function reasonTags(){const root=$('#reasonTags');root.replaceChildren();for(const tag of TAGS){const b=document.createElement('button');b.textContent=tag;b.classList.toggle('active',state.tags.includes(tag));b.setAttribute('aria-pressed',String(state.tags.includes(tag)));b.onclick=()=>{state.tags=state.tags.includes(tag)?state.tags.filter(t=>t!==tag):[...state.tags,tag];save();reasonTags();};root.append(b);}}
$('#compare').onclick=()=>{$('#reasonInput').value=state.reason;reasonTags();comparison();modal('#compareDialog');};
$('#rebase').onclick=()=>{state.before={items:clone(state.items),pose:currentPose()};save();comparison();toast('지금 자리와 지금 숲을 새 기준 사진으로 삼았어요.');};
$('#saveReason').onclick=()=>{state.reason=$('#reasonInput').value.trim().slice(0,120);save();$('#compareDialog').close();toast('나의 선택을 기록했어요. 메뉴의 ‘작품 엽서’에서 엽서를 만들 수 있어요.');};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#photo').onclick=async()=>{$('#walkMenuDialog').close();$('#walkMenu').focus();const url=world.capture(state.items,world.walkPose(),1600,1000,true);const blob=await (await fetch(url)).blob();download(blob,(state.title||'작은 숲')+'-사진.png');modal('#photoDoneDialog');};
// ---- files ----
function exportWork(){download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),(state.title||'작은 숲')+'.json');}
$('#files').onclick=()=>{$('#fileError').textContent='';$('#exportBackup').hidden=unreadable===null;modal('#filesDialog');};$('#export').onclick=exportWork;$('#confirmSave').onclick=exportWork;
$('#exportBackup').onclick=()=>{if(unreadable!==null)download(new Blob([unreadable],{type:'application/json'}),'읽지-못한-저장기록.json');};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;$('#fileError').textContent='';try{if(file.size>2*1024*1024)throw Error('2MB 이하의 작품 파일을 골라 주세요.');const imported=parse(await file.text());confirmation=()=>{edit(()=>state=imported);cancelPlacing();clearSelection();if(mode==='view'){world.setMarker(walkPos().x,walkPos().z);}else{const w=walkPos();const s=safeSpot(state.items,w.x,w.z)??ENTRANCE[terrain()];world.setWalkPose({x:s.x,z:s.z,yaw:w.yaw??0,pitch:w.pitch??.03});}toast('작품 파일을 불러왔어요.'+(isLegacy(state)?' 기존 평지 작품은 그대로 보존돼요.':''));};$('#confirmTitle').textContent='저장한 숲을 불러올까요?';modal('#confirmDialog');}catch(err){$('#fileError').textContent=err instanceof SyntaxError?'숲꾸미기 JSON 파일인지 확인해 주세요. 기존 작품은 그대로예요.':err.message;}finally{e.target.value='';}};
function replace(title,fn){confirmation=()=>{cancelPlacing();clearSelection();edit(()=>{fn();});if(state.before===null){state.before={items:clone(state.items),pose:currentPose()};save();}if(mode==='walk'){const w=walkPos();const s=safeSpot(state.items,w.x,w.z)??ENTRANCE[terrain()];world.setWalkPose({x:s.x,z:s.z,yaw:w.yaw??0,pitch:w.pitch??.03});}};$('#confirmTitle').textContent=title;modal('#confirmDialog');}
$('#sample').onclick=()=>replace('예시 숲을 펼쳐 볼까요? (높낮이 빈터에서 열려요)',()=>{const fresh=initial();fresh.mission=state.mission;fresh.title=state.title;fresh.intention=state.intention;fresh.items=sample();state=fresh;});
$('#restartWalk').onclick=()=>$('#empty').click();
$('#empty').onclick=()=>replace('새로 시작할까요? 지금 숲은 비워져요. 필요한 작품은 먼저 파일로 저장해 주세요.',()=>{const fresh=initial();fresh.mission=state.mission;state=fresh;});
$('#confirmYes').onclick=async()=>{const action=confirmation;if(!action)return;confirmation=null;const button=$('#confirmYes'),label=button.textContent,dialog=$('#confirmDialog'),controls=[...dialog.querySelectorAll('button')],preventCancel=e=>e.preventDefault();controls.forEach(b=>b.disabled=true);dialog.addEventListener('cancel',preventCancel);button.textContent='숲을 준비하는 중…';world.preparing=true;
 try{await ForestWorld.pause();action();await world.renderer.compileAsync(world.scene,world.camera);
  // The pond renders into a different target; prepare that shader variant before its first draw too.
  let pond;world.covers.traverse(o=>{if(o.material?.pondReflection)pond=o.material.pondReflection;});
  if(pond){const previous=world.renderer.getRenderTarget();let ready;try{world.renderer.setRenderTarget(pond.target);ready=world.renderer.compileAsync(world.scene,world.camera);}finally{world.renderer.setRenderTarget(previous);}await ready;}
 }catch(error){console.warn('숲 사전 준비를 건너뛰고 기본 렌더로 이어갑니다.',error);}
 finally{world.preparing=false;world.last=performance.now();controls.forEach(b=>b.disabled=false);dialog.removeEventListener('cancel',preventCancel);button.textContent=label;dialog.close();}
};
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
// ---- postcard ----
const imageLoad=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
function wrap(ctx,text,x,y,width,line){let row='',lines=0;for(const ch of [...text.replace(/\s+/g,' ').trim()]){if(ctx.measureText(row+ch).width>width){ctx.fillText(row,x,y+lines*line);lines++;row=ch;}else row+=ch;}ctx.fillText(row,x,y+lines*line);return (lines+1)*line;}
function cover(ctx,img,x,y,w,h){const k=Math.max(w/img.width,h/img.height),sw=w/k,sh=h/k;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);}
let postcardBlob=null,postcardUrl=null,postcardBusy=false;
async function postcard(){if(postcardBusy)return;postcardBusy=true;$('#downloadPostcard').disabled=true;try{await document.fonts.ready;await ForestWorld.pause();const overview=await imageLoad(world.capture(state.items));await ForestWorld.pause();const eyeImg=await imageLoad(world.capture(state.items,currentPose()));const c=document.createElement('canvas');c.width=1800;c.height=1710;const ctx=c.getContext('2d');ctx.fillStyle='#faf7ed';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#71815e';ctx.font='700 20px SUIT';ctx.fillText('A POSTCARD FROM MY FOREST',70,70);ctx.fillStyle='#213f33';ctx.font='700 49px GardenSerif';wrap(ctx,state.title||'너를 위한 작은 숲',70,140,1630,62);cover(ctx,overview,70,215,1660,770);cover(ctx,eyeImg,70,1010,690,440);ctx.fillStyle='#728160';ctx.font='700 22px SUIT';ctx.fillText('눈높이에서 바라본 숲',70,1490);ctx.fillStyle='#213f33';ctx.font='700 30px SUIT';ctx.fillText(MISSIONS[state.mission].name,810,1055);ctx.font='700 23px SUIT';ctx.fillStyle='#73835f';ctx.fillText('누구를 위해 · 나의 표현 의도',810,1120);ctx.font='25px SUIT';ctx.fillStyle='#324e3c';const used=wrap(ctx,state.intention||'아직 적지 않았어요.',810,1165,900,38);const reasonY=1200+used;ctx.fillStyle='#73835f';ctx.font='700 23px SUIT';ctx.fillText('걸어 보고 바꾸거나 그대로 둔 이유',810,reasonY);ctx.font='25px SUIT';ctx.fillStyle='#324e3c';wrap(ctx,state.reason||'아직 적지 않았어요.',810,reasonY+45,900,38);ctx.strokeStyle='#d6ddc8';ctx.beginPath();ctx.moveTo(70,1580);ctx.lineTo(1730,1580);ctx.stroke();ctx.font='700 27px GardenSerif';ctx.fillStyle='#213f33';ctx.fillText('숲꾸미기',70,1640);ctx.font='22px SUIT';ctx.fillStyle='#71815e';ctx.fillText('아까 비어 있던 곳이, 내가 만든 숲이 되었어요.',1050,1640);postcardBlob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!postcardBlob)throw Error('사진 저장을 준비하지 못했어요.');if(postcardUrl)URL.revokeObjectURL(postcardUrl);postcardUrl=URL.createObjectURL(postcardBlob);$('#postcardPreview').src=postcardUrl;$('#downloadPostcard').disabled=false;$('#postcardNotice').textContent=state.intention&&state.reason?'작품과 나의 이유가 한 장의 엽서가 되었어요.':'표현 의도와 전후 비교의 이유를 적으면 이야기가 더 풍성한 엽서가 돼요.';}catch(err){toast('엽서를 만들지 못했어요. 작업 파일을 저장한 뒤 다시 시도해 주세요.');console.error(err);}finally{postcardBusy=false;}}
$('#photoToPostcard').onclick=()=>$('#postcard').click();
$('#postcard').onclick=async()=>{modal('#postcardDialog');await postcard();};$('#downloadPostcard').onclick=()=>{if(postcardBlob)download(postcardBlob,(state.title||'작은 숲')+'-엽서.png');};
new ResizeObserver(()=>$('#stage').style.setProperty('--walk-top',Math.ceil($('#walkHud .hud-top').getBoundingClientRect().bottom+12)+'px')).observe($('#walkHud .hud-top'));
new ResizeObserver(()=>$('#stage').style.setProperty('--drawer',Math.round($('#drawer').getBoundingClientRect().height)+'px')).observe($('#drawer'));
// Character choice stays outside the artwork schema, preserving older saves and exports.
const AVATAR_KEY=KEY+'-avatar';
let entrancePending=true;let firstPlanting=false,firstTree=null;let nearbyItem=null;const visitedViews=new Set();
function inviteWalk(){if(mode!=='walk'||world.entrance||entrancePending)return;let nearest,best=3.6*3.6;for(const it of state.items){if(!['bench','pavilion','pond','oak','birch','cherry'].includes(it.kind))continue;const d=(it.x-world.walk.x)**2+(it.z-world.walk.z)**2;if(d<best){best=d;nearest=it;}}nearbyItem=nearest??null;const show=nearest&&!visitedViews.has(nearest.id);$('#walkInvitation').hidden=!show;if(show&&$('#walkInvitation').dataset.item!==nearest.id){$('#walkInvitation').dataset.item=nearest.id;$('#walkInvitationTitle').textContent=material(nearest.kind).name+' 가까이에 왔어요';$('#walkInvitationText').textContent='걸어 보니 어떤가요? 다듬거나 사진으로 남겨요.';}}

$('#refineHere').onclick=()=>{if(nearbyItem)visitedViews.add(nearbyItem.id);const x=world.walk.x,z=world.walk.z,id=nearbyItem?.id;toView();world.orbit.tx=x;world.orbit.tz=z;world.updateCamera();world.dirty=true;if(id){selected=id;selection();}toast('방금 본 풍경을 위에서 살펴봐요. 재료를 옮기거나 꽃을 더해 보세요.');};
$('#photoHere').onclick=()=>{if(nearbyItem)visitedViews.add(nearbyItem.id);$('#walkInvitation').hidden=true;$('#photo').click();};
$('#dismissWalkInvitation').onclick=()=>{if(nearbyItem)visitedViews.add(nearbyItem.id);$('#walkInvitation').hidden=true;};
function finishEntrance(){entrancePending=false;releaseKeys();$('#stage').classList.remove('entering');$('#walkHud').inert=false;if(restored||saveFailed){$('#intro').hidden=true;$('#firstPlant').hidden=true;$('#toView').focus();return;}state.intro=true;save();$('#intro').hidden=false;$('#intro').textContent='방금 본 건 미래의 정원이에요. 이제 첫 나무부터 심어 볼까요?';world.setMarker(-1.5,6.5);world.marker.visible=true;$('#firstPlant').hidden=false;$('#firstPlant').focus();}
$('#openingReplay').onclick=()=>{if(!world.avatar.actor){modal('#characterDialog');return;}$('#menuDialog').close();toWalk();releaseKeys();$('#stage').classList.add('entering');$('#walkHud').inert=true;enterGarden(world,()=>{releaseKeys();$('#stage').classList.remove('entering');$('#walkHud').inert=false;$('#toView').focus();});};
$('#firstPlant').onclick=()=>{for(const b of $$('[data-starter]'))if(!b.querySelector('img')){const image=new Image();image.alt='';b.prepend(image);thumbImage(b.dataset.starter,image);}modal('#starterDialog');ensureThumbs();};
$$('[data-starter]').forEach(b=>b.onclick=()=>{$('#starterDialog').close();firstPlanting=true;toView();startPlacing(b.dataset.starter);placing.x=-1.5;placing.z=6.5;updateGhost();toast('빛나는 미리보기를 끌어 마음에 드는 자리를 골라요.');});
$('#addFirstFlowers').onclick=()=>{$('#firstSuccess').hidden=true;startPlacing('daisy');if(firstTree){placing.x=firstTree.x+1.3;placing.z=firstTree.z+.4;placing.n=3;showPlaceBar();updateGhost();}};
$('#firstStroll').onclick=()=>{$('#firstSuccess').hidden=true;if(firstTree){const s=safeSpot(state.items,firstTree.x,firstTree.z+2.8);if(s)state.walk={...s,yaw:0,pitch:.03};}toWalk();};
$('#dismissFirstSuccess').onclick=()=>$('#firstSuccess').hidden=true;
world.avatar=new ForestAvatar(world);
$('#character').onclick=()=>modal('#characterDialog');
$('#cameraDistance').onclick=()=>{const near=world.avatar.distance>2;world.avatar.distance=near?1.9:3.4;$('#cameraDistance').textContent=near?'가까이':'여유롭게';$('#cameraDistance').setAttribute('aria-pressed',String(near));world.updateCamera();world.dirty=true;};
async function chooseCharacter(key){
 const buttons=$$('[data-avatar]');buttons.forEach(b=>b.disabled=true);$('#characterStatus').textContent='캐릭터를 불러오는 중…';
 try{await world.avatar.select(key);try{localStorage.setItem(AVATAR_KEY,key);}catch{}buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.avatar===key)));$('#characterStatus').textContent='';$('#characterDialog').close();if(entrancePending){$('#stage').classList.add('entering');$('#walkHud').inert=true;enterGarden(world,finishEntrance);await world.entrance.ready;return;}toast('방향키나 왼쪽 동그라미로 걸어 보세요. 화면을 끌면 바라보는 방향이 바뀌어요.');}
 catch(e){if(entrancePending)modal('#characterDialog');$('#characterStatus').textContent='캐릭터를 불러오지 못했어요. 다시 선택해 주세요. 지금 만든 숲은 그대로예요.';}
 finally{buttons.forEach(b=>b.disabled=false);}
}
$$('[data-avatar]').forEach(b=>b.onclick=()=>chooseCharacter(b.dataset.avatar));
$('#characterDialog').addEventListener('cancel',e=>{if(entrancePending)e.preventDefault();});
$('#characterDialog .close').onclick=()=>{if(!entrancePending)$('#characterDialog').close();};
// ---- boot: first person at a safe spot, work preserved ----
async function boot(){let env='morning';try{if(localStorage.getItem(ENV_KEY)==='night')env='night';}catch{}applyEnv(env,false);render();const w=walkPos();const spot=safeSpot(state.items,w.x,w.z)??safeSpot(state.items,ENTRANCE[terrain()].x,ENTRANCE[terrain()].z)??{x:ENTRANCE[terrain()].x,z:ENTRANCE[terrain()].z};world.setWalkPose({x:spot.x,z:spot.z,yaw:w.yaw??0,pitch:w.pitch??.03});world.setMode('walk');setScreen('walk');$('#intro').hidden=!!state.intro;$('#loadingStatus').textContent=restored&&state.items.length?'내가 꾸민 숲을 불러오고 있어요…':'숲에 빛을 채우는 중…';await world.preparePlacement();world.last=performance.now();let chosen=null;try{chosen=localStorage.getItem(AVATAR_KEY);}catch{}await chooseCharacter(['boy','girl'].includes(chosen)?chosen:'girl');$('#loading').classList.add('ready');setTimeout(()=>{$('#loading').hidden=true;},450);
 if(saveFailed){$('#saveWarning').hidden=false;if(writeBlocked)toast(unreadable!==null?'저장 기록을 읽지 못했고 복구 사본도 만들 수 없어 자동저장을 멈췄어요. 기존 기록은 그대로 두었으니 메뉴의 ‘작업 파일’로 저장해 주세요.':'저장소에 접근하지 못해 자동저장을 멈췄어요. ‘작업 파일’로 저장해 주세요.',true);else toast('저장 기록을 읽지 못했어요. 원문은 복구 사본으로 보관했고 ‘작업 파일’에서 내려받을 수 있어요.',true);}
 else if(restored&&state.items.length)toast('입장 연출 뒤, 지난 작품의 마지막 자리로 돌아와요.');
 }
boot().catch(e=>{console.error(e);$('#loading').hidden=false;$('#loading').classList.remove('ready');$('#loadingStatus').textContent='숲을 준비하지 못했어요. 새로고침해 다시 열어 주세요. 저장된 작품은 그대로예요.';});
