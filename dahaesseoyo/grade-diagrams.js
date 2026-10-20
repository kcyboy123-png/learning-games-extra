(function(root){
'use strict';
const e=DrawerActivities.esc;
const text=(x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle">${e(s)}</text>`;
const line=(x,y,a,b,cls='')=>`<path d="M${x} ${y}L${a} ${b}" class="${cls}"/>`;
const dot=(x,y,label)=>`<circle cx="${x}" cy="${y}" r="20"/>${text(x,y+5,label)}`;
const box=(w,d,h)=>`<path d="M105 75H245V145H105ZM105 75L155 35H295L245 75M245 145L295 105V35"/>${text(175,168,'가로 '+w)}${text(285,140,'세로 '+d)}${text(65,112,'높이 '+h)}`;
const clueList=items=>items.length?`<section class="garden-conditions" aria-label="문제 조건"><b>꼭 살펴볼 조건</b><ul>${items.map(s=>`<li>${e(s)}</li>`).join('')}</ul></section>`:'';
const strip=(n,a=0,b=0)=>`<div class="study-strip" style="--pieces:${n}">${Array.from({length:n},(_,j)=>`<span class="${j<a?'part-a':j<a+b?'part-b':''}"></span>`).join('')}</div>`;
const cards=values=>`<div class="study-number-cards">${values.map(n=>`<span>${e(n)}</span>`).join('')}</div>`;
function studyDiagram(id,q,i){
 let art='',caption='';
 const facts=q.visual?.type==='cards'?q.visual.items:[];
 const svg=(body,h=220)=>`<svg viewBox="0 0 400 ${h}" role="img" aria-label="${e(q.title)}">${body}</svg>`;
 const rect=(w,h,square=false)=>svg(`<rect x="${square?132.5:85}" y="50" width="${square?135:230}" height="${square?135:110}" rx="3" class="study-wood"/>${text(200,32,'가로 '+w)}${text(200,square?211:193,'세로 '+h)}`);
 const vessel=(x,amount,capacity,label)=>`<path d="M${x-34} 45V160H${x+34}V45"/><rect x="${x-32}" y="${160-amount/capacity*105}" width="64" height="${amount/capacity*105}" style="fill:#a2d6e8;stroke:none"/>${text(x,26,label)}${text(x,190,amount+'mL')}`;
 if(['g3-15','g3-38'].includes(id)){
  const routes=facts.filter(s=>/→/.test(s));
  art=routes.length?`<div class="study-bus-routes">${routes.map(s=>{const parts=s.split(':');const leftRoute=parts[0].includes('→'),route=leftRoute?parts[0]:parts.length>1?parts.slice(1).join(':'):s;return `<section>${parts.length>1?`<b>${e(leftRoute?parts.slice(1).join(':'):parts[0])}</b>`:''}<div>${route.split('→').map(stop=>`<span>${e(stop.trim())}</span>`).join('<i aria-hidden="true">→</i>')}</div></section>`;}).join('')}</div>`:`<div class="study-timetable"><b>출발 시각을 비교해요</b>${cards((facts.find(s=>s.startsWith('출발:'))||'').replace('출발:','').split('/').map(s=>s.trim()))}</div>`;caption='정류장을 차례로 살펴봐요. 같은 이름의 정류장은 같은 장소예요.';
 }else if(['g3-19','g3-40','g3-45','g4-05'].includes(id)){
  const n=/다섯|5번|5명/.test(q.title+' '+q.prompt)?5:id==='g3-19'?3:4;art=`<div class="study-seating">${Array.from({length:n},(_,j)=>`<div><span aria-hidden="true">?</span><b>${j+1}${['g3-40','g4-05'].includes(id)?'번 자리':'번째'}</b></div>`).join('')}</div><p class="study-board-note">${['g3-40','g4-05'].includes(id)?'왼쪽부터 1번 자리':'맨 앞 → 맨 뒤'}</p>`;caption='자리와 순서만 그려 놓았어요. 누가 들어갈지는 조건을 따라 찾아요.';
 }else if(id==='g3-26'){
  const legs=[[-1,80,60],[-1,106,110],[-1,130,170],[1,80,60],[1,106,110],[1,130,170]];
  art=svg(legs.map(([side,y,end])=>`<path d="M${200+side*12} ${y}L${200+side*55} ${y+8}L${200+side*94} ${end}" style="fill:none;stroke:#70452e;stroke-width:6;stroke-linecap:round"/>`).join('')+'<path d="M188 42L171 22L153 18M212 42L229 22L247 18" style="fill:none;stroke:#70452e;stroke-width:4;stroke-linecap:round"/><ellipse cx="200" cy="52" rx="23" ry="25" style="fill:#986542;stroke:#70452e"/><ellipse cx="200" cy="105" rx="18" ry="33" style="fill:#ae7951;stroke:#70452e"/><ellipse cx="200" cy="145" rx="8" ry="11" style="fill:#986542;stroke:#70452e"/><ellipse cx="200" cy="184" rx="32" ry="34" style="fill:#855339;stroke:#70452e"/><circle cx="188" cy="47" r="3" style="fill:#1f2428"/><circle cx="212" cy="47" r="3" style="fill:#1f2428"/>',235);caption='위에서 본 개미의 관찰 모형이에요. 더듬이와 다리를 구별해서 살펴봐요.';
 }else if(id==='g3-55'){
  art=svg(['#d86e68','#729ed1','#edce6d','#82b591'].map((color,j)=>{const x=50+j*100;return `<path d="M${x-24} 105v-25a24 24 0 0 1 48 0v25Z" style="fill:${color}"/><path d="M${x-34} 105h68v13h-68Z" style="fill:${color}"/>${text(x,160,['빨강','파랑','노랑','초록'][j])}`;}).join(''));caption='모자는 색깔마다 하나씩 있어요. 모자 그림의 순서는 친구의 순서가 아니에요.';
 }else if(id==='g4-32'){
  art=svg([65,200,335].map((x,j)=>{const outline=j===1?`M${x} 30l15 22 13 3-4 13 16 12-10 12 9 12-15 12 4 12-15 5-13 20-13-20-15-5 4-12-15-12 9-12-10-12 16-12-4-13 13-3Z`:`M${x} 30C${x+58} 75 ${x+43} 128 ${x} 153C${x-43} 128 ${x-58} 75 ${x} 30Z`;const veins=j===0?[-14,0,14].map(d=>`<path d="M${x} 40Q${x+d*2} 90 ${x} 148"/>`).join(''):line(x,35,x,150)+[65,90,115].map(y=>line(x,y+12,x-23,y-7)+line(x,y+12,x+23,y-7)).join('');return `<path d="${outline}" style="fill:#bad4a0"/>${veins}${text(x,195,['식물 A','식물 B','식물 C'][j])}`;}).join(''));caption='잎 가장자리와 잎맥을 구별해서 살펴봐요. 실제 크기와 색은 비교 조건이 아니에요.';
 }else if(id==='g4-39'){
  const n=i===0?1:3;art=`<div class="study-bulbs">${Array.from({length:n},(_,j)=>`<div><img src="assets/casual-v1/bulb-v2.webp" alt="꺼진 전등"><b>${n===1?'전등':['A','B','C'][j]}</b><span>처음: 꺼짐</span></div>`).join('')}</div><div class="study-switches">${(i===0?['누를 때마다 상태가 바뀜']:['버튼 1: A·B 상태 바꾸기','버튼 2: B·C 상태 바꾸기']).map((s,j)=>`<div><img src="assets/casual-v1/${j?'blue':'red'}-button-v2.webp" alt="${j+1}번 버튼"><b>${s}</b></div>`).join('')}</div>`;caption='그림은 처음 상태예요. 누른 순서에 따라 켜짐과 꺼짐을 바꾸어 생각해요.';
 }else if(id==='g4-53'&&i===2){
  art=`<div class="study-layers">${facts.map((s,j)=>`<div style="background:${['#d9c99e','#bdcbd1','#cdb59f'][j]}"><b>${e(s)}</b></div>`).join('')}</div>`;caption='맨 아래에서 위로 쌓였어요. 위아래가 뒤집히지 않았다는 조건을 확인해요.';
 }else if(id==='g3-09'){
  art=`<div class="study-recycling">${[['월요일','종이','#6eabd2'],['수요일','플라스틱','#dfbd4c'],['금요일','유리병 · 캔','#78aa7e']].map(([day,name,color])=>`<div><b>${day}</b><span style="--bin:${color}"><strong>${name}</strong></span></div>`).join('')}</div>`;caption='이 활동에서 정한 수거 일정이에요. 실제 수거 일정은 지역마다 달라요.';
 }else if(id==='g4-08'){
  art=svg([['오전 9시',80],['낮 12시',30],['오후 3시',70]].map(([time,n],j)=>{const y=40+j*65;return `<path d="M95 ${y}h${n*2.5}" style="stroke:#7c8496;stroke-width:12"/><path d="M95 ${y-23}v23" style="stroke:#ad8251;stroke-width:6"/>${text(45,y+5,time)}${text(120+n*2.5,y+5,n+'cm')}`;}).join(''));caption='같은 50cm 막대가 만든 그림자를 관찰한 기록이에요. 각 그림자는 같은 비율로 그렸어요.';
 }else if(id==='g4-09'){
  art=`<div class="study-institutions">${(i===2?[['공공기관','나라나 지역이 세움'],['가게','개인이 물건을 판매']]:[['소방서','불을 끄고 사람을 구함'],['경찰서','범죄 예방과 질서 유지'],['우체국','편지와 택배 전달'],['주민센터','주민 서류와 생활 도움']]).map(([name,job])=>`<div><span aria-hidden="true">▰</span><b>${name}</b><p>${job}</p></div>`).join('')}</div>`;caption='기관의 이름과 하는 일을 함께 읽어요.';
 }else if(id==='csx-42'){
  art=svg([85,200,315].map((x,j)=>`<path d="M${x-28} 48l48-17 9 24-48 17Z" style="fill:#d8bb78"/><path d="M${x} 65v40M${x} 105l-28 65M${x} 105v72M${x} 105l28 65" style="stroke:#526775;stroke-width:5"/>${text(x,205,(j+1)+'번째 망원경')}`).join(''));caption='망원경 받침대 하나마다 다리가 세 개씩 있어요. 표와 그림을 비교해요.';
 }else if(id==='g3-01'){
  art=`<div class="study-price-tags">${facts.map(s=>{const match=s.match(/^(.*?)([\d,]+원)$/);return `<div><span>${e(match?match[1]:s)}</span>${match?`<b>${e(match[2])}</b>`:''}</div>`;}).join('')}</div>`;caption='물건 이름과 가격표를 짝지어 읽어요.';
 }else if(id==='g3-16'){
  const n=i===2?30:24;art=`<div class="study-candy-pile" aria-label="사탕 ${n}개">${Array.from({length:n},()=>'<span aria-hidden="true">◆</span>').join('')}</div><p class="study-board-note">${i===0?'똑같이 나눌 봉지 4개':i===1?'한 봉지에 8개씩':'한 봉지에 7개씩'}</p>`;caption='전체 사탕을 보고, 한 봉지에 담는 조건을 확인해요.';
 }else if(id==='g3-39'){
  art=rect('120cm','60cm');caption=i===2?'책상 가로를 두 번 이은 길이와 줄넘기를 비교해요.':'책상의 위·아래, 왼쪽·오른쪽 길이는 각각 같아요.';
 }else if(id==='g3-41'){
  art=svg(i===1?vessel(115,400,500,'첫 번째 컵')+vessel(285,350,500,'두 번째 컵'):vessel(200,i===2?750:1000,1000,'물통 · 최대 1000mL'));caption=i===1?'두 컵은 같은 크기예요. 물을 합칠 때 양을 생각해요.':'물통의 전체 들이와 지금 담긴 물을 구별해요.';
 }else if(id==='g3-50'){
  art=`<div class="study-machine"><b>숫자 카드 검사대</b>${facts.map(s=>{const [label,nums]=s.split(':');return `<section><strong>${e(label)}</strong>${/^[\s\d,]+$/.test(nums||'')?cards(nums.split(',').map(v=>v.trim())):`<p>${e(nums||'')}</p>`}</section>`;}).join('')}</div>`;caption='통과한 카드와 통과하지 못한 카드를 함께 비교해요.';
 }else if(id==='g4-06'){
  const n=[8,7,10][i],a=[3,2,3][i],b=[2,4,4][i];art=strip(n,a,b)+`<div class="study-key"><span>초록 ${a}/${n}</span><span>주황 ${b}/${n}</span><span>빈칸: 나머지</span></div>`;caption='전체를 같은 크기로 나눈 모양이에요. 두 색은 서로 다른 몫이에요.';
 }else if(id==='g4-11'){
  art=rect(...[['6cm','4cm'],['10cm','?cm'],['7m','7m',true]][i]);caption='둘레는 테두리를 한 바퀴 도는 길이예요. 그림은 모양 예시예요.';
 }else if(id==='g4-15'){
  art=`<div class="study-codebook">${(i===2&&q.revision?['○ → ?','△ → ?','□ → ?']:i===2?['새 → ★','개 → ◆']:['○ → 1','△ → 2','□ → 3','☆ → 4']).map(s=>`<span>${e(s)}</span>`).join('')}</div>`;caption=i===2&&q.revision?'이번에는 새 암호예요. 두 계산에 모두 맞는 숫자를 찾아요.':'기호 하나가 무엇을 나타내는지 확인하고 이어서 읽어요.';
 }else if(id==='g4-21'){
  art=i===0?cards([3,0,7,5]):i===1?`<div class="study-place-values">${[5,2,8,4,7].map((n,j)=>`<div><b>${n}</b><span>${['만','천','백','십','일'][j]}의 자리</span></div>`).join('')}</div>`:cards(['만','천','백','십','일']);caption=i===0?'카드의 순서를 바꾸어 생각해요. 각 카드는 한 번씩만 써요.':'왼쪽부터 자리 이름을 확인해요.';
 }else if(id==='g4-24'&&i===2){
  art=`${q.revision?'<b>색 반복</b>':''}<div class="study-beads">${Array.from({length:q.revision?4:12},(_,j)=>`<span style="background:${['#e47b70','#e47b70','#6d9fce','#eac75f'][j%4]}" aria-label="${['빨강','빨강','파랑','노랑'][j%4]}">${j+1}</span>`).join('')}</div>${q.revision?'<b>모양 반복</b><div class="study-codebook"><span>○</span><span>★</span><span>★</span></div>':''}`;caption=q.revision?'색의 반복과 모양의 반복을 따로 확인해요. 두 조건을 함께 이어 가 보세요.':'처음 12개의 구슬이에요. 같은 네 가지 순서가 계속 이어져요.';
 }else if(id==='g4-41'){
  art=svg(i===2?Array.from({length:5},(_,j)=>line(55,35+j*35,345,35+j*35)).join('')+line(200,20,200,195,'dashed')+text(265,209,'세로로 접은 선'):Array.from({length:3},(_,j)=>line(65,55+j*60,350,55+j*60)+text(35,61+j*60,(j+1)+'번')).join('')+[145,265].map((x,j)=>line(x,25,x,195)+text(x,215,['가','나'][j])).join(''));caption='가로로 곧게 뻗은 길과 세로로 곧게 뻗은 길을 비교해요.';
 }else if(id==='g4-46'){
  const triangles=i===2?[[[140,150],[260,150],[140,30],'두 각: 45°, 45°']]:[[[25,110],[105,110],[65,40.72],'가'],[[135,110],[215,110],[175,60.04],'나'],[[245,110],[305,110],[245,30],'다'],[[315,110],[395,110],[355,80],'라']];art=svg(triangles.map(t=>`<polygon points="${t.slice(0,3).map(p=>p.join(',')).join(' ')}"/>${text(t.slice(0,3).reduce((s,p)=>s+p[0],0)/3,180,t[3])}`).join(''));caption='삼각형의 변과 각을 비교해요. 정확한 길이와 각의 조건은 아래 자료를 읽어요.';
 }else if(id==='g4-56'&&i!==1){
  const groups=i===0?[[4,12,'색연필'],[7,8,'사인펜']]:[[6,15,'구슬']];art=groups.map(([n,size,label])=>`<section class="study-bundles"><b>${label}</b><div>${Array.from({length:n},()=>`<span>${size}${label==='구슬'?'개':'자루'}</span>`).join('')}</div></section>`).join('');caption='한 묶음에 든 수와 묶음의 수를 따로 확인해요.';
 }else if(id==='csx-45'&&i===2){
  art=svg([0,1,2].map(j=>`<rect x="95" y="${30+j*50}" width="210" height="50" rx="3"/>${text(200,62+j*50,['위쪽 띠','가운데 띠','아래쪽 띠'][j])}`).join(''));caption='세 띠를 빨강·파랑·노랑으로 칠해요. 맞닿은 띠는 다른 색이고, 빨강은 딱 한 번 사용해요.';
 }else if(id==='csx-17'){
  art=`<div class="study-tile-stages">${[1,2,3].map(n=>`<div><b>${n}단계</b><div>${Array.from({length:n*2},()=>'<span></span>').join('')}</div></div>`).join('')}</div>`;caption='타일은 같은 크기예요. 단계가 바뀔 때 늘어나는 수를 찾아요.';
 }else if(id==='g6-02'){
  const whole=[3,4,6][i],part=['1/2','2/3','3/4'][i],water=/물|병|\bL\b/.test(q.prompt);art=water?svg(vessel(105,6000,6000,'전체 물')+vessel(295,750,1000,'병 한 개')):`<p class="study-board-note">전체 ${whole}m</p>${strip(whole)}<p class="study-board-note">한 사람 몫 ${part}m</p><div class="study-ribbon-unit" style="width:${[.5,2/3,.75][i]/whole*100}%"></div>`;caption=water?'전체 물 6L를 한 병에 3/4L씩 담아요. 그림의 용기 크기는 모양 예시예요.':'위 리본의 한 칸은 1m예요. 아래는 한 사람 몫을 같은 길이 기준으로 나타낸 모습이에요.';
 }else if(id==='g6-19'){
  const pts=[[45,105],[200,35],[200,175],[355,105]],names=['집','공원','문구점','학교'];
  const edges=facts.map(s=>{const m=s.match(/^(집|공원|문구점|학교)\s*[→↔]\s*(집|공원|문구점|학교)/);if(!m)return null;const tail=s.slice(m[0].length),minutes=tail.match(/\d+/);return [names.indexOf(m[1]),names.indexOf(m[2]),/공사|막힘/.test(tail)?'공사 중':minutes?minutes[0]+'분':''];}).filter(Boolean);
  art=svg(edges.map(([a,b,s])=>line(...pts[a],...pts[b],s==='공사 중'?'closed-road':'')+text((pts[a][0]+pts[b][0])/2+(a===1&&b===2?33:0),(pts[a][1]+pts[b][1])/2-9,s)).join('')+pts.map((p,j)=>dot(...p,['집','공원','문구점','학교'][j])).join(''));caption='선에 적힌 수는 그 길로 이동하는 데 걸리는 시간이에요.';
 }else if(id==='g6-21'){
  art=i===0?svg(line(45,50,355,50)+text(200,30,'전체 경계 12.6m')+'<rect x="45" y="100" width="120" height="65" rx="4" class="study-wood"/>'+text(105,195,'울타리 한 장 1.8m')):i===1?svg(vessel(100,9500,10000,'전체 물')+vessel(300,400,1000,'컵 한 개')):svg(line(55,110,345,110)+text(200,70,'가려는 거리 203km')+text(200,155,'휘발유 1L → 14.5km'));caption='전체 양과 한 묶음의 양을 구별해요. 그림의 길이나 크기를 재지는 않아요.';
 }else if(id==='g6-26'||id==='g6-42'){
  const groups=id==='g6-26'?[[5,4],[3,4],[2,3,5]][i]:i===2?[3,7]:[5,2];const names=id==='g6-42'?(i===2?['원액','물']:['밀가루','설탕']):i===0?['민수','지우']:groups.map((_,j)=>(j+1)+'모둠');art=`<div class="study-ratio">${groups.map((n,j)=>`<section><b>${names[j]} · ${n}부분</b><div style="width:${n/Math.max(...groups)*100}%">${strip(n,n)}</div></section>`).join('')}</div>`;caption='작은 한 칸은 같은 양을 나타내요. 칸의 비와 실제 양을 연결해요.';
 }else if(id==='g6-44'){
  art=i===1?svg(vessel(110,2000,2000,'물통')+vessel(290,500,2000,'컵 한 잔')):svg(box(...(i===0?['10cm','10cm','6cm']:['1m','1m','0.5m'])));caption='용기 안쪽의 길이와 물의 양이에요. 단위를 맞추어 생각해요.';
 }else if(id==='g6-57'){
  const n=i===2?4:5,known=i===2?{0:3,3:1}:{2:5};art=`<div class="study-slots">${Array.from({length:n},(_,j)=>`<div><small>${j+1}번 칸</small><b>${known[j]||'?'}</b></div>`).join('')}</div>`;caption='조건에서 이미 알려 준 숫자만 놓았어요. 나머지는 단서로 찾아요.';
 }else if(id==='g6-58'){
  art=svg(Array.from({length:6},(_,j)=>line(80,15+j*32,240,15+j*32)+line(80+j*32,15,80+j*32,175)).join('')+'<image href="assets/casual-v1/robot-v2.webp" x="125" y="111" width="65" height="65"/>'+text(310,55,'북 ↑')+text(310,95,'동 →')+text(160,205,'출발 · 북쪽 보기'));caption='먼저 앞으로 이동하고, 제자리에서 오른쪽으로 돌아요. 이동 경로는 직접 생각해요.';
 }
 if(!art)return '';
 return `<div class="visual-diagram study-board" data-study-id="${e(id)}">${root.ThinkstarScenes?.worldRender(id)||''}<figure>${art}<figcaption>${e(caption)}</figcaption></figure>${clueList(facts)}</div>`;
}
function grid(w=5,h=5){return Array.from({length:w*h},(_,i)=>`<rect x="${100+i%w*30}" y="${10+(h-1-Math.floor(i/w))*30}" width="30" height="30"/>`).join('')+Array.from({length:w},(_,i)=>text(115+i*30,176,i+1)).join('')+Array.from({length:h},(_,i)=>text(83,30+(h-1-i)*30,i+1)).join('')+text(330,110,'↑ 세로')+text(330,155,'가로 →');}
root.ThinkstarGradeDiagrams={render(id,q,index){
 const study=studyDiagram(id,q,index);if(study)return study;
 let body='',caption='',label=q.title;
 if(id==='g3-14'){
  const n=index===2?4:6;
  body=line(45,85,355,85)+Array.from({length:n+1},(_,i)=>{const x=45+i*310/n;return line(x,76,x,94)+text(x,115,i);}).join('')+text(45,55,'출발')+text(280,45,'앞으로 →')+text(120,155,'← 뒤로');
  caption=index===0?'앞으로 3칸 → 뒤로 1칸 → 앞으로 2칸':index===1?'[앞으로 2칸 → 뒤로 1칸]을 3번 반복':'0~4 안에서만 움직여요. 목표는 3!';
 }else if(id==='g3-44'){
  body=line(55,120,295,120)+line(295,120,295,45)+dot(55,120,'공원')+dot(135,120,'학교')+dot(295,120,'서점')+dot(295,45,'빵집')+text(95,90,'1칸')+text(215,90,'2칸')+text(335,85,'1칸')+text(100,35,'북 ↑   동 →');caption='화면의 위쪽은 북쪽, 오른쪽은 동쪽이에요.';
 }else if(id==='g3-58'){
  body=line(150,35,150,85)+line(150,85,245,85)+line(245,85,245,145)+dot(150,35,'공원')+dot(150,85,'병원')+dot(245,85,'우체국')+dot(245,145,'시장')+text(330,35,'북 ↑')+text(335,60,'동 →');caption='이어진 길 하나는 1칸이에요.';
 }else if(id==='g3-60'){
  const pairs=[['사과 1개','귤 2개'],['배 1개','사과 2개']];
  body=pairs.map((p,i)=>{const y=35+i*80;return line(75,y+25,325,y+25)+`<path d="M200 ${y+25}l-12 22h24Z"/>`+text(100,y,p[0])+text(300,y,p[1]);}).join('');caption='이 퍼즐에서는 같은 종류의 과일은 무게가 같아요.';
 }else if(id==='g4-01'){
  if(index===0)body=line(50,135,350,135)+line(200,135,238,31)+text(237,117,'70°')+text(151,109,'?');
  if(index===1)body='<polygon points="85,145 290,145 160,15"/>'+text(121,132,'60°')+text(250,132,'45°')+text(170,59,'?');
  if(index===2)body='<circle cx="200" cy="90" r="72"/>'+Array.from({length:6},(_,i)=>line(200,90,200+72*Math.cos(i*Math.PI/3),90+72*Math.sin(i*Math.PI/3))).join('')+text(228,107,'?');
  caption=['직선의 각은 180°예요.','삼각형의 세 각을 더하면 180°예요.','한 바퀴는 360°. 여섯 조각은 모두 같아요.'][index];
 }else if(id==='g4-22'){
  if(index<2){const layers=index===0?2:4;body=Array.from({length:layers},(_,i)=>`<rect x="${135+i*7}" y="${30+i*9}" width="110" height="85" rx="4"/>`).join('')+`<circle class="hole" cx="180" cy="80" r="7"/>`+(index===1?'<circle class="hole" cx="220" cy="105" r="7"/>':'');caption=`접힌 종이 ${layers}겹 · ${index===0?1:2}곳을 끝까지 뚫어요. 선과 가장자리는 피합니다.`;}
  else{body=Array.from({length:8},(_,i)=>`<rect x="${24+i*44}" y="60" width="44" height="70"/>${text(46+i*44,88,i+1)}`).join('')+line(200,40,200,145,'dashed')+'<circle class="hole" cx="90" cy="109" r="6"/>'+text(200,25,'접는 선');caption='왼쪽 절반을 오른쪽으로 접어요. 1번이 8번 위에 겹쳐요.';}
 }else if(id==='g4-18'){
  const groups=index<2?[['모래층','진흙층','조개 화석 층','자갈층']]:[['A 모래층','B 진흙층','C 자갈층'],['B 진흙층','C 자갈층','D 석회암층']];
  body=groups.map((arr,j)=>arr.map((s,i)=>`<rect x="${groups.length===1?100:30+j*195}" y="${20+i*36}" width="${groups.length===1?200:165}" height="36" style="fill:${['#f0d9a0','#ddc8ac','#d8e1c4','#cec6bc'][index<2?i:'ABCD'.indexOf(s[0])]}"/>${text(groups.length===1?200:112+j*195,44+i*36,s)}`).join('')).join('');caption=(index<2?'':'왼쪽: 지역 가 · 오른쪽: 지역 나. ')+'아래층부터 쌓였고 뒤집히거나 끊어지지 않았어요.';
 }else if(id==='g4-40'){
  const places=index===0?[[1,1,'집'],[4,3,'학교']]:index===1?[[1,1,'집'],[4,3,'학교'],[5,2,'문구']]:[[1,1,'집'],[4,3,'학교'],[2,2,'서점'],[4,5,'공원'],[6,3,'빵집']];
  body=grid(6,5)+places.map(([x,y,s])=>text(115+(x-1)*30,30+(5-y)*30,s)).join('');caption='가로·세로로 한 칸씩만 이동해요. 막힌 길은 없어요.';
 }else if(id==='g4-45'){
  const [w,h]=[[4,3],[3,3],[5,4]][index];body=Array.from({length:w*h},(_,i)=>`<rect x="${100+i%w*35}" y="${12+Math.floor(i/w)*35}" width="35" height="35"/>`).join('');caption=`타일 한 장은 1칸 × ${index===2?3:2}칸이에요. 자르거나 겹치지 않고 덮어요.`;
 }else if(id==='g4-55'){
  const pts=[[65,90],[155,35],[295,40],[300,140],[145,150]],edges=[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]];
  body=edges.map(([a,b],i)=>{const off=(index>0&&i===1)||(index===2&&i===2);return line(...pts[a],...pts[b],off?'closed-road':'');}).join('')+pts.map((p,i)=>dot(...p,['가','나','다','라','마'][i])).join('');caption='실선은 갈 수 있는 길, 붉은 점선은 끊긴 길이에요.';
 }else if(id==='g4-60'){
  body=grid()+`<circle class="start-dot" cx="115" cy="145" r="8"/>`;caption='파란 점에서 출발해요. 가로는 오른쪽으로, 세로는 위로 커져요.';
 }else if(id==='csx-38'){
  body='<circle cx="60" cy="85" r="29" style="fill:#ffe2a0"/>'+text(60,135,'전등')+line(105,60,170,60)+line(105,85,170,85)+line(105,110,170,110)+'<circle cx="235" cy="85" r="58" style="fill:#34546f"/><path d="M235 27A58 58 0 0 0 235 143Z" style="fill:#b8dccc"/>'+text(210,88,'낮')+text(261,88,'밤').replace('<text ','<text style="fill:#fff" ')+text(235,170,'지구본을 돌려요 ↻');caption='전등은 계속 켜 있어요. 표식 하나가 낮과 밤을 번갈아 지나가요.';
 }else if(id==='csx-44'){
  const names=['초승','상현','보름','하현','그믐'];
  body=names.map((s,i)=>{const x=42+i*78;let shape=`<circle cx="${x}" cy="70" r="26" style="fill:#324765"/>`;if(i===0)shape+=`<path d="M${x} 44A26 26 0 0 1 ${x} 96Q${x+35} 70 ${x} 44" style="fill:#ffeac2;stroke:none"/>`;if(i===1)shape+=`<path d="M${x} 44A26 26 0 0 1 ${x} 96Z" style="fill:#ffeac2;stroke:none"/>`;if(i===2)shape+=`<circle cx="${x}" cy="70" r="26" style="fill:#ffeac2"/>`;if(i===3)shape+=`<path d="M${x} 44A26 26 0 0 0 ${x} 96Z" style="fill:#ffeac2;stroke:none"/>`;if(i===4)shape+=`<path d="M${x} 44A26 26 0 0 0 ${x} 96Q${x-35} 70 ${x} 44" style="fill:#ffeac2;stroke:none"/>`;return shape+text(x,120,index===2&&i===3?'?':s);}).join('')+text(278,163,index===2?'보름을 본 뒤 약 일주일':'차오른 뒤 다시 기울어요');caption='한국에서 본 모양 예시. 달은 햇빛을 반사해요. 밝은 부분이 보이는 범위가 달라져요.';
 }else if(id==='g6-04'){
  body=box(...[['5cm','4cm','3cm'],['6cm','4cm','?cm'],['6cm','4cm','4cm']][index]);caption=['상자의 세 방향 길이를 살펴봐요.','이 상자의 부피는 96cm³예요.','채울 블록은 한 모서리가 2cm인 정육면체예요.'][index];
 }else if(id==='g6-31'){
  if(index<2)body='<circle cx="85" cy="90" r="35"/><circle cx="265" cy="90" r="70"/>'+line(85,90,120,90)+line(265,90,335,90)+text(87,80,'10cm')+text(295,80,'20cm')+text(85,151,'8,000원')+text(265,176,'24,000원');
  else body='<circle cx="200" cy="85" r="65"/>'+line(200,85,265,85)+text(230,75,'4m');
  caption=index<2?'반지름은 중심에서 테두리까지! 원주율은 3으로 계산해요.':'원의 넓이 = 반지름 × 반지름 × 3 · 1㎡마다 잔디 2장';
 }else if(id==='g6-50'){
  body='<rect x="25" y="85" width="350" height="90" style="fill:#dceef5;stroke:none"/>'+line(25,85,375,85)+line(200,15,200,170,'dashed')+line(142,15,200,85)+line(200,85,246,168)+text(70,40,'공기')+text(70,150,'물')+text(254,25,'수직인 선')+text(132,64,'입사각')+text(268,120,'굴절각');caption='각도는 수직인 점선에서부터 재요. 그림은 방향을 설명하는 모양 예시예요.';
 }else if(id==='g6-60'){
  if(index===0)body=[60,180,300].map(x=>`<rect x="${x-30}" y="55" width="60" height="60"/>`).join('');
  else{const [w,h]=index===1?[3,1]:[2,2],x=200-w*27,y=90-h*27;body=Array.from({length:h+1},(_,r)=>line(x,y+r*54,x+w*54,y+r*54)).join('')+Array.from({length:w+1},(_,c)=>line(x+c*54,y,x+c*54,y+h*54)).join('');}
  caption=index===0?'각 정사각형은 서로 닿지 않아요. 한 변은 막대 1개예요.':'붙어 있는 두 정사각형은 사이의 막대 하나를 함께 써요.';
 }else if(id==='g6-36'){
  const nums=index===2?[3,1,2]:[2,1,1,3],cols=index===2?3:2;
  body=nums.map((n,i)=>`<rect x="${125+i%cols*55}" y="${25+Math.floor(i/cols)*50}" width="55" height="50"/>${text(152+i%cols*55,57+Math.floor(i/cols)*50,n)}`).join('')+text(195,15,'뒤쪽')+text(195,151,'↑ 앞에서 보는 방향')+text(320,85,'← 오른쪽 옆');caption='위에서 본 지도 · 숫자는 그 칸에 쌓인 개수예요.';
 }
 if(!body)return '';
 const facts=q.visual?.type==='cards'?q.visual.items:q.visual?.type==='bars'?q.visual.labels.map((s,i)=>s+' → '+q.visual.values[i]+(q.visual.unit||'')):[];
 return `<div class="visual-diagram">${root.ThinkstarScenes?.worldRender(id)||''}<figure class="puzzle-diagram"><svg viewBox="0 0 400 190" role="img" aria-label="${e(label+' 그림. '+caption)}">${body}</svg><figcaption>${e(caption)}</figcaption></figure>${clueList(facts)}</div>`;
}};
})(globalThis);
