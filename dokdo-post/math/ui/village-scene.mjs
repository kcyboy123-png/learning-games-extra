// 배송 마을(업그레이드): 그림 지도(assets/village-world.webp) 위에서 스프라이트 시트 캐릭터가 걷는다.
// 지도는 코드로 다시 그리지 않는다. 지도 그림이 없으면 단순한 평면 폴백(풀·길·문 표지)만 그린다.
import {moveActor} from '../lib/movement.mjs';
import {frameRect} from './assets.mjs';
import {drawKid, drawMoa} from './sprites.mjs';
import {node, reducedMotion} from './dom.mjs?v=tablet-20261115';

const VIEW_W = 1024, VIEW_H = 768;
const SPEED = 150;           // 월드 px/초
const NEAR_RADIUS = 48;

function facingOf(dir) {
  if (dir === 1 || dir === 2 || dir === 3) return 'down';
  if (dir === 5 || dir === 6 || dir === 7) return 'up';
  return dir === 4 ? 'left' : 'right';
}

export function createVillageScene(opts) {
  const {world, images = {}, sprites} = opts;
  const zoom = opts.zoom || 1.5;
  // 이전 지도에서 저장된 위치가 새 길 밖이면 진행 기록은 유지하고 광장에서 다시 걷는다.
  const start = opts.player && world.canStand(opts.player.x, opts.player.y) ? [opts.player.x, opts.player.y] : world.start;
  const state = {
    player: {x: start[0], y: start[1], direction: opts.player?.direction ?? 2, moving: false},
    moa: {x: start[0] - 34, y: start[1] + 4, direction: 2, moving: false},
    trail: [], keys: new Set(), padDir: null, path: null,
    destination: opts.destination || null, completed: new Set(opts.completed || []),
    cam: {x: 0, y: 0}, time: 0, running: false, paused: false, guide: [], near: null, lastGuideCell: null
  };
  const onNear = opts.onNear || (() => {});
  const onMove = opts.onMove || (() => {});
  const root = node('div', {class: 'village', style: {position: 'absolute', inset: 0}});
  const canvas = node('canvas', {width: VIEW_W, height: VIEW_H, role: 'img', 'aria-label': '배송 마을. 방향키나 화면 터치로 걸어가요.'});
  root.append(canvas);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

  // 방향 패드(작고 반투명)
  const dpad = node('div', {class: 'dpad', role: 'group', 'aria-label': '방향 패드'});
  const mk = (cls, label, dir) => {
    const b = node('button', {class: cls, type: 'button', 'aria-label': label, text: {up: '▲', down: '▼', left: '◀', right: '▶'}[cls]});
    const hold = e => { e.preventDefault(); state.padDir = dir; state.path = null; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch { /* 무시 */ } };
    const release = () => { if (state.padDir === dir) state.padDir = null; b.classList.remove('held'); };
    b.addEventListener('pointerdown', hold); b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.padDir = dir; state.path = null; } });
    b.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') release(); });
    return b;
  };
  dpad.append(mk('up', '위로 걷기', [0, -1]), mk('left', '왼쪽으로 걷기', [-1, 0]), mk('right', '오른쪽으로 걷기', [1, 0]), mk('down', '아래로 걷기', [0, 1]));
  root.append(dpad);

  const canStand = (x, y) => world.canStand(x, y);
  function keyVector() {
    const k = state.keys; let x = 0, y = 0;
    if (k.has('ArrowLeft') || k.has('a') || k.has('A')) x -= 1;
    if (k.has('ArrowRight') || k.has('d') || k.has('D')) x += 1;
    if (k.has('ArrowUp') || k.has('w') || k.has('W')) y -= 1;
    if (k.has('ArrowDown') || k.has('s') || k.has('S')) y += 1;
    if (!x && !y && state.padDir) [x, y] = state.padDir;
    return {x, y};
  }
  function onKeyDown(e) {
    if (state.paused || !state.running) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S'].includes(e.key)) return;
    if (document.activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    e.preventDefault(); state.keys.add(e.key); state.path = null;
  }
  function onKeyUp(e) { state.keys.delete(e.key); }
  canvas.addEventListener('pointerdown', e => {
    if (state.paused) return;
    const rect = canvas.getBoundingClientRect();
    const wx = (e.clientX - rect.left) / rect.width * VIEW_W / zoom + state.cam.x;
    const wy = (e.clientY - rect.top) / rect.height * VIEW_H / zoom + state.cam.y;
    api.walkToWorld(wx, wy);
  });

  let last = 0, raf = 0;
  function frame(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (!state.paused) step(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    state.time += dt;
    let v = keyVector();
    if (!v.x && !v.y && state.path && state.path.length) {
      const [tx, ty] = state.path[0];
      const dx = tx - state.player.x, dy = ty - state.player.y;
      if (Math.hypot(dx, dy) < 4) { state.path.shift(); if (!state.path.length) state.path = null; }
      else v = {x: dx, y: dy};
    }
    const before = {x: state.player.x, y: state.player.y};
    state.player = moveActor(state.player, v, dt, SPEED, canStand);
    if (state.player.moving) {
      state.trail.push({x: state.player.x, y: state.player.y});
      if (state.trail.length > 40) state.trail.shift();
    }
    const target = state.trail.length > 12 ? state.trail[state.trail.length - 12] : null;
    if (target) {
      const dx = target.x - state.moa.x, dy = target.y - state.moa.y, dist = Math.hypot(dx, dy);
      state.moa = dist > 5 ? moveActor(state.moa, {x: dx, y: dy}, dt, Math.min(SPEED * 1.1, dist / Math.max(dt, 0.016)), () => true) : {...state.moa, moving: false};
    } else state.moa = {...state.moa, moving: false};
    // 안내 경로 갱신(칸이 바뀔 때만)
    const cell = world.cellOf(state.player.x, state.player.y).join(',');
    if (cell !== state.lastGuideCell) { state.lastGuideCell = cell; updateGuide(); }
    // 문 근처 판정
    const near = world.placeNear(state.player.x, state.player.y, NEAR_RADIUS);
    const nearId = near ? near.id : null;
    if (nearId !== (state.near ? state.near.id : null)) { state.near = near; onNear(near); }
    if (before.x !== state.player.x || before.y !== state.player.y) onMove(api.getState());
  }
  function updateGuide() {
    const dest = world.places.find(p => p.id === state.destination);
    state.guide = dest ? (world.findPath([state.player.x, state.player.y], dest.door) || []) : [];
  }

  // ---------- 그리기 ----------
  function render() {
    const vw = VIEW_W / zoom, vh = VIEW_H / zoom;
    const tx = Math.max(0, Math.min(world.width - vw, state.player.x - vw / 2));
    const ty = Math.max(0, Math.min(world.height - vh, state.player.y - vh / 2 + 30));
    const k = reducedMotion() ? 1 : 0.14;
    state.cam.x += (tx - state.cam.x) * k; state.cam.y += (ty - state.cam.y) * k;
    if (Math.abs(tx - state.cam.x) < .3) state.cam.x = tx;
    if (Math.abs(ty - state.cam.y) < .3) state.cam.y = ty;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.setTransform(zoom, 0, 0, zoom, -state.cam.x * zoom, -state.cam.y * zoom);
    if (images.world) ctx.drawImage(images.world, 0, 0, world.width, world.height);
    else drawFallbackGround();
    drawGuide();
    drawDoorMarks();
    const actors = [
      {y: state.moa.y, draw: () => drawActor('moa', state.moa)},
      {y: state.player.y, draw: () => drawActor('hero', state.player)}
    ].sort((a, b) => a.y - b.y);
    for (const a of actors) a.draw();
  }
  function drawFallbackGround() {
    ctx.fillStyle = '#8fbf6a'; ctx.fillRect(0, 0, world.width, world.height);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = 0; y < world.height; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < world.width; x += 64) ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = '#dccaa5';
    for (const r of world.rects) { ctx.fillRect(r.x, r.y, r.w, r.h); }
    ctx.strokeStyle = 'rgba(120,90,50,.25)'; ctx.lineWidth = 3;
    for (const r of world.rects) ctx.strokeRect(r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3);
    // 문 표지(건물 그림이 없을 때만)
    ctx.font = 'bold 15px "Noto Sans KR","Malgun Gothic",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const p of world.places) {
      const name = opts.placeNames?.[p.id] || p.id;
      ctx.fillStyle = '#5a3d1c'; ctx.fillRect(p.door[0] - 3, p.door[1] - 52, 6, 40);
      ctx.fillStyle = '#fff7df'; roundRect(p.door[0] - 52, p.door[1] - 70, 104, 24, 7); ctx.fill();
      ctx.fillStyle = '#1f4d44'; ctx.fillText(name, p.door[0], p.door[1] - 58);
    }
  }
  function drawGuide() {
    if (!state.guide.length) return;
    ctx.fillStyle = 'rgba(42,167,163,.55)';
    let acc = 0;
    for (let i = 1; i < state.guide.length; i++) {
      acc += Math.hypot(state.guide[i][0] - state.guide[i - 1][0], state.guide[i][1] - state.guide[i - 1][1]);
      if (acc < 40) continue;
      acc = 0;
      ctx.beginPath(); ctx.arc(state.guide[i][0], state.guide[i][1], 3.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawDoorMarks() {
    for (const p of world.places) {
      const [dx, dy] = p.door;
      if (state.completed.has(p.id)) {
        // 완료 도장: 작은 금색 배지
        ctx.fillStyle = 'rgba(226,178,60,.92)'; ctx.beginPath(); ctx.arc(dx + 26, dy - 44, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#8a5a12'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(dx + 21, dy - 44); ctx.lineTo(dx + 25, dy - 40); ctx.lineTo(dx + 31, dy - 48); ctx.stroke();
      }
      if (p.id !== state.destination) continue;
      // 목적지: 문 앞 부드러운 고리 + 이름표 + 느낌표
      const pulse = reducedMotion() ? 0.5 : (Math.sin(state.time * 3) + 1) / 2;
      ctx.strokeStyle = `rgba(42,167,163,${0.45 + pulse * 0.4})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(dx, dy + 6, 24 + pulse * 4, 11 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
      const bob = reducedMotion() ? 0 : Math.sin(state.time * 3) * 3;
      const by = dy - 78 + bob;
      const name = opts.placeNames?.[p.id] || p.id;
      ctx.font = 'bold 14px "Noto Sans KR","Malgun Gothic",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(name).width + 34;
      ctx.fillStyle = 'rgba(31,77,68,.92)'; roundRect(dx - w / 2, by - 13, w, 26, 13); ctx.fill();
      ctx.fillStyle = '#f7d774'; ctx.beginPath(); ctx.arc(dx - w / 2 + 14, by, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1f4d44'; ctx.fillText('!', dx - w / 2 + 14, by + 1);
      ctx.fillStyle = '#fff7df'; ctx.fillText(name, dx + 8, by + 1);
    }
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function drawActor(kind, actor) {
    const sp = sprites[kind];
    const screenH = sp.screenHeight || (kind === 'hero' ? 100 : 62);
    const worldH = screenH / zoom;
    // 그림자(런타임)
    ctx.fillStyle = 'rgba(20,30,20,.25)';
    ctx.beginPath(); ctx.ellipse(actor.x, actor.y + 2, worldH * 0.22, worldH * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    const img = images[kind];
    const walkStep = actor.moving ? Math.floor(state.time * 7) % 2 : 0;
    if (img) {
      const f = frameRect(sp, facingOf(actor.direction), walkStep);
      const scale = worldH / sp.frameHeight;
      const dw = sp.frameWidth * scale, dh = sp.frameHeight * scale;
      const bobY = actor.moving && !reducedMotion() ? (walkStep ? -1 : 0) : 0;
      ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, actor.x - sp.foot[0] * scale, actor.y - sp.foot[1] * scale + bobY, dw, dh);
      return;
    }
    // 폴백: 벡터 캐릭터(원본 높이 약 76px) — 지도 위 크기만 맞춘다
    const s = worldH / (kind === 'hero' ? 78 : 68);
    if (kind === 'hero') drawKid(ctx, actor.x, actor.y, actor.direction, state.time * 10, s, actor.moving);
    else drawMoa(ctx, actor.x, actor.y, actor.direction, state.time * 10, s, actor.moving);
  }

  const api = {
    el: root, canvas, state,
    start() {
      if (state.running) return;
      state.running = true; last = performance.now();
      window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
      updateGuide();
      const vw = VIEW_W / zoom, vh = VIEW_H / zoom;
      state.cam.x = Math.max(0, Math.min(world.width - vw, state.player.x - vw / 2));
      state.cam.y = Math.max(0, Math.min(world.height - vh, state.player.y - vh / 2 + 30));
      raf = requestAnimationFrame(frame);
    },
    stop() { state.running = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); state.keys.clear(); state.padDir = null; },
    setPaused(p) { state.paused = p; state.keys.clear(); state.padDir = null; },
    setDestination(id) { state.destination = id; updateGuide(); },
    setCompleted(ids) { state.completed = new Set(ids); },
    getState() { return {x: state.player.x, y: state.player.y, direction: state.player.direction}; },
    nearPlace() { return state.near; },
    walkToWorld(wx, wy) {
      const path = world.findPath([state.player.x, state.player.y], [wx, wy]);
      if (path && path.length > 1) { state.path = path.slice(1); return true; }
      return false;
    },
    walkToPlace(id) {
      const p = world.places.find(x => x.id === id);
      if (!p) return false;
      const path = world.findPath([state.player.x, state.player.y], p.door);
      if (path && path.length > 1) { state.path = path.slice(1); return true; }
      return false;
    },
    stepBack() {
      for (const [dx, dy] of [[0, 40], [0, -40], [40, 0], [-40, 0]]) {
        if (canStand(state.player.x + dx, state.player.y + dy)) { state.player = {...state.player, x: state.player.x + dx, y: state.player.y + dy}; break; }
      }
      state.path = null;
    },
    render
  };
  return api;
}
