// 번호퐁 친구들 · 화면 연결. 뽑기 규칙은 picker.mjs, 표시 문구는 format.mjs, 테마는 themes.mjs, 발사 연출은 effects.mjs.
import {
  applyConfig, draw, drawStatus, loadPongState, loadState, resetHistory, revealLast, saveState, STORAGE_KEY
} from './picker.mjs?v=4';
import { parseTotal, remainingText } from './format.mjs';
import { getTheme, loadTheme, nextTheme, regionStyle, saveTheme, THEME_KEY, THEMES } from './themes.mjs?v=2';
import { createEffects, FX, PREPARE_MS } from './effects.mjs?v=3';

const $ = id => document.getElementById(id);
const el = {
  stage: $('stage'), title: $('title'), themeButton: $('themeButton'), themeName: $('themeName'),
  themeStatus: $('themeStatus'), board: $('board'), actor: $('actor'), fx: $('fx'), result: $('result'),
  number: $('number'), caption: $('caption'), panel: $('panel'), total: $('total'),
  rangeHint: $('rangeHint'), fire: $('fire'), notice: $('notice'), live: $('live')
};

const storage = (() => { try { return globalThis.localStorage; } catch { return null; } })();
const reducedMotion = globalThis.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const POP_MS = 250;
const effects = createEffects({ stage: el.stage, actor: el.actor, fx: el.fx, number: el.number, reducedMotion });

let state = loadPongState(storage);
let themeId = loadTheme(storage);
let spaceHeld = false;   // Space를 누르고 있는 동안 다시 발사하지 않는다
let busyUntil = 0;       // 팝 연출 중 겹치는 발사(클릭+Space, 더블클릭)를 막는다
let liveTimer = 0;
let revealTimer = 0;
function cancelReveal() {
  clearTimeout(revealTimer); revealTimer = 0;
  el.board.classList.remove('impact');
  el.stage.classList.remove('impact');
  el.fire.classList.remove('pressed');
}

// ---------- 저장 ----------
function persist() {
  const ok = saveState(storage, state);
  if (ok) hideNotice();
  else showNotice('기록을 저장할 수 없어요. 창을 닫으면 뽑은 번호가 사라질 수 있어요.');
}
function showNotice(text) { el.notice.textContent = text; el.notice.hidden = false; }
function hideNotice() { if (!el.notice.hidden) { el.notice.hidden = true; el.notice.textContent = ''; } }

// ---------- 화면 읽기 안내 ----------
function announce(text) {
  // 같은 문구가 이어져도 다시 읽히도록 잠깐 비웠다가 넣는다
  clearTimeout(liveTimer);
  el.live.textContent = '';
  liveTimer = setTimeout(() => { el.live.textContent = text; }, 30);
}

// 확인창이 열리면 keyup을 놓칠 수 있어 Space 잠금을 풀어 준다
function ask(message) {
  const answer = globalThis.confirm(message);
  spaceHeld = false;
  return answer;
}

// ---------- 테마 ----------
function applyTheme(id, { say = false } = {}) {
  cancelReveal();
  themeId = id;
  const theme = getTheme(id);
  effects.clear();                 // 이전 친구의 발사체·장식이 새 장면에 남지 않게 한다 (번호는 그대로)
  el.result.classList.remove('pop'); // 돌던 숫자 확대 연출도 함께 멈춘다. 번호 값과 기록은 그대로 둔다
  el.stage.dataset.theme = theme.id;
  for (const [key, box] of Object.entries(theme.regions)) {
    for (const [prop, value] of Object.entries(regionStyle(box))) el.stage.style.setProperty(`--${key}-${prop}`, value);
  }
  el.title.textContent = {hamster:'햄찌의 씨앗포',penguin:'펭귄의 눈뭉치포',rabbit:'토끼의 당근 로켓포'}[theme.id];
  el.themeName.textContent = theme.name;
  el.themeButton.setAttribute('aria-label', `친구 바꾸기 (지금은 ${theme.name})`);
  document.title = `번호퐁 친구들 · ${theme.name}`;
  if (say) {
    el.themeStatus.textContent = theme.announce;
    el.themeButton.classList.remove('swapped');
    void el.themeButton.offsetWidth;
    el.themeButton.classList.add('swapped');
  }
  render();
}

