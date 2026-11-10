import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {refineCharacter} from './character-look.mjs';
import {walkHeight} from './walk.mjs';
import {height} from './terrain.mjs';

// A single selected actor; cached models retain their original rig and animations.
export class ForestAvatar {
 constructor(world){
  this.world=world;this.cache=new Map();this.distance=3.4;this.request=0;this.ray=new T.Raycaster();this.cameraTarget=new T.Vector3();this.cameraDirection=new T.Vector3();this.slopePoint=new T.Vector3();
  this.fill=new T.DirectionalLight('#fff0e5',.65);this.rim=new T.DirectionalLight('#fff0da',.7);
  world.scene.add(this.fill,this.fill.target,this.rim,this.rim.target);
  this.contact=new T.Mesh(new T.PlaneGeometry(.72,.50,4,4),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{opacity:{value:.18}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform float opacity;void main(){float d=length((vUv-.5)*2.0);gl_FragColor=vec4(.08,.065,.045,(1.0-smoothstep(.05,1.0,d))*opacity);}'}));
  this.contact.rotation.x=-Math.PI/2;this.contact.renderOrder=1;this.contact.visible=false;world.scene.add(this.contact);
 }
 async select(key){
  if(!['boy','girl'].includes(key))throw Error('알 수 없는 캐릭터예요.');
  const request=++this.request;
  if(!this.cache.has(key))this.cache.set(key,new GLTFLoader().loadAsync(`./assets/characters/${key}.glb`).then(gltf=>{
   const root=gltf.scene;root.updateMatrixWorld(true);const box=new T.Box3();
   root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox();box.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld));}else box.union(new T.Box3().setFromObject(o));});
   refineCharacter(root,this.world.renderer);const mixer=new T.AnimationMixer(root);
   return {root,mixer,minY:box.min.y,actions:Object.fromEntries(gltf.animations.map(c=>[c.name,mixer.clipAction(c)]))};
  }).catch(e=>{this.cache.delete(key);throw e;}));
  const actor=await this.cache.get(key);if(request!==this.request)return false;
  if(this.actor)this.world.scene.remove(this.actor.root);
  this.actor=actor;this.key=key;actor.mixer.stopAllAction();actor.current=null;this.world.scene.add(actor.root);
  actor.root.rotation.y=this.world.walk.yaw+Math.PI;this.tick(0,0);this.world.updateCamera();this.world.dirty=true;return true;
 }
 tick(dt,moved){
  const a=this.actor,w=this.world;if(!a)return;
  const on=w.mode==='walk',groundChanged=this.groundX!==w.walk.x||this.groundZ!==w.walk.z||this.groundTerrain!==w.terrain||this.groundSurfaces!==w.surfaces;
  const y=groundChanged?w.walkGround():this.groundY;this.groundY=y;
  a.root.visible=on;this.contact.visible=on; // Keep the light count stable: hiding lights recompiles every lit forest material.
  a.root.position.set(w.walk.x,y-a.minY,w.walk.z);
  if(moved>.00001){const angle=w.walk.yaw+Math.atan2(w.move.x,w.move.z);a.root.rotation.y+=Math.atan2(Math.sin(angle-a.root.rotation.y),Math.cos(angle-a.root.rotation.y))*(1-Math.exp(-dt*12));}
  const action=a.actions[on&&moved>.00001?'walk':'idle'];
  if(action&&action!==a.current){action.reset().play();if(a.current)a.current.crossFadeTo(action,.26,false);a.current=action;}
  if(on||a!==this.lastActor)a.mixer.update(dt);
  const night=w.environment==='night';if(this.lightEnvironment!==w.environment){this.lightEnvironment=w.environment;this.fill.color.set(night?'#e2eaff':'#fff0e5');this.rim.color.set(night?'#a9c7ff':'#fff0da');}
  this.fill.intensity=on?(night?.52:.65):0;this.rim.intensity=on?(night?.48:.7):0;
  if(groundChanged||a!==this.lastActor){this.fill.position.set(w.walk.x-4,y+5,w.walk.z+6);this.rim.position.set(w.walk.x+4,y+4,w.walk.z-5);this.fill.target.position.copy(a.root.position);this.rim.target.position.copy(a.root.position);}
  this.contact.position.set(w.walk.x,y+.018,w.walk.z);this.contact.material.uniforms.opacity.value=night?.12:.18;
  if(groundChanged){const p=this.contact.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,walkHeight(w.walk.x+p.getX(i),w.walk.z-p.getY(i),w.terrain,w.surfaces)-y);p.needsUpdate=true;this.groundX=w.walk.x;this.groundZ=w.walk.z;this.groundTerrain=w.terrain;this.groundSurfaces=w.surfaces;}this.lastActor=a;
 }
 camera(){
  const w=this.world;if(!this.actor)return;
  const yaw=w.walk.yaw,elev=Math.max(.08,Math.min(.85,.3+w.walk.pitch)),y=w.camY-1.5;
  const target=this.cameraTarget.set(w.walk.x,y+1.05,w.walk.z);
  const direction=this.cameraDirection.set(Math.sin(yaw)*Math.cos(elev),Math.sin(elev),Math.cos(yaw)*Math.cos(elev));
  let distance=this.distance;
  const cached=this.collision;
  if(cached&&cached.x===target.x&&cached.y===target.y&&cached.z===target.z&&cached.yaw===yaw&&cached.elev===elev&&cached.requested===this.distance&&cached.surfaces===w.surfaces&&cached.terrain===w.terrain&&cached.scenery===w.scenery){distance=cached.distance;}
  else{
  // Keep the boom above slopes; tree and furniture surfaces shorten it below.
  for(let d=.2;d<=distance;d+=.12){const p=this.slopePoint.copy(target).addScaledVector(direction,d);if(p.y<height(p.x,p.z,w.terrain)+.25){distance=Math.max(.18,d-.16);break;}}
  this.ray.set(target,direction);this.ray.near=.08;this.ray.far=distance+.18;
  const roots=this.rayRoots??=[],hits=this.rayHits??=[];if(this.raySurfaces!==w.surfaces||this.rayScenery!==w.scenery){w.objects.updateMatrixWorld();w.scenery.updateMatrixWorld();roots.length=0;for(const root of [w.objects,w.scenery])root.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints||o.isSprite)roots.push(o);});this.raySurfaces=w.surfaces;this.rayScenery=w.scenery;}hits.length=0;
  const hit=this.ray.intersectObjects(roots,false,hits).find(h=>h.object.visible);
  if(hit)distance=Math.min(distance,Math.max(.18,hit.distance-.22));
  const c=this.collision??={};c.x=target.x;c.y=target.y;c.z=target.z;c.yaw=yaw;c.elev=elev;c.requested=this.distance;c.surfaces=w.surfaces;c.terrain=w.terrain;c.scenery=w.scenery;c.distance=distance;
  }
  // Closing immediately prevents clipping; returning slowly avoids a camera pop at a trunk.
  this.boom=this.boom===undefined?distance:Math.min(distance,this.boom+.08);
  w.walkCam.position.copy(target).addScaledVector(direction,this.boom);w.walkCam.lookAt(target);
  this.actor.root.visible=this.boom>.65;this.contact.visible=this.boom>.65;
 }
}
