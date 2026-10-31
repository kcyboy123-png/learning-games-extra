// village-next 표현 계층. pocket/world.mjs의 헬퍼·모델·배칭·주민 리그를 가져와 18×18 격자 위에 올린다.
// 경제 값은 계산하지 않는다. sync(state)로 건물을 그리고 preview()로 배치 미리보기를 보여준다.
import * as T from '../lib/three.module.min.js';
import {TYPES,SIZE,RIVER,cells,at} from './core.mjs?v=animals8';
import {CELL,GROUND_Y,ROAD_Y,toWorld,facing,roadSet,origin,foot} from './grid.mjs?v=animals8';
import {naturalFeature,growthStage} from './landscape.mjs?v=animals8';
import {advancePersonRoute} from './residents.mjs?v=move1';
import {townscapeSites} from './townscape.mjs?v=visual1';
import {surfaceOptions} from './surfaces.mjs?v=quality1';
import {createMeadow,meadowSeason,disposeMeadow,gardenSites} from './meadow.mjs?v=quality1';
import {createSunlight} from './sunlight.mjs?v=quality1';
import {paintedTree,treeArtSeason,treeArtReady,treeArtView} from './tree-art.mjs?v=quality1';
import {addRabbitArt,updateRabbitArt} from './rabbit-art.mjs?v=quality1';

const materials=new Map(),geometries=new Map();let ghostMode=false;
const GHOST={transparent:true,opacity:.5,depthWrite:false};
function mat(c,o){if(ghostMode)o=Object.assign({},o,GHOST);const k=o?c+'|'+JSON.stringify(o):c;if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial(Object.assign({color:c,roughness:.82},surfaceOptions(c),o)));return materials.get(k);}
function geometry(k,create){if(!geometries.has(k))geometries.set(k,create());return geometries.get(k);}
function mesh(g,geo,c,x,y,z,sx=1,sy=1,sz=1,o){const m=new T.Mesh(geo,mat(c,o));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=!ghostMode;m.receiveShadow=!ghostMode;g.add(m);return m;}
const FLAT={flatShading:true},WET={roughness:.36,metalness:.05},GLASS={roughness:.26,metalness:.08},GLOW={emissive:'#ffd27f',emissiveIntensity:1.1,roughness:.5},WATER={transparent:true,opacity:.66,roughness:.28,metalness:.02},SHADE={transparent:true,opacity:.17,depthWrite:false};
const box=(g,c,x,y,z,w,h,d,o)=>mesh(g,geometry('box',()=>new T.BoxGeometry(1,1,1)),c,x,y,z,w,h,d,o);
const ball=(g,c,x,y,z,w,h=w,d=w,o)=>mesh(g,geometry('ball',()=>new T.SphereGeometry(1,12,8)),c,x,y,z,w,h,d,o);
const dot=(g,c,x,y,z,w,h=w,d=w,o)=>mesh(g,geometry('dot',()=>new T.SphereGeometry(1,6,4)),c,x,y,z,w,h,d,o); // 꽃잎·작은 열매용 저폴리 구
const cylinder=(g,c,x,y,z,r,h,o)=>mesh(g,geometry('cyl',()=>new T.CylinderGeometry(1,1,1,12)),c,x,y,z,r,h,r,o);
const taper=(g,c,x,y,z,r,h,o)=>mesh(g,geometry('taper',()=>new T.CylinderGeometry(.55,1,1,8)),c,x,y,z,r,h,r,o);
const cone=(g,c,x,y,z,r,h,o)=>mesh(g,geometry('cone',()=>new T.ConeGeometry(1,1,6)),c,x,y,z,r,h,r,o);
const clump=(g,c,x,y,z,w,h=w,d=w)=>mesh(g,geometry('foliage',()=>{const geo=new T.SphereGeometry(1,12,8),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.06*Math.sin(x*13+y*9)*Math.cos(z*11);p.setXYZ(i,x*r,y*r,z*r);}geo.computeVertexNormals();return geo;}),c,x,y,z,w,h,d);
const pebble=(g,c,x,y,z,w,h=w,d=w,o)=>mesh(g,geometry('pebble',()=>new T.DodecahedronGeometry(1,0)),c,x,y,z,w,h,d,o);
const wedge=(g,c,x,y,z,w,h,d)=>mesh(g,geometry('wedge',()=>{const s=new T.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,1);s.closePath();const e=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});e.translate(0,0,-.5);return e;}),c,x,y,z,w,h,d);
function shade(g,x,y,z,r){
 if(!materials.has('contact-shadow')){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.55,'#777777');gradient.addColorStop(1,'#000000');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const alphaMap=new T.CanvasTexture(c);alphaMap.userData.shared=true;materials.set('contact-shadow',new T.MeshBasicMaterial({color:'#37412c',alphaMap,opacity:.30,transparent:true,depthWrite:false}));}
 const m=new T.Mesh(geometry('disc',()=>{const d=new T.CircleGeometry(1,24);d.rotateX(-Math.PI/2);return d;}),materials.get('contact-shadow'));m.position.set(x,y,z);m.scale.set(r,1,r*.85);g.add(m);return m;
}
function rounded(g,c,x,y,z,w,d,h,r=.4,o){const s=new T.Shape();s.moveTo(-w/2+r,-d/2);s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
 const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.07,bevelThickness:.07,curveSegments:6});geo.rotateX(-Math.PI/2);geo.userData.owned=true;return mesh(g,geo,c,x,y,z,1,1,1,o);}
function blob(g,c,x,y,z,w,d,h,seed,wob=.035,bevel=.08,o){const s=new T.Shape(),n=96;for(let i=0;i<n;i++){const t=i/n*Math.PI*2,cs=Math.cos(t),sn=Math.sin(t);const k=1+wob*(Math.sin(seed+t*3)*.5+Math.sin(seed*1.7+t*5)*.3+Math.sin(seed*2.3+t*11)*.2);const px=Math.sign(cs)*Math.pow(Math.abs(cs),.5)*w/2*k,pz=Math.sign(sn)*Math.pow(Math.abs(sn),.5)*d/2*k;i?s.lineTo(px,pz):s.moveTo(px,pz);}s.closePath();
 const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:3});geo.rotateX(-Math.PI/2);geo.userData.owned=true;return mesh(g,geo,c,x,y,z,1,1,1,o);}
const signMaps=new Map();
function label(g,text,x,y,z,w,h,bg='#fff6de',fg='#345347',size=68){
 const key=JSON.stringify([text,bg,fg,size,w,h]);let map=signMaps.get(key);
 if(!map){const c=document.createElement('canvas');c.height=192;c.width=Math.round(192*w/h);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';let fs=Math.min(128,size*1.65);ctx.font=`700 ${fs}px SUIT,"Malgun Gothic",sans-serif`;while(ctx.measureText(text).width>c.width*.86&&fs>18){fs-=2;ctx.font=`700 ${fs}px SUIT,"Malgun Gothic",sans-serif`;}ctx.fillText(text,c.width/2,c.height*.51);map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;map.userData.shared=true;signMaps.set(key,map);}
 const mk='sign:'+key+':'+ghostMode;if(!materials.has(mk))materials.set(mk,new T.MeshStandardMaterial(Object.assign({map,roughness:.9},ghostMode?GHOST:{})));
 const m=new T.Mesh(geometry(`sign:${w}:${h}`,()=>new T.PlaneGeometry(w,h)),materials.get(mk));m.position.set(x,y,z);m.castShadow=false;g.add(m);return m;
}

// ---- 식생 ----
function tree(g,x,z,s=1,pink=false,stage=2){const painted=paintedTree(g,x,z,s,pink,stage);if(painted)return painted;const a=new T.Group();a.position.set(x,0,z);a.scale.setScalar(s*[.45,.75,1][stage]);g.add(a);shade(a,0,.11/s,0,1);taper(a,'#7a5b41',0,.78,0,.14,1.6);
 for(let k=0;k<3;k++){const t=k*2.1+.4,r=taper(a,'#6f5139',Math.sin(t)*.13,.16,Math.cos(t)*.13,.07,.32);r.rotation.set(Math.cos(t)*.55,0,-Math.sin(t)*.55);}
 for(let k=0;k<3;k++){const t=k*2.1+1,b=taper(a,'#6f5139',Math.sin(t)*.27,1.38+k*.12,Math.cos(t)*.27,.055,.75);b.rotation.set(Math.cos(t)*.8,0,-Math.sin(t)*.8);}
 const cols=pink?['#efb5c7','#f9d6df','#dd9fb5']:['#81b56c','#a3c77a','#679f63'];clump(a,cols[0],-.06,1.98,0,.65,.61,.62);
 for(let i=0;i<6;i++){const t=i*1.047+.3;clump(a,cols[(i+1)%3],Math.sin(t)*.51,1.68+(i%2)*.18,Math.cos(t)*.49,.43,.38+(i%2)*.04,.43);}
 for(let i=0;i<4;i++){const t=i*1.57+.9;clump(a,cols[(i+2)%3],Math.sin(t)*.34,2.24+(i%2)*.07,Math.cos(t)*.31,.34,.29,.35);}
 if(pink){for(let i=0;i<14;i++){const t=i*2.399,y=1.5+(i%5)*.19,r=.58+Math.sin(i*1.3)*.12;clump(a,cols[i%3],Math.sin(t)*r,y,Math.cos(t)*r,.18,.14,.19);for(let j=0;j<3;j++)dot(a,'#fbe4ea',Math.sin(t)*r+(j-1)*.05,y+.11,Math.cos(t)*r,.038,.021,.038);}
  for(let i=0;i<14;i++){const t=i*2.4;dot(a,'#fbe4ea',Math.sin(t)*(.5+i%3*.16),.13,Math.cos(t)*(.6+i%4*.13),.065,.009,.04);}}
 if(pink)for(let i=0;i<72;i++){const t=i*2.399,ny=-.35+(i/71)*1.35,r=Math.sqrt(1-ny*ny),nx=Math.sin(t)*r,nz=Math.cos(t)*r;canopyBloom(a,cols[i%3],nx*.94,1.96+ny*.72,nz*.92,.13+(i%3)*.018,nx,ny,nz);}
 for(let i=0;i<(pink?24:5);i++){const t=i*2.4+.7;dot(a,pink?'#fbe4ea':'#b9d48a',Math.sin(t)*.62,1.75+(i%3)*.25,Math.cos(t)*.6,.11,.09,.11);}return a;}
// Shared 40-triangle rosette, batched with tree details rather than individual textures.
function canopyBloom(g,c,x,y,z,r,nx,ny,nz){const geo=geometry('canopy-bloom',()=>{const p=[];for(let k=0;k<5;k++){const a=k*Math.PI*2/5;for(let j=0;j<8;j++){const v=t=>{const u=Math.cos(t)*.35,w=.43+Math.sin(t)*.53;return[Math.cos(a)*w-Math.sin(a)*u,Math.sin(a)*w+Math.cos(a)*u,.08*Math.cos(t)];};p.push(Math.cos(a)*.43,Math.sin(a)*.43,.04,...v((j+1)*Math.PI/4),...v(j*Math.PI/4));}}const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(p,3));b.computeVertexNormals();return b;});const m=mesh(g,geo,c,x,y,z,r,r,r);m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(nx,ny,nz).normalize());m.castShadow=false;}
function tuft(g,x,z,s=1){for(let k=0;k<5;k++){const t=k*1.26+x*3,h=(.22+(k%3)*.07)*s;const c=cone(g,k%2?'#86a95c':'#9bbd70',x+Math.sin(t)*.06*s,.1+h/2,z+Math.cos(t)*.06*s,.04*s,h);c.rotation.set(Math.cos(t)*.35,0,-Math.sin(t)*.35);}}
function flower(g,x,z,c='#f0b1bb'){cylinder(g,'#6d9254',x,.24,z,.018,.28);const leaf=ball(g,'#7fa857',x+.05,.18,z+.02,.035,.02,.095);leaf.rotation.set(.3,.5,-.7);for(let k=0;k<5;k++)mesh(g,geometry('soft-petal',()=>new T.SphereGeometry(1,6,4)),c,x+Math.sin(k*1.256)*.075,.38,z+Math.cos(k*1.256)*.075,.065,.028,.065);dot(g,'#f0c85e',x,.4,z,.035,.028,.035);}
function shrub(g,x,z,s=1){clump(g,'#6c934b',x,.18*s,z,.26*s,.22*s,.27*s);for(let i=0;i<9;i++){const a=i*2.399,r=i<6?.22:.12,y=i<6?.19:.34;const leaf=ball(g,i%2?'#99b56c':'#829f53',x+Math.sin(a)*r*s,y*s,z+Math.cos(a)*r*s,.11*s,.055*s,.16*s);leaf.rotation.set(.25,a,.2);}return g;}
function patch(g,x,z,c){flower(g,x,z,c);flower(g,x+.16,z+.1,c);flower(g,x-.13,z+.14,c);tuft(g,x+.1,z-.1,.8);for(let i=0;i<3;i++){const a=i*2.1,leaf=ball(g,'#8ea969',x-.08+Math.sin(a)*.07,.12,z+.2+Math.cos(a)*.07,.08,.025,.16);leaf.rotation.y=a;}}
function pot(g,x,z){taper(g,'#c08462',x,.26,z,.17,.32);cylinder(g,'#a86f52',x,.4,z,.18,.04);clump(g,'#6f9955',x,.5,z,.22,.18,.22);flower(g,x,z,'#f3d578');}
function windowBox(g,x,y,z,w=.70){
 softBlock(g,'#bd9869',x,y,z,w,.20,.24,.035);box(g,'#6f5139',x,y+.10,z,w-.09,.025,.17);softBlock(g,'#d6bb8d',x,y+.08,z+.12,w+.04,.05,.045,.015);
 for(let i=0;i<3;i++){const px=x+(i-1)*w*.27;clump(g,i%2?'#99b56c':'#7fa857',px,y+.21,z,.14,.12,.15);for(let j=0;j<3;j++)canopyBloom(g,i%2?'#fff2ce':'#f0b1bb',px+(j-1)*.06,y+.29+j%2*.035,z+.08,.055,0,.6,1);}
}

