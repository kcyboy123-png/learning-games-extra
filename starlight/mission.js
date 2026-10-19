'use strict';
window.playMission=function(G,id){
 const m=STAR_DATA.missions.find(x=>x.id===id);if(!m)return;
 if(id==='END01'&&G.state.done.filter(x=>x!=='END01').length<17){G.toast('여섯 지역의 기록 17개를 먼저 되찾아 주세요.');return;}
 const practice=G.state.done.includes(id), q=s=>document.querySelector(s);
 let locked=false,order=[],tiles=[3,0,4,1,5,2],selected=-1,route=20,visited=[20];
 const blocked=[1,6,8,9,11,13,16,18,23],escape=G.escape;
 const optionHTML=()=>`<div class="options">${(m.options||[]).map((o,i)=>`<label class="option"><input type="${m.type==='multi'?'checkbox':'radio'}" name="answer" value="${i}"><span>${o}</span></label>`).join('')}</div>`;
 function task(){
  let out='';
  if(m.type==='match')out=m.pairs.map((p,i)=>`<div class="match-row"><label for="match-${i}">${p[0]}</label><select id="match-${i}" data-match="${i}"><option value="">설명 고르기</option>${m.pairs.map((_,j)=>(j+1)%m.pairs.length).map(j=>`<option value="${j}">${m.pairs[j][1]}</option>`).join('')}</select></div>`).join('');
  if(m.type==='order')out='<div id="order-board"></div><button class="btn small light" id="order-reset">순서 다시 놓기</button>';
  if(m.type==='route')out='<div id="route-board"></div><p class="route-caption">● 루미 · ⚑ 산성 · 빗금은 끊긴 길<br>상하좌우로 이어진 칸을 눌러 이동해요.</p><button class="btn small light" id="route-reset">출발점으로</button>';
  if(m.type==='mosaic')out=`<p class="rule">두 조각을 차례로 누르면 자리가 바뀌어요. 그림을 맞추고 아래 질문도 해결해 주세요.</p><div class="mosaic-wrap"><div class="mosaic" id="mosaic" aria-label="여섯 조각 유물 퍼즐"></div><div class="mosaic-reference"><img class="relic-image" data-relic="${m.art}" alt="완성할 유물 그림"><p>완성 모습<br>학습용 유물 일러스트</p></div></div>`;
  if(m.type==='cargo')out=`<p class="guide-box">농경 마을: 농기구 2상자 / 교역 나루: 덩이쇠 1상자<br>배는 한 번에 2상자까지, 한 목적지로 운항해요. 두 번에 나누어 보내 주세요.</p><div class="cargo-table">${['농기구 상자 ①','농기구 상자 ②','덩이쇠 상자'].map((s,i)=>`<div class="cargo-line"><strong>${s}</strong><select data-dest="${i}" aria-label="${s} 목적지"><option value="">목적지</option><option value="farm">농경 마을</option><option value="port">교역 나루</option></select><select data-trip="${i}" aria-label="${s} 배송 차수"><option value="">배송 차수</option><option value="1">1차 배송</option><option value="2">2차 배송</option></select></div>`).join('')}</div>`;
  if(m.type==='location')out='<div class="map-model" role="img" aria-label="모형 지도. 가는 강과 마을길이 만나는 곳, 나는 멀리 있는 산속, 다는 길이 끊긴 곳"><div class="map-river">강</div><div class="map-road"></div><span class="map-label a">가 · 연결 지점</span><span class="map-label b">나 · 산속</span><span class="map-label c">다 · 길 없음</span><span class="map-label farm">농경지와 마을</span></div><p class="rule">실제 지형을 재현한 지도가 아닌 조건 비교 모형이에요.</p>';
  if(m.options)out+=`<h3>${m.question}</h3>${optionHTML()}`;
  return out;
 }
 G.modal(m.title,`<div class="row between"><span class="pill">${m.tag} · ${m.time}</span><span class="rule">${practice?'완료한 미션 · 연습 모드':'첫 성공 +10 · 실패한 제출 −10'}</span></div><div class="dialogue" style="margin-top:18px"><img class="portrait" src="assets/lumi.png" alt="루미"><div class="speech"><strong>${m.npc}의 의뢰</strong>${m.story}</div></div><div class="mission-label">01 · 단서를 펼쳐 관찰하기</div><div class="clues">${m.clues.map((c,i)=>`<details class="clue" data-clue="${i}" ${G.state.clues.includes(id+':'+i)?'open':''}><summary>${c[0]}</summary><p>${c[1]}</p></details>`).join('')}</div><div class="mission-label">02 · 직접 해결하기</div><div class="challenge">${m.art&&m.type!=='mosaic'?`<img class="relic-image relic-wide" data-relic="${m.art}" alt="${m.art==='dagger'?'비파형 동검':'백제 금동대향로'} 학습용 그림">`:''}${!m.options?`<h3>${m.question||'관찰한 내용에 알맞은 설명을 연결해 주세요.'}</h3>`:''}${task()}<div style="clear:both"></div></div><div id="validation" class="error-note" role="status"></div><div id="mission-feedback" aria-live="polite"></div><div class="modal-actions"><button class="btn gold" id="submit-mission">해결했어요!</button><button class="btn light" id="hint-mission">단서 도움</button><span class="score-rule">${practice?'연습에서는 성공·실패 모두 점수가 그대로예요.':'단서 보기·조작·수정은 감점되지 않아요.'}</span></div>`,practice?'기록 다시 살펴보기':'별빛 탐험 의뢰');
 const root=document.querySelector('#modal');
 root.querySelectorAll('[data-clue]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){const k=id+':'+d.dataset.clue;if(!G.state.clues.includes(k)){G.state.clues.push(k);G.save();}}}));
 async function relics(){const src=await G.relic(m.art);if(!root.open||!root.querySelector('[data-relic]'))return;root.querySelectorAll('[data-relic]').forEach(x=>x.src=src);if(m.type==='mosaic')paintTiles(src);}
 let mosaicSrc='';
 function paintTiles(src=mosaicSrc){mosaicSrc=src;const box=q('#mosaic');if(!box)return;box.innerHTML=tiles.map((t,i)=>`<button class="tile ${selected===i?'chosen':''}" data-tile="${i}" aria-label="${i+1}번 자리의 그림 조각" aria-pressed="${selected===i}" style="background-image:url('${src}');background-position:${(t%2)*100}% ${Math.floor(t/2)*50}%"></button>`).join('');box.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(locked)return;const i=+b.dataset.tile;if(selected<0)selected=i;else{[tiles[selected],tiles[i]]=[tiles[i],tiles[selected]];selected=-1;G.sound('tap');}paintTiles();});}
 function paintOrder(){q('#order-board').innerHTML=`<div class="order-slots">${m.items.map((_,i)=>`<div class="order-slot">${order[i]===undefined?'카드를 골라 놓아 주세요':m.items[order[i]]}</div>`).join('')}</div><div class="order-bank">${m.items.map((_,i)=>(i+2)%m.items.length).map(i=>`<button data-order="${i}" ${order.includes(i)?'disabled':''}>${m.items[i]}</button>`).join('')}</div>`;root.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{if(locked)return;order.push(+b.dataset.order);G.sound('tap');paintOrder();});}
 function paintRoute(){q('#route-board').innerHTML=`<div class="route-grid">${Array.from({length:25},(_,i)=>`<button data-route="${i}" class="route-cell ${blocked.includes(i)?'wall':''} ${route===i?'here':''} ${visited.includes(i)?'visited':''}" aria-label="${Math.floor(i/5)+1}행 ${i%5+1}열 ${blocked.includes(i)?'끊긴 길':i===4?'산성':route===i?'루미 위치':'길'}" ${blocked.includes(i)?'disabled':''}>${route===i?'●':i===4?'⚑':i===20?'출발':visited.includes(i)?'·':''}</button>`).join('')}</div>`;root.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{if(locked)return;const i=+b.dataset.route;if(Math.abs(Math.floor(route/5)-Math.floor(i/5))+Math.abs(route%5-i%5)!==1){q('#validation').textContent='지금 위치와 상하좌우로 이어진 한 칸을 골라 주세요. 감점은 없어요.';return;}route=i;visited.push(i);q('#validation').textContent='';G.sound('tap');paintRoute();});}
 if(m.art)relics();
 if(m.type==='order'){paintOrder();q('#order-reset').onclick=()=>{if(!locked){order=[];paintOrder();}};}
 if(m.type==='route'){paintRoute();q('#route-reset').onclick=()=>{if(!locked){route=20;visited=[20];paintRoute();}};}
 q('#hint-mission').onclick=()=>{root.querySelectorAll('.clue').forEach(x=>x.open=true);q('#validation').textContent=m.hint;};
 q('#submit-mission').onclick=()=>{
  if(locked)return;
  let ok=false,incomplete='',detail='';const picked=[...root.querySelectorAll('input[name=answer]:checked')].map(x=>+x.value);
  if(m.options&&picked.length===0)incomplete='생각한 답을 먼저 골라 주세요. 아직 점수는 변하지 않았어요.';
  if(m.type==='evidence'||m.type==='location')ok=picked[0]===m.answer;
  if(m.type==='multi'){if(picked.length!==m.answers.length)incomplete='설명 두 가지를 골라 주세요. 아직 점수는 변하지 않았어요.';ok=picked.length===m.answers.length&&picked.every(x=>m.answers.includes(x));}
  if(m.type==='match'){const a=[...root.querySelectorAll('[data-match]')].map(x=>x.value);if(a.some(x=>x===''))incomplete='모든 설명을 연결한 뒤 확인해 주세요.';ok=a.every((x,i)=>+x===i);detail=a.map((x,i)=>+x!==i?m.pairs[i][0]:null).filter(Boolean).join(', ');}
  if(m.type==='order'){if(order.length!==m.items.length)incomplete='모든 카드를 놓은 뒤 확인해 주세요.';ok=order.every((x,i)=>x===i)&&order.length===m.items.length;}
  if(m.type==='mosaic'){ok=tiles.every((t,i)=>t===i)&&picked[0]===m.answer;detail=!tiles.every((t,i)=>t===i)?'유물 조각의 위아래와 이어지는 선을 한 번 더 살펴봐.':'유물을 잘 복원했어! 이번에는 설명의 근거를 다시 찾아보자.';}
  if(m.type==='route'){ok=route===4;detail='산성 깃발까지 이어진 길을 더 찾아보자.';}
  if(m.type==='cargo'){const dest=[...root.querySelectorAll('[data-dest]')].map(x=>x.value),trip=[...root.querySelectorAll('[data-trip]')].map(x=>x.value);if([...dest,...trip].some(x=>x===''))incomplete='세 상자의 목적지와 배송 차수를 모두 정해 주세요.';ok=dest[0]==='farm'&&dest[1]==='farm'&&dest[2]==='port'&&trip[0]===trip[1]&&trip[0]!==trip[2];detail='한 배는 한 목적지로 가고, 두 상자까지만 실을 수 있어. 목적지와 짐칸을 함께 확인해 봐.';}
  if(incomplete){q('#validation').textContent=incomplete;return;}
  locked=true;q('#validation').textContent='';q('#submit-mission').disabled=true;
  root.querySelectorAll('.challenge input,.challenge select,.challenge button').forEach(x=>x.disabled=true);
  if(ok){
   if(!practice){G.state.done.push(id);G.state.score+=10;G.save();G.refresh();G.scorePop('+10');}G.sound('win');
   const r=STAR_DATA.regions.find(x=>x.id===m.region),finished=r&&r.missions.every(x=>G.state.done.includes(x));
   G.modal('기록을 되찾았어요!',`<div class="result"><div class="result-star">✦</div><span class="pill">${practice?'연습 완료 · 점수 유지':'미션 성공 · +10점'}</span><h3 style="margin-top:16px">${m.reward}</h3><p>${m.explain}</p>${finished?`<div class="reward-badge">✧ ${r.badge} 획득 · ${r.gift} 전시 완성</div>`:''}<div class="guide-box">${id==='END01'?'모든 기록이 모였어. 루미와 함께 옛사람들의 하루를 되찾은 너는 이제 별빛 수호자야!':G.state.done.length===17?'여섯 지역의 기록을 다 모았어! 박물관에서 마지막 특별전을 열어 보자.':'점수보다 더 오래 남는 보물, 네가 찾은 근거를 탐험 수첩에 적어 두었어.'}</div><div class="modal-actions"><button class="btn gold" id="return-world">${id==='END01'?'탐험 결과 보기':'탐험 계속하기'}</button><button class="btn light" id="visit-museum">박물관 보기</button></div></div>`,'삼국시대 시간탐험대');
   q('#return-world').onclick=()=>{if(id==='END01'){G.finish();return;}G.close();if(finished)G.toast('지역 탐험 완료! 시간 지도로 다음 여행지를 골라 보세요.');};q('#visit-museum').onclick=G.museum;
  }else{
   const atFloor=G.state.score===0;
   if(!practice){G.state.score=Math.max(0,G.state.score-10);G.state.failures++;G.save();G.refresh();G.scorePop(atFloor?'0점 유지':'−10');}G.sound('oops');
   q('#mission-feedback').innerHTML=`<div class="feedback wrong"><strong>${practice?'연습 중이에요 · 점수 유지':atFloor?'조금만 더 살펴보자 · 최소 0점 유지':'조금만 더 살펴보자 · −10점'}</strong><p>${detail&&m.type==='match'?'다시 볼 연결: '+escape(detail)+'. ':escape(detail)} ${m.hint}</p><button class="btn small light" id="retry-mission" style="margin-top:13px">단서를 보고 다시 도전</button></div>`;
   q('#retry-mission').onclick=()=>{locked=false;root.querySelectorAll('.clue').forEach(x=>x.open=true);q('#mission-feedback').innerHTML='';q('#submit-mission').disabled=false;root.querySelectorAll('.challenge input,.challenge select,.challenge button').forEach(x=>x.disabled=false);if(m.type==='order')paintOrder();if(m.type==='route')paintRoute();if(m.type==='mosaic')paintTiles();q('#validation').textContent='고른 답과 조각은 그대로 두었어. 필요한 부분을 수정해 보자.';};
   q('#mission-feedback').scrollIntoView({block:'nearest',behavior:'smooth'});
  }
 };
};
