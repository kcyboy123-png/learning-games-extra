export const VERSION=1;
export const KEY='changyong-cloud-blocks-v1';
export const CHAPTERS=[{name:'햇살의 시작',start:0,end:4,base:30},{name:'숲의 수수께끼',start:5,end:9,base:120},{name:'별빛의 시련',start:10,end:13,base:240},{name:'왕성의 최종 관문',start:14,end:19,base:480}];
export const TOTAL_BASE=CHAPTERS.reduce((sum,c)=>sum+c.base,0);
export const TIER_RATIOS=[['레디언트',1],['불멸',1.25],['초월자',1.5],['다이아',11/6],['플래티넘',2.25],['골드',2.75],['실버',10/3],['브론즈',25/6]];
export const tierLimits=(base=TOTAL_BASE)=>TIER_RATIOS.map(([name,ratio])=>[name,Math.floor(base*ratio)]);
export const chapterTier=(seconds,index)=>tier(seconds,CHAPTERS[index].base);
export const runEnd=s=>s.mode==='chapter'?CHAPTERS[s.chapter].end:19;
export function views(h,n){return {top:h.map(v=>+(v>0)),front:Array.from({length:n},(_,x)=>Math.max(...h.filter((_,i)=>i%n===x))),side:Array.from({length:n},(_,r)=>Math.max(...h.slice(r*n,r*n+n))).reverse()};}
export const total=h=>h.reduce((a,b)=>a+b,0);
export const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
export const initial=q=>Array.from({length:q.size*q.size},(_,i)=>q.fixed?.[i]??q.prefill?.[i]??0);
export function check(q,h){
 if(!Array.isArray(h)||h.length!==q.size*q.size||!h.every(v=>Number.isInteger(v)&&v>=0&&v<=q.max))return {ok:false,message:'블록 높이를 확인해 주세요.'};
 if(q.fixed&&Object.entries(q.fixed).some(([i,v])=>h[i]!==v))return {ok:false,message:'자물쇠 기둥은 바꾸지 않아요.'};
 if(q.reference&&!same(h,q.reference))return {ok:false,message:'견본과 다른 칸이 있어요. 위 숫자도 살펴보세요.',bad:['reference']};
 const v=views(h,q.size),bad=['top','front','side'].filter(k=>!same(v[k],q[k]));
 if(bad.length)return {ok:false,message:'표시된 설계도를 다시 살펴보세요.',bad};
 if(q.balance){const a=total(h.filter((_,i)=>i%q.size<q.size/2)),b=total(h.filter((_,i)=>i%q.size>=q.size/2));if(a!==b)return {ok:false,message:'왼쪽 A 구역과 오른쪽 B 구역의 블록 수를 같게 해 주세요.',bad:['balance']};}
 const count=total(h);
 if(q.exact!=null&&count!==q.exact)return {ok:false,message:`모습은 맞아요! 블록을 ${q.exact}개로 맞춰 주세요.`,bad:['count']};
 if(q.goal==='min'&&count!==q.optimum)return {ok:false,message:'모습은 맞아요! 더 적은 블록으로 만들 수 있어요.',bad:['count']};
 if(q.goal==='max'&&count!==q.optimum)return {ok:false,message:'모습은 맞아요! 블록을 더 쌓을 수 있어요.',bad:['count']};
 return {ok:true,message:'설계도와 꼭 맞아요!'};
}
export function tier(seconds,base=TOTAL_BASE){for(const [name,limit] of tierLimits(base))if(seconds<=limit)return name;return '아이언';}
export const timeText=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
export function fresh(mode='practice',level=0){return {version:VERSION,mode,level,chapter:CHAPTERS.findIndex(c=>level>=c.start&&level<=c.end),chapterBest:[null,null,null,null],h:[],elapsed:0,started:null,penalty:0,wrong:[],first:null,assisted:false,won:false,finished:false,completed:[],best:null};}
export function restore(raw,levels){
 try{const s=JSON.parse(raw);if(s.version!==VERSION||!['practice','challenge','chapter'].includes(s.mode)||!Number.isInteger(s.level)||!levels[s.level])throw Error();
 if(s.mode==='chapter'&&(!Number.isInteger(s.chapter)||!CHAPTERS[s.chapter]||s.level<CHAPTERS[s.chapter].start||s.level>CHAPTERS[s.chapter].end))throw Error();
 s.chapter=CHAPTERS.findIndex(c=>s.level>=c.start&&s.level<=c.end);
 s.chapterBest=Array.from({length:4},(_,i)=>Number.isFinite(s.chapterBest?.[i])&&s.chapterBest[i]>=0?s.chapterBest[i]:null);
 const q=levels[s.level],valid=h=>Array.isArray(h)&&h.length===q.size*q.size&&h.every(v=>Number.isInteger(v)&&v>=0&&v<=q.max)&&Object.entries(q.fixed||{}).every(([i,v])=>h[i]===v);
 if(!valid(s.h)||!Number.isFinite(s.elapsed)||s.elapsed<0||!Number.isFinite(s.penalty)||s.penalty<0||!(s.started===null||(Number.isFinite(s.started)&&s.started>0))||!Array.isArray(s.wrong)||!s.wrong.every(v=>typeof v==='string')||!Array.isArray(s.completed)||!s.completed.every(i=>Number.isInteger(i)&&i>=0&&i<20)||typeof s.assisted!=='boolean'||typeof s.won!=='boolean'||typeof s.finished!=='boolean')throw Error();
 if(s.first&&(!valid(s.first)||!check(q,s.first).ok))throw Error();
 if(s.won&&(!check(q,s.h).ok||(q.two&&(!s.first||same(s.first,s.h)))))throw Error();
 if(s.finished&&(s.level!==runEnd(s)||!s.won))throw Error();
 if(s.best!==null&&(!Number.isFinite(s.best)||s.best<0))s.best=null;
 return s;
 }catch{return null;}
}
