export const SAVE_KEY='joseon-first-mission-3d-v1';
export function fresh(){return {done:[],mistakes:[],complete:false};}
export function restore(raw){
 try{const p=JSON.parse(raw);if(!p||!Array.isArray(p.done)||!Array.isArray(p.mistakes))return fresh();
 return {done:[...new Set(p.done.filter(n=>Number.isInteger(n)&&n>=0&&n<3))],mistakes:[...new Set(p.mistakes.filter(s=>typeof s==='string'&&/^(scene[0-2]|record):[0-3]$/.test(s)))],complete:p.complete===true&&[0,1,2].every(i=>p.done.includes(i))};
 }catch{return fresh();}
}
export function score(p){return 1000-p.mistakes.length*10+(p.complete?10:0);}
export function mistake(p,key){if(p.mistakes.includes(key))return false;p.mistakes.push(key);return true;}
