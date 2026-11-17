// 짧은 피드백 소리. 우체국 iframe은 부모의 음소거·오디오 문맥을 함께 사용한다.
let ctx = null;
let master = null;
const voices=new Set();
function track(source){voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();};}
let enabled = false;
function ensure() {
  if (ctx) return ctx;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master=ctx.createGain();master.gain.value=enabled?1:0;master.connect(ctx.destination); } catch { ctx = null; }
  return ctx;
}
export function setSoundEnabled(on) {
  enabled = !!on;
  if(master)master.gain.setValueAtTime(enabled?1:0,ctx.currentTime);
  if(!enabled){for(const source of voices){try{source.stop();}catch{}}voices.clear();quietUntil=0;}
  if (enabled) { const c = ensure(); if (c && c.state === 'suspended') c.resume().catch(() => {}); }
}
export function isSoundEnabled() { return enabled; }
function tone(freq, duration, {type = 'sine', gain = 0.08, when = 0} = {}) {
  const c = ensure();
  if (!c || !enabled) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  const t0 = c.currentTime + when;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  o.connect(g).connect(master);
  track(o);o.start(t0); o.stop(t0 + duration + 0.02);
}
const sounds = {
  place() { tone(330, 0.065, {type: 'triangle', gain: 0.035}); rustle(); },
  select() { tone(660, 0.06, {type: 'triangle', gain: 0.04}); },
  success() { tone(523, 0.12, {gain: 0.06}); tone(659, 0.12, {gain: 0.06, when: 0.1}); tone(784, 0.2, {gain: 0.07, when: 0.2}); },
  stamp() { tone(160, 0.09, {type: 'sine', gain: 0.075}); rustle(); tone(784, 0.22, {gain: 0.035, when: 0.12}); },
  delivery() { tone(523, 0.18, {gain: 0.045}); tone(659, 0.18, {gain: 0.045, when: 0.15}); tone(784, 0.22, {gain: 0.045, when: 0.3}); tone(1047, 0.38, {gain: 0.035, when: 0.45}); },
  wrong() { tone(220, 0.18, {type: 'triangle', gain: 0.05}); },
  step() { tone(440, 0.05, {type: 'triangle', gain: 0.03}); }
};
function rustle(){
  if(!enabled)return;const c=ensure();if(!c)return;
  const b=c.createBuffer(1,Math.ceil(c.sampleRate*.12),c.sampleRate),data=b.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
  source.buffer=b;filter.type='bandpass';filter.frequency.value=1400;filter.Q.value=.5;gain.gain.value=.045;
  source.connect(filter).connect(gain).connect(master);track(source);source.start();
}
let last=-Infinity;
let quietUntil=0;
const feedbackDuration={success:420,stamp:360,delivery:850,wrong:200};
export const sfx=Object.fromEntries(Object.entries(sounds).map(([name,play])=>[name,()=>{
  if(window.parent!==window){try{const host=window.parent.postGame?.sound;if(host){host.unlock();host.sfx[name]();return;}}catch{}}
  if(!enabled||document.hidden)return;
  const now=performance.now();if(now-last<65||(!feedbackDuration[name]&&now<quietUntil))return;
  last=now;if(feedbackDuration[name])quietUntil=now+feedbackDuration[name];play();
}]));
