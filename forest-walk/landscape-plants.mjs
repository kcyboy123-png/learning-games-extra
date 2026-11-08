import * as T from './vendor/three.module.js';
// Locally authored landscaping models, copied and simplified offline. No external runtime dependency.
export async function loadLandscapePlants(){
 const result={};await Promise.all(['liriope','daisy','hydrangea','maple'].map(async kind=>{
  try{const r=await fetch(new URL('./assets/landscape-'+kind+'.json',import.meta.url),{signal:AbortSignal.timeout(8000)});if(!r.ok)return;
   const data=await r.json();if(!data.position?.length||data.position.length>36000||data.normal?.length!==data.position.length||data.color?.length!==data.position.length)return;
   if(kind==='maple')for(let i=0;i<data.color.length;i+=3){if(data.position[i+1]>.65&&data.color[i]>data.color[i+1]*1.12){const light=.3+Math.min(.5,data.color[i]*.65);data.color[i]=light*.62;data.color[i+1]=light;data.color[i+2]=light*.32;}}
   const g=new T.BufferGeometry();for(const key of ['position','normal','color'])g.setAttribute(key,new T.Float32BufferAttribute(data[key],3));g.computeBoundingSphere();g.computeBoundingBox();result['garden_'+kind]=g;
  }catch{/* Existing grasses and ferns remain when an optional model cannot load. */}
 }));return result;
}
