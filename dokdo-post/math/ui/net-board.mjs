// 전개도 보드(모눈 위 조각 놓기·옮기기·돌리기)와 접기 보기. 조각 좌표는 lib/net.mjs의 판정과 같은 모눈 좌표를 쓴다.
import {adjacency, boundarySegments, foldPositions, segKey, foldNet} from '../lib/net.mjs';
import {rotate, norm, dot} from '../lib/geometry.mjs';
import {svg, node, button, pressable, clear, announce, reducedMotion, KOREAN_LABELS} from './dom.mjs?v=tablet-20261115';
import {paperSurface} from './paper-surface.mjs';

// Restored pieces keep globally unique IDs.

export function createNetBoard(opts = {}) {
  const mode = opts.mode || 'build';
  const fixedIds = new Set(opts.fixedIds || []);
  const state = {
    pieces: (opts.pieces || []).map(p => ({...p})), held: null, tray: (opts.tray || []).map(t => ({...t})),
    cursor: null, wrong: new Set(), selected: new Set(), message: ''
  };
  const onChange = opts.onChange || (() => {});
  const onSelect = opts.onSelect || (() => {});
  const bbox = boundsOf(state.pieces);
  // 점/모서리 고르기 모드는 여백을 줄여 셀을 크게(터치 원 44px이 겹치지 않게) 한다.
  const build = mode === 'build';
  const cols = opts.cols || (build ? Math.max(12, bbox.w + 6) : bbox.w + 2), rows = opts.rows || (build ? Math.max(10, bbox.h + 4) : bbox.h + 2);
  // 원점(ox, oy)은 계획(lib/board-layout.mjs planBoard)이 주면 그대로, 아니면 바탕을 가운데 둔다.
  const ox = opts.ox ?? (opts.pieces?.length ? -bbox.x + Math.floor((cols - bbox.w) / 2) : 0);
  const oy = opts.oy ?? (opts.pieces?.length ? -bbox.y + Math.floor((rows - bbox.h) / 2) : 0);
  // 보드는 반드시 maxW×maxH 안에 들어간다(최소 셀은 18px, 계획 단계에서 24px 이상을 목표로 함).
  const maxW = opts.width || 500, maxH = opts.height || 380;
  const cell = Math.max(opts.minCell || 18, Math.min(opts.cell || 60, Math.floor(maxW / cols), Math.floor(maxH / rows)));
  const W = cols * cell, H = rows * cell;
  const root = node('div', {class: 'net-board', style: {display: 'inline-block'}});
  const el = svg('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, tabindex: mode === 'build' ? '0' : null, role: 'group',
    'aria-label': mode === 'build' ? '전개도 모눈. 화살표 키로 칸을 고르고 Enter로 조각을 놓거나 들어요.' : '전개도', style: 'touch-action:none;background:#2e7f85;border-radius:14px'});
  root.append(el);
  const toNet = (cx, cy) => [cx - ox, cy - oy];
  const toDisp = (x, y) => [(x + ox) * cell, (y + oy) * cell];

  function draw() {
    clear(el);
    const grain = paperSurface(el);
    const gCells = svg('g'), gPieces = svg('g'), gLines = svg('g'), gLabels = svg('g'), gPoints = svg('g');
    el.append(gCells, gPieces, gLines, gLabels, gPoints);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const rect = svg('rect', {x: c * cell, y: r * cell, width: cell, height: cell, class: 'cell' + (state.cursor && state.cursor[0] === c && state.cursor[1] === r ? ' cursor' : '')});
      if (mode === 'build') {
        rect.addEventListener('click', () => actOn(c, r));
        rect.style.cursor = 'pointer';
      }
      gCells.append(rect);
    }
    if (state.held && state.cursor) ghost(gCells, state.cursor[0], state.cursor[1]);
    const {full} = adjacency(state.pieces);
    for (const p of state.pieces) {
      const [dx, dy] = toDisp(p.x, p.y);
      const cls = ['piece', fixedIds.has(p.id) ? 'fixed' : '', state.wrong.has(p.id) ? 'wrong' : '', opts.postal && mode === 'build' && canPick(p) ? 'movable' : ''].filter(Boolean).join(' ');
      const rect = svg('rect', {x: dx, y: dy, width: p.w * cell, height: p.h * cell, class: cls, rx: 3});
      if (mode === 'build') {
        rect.addEventListener('click', e => { e.stopPropagation(); actOn(Math.floor(dx / cell), Math.floor(dy / cell), p); });
        rect.style.cursor = canPick(p) ? 'grab' : 'default';
      }
      gPieces.append(rect);
      gLabels.append(svg('rect', {x: dx + 2, y: dy + 2, width: Math.max(0, p.w * cell - 4), height: Math.max(0, p.h * cell - 4), rx: 2, fill: grain, stroke: '#fbe7bf', 'stroke-width': 1, class: 'paper-grain', 'pointer-events': 'none'}));
      if (opts.postal && mode === 'build' && fixedIds.has(p.id)) gLabels.append(svg('rect', {x: dx + p.w * cell / 2 - 7, y: dy + 2, width: 14, height: 5, rx: 1, fill: '#96ad78', opacity: .85, class: 'fixed-tape', 'pointer-events': 'none'}));
      if (opts.pieceLabels?.[p.id]) gLabels.append(svg('text', {x: dx + p.w * cell / 2, y: dy + p.h * cell / 2 + 7, class: 'label', 'text-anchor': 'middle', text: opts.pieceLabels[p.id]}));
      if (opts.showLengths) {
        const blank = opts.blank && opts.blank.piece === p.id;
        const wText = blank && opts.blank.side === 'w' ? '?' : `${p.w}`;
        const hText = blank && opts.blank.side === 'h' ? '?' : `${p.h}`;
        gLabels.append(svg('text', {x: dx + p.w * cell / 2, y: dy + 18, class: 'label', 'text-anchor': 'middle', text: wText, style: wText === '?' ? 'fill:#c74b3f;font-size:22px' : ''}));
        gLabels.append(svg('text', {x: dx + 14, y: dy + p.h * cell / 2 + 6, class: 'label', 'text-anchor': 'middle', text: hText, style: hText === '?' ? 'fill:#c74b3f;font-size:22px' : ''}));
      }
    }
    // 접는 선(점선)과 잘린 선(실선)
    const drawnFold = new Set();
    for (const e of full) {
      const key = [e.a, e.b].sort().join('|');
      if (drawnFold.has(key)) continue;
      drawnFold.add(key);
      const a = state.pieces.find(p => p.id === e.a);
      let x1, y1, x2, y2;
      if (e.dir === 'E') { [x1, y1] = toDisp(a.x + a.w, a.y); [x2, y2] = toDisp(a.x + a.w, a.y + a.h); }
      else if (e.dir === 'W') { [x1, y1] = toDisp(a.x, a.y); [x2, y2] = toDisp(a.x, a.y + a.h); }
      else if (e.dir === 'S') { [x1, y1] = toDisp(a.x, a.y + a.h); [x2, y2] = toDisp(a.x + a.w, a.y + a.h); }
      else { [x1, y1] = toDisp(a.x, a.y); [x2, y2] = toDisp(a.x + a.w, a.y); }
      gLines.append(svg('line', {x1, y1, x2, y2, stroke: '#f6efd9', 'stroke-width': 5}));
      gLines.append(svg('line', {x1, y1, x2, y2, class: 'fold'}));
    }
    if (mode === 'points' || mode === 'segments') drawPointsOrSegments(gPoints);
    if (opts.showLengths) gLabels.append(svg('text', {x: 8, y: H - 8, class: 'label', style: 'font-size:14px', text: '단위: cm · 점선은 접는 선'}));
  }
  function ghost(g, c, r) {
    g.append(svg('rect', {x: c * cell, y: r * cell, width: state.held.w * cell, height: state.held.h * cell, class: 'cell ghost', 'pointer-events': 'none'}));
  }
  function drawPointsOrSegments(g) {
    if (mode === 'segments') {
      for (const s of boundarySegments(state.pieces)) {
        const [x1, y1] = toDisp(...s.a), [x2, y2] = toDisp(...s.b);
        const isOrigin = s.key === opts.origin;
        const cls = ['netseg', isOrigin ? 'origin' : '', state.selected.has(s.key) ? 'selected' : '', state.wrong.has(s.key) ? 'wrong' : ''].filter(Boolean).join(' ');
        const line = svg('line', {x1, y1, x2, y2, class: cls, 'pointer-events': 'none'});
        g.append(line);
        if (!isOrigin) {
          const hit = svg('line', {x1, y1, x2, y2, class: 'netseg-hit', style: `stroke-width:${Math.min(22, Math.max(14, cell * 0.6))}px`});
          pressable(hit, () => toggleSel(s.key), '전개도 가장자리 변');
          g.append(hit);
        }
      }
      if (opts.origin) {
        const [a, b] = opts.origin.split('|').map(k => k.split(',').map(Number));
        const [ax, ay] = toDisp(...a), [bx, by] = toDisp(...b);
        g.append(svg('text', {x: ax - 14, y: ay - 8, class: 'label big', text: 'ㄱ'}));
        g.append(svg('text', {x: bx + 6, y: by - 8, class: 'label big', text: 'ㄴ'}));
      }
      return;
    }
    const seen = new Set();
    for (const p of state.pieces) {
      for (const [x, y] of [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.h], [p.x, p.y + p.h]]) {
        const key = `${x},${y}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!isBoundaryPoint(x, y)) continue;
        const [dx, dy] = toDisp(x, y);
        const isOrigin = key === opts.origin;
        const cls = ['netpoint', isOrigin ? 'origin' : '', state.selected.has(key) ? 'selected' : '', state.wrong.has(key) ? 'wrong' : ''].filter(Boolean).join(' ');
        // 시각 원은 pointer-events:none(CSS)이고, 히트 원 반지름은 셀 간격의 절반 이하로 둔다.
        g.append(svg('circle', {cx: dx, cy: dy, r: isOrigin || state.selected.has(key) ? 11 : 8, class: cls, 'pointer-events': 'none'}));
        if (!isOrigin) {
          const hit = svg('circle', {cx: dx, cy: dy, r: Math.min(22, Math.max(14, cell / 2 - 1)), class: 'vertex-hit'});
          pressable(hit, () => toggleSel(key), '전개도의 점');
          g.append(hit);
        }
        if (isOrigin) g.append(svg('text', {x: dx + 12, y: dy - 10, class: 'label big', text: 'ㄱ'}));
      }
    }
  }
  function isBoundaryPoint(x, y) {
    // 네 방향 칸 중 조각이 없는 칸이 하나라도 있으면 가장자리 점
    const occupied = (cx, cy) => state.pieces.some(p => cx >= p.x && cx < p.x + p.w && cy >= p.y && cy < p.y + p.h);
    return !(occupied(x, y) && occupied(x - 1, y) && occupied(x, y - 1) && occupied(x - 1, y - 1));
  }
  function toggleSel(key) {
    state.wrong.delete(key);
    if (state.selected.has(key)) state.selected.delete(key); else state.selected.add(key);
    draw(); onSelect([...state.selected]);
  }
  function canPick(p) { return !fixedIds.has(p.id) && (opts.movable || opts.replaceable || p.fromTray); }
  function overlapsAny(x, y, w, h, ignoreId) {
    return state.pieces.some(p => p.id !== ignoreId && x < p.x + p.w && p.x < x + w && y < p.y + p.h && p.y < y + h);
  }
  function actOn(c, r, piece = null) {
    state.cursor = [c, r];
    const target = piece || state.pieces.find(p => { const [nx, ny] = toNet(c, r); return nx >= p.x && nx < p.x + p.w && ny >= p.y && ny < p.y + p.h; });
    if (state.held) {
      const [nx, ny] = toNet(c, r);
      if (c + state.held.w > cols || r + state.held.h > rows) { say('모눈 밖으로 나가요. 다른 칸을 골라요.'); draw(); return; }
      if (overlapsAny(nx, ny, state.held.w, state.held.h)) { say('이미 조각이 있는 칸이에요. 조각끼리 겹칠 수 없어요.'); draw(); return; }
      state.pieces.push({id: state.held.id, x: nx, y: ny, w: state.held.w, h: state.held.h, fromTray: state.held.fromTray});
      state.held = null; state.wrong.clear();
      say('조각을 놓았어요.'); draw(); refreshTray(); onChange(api.getPieces()); return;
    }
    if (target && canPick(target)) {
      state.pieces = state.pieces.filter(p => p !== target);
      state.held = {id: target.id, w: target.w, h: target.h, fromTray: target.fromTray};
      state.wrong.clear();
      say(`${target.w}×${target.h} 조각을 들었어요. 놓을 칸을 누르세요.`); draw(); refreshTray(); onChange(api.getPieces()); return;
    }
    if (target) say('이 조각은 고정되어 있어요.');
    draw();
  }
  function guide(){const changed=state.pieces.some(p=>!(opts.pieces||[]).some(q=>q.x===p.x&&q.y===p.y&&q.w===p.w&&q.h===p.h));opts.onGuide?.(state.held?'place':state.pieces.length===6&&changed?'check':'choose');}
  function say(text) { state.message = text; msgEl.textContent = text; announce(text);guide(); }

  // 조각 보관함(트레이)
  const trayEl = node('div', {class: 'tray', role: 'group', 'aria-label': '조각 보관함'});
  const msgEl = node('p', {class: 'mini', role: 'status', text: ''});
  const toolsEl = node('div', {class: 'row'});
  const bRotate = button('돌리기', () => { if (!state.held) { say('먼저 조각을 들어요.'); return; } [state.held.w, state.held.h] = [state.held.h, state.held.w]; say(`조각을 돌렸어요. 이제 ${state.held.w}×${state.held.h}예요.`); draw(); refreshTray(); }, {cls: 'small', icon: '⟳'});
  const bReturn = button('보관함에 넣기', () => {
    if (!state.held) { say('들고 있는 조각이 없어요.'); return; }
    const slot = state.tray.find(t => (t.w === state.held.w && t.h === state.held.h) || (t.w === state.held.h && t.h === state.held.w));
    if (slot) slot.count++; else state.tray.push({w: state.held.w, h: state.held.h, count: 1});
    state.held = null; say('조각을 보관함에 넣었어요.'); draw(); refreshTray();
  }, {cls: 'small', icon:'↩'});
  if (mode === 'build') {
    if (opts.rotatable) toolsEl.append(bRotate);
    toolsEl.append(bReturn);
  }
  function refreshTray() {
    clear(trayEl);
    if (mode !== 'build') return;
    state.tray.forEach((t, i) => {
      const b = button('', () => {
        if (t.count <= 0) return;
        if (state.held) { const back = state.tray.find(s => s.w === state.held.w && s.h === state.held.h); if (back) back.count++; else state.tray.push({w: state.held.w, h: state.held.h, count: 1}); }
        t.count--; state.held = {id: `t${crypto.randomUUID()}`, w: t.w, h: t.h, fromTray: true};
        say(`${t.w}×${t.h} 조각을 들었어요. 모눈의 칸을 눌러 놓아요.`); draw(); refreshTray();
      }, {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 조각, 남은 수 ${t.count}`}});
      b.disabled = t.count <= 0;
      const pic = svg('svg', {viewBox: '0 0 60 36', 'aria-hidden': 'true'});
      const s = Math.min(56 / Math.max(t.w, 1), 32 / Math.max(t.h, 1), 12);
      pic.append(svg('rect', {x: 30 - t.w * s / 2, y: 18 - t.h * s / 2, width: t.w * s, height: t.h * s, fill: '#d6b283', stroke: '#5a3d1c', 'stroke-width': 2}));
      b.append(pic, node('span', {text: `${t.w}×${t.h}`}), node('span', {class: 'cnt', text: `${t.count}장`}));
      if (state.held && state.held.fromTray && state.held.w === t.w && state.held.h === t.h) b.classList.add('on');
      trayEl.append(b);
    });
    const heldInfo = node('p', {class: state.held?'mini held-piece':'mini', text: state.held ? `들고 있는 조각: ${state.held.w}×${state.held.h}` : '들고 있는 조각 없음'});
    trayEl.append(heldInfo);
  }
  // 키보드 커서
  el.addEventListener('keydown', e => {
    if (mode !== 'build') return;
    const cur = state.cursor || [0, 0];
    const map = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    if (map[e.key]) { e.preventDefault(); state.cursor = [Math.max(0, Math.min(cols - 1, cur[0] + map[e.key][0])), Math.max(0, Math.min(rows - 1, cur[1] + map[e.key][1]))]; draw(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actOn(cur[0], cur[1]); }
    if (e.key === 'r' && opts.rotatable) bRotate.click();
  });
  el.addEventListener('pointermove', e => {
    if (!state.held || mode !== 'build') return;
    const rect = el.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / rect.width * cols), r = Math.floor((e.clientY - rect.top) / rect.height * rows);
    if (!state.cursor || state.cursor[0] !== c || state.cursor[1] !== r) { state.cursor = [c, r]; draw(); }
  });

  const api = {
    el: root, svg: el, trayEl, toolsEl, msgEl, state, cell,
    getPieces() { return state.pieces.map(p => ({id: p.id, x: p.x, y: p.y, w: p.w, h: p.h})); },
    snapshot(){return structuredClone({pieces:state.pieces,held:state.held,tray:state.tray,cursor:state.cursor});},
    restore(v){for(const k of ['pieces','held','tray','cursor'])if(k in v)state[k]=structuredClone(v[k]);draw();refreshTray();guide();},
    getSelected() { return [...state.selected]; },
    setSelected(keys) { state.selected = new Set(keys); draw(); },
    heldPiece: () => state.held,
    markWrong(ids = []) { state.wrong = new Set(ids); draw(); },
    clearWrong() { state.wrong.clear(); draw(); },
    redraw: draw
  };
  draw(); refreshTray();
  return api;
}

