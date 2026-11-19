import * as T from './vendor/three.module.js';
import {artMaterial,addMesh,instances,spectators,plantedBorders,oak} from './art-assets.mjs';
const C={stone:0xd5cbb7,ivory:0xf4efdf,green:0x395e50,blue:0x245c80,gold:0xb99853},materials=new Map();
function material(c){if(!materials.has(c))materials.set(c,artMaterial(c,c===C.gold?{metalness:.65,roughness:.29,envMapIntensity:.7}:{}));return materials.get(c);}
const solid=(p,g,c,x=0,y=0,z=0)=>addMesh(p,g,typeof c==='number'?material(c):c,x,y,z);
const box=(p,w,h,d,x,y,z,c)=>solid(p,new T.BoxGeometry(w,h,d),c,x,y,z);
function beam(p,a,b,r,c){const av=new T.Vector3(...a),bv=new T.Vector3(...b),m=solid(p,new T.CylinderGeometry(r,r,av.distanceTo(bv),10),c);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;}
function tube(p,points,r,c){return solid(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),40,r,8,false),c);}
function texture(w,h,draw){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
function label(text,width=8,subtitle='PAPER FLIGHT CHAMPIONSHIP',compact=false){
 const map=texture(1536,compact?256:512,(c,w,h)=>{c.fillStyle='#244638';c.fillRect(0,0,w,h);const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#ffffff12');g.addColorStop(1,'#00000020');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#cbb279';c.lineWidth=4;c.strokeRect(20,20,w-40,h-40);c.fillStyle='#ead5a0';c.textAlign='center';c.font='26px sans-serif';c.fillText(subtitle,w/2,compact?58:122);c.fillStyle='#fff9e6';c.font='700 106px SUIT, sans-serif';c.fillText(text,w/2,compact?178:294,w-140);c.fillStyle='#cbb279';c.fillRect(w/2-65,compact?218:364,130,3);});
 const m=new T.Mesh(new T.PlaneGeometry(width,width/(compact?6:3)),artMaterial(0xffffff,{map,roughness:.62,side:T.DoubleSide}));m.scale.x=-1;m.rotation.y=Math.PI;return m;
}
function crest(ivory=false){const map=texture(256,384,c=>{c.fillStyle=ivory?'#eee7d4':'#285573';c.fillRect(0,0,256,384);c.strokeStyle=ivory?'#a58a52':'#d9bc79';c.lineWidth=3;c.strokeRect(12,12,232,360);c.strokeStyle=ivory?'#335a68':'#fff9e9';c.lineWidth=4;c.lineJoin='round';c.beginPath();c.moveTo(42,154);c.lineTo(214,95);c.lineTo(157,237);c.lineTo(114,191);c.lineTo(79,215);c.lineTo(86,172);c.closePath();c.moveTo(86,172);c.lineTo(214,95);c.lineTo(114,191);c.stroke();});return artMaterial(0xffffff,{map,side:T.DoubleSide});}
function banners(p,side,zs,world){
 const mats=[crest(),crest(true)];
 for(const [i,z] of zs.entries()){
  const x=side*5.9;solid(p,new T.CylinderGeometry(.08,.13,.18,16),C.gold,x,.15,z);solid(p,new T.CylinderGeometry(.028,.035,3.7,12),C.gold,x,2,z);solid(p,new T.SphereGeometry(.085,14,10),artMaterial(C.gold,{metalness:.75,roughness:.23}),x,3.9,z);
  const flag=solid(p,new T.PlaneGeometry(.78,1.1,8,4),mats[(i+(world?0:1))%2],x+side*.42,3.12,z);flag.rotation.y=Math.PI;flag.scale.x=-1;
  const pos=flag.geometry.attributes.position;for(let j=0;j<pos.count;j++)pos.setZ(j,Math.sin(pos.getX(j)*7+pos.getY(j)*2)*.055);flag.geometry.computeVertexNormals();beam(p,[x,3.72,z],[x+side*.86,3.72,z],.018,C.gold);
 }
}
function borders(p,length,onChange,world=false){
 const beds=[];for(const side of [-1,1])for(const z of [3.5,13,25,37].filter(z=>z<length)){
  const x=side*(world?5.3:6.2),len=z===3.5?3:4.8;box(p,.92,.26,len,x,.13,z,C.stone);box(p,.97,.055,len+.06,x,.28,z,C.ivory);box(p,.78,.01,len-.14,x,.313,z,0x5d6041);beds.push([x,z,len]);
 }plantedBorders(p,beds,onChange);
}
function railing(p,side,z0,length,x=6.2){
 const parts=[];for(let z=z0;z<z0+length;z+=.4)parts.push({p:[side*x,.73,z],s:[.023,1.05,.023]});instances(p,new T.BoxGeometry(1,1,1),artMaterial(0xaaa78b,{metalness:.45,roughness:.4}),parts);beam(p,[side*x,1.28,z0],[side*x,1.28,z0+length],.035,C.gold);
 for(let z=z0;z<z0+length;z+=3.2){box(p,.18,1.35,.18,side*x,.68,z,C.ivory);solid(p,new T.SphereGeometry(.08,12,8),C.gold,side*x,1.4,z);}
}
function seatBackGeometry(){const shape=new T.Shape();shape.moveTo(-.5,-.5);shape.lineTo(-.5,.30);shape.quadraticCurveTo(-.5,.5,-.30,.5);shape.lineTo(.30,.5);shape.quadraticCurveTo(.5,.5,.5,.30);shape.lineTo(.5,-.5);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false,curveSegments:3});geo.translate(0,0,-.5);return geo;}
function seats(p,world,onChange){
 const rows=world?5:3,length=world?35:27,seatItems=[],backItems=[],people=[],structure=[],seatSupports=[];
 for(const side of [-1,1]){
  for(let row=0;row<rows;row++){
   const x=side*(7.3+row*.92),y=.25+row*.54;const top=y+.02+row*.015;structure.push({p:[x,top/2,6+length/2],s:[1.05,top,length]});
   for(let i=0;i<Math.floor(length/.95);i++){
    if(i%11===5)continue;const z=6+i*.95;seatSupports.push({p:[x,(top+y+.37)/2,z],s:[.09,y+.37-top,.36]});seatItems.push({p:[x,y+.42,z],s:[.56,.10,.64],c:world?(i%11===0?0xddc68d:0x30698a):((i+row)%8===0?0x8eaa96:C.green)});backItems.push({p:[x+side*.28,y+.71,z],s:[.09,.55,.62],r:[0,0,side*.1],c:world?(i%11===0?0xddc68d:0x30698a):((i+row)%8===0?0x8eaa96:C.green)});
    if((i*3+row*7)%7<2)people.push({x:x-side*.07,y:y-.02,z,yaw:-side*Math.PI/2});
   }
  }
  for(const z of [10.7,21.15,31.6].filter(z=>z<length+5))for(let row=0;row<rows*2;row++)box(p,.48,.27,.8,side*(7+row*.46),.13+row*.27,z,C.ivory);railing(p,side,6,length,6.5);
 }
 instances(p,new T.BoxGeometry(1,1,1),material(0x405867),seatSupports);instances(p,new T.BoxGeometry(1,1,1),material(C.stone),structure);instances(p,new T.BoxGeometry(1,1,1),material(0xffffff),seatItems);instances(p,seatBackGeometry().rotateY(Math.PI/2),material(0xffffff),backItems);spectators(p,people,onChange);
}
function school(p,onChange){
 const places=[];for(const side of [-1,1]){
  for(let row=0;row<2;row++){box(p,1.1,.3,18,side*(8.4+row*.8),.15+row*.32,17,C.stone);box(p,.65,.08,18,side*(8.3+row*.8),.7+row*.32,17,oak(onChange,[.4,5]));for(let i=0;i<8;i++)places.push({x:side*(8.3+row*.8),y:.22+row*.32,z:9+i*2.05,yaw:-side*Math.PI/2});}
  for(let z=5;z<31;z+=5)beam(p,[side*7,0,z],[side*7,2.6,z],.035,C.ivory);
  const points=[];for(let j=0;j<=50;j++)points.push([side*7,2.6-.17*Math.sin(j/10*Math.PI)**2,5+j*.5]);tube(p,points,.012,0x8d8d72);
  const flags=[];for(let i=0;i<44;i++)flags.push({p:[side*7,2.45,5.4+i*.56],r:[0,side*Math.PI/2,0],c:i%3===0?0xe4ca83:i%3===1?C.blue:0xf1ede0});const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.20,0,0,.20,0,0,0,-.35,0],3));g.computeVertexNormals();instances(p,g,artMaterial(0xffffff,{side:T.DoubleSide}),flags);
 }
 spectators(p,places,onChange);borders(p,40,onChange);const frame=oak(onChange,[3,.5]);box(p,9.5,1.85,.22,0,4.6,32.14,frame);for(const y of [3.74,5.46])box(p,9.65,.13,.32,0,y,31.99,C.ivory);for(const x of [-4.7,4.7])box(p,.13,1.75,.32,x,4.6,31.99,C.ivory);const sign=label('우리 학교 종이비행기 컵',9,'OUR SCHOOL · FLIGHT FESTIVAL',true);sign.position.set(0,4.6,32);p.add(sign);for(const x of [-4.6,4.6])box(p,.13,5.5,.13,x,2.75,32,C.stone);
}
export function createVenues(onChange){
 const venues={};for(const id of ['school','city','world']){const g=new T.Group();g.name='venue-'+id;g.visible=false;venues[id]=g;
  if(id==='school'){school(g,onChange);campusWings(g);}else if(id==='city'){cityPark(g,onChange);waterfront(g);skyVault(g,false);}else {championshipBowl(g,onChange);championshipFloor(g);skyVault(g,true);arenaLighting(g);arenaGallery(g);}eventDetails(g,id,onChange);officialDesk(g,id,onChange);if(id==='school')schoolFestival(g);if(id==='city')cityProduction(g);supportSections(g,id);
 }return venues;
}
export function schoolArchitecture(p){
 const brick=texture(512,512,(c,w,h)=>{c.fillStyle='#a18d72';c.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let j=-1;j<6;j++){const v=Math.abs((r*29+j*17)%19);c.fillStyle=`rgb(${164+v},${135+v},${104+v})`;c.fillRect(j*103+(r%2)*51,r*32,99,28);}});brick.wrapS=brick.wrapT=T.RepeatWrapping;brick.repeat.set(8,2);const wall=artMaterial(0xf4e6cf,{map:brick,bumpMap:brick,bumpScale:.035});
 for(const side of [-1,1]){box(p,10.8,6.3,5,side*8,3.15,43,wall);box(p,11.2,.32,5.5,side*8,6.4,43,C.ivory);box(p,11.4,.18,5.7,side*8,6.65,43,0x465f69);for(const y of [.35,2.4,4.5,6.15])box(p,10.9,.13,.18,side*8,y,40.42,C.ivory);}
 box(p,5.7,7.7,6.2,0,3.85,42.7,0xe9dfca);box(p,6.2,.3,6.6,0,7.8,42.7,C.ivory);const shape=new T.Shape();shape.moveTo(-3.25,0);shape.lineTo(0,1.5);shape.lineTo(3.25,0);shape.closePath();solid(p,new T.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:2,steps:1}),C.ivory,0,8,39.35);
 const windowMap=texture(128,256,c=>{const sky=c.createLinearGradient(0,0,128,256);sky.addColorStop(0,'#a9c5cc');sky.addColorStop(.48,'#5c8898');sky.addColorStop(1,'#365f65');c.fillStyle=sky;c.fillRect(0,0,128,256);c.fillStyle='#e4f0e331';c.beginPath();c.moveTo(0,20);c.lineTo(128,90);c.lineTo(128,145);c.lineTo(0,74);c.fill();c.fillStyle='#172e391a';c.fillRect(0,192,128,64);});const glass=artMaterial(0xffffff,{map:windowMap,metalness:.32,roughness:.23}),frames=[],panes=[];
 for(const x of [-12,-9.8,-7.6,-5.4,5.4,7.6,9.8,12])for(const y of [1.4,3.5,5.5]){panes.push({p:[x,y,40.46],s:[1.32,1.46,.06]});for(const dx of [-.72,0,.72])frames.push({p:[x+dx,y,40.37],s:[.07,1.62,.16]});for(const dy of [-.80,0,.80])frames.push({p:[x,y+dy,40.37],s:[1.5,.065,.16]});frames.push({p:[x,y-.86,40.3],s:[1.65,.12,.3]});}
 instances(p,new T.BoxGeometry(1,1,1),glass,panes);instances(p,new T.BoxGeometry(1,1,1),material(C.ivory),frames);
 box(p,2.8,4.8,.10,0,2.6,39.54,glass);
 const entry=[];for(const x of [-1.4,0,1.4])entry.push({p:[x,2.6,39.45],s:[.085,4.8,.11]});for(const y of [.25,3.45,5])entry.push({p:[0,y,39.45],s:[2.88,.09,.11]});instances(p,new T.BoxGeometry(1,1,1),material(0xd8cfb9),entry);for(const x of [-.18,.18])beam(p,[x,1.45,39.34],[x,2.25,39.34],.025,C.gold);
