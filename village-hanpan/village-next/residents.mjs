import {trailCells} from './dokdo-terrain.mjs';
import {residentDialogue,prefersPlace,outdoorPlace,gardenPlace,personality} from './resident-dialogue.mjs?v=islands1';
import {PLAYER_SPEED} from './move.mjs?v=perf1';
import {TYPES,connected,network} from './core.mjs?v=perf1';
import {origin,facing,entrance,toWorld,toCell,path,roadSet} from './grid.mjs?v=perf1';
import {growthStage} from './landscape.mjs?v=perf1';

// Positions match model doors and seat centres, in the model's local coordinates.
const doors={chicken:[0,1.12],buffet:[0,2.5],police:[0,1.12],cinema:[0,2.5],animalFarm:[0,3.5],harbor:[0,2.6],rabbitTower:[0,3.5],skyTower:[0,1.94],largePark:[0,7.3],rosePark:[0,3.5],snack:[.85,1.105],western:[0,1.07],japanese:[.9,1.1],chinese:[0,1.07],convenience:[.9,1.1],supermarket:[2.4,2.32],clinic:[0,1.07],hospital:[0,1.17],kids:[0,1.07],amusement:[2,2.62],school:[0,1.12],library:[0,1.12]};
export function visitPose(s,b,roads=roadSet(s)){
 const angle=facing(s,b,roads)*Math.PI/2,o=origin(b.type,b.x,b.y),rest=b.type==='bench'||b.type==='tree',sc=rest?.85:.6;
 const [x,z]=rest?(b.type==='tree'?[.4,.65]:[0,-.2]):doors[b.type]||[0,1.13];
 const point=(x,z)=>({x:o.x+(x*Math.cos(angle)+z*Math.sin(angle))*sc,z:o.z+(-x*Math.sin(angle)+z*Math.cos(angle))*sc});
 return{rest,angle,at:point(x,z),front:point(x,z+.65),road:toWorld(entrance(s,b,roads).gx,entrance(s,b,roads).gy),key:`${b.x},${b.y},${angle}`};
}
export function availableVisit(s,b,net){const d=TYPES[b.type];return b.progress>=1&&!b.closed&&connected(s,b,net)&&(b.type==='bench'||b.type==='tree'&&growthStage(s,b)===2||!b.starter&&(d.food||d.health||d.education||d.leisure||outdoorPlace(b.type)));}
const residentCache=new WeakMap();
export function residentContext(s){
 const net=network(s),key=s.buildings.map(b=>`${b.id}:${b.type}:${b.x},${b.y}:${b.dir}:${b.progress>=1}:${!!b.closed}:${b.type==='tree'?growthStage(s,b):0}`).join('|');
 let value=residentCache.get(s);
 // File reload replaces the state; no cached building objects enter a different save.
 if(!value||value.key!==key||value.net!==net||value.buildings!==s.buildings){value={key,net,buildings:s.buildings,roads:roadSet(s),roadSig:[...net].join('|'),byId:new Map(s.buildings.map(b=>[b.id,b])),homes:s.buildings.filter(b=>TYPES[b.type].cap&&b.progress>=1&&!b.closed&&connected(s,b,net)),destinations:s.buildings.filter(b=>availableVisit(s,b,net))};residentCache.set(s,value);}
 return value;
}
export function syncResidents(s,people,world,context=residentContext(s)){
 if(s.island==='mist'){
  const count=Math.min(6,3+Math.floor((s.otherIsland?.pop||0)/80));
  while(people.length>count)world.removePerson(people.pop().p);
  while(people.length<count){const i=people.length,n={p:world.person(['#e0a46c','#8f93b8','#7fa3a8'][i%3],String.fromCharCode(97+i)),visitor:true,phase:'stroll',wait:1+i,target:null,turn:i};people.push(n);world.place(n.p,14-i*2,12);}
  return;
 }
 const {homes}=context;
 const count=homes.length?Math.min(24,Math.ceil(s.pop/2)):0;
 while(people.length>count)world.removePerson(people.pop().p);
 for(let i=0;i<count;i++){
  let n=people[i];if(n&&homes.some(h=>h.id===n.home))continue;
  const home=homes[i%homes.length];
  if(!n){n={p:world.person(['#e0a46c','#8f93b8','#c9a35e','#7fa3a8'][i%4],String.fromCharCode(97+i)),phase:'home',wait:2+(i%8)*2,target:null};people.push(n);}
  n.home=home.id;n.phase='home';n.target=null;n.pose=null;n.wait=2+(i%8)*2;n.p.g.visible=true;n.p.sitting=false;n.p.watering=false;n.p.carry.visible=false;n.p.route=[];
  const e=entrance(s,home);world.place(n.p,e.gx,e.gy);Object.assign(n.p.g.position,homeWaitingPoint(s,home,i));
 }
}
export function homeWaitingPoint(s,home,i){
 const e=home?entrance(s,home):{gx:5,gy:3},net=network(s),roads=[...net].map(k=>k.split(',').map(Number));
 roads.sort((a,b)=>(Math.abs(a[0]-e.gx)+Math.abs(a[1]-e.gy))-(Math.abs(b[0]-e.gx)+Math.abs(b[1]-e.gy))||a[1]-b[1]||a[0]-b[0]);
 const [gx,gy]=roads[Math.floor(i/2)%Math.max(1,roads.length)]||[e.gx,e.gy],p=toWorld(gx,gy),side=i%2?.92:-.92,horizontal=net.has(`${gx+1},${gy}`)&&!net.has(`${gx},${gy+1}`);
 const along=Math.floor(i/Math.max(2,roads.length*2))*.52;
 return{x:p.x+(horizontal?along:side),z:p.z+(horizontal?side:along)};
}
export function roadRoute(s,from,to){const points=path(s,from,to,true),start=toWorld(from.gx,from.gy);return points.map((p,i)=>{const a=points[i+1]?p:(points[i-1]||start),b=points[i+1]||p,dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1;return{x:p.x-dz/d*.34,z:p.z+dx/d*.34,road:true};});}
// Keep opposite directions in separate lanes and yield only when closing the gap.
export function advancePersonRoute(p,dt,people=[]){
 if(dt<=0)return 0;p.passTime=Math.max(0,(p.passTime||0)-dt);if(!p.route.length||(p.seatBlend||0)>=.08)return 0;
 while(p.route.length&&Math.hypot(p.route[0].x-p.g.position.x,p.route[0].z-p.g.position.z)<1e-7)p.route.shift();
 if(!p.route.length)return 0;
 const q=p.route[0],dx=q.x-p.g.position.x,dz=q.z-p.g.position.z,d=Math.hypot(dx,dz),slopeDistance=Number.isFinite(q.y)?Math.hypot(d,q.y-p.g.position.y):d,step=Math.min(d,dt*(p.id==='player'?PLAYER_SPEED:1.6)*d/slopeDistance);
 const x=p.g.position.x+dx/d*step,z=p.g.position.z+dz/d*step,arrived=d-step<1e-7;
 const blocker=!p.passTime&&p.id!=='player'&&people.find(o=>o!==p&&o.id!=='player'&&o.g.visible&&!o.sitting&&Math.hypot(x-o.g.position.x,z-o.g.position.z)<.44&&Math.hypot(x-o.g.position.x,z-o.g.position.z)<Math.hypot(p.g.position.x-o.g.position.x,p.g.position.z-o.g.position.z)-1e-5);
 if(blocker){p.blockedFor=(p.blockedFor||0)+dt;
  // shortcut: one brief soft pass breaks dense crowds; use local avoidance if the cast grows beyond 24.
  if(p.blockedFor>3&&!people.some(o=>o!==p&&o.passTime>0)){p.passTime=2;p.blockedFor=0;if(q.yield)p.route.shift();return 0;}
  if(p.blockedFor>1.2&&q.road&&!q.yield&&(p.id>blocker.id||!blocker.route.length)){
   const c=toCell(p.g.position.x,p.g.position.z),center=toWorld(c.gx,c.gy),away={x:p.g.position.x-blocker.g.position.x,z:p.g.position.z-blocker.g.position.z};
   const spots=[[-.65,-.65],[-.65,.65],[.65,-.65],[.65,.65]].map(([a,b])=>({x:center.x+a,z:center.z+b,road:true,yield:true})).filter(v=>(v.x-p.g.position.x)*away.x+(v.z-p.g.position.z)*away.z>0&&people.every(o=>o===p||!o.g.visible||Math.hypot(v.x-o.g.position.x,v.z-o.g.position.z)>.55)).sort((a,b)=>Math.hypot(a.x-p.g.position.x,a.z-p.g.position.z)-Math.hypot(b.x-p.g.position.x,b.z-p.g.position.z));
   if(spots[0]){p.route.unshift(spots[0]);p.blockedFor=0;}
  }return 0;
 }
 p.blockedFor=0;
 if(Number.isFinite(q.y))p.g.position.y+=(q.y-p.g.position.y)*(step/d);p.g.position.x=arrived?q.x:x;p.g.position.z=arrived?q.z:z;if(arrived)p.route.shift();p.distance=(p.distance||0)+step;const target=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(target-p.g.rotation.y),Math.cos(target-p.g.rotation.y));p.g.rotation.y+=diff*(1-Math.exp(-dt*12));return 1;
}
export function tickResidents(s,people,dt,time,world,context=residentContext(s)){
 if(s.paused||s.ended)return null;
 if(s.island==='mist'){
  let bubble=null;
  const stops=trailCells.filter(([x,y],i,a)=>a.findIndex(p=>p[0]===x&&p[1]===y)===i);
  for(let i=0;i<people.length;i++){const n=people[i],p=n.p;p.g.visible=true;if(p.route.length)continue;n.wait-=dt;if(n.wait>0)continue;
   const from=toCell(p.g.position.x,p.g.position.z);n.turn=(n.turn||0)+1;
   for(let j=0;j<stops.length;j++){const [gx,gy]=stops[(n.turn*5+i*3+j)%stops.length],r=path(s,from,{gx,gy});if(r.length){p.route=r;break;}}
   n.wait=5+(i+n.turn)%7;if(!bubble)bubble={p,text:residentDialogue(s,n),end:time+4};
  }return bubble;
 }
 let bubble=null;const {net,destinations,roadSig,byId,roads}=context;
 // Rotate visit priority so a few early residents cannot reserve the only shop forever.
 for(let slot=0;slot<people.length;slot++){
  const i=(slot+Math.floor(time/8))%people.length,n=people[i],p=n.p,home=byId.get(n.home),target=byId.get(n.target);
  const recover=()=>{p.g.visible=true;p.sitting=false;p.watering=false;p.carry.visible=false;p.route=[];n.phase='home';n.target=null;n.pose=null;n.wait=2+i;const nearest=[...net].map(k=>k.split(',').map(Number)).sort((a,b)=>{const x=toWorld(...a),y=toWorld(...b);return Math.hypot(x.x-p.g.position.x,x.z-p.g.position.z)-Math.hypot(y.x-p.g.position.x,y.z-p.g.position.z);})[0]||[5,3];world.place(p,...nearest);};
  if(n.target&&(!target||!availableVisit(s,target,net)||!n.pose||visitPose(s,target,roads).key!==n.pose.key)){recover();continue;}
  if(n.roadSig!==roadSig){n.roadSig=roadSig;if(p.route.some(q=>{const c=toCell(q.x,q.z);return q.road&&!net.has(`${c.gx},${c.gy}`);})){recover();continue;}}
  if(p.route.length)continue;if(n.phase==='observe'&&target){const o=origin(target.type,target.x,target.y),a=Math.atan2(o.x-p.g.position.x,o.z-p.g.position.z),d=Math.atan2(Math.sin(a-p.g.rotation.y),Math.cos(a-p.g.rotation.y));p.g.rotation.y+=d*(1-Math.exp(-dt*4));}n.wait-=dt;if(n.wait>0)continue;
  if(n.phase==='home'){
   n.turn=(n.turn||0)+1;
   const choices=destinations.map((b,j)=>({b,rank:(b.id===n.lastTarget?4:0)+(prefersPlace(n,b.type)?0:2),order:(j-i-n.turn+destinations.length*100)%destinations.length})).sort((a,b)=>a.rank-b.rank||a.order-b.order);
   for(const {b} of choices){if(people.some(other=>other!==n&&other.target===b.id))continue;
    const e=entrance(s,b),from=toCell(p.g.position.x,p.g.position.z),r=roadRoute(s,from,e);
    if(!r.length&&(from.gx!==e.gx||from.gy!==e.gy))continue;
    n.pose=visitPose(s,b,roads);n.target=b.id;n.phase='approach';p.route=outdoorPlace(b.type)?r:[...r,n.pose.front];n.wait=0;break;
   }
   if(!n.target){
    n.wait=3+i;const from=toCell(p.g.position.x,p.g.position.z),near=[...net].map(k=>{const[gx,gy]=k.split(',').map(Number);return{gx,gy,d:Math.abs(gx-from.gx)+Math.abs(gy-from.gy)};}).filter(q=>q.d>0&&q.d<=3);
    if(near.length)p.route=roadRoute(s,from,near[(i+n.turn)%near.length]);
   }
  }else if(n.phase==='approach'){if(outdoorPlace(target.type)){n.phase='observe';n.wait=7+(i+n.turn)%6;p.watering=gardenPlace(target.type)&&personality(n)==='gardener';bubble={p,text:residentDialogue(s,n,target.type),end:time+4};}else{p.route=[n.pose.at];n.phase='arrive';}}
  else if(n.phase==='arrive'){
   if(n.pose.rest){p.sitting=true;p.seatAngle=n.pose.angle;n.phase='rest';n.wait=7+i;}
   else{p.g.visible=false;n.phase='inside';n.wait=4+i%4;}
   const name=TYPES[target.type].name;
   bubble=n.pose.rest?{p,text:residentDialogue(s,n,target.type),end:time+3}:null;
   n.lastPlace=name;
  }else if(n.phase==='inside'||n.phase==='rest'||n.phase==='observe'){
   p.g.visible=true;p.sitting=false;p.watering=false;p.carry.visible=n.phase==='inside'&&!!TYPES[target.type].food;
   p.route=n.phase==='observe'?[]:[n.pose.front,n.pose.road];n.phase='exit';
   if(p.carry.visible)bubble={p,text:residentDialogue(s,n,target.type),end:time+3};
  }else if(n.phase==='exit'){
   n.lastTarget=n.target;n.target=null;const e=home?entrance(s,home):{gx:5,gy:3},from=toCell(p.g.position.x,p.g.position.z);p.route=roadRoute(s,from,e);if(!p.route.length&&(from.gx!==e.gx||from.gy!==e.gy)){recover();continue;}p.route.push(homeWaitingPoint(s,home,i));n.phase='back';n.wait=0;
  }else{p.carry.visible=false;n.phase='home';n.wait=3+i%5;}
 }
 return bubble;
}
