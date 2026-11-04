'use strict';
// Audio preferences stay separate from the child's adoption and care records.
window.PetAudio = (() => {
  const key = 'pet-care-audio-v1', files = ['music', 'feed', 'water', 'brush', 'play', 'reward'];
  let settings = { muted: false, music: .28, effects: .55 };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved.muted === 'boolean') settings.muted = saved.muted;
    for (const name of ['music', 'effects']) if (Number.isFinite(saved?.[name])) settings[name] = Math.max(0, Math.min(1, saved[name]));
  } catch (_) {}
  let context, musicGain, effectsGain, musicSource, loadingMusic = false, active = false, quiet = false, failed = false;
  const buffers = new Map(), playing = new Set(), last = new Map();
  const audible = () => active && !document.hidden && !settings.muted && context?.state === 'running';
  function status() {
    const button = document.getElementById('bSound');
    const on = audible() && (settings.music > 0 || settings.effects > 0);
    if (button) { button.textContent = on ? '소리 끄기' : '소리 켜기'; button.setAttribute('aria-pressed', String(on)); }
    const note = document.getElementById('audioNote');
    if (note) note.textContent = failed ? '소리를 불러오지 못했어요. 인터넷 연결을 확인하고 소리 켜기를 다시 눌러 주세요.' : '작은 소리로 함께해요. 다른 화면으로 가면 소리가 잠시 멈춰요.';
  }
  function remember() { try { localStorage.setItem(key, JSON.stringify(settings)); } catch (_) {} }
  function buffer(name) {
    if (!buffers.has(name)) buffers.set(name, fetch('assets/audio/pet-' + name + '-v1.mp3')
      .then(response => { if (!response.ok) throw Error('audio'); return response.arrayBuffer(); })
      .then(data => context.decodeAudioData(data))
      .catch(error => { buffers.delete(name); failed = true; status(); throw error; }));
    return buffers.get(name);
  }
  function stopEffects() { for (const source of playing) { try { source.stop(); } catch (_) {} } playing.clear(); }
  function sync() {
    status();
    if (!context) return;
    musicGain.gain.setTargetAtTime(audible() ? settings.music * (quiet ? .55 : 1) : 0, context.currentTime, .12);
    effectsGain.gain.setTargetAtTime(audible() ? settings.effects : 0, context.currentTime, .02);
    if (!audible() || settings.effects === 0) stopEffects();
    if (audible() && settings.music > 0 && !musicSource && !loadingMusic) {
      loadingMusic = true;
      buffer('music').then(audio => {
        if (!audible() || settings.music === 0) return;
        musicSource = context.createBufferSource(); musicSource.buffer = audio; musicSource.loop = true;
        musicSource.connect(musicGain); musicSource.start();
      }).catch(() => {}).finally(() => { loadingMusic = false; status(); });
    }
  }
  async function unlock() {
    if (!active || document.hidden || settings.muted) return;
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) { failed = true; status(); return; }
        context = new Audio(); musicGain = context.createGain(); effectsGain = context.createGain();
        musicGain.gain.value = 0; effectsGain.gain.value = 0;
        musicGain.connect(context.destination); effectsGain.connect(context.destination);
        context.onstatechange = sync;
      }
      await context.resume(); sync();
      for (const name of files.slice(1)) if (settings.effects > 0) buffer(name).catch(() => {});
    } catch (_) { status(); }
  }
  function effect(name) {
    if (!files.includes(name) || name === 'music' || !audible() || settings.effects === 0) return;
    const now = performance.now();
    if (now - (last.get(name) ?? -Infinity) < 300) return;
    last.set(name, now);
    buffer(name).then(audio => {
      // Never replay a late download after the action or after leaving the page.
      if (!audible() || settings.effects === 0 || performance.now() - now > 700 || playing.size >= 2) return;
      const source = context.createBufferSource(); source.buffer = audio; source.connect(effectsGain);
      playing.add(source); source.onended = () => { playing.delete(source); source.disconnect(); }; source.start();
    }).catch(() => {});
  }
  function toggle() {
    if (audible() && (settings.music > 0 || settings.effects > 0)) settings.muted = true;
    else { settings.muted = false; if (settings.music === 0 && settings.effects === 0) { settings.music = .28; settings.effects = .55; } failed = false; unlock(); }
    remember(); sync();
  }
  function controls() {
    return `<section class="settings-group"><h3>음악과 효과음</h3><p id="audioNote" role="status"></p>${[['music','배경음악'],['effects','효과음']].map(([name,label]) => `<label class="audio-row" for="audio-${name}"><span>${label}</span><input id="audio-${name}" type="range" min="0" max="100" step="5" value="${Math.round(settings[name]*100)}"><output id="audio-${name}-value" for="audio-${name}">${Math.round(settings[name]*100)}%</output></label>`).join('')}<button class="btn" id="audioToggle">${settings.muted ? '전체 소리 켜기' : '전체 소리 끄기'}</button><p>0%로 내리면 해당 소리만 꺼져요.</p></section>`;
  }
  function bindControls() {
    for (const name of ['music', 'effects']) {
      const input = document.getElementById('audio-' + name);
      input.oninput = () => { settings[name] = Number(input.value)/100; if (settings[name] > 0) settings.muted = false; document.getElementById(input.id+'-value').textContent = input.value+'%'; remember(); unlock(); sync(); updateLabel(); };
      if (name === 'effects') input.onchange = () => effect('reward');
    }
    function updateLabel() { document.getElementById('audioToggle').textContent = settings.muted ? '전체 소리 켜기' : '전체 소리 끄기'; }
    document.getElementById('audioToggle').onclick = () => { toggle(); updateLabel(); }; status();
  }
  function visibility() {
    sync();
    if (document.hidden) context?.suspend().catch(() => {});
    else unlock();
  }
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', () => { stopEffects(); context?.suspend().catch(() => {}); });
  window.addEventListener('pageshow', visibility);
  document.addEventListener('pointerdown', event => { if (!event.target.closest('#bSound,#audioToggle')) unlock(); }, { capture: true, passive: true });
  document.addEventListener('keydown', event => { if (['Enter',' '].includes(event.key) && !event.target.closest('#bSound,#audioToggle')) unlock(); }, true);
  return { effect, toggle, controls, bindControls,
    enter() { active = true; unlock(); sync(); },
    leave() { active = false; stopEffects(); sync(); context?.suspend().catch(() => {}); },
    rest(value) { if (quiet !== value) { quiet = value; sync(); } }
  };
})();
