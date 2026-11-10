import * as T from '../lib/three.module.min.js';
import {socialAmount,idleStretch} from './resident-social.mjs';
import {rabbitView} from './rabbit-art.mjs?v=perf1';
import {penguinFrames,penguinAtlasSize} from './penguin-frames.mjs';

import {residentAtlases} from './resident-frames.mjs?v=motion1';
const layouts={penguin:{size:penguinAtlasSize,frames:penguinFrames,pixel:.00455},...residentAtlases},entries=new Map();
function entry(species){
 if(entries.has(species))return entries.get(species);
 const layout=layouts[species],e={ready:false,failed:false,materials:[],...layout};entries.set(species,e);
 const atlas=new T.TextureLoader().load(new URL(`./assets/scenario-${species}.webp${species==='panda'?'?v=motion1':''}`,import.meta.url).href,()=>{e.ready=true;for(const m of e.materials)m.map.needsUpdate=true;},undefined,()=>{e.failed=true;});
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
 // Passing pose separates the two steps; the idle drawing is only used at rest.
 const step=Math.floor(Math.max(0,p.distance)/.95*4)%4;
 return p.moving>.08&&!reduced?(step===0?1:step===2?3:2):0;
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
export function updateResidentArt(p,camera,time,reduced,winter,viewTime=time){
 const a=p.residentArt;if(!a)return;
 const ready=a.e.ready&&!a.e.failed;a.fallback.visible=!ready;a.sprite.visible=ready;if(!ready)return;
 if(a.viewCamera!==camera||a.viewHeading!==p.g.rotation.y||a.viewPrevious!==a.view){a.viewCamera=camera;a.viewHeading=p.g.rotation.y;a.viewPrevious=a.view;a.computedView=rabbitView(camera,p.g.rotation.y,a.view);}const view=a.computedView;
 // Briefly hold the old view through tiny steering reversals at a corner.
 if(a.pendingView!==view){a.pendingView=view;a.turnAt=viewTime;}
 if(a.view===undefined||reduced||viewTime-a.turnAt>=.06)a.view=view;
 const pose=residentPose(p,reduced,winter),index=a.view*8+pose,[,,w,h,root]=a.e.frames[index];
 if(a.frameIndex!==index){a.frameIndex=index;a.sprite.material=a.e.materials[index];a.sprite.center.set(root,2/h);}
 const moving=!p.sitting&&!p.watering&&p.moving>.08&&!reduced;
 a.sprite.scale.set(w*a.e.pixel,h*a.e.pixel*(1+(reduced?0:Math.sin(time*2)*.003*(1-p.moving))),1);
 a.sprite.position.y=.004+(moving?Math.abs(Math.sin(p.distance/.95*Math.PI*2))*.018*p.moving:0);
 const greeting=socialAmount(p,reduced,viewTime),style=p.id.charCodeAt(0)%3;
 a.sprite.scale.y*=1-greeting*(style===0?.045:.025);
 a.sprite.position.y+=greeting*(style===1?.035:0);
 a.sprite.scale.x*=1+greeting*(style===2?.025:0);
 const stretch=idleStretch(p,time,reduced);a.sprite.scale.y*=1+stretch*.018;a.sprite.scale.x*=1-stretch*.012;
 // Four painted camera angles match the rabbit; distance controls the walk cycle.
}
