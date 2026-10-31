import * as T from '../lib/three.module.min.js';
import {rabbitFrames,rabbitAtlasSize} from './rabbit-frames.mjs?v=storybook1';

let atlasEntry;
const pixel=.0059,contactGeometry=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),contactMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float r=length((vUv-.5)*2.);gl_FragColor=vec4(.16,.20,.095,(1.-smoothstep(.08,1.,r))*.5);}'}),castMaterial=contactMaterial.clone();castMaterial.fragmentShader=castMaterial.fragmentShader.replace('*.5','*.22');
export function rabbitView(camera,heading,previous){
 const r=camera-heading;
 if(previous!==undefined){const center=[-1,-3,3,1][previous]*Math.PI/4,d=r-center;if(Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))<Math.PI/4+.08)return previous;}
 return Math.cos(r)>=0?(Math.sin(r)>0?3:0):(Math.sin(r)>0?2:1);
}
export function rabbitPose(distance,moving,reduced){return moving>.08&&!reduced?Math.floor(Math.max(0,distance)/.95*4)%4:0;}
function entry(){
 if(atlasEntry)return atlasEntry;
 const e=atlasEntry={ready:false,failed:false,materials:[]};
 const atlas=new T.TextureLoader().load(new URL('./assets/rabbit-storymatch.png',import.meta.url).href,()=>{e.ready=true;for(const m of e.materials)m.map.needsUpdate=true;},undefined,()=>{e.failed=true;});atlas.colorSpace=T.SRGBColorSpace;
 for(const[x,y,width,height]of rabbitFrames){
  const [w,h]=rabbitAtlasSize,map=atlas.clone();map.repeat.set(width/w,height/h);map.offset.set(x/w,1-(y+height)/h);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;
  // Cut the almost-transparent generation residue without blending a rectangular billboard.
  e.materials.push(new T.SpriteMaterial({map,alphaTest:.35,transparent:false,depthWrite:true}));
 }
 return e;
}
export function addRabbitArt(p){
 if(p.id!=='player'||typeof Image==='undefined')return;
 const e=entry(),fallback=new T.Group();
 // Keep the contact shadow and the original rig as an asset-loading fallback.
 for(const child of [...p.g.children].slice(1))fallback.add(child);
 p.g.add(fallback);
 const sprite=new T.Sprite(e.materials[0]);sprite.position.y=.004;p.g.add(sprite);
 const shadow=new T.Group();p.g.add(shadow);
 // A ground-aligned shadow stays joined to the measured supporting feet of the painted pose.
 const cast=new T.Mesh(contactGeometry,castMaterial);cast.scale.set(.64,1,1.18);cast.position.y=.006;shadow.add(cast);
 const contact=new T.Mesh(contactGeometry,contactMaterial);contact.scale.set(.68,1,.5);contact.position.y=.012;shadow.add(contact);
 p.rabbitArt={e,fallback,sprite,shadow,contact,cast,originalContact:p.g.children[0]};
 updateRabbitArt(p,.65,0,false);
}
export function updateRabbitArt(p,camera,time,reduced){
 const a=p?.rabbitArt;if(!a)return;
 const ready=a.e.ready&&!a.e.failed&&!p.sitting;a.fallback.visible=a.originalContact.visible=!ready;a.sprite.visible=a.shadow.visible=ready;if(!ready)return;
 a.view=rabbitView(camera,p.g.rotation.y,a.view);
 const index=a.view*4+rabbitPose(p.distance,p.moving,reduced),[, ,width,height,root,sole]=rabbitFrames[index];
 a.sprite.material=a.e.materials[index];a.sprite.center.set(root,2/height);
 a.sprite.scale.set(width*pixel,height*pixel*(1+(reduced?0:Math.sin(time*2)*.003*(1-p.moving))),1);
 const relative=camera-p.g.rotation.y,shift=(sole-root)*width*pixel,x=Math.cos(relative)*shift,z=-Math.sin(relative)*shift;
 a.contact.position.x=x;a.contact.position.z=z;
 const heading=p.g.rotation.y;a.cast.position.x=x+Math.cos(heading)*.24-Math.sin(heading)*.14;a.cast.position.z=z+Math.sin(heading)*.24+Math.cos(heading)*.14;a.cast.rotation.y=Math.atan2(.24,.14)-heading;
 // shortcut: four painted viewing angles; add intermediate views if free camera rotation is introduced.
 a.sprite.material.rotation=reduced?0:Math.sin(time*.85)*.008*(1-p.moving);
}
