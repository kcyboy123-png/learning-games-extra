import {animateEnding} from './ui/ending-scene.mjs';
// 상자 배송 대작전(업그레이드) — 화면 흐름 통합.
// 로딩 → 타이틀(마을 배경 + 모아 소개 + 큰 시작) → 배송 마을(그림 지도 위 이동) → 문 앞 '작업 시작' → 미션/복습 → 도장 → 복귀 → 종합 배송 → 엔딩.
import {CONTENT, findActivity} from './data/workshops.mjs';
import {createProgress, loadSaved, saveProgress, loadSettings, saveSettings, SAVE_KEY} from './lib/progress.mjs';
import {PLACES} from './lib/village.mjs';
import {createWorld} from './lib/world.mjs';
import {loadAssets, frameRect} from './ui/assets.mjs';
import {createVillageScene} from './ui/village-scene.mjs';
import {runMission} from './ui/mission.mjs';
import {createSolidView} from './ui/solid-view.mjs';
import {createRobotView} from './ui/robot-view.mjs';
import {setSoundEnabled, sfx} from './ui/audio.mjs';
import {drawMoa} from './ui/sprites.mjs';
import {node, button, clear, announce, reducedMotion} from './ui/dom.mjs';

const $ = id => document.getElementById(id);
const app = $('app'), scene = $('scene'), overlay = $('overlay'), subbar = $('subbar');
let storage = null; try { storage = window.localStorage; } catch { storage = null; }
const teacher = new URLSearchParams(location.search).get('teacher') === '1';
const settings = {sound: false, reduceMotion: false, ...loadSettings(storage)};
const saved = teacher ? {data: null, corrupted: false} : loadSaved(storage, SAVE_KEY);
const progress = createProgress(CONTENT, saved.data);
const PLACE_NAMES = Object.fromEntries(PLACES.map(p => [p.id, p.name]));
let assets = null, world = null, village = null, mission = null, screen = 'boot';

// ---------- 화면 맞춤 ----------
function fit() {
  const s = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
  app.style.transform = `scale(${s})`;
  app.style.left = `${Math.max(0, (window.innerWidth - 1024 * s) / 2)}px`;
  app.style.top = `${Math.max(0, (window.innerHeight - 768 * s) / 2)}px`;
}
window.addEventListener('resize', fit); fit();
app.classList.toggle('reduce-motion', !!settings.reduceMotion);
setSoundEnabled(!!settings.sound);

// ---------- HUD ----------
const hud = {
  setLocation(t) { $('location').textContent = t; },
  setGoal(t) { $('goal').textContent = t; },
  setSub(items = []) { clear(subbar); for (const it of items) { if (!it) continue; subbar.append(typeof it === 'string' ? node('span', {class: 'chip tiny', text: it}) : it); } },
  update() {
    $('stamps').textContent = `도장 ${progress.stamps()} / 6`;
    $('score').textContent = teacher ? '미리보기' : `${progress.score().toLocaleString()}점`;
  },
  show(on) { $('hud').classList.toggle('hidden', !on); }
};
let saveTimer = null;
function flashSave(text) {
  const el = $('save'); el.textContent = text; el.classList.add('show');
  clearTimeout(saveTimer); saveTimer = setTimeout(() => el.classList.remove('show'), 1800);
}
function save() {
  if (teacher) return;
  const ok = saveProgress(storage, progress, SAVE_KEY);
  flashSave(ok ? '자동 저장됨' : '이 브라우저에서 저장할 수 없어요');
}
function showOverlay(content, {label = '안내', wide = false} = {}) {
  clear(overlay);
  const box = node('div', {class: `dialog ${wide ? 'wide' : ''}`, role: 'dialog', tabindex: '-1', 'aria-modal': 'true', 'aria-label': label});
  box.append(...[].concat(content));
  overlay.append(box); overlay.hidden = false;
  setTimeout(() => box.focus(), 30);
  return box;
}
function hideOverlay() { overlay.hidden = true; clear(overlay); }

// ---------- 로딩 ----------
async function boot() {
  hud.show(false);
  assets = await loadAssets(p => { $('loading-fill').style.width = `${Math.round(p * 100)}%`; });
  world = createWorld(assets.manifest.world);
  $('loading-text').textContent = assets.status.missing.length ? '일부 그림이 없어 기본 그림으로 보여 줘요' : '준비 완료';
  await new Promise(r => setTimeout(r, 200));
  $('loading').hidden = true;
  hud.update();
  if (teacher) { hud.show(true); showTeacherPicker(); return; }
  if (saved.corrupted) {
    showOverlay([node('h2', {text: '저장 데이터를 읽을 수 없어요'}), node('p', {text: '저장된 진행이 손상되어 처음부터 시작해요.'}), node('div', {class: 'actions'}, [button('시작하기', () => { hideOverlay(); showTitle(); }, {primary: true})])], {label: '저장 오류'});
    return;
  }
  showTitle();
}

