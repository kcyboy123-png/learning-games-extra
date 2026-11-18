import * as T from './lib/three.module.min.js';
import {part,batchParts} from './village/dokdo-models.mjs';

// Game-only movable furnishings; delivery anchors and Dokdo terrain stay untouched.
export function deliveryGarden(stops){
 const garden=new T.Group();garden.name='독도 작은 배송 마당';
 for(const [id,q]of Object.entries(stops)){
  const g=new T.Group();g.position.set(q.x,q.y,q.z);garden.add(g);
  const box=(color,x,y,z,w,h,d)=>part(g,'box',color,x,y,z,w,h,d);
  const parcel=(x,z)=>{box('#c6aa7d',x,.2,z,.34,.38,.32);box('#a8b995',x,.395,z,.07,.012,.33);box('#f4ebd2',x,.25,z+.165,.16,.12,.012);};
  if(id==='A'){parcel(-.55,.25);box('#a68d65',-.75,.48,-.25,.055,.96,.055);box('#91a787',-.75,.85,-.25,.32,.25,.09);continue;}
  for(let i=0;i<6;i++)box(i%2?'#cdbb96':'#d5c5a5',0,.018,-.48+i*.19,1.1,.025,.18);
  // Leave the approach in front of each resident completely clear.
  box('#b49c76',.68,.63,-.95,.8,.09,.48);
  for(const x of [.36,1])for(const z of [-1.13,-.77])box('#927d5f',x,.3,z,.055,.6,.055);
  box('#b59e7b',-.72,.35,-.65,.68,.09,.34);box('#c5b28c',-.72,.63,-.82,.68,.32,.06);
  for(const x of [-.98,-.46])box('#8c7b60',x,.17,-.65,.055,.34,.26);
  parcel(1.03,-.4);
  // A padded seat and a little tea tray turn the receiving stop into a lived-in porch.
  box(id==='B'?'#a7bec4':'#bea9c8',-.72,.42,-.65,.42,.10,.28);
  box(id==='B'?'#d4dfce':'#e4d7df',.68,.686,-.95,.65,.012,.37);
  for(const x of [.4,.95])box('#e6ddc5',x,.694,-.95,.018,.008,.35);
  // Keep the centre of the linen tray free for delivered gifts.
  box('#a78e69',-1.05,.18,.1,.48,.3,.35);box('#746b51',-1.05,.34,.1,.42,.03,.29);
  for(let i=0;i<3;i++){
   const x=-1.18+i*.13,z=.1+(i%2)*.06;
   part(g,'sphere','#8fa174',x,.40,z,.11,.09,.10);
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5;part(g,'sphere',id==='B'?'#efe5be':'#c7b8d6',x+Math.cos(a)*.055,.5,z+Math.sin(a)*.055,.042,.017,.028);}
   part(g,'sphere','#d8b976',x,.51,z,.025,.018,.025);
  }
  // A warm unlit lantern and reply box visually connect to the village porch.
  box('#849a7d',1.12,.54,-1.05,.045,1.08,.045);box('#e7d7a6',1.12,1.04,-1.05,.15,.22,.15);box('#7c8f74',1.12,1.17,-1.05,.22,.05,.22);
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=96;const ink=canvas.getContext('2d');ink.fillStyle='#f2e8cd';ink.beginPath();ink.roundRect(2,2,380,92,16);ink.fill();ink.strokeStyle='#b6b798';ink.lineWidth=3;ink.stroke();ink.fillStyle='#587351';ink.textAlign='center';ink.font='bold 36px sans-serif';ink.fillText(id==='B'?'동도 편지 마당':'서도 쉼터',192,62);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.PlaneGeometry(1.1,.275),new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:1,transparent:true}));sign.position.set(-.65,1.15,-.85);g.add(sign);box('#a38f6b',-.65,.6,-.87,.05,1.2,.05);
 }
 batchParts(garden);
 // Delivered gifts appear on the table, away from walking and receiving anchors.
 const gifts=[];
 for(let id=0;id<7;id++){
  const q=stops[id===6?'A':id<3?'B':'C'],g=new T.Group();g.name='전해진 선물 '+id;
  g.position.set(q.x+.42+(id%3)*.24,q.y+.72,q.z-.95);garden.add(g);
  const box=(c,x,y,z,w,h,d)=>part(g,'box',c,x,y,z,w,h,d);
  if(id===0){part(g,'cylinder','#89b5bd',0,.1,0,.07,.17,.07);part(g,'sphere','#89b5bd',.085,.1,0,.04,.04,.02);}
  if(id===1){box('#af895e',0,.15,0,.2,.29,.025);box('#d6e2c4',0,.15,.017,.16,.24,.012);part(g,'sphere','#edd296',-.04,.21,.026,.03,.03,.01);}
  if(id===2){for(let j=0;j<3;j++)box(j%2?'#e8dbbb':'#829e88',0,.025+j*.03,0,.18,.025,.15);}
  if(id===3){box('#82967c',0,.14,0,.15,.24,.15);box('#eed19b',0,.14,.08,.10,.16,.01);box('#6e866b',0,.28,0,.19,.035,.19);}
  if(id===4){box('#c8a373',0,.045,0,.21,.07,.18);for(const x of [-.05,.05])part(g,'cylinder','#e9c98f',x,.1,0,.045,.025,.045);}
  if(id===5){box('#c8ac7f',0,.19,0,.12,.10,.1);box('#a6b697',0,.08,0,.14,.10,.08);}
  if(id===6){g.position.set(q.x-.75,q.y+1.02,q.z-.25);for(let j=0;j<3;j++)box('#f8e9c7',0,j*.018,0,.27,.015,.19);box('#8fa989',0,.06,0,.04,.01,.2);}
  batchParts(g);g.visible=false;gifts.push(g);
 }
 const hand=new T.Vector3();
 let use=null;
 garden.userData.stop=()=>{if(use){use.g.position.copy(use.start);use.g.rotation.copy(use.rotation);use=null;}};
 garden.userData.use=(id,actor)=>{garden.userData.stop();const g=gifts[id];if(!g?.visible||!actor)return;use={g,actor,start:g.position.clone(),rotation:g.rotation.clone(),time:performance.now()};};
 garden.userData.tick=reduced=>{if(!use)return;const t=(performance.now()-use.time)/1000;if(t>4.5||reduced){garden.userData.stop();return;}const lift=Math.sin(Math.min(1,t/4.5)*Math.PI);use.actor.limbs[3].getWorldPosition(hand);hand.y+=.25;use.g.position.copy(use.start).lerp(hand,lift);use.g.rotation.z=-.18*lift;};
 garden.userData.update=ids=>gifts.forEach((g,i)=>g.visible=ids.includes(i));
 return garden;
}
