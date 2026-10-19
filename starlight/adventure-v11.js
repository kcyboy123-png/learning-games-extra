'use strict';
(()=>{
 const D=STAR_DATA,Q=STAR_QUESTS,gaya=D.regions.find(r=>r.id==='gaya');
 gaya.missions.push('GY03');gaya.npcs.push(1);gaya.names.push('장터 상인');
 Q.GY03={mode:'trade',title:'덩이쇠로 값을 치러라!',tag:'가야 장터',npc:1,instruction:'값표를 보고 덩이쇠를 담은 뒤, 상인에게 건네 줘!',context:'철이 돈처럼 쓰이는 가야 장터! 세 가지 물건을 사고 여행 채비를 하자.',tip:'덩이쇠 1개와 3개 버튼으로 값을 맞춰 봐. 많이 담았다면 1개 빼기로 조절해!',learn:'가야에서는 덩이쇠를 화폐처럼 사용하기도 했어요.',relicName:'덩이쇠',relicCaption:'가야 · 철 재료이자 교환의 수단',note:'교과서의 덩이쇠 쓰임을 바탕으로 만든 거래 놀이입니다. 물건의 가격과 거래 횟수는 게임 설정입니다.'};
 D.missions.push({id:'GY03',region:'gaya',title:Q.GY03.title,tag:Q.GY03.tag,type:'trade',npc:'장터 상인',story:Q.GY03.context,hint:Q.GY03.tip,explain:Q.GY03.learn,reward:'화폐처럼 쓰인 덩이쇠',time:'1~2분',clues:[['철 재료','덩이쇠는 철제품을 만드는 재료였어.'],['교환','덩이쇠는 화폐처럼 쓰이기도 했어.'],['교역','가야의 철은 다른 나라로도 전해졌어.']]});
 Object.assign(Q.GJ01,{instruction:'200명을 모집하고, 5초 안에 ‘함께 끌기’를 20번 눌러 줘!',tip:'사람을 네 번 모집한 뒤 도전해! 함께 끌기를 처음 누르면 5초가 시작돼. 20번 힘을 모아 줘.'});
 Object.assign(Q.GG03,{targetPortraits:['jangsu','gwanggaeto'],targets:['장수왕','광개토대왕'],note:'왕의 그림은 특징을 상상해 그린 학습용 초상이며 실제 얼굴을 재현한 것이 아닙니다.'});
 Q.BJ01.tip='반짝이는 왼쪽 칸에서 시작! 왼쪽 상자 → 가운데 물길 → 오른쪽 상자를 실은 뒤, 가운데로 돌아와 위쪽 나루터로 가면 17칸이야.';
 Q.SL03.note+=' 밤 풍경은 실제 첨성대 주변의 평탄한 잔디밭을 참고해 그린 학습용 일러스트입니다. 하늘의 별 배치는 게임용입니다.';
 STAR_DATA.sources.push(['경주시 · 첨성대 주변 잔디밭과 계림','https://www.gyeongju.go.kr/webzine/GJstory/vol151/html/sub1-3.html']);
 ['GJ01','GG03','BJ01'].forEach(id=>{const m=D.missions.find(m=>m.id===id);m.story=Q[id].instruction;m.hint=Q[id].tip;});
 // Old complete records keep their rewards and reviews when the new Gaya mission is added.
 const legacyIds=D.missions.filter(m=>m.id!=='GY03').map(m=>m.id);
 const completeOld=v=>legacyIds.every(id=>v.done?.includes(id));
 const uniqueList=(v,max,accept)=>Array.isArray(v)&&v.length<=max&&new Set(v).size===v.length&&v.every(accept);
 window.STAR_SAVE_RULES={
  valid(v){
   if(!v||![1,2,3,4].includes(v.version))return false;
   const cap={1:1180,2:1280,3:1460,4:1470}[v.version];
   if(!Number.isInteger(v.score)||v.score<0||v.score>cap||!uniqueList(v.done,v.version<4?18:D.missions.length,id=>D.missions.some(m=>m.id===id))||v.done.includes('END01')&&!completeOld(v))return false;
   if(v.version>1&&(!Number.isInteger(v.hintUses)||v.hintUses<0||v.hintUses>=100000||typeof v.completionBonus!=='boolean'||typeof v.endingSeen!=='boolean'||v.completionBonus&&!completeOld(v)))return false;
   if(v.version>=3&&(!uniqueList(v.reviewed,18,id=>Object.values(STAR_REVIEWS).flat().some(q=>q.id===id))||!D.regions.every(r=>!v.reviewed.some(id=>STAR_REVIEWS[r.id].some(q=>q.id===id))||r.missions.filter(id=>id!=='GY03').every(id=>v.done.includes(id)))||typeof v.music!=='boolean'||![v.sfxVolume,v.musicVolume].every(n=>Number.isFinite(n)&&n>=0&&n<=1)))return false;
   return uniqueList(v.clues,D.missions.length*3,k=>D.missions.some(m=>[0,1,2].some(i=>k===m.id+':'+i)))&&uniqueList(v.stars,18,k=>D.regions.some(r=>[0,1,2].some(i=>k===r.id+':'+i)))&&D.regions.some(r=>r.id===v.region)&&Number.isInteger(v.failures)&&v.failures>=0&&v.failures<100000&&typeof v.sound==='boolean'&&typeof v.started==='boolean'&&['forest','sunset','night'].includes(v.theme);
  },
  normalize:v=>({...v,done:[...v.done],clues:[...v.clues],stars:[...v.stars],version:4,reviewed:v.version>=3?[...v.reviewed]:[],music:v.music??true,sfxVolume:v.sfxVolume??.55,musicVolume:v.musicVolume??.3,hintUses:v.hintUses||0,completionBonus:!!v.completionBonus,endingSeen:!!v.endingSeen})
 };
})();
window.installAdventureV11=function(G){
 const $=s=>document.querySelector(s);
 G.showMissionIntro=(id,start)=>{
  const crisis=id==='GG01';
  G.modal(crisis?'고구려의 산성을 지켜!':'첨성대 아래, 별빛의 밤',`<section class="story-scene ${crisis?'siege-intro':'stars-intro'}"><div class="story-panorama" role="img" aria-label="${crisis?'횃불이 켜진 고구려의 밤 산성':'평탄한 잔디밭에 선 첨성대와 별이 빛나는 밤하늘'}">${crisis?'<span class="siege-banner">긴급 전령 · 612년</span><div class="siege-signals" aria-hidden="true">▲ ▲ ▲</div>':'<span class="night-caption">신라 · 경주 첨성대</span>'}</div><div class="story-caption"><span class="story-eyebrow">${crisis?'산성에 비상이 걸렸어':'별이와 함께 남기는 하늘의 기록'}</span><h3>${crisis?'수나라가 공격해 왔다!':'오늘 밤, 잃어버린 별빛을 찾아볼까?'}</h3><p>${crisis?'솔과 함께 성문을 지키자.<br>초록 구간에서 발사해 10번 연속 명중!':'옛 신라 사람들은 하늘의 변화를 살폈어.<br>흩어진 일곱 별을 이어 기록을 되찾아 줘.'}</p><button class="btn gold" id="story-start">${crisis?'활을 들고 산성 지키기':'별빛 기록 잇기'} <span>→</span></button><small>${crisis?'수나라의 침입을 배경으로 한 가상의 산성 방어 놀이':'첨성대 주변 잔디밭을 참고한 그림 · 별 배치는 게임용'}</small></div></section>`,crisis?'수비대 솔의 긴급 요청':'루미의 시간 여행');
  $('#modal').classList.add('story-modal');G.cleanupMission=()=>$('#modal').classList.remove('story-modal');
  G.sound(crisis?'alarm':'star');$('#story-start').onclick=start;
 };
 G.celebrateRegion=(id,q,detail,artifact)=>{
  const r=STAR_DATA.regions.find(r=>r.id===id);let alive=true;
  G.modal(r.name.replace(/ 탐험$/,'')+' 탐험 성공!',`<section class="country-success"><div class="success-scene" style="--country-art:url('assets/${r.art}')"><div class="success-stars" aria-label="미션 세 개 완료">✦ ✦ ✦</div><img src="assets/lumi-cheer-v11.png" alt="두 주먹을 들고 환호하는 루미"><span class="success-ribbon">${r.name} · 미션 3/3 완료</span></div><div class="success-copy"><span class="pill">마지막 미션 +10점 · 현재 ${G.state.score.toLocaleString()}점</span><h3>해냈어! 우리 함께 되찾았어.</h3><p>${detail||'네가 모은 세 가지 기록이 이 여행지를 환하게 밝혔어.'}</p><div class="success-discovery">${q.relicName?`<div id="success-relic"></div><strong>${q.relicName}</strong>`:''}<p>${q.learn}</p></div>${q.mode==='timeline'?G.timelineRecap():''}<button class="btn gold" id="success-review">${G.journeyComplete()?'완주 엔딩 보기':G.reviewCount(id)<3?'여행의 기억 3문제로':'이 나라의 기억 돌아보기'} →</button><p class="success-next-note">미션 다음은 기억 3문제!<br>기억을 완성한 뒤 다른 여행지로 떠나자.</p></div></section>`,'루미와 함께 완성한 한 장의 시간 지도');
  $('#modal').classList.add('success-modal');
  const toReview=()=>G.journeyComplete()?G.ending():G.openReview(id);
  const cancel=e=>{e.preventDefault();toReview();};
  $('#modal').addEventListener('cancel',cancel);$('#modal .close').hidden=true;
  G.cleanupMission=()=>{alive=false;$('#modal').removeEventListener('cancel',cancel);$('#modal').classList.remove('success-modal');};
  if(q.relicName&&artifact)Promise.resolve(artifact).then(src=>{if(alive&&$('#success-relic'))$('#success-relic').innerHTML=`<img src="${src}" alt="${q.relicName} 학습용 그림">`;});
  $('#success-review').onclick=()=>G.journeyComplete()?G.ending():G.openReview(id);
  $('#success-review').focus({preventScroll:true});G.sound('region');
 };
};
