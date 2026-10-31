import * as T from '../lib/three.module.min.js';
import {SIZE,RIVER,cells} from './core.mjs?v=animals8';
import {CELL,GROUND_Y,toWorld} from './grid.mjs?v=animals8';

// Decoration follows occupancy, never changes the saved landscape or its score.
export function meadowSites(s){
 const blocked=new Set(s.buildings.flatMap(b=>cells(b).map(c=>c.join(','))));
 for(const key of s.landscape?.cleared||[])blocked.add(key);
 blocked.add('14,7');
 const out=[];
 for(let x=2;x<SIZE;x++)for(let y=0;y<SIZE;y++){
  const key=`${x},${y}`;if(x===RIVER||blocked.has(key))continue;
  let seed=((x+1)*73856093^(y+1)*19349663)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const p=toWorld(x,y),count=28+Math.floor(random()*8),cx=(random()-.5)*.8,cz=(random()-.5)*.8;
  for(let i=0;i<count;i++){
   const clustered=i%4<2,r=clustered?.44:.86,dx=(random()-.5)*r*2,dz=(random()-.5)*r*2;
   const size=i<5?.76+random()*.6:.24+random()*.48;
   out.push({key,x:p.x+dx+(clustered?cx:0),z:p.z+dz+(clustered?cz:0),size,angle:random()*Math.PI*2,flower:i<3&&random()>.12,tone:random()});
  }
 }
 return out;
}

export function gardenSites(s){
 const blocked=new Set(s.buildings.flatMap(b=>cells(b).map(c=>c.join(',')))),cleared=new Set(s.landscape?.cleared||[]),seen=new Set(),out=[];
 for(const b of s.buildings){if(b.progress<1||!['house','snack','clinic','library','convenience'].includes(b.type))continue;
  for(const[dx,dz]of[[-1,0],[1,0],[0,-1],[0,1]]){const gx=b.x+dx,gy=b.y+dz,key=gx+','+gy;if(gx<2||gx>=SIZE||gy<0||gy>=SIZE||gx===RIVER||key==='14,7'||blocked.has(key)||cleared.has(key)||seen.has(key))continue;
   seen.add(key);const p=toWorld(gx,gy);out.push({key,x:p.x-dx*.78,z:p.z-dz*.78,angle:Math.atan2(dx,dz),variant:(gx*7+gy*3)%3});if(out.length===28)return out;
  }
 }
 return out;
}