for(const x of [-1.8,1.8])solid(p,new T.CylinderGeometry(.19,.22,5.4,20),C.ivory,x,2.8,39.35);box(p,4.4,.25,1.2,0,5.65,39.5,C.ivory);for(let i=0;i<4;i++)box(p,5.3-i*.2,.12,1.4-i*.2,0,.06+i*.12,39.1-i*.1,C.stone);
 const clock=texture(512,512,c=>{c.fillStyle='#f5f0de';c.beginPath();c.arc(256,256,243,0,6.283);c.fill();c.strokeStyle='#927d57';c.lineWidth=12;c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(256+Math.sin(a)*196,256+Math.cos(a)*196);c.lineTo(256+Math.sin(a)*218,256+Math.cos(a)*218);c.stroke();}c.lineWidth=13;c.beginPath();c.moveTo(256,122);c.lineTo(256,256);c.lineTo(343,288);c.stroke();});const m=solid(p,new T.CircleGeometry(.64,48),artMaterial(0xffffff,{map:clock}),0,6.8,39.54);m.rotation.y=Math.PI;m.scale.x=-1;
}
export function workshopPrize(scene){
 const gold=artMaterial(0xcaa854,{metalness:.88,roughness:.21}),g=new T.Group();box(g,.075,.012,.075,0,0,0,0x294d41);const profile=[[.016,0],[.014,.008],[.008,.017],[.007,.038],[.014,.048],[.028,.062],[.036,.087],[.035,.091]].map(([x,y])=>new T.Vector2(x,y));solid(g,new T.LatheGeometry(profile,48),gold,0,.006,0);for(const side of [-1,1]){const h=solid(g,new T.TorusGeometry(.019,.0028,12,32),gold,side*.032,.078,0);h.scale.y=1.13;}box(g,.05,.008,.001,0,.008,.038,artMaterial(0xc7aa68,{metalness:.8,roughness:.3}));g.position.set(.23,-.043,-.33);scene.add(g);return g;
}

