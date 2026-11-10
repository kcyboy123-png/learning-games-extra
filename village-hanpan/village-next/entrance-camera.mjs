const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
// Start the reveal immediately; smooth endpoints preserve the close-up and landing.
export function entrancePose(progress,region,player,aspect){
 const motion=ease(progress),dokdo=region==='mist',rise=ease(progress/.43),settle=ease((progress-.43)/.57),wide=rise*(1-settle),arc=Math.sin(Math.PI*motion);
 const endZoom=aspect<.8?2.3:1.9,closeZoom=endZoom*1.35,wideZoom=closeZoom/(dokdo?5:3);
 return {x:player.x+.35*arc,z:player.z-.2*arc,height:21+(21*(dokdo?5:3)-21)*wide+3*settle,
  look:dokdo?player.y+1:.8,angle:.65+(dokdo?.09:-.07)*(1-motion)+(dokdo?-.12:.12)*arc,
  zoom:closeZoom*Math.pow(wideZoom/closeZoom,rise)*Math.pow(endZoom/wideZoom,settle)};
}
export function applyEntrancePose(world,pose){
 world.center.set(pose.x,0,pose.z);world.cameraHeight=pose.height;world.lookHeight=pose.look;
 world.angle=pose.angle;world.zoom=world.targetZoom=pose.zoom;
}

// A close escort opens into the destination vista; region switching stays hidden by mist.
export function voyagePose(u,boat,region,aspect,arrival={x:0,y:0,z:0}){
 const dokdo=region==='mist',reveal=ease((u-.50)/(dokdo?.24:.28)),swell=Math.sin(Math.PI*u);
 const start=voyageArrivalPose(0,region,arrival,aspect);
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
 return pose;
}





