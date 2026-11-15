import * as T from '../lib/three.module.min.js';

export function skipNoOutputDraws(renderer){
 const draw=renderer.renderBufferDirect;
 renderer.renderBufferDirect=function(camera,scene,geometry,material,object,group){
  // Tree shadow proxies still render with the shadow pass's depth material.
  if(!material.colorWrite&&!material.depthWrite&&!material.stencilWrite)return;
  return draw.call(this,camera,scene,geometry,material,object,group);
 };
}

function colorBatchKey(m){
 if(!m.isMeshStandardMaterial||m.transparent||m.onBeforeCompile!==T.Material.prototype.onBeforeCompile||m.customProgramCacheKey!==T.Material.prototype.customProgramCacheKey||Object.keys(m.userData).length||m.emissive.getHex()!==0)return null;
 const values=[];
 for(const key of Object.keys(m).sort()){
  if(['id','uuid','name','color','version','userData','_listeners'].includes(key))continue;
  const v=m[key];
  if(v===null||['number','boolean','string','undefined'].includes(typeof v))values.push([key,v]);
  else if(v.isTexture)values.push([key,v.uuid]);
  else if(v.isColor||v.isVector2||v.isEuler)values.push([key,v.toArray()]);
  else if(key==='defines'&&Object.values(v).every(x=>['string','number','boolean'].includes(typeof x)))values.push([key,Object.entries(v).sort(([a],[b])=>a.localeCompare(b))]);
  else return null;
 }
 return JSON.stringify(values);
}

export function batchColoredParts(group){
 group.updateMatrixWorld(true);const keys=new Map(),sets=new Map();
 group.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.userData.keepArtHierarchy||o.isSkinnedMesh||o.morphTargetInfluences||o.onBeforeRender!==T.Object3D.prototype.onBeforeRender||o.matrixWorld.determinant()<=0)return;
  let allowed=false;for(let p=o;p!==group;p=p.parent){if(!p.visible||p.userData.ride||p.userData.keepArtHierarchy)return;if(p.userData.colorBatch)allowed=true;}if(!allowed)return;
  const m=o.material;if(m.map&&!m.map.userData.shared)return;if(!keys.has(m))keys.set(m,colorBatchKey(m));const materialKey=keys.get(m);if(materialKey===null)return;
  const key=[o.geometry.uuid,materialKey,o.castShadow,o.receiveShadow,o.renderOrder,o.layers.mask].join(':');if(!sets.has(key))sets.set(key,[]);sets.get(key).push(o);
 });
 const inverse=group.matrixWorld.clone().invert(),matrix=new T.Matrix4();
 for(const list of sets.values()){
  if(list.length<3||new Set(list.map(o=>o.material)).size<2)continue;
  const first=list[0],material=first.material.clone();material.color.setRGB(1,1,1);material.userData.owned=true;
  const mesh=new T.InstancedMesh(first.geometry,material,list.length);mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.renderOrder=first.renderOrder;mesh.layers.mask=first.layers.mask;
  mesh.userData.instanceSources=list.map(o=>o.material);
  list.forEach((o,i)=>{mesh.setMatrixAt(i,matrix.multiplyMatrices(inverse,o.matrixWorld));mesh.setColorAt(i,o.material.color);o.removeFromParent();});group.add(mesh);
 }
}

export function refreshInstanceColors(group){
 group?.traverse(o=>{const sources=o.userData.instanceSources;if(!sources)return;const colors=o.instanceColor.array;let changed=false;
  sources.forEach((m,i)=>{const c=m.color,j=i*3;if(colors[j]!==Math.fround(c.r)||colors[j+1]!==Math.fround(c.g)||colors[j+2]!==Math.fround(c.b)){o.setColorAt(i,c);changed=true;}});
  if(changed)o.instanceColor.needsUpdate=true;
 });
}
