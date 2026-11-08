import {RIVER,SCENIC,pathX,riverX} from './trail.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function ambientMix(s,yaw=0){
  const water=clamp((s-135)/60,0,1)*(1-clamp((s-RIVER.end+15)/45,0,1));
  const falls=Math.pow(Math.max(0,1-Math.abs(s-SCENIC.waterfall.stop)/75),2);
  return {woodland:s<500?.68:.28,creek:water*.62*(1-falls*.55),falls:falls*.8,pan:clamp((riverX(s)-pathX(s))/9,-.65,.65)*Math.cos(yaw)};
}
// Blend the tail into the head once, before play; the loop boundary has no scheduling timer.
export function loopBuffer(context,source){
  const fade=Math.min(Math.floor(source.sampleRate*1.5),Math.floor(source.length/4)),length=source.length-fade;
  const result=context.createBuffer(source.numberOfChannels,length,source.sampleRate);let peak=0,sum=0;
  for(let ch=0;ch<source.numberOfChannels;ch++){
    const a=source.getChannelData(ch),out=result.getChannelData(ch);
    for(let i=0;i<length;i++){const t=i/fade;out[i]=i<fade?a[length+i]*(1-t)+a[i]*t:a[i];peak=Math.max(peak,Math.abs(out[i]));sum+=out[i]*out[i];}
  }
  const rms=Math.sqrt(sum/length/source.numberOfChannels),gain=Math.min(.09/Math.max(.00001,rms),.6/Math.max(.00001,peak),16);
  for(let ch=0;ch<result.numberOfChannels;ch++){const out=result.getChannelData(ch);for(let i=0;i<length;i++)out[i]*=gain;}
  return result;
}
export async function loadSoundscape(context,master){
  if(!context.decodeAudioData||typeof window==='undefined')return {};
  const layers={};await Promise.all(['woodland','creek','falls'].map(async name=>{
    try{const response=await fetch(new URL(`./assets/audio/${name}.mp3`,import.meta.url),{signal:AbortSignal.timeout(7000)});if(!response.ok)return;
      const buffer=loopBuffer(context,await context.decodeAudioData(await response.arrayBuffer()));
      const src=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();src.buffer=buffer;src.loop=true;gain.gain.value=0;
      src.connect(gain);gain.connect(pan);pan.connect(master);src.start();layers[name]={gain,pan,duration:buffer.duration};
    }catch{/* The existing synthesized ambience remains available offline or on decode failure. */}
  }));return layers;
}
