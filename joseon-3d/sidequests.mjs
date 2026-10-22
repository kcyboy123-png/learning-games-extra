import {walkable,route} from './navigation.mjs';
import {withinReach,chooseApproach} from './proximity.mjs';
import {sidequestKey} from './reset-progress.mjs';
// Three optional '마을 부탁' for chapter 1 only. They are fictional classroom reconstructions
// (not recorded incidents), give no points, and never gate the mission, board or portal.
// Progress is stored in its own key; the main save objects are never touched.
export const SIDEQUEST_IDS=['pack','meal','notice'];
export const sidequests=[
 {id:'pack',name:'피란길 보따리',need:2,spots:[{x:-1,z:14},{x:-1.8,z:10.4},{x:-3.4,z:14.6},{x:1.8,z:12.2}],
  ask:'피란을 떠나는 이웃의 보따리에 넣을 것을 함께 골라 줘요. 꼭 필요한 두 가지를 골라요.',
  choices:[{id:'food',label:'먹을거리 보따리',ok:true},{id:'water',label:'물 담는 그릇',ok:true},{id:'vase',label:'무거운 장식 항아리',ok:false,miss:'장식 항아리는 무거워서 피란길에 짐이 돼요. 먹을거리와 물처럼 꼭 필요한 것을 먼저 골라요.'}],
  done:'먹을거리와 물그릇을 작은 짐으로 꾸리고 천 가림막 표시를 세웠어요. 외적의 잦은 침입은 사람들의 평범한 일상과 안전을 흔들었어요. 이 보따리는 기록된 사건이 아니라 학습을 위해 상상한 도움이에요.'},
 {id:'meal',name:'남겨진 한 끼',need:1,spots:[{x:4.4,z:-12},{x:7.8,z:-11.4},{x:.9,z:-9.6},{x:5.2,z:-3.4}],
  ask:'거의 빈 바구니와 가득 실린 수레를 견주어 봐요. 농부의 말과 맞는 쪽은 어느 것일까요?',
  choices:[{id:'taken',label:'권력을 앞세워 가져간 곡식',ok:true},{id:'traded',label:'서로 약속하고 바꾼 곡식',ok:false,miss:'농부의 말을 다시 떠올려요. “힘 있는 사람들이 권력을 앞세워 거둔 곡식을 가져가요.” 서로 약속하고 바꾼 거래와는 달라요.'}],
  done:'이야기 속 농부의 증언과 맞는 쪽을 골랐어요. 작은 한 끼 바구니는 학습용 창작 장면이에요. 한 끼를 나눈다고 권력으로 곡식을 빼앗던 문제가 풀리는 것은 아니에요. 근거는 농부가 들려준 이야기예요.'},
 {id:'notice',name:'말을 정확히 전해요',need:1,spots:[{x:0,z:-23},{x:-1,z:-24.2},{x:1.4,z:-18},{x:-7.4,z:-18.4}],
  ask:'절 앞에서 들은 말을 알림판에 옮겨요. 들은 그대로 정확한 쪽을 골라요.',
  choices:[{id:'some',label:'일부 승려의 사치와 부패를 비판했어요',ok:true},{id:'all',label:'모든 승려가 백성을 괴롭혔어요',ok:false,miss:'들은 말을 넓혀 말하면 사실과 달라져요. 이야기 속 사람은 일부 승려의 사치와 부패를 비판했어요.'}],
  done:'말을 정확하게 전했어요. 부패를 비판하고 변화를 바라는 사람들이 있었지만, 모두가 같은 생각을 했거나 고려를 무너뜨리자고 한 것은 아니에요. 이 알림판은 학습용 창작이에요.'}
];
const valid=ids=>[...new Set((Array.isArray(ids)?ids:[]).filter(id=>SIDEQUEST_IDS.includes(id)))];
export function readSidequests(storage,search=''){try{return valid(JSON.parse(storage.getItem(sidequestKey(search))||'[]'));}catch{return [];}}
export function saveSidequests(storage,search='',ids=[]){try{storage.setItem(sidequestKey(search),JSON.stringify(valid(ids)));return true;}catch{return false;}}
// First candidate that is walkable and reachable from spawn; keeps clear of the record board lane.
export function pickSpot(world,q){return q.spots.find(p=>walkable(world,p.x,p.z)&&!world.colliders.some(c=>Math.abs(p.x-c.x)<1.65+c.w/2&&Math.abs(p.z-c.z)<1.65+c.d/2)&&Math.hypot(p.x-2.9,p.z-.8)>3&&route(world,world.spawn,p).length)||q.spots[0];}
export function createSidequests({THREE,scene,camera,world,walk,stop,notice,onOpen,yieldTo,storage,search=''}){
 // Even touching the localStorage getter can throw (SecurityError when storage is blocked); fall back to memory-only.
 let store=storage||null;if(!store){try{store=typeof localStorage!=='undefined'?localStorage:null;}catch{store=null;}}
 const done=new Set(store?readSidequests(store,search):[]);
 const wood=world.clueMaterials.wood,cloth=c=>{const m=world.clueMaterials.cloth.clone();m.color.set(c);return m;};
 const text=(label,w,h,bg='#ede0bc',fg='#3e463b')=>{const c=document.createElement('canvas');c.width=Math.round(w*256);c.height=Math.round(h*256);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font=`${Math.floor(Math.min(c.height*.6,(c.width-16)/Math.max(1,label.length)*1.05))}px "Gowun Batang","Noto Serif KR",serif`;g.fillText(label,c.width/2,c.height/2);const t=new THREE.CanvasTexture(c);if(THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,toneMapped:false,side:THREE.DoubleSide}));};
 const mesh=(geo,m,x,y,z,parent)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;};
 const hitBox=(w,h,d,x,y,z,parent,data)=>{const o=mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}),x,y,z,parent);o.castShadow=false;Object.assign(o.userData,data);return o;};
 const stations=sidequests.map((q,i)=>{
  const spot=pickSpot(world,q),g=new THREE.Group();g.position.set(spot.x,0,spot.z);scene.add(g);
  mesh(new THREE.BoxGeometry(.12,1.5,.12),wood,0,.75,0,g);const sign=text(q.name,.95,.22,'#e9d9b4');sign.position.set(0,1.42,.07);g.add(sign);
  const ring=mesh(new THREE.RingGeometry(.45,.5,36),new THREE.MeshBasicMaterial({color:0xbfd4a6,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),0,.15,0,g);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
  const hit=hitBox(1.1,2,1.1,0,1,0,g,{station:i});
  const s={q,spot,g,ring,hit,foot:{x:spot.x,z:spot.z,w:2.6,d:2.6,stand:spot},choices:[],movers:[],reveal:[],flips:[]};
  const choice=(k,obj,x,z)=>{obj.position.set(x,0,z);g.add(obj);const h=hitBox(.9,1.4,.9,x,.7,z,g,{station:i,choice:k});s.choices.push({...q.choices[k],obj,hit:h,home:new THREE.Vector3(x,0,z)});};
  if(q.id==='pack'){
   const food=new THREE.Group();const b=mesh(new THREE.SphereGeometry(.3,16,10),cloth(0x9a8a62),0,.26,0,food);b.scale.set(1,.75,.85);mesh(new THREE.TorusGeometry(.26,.012,5,24),wood,0,.26,0,food).scale.y=.8;
   const water=new THREE.Group();mesh(new THREE.LatheGeometry([[.05,0],[.2,.05],[.24,.35],[.16,.44],[.18,.5]].map(p=>new THREE.Vector2(...p)),18),new THREE.MeshStandardMaterial({color:0x7d6e5a,roughness:.8,side:THREE.DoubleSide}),0,0,0,water);
   const vase=new THREE.Group();mesh(new THREE.CylinderGeometry(.22,.3,.9,16),new THREE.MeshStandardMaterial({color:0x6c5a70,roughness:.6}),0,.45,0,vase);mesh(new THREE.TorusGeometry(.27,.03,6,24),new THREE.MeshStandardMaterial({color:0xb79a5a,metalness:.3,roughness:.5}),0,.6,0,vase).rotation.x=Math.PI/2;
   choice(0,food,-1,.5);choice(1,water,1,.5);choice(2,vase,0,-1);
   const pack=mesh(new THREE.BoxGeometry(.7,.3,.45),cloth(0x7f7458),0,.15,1.15,g);pack.visible=false;
   const shelter=new THREE.Group();shelter.position.set(-1.2,0,1.2);g.add(shelter);mesh(new THREE.BoxGeometry(.06,1.1,.06),wood,0,.55,0,shelter);const flag=mesh(new THREE.PlaneGeometry(.7,.5),new THREE.MeshStandardMaterial({color:0xcbbf9a,side:THREE.DoubleSide,roughness:1}),.35,.85,0,shelter);flag.rotation.y=.3;shelter.visible=false;
   s.reveal.push(pack,shelter);s.movers.push({obj:food,to:new THREE.Vector3(-.17,.3,1.15),scale:.75},{obj:water,to:new THREE.Vector3(.2,.3,1.15),scale:.7});
  }else if(q.id==='meal'){
   const basket=mesh(new THREE.LatheGeometry([[.04,0],[.25,.03],[.34,.36],[.3,.36],[.22,.08]].map(p=>new THREE.Vector2(...p)),18),cloth(0xa58a56),-1,0,-.5,g);basket.material.side=THREE.DoubleSide;
   for(let k=0;k<3;k++){const grain=mesh(new THREE.SphereGeometry(.03,6,4),new THREE.MeshStandardMaterial({color:0xc9ac6d,roughness:1}),-1+Math.cos(k*2.1)*.08,.08,-.5+Math.sin(k*2.1)*.08,g);grain.castShadow=false;}
   mesh(new THREE.BoxGeometry(.8,.08,1.1),wood,1,.36,-.5,g);for(const dx of [-.42,.42])mesh(new THREE.CylinderGeometry(.3,.3,.06,12),wood,1+dx,.3,-.4,g).rotation.z=Math.PI/2;
   for(let k=0;k<3;k++){const sack=mesh(new THREE.SphereGeometry(.2,12,8),cloth([0xa99a7b,0x9a896c,0xbbb090][k]),1+(k-1)*.24,.55,-.5+(k%2)*.14,g);sack.scale.set(.85,1.3,.85);}
   q.choices.forEach((c,k)=>{const slip=new THREE.Group();mesh(new THREE.BoxGeometry(.06,.7,.06),wood,0,.35,0,slip);const t=text(c.label,.9,.2,'#f1e6c8');t.position.set(0,.82,.03);slip.add(t);choice(k,slip,k?.8:-.8,.9);});
   const meal=new THREE.Group();meal.position.set(-.5,0,-.1);g.add(meal);mesh(new THREE.LatheGeometry([[.03,0],[.14,.03],[.18,.14],[.15,.14],[.1,.05]].map(p=>new THREE.Vector2(...p)),16),cloth(0xb79a66),0,0,0,meal).material.side=THREE.DoubleSide;
   for(let k=0;k<4;k++){const grain=mesh(new THREE.SphereGeometry(.025,6,4),new THREE.MeshStandardMaterial({color:0xd8c48a,roughness:1}),Math.cos(k*1.6)*.05,.1,Math.sin(k*1.6)*.05,meal);grain.castShadow=false;}
   meal.visible=false;s.reveal.push(meal);
  }else{
   q.choices.forEach((c,k)=>{const token=new THREE.Group();mesh(new THREE.BoxGeometry(.08,1.2,.08),wood,0,.6,0,token);const face=new THREE.Group();face.position.y=1.25;token.add(face);
    const front=text(c.label,1,.24,c.ok?'#e6dcc0':'#e9d6c6');front.position.z=.05;face.add(front);const back=text(c.ok?'✓ 정확히 전한 말':'다시 생각해 봐요',1,.24,c.ok?'#cfdcc2':'#e6c9b8');back.position.z=-.05;back.rotation.y=Math.PI;face.add(back);
    choice(k,token,k?.85:-.85,.6);s.flips.push({face,target:0});});
  }
  return s;
 });
 // Success scene: props move onto the pack, hidden rewards appear, choice hit boxes retire, notice tokens flip to the exact wording.
 // instant=true snaps everything (used when restoring completed IDs from storage) so revisits look finished, not reset.
 function settle(s,instant=false){for(const m of s.movers){m.active=true;if(instant){m.obj.position.copy(m.to);m.obj.scale.setScalar(m.scale);}}
  for(const o of s.reveal)o.visible=true;for(const c of s.choices)c.hit.visible=false;
  s.flips.forEach((f,j)=>{f.target=s.choices[j].ok?Math.PI:0;if(instant)f.face.rotation.y=f.target;});}
 for(const s of stations)if(done.has(s.q.id))settle(s,true);
 const panel=document.createElement('section');panel.id='task-notes';panel.className='event-panel';panel.hidden=true;
 panel.innerHTML=`<span class="eyebrow">마을 부탁 · 학습용 창작 활동</span><strong id="task-title"></strong><p id="task-text" aria-live="polite"></p><div class="choice-row" id="task-choices"></div><small>기록된 사건이 아니라 학습을 위해 상상한 장면이에요. 점수와 관계없고 건너뛰어도 돼요.</small><div><button id="task-walk" hidden>부탁 자리로 걸어가기</button><button id="task-dismiss" class="quiet">계속 둘러보기</button></div>`;
 document.body.append(panel);
 const $=s=>panel.querySelector(s),title=$('#task-title'),body=$('#task-text'),choiceBox=$('#task-choices'),walkBtn=$('#task-walk');
 const quest=document.querySelector('#quest'),tasksBtn=document.createElement('button'),list=document.createElement('div');
 tasksBtn.id='village-tasks';tasksBtn.type='button';tasksBtn.setAttribute('aria-expanded','false');tasksBtn.setAttribute('aria-controls','village-list');
 list.id='village-list';list.hidden=true;list.setAttribute('role','list');
 const listButtons=sidequests.map((q,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','listitem');b.onclick=()=>{list.hidden=true;tasksBtn.setAttribute('aria-expanded','false');if(!canUse)return;tapStation(i);};list.append(b);return b;});
 quest?.append(tasksBtn,list);
 tasksBtn.onclick=()=>{list.hidden=!list.hidden;tasksBtn.setAttribute('aria-expanded',String(!list.hidden));};
 const labels=sidequests.map((q,i)=>{const b=document.createElement('button');b.className='world-clue event-ui task-label';b.hidden=true;b.onclick=()=>tapStation(i);document.body.append(b);return b;});
 const choiceLabels=stations.flatMap((s,i)=>s.choices.map((c,k)=>{const b=document.createElement('button');b.className='world-clue event-ui task-label';b.hidden=true;b.onclick=()=>choose(i,k);document.body.append(b);return b;}));
 let open=-1,pending=-1,pendingAt=null,picked=new Set(),canUse=false,current={x:0,z:15},flash=-1;
 const isDone=i=>done.has(sidequests[i].id),near=i=>withinReach(current,stations[i].foot,undefined,world),nearStation=()=>stations.findIndex((s,i)=>near(i));
 function persist(){if(store&&!saveSidequests(store,search,[...done]))notice('부탁 기록을 저장하지 못했어요. 이번 둘러보기에서는 계속 완료로 보여요.');}
 function say(t,txt){title.textContent=t;body.textContent=txt;}
 function renderChoices(){const s=stations[open];choiceBox.innerHTML='';if(open<0||isDone(open))return;
  s.choices.forEach((c,k)=>{const b=document.createElement('button');b.type='button';b.textContent=c.label;b.setAttribute('aria-pressed',String(picked.has(k)));if(flash===k)b.classList.add('wrong');b.onclick=()=>choose(open,k);choiceBox.append(b);});}
 function show(i){open=i;flash=-1;picked=new Set();const q=sidequests[i];onOpen?.();
  if(isDone(i))say(`${q.name} · 완료`,q.done);else say(q.name,q.ask+' 자리 옆의 물건이나 이름표를 눌러 골라요.');
  renderChoices();walkBtn.hidden=true;panel.hidden=false;}
 function close(){open=-1;flash=-1;picked=new Set();panel.hidden=true;}
 function approach(i){const go=chooseApproach(world,current,stations[i].foot,{walkable,route});
  if(!go||!walk(go)){pending=-1;pendingAt=null;notice('부탁 자리 옆의 열린 길로 다가가 주세요.');return false;}
  pending=i;pendingAt=go;notice(`'${sidequests[i].name}' 자리로 걸어가요.`);return true;}
 function tapStation(i,arrived=false){if(!canUse)return;if(!near(i)){close();approach(i);return;}pending=-1;pendingAt=null;stop();show(i);}
 function complete(i){const s=stations[i];done.add(s.q.id);persist();settle(s);
  say(`${s.q.name} · 완료`,s.q.done);renderChoices();}
 function choose(i,k){if(!canUse||open!==i||isDone(i))return;
  if(!near(i)){approach(i);return;}
  const s=stations[i],c=s.choices[k],q=s.q;flash=-1;
  if(s.flips.length){s.flips.forEach((f,j)=>f.target=j===k?Math.PI:0);}
  if(!c.ok){flash=k;picked.delete(k);say('조금 더 생각해 봐요 · 감점은 없어요',c.miss);renderChoices();return;}
  if(picked.has(k))picked.delete(k);else picked.add(k);
  if(picked.size>=q.need){complete(i);return;}
  say(`${q.name} · ${picked.size}/${q.need}`,`'${c.label}'을 골랐어요. ${q.need-picked.size}가지를 더 골라요.`);renderChoices();}
 $('#task-dismiss').onclick=close;walkBtn.onclick=()=>{if(open>=0)approach(open);};
 function place(b,x,y,z,txt,placed,nearby,isDoneCls){const v=new THREE.Vector3(x,y,z).project(camera);if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1){b.hidden=true;return;}
  let px=Math.max(70,Math.min(innerWidth-70,(v.x*.5+.5)*innerWidth)),py=Math.max(115,Math.min(innerHeight-190,(-v.y*.5+.5)*innerHeight));
  for(const o of placed)if(Math.abs(px-o.x)<150&&Math.abs(py-o.y)<54)py=o.y+58<innerHeight-190?o.y+58:o.y-58;placed.push({x:px,y:py});
  b.hidden=false;b.style.left=px+'px';b.style.top=py+'px';b.textContent=`${v.x<-.85?'← ':v.x>.85?'→ ':''}${txt}`;b.classList.toggle('nearby',nearby);b.classList.toggle('done',isDoneCls);}
 return{
  pick(ray){if(!canUse)return false;const targets=stations.map(s=>s.hit);if(open>=0&&!isDone(open))targets.push(...stations[open].choices.map(c=>c.hit));
   const h=ray.intersectObjects(targets,false)[0];if(!h)return false;const d=h.object.userData;if(d.choice!==undefined)choose(d.station,d.choice);else tapStation(d.station);return true;},
  interact(){if(!canUse)return false;if(open>=0){close();return true;}const i=nearStation();if(i<0)return false;tapStation(i);return true;},
  actionLabel(){if(!canUse)return '';if(open>=0)return '부탁 닫기 · E';const i=nearStation();return i<0?'':`${isDone(i)?'완료한 부탁 보기':'부탁 듣기'} · E`;},
  cancel(){pending=-1;pendingAt=null;close();list.hidden=true;tasksBtn.setAttribute('aria-expanded','false');},
  hide(){this.cancel();canUse=false;for(const s of stations)s.g.visible=false;for(const b of [...labels,...choiceLabels])b.hidden=true;tasksBtn.hidden=true;list.hidden=true;},
  state(){return{done:[...done],open:open<0?null:sidequests[open].id,near:nearStation()<0?null:sidequests[nearStation()].id,spots:Object.fromEntries(stations.map(s=>[s.q.id,s.spot]))};},
  update(pos,enabled,dt,time,reduced){
   current=pos;canUse=enabled;tasksBtn.textContent=`마을 부탁 ${done.size}/3`;tasksBtn.dataset.done=String(done.size);
   listButtons.forEach((b,i)=>{b.textContent=`${isDone(i)?'✓ ':'→ '}${sidequests[i].name}${isDone(i)?' · 완료':''}`;b.classList.toggle('done',isDone(i));b.disabled=!enabled;});
   if(!enabled){panel.hidden=true;for(const b of [...labels,...choiceLabels])b.hidden=true;return;}
   if(open>=0&&yieldTo?.())close();
   if(pending>=0&&pendingAt&&Math.hypot(pos.x-pendingAt.x,pos.z-pendingAt.z)<.3)tapStation(pending,true);
   const k=reduced?1:1-Math.exp(-6*dt);
   stations.forEach((s,i)=>{
    s.ring.visible=!isDone(i);s.ring.material.opacity=reduced?.5:.45+Math.sin(time*2+i)*.12;
    for(const m of s.movers)if(m.active){m.obj.position.lerp(m.to,k);const sc=m.obj.scale.x+(m.scale-m.obj.scale.x)*k;m.obj.scale.setScalar(sc);}
    for(const f of s.flips)f.face.rotation.y+=(f.target-f.face.rotation.y)*k;
   });
   panel.hidden=open<0;panel.inert=!enabled;
   const placed=[],investigating=document.body.classList.contains('investigating');
   let n=0;
   stations.forEach((s,i)=>{
    const showStation=open===i||near(i)||!investigating&&Math.hypot(pos.x-s.spot.x,pos.z-s.spot.z)<9;
    if(showStation)place(labels[i],s.spot.x,1.9,s.spot.z,`${isDone(i)?'✓':'❖'} 부탁 · ${s.q.name}`,placed,near(i),isDone(i));else labels[i].hidden=true;
    s.choices.forEach((c,j)=>{const b=choiceLabels[n++];if(open===i&&!isDone(i)){const p=c.obj.position;place(b,s.spot.x+p.x,1.1,s.spot.z+p.z,`${picked.has(j)?'✓ ':''}${c.label}`,placed,false,false);b.setAttribute('aria-pressed',String(picked.has(j)));}else b.hidden=true;});
   });
  }
 };
}
