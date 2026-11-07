// Miniature-styled creek bridge, ported from reference-latest/bridge.mjs (rounded timber, Scenario wood / Adobe moss / Tripo rock
// assets) onto the full 720 m course: the reference's short-course span (59–65 m around 62) becomes BRIDGE.from-1 .. BRIDGE.to+1
// around BRIDGE.center = 210, the same span the previous box bridge covered. Visual only: halfWidth()/walkable() in trail.mjs
// (deck collision) are untouched, and world.mjs no longer draws its old bridge, so nothing is doubled.
import * as T from './vendor/three.module.js';
import {worldAt,pathSlope,pathX,riverX,terrain,BRIDGE} from './trail.mjs?v=forest-public-20261108';

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
    texture('bridge-wood.webp'),texture('bridge-moss.webp'),texture('bridge-rock.webp'),
    fetch(new URL('./assets/bridge-rock.json',import.meta.url)).then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).catch(()=>null)
  ]);
  const group=new T.Group();group.name='miniature-creek-bridge';group.userData.assets={wood:!!wood,moss:!!moss,rock:!!(rockMap&&data)};group.userData.span={from,to,center};scene.add(group);
  const timber=new T.MeshStandardMaterial({map:wood,color:wood?'#eee0c5':'#bea27b',roughness:.87,envMapIntensity:.18});
  const shaded=timber.clone();shaded.color.set('#d1c6ae');
  const pegMat=new T.MeshStandardMaterial({color:'#75634b',roughness:.92});
  const mossMat=new T.MeshStandardMaterial({map:moss,color:'#adb795',roughness:1,envMapIntensity:.1});
  function mesh(geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
  const plank=timberGeometry(3.05,.16,.34),post=timberGeometry(.27,1.14,.27,.045),cap=timberGeometry(.35,.12,.35,.025),peg=new T.SphereGeometry(.025,6,4);
  const plankTints=['#eee0c5','#e0d0b3','#ead9bc','#d9c9ad'].map(c=>{const m=timber.clone();m.color.set(c);return m;});
  for(let i=0,s=from;s<=to+.01;s+=.36,i++){
    const p=worldAt(s),m=mesh(plank,plankTints[i%4],p.x,p.y+.01,p.z);m.scale.set(Math.hypot(1,pathSlope(s)),1,Math.hypot(1,pathSlope(s)));m.rotation.y=-Math.atan(pathSlope(s));
  }
  const railSteps=Math.max(8,Math.round((to-from)*4));
  for(const side of [-1,1]){
    for(let s=from;s<=to+.01;s+=1.5){
      const p=worldAt(s,side*1.42),yaw=-Math.atan(pathSlope(s));
      mesh(post,shaded,p.x,p.y+.49,p.z).rotation.y=yaw;
      mesh(cap,timber,p.x,p.y+1.09,p.z).rotation.y=yaw;
      for(const h of [.37,.86])mesh(peg,pegMat,p.x-side*.15,p.y+h,p.z);
    }
    for(const height of [.37,.86]){
      const points=Array.from({length:railSteps+1},(_,i)=>{const s=from+(to-from)*i/railSteps,p=worldAt(s,side*1.42);return new T.Vector3(p.x,p.y+height+.018*Math.sin(i*.7),p.z);});
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(32,railSteps),.105,10,false),timber,0,0,0);
      // Rounded rail ends (kept from the previous bridge) so the tubes do not finish in a hollow cut.
      for(const e of [points[0],points.at(-1)])mesh(new T.SphereGeometry(.105,8,6),timber,e.x,e.y,e.z);
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
  return group;
}
