'use strict';

window.installOpeningV14 = function (G) {
  let current = null;

  function play(onComplete, { replay = false } = {}) {
    if (current) return;
    // A deliberate replay is still available to people who reduce motion.
    if (!replay && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }
    const previousFocus = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.id = 'opening-scene';
    dialog.setAttribute('aria-labelledby', 'opening-title');
    dialog.setAttribute('aria-describedby', 'opening-description');
    dialog.innerHTML = `
      <div class="opening-backdrop" aria-hidden="true"></div>
      <video id="opening-video" playsinline muted preload="none"
        poster="assets/lumi-opening-v14.jpg"
        aria-label="시간의 문 앞에서 손짓하며 탐험에 초대하는 루미"></video>
      <div class="opening-shade" aria-hidden="true"></div>
      <header class="opening-heading">
        <p>창용쌤의 역사 학습 게임</p>
        <h2 id="opening-title">별빛 시간탐험대</h2>
        <p id="opening-description">루미와 함께, 역사 속으로.</p>
      </header>
      <footer class="opening-footer">
        <p id="opening-status" role="status">시간의 문을 열고 있어요…</p>
        <div class="opening-actions">
          <button type="button" id="opening-pause" aria-label="오프닝 재생">재생</button>
          <button type="button" id="opening-music" aria-pressed="${G.state.music}">음악 ${G.state.music ? '켜짐' : '꺼짐'}</button>
          <button type="button" id="opening-skip">${replay ? '첫 화면으로' : '건너뛰기'} <span aria-hidden="true">→</span></button>
        </div>
        <div class="opening-progress" aria-hidden="true"><span></span></div>
      </footer>`;
    document.body.appendChild(dialog);
    const video = dialog.querySelector('video');
    const pause = dialog.querySelector('#opening-pause');
    const music = dialog.querySelector('#opening-music');
    const status = dialog.querySelector('#opening-status');
    const progress = dialog.querySelector('.opening-progress span');
    const events = new AbortController();
    let finished = false, timer, resumeWhenVisible = false, userPaused = false;
    current = dialog;
    const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: events.signal });

    function finish(failed = false) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      events.abort();
      video.pause();
      video.removeAttribute('src');
      video.load();
      dialog.close();
      dialog.remove();
      document.documentElement.classList.remove('opening-active');
      current = null;
      if (replay) G.audio?.setScene('title');
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      onComplete();
      if (failed) G.toast('오프닝을 불러오지 못해 바로 이어갈게요.');
    }
    // Poor connections must never trap a child in the opening screen.
    function watchLoading() {
      clearTimeout(timer);
      if (!document.hidden && !userPaused) timer = setTimeout(() => finish(true), 12000);
    }
    function resume() {
      userPaused = false;
      watchLoading();
      const request = video.play();
      request?.catch(() => {
        if (finished || document.hidden || userPaused) return;
        clearTimeout(timer);
        G.audio?.setScene('title');
        pause.textContent = '재생';
        pause.setAttribute('aria-label', '오프닝 재생');
        status.textContent = '재생을 누르거나 바로 탐험을 시작해요.';
      });
    }
    listen(video, 'playing', () => {
      clearTimeout(timer);
      G.audio?.setScene('opening');
      pause.textContent = '일시정지';
      pause.setAttribute('aria-label', '오프닝 일시정지');
      status.textContent = replay ? '루미의 초대' : '영상이 끝나면 모험을 시작해요.';
    });
    listen(video, 'waiting', watchLoading);
    listen(video, 'timeupdate', () => {
      if (Number.isFinite(video.duration) && video.duration > 0)
        progress.style.width = `${Math.min(100, video.currentTime / video.duration * 100)}%`;
    });
    listen(video, 'ended', () => finish());
    listen(video, 'error', () => finish(true));
    listen(dialog, 'cancel', event => { event.preventDefault(); finish(); });
    listen(dialog.querySelector('#opening-skip'), 'click', () => finish());
    listen(pause, 'click', () => {
      if (video.paused) resume();
      else {
        userPaused = true;
        resumeWhenVisible = false;
        clearTimeout(timer);
        video.pause();
        G.audio?.setScene('title');
        pause.textContent = '재생';
        pause.setAttribute('aria-label', '오프닝 재생');
        status.textContent = '잠시 쉬는 중이에요.';
      }
    });
    listen(music, 'click', () => {
      G.state.music = !G.state.music;
      G.save();
      music.textContent = `음악 ${G.state.music ? '켜짐' : '꺼짐'}`;
      music.setAttribute('aria-pressed', String(G.state.music));
      G.audio?.setScene(video.paused ? 'title' : 'opening');
    });
    listen(document, 'visibilitychange', () => {
      if (document.hidden) {
        resumeWhenVisible = !video.paused;
        clearTimeout(timer);
        video.pause();
      } else if (resumeWhenVisible && !userPaused) {
        resumeWhenVisible = false;
        resume();
      }
    });
    document.documentElement.classList.add('opening-active');
    dialog.showModal();
    dialog.querySelector('#opening-skip').focus({ preventScroll: true });
    dialog.scrollTop = 0;
    video.muted = true;
    video.src = 'assets/lumi-opening-v14.mp4';
    // The existing exploration song continues at the same position afterwards.
    G.audio?.setScene('opening');
    resume();
  }

  G.opening = { play };
};
