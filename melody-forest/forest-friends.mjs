import * as THREE from './lib/three.module.min.js';
import {noteGesture,bowStroke,shakerStroke,bowRate,phraseBreath} from './performance-motion.mjs';
import {createMusicianRig} from './musician-rig.mjs';

const FRIENDS=[
  {id:'flute',file:'flute-puppet-v1.png',x:-1.35,z:1.15,height:1.65,top:50,bottom:850},
  {id:'guitar',file:'guitar-puppet-v1.png',x:1.45,z:1.05,height:1.42,top:65,bottom:867},
  {id:'shaker',file:'shaker-puppet-v1.png',x:2.85,z:-.35},
  {id:'cello',file:'cello-puppet-v1.png',x:-1.65,z:2.15},
];
export const companionSpace=(x,z)=>FRIENDS.some(f=>Math.hypot((x-f.x)/.65,(z-f.z)/.7)<1);
export const companionInstruments=parts=>FRIENDS.filter(friend=>parts.some(part=>part.instrument===friend.id&&part.bars.some(bar=>bar.some(note=>note.pitch!==null)))).map(friend=>friend.id);
export function companionPose(note,time,reduced=false){
  if(!note||note.pitch===null||time<note.start||time>=note.end)return 0;
  return 1;
}
export const loadFriendArt=loader=>Promise.all(FRIENDS.map(friend=>loader.loadAsync('./assets/forest/'+friend.file).catch(()=>null)));

export function createForestFriends(scene,art,groundY,shadowMaterial,shadowGeometry){
  let lastTime=0,settleUntil=0,enabledCount=0;
  const friends=FRIENDS.map((definition,i)=>{
    const texture=art[i];if(!texture)return null;
    texture.colorSpace=THREE.SRGBColorSpace;
    const rig=createMusicianRig(texture,definition.id),mesh=rig.group;mesh.name='friend-'+definition.id;mesh.visible=false;rig.pose({dt:1,reduced:true});
    mesh.position.set(definition.x,groundY(definition.x,definition.z)+.015,definition.z);scene.add(mesh);
    const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial.clone());shadow.position.set(definition.x,groundY(definition.x,definition.z)+.017,definition.z);shadow.scale.set(definition.id==='cello'?.78:definition.id==='guitar'?.72:.55,1,definition.id==='cello'?.62:definition.id==='guitar'?.55:.36);shadow.visible=false;scene.add(shadow);
    return {definition,mesh,shadow,texture,rig,enabled:false,note:null,lastPitch:60,strokes:0,opacity:0,shadowOpacity:shadowMaterial.opacity};
  }).filter(Boolean);
  return {
    isMoving(time){return time<settleUntil||friends.some(f=>f.enabled&&(f.opacity<.995||(f.note?.pitch!=null&&time>=f.note.start&&time<f.note.end+.45)));},
    get count(){return enabledCount;},
    sync(parts){const enabled=companionInstruments(parts);enabledCount=0;for(const friend of friends){friend.enabled=enabled.includes(friend.definition.id);if(friend.enabled)enabledCount++;if(!friend.enabled)friend.note=null;}},
    note(id,pitch,start,duration){const friend=friends.find(friend=>friend.definition.id===id);if(friend){const previous=friend.note,joined=previous?.pitch!=null&&Math.abs(start-previous.end)<.04,bowPhase=joined?(previous.bowPhase??Math.PI/2)+(start-previous.start)*Math.PI*bowRate(previous):Math.PI/2;friend.note={pitch,start,end:start+duration,pluck:pitch===null?friend.strokes%2:friend.strokes++%2,bowPhase,bowFrom:joined?Math.cos(bowPhase):0};}},
    stop(){settleUntil=lastTime+.45;for(const friend of friends){friend.note=null;friend.strokes=0;friend.mesh.userData.playing=false;friend.mesh.userData.gesture=0;}},
    setEnvironment(tint){for(const friend of friends)friend.rig.setEnvironment(tint);},
    animate(camera,time,visible,reduced,dt=1/60){
      lastTime=time;
      for(const friend of friends){
        const previousOpacity=friend.opacity,target=Number(visible&&friend.enabled);friend.opacity=reduced?target:friend.opacity+(target-friend.opacity)*(1-Math.exp(-dt*12));
        const shown=visible&&friend.enabled;if(!shown)friend.opacity=0;friend.mesh.visible=friend.shadow.visible=!!shown;if(friend.opacity!==previousOpacity)friend.rig.setOpacity(friend.opacity);friend.shadow.material.opacity=friend.shadowOpacity*friend.opacity;if(!shown)continue;
        friend.mesh.rotation.y=Math.atan2(camera.position.x-friend.mesh.position.x,camera.position.z-friend.mesh.position.z);
        const playing=!!companionPose(friend.note,time),gesture=(friend.definition.id==='shaker'?shakerStroke:noteGesture)(friend.note,time,reduced);
        if(playing)friend.lastPitch=friend.note.pitch;
        friend.mesh.userData.playing=playing;friend.mesh.userData.gesture=gesture;
        friend.rig.pose({dt,time,breathStrength:phraseBreath(friend.note,time),pluck:friend.note?.pluck??0,pitch:friend.lastPitch,gesture,playing,reduced,bow:bowStroke(friend.note,time,reduced)});
      }
    },
  };
}
