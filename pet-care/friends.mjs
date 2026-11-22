import {KEY,validate} from './model.mjs?v=hospital-20261122';
import {PETS} from './pets.mjs';
const slot=id=>KEY+'-pet-'+id;
const archivePrefix=KEY+'-memory-';
export function validateFriend(raw){
 const variant=raw?.variant??'puppy';
 return validateFriends({format:'pet-friends',version:1,active:variant,pets:[{...raw,variant}]}).pets[0];
}
export function restoreFriend(storage,raw,current){
 const candidate=validateFriend(raw);
 return restoreFriends(storage,{format:'pet-friends',version:1,active:candidate.variant,pets:[candidate]},current,true);
}
export function completeWebp(url){
 if(typeof url!=='string'||!/^data:image\/webp;base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(url))return false;
 const base64=url.slice(url.indexOf(',')+1);
 try{
  const header=atob(base64.slice(0,16));
  const bytes=base64.length*3/4-(base64.endsWith('==')?2:base64.endsWith('=')?1:0);
  const declared=header.charCodeAt(4)+header.charCodeAt(5)*256+header.charCodeAt(6)*65536+header.charCodeAt(7)*16777216;
  return header.slice(0,4)==='RIFF'&&header.slice(8,12)==='WEBP'&&bytes>20&&declared+8===bytes;
 }catch{return false;}
}
function validateRecord(p){
 if(!PETS.some(x=>x.id===p?.variant))throw Error('친구 종류를 확인해 주세요.');
  const valid=validate(p);
  // Bulk restore must never silently drop photos or shorten memories.
  for(const [key,fields] of [['photos',['url','at']],['memories',['text','day','at']]]){
   const original=p[key]??[];
   if(!Array.isArray(original)||original.length!==valid[key].length||original.some((item,i)=>fields.some(field=>item?.[field]!==valid[key][i][field])))throw Error(p.name+'의 사진 또는 추억 일부를 읽을 수 없어요. 원본 파일을 보관하고 확인해 주세요.');
  }
  if(valid.photos.some(photo=>!completeWebp(photo.url)))throw Error(p.name+'의 사진 파일이 잘렸거나 형식이 맞지 않아요. 원본 백업을 확인해 주세요.');

 return valid;
}
export function validateFriends(raw){
 if(raw?.format!=='pet-friends'||![1,2].includes(raw.version)||!Array.isArray(raw.pets)||!raw.pets.length||raw.pets.length>9)throw Error('전체 친구 기록 파일을 확인해 주세요.');
 const seen=new Set();
 const pets=raw.pets.map(p=>{
  const record=validateRecord(p);
  if(seen.has(record.variant))throw Error('친구 종류가 중복됐어요.');
  seen.add(record.variant);
  return record;
 });
 if(!seen.has(raw.active))throw Error('현재 친구 기록이 없어요.');
 const result={format:'pet-friends',version:raw.version,active:raw.active,pets};
 if(raw.version===2){
  if(!Array.isArray(raw.archives))throw Error('추억 앨범 목록을 확인해 주세요.');
  const ids=new Set();
  result.archives=raw.archives.map(p=>{
   const record=validateRecord(p);
   if(record.health?.endedAt==null||ids.has(record.health.id))throw Error('추억 앨범 기록을 확인해 주세요.');
   ids.add(record.health.id);
   return record;
  });
 }
 return result;
}
export function archivedFriends(storage){
 const records=[];
 for(let i=0;i<(storage.length??0);i++){
  const key=storage.key(i);
  if(!key?.startsWith(archivePrefix))continue;
  const record=validateRecord(JSON.parse(storage.getItem(key)));
  if(record.health?.endedAt==null||key!==archivePrefix+record.health.id)throw Error('추억 앨범을 확인해 주세요.');
  records.push(record);
 }
 return records;
}
const retains=(next,previous)=>['photos','memories'].every(key=>previous[key].every(item=>next[key].some(candidate=>
 candidate.at===item.at&&(key==='photos'?candidate.url===item.url:candidate.text===item.text&&candidate.day===item.day))));
function sameFriend(a,b){
 if(!a||!b||a.variant!==b.variant)return false;
 return a.health&&b.health?a.health.id===b.health.id:a.adoptedAt===b.adoptedAt;
}
function protectedRecord(incoming,previous){
 if(!sameFriend(incoming,previous)||!previous.health)return incoming;
 if(previous.health.endedAt!==null)return validateRecord(previous);
 if(!incoming.health||incoming.health.wall<previous.health.wall||incoming.health.elapsed<previous.health.elapsed||!retains(incoming,previous))return validateRecord(previous);
 return incoming;
}
export function replaceRememberedFriend(storage,previous,next){
 const record=validateRecord(previous);
 if(record.health?.endedAt==null||next.variant!==previous.variant)throw Error('먼저 추억으로 남긴 친구를 확인해 주세요.');
 const key=archivePrefix+record.health.id, original=storage.getItem(key);
 storage.setItem(key,JSON.stringify(record));
 try{storage.setItem(KEY,JSON.stringify(next));}
 catch(error){if(original===null)storage.removeItem(key);else storage.setItem(key,original);throw error;}
}
export function collectFriends(storage,current){
 const pets=[];for(const p of PETS){const raw=p.id===current.variant?current:JSON.parse(storage.getItem(slot(p.id))||'null');if(raw){if(raw.variant!==p.id)throw Error('친구 기록이 일치하지 않아요. 원본을 먼저 보관해 주세요.');pets.push(raw);}}
 return validateFriends({format:'pet-friends',version:2,active:current.variant,pets,archives:archivedFriends(storage)});
}
export function restoreFriends(storage,raw,current,keepPrevious=false){
 const pack=validateFriends(raw),writes=new Map();
 if(keepPrevious){const previous=current?JSON.stringify(validateFriend(current)):storage.getItem(KEY);if(previous!==null)writes.set(KEY+'-previous',previous);}
 if(current&&!pack.pets.some(p=>p.variant===current.variant))writes.set(slot(current.variant),JSON.stringify(validateFriend(current)));
 const archives=archivedFriends(storage);
 for(const p of pack.archives??[]){
  const existing=archives.find(record=>record.health.id===p.health.id);
  writes.set(archivePrefix+p.health.id,JSON.stringify(existing??p));
 }
 for(let i=0;i<pack.pets.length;i++){
  const incoming=pack.pets[i],key=slot(incoming.variant);
  const existing=current?.variant===incoming.variant?current:JSON.parse(storage.getItem(key)||'null');
  const remembered=[...archives,...(pack.archives??[])].find(record=>sameFriend(incoming,record));
  const chosen=remembered&&existing&&!sameFriend(existing,remembered)?validateRecord(existing):protectedRecord(incoming,remembered??existing);
  if(existing?.health?.endedAt!=null&&!sameFriend(existing,chosen)){
   const record=validateRecord(existing);
   writes.set(archivePrefix+record.health.id,JSON.stringify(record));
  }
  pack.pets[i]=chosen;
  writes.set(key,JSON.stringify(chosen));
 }
 writes.set(KEY,JSON.stringify(pack.pets.find(p=>p.variant===pack.active)));
 const before=new Map([...writes.keys()].map(k=>[k,storage.getItem(k)]));
 try{for(const [k,v] of writes)storage.setItem(k,v);}catch(e){
  // Free partial imports first so larger original records fit during rollback.
  for(const k of before.keys())storage.removeItem(k);
  for(const [k,v] of before)if(v!==null)storage.setItem(k,v);
  throw e;
 }
 return pack;
}