function cityPark(p,onChange){
 seats(p,false,onChange);borders(p,35,onChange);
 const facade=texture(512,1024,c=>{const sky=c.createLinearGradient(0,0,512,1024);sky.addColorStop(0,'#b4c8d4');sky.addColorStop(.4,'#6c8da5');sky.addColorStop(.72,'#b9a696');sky.addColorStop(1,'#35516b');c.fillStyle=sky;c.fillRect(0,0,512,1024);for(let y=0;y<1024;y+=64){c.fillStyle='#203c5480';c.fillRect(0,y,512,4);for(let x=0;x<512;x+=64){c.fillStyle=(x/64+y/64)%9===0?'#efcc9660':'#d8edfa10';c.fillRect(x+3,y+5,58,55);c.fillStyle='#26455b88';c.fillRect(x,y,3,64);}}const reflection=c.createLinearGradient(0,0,512,0);reflection.addColorStop(0,'#ffffff00');reflection.addColorStop(.35,'#d9efff40');reflection.addColorStop(.40,'#edf6ff70');reflection.addColorStop(.46,'#ffffff06');reflection.addColorStop(1,'#ffffff00');c.fillStyle=reflection;c.fillRect(0,0,512,1024);for(const x of [2,170,340,508]){c.fillStyle='#d9e6ed70';c.fillRect(x,0,2,1024);}});facade.wrapS=facade.wrapT=T.RepeatWrapping;
 const buildings=[];for(let i=0;i<19;i++){const x=-88+i*9.5,h=6+(i*13%25)*.65,w=5+(i*7%5),z=130+(i%3)*13;buildings.push({p:[x,h/2,z],s:[w,h,8],c:[0xabb5c3,0xd9c9bf,0x8193ac][i%3]});if(i%3===0){buildings.push({p:[x,h+2,z],s:[w*.68,4,6],c:0xb4c2d0});beam(p,[x,h+4,z],[x,h+9,z],.045,0xb4c2d0);}}
 instances(p,new T.BoxGeometry(1,1,1),artMaterial(0xffffff,{map:facade,roughness:.38,metalness:.18,emissive:0xad7c4d,emissiveMap:facade,emissiveIntensity:.12}),buildings);
 const landmark=artMaterial(0x537f96,{map:facade,metalness:.5,roughness:.28});box(p,9,18,9,14,9,150,landmark);box(p,6.5,6,6.5,14,21,150,landmark);const crown=solid(p,new T.ConeGeometry(4.7,6,4),landmark,14,27,150);crown.rotation.y=Math.PI/4;beam(p,[14,30,150],[14,33,150],.10,0xe4c99d);
 const lowrise=[];for(let i=0;i<17;i++)lowrise.push({p:[-76+i*9.5,3.5,113],s:[7,7,7],c:i%2?0xe5c2a0:0xa6aeb7});instances(p,new T.BoxGeometry(1,1,1),artMaterial(0xffffff,{map:facade,roughness:.65}),lowrise);
 const paving=texture(512,512,c=>{c.fillStyle='#a69681';c.fillRect(0,0,512,512);for(let y=0;y<8;y++)for(let x=-1;x<9;x++){c.fillStyle=['#c9b8a1','#d3c3ad','#c4b39a'][(x+17*y+3)%3];c.fillRect(x*64+(y%2)*32+1,y*64+1,62,62);}});paving.wrapS=paving.wrapT=T.RepeatWrapping;paving.repeat.set(3,12);const deck=artMaterial(0xffffff,{map:paving,roughness:.84});for(const side of [-1,1]){box(p,7,.10,70,side*11,.04,25,deck);for(const z of [4,14,24,44]){beam(p,[side*14,0,z],[side*14,4.4,z],.065,0x3b535f);const light=box(p,1.4,.10,.18,side*14,4.4,z,artMaterial(0xffddb0,{emissive:0xffd29a,emissiveIntensity:.7}));light.castShadow=false;}}
 const citySign=texture(1536,512,c=>{c.fillStyle='#eee7d7';c.fillRect(0,0,1536,512);c.fillStyle='#ae5b36';c.fillRect(0,0,1536,102);c.fillStyle='#fff6e3';c.font='bold 38px sans-serif';c.fillText('RIVERSIDE  /  CITY FLIGHT OPEN',75,67);c.fillStyle='#1d3b50';c.font='bold 132px SUIT,sans-serif';c.fillText('도시 대표 선발전',75,300,1380);c.font='32px SUIT,sans-serif';c.fillStyle='#566d73';c.fillText('강바람을 타고, 더 멀리',80,411);c.fillStyle='#b26842';c.fillRect(80,455,1380,5);});const sign=solid(p,new T.PlaneGeometry(20,6.8),artMaterial(0xffffff,{map:citySign,roughness:.78,side:T.DoubleSide}),0,9,86.5);sign.rotation.y=Math.PI;sign.scale.x=-1;box(p,20.3,.15,.35,0,12.45,86.6,0x344e5e);box(p,20.3,.15,.35,0,5.55,86.6,0x344e5e);for(const x of [-10.2,10.2])beam(p,[x,3.5,88],[x,12.5,88],.12,0x536b73);
}
function eventDetails(p,id,onChange){
 const blue=id==='world'?0x205d7e:id==='city'?0xad6742:0x427760;
 for(const side of [-1,1])for(const z of [7,15,23,31]){box(p,.12,.76,4.8,side*6.35,.72,z,blue);box(p,.15,.065,4.9,side*6.35,1.13,z,C.ivory);const badge=solid(p,new T.PlaneGeometry(.55,.65),crest(id!=='world'),side*6.26,.73,z);badge.rotation.y=side*Math.PI/2;}
}

