import * as THREE from './lib/three.module.min.js';
import {handRig} from './performance-motion.mjs';
import {createMusicianRig} from './musician-rig.mjs';

export function backingKey(midi) {
  if(!Number.isInteger(midi))return null;
  while(midi<48)midi+=12;
  while(midi>72)midi-=12;
  return midi;
}
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
// Walking moves the whole plane; seated hand motion is handled separately.
export const WALK_BOB=.02, WALK_SWAY=.008;
export const SEATED_LIFT={girl:.12,boy:.15};
const frames=[
  [168,10,428,512],[631,10,891,512],[1101,46,1385,510],
  [193,514,387,1008],[660,516,852,1008],[1098,567,1377,998]
];

export function createStorybookChild(scene,atlas,seatedGirl,seatedBoy,posesGirl,posesBoy,puppetGirl,puppetBoy) {
  const root=new THREE.Group();scene.add(root);
  const textures=frames.map(([x,y,r,b],i)=>{
    const source=i===2?seatedGirl:i===5?seatedBoy:atlas,t=source.clone();
    if(i===2){t.repeat.set(1/3,1);t.offset.set(2/3,0);}
    else if(i===5){t.repeat.set(766/1024,1380/1536);t.offset.set(126/1024,1-1453/1536);}
    else {t.repeat.set((r-x)/1536,(b-y)/1024);t.offset.set(x/1536,1-b/1024);}
    t.needsUpdate=true;return t;
  });
  // Keep one painting registered; only the two hand regions respond to notes.
  const playingTextures=[posesGirl,posesBoy].map((source,gender)=>source?(()=>{
    const t=source.clone(),width=gender?2172:1996,cell=gender?430:500;
    t.repeat.set(cell/width,1);t.offset.set((gender?257:96)/width,0);t.needsUpdate=true;return t;
  })():null);
  textures.push(...playingTextures.filter(Boolean));
  const material=new THREE.MeshBasicMaterial({map:textures[1],alphaTest:.22,side:THREE.DoubleSide,toneMapped:false,color:0xf9f5ea,transparent:true});
  const geometry=new THREE.PlaneGeometry(1,1,72,112).translate(0,.5,0);
  const rigs=[
    handRig(geometry,[{x:.29,y:.434,rx:.19,ry:.024,dy:-.012},{x:.32,y:.469,rx:.23,ry:.031,dy:-.014}]),
    handRig(geometry,[{x:.26,y:.464,rx:.21,ry:.026,dy:-.012},{x:.32,y:.512,rx:.23,ry:.031,dy:-.014}]),
  ],pressure=[0,0];
  const mesh=new THREE.Mesh(geometry,material);root.add(mesh);
  const puppets=[puppetGirl,puppetBoy].map((t,i)=>t?createMusicianRig(t,i?'boy':'girl'):null);
  for(const p of puppets)if(p){root.add(p.group);p.group.visible=false;textures.push(p.texture);}
  let avatar='girl',frame=-1,stride=0,weight=0,last=V(),placed=false,facingFront=false,profileSign=1;
  function setFrame(i){const n=i+(avatar==='boy'?3:0);if(n!==frame){frame=n;material.map=textures[n];}const [x,y,r,b]=frames[n];const height=i===2?1.35:1.4,aspect=i===2?(avatar==='boy'?766/1380:627/836):(r-x)/(b-y);mesh.scale.set(aspect*height,height,1);}
  return {root,mesh,textures,setFrame,
    resetPerformance(){pressure.fill(0);rigs[0]([]);},
    setEnvironment(tint){material.color.set(tint);puppets.forEach(p=>p?.setEnvironment(tint));},
    setCharacter(value){avatar=value==='boy'?'boy':'girl';frame=-1;},
    // Whole-sheet fade for sitting down; the stage decides visibility, the drawing is never altered.
    setOpacity(k){material.opacity=Math.max(0,Math.min(1,k));material.depthWrite=material.opacity===1;material.alphaTest=.22*Math.max(.001,material.opacity);puppets.forEach(p=>p?.setOpacity(material.opacity));},
    animate({dt,seated,moving,heading=0,camera,hands=[],playing=false,reduced=false}){
      const p=root.position;
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
        material.map=poses;frame=-1;
        mesh.scale.set(1.35*(avatar==='boy'?430/724:500/788),1.35,1);
      }
      for(let i=0;i<2;i++){
        const target=seated&&!reduced?(hands[i]?.hit||0):0;
        pressure[i]+=(target-pressure[i])*(1-Math.exp(-dt*(target>pressure[i]?32:12)));
        if(reduced||!seated||pressure[i]<.0001)pressure[i]=0;
      }
      rigs[avatar==='boy'?1:0](poses?pressure:[]);
      // Keep the profile facing the piano as the free camera crosses behind it.
      if(Math.sin(yaw)>.18)profileSign=-1;else if(Math.sin(yaw)<-.18)profileSign=1;
      if(seated)mesh.scale.x*=profileSign;
      mesh.position.x=seated?(mesh.scale.x<0?1:-1)*.03:0;
      // Walking uses a small whole-sheet lift and sway.
      mesh.position.y=seated?SEATED_LIFT[avatar]:weight*WALK_BOB*.5*(1-Math.cos(stride*2));
      mesh.rotation.z=weight*WALK_SWAY*Math.sin(stride);
      const puppet=puppets[avatar==='boy'?1:0];mesh.visible=!(seated&&puppet);
      puppets.forEach(p=>{if(p)p.group.visible=seated&&p===puppet;});
      if(seated&&puppet){puppet.group.scale.x=profileSign;puppet.group.position.set(mesh.position.x,SEATED_LIFT[avatar],0);puppet.pose({dt,hands,playing,reduced});}
    }
  };
}
