import * as T from './vendor/three.module.js';
import {createSkinReader} from './lib/skin-reader.mjs';
import {footStep,STRIDE,STANCE} from './lib/gait.mjs?v=teacher-motion10-20261110';

const heroAssets=new Map(),heroMeshes=new Map();
async function loadCharacterMap(url){
  if(typeof createImageBitmap==='function')try{
    // Decode and flip off the render path; keep the original pixels and mipmaps.
    const image=await new T.ImageBitmapLoader().setOptions({imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'}).loadAsync(url);
    const map=new T.Texture(image);map.needsUpdate=true;return map;
  }catch{/* Older browsers retain the existing image loader. */}
  return new T.TextureLoader().loadAsync(url);
}
export async function loadCharacterAssets(id,peer=false){
  if(!['girl-a','girl-b','boy-a','boy-b','teacher-female','teacher-male','hero','teacher','friend'].includes(id))throw Error('Unknown character');
  const key=id+(peer?':peer':'');
  if(!heroAssets.has(key))heroAssets.set(key,(async()=>{
    const base=new URL('./assets/'+id+'-tripo',import.meta.url).href,version=id.startsWith('teacher-')?'?v=teacher-polish-20261111':'';
    let mesh=heroMeshes.get(id);if(!mesh){mesh=(async()=>{let packed=typeof DecompressionStream==='function';let response=await fetch(base+(packed?'.json.gz':'.json')+version,{signal:AbortSignal.timeout(15000)});if(packed&&response.status===404){packed=false;response=await fetch(base+'.json'+version,{signal:AbortSignal.timeout(15000)});}if(!response.ok)throw Error('Hero mesh unavailable');return packed?new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json():response.json();})().catch(error=>{heroMeshes.delete(id);throw error;});heroMeshes.set(id,mesh);}
    // Remote classmates share 2K maps; the selected child's close-up keeps its original 4K map.
    const [data,map]=await Promise.all([mesh,loadCharacterMap(base+(peer?'-peer':'')+'.webp'+version)]);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return {data,map};
  })().catch(error=>{heroAssets.delete(key);throw error;}));
  return heroAssets.get(key);
}
export async function loadHero(scene,id='girl-a',peer=false){
  if(!['girl-a','girl-b','boy-a','boy-b','teacher-female','teacher-male'].includes(id))throw Error('Unknown character');
  const adult=id.startsWith('teacher-');
  const [{data,map},walk]=await Promise.all([loadCharacterAssets(id,peer),adult?import('./lib/teacher-walk.mjs').then(m=>m.default):null]);
  const actor=createHero(scene,data,map,false,adult,walk);actor.root.name='tripo-'+id;return actor;
}
const geometryCache=new WeakMap(),materialCache=new WeakMap();

const contactPlane=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
let created=0;
// Activities that fold the legs (sit / crouch families). `seatBlend` eases in and out so standing up to walk no longer snaps
// the hip height; 'eat' sits, 'reach' crouches, both with the right arm doing something (arm IK below).
const SEATED={sit:'sit',eat:'sit',crouch:'crouch',reach:'crouch'};
export function createHero(scene,data,map=null,decorate=false,adult=false,walk=null){
  const stride=adult?1.30:STRIDE;
  const root=new T.Group();root.name='yellow-backpack-tripo';
  let geometry=geometryCache.get(data);if(!geometry){geometry=new T.BufferGeometry();
  for(const [key,size] of [['position',3],['normal',3],['uv',2],['skinWeight',4]])geometry.setAttribute(key,new T.Float32BufferAttribute(data[key],size));
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(data.skinIndex,4));geometry.setIndex(data.index);geometryCache.set(data,geometry);}
  let material=map&&materialCache.get(map);if(!material){material=new T.MeshPhysicalMaterial({map,color:'#f5efdf',roughness:.86,metalness:0,envMapIntensity:.18,sheen:.28,sheenColor:'#eadfc6',sheenRoughness:.85});
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    #ifdef USE_MAP
      float fabric=smoothstep(.6,.8,diffuseColor.g/max(diffuseColor.r,.001))*(1.-smoothstep(.55,.8,diffuseColor.b/max(diffuseColor.r,.001)));
      vec2 weave=vMapUv*650.;
      float aa=1.-smoothstep(.35,1.2,max(fwidth(weave.x),fwidth(weave.y)));
      float thread=sin(weave.x*6.283)*sin(weave.y*6.283)*aa;
      diffuseColor.rgb*=mix(vec3(1.),vec3(1.02,.96,.85)*(.98+.035*thread),fabric);
    #endif
  `);};material.customProgramCacheKey=()=> 'hiking-fabric-v1';if(map)materialCache.set(map,material);}
  const mesh=new T.SkinnedMesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);
  let contact;
  if(scene.userData.actorContact){contact=new T.Mesh(contactPlane,scene.userData.actorContact);contact.name='tripo-contact-shadow';contact.scale.set(.42,1,.32);contact.position.y=.012;root.add(contact);}
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
  for(const s of sides){s.upperLength=s.knee.rest.distanceTo(s.hip.rest);s.lowerLength=s.foot.rest.distanceTo(s.knee.rest);}
  scene.add(root);
  const soles=sides.map(({foot})=>{const ids=[],seen=new Set();for(let i=0;i<data.position.length/3;i++)if(data.position[i*3+1]<.075&&data.skinIndex.slice(i*4,i*4+4).some((id,k)=>id===foot.index&&data.skinWeight[i*4+k]>.25)){const key=[...data.position.slice(i*3,i*3+3),...data.skinIndex.slice(i*4,i*4+4),...data.skinWeight.slice(i*4,i*4+4)].join(',');if(!seen.has(key)){seen.add(key);ids.push(i);}}return ids;});
  const v=new T.Vector3(),forward=new T.Vector3(0,0,1),left=Math.sign(sides[0].hip.rest.x)||1,half=STRIDE*STANCE/2,seed=(created++)*1.7;
  // Body scale for hand targets: torso length (hips → head joint) in model units, so the same code fits child and teacher rigs.
  const H=Math.max(.2,head.rest.y-hips.rest.y);
  // Mouth in rest space (the head joint sits at the jaw; the mouth is a little above and in front of it). +z is forward.
  const mouth=head.rest.clone().add(new T.Vector3(0,(adult?.15:.10)*H,(adult?.25:.22)*H));
  const fingers=adult?bones.filter(b=>/Hand(Index|Middle|Ring|Pinky)[123]$/.test(b.name)):[];
  const walkBones=walk?.names.map(name=>bones.find(b=>b.name===name)),walkQ=new T.Quaternion(),walkNextQ=new T.Quaternion(),rootInverse=new T.Matrix4();
  const walkSoles=walk?soles.flatMap(ids=>ids.filter((_,i)=>i%Math.max(1,Math.floor(ids.length/32))===0)):[];
  let blend=0,previous=0,restBlend=0,seatBlend=0,seatKind='sit',armBlend=0,armKind=null,waveBlend=0;
  const identityQ=new T.Quaternion(),spineQ=new T.Quaternion(),pitchQ=new T.Quaternion(),pitchAxis=new T.Vector3(1,0,0),aimFrom=new T.Vector3(),aimTo=new T.Vector3();
  function aim(joint,child,direction,parentRotation=identityQ){
    const q=joint.aimQ||(joint.aimQ=new T.Quaternion());q.setFromUnitVectors(aimFrom.copy(child.rest).sub(joint.rest).normalize(),aimTo.copy(direction).normalize());
    joint.bone.quaternion.copy(parentRotation).invert().multiply(q);return q;
  }
  // Two-bone arm IK in rest space (same construction as the legs): the hand reaches `target`, the elbow bends toward `hint`.
  // Reuse per-actor scratch; pose math and joint results stay unchanged.
  const ikHip=new T.Vector3(),ikTarget=new T.Vector3(),ikDirection=new T.Vector3(),ikBend=new T.Vector3(),ikJoint=new T.Vector3(),ikDelta=new T.Vector3(),armDirection=new T.Vector3();
  const reachDirection=new T.Vector3(),reachBend=new T.Vector3(),reachElbow=new T.Vector3(),reachDelta=new T.Vector3(),handTarget=new T.Vector3(),handHint=new T.Vector3();
  const upperBefore=new T.Quaternion(),lowerBefore=new T.Quaternion(),seatBefore=new T.Quaternion(),steps=[null,null],soleOffsets=[0,0];
  // Rest-space geometry is unchanged by the hips translation (shoulder and target move together), so no offset is needed.
  function reach(s,target,hint,parentQ,weight=1){
    const shoulder=s.arm.rest,a=s.elbow.rest.distanceTo(s.arm.rest),b=s.hand.rest.distanceTo(s.elbow.rest);
    const direction=reachDirection.copy(target).sub(shoulder),d=T.MathUtils.clamp(direction.length(),.01,a+b-.00001);direction.normalize();
    const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
    const bend=reachBend.copy(hint).addScaledVector(direction,-hint.dot(direction)).normalize();
    const elbow=reachElbow.copy(shoulder).addScaledVector(direction,along).addScaledVector(bend,height);
    upperBefore.copy(s.arm.bone.quaternion);lowerBefore.copy(s.elbow.bone.quaternion);
    const upper=aim(s.arm,s.elbow,reachDelta.copy(elbow).sub(shoulder),parentQ);
    aim(s.elbow,s.hand,reachDelta.copy(target).sub(elbow),upper);
    if(weight<1){s.arm.bone.quaternion.slerp(upperBefore,1-weight);s.elbow.bone.quaternion.slerp(lowerBefore,1-weight);}
  }
  return {root,head:head.bone,spine,mesh,bones,sides,soles,mouth,H,pose(distance,moving,time,resting=false,reduced=false,slope=0,activity='look'){
    steps[0]=footStep(distance,0,stride);steps[1]=footStep(distance,1,stride);
    if(adult)for(const step of steps){step.lift*=.78;step.roll*=.55;}
    if(time<previous){blend=restBlend=seatBlend=armBlend=0;if(adult)waveBlend=0;}
    const waving=!moving&&['guide','greet','wave'].includes(activity);
    const dt=Math.max(0,Math.min(.05,time-previous));previous=time;
    if(adult)waveBlend+=(Number(waving)-waveBlend)*(reduced?1:1-Math.exp(-dt*8));
    blend+=(Number(moving)-blend)*(1-Math.exp(-dt*(adult?10:(moving?16:7))));
    restBlend+=(Number(resting&&!moving)-restBlend)*(reduced?1:1-Math.exp(-dt*(adult?5:6)));
    // Seat family eases in (sitting down) and out (standing up to walk) instead of switching with `moving`.
    const seatTarget=!moving&&SEATED[activity]?1:0;if(seatTarget)seatKind=SEATED[activity];
    seatBlend+=(seatTarget-seatBlend)*(reduced?1:1-Math.exp(-dt*(adult?4.8:6)));
    const armTarget=!moving&&['drink','eat','reach','pour'].includes(activity)?1:0;if(armTarget)armKind=activity;
    armBlend+=(armTarget-armBlend)*(reduced?1:1-Math.exp(-dt*7));
    for(const b of bones)b.quaternion.identity();
    const climb=T.MathUtils.clamp(slope,-.5,.5),live=reduced?0:1;
    if(contact)contact.rotation.x=-Math.atan(climb);
    // Stride cycle: 0 at left mid-stance, π at right mid-stance. Weight sits over the support foot (lateral shift), the body
    // rides highest at mid-stance and lowest at each double support (vertical cadence). Both are hip translations only, so the
    // foot targets (root space) and the stance-sole grounding below are untouched.
    const cycle=((((distance/stride)%1)+1)%1-.275)*Math.PI*2,weight=Math.cos(cycle)*blend*live,bob=Math.cos(cycle*2)*blend*live;
    hips.bone.position.copy(hips.rest);hips.bone.position.y-=((adult?.04:.035)+Math.abs(climb)*.12)*blend-bob*(adult?.004:.005);
    hips.bone.position.x+=weight*left*(adult?.008:.012);
    // Compensate each shoe's heel/toe roll before IK, instead of moving the whole body when support changes.
    for(let i=0;i<2;i++){const step=steps[i];
      const angle=-Math.atan(climb)+step.roll*blend,c=Math.cos(angle),sn=Math.sin(angle),foot=sides[i].foot.rest;let low=Infinity;
      for(const id of soles[i]){const y=data.position[id*3+1]-foot.y,z=data.position[id*3+2]-foot.z;low=Math.min(low,y*c-z*sn-climb*(y*sn+z*c));}
      soleOffsets[i]=Number.isFinite(low)?foot.y-climb*foot.z+low+.015:0;
    }
    // Longer steps must lower the pelvis before IK reaches its straight-leg limit.
    for(let i=0;i<2;i++){
      const s=sides[i],step=steps[i],z=step.z*blend;
      // Keep adult knees away from the straight-leg IK singularity at heel contact.
      const reach=s.upperLength+s.lowerLength-(adult?.025:.004);
      const dx=s.foot.rest.x*(adult?.78:1)-s.hip.rest.x-(hips.bone.position.x-hips.rest.x),dz=s.foot.rest.z+z-s.hip.rest.z;
      const targetY=s.foot.rest.y+climb*z+step.lift*(1+Math.abs(climb))*blend-soleOffsets[i];
      const ceiling=targetY+Math.sqrt(Math.max(.001,reach*reach-dx*dx-dz*dz))-(s.hip.rest.y-hips.rest.y);
      const join=Math.max(0,.025-Math.abs(hips.bone.position.y-ceiling))/.025;
      hips.bone.position.y=Math.min(hips.bone.position.y,ceiling)-join*join*.00625;
    }
    // Upper body: counter-swing (shoulders opposite to the hips' leading leg), a slight lean over the support leg, a lean into
    // the slope, and quiet breathing while standing. Applied to the one spine joint; arms are aimed against that rotation.
    const swing0=Math.cos(steps[0].phase*Math.PI*2-.08),torsoYaw=swing0*(adult?.04:.055)*blend*left*live;
    const breath=live*(1-blend)*(Math.sin(time*1.3+seed)*.012),lean=Math.atan(climb)*.3*blend;
    spineQ.identity();
    if(spine){spine.rotation.set(lean+breath+bob*.004+(adult?.06*seatBlend:0),torsoYaw,-weight*left*(adult?.014:.02));spineQ.copy(spine.quaternion);}
    for(let i=0;i<2;i++){
      const s=sides[i],step=steps[i],z=step.z*blend;
      const hip=ikHip.copy(s.hip.rest).add(ikDelta.copy(hips.bone.position).sub(hips.rest));
      const target=ikTarget.copy(s.foot.rest);if(adult)target.x*=.78;target.z+=z;target.y+=climb*z+step.lift*(1+Math.abs(climb))*blend-soleOffsets[i];
      const a=s.upperLength,b=s.lowerLength;
      const direction=ikDirection.copy(target).sub(hip),d=T.MathUtils.clamp(direction.length(),.01,a+b-.00001);direction.normalize();
      const along=(a*a-b*b+d*d)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
      const bend=ikBend.copy(forward).addScaledVector(direction,-forward.dot(direction)).normalize();
      const knee=ikJoint.copy(hip).addScaledVector(direction,along).addScaledVector(bend,height);
      const upper=aim(s.hip,s.knee,ikDelta.copy(knee).sub(hip));
      const lower=aim(s.knee,s.foot,ikDelta.copy(target).sub(knee),upper);
      s.foot.bone.quaternion.copy(lower).invert().multiply(pitchQ.setFromAxisAngle(pitchAxis,-Math.atan(climb)+step.roll*blend));
      const side=Math.sign(s.arm.rest.x),armPhase=step.phase*Math.PI*2,swing=-Math.cos(armPhase-.08)*(adult?.22:.27)*blend*(1-Math.abs(climb)*.35);
      armDirection.set(side*(adult?.09:.13),-1,swing+.02).applyQuaternion(spineQ);
      const armQ=aim(s.arm,s.elbow,armDirection,spineQ);
      aim(s.elbow,s.hand,armDirection.set(side*(adult?.055:.10),-1,swing+(adult?.17:.22)+.055*(1-Math.cos(armPhase-.35))*blend+restBlend*.16).applyQuaternion(spineQ),armQ);
      s.hand.bone.rotation.set(adult?1.05+(.025*Math.sin(armPhase-.4))*blend:(.03+.02*Math.sin(armPhase-.4))*blend,side*.06*blend,-side*.035*blend);
    }
    // Head: keeps looking ahead against the torso turn; idle looking (two slow drifts) and a breath nod only while standing.
    const idle=live*(1-blend);
    head.bone.rotation.y=restBlend*(adult?-.18:-.35)-torsoYaw*.5+idle*(Math.sin(time*.55+seed)*(adult?.035:.055)+Math.sin(time*.23+seed*2)*(adult?.025:.04));
    head.bone.rotation.x=restBlend*(activity==='observe'?(adult?.15:.23):(adult?-.04:-.10))+idle*Math.sin(time*.37+seed)*.015;
    if(spine)head.bone.rotation.x-=spine.rotation.x*.45*blend*live;
    root.updateMatrixWorld(true);skeleton.update();soleReader.update();
    // Ground the actual weighted shoe vertices after skinning, including sloped terrain.
    let low=Infinity;
    for(let i=0;i<2;i++)if(steps[i].lift===0||blend<.001)for(const id of soles[i]){soleReader.vertex(id,v);low=Math.min(low,v.y-climb*v.z);}
    if(Number.isFinite(low))hips.bone.position.y-=low+.015;
    if(seatBlend>.001){
      // Folded legs blended over the IK legs (slerp per joint) and a hip drop scaled by the blend, so sitting down and standing
      // up are gradual; the whole-sole re-grounding is weighted the same way.
      const sitting=seatKind==='sit';
      for(const side of sides){
        for(const [joint,x] of [[side.hip,sitting?-1.35:-.8],[side.knee,sitting?1.4:1.55],[side.foot,sitting?-.05:-.75]]){
          seatBefore.copy(joint.bone.quaternion);joint.bone.rotation.set(x,0,0);joint.bone.quaternion.slerp(seatBefore,1-seatBlend);
        }
      }
      hips.bone.position.y-=(sitting?.45:.3)*seatBlend;
      root.updateMatrixWorld(true);skeleton.update();soleReader.update();
      let low=Infinity;
      for(const sole of soles)for(const id of sole){soleReader.vertex(id,v);low=Math.min(low,v.y);}
      if(Number.isFinite(low))hips.bone.position.y-=(low+.015)*seatBlend;
    }
    if(adult&&waveBlend>.001){
      reach(sides[1],handTarget.set(-.40,head.rest.y+.08,head.rest.z+.12),handHint.set(-1,-.2,.2),spineQ,waveBlend);
      sides[1].hand.bone.rotation.x*=1-waveBlend;sides[1].hand.bone.rotation.z=(reduced?0:Math.sin(time*3)*.12)*waveBlend;
    }else if(!adult&&!moving&&(activity==='guide'||activity==='greet'||activity==='wave')){
      const side=sides[1];side.arm.bone.rotation.z=-1.05;
      side.elbow.bone.rotation.x=-.5;
      side.hand.bone.rotation.z=reduced?0:Math.sin(time*3)*.16;
    }
    if(adult&&seatKind==='sit'&&seatBlend>.001){for(const side of sides){const sign=Math.sign(side.arm.rest.x);reach(side,handTarget.set(sign*.25,hips.rest.y-.02,.28),handHint.set(sign,-.6,.2),spineQ,seatBlend*(1-armBlend));}}
    if(armBlend>.001&&armKind){
      // Hand actions. drink/eat: right hand to the mouth (flask / food), head tipped back a little for the sip. reach: crouched,
      // right hand down to the ground ahead (litter). pour: both hands forward at chest height (teacher's thermos and cup).
      const R=sides[1],L=sides[0],sr=Math.sign(R.arm.rest.x)||1,sl=Math.sign(L.arm.rest.x)||1;
      if(armKind==='drink'||armKind==='eat'){
        reach(R,handTarget.set(sr*.06*H,(adult?-.40:-.08)*H,-.02*H).add(mouth),handHint.set(sr,-.7,.15),spineQ,armBlend);
        head.bone.rotation.y*=1-armBlend;
        head.bone.rotation.x=(armKind==='drink'?(adult?-.10:-.16):(adult?.07:.12))*armBlend+head.bone.rotation.x*(1-armBlend);
      }else if(armKind==='reach'){
        reach(R,handTarget.set(sr*.25*H,.08,1.3*H),handHint.set(sr*.8,-.2,.6),spineQ,armBlend);
        head.bone.rotation.x=.42*armBlend+head.bone.rotation.x*(1-armBlend);
      }else{
        reach(R,handTarget.set(-sr*.22*H,-.28*H,.60*H).add(R.arm.rest),handHint.set(sr,-.6,.2),spineQ,armBlend);
        reach(L,handTarget.set(-sl*.18*H,-.40*H,.52*H).add(L.arm.rest),handHint.set(sl,-.6,.2),spineQ,armBlend);
        head.bone.rotation.x=.28*armBlend+head.bone.rotation.x*(1-armBlend);
      }
    }
    if(adult)for(const finger of fingers){const side=finger.name.includes('Left')?1:-1,joint=Number(finger.name.at(-1));finger.rotation.y=-side*((joint===2?.28:.18)+armBlend*.12)*(1-(side===-1?waveBlend:0));}
    if(walk&&blend>.001){
      const weight=blend*(1-seatBlend)*(1-armBlend),phase=((distance/walk.stride%1)+1)%1*walk.frames.length,i=Math.floor(phase),a=walk.frames[i],b=walk.frames[(i+1)%walk.frames.length];
      for(let k=0;k<walkBones.length;k++)if(walkBones[k]){walkQ.fromArray(a,k*4);walkNextQ.fromArray(b,k*4);walkQ.slerp(walkNextQ,phase-i);walkBones[k].quaternion.slerp(walkQ,weight);}
      hips.bone.position.lerp(ikTarget.copy(hips.rest),weight);
      root.updateMatrixWorld(true);soleReader.update();rootInverse.copy(root.matrixWorld).invert();let low=Infinity;
      for(const id of walkSoles){soleReader.vertex(id,v).applyMatrix4(rootInverse);low=Math.min(low,v.y-climb*v.z);}
      if(Number.isFinite(low))hips.bone.position.y-=(low+.015)*weight;
    }
    root.updateMatrixWorld(true);skeleton.update();
  }};
}