function cycleTheme() {
  const id = nextTheme(themeId);
  applyTheme(id, { say: true });
  saveTheme(storage, id); // 실패해도 화면은 이미 바뀌었으니 조용히 넘어간다
}

// 그림을 미리 받아 두면 친구를 바꿀 때 깜빡임이 줄어든다. 아직 없는 그림(새 장면·배우 시트)이면 조용히 실패한다.
function preloadImages() {
  for (const theme of THEMES) {
    for (const src of [theme.scene, theme.actor]) { const img = new Image(); img.decoding = 'async'; img.src = src; }
  }
}

// ---------- 그리기 ----------
function render() {
  const theme = getTheme(themeId);
  const status = drawStatus(state);
  const last = state.history[state.history.length - 1];
  const number = last ? last.numbers[0] : null;
  const exhausted = !status.ok;

  el.stage.dataset.phase = exhausted ? 'exhausted' : (last ? 'drawn' : 'idle');
  el.number.textContent = number ?? '?';
  el.number.dataset.len = String(number ?? '?').length;

  if (exhausted) {
    el.caption.textContent = `${state.config.total}명 모두 뽑았어요 · 발사 버튼으로 새 판`;
    el.fire.textContent = '새 판 시작';
    el.fire.setAttribute('aria-label','새 판 시작');
  } else {
    const remain = remainingText(state.config.unique, status.pool.length);
    el.caption.textContent = last
      ? `남은 번호 ${remain.value}`
      : `1 ~ ${state.config.total}번 · 스페이스로 발사!`;
    el.fire.textContent = '발사!';
    el.fire.setAttribute('aria-label', theme.fire + ' (스페이스)');
  }
  // 입력칸 밖에서 다시 그릴 때(테마 변경 등) 적용 안 된 값과 그 오류 표시를 함께 정리한다
  if (document.activeElement !== el.total && el.total.value !== String(state.config.total)) {
    el.total.value = String(state.config.total);
    clearRangeError();
  }
}

function popNumber() {
  el.result.classList.remove('pop');
  el.board.classList.remove('impact');
  el.stage.classList.remove('impact');
  void el.result.offsetWidth;
  el.result.classList.add('pop');
  el.board.classList.add('impact');
  el.stage.classList.add('impact');
}

// ---------- 발사 ----------
function fire() {
  const now = performance.now();
  if (now < busyUntil) return;
  // 입력칸이 틀린 값이거나 아직 적용되지 않은 값이면 먼저 정리한다. 실패하면 발사하지 않고 기록을 지킨다.
  if (!commitTotal()) { el.total.focus(); return; }
  const status = drawStatus(state);

  if (!status.ok) {
    if (status.reason !== 'exhausted') return;
    const yes = ask(`${state.config.total}번까지 모두 뽑았어요.\n새 판을 시작할까요? 지금까지의 기록은 지워져요.`);
    if (!yes) return;
    state = resetHistory(state);
    persist();
    render();
    announce(`새 판을 시작했어요. 1번부터 ${state.config.total}번까지 뽑아요.`);
    return;
  }

  const result = draw(state);
  if (!result.entry) return;
  const delay = reducedMotion.matches ? 0 : PREPARE_MS + FX[themeId].travel;
  busyUntil = now + (reducedMotion.matches ? POP_MS : delay + 420);
  state = revealLast(result.state); // 화면을 닫아도 추첨 결과는 보존한다.
  persist();
  cancelReveal();
  if (!reducedMotion.matches) {
    const stageBox = el.stage.getBoundingClientRect();
    const buttonBox = el.fire.getBoundingClientRect();
    el.fire.style.setProperty('--skin', `url(${getTheme(themeId).scene})`);
    el.fire.style.setProperty('--skin-size', `${stageBox.width}px ${stageBox.height}px`);
    el.fire.style.setProperty('--skin-position', `${stageBox.left - buttonBox.left}px ${stageBox.top - buttonBox.top}px`);
  }
  void el.fire.offsetWidth;
  el.fire.classList.add('pressed');
  effects.fire(themeId);
  const reveal = () => {
    revealTimer = 0;
    render();
    popNumber();
    const after = drawStatus(state);
    announce(after.ok ? `${result.entry.numbers[0]}번!` : `${result.entry.numbers[0]}번! 마지막 번호예요.`);
  };
  if (delay) revealTimer = setTimeout(reveal, delay);
  else reveal();
}

