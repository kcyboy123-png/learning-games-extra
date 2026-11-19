// Large silhouette changes follow a held intention; tiny hand motion remains continuous.
import {CONTACT_RESPONSE} from './contact-feedback.mjs';
export function touchPose(room,now,fallback){
 if(!room.touchArtReady)return fallback;
 const s=room.stroke;
 if(!s)return selectedTouchPose(room,now,fallback);
 if(s.inside!==false&&!room.reduced&&(room.actionArt?.[21]||room.bridgeRects)&&[3,23,35,39,38].includes(s.pose)&&now-s.started<600){const age=now-s.started;s.visualPose=age<230?s.pose:21;s.visualCandidate=s.visualPose;s.visualSince=now;return s.visualPose;}
 if(s.inside===false)return now-(s.exitedAt??now)<150?(s.visualPose??fallback):fallback;
 if(room.variant){
  // Direction is expressed by a small lean, not repeated whole-sprite swaps.
  const next=s.part==='chin'?29:s.part==='back'?30:28;
  if(s.visualPose==null)s.visualPose=s.pose>=28&&s.pose<=36?s.pose:next;
  if(s.visualCandidate!==next){s.visualCandidate=next;s.visualSince=now;}
  if(now-s.visualSince>=(CONTACT_RESPONSE[room.species]??CONTACT_RESPONSE.cat).hold)s.visualPose=next;
  return s.visualPose;
 }
 if(s.visualPose==null&&(s.pose>=28&&s.pose<=34||s.pose===36)){s.visualPose=s.pose;s.visualCandidate=s.pose;s.visualSince=now;}
 const next=selectedTouchPose(room,now,fallback);
 if(s.visualPose==null){s.visualPose=next;s.visualCandidate=next;s.visualSince=now;}
 if(next!==s.visualCandidate){s.visualCandidate=next;s.visualSince=now;}
 if(next!==s.visualPose&&now-s.visualSince>=160)s.visualPose=next;
 return s.visualPose;
}
export function selectedTouchPose(room,now,fallback){
 if(!room.touchArtReady)return fallback;
 const s=room.stroke,a=room.affection;
 if(s){
  if(s.inside===false)return fallback;
  if(room.contactPhase!=='pause'){s.blinkAt=null;s.blinkFrom=null;}
  if(s.stretchAt!=null&&s.part!=='back'&&now-s.stretchAt<900)s.stretchAt=now-(s.visualPose===38?900:1180);
  if(s.stretchAt!=null&&now-s.stretchAt>=900&&now-s.stretchAt<1180)return !room.reduced&&(room.actionArt?.[21]||room.bridgeRects)?21:fallback;
  if(room.momentArtReady){
   if(room.contactPhase==='pause'){
    if(s.blinkAt==null&&now-(room.lastBlinkAt??-Infinity)>8000){s.blinkAt=now;s.blinkFrom=s.visualPose===37?fallback:(s.visualPose??fallback);room.lastBlinkAt=now;}
    return s.blinkAt!=null&&now-s.blinkAt<400?37:(s.blinkFrom??s.visualPose??fallback);
   }
   const returning=s.started-(room.lastTouchRelease??-Infinity);
   if(returning>=0&&returning<1800&&now-s.started<(room.familiarTouch?420:760))return s.visualPose??(s.pose>=28&&s.pose<=37?s.pose:36);
   if(room.familiarTouch&&s.part==='back'&&now-s.partStarted>4000&&(s.calmMs?.back||0)>=1600&&s.stretchAt==null&&now-(room.lastStretchAt??-Infinity)>25000){s.stretchAt=now;room.lastStretchAt=now;}
   if(s.stretchAt!=null&&now-s.stretchAt<900&&s.part==='back')return 38;
  }
  if(room.contactPhase==='pause')return fallback;
  const age=now-(s.partStarted??s.started),delay=room.familiarTouch?420:760;
  const direction=Math.abs(s.lean||0)>.003?Math.sign(s.lean):(s.artCandidate??((s.x-s.box.x)/s.box.w<.5?-1:1));
  if(s.artCandidate!==direction){s.artCandidate=direction;s.artSince=now;}
  if(s.artSide==null||now-s.artSince>=240)s.artSide=direction;
  const right=s.artSide>0;
  if(age<delay)return s.visualPose??fallback;
  if(s.part==='chin')return 29;
  if(s.part==='back')return right?31:30;
  if(Math.abs(s.lean||0)*Math.exp(-Math.max(0,now-(s.at??now))/240)>.004)s.artMovedAt=now;
  return now-(s.artMovedAt??-Infinity)<450?(right?31:30):28;
 }
 if(a?.pose===38){const age=now-a.at;if(age>=a.duration)return fallback;if(age<380)return !room.reduced&&(room.actionArt?.[21]||room.bridgeRects)?(age<160?38:21):fallback;}
 if(a&&a.duration<1400&&now-a.at<a.duration&&a.pose>=8&&a.pose<=39)return a.pose===38?fallback:a.pose;
 if(a&&a.duration>=1400){
  const age=now-a.at;
  if(age<380&&a.pose>=28&&a.pose<=39)return a.pose;
  if(age>=a.duration-1000)return room.momentArtReady&&a.deepContact&&age>=a.duration-550?39:35;
  if(room.familiarTouch){
   if(a.deepContact)return a.pose>=28&&a.pose<=33?a.pose:fallback;
   if(a.ask==null){a.ask=now-(room.lastAskAt??-Infinity)>18000;if(a.ask)room.lastAskAt=now;}
   if(a.ask)return 34;
   if(a.pose>=28&&a.pose<=33)return a.pose;
  }
 }
 return fallback;
}

