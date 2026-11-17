import * as T from './lib/three.module.min.js';
import {part,batchParts} from './village/dokdo-models.mjs';
import {toWorld} from './village/grid.mjs';

// Decorations stay outside delivery anchors and never change collision or saves.
export function postGarden(stops){
 const root=new T.Group();root.name='동화 우편 정원';const replies=[];
 const colors=['#dca89a','#e8cb83','#a7bfc9','#c0aed1','#e2c792','#98b6a4'];
 const box=(g,c,x,y,z,w,h,d)=>part(g,'box',c,x,y,z,w,h,d);
 const meadow=new T.Group();meadow.name='길 옆 작은 풀무리';root.add(meadow);
 function grass(x,z,size=1){
  for(let j=0;j<7;j++){
   const a=j*2.4,r=.12+Math.sqrt(j/7)*.28,h=(.14+j%3*.04)*size;
   const blade=part(meadow,'cone',j%2?'#809d5b':'#a0b676',x+Math.cos(a)*r,.16+h/2,z+Math.sin(a)*r,.035*size,h,.045*size);
   blade.rotation.z=Math.sin(a)*.28;blade.rotation.x=Math.cos(a)*.22;
  }
 }
 function shrub(x,z,size=1){
  for(let j=0;j<5;j++){
   const a=j*2.4,r=j*.07*size;
   const leaf=part(meadow,'sphere',j%2?'#92ac74':'#739361',x+Math.cos(a)*r,.16+(.18+j%2*.05)*size,z+Math.sin(a)*r,.30*size,.19*size,.24*size);
   leaf.rotation.y=a;
  }
 }
 for(const [x,y]of [[6.1,12.7],[7.8,12.8],[8.2,12],[8.2,6.2],[6.1,7.6],[12.2,10.3],[14.3,12.3],[13.8,15.6],[12.8,16.5]]){
  const q=toWorld(x,y);grass(q.x,q.z);grass(q.x+.48,q.z+.18,.72);
 }
 function flowers(g,x,z,color,n=7){
  for(let i=0;i<n;i++){
   const a=i*2.4,r=.15+Math.sqrt(i/n)*.48,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,h=.22+(i%3)*.07;
   part(g,'sphere','#86a176',px,.12,pz,.18,.10,.16);
   part(g,'cylinder','#7d9568',px,h/2,pz,.018,h,.018);
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5;part(g,'sphere',color,px+Math.cos(a)*.075,h,pz+Math.sin(a)*.075,.07,.025,.05);}
   part(g,'sphere','#f5d892',px,h+.015,pz,.045,.025,.045);
  }
 }
 function sign(g,text,x,y,z){
  const c=document.createElement('canvas');c.width=512;c.height=144;const p=c.getContext('2d');
  p.fillStyle='#f2e4c3';p.strokeStyle='#b3996c';p.lineWidth=8;p.beginPath();p.roundRect(5,5,502,134,25);p.fill();p.stroke();p.strokeStyle='#d4c29a';p.lineWidth=2;p.beginPath();p.roundRect(17,17,478,110,16);p.stroke();p.fillStyle='#45694d';p.font='bold 48px sans-serif';p.textAlign='center';p.fillText(text,256,91);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
  const m=new T.Mesh(new T.PlaneGeometry(1.8,.5),new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:1,transparent:true}));m.position.set(x,y,z);g.add(m);return m;
 }
 for(let i=0;i<6;i++){
  const q=toWorld(...stops['r'+i]),g=new T.Group();g.name='주민 우편 정원 '+i;g.position.set(q.x,.16,q.z);root.add(g);
  // Low greenery frames the back of each doorstep, never the resident's face.
  shrub(q.x-1.65,q.z-1.35,.9);shrub(q.x+1.65,q.z-1.65,.7);
  grass(q.x-2.05,q.z-.95,.8);
  // A single small mailbox and two loose flower clumps frame each neighbour.
  box(g,'#a28b66',-1.1,.40,-.65,.075,.8,.075);box(g,colors[i],-1.1,.9,-.65,.44,.38,.34);
  const roof=box(g,'#6b8c75',-1.1,1.12,-.65,.56,.07,.45);roof.rotation.z=-.08;
  box(g,'#594d3e',-1.1,.94,-.47,.28,.035,.015);
  const letter=box(g,'#f8eccf',-1.08,.99,-.45,.20,.12,.018);letter.rotation.z=.12;box(g,colors[i],-1.08,.99,-.435,.04,.035,.012);
  const name=sign(g,['모모','단단','여울','솔이','보리','꼬미'][i],-1.1,.80,-.445);name.scale.set(.32,.32,1);
  flowers(g,-1.4,-.9,colors[i],5);flowers(g,1.4,-1.0,i%2?'#fff0c9':'#e2c1cd',3);
  // Each neighbour's small still life matches the parcel in their story.
  const x=1.15,z=-1.2;
  box(g,'#bca17b',x,.42,z,.62,.08,.38);for(const dx of [-.23,.23])box(g,'#9b815d',x+dx,.21,z,.055,.42,.29);
  if(i===0){part(g,'cylinder','#8db7bd',x,.57,z,.10,.22,.10);part(g,'sphere','#8db7bd',x+.12,.58,z,.06,.06,.025);}
  if(i===1){box(g,'#b08b63',x,.74,z,.44,.52,.055);box(g,'#d5dfc0',x,.74,z+.035,.34,.42,.012);part(g,'sphere','#e8c97d',x-.09,.85,z+.05,.05,.05,.015);}
  if(i===2){for(let j=0;j<3;j++)box(g,j%2?'#eee0bf':'#91ad98',x,.50+j*.045,z,.38,.04,.27);}
  if(i===3){box(g,'#849a78',x,.67,z,.24,.38,.24);box(g,'#f2d99f',x,.68,z+.13,.16,.25,.016);box(g,'#70886a',x,.88,z,.30,.06,.30);}
  if(i===4){box(g,'#d7b37d',x,.55,z,.43,.18,.28);for(const dx of [-.1,.1])part(g,'cylinder','#edce91',x+dx,.66,z,.08,.035,.08);}
  if(i===5){for(let j=0;j<3;j++)box(g,'#f7eacc',x,.49+j*.024,z,.35,.02,.23);box(g,'#8fa88d',x,.565,z,.05,.01,.23);}
  batchParts(g);
  const reply=new T.Group();reply.name='도착한 답장 '+i;g.add(reply);
  box(reply,'#fff4d8',-1.1,1.25,-.65,.32,.22,.025);box(reply,'#b59358',-1.1,1.25,-.63,.065,.065,.016);
  const flap=box(reply,'#d6c49e',-1.1,1.29,-.632,.22,.018,.01);flap.rotation.z=-.25;reply.visible=false;replies.push(reply);
 }
 const q=toWorld(...stops.P),porch=new T.Group();porch.position.set(q.x,.16,q.z-1.8);porch.name='꽃 편지 우체국';root.add(porch);
 for(const side of [-1,1]){
  shrub(q.x+side*2.15,q.z-2.65,1.1);
  shrub(q.x+side*2.55,q.z-2.15,.7);
  grass(q.x+side*2.35,q.z-1.55,.9);
  // A few cream blossoms soften the green corners without another sign or fence.
  flowers(porch,side*2.15,-.95,'#f6e9bf',3);
 }
 for(const x of [-1.85,1.85]){
  box(porch,'#a39069',x,1.25,-.6,.11,2.5,.11);
  for(let i=0;i<12;i++){const z=-.6+Math.sin(i*.9)*.10;const leaf=part(porch,'sphere',i%2?'#9bb786':'#779765',x+Math.cos(i)*.10,.4+i*.18,z,.13,.07,.08);leaf.rotation.z=i*.7;}
  flowers(porch,x,-.7,'#efc7c1',7);
  flowers(porch,x+(x<0?-.35:.45),-.95,'#fff0cc',4);
 }
 const arch=new T.Mesh(new T.TorusGeometry(1.85,.065,6,28,Math.PI),new T.MeshStandardMaterial({color:'#a39069',roughness:1}));arch.position.set(0,2.5,-.6);porch.add(arch);
 for(let i=0;i<13;i++){const a=i*Math.PI/12;part(porch,'sphere',i%3?'#8fa97d':'#efd2bd',Math.cos(a)*1.85,2.5+Math.sin(a)*1.85,-.6,.13,.09,.12);}
 sign(porch,'마음을 잇는 우체국',0,2.95,-.45);
 porch.scale.y=.76;
 for(const x of [-1.7,1.7]){box(porch,'#74907a',x,1.8,-.5,.22,.33,.22);box(porch,'#f2d699',x,1.8,-.375,.14,.22,.016);}
 // A low welcome mat stays tucked beside the cottage, away from the walking anchor.
 box(porch,'#b8b38f',.15,.018,.4,.65,.025,.42);
 for(const z of [.25,.55])box(porch,'#e6dfc0',.15,.033,z,.59,.008,.025);
 batchParts(porch);
 // A creek-side picnic and harbour waiting nook are optional sights, never gates.
 for(const [cell,title,tint] of [[[8,8],'강가 이야기','#d8afa3'],[[13,16],'바다 우편길','#a3bac4']]){
  const q=toWorld(...cell),g=new T.Group();g.position.set(q.x,.16,q.z);g.name=title;root.add(g);
  shrub(q.x-1.4,q.z-1.25,.8);grass(q.x+1.4,q.z-.95,.85);
  box(g,'#c4aa7f',0,.34,-.45,1.1,.12,.42);for(const x of [-.42,.42])box(g,'#9f865f',x,.17,-.45,.08,.34,.3);
  for(const z of [-.57,-.32])box(g,'#e6d7b6',0,.405,z,1.02,.012,.018);
  box(g,tint,.23,.43,-.52,.37,.10,.32);box(g,'#eee1bc',-.3,.48,-.45,.22,.20,.22);
  // A folded letter and ceramic cup invite a pause without obstructing the route.
  box(g,'#fff0d2',-.3,.59,-.45,.19,.012,.15);box(g,'#91aa8b',-.3,.60,-.45,.035,.008,.15);
  part(g,'cylinder','#a5bfc0',.02,.51,-.45,.065,.14,.065);
  // A short loose edge frames the resting place, leaving the front open.
  for(let j=0;j<4;j++)part(g,'sphere','#b4b39a',-.5+j*.33,.08,-1.27,.15,.08,.12);
  flowers(g,-.95,-.8,'#e3c6d6',4);flowers(g,1.0,-.9,'#f3e4bb',3);
  if(cell[0]===8){
   const cover=box(g,'#8a9e7f',-.26,.61,-.45,.34,.025,.25);cover.rotation.y=.15;
   for(const dx of [-.08,.08]){const page=box(g,'#f6ead0',-.26+dx,.635,-.45,.15,.018,.22);page.rotation.z=dx<0?.10:-.10;}
  }else{
   box(g,'#b39367',-.7,.28,-.95,.38,.36,.3);box(g,'#e5d1a6',-.7,.47,-.95,.42,.04,.34);
   const handle=new T.Mesh(new T.TorusGeometry(.12,.018,5,12,Math.PI),new T.MeshStandardMaterial({color:'#987d56',roughness:1}));handle.position.set(-.7,.49,-.95);g.add(handle);
  }
  sign(g,title,-.15,1.12,-1.05);box(g,'#a58b63',-.15,.56,-1.07,.07,1.12,.07);batchParts(g);
 }

 // A low flower patch replaces the canopy that obscured the post-office approach.
 const verge=toWorld(10,13),lowFlowers=new T.Group();root.add(lowFlowers);flowers(lowFlowers,verge.x,verge.z,'#eed8ad',5);batchParts(lowFlowers);
 // Three small visitors stay beside flowers; they are scenery, never a collection task.
 const butterflies=[];const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(.26,.32,.38,.13,.13,-.02);shape.bezierCurveTo(.32,-.2,.12,-.3,0,-.1);shape.closePath();const wingGeo=new T.ShapeGeometry(shape);
 for(const [i,cell]of [[7,10],[8,8],[13,16]].entries()){
  const q=toWorld(...cell),g=new T.Group();g.name='꽃밭 나비';root.add(g);const mat=new T.MeshStandardMaterial({color:['#f2d58e','#d3b4c8','#c0d8c4'][i],side:T.DoubleSide,roughness:1});
  const wings=[-1,1].map(side=>{const wing=new T.Mesh(wingGeo,mat);wing.scale.x=side;wing.rotation.x=-Math.PI/2;g.add(wing);return wing;});
  part(g,'sphere','#857b55',0,0,-.04,.018,.025,.12);butterflies.push({g,wings,q,i});
 }
 root.userData.tick=(time,reduced)=>{for(const {g,wings,q,i}of butterflies){const t=reduced?i:time*.55+i*2;g.position.set(q.x+1.05+Math.cos(t)*.25,.9+(reduced?0:Math.sin(t*2)*.08),q.z-.8+Math.sin(t)*.22);g.rotation.y=t*.6;wings.forEach((w,j)=>w.rotation.y=(j?1:-1)*(reduced?.35:.35+Math.sin(time*9+i)*.3));}};
 root.userData.update=delivered=>replies.forEach((r,i)=>r.visible=delivered.includes(i));
 batchParts(meadow);
 return root;
}
