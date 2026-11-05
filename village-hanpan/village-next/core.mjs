import {recordCozyMonth,validateCozyReview} from './cozy-review.mjs?v=perf1';
import {buildingSpec,cityPhase,premiumIncome} from './city-rules.mjs?v=perf1';
export {buildingSpec} from './city-rules.mjs?v=perf1';
// village-next B단계 경제 코어. public/core.mjs(village-40-v3) 기반 + 완공시각·재배치·월별 해금·텃밭·휴업. 렌더/DOM 접근 없음.
import {naturalFeature,clearablePlot,isGarden,landscapeMetrics} from './landscape.mjs?v=perf1';
import {VERSION,RULE,MONTH,YEAR,SIZE,RIVER,TYPES,OPTIONS,TIERS,season,PLAY_SPEED,COZY_EFFECTS,POPULATION_UNLOCKS} from './data.mjs?v=perf1';
import {PAINTABLE,validPaint} from './building-paint.mjs?v=perf1';
export {MONTH,YEAR,SIZE,RIVER,TYPES,OPTIONS,RULE,VERSION};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const SCOPE={label:'B규칙'};
export const HARVEST=35,HARVEST_SECONDS=15;
export const RELOCATE_WINDOW=60; // 21절 다: 완공 후 게임시간 60초 안에 건물당 1회 무료 재배치
export const duration=s=>(s.runMonths??12)*MONTH;
export const month=s=>s.mode==='free'?Math.floor(s.t/MONTH):Math.min((s.runMonths??12)-1,Math.floor(s.t/MONTH));
export const calendarMonth=(s,index=month(s))=>(index+(s.startMonth??0))%12;
export const monthLabel=(s,index=month(s))=>`${calendarMonth(s,index)+1}월`;
export function cells(b){const n=TYPES[b.type].foot||1;return Array.from({length:n*n},(_,i)=>[b.x+i%n,b.y+Math.floor(i/n)]);}
export const at=(s,x,y)=>s.buildings.find(b=>cells(b).some(c=>c[0]===x&&c[1]===y));
export const terrain=(x,y)=>x===RIVER?'water':x===14&&y===7?'warehouse':x<2?'woods':'grass';
export function createState(mode='run'){
 const s={v:VERSION,rule:RULE,economyV:4,cityV:1,scoringV:2,cashStress:0,mode,runMonths:36,startMonth:2,t:0,carry:0,money:240,pop:8,sat:78,buildings:[],nextId:1,hist:[],paused:false,ended:false,result:null,stage:0,events:[],savedAt:0,landscape:{version:1,cleared:[]},harvested:[],harvestAt:null};
 const add=(type,x,y,opts=[])=>s.buildings.push({id:s.nextId++,type,x,y,opts,progress:1,starter:true,completedAt:0});
 for(let y=3;y<=13;y++)add('road',5,y);
 add('house',4,5,['ins']);add('house',6,5,['ins']);add('generator',4,7);add('tree',6,9);add('tree',4,10);return s;
}
// Relaxed decorating keeps past results intact and uses a separate current growth score.
export function enableCozy(s){s.populationPeak=Math.max(s.populationPeak??s.pop,s.pop);if(s.cozyV!==1)s.money=Math.max(300,s.money);s.placementHintsShown??=Math.min(2,s.buildings.filter(b=>!b.starter).length);s.cozyV=1;s.mode='free';s.ended=false;return s;}
export function cozyGrowth(s){
 const made=s.buildings.filter(b=>!b.starter&&b.progress>=1&&!b.closed&&!['road','bridge'].includes(b.type));
 const gardens=made.filter(isGarden).length,buildings=made.length-gardens,variety=new Set(made.map(b=>b.type)).size,details=made.reduce((n,b)=>n+b.opts.length,0);
 return {gardens,buildings,variety,score:Math.round(100+250*Math.min(1,gardens/24)+300*Math.min(1,variety/28)+150*Math.min(1,buildings/28)+100*Math.min(1,details/20)+100*Math.min(1,Math.max(0,s.pop-8)/232))};
}
const BASIC_GARDENS=new Set(['flower','avenue','tree','bench']);
export function cozyRates(type,count){
 const income=[1,.75,.5,.35,.25][count-1]??.2;
 const care=BASIC_GARDENS.has(type)?(count<=4?1:count===5?.75:count===6?.5:.25):([1,.6,.35,.2][count-1]??.1);
 return {income,care};
}
// Stable IDs keep individual effects consistent after moving, reloading or reordering saves.
export function cozyEffects(s,pending=false){
 const total={income:0,happiness:0,welfare:0,counts:{},effects:new Map()};
 for(const b of s.buildings.filter(b=>!b.starter&&!b.closed&&(pending||b.progress>=1)).sort((a,b)=>a.id-b.id)){
  const count=total.counts[b.type]=(total.counts[b.type]||0)+1,rate=cozyRates(b.type,count),base=COZY_EFFECTS[b.type];
  const income=base.income*rate.income,happiness=Math.min(50-total.happiness,base.happiness*rate.care),welfare=Math.min(100-total.welfare,base.welfare*rate.care);
  total.effects.set(b.id,{count,rate,income,happiness,welfare,potentialHappiness:base.happiness*rate.care,potentialWelfare:base.welfare*rate.care,limited:happiness+1e-9<base.happiness*rate.care||welfare+1e-9<base.welfare*rate.care});
  total.income+=income;total.happiness+=happiness;total.welfare+=welfare;
 }
 return total;
}
import {network} from './roads.mjs?v=perf1';
export {network} from './roads.mjs?v=perf1';
export function connected(s,b,net=network(s)){return cells(b).some(([x,y])=>net.has(`${x},${y}`)||[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>net.has(`${x+dx},${y+dy}`)));}
export function stage(s){return Math.max(s.stage,month(s)>=7||s.pop>=28?3:month(s)>=2||s.pop>=16?2:month(s)>=1||s.buildings.some(b=>b.type==='snack'&&b.progress>=1)?1:0);}
// 해금: 정해진 달이 되었거나(9절) 주민 성과로 stage가 앞서면 열린다. 평가 시작은 달을 따르므로 빨리 열어도 벌점이 없다.
const STAGE_MONTH=[0,1,2,7];export const populationRequired=type=>POPULATION_UNLOCKS[type]??0;
export function unlocked(s,type){const d=TYPES[type];return s.cozyV===1?Math.max(s.pop,s.populationPeak??s.pop)>=populationRequired(type):month(s)>=d.unlock||STAGE_MONTH[stage(s)]>=d.unlock;}
export const unlockMessage=(s,type)=>s.cozyV===1?`주민 ${populationRequired(type)}명에 열려요 · 현재 ${s.pop}명`:`${monthLabel(s,TYPES[type].unlock)}에 열려요.`;
export const unlockMonth=type=>TYPES[type].unlock;
// Piers occupy the two adjacent river cells, so bridges and opposite ports cannot overlap.
export function waterfrontError(s,type,x,y,ignoreId=0){
 if(type==='harbor'&&x!==RIVER-2&&x!==RIVER+1)return '항구는 개울 바로 옆의 빈 땅 2×2칸에 지어요.';
 if(type!=='harbor'&&type!=='bridge')return '';
 const rows=type==='harbor'?[y,y+1]:[y];
 if(s.buildings.some(b=>b.id!==ignoreId&&(b.type==='harbor'&&rows.some(r=>r>=b.y&&r<b.y+2)||type==='harbor'&&b.type==='bridge'&&rows.includes(b.y))))return '다리나 다른 항구와 겹쳐요. 개울 옆 다른 자리를 골라 주세요.';
 return '';
}
export function canBuild(s,type,x,y,ignoreId=0){const d=TYPES[type];if(!d)return '알 수 없는 시설이에요.';if(s.paused||s.ended)return '시간을 재개한 뒤 지을 수 있어요.';if(!unlocked(s,type)&&!s.buildings.some(b=>b.id===ignoreId&&b.type===type))return unlockMessage(s,type);
 if(!Number.isInteger(x)||!Number.isInteger(y))return '땅을 골라 주세요.';
 for(const[cx,cy]of cells({type,x,y})){if(cx<0||cy<0||cx>=SIZE||cy>=SIZE)return '마을 경계 안에 놓아 주세요.';const o=at(s,cx,cy);if(o&&o.id!==ignoreId)return '이미 사용 중인 땅이에요.';if(cx<2)return '이 숲은 보전하는 구역이에요.';if(type==='bridge'?cx!==RIVER:cx===RIVER)return type==='bridge'?'다리는 개울 위에 놓아요.':'개울에는 다리를 놓아 주세요.';if(terrain(cx,cy)==='warehouse'&&type!=='workshop')return '오래된 창고는 재생 공간으로 고쳐 써요.';}
 if(type==='workshop'&&(x!==14||y!==7))return '강 건너 오래된 창고(14,7)에서 개조해요.';return waterfrontError(s,type,x,y,ignoreId);
}
export const cost=(type,opts=[],s)=>buildingSpec(s,type).cost+opts.reduce((a,o)=>a+(OPTIONS[o]?.cost||0),0);
export function clearingCost(s,type,x,y){if(s.cozyV===1)return 0;return cells({type,x,y}).filter(([cx,cy])=>naturalFeature(cx,cy)&&!s.landscape?.cleared.includes(`${cx},${cy}`)).length*12;}
export function buildCost(s,type,x,y,opts=[]){return cost(type,opts,s)+clearingCost(s,type,x,y);}
function clearUnder(s,b){s.landscape??={version:1,cleared:[]};for(const[cx,cy]of cells(b))if(naturalFeature(cx,cy)&&!s.landscape.cleared.includes(`${cx},${cy}`))s.landscape.cleared.push(`${cx},${cy}`);}
// 공사비는 확정 순간 한 번만 차감된다(선차감). 완공 때는 아무것도 차감하지 않는다.
export function build(s,type,x,y,opts=[],dir){if(dir!==undefined&&(!validDirection(dir)||!rotatable(type)))return{error:'건물 방향을 확인해 주세요.'};const error=canBuild(s,type,x,y);if(error)return{error};if(!Array.isArray(opts)||opts.length>2||new Set(opts).size!==opts.length||opts.some(o=>!Object.hasOwn(OPTIONS,o))||opts.length&&!TYPES[type].sprite&&TYPES[type].sprite!==0)return{error:'설계 옵션을 확인해 주세요.'};
 const price=buildCost(s,type,x,y,opts);if(s.money<price)return{error:`건설비가 부족해요. ${price}이 필요하고 지금 ${Math.floor(s.money)}이 있어요.`};s.money-=price;const b={id:s.nextId++,type,x,y,opts:[...opts],progress:0,starter:false};if(s.cozyV===1)b.paidCost=cost(type,opts,s);if(dir!==undefined)b.dir=dir;if(isGarden(b))b.plantedAt=s.t;clearUnder(s,b);s.buildings.push(b);return{building:b};}