// ---- 건축 부품 (pocket 그대로) ----
function roof(g,x,y,z,w,d,c,c2){const a=new T.Group();a.position.set(x,y,z);g.add(a);const W=w/2+.22,H=.78,N=6,D=d+.3;
 for(const side of[-1,1]){let px=W,py=0;for(let i=1;i<=N;i++){const t=i/N,nx=W*(1-t),ny=H*Math.pow(t,1.45);const cx=(px+nx)/2,cy=(py+ny)/2,len=Math.hypot(nx-px,ny-py),ang=Math.atan2(ny-py,px-nx);const seg=new T.Group();seg.position.set(side*cx,cy,0);seg.rotation.z=-side*ang;a.add(seg);box(seg,c,0,0,0,len+.03,.11,D);const n=Math.round(D/.23);for(let k=0;k<=n;k++){const r=cylinder(seg,c2,0,.07,-D/2+k*(D/n),.038,len+.02);r.rotation.z=Math.PI/2;}px=nx;py=ny;}
  const n=Math.round(D/.3);for(let k=0;k<=n;k++)box(a,'#8e6c4c',side*(W-.26),-.1,-D/2+.08+k*(D-.16)/n,.5,.07,.07);}
 box(a,'#324b50',0,H+.05,0,.26,.15,D+.14);for(const s of[-1,1])ball(a,'#324b50',0,H+.1,s*(D/2+.07),.14,.1,.12);return a;}
function casement(g,x,y,z,w=.65,h=.65){box(g,'#6f6652',x,y,z,w+.17,h+.17,.08);box(g,'#f1dfb0',x,y,z+.025,w+.12,h+.12,.1);box(g,'#9cab83',x,y,z+.085,w,h,.025,GLASS);box(g,'#c1d9cb',x-w*.2,y+h*.13,z+.102,w*.25,h*.64,.008,GLASS);box(g,'#f6ead0',x,y,z+.11,.045,h,.035);box(g,'#f6ead0',x,y,z+.11,w,.045,.035);box(g,'#c9a780',x,y-h/2-.09,z+.07,w+.24,.06,.2);}
function door(g,x,y,z,w=.65,h=1.1){const frame=box(g,'#8e6b4a',x,y,z,w+.12,h+.08,.08);frame.name='entry-door';box(g,'#a9805a',x,y-.02,z+.03,w,h,.05);box(g,'#dccaa0',x,y+.22,z+.065,w*.62,.38,.02,GLASS);ball(g,'#e5c36a',x+w*.36,y-.1,z+.07,.035);}
function bricks(g,x,y,z,w,rows=2){const n=Math.floor(w/.26);for(let r=0;r<rows;r++)for(let i=0;i<n;i++){const off=r%2?.13:0;box(g,(i+r)%3?'#bf7f62':'#ad7257',x-w/2+.13+off+i*.26,y+r*.11,z,.24,.095,.04);}}
function brickSkirt(a,w,d,y){bricks(a,0,y,d/2+.02,w);for(const side of[-1,1]){const s=new T.Group();s.position.x=side*(w/2+.02);s.rotation.y=side*Math.PI/2;a.add(s);bricks(s,0,y,0,d);}}
// 모델 원점은 바닥 중앙, 문은 +z. finish 배열은 완공 때만 보이는 장식.
// The cottage, doorstep and road share world axes; camera rotation never moves the building.
function softBlock(g,c,x,y,z,w,h,d,r=.045,o){
 const geo=geometry(`soft:${w}:${h}:${d}:${r}`,()=>{const s=new T.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();const b=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});b.translate(0,0,-d/2+r);return b;});
 return mesh(g,geo,c,x,y,z,1,1,1,o);
}
function archedPanel(g,c,x,y,z,w,h,d){
 const geo=geometry(`arch:${w}:${h}:${d}`,()=>{const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);const e=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:12});return e;});
 return mesh(g,geo,c,x,y,z);
}
function cottageWindow(g,x,y,z,w=.72,h=.85){
 archedPanel(g,'#8e6b4a',x,y,z,w+.14,h+.12,.07);archedPanel(g,'#f1dfb0',x,y+.045,z+.075,w+.05,h+.04,.035);
 const glass=archedPanel(g,'#ddc990',x,y+.09,z+.116,w-.06,h-.05,.014);glass.material=mat('#ddc990',{emissive:'#e6b46d',emissiveIntensity:.13,roughness:.45});box(g,'#fff0ca',x,y+h*.53,z+.145,.045,h-.12,.04);box(g,'#fff0ca',x,y+h*.47,z+.145,w-.09,.045,.04);
 softBlock(g,'#bd9869',x,y-.01,z+.15,w+.24,.08,.3,.025);
 const bed=new T.Group();bed.position.set(x,y-.11,z+.17);g.add(bed);softBlock(bed,'#bd9869',0,0,0,w+.12,.15,.23,.035);
 for(let i=0;i<4;i++){const px=(i-1.5)*w/4;clump(bed,'#81b56c',px,.14,0,.14,.12,.13);for(let j=0;j<3;j++)dot(bed,i%2?'#fff2ce':'#f0b1bb',px+(j-1)*.047,.23+j%2*.035,.05,.046,.03,.046);}
}
function cottageRoof(g,y,w=3.42,d=2.62,power=false,wallW=2.88,wallD=2.38){
 const a=new T.Group();a.position.set(0,y,-.15);g.add(a);const half=d/2,n=Math.max(14,Math.round(w/.245)),pitch=w/n;
 const rise=z=>.60*Math.pow(1-Math.min(1,Math.abs(z)/half),1.62)+.15*Math.pow(Math.abs(z)/half,6);
 const tile=geometry(`cottage-tile:${w}:${d}`,()=>{const pos=[],uv=[],idx=[];for(let i=0;i<=32;i++){const z=-half+d*i/32;for(let j=0;j<=8;j++){const angle=j*Math.PI/8,lap=.012*Math.cos(i/32*Math.PI*12);pos.push(Math.cos(angle)*pitch*.48,rise(z)+Math.sin(angle)*(.115+lap),z);uv.push(j/8,i/32);}}for(let i=0;i<32;i++)for(let j=0;j<8;j++){const k=i*9+j;idx.push(k,k+1,k+9,k+1,k+10,k+9);}const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(pos,3));b.setAttribute('uv',new T.Float32BufferAttribute(uv,2));b.setIndex(idx);b.computeVertexNormals();return b;});
 const underside=geometry(`cottage-soffit:${w}:${d}`,()=>{const s=new T.Shape();s.moveTo(-half,rise(-half)-.09);for(let i=0;i<=20;i++){const z=-half+d*i/20;s.lineTo(z,rise(z));}s.lineTo(half,rise(half)-.09);for(let i=20;i>=0;i--){const z=-half+d*i/20;s.lineTo(z,rise(z)-.09);}s.closePath();const b=new T.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});b.rotateY(Math.PI/2);b.translate(-w/2,0,0);return b;});
 mesh(a,underside,'#385443',0,0,0);
 const gable=geometry(`cottage-gable:${d}:${wallW}:${wallD}`,()=>{const s=new T.Shape();s.moveTo(-wallD/2,-.09);s.lineTo(wallD/2,-.09);for(let i=0;i<=20;i++){const z=wallD/2-i*wallD/20;s.lineTo(z,rise(z)-.09);}s.closePath();const b=new T.ExtrudeGeometry(s,{depth:wallW,bevelEnabled:false});b.rotateY(Math.PI/2);b.translate(-wallW/2,0,0);return b;});mesh(a,gable,'#f1e3c3',0,0,0);
 for(let i=0;i<n;i++){const x=-w/2+(i+.5)*pitch,c=power?(i%4?'#4a6a70':'#3a5459'):(i%4?'#5c8170':'#4d7362');mesh(a,tile,c,x,0,0,1,1,1,{side:T.DoubleSide,roughness:.72});for(const side of[-1,1]){ball(a,c,x,rise(half)+.025,side*(half+.006),pitch*.48,.095,.042);ball(a,'#80976b',x,rise(half)+.025,side*(half+.043),.045,.045,.009);const r=cylinder(a,'#d6bb8d',x,-.035,side*(half-.12),.044,.25);r.rotation.x=Math.PI/2;}}
 softBlock(a,'#385443',0,.71,0,w+.09,.20,.24,.055);for(const side of[-1,1]){const r=softBlock(a,'#5c8170',side*(w/2-.02),.76,0,.36,.17,.26,.045);r.rotation.z=side*.2;}
 return a;
}
function alignedCottage(a,type='house'){
 const power=type==='generator',shop=type==='snack',h=power?1.5:1.72,finish=[];
 shade(a,0,.021,.10,1.91);rounded(a,'#b8ac90',0,.01,.04,3.34,2.84,.035,.29);softBlock(a,'#c8b693',0,.16,-.15,2.98,.26,2.48,.075);softBlock(a,'#f1e3c3',0,.23+h/2,-.15,2.88,h,2.38,.10);const skirt=new T.Group();skirt.position.z=-.15;a.add(skirt);brickSkirt(skirt,2.88,2.38,.32);
 for(const x of[-1.38,1.38])for(const z of[-1.32,1.02])softBlock(a,'#a9805a',x,1,z,.12,1.8,.12,.025);
 for(const z of[-1.36,1.06])softBlock(a,'#bd9869',0,h+.25,z,2.94,.12,.12,.025);
 const roofGroup=cottageRoof(a,h+.28,power?3.18:3.42,power?2.82:2.92,power);if(power)roofGroup.scale.y=.78;
 const decor=new T.Group();a.add(decor);finish.push(decor);
 if(power){
  softBlock(a,'#6f7f82',0,.86,1.07,1.75,1.15,.13,.04);for(const x of[-.45,.45]){softBlock(a,'#96a39c',x,.9,1.16,.7,.91,.12,.035);for(let i=0;i<5;i++)box(a,'#5c6b6e',x,.59+i*.12,1.23,.52,.025,.02);ball(a,'#e5c36a',x+.2,.81,1.25,.03);}
  label(decor,'마을 전력소',0,1.6,1.12,1.35,.22,'#547668','#fff3d6',55);
 }else if(shop){
  cottageWindow(a,-.59,.64,1.06,1.12,1.03);door(a,.85,.82,1.105,.62,1.22);
  softBlock(decor,'#a85f4a',0,1.7,1.16,2.72,.34,.13,.035);label(decor,'개울 분식',0,1.7,1.24,2.35,.25,'#a85f4a','#fff1c9',65);
  for(let i=0;i<12;i++){const c=i%2?'#f6e7c3':'#d9846d',x=-1.32+i*.24;const m=softBlock(decor,c,x,1.45,1.49,.235,.055,.67,.018);m.rotation.x=.17;ball(decor,c,x,1.36,1.81,.117,.065,.035);}
  // A projecting sign remains recognisable when the neighbouring cottage masks the main sign.
  const sign=new T.Group();sign.position.set(-1.53,1.73,1.34);sign.rotation.y=-Math.PI/2;decor.add(sign);
  softBlock(sign,'#8e6b4a',0,0,0,.57,.53,.07,.045);label(sign,'분식',0,0,.046,.48,.43,'#bf735d','#fff4d4',56);label(sign,'분식',0,0,-.046,.48,.43,'#bf735d','#fff4d4',56).rotation.y=Math.PI;
  box(decor,'#8e6b4a',-1.53,2.02,1.18,.055,.055,.52);for(const z of[1.18,1.48])box(decor,'#8e6b4a',-1.53,1.98,z,.018,.12,.018);
 }else{
  archedPanel(a,'#8e6b4a',.35,.28,1.065,.77,1.29,.08);archedPanel(a,'#bd9869',.35,.32,1.15,.64,1.2,.025);archedPanel(a,'#dbe1bf',.35,.91,1.185,.39,.5,.014);ball(a,'#e5c36a',.59,.83,1.22,.038);
  cottageWindow(a,-.79,.72,1.07,.78,.94);label(decor,'12',.99,1.61,1.09,.2,.15,'#547668','#fff3d6',50);
 }
 // Side and rear facades remain detailed when the road puts the entrance away from the camera.
 for(const side of[-1,1]){const wall=new T.Group();wall.position.set(side*1.45,0,-.15);wall.rotation.y=side*Math.PI/2;decor.add(wall);cottageWindow(wall,0,.63,0,1.03,1.04);}
 const rear=new T.Group();rear.rotation.y=Math.PI;rear.position.z=-1.355;decor.add(rear);cottageWindow(rear,0,.62,0,1.22,1.06);
 const doorX=shop?.85:power?0:.35;
 for(const [z,y,depth] of[[1.29,.14,.35],[1.6,.07,.28],[1.88,.02,.23]])softBlock(a,'#b8ac90',doorX,y,z,.82,.08,depth,.025);
 const path=new T.Object3D();path.name='road-threshold';path.position.set(doorX,.065,2);a.add(path);
 for(const x of[-1.25,1.3]){const potGroup=new T.Group();potGroup.position.set(x,.06,1.37);potGroup.scale.setScalar(.85);decor.add(potGroup);pot(potGroup,0,0);}
 for(const side of[-1,1])for(let i=0;i<3;i++){const x=side*1.64,z=-.74+i*.60;clump(decor,i%2?'#8cae62':'#6c934b',x,.18,z,.18,.19,.25);for(let j=0;j<3;j++){const leaf=ball(decor,'#a8bd70',x+Math.sin(j*2.4)*.10,.30,z+Math.cos(j*2.4)*.13,.075,.035,.12);leaf.rotation.y=j*2.4;}flower(decor,x,z,i%2?'#fff2ce':'#f0b1bb');}
 if(!power){softBlock(decor,'#bf7f62',-.87,h+.6,-.6,.3,.56,.35,.04);softBlock(decor,'#b8ac90',-.87,h+.9,-.6,.42,.1,.46,.035);}
 return finish;
}
function gardenModel(a,stage){
 tree(a,-.6,-.3,.9,true,stage);
 cylinder(a,'#b9aa7d',-.6,.11,-.3,.64,.05);
 if(stage>0){for(let j=0;j<7;j++){const t=j*.9;flower(a,-.6+Math.sin(t)*.58,-.3+Math.cos(t)*.58,j%2?'#fff2ce':'#e9adba');}patch(a,.9,-.6,'#e9adba');patch(a,.3,-.9,'#efd687');}
 if(stage===2){bench(a,.4,.65);for(let j=0;j<4;j++)pebble(a,'#d6cbb0',-.6+Math.sin(j*1.57)*.72,.12,-.3+Math.cos(j*1.57)*.72,.13,.07,.12);}
 pebble(a,'#b5ad96',1.1,.12,-.4,.2,.1,.18);tuft(a,1.2,.9,.8);return[];
}
function roadModel(a){box(a,'#cbb990',0,.006,0,CELL,.04,CELL);for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=-.9+c*.6,z=-.9+r*.6;box(a,['#ead7ac','#eedfb9','#e5cf9f'][(r+c*2)%3],x,.033,z,.592,.014,.592);}return[];}
// ---- 공통 부품: 납작 지붕 상가/공공건물, 창 줄, 간판 ----
function flat(a,w,h,d,wall,trim,base='#b8ac90',pitched=false){
 rounded(a,base,0,0,0,w+.7,d+.6,.12,.15);softBlock(a,'#9e8f78',0,.2,0,w+.08,.22,d+.08,.04);softBlock(a,wall,0,h/2+.2,0,w,h,d,.09);brickSkirt(a,w,d,.38);
 softBlock(a,trim,0,h+.28,0,w+.20,.18,d+.20,.05);
 if(!pitched){softBlock(a,'#d9d2c0',0,h+.4,0,w-.2,.1,d-.2,.025);
 for(const side of[-1,1])softBlock(a,trim,side*(w/2-.08),h+.52,0,.13,.20,d-.12,.03);
 softBlock(a,trim,0,h+.52,-d/2+.08,w-.12,.20,.13,.03);
 softBlock(a,'#8d9a9c',w/3,h+.62,-d/4,.45,.32,.40,.045);for(let i=0;i<4;i++)box(a,'#5b6660',w/3-.14+i*.09,h+.66,-d/4+.206,.035,.12,.012);}
 // Public facilities keep their own silhouettes but carry detail on every visible facade.
 const floors=h>3?3:h>2.25?2:1;
 for(const side of[-1,1]){const face=new T.Group();face.position.x=side*w/2;face.rotation.y=side*Math.PI/2;a.add(face);
  for(let f=0;f<floors;f++)for(const z of[-d*.24,d*.24]){const y=.82+f*(h-.72)/floors;casement(face,z,y,.01,.52,.55);if(floors>1&&f===floors-1)windowBox(face,z,y-.50,.12,.64);}
  box(face,'#bd9869',0,.44,.05,d-.22,.07,.07);
  for(const z of[-d*.30,d*.30]){clump(face,'#7fa857',z,.24,.23,.22,.19,.14);flower(face,z,.23,'#fff2ce');}
 }
 const rear=new T.Group();rear.position.z=-d/2;rear.rotation.y=Math.PI;a.add(rear);
 for(let f=0;f<floors;f++)for(const x of[-w*.27,w*.27]){const y=.82+f*(h-.72)/floors;casement(rear,x,y,.01,.58,.55);if(f===floors-1)windowBox(rear,x,y-.50,.12,.70);}
 for(const side of[-1,1]){softBlock(a,'#c8b693',side*(w/2-.08),h/2+.22,d/2+.025,.12,h-.12,.09,.025);}
}
function winRow(a,y,z,w,n,wi=.55,hi=.6){for(let i=0;i<n;i++)casement(a,-w/2+w/(n+1)*(i+1),y,z,wi,hi);}
function sign(a,text,y,z,w,bg,fg,size=68){box(a,bg,0,y,z-.08,w+.3,.44,.14);for(const k of[-1,1])box(a,'#e7c784',0,y+k*.22,z-.07,w+.3,.03,.15);label(a,text,0,y,z,w,.32,bg,fg,size);}
function lantern(a,x,y,z,c='#d9534f'){cylinder(a,'#5a4a3a',x,y+.2,z,.015,.3);ball(a,c,x,y,z,.11,.13,.11,GLOW);}
function apartmentModel(a){const f=[];flat(a,3.0,3.3,2.2,'#e8dcc4','#8b6a4a');for(const y of[1.0,2.0,3.0])winRow(a,y,1.11,3.0,3,.5,.5);for(const y of[.75,1.75,2.75])box(a,'#8d7a63',0,y,1.3,2.6,.05,.4);for(const y of[.9,1.9,2.9])for(let i=0;i<8;i++)box(a,'#7c6b55',-1.2+i*.34,y,1.48,.03,.3,.03);box(a,'#cfc3aa',1.0,2.0,-.6,.8,3.6,.8);door(a,-.8,.75,1.11,.6,1.05);const g=new T.Group();a.add(g);f.push(g);sign(g,'개울 빌라',3.75,1.16,1.6,'#5f7b6b','#fff1c9',60);pot(g,1.3,1.5);
 for(const y of[.76,1.76,2.76])for(const x of[-.76,.70])windowBox(g,x,y,1.55,.64);
 const roofGarden=new T.Group();roofGarden.position.set(-.40,3.76,-.04);g.add(roofGarden);box(roofGarden,'#d6bb8d',0,0,0,1.65,.06,1.45);
 for(const x of[-.7,.7])for(const z of[-.58,.58])box(roofGarden,'#bd9869',x,.44,z,.055,.88,.055);for(let i=0;i<6;i++)box(roofGarden,'#e1cfad',-.75+i*.3,.91,0,.09,.05,1.48);
 for(let i=0;i<4;i++){clump(roofGarden,'#7fa857',-.6+i*.4,1.01,-.5,.26,.13,.27);windowBox(roofGarden,-.57+i*.38,.10,.60,.32);}
 return f;}
