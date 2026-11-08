import * as T from './vendor/three.module.js';
import {worldAt,terrain,elevation,riverX,place} from './trail.mjs';
import {TRACKS,CAPTIONS,PHOTO_LIMIT,LEAF_SECONDS,createExploration,noteClue,linkAnimal,leafCourse,noteLeaf} from './lib/exploration.mjs';

export function createExplorer({world,canvas,enter,leave,running,animalAt,observe,getPeers,getS,onCapture=()=>{}}){
 const {scene,camera,renderer}=world,$=id=>document.getElementById(id);
 let records=createExploration(),active=null,stage='',animal=null,photos=[],selected=0,pending=null,busy=false,generation=0;
 let yaw=0,pitch=0,zoom=1,leafPan=204,travel=null,seq=0,drag=null,clueHint=false;
 const heldKeys=new Set(),basePos=new T.Vector3(),baseAim=new T.Vector3(),temp=new T.Vector3(),projected=new T.Vector3();let baseFov=45;
 const shell=document.createElement('section');shell.id='explorer';shell.hidden=true;shell.setAttribute('aria-label','숲 체험');
 shell.innerHTML=`<div id="exp-frame" aria-hidden="true"></div><button id="exp-target" aria-label="흔적 살펴보기"></button><section class="exp-card"><span class="eyebrow" id="exp-eyebrow">내가 발견하는 숲</span><h2 id="exp-title" tabindex="-1"></h2><p id="exp-help" role="status"></p><label id="exp-range-label">확대 <input id="exp-range" type="range" min="1" max="2.2" step=".1" value="1"></label><label id="exp-lane-label">띄울 자리 <select id="exp-lane"><option value="-1">왼쪽 물길</option><option value="0" selected>가운데 물길</option><option value="1">오른쪽 물길</option></select></label><div id="exp-review"><img id="exp-preview" alt="방금 찍은 숲 사진"><label>사진에 담을 마음 <select id="exp-caption"></select></label></div><div id="exp-album" role="group" aria-label="사진 선택"></div><div class="exp-actions"><button id="exp-main" type="button"></button><button id="exp-close" type="button">산책으로</button></div></section>`;
 document.body.append(shell);for(const text of CAPTIONS){const o=document.createElement('option');o.textContent=o.value=text;$('exp-caption').append(o);}
 const clues=new Map(),sphere=new T.SphereGeometry(1,10,7),twig=new T.CylinderGeometry(.012,.012,.7,7),mat=c=>new T.MeshStandardMaterial({color:c,roughness:.95});
 function part(g,geo,m,x,y,z,sx,sy,sz){const a=new T.Mesh(geo,m);a.position.set(x,y,z);a.scale.set(sx,sy,sz);a.castShadow=true;g.add(a);return a;}
 for(const [id,c] of Object.entries(TRACKS)){
   const g=new T.Group(),p=worldAt(c.s-1.8,c.offset);g.position.set(p.x,terrain(p.x,c.s-1.8)+.045,p.z);g.visible=false;scene.add(g);
   if(id==='bird'){
     const shape=new T.Shape();shape.moveTo(-.3,0);shape.bezierCurveTo(-.18,.12,.18,.14,.31,0);shape.bezierCurveTo(.15,-.11,-.18,-.10,-.3,0);
     const feather=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:'#d5ccb6',roughness:.95,side:T.DoubleSide}));feather.rotation.x=-Math.PI/2;feather.position.y=.026;g.add(feather);
     const stem=part(g,twig,mat('#a9936d'),0,.03,0,1,1,1);stem.rotation.z=Math.PI/2;
     const veins=[];for(let i=0;i<7;i++)for(const side of [-1,1]){const x=-.23+i*.065;veins.push(x,.033,0,x+.07,.033,side*.07*Math.sin((i+1)/8*Math.PI));}
     g.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(veins,3)),new T.LineBasicMaterial({color:'#9d8d70'})));
   }else{
     for(let i=0;i<15;i++){const a=i*2.4,r=.045+Math.sin(i*.6)*.018;part(g,sphere,mat(i%2?'#8e633e':'#b18a57'),Math.cos(a)*r,.045+(i%5)*.023,Math.sin(a)*r,.043,.036,.03);}
     for(let i=0;i<6;i++){const x=.22+(i%2)*.12,z=-.1-Math.floor(i/2)*.17;part(g,sphere,mat('#725a41'),x,.003,z,.036,.004,.05);for(let t=0;t<3;t++)part(g,sphere,mat('#725a41'),x+(t-1)*.028,.004,z-.05,.012,.004,.018);}
   }
   const ring=new T.Mesh(new T.RingGeometry(.38,.40,32),new T.MeshBasicMaterial({color:'#e7c878',side:T.DoubleSide,transparent:true,opacity:.65}));ring.rotation.x=-Math.PI/2;ring.position.y=.02;g.add(ring);clues.set(id,g);
 }
 const leaves=Array.from({length:5},(_,i)=>{const m=world.leaf.clone();m.material=world.leaf.material.clone();m.material.color.set(i?'#a6bf83':'#efbd53');m.scale.setScalar(i?.48:.60);m.visible=false;scene.add(m);return m;});
 const ownRing=new T.Mesh(new T.RingGeometry(.24,.265,28),new T.MeshBasicMaterial({color:'#fff0a6',side:T.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));ownRing.rotation.x=-Math.PI/2;ownRing.visible=false;scene.add(ownRing);
 function text(title,help,button){$('exp-title').textContent=title;$('exp-help').textContent=help;$('exp-main').textContent=button;}
 function controls(){
   $('exp-frame').hidden=active!=='photo'||stage==='review';$('exp-range-label').hidden=active!=='photo'||stage==='review';$('exp-lane-label').hidden=active!=='leaf';$('exp-review').hidden=stage!=='review';$('exp-album').hidden=active!=='album';$('exp-target').hidden=active!=='track';
   shell.dataset.kind=active||'';shell.dataset.stage=stage;document.body.dataset.exploring=active||'';
 }
 function open(kind,id){
   if(active)close();generation++;active=kind;animal=id||null;stage=kind==='track'?'clue':'ready';yaw=pitch=0;zoom=1;heldKeys.clear();baseFov=camera.fov;basePos.copy(camera.position);camera.getWorldDirection(temp);baseAim.copy(basePos).addScaledVector(temp,10);
   enter();shell.hidden=false;$('exp-main').disabled=false;clueHint=false;
   if(kind==='track'){const c=TRACKS[id],p=clues.get(id).position;basePos.set(p.x+.4,p.y+2.2,p.z+2.4);baseAim.copy(p);text(c.name+'의 주인은?','바닥의 흔적을 눌러 살펴봐요. 드래그·방향키로 둘러볼 수 있어요.','흔적 위치 찾기');}
   if(kind==='leaf'){leafPan=204;travel=null;seq++;$('exp-lane').disabled=false;text('나뭇잎 여행','출발 자리를 고른 뒤 띄워요. 잎은 물길을 따라 흘러가요.','잎 띄우기');}
   if(kind==='photo'){text('내가 담는 숲','드래그로 구도를 잡고 확대해 보세요. 밝은 테두리 안이 사진에 담겨요.','찰칵');$('exp-range').value='1';}
   if(kind==='album')renderAlbum();controls();update(0,0,true);$('exp-title').focus();
 }
 function close(){
   if(!active)return;generation++;active=null;stage='';travel=null;heldKeys.clear();drag=null;busy=false;for(const g of clues.values())g.visible=false;leaves[0].visible=ownRing.visible=false;
   if(pending){URL.revokeObjectURL(pending.url);pending=null;}shell.hidden=true;$('exp-target').hidden=true;document.body.dataset.exploring='';camera.fov=innerWidth<innerHeight?65:45;camera.updateProjectionMatrix();$('exp-main').disabled=false;leave();
 }
 function reset(){close();for(const p of photos)URL.revokeObjectURL(p.url);photos=[];selected=0;records=createExploration();seq++;}
 function pickTarget(){
   if(active!=='track'||!running())return;
   if(stage==='clue'){
     noteClue(records,animal);stage='search';const p=animalAt(animal).clone();basePos.set(p.x-1.2,p.y+1.7,p.z+4.6);baseAim.set(p.x-(innerWidth<innerHeight?.3:1.1),p.y-.2,p.z);yaw=pitch=0;
     text('누가 남긴 흔적일까요?',TRACKS[animal].hint,'동물 쪽 바라보기');controls();update(0,0,true);
   }else{const id=animal;close();observe(id);}
 }
 function frameContains(p){projected.copy(p).project(camera);return projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.85&&Math.abs(projected.y)<.75;}
 function capture(){
   if(busy)return;busy=true;$('exp-main').disabled=true;const ticket=generation;
   try{
   renderer.render(scene,camera);const r=$('exp-frame').getBoundingClientRect(),c=canvas.getBoundingClientRect(),image=document.createElement('canvas');image.width=960;image.height=720;
   image.getContext('2d').drawImage(canvas,(r.x-c.x)*canvas.width/c.width,(r.y-c.y)*canvas.height/c.height,r.width*canvas.width/c.width,r.height*canvas.height/c.height,0,0,960,720);
   image.toBlob(blob=>{if(ticket!==generation)return;busy=false;$('exp-main').disabled=false;if(!blob){$('exp-help').textContent='사진을 만들지 못했어요. 다시 눌러 주세요.';return;}
     onCapture();pending={url:URL.createObjectURL(blob),where:place(getS()),caption:CAPTIONS[0]};$('exp-preview').src=pending.url;$('exp-caption').value=CAPTIONS[0];stage='review';text('사진에 마음을 담아요','사진은 이 기기 안에만 보관돼요. 새 산책 전에 저장해 주세요.','수첩에 담기');controls();
   },'image/png');
   }catch{busy=false;$('exp-main').disabled=false;$('exp-help').textContent='사진을 만들지 못했어요. 다시 눌러 주세요.';}
 }
 function renderAlbum(){
   const host=$('exp-album');host.replaceChildren();selected=Math.max(0,Math.min(selected,photos.length-1));
   photos.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className='photo-card';b.setAttribute('aria-pressed',String(i===selected));const img=document.createElement('img');img.src=p.url;img.alt=p.where+' · '+p.caption;const span=document.createElement('span');span.textContent=p.where+' · '+p.caption;b.append(img,span);b.onclick=()=>{selected=i;renderAlbum();};host.append(b);});
   text('나의 사진 수첩 · '+photos.length+'장',photos.length?'사진을 고르면 이 기기에 저장할 수 있어요. 최대 6장, 새로 담으면 가장 오래된 사진부터 바뀌어요.':'산책 중 카메라 버튼(C)으로 풍경을 담아 보세요.','선택한 사진 저장');$('exp-main').disabled=!photos.length;
 }
 async function savePhoto(){
   const p=photos[selected];if(!p||busy)return;busy=true;$('exp-main').disabled=true;const ticket=generation;
   try{const img=new Image();img.src=p.url;await img.decode();if(ticket!==generation)return;
     const c=document.createElement('canvas');c.width=960;c.height=810;const ctx=c.getContext('2d');ctx.fillStyle='#f5f0df';ctx.fillRect(0,0,960,810);ctx.drawImage(img,0,0,960,720);ctx.fillStyle='#234c3d';ctx.font='600 26px SUIT, sans-serif';ctx.fillText(p.where+' · '+p.caption,28,775);
     c.toBlob(blob=>{if(!blob||ticket!==generation)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='숲-사진수첩-'+(selected+1)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);$('exp-help').textContent='사진과 마음 한 줄을 저장했어요.';},'image/png');
   }catch{$('exp-help').textContent='사진을 저장하지 못했어요. 다시 시도해 주세요.';}finally{if(ticket===generation){busy=false;$('exp-main').disabled=false;}}
 }
 $('exp-close').onclick=close;
 // Commit on contact so a moving animal cannot slide out from under a child's fingertip before release.
 $('exp-target').onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();pickTarget();};$('exp-target').onclick=e=>{if(e.detail===0)pickTarget();};
 $('exp-range').oninput=e=>zoom=Number(e.target.value);
 $('exp-main').onclick=()=>{
   if(!running())return;
   if(active==='track'){yaw=pitch=0;const p=stage==='clue'?clues.get(animal).position:animalAt(animal);baseAim.copy(p);clueHint=true;}
   if(active==='leaf'){
     if(!travel){seq++;travel={lane:Number($('exp-lane').value),elapsed:0,seq,recorded:false};$('exp-lane').disabled=true;text('금빛 테두리가 내 잎이에요','드래그·↑↓로 물길을 따라가요. 내가 띄운 잎을 따라 천천히 둘러봐요.','내 잎 찾기');}
     else if(travel.recorded){travel=null;leafPan=204;$('exp-lane').disabled=false;text('다른 물길도 볼까요?',records.leafRoutes.length+'가지 출발 자리에서 여행했어요. 순위는 없어요.','잎 띄우기');}
     else leafPan=leafCourse(travel.lane,travel.elapsed).s;
   }
   if(active==='photo'){
     if(stage==='review'&&pending){pending.caption=$('exp-caption').value;photos.push(pending);pending=null;if(photos.length>PHOTO_LIMIT)URL.revokeObjectURL(photos.shift().url);selected=photos.length-1;active='album';stage='ready';renderAlbum();controls();}
     else capture();
   }else if(active==='album')savePhoto();
 };
 canvas.addEventListener('pointerdown',e=>{if(!active||!running()||stage==='review'||active==='album'||e.button!==0)return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||!running())return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(active==='leaf')leafPan=Math.max(192,Math.min(205,leafPan+dy*.025));else{yaw=Math.max(-1.2,Math.min(1.2,yaw-dx*.004));pitch=Math.max(-.65,Math.min(.65,pitch+dy*.004));}drag.x=e.clientX;drag.y=e.clientY;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(drag?.id!==e.pointerId)return;drag=null;});
 window.addEventListener('keydown',e=>{if(!active||!running())return;if(e.code==='Escape'){e.preventDefault();close();return;}if(e.target.matches('select,input'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();heldKeys.add(e.code);}if(e.code==='Tab'){const bs=[...shell.querySelectorAll('button,input,select')].filter(b=>!b.disabled&&b.getClientRects().length);if(bs.length){const i=bs.indexOf(document.activeElement);e.preventDefault();bs[(i+(e.shiftKey?-1:1)+bs.length)%bs.length].focus();}}});
 window.addEventListener('keyup',e=>heldKeys.delete(e.code));window.addEventListener('blur',()=>{heldKeys.clear();drag=null;});
 function leafPlace(mesh,lane,age,offset=0){const c=leafCourse(lane,age);mesh.visible=true;mesh.position.set(riverX(c.s)+c.offset+offset,elevation(c.s)-.70,-c.s);mesh.rotation.set(0,.3+age*.3,0);return c;}
 function update(dt,time,reduced){
   const other=getPeers().slice(0,4);for(let i=1;i<5;i++){const p=other[i-1];leaves[i].visible=!!p&&Math.abs(getS()-210)<30;if(leaves[i].visible)leafPlace(leaves[i],p.lane,p.age,(i-2.5)*.38);}
   for(const [id,g] of clues)g.visible=active==='track'&&animal===id&&stage==='clue';
   if(!active||!running())return;
   if(active==='album'||stage==='review')return;
   const x=Number(heldKeys.has('ArrowRight'))-Number(heldKeys.has('ArrowLeft')),y=Number(heldKeys.has('ArrowDown'))-Number(heldKeys.has('ArrowUp'));
   if(active==='leaf')leafPan=Math.max(192,Math.min(205,leafPan-y*dt*3.5));else{yaw=Math.max(-1.2,Math.min(1.2,yaw-x*dt*.8));pitch=Math.max(-.65,Math.min(.65,pitch+y*dt*.6));}
   if(active==='leaf'){
     if(travel)travel.elapsed=Math.min(LEAF_SECONDS,travel.elapsed+dt);
     const c=leafPlace(leaves[0],travel?.lane??Number($('exp-lane').value),travel?.elapsed??0);world.leaf.visible=false;ownRing.visible=true;ownRing.position.copy(leaves[0].position);ownRing.position.y+=.012;
     basePos.set(riverX(leafPan)-.45,elevation(leafPan)+4.6,-leafPan+6.5);baseAim.set(riverX(leafPan),elevation(leafPan)-.7,-leafPan);camera.fov=innerWidth<innerHeight?60:48;camera.position.copy(basePos);camera.lookAt(baseAim);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
     if(travel&&travel.elapsed>=LEAF_SECONDS&&frameContains(leaves[0].position)&&!travel.recorded){noteLeaf(records,travel.lane,travel.elapsed,true);travel.recorded=true;text('물길 끝까지 따라왔어요',records.leafRoutes.length+'가지 출발 자리의 물길을 살펴봤어요. 다른 자리도 비교해 볼까요?','다른 자리에서 띄우기');}
   }else{
     camera.fov=active==='photo'?baseFov/zoom:48;camera.position.copy(basePos);temp.copy(baseAim).sub(basePos).applyEuler(new T.Euler(pitch,yaw,0,'YXZ'));camera.lookAt(temp.add(basePos));
   }
   camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
   if(active==='track'){
     const p=stage==='clue'?clues.get(animal).position:animalAt(animal);projected.copy(p).project(camera);const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;
     const visible=projected.z>-1&&projected.z<1&&x>30&&x<innerWidth-30&&y>65&&y<innerHeight-180;
     $('exp-target').hidden=!visible;$('exp-target').style.left=x+'px';$('exp-target').style.top=y+'px';$('exp-target').setAttribute('aria-label',stage==='clue'?TRACKS[animal].name+' 살펴보기':(animal==='bird'?'새':'다람쥐')+' 관찰하기');$('exp-target').classList.toggle('hinted',clueHint);
   }
 }
 return {open,close,reset,update,onAnimal:id=>linkAnimal(records,id),get active(){return active;},get focus(){return active==='track'&&stage==='search'?animal:null;},
   packet:()=>active==='leaf'&&travel?{lane:travel.lane,age:Math.floor(travel.elapsed),seq:travel.seq}:null,
   summary:()=>[...records.tracked.map(id=>TRACKS[id].name+'에서 동물 찾기'),...(records.leafRoutes.length?['나뭇잎 여행 · '+records.leafRoutes.length+'가지 물길']:[]),...(photos.length?['내가 찍은 숲 사진 · '+photos.length+'장']:[])],
   snapshot:()=>({active,stage,animal,...structuredClone(records),photos:photos.map(p=>({where:p.where,caption:p.caption})),travel:travel&&{...travel},leafPan,peerLeaves:leaves.slice(1).filter(l=>l.visible).length,target:!$('exp-target').hidden?{x:parseFloat($('exp-target').style.left),y:parseFloat($('exp-target').style.top)}:null})};
}