export function clearLandscape(s,x,y){if(s.paused||s.ended)return{error:'시간을 재개한 뒤 철거할 수 있어요.'};if(!(s.cozyV===1?clearablePlot(x,y):naturalFeature(x,y))||at(s,x,y))return{error:'마을 안의 나무나 조경을 골라 주세요.'};if(s.landscape?.cleared.includes(`${x},${y}`))return{error:'이미 정리한 자리예요.'};const fee=s.cozyV===1?0:12;if(s.money<fee)return{error:'정비에는 12코인이 필요해요.'};s.landscape??={version:1,cleared:[]};s.landscape.cleared.push(`${x},${y}`);s.money-=fee;return{fee};}
const validDirection=dir=>Number.isInteger(dir)&&dir>=0&&dir<4;
export const rotatable=type=>Object.hasOwn(TYPES,type)&&!['road','bridge','harbor'].includes(type);
export function rotateBuilding(s,id,dir){const b=s.buildings.find(b=>b.id===id);if(s.paused||s.ended)return{error:'재개한 뒤 방향을 바꿀 수 있어요.'};if(!b||!rotatable(b.type)||!validDirection(dir))return{error:'방향을 바꿀 건물을 골라 주세요.'};b.dir=dir;return{};}
export const UPGRADE_TYPES=['house','apartment','duplex','gardenhouse','terracehouse','chicken','snack','western','japanese','chinese','clinic','hospital','kids','amusement','school','library','fire','workshop','convenience','supermarket'];
export function upgradeError(s,id,opt){const b=s.buildings.find(b=>b.id===id);if(s.paused||s.ended)return '재개한 뒤 개선할 수 있어요.';if(!b||b.progress<1||!Object.hasOwn(OPTIONS,opt)||b.opts.includes(opt)||b.opts.length>=2||!UPGRADE_TYPES.includes(b.type))return '이 설계는 적용할 수 없어요.';if(s.money<OPTIONS[opt].cost)return '건설비가 부족해요.';return ''; }
export function upgrade(s,id,opt){const error=upgradeError(s,id,opt);if(error)return{error};const b=s.buildings.find(b=>b.id===id);s.money-=OPTIONS[opt].cost;b.opts.push(opt);return{};}
// Refund the original construction price; older saves retain their pre-increase refund.
export function demolish(s,id){const b=s.buildings.find(b=>b.id===id);if(!b)return{error:'철거할 시설을 다시 골라 주세요.'};if(b.starter&&!isGarden(b)&&s.cozyV!==1)return{error:'처음부터 있던 기반 시설은 보존해요.'};if(s.paused||s.ended)return{error:'재개한 뒤 변경할 수 있어요.'};const refund=b.progress<1?Math.min(1e8-s.money,Math.floor((b.paidCost??cost(b.type,b.opts,{...s,cozyV:undefined}))*(1-b.progress)*.65)):0;s.money+=refund;s.buildings=s.buildings.filter(x=>x.id!==id);if(s.cozyV===1){s.landscape??={version:1,cleared:[]};for(const[x,y]of cells(b))if(clearablePlot(x,y)&&!s.landscape.cleared.includes(`${x},${y}`))s.landscape.cleared.push(`${x},${y}`);}return{refund};}
// 휴업: 유지비와 효과가 모두 0. 순수입이 마이너스일 때의 구제 경로. 재개는 무료.
export function toggleClosed(s,id){const b=s.buildings.find(b=>b.id===id);if(!b||b.progress<1||b.starter||['road','bridge'].includes(b.type))return{error:'이 시설은 휴업할 수 없어요.'};if(s.paused||s.ended)return{error:'재개한 뒤 바꿀 수 있어요.'};b.closed=!b.closed;if(!b.closed)delete b.closed;return{closed:!!b.closed};}
// 텃밭 돌보기: 게임시간 15초 활동, 월 1회, +35. 시작은 즉시 기록하고 지급은 advance에서 15초 뒤에 한다(재접속·연타로 중복 불가).
export function harvest(s){if(s.paused||s.ended)return{error:'재개한 뒤 돌볼 수 있어요.'};const m=month(s);if(s.harvestAt!==null)return{error:'지금 텃밭을 돌보는 중이에요.'};if(s.harvested.includes(m))return{error:'이번 달 텃밭은 이미 돌봤어요. 다음 달에 다시 할 수 있어요.'};s.harvestAt=s.t;return{};}
export function canRelocate(s,b){if(!b)return '시설을 찾을 수 없어요.';if(s.paused||s.ended)return '재개한 뒤 옮길 수 있어요.';if(b.starter)return '처음부터 있던 시설은 옮기지 않아요.';if(['road','bridge','workshop'].includes(b.type))return '길·다리·창고 재생 공간은 옮길 수 없어요.';if(b.progress<1)return '공사가 끝난 뒤 옮길 수 있어요.';if(s.cozyV===1)return '';if(b.moved)return '이 건물은 이미 한 번 옮겼어요.';if(b.completedAt===undefined||s.t-b.completedAt>RELOCATE_WINDOW)return '완공 후 이동 가능한 시간이 지났어요.';return '';}
export const relocateLeft=(s,b)=>b.completedAt===undefined?0:Math.max(0,RELOCATE_WINDOW-(s.t-b.completedAt));
// 옮기는 동안 상태를 바꾸지 않고 확정 순간에만 위치·정비비·사용 여부를 한 번에 적용한다.
export function relocate(s,id,x,y,dir){const b=s.buildings.find(b=>b.id===id);if(dir!==undefined&&(!validDirection(dir)||!rotatable(b?.type)))return{error:'건물 방향을 확인해 주세요.'};const why=canRelocate(s,b);if(why)return{error:why};if(b.x===x&&b.y===y)return{error:'같은 자리예요.'};const error=canBuild(s,b.type,x,y,b.id);if(error)return{error};const fee=clearingCost(s,b.type,x,y);if(s.money<fee)return{error:`자연 정비비 ${fee}이 필요해요.`};
 s.money-=fee;b.x=x;b.y=y;if(dir!==undefined)b.dir=dir;b.moved=true;clearUnder(s,b);return{fee};}
