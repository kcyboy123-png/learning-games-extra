import {petById} from './pets.mjs';
// shortcut: calibrated sprite ellipses, not fur segmentation; recalibrate when pose art changes.
export function contactZones(id='puppy',pose=0,facing=-1){
 const species=petById(id).species,cat=species==='cat',pig=species==='pig';
 let head=[.5,cat?.23:pig?.24:.25,.27,.19],chin=[.5,.43,.19,.115],back=[.76,.59,.20,.20];
 if(pose===5){head=[.68,.22,.25,.19];chin=[.71,.41,.17,.11];back=[.35,.55,.23,.22];}
 if(pose===10){head=[.58,.26,.26,.20];chin=[.60,.44,.18,.10];back=[.27,.53,.20,.20];}
 if(pose===9){head[1]=.18;chin[1]=.34;}
 if(pose===2||pose===4||pose>=12&&pose<=22){head=[.22,.39,.21,.22];chin=[.17,.59,.15,.12];back=[.66,.35,.26,.19];if(pose>=12&&pose<=21&&facing>0)for(const z of [head,chin,back])z[0]=1-z[0];}
 if(pose===3)return {};
 if(pose===23){head=[.33,.29,.20,.22];chin=[.34,.51,.14,.10];back=[.72,.57,.20,.18];}
 if(id==='cat-silver'){head[2]+=.02;back[0]-=.04;}if(id==='cat-cheese')back[2]-=.025;
 if(id==='pig-spotted'||id==='pig-panda')head[0]-=.025;
 return {head,chin,back};
}
export function contactPart(box,p,current,id='puppy',pose=0,facing=-1){
 const x=(p.x-box.x)/box.w,y=(p.y-box.y)/box.h,zones=contactZones(id,pose,facing);
 if(x<0||x>1||y<0||y>.82)return null;
 const distance=z=>((x-z[0])/z[2])**2+((y-z[1])/z[3])**2;
 let best=null,score=1;for(const [part,z] of Object.entries(zones)){const d=distance(z);if(d<score){best=part;score=d;}}
 if(current&&zones[current]){const d=distance(zones[current]);if(d<1.16&&score>d*.65)return current;}return best;
}
export function sampleStroke(stroke,now){const dt=Math.max(0,Math.min(200,now-(stroke.sampleAt??now)));stroke.sampleAt=now;if(stroke.inside===false||now-stroke.partStarted<320||(stroke.distance||0)<.015)return;const speed=(stroke.speed||0)*Math.exp(-Math.max(0,now-stroke.at)/240);if(speed>1.4)return;(stroke.calmMs??={head:0,chin:0,back:0})[stroke.part]+=dt;}
