// Pure NPC motion helpers shared by world.mjs / app.mjs and node:test. No DOM, no three.js.
// Everything is in trail coordinates: s (metres along the trail, +s = uphill) and a lateral offset from pathX(s).
// World yaw follows app.mjs: yaw = atan2(dx, dz) with dz = -ds, so yaw 0 faces down the trail (+z) and yaw π faces uphill.
import {pathX,halfWidth,forkGap,riverX,LENGTH} from '../trail.mjs';

export const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const turnToward=(yaw,target,k)=>yaw+wrapAngle(target-yaw)*k;
export const worldXZ=(s,offset)=>({x:pathX(s)+offset,z:-s});
export const yawBetween=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
const clampDt=dt=>Math.max(0,Math.min(.05,Number(dt)||0));

// ---- Friends: looped routines of short phases -------------------------------------------------------------------------
// phase = {at:[s,offset], yaw, activity, seconds}: walk to `at` (only if not already there), turn to `yaw` (a number, or
// 'face' = the yaw handed in by the caller, e.g. toward the child), then hold `activity` for `seconds`.
export const WALK={speed:.85,reach:.03,turn:5};
export function createMotion({s,offset,yaw,activity='look'}){return {s,offset,yaw,activity,moving:false,traveled:0,routine:null,index:0,elapsed:0,arrived:true};}
export function setRoutine(m,routine){if(m.routine===routine)return m;m.routine=routine;m.index=0;m.elapsed=0;m.arrived=false;return m;}
// Re-sync after something else moved the actor (e.g. the summit photo slide): the routine then walks on from here.
export function placeMotion(m,s,offset){m.s=s;m.offset=offset;m.arrived=false;m.elapsed=0;m.moving=false;return m;}
export function stepMotion(m,dt,{speed=WALK.speed,turn=WALK.turn,face=null}={}){
  dt=clampDt(dt);const phase=m.routine?.[m.index];
  if(!phase){m.moving=false;return m;}
  if(!m.arrived){
    const [ts,to]=phase.at,ds=ts-m.s,dOff=to-m.offset,remaining=Math.hypot(ds,dOff);
    if(remaining<=1e-9){m.s=ts;m.offset=to;m.arrived=true;m.elapsed=0;m.moving=false;}
    else{
      const from=worldXZ(m.s,m.offset),len=Math.min(remaining,speed*dt);
      m.s+=ds/remaining*len;m.offset+=dOff/remaining*len;
      const here=worldXZ(m.s,m.offset),moved=Math.hypot(here.x-from.x,here.z-from.z);
      m.traveled+=moved;m.moving=moved>1e-9;m.activity='walk';
      if(m.moving)m.yaw=turnToward(m.yaw,yawBetween(from,here),1-Math.exp(-dt*turn*2));
      return m;
    }
  }
  m.moving=false;m.elapsed+=dt;m.activity=phase.activity;
  const target=phase.yaw==='face'?face:phase.yaw;
  if(typeof target==='number'&&Number.isFinite(target))m.yaw=turnToward(m.yaw,target,1-Math.exp(-dt*turn));
  if(m.elapsed>=phase.seconds){m.index=(m.index+1)%m.routine.length;m.elapsed=0;m.arrived=false;}
  return m;
}
export const holdAt=(home,activity=home.activity,yaw=home.yaw)=>[{at:[home.s,home.offset],yaw,activity,seconds:Infinity}];
const bank=s=>riverX(s)-3-pathX(s);
// Homes are the positions the parent already reviewed (world.mjs friends); every walk is a few metres on the same verge,
// bench front or creek bank. Durations differ per friend so they are never all walking or waving at once.
const seatedHome={s:200,offset:-4,yaw:Math.PI/2,activity:'sit'},watcherHome={s:203,offset:bank(203),yaw:Math.PI*.42,activity:'crouch'};
const gateHome={s:30,offset:2.4,yaw:-Math.PI/2,activity:'look'},shelterHome={s:372,offset:-3.1,yaw:.2,activity:'sit'},summitHome={s:709,offset:3.2,yaw:Math.PI,activity:'look'};
export const friendRoutines={
  seated:{home:seatedHome,wander:[
    {at:[200,-4],yaw:Math.PI/2,activity:'sit',seconds:16},
    {at:[200,-4],yaw:Math.PI/2,activity:'look',seconds:2},
    {at:[199,-2.9],yaw:Math.PI*.6,activity:'look',seconds:6},
    {at:[200,-4],yaw:Math.PI/2,activity:'look',seconds:1.5}]},
  watcher:{home:watcherHome,wander:[
    {at:[203,bank(203)],yaw:Math.PI*.42,activity:'crouch',seconds:14},
    {at:[203,bank(203)],yaw:Math.PI*.42,activity:'look',seconds:3},
    {at:[200.5,bank(200.5)],yaw:Math.PI*.5,activity:'look',seconds:4},
    {at:[200.5,bank(200.5)],yaw:Math.PI*.5,activity:'crouch',seconds:9},
    {at:[203,bank(203)],yaw:Math.PI*.42,activity:'look',seconds:2}]},
  gateFriend:{home:gateHome,wander:[
    {at:[30,2.4],yaw:-Math.PI/2,activity:'look',seconds:9},
    {at:[33.5,2.1],yaw:Math.PI*.8,activity:'look',seconds:5},
    {at:[31.5,3.0],yaw:-Math.PI*.6,activity:'crouch',seconds:6},
    {at:[30,2.4],yaw:-Math.PI/2,activity:'look',seconds:7}],
    greet:[{at:[30,2.4],yaw:'face',activity:'wave',seconds:3},{at:[30,2.4],yaw:'face',activity:'look',seconds:Infinity}],
    wave:[{at:[30,2.4],yaw:'face',activity:'wave',seconds:Infinity}]},
  shelterFriend:{home:shelterHome,wander:[
    {at:[372,-3.1],yaw:.2,activity:'sit',seconds:22},
    {at:[372,-3.1],yaw:.2,activity:'look',seconds:2},
    {at:[369.5,-2.4],yaw:-2.45,activity:'look',seconds:7},
    {at:[372,-3.1],yaw:.2,activity:'look',seconds:1.5}],
    greet:[{at:[372,-3.1],yaw:'face',activity:'wave',seconds:3},{at:[372,-3.1],yaw:'face',activity:'look',seconds:Infinity}]},
  summitFriend:{home:summitHome,wander:[
    {at:[709,3.2],yaw:Math.PI,activity:'look',seconds:14},
    {at:[712.5,3.9],yaw:Math.PI*.85,activity:'look',seconds:9},
    {at:[711,2.6],yaw:-Math.PI*.8,activity:'look',seconds:5},
    {at:[709,3.2],yaw:Math.PI,activity:'look',seconds:2}]}
};

