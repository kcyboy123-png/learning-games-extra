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
 bench:{name:'쉼터 벤치',cost:25,time:5,up:0,e:0,unlock:3,stage:2,sprite:19,group:'꾸미기',desc:'주민이 쉬는 곳. 정원과 함께 꾸며 보세요.'},
 duplex:{"name":"2층집","cost":650,"time":45,"up":5,"e":-2,"unlock":0,"stage":0,"group":"주거","desc":"발코니가 있는 아늑한 2층집. 더 많은 이웃을 맞이해요.","cap":8,"sprite":0},
 gardenhouse:{"name":"마당 있는 집","cost":900,"time":50,"up":5,"e":-2,"unlock":0,"stage":0,"group":"주거","desc":"꽃이 핀 앞마당과 작은 우편함이 있는 넉넉한 집.","cap":6,"sprite":0},
 terracehouse:{"name":"테라스 주택","cost":2400,"time":85,"up":5,"e":-2,"unlock":0,"stage":0,"group":"주거","desc":"옥상 정원이 이어진 알록달록한 대규모 주거 단지.","cap":16,"sprite":1,"foot":2},
 chicken:{"name":"치킨집","cost":450,"time":35,"up":5,"e":-2,"unlock":0,"stage":0,"group":"음식","desc":"바삭한 치킨을 나눠 먹는 노란 골목 가게.","food":24,"sprite":2},
 buffet:{"name":"뷔페","cost":3500,"time":80,"up":5,"e":-2,"unlock":0,"stage":0,"group":"음식","desc":"유리 지붕 아래 여러 음식을 함께 즐겨요.","food":80,"foot":2},
 police:{"name":"경찰서","cost":1200,"time":55,"up":5,"e":-2,"unlock":0,"stage":0,"group":"생활","desc":"파란 지붕과 순찰차가 있는 든든한 경찰서.","leisure":8},
 cinema:{"name":"영화관","cost":12000,"time":180,"up":5,"e":-2,"unlock":0,"stage":0,"group":"여가","desc":"반짝이는 간판 아래 함께 영화를 보는 곳.","leisure":80,"foot":2},
 animalFarm:{"name":"동물농장","cost":18000,"time":270,"up":5,"e":-2,"unlock":0,"stage":0,"group":"여가","desc":"빨간 헛간과 울타리 안의 양·소·닭을 만나요.","leisure":64,"foot":2},
 rosePark:{"name":"장미공원","cost":12000,"time":180,"up":0,"e":0,"unlock":0,"stage":0,"group":"꾸미기","desc":"장미 아치와 분수, 벤치가 있는 꽃 공원.","garden":"flowers","leisure":48,"foot":2},
 harbor:{"name":"항구","cost":500000,"time":360,"up":5,"e":-2,"unlock":0,"stage":0,"group":"명소","desc":"개울 입구의 항구 자리에 지어요. 완공하면 배를 타고 안개꽃섬을 꾸밀 수 있어요.","leisure":80,"foot":2},
 rabbitTower:{"name":"토끼탑","cost":150000,"time":450,"up":5,"e":-2,"unlock":0,"stage":0,"group":"명소","desc":"꽃 광장 위로 우뚝 선 마을의 커다란 토끼.","leisure":96,"foot":2},
 skyTower:{"name":"하늘빛 타워","cost":180000,"time":540,"up":5,"e":-2,"unlock":0,"stage":0,"group":"명소","desc":"하늘로 길게 뻗은 유리 전망대와 초록 광장.","leisure":120,"foot":2},
 largePark:{"name":"대형 놀이동산","cost":350000,"time":720,"up":5,"e":-2,"unlock":0,"stage":0,"group":"명소","desc":"4×4칸의 큰 명소. 대관람차·회전목마·기차와 동화 성!","leisure":240,"foot":4},
 lavender:{"name":"라벤더 꽃밭","cost":180,"time":12,"up":0,"e":0,"unlock":0,"stage":0,"group":"꾸미기","desc":"보랏빛 꽃이 줄지어 피는 작은 화단.","garden":"flowers"},
 hydrangea:{"name":"수국길","cost":320,"time":16,"up":0,"e":0,"unlock":0,"stage":0,"group":"꾸미기","desc":"파란 수국과 분홍 수국 사이로 난 돌길.","garden":"flowers"},
 fountain:{"name":"작은 분수","cost":850,"time":25,"up":0,"e":0,"unlock":0,"stage":0,"group":"꾸미기","desc":"시원한 물줄기가 솟는 동그란 쉼터.","garden":"rest"},
 flowerArch:{"name":"꽃 아치","cost":1400,"time":30,"up":0,"e":0,"unlock":0,"stage":0,"group":"꾸미기","desc":"덩굴과 장미가 감싼 정원의 입구.","garden":"flowers"},
 moonGarden:{"name":"달빛 정원","cost":60000,"time":270,"up":0,"e":0,"unlock":0,"stage":0,"group":"레어","desc":"초승달 조형물과 은빛 꽃이 빛나는 정원.","garden":"flowers","foot":2},
 goldFountain:{"name":"황금 분수","cost":120000,"time":360,"up":0,"e":0,"unlock":0,"stage":0,"group":"레어","desc":"세 겹의 황금 물그릇과 에메랄드빛 연못.","garden":"rest","foot":2},
 starTree:{"name":"별빛 나무","cost":240000,"time":540,"up":0,"e":0,"unlock":0,"stage":0,"group":"레어","desc":"황금 가지에 별과 작은 등이 매달린 특별한 나무.","garden":"trees","foot":2}
};
Object.assign(TYPES,{
 mistHydrangea:{name:'안개꽃 수국 정원',cost:8000,time:120,up:0,e:0,unlock:0,stage:0,group:'섬 전용',island:'mist',garden:'flowers',foot:2,desc:'안개꽃섬 전용. 파랑·보라 수국과 꽃 아치 사이로 산책해요.'},
 fireflyPond:{name:'반딧불 연못',cost:18000,time:180,up:0,e:0,unlock:0,stage:0,group:'섬 전용',island:'mist',garden:'rest',foot:2,desc:'안개꽃섬 전용. 은은한 반딧불과 연꽃이 물가를 밝혀요.'},
 islandCafe:{name:'물빛 찻집',cost:45000,time:240,up:0,e:-2,unlock:0,stage:0,group:'섬 전용',island:'mist',food:72,foot:2,desc:'안개꽃섬 전용. 청록 지붕과 물가 테라스에서 차를 나누어요. 수입 중심 시설이에요.'},
 glassGarden:{name:'별빛 온실',cost:90000,time:360,up:0,e:-2,unlock:0,stage:0,group:'섬 전용',island:'mist',education:64,leisure:64,foot:2,desc:'안개꽃섬 전용. 별 장식의 유리 온실에서 꽃을 가꾸고 자연을 배워요.'},
 wishTree:{name:'소원나무',cost:160000,time:480,up:0,e:0,unlock:0,stage:0,group:'섬 전용',island:'mist',garden:'trees',foot:2,desc:'안개꽃섬 전용. 연보라 가지에 소원 리본과 작은 별이 매달린 행복의 나무예요.'},
 cloudObservatory:{name:'구름 전망대',cost:220000,time:600,up:0,e:-2,unlock:0,stage:0,group:'섬 전용',island:'mist',leisure:120,foot:2,desc:'안개꽃섬 전용. 나선 계단을 올라 바다와 두 마을을 바라보는 명소예요.'}
});
export const OPTIONS={ins:{name:'단열 보강',cost:45,desc:'겨울·여름 에너지 수요 25% 절약'},shade:{name:'차양 설치',cost:25,desc:'여름 냉방 수요 20% 절약'},reuse:{name:'재사용 자재',cost:20,desc:'자원 재사용 성과에 반영'}};
export const TIERS=[[950,'레디언트','미래를 짓는 건축가'],[900,'이모탈','초록 도시의 거장'],[800,'다이아몬드','마을 설계의 달인'],[700,'플래티넘','빛나는 도시 설계자'],[600,'골드','든든한 마을 건축가'],[450,'실버','성장하는 건축단장'],[300,'브론즈','가능성을 짓는 설계자'],[0,'새싹','첫 마을의 개척자']];
// 해금 달(0=1월). B규칙: 정해진 달 또는 주민 수 성과로 앞당겨진다. 에너지 시설은 부족 대응을 위해 처음부터 열려 있다.
export const TABS={주거:['주거'],먹거리:['음식','장보기'],생활:['생활'],기반:['기반','에너지','안전'],여가:['여가'],명소:['명소'],조경:['꾸미기'],레어:['레어'],'섬 전용':['섬 전용']};
export const SEASONS=['겨울','봄','여름','가을'];
export const season=m=>m<2||m===11?0:m<5?1:m<8?2:3;

