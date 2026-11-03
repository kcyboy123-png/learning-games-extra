import {network} from './core.mjs?v=balance1';
import {toWorld,toCell} from './grid.mjs?v=balance1';
import {gardenSites} from './meadow.mjs?v=rabbit20261104';
import {availableVisit,visitPose,roadRoute} from './residents.mjs?v=rabbit20261104';

// Animate the actual residents while the lesson clock stays paused. No saved data is changed.
export function createWelcomeLife(s,people,world){
 const promenade=(from,to)=>roadRoute(s,from,to).map(q=>{const c=toCell(q.x,q.z),p=toWorld(c.gx,c.gy);return{...q,x:p.x+(q.x-p.x)*2.35,z:p.z+(q.z-p.z)*2.35};});
 const actors=people.slice(0,4),net=network(s),hero=world.player.g.position,walkers=[];
 const seats=s.buildings.filter(b=>['tree','bench'].includes(b.type)&&availableVisit(s,b,net)).sort((a,b)=>{
  const x=visitPose(s,a).at,y=visitPose(s,b).at;return Math.hypot(x.x-hero.x,x.z-hero.z)-Math.hypot(y.x-hero.x,y.z-hero.z);
 });
 if(actors[0]&&seats[0]){const n=actors[0],pose=visitPose(s,seats[0]);Object.assign(n.p.g.position,pose.at);n.p.g.rotation.y=pose.angle;n.p.sitting=true;n.p.seatBlend=1;n.p.seatAngle=pose.angle;n.p.route=[];n.phase='rest';n.pose=pose;n.target=seats[0].id;n.wait=8;}
 const nearby=[...net].map(k=>{const [gx,gy]=k.split(',').map(Number);return{gx,gy,...toWorld(gx,gy)};}).filter(p=>Math.hypot(p.x-hero.x,p.z-hero.z)<6.6).sort((a,b)=>a.gy-b.gy||a.gx-b.gx);
 if(nearby.length>2){const ends=[nearby[1],nearby[Math.max(2,nearby.length-2)]];
  for(let i=1;i<=2;i++){const n=actors[i];if(!n)continue;const from=ends[i-1],to=ends[2-i],route=promenade(from,to);if(!route.length)continue;
   const first=route[0],dx=first.x-from.x,dz=first.z-from.z,d=Math.hypot(dx,dz)||1;n.p.g.position.set(Math.abs(dz)>Math.abs(dx)?first.x:from.x,n.p.g.position.y,Math.abs(dx)>Math.abs(dz)?first.z:from.z);n.p.g.rotation.y=Math.atan2(dx,dz);n.p.route=route;n.phase='home';n.wait=2;walkers.push({n,ends,to:2-i,wait:1.3});
  }
 }
 const gardener=actors[3],beds=gardenSites(s).sort((a,b)=>Math.hypot(a.x-hero.x,a.z-hero.z)+(a.x<hero.x?3:0)-Math.hypot(b.x-hero.x,b.z-hero.z)-(b.x<hero.x?3:0));
 if(gardener&&beds[0]){const bed=beds[0],dx=hero.x-bed.x,dz=hero.z-bed.z,d=Math.hypot(dx,dz)||1;gardener.p.g.position.x=bed.x+dx/d*.55;gardener.p.g.position.z=bed.z+dz/d*.55;gardener.p.g.rotation.y=Math.atan2(-dx,-dz);gardener.p.watering=true;gardener.p.route=[];gardener.phase='home';gardener.wait=2;}
 return{
  tick(dt){if(dt<=0)return;for(const w of walkers){if(w.n.p.route.length)continue;w.wait-=dt;if(w.wait>0)continue;w.to=1-w.to;w.n.p.route=promenade(toCell(w.n.p.g.position.x,w.n.p.g.position.z),w.ends[w.to]);w.wait=1.3;}},
  finish(){if(gardener){gardener.p.watering=false;for(const key of ['wateringCan','wateringDrops','broom'])if(gardener.p[key])gardener.p[key].visible=false;}},
  roles:actors.map(n=>n.p.sitting?'resting':n.p.watering?'gardening':walkers.some(w=>w.n===n)?'walking':'waiting')
 };
}
