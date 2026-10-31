import {metrics,TYPES,MONTH,month,monthLabel,demandMonth,connected,unlocked} from './core.mjs?v=growth4';
import {PLAY_SPEED} from './data.mjs?v=80min1';

export const netIncome=v=>v.income-v.upkeep;
export const incomeRate=v=>`${netIncome(v)<0?'−':'+'}${(Math.abs(netIncome(v))*PLAY_SPEED/MONTH).toFixed(1)}/초`;

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
 const before=metrics(s),buildings=moving?s.buildings.map(b=>b.id===moving?{...b,x,y}:b):[...s.buildings,{id:s.nextId,type,x,y,progress:1,opts:[]}];
 const next={...s,buildings},after=metrics(next),building=buildings.find(b=>b.id===(moving||s.nextId));
 const filled=TYPES[type].cap&&!moving&&connected(next,building)?metrics({...next,pop:Math.max(s.pop,after.housing)}):null;
 const future=['health','education','leisure'].filter(k=>TYPES[type][k]&&demandMonth(s,k)>month(s));
 const evalMonth=future.length?Math.min(...future.map(k=>demandMonth(s,k))):null;
 const later=evalMonth===null?null:{month:evalMonth,before:metrics({...s,t:evalMonth*MONTH}),after:metrics({...next,t:evalMonth*MONTH})};
 return {before,after,filled,later};
}

export function incomePreviewText(s,type,x,y,moving=null){
 const {before,after,filled,later}=incomePreview(s,type,x,y,moving);
 const line=`순수입 ${incomeRate(before)} → 완공 직후 ${incomeRate(after)}`;
 const service=['health','education','leisure'].some(k=>TYPES[type][k]);
 const benefit=service?`\n${later?monthLabel(s,later.month)+' 생활 평가 시작 때':'현재 생활 평가'} · 행복 목표 ${Math.round((later?.before||before).targetSat)} → ${Math.round((later?.after||after).targetSat)} (${later?'그 달 계절과 ':'현재 '}주민·시설 기준 예상)`:'';
 const extra=later&&TYPES[type].education&&TYPES[type].leisure&&demandMonth(s,'leisure')>later.month?` · 여가 평가는 ${monthLabel(s,demandMonth(s,'leisure'))}부터`:'';
 return line+(filled?` · 모두 입주하면 ${incomeRate(filled)} (행복·식생활·전력도 챙겨요)`:'')+' · 현재 행복·계절 기준 예상'+benefit+extra;
}