let blades,blossom,clover;
function geometry(flowers){
 const pos=[],uv=[],colors=[],color=new T.Color();let tint='#ffffff';
 const tri=(a,b,c)=>{color.set(tint);for(const p of[a,b,c]){pos.push(...p);uv.push(.5,p[1]/.4);colors.push(color.r,color.g,color.b);}};
 if(flowers==='clover'){
  // Low leaves fill the gaps between tufts without adding tall obstacles or saved objects.
  for(let f=0;f<3;f++)for(let leaf=0;leaf<3;leaf++){
   const angle=leaf*Math.PI*2/3+f*1.7,cx=[0,.19,-.14][f],cz=[0,.12,.17][f],h=.035+f*.014;
   const p=t=>{const u=Math.cos(t)*.052,v=.06+Math.sin(t)*.068;return[cx+Math.cos(angle)*v-Math.sin(angle)*u,h+.016*Math.sin(t),cz+Math.sin(angle)*v+Math.cos(angle)*u];};
   for(let j=0;j<6;j++){tint=j<3?'#a8be70':'#829e59';tri([cx+Math.cos(angle)*.06,h+.025,cz+Math.sin(angle)*.06],p(j*Math.PI/3),p((j+1)*Math.PI/3));}
  }
 }else if(!flowers){
  for(let i=0;i<7;i++){
   const a=i*2.399,h=.13+(i%4)*.055,r=.02+(i%2)*.018;
   const point=(side,t)=>{const width=(.006+Math.sin(t*Math.PI)*.032)*(t===1?0:1),bend=r+t*t*.14;return[Math.cos(a)*width*side+Math.sin(a)*bend,h*(t-.2*t*t),Math.sin(a)*width*side-Math.cos(a)*bend];};
   for(let j=0;j<4;j++){const t=j/4,u=(j+1)/4;tint=['#8ca65d','#9fba65','#bace80','#d0dc97'][j];tri(point(-1,t),point(1,t),point(-1,u));tri(point(1,t),point(1,u),point(-1,u));}
  }
 }else{
  // Cupped petals, stems and leaves share the buildings' sunlight instead of a flat photo card.
  for(let f=0;f<3;f++){
   const x=[0,.15,-.14][f],z=[-.1,.12,.13][f],h=[.30,.20,.24][f],n=f===2?8:5;
   tint='#6b914e';for(let j=0;j<3;j++){const a=j*Math.PI*2/3,b=(j+1)*Math.PI*2/3;tri([x+Math.sin(a)*.009,0,z+Math.cos(a)*.009],[x+Math.sin(b)*.009,0,z+Math.cos(b)*.009],[x,h,z]);}
   for(let k=0;k<3;k++){const a=k*2.4+f,stem=[x,.08,z],tip=[x+Math.sin(a)*.13,.13,z+Math.cos(a)*.13],left=[x+Math.sin(a-.5)*.07,.14,z+Math.cos(a-.5)*.07],right=[x+Math.sin(a+.5)*.07,.14,z+Math.cos(a+.5)*.07];tint=k%2?'#88ab59':'#689645';tri(stem,left,tip);tri(stem,tip,right);}
   tint=['#fff4d0','#efb1b6','#f4d276'][f];
   for(let i=0;i<n;i++){
    const a=i*Math.PI*2/n;
    const p=t=>{const u=Math.cos(t)*.033,v=.043+Math.sin(t)*.046;return[x+Math.cos(a)*v-Math.sin(a)*u,h+.024*Math.sin(t)+.02*Math.abs(Math.cos(t)),z+Math.sin(a)*v+Math.cos(a)*u];};
    for(let j=0;j<8;j++)tri([x+Math.cos(a)*.04,h-.008,z+Math.sin(a)*.04],p(j*Math.PI/4),p((j+1)*Math.PI/4));
   }
   tint='#dba93f';for(let j=0;j<8;j++){const a=j*Math.PI/4,b=(j+1)*Math.PI/4;tri([x,h+.022,z],[x+Math.sin(a)*.025,h+.009,z+Math.cos(a)*.025],[x+Math.sin(b)*.025,h+.009,z+Math.cos(b)*.025]);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}

export function createMeadow(s){
 blades??=geometry(false);blossom??=geometry(true);clover??=geometry('clover');
 const sites=meadowSites(s),flowers=sites.filter(p=>p.flower),group=new T.Group(),pose=new T.Object3D(),color=new T.Color();
 const wind={value:0};
 const make=(geo,list,name)=>{
  const material=new T.MeshStandardMaterial({color:'#ffffff',roughness:.95,side:T.DoubleSide,vertexColors:true});
  material.onBeforeCompile=shader=>{shader.uniforms.meadowTime=wind;shader.vertexShader='uniform float meadowTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(meadowTime * 1.4 + instanceMatrix[3].x * 1.7 + instanceMatrix[3].z) * 0.025 * uv.y;');};
  const m=new T.InstancedMesh(geo,material,list.length);m.name=name;m.receiveShadow=true;
  list.forEach((p,i)=>{pose.position.set(p.x,GROUND_Y+.004,p.z);pose.rotation.set(0,p.angle,0);pose.scale.setScalar(p.size);pose.updateMatrix();m.setMatrixAt(i,pose.matrix);color.set(p.tone>.55?'#ffffff':'#e0edcd');m.setColorAt(i,color);});
  group.add(m);return m;
 };
 make(blades,sites,'grass');make(blossom,flowers,'flowers');
 make(clover,sites.filter(p=>p.tone>.24).map(p=>{
  const [gx,gy]=p.key.split(',').map(Number),center=toWorld(gx,gy),size=.85+p.size*.35,edge=CELL/2-.45*size;
  return {...p,size,x:Math.max(center.x-edge,Math.min(center.x+edge,p.x)),z:Math.max(center.z-edge,Math.min(center.z+edge,p.z))};
 }),'clover');
 group.userData.wind=wind;group.userData.sites=sites;
 return group;
}

export function meadowSeason(group,season){
 if(!group)return;
 group.children.forEach(m=>{
  const flowers=m.name==='flowers'||m.name==='pollen'||m.name==='clover';m.visible=season!==0||!flowers;
  m.material.color.set(season===0?'#e5e9dc':season===3?'#e1c38c':season===2?'#d5edc5':'#ffffff');
  m.scale.y=season===0?.3:1;
 });
}

export function disposeMeadow(group){
 if(!group)return;
 group.userData.disposed=true;
 group.children.forEach(m=>{m.dispose();m.material.dispose();if(m.geometry.userData.owned)m.geometry.dispose();});group.removeFromParent();
}
