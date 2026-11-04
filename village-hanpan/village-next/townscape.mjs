import {TYPES,RIVER,SIZE,network,connected,cells} from './core.mjs?v=balance1';
import {naturalFeature} from './landscape.mjs?v=balance1';
import {gardenSites} from './meadow.mjs?v=friends20261104';
// Visual maturity follows connected facilities, never adds saved buildings or bonuses.
export function townscapeSites(s){
 const net=network(s),live=s.buildings.filter(b=>b.progress>=1&&!b.closed&&connected(s,b,net));
 const count=live.filter(b=>TYPES[b.type].cap||TYPES[b.type].food||TYPES[b.type].health||TYPES[b.type].education||TYPES[b.type].leisure).length;
 const stage=count>=16?2:count>=6?1:0,edges=[],banks=[],groves=[];
 if(!stage)return{stage,edges,banks,groves};
 const occupied=new Set(s.buildings.flatMap(b=>cells(b).map(c=>c.join(','))));
 for(const b of live.filter(b=>b.type==='road'))for(const[dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){
  const x=b.x+dx,y=b.y+dy,k=x+','+y;
  if(x<2||x>=SIZE||y<0||y>=SIZE||net.has(k)||x===RIVER)continue;
  edges.push({x:b.x,y:b.y,dx,dy,lamp:!occupied.has(k)&&(b.x*7+b.y*3)%5===0,plant:stage===2&&!occupied.has(k)&&!s.landscape?.cleared.includes(k)});
 }
 const bridges=live.filter(b=>b.type==='bridge');
 for(let y=0;y<SIZE;y++)if(!s.buildings.some(b=>b.type==='bridge'&&b.y===y)&&bridges.some(b=>Math.abs(b.y-y)<=4))for(const side of[-1,1])banks.push({y,side});
 const cleared=new Set(s.landscape?.cleared||[]),gardens=new Set(gardenSites(s).map(p=>p.key));
 for(let x=2;x<SIZE;x++)for(let y=0;y<SIZE;y++){
  const key=x+','+y,seed=(x*37+y*61)%97;
  if(x===RIVER||key==='14,7'||occupied.has(key)||cleared.has(key)||gardens.has(key)||naturalFeature(x,y)||seed%3)continue;
  if(![[0,1],[1,0],[0,-1],[-1,0]].some(([dx,dy])=>net.has((x+dx)+','+(y+dy))))continue;
  groves.push({x,y,seed});
 }
 groves.sort((a,b)=>a.seed-b.seed);groves.splice(stage===2?24:8);
 return{stage,edges,banks,groves};
}