function westernModel(a){const f=[];flat(a,2.9,1.9,2.1,'#f5e9d2','#7d6b52');winRow(a,1.05,1.07,2.9,2,.8,.7);door(a,0,.78,1.07,.6,1.1);const g=new T.Group();a.add(g);f.push(g);sign(g,'양식당',2.4,1.15,1.9,'#8c3b3b','#ffe8c9');for(let i=0;i<10;i++){const m=box(g,i%2?'#f6e7c3':'#b23a3a',-1.25+i*.28,1.72,1.45,.28,.06,.7);m.rotation.x=.2;}for(const x of[-1.2,1.2])cylinder(g,'#956e51',x,1.0,1.75,.03,1.5);pot(g,1.4,1.4);pot(g,-1.4,1.4);return f;}
function japaneseModel(a){const f=[];rounded(a,'#9d9480',0,0,0,3.5,2.7,.12,.15);box(a,'#6b4f3a',0,1.0,0,2.9,1.7,2.1);for(const x of[-1.4,-.5,.5,1.4])box(a,'#3f2e22',x,1.0,1.07,.08,1.7,.06);box(a,'#3f2e22',0,.3,1.07,2.9,.06,.06);wedge(a,'#8c7a63',0,1.85,0,2.9,.55,2.05);roof(a,0,1.88,0,3.4,2.7,'#3d4247','#2c3034');box(a,'#e9dcc4',-.9,1.05,1.1,.8,.7,.05);box(a,'#e9dcc4',0,1.05,1.1,.03,.7,.07);door(a,.9,.75,1.1,.6,1.1);const g=new T.Group();a.add(g);f.push(g);for(let i=0;i<3;i++)box(g,'#1f3a5f',-.5+i*.5,1.55,1.3,.42,.5,.03);label(g,'일식',0,1.55,1.32,.9,.3,'#1f3a5f','#f5f0e6',70);lantern(g,-1.3,1.45,1.3,'#f0c05a');lantern(g,1.3,1.45,1.3,'#f0c05a');return f;}
function chineseModel(a){const f=[];rounded(a,'#a09374',0,0,0,3.5,2.7,.12,.15);box(a,'#b63a32',0,1.0,0,2.9,1.7,2.1);box(a,'#e3b64a',0,.3,1.08,2.9,.12,.08);box(a,'#e3b64a',0,1.9,0,3.0,.1,2.2);winRow(a,1.05,1.07,2.9,2,.6,.6);door(a,0,.78,1.07,.7,1.1);wedge(a,'#c8574a',0,1.95,0,2.9,.6,2.05);roof(a,0,1.98,0,3.5,2.8,'#7a3b32','#5a2a24');const g=new T.Group();a.add(g);f.push(g);sign(g,'중국집',2.45,1.16,1.8,'#7a1f1f','#f6d26b',72);lantern(g,-1.35,1.6,1.3);lantern(g,1.35,1.6,1.3);return f;}
function convenienceModel(a){const f=[];flat(a,2.9,1.8,2.1,'#f4f1e8','#7d7d74');box(a,'#8fd1c7',0,1.0,1.07,2.5,1.0,.04,GLASS);box(a,'#f4f1e8',0,1.0,1.1,.06,1.0,.06);door(a,.9,.75,1.1,.55,1.05);const g=new T.Group();a.add(g);f.push(g);box(g,'#2f9e6d',0,1.75,1.16,3.0,.26,.12);box(g,'#f0a23b',0,1.98,1.16,3.0,.14,.12);label(g,'편의점 24',0,1.75,1.24,2.2,.24,'#2f9e6d','#ffffff',60);box(g,'#d9d2c0',-1.2,.3,1.45,.5,.5,.35);box(g,'#ff6b6b',-1.2,.6,1.45,.44,.1,.3);return f;}
function supermarketModel(a){const f=[];flat(a,6.4,2.6,4.6,'#f1e3c3','#5f7b6b','#b8ac90',true);
 for(let i=0;i<3;i++)casement(a,-1.9+i*1.3,1.12,2.32,1.05,1.02);door(a,2.4,.8,2.32,.9,1.3);
 cottageRoof(a,2.92,6.84,5.05,false,6.4,4.6).position.z=0;
 softBlock(a,'#d6d3c8',0,.08,3.20,6.6,.06,1.36,.02);for(let i=0;i<6;i++)box(a,'#f4f1e8',-2.5+i*1,.12,3.20,.08,.02,1.15);
 const g=new T.Group();a.add(g);f.push(g);sign(g,'개울 마트',2.47,2.43,4.1,'#547668','#fff2ce',84);
 for(let i=0;i<22;i++){const x=-3.03+i*.28,c=i%2?'#fff2ce':'#d9846d';const panel=softBlock(g,c,x,1.97,2.70,.278,.06,.79,.018);panel.rotation.x=.16;ball(g,c,x,1.88,3.10,.139,.075,.035);}
 for(const x of[-3.05,3.05]){softBlock(g,'#a9805a',x,1.00,3.05,.07,1.86,.07,.02);windowBox(g,x,.24,3.5,.42);}
 for(const x of[-3.45,3.45])for(const z of[-1.65,-.65,.35,1.35]){clump(g,'#7fa857',x,.28,z,.19,.26,.39);flower(g,x,z,'#fff2ce');}
 softBlock(g,'#9aa3a8',-2.4,.45,3.5,.6,.5,.4,.04);for(const x of[-2.6,-2.2])for(const z of[3.3,3.7])cylinder(g,'#444',x,.15,z,.08,.06);
 for(let i=0;i<4;i++)softBlock(g,['#d9846d','#e8c988','#8ca96a','#7fa3a8'][i],-1+i*.7,.3,3.1,.5,.4,.4,.04);return f;
}
function clinicModel(a){const f=[];flat(a,2.9,1.9,2.1,'#f7f7f2','#6fa08a');winRow(a,1.1,1.07,2.9,2,.7,.7);door(a,0,.78,1.07,.6,1.1);const g=new T.Group();a.add(g);f.push(g);box(g,'#3f9c6e',0,2.55,0,.7,.2,.7);box(g,'#3f9c6e',0,2.55,0,.2,.2,.7);box(g,'#3f9c6e',0,2.55,0,.7,.2,.2);box(g,'#ffffff',0,2.5,.36,.5,.14,.04);box(g,'#ffffff',0,2.5,.36,.14,.5,.04);sign(g,'동네 의원',1.7,1.16,1.6,'#3f9c6e','#ffffff',64);for(const z of[-.55,.25])windowBox(g,-1.02,2.36,z,.42);for(const x of[-.75,-.15])windowBox(g,x,.20,1.46,.45);return f;}
function hospitalModel(a){const f=[];flat(a,3.2,3.4,2.3,'#f7f7f2','#7fa3a8');
 for(const y of[2.1,3.1])winRow(a,y,1.17,3.2,3,.55,.55);for(const x of[-1.05,1.05])casement(a,x,.92,1.17,.50,.55);door(a,0,.8,1.17,.9,1.3);
 const g=new T.Group();a.add(g);f.push(g);sign(g,'마을 병원',3.85,1.2,2.2,'#547668','#fff2ce',66);
 softBlock(g,'#7fa3a8',0,1.64,1.46,1.52,.13,.65,.055);for(const x of[-.67,.67])softBlock(g,'#f1dfb0',x,.84,1.70,.075,1.5,.075,.02);
 for(const x of[-1,1])windowBox(g,x,2.63,1.30,.60);
 // A small rooftop garden keeps the modern clinic recognisable without a bare slab.
 const terrace=new T.Group();terrace.position.set(0,3.84,-.17);g.add(terrace);softBlock(terrace,'#c8b693',0,0,0,2.6,.08,1.5,.04);
 for(const x of[-1.1,1.1])windowBox(terrace,x,.15,.30,.52);
 const seat=new T.Group();seat.scale.setScalar(.65);seat.position.set(0,.08,-.27);terrace.add(seat);bench(seat,0,0);
 for(const x of[-.70,.70])for(const z of[-.70,.18])softBlock(terrace,'#bd9869',x,.57,z,.06,1.1,.06,.018);
 for(let i=0;i<6;i++)softBlock(terrace,'#d6bb8d',-.75+i*.3,1.13,-.26,.10,.065,1.12,.02);
 for(let i=0;i<5;i++)clump(terrace,'#7fa857',-.60+i*.3,1.22,-.65,.24,.10,.23);
 softBlock(g,'#f1e3c3',1.28,3.38,1.25,.45,.48,.08,.055);box(g,'#547668',1.28,3.38,1.30,.29,.09,.025);box(g,'#547668',1.28,3.38,1.30,.09,.29,.025);return f;
}
function kidsModel(a){const f=[];flat(a,2.9,1.9,2.1,'#fff2c9','#f0a23b');winRow(a,1.1,1.07,2.9,2,.9,.7);door(a,0,.78,1.07,.6,1.1);const g=new T.Group();a.add(g);f.push(g);for(let i=0;i<4;i++)ball(g,['#e36b4e','#f0c05a','#5aa36b','#5b8fd1'][i],-1.1+i*.73,2.6,-.2,.38,.38,.38);sign(g,'키즈카페',1.72,1.16,1.9,'#f0a23b','#ffffff',66);box(g,'#5b8fd1',-1.4,.3,1.5,.5,.1,.5);cylinder(g,'#5aa36b',1.4,.4,1.5,.3,.3);return f;}
function amusementModel(a){const f=[];rounded(a,'#c9c1a3',0,0,0,7,6.6,.12,.3);box(a,'#d6cfb8',0,.08,0,6.6,.06,6.2);box(a,'#e8dcc4',2.0,.8,2.0,1.6,1.2,1.2);wedge(a,'#c94c3f',2.0,1.4,2.0,1.6,.5,1.3);door(a,2.0,.6,2.62,.55,.8);
 const w=new T.Group();w.position.set(-1.30,0,-.52);a.add(w);
 for(const z of[-.48,.48])for(const side of[-1,1]){const leg=softBlock(w,'#7fa3a8',side*.50,1.48,z,.13,3.08,.13,.025);leg.rotation.z=side*.33;}
 cylinder(w,'#e8c988',0,2.95,0,.18,1.1).rotation.x=Math.PI/2;
 const wheel=new T.Group();wheel.position.y=2.95;wheel.userData.ride='wheel';w.add(wheel);
 mesh(wheel,geometry('village-wheel',()=>new T.TorusGeometry(1.90,.075,8,40)),'#d9846d',0,0,0);
 mesh(wheel,geometry('village-wheel-inner',()=>new T.TorusGeometry(1.70,.035,6,40)),'#fff2ce',0,0,.03);
 for(let i=0;i<8;i++){const t=i*Math.PI/4,sp=box(wheel,'#e8c988',Math.cos(t)*.95,Math.sin(t)*.95,0,1.90,.055,.055);sp.rotation.z=t;
  const cabin=new T.Group();cabin.userData.cabin=true;cabin.position.set(Math.cos(t)*1.90,Math.sin(t)*1.90,0);wheel.add(cabin);
  softBlock(cabin,['#7fa3a8','#8ca96a','#e8c988','#d9846d'][i%4],0,-.25,0,.52,.48,.48,.065);softBlock(cabin,'#fff2ce',0,.02,0,.58,.10,.54,.035);
  for(const z of[-.247,.247]){box(cabin,'#c1d9cb',0,-.22,z,.32,.20,.014,GLASS);box(cabin,'#fff2ce',0,-.22,z,.025,.20,.022);}
  // Keep swinging cabins attached to their joint when static buildings are instanced.
  bakeRidePart(cabin,`cabin:${i%4}`);cabin.traverse(o=>{o.userData.keepArtHierarchy=true;});
 }
 batch(wheel);wheel.traverse(o=>{o.userData.keepArtHierarchy=true;});
 const c=new T.Group();c.position.set(1.4,0,-1.6);a.add(c);cylinder(c,'#f6e7c3',0,.2,0,1.4,.3);cylinder(c,'#bd9869',0,1.4,0,.08,2.4);
 mesh(c,geometry('carousel-canopy',()=>new T.ConeGeometry(1,1,32)),'#d9846d',0,2.75,0,1.6,.7,1.6);
 for(let i=0;i<12;i++){const t=i*Math.PI/6;ball(c,i%2?'#fff2ce':'#e8c988',Math.cos(t)*1.5,2.43,Math.sin(t)*1.5,.15,.11,.15);}
 ball(c,'#e8c988',0,3.14,0,.12,.16,.12);
 const carousel=new T.Group();carousel.userData.ride='carousel';c.add(carousel);
 for(let i=0;i<6;i++){const t=i*Math.PI/3,x=Math.cos(t),z=Math.sin(t);cylinder(carousel,'#e8c988',x,1.2,z,.025,1.8);
  const pony=new T.Group();pony.position.set(x,.68,z);pony.rotation.y=-t;pony.userData.pony=i;carousel.add(pony);
  const fur=i%2?'#fff2ce':'#e8c988';ball(pony,fur,0,0,0,.24,.13,.12);ball(pony,fur,.17,.16,0,.075,.20,.075);ball(pony,fur,.23,.29,0,.12,.075,.08);
  for(const side of[-1,1]){ball(pony,fur,.18,.38,side*.047,.027,.06,.024);dot(pony,'#345347',.255,.32,side*.074,.014);for(const x of[-.15,.13]){const leg=box(pony,fur,x,-.12,side*.08,.04,.21,.04);leg.rotation.z=x>.0?-.25:.28;}}
  softBlock(pony,['#7fa3a8','#8ca96a','#d9846d'][i%3],0,.12,0,.16,.04,.25,.016);ball(pony,'#bd9869',-.23,-.02,0,.10,.04,.05);bakeRidePart(pony,`pony:${i}`);pony.traverse(o=>{o.userData.keepArtHierarchy=true;});
 }
 batch(carousel);carousel.traverse(o=>{o.userData.keepArtHierarchy=true;});
 const g=new T.Group();a.add(g);f.push(g);box(g,'#c94c3f',0,2.4,3.1,4.4,.8,.2);label(g,'작은 놀이동산',0,2.4,3.22,3.8,.6,'#c94c3f','#fff4dd',84);for(const x of[-2.1,2.1])cylinder(g,'#8d9a9c',x,1.2,3.1,.06,2.4);for(let i=0;i<6;i++)softBlock(g,['#d9846d','#e8c988','#8ca96a','#7fa3a8'][i%4],-2.0+i*.8,2.95,3.1,.3,.2,.08,.025);
 const back=new T.Group();back.position.set(0,2.4,2.98);back.rotation.y=Math.PI;g.add(back);label(back,'작은 놀이동산',0,0,0,3.8,.6,'#c94c3f','#fff4dd',84);
 for(const side of[-1,1])for(let i=0;i<4;i++){const x=side*3.15,z=-2.7+i*1.3;softBlock(g,'#bd9869',x,.23,z,.38,.28,.75,.06);clump(g,'#81b56c',x,.45,z,.26,.25,.42);const blooms=new T.Group();blooms.position.set(x,.40,z);g.add(blooms);for(const p of[-.20,0,.20])flower(blooms,0,p,i%2?'#fff2ce':'#f0b1bb');}
 const ticketSide=new T.Group();ticketSide.position.x=2.81;ticketSide.rotation.y=Math.PI/2;g.add(ticketSide);cottageWindow(ticketSide,-2.0,.40,0,.52,.65);
 for(const x of[-2.1,2.1])ball(g,'#fff2ce',x,2.85,3.1,.13,.16,.13,GLOW);
 const rest=new T.Group();rest.position.set(-1.5,.1,1.8);rest.rotation.y=Math.PI/2;g.add(rest);bench(rest,0,0);for(const x of[-.7,.7])pot(rest,x,.55);
 return f;}
