import * as T from '../lib/three.module.min.js';

// Unique rounded/extruded parts cannot share an instance buffer, but can share a draw.
export function mergeStaticParts(group){
 group.updateMatrixWorld(true);
 const inverse=group.matrixWorld.clone().invert(),sets=new Map();
 group.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||o.userData.keepArtHierarchy||Array.isArray(o.material)||o.material.transparent||o.geometry.morphAttributes.position||o.geometry.attributes.tangent||o.matrixWorld.determinant()<=0)return;
  let parent=o;while(parent!==group){if(!parent.visible||parent.userData.ride||parent.userData.keepArtHierarchy)return;parent=parent.parent;}
  const attributes=Object.keys(o.geometry.attributes).sort();
  if(attributes.some(k=>o.geometry.attributes[k].isInterleavedBufferAttribute))return;
  const key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow+':'+attributes.map(k=>k+o.geometry.attributes[k].itemSize).join(',');
  const list=sets.get(key)||[];list.push(o);sets.set(key,list);
 });
 const transform=new T.Matrix4();
 for(const list of sets.values()){
  if(list.length<3)continue;
  const parts=list.map(o=>{transform.multiplyMatrices(inverse,o.matrixWorld);const g=o.geometry.clone().applyMatrix4(transform);if(!g.index)return g;const flat=g.toNonIndexed();g.dispose();return flat;});
  const geometry=new T.BufferGeometry();geometry.userData.owned=true;
  for(const key of Object.keys(parts[0].attributes)){
   const size=parts[0].attributes[key].itemSize,values=new Float32Array(parts.reduce((n,g)=>n+g.attributes[key].count*size,0));let offset=0;
   for(const g of parts){const a=g.attributes[key];for(let i=0;i<a.count;i++)for(let j=0;j<size;j++)values[offset++]=a.getComponent(i,j);}
   geometry.setAttribute(key,new T.Float32BufferAttribute(values,size));
  }
  const merged=new T.Mesh(geometry,list[0].material);merged.castShadow=list[0].castShadow;merged.receiveShadow=list[0].receiveShadow;group.add(merged);
  for(const o of list){o.removeFromParent();if(o.geometry.userData.owned)o.geometry.dispose();}for(const g of parts)g.dispose();
 }
}
