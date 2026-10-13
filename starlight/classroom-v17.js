'use strict';
(()=>{
 const Q=STAR_QUESTS;
 Q.HG02.context='한강을 둘러싼 세 나라의 이야기! 왕 이름과 나라를 함께 살펴보자.';
 Q.HG02.learn='백제 근초고왕(4세기) → 고구려 장수왕(5세기) → 신라 진흥왕(6세기) 순으로 전성기를 맞이했어요.';
 Q.HG02.note='왕의 모습은 고대 복식에서 특징을 얻어 그린 상상 초상입니다. 교과서 29~31쪽의 나라별 발전 내용을 바탕으로 대표 시기를 비교해요. 건국 순서가 아니며 세 나라는 같은 시대에 함께 존재했어요.';
 const meaning='나루터는 배를 타고 내리거나 짐을 싣는 곳이야.';
 for(const id of ['BJ01','GY02','HG01','HG03'])Q[id].context=((Q[id].context||'')+' '+meaning).trim();
 Q.BJ01.instruction='상자 두 개를 모아 나루터까지! 가장 짧은 길로 배를 보내 줘.';
 STAR_DATA.regions.find(r=>r.id==='hangang').intro='나루터는 배를 타고 내리거나 짐을 싣는 곳이야. 들판과 마을을 물길로 이어 보자!';
 STAR_DATA.missions.find(m=>m.id==='HG02').explain=Q.HG02.learn+' '+Q.HG02.note;
 STAR_DATA.sources.push(['나루와 나루터의 차이 · 국립국어원','https://www.korean.go.kr/front/mcfaq/mcfaqView.do?mcfaq_seq=8815&mn_id=217&pageIndex=1'],['삼국의 대표 성장 시기 · 국사편찬위원회 우리역사넷','https://contents.history.go.kr/front/ta/view.do?levelId=ta_h61_0040_0020_0010']);
})();
window.installClassroomV17=G=>{
 G.timelineRecap=()=>`<section class="timeline-recap" aria-label="삼국의 전성기 정리"><strong>한 번 더 기억해 보자!</strong><div>${[['백제','근초고왕','4','baekje-geunchogo'],['고구려','장수왕','5','goguryeo-jangsu'],['신라','진흥왕','6','silla-jinheung']].map(([country,king,century,art])=>`<article><img src="assets/${art}-v17.webp" alt="${king}의 상상 초상"><b>${country} · ${century}세기 <small>(${century}C)</small></b><span>${king}</span></article>`).join('')}</div><p>C는 세기를 뜻해. 세 나라는 같은 시대에 함께 존재했어.<br>이 순서는 나라가 세워진 순서가 아니라, 대표적인 전성기의 흐름이야.</p></section>`;
};
