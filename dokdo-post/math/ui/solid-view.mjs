// 회전하는 입체 뷰어(SVG). 면·모서리·꼭짓점은 수학 좌표에서 투영하며, 보이는 요소만 누를 수 있다.
import {cuboid, rotate, FACE_LABEL, prism, regularPolygon, boxMesh, cross, sub, dot, norm, facesAtVertex, OPPOSITE} from '../lib/geometry.mjs';
import {svg, node, button, pressable, setPressed, clear, reducedMotion} from './dom.mjs?v=tablet-20261115';
import {paperSurface} from './paper-surface.mjs';

const BASE_RGB = [214, 178, 131];
const LIGHT = norm([0.35, 0.8, 0.55]);
const PAIR_COLORS = ['#f0a63a', '#4f9bd6', '#9b6fd0'];
const PAIR_MARKS = ['①', '②', '③'];
let patternSeq = 0;

function shade(rgb, n) {
  const b = 0.6 + 0.4 * Math.max(0, dot(n, LIGHT));
  return `rgb(${rgb.map(c => Math.round(c * b)).join(',')})`;
}
function centroid(points) { return points.reduce((a, p) => [a[0] + p[0] / points.length, a[1] + p[1] / points.length, a[2] + p[2] / points.length], [0, 0, 0]); }
function newell(points) {
  const n = [0, 0, 0];
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return norm(n);
}

// 분류대의 일반 입체 메시
export function meshFor(desc) {
  const s = 1;
  if (desc.kind === 'cuboid' || desc.kind === 'cube') {
    const d = desc.dims; const m = boxMesh(d.x * s, d.y * s, d.z * s);
    return {...m, strokeAll: true, faceNames: ['bottom', 'top', 'back', 'right', 'front', 'left']};
  }
  if (desc.kind === 'cylinder') { const m = prism(regularPolygon(28, 1.5), 3); return {...m, smoothSides: true}; }
  if (desc.kind === 'tri-prism') { const m = prism([[-1.6, 1.2], [1.6, 1.2], [0, -1.4]], 3); return {...m, strokeAll: true}; }
  if (desc.kind === 'oblique') { const m = prism([[-1.8, -1], [1.8, -1], [1.8, 1], [-1.8, 1]], 2.6, {shear: [1.3, 0]}); return {...m, strokeAll: true}; }
  if (desc.kind === 'hex-prism') { const m = prism(regularPolygon(6, 1.6), 2.8); return {...m, strokeAll: true}; }
  if (desc.kind === 'pyramid') {
    const b = 1.7, h = 2.8;
    return {vertices: [[-b, -h / 2, -b], [b, -h / 2, -b], [b, -h / 2, b], [-b, -h / 2, b], [0, h / 2, 0]],
      faces: [{ids: [3, 2, 1, 0], kind: 'cap'}, {ids: [0, 1, 4]}, {ids: [1, 2, 4]}, {ids: [2, 3, 4]}, {ids: [3, 0, 4]}], strokeAll: true};
  }
  return boxMesh(2, 2, 2);
}

