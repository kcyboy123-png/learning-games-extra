import {postalCut} from './postal-cut.mjs?v=three-pass-20261120';
import {paperSurface} from './paper-surface.mjs?v=carton-material-20261119';
// 단계(step) 종류별 조작 화면. 각 렌더러는 {el, tools, getAnswer, markWrong, afterCheck?, undo?} 를 돌려준다.
// 채점은 data/workshops.mjs의 check가 하고, 여기서는 답을 모으고 틀린 부분만 표시한다.
import {cuboid, faceDims, FACE_LABEL, STANDARD_VIEW} from '../lib/geometry.mjs';
import {unfoldByFolds} from '../lib/net.mjs';
import {planBoard} from '../lib/board-layout.mjs';
import {createSolidView, meshFor, solidFigure} from './solid-view.mjs?v=gifts-math-final-20261119';
import {createSketchView, orthoFigure, sketchFigure, fullEdges} from './sketch-view.mjs?v=gifts-math-final-20261119';
import {createNetBoard, netFigure, createFoldView} from './net-board.mjs?v=paper-guidance-20261120';
import {createRobotView} from './robot-view.mjs?v=ui-journey-20261118';
import {node, svg, button, setPressed, clear, announce, reducedMotion, pressable} from './dom.mjs?v=tactile-audit-e-20261118';

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
    const answer = {face: ctx.postal ? 'front' : null, shapes: []};
    const panel = node('div', {class: 'panel', style: {minWidth: '300px'}});
    const view = createSolidView({postal:ctx.postal,dims, yaw:ctx.postal?.48:undefined,pitch:ctx.postal?.38:undefined,scale:ctx.postal?410/Math.hypot(dims.x,dims.y,dims.z):undefined, mode: 'peel', faceLabels: !ctx.postal, onSelect: (kind, id) => { if(answer.face!==id)answer.shapes=[]; answer.face = id; drawPanel(); }});
    const bRect = button(ctx.postal?'달라요':'직사각형이에요', ctx.postal?null:() => toggleShape('rect'), {attrs: {'aria-pressed': 'false'}});
    const bSquare = button(ctx.postal?'같아요':'정사각형이에요', ctx.postal?null:() => toggleShape('square'), {attrs: {'aria-pressed': 'false'}});
    if(ctx.postal){pressable(bRect,()=>toggleShape('rect'),'길이가 달라요');pressable(bSquare,()=>toggleShape('square'),'모두 같아요');}
    const el = node('div', {class: ctx.postal?'peel-workflow':'row', style: {gap: '24px'}}, [view.el, panel]);
    if(ctx.postal){
      const connection=svg('svg',{class:'peel-connection',viewBox:'0 0 1000 400','aria-hidden':'true'});
      connection.append(svg('path',{d:'M340 253 Q440 309 554 255',fill:'none',stroke:'#fff8df','stroke-width':5,'stroke-linecap':'round','stroke-dasharray':'6 12'}),svg('path',{d:'M541 249 L560 252 L551 269',fill:'none',stroke:'#fff8df','stroke-width':5,'stroke-linejoin':'round','stroke-linecap':'round'}));el.append(connection);
      for(const [b,square] of [[bRect,false],[bSquare,true]]){
        b.classList.add('shape-answer');const icon=svg('svg',{viewBox:'0 0 100 70','aria-hidden':'true'});
        icon.append(svg('rect',{x:square?25:10,y:10,width:square?50:80,height:50,rx:2,fill:'#e2ecd4',stroke:'#42664f','stroke-width':3}));b.prepend(icon);
        b.append(node('small',{text:square?'네 변이 같은 길이':'가로와 세로가 다른 길이'}));
      }
    }
    function toggleShape(s) {
      if(ctx.postal){answer.shapes=s==='square'?['rect','square']:['rect'];} else if (answer.shapes.includes(s)) answer.shapes = answer.shapes.filter(x => x !== s); else answer.shapes.push(s);
      setPressed(bRect, answer.shapes.includes('rect')&&(!ctx.postal||!answer.shapes.includes('square'))); setPressed(bSquare, answer.shapes.includes('square'));
      bRect.classList.remove('wrong'); bSquare.classList.remove('wrong');
      ctx.onGuide?.(answer.shapes.length?'selected':'shape');
    }
    function drawPanel() {
      clear(panel);
      setPressed(bRect,answer.shapes.includes('rect')&&(!ctx.postal||!answer.shapes.includes('square')));setPressed(bSquare,answer.shapes.includes('square'));
      bRect.classList.remove('wrong');bSquare.classList.remove('wrong');
      el.dataset.phase=answer.face?'shape':'face';
      ctx.onGuide?.(answer.shapes.length?'selected':answer.face?'shape':'face');
      if (!answer.face) { panel.append(node('h3', {text: '① 상자의 넓은 면을 톡!'}), node('p', {class: 'note', text: '윗면·앞면·옆면 중 어디든 눌러 보세요.'}),node('p',{class:'peel-preview',text:'면을 고르면 → 여기에서 크게 펼쳐 봐요'})); return; }
      const [w, h] = faceDims(dims, answer.face);
      const s = Math.min(ctx.postal?48:40, (ctx.postal?192:180) / Math.max(w, h));
      const fig = svg('svg', {viewBox: '-140 -110 280 220', width: 280, height: 220, role: 'img', 'aria-label': `${FACE_LABEL[answer.face]} ${w}cm×${h}cm`});
      const x = -w * s / 2, y = -h * s / 2;
      fig.append(svg('rect', {x, y, width: w * s, height: h * s, fill: ctx.postal?'#efd09a':'#fff3c4', stroke: '#785432', 'stroke-width': 2.5}));
      if(ctx.postal){
        fig.append(svg('rect',{x,y,width:w*s,height:h*s,fill:paperSurface(fig,true),opacity:.22,'pointer-events':'none'}),svg('path',{d:`M${x+2} ${y+h*s-2}H${x+w*s-2}V${y+2}`,fill:'none',stroke:'#b58a52','stroke-width':2,'pointer-events':'none'}));
      }
      for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w * s, y, -1, 1], [x + w * s, y + h * s, -1, -1], [x, y + h * s, 1, -1]]) {
        fig.append(svg('path', {d: `M${cx + sx * 14},${cy} L${cx + sx * 14},${cy + sy * 14} L${cx},${cy + sy * 14}`, fill: 'none', stroke: '#c74b3f', 'stroke-width': 2.5}));
      }
      fig.append(svg('text', {x: 0, y: y - 10, class: 'label', 'text-anchor': 'middle', text: `${w}cm`}));
      fig.append(svg('text', {x: x - 26, y: 6, class: 'label', 'text-anchor': 'middle', text: `${h}cm`}));
      fig.append(svg('text', {x: 0, y: y + h * s + 24, class: 'label', 'text-anchor': 'middle', text: ctx.postal?`${w}cm`: `${FACE_LABEL[answer.face]}: 네 각이 모두 직각`}));
      if(ctx.postal)fig.append(svg('text',{x:-x+26,y:6,class:'label','text-anchor':'middle',text:`${h}cm`}));
      panel.append(node('h3', {text: ctx.postal?`${FACE_LABEL[answer.face]}에서 떼어 낸 종이`:'② 이 면은 어떤 모양인가요?'}), fig, node('p', {class: 'note', text: ctx.postal?'하나만 골라요':'맞는 이름을 모두 눌러요. 두 개를 고를 수도 있어요.'}), node('div', {class: 'shape-answers row'}, [bRect, bSquare]));
    }
    if(ctx.postal){el.classList.add('one-choice-face','parcel-face');view.state.peeled=answer.face;view.redraw();}
    drawPanel();
    const rotateTools=ctx.postal?node('details',{class:'peel-rotate'},[node('summary',{text:'상자 돌려 보기'}),view.controls]):view.controls;
    return {el, tools: [rotateTools], getAnswer: () => ({face: answer.face, shapes: answer.shapes.slice()}),
      ready:()=>Boolean(answer.face&&answer.shapes.length),
      restore(a) { answer.face=a.face||(ctx.postal?'front':null); answer.shapes=ctx.postal&&a.shapes?.length?(a.shapes.includes('square')?['rect','square']:['rect']):[...(a.shapes||[])];view.state.peeled=answer.face;view.redraw(); drawPanel();ctx.onGuide?.(answer.shapes.length?'selected':answer.face?'shape':'face'); },
      markWrong(result) { for (const id of result.wrong || []) (id === 'rect' ? bRect : bSquare).classList.add('wrong'); }};
  },

  // ---- 입체 분류(배송대 올리기 / 정육면체 표시) ----
  sort(step, ctx = {}) {
    const selected = new Set();
    const items = new Map();
    const shelf = node('div', {class: 'shelf'});
    const review=ctx.activityId?.includes('-r'),turning=step.solids.some(s=>s.tilt);
    const station=step.mode==='mark'?'정육면체 도장대':review?'출발 점검대':turning?'방향 비교대':'배송대';
    const inspectDialog=node('dialog',{class:'parcel-inspector','aria-label':'상자 크게 살펴보기'});
    const reviewFace=desc=>desc.kind==='oblique'?2:step.mode==='mark'&&desc.dims?(desc.dims.x!==desc.dims.y?4:3):0;
    let inspection=null;
    function inspect(desc,label,result){
      inspection?.destroy();
      clear(inspectDialog);
      const small=items.get(desc.id).view;
      const art=createSolidView({postal:true,mesh:meshFor(desc),yaw:small.state.yaw,pitch:small.state.pitch,size:300,scale:desc.dims?160/Math.max(desc.dims.x,desc.dims.y,desc.dims.z):43,mode:'none'});
      inspection=art;
      inspectDialog.onclose=()=>{art.destroy();inspection=null;small.state.yaw=art.state.yaw;small.state.pitch=art.state.pitch;small.redraw();items.get(desc.id).item.querySelector('.inspect-box')?.focus({preventScroll:true});};
      if(result?.reveal)art.reveal(reviewFace(desc),'살펴볼 면');
      inspectDialog.append(node('h2',{text:label+' · 크게 살펴보기'}),art.el);
      if(result&&desc.kind==='oblique'){
        const flat=svg('svg',{viewBox:'0 0 240 125',class:'flat-face',role:'img','aria-label':'비스듬한 면을 정면에서 본 평행사변형. 네 각이 모두 직각은 아니에요.'});
        flat.append(svg('polygon',{points:'28,100 136,100 202,22 94,22',fill:'#ead4aa',stroke:'#916b40','stroke-width':3}),svg('text',{x:120,y:120,'text-anchor':'middle',text:'이 면은 직사각형이 아니에요'}));inspectDialog.append(flat);
      }
      if(result&&step.mode==='mark'&&desc.dims){
        const {x,y,z}=desc.dims,w=x!==y?x:z,h=y,s=85/Math.max(w,h);
        const flat=svg('svg',{viewBox:'0 0 240 125',class:'flat-face',role:'img','aria-label':`${w}cm와 ${h}cm로 길이가 다른 직사각형 면`});
        flat.append(svg('rect',{x:120-w*s/2,y:8,width:w*s,height:h*s,fill:'#ead4aa',stroke:'#916b40','stroke-width':3}),svg('text',{x:120,y:120,'text-anchor':'middle',text:`${w}cm × ${h}cm · 두 길이가 달라요`}));inspectDialog.append(flat);
      }
      inspectDialog.append(node('p',{text:result?.message||'상자를 끌거나 화살표로 돌려 봐요.'}),art.controls);
      const actions=node('div',{class:'inspector-actions'});
      if(result&&selected.has(desc.id))actions.append(button(step.mode==='mark'?'이 상자의 표시 지우기':'이 상자 내려놓고 다시 고르기',()=>{inspectDialog.close();items.get(desc.id).toggle.click();},{primary:true}));
      if(!result)actions.append(button(selected.has(desc.id)?(step.mode==='mark'?'이 상자 표시 지우기':'이 상자 내려놓기'):(step.mode==='mark'?'이 상자 표시하기':'이 상자 고르기'),()=>{items.get(desc.id).toggle.click();inspectDialog.close();},{primary:true}));
      actions.append(button('작업대로 돌아가기',()=>inspectDialog.close()));inspectDialog.append(actions);
      inspectDialog.showModal();
    }
    const loadingDock=node('div',{class:'loading-dock','aria-label':'고른 상자를 올린 배송대'});
    function drawDock(){if(!ctx.postal)return;clear(loadingDock);loadingDock.append(node('strong',{text:station+(selected.size?' · '+selected.size+'개':'')}));if(!selected.size)loadingDock.append(node('small',{text:step.mode==='mark'?'모든 면이 정사각형이면 도장을 붙여요':review?'출발할 상자를 다시 점검해요':turning?'놓인 방향이 달라도 같은 상자일까요?':'고른 상자가 여기에 놓여요'}));for(const id of selected){const o=items.get(id);if(!o)continue;const d=o.desc,art=createSolidView({mesh:meshFor(d),size:70,scale:d.dims?42/Math.max(d.dims.x,d.dims.y,d.dims.z):10,mode:'none'});art.svg.removeAttribute('tabindex');art.el.inert=true;const name=`상자 ${String.fromCharCode(65+step.solids.findIndex(x=>x.id===id))}`;const remove=button('',()=>{const focused=document.activeElement===remove;o.toggle.click();if(focused)o.toggle.focus({preventScroll:true});},{cls:'dock-box',attrs:{'aria-label':name+(step.mode==='mark'?' 표시 지우기':' 배송대에서 내리기')}});remove.replaceChildren(art.el,node('span',{text:name+' ×'}));loadingDock.append(remove);}}
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
        view.reveal(null,null);
        el.classList.remove('needs-more');
        setPressed(toggle, selected.has(desc.id)); drawTags();
        if(ctx.postal){
          const picked=selected.has(desc.id);
          selectionNote.textContent=label+(picked?(step.mode==='mark'?'에 표시했어요':'를 배송대에 놓았어요'):(step.mode==='mark'?'의 표시를 지웠어요':'를 내려놓았어요'))+` · ${selected.size}개 선택`;
          if(!reducedMotion()){
            view.el.animate([{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:160,easing:'ease-out'});
            if(picked)loadingDock.lastElementChild?.animate([{transform:'translateY(-12px) scale(.9)',opacity:.5},{transform:'translateY(0) scale(1)',opacity:1}],{duration:220,easing:'ease-out'});
          }
        }
      }, {cls: 'small', attrs: {'aria-pressed': 'false'}});
      function drawTags() {
        if(ctx.postal)toggle.querySelector('span:last-child').textContent=selected.has(desc.id)?(step.mode==='mark'?'표시 지우기':'배송대에서 내리기'):(step.mode==='mark'?'정육면체 표시':'배송대에 올리기');
        selectionNote.textContent=selected.size?`상자 ${selected.size}개 선택 · 아래에서 확인해요`:'맞는 상자를 모두 골라요';
        drawDock();
        clear(tags);
        item.querySelector('.cube-seal')?.remove();
        if(ctx.postal&&step.mode==='mark'&&selected.has(desc.id))item.append(node('span',{class:'cube-seal',text:'정육면체?'}));
        if (step.mode === 'mark') tags.append(node('span', {class: 'tag', text: '직육면체'}));
        if (selected.has(desc.id)) tags.append(node('span', {class: `tag ${step.mode === 'mark' ? 'cube' : ''}`, text: step.mode === 'mark' ? '정육면체' : '배송대'}));
      }
      drawTags();
      const rot = node('div', {class: 'row', style: {justifyContent: 'center'}}, [
        button('◀', () => view.rotate(-0.4, 0), {cls: 'small', attrs: {'aria-label': `${label} 왼쪽으로 돌리기`}}),
        button('▶', () => view.rotate(0.4, 0), {cls: 'small', attrs: {'aria-label': `${label} 오른쪽으로 돌리기`}}),
        button('▲', () => view.rotate(0, -0.35), {cls: 'small', attrs: {'aria-label': `${label} 위로 돌리기`}})
      ]);
      item.append(node('div', {class: 'name', text: label}), view.el);
      if(ctx.postal)item.append(button('크게 보고 돌리기',()=>inspect(desc,label),{cls:'inspect-box',attrs:{'aria-label':label+' 크게 보기'}}));
      if(!ctx.postal)item.append(rot);
      item.append(tags,toggle);
      items.set(desc.id, {item, view, desc, toggle, drawTags});
      shelf.append(item);
    }
    drawDock();
    const el = node('div', {class:ctx.postal?'sorting-workbench':'',style: {width: '100%'}}, ctx.postal?[loadingDock,shelf]:[shelf]);
    if(ctx.postal){el.dataset.station=step.mode==='mark'?'stamp':review?'review':turning?'turn':'select';el.append(inspectDialog);}
    const scrollCue=ctx.postal&&step.solids.length>3?node('small',{class:'shelf-scroll-cue',text:'↕ 위로 밀어 아래 상자도 살펴봐요'}):null;
    return {el, tools: ctx.postal?[selectionNote,...(scrollCue?[scrollCue]:[])]:[],destroy(){inspectDialog.onclose=null;if(inspectDialog.open)inspectDialog.close();inspection?.destroy();items.forEach(o=>o.view.destroy());}, getAnswer: () => ({selected: [...selected]}),
      restore(a) { selected.clear(); for(const id of a.selected||[]) selected.add(id);items.forEach((o,id)=>{o.item.classList.toggle('picked',selected.has(id));setPressed(o.toggle,selected.has(id));o.drawTags();}); },
      afterCheck(result) { if(ctx.postal && result.ok) items.forEach(o=>{o.item.querySelector('.name').textContent=o.desc.name;const seal=o.item.querySelector('.cube-seal');if(seal){seal.textContent='✓ 정육면체';seal.classList.add('confirmed');}}); },
      markWrong(result) {
        items.forEach(o=>{o.item.classList.remove('wrong');o.view.reveal(null,null);});el.classList.remove('needs-more');selectionNote.textContent=selected.size?`상자 ${selected.size}개 선택 · 아래에서 확인해요`:'맞는 상자를 모두 골라요';
        if(ctx.postal&&result.missing?.length){el.classList.add('needs-more');selectionNote.textContent='고른 상자는 유지돼요 · 다른 상자도 살펴봐요';}
        for (const id of result.wrong || []) items.get(id)?.item.classList.add('wrong');
        if (result.reveal) {
          const it = items.get(result.reveal.solid);
          if (it) {it.view.reveal(reviewFace(it.desc), '이 면');if(ctx.postal)inspect(it.desc,it.item.querySelector('.name').textContent,result);}
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
      if(ctx.postal&&step.mode!=='all'){
        const parts=counter.textContent.match(/^(.*?)(\d+ \/ \d+)$/);
        if(parts)counter.replaceChildren(document.createTextNode(parts[1]),node('span',{style:{whiteSpace:'nowrap'},text:parts[2]}));
      }
    }
    updateCounter();
    const transparent = button('투명 보기', () => { view.setTransparent(!view.state.transparent); setPressed(transparent, view.state.transparent); }, {cls: 'small', attrs: {'aria-pressed': 'false'}});
    const side = node('div', {class: 'panel compact component-progress'}, [node('h3', {text: ctx.postal ? (step.mode==='all'?'지금 찾는 것':'표시한 수') : '진행'}), counter, kinds, node('p', {class: 'note', text: step.mode === 'pairs' ? '면 두 개를 차례로 누르면 같은 번호가 붙어요. 다시 누르면 풀려요.' : ctx.postal&&step.mode==='vertices' ? '동그란 점을 누르거나 보호캡을 끌어 놓아요. 다시 누르면 뗄 수 있어요.' : '같은 곳을 다시 누르면 취소돼요.'})]);
    const el = node('div', {class: 'row', style: {justifyContent: 'center'}}, [view.el]);
    const capTools=[];let cleanCaps=()=>{};
    if(ctx.postal&&step.mode==='vertices'){
      let capMoved=false;
      const cap=button('◩ 보호캡 집기',e=>{if(capMoved&&e.detail!==0)return;cap.querySelector('span:last-child').textContent='◩ 꼭짓점을 톡 눌러요';side.querySelector('.note').textContent='동그란 꼭짓점을 톡 눌러 캡을 붙여요. 다시 누르면 뗄 수 있어요.';view.svg.querySelector('.vertex-hit')?.focus({preventScroll:true});},{cls:'small cap-tray'});
      let pointer=null,ghost;
      const clean=()=>{const id=pointer;pointer=null;cap.classList.remove('dragging');ghost?.remove();ghost=null;if(id!==null&&cap.hasPointerCapture(id))cap.releasePointerCapture(id);};
      cleanCaps=clean;
      cap.style.touchAction='none';
      cap.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||pointer!==null)return;capMoved=false;pointer=e.pointerId;cap.classList.add('dragging');cap.setPointerCapture(e.pointerId);ghost=node('div',{class:'cap-ghost',text:'◩'});document.body.append(ghost);ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';});
      cap.addEventListener('pointermove',e=>{if(ghost&&e.pointerId===pointer){capMoved=true;ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}});
      cap.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;const hit=document.elementFromPoint(e.clientX,e.clientY);if(hit?.classList.contains('vertex-hit')&&view.svg.contains(hit)&&hit.getAttribute('aria-pressed')!=='true')hit.dispatchEvent(new MouseEvent('click',{bubbles:true}));clean();});
      cap.addEventListener('pointercancel',clean);cap.addEventListener('lostpointercapture',clean);capTools.push(cap);
    }
    return {el, side, tools: [...capTools,view.controls, transparent],destroy(){cleanCaps();view.destroy?.();}, getAnswer: () => view.getSelection(), restore(a){view.setSelection(a);updateCounter();}, markWrong: result => view.markWrong(result.wrong || [])};
  },

  // ---- 선택 카드 ----
  choice(step,ctx={}) {
    const selected = new Set();
    const multi = step.answer.length > 1;
    const cards = node('div', {class: `cards ${step.options.length === 3 ? 'three' : ''}`, role: 'group', 'aria-label': multi ? '모두 고르기' : '하나 고르기'});
    const selectionNote=node('span',{class:'chip',role:'status'});
    const updateNote=()=>selectionNote.textContent=selected.size?`${selected.size}개 선택 · 아래에서 확인해요`:(multi?'맞는 카드를 모두 골라요':'카드 하나를 골라요');updateNote();
    const buttons = new Map();
    for (const o of step.options) {
      const b = button('', () => {
        if(!multi&&selected.has(o.id))return;
        if (!multi) { selected.clear(); buttons.forEach(x => { setPressed(x, false); x.classList.remove('wrong'); }); }
        if (selected.has(o.id)) selected.delete(o.id); else selected.add(o.id);
        setPressed(b, selected.has(o.id)); b.classList.remove('wrong');updateNote();
        if(ctx.postal){if(!selected.has(o.id))selectionNote.textContent=selected.size?`선택 취소 · ${selected.size}개 선택 중`:'선택을 취소했어요 · 다시 골라요';if(!reducedMotion())b.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:160,easing:'ease-out'});}
      }, {attrs: {'aria-pressed': 'false'}});
      b.firstChild?.remove();
      if (step.figures === 'views') b.append(o.id === 'oblique' ? sketchFigure(step.dims, {size: 150,fit:ctx.postal}) : orthoFigure(step.dims, o.id, {size: 150}));
      if (step.figures === 'nets' && o.cells) b.append(netFigure(cellsToPieces(o.cells), {size: 150}));
      const line = node('div', {class: 'row'}, [node('span', {class: 'mark', 'aria-hidden': 'true', text: multi ? '✓' : '●'}), node('span', {text: o.text || ''})]);
      b.append(line);
      buttons.set(o.id, b); cards.append(b);
    }
    const wrap = node('div', {style: {display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}});
    if(ctx.postal&&ctx.activityId==='w1-r3'){
      wrap.classList.add('shape-comparison');
      const ref=node('div',{class:'choice-reference','aria-label':'두 상자를 보고 비교해요'});
      for(const [name,dims] of [['직육면체',{x:4,y:3,z:2}],['정육면체',{x:3,y:3,z:3}]]){
        const figure=solidFigure({kind:'cuboid',dims},{size:110});
        ref.append(node('figure',{},[figure.el,node('figcaption',{text:name})]));
      }
      wrap.append(ref);
    }
    if (step.figureCells) wrap.append(node('div', {class: 'panel'}, [node('h3', {text: '이 모양'}), netFigure(cellsToPieces(step.figureCells), {size: 180})]));
    wrap.append(cards);
    if (multi) wrap.append(node('p', {class: 'note', text: '맞는 것을 모두 골라요.'}));
    return {el: wrap, tools: ctx.postal?[selectionNote]:[], getAnswer: () => ({selected: [...selected]}), restore(a){selected.clear();for(const id of a.selected||[])selected.add(id);buttons.forEach((b,id)=>setPressed(b,selected.has(id)));updateNote();}, markWrong(result) { buttons.forEach(b=>b.classList.remove('wrong'));for (const id of result.wrong || []) buttons.get(id)?.classList.add('wrong'); }};
  },

  // ---- 빈칸·고르기 입력 ----
  fill(step,ctx={}) {
    const displayLabel=text=>ctx.postal?text.replace(/^([ㄱㄴㄷ])$/,step.figure?.net?'$1의 길이':'$1').replace('직육면체(4×3×2) 모서리의 길이','길이가 4cm · 3cm · 2cm인 상자\n모서리 길이는?').replace(/^보이지 않는 /,'가려진 ').replace(/^보이는 /,'실제로 눈에 보이는 ').replace(/^(면|모서리|꼭짓점)$/,ctx.activityId==='w2-r2'?'$1 전체':'$1'):text;
    const inputs = new Map();
    const fields = node('div', {class: 'fields'});
    for (const f of step.fields || []) {
      const inp = node('input', {type: 'text', inputmode: 'numeric', pattern: '[0-9]*', id: `f-${f.id}`, 'aria-label': displayLabel(f.label)});
      inp.addEventListener('input', () => inp.parentElement.classList.remove('wrong'));
      const row = node('div', {class: 'field'}, [node('label', {for: `f-${f.id}`, text: displayLabel(f.label)}), inp, node('span', {class: 'unit', text: f.unit || ''})]);
      inputs.set(f.id, {el: inp, row}); fields.append(row);
    }
    for (const s of step.selects || []) {
      const sel = node('select', {id: `s-${s.id}`, 'aria-label': displayLabel(s.label)});
      sel.append(node('option', {value: '', text: '고르기'}));
      for (const o of s.options) sel.append(node('option', {value: o, text: o}));
      sel.addEventListener('change', () => sel.parentElement.classList.remove('wrong'));
      const row = node('div', {class: 'field'}, [node('label', {for: `s-${s.id}`, text: displayLabel(s.label)}), sel]);
      inputs.set(s.id, {el: sel, row}); fields.append(row);
    }
    let fieldIndex=0;
    let updateReference=()=>{};
    const referenceViews=[];
    const rows=[...inputs.values()];
    const fieldPosition=node('span',{class:'field-position',role:'status'});
    const previous=button('이전 빈칸',null,{cls:'small'});
    const next=button('다음 빈칸',null,{cls:'small'});
    pressable(previous,()=>{if(!previous.disabled)showField(fieldIndex-1,true);});
    pressable(next,()=>{if(!next.disabled)showField(fieldIndex===rows.length-1?rows.findIndex(r=>!r.el.value.trim()):fieldIndex+1,true);});
    const fieldNav=node('div',{class:'field-nav'},[previous,fieldPosition,next]);
    function showField(index,focus=false){
      fieldIndex=Math.max(0,Math.min(index,rows.length-1));
      if(ctx.postal&&rows.length>1){rows.forEach((r,i)=>r.row.hidden=i!==fieldIndex);previous.disabled=fieldIndex===0;const missing=rows.findIndex(r=>!r.el.value.trim());next.disabled=!rows[fieldIndex].el.value.trim()||(fieldIndex===rows.length-1&&(missing<0||missing===fieldIndex));next.querySelector('span:last-child').textContent=fieldIndex===rows.length-1&&missing<0?'입력 완료':fieldIndex===rows.length-1&&missing===fieldIndex?(rows[fieldIndex].el.tagName==='SELECT'?'먼저 골라요':'먼저 적어요'):fieldIndex===rows.length-1&&missing>=0?'남은 빈칸':'다음 빈칸';fieldPosition.textContent=`${fieldIndex+1} / ${rows.length}`;}
      if(focus)rows[fieldIndex]?.el.focus();
      updateReference();
    }
    rows.forEach(r=>{r.el.addEventListener('input',()=>showField(fieldIndex));r.el.addEventListener('change',()=>showField(fieldIndex));});
    if(ctx.postal)rows.forEach(r=>r.el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing&&r.el.tagName==='INPUT'){e.preventDefault();if(!e.repeat&&r.el.value.trim()&&!next.disabled)next.click();}}));
    showField(0);
    const wrap = node('div', {class:ctx.postal?'answer-workbench':'',style: {display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}});
    const fig = step.figure || (ctx.postal&&step.fields?.some(f=>f.id==='fv')&&step.fields?.some(f=>f.id==='fh')?{dims:{x:4,y:3,z:2},sketch:true}:null);
    let figView = null;
    if(ctx.postal&&!fig&&['w1-m4','w2-m4'].includes(ctx.activityId)){
      const reference=node('div',{class:'parcel-reference'}),cards=[];
      for(const [name,dims]of [['직육면체',{x:4,y:3,z:2}],['정육면체',{x:3,y:3,z:3}]]){
        const art=createSolidView({postal:true,dims,size:170,scale:29,mode:'none',ariaLabel:name+' · 끌어서 돌려 살펴봐요'});
        referenceViews.push(art);const card=node('div',{class:'reference-box'},[node('strong',{text:name}),art.el]);cards.push({name,card});reference.append(card);
      }
      reference.append(node('small',{class:'reference-cue',text:'상자를 끌어 돌려 보며 비교해요'}));wrap.append(reference);wrap.classList.add('with-parcel-reference');
      updateReference=()=>{const label=rows[fieldIndex]?.row.querySelector('label')?.textContent||'';const target=label.includes('정육면체')?'정육면체':label.includes('직육면체')?'직육면체':null;cards.forEach(({name,card})=>card.classList.toggle('current-reference',!target||target===name));};
      updateReference();
    }
    if (fig?.net) {
      const diagram=netFigure(fig.net.pieces,{size:300,showLengths:true,labelSize:ctx.postal?22:undefined,blanks:fig.blanks.map((b,i)=>({...b,label:['ㄱ','ㄴ','ㄷ'][i]}))});
      wrap.append(node('div',{class:'panel net-reference'},[node('h3',{text:'표시한 변의 길이'}),diagram,blanksFigure(fig)]));
      if(ctx.postal){updateReference=()=>{const id=[...inputs.keys()][fieldIndex];diagram.querySelectorAll('[data-blank-id]').forEach(e=>e.classList.toggle('current-blank',e.dataset.blankId===id));};updateReference();}
    }
    else if (fig?.marks) {
      const edgeLabels = {}, vertexLabels = {}, faceMarks = {};
      for (const m of fig.marks) (m.type === 'edge' ? edgeLabels : m.type === 'vertex' ? vertexLabels : faceMarks)[m.id] = m.label;
      figView = createSolidView({postal:ctx.postal,dims: fig.dims, size: 300, mode: 'none', edgeLabels, vertexLabels, faceMarks});
      wrap.append(node('div', {class: 'panel'}, [figView.el, node('p', {class: 'reference-cue', text: '↔ 끌어서 돌려요'})]));
    } else if (fig?.dims) {
      wrap.append(node('div', {class: 'panel'}, [sketchFigure(fig.dims, {size: 260, showLengths: !!fig.showLengths,fit:ctx.postal}), fig.highlight ? node('p', {class: 'note', text: `${FACE_LABEL[fig.highlight]}을 구해요.`}) : null]));
    }
    wrap.append(node('div', {class: 'panel answer-fields'}, [node('h3', {text: fig?'그림을 보고 답해요':'빈칸을 채워요'}), fields,ctx.postal&&rows.length>1?fieldNav:null]));
    return {el: wrap, tools: figView ? [figView.controls] : [],destroy(){figView?.destroy();referenceViews.forEach(v=>v.destroy());}, focusFirst: () => { if(!ctx.postal)rows[fieldIndex]?.el.focus(); },
      getAnswer: () => ({values: Object.fromEntries([...inputs].map(([k, v]) => [k, v.el.value]))}),
      restore(a){inputs.forEach((v,k)=>{v.el.value=a.values?.[k]??'';});const missing=rows.findIndex(r=>!r.el.value.trim());showField(missing<0?rows.length-1:missing);},
      markWrong(result) { inputs.forEach(v=>v.row.classList.remove('wrong'));for (const id of result.wrong || []) inputs.get(id)?.row.classList.add('wrong');const first=rows.findIndex(r=>r.row.classList.contains('wrong'));if(first>=0)showField(first,true); }};
  },

  // ---- 겨냥도 ----
  sketch(step, ctx = {}) {
    const view = step.view || STANDARD_VIEW;
    let edges;
    if (step.given === 'all-solid') { edges = {}; for (const id of Object.keys(fullEdges(step.dims, view))) edges[id] = 'solid'; }
    else { edges = fullEdges(step.dims, view); for (const id of step.missing || []) edges[id] = 'missing'; Object.assign(edges, typeof step.given === 'object' ? step.given : {}); }
    let undo;
    const sk = createSketchView({dims: step.dims, view, edges, tool: step.tool, showLengths: step.showLengths, width: 480, height: 380,onGuide:ctx.onGuide,onHistory:available=>{if(undo)undo.disabled=!available;}});
    undo = button('되돌리기', () => sk.undo(), {cls: 'small', icon: '↶',attrs:{disabled:true}});
    const reveal = button(ctx.postal?'잠깐 비춰 보기':'투명 보기', () => sk.reveal(true), {cls: 'small'});
    const side = node('div', {class: 'panel', style: {minWidth: '240px'}}, [
      node('h3', {text: step.tool === 'draw' ? '① 선 종류 고르기' : '바꿀 선을 톡!'}),
      step.tool === 'draw' ? sk.typeButtons : null,
      node('p', {class: 'note', text: step.tool === 'draw' ? '시작점 다음에 끝점을 눌러요.' : '실선 ↔ 점선으로 바뀌어요.'}),
      node('div', {class: 'line-key'}, [node('span',{class:'visible-line',text:'보이는 모서리'}),node('span',{class:'hidden-line',text:'가려진 모서리'})])
    ]);
    side.style.width = '280px'; side.style.flexShrink = '0';
    const el = node('div', {class: 'row', style: {gap: '24px', flexWrap: 'nowrap'}}, [sk.el, side]);
    return {el, tools: [undo, reveal], destroy:()=>sk.destroy(), getAnswer: () => ({edges: sk.getEdges()}), restore(a){for(const k of Object.keys(sk.state.edges))sk.state.edges[k]=a.edges?.[k]||'missing';sk.state.extras=Object.fromEntries(Object.entries(a.edges||{}).filter(([k])=>!(k in sk.state.edges)));sk.redraw();}, markWrong: result => sk.markWrong(result.wrong || []),
      afterCheck(result) { if (result.ok && step.reveal === 'transparent') sk.reveal(true); }};
  },

  // ---- 절개안 고르기 ----
  'cut-plan'(step,ctx={}) {
    if(ctx.postal)return postalCut(step);
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
      markWrong(result) { buttons.forEach(b=>b.classList.remove('wrong'));for (const id of result.wrong || []) buttons.get(id)?.classList.add('wrong'); },
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
  'net-predict'(step,ctx={}) {
    const pieces = cellsToPieces(step.candidate.cells);
    let predict = null;
    const bYes = button('될 거예요', () => set(true,true), {attrs: {'aria-pressed': 'false'}});
    const bNo = button('안 될 거예요', () => set(false,true), {attrs: {'aria-pressed': 'false'}});
    function set(v,feedback=false) {
      if(v===predict)return;
      predict = v; setPressed(bYes, v === true); setPressed(bNo, v === false);
      if(!resultPanel.hidden){fold?.stop();clear(resultPanel);resultPanel.hidden=true;predictTitle.textContent='예상을 바꿨어요. 다시 확인해요.';predictNote.hidden=false;}
      if(ctx.postal&&typeof v==='boolean'){predictNote.textContent=`‘${v?'될 거예요':'안 될 거예요'}’ 선택 · 아래에서 확인해요`;if(feedback&&!reducedMotion())(v?bYes:bNo).animate([{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:160,easing:'ease-out'});}
    }
    const predictRow = node('div', {class: 'row'}, [bYes, bNo]);
    const predictNote = node('p', {class: 'note', text: '제출한 뒤에 접어서 확인해요.'});
    const predictTitle = node('h3', {text: '접은 모습을 떠올려 골라요'});
    const resultPanel = node('div', {class: 'panel compact', hidden: true});
    const el = node('div', {class: 'row', style: {gap: '16px', alignItems: 'flex-start', flexWrap: 'nowrap'}}, [
      node('div', {class: 'panel'}, [node('h3', {text: `모양 ${step.index + 1}`}), netFigure(pieces, {size: 220})]),
      node('div', {class: 'panel predict-answer'}, [predictTitle, predictRow, predictNote]),
      resultPanel
    ]);
    let fold = null;
    return {el, tools: [], destroy(){fold?.stop();},getAnswer: () => ({predict}), restore(a){set(a.predict);}, markWrong() {},
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
    const foldSlot = node('div');
    let fold = null, robot = null;
    function clearResult(){fold?.stop();robot?.destroy();fold=null;robot=null;clear(foldSlot);}
    const board = createNetBoard({postal:ctx.postal,pieces: step.base, fixedIds: step.fixedBase ? step.base.map(p => p.id) : [], tray: step.tray, rotatable: step.rotatable, movable: step.movable, replaceable: step.replaceable,
      showLengths: !!step.dims, blank: step.blankLength ? {piece: step.blankLength.piece, side: step.blankLength.side} : null,
      cols: plan.cols, rows: plan.rows, ox: plan.ox, oy: plan.oy, width: free ? 450 : 500, height: free ? 360 : 380,onGuide:ctx.onGuide,onChange:clearResult});
    let blankInput = null;
    const side = node('div', {class: 'panel compact', style: {minWidth: '150px', maxWidth: '190px'}}, [node('h3', {text: step.movable?'조각 옮기기':'① 종이 고르기'}), board.trayEl, board.msgEl]);
    const tools = [board.toolsEl];
    if (step.blankLength) {
      blankInput = node('input', {type: 'text', inputmode: 'numeric', id: 'blank-len', 'aria-label': '빈칸(?)의 길이'});
      blankInput.addEventListener('input', () => blankInput.parentElement.classList.remove('wrong'));
      tools.push(node('div', {class: 'field'}, [node('label', {for: 'blank-len', text: '빈칸 ? 길이'}), blankInput, node('span', {class: 'unit', text: 'cm'})]));
    }
    if (step.part) side.prepend(node('p', {class: 'note', text: ctx.postal?step.part.replace('(2개 복제)',' · 하나 만들면 두 개가 돼요'):`부품: ${step.part}`}));
    const el = node('div', {class: 'row net-layout', style: {gap: '14px', alignItems: 'flex-start', flexWrap: 'nowrap'}}, [board.el, side, foldSlot]);
    return {el, tools, destroy(){board.destroy();clearResult();}, getAnswer: () => ({pieces: board.getPieces(), values: blankInput ? {blank: blankInput.value} : {}, board:board.snapshot()}), restore(a){if(a.board)board.restore(a.board);else if(a.pieces)board.restore({...board.snapshot(),pieces:a.pieces});if(blankInput)blankInput.value=a.values?.blank??'';},
      markWrong(result) { board.markWrong((result.wrong || []).filter(id => id !== 'blank')); blankInput?.parentElement.classList.toggle('wrong',(result.wrong || []).includes('blank')); },
      afterCheck(result) {
        clearResult();
        if (!result.fold && !result.ok) return;
        // 손에 든 여분 조각과 관계없이 채점한 보드의 배치를 보여 준다.
        const pieces = board.getPieces();
        if (pieces.length < 2) return;
        if (result.ok && step.robotFinal) {
          // 마지막 부품: 접기 보기 대신 조립 결과를 같은 결과 영역에 보여 준다(화면 밖으로 나가지 않게 하나만).
          robot = createRobotView({size: 200});
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
    const el = node('div', {class: 'row net-point-workbench', style: {gap: '20px', alignItems: 'flex-start'}}, [
      node('div', {class: 'panel'}, [node('h3', {text: step.ask === 'point' ? '점 ㄱ과 만나는 점 고르기' : '모서리 ㄱㄴ과 만나는 모서리 고르기'}), board.el, node('p', {class: 'note', text: '노란 표시가 기준이에요. 접기 슬라이더로 따라가 볼 수 있어요.'})]),
      node('div', {class: 'panel'}, [node('h3', {text: '접기 보기'}), fold.el])
    ]);
    return {el, tools: [],destroy(){board.destroy();fold.stop();}, getAnswer: () => ({selected: board.getSelected()}), restore(a){board.setSelected(a.selected||[]);}, markWrong: result => board.markWrong(result.wrong || []), afterCheck(result) { if (result.ok) fold.play(); }};
  },

  // ---- 조각 수 준비 ----
  'tray-count'(step,ctx={}) {
    const counts = {};
    const rows = new Map();
    const list = node('div', {class: 'counter'});
    const paperTitle=node('h3',{text:'＋를 눌러 종이를 준비해요 (cm)'});
    let comparedFace='front',lastPaper=null;
    const paperPreview=node('div',{class:'paper-preview',role:'status',hidden:true});
    function previewPaper(t){if(!ctx.postal)return;lastPaper=t;order.hidden=true;paperPreview.hidden=false;[...faceTabs.children].forEach((btn,i)=>setPressed(btn,i===['front','top','right'].indexOf(comparedFace)));clear(paperPreview);const fig=svg('svg',{viewBox:'0 0 240 150',role:'img','aria-label':`${t.w}×${t.h}cm 종이와 상자 면 비교`});const dims=faceDims(step.dims,comparedFace),scale=Math.min(170/Math.max(t.w,dims[0]),105/Math.max(t.h,dims[1]));fig.append(svg('rect',{x:24,y:22,width:dims[0]*scale,height:dims[1]*scale,fill:'#edf0df',stroke:'#647e54','stroke-width':2,'stroke-dasharray':'5 4'}),svg('rect',{x:24,y:22,width:t.w*scale,height:t.h*scale,fill:'#efcf96',opacity:.7,stroke:'#8d6235','stroke-width':2}));paperPreview.append(fig,node('small',{text:`종이 ${t.w}×${t.h}cm · ${counts[sizeKey(t.w,t.h)]}장 / 점선은 ${FACE_LABEL[comparedFace]} ${dims[0]}×${dims[1]}cm`}));}
    function syncCount(key){const row=rows.get(key);row.querySelector('.num').textContent=counts[key];const buttons=row.querySelectorAll('button');buttons[0].disabled=counts[key]<=0;buttons[1].disabled=counts[key]>=4;if(ctx.postal){const stack=row.querySelector('.paper-stack');clear(stack);const rect=row.querySelector('svg>rect');for(let i=counts[key]-1;i>=0;i--){const sheet=rect.cloneNode();sheet.style.opacity='1';sheet.setAttribute('transform',`translate(${i*3},${-i*2})`);stack.append(sheet);}rect.style.opacity=counts[key]?'0':'.3';paperTitle.textContent=Object.values(counts).some(Boolean)?`${Object.values(counts).reduce((a,b)=>a+b,0)}장 준비했어요 · ＋ 추가 / − 빼기`:'＋를 눌러 종이를 준비해요 (cm)';}}
    function changePaper(t,delta){const key=sizeKey(t.w,t.h),row=rows.get(key);counts[key]=Math.max(0,Math.min(4,counts[key]+delta));syncCount(key);row.classList.remove('wrong');lastPaper=t;if(!paperPreview.hidden)previewPaper(t);if(ctx.postal&&!reducedMotion())row.querySelector('svg').animate([{transform:`translateY(${delta>0?-5:3}px)`},{transform:'translateY(0)'}],{duration:160,easing:'ease-out'});}
    for (const t of step.tray) {
      const key = sizeKey(t.w, t.h);
      counts[key] = 0;
      const num = node('span', {class: 'num', role: 'status', 'aria-label': `${t.w}×${t.h} 장수`, text: '0'});
      const pic = svg('svg', {viewBox: ctx.postal?'0 -4 80 60':'0 0 70 54', 'aria-hidden': 'true'});
      const s = Math.min(60 / t.w, 44 / t.h, 11);
      pic.append(svg('rect', {x: 35 - t.w * s / 2, y: 27 - t.h * s / 2, width: t.w * s, height: t.h * s, class: 'piece'}));
      if(ctx.postal)pic.append(svg('g',{class:'paper-stack'}));
      pic.append(svg('text', {x: 35, y: 31, class: 'label', style: 'font-size:13px', 'text-anchor': 'middle', text: `${t.w}×${t.h}`}));
      const item = node('div', {class: 'item'}, [pic, node('div', {class: 'count-row'}, [
        button('−', () => changePaper(t,-1), {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 한 장 빼기`}}),
        num,
        button('+', () => changePaper(t,1), {cls: 'small', attrs: {'aria-label': `${t.w}×${t.h} 한 장 더하기`}})
      ])]);
      rows.set(key, item);syncCount(key); list.append(item);
    }
    const faceTabs=node('div',{class:'paper-face-tabs'});for(const face of ['front','top','right']){const b=button(FACE_LABEL[face],()=>{comparedFace=face;for(const btn of faceTabs.children)setPressed(btn,btn===b);previewPaper(lastPaper||step.tray[0]);},{attrs:{'aria-pressed':'false'}});faceTabs.append(b);}
    const boxTab=button('상자 보기',()=>{order.hidden=false;paperPreview.hidden=true;for(const btn of faceTabs.children)setPressed(btn,btn===boxTab);},{attrs:{'aria-pressed':'true'}});faceTabs.append(boxTab);
    const order=ctx.postal?createSketchView({dims:step.dims,view:STANDARD_VIEW,width:300,height:230,scale:34,tool:'none',showLengths:true,edges:fullEdges(step.dims)}).el:sketchFigure(step.dims,{size:220,showLengths:true});
    const el = node('div', {class: ctx.postal?'paper-workbench':'row', style: {gap: '24px', alignItems: 'flex-start'}}, [
      node('div', {class: 'panel order-box'}, [node('h3', {text: '주문 상자'}), order,...(ctx.postal?[paperPreview]:[]), node('p', {class: 'note', text: `세 변의 길이: ${step.dims.x}cm · ${step.dims.y}cm · ${step.dims.z}cm`}),...(ctx.postal?[faceTabs]:[])]),
      node('div', {class: 'panel'}, [paperTitle, list])
    ]);
    return {el, tools: [], getAnswer: () => ({counts: {...counts}}), restore(a){for(const k of Object.keys(counts)){counts[k]=a.counts?.[k]||0;syncCount(k);}if(lastPaper&&!paperPreview.hidden)previewPaper(lastPaper);}, markWrong(result) { rows.forEach(row=>row.classList.remove('wrong'));for (const id of result.wrong || []) rows.get(id)?.classList.add('wrong'); }};
  },

  // ---- 카드 연결 ----
  link(step,ctx={}) {
    const links = {};
    const cells = new Map();
    const table = node('div', {class: 'link-table'});
    table.append(node('div', {class: 'head', text: '입체'}), node('div', {class: 'head', text: '겨냥도'}), node('div', {class: 'head', text: '전개도'}));
    const sketchLetters = ['A', 'B', 'C'], netLetters = ['ㄱ', 'ㄴ', 'ㄷ'];
    for (const s of step.solids) {
      links[s.id] = {sketch: '', net: ''};
      const fig = solidFigure({kind: 'cuboid', dims: s.dims}, {size: 120});
      const solidCell = node('div', {class: 'cell'}, [fig.el, node('div', {class: 'mini', text: ctx.postal?s.name.replace(/(\d+)×(\d+)×(\d+)/g,'$1cm · $2cm · $3cm'):s.name})]);
      const mkSelect = (kind, letters, items) => {
        const sel = node('select', {'aria-label': `${s.name}의 ${kind === 'sketch' ? '겨냥도' : '전개도'}`});
        sel.append(node('option', {value: '', text: '고르기'}));
        items.forEach((it, i) => sel.append(node('option', {value: it.id, text: `${kind==='sketch'?'겨냥도':'전개도'} ${letters[i]}`})));
        sel.addEventListener('change', () => { links[s.id][kind] = sel.value;sel.setAttribute('aria-invalid','false'); sel.parentElement.classList.remove('wrong');sel.parentElement.classList.toggle('answered',Boolean(sel.value)); });
        const cell = node('div', {class: 'cell'}, [sel]);
        cells.set(`${s.id}:${kind}`, cell);
        return cell;
      };
      table.append(solidCell, mkSelect('sketch', sketchLetters, step.sketches), mkSelect('net', netLetters, step.nets));
    }
    const legend = node('div', {class: 'row', style: {gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}});
    step.sketches.forEach((k, i) => legend.append(node('div', {class: 'cell', style: {background: '#fff', border: '2px solid #e2d5ae', borderRadius: '12px', padding: '4px', textAlign: 'center'}}, [node('div', {class: 'mini', text: `겨냥도 ${sketchLetters[i]}`}), sketchFigure(k.dims, {size: 150, showLengths: true,fit:ctx.postal})])));
    step.nets.forEach((n, i) => legend.append(node('div', {class: 'cell', style: {background: '#fff', border: '2px solid #e2d5ae', borderRadius: '12px', padding: '4px', textAlign: 'center'}}, [node('div', {class: 'mini', text: `${netLetters[i]} · 가로×세로(cm)`}), netFigure(n.net.pieces, {size: 150, showLengths: true})])));
    legend.style.display = 'grid'; legend.style.gridTemplateColumns = 'repeat(3, 1fr)';
    const el = node('div', {class: 'card-match', style: {display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center', width: '100%'}}, [legend, table]);
    let matchIndex=0;
    const matches=step.solids.flatMap(s=>['sketch','net'].map(kind=>({s,kind})));
    if(ctx.postal)[...legend.children].forEach((cell,i)=>{
      const kind=i<step.sketches.length?'sketch':'net',index=kind==='sketch'?i:i-step.sketches.length,item=(kind==='sketch'?step.sketches:step.nets)[index];
      const pick=button('',()=>{const current=matches[matchIndex];if(current.kind!==kind)return;const select=cells.get(current.s.id+':'+kind).querySelector('select');if(select.value===item.id)return;select.value=item.id;select.dispatchEvent(new Event('change',{bubbles:true}));if(!reducedMotion())pick.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:170,easing:'ease-out'});},{attrs:{'aria-label':`${kind==='sketch'?'겨냥도':'전개도'} ${(kind==='sketch'?sketchLetters:netLetters)[index]} 선택`}});
      pick.className='cell match-choice';pick.style.cssText=cell.style.cssText;pick.dataset.kind=kind;pick.dataset.option=item.id;pick.replaceChildren(...cell.childNodes);cell.replaceWith(pick);
    });
    const matchLabel=node('strong',{class:'match-label'});
    const back=button('이전 그림',()=>showMatch(matchIndex-1,true),{cls:'small'});
    const forward=button('다음 그림',()=>showMatch(matchIndex===matches.length-1?matches.findIndex(({s,kind})=>!links[s.id][kind]):matchIndex+1,true),{cls:'small'});
    const position=node('span',{class:'field-position',role:'status'});
    const nav=node('div',{class:'field-nav'},[back,position,forward]);
    if(ctx.postal){el.classList.add('one-match');el.prepend(matchLabel);el.append(nav);}
    function showMatch(index,focus=false){
      if(!ctx.postal)return;
      matchIndex=Math.max(0,Math.min(index,matches.length-1));
      const {s,kind}=matches[matchIndex],row=step.solids.indexOf(s);
      matchLabel.textContent=s.name.replace(/(\d+)×(\d+)×(\d+)/g,'$1cm · $2cm · $3cm')+' · 맞는 '+(kind==='sketch'?'겨냥도':'전개도')+' 그림을 눌러요';
      [...table.children].forEach((cell,i)=>cell.hidden=!(i===3+row*3||i===3+row*3+(kind==='sketch'?1:2)));
      [...legend.children].forEach((cell,i)=>cell.hidden=kind==='sketch'?i>=step.sketches.length:i<step.sketches.length);
      [...legend.children].forEach(cell=>{const picked=cell.dataset.kind===kind&&cell.dataset.option===links[s.id][kind];setPressed(cell,picked);cell.classList.toggle('wrong',picked&&cells.get(s.id+':'+kind).classList.contains('wrong'));});
      position.textContent=`${matchIndex+1} / ${matches.length}`;back.disabled=matchIndex===0;const missing=matches.findIndex(({s,kind})=>!links[s.id][kind]);forward.disabled=matchIndex===matches.length-1&&(missing<0||missing===matchIndex);forward.querySelector('span:last-child').textContent=matchIndex===matches.length-1&&missing<0?'선택 완료':matchIndex===matches.length-1&&missing===matchIndex?'이 그림을 골라요':matchIndex===matches.length-1&&missing>=0?'남은 그림으로':'다음 그림';
      if(focus)cells.get(s.id+':'+kind).querySelector('select').focus();
    }
    cells.forEach(cell=>cell.querySelector('select').addEventListener('change',()=>showMatch(matchIndex)));
    showMatch(0);
    return {el, tools: [], focusFirst(){if(!ctx.postal)el.querySelector('select')?.focus();}, getAnswer: () => ({links: JSON.parse(JSON.stringify(links))}), restore(a){for(const [id,value]of Object.entries(a.links||{})){if(!links[id])continue;links[id]={...value};for(const k of ['sketch','net']){const cell=cells.get(id+':'+k);cell.querySelector('select').value=value[k]||'';cell.classList.toggle('answered',Boolean(value[k]));}}const missing=matches.findIndex(({s,kind})=>!links[s.id][kind]);showMatch(missing<0?matches.length-1:missing);}, markWrong(result) { cells.forEach((cell,id)=>{const wrong=(result.wrong||[]).includes(id);cell.classList.toggle('wrong',wrong);cell.querySelector('select').setAttribute('aria-invalid',String(wrong));});const first=matches.findIndex(({s,kind})=>cells.get(s.id+':'+kind).classList.contains('wrong'));showMatch(first>=0?first:matchIndex,first>=0); }};
  }
};

function blanksFigure(fig) {
  // 빈칸 위치 설명: 전개도 그림 위 라벨은 netFigure가 숫자로 그리므로, 빈칸은 글로 안내한다.
  const names = {front: '앞면', back: '뒷면', top: '윗면', bottom: '아랫면', left: '왼쪽 면', right: '오른쪽 면'};
  const labels = ['ㄱ', 'ㄴ', 'ㄷ'];
  return node('p', {class: 'note', text: fig.blanks.map((b, i) => `${labels[i]}: ${names[b.piece]}의 ${b.side === 'w' ? '가로' : '세로'}`).join(' · ')});
}



