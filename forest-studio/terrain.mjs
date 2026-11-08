// terrain.mjs — the one continuous height field shared by rendering, picking, walking and placement.
// Pure module: no DOM, no three. Units are roughly metres; +x east, +z south (toward the entrance).
export const SITE={hx:10,hz:12};
// The wobbling boundary bulges past SITE; serialized coordinates and masks use this outer box.
export const BOUND={hx:SITE.hx*1.2,hz:SITE.hz*1.2};
export const TERRAINS={
 'clearing-v6':{rev:1,name:'높낮이가 있는 빈터'},
 'flat-v1':{rev:1,name:'평지 (기존 작품)'}
};
export const DEFAULT_TERRAIN='clearing-v6';
export const ENTRANCE={
 'clearing-v6':{x:0,z:9.75,yaw:0,pitch:.03},
 'flat-v1':{x:0,z:5.6,yaw:0,pitch:.03}
};
export const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const plateau=(x,z,cx,cz,flat,outer,a)=>a*(1-smooth(flat,outer,Math.hypot(x-cx,z-cz)));
// Normalised distance from the clearing centre: exactly 1 on the irregular (rounded, wobbling) boundary.
export function siteFactor(x,z){
 const t=Math.atan2(z,x);
 const w=1+.06*Math.sin(3*t+.8)+.04*Math.sin(5*t+2.1)+.03*Math.sin(7*t-.5);
 return Math.cbrt((Math.abs(x)/SITE.hx)**3+(Math.abs(z)/SITE.hz)**3)*w;
}
export const insideSite=(x,z,margin=1)=>Number.isFinite(x)&&Number.isFinite(z)&&siteFactor(x,z)<=margin;
export const EDIT_MARGIN=.96,WALK_MARGIN=.985;
// The inner clearing: two low hills, one shallow hollow, flat arrival. Outside: rim mounds, then distant ridges.
export function height(x,z,terrain=DEFAULT_TERRAIN){
 if(!Number.isFinite(x)||!Number.isFinite(z))return 0;
 const f=siteFactor(x,z);let h=0;
 if(terrain==='clearing-v6'){
  // Tuned 2026-11-07 by random search (tests/slope-tune.mjs): max inner slope ~10 deg, arrival ring < 0.1 deg.
  h+=plateau(x,z,5.5,-6,1.55,8.5,.77);     // north-east hill: a place to look down on the forest
  h+=plateau(x,z,-5.5,-3.5,2.45,7.8,.55);  // north-west mound: broad and low
  h-=plateau(x,z,1.35,4.35,1.05,4.05,.23); // shallow hollow between the centre and the entrance
  h+=.03*Math.sin(x*.7+1)*Math.cos(z*.55)*smooth(1.2,3,Math.hypot(x,z-9.75));
 }
 const a=Math.atan2(z,x);
 h+=1.7*smooth(1,1.45,f)+.9*smooth(1.3,2.3,f);
 h+=smooth(1.8,3.2,f)*(2.5+1.2*Math.sin(a*3+1)+.8*Math.sin(a*7));
 return h;
}
export function normal(x,z,terrain=DEFAULT_TERRAIN,e=.08){
 const dx=(height(x+e,z,terrain)-height(x-e,z,terrain))/(2*e),dz=(height(x,z+e,terrain)-height(x,z-e,terrain))/(2*e);
 const l=Math.hypot(dx,1,dz);return {x:-dx/l,y:1/l,z:-dz/l};
}
export function slopeDegrees(x,z,terrain=DEFAULT_TERRAIN){const n=normal(x,z,terrain);return Math.acos(Math.min(1,n.y))*180/Math.PI;}
// Ray march against the exact height field so taps land on the same surface the camera walks on.
export function intersectRay(ox,oy,oz,dx,dy,dz,terrain=DEFAULT_TERRAIN,maxDist=160){
 let t=0,prev=oy-height(ox,oz,terrain);if(prev<0)return null;
 const step=.25;
 for(;t<maxDist;t+=step){const x=ox+dx*t,y=oy+dy*t,z=oz+dz*t;const d=y-height(x,z,terrain);
  if(d<0){let lo=t-step,hi=t;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(oy+dy*m-height(ox+dx*m,oz+dz*m,terrain)<0)hi=m;else lo=m;}const s=(lo+hi)/2;return {x:ox+dx*s,y:oy+dy*s,z:oz+dz*s,t:s};}
  prev=d;}
 return null;
}
