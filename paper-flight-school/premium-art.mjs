import * as T from './vendor/three.module.js?v=20261120-quality6';
import {GLTFLoader} from './vendor/GLTFLoader.js?v=20261120-quality6';

const base=new URL('./assets/premium/',import.meta.url),textures=new T.TextureLoader();
export const premiumStatus={loaded:[],failed:[]};
const textureImages=new Map();
function image(name){
  if(!textureImages.has(name))textureImages.set(name,textures.loadAsync(new URL(name,base).href).then(t=>{
    premiumStatus.loaded.push(name);return t.image;
  }).catch(()=>{premiumStatus.failed.push(name);return null;}));
  return textureImages.get(name);
}
export function refineOak(material,onChange,repeat){
  image('oak.webp').then(bitmap=>{
    if(!bitmap)return;
    const map=new T.Texture(bitmap);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
    map.repeat.set(...repeat);map.anisotropy=8;map.needsUpdate=true;
    material.map=material.bumpMap=map;material.bumpScale=.00014;material.color.set(0xffffff);
    material.roughness=.63;material.envMapIntensity=.30;material.needsUpdate=true;onChange();
  });return material;
}
export function refinePaper(texture,onChange){
  image('paper.webp').then(bitmap=>{
    if(!bitmap)return;
    texture.image=bitmap;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2,3);
    texture.anisotropy=8;texture.needsUpdate=true;onChange();
  });
}
const trophies=new Map();
export function refineSky(sky,onChange){
  image('city-sky.webp').then(bitmap=>{
    if(!bitmap)return;
    const map=new T.Texture(bitmap);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;
    map.repeat.y=2;map.offset.y=-1;map.needsUpdate=true;
    const previous=sky.material;
    sky.material=new T.MeshBasicMaterial({map,side:T.BackSide,depthWrite:false,toneMapped:false});
    previous.dispose();onChange();
  });
}
export async function placeTrophy(parent,onChange,{height=.15,position=[0,0,0],yaw=0,fallback}={}){
  // Keep the existing prop visible until the optional model has fully loaded.
  const file=height>.2?'flight-trophy-far.glb':'flight-trophy.glb';
  if(!trophies.has(file))trophies.set(file,new GLTFLoader().loadAsync(new URL(file,base).href).then(gltf=>{
    premiumStatus.loaded.push(file);return gltf.scene;
  }).catch(()=>{premiumStatus.failed.push(file);return null;}));
  const source=await trophies.get(file);if(!source)return;
  const model=source.clone(true),bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  if(!Number.isFinite(size.y)||size.y<=0){premiumStatus.failed.push('trophy-bounds');return;}
  const scale=height/size.y;model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});
  const stand=new T.Group();stand.name='tripo-flight-trophy';stand.position.set(...position);stand.rotation.y=yaw;stand.add(model);parent.add(stand);
  if(fallback)fallback.visible=false;onChange();return stand;
}
