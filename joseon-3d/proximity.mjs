// Pure helpers shared by field clues and village sidequests.
// Reach is measured from an object's footprint rectangle {x,z,w,d}, so front and side
// approaches count, not only the single legacy stand point (kept as a fallback).
export const REACH=1.35;
export function footprintDistance(p,t){
 const dx=Math.max(0,Math.abs(p.x-t.x)-(t.w||1)/2),dz=Math.max(0,Math.abs(p.z-t.z)-(t.d||1)/2);
 return Math.hypot(dx,dz);
}
export function clearApproach(world,p,t){
 if(!world)return true;
 const blockers=world.colliders.filter(c=>!(Math.abs(t.x-c.x)<=c.w/2&&Math.abs(t.z-c.z)<=c.d/2));
 const n=Math.max(1,Math.ceil(Math.hypot(t.x-p.x,t.z-p.z)/.05));
 for(let i=0;i<=n;i++){const x=p.x+(t.x-p.x)*i/n,z=p.z+(t.z-p.z)*i/n;
  if(blockers.some(c=>Math.abs(x-c.x)<c.w/2&&Math.abs(z-c.z)<c.d/2))return false;
 }
 return true;
}
export function withinReach(p,t,reach=REACH,world){return footprintDistance(p,t)<=reach&&clearApproach(world,p,t);}
// Candidate approach points around the footprint: front, back, both sides, four corners, then stand.
export function approachPoints(t,pad=.8){
 const hw=(t.w||1)/2+pad,hd=(t.d||1)/2+pad,c=.78;
 const pts=[[hw,0],[-hw,0],[0,hd],[0,-hd],[hw*c,hd*c],[-hw*c,hd*c],[hw*c,-hd*c],[-hw*c,-hd*c]].map(([dx,dz])=>({x:t.x+dx,z:t.z+dz}));
 if(t.stand)pts.push({x:t.stand.x,z:t.stand.z,stand:true});
 return pts;
}
function pathLength(from,path){let n=0,p=from;for(const q of path){n+=Math.hypot(q.x-p.x,q.z-p.z);p=q;}return n;}
// Picks the walkable candidate with the shortest route from `from`; stand point is the last resort.
export function chooseApproach(world,from,t,{walkable,route},pad=.8){
 let best=null,fallback=null;
 for(const p of approachPoints(t,pad)){
  if(!walkable(world,p.x,p.z)||!withinReach(p,t,REACH,world))continue;
  const path=route(world,from,p);if(!path.length)continue;
  const pick={x:p.x,z:p.z,length:pathLength(from,path)};
  if(p.stand)fallback=pick;else if(!best||pick.length<best.length)best=pick;
 }
 return best||fallback;
}