// ---------- 타이틀 ----------
function showTitle() {
  screen = 'title';
  hud.show(false); clear(scene); hideOverlay();
  const resume = progress.activities.some(a => progress.isComplete(a.id));
  const el = node('div', {class: 'title-screen'});
  if (assets.images.world) el.style.backgroundImage = 'url(assets/village-world.webp)';
  else el.style.background = 'radial-gradient(ellipse at 50% 30%, #6fa64c, #2b6a5c 80%)';
  const portrait = node('canvas', {width: 72, height: 84, 'aria-hidden': 'true'});
  if (assets.images.moa) {
    const f = frameRect(assets.manifest.sprites.moa, 'down', 0);
    portrait.getContext('2d').drawImage(assets.images.moa, f.sx, f.sy, f.sw, f.sh, 0, 0, 72, 84);
  } else drawMoa(portrait.getContext('2d'), 36, 80, 2, 0, 1.3, false, 'happy');
  const intro = node('div', {class: 'title-intro'}, [portrait, node('p', {}, [
    node('small', {text: '상자 로봇 모아'}),
    resume ? `다시 왔군요! 지금 할 일은 ‘${progress.current()?.title || '배송 결과 보기'}’예요.` : '축제 상자가 뒤섞였어요. 새 배송 기사님, 상자를 살펴보고 딱 맞게 포장해 줄래요?'
  ])]);
  const startBtn = button(resume ? '이어서 하기' : '배송 시작', () => { progress.setExtra('openingSeen', true); save(); el.remove(); showVillage(); }, {primary: true, icon: '→'});
  const actions = node('div', {class: 'title-actions'}, [startBtn, resume ? button('처음부터', confirmReset, {cls: 'ghost small'}) : null]);
  el.append(node('h1', {class: 'title-logo', text: '상자 배송 대작전'}), node('p', {class: 'title-sub', text: '직육면체를 살펴보고, 그리고, 접어서 보내요'}), intro, actions);
  scene.append(el);
  setTimeout(() => startBtn.focus(), 50);
}

// ---------- 마을 ----------
function destinationId() {
  const st = progress.stage();
  return st.type === 'ending' ? null : PLACES[st.workshop].id;
}
function completedPlaceIds() {
  const ids = CONTENT.workshops.map((w, i) => (progress.workshopDone(i) ? PLACES[i].id : null)).filter(Boolean);
  if (progress.finalDone()) ids.push('final');
  return ids;
}
function showVillage({player = null} = {}) {
  screen = 'village';
  mission?.destroy(); mission = null;
  clear(scene); hideOverlay(); hud.show(true);
  const destId = destinationId();
  const dest = PLACES.find(p => p.id === destId);
  hud.setLocation('배송 마을');
  hud.setGoal(dest ? `${dest.name}로 가기` : '모든 배송 완료!');
  hud.setSub([]); hud.update();
  const bubble = node('div', {class: 'bubble', hidden: true}, [node('small', {text: '모아'}), node('strong', {text: ''})]);
  const slot = node('div', {class: 'primary-slot'});
  const tip = node('div', {class: 'village-tip', text: '방향키 · 방향 패드 · 가고 싶은 곳 누르기'});
  let timer = null;
  function say(text, tone = '') { bubble.hidden = false; bubble.className = `bubble ${tone}`; bubble.querySelector('strong').textContent = text; announce(text); clearTimeout(timer); timer = setTimeout(() => { bubble.hidden = true; }, 4000); }
  function renderSlot(near) {
    clear(slot);
    if (near && near.id === destId) {
      const current = progress.current();
      const found = findActivity(current.id);
      const npc = found.workshop ? found.workshop.npc : CONTENT.final.npc;
      slot.append(button(npc.start, () => startActivity(current), {primary: true, icon: '→'}));
      say(`${npc.name}: ${npc.greeting}`, 'good');
      clearTimeout(timer);
      setTimeout(() => slot.querySelector('button')?.focus(), 30);
    } else if (dest) {
      slot.append(button(`${dest.name}로 걸어가기`, () => { village.walkToPlace(dest.id); announce(`${dest.name}로 걸어가요`); }, {primary: true, icon: '→'}));
      if (near && completedPlaceIds().includes(near.id)) say(`${near.name}: 완료한 작업장이에요. 도장이 찍혀 있어요!`);
      else if (near) say(`먼저 ${dest.name}에 가야 해요.`);
      else { bubble.hidden = true; clearTimeout(timer); }
    } else {
      slot.append(button('배송 결과 보기', showEnding, {primary: true, icon: '✦'}));
    }
  }
  village = createVillageScene({
    world, images: assets.images, sprites: assets.manifest.sprites, placeNames: PLACE_NAMES,
    player: player || progress.getExtra('player') || null, destination: destId, completed: completedPlaceIds(),
    onNear: near => renderSlot(near ? {...near, name: PLACE_NAMES[near.id] || near.id} : null),
    onMove: throttle(state => { progress.setExtra('player', state); }, 800)
  });
  scene.append(village.el, tip, bubble, slot);
  renderSlot(null);
  village.start();
  if (!dest) say('모든 작업을 마쳤어요! 배송 결과를 볼 수 있어요.');
}
function throttle(fn, ms) { let t = 0; return (...a) => { const now = Date.now(); if (now - t > ms) { t = now; fn(...a); } }; }