function boundsOf(pieces) {
  if (!pieces.length) return {x: 0, y: 0, w: 0, h: 0};
  const minX = Math.min(...pieces.map(p => p.x)), minY = Math.min(...pieces.map(p => p.y));
  const maxX = Math.max(...pieces.map(p => p.x + p.w)), maxY = Math.max(...pieces.map(p => p.y + p.h));
  return {x: minX, y: minY, w: maxX - minX, h: maxY - minY};
}

// 정지 상태의 작은 전개도 그림(카드·복습용)
export function netFigure(pieces, {size = 150, showLengths = false, blanks = []} = {}) {
  const b = boundsOf(pieces);
  const s = Math.min((size - 20) / Math.max(b.w, 1), (size - 20) / Math.max(b.h, 1));
  const el = svg('svg', {viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true'});
  const offX = (size - b.w * s) / 2 - b.x * s, offY = (size - b.h * s) / 2 - b.y * s;
  const fs = size >= 250 ? 16 : 13;
  for (const p of pieces) {
    el.append(svg('rect', {x: p.x * s + offX, y: p.y * s + offY, width: p.w * s, height: p.h * s, class: 'piece'}));
    if (showLengths) {
      const bw = blanks.find(k => k.piece === p.id && k.side === 'w'), bh = blanks.find(k => k.piece === p.id && k.side === 'h');
      if(size<180&&!blanks.length){
        el.append(svg('text',{x:p.x*s+offX+p.w*s/2,y:p.y*s+offY+p.h*s/2+4,class:'label',style:'font-size:11px;stroke-width:2px','text-anchor':'middle',text:`${p.w}×${p.h}`}));
        continue;
      }
      el.append(svg('text', {x: p.x * s + offX + p.w * s / 2, y: p.y * s + offY + fs + 2, class: 'label', style: `font-size:${fs}px${bw ? ';fill:#c74b3f' : ''}`, 'text-anchor': 'middle', text: bw ? (bw.label || '?') : p.w}));
      el.append(svg('text', {x: p.x * s + offX + fs - 2, y: p.y * s + offY + p.h * s / 2 + 5, class: 'label', style: `font-size:${fs}px${bh ? ';fill:#c74b3f' : ''}`, 'text-anchor': 'middle', text: bh ? (bh.label || '?') : p.h}));
    }
  }
  const {full} = adjacency(pieces);
  const seen = new Set();
  for (const e of full) {
    const key = [e.a, e.b].sort().join('|'); if (seen.has(key)) continue; seen.add(key);
    const a = pieces.find(p => p.id === e.a);
    const pts = e.dir === 'E' ? [[a.x + a.w, a.y], [a.x + a.w, a.y + a.h]] : e.dir === 'W' ? [[a.x, a.y], [a.x, a.y + a.h]] : e.dir === 'S' ? [[a.x, a.y + a.h], [a.x + a.w, a.y + a.h]] : [[a.x, a.y], [a.x + a.w, a.y]];
    el.append(svg('line', {x1: pts[0][0] * s + offX, y1: pts[0][1] * s + offY, x2: pts[1][0] * s + offX, y2: pts[1][1] * s + offY, stroke: '#f6efd9', 'stroke-width': 3}));
    el.append(svg('line', {x1: pts[0][0] * s + offX, y1: pts[0][1] * s + offY, x2: pts[1][0] * s + offX, y2: pts[1][1] * s + offY, class: 'fold', style: 'stroke-width:2;stroke-dasharray:5 4'}));
  }
  return el;
}

// 접기 보기: 슬라이더로 0(평면)~1(상자). 겹치는 면은 빨갛게 표시한다.
export function createFoldView({pieces, dims, highlight = [], size = 380, labelOf = null}) {
  const result = foldNet(pieces, dims || null);
  const tree = result.tree;
  const overlap = new Set(highlight.length ? highlight : result.errors.filter(e => e.type === 'overlap').flatMap(e => e.pieces));
  const root = node('div', {class: 'fold-view', style: {display: 'inline-block', textAlign: 'center', width: `${size}px`}});
  const el = svg('svg', {viewBox: `${-size / 2} ${-size / 2} ${size} ${size}`, width: size, height: size * .8, role: 'img', 'aria-label': '접는 모습'});
  const b = boundsOf(pieces);
  const unit = Math.min(40, (size - 60) / Math.max(b.w, b.h, 3));
  const base = pieces[0];
  const center0 = [base.x + base.w / 2, 0, base.y + base.h / 2];
  const LIGHT = norm([0.3, 0.8, 0.5]);
  let t = 0;
  function draw() {
    clear(el);
    const grain = paperSurface(el);
    const pos = foldPositions(pieces, tree, t);
    const faces = pieces.map(p => {
      const pts3 = pos[p.id].map(q => rotate([q[0] - center0[0], q[1] - center0[1] - (t * (dims ? dims.y : 1)) / 2, q[2] - center0[2]], -0.55, 0.5));
      const n = normalOf(pts3);
      return {p, pts: pts3.map(q => [q[0] * unit, -q[1] * unit]), depth: pts3.reduce((s, q) => s + q[2], 0) / 4, n};
    }).sort((a, b2) => a.depth - b2.depth);
    for (const f of faces) {
      const bright = 0.62 + 0.38 * Math.abs(dot(f.n, LIGHT));
      const fill = overlap.has(f.p.id) ? '#e97b6b' : `rgb(${Math.round(214 * bright)},${Math.round(178 * bright)},${Math.round(131 * bright)})`;
      el.append(svg('polygon', {points: f.pts.map(q => q.join(',')).join(' '), fill, class: 'fold-face' + (overlap.has(f.p.id) ? ' overlap' : ''), opacity: .96}));
      el.append(svg('polygon', {points: f.pts.map(q => q.join(',')).join(' '), fill: grain, class: 'paper-grain', 'pointer-events': 'none'}));
      if (labelOf) { const c = f.pts.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]); el.append(svg('text', {x: c[0], y: c[1] + 5, class: 'label', style: 'font-size:13px', 'text-anchor': 'middle', text: labelOf(f.p.id)})); }
    }
  }
  const slider = node('input', {type: 'range', min: '0', max: '100', value: '0', 'aria-label': '접기 정도'});
  slider.addEventListener('input', () => { t = Number(slider.value) / 100; draw(); });
  let timer = null;
  const play = button('접기', () => {
    if (timer) { clearInterval(timer); timer = null; }
    if (reducedMotion()) { t = t >= 1 ? 0 : 1; slider.value = String(t * 100); draw(); return; }
    const start = performance.now(), from = t, to = t >= 1 ? 0 : 1;
    timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / 1400);
      t = from + (to - from) * (k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k);
      slider.value = String(Math.round(t * 100)); draw();
      if (k >= 1) { clearInterval(timer); timer = null; }
    }, 16);
  }, {cls: 'small', icon: '▶'});
  const pause = button('잠시 멈춤', () => { if (timer) { clearInterval(timer); timer = null; } }, {cls: 'small'});
  const row = node('div', {class: 'slider-row'}, [play, pause, node('span', {class: 'mini', text: '펼침'}), slider, node('span', {class: 'mini', text: '상자'})]);
  root.append(el, row);
  draw();
  return {el: root, setT(v) { t = v; slider.value = String(v * 100); draw(); }, play: () => play.click(), result, stop() { if (timer) clearInterval(timer); }};
}
function normalOf(pts) {
  const u = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]];
  const v = [pts[3][0] - pts[0][0], pts[3][1] - pts[0][1], pts[3][2] - pts[0][2]];
  return norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
}
export {KOREAN_LABELS, segKey};


