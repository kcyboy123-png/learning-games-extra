import {sfx} from './audio.mjs?v=audio-journey-20261117';
// 전개도 보드(모눈 위 조각 놓기·옮기기·돌리기)와 접기 보기. 조각 좌표는 lib/net.mjs의 판정과 같은 모눈 좌표를 쓴다.
import {adjacency, boundarySegments, foldPositions, segKey, foldNet} from '../lib/net.mjs';
import {rotate, norm, dot} from '../lib/geometry.mjs';
import {svg, node, button, pressable, clear, announce, reducedMotion, KOREAN_LABELS} from './dom.mjs?v=tactile-audit-e-20261118';
import {paperSurface} from './paper-surface.mjs';

// Restored pieces keep globally unique IDs.

export function createNetBoard(opts = {}) {
  const mode = opts.mode || 'build';
  const fixedIds = new Set(opts.fixedIds || []);
  const state = {
    pieces: (opts.pieces || []).map(p => ({...p})), held: null, tray: (opts.tray || []).map(t => ({...t})),
    cursor: null, wrong: new Set(), selected: new Set(), message: ''
  };
  let drag=null,suppressClickUntil=0,landed=null,dragLayer=null,dragGhost=null,dragPaper=null,dragHint=null;
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
  const pointerCell = e => { const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(el.getScreenCTM().inverse());return [p.x/cell,p.y/cell]; };

  function draw() {
    const focusKey=el.contains(document.activeElement)?document.activeElement.dataset.focusKey:null;
    clear(el);dragGhost=null;dragPaper=null;dragHint=null;
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
    if (state.held && state.cursor && !drag?.active) ghost(gCells, state.cursor[0], state.cursor[1]);
    if(opts.postal&&build&&!state.pieces.length&&!drag?.active){
      const hint=svg('g',{'pointer-events':'none',class:'first-paper-guide'});
      if(state.held&&!state.cursor){
        const c=Math.floor((cols-state.held.w)/2),r=Math.floor((rows-state.held.h)/2);
        ghost(hint,c,r);
        hint.append(svg('text',{x:(c+state.held.w/2)*cell,y:(r+state.held.h/2)*cell+6,'text-anchor':'middle',text:`${state.held.w} × ${state.held.h}`}));
        hint.append(svg('text',{x:(c+state.held.w/2)*cell,y:Math.max(24,r*cell-12),'text-anchor':'middle',text:'예시 자리 · 다른 칸에 놓아도 돼요'}));
      }else if(!state.held)hint.append(svg('text',{x:W/2,y:H/2,'text-anchor':'middle',text:'① 옆에서 종이 한 장을 골라요'}));
      gLabels.append(hint);
    }
    const {full} = adjacency(state.pieces);
    for (const p of state.pieces) {
      const [dx, dy] = toDisp(p.x, p.y);
      const cls = ['piece', landed===p.id?'just-placed':'', fixedIds.has(p.id) ? 'fixed' : '', state.wrong.has(p.id) ? 'wrong' : '', opts.postal && mode === 'build' && canPick(p) ? 'movable' : ''].filter(Boolean).join(' ');
      const rect = svg('rect', {x: dx, y: dy, width: p.w * cell, height: p.h * cell, class: cls, 'data-piece-id':p.id, rx: 3});
      if (mode === 'build') {
        rect.addEventListener('click', e => { e.stopPropagation(); actOn(Math.floor(dx / cell), Math.floor(dy / cell), p); });
        rect.style.cursor = canPick(p) ? 'grab' : 'default';
      }
      gPieces.append(rect);
      gLabels.append(svg('rect', {x: dx + 2, y: dy + 2, width: Math.max(0, p.w * cell - 4), height: Math.max(0, p.h * cell - 4), rx: 2, fill: grain, stroke: '#fbe7bf', 'stroke-width': 1, class: 'paper-grain', 'pointer-events': 'none'}));
      if(opts.postal&&landed===p.id)gLabels.append(svg('rect',{x:dx,y:dy,width:p.w*cell,height:p.h*cell,rx:3,class:'paper-seat-outline','pointer-events':'none'}));
      if (opts.postal && mode === 'build') gLabels.append(svg('rect', {x: dx + p.w * cell / 2 - 7, y: dy + 2, width: 14, height: 5, rx: 1, fill: '#96ad78', opacity: .85, class: 'fixed-tape', 'pointer-events': 'none'}));
      if (opts.pieceLabels?.[p.id]) gLabels.append(svg('text', {x: dx + p.w * cell / 2, y: dy + p.h * cell / 2 + 7, class: 'label', 'text-anchor': 'middle', text: opts.pieceLabels[p.id]}));
      if (opts.showLengths) {
        const blank = opts.blank && opts.blank.piece === p.id;
        const wText = blank && opts.blank.side === 'w' ? '?' : `${p.w}`;
        const hText = blank && opts.blank.side === 'h' ? '?' : `${p.h}`;
        if(opts.postal&&!blank&&p.w*cell<40&&p.h*cell<40){
          gLabels.append(svg('text',{x:dx+p.w*cell/2,y:dy+p.h*cell/2+4,class:'label compact-length','text-anchor':'middle',text:`${p.w}×${p.h}`,style:'font-size:12px;stroke-width:2px'}));
        }else{
        gLabels.append(svg('text', {x: dx + p.w * cell / 2, y: dy + 18, class: 'label', 'text-anchor': 'middle', text: wText, style: wText === '?' ? 'fill:#c74b3f;font-size:22px' : ''}));
        gLabels.append(svg('text', {x: dx + 14, y: dy + p.h * cell / 2 + 6, class: 'label', 'text-anchor': 'middle', text: hText, style: hText === '?' ? 'fill:#c74b3f;font-size:22px' : ''}));
        }
      }
    }
    landed=null;
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
    dragLayer=svg('g',{class:'drag-paper-layer','pointer-events':'none'});el.append(dragLayer);
    if(focusKey)[...el.querySelectorAll('[data-focus-key]')].find(n=>n.dataset.focusKey===focusKey)?.focus({preventScroll:true});
  }
  function canDrop(c,r){if(!state.held)return false;const [x,y]=toNet(c,r);return c>=0&&r>=0&&c+state.held.w<=cols&&r+state.held.h<=rows&&!overlapsAny(x,y,state.held.w,state.held.h);}
  function ghost(g, c, r) {
    g.append(svg('rect', {x: c * cell, y: r * cell, width: state.held.w * cell, height: state.held.h * cell, class: 'cell ghost '+(canDrop(c,r)?'drop-valid':'drop-blocked'), 'pointer-events': 'none'}));
    if(drag?.active)g.append(svg('text',{x:Math.max(50,Math.min(W-50,(c+state.held.w/2)*cell)),y:Math.max(22,Math.min(H-10,r*cell-8)),class:'label','text-anchor':'middle','pointer-events':'none',text:canDrop(c,r)?'손을 떼면 놓아요':'다른 자리를 골라요'}));
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
          const hit = svg('line', {x1, y1, x2, y2, class: 'netseg-hit','aria-pressed':String(state.selected.has(s.key)), style: `stroke-width:${Math.min(22, Math.max(14, cell * 0.6))}px`});
          hit.dataset.focusKey=s.key;pressable(hit, () => toggleSel(s.key), '전개도 가장자리 변');
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
          const hit = svg('circle', {cx: dx, cy: dy, r: Math.min(22, Math.max(14, cell / 2 - 1)), class: 'vertex-hit','aria-pressed':String(state.selected.has(key))});
          hit.dataset.focusKey=key;pressable(hit, () => toggleSel(key), '전개도의 점');
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
      if (c<0 || r<0 || c + state.held.w > cols || r + state.held.h > rows) { say('모눈 밖으로 나가요. 다른 칸을 골라요.'); draw(); return; }
      if (overlapsAny(nx, ny, state.held.w, state.held.h)) { say('이미 조각이 있는 칸이에요. 조각끼리 겹칠 수 없어요.'); draw(); return; }
      landed=state.held.id;
      state.pieces.push({id: state.held.id, x: nx, y: ny, w: state.held.w, h: state.held.h, fromTray: state.held.fromTray});
      state.held = null; state.wrong.clear();
      say(opts.postal?(state.pieces.length<6?`면 ${state.pieces.length}/6 · 종이를 한 장 더 골라요.`:state.pieces.length===6?(opts.blank?'여섯 면을 놓았어요. 빈칸 길이도 확인해요.':'여섯 면을 놓았어요. 아래에서 접어서 확인해요.'):`면이 ${state.pieces.length}개예요. 필요한 면은 6개예요.`):'조각을 놓았어요.'); draw(); refreshTray(); if(opts.postal)sfx.place();onChange(api.getPieces()); return;
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
  const bRotate = button('돌리기', () => { if (!state.held) { say('먼저 조각을 들어요.'); return; } [state.held.w, state.held.h] = [state.held.h, state.held.w];if(state.cursor)state.cursor=[Math.max(0,Math.min(cols-state.held.w,state.cursor[0])),Math.max(0,Math.min(rows-state.held.h,state.cursor[1]))]; say(`조각을 돌렸어요. 이제 ${state.held.w}×${state.held.h}예요.`); draw(); refreshTray(); if(opts.postal&&!reducedMotion())trayEl.querySelector('.held-preview')?.animate([{transform:'rotate(-90deg) scale(.9)'},{transform:'rotate(0) scale(1)'}],{duration:180,easing:'ease-out'}); }, {cls: 'small', icon: '⟳'});
  const bReturn = button('보관함에 넣기', () => {
    if (!state.held) { say('들고 있는 조각이 없어요.'); return; }
    const keepFocus=document.activeElement===bReturn;
    const slot = state.tray.find(t => (t.w === state.held.w && t.h === state.held.h) || (t.w === state.held.h && t.h === state.held.w));
    if (slot) slot.count++; else state.tray.push({w: state.held.w, h: state.held.h, count: 1});
    state.held = null; say(opts.postal?'종이를 돌려놓았어요. 옆에서 다시 골라요.':'조각을 보관함에 넣었어요.'); draw(); refreshTray();
    if(keepFocus)trayEl.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }, {cls: 'small', icon:'↩'});
  if (mode === 'build') {
    if (opts.rotatable) toolsEl.append(bRotate);
    toolsEl.append(bReturn);
  }
  function refreshTray() {
    clear(trayEl);
    if (mode !== 'build') return;
    bRotate.disabled=!state.held||(opts.postal&&state.held.w===state.held.h);
    bReturn.disabled=!state.held;
    state.tray.forEach((t, i) => {
      const b = button('', () => {
        if (t.count <= 0) return;
        const keepFocus=document.activeElement===b&&!drag?.active;
        if (state.held) { const back = state.tray.find(s => (s.w === state.held.w && s.h === state.held.h)||(s.w === state.held.h && s.h === state.held.w)); if (back) back.count++; else state.tray.push({w: state.held.w, h: state.held.h, count: 1}); }
        t.count--; state.held = {id: `t${crypto.randomUUID()}`, w: t.w, h: t.h, fromTray: true};
        if(opts.postal&&!state.pieces.length)state.cursor=null;
        say(`${t.w}×${t.h} 조각을 들었어요. 끌어 놓거나 칸을 눌러요.`); draw(); refreshTray();
        if(keepFocus)el.focus({preventScroll:true});
      }, {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 조각, 남은 수 ${t.count}`}});
      b.disabled = t.count <= 0;
      const pic = svg('svg', {viewBox: '0 0 60 36', 'aria-hidden': 'true'});
      const s = Math.min(56 / Math.max(t.w, 1), 32 / Math.max(t.h, 1), 12);
      pic.append(svg('rect', {x: 30 - t.w * s / 2, y: 18 - t.h * s / 2, width: t.w * s, height: t.h * s, fill: '#d6b283', stroke: '#5a3d1c', 'stroke-width': 2}));
      b.append(pic, node('span', {text: `${t.w}×${t.h}`}), node('span', {class: 'cnt', text: `${t.count}장`}));
      const held=state.held&&state.held.fromTray&&state.held.w===t.w&&state.held.h===t.h;
      b.setAttribute('aria-pressed',String(Boolean(held)));if(held)b.classList.add('on');
      if(opts.postal){b.style.touchAction='none';b.addEventListener('pointerdown',e=>{if(!b.disabled)beginDrag(e,()=>b.click(),null);});}
      trayEl.append(b);
    });
    const changed=state.pieces.some(p=>!(opts.pieces||[]).some(q=>q.x===p.x&&q.y===p.y&&q.w===p.w&&q.h===p.h));
    const idleCue=state.pieces.length===6&&changed?(opts.blank?'빈칸 길이를 확인해요':'아래에서 접어 확인해요'):opts.replaceable?'바꿀 종이를 톡 집어요':opts.movable?'옮길 종이를 톡 집어요':'옆에서 종이를 골라요';
    const heldInfo = node('p', {class: state.held?'mini held-piece':'mini', text: state.held ? (opts.postal?`가로 ${state.held.w}cm · 세로 ${state.held.h}cm`:`들고 있는 조각: ${state.held.w}×${state.held.h}`) : opts.postal?idleCue:'들고 있는 조각 없음'});
    if(opts.postal&&state.held){
      const preview=svg('svg',{viewBox:'0 0 120 74',class:'held-preview','aria-hidden':'true'});
      const scale=Math.min(100/state.held.w,54/state.held.h);
      preview.append(svg('rect',{x:60-state.held.w*scale/2,y:37-state.held.h*scale/2,width:state.held.w*scale,height:state.held.h*scale,rx:2,fill:'#e8cc98',stroke:'#7e6035','stroke-width':2}));
      heldInfo.prepend(preview);heldInfo.append(node('small',{text:'끌어 놓거나 · 칸을 톡 눌러요'}));
      preview.style.touchAction='none';preview.style.cursor='grab';
      preview.addEventListener('pointerdown',e=>beginDrag(e,()=>{},null));
    }
    trayEl.append(heldInfo);
  }
  // 키보드 커서
  el.addEventListener('keydown', e => {
    if (mode !== 'build') return;
    if(drag?.active){if(e.key==='Escape')endDrag({pointerId:drag.id},true);e.preventDefault();return;}
    const cur = state.cursor || (opts.postal&&state.held&&!state.pieces.length
      ? [Math.floor((cols-state.held.w)/2),Math.floor((rows-state.held.h)/2)] : [0, 0]);
    const map = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
    if (map[e.key]) { e.preventDefault(); state.cursor = [Math.max(0, Math.min(cols - (state.held?.w||1), cur[0] + map[e.key][0])), Math.max(0, Math.min(rows - (state.held?.h||1), cur[1] + map[e.key][1]))]; draw(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(!e.repeat)actOn(cur[0], cur[1]); }
    if (e.key.toLowerCase() === 'r' && opts.rotatable) {e.preventDefault();if(!e.repeat)bRotate.click();}
    if(e.key==='Escape'&&state.held){e.preventDefault();e.stopPropagation();bReturn.click();}
  });
  el.addEventListener('pointermove', e => {
    if (drag || !state.held || mode !== 'build') return;
    const [x,y]=pointerCell(e),c=Math.floor(x),r=Math.floor(y);
    if (!state.cursor || state.cursor[0] !== c || state.cursor[1] !== r) { state.cursor = [c, r]; draw(); }
  });

  // Capture on the stable board root: drawing replaces the SVG children and tray buttons.
  function beginDrag(e,pick,offset){
    suppressClickUntil=0;
    if(!opts.postal||!build||e.button!==0||!e.isPrimary||drag)return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,pick,offset,before:api.snapshot(),active:false,source:e.target.closest('button,[data-piece-id],.held-preview')};
    drag.source?.classList.add('paper-pressed');

  }
  root.addEventListener('pointerdown',()=>{suppressClickUntil=0;},true);
  root.addEventListener('pointerdown',e=>{
    const rect=e.target.closest('[data-piece-id]'),p=rect&&state.pieces.find(p=>p.id===rect.dataset.pieceId);
    if(!p||!canPick(p)||state.held)return;
    const [x,y]=pointerCell(e);
    beginDrag(e,()=>actOn(p.x+ox,p.y+oy,p),[x-(p.x+ox),y-(p.y+oy)]);
  });
  const moveDrag=e=>{
    if(!drag||drag.id!==e.pointerId)return;
    if(!drag.active&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<(e.pointerType==='mouse'?2:4))return;
    e.preventDefault();
    if(!drag.active){root.setPointerCapture(e.pointerId);drag.active=true;root.classList.add('paper-dragging');drag.pick();if(!state.held)return;drag.offset||=[state.held.w/2,state.held.h/2];bRotate.disabled=bReturn.disabled=true;trayEl.querySelectorAll('button').forEach(b=>b.disabled=true);}
    updateDragPosition(e);
  };
  function updateDragPosition(e){
    if(!state.held||!drag?.active)return;
    const point=pointerCell(e),x=point[0]-drag.offset[0],y=point[1]-drag.offset[1];
    state.cursor=[Math.round(x),Math.round(y)];
    // Only the two preview shapes move. The grid, folds and existing pieces keep their DOM nodes.
    if(!dragGhost){
      dragGhost=svg('rect',{width:state.held.w*cell,height:state.held.h*cell,rx:3});
      dragPaper=svg('g',{class:'drag-held-paper'});
      dragPaper.append(svg('rect',{width:state.held.w*cell,height:state.held.h*cell,rx:3}),svg('text',{x:state.held.w*cell/2,y:state.held.h*cell/2+6,'text-anchor':'middle',class:'label',text:`${state.held.w} × ${state.held.h}`}));
      dragHint=svg('text',{'text-anchor':'middle',class:'label'});dragLayer.append(dragGhost,dragPaper,dragHint);
    }
    const [c,r]=state.cursor,valid=canDrop(c,r);
    dragGhost.setAttribute('x',c*cell);dragGhost.setAttribute('y',r*cell);dragGhost.setAttribute('class','cell ghost '+(valid?'drop-valid':'drop-blocked'));
    dragPaper.setAttribute('transform',`translate(${x*cell} ${y*cell})`);
    dragHint.setAttribute('x',Math.max(65,Math.min(W-65,(c+state.held.w/2)*cell)));dragHint.setAttribute('y',Math.max(22,Math.min(H-10,r*cell-8)));
    dragHint.textContent=valid?'손을 떼면 놓아요':c<0||r<0||c+state.held.w>cols||r+state.held.h>rows?'모눈 안으로 옮겨요':'종이가 겹쳐요 · 빈자리로';
  }
  function endDrag(e,cancel=false){
    if(!drag||drag.id!==e.pointerId)return;
    const d=drag;if(d.active&&!cancel)updateDragPosition(e);drag=null;root.classList.remove('paper-dragging');d.source?.classList.remove('paper-pressed');
    if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);
    if(!d.active)return;
    suppressClickUntil=performance.now()+400;
    if(!cancel&&state.cursor&&canDrop(...state.cursor)){actOn(...state.cursor);}
    else{
      const outside=state.cursor&&state.held&&(state.cursor[0]<0||state.cursor[1]<0||state.cursor[0]+state.held.w>cols||state.cursor[1]+state.held.h>rows);
      const returned=d.before.held?'들고 있던 종이는 그대로예요.':d.source?.dataset.pieceId?'원래 자리로 돌려놓았어요.':'종이를 보관함에 돌려놓았어요.';
      api.restore(d.before);say(cancel?'끌기를 취소했어요.':(outside?'모눈 밖이에요. ':'종이가 겹쳐요. ')+returned);
    }
    // Tray gestures can end outside the SVG; persist the final board state, not a held intermediate.
    root.dispatchEvent(new Event('input',{bubbles:true}));
  }
  const finishDrag=e=>endDrag(e),cancelDrag=e=>endDrag(e,true);
  const blurDrag=()=>{if(drag)endDrag({pointerId:drag.id},true);};
  const escapeDrag=e=>{if(drag&&e.key==='Escape'){e.preventDefault();e.stopPropagation();blurDrag();}};
  if(opts.postal&&build){document.addEventListener('pointermove',moveDrag,true);document.addEventListener('pointerup',finishDrag,true);document.addEventListener('pointercancel',cancelDrag,true);document.addEventListener('keydown',escapeDrag,true);window.addEventListener('blur',blurDrag);}
  root.addEventListener('lostpointercapture',e=>endDrag(e,true));
  root.addEventListener('click',e=>{if(drag?.active||performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  const api = {
    el: root, svg: el, trayEl, toolsEl, msgEl, state, cell,
    getPieces() { return state.pieces.map(p => ({id: p.id, x: p.x, y: p.y, w: p.w, h: p.h})); },
    snapshot(){return structuredClone({pieces:state.pieces,held:state.held,tray:state.tray,cursor:state.cursor});},
    restore(v){for(const k of ['pieces','held','tray','cursor'])if(k in v)state[k]=structuredClone(v[k]);draw();refreshTray();state.message=state.held?`${state.held.w}×${state.held.h} 종이를 들고 있어요. 끌거나 빈칸을 눌러 놓아요.`:state.pieces.length?'종이 배치를 이어서 확인해요.':'보관함에서 종이를 골라요.';msgEl.textContent=state.message;guide();},
    getSelected() { return [...state.selected]; },
    setSelected(keys) { state.selected = new Set(keys); draw(); },
    heldPiece: () => state.held,
    markWrong(ids = []) { state.wrong = new Set(ids); draw(); },
    clearWrong() { state.wrong.clear(); draw(); },
    destroy(){document.removeEventListener('pointermove',moveDrag,true);document.removeEventListener('pointerup',finishDrag,true);document.removeEventListener('pointercancel',cancelDrag,true);document.removeEventListener('keydown',escapeDrag,true);window.removeEventListener('blur',blurDrag);if(drag){const before=drag.before,id=drag.id;drag.source?.classList.remove('paper-pressed');root.classList.remove('paper-dragging');drag=null;if(root.hasPointerCapture(id))root.releasePointerCapture(id);api.restore(before);}},
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
export function netFigure(pieces, {size = 150, showLengths = false, blanks = [], labelSize} = {}) {
  const b = boundsOf(pieces);
  const s = Math.min((size - 20) / Math.max(b.w, 1), (size - 20) / Math.max(b.h, 1));
  const el = svg('svg', {viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true'});
  const offX = (size - b.w * s) / 2 - b.x * s, offY = (size - b.h * s) / 2 - b.y * s;
  const fs = labelSize || (size >= 250 ? 16 : 13);
  for (const p of pieces) {
    el.append(svg('rect', {x: p.x * s + offX, y: p.y * s + offY, width: p.w * s, height: p.h * s, class: 'piece'}));
    if (showLengths) {
      const bw = blanks.find(k => k.piece === p.id && k.side === 'w'), bh = blanks.find(k => k.piece === p.id && k.side === 'h');
      if(size<180&&!blanks.length){
        el.append(svg('text',{x:p.x*s+offX+p.w*s/2,y:p.y*s+offY+p.h*s/2+4,class:'label',style:'font-size:11px;stroke-width:2px','text-anchor':'middle',text:`${p.w}×${p.h}`}));
        continue;
      }
      el.append(svg('text', {x: p.x * s + offX + p.w * s / 2, y: p.y * s + offY + fs + 2, class: 'label', 'data-blank-id':bw?.id||'', style: `font-size:${fs}px${bw ? ';fill:#c74b3f' : ''}`, 'text-anchor': 'middle', text: bw ? (bw.label || '?') : p.w}));
      el.append(svg('text', {x: p.x * s + offX + fs - 2, y: p.y * s + offY + (labelSize ? p.h * s - 6 : p.h * s / 2 + 5), class: 'label', 'data-blank-id':bh?.id||'', style: `font-size:${fs}px${bh ? ';fill:#c74b3f' : ''}`, 'text-anchor': 'middle', text: bh ? (bh.label || '?') : p.h}));
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
  for(const blank of blanks){const p=pieces.find(p=>p.id===blank.piece);if(!p)continue;const x=p.x*s+offX,y=p.y*s+offY;el.append(svg('line',{x1:x,y1:y,x2:x+(blank.side==='w'?p.w*s:0),y2:y+(blank.side==='h'?p.h*s:0),class:'blank-guide','data-blank-id':blank.id,'pointer-events':'none'}));}
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
  let t = 0, target = 1;
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
  slider.addEventListener('pointerdown',stop);
  slider.addEventListener('input', () => { stop();t = Number(slider.value) / 100;target=t>=1?0:1; draw();syncControls(); });
  let timer = null;
  function syncControls(){play.querySelector('span:last-child').textContent=target===0?'펼치기':'접기';play.disabled=timer!==null;pause.disabled=timer===null;slider.setAttribute('aria-valuetext',t===0?'완전히 펼침':t===1?'상자로 접힘':`${Math.round(t*100)}% 접힘`);}
  function stop(){if(timer){clearInterval(timer);timer=null;}syncControls();}
  const play = button('접기', () => {
    if (timer) { clearInterval(timer); timer = null; }
    if (reducedMotion()) { t = target;target=t>=1?0:1; slider.value = String(t * 100); draw();syncControls(); return; }
    const start = performance.now(), from = t, to = target;
    timer = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / 1400);
      t = from + (to - from) * (k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k);
      slider.value = String(Math.round(t * 100)); draw();
      if (k >= 1) { clearInterval(timer); timer = null;target=t>=1?0:1; }
      syncControls();
    }, 16);
    syncControls();
  }, {cls: 'small', icon: '▶'});
  const pause = button('잠시 멈춤', stop, {cls: 'small'});
  const row = node('div', {class: 'slider-row'}, [play, pause, node('span', {class: 'mini', text: '펼침'}), slider, node('span', {class: 'mini', text: '상자'})]);
  root.append(el, row);
  draw();syncControls();
  return {el: root, setT(v) { stop();t = v;target=t>=1?0:1; slider.value = String(v * 100); draw();syncControls(); }, play: () => play.click(), result, stop};
}
function normalOf(pts) {
  const u = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]];
  const v = [pts[3][0] - pts[0][0], pts[3][1] - pts[0][1], pts[3][2] - pts[0][2]];
  return norm([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
}
export {KOREAN_LABELS, segKey};


