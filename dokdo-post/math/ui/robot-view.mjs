// 직육면체 부품으로 조립한 로봇 장난감(회전 가능 SVG). 머리 2×2×2, 몸통 4×3×2, 팔 1×3×1 ×2, 다리 1×3×1 ×2.
import {rotate, norm, dot} from '../lib/geometry.mjs';
import {svg, node, button, clear} from './dom.mjs?v=tablet-20261115';

const LIGHT = norm([0.35, 0.8, 0.55]);
// 부품: dims(x,y,z), center(x,y,z), 색
export const ROBOT_PARTS = [
  {id: 'head', name: '머리', dims: [2, 2, 2], center: [0, 4.0, 0], rgb: [214, 178, 131]},
  {id: 'body', name: '몸통', dims: [4, 3, 2], center: [0, 1.5, 0], rgb: [204, 166, 118]},
  {id: 'armL', name: '팔', dims: [1, 3, 1], center: [-2.6, 1.5, 0], rgb: [222, 188, 140]},
  {id: 'armR', name: '팔', dims: [1, 3, 1], center: [2.6, 1.5, 0], rgb: [222, 188, 140]},
  {id: 'legL', name: '다리', dims: [1, 3, 1], center: [-0.9, -1.6, 0], rgb: [196, 158, 110]},
  {id: 'legR', name: '다리', dims: [1, 3, 1], center: [0.9, -1.6, 0], rgb: [196, 158, 110]}
];
function boxFaces(part) {
  const [w, h, d] = part.dims, [cx, cy, cz] = part.center;
  const v = s => [cx + s[0] * w / 2, cy + s[1] * h / 2, cz + s[2] * d / 2];
  const faces = [
    {n: [0, 0, 1], pts: [v([-1, -1, 1]), v([1, -1, 1]), v([1, 1, 1]), v([-1, 1, 1])]},
    {n: [0, 0, -1], pts: [v([1, -1, -1]), v([-1, -1, -1]), v([-1, 1, -1]), v([1, 1, -1])]},
    {n: [0, 1, 0], pts: [v([-1, 1, 1]), v([1, 1, 1]), v([1, 1, -1]), v([-1, 1, -1])]},
    {n: [0, -1, 0], pts: [v([-1, -1, -1]), v([1, -1, -1]), v([1, -1, 1]), v([-1, -1, 1])]},
    {n: [1, 0, 0], pts: [v([1, -1, 1]), v([1, -1, -1]), v([1, 1, -1]), v([1, 1, 1])]},
    {n: [-1, 0, 0], pts: [v([-1, -1, -1]), v([-1, -1, 1]), v([-1, 1, 1]), v([-1, 1, -1])]}
  ];
  return faces.map(f => ({...f, part}));
}

export function createRobotView({size = 340, parts = ROBOT_PARTS, unit = 26, interactive = true} = {}) {
  const state = {yaw: -0.5, pitch: 0.35, done: new Set(parts.map(p => p.id))};
  const root = node('div', {class: 'robot-view', style: {display: 'inline-block', textAlign: 'center'}});
  const el = svg('svg', {viewBox: `${-size / 2} ${-size / 2} ${size} ${size}`, width: size, height: size, role: 'img', 'aria-label': '조립한 로봇 장난감', style: 'touch-action:none'});
  root.append(el);
  function draw() {
    clear(el);
    el.append(svg('ellipse', {cx: 0, cy: size * 0.4, rx: size * 0.3, ry: size * 0.06, fill: 'rgba(40,25,10,.22)'}));
    const faces = [];
    for (const part of parts) {
      if (!state.done.has(part.id)) continue;
      for (const f of boxFaces(part)) {
        const n = rotate(f.n, state.yaw, state.pitch);
        if (n[2] <= 0) continue;
        const pts = f.pts.map(p => rotate(p, state.yaw, state.pitch));
        faces.push({pts, n, depth: pts.reduce((s, p) => s + p[2], 0) / 4, rgb: part.rgb, part});
      }
    }
    faces.sort((a, b) => a.depth - b.depth);
    for (const f of faces) {
      const bright = 0.6 + 0.4 * Math.max(0, dot(f.n, LIGHT));
      const fill = `rgb(${f.rgb.map(c => Math.round(c * bright)).join(',')})`;
      el.append(svg('polygon', {points: f.pts.map(p => `${p[0] * unit},${-p[1] * unit + size * 0.08}`).join(' '), fill, stroke: '#5a3d1c', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}));
      // 머리 앞면에 로봇 얼굴
      if (f.part.id === 'head' && f.n[2] > 0.5 && Math.abs(dot(f.n, rotate([0, 0, 1], state.yaw, state.pitch))) > 0.9) {
        const c = f.pts.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
        el.append(svg('rect', {x: c[0] * unit - 16, y: -c[1] * unit + size * 0.08 - 10, width: 32, height: 18, rx: 4, fill: '#1d2a2e'}));
        el.append(svg('rect', {x: c[0] * unit - 9, y: -c[1] * unit + size * 0.08 - 6, width: 4, height: 9, rx: 2, fill: '#fff4b0'}));
        el.append(svg('rect', {x: c[0] * unit + 5, y: -c[1] * unit + size * 0.08 - 6, width: 4, height: 9, rx: 2, fill: '#fff4b0'}));
      }
    }
  }
  let drag = null;
  if (interactive) {
    el.addEventListener('pointerdown', e => { drag = {x: e.clientX, y: e.clientY}; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!drag) return; api.rotate((e.clientX - drag.x) * 0.012, (e.clientY - drag.y) * 0.012); drag = {x: e.clientX, y: e.clientY}; });
    el.addEventListener('pointerup', () => { drag = null; });
    el.addEventListener('pointercancel', () => { drag = null; });
  }
  const controls = node('div', {class: 'rot', role: 'group', 'aria-label': '로봇 돌려 보기'}, [
    button('◀', () => api.rotate(-0.35, 0), {cls: 'small', attrs: {'aria-label': '왼쪽으로 돌리기'}}),
    button('▶', () => api.rotate(0.35, 0), {cls: 'small', attrs: {'aria-label': '오른쪽으로 돌리기'}}),
    button('▲', () => api.rotate(0, -0.3), {cls: 'small', attrs: {'aria-label': '위로 돌리기'}}),
    button('▼', () => api.rotate(0, 0.3), {cls: 'small', attrs: {'aria-label': '아래로 돌리기'}})
  ]);
  const api = {
    el: root, svg: el, controls,
    rotate(dy, dp) { state.yaw += dy; state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch + dp)); draw(); },
    setDone(ids) { state.done = new Set(ids); draw(); },
    spin(ms = 1800) {
      const t0 = performance.now(), from = state.yaw;
      const tick = now => { const k = Math.min(1, (now - t0) / ms); state.yaw = from + k * Math.PI * 2; draw(); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    },
    redraw: draw
  };
  draw();
  return api;
}
