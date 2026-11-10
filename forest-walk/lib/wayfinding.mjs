import {SUMMIT} from '../trail.mjs';
export const DESTINATIONS=[{s:115,name:'햇살 숲'},{s:210,name:'시냇물 다리'},{s:362,name:'폭포 쉼터'},{s:475,name:'다람쥐 숲'},{s:578,name:'하늘 전망대'},{s:SUMMIT.platform,name:'바람봉 정상'}];
export const WAYMARKERS=[13,82,176,258,338,440,530,620,688].map((s,i)=>{
 const next=DESTINATIONS.find(d=>d.s>s),summit=DESTINATIONS.at(-1),other=next===summit?DESTINATIONS.at(-2):summit;
 return {id:i,s,offset:i===0?3.1:i===3?-3.7:-3.3,heading:i===0?'바람봉 올라가는 길':null,rows:[next,other].map(d=>({name:d.name,distance:Math.abs(d.s-s),direction:d.s>s?'ahead':'back'}))};
});
export function nearestWaymarker(s,x=0){return WAYMARKERS.find(p=>Math.abs(p.s-s)<7&&Math.abs(p.offset-x)<6)||null;}

