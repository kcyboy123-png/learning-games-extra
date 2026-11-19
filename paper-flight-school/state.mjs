import {cleanSports} from './sports.mjs';
import {cleanDesign,cleanLaunch,cleanEnv} from './physics.mjs';
import {cleanMissions,missionById} from './gameplay.mjs';
import {cleanTournaments,courseById} from './tournament.mjs';
export const ORDER=[0,1,1,0,0,1];
export const KEY='changyong-paper-flight-v1';
export function newMatch(design,env,method='gauge') {return {env:cleanEnv(env),method:method==='fixed'?'fixed':'gauge',designs:[cleanDesign(design),cleanDesign(design)],launches:[cleanLaunch({method}),cleanLaunch({method})],records:[],pending:false};}
export function currentTurn(match){return {player:ORDER[match.records.length]??null,round:Math.floor(match.records.length/2)+1};}
export function matchEnvironment(match,roundIndex=Math.floor(match.records.length/2)){return cleanEnv({...match.env,seed:(match.env.seed-1+roundIndex*137)%2147483646+1});}
export function recordFlight(match,f){
  if(match.pending||match.records.length>=6||f.reason!=='landed'||!Number.isFinite(f.targetDistance)||f.targetDistance<0)return false;
  const expected=matchEnvironment(match);
  if(JSON.stringify(cleanEnv(f.env))!==JSON.stringify(expected)||f.launch.method!==match.method)return false;
  const turn=currentTurn(match);match.records.push({player:turn.player,round:turn.round,cm:Math.round(f.targetDistance*100),design:cleanDesign(f.design),launch:cleanLaunch(f.launch)});match.pending=true;return true;
}
export function totals(match){return [0,1].map(p=>match.records.filter(r=>r.player===p).reduce((s,r)=>s+r.cm,0));}
export function validateSave(raw){
  if(!raw||raw.version!==1)throw Error('저장 버전을 확인할 수 없어요.');
  const out={version:1,design:cleanDesign(raw.design),launch:cleanLaunch(raw.launch),env:cleanEnv(raw.env),last:null,match:null,missions:cleanMissions(raw.missions),tournaments:cleanTournaments(raw.tournaments),sports:cleanSports(raw.sports)};
  if(raw.last&&typeof raw.last==='object')out.last={design:cleanDesign(raw.last.design),launch:cleanLaunch(raw.last.launch),env:cleanEnv(raw.last.env),mission:missionById(raw.last.mission)?.id??null,course:courseById(raw.last.course)?.id??null};
  if(raw.match){
    const m=raw.match;if(!Array.isArray(m.records)||m.records.length>6||!Array.isArray(m.designs)||m.designs.length!==2||!Array.isArray(m.launches)||m.launches.length!==2)throw Error('대결 저장 형식이 달라요.');
    const records=m.records.map((r,i)=>{if(r.player!==ORDER[i]||r.round!==Math.floor(i/2)+1||!Number.isInteger(r.cm)||r.cm<0||r.cm>1000000)throw Error('대결 기록을 읽을 수 없어요.');return {...r,design:cleanDesign(r.design),launch:cleanLaunch(r.launch)};});
    out.match={env:cleanEnv(m.env),method:m.method==='fixed'?'fixed':'gauge',designs:m.designs.map(cleanDesign),launches:m.launches.map(cleanLaunch),records,pending:m.pending===true&&records.length>0};
  }return out;
}
export function load(storage){try{const value=storage.getItem(KEY);return {data:value?validateSave(JSON.parse(value)):null,error:null};}catch(e){return {data:null,error:'저장된 기록을 불러오지 못했어요. 현재 기록은 덮어쓰지 않아요.'};}}
export function save(storage,data){try{storage.setItem(KEY,JSON.stringify(validateSave(data)));return true;}catch{return false;}}
