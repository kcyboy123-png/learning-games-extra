'use strict';
// Page numbers refer to the printed pages of the supplied society_5-2-1.pdf.
// Buyeo County's original photo, shown whole and unaltered (KOGL Type 3: attribution, no derivatives).
const STONE_PAGODA={art:'assets/jeongnimsa-buyeo-original.jpg',alt:'다섯 층의 지붕돌이 있는 석탑 사진',credit:{text:'사진: 부여군 · 공공누리 제3유형',title:'출처: 부여군 · 공공누리 제3유형(출처표시·변경금지)',href:'https://www.buyeo.go.kr/html/tour/info/info_010102.html'},note:'실제 석탑을 찍은 사진이에요. 누르면 크게 볼 수 있어요.'};
window.STAR_REVIEWS={
 gojoseon:[
  {id:'GJ-R1',page:'20',art:'dolmen',alt:'받침돌 위에 넓은 덮개돌을 얹은 고인돌 그림',kind:'핵심 확인',question:'고인돌은 무엇을 하려고 만든 시설일까요?',choices:['곡식을 보관하는 창고','사람이 죽으면 묻는 무덤','철을 녹여 만드는 대장간','배가 물건을 싣는 나루터'],answer:1,hint:'지배자나 마을 사람이 죽었을 때 만들었어요.',explain:'고인돌은 청동기 시대에 지배자나 마을 사람을 묻기 위해 만든 무덤이에요.'},
  {id:'GJ-R2',page:'20',art:'assets/commoners-v3.png',alt:'여러 마을 사람이 함께 밧줄을 당기는 그림',kind:'체험의 의미',question:'큰 고인돌을 만들었다는 사실로 짐작할 수 있는 것은?',choices:['철로 만든 농기구가 널리 쓰였다','모든 사람이 똑같은 재산을 가졌다','많은 사람을 모을 지배자가 있었다','고인돌은 한 사람이 혼자 만들었다'],answer:2,hint:'우리가 큰 돌을 옮기려고 사람들의 힘을 모았던 장면을 떠올려 봐.',explain:'큰 돌을 옮기는 데 많은 사람이 필요했으므로, 이들을 모을 수 있는 지배자가 있었음을 짐작해요.'},
  {id:'GJ-R3',page:'25',scene:0,alt:'팔에 붕대를 감은 사람이 곡식 자루를 받는 장면',kind:'자료로 정리',question:'“남을 다치게 하면 곡식으로 갚는다.” 이 법에서 알 수 있는 것은?',choices:['농사·노동력·개인의 재산을 중시했다','곡식은 다른 나라에서만 들여왔다','사냥만 하며 농사를 짓지 않았다','모든 물건을 공동으로 소유했다'],answer:0,hint:'갚아야 할 물건이 곡식이고, 다친 사람은 일을 하기 어려워져요.',explain:'곡식으로 보상한 법을 통해 농사를 짓고 노동력을 중시했으며 개인의 재산을 인정했음을 알 수 있어요.'}
 ],
 goguryeo:[
  {id:'GG-R1',page:'29',art:'assets/goguryeo-jangsu-v17.webp',alt:'고구려 성 앞에 서 있는 왕을 상상해 그린 학습용 그림',kind:'핵심 확인',question:'고구려의 수도를 평양으로 옮긴 왕은 누구일까요?',choices:['근초고왕','진흥왕','광개토대왕','장수왕'],answer:3,hint:'광개토대왕의 뒤를 이은 왕이에요.',explain:'장수왕은 수도를 평양으로 옮긴 뒤 한강 유역을 모두 차지했어요.'},
  {id:'GG-R2',page:'35',art:'assets/mural-v3.png',alt:'팔을 뻗어 춤추는 사람들을 학습용으로 다시 그린 벽화 그림',kind:'체험의 의미',question:'복원한 무용총 벽화에서 살펴볼 수 있는 생활 모습은?',choices:['철로 만든 갑옷을 파는 모습','바지와 저고리를 입고 춤추는 모습','기와집의 기둥을 세우는 모습','강에서 교역 상자를 옮기는 모습'],answer:1,hint:'그림 속 사람들의 옷과 팔의 움직임을 살펴봐.',explain:'교과서는 무용총 벽화에서 바지와 저고리를 입고 노래하며 춤추는 고구려 사람들을 소개해요.'},
  {id:'GG-R3',page:'29',art:'assets/kings-v11.png',alt:'고구려의 두 왕을 나란히 상상해 그린 초상',caption:'광개토대왕과 장수왕을 표현한 상상 초상',note:'두 왕을 상상해 그린 그림이에요. 실제 비석 사진이 아니에요.',kind:'자료로 정리',question:'광개토대왕릉비를 세운 까닭은 무엇일까요?',choices:['가야의 철 생산량을 기록하려고','신라의 화랑 규칙을 알리려고','광개토대왕의 업적을 기리려고','백제의 수도 이전을 기념하려고'],answer:2,hint:'장수왕이 아버지를 위해 세운 비석이에요.',explain:'장수왕은 아버지 광개토대왕의 업적을 기리려고 광개토대왕릉비를 세웠어요.'}
 ],
 baekje:[
  {id:'BJ-R1',page:'36',art:STONE_PAGODA.art,alt:STONE_PAGODA.alt,credit:STONE_PAGODA.credit,note:STONE_PAGODA.note,kind:'핵심 확인',question:'우리가 다섯 층으로 쌓은 백제의 문화유산은?',choices:['부여 정림사지 오층 석탑','경주 불국사 다보탑','경주 불국사 삼층 석탑','경주 첨성대'],answer:0,hint:'이름에는 유적이 있는 ‘부여’와 절터 이름이 들어가요.',explain:'부여 정림사지 오층 석탑은 백제의 불교문화를 보여 주는 유산이에요.'},
  {id:'BJ-R2',page:'38',art:'incense',alt:'꼭대기에 봉황, 산 모양 뚜껑, 용 받침이 있는 향로 그림',kind:'체험의 의미',question:'백제 금동대향로는 주로 어디에서 쓰였을 것으로 짐작할까요?',choices:['시장에서 곡식의 양을 잴 때','나루터에서 배의 방향을 정할 때','대장간에서 철을 녹일 때','절에서 제사를 지낼 때'],answer:3,hint:'향을 피우는 물건이며, 부여의 옛 절터에서 발견됐어요.',explain:'교과서는 왕족이 절에서 제사를 지낼 때 백제 금동대향로를 사용했을 것으로 짐작해요.'},
  {id:'BJ-R3',page:'36',art:STONE_PAGODA.art,alt:STONE_PAGODA.alt,credit:STONE_PAGODA.credit,note:STONE_PAGODA.note,kind:'자료로 정리',question:'삼국 시대에 절·탑·불상이 많이 만들어진 까닭은?',choices:['모든 사람의 집을 돌로 지어서','불교를 받아들였기 때문에','무덤을 만들지 않게 되어서','철을 구할 수 없게 되어서'],answer:1,hint:'부처의 가르침을 따르는 종교와 관련 있어요.',explain:'삼국은 백성의 마음을 모으고 왕권을 강화하려고 불교를 받아들였고, 절·탑·불상을 만들었어요.'}
 ],
 gaya:[
  {id:'GY-R1',page:'37',art:'item:4',alt:'끈으로 묶은 납작한 금속 덩어리 그림',kind:'핵심 확인',question:'가야가 특히 뛰어난 기술로 다루었던 재료는?',choices:['청동','금','철','옥'],answer:2,hint:'우리가 대장간에서 두드리고 교역 배에 실었던 재료예요.',explain:'철이 많이 나는 지역의 가야는 철을 다루는 기술이 뛰어났어요.'},
  {id:'GY-R2',page:'37',art:'item:6',alt:'짐을 실을 수 있는 나무배 그림',kind:'체험의 의미',question:'가야는 철로 만든 물건을 어떻게 다른 나라에 수출했을까요?',choices:['강이나 바닷길을 이용했다','산속 창고에 보관만 했다','외국과의 교류를 금지했다','이웃 나라의 길을 모두 막았다'],answer:0,hint:'짐을 실었던 교역 배가 어디로 움직이는지 떠올려 봐.',explain:'가야는 강이나 바다를 통해 철로 만든 물건을 다른 나라에 수출했어요.'},
  {id:'GY-R3',page:'37',art:'item:4',alt:'끈으로 묶은 납작한 덩이쇠 그림',kind:'자료로 정리',question:'가야의 덩이쇠는 물건을 사고팔 때 무엇처럼 쓰였을까요?',choices:['관측 도구','옷감','장신구','화폐'],answer:3,hint:'물건을 살 때 내는 돈의 역할을 떠올려 봐.',explain:'가야에서는 덩이쇠를 화폐처럼 사용했어요.'}
 ],
 silla:[
  {id:'SL-R1',page:'35',art:'crown',alt:'나뭇가지 모양 장식과 굽은옥이 달린 금관 그림',kind:'핵심 확인',question:'삼국 시대에 금·은 장신구로 몸을 꾸민 사람들은?',choices:['왕족과 귀족','농사를 짓던 모든 평민','주인집에서 일하던 노비','신분과 관계없이 모든 사람'],answer:0,hint:'신분에 따라 옷과 장신구가 달랐다는 점을 생각해 봐.',explain:'삼국 시대의 왕족과 귀족은 금과 은으로 만든 장신구로 몸을 꾸몄어요.'},
  {id:'SL-R2',page:'36',art:'assets/baedong-triad-v3.png',alt:'돌을 깎아 만든 세 구의 서 있는 불상 그림',kind:'체험의 의미',question:'우리가 흙을 털어 찾아낸 불상은 어떤 종교와 관련 있을까요?',choices:['유교','불교','도교','천주교'],answer:1,hint:'절과 탑, 부처의 모습을 만든 조각이 함께 떠오르는 종교예요.',explain:'삼국 시대에 불교를 받아들이면서 절과 탑, 불상이 많이 만들어졌어요.'},
  {id:'SL-R3',page:'35~38',art:'crown',alt:'나뭇가지 모양 장식과 굽은옥이 달린 금관 그림',kind:'자료로 정리',question:'금관·불상 같은 유물을 자세히 살펴보는 까닭은?',choices:['모든 유물이 같은 재료인지 확인하려고','게임 그림만으로 실제 모습을 확정하려고','오늘날의 물건 가격을 정하려고','옛사람들의 생활과 생각을 알아보려고'],answer:3,hint:'장신구는 신분을, 불상은 믿음을 짐작하게 해 줘요.',explain:'유물의 특징과 쓰임을 조사하면 옛사람들의 생활과 생각을 짐작할 수 있어요.'}
 ],
 hangang:[
  {id:'HG-R1',page:'30',art:'assets/hangang-v2.png',alt:'가운데로 강이 흐르고 강가에 마을과 밭이 있는 그림',kind:'핵심 확인',question:'한강 유역을 차지한 백제가 빠르게 성장한 까닭은?',choices:['산이 높아 다른 나라와 만나기 어려워서','넓은 평야와 교류하기 좋은 위치 덕분에','바다가 없어서 다른 나라가 오지 못해서','곡식을 기를 땅이 거의 없었기 때문에'],answer:1,hint:'우리가 연결한 들판과 물길의 역할을 떠올려 봐.',explain:'한강 유역은 넓은 평야가 있어 농사짓기 좋고 다른 나라와 교류하기에도 편리했어요.'},
  {id:'HG-R2',page:'29',art:'assets/goguryeo-jangsu-v17.webp',alt:'고구려 성 앞에 서 있는 왕을 상상해 그린 학습용 그림',kind:'체험의 의미',question:'장수왕이 수도를 평양으로 옮긴 뒤 모두 차지한 곳은?',choices:['낙동강 유역','일본 열도','한강 유역','제주도'],answer:2,hint:'우리가 세 나라의 변화를 비교하던 강 주변이에요.',explain:'고구려의 장수왕은 평양으로 수도를 옮긴 뒤 한강 유역을 모두 차지했어요.'},
  {id:'HG-R3',page:'31',art:'item:6',alt:'강을 오가는 나무배 그림',kind:'자료로 정리',question:'신라는 한강 유역을 차지한 뒤 무엇을 할 수 있게 됐을까요?',choices:['중국과 직접 교류하기','가야 연맹을 처음 세우기','고조선의 수도를 옮기기','철기 문화를 처음 시작하기'],answer:0,hint:'강과 바다를 통해 다른 나라로 가는 길이 열렸어요.',explain:'신라는 한강 유역을 차지하면서 중국과 직접 교류할 수 있게 됐어요.'}
 ]
};
window.installReviewV4=function(G){
 const D=STAR_DATA,bank=STAR_REVIEWS,$=s=>document.querySelector(s),region=id=>D.regions.find(r=>r.id===id);
 G.reviewCount=id=>bank[id].filter(q=>G.state.reviewed.includes(q.id)).length;
 G.regionMissionsDone=id=>region(id).missions.every(mid=>G.state.done.includes(mid));
 G.regionComplete=id=>G.regionMissionsDone(id)&&G.reviewCount(id)===3;
 G.readyForFinal=()=>D.regions.every(r=>G.regionComplete(r.id));
 G.journeyComplete=()=>G.state.done.length===D.missions.length&&G.readyForFinal();
 G.reviewLink=id=>`<button class="btn light small review-link" data-review="${id}" ${G.regionMissionsDone(id)?'':'disabled'}>✦ 여행의 기억 ${G.reviewCount(id)}/3${G.reviewCount(id)===3?' · 다시 읽기':''}</button>`;
 G.bindReviews=()=>document.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>G.openReview(b.dataset.review));
 G.continueJourney=id=>{if(G.regionMissionsDone(id)&&G.reviewCount(id)<3)G.openReview(id);else if(G.journeyComplete())G.ending();else if(G.readyForFinal())playMission(G,'END01');else G.close();};
 G.openReview=id=>{
  if(!bank[id]||!G.regionMissionsDone(id)){G.toast('이 여행지의 미션을 먼저 마쳐 주세요.');return;}
  const r=region(id);if(G.reviewCount(id)===3){summary(id);return;}
  const index=bank[id].findIndex(q=>!G.state.reviewed.includes(q.id)),q=bank[id][index];let selected=null,locked=false,disposed=false;
  // Shuffle once per question opening; chosen option indices retain their original meaning.
  const order=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  G.modal(r.name+' · 여행의 기억',`<section class="review"><div class="review-guide"><img src="assets/lumi.png" alt="루미"><p>손으로 찾은 이야기를<br><strong>우리의 기억으로 남겨 보자!</strong></p><span class="pill">${index+1} / 3</span></div><div class="review-dots">${bank[id].map((x,i)=>`<span class="${i<index?'done':i===index?'current':''}">${i<index?'✓':i+1}</span>`).join('')}</div><button type="button" class="review-picture" id="review-picture" aria-label="크게 보기: ${q.alt}"><i class="check-zoom-mark" aria-hidden="true">🔍</i></button>${q.credit?`<p class="review-caption"><a href="${q.credit.href}" target="_blank" rel="noopener noreferrer" title="${q.credit.title}">${q.credit.text}</a></p>`:q.caption?`<p class="review-caption">${q.caption}</p>`:''}<div class="review-kind">${q.kind}</div><h3 id="review-question">${q.question}</h3><div class="review-choices" role="group" aria-labelledby="review-question">${order.map((n,i)=>`<button class="review-choice" data-answer="${n}" aria-pressed="false"><span>${i+1}</span><b>${q.choices[n]}</b><i aria-hidden="true"></i></button>`).join('')}</div><div class="review-feedback" id="review-feedback" role="status" aria-live="polite"></div><div class="review-actions"><button class="btn gold" id="review-submit" disabled>이 답으로 확인</button><button class="hint-button" id="review-hint">힌트 보기 <b>−3점</b></button></div><p class="review-hint" id="review-hint-text" hidden></p><p class="review-footnote">${q.note||'그림은 탐험에서 만난 학습용 일러스트예요. 누르면 크게 볼 수 있어요.'}</p></section>`,'첫 정답 +10 · 오답 −10 · 힌트 −3');
  const review=$('.review'),visual=document.createElement('div'),question=document.createElement('div');visual.className='review-visual';question.className='review-question-panel';
  for(const node of [...review.children]){(node.matches('.review-guide,.review-dots,.review-picture,.review-caption,.review-footnote')?visual:question).append(node);}review.append(visual,question);
  let zoomView=null;const unzoom=()=>{const v=zoomView;zoomView=null;if(v?.open)v.close();v?.remove();};
  $('#modal').classList.add('review-modal');G.audio.setScene('review');G.cleanupMission=()=>{disposed=true;unzoom();$('#modal').classList.remove('review-modal');G.audio.setScene('exploration');};G.sound('page');
  const box=$('#review-picture'),paint=html=>{if(!disposed&&box.isConnected)box.insertAdjacentHTML('afterbegin',html);};
  if(q.art==='dolmen'){G.item(8).then(src=>paint(`<div class="review-dolmen"><img class="dolmen-leg leg-left" src="${src}" alt=""><img class="dolmen-leg leg-right" src="${src}" alt=""><img class="dolmen-top" src="${src}" alt=""></div>`));}else if(q.scene!==undefined)paint(`<span class="life-scene" style="background-position:${q.scene%2*100}% ${Math.floor(q.scene/2)*100}%"></span>`);else{const promise=q.art.startsWith('item:')?G.item(+q.art.slice(5)):['crown','incense'].includes(q.art)?G.relic(q.art):Promise.resolve(q.art);promise.then(src=>paint(`<img src="${src}" alt="${q.alt}">`));}
  // Same enlarged view as the picture checks; the chosen answer, feedback and score are untouched.
  box.onclick=()=>{const art=box.querySelector(':scope>img,:scope>.review-dolmen,:scope>.life-scene');if(disposed||zoomView||!art)return;zoomView=G.zoomPicture(box,art.cloneNode(true),q.credit?.text||q.caption,q.caption||q.alt,()=>{zoomView=null;return !disposed;});};
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(locked)return;selected=+b.dataset.answer;document.querySelectorAll('[data-answer]').forEach(e=>{e.setAttribute('aria-pressed',String(e===b));e.classList.toggle('selected',e===b);});$('#review-submit').disabled=false;G.sound('tap');});
  $('#review-hint').onclick=()=>{if(locked||$('#review-hint').disabled)return;G.penalty(3,'hint');$('#review-hint').disabled=true;$('#review-hint').textContent='힌트 확인 완료';$('#review-hint-text').hidden=false;$('#review-hint-text').textContent=q.hint;G.sound('page');};
  $('#review-submit').onclick=()=>{
   if(locked||selected===null||disposed)return;locked=true;document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);$('#review-submit').hidden=true;$('#review-hint').hidden=true;
   const chosen=$(`[data-answer="${selected}"]`),feedback=$('#review-feedback');
   if(selected===q.answer){
    const fresh=!G.state.reviewed.includes(q.id);if(fresh){G.state.reviewed.push(q.id);G.state.score+=10;G.save();G.refresh();G.scorePop('+10');}
    chosen.classList.add('correct');chosen.querySelector('i').textContent='✓';G.sound('correct');feedback.className='review-feedback correct';feedback.innerHTML=`<strong>기억이 반짝! ${fresh?'+10점':'확인 완료'}</strong><p>${q.explain}</p><small>교과서 ${q.page}쪽</small><button class="btn gold" id="review-next">${index===2?'이 여행의 기억 완성하기':'다음 기억으로'}</button>`;
    $('#review-next').onclick=()=>G.reviewCount(id)===3?summary(id):G.openReview(id);
   }else{
    const deducted=G.penalty(10,'failure');chosen.classList.add('wrong');chosen.querySelector('i').textContent='×';G.sound('oops');feedback.className='review-feedback wrong';feedback.innerHTML=`<strong>한 번 더 생각해 보자 · ${deducted?'−'+deducted+'점':'0점 유지'}</strong><p>${q.hint}</p><small>교과서 ${q.page}쪽</small><button class="btn light" id="review-retry">다시 골라 보기</button>`;
    $('#review-retry').onclick=()=>{locked=false;selected=null;feedback.innerHTML='';feedback.className='review-feedback';document.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=false;b.classList.remove('selected','wrong');b.setAttribute('aria-pressed','false');b.querySelector('i').textContent='';});$('#review-submit').hidden=false;$('#review-submit').disabled=true;$('#review-hint').hidden=false;$('#review-question').scrollIntoView({block:'nearest'});};
   }
   feedback.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
 };
 function summary(id){const r=region(id),all=G.readyForFinal();
  G.modal(r.name+'의 기억을 되찾았어!',`<section class="review-summary"><span class="review-seal">✦</span><span class="pill">미션 완료 · 기억 3/3</span><h3>${r.badge}</h3><p>이제 네 발견이 박물관의 한 전시실이 되었어.</p><div class="review-takeaways">${bank[id].map(q=>`<article><span>✓</span><div><p>${q.explain}</p><small>교과서 ${q.page}쪽</small></div></article>`).join('')}</div><div class="modal-actions"><button class="btn gold" id="review-continue">${G.journeyComplete()?'완성한 모험의 엔딩으로':all?'마지막 특별전으로':'다음 여행지 고르기'}</button><button class="btn light" id="review-museum">내 전시실 보러 가기</button></div></section>`,'루미의 여행 기록 · 전시 완성');
  G.sound('region');$('#review-continue').onclick=()=>G.journeyComplete()?G.ending():all?playMission(G,'END01'):G.regions();$('#review-museum').onclick=G.museum;
 }
};
