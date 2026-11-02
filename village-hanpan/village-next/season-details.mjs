import * as T from '../lib/three.module.min.js';
import {cells,SIZE,RIVER} from './core.mjs?v=city1';
import {toWorld,GROUND_Y} from './grid.mjs?v=city1';
import {naturalFeature} from './landscape.mjs?v=city1';

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
const petal=new T.SphereGeometry(1,7,4),leaf=new T.CircleGeometry(1,5),mound=new T.SphereGeometry(1,10,6);
leaf.rotateX(-Math.PI/2);
export function createSeasonDetails(sites,se){
 const group=new T.Group();group.name='seasonal-ground';group.userData.season=se;
 const add=(geo,color,points)=>{
  if(!points.length)return;
  const material=new T.MeshStandardMaterial({color,roughness:.95,side:T.DoubleSide}),mesh=new T.InstancedMesh(geo,material,points.length),pose=new T.Object3D();mesh.receiveShadow=true;
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
   green.push({x,z,y:.15,scale:[.34,.20,.29]});
   for(let i=0;i<13;i++){const a=i*2.399,r=.08+(i%3)*.075,point={x:x+Math.sin(a)*r,z:z+Math.cos(a)*r,y:.28+(i%3)*.045,scale:[.09,.075,.09]};(i%3?blue:lavender).push(point);}
  }
  add(mound,'#427756',green);add(petal,'#8ebde2',blue);add(petal,'#afa6d9',lavender);
 }
 if(se===3){
  const gold=[],rust=[];
  for(const p of sites)for(let i=0;i<22;i++){const a=p.seed+i*2.399,r=.12+(i%7)*.145,point={x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r,y:.018+i%3*.003,angle:a,scale:[.08+i%3*.018,1,.052+i%2*.012]};(i%3?gold:rust).push(point);}
  add(leaf,'#d89538',gold);add(leaf,'#b95831',rust);
 }
 if(se===0){
  const snow=[];
  for(const p of sites)for(let i=0;i<3;i++){const a=p.seed+i*2.399,r=.24+i*.19;snow.push({x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r,y:.02,angle:a,scale:[.31+i*.035,.10+i*.025,.24+i*.035]});}
  add(mound,'#edf3f2',snow);
 }
 return group;
}
export function disposeSeasonDetails(group){if(!group)return;for(const mesh of group.children){mesh.dispose();mesh.material.dispose();}group.removeFromParent();}
