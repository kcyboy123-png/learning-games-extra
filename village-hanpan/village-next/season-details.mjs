import * as T from '../lib/three.module.min.js';
import {cells,SIZE,RIVER} from './core.mjs?v=perf1';
import {toWorld,GROUND_Y} from './grid.mjs?v=perf1';
import {naturalFeature} from './landscape.mjs?v=perf1';

// Seasonal scenery never occupies a saved plot, road, cleared cell or construction site.
export function seasonalSites(s){
 const blocked=new Set(s.buildings.flatMap(b=>cells(b).map(p=>p.join(','))));
 for(const key of s.landscape?.cleared||[])blocked.add(key);
 const near=new Set(s.buildings.filter(b=>b.progress>=1).flatMap(b=>cells(b).flatMap(([x,y])=>[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].map(p=>p.join(',')))));
 const out=[];
 for(let x=2;x<SIZE;x++)for(let y=0;y<SIZE;y++){
  const key=x+','+y;if(x===RIVER||key==='14,7'||blocked.has(key)||(!near.has(key)&&naturalFeature(x,y)!=='tree'))continue;
  out.push({key,...toWorld(x,y),seed:(x*37+y*61)%997});
 }
 return out.sort((a,b)=>a.seed-b.seed).slice(0,64);
}
const petal=new T.SphereGeometry(1,7,4),leafShape=new T.Shape(),mound=new T.SphereGeometry(1,10,6);
for(const [i,[x,y]] of [[0,-.9],[-.18,-.2],[-.8,-.28],[-.62,.1],[-.95,.4],[-.35,.36],[0,1],[.35,.36],[.95,.4],[.62,.1],[.8,-.28],[.18,-.2]].entries())i?leafShape.lineTo(x,y):leafShape.moveTo(x,y);
leafShape.closePath();const leaf=new T.ShapeGeometry(leafShape);
leaf.rotateX(-Math.PI/2);
const leafColors=[];
for(let i=0;i<leaf.attributes.position.count;i++){
 const p=leaf.attributes.position,x=p.getX(i),z=p.getZ(i),edge=Math.min(1,Math.abs(x)+Math.abs(z)*.3);
 p.setY(i,.018*(x*x+z*z)+.010*Math.sin(z*3));leafColors.push(1,.92+edge*.08,.82+edge*.12);
}
leaf.setAttribute('color',new T.Float32BufferAttribute(leafColors,3));leaf.computeVertexNormals();
const snowMound=mound.clone(),snowColors=[];
for(let i=0;i<snowMound.attributes.position.count;i++){const light=(snowMound.attributes.position.getY(i)+1)/2;snowColors.push(.80+light*.20,.88+light*.12,1);}
snowMound.setAttribute('color',new T.Float32BufferAttribute(snowColors,3));
export function createSeasonDetails(sites,se){
 const group=new T.Group();group.name='seasonal-ground';group.userData.season=se;
 const add=(geo,color,points)=>{
  if(!points.length)return;
  const material=new T.MeshStandardMaterial({color,vertexColors:!!geo.attributes.color,roughness:.95,side:T.DoubleSide}),mesh=new T.InstancedMesh(geo,material,points.length),pose=new T.Object3D();mesh.receiveShadow=true;
  points.forEach((p,i)=>{pose.position.set(p.x,GROUND_Y+p.y,p.z);pose.rotation.set(p.rx||0,p.angle||0,p.rz||0);pose.scale.set(...p.scale);pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);});group.add(mesh);
 };
 if(se===1){
  const pink=[],cream=[];
  for(const p of sites)for(let i=0;i<18;i++){const a=p.seed+i*2.399,r=.18+(i%6)*.14,point={x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r,y:.014,angle:a,scale:[.055+i%3*.016,.008,.035]};(i%4?pink:cream).push(point);}
  add(petal,'#f3becd',pink);add(petal,'#fff0db',cream);
 }
 if(se===2){
  const green=[],blue=[],lavender=[];
  for(const p of sites.filter((_,i)=>i%2===0)){
   const x=p.x+Math.sin(p.seed)*.35,z=p.z+Math.cos(p.seed)*.35;
   green.push({x,z,y:.13,scale:[.30,.16,.26]});
   for(let j=0;j<5;j++){const a=j*1.257;green.push({x:x+Math.sin(a)*.24,z:z+Math.cos(a)*.24,y:.15,angle:a,scale:[.12,.035,.23]});}
   for(let i=0;i<13;i++){const a=i*2.399,r=.07+(i%3)*.075,cx=x+Math.sin(a)*r,cz=z+Math.cos(a)*r;
    for(let j=0;j<4;j++){const t=j*Math.PI/2+a;(p.seed%3?blue:lavender).push({x:cx+Math.sin(t)*.035,z:cz+Math.cos(t)*.035,y:.28+(i%3)*.045,angle:t,scale:[.035,.014,.055]});}
   }
  }
  add(mound,'#427756',green);add(petal,'#8ebde2',blue);add(petal,'#afa6d9',lavender);
 }
 if(se===3){
  const gold=[],rust=[];
  for(const p of sites)for(let i=0;i<22;i++){const a=p.seed+i*2.399,r=.12+(i%7)*.145,point={x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r,y:.018+i%3*.003,angle:a,scale:[.08+i%3*.018,1,.052+i%2*.012]};(i%3?gold:rust).push(point);}
  add(leaf,'#d89538',gold);add(leaf,'#b95831',rust);
 }
 if(se===0){
  const snow=[],green=[],berries=[];
  for(const p of sites)for(let i=0;i<3;i++){const a=p.seed+i*2.399,r=.24+i*.19;snow.push({x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r,y:.02,angle:a,scale:[.31+i*.035,.10+i*.025,.24+i*.035]});}
  for(const p of sites.filter((_,i)=>i%3===0)){const x=p.x+.35,z=p.z-.3;
   for(let i=0;i<5;i++){const a=i*1.257;green.push({x:x+Math.sin(a)*.10,z:z+Math.cos(a)*.10,y:.14,angle:a,scale:[.09,.035,.20]});}
   for(let i=0;i<3;i++)berries.push({x:x+(i-1)*.065,z,y:.22+(i%2)*.04,scale:[.045,.045,.045]});
  }
  add(snowMound,'#f8fbff',snow);add(petal,'#648f78',green);add(petal,'#c46f62',berries);
 }
 return group;
}
export function disposeSeasonDetails(group){if(!group)return;for(const mesh of group.children){mesh.dispose();mesh.material.dispose();}group.removeFromParent();}
