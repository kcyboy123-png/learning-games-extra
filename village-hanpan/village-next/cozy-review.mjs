import {MONTH,TIERS} from './data.mjs?v=perf1';

// New towns opt in. Previous scores and towns without this record are never backfilled.
export function startCozyReview(s){if(s.t===0&&!s.result&&!s.hist.length&&!s.cozyReview)s.cozyReview={v:1,months:[],seen:0};return s;}
export const reviewScore=(growth,environment,happiness,welfare)=>Math.round(growth*(.5+.2*environment/100+.2*happiness/100+.1*welfare/100));
export function reviewSnapshot(s,v){
 const environment=v.environment,happiness=Math.round(s.sat*100)/100,welfare=Math.round(v.welfare*100)/100;
 return {growth:v.score,environment,happiness,welfare,score:reviewScore(v.score,environment,happiness,welfare)};
}
export function recordCozyMonth(s,v){
 if(!s.cozyReview||s.t>36*MONTH)return;
 const month=s.t/MONTH;if(Number.isInteger(month)&&month===s.cozyReview.months.length+1)s.cozyReview.months.push({month,...reviewSnapshot(s,v)});
}
function grade(rows,year){
 const last=rows.at(-1),average=rows.reduce((n,r)=>n+r.score,0)/rows.length,total=Math.round(last.score*.7+average*.3),t=TIERS.find(t=>total>=t[0])||TIERS.at(-1);
 return {year,total,tier:t[1],title:t[2],average:Math.round(average),endScore:last.score,environment:last.environment,happiness:last.happiness,welfare:last.welfare,growth:last.growth};
}
export function cozyReviews(s){
 const rows=s.cozyReview?.months||[],years=[];
 for(let year=1;year<=Math.min(3,Math.floor(rows.length/12));year++)years.push(grade(rows.slice((year-1)*12,year*12),year));
 return {years,final:rows.length===36?years[2]:null};
}
export function validateCozyReview(s){
 const r=s.cozyReview;if(r===undefined)return;
 const number=(n,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=max;
 if(s.cozyV!==1||s.result||s.hist.length||r?.v!==1||!Array.isArray(r.months)||r.months.length!==Math.min(36,Math.floor(s.t/MONTH))||!Number.isInteger(r.seen)||r.seen<0||r.seen>Math.floor(r.months.length/12))throw Error('3년 성장 기록을 확인해 주세요.');
 for(let i=0;i<r.months.length;i++){
  const h=r.months[i];if(!h||h.month!==i+1||!Number.isInteger(h.growth)||!number(h.growth,1000)||!Number.isInteger(h.environment)||!number(h.environment,100)||!number(h.happiness,100)||!number(h.welfare,100)||h.score!==reviewScore(h.growth,h.environment,h.happiness,h.welfare))throw Error('월별 성장 점수를 확인해 주세요.');
 }
}
