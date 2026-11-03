const KEY='village-next-sound-enabled';
export class VillageSound{
 constructor(onUnavailable=()=>{}){
  this.enabled=true;try{this.enabled=localStorage.getItem(KEY)!=='0';}catch{}
  this.started=false;this.active=false;this.blocked=false;this.onUnavailable=onUnavailable;
  this.music=new Audio('assets/audio/sunny-village.mp3');this.music.loop=true;this.music.volume=.22;this.music.preload='none';
  this.effects=Object.fromEntries(['select','complete','remove'].map(name=>{const audio=new Audio(`assets/audio/${name}.mp3`);audio.volume=name==='select'?.26:.36;audio.preload='none';return[name,audio];}));
 }
 start(){this.started=true;this.blocked=false;this.active=true;this.apply();}
 update(active){if(this.active===active)return;this.active=active;this.apply();}
 toggle(){this.enabled=this.blocked||!this.enabled;this.blocked=false;this.started=true;try{localStorage.setItem(KEY,this.enabled?'1':'0');}catch{}this.apply();}
 apply(){
  if(!this.started||!this.enabled||!this.active){this.music.pause();for(const audio of Object.values(this.effects))audio.pause();return;}
  if(!this.blocked&&this.music.paused)this.music.play().catch(()=>{this.blocked=true;this.onUnavailable();});
 }
 effect(name){if(!this.started||!this.enabled||!this.active)return;const audio=this.effects[name];if(!audio)return;audio.currentTime=0;audio.play().catch(()=>{});}
}
