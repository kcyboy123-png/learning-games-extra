import {parcelCustomizer,parcelDimensions,packingMilestone} from '../../parcel-life.mjs?v=gifts-math-final-20261119';
// 미션 실행기(업그레이드): 위 목표 한 줄, 가운데 큰 조작 도형, 오른쪽 작은 진행 상태, 아래 모아의 짧은 말과 명확한 제출.
// 상황 한 문장 → 직접 조작 → 명시적 제출 → 피드백(오답 시 조작 보존) → 학습 정리 → 명시적 다음 버튼.
import {STORIES,portrait,itemImage,coachFor} from '../../story.mjs?v=gifts-math-final-20261119';
import {createSolidView} from './solid-view.mjs?v=gifts-math-final-20261119';
import {netFigure} from './net-board.mjs?v=net-touch-20261123';
import {actionFor,questionFor,moveFor,hasResponse} from './postal-instructions.mjs?v=three-more-20261120';
import {renderStep} from './steps.mjs?v=net-touch-20261123';
import {newEventId, answerSignature} from '../lib/progress.mjs';
import {sfx} from './audio.mjs?v=audio-journey-20261117';
import {createRobotView} from './robot-view.mjs?v=ui-journey-20261118';
import {node, button, clear, announce, reducedMotion} from './dom.mjs?v=resident-polish-20261117';
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
  let guideTimer,focusTimer,captureTimer,explainCurrent;
  let index = Number.isInteger(draft.index)&&draft.index>=0?Math.min(draft.index,steps.length-1):0, view = null, solvedStep = false,restoring=true;
  function snapshot(){if(restoring||solvedStep||!view)return;progress.setExtra(draftKey,{index,answers:stepAnswers,answer:view.getAnswer()});onSave?.();}
  function syncResponse(){
    if(!activity.postal||!view||solvedStep)return;
    const step=steps[index],answer=view.getAnswer(),ready=hasResponse(step,answer);
    const submit=primarySlot.querySelector('button');if(!submit)return;
    if(view.primaryAction){const a=view.primaryAction();submit.disabled=a.disabled;submit.querySelector('span:last-child').textContent=a.label;submit.querySelector('.btn-icon').hidden=a.disabled;return;}
    const currentInput=ws.querySelector('.answer-fields .field:not([hidden]) input,.answer-fields .field:not([hidden]) select,.link-table > :not([hidden]) select');
    const nextButton=ws.querySelector('.field-nav button:last-child'),nextInput=nextButton?.textContent.trim();
    const navigate=!ready&&['fill','link'].includes(step.kind)&&Boolean(currentInput?.value.trim())&&nextButton&&!nextButton.disabled;
    const pending=step.kind==='net-build'?(answer.board?.held?'종이를 놓아요':(answer.pieces?.length||0)<6?`종이 ${6-(answer.pieces?.length||0)}장을 더 놓아요`:step.blankLength&&!String(answer.values?.blank??'').trim()?'길이를 적어요':'종이를 붙여요'):({fill:currentInput?.value.trim()?`${nextInput||'다음 빈칸'} 버튼을 눌러요`:currentInput?.tagName==='SELECT'?'답을 골라요':'수를 적어요',link:currentInput?.value?`${nextInput||'다음 그림'} 버튼을 눌러요`:'그림을 골라요',solid:'상자에 표시해요',sketch:'그림을 완성해요','tray-count':'종이를 준비해요'}[step.kind]||'먼저 답을 골라요');
    submit.querySelector('.btn-icon').hidden=!ready&&!navigate;
    submit.querySelector('.btn-icon').textContent=navigate?'→':'✓';
    submit.disabled=!ready&&!navigate;submit.title=ready?'내 답을 확인해요':pending;
    submit.querySelector('span:last-child').textContent=ready?submitLabel(step):navigate?nextInput:pending;
  }
  // A selectable SVG node can be replaced by its handler; read state after that event finishes.
  const capture=()=>{clearTimeout(captureTimer);captureTimer=setTimeout(()=>{if(!solvedStep){syncResponse();snapshot();}},0);};ws.addEventListener('click',capture);ws.addEventListener('input',capture);ws.addEventListener('change',capture);ws.addEventListener('pointerup',capture);ws.addEventListener('keydown',capture,true);ws.addEventListener('keyup',capture);
  window.addEventListener('pagehide',snapshot);
  hud.setLocation(workshop ? workshop.name : activity.name || '배송장');
  hud.setGoal(activity.title.replace(/^복습 \d · /, '복습 · '));

  function speak(text, tone = '') {
    ws.classList.toggle('show-feedback',Boolean(tone));
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
    return activity.postal ? ({fill:'기록 확인',choice:'선택 확인',link:'연결 확인',peel:'내 답 확인','tray-count':'종이 장수 확인','cut-plan':'자르는 선 확인'}[step.kind] || '확인') : '확인';
  }
  function renderCurrent() {
    view?.destroy?.();
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
      if(String(kind).startsWith('repair-')){banner.replaceChildren(node('strong',{text:kind==='repair-edit'?(step.replaceable?'맞지 않는 종이를 바꿔요':'종이를 옮겨 전개도를 고쳐요'):kind==='repair-preview'?'접힌 모습을 살펴봐요':'?에 들어갈 길이를 써요'}),node('small',{text:kind==='repair-edit'?'종이 끌기 · 눌러 집고 놓기':kind==='repair-preview'?'다시 고치거나 다음으로':'맞닿는 변의 길이를 살펴봐요'}));return;}
      const ready=['ready','check'].includes(kind);
      ws.classList.toggle('ready-to-check',ready);
      if(liveGuide())speak(moveFor(step,kind));
      if(step.kind==='peel'){
        ws.dataset.peelPhase=kind||'face';
        speak(kind==='selected'?'답을 골랐어요. 아래에서 확인해요.':'종이에 적힌 네 변의 길이를 비교해요.');
        const submit=primarySlot.querySelector('button');if(submit)submit.disabled=kind!=='selected';
        banner.replaceChildren(node('strong',{text:'네 변의 길이가 모두 같나요?'}),node('small',{text:'상자에서 떼어 낸 면이에요. 길이가 같은지 골라요.'}));
        return;
      }
      const question=questionFor(step,kind),condition=step.instruction.replace(/^[①②③④⑤]\s*[^:]+:\s*/, '').replace('정사각형 5/6.','정사각형 한 장을 더 붙여요.');
      banner.replaceChildren(node('strong',{text:question}));
      banner.append(node('small',{text:moveFor(step,kind)}));
      if(ready)speak(moveFor(step,kind)+' 아직 정답 확인 전이에요.');
    };guide(step.mode);
    view = renderStep(step, {stepAnswers,postal:activity.postal,activityId:activity.id,onGuide:guide,draft: index===(draft.index||0)?draft.answer:null});
    ws.querySelector('.draft-compare')?.remove();if(index>0&&step.kind==='net-build'&&!step.base.length&&stepAnswers[0]?.pieces){const card=node('div',{class:'draft-compare'},[node('b',{text:'첫 번째 완성안'}),netFigure(stepAnswers[0].pieces,{size:110})]);ws.append(card);}
    stage.append(view.el);stage.scrollTop=0;
    if (view.side) side.append(view.side);
    for (const t of view.tools || []) {
      if(activity.postal&&t.classList.contains('rot')) tools.append(node('details',{class:'rotation-tools'},[node('summary',{text:'상자 돌려보기'}),t]));
      else tools.append(t);
    }
    const hintLabel=()=>activity.postal?(scored&&!progress.hinted(activity.id)?'수학 힌트 −3':'힌트 다시 보기'):'도움';
    const hintBtn = button(hintLabel(), () => {
      const r = scored ? progress.hint(activity.id, newEventId()) : {accepted: true, charged: false};
      if (!r.accepted) return;
      speak(step.hint || '천천히 다시 살펴봐요.', 'help');
      hintBtn.querySelector('span:last-child').textContent = hintLabel();
      if(activity.postal)hintBtn.title='이 활동의 힌트는 다시 봐도 추가로 점수가 줄지 않아요.';
      hud.update(); onSave?.();
    }, {cls: 'small', icon: '?'});
    if(activity.postal){
      hintBtn.title=scored&&!progress.hinted(activity.id)?'수학 힌트 · 이 활동에서 처음 사용하면 3점이 줄어요. 조작 안내는 점수가 줄지 않아요.':'이 활동의 힌트는 다시 봐도 추가로 점수가 줄지 않아요.';
      const coach=coachFor(step),explain=()=>{ws.classList.remove('needs-review');speak(coach.moves.join(' '),'help');};explainCurrent=explain;
      if(activity.postalGuide)guideTimer=setTimeout(explain,60);
    }else tools.append(hintBtn);
    hud.setSub(steps.length > 1 ? [`단계 ${index + 1} / ${steps.length}`] : []);
    const submit = button(submitLabel(step), onSubmit, {primary: true, icon: '✓'});
    primarySlot.append(submit);
    syncResponse();
    speak(activity.postal ? moveFor(step,lastGuide) : (index === 0 && activity.situation ? activity.situation + ' ' : '') + (step.moa || '먼저 위의 행동을 해 보고, 확인 버튼을 눌러요.'));
    if(activity.postal&&step.kind==='peel')guide(lastGuide);
    focusTimer=setTimeout(() => (view.focusFirst ? view.focusFirst() : stage.querySelector('button:not([disabled]), [tabindex="0"], input, select')?.focus({preventScroll:true})), 50);
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
    if(view.beforeSubmit?.()){syncResponse();snapshot();return;}
    const answer = view.getAnswer();
    if(activity.postal&&!hasResponse(step,answer)){
      const current=ws.querySelector('.answer-fields .field:not([hidden]) input,.answer-fields .field:not([hidden]) select,.link-table > :not([hidden]) select');
      if(['fill','link'].includes(step.kind)&&current?.value.trim())ws.querySelector('.field-nav button:last-child:not([disabled])')?.click();
      return;
    }
    const result = step.check(answer, {stepAnswers});
    view.afterCheck?.(result);
    if (result.ok) {
      clearTimeout(guideTimer);clearTimeout(focusTimer);
      solvedStep = true;ws.classList.remove('needs-review');
      if(activity.postal){ws.classList.add('step-checked');banner.replaceChildren(node('strong',{text:index<steps.length-1?'점검했어요! 다음 작업을 해요':'이 포장 작업을 마쳤어요'}),node('small',{text:index<steps.length-1?'‘다음 단계’를 눌러 이어서 준비해요.':'포장 기록을 확인하고 다음으로 이어가요.'}));}
      stepAnswers[index]=answer;progress.setExtra(draftKey,{index:Math.min(index+1,steps.length-1),answers:stepAnswers});onSave?.();
      sfx.success(); sparkle(stage.querySelector('svg') || stage);
      speak(activity.postal&&step.kind==='peel'?(index===0?'가로와 세로가 다른 직사각형이에요.':'네 변이 같은 정사각형이에요. 정사각형도 직사각형에 속해요.'):(result.message || (index < steps.length - 1 ? '좋아요! 다음 단계로 가요.' : '좋아요! 이 작업을 마쳤어요.')), 'good');
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
    const {repairPhase,...gradedAnswer}=answer;
    const penalty = scored ? progress.wrong(activity.id, newEventId(), answerSignature({step: index, answer:gradedAnswer})) : null;
    sfx.wrong();
    hud.update(); onSave?.();
    view.markWrong(result);if(activity.postal){ws.classList.add('needs-review');if(progress.wrongCount(activity.id)>=2&&!tools.querySelector('.free-coach'))tools.append(button('조작 같이 보기 · 무료',()=>explainCurrent?.(),{cls:'free-coach'}));}
    let review=({peel:'위쪽과 옆쪽 길이를 다시 비교해요.',solid:'붉게 표시된 곳을 다시 살펴봐요. 빠진 표시도 확인해요.',sort:'붉은 상자를 돌려서 면을 살펴봐요.',choice:'표시된 카드를 다시 살펴봐요.',fill:'표시된 빈칸을 다시 확인해요.',link:'표시된 그림과 연결을 다시 확인해요.',sketch:'붉은 선과 점을 다시 살펴봐요.','tray-count':'표시된 종이의 크기와 장수를 다시 봐요.','net-build':'종이의 연결과 겹치는 곳을 살펴봐요.','net-points':'기준 표시에서 접히는 자리를 따라가 봐요.','net-predict':'접히는 모습을 보고 다시 골라요.'})[step.kind]||'표시된 곳을 다시 살펴봐요.';
    if(activity.postal){
      if(result.message)review=result.message;
      tools.querySelector('.review-detail')?.remove();
      tools.querySelector('.help-tools')?.append(node('p',{class:'review-detail',text:result.message||review}));
      if(step.kind==='peel')view.el.classList.add('review-lengths');
      const target=stage.querySelector('.wrong')||side.querySelector('.wrong');
      if(!result.message&&!target&&['solid','sort','choice','fill','link','sketch','tray-count'].includes(step.kind))review='빠뜨린 곳이 없는지 문제와 답을 비교해요.';
      target?.scrollIntoView({block:'nearest',inline:'nearest'});
      const condition=banner.querySelector('small');if(condition)condition.textContent=review;
    }
    speak((activity.postal?review:result.message)+(penalty?.accepted?penalty.repeated?' (같은 답이라 추가 감점 없음)':' (−10)':''),'alert');
  }
  function showSummary() {
    ws.classList.add('has-parcel-record');
    // Completed work stays visible but cannot receive taps behind its record.
    for(const part of [stage,side,tools,primarySlot])part.inert=true;
    const box = node('div', {class: 'summary-box', role: 'dialog', 'aria-label': '학습 정리'});
    const wi = progress.activities.find(a => a.id === activity.id)?.workshop;
    const total=progress.activities.filter(a=>a.workshop===wi),done=total.filter(a=>progress.isComplete(a.id)).length;
    if(activity.postal&&done<total.length){
      ws.classList.add('inline-complete');box.classList.add('inline-record');box.setAttribute('role','region');
      const details=node('details',{class:'lesson-recap'},[node('summary',{text:'알아낸 것'}),node('p',{text:activity.summary}),view.summaryArt?.()]);
      if(activity.id==='w6-m4'){const assembled=createRobotView({size:180});details.append(assembled.el,assembled.controls);}
      box.append(node('strong',{text:`✓ 포장 ${done}/${total.length}`}),packingMilestone(activity.postalResident,activity.steps.at(-1)),details,button(nextLabel(),()=>{box.remove();onDone();},{primary:true,icon:'→'}));
      ws.append(box);box.querySelector('button.primary').focus({preventScroll:true});return;
    }
    const parcel=activity.postal?node('div',{class:'parcel-record'},[node('div',{class:'parcel-icon'},[node('img',{src:itemImage(activity.postalResident),alt:'',class:'packed-item'})]),node('strong',{text:activity.parcelItem||'마음을 담은 소포'}),node('div',{class:'parcel-dots','aria-label':`전체 ${total.length}개 중 ${done}개 포장 완료`,text:total.map((_,i)=>i<done?'●':'○').join(' ')}),node('small',{text:`포장 기록 ${done}/${total.length} · ${done===total.length?'봉인 준비 완료':'이만큼 준비했어요'}`})]):null;
    if(parcel){
      const phase=done===total.length?'sealed':done>=4?'protected':done>=2?'wrapped':'box';
      const picture=parcel.querySelector('.parcel-icon');picture.dataset.phase=phase;
      const label={box:'상자 준비',wrapped:'포장지 두르기',protected:'모서리 보호',sealed:'봉인 완료'}[phase];
      picture.setAttribute('role','img');picture.setAttribute('aria-label',label);
      for(let i=0;i<4;i++)picture.append(node('span',{class:'parcel-corner','aria-hidden':'true'}));
      picture.append(node('span',{class:'parcel-lid','aria-hidden':'true'}));
      picture.append(node('span',{class:'parcel-seal',text:'✓','aria-hidden':'true'}));
      parcel.querySelector('small').textContent=`포장 기록 ${done}/${total.length} · ${label}`;
    }
    const stamped = workshop && progress.workshopDone(wi);
    if (stamped) sfx.stamp();
    let robot = null;
    if (activity.id === 'w6-m4') { robot = createRobotView({size: 220}); }
    box.append(...[
      stamped ? node('div', {class: 'stamp', text: '완료'}) : node('div', {class: 'stamp gold', text: '✓'}),
      node('h2', {text: activity.postal?'선물 포장 완료!':stamped?`${workshop.name} · 포장 완료!`:activity.title}),
      robot ? node('div', {class: 'row', style: {justifyContent: 'center'}}, [robot.el, robot.controls]) : null,
      parcel,
      null,
      activity.postal?node('details',{class:'lesson-recap'},[node('summary',{text:'알아낸 것'}),node('p',{text:activity.summary})]):node('p', {text: activity.summary}),
      activity.postal ? node('p',{class:'note',text:stamped?'상자 점검을 마쳤어요. 소포에 송장을 붙이고 배송해요.':activityKind==='review'?'새 상자에도 배운 방법을 써 봤어요. 출발 점검을 이어가요.':'배운 내용을 포장 기록에 남겼어요. 다음 작업도 직접 시작해요.'}):null,
      stamped&&!activity.postal ? node('p', {class: 'note', text: `${workshop.name}의 미션 4개와 복습 3문항을 모두 마쳤어요.`}) : null,
      node('div', {class: 'row', style: {justifyContent: 'center'}}, [button(nextLabel(), () => { box.remove(); onDone(); }, {primary: true, icon: '→'})])
    ].filter(Boolean));
    if(activity.postal&&done===total.length){box.classList.add('gift-finished');const parcelView=createSolidView({dims:parcelDimensions(activity.postalResident),size:190,scale:130/Math.max(...Object.values(parcelDimensions(activity.postalResident))),postal:true,mode:'none'});const turn=node('div',{class:'parcel-turntable'},[parcelView.el,node('details',{class:'rotation-tools'},[node('summary',{text:'상자 돌려보기'}),parcelView.controls]),node('small',{text:'끌어서 돌려요'}),node('div',{class:'parcel-address'},[node('span',{text:'받는 이'}),node('strong',{text:STORIES[activity.postalResident].to}),node('small',{text:activity.parcelItem})])]);const peek=node('details',{class:'completed-preview'},[node('summary',{text:'상자 입체로 살펴보기'}),turn]);box.insertBefore(peek,box.lastElementChild);box.querySelector('p.note').textContent=STORIES[activity.postalResident].finish;}
    if(activity.postal){
      if(done===total.length){box.insertBefore(parcelCustomizer(progress,activity.postalResident,onSave),box.lastElementChild);for(const detail of box.querySelectorAll(':scope > details'))box.insertBefore(detail,box.lastElementChild);}
      else if(parcel){parcel.classList.add('packing-progress');parcel.querySelector('.parcel-icon').classList.add('packing-arrival');}
    }
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
  return {destroy() { view?.destroy?.();clearTimeout(guideTimer);clearTimeout(focusTimer);clearTimeout(captureTimer);instructionSize.disconnect();window.removeEventListener('resize',fitInstruction);if(!solvedStep)snapshot();window.removeEventListener('pagehide',snapshot);clear(container); },get view(){return view;}};
}




