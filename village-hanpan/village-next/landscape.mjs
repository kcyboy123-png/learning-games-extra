import {TYPES} from './data.mjs?v=animals8';
// Version 1 coordinates are permanent: old saves must not grow a different woodland.
export function naturalFeature(x,y){if(!Number.isInteger(x)||!Number.isInteger(y)||x<2||x>=18||y<0||y>=18||x===11||(x===14&&y===7))return null;const h=(x*13+y*7)%17;if(h===0)return 'tree';return (x*7+y*11)%13===0?'flowers':null;}
export const GARDENS=['tree','bench','flower','avenue'];
export const isGarden=b=>GARDENS.includes(b.type);
export function growthStage(s,b){if(!isGarden(b)||b.plantedAt===undefined)return 2;const age=s.t-b.plantedAt;return age<60?0:age<180?1:2;}
export function landscapeMetrics(s,live){const planted=live.filter(isGarden),homes=live.filter(b=>['house','apartment'].includes(b.type));const weighted=b=>.5+growthStage(s,b)*.25;
 const coverage=homes.length?homes.reduce((sum,h)=>sum+Math.max(0,...planted.filter(b=>Math.abs(b.x-h.x)+Math.abs(b.y-h.y)<=3).map(weighted)),0)/homes.length:0;
 const counts=[planted.filter(b=>['tree','avenue'].includes(b.type)).length,planted.filter(b=>b.type==='flower').length,planted.filter(b=>b.type==='bench').length],total=counts.reduce((a,b)=>a+b,0);const variety=total?Math.min(1,(1-counts.reduce((a,n)=>a+(n/total)**2,0))*1.5):0;
 const occupied=(x,y)=>s.buildings.some(b=>x>=b.x&&y>=b.y&&x<b.x+(TYPES[b.type].foot||1)&&y<b.y+(TYPES[b.type].foot||1));let natural=0,kept=0;const cleared=new Set(s.landscape?.cleared||[]);for(let x=2;x<18;x++)for(let y=0;y<18;y++)if(naturalFeature(x,y)){natural++;if(!cleared.has(`${x},${y}`))kept++;}
 const preservation=natural?kept/natural:1,score=Math.round(100*(coverage*.5+variety*.25+preservation*.25));const mature=planted.filter(b=>growthStage(s,b)===2).length;
 return{score,coverage,variety,preservation,mature,count:planted.length,title:mature>=9&&variety>.7?'나비가 머무는 동네':mature>=5?'꽃길이 이어진 마을':mature>=2?'작은 정원의 시작':'첫 모종을 기다려요'};
}
