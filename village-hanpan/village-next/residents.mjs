import {TYPES,connected,network} from './core.mjs?v=animals8';
import {origin,facing,entrance,toWorld,toCell,path} from './grid.mjs?v=animals8';
import {growthStage} from './landscape.mjs?v=animals8';

// Positions match model doors and seat centres, in the model's local coordinates.
const doors={snack:[.85,1.105],western:[0,1.07],japanese:[.9,1.1],chinese:[0,1.07],convenience:[.9,1.1],supermarket:[2.4,2.32],clinic:[0,1.07],hospital:[0,1.17],kids:[0,1.07],amusement:[2,2.62],school:[0,1.12],library:[0,1.12]};
export function visitPose(s,b){
 const angle=facing(s,b)*Math.PI/2,o=origin(b.type,b.x,b.y),rest=b.type==='bench'||b.type==='tree',sc=rest?.85:.6;
 const [x,z]=rest?(b.type==='tree'?[.4,.65]:[0,-.2]):doors[b.type]||[0,1.13];
 const point=(x,z)=>({x:o.x+(x*Math.cos(angle)+z*Math.sin(angle))*sc,z:o.z+(-x*Math.sin(angle)+z*Math.cos(angle))*sc});
 return{rest,angle,at:point(x,z),front:point(x,z+.65),road:toWorld(entrance(s,b).gx,entrance(s,b).gy),key:`${b.x},${b.y},${angle}`};
}
export function availableVisit(s,b,net){const d=TYPES[b.type];return b.progress>=1&&!b.closed&&connected(s,b,net)&&(b.type==='bench'||b.type==='tree'&&growthStage(s,b)===2||!b.starter&&(d.food||d.health||d.education||d.leisure));}
export function syncResidents(s,people,world){
 const net=network(s),homes=s.buildings.filter(b=>TYPES[b.type].cap&&b.progress>=1&&!b.closed&&connected(s,b,net));
 const count=homes.length?Math.min(8,Math.max(4,Math.ceil(s.pop/8))):0;
 while(people.length>count)world.removePerson(people.pop().p);
 for(let i=0;i<count;i++){
  let n=people[i];if(n&&homes.some(h=>h.id===n.home))continue;
  const home=homes[i%homes.length];
  if(!n){n={p:world.person(['#e0a46c','#8f93b8','#c9a35e','#7fa3a8'][i%4],String.fromCharCode(97+i)),phase:'home',wait:2+i*3,target:null};people.push(n);}
  n.home=home.id;n.phase='home';n.target=null;n.pose=null;n.wait=2+i*3;n.p.g.visible=true;n.p.sitting=false;n.p.carry.visible=false;n.p.route=[];
  const e=entrance(s,home);world.place(n.p,e.gx,e.gy);Object.assign(n.p.g.position,homeWaitingPoint(s,home,i));
 }
}
export function homeWaitingPoint(s,home,i){const e=home?entrance(s,home):{gx:5,gy:3},p=toWorld(e.gx,e.gy);return{x:p.x+Math.cos(i*Math.PI/4)*.8,z:p.z+Math.sin(i*Math.PI/4)*.8};}
export function roadRoute(s,from,to){const points=path(s,from,to,true),start=toWorld(from.gx,from.gy);return points.map((p,i)=>{const a=points[i+1]?p:(points[i-1]||start),b=points[i+1]||p,dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1;return{x:p.x-dz/d*.34,z:p.z+dx/d*.34,road:true};});}
// Keep opposite directions in separate lanes and yield only when closing the gap.
export function advancePersonRoute(p,dt,people=[]){
 if(dt<=0)return 0;p.passTime=Math.max(0,(p.passTime||0)-dt);if(!p.route.length||(p.seatBlend||0)>=.08)return 0;
 const q=p.route[0],dx=q.x-p.g.position.x,dz=q.z-p.g.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*1.6);
 if(d<.025){p.g.position.x=q.x;p.g.position.z=q.z;p.route.shift();return 0;}
 const x=p.g.position.x+dx/d*step,z=p.g.position.z+dz/d*step;
 const blocker=!p.passTime&&p.id!=='player'&&people.find(o=>o!==p&&o.id!=='player'&&o.g.visible&&!o.sitting&&Math.hypot(x-o.g.position.x,z-o.g.position.z)<.44&&Math.hypot(x-o.g.position.x,z-o.g.position.z)<Math.hypot(p.g.position.x-o.g.position.x,p.g.position.z-o.g.position.z)-1e-5);
 if(blocker){p.blockedFor=(p.blockedFor||0)+dt;
  // shortcut: one brief soft pass breaks dense crowds; use local avoidance if the cast grows beyond eight.
  if(p.blockedFor>3&&!people.some(o=>o!==p&&o.passTime>0)){p.passTime=2;p.blockedFor=0;if(q.yield)p.route.shift();return 0;}
  if(p.blockedFor>1.2&&q.road&&!q.yield&&(p.id>blocker.id||!blocker.route.length)){
   const c=toCell(p.g.position.x,p.g.position.z),center=toWorld(c.gx,c.gy),away={x:p.g.position.x-blocker.g.position.x,z:p.g.position.z-blocker.g.position.z};
   const spots=[[-.65,-.65],[-.65,.65],[.65,-.65],[.65,.65]].map(([a,b])=>({x:center.x+a,z:center.z+b,road:true,yield:true})).filter(v=>(v.x-p.g.position.x)*away.x+(v.z-p.g.position.z)*away.z>0&&people.every(o=>o===p||!o.g.visible||Math.hypot(v.x-o.g.position.x,v.z-o.g.position.z)>.55)).sort((a,b)=>Math.hypot(a.x-p.g.position.x,a.z-p.g.position.z)-Math.hypot(b.x-p.g.position.x,b.z-p.g.position.z));
   if(spots[0]){p.route.unshift(spots[0]);p.blockedFor=0;}
  }return 0;
 }
 p.blockedFor=0;
 p.g.position.x=x;p.g.position.z=z;p.distance=(p.distance||0)+step;const target=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(target-p.g.rotation.y),Math.cos(target-p.g.rotation.y));p.g.rotation.y+=diff*Math.min(1,dt*12);return 1;
}
export function tickResidents(s,people,dt,time,world){
 if(s.paused||s.ended)return null;
 let bubble=null;const net=network(s),destinations=s.buildings.filter(b=>availableVisit(s,b,net)),roadSig=[...net].join('|');
 for(let i=0;i<people.length;i++){
  const n=people[i],p=n.p,home=s.buildings.find(b=>b.id===n.home),target=s.buildings.find(b=>b.id===n.target);
  const recover=()=>{p.g.visible=true;p.sitting=false;p.carry.visible=false;p.route=[];n.phase='home';n.target=null;n.pose=null;n.wait=2+i;const nearest=[...net].map(k=>k.split(',').map(Number)).sort((a,b)=>{const x=toWorld(...a),y=toWorld(...b);return Math.hypot(x.x-p.g.position.x,x.z-p.g.position.z)-Math.hypot(y.x-p.g.position.x,y.z-p.g.position.z);})[0]||[5,3];world.place(p,...nearest);};
  if(n.target&&(!target||!availableVisit(s,target,net)||!n.pose||visitPose(s,target).key!==n.pose.key)){recover();continue;}
  if(n.roadSig!==roadSig){n.roadSig=roadSig;if(p.route.some(q=>{const c=toCell(q.x,q.z);return q.road&&!net.has(`${c.gx},${c.gy}`);})){recover();continue;}}
  if(p.route.length)continue;n.wait-=dt;if(n.wait>0)continue;
  if(n.phase==='home'){
   n.turn=(n.turn||0)+1;
   for(let j=0;j<destinations.length;j++){
    const b=destinations[(i+n.turn+j)%destinations.length];if(people.some(other=>other!==n&&other.target===b.id))continue;
    const e=entrance(s,b),from=toCell(p.g.position.x,p.g.position.z),r=roadRoute(s,from,e);
    if(!r.length&&(from.gx!==e.gx||from.gy!==e.gy))continue;
    n.pose=visitPose(s,b);n.target=b.id;n.phase='approach';p.route=[...r,n.pose.front];n.wait=0;break;
   }
   if(!n.target)n.wait=3+i;
  }else if(n.phase==='approach'){p.route=[n.pose.at];n.phase='arrive';}
  else if(n.phase==='arrive'){
   if(n.pose.rest){p.sitting=true;p.seatAngle=n.pose.angle;n.phase='rest';n.wait=7+i;}
   else{p.g.visible=false;n.phase='inside';n.wait=5+i*1.5;}
   const name=TYPES[target.type].name;
   bubble=n.pose.rest?{p,text:['바람이 참 좋다.','잠깐 쉬었다 가야지.','우리 동네가 좋아요.'][i%3],end:time+3}:null;
   n.lastPlace=name;
  }else if(n.phase==='inside'||n.phase==='rest'){
   p.g.visible=true;p.sitting=false;p.carry.visible=n.phase==='inside'&&!!TYPES[target.type].food;
   p.route=[n.pose.front,n.pose.road];n.phase='exit';
   if(p.carry.visible)bubble={p,text:target.type==='snack'?'따끈한 김밥 포장이요!':target.type==='convenience'||target.type==='supermarket'?'장보기 끝! 집으로 가요.':'맛있게 잘 먹었습니다!',end:time+3};
  }else if(n.phase==='exit'){
   n.target=null;const e=home?entrance(s,home):{gx:5,gy:3},from=toCell(p.g.position.x,p.g.position.z);p.route=roadRoute(s,from,e);if(!p.route.length&&(from.gx!==e.gx||from.gy!==e.gy)){recover();continue;}p.route.push(homeWaitingPoint(s,home,i));n.phase='back';n.wait=0;
  }else{p.carry.visible=false;n.phase='home';n.wait=4+i*2;}
 }
 return bubble;
}
