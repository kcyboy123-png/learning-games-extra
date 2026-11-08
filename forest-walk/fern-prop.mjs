import * as T from './vendor/three.module.js';

// Optional Tripo prop; the procedural ferns remain available when offline assets fail.
export async function loadFern(){
  try{
    const r=await fetch(new URL('./assets/target-fern.json',import.meta.url),{signal:AbortSignal.timeout(10000)});
    if(!r.ok)return null;
    const data=await r.json(),geometry=new T.BufferGeometry();
    for(const [key,size] of [['position',3],['normal',3],['uv',2]])geometry.setAttribute(key,new T.Float32BufferAttribute(data[key],size));
    geometry.setIndex(data.index);geometry.computeBoundingSphere();
    const map=await new T.TextureLoader().loadAsync(new URL('./assets/target-fern.webp',import.meta.url).href);
    map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    return {geometry,map};
  }catch{return null;}
}
