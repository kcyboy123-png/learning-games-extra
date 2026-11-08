import {ambientMix,loadSoundscape} from './soundscape.mjs?v=perf5-sound-20261108';
import {STRIDE} from './lib/gait.mjs?v=forest-full-qa-20261107';
import {BRIDGE,RIVER,sections} from './trail.mjs?v=forest-full-qa-20261107';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(s,a,b)=>{const t=clamp((s-a)/(b-a),0,1);return t*t*(3-2*t);};
// Water is loudest from the bridge approach to the shelter spring; wind takes over on the ridge and summit.
export const waterLevel=s=>.07+.55*smooth(s,140,195)*(1-smooth(s,RIVER.end-20,RIVER.end+20));
export const windLevel=s=>.015+.11*smooth(s,sections[6].from-20,sections[6].from+50);
export class ForestSound {
  constructor(){this.enabled=true;this.ctx=null;this.lastStep=null;this.nextBird=4;this.lastChirp=-10;this.lastShutter=-10;this.nextMix=0;this.ambience={};}
  prepare(){
    if(this.preparing)return this.preparing;
    this.preparing=(async()=>{
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      this.ctx=new AC();const c=this.ctx;
      await c.suspend();
      this.master=c.createGain();this.master.gain.value=.38;this.master.connect(c.destination);
      const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),a=b.getChannelData(0);let brown=0;
      for(let i=0;i<a.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;a[i]=brown*4;}
      this.noise=b;
      const src=c.createBufferSource();src.buffer=b;src.loop=true;
      const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1700;
      this.water=c.createGain();this.water.gain.value=.08;src.connect(f);f.connect(this.water);this.water.connect(this.master);src.start();
      const gust=c.createBufferSource();gust.buffer=b;gust.loop=true;gust.playbackRate.value=.6;
      const wf=c.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.5;
      this.wind=c.createGain();this.wind.gain.value=.015;gust.connect(wf);wf.connect(this.wind);this.wind.connect(this.master);gust.start();
      const leaves=c.createBufferSource();leaves.buffer=b;leaves.loop=true;leaves.playbackRate.value=.83;
      const lf=c.createBiquadFilter();lf.type='bandpass';lf.frequency.value=2100;lf.Q.value=.45;
      this.leaves=c.createGain();this.leaves.gain.value=.025;leaves.connect(lf);lf.connect(this.leaves);this.leaves.connect(this.master);leaves.start();
      this.ambience=await loadSoundscape(c,this.master);
    }
    })().catch(error=>{this.preparing=null;this.ctx?.close().catch(()=>{});this.ctx=null;throw error;});
    return this.preparing;
  }
  async start(){
    if(!this.enabled)return;
    await this.prepare();
    if(this.enabled&&this.ctx)await this.ctx.resume();
  }
  pause(){if(this.ctx?.state==='running')this.ctx.suspend().catch(()=>{});}
  async toggle(){this.enabled=!this.enabled;if(this.enabled)await this.start();else this.pause();return this.enabled;}
  chirp(){
    const c=this.ctx;if(!c||c.state!=='running'||c.currentTime-this.lastChirp<.8)return;this.lastChirp=c.currentTime;
    const base=1700+Math.random()*950,count=2+Math.floor(Math.random()*3),side=Math.random()*1.4-.7;
    for(let i=0;i<count;i++){const t=c.currentTime+i*(.14+Math.random()*.06),o=c.createOscillator(),g=c.createGain(),pan=c.createStereoPanner();pan.pan.value=side;
      o.frequency.setValueAtTime(base+i*110,t);o.frequency.exponentialRampToValueAtTime(base*1.6-i*70,t+.045);o.frequency.exponentialRampToValueAtTime(base*.94,t+.12);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.14);
      o.connect(g);g.connect(pan);pan.connect(this.master);o.start(t);o.stop(t+.15);o.onended=()=>{o.disconnect();g.disconnect();pan.disconnect();};
    }
  }
  shutter(){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise||c.currentTime-this.lastShutter<.25)return;this.lastShutter=c.currentTime;
    for(const [delay,level,pitch] of [[0,.3,1900],[.065,.18,900]]){const t=c.currentTime+delay,src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=this.noise;src.playbackRate.value=2.4;
      f.type='highpass';f.frequency.value=pitch;g.gain.setValueAtTime(level,t);g.gain.exponentialRampToValueAtTime(.0001,t+.045);src.connect(f);f.connect(g);g.connect(this.master);src.start(t,.6,.06);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};}
  }
  // Short dry rustle for leaves underfoot and the squirrel's bush.
  rustle(strength=1){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
    f.type='highpass';f.frequency.value=1400;g.gain.setValueAtTime(.07*strength,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.32);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.35);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};
  }
  // Hiking-life cues, all short and quiet: two swallows for a sip, one soft crunch for a bite, a hiss of hot water poured.
  sip(){
    const c=this.ctx;if(!c||c.state!=='running')return;
    for(let i=0;i<2;i++){const t=c.currentTime+.05+i*.24,o=c.createOscillator(),g=c.createGain();o.type='sine';
      o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(110,t+.09);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.12);
      o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.13);o.onended=()=>{o.disconnect();g.disconnect();};}
  }
  bite(){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
    f.type='bandpass';f.frequency.value=2400;f.Q.value=.8;g.gain.setValueAtTime(.06,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.09);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.1);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};
  }
  pour(seconds=2.2){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;src.loop=true;
    f.type='bandpass';f.frequency.value=1100;f.Q.value=.6;const t=c.currentTime;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.3);g.gain.setValueAtTime(.05,t+seconds-.4);g.gain.linearRampToValueAtTime(.0001,t+seconds);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(t,Math.random()*2);src.stop(t+seconds+.05);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};
  }
  tick(time,s,moving,distance=0,yaw=0){
    const c=this.ctx;if(!c||c.state!=='running')return;
    if(c.currentTime>=this.nextMix){
      this.nextMix=c.currentTime+.1;const mix=ambientMix(s,yaw);
      for(const [name,layer] of Object.entries(this.ambience)){layer.gain.gain.setTargetAtTime(mix[name],c.currentTime,.6);if(name!=='woodland')layer.pan.pan.setTargetAtTime(mix.pan,c.currentTime,.35);}
      this.water.gain.setTargetAtTime(waterLevel(s)*(this.ambience.creek?.12:1),c.currentTime,.8);
      if(this.leaves)this.leaves.gain.setTargetAtTime((s<500?.035:.016)*(1+.45*Math.sin(time*.23))*(this.ambience.woodland?.35:1),c.currentTime,1.2);
      if(this.wind)this.wind.gain.setTargetAtTime(windLevel(s)*(1+.35*Math.sin(time*.37)),c.currentTime,1.2);
    }
    if(time>this.nextBird){if(!this.ambience.woodland)this.chirp();const sunlit=s>sections[1].from&&s<sections[1].to;this.nextBird=time+(sunlit?6:10)+Math.random()*(sunlit?8:14);}
    const contact=Math.floor(distance/STRIDE*2);
    if(moving&&contact!==this.lastStep){
      this.lastStep=contact;const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
      const wood=s>BRIDGE.from-1&&s<BRIDGE.to+1||s>700;
      const stone=s>=256&&s<=344;f.type=wood?'lowpass':'bandpass';f.frequency.value=wood?850:stone?1250:650;if(f.Q)f.Q.value=.65;if(src.playbackRate)src.playbackRate.value=.92+Math.random()*.16;g.gain.setValueAtTime((wood?.13:stone?.10:.085)*(.9+Math.random()*.2),c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.11);
      src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.13);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};
      if(wood){const tap=c.createOscillator(),envelope=c.createGain(),t=c.currentTime;tap.frequency.value=135+(contact%2)*17;envelope.gain.setValueAtTime(.035,t);envelope.gain.exponentialRampToValueAtTime(.0001,t+.065);tap.connect(envelope);envelope.connect(this.master);tap.start(t);tap.stop(t+.07);tap.onended=()=>{tap.disconnect();envelope.disconnect();};}
    }
  }
}
