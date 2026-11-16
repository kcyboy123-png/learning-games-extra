import {qualityVillage} from './qa-quality.mjs';
import {cells,at,parseSave,serialize} from './core.mjs?v=city1';
// Fixed visual fixture, not a player's save or a claim of earned progress.
export function developedVillage(){
 const s=qualityVillage(30);
 for(const [type,x,y] of [['house',6,10],['house',8,8],['apartment',10,6],['house',13,9],['house',15,12],['apartment',15,14],['solar',8,4],['solar',10,4],['flower',6,14],['flower',8,14],['flower',13,12],['tree',6,16],['tree',10,16],['tree',13,15],['bench',10,12]]){
  if(cells({type,x,y}).some(([gx,gy])=>at(s,gx,gy)))throw Error('Comparison fixture overlap');
  s.buildings.push({id:s.nextId++,type,x,y,opts:['house','apartment'].includes(type)?['ins']:[],progress:1,starter:false,completedAt:0});
 }
 return parseSave(serialize(s));
}

