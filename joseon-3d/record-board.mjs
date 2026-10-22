import {scenes} from './story.mjs';
// '세 사람의 기록판': a creative classroom device in the central lane, not a historical object.
// Three evidence slips (never the owners' belongings) are carried to labelled slots.
// Session-only: nothing is saved, so a reload replays an unfinished board and keeps mission answers.
export const boardSpot={x:2.9,z:.8,stand:{x:2.9,z:2.3}};
export const boardTokens=[
 {id:'safety',slot:'마을의 안전',name:'꾸려 놓은 짐',x:-4.6,z:11.4,stand:{x:-4.6,z:10.5},color:0x8f7f63,fact:scenes[0].clues[0].text+' 외적의 침입 때문에 마을을 떠나야 했어요.',miss:"'꾸려 놓은 짐'은 외적의 침입 때문에 마을을 떠나야 했던 가족의 안전 문제를 보여 줘요."},
 {id:'living',slot:'백성의 살림',name:'거의 빈 바구니',x:3.1,z:-5.7,stand:{x:3.1,z:-4.8},color:0xc4a86a,fact:scenes[1].clues[0].text+' 일부 지배층이 곡식을 가져가 살림이 갈수록 어려워졌어요.',miss:"'거의 빈 바구니'는 일부 지배층이 곡식을 빼앗아 어려워진 백성의 살림을 보여 줘요."},
 {id:'critic',slot:'부패에 대한 비판',name:'걱정하는 사람의 말',x:-4.35,z:-21.7,stand:{x:-4.3,z:-20.9},color:0x8c6e60,fact:scenes[2].clues[1].text+' 재물이 많다는 것만으로 부패라고 단정할 수는 없어서, 비판하는 사람의 말을 기록으로 남겨요.',miss:"'걱정하는 사람의 말'은 일부 승려의 사치와 부패를 비판하는 목소리를 보여 줘요."}
];
export function createRecordBoard({THREE,scene,world,camera,walk,stop,notice,onComplete,onContinue}){
 const B=boardSpot,T=boardTokens,wood=world.clueMaterials.wood,dark=new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:.9});
 const text=(label,w,h,bg='#ede0bc',fg='#3e463b')=>{const c=document.createElement('canvas');c.width=Math.round(w*256);c.height=Math.round(h*256);const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.font=`${Math.floor(Math.min(c.height*.62,(c.width-20)/Math.max(1,label.length)*1.05))}px "Gowun Batang","Noto Serif KR",serif`;g.fillText(label,c.width/2,c.height/2);const t=new THREE.CanvasTexture(c);if(THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));};
 const group=new THREE.Group();scene.add(group);const frame=new THREE.Group();frame.position.set(B.x,0,B.z);group.add(frame);
 const add=(geo,m,x,y,z,parent=frame)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;};
 for(const dx of [-1.02,1.02])add(new THREE.BoxGeometry(.16,2.25,.16),wood,dx,1.12,0);
 add(new THREE.BoxGeometry(2.2,1.2,.1),wood,0,1.42,0);add(new THREE.BoxGeometry(2.5,.1,.6),dark,0,2.22,0);
 const head=text('세 사람의 기록판',1.3,.26);head.position.set(0,1.9,.06);frame.add(head);
 const slotHits=[],slotMarks=[];
 T.forEach((t,i)=>{const dx=(i-1)*.68;add(new THREE.BoxGeometry(.56,.64,.05),dark,dx,1.3,.05);const l=text(t.slot,.6,.16,'#d9c9a0');l.position.set(dx,1.72,.07);frame.add(l);
  const hit=add(new THREE.BoxGeometry(.66,1,.5),new THREE.MeshBasicMaterial({visible:false}),dx,1.35,.2);hit.castShadow=false;hit.userData.slot=i;slotHits.push(hit);
  const ring=add(new THREE.RingGeometry(.3,.36,32),new THREE.MeshBasicMaterial({color:0xf2d27a,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),dx,1.3,.12);ring.castShadow=false;slotMarks.push(ring);});
 world.colliders.push({x:B.x,z:B.z,w:2.3,d:.5});
 const tokens=T.map((t,i)=>{const g=new THREE.Group();g.position.set(t.x,0,t.z);g.visible=false;group.add(g);
  const base=add(new THREE.CylinderGeometry(.26,.3,.07,12),dark,0,.035,0,g);
  const tag=new THREE.Group();tag.position.y=.62;g.add(tag);add(new THREE.BoxGeometry(.44,.56,.05),new THREE.MeshStandardMaterial({color:t.color,roughness:.9}),0,0,0,tag);
  const l=text(t.name,.4,.14,'#f1e6c8');l.position.set(0,.02,.03);tag.add(l);
  const hit=add(new THREE.BoxGeometry(1,1.6,1),new THREE.MeshBasicMaterial({visible:false}),0,.8,0,g);hit.castShadow=false;hit.userData.token=i;
  return {g,tag,hit,base,state:'home'};});
 const panel=document.createElement('section');panel.id='board-notes';panel.className='event-panel';panel.hidden=true;
 panel.innerHTML=`<span class="eyebrow">세 사람의 기록판 · 학습용 활동</span><strong id="board-title"></strong><p id="board-text" aria-live="polite"></p><div id="board-slots" hidden>${T.map((t,i)=>`<button data-slot="${i}">${t.slot} 칸에 놓기</button>`).join('')}</div><div><button id="board-guide">기록 조각으로 걸어가기</button><button id="board-drop" hidden>조각 내려놓기</button><button id="board-continue" hidden>1392년으로 이어 보기 →</button><button id="board-dismiss" class="quiet">계속 둘러보기</button></div>`;
 document.body.append(panel);
 const $=s=>panel.querySelector(s),title=$('#board-title'),body=$('#board-text'),slotsBox=$('#board-slots'),dropBtn=$('#board-drop'),contBtn=$('#board-continue');
 const buttons=T.map((t,i)=>{const b=document.createElement('button');b.className='world-clue event-ui';b.hidden=true;b.onclick=()=>tapToken(i);document.body.append(b);return b;});
 const slotButtons=T.map((t,i)=>{const b=document.createElement('button');b.className='world-clue event-ui';b.hidden=true;b.textContent=`${t.slot} 칸에 놓기`;b.onclick=()=>tapSlot(i);document.body.append(b);return b;});
 panel.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>tapSlot(Number(b.dataset.slot)));
 let active=false,done=false,carrying=-1,placed=[-1,-1,-1],pending=null,current={x:0,z:15},canUse=false,shown=false,chooser=false,shake=0,pulse=-1,pulseT=0;
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),near=p=>dist(current,p)<1.65,count=()=>placed.filter(v=>v>=0).length;
 function say(t,txt){$('#board-guide').textContent=carrying>=0||done?'기록판으로 걸어가기':'기록 조각으로 걸어가기';title.textContent=t;body.textContent=txt;shown=true;dropBtn.hidden=carrying<0;slotsBox.hidden=!(chooser&&carrying>=0);contBtn.hidden=!done;}
 function returnHome(i){tokens[i].state='home';tokens[i].g.position.set(T[i].x,0,T[i].z);tokens[i].tag.position.set(0,.62,0);}
 function drop(){if(!canUse||carrying<0)return;const i=carrying;returnHome(i);carrying=-1;chooser=false;say('조각을 제자리에 두었어요',`'${T[i].name}'은 원래 자리로 돌아갔어요. 다른 조각을 고르거나 다시 집을 수 있어요.`);}
 function tapToken(i){if(!canUse||tokens[i].state==='placed')return;chooser=false;
  if(!near(T[i].stand)){pending={kind:'token',i};if(!walk(T[i].stand)){pending=null;notice('기록 조각 옆의 열린 길로 조금 더 다가가 주세요.');}else notice('기록 조각 가까이 걸어가요.');return;}
  pending=null;stop();if(tokens[i].state==='hand'){drop();return;}
  if(carrying>=0)returnHome(carrying);carrying=i;tokens[i].state='hand';
  say(`'${T[i].name}' 조각을 들었어요 · ${count()}/3`,`${T[i].fact} 기록판의 어울리는 칸을 누르면 걸어가서 이어요.`);}
 function tapSlot(k){if(!canUse)return;if(carrying<0){say('먼저 기록 조각을 가져와요','세 곳에 놓인 기록 조각 중 하나를 집어 와서 칸에 이어요.');return;}
  if(!near(B.stand)){pending={kind:'slot',i:k};if(!walk(B.stand)){pending=null;notice('기록판 앞의 열린 길로 다가가 주세요.');}else notice('기록판 앞으로 걸어가요.');return;}
  pending=null;stop();place(k);}
 function place(k){const i=carrying,t=T[i];chooser=false;
  if(placed[k]>=0){say('이미 채워진 칸이에요','비어 있는 다른 칸을 골라요.');return;}
  if(T[k].id!==t.id){shake=.6;say('조금 더 생각해 봐요 · 감점은 없어요',t.miss);return;}
  placed[k]=i;tokens[i].state='placed';carrying=-1;pulse=k;pulseT=0;tokens[i].g.position.set(B.x+(k-1)*.68,0,B.z+.12);tokens[i].tag.position.set(0,1.3,0);
  if(placed.every(v=>v>=0)){done=true;onComplete?.();say('세 기록이 하나로 이어졌어요','안전, 살림, 비판의 목소리는 서로 다른 어려움이었어요. 모두가 같은 생각을 한 것은 아니었지만, 이런 어려움 속에서 변화를 바라는 사람들이 생겨났어요.');}
  else say(`'${t.slot}' 칸에 이었어요 · ${count()}/3`,t.fact);}
 contBtn.onclick=()=>{if(!canUse||!done||!active)return;active=false;canUse=false;shown=false;panel.hidden=true;onContinue?.();};
 dropBtn.onclick=drop;$('#board-dismiss').onclick=()=>{shown=false;chooser=false;panel.hidden=true;};
 $('#board-guide').onclick=()=>{if(!canUse)return;const i=tokens.findIndex(t=>t.state==='home');walk(carrying>=0||i<0?B.stand:T[i].stand);};
 const nearToken=()=>T.findIndex((t,j)=>tokens[j].state!=='placed'&&near(t.stand));
 function start(){active=true;group.visible=true;tokens.forEach(t=>t.g.visible=true);if(done){say('세 기록이 하나로 이어졌어요','아래 버튼으로 1392년으로 이어 봐요.');return;}
  if(!active){active=true;tokens.forEach(t=>t.g.visible=true);}
  say('세 곳의 기록 조각을 기록판에 이어요','피란길의 가족, 농부, 절 앞 사람에게서 기록 조각을 하나씩 가져와요. 기록판의 알맞은 칸에 놓아 보세요. 사람들의 물건은 그대로 두고, 보고 들은 기록만 옮겨요.');}
 return{
  start,
  guide(){if(!active||done){start();walk(B.stand);return;}const i=tokens.findIndex(t=>t.state==='home');walk(carrying>=0||i<0?B.stand:T[i].stand);},
  pick(ray){if(!canUse||done)return false;const h=ray.intersectObjects([...tokens.filter(t=>t.state==='home').map(t=>t.hit),...slotHits],false)[0];if(!h)return false;if(h.object.userData.token!==undefined)tapToken(h.object.userData.token);else tapSlot(h.object.userData.slot);return true;},
  interact(){if(!canUse)return false;
   if(done){if(near(B.stand)){contBtn.onclick();return true;}return false;}
   if(carrying>=0&&near(B.stand)){chooser=!chooser;if(chooser)say('어느 칸에 이을까요?',`'${T[carrying].name}' 조각을 놓을 칸을 골라요.`);else{shown=false;slotsBox.hidden=true;panel.hidden=true;}return true;}
   const i=nearToken();if(i>=0){tapToken(i);return true;}return false;},
  actionLabel(){if(!canUse)return '';if(done&&active)return near(B.stand)?'1392년으로 이어 보기 · E':'';if(!canUse)return '';if(carrying>=0&&near(B.stand))return chooser?'칸 고르기 닫기 · E':'칸 고르기 · E';const i=nearToken();if(i<0)return '';return tokens[i].state==='hand'?'조각 내려놓기 · E':`'${T[i].name}' 집기 · E`;},
  cancel(){pending=null;chooser=false;shown=false;panel.hidden=true;},
  hide(){active=false;shown=false;group.visible=false;panel.hidden=true;for(const b of [...buttons,...slotButtons])b.hidden=true;},
  isActive:()=>active,isDone:()=>done,count,carrying:()=>carrying>=0,
  update(pos,enabled,dt,time,reduced){
   current=pos;canUse=enabled&&active;
   if(pending&&canUse&&dist(pos,(pending.kind==='token'?T[pending.i]:B).stand)<.3){const p=pending;pending=null;p.kind==='token'?tapToken(p.i):tapSlot(p.i);}
   const bob=reduced?0:Math.sin(time*2.4)*.05;
   tokens.forEach((t,i)=>{t.base.visible=t.state==='home';if(t.state==='home'){t.tag.position.y=.62+bob;t.tag.rotation.y=reduced?0:Math.sin(time*.9+i)*.25;}
    else if(t.state==='hand'){t.g.position.set(pos.x+.5,0,pos.z+.3);t.tag.position.set(shake>0&&!reduced?Math.sin(shake*40)*.06:0,1.05+bob*.6,0);t.tag.rotation.y=0;}});
   if(shake>0&&enabled)shake=Math.max(0,shake-dt);
   if(pulse>=0&&enabled){pulseT+=dt;const m=slotMarks[pulse],k=Math.min(1,pulseT/.8);m.material.opacity=reduced?(k<1?.8:0):.9*(1-k);m.scale.setScalar(reduced?1:1+k*.8);if(k>=1){m.material.opacity=0;pulse=-1;}}
   panel.hidden=!(shown&&active&&enabled);panel.inert=!enabled;
   T.forEach((t,i)=>{const b=buttons[i],show=canUse&&!done&&carrying<0&&tokens[i].state==='home';b.hidden=!show;
    if(show){const v=new THREE.Vector3(t.x,1.5,t.z).project(camera);if(v.z>1)b.hidden=true;else{b.style.left=Math.max(70,Math.min(innerWidth-70,(v.x*.5+.5)*innerWidth))+'px';b.style.top=Math.max(115,Math.min(innerHeight-190,(-v.y*.5+.5)*innerHeight))+'px';b.textContent=`${v.x<-.85?'← ':v.x>.85?'→ ':''}＋ ${t.name}`;b.classList.toggle('nearby',near(t.stand));}}
    const s=slotButtons[i],showS=canUse&&carrying>=0&&placed[i]<0;s.hidden=!showS;
    if(showS){const w=new THREE.Vector3(B.x,2.5,B.z).project(camera);if(w.z>1)s.hidden=true;else{s.style.left=Math.max(70,Math.min(innerWidth-70,(w.x*.5+.5)*innerWidth))+'px';s.style.top=(innerWidth<600?(shown?(panel.getBoundingClientRect?.().bottom||330):200)+50+i*50:Math.max(220,Math.min(innerHeight-190,(-w.y*.5+.5)*innerHeight))-(2-i)*50)+'px';s.classList.toggle('nearby',near(B.stand));}}});
  }
 };
}
