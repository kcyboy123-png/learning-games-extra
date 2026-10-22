import * as THREE from './lib/three.module.min.js';

export function backingKey(midi) {
  if(!Number.isInteger(midi))return null;
  while(midi<48)midi+=12;
  while(midi>72)midi-=12;
  return midi;
}
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
// The whole illustration may only bob and sway this much while walking; its vertices are never edited.
export const WALK_BOB=.02, WALK_SWAY=.008;
export const SEATED_LIFT={girl:.12,boy:.15};
const frames=[
  [168,10,428,512],[631,10,891,512],[1101,46,1385,510],
  [193,514,387,1008],[660,516,852,1008],[1098,567,1377,998]
];

export function createStorybookChild(scene,atlas,seatedGirl,seatedBoy,posesGirl,posesBoy) {
  const root=new THREE.Group();scene.add(root);
  const textures=frames.map(([x,y,r,b],i)=>{
    const source=i===2?seatedGirl:i===5?seatedBoy:atlas,t=source.clone();
    if(i===2){t.repeat.set(1/3,1);t.offset.set(2/3,0);}
    else if(i===5){t.repeat.set(766/1024,1380/1536);t.offset.set(126/1024,1-1453/1536);}
    else {t.repeat.set((r-x)/1536,(b-y)/1024);t.offset.set(x/1536,1-b/1024);}
    t.needsUpdate=true;return t;
  });
  // Equal-size UV windows align shoes and hips without stretching the painted limbs.
  const playingTextures=[posesGirl,posesBoy].map((source,gender)=>source?[0,1,2].map(i=>{
    const t=source.clone(),width=gender?2172:1996,cell=gender?430:500;
    t.repeat.set(cell/width,1);t.offset.set((gender?[257,861,1466]:[96,743,1458])[i]/width,0);t.needsUpdate=true;return t;
  }):null);
  textures.push(...playingTextures.flatMap(t=>t||[]));
  const material=new THREE.MeshBasicMaterial({map:textures[1],alphaTest:.4,side:THREE.DoubleSide,toneMapped:false,color:0xf9f5ea,transparent:true});
  const geometry=new THREE.PlaneGeometry(1,1,20,36).translate(0,.5,0);
  const mesh=new THREE.Mesh(geometry,material);root.add(mesh);
  let avatar='girl',frame=-1,stride=0,weight=0,last=V(),placed=false,facingFront=false,time=0,poseTime=0;
  function setFrame(i){const n=i+(avatar==='boy'?3:0);if(n!==frame){frame=n;material.map=textures[n];}const [x,y,r,b]=frames[n];const height=i===2?1.35:1.4,aspect=i===2?(avatar==='boy'?766/1380:627/836):(r-x)/(b-y);mesh.scale.set(aspect*height,height,1);}
  return {root,mesh,textures,setFrame,
    setCharacter(value){avatar=value==='boy'?'boy':'girl';frame=-1;},
    // Whole-sheet fade for sitting down; the stage decides visibility, the drawing is never altered.
    setOpacity(k){material.opacity=Math.max(0,Math.min(1,k));material.depthWrite=material.opacity===1;material.alphaTest=.4*Math.max(.001,material.opacity);},
    animate({dt,seated,moving,heading=0,camera,hands=[],playing=false,reduced=false}){
      time+=dt;const p=root.position;
      const distance=placed?Math.min(.15,p.distanceTo(last)):0;last.copy(p);placed=true;
      // The step rhythm follows real root travel only; a held stick against a wall does not bounce the picture.
      const walking=moving&&!seated&&!reduced&&distance>1e-6;
      stride+=distance*7.2;
      weight+=(Number(walking)-weight)*(1-Math.exp(-dt*9));
      // Sitting down and reduced motion end the walk effect immediately.
      if(seated||reduced||(!walking&&weight<.01)){weight=0;stride=0;}
      // Pure billboard: the flat cut always faces the camera; the heading only chooses the front or back drawing.
      const yaw=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
      const facing=Math.cos(heading-yaw);
      if(facing>.25)facingFront=true;else if(facing<-.25)facingFront=false;
      root.rotation.set(0,yaw,0);
      setFrame(seated?2:facingFront?0:1);
      const poses=playingTextures[avatar==='boy'?1:0];
      if(seated&&poses){
        poseTime=playing&&!reduced?poseTime+dt:0;
        const pose=[0,1,0,2][Math.floor(poseTime/.48)%4];
        material.map=poses[pose];frame=-1;
        mesh.scale.set(1.35*(avatar==='boy'?430/724:500/788),1.35,1);
      }else poseTime=0;
      // Keep the profile facing the piano as the free camera crosses behind it.
      if(seated)mesh.scale.x*=Math.sin(yaw)>=0?-1:1;
      mesh.position.x=seated?(mesh.scale.x<0?1:-1)*.03:0;
      // The drawing itself is never deformed: the whole sheet lifts a little at each step and sways a hair.
      mesh.position.y=seated?SEATED_LIFT[avatar]:weight*WALK_BOB*.5*(1-Math.cos(stride*2));
      mesh.rotation.z=weight*WALK_SWAY*Math.sin(stride);
      // shortcut: three complete painted poses suggest playing; exact finger-to-key motion needs a rigged character.
      if(seated&&!reduced)mesh.rotation.z=Math.sin(time*3)*.004*Math.max(0,...hands.map(h=>h.hit));
    }
  };
}
