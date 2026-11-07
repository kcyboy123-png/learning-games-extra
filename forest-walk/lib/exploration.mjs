// Per-walk discoveries only. Taking a clue never marks an animal as observed.
export const TRACKS={
 bird:{s:115,offset:1.2,name:'작은 깃털',hint:'가벼운 깃털이 떨어져 있어요. 가지 위를 둘러보고 새를 눌러 보세요.'},
 chipmunk:{s:475,offset:1.3,name:'솔방울과 발자국',hint:'솔방울 옆에 작은 발자국이 있어요. 수풀 쪽에서 다람쥐를 찾아 눌러 보세요.'}
};
export const LEAF_SECONDS=18,PHOTO_LIMIT=6;
export const CAPTIONS=['마음이 편안해요','새로운 것을 발견했어요','친구와 함께라 좋아요'];
export function createExploration(){return {clues:[],tracked:[],leafRoutes:[]};}
export function noteClue(state,id){if(!TRACKS[id])return false;if(!state.clues.includes(id))state.clues.push(id);return true;}
export function linkAnimal(state,id){if(!state.clues.includes(id)||state.tracked.includes(id))return false;state.tracked.push(id);return true;}
export function leafCourse(lane,elapsed){
 const t=Math.max(0,Math.min(1,elapsed/LEAF_SECONDS)),side=Math.max(-1,Math.min(1,lane));
 // Different starting lanes curve gently around the same shallow bend; all stay inside the creek.
 return {s:204-11*t,offset:side*.65*(1-t*.45)+Math.sin(t*Math.PI*2+side)*.22,progress:t};
}
export function noteLeaf(state,lane,elapsed,inFrame){if(![-1,0,1].includes(lane)||elapsed<LEAF_SECONDS||!inFrame||state.leafRoutes.includes(lane))return false;state.leafRoutes.push(lane);return true;}
export function validateLeaf(raw,y){
 if(!raw||!Number.isFinite(y)||Math.abs(y-210)>12||![-1,0,1].includes(raw.lane)||!Number.isInteger(raw.age)||raw.age<0||raw.age>LEAF_SECONDS||!Number.isSafeInteger(raw.seq)||raw.seq<0)return null;
 return {lane:raw.lane,age:raw.age,seq:raw.seq};
}
