import * as T from './vendor/three.module.js';
import {createHero} from './hero.mjs?v=forest-public-20261108';

const assets=new Map();
export async function loadNPC(scene,kind){
  if(!['teacher','friend','boy'].includes(kind))throw Error('Unknown forest character');
  const file=kind==='boy'?'hero':kind;
  if(!assets.has(file))assets.set(file,(async()=>{
    const response=await fetch(new URL(`./assets/${file}-tripo.json`,import.meta.url),{signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('Character mesh unavailable');
    const data=await response.json();
    const map=await new T.TextureLoader().loadAsync(new URL(`./assets/${file}-tripo.webp`,import.meta.url).href);
    map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return {data,map};
  })().catch(error=>{assets.delete(file);throw error;}));
  const {data,map}=await assets.get(file),actor=createHero(scene,data,map);
  actor.root.name=`tripo-${kind}`;
  if(kind==='boy'){
    const colors=new Float32Array(data.position.length).fill(1);
    for(const id of data.rigidBackpack||[])colors.set([.55,.82,.7],id*3);
    actor.mesh.geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    actor.mesh.material.vertexColors=true;actor.root.scale.setScalar(.94);
  }
  return actor;
}