// ---------- 활동 실행 ----------
function startActivity(activityRef, {scored = true, onDone = afterActivity} = {}) {
  screen = 'activity';
  village?.stop(); village = null;
  const found = findActivity(activityRef.id);
  if (!found) { showVillage(); return; }
  hud.show(true); hud.update();
  mission = runMission({activity: found.activity, workshop: found.workshop, progress, scored, container: scene, hud, assets, onSave: save, onDone: () => onDone(found)});
}
function afterActivity(found) {
  save();
  const next = progress.current();
  const finishedWorkshopIndex = found.workshop ? CONTENT.workshops.indexOf(found.workshop) : CONTENT.workshops.length;
  if (!next) { showEnding(); return; }
  if (next.workshop === finishedWorkshopIndex) { startActivity(next); return; }
  // 작업장을 끝냈으면 그 건물 문 앞으로 돌아온다
  const place = world.places.find(p => p.id === PLACES[finishedWorkshopIndex].id);
  const player = place ? {x: place.door[0], y: place.door[1] + 40, direction: 2} : null;
  if (player && !world.canStand(player.x, player.y)) { player.y = place.door[1]; }
  if (player) { progress.setExtra('player', player); save(); }
  showVillage({player});
}

// ---------- 엔딩 ----------
function showEnding() {
  screen = 'ending';
  mission?.destroy(); mission = null; village?.stop(); village = null;
  clear(scene); hud.show(true);
  hud.setLocation('배송장'); hud.setGoal('내가 완성한 상자 보내기'); hud.setSub([]); hud.update();
  const art = node('canvas', {class: 'ending-art', width: 1200, height: 480, 'aria-hidden': 'true'});
  animateEnding(art, assets);
  const stamps = node('div', {class: 'stamps-row'}, CONTENT.workshops.map((w, i) => node('div', {class: `stamp-dot ${progress.workshopDone(i) ? 'done' : ''}`, text: w.name})));
  const record = node('div', {class: 'record'});
  for (const c of CONTENT.conceptRecord) {
    const acts = progress.activities.filter(a => a.workshop === c.workshop);
    const wrong = acts.reduce((s, a) => s + progress.wrongCount(a.id), 0);
    record.append(node('span', {class: 'k', text: c.label}), node('span', {text: wrong === 0 ? '한 번에 해결' : wrong <= 2 ? `오답 ${wrong}회 · 좋아요` : `오답 ${wrong}회 · 다시 보면 좋아요`}));
  }
  const wrongActs = progress.activities.filter(a => progress.wrongCount(a.id) > 0);
  sfx.stamp();
  const resultDialog = showOverlay([
    node('div', {class: 'ending-content', tabindex: '0', role: 'region', 'aria-label': '배송 결과와 학습 기록'}, [
    node('p', {class: 'mini', text: '여섯 작업장 완료'}),
    node('h2', {text: '배송 준비 완료!'}),
    node('p', {text: '네가 확인한 면, 선, 점 덕분에 장난감 상자가 안전하게 도착했어요.'}),
    art, stamps,
    node('p', {text: `${progress.title()} · ${progress.score().toLocaleString()}점 (최대 ${progress.maxScore().toLocaleString()}점)`}),
    record
    ]),
    node('div', {class: 'actions'}, [
      button('내 상자 돌려 보기', showMyBox),
      wrongActs.length ? button('틀린 작업 다시 하기', () => showPractice(wrongActs)) : null,
      button('마을로 돌아가기', () => showVillage(), {primary: true})
    ])
  ], {label: '배송 결과'});
  resultDialog.classList.add('ending-dialog');
}
function showMyBox() {
  const v = createSolidView({dims: {x: 5, y: 4, z: 2}, size: 300, mode: 'none', faceLabels: true, edgeLabels: {'LBF-RBF': '5cm', 'RBF-RTF': '4cm', 'RBF-RBK': '2cm'}});
  const robot = createRobotView({size: 260});
  showOverlay([
    node('h2', {text: '내가 포장한 5×4×2 상자와 로봇 장난감'}),
    node('div', {class: 'row', style: {justifyContent: 'center', gap: '20px'}}, [node('div', {}, [v.el, v.controls]), node('div', {}, [robot.el, robot.controls])]),
    node('p', {class: 'note', text: '면 6개, 모서리 12개, 꼭짓점 8개. 로봇은 직육면체 부품 6개(머리·몸통·팔 2·다리 2)로 만들었어요.'}),
    node('div', {class: 'actions'}, [button('돌아가기', showEnding, {primary: true})])
  ], {label: '내 상자', wide: true});
  if (!reducedMotion()) robot.spin();
}
function showPractice(acts) {
  showOverlay([
    node('h2', {text: '틀린 작업 다시 하기'}),
    node('p', {class: 'note', text: '다시 하기는 점수에 영향을 주지 않아요.'}),
    node('div', {class: 'list'}, acts.map(a => button(`${a.title} (오답 ${progress.wrongCount(a.id)}회)`, () => { hideOverlay(); startActivity(a, {scored: false, onDone: showEnding}); }))),
    node('div', {class: 'actions'}, [button('돌아가기', showEnding, {primary: true})])
  ], {label: '다시 하기'});
}

