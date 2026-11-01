import {TYPES,MONTH} from './data.mjs?v=80min1';

// Only new towns opt in; existing prices, capacities and recorded scores stay intact.
const CHANGES={
 apartment:{cost:600,cap:20,up:11,facade:.5,desc:'한 칸에 20명. 주택 5채보다 땅과 유지비를 아껴요.'},
 japanese:{cost:320,food:24,up:8,premium:{food:1},facade:.5,desc:'식사 24명. 이용 주민마다 월 수입 +1, 작은 땅을 알차게 써요.'},
 western:{cost:460,food:32,up:10,premium:{food:2},facade:.5,desc:'식사 32명. 이용 주민마다 월 수입 +2인 동네 식당이에요.'},
 chinese:{cost:620,food:44,up:13,premium:{food:3},facade:.5,desc:'식사 44명. 이용 주민마다 월 수입 +3, 한 칸의 큰 식당이에요.'},
 hospital:{cost:840,health:64,up:18,premium:{health:.5},facade:.5,desc:'의료 64명. 의원 여러 곳의 역할을 한 칸에, 이용 주민마다 월 수입 +0.5.'},
 supermarket:{cost:1050,food:80,up:22,premium:{food:2},facade:.5,desc:'2×2칸에 식사 80명. 이용 주민마다 월 수입 +2, 큰 마을의 장보기를 맡아요.'},
 amusement:{cost:1400,leisure:96,up:25,premium:{leisure:.75},facade:.5,desc:'2×2칸에 여가 96명. 이용 주민마다 월 수입 +0.75인 마을의 명소예요.'}
};
const CITY_TYPES=Object.fromEntries(Object.entries(TYPES).map(([k,d])=>[k,{...d,...CHANGES[k]}]));
export const buildingSpec=(s,type)=>(s?.cityV===1?CITY_TYPES:TYPES)[type];
export const cityPhase=s=>s.cityV===1?Math.max(0,Math.min(1,(s.t/MONTH-4)/8)):0;
export function premiumIncome(s,live){
 if(s.cityV!==1)return 0;
 let income=0;
 for(const service of ['food','health','leisure']){
  let remaining=s.pop;
  const facilities=live.filter(b=>buildingSpec(s,b.type).premium?.[service]).sort((a,b)=>buildingSpec(s,b.type).premium[service]-buildingSpec(s,a.type).premium[service]||a.id-b.id);
  for(const b of facilities){const d=buildingSpec(s,b.type),used=Math.min(remaining,d[service]);income+=used*d.premium[service];remaining-=used;if(!remaining)break;}
 }
 return income;
}
export function cityBeauty(s,live,base){
 const phase=cityPhase(s);if(!phase)return base;
 const facilities=live.filter(b=>{const d=TYPES[b.type];return d.cap||d.food||d.health||d.education||d.leisure;});
 const facade=facilities.length?facilities.reduce((n,b)=>n+Math.min(1,b.opts.length*.5+(buildingSpec(s,b.type).facade||0)),0)/facilities.length:0;
 const trees=live.filter(b=>['tree','avenue'].includes(b.type)).length;
 const restored=Math.max(base.preservation,Math.min(.6,base.preservation+trees*.04));
 const mature=base.coverage*.4+base.variety*.25+restored*.2+facade*.15;
 return {...base,facade,restored,score:Math.round(base.score*(1-phase)+100*mature*phase)};
}
