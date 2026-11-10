// audio.mjs — minimal synthesized ambience: wind, leaves, footsteps. Starts only after a user gesture; mute is remembered.
const SOUND_KEY='changyong-forest-sound';
export class Ambience{
 constructor(){this.ctx=null;this.tracks=[];let saved=null;try{saved=localStorage.getItem(SOUND_KEY);}catch{saved=null;}this.enabled=saved!=='off';this.walking=false;this.lastStep=0;document.addEventListener('visibilitychange',()=>this.apply());}
 get on(){return this.enabled;}
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem(SOUND_KEY,this.enabled?'on':'off');}catch{}if(this.enabled)this.unlock();this.apply();return this.enabled;}
 unlock(){if(!this.enabled)return;if(!this.ctx){try{this.build();}catch{this.ctx=null;return;}}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});this.apply();}
 build(){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('no audio');const ctx=new C();this.ctx=ctx;this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);
  const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noise.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b0=.997*b0+.0297*w;b1=.985*b1+.0125*w;b2=.95*b2+.05*w;d[i]=(b0+b1+b2)*.3;}this.noise=noise;
  const wind=ctx.createBufferSource();wind.buffer=noise;wind.loop=true;const wf=ctx.createBiquadFilter();wf.type='lowpass';wf.frequency.value=320;const wg=ctx.createGain();wg.gain.value=.5;this.windGain=wg;wind.connect(wf).connect(wg).connect(this.master);wind.start();
  const lfo=ctx.createOscillator();lfo.frequency.value=.07;const lg=ctx.createGain();lg.gain.value=180;lfo.connect(lg).connect(wf.frequency);lfo.start();
  const leaves=ctx.createBufferSource();leaves.buffer=noise;leaves.loop=true;leaves.playbackRate.value=1.6;const lf=ctx.createBiquadFilter();lf.type='bandpass';lf.frequency.value=2600;lf.Q.value=.8;const lgain=ctx.createGain();lgain.gain.value=.08;leaves.connect(lf).connect(lgain).connect(this.master);leaves.start();
  const lfo2=ctx.createOscillator();lfo2.frequency.value=.21;const lg2=ctx.createGain();lg2.gain.value=.05;lfo2.connect(lg2).connect(lgain.gain);lfo2.start();
  // Stream the long score rather than decoding a full track into mobile memory.
  for(const [file,volume] of [['garden-music.mp3',.32],['garden-nature.mp3',.65]]){
   const audio=new Audio(new URL('./assets/audio/'+file,import.meta.url).href);audio.loop=true;audio.preload='none';
   const gain=ctx.createGain();gain.gain.value=volume;ctx.createMediaElementSource(audio).connect(gain).connect(this.master);
   const track={audio,failed:false};this.tracks.push(track);
   if(file==='garden-nature.mp3')audio.addEventListener('playing',()=>this.windGain.gain.setTargetAtTime(.12,ctx.currentTime,.5));
   audio.addEventListener('error',()=>{track.failed=true;if(file==='garden-nature.mp3')this.windGain.gain.setTargetAtTime(.5,ctx.currentTime,.5);});
  }
 }
 apply(){if(!this.ctx)return;const active=this.enabled&&!document.hidden,t=this.ctx.currentTime;if(this.lastActive!==active){this.lastActive=active;this.master.gain.cancelScheduledValues(t);this.master.gain.setValueAtTime(this.master.gain.value,t);this.master.gain.linearRampToValueAtTime(active?.22:0,t+.6);}for(const {audio,failed} of this.tracks){if(active&&!failed){if(audio.paused)audio.play().catch(()=>{});}else audio.pause();}}
 // One soft footstep: filtered noise burst. Called by the walk loop at a cadence while moving.
 step(now){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;if(now-this.lastStep<.46)return;this.lastStep=now;const ctx=this.ctx;const s=ctx.createBufferSource();s.buffer=this.noise;s.playbackRate.value=.8+Math.random()*.3;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=700;const g=ctx.createGain();g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(.35,ctx.currentTime+.012);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);s.connect(f).connect(g).connect(this.master);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};s.start(ctx.currentTime,Math.random()*1.5,.15);}
}
