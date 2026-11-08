// Miniature-styled creek bridge, ported from reference-latest/bridge.mjs (rounded timber, Scenario wood / Adobe moss / Tripo rock
// assets) onto the full 720 m course: the reference's short-course span (59–65 m around 62) becomes BRIDGE.from-1 .. BRIDGE.to+1
// around BRIDGE.center = 210, the same span the previous box bridge covered. Visual only: halfWidth()/walkable() in trail.mjs
// (deck collision) are untouched, and world.mjs no longer draws its old bridge, so nothing is doubled.
import * as T from './vendor/three.module.js';
import {worldAt,pathSlope,pathX,riverX,terrain,BRIDGE} from './trail.mjs?v=forest-full-qa-20261107';

export function timberGeometry(w,h,d,r=.035){
  const shape=new T.Shape();
  shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);
  shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const g=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSize:r*.4,bevelThickness:r,bevelSegments:2,curveSegments:3,steps:1});
  g.translate(0,0,-d/2+r);g.computeBoundingBox();return g;
}

function texture(file){return new Promise(resolve=>{
  const timer=setTimeout(()=>resolve(null),12000);
  new T.TextureLoader().load(new URL(`./assets/${file}`,import.meta.url).href,t=>{clearTimeout(timer);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;resolve(t);},undefined,()=>{clearTimeout(timer);resolve(null);});
});}

// Rock placements relative to the bridge centre: [metres from centre, bank side, scale] (reference: 56/60/67/71/75 around 62).
export const ROCKS=[[-6,-1,1.25],[-2,1,.95],[5,-1,1.5],[9,1,1.05],[13,-1,.8]];
export const span=(bridge=BRIDGE)=>({from:bridge.from-1,to:bridge.to+1,center:bridge.center});

