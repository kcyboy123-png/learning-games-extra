(function(root){
  'use strict';
  const costs={wrong:10,hints:3,solutions:10};
  const count=v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,1000000):0;
  const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?v:null;
  const score=r=>Math.max(0,100-count(r.wrong)*10-count(r.hints)*3-count(r.solutions)*10);
  function snapshot(s){
    if(!s||!Array.isArray(s.answers)||s.answers.length>30)return null;
    return {index:Math.min(count(s.index),s.answers.length-1),seconds:Number.isFinite(s.seconds)?Math.max(0,Math.min(s.seconds,864000)):0,answers:s.answers.map(a=>{
      const b={};if(!a||typeof a!=='object')return b;
      for(const k of ['cross','order','selected','checks','slots','found'])if(Array.isArray(a[k]))b[k]=a[k].slice(0,100).map(x=>Number.isFinite(x)?x:null);
      if(Array.isArray(a.values))b.values=a.values.slice(0,20).map(x=>typeof x==='string'?x.slice(0,10000):'');
      if(Array.isArray(a.commands))b.commands=a.commands.slice(0,100).filter(x=>['U','D','L','R'].includes(x));
      for(const k of ['crossIndex','choice','rotation','commandIndex','robotIndex'])b[k]=a[k]===null?null:count(a[k]);
      b.hint=Math.min(count(a.hint),2);b.piece=['A','B','C','D'].includes(a.piece)?a.piece:'A';
      for(const k of ['ran','solutionUsed','passed'])b[k]=Boolean(a[k]);
      b.running=false;b.placements={};for(const k of ['A','B','C','D']){const p=a.placements?.[k];if(p&&[p.x,p.y,p.r].every(Number.isInteger))b.placements[k]={x:p.x,y:p.y,r:p.r};}
      return b;
    })};
  }
  function summary(r){if(!r||!count(r.number)||!date(r.startedAt))return null;const s={number:count(r.number),startedAt:date(r.startedAt),endedAt:date(r.endedAt),status:['complete','stopped','failed'].includes(r.status)?r.status:'active',wrong:count(r.wrong),hints:count(r.hints),solutions:count(r.solutions)};s.rules=r.rules===2?2:1;s.score=s.rules===2?null:score(s);return s;}
  const empty=legacyCount=>({attempts:0,legacyCount:count(legacyCount),first:null,firstCompleted:null,best:null,latest:null,recent:[],active:null,retryAt:0});
  function clean(raw){if(!raw||typeof raw!=='object')return null;const s=empty(raw.legacyCount);s.attempts=count(raw.attempts);s.retryAt=Number.isFinite(raw.retryAt)?Math.max(0,raw.retryAt):0;for(const k of ['first','firstCompleted','best','latest'])s[k]=summary(raw[k]);s.recent=Array.isArray(raw.recent)?raw.recent.map(summary).filter(Boolean).slice(-20):[];
    const a=summary(raw.active);if(a&&typeof raw.active.token==='string'&&raw.active.token.length<=100){a.status='active';a.token=raw.active.token;a.seen={};for(const [k,v]of Object.entries(raw.active.seen||{}).slice(0,8192))if(v===true&&k.length<=3000)Object.defineProperty(a.seen,k,{value:true,enumerable:true,writable:true,configurable:true});a.snapshot=snapshot(raw.active.snapshot);s.active=a;}
    s.attempts=Math.max(s.attempts,...[s.first,s.firstCompleted,s.best,s.latest,s.active,...s.recent].filter(Boolean).map(x=>x.number));return s;
  }
  function first(s,r){if(!s.first||s.first.number===r.number)s.first=summary(r);}
  function begin(raw,legacyCount,{token,at}){
    const s=clean(raw)||empty(legacyCount);
    if(s.retryAt>Date.parse(at))return {study:s,ok:false,reason:'cooldown'};
    if(s.active){if(s.active.rules!==2){s.active.rules=2;s.active.wrong=0;s.active.score=null;s.active.seen={};}return {study:s,run:s.active};}
    s.retryAt=0;s.attempts++;s.active={number:s.attempts,token,startedAt:at,endedAt:null,status:'active',rules:2,wrong:0,hints:0,solutions:0,score:null,seen:{},snapshot:null};first(s,s.active);return {study:s,run:s.active};
  }
  function charge(raw,token,kind,key){
    const s=clean(raw),r=s?.active;if(!r||r.token!==token||!Object.hasOwn(costs,kind))return {study:s,ok:false,changed:false};
    const id=kind+':'+key;if(Object.hasOwn(r.seen,id))return {study:s,ok:true,changed:false,run:r};
    r.seen[id]=true;r[kind]++;r.score=r.rules===2?null:score(r);first(s,r);
    if(r.rules===2&&r.wrong>=3){const failed={...summary(r),status:'failed',endedAt:new Date().toISOString()};first(s,failed);s.recent=[...s.recent,failed].slice(-20);s.active=null;s.retryAt=Date.now()+600000;return {study:s,ok:true,changed:true,run:failed,failed:true};}
    return {study:s,ok:true,changed:true,run:r};
  }
  function checkpoint(raw,token,snap){const s=clean(raw),r=s?.active;if(!r||r.token!==token)return {study:s,ok:false};r.snapshot=snapshot(snap);return {study:s,run:r,ok:true};}
  function finish(raw,token,at){const s=clean(raw),a=s?.active;if(!a||a.token!==token)return {study:s,ok:false};const r={...summary(a),status:'complete',endedAt:at};first(s,r);s.firstCompleted||=r;if(!s.best||s.best.score<r.score)s.best=r;s.latest=r;s.recent=[...s.recent,r].slice(-20);s.active=null;return {study:s,run:r,ok:true};}
  const X=root.DrawerExplore||(typeof require==='function'?require('./explore.js'):null);
  function ready(q,a){if(X&&X.is(q))return X.ready(q,a);switch(q.type){case 'choice':return a.choice!==null;case 'multi':case 'grid':return a.selected.length>0;case 'numbers':return a.values.length===q.fields.length&&a.values.every(x=>x.trim()!==''&&Number.isFinite(Number(x)));case 'cards':return q.all?a.found.length>=q.answers.length:a.slots.every(x=>x!==null);case 'shape':return Object.keys(a.placements).length===4;case 'robot':return a.ran;case 'order':return a.order.length===q.items.length;case 'crossword':return a.cross.every(x=>x!==null);default:return false;}}
  function fingerprint(q,a,collect=false){if(X&&X.is(q))return JSON.stringify(X.fingerprint(q,a,collect));let v;if(collect)v=a.slots;else switch(q.type){case 'choice':v=a.choice;break;case 'multi':case 'grid':v=a.selected.slice().sort((x,y)=>x-y);break;case 'numbers':v=a.values.map(Number);if(q.unordered)v.sort((x,y)=>x-y);break;case 'cards':v=q.all?a.found.slice().sort((x,y)=>x-y):a.slots;break;case 'shape':v=['A','B','C','D'].map(k=>a.placements[k]?[k,a.placements[k].x,a.placements[k].y,a.placements[k].r]:[k]);break;case 'robot':v=a.commands;break;case 'order':v=a.order;break;case 'crossword':v=a.cross;break;default:v=null;}return JSON.stringify(v);}
  const api={costs,score,empty,clean,snapshot,summary,begin,charge,checkpoint,finish,ready,fingerprint};root.DrawerScoring=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
