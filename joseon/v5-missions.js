'use strict';
(()=>{
const legacy=JOSEON_MISSIONS.render,V=JOSEON_V2_ART,media=JOSEON_MEDIA;
JOSEON_MISSIONS.render=function(m,root,G){
 root._connectorRO?.disconnect();media.releaseIn(root);const s=G.draft(m.id).play,pic=V.picture,esc=G.escape,again=()=>JOSEON_MISSIONS.render(m,root,G),save=()=>G.save();
 let movie=G.D.mediaIntros[m.id];if(m.id===0)movie=s.place!==null&&s.place!==undefined?['family','farmer','temple'][s.place]:!s.entered?'village':null;
 if(m.id===3)movie=(s.step||0)===0?'geunjeong-entry':s.step===2?'geunjeong-rain':null;
 if(movie&&media.once(root,'intro:'+m.id+':'+(m.id===0?s.place:m.id===3?s.step||0:''),movie,again))return;
 if(m.id===7&&!root._contextRead){root.innerHTML=`<div class="paper"><span class="eyebrow">먼저 세 가지 소식을 살펴봐요</span><h3>교류하면서, 나라의 안전도 지켰어요</h3><p>교류는 서로 문물이나 물건을 주고받는 일이에요.</p></div><div class="context-cards">${m.context.map(c=>`<article>${pic(c.art)}<h4>${esc(c.name)}</h4><p>${esc(c.text)}</p></article>`).join('')}</div><div class="context-start"><button id="context-next" class="primary">세 소식을 연결해 볼까? →</button></div>`;root.querySelector('#context-next').onclick=()=>{root._contextRead=true;again();};return;}
 if(m.id===0&&s.stage==='founding'){
 root.innerHTML=`<div class="origin-adventure"><div class="origin-founders founding-screen"><div class="founding-picture cinema-host">${pic('origin:3')}</div><div><span class="eyebrow">새로운 시대가 열려요</span><span class="record-year">1392</span><h3>조선의 시작</h3><p><b>이성계와 일부 신진 사대부</b>가 고려를 무너뜨리고 조선을 세웠어요.</p><p>새 나라는 <b>유교</b>를 바탕으로 다스리고자 했어요.</p></div></div><div class="actions end"><button id="origin-finish" class="gold-button">조선의 첫 기록 확인하기 →</button></div></div>`;
 root._seenClips||=new Set();if(!root._seenClips.has('founding')){root._seenClips.add('founding');root.querySelector('#origin-finish').disabled=true;media.playIn(root.querySelector('.founding-picture'),'founding',()=>{const b=root.querySelector('#origin-finish');if(b)b.disabled=false;});}
 root.querySelector('#origin-finish').onclick=()=>G.coreComplete(m,'세 사람의 단서로 고려 말의 어려움을 살피고 1392년 조선 건국으로 연결함');return;
 }
 if(m.id===21){
  s.solved||=[];for(const k of ['issue','evidence','method'])s[k]??=null;s.evOrder||=G.shuffle([0,1,2]);s.metOrder||=G.shuffle([0,1,2]);
  const issues=['농사일이 힘들어요','물건을 나르기 어려워요','우리 지역을 잘 몰라요'],evidence=['농부의 농사 경험','시장의 물건과 거래 기록','지역의 지도와 옛 기록'],methods=['농사 기술과 토지 문제 연구','상공업과 교역의 개선 연구','우리 역사와 지리 연구'];
  root.innerHTML=`<div class="mission-banner">${pic('research5')}<p>자료를 살펴 백성의 생활 문제를 해결해요.</p></div><div class="research-progress"><b>서로 다른 연구 두 가지</b><strong>${s.solved.length} / 2 완료</strong></div><div class="research-issues">${issues.map((t,i)=>`<button class="chip ${s.solved.includes(i)?'proposal-solved':s.issue===i?'selected':''}" data-issue="${i}" ${s.solved.includes(i)?'disabled':''}>${pic(['chapter6:1','chapter5:4','chapter6:4'][i])}<b>${s.solved.includes(i)?'✓ 연구 완료':t}</b></button>`).join('')}</div>${s.solved.length<2?`<div class="proposal-columns"><div><h3>① 어떤 자료를 살필까?</h3>${s.evOrder.map(i=>`<button class="chip ${s.evidence===i?'selected':''}" data-evidence="${i}">${evidence[i]}</button>`).join('')}</div><div><h3>② 무엇을 연구할까?</h3>${s.metOrder.map(i=>`<button class="chip ${s.method===i?'selected':''}" data-method="${i}">${methods[i]}</button>`).join('')}</div></div><div class="feedback" role="status"></div><div class="actions end"><button id="research-check" class="primary">이 연구로 해결하기</button></div>`:'<div class="paper"><h3>두 가지 생활 문제에 길을 찾았어요!</h3><p>실학자들은 현실의 문제를 여러 분야에서 연구했어요.</p></div><div class="actions end"><button id="research-finish" class="gold-button">두 연구를 기록하기 →</button></div>'}`;
  for(const key of ['issue','evidence','method'])root.querySelectorAll('[data-'+key+']').forEach(b=>b.onclick=()=>{s[key]=+b.dataset[key];save();again();});
  const check=root.querySelector('#research-check');if(check)check.onclick=()=>{const f=root.querySelector('.feedback');if([s.issue,s.evidence,s.method].some(v=>v===null))return f.textContent='문제 하나와 자료·연구 방법을 차례로 골라요.';if(s.issue!==s.evidence||s.issue!==s.method){const charged=G.mistake(m.id,'research:'+s.issue+':'+s.evidence+':'+s.method);f.textContent='이 문제를 해결하는 데 직접 도움이 되는 자료와 방법을 살펴봐요.'+(charged?' · −10점':'');return;}if(!s.solved.includes(s.issue))s.solved.push(s.issue);s.issue=s.evidence=s.method=null;save();again();};
  const finish=root.querySelector('#research-finish');if(finish)finish.onclick=()=>G.coreComplete(m,s.solved.map(i=>issues[i]+' → '+methods[i]).join(' / '));return;
 }
 legacy(m,root,G);
 if(m.id===0){
  if(s.stage==='record'&&s.answered?.length===3){const box=root.querySelector('.origin-record');box.classList.add('record-transition');box.querySelector('.origin-founders')?.remove();box.querySelector('.actions')?.remove();box.insertAdjacentHTML('afterbegin','<span class="record-stamp" aria-hidden="true">✦</span>');box.insertAdjacentHTML('beforeend','<p>세 사람의 이야기를 모아, 새로운 시대로…</p><button id="founding-now" class="primary">1392년으로 이어 보기 →</button>');const next=()=>{if(!root.isConnected||s.stage!=='record'||!G.modal.open)return;s.stage='founding';save();again();G.modal.scrollTop=0;};root.querySelector('#founding-now').onclick=next;clearTimeout(root._recordTimer);root._recordTimer=null;return;}
  const map=root.querySelector('.origin-map');if(map){
   const buttons=[...map.querySelectorAll('button')],seen=s.villageViewed===true;
   buttons.forEach(b=>b.disabled=!seen);
   const release=()=>{buttons.forEach(b=>b.disabled=false);s.villageViewed=true;save();};
   media.hold(map,'village',seen,release);
  }
  const stage=root.querySelector('.lens-stage');if(stage){
   const e=G.D.originScenes[s.place],found=e.clues.map((_,i)=>s.found.includes(s.place*2+i)),observed=found.every(Boolean),panel=root.querySelector('.origin-story-panel');
   panel.querySelector('blockquote')?.remove();panel.querySelector('.eyebrow')?.remove();panel.querySelector('.clue-notes')?.remove();panel.querySelector('.lens-instruction')?.remove();
   const wrap=document.createElement('div');wrap.className='clue-illustration';stage.before(wrap);wrap.append(stage);const caption=stage.querySelector('.lens-caption');if(caption)wrap.append(caption);const latest=root._latestClue?.place===s.place?root._latestClue.index:found.lastIndexOf(true);stage.insertAdjacentHTML('beforebegin',`<div class="picture-dialogue" role="status">${latest>=0?`<b>${esc(e.clues[latest].name)}</b><br>${esc(e.clues[latest].text)}`:`“${esc(e.voice)}”`}</div>`);
   if(!observed)panel.innerHTML='<div class="clue-wait"><strong>그림 속에 답의 실마리가 있어요</strong><p>반짝이는 ＋ 두 개를 눌러<br>사람들의 이야기를 들어 주세요.</p></div>';
   stage.onpointermove=null;stage.onpointerleave=null;
   root.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{const i=+b.dataset.clue,n=s.place*2+i;root._latestClue={place:s.place,index:i};if(!s.found.includes(n))s.found.push(n);save();again();});
  }
 }

 if(m.type==='route'){
  root.querySelectorAll('.route-cell').forEach(b=>{const icon=b.querySelector('.icon');if(icon){const n=b.classList.contains('block')?0:b.classList.contains('goal')?2:1;icon.outerHTML=pic('route5:'+n,'route-scenery');}if(!b.classList.contains('block')&&!b.classList.contains('current')&&!b.querySelector('.route-scenery'))b.insertAdjacentHTML('afterbegin','<span class="path-pebbles" aria-hidden="true">· ·</span>');});
 }
 if(m.type==='farm'){
  root.querySelectorAll('[data-season]').forEach(b=>{const i=+b.dataset.season;b.querySelectorAll('svg,img').forEach(x=>x.remove());b.insertAdjacentHTML('afterbegin',pic('seasons:'+i,'season-scene'));if(s.fields[i]!==undefined)b.insertAdjacentHTML('beforeend',pic('chapter5:'+s.fields[i],'assigned-task'));});
 }
 if(m.type==='trade'){
  const rows=[['money','동전','닢','supplies:7'],['beans','콩','자루','beans5'],['rice','쌀','되','supplies:4'],['cloth','옷감','필','supplies:5'],['herb','약초','묶음','supplies:6']];root.querySelector('.market-inventory').innerHTML=rows.map(([k,n,u,ref])=>`<span class="inventory-item ${s.bag[k]===0?'empty':''}">${ref?pic(ref,'',n):'<span class="coin-symbol" aria-hidden="true">◎</span>'}<span>${n} <b>${s.bag[k]}</b>${u}</span></span>`).join('');
 }
 if(m.type==='performance'){
  const stage=root.querySelector('.stage-view'),refs=window.JOSEON_V5_IMAGES||{};if(stage&&refs['stage5']){stage.innerHTML=`<img class="stage-backdrop" src="${refs.stage5.src}" alt="마을 공연의 빈 무대">${[0,1,2].map(i=>`<img class="stage-actor cast-${i} ${s.cast.includes(i)?'revealed':'silhouette'}" src="${refs['actor5:'+i].src}" alt="${['소리꾼','고수','관객'][i]} ${s.cast.includes(i)?'등장':'자리'}">`).join('')}`;}
 }
};
})();
