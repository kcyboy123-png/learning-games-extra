import {KEY,validate} from './model.mjs';
import {PETS} from './pets.mjs';
const slot=id=>KEY+'-pet-'+id;
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
export function validateFriends(raw){
 if(raw?.format!=='pet-friends'||raw.version!==1||!Array.isArray(raw.pets)||!raw.pets.length||raw.pets.length>9)throw Error('전체 친구 기록 파일을 확인해 주세요.');
 const seen=new Set();const pets=raw.pets.map(p=>{
  if(!PETS.some(x=>x.id===p?.variant)||seen.has(p.variant))throw Error('친구 종류가 중복되거나 올바르지 않아요.');seen.add(p.variant);
  const valid=validate(p);
  // Bulk restore must never silently drop photos or shorten memories.
  for(const [key,fields] of [['photos',['url','at']],['memories',['text','day','at']]]){
   const original=p[key]??[];
   if(!Array.isArray(original)||original.length!==valid[key].length||original.some((item,i)=>fields.some(field=>item?.[field]!==valid[key][i][field])))throw Error(p.name+'의 사진 또는 추억 일부를 읽을 수 없어요. 원본 파일을 보관하고 확인해 주세요.');
  }
  if(valid.photos.some(photo=>!completeWebp(photo.url)))throw Error(p.name+'의 사진 파일이 잘렸거나 형식이 맞지 않아요. 원본 백업을 확인해 주세요.');
  return valid;
 });
 if(!seen.has(raw.active))throw Error('현재 친구 기록이 없어요.');
 return {format:'pet-friends',version:1,active:raw.active,pets};
}
export function collectFriends(storage,current){
 const pets=[];for(const p of PETS){const raw=p.id===current.variant?current:JSON.parse(storage.getItem(slot(p.id))||'null');if(raw){if(raw.variant!==p.id)throw Error('친구 기록이 일치하지 않아요. 원본을 먼저 보관해 주세요.');pets.push(raw);}}
 return validateFriends({format:'pet-friends',version:1,active:current.variant,pets});
}
export function restoreFriends(storage,raw,current,keepPrevious=false){
 const pack=validateFriends(raw),writes=new Map();
 if(keepPrevious){const previous=current?JSON.stringify(validateFriend(current)):storage.getItem(KEY);if(previous!==null)writes.set(KEY+'-previous',previous);}
 if(current&&!pack.pets.some(p=>p.variant===current.variant))writes.set(slot(current.variant),JSON.stringify(validateFriend(current)));
 for(const p of pack.pets)writes.set(slot(p.variant),JSON.stringify(p));
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
