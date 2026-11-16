// 단계(step) 종류별 조작 화면. 각 렌더러는 {el, tools, getAnswer, markWrong, afterCheck?, undo?} 를 돌려준다.
// 채점은 data/workshops.mjs의 check가 하고, 여기서는 답을 모으고 틀린 부분만 표시한다.
import {cuboid, faceDims, FACE_LABEL, STANDARD_VIEW} from '../lib/geometry.mjs';
import {unfoldByFolds} from '../lib/net.mjs';
import {planBoard} from '../lib/board-layout.mjs';
import {createSolidView, meshFor, solidFigure} from './solid-view.mjs?v=refine-20261116-r5';
import {createSketchView, orthoFigure, sketchFigure, fullEdges} from './sketch-view.mjs?v=refine-20261116-r5';
import {createNetBoard, netFigure, createFoldView} from './net-board.mjs?v=refine-20261116-r5';
import {createRobotView} from './robot-view.mjs';
import {node, svg, button, setPressed, clear, announce} from './dom.mjs?v=refine-20261116-r5';

const cellsToPieces = cells => cells.map(([x, y], i) => ({id: `c${i}`, x, y, w: 1, h: 1}));
const sizeKey = (w, h) => `${Math.max(w, h)}x${Math.min(w, h)}`;

export function renderStep(step, ctx = {}) {
  const r = RENDERERS[step.kind];
  if (!r) throw Error(`Unknown step kind: ${step.kind}`);
  const view=r(step, ctx); if(ctx.draft) view.restore?.(ctx.draft); return view;
}

