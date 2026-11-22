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
 if(pose===26){
  const right=id==='puppy'||id==='cat-gray';
  const x=right?.66:.42,y=id==='puppy'?.49:id==='cat-gray'?.63:cat?.55:.60;
  head=[x,y,.22,.17];chin=[x,pig?.88:y+(cat&&!right?.13:.16),.15,.09];back=[right?.29:.71,cat?.49:.43,.18,.16];
 }else if(pose===24||pose===25||pose===27){
  const leaning=pose===25;
  let x=leaning?.61:.42;
  if(id==='puppy')x=leaning?.68:.54;
  if(id==='cat-cheese')x=pose===24?.27:.34;
  if(id==='cat-gray')x=leaning?.75:.66;
  if(pig&&id!=='pig-pink')x=.32;
  head=[x,leaning?.19:.23,.24,.17];chin=[x,leaning?.36:.41,.17,.10];back=[x>.52&&!pig?.32:.64,.60,.18,.17];
 }
 if(pose>=28&&pose<=39){
  const cheese=id==='cat-cheese',silver=id==='cat-silver',gray=id==='cat-gray';
  let x=cheese?.32:silver?.40:.5,y=.24;
  if(pose===29)y=.14;
  if(pose===30)x=cheese?.29:.44;
  if(pose===31)x=cheese?.42:.58;
  if(pose===32)x=gray?.42:cheese?.34:.61;
  if(pose===33)x=gray?.61:cheese?.65:.40;
  if(pose===34)x=cheese?.35:.50;
  if(pose===35){x=cheese?.29:silver?.34:.43;y=.33;}
  if(pose===33&&id.startsWith('shiba-'))x=.49;
  if((pose===32||pose===33)&&silver)y=.30;
  if(pose===33&&silver)x=.62;
  head=[x,y,.25,.19];chin=[x,y+(pose===29?.17:.21),.16,.105];back=[x>.52?.30:.70,pose===35?.51:.62,.18,.17];
  if(cheese&&[29,31,34].includes(pose))back[0]=.50;
 }
 if(pose>=36&&pose<=39){
  let x=id==='cat-cheese'?.35:id==='cat-silver'?.42:.5,y=.25;
  if(pose===38){x=id==='puppy'?.68:.32;y=.60;}
  if(pose===39){x=id==='cat-gray'?.76:.30;y=.53;}
  head=[x,y,.22,.19];chin=[x,y+.16,.15,.09];back=[x>.55?.30:.72,pose>=38?.36:.60,.18,.17];
  if(id==='cat-cheese'&&pose<38)back[0]=.50;
 }
 for(const [zone,wide,deep] of [[head,.045,.026],[chin,.050,.026],[back,.062,.066]]){zone[2]+=wide;zone[3]+=deep;}
 return {head,chin,back};
}
export function contactPart(box,p,current,id='puppy',pose=0,facing=-1,zones=contactZones(id,pose,facing)){
 const x=(p.x-box.x)/box.w,y=(p.y-box.y)/box.h;
 if(x<0||x>1||y<0||y>(pose===26?.92:.89))return null;
 const distance=z=>((x-z[0])/z[2])**2+((y-z[1])/z[3])**2;
 let best=null,score=1;for(const part in zones){const d=distance(zones[part]);if(d<score){best=part;score=d;}}
 if(current&&zones[current]){const d=distance(zones[current]);if(d<1.16&&score>d*.65)return current;}return best;
}
export function strokeRegion(box,p,part,zones){
 const z=zones?.[part];if(!z)return part;
 const x=(p.x-box.x)/box.w,y=(p.y-box.y)/box.h;
 if(part==='head'&&Math.abs(x-z[0])>z[2]*.42)return 'ear';
 if(part==='chin'&&(Math.abs(x-z[0])>z[2]*.4||y>z[1]+z[3]*.33))return 'neck';
 if(part==='back'&&y>z[1]+z[3]*.15)return 'side';
 return part;
}
export function sampleStroke(stroke,now){
 const dt=Math.max(0,Math.min(200,now-(stroke.sampleAt??now)));stroke.sampleAt=now;
 const speed=(stroke.speed||0)*Math.exp(-Math.max(0,now-stroke.at)/240);
 if(stroke.inside===false||now-stroke.partStarted<320||(stroke.distance||0)<.015||now-stroke.at>120||speed<.08||speed>1.4||now<(stroke.pauseUntil||0)){stroke.calmRun=0;return;}
 stroke.calmRun=(stroke.calmRun||0)+dt;
 (stroke.calmMs??={head:0,chin:0,back:0})[stroke.part]+=dt;
}

// Briefly retain the just-visible target when a contact pose moves under a new tap.
export function contactTarget(box,p,id,pose,facing,previous,now,reclining=false){
 if(!box)return null;
 const target=(box,pose,facing)=>{const zones=reclining&&pose===3?contactZones(id,39,facing):contactZones(id,pose,facing),part=contactPart(box,p,null,id,pose,facing,zones);if(!part)return null;const z=zones[part],score=(((p.x-box.x)/box.w-z[0])/z[2])**2+(((p.y-box.y)/box.h-z[1])/z[3])**2;return {box,pose,facing,part,score,zones,region:strokeRegion(box,p,part,zones)};};
 const current=target(box,pose,facing);
 if(!previous||now-previous.at<0||now-previous.at>100||!((pose>=8&&pose<=11)||(pose>=28&&pose<=39))||!((previous.pose>=8&&previous.pose<=11)||(previous.pose>=28&&previous.pose<=39)))return current;
 const old=target(previous.box,previous.pose,previous.facing);
 return old&&(!current||old.score<current.score*.8)?old:current;
}