function schoolModel(a){
 const f=[];flat(a,3.05,2.45,2.2,'#f1e7d2','#5f7b6b','#b8ac90',true);for(const x of[-.95,.95])casement(a,x,.95,1.12,.52,.55);winRow(a,1.93,1.12,3.05,3,.52,.55);door(a,0,.8,1.12,.75,1.3);
 cottageRoof(a,2.77,3.36,2.78,false,3.05,2.2).position.z=0;
 const g=new T.Group();a.add(g);f.push(g);softBlock(g,'#f1e3c3',0,3.43,.58,.88,1.25,.8,.06);roof(g,0,4.09,.58,.94,.85,'#5c8170','#4d7362').scale.y=.55;
 cylinder(g,'#8e6b4a',0,3.72,1.00,.28,.05).rotation.x=Math.PI/2;cylinder(g,'#fff2ce',0,3.72,1.032,.23,.012).rotation.x=Math.PI/2;box(g,'#345347',0,3.80,1.047,.025,.16,.02);box(g,'#345347',.07,3.72,1.047,.15,.025,.02);
 for(const x of[-.95,0,.95])windowBox(g,x,1.46,1.25,.63);
 sign(g,'개울초등학교',2.47,1.2,2.45,'#5f7b6b','#fff2ce',64);for(const x of[-1.27,1.27]){softBlock(g,'#bd9869',x,.22,1.47,.45,.27,.38,.035);clump(g,'#7fa857',x,.48,1.47,.25,.23,.2);}
 return f;
}
function libraryModel(a){const f=[];flat(a,3.0,2.2,2.2,'#eadfc9','#6b5a45');for(const x of[-1.1,-.37,.37,1.1])cylinder(a,'#d9ccb0',x,1.1,1.2,.1,1.9);winRow(a,1.4,1.12,3.0,3,.5,.5);door(a,0,.78,1.12,.7,1.1);wedge(a,'#d9ccb0',0,2.5,0,3.0,.4,2.3);const g=new T.Group();a.add(g);f.push(g);for(let i=0;i<4;i++)box(g,['#c94c3f','#3b6ea5','#5aa36b','#f0c05a'][i],-.4+i*.27,3.0,.2,.22,.7-i*.08,.5);sign(g,'마을 도서관',2.35,1.16,2.0,'#6b5a45','#ffe8c9',64);return f;}
function fireModel(a){const f=[];flat(a,3.0,2.0,2.2,'#e9e4d4','#b23a3a');for(const x of[-.75,.75]){box(a,'#b23a3a',x,.85,1.11,1.2,1.4,.06);for(let k=0;k<4;k++)box(a,'#8e2b2b',x,.35+k*.33,1.15,1.2,.04,.04);}box(a,'#d9d2c0',-1.2,2.4,-.5,.8,2.6,.8);box(a,'#b23a3a',-1.2,3.8,-.5,.95,.25,.95);const g=new T.Group();a.add(g);f.push(g);sign(g,'119 소방서',2.45,1.16,2.0,'#b23a3a','#ffffff',66);box(g,'#f0c05a',0,2.68,.9,.3,.3,.3,GLOW);return f;}
function drainModel(a){rounded(a,'#a9a99c',0,0,0,3.4,2.6,.1,.2);box(a,'#8d9a9c',0,.25,0,3.0,.35,1.0);box(a,'#4d5b5f',0,.45,0,2.8,.05,.8);for(let i=0;i<9;i++)box(a,'#9aa3a8',-1.2+i*.3,.48,0,.06,.04,.8);box(a,'#6f7f82',0,.2,.9,3.0,.3,.3,WET);cylinder(a,'#8d9a9c',1.2,.5,-.9,.25,.6);box(a,'#4d5b5f',1.2,.82,-.9,.5,.06,.5);label(a,'빗물 배수',-.6,.7,-.9,1.3,.3,'#d9d2c0','#3b4a52',64);return[];}
function workshopModel(a,stage,derelict=false){const f=[];rounded(a,'#a09374',0,0,0,3.6,2.8,.12,.15);box(a,derelict?'#8d8370':'#c9b58e',0,1.0,0,3.0,1.8,2.2);for(let i=0;i<7;i++)box(a,derelict?'#7a7262':'#b5a07a',0,.3+i*.26,1.12,3.0,.04,.04);wedge(a,derelict?'#6f6960':'#8b7a60',0,1.9,0,3.0,.8,2.2);for(let i=0;i<10;i++){const m=box(a,derelict?'#5d615f':'#7d8b8e',-1.0+i*.22,2.3,.0,.1,.06,2.4);m.rotation.z=.5;}for(let i=0;i<10;i++){const m=box(a,derelict?'#5d615f':'#7d8b8e',1.0-i*.22,2.3,.0,.1,.06,2.4);m.rotation.z=-.5;}
 box(a,derelict?'#5f4e3f':'#6b5a45',0,.75,1.13,1.3,1.4,.06);if(derelict){box(a,'#3a3a3a',-.9,1.3,1.13,.5,.4,.04);box(a,'#8f7a52',.9,1.2,1.14,.5,.5,.04);tuft(a,1.6,1.4,1.2);tuft(a,-1.7,-1.2,1.0);return[];}
 casement(a,-1.0,1.2,1.1,.5,.5);casement(a,1.0,1.2,1.1,.5,.5);const g=new T.Group();a.add(g);f.push(g);sign(g,'창고 재생 공간',2.75,1.2,2.4,'#2f5d50','#ffe8c9',66);for(let i=0;i<3;i++)box(g,['#e36b4e','#f0c05a','#5b8fd1'][i],-1.2+i*.5,.5,1.6,.4,.5,.4);pot(g,1.4,1.5);return f;}
function solarModel(a){rounded(a,'#9cbd6e',0,0,0,3.3,2.6,.06,.3);for(const z of[-.6,.6]){for(const x of[-.9,.9]){cylinder(a,'#8d9a9c',x,.45,z,.04,.7);}const p=box(a,'#1f2f45',0,.9,z,2.9,.08,1.0,GLASS);p.rotation.x=-.5;for(let i=0;i<4;i++){const l=box(a,'#3a4f6b',-1.1+i*.73,.95,z,.03,.02,1.0);l.rotation.x=-.5;}}box(a,'#d9d2c0',1.3,.3,-1.0,.5,.5,.3);box(a,'#5aa36b',1.3,.4,-.83,.1,.1,.03,GLOW);label(a,'태양광',-.8,.35,-1.0,1.2,.3,'#d9d2c0','#3b4a52',66);return[];}
function bridgeModel(a){for(const z of[-.95,.95])box(a,'#7f6446',0,-.02,z,CELL+.2,.09,.12);for(let i=0;i<13;i++)box(a,i%2?'#d4c3a1':'#e6d6b5',-1.2+i*.2,.06,0,.18,.1,2.3);for(const z of[-1.05,1.05]){for(const x of[-1.1,0,1.1]){cylinder(a,'#8f6e4b',x,.4,z,.05,.7);ball(a,'#c4a070',x,.78,z,.075);}box(a,'#b59467',0,.64,z,CELL+.1,.07,.07);box(a,'#ab855b',0,.36,z,CELL+.1,.055,.055);}return[];}
function flowerModel(a,stage){const c=['#e9adba','#f2d58c','#e59bb6'];if(stage===0){for(let i=0;i<6;i++){const t=i*1.05;cylinder(a,'#6d9254',Math.sin(t)*.7,.2,Math.cos(t)*.7,.018,.22);dot(a,'#9cbd6e',Math.sin(t)*.7,.33,Math.cos(t)*.7,.05);}rounded(a,'#8f7452',0,0,0,2.0,2.0,.05,.3);return[];}
 rounded(a,'#8f7452',0,0,0,2.0,2.0,.05,.3);for(let i=0;i<(stage===1?3:6);i++){const t=i*1.05+.3;patch(a,Math.sin(t)*.65,Math.cos(t)*.65,c[i%3]);}if(stage===2)for(let i=0;i<3;i++)dot(a,'#ffffff',Math.sin(i*2.1)*.9,.5,Math.cos(i*2.1)*.9,.06);return[];}
