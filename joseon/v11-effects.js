'use strict';
(()=>{
let rain=null,stamps=0;
const enabled=G=>G.state.settings.sound&&G.state.settings.volume>0&&!document.hidden;
function context(G){G.audio||=new (window.AudioContext||window.webkitAudioContext)();return G.audio;}
function stopRain(){
 if(!rain)return;
 const old=rain;rain=null;clearInterval(old.timer);
 const t=old.ctx.currentTime;old.gain.gain.cancelScheduledValues(t);old.gain.gain.setTargetAtTime(0,t,.045);
 old.source.stop(t+.2);old.source.onended=()=>{old.source.disconnect();old.filter.disconnect();old.gain.disconnect();};
}
function startRain(root,G){
 if(rain?.root===root){rain.sync();return;}
 stopRain();
 if(!enabled(G))return;
 try{
  const a=context(G);a.resume().catch(()=>{});
  const buffer=a.createBuffer(1,a.sampleRate*4,a.sampleRate),d=buffer.getChannelData(0);
  // Soft broadband rain with scattered droplets, generated locally once per rainy scene.
  let low=0;for(let i=0;i<d.length;i++){const white=Math.random()*2-1;low=.96*low+.04*white;d[i]=white*.18+low*1.8;}
  for(let k=0;k<95;k++){const at=Math.floor(Math.random()*(d.length-1400)),freq=1000+Math.random()*1800;for(let j=0;j<1400;j++)d[at+j]+=.14*Math.sin(j*freq*2*Math.PI/a.sampleRate)*Math.exp(-j/170);}
  const source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();
  source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=5800;
  source.connect(filter);filter.connect(gain);gain.connect(a.destination);gain.gain.value=0;source.start();
  const state={root,ctx:a,source,filter,gain,timer:null,sync(){
   if(!root.isConnected||!G.modal.open||G.current!==3||G.draft(3).play.step!==2){stopRain();return;}
   const volume=enabled(G)?G.state.settings.volume*.45:0;
   gain.gain.setTargetAtTime(volume,a.currentTime,.13);
   root.dataset.rainAudio=volume>0?'playing':'muted';
  }};
  rain=state;state.sync();state.timer=setInterval(state.sync,180);
 }catch(_){stopRain();}
}
function prepare(G,count){
 if(!enabled(G))return;
 try{
  const a=context(G);a.resume().catch(()=>{});const t=a.currentTime;
  const buffer=a.createBuffer(1,Math.ceil(a.sampleRate*.12),a.sampleRate),d=buffer.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(a.sampleRate*.015));
  const source=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain(),tone=a.createOscillator(),body=a.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1250+count*170;filter.Q.value=.9;
  gain.gain.value=G.state.settings.volume*.4;source.connect(filter);filter.connect(gain);gain.connect(a.destination);source.start(t);
  tone.frequency.setValueAtTime(210+count*35,t);tone.frequency.exponentialRampToValueAtTime(90,t+.1);body.gain.setValueAtTime(G.state.settings.volume*.16,t);body.gain.exponentialRampToValueAtTime(.0001,t+.16);tone.connect(body);body.connect(a.destination);tone.start(t);tone.stop(t+.17);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};tone.onended=()=>{tone.disconnect();body.disconnect();};stamps++;
 }catch(_){}
}
window.JOSEON_FX11={rain:startRain,stopRain,prepare,snapshot:()=>({rain:!!rain,rainGain:rain?.gain.gain.value||0,stamps})};
document.addEventListener('visibilitychange',()=>rain?.sync());addEventListener('pagehide',stopRain);
})();