function officialDesk(p,id,onChange){
 const x=-5,z=12;box(p,2.3,.85,1.1,x,.425,z,id==='world'?0x1b4f6c:0x496b5b);box(p,2.45,.09,1.2,x,.9,z,C.ivory);
 const sign=label('기록석',1.7,'FLIGHT OFFICIALS');sign.position.set(x,.48,z-.57);p.add(sign);
 for(const dx of [-.65,.65]){const screen=box(p,.37,.27,.045,x+dx,1.10,z-.06,0x264757);screen.rotation.x=-.2;box(p,.34,.014,.20,x+dx,.96,z-.30,0x8d9995);}
 spectators(p,[{x:x-.6,y:0,z:z+.85,yaw:Math.PI},{x:x+.6,y:0,z:z+.85,yaw:Math.PI}],onChange);
}

function schoolFestival(p){
 const weave=texture(256,256,c=>{c.fillStyle='#f5eedc';c.fillRect(0,0,256,256);for(let i=0;i<256;i+=4){c.fillStyle='#725a3820';c.fillRect(i,0,1,256);c.fillStyle='#ffffff48';c.fillRect(0,i,256,1);}});weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,6);
 for(const side of [-1,1]){const x=side*10,z=27;for(const dx of [-1.7,1.7])for(const dz of [-1.7,1.7])beam(p,[x+dx,0,z+dz],[x+dx,2.5,z+dz],.035,C.ivory);const roof=solid(p,new T.ConeGeometry(2.7,1,4),artMaterial(side<0?0xe6c16e:0x638b79,{map:weave,bumpMap:weave,bumpScale:.006,roughness:.96}),x,3,z);roof.rotation.y=Math.PI/4;for(const dx of [-1.91,1.91])for(const dz of [-1.91,1.91])beam(p,[x,3.51,z],[x+dx,2.51,z+dz],.015,0xf1e7cb);for(const dz of [-1.91,1.91])box(p,3.86,.055,.045,x,2.36,z+dz,0xf2e7cf);for(const dx of [-1.91,1.91])box(p,.045,.055,3.86,x+dx,2.36,z,0xf2e7cf);box(p,3.8,.25,3.8,x,2.48,z,side<0?0xf1dab0:0xb4c4ad);const title=label(side<0?'선수 대기':'응원 마당',2.7,'SCHOOL FESTIVAL');title.position.set(x,2.2,z-1.93);p.add(title);}
 for(const side of [-1,1]){beam(p,[side*7,0,27],[side*7,6.35,27],.045,C.ivory);solid(p,new T.SphereGeometry(.075,10,8),C.gold,side*7,6.4,27);}
 const line=[];for(let i=0;i<=30;i++)line.push([-7+i*14/30,6.3-.7*Math.sin(i/30*Math.PI),27]);tube(p,line,.018,0xd6c69b);
 const flags=[];for(let i=0;i<24;i++){const x=-6.7+i*.58;flags.push({p:[x,6.3-.7*Math.sin((x+7)/14*Math.PI),27],c:[0xe9c678,0x4a8297,0xe5eee2][i%3]});}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-.23,0,0,.23,0,0,0,-.42,0],3));geo.computeVertexNormals();instances(p,geo,artMaterial(0xffffff,{side:T.DoubleSide}),flags);
}

