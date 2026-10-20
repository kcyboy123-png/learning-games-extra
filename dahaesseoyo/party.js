(function(root){
'use strict';
const KEY=root.ThinkstarKey?.('thinkstar-party-v1')||'thinkstar-party-v1';let chosen=null;
function get(catalog,passed){
 const owned=catalog.filter(m=>passed(m.id)).map(m=>m.id);
 if(chosen===null){try{const raw=JSON.parse(root.localStorage.getItem(KEY));chosen=Array.isArray(raw)?raw.slice(0,3):owned.slice(0,3);}catch{chosen=owned.slice(0,3);}}
 chosen=[0,1,2].map(i=>owned.includes(chosen[i])&&chosen.indexOf(chosen[i])===i?chosen[i]:null);
 return chosen.slice(0,capacity(catalog,passed));
}
function capacity(catalog,passed){return root.ThinkstarGrowth(catalog.filter(m=>passed(m.id)).length).capacity;}
function save(){try{root.localStorage.setItem(KEY,JSON.stringify(chosen));return true;}catch{return false;}}
function setSlot(slot,id,catalog,passed){
 if(!Number.isInteger(slot)||slot<0||slot>=capacity(catalog,passed)||id!==null&&!catalog.some(m=>m.id===id&&passed(id)))return false;
 get(catalog,passed);const other=chosen.indexOf(id);
 if(id&&other>=0&&other!==slot)chosen[other]=chosen[slot];
 chosen[slot]=id;save();return true;
}
function add(id,catalog,passed){const ids=get(catalog,passed);if(ids.includes(id))return;const slot=ids.indexOf(null);if(slot>=0)setSlot(slot,id,catalog,passed);}
root.ThinkstarParty={get,setSlot,add,capacity};
})(globalThis);
