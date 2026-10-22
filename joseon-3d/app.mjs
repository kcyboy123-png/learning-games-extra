import {bindBackgroundAudio,bindFeedbackSounds} from './game-audio.mjs';
import {bindGameMenu,bindStart} from './game-menu.mjs';
import {createActors} from './actors.mjs';
import {bindRestart} from './reset-progress.mjs';
import {createMission} from './mission.mjs';
import {createRecordBoard} from './record-board.mjs';
import {scenes} from './story.mjs';
import * as THREE from './vendor/three.module.min.js';
import {createWorld} from './scene.mjs';
import {move,route} from './navigation.mjs';
import {createFieldWorld} from './family-world.mjs';
import {createSidequests} from './sidequests.mjs';
import {createTimeGate} from './time-gate.mjs';
import {createExitPortal,portalStand,arrivalSpawn,arrivalBounds} from './exit-portal.mjs';
const WALK_SPEED=3.08*1.2;
let walkBlend=0;
const $=s=>document.querySelector(s),canvas=$('#world'),keys=new Set(),held=new Set();
let started=false,paused=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#motion').setAttribute('aria-pressed',String(reduced));
let clearStatus;function notice(s){$('#status').textContent=s;clearTimeout(clearStatus);clearStatus=setTimeout(()=>$('#status').textContent='',3200);}
bindRestart($('#restart'),notice);
const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('캐릭터 그림을 불러오지 못했어요. 새로고침해 주세요.'));i.src=src;});
try{
await document.fonts.load('24px "Gowun Batang"','기록 조선 농사 가족');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene(),world=createWorld(THREE,scene),camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,300);
const worldNodes=scene.children.filter(n=>!n.isLight);
const [heroImage,catImage,...npcImages]=await Promise.all([image('assets/hero-walk-v7.png'),image('assets/cat-walk.webp'),...['family','farmer','visitor'].map(name=>image(`assets/${name}-npc-v2.png`))]);
const stations=world.stations||[{x:-1.5,z:5},{x:1.4,z:-6},{x:-1.2,z:-19}];
const back=new THREE.Vector3(2.5,0,11).normalize(),right=new THREE.Vector3(back.z,0,-back.x);
const {actor,villager}=createActors({THREE,scene,camera,right,back,isReduced:()=>reduced});
const hero=actor(heroImage,'hero',2.55),cat=actor(catImage,'cat',1.22),villagers=stations.map((_,i)=>villager(npcImages[i],i));
let active=0,sfx=null,recorded=0,wasComplete=false,sideCount=-1;
let pos={...world.spawn},catPos={x:pos.x,z:pos.z-.9},trail=[{...pos}],path=[],near=false,last=0,elapsed=0,intro=0;
villagers.forEach((v,i)=>v.group.position.set(stations[i].x,0,stations[i].z));hero.group.position.set(pos.x,0,pos.z);cat.group.position.set(catPos.x,0,catPos.z);
const look=new THREE.Vector3(pos.x,1.1,pos.z),desired=new THREE.Vector3(),offset=new THREE.Vector3(2.15,3.9,9.4),ray=new THREE.Raycaster(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();camera.position.copy(look).add(offset);camera.lookAt(look);
const marker=new THREE.Mesh(new THREE.RingGeometry(.22,.28,32),new THREE.MeshBasicMaterial({color:'#f8d48b',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
function stop(){portalWalk=false;keys.clear();held.clear();path=[];document.querySelectorAll('.dpad button').forEach(b=>b.classList.remove('active'));}
const gate=createTimeGate(THREE,camera);scene.add(camera);
const portal=createExitPortal(THREE,scene,world);world.occluders.push(...portal.occluders);let departing=false,arrived=false,portalWalk=false;
function enterPortal(){if(!mission.state().complete||arrived||paused||gate.running())return;if(!portal.near(pos)){path=route(world,pos,portalStand);portalWalk=path.length>0;notice('대문 앞 시간문으로 걸어가요.');return;}portalWalk=false;family.cancel();side.cancel();stop();departing=true;gate.start(reduced,'1392년, 조선의 시작');sfx?.play('gate');$('#hud').hidden=true;}
function arrive(){board.hide();side.hide();arrived=true;$('#next-chapter').hidden=false;$('h1').textContent='1392년, 조선의 시작';canvas.setAttribute('aria-label','별하와 먹동이가 도착한 조선의 시작 마당');departing=false;worldNodes.forEach(n=>n.visible=false);villagers.forEach(v=>v.group.visible=false);portal.enter();world.bounds={...arrivalBounds};world.colliders=[];pos={...arrivalSpawn};catPos={x:pos.x-.6,z:pos.z+.7};trail=[{...pos}];stop();marker.visible=false;look.set(pos.x,1.4,pos.z-2.2);scene.background=new THREE.Color(0xc8d4ca);if(scene.fog)scene.fog.color.set(0xc8d4ca);notice('1392년, 조선의 시작에 도착했어요. 시간문 너머 제2장으로 이어갈 수 있어요.');}
const family=createFieldWorld({THREE,scene,camera,world,walk(end){path=route(world,pos,end);return path.length>0;},stop,question(i){mission.fieldQuestion(i);},notice});
let resumeRecords;
const board=createRecordBoard({THREE,scene,world,camera,walk(end){family.cancel();path=route(world,pos,end);return path.length>0;},stop,notice,onComplete(){sfx?.play('record');},onContinue(){resumeRecords?.();}});
// Optional chapter-1 village errands: lowest E priority after board and field, never a gate.
const side=createSidequests({THREE,scene,camera,world,walk(end){family.cancel();board.cancel();path=route(world,pos,end);return path.length>0;},stop,notice,onOpen(){family.cancel();board.cancel();},yieldTo:()=>family.isOpen()||$('#board-notes')?.hidden===false,search:location.search});
const mission=createMission({onRecords(next){family.cancel();resumeRecords=next;board.start();},onExplore(i){family.activate(i);},pause(){stop();paused=true;},resume(){paused=false;stop();},changed(p){$('#quest strong').textContent=p.complete?'첫 기록을 완성했어요!':`사람들의 이야기 ${p.done.length}/3`;if(p.done.length>recorded||(p.complete&&!wasComplete))sfx?.play('record');recorded=p.done.length;wasComplete=p.complete;},notice});
recorded=mission.state().done.length;wasComplete=mission.state().complete;
bindStart($('#start'),1,()=>{started=true;intro=0;gate.start(reduced);$('#welcome').hidden=true;$('#hud').hidden=false;mission.start();});
bindGameMenu({chapter:1,pause(){family.cancel();side.cancel();stop();paused=true;sfx?.hush();},resume(){stop();paused=false;},notice});
bindBackgroundAudio(1);
// Soft cues only at existing connection points: inspecting, a record completing, the time gate. No wrong-answer sound.
sfx=bindFeedbackSounds({search:location.search});
$('#motion').onclick=()=>{reduced=!reduced;$('#motion').setAttribute('aria-pressed',String(reduced));};
const keyMap={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{if(!started||paused||departing)return;if(keyMap[e.code]){e.preventDefault();keys.add(keyMap[e.code]);portalWalk=false;path=[];board.cancel();family.cancel();side.cancel();}if((e.code==='KeyE'||(e.code==='Enter'&&!e.target.closest('button')))&&!e.repeat){e.preventDefault();talk();}});addEventListener('keyup',e=>keys.delete(keyMap[e.code]));addEventListener('blur',()=>{family.cancel();side.cancel();stop();});document.addEventListener('visibilitychange',()=>{family.cancel();side.cancel();stop();last=0;});
for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused||departing)return;portalWalk=false;board.cancel();family.cancel();side.cancel();b.setPointerCapture(e.pointerId);held.add(b.dataset.dir);b.classList.add('active');path=[];});const release=()=>{held.delete(b.dataset.dir);b.classList.remove('active');};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);}
canvas.addEventListener('pointerdown',e=>{if(!started||paused||departing||e.button!==0)return;ray.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2),camera);portalWalk=false;if(board.pick(ray)){side.cancel();sfx?.play('inspect');return;}if(family.pick(ray)){side.cancel();sfx?.play('inspect');return;}if(side.pick(ray)){sfx?.play('inspect');return;}board.cancel();family.cancel();side.cancel();if(!ray.ray.intersectPlane(floor,hit))return;const end={x:hit.x,z:hit.z};path=route(world,pos,end);if(!path.length){notice('건물 사이의 열린 길을 눌러 주세요.');return;}marker.position.set(end.x,.13,end.z);marker.visible=true;});
function talk(){if(!started||paused||gate.running())return;if(!arrived&&mission.state().complete&&portal.near(pos)){enterPortal();return;}if(board.interact()){side.cancel();sfx?.play('inspect');return;}if(family.interact()){side.cancel();sfx?.play('inspect');return;}if(side.interact()){sfx?.play('inspect');return;}if(near&&!arrived){sfx?.play('inspect');mission.scene(active);}}
$('#talk').onclick=talk;
$('#find-next').onclick=()=>{if(paused||gate.running())return;if(arrived){mission.review();return;}if(mission.state().complete&&!arrived){enterPortal();return;}if(board.isActive()){board.guide();return;}family.cancel();side.cancel();const i=[0,1,2].find(n=>!mission.state().done.includes(n));if(i===undefined){mission.continue();return;}const q=stations[i];path=route(world,pos,{x:q.x,z:q.z+1.5});notice(path.length?'별하가 이야기 속으로 걸어가요.':'가까운 사람에게 이야기 버튼을 눌러 주세요.');};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;notice('화면 연결이 끊겼어요. 새로고침하면 다시 둘러볼 수 있어요.');});
function frame(now){requestAnimationFrame(frame);if(document.hidden){last=0;return;}const dt=Math.min(.035,last?(now-last)/1000:0);last=now;if(!paused)elapsed+=dt;const before={...pos};const wantsMove=started&&!paused&&!departing&&(keys.size||held.size||path.length);walkBlend=wantsMove?Math.min(1,walkBlend+dt/0.12):0;const walkSpeed=WALK_SPEED*walkBlend;if(started&&!paused&&!departing){let dx=Number(keys.has('right')||held.has('right'))-Number(keys.has('left')||held.has('left')),dy=Number(keys.has('down')||held.has('down'))-Number(keys.has('up')||held.has('up'));if(dx||dy){const n=Math.hypot(dx,dy);pos=move(world,pos,(right.x*dx+back.x*dy)/n*walkSpeed*dt,(right.z*dx+back.z*dy)/n*walkSpeed*dt);marker.visible=false;}else if(path.length){const q=path[0],d=Math.hypot(q.x-pos.x,q.z-pos.z);if(d<.09)path.shift();else{const step=Math.min(walkSpeed*dt,d);pos=move(world,pos,(q.x-pos.x)/d*step,(q.z-pos.z)/d*step);}if(!path.length){marker.visible=false;if(portalWalk){portalWalk=false;notice('시간문에 도착했어요. E키나 시간문 버튼으로 들어가요.');}}}
if(Math.hypot(pos.x-trail[trail.length-1].x,pos.z-trail[trail.length-1].z)>.09)trail.push({...pos});}
let catBefore={...catPos};if(!paused&&!departing&&trail.length>5){const q=trail[0],d=Math.hypot(q.x-catPos.x,q.z-catPos.z),step=Math.min(d,(4.8+Math.min(2.0,Math.hypot(pos.x-catPos.x,pos.z-catPos.z)*.45))*dt);if(d<.12)trail.shift();else catPos=move(world,catPos,(q.x-catPos.x)/d*step,(q.z-catPos.z)/d*step);}if(trail.length>150)trail.splice(0,trail.length-150);
hero.group.position.set(pos.x,0,pos.z);cat.group.position.set(catPos.x,0,catPos.z);const clueFocus=family.getFocus();if(clueFocus)hero.faceTowards(clueFocus.x-pos.x,clueFocus.z-pos.z);hero.update(pos.x-before.x,pos.z-before.z,elapsed);cat.update(catPos.x-catBefore.x,catPos.z-catBefore.z,elapsed);villagers.forEach((v,i)=>v.update(0,0,elapsed+i*.8));
active=stations.reduce((best,q,i)=>Math.hypot(pos.x-q.x,pos.z-q.z)<Math.hypot(pos.x-stations[best].x,pos.z-stations[best].z)?i:best,0);
const target=stations[active],d=Math.hypot(pos.x-target.x,pos.z-target.z);near=d<3;$('#talk').disabled=!near;$('#talk').textContent=near?`${scenes[active].name} · E`:'이야기가 있는 곳으로 가까이 가요';
const progress=mission.state();$('#find-next').textContent=progress.done.length===3?'모은 기록 펼치기':'다음 이야기로 걸어가기 →';const next=[0,1,2].find(i=>!progress.done.includes(i));$('#distance').textContent=progress.complete?`집중 점수 ${mission.score()} · 첫 기록 완성`:next===undefined?'세 기록을 모았어요 · 사람에게 다시 말을 걸어 이어가요':`다음 이야기: ${scenes[next].name}`;$('#quest strong').textContent=progress.complete?'새 나라가 필요한 까닭 · 완성':`사람들의 이야기 ${progress.done.length}/3 · ${mission.score()}점`;
const wasArriving=gate.running(),travel=gate.update(paused?0:dt,reduced);if(wasArriving&&!gate.running()){$('#hud').hidden=false;if(departing)arrive();else notice('고려 말 마을에 도착했어요. 피란길의 가족을 만나 보세요.');}
const focus=family.getFocus();desired.set(pos.x,1.4,pos.z-2.2);if(focus&&!paused)desired.lerp(focus,.45);look.lerp(desired,1-Math.exp(-5*dt));const phone=innerWidth<600?1.2:1;offset.x=2.15+Math.sin(look.z*.08)*.65;camera.position.copy(look).addScaledVector(offset,phone);if(!started)camera.position.addScaledVector(offset,.156);else if(travel>0){camera.position.add(new THREE.Vector3(1.5,2.5,6).multiplyScalar(travel));}camera.fov=50+travel*15;camera.updateProjectionMatrix();camera.lookAt(look);back.set(camera.position.x-look.x,0,camera.position.z-look.z).normalize();right.set(back.z,0,-back.x);
$('#npcTag').textContent=(progress.done.includes(active)?'✓ ':'')+scenes[active].name;
const label=new THREE.Vector3(stations[active].x,2.7,stations[active].z).project(camera);$('#npcTag').hidden=arrived||!started||label.z>1||Math.abs(label.x)>.95||Math.abs(label.y)>.9;const labelX=(label.x*.5+.5)*innerWidth,questBox=$('#quest').getBoundingClientRect();let labelY=(-label.y*.5+.5)*innerHeight;if(labelX<questBox.right+90&&labelY<questBox.bottom+55)labelY=questBox.bottom+65;if(labelY>innerHeight-170)$('#npcTag').hidden=true;$('#npcTag').style.left=labelX+'px';$('#npcTag').style.top=labelY+'px';
const obscured=new Set();
for(const actorPos of [new THREE.Vector3(pos.x,2,pos.z),new THREE.Vector3(pos.x-.5,1,pos.z),new THREE.Vector3(pos.x+.5,1,pos.z),new THREE.Vector3(catPos.x,.5,catPos.z)]){const delta=actorPos.clone().sub(camera.position);ray.set(camera.position,delta.clone().normalize());ray.far=delta.length();for(const h of ray.intersectObjects(world.occluders||[],false))obscured.add(h.object);}
for(const m of world.occluders||[]){const opacity=obscured.has(m)?.16:1;m.material.opacity+=(opacity-m.material.opacity)*Math.min(1,dt*12);m.material.depthWrite=m.material.opacity>.98;}
ray.far=Infinity;family.update(pos,started&&!paused&&!gate.running(),progress.done,elapsed,reduced);
board.update(pos,started&&!paused&&!gate.running()&&!arrived,dt,elapsed,reduced);
side.update(pos,started&&!paused&&!departing&&!gate.running()&&!arrived,dt,elapsed,reduced);
const action=board.actionLabel()||family.actionLabel()||side.actionLabel();if(action){$('#talk').disabled=false;$('#talk').textContent=action;}$('#hint').textContent=family.isActive()?'단서를 누르거나 가까이 가서 E키로 살펴봐요':'길을 누르면 별하가 걸어가요';
if(board.isActive()){$('#find-next').textContent=board.isDone()?'기록판에서 이어가기 →':board.carrying()?'기록판으로 걸어가기 →':'기록 조각으로 걸어가기 →';$('#distance').textContent=`세 사람의 기록판 · ${board.count()}/3`;$('#npcTag').hidden=true;}
portal.update(started&&progress.complete&&!arrived,elapsed,reduced);
if(progress.complete&&!arrived){$('#find-next').textContent='대문 앞 시간문으로 →';$('#distance').textContent='대문 앞에 시간문이 열렸어요';if(portal.near(pos)){$('#talk').disabled=false;$('#talk').textContent='1392년으로 시간여행 · E';}}
if(arrived){$('#quest strong').textContent='1392년 · 조선의 시작';$('#distance').textContent='첫 기록과 함께 다음 시간에 도착했어요';$('#find-next').textContent='완성한 기록 다시 보기';$('#talk').disabled=true;$('#talk').textContent='첫 미션 시범판을 마쳤어요';$('#hint').textContent='새 나라의 첫 아침을 둘러보세요';}
world.update(elapsed,reduced);renderer.render(scene,camera);
// Read-only QA data is also useful for diagnosing touch movement without changing game state.
canvas.dataset.position=JSON.stringify({hero:pos,cat:catPos,near,route:path.length});canvas.dataset.walking=JSON.stringify({hero:hero.group.userData,cat:cat.group.userData});canvas.dataset.exploration=JSON.stringify({clues:family.count(),active:family.isActive(),arriving:gate.running()});const sideState=side.state();if(sideState.done.length>sideCount){if(sideCount>=0)sfx?.play('record');sideCount=sideState.done.length;}canvas.dataset.sidequests=JSON.stringify(sideState);
if(renderer.info.render.frame%60===0)canvas.dataset.renderStats=JSON.stringify({drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles});}
requestAnimationFrame(frame);
}catch(error){console.error(error);$('#start').textContent='불러오기 실패 · 새로고침해 주세요';notice(error.message||'3D 화면을 시작하지 못했어요.');}


for(const a of document.querySelectorAll('[data-chapter],#next-chapter')){const q=new URLSearchParams(location.search);q.delete('chapter');const n=Number(a.dataset.chapter||2);if(n!==1)q.set('chapter',n);a.href=(n===1?'./':'chapter.html')+(q.size?'?'+q:'');}

