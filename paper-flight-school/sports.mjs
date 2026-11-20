import {cleanDesign,cleanLaunch,cleanEnv,PRESETS,simulate,PHYSICS_VERSION} from './physics.mjs?v=20261120-quality6-2';
import {COURSES,courseById,courseEnv,nextCourse,flightName} from './tournament.mjs?v=20261120-quality6-2';
export {COURSES,courseById,courseEnv,nextCourse,flightName};
export const EVENTS={distance:{name:'멀리 날기',unit:'m',description:'출발점에서 착륙점까지, 더 멀리!'},airtime:{name:'오래 날기',unit:'초',description:'처음 땅에 닿을 때까지, 더 오래!'}};
export const RULESET='sports-2-rigid-paper';
const OLD_RULESET='sports-1-physics-737cc14c';
export const eventInfo=id=>EVENTS[id]??EVENTS.distance;
export const formatScore=(value,event)=>(value/100).toFixed(2)+' '+eventInfo(event).unit;
export function flightScore(f,event){if(!Object.hasOwn(EVENTS,event)||f.reason!=='landed'||!f.landing)return null;const n=event==='airtime'?f.duration:f.distance;return Number.isFinite(n)&&n>=0&&n<10000?Math.round(n*100):null;}
export const emptySports=()=>({ruleset:RULESET,event:'distance',current:null,runs:{},completed:[],best:{},practice:{}});
export const courseKey=(t,id=t.current)=>t.event+'-'+id;
export const currentRun=t=>t.current?t.runs[courseKey(t)]??null:null;
export const bestScore=r=>r?.records.length?Math.max(...r.records.map(x=>x.score)):0;
export const qualified=(t,id)=>{const c=courseById(id),key=courseKey(t,id);return !!c&&t.completed.includes(key)&&(t.best[key]??-1)>=winningScore(c,t.event);};
export const unlocked=(t,id)=>{const i=COURSES.findIndex(c=>c.id===id);return i>=0&&COURSES.slice(0,i).every(c=>qualified(t,c.id));};
export function selectEvent(t,event){if(!Object.hasOwn(EVENTS,event))return false;if(event!==t.event){t.event=event;t.current=null;}return true;}
export function startTournament(t,id,runId){
 if(!courseById(id)||!unlocked(t,id)||typeof runId!=='string'||!/^[\w-]{1,80}$/.test(runId))return false;
 const key=courseKey(t,id),old=t.runs[key];if(!old||old.records.length===3)t.runs[key]={id:runId,records:[],pending:false,previous:old?.records.at(-1)??old?.previous??null};t.current=id;return true;
}
export function commitFlight(t,attemptId,f){
 const c=courseById(t.current),r=currentRun(t),score=flightScore(f,t.event);
 if(!c||!unlocked(t,c.id)||!r||r.pending||r.records.length>=3||attemptId!==r.id+'-'+(r.records.length+1)||score===null||f.physics!==PHYSICS_VERSION||f.launch.method!=='gauge'||JSON.stringify(cleanEnv(f.env))!==JSON.stringify(courseEnv(c)))return false;
 r.records.push({id:attemptId,score,design:cleanDesign(f.design),launch:cleanLaunch(f.launch)});r.pending=true;
 if(r.records.length===3){const key=courseKey(t);if(!t.completed.includes(key))t.completed.push(key);t.best[key]=Math.max(t.best[key]??0,bestScore(r));}return true;
}
function record(raw){if(!raw||typeof raw.id!=='string'||!/^[\w-]{1,90}$/.test(raw.id)||!Number.isInteger(raw.score)||raw.score<0||raw.score>=1000000||raw.launch?.method!=='gauge')throw Error('종목 기록 형식을 확인할 수 없어요.');return {id:raw.id,score:raw.score,design:cleanDesign(raw.design),launch:cleanLaunch(raw.launch)};}
export function cleanSports(raw){
 if(raw?.ruleset===OLD_RULESET){const archive=cleanSports({...raw,ruleset:RULESET,archive:null}),fresh=emptySports();archive.ruleset=OLD_RULESET;fresh.event=archive.event;fresh.completed=[...archive.completed];fresh.archive=archive;return fresh;}
 if(raw==null)return emptySports();if(raw.ruleset!==RULESET||!Object.hasOwn(EVENTS,raw.event)||!raw.runs||typeof raw.runs!=='object'||!Array.isArray(raw.completed))throw Error('종목 저장 형식을 확인할 수 없어요.');
 const t=emptySports();t.event=raw.event;
 for(const event of Object.keys(EVENTS)){
  for(const c of COURSES){const key=event+'-'+c.id,r=raw.runs[key];if(r){if(typeof r.id!=='string'||!/^[\w-]{1,80}$/.test(r.id)||!Array.isArray(r.records)||r.records.length>3)throw Error('종목 진행을 읽을 수 없어요.');const records=r.records.map((x,i)=>{const v=record(x);if(v.id!==r.id+'-'+(i+1))throw Error('시도 번호가 달라요.');return v;});t.runs[key]={id:r.id,records,pending:r.pending===true&&records.length>0,previous:r.previous?record(r.previous):null};}if(raw.completed.includes(key))t.completed.push(key);const best=raw.best?.[key];if(Number.isInteger(best)&&best>=0&&best<1000000)t.best[key]=best;}
  const p=raw.practice?.[event];if(p)t.practice[event]={...record(p),env:cleanEnv(p.env)};
 }
 if(raw.archive){if(raw.archive.ruleset!==OLD_RULESET||raw.archive.archive)throw Error('이전 기록 형식이 달라요.');t.archive={...cleanSports({...raw.archive,ruleset:RULESET,archive:null}),ruleset:OLD_RULESET};}
 if(courseById(raw.current)&&t.runs[courseKey(t,raw.current)]&&unlocked(t,raw.current))t.current=raw.current;return t;
}
const opponents=new Map();
function rivals(c,event){
 const key=event+'-'+c.id;
 if(!opponents.has(key)){const level=COURSES.indexOf(c),profiles=[['하늘',52,12,'balanced'],['나래',64,20,'glider'],['솔',76,28,'dart'],['루나',87,32,'balanced'],['리오',93,36,'glider']].slice(0,level===2?5:3);opponents.set(key,profiles.map(([name,power,pitch,type])=>{const scores=[-7,0,6].map(delta=>flightScore(simulate({...PRESETS[type],type},cleanLaunch({power:Math.min(100,power+delta+level*2),pitch,yaw:0}),courseEnv(c)),event));if(scores.includes(null))throw Error('가상 선수 계산 실패');return {name,virtual:true,total:Math.max(...scores)};}));}
 return opponents.get(key);
}
export const winningScore=(c,event)=>Math.max(...rivals(c,event).map(r=>r.total));
export function standings(c,run,event){
 if(run.records.length!==3)return [];
 const rows=[{name:'나',virtual:false,total:bestScore(run)},...rivals(c,event)].sort((a,b)=>b.total-a.total);return rows.map(r=>({...r,rank:1+rows.filter(x=>x.total>r.total).length}));
}
