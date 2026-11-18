import {entrancePose} from './village/entrance-camera.mjs';

// Keep the village's 3.6s reveal; only its landing blends into the postal walking view.
export function postEntrancePose(seconds,player,aspect){
 const pose=entrancePose(Math.min(1,seconds/3.6),'main',player,aspect);
 if(seconds<=3.6)return pose;
 const t=Math.min(1,(seconds-3.6)/.65),k=t*t*(3-2*t);
 const end={x:player.x,z:player.z,height:player.y+21,look:player.y+.8,angle:.58,zoom:aspect<.8?3.105:2.565};
 for(const key of Object.keys(end))pose[key]+=(end[key]-pose[key])*k;
 return pose;
}