// ---------- 범위 입력 ----------
function setRangeError(text) {
  el.rangeHint.textContent = text;
  el.rangeHint.classList.remove('error');
  void el.rangeHint.offsetWidth;
  el.rangeHint.classList.add('error');
  el.total.setAttribute('aria-invalid', 'true');
}
function clearRangeError() {
  el.rangeHint.textContent = '1 ~ 100';
  el.rangeHint.classList.remove('error');
  el.total.removeAttribute('aria-invalid');
}

function commitTotal() {
  const raw = el.total.value;
  const total = parseTotal(raw);
  if (total === null) {
    setRangeError(raw.trim() === '' ? '숫자를 적어 주세요 (1 ~ 100)' : '1부터 100까지 숫자만 돼요');
    return false;
  }
  if (total === state.config.total) { clearRangeError(); return true; }
  if (state.history.length) {
    const yes = ask(`${total}번까지로 바꾸면 지금까지 뽑은 ${state.history.length}개 기록이 지워지고 새 판이 돼요.\n바꿀까요?`);
    if (!yes) {
      el.total.value = String(state.config.total);
      clearRangeError();
      announce(`바꾸지 않았어요. 그대로 1번부터 ${state.config.total}번까지예요.`);
      return false;
    }
  }
  const next = applyConfig(state, { ...state.config, total, excluded: [] });
  if (!next) { setRangeError('1부터 100까지 숫자만 돼요'); return false; }
  cancelReveal();
  effects.clear();
  state = next;
  clearRangeError();
  persist();
  render();
  announce(`1번부터 ${total}번까지 뽑아요. 새 판이에요.`);
  return true;
}

// ---------- 이벤트 ----------
el.panel.addEventListener('submit', event => {
  event.preventDefault();
  // 범위 변경과 발사를 한 동작으로 처리해 취소 시 번호가 뽑히지 않게 한다.
  fire(); // 범위 검증은 fire() 안에서 다시 한다
});
el.total.addEventListener('keydown', event => {
  // 입력칸에서 Enter: 범위만 적용하고 발사는 하지 않는다 (폼 자동 제출 차단)
  if (event.key !== 'Enter') return;
  event.preventDefault();
  if (commitTotal()) el.fire.focus();
});
el.total.addEventListener('input', () => {
  if (el.total.getAttribute('aria-invalid')) clearRangeError();
});
el.total.addEventListener('focus', () => el.total.select());

el.themeButton.addEventListener('click', cycleTheme);

window.addEventListener('keydown', event => {
  if (event.code !== 'Space' && event.key !== ' ') return;
  if (event.target === el.themeButton) return;        // 버튼 고유 동작(테마 바꾸기)은 그대로
  if (event.target === el.total) {                    // 입력칸에서는 Space로 값을 적용하고 발사
    event.preventDefault();
    if (event.repeat || spaceHeld) return;
    spaceHeld = true;
    fire();
    if (!el.total.hasAttribute('aria-invalid')) el.fire.focus();
    return;
  }
  event.preventDefault();                             // 페이지 스크롤·버튼 중복 클릭 방지
  if (event.repeat || spaceHeld) return;
  spaceHeld = true;
  fire();
});
window.addEventListener('keyup', event => {
  if (event.code !== 'Space' && event.key !== ' ') return;
  spaceHeld = false;
  // 일부 브라우저는 keyup에서 버튼을 클릭 처리하므로 발사 버튼의 중복 발사를 막는다
  if (event.target === el.fire) event.preventDefault();
});
window.addEventListener('blur', () => { spaceHeld = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { spaceHeld = false; cancelReveal(); effects.clear(); render(); } });

// 다른 탭에서 바뀐 기록을 따라간다 (같은 저장키를 두 창이 쓸 때)
window.addEventListener('storage', event => {
  if (event.storageArea !== storage) return;
  if (event.key === STORAGE_KEY && loadState(storage)) { cancelReveal(); effects.clear(); state = loadPongState(storage); render(); }
  if (event.key === THEME_KEY) { const id = loadTheme(storage); if (id !== themeId) applyTheme(id); }
});

// ---------- 시작 ----------
applyTheme(themeId);
preloadImages();
if (storage === null) showNotice('이 브라우저에서는 기록을 저장할 수 없어요. 창을 닫으면 뽑은 번호가 사라져요.');
