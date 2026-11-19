// Original quiet eight-bar theme; scheduled audio runs independently of rendering.
import {audioContext} from './audio.mjs';
const chords=[[48,55,59,64],[45,52,55,60],[53,57,60,64],[43,50,55,59]];
const melody=[76,79,74,null,72,76,71,null,69,72,76,null,74,71,67,null];
export function createSynthMusic(){
 let ac,bus,timer,next=0,beat=0,target=-1,enabled=false,sleeping=false;
 const voices=new Set();
 function note(midi,at,length,volume){
  const osc=ac.createOscillator(),gain=ac.createGain();osc.type='sine';osc.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.08);gain.gain.exponentialRampToValueAtTime(.00001,at+length);
  osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+length+.05);
 }
 function schedule(){
  if(ac.state!=='running')return;
  if(next<ac.currentTime)next=ac.currentTime+.05;
  while(next<ac.currentTime+.3){
   if(beat%4===0)for(const n of chords[Math.floor(beat/8)%4])note(n,next,6.1,.025);
   const m=melody[Math.floor(beat/2)%melody.length];if(beat%2===0&&m!==null)note(m,next,2.7,.065);
   next+=.94;beat=(beat+1)%32;
  }
 }
 function sync(){
  if(!ac)return;
  const level=enabled?(sleeping?.23:.55):0;
  if(level!==target){target=level;bus.gain.setTargetAtTime(level,ac.currentTime,.65);}
  if(enabled&&!timer){next=ac.currentTime+.08;schedule();timer=setInterval(schedule,200);}
  if(!enabled&&timer){clearInterval(timer);timer=null;for(const voice of voices)try{voice.stop(ac.currentTime+2);}catch{}}
 }
 return {
  unlock(){if(!enabled)return;try{if(!ac){ac=audioContext();bus=ac.createGain();bus.gain.value=0;bus.connect(ac.destination);}ac.resume().then(sync).catch(()=>{});}catch{}},
  set(on,rest=false){enabled=!!on;sleeping=!!rest;sync();},
  stop(){enabled=false;sync();}
 };
}


// Stream the original MP3; do not decode the whole song on the game thread.
export function createMusic(){
 let ac,bus,track,source,fallback,enabled=false,sleeping=false,close=false,duckUntil=0,pauseTimer,duckTimer,level=-1;
 function sync(){
  if(fallback){fallback.set(enabled,sleeping);return;}
  if(!track)return;
  const edge=Number.isFinite(track.duration)?Math.min(1,track.currentTime/2,Math.max(0,(track.duration-track.currentTime)/2)):0;
  const value=enabled?Math.min(sleeping?.004:close?.006:.02,Date.now()<duckUntil?.001:1)*edge:0;
  if(value!==level){level=value;bus.gain.setTargetAtTime(value,ac.currentTime,value<bus.gain.value?.012:.45);}
  if(enabled){clearTimeout(pauseTimer);pauseTimer=null;}
  else if(!track.paused&&!pauseTimer)pauseTimer=setTimeout(()=>{pauseTimer=null;if(!enabled)track.pause();},450);
 }
 function unlock(){
  if(!enabled)return;
  if(fallback){fallback.unlock();return;}
  try{
   if(!track){ac=audioContext();bus=ac.createGain();bus.gain.value=0;bus.connect(ac.destination);track=new Audio();track.preload='none';track.loop=true;track.src=new URL('./assets/pet-companion-suno.mp3',import.meta.url).href;
    source=ac.createMediaElementSource(track);source.connect(bus);track.addEventListener('timeupdate',sync);
    track.addEventListener('error',()=>{track.pause();source.disconnect();fallback=createSynthMusic();fallback.set(enabled,sleeping);fallback.unlock();},{once:true});
   }
   ac.resume().catch(()=>{});if(track.paused)track.play().then(sync).catch(()=>{});sync();
  }catch{}
 }
 return {
  unlock,
  set(on,rest=false,near=false){const resume=!enabled&&on;enabled=!!on;sleeping=!!rest;close=!!near;sync();if(resume&&track)unlock();},
  duck(){duckUntil=Date.now()+900;clearTimeout(duckTimer);sync();duckTimer=setTimeout(sync,950);},
  stop(){enabled=false;clearTimeout(duckTimer);sync();}
 };
}
