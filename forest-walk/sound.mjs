import {STRIDE} from './lib/gait.mjs?v=forest-public-20261108';
import {BRIDGE,RIVER,sections} from './trail.mjs?v=forest-public-20261108';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=(s,a,b)=>{const t=clamp((s-a)/(b-a),0,1);return t*t*(3-2*t);};
// Water is loudest from the bridge approach to the shelter spring; wind takes over on the ridge and summit.
export const waterLevel=s=>.07+.55*smooth(s,140,195)*(1-smooth(s,RIVER.end-20,RIVER.end+20));
export const windLevel=s=>.015+.11*smooth(s,sections[6].from-20,sections[6].from+50);
export class ForestSound {
  constructor(){this.enabled=true;this.ctx=null;this.lastStep=null;this.nextBird=4;}
  async start(){
    if(!this.enabled)return;
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      this.ctx=new AC();const c=this.ctx;
      this.master=c.createGain();this.master.gain.value=.32;this.master.connect(c.destination);
      const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),a=b.getChannelData(0);let brown=0;
      for(let i=0;i<a.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;a[i]=brown*4;}
      this.noise=b;
      const src=c.createBufferSource();src.buffer=b;src.loop=true;
      const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1700;
      this.water=c.createGain();this.water.gain.value=.08;src.connect(f);f.connect(this.water);this.water.connect(this.master);src.start();
      const gust=c.createBufferSource();gust.buffer=b;gust.loop=true;gust.playbackRate.value=.6;
      const wf=c.createBiquadFilter();wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.5;
      this.wind=c.createGain();this.wind.gain.value=.015;gust.connect(wf);wf.connect(this.wind);this.wind.connect(this.master);gust.start();
    }
    await this.ctx.resume();
  }
  pause(){if(this.ctx?.state==='running')this.ctx.suspend().catch(()=>{});}
  async toggle(){this.enabled=!this.enabled;if(this.enabled)await this.start();else this.pause();return this.enabled;}
  chirp(){
    const c=this.ctx;if(!c||c.state!=='running')return;
    for(let i=0;i<3;i++){const t=c.currentTime+i*.17,o=c.createOscillator(),g=c.createGain();
      o.frequency.setValueAtTime(1900+i*210,t);o.frequency.exponentialRampToValueAtTime(3300-i*140,t+.065);o.frequency.exponentialRampToValueAtTime(2200,t+.13);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.14);
      o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.15);
    }
  }
  // Short dry rustle for leaves underfoot and the squirrel's bush.
  rustle(strength=1){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
    f.type='highpass';f.frequency.value=1400;g.gain.setValueAtTime(.07*strength,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.32);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.35);
  }
  // Hiking-life cues, all short and quiet: two swallows for a sip, one soft crunch for a bite, a hiss of hot water poured.
  sip(){
    const c=this.ctx;if(!c||c.state!=='running')return;
    for(let i=0;i<2;i++){const t=c.currentTime+.05+i*.24,o=c.createOscillator(),g=c.createGain();o.type='sine';
      o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(110,t+.09);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.12);
      o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.13);}
  }
  bite(){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
    f.type='bandpass';f.frequency.value=2400;f.Q.value=.8;g.gain.setValueAtTime(.06,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.09);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.1);
  }
  pour(seconds=2.2){
    const c=this.ctx;if(!c||c.state!=='running'||!this.noise)return;
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;src.loop=true;
    f.type='bandpass';f.frequency.value=1100;f.Q.value=.6;const t=c.currentTime;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.3);g.gain.setValueAtTime(.05,t+seconds-.4);g.gain.linearRampToValueAtTime(.0001,t+seconds);
    src.connect(f);f.connect(g);g.connect(this.master);src.start(t,Math.random()*2);src.stop(t+seconds+.05);
  }
  tick(time,s,moving,distance=0){
    const c=this.ctx;if(!c||c.state!=='running')return;
    this.water.gain.setTargetAtTime(waterLevel(s),c.currentTime,.8);
    if(this.wind)this.wind.gain.setTargetAtTime(windLevel(s)*(1+.35*Math.sin(time*.37)),c.currentTime,1.2);
    if(time>this.nextBird){this.chirp();const sunlit=s>sections[1].from&&s<sections[1].to;this.nextBird=time+(sunlit?6:10)+Math.random()*(sunlit?8:14);}
    const contact=Math.floor(distance/STRIDE*2);
    if(moving&&contact!==this.lastStep){
      this.lastStep=contact;const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
      const wood=s>BRIDGE.from-1&&s<BRIDGE.to+1||s>700;
      f.type='lowpass';f.frequency.value=wood?800:350;g.gain.setValueAtTime(.09,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.11);
      src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.13);
    }
  }
}
