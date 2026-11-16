// 짧은 피드백 소리(WebAudio, 라이브러리 없음). 음소거면 아무 소리도 내지 않는다. 배경음은 없다.
let ctx = null;
let enabled = false;
function ensure() {
  if (ctx) return ctx;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  return ctx;
}
export function setSoundEnabled(on) {
  enabled = !!on;
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
  o.connect(g).connect(c.destination);
  o.start(t0); o.stop(t0 + duration + 0.02);
}
export const sfx = {
  place() { tone(520, 0.08, {type: 'triangle', gain: 0.05}); },
  select() { tone(660, 0.06, {type: 'triangle', gain: 0.04}); },
  success() { tone(523, 0.12, {gain: 0.06}); tone(659, 0.12, {gain: 0.06, when: 0.1}); tone(784, 0.2, {gain: 0.07, when: 0.2}); },
  stamp() { tone(392, 0.1, {type: 'square', gain: 0.04}); tone(523, 0.25, {gain: 0.06, when: 0.1}); },
  wrong() { tone(220, 0.18, {type: 'triangle', gain: 0.05}); },
  step() { tone(440, 0.05, {type: 'triangle', gain: 0.03}); }
};
