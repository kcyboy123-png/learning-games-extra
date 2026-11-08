// walk.mjs — first-person movement, collision and walking-surface height. Pure module shared with Node tests.
import {height,insideSite,WALK_MARGIN,smooth} from './terrain.mjs';
import {material,toLocal,restY} from './core.mjs';
export const EYE=1.5,SPEED=2.2,BODY=.32;
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const finite=n=>Number.isFinite(n)?n:0;
export function input(x,z){x=clamp(finite(x),-1,1);z=clamp(finite(z),-1,1);const l=Math.max(1,Math.hypot(x,z));return {x:x/l,z:z/l};}
// Walking tops resolved once per items change: decks and the pavilion floor. {deck, top}
export const deckSurfaces=(items,terrain)=>items.filter(i=>material(i.kind)?.walkTop!==undefined).map(d=>({deck:d,top:restY(items,d,terrain)+material(d.kind).walkTop}));
// Ground + deck tops blended over a short approach band: the camera never pops at a deck edge.
export function walkHeight(x,z,terrain,surfaces=[]){
 let h=height(x,z,terrain);
 for(const {deck,top} of surfaces){const f=material(deck.kind).foot,l=toLocal(deck,x,z);const ex=Math.max(0,Math.abs(l.x)-f.w)*deck.scale,ez=Math.max(0,Math.abs(l.z)-f.d)*deck.scale;const dist=Math.hypot(ex,ez);if(dist>.45)continue;const t=1-smooth(0,.45,dist);const g=height(x,z,terrain);h=Math.max(h,g+(top-g)*t);}
 return h;
}
// Collision bodies: oriented boxes per material, padded by the body radius. Footprints with rotation and scale.
export function blockedBy(items,x,z,radius=BODY){
 for(const it of items){const m=material(it.kind);if(!m||!m.body.length)continue;const l=toLocal(it,x,z);const pad=radius/it.scale;
  for(const b of m.body)if(Math.abs(l.x-b.x)<=b.w+pad&&Math.abs(l.z-b.z)<=b.d+pad)return it;}
 return null;
}
export const walkable=(items,x,z,radius=BODY)=>insideSite(x,z,WALK_MARGIN)&&!blockedBy(items,x,z,radius);
export function step(pos,inp,yaw,dt,items){
 const v=input(inp.x,inp.z),a=finite(yaw),d=clamp(finite(dt),0,.05)*SPEED;
 const dx=(v.x*Math.cos(a)+v.z*Math.sin(a))*d,dz=(-v.x*Math.sin(a)+v.z*Math.cos(a))*d;
 let {x,z}=pos;
 if(walkable(items,x+dx,z+dz)){x+=dx;z+=dz;}
 else if(walkable(items,x+dx,z))x+=dx;
 else if(walkable(items,x,z+dz))z+=dz;
 else{ // glide along the boundary: try shallower directions
  for(const k of [.5,-.5]){const c=Math.cos(k),s=Math.sin(k);const rx=dx*c-dz*s,rz=dx*s+dz*c;if(walkable(items,x+rx*.7,z+rz*.7)){x+=rx*.7;z+=rz*.7;break;}}}
 const moved=Math.hypot(x-pos.x,z-pos.z);
 return {x,z,moved};
}
export function look(view,dx=0,dy=0){return {yaw:(view.yaw-finite(dx)*.005)%(Math.PI*2),pitch:clamp(view.pitch+finite(dy)*.004,-.55,.6)};}
// yaw 0 looks north (-z); positive pitch looks down. Horizon roll is always zero.
export function eye(x,y,z,view){const c=Math.cos(view.pitch);return {position:{x,y,z},target:{x:x-Math.sin(view.yaw)*c,y:y-Math.sin(view.pitch),z:z-Math.cos(view.yaw)*c}};}
// Find standing room near a wanted spot; null when nothing within reach is clear.
export function safeSpot(items,x,z,reach=3.5){
 const clear=(px,pz)=>walkable(items,px,pz,BODY+.1);
 if(clear(x,z))return {x,z};
 for(let r=.35;r<=reach;r+=.35)for(let i=0;i<16;i++){const a=i/16*Math.PI*2+r;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(clear(px,pz))return {x:px,z:pz};}
 return null;
}
