// Server-owned slots stay fixed until departure; an empty place can be reused without moving classmates.
export const GROUP_SIZE=5;
export function availableMealSlot(members){
  const used=new Set([...members].filter(m=>m.role==='student').map(m=>m.mealSlot));
  for(let slot=0;slot<30;slot++)if(!used.has(slot))return slot;
  return -1;
}
export const groupOf=slot=>Number.isInteger(slot)&&slot>=0?Math.floor(slot/GROUP_SIZE):-1;
export function diningSeat(slot,ownSlot){
  const i=((slot%5-ownSlot%5)+5)%5,angle=i*Math.PI*2/5-.65;
  return {x:Math.sin(angle)*1.65,z:Math.cos(angle)*1.65,yaw:Math.atan2(-Math.sin(angle),-Math.cos(angle))};
}
export function diningOffset(group,ownGroup){
  if(group===ownGroup)return {x:0,z:0};
  const n=(group-ownGroup+7)%7-1;
  return {x:(n%2?1:-1)*2.15,z:-4.2*(Math.floor(n/2)+1)};
}
export function validateMeal(raw,y){
  if(!raw||!['picnic','noodle'].includes(raw.kind))return null;
  if(Math.abs(y-(raw.kind==='picnic'?362:712))>12)return null;
  if(!['prepare','ready','bite','pack'].includes(raw.action))return null;
  if(!Number.isInteger(raw.bites)||raw.bites<0||raw.bites>3||!Number.isSafeInteger(raw.seq)||raw.seq<0)return null;
  return {kind:raw.kind,action:raw.action,bites:raw.bites,seq:raw.seq};
}
