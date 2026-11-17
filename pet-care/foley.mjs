// Quiet procedural foley; these are not recordings of real animals.
export function foley(type='touch',species='dog'){
 try{const ac=foley.ac??=new AudioContext();ac.resume();const now=ac.currentTime;if(now-(foley.last??-1)<.18)return;foley.last=now;
 const buffer=foley.noise??=(()=>{const b=ac.createBuffer(1,ac.sampleRate,ac.sampleRate),a=b.getChannelData(0);let seed=7123;for(let i=0;i<a.length;i++){seed=(seed*1664525+1013904223)>>>0;a[i]=seed/2147483648-1;}return b})();
 const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();source.buffer=buffer;
 const breath=type==='breath',step=type==='step',photo=type==='photo',duration=breath?.55:step?.09:photo?.065:.16;
 filter.type='lowpass';filter.frequency.value=breath?(species==='cat'?380:650):step?240:photo?3200:1100;
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(breath?.035:step?.045:photo?.055:.025,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 source.connect(filter);filter.connect(gain);gain.connect(ac.destination);source.start(now);source.stop(now+duration+.02);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }catch{}
}
