// Session-only render budget. Never writes to the child's saved game.
export class AdaptiveResolution {
 constructor(max=1.5){this.max=Math.min(1.5,max);this.scale=this.max;this.elapsed=0;this.frames=0;this.cooldown=4;}
 reset(){this.elapsed=0;this.frames=0;this.cooldown=4;}
 newScene(){if(this.trial)this.scale=this.trial.scale;this.trial=null;this.locked=false;this.reset();return this.scale;}
 sample(dt){
  if(!Number.isFinite(dt)||dt<=0||dt>.2){this.reset();return null;}
  if(this.cooldown>0){this.cooldown-=dt;return null;}
  this.elapsed+=dt;this.frames++;
  if(this.elapsed<2.5)return null;
  const mean=this.elapsed/this.frames,slow=mean>1/42;this.elapsed=0;this.frames=0;
  // A 30Hz battery-saving cap is not a GPU bottleneck. Undo a trial that
  // did not improve delivery cadence, then leave this session's quality alone.
  if(this.trial){const {before,scale}=this.trial;this.trial=null;if(mean>before*.90){this.scale=scale;this.locked=true;return scale;}}
  if(this.locked)return null;
  if(!slow||this.scale<=Math.min(1,this.max))return null;
  this.trial={before:mean,scale:this.scale};this.scale=Math.max(Math.min(1,this.max),this.scale-.25);this.cooldown=8;return this.scale;
 }
}