function avenueModel(a,stage){cylinder(a,'#b8ac90',0,.10,0,.55,.08);tree(a,0,0,.88,false,stage);if(stage<2)for(let i=0;i<3;i++){const st=cylinder(a,'#b5a07a',Math.sin(i*2.1)*.25,.6,Math.cos(i*2.1)*.25,.02,1.0);st.rotation.set(Math.cos(i*2.1)*.3,0,-Math.sin(i*2.1)*.3);}return[];}
function benchModel(a){rounded(a,'#cdc6a6',0,0,0,2.0,2.0,.04,.3);bench(a,0,-.2);flower(a,-.8,.6,'#e9adba');flower(a,.8,.6,'#efd687');tuft(a,.3,.6,.7);pebble(a,'#b5ad96',-.7,.14,-.7,.12,.08,.1);return[];}
function bench(g,x,z){for(const a of[-.47,.47]){box(g,'#596657',x+a,.23,z,.08,.42,.08);box(g,'#596657',x+a,.45,z-.22,.07,.8,.07);box(g,'#596657',x+a,.6,z-.05,.07,.05,.4);}for(let i=0;i<3;i++)box(g,'#bd9869',x,.45,z-.16+i*.14,1.15,.07,.11);for(let i=0;i<2;i++)box(g,'#b28b60',x,.7+i*.15,z-.23,1.15,.1,.06);}
function cottageYard(a,type){
 const g=new T.Group();a.add(g);
 if(!['house','snack','western','japanese','chinese','convenience','library','clinic'].includes(type))return g;
 if(type==='house'){
  box(g,'#d9bd91',.35,.25,1.55,.76,.025,.32);for(let i=0;i<4;i++)box(g,'#f1ddaf',.08+i*.18,.267,1.55,.055,.012,.28);
  const wreath=mesh(g,geometry('wreath',()=>new T.TorusGeometry(.14,.035,6,16)),'#72995e',.35,1.16,1.16);for(let i=0;i<5;i++)ball(g,'#f0b1bb',.35+Math.sin(i*1.26)*.14,1.16+Math.cos(i*1.26)*.14,1.19,.034);
  for(const x of[-1.18,1.18]){box(g,'#547668',x,1.15,1.16,.18,.62,.04);for(let j=0;j<5;j++)box(g,'#94b69c',x,.92+j*.11,1.19,.14,.018,.025);}
  // All yard details stay within the occupied 2.4 m cell after the .6 model scale.
  for(const x of[-.94,1.27]){box(g,'#d0a17d',x,.31,1.58,.58,.23,.25);box(g,'#805f43',x,.43,1.58,.5,.025,.19);for(let i=0;i<3;i++){const f=new T.Group();f.position.set(x-.18+i*.18,.28,1.58);f.scale.setScalar(.64);g.add(f);flower(f,0,0,['#fff2ce','#f0b1bb','#f2d58c'][(i+(a.userData.palette||0))%3]);}}
  for(const x of[-1.6,-1.3,1.3,1.6]){box(g,'#f2e5cb',x,.31,1.8,.065,.43,.065);ball(g,'#f2e5cb',x,.54,1.8,.045,.055,.045);}
  for(const side of[-1,1])for(const y of[.23,.42])box(g,'#d6bb8d',side*1.45,y,1.8,.42,.045,.05);
  cylinder(g,'#8e6a4a',-1.67,.48,1.18,.04,.69);box(g,'#72998a',-1.67,.89,1.18,.31,.28,.25);ball(g,'#72998a',-1.67,1.03,1.18,.155,.08,.125);box(g,'#36594e',-1.67,.91,1.313,.22,.025,.012);box(g,'#fff2ce',-1.67,.81,1.313,.11,.05,.014);box(g,'#cf8e7e',-1.485,1.02,1.18,.035,.15,.1);
 }else{for(let i=0;i<5;i++){const flag=cone(g,['#d69995','#e8c988','#86aaa1'][i%3],-.8+i*.4,1.55,1.23,.085,.17);flag.rotation.z=Math.PI;}}
 for(const side of[-1,1]){for(let i=0;i<4;i++){const z=-.9+i*.43;box(g,'#f2e5cb',side*1.72,.36,z,.065,.6,.075);ball(g,'#f2e5cb',side*1.72,.67,z,.045);}
 for(const y of[.28,.5])box(g,'#d6bb8d',side*1.72,y,-.25,.06,.05,1.6);
 for(let i=0;i<3;i++){const z=-.72+i*.45;clump(g,'#81b56c',side*1.5,.25,z,.19,.2,.22);flower(g,side*1.48,z,i%2?'#fff2ce':'#f0b1bb');}}
 return g;
}
function streetDetails(a,type){
 const g=new T.Group();a.add(g);
 const board=(text,x,z,c='#365f4e')=>{for(const side of[-1,1]){const leg=box(g,'#a9805a',x+side*.2,.3,z,.045,.6,.045);leg.rotation.x=side*.12;}box(g,'#bd9869',x,.48,z,.52,.58,.065);label(g,text,x,.48,z+.04,.44,.47,c,'#fff3d6',54);};
 const table=(x,z)=>{cylinder(g,'#bd9869',x,.62,z,.36,.07);cylinder(g,'#596657',x,.31,z,.045,.58);for(const d of[-1,1]){cylinder(g,'#8b6a4a',x+d*.5,.34,z,.17,.06);for(const k of[-1,1])box(g,'#596657',x+d*.5+k*.1,.17,z,.035,.32,.035);}cylinder(g,'#fff4d8',x,.68,z,.13,.035);ball(g,'#d9846d',x,.71,z,.065,.035,.065);};
 const rack=(x,z)=>{box(g,'#a9805a',x,.34,z,.8,.58,.38);for(let j=0;j<3;j++){box(g,'#6f5139',x,.23+j*.18,z+.2,.84,.04,.035);for(let i=0;i<4;i++)ball(g,['#d37c52','#e8c166','#85a75c'][j],x-.28+i*.18,.32+j*.18,z+.08,.065,.08,.065);}};
 if(type==='house'){for(const x of[-.8,.98]){box(g,'#a9805a',x,.64,1.24,.46,.16,.21);for(let j=0;j<3;j++){clump(g,'#81b56c',x-.14+j*.14,.77,1.24,.09,.1,.1);ball(g,j%2?'#edb06c':'#e9adba',x-.14+j*.14,.86,1.24,.05,.04,.05);}}for(let j=0;j<3;j++){taper(g,'#bd8064',-.8+j*.55,.19,-1.25,.18,.2);clump(g,'#7fa857',-.8+j*.55,.38,-1.25,.2,.16,.2);}box(g,'#557b72',1.48,.72,1.02,.24,.28,.16);box(g,'#304b45',1.48,.76,1.11,.17,.025,.02);flower(g,-1.6,1.02,'#fff2ce');}
 if(type==='apartment'){for(const y of[.85,1.85,2.85]){box(g,'#9b6c51',-.8,y,1.42,.46,.16,.16);clump(g,'#7fa857',-.8,y+.13,1.42,.23,.12,.12);}for(let i=0;i<4;i++)box(g,['#d3a2a4','#f1e3c3','#7fa3a8','#edd087'][i],-.6+i*.32,2.48,1.45,.22,.33,.025);}
 if(type==='snack'){board('김밥',-1.5,1.8,'#9d5042');cylinder(g,'#b9bfc0',-.6,.65,1.5,.2,.08);for(let i=0;i<5;i++)cylinder(g,'#3c4c38',-.76+i*.075,.71,1.5,.03,.055);}
 if(type==='western'){table(-1.05,1.52);board('파스타',1.45,1.55,'#913e3d');}
 if(type==='japanese'){board('우동',-1.35,1.56,'#233c56');box(g,'#a9805a',-.8,.55,1.4,.75,.07,.34);for(let i=0;i<3;i++)cylinder(g,'#fff4d8',-1.02+i*.22,.62,1.4,.085,.065);}
 if(type==='chinese'){board('짜장면',-1.38,1.5,'#8e3030');for(let i=0;i<3;i++){cylinder(g,'#d0aa70',1.28,.2+i*.11,1.46,.18,.1);box(g,'#9b7653',1.28,.25+i*.11,1.46,.36,.018,.025);}}
 if(type==='convenience'){rack(-.7,1.45);box(g,'#f1e3c3',-1.48,.7,1.35,.34,1.05,.3);box(g,'#729ba1',-1.48,.8,1.51,.25,.65,.02,GLASS);label(g,'24',1.24,2.35,1.1,.36,.3,'#e8b851','#314c46');}
 if(type==='supermarket'){rack(-1.2,2.7);rack(.0,2.7);board('오늘 특가',-2.8,2.9,'#a14b3d');}
 if(type==='clinic'||type==='hospital'){board('진료 중',-1.3,1.45,'#497d74');pot(g,1.4,1.4);for(let i=0;i<4;i++)box(g,'#d2c9b6',.8+i*.16,.1,1.6,.14,.08,.38);}
 if(type==='kids'){board('어서 와!',-1.35,1.55,'#b17a31');for(let i=0;i<4;i++){const x=.65+i*.22;box(g,['#d9846d','#edd087','#7fa3a8','#8ca96a'][i],x,.26,1.55,.2,.18,.35);}}
 if(type==='school'){board('우리 학교',-.98,1.58);}
 if(type==='library'){board('오늘의 책',-1.4,1.55);box(g,'#a9805a',1.35,.62,1.4,.55,1,.25);for(let i=0;i<5;i++)box(g,['#d9846d','#edd087','#7fa3a8','#8ca96a','#a391ac'][i],1.14+i*.1,.65,1.54,.075,.32,.09);}
 if(type==='fire'){for(const x of[-1.3,1.3]){cylinder(g,'#b23a3a',x,.3,1.5,.09,.4);cylinder(g,'#edd087',x,.4,1.5,.11,.08);}board('119',-1.5,1.4,'#a44739');}
 if(type==='workshop'){board('고쳐 쓰는 날',-1.4,1.5);table(.6,1.55);}
 if(type==='generator'){box(g,'#edd087',.8,.85,.33,.26,.25,.025);label(g,'⚡',.8,.85,.35,.2,.2,'#edd087','#345347');}
 if(type==='solar'){flower(g,-1.5,1.0,'#fff2ce');flower(g,-1.3,1.12,'#fff2ce');}
 if(type==='bench'){board('잠깐 쉼',-.9,-.65);pot(g,.8,-.65);}
 if(['japanese','chinese','workshop'].includes(type)){
  const w=type==='workshop'?3:2.9,d=type==='workshop'?2.2:2.1;
  for(const side of[-1,1]){const face=new T.Group();face.position.x=side*w/2;face.rotation.y=side*Math.PI/2;g.add(face);casement(face,0,1.02,.015,.85,.68);box(face,'#a9805a',0,.42,.06,d-.2,.06,.07);}
  const rear=new T.Group();rear.position.z=-d/2;rear.rotation.y=Math.PI;g.add(rear);for(const x of[-.7,.7])casement(rear,x,1.02,.015,.62,.68);
 }
 return g;
}
const MODELS={house:[a=>alignedCottage(a),.6],snack:[a=>alignedCottage(a,'snack'),.6],generator:[a=>alignedCottage(a,'generator'),.6],tree:[gardenModel,.85],road:[roadModel,1],apartment:[apartmentModel,.6],western:[westernModel,.6],japanese:[japaneseModel,.6],chinese:[chineseModel,.6],convenience:[convenienceModel,.6],supermarket:[supermarketModel,.6],clinic:[clinicModel,.6],hospital:[hospitalModel,.6],kids:[kidsModel,.6],amusement:[amusementModel,.6],school:[schoolModel,.6],library:[libraryModel,.6],fire:[fireModel,.6],drain:[drainModel,.6],workshop:[workshopModel,.6],solar:[solarModel,.6],bridge:[bridgeModel,1],flower:[flowerModel,.85],avenue:[avenueModel,.8],bench:[benchModel,.85]};
function scaffold(a,p,n=1){ // 공사 단계: 터 정비 → 골조 → 외장(모델) → 간판·개장. y스케일 늘이기 없음.
 const w=CELL*n*.86;rounded(a,'#9a7f5d',0,0,0,w,w,.06,.2);for(const[x,z]of[[-1,-1],[1,-1],[1,1],[-1,1]]){box(a,'#c2a579',x*w/2,.5,z*w/2,.09,1,.09);box(a,'#e2c981',x*w/2,.9,z*w/2,.17,.12,.14);}
 for(const z of[-1,1])box(a,'#e7cd7b',0,.72,z*w/2,w,.04,.04);for(const x of[-1,1])box(a,'#e7cd7b',x*w/2,.72,0,.04,.04,w);
 if(p>=.25&&p<.6){for(const[x,z]of[[-.6,-.5],[.6,-.5],[.6,.5],[-.6,.5]])box(a,'#b28b60',x,.6,z,.08,1.1,.08);for(const z of[-.5,.5])box(a,'#c5af89',0,1.15,z,1.3,.07,.07);for(const x of[-.6,.6])box(a,'#c5af89',x,1.15,0,.07,.07,1.1);box(a,'#a08560',0,.1,0,1.4,.08,1.1);}}
