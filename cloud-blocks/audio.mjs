// A single music player survives UI redraws; only placement and completion make sounds.
export const BGM_URL = null;
export class Soundscape {
 constructor(){this.muted=false;try{this.muted=localStorage.getItem('changyong-cloud-blocks-muted')==='true';}catch{}this.last=-Infinity;this.music=BGM_URL?new Audio(BGM_URL):null;if(this.music){this.music.loop=true;this.music.preload='none';this.music.volume=.09;}document.addEventListener('visibilitychange',()=>{if(document.hidden)this.music?.pause();else if(this.unlocked)this.start();});}
 start(){if(this.muted||document.hidden)return;this.unlocked=true;if(this.music?.paused)this.music.play().catch(()=>{});}
 mute(value){this.muted=value;try{localStorage.setItem('changyong-cloud-blocks-muted',String(value));}catch{}if(value){this.music?.pause();this.context?.suspend().catch(()=>{});}else{this.context?.resume().catch(()=>{});this.start();}}
 effect(success=false){if(this.muted||document.hidden)return;this.start();try{
  this.context??=new (window.AudioContext||window.webkitAudioContext)();const c=this.context,t=c.currentTime;if(!success&&t-this.last<.085)return;this.last=t;c.resume().catch(()=>{});
  for(const [i,f] of (success?[659.25,987.77]:[220]).entries()){
   const o=c.createOscillator(),g=c.createGain(),at=t+i*.16,duration=success?.65:.09;
   o.type='sine';o.frequency.setValueAtTime(f,at);if(!success)o.frequency.exponentialRampToValueAtTime(115,at+.055);
   g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(success?.025:.045,at+.004);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
   o.connect(g);g.connect(c.destination);o.start(at);o.stop(at+duration+.01);o.onended=()=>{o.disconnect();g.disconnect();};
  }
 }catch{}}
}
