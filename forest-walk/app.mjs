import * as T from './vendor/three.module.js';
import {createWorld,createChild} from './world.mjs?v=layered5';
import {advance,worldAt,pathSlope,elevation,grade,terrain,riverX,place,nearby,LENGTH,clamp} from './trail.mjs?v=layered5';
import {ForestSound} from './sound.mjs';
const $=id=>document.getElementById(id),canvas=$('forest');
await document.fonts.load('600 16px SUIT');
let world;try{world=await createWorld(canvas);}catch(e){$('intro').hidden=true;$('error').hidden=false;throw e;}
const {scene,renderer,camera,panorama}=world,hero=createChild(scene),guide=createChild(scene,'#bba366',true);
const friends=[createChild(scene,'#ca8c7c',false,1),createChild(scene,'#82afbd',false,2),createChild(scene,'#ad9fbe',false,3)];
const sound=new ForestSound(),keys=new Set(),touch=new Set();let state={x:0,y:0},mode='intro',time=0,last=performance.now(),idle=0,traveled=0,reached=false,lastPlace='',noteUntil=8,pulse=null,pauseFrom='playing';
const motionQuery=matchMedia('(prefers-reduced-motion:reduce)');let reduced=motionQuery.matches;motionQuery.addEventListener('change',e=>reduced=e.matches);
const camPos=new T.Vector3(),look=new T.Vector3(),desired=new T.Vector3();
function modeTo(next){mode=next;document.body.dataset.mode=next;for(const id of ['intro','paused','rest','finish'])$(id).hidden=true;if(next==='intro')$('intro').hidden=false;if(next==='paused')$('paused').hidden=false;if(next==='rest')$('rest').hidden=false;if(next==='finished')$('finish').hidden=false;$('journey').hidden=next==='intro';clearInput();}
function clearInput(){keys.clear();touch.clear();pulse=null;document.querySelectorAll('#pad button').forEach(b=>b.classList.remove('active'));}
function focusGame(){canvas.focus({preventScroll:true});}
function announce(text,seconds=6){$('note').textContent=text;noteUntil=time+seconds;}
async function audioStart(){try{await sound.start();}catch{sound.enabled=false;updateSound();announce('소리를 켜려면 오른쪽 위 소리 버튼을 눌러 주세요.');}}
function updateSound(){$('sound').textContent=sound.enabled?'소리 켜짐':'소리 꺼짐';$('sound').setAttribute('aria-pressed',String(sound.enabled));$('sound').setAttribute('aria-label',sound.enabled?'자연 소리 끄기':'자연 소리 켜기');}
function reset(){state={x:0,y:0};idle=0;traveled=0;reached=false;time=0;lastPlace='';sound.nextBird=4;sound.lastStep=0;modeTo('playing');position(true);announce('노란 배낭이 나예요. 위쪽 방향키로 걸어 볼까요?',9);audioStart();focusGame();}
$('start').disabled=false;$('start').textContent='산길 오르기';$('start').onclick=reset;
$('sound').onclick=async()=>{try{await sound.toggle();updateSound();}catch{announce('브라우저에서 소리를 허용한 뒤 다시 눌러 주세요.');}if(mode==='paused')sound.pause();else if(mode==='playing')focusGame();};
function pause(){if(mode==='intro'||mode==='paused')return;pauseFrom=mode;modeTo('paused');sound.pause();$('resume').focus();}
function resume(){modeTo(pauseFrom);last=performance.now();audioStart();if(pauseFrom==='rest')$('leave-rest').focus();else if(pauseFrom==='finished')$('stay').focus();else focusGame();}
$('pause').onclick=()=>mode==='paused'?resume():pause();$('resume').onclick=resume;$('restart').onclick=reset;$('again').onclick=reset;
$('stay').onclick=()=>{modeTo('playing');announce('바람을 느끼며 더 머물러도 좋아요.',6);focusGame();};
function interact(){const spot=nearby(state.y);if(mode!=='playing'||!spot)return;if(state.y>190&&reached){modeTo('finished');$('stay').focus();return;}modeTo('rest');$('rest-title').textContent=spot.name;$('rest-text').textContent=spot.text;if(spot.s===24)sound.chirp();$('leave-rest').focus();}
$('action').onclick=interact;$('leave-rest').onclick=()=>{modeTo('playing');focusGame();};
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'){e.preventDefault();if(mode==='paused')resume();else if(mode==='rest'){$('leave-rest').click();}else pause();return;}
  if(mode!=='playing'||e.target.matches('input,textarea'))return;
  if(e.target.closest('button')&&(e.code==='Space'||e.code==='Enter'))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyE','Space'].includes(e.code)){e.preventDefault();if((e.code==='KeyE'||e.code==='Space')&&!e.repeat)interact();else keys.add(e.code);}
});window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{clearInput();if(mode!=='intro'&&mode!=='paused')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();sound.pause();}});
for(const b of document.querySelectorAll('#pad button')){b.onpointerdown=e=>{if(mode!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.dir);b.classList.add('active');};const release=()=>{touch.delete(b.dataset.dir);b.classList.remove('active');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;b.onclick=e=>{if(e.detail===0&&mode==='playing')pulse={dir:b.dataset.dir,until:time+.22};};}
canvas.addEventListener('pointerdown',focusGame);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();$('error').hidden=false;$('error-text').textContent='3D 화면 연결이 끊어졌어요. 다시 열면 처음부터 시작해요.';});
function input(){const has=(dir,...codes)=>touch.has(dir)||(pulse?.dir===dir&&time<pulse.until)||codes.some(c=>keys.has(c));return {x:Number(has('right','ArrowRight','KeyD'))-Number(has('left','ArrowLeft','KeyA')),y:Number(has('up','ArrowUp','KeyW'))-Number(has('down','ArrowDown','KeyS'))};}
function position(snap=false,dt=.016,moving=false){
  const p=worldAt(state.y,state.x),slope=pathSlope(state.y),angle=Math.atan2(slope,-1);hero.root.position.set(p.x,p.y,p.z);
  const wildlife=mode==='rest'&&nearby(state.y)?.s===136;
  const waterRest=mode==='rest'&&[62,91].includes(nearby(state.y)?.s);
  const dir=input();let yaw=wildlife?angle+Math.atan2(Math.sin(Math.atan2(world.squirrel.position.x-p.x,world.squirrel.position.z-p.z)-angle),Math.cos(Math.atan2(world.squirrel.position.x-p.x,world.squirrel.position.z-p.z)-angle))*.52:waterRest?Math.atan2(riverX(state.y-2)-p.x,2):angle;if(moving){const dx=dir.x+slope*dir.y,dz=-dir.y;yaw=Math.atan2(dx,dz);}
  hero.root.rotation.y+=Math.atan2(Math.sin(yaw-hero.root.rotation.y),Math.cos(yaw-hero.root.rotation.y))*(snap?1:1-Math.exp(-dt*12));hero.pose(traveled,moving,time,mode==='rest',reduced,grade(state.y)*-Math.cos(hero.root.rotation.y),wildlife?'observe':'look');
  const teacherS=state.y<75?74:state.y<101?88:202,g=worldAt(teacherS,state.y<101?-2.15:-2.75);guide.root.position.set(g.x,g.y,g.z);guide.root.rotation.y=Math.PI*.72;guide.pose(0,false,time,true,reduced,0,state.y>=75&&state.y<101?'guide':'look');
  for(let i=0;i<friends.length;i++){
    const opening=T.MathUtils.smoothstep(state.y,185,199),fs=Math.min(202+i*.6,state.y+4.5+i*2.3);
    const offset=(i-1)*.90+Math.sin(fs*.12+i*2)*.18+opening*(i-1)*.45,f=worldAt(fs,offset);
    friends[i].root.position.set(f.x,f.y,f.z);friends[i].root.rotation.y=wildlife&&i===0?Math.PI*.55:Math.atan2(pathSlope(fs),-1)+(opening*(i-1)*.20);
    friends[i].pose(traveled+i*.7,moving,time,!moving,reduced,grade(fs)/Math.hypot(1,pathSlope(fs)),wildlife&&i===0?'look':i===0?'bag':'look');
  }
  const creekView=clamp((state.y-36)/12,0,1)*(1-clamp((state.y-64)/16,0,1));
  const ahead=worldAt(Math.min(207,state.y+5+creekView*2.5),0),back=worldAt(state.y-5.4+creekView*.30,state.x*.2);
  desired.set(back.x+(camera.aspect<1?.25:.55)-creekView*2.3,p.y+2.55-creekView*.15,back.z);
  const target=new T.Vector3(p.x+(ahead.x-p.x)*(.45+creekView*.30)+(camera.aspect<1?0:.15+creekView*.65),p.y+1.5-creekView*.12+Math.min(.65,(ahead.y-p.y)*.25),ahead.z);
  const creekShelf=T.MathUtils.smoothstep(state.y,75,82)*(1-T.MathUtils.smoothstep(state.y,98,105));
  desired.x-=creekShelf*.35;target.x-=creekShelf*.65;
  const shore=[62,91].includes(nearby(state.y)?.s)?Math.sign(riverX(state.y-2)-p.x)||1:1;
  if(mode==='rest'){desired.set(p.x+shore*2,p.y+3.8,p.z+7.5);target.set(p.x+shore*1.4,p.y+.8,p.z-1.5);}
  if(mode==='rest'&&camera.aspect<1){const backWide=worldAt(state.y-10,shore*1.4);desired.set(backWide.x,p.y+5.2,backWide.z);target.set(p.x+shore*2,p.y+1,p.z-1);}
  if(wildlife){
    const animal=world.squirrel.position,gap=Math.hypot(animal.x-p.x,animal.z-p.z);
    target.set((p.x+animal.x)/2,p.y+.65,(p.z+animal.z)/2);
    desired.set(target.x-.85,p.y+(camera.aspect<1?3.8:2.8),target.z+Math.max(camera.aspect<1?9:5.5,gap+3));
  }
  desired.y=Math.max(desired.y,terrain(desired.x,-desired.z)+1.2);
  if(state.y>188&&mode!=='rest'){const opening=clamp((state.y-188)/10,0,1),summitBack=worldAt(state.y-6.5,state.x*.2),summitAhead=worldAt(state.y+6);desired.lerp(new T.Vector3(summitBack.x,p.y+3.25,summitBack.z),opening);target.lerp(new T.Vector3(summitAhead.x,p.y+.8,summitAhead.z),opening);}
  const blend=snap||reduced?1:1-Math.exp(-dt*4);camPos.lerp(desired,blend);look.lerp(target,blend);camera.position.copy(camPos);camera.lookAt(look);
}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?65:45;camera.updateProjectionMatrix();const ratio=(panorama.image.width/panorama.image.height)/camera.aspect;panorama.repeat.set(Math.min(1,1/ratio),Math.min(1,ratio));panorama.offset.set((1-panorama.repeat.x)/2,(1-panorama.repeat.y)/2);}window.addEventListener('resize',resize);resize();position(true);
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
  let moving=false;if(mode!=='paused'&&mode!=='intro'){time+=dt;if(mode==='playing'){const before=state;state=advance(state,input(),dt);moving=state.moving;const oldPos=worldAt(before.y,before.x),newPos=worldAt(state.y,state.x);traveled+=Math.hypot(newPos.x-oldPos.x,newPos.z-oldPos.z);}idle=moving?0:idle+dt;
    const current=place(state.y);if(current!==lastPlace){lastPlace=current;$('place').textContent=current;if(current==='다람쥐 산허리')announce('갈색 꼬리가 보여요. 조용히 멈춰 볼까요?',5);}
    $('distance').textContent='정상까지 '+Math.max(0,Math.round(LENGTH-state.y))+' m';$('height').textContent='↑ '+Math.round(elevation(state.y)-elevation(0))+' m 올라왔어요';$('progress').style.width=(state.y/LENGTH*100)+'%';
    const spot=nearby(state.y);$('action').hidden=!spot||mode!=='playing';if(spot)$('action').innerHTML=spot.name+' <kbd>E</kbd>';
    if(time>noteUntil)$('note').textContent='';
    if(state.y>199.8&&!reached){reached=true;announce('바람봉 정상이에요. 우리 발로 36m 높이까지 올라왔어요.',12);modeTo('finished');$('stay').focus();}
    sound.tick(time,state.y,moving);
  }
  if(mode!=='paused'){world.update(time,state.y,idle,reduced);position(false,dt,moving);}renderer.render(scene,camera);
}requestAnimationFrame(frame);