function cityProduction(p){
 const steel=0x5c6f70;
 for(const side of [-1,1]){const x=side*5.6,z=17;for(const dx of [-.32,.32])beam(p,[x+dx,0,z-.25],[x,1.25,z],.028,steel);beam(p,[x,0,z+.4],[x,1.25,z],.028,steel);box(p,.45,.32,.60,x,1.45,z,0x253b43);const lens=solid(p,new T.CylinderGeometry(.12,.12,.16,20),artMaterial(0x304b5d,{metalness:.6,roughness:.18}),x,1.45,z-.37);lens.rotation.x=Math.PI/2;}
}

function supportSections(p,id){
 const messages=id==='school'?['힘내!','날아라!','할 수 있어!']:id==='city'?['우리 동네 응원석','멋지게 날려요','도시 대표에 도전!']:['FLY HIGH','WORLD FINAL','ONE PAPER · BIG DREAM'];
 for(const side of [-1,1])for(let i=0;i<3;i++){const panel=label(messages[i],id==='city'?2.8:2.4,id==='school'?'OUR TEAM':id==='city'?'CITY SUPPORTERS':'PAPER FLIGHT');panel.position.set(side*7.4,1.25,13+i*8);panel.rotation.y=Math.PI+side*.5;p.add(panel);}
}

function campusWings(p){
 const masonry=texture(512,512,c=>{c.fillStyle='#b9a28c';c.fillRect(0,0,512,512);for(let row=0;row<22;row++)for(let col=-1;col<9;col++){const v=(row*13+col*7)%14;c.fillStyle='rgb('+(167+v)+','+(121+v)+','+(96+v)+')';c.fillRect(col*64+(row%2)*32,row*24,61,21);c.fillStyle='#fff5d60d';c.fillRect(col*64+(row%2)*32,row*24,61,2);}});masonry.wrapS=masonry.wrapT=T.RepeatWrapping;masonry.repeat.set(8,5);
 const wall=artMaterial(0xf5e2ce,{map:masonry,bumpMap:masonry,bumpScale:.022,roughness:.91}),glass=artMaterial(0x78939d,{metalness:.4,roughness:.24});
 const trackGrain=texture(512,512,c=>{c.fillStyle='#c38a70';c.fillRect(0,0,512,512);let seed=431;for(let i=0;i<16000;i++){seed=seed*16807%2147483647;const x=seed%512;seed=seed*16807%2147483647;c.fillStyle=i%3?'#f8d6b821':'#59362c28';c.fillRect(x,seed%512,1.3,1.3);}});trackGrain.wrapS=trackGrain.wrapT=T.RepeatWrapping;trackGrain.repeat.set(2,20);const track=artMaterial(0xffffff,{map:trackGrain,bumpMap:trackGrain,bumpScale:.008,roughness:.94});
 const windows=[],mullions=[],columns=[];
 for(const side of [-1,1]){
  const x=side*23;box(p,11,10,27,x,5,43,wall);box(p,11.8,.5,28,x,10.15,43,C.ivory);
  box(p,3.2,.20,25,side*16,3.35,43,0x526d70);box(p,3.3,.12,25.2,side*16,3.5,43,C.ivory);box(p,3.3,.12,25,side*16,.055,43,0xd7c5a7);
  for(const z of [32,36,40,44,48,52,55])columns.push({p:[side*14.6,1.7,z],s:[.16,3.4,.16]});
  for(const y of [2,5,8]){box(p,.16,.22,27.1,x-side*5.55,y-1.25,43,C.ivory);for(let i=0;i<9;i++){windows.push({p:[x-side*5.58,y,31+i*3],s:[.12,1.8,1.9]});mullions.push({p:[x-side*5.66,y,31+i*3],s:[.15,1.8,.08]});}}
  box(p,2.9,.09,48,side*5.1,.035,18,track);for(const x of [3.8,4.65,5.5,6.35])box(p,.035,.005,48,side*x,.085,18,0xf1e4c7);
  for(const z of [30,36,42,48]){box(p,1,.12,1,side*15,.06,z,0xe1d0b6);beam(p,[side*15,0,z],[side*15,3,z],.055,0x38545a);solid(p,new T.SphereGeometry(.22,14,10),artMaterial(0xffefca,{emissive:0xffe0a0,emissiveIntensity:.25}),side*15,3,z);}
 }
 instances(p,new T.BoxGeometry(1,1,1),material(C.ivory),columns);instances(p,new T.BoxGeometry(1,1,1),glass,windows);instances(p,new T.BoxGeometry(1,1,1),material(C.ivory),mullions);
}

