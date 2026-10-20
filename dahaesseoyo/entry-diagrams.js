(function(root){
'use strict';
const previous=root.ThinkstarGradeDiagrams.render,e=DrawerActivities.esc;
const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${e(s)}</text>`;
const line=(x,y,a,b)=>`<path d="M${x} ${y}L${a} ${b}"/>`;
const grid=(x,y,w,h,size,marked=0)=>Array.from({length:w*h},(_,i)=>`<rect x="${x+i%w*size}" y="${y+Math.floor(i/w)*size}" width="${size}" height="${size}" style="fill:${i<marked?'#df9469':'#fff8e8'}"/>`).join('');
const bulb=(x,y,on,label)=>`<circle cx="${x}" cy="${y}" r="20" style="fill:${on?'#ffe08a':'#dce4ea'}"/><path d="M${x-9} ${y+18}v12h18v-12"/>${text(x,y+53,label)}`;
const plant=(x,y,h=40)=>`<path d="M${x-19} ${y}h38l-6 24h-26Z" style="fill:#e8ae84"/>${h===0?'':`<path d="M${x} ${y}v-${h}"/><ellipse cx="${x-9}" cy="${y-h+10}" rx="13" ry="7" style="fill:#8dc7a6"/><ellipse cx="${x+9}" cy="${y-h}" rx="13" ry="7" style="fill:#8dc7a6"/>`}`;
root.ThinkstarGradeDiagrams.render=function(id,q,i){
 let b='',c='';
 if(id==='g3-56'){
  const pairs=i===2?[[0,'카이: 3/8'],[0,'루미: 2/8']]:[[q.visual.selected,i===0?'먹은 부분':'남은 부분']];
  b=pairs.map(([n,label],j)=>grid(i===2?45+j*190:120,55,i===1?2:4,2,28,n)+text(i===2?101+j*190:176,145,label)).join('');c=i===2?'같은 크기의 두 초콜릿이에요. 각자 먹은 부분을 떠올려 비교해요.':'같은 크기로 나눈 초콜릿에서 색칠한 칸을 살펴봐요.';
 }else if(id==='g3-35'){
  b=bulb(145,45,false,'왼쪽')+bulb(255,45,false,'오른쪽')+text(200,130,'처음: 두 불 모두 꺼짐')+text(200,163,'빨강 → 왼쪽 반전 / 파랑 → 둘 다 반전');c='켜진 불은 끄고, 꺼진 불은 켜는 버튼이에요.';
 }else if(id==='g6-30'){
  const values=i===2?[16,8,4,2,1]:[8,4,2,1],states=i===2?[1,0,1,0,1]:[0,1,1,0];
  b=values.map((n,j)=>bulb(45+j*310/(values.length-1),62,i===1?false:states[j],String(n))).join('')+text(200,160,i===1?'만들 신호: 11 · 어떤 전구를 켤까요?':'노란 전구: 켜짐 / 회색 전구: 꺼짐');c=i===1?'전구 아래의 값으로 신호를 만들어요. 회색은 아직 선택 전이에요.':'켜진 전구 아래의 값만 더해요.';
 }else if(id==='g6-40'){
  b=[80,200,320].map((x,j)=>`<rect x="${x-30}" y="25" width="60" height="95" rx="15" style="fill:#c8c9eb"/>${text(x,78,['A','B','C'][j])}`).join('')+text(200,152,'처음: 세 문 모두 닫힘');c=i===2?'이번 스위치 3은 C만 바꿔요. 바뀐 규칙을 확인해요.':'각 스위치가 바꾸는 두 문을 확인해요. 열린 문은 닫고 닫힌 문은 열어요.';
 }else if(id==='g3-34'){
  b=[2,4,8].map((n,j)=>`<rect x="${50+j*110}" y="25" width="80" height="90" rx="12"/>${text(90+j*110,80,n)}`).join('')+text(200,160,'백의 자리 □  십의 자리 □  일의 자리 □');c='카드 세 장을 한 번씩만 써요. 빈 자리에 놓아 생각해요.';
 }else if(id==='g3-04'){
  b=line(45,105,355,105)+['우체국','학교','도서관','공원'].map((s,j)=>`<path d="M${45+j*95} 65l25-22 25 22v32h-50Z"/>${text(70+j*95,130,s)}`).join('');c='왼쪽부터 오른쪽으로 이어진 한 줄의 길이에요.';
 }else if(id==='g3-08'){
  if(i<2)b=[0,18,30,45].map((h,j)=>plant(50+j*100,105,h)+text(50+j*100,158,['1일 씨앗','4일 싹','7일 잎 2장','10일 5cm'][j])).join('');
  else b=plant(110,100,42)+plant(290,100,15)+text(110,157,'물을 준 날: 잘 자람')+text(290,157,'안 준 날: 시듦');c='관찰 기록을 그림으로 옮겼어요. 날짜와 변화를 연결해요.';
 }else if(id==='g3-30'){
  const colors=i===2?['#e49a91','#9abddd','#ecd47e','#a6ceab']:['#e49a91','#9abddd','#ecd47e'];b=colors.map((color,j)=>{const x=40+j*330/colors.length;return `<rect x="${x}" y="40" width="68" height="70" rx="9" style="fill:${color}"/><circle cx="${x+34}" cy="75" r="7"/>${text(x+34,140,['빨강','파랑','노랑','초록'][j])}`;}).join('');c='열쇠가 맞는 상자는 하나. 힌트에 맞지 않는 상자를 지워 생각해요.';
 }else if(id==='g3-17'||id==='csx-27'){
  if(id==='g3-17'&&i===2){b='<path d="M115 70h170l-35 45H150Z"/>'+text(200,145,'찰흙 배 · 아직 실험 전');c='이 배의 결과는 아직 몰라요.';}
  else{const names=id==='g3-17'?['나무','쇠구슬','스티로폼','돌','코르크']:['나무','쇠못','빈 병','돌'];b='<rect x="20" y="70" width="360" height="95" style="fill:#d9eff5"/>'+line(20,70,380,70)+names.map((s,j)=>{const x=55+j*290/(names.length-1),y=j%2?133:64;return `<rect x="${x-20}" y="${y-14}" width="40" height="25" rx="8" style="fill:${j%2?'#a7b5bf':'#e5c394'}"/>${text(x,j%2?158:39,s)}`;}).join('');c='물에 넣어 관찰한 기록이에요. 위쪽은 뜸, 아래쪽은 가라앉음.';}
 }else if(id==='g4-13'){
  if(i<2)b=[9,0,8,0].map((n,j)=>{const x=50+j*100;return plant(x,105,n?35:0)+text(x,28,['A','B','C','D'][j])+text(x,143,['물○ 빛○','물× 빛○','물○ 빛×','물× 빛×'][j])+text(x,173,n+'개 / 10개');}).join('');
  else b=plant(110,110)+plant(290,110)+text(110,35,'온도 ?')+text(290,35,'온도 ?')+text(200,172,'두 화분의 조건을 어떻게 맞출까요?');c=i===2?'온도의 영향을 알아보려는 실험이에요. 비교할 조건을 정해요.':'같은 씨앗 · 온도와 공기 등 나머지 조건은 같아요.';
 }else if(id==='g4-04'){
  const labels=i===2?['■ 학교','○ 병원','▲ 산']:['★ 학교','♥ 병원','● 우체국','▲ 산'];b=labels.map((s,j)=>text(60+j*95,45,s)).join('')+text(200,105,i===1?'★  ★  ★     ♥  ♥     ●     ▲':i===2?'집 옆 기호: ○':'찾아볼 기호: ▲');c='이 지도의 범례를 확인해요. 기호의 위치는 실제 지형을 뜻하지 않아요.';
 }else if(id==='g4-44'){
  const values=i===2?['4회','3회','2회','5회','3회','1회']:['생선','김','사과','나무','쌀','쌀'];const routes=['바다 → 산','바다 → 들','산 → 바다','산 → 들','들 → 바다','들 → 산'];b=routes.map((s,j)=>{const x=j%2?295:105,y=35+Math.floor(j/2)*60;return text(x,y,s)+text(x,y+25,values[j]);}).join('');c='화살표 시작은 보내는 마을, 끝은 받는 마을이에요.';
 }else if(id==='csx-02'){
  b=grid(120,18,5,4,30)+text(200,168,'전체 20칸 · 안개꽃은 전체의 2/5');c='한 칸의 크기는 모두 같아요. 심을 칸 수를 먼저 생각해요.';
 }else if(id==='csx-15'){
  b=[110,290].map((x,j)=>`<path d="M${x-35} 25v110h70V25"/><rect x="${x-34}" y="${j?64:70}" width="68" height="${j?70:64}" style="fill:${j?'#b4daeb':'#b4e2e1'};stroke:none"/><path d="M${x-45} 70h90" class="dashed"/>${text(x,18,j?'얼린 후':'얼리기 전')}${text(x,163,'100g')}`).join('');c='같은 용기의 표시선(점선)과 높이를 비교해요. 모양은 예시예요.';
 }else if(id==='csx-07'){
  const colors=['#df8179','#84b9de','#e4cd77','#94bf94',...(i===2?['#bd98d8']:[])];b=colors.map((col,j)=>{const x=45+j*320/colors.length;return `<rect x="${x-8}" y="75" width="16" height="35"/><path d="M${x-25} 75a25 25 0 0 1 50 0Z" style="fill:${col}"/>${text(x,142,['빨강','파랑','노랑','초록','보라'][j])}`;}).join('');c='색깔을 구분하는 그림이에요. 실제 키의 순서는 글의 단서로 알아내요.';
 }else if(id==='g6-20'&&i===0){
  b=text(145,25,'다리가 있나요?')+line(145,32,145,68)+line(190,22,295,22)+text(310,46,'아니요: 물고기')+text(130,59,'예 ↓')+text(145,90,'날 수 있나요?')+line(145,98,145,134)+line(200,85,290,85)+text(315,107,'예: 새')+text(110,121,'아니요 ↓')+text(145,155,'다리가 4개인가요?')+text(140,188,'예: 개')+text(300,188,'아니요: 사람');c='질문마다 예·아니요를 따라가요. 이 네 카드만 나누는 분류표예요.';
 }else if(id==='g6-20'){
  const sizes=[52,32,52,52];b=sizes.map((size,j)=>{const x=55+j*96;return `<rect x="${x-size/2}" y="50" width="${size}" height="${size}" rx="6" style="fill:${j<2?'#e79b93':'#8dbdd9'}"/>${[0,3].includes(j)?`<circle cx="${x}" cy="75" r="9" style="fill:white"/>`:''}${text(x,140,['가','나','다','라'][j])}`;}).join('');c='색깔·크기·구멍 유무를 관찰해요.';
 }else if(id==='g6-09'){
  b='<path d="M45 70V30H355V135H220M180 135H45V70"/><path d="M180 110v50M220 120v30"/><circle cx="200" cy="30" r="20"/>'+text(200,88,'전구')+text(200,184,'전지')+text(60,97,'전선');c='전지의 두 극과 전구가 이어지는 회로 모양 예시. 각 실험의 결과는 기록을 확인해요.';
 }else if(id==='g6-15'){
  b='<path d="M30 90l45-55 45 55v35H30ZM45 125v25M105 125v25M155 75h85v65h-85ZM275 70h90v70h-90Z"/><rect x="180" y="95" width="16" height="16"/><rect x="300" y="93" width="14" height="16"/>'+text(75,175,'가: 비 많은 곳')+text(197,175,'나: 추운 곳')+text(322,175,'다: 건조한 곳');c='기둥 위 집, 두꺼운 벽과 작은 창 등 자료에 나온 특징의 모양 예시예요.';
 }else if(id==='g6-52'){
  b=plant(110,112,18)+plant(290,112,18)+text(110,35,i===2?'물 적게':'화분 A')+text(290,35,i===2?'물 충분히':'화분 B')+text(200,168,i===2?'두 화분 모두 시듦':'관찰한 사실과 예상한 이유를 구별해요');c=i===2?'실험 결과를 그림으로 옮겼어요.':'화분을 조사하는 상황 그림이에요. 결과를 미리 뜻하지 않아요.';
 }
 if(!b)return previous(id,q,i);
 const facts=q.visual?.type==='cards'?q.visual.items:[];
 return `<div class="visual-diagram entry-diagram"><figure class="puzzle-diagram"><svg viewBox="0 0 400 200" role="img" aria-label="${e(q.title+'. '+c)}">${b}</svg><figcaption>${e(c)}</figcaption></figure>${facts.length?`<div class="entry-facts" aria-label="문제 조건">${facts.map(s=>`<span>${e(s)}</span>`).join('')}</div>`:''}</div>`;
};
})(globalThis);
