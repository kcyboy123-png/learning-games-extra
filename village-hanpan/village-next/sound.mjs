const KEY='village-next-sound-enabled',LEVELS='village-next-sound-levels';
const DEFAULTS={music:.28,effects:.45};
export class VillageSound{
 constructor(onUnavailable=()=>{}){
  this.enabled=true;try{this.enabled=localStorage.getItem(KEY)!=='0';}catch{}
  this.levels={...DEFAULTS};try{const saved=JSON.parse(localStorage.getItem(LEVELS));for(const key of Object.keys(DEFAULTS))if(typeof saved?.[key]==='number'&&Number.isFinite(saved[key]))this.levels[key]=Math.max(0,Math.min(1,saved[key]));}catch{}
  this.started=false;this.active=false;this.blocked=false;this.onUnavailable=onUnavailable;
  this.revision=0;this.lastEffect={};this.gains=new Map();this.ducked=false;
  this.music=new Audio('assets/audio/sunny-village-soft-v2.mp3');this.music.loop=true;this.music.preload='none';
  this.effects=Object.fromEntries(['select','complete','remove'].map(name=>{const audio=new Audio(`assets/audio/${name}-soft-v2.mp3`);audio.preload='none';return[name,audio];}));
  this.effects.complete.onended=()=>this.duck(false);this.mix();
 }
 get canPlay(){return this.started&&this.enabled&&this.active;}
 unlock(){
  // iPad ignores media-element volume; route through Web Audio when available.
  const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
  if(!this.context&&Context){
   try{this.context=new Context();for(const audio of [this.music,...Object.values(this.effects)]){const gain=this.context.createGain();gain.gain.value=0;this.context.createMediaElementSource(audio).connect(gain).connect(this.context.destination);this.gains.set(audio,gain);audio.volume=1;}}catch{this.blocked=true;this.onUnavailable();return;}
  }
  this.context?.resume().then(()=>{if(this.canPlay)this.mix();else this.context.suspend().catch(()=>{});}).catch(()=>{});
 }
 start(){this.started=true;this.blocked=false;this.active=true;for(const audio of Object.values(this.effects))audio.preload='auto';this.apply();}
 update(active){if(this.active===active)return;this.active=active;this.apply();}
 toggle(){this.enabled=this.blocked||!this.enabled;this.blocked=false;this.started=true;if(!this.levels.music&&!this.levels.effects){this.levels={...DEFAULTS};this.enabled=true;}this.remember();this.apply();}
 remember(){try{localStorage.setItem(KEY,this.enabled?'1':'0');localStorage.setItem(LEVELS,JSON.stringify(this.levels));}catch{}}
 setLevel(key,value){if(!(key in DEFAULTS)||!Number.isFinite(value))return;this.levels[key]=Math.max(0,Math.min(1,value));this.remember();if(!this.levels.effects)this.stopEffects();this.apply();}
 mix(){
  const volumes=new Map([[this.music,this.levels.music*(this.ducked?.55:1)],...Object.entries(this.effects).map(([name,audio])=>[audio,this.levels.effects*(name==='select'?.7:1)])]);
  for(const [audio,level] of volumes){const target=this.canPlay?level:0,gain=this.gains.get(audio);if(gain){const now=this.context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(gain.gain.value,now);gain.gain.linearRampToValueAtTime(target,now+.08);}else audio.volume=target;}
 }
 duck(value){clearTimeout(this.duckTimer);this.ducked=value;this.mix();if(value)this.duckTimer=setTimeout(()=>this.duck(false),2600);}
 stopEffects(){for(const audio of Object.values(this.effects)){audio.pause();audio.currentTime=0;}this.duck(false);}
 apply(){
  const revision=++this.revision;this.mix();
  if(!this.canPlay){this.music.pause();this.stopEffects();this.context?.suspend().catch(()=>{});return;}
  this.unlock();this.mix();
  if(!this.levels.music){this.music.pause();return;}
  if(!this.blocked&&this.music.paused)this.music.play().then(()=>{if(!this.canPlay||!this.levels.music)this.music.pause();}).catch(error=>{if(revision===this.revision&&this.canPlay&&error.name!=='AbortError'){this.blocked=true;this.onUnavailable();}});
 }
 effect(name){
  if(!this.canPlay||!this.levels.effects)return;const audio=this.effects[name];if(!audio)return;
  const now=performance.now(),gap={select:120,remove:250,complete:900}[name];
  if(now-(this.lastEffect[name]??-Infinity)<gap||name==='complete'&&!audio.paused)return;
  if(name==='select'&&(!this.effects.complete.paused||!this.effects.remove.paused))return;
  this.lastEffect[name]=now;if(name!=='select')this.effects.select.pause();if(name==='complete')this.duck(true);
  audio.currentTime=0;audio.play().then(()=>{if(!this.canPlay||!this.levels.effects)audio.pause();}).catch(()=>{if(name==='complete')this.duck(false);});
 }
}
