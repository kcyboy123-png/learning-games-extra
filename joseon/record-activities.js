'use strict';
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function grade(activity,response){
  if(activity.type==='link'){
   const ready=activity.pairs.every((_,i)=>Number.isInteger(response?.[i])&&response[i]>=0&&response[i]<activity.pairs.length);
   return {ready,correct:ready&&activity.pairs.every((_,i)=>response[i]===i),key:activity.pairs.map((_,i)=>response?.[i]??'_').join('-')};
  }
  const ready=Number.isInteger(response)&&response>=0&&response<activity.options.length;
  return {ready,correct:ready&&response===activity.answer,key:String(response??'_')};
 }
 function render(root,activity,{G,step=0,total=1,clip,onComplete,onHint}){
  const V=window.JOSEON_V2_ART;
  const pic=(art,label)=>V.picture(art,'record-picture',label||'배운 내용을 떠올리는 그림');
  const label={blank:'말 조각으로 완성',link:'그림과 뜻 연결',compare:'그림을 살펴 비교'}[activity.type];
  let response=activity.type==='link'?{}:null,selectedLeft=null,finished=false,observer=null;
  const choiceOrder=activity.options?G.shuffle(activity.options.map((_,i)=>i)):[];
  const leftOrder=activity.pairs?G.shuffle(activity.pairs.map((_,i)=>i)):[];
  const rightOrder=activity.pairs?G.shuffle(activity.pairs.map((_,i)=>i)):[];
  let body='';
  if(activity.type==='blank'){
   // The gap is sized by the longest option (one rule for every blank), so its width never hints at the answer.
   const longest=Math.max(...activity.options.map(o=>String(o).length));
   body=`<div class="record-blank-layout"><figure class="record-scene">${pic(activity.art)}</figure><div class="record-writing"><p class="record-sentence" style="--gap-chars:${longest}" aria-live="polite">${esc(activity.before)}<strong class="record-gap" data-record-gap>알맞은 말</strong>${esc(activity.after)}</p><p class="record-blank-hint" data-record-hint>아래 말 조각을 눌러 빈칸에 넣어요.</p><div class="record-options record-pieces" role="group" aria-label="빈칸에 넣을 말 조각">${choiceOrder.map(i=>`<button type="button" class="record-choice record-word" data-record-choice="${i}" aria-pressed="false">${esc(activity.options[i])}</button>`).join('')}</div></div></div>`;
  }else if(activity.type==='compare'){
   body=`<div class="record-panels ${activity.panels.length===1?'single':''}">${activity.panels.map(p=>`<figure class="record-scene">${pic(p.art,p.label)}<figcaption><b>${esc(p.label)}</b>${p.note?`<span>${esc(p.note)}</span>`:''}</figcaption></figure>`).join('')}</div><div class="record-options record-conclusions" role="group" aria-label="그림에서 찾은 기록">${choiceOrder.map(i=>`<button class="record-choice" data-record-choice="${i}" aria-pressed="false"><span class="record-radio" aria-hidden="true"></span>${esc(activity.options[i])}</button>`).join('')}</div>`;
  }else{
   body=`<p class="record-link-guide"><b>① 그림 선택</b><span>→</span><b>② 설명 선택</b><small>선을 이은 뒤에도 고칠 수 있어요.</small></p><div class="record-links"><svg class="record-wires" aria-hidden="true"></svg><div class="record-left">${leftOrder.map(i=>`<button class="record-source" data-record-left="${i}" aria-pressed="false" aria-label="${esc(activity.pairs[i].label)} 그림 선택">${pic(activity.pairs[i].art,activity.pairs[i].label)}<span>${esc(activity.pairs[i].label)}</span><i class="record-port" aria-hidden="true"></i></button>`).join('')}</div><div class="record-right">${rightOrder.map(i=>`<button class="record-target" data-record-right="${i}"><i class="record-port" aria-hidden="true"></i><span>${esc(activity.pairs[i].text)}</span><small class="record-link-label"></small></button>`).join('')}</div></div><p class="record-link-status" aria-live="polite">그림을 먼저 눌러 주세요. · 0 / ${activity.pairs.length}개 연결</p>`;
  }
  root.innerHTML=`<div class="record-topline"><span class="record-type">${esc(label)}</span><span>${total>1?`${step+1} / ${total} · `:''}마지막 기록을 채워요</span></div><div class="record-film hidden"></div><section class="record-content"><h3 class="record-prompt" tabindex="-1">${esc(activity.prompt)}</h3>${body}<div class="record-feedback" id="check-feedback" role="status"></div><div class="record-actions"><div><button type="button" class="link-button" id="mission-hint">${G.draft(G.current).hintUsed?'힌트 다시 보기 · 무료':'먹동이의 추가 힌트 −3'}</button><small>선택은 자유롭게 · 오답 확인 −10점</small></div><button type="button" class="gold-button" id="check-answer" disabled>${step===total-1?'기록 완성하기 ✦':'이 기록 확인하기'}</button></div></section>`;
  const find=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],submit=find('#check-answer'),feedback=find('#check-feedback');
  const clearFeedback=()=>{feedback.textContent='';feedback.className='record-feedback';all('.record-choice,.record-target,.record-source').forEach(b=>b.classList.remove('record-invalid'));};
  const update=()=>{submit.disabled=finished||!grade(activity,response).ready;};
  function drawWires(){
   if(!root.isConnected)return;
   const board=find('.record-links');if(!board)return;
   const rect=board.getBoundingClientRect(),svg=find('.record-wires');
   svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
   svg.innerHTML=Object.entries(response).map(([left,right])=>{
    const a=find(`[data-record-left="${left}"] .record-port`).getBoundingClientRect(),b=find(`[data-record-right="${right}"] .record-port`).getBoundingClientRect();
    const x1=a.left+a.width/2-rect.left,y1=a.top+a.height/2-rect.top,x2=b.left+b.width/2-rect.left,y2=b.top+b.height/2-rect.top,mid=(x1+x2)/2;
    return `<path d="M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}"/>`;
   }).join('');
  }
  function refreshLinks(){
   all('[data-record-left]').forEach(b=>{const i=+b.dataset.recordLeft;b.classList.toggle('selected',selectedLeft===i);b.classList.toggle('linked',Number.isInteger(response[i]));b.setAttribute('aria-pressed',String(selectedLeft===i));});
   all('[data-record-right]').forEach(b=>{const id=+b.dataset.recordRight,left=Object.keys(response).find(k=>response[k]===id);b.classList.toggle('linked',left!==undefined);b.querySelector('.record-link-label').textContent=left!==undefined?'↔ '+activity.pairs[+left].label:'';});
   find('.record-link-status').textContent=(selectedLeft===null?'그림을 먼저 눌러 주세요.':activity.pairs[selectedLeft].label+'에 이어 줄 설명을 눌러 주세요.')+` · ${Object.keys(response).length} / ${activity.pairs.length}개 연결`;
   drawWires();update();
  }
  all('[data-record-choice]').forEach(b=>b.onclick=()=>{
   if(finished)return;clearFeedback();response=+b.dataset.recordChoice;
   all('[data-record-choice]').forEach(x=>{const selected=x===b;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',String(selected));});
   if(activity.type==='blank'){find('[data-record-gap]').textContent=activity.options[response];find('[data-record-gap]').classList.add('filled');const hint=find('[data-record-hint]');if(hint)hint.textContent='고른 말이 문장에 들어갔어요. 바꾸려면 다른 조각을, 제출하려면 아래 버튼을 눌러요.';}
   update();
  });
  all('[data-record-left]').forEach(b=>b.onclick=()=>{if(finished)return;selectedLeft=+b.dataset.recordLeft;clearFeedback();refreshLinks();});
  all('[data-record-right]').forEach(b=>b.onclick=()=>{
   if(finished)return;if(selectedLeft===null){G.toast('먼저 왼쪽 그림을 눌러 주세요.');return;}
   clearFeedback();const right=+b.dataset.recordRight;
   // A description has one owner. Reassigning it never counts as an error.
   for(const left of Object.keys(response))if(response[left]===right)delete response[left];
   response[selectedLeft]=right;selectedLeft=null;refreshLinks();
  });
  find('#mission-hint').onclick=()=>{if(!finished)onHint();};
  submit.onclick=()=>{
   if(finished)return;const result=grade(activity,response);if(!result.ready)return;
   if(!result.correct){
    const charged=G.mistake(G.current,'record:'+step+':'+result.key);
    feedback.className='record-feedback bad';feedback.textContent='다시 살펴봐요. '+activity.summary+(charged?' · 오답 −10점':' · 같은 답은 다시 감점하지 않아요.');
    if(activity.type==='link')all('[data-record-left]').forEach(b=>b.classList.toggle('record-invalid',response[+b.dataset.recordLeft]!==+b.dataset.recordLeft));
    else find(`[data-record-choice="${response}"]`).classList.add('record-invalid');
    return;
   }
   finished=true;submit.disabled=true;observer?.disconnect();G.save();onComplete(activity.summary);
  };
  if(activity.type==='link'){
   observer=new ResizeObserver(drawWires);observer.observe(find('.record-links'));
   all('img').forEach(img=>img.addEventListener('load',drawWires,{once:true}));
   refreshLinks();
  }
  const movie=find('.record-film'),content=find('.record-content');
  if(window.JOSEON_MEDIA?.available(clip).length){
   movie.classList.remove('hidden');movie.innerHTML='<div class="record-film-poster"></div>';
   const posterArt=activity.art||activity.panels?.[0]?.art||activity.pairs?.[0]?.art;
   movie.firstElementChild.innerHTML=pic(posterArt);content.hidden=true;
   window.JOSEON_MEDIA.playIn(movie,clip,()=>{movie.remove();content.hidden=false;drawWires();find('.record-prompt').focus({preventScroll:true});});
  }
  return ()=>observer?.disconnect();
 }
 window.JOSEON_RECORDS={render,grade};
})();
