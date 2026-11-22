export const SCENT_SPOTS=Object.freeze([.28,.5,.72]);
export function scentSpot(x){return Math.max(0,Math.min(2,Math.round((x-.28)/.22)));}
export function rubScent(a,x,tap=false){
 const i=scentSpot(x),previous=a.rubX;
 a.rubs??=[0,0,0];
 const amount=tap?.22:previous!=null&&scentSpot(previous)===i?Math.min(.06,Math.abs(x-previous))/.18:0;
 a.rubs[i]=Math.min(1,a.rubs[i]+amount);a.rubX=x;a.keySpot=i;
 return i;
}
export function featherReady(distance,idle,petDistance){return distance>=.06&&idle>=450&&petDistance<.055;}
export function scentWarmth(cursor,goal){return Math.max(0,1-Math.abs(cursor-goal)/.28);}
export function scentReady(cursor,goal,petX){return Math.abs(cursor-goal)<.045&&Math.abs(petX-goal)<.045;}