// ---------- 메뉴 · 도움말 ----------
function showPause() {
  if (!overlay.hidden || screen === 'title' || screen === 'boot') return;
  village?.setPaused(true);
  const soundBtn = button(settings.sound ? '소리 끄기' : '소리 켜기', () => { settings.sound = !settings.sound; setSoundEnabled(settings.sound); saveSettings(storage, settings); soundBtn.querySelector('span:last-child').textContent = settings.sound ? '소리 끄기' : '소리 켜기'; if (settings.sound) sfx.select(); });
  const motion = node('input', {type: 'checkbox', id: 'reduce', checked: !!settings.reduceMotion});
  motion.addEventListener('change', () => { settings.reduceMotion = motion.checked; app.classList.toggle('reduce-motion', motion.checked); saveSettings(storage, settings); });
  showOverlay([
    node('h2', {text: '메뉴'}),
    node('p', {class: 'note', text: `${progress.title()} · 도장 ${progress.stamps()}/6 · ${teacher ? '교사용 미리보기' : progress.score().toLocaleString() + '점'}`}),
    node('div', {class: 'toggle-row'}, [motion, node('label', {for: 'reduce', text: '동작 줄이기(애니메이션 최소화)'})]),
    node('p', {class: 'mini', text: '소리는 짧은 효과음만 있어요(배경음 없음).'}),
    node('div', {class: 'list'}, [
      soundBtn,
      button('도움말', () => { hideOverlay(); showHelp(); }),
      screen === 'activity' && !teacher ? button('마을로 돌아가기(지금 작업은 다시 시작)', () => { hideOverlay(); showVillage(); }) : null,
      teacher ? button('활동 목록', () => { hideOverlay(); showTeacherPicker(); }) : null,
      !teacher ? button('처음부터 다시 시작', confirmReset, {cls: 'danger'}) : null
    ]),
    node('div', {class: 'actions'}, [button('계속하기', () => { hideOverlay(); village?.setPaused(false); }, {primary: true})])
  ], {label: '메뉴'});
}
function confirmReset() {
  showOverlay([
    node('h2', {text: '정말 처음부터 다시 할까요?'}),
    node('p', {text: '지금까지의 도장과 점수가 모두 지워져요.'}),
    node('div', {class: 'actions'}, [button('취소', () => { hideOverlay(); if (screen === 'title') showTitle(); else showPause(); }), button('지우고 다시 시작', () => { try { storage?.removeItem(SAVE_KEY); } catch { /* 무시 */ } location.reload(); }, {cls: 'danger'})])
  ], {label: '다시 시작 확인'});
}
function showHelp() {
  village?.setPaused(true);
  const list = node('div', {class: 'list'});
  CONTENT.workshops.forEach((w, i) => {
    const done = progress.workshopDone(i), cur = progress.stage().workshop === i;
    list.append(node('p', {style: {margin: '2px 0'}, text: `${done ? '✔' : cur ? '▶' : '○'} ${i + 1}. ${w.name} — ${w.subtitle}`}));
  });
  list.append(node('p', {style: {margin: '2px 0'}, text: `${progress.finalDone() ? '✔' : '○'} 7. 배송장 — 종합 배송(5×4×2cm 상자)`}));
  showOverlay([
    node('h2', {text: '도움말'}),
    node('p', {text: '마을: 방향키·WASD·방향 패드로 걷고, 가고 싶은 곳을 누르면 걸어가요. 작업장 문 앞에서 ‘작업 시작’ 버튼을 눌러요.'}),
    node('p', {text: '작업장: 상자를 돌려 보며(드래그·◀▶·화살표 키) 직접 누르고, 확인 버튼을 눌러야 채점돼요. 돌려 보기·투명 보기·되돌리기는 점수와 관계없어요.'}),
    node('p', {text: '점수: 1000점 시작, 처음 성공 +10, 틀린 제출 -10(같은 답 반복은 추가 감점 없음), 도움 -3(작업마다 한 번).'}),
    list,
    node('div', {class: 'actions'}, [button('닫기', () => { hideOverlay(); village?.setPaused(false); }, {primary: true})])
  ], {label: '도움말'});
}

