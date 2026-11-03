import {buildingSpec,metrics,TYPES,MONTH,month,monthLabel,calendarMonth,demandMonth,connected,unlocked,HARVEST,HARVEST_SECONDS} from './core.mjs?v=income1';
import {PLAY_SPEED,realSeconds,COZY_EFFECTS} from './data.mjs?v=income1';

// nextId never decreases, so cancelling or reloading cannot restart completed guidance.
export const guidedPlacement=s=>s.mode==='run'&&!s.ended&&month(s)<4&&s.nextId-1-s.buildings.filter(b=>b.starter).length<2;
export const netIncome=v=>v.income-v.upkeep;
export const incomePerMinute=v=>netIncome(v)*PLAY_SPEED/MONTH*60;
export const calendarDay=s=>1+Math.floor((s.t%MONTH)/MONTH*[31,28,31,30,31,30,31,31,30,31,30,31][calendarMonth(s)]);
// This order matches the 5×5 atlas rendered from the game's models.
export const cataloguePictures=['road','house','snack','apartment','western','japanese','chinese','convenience','supermarket','clinic','hospital','kids','amusement','school','library','fire','drain','workshop','solar','generator','bridge','flower','avenue','tree','bench'];
export const incomeRate=v=>`${netIncome(v)<0?'−':'+'}${(Math.abs(netIncome(v))*PLAY_SPEED/MONTH).toFixed(1)}/초`;

export function buildingBenefit(s,type){
 const garden={flower:'집 곁 미관을 높이는 꽃밭',avenue:'꽃밭과 어울리는 그늘나무',tree:'집 가까이 초록 쉼터 만들기',bench:'꽃·나무 곁 주민의 쉼터'};if(garden[type])return garden[type];
 const d=buildingSpec(s,type),services=[['cap','입주'],['food','식사'],['health','의료'],['education','교육'],['leisure','여가']].filter(([k])=>d[k]);
 return services.length?services.map(([k,name])=>`${name} ${d[k]}명`).join(' · '):d.e>0?`전력 +${d.e}${type==='solar'?' · 계절에 따라 변화':''}`:d.desc;
}
export function completionMessage(s,ids){
 const b=s.buildings.find(b=>b.id===ids[0]);if(!b)return '';
 const d=buildingSpec(s,b.type);if(!connected(s,b))return `${d.name} 완공! 길을 이어야 이용할 수 있어요.`;
 const after=metrics(s),before=metrics({...s,buildings:s.buildings.filter(b=>!ids.includes(b.id))});
 const difference=netIncome(after)-netIncome(before),land=after.landscaping.score-before.landscaping.score;
 return `${d.name}${ids.length>1?` 외 ${ids.length-1}곳`:''} 완공! ${buildingBenefit(s,b.type)}\n순수입 ${incomeRate(before)} → ${incomeRate(after)}${land>0?` · 미관 +${land}`:''}${d.cap?' · 입주하면 수입도 자라요':difference<=0?' · 이용할 주민이 늘면 효과도 커져요':''}`;
}

// Recommendations simplify the first investments; the full catalogue remains available.
export function starterChoices(s){
 if(s.economyV!==4||s.mode!=='run'||s.ended||month(s)>=4||s.pop>=16)return null;
 const v=metrics(s),shop=v.live.some(b=>TYPES[b.type].food);
 if(!shop)return ['snack','road'];
 const choices=s.pop<12?['house','flower']:['house','clinic','flower'];
 if(v.energy<1)choices.unshift('solar');
 return choices.filter(t=>unlocked(s,t));
}