export function createSolidView(opts = {}) {
  const size = opts.size || 440;
  const unit = opts.scale || (opts.dims ? Math.min(58, 300 / Math.max(opts.dims.x, opts.dims.y, opts.dims.z)) : 48);
  const state = {
    yaw: opts.yaw ?? -0.6, pitch: opts.pitch ?? 0.45, mode: opts.mode || 'none', kind: opts.kind || (opts.mode === 'all' ? 'faces' : opts.mode),
    transparent: !!opts.transparent, selected: {faces: new Set(), edges: new Set(), vertices: new Set(), diagonals: new Set()},
    pairs: [], pending: null, wrong: {faces: new Set(), edges: new Set(), vertices: new Set(), diagonals: new Set(), pairs: new Set()},
    glowFaces: new Set(), revealFace: null, peeled: null
  };
  const onSelect = opts.onSelect || (() => {});
  const solid = opts.dims ? cuboid(opts.dims.x, opts.dims.y, opts.dims.z) : null;
  const mesh = opts.mesh ? opts.mesh : null;
  const root = node('div', {class: 'solid-view', style: {position: 'relative', display: 'inline-block'}});
  const el = svg('svg', {viewBox: `${-size / 2} ${-size / 2} ${size} ${size}`, width: size, height: size, tabindex: '0', role: 'group', 'aria-label': opts.ariaLabel || '돌려 볼 수 있는 상자. 화살표 키로 회전해요.', style: 'touch-action:none;outline-offset:2px'});
  root.append(el);
  const pid = `stamp${patternSeq++}`;
  let paperFill;

  function project(pos) {
    const p = rotate(pos, state.yaw, state.pitch);
    return {x: p[0] * unit, y: -p[1] * unit, z: p[2]};
  }
  function faceData() {
    if (solid) {
      return solid.faces.map(f => {
        const pts = f.vertices.map(v => solid.vertex(v).pos);
        const n = rotate(f.normal, state.yaw, state.pitch);
        return {id: f.id, pts, n, visible: n[2] > 1e-6, name: f.name, edges: f.edges, verts: f.vertices, dims: f.dims};
      });
    }
    const center = centroid(mesh.vertices);
    return mesh.faces.map((f, i) => {
      const pts = f.ids.map(id => mesh.vertices[id]);
      let n = newell(pts);
      if (dot(n, sub(centroid(pts), center)) < 0) n = n.map(v => -v);
      const nr = rotate(n, state.yaw, state.pitch);
      return {id: mesh.faceNames?.[i] || `f${i}`, index: i, pts, n: nr, visible: nr[2] > 1e-6, kind: f.kind, smooth: mesh.smoothSides && f.kind === 'side'};
    });
  }

  function draw() {
    clear(el);
    paperFill = paperSurface(el);
    const defs = svg('defs');
    const pat = svg('pattern', {id: pid, width: 10, height: 10, patternUnits: 'userSpaceOnUse'});
    pat.append(svg('rect', {width: 10, height: 10, fill: 'rgba(42,167,163,.18)'}));
    pat.append(svg('rect', {width: 5, height: 5, fill: 'rgba(42,167,163,.35)'}));
    pat.append(svg('rect', {x: 5, y: 5, width: 5, height: 5, fill: 'rgba(42,167,163,.35)'}));
    defs.append(pat); el.append(defs);
    const faces = faceData();
    const back = faces.filter(f => !f.visible), front = faces.filter(f => f.visible);
    const sortByDepth = list => list.map(f => ({f, d: f.pts.reduce((s, p) => s + project(p).z, 0)})).sort((a, b) => a.d - b.d).map(x => x.f);
    // 작업대 접지 그림자(도형 아래)
    if (opts.groundShadow !== false) {
      const lowest = Math.max(...faces.flatMap(f => f.pts.map(p => project(p).y)));
      if(opts.postal){el.append(svg('ellipse',{cx:0,cy:lowest+12,rx:size*.39,ry:size*.085,fill:'#f6ecd4',stroke:'#d9c9a5','stroke-width':2,'pointer-events':'none'}),svg('ellipse',{cx:0,cy:lowest+12,rx:size*.37,ry:size*.072,fill:'none',stroke:'#b6c4a4','stroke-width':1.5,'stroke-dasharray':'4 5','pointer-events':'none'}));}
      el.append(svg('ellipse', {cx: 0, cy: lowest + 10, rx: size * 0.3, ry: size * 0.045, fill: opts.postal?'rgba(128,99,64,.13)':'rgba(40,25,10,.22)', 'pointer-events': 'none'}));
    }
    const gBack = svg('g', {class: 'back-faces'}), gFront = svg('g', {class: 'front-faces'}), gEdges = svg('g'), gVerts = svg('g'), gLabels = svg('g');
    if (state.transparent) for (const f of sortByDepth(back)) gBack.append(facePolygon(f, true));
    for (const f of sortByDepth(front)) gFront.append(facePolygon(f, false));
    el.append(gBack, gFront, gEdges, gVerts, gLabels);
    if (solid) {
      drawEdges(gEdges, faces);
      drawVertices(gVerts, faces);
      drawFaceLabels(gLabels, faces);
    }
    if (mesh && state.revealFace !== null) {
      const f = faces[state.revealFace];
      if (f) {
        const c = f.pts.reduce((a, p) => { const q = project(p); return [a[0] + q.x / f.pts.length, a[1] + q.y / f.pts.length]; }, [0, 0]);
        gLabels.append(svg('text', {x: c[0], y: c[1] + 6, class: 'label big', 'text-anchor': 'middle', text: opts.revealLabel || '이 면'}));
      }
    }
  }
  function facePolygon(f, isBack) {
    const pts = f.pts.map(p => project(p));
    const poly = svg('polygon', {points: pts.map(p => `${p.x},${p.y}`).join(' ')});
    const selectedPair = state.pairs.findIndex(pr => pr.includes(f.id));
    const isSel = state.selected.faces.has(f.id);
    let fill = opts.postal ? `rgb(${[248,224,184].map(c=>Math.round(c*(.80+.20*Math.max(0,dot(f.n,LIGHT))))).join(',')})` : shade(opts.color || BASE_RGB, f.n);
    if (selectedPair >= 0) fill = PAIR_COLORS[selectedPair % 3];
    if (state.revealFace !== null && f.index === state.revealFace) fill = '#e97b6b';
    if (state.glowFaces.has(f.id)) fill = '#ffe08a';
    poly.setAttribute('fill', fill);
    poly.classList.add('face');
    if (f.smooth) poly.setAttribute('stroke', 'none');
    if (isBack) { poly.setAttribute('opacity', '.28'); poly.setAttribute('stroke-dasharray', '6 6'); return poly; }
    if (f.id === state.peeled) { poly.setAttribute('fill', '#fff3c4'); poly.setAttribute('stroke-dasharray', '8 6'); }
    const g = svg('g');
    if(opts.postal&&!isSel&&selectedPair<0&&!state.glowFaces.has(f.id)){
      const id=`${pid}-soft-${f.id}`,gradient=svg('linearGradient',{id,x1:'0%',y1:'0%',x2:'85%',y2:'100%'});
      gradient.append(svg('stop',{offset:'0%', 'stop-color':'#fff9e4'}),svg('stop',{offset:'58%','stop-color':fill}),svg('stop',{offset:'100%','stop-color':fill}));g.append(svg('defs',{},[gradient]));poly.setAttribute('fill',`url(#${id})`);
    }
    g.append(poly);
    if (solid && pts.length === 4) {
      const c = center2(pts);
      g.append(svg('polygon', {points: poly.getAttribute('points'), fill: paperFill, class: 'paper-grain', 'pointer-events': 'none'}));
      g.append(svg('polygon', {points: pts.map(p => `${p.x*.975+c[0]*.025},${p.y*.975+c[1]*.025}`).join(' '), fill: 'none', stroke: '#fff0ca', 'stroke-width': 1.1, opacity: '.45', class: 'paper-grain', 'pointer-events': 'none'}));
    }
    // 골판지 재질: 면 가운데 옅은 테이프 띠(상자 느낌). 선택·강조 상태에서는 생략.
    if (solid && !isSel && selectedPair < 0 && !state.glowFaces.has(f.id) && opts.material !== false && pts.length === 4) {
      const mid = (a, b, t) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
      const p0 = mid(pts[0], pts[1], 0.42), p1 = mid(pts[0], pts[1], 0.58), p2 = mid(pts[3], pts[2], 0.58), p3 = mid(pts[3], pts[2], 0.42);
      g.append(svg('polygon', {points: [p0, p1, p2, p3].map(p => `${p.x},${p.y}`).join(' '), fill: opts.postal?'#b9ccb0':'rgba(255,255,255,.14)', opacity:opts.postal?.72:1, 'pointer-events': 'none'}));
      if(opts.postal&&f.id==='front'&&['vertices','none'].includes(state.mode)){
        const c=center2(pts),seal=svg('g',{'pointer-events':'none',transform:`translate(${c[0]},${c[1]})`});
        seal.append(svg('ellipse',{cx:0,cy:2,rx:27,ry:23,fill:'#ba9e7133'}),svg('ellipse',{cx:0,cy:0,rx:27,ry:23,fill:'#fff5df',stroke:'#dcc9a5','stroke-width':1.5}),svg('path',{d:'M-9 8Q-23-13 6-13Q19 5-9 8Z',fill:'#90ad81'}),svg('path',{d:'M-13 15Q-5 1 8-8',fill:'none',stroke:'#607e59','stroke-width':2,'stroke-linecap':'round'}));g.append(seal);
      }
    }
    if (isSel) {
      poly.classList.add('selected');
      const overlay = svg('polygon', {points: poly.getAttribute('points'), fill: `url(#${pid})`, 'pointer-events': 'none'});
      overlay.classList.add('selection-pattern'); g.append(overlay);
      const c = center2(pts);
      g.append(svg('circle', {cx: c[0], cy: c[1], r: 16, fill: opts.postal&&!state.wrong.faces.has(f.id)?'#55784a':'#c74b3f', opacity: .9, 'pointer-events': 'none'}));
      g.append(svg('text', {x: c[0], y: c[1] + 6, class: 'label', fill: '#fff', style: 'fill:#fff;stroke:none;font-size:16px', 'text-anchor': 'middle', text: '✓'}));
    }
    if (state.wrong.faces.has(f.id)) poly.classList.add('wrong');
    if (state.pending === f.id) { poly.classList.add('selected'); }
    if (selectedPair >= 0) {
      const c = center2(pts);
      g.append(svg('text', {x: c[0], y: c[1] + 8, class: 'label big', 'text-anchor': 'middle', text: PAIR_MARKS[selectedPair % 3]}));
      if (state.wrong.pairs.has(state.pairs[selectedPair].join('+'))) poly.classList.add('wrong');
    }
    const selectable = solid && (state.kind === 'faces' || state.kind === 'pairs' || state.mode === 'peel') || (mesh && opts.faceSelectable);
    if (selectable) pressable(poly, () => handleFace(f.id), `${FACE_LABEL[f.id] || '면'}`);
    if (opts.diagonals && state.kind === 'edges' && solid) {
      const p0 = pts[0], p2 = pts[2];
      const hit = svg('line', {x1: p0.x, y1: p0.y, x2: p2.x, y2: p2.y, class: 'diag-hit'});
      const line = svg('line', {x1: p0.x, y1: p0.y, x2: p2.x, y2: p2.y, class: 'diag' + (state.selected.diagonals.has('diag-' + f.id) ? ' selected' : '') + (state.wrong.diagonals.has('diag-' + f.id) ? ' selected' : '')});
      pressable(hit, () => handleDiagonal('diag-' + f.id), '면 안의 대각선(모서리가 아님)');
      g.append(hit, line);
    }
    return g;
  }
  function center2(pts) { return pts.reduce((a, p) => [a[0] + p.x / pts.length, a[1] + p.y / pts.length], [0, 0]); }
  function drawEdges(g, faces) {
    for (const e of solid.edges) {
      const fa = faces.filter(f => f.edges.includes(e.id));
      const visible = fa.some(f => f.visible);
      if (!visible && !state.transparent) continue;
      const a = project(solid.vertex(e.a).pos), b = project(solid.vertex(e.b).pos);
      const cls = ['edge'];
      if (!visible) cls.push('hidden-dim');
      if (state.selected.edges.has(e.id)) cls.push('selected');
      if (state.wrong.edges.has(e.id)) cls.push('wrong');
      const line = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls.join(' ')});
      if (visible && state.kind === 'edges') {
        const hit = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'edge-hit'});
        pressable(hit, () => handleEdge(e.id), `모서리 ${e.length}cm`);
        g.append(hit);
      }
      g.append(line);
      if (opts.edgeLabels?.[e.id]) {
        g.append(svg('text', {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8, class: 'label', 'text-anchor': 'middle', text: opts.edgeLabels[e.id]}));
      }
    }
  }
  function drawVertices(g, faces) {
    for (const v of solid.vertices) {
      const visible = facesAtVertex(v.id).some(fid => faces.find(f => f.id === fid).visible);
      if (!visible && !state.transparent) continue;
      const p = project(v.pos);
      const sel = state.selected.vertices.has(v.id) || opts.markVertex === v.id;
      const cls = ['vertex'];
      if (sel) cls.push('selected');
      if (state.wrong.vertices.has(v.id)) cls.push('wrong');
      const dotEl = svg('circle', {cx: p.x, cy: p.y, r: sel ? 11 : 7, class: cls.join(' '), opacity: visible ? 1 : .45});
      if (visible && state.kind === 'vertices') {
        const hit = svg('circle', {cx: p.x, cy: p.y, r: 22, class: 'vertex-hit'});
        pressable(hit, () => handleVertex(v.id), '꼭짓점');
        g.append(hit);
      }
      g.append(dotEl);
      if(opts.postal&&sel&&visible){dotEl.style.opacity='0';for(const f of faces.filter(f=>f.visible&&f.verts.includes(v.id))){const i=f.verts.indexOf(v.id),a=solid.vertex(f.verts[(i+1)%4]).pos,b=solid.vertex(f.verts[(i+3)%4]).pos;const mix=q=>v.pos.map((n,j)=>n+(q[j]-n)*.20);const pa=project(mix(a)),pb=project(mix(b));const capPoints=[p,pa,pb],c=center2(capPoints);g.append(svg('polygon',{points:capPoints.map(q=>`${q.x},${q.y}`).join(' '),fill:f.id==='top'?'#e6eee0':'#b5c9a4',stroke:state.wrong.vertices.has(v.id)?'#c76458':'#839b73','stroke-width':4,'stroke-linejoin':'round','pointer-events':'none',class:'felt-cap'}),svg('polygon',{points:capPoints.map(q=>`${q.x*.72+c[0]*.28},${q.y*.72+c[1]*.28}`).join(' '),fill:'none',stroke:'#f8f5df','stroke-width':1,'stroke-dasharray':'2 3','pointer-events':'none'}));}}
      if (opts.vertexLabels?.[v.id]) g.append(svg('text', {x: p.x + 14, y: p.y - 10, class: 'label big', text: opts.vertexLabels[v.id]}));
    }
  }
  function drawFaceLabels(g, faces) {
    for (const f of faces) {
      if (!f.visible) continue;
      const c = center2(f.pts.map(p => project(p)));
      const parts = [];
      if (opts.faceLabels) parts.push(FACE_LABEL[f.id]);
      if (opts.faceMarks?.[f.id]) parts.push(opts.faceMarks[f.id]);
      if (opts.basePair?.includes(f.id)) parts.push('밑면');
      if (parts.length) g.append(svg('text', {x: c[0], y: c[1] - (state.selected.faces.has(f.id) ? 22 : -6), class: 'label', 'text-anchor': 'middle', text: parts.join(' ')}));
    }
  }

  function toggle(set, id) { if (set.has(id)) set.delete(id); else set.add(id); }
  function handleFace(id) {
    if (state.mode === 'peel') { state.peeled = id; draw(); onSelect('face', id); return; }
    if (state.kind === 'pairs') {
      const inPair = state.pairs.findIndex(p => p.includes(id));
      if (inPair >= 0) { state.pairs.splice(inPair, 1); state.pending = null; }
      else if (state.pending === null) state.pending = id;
      else if (state.pending === id) state.pending = null;
      else { state.pairs.push([state.pending, id]); state.pending = null; }
      state.wrong.pairs.clear();
      draw(); onSelect('pairs', state.pairs.slice()); return;
    }
    state.wrong.faces.delete(id);
    toggle(state.selected.faces, id); draw(); onSelect('faces', [...state.selected.faces]);
  }
  function handleEdge(id) { state.wrong.edges.delete(id); toggle(state.selected.edges, id); draw(); onSelect('edges', [...state.selected.edges]); }
  function handleDiagonal(id) { state.wrong.diagonals.delete(id); toggle(state.selected.diagonals, id); draw(); onSelect('diagonals', [...state.selected.diagonals]); }
  function handleVertex(id) {
    state.wrong.vertices.delete(id);
    toggle(state.selected.vertices, id);
    if (opts.showFacesAtVertex && state.selected.vertices.has(id)) {
      state.glowFaces = new Set(facesAtVertex(id));
      draw();
      setTimeout(() => { state.glowFaces.clear(); draw(); }, reducedMotion() ? 1500 : 900);
    } else draw();
    onSelect('vertices', [...state.selected.vertices]);
  }

  // 회전: 드래그, 버튼, 키보드
  let drag = null;
  el.addEventListener('pointerdown', e => { if (e.target.classList.contains('pressable')) return; drag = {x: e.clientX, y: e.clientY}; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = {x: e.clientX, y: e.clientY};
    api.rotate(dx * 0.012, dy * 0.012);
  });
  el.addEventListener('pointerup', () => { drag = null; });
  el.addEventListener('pointercancel', () => { drag = null; });
  el.addEventListener('keydown', e => {
    const map = {ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.2], ArrowDown: [0, 0.2]};
    if (map[e.key]) { e.preventDefault(); api.rotate(...map[e.key]); }
  });
  const controls = node('div', {class: 'rot', role: 'group', 'aria-label': '돌려 보기'});
  controls.append(
    button('◀', () => api.rotate(-0.35, 0), {cls: 'small', attrs: {'aria-label': '왼쪽으로 돌리기'}}),
    button('▶', () => api.rotate(0.35, 0), {cls: 'small', attrs: {'aria-label': '오른쪽으로 돌리기'}}),
    button('▲', () => api.rotate(0, -0.3), {cls: 'small', attrs: {'aria-label': '위로 돌리기'}}),
    button('▼', () => api.rotate(0, 0.3), {cls: 'small', attrs: {'aria-label': '아래로 돌리기'}}),
    button('뒤집기', () => api.rotate(Math.PI, 0), {cls: 'small'})
  );

  const api = {
    el: root, svg: el, controls, state,
    rotate(dy, dp) { state.yaw += dy; state.pitch = Math.max(-1.4, Math.min(1.4, state.pitch + dp)); draw(); },
    setView(yaw, pitch) { state.yaw = yaw; state.pitch = pitch; draw(); },
    setKind(kind) { state.kind = kind; draw(); },
    setTransparent(t) { state.transparent = t; draw(); },
    getSelection() { return {faces: [...state.selected.faces], edges: [...state.selected.edges], vertices: [...state.selected.vertices], diagonals: [...state.selected.diagonals], pairs: state.pairs.map(p => p.slice())}; },
    setSelection(sel = {}) {
      for (const k of ['faces', 'edges', 'vertices', 'diagonals']) state.selected[k] = new Set(sel[k] || []);
      if (sel.pairs) state.pairs = sel.pairs.map(p => p.slice());
      draw();
    },
    markWrong(ids = []) {
      for (const k of Object.keys(state.wrong)) state.wrong[k].clear();
      for (const id of ids) {
        if (id.includes('+')) state.wrong.pairs.add(id);
        else if (id.startsWith('diag-')) state.wrong.diagonals.add(id);
        else if (id.includes('-')) state.wrong.edges.add(id);
        else if (id.length === 3 && /^[LR][TB][FK]$/.test(id)) state.wrong.vertices.add(id);
        else state.wrong.faces.add(id);
      }
      draw();
    },
    clearWrong() { for (const k of Object.keys(state.wrong)) state.wrong[k].clear(); draw(); },
    reveal(index, label) { state.revealFace = index; opts.revealLabel = label; draw(); },
    counts() { return {faces: state.selected.faces.size, edges: state.selected.edges.size, vertices: state.selected.vertices.size, diagonals: state.selected.diagonals.size, pairs: state.pairs.length}; },
    redraw: draw
  };
  draw();
  return api;
}

// 정지 상태의 작은 입체 그림(카드용)
export function solidFigure(desc, {size = 150, yaw = -0.6, pitch = 0.45} = {}) {
  const v = createSolidView({mesh: meshFor(desc), size, yaw: desc.tilt ? desc.tilt[0] : yaw, pitch: desc.tilt ? desc.tilt[1] : pitch, scale: desc.kind === 'cuboid' || desc.kind === 'cube' ? Math.min(24, 60 / Math.max(desc.dims.x, desc.dims.y, desc.dims.z) * 1.6) : 20, mode: 'none'});
  v.svg.removeAttribute('tabindex');
  return v;
}