function waterfront(p){
 const surface=texture(512,512,c=>{c.fillStyle='#6a979c';c.fillRect(0,0,512,512);let seed=9401;for(let i=0;i<10000;i++){seed=seed*16807%2147483647;const x=seed%512;seed=seed*16807%2147483647;c.fillStyle=i%2?'#ffffff08':'#102b4108';c.fillRect(x,seed%512,.8,.8);}});surface.wrapS=surface.wrapT=T.RepeatWrapping;surface.repeat.set(8,28);
 const court=solid(p,new T.PlaneGeometry(28,120),artMaterial(0xffffff,{map:surface,bumpMap:surface,bumpScale:.004,roughness:.88}),0,.003,35);court.rotation.x=-Math.PI/2;
 const lane=solid(p,new T.PlaneGeometry(6.9,120),artMaterial(0xb5d5d9,{map:surface,bumpMap:surface,bumpScale:.004,roughness:.88}),0,.005,35);lane.rotation.x=-Math.PI/2;lane.castShadow=false;
 for(const side of [-1,1])box(p,.6,.006,80,side*4.1,.008,25,0xb8c8c2);
 for(const side of [-1,1]){box(p,.065,.006,80,side*3.5,.008,25,0xf6e8ce);box(p,.3,.3,54,side*15,.15,20,0xd8c7ac);}
 const waterMap=texture(1024,512,c=>{const g=c.createLinearGradient(0,0,0,512);g.addColorStop(0,'#6b8a97');g.addColorStop(.5,'#b4a397');g.addColorStop(1,'#527985');c.fillStyle=g;c.fillRect(0,0,1024,512);for(let i=0;i<2600;i++){const x=(i*173)%1024,y=(i*67)%512;c.fillStyle=i%4?'#c9d7d020':'#f8d0a84a';c.fillRect(x,y,5+(i%20),.6);}});waterMap.wrapS=waterMap.wrapT=T.RepeatWrapping;waterMap.repeat.set(6,5);
 const river=solid(p,new T.PlaneGeometry(210,80),artMaterial(0xffffff,{map:waterMap,metalness:.28,roughness:.35}),0,.02,83);river.rotation.x=-Math.PI/2;river.castShadow=false;
 for(const side of [-1,1]){const posts=[];for(let z=34;z<=62;z+=2)posts.push({p:[side*15.3,.65,z],s:[.06,1.3,.06]});instances(p,new T.BoxGeometry(1,1,1),material(0x596b70),posts);beam(p,[side*15.3,1.3,34],[side*15.3,1.3,62],.045,0xb8b7a4);box(p,.025,.85,28,side*15.3,.75,48,artMaterial(0xa5c5d0,{transparent:true,opacity:.22,depthWrite:false,roughness:.2}));}
 box(p,160,.7,2.7,0,3.2,88,0xb5c0be);
 const bridgeWeb=[];for(let x=-80;x<80;x+=8){for(const side of [-1,1])bridgeWeb.push({p:[x+(side<0?2:6),2.48,86.62],s:[4.08,.075,.08],r:[0,0,side<0?.184:-.184]});}instances(p,new T.BoxGeometry(1,1,1),material(0x7b929a),bridgeWeb);box(p,160,.12,.12,0,2.10,86.62,0x8eabae);for(const x of [-68,-33,33,68]){box(p,1.5,2.9,3.4,x,1.45,88,0x8c9c9d);box(p,3.4,.38,3.6,x,2.65,88,0xc0c4bb);}

 for(const x of [-33,33]){for(const dx of [-1.3,1.3])beam(p,[x+dx,2,88],[x+dx*.45,16,88],.24,0xf0dcc3);box(p,3.2,.4,.6,x,13,88,0xf0dcc3);for(let i=-6;i<=6;i++)beam(p,[x,15,88],[x+i*4,3.6,88],.035,0xe8d9be);}
 for(let x=-77;x<=77;x+=3)box(p,.055,.85,.055,x,3.95,86.6,0xdfc69d);
}

function skyVault(p,night){
 const mat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,toneMapped:false,uniforms:{zenith:{value:new T.Color(night?0x070e24:0x4f6c9c)},horizon:{value:new T.Color(night?0x233958:0xf5b98e)},night:{value:night?1:0}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 zenith;uniform vec3 horizon;uniform float night;varying vec3 direction;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}float clouds(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(7.,13.);a*=.5;}return v;}void main(){vec3 d=normalize(direction);float h=pow(clamp(d.y,0.,1.),.42);vec3 c=mix(horizon,zenith,h);float sun=max(dot(d,normalize(vec3(.55,.16,1.))),0.);c+=vec3(1.,.62,.28)*(pow(sun,48.)*.23+pow(sun,1800.)*.7)*(1.-night);float cloud=smoothstep(.42,.68,clouds(vec2(atan(d.x,d.z)*5.,d.y*16.)+vec2(17.,3.)))*smoothstep(.005,.10,d.y)*(1.-night);c=mix(c,mix(vec3(.40,.34,.37),vec3(.80,.59,.43),sun),cloud*.48);gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'});
 const sky=new T.Mesh(new T.SphereGeometry(195,48,24),mat);sky.renderOrder=-100;p.add(sky);
}