// Forecasts freeze today's season, happiness and other buildings; they are not guaranteed earnings.
export function incomePreview(s,type,x,y,moving=null){
 const before=metrics(s),buildings=moving?s.buildings.map(b=>b.id===moving?{...b,x,y}:b):[...s.buildings,{id:s.nextId,type,x,y,progress:1,opts:[],...(['tree','flower','avenue','bench'].includes(type)?{plantedAt:s.t}:{})}];
 const next={...s,buildings},after=metrics(next),building=buildings.find(b=>b.id===(moving||s.nextId));
 const filled=buildingSpec(s,type).cap&&!moving&&connected(next,building)?metrics({...next,pop:Math.max(s.pop,after.housing)}):null;
 const future=['health','education','leisure'].filter(k=>buildingSpec(s,type)[k]&&demandMonth(s,k)>month(s));
 const evalMonth=future.length?Math.min(...future.map(k=>demandMonth(s,k))):null;
 const later=evalMonth===null?null:{month:evalMonth,before:metrics({...s,t:evalMonth*MONTH}),after:metrics({...next,t:evalMonth*MONTH})};
 return {before,after,filled,later};
}

export function incomePreviewText(s,type,x,y,moving=null){
 const {before,after,filled,later}=incomePreview(s,type,x,y,moving);
 const line=`순수입 ${incomeRate(before)} → 완공 직후 ${incomeRate(after)}`;
 const service=['health','education','leisure'].some(k=>buildingSpec(s,type)[k]);
 const benefit=service?`\n${later?monthLabel(s,later.month)+' 생활 평가 시작 때':'현재 생활 평가'} · 행복 목표 ${Math.round((later?.before||before).targetSat)} → ${Math.round((later?.after||after).targetSat)} (${later?'그 달 계절과 ':'현재 '}주민·시설 기준 예상)`:'';
 const extra=later&&buildingSpec(s,type).education&&buildingSpec(s,type).leisure&&demandMonth(s,'leisure')>later.month?` · 여가 평가는 ${monthLabel(s,demandMonth(s,'leisure'))}부터`:'';
 const beauty=s.cityV===1?`\n도시 미관 ${before.landscaping.score} → ${after.landscaping.score}점${['tree','flower','avenue','bench'].includes(type)?' · 자라면 더 좋아져요':''}`:'';
 return line+(filled?` · 모두 입주하면 ${incomeRate(filled)} (행복·식생활·전력도 챙겨요)`:'')+' · 현재 행복·계절 기준 예상'+benefit+extra+beauty;
}

export const buildBudget=(money,price)=>money<price?`기금 ${Math.ceil(price-money).toLocaleString()} 부족`:`짓고 남는 기금 ${Math.floor(money-price).toLocaleString()}`;

export const catalogueBudget=(money,cost)=>money<cost?`${Math.ceil(cost-money)} 더 모으면 지을 수 있어요`:'자리 고르기';

// Match the two construction crews and whole simulation ticks used by advance().
export function constructionTime(s,b){
 const queue=s.buildings.filter(x=>x.progress<1),lanes=[0,0];if(!queue.some(x=>x.id===b.id))queue.push(b);
 for(let i=0;i<queue.length;i++){const x=queue[i],crew=lanes[0]<=lanes[1]?0:1,start=lanes[crew];lanes[crew]+=Math.ceil((1-x.progress)*TYPES[x.type].time-1e-8);
  if(x.id===b.id)return {position:i,wait:realSeconds(Math.max(0,start-(s.carry||0))),finish:realSeconds(Math.max(0,lanes[crew]-(s.carry||0)))};
 }
}
export function constructionText(s,b){const t=constructionTime(s,b);return t.position<2?`공사 중 · 완공까지 약 ${t.finish}초`:`대기 ${t.position-1}번째 · 시작까지 약 ${t.wait}초 · 완공까지 약 ${t.finish}초`;}

export function serviceChangeText(s,type,before,after){
 const d=buildingSpec(s,type),lines=[];
 for(const [key,name] of [['food','식사'],['health','의료'],['education','교육'],['leisure','여가']])if(d[key]){const a=Math.min(s.pop,before[key+'Cap']),b=Math.min(s.pop,after[key+'Cap']);lines.push(`${name} 충족 ${a} → ${b} / ${s.pop}명${a===b&&a===s.pop?' · 지금 수요는 이미 충족돼요':''}`);}
 if(d.cap)lines.push(`살 집 ${before.housing} → ${after.housing}명분 · 이웃 ${s.pop}명`);
 if(d.e){const balance=v=>v.production-v.use;lines.push(`전력 여유 ${balance(before).toFixed(1)} → ${balance(after).toFixed(1)}${balance(after)<0?' · 전력이 부족해져요':''}`);}
 return lines.join('\n');
}
export function placementBenefits(s,type,x,y,moving=null){const {before,after}=incomePreview(s,type,x,y,moving);return serviceChangeText(s,type,before,after);}

