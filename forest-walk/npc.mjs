import * as T from './vendor/three.module.js';
import {createHero,loadHero,loadCharacterAssets} from './hero.mjs?v=teacher-polish-20261111';

export async function loadNPC(scene,kind){
  if(!['teacher','friend','boy'].includes(kind))throw Error('Unknown forest character');
  if(kind==='teacher')return loadHero(scene,'teacher-male',true);
  const file=kind==='boy'?'hero':kind;
  const {data,map}=await loadCharacterAssets(file),actor=createHero(scene,data,map);
  actor.root.name=`tripo-${kind}`;
  if(kind==='boy'){
    const colors=new Float32Array(data.position.length).fill(1);
    for(const id of data.rigidBackpack||[])colors.set([.55,.82,.7],id*3);
    actor.mesh.geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    const original=actor.mesh.material;actor.mesh.material=original.clone();actor.mesh.material.onBeforeCompile=original.onBeforeCompile;actor.mesh.material.customProgramCacheKey=original.customProgramCacheKey;actor.mesh.material.vertexColors=true;actor.root.scale.setScalar(.94);
  }
  return actor;
}

