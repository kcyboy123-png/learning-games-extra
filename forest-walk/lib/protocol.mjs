// Shared between browser and server: message limits, validation, and a tiny SSE parser. No dependencies.
// joinsPerIp counts FAILED join attempts (code guessing); joinsOkPerIp bounds successful joins from one shared classroom address.
import {validateLeaf} from './exploration.mjs';
import {validateMeal} from './mealgroup.mjs';
export const LIMITS={roomSize:30,maxRooms:40,codeLength:6,maxBody:4096,stateRate:12,stateBurst:24,waveRate:1,
  roomsPerIp:6,roomsPerIpWindowMs:10*60*1000,joinsPerIp:20,joinsOkPerIp:90,joinsPerIpWindowMs:60*1000,
  awayRemoveMs:120*1000,idleRoomMs:15*60*1000,maxRoomAgeMs:6*60*60*1000,batchMs:120};
export const CODE_ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const POSES=['stand','walk','sit','wave','observe','crouch'];
export const LOOK={variants:4,hats:3,bags:['#d6ad47','#819eb7','#c76f5b','#7fa36b','#b48bc4','#e3975a']};
export const isCode=v=>typeof v==='string'&&v.length===LIMITS.codeLength&&[...v].every(c=>CODE_ALPHABET.includes(c));
// Trust boundary: only real finite numbers pass. null, '', booleans, strings and NaN are rejected (never coerced to 0).
const num=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):null;
export function validateLook(raw){
  const o=raw&&typeof raw==='object'?raw:{};
  const variant=num(o.variant,0,LOOK.variants-1),hat=num(o.hat,0,LOOK.hats-1),bag=num(o.bag,0,LOOK.bags.length-1);
  return {variant:Math.round(variant??0),hat:Math.round(hat??0),bag:Math.round(bag??0)};
}
// Trail coordinates only: lateral offset, distance along the trail, gaze, pose and seat index.
export function validateState(raw,length){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const x=num(raw.x,-6,6),y=num(raw.y,-2,length+2),yaw=num(raw.yaw,-Math.PI,Math.PI),pitch=num(raw.pitch,-1,1);
  if(x===null||y===null)return null;
  const pose=POSES.includes(raw.pose)?raw.pose:'stand';
  const seat=num(raw.seat,-1,7);
  return {x:Math.round(x*100)/100,y:Math.round(y*100)/100,yaw:Math.round((yaw??0)*100)/100,pitch:Math.round((pitch??0)*100)/100,pose,seat:seat===null?-1:Math.round(seat),...(Object.hasOwn(raw,'leaf')?{leaf:validateLeaf(raw.leaf,y)}:{}),...(Object.hasOwn(raw,'meal')?{meal:validateMeal(raw.meal,y)}:{})};
}
// Start slots inside the gate so a class does not spawn on one point: five abreast (|x| <= 1.9, inside the 2.35 m half width),
// rows 1.3 m apart walking forward. Slot 0 is the gate itself (the solo walk keeps {0,0}); 35 slots cover 30 students + teacher.
export const START_COLUMNS=[0,-1,1,-1.9,1.9];
export function startSlot(index){const k=Math.max(0,Math.floor(Number(index)||0))%35;return {x:START_COLUMNS[k%5],y:Math.round(Math.floor(k/5)*130)/100};}
// A section is an integer index inside [0,count). Anything else (null, '', true, 1.5, out of range) is refused, not clamped.
export function validateSection(raw,count){return typeof raw==='number'&&Number.isInteger(raw)&&raw>=0&&raw<count?raw:null;}
// Parses complete SSE blocks from a text buffer; returns the parsed events and the unconsumed remainder.
export function parseSSE(buffer){
  const events=[];let rest=buffer;
  for(;;){
    const cut=rest.search(/\r?\n\r?\n/);if(cut<0)break;
    const block=rest.slice(0,cut);rest=rest.slice(cut).replace(/^\r?\n\r?\n/,'');
    let event='message',data=[];
    for(const line of block.split(/\r?\n/)){
      if(!line||line.startsWith(':'))continue;
      const i=line.indexOf(':'),field=i<0?line:line.slice(0,i),value=i<0?'':line.slice(i+1).replace(/^ /,'');
      if(field==='event')event=value;else if(field==='data')data.push(value);
    }
    if(data.length)events.push({event,data:data.join('\n')});
  }
  return {events,rest};
}
export function formatSSE(event,data){return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;}