export function operatingPreviewText(s,b,before=metrics(s)){
 const after=metrics({...s,buildings:s.buildings.map(x=>x.id===b.id?{...x,closed:!x.closed}:x)});
 return `${b.closed?'다시 열면':'휴업하면'} 순수입 ${incomeRate(before)} → ${incomeRate(after)}\n${serviceChangeText(s,b.type,before,after)}\n현재 주민·행복·계절 기준 예상`;
}

export function fundingAdvice(s,price){
 if(s.money>=price)return '';
 const net=netIncome(metrics(s)),wait=net>0?realSeconds((price-s.money)/net*MONTH):null;
 const harvest=s.harvestAt!==null?`텃밭 돌보는 중 · 약 ${realSeconds(HARVEST_SECONDS-(s.t-s.harvestAt))}초 뒤 +${HARVEST}`:s.harvested.includes(month(s))?'텃밭 도움은 다음 달 다시 받아요.':`텃밭을 돌보면 +${HARVEST}을 보탤 수 있어요.`;
 return (s.paused?'일시정지 중에는 기금이 늘지 않아요.':wait===null?'기다리기만 해서는 모이지 않아요. 마을 현황에서 수입·유지비를 살펴요.':`현재 순수입이 유지되면 약 ${wait>=60?Math.ceil(wait/60)+'분':wait+'초'} 뒤 지을 수 있어요.`)+'\n'+harvest;
}

export const cozyDescription=type=>({"road": "마을 곳곳을 잇는 산책길", "house": "새 이웃을 맞이하는 작은 집", "snack": "이웃들이 함께 먹는 분식집", "apartment": "여러 이웃이 모여 사는 빌라", "western": "따뜻한 차양이 있는 양식집", "japanese": "골목에 어울리는 아담한 일식집", "chinese": "붉은 지붕이 돋보이는 중국집", "convenience": "가까이에서 장보는 작은 가게", "supermarket": "넓은 마을에 어울리는 큰 장보기 공간", "clinic": "이웃을 돌보는 작은 의원", "hospital": "마을의 든든한 병원", "kids": "아이들이 놀러 오는 키즈카페", "amusement": "마을을 활기차게 만드는 놀이동산", "school": "아이들이 함께 배우는 학교", "library": "책을 읽고 쉬어 가는 도서관", "fire": "마을을 지켜 주는 소방서", "drain": "빗물을 모으는 작은 시설", "workshop": "개울 건너 오래된 창고를 새롭게 꾸며요", "solar": "햇빛을 모으는 파란 지붕", "generator": "마을에 빛을 보내는 시설", "bridge": "개울 양쪽을 잇는 나무다리", "flower": "계절마다 피어나는 꽃밭", "avenue": "천천히 자라는 그늘나무", "tree": "집 곁을 초록빛으로 채우는 정원", "bench": "이웃들이 쉬어 가는 벤치"})[type]||"마을을 함께 꾸며요";

const effectLine=(income,happiness)=>`1분당 +${Math.round(income)}코인 · ${happiness>0?`행복 목표 +${Math.round(happiness)}`:'행복 목표 +0'}`;
export function cozyEffectText(type,target){const effect=COZY_EFFECTS[type];return effectLine(effect.income,Math.min(effect.happiness,100-target))+(target>=100?' (최대 100)':'');}
export function cozyPlacementText(s,type,x,y,moving=null){
 if(moving)return '옮겨도 수입과 행복 효과는 그대로예요.';
 const {before,after}=incomePreview(s,type,x,y);
 return '완공 후 · '+effectLine(incomePerMinute(after)-incomePerMinute(before),after.targetSat-before.targetSat)+(before.targetSat>=100?' (최대 100)':'');
}
