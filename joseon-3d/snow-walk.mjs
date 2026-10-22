// Distance-driven steps: stopping or pressing against a wall cannot stamp or play sounds.
export function createStepEmitter(stride,emit){
 let remaining=stride,left=false;
 return (before,after,active=true)=>{
  const dx=after.x-before.x,dz=after.z-before.z,d=Math.hypot(dx,dz);
  if(!active||d>2){remaining=stride;return;}
  if(d<.00001)return;
  let travelled=remaining;
  while(travelled<=d){left=!left;emit({x:before.x+dx*travelled/d,z:before.z+dz*travelled/d,angle:Math.atan2(dx,dz),left});travelled+=stride;}
  remaining=travelled-d;
 };
}

export function createSnowWalk(THREE,scene){
 const capacity=384,matrix=new THREE.Object3D();
 function prints(cat){
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
  const g=canvas.getContext('2d');g.fillStyle='rgba(100,115,119,.56)';
  const oval=(x,y,w,h)=>{g.beginPath();g.ellipse(x,y,w,h,0,0,Math.PI*2);g.fill();};
  if(cat){oval(32,58,14,17);for(const [x,y] of [[13,36],[25,24],[40,25],[51,38]])oval(x,y,6,8);}
  else{oval(32,34,17,27);oval(32,76,12,12);g.clearRect(14,62,36,4);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(cat?.15:.22,cat?.19:.36),material,capacity);mesh.count=0;mesh.frustumCulled=false;mesh.userData.snowTracks=cat?'cat':'hero';scene.add(mesh);
  let cursor=0;
  return step=>{
   const spread=cat?.07:.13,side=step.left?1:-1;
   matrix.position.set(step.x+Math.cos(step.angle)*spread*side,.086,step.z-Math.sin(step.angle)*spread*side);
   matrix.rotation.set(-Math.PI/2,0,-step.angle);matrix.scale.set(1,1,1);matrix.updateMatrix();
   mesh.setMatrixAt(cursor,matrix.matrix);cursor=(cursor+1)%capacity;mesh.count=Math.min(capacity,mesh.count+1);mesh.instanceMatrix.needsUpdate=true;
  };
 }
 let context,master,buffer,muted=false,audible=false,lastSound=-1;
 function unlock(){
  if(muted)return;
  try{
   if(!context){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;context=new Audio();master=context.createGain();master.gain.value=audible?.55:0;master.connect(context.destination);
    buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.18),context.sampleRate);const a=buffer.getChannelData(0);let smooth=0;
    for(let i=0;i<a.length;i++){smooth=.72*smooth+.28*(Math.random()*2-1);a[i]=smooth;}
    if(typeof context.decodeAudioData==='function')fetch('assets/audio/snow-step.wav').then(r=>{if(!r.ok)throw new Error('snow audio');return r.arrayBuffer();}).then(a=>context.decodeAudioData(a)).then(decoded=>buffer=decoded).catch(()=>{});
   }
   if(context.state==='suspended')context.resume().catch(()=>{});
  }catch{/* Silent operation remains available when browser audio is unavailable. */}
 }
 function crunch(cat){
  if(!context||context.state!=='running'||muted||!audible)return;
  const t=context.currentTime;if(t-lastSound<.18)return;lastSound=t;
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;source.playbackRate.value=cat?1.4:.9+Math.random()*.2;
  filter.type='lowpass';filter.frequency.value=cat?1600:2400;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(cat?.025:.09,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+.15);
  source.connect(filter);filter.connect(gain);gain.connect(master);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(t);source.stop(t+.17);
 }
 const heroPrint=prints(false),catPrint=prints(true);
 const heroStep=createStepEmitter(.55,s=>{heroPrint(s);crunch(false);});
 const catStep=createStepEmitter(.29,s=>{catPrint(s);crunch(true);});
 function quiet(){audible=false;if(master)master.gain.setValueAtTime(0,context.currentTime);}
 return {unlock,quiet,isMuted:()=>muted,supported:()=>!!(globalThis.AudioContext||globalThis.webkitAudioContext),ready:()=>!!context&&context.state==='running',toggle(){muted=!muted;if(muted)quiet();else unlock();return muted;},update(before,after,catBefore,catAfter,active){
  const next=active&&!muted;if(master&&next!==audible)master.gain.setValueAtTime(next?.55:0,context.currentTime);audible=next;
  heroStep(before,after,active);catStep(catBefore,catAfter,active);
 }};
}
