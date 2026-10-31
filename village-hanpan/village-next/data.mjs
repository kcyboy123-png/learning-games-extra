export const VERSION=5, RULE='village-next-b1', MONTH=200, YEAR=2400, SIZE=18, RIVER=11;
// Keep saved simulation timestamps unchanged; 7200 simulation seconds take 80 active minutes.
export const PLAY_SPEED=1.5;
export const realSeconds=seconds=>Math.ceil(Math.max(0,seconds)/PLAY_SPEED);
// Costs are classroom simulation values, not actual construction estimates.
export const TYPES={
 road:{name:'산책길',cost:12,time:3,up:0,e:0,unlock:0,stage:0,group:'기반',desc:'집과 시설을 마을 입구까지 연결해요.'},
 house:{name:'벽돌 주택',cost:120,time:25,up:3,e:-1.5,unlock:0,cap:4,stage:0,sprite:0,group:'주거',desc:'4명이 사는 작은 집. 빠르게 완공해요.'},
 snack:{name:'분식집',cost:180,time:35,up:6,e:-2,unlock:0,food:16,stage:0,sprite:2,group:'음식',desc:'16명의 식생활 수요. 식당·장보기 시설이 수요를 나눠요.'},
 apartment:{name:'동네 빌라',cost:400,time:85,up:12,e:-5,unlock:2,cap:12,stage:2,sprite:1,group:'주거',desc:'12명 입주. 땅을 아끼지만 공사와 운영 부담이 커요.'},
 western:{name:'양식집',cost:280,time:55,up:9,e:-3,unlock:2,food:24,stage:2,sprite:3,group:'음식',desc:'24명 수요. 넉넉한 식사 공간을 만들어요.'},
 japanese:{name:'일식집',cost:220,time:45,up:7,e:-2.4,unlock:2,food:20,stage:2,sprite:4,group:'음식',desc:'20명 수요. 작은 골목에도 어울리는 식당.'},
 chinese:{name:'중국집',cost:320,time:65,up:11,e:-3.5,unlock:2,food:28,stage:2,sprite:5,group:'음식',desc:'28명 수요. 큰 마을의 손님을 함께 맞아요.'},
 convenience:{name:'편의점',cost:150,time:30,up:5,e:-1.8,unlock:1,food:12,stage:1,sprite:16,group:'장보기',desc:'1칸·12명의 식생활 수요. 작은 동네의 가까운 장보기 공간. 식당과 수요를 나눠요.'},
 supermarket:{name:'대형마트',cost:620,time:120,up:24,e:-7,unlock:7,food:56,stage:3,sprite:17,foot:2,group:'장보기',desc:'2×2칸·56명의 식생활 수요. 넓은 주차 공간과 높은 유지비를 함께 고려해요. 과잉 공급은 수입을 늘리지 않아요.'},
 clinic:{name:'동네 의원',cost:240,time:55,up:7,e:-2,unlock:1,health:20,stage:1,sprite:18,group:'생활',desc:'20명의 의료 수요. 작은 마을에 알맞아요.'},
 hospital:{name:'마을 병원',cost:530,time:100,up:17,e:-5,unlock:2,health:48,stage:2,sprite:8,group:'생활',desc:'48명의 의료 수요. 의원과 역할을 나눠요.'},
 kids:{name:'키즈카페',cost:240,time:55,up:8,e:-2.5,unlock:3,leisure:24,stage:2,sprite:6,group:'여가',desc:'24명 규모의 여가 수요. 가족들이 쉬어 가요.'},
 amusement:{name:'작은 놀이동산',cost:820,time:150,up:32,e:-9,unlock:7,leisure:64,stage:3,sprite:7,foot:2,group:'여가',desc:'2×2칸·64명 수요. 운영비까지 생각해 계획해요.'},
 school:{name:'우리 학교',cost:340,time:65,up:10,e:-3,unlock:2,education:32,stage:2,sprite:9,group:'생활',desc:'32명 규모의 교육 수요를 담당해요.'},
 library:{name:'마을 도서관',cost:280,time:60,up:8,e:-2,unlock:2,education:20,leisure:10,stage:2,sprite:10,group:'생활',desc:'교육 20명과 여가 10명. 학교와 함께 이용해요.'},
 fire:{name:'소방서',cost:300,time:65,up:8,e:-2,unlock:4,stage:2,sprite:11,group:'안전',desc:'연결된 마을의 화재 대응과 안전 훈련.'},
 drain:{name:'빗물 배수 시설',cost:100,time:25,up:2,e:0,unlock:3,stage:2,group:'안전',desc:'여름철 빗물과 길의 이용 상태를 관리해요.'},
 workshop:{name:'창고 재생 공간',cost:200,time:45,up:5,e:-1,unlock:9,leisure:16,education:8,stage:2,sprite:12,group:'생활',desc:'강 건너 오래된 창고 부지에서만 개조할 수 있어요.'},
 solar:{name:'태양광 설비',cost:160,time:30,up:2,e:7,unlock:0,stage:1,sprite:13,group:'에너지',desc:'계절에 따라 생산량이 달라져요. 겨울 70%, 여름 120%.'},
 generator:{name:'마을 전력 설비',cost:240,time:45,up:10,e:16,unlock:0,stage:2,sprite:14,group:'에너지',desc:'일정하게 16을 공급해요. 태양광보다 유지비가 높아요.'},
 bridge:{name:'개울 다리',cost:240,time:70,up:2,e:0,unlock:1,stage:2,group:'기반',desc:'물 위에 놓아 강 건너 새 땅을 연결해요.'},
 flower:{name:'계절 꽃밭',cost:30,time:8,up:0,e:0,unlock:1,stage:1,group:'꾸미기',desc:'40초 뒤 꽃망울, 120초 뒤 만개. 집 가까이 심으면 조경 점수가 올라요.'},
 avenue:{name:'그늘 가로수',cost:55,time:12,up:0,e:0,unlock:1,stage:1,group:'꾸미기',desc:'작은 묘목에서 그늘나무로 자라요. 꽃밭·쉼터와 균형 있게 배치해요.'},
 tree:{name:'작은 정원',cost:35,time:5,up:0,e:0,unlock:1,stage:1,sprite:15,group:'꾸미기',desc:'생활권 주변의 녹지. 효과에는 상한이 있어요.'},
 bench:{name:'쉼터 벤치',cost:25,time:5,up:0,e:0,unlock:3,stage:2,sprite:19,group:'꾸미기',desc:'주민이 쉬는 곳. 정원과 함께 꾸며 보세요.'}
};
export const OPTIONS={ins:{name:'단열 보강',cost:45,desc:'겨울·여름 에너지 수요 25% 절약'},shade:{name:'차양 설치',cost:25,desc:'여름 냉방 수요 20% 절약'},reuse:{name:'재사용 자재',cost:20,desc:'자원 재사용 성과에 반영'}};
export const TIERS=[[950,'레디언트','미래를 짓는 건축가'],[900,'이모탈','초록 도시의 거장'],[800,'다이아몬드','마을 설계의 달인'],[700,'플래티넘','빛나는 도시 설계자'],[600,'골드','든든한 마을 건축가'],[450,'실버','성장하는 건축단장'],[300,'브론즈','가능성을 짓는 설계자'],[0,'새싹','첫 마을의 개척자']];
// 해금 달(0=1월). B규칙: 정해진 달 또는 주민 수 성과로 앞당겨진다. 에너지 시설은 부족 대응을 위해 처음부터 열려 있다.
export const TABS={주거:['주거'],생활:['음식','장보기','생활'],기반:['기반','에너지','안전'],여가:['여가'],조경:['꾸미기']};
export const SEASONS=['겨울','봄','여름','가을'];
export const season=m=>m<2||m===11?0:m<5?1:m<8?2:3;
