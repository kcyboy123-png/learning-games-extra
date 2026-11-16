import {createState,advance,YEAR,at,cells} from './core.mjs?v=city1';
// Disposable visual fixtures; never read or write the player's storage.
export function qualityVillage(months=24){
 const s=createState(),add=(type,x,y)=>{if(!at(s,x,y))s.buildings.push({id:s.nextId++,type,x,y,opts:[],progress:1,starter:false,completedAt:0});};
 for(let y=3;y<=16;y++)for(const x of[5,9,14])if(!(x===14&&y===7))add('road',x,y);
 for(let x=5;x<=16;x++)add(x===11?'bridge':'road',x,11);
 for(const y of[6,7,8])add('road',13,y);
 for(const [t,x,y] of [['snack',4,4],['clinic',6,4],['school',4,6],['library',6,6],['convenience',4,8],['western',6,8],['japanese',4,9],['chinese',6,12],['apartment',8,5],['hospital',10,5],['fire',8,7],['solar',10,7],['drain',8,9],['kids',10,9],['supermarket',12,4],['amusement',15,8],['workshop',14,7],['avenue',8,13],['bench',10,13],['flower',6,13],['house',8,15]])add(t,x,y);
 const occupied=new Set();for(const b of s.buildings)for(const c of cells(b)){const k=c.join(',');if(occupied.has(k))throw Error('QA fixture overlap '+k);occupied.add(k);}
 s.money=8000;advance(s,months*YEAR/12);s.paused=true;return s;
}
