export function synth(kind,combo=1,rate=44100,lines=1){
 const durations={land:.12,clear:.62,defend:.36,send:.32,rise:.3,win:.7,start:.24,rotate:.07};
 const level=Math.min(4,Math.max(1,lines)),duration=kind==='clear'?.36+level*.095:kind==='hit'?.2+(level-1)*.065:durations[kind]||.16,n=Math.ceil(rate*duration),out=new Float32Array(n);
 const notes=[523.25,587.33,659.25,783.99,880,1046.5],freq=notes[Math.min(5,Math.max(0,combo-1))];let seed=731;
 for(let i=0;i<n;i++){
  const t=i/rate,attack=Math.min(1,t/.006),end=Math.min(1,(duration-t)/.025);seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
  let value=0;
  if(kind==='land')value=.24*Math.sin(2*Math.PI*185*t)*Math.exp(-t*45)+noise*.08*Math.exp(-t*100);
  else if(kind==='rotate')value=Math.sin(2*Math.PI*650*t)*Math.exp(-t*60)*.3;
  else if(kind==='clear'){
   value=(.7+level*.18)*Math.sin(2*Math.PI*((83-level*7)*t+2*(1-Math.exp(-28*t))))*Math.exp(-t*(24-level*2))+noise*(.35+level*.12)*Math.exp(-t*65);
   for(let hit=1;hit<level;hit++){const d=t-hit*.045;if(d>0)value+=.34*Math.sin(2*Math.PI*(95-level*8)*d)*Math.min(1,d/.006)*Math.exp(-d*25);}
   const d=t-.025;if(d>0){const env=Math.min(1,d/.009)*Math.exp(-d*7);value+=(Math.sin(2*Math.PI*freq*d)+.3*Math.sin(2*Math.PI*freq*2*d))*env*.7;}
   if(combo>=4){const d=t-.075;if(d>0)value+=.5*Math.sin(2*Math.PI*freq*1.5*d)*Math.min(1,d/.015)*Math.exp(-d*8);}
   if(combo>=2){const d=t-.09;if(d>0)value+=.55*Math.sin(2*Math.PI*82*d)*Math.min(1,d/.006)*Math.exp(-d*22);}
   if(combo>=6){const d=t-.14;if(d>0)value+=.4*Math.sin(2*Math.PI*freq*2*d)*Math.min(1,d/.015)*Math.exp(-d*9);}
  }
  else if(kind==='defend')value=(Math.sin(2*Math.PI*1174.66*t)*.65+Math.sin(2*Math.PI*783.99*t)*.4)*Math.exp(-t*17);
  else if(kind==='send')value=(noise*.25+Math.sin(2*Math.PI*(450*t+1100*t*t))*.25)*Math.sin(Math.PI*t/duration);
  else if(kind==='hit'){for(let hit=0;hit<level;hit++){const d=t-hit*.065;if(d>=0)value+=(Math.sin(2*Math.PI*(105*d+1.4*(1-Math.exp(-35*d))))*.8+noise*.24)*Math.min(1,d/.004)*Math.exp(-d*35);}}
  else if(kind==='rise')value=(Math.sin(2*Math.PI*145*t)*.7+noise*.08)*Math.exp(-t*23);
  else if(kind==='win'){for(let j=0;j<3;j++){const d=t-j*.12;if(d>=0)value+=.5*Math.sin(2*Math.PI*[523.25,659.25,783.99][j]*d)*Math.exp(-d*8);}}
  else value=Math.sin(2*Math.PI*523.25*t)*Math.exp(-t*15)*.6;
  out[i]=Math.tanh(value*1.5)*attack*end*.28;
 }
 return out;
}
export class Sound{
 constructor(){this.ctx=null;this.enabled=true;this.volume=.65;this.active=[];this.cache=new Map();}
 async unlock(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();if(!this.master){this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);}await this.ctx.resume();this.setVolume(this.volume);return true;}catch{return false;}}
 setVolume(v){this.volume=Number(v);if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.ctx.currentTime,.015);}
 setEnabled(v){this.enabled=v;this.setVolume(this.volume);}
 play(kind,combo=1,lines=1){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
  const ctx=this.ctx,key=kind+Math.min(6,combo)+':'+Math.min(4,Math.max(1,lines));let buffer=this.cache.get(key);
  if(!buffer){const data=synth(kind,combo,ctx.sampleRate,lines);buffer=ctx.createBuffer(1,data.length,ctx.sampleRate);buffer.copyToChannel(data,0);this.cache.set(key,buffer);}
  const startAt=ctx.currentTime+(this.active.length>=6?.016:0);
  if(this.active.length>=6){const old=this.active.shift();old.g.gain.setTargetAtTime(0,ctx.currentTime,.004);old.s.stop(ctx.currentTime+.015);}
  const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buffer;g.gain.value=.4;s.connect(g);g.connect(this.master);const voice={s,g};this.active.push(voice);s.onended=()=>{this.active=this.active.filter(x=>x!==voice);s.disconnect();g.disconnect();};s.start(startAt);
 }
}
