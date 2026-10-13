'use strict';
(()=>{
 const regions={
  gojoseon:{npcs:[0,1,2],names:['마루','도구 장인','기록지기'],mood:'초록 아침',intro:'마루와 친구들이 기다려. 고인돌부터 함께 옮겨 보자!'},
  goguryeo:{art:'goguryeo-v2.png',npcs:[3,4,1],names:['수비대 솔','벽화 화가','기록지기'],mood:'푸른 밤',sub:'횃불이 빛나는 산성',intro:'밤의 산성에 도착했어. 수비대 솔을 만나 보자!'},
  baekje:{npcs:[8,5,1],names:['나루지기','도공 아라','석탑 장인'],mood:'햇살 낮',intro:'배를 타고, 향로를 맞추고, 석탑을 세워 보자!'},
  gaya:{art:'gaya-v2.png',npcs:[6,8],names:['대장장이 쇠돌','교역 상인'],mood:'붉은 노을',sub:'불꽃과 강의 대장간',intro:'노을빛 대장간이야. 쇠돌과 함께 철을 두드려 보자!'},
  silla:{npcs:[5,2,7],names:['금관 장인','발굴 친구','별이'],mood:'별빛 저녁',intro:'금관을 맞추고, 숨은 불상을 찾고, 별을 이어 보자!'},
  hangang:{art:'hangang-v2.png',npcs:[8,1,0],names:['나루지기','시간 기록가','농부'],mood:'맑은 낮',sub:'들판과 마을을 잇는 물길',intro:'강과 마을이 만나는 곳에 새 나루터를 만들어 보자!'}
 };
 STAR_DATA.regions.forEach(r=>Object.assign(r,regions[r.id]));
 window.STAR_QUESTS={
 GJ01:{mode:'pull',title:'함께 끌자, 고인돌!',tag:'힘 모으기',npc:0,instruction:'사람을 모으고 돌을 세 번 끌어 줘!',tip:'힘 표시가 초록색이 되도록 사람을 모아 봐.',learn:'큰 고인돌을 만들려면 여러 사람의 힘과 준비가 필요했어요.',note:'사람 수와 필요한 힘은 게임 규칙이며 실제 고인돌의 운반 인원은 아닙니다.'},
 GJ02:{mode:'sort',title:'공방의 도구 정리',tag:'그림 분류',npc:1,instruction:'물건을 누르고, 알맞은 재료 칸에 놓아 줘!',items:[{art:'dagger',label:'비파형 동검',target:0},{item:0,label:'반달 돌칼',target:1},{item:2,label:'토기',target:2}],targets:['청동','돌','흙'],tip:'검은 청동, 돌칼은 돌, 토기는 흙으로 만들었어.',learn:'청동기 시대에도 돌과 흙으로 만든 도구를 함께 썼어요.'},
 GJ03:{mode:'sort',title:'옛 기록의 그림 단서',tag:'그림 연결',npc:2,instruction:'기록 속 단서를 알맞은 생활 그림에 연결해 줘!',items:[{item:3,label:'곡식으로 갚기',target:0},{item:2,label:'남의 물건 훔치기',target:1}],targets:['농사','개인의 재산'],targetItems:[3,5],tip:'곡식은 농사, 남의 물건은 개인의 재산과 연결돼.',learn:'고조선의 법 기록에서 곡식과 개인의 재산이 중요했음을 짐작해요.'},
 GG01:{mode:'timing',title:'산성의 활쏘기',tag:'타이밍',npc:3,instruction:'초록 구간에서 발사! 과녁을 세 번 맞혀 줘.',tip:'움직이는 표시가 초록 구간의 가운데에 올 때 눌러 봐.',learn:'고구려 고분 벽화에는 활쏘기와 사냥 장면이 남아 있어요.',note:'과녁 놀이는 학습을 위한 창작 체험이며 실제 훈련 절차의 재현이 아닙니다.'},
 GG02:{mode:'mosaic',title:'벽화를 되살려라',tag:'6조각 복원',npc:4,art:'mural',instruction:'조각 두 개를 눌러 자리를 바꾸고 벽화를 완성해 줘!',tip:'가장자리와 사람의 옷이 이어지는 부분부터 맞춰 봐.',learn:'고분 벽화의 인물과 장면은 옛사람의 생활을 살피는 단서예요.',note:'이 그림은 고구려 벽화에서 영감을 받은 창작 학습 그림입니다.'},
 GG03:{mode:'sort',title:'두 왕의 기록을 찾아라',tag:'기록 연결',npc:1,instruction:'기록을 누르고, 알맞은 왕의 자리에 놓아 줘!',items:[{item:11,label:'여러 지역으로 세력 확대',target:0},{item:11,label:'427년, 평양으로 수도 이동',target:1}],targets:['광개토 대왕','장수왕'],tip:'광개토 대왕은 세력 확대, 장수왕은 평양으로 수도 이동!',learn:'왕의 활동과 시기를 함께 보면 고구려의 변화를 알 수 있어요.'},
 BJ01:{mode:'boat',title:'상자를 싣고 나루터로!',tag:'배 운항',npc:8,instruction:'바위를 피해 배를 위쪽 나루터까지 보내 줘!',tip:'앞에 바위가 있으면 옆으로 피한 뒤 노를 저어 봐.',learn:'강과 바닷길은 사람과 물품이 오가는 교류의 통로였어요.',note:'운항 경로와 바위 배치는 게임용 모형입니다.'},
 BJ02:{mode:'mosaic',title:'향로 속 작은 세계',tag:'6조각 복원',npc:5,art:'incense',instruction:'조각 두 개를 눌러 자리를 바꾸고 향로를 완성해 줘!',tip:'맨 위 봉황, 가운데 산과 연꽃, 아래 용 받침을 살펴봐.',learn:'향로에 표현된 작은 인물과 악기는 백제 장인의 정교한 솜씨를 보여 줘요.'},
 BJ03:{mode:'tower',title:'다섯 층 석탑 쌓기',tag:'차곡차곡',npc:1,instruction:'넓은 아래쪽부터 골라 석탑을 쌓아 줘!',tip:'원본의 맨 아래 조각부터 위로 쌓아 봐.',learn:'백제의 정림사지 오층석탑은 당시 불교문화를 보여 주는 유산이에요.',note:'조립 그림은 석탑의 원리를 단순화한 창작 그림이며 실측 복원도가 아닙니다.'},
 GY01:{mode:'forge',title:'두드려라, 대장간!',tag:'망치 타이밍',npc:6,instruction:'초록 구간에서 망치질! 세 번 두드려 줘.',tip:'급하게 연타하지 말고 표시가 초록 구간에 왔을 때 눌러 봐.',learn:'가야에서는 철을 다루어 생활에 쓸 물건을 만들고 교역했어요.',note:'두드리는 횟수와 타이밍은 게임 규칙이며 실제 제철 공정 전체가 아닙니다.'},
 GY02:{mode:'sort',title:'주문한 짐을 배에!',tag:'짐 싣기',npc:8,instruction:'농기구 두 상자와 덩이쇠를 주문한 배에 실어 줘!',items:[{item:5,label:'농기구 ①',target:0},{item:5,label:'농기구 ②',target:0},{item:4,label:'덩이쇠',target:1}],targets:['농경 마을 · 2상자','교역 나루터 · 1상자'],targetItems:[6,6],tip:'농기구 두 상자는 농경 마을, 덩이쇠는 교역 나루터로 보내.',learn:'철은 농사에 쓰였고, 교역을 통해 다른 곳으로도 전해졌어요.'},
 SL01:{mode:'mosaic',title:'금빛 장식의 단서',tag:'6조각 복원',npc:5,art:'crown',instruction:'조각 두 개를 눌러 자리를 바꾸고 금관을 완성해 줘!',tip:'나뭇가지 모양 장식과 둥근 관테가 이어지게 맞춰 봐.',learn:'화려한 금관과 큰 무덤은 당시 지배층의 위신을 짐작하게 해요.'},
 SL02:{mode:'dig',title:'붓으로 찾은 보물',tag:'유물 발굴',npc:2,instruction:'흙을 누르거나 쓸어서 숨어 있는 불상을 찾아 줘!',tip:'남아 있는 흙 조각을 모두 살살 털어 줘.',learn:'불상과 절터는 당시 사람들의 믿음과 생각을 살피는 자료예요.',note:'유물을 보호하는 발굴의 취지를 살린 창작 체험입니다. 실제 발굴 절차와 다릅니다.'},
 SL03:{mode:'stars',title:'별빛 기록을 이어라',tag:'별 잇기',npc:7,instruction:'1번부터 7번까지 별을 차례로 이어 줘!',tip:'불이 켜진 마지막 별 다음 번호를 찾아 봐.',learn:'하늘의 변화를 관찰한 기록은 시간과 계절을 살피는 데 도움이 되었어요.',note:'별 배치는 게임용입니다. 첨성대의 구체적인 관측 절차를 재현하지 않습니다.'},
 HG01:{mode:'harbor',title:'나루터를 세울 자리',tag:'직접 배치',npc:8,instruction:'물길·마을길·농경지가 이어진 곳에 나루터를 놓아 줘!',tip:'남쪽 마을 앞 강변은 물길과 흙길, 농경지가 함께 이어져 있어.',learn:'물길·육로·농경지가 연결되면 사람과 물품이 오가기 편리해요.',note:'실제 한강의 특정 지형을 재현하지 않은 조건 비교용 모형 지도입니다.'},
 HG02:{mode:'timeline',title:'세 나라의 시간 여행',tag:'시간 순서',npc:1,instruction:'오래된 시기부터 세 나라의 카드를 놓아 줘!',tip:'4세기 백제, 5세기 고구려, 6세기 신라 순서야.',learn:'한강 유역의 세력 관계는 시기에 따라 달라졌어요. 세 나라는 함께 존재했어요.'},
 HG03:{mode:'roads',title:'들판에서 나루터까지',tag:'길 잇기',npc:0,instruction:'길 조각을 돌려 들판과 나루터를 이어 줘!',tip:'들판에서 출발해 길의 양 끝이 서로 이어지도록 돌려 봐.',learn:'농경지와 물길이 연결되면 생산한 곡식을 다른 곳으로 옮기기 좋아요.'},
 END01:{mode:'sort',title:'빛을 되찾은 박물관',tag:'마지막 전시',npc:1,instruction:'보물을 탐험했던 전시실로 돌려놓아 줘!',items:[{art:'dagger',label:'비파형 동검',target:0},{art:'mural',label:'벽화 기록',target:1},{art:'incense',label:'금동대향로',target:2},{item:4,label:'덩이쇠',target:3},{art:'crown',label:'금관',target:4},{item:6,label:'나루터의 배',target:5}],targets:['고조선','고구려','백제','가야','신라','한강 탐험'],tip:'각 지역에서 함께 되찾았던 보물을 떠올려 봐.',learn:'유물과 기록을 근거로 옛사람들의 생활과 생각을 알아보았어요!',note:'배와 철의 쓰임을 특정 지역에만 한정한다는 뜻은 아닙니다. 이 게임에서 탐험한 전시실에 돌려놓는 활동입니다.'}
 };
 Object.entries(STAR_QUESTS).forEach(([id,q])=>{const m=STAR_DATA.missions.find(m=>m.id===id);Object.assign(m,{title:q.title,tag:q.tag,story:q.instruction,hint:q.tip,explain:q.learn,time:'1~3분',reward:q.title+' 기록'});});
 STAR_DATA.sources.push(['정림사지 오층석탑 · 국가유산포털','https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1113400090000&pageNo=1_1_1_1']);
})();
