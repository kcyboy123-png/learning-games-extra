(function(root){
  'use strict';
  const G=root.DrawerScoring||(typeof require==='function'?require('./scoring.js'):null);
  const key=root.ThinkstarKey?.('thinkstar-passes-v1')||'thinkstar-passes-v1',legacyKey=root.ThinkstarKey?.('thinkstar-history-v1')||'thinkstar-history-v1';
  const date=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))?v:null;
  const count=v=>Number.isSafeInteger(v)&&v>0?Math.min(v,1000000):0;
  function clean(raw,ids){
    const result={version:1,missions:{}};
    if(!raw||raw.version!==1||!raw.missions||typeof raw.missions!=='object')return result;
    for(const id of ids){const r=raw.missions[id];if(!r)continue;const study=G.clean(r.study);if(!count(r.count)&&!study?.attempts)continue;result.missions[id]={count:count(r.count),firstAt:date(r.firstAt),lastAt:date(r.lastAt),helpedCount:Math.min(count(r.helpedCount),count(r.count)),selfChecked:Boolean(r.selfChecked)};if(study)result.missions[id].study=study;}
    return result;
  }
  function load(storage,ids){
    let state={version:1,missions:{}};
    try{
      const current=storage.getItem(key);
      if(current!==null){try{state=clean(JSON.parse(current),ids);}catch{}return {state,available:true};}
      let old=[];try{old=JSON.parse(storage.getItem(legacyKey)||'[]');}catch{}
      if(Array.isArray(old))for(const r of old){if(!r||!ids.includes(r.id)||!Number.isFinite(r.seconds)||r.seconds<0)continue;const prev=state.missions[r.id];state.missions[r.id]={count:(prev?.count||0)+1,firstAt:null,lastAt:null,helpedCount:0,selfChecked:false};}
      storage.setItem(key,JSON.stringify(state));return {state,available:true};
    }catch{return {state,available:false};}
  }
  function complete(state,id,info,ids){
    const next=clean(state,ids);if(!ids.includes(id))return next;
    const previous=next.missions[id],now=date(info.at)||new Date().toISOString();
    next.missions[id]={count:Math.min((previous?.count||0)+1,1000000),firstAt:previous?.count?previous.firstAt:now,lastAt:now,helpedCount:Math.min((previous?.helpedCount||0)+(info.helped?1:0),1000000),selfChecked:Boolean(previous?.selfChecked||info.selfChecked)};if(previous?.study)next.missions[id].study=previous.study;return next;
  }
  function transition(state,id,ids,fn){const next=clean(state,ids);if(!ids.includes(id))return {state:next,ok:false};const r=next.missions[id]||{count:0,firstAt:null,lastAt:null,helpedCount:0,selfChecked:false},result=fn(r);if(result.ok===false)return {state:next,...result};r.study=result.study;next.missions[id]=r;return {...result,state:next,ok:true};}
  const begin=(state,id,info,ids)=>transition(state,id,ids,r=>G.begin(r.study,r.count,info));
  const charge=(state,id,token,kind,key,ids)=>transition(state,id,ids,r=>G.charge(r.study,token,kind,key));
  const checkpoint=(state,id,token,snap,ids)=>transition(state,id,ids,r=>G.checkpoint(r.study,token,snap));
  function finish(state,id,token,info,ids){const result=transition(state,id,ids,r=>G.finish(r.study,token,info.at));if(result.ok)result.state=complete(result.state,id,info,ids);return result;}
  function save(storage,state){try{storage.setItem(key,JSON.stringify(state));return true;}catch{return false;}}
  function erase(storage){const state={version:1,missions:{}};try{storage.removeItem(legacyKey);storage.setItem(key,JSON.stringify(state));return {state,available:true};}catch{return {state,available:false};}}
  const api={key,load,clean,complete,save,erase,begin,charge,checkpoint,finish};root.DrawerProgress=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