// ---------- 교사용 미리보기(6작업장 탭) ----------
function showTeacherPicker(tab = 0) {
  screen = 'teacher';
  mission?.destroy(); mission = null; village?.stop(); village = null; clear(scene);
  hud.setLocation('교사용 미리보기'); hud.setGoal('활동 고르기'); hud.setSub([]); hud.update();
  const tabs = node('div', {class: 'tabs', role: 'tablist'});
  const labels = [...CONTENT.workshops.map((w, i) => `${i + 1}. ${w.name}`), '7. 배송장'];
  labels.forEach((t, i) => tabs.append(button(t, () => showTeacherPicker(i), {cls: 'small', attrs: {role: 'tab', 'aria-selected': String(i === tab), 'aria-pressed': String(i === tab)}})));
  const list = node('div', {class: 'list', role: 'tabpanel'});
  if (tab < 6) {
    const w = CONTENT.workshops[tab];
    list.append(node('p', {class: 'note', text: `${w.subtitle} · ${w.learning}`}));
    w.missions.forEach((a, i) => list.append(button(`미션 ${i + 1}. ${a.title}`, () => { hideOverlay(); startActivity(a, {scored: false, onDone: () => showTeacherPicker(tab)}); }, {cls: 'small'})));
    w.reviews.forEach((a, i) => list.append(button(`복습 ${i + 1}. ${a.title.replace(/^복습 \d · /, '')}`, () => { hideOverlay(); startActivity(a, {scored: false, onDone: () => showTeacherPicker(tab)}); }, {cls: 'small'})));
  } else {
    list.append(node('p', {class: 'note', text: '5×4×2cm 주문 상자를 분류→검사→겨냥도→밑면→전개도 순서로 확인해요.'}));
    list.append(button(CONTENT.final.title, () => { hideOverlay(); startActivity(CONTENT.final, {scored: false, onDone: () => showTeacherPicker(6)}); }, {cls: 'small'}));
  }
  showOverlay([
    node('h2', {text: '교사용 미리보기'}),
    node('p', {class: 'mini', text: '학생 진행·점수와 분리되어 있고 저장하지 않아요. 주소의 ?teacher=1 을 지우면 학생 모드예요.'}),
    node('div', {class: 'row'}, [button('마을 미리보기(이동 확인)', () => { hideOverlay(); showVillage(); }, {cls: 'small'})]),
    tabs, list
  ], {label: '교사용 미리보기', wide: true});
}

// ---------- 시작 ----------
$('pause').addEventListener('click', showPause);
$('help').addEventListener('click', () => (overlay.hidden ? showHelp() : null));
window.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.hidden) showPause(); });
boot();