// Cozy rewards are net coins per real playing minute; happiness is a target increase.
export const COZY_EFFECTS={
 mistHydrangea:{income:400,happiness:9,welfare:2},
 fireflyPond:{income:1200,happiness:12,welfare:4},
 islandCafe:{income:4500,happiness:8,welfare:2},
 glassGarden:{income:7000,happiness:14,welfare:10},
 wishTree:{income:9000,happiness:24,welfare:6},
 cloudObservatory:{income:18000,happiness:18,welfare:8},
 road:{income:0,happiness:0,welfare:0},
 house:{income:0,happiness:0,welfare:0},
 apartment:{income:0,happiness:0,welfare:0},
 duplex:{income:0,happiness:0,welfare:0},
 gardenhouse:{income:0,happiness:0,welfare:0},
 terracehouse:{income:0,happiness:0,welfare:0},
 snack:{income:35,happiness:2,welfare:0},
 western:{income:300,happiness:4,welfare:0},
 japanese:{income:150,happiness:3,welfare:0},
 chinese:{income:550,happiness:5,welfare:0},
 chicken:{income:75,happiness:3,welfare:0},
 buffet:{income:650,happiness:6,welfare:1},
 convenience:{income:25,happiness:1,welfare:2},
 supermarket:{income:900,happiness:3,welfare:6},
 clinic:{income:8,happiness:0,welfare:8},
 hospital:{income:80,happiness:1,welfare:32},
 school:{income:10,happiness:0,welfare:14},
 library:{income:12,happiness:2,welfare:10},
 police:{income:25,happiness:0,welfare:18},
 fire:{income:10,happiness:0,welfare:12},
 drain:{income:2,happiness:0,welfare:4},
 kids:{income:40,happiness:4,welfare:2},
 amusement:{income:250,happiness:10,welfare:1},
 cinema:{income:1500,happiness:12,welfare:2},
 animalFarm:{income:1800,happiness:10,welfare:6},
 largePark:{income:30000,happiness:25,welfare:6},
 workshop:{income:50,happiness:3,welfare:8},
 solar:{income:16,happiness:0,welfare:2},
 generator:{income:20,happiness:0,welfare:1},
 bridge:{income:0,happiness:0,welfare:1},
 flower:{income:2,happiness:1,welfare:0},
 avenue:{income:4,happiness:1,welfare:1},
 tree:{income:3,happiness:2,welfare:0},
 bench:{income:2,happiness:1,welfare:1},
 lavender:{income:12,happiness:3,welfare:0},
 hydrangea:{income:24,happiness:4,welfare:1},
 fountain:{income:60,happiness:5,welfare:3},
 flowerArch:{income:100,happiness:6,welfare:1},
 rosePark:{income:800,happiness:18,welfare:6},
 harbor:{income:10000,happiness:4,welfare:16},
 rabbitTower:{income:15000,happiness:20,welfare:4},
 skyTower:{income:20000,happiness:8,welfare:12},
 moonGarden:{income:3000,happiness:20,welfare:4},
 goldFountain:{income:6000,happiness:14,welfare:10},
 starTree:{income:12000,happiness:25,welfare:6}
};
// Population unlocks persist once reached; old buildings stay usable.
export const POPULATION_UNLOCKS={"house":0,"road":0,"snack":0,"flower":0,"avenue":0,"tree":0,"bench":0,"solar":0,"generator":0,"bridge":0,"drain":0,"duplex":12,"convenience":12,"chicken":12,"clinic":12,"lavender":12,"japanese":16,"kids":16,"hydrangea":16,"gardenhouse":20,"school":20,"fire":20,"fountain":20,"apartment":24,"library":24,"police":24,"flowerArch":24,"western":28,"terracehouse":32,"amusement":32,"workshop":32,"chinese":40,"buffet":40,"hospital":48,"supermarket":48,"cinema":64,"rosePark":64,"animalFarm":80,"moonGarden":100,"harbor":120,"rabbitTower":160,"goldFountain":160,"skyTower":200,"largePark":240,"starTree":240};
