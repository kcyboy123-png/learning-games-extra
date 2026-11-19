const KEY='paper-flight-audio-v1';
const clamp=(v,fallback)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):fallback;
export class FlightAudio {
 constructor(){
  this.settings={muted:false,music:.32,effects:.65};this.phase='workshop';this.hidden=false;this.unlocked=false;this.error='';this.voices=new Map();
  try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')this.settings={muted:s.muted===true,music:clamp(s.music,.32),effects:clamp(s.effects,.65)};}catch{}
 }
 init(){
  if(this.ctx)return;
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!Context)throw new Error('이 브라우저에서는 게임 소리를 사용할 수 없어요.');
  this.ctx=new Context();this.master=this.ctx.createGain();this.fx=this.ctx.createGain();this.musicGain=this.ctx.createGain();
  this.master.gain.value=this.settings.muted||this.hidden?0:1;this.fx.gain.value=this.settings.effects;
  this.musicGain.gain.value=this.settings.music*(['charging','flying'].includes(this.phase)?.48:.75);
  this.fx.connect(this.master);this.musicGain.connect(this.master);this.master.connect(this.ctx.destination);
  this.music=new Audio(new URL('./assets/audio/paper-flight.mp3',import.meta.url));this.music.loop=true;this.music.preload='none';
  this.music.addEventListener('error',()=>{this.error='배경음을 불러오지 못했어요. 효과음은 계속 사용할 수 있어요.';this.onchange?.();});
  this.ctx.createMediaElementSource(this.music).connect(this.musicGain);
  const n=this.ctx.sampleRate;this.noise=this.ctx.createBuffer(1,n,this.ctx.sampleRate);const samples=this.noise.getChannelData(0);
  let seed=17619;for(let i=0;i<n;i++){seed=(1664525*seed+1013904223)>>>0;samples[i]=seed/2147483648-1;}
  this.apply();
 }
 unlock(){
  try{this.init();this.unlocked=true;if(!this.hidden&&!this.settings.muted){this.ctx.resume().then(()=>this.playMusic()).catch(()=>{});}}catch(e){this.error=e.message;this.onchange?.();}
 }
 playMusic(){if(this.unlocked&&!this.hidden&&!this.settings.muted&&this.settings.music>0)this.music?.play().catch(()=>{});}
 smooth(param,value,time=.06){param.setTargetAtTime(value,this.ctx.currentTime,time);}
 apply(){
  if(!this.ctx)return;
  this.smooth(this.master.gain,this.settings.muted||this.hidden?0:1,.015);
  this.smooth(this.fx.gain,this.settings.effects);
  const active=['charging','flying'].includes(this.phase),held=this.ctx.currentTime<this.duckUntil;
  this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
  this.smooth(this.musicGain.gain,this.settings.music*(active||held ? .48 : .75),.22);
  if(held&&!active)this.musicGain.gain.setTargetAtTime(this.settings.music*.75,this.duckUntil,.22);
  if(this.settings.muted||this.hidden||!this.settings.music)this.music.pause();else this.playMusic();
  if(this.settings.muted||this.hidden||!this.settings.effects)this.stopCharge();
 }
 configure(key,value){
  if(key==='muted')this.settings.muted=value===true;
  else if(key==='music'||key==='effects')this.settings[key]=clamp(value,this.settings[key]);else return;
  try{localStorage.setItem(KEY,JSON.stringify(this.settings));}catch{}
  if(this.settings.muted||!this.settings.effects)this.stopEffects();this.apply();if(!this.settings.muted)this.unlock();this.onchange?.();
 }
 setPhase(phase,hold=0){if(this.phase==='result'&&phase!=='result')this.stopEffects();this.phase=phase;this.duckUntil=(this.ctx?.currentTime??0)+hold;if(phase!=='charging')this.stopCharge();this.apply();}
 visibility(hidden){
  this.hidden=hidden;
  if(hidden){this.stopCharge();for(const node of this.voices.keys())try{node.stop();}catch{}this.apply();this.ctx?.suspend().catch(()=>{});}
  else {this.apply();if(this.unlocked&&!this.settings.muted)this.ctx?.resume().then(()=>this.playMusic()).catch(()=>{});}
 }
 stopEffects(){
  if(!this.ctx)return;const t=this.ctx.currentTime;
  for(const [node,gain] of this.voices){
   gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(0,t+.02);
   try{node.stop(t+.025);}catch{}
  }
 }
 get audible(){return this.ctx?.state==='running'&&!this.hidden&&!this.settings.muted&&this.settings.effects>0;}
 voice(node,gain,duration,at){
  node.connect(gain);gain.connect(this.fx);this.voices.set(node,gain);
  node.onended=()=>{node.disconnect();gain.disconnect();this.voices.delete(node);};node.start(at);node.stop(at+duration);
 }
 tone(hz,at,duration=.18,volume=.14){
  if(!this.audible)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=hz;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  this.voice(o,g,duration+.02,at);
 }
 rustle(duration,volume,high,at){
  if(!this.audible)return;const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noise;f.type='bandpass';f.frequency.value=high;f.Q.value=.65;
  s.connect(f);f.connect(g);g.connect(this.fx);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  this.voices.set(s,g);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();this.voices.delete(s);};s.start(at);s.stop(at+duration+.02);
 }
 charge(power){
  if(!this.audible||this.phase!=='charging')return;
  if(!this.charging){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';g.gain.value=0;o.connect(g);g.connect(this.fx);o.start();this.charging={o,g};}
  this.smooth(this.charging.o.frequency,230+power*3.1,.025);this.smooth(this.charging.g.gain,.018+power*.00018,.025);
 }
 stopCharge(){
  if(!this.charging)return;const {o,g}=this.charging;this.charging=null;const at=this.ctx.currentTime;
  g.gain.cancelScheduledValues(at);g.gain.setValueAtTime(g.gain.value,at);g.gain.linearRampToValueAtTime(0,at+.025);o.stop(at+.03);o.onended=()=>{o.disconnect();g.disconnect();};
 }
 effect(name,power=50){
  if(!this.audible)return;const t=this.ctx.currentTime;
  if(name==='fold')this.rustle(.12,.10,1700,t);
  if(name==='click')this.tone(660,t,.07,.055);
  if(name==='launch'){this.stopCharge();this.rustle(.24+power*.002,.18+power*.001,900+power*12,t);this.tone(440,t,.12,.065);this.tone(880,t+.055,.16,.045);}
  if(name==='land'){this.rustle(.16,.17,1100,t);this.tone(587.33,t+.10,.22,.12);this.tone(739.99,t+.23,.28,.10);}
  if(name==='win'){[587.33,739.99,880,1174.66].forEach((hz,i)=>this.tone(hz,t+.25+i*.14,.45,.15));[293.66,369.99,440].forEach(hz=>this.tone(hz,t+.70,.80,.065));}
 }
}
export const sound=new FlightAudio();