function personRig(scene,color,id){
 const variant=(id.charCodeAt(0)-97)%4,species=id==='player'?'rabbit':variant%2===0?'otter':'bear';
 const rabbit=species==='rabbit',otter=species==='otter',fur=rabbit?'#fff1df':otter?'#ac8767':'#cd9b66',cream=rabbit?'#fff5e3':'#f2dfba';
 const cloth=rabbit?'#d7838b':otter?(variant===0?'#79a586':'#9fa76d'):(variant===1?'#ede8d6':'#b7a4bd');
 const petBall=(g,c,x,y,z,w,h=w,d=w,o)=>mesh(g,geometry('pet-soft',()=>new T.SphereGeometry(1,20,14)),c,x,y,z,w,h,d,{roughness:.92,emissive:c,emissiveIntensity:c===fur||c===cream?.075:0,...o});
 const g=new T.Group();scene.add(g);g.scale.setScalar(rabbit?1.08:.85);shade(g,0,.003,0,.29);const body=new T.Group();g.add(body);
 petBall(body,fur,0,.68,-.015,.285,.29,.21);petBall(body,cloth,0,.53,0,.29,.22,.22);
 petBall(body,cream,0,.78,.16,.18,.13,.07);box(body,cloth,0,.68,.205,.3,.25,.035);
 for(const side of[-1,1]){const strap=box(body,cloth,side*.14,.79,.17,.055,.3,.04);strap.rotation.z=side*.15;petBall(body,'#d9b16b',side*.14,.77,.213,.027,.027,.012);}
 box(body,'#f3c69d',0,.59,.24,.18,.12,.018);box(body,cloth,0,.60,.254,.145,.075,.012);const leaf=petBall(body,'#719260',.025,.62,.268,.025,.039,.008);leaf.rotation.z=-.45;
 if(rabbit){for(const side of[-1,1]){const collar=petBall(body,'#fff9ed',side*.075,.86,.19,.095,.05,.025);collar.rotation.z=side*.3;}for(let i=0;i<5;i++){const t=i*Math.PI*2/5;dot(body,'#fff9ed',-.065+Math.cos(t)*.032,.685+Math.sin(t)*.032,.247,.025,.025,.009);}dot(body,'#e7bc61',-.065,.685,.26,.018,.018,.008);}
 const head=new T.Group();head.position.y=1.08;if(rabbit)head.scale.set(1.1,1.06,1.08);body.add(head);mesh(head,rabbit?geometry('rabbitHead',()=>new T.SphereGeometry(1,32,20)):geometry('pet-soft',()=>new T.SphereGeometry(1,20,14)),fur,0,0,-.015,.425,.36,.335,{roughness:.92,emissive:fur,emissiveIntensity:rabbit?.12:.04});
 if(otter){petBall(head,'#dfc895',0,.29,-.035,.46,.045,.36);petBall(head,'#b4a96f',0,.36,-.04,.31,.12,.27);petBall(head,'#6e8d62',0,.31,-.04,.32,.035,.28);const sprig=petBall(head,'#89a76c',-.28,.38,.10,.04,.12,.02);sprig.rotation.z=-.45;}
 // Ears remain separate joints so their silhouettes can move without stretching.
 const ears=[];
 if(rabbit){for(const side of[-1,1]){const ear=new T.Group();ear.position.set(side*.205,.285,-.025);ear.rotation.z=side*.14;head.add(ear);ears.push(ear);
  if(side<0){petBall(ear,fur,0,.22,0,.12,.30,.095);petBall(ear,'#eab6ad',0,.24,.065,.073,.22,.023);}else{
   petBall(ear,fur,0,.13,0,.105,.19,.085);petBall(ear,'#eab6ad',0,.13,.065,.059,.12,.023);const tip=new T.Group();tip.position.y=.24;tip.rotation.z=-1.1;ear.add(tip);petBall(tip,fur,0,.12,0,.105,.2,.085);petBall(tip,'#eab6ad',0,.13,.064,.059,.13,.023);
  }
 }}else for(const side of[-1,1]){const ear=new T.Group();ear.position.set(side*(otter?.36:.335),otter?.16:.285,-.04);head.add(ear);ears.push(ear);petBall(ear,fur,0,0,0,otter?.11:.145,otter?.105:.15,.085);petBall(ear,otter?'#d8b18e':'#d9aa8e',0,.006,.065,otter?.049:.07,otter?.052:.078,.025);}
 if(otter){for(const side of[-1,1])petBall(head,cream,side*.105,-.15,.295,.165,.105,.06);petBall(head,cream,0,-.225,.21,.20,.08,.07);}
 else petBall(head,cream,0,-.155,.302,rabbit?.19:.205,.10,.065);
 for(const side of[-1,1]){const brow=petBall(head,cream,side*.15,.125,.288,.05,.018,.012);brow.rotation.z=side*-.16;}
 if(rabbit){for(let i=0;i<3;i++){const curl=petBall(head,fur,-.075+i*.065,.306+(i%2)*.022,.15,.06,.09,.05);curl.rotation.z=-.35+i*.3;}for(let i=0;i<5;i++){const a=i*Math.PI*2/5;petBall(head,'#fff9ed',-.31+Math.cos(a)*.044,.235+Math.sin(a)*.044,.24,.035,.035,.016);}petBall(head,'#f5d78c',-.31,.235,.258,.022,.022,.012);}
 const eyes=new T.Group();eyes.position.y=-.005;head.add(eyes);
 for(const side of[-1,1]){petBall(eyes,'#352d29',side*.155,0,.301,rabbit?.074:.067,rabbit?.088:.094,.025);petBall(eyes,'#6b4936',side*.155,-.025,.322,.044,.051,.012);petBall(eyes,'#ffffff',side*.141,.030,.328,rabbit?.026:.022,rabbit?.028:.025,.009);petBall(eyes,'#f9ecda',side*.177,-.037,.330,.009);
  petBall(head,rabbit?'#f2ad9e':'#dca48b',side*.265,-.105,.267,rabbit?.09:.083,.045,.018);
  if(otter)for(let i=0;i<3;i++)dot(head,'#78543e',side*(.10+i*.035),-.15+(i%2)*.026,.356,.008,.008,.006);
 }
 petBall(head,rabbit?'#d99188':'#503a30',0,-.115,.373,.034,.025,.018);
 const smile=mesh(head,geometry('animalSmile',()=>new T.TorusGeometry(1,.14,5,12,Math.PI)),'#916257',0,-.185,.365,.047,.025,.012);smile.rotation.z=Math.PI;
 const limbs=[],knees=[];
 for(const side of[-1,1]){const leg=new T.Group();leg.position.set(side*.12,.43,0);g.add(leg);petBall(leg,cloth,0,-.065,0,.10,.12,.11);const knee=new T.Group();knee.position.y=-.17;leg.add(knee);knees.push(knee);petBall(knee,fur,0,-.065,0,.084,.11,.085);petBall(knee,fur,0,-.185,.055,.115,.075,.165);petBall(knee,rabbit?'#e6b4ab':'#a47b60',0,-.238,.065,.07,.012,.095);limbs.push(leg);
  const arm=new T.Group();arm.position.set(side*.285,.79,0);body.add(arm);petBall(arm,fur,0,-.115,0,.103,.15,.10);petBall(arm,fur,0,-.265,.02,.113,.10,.105);limbs.push(arm);
 }
 const tail=new T.Group();tail.position.set(0,.53,-.19);body.add(tail);
 if(otter){const t=petBall(tail,fur,0,-.10,-.26,.13,.115,.35);t.rotation.x=-.2;petBall(tail,fur,0,-.045,-.47,.09,.08,.18);}else{petBall(tail,rabbit?cream:fur,0,0,-.08,rabbit?.14:.10);if(rabbit)for(let i=0;i<3;i++)petBall(tail,cream,Math.sin(i*2.1)*.07,.04,Math.cos(i*2.1)*.07-.09,.085);}
 const satchel=new T.Group();body.add(satchel);satchel.position.set(.225,.53,.125);satchel.rotation.z=.12;petBall(satchel,'#bc8958',0,0,0,.14,.13,.065);box(satchel,'#d3a36d',0,.02,.055,.22,.13,.025);petBall(satchel,'#f5d58f',.02,-.02,.076,.02,.018,.008);const shoulder=box(body,'#cf9b65',.035,.72,.247,.035,.48,.022);shoulder.rotation.z=-.68;
 if(rabbit){box(satchel,'#fff2ce',-.04,.115,0,.09,.09,.025);const sprout=petBall(satchel,'#719260',-.045,.135,.017,.015,.026,.008);sprout.rotation.z=-.4;petBall(satchel,'#e7bc61',-.04,.105,.018,.015,.013,.008);}
 const carry=new T.Group();limbs[3].add(carry);box(carry,'#d9bd88',0,-.42,.02,.2,.23,.12);const handle=mesh(carry,geometry('bagHandle',()=>new T.TorusGeometry(.055,.012,5,12)),'#8e6b4a',0,-.28,.02);handle.scale.y=.8;carry.visible=false;
 const book=new T.Group();body.add(book);book.position.set(0,.64,.29);book.rotation.x=-.4;box(book,'#557b72',0,0,0,.32,.035,.22);box(book,'#fff2ce',0,.025,0,.28,.02,.19);book.visible=false;
 const scarf=new T.Group();body.add(scarf);petBall(scarf,'#c97870',0,.875,.015,.20,.05,.17);box(scarf,'#c97870',.15,.77,.23,.09,.21,.03);scarf.visible=false;
 // Batch only static meshes: never flatten animated head, ear, eye or tail joints.
 for(const part of[body,head]){const detail=new T.Group();for(const child of[...part.children])if(child.isMesh)detail.add(child);part.add(detail);batch(detail);}
 return{g,body,head,ears,tail,species,limbs,knees,carry,book,eyes,scarf,id,route:[],distance:0,moving:0,wait:0,sitting:false};}

// Moving seats share a single coloured mesh each, keeping detail without dozens of draw calls per joint.
function bakeRidePart(group,key){
 const geo=geometry(`ride-part:${key}`,()=>{group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),p=[],n=[],c=[],v=new T.Vector3(),normal=new T.Vector3();
  group.traverse(o=>{if(!o.isMesh)return;const m=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld),nm=new T.Matrix3().getNormalMatrix(m),a=o.geometry.attributes,idx=o.geometry.index,color=o.material.color;
   for(let j=0;j<(idx?idx.count:a.position.count);j++){const k=idx?idx.getX(j):j;v.fromBufferAttribute(a.position,k).applyMatrix4(m);normal.fromBufferAttribute(a.normal,k).applyMatrix3(nm).normalize();p.push(v.x,v.y,v.z);n.push(normal.x,normal.y,normal.z);c.push(color.r,color.g,color.b);}
  });const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));return g;
 });group.clear();mesh(group,geo,'#ffffff',0,0,0,1,1,1,{vertexColors:true,roughness:.82});
}
function batch(group){group.updateMatrixWorld(true);const lists=new Map();group.traverse(o=>{if(o.isMesh&&!o.userData.keepArtHierarchy&&(!o.material.map||o.material.map.userData.shared)){const k=o.geometry.uuid+o.material.uuid+o.castShadow+o.receiveShadow;if(!lists.has(k))lists.set(k,[]);lists.get(k).push(o);}});const inverse=group.matrixWorld.clone().invert();
 for(const list of lists.values()){if(list.length<3)continue;const b=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{b.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));o.parent.remove(o);});b.castShadow=list[0].castShadow;b.receiveShadow=list[0].receiveShadow;group.add(b);}}
function dispose(g){g.traverse(o=>{if(o.geometry?.userData.owned)o.geometry.dispose();if(o.material?.map&&!o.material.map.userData.shared){o.material.map.dispose();o.material.dispose();}if(o.isInstancedMesh)o.dispose();});g.removeFromParent();}
const hash=(x,y)=>((x*73856093)^(y*19349663))>>>0;

