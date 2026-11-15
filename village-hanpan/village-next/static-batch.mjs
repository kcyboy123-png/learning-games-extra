import * as T from '../lib/three.module.min.js';

// Keep live paths to sprites/rides; skip world-matrix traversal only on static branches.
export function freezeStaticTransforms(group){
 group.updateWorldMatrix(true,true);
 const empty=[];
 function visit(o,moving=false){
  const keep=moving||o.isSprite||!!o.userData.keepArtHierarchy||!!o.userData.ride;
  let live=keep;for(const child of o.children)live=visit(child,keep)||live;
  if(!keep){o.updateMatrix();o.matrixAutoUpdate=false;if(o!==group&&o.isGroup&&!o.children.length)empty.push(o);}
  o.matrixWorldAutoUpdate=live;return live;
 }
 visit(group);group.updateMatrixWorld(true);for(const o of empty)o.removeFromParent();
}

// Unique rounded/extruded parts cannot share an instance buffer, but can share a draw.
export function mergeStaticParts(group){
 group.updateMatrixWorld(true);
 const inverse=group.matrixWorld.clone().invert(),sets=new Map();
 group.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||o.userData.keepArtHierarchy||Array.isArray(o.material)||o.material.transparent||o.geometry.morphAttributes.position||o.geometry.attributes.tangent||o.matrixWorld.determinant()<=0)return;
  let parent=o;while(parent!==group){if(!parent.visible||parent.userData.ride||parent.userData.keepArtHierarchy)return;parent=parent.parent;}
  const attributes=Object.keys(o.geometry.attributes).sort();
  if(attributes.some(k=>o.geometry.attributes[k].isInterleavedBufferAttribute))return;
  const key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow+':'+attributes.map(k=>{const a=o.geometry.attributes[k];return k+a.itemSize+':'+a.normalized+':'+a.array.constructor.name;}).join(',');
  const list=sets.get(key)||[];list.push(o);sets.set(key,list);
 });
 const transform=new T.Matrix4();
 for(const list of sets.values()){
  if(list.length<2)continue;
  const parts=list.map(o=>{transform.multiplyMatrices(inverse,o.matrixWorld);return o.geometry.clone().applyMatrix4(transform);});
  const geometry=new T.BufferGeometry();geometry.userData.owned=true;
  for(const key of Object.keys(parts[0].attributes)){
   const first=parts[0].attributes[key],values=new first.array.constructor(parts.reduce((n,g)=>n+g.attributes[key].array.length,0));let offset=0;
   for(const g of parts){const a=g.attributes[key];values.set(a.array,offset);offset+=a.array.length;}
   geometry.setAttribute(key,new T.BufferAttribute(values,first.itemSize,first.normalized));
  }
  // Keep shared vertices indexed instead of sending a copy for every triangle corner.
  const count=parts.reduce((n,g)=>n+g.attributes.position.count,0),indices=new (count>65535?Uint32Array:Uint16Array)(parts.reduce((n,g)=>n+(g.index?.count??g.attributes.position.count),0));let offset=0,base=0;
  for(const g of parts){const length=g.index?.count??g.attributes.position.count;for(let i=0;i<length;i++)indices[offset++]=base+(g.index?g.index.getX(i):i);base+=g.attributes.position.count;}
  geometry.setIndex(new T.BufferAttribute(indices,1));
  const merged=new T.Mesh(geometry,list[0].material);merged.castShadow=list[0].castShadow;merged.receiveShadow=list[0].receiveShadow;group.add(merged);
  for(const o of list){o.removeFromParent();if(o.geometry.userData.owned)o.geometry.dispose();}for(const g of parts)g.dispose();
 }
}
