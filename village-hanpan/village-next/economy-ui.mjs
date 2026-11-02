import {buildingSpec,metrics,TYPES,MONTH,month,monthLabel,demandMonth,connected,unlocked} from './core.mjs?v=ui3';
import {PLAY_SPEED} from './data.mjs?v=80min1';

// nextId never decreases, so cancelling or reloading cannot restart completed guidance.
export const guidedPlacement=s=>s.mode==='run'&&!s.ended&&month(s)<4&&s.nextId-1-s.buildings.filter(b=>b.starter).length<2;
export const netIncome=v=>v.income-v.upkeep;
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
