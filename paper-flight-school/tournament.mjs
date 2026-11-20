import {cleanDesign,cleanLaunch,cleanEnv,PRESETS,simulate} from './physics-v1.mjs?v=20261120-quality6';

export const RULESET='cup-1-physics-737cc14c';
export const COURSES=[
 {id:'school',name:'우리 학교 컵',short:'학교 컵',venue:'school',target:7,windSpeed:0,windDirection:90,seed:2147,story:'친구들 앞에서 나의 첫 기록을 만들어요.',invitation:'도시 대표 선발전에 초대됐어요!',recommended:'glider'},
 {id:'city',name:'도시 대표 선발전',short:'도시 선발전',venue:'city',target:10,windSpeed:.5,windDirection:90,seed:2147,story:'오른쪽으로 부는 바람에 도전해요.',invitation:'세계대회 초대장이 도착했어요!',recommended:'balanced'},
 {id:'world',name:'세계 종이비행기 대회',short:'세계대회',venue:'world',target:11,windSpeed:1,windDirection:-90,seed:2147,story:'큰 무대에서도, 내 손으로 날려요.',invitation:'세 무대를 모두 날았어요!',recommended:'balanced'}
];
export const courseById=id=>COURSES.find(c=>c.id===id)??null;
export const courseEnv=c=>cleanEnv({...c,gust:false});
export const emptyTournaments=()=>({ruleset:RULESET,current:null,runs:{},completed:[],best:{}});
export const unlocked=(t,id)=>{const i=COURSES.findIndex(c=>c.id===id);return i>=0&&(i===0||t.completed.includes(COURSES[i-1].id));};
export const currentRun=t=>t.current?t.runs[t.current]??null:null;
export const totalCm=run=>run.records.reduce((sum,r)=>sum+r.cm,0);
export const nextCourse=c=>COURSES[COURSES.indexOf(c)+1]??null;
export const flightName=n=>['첫 번째','두 번째','세 번째'][Math.min(2,Math.max(0,n))]+' 비행';
export function startTournament(t,id,runId){
 if(!courseById(id)||!unlocked(t,id))return false;
 if(!t.runs[id]||t.runs[id].records.length===3){
  if(typeof runId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(runId))return false;
  const previous=t.runs[id]?.records.at(-1)??t.runs[id]?.previous??null;
  t.runs[id]={id:runId,records:[],pending:false,previous};
 }
 t.current=id;return true;
}
export function commitFlight(t,attemptId,f){
 const c=courseById(t.current),run=currentRun(t);
 if(!c||!run||run.pending||run.records.length>=3||attemptId!==`${run.id}-${run.records.length+1}`||f.reason!=='landed'||!Number.isFinite(f.targetDistance)||f.targetDistance<0||f.targetDistance>10000||f.launch.method!=='gauge'||JSON.stringify(cleanEnv(f.env))!==JSON.stringify(courseEnv(c)))return false;
 run.records.push({id:attemptId,cm:Math.round(f.targetDistance*100),design:cleanDesign(f.design),launch:cleanLaunch(f.launch)});run.pending=true;
 if(run.records.length===3){if(!t.completed.includes(c.id))t.completed.push(c.id);t.best[c.id]=Math.min(t.best[c.id]??Infinity,totalCm(run));}
 return true;
}
export function cleanTournaments(raw){
 if(raw==null)return emptyTournaments();
 if(raw.ruleset!==RULESET||!raw.runs||typeof raw.runs!=='object'||!Array.isArray(raw.completed))throw Error('대회 기록 형식을 확인할 수 없어요.');
 const t=emptyTournaments();
 for(const c of COURSES){
  const r=raw.runs[c.id];if(!r)continue;
  if(typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(r.id)||!Array.isArray(r.records)||r.records.length>3)throw Error('대회 진행을 읽을 수 없어요.');
  const records=r.records.map((x,i)=>{
   if(x.id!==`${r.id}-${i+1}`||!Number.isInteger(x.cm)||x.cm<0||x.cm>1000000||x.launch?.method!=='gauge')throw Error('대회 비행 기록이 올바르지 않아요.');
   return {id:x.id,cm:x.cm,design:cleanDesign(x.design),launch:cleanLaunch(x.launch)};
  });
  let previous=null;
  if(r.previous){const p=r.previous;if(!Number.isInteger(p.cm)||p.cm<0||p.cm>1000000||p.launch?.method!=='gauge'||typeof p.id!=='string'||!/^[a-zA-Z0-9_-]{1,90}$/.test(p.id))throw Error('이전 비행 메모를 읽을 수 없어요.');previous={id:p.id,cm:p.cm,design:cleanDesign(p.design),launch:cleanLaunch(p.launch)};}
  t.runs[c.id]={id:r.id,records,pending:r.pending===true&&records.length>0,previous};
 }
 t.completed=COURSES.filter(c=>raw.completed.includes(c.id)).map(c=>c.id);
 for(const c of COURSES){const best=raw.best?.[c.id];if(Number.isInteger(best)&&best>=0&&best<=3000000)t.best[c.id]=best;}
 if(courseById(raw.current)&&t.runs[raw.current]&&unlocked(t,raw.current))t.current=raw.current;
 return t;
}
const opponents=new Map();
export function virtualOpponents(c){
 if(opponents.has(c.id))return opponents.get(c.id);
 const profiles=c.id==='school'?[['하늘',36,47,62],['나래',28,54,78],['솔',51,67,85]]:c.id==='city'?[['나래',58,70,89],['리오',41,68,94],['루나',66,79,87]]:[['리오',58,70,88],['루나',82,94,79],['테오',44,69,96],['하나',78,88,95],['노아',70,84,97]];
 const result=profiles.map(([name,...powers])=>{const design=cleanDesign({type:c.recommended,...PRESETS[c.recommended]});const records=powers.map(power=>{const launch=cleanLaunch({power,pitch:12,yaw:0,method:'gauge'}),f=simulate(design,launch,courseEnv(c));if(f.reason!=='landed')throw Error('가상 비행 계산 실패');return {cm:Math.round(f.targetDistance*100),design,launch};});return {name,virtual:true,records,total:records.reduce((sum,r)=>sum+r.cm,0)};});
 opponents.set(c.id,result);return result;
}
export function standings(c,run){
 if(run.records.length!==3)return [];
 const rows=[{name:'나',virtual:false,records:run.records,total:totalCm(run)},...virtualOpponents(c)].sort((a,b)=>a.total-b.total);
 return rows.map(row=>({...row,rank:1+rows.filter(other=>other.total<row.total).length}));
}