export class World{
 constructor(canvas){
  this.canvas=canvas;this.scene=new T.Scene();this.scene.background=new T.Color('#9ccfc3');this.camera=new T.OrthographicCamera();
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.info.autoReset=false;this.sunlight=createSunlight(this.renderer);
  // A low warm key and cool sky fill keep the late-afternoon colour in the light, not a screen filter.
  this.hemi=new T.HemisphereLight('#dce5ed','#b7ad98',1.45);this.scene.add(this.hemi);const sun=this.sun=new T.DirectionalLight('#ffcb88',3.8);sun.position.set(-13,8,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:60});sun.shadow.normalBias=.018;sun.shadow.bias=-.0002;sun.shadow.radius=3.5;this.scene.add(sun);this.scene.add(sun.target);
  const fill=new T.DirectionalLight('#dce4f2',.7);fill.position.set(9,10,7);this.scene.add(fill);
  this.angle=.65;this.zoom=1;this.targetZoom=1;this.center=new T.Vector3(-7.2,0,-4);this.ray=new T.Raycaster();this.plane=new T.Plane(new T.Vector3(0,1,0),-GROUND_Y);
  this.groups=new Map();this.animations=[];this.people=[];this.roads=new Set();this.natural=new Map();this.cleared=new Set();
  const S=this.static=new T.Group();this.scene.add(S);this.terrain(S);batch(S);
  this.nature=null;this.natureSig=null;this.built=null;this.builtSig=null;this.builtIds=null;this.dynamic=new T.Group();this.scene.add(this.dynamic);
  this.ghost=null;this.unit=.02;this.span=8.5;this.rings=new T.Group();this.scene.add(this.rings);
  this.marker=new T.Mesh(new T.RingGeometry(.17,.23,24),new T.MeshBasicMaterial({color:'#fff6bc',side:T.DoubleSide}));this.marker.rotation.x=-Math.PI/2;this.marker.position.y=GROUND_Y+.03;this.marker.visible=false;this.scene.add(this.marker);
  this.waterLines=new T.Group();this.scene.add(this.waterLines);const rx=toWorld(RIVER,0).x;for(let i=0;i<70;i++){const m=box(this.waterLines,'#c3e8de',rx+Math.sin(i*4)*.72,-.575,(i*.47)%44-22,.15+i%3*.12,.005,.025);m.castShadow=false;}
  batch(this.waterLines);
  this.petals=new T.InstancedMesh(geometry('petal',()=>new T.SphereGeometry(1,5,3)),new T.MeshStandardMaterial({color:'#ffe1eb',roughness:1}),48);this.petals.instanceMatrix.setUsage(T.DynamicDrawUsage);this.petals.frustumCulled=false;this.petalPose=new T.Object3D();this.scene.add(this.petals);
  this.player=this.person('#5f8c9a','player');this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);
 }
 terrain(S){const half=(SIZE-1)/2,rx=toWorld(RIVER,0).x,L=SIZE*CELL;
  const sea=mesh(S,geometry('sea',()=>new T.PlaneGeometry(400,400)),'#6fb2b3',0,-.7,0,1,1,1,{roughness:.5});sea.rotation.x=-Math.PI/2;sea.castShadow=false;
  box(S,'#d2c08f',rx,-.71,0,CELL,.1,L-.8);const water=mesh(S,geometry('stream',()=>new T.PlaneGeometry(CELL,L-.8)),'#7cc5be',rx,-.6,0,1,1,1,WATER);water.rotation.x=-Math.PI/2;water.castShadow=false;
  for(let i=0;i<120;i++)pebble(S,i%3?'#b7ad8e':'#9da592',rx+Math.sin(i*2.7)*.8,-.64,-L/2+.6+i*(L-1.2)/120,.07+(i%3)*.02,.04,.06);
  // 두 섬: 왼쪽 0~10열(숲 포함), 오른쪽 12~17열. 잔디 윗면 ≈ .10
  for(const[c0,c1,seed]of[[0,RIVER-1,4.1],[RIVER+1,SIZE-1,1.3]]){const cx=((c0+c1)/2-half)*CELL,w=(c1-c0+1)*CELL+.3,d=L+.3;
   blob(S,'#6a5440',cx,-.78,0,w+.1,d,.3,seed,.012,.05,WET);blob(S,'#ad8e63',cx,-.45,0,w,d-.05,.3,seed+.2,.014);blob(S,'#dccb9f',cx,-.16,0,w+.12,d+.05,.1,seed+.4,.016);blob(S,'#9cbd6e',cx,-.02,0,w-.2,d-.2,.04,seed+.6,.018);}
  for(let i=0;i<80;i++){const z=-L/2+.8+i*(L-1.6)/80;for(const side of[-1,1]){pebble(S,i%3?'#8a9088':'#a3a79c',rx+side*(1.08+Math.sin(i*1.5+side)*.08),-.56,z,.2,.15,.24,WET);if(i%2)pebble(S,'#b8bcad',rx+side*(1.34+Math.cos(i*2.1)*.06),.05,z+.2,.12,.08,.14);if(i%4===1)dot(S,'#7fa857',rx+side*1.3,.02,z-.15,.1,.07,.1);
   if(i%3===0)for(let k=0;k<3;k++){const reed=cylinder(S,'#82985c',rx+side*1.56+k*.07,.24,z+k*.04,.016,.46);reed.rotation.z=(k-1)*.2+side*.1;dot(S,'#8c6a4a',rx+side*1.56+k*.07-(k-1)*.045,.46,z+k*.04,.022,.05,.022);}}}
  // Stream edge details stay inside the bank strip, outside building centres.
  for(let i=0;i<38;i++){const z=-L/2+1+i*(L-2)/38,side=i%2?1:-1,x=rx+side*1.23;pebble(S,'#b8ac90',x,-.12,z,.23,.18,.34,WET);pebble(S,'#6f8858',x+.06,.02,z,.17,.05,.22);if(i%3===0){flower(S,x+side*.18,z+.2,'#fff2ce');flower(S,x+side*.28,z+.4,'#e9adba');clump(S,'#81b56c',x+side*.24,.11,z-.1,.23,.13,.26);tuft(S,x+side*.1,z-.28,.7);}}
  // 보전 숲 (0~1열) · 마을 입구 표지 · 흩어진 풀
  for(let gy=0;gy<SIZE;gy++)for(let gx=0;gx<2;gx++){const p=toWorld(gx,gy),h=hash(gx,gy);tree(S,p.x+(h%7-3)*.14,p.z+(h%5-2)*.18,1.05+(h%4)*.12,h%9===0);if(h%3===0)tuft(S,p.x+.9,p.z-.8,1.1);}
  const gate=toWorld(5,3);for(const x of[-1,1]){cylinder(S,'#5b6660',gate.x+x*1.3,.95,gate.z-1.4,.055,1.75);box(S,'#fff0b5',gate.x+x*1.3,1.82,gate.z-1.4,.24,.3,.24,GLOW);cone(S,'#5b6660',gate.x+x*1.3,2.04,gate.z-1.4,.24,.16);}label(S,'개울마을',gate.x,1.35,gate.z-1.9,2.2,.5,'#fff6de','#345347',76);
 }
 syncTownscape(s){const sites=townscapeSites(s),sig=JSON.stringify(sites);if(sig===this.townscapeSig)return;this.townscapeSig=sig;if(this.townscape)dispose(this.townscape);const g=this.townscape=new T.Group();g.name='developed-streets';this.scene.add(g);
  const lamp=(a,x,z)=>{cylinder(a,'#547064',x,.73,z,.035,1.45);box(a,'#567367',x,.12,z,.17,.18,.17);box(a,'#ffe7a3',x,1.49,z,.18,.25,.18,GLOW);for(const dx of[-.1,.1])for(const dz of[-.1,.1])box(a,'#547064',x+dx,1.49,z+dz,.018,.28,.018);cone(a,'#547064',x,1.68,z,.18,.15);ball(a,'#d7bd7a',x,1.79,z,.032);};
  for(const e of sites.edges){const p=toWorld(e.x,e.y),a=new T.Group();a.position.set(p.x,GROUND_Y,p.z);a.rotation.y=Math.atan2(e.dx,e.dy);g.add(a);for(let i=0;i<3;i++)box(a,i%2?'#cdbd9e':'#e1cfad',(i-1)*.78,.025,1.12,.75,.05,.13);if(e.lamp)lamp(a,-.75,1.02);if(e.plant&&(e.x*3+e.y)%3!==1){box(a,'#bd9869',.18,.11,1.00,1.10,.18,.26);for(let i=0;i<5;i++){const x=-.25+i*.21;clump(a,'#7fa857',x,.25,1.00,.15,.16,.14);for(let j=0;j<3;j++)dot(a,i%2?'#fff2ce':'#f0b1bb',x+(j-1)*.055,.39+j%2*.035,1.01,.065,.045,.06);}}}
  const rx=toWorld(RIVER,0).x;
  const blooms=new T.Group();blooms.userData.gardenFlowers=true;g.add(blooms);
  for(const e of sites.banks){const p=toWorld(RIVER,e.y),x=rx+e.side*1.04;for(let i=0;i<3;i++)box(g,i%2?'#b3aa90':'#c6bba0',x,-.20,p.z+(i-1)*.78,.22,.58,.75);box(g,'#e0cfaa',x,.12,p.z,.30,.13,2.35);for(const z of[-.98,.98]){box(g,'#e6d8b8',x,.40,p.z+z,.13,.48,.13);ball(g,'#eee2c7',x,.66,p.z+z,.10,.06,.10);}for(const h of[.35,.54])box(g,'#b8a987',x,h,p.z,.065,.055,2.05);if(e.y%4===0)lamp(g,x,p.z);if(sites.stage===2&&e.y%2===0){box(g,'#bd9869',x,.22,p.z,.26,.18,1.30);for(let i=0;i<5;i++){const z=p.z-.48+i*.24;clump(g,'#7fa857',x,.38,z,.17,.17,.18);for(let j=0;j<3;j++)dot(blooms,i%2?'#fff2ce':'#f0b1bb',x+(j-1)*.065,.54+j%2*.025,z,.065,.045,.065);}}}
  batch(blooms);blooms.traverse(o=>{o.userData.keepArtHierarchy=true;});
  batch(g);
 }
 // 자연물(원래 숲 나무·꽃)은 정비되거나 건물이 올라가면 사라진다. 전체를 한 묶음으로 배칭하고 바뀔 때만 다시 만든다.
 syncNature(s){const cleared=new Set(s.landscape?.cleared||[]),occupied=new Set();for(const b of s.buildings)for(const[x,y]of cells(b))occupied.add(`${x},${y}`);const keys=[];
  const meadowSig=[...occupied,...cleared].sort().join('|');if(meadowSig!==this.meadowSig){disposeMeadow(this.meadow);this.meadow=createMeadow(s);this.scene.add(this.meadow);this.meadowSig=meadowSig;meadowSeason(this.meadow,this.se??1);}
  const beds=gardenSites(s),gardenSig=JSON.stringify(beds);if(gardenSig!==this.gardenSig){this.gardenSig=gardenSig;if(this.gardenDecor)dispose(this.gardenDecor);const yard=this.gardenDecor=new T.Group(),flowers=new T.Group();flowers.userData.gardenFlowers=true;yard.add(flowers);this.scene.add(yard);
   for(const p of beds){const bed=new T.Group();bed.position.set(p.x,GROUND_Y,p.z);bed.rotation.y=p.angle;yard.add(bed);
    for(let i=0;i<4;i++){const x=(i-1.5)*.28;shrub(bed,x,-.05,.9+i%2*.15);const f=new T.Group();f.position.set(p.x+Math.cos(p.angle)*x+Math.sin(p.angle)*.2,GROUND_Y+.02,p.z-Math.sin(p.angle)*x+Math.cos(p.angle)*.2);f.rotation.y=p.angle;f.scale.setScalar(.76+i%2*.16);flowers.add(f);patch(f,0,0,i%2?'#fff2ce':'#f0b1bb');}
    if(p.variant===0){for(const x of[-.55,0,.55]){box(bed,'#b28b60',x,.21,-.22,.065,.42,.065);ball(bed,'#d6bb8d',x,.44,-.22,.047);}box(bed,'#d6bb8d',0,.29,-.22,1.15,.055,.05);}
    else pebble(bed,'#cdc6a6',-.48,.06,.25,.13,.08,.11);
   }batch(flowers);flowers.traverse(o=>{o.userData.keepArtHierarchy=true;});batch(yard);}
  for(let gx=2;gx<SIZE;gx++)for(let gy=0;gy<SIZE;gy++){const f=naturalFeature(gx,gy);if(f&&!cleared.has(`${gx},${gy}`)&&!occupied.has(`${gx},${gy}`))keys.push([gx,gy,f]);}
  const ware=!at(s,14,7);const sig=keys.map(k=>k.join(':')).join('|')+(ware?'|W':'');if(sig===this.natureSig)return;this.natureSig=sig;if(this.nature)dispose(this.nature);const g=this.nature=new T.Group();this.scene.add(g);
  for(const[gx,gy,f]of keys){const p=toWorld(gx,gy),h=hash(gx,gy);if(f==='tree'){tree(g,p.x+(h%5-2)*.12,p.z+(h%7-3)*.1,1.1+(h%3)*.1,(gx<9&&gy<11)||h%5===0);for(let j=0;j<3;j++){const t=j*2.1+.5,x=p.x+Math.sin(t)*.78,z=p.z+Math.cos(t)*.78;shrub(g,x,z,1.05);patch(g,x+.15,z+.1,j%2?'#fff2ce':'#e9adba');}pebble(g,'#b8bcad',p.x-.7,.15,p.z+.4,.22,.12,.19);}else{patch(g,p.x-.5,p.z-.3,'#e9adba');patch(g,p.x+.6,p.z+.4,'#f2d58c');patch(g,p.x+.1,p.z-.9,'#e59bb6');}}
  if(ware){const w=new T.Group(),p=toWorld(14,7);w.position.set(p.x,GROUND_Y-.01,p.z);w.rotation.y=Math.PI/2;g.add(w);const m=new T.Group();m.scale.setScalar(.6);w.add(m);workshopModel(m,0,true);}batch(g);}
 // 건물 한 채: 원점 바닥 중앙, 문은 인접한 길 쪽. stage 1·2 터 정비/골조, 3 외장(간판 없음), 4 완공.
 model(parent,b,s,stage){const dir=facing(s,b,this.roads),g=new T.Group(),p=origin(b.type,b.x,b.y),n=foot(b.type);g.position.set(p.x,b.type==='bridge'?ROAD_Y-.03:GROUND_Y-.01,p.z);g.rotation.y=dir*Math.PI/2;parent.add(g);
  if(stage<3&&!['road','bridge'].includes(b.type)){scaffold(g,b.progress,n);return g;}const[make,sc]=MODELS[b.type]||[alignedCottage,.6];const m=new T.Group();m.scale.setScalar(sc);g.add(m);m.userData.palette=(b.x+b.y)%3;const finish=make(m,growthStage(s,b));finish.push(streetDetails(m,b.type),cottageYard(m,b.type));
  
  if(stage<4){for(const f of finish)f.visible=false;const w=CELL*n*.43;for(const[x,z]of[[-1,-1],[1,-1],[1,1],[-1,1]])box(g,'#c2a579',x*w,.5,z*w,.09,1,.09);for(const z of[-1,1])box(g,'#e7cd7b',0,.95,z*w,w*2,.04,.04);}return g;}
 // 완공 건물은 한 묶음(배칭)으로, 공사 중 건물은 각각. 묶음은 구성·방향·성장단계가 바뀔 때만 다시 만든다.
 sync(s,animate=true){this.treeAngle=null;this.roads=roadSet(s);this.syncTownscape(s);this.syncNature(s);this.seasonAnchors=s.buildings.filter(b=>b.progress>=1&&b.type==='tree').slice(0,6).map(b=>toWorld(b.x,b.y));
  const done=s.buildings.filter(b=>b.progress>=1),pending=s.buildings.filter(b=>b.progress<1);
  const sig=done.map(b=>`${b.id}:${b.type}:${b.x},${b.y}:${facing(s,b,this.roads)}:${growthStage(s,b)}:${b.closed?1:0}`).join('|');
  if(sig!==this.builtSig){if(this.built)dispose(this.built);const g=this.built=new T.Group();this.dynamic.add(g);for(const b of done)this.model(g,b,s,4);batch(g);this.rides=[];g.traverse(o=>{if(o.userData.ride)this.rides.push(o);});this.animateRides(0,true);
   if(animate&&this.builtIds)for(const b of done)if(!this.builtIds.has(b.id)&&!b.starter)this.sparkle(b.x,b.y);this.builtIds=new Set(done.map(b=>b.id));this.builtSig=sig;}
  const seen=new Set();for(const b of pending){const stage=b.progress>=.6?3:b.progress>=.25?2:1,psig=`${b.type}|${b.x},${b.y}|${facing(s,b,this.roads)}|${stage}`;seen.add(b.id);let e=this.groups.get(b.id);if(e&&e.sig!==psig){dispose(e.g);e=null;}
   if(!e){const g=this.model(this.dynamic,b,s,stage);batch(g);this.groups.set(b.id,{g,sig:psig});}}
  for(const[id,e]of this.groups)if(!seen.has(id)){dispose(e.g);this.groups.delete(id);}this.season(this.se??1,true);}
 sparkle(gx,gy){const g=new T.Group(),p=toWorld(gx,gy);g.position.set(p.x,GROUND_Y+.3,p.z);this.scene.add(g);for(let i=0;i<7;i++){const t=i*.9;const m=ball(g,'#fff2b3',Math.sin(t)*.9,i*.12,Math.cos(t)*.9,.12,.12,.12,GLOW);m.castShadow=false;}this.animations.push({g,t:0,rise:true});}
 // 배치 미리보기: 반투명 모델 + 바닥 테두리 + 출입구 화살표. ok=false면 붉은 테두리.
 preview(type,gx,gy,dir,ok){this.clearPreview();ghostMode=true;const g=this.ghost=new T.Group(),p=origin(type,gx,gy),W=CELL*foot(type);g.position.set(p.x,GROUND_Y,p.z);g.rotation.y=dir*Math.PI/2;this.scene.add(g);
  const[make,sc]=MODELS[type]||[alignedCottage,.6];const m=new T.Group();m.scale.setScalar(sc);g.add(m);m.userData.palette=(gx+gy)%3;make(m,2);streetDetails(m,type);cottageYard(m,type);ghostMode=false;batch(g);
  const frame=new T.Group();g.add(frame);const c=ok?'#79d28a':'#e07676';for(const[x,z,w,d]of[[0,-1,W,.12],[0,1,W,.12],[-1,0,.12,W],[1,0,.12,W]]){const b=box(frame,c,x*W/2,.06,z*W/2,w,.05,d,{emissive:c,emissiveIntensity:.5});b.castShadow=false;}
  if(!['road','bridge'].includes(type)){const ar=cone(frame,c,0,.25,W/2+.35,.28,.45,{emissive:c,emissiveIntensity:.6});ar.rotation.x=Math.PI/2;ar.castShadow=false;}}
 clearPreview(){if(this.ghost){dispose(this.ghost);this.ghost=null;}}
 showSpots(list,type='house'){while(this.rings.children.length)dispose(this.rings.children[0]);for(const{gx,gy}of list){const p=origin(type,gx,gy),r=new T.Mesh(geometry('spot',()=>{const g=new T.RingGeometry(.75,.95,32);g.rotateX(-Math.PI/2);return g;}),mat('#fff1a8',{emissive:'#ffe27a',emissiveIntensity:.8,side:T.DoubleSide}));r.position.set(p.x,(type==='bridge'?ROAD_Y:GROUND_Y)+.03,p.z);r.scale.setScalar(foot(type));r.castShadow=r.receiveShadow=false;this.rings.add(r);}}
 // 계절: 조명·하늘·잔디 색만 바꾼다(모델 재사용). 0 겨울 1 봄 2 여름 3 가을
 season(se,force=false){if(this.se===se&&!force)return;this.se=se;for(const p of this.people||[])if(p.scarf)p.scarf.visible=se===0;meadowSeason(this.meadow,se);treeArtSeason(this.scene,se);this.sunlight?.season(se);this.gardenDecor?.traverse(o=>{if(o.userData.gardenFlowers)o.visible=se!==0;});this.townscape?.traverse(o=>{if(o.userData.gardenFlowers)o.visible=se!==0;});
  const palettes={
   '#efb5c7':['#dce4df','#efb5c7','#63a361','#d98c51'],'#f9d6df':['#f5f6ec','#f9d6df','#92bc62','#edbb65'],'#dd9fb5':['#b7c9bf','#dd9fb5','#478457','#b96643'],
   '#81b56c':['#cedbd2','#81b56c','#65a564','#cc914e'],'#a3c77a':['#e4eade','#a3c77a','#9ac873','#e4b966'],'#679f63':['#9db8ab','#679f63','#458458','#ae734c'],
   '#7fa857':['#c8d4bf','#7fa857','#67a65d','#bca05c'],'#fbe4ea':['#fffef4','#fbe4ea','#d4e4a1','#e5ad6a'],
   '#e9adba':['#dce9ed','#e9adba','#a6b9e4','#dc9b65'],'#f0b1bb':['#dce9ed','#f0b1bb','#b6b6e0','#e0b052'],
   '#9cbd6e':['#e8eee3','#afc77d','#b1ca84','#d5b481'],
   '#7cc5be':['#bedde0','#7cc5be','#65bbb9','#8fbfb0'], '#c3e8de':['#f3f5ed','#c3e8de','#d4f1e5','#e1ded0']
  };
  for(const c of ['#3d4247','#2c3034','#7a3b32','#5a2a24','#7d8b8e','#5c8170','#4d7362','#5f7b6b','#4b6457','#4a6a70','#3a5459','#52745e','#385443','#a77760','#825743','#7b926a','#5c7653'])palettes[c]=['#e7ece3',c,c,c];
  for(const c of ['#d9d2c0','#7d6b52','#7d7d74','#6fa08a','#4a7fa6'])palettes[c]=['#e7ece3',c,c,c];
  for(const c of ['#99b56c','#a8bd70','#f2d58c'])palettes[c]=['#e4ebdd',c,c,c];
  for(const c of ['#6c934b','#829f53','#8cae62'])palettes[c]=['#b5c7aa',c,c,'#b8a360'];
  for(const[k,m]of materials){const base=k.split('|')[0];if(palettes[base])m.color.set(palettes[base][se]);if(base==='#9cbd6e'){const map=se===0?null:surfaceOptions(base).map;if(m.map!==map){m.map=map;m.needsUpdate=true;}}}
  this.scene.background.set(['#d9dfe9','#e6d5b6','#cfdbd3','#e8c7a7'][se]);this.sun.color.set(['#ffdfb5','#ffcb88','#ffda9f','#ffc789'][se]);this.hemi.color.set(['#dbe5f5','#dce5ed','#d5e9ed','#e0deea'][se]);
  if(this.seasonDecor)dispose(this.seasonDecor);this.seasonDecor=new T.Group();this.scene.add(this.seasonDecor);
  for(const p of this.seasonAnchors||[]){const g=this.seasonDecor,x=p.x+.65,z=p.z-.6;
   if(se===0){ball(g,'#f6f5eb',x,.35,z,.22,.25,.22);ball(g,'#f6f5eb',x,.65,z,.15,.16,.15);for(const a of[-1,1])dot(g,'#4f554e',x+a*.05,.69,z+.14,.018);const nose=cone(g,'#d99959',x,.64,z+.19,.025,.1);nose.rotation.x=Math.PI/2;cylinder(g,'#b97670',x,.53,z,.14,.045);}
   if(se===3){for(let i=0;i<3;i++){const px=x+(i-1)*.16;ball(g,'#d99a52',px,.22,z+i*.08,.14,.11,.13);cylinder(g,'#7b7951',px,.35,z+i*.08,.022,.07);}for(let i=0;i<3;i++){cylinder(g,'#e4cfab',x-.45,.2,z+i*.15,.018,.16);ball(g,'#b77b5c',x-.45,.29,z+i*.15,.08,.04,.08);}}
   if(se===2){clump(g,'#679f63',x,.25,z,.3,.22,.3);for(let i=0;i<9;i++){const t=i*2.4;ball(g,i%2?'#b4b8e0':'#9ebcdd',x+Math.sin(t)*.19,.43+(i%3)*.05,z+Math.cos(t)*.19,.09,.07,.09);}}
   if(se===1){flower(g,x,z,'#f0b1bb');flower(g,x+.18,z+.1,'#fff2ce');}
  }batch(this.seasonDecor);
  this.petals.material.color.set(['#fffef6','#ffe1eb','#f5dc84','#c57b40'][se]);
 }

 person(color,id){const p=personRig(this.scene,color,id);p.scarf.visible=this.se===0;if(id==='player')p.g.rotation.y=1.3;addRabbitArt(p);this.people.push(p);return p;}
 removePerson(p){dispose(p.g);this.people=this.people.filter(q=>q!==p);}
 place(p,gx,gy){const w=toWorld(gx,gy);p.g.position.set(w.x,GROUND_Y,w.z);p.route=[];}
 focus(gx,gy){this.followPlayer=false;const w=toWorld(gx,gy);this.center.set(w.x,0,w.z);}
 // 화면 픽셀 → 지면 이동. 세로는 카메라 앙각(약 41°) 때문에 1.5배.
 pan(dx,dy){this.followPlayer=false;const right=new T.Vector3(Math.cos(this.angle),0,-Math.sin(this.angle)),fwd=new T.Vector3(-Math.sin(this.angle),0,-Math.cos(this.angle));this.center.addScaledVector(right,-dx*this.unit).addScaledVector(fwd,dy*this.unit*1.5);
  const lim=SIZE*CELL/2+2;this.center.x=Math.max(-lim,Math.min(lim,this.center.x));this.center.z=Math.max(-lim,Math.min(lim,this.center.z));}
 resize(){const w=innerWidth,h=innerHeight;this.renderer.setSize(w,h,false);this.sunlight?.resize();this.aspect=w/h;}
 point(px,py){this.ray.setFromCamera(new T.Vector2(px/innerWidth*2-1,1-py/innerHeight*2),this.camera);const p=new T.Vector3();return this.ray.ray.intersectPlane(this.plane,p)?p:null;}
 screen(p){const v=p.clone().project(this.camera);return{x:(v.x+1)*innerWidth/2,y:(1-v.y)*innerHeight/2};}
 animateRides(dt,reduced){
  if(!this.paused&&!reduced)this.rideTime=(this.rideTime||0)+dt;
  for(const ride of this.rides||[]){const wheel=ride.userData.ride==='wheel',axis=wheel?'z':'y';ride.rotation[axis]=((this.rideTime||0)*(wheel?.10:.20))%(Math.PI*2);
   for(const child of ride.children){if(child.userData.cabin)child.rotation.z=-ride.rotation.z;if(Number.isInteger(child.userData.pony))child.position.y=.68+Math.sin(ride.rotation.y*3+child.userData.pony*Math.PI/3)*.09;}
  }
 }
 frame(dt,time,reduced){if(this.followPlayer&&!this.paused&&this.player&&(this.player.route.length||this.player.moving>.01)){const p=this.player.g.position,k=reduced?1:1-Math.exp(-dt*5);this.center.x+=(p.x-this.center.x)*k;this.center.z+=(p.z-this.center.z)*k;}if(this.scene&&this.treeAngle!==this.angle){treeArtView(this.scene,this.angle);this.treeAngle=this.angle;}if(!this.treeArtSettled&&this.scene)this.treeArtSettled=treeArtReady(this.scene);this.zoom+=(this.targetZoom-this.zoom)*Math.min(1,dt*7);const span=this.span=(this.aspect<1?13:8.5)/this.zoom;this.unit=span*2/innerHeight;
  this.camera.left=-span*this.aspect;this.camera.right=span*this.aspect;this.camera.top=span;this.camera.bottom=-span;this.camera.near=.1;this.camera.far=120;
  this.camera.position.set(this.center.x+Math.sin(this.angle)*30,26,this.center.z+Math.cos(this.angle)*30);this.camera.lookAt(this.center.x,.2,this.center.z);this.camera.updateProjectionMatrix();
  this.sun.position.set(this.center.x-13,8,this.center.z+6);this.sun.target.position.copy(this.center);
  const motionDt=this.paused?0:dt;
  this.animateRides(motionDt,reduced);
  this.idleTime=(this.idleTime??0)+motionDt;const idleTime=this.idleTime;
  if(this.meadow)this.meadow.userData.wind.value=reduced?0:this.meadow.userData.wind.value+motionDt;
  for(const p of this.people){if(this.paused)continue;const speed=advancePersonRoute(p,motionDt,this.people);
   p.moving+=(speed-p.moving)*Math.min(1,motionDt*12);p.seatBlend=(p.seatBlend||0)+((p.sitting?1:0)-(p.seatBlend||0))*Math.min(1,motionDt*7);const phase=p.distance*13;for(let k=0;k<2;k++){const wave=Math.sin(phase+k*Math.PI)*p.moving;p.limbs[k*2].rotation.x=wave*.55;p.limbs[k*2+1].rotation.x=-wave*.45;}
   p.body.position.y=reduced?0:Math.abs(Math.sin(phase))*.022*p.moving;p.body.rotation.z=reduced?0:Math.sin(phase)*.025*p.moving;
   if(p.head){const sway=reduced?0:Math.sin(phase*.5)*p.moving*.055;p.head.rotation.z=sway+(reduced?0:Math.sin(idleTime*.85)*.035*(1-p.moving));p.head.rotation.x=reduced?0:Math.sin(idleTime*1.2)*.022*(1-p.moving);p.head.rotation.y=reduced?0:Math.sin(idleTime*.7)*.045*(1-p.moving);for(let j=0;j<p.ears.length;j++){p.ears[j].rotation.z=(p.species==='rabbit'?(j===0?-.14:.14):0)+sway*(j===0?1:-.8)+(reduced?0:Math.sin(idleTime*1.5+j)*.024);p.ears[j].rotation.x=reduced||p.species!=='rabbit'?0:Math.sin(phase+idleTime*1.7+j*.6)*(.018+p.moving*.045);}p.tail.rotation.y=p.sitting?.65:reduced?0:Math.sin(phase*.6+idleTime)*.10;}
   if(p.scarf)p.scarf.visible=this.se===0;
   if(p.eyes)p.eyes.scale.y=reduced?1:((idleTime+(p.id==='player'?0:1))%4.7<.12?.12:1);
   p.book.visible=p.seatBlend>.8&&p.species==='otter';
   if(p.sitting&&Number.isFinite(p.seatAngle)){const diff=Math.atan2(Math.sin(p.seatAngle-p.g.rotation.y),Math.cos(p.seatAngle-p.g.rotation.y));p.g.rotation.y+=diff*Math.min(1,motionDt*7);}
   const sit=p.seatBlend;for(let k=0;k<2;k++){p.knees[k].rotation.x=(1-sit)*Math.max(0,-Math.sin(phase+k*Math.PI))*.25*p.moving+sit*1.35;p.limbs[k*2].rotation.x=p.limbs[k*2].rotation.x*(1-sit)-1.35*sit;p.limbs[k*2+1].rotation.x=p.limbs[k*2+1].rotation.x*(1-sit)-(p.book.visible?.7:.35)*sit;}p.body.rotation.z*=1-sit;p.body.position.y*=1-sit;
   if(p.id==='player'&&p.moving<.01&&!sit&&!reduced){const greeting=idleTime%14,envelope=greeting>10&&greeting<12?Math.sin((greeting-10)*Math.PI/2):0;p.limbs[3].rotation.z=envelope*(.9+Math.sin(idleTime*7)*.13);p.body.position.y+=Math.sin(idleTime*2)*.006;}else if(p.id==='player')p.limbs[3].rotation.z=0;
   const gx=Math.round(p.g.position.x/CELL+(SIZE-1)/2),gy=Math.round(p.g.position.z/CELL+(SIZE-1)/2);p.g.position.y=(this.roads.has(`${gx},${gy}`)?ROAD_Y:GROUND_Y)+sit*.08;}

  updateRabbitArt(this.player,this.angle,idleTime,reduced);
  for(let i=this.animations.length-1;i>=0;i--){const a=this.animations[i];a.t+=motionDt;const u=Math.min(1,a.t/.9);a.g.position.y=GROUND_Y+.3+u*1.6;a.g.scale.setScalar(1-u*.8);if(u===1||reduced){dispose(a.g);this.animations.splice(i,1);}}
  this.petals.visible=!reduced;
  if(this.petals.visible){for(let i=0;i<48;i++){const o=this.petalPose,t=idleTime*.24+i*1.618,summer=this.se===2;o.position.set(this.center.x-9+(i*3.71%18)+Math.sin(t)*.55,summer?.7+Math.sin(t*1.4+i)*.32:.25+(5-((idleTime*(this.se===0?.23:.32)+i*.71)%5)),this.center.z-9+(i*2.37%18)+Math.cos(t*.7)*.6);o.rotation.set(t,i,t*.6);o.scale.set(this.se===0?.032:.05,summer?.012+Math.abs(Math.sin(idleTime*7+i))*.04:.012,this.se===0?.032:summer?.065:.035);o.updateMatrix();this.petals.setMatrixAt(i,o.matrix);}this.petals.instanceMatrix.needsUpdate=true;}
  if(!reduced)this.waterLines.position.z=(idleTime*.14)%0.47;this.renderer.info?.reset();if(this.sunlight)this.sunlight.render(this.scene,this.camera);else this.renderer.render(this.scene,this.camera);}
}
