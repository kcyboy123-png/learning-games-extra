import * as T from '../lib/three.module.min.js';

const assets={house:'cottage-house.png',snack:'cottage-snack.png',generator:'cottage-power.png'},entries=new Map();
// Each painted view has different transparent padding; align its lowest solid pixel to the same ground anchor.
const feet={house:[.054,.024,.139,.123],snack:[.075,.129,.124,.088],generator:[.029,.030,.094,.089]};
const contactGeometry=new T.PlaneGeometry(2.7,2.1).rotateX(-Math.PI/2),contactMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float r=length((vUv-.5)*2.);gl_FragColor=vec4(.22,.19,.08,(1.-smoothstep(.4,1.,r))*.25);}' });
export function cottageView(angle,facing){return((Math.round((angle-.65-facing*Math.PI/2)/(Math.PI/2))%4)+4)%4;}
function entry(type){
 if(entries.has(type))return entries.get(type);
 const e={ready:false,failed:false,materials:[],winter:{value:0}};entries.set(type,e);
 const atlas=new T.TextureLoader().load(new URL('./assets/'+assets[type],import.meta.url).href,()=>{e.ready=true;for(const m of e.materials)m.map.needsUpdate=true;},undefined,()=>{e.failed=true;});atlas.colorSpace=T.SRGBColorSpace;
 for(const[x,y]of[[0,1],[1,1],[0,0],[1,0]]){
  const map=atlas.clone();map.repeat.set(.496,.496);map.offset.set(x*.5+.002,y*.5+.002);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;map.needsUpdate=true;
  const m=new T.SpriteMaterial({map,alphaTest:.35,transparent:false,depthWrite:true});
  m.onBeforeCompile=shader=>{shader.uniforms.cottageWinter=e.winter;shader.fragmentShader='uniform float cottageWinter;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n float snowMask=smoothstep(1.03,1.20,diffuseColor.g/max(.001,diffuseColor.r))*smoothstep(1.03,1.24,diffuseColor.g/max(.001,diffuseColor.b)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.76,.83,.84)+diffuseColor.rgb*.15,snowMask*cottageWinter);');};
  e.materials.push(m);
 }
 return e;
}
export function addCottageArt(parent,fallback,type,facing){
 if(!assets[type]||typeof Image==='undefined')return false;
 const e=entry(type),g=new T.Group();parent.add(g);g.userData.cottageArt={e,fallback,facing,type};
 // Keep the procedural model intact for loading failures and construction previews.
 fallback.traverse(o=>{o.userData.keepArtHierarchy=true;});
 const sprite=new T.Sprite(e.materials[0]);sprite.center.set(.5,feet[type][0]+.008);sprite.scale.set(type==='generator'?2.72:3.18,type==='generator'?2.6:3.08,1);sprite.position.y=.015;g.add(sprite);
 const proxy=new T.Group();g.add(proxy);
 const contact=new T.Mesh(contactGeometry,contactMaterial);contact.position.y=.022;proxy.add(contact);
 g.traverse(o=>{o.userData.keepArtHierarchy=true;});sprite.visible=proxy.visible=e.ready&&!e.failed;fallback.visible=!sprite.visible;return true;
}
export function updateCottageArt(scene,angle,season){
 let settled=true;
 for(const e of entries.values()){e.winter.value=season===0?1:0;if(!e.ready&&!e.failed)settled=false;}
 scene.traverse(g=>{const a=g.userData.cottageArt;if(!a)return;const ready=a.e.ready&&!a.e.failed,sprite=g.children[0],proxy=g.children[1],relative=angle-a.facing*Math.PI/2,view=cottageView(angle,a.facing);sprite.visible=proxy.visible=ready;a.fallback.visible=!ready;sprite.material=a.e.materials[view];sprite.center.y=feet[a.type][view]+.008;sprite.position.x=proxy.position.x=Math.sin(relative)*.6;sprite.position.z=proxy.position.z=Math.cos(relative)*.6;});
 return settled;
}
