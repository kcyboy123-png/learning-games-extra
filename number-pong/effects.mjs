// 번호퐁 친구들 · 발사 연출 (DOM은 인자로 받아 Node 시험이 가능하다)
// 배경 전체는 절대 움직이지 않는다. 움직이는 것은 왼쪽 아래 배우(친구+대포) 스프라이트, 발사체, 숫자 뒤 결과 장식뿐이다.
// 흐름: 발사 → 배우 4프레임(발사/반동 → 우스꽝 회복 → 깜빡/정돈 → 대기) + 발사체가 숫자 중심으로 날아감
//      → 도착 시각(--travel)에 테마 장식이 숫자 뒤에서 열림 → hold 뒤 전부 정리.
// 번호는 준비 동작과 비행이 끝나는 순간 표시한다.
// DOM 측정(getBoundingClientRect)은 발사 때 한 번뿐이고, 그 뒤는 CSS 애니메이션이 맡는다.

export const PREPARE_MS = 150;
export const FX = Object.freeze({
  // muzzle: 발사체가 나오는 자리(배우 상자 너비·높이 대비 비율). 햄찌는 입, 나머지는 포구.
  // lift: 포물선 높이(무대 높이 대비). travel: 비행 ms. hold: 연출 전체 정리 시각 ms. drop: 당근 떨어질 확률.
  hamster: Object.freeze({ muzzle: [0.66, 0.42], lift: 0.10, travel: 280, hold: 2900, drop: 0 }),
  penguin: Object.freeze({ muzzle: [0.91, 0.57], lift: 0.26, travel: 480, hold: 2800, drop: 0 }),
  rabbit:  Object.freeze({ muzzle: [0.83, 0.53], lift: 0.08, travel: 220, hold: 2600, drop: 0.35 })
});

const LEAF_COUNT = 6;
const SNOW_CHIPS = 14;

// 무대 좌표(px)로 바꾼 출발점·도착점·포물선 값. 순수 함수라 따로 시험한다.
export function computeAnchors(spec, stage, actor, number) {
  const x0 = actor.left - stage.left + actor.width * spec.muzzle[0];
  const y0 = actor.top - stage.top + actor.height * spec.muzzle[1];
  const x1 = number.left - stage.left + number.width / 2;
  const y1 = number.top - stage.top + number.height / 2;
  const angle = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  return { x0, y0, x1, y1, lift: stage.height * spec.lift, angle, nw: number.width, nh: number.height };
}

