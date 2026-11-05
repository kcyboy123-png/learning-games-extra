import * as T from '../lib/three.module.min.js';
import {rabbitView,rabbitPose} from './rabbit-art.mjs?v=perf1';
import {penguinFrames,penguinAtlasSize} from './penguin-frames.mjs';

let atlasEntry;
function entry(){
 if(atlasEntry)return atlasEntry;
 const e=atlasEntry={ready:false,failed:false,materials:[]};
 const atlas=new T.TextureLoader().load(new URL('./assets/scenario-penguin.webp',import.meta.url).href,()=>{e.ready=true;for(const m of e.materials)m.map.needsUpdate=true;},undefined,()=>{e.failed=true;});
 atlas.colorSpace=T.SRGBColorSpace;
 for(const[x,y,w,h]of penguinFrames){
  const map=atlas.clone();map.repeat.set(w/penguinAtlasSize[0],h/penguinAtlasSize[1]);map.offset.set(x/penguinAtlasSize[0],1-(y+h)/penguinAtlasSize[1]);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;
  e.materials.push(new T.SpriteMaterial({map,alphaTest:.35,transparent:false,depthWrite:true}));
 }
 return e;
}
export function penguinPose(p,reduced,winter){
 if(p.watering)return winter?7:6;
 if(p.sitting)return 4;
 if(p.carry.visible)return 5;
 return rabbitPose(p.distance,p.moving,reduced);
}
export function addPenguinArt(p){
 if(p.species!=='penguin'||typeof Image==='undefined')return;
 const e=entry(),fallback=new T.Group();
 // The original rig remains available if the image cannot load.
 for(const child of [...p.g.children].slice(1))if(child!==p.wateringDrops)fallback.add(child);
 p.g.add(fallback);
 const sprite=new T.Sprite(e.materials[0]);p.g.add(sprite);
 p.penguinArt={e,fallback,sprite};
 updatePenguinArt(p,.65,0,false,false);
}
export function updatePenguinArt(p,camera,time,reduced,winter){
 const a=p.penguinArt;if(!a)return;
 const ready=a.e.ready&&!a.e.failed;a.fallback.visible=!ready;a.sprite.visible=ready;if(!ready)return;
 a.view=rabbitView(camera,p.g.rotation.y,a.view);
 const pose=penguinPose(p,reduced,winter),index=a.view*8+pose,[,,w,h,root]=penguinFrames[index];
 a.sprite.material=a.e.materials[index];a.sprite.center.set(root,2/h);
 const moving=pose<4&&p.moving>.08&&!reduced;
 a.sprite.scale.set(w*.00455,h*.00455*(1+(reduced?0:Math.sin(time*2)*.003*(1-p.moving))),1);
 a.sprite.position.y=.004+(moving?Math.abs(Math.sin(p.distance*13))*.012:0);
 // Four painted camera angles match the rabbit; distance controls the walk cycle.
}