// New towns grow through occupied homes and used services; v2 saves retain their annual multipliers.
export const economy=s=>{const y=s.economyV===2?Math.min(2,Math.floor(month(s)/12)):0;return{income:[1,.6,.4][y],upkeep:[1,1.5,2][y]};};
export const upkeepOf=(s,b)=>b.closed||b.progress<1?0:buildingSpec(s,b.type).up*economy(s).upkeep;
export function metrics(s){const net=network(s),live=s.buildings.filter(b=>b.progress>=1&&!b.closed&&connected(s,b,net)),p=Math.max(1,s.pop),m=month(s),se=season(calendarMonth(s)),sum=k=>live.reduce((a,b)=>a+(buildingSpec(s,b.type)[k]||0),0);
 let production=0,use=0;for(const b of live){const d=buildingSpec(s,b.type);if(d.e>0)production+=d.e*(b.type==='solar'?[.7,1,1.2,.9][se]:1);else{let u=-d.e*(se===0||se===2?1.2:1);if(b.opts.includes('ins')&&(se===0||se===2))u*=.75;if(b.opts.includes('shade')&&se===2)u*=.8;use+=u;}}
 const energy=use?clamp(production/use):1,food=clamp(sum('food')/p),health=clamp(sum('health')/p),education=clamp(sum('education')/p),leisure=clamp(sum('leisure')/p),housing=sum('cap');
 // A규칙: 제공되지 않는 의료·교육·여가·안전 시설은 평가하지 않는다(회복 불가능한 감점 방지). B단계에서 월별 해금 평가로 복원.
 const demands=['food',...Object.keys(DEMAND_MONTH).filter(k=>m>=demandMonth(s,k))];
 const all={food,health,education,leisure};const service=demands.reduce((a,k)=>a+all[k],0)/demands.length;
 const landscaping=landscapeMetrics(s,live);
 const green=clamp((live.filter(b=>isGarden(b)&&b.type!=='bench').length*4+6)/p),homes=live.filter(b=>TYPES[b.type].cap),comfort=homes.length?homes.filter(b=>b.opts.includes('ins')||(se===2&&b.opts.includes('shade'))).length/homes.length:0;
 const fire=live.some(b=>b.type==='fire'),drain=live.some(b=>b.type==='drain'),training=m>=6&&calendarMonth(s)===8&&!fire,rain=m>=4&&calendarMonth(s)===6&&!drain;
 const beautyPhase=cityPhase(s),beauty=landscaping.score/100;
 let targetSat=clamp(beautyPhase*beauty*5+35+service*40+energy*15+green*5+comfort*5-(housing<s.pop?20:0)-(training?7:0)-(rain?5:0),0,100);
 const users=s.economyV===4?s.pop:p,foodUsed=Math.min(users,sum('food')),leisureUsed=Math.min(users,sum('leisure'));
 const premium=premiumIncome(s,live);
 let income=premium+(s.economyV===4?(8+s.pop*(2+2*clamp(s.sat/100))+foodUsed*12+Math.min(s.pop,sum('health'))*2+Math.min(s.pop,sum('education'))*2+leisureUsed*3):((s.economyV===3?20:80)+s.pop*(8+8*clamp(s.sat/100))+foodUsed*4+leisureUsed)*economy(s).income);
 const upkeep=s.buildings.filter(b=>b.progress>=1&&!b.closed).reduce((a,b)=>a+upkeepOf(s,b),0);
 const safety=(m<5||fire ? .6 : .2)+(m<5||drain ? .4 : .1);
 const optionEligible=live.filter(b=>s.cozyV===1?UPGRADE_TYPES.includes(b.type):TYPES[b.type].cap||TYPES[b.type].food||TYPES[b.type].education||TYPES[b.type].health||TYPES[b.type].leisure);
 const optionRate=optionEligible.length?optionEligible.filter(b=>b.opts.length).length/optionEligible.length:0;
 const env=energy*.4+green*.15+(m<2?1:optionRate)*.15+landscaping.score/100*.3;
 const popGoal=Math.min(32+16*Math.min(2,Math.floor(m/12)),12+m*4);
 const D=clamp(clamp(s.pop/popGoal)*(.35-.14*beautyPhase)+service*.30+env*.20+safety*.15+beauty*.14*beautyPhase);
 const Q=clamp(s.sat/100*.50+service*.30+energy*.15+clamp(housing/p)*.05);
 let welfare=0;
 if(s.cozyV===1){const effect=cozyEffects(s);welfare=effect.welfare;targetSat=Math.min(50+effect.happiness,80+20*clamp(env));income=upkeep+(90+effect.income)*MONTH/(60*PLAY_SPEED);}
 return{welfare,environment:Math.round(clamp(env)*100),landscaping,beautyPhase,premium,net,live,production,use,energy,food,health,education,leisure,housing,service,green,comfort,targetSat,income,upkeep,D,Q,score:s.cozyV===1?cozyGrowth(s).score:Math.round(1000*D*Q),demands,popGoal,fire,drain,optionRate,foodCap:sum('food'),healthCap:sum('health'),educationCap:sum('education'),leisureCap:sum('leisure')};
}
export const DEMAND_MONTH={health:2,education:3,leisure:4};
export const demandMonth=(s,key)=>DEMAND_MONTH[key]+(s.economyV===4?1:0);
export const EVENTS=[[1,'2월: 편의점·의원·태양광·꽃밭·가로수·개울다리가 열렸어요. 3월부터 의료 수요를 평가해요.'],[2,'3월: 봄. 의료 평가 시작. 학교·도서관·식당 대안·빌라가 열렸어요. 4월부터 교육 평가.'],[3,'4월: 교육 평가 시작. 키즈카페·쉼터 벤치가 열렸어요. 5월부터 여가 평가.'],[4,'5월: 여가 평가 시작. 소방서·배수시설이 열렸어요. 7월 장마 전에 배수를 준비하세요.'],[5,'6월: 여름. 전력 수요가 20% 늘어요. 장마 준비를 점검하세요.'],[6,'7월: 장마! 배수시설이 없으면 만족도가 내려가요(복구 가능).'],[7,'8월: 대형마트·작은 놀이동산이 열렸어요. 의무가 아니에요. 자금과 이용률을 비교해 고르세요.'],[8,'9월: 가을 안전훈련. 소방서가 없으면 만족도와 안전 점수가 내려가요.'],[9,'10월: 창고 재생 공간(14,7)이 열렸어요. 연말 예상을 보고 빈틈을 채우세요.'],[10,'11월: 겨울 대비. 단열 옵션과 전력 수요를 점검하세요.'],[11,'12월: 마지막 달. 남은 시간보다 긴 공사는 완공되지 않아요.']];
// 결과 문구는 화면에 삽입되므로 저장 파일에서 들어온 값은 실제 칭호 목록만 허용한다.
export const SPECIALS=['다시 쓰는 건축가','햇살과 바람의 설계자','안전한 마을의 수호자','우리 동네의 개척자'];
export const tier=score=>TIERS.find(t=>score>=t[0])||TIERS.at(-1);
export const CASH_STRESS_LIMIT=3*MONTH;
export const TIER_REASONS={service80:'다이아 이상은 평가 중인 생활 서비스가 각각 80% 이상 필요해요.',service90:'이모탈 이상은 평가 중인 생활 서비스가 각각 90% 이상 필요해요.',service100:'레디언트는 평가 중인 생활 서비스가 각각 100% 필요해요.',power90:'다이아 이상은 전력 수요를 90% 이상 채워야 해요.',power98:'이모탈 이상은 전력 수요를 98% 이상 채워야 해요.',power100:'레디언트는 전력 수요를 모두 채워야 해요.',safety:'다이아 이상은 소방서와 배수 시설을 완공하고 길에 연결해 운영해야 해요.',budget:'기금 고갈·운영비 부족이 누적 3개월이에요. 월 순수입을 0 이상으로 만들거나 한 달 적자분을 마련해요.'};
const TIER_CAPS={service80:799,service90:899,service100:949,power90:799,power98:899,power100:949,safety:799,budget:799};
export function tierConditions(s,v=metrics(s)){
 let cap=1000,reasons=[];if(s.cozyV===1||s.scoringV!==2)return{cap,reasons};
 const limit=(test,reason)=>{const n=TIER_CAPS[reason];if(test&&n<=cap){if(n<cap)reasons=[];cap=n;reasons.push(reason);}};
 const service=Math.min(...v.demands.map(k=>v[k]))+1e-9,power=v.energy+1e-9;
 limit(service<.8,'service80');limit(service<.9,'service90');limit(service<1,'service100');
 limit(power<.9,'power90');limit(power<.98,'power98');limit(power<1,'power100');
 limit(month(s)>=5&&(!v.fire||!v.drain),'safety');
 limit(s.cashStress>=CASH_STRESS_LIMIT&&v.income<v.upkeep&&s.money<v.upkeep-v.income,'budget');
 return{cap,reasons};
}
function graded(score,conditions){return{rawTotal:score,total:Math.min(score,conditions.cap),cap:conditions.cap,reasons:[...conditions.reasons]};}
export function assessTier(s,score,v=metrics(s)){return graded(score??v.score,tierConditions(s,v));}
// Annual reviews use only that year's recorded months; the final result retains its full-run average.
export function annualReviews(s){return Object.freeze(Array.from({length:Math.floor(Math.min(s.t/YEAR,s.hist.length/12))},(_,i)=>{
 const yearHist=s.hist.slice(i*12,(i+1)*12),last=yearHist.at(-1),avg=yearHist.reduce((a,h)=>a+h.score,0)/12,raw=Math.round(.7*last.score+.3*avg),grade=last.scoring==='next-b2'?graded(raw,last):{total:raw},t=tier(grade.total);
 return Object.freeze({year:i+1,...grade,tier:t[1],title:t[2],D:last.D,Q:last.Q,endScore:last.score,average:Math.round(avg)});
}));}
function end(s){const v=metrics(s),avg=s.hist.reduce((a,h)=>a+h.score,0)/Math.max(1,s.hist.length),raw=Math.round(.7*v.score+.3*avg),grade=s.scoringV===2?assessTier(s,raw,v):{total:raw},t=tier(grade.total);s.result={rule:RULE,scoring:s.scoringV===2?'next-b2':'next-b1',landscape:v.landscaping.score,...grade,tier:t[1],title:t[2],D:Math.round(v.D*100),Q:Math.round(v.Q*100),endScore:v.score,average:Math.round(avg),hist:structuredClone(s.hist),special:v.live.some(b=>b.type==='workshop')?'다시 쓰는 건축가':v.optionRate>.7?'햇살과 바람의 설계자':v.fire&&v.drain?'안전한 마을의 수호자':'우리 동네의 개척자'};s.ended=true;s.paused=true;}
// 정수 초 단위 시뮬레이션: 프레임 간격이나 기기 속도가 경제에 영향을 주지 않는다.
export function advance(s,dt){if(s.paused||s.ended||!Number.isFinite(dt)||dt<0)return;const total=s.carry+dt;let steps=Math.floor(total+1e-8);s.carry=Math.max(0,total-steps);steps=Math.min(steps,86400);
 for(let i=0;i<steps&&!s.ended;i++){if(s.mode==='run'&&s.t>=duration(s)){end(s);break;}
  s.stage=stage(s);for(const b of s.buildings.filter(b=>b.progress<1).slice(0,2)){b.progress=Math.min(1,b.progress+1/buildingSpec(s,b.type).time);if(b.progress>=1-1e-9){b.progress=1;b.completedAt=s.t+1;}}
  if(s.harvestAt!==null&&s.t+1-s.harvestAt>=HARVEST_SECONDS){const hm=Math.floor(s.harvestAt/MONTH);s.harvestAt=null;if(!s.harvested.includes(hm)){s.harvested.push(hm);s.harvested=s.harvested.slice(-36);s.money+=HARVEST;}}
  const v=metrics(s),cashBefore=s.money;s.money=clamp(s.money+(v.income-v.upkeep)/MONTH,0,1e8);
  // A small harvest pauses the shortage clock; sustainable income or a month's reserve clears it.
  if(s.scoringV===2&&s.mode==='run'){const loss=v.upkeep-v.income;if(loss<=0||cashBefore>=loss||s.money>=loss)s.cashStress=0;else if(s.money===0)s.cashStress=Math.min(CASH_STRESS_LIMIT,s.cashStress+1);}
  const target=s.cozyV===1?v.targetSat:s.t<MONTH?Math.max(78,v.targetSat):v.targetSat;s.sat+=clamp(target-s.sat,-.12,.12);
  if(s.t%12===11&&s.pop<v.housing&&(s.cozyV===1||s.sat>=55))s.pop++;
  if(s.cozyV===1)s.populationPeak=Math.max(s.populationPeak??s.pop,s.pop);
  s.t++;if(s.t%MONTH===0){const atMonth={...s,t:s.t-1},snapshot=metrics(atMonth);recordCozyMonth(s,snapshot);if(s.mode==='run')s.hist.push({month:s.hist.length+1,score:snapshot.score,scoring:s.scoringV===2?'next-b2':'next-b1',...(s.scoringV===2?tierConditions(atMonth,snapshot):{}),D:Math.round(snapshot.D*100),Q:Math.round(snapshot.Q*100)});}
  if(s.mode==='run'&&s.t===duration(s))end(s);
 }if(s.ended)s.carry=0;
}
export function continueFree(s){if(!s.result)return false;s.mode='free';s.ended=false;s.paused=false;return true;}
export function serialize(s){return JSON.stringify(s);}
export function parseSave(text){if(typeof text!=='string'||text.length>500000)throw Error('파일 크기를 확인해 주세요.');let s;try{s=JSON.parse(text);}catch{throw Error('작품 파일 형식이 아니에요.');}
 const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;
 const validConditions=h=>h&&Array.isArray(h.reasons)&&h.reasons.length<=Object.keys(TIER_CAPS).length&&new Set(h.reasons).size===h.reasons.length&&h.reasons.every(k=>Object.hasOwn(TIER_CAPS,k)&&TIER_CAPS[k]===h.cap)&&h.cap===(h.reasons.length?TIER_CAPS[h.reasons[0]]:1000);
 if(!s||s.v!==VERSION||s.rule!==RULE||!['run','free'].includes(s.mode)||!num(s.t,0,s.mode==='run'?duration(s):1e8)||!Number.isInteger(s.t)||!num(s.carry,0,1)||!num(s.money,0,1e8)||!Number.isInteger(s.pop)||!num(s.pop,0,10000)||!num(s.sat,0,100)||!Number.isInteger(s.stage)||!num(s.stage,0,3)||typeof s.paused!=='boolean'||typeof s.ended!=='boolean'||!Array.isArray(s.buildings)||s.buildings.length>SIZE*SIZE||!Array.isArray(s.hist)||s.hist.length>(s.runMonths??12))throw Error('저장 내용이 올바르지 않아요.');
 if(s.populationPeak!==undefined&&(!Number.isInteger(s.populationPeak)||!num(s.populationPeak,s.pop,10000)))throw Error('인구 성장 기록을 확인해 주세요.');
 if(s.placementHintsShown!==undefined&&(!Number.isInteger(s.placementHintsShown)||!num(s.placementHintsShown,0,2)))throw Error('자리 안내 기록을 확인해 주세요.');
 if(s.cozyV!==undefined&&(s.cozyV!==1||s.mode!=='free'||s.ended))throw Error('꾸미기 기록을 확인해 주세요.');
 validateCozyReview(s);
 if(s.cityV!==undefined&&(s.cityV!==1||s.economyV!==4||s.scoringV!==2))throw Error('도시 발전 규칙을 확인해 주세요.');
 if(s.economyV!==undefined&&![2,3,4].includes(s.economyV))throw Error('경제 규칙을 확인해 주세요.');
 if(s.scoringV!==undefined&&s.scoringV!==2||s.scoringV===2&&(!Number.isInteger(s.cashStress)||!num(s.cashStress,0,Math.min(s.t,CASH_STRESS_LIMIT)))||s.scoringV===undefined&&s.cashStress!==undefined)throw Error('평가 규칙과 운영비 부족 기록을 확인해 주세요.');
 if(s.runMonths!==undefined&&s.runMonths!==12&&s.runMonths!==36)throw Error('진행 기간을 확인해 주세요.');
 if(s.startMonth!==undefined&&s.startMonth!==0&&s.startMonth!==2)throw Error('시작 월을 확인해 주세요.');
 if(s.landscape===undefined)s.landscape={version:1,cleared:[]};
 if(!Array.isArray(s.harvested)||s.harvested.length>36||new Set(s.harvested).size!==s.harvested.length||s.harvested.some(m=>!Number.isInteger(m)||m<0||m>Math.floor(s.t/MONTH))||!(s.harvestAt===null||Number.isInteger(s.harvestAt)&&s.harvestAt>=0&&s.harvestAt<=s.t))throw Error('텃밭 기록이 올바르지 않아요.');
 if(!s.landscape||s.landscape.version!==1||!Array.isArray(s.landscape.cleared)||s.landscape.cleared.length>324||new Set(s.landscape.cleared).size!==s.landscape.cleared.length||s.landscape.cleared.some(k=>typeof k!=='string'||!/^\d{1,2},\d{1,2}$/.test(k)||!(s.cozyV===1?clearablePlot:naturalFeature)(...k.split(',').map(Number))||k!==k.split(',').map(Number).join(',')))throw Error('조경 기록이 올바르지 않아요.');
 for(const b of s.buildings)if(b?.plantedAt!==undefined&&(!isGarden(b)||!num(b.plantedAt,0,s.t)))throw Error('식물 성장 기록이 올바르지 않아요.');
 const occupied=new Set(),ids=new Set();for(const b of s.buildings){if(!b||!Object.hasOwn(TYPES,b.type)||!Number.isInteger(b.id)||b.id<1||ids.has(b.id)||!Number.isInteger(b.x)||!Number.isInteger(b.y)||!num(b.progress,0,1)||typeof b.starter!=='boolean'||!Array.isArray(b.opts)||b.opts.length>2||new Set(b.opts).size!==b.opts.length||b.opts.some(o=>!Object.hasOwn(OPTIONS,o)))throw Error('시설 정보가 올바르지 않아요.');
  if(b.paidCost!==undefined&&(!Number.isInteger(b.paidCost)||!num(b.paidCost,0,1e8)))throw Error('건설비 기록이 올바르지 않아요.');
  if(b.paint!==undefined&&(!validPaint(b.paint)||!PAINTABLE.has(b.type)))throw Error('건물 색을 확인해 주세요.');
  if(b.dir!==undefined&&(!validDirection(b.dir)||!rotatable(b.type)))throw Error('시설 방향이 올바르지 않아요.');
  if(b.completedAt!==undefined&&(!Number.isInteger(b.completedAt)||!num(b.completedAt,0,Math.max(s.t,0))||b.progress<1))throw Error('완공 기록이 올바르지 않아요.');if(b.moved!==undefined&&(typeof b.moved!=='boolean'||b.starter))throw Error('재배치 기록이 올바르지 않아요.');if(b.closed!==undefined&&(b.closed!==true||b.progress<1))throw Error('휴업 기록이 올바르지 않아요.');
  ids.add(b.id);for(const[x,y]of cells(b)){const k=`${x},${y}`;if(x<0||y<0||x>=SIZE||y>=SIZE||occupied.has(k)||((x===RIVER)!==(b.type==='bridge'))||x<2)throw Error('시설 배치가 올바르지 않아요.');occupied.add(k);}}
 for(const b of s.buildings)if(waterfrontError(s,b.type,b.x,b.y,b.id))throw Error('항구와 다리의 위치를 확인해 주세요.');
 if(!Number.isInteger(s.nextId)||s.nextId<=Math.max(0,...ids))throw Error('시설 번호를 확인해 주세요.');
 for(let i=0;i<s.hist.length;i++){const h=s.hist[i];if(h.month!==i+1||!num(h.score,0,1000)||!num(h.D,0,100)||!num(h.Q,0,100))throw Error('월별 기록이 올바르지 않아요.');}
 const validHistoryGrade=h=>s.scoringV===2?h.scoring==='next-b2'&&validConditions(h):h.scoring!=='next-b2';
 if(!s.hist.every(validHistoryGrade))throw Error('월별 평가 조건을 확인해 주세요.');
 if(s.mode==='run'&&s.hist.length!==Math.floor(s.t/MONTH))throw Error('시간 기록이 맞지 않아요.');
 if(s.result!==null){const r=s.result;if(!r||r.rule!==RULE||!num(r.total,0,1000)||!num(r.D,0,100)||!num(r.Q,0,100)||!num(r.average,0,1000)||!num(r.endScore,0,1000)||!Array.isArray(r.hist)||r.hist.length!==(s.runMonths??12)||r.title!==tier(r.total)[2]||r.tier!==tier(r.total)[1]||!SPECIALS.includes(r.special)||!num(r.landscape,0,100))throw Error('결과 기록을 확인해 주세요.');}
 if(s.mode==='run'&&(s.ended!==(s.t===duration(s))||s.ended!==!!s.result))throw Error('종료 기록이 맞지 않아요.');
 if(s.result)for(let i=0;i<(s.runMonths??12);i++){const h=s.result.hist[i];if(!h||h.month!==i+1||!num(h.score,0,1000)||!num(h.D,0,100)||!num(h.Q,0,100))throw Error('결과의 월별 기록이 올바르지 않아요.');}
 if(s.result){const r=s.result;if(!r.hist.every(validHistoryGrade)||(s.scoringV===2?r.scoring!=='next-b2'||!validConditions(r)||!Number.isInteger(r.rawTotal)||!num(r.rawTotal,0,1000)||r.total!==Math.min(r.rawTotal,r.cap)||r.cap!==r.hist.at(-1).cap||r.reasons.some(k=>!r.hist.at(-1).reasons.includes(k))||r.reasons.length!==r.hist.at(-1).reasons.length||r.rawTotal!==Math.round(.7*r.endScore+.3*r.hist.reduce((a,h)=>a+h.score,0)/r.hist.length):r.scoring==='next-b2'))throw Error('결과의 평가 조건을 확인해 주세요.');}
 // Unfinished one-year saves continue without losing time or history; completed results stay intact.
 if(!s.result)s.runMonths=36;
 s.events=[];s.savedAt=0;return s;
}
