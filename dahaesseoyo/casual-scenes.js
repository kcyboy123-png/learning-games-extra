(function(root){
'use strict';
const e=DrawerActivities.esc,A='assets/casual-v1/';
const img=(name,alt)=>`<img src="${A+name}.webp" alt="${e(alt)}" decoding="async">`;
const tag=(x,y,s,cls='')=>`<span class="scene-tag ${cls}" style="left:${x}%;top:${y}%">${e(s)}</span>`;
const frame=(name,alt,overlay='',caption='')=>`<figure class="casual-scene"><div class="scene-art">${img(name,alt)}${overlay}</div>${caption?`<figcaption>${e(caption)}</figcaption>`:''}</figure>`;
const facts=q=>q.visual?.type==='cards'?`<section class="scene-facts garden-conditions" aria-label="문제 조건"><b>꼭 살펴볼 조건</b><ul>${q.visual.items.map(s=>`<li>${e(s)}</li>`).join('')}</ul></section>`:'';
const visibleFacts=q=>`<section class="garden-conditions" aria-label="문제 조건"><b>꼭 살펴볼 조건</b><ul>${q.visual.items.map(s=>`<li>${e(s)}</li>`).join('')}</ul></section>`;
const rowLabels=(items,y=85)=>items.map((s,j)=>tag((j+.5)*100/items.length,y,s,'panel-label')).join('');
const icon=(n,x,y,w=68)=>`<svg x="${x-w/2}" y="${y-w+12}" width="${w}" height="${w}" viewBox="${n%4*100} ${[0,108,210][Math.floor(n/4)]} 100 ${[106,100,90][Math.floor(n/4)]}"><image href="${A}mapkit.webp" width="400" height="300"/></svg>`;
const label=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${e(s)}</text>`;
function mapScene(nodes,roads,caption,extra=''){
 return `<figure class="casual-scene village-map"><svg viewBox="0 0 400 280" role="img" aria-label="${e(caption)}"><rect class="map-grass" x="0" y="0" width="400" height="280" rx="18"/>${roads.map(([a,b,closed,note])=>{const p=nodes[a],q=nodes[b];return `<path class="${closed?'closed-path':'village-path'}" d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}"/>${note?label((p[0]+q[0])/2,(p[1]+q[1])/2-8,note):''}`;}).join('')}${extra}${nodes.map(([x,y,n,s,w])=>icon(n,x,y,w)+label(x,y+28,s)).join('')}</svg><figcaption>${e(caption)}</figcaption></figure>`;
}
function garden(q,selected=[],interactive=false){
 const total=q.total||20,cols=q.cols||5,rows=total/cols;
 return `<figure class="casual-scene garden-scene"><div class="garden-stage">${img('garden','나무 테두리 안의 흙 화단')}<div class="garden-cells" style="--garden-cols:${cols};--garden-rows:${rows}" ${interactive?'':'aria-label="같은 크기 '+total+'칸인 화단"'}>${Array.from({length:total},(_,n)=>{const on=selected.includes(n);return interactive?`<button class="garden-cell ${on?'planted':''}" data-action="cell" data-value="${n}" aria-label="화단 ${Math.floor(n/cols)+1}행 ${n%cols+1}열" aria-pressed="${on}">${on?img('flower','심은 안개꽃'):'<span aria-hidden="true">＋</span>'}</button>`:`<span class="garden-cell ${on?'planted':''}" aria-hidden="true">${on?img('flower',''):''}</span>`;}).join('')}</div></div><figcaption>${interactive?`심은 칸 ${selected.length} / 전체 ${total}칸 · 다시 누르면 취소돼요.`:'전체 '+total+'칸 · 한 칸의 크기는 모두 같아요.'}</figcaption></figure>`;
}
function flagScene(stage,selected=[],interactive=false){
 const cells=Array.from({length:20},(_,n)=>{const center=n%5===2,on=selected.includes(n),cls=`flag-cell ${center?'flag-center':''} ${on?'painted':''}`;
  return interactive?`<button class="${cls}" data-action="cell" data-value="${n}" aria-pressed="${on}" aria-label="위에서 ${Math.floor(n/5)+1}번째, 왼쪽에서 ${n%5+1}번째 칸" ${center?'disabled':''}>${on?'◆':center?'':'＋'}</button>`:`<span class="${cls}" aria-hidden="true">${on?'◆':''}</span>`;
 }).join('');
 return `<figure class="casual-scene flag-scene"><div class="flag-stage">${img('seaside-flag-v2','바닷가에 세운 천 깃발')}<div class="flag-cells">${cells}</div>${stage===0?['A','B','C'].map((s,j)=>`<div class="flag-fold-option" style="left:${36.8+j*12.6}%"><b>${s}</b></div>`).join(''):'<div class="flag-axis"><span>가운데</span></div><div class="flag-side flag-left">왼쪽</div><div class="flag-side flag-right">오른쪽</div>'}</div><figcaption>${stage===0?'A · B · C는 접는 선의 후보예요. 양쪽의 너비를 비교해요.':interactive?`왼쪽 ${selected.filter(n=>n%5<2).length}칸 · 오른쪽 ${selected.filter(n=>n%5>2).length}칸 / 목표: 각각 5칸`:'색칠한 무늬에 가운데 빈칸 4개를 더 칠하려 해요.'}</figcaption></figure>`;
}
root.ThinkstarCasual={garden,render(m,q,i,answers=[]){
 const id=m?.id;let html=null;
 if(id==='cs-truth-clue'&&q.type!=='truth')return '<section class="truth-guide"><b>이번에는 번호 5를 확인해요</b><div class="candidate-cards"><span>5</span></div><p>아래 세 친구의 말에 5를 하나씩 넣어 보세요. 맞는 말이 몇 개인지 세어 조건과 비교해요.</p></section>';
 if(id==='csx-31')return i===1?'':flagScene(i,i===2?(answers[1]?.selected?.length===10?answers[1].selected:[0,4,5,9,6,8,10,14,16,18]):[]);
 if(id==='csx-23')return frame('combination-lock-v2','세 개의 숫자판이 있는 잠긴 자물쇠',tag(38.5,61,'?','lock-digit')+tag(49.5,61,'?','lock-digit')+tag(60.5,61,'?','lock-digit'),'백의 자리 · 십의 자리 · 일의 자리, 세 숫자를 찾아요.');
 if(id==='g4-01'){
  let drawing='';
  if(i===0)drawing='<path class="angle-known" d="M240 230L330 230A90 90 0 0 0 270.78 145.43Z"/><path class="angle-unknown" d="M240 230L270.78 145.43A90 90 0 0 0 150 230Z"/><path class="geometry-line" d="M55 230H425M240 230L303.27 56.16"/><circle cx="240" cy="230" r="5" fill="#234f48"/><text x="310" y="205">70°</text><text x="195" y="177">?</text>';
  if(i===1)drawing='<path class="angle-unknown" d="M90 250L390 250L199.81 59.81Z"/><path class="geometry-line" d="M90 250L390 250L199.81 59.81Z"/><path class="angle-arc" d="M135 250A45 45 0 0 0 112.5 211.03M345 250A45 45 0 0 1 358.18 218.18"/><text x="141" y="231">60°</text><text x="329" y="231">45°</text><text x="205" y="111">?</text>';
  if(i===2)drawing='<circle cx="240" cy="162" r="116" fill="#b7784d" stroke="#805035" stroke-width="5"/><circle cx="240" cy="157" r="109" fill="#fff0ce" stroke="#f3c7a8" stroke-width="10"/><path class="angle-known" d="M240 157L349 157A109 109 0 0 0 294.5 62.60Z"/>'+Array.from({length:6},(_,n)=>`<path class="cake-cut" d="M240 157L${240+109*Math.cos(n*Math.PI/3)} ${157+109*Math.sin(n*Math.PI/3)}"/>`).join('')+'<text x="282" y="140">?</text><circle cx="240" cy="157" r="4" fill="#855632"/>';
  return `<figure class="casual-scene geometry-study"><svg viewBox="0 0 480 310" role="img" aria-label="${e(q.title)}"><image href="${A}math-desk-v2.webp" width="480" height="310" preserveAspectRatio="xMidYMid slice"/><g>${drawing}</g></svg><figcaption>${['직선 위의 두 각을 더하면 180°예요.','삼각형의 세 각을 더하면 180°예요.','가운데에서 똑같이 나눈 여섯 조각이에요. 한 바퀴는 360°예요.'][i]}</figcaption></figure>`+visibleFacts(q);
 }
 if(id==='g4-04'){
  const legend=i===2?[['■','학교'],['○','병원'],['▲','산']]:[['★','학교'],['♥','병원'],['●','우체국'],['▲','산']];
  const places=i===2?[[95,85,'■'],[315,170,'○'],[370,65,'▲']]:[[90,80,'★'],[210,65,'★'],[95,205,'★'],[310,95,'♥'],[270,215,'♥'],[190,150,'●'],[390,200,'▲']];
  return `<figure class="casual-scene legend-map"><div class="map-sheet-title">${i===2?'옆 마을 지도':'우리 마을 지도'}<span>북 ↑</span></div><svg viewBox="0 0 480 285" role="img" aria-label="${i===2?'집 옆에 ○ 기호, 다른 곳에 ■와 ▲ 기호가 있는 지도':'학교 기호 ★ 3개, 병원 기호 ♥ 2개, 우체국 기호 ● 1개, 산 기호 ▲ 1개가 있는 지도'}"><image href="${A}map-meadow-v2.webp" width="480" height="285" preserveAspectRatio="xMidYMid slice"/><path class="legend-road" d="M45 140H435M150 35V250M350 35V250"/>${places.map(([x,y,s])=>`<g class="map-symbol" transform="translate(${x} ${y})"><circle r="26"/><text y="10">${s}</text></g>`).join('')}${i===2?'<g class="map-home"><path d="M209 169L234 145L259 169V205H209Z"/><text x="234" y="226">우리 집</text></g>':''}</svg><div class="map-legend"><b>범례</b>${legend.map(([s,n])=>`<span><strong>${s}</strong> ${n}</span>`).join('')}</div><figcaption>이 활동의 지도에서 사용하는 기호예요. 지도와 범례를 함께 살펴봐요.</figcaption></figure>`;
 }
 if(id==='g4-13'){
  const counts=i===2?[0,0]:[9,0,8,0],positions=[[35,37],[50,35],[65,37],[28,45],[43,43],[58,44],[72,45],[38,51],[59,51]];
  return `<figure class="casual-scene seed-experiment"><div class="seed-pots">${counts.map((count,j)=>`<div class="seed-record"><b>${i===2?'실험 화분 '+(j+1):['A','B','C','D'][j]}</b><div class="seed-pot-art">${img('pot-v2','흙을 담은 화분')}${positions.slice(0,count).map(([x,y])=>`<img class="seed-sprout" style="left:${x}%;top:${y}%" src="${A}sprout-v2.webp" alt="싹 한 개">`).join('')}</div>${i===2?'<p>바꿀 조건을 생각해요</p>':`<p>물 ${j%2===0?'줌':'안 줌'} · 빛 ${j<2?'있음':'없음'}</p><strong>싹 ${count}개 <small>/ 씨앗 10개</small></strong>`}</div>`).join('')}</div><figcaption>${i===2?'같은 종류의 씨앗을 같은 수만큼 준비해요.':'7일 뒤의 관찰 기록 · 싹 그림은 개수를 나타내요. 온도와 공기 등 나머지 조건은 같아요.'}</figcaption></figure>`+(i===2?visibleFacts(q):'');
 }
 if(id==='g4-22'){
  let paper='';
  if(i<2){const layers=i===0?2:4;paper=Array.from({length:layers},(_,n)=>`<image href="${A}paper-sheet-v2.webp" x="${112+n*8}" y="${38+n*8}" width="220" height="220"/>`).join('')+`<circle class="punched-hole" cx="195" cy="150" r="12"/>`+(i===1?'<circle class="punched-hole" cx="280" cy="215" r="12"/>':'')+`<text x="240" y="302">접힌 종이 ${layers}겹 · 뚫은 곳 ${i===0?1:2}곳</text>`;}
  else paper='<image href="'+A+'paper-sheet-v2.webp" x="28" y="70" width="424" height="140" preserveAspectRatio="none"/>'+Array.from({length:8},(_,n)=>`<rect class="fold-cell" x="${32+n*52}" y="80" width="52" height="120"/>${label(58+n*52,117,n+1)}`).join('')+'<path class="fold-line" d="M240 55V220"/><text x="240" y="35">접는 선</text><circle class="punched-hole" cx="110" cy="160" r="9"/><path class="fold-arrow" d="M60 249Q240 320 419 249M404 246L419 249L413 264"/><text x="240" y="310">왼쪽 절반을 오른쪽으로 접어요</text>';
  return `<figure class="casual-scene paper-study"><svg viewBox="0 0 480 330" role="img" aria-label="${e(q.title)}"><image href="${A}math-desk-v2.webp" width="480" height="330" preserveAspectRatio="xMidYMid slice"/>${paper}</svg><figcaption>구멍은 모든 겹을 끝까지 뚫어요. 접힌 선과 가장자리는 피하고 서로 겹치지 않아요.</figcaption></figure>`+visibleFacts(q);
 }
 if(id==='g4-37')return `<figure class="casual-scene mystery-boxes"><div class="chest-row">${['A','B','C'].slice(0,i===1?3:2).map((name,j)=>`<div><span class="prop-chest" style="background-position:${j*100/3}% 50%" role="img" aria-label="닫힌 상자 ${name}"></span><b>상자 ${name}</b></div>`).join('')}</div><figcaption>상자는 닫혀 있어요. 쪽지의 내용과 조건으로 추리해요.</figcaption></figure>`+visibleFacts(q);
 if(id==='g4-45'){
  const [cols,rows]=[[4,3],[3,3],[5,4]][i],tile=i===2?3:2,unit=48,x=(360-cols*unit)/2;
  return `<figure class="casual-scene tile-study"><svg viewBox="0 0 360 365" role="img" aria-label="가로 ${cols}칸 세로 ${rows}칸 바닥, 타일 한 장은 ${tile}칸"><image href="${A}math-desk-v2.webp" width="360" height="365" preserveAspectRatio="xMidYMid slice"/><text x="180" y="35">덮을 바닥 · 가로 ${cols}칸</text>${Array.from({length:cols*rows},(_,n)=>`<rect class="floor-cell" x="${x+n%cols*unit}" y="${54+Math.floor(n/cols)*unit}" width="${unit}" height="${unit}"/>`).join('')}<text x="${x-38}" y="${54+rows*unit/2}" class="tile-side-label">${rows}칸</text><text x="180" y="262">타일 한 장</text><image href="${A}tile-slab-v2.webp" x="${180-tile*unit/2}" y="276" width="${tile*unit}" height="48" preserveAspectRatio="none"/>${Array.from({length:tile-1},(_,n)=>`<path class="tile-unit" d="M${180-tile*unit/2+(n+1)*unit} 278V322"/>`).join('')}<text x="180" y="347">같은 크기의 ${tile}칸을 덮어요</text></svg><figcaption>바닥과 타일의 한 칸 크기는 같아요. 타일을 자르거나 겹치지 않아요.</figcaption></figure>`+(q.visual?.items?visibleFacts(q):'');
 }
 if(id==='g4-47')return `<figure class="reading-feature"><img src="assets/lesson-v3/scene-2.webp?v=2" alt="책을 함께 읽으며 문장의 뜻을 살펴보는 두 친구"><figcaption>문장 속에서 낱말의 뜻을 찾아봐요.</figcaption></figure>`;
 if(id==='g4-60')return `<figure class="casual-scene robot-coordinate-scene"><svg viewBox="0 0 480 390" role="img" aria-label="가로 세로 각 5칸. 로봇은 가로1 세로1에서 출발해요"><image href="${A}map-meadow-v2.webp" width="480" height="390" preserveAspectRatio="xMidYMid slice"/>${Array.from({length:25},(_,n)=>`<rect class="robot-cell" x="${100+n%5*52}" y="${35+Math.floor(n/5)*52}" width="52" height="52"/>`).join('')}${Array.from({length:5},(_,n)=>label(126+n*52,321,n+1)+label(78,66+n*52,5-n)).join('')}<image href="${A}robot-v2.webp" x="109" y="243" width="34" height="49"/><text x="403" y="173">↑ 세로</text><text x="315" y="355">가로 →</text><text x="126" y="354">출발 (1, 1)</text></svg><figcaption>로봇이 있는 칸에서 출발해요. 오른쪽은 가로 번호, 위쪽은 세로 번호가 커져요.</figcaption></figure>`+visibleFacts(q);
 if(id==='g3-14'){
  const end=i===2?4:6;
  return `<figure class="casual-scene robot-route"><svg viewBox="0 0 460 235" role="img" aria-label="로봇은 0에서 출발해요. 오른쪽은 앞으로, 왼쪽은 뒤로예요."><image href="${A}robot-v2.webp" x="12" y="12" width="105" height="116"/><text x="65" y="144" text-anchor="middle">출발</text><text x="350" y="64" text-anchor="middle">앞으로 →</text><path d="M65 166H410"/>${Array.from({length:end+1},(_,n)=>{const x=65+n*345/end;return `<path d="M${x} 157V175"/><text x="${x}" y="200" text-anchor="middle">${n}</text>`;}).join('')}<text x="240" y="230" text-anchor="middle">← 뒤로</text></svg><figcaption>한 칸씩 이동하며 명령을 차례대로 따라가요.</figcaption></figure>`+visibleFacts(q);
 }
 if(id==='g3-34')return `<figure class="casual-scene number-card-scene"><div class="physical-cards">${[2,4,8].map(n=>`<div class="physical-card"><img src="${A}number-card-v2.webp" alt=""><b>${n}</b></div>`).join('')}</div><div class="place-slots">${['백의 자리','십의 자리','일의 자리'].map(s=>`<span>${s}<i></i></span>`).join('')}</div><figcaption>카드 세 장을 모두 한 번씩 써요.</figcaption></figure>`+visibleFacts(q);
 if(id==='g3-56'){
  const total=i===1?4:8,groups=i===2?[['카이',3],['루미',2]]:[['초콜릿 한 판',i===0?2:1]];
  return `<figure class="casual-scene chocolate-scene"><div class="chocolate-plates ${i===2?'compare-chocolate':''}">${groups.map(([name,eaten])=>`<div class="chocolate-plate"><b>${name}</b><div class="chocolate-bar" style="--choc-cols:${total/2}" role="img" aria-label="전체 ${total}조각 중 ${eaten}조각을 먹고 ${total-eaten}조각이 남았어요">${Array.from({length:total},(_,n)=>`<span class="chocolate-piece ${n<eaten?'eaten':''}">${n<eaten?'<span>먹음</span>':`<img src="${A}chocolate-tile-v2.webp" alt="남은 초콜릿 한 조각">`}</span>`).join('')}</div></div>`).join('')}</div><figcaption>점선 빈자리는 먹은 조각이에요. ${i===2?'두 초콜릿은 전체 크기와 한 조각의 크기가 같아요.':'한 조각의 크기는 모두 같아요.'}</figcaption></figure>`;
 }
 if(id==='g4-18'&&i<2)return `<div class="strata-scene">${frame('strata','위에서부터 모래층, 진흙층, 조개 화석 층, 자갈층',tag(75,18,'1 · 모래층')+tag(75,40,'2 · 진흙층')+tag(75,61,'3 · 조개 화석 층')+tag(75,82,'4 · 자갈층'),'뒤집히거나 끊어지지 않은 지층이에요. 위·아래 위치를 살펴봐요.')}</div>`;
 if(id==='g6-21'||(id==='g6-31'&&i<2)){
  const cell=id==='g6-21'?i:3,descriptions=['울타리 판을 이어 만들 정원 경계','물을 나누어 담을 물병과 컵','자동차와 주유기','크기가 다른 두 피자'];
  return `<figure class="premium-scene"><div class="premium-scene-art" style="background-image:url('assets/casual-v1/math-objects.webp');background-position:${cell%2*100}% ${Math.floor(cell/2)*100}%" role="img" aria-label="${descriptions[cell]}"></div><figcaption>상황 그림이에요. 그림 속 개수나 크기를 재지 않고, 아래 수치로 계산해요.</figcaption></figure>`+facts(q).replace('<details ','<details open ');
 }
 if(id==='g6-09')return frame('circuit-kit','아직 연결하지 않은 전지와 꺼진 전구, 집게 전선','','실험에 쓸 준비물이에요. 아래 연결 방법과 관찰 결과를 읽어요.')+facts(q).replace('<details ','<details open ');
 if(id==='g6-15')return frame('climate-houses','가: 비 많은 지역의 기둥 위 집, 나: 추운 지역의 두꺼운 벽 집, 다: 건조한 지역의 흙집',rowLabels(['가 · 비 많은 곳','나 · 추운 곳','다 · 건조한 곳'],91).replaceAll('panel-label','climate-label'),'세 지역의 집 모양 예시예요. 기후와 집의 특징을 함께 살펴봐요.')+facts(q).replace('<details ','<details open ');
 if(id==='g6-20'){
  if(i===0){
   const names=['물고기','날 수 있는 새','개','사람'];
   return `<figure class="classification-chart"><figcaption>네 그림 카드만 나누는 분류표</figcaption><div class="classification-animals">${names.map((n,j)=>`<div><span class="classification-animal" style="background-position:${j*100/3}% 50%" role="img" aria-label="${n}"></span><b>${n}</b></div>`).join('')}</div><ol class="classification-questions"><li><b><em>질문 1</em> 다리가 있나요?</b><p><span>예 → 질문 2로</span><span>아니요 → 물고기</span></p></li><li><b><em>질문 2</em> 날 수 있나요?</b><p><span>예 → 새</span><span>아니요 → 질문 3으로</span></p></li><li><b><em>질문 3</em> 다리가 4개인가요?</b><p><span>예 → 개</span><span>아니요 → 사람</span></p></li></ol></figure>`;
  }
  return `<figure class="classification-chart"><figcaption>색깔·크기·구멍을 비교해요</figcaption><div class="shape-classification">${['가','나','다','라'].map((n,j)=>`<div><span class="shape-card ${j<2?'red':'blue'} ${j===1?'small':''}">${[0,3].includes(j)?'<i></i>':''}</span><b>${n}</b><p>${j<2?'빨강':'파랑'} · ${j===1?'작음':'큼'}<br>구멍 ${[0,3].includes(j)?'있음':'없음'}</p></div>`).join('')}</div></figure>`;
 }
 if(id==='g6-22'){
  const cover=frame('newspaper','학급 신문의 자료를 살펴보는 두 어린이','','숫자 자료와 글의 표현을 비교해요.');
  if(i===0)return `<div class="newspaper-scene">${cover}<section class="survey-paper"><h3>우리 반이 가장 좋아하는 운동</h3><p>한 사람당 한 가지를 골랐어요 · 전체 25명</p><div class="survey-people" aria-label="25명 중 축구 10명, 그 외 15명">${Array.from({length:25},(_,n)=>`<span class="${n<10?'soccer':''}" aria-hidden="true">●</span>`).join('')}</div><div class="survey-legend"><b>● 축구 10명</b><span>● 그 외 15명</span></div></section></div>`;
  if(i===1)return `<div class="newspaper-scene">${cover}<section class="survey-paper"><h3>6학년 도서관 이용 조사</h3><div class="survey-subset">전체 120명<div>일주일에 1회 이상 · 48명<div>그중 매일 이용 · 12명</div></div></div><p>매일 이용하는 학생은 ‘주 1회 이상’에도 포함돼요.</p></section></div>`;
  return `<div class="newspaper-scene">${cover}<section class="survey-paper ad-paper"><h3>“학생의 90%가 성적 상승!”</h3><p class="ad-evidence"><b>조사한 학생: 10명</b><br>성적이 오른 학생: 9명</p><p>비율과 조사 대상을 함께 살펴봐요.</p></section></div>`;
 }

 if(id==='mythic-g3-r0'){const fruits=['사과','망고','딸기'];html=`<figure class="casual-scene fruit-riddle"><div class="fruit-icons">${fruits.map((name,j)=>`<div><span class="fruit-icon" style="background-position:${j*50}% 50%" role="img" aria-label="${name}"></span><b>${name}</b></div>`).join('')}</div><figcaption>종류별로 한 바구니씩 담았어요. 그림은 과일의 종류를 나타내요.</figcaption></figure><div class="clue-cards fruit-clues">${q.visual.items.map(s=>`<p>${e(s)}</p>`).join('')}</div>`;}
 else if(/연필/.test(q.prompt||'')&&/파란색/.test(q.prompt||''))html=frame('pencil-mystery','종이로 몸통 색을 가린 연필 한 자루와 세 친구','','연필의 색은 가렸어요. 세 친구의 말로 추리해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g3-22')html=frame('shadow-day','같은 막대의 오전 긴 그림자, 낮의 짧은 그림자, 오후의 긴 그림자',rowLabels(['오전 9시 · 60cm','낮 12시 · 20cm','오후 3시 · 60cm'],90),'같은 날, 같은 막대의 관찰 기록이에요. 길이는 표시된 cm로 비교해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g6-01')html=frame('juice-lab','주스를 만들 원액과 물, 섞을 컵',tag(27,78,'원액')+tag(77,78,'물'),'재료 모습이에요. 실제로 넣는 양은 아래 기록으로 비교해요.')+(q.visual?.type==='bars'?`<div class="visual-cards"><span>원액 2컵</span><span>물 6컵</span></div>`:facts(q).replace('<details ','<details open '));
 else if(id==='cs-cipher-table')html=frame('cipher-machine','왼쪽에 수를 넣으면 규칙에 따라 오른쪽으로 결과가 나오는 암호 기계',tag(17,38,'넣은 수')+tag(52,37,'?')+tag(83,46,'나온 수'),'기계가 같은 규칙으로 수를 바꿔요. 아래 기록에서 규칙을 찾아요.');
 else if(id==='cs-truth-clue')html=`<section class="truth-guide"><b>번호 하나씩, 탐정처럼 확인해요</b><div class="candidate-cards">${[2,3,4,5,6].map(n=>`<span>${n}</span>`).join('')}</div><ol><li>아래 표에서 번호 하나를 정해요.</li><li>그 번호에 맞는 말은 <b>○</b>, 맞지 않는 말은 <b>×</b>로 표시해요.</li><li>○의 개수가 조건과 같으면, 그 줄의 <b>번호 버튼</b>을 눌러 골라요.</li></ol><p>한 번 누르면 ○, 두 번 누르면 ×예요. 모든 번호를 확인해요.</p></section>`;
 else if(id==='cs-fraction-snack')html=`<figure class="casual-scene"><div class="scene-art snack-study">${img('snack-tray','똑같은 크기로 나눈 간식판 12칸')}<div class="snack-items">${Array.from({length:12},(_,n)=>`<span>${i===0||i===2&&n<4?'<i class="snack-berry" role="img" aria-label="딸기 한 개"></i>':''}</span>`).join('')}</div></div><figcaption>${i===0?'딸기 12개를 네 친구에게 똑같이 나누어요.':i===2?'딸기가 담긴 4칸을 빼고, 빈칸을 세어 보세요.':'전체는 같은 크기의 12칸이에요.'}</figcaption></figure>`;
 else if(id==='g3-31')html=frame('helping-friend','달리기 중 넘어진 친구에게 손을 내미는 다은이','','체육 시간에 일어난 일이에요. 일기를 읽으며 마음의 변화를 살펴봐요.')+facts(q);
 else if(id==='g3-35')html=`<figure class="casual-scene switch-lab"><div class="switch-lamps">${['왼쪽','오른쪽'].map(label=>`<div><img src="${A}bulb-v2.webp" alt="${label} 전구 꺼짐"><b>${label} 전구</b><small>처음: 꺼짐</small></div>`).join('')}</div><div class="switch-controls"><div><img src="${A}red-button-v2.webp" alt="빨간 누름 버튼"><b>빨강 버튼</b><span>왼쪽 불만 바꿔요</span></div><div><img src="${A}blue-button-v2.webp" alt="파란 누름 버튼"><b>파랑 버튼</b><span>두 불을 각각 바꿔요</span></div></div><figcaption>처음에는 두 불 모두 꺼져 있어요. 버튼을 누르면 해당 전구가 꺼져 있을 때는 켜지고, 켜져 있을 때는 꺼져요.</figcaption></figure>`;
 else if(id==='g3-13')html=frame('wind-sun','바람과 해님 앞에서 외투를 입고 걷는 나그네','','겨루기가 시작되려는 장면이에요. 결과는 이야기를 읽고 판단해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g4-27')html=frame('dialog-friends','서로 마주 보고 이야기를 나누는 두 친구','','누가 어떤 뜻으로 말했는지 대화의 앞뒤를 읽어 봐요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g4-18'&&i<2)return `<div class="strata-scene">${frame('strata','위에서부터 모래층, 진흙층, 조개 화석 층, 자갈층',tag(75,18,'1 · 모래층')+tag(75,40,'2 · 진흙층')+tag(75,61,'3 · 조개 화석 층')+tag(75,82,'4 · 자갈층'),'뒤집히거나 끊어지지 않은 지층이에요. 위·아래 위치를 살펴봐요.')}</div>`;
 if(id==='g6-21'||(id==='g6-31'&&i<2)){
  const cell=id==='g6-21'?i:3,descriptions=['울타리 판을 이어 만들 정원 경계','물을 나누어 담을 물병과 컵','자동차와 주유기','크기가 다른 두 피자'];
  return `<figure class="premium-scene"><div class="premium-scene-art" style="background-image:url('assets/casual-v1/math-objects.webp');background-position:${cell%2*100}% ${Math.floor(cell/2)*100}%" role="img" aria-label="${descriptions[cell]}"></div><figcaption>상황 그림이에요. 그림 속 개수나 크기를 재지 않고, 아래 수치로 계산해요.</figcaption></figure>`+facts(q).replace('<details ','<details open ');
 }
 if(id==='g6-09')return frame('circuit-kit','아직 연결하지 않은 전지와 꺼진 전구, 집게 전선','','실험에 쓸 준비물이에요. 아래 연결 방법과 관찰 결과를 읽어요.')+facts(q).replace('<details ','<details open ');
 if(id==='g6-15')html=frame('climate-houses','비가 많은 곳의 기둥 위 집, 추운 곳의 두꺼운 벽 집, 건조한 곳의 작은 창이 있는 집',rowLabels(['가 · 비 많은 곳','나 · 추운 곳','다 · 건조한 곳'],91).replaceAll('panel-label','climate-label'),'집 구조를 비교하는 예시예요. 실제 집은 기후 외에도 재료·문화의 영향을 받아요.')+facts(q).replace('<details ','<details open ');
 else if(id==='csx-07')html=`<figure class="casual-scene"><div class="mushroom-row">${['빨강','파랑','노랑','초록','보라'].slice(0,i===2?5:4).map((label,j)=>`<div><span class="mushroom-prop" style="background-position:${j*25}% 50%" role="img" aria-label="${label} 버섯"></span><b>${label}</b></div>`).join('')}</div><figcaption>색깔을 구분하는 그림이에요. 실제 키의 순서는 단서로 알아내요.</figcaption></figure>`+facts(q).replace('<details ','<details open ');
 else if(id==='g3-05'){
  const names=['빨강','파랑','별','달'],seq=i===2?[2,3,2,3,2,3]:[0,1,1,0,1,1];
  html=`<figure class="casual-scene bead-scene"><div class="bead-row">${seq.map((n,j)=>`<div><span class="bead-prop" style="background-position:${n*100/3}% 50%" role="img" aria-label="${names[n]}"></span><small>${j+1}번째</small></div>`).join('')}<div class="bead-next" aria-label="${i===2?'다음에도 반복':'일곱 번째는 무엇일까요'}">${i===2?'…':'?'}</div></div><figcaption>${i===2?'같은 규칙으로 10번째까지 이어 놓는다고 생각해요.':'왼쪽부터 차례대로 관찰해요.'}</figcaption></figure>`;
 }else if(id==='g3-28')html=frame('recycle-station','왼쪽부터 파란 상자, 노란 상자, 초록 상자, 갈색 통',['종이','플라스틱','캔','음식물'].map((s,j)=>tag([16,39,61,83][j],59,s,'bin-sign')).join(''),'이 활동에서 정한 분류표예요. 실제 분리배출 규칙은 지역에 따라 달라요.')+visibleFacts(q);
 else if(id==='csx-27')html=frame('float-lab','수조 밖에 놓인 나무토막, 쇠못, 뚜껑 닫은 빈 플라스틱병, 조약돌',rowLabels(['나무토막','쇠못','빈 병 · 뚜껑 닫음','조약돌'],91),'실험 준비 모습이에요. 물에 넣은 뒤의 결과는 아래 기록에서 확인해요.');
 else if(id==='g6-32'&&i<2)html=`<figure class="casual-scene flyer-scene"><div class="flyer-copy"><span>골목 분식집</span><h3>전 메뉴<br><strong>50%</strong> 할인!</h3><div class="flyer-terms">평일 오후 2시~4시에만<br>5,000원 이하 메뉴만<br>1인 1메뉴 한정</div></div><figcaption>광고의 큰 글씨와 작은 조건을 함께 읽어 봐요.</figcaption></figure>`;
 else if(id==='g6-10')html=frame('season-observation','같은 막대의 봄, 여름, 겨울 관찰 모습',rowLabels(['3월 · 봄','6월 · 여름','12월 · 겨울'],92),'관찰 상황을 그린 그림이에요. 시간과 길이는 아래 기록으로 비교해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g3-30')html=`<figure class="casual-scene"><div class="chest-row">${['빨강','파랑','노랑','초록'].slice(0,i===2?4:3).map((color,j)=>`<div><span class="prop-chest" style="background-position:${j*100/3}% 50%" role="img" aria-label="닫힌 ${color} 상자"></span><b>${color} 상자</b></div>`).join('')}</div><figcaption>어느 상자에 맞는 열쇠일까요? 아래 단서를 살펴봐요.</figcaption></figure>`+`<div class="clue-cards">${q.visual.items.filter(s=>/^힌트\s*\d/.test(s)).map(s=>`<p>${e(s)}</p>`).join('')}</div>`;
 else if(id==='g6-40')html=frame('sealed-doors','왼쪽부터 닫힌 문 A, B, C와 앞에 있는 세 스위치',tag(22,11,'문 A')+tag(50,11,'문 B')+tag(78,11,'문 C')+rowLabels(['스위치 1','스위치 2','스위치 3'],82),'처음에는 모두 닫혀 있어요. 각 스위치가 바꾸는 문을 확인해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g6-52'&&i<2)html=frame('wilted-plant','잎 가장자리가 노랗고 흙이 바싹 마른 시든 화분',tag(50,86,'무엇이 보이나요?'),'보이는 사실과 그 까닭에 대한 생각을 구분해요.')+facts(q).replace('<details ','<details open ');
 else if(id==='g6-09'&&i<2){
  const labels=i===0?['가 · 끊어진 곳 없음','나 · 전지가 안 닿음','다 · 나무 막대']:['철 클립','고무지우개','구리 동전','플라스틱 자'],on=i===0?[1,0,0]:[1,0,1,0];
  html=`<figure class="casual-scene"><div class="lamp-row">${labels.map((label,j)=>`<div><span class="prop-lamp" style="background-position:${on[j]?100:0}% 50%" role="img" aria-label="${e(label)}, ${on[j]?'켜짐':'꺼짐'}"></span><b class="lamp-material">${e(label)}</b><small>${on[j]?'켜짐':'꺼짐'}</small></div>`).join('')}</div><figcaption>전지·전선·전구를 연결해 관찰한 실험 기록이에요.</figcaption></figure>`;
 }
 else if(id==='g6-30'){
  const values=i===2?[16,8,4,2,1]:[8,4,2,1],on=i===2?[1,0,1,0,1]:i===0?[0,1,1,0]:[0,0,0,0];
  html=`<figure class="casual-scene signal-scene"><div class="lamp-row">${values.map((v,j)=>`<div><b>${v}</b><span class="prop-lamp" style="background-position:${on[j]?100:0}% 50%" role="img" aria-label="값 ${v}, ${i===1?'상태를 생각할 전구':on[j]?'켜짐':'꺼짐'}"></span><small>${i===1?'?':on[j]?'켜짐':'꺼짐'}</small></div>`).join('')}</div><figcaption>${i===1?'숫자 11을 보내려면 어떤 전구를 켤까요?':'켜진 전구의 값을 더해 신호를 읽어요.'}</figcaption></figure>`;
 }
 else if(id==='g3-58')html=frame('town','북쪽이 위인 동네 지도. 공원 남쪽에 병원, 병원 동쪽에 우체국, 우체국 남쪽에 시장. 연결된 길은 세 개.',tag(35,6,'공원')+tag(35,55,'병원')+tag(68,55,'우체국')+tag(68,89,'시장')+tag(89,8,'북 ↑ · 동 →'),'장소 사이의 길 하나가 1칸이에요. 그림 속 길 길이는 실제 거리 비율이 아니에요.')+facts(q);
 else if(id==='g4-44'){
  const routes=[['바다','산'],['바다','들'],['산','바다'],['산','들'],['들','바다'],['들','산']],goods=i===2?['4회','3회','2회','5회','3회','1회']:['생선','김','사과','나무','쌀','쌀'];
  html=frame('trade','산 위의 산마을, 바닷가의 바다마을, 논밭의 들마을',tag(50,8,'산마을')+tag(19,44,'바다마을')+tag(81,45,'들마을'),i===2?'트럭이 오간 횟수예요. 화살표 방향을 확인해요.':'서로 필요한 물건을 주고받는 세 마을이에요.')+`<div class="trade-routes">${routes.map(([from,to],j)=>`<div><span>${e(from)}마을 <b aria-label="에서">→</b> ${e(to)}마을</span><strong>${e(goods[j])}</strong></div>`).join('')}</div>`+(i===1?'<p class="scene-note">산마을에는 산이 많고 바다가 없어요.</p>':'');
 }else if(id==='g4-03')html=i<2?frame('water','같은 접시를 3일 동안 관찰한 그림. 1일 200mL, 2일 170mL, 3일 140mL.',rowLabels(['1일\n200mL','2일\n170mL','3일\n140mL']),'같은 접시에 남은 물 · 정확한 양은 기록한 mL를 읽어요.'):frame('sunshade','하루 뒤 햇볕 접시는 60mL, 그늘 접시는 85mL가 남았습니다.',rowLabels(['햇볕\n남은 물 60mL','그늘\n남은 물 85mL']),'처음에는 두 접시에 각각 100mL · 하루 뒤 남은 양이에요.');
 else if(id==='csx-02')html=q.type==='grid'?'':garden({total:20,cols:5},i===2?(answers[1]?.selected||[0,1,2,3,4,5,6,7]):[]);
 else if(id==='cs-garden-int'||id==='csx-03')html=frame('garden','나무 울타리로 둘러싸인 직사각형 화단',tag(50,10,id==='cs-garden-int'?'울타리 전체 20m':i===0?'가로 7m':'울타리 전체 22m')+(id==='csx-03'&&i===0?tag(9,45,'세로 4m'):''),'직사각형 화단의 모양 예시예요. 그림을 재서 길이를 구하지 않아요.');
 else if(id==='g3-08'&&i<2)html=frame('growth','씨앗을 심고, 싹이 나오고, 잎 두 장이 나고, 키가 자라는 강낭콩 관찰 기록',rowLabels(['1일\n씨앗 심기','4일\n싹 나옴','7일\n잎 2장','10일\n키 5cm'],89),'같은 강낭콩의 변화 · 그림 크기는 실제 길이 비율이 아니에요.');
 else if(id==='cs-plant-fair')html=frame('fairplants','가상 관찰 기록: 밝은 곳의 콩 싹 9cm, 어두운 곳의 콩 싹 4cm',rowLabels(['화분 ㄱ · 밝게\n9cm · 물 20mL/일','화분 ㄴ · 어둡게\n4cm · 물 20mL/일'],89),'가상 실험 · 10일 뒤 · 다른 조건은 아래 표를 확인해요.');
 else if(id==='cs-library-guide')html=frame('library','회원증과 빌릴 책 두 권, 오른쪽의 반납함이 있는 도서관',tag(30,65,'회원증')+tag(52,59,'최대 2권')+tag(88,65,'반납함'),'기한과 이용 시간은 안내문에서 확인해요.');
 else if(id==='g3-04'&&i<2)html=mapScene([[48,145,0,'공원'],[148,145,2,'우체국'],[248,145,4,'학교'],[348,145,5,'도서관']],[],'건물 카드예요. 아래 설명을 읽고 실제 위치를 생각해요.').replace('0 0 400 280','0 65 400 150')+facts(q).replace('<details ','<details open ');
 else if(id==='g3-04')html=mapScene([[48,145,2,'우체국'],[148,145,4,'학교'],[248,145,5,'도서관'],[348,145,0,'공원']],[[0,1],[1,2],[2,3]],'왼쪽부터 오른쪽으로 이어지는 한 줄의 길이에요.');
 else if(id==='g3-44')html=mapScene([[45,180,0,'공원'],[130,180,4,'학교'],[300,180,5,'서점'],[300,70,6,'빵집']],[[0,1,false,'1칸'],[1,2,false,'2칸'],[2,3,false,'1칸']],'북쪽은 위, 동쪽은 오른쪽이에요.',label(75,35,'북 ↑ · 동 →'))+facts(q);
 else if(id==='g4-55'){
  const nodes=[[55,140,10,'가',82],[150,78,10,'나',82],[305,80,10,'다',82],[310,210,10,'라',82],[140,220,10,'마',82]],pairs=[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]];
  html=mapScene(nodes,pairs.map(([a,b],j)=>[a,b,(i>0&&j===1)||(i===2&&j===2)]),'노란 길은 갈 수 있는 길, 붉은 점선은 끊긴 길이에요.').replace('<rect class="map-grass" x="0" y="0" width="400" height="280" rx="18"/>',`<image href="${A}map-meadow-v2.webp" width="400" height="280" preserveAspectRatio="xMidYMid slice"/>`)+visibleFacts(q);
 }else if(id==='csx-06')html=mapScene([[180,220,0,'샘터'],[180,70,8,'큰바위'],[325,220,7,'오두막'],[50,220,9,'다리']],[[0,1,false,'5cm'],[0,2,false,'3cm'],[0,3,false,'2cm']],'축척 1cm = 200m · 북쪽은 위예요. 거리는 표시한 cm로 계산해요.');
 else if(id==='cs-map'){
  const grid=Array.from({length:4},(_,n)=>`<path class="coordinate-line" d="M60 ${50+n*60}H340M${60+n*90} 50V230"/>`).join('');
  html=mapScene([[105,200,4,'학교'],[285,80,5,'도서관']],[],'한 칸 이동은 100m · 가로·세로로만 이동해요.',grid);
 }
 return html;
},grid(q,a){if(q.id==='csx-31-1')return flagScene(1,a.selected,true);return q.id?.startsWith('csx-02-')?garden(q,a.selected,true):null;}};
})(globalThis);