function championshipBowl(p,onChange){
 seats(p,true,onChange);
 const steel=artMaterial(0x738594,{metalness:.65,roughness:.3}),concrete=artMaterial(0x2d425c),seating=[],people=[],tiers=[],seatBacks=[];
 for(let row=0;row<5;row++)for(let i=0;i<46;i++){const a=.12+(Math.PI-.24)*i/45,x=(12+row*.72)*Math.cos(a),z=25+(28+row*.72)*Math.sin(a),y=2.8+row*.45;seating.push({p:[x,y,z],s:[.62,.18,.60],r:[0,-a,0],c:i%11<2?0xdbc38b:0x397aa7});seatBacks.push({p:[x+Math.cos(a)*.24,y+.35,z+Math.sin(a)*.24],s:[.62,.5,.09],r:[0,Math.PI/2-a,0],c:i%11<2?0xdbc38b:0x397aa7});if((row===1&&i%3===0)||(row===3&&i%4===1)||(row===4&&i%6===2))people.push({x,y:y-.4,z,yaw:-Math.PI/2-a});}
 for(let row=0;row<5;row++)for(let i=0;i<72;i++){const a=.08+(Math.PI-.16)*i/72,b=.08+(Math.PI-.16)*(i+1)/72,y=2.6+row*.45,low=row?y-.45:0,point=(t,edge,h)=>[(12+row*.72+edge)*Math.cos(t),h,25+(28+row*.72+edge)*Math.sin(t)],aa=point(a,-.36,y),bb=point(b,-.36,y),cc=point(a,.36,y),dd=point(b,.36,y),ee=point(a,-.36,low),ff=point(b,-.36,low);tiers.push(...aa,...bb,...cc,...bb,...dd,...cc,...aa,...ee,...bb,...bb,...ee,...ff);}const tierGeo=new T.BufferGeometry();tierGeo.setAttribute('position',new T.Float32BufferAttribute(tiers,3));tierGeo.computeVertexNormals();solid(p,tierGeo,artMaterial(0x566a7c,{roughness:.89,side:T.DoubleSide}));instances(p,new T.BoxGeometry(1,1,1),material(0xffffff),seating);instances(p,seatBackGeometry(),material(0xffffff),seatBacks);spectators(p,people,onChange);
 for(const side of [-1,1]){const x=side*7.5,z=45;box(p,2.8,3.2,.15,x,1.6,z+1.15,0x0d1b2c);for(const dx of [-1.5,1.5])box(p,.28,3.35,2.6,x+dx,1.675,z,0x607b8e);box(p,3.3,.28,2.6,x,3.4,z,0x9ab4c2);box(p,2.7,.04,2.6,x,.025,z,0x3b536b);const strip=box(p,2.6,.035,1.6,x,3.22,z,new T.MeshBasicMaterial({color:0xffe4b0}));strip.castShadow=false;const panel=label(side<0?'선수 입장':'관중석',2.6,'WORLD FINAL',true);panel.position.set(x,2.96,z-1.32);p.add(panel);for(const dx of [-1.32,1.32])box(p,.055,2.45,.08,x+dx,1.25,z-1.32,artMaterial(0xb9dbe5,{emissive:0x549fba,emissiveIntensity:.35}));}
 const roofPoints=[],lipPoints=[];
 for(let i=0;i<=72;i++){const a=i*Math.PI*2/72;roofPoints.push([19*Math.cos(a),9.5+.8*Math.sin(a),24+43*Math.sin(a)]);lipPoints.push([14*Math.cos(a),8.5+.8*Math.sin(a),24+37*Math.sin(a)]);}
 tube(p,roofPoints,.18,steel);tube(p,lipPoints,.16,C.ivory);
 const vertices=[];for(let i=0;i<72;i++){const a=roofPoints[i],b=roofPoints[i+1],c=lipPoints[i],d=lipPoints[i+1];vertices.push(...a,...b,...c,...b,...d,...c);const lowerC=[c[0],c[1]-.32,c[2]],lowerD=[d[0],d[1]-.32,d[2]];vertices.push(...c,...d,...lowerC,...d,...lowerD,...lowerC);}const roof=new T.BufferGeometry();roof.setAttribute('position',new T.Float32BufferAttribute(vertices,3));roof.computeVertexNormals();solid(p,roof,artMaterial(0x66768b,{side:T.DoubleSide,metalness:.4,roughness:.45}));
 for(let i=0;i<24;i++){const a=i*Math.PI*2/24,x=19*Math.cos(a),z=24+43*Math.sin(a);beam(p,[x,0,z],[x,9.5+.8*Math.sin(a),z],.16,steel);beam(p,[x,9.5+.8*Math.sin(a),z],[14*Math.cos(a),8.5+.8*Math.sin(a),24+37*Math.sin(a)],.09,C.ivory);}
 for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12,outer=t=>[19*Math.cos(t),9.5+.8*Math.sin(t)-.25,24+43*Math.sin(t)],inner=t=>[14*Math.cos(t),8.5+.8*Math.sin(t)-.25,24+37*Math.sin(t)];beam(p,outer(a),inner(b),.045,0x93aab9);beam(p,inner(a),outer(b),.045,0x93aab9);}
 box(p,38,7,2,0,3.5,61,concrete);const screen=texture(2048,512,c=>{const g=c.createLinearGradient(0,0,2048,512);g.addColorStop(0,'#16334b');g.addColorStop(.5,'#285f7c');g.addColorStop(1,'#16334b');c.fillStyle=g;c.fillRect(0,0,2048,512);c.strokeStyle='#6be0ea';c.lineWidth=4;c.strokeRect(14,14,2020,484);c.fillStyle='#ecfaff';c.textAlign='center';c.font='bold 115px SUIT,sans-serif';c.fillText('세계 종이비행기 챔피언십',1024,280);c.font='36px sans-serif';c.fillStyle='#dfc681';c.fillText('WORLD FINAL',1024,125);for(let y=0;y<512;y+=5){c.fillStyle='#06172516';c.fillRect(0,y,2048,1);}});const sign=solid(p,new T.PlaneGeometry(22,5.5),new T.MeshBasicMaterial({map:screen,side:T.DoubleSide}),0,7.8,51.9);sign.rotation.y=Math.PI;sign.scale.x=-1;sign.castShadow=false;for(const x of [-8,8])beam(p,[x,9.9,52],[x,11,52],.07,0x99adbb);
}

