import {scenes} from './story.mjs';
import {walkable,route} from './navigation.mjs';
import {withinReach,footprintDistance,chooseApproach,REACH} from './proximity.mjs';
// w/d: footprint of the actual prop/collider so any walkable front or side position counts.
export const fieldTargets=[[
 {x:-7,z:10.2,y:1.25,w:1.9,d:2.2,stand:{x:-5.2,z:10.8}},
 {x:-8.7,z:13.1,y:1.65,w:2.2,d:2,stand:{x:-6.4,z:14.2}}
],[
 {x:4.1,z:-6.5,y:.7,w:.9,d:.9,stand:{x:4.1,z:-4.9}},
 {x:6.85,z:-8.7,y:1.3,w:1.4,d:1.96,stand:{x:4.9,z:-9.5}}
],[
 {x:-5.4,z:-22,y:1.1,w:1.6,d:1,stand:{x:-3.4,z:-22.3}},
 {x:-3.2,z:-20,y:2.2,w:1,d:1,stand:{x:-2,z:-18.7}}
]];
const labels=[['꾸린 짐','망루의 흔적'],['거의 빈 바구니','실려 가는 곡식'],['쌓인 재물','걱정하는 사람']];
// Context art for the field-note panel only (learning reconstructions, copied in by the parent).
export const fieldArt=[['bundles','ruin'],['farmer','cart'],['wealth','witness']],introArt=['bundles','farmer','witness'];
export const artSrc=name=>`assets/field-v18/${name}.png`;
// The clues are physical props; HTML labels only enlarge their touch targets.
export function createFieldWorld({THREE,scene,camera,world,walk,stop,question,notice}){
 const observed=scenes.map(()=>new Set()),buttons=[],hits=[],rings=[],targets=fieldTargets.flat();
 let active=-1,pending=-1,pendingAt=null,focus=null,canUse=false,current={x:0,z:15};
 const panel=document.createElement('dialog');panel.id='field-notes';panel.hidden=true;panel.setAttribute('aria-labelledby','field-title');panel.setAttribute('tabindex','-1');
 panel.innerHTML=`<span class="eyebrow">사람들의 이야기 · 현장 조사</span><strong id="field-title">짐과 망루의 흔적을 살펴봐요</strong><figure id="field-figure" hidden><img id="field-image" alt="" decoding="async"><figcaption>학습을 위한 재구성 그림</figcaption></figure><p id="field-text" aria-live="polite"></p><div><button id="field-dismiss">계속 둘러보기</button><button id="field-question" hidden>두 단서로 까닭 생각하기 →</button></div>`;
 document.body.append(panel);
 const text=panel.querySelector('#field-text'),title=panel.querySelector('#field-title'),answer=panel.querySelector('#field-question');
 const figure=panel.querySelector('#field-figure'),img=panel.querySelector('#field-image');
 img.onerror=()=>{figure.hidden=true;};img.onload=()=>{figure.hidden=false;};
 function showArt(name,alt){figure.hidden=true;img.alt=alt;const src=artSrc(name);if(img.getAttribute('src')===src){figure.hidden=!(img.complete&&img.naturalWidth>0);return;}img.src=src;}
 function hidePanel(){if(panel.open)panel.close();panel.hidden=true;focus=null;}
 function showPanel(){stop();panel.hidden=false;panel.inert=false;if(!panel.open)panel.showModal();panel.scrollTop=0;panel.focus();}
 // Native modal focus prevents the world from receiving movement or E while a clue is read.
 panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='KeyE')e.preventDefault();});
 panel.addEventListener('cancel',e=>{e.preventDefault();hidePanel();});
 panel.addEventListener('close',()=>{if(!panel.open){panel.hidden=true;focus=null;}});
 panel.querySelector('#field-dismiss').onclick=hidePanel;
 answer.onclick=()=>{if(active<0||observed[active].size!==2)return;hidePanel();question(active);};
 const wood=world.clueMaterials.wood.clone();wood.color.set(0x807465);
 const ruin=new THREE.Group();ruin.position.set(-8.7,0,13.1);scene.add(ruin);
 function beam(x,y,z,w,h,d,rz=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);m.position.set(x,y,z);m.rotation.z=rz;m.castShadow=true;ruin.add(m);}
 // A small damaged lookout beside the broken fence; not a restored historical site.
 beam(-.55,1.2,0,.18,2.4,.18,-.16);beam(.5,.7,.25,.18,1.4,.18,.24);
 beam(0,.38,0,1.7,.13,1.1,.17);beam(.1,.1,.8,2,.13,.2,.3);
 for(let i=0;i<4;i++)beam(-.55+i*.35,.62,.35,.14,.06,1.6,.15);
 beam(-.65,.7,-.45,.1,1.4,.1,-.3);
 const cloth=new THREE.Mesh(new THREE.PlaneGeometry(.48,.6),new THREE.MeshStandardMaterial({color:0x78755d,side:THREE.DoubleSide,roughness:1}));cloth.position.set(-.45,1.15,-.45);cloth.rotation.z=-.2;ruin.add(cloth);
 world.colliders.push({x:-8.7,z:13.1,w:1.8,d:1.8});
 // Bundles on the existing cart make the first target legible from the walking route.
 for(let i=0;i<3;i++){
  const material=world.clueMaterials.cloth.clone();material.color.set([0x918064,0x6d796d,0x9a8276][i]);
  const b=new THREE.Mesh(new THREE.SphereGeometry(.35,20,12),material);b.scale.set(1,.7,.8);b.position.set(-7+(i-1)*.38,.95+(i===1?.3:0),10.2);b.castShadow=true;scene.add(b);
  for(const side of [-1,1]){const knot=new THREE.Mesh(new THREE.SphereGeometry(.11,10,6),material);knot.scale.set(1.2,.5,.65);knot.rotation.z=side*.5;knot.position.copy(b.position).add(new THREE.Vector3(side*.065,.29,0));scene.add(knot);}
  const tie=new THREE.Mesh(new THREE.TorusGeometry(.3,.012,5,30),wood);tie.position.copy(b.position);tie.scale.y=.78;scene.add(tie);
 }
 // A nearly empty basket contrasts with tied sacks on the outgoing cart.
 const basketMaterial=world.clueMaterials.cloth.clone();basketMaterial.color.set(0xa58a56);
 const basket=new THREE.Mesh(new THREE.LatheGeometry([[.04,0],[.31,.03],[.45,.48],[.41,.48],[.28,.09],[.04,.09]].map(p=>new THREE.Vector2(...p)),24),basketMaterial);
 basket.position.set(4.1,0,-6.5);basket.castShadow=true;scene.add(basket);
 for(let i=0;i<5;i++){const rim=new THREE.Mesh(new THREE.TorusGeometry(.32+i*.028,.014,5,32),wood);rim.rotation.x=Math.PI/2;rim.position.set(4.1,.08+i*.09,-6.5);scene.add(rim);}
 for(let i=0;i<9;i++){const grain=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),new THREE.MeshStandardMaterial({color:0xc9ac6d,roughness:1}));grain.scale.set(1,.6,1.8);grain.position.set(4.1+Math.cos(i*2.4)*.12,.12,-6.5+Math.sin(i*2.4)*.13);scene.add(grain);}
 world.colliders.push({x:4.1,z:-6.5,w:.9,d:.9});
 for(let i=0;i<3;i++){
  const mat=world.clueMaterials.cloth.clone();mat.color.set([0xa99a7b,0x9a896c,0xbbb090][i]);
  const sack=new THREE.Mesh(new THREE.SphereGeometry(.35,16,12),mat);sack.scale.set(.85,1.4,.85);sack.position.set(6.85+(i-1)*.36,1.15,-8.7+(i%2)*.18);sack.castShadow=true;scene.add(sack);
  const tie=new THREE.Mesh(new THREE.TorusGeometry(.1,.02,5,20),wood);tie.rotation.x=Math.PI/2;tie.position.copy(sack.position).add(new THREE.Vector3(0,.43,0));scene.add(tie);
 }
 // Stored cloth and a serving bowl illustrate the testimony, not proof by wealth alone.
 const table=new THREE.Mesh(new THREE.BoxGeometry(.9,.45,.6),wood);table.position.set(-5.45,.23,-22.6);table.castShadow=true;scene.add(table);
 for(let i=0;i<3;i++){const mat=world.clueMaterials.cloth.clone();mat.color.set([0x747c70,0x99846a,0x8c6e60][i]);const roll=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.6,12),mat);roll.rotation.z=Math.PI/2;roll.position.set(-5.45,.55+i*.12,-22.6);scene.add(roll);}
 const bowl=new THREE.Mesh(new THREE.LatheGeometry([[.05,0],[.17,.05],[.22,.2],[.19,.2],[.12,.06]].map(p=>new THREE.Vector2(...p)),20),new THREE.MeshStandardMaterial({color:0x9c8050,metalness:.3,roughness:.55,side:THREE.DoubleSide}));
 bowl.position.set(-5.05,.5,-22.35);scene.add(bowl);
 targets.forEach((p,i)=>{
  const hit=new THREE.Mesh(new THREE.BoxGeometry(i===0?1.9:2.1,2,1.5),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));hit.position.set(p.x,1,p.z);hit.userData.clue=i;scene.add(hit);hits.push(hit);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.55,40),new THREE.MeshBasicMaterial({color:0xeacb83,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.16,p.z);ring.visible=false;scene.add(ring);rings.push(ring);
  const b=document.createElement('button');b.className='world-clue';b.hidden=true;b.setAttribute('aria-label',`현장 단서 ${i%2+1}: ${scenes[Math.floor(i/2)].clues[i%2].name}`);b.onclick=()=>inspect(i);document.body.append(b);buttons.push(b);
 });
 // Nearest clue by footprint distance: front, sides and corners all count (shared with sidequests).
 function nearest(){
  if(active<0||!canUse)return -1;
  let best=-1,distance=REACH;
  fieldTargets[active].forEach((p,i)=>{const d=footprintDistance(current,p);if(d<=distance&&withinReach(current,p,REACH,world)){distance=d;best=active*2+i;}});
  return best;
 }
 function inspect(i,arrived=false){
  if(active<0||!canUse||Math.floor(i/2)!==active)return;
  const p=targets[i],s=scenes[active],seen=observed[active],k=i%2;
  hidePanel();
  if(!withinReach(current,p,REACH,world)){
   const go=chooseApproach(world,current,p,{walkable,route});
   if(!go||!walk(go)){pending=-1;pendingAt=null;notice('단서 옆의 열린 길로 조금 더 다가가 주세요.');}
   else{pending=i;pendingAt=go;notice('단서 가까이 걸어가서 살펴봐요.');}
   return;
  }
  pending=-1;pendingAt=null;stop();seen.add(k);focus=new THREE.Vector3(p.x,.8,p.z);
  title.textContent=`${s.clues[k].name} · ${seen.size}/2`;
  showArt(fieldArt[active][k],`${s.clues[k].name} — 학습용 재구성 그림`);
  text.textContent=s.clues[k].text+' “'+s.voice+'”'+(active===2?' 모든 승려나 불교 전체가 같았다는 뜻은 아니에요.':'');
  answer.hidden=seen.size!==2;showPanel();
 }
 return{
  activate(i=0){active=i;pending=-1;pendingAt=null;focus=null;title.textContent=`${scenes[i].name} · 단서 ${observed[i].size}/2`;showArt(introArt[i],`${scenes[i].name} 장면을 학습용으로 재구성한 그림`);text.textContent=`“${scenes[i].voice}” 두 단서를 누르거나, 가까이 가서 E키로 살펴보세요.`;answer.hidden=observed[i].size!==2;showPanel();},
  pick(ray){if(active<0||!canUse)return false;const h=ray.intersectObjects(hits.slice(active*2,active*2+2),false)[0];if(!h)return false;inspect(h.object.userData.clue);return true;},
  interact(){if(panel.open)return true;if(active<0||!canUse)return false;const i=nearest();if(i<0)return false;inspect(i);return true;},
  actionLabel(){if(active<0||!canUse)return '';if(panel.open)return '단서창의 버튼을 눌러 계속해요';const i=nearest();return i<0?'':`${labels[active][i%2]} 살펴보기 · E`;},
  cancel(){pending=-1;pendingAt=null;hidePanel();},
  getFocus:()=>focus,
  count:()=>active<0?0:observed[active].size,
  isActive:()=>active>=0,
  isOpen:()=>panel.open,
  update(pos,enabled,done,time,reduced){
   current=pos;canUse=enabled&&active>=0&&!done.includes(active);
   if(active>=0&&done.includes(active)){active=-1;hidePanel();pending=-1;pendingAt=null;}
   document.body.classList.toggle('investigating',active>=0&&canUse);
   if(pending>=0&&pendingAt&&canUse&&Math.hypot(pos.x-pendingAt.x,pos.z-pendingAt.z)<.3)inspect(pending,true);
   const placed=[];
   targets.forEach((p,i)=>{
    const same=Math.floor(i/2)===active,seen=observed[Math.floor(i/2)],v=new THREE.Vector3(p.x,p.y+.35,p.z).project(camera),visible=same&&canUse&&v.z<1;
    const x=Math.max(70,Math.min(innerWidth-70,(v.x*.5+.5)*innerWidth));let y=Math.max(115,Math.min(innerHeight-190,(-v.y*.5+.5)*innerHeight));
    if(same){for(const other of placed)if(Math.abs(x-other.x)<140&&Math.abs(y-other.y)<54)y=other.y+58<innerHeight-190?other.y+58:other.y-58;placed.push({x,y});}
    buttons[i].hidden=!visible;buttons[i].style.left=x+'px';buttons[i].style.top=y+'px';
    buttons[i].classList.toggle('nearby',same&&nearest()===i);buttons[i].classList.toggle('observed',seen.has(i%2));
    buttons[i].textContent=`${v.x<-.85?'← ':v.x>.85?'→ ':''}${seen.has(i%2)?'✓':'＋'} ${labels[Math.floor(i/2)][i%2]}`;
    rings[i].visible=same&&canUse;rings[i].material.opacity=seen.has(i%2)?.22:reduced?.6:.55+Math.sin(time*2)*.12;
   });
   panel.inert=false;
  }
 };
}