export function createEffects({
  stage, actor, fx, number, reducedMotion = { matches: false },
  doc = globalThis.document, timers = globalThis, random = Math.random, sound = true
} = {}) {
  let timer = 0;
  let extras = [];      // 배우 상자에 덧붙인 장식(당근 떨어짐)
  let audio = null;
  let playing = null;
  const samples = {};
  if (sound && typeof globalThis.Audio === 'function') {
    for (const id of Object.keys(FX)) {
      const sample = new globalThis.Audio(`assets/suno-${id}-launch-v1.mp3`);
      sample.preload = 'auto'; sample.volume = 0.45;
      samples[id] = sample;
    }
  }

  const px = n => `${Math.round(n * 100) / 100}px`;
  const make = (tag, className) => { const node = doc.createElement(tag); node.className = className; return node; };

  // 지금 도는 연출을 모두 지운다. 다음 발사·테마 변경·움직임 줄이기 전환에서 호출한다.
  function clear() {
    if (timer) { timers.clearTimeout(timer); timer = 0; }
    if (playing) { playing.pause(); playing = null; }
    actor.classList.remove('firing');
    fx.replaceChildren();
    for (const node of extras) node.remove();
    extras = [];
  }

  // 결과 장식: 숫자 뒤(.fx는 .board보다 먼저 그려진다)에서 열리고 디지트는 가리지 않는다.
  function buildHit(themeId, a) {
    const hit = make('b', `hit ${themeId}`);
    hit.append(make('i', 'puff'));
    if (themeId === 'hamster') {
      // 씨앗이 숫자에 닿아 껍질 두 쪽이 좌우로 갈라진다
      hit.append(make('i', 'shell left'), make('i', 'shell right'));
    } else if (themeId === 'penguin') {
      // 눈뭉치가 숫자 둘레에 눈도장을 찍고 조각이 튄다
      const stamp = make('i', 'stamp');
      for (let i = 0; i < 2; i++) {
        const spray = make('i', 'snow-flurry');
        spray.style.setProperty('--turn', `${i * 165}deg`);
        stamp.append(spray);
      }
      hit.append(stamp);
      for (let i = 0; i < SNOW_CHIPS; i++) {
        const chip = make('i', 'chip');
        const ang = (i / SNOW_CHIPS) * Math.PI * 2 - Math.PI / 2 + (random() - 0.5) * 0.7;
        const r = 1 + random() * 0.6;
        chip.style.setProperty('--cx', `${(Math.cos(ang) * r).toFixed(3)}`);
        chip.style.setProperty('--cy', `${(Math.sin(ang) * r).toFixed(3)}`);
        hit.append(chip);
      }
    } else {
      // 당근 로켓이 터지며 초록 잎이 숫자 둘레에 활짝 열린다
      for (let i = 0; i < LEAF_COUNT; i++) {
        const leaf = make('i', 'leaf');
        const ang = (i / LEAF_COUNT) * Math.PI * 2 - Math.PI / 2;
        leaf.style.setProperty('--lx', `${Math.cos(ang).toFixed(3)}`);
        leaf.style.setProperty('--ly', `${Math.sin(ang).toFixed(3)}`);
        leaf.style.setProperty('--la', `${Math.round(ang * 180 / Math.PI + 90)}deg`);
        hit.append(leaf);
      }
    }
    return hit;
  }

  // 발사. 이전 연출을 교체하고 측정값을 돌려준다(움직임 줄이기면 null).
  function fire(themeId) {
    clear();
    const spec = FX[themeId] ?? FX.hamster;
    if (sound) pop(themeId, reducedMotion.matches ? 0 : PREPARE_MS);
    if (reducedMotion.matches) return null;

    const a = computeAnchors(spec, stage.getBoundingClientRect(), actor.getBoundingClientRect(), number.getBoundingClientRect());
    const s = fx.style;
    s.setProperty('--x0', px(a.x0)); s.setProperty('--y0', px(a.y0));
    s.setProperty('--x1', px(a.x1)); s.setProperty('--y1', px(a.y1));
    s.setProperty('--lift', px(a.lift)); s.setProperty('--ang', `${Math.round(a.angle)}deg`);
    s.setProperty('--nw', px(a.nw)); s.setProperty('--nh', px(a.nh));
    s.setProperty('--travel', `${spec.travel}ms`);
    s.setProperty('--prepare', `${PREPARE_MS}ms`);

    const shot = make('i', `shot ${themeId}`);
    shot.append(make('i', 'shot-body'));
    const smoke = make('span', 'muzzle-smoke');
    for (let i = 0; i < 5; i++) {
      const puff = make('i', 'cotton');
      puff.style.setProperty('--i', i);
      smoke.append(puff);
    }
    fx.replaceChildren(shot, buildHit(themeId, a), smoke);

    void actor.offsetWidth;          // 같은 프레임 안에서 클래스를 다시 붙여도 애니메이션이 처음부터 돌도록
    actor.classList.add('firing');
    if (random() < spec.drop) {      // 토끼: 가끔 귀 사이에서 당근이 하나 떨어진다
      const drop = make('i', 'drop');
      actor.append(drop);
      extras.push(drop);
    }
    timer = timers.setTimeout(() => { timer = 0; clear(); }, spec.hold);
    return a;
  }

  // 아주 짧은 테마 효과음. 사용자 동작(클릭·스페이스)에서만 불리고, 음악이나 자동 재생은 없다.
  function pop(themeId, delay) {
    const sample = samples[themeId];
    if (sample?.readyState >= 2) {
      try {
        // Files include 150 ms of silence so playback starts inside the user gesture.
        sample.currentTime = delay ? 0 : PREPARE_MS / 1000;
        playing = sample;
        sample.play()?.catch(() => {});
        return;
      } catch { /* Keep the existing tiny synth as a loading fallback. */ }
    }
    try {
      const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Ctx) return;
      audio ??= new Ctx();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const t = audio.currentTime + delay / 1000;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
      gain.connect(audio.destination);
      if (themeId === 'penguin') {
        // 눈뭉치 "퐁": 낮은 사인파가 뚝 떨어진다
        const osc = audio.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.16);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain); osc.start(t); osc.stop(t + 0.2);
      } else {
        // 햄찌 "픗"(짧고 높음) · 토끼 "슝"(길고 위로 올라감): 띠통과 잡음
        const rabbit = themeId === 'rabbit';
        const length = Math.floor(audio.sampleRate * (rabbit ? 0.22 : 0.08));
        const buffer = audio.createBuffer(1, length, audio.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
        const src = audio.createBufferSource(); src.buffer = buffer;
        const filter = audio.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = rabbit ? 1.2 : 0.8;
        filter.frequency.setValueAtTime(rabbit ? 500 : 1800, t);
        if (rabbit) filter.frequency.exponentialRampToValueAtTime(2600, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (rabbit ? 0.22 : 0.09));
        src.connect(filter); filter.connect(gain); src.start(t);
      }
    } catch { /* 소리는 덤이라 실패해도 조용히 넘어간다 */ }
  }

  // 움직임 줄이기로 바뀌는 순간 도는 연출을 치운다 (지원 안 하는 환경은 건너뜀)
  reducedMotion.addEventListener?.('change', () => { if (reducedMotion.matches) clear(); });

  return { fire, clear, get active() { return timer !== 0; } };
}
