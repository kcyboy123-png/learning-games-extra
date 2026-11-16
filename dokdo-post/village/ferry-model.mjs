import * as T from '../lib/three.module.min.js';

// Tripo's pointed bow is -X. Turn it to +Z before measuring and fitting the existing ferry route.
export function normalizeFerry(scene){
 scene.rotation.y=Math.PI/2;scene.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 if(!Number.isFinite(size.z)||size.z<=0||size.y<=0)throw Error('배 모델 크기를 읽을 수 없어요.');
 const scale=4/size.z;scene.scale.setScalar(scale);
 scene.position.set(-center.x*scale,-bounds.min.y*scale-.45,-center.z*scale);
 scene.name='tripo-ferry-6k';scene.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.frustumCulled=true;}});
 scene.updateMatrixWorld(true);return scene;
}
export function disposeFerry(scene){
 if(!scene)return;const geometries=new Set(),materials=new Set(),textures=new Set();
 scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});
 scene.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures){t.dispose();t.source?.data?.close?.();}
}
export async function loadTripoFerry(){
 const {GLTFLoader}=await import('./vendor/three-r162/GLTFLoader.js');
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/tripo-ferry-6k.glb',import.meta.url).href);
 try{return normalizeFerry(gltf.scene);}catch(error){disposeFerry(gltf.scene);throw error;}
}
