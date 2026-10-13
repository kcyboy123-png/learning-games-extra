'use strict';
// Optional cinema on the title screen. The game never depends on media loading.
window.ShopOpening = (() => {
  const asset = 'assets/opening.mp4', poster = 'assets/opening-poster.webp';
  const seenKey = 'ttakmatne-opening-v1';
  let read = () => ({settings:{},route:'home'}), dialog, video, playButton, soundButton, status, progress;
  let seen = false, pending = false, timer, resumeOnReturn = false, generation = 0;
  const path = value => window.EMBEDDED_ASSETS?.[value] || value;
  const button = name => dialog.querySelector(`[data-opening="${name}"]`);
  function remember() { seen = true; try { sessionStorage.setItem(seenKey, '1'); } catch {} }
  function clearTimer() { clearTimeout(timer); timer = null; }
  function watchLoading() {
    clearTimer();
    timer = setTimeout(() => {
      if (!dialog?.open || document.hidden) return;
      close(); window.Shop?.toast('영상 연결이 느려 시작 화면으로 이동했어요. 오프닝은 다시 볼 수 있어요.');
    }, 8000);
  }
  function update() {
    if (!video) return;
    playButton.textContent = video.paused ? '▶ 재생' : 'Ⅱ 일시정지';
    soundButton.textContent = video.muted ? '영상 소리 켜기' : '영상 소리 끄기';
    soundButton.setAttribute('aria-pressed', String(!video.muted));
    progress.value = Math.min(10, Number(video.currentTime) || 0);
  }
  function play() {
    const current = generation;
    if (!dialog?.open || document.hidden) return;
    status.textContent = '모양숲으로 가는 중…';
    watchLoading();
    try {
      Promise.resolve(video.play()).then(() => {
        if (current !== generation || !dialog.open) return;
        update();
      }).catch(error => {
        if (current !== generation || !dialog.open || error.name === 'AbortError') return;
        clearTimer();
        if (error.name === 'NotAllowedError') {
          status.textContent = '재생을 누르면 오프닝이 시작돼요.'; update();
        } else fail();
      });
    } catch { fail(); }
  }
  function close(focus = true) {
    if (!dialog?.open) return;
    generation++; clearTimer(); resumeOnReturn = false;
    video.pause(); video.removeAttribute('src'); video.load();
    dialog.close(); document.body.classList.remove('opening-visible');
    window.ShopMusic?.hold('opening', false);
    if (focus && read().route === 'home') document.querySelector('[data-action="start"]')?.focus({preventScroll:true});
  }
  function fail() {
    if (!dialog?.open) return;
    close(); window.Shop?.toast('오프닝을 불러오지 못했어요. 모험은 바로 시작할 수 있어요.');
  }
  function create() {
    dialog = document.createElement('dialog');
    dialog.id = 'opening-cinema';
    dialog.setAttribute('aria-labelledby', 'opening-heading');
    dialog.innerHTML = `<div class="opening-wrap"><header class="opening-heading"><div><p>모양숲에 오신 걸 환영해요</p><h2 id="opening-heading">딱맞네 수리점 · 오프닝</h2></div><button type="button" data-opening="close" class="opening-skip" autofocus>건너뛰기 →</button></header><div class="opening-stage"><video playsinline preload="none" aria-label="꼬마 수리사들이 모양숲을 지나 수리점에 도착하는 10초 오프닝"></video></div><progress max="10" value="0" aria-label="오프닝 재생 진행"></progress><div class="opening-controls"><button type="button" data-opening="play">▶ 재생</button><button type="button" data-opening="sound" aria-pressed="false">영상 소리 켜기</button><span>10초</span></div><p class="opening-status" role="status" aria-live="polite">모양숲으로 가는 중…</p></div>`;
    document.body.append(dialog);
    video = dialog.querySelector('video');
    video.poster = path(poster); video.muted = true; video.defaultMuted = true;
    playButton = button('play'); soundButton = button('sound');
    status = dialog.querySelector('.opening-status'); progress = dialog.querySelector('progress');
    dialog.addEventListener('click', event => {
      const action = event.target.closest('[data-opening]')?.dataset.opening;
      if (action === 'close') close();
      if (action === 'play') {
        if (video.paused) play();
        else { video.pause(); clearTimer(); status.textContent = '잠시 쉬는 중이에요.'; }
      }
      if (action === 'sound') { video.muted = !video.muted; update(); }
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    video.addEventListener('playing', () => { if (!dialog.open) return; clearTimer(); status.textContent = '끝나면 시작 화면으로 이어져요.'; update(); });
    video.addEventListener('pause', update);
    video.addEventListener('timeupdate', update);
    video.addEventListener('waiting', () => { if (dialog.open && !video.paused) watchLoading(); });
    video.addEventListener('ended', () => close());
    video.addEventListener('error', fail);
  }
  function open() {
    if (read().route !== 'home' || document.querySelector('#modal')?.open) return;
    if (!dialog) create();
    if (dialog.open) return;
    remember(); generation++;
    video.muted = true; video.volume = .65; progress.value = 0;
    video.src = path(asset);
    window.ShopMusic?.hold('opening', true);
    dialog.showModal(); document.body.classList.add('opening-visible');
    update(); play();
  }
  function sync(route) {
    if (route !== 'home') { close(false); return; }
    if (seen || pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      if (read().route !== 'home' || document.hidden) return;
      if (read().settings.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData) { remember(); return; }
      open();
    });
  }
  function init(reader) {
    read = reader;
    try { seen = sessionStorage.getItem(seenKey) === '1'; } catch {}
    document.addEventListener('click', event => { if (event.target.closest('[data-opening="open"]')) open(); });
    document.addEventListener('visibilitychange', () => {
      if (!dialog?.open) return;
      if (document.hidden) { resumeOnReturn = !video.paused; video.pause(); clearTimer(); }
      else if (resumeOnReturn) { resumeOnReturn = false; play(); }
    });
    window.addEventListener('pagehide', () => close(false));
  }
  return {init, sync, open, close};
})();
