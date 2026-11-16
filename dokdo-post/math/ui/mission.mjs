// 미션 실행기(업그레이드): 위 목표 한 줄, 가운데 큰 조작 도형, 오른쪽 작은 진행 상태, 아래 모아의 짧은 말과 명확한 제출.
// 상황 한 문장 → 직접 조작 → 명시적 제출 → 피드백(오답 시 조작 보존) → 학습 정리 → 명시적 다음 버튼.
import {STORIES,portrait,itemImage,coachFor} from '../../story.mjs?v=refine-20261116-r5';
import {createSolidView} from './solid-view.mjs?v=refine-20261116-r5';
import {netFigure} from './net-board.mjs?v=refine-20261116-r5';
import {actionFor} from './postal-instructions.mjs?v=refine-20261116-r5';
import {renderStep} from './steps.mjs?v=refine-20261116-r5';
import {newEventId, answerSignature} from '../lib/progress.mjs';
import {sfx} from './audio.mjs';
import {createRobotView} from './robot-view.mjs';
import {node, button, clear, announce, reducedMotion} from './dom.mjs?v=refine-20261116-r5';
import {frameRect} from './assets.mjs';

export function runMission({activity, workshop, progress, scored = true, container, hud, assets, onDone, onSave}) {
  clear(container);
  const ws = node('div', {class: 'workspace'});
  if (assets?.images?.workshop) { ws.classList.add('has-art'); ws.style.backgroundImage = 'url(assets/workshop.webp)'; }
  const theme = activity.id.startsWith('w2-') ? 'inspection' : /^w[56]-/.test(activity.id) ? 'packing' : null;
  if (theme) {
    ws.classList.add('crafted', theme);
    if (assets?.images?.[theme]) { ws.classList.add('has-art'); ws.style.backgroundImage = `url(assets/${theme}.webp)`; }
  }
  const mat = node('div', {class: 'mat', 'aria-hidden': 'true'});
  const banner = node('div', {class: 'banner', role: 'heading', 'aria-level': '2'});
  const stage = node('div', {class: 'stage wide'});
  const side = node('div', {class: 'progress-side'});
  const tools = node('div', {class: 'tools'});
  const bubble = node('div', {class: 'bubble'}, [node('small', {text: '모아'}), node('strong', {text: ''})]);
  if (theme && assets?.images?.moa) {
    const portrait = node('canvas', {class: 'moa-portrait', width: 100, height: 100, 'aria-hidden': 'true'});
    const sp = assets.manifest.sprites.moa, f = frameRect(sp, 'down', 0);
    portrait.getContext('2d').drawImage(assets.images.moa, f.sx, f.sy, f.sw, f.sh, 12, 0, 76, 100);
    bubble.prepend(portrait); bubble.classList.add('with-moa');
  }
  const primarySlot = node('div', {class: 'primary-slot'});
  ws.append(mat, banner, stage, side, tools, bubble, primarySlot);
  container.append(ws);
  const fitInstruction=()=>ws.style.setProperty('--instruction-bottom',(banner.offsetTop+banner.offsetHeight+16)+'px');
  const instructionSize=new ResizeObserver(fitInstruction);instructionSize.observe(banner);
  window.addEventListener('resize',fitInstruction);
  if(activity.postal){ws.classList.add('postal');bubble.prepend(node('img',{class:'resident-portrait',src:'../'+portrait(activity.postalResident),alt:''}));bubble.querySelector('small').textContent=workshop?.name||'마을 친구들';ws.append(node('img',{class:'parcel-item',src:itemImage(activity.postalResident),alt:activity.parcelItem}));}

  const steps = activity.steps;
  const activityKind=progress.activities.find(a=>a.id===activity.id)?.kind;
  const draftKey='draft:'+activity.id;const draft=progress.getExtra(draftKey)||{};
  const stepAnswers = Array.isArray(draft.answers)?draft.answers:[];
  let guideTimer,focusTimer;
  let index = Number.isInteger(draft.index)&&draft.index>=0?Math.min(draft.index,steps.length-1):0, view = null, solvedStep = false,restoring=true;
  function snapshot(){if(restoring||solvedStep||!view)return;progress.setExtra(draftKey,{index,answers:stepAnswers,answer:view.getAnswer()});onSave?.();}
  const capture=()=>queueMicrotask(()=>{if(!solvedStep)snapshot();});ws.addEventListener('click',capture);ws.addEventListener('input',capture);ws.addEventListener('change',capture);ws.addEventListener('pointerup',capture);ws.addEventListener('keyup',capture);
  window.addEventListener('pagehide',snapshot);
  hud.setLocation(workshop ? workshop.name : activity.name || '배송장');
  hud.setGoal(activity.title.replace(/^복습 \d · /, '복습 · '));

  function speak(text, tone = '') {
    bubble.classList.toggle('good', tone === 'good'); bubble.classList.toggle('alert', tone === 'alert');
    bubble.querySelector('strong').textContent = text;
    announce(text);
  }
  function submitLabel(step) {
    if (step.submitLabel) return step.submitLabel;
    if (step.kind.startsWith('net')) return step.kind === 'net-points' ? (activity.postal?'접히는 자리 확인':'짝 확인') : step.kind === 'net-predict' ? '예상한 상자 확인' : '접어서 확인';
    if (step.kind === 'sketch') return '설계도 확인';
    if (step.kind === 'solid') return activity.postal ? '포장 확인' : '검사 확인';
    if (step.kind === 'sort') return activity.postal ? '고른 상자 확인' : '분류 확인';
    return activity.postal ? ({fill:'기록 확인',choice:'선택 확인',link:'연결 확인',peel:'모양 확인','tray-count':'종이 장수 확인','cut-plan':'자르는 선 확인'}[step.kind] || '확인') : '확인';
  }
  function renderCurrent() {
    clearTimeout(guideTimer);clearTimeout(focusTimer);
    const step = steps[index];
    solvedStep = false;
    ws.classList.remove('step-checked','needs-review');
    ws.dataset.task = step.kind;
    clear(stage); clear(tools); clear(primarySlot); clear(side);
    banner.textContent = step.instruction;
    let lastGuide=step.mode;
    const liveGuide=()=>['ready','place','check','second','pair-second'].includes(lastGuide)||String(lastGuide).endsWith('-next');
    const guide=kind=>{
      lastGuide=kind;
      if(!activity.postal)return;
      const ready=['ready','check'].includes(kind);
      ws.classList.toggle('ready-to-check',ready);
      if(liveGuide())speak(activity.situation);
      if(step.kind==='peel'&&kind==='shape')speak('펼친 면을 보고 알맞은 모양을 모두 골라요. 두 가지가 맞을 수도 있어요.');
      const condition=step.mode==='all'?'면 → 모서리 → 꼭짓점을 모두 표시해요. 종류 버튼으로 바꿔요.':step.instruction.replace('정사각형 5/6.','정사각형 한 장을 더 붙이는 작업이에요.');
      banner.replaceChildren(node('strong',{text:actionFor(step,kind)}));
      if(ready){
        banner.append(node('small',{text:'아직 정답 확인 전이에요. 고치고 싶으면 표시나 종이를 다시 눌러요.'}));
        banner.append(node('details',{class:'review-condition'},[node('summary',{text:'작업 조건 다시 보기'}),node('p',{text:condition})]));
      }else banner.append(node('small',{text:condition}));
    };guide(step.mode);
    view = renderStep(step, {stepAnswers,postal:activity.postal,onGuide:guide,draft: index===(draft.index||0)?draft.answer:null});
    ws.querySelector('.draft-compare')?.remove();if(index>0&&step.kind==='net-build'&&!step.base.length&&stepAnswers[0]?.pieces){const card=node('div',{class:'draft-compare'},[node('b',{text:'첫 번째 완성안'}),netFigure(stepAnswers[0].pieces,{size:110})]);ws.append(card);}
    stage.append(view.el);
    if (view.side) side.append(view.side);
    if(activity.postal&&['solid','net-build'].includes(step.kind)){
      const gift=node('figure',{class:'desk-gift'},[node('img',{src:itemImage(activity.postalResident),alt:''}),node('figcaption',{text:activity.parcelItem})]);
      (step.kind==='solid'?side:stage.querySelector('.net-layout .panel.compact'))?.append(gift);
    }
    for (const t of view.tools || []) tools.append(t);
    const hintLabel=()=>activity.postal?(scored&&!progress.hinted(activity.id)?'수학 힌트 −3':'힌트 다시 보기'):'도움';
    const hintBtn = button(hintLabel(), () => {
      const r = scored ? progress.hint(activity.id, newEventId()) : {accepted: true, charged: false};
      if (!r.accepted) return;
      speak(step.hint || '천천히 다시 살펴봐요.', 'good');
      hintBtn.querySelector('span:last-child').textContent = hintLabel();
      if(activity.postal)hintBtn.title='이 활동의 힌트는 다시 봐도 추가로 점수가 줄지 않아요.';
      hud.update(); onSave?.();
    }, {cls: 'small', icon: '?'});
    if(activity.postal){
      hintBtn.title=scored&&!progress.hinted(activity.id)?'수학 힌트 · 이 활동에서 처음 사용하면 3점이 줄어요. 조작 안내는 점수가 줄지 않아요.':'이 활동의 힌트는 다시 봐도 추가로 점수가 줄지 않아요.';
      const coach=coachFor(step),explain=()=>{ws.classList.remove('needs-review');speak(coach.moves.join(' ')+' 조작 안내는 점수가 줄지 않아요.');};
      tools.append(node('div',{class:'help-tools',role:'group','aria-label':'도움말'},[button('무료 조작 안내',explain,{cls:'small'}),hintBtn]));
      if(activity.postalGuide)guideTimer=setTimeout(explain,60);
    }else tools.append(hintBtn);
    hud.setSub(steps.length > 1 ? [`단계 ${index + 1} / ${steps.length}`] : []);
    const submit = button(submitLabel(step), onSubmit, {primary: true, icon: '✓'});
    primarySlot.append(submit);
    speak(activity.postal ? activity.situation : (index === 0 && activity.situation ? activity.situation + ' ' : '') + (step.moa || '먼저 위의 행동을 해 보고, 확인 버튼을 눌러요.'));
    focusTimer=setTimeout(() => (view.focusFirst ? view.focusFirst() : stage.querySelector('button, [tabindex="0"], input, select')?.focus()), 50);
  }
  function sparkle(target) {
    if (reducedMotion() || !target) return;
    const r = target.getBoundingClientRect(), base = ws.getBoundingClientRect();
    const scale = base.width / 1024 || 1;
    for (let i = 0; i < 10; i++) {
      const s = node('span', {class: 'sparkle'});
      const a = (i / 10) * Math.PI * 2;
      s.style.left = `${(r.left - base.left) / scale + r.width / scale / 2}px`;
      s.style.top = `${(r.top - base.top) / scale + r.height / scale / 2}px`;
      s.style.setProperty('--dx', `${Math.cos(a) * 70}px`); s.style.setProperty('--dy', `${Math.sin(a) * 50 - 20}px`);
      ws.append(s); setTimeout(() => s.remove(), 900);
    }
  }
  function onSubmit() {
    if (solvedStep) return;
    const step = steps[index];
    const answer = view.getAnswer();
    const result = step.check(answer, {stepAnswers});
    view.afterCheck?.(result);
    if (result.ok) {
      clearTimeout(guideTimer);clearTimeout(focusTimer);
      solvedStep = true;ws.classList.remove('needs-review');
      if(activity.postal){ws.classList.add('step-checked');banner.replaceChildren(node('strong',{text:index<steps.length-1?'점검했어요! 다음 작업을 해요':'이 포장 작업을 마쳤어요'}),node('small',{text:index<steps.length-1?'‘다음 단계’를 눌러 이어서 준비해요.':'포장 기록을 확인하고 다음으로 이어가요.'}));}
      stepAnswers[index]=answer;progress.setExtra(draftKey,{index:Math.min(index+1,steps.length-1),answers:stepAnswers});onSave?.();
      sfx.success(); sparkle(stage.querySelector('svg') || stage);
      speak(result.message || (index < steps.length - 1 ? '좋아요! 다음 단계로 가요.' : '좋아요! 이 작업을 마쳤어요.'), 'good');
      clear(primarySlot);
      if (index < steps.length - 1) primarySlot.append(button('다음 단계', () => { index++; draft.answer=null; renderCurrent();snapshot(); }, {primary: true, icon: '→'}));
      else {
        if (scored) progress.success(activity.id, newEventId());
        hud.update(); onSave?.();
        if(activity.postal){showSummary();return;}primarySlot.append(button('학습 정리 보기', showSummary, {primary: true, icon: '→'}));
      }
      primarySlot.firstChild.focus();
      return;
    }
    const penalty = scored ? progress.wrong(activity.id, newEventId(), answerSignature({step: index, answer})) : null;
    sfx.wrong();
    hud.update(); onSave?.();
    view.markWrong(result);if(activity.postal)ws.classList.add('needs-review');
    speak(result.message + (activity.postal?' 고른 답은 그대로 있어요. 바꾼 뒤 다시 확인해요.':'') + (penalty?.accepted ? penalty.repeated ? ' (같은 답이라 추가 감점 없음)' : ' (−10)' : ''), 'alert');
  }
  function showSummary() {
    ws.classList.add('has-parcel-record');
    // Completed work stays visible but cannot receive taps behind its record.
    for(const part of [stage,side,tools,primarySlot])part.inert=true;
    const box = node('div', {class: 'summary-box', role: 'dialog', 'aria-label': '학습 정리'});
    const wi = progress.activities.find(a => a.id === activity.id)?.workshop;
    const total=progress.activities.filter(a=>a.workshop===wi),done=total.filter(a=>progress.isComplete(a.id)).length;
    const parcel=activity.postal?node('div',{class:'parcel-record'},[node('div',{class:'parcel-icon'},[node('img',{src:itemImage(activity.postalResident),alt:'',class:'packed-item'})]),node('strong',{text:activity.parcelItem||'마음을 담은 소포'}),node('div',{class:'parcel-dots','aria-label':`전체 ${total.length}개 중 ${done}개 포장 완료`,text:total.map((_,i)=>i<done?'●':'○').join(' ')}),node('small',{text:`포장 기록 ${done}/${total.length} · ${done===total.length?'봉인 준비 완료':'이만큼 준비했어요'}`})]):null;
    const stamped = workshop && progress.workshopDone(wi);
    if (stamped) sfx.stamp();
    let robot = null;
    if (activity.id === 'w6-m4') { robot = createRobotView({size: 220}); }
    box.append(...[
      stamped ? node('div', {class: 'stamp', text: '완료'}) : node('div', {class: 'stamp gold', text: '✓'}),
      node('h2', {text: stamped ? `${activity.postal?activity.parcelItem:workshop.name} · 포장 완료!` : activity.postal ? '포장 기록에 하나 더!' : activity.title}),
      robot ? node('div', {class: 'row', style: {justifyContent: 'center'}}, [robot.el, robot.controls]) : null,
      parcel,
      node('p', {text: activity.summary}),
      activity.postal ? node('p',{class:'note',text:stamped?'상자 점검을 마쳤어요. 소포에 송장을 붙이고 배송해요.':activityKind==='review'?'새 상자에도 배운 방법을 써 봤어요. 출발 점검을 이어가요.':'배운 내용을 포장 기록에 남겼어요. 다음 작업도 직접 시작해요.'}):null,
      stamped&&!activity.postal ? node('p', {class: 'note', text: `${workshop.name}의 미션 4개와 복습 3문항을 모두 마쳤어요.`}) : null,
      node('div', {class: 'row', style: {justifyContent: 'center'}}, [button(nextLabel(), () => { box.remove(); onDone(); }, {primary: true, icon: '→'})])
    ].filter(Boolean));
    if(activity.postal&&done===total.length){const parcelView=createSolidView({dims:{x:4,y:3,z:3},size:190,scale:31,postal:true,mode:'none'});const turn=node('div',{class:'parcel-turntable'},[parcelView.el,parcelView.controls,node('small',{text:'쓸어서 소포를 돌려 볼 수 있어요 · 추가 문제는 없어요'}),node('div',{class:'parcel-address'},[node('span',{text:'받는 이'}),node('strong',{text:STORIES[activity.postalResident].to}),node('small',{text:activity.parcelItem})])]);box.insertBefore(turn,box.children[2]);box.querySelector('p.note').textContent=STORIES[activity.postalResident].finish;}
    ws.append(box);
    if (robot && !reducedMotion()) robot.spin();
    box.querySelector('button.primary').focus({preventScroll:true});
  }
  function nextLabel() {
    const next = progress.current();
    if (!scored) return '돌아가기';
    if (!next) return activity.postal ? '소포 들고 나가기' : '배송 결과 보기';
    const wi = progress.activities.find(a => a.id === activity.id)?.workshop;
    if(next.workshop===wi&&next.kind==='review'){const reviews=progress.activities.filter(a=>a.workshop===wi&&a.kind==='review');return `${activityKind==='review'?'출발 점검 이어하기':'출발 점검 시작'} (${reviews.findIndex(a=>a.id===next.id)+1}/${reviews.length})`;}
    if(next.workshop===wi)return '다음 포장 작업';
    return activity.postal ? '소포 들고 나가기' : '마을로 돌아가기';
  }
  renderCurrent();restoring=false;
  return {destroy() { clearTimeout(guideTimer);clearTimeout(focusTimer);instructionSize.disconnect();window.removeEventListener('resize',fitInstruction);if(!solvedStep)snapshot();window.removeEventListener('pagehide',snapshot);clear(container); },get view(){return view;}};
}

