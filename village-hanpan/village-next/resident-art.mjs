import * as T from '../lib/three.module.min.js';
import {rabbitView,rabbitPose} from './rabbit-art.mjs?v=perf1';
import {penguinFrames,penguinAtlasSize} from './penguin-frames.mjs';

import {residentAtlases} from './resident-frames.mjs?v=npc9';
const layouts={penguin:{size:penguinAtlasSize,frames:penguinFrames,pixel:.00455},...residentAtlases},entries=new Map();
function entry(species){
 if(entries.has(species))return entries.get(species);
 const layout=layouts[species],e={ready:false,failed:false,materials:[],...layout};entries.set(species,e);
 const atlas=new T.TextureLoader().load(new URL(`./assets/scenario-${species}.webp`,import.meta.url).href,()=>{e.ready=true;for(const m of e.materials)m.map.needsUpdate=true;},undefined,()=>{e.failed=true;});
 atlas.colorSpace=T.SRGBColorSpace;
 for(const[x,y,w,h]of layout.frames){
  const map=atlas.clone();map.repeat.set(w/layout.size[0],h/layout.size[1]);map.offset.set(x/layout.size[0],1-(y+h)/layout.size[1]);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;
  e.materials.push(new T.SpriteMaterial({map,alphaTest:.35,transparent:false,depthWrite:true}));
 }
 return e;
}
export function residentPose(p,reduced,winter){
 if(p.watering)return winter?7:6;
 if(p.sitting)return 4;
 if(p.carry.visible)return 5;
 return rabbitPose(p.distance,p.moving,reduced);
}
export function addResidentArt(p){
 if(!layouts[p.species]||typeof Image==='undefined')return;
 const e=entry(p.species),fallback=new T.Group();
 // The original rig remains available if the image cannot load.
 for(const child of [...p.g.children].slice(1))if(child!==p.wateringDrops)fallback.add(child);
 p.g.add(fallback);
 const sprite=new T.Sprite(e.materials[0]);p.g.add(sprite);
 p.residentArt={e,fallback,sprite};
 updateResidentArt(p,.65,0,false,false);
}
export function updateResidentArt(p,camera,time,reduced,winter){
 const a=p.residentArt;if(!a)return;
 const ready=a.e.ready&&!a.e.failed;a.fallback.visible=!ready;a.sprite.visible=ready;if(!ready)return;
 a.view=rabbitView(camera,p.g.rotation.y,a.view);
 const pose=residentPose(p,reduced,winter),index=a.view*8+pose,[,,w,h,root]=a.e.frames[index];
 a.sprite.material=a.e.materials[index];a.sprite.center.set(root,2/h);
 const moving=pose<4&&p.moving>.08&&!reduced;
 a.sprite.scale.set(w*a.e.pixel,h*a.e.pixel*(1+(reduced?0:Math.sin(time*2)*.003*(1-p.moving))),1);
 a.sprite.position.y=.004+(moving?Math.abs(Math.sin(p.distance*13))*.012:0);
 // Four painted camera angles match the rabbit; distance controls the walk cycle.
}
