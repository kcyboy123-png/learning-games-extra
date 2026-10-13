'use strict';
// One persistent player, shared by every game screen. Nothing loads before a tap.
window.ShopMusic = (() => {
  const path = 'assets/forest-theme.mp3';
  let read = () => ({settings:{}}), context, gain, buffer, source, loading;
  let activated = false, leftPage = false, retryAfter = 0, unavailable = false;
  const holds = new Set();
  const prefs = () => read().settings;
  const volume = () => Math.max(0, Math.min(100, Number(prefs().musicVolume) || 0)) / 100;
  const allowed = () => activated && !leftPage && !document.hidden && !holds.size && prefs().sound && prefs().music && volume() > 0;
  function report() {
    const node = document.querySelector('#music-status');
    if (node) node.textContent = !prefs().sound ? '전체 소리가 꺼져 있어요.' : !prefs().music || !volume() ? '배경음악이 꺼져 있어요.' : unavailable ? '음악을 불러오지 못했어요. 소리를 다시 켜면 재시도해요.' : loading ? '배경음악을 준비하고 있어요…' : source && context?.state === 'running' ? '모양숲의 작은 수리점 · 재생 중' : '게임을 시작하면 음악이 함께 흘러나와요.';
  }
  function adjust() {
    if (!gain) return;
    const value = allowed() ? volume() * (read().route === 'order' ? .55 : 1) : 0;
    gain.gain.cancelScheduledValues(context.currentTime);
    if (!value) gain.gain.setValueAtTime(0, context.currentTime);
    else gain.gain.setTargetAtTime(value, context.currentTime, .35);
  }
  function startBuffer() {
    if (!buffer || source || !allowed()) return;
    source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
  }
  function load() {
    if (buffer) { startBuffer(); return; }
    if (loading || Date.now() < retryAfter) return;
    unavailable = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    loading = fetch(window.EMBEDDED_ASSETS?.[path] || path, {signal:controller.signal})
      .then(response => { if (!response.ok) throw Error('Music unavailable'); return response.arrayBuffer(); })
      .then(bytes => context.decodeAudioData(bytes))
      .then(decoded => { buffer = decoded; startBuffer(); adjust(); })
      .catch(() => { unavailable = true; retryAfter = Date.now() + 30000; })
      .finally(() => { clearTimeout(timeout); loading = null; report(); });
    report();
  }
  function sync() {
    if (allowed() && context) {
      // Resume immediately in the user's event, before any fetch or await.
      try { Promise.resolve(context.resume()).then(() => {
        if (!allowed()) { sync(); return; }
        load(); adjust(); report();
      }).catch(() => { report(); }); } catch { report(); }
    } else if (context) {
      adjust();
      try { Promise.resolve(context.suspend()).then(() => {
        // A quick unmute may have arrived while suspend was pending.
        if (allowed()) sync(); else report();
      }).catch(() => {}); } catch {}
    }
    report();
  }
  function activate() {
    activated = true;
    if (!allowed()) { sync(); return; }
    if (!context) {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        context = new Audio();
        gain = context.createGain(); gain.gain.value = 0; gain.connect(context.destination);
      } catch { unavailable = true; report(); return; }
    }
    retryAfter = 0;
    sync();
  }
  function init(reader) {
    read = reader;
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => { leftPage = true; sync(); });
    window.addEventListener('pageshow', () => { leftPage = false; sync(); });
    const retryGesture = () => { if (activated && allowed() && context?.state !== 'running') sync(); };
    document.addEventListener('pointerdown', retryGesture, {passive:true});
    document.addEventListener('keydown', retryGesture);
  }
  function hold(reason, active) { if (active) holds.add(reason); else holds.delete(reason); sync(); }
  return {init, activate, sync, hold};
})();
