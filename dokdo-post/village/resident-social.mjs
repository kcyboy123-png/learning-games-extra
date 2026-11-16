// Runtime-only encounters: no save fields, new geometry, or movement destinations.
export function tickSocial(people,player,dt,time,canMeet=()=>true){
 if(!player?.g.visible||dt<=0)return null;
 let nearest=null,distance=2.4;
 player.social=player.route.length||player.moving>.08?0:Math.max(0,(player.social||0)-dt);player.socialSampleTime=time;
 for(const n of people){
  const p=n.p;p.social=Math.max(0,(p.social||0)-dt);p.socialSampleTime=time;p.socialRest=Math.max(0,(p.socialRest||0)-dt);
  const d=Math.hypot(p.g.position.x-player.g.position.x,p.g.position.z-player.g.position.z);
  if(d>3.2)n.greetArmed=true;
  if(p.social>0&&!p.route.length){const angle=Math.atan2(player.g.position.x-p.g.position.x,player.g.position.z-p.g.position.z),diff=Math.atan2(Math.sin(angle-p.g.rotation.y),Math.cos(angle-p.g.rotation.y));p.g.rotation.y+=diff*(1-Math.exp(-dt*4));}
  if(!p.g.visible||p.route.length||p.moving>.08||p.sitting||p.watering||p.carry.visible||Math.abs(p.g.position.y-player.g.position.y)>.65)continue;
  if(d<distance&&n.greetArmed!==false&&time>=(n.greetAfter||0)){nearest=n;distance=d;}
 }
 if(!nearest||player.route.length||player.moving>.08||time<(player.greetAfter||0))return null;
 if(!canMeet(nearest.p,player)){nearest.greetAfter=time+2;return null;}
 nearest.p.social=2.4;nearest.p.socialRest=4.4;nearest.greetAfter=time+24;
 if(nearest.p.residentArt?.e.ready&&!nearest.p.residentArt.e.failed)nearest.p.g.rotation.y=Math.atan2(player.g.position.x-nearest.p.g.position.x,player.g.position.z-nearest.p.g.position.z);
 nearest.greetArmed=false;
 player.social=2.9;
 player.greetAfter=time+8;
 return nearest;
}
export function socialAmount(p,reduced,time=p.socialSampleTime){
 if(reduced||p.moving>.08||p.route.length||p.sitting||p.watering)return 0;
 const remaining=(p.social||0)-Math.max(0,(time??0)-(p.socialSampleTime??time??0)),duration=2.4;
 return remaining>0&&remaining<duration?Math.sin((duration-remaining)/duration*Math.PI):0;
}
export function idleStretch(p,time,reduced){
 if(reduced||p.moving>.08||p.route.length||p.sitting||p.watering||p.carry.visible||p.social>0||p.socialRest>0)return 0;
 const phase=(time+p.id.charCodeAt(0)*1.73)%19;
 return phase>15&&phase<18?Math.sin((phase-15)/3*Math.PI):0;
}
