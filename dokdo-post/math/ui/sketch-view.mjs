// 겨냥도 편집기(SVG). 꼭짓점은 사선 투영 좌표로 만들고, 선은 실선(보임)/점선(가려짐)으로 표시한다.
import {cuboid, obliqueProject, STANDARD_VIEW, viewSets, edgeId, FACE_LABEL} from '../lib/geometry.mjs';
import {svg, node, button, pressable, setPressed, clear, reducedMotion, announce} from './dom.mjs?v=tablet-20261115';

export function createSketchView(opts = {}) {
  const dims = opts.dims, view = opts.view || STANDARD_VIEW;
  const solid = cuboid(dims.x, dims.y, dims.z);
  const sets = viewSets(solid, view);
  const scale = opts.scale || Math.min(56, 260 / Math.max(dims.x + dims.z * .45, dims.y + dims.z * .32));
  const width = opts.width || 460, height = opts.height || 360;
  const state = {edges: {...(opts.edges || {})}, extras: {}, lineType: 'solid', pending: null, history: [], wrong: new Set(), reveal: false, tool: opts.tool || 'none', locked: new Set(opts.locked || [])};
  const onChange = opts.onChange || (() => {});
  const root = node('div', {class: 'sketch-view', style: {display: 'inline-block'}});
  const el = svg('svg', {viewBox: `${-width / 2} ${-height / 2} ${width} ${height}`, width, height, role: 'group', 'aria-label': '겨냥도'});
  root.append(el);
  const P = {};
  for (const v of solid.vertices) { const [x, y] = obliqueProject(v.pos, dims, view, scale); P[v.id] = {x, y}; }

  function lengthLabels() {
    const x = edgeId('LBF', 'RBF');
    const y = view.x > 0 ? edgeId('RBF', 'RTF') : edgeId('LBF', 'LTF');
    const z = view.x > 0 ? edgeId('RBF', 'RBK') : edgeId('LBF', 'LBK');
    return {[x]: `${dims.x}cm`, [y]: `${dims.y}cm`, [z]: `${dims.z}cm`};
  }
  function draw() {
    clear(el);
    const gFaces = svg('g'), gLines = svg('g'), gVerts = svg('g'), gLabels = svg('g');
    el.append(gFaces, gLines, gVerts, gLabels);
    // 보이는 면을 옅게 칠해 입체감을 준다. 투명 보기에서는 모든 면을 보여 준다.
    for (const f of solid.faces) {
      const vis = sets.visibleFaces.includes(f.id);
      if (!vis && !state.reveal) continue;
      const pts = f.vertices.map(id => `${P[id].x},${P[id].y}`).join(' ');
      gFaces.append(svg('polygon', {points: pts, fill: vis ? '#e8d3a8' : '#9fd8e8', opacity: vis ? (state.reveal ? .25 : .55) : .3, stroke: 'none'}));
    }
    const labels = opts.showLengths ? lengthLabels() : {};
    for (const e of solid.edges) {
      const type = state.edges[e.id];
      const a = P[e.a], b = P[e.b];
      if (type && type !== 'missing') {
        const cls = ['edge', type === 'dashed' ? 'dashed' : '', state.wrong.has(e.id) ? 'wrong' : '', opts.drawnIds?.has?.(e.id) ? 'drawn' : ''].filter(Boolean).join(' ');
        const line = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: cls});
        if ((state.tool === 'toggle' || state.tool === 'draw') && !state.locked.has(e.id)) {
          const hit = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'edge-hit'});
          pressable(hit, () => toggleEdge(e.id), `모서리 (${type === 'dashed' ? '점선' : '실선'}) 눌러서 바꾸기`);
          gLines.append(hit);
        }
        gLines.append(line);
      } else if (state.reveal && sets.hiddenEdges.includes(e.id)) {
        gLines.append(svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'edge hidden-dim'}));
      }
      if (labels[e.id]) {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const off = e.axis === 'x' ? [0, 24] : e.axis === 'y' ? [22, 6] : [20, 14];
        gLabels.append(svg('text', {x: mx + off[0], y: my + off[1], class: 'label', 'text-anchor': 'middle', text: labels[e.id]}));
      }
      if (opts.edgeMarks?.[e.id]) {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        gLabels.append(svg('circle', {cx: mx, cy: my, r: 7, fill: '#2aa7a3'}));
        gLabels.append(svg('text', {x: mx + 12, y: my - 8, class: 'label big', text: opts.edgeMarks[e.id]}));
      }
    }
    for (const [key, type] of Object.entries(state.extras)) {
      const [va, vb] = key.split('-');
      const a = P[va], b = P[vb];
      const line = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: `edge drawn ${type === 'dashed' ? 'dashed' : ''} ${state.wrong.has(key) ? 'wrong' : ''}`});
      const hit = svg('line', {x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'edge-hit'});
      pressable(hit, () => { pushHistory(); delete state.extras[key]; draw(); onChange(api.getEdges()); }, '모서리가 아닌 선 (눌러서 지우기)');
      gLines.append(hit, line);
    }
    for (const v of solid.vertices) {
      const p = P[v.id];
      const hiddenV = sets.hiddenVertices.includes(v.id);
      const dotEl = svg('circle', {cx: p.x, cy: p.y, r: state.pending === v.id ? 10 : 6, class: `vertex ${state.pending === v.id ? 'active' : ''}`, opacity: hiddenV && !state.reveal && state.tool !== 'draw' ? .6 : 1});
      if (state.tool === 'draw') {
        const hit = svg('circle', {cx: p.x, cy: p.y, r: 22, class: 'vertex-hit'});
        pressable(hit, () => pickVertex(v.id), `꼭짓점 ${opts.vertexLabels?.[v.id] || ''}`);
        gVerts.append(hit);
      }
      gVerts.append(dotEl);
      if (opts.vertexLabels?.[v.id]) gLabels.append(svg('text', {x: p.x + 12, y: p.y - 10, class: 'label big', text: opts.vertexLabels[v.id]}));
    }
    if (opts.faceMarks) {
      for (const [fid, text] of Object.entries(opts.faceMarks)) {
        const f = solid.faces.find(x => x.id === fid);
        const c = f.vertices.reduce((a, id) => [a[0] + P[id].x / 4, a[1] + P[id].y / 4], [0, 0]);
        gLabels.append(svg('text', {x: c[0], y: c[1] + 6, class: 'label big', 'text-anchor': 'middle', text}));
      }
    }
    if (opts.highlightFace) {
      const f = solid.faces.find(x => x.id === opts.highlightFace);
      gFaces.append(svg('polygon', {points: f.vertices.map(id => `${P[id].x},${P[id].y}`).join(' '), fill: 'rgba(42,167,163,.35)', stroke: '#1d7f7c', 'stroke-width': 3, 'stroke-dasharray': '6 4'}));
    }
  }
  function pushHistory() { state.history.push({edges: {...state.edges}, extras: {...state.extras}}); if (state.history.length > 50) state.history.shift(); }
  function toggleEdge(id) {
    pushHistory();
    state.wrong.delete(id);
    state.edges[id] = state.edges[id] === 'dashed' ? 'solid' : 'dashed';
    draw(); onChange(api.getEdges());
  }
  function pickVertex(id) {
    if (state.pending === null) { state.pending = id; draw(); opts.onGuide?.('second');announce('첫 꼭짓점을 골랐어요. 이을 꼭짓점을 누르세요.'); return; }
    if (state.pending === id) { state.pending = null; draw();opts.onGuide?.('first'); return; }
    const key = edgeId(state.pending, id);
    pushHistory();
    const isEdge = solid.edges.some(e => e.id === key);
    if (isEdge) { state.edges[key] = state.lineType; state.wrong.delete(key); (opts.drawnIds ||= new Set()).add(key); }
    else state.extras[key] = state.lineType;
    state.pending = null;
    opts.onGuide?.('first');
    draw(); onChange(api.getEdges());
    announce(isEdge ? `${state.lineType === 'dashed' ? '점선' : '실선'} 모서리를 그렸어요.` : '꼭짓점을 이었지만 모서리가 아닌 선이에요.');
  }
  const typeButtons = node('div', {class: 'row', role: 'group', 'aria-label': '선 종류'});
  const bSolid = button('실선(보이는 모서리)', () => api.setLineType('solid'), {cls: 'small'});
  const bDash = button('점선(가려진 모서리)', () => api.setLineType('dashed'), {cls: 'small'});
  typeButtons.append(bSolid, bDash);
  const api = {
    el: root, svg: el, typeButtons, state,
    getEdges() {
      const out = {};
      for (const [k, v] of Object.entries(state.edges)) if (v && v !== 'missing') out[k] = v;
      for (const [k, v] of Object.entries(state.extras)) out[k] = v;
      return out;
    },
    setLineType(t) { state.lineType = t; setPressed(bSolid, t === 'solid'); setPressed(bDash, t === 'dashed'); },
    markWrong(ids) { state.wrong = new Set(ids); draw(); },
    clearWrong() { state.wrong.clear(); draw(); },
    undo() { const h = state.history.pop(); if (!h) return false; state.edges = h.edges; state.extras = h.extras; state.pending = null; draw();opts.onGuide?.('first'); onChange(api.getEdges()); return true; },
    canUndo: () => state.history.length > 0,
    reveal(on = true) { state.reveal = on; draw(); if (on && !opts.keepReveal) setTimeout(() => { state.reveal = false; draw(); }, reducedMotion() ? 2500 : 1800); },
    redraw: draw
  };
  api.setLineType('solid');
  draw();
  return api;
}