export async function createBridge(scene,bridge=BRIDGE){
  const {from,to,center}=span(bridge);
  const [wood,moss,rockMap,data]=await Promise.all([
    texture('target-cedar.webp'),texture('target-moss.webp'),texture('bridge-rock.webp'),
    fetch(new URL('./assets/bridge-rock.json',import.meta.url)).then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).catch(()=>null)
  ]);
  const group=new T.Group();group.name='miniature-creek-bridge';group.userData.assets={wood:!!wood,moss:!!moss,rock:!!(rockMap&&data)};group.userData.span={from,to,center};scene.add(group);
  if(wood){wood.center.set(.5,.5);wood.rotation=Math.PI/2;wood.repeat.set(1.05,.85);}
  const timber=new T.MeshStandardMaterial({map:wood,color:wood?'#c6b69e':'#b6a58b',roughness:.87,envMapIntensity:.20});
  if(wood){timber.bumpMap=wood;timber.bumpScale=.024;}
  const shaded=timber.clone();shaded.color.set('#b9a384');
  if(wood){const upright=wood.clone();upright.rotation=0;upright.repeat.set(.8,1.2);shaded.map=shaded.bumpMap=upright;}
  const endCanvas=document.createElement('canvas');endCanvas.width=endCanvas.height=128;
  const ctx=endCanvas.getContext('2d');ctx.fillStyle='#bba17a';ctx.fillRect(0,0,128,128);
  for(let r=5;r<80;r+=5){ctx.strokeStyle=r%10?'#7f654b70':'#e4cfa788';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(59,68,r,r*.88,.2,0,Math.PI*2);ctx.stroke();}
  const endMap=new T.CanvasTexture(endCanvas);endMap.colorSpace=T.SRGBColorSpace;
  // Weathered end grain has hairline radial cracks, without extra geometry.
  for(let i=0;i<7;i++){const a=i*2.399;ctx.strokeStyle='#65523c70';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(59+Math.cos(a)*35,68+Math.sin(a)*35);ctx.lineTo(59+Math.cos(a)*72,68+Math.sin(a)*72);ctx.stroke();}
  const endMat=new T.MeshStandardMaterial({map:endMap,bumpMap:endMap,bumpScale:.006,color:'#d7c09a',roughness:.92});
  const endDisk=new T.CircleGeometry(.154,24).rotateX(-Math.PI/2);
  const pegMat=new T.MeshStandardMaterial({color:'#75634b',roughness:.92});
  const mossMat=new T.MeshStandardMaterial({map:moss,color:'#adb795',roughness:1,envMapIntensity:.1});
  function mesh(geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
  const plank=timberGeometry(3.05,.16,.34),post=new T.CylinderGeometry(.145,.17,1.14,18),cap=new T.CylinderGeometry(.165,.175,.09,18),peg=new T.SphereGeometry(.025,6,4);
  // Rounded board edges are slightly darker than the worn walking surface.
  const plankColor=[],pp=plank.attributes.position;
  for(let i=0;i<pp.count;i++){const top=T.MathUtils.smoothstep(pp.getY(i),.025,.075),edge=T.MathUtils.smoothstep(Math.abs(pp.getZ(i)),.11,.16),tone=.78+.22*top-.075*edge;plankColor.push(tone,tone,tone);}
  plank.setAttribute('color',new T.Float32BufferAttribute(plankColor,3));
  let plankOffset=0;
  const plankTints=['#d0b38e','#c3ad8c','#dcc6a3','#bba58a'].map(c=>{const m=timber.clone();m.color.set(c);m.vertexColors=true;m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBoard;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBoard=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vBoard;').replace('#include <color_fragment>',`#include <color_fragment>
      float edge=smoothstep(1.0,1.5,abs(vBoard.x));
      float wear=.5+.5*sin(vBoard.x*11.+sin(vBoard.z*37.)*.6);
      float split=pow(max(0.,sin(vBoard.x*22.+sin(vBoard.z*34.)*.7)),28.)*smoothstep(.8,1.45,abs(vBoard.x));
      float grain=sin(vBoard.x*63.+sin(vBoard.z*21.)*.9);
      float grainAA=1.-smoothstep(.45,1.4,fwidth(vBoard.x*63.));
      diffuseColor.rgb*=1.-edge*.22-(1.-wear)*.085-split*.13+grain*.018*grainAA;
    `);};m.customProgramCacheKey=()=> 'worn-board-v1';if(wood){m.map=wood.clone();m.map.offset.set(.17*plankOffset++,0);m.bumpMap=m.map;}return m;});
  for(let i=0,s=from;s<=to+.01;s+=.36,i++){
    const p=worldAt(s),m=mesh(plank,plankTints[i%4],p.x,p.y+.01+.006*Math.sin(i*2.1),p.z);m.scale.set(Math.hypot(1,pathSlope(s)),1,Math.hypot(1,pathSlope(s)));m.rotation.y=-Math.atan(pathSlope(s))+.004*Math.sin(i*1.7);
  }
  // One instanced mesh for the small recessed fasteners, keeping draw calls low.
  const nailCount=(Math.floor((to-from+.01)/.36)+1)*2,nails=new T.InstancedMesh(new T.SphereGeometry(.014,6,4),pegMat,nailCount),nailPose=new T.Object3D();
  let ni=0;for(let s=from;s<=to+.01;s+=.36)for(const side of [-1,1]){const p=worldAt(s,side*1.14);nailPose.position.set(p.x,p.y+.095,p.z);nailPose.scale.set(1,.22,1);nailPose.updateMatrix();nails.setMatrixAt(ni++,nailPose.matrix);}
  nails.receiveShadow=true;nails.computeBoundingSphere();group.add(nails);
  const railSteps=Math.max(8,Math.round((to-from)*4));
  for(const side of [-1,1]){
    for(let s=from;s<=to+.01;s+=1.5){
      const p=worldAt(s,side*1.42),yaw=-Math.atan(pathSlope(s));
      mesh(post,shaded,p.x,p.y+.49,p.z).rotation.y=yaw;
      mesh(cap,shaded,p.x,p.y+1.09,p.z).rotation.y=yaw;
      mesh(endDisk,endMat,p.x,p.y+1.136,p.z).rotation.y=yaw;
      for(const h of [.37,.86])mesh(peg,pegMat,p.x-side*.15,p.y+h,p.z);
    }
    for(const height of [.37,.86]){
      const points=Array.from({length:railSteps+1},(_,i)=>{const s=from+(to-from)*i/railSteps,p=worldAt(s,side*1.42);return new T.Vector3(p.x,p.y+height+.018*Math.sin(i*.7),p.z);});
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(32,railSteps),.085,10,false),timber,0,0,0);
      // Rounded rail ends (kept from the previous bridge) so the tubes do not finish in a hollow cut.
      for(const e of [points[0],points.at(-1)])mesh(new T.SphereGeometry(.085,8,6),timber,e.x,e.y,e.z);
    }
  }
  let rockGeometry;
  if(data){rockGeometry=new T.BufferGeometry();for(const [key,size] of [['position',3],['normal',3],['uv',2]])rockGeometry.setAttribute(key,new T.Float32BufferAttribute(data[key],size));rockGeometry.setIndex(data.index);rockGeometry.computeBoundingSphere();}
  else{rockGeometry=new T.IcosahedronGeometry(1,2);rockGeometry.scale(1,.55,.85);rockGeometry.translate(0,.55,0);}
  const stone=new T.MeshStandardMaterial({map:rockMap,color:'#c4cbb8',roughness:.93,envMapIntensity:.15});
  const patches=new T.SphereGeometry(1,12,6);
  for(const [ds,side,scale] of ROCKS){
    const s=center+ds,x=riverX(s)+side*3.3;
    if(Math.abs(x-pathX(s))<3.1)continue;
    const y=terrain(x,s),rock=mesh(rockGeometry,stone,x,y-.15,-s);rock.scale.set(scale,scale*.55,scale);rock.rotation.y=s*.8;
    const patch=mesh(patches,mossMat,x+side*.8,y+.035,-s+.5);patch.scale.set(scale*1.2,.07,scale*.9);patch.castShadow=false;
  }
  batchBridgeParts(group);
  group.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
  return group;
}


// Only the bridge's opaque, immutable direct children are batched; animated actors stay separate.
export function batchBridgeParts(group){
  const batches=new Map();
  for(const mesh of group.children){
    if(!mesh.isMesh||mesh.isInstancedMesh||mesh.material.transparent||Array.isArray(mesh.material))continue;
    const key=[mesh.geometry.uuid,mesh.material.uuid,mesh.castShadow,mesh.receiveShadow].join(':');
    if(!batches.has(key))batches.set(key,[]);batches.get(key).push(mesh);
  }
  for(const meshes of batches.values()){
    if(meshes.length<2)continue;
    const first=meshes[0],batch=new T.InstancedMesh(first.geometry,first.material,meshes.length);
    batch.name='bridge-parts';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    meshes.forEach((mesh,i)=>{mesh.updateMatrix();batch.setMatrixAt(i,mesh.matrix);group.remove(mesh);});
    batch.computeBoundingSphere();group.add(batch);
  }
}
