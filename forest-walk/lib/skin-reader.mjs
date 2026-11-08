import * as T from '../vendor/three.module.js';
// The hiking rigs have no morph targets. Cache each bone transform once per grounding pass.
export function createSkinReader(mesh){
  const {position,skinIndex,skinWeight}=mesh.geometry.attributes;
  const matrices=mesh.skeleton.bones.map(()=>new T.Matrix4()),base=new T.Vector3(),part=new T.Vector3();
  return {
    update(){for(let i=0;i<matrices.length;i++)matrices[i].multiplyMatrices(mesh.skeleton.bones[i].matrixWorld,mesh.skeleton.boneInverses[i]);},
    vertex(id,out){base.fromBufferAttribute(position,id).applyMatrix4(mesh.bindMatrix);out.set(0,0,0);
      for(let k=0;k<4;k++){const weight=skinWeight.array[id*4+k];if(weight!==0)out.addScaledVector(part.copy(base).applyMatrix4(matrices[skinIndex.array[id*4+k]]),weight);}
      return out.applyMatrix4(mesh.bindMatrixInverse);
    }
  };
}
