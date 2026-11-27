import * as T from '../lib/three.module.min.js';

// Small spatial batches preserve every instance but let both camera and shadow
// frusta reject distant foliage. Never apply to animated instance buffers.
export function partitionInstances(root,cell=8){
 const candidates=[];root.traverse(o=>{if(o.isInstancedMesh&&!o.castShadow&&o.count>=80&&o.instanceMatrix.usage!==T.DynamicDrawUsage&&!o.userData.spatialBatch)candidates.push(o);});
 const matrix=new T.Matrix4(),color=new T.Color();
 for(const source of candidates){
  const buckets=new Map();for(let i=0;i<source.count;i++){source.getMatrixAt(i,matrix);const e=matrix.elements,key=Math.floor(e[12]/cell)+','+Math.floor(e[14]/cell);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}
  if(buckets.size<2)continue;
  for(const ids of buckets.values()){
   const mesh=new T.InstancedMesh(source.geometry,source.material,ids.length);mesh.name=source.name;mesh.userData={...source.userData,spatialBatch:true};mesh.castShadow=source.castShadow;mesh.receiveShadow=source.receiveShadow;mesh.layers.mask=source.layers.mask;mesh.renderOrder=source.renderOrder;mesh.visible=source.visible;mesh.position.copy(source.position);mesh.quaternion.copy(source.quaternion);mesh.scale.copy(source.scale);mesh.updateMatrix();mesh.matrixAutoUpdate=false;
   ids.forEach((id,i)=>{source.getMatrixAt(id,matrix);mesh.setMatrixAt(i,matrix);if(source.instanceColor){source.getColorAt(id,color);mesh.setColorAt(i,color);}});
   mesh.computeBoundingBox();mesh.computeBoundingSphere();source.parent.add(mesh);
  }
  source.removeFromParent();source.dispose();
 }
}




