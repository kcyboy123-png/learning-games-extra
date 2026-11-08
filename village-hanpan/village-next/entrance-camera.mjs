const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
// Camera-only staging: saved positions and the walk graph never move.
export function entrancePose(progress,region,player,aspect){
 const dokdo=region==='mist',u=ease(dokdo?progress:Math.max(0,(progress-.06)/.94)),portrait=aspect<.8;
 const startZoom=Math.min(dokdo?.29:.30,aspect*.42),endZoom=dokdo?(aspect<1?2.1:1.65):(portrait?2.3:1.9);
 return {x:player.x*u+(!dokdo?1.2*(1-u):0)+(dokdo?-1.8:0)*Math.sin(Math.PI*u),z:(dokdo?-2:11)*(1-u)+player.z*u+(!dokdo?1.4:0)*Math.sin(Math.PI*u),
  height:(dokdo?60:52)*(1-u)+24*u,look:(dokdo?2.5:1)*(1-u)+(dokdo?player.y+1:.8)*u+(dokdo?1.4:0)*Math.sin(Math.PI*u),
  angle:.65+(dokdo?-.22:.22)*(1-u)+(dokdo?.11:.10)*Math.sin(Math.PI*u),zoom:startZoom*Math.pow(endZoom/startZoom,u)};
}
export function applyEntrancePose(world,pose){
 world.center.set(pose.x,0,pose.z);world.cameraHeight=pose.height;world.lookHeight=pose.look;
 world.angle=pose.angle;world.zoom=world.targetZoom=pose.zoom;
}

// A close escort opens into the destination vista; region switching stays hidden by mist.
export function voyagePose(u,boat,region,aspect){
 const dokdo=region==='mist',reveal=ease((u-.50)/(dokdo?.24:.28)),swell=Math.sin(Math.PI*u);
 const start=voyageArrivalPose(0,region,{x:0,y:0,z:0},aspect);
 return {x:boat.x*(1-reveal)+start.x*reveal,z:(boat.z+1.8*swell)*(1-reveal)+start.z*reveal,
 height:(15+9*swell)*(1-reveal)+start.height*reveal,look:.6*(1-reveal)+start.look*reveal,
 angle:(-.48-.24*swell)*(1-reveal)+start.angle*reveal,
 zoom:(Math.min(1.55,aspect*1.7)-.28*swell)*(1-reveal)+start.zoom*reveal,
 opening:u<.5?0:ease((u-.57)/.36),mist:u<.5?ease((u-.32)/.16):1-(1-(dokdo?.08:.025))*ease((u-(dokdo?.56:.54))/(dokdo?.31:.32))};
}

// Briefly let the destination breathe before bringing the player into the scene.
export function voyageArrivalPose(u,region,player,aspect){
 const hold=region==='mist'?.15:.12;
 const progress=Math.max(0,(u-hold)/(1-hold)),pose=entrancePose(progress,region,player,aspect);
 pose.height-=4*(1-ease(progress));pose.look+=.5*(1-ease(progress));
 pose.x+=(region==='mist'?1.05:-.85)*Math.sin(Math.PI*ease(progress));
 pose.angle+=(region==='mist'?-.065:.045)*Math.sin(Math.PI*ease(progress));
 pose.zoom*=1+(region==='mist'?.16:.10)*(1-ease(region==='mist'?progress:Math.max(0,(progress-.06)/.94)));return pose;
}
