import {bindBackgroundAudio,bindFeedbackSounds} from './game-audio.mjs';
import {bindGameMenu,bindStart} from './game-menu.mjs';
import {createSnowWalk} from './snow-walk.mjs';
import * as THREE from './vendor/three.module.min.js';
import {createChapterWorld} from './chapter-world.mjs';
import {chapters,createChapterLessons} from './chapter-lessons.mjs';
import {createPeople,stationRoles} from './people.mjs';
import {createActors} from './actors.mjs';
import {move,route} from './navigation.mjs';
import {createTimeGate} from './time-gate.mjs';
import {createPortalVisual} from './portal-visual.mjs';
import {bindRestart,safeStorage,readSoundSettings,saveSoundSettings} from './reset-progress.mjs';
import {createObservatoryEvent} from './observatory-event.mjs';
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search),chapter=[2,3,4,5,6,7,8].includes(Number(params.get('chapter')))?Number(params.get('chapter')):2;
const WALK_SPEED=3.08*1.2;
let walkBlend=0;
const data=chapters[chapter],canvas=$('#world'),keys=new Set(),held=new Set();
let started=false,paused=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,time=0,transition=false,pending=-1;
let statusTimer;function notice(text){$('#status').textContent=text;clearTimeout(statusTimer);statusTimer=setTimeout(()=>$('#status').textContent='',4200);}
function chapterURL(n){const q=new URLSearchParams(location.search);q.delete('chapter');if(n!==1)q.set('chapter',n);return (n===1?'./':'chapter.html')+(q.size?'?'+q:'');}
document.body.dataset.chapter=chapter;document.title=data.title+' · 조선 기록원정대';
$('h1').textContent=data.title;$('#era').textContent=data.era;$('#chapter-number').textContent=`제${chapter}장 · ${data.era}`;$('#chapter-title').textContent=data.title;
$('#chapter-intro').textContent=data.intro;
for(const a of document.querySelectorAll('[data-chapter]')){a.href=chapterURL(Number(a.dataset.chapter));if(Number(a.dataset.chapter)===chapter)a.setAttribute('aria-current','page');}
bindRestart($('#restart'),notice);
const loadImage=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('캐릭터 그림을 불러오지 못했어요.'));i.src=src;});
try{
 await document.fonts.load('24px "Gowun Batang"','기록 조선 농사 가족');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),world=createChapterWorld(THREE,scene,chapter),camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,300);
 const snowWalk=chapter===4?createSnowWalk(THREE,scene):null;
 if(snowWalk){addEventListener('pointerdown',snowWalk.unlock,{passive:true});addEventListener('keydown',snowWalk.unlock);addEventListener('pagehide',snowWalk.quiet);}
 let pos={...world.spawn},catPos={x:pos.x-.5,z:pos.z-.5},trail=[{...pos}],path=[];
 const back=new THREE.Vector3(2,0,9).normalize(),right=new THREE.Vector3(back.z,0,-back.x),look=new THREE.Vector3(pos.x,1.4,pos.z-2.2);
 const {actor}=createActors({THREE,scene,camera,right,back,isReduced:()=>reduced});
 // Load the dedicated performer alongside the existing painterly cast.
 const [heroImg,catImg,npcImg,kingImg,maskImg,farmerImg]=await Promise.all([loadImage('assets/hero-walk-v7.png'),loadImage('assets/cat-walk.webp'),loadImage('assets/people-v7.png'),loadImage('assets/sejong-v7.png'),loadImage('assets/mask-performer-v11.png'),loadImage('assets/rice-farmer-v11.png')]);
 const hero=actor(heroImg,'hero',2.55),cat=actor(catImg,'cat',1.22);
 const person=createPeople(THREE,scene,camera,npcImg,kingImg,()=>reduced,maskImg,farmerImg);
 // A cold, muted tint on wartime figures matches the hardship of chapter 4.
 const peopleTint=chapter===4?0xc9cfd0:undefined;
 // One host per activity: farmer, crop-record reader, researcher and performer match their tasks.
 const npcs=world.stations.map((s,i)=>{const n=person(stationRoles[chapter][i],2.25,0,peopleTint);n.group.position.set(s.x,0,s.z);return n;});
 for(const [i,p] of (world.npcExtras||[]).entries()){
   const student=p.role==='student',height=student?1.4:2.25;
   const n=person(p.role,height,i,peopleTint);n.group.position.set(p.x,p.ground||0,p.z);npcs.push(n);
 }
 let observatory=null,sfx=null;
 function stop(){observatory?.cancelPending();snowWalk?.quiet();portalWalk=false;keys.clear();held.clear();path=[];pending=-1;document.querySelectorAll('.dpad button').forEach(b=>b.classList.remove('active'));}
 const gate=createTimeGate(THREE,camera);scene.add(camera);
 const lessons=createChapterLessons({chapter,pause(){stop();paused=true;$('#prop-note').hidden=true;},resume(){paused=false;stop();},onComplete(state,saved=true){sfx?.play('record');notice(saved?'새로운 기록을 모았어요. 다음 장소를 살펴보세요.':'기록을 모았지만 저장을 사용할 수 없어요. 새로고침하면 이 기록은 사라져요.');},notice});
 const exit=world.exit,portal=new THREE.Group();portal.position.set(exit.x,1.8,exit.z);portal.visible=false;scene.add(portal);
 const portalVisual=createPortalVisual(THREE,portal);
 let wasReady=lessons.allComplete(),portalWalk=false;
 if(chapter===2)observatory=createObservatoryEvent({THREE,scene,world,camera,getPosition:()=>pos,canAct:()=>started&&!paused&&!transition&&!gate.running(),stop,go(target){stop();path=route(world,pos,target);if(!path.length)notice('열린 마당에서 조금 더 다가가 주세요.');return path.length>0;},onComplete(){lessons.open(1);}});
 function openMission(i){sfx?.play('inspect');if(i===1&&observatory&&!lessons.state().done.includes(1)&&observatory.start())return;lessons.open(i);}
 const portalTag=document.createElement('button');portalTag.className='portal-tag';portalTag.hidden=true;portalTag.onclick=visitPortal;document.body.append(portalTag);
 const tags=world.stations.map((s,i)=>{const b=document.createElement('button');b.className='station-tag';b.textContent=data.missions[i].title;b.hidden=true;b.onclick=()=>approach(i);document.body.append(b);return b;});
 const props=(world.inspectables||[]).map(p=>{const b=document.createElement('button');b.className='prop-tag';b.textContent='◇';b.setAttribute('aria-label',p.title+' 살펴보기');b.hidden=true;b.onclick=()=>{if(paused||gate.running())return;const d=Math.hypot(pos.x-p.x,pos.z-p.z);if(d>4){path=route(world,pos,p.stand||{x:p.x,z:p.z+1.5});pending=-1;portalWalk=false;notice('소품 가까이 다가가 살펴봐요.');return;}sfx?.play('inspect');$('#prop-note strong').textContent=p.title;$('#prop-note p').textContent=p.text;$('#prop-note').hidden=false;stop();};document.body.append(b);return {p,b};});
 $('#prop-note button').onclick=()=>$('#prop-note').hidden=true;
 function approach(i){if(!started||paused||gate.running())return;observatory?.cancelPending();portalWalk=false;$('#prop-note').hidden=true;const s=world.stations[i];if(Math.hypot(pos.x-s.x,pos.z-s.z)<3){openMission(i);return;}path=route(world,pos,{x:s.x,z:s.z+1.5});pending=path.length?i:-1;notice(path.length?'별하가 기록이 있는 곳으로 걸어가요.':'열린 길에서 조금 더 다가가 주세요.');}
 function nearest(){let result=-1,dist=3;world.stations.forEach((s,i)=>{const d=Math.hypot(s.x-pos.x,s.z-pos.z);if(d<dist){dist=d;result=i;}});return result;}
 function portalNear(){return Math.hypot(pos.x-exit.x,pos.z-exit.z)<2.5;}
 function visitPortal(){
  if(!started||paused||gate.running())return;
  if(!portalNear()){
   path=route(world,pos,exit);pending=-1;portalWalk=path.length>0;
   notice(portalWalk?'시간문 앞까지 걸어가요.':'길이 이어지는 중앙 마당에서 다시 눌러 주세요.');return;
  }
  if(lessons.allComplete()){enterPortal();return;}
  const s=lessons.state();notice('시간문 준비 · 미션 '+s.done.length+'/4 · 여행의 기억 '+s.reviewDone.length+'/3. 모두 완성하면 문이 깨어나요.');
 }
 function enterPortal(){
  if(!lessons.allComplete()||paused||gate.running())return;
  if(!portalNear()){visitPortal();return;}
  portalWalk=false;stop();transition=true;$('#hud').hidden=true;gate.start(reduced,chapter===8?'시간여행의 끝 · 내가 모은 기록':chapters[chapter+1].era+' · '+chapters[chapter+1].title);sfx?.play('gate');
 }
 function talk(){if(!started||paused||gate.running())return;if(!$('#prop-note').hidden){$('#prop-note').hidden=true;return;}if(observatory?.active()){observatory.interact();return;}if(portalNear()){visitPortal();return;}const i=nearest();if(i>=0)openMission(i);}
 $('#talk').onclick=talk;
 $('#find-next').onclick=()=>{if(paused||gate.running())return;if(observatory?.active()){observatory.guide();return;}const s=lessons.state(),i=[0,1,2,3].find(n=>!s.done.includes(n));if(i!==undefined)approach(i);else if(!lessons.allComplete())lessons.review();else enterPortal();};
 bindStart($('#start'),chapter,()=>{started=true;$('#welcome').hidden=true;$('#hud').hidden=false;gate.start(reduced,data.era+' · '+data.title);});
 bindGameMenu({chapter,pause(){stop();paused=true;sfx?.hush();},resume(){stop();paused=false;},notice});
 bindBackgroundAudio(chapter);
 // Soft cues only at existing connection points: inspecting, a record completing, the time gate. No wrong-answer sound.
 sfx=bindFeedbackSounds({search:location.search});
 if(snowWalk){
  // The snow preference is remembered in the sound key only; records and scores are untouched.
  if(readSoundSettings(safeStorage(),location.search).steps===false&&!snowWalk.isMuted())snowWalk.toggle();
  const sound=document.createElement('button');sound.id='snow-sound';
  const label=()=>{const muted=snowWalk.isMuted();sound.textContent='눈 밟는 소리 · '+(!snowWalk.supported()?'이 브라우저에서 사용 불가':muted?'꺼짐':'켜짐');sound.setAttribute('aria-pressed',String(!muted));};
  label();sound.disabled=!snowWalk.supported();
  sound.onclick=()=>{const muted=snowWalk.toggle();label();saveSoundSettings(safeStorage(),location.search,{steps:!muted});};
  document.querySelector('#game-menu .menu-settings').append(sound);
 }
 $('#motion').setAttribute('aria-pressed',String(reduced));$('#motion').onclick=()=>{reduced=!reduced;$('#motion').setAttribute('aria-pressed',String(reduced));};
 const keyMap={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
 addEventListener('keydown',e=>{if(!started||paused||transition)return;if(keyMap[e.code]){e.preventDefault();keys.add(keyMap[e.code]);observatory?.cancelPending();path=[];pending=-1;$('#prop-note').hidden=true;}if(e.code==='KeyE'&&!e.repeat){e.preventDefault();talk();}});
 addEventListener('keyup',e=>keys.delete(keyMap[e.code]));addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{stop();last=0;});
 for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{if(!started||paused||transition)return;e.preventDefault();b.setPointerCapture(e.pointerId);held.add(b.dataset.dir);observatory?.cancelPending();b.classList.add('active');path=[];pending=-1;$('#prop-note').hidden=true;});const end=()=>{held.delete(b.dataset.dir);b.classList.remove('active');};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end);}
 const ray=new THREE.Raycaster(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
 canvas.addEventListener('pointerdown',e=>{if(!started||paused||transition||e.button!==0)return;ray.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2),camera);if(observatory?.hit(ray))return;observatory?.cancelPending();if(ray.ray.intersectPlane(floor,hit)){path=route(world,pos,{x:hit.x,z:hit.z});pending=-1;portalWalk=false;$('#prop-note').hidden=true;if(!path.length)notice('열린 마당이나 길을 눌러 주세요.');}});
 function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;notice('화면 연결이 끊겼어요. 새로고침하면 저장된 기록에서 이어집니다.');});
 function frame(now){
  requestAnimationFrame(frame);if(document.hidden){last=0;return;}const dt=Math.min(.035,last?(now-last)/1000:0);last=now;if(!paused)time+=dt;
  const before={...pos},catBefore={...catPos};const wantsMove=started&&!paused&&!transition&&(keys.size||held.size||path.length);walkBlend=wantsMove?Math.min(1,walkBlend+dt/0.12):0;const walkSpeed=WALK_SPEED*walkBlend;
  if(started&&!paused&&!transition){
   const x=Number(keys.has('right')||held.has('right'))-Number(keys.has('left')||held.has('left')),z=Number(keys.has('down')||held.has('down'))-Number(keys.has('up')||held.has('up'));
   if(x||z){const n=Math.hypot(x,z);pos=move(world,pos,(right.x*x+back.x*z)/n*walkSpeed*dt,(right.z*x+back.z*z)/n*walkSpeed*dt);}
   else if(path.length){const q=path[0],d=Math.hypot(q.x-pos.x,q.z-pos.z);if(d<.09)path.shift();else{const step=Math.min(d,walkSpeed*dt);pos=move(world,pos,(q.x-pos.x)/d*step,(q.z-pos.z)/d*step);}}
   if(pending>=0&&!path.length){const i=pending;pending=-1;if(Math.hypot(pos.x-world.stations[i].x,pos.z-world.stations[i].z)<3)openMission(i);}
   if(portalWalk&&!path.length){portalWalk=false;if(portalNear())notice(lessons.allComplete()?'시간문에 도착했어요. E키나 빛나는 시간문 이름표를 눌러 들어가요.':'아직 잠든 시간문이에요. 미션과 여행의 기억을 완성하면 열려요.');}
   if(Math.hypot(pos.x-trail.at(-1).x,pos.z-trail.at(-1).z)>.09)trail.push({...pos});
  }
  if(!paused&&!transition&&trail.length>5){const q=trail[0],d=Math.hypot(q.x-catPos.x,q.z-catPos.z);if(d<.12)trail.shift();else{const step=Math.min(d,(4.8+Math.min(2.0,Math.hypot(pos.x-catPos.x,pos.z-catPos.z)*.45))*dt);catPos=move(world,catPos,(q.x-catPos.x)/d*step,(q.z-catPos.z)/d*step);}}if(trail.length>150)trail.splice(0,trail.length-150);
  hero.group.position.set(pos.x,0,pos.z);cat.group.position.set(catPos.x,0,catPos.z);hero.update(pos.x-before.x,pos.z-before.z,time);cat.update(catPos.x-catBefore.x,catPos.z-catBefore.z,time);npcs.forEach(n=>n.update(0,0,time));
  snowWalk?.update(before,pos,catBefore,catPos,started&&!paused&&!transition);
  const was=gate.running(),travel=gate.update(paused?0:dt,reduced);if(was&&!gate.running()){if(transition){if(chapter===8){transition=false;$('#hud').hidden=false;lessons.review();}else{location.href=chapterURL(chapter+1);return;}}else{$('#hud').hidden=false;notice('네 곳의 기록을 살펴보세요. 사람을 누르면 길을 찾아 걸어가요.');}}
  look.lerp(new THREE.Vector3(pos.x,1.4,pos.z-2.2),1-Math.exp(-5*dt));camera.position.copy(look).add(new THREE.Vector3(2.15+Math.sin(pos.z*.06)*.5,4.1,9.7).multiplyScalar(innerWidth<600?1.2:1));if(travel)camera.position.add(new THREE.Vector3(1.5,2.5,6).multiplyScalar(travel));camera.fov=50+travel*15;camera.updateProjectionMatrix();camera.lookAt(look);back.set(camera.position.x-look.x,0,camera.position.z-look.z).normalize();right.set(back.z,0,-back.x);
  const state=lessons.state(),near=nearest(),ready=lessons.allComplete(),next=[0,1,2,3].find(i=>!state.done.includes(i));$('#progress').textContent=`기록 ${state.done.length}/4 · ${state.score}점`;$('#distance').textContent=ready?'이 시간의 모든 기록을 모았어요':next===undefined?'여행의 기억으로 배운 내용을 이어 봐요':data.missions[next].title;
  $('#find-next').textContent=ready?(chapter<8?'다음 시간문으로 →':'귀환 시간문으로 →'):next===undefined?'여행의 기억 3문제 →':'다음 기록으로 걸어가기 →';
  $('#talk').disabled=near<0&&!portalNear()&&!observatory?.near();$('#talk').textContent=portalNear()?(ready?(chapter<8?'다음 시대로 시간여행 · E':'귀환하여 기록 펼치기 · E'):'잠든 시간문 살펴보기 · E'):near>=0?data.missions[near].title+' · E':'이야기가 있는 곳에 다가가요';
  if(observatory?.active()){$('#find-next').textContent='관측 도구로 걸어가기 →';$('#talk').disabled=!observatory.near()||!observatory.actionText();$('#talk').textContent=observatory.actionText()?observatory.actionText()+' · E':'관측 마당의 변화를 살펴봐요';}
  const questRect=$('#quest').getBoundingClientRect(),placed=[];tags.forEach((b,i)=>{const title=(state.done.includes(i)?'✓ ':'')+data.missions[i].title;if(b.textContent!==title)b.textContent=title;const s=world.stations[i],v=new THREE.Vector3(s.x,s.tagY??4,s.z).project(camera);b.hidden=!started||paused||gate.running()||observatory?.active()||v.z>1||Math.abs(v.x)>1.1;if(b.hidden)return;const half=Math.min(innerWidth/2-12,b.offsetWidth/2||110);let x=Math.max(half+12,Math.min(innerWidth-half-12,(v.x*.5+.5)*innerWidth)),y=Math.max(110,Math.min(innerHeight-170,(-v.y*.5+.5)*innerHeight));if(x-half<questRect.right+12&&y<questRect.bottom+60)y=questRect.bottom+60;for(const o of placed)if(Math.abs(o.x-x)<o.half+half+8&&Math.abs(o.y-y)<54)y=o.y+54;if(y>innerHeight-170){b.hidden=true;return;}placed.push({x,y,half});b.style.left=Math.round(x)+'px';b.style.top=Math.round(y)+'px';b.classList.toggle('nearby',i===near);b.classList.toggle('done',state.done.includes(i));});
  props.forEach(({p,b})=>{const v=new THREE.Vector3(p.x,1.2,p.z).project(camera);b.hidden=!started||paused||gate.running()||observatory?.active()||Math.hypot(pos.x-p.x,pos.z-p.z)>5||Math.abs(v.x)>.9||Math.abs(v.y)>.7||v.z>1;b.style.left=(v.x*.5+.5)*innerWidth+'px';b.style.top=(-v.y*.5+.5)*innerHeight+'px';});
  portal.visible=started;if(portal.visible)portalVisual.update(time,reduced,ready);
  if(ready&&!wasReady){notice('모든 기록이 모여 시간문이 깨어났어요! 시간문 이름표를 누르면 길을 찾아가요.');}wasReady=ready;
  const pv=new THREE.Vector3(exit.x,5.25,exit.z).project(camera);
  portalTag.hidden=!started||paused||gate.running()||observatory?.active();
  if(!portalTag.hidden){
   const outside=pv.z>1||Math.abs(pv.x)>.84||Math.abs(pv.y)>.7;
   portalTag.classList.toggle('offscreen',outside);portalTag.classList.toggle('opened',ready);
   portalTag.textContent=(outside?'◇ ':'')+(ready?(chapter===8?'귀환 시간문 · 기록 펼치기':'열린 시간문 · 다음 시대'):'잠든 시간문')+(outside?' · 길 찾기':'');
   const half=portalTag.offsetWidth/2;
   const x=outside?innerWidth-half-14:Math.max(half+12,Math.min(innerWidth-half-12,(pv.x*.5+.5)*innerWidth));
   let y=outside?Math.min(innerHeight-178,Math.max(145,questRect.bottom+66)):Math.max(125,Math.min(innerHeight-178,(-pv.y*.5+.5)*innerHeight));
   for(const o of placed)if(Math.abs(o.x-x)<o.half+half+8&&Math.abs(o.y-y)<54)y=o.y+54;
   y=Math.min(innerHeight-178,y);

   portalTag.style.left=Math.round(x)+'px';portalTag.style.top=Math.round(y)+'px';
   const pr=portalTag.getBoundingClientRect();for(const b of tags){if(b.hidden)continue;const r=b.getBoundingClientRect();if(r.left<pr.right+8&&r.right>pr.left-8&&r.top<pr.bottom+8&&r.bottom>pr.top-8)b.hidden=true;}
  }
  const hidden=new Set();for(const p of [hero.group.position.clone().add(new THREE.Vector3(0,1.5,0)),cat.group.position.clone().add(new THREE.Vector3(0,.5,0))]){const d=p.clone().sub(camera.position);ray.set(camera.position,d.clone().normalize());ray.far=d.length();for(const h of ray.intersectObjects(world.occluders||[],false))hidden.add(h.object);}for(const m of world.occluders||[]){if(!m.material||Array.isArray(m.material))continue;m.material.opacity+=((hidden.has(m)?.16:1)-m.material.opacity)*Math.min(1,dt*12);m.material.depthWrite=m.material.opacity>.98;}ray.far=Infinity;
  world.update(time,reduced);observatory?.update(dt,started&&!paused&&!transition&&!gate.running(),reduced);if(observatory)canvas.dataset.observatory=JSON.stringify(observatory.state());renderer.render(scene,camera);canvas.dataset.position=JSON.stringify({hero:pos,cat:catPos,route:path.length});canvas.dataset.progress=JSON.stringify(state);
 }
 requestAnimationFrame(frame);
}catch(error){console.error(error);$('#start').textContent='불러오기 실패 · 새로고침해 주세요';notice(error.message);}


