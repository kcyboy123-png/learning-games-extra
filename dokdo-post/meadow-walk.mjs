import {toCell,toWorld,walkable} from './village/grid.mjs';
import {at} from './village/core.mjs';

// Tree canopies cover a full tile; only their trunks should block a stroll.
export function meadowFloor(state){
 const trees=state.buildings.filter(b=>b.type==='tree').map(b=>toWorld(b.x,b.y));
 return (x,z)=>{
  for(const [dx,dz]of [[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]]){
   const {gx,gy}=toCell(x+dx,z+dz);
   if(!walkable(state,gx,gy)&&at(state,gx,gy)?.type!=='tree')return false;
  }
  return trees.every(t=>Math.hypot(x-t.x,z-t.z)>.64);
 };
}
export function meadowStep(p,v,distance,canStand){
 const next={x:p.x,z:p.z},n=Math.max(1,Math.ceil(distance/.08)),d=distance/n;
 for(let i=0;i<n;i++){
  if(canStand(next.x+v.x*d,next.z))next.x+=v.x*d;
  if(canStand(next.x,next.z+v.z*d))next.z+=v.z*d;
 }
 return next;
}