const RENDERERS = {
  // ---- 면 떼어 보기 ----
  peel(step, ctx = {}) {
    const dims = step.dims;
    const answer = {face: null, shapes: []};
    const panel = node('div', {class: 'panel', style: {minWidth: '300px'}});
    const view = createSolidView({postal:ctx.postal,dims, mode: 'peel', faceLabels: true, onSelect: (kind, id) => { answer.face = id; drawPanel(); }});
    const bRect = button('직사각형이에요', () => toggleShape('rect'), {attrs: {'aria-pressed': 'false'}});
    const bSquare = button('정사각형이에요', () => toggleShape('square'), {attrs: {'aria-pressed': 'false'}});
    function toggleShape(s) {
      if (answer.shapes.includes(s)) answer.shapes = answer.shapes.filter(x => x !== s); else answer.shapes.push(s);
      setPressed(bRect, answer.shapes.includes('rect')); setPressed(bSquare, answer.shapes.includes('square'));
      bRect.classList.remove('wrong'); bSquare.classList.remove('wrong');
    }
    function drawPanel() {
      clear(panel);
      ctx.onGuide?.(answer.face?'shape':'face');
      if (!answer.face) { panel.append(node('h3', {text: '면을 하나 눌러 떼어 내요'}), node('p', {class: 'note', text: '상자를 돌려 보고 면을 누르면 평평하게 펼쳐져요.'})); return; }
      const [w, h] = faceDims(dims, answer.face);
      const s = Math.min(40, 180 / Math.max(w, h));
      const fig = svg('svg', {viewBox: '-140 -110 280 220', width: 280, height: 220, role: 'img', 'aria-label': `${FACE_LABEL[answer.face]} ${w}cm×${h}cm`});
      const x = -w * s / 2, y = -h * s / 2;
      fig.append(svg('rect', {x, y, width: w * s, height: h * s, fill: '#fff3c4', stroke: '#4a3418', 'stroke-width': 3}));
      for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w * s, y, -1, 1], [x + w * s, y + h * s, -1, -1], [x, y + h * s, 1, -1]]) {
        fig.append(svg('path', {d: `M${cx + sx * 14},${cy} L${cx + sx * 14},${cy + sy * 14} L${cx},${cy + sy * 14}`, fill: 'none', stroke: '#c74b3f', 'stroke-width': 2.5}));
      }
      fig.append(svg('text', {x: 0, y: y - 10, class: 'label', 'text-anchor': 'middle', text: `${w}cm`}));
      fig.append(svg('text', {x: x - 26, y: 6, class: 'label', 'text-anchor': 'middle', text: `${h}cm`}));
      fig.append(svg('text', {x: 0, y: y + h * s + 24, class: 'label', 'text-anchor': 'middle', text: `${FACE_LABEL[answer.face]}: 네 각이 모두 직각`}));
      panel.append(node('h3', {text: '떼어 낸 면'}), fig, node('p', {class: 'note', text: '이 면의 모양을 모두 표시해요 (둘 다 될 수도 있어요).'}), node('div', {class: 'row'}, [bRect, bSquare]));
    }
    drawPanel();
    const el = node('div', {class: 'row', style: {gap: '24px'}}, [view.el, panel]);
    return {el, tools: [view.controls], getAnswer: () => ({face: answer.face, shapes: answer.shapes.slice()}),
      restore(a) { answer.face=a.face; answer.shapes=[...(a.shapes||[])]; drawPanel();setPressed(bRect,answer.shapes.includes('rect'));setPressed(bSquare,answer.shapes.includes('square')); },
      markWrong(result) { for (const id of result.wrong || []) (id === 'rect' ? bRect : bSquare).classList.add('wrong'); }};
  },

  // ---- 입체 분류(배송대 올리기 / 정육면체 표시) ----
  sort(step, ctx = {}) {
    const selected = new Set();
    const items = new Map();
    const shelf = node('div', {class: 'shelf'});
    const selectionNote=node('span',{class:'chip',role:'status',text:'고른 상자 0개'});
    for (const [i, desc] of step.solids.entries()) {
      const label = ctx.postal ? `상자 ${String.fromCharCode(65+i)}` : desc.name;
      const view = createSolidView({postal:ctx.postal,mesh: meshFor(desc), size: 150, yaw: desc.tilt?.[0] ?? -0.6, pitch: desc.tilt?.[1] ?? 0.45, mode: 'none',
        scale: desc.kind === 'cuboid' || desc.kind === 'cube' ? Math.min(26, 90 / Math.max(desc.dims.x, desc.dims.y, desc.dims.z)) : 22, ariaLabel: `${label} (돌려 볼 수 있음)`});
      const tags = node('div', {class: 'tags'});
      const item = node('div', {class: 'item'});
      const toggle = button(step.mode === 'mark' ? '정육면체 표시' : '배송대에 올리기', () => {
        if (selected.has(desc.id)) selected.delete(desc.id); else selected.add(desc.id);
        item.classList.toggle('picked', selected.has(desc.id)); item.classList.remove('wrong');
        setPressed(toggle, selected.has(desc.id)); drawTags();
      }, {cls: 'small', attrs: {'aria-pressed': 'false'}});
      function drawTags() {
        if(ctx.postal)toggle.querySelector('span:last-child').textContent=selected.has(desc.id)?(step.mode==='mark'?'표시 지우기':'배송대에서 내리기'):(step.mode==='mark'?'정육면체 표시':'배송대에 올리기');
        selectionNote.textContent=`고른 상자 ${selected.size}개 · 다시 누르면 취소`;
        clear(tags);
        if (step.mode === 'mark') tags.append(node('span', {class: 'tag', text: '직육면체'}));
        if (selected.has(desc.id)) tags.append(node('span', {class: `tag ${step.mode === 'mark' ? 'cube' : ''}`, text: step.mode === 'mark' ? '정육면체' : '배송대'}));
      }
      drawTags();
      const rot = node('div', {class: 'row', style: {justifyContent: 'center'}}, [
        button('◀', () => view.rotate(-0.4, 0), {cls: 'small', attrs: {'aria-label': `${label} 왼쪽으로 돌리기`}}),
        button('▶', () => view.rotate(0.4, 0), {cls: 'small', attrs: {'aria-label': `${label} 오른쪽으로 돌리기`}}),
        button('▲', () => view.rotate(0, -0.35), {cls: 'small', attrs: {'aria-label': `${label} 위로 돌리기`}})
      ]);
      item.append(node('div', {class: 'name', text: label}), view.el, rot, tags, toggle);
      items.set(desc.id, {item, view, desc, toggle, drawTags});
      shelf.append(item);
    }
    const el = node('div', {style: {width: '100%'}}, [shelf]);
    return {el, tools: ctx.postal?[selectionNote]:[], getAnswer: () => ({selected: [...selected]}),
      restore(a) { selected.clear(); for(const id of a.selected||[]) selected.add(id);items.forEach((o,id)=>{o.item.classList.toggle('picked',selected.has(id));setPressed(o.toggle,selected.has(id));o.drawTags();}); },
      afterCheck(result) { if(ctx.postal && result.ok) items.forEach(o=>{o.item.querySelector('.name').textContent=o.desc.name;}); },
      markWrong(result) {
        for (const id of result.wrong || []) items.get(id)?.item.classList.add('wrong');
        if (result.reveal) {
          const it = items.get(result.reveal.solid);
          if (it) it.view.reveal(it.desc.kind === 'oblique' ? 2 : 0, '이 면');
        }
      }};
  },

  // ---- 3D 상자 부품 고르기 ----
  solid(step, ctx = {}) {
    const faceMarks = {};
    if (step.baseFace) faceMarks[step.baseFace] = '★ 기준';
    if (step.secondFace) faceMarks[step.secondFace] = '◆ 기준';
    const view = createSolidView({postal:ctx.postal,dims: step.dims, mode: step.mode, diagonals: step.diagonals, showFacesAtVertex: step.showFacesAtVertex, markVertex: step.markVertex,
      faceMarks, basePair: step.basePair, faceLabels: step.mode === 'faces' || step.mode === 'pairs', onSelect: () => updateCounter()});
    const counter = node('span', {class: 'chip', role: 'status'});
    const kinds = node('div', {class: 'row', role: 'group', 'aria-label': '고를 종류'});
    if (step.mode === 'all') {
      const bs = [['faces', '면'], ['edges', '모서리'], ['vertices', '꼭짓점']].map(([k, t]) => button(t, () => { view.setKind(k);updateCounter(); bs.forEach(b => setPressed(b, b.dataset.kind === k)); }, {cls: 'small', attrs: {'data-kind': k, 'aria-pressed': String(k === 'faces')}}));
      kinds.append(...bs);
      if(ctx.postal){counter.hidden=true;kinds.classList.add('component-checklist');}
    }
    function updateCounter() {
      const c = view.counts();
      if(ctx.postal){
        const kind=view.state.kind;
        if(step.mode==='all'){
          const missing=[['faces',6],['edges',12],['vertices',8]].filter(([k,n])=>c[k]<n);
          ctx.onGuide?.(!missing.length?'ready':!missing.some(([k])=>k===kind)?missing[0][0]+'-next':kind);
        }else if(step.mode==='pairs')ctx.onGuide?.(view.state.pending?'pair-second':c.pairs===step.count?'ready':'pairs');
        else ctx.onGuide?.(Number.isInteger(step.count)&&c[kind]===step.count?'ready':kind);
      }
      if(ctx.postal&&step.mode==='all')for(const [k,label,total]of [['faces','면',6],['edges','모서리',12],['vertices','꼭짓점',8]]){const b=kinds.querySelector(`[data-kind="${k}"]`);b.querySelector('span:last-child').textContent=`${c[k]===total?'✓ ':''}${label} ${c[k]} / ${total}`;}
      if (step.mode === 'all') counter.textContent = `면 ${c.faces}/6 · 모서리 ${c.edges}/12 · 꼭짓점 ${c.vertices}/8`;
      else if (step.mode === 'pairs') counter.textContent = `${step.counterLabel} ${c.pairs} / ${step.count}`;
      else if(step.mode==='faces'&&!Number.isInteger(step.count))counter.textContent=`고른 면 ${c.faces}개`;
      else counter.textContent = `${step.counterLabel} ${step.mode === 'faces' ? c.faces : step.mode === 'edges' ? c.edges + c.diagonals : c.vertices} / ${step.count}`;
    }
    updateCounter();
    const transparent = button('투명 보기', () => { view.setTransparent(!view.state.transparent); setPressed(transparent, view.state.transparent); }, {cls: 'small', attrs: {'aria-pressed': 'false'}});
    const side = node('div', {class: 'panel compact'}, [node('h3', {text: ctx.postal ? '차곡차곡 포장 중' : '진행'}), counter, kinds, node('p', {class: 'note', text: step.mode === 'pairs' ? '면 두 개를 차례로 누르면 짝이 돼요. 다시 누르면 풀려요.' : ctx.postal&&step.mode==='vertices' ? '살짝 눌러 붙이고, 한 번 더 누르면 뗄 수 있어요.' : '같은 곳을 다시 누르면 취소돼요.'})]);
    const el = node('div', {class: 'row', style: {justifyContent: 'center'}}, [view.el]);
    const capTools=[];
    if(ctx.postal&&step.mode==='vertices'){
      const cap=button('◩ 보호캡 집기',()=>{cap.title='상자의 꼭짓점을 누르거나 보호캡을 끌어 놓아요.';},{cls:'small cap-tray'});
      let dragging=false,ghost;
      const clean=()=>{dragging=false;cap.classList.remove('dragging');ghost?.remove();ghost=null;};
      cap.style.touchAction='none';
      cap.addEventListener('pointerdown',e=>{clean();dragging=true;cap.classList.add('dragging');cap.setPointerCapture(e.pointerId);ghost=node('div',{class:'cap-ghost',text:'◩'});document.body.append(ghost);ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
      cap.addEventListener('pointermove',e=>{if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}});
      cap.addEventListener('pointerup',e=>{if(dragging){const hit=document.elementFromPoint(e.clientX,e.clientY);if(hit?.classList.contains('vertex-hit')&&view.svg.contains(hit))hit.dispatchEvent(new MouseEvent('click',{bubbles:true}));}clean();});
      cap.addEventListener('pointercancel',clean);cap.addEventListener('lostpointercapture',clean);capTools.push(cap);
    }
    return {el, side, tools: [...capTools,view.controls, transparent], getAnswer: () => view.getSelection(), restore(a){view.setSelection(a);updateCounter();}, markWrong: result => view.markWrong(result.wrong || [])};
  },

  // ---- 선택 카드 ----
  choice(step,ctx={}) {
    const selected = new Set();
    const multi = step.answer.length > 1;
    const cards = node('div', {class: `cards ${step.options.length === 3 ? 'three' : ''}`, role: 'group', 'aria-label': multi ? '모두 고르기' : '하나 고르기'});
    const selectionNote=node('span',{class:'chip',role:'status'});
    const updateNote=()=>selectionNote.textContent=`고른 카드 ${selected.size}개 · ${multi?'맞는 것을 모두 골라요':'하나를 골라요'}`;updateNote();
    const buttons = new Map();
    for (const o of step.options) {
      const b = button('', () => {
        if (!multi) { selected.clear(); buttons.forEach(x => { setPressed(x, false); x.classList.remove('wrong'); }); }
        if (selected.has(o.id)) selected.delete(o.id); else selected.add(o.id);
        setPressed(b, selected.has(o.id)); b.classList.remove('wrong');updateNote();
      }, {attrs: {'aria-pressed': 'false'}});
      b.firstChild?.remove();
      if (step.figures === 'views') b.append(o.id === 'oblique' ? sketchFigure(step.dims, {size: 150}) : orthoFigure(step.dims, o.id, {size: 150}));
      if (step.figures === 'nets' && o.cells) b.append(netFigure(cellsToPieces(o.cells), {size: 150}));
      const line = node('div', {class: 'row'}, [node('span', {class: 'mark', 'aria-hidden': 'true', text: multi ? '✓' : '●'}), node('span', {text: o.text || ''})]);
      b.append(line);
      buttons.set(o.id, b); cards.append(b);
    }
    const wrap = node('div', {style: {display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}});
    if (step.figureCells) wrap.append(node('div', {class: 'panel'}, [node('h3', {text: '이 모양'}), netFigure(cellsToPieces(step.figureCells), {size: 180})]));
    wrap.append(cards);
    if (multi) wrap.append(node('p', {class: 'note', text: '맞는 것을 모두 골라요.'}));
    return {el: wrap, tools: ctx.postal?[selectionNote]:[], getAnswer: () => ({selected: [...selected]}), restore(a){selected.clear();for(const id of a.selected||[])selected.add(id);buttons.forEach((b,id)=>setPressed(b,selected.has(id)));updateNote();}, markWrong(result) { for (const id of result.wrong || []) buttons.get(id)?.classList.add('wrong'); }};
  },

  // ---- 빈칸·고르기 입력 ----
  fill(step) {
    const inputs = new Map();
    const fields = node('div', {class: 'fields'});
    for (const f of step.fields || []) {
      const inp = node('input', {type: 'text', inputmode: 'numeric', pattern: '[0-9]*', id: `f-${f.id}`, 'aria-label': f.label});
      inp.addEventListener('input', () => inp.parentElement.classList.remove('wrong'));
      const row = node('div', {class: 'field'}, [node('label', {for: `f-${f.id}`, text: f.label}), inp, node('span', {class: 'unit', text: f.unit || ''})]);
      inputs.set(f.id, {el: inp, row}); fields.append(row);
    }
    for (const s of step.selects || []) {
      const sel = node('select', {id: `s-${s.id}`, 'aria-label': s.label});
      sel.append(node('option', {value: '', text: '고르기'}));
      for (const o of s.options) sel.append(node('option', {value: o, text: o}));
      sel.addEventListener('change', () => sel.parentElement.classList.remove('wrong'));
      const row = node('div', {class: 'field'}, [node('label', {for: `s-${s.id}`, text: s.label}), sel]);
      inputs.set(s.id, {el: sel, row}); fields.append(row);
    }
    const wrap = node('div', {style: {display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}});
    const fig = step.figure;
    let figView = null;
    if (fig?.net) wrap.append(node('div', {class: 'panel'}, [node('h3', {text: '전개도'}), netFigure(fig.net.pieces, {size: 300, showLengths: true, blanks: fig.blanks.map((b, i) => ({...b, label: ['ㄱ', 'ㄴ', 'ㄷ'][i]}))}), blanksFigure(fig)]));
    else if (fig?.marks) {
      const edgeLabels = {}, vertexLabels = {}, faceMarks = {};
      for (const m of fig.marks) (m.type === 'edge' ? edgeLabels : m.type === 'vertex' ? vertexLabels : faceMarks)[m.id] = m.label;
      figView = createSolidView({dims: fig.dims, size: 300, mode: 'none', edgeLabels, vertexLabels, faceMarks});
      wrap.append(node('div', {class: 'panel'}, [figView.el, node('p', {class: 'note', text: '돌려 볼 수 있어요.'})]));
    } else if (fig?.dims) {
      wrap.append(node('div', {class: 'panel'}, [sketchFigure(fig.dims, {size: 260, showLengths: !!fig.showLengths}), fig.highlight ? node('p', {class: 'note', text: `${FACE_LABEL[fig.highlight]}을 구해요.`}) : null]));
    }
    wrap.append(node('div', {class: 'panel'}, [node('h3', {text: '답 적기'}), fields]));
    return {el: wrap, tools: figView ? [figView.controls] : [], focusFirst: () => inputs.values().next().value?.el.focus(),
      getAnswer: () => ({values: Object.fromEntries([...inputs].map(([k, v]) => [k, v.el.value]))}),
      restore(a){inputs.forEach((v,k)=>{v.el.value=a.values?.[k]??'';});},
      markWrong(result) { for (const id of result.wrong || []) inputs.get(id)?.row.classList.add('wrong'); }};
  },

  // ---- 겨냥도 ----
  sketch(step, ctx = {}) {
    const view = step.view || STANDARD_VIEW;
    let edges;
    if (step.given === 'all-solid') { edges = {}; for (const id of Object.keys(fullEdges(step.dims, view))) edges[id] = 'solid'; }
    else { edges = fullEdges(step.dims, view); for (const id of step.missing || []) edges[id] = 'missing'; Object.assign(edges, typeof step.given === 'object' ? step.given : {}); }
    const sk = createSketchView({dims: step.dims, view, edges, tool: step.tool, showLengths: step.showLengths, width: 480, height: 380,onGuide:ctx.onGuide});
    const undo = button('되돌리기', () => sk.undo(), {cls: 'small', icon: '↶'});
    const reveal = button('투명 보기', () => sk.reveal(true), {cls: 'small'});
    const side = node('div', {class: 'panel', style: {minWidth: '240px'}}, [
      node('h3', {text: step.tool === 'draw' ? '선 그리기' : '선 바꾸기'}),
      step.tool === 'draw' ? sk.typeButtons : null,
      node('p', {class: 'note', text: step.tool === 'draw' ? '선 종류를 고른 뒤 꼭짓점 두 개를 차례로 눌러요. 그린 선을 누르면 종류가 바뀌어요.' : '선을 누르면 실선과 점선이 바뀌어요.'}),
      node('p', {class: 'note', text: '실선 = 보이는 모서리, 점선 = 가려진 모서리'})
    ]);
    side.style.width = '280px'; side.style.flexShrink = '0';
    const el = node('div', {class: 'row', style: {gap: '24px', flexWrap: 'nowrap'}}, [sk.el, side]);
    return {el, tools: [undo, reveal], getAnswer: () => ({edges: sk.getEdges()}), restore(a){for(const k of Object.keys(sk.state.edges))sk.state.edges[k]=a.edges?.[k]||'missing';sk.state.extras=Object.fromEntries(Object.entries(a.edges||{}).filter(([k])=>!(k in sk.state.edges)));sk.redraw();}, markWrong: result => sk.markWrong(result.wrong || []),
      afterCheck(result) { if (result.ok && step.reveal === 'transparent') sk.reveal(true); }};
  },

  // ---- 절개안 고르기 ----
  'cut-plan'(step) {
    let selected = null;
    const cards = node('div', {class: 'cards three'});
    const buttons = new Map();
    const after = node('div');
    for (const plan of step.plans) {
      const v = createSolidView({dims: {x: 2, y: 2, z: 2}, size: 170, mode: 'none', transparent: true, scale: 34, ariaLabel: `절개안 ${plan.id}`});
      v.markWrong(plan.cuts); v.svg.removeAttribute('tabindex');
      const b = button('', () => { selected = plan.id; buttons.forEach((x, id) => { setPressed(x, id === plan.id); x.classList.remove('wrong'); }); }, {attrs: {'aria-pressed': 'false'}});
      b.firstChild?.remove();
      b.append(v.el, node('div', {class: 'row'}, [node('span', {class: 'mark', text: '●'}), node('span', {text: `절개안 ${plan.id} · 자르는 모서리 ${plan.cuts.length}개`})]));
      buttons.set(plan.id, b); cards.append(b);
    }
    const intro = node('p', {class: 'note', text: '빨간 선이 자르는 모서리예요. 카드의 상자는 뒤쪽도 비쳐 보여요.'});
    const el = node('div', {style: {display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center'}}, [intro, cards, after]);
    return {el, tools: [], getAnswer: () => ({selected}), restore(a){selected=a.selected;buttons.forEach((b,id)=>setPressed(b,id===selected));},
      markWrong(result) { for (const id of result.wrong || []) buttons.get(id)?.classList.add('wrong'); },
      afterCheck(result) {
        clear(after);
        if (!selected || !result.ok) return;
        // 성공: 선택 카드를 접고 펼친 그림 + 설명으로 전환(스테이지 높이 420 안에 유지)
        const plan = step.plans.find(p => p.id === selected);
        const r = unfoldByFolds({x: 1, y: 1, z: 1}, plan.folds);
        cards.hidden = true; intro.hidden = true;
        const mini = createSolidView({dims: {x: 2, y: 2, z: 2}, size: 150, mode: 'none', transparent: true, scale: 30, ariaLabel: `절개안 ${plan.id}`});
        mini.markWrong(plan.cuts); mini.svg.removeAttribute('tabindex');
        after.append(node('div', {class: 'panel row', style: {flexWrap: 'nowrap', gap: '16px', maxWidth: '900px'}}, [
          node('div', {style: {textAlign: 'center'}}, [node('h3', {text: `절개안 ${plan.id}`}), mini.el]),
          node('div', {style: {textAlign: 'center'}}, [node('h3', {text: '펼친 모양'}), netFigure(r.pieces, {size: 220})]),
          node('p', {class: 'note', style: {maxWidth: '300px'}, text: '실선은 잘린 모서리, 점선은 접힌 모서리예요. 겨냥도의 점선(가려진 모서리)과 뜻이 달라요.'})
        ]));
      }};
  },

  // ---- 될까 안 될까 ----
  'net-predict'(step) {
    const pieces = cellsToPieces(step.candidate.cells);
    let predict = null;
    const bYes = button('될 거예요', () => set(true), {attrs: {'aria-pressed': 'false'}});
    const bNo = button('안 될 거예요', () => set(false), {attrs: {'aria-pressed': 'false'}});
    function set(v) { predict = v; setPressed(bYes, v === true); setPressed(bNo, v === false); }
    const predictRow = node('div', {class: 'row'}, [bYes, bNo]);
    const predictNote = node('p', {class: 'note', text: '제출한 뒤에 접어서 확인해요.'});
    const predictTitle = node('h3', {text: '예상'});
    const resultPanel = node('div', {class: 'panel compact', hidden: true});
    const el = node('div', {class: 'row', style: {gap: '16px', alignItems: 'flex-start', flexWrap: 'nowrap'}}, [
      node('div', {class: 'panel'}, [node('h3', {text: `모양 ${step.index + 1}`}), netFigure(pieces, {size: 220})]),
      node('div', {class: 'panel'}, [predictTitle, predictRow, predictNote]),
      resultPanel
    ]);
    let fold = null;
    return {el, tools: [], getAnswer: () => ({predict}), restore(a){set(a.predict);}, markWrong() {},
      afterCheck(result) {
        // 제출 후: 예상 버튼을 접고(선택은 글로 남김) 접은 모습을 별도 결과 패널에 보여 준다.
        clear(resultPanel); fold?.stop();
        predictRow.hidden = true; predictNote.hidden = true;
        predictTitle.textContent = `내 예상: ${predict ? '될 거예요' : '안 될 거예요'} → ${result.ok ? '맞았어요' : '다시 생각해요'}`;
        fold = createFoldView({pieces, size: 220});
        resultPanel.hidden = false;
        resultPanel.append(node('h3', {text: '접어서 확인'}), fold.el);
        fold.play();
        if (!result.ok) { predictRow.hidden = false; }
      }};
  },

  // ---- 전개도 만들기/고치기 ----
  'net-build'(step, ctx = {}) {
    // 모눈 크기는 실제 정답 배치가 들어가도록 계산한다(lib/board-layout.mjs). 빈 바탕(자유 설계)은 15×12(셀 30px).
    const free = !step.base.length;
    const plan = planBoard(step);
    const board = createNetBoard({postal:ctx.postal,pieces: step.base, fixedIds: step.fixedBase ? step.base.map(p => p.id) : [], tray: step.tray, rotatable: step.rotatable, movable: step.movable, replaceable: step.replaceable,
      showLengths: !!step.dims, blank: step.blankLength ? {piece: step.blankLength.piece, side: step.blankLength.side} : null,
      cols: plan.cols, rows: plan.rows, ox: plan.ox, oy: plan.oy, width: free ? 450 : 500, height: free ? 360 : 380,onGuide:ctx.onGuide});
    const foldSlot = node('div');
    let blankInput = null;
    const side = node('div', {class: 'panel compact', style: {minWidth: '150px', maxWidth: '190px'}}, [node('h3', {text: '조각 보관함'}), board.trayEl, board.msgEl]);
    const tools = [board.toolsEl];
    if (step.blankLength) {
      blankInput = node('input', {type: 'text', inputmode: 'numeric', id: 'blank-len', 'aria-label': '빈칸(?)의 길이'});
      blankInput.addEventListener('input', () => blankInput.parentElement.classList.remove('wrong'));
      tools.push(node('div', {class: 'field'}, [node('label', {for: 'blank-len', text: '빈칸 ? 길이'}), blankInput, node('span', {class: 'unit', text: 'cm'})]));
    }
    if (step.part) side.prepend(node('p', {class: 'note', text: `부품: ${step.part}`}));
    const el = node('div', {class: 'row net-layout', style: {gap: '14px', alignItems: 'flex-start', flexWrap: 'nowrap'}}, [board.el, side, foldSlot]);
    let fold = null;
    return {el, tools, getAnswer: () => ({pieces: board.getPieces(), values: blankInput ? {blank: blankInput.value} : {}, board:board.snapshot()}), restore(a){if(a.board)board.restore(a.board);else if(a.pieces)board.restore({...board.snapshot(),pieces:a.pieces});if(blankInput)blankInput.value=a.values?.blank??'';},
      markWrong(result) { board.markWrong((result.wrong || []).filter(id => id !== 'blank')); if ((result.wrong || []).includes('blank')) blankInput?.parentElement.classList.add('wrong'); },
      afterCheck(result) {
        clear(foldSlot); fold?.stop();
        if (!result.fold && !result.ok) return;
        // 손에 든 여분 조각과 관계없이 채점한 보드의 배치를 보여 준다.
        const pieces = board.getPieces();
        if (pieces.length < 2) return;
        if (result.ok && step.robotFinal) {
          // 마지막 부품: 접기 보기 대신 조립 결과를 같은 결과 영역에 보여 준다(화면 밖으로 나가지 않게 하나만).
          const robot = createRobotView({size: 200});
          foldSlot.append(node('div', {class: 'panel compact result'}, [node('h3', {text: '조립한 로봇'}), robot.el, robot.controls, node('p', {class: 'note', text: '팔과 다리는 같은 부품을 복제했어요.'})]));
          robot.spin();
          return;
        }
        fold = createFoldView({pieces, dims: step.dims || null, size: 210});
        foldSlot.append(node('div', {class: 'panel compact result'}, [node('h3', {text: result.ok ? '접어서 확인' : '접으면 이렇게 돼요'}), fold.el]));
        fold.play();
      }};
  },

  // ---- 만나는 점/모서리 ----
  'net-points'(step) {
    const board = createNetBoard({pieces: step.pieces, mode: step.ask === 'point' ? 'points' : 'segments', origin: step.from, width: 380, height: 300});
    const fold = createFoldView({pieces: step.pieces, size: 220});
    const el = node('div', {class: 'row', style: {gap: '20px', alignItems: 'flex-start'}}, [
      node('div', {class: 'panel'}, [node('h3', {text: step.ask === 'point' ? '점 ㄱ과 만나는 점 고르기' : '모서리 ㄱㄴ과 만나는 모서리 고르기'}), board.el, node('p', {class: 'note', text: '노란 표시가 기준이에요. 접기 슬라이더로 따라가 볼 수 있어요.'})]),
      node('div', {class: 'panel'}, [node('h3', {text: '접기 보기'}), fold.el])
    ]);
    return {el, tools: [], getAnswer: () => ({selected: board.getSelected()}), restore(a){board.setSelected(a.selected||[]);}, markWrong: result => board.markWrong(result.wrong || []), afterCheck(result) { if (result.ok) fold.play(); }};
  },

  // ---- 조각 수 준비 ----
  'tray-count'(step) {
    const counts = {};
    const rows = new Map();
    const list = node('div', {class: 'counter'});
    for (const t of step.tray) {
      const key = sizeKey(t.w, t.h);
      counts[key] = 0;
      const num = node('span', {class: 'num', role: 'status', 'aria-label': `${t.w}×${t.h} 장수`, text: '0'});
      const pic = svg('svg', {viewBox: '0 0 70 54', 'aria-hidden': 'true'});
      const s = Math.min(60 / t.w, 44 / t.h, 11);
      pic.append(svg('rect', {x: 35 - t.w * s / 2, y: 27 - t.h * s / 2, width: t.w * s, height: t.h * s, class: 'piece'}));
      pic.append(svg('text', {x: 35, y: 31, class: 'label', style: 'font-size:13px', 'text-anchor': 'middle', text: `${t.w}×${t.h}`}));
      const item = node('div', {class: 'item'}, [pic, node('div', {class: 'count-row'}, [
        button('−', () => { counts[key] = Math.max(0, counts[key] - 1); num.textContent = String(counts[key]); item.classList.remove('wrong'); }, {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 한 장 빼기`}}),
        num,
        button('+', () => { counts[key] = Math.min(4, counts[key] + 1); num.textContent = String(counts[key]); item.classList.remove('wrong'); }, {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 한 장 더하기`}})
      ])]);
      rows.set(key, item); list.append(item);
    }
    const el = node('div', {class: 'row', style: {gap: '24px', alignItems: 'flex-start'}}, [
      node('div', {class: 'panel'}, [node('h3', {text: '주문 상자'}), sketchFigure(step.dims, {size: 220, showLengths: true}), node('p', {class: 'note', text: `가로 ${step.dims.x}cm · 세로 ${step.dims.y}cm · 높이 ${step.dims.z}cm`})]),
      node('div', {class: 'panel'}, [node('h3', {text: '직사각형 준비(단위 cm)'}), list])
    ]);
    return {el, tools: [], getAnswer: () => ({counts: {...counts}}), restore(a){for(const k of Object.keys(counts)){counts[k]=a.counts?.[k]||0;rows.get(k).querySelector('.num').textContent=counts[k];}}, markWrong(result) { for (const id of result.wrong || []) rows.get(id)?.classList.add('wrong'); }};
  },

  // ---- 카드 연결 ----
  link(step) {
    const links = {};
    const cells = new Map();
    const table = node('div', {class: 'link-table'});
    table.append(node('div', {class: 'head', text: '입체'}), node('div', {class: 'head', text: '겨냥도'}), node('div', {class: 'head', text: '전개도'}));
    const sketchLetters = ['A', 'B', 'C'], netLetters = ['ㄱ', 'ㄴ', 'ㄷ'];
    for (const s of step.solids) {
      links[s.id] = {sketch: '', net: ''};
      const fig = solidFigure({kind: 'cuboid', dims: s.dims}, {size: 120});
      const solidCell = node('div', {class: 'cell'}, [fig.el, node('div', {class: 'mini', text: s.name})]);
      const mkSelect = (kind, letters, items) => {
        const sel = node('select', {'aria-label': `${s.name}의 ${kind === 'sketch' ? '겨냥도' : '전개도'}`});
        sel.append(node('option', {value: '', text: '고르기'}));
        items.forEach((it, i) => sel.append(node('option', {value: it.id, text: letters[i]})));
        sel.addEventListener('change', () => { links[s.id][kind] = sel.value; sel.parentElement.classList.remove('wrong'); });
        const cell = node('div', {class: 'cell'}, [sel]);
        cells.set(`${s.id}:${kind}`, cell);
        return cell;
      };
      table.append(solidCell, mkSelect('sketch', sketchLetters, step.sketches), mkSelect('net', netLetters, step.nets));
    }
    const legend = node('div', {class: 'row', style: {gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}});
    step.sketches.forEach((k, i) => legend.append(node('div', {class: 'cell', style: {background: '#fff', border: '2px solid #e2d5ae', borderRadius: '12px', padding: '4px', textAlign: 'center'}}, [node('div', {class: 'mini', text: `겨냥도 ${sketchLetters[i]}`}), sketchFigure(k.dims, {size: 150, showLengths: true})])));
    step.nets.forEach((n, i) => legend.append(node('div', {class: 'cell', style: {background: '#fff', border: '2px solid #e2d5ae', borderRadius: '12px', padding: '4px', textAlign: 'center'}}, [node('div', {class: 'mini', text: `${netLetters[i]} · 가로×세로(cm)`}), netFigure(n.net.pieces, {size: 150, showLengths: true})])));
    legend.style.display = 'grid'; legend.style.gridTemplateColumns = 'repeat(3, 1fr)';
    const el = node('div', {class: 'card-match', style: {display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center', width: '100%'}}, [legend, table]);
    return {el, tools: [], getAnswer: () => ({links: JSON.parse(JSON.stringify(links))}), restore(a){for(const [id,value]of Object.entries(a.links||{})){if(!links[id])continue;links[id]={...value};for(const k of ['sketch','net'])cells.get(id+':'+k).querySelector('select').value=value[k]||'';}}, markWrong(result) { for (const id of result.wrong || []) cells.get(id)?.classList.add('wrong'); }};
  }
};

function blanksFigure(fig) {
  // 빈칸 위치 설명: 전개도 그림 위 라벨은 netFigure가 숫자로 그리므로, 빈칸은 글로 안내한다.
  const names = {front: '앞면', back: '뒷면', top: '윗면', bottom: '아랫면', left: '왼쪽 면', right: '오른쪽 면'};
  const labels = ['ㄱ', 'ㄴ', 'ㄷ'];
  return node('p', {class: 'note', text: fig.blanks.map((b, i) => `${labels[i]}: ${names[b.piece]}의 ${b.side === 'w' ? '가로' : '세로'}`).join(' · ')});
}


