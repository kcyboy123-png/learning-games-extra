export const SCENT_SPOTS=Object.freeze([.28,.5,.72]);
export function featherReady(distance,idle,petDistance){return distance>=.06&&idle>=450&&petDistance<.055;}
export function scentWarmth(cursor,goal){return Math.max(0,1-Math.abs(cursor-goal)/.28);}
export function scentReady(cursor,goal,petX){return Math.abs(cursor-goal)<.045&&Math.abs(petX-goal)<.045;}
