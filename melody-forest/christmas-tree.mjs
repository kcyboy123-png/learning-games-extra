import * as THREE from './lib/three.module.min.js';
import {GLTFLoader} from './lib/GLTFLoader.js';

export function prepareChristmasTree(tree,height=5.4,name='tripo-christmas-tree'){
  tree.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(tree),size=box.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.y)||size.y<=0)throw new Error('Empty Christmas tree');
  const root=new THREE.Group(),scale=height/size.y;
  tree.position.sub(new THREE.Vector3((box.min.x+box.max.x)/2,box.min.y,(box.min.z+box.max.z)/2));
  root.add(tree);root.scale.setScalar(scale);root.name=name;
  tree.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;for(const m of [].concat(o.material)){if(m.map)m.map.anisotropy=4;m.roughness=Math.max(.65,m.roughness??.8);m.metalness=Math.min(.2,m.metalness??0);}}});
  return root;
}

// Each map owns its GPU resources; leaving Christmas must not dispose the cached original.
export function copyChristmasTree(source,materialOverride=null){
  const clone=source.clone(true),geometries=new Map(),materials=new Map(),textures=new Map();
  clone.traverse(o=>{
    if(o.geometry){if(!geometries.has(o.geometry))geometries.set(o.geometry,o.geometry.clone());o.geometry=geometries.get(o.geometry);}
    if(o.material)o.material=materialOverride||(Array.isArray(o.material)?o.material.map(copyMaterial):copyMaterial(o.material));
  });
  function copyMaterial(original){
    if(!materials.has(original)){
      const m=original.clone();for(const [key,value] of Object.entries(m))if(value?.isTexture){if(!textures.has(value)){const t=value.clone();t.needsUpdate=true;textures.set(value,t);}m[key]=textures.get(value);}materials.set(original,m);
    }return materials.get(original);
  }
  return clone;
}

export async function loadChristmasTree(){
  try{return prepareChristmasTree((await new GLTFLoader().loadAsync('./assets/forest/christmas-fir-winter.glb')).scene);}
  catch(error){console.warn('Christmas tree unavailable; using built-in tree.',error);return null;}
}

export async function loadChristmasLantern(){
  try{return prepareChristmasTree((await new GLTFLoader().loadAsync('./assets/forest/christmas-lantern-winter.glb')).scene,2.2,'tripo-christmas-lantern');}
  catch(error){console.warn('Christmas lantern unavailable; using built-in lantern.',error);return null;}
}

export async function loadChristmasArch(){
  try{const model=(await new GLTFLoader().loadAsync('./assets/forest/christmas-arch-winter.glb')).scene;model.rotation.y=Math.PI/2;return prepareChristmasTree(model,5.4,'tripo-christmas-arch');}
  catch(error){console.warn('Christmas arch unavailable; retaining existing decorations.',error);return null;}
}

export async function loadDistantChristmasTree(){
  try{return prepareChristmasTree((await new GLTFLoader().loadAsync('./assets/forest/christmas-fir-background.glb')).scene,5.4,'distant-christmas-tree');}
  catch(error){console.warn('Distant Christmas tree unavailable; retaining original detail.',error);return null;}
}