function championshipFloor(p){
 const rubber=texture(512,512,c=>{c.fillStyle='#315979';c.fillRect(0,0,512,512);let seed=4901;for(let i=0;i<7000;i++){seed=seed*16807%2147483647;const x=seed%512;seed=seed*16807%2147483647;c.fillStyle=i%3?'#b8e0f50b':'#0717310c';c.fillRect(x,seed%512,.8,.8);}});rubber.wrapS=rubber.wrapT=T.RepeatWrapping;rubber.repeat.set(12,32);
 const court=solid(p,new T.PlaneGeometry(180,180),artMaterial(0xffffff,{map:rubber,roughness:.72}),0,.003,25);court.rotation.x=-Math.PI/2;
 const laneMap=texture(512,1024,c=>{const shade=c.createLinearGradient(0,0,512,0);shade.addColorStop(0,'#426b86');shade.addColorStop(.5,'#54839b');shade.addColorStop(1,'#426b86');c.fillStyle=shade;c.fillRect(0,0,512,1024);c.strokeStyle='#aac9d01b';c.lineWidth=1.2;for(let y=0;y<1024;y+=256){c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke();}for(const x of [128,256,384]){c.beginPath();c.moveTo(x,0);c.lineTo(x,1024);c.stroke();}});laneMap.wrapS=laneMap.wrapT=T.RepeatWrapping;laneMap.repeat.set(1,8);const lane=solid(p,new T.PlaneGeometry(7.1,72),artMaterial(0xffffff,{map:laneMap,roughness:.67}),0,.012,22);lane.name='championship-flight-lane';lane.rotation.x=-Math.PI/2;lane.castShadow=false;
 for(const side of [-1,1]){box(p,3.5,.01,72,side*5.4,.009,22,0x263e61);for(const x of [3.6,7.1])box(p,.065,.006,72,side*x,.017,22,0x9bd7e8);box(p,.09,.008,72,side*3.72,.019,22,artMaterial(0x9ccdde,{emissive:0x3d9dcb,emissiveIntensity:.35}));}
 
}

function arenaLighting(p){
 const rim=[];for(let i=0;i<=80;i++){const a=i*Math.PI/40;rim.push([14*Math.cos(a),2.3,24+37*Math.sin(a)]);}tube(p,rim,.07,new T.MeshBasicMaterial({color:0x7de3f2}));
 const glowMap=texture(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,63);g.addColorStop(0,'#fffef6ee');g.addColorStop(.12,'#c7edff66');g.addColorStop(1,'#6ab8ff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 for(const side of [-1,1])for(const z of [6,22,38,52]){const x=side*13;box(p,1.4,.45,.6,x,7.9,z,0x243c53);for(const dx of [-.4,0,.4]){const lamp=solid(p,new T.BoxGeometry(.28,.15,.4),new T.MeshBasicMaterial({color:0xebf7ff}),x+dx,7.65,z);lamp.castShadow=false;}const glow=new T.Sprite(new T.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,opacity:.55}));glow.position.set(x,7.65,z);glow.scale.set(3,3,1);p.add(glow);}
 for(const side of [-1,1]){const light=new T.SpotLight(0xd8edff,1600,85,Math.PI/3,1,2);light.position.set(side*12,11,18);light.target.position.set(0,0,18);p.add(light,light.target);}
}

function arenaGallery(p){
 const windows=texture(1024,256,c=>{c.fillStyle='#192e44';c.fillRect(0,0,1024,256);for(let i=0;i<16;i++){const g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,i%5===0?'#e4c28b':'#6c8f9e');g.addColorStop(1,i%5===0?'#8f795a':'#273f56');c.fillStyle=g;c.fillRect(i*64+5,14,54,225);c.fillStyle='#c7d5dc2a';c.fillRect(i*64+11,16,2,221);}});windows.wrapS=T.RepeatWrapping;windows.repeat.x=4;
 const positions=[],uv=[],columns=[];for(let i=0;i<64;i++){const a=i*Math.PI/64,b=(i+1)*Math.PI/64,point=(t,y)=>[17*Math.cos(t),y,24+40*Math.sin(t)],aa=point(a,4.9),bb=point(b,4.9),cc=point(a,8.1),dd=point(b,8.1);positions.push(...aa,...bb,...cc,...bb,...dd,...cc);uv.push(i/64,0,(i+1)/64,0,i/64,1,(i+1)/64,0,(i+1)/64,1,i/64,1);if(i%4===0)columns.push({p:point(a,6.5),s:[.13,3.5,.13]});}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();solid(p,geo,artMaterial(0xffffff,{map:windows,emissiveMap:windows,emissive:0xffffff,emissiveIntensity:.3,metalness:.25,roughness:.32,side:T.DoubleSide}));instances(p,new T.BoxGeometry(1,1,1),material(0xa5bac7),columns);
 for(const y of [4.8,8.25]){const points=[];for(let i=0;i<=64;i++){const a=i*Math.PI/64;points.push([17*Math.cos(a),y,24+40*Math.sin(a)]);}tube(p,points,.13,0xa4b9c6);}
}
