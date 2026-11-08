import * as T from './vendor/three.module.js';
import {entranceGarden} from './entrance-garden.mjs';
import {ENTRANCE} from './core.mjs';
import {sparkTex} from './textures.mjs';

const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const glide=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
// Only the renderer receives this temporary garden. Artwork state and autosave never receive it.
export function enterGarden(world,done){
 const savedItems=world.items,savedEnvironment=world.environment,savedWalk={...world.walk},savedFacing=world.avatar.actor.root.rotation.y;
 const kept={objects:[...world.objects.children],covers:[...world.covers.children],mask:world.maskData.slice(),hide:world.hideData.slice()};
 const fields=['surfaces','lampGlow','lampSpots','fringe','clover','borderBlooms'];for(const key of fields)kept[key]=world[key];
 world.objects.clear();world.covers.clear();world.lampGlow=null;
 world.move={x:0,z:0};world.setEnvironment('morning');
 // Replay must not inherit a student's view facing the boundary or the back of a flower bed.
 world.setItems(entranceGarden());world.setWalkPose(ENTRANCE[world.terrain]);world.avatar.tick(0,0);world.avatar.actor.root.rotation.y=world.walk.yaw+Math.PI;
 world.avatar.boom=undefined;world.updateCamera();
 const end=world.camera.position.clone(),rotation=world.camera.quaternion.clone(),endFog={near:world.scene.fog.near,far:world.scene.fog.far};
 const camera=world.walkCam.clone(),start=new T.Vector3(-3.2,18,15);
 const target=new T.Vector3(world.walk.x,world.avatar.actor.root.position.y+1,world.walk.z);
 const curve=new T.CatmullRomCurve3([start,new T.Vector3(2.4,11.8,14.2),new T.Vector3(.9,5.2,13),end]);
 curve.updateArcLengths();
 const look=target.clone(),position=new T.Vector3();
 const fade={value:0},originals=[],clones=new Map();
 for(const root of [world.objects,world.covers])root.traverse(o=>{if(!o.isMesh)return;const old=o.material;originals.push([o,old,o.castShadow]);if(!clones.has(old)){const m=old.clone(),compile=old.onBeforeCompile,key=old.customProgramCacheKey();
   m.onBeforeCompile=sh=>{compile.call(m,sh);sh.uniforms.entranceFade=fade;
   sh.vertexShader='varying float entranceZ;\n'+sh.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    vec4 entrancePosition=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
    entrancePosition=instanceMatrix*entrancePosition;
    #endif
    entranceZ=(modelMatrix*entrancePosition).z;`);
   sh.fragmentShader='uniform float entranceFade;varying float entranceZ;\n'+sh.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
    float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
    float dissolve=clamp(entranceFade*1.45-clamp((entranceZ+12.0)/24.0,0.0,1.0)*.45,0.0,1.0);
    if(dissolve>grain) discard;
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,.86,.55),dissolve*.48);`);};
   m.customProgramCacheKey=()=>key+'|entrance';clones.set(old,m);}o.material=clones.get(old);});
 const points=new Float32Array(180*3);for(let i=0;i<180;i++){points[i*3]=Math.sin(i*2.4)*(2+i%9);points[i*3+1]=.3+(i%23)*.12;points[i*3+2]=Math.cos(i*2.4)*(2+i%10);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(points,3));
 const material=new T.PointsMaterial({map:sparkTex(),color:'#fff0bc',size:.10,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
 const sparks=new T.Points(geometry,material);world.scene.add(sparks);
 const overlay=document.querySelector('#entrance'),caption=document.querySelector('#entranceCaption');overlay.hidden=false;document.querySelector('#skipEntrance').focus();
 let elapsed=0,finished=false,prepared=false,finishRequested=false,shadowsFaded=false;
 const finish=()=>{if(finished)return;if(!prepared){finishRequested=true;return;}finished=true;world.preparing=false;world.entrance=null;for(const [o,m,shadow] of originals){o.material=m;o.castShadow=shadow;}for(const m of clones.values())m.dispose();world.scene.remove(sparks);geometry.dispose();material.dispose();for(const root of [world.objects,world.covers]){for(const child of [...root.children]){root.remove(child);world.constructor.disposeOwned(child);}}
 for(const child of kept.objects)world.objects.add(child);for(const child of kept.covers)world.covers.add(child);world.items=savedItems;for(const key of fields)world[key]=kept[key];
 world.maskData.set(kept.mask);world.hideData.set(kept.hide);world.maskTex.needsUpdate=true;world.hideTex.needsUpdate=true;
 world.setEnvironment(savedEnvironment);world.setWalkPose(savedWalk);world.avatar.boom=undefined;world.avatar.tick(0,0);world.avatar.actor.root.rotation.y=savedFacing;world.updateCamera();world.dirty=true;overlay.hidden=true;done();};
 document.querySelector('#skipEntrance').onclick=finish;
 world.entrance={finish,tick(dt){if(document.hidden||!prepared)return;elapsed+=dt*1.1;const duration=world.reduced?1.5:11.2;
   if(elapsed>=duration){finish();return;}
   const travel=glide(Math.max(0,elapsed-.7)/7);const fov=world.reduced?world.walkCam.fov:54+(world.walkCam.fov-54)*smooth((travel-.65)/.35);if(camera.aspect!==world.aspect||camera.fov!==fov){camera.aspect=world.aspect;camera.fov=fov;camera.updateProjectionMatrix();}
   camera.position.copy(world.reduced?end:curve.getPointAt(travel,position));look.copy(target);look.y+=Math.sin(travel*Math.PI)*.16;camera.lookAt(look);camera.quaternion.slerp(rotation,smooth((travel-.75)/.25));world.camera=camera;
   world.avatar.actor.root.visible=true;world.avatar.contact.visible=true;
   world.scene.fog.near=endFog.near+(1-travel)*18;world.scene.fog.far=endFog.far+(1-travel)*40;
   fade.value=world.reduced?smooth(elapsed/1.5):smooth((elapsed-7.8)/3);
   if(fade.value>0&&!shadowsFaded){for(const [o] of originals)o.castShadow=false;shadowsFaded=true;}
   sparks.position.y=fade.value*1.8;sparks.rotation.y=fade.value*.18;material.opacity=Math.sin(fade.value*Math.PI)*.7;
   const text=world.reduced||elapsed>=7.8?'이제, 당신의 손으로 숲을 만들어 보세요.':elapsed<3.2?'햇살 가득한 정원이 당신을 기다려요.':'이 숲에, 어떤 이야기를 담고 싶나요?';if(caption.textContent!==text)caption.textContent=text;
   overlay.style.setProperty('--arrival',Math.min(1,elapsed/.8));world.dirty=true;
 }};
 world.preparing=true;caption.textContent='햇살 가득한 정원으로 들어가는 중…';overlay.style.setProperty('--arrival',1);
 // Compile both the main view and pond reflection before moving the camera, keeping the overlay responsive.
 const controller=world.entrance;
 controller.ready=(async()=>{try{await world.renderer.compileAsync(world.scene,camera);const pond=originals.find(([,m])=>m.pondReflection)?.[1].pondReflection;
   if(pond){const previous=world.renderer.getRenderTarget();let pending;try{world.renderer.setRenderTarget(pond.target);pending=world.renderer.compileAsync(world.scene,camera);}finally{world.renderer.setRenderTarget(previous);}await pending;}
   // Upload the arrival-view meshes before motion, without flashing that view on screen.
   const size=world.renderer.getDrawingBufferSize(new T.Vector2()),warm=new T.WebGLRenderTarget(size.x,size.y);
   warm.texture.colorSpace=T.SRGBColorSpace;const previous=world.renderer.getRenderTarget();
   try{world.renderer.setRenderTarget(warm);world.renderWith(camera);await new Promise(requestAnimationFrame);}
   finally{world.renderer.setRenderTarget(previous);warm.dispose();}
  }catch(error){console.warn('연출 사전 준비를 건너뛰고 기본 렌더로 이어갑니다.',error);}finally{prepared=true;try{if(finishRequested)finish();else{controller.tick(0);world.render();}}finally{world.preparing=false;world.last=performance.now();}}})();
}