// ---- Solo teacher: walks ahead of the child, stops and turns to watch, waits at each landmark ----------------------------
// No landmark hop while the child simply follows: the teacher starts walking when the child comes within `near` metres, keeps
// going until `far` metres ahead (or the landmark), then turns round. A snap to the landmark only happens on reset/goto, in
// reduced motion, or when the child ends up more than `catchUp` metres away (QA jumps, long walks back down).
export const LEAD={near:5,far:12,speed:1.95,catchUp:45,turn:4,lateral:3};
// Walkable lateral lane for the teacher: left verge of the trail, narrowing for the bridge deck and the fork's left lane, with a
// 3 m look-ahead so the lateral blend has settled before a narrow stretch begins.
export function leadOffset(s){
  let best=-Infinity;
  for(let k=0;k<=3;k++){const u=Math.min(LENGTH,s+k),hw=halfWidth(u),gap=forkGap(u);best=Math.max(best,-Math.min(Math.max(2.2,gap+.7),hw-.45));}
  return best;
}
export function createLead(spot){return {s:spot.s,offset:spot.offset,yaw:spot.yaw,activity:spot.activity,moving:false,traveled:0,walking:false,atSpot:true};}
export function stepLead(lead,spot,child,dt,{snap=false,reduced=false}={}){
  dt=clampDt(dt);
  const ahead=child.s-lead.s,behindSpot=spot.s<lead.s-.5;
  if(snap||reduced||ahead>LEAD.catchUp||(behindSpot&&ahead<-LEAD.catchUp)){
    Object.assign(lead,{s:spot.s,offset:spot.offset,yaw:spot.yaw,activity:spot.activity,moving:false,walking:false,atSpot:true});return lead;}
  const from=worldXZ(lead.s,lead.offset),toSpot=spot.s-lead.s;
  if(!lead.walking&&toSpot>1e-9&&ahead>-LEAD.near&&(child.moving||ahead>0))lead.walking=true;
  if(lead.walking&&(ahead<-LEAD.far||toSpot<=1e-9))lead.walking=false;
  if(lead.walking){
    const speed=Math.max(LEAD.speed,(Number(child.speed)||0)*1.15);
    lead.s=Math.min(spot.s,lead.s+speed*dt);
    const target=spot.s-lead.s<4?spot.offset:leadOffset(lead.s);
    lead.offset+=(target-lead.offset)*(1-Math.exp(-dt*LEAD.lateral));
    const here=worldXZ(lead.s,lead.offset),moved=Math.hypot(here.x-from.x,here.z-from.z);
    lead.traveled+=moved;lead.moving=moved>1e-9;lead.activity='walk';lead.atSpot=false;
    if(lead.moving)lead.yaw=turnToward(lead.yaw,yawBetween(from,here),1-Math.exp(-dt*LEAD.turn*2));
    return lead;
  }
  lead.moving=false;lead.atSpot=Math.abs(toSpot)<=1e-9;
  if(lead.atSpot&&!behindSpot){lead.yaw=turnToward(lead.yaw,spot.yaw,1-Math.exp(-dt*LEAD.turn));lead.activity=spot.activity;}
  else{lead.yaw=turnToward(lead.yaw,yawBetween(from,worldXZ(child.s,Number(child.offset)||0)),1-Math.exp(-dt*LEAD.turn));lead.activity='look';}
  return lead;
}
