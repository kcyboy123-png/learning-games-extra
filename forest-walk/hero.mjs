import * as T from './vendor/three.module.js';
import {createSkinReader} from './lib/skin-reader.mjs';
import {footStep,STRIDE,STANCE} from './lib/gait.mjs?v=forest-full-qa-20261107';

const heroAssets=new Map();
export async function loadCharacterAssets(id,peer=false){
  if(!['girl-a','girl-b','boy-a','boy-b','hero','teacher','friend'].includes(id))throw Error('Unknown character');
  const key=id+(peer?':peer':'');
  if(!heroAssets.has(key))heroAssets.set(key,(async()=>{
    const base=new URL('./assets/'+id+'-tripo',import.meta.url).href;
    const mesh=(async()=>{let packed=typeof DecompressionStream==='function';let response=await fetch(base+(packed?'.json.gz':'.json'),{signal:AbortSignal.timeout(15000)});if(packed&&response.status===404){packed=false;response=await fetch(base+'.json',{signal:AbortSignal.timeout(15000)});}if(!response.ok)throw Error('Hero mesh unavailable');return packed?new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json():response.json();})();
    // Remote classmates share 2K maps; the selected child's close-up keeps its original 4K map.
    const [data,map]=await Promise.all([mesh,new T.TextureLoader().loadAsync(base+(peer?'-peer':'')+'.webp')]);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return {data,map};
  })().catch(error=>{heroAssets.delete(key);throw error;}));
  return heroAssets.get(key);
}
export async function loadHero(scene,id='girl-a',peer=false){
  if(!['girl-a','girl-b','boy-a','boy-b'].includes(id))throw Error('Unknown character');
  const {data,map}=await loadCharacterAssets(id,peer),actor=createHero(scene,data,map);actor.root.name='tripo-'+id;return actor;
}
const geometryCache=new WeakMap();

