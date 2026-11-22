import {weekendCareThrough} from './weekend-care.mjs?v=weekend-20261123';
export const HOUR=3600000;
export const CARE_RATE=Object.freeze({water:1.5,food:1.25,brush:.75});
export const CARE_KINDS=Object.keys(CARE_RATE);
const essential=['water','food'];
const sicknessDelay=18*HOUR, recoveryTime=6*HOUR, absenceLimit=168*HOUR;

export function startHealth(now,id){
 return {id,startedAt:now,wall:now,elapsed:0,paused:false,last:{water:0,food:0,brush:0},sickAt:null,recoverAt:null,endedAt:null,examinedAt:null,recoveredAt:null,recoverySeenAt:null};
}

export function validateHealth(raw){
 const time=(value,max=8640000000000000)=>Number.isFinite(value)&&value>=0&&value<=max;
 const mark=value=>value===null||time(value,raw.elapsed);
 if(!raw||!/^[a-zA-Z0-9-]{1,80}$/.test(typeof raw.id==='string'?raw.id:'')||!time(raw.wall)||!time(raw.elapsed)||raw.elapsed>raw.wall||typeof raw.paused!=='boolean'||!CARE_KINDS.every(kind=>time(raw.last?.[kind],raw.elapsed))||!mark(raw.sickAt)||!mark(raw.recoverAt)||!mark(raw.endedAt)||raw.recoverAt!==null&&(raw.sickAt===null||raw.recoverAt<raw.sickAt)||raw.endedAt!==null&&(raw.sickAt===null||raw.endedAt<raw.sickAt||raw.paused||raw.recoverAt!==null))throw Error('책임 돌봄 시간 기록을 확인해 주세요.');
 const startedAt=raw.startedAt??raw.wall-raw.elapsed;
 if(!time(startedAt,raw.wall))throw Error('책임 돌봄을 시작한 시각을 확인해 주세요.');
 const examinedAt=raw.examinedAt??null,recoveredAt=raw.recoveredAt??null,recoverySeenAt=raw.recoverySeenAt??null;
 if(![examinedAt,recoveredAt,recoverySeenAt].every(mark))throw Error('진찰과 회복 기록을 확인해 주세요.');
 return {id:raw.id,startedAt,wall:raw.wall,elapsed:raw.elapsed,paused:raw.paused,last:{water:raw.last.water,food:raw.last.food,brush:raw.last.brush},sickAt:raw.sickAt,recoverAt:raw.recoverAt,endedAt:raw.endedAt,examinedAt,recoveredAt,recoverySeenAt};
}

const valueAt=(last,kind,at)=>Math.max(0,Math.min(100,100-(at-last[kind])/HOUR*CARE_RATE[kind]));
export function healthView(saved,now,weekendCareAt=0){
 const wall=Math.max(saved.wall,now);
 const elapsed=saved.elapsed+(saved.paused||saved.endedAt!==null?0:wall-saved.wall);
 let {sickAt,recoverAt}=saved;
 let last=saved.last;
 const caredThrough=weekendCareThrough(weekendCareAt,wall);
 if(caredThrough>0&&caredThrough>=saved.wall&&!saved.paused&&saved.endedAt===null&&sickAt===null){
  const caredAt=saved.elapsed+caredThrough-saved.wall;
  last={water:caredAt,food:caredAt,brush:caredAt};
 }
 let recoveredAt=saved.recoveredAt??null;
 if(recoverAt!==null&&elapsed>=recoverAt+recoveryTime){
  const finish=recoverAt+recoveryTime;
  if(essential.every(kind=>valueAt(last,kind,finish)>=40)){sickAt=null;recoveredAt=finish;}
  recoverAt=null;
 }
 const values={water:valueAt(last,'water',elapsed),food:valueAt(last,'food',elapsed),brush:valueAt(last,'brush',elapsed)};
 if(recoverAt!==null&&(values.water<40||values.food<40))recoverAt=null;
 const onset=Math.ceil(Math.min(last.water+80/CARE_RATE.water*HOUR+sicknessDelay,last.food+80/CARE_RATE.food*HOUR+sicknessDelay));
 if(sickAt===null&&elapsed>=onset)sickAt=onset;
 const absent=elapsed-Math.max(last.water,last.food);
 const remaining=Math.max(0,absenceLimit-absent);
 const critical=sickAt!==null&&absent>=120*HOUR&&values.water===0&&values.food===0;
 const essentialIssue=values.water<=values.food?'water':'food';
 const issue=values[essentialIssue]<=values.brush?essentialIssue:'brush';
 const state={...saved,wall,elapsed,last,sickAt,recoverAt,recoveredAt};
 const phase=saved.endedAt!==null?'memorial':critical&&remaining===0?'clock':saved.paused?'paused':critical?'critical':recoverAt!==null?'recovery':sickAt!==null?'sick':values[issue]<=30?'warning':'well';
 return {state,values,phase,issue,remaining,progress:recoverAt===null?0:Math.min(1,(elapsed-recoverAt)/recoveryTime),recoveryRemaining:recoverAt===null?0:Math.max(0,recoverAt+recoveryTime-elapsed)};
}

export function healthCare(saved,kind,now,weekendCareAt=0){
 const view=healthView(saved,now,weekendCareAt);
 if(!CARE_KINDS.includes(kind)||['clock','memorial','paused'].includes(view.phase))return saved;
 return {...view.state,last:{...view.state.last,[kind]:view.state.elapsed}};
}

export function nextTreatment(values){
 return CARE_KINDS.find(kind=>values[kind]<(kind==='brush'?40:60))??null;
}

export function changeHealth(saved,command,now,weekendCareAt=0){
 const view=healthView(saved,now,weekendCareAt),{state,phase}=view;
 if(command==='pause'&&!['clock','memorial','paused'].includes(phase))return {...state,paused:true};
 if(command==='resume'&&phase==='paused')return {...state,paused:false};
 if(command==='exam'&&phase==='sick')return {...state,examinedAt:state.sickAt};
 if(command==='seenRecovery'&&['well','warning'].includes(phase)&&state.recoveredAt!=null)return {...state,recoverySeenAt:state.recoveredAt};
 if(command==='recover'&&['sick','critical'].includes(phase)&&!nextTreatment(view.values))return {...state,recoverAt:state.elapsed};
 if(command==='remember'&&phase==='clock'){
  const endedAt=Math.max(state.last.water,state.last.food)+absenceLimit;
  return {...state,paused:false,recoverAt:null,endedAt};
 }
 return saved;
}

export function healthBlocksPlay(phase){return ['sick','critical','recovery','paused','clock','memorial'].includes(phase);}
