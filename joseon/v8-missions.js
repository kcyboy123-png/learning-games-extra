'use strict';
(()=>{
 const legacy=JOSEON_MISSIONS.render;
 function confirmChoice(m,root,G,selector,attribute,stage){
  const buttons=[...root.querySelectorAll(selector)];if(!buttons.length||root.querySelector('#submit-choice8'))return;
  const s=G.draft(m.id).play,handlers=buttons.map(b=>b.onclick);
  if(s.confirmStage!==stage){s.confirmStage=stage;delete s.confirmChoice;}
  const bar=document.createElement('div');bar.className='actions end choice-submit8';bar.innerHTML='<span>고른 답은 제출 전까지 바꿀 수 있어요.</span><button class="primary" id="submit-choice8">정답 제출하기</button>';
  (root.querySelector('.feedback')||root.lastElementChild).after(bar);
  const submit=bar.querySelector('button');
  const paint=()=>{buttons.forEach(b=>{const chosen=+b.dataset[attribute]===s.confirmChoice;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});submit.disabled=!Number.isInteger(s.confirmChoice);};
  buttons.forEach(b=>b.onclick=()=>{s.confirmChoice=+b.dataset[attribute];G.save();paint();});
  submit.onclick=()=>{const i=buttons.findIndex(b=>+b.dataset[attribute]===s.confirmChoice);if(i<0)return;handlers[i]?.call(buttons[i]);};paint();
 }
 JOSEON_MISSIONS.render=function(m,root,G){
  if(m.id===13)JOSEON_MUSIC.battle(true);
  legacy(m,root,G);
  const s=G.draft(m.id).play;
  if(m.id===3)confirmChoice(m,root,G,'[data-choice]','choice','palace:'+(s.step||0));
  if(m.id===10)confirmChoice(m,root,G,'[data-status]','status','status:'+(s.stage||0));
  if(m.id===28&&!s.tradeMeaning)confirmChoice(m,root,G,'[data-meaning]','meaning','meaning');
  if(m.id===18)root.classList.add('market8');
  if(m.id===21){root.classList.add('research8');const replace=(el,key)=>{if(!el||!JOSEON_V5_IMAGES[key])return;const t=document.createElement('template');t.innerHTML=JOSEON_V2_ART.picture(key);el.replaceWith(t.content.firstElementChild);};replace(root.querySelector('.mission-banner img,.mission-banner svg'),'research8:0');root.querySelectorAll('[data-issue]').forEach(b=>replace(b.querySelector('img,svg'),'research8:'+(+b.dataset.issue+1)));}
  if(m.id===27&&s.performanceStep===1){const v=root.querySelector('video'),b=root.querySelector('#next-performance');if(v&&b)JOSEON_MEDIA.watch(v,[b]);}
 };
 const winter=JOSEON_V2_ACTION.winter;
 JOSEON_V2_ACTION.winter=function(m,root,G){
  const s=G.draft(m.id).play;
  if(s.intro&&[1,2].includes(s.phase)&&s.winterAcknowledged!==s.phase){
   const late=s.phase===2;
   root.innerHTML=`<section class="winter-alert8" role="alertdialog" aria-modal="true" aria-labelledby="winter-warning-title"><img src="assets/v7/winter-hardship.webp" alt="눈 덮인 성 안에서 추위와 굶주림을 견디는 사람들"><div class="winter-alert-shade8"></div><div class="winter-alert-copy8"><span class="winter-alert-label8">${late?'두 번째 위기':'첫 번째 위기'} · 남한산성</span><h3 id="winter-warning-title">${late?'성 밖에서 오던 식량이<br>끊겼어요.':'매서운 한파가<br>성 안을 덮쳤어요.'}</h3><p>${late?'“식량을 기다렸지만… 아무도 오지 않았어요.”<br>먹을 양을 줄여야 하고, 병든 사람도 늘었어요.':'“너무 추워요. 불을 꺼뜨릴 수가 없어요.”<br>몸을 녹이느라 땔감을 두 묶음 더 썼어요.'}</p><div class="winter-loss8">남은 물자 <s>${late?'10':'12'}</s> → <strong>${late?'8':'10'}묶음</strong></div><button class="gold-button" id="winter-ack8">상황 확인 · 남은 물자 다시 나누기 →</button></div></section>`;
   if(root._warningPhase!==s.phase){root._warningPhase=s.phase;JOSEON_V7.sfx('warning',G);}
   const b=root.querySelector('#winter-ack8');b.onclick=()=>{s.winterAcknowledged=s.phase;G.save();this.winter(m,root,G);};requestAnimationFrame(()=>b.focus({preventScroll:true}));return;
  }
  winter.call(this,m,root,G);
  if(!s.intro){const v=root.querySelector('video'),b=root.querySelector('#winter-begin');if(v&&b)JOSEON_MEDIA.watch(v,[b]);}
 };
})();