let created=0;
// Activities that fold the legs (sit / crouch families). `seatBlend` eases in and out so standing up to walk no longer snaps
// the hip height; 'eat' sits, 'reach' crouches, both with the right arm doing something (arm IK below).
const SEATED={sit:'sit',eat:'sit',crouch:'crouch',reach:'crouch'};
export function createHero(scene,data,map=null,decorate=false){
  const root=new T.Group();root.name='yellow-backpack-tripo';
  let geometry=geometryCache.get(data);if(!geometry){geometry=new T.BufferGeometry();
  for(const [key,size] of [['position',3],['normal',3],['uv',2],['skinWeight',4]])geometry.setAttribute(key,new T.Float32BufferAttribute(data[key],size));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(data.skinIndex,4));geometry.setIndex(data.index);geometryCache.set(data,geometry);}
  const material=new T.MeshPhysicalMaterial({map,color:'#f5efdf',roughness:.86,metalness:0,envMapIntensity:.18,sheen:.28,sheenColor:'#eadfc6',sheenRoughness:.85});
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    #ifdef USE_MAP
      float fabric=smoothstep(.6,.8,diffuseColor.g/max(diffuseColor.r,.001))*(1.-smoothstep(.55,.8,diffuseColor.b/max(diffuseColor.r,.001)));
      vec2 weave=vMapUv*650.;
      float aa=1.-smoothstep(.35,1.2,max(fwidth(weave.x),fwidth(weave.y)));
      float thread=sin(weave.x*6.283)*sin(weave.y*6.283)*aa;
      diffuseColor.rgb*=mix(vec3(1.),vec3(1.02,.96,.85)*(.98+.035*thread),fabric);
    #endif
  `);};material.customProgramCacheKey=()=> 'hiking-fabric-v1';
  const mesh=new T.SkinnedMesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);
  let contact;
  if(scene.userData.actorContact){contact=new T.Mesh(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),scene.userData.actorContact);contact.name='tripo-contact-shadow';contact.scale.set(.42,1,.32);contact.position.y=.012;root.add(contact);}
  const rest=data.joints.map(j=>new T.Vector3(...j.position));
  const bones=data.joints.map(j=>{const b=new T.Bone();b.name=j.name;return b;});
  data.joints.forEach((j,i)=>{bones[i].position.copy(rest[i]);if(j.parent>=0){bones[i].position.sub(rest[j.parent]);bones[j.parent].add(bones[i]);}else mesh.add(bones[i]);});
  const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);
  const soleReader=createSkinReader(mesh);
  if(decorate&&data.rigidBackpack?.length){
    const joint=data.joints.findIndex(j=>j.name.endsWith(':Spine2'));
    if(joint>=0){
      const positions=[],normals=[],colors=[],brown=new T.Color('#7b4d27'),brass=new T.Color('#d2ad65'),stitch=new T.Color('#e2c58b');
      const front=(x,y)=>{let z=0;for(const i of data.rigidBackpack){const k=i*3;if(Math.abs(data.position[k]-x)<.045&&Math.abs(data.position[k+1]-y)<.055)z=Math.min(z,data.position[k+2]);}return (z||-.31)-.012;};
      function trim(x,y,z,w,h,d,color){const g=new T.BoxGeometry(w,h,d).toNonIndexed(),p=g.attributes.position,n=g.attributes.normal;
        for(let i=0;i<p.count;i++){positions.push(p.getX(i)+x-rest[joint].x,p.getY(i)+y-rest[joint].y,p.getZ(i)+z-rest[joint].z);normals.push(n.getX(i),n.getY(i),n.getZ(i));colors.push(color.r,color.g,color.b);}g.dispose();}
      for(const x of [-.125,.125]){
        const y=1.07,z=front(x,y);trim(x,y,z,.032,.15,.012,brown);
        for(const dx of [-.022,.022])trim(x+dx,y-.025,z-.011,.007,.048,.009,brass);
        for(const dy of [-.049,-.001])trim(x,y+dy,z-.011,.05,.007,.009,brass);
        trim(x,y-.025,z-.017,.006,.04,.007,brass);
        for(const side of [-1,1])for(let j=0;j<7;j++)trim(x+side*.010,y-.067+j*.020,z-.009,.0025,.006,.0025,stitch);
      }
      trim(0,.785,front(0,.785),.065,.032,.009,brown);
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingSphere();
      const detail=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.12}));detail.name='backpack-trim';detail.receiveShadow=true;bones[joint].add(detail);
    }
  }

  const get=name=>{const i=data.joints.findIndex(j=>j.name.replace(/^.*:/,'')===name);if(i<0)throw Error('Missing hero joint '+name);return {bone:bones[i],rest:rest[i],index:i};};
  const hips=get('Hips'),head=get('Head');
  // Lowest spine joint: the whole upper body (chest, shoulders, arms, head and the rigid backpack) turns with it as one block,
  // so the counter-swing never bends the backpack and the hips (parent of the leg IK) are never rotated.
  const spineIndex=data.joints.findIndex(j=>j.name.replace(/^.*:/,'')==='Spine'),spine=spineIndex>=0?bones[spineIndex]:null;
  const sides=['Left','Right'].map(prefix=>({hip:get(prefix+'UpLeg'),knee:get(prefix+'Leg'),foot:get(prefix+'Foot'),arm:get(prefix+'Arm'),elbow:get(prefix+'ForeArm'),hand:get(prefix+'Hand')}));
  scene.add(root);
  const soles=sides.map(({foot})=>{const ids=[],seen=new Set();for(let i=0;i<data.position.length/3;i++)if(data.position[i*3+1]<.075&&data.skinIndex.slice(i*4,i*4+4).some((id,k)=>id===foot.index&&data.skinWeight[i*4+k]>.25)){const key=[...data.position.slice(i*3,i*3+3),...data.skinIndex.slice(i*4,i*4+4),...data.skinWeight.slice(i*4,i*4+4)].join(',');if(!seen.has(key)){seen.add(key);ids.push(i);}}return ids;});
  const v=new T.Vector3(),forward=new T.Vector3(0,0,1),left=Math.sign(sides[0].hip.rest.x)||1,half=STRIDE*STANCE/2,seed=(created++)*1.7;
  // Body scale for hand targets: torso length (hips → head joint) in model units, so the same code fits child and teacher rigs.
  const H=Math.max(.2,head.rest.y-hips.rest.y);
  // Mouth in rest space (the head joint sits at the jaw; the mouth is a little above and in front of it). +z is forward.
  const mouth=head.rest.clone().add(new T.Vector3(0,.10*H,.22*H));
  let blend=0,previous=0,restBlend=0,seatBlend=0,seatKind='sit',armBlend=0,armKind=null;
  function aim(joint,child,direction,parentRotation=new T.Quaternion()){
    const q=new T.Quaternion().setFromUnitVectors(child.rest.clone().sub(joint.rest).normalize(),direction.clone().normalize());
    joint.bone.quaternion.copy(parentRotation).invert().multiply(q);return q;
  }
  // Two-bone arm IK in rest space (same construction as the legs): the hand reaches `target`, the elbow bends toward `hint`.
  // Rest-space geometry is unchanged by the hips translation (shoulder and target move together), so no offset is needed.
  function reach(s,target,hint,parentQ,weight=1){
    const shoulder=s.arm.rest,a=s.elbow.rest.distanceTo(s.arm.rest),b=s.hand.rest.distanceTo(s.elbow.rest);
    const direction=target.clone().sub(shoulder),d=T.MathUtils.clamp(direction.length(),.01,a+b-.00001);direction.normalize();
    const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
    const bend=hint.clone().addScaledVector(direction,-hint.dot(direction)).normalize();
    const elbow=shoulder.clone().addScaledVector(direction,along).addScaledVector(bend,height);
    const upperBefore=s.arm.bone.quaternion.clone(),lowerBefore=s.elbow.bone.quaternion.clone();
    const upper=aim(s.arm,s.elbow,elbow.clone().sub(shoulder),parentQ);
    aim(s.elbow,s.hand,target.clone().sub(elbow),upper);
    if(weight<1){s.arm.bone.quaternion.slerp(upperBefore,1-weight);s.elbow.bone.quaternion.slerp(lowerBefore,1-weight);}
  }
  return {root,head:head.bone,spine,mesh,bones,sides,soles,mouth,H,pose(distance,moving,time,resting=false,reduced=false,slope=0,activity='look'){
    if(time<previous)blend=restBlend=seatBlend=armBlend=0;
    const dt=Math.max(0,Math.min(.05,time-previous));previous=time;
    blend+=(Number(moving)-blend)*(1-Math.exp(-dt*(moving?12:9)));
    restBlend+=(Number(resting&&!moving)-restBlend)*(reduced?1:1-Math.exp(-dt*6));
    // Seat family eases in (sitting down) and out (standing up to walk) instead of switching with `moving`.
    const seatTarget=!moving&&SEATED[activity]?1:0;if(seatTarget)seatKind=SEATED[activity];
    seatBlend+=(seatTarget-seatBlend)*(reduced?1:1-Math.exp(-dt*6));
    const armTarget=!moving&&['drink','eat','reach','pour'].includes(activity)?1:0;if(armTarget)armKind=activity;
    armBlend+=(armTarget-armBlend)*(reduced?1:1-Math.exp(-dt*7));
    for(const b of bones)b.quaternion.identity();
    const climb=T.MathUtils.clamp(slope,-.5,.5),live=reduced?0:1;
    if(contact)contact.rotation.x=-Math.atan(climb);
    // Stride cycle: 0 at left mid-stance, π at right mid-stance. Weight sits over the support foot (lateral shift), the body
    // rides highest at mid-stance and lowest at each double support (vertical cadence). Both are hip translations only, so the
    // foot targets (root space) and the stance-sole grounding below are untouched.
    const cycle=((((distance/STRIDE)%1)+1)%1-.275)*Math.PI*2,weight=Math.cos(cycle)*blend*live,bob=Math.cos(cycle*2)*blend*live;
    hips.bone.position.copy(hips.rest);hips.bone.position.y-=(.035+Math.abs(climb)*.12)*blend-bob*.008;
    hips.bone.position.x+=weight*left*.012;
    // Upper body: counter-swing (shoulders opposite to the hips' leading leg), a slight lean over the support leg, a lean into
    // the slope, and quiet breathing while standing. Applied to the one spine joint; arms are aimed against that rotation.
    const swing0=footStep(distance,0).z/half,torsoYaw=swing0*.07*blend*left*live;
    const breath=live*(1-blend)*(Math.sin(time*1.3+seed)*.012),lean=Math.atan(climb)*.3*blend;
    const spineQ=new T.Quaternion();
    if(spine){spine.rotation.set(lean+breath+bob*.01,torsoYaw,-weight*left*.02);spineQ.copy(spine.quaternion);}
    for(let i=0;i<2;i++){
      const s=sides[i],step=footStep(distance,i),z=step.z*blend;
      const hip=s.hip.rest.clone().add(hips.bone.position.clone().sub(hips.rest));
      const target=s.foot.rest.clone();target.z+=z;target.y+=climb*z+step.lift*(1+Math.abs(climb))*blend;
      const a=s.knee.rest.distanceTo(s.hip.rest),b=s.foot.rest.distanceTo(s.knee.rest);
      const direction=target.clone().sub(hip),d=T.MathUtils.clamp(direction.length(),.01,a+b-.00001);direction.normalize();
      const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
      const bend=forward.clone().addScaledVector(direction,-forward.dot(direction)).normalize();
      const knee=hip.clone().addScaledVector(direction,along).addScaledVector(bend,height);
      const upper=aim(s.hip,s.knee,knee.clone().sub(hip));
      const lower=aim(s.knee,s.foot,target.clone().sub(knee),upper);
      s.foot.bone.quaternion.copy(lower).invert().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.atan(climb)+step.roll*blend));
      const side=Math.sign(s.arm.rest.x),swing=-step.z/half*.22*blend*(1-Math.abs(climb)*.35);
      const armDirection=new T.Vector3(side*.15,-1,swing+.02);
      const armQ=aim(s.arm,s.elbow,armDirection,spineQ);
      aim(s.elbow,s.hand,new T.Vector3(side*.10,-1,swing+.22+restBlend*.16),armQ);
    }
    // Head: keeps looking ahead against the torso turn; idle looking (two slow drifts) and a breath nod only while standing.
    const idle=live*(1-blend);
    head.bone.rotation.y=restBlend*-.35-torsoYaw*.5+idle*(Math.sin(time*.55+seed)*.055+Math.sin(time*.23+seed*2)*.04);
    head.bone.rotation.x=restBlend*(activity==='observe'?.23:-.10)+idle*Math.sin(time*.37+seed)*.015;
    root.updateMatrixWorld(true);skeleton.update();soleReader.update();
    // Ground the actual weighted shoe vertices after skinning, including sloped terrain.
    let low=Infinity;
    for(let i=0;i<2;i++)if(footStep(distance,i).lift===0||blend<.001)for(const id of soles[i]){soleReader.vertex(id,v);low=Math.min(low,v.y-climb*v.z);}
    if(Number.isFinite(low))hips.bone.position.y-=low+.015;
    if(seatBlend>.001){
      // Folded legs blended over the IK legs (slerp per joint) and a hip drop scaled by the blend, so sitting down and standing
      // up are gradual; the whole-sole re-grounding is weighted the same way.
      const sitting=seatKind==='sit';
      for(const side of sides){
        for(const [joint,x] of [[side.hip,sitting?-1.35:-.8],[side.knee,sitting?1.4:1.55],[side.foot,sitting?-.05:-.75]]){
          const ik=joint.bone.quaternion.clone();joint.bone.rotation.set(x,0,0);joint.bone.quaternion.slerp(ik,1-seatBlend);
        }
      }
      hips.bone.position.y-=(sitting?.45:.3)*seatBlend;
      root.updateMatrixWorld(true);skeleton.update();soleReader.update();
      let low=Infinity;
      for(const sole of soles)for(const id of sole){soleReader.vertex(id,v);low=Math.min(low,v.y);}
      if(Number.isFinite(low))hips.bone.position.y-=(low+.015)*seatBlend;
    }
    if(!moving&&(activity==='guide'||activity==='greet'||activity==='wave')){
      const side=sides[1];side.arm.bone.rotation.z=-1.05;
      side.elbow.bone.rotation.x=-.5;
      side.hand.bone.rotation.z=reduced?0:Math.sin(time*3)*.16;
    }
    if(armBlend>.001&&armKind){
      // Hand actions. drink/eat: right hand to the mouth (flask / food), head tipped back a little for the sip. reach: crouched,
      // right hand down to the ground ahead (litter). pour: both hands forward at chest height (teacher's thermos and cup).
      const R=sides[1],L=sides[0],sr=Math.sign(R.arm.rest.x)||1,sl=Math.sign(L.arm.rest.x)||1;
      if(armKind==='drink'||armKind==='eat'){
        reach(R,mouth.clone().add(new T.Vector3(sr*.06*H,-.08*H,-.02*H)),new T.Vector3(sr,-.7,.15),spineQ,armBlend);
        head.bone.rotation.y*=1-armBlend;
        head.bone.rotation.x=(armKind==='drink'?-.16:.12)*armBlend+head.bone.rotation.x*(1-armBlend);
      }else if(armKind==='reach'){
        reach(R,new T.Vector3(sr*.25*H,.08,1.3*H),new T.Vector3(sr*.8,-.2,.6),spineQ,armBlend);
        head.bone.rotation.x=.42*armBlend+head.bone.rotation.x*(1-armBlend);
      }else{
        reach(R,R.arm.rest.clone().add(new T.Vector3(-sr*.22*H,-.28*H,.60*H)),new T.Vector3(sr,-.6,.2),spineQ,armBlend);
        reach(L,L.arm.rest.clone().add(new T.Vector3(-sl*.18*H,-.40*H,.52*H)),new T.Vector3(sl,-.6,.2),spineQ,armBlend);
        head.bone.rotation.x=.28*armBlend+head.bone.rotation.x*(1-armBlend);
      }
    }
    root.updateMatrixWorld(true);skeleton.update();
  }};
}

