import {STRIDE} from './lib/gait.mjs?v=walk5-20261102';
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
  tick(time,s,moving,distance=0){
    const c=this.ctx;if(!c||c.state!=='running')return;
    const near=Math.exp(-Math.pow((s-85)/48,2));this.water.gain.setTargetAtTime(.07+near*.55,c.currentTime,.8);
    if(time>this.nextBird){this.chirp();this.nextBird=time+10+Math.random()*14;}
    const contact=Math.floor(distance/STRIDE*2);
    if(moving&&contact!==this.lastStep){
      this.lastStep=contact;const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();src.buffer=this.noise;
      f.type='lowpass';f.frequency.value=s>56&&s<68?800:350;g.gain.setValueAtTime(.09,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.11);
      src.connect(f);f.connect(g);g.connect(this.master);src.start(c.currentTime,Math.random()*2,.13);
    }
  }
}