// 정면/옆면/겨냥도 비교 그림(설계대 1)
export function orthoFigure(dims, which, {size = 150} = {}) {
  const s = Math.min(30, 100 / Math.max(dims.x, dims.y, dims.z));
  const w = (which === 'front' ? dims.x : dims.z) * s, h = dims.y * s;
  const el = svg('svg', {viewBox: `${-size / 2} ${-size / 2} ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true'});
  el.append(svg('rect', {x: -w / 2, y: -h / 2, width: w, height: h, fill: '#e8d3a8', stroke: '#4a3418', 'stroke-width': 3}));
  return el;
}
export function sketchFigure(dims, {size = 150, view = STANDARD_VIEW, showLengths = false, edges = null, fit = false} = {}) {
  const scale = fit ? (size-(showLengths?76:40))/Math.max(dims.x+dims.z*.45,dims.y+dims.z*.32) : Math.min(26,70/Math.max(dims.x,dims.y,dims.z),showLengths?(size-80)/Math.max(dims.x+dims.z*.45,dims.y+dims.z*.32):Infinity);
  const v = createSketchView({dims,view,width:size,height:size,scale,tool:'none',showLengths,edges:edges||fullEdges(dims,view)});
  // Oblique depth shifts the projected center; preserve equal margins when enlarged.
  if(fit)v.el.querySelector('svg').setAttribute('viewBox',`${dims.z*.225*scale*view.x-size/2} ${-dims.z*.16*scale*view.y-size/2} ${size} ${size}`);
  return v.el;
}
export function fullEdges(dims, view = STANDARD_VIEW) {
  const solid = cuboid(dims.x, dims.y, dims.z);
  const sets = viewSets(solid, view);
  const out = {};
  for (const e of solid.edges) out[e.id] = sets.hiddenEdges.includes(e.id) ? 'dashed' : 'solid';
  return out;
}
