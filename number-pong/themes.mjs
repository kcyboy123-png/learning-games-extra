// 번호퐁 친구들 · 테마 정의와 순환/저장 (DOM 없음, 브라우저와 Node 공용)
// 테마는 그림·색·발사 문구만 바꾼다. 뽑기 기록(picker.mjs 상태)은 건드리지 않는다.
export const THEME_KEY = 'animal-number-pong-theme-v1';

// regions: 배경 그림(16:9) 안에서 HTML을 겹칠 자리. 값은 그림 너비·높이 대비 백분율.
// image: 친구와 대포가 함께 그려진 원본 배경(폴백). scene: 왼쪽 아래 친구·대포를 뺀 같은 장면.
// actor: 투명 2x2 스프라이트 시트(0 대기 · 1 발사/반동 · 2 우스꽝 회복 · 3 깜빡/정돈). 연출 규칙은 effects.mjs.
export const THEMES = Object.freeze([
  Object.freeze({
    id: 'hamster', name: '햄찌', image: 'assets/hamster.png',
    scene: 'assets/hamster-scene.png', actor: 'assets/hamster-actor.png',
    color: '#d9892b', ink: '#5a3418', particle: 'seed',
    fire: '해바라기씨 발사!', ammo: '해바라기씨', announce: '햄찌 친구로 바꿨어요',
    regions: Object.freeze({ title: [35, 8, 66, 18], board: [30, 27, 70, 77], panel: [74, 55, 95, 91] })
  }),
  Object.freeze({
    id: 'penguin', name: '펭몽이', image: 'assets/penguin.png',
    scene: 'assets/penguin-scene.png', actor: 'assets/penguin-actor.png',
    color: '#3f8fd6', ink: '#163a5c', particle: 'snow',
    fire: '눈덩이 발사!', ammo: '눈덩이', announce: '펭몽이 친구로 바꿨어요',
    regions: Object.freeze({ title: [35, 8, 66, 18], board: [30, 27, 70, 77], panel: [74, 55, 95, 91] })
  }),
  Object.freeze({
    id: 'rabbit', name: '토실이', image: 'assets/rabbit.png',
    scene: 'assets/rabbit-scene.png', actor: 'assets/rabbit-actor.png',
    color: '#ef7a3c', ink: '#4e3b2a', particle: 'carrot',
    fire: '당근 발사!', ammo: '당근', announce: '토실이 친구로 바꿨어요',
    regions: Object.freeze({ title: [35, 8, 66, 18], board: [31, 26, 69, 78], panel: [74, 57, 95, 94] })
  })
]);

export const DEFAULT_THEME = THEMES[0].id;

export function getTheme(id) {
  return THEMES.find(theme => theme.id === id) ?? THEMES[0];
}

// 햄찌 → 펭귄 → 토끼 → 햄찌. 모르는 id는 첫 테마로 간다.
export function nextTheme(id) {
  const index = THEMES.findIndex(theme => theme.id === id);
  return THEMES[(index + 1) % THEMES.length].id;
}

// [x1, y1, x2, y2] 백분율을 CSS inset 값(left/top/width/height, %)으로 바꾼다.
export function regionStyle([x1, y1, x2, y2]) {
  return { left: `${x1}%`, top: `${y1}%`, width: `${x2 - x1}%`, height: `${y2 - y1}%` };
}

// 저장소가 막히거나 값이 이상해도 예외 없이 기본 테마를 돌려준다.
export function loadTheme(storage) {
  try {
    const raw = storage?.getItem(THEME_KEY);
    return THEMES.some(theme => theme.id === raw) ? raw : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

export function saveTheme(storage, id) {
  try { storage.setItem(THEME_KEY, id); return true; } catch { return false; }
}
