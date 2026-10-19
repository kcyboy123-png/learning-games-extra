'use strict';
// Picture checks: after a regional mission, look at a picture already used in the game and link it to the history.
// Choices are shown in stored order; answers are spread evenly (7 · 7 · 7). A correct answer adds no points.
window.STAR_PICTURE_CHECKS={
 GJ01:[
  {id:'GJ01-P1',kind:'그림 관찰',pictures:[{src:'assets/cinema/dolmen-v16.jpg',alt:'마을 사람들이 통나무를 깔고 밧줄로 끌며 큰 돌을 함께 옮기는 그림',caption:'덮개돌 운반을 상상한 그림'}],question:'그림 속 사람들은 큰 돌을 어떻게 옮기고 있을까?',choices:['통나무를 깔고, 밧줄로 끌고, 뒤에서 함께 민다','돌을 작은 조각으로 깨뜨려 한 조각씩 나른다','소가 끄는 바퀴 달린 수레에 돌을 싣고 간다'],answer:0,hint:'돌 아래에 깔린 것과 사람들 손에 쥔 것을 살펴봐.',explain:'사람들이 통나무를 깔고, 밧줄을 끌고, 뒤에서 밀며 일을 나눠 맡았어. 이 그림은 운반 모습을 상상한 장면이고, 게임의 200명·20번 끌기는 놀이 규칙이야.'},
  {id:'GJ01-P2',kind:'상황 추리',pictures:[{src:'assets/cinema/dolmen-v16.jpg',alt:'밧줄을 끄는 사람과 뒤에서 미는 사람, 통나무를 나르는 사람들이 함께 일하는 그림',caption:'서로 역할을 나누어 큰 돌을 옮기는 사람들'}],question:'끄는 사람, 미는 사람, 통나무 나르는 사람이 따로 있었어. 이 큰일을 하려면 누가 필요했을까?',choices:['돌을 혼자 들어 올리는 힘센 장사 한 사람','돌을 비싼 값에 사 오는 이웃 나라 상인','사람들을 모으고 할 일을 나누어 이끄는 사람'],answer:2,hint:'사람이 많을수록 누가 어떤 일을 할지 정해 줘야 해.',explain:'많은 사람을 모으고 역할을 나누려면 이끄는 힘이 필요해. 그래서 큰 고인돌은 사람들을 이끈 지배자가 있었음을 짐작하게 해. 실제로 몇 명이 옮겼는지는 돌의 크기와 방법에 따라 달라.'}
 ],
 GJ02:[
  {id:'GJ02-P1',kind:'도구 고르기',pictures:[{item:0,alt:'구멍 두 개에 끈을 꿴 반달 모양 돌칼',caption:'반달 돌칼'},{relic:'dagger',alt:'청동으로 만든 비파형 동검',caption:'비파형 동검'},{item:2,alt:'흙으로 빚은 둥근 토기',caption:'토기'}],question:'다 익은 벼 이삭을 하나씩 따려고 해. 어떤 도구가 알맞을까?',choices:['날이 길고 끝이 뾰족한 비파형 동검','구멍에 끈을 꿴 반달 모양 돌칼','속이 비고 입구가 둥근 토기'],answer:1,hint:'손에 끈을 걸고 이삭을 딸 수 있는 모양을 찾아봐.',explain:'반달 돌칼은 구멍에 끈을 꿰어 손에 걸고 곡식 이삭을 따는 데 썼어. 반달 돌칼은 농사를 지었다는 단서가 돼.'},
  {id:'GJ02-P2',kind:'해설 고치기',pictures:[{item:0,alt:'구멍 두 개에 끈을 꿴 반달 모양 돌칼',caption:'반달 돌칼 · 돌'},{relic:'dagger',alt:'청동으로 만든 비파형 동검',caption:'비파형 동검 · 청동'},{item:2,alt:'흙으로 빚은 둥근 토기',caption:'토기 · 흙'}],question:'관람객이 말했어. “청동기 시대니까 도구는 모두 청동으로 만들었겠지?” 알맞게 고친 말은?',choices:['청동 도구와 함께 돌·흙으로 만든 도구도 썼어.','돌칼과 토기는 청동기 시대가 끝난 뒤에 생겼어.','돌칼과 토기도 청동을 녹여서 만든 물건이야.'],answer:0,hint:'세 그림 아래의 재료를 하나씩 읽어 봐.',explain:'청동기 시대 유적에서는 청동 제품과 함께 돌로 만든 도구, 토기가 함께 나와. 사람들은 쓰임에 맞춰 여러 재료를 함께 썼어.'}
 ],
 GJ03:[
  {id:'GJ03-P1',kind:'기록과 그림',pictures:[{scene:0,alt:'팔에 붕대를 감은 사람이 곡식 자루를 받는 장면',caption:'“남을 다치게 하면 곡식으로 갚는다”'}],question:'팔에 붕대를 감은 사람이 곡식 자루를 받고 있어. 다치게 한 사람이 곡식으로 갚게 한 까닭은?',choices:['마을에 곡식이 남아돌아 쓸 곳이 없어서','곡식을 먹으면 다친 곳이 바로 나아서','다친 사람이 한동안 농사일을 하기 어려워서'],answer:2,hint:'다친 팔로는 어떤 일을 하기 힘들지 생각해 봐.',explain:'다치면 한동안 농사일을 하기 어려워. 고조선 사람들은 일할 수 있는 힘과 곡식을 소중히 여겨, 다치게 한 사람에게 곡식으로 갚게 했다고 짐작해.'},
  {id:'GJ03-P2',kind:'근거 찾기',pictures:[{scene:1,alt:'울타리 너머로 남의 항아리를 몰래 가져가는 사람과 놀란 아이',caption:'“남의 물건을 훔치면 벌한다”'}],question:'‘고조선에는 개인의 재산이 있었다’고 말할 수 있는 근거는?',choices:['항아리에 곡식 무늬가 그려져 있다는 점','남의 물건을 훔치면 벌을 주었다는 점','아이가 큰 소리로 누군가를 부른다는 점'],answer:1,hint:'그림을 꾸민 부분이 아니라, 기록에 적힌 약속을 살펴봐.',explain:'훔친 사람을 벌했다는 것은 물건마다 주인이 있다고 인정했다는 뜻이야. 그림 속 무늬나 아이의 행동은 장면을 꾸민 부분이라 근거로 쓰기 어려워.'}
 ],
 GG01:[{id:'GG01-P1',kind:'지형 살피기',pictures:[{src:'assets/cinema/siege-v16.jpg',alt:'산 위 돌 성벽에서 병사들이 골짜기로 다가오는 횃불 행렬을 내려다보는 그림',caption:'612년 침입을 배경으로 상상한 산성'}],question:'그림처럼 산 위에 돌로 쌓은 성이 나라를 지키는 데 좋았던 까닭은?',choices:['강과 가까워 배로 짐을 싣고 내리기 쉬워서','멀리서 다가오는 적을 먼저 살필 수 있어서','땅이 평평해서 넓은 논밭을 만들기 좋아서'],answer:1,hint:'성벽 위 병사들이 어디를 내려다보고 있는지 살펴봐.',explain:'높은 산성에서는 주변을 멀리 살필 수 있고, 가파른 지형과 돌 성벽이 적을 막는 데 도움이 돼. 이 그림은 612년 수나라의 침입을 배경으로 상상한 장면이야.'}],
 GG02:[{id:'GG02-P1',kind:'벽화 관찰',pictures:[{src:'assets/mural-v3.png',alt:'점무늬 저고리와 바지, 긴 옷을 입고 팔을 뻗어 춤추는 사람들의 벽화 그림',caption:'무용총 춤 장면을 다시 그린 학습용 그림'}],question:'벽화 속 사람들의 옷을 자세히 보자. 그림에서 확인할 수 있는 것은?',choices:['머리에 금관을 쓰고 철 갑옷을 입었다','옷에 용과 봉황 무늬를 크게 수놓았다','옷에 점무늬가 있고 허리에 띠를 맸다'],answer:2,hint:'옷 전체에 찍힌 작은 무늬와 허리 부분을 살펴봐.',explain:'벽화 속 사람들은 점무늬가 있는 저고리와 바지, 긴 옷을 입고 허리에 띠를 맸어. 벽화를 자세히 보면 고구려 사람들의 옷차림을 살필 수 있어. 이 그림은 학습용으로 다시 그린 그림이야.'}],
 GG03:[{id:'GG03-P1',kind:'기록 잇기',pictures:[{king:'gwanggaeto',alt:'고구려 광개토대왕의 상상 초상',caption:'(가) 여러 지역으로 세력 확대 · 광개토대왕(상상 초상)'},{king:'jangsu',alt:'고구려 장수왕의 상상 초상',caption:'(나) 427년 평양으로 수도 이동 · 장수왕(상상 초상)'}],question:'두 기록을 시간 순서로 이어 보자. 바르게 정리한 것은?',choices:['장수왕이 평양으로 옮긴 뒤 광개토대왕이 세력을 넓혔다','광개토대왕이 세력을 넓힌 뒤 장수왕이 평양으로 옮겼다','두 왕이 같은 해에 함께 다스리며 평양으로 옮겼다'],answer:1,hint:'장수왕은 광개토대왕의 아들이야. 누가 먼저 왕이었을까?',explain:'광개토대왕이 여러 지역으로 세력을 넓혔고, 뒤를 이은 아들 장수왕이 427년 수도를 평양으로 옮겼어. 기록을 시간 순서로 이으면 고구려가 커지는 흐름이 보여.'}],
 BJ01:[{id:'BJ01-P1',kind:'교류 단서',pictures:[{src:'assets/baekje.png',alt:'강가 마을 오른쪽 나루터에 항아리와 짐을 실은 배가 매여 있는 그림',caption:'강가 마을과 나루터(학습용 상상 그림)'}],question:'그림 오른쪽 나루터에 짐을 실은 배가 있어. 백제 사람들은 강과 바닷길로 무엇을 했을까?',choices:['물건을 싣고 다른 지역과 오가며 교류했다','강을 막아 다른 지역 사람이 못 오게 했다','배는 고기잡이에 쓰고 짐은 걸어서 날랐다'],answer:0,hint:'배에 실린 짐이 어디로 가는지 상상해 봐.',explain:'백제의 사람과 물품은 강과 바닷길을 따라 여러 지역으로 오갔어. 배를 타고 내리거나 짐을 싣는 나루터는 사람과 물건이 모이는 교류의 장소였어.'}],
 BJ02:[{id:'BJ02-P1',kind:'장인의 솜씨',pictures:[{relic:'incense',alt:'꼭대기의 봉황, 산 모양 뚜껑의 작은 사람과 동물, 연꽃 몸통, 용 받침이 있는 향로 그림',caption:'백제 금동대향로(학습용 그림)'}],question:'향로를 자세히 보자. 백제 장인의 뛰어난 솜씨를 보여 주는 부분은?',choices:['아무 장식 없이 매끈하게 다듬은 몸통','흙으로 빚어 구운 뒤 그대로 둔 받침','작은 산과 사람, 동물을 하나하나 새긴 뚜껑'],answer:2,hint:'뚜껑 부분을 확대해 보듯 살펴봐.',explain:'백제 금동대향로 뚜껑에는 겹겹의 산과 작은 사람, 동물이 새겨져 있고, 악기를 연주하는 사람들도 있어. 이런 세밀한 표현은 백제 장인의 정교한 솜씨를 보여 줘.'}],
 BJ03:[{id:'BJ03-P1',kind:'유적 추론',pictures:[{item:9,alt:'다섯 층으로 쌓은 돌탑 그림',caption:'부여 정림사지 오층 석탑(단순화한 그림)'}],question:'‘정림사지’는 정림사라는 절이 있던 터야. 이곳의 석탑으로 짐작할 수 있는 것은?',choices:['백제 사람들은 석탑 안에 들어가 살았다','백제에 불교가 전해져 절과 탑을 세웠다','석탑은 배에게 강의 물길을 알려 주었다'],answer:1,hint:'탑은 어떤 곳에 세우는 건축물인지 떠올려 봐.',explain:'석탑은 절에 세우는 불교 건축물이야. 부여 정림사지 오층 석탑은 백제에 불교가 전해져 절과 탑을 세웠음을 보여 줘.'}],
 GY01:[{id:'GY01-P1',kind:'도구의 쓰임',pictures:[{src:'assets/farm-cargo-v12.png',alt:'나무 상자에 담긴 낫, 괭이, 삽 모양의 철 도구',caption:'대장간에서 만든 철 도구'}],question:'대장간에서 만든 철 도구가 상자에 담겼어. 이 도구들은 주로 어떤 일에 쓰였을까?',choices:['땅을 일구고 곡식을 거두는 농사일','옷감을 짜고 고운 무늬를 수놓는 일','흙으로 그릇을 빚어 가마에 굽는 일'],answer:0,hint:'휘어진 날과 넓적한 날의 모양을 살펴봐.',explain:'낫이나 삽처럼 날이 단단한 철 도구는 땅을 갈고 곡식을 거두는 일을 편하게 해 줬어. 가야는 철로 농기구와 무기 등 여러 물건을 만들었어.'}],
 GY02:[{id:'GY02-P1',kind:'짐 비교',pictures:[{src:'assets/farm-cargo-v12.png',alt:'철 농기구가 담긴 상자',caption:'(가) 농경 마을행 배의 짐'},{item:4,alt:'끈으로 묶은 납작한 덩이쇠',caption:'(나) 바다 건너 교역 배의 짐'}],question:'(가)는 농경 마을, (나)는 바다 건너 교역 배에 실은 짐이야. 알 수 있는 가야 철의 쓰임은?',choices:['철은 귀해서 가야 밖으로는 보내지 않았다','철은 주로 곡식을 담는 그릇으로 만들었다','철은 농기구도 되고 다른 나라와의 교역품도 되었다'],answer:2,hint:'(가)는 마을의 농사, (나)는 바다 건너 상인에게 가는 짐이야.',explain:'가야의 철은 농기구가 되어 마을의 농사를 도왔고, 덩이쇠 같은 철 재료는 교역품이 되어 다른 나라로도 전해졌어.'}],
 GY03:[{id:'GY03-P1',kind:'두 가지 쓰임',pictures:[{item:4,alt:'끈으로 묶은 납작한 철 덩어리, 덩이쇠',caption:'덩이쇠'}],question:'장터 상인이 덩이쇠를 받고 기뻐했어. 덩이쇠가 쓸모 있었던 까닭을 바르게 말한 것은?',choices:['철 도구를 만드는 재료이고, 값을 치를 때도 썼다','금으로 만든 장신구라서 몸을 꾸밀 수 있었다','흙으로 구운 그릇이라서 곡식을 담을 수 있었다'],answer:0,hint:'덩이쇠는 무엇으로 만든 덩어리인지 떠올려 봐.',explain:'덩이쇠는 납작하게 만든 철 덩어리야. 두드려 철 도구를 만드는 재료가 되었고, 가야에서는 화폐처럼 값을 치르는 데에도 썼어.'}],
 SL01:[{id:'SL01-P1',kind:'장식 관찰',pictures:[{relic:'crown',alt:'나뭇가지 모양 장식과 둥근 달개, 굽은옥이 달린 금관 그림',caption:'신라 금관(학습용 재구성 그림)'}],question:'금관을 자세히 보자. 그림에서 찾을 수 있는 장식은?',choices:['뚜껑 위에 앉은 봉황과 용 모양 받침','나뭇가지 모양 장식과 매달린 굽은옥','점무늬 옷감으로 감싼 넓은 테두리'],answer:1,hint:'위로 뻗은 장식과 아래로 매달린 옥을 살펴봐.',explain:'신라 금관에는 나뭇가지 모양 장식과 반짝이는 달개, 굽은옥이 달려 있어. 이렇게 화려한 금관은 지배층의 위신을 드러냈을 것으로 짐작해.'}],
 SL02:[{id:'SL02-P1',kind:'믿음의 흔적',pictures:[{src:'assets/baedong-triad-v3.png',alt:'돌을 깎아 만든 세 구의 서 있는 불상',caption:'경주 배동 석조여래삼존입상(학습용 그림)'}],question:'세 불상은 단단한 돌을 정성껏 깎아 만들었어. 이 불상들로 알 수 있는 것은?',choices:['불상은 마을 사이의 길을 알려 주는 표지였다','불상은 장터에서 물건값을 정하는 데 쓰였다','불교가 신라 사람들의 생각과 생활에 영향을 주었다'],answer:2,hint:'불상은 누구의 모습을 나타낸 조각인지 떠올려 봐.',explain:'불상은 부처의 모습을 나타낸 조각이야. 돌을 정성껏 깎아 만든 불상과 절터는 불교가 신라 사람들의 생각과 생활에 영향을 주었음을 보여 줘.'}],
 SL03:[{id:'SL03-P1',kind:'하늘과 농사',pictures:[{src:'assets/cheomseongdae-v8.png',alt:'돌을 둥글게 쌓아 올린 첨성대와 별이 뜬 저녁 하늘',caption:'(가) 경주 첨성대'},{scene:2,alt:'들판에서 곡식을 거두고 밭을 살피는 사람들',caption:'(나) 곡식을 거두는 들판'}],question:'신라 사람들은 하늘의 변화를 꾸준히 살폈어. 이것이 (나) 같은 농사일에 도움이 된 까닭은?',choices:['계절의 흐름을 알아 씨 뿌리고 거둘 때를 정할 수 있어서','별을 보면 다음 날 장터의 물건값을 미리 알 수 있어서','하늘을 보면 들판에 있는 곡식의 수를 바로 셀 수 있어서'],answer:0,hint:'씨를 뿌리고 곡식을 거두는 때는 무엇에 따라 달라질까?',explain:'하늘의 변화를 살피면 계절의 흐름을 아는 데 도움이 되고, 이는 농사 시기를 정하는 데 중요했어. 첨성대에서 실제로 어떻게 관측했는지는 여러 견해가 있어.'}],
 HG01:[{id:'HG01-P1',kind:'자리 비교',pictures:[{src:'assets/hangang-v2.png',alt:'가운데 강, 위쪽은 숲과 바위 절벽, 아래쪽은 흙길이 마을과 밭으로 이어진 강변 그림',caption:'위쪽 강가와 아래쪽 강가를 비교해요'}],question:'위쪽 강가와 아래쪽 강가를 비교해 보자. 아래쪽 강가가 나루터 자리로 알맞은 까닭은?',choices:['높은 바위 절벽이 있어 배를 대고 짐을 내리기 쉬워서','흙길이 마을과 들판으로 이어져 짐을 옮기기 쉬워서','숲이 우거져 있어 길을 새로 만들 필요가 없어서'],answer:1,hint:'물가에서 시작된 흙길이 어디로 이어지는지 따라가 봐.',explain:'위쪽은 숲과 바위 절벽이라 배를 대고 짐을 옮기기 어려워. 아래쪽은 물가에서 흙길이 마을과 들판으로 이어져. 물길과 육로가 만나는 곳은 사람과 물건이 오가기 좋아.'}],
 HG02:[{id:'HG02-P1',kind:'순서의 뜻',pictures:[{src:'assets/baekje-geunchogo-v17.webp',alt:'백제 근초고왕의 상상 초상',caption:'백제 · 근초고왕 · 4세기'},{src:'assets/goguryeo-jangsu-v17.webp',alt:'고구려 장수왕의 상상 초상',caption:'고구려 · 장수왕 · 5세기'},{src:'assets/silla-jinheung-v17.webp',alt:'신라 진흥왕의 상상 초상',caption:'신라 · 진흥왕 · 6세기'}],question:'세 카드를 ‘백제 → 고구려 → 신라’로 놓았어. 이 순서는 무엇의 순서일까?',choices:['세 나라가 차례로 전성기를 맞은 시기의 순서','세 나라가 처음 나라를 세운 건국의 순서','세 왕이 한자리에 모여 차례로 회의한 순서'],answer:0,hint:'카드 아래의 4세기·5세기·6세기와 왕의 이름을 살펴봐.',explain:'백제는 근초고왕(4세기), 고구려는 장수왕(5세기), 신라는 진흥왕(6세기) 때 전성기를 맞았고, 한강 유역의 주인도 이 흐름에 따라 바뀌었어. 건국 순서가 아니고, 세 나라는 같은 시대에 함께 있었어.'}],
 HG03:[{id:'HG03-P1',kind:'길의 연결',pictures:[{item:3,alt:'끈으로 묶은 곡식 단',caption:'(가) 들판에서 거둔 곡식'},{item:6,alt:'나무배',caption:'(나) 나루터의 배'}],question:'(가)의 곡식이 있는 들판과 (나)의 배가 있는 나루터를 길로 이었어. 무엇이 쉬워질까?',choices:['배를 타고 들판 한가운데까지 갈 수 있다','들판에서 곡식을 더 이상 기를 수 없다','거둔 곡식을 배에 실어 다른 곳으로 보낸다'],answer:2,hint:'(가)의 곡식이 (나)의 배까지 가는 길을 떠올려 봐.',explain:'농사짓기 좋은 들판과 배가 오가는 강이 길로 이어지면, 곡식과 물건을 멀리 옮기고 다른 지역과 교류하기 좋아. 그래서 여러 나라가 한강 유역을 중요하게 여겼어.'}]
};
(()=>{
 // Existing completed missions are grandfathered; newly completed missions keep their pending checks.
 const base=window.STAR_SAVE_RULES,owner=new Map(Object.entries(STAR_PICTURE_CHECKS).flatMap(([mission,list])=>list.map(q=>[q.id,mission])));
 const list=(v,key)=>v[key]===undefined||Array.isArray(v[key])&&v[key].length<=owner.size&&new Set(v[key]).size===v[key].length&&v[key].every(id=>owner.has(id)&&v.done.includes(owner.get(id)));
 window.STAR_SAVE_RULES={valid:v=>base.valid(v)&&list(v,'pictures')&&list(v,'pictureMisses'),normalize:v=>({...base.normalize(v),pictures:v.pictures?[...v.pictures]:[...owner].filter(([,id])=>v.done.includes(id)).map(([id])=>id),pictureMisses:[...(v.pictureMisses||[])]})};
})();
window.installPictureCheckV19=function(G){
 const bank=STAR_PICTURE_CHECKS,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const mission=id=>STAR_DATA.missions.find(m=>m.id===id);
 const solved=q=>G.state.pictures.includes(q.id);
 const pending=id=>(bank[id]||[]).filter(q=>!solved(q));
 // Sprite sheets are only shown through the existing crops (G.item, G.relic, .life-scene, .king-portrait).
 function figure(p,i){
  const body=p.scene!==undefined?`<span class="life-scene" role="img" aria-label="${p.alt}" style="background-position:${p.scene%2*100}% ${Math.floor(p.scene/2)*100}%"></span>`
   :p.king?`<span class="king-portrait ${p.king}" role="img" aria-label="${p.alt}"></span>`
   :`<img ${p.src?`src="${p.src}"`:p.item!==undefined?`data-item="${p.item}"`:`data-relic="${p.relic}"`} alt="${p.alt}" decoding="async">`;
  return `<figure class="check-figure"><button type="button" class="check-frame" data-zoom="${i}" aria-label="크게 보기: ${p.alt}">${body}<i class="check-zoom-mark" aria-hidden="true">🔍</i></button>${p.caption?`<figcaption>${p.caption}</figcaption>`:''}</figure>`;
 }
 // Enlarge view, shared with the memory questions: a nested dialog over the question. Any tap or Escape
 // closes only this layer; the selected answer, feedback and score stay and focus returns to the picture.
 // onClose clears the caller's handle and says whether the question is still on screen.
 function zoom(b,art,caption,label,onClose){
  const view=document.createElement('dialog');view.className='check-zoom';view.setAttribute('aria-label',`${label} 크게 보기`);
  view.innerHTML=`<figure><div class="check-zoom-art"></div>${caption?`<figcaption>${caption}</figcaption>`:''}</figure><button type="button" class="btn gold check-zoom-close">닫기 ✕</button>`;
  view.querySelector('.check-zoom-art').append(art);
  view.addEventListener('click',e=>{e.stopPropagation();if(view.open)view.close();});
  view.addEventListener('keydown',e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();});
  view.addEventListener('close',()=>{view.remove();if(onClose()&&b.isConnected)b.focus({preventScroll:true});},{once:true});
  $('#modal').append(view);view.showModal();view.querySelector('.check-zoom-close').focus({preventScroll:true});G.sound('tap');return view;
 }
 G.zoomPicture=zoom;
 // The usual next step: the region's memory questions when they are due, otherwise back to the map.
 function back(id){const r=mission(id).region;if(G.regionMissionsDone(r)&&G.reviewCount(r)<3)G.openReview(r);else G.close();}
 function open(id,{after=()=>back(id),practice=false,resume=false}={}){const list=practice?bank[id]||[]:pending(id);if(!list.length){after();return;}show(id,list,0,{after,resume});}
 function show(id,list,index,opt){
  const q=list[index],all=bank[id],m=mission(id),practice=solved(q),last=index===list.length-1;let selected=null,locked=false,disposed=false;
  G.modal(`${m.title} · 배운 내용 확인`,`<section class="review picture-check"><div class="review-visual"><div class="review-dots">${all.map((x,i)=>x===q?`<span class="current">${i+1}</span>`:solved(x)?'<span class="done">✓</span>':`<span>${i+1}</span>`).join('')}</div><div class="check-pictures" data-count="${q.pictures.length}">${q.pictures.map(figure).join('')}</div><p class="check-zoom-tip">🔍 그림을 누르면 크게 볼 수 있어요</p></div><div class="review-question-panel"><div class="review-kind">${q.kind} · 그림 단서 ${all.indexOf(q)+1}/${all.length}</div>${opt.resume?'<p class="check-note">남은 그림 확인을 이어서 풀어요.</p>':''}<h3 id="check-question">${q.question}</h3><div class="review-choices" role="group" aria-labelledby="check-question">${q.choices.map((c,i)=>`<button class="review-choice" data-check="${i}" aria-pressed="false"><span>${i+1}</span><b>${c}</b><i aria-hidden="true"></i></button>`).join('')}</div><div class="review-actions"><button class="btn gold" id="check-submit" disabled>이 답으로 확인</button>${opt.resume?'<button class="btn light small" id="check-replay">미션 다시 하기</button>':''}</div><div class="review-feedback" id="check-feedback" role="status" aria-live="polite"></div><p class="check-rule">${practice?'다시 보는 문제예요 · 점수는 그대로예요':'정답은 기록에 남아요(점수 추가 없음) · 틀린 답을 확인하면 −10점'}</p></div></section>`,practice?'그림 단서 다시 보기 · 점수 변화 없음':'미션 성공 뒤 그림으로 확인해요');
  let zoomView=null;const unzoom=()=>{const v=zoomView;zoomView=null;if(v?.open)v.close();v?.remove();};
  const root=$('#modal');root.classList.add('review-modal','picture-check-modal');G.cleanupMission=()=>{disposed=true;unzoom();root.classList.remove('review-modal','picture-check-modal');};
  root.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{
   if(disposed||zoomView)return;const p=q.pictures[+b.dataset.zoom],art=b.querySelector('img,.life-scene,.king-portrait').cloneNode(true);
   zoomView=zoom(b,art,p.caption,p.caption||p.alt,()=>{zoomView=null;return !disposed;});if(art.matches('img:not([src])'))fill(art);
  });
  function fill(img){(img.dataset.item!==undefined?G.item(+img.dataset.item):G.relic(img.dataset.relic)).then(src=>{if(!disposed&&img.isConnected&&src)img.src=src;}).catch(()=>{});}
  root.querySelectorAll('.check-pictures img[data-item],.check-pictures img[data-relic]').forEach(fill);
  G.sound('page');
  const submit=$('#check-submit'),feedback=$('#check-feedback'),choices=$$('[data-check]');
  choices.forEach(b=>b.onclick=()=>{if(locked)return;selected=+b.dataset.check;choices.forEach(e=>{e.classList.toggle('selected',e===b);e.setAttribute('aria-pressed',String(e===b));});submit.disabled=false;G.sound('tap');});
  submit.onclick=()=>{
   if(locked||disposed||selected===null)return;locked=true;submit.disabled=true;const chosen=choices[selected];
   if(selected===q.answer){
    if(!practice){G.state.pictures.push(q.id);G.save();G.refresh();}
    choices.forEach(b=>b.disabled=true);submit.hidden=true;$('#check-replay')?.remove();chosen.classList.add('correct');chosen.querySelector('i').textContent='✓';G.sound('correct');
    feedback.className='review-feedback correct';feedback.innerHTML=`<strong>${practice?'맞았어! 다시 확인했어':'맞았어! 그림 단서를 기록했어'}</strong><p>${q.explain}</p>${last?`<p class="check-achieve">✦ ${m.title} · 그림 단서 ${all.filter(solved).length}/${all.length}</p>`:''}<button class="btn gold" id="check-next">${last?'계속하기 →':'다음 그림 보기 →'}</button>`;
    $('#check-next').onclick=()=>last?opt.after():show(id,list,index+1,{...opt,resume:false});$('#check-next').focus({preventScroll:true});
   }else{
    // At most one −10 per question, kept in the save so closing and reopening never charges twice.
    const first=!practice&&!G.state.pictureMisses.includes(q.id);if(first)G.state.pictureMisses.push(q.id);const lost=first?G.penalty(10,'failure'):0;
    chosen.classList.add('wrong');chosen.querySelector('i').textContent='×';chosen.disabled=true;G.sound('oops');
    feedback.className='review-feedback wrong';feedback.innerHTML=`<strong>한 번 더 살펴보자 · ${practice?'점수는 그대로':first?(lost?'−'+lost+'점':'0점 유지'):'추가 감점 없음'}</strong><p>${q.hint}</p><button class="btn light" id="check-retry">다시 골라 보기</button>`;
    $('#check-retry').onclick=()=>{locked=false;selected=null;feedback.innerHTML='';feedback.className='review-feedback';choices.forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});submit.disabled=true;$('#check-question').scrollIntoView({block:'nearest'});};
   }
   feedback.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  $('#check-replay')?.addEventListener('click',()=>playMission(G,id,{skipChecks:true}));
 }
 G.pictureCheck={has:id=>!!bank[id],pending,open};
 G.pendingPictureMission=region=>STAR_DATA.regions.find(r=>r.id===region)?.missions.find(id=>G.state.done.includes(id)&&pending(id).length);
 const missionsDone=G.regionMissionsDone,review=G.openReview;
 G.regionMissionsDone=id=>missionsDone(id)&&!G.pendingPictureMission(id);
 G.openReview=id=>{const unfinished=G.pendingPictureMission(id);if(unfinished){open(unfinished,{resume:true});return;}review(id);};
};
