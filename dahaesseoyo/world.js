/* ==========================================================================
   생각별 수집단 · world.js
   홈 화면을 "정원 탐험" RPG 맵으로 바꾼다. 부모(app-v2.js)가 엔진을 통합한다.
   globalThis.ThinkstarWorld = { html, mount, unmount, rescue, zones, geometry }
   - html(ctx)   : 홈 HTML 문자열. ctx={catalog,passed,hero,sprite,helper}
   - mount(el,ctx+{onEncounter}) : 컨트롤·카메라·루프 시작 (el 안에서만 동작)
   - unmount()   : 모든 리스너/RAF 해제
   - rescue(id)  : 방금 만난 친구 기억 → 다음 mount 때 친구 옆에서 재등장 + 링 효과
   - geometry    : 충돌/배치/경로 탐색을 밖에서 검증할 수 있는 순수 함수 묶음
   지형은 코드 안의 도형(원·타원·사각형·캡슐)이 유일한 진실이다. 같은 도형으로
   SVG를 그리고, 같은 도형으로 충돌을 판정한다. 그림이 보이지 않는 벽을 만들지 않는다.
   외부 호출/의존성 없음. localStorage를 건드리지 않는다.
   ========================================================================== */
(function (root) {
  'use strict';

  const W = 2400, H = 1500;                   // 월드 크기 (px) — 이전 1600x1000의 2.25배 면적
  const G = 20;                               // 경로 탐색 격자 한 칸 (px)
  const R = 16;                               // 플레이어 충돌 반지름
  const CELL_PAD = R + 15;                    // 격자 칸 판정 여유 (칸 중심 사이 이동이 항상 안전하도록)
  const SPEED = 240;                          // 플레이어 이동 속도 (px/s)
  const CAMERA_SCALE = 1 / 1.1;
  const NEAR = 118;                           // 만남 가능 거리
  const MIN_GAP = 118;                         // 친구 배치 최소 간격
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ZONES = [
    {key:'meadow',label:'햇살 초원',sub:'따뜻한 첫 만남'},
    {key:'forest',label:'안개 숲',sub:'반딧불과 거대한 뿌리의 비밀'},
    {key:'ice',label:'얼음 유적',sub:'얼어붙은 호수 너머 수정 성역'},
    {key:'harbor',label:'노을 항구',sub:'물길과 시장을 지나 황금 등대로'},
    {key:'stars',label:'별빛 관측소',sub:'별의 도서관에서 은하의 다리까지'}
  ];
  const entryWorld=root.ThinkstarEntryWorld;
  if(entryWorld)Object.assign(ZONES[0],{label:entryWorld.name,sub:entryWorld.sub});
  const mapImage=(ri,hd=false)=>'assets/maps-v4/'+(ri===0&&entryWorld?entryWorld.image:REGIONS[ri].key)+(hd&&(ri>0||entryWorld)?'-hd':'')+'.webp';
  const tastes = { mild: '순한맛', medium: '보통맛', spicy: '매운맛' };
  const taste = m => (m.difficulty in tastes) ? m.difficulty : 'medium';

  /* ======================================================================
     지형 데이터 — 도형 생성 헬퍼
     C: 원, E: 타원, B: 사각형(좌상단 기준), S: 캡슐(선분+반지름), chain: 꺾은선 캡슐
     gaps: 다리·문처럼 장애물을 "뚫고" 지나갈 수 있는 볼록 영역(원)
     habitats: 맛별 서식지 주머니 [x,y,반지름,친구 수] — 맛별 합계는 항상 12
     ====================================================================== */
  const C = (k,x,y,r,o)=>Object.assign({t:'c',k,x,y,r},o);
  const E = (k,x,y,rx,ry,o)=>Object.assign({t:'e',k,x,y,rx,ry},o);
  const B = (k,x,y,w,h,o)=>Object.assign({t:'r',k,x,y,w,h},o);
  const S = (k,x1,y1,x2,y2,r,o)=>Object.assign({t:'s',k,x1,y1,x2,y2,r},o);
  const chain = (k,r,pts,o)=>pts.slice(1).map((p,i)=>S(k,pts[i][0],pts[i][1],p[0],p[1],r,o));
  const ring = (cx,cy,rad,angles)=>angles.map(a=>[Math.round(cx+rad*Math.cos(a*Math.PI/180)),Math.round(cy+rad*Math.sin(a*Math.PI/180))]);
  const gap = (x,y,r)=>({t:'c',x,y,r});

  const REGIONS = [
    { key:'meadow', spawn:[1200,1320],
      palette:{ground:'#cbe4a3',wash:'#e9f4c0',road:'#f4e3b9',roadEdge:'#d8bf8c',water:'#8ccff2',waterEdge:'#5aa9d8',tree:'#5ea868',treeDark:'#3f8a4f',rock:'#b7ae9e',rockDark:'#8d8475',wall:'#e3d4ad',wallDark:'#b89e6c',gold:'#f3c653',purple:'#8c62d9'},
      places:[
        {name:'출발 언덕',x:1200,y:1215,note:'순한맛 친구들의 들판'},
        {name:'사과 과수원',x:480,y:640,note:'보통맛 · 나무 사이로 돌아가요'},
        {name:'거울 연못',x:1800,y:1230,note:'보통맛 · 연못가와 다리 너머'},
        {name:'고대 태양 신전',x:1200,y:700,note:'매운맛 · 높은 계단 위 성역',spicy:true}
      ],
      roads:[[[1200,1340],[1200,660]],[[1200,1250],[820,1000],[560,860],[480,700]],[[1200,1280],[1600,1210],[1800,1200],[2060,1160]],[[1200,840],[1700,680],[1760,655],[2050,540]]],
      obstacles:[
        // 과수원 (보통맛)
        ...[[300,760],[480,740],[660,770],[300,940],[480,960],[660,930],[300,1120],[480,1140],[660,1110]].map(p=>C('tree',p[0],p[1],46,{prop:'grove'})),
        // 거울 연못 + 개울 (다리 하나)
        E('water',1800,980,260,170), ...chain('water',34,[[1800,820],[1700,480],[1640,-40]]),
        // 흩어진 바위
        C('rock',900,600,40),C('rock',1500,620,36),C('rock',960,1180,30),C('rock',1460,1150,30),C('rock',2200,900,44),C('rock',200,1350,38),
        // 고대 태양 신전: 돌담 고리(남쪽 입구 열림) + 기둥 + 제단
        ...chain('wall',16,ring(1200,330,300,[120,160,200,240,280,320,360,40])),
        C('pillar',1050,590,24,{prop:'stonearch'}),C('pillar',1430,523,24),
        C('altar',1200,250,55),C('pillar',1090,230,18),C('pillar',1310,230,18),C('pillar',1090,430,18),C('pillar',1310,430,18)
      ],
      gaps:[gap(1753,660,100)],
      shrine:{x:1200,y:330,r:300,gate:[1200,640],sign:[1200,760]},
      habitats:{
        mild:[[1200,1135,0,1],[660,1290,0,1],[1860,1290,0,1],[430,1030,0,1],[2040,880,0,1],[680,700,0,1],[2090,490,0,1],[360,480,0,1],[460,1420,0,1],[2140,1400,0,1],[830,970,0,1],[1720,620,0,1]],
        medium:[[390,850,70,2],[570,850,70,2],[390,1030,70,2],[1620,1200,80,2],[2000,1220,80,2],[2050,520,90,2]],
        spicy:[[1060,330,80,3],[1340,330,80,3],[1200,470,90,3],[1200,150,60,3]]
      }
    },
    { key:'forest', spawn:[320,1320],
      palette:{ground:'#8fbf8a',wash:'#a9d19b',road:'#d8c79f',roadEdge:'#a89470',water:'#7cc4da',waterEdge:'#4f93aa',tree:'#3f8a56',treeDark:'#2b6540',rock:'#8f9b86',rockDark:'#5f6b58',wall:'#8b5a3c',wallDark:'#5f3a24',gold:'#f0c860',purple:'#7f55d4'},
      places:[
        {name:'버섯 숲길',x:520,y:1180,note:'순한맛 · 안개 속 첫 걸음'},
        {name:'안개 시냇물',x:1150,y:860,note:'다리 두 개로 건너요'},
        {name:'반딧불 그루터기',x:1520,y:1160,note:'보통맛 · 남쪽 언덕과 북쪽 숲'},
        {name:'거대 뿌리 성소',x:1950,y:790,note:'매운맛 · 뿌리 문 안쪽',spicy:true}
      ],
      roads:[[[320,1340],[520,1180],[700,900],[700,676],[980,560],[1300,520]],[[520,1180],[1000,1150],[1500,1200],[1650,1050],[1650,850],[1800,760],[1950,700]]],
      obstacles:[
        // 북서쪽 빽빽한 숲 (통과 불가, 분위기)
        ...[[150,200],[300,160],[450,210],[600,170],[760,220],[150,420],[320,470],[480,420],[650,480],[820,440]].map(p=>C('tree',p[0],p[1],60,{prop:'grove'})),
        C('tree',1050,250,55),C('tree',1250,220,55),C('tree',800,320,50),C('tree',1400,330,50),
        // 출발 근처 나무
        C('tree',200,1150,45),C('tree',760,1250,50),C('tree',700,1000,48),C('tree',300,900,50),C('tree',1100,1350,52),C('tree',1300,950,46),
        // 시냇물 (다리 2)
        ...chain('water',36,[[0,650],[500,700],[1000,640],[1400,800],[1900,900],[2400,850]]),
        // 그루터기·바위
        C('rock',1700,1200,40),C('rock',2100,1300,46),C('rock',1900,1050,34),
        // 거대 뿌리 성소: 뿌리 울타리(남쪽 문) + 거대 줄기
        ...chain('root',30,[[1660,-40],[1620,500],[1800,660],[2100,680],[2300,520],[2340,-40]]),
        C('trunk',1950,230,90,{prop:'grove'}),C('crystal',1780,560,26),C('crystal',2120,560,26)
      ],
      gaps:[gap(700,676,100),gap(1650,850,100),gap(1950,670,90)],
      shrine:{x:1950,y:380,r:330,gate:[1950,690],sign:[1950,800]},
      habitats:{
        mild:[[420,1300,80,3],[620,1300,80,3],[350,1100,80,3],[560,1100,80,3]],
        medium:[[980,520,80,2],[1150,420,90,2],[1420,560,90,2],[1500,1200,90,2],[1700,1320,90,2],[1250,1150,90,2]],
        spicy:[[1800,420,90,3],[2100,420,90,3],[1950,560,80,3],[1760,250,70,3]]
      }
    },
    { key:'ice', spawn:[1200,1340],
      palette:{ground:'#e3eff8',wash:'#f6fbff',road:'#cfdfeb',roadEdge:'#a9bfcf',water:'#9ad0f0',waterEdge:'#6aaedb',tree:'#9fc8bd',treeDark:'#6f9d93',rock:'#b9cbd9',rockDark:'#8aa2b5',wall:'#d6e6f2',wallDark:'#93afc6',gold:'#ffd770',purple:'#8a6ae6',crystal:'#a8dcff'},
      places:[
        {name:'눈꽃 야영지',x:1200,y:1230,note:'순한맛 · 모닥불 곁'},
        {name:'얼어붙은 호수',x:700,y:700,note:'보통맛 · 호숫가를 따라 돌아요'},
        {name:'서리 바위 언덕',x:1760,y:980,note:'보통맛 · 바위 사이'},
        {name:'수정 성채',x:1900,y:640,note:'매운맛 · 성문 안쪽',spicy:true}
      ],
      roads:[[[1200,1340],[1200,1000],[1300,720],[1500,620],[1900,600]],[[1200,1000],[900,1000],[700,1040],[250,1000]],[[1300,900],[1600,1000],[1760,1000],[2100,1150]]],
      obstacles:[
        // 야영지 천막 (순한맛)
        B('tent',1000,1080,110,90,{prop:'cottage'}),B('tent',1340,1080,110,90,{prop:'cottage'}),B('tent',1480,1260,110,90),B('tent',900,1280,110,90),
        // 얼어붙은 호수
        E('water',700,700,420,260,{ice:true}),
        // 얼음 바위·고드름
        C('rock',300,300,60),C('rock',500,200,50),C('rock',1200,250,55),C('rock',1000,450,45),C('rock',1600,900,45),C('rock',1900,1100,50),C('rock',1850,880,40),C('rock',2200,1300,48),C('rock',400,1300,44),
        C('crystal',1350,420,30),C('crystal',2250,900,34),
        // 수정 성채: 성벽(남쪽 성문) + 탑 + 수정 군락
        ...chain('wall',16,[[1650,560],[1650,120],[2150,120],[2150,560],[1650,560]]),
        C('pillar',1650,120,34),C('pillar',2150,120,34),C('pillar',1650,560,34),C('pillar',2150,560,34),
        C('crystal',1900,250,70,{prop:'crystalcluster'}),C('crystal',1750,450,26),C('crystal',2050,450,26)
      ],
      gaps:[gap(1900,560,85)],
      shrine:{x:1900,y:340,r:300,gate:[1900,580],sign:[1900,700]},
      habitats:{
        mild:[[1200,1320,70,3],[1120,1190,60,3],[1300,1190,60,3],[1200,1000,80,3]],
        medium:[[1200,700,70,2],[700,1040,90,2],[250,1000,80,2],[1750,1000,110,3],[1450,650,90,3]],
        spicy:[[1740,330,70,3],[2060,330,70,3],[1900,470,80,3],[1770,190,45,2],[2030,190,45,1]]
      }
    },
    { key:'harbor', spawn:[420,1320],
      palette:{ground:'#f0d8b3',wash:'#f9e8c9',road:'#e6c593',roadEdge:'#c39a62',water:'#78b8e8',waterEdge:'#4a8fc9',tree:'#8fb46a',treeDark:'#5f8a46',rock:'#9b8f83',rockDark:'#6d6257',wall:'#d9a56e',wallDark:'#9c6a3c',gold:'#ffc857',purple:'#8f5fd6'},
      places:[
        {name:'노을 시장',x:460,y:1050,note:'순한맛 · 천막 사이 골목'},
        {name:'갈매기 운하',x:1000,y:860,note:'다리 두 개로 건너요'},
        {name:'선창가 부두',x:1400,y:620,note:'보통맛 · 운하 너머 창고와 부두'},
        {name:'난파선 등대',x:2050,y:680,note:'매운맛 · 바위 사이 좁은 길',spicy:true}
      ],
      roads:[[[420,1340],[450,1100],[450,750],[600,500],[800,420]],[[420,1200],[900,1150],[1300,1000],[1300,720],[1400,560],[1550,430]],[[1300,900],[1750,1250]],[[1300,720],[1800,650],[2100,600],[2100,470]]],
      obstacles:[
        // 시장 천막 (순한맛)
        B('stall',230,1180,120,80,{prop:'cottage'}),B('stall',620,1180,120,80,{prop:'cottage'}),B('stall',300,960,120,80),B('stall',560,960,120,80),
        // 운하 (다리 2)
        ...chain('water',40,[[0,760],[900,740],[1700,700],[2400,800]]),
        // 창고·부두
        B('house',1000,1000,180,120,{prop:'cottage'}),B('house',1400,1100,160,110),B('house',1900,1000,200,130,{prop:'cottage'}),
        B('house',1100,400,150,100),B('house',1500,250,120,90),C('rock',1350,520,30),C('rock',1650,560,30),
        C('tree',900,1300,46),C('tree',150,600,50),C('tree',700,300,48),C('tree',2300,1350,50),
        // 난파선 등대: 바위 곶(남쪽 틈) + 등대 + 난파선
        ...chain('rock',34,[[1800,-40],[1780,520],[1950,560],[2250,540],[2300,-40]]),
        B('lighthouse',2000,140,80,160,{prop:'lighthouse'}),C('pillar',2040,320,55),E('wreck',1900,430,110,50)
      ],
      gaps:[gap(450,750,110),gap(1300,720,110),gap(2100,550,100)],
      shrine:{x:2040,y:330,r:260,gate:[2100,560],sign:[2100,690]},
      habitats:{
        mild:[[430,1300,70,3],[430,1110,70,3],[430,860,70,3],[720,1320,80,3]],
        medium:[[1280,900,80,2],[1750,1250,90,2],[1250,600,80,2],[1550,430,90,3],[800,420,90,3]],
        spicy:[[1890,230,70,3],[2190,250,70,3],[2190,430,60,3],[2100,470,50,3]]
      }
    },
    { key:'stars', spawn:[1200,1340],
      palette:{ground:'#4b4780',wash:'#5f5a9c',road:'#8d86c4',roadEdge:'#5c5595',water:'#1b1838',waterEdge:'#6e63c7',tree:'#5e8b6f',treeDark:'#3f6450',rock:'#6a6397',rockDark:'#46406f',wall:'#7f73c2',wallDark:'#4d4489',gold:'#ffd97a',purple:'#b08cff',crystal:'#c6b4ff'},
      places:[
        {name:'별빛 정원',x:1200,y:1250,note:'순한맛 · 별 분수 곁'},
        {name:'고요한 도서관',x:550,y:300,note:'보통맛 · 책장 기둥 사이'},
        {name:'유성 협곡 다리',x:1950,y:760,note:'협곡은 다리로만 건너요'},
        {name:'아스트랄 천문대',x:1950,y:560,note:'매운맛 · 별빛 기둥 안쪽',spicy:true}
      ],
      roads:[[[1200,1340],[1200,1040],[1100,800],[800,650],[560,740]],[[1200,1040],[1500,900],[1700,800],[1950,640],[1950,480]],[[1300,1200],[1500,1050],[1700,1250]]],
      obstacles:[
        // 별빛 정원: 울타리(가운데 문) + 별 분수
        S('hedge',950,1040,1450,1040,18),C('altar',1200,1180,50),
        // 고요한 도서관
        B('library',400,380,300,220,{prop:'cottage'}),C('pillar',350,700,24),C('pillar',750,700,24),C('pillar',350,300,24),C('pillar',750,300,24),
        // 유성 바위
        C('rock',1600,1000,45),C('rock',1800,1150,55),C('rock',1550,1300,40),C('rock',300,1200,50),C('rock',900,250,40),
        // 유성 협곡 (다리 1)
        ...chain('void',50,[[1350,-40],[1500,600],[2440,680]]),
        // 아스트랄 천문대: 돔 + 별빛 기둥 고리(남쪽 열림)
        C('dome',1950,250,90,{prop:'crystalcluster'}),
        ...ring(1950,250,230,[0,45,135,180,225,270,315]).map(p=>C('pillar',p[0],p[1],20)),
        C('crystal',1750,520,24),C('crystal',2150,520,24)
      ],
      gaps:[gap(1200,1040,80),gap(1950,640,120)],
      shrine:{x:1950,y:260,r:260,gate:[1950,480],sign:[1950,560]},
      habitats:{
        mild:[[1080,1300,80,3],[1320,1300,80,3],[1000,1150,60,3],[1400,1150,60,3]],
        medium:[[560,740,110,3],[900,480,80,3],[250,520,70,2],[1500,1050,100,2],[1700,1250,100,2]],
        spicy:[[1800,330,70,3],[2100,330,70,3],[1950,470,70,3],[1790,150,45,2],[2110,150,45,1]]
      }
    }
  ];

  /* ======================================================================
     기하 — 충돌 · 격자 · 경로
     ====================================================================== */
  // Traced in the 1586×992 painted asset coordinates; collision follows the picture, not the old blockout.
  const px = W/1586, py = H/992;
  const poly = (k,points) => ({t:'p',k,points:points.map(([x,y])=>[x*px,y*py])});
  const oval = (k,x,y,rx,ry=rx) => E(k,x*px,y*py,rx*px,ry*py);
  const box = (k,x,y,w,h) => B(k,x*px,y*py,w*px,h*py);
  const stroke = (k,r,points) => chain(k,r*px,points.map(([x,y])=>[x*px,y*py]));
  const rocks = a => a.map(([x,y,r])=>oval('rock',x,y,r));
  const trees = a => a.map(([x,y,rx,ry])=>oval('tree',x,y,rx,ry||rx));
  REGIONS[0].obstacles = [
    poly('water',[[1055,0],[1164,0],[1186,132],[1172,245],[1201,374],[1110,397],[1106,281],[1085,173]]),
    poly('water',[[1139,480],[1217,462],[1250,529],[1310,554],[1370,620],[1376,690],[1326,734],[1244,758],[1120,753],[1040,710],[1010,659],[1030,591],[1100,550],[1150,529]]),
    ...stroke('wall',15,[[727,419],[682,410],[591,302],[590,148],[682,43],[831,23],[959,98],[989,235],[958,335],[883,392]]),
    ...rocks([[590,405,31],[993,415,30],[628,787,31],[965,763,27],[1467,605,34],[139,894,38]]),
    ...[[715,174],[869,174],[714,297],[870,298],[353,505],[948,359],[687,400]].slice(0,4).map(([x,y])=>oval('pillar',x,y,19,20)),
    ...trees([[170,495,47,44],[287,482,45,44],[404,505,48,45],[168,629,48,44],[288,624,47,46],[418,624,48,44],[168,754,48,45],[285,748,46,45],[410,747,48,45]]),
    poly('tree',[[0,0],[337,0],[320,60],[211,158],[100,220],[0,280]]),
    poly('tree',[[1270,0],[1586,0],[1586,187],[1460,181],[1360,94]]),
    poly('tree',[[1515,310],[1586,304],[1586,481],[1493,444],[1467,378]]),
    poly('tree',[[0,333],[47,431],[40,692],[102,813],[76,992],[0,992]]),
    poly('tree',[[159,992],[183,931],[304,884],[546,900],[592,992]]),
    poly('tree',[[1175,992],[1207,896],[1290,854],[1460,887],[1586,806],[1586,992]])
  ];
  REGIONS[1].obstacles = [
    poly('water',[[0,359],[100,401],[226,411],[333,419],[421,400],[424,494],[313,500],[218,472],[103,474],[0,452]]),
    poly('water',[[500,419],[640,399],[731,413],[842,462],[949,509],[1058,518],[1035,597],[943,577],[839,521],[744,489],[641,469],[502,493]]),
    poly('water',[[1137,548],[1240,543],[1358,549],[1494,529],[1586,521],[1586,602],[1495,618],[1370,637],[1250,622],[1116,614]]),
    ...stroke('root',30,[[1159,-20],[1083,58],[1037,174],[1063,308],[1152,401],[1227,441]]),
    ...stroke('root',28,[[1328,446],[1430,394],[1516,313],[1540,194],[1494,64],[1410,-20]]),
    oval('altar',1286,156,65,59),
    ...rocks([[1170,386,24],[1395,380,24],[1120,803,42],[1406,860,48],[1274,700,34],[645,487,33],[841,248,23],[430,247,20]]),
    ...trees([[81,143,43],[198,126,45],[303,154,48],[413,125,50],[512,158,48],[84,290,45],[202,320,48],[318,310,49],[415,340,46],[537,337,46],[521,253,43],[691,182,46],[818,155,47],[920,233,44],[138,777,48],[210,625,48],[477,669,56],[574,912,53],[725,901,51],[862,628,50]]),
    poly('tree',[[0,515],[155,512],[190,572],[136,637],[100,718],[0,834]]),
    poly('tree',[[0,0],[1586,0],[1586,72],[1470,40],[1260,38],[1043,76],[839,69],[654,65],[601,96],[497,50],[358,62],[203,38],[0,66]]),
    poly('tree',[[0,992],[0,940],[74,888],[151,862],[249,911],[340,943],[430,923],[482,992]]),
    poly('tree',[[843,992],[885,906],[1000,920],[1090,861],[1177,843],[1260,904],[1323,963],[1465,906],[1541,771],[1586,745],[1586,992]])
  ];
  // The painted root doorway must remain wide enough for the pathfinding clearance.
  REGIONS[1].obstacles.filter(s=>s.k==='root').forEach(s=>{s.openings=[oval('floor',1280,440,65,80)];});
  REGIONS[2].obstacles = [
    poly('water',[[320,268],[470,259],[627,279],[724,330],[769,421],[774,516],[728,591],[640,626],[478,645],[335,626],[233,584],[173,530],[138,435],[152,353],[228,298]]),
    ...stroke('wall',18,[[1092,377],[1087,86],[1421,86],[1422,372],[1316,377]]),
    ...stroke('wall',18,[[1092,377],[1194,378]]),
    ...rocks([[196,204,52],[325,135,45],[792,174,54],[657,297,42],[1058,602,41],[1231,595,42],[1255,730,47],[1452,856,43],[263,858,40]]),
    oval('crystal',1260,216,62,48),oval('crystal',1150,316,22,30),oval('crystal',1371,316,23,31),
    box('tent',650,716,82,60),box('tent',873,714,87,62),box('tent',587,842,91,58),box('tent',943,841,88,57),
    ...trees([[498,56,43],[143,257,44],[133,808,41],[350,854,36],[1181,956,38],[1550,257,34]]),
    box('rock',0,0,45,992),box('rock',1545,0,41,992)
  ];
  REGIONS[3].obstacles = [
    poly('water',[[0,0],[144,0],[140,272],[229,290],[238,450],[0,455]]),
    poly('water',[[0,454],[251,454],[251,550],[0,558]]),
    poly('water',[[349,444],[539,426],[707,424],[819,420],[819,521],[648,533],[449,547],[349,550]]),
    poly('water',[[910,417],[1129,407],[1263,430],[1433,461],[1586,482],[1586,582],[1411,545],[1263,523],[1135,504],[910,523]]),
    poly('water',[[1538,0],[1586,0],[1586,482],[1533,468],[1540,390],[1538,322]]),
    ...stroke('wall',18,[[1190,-20],[1182,294],[1240,332],[1345,354]]),
    ...stroke('wall',18,[[1455,359],[1520,321],[1530,75],[1440,48]]),
    oval('lighthouse',1367,121,41,105),oval('wreck',1267,279,64,43),
    box('house',166,582,91,90),box('house',369,585,96,90),box('house',140,774,101,79),box('house',390,777,112,78),
    box('stall',111,694,112,77),box('stall',340,690,117,75),box('stall',62,600,74,102),
    poly('house',[[641,626],[734,586],[830,635],[848,727],[818,750],[650,749],[614,700]]),
    box('house',934,727,101,79),poly('house',[[1224,652],[1327,599],[1450,652],[1460,720],[1395,746],[1233,735]]),
    box('house',716,264,124,88),box('house',960,147,119,92),
    ...trees([[483,200,69,73],[611,841,57,63],[80,363,45,51],[1514,871,64,68]]),
    ...rocks([[895,340,29],[1093,367,31]]),
    poly('rock',[[0,575],[43,584],[48,790],[90,914],[179,992],[0,992]])
  ];
  const abyss = poly('void',[[870,0],[1586,0],[1586,535],[1450,513],[1328,493],[1228,469],[956,460],[922,365]]);
  abyss.openings = [oval('floor',1290,174,184,172),poly('floor',[[1255,280],[1322,280],[1340,540],[1231,540]])];
  REGIONS[4].obstacles = [
    abyss,
    ...stroke('wall',11,[[850,-10],[902,315],[936,423],[1219,465]]),
    ...stroke('wall',12,[[1345,468],[1586,505]]),
    oval('dome',1290,152,80,83),
    ...[[1134,156],[1193,24],[1435,21],[1490,176],[1438,291],[1158,291]].map(([x,y])=>oval('pillar',x,y,16,25)),
    box('library',255,248,217,134),
    ...[[222,204],[497,478],[229,480],[308,371]].map(([x,y])=>oval('pillar',x,y,14,27)),
    ...stroke('hedge',19,[[611,684],[759,680]]),...stroke('hedge',19,[[829,680],[963,665]]),
    ...rocks([[602,141,42],[1051,652,39],[1188,751,49],[1032,851,39],[192,787,48]]),
    ...trees([[140,339,60,57],[602,335,63,61],[625,784,45,49]]),
    ...[[731,871],[851,870],[793,792],[768,700],[814,700]].map(([x,y])=>oval('pillar',x,y,13,25))
  ];
  REGIONS.forEach(r=>{r.gaps=[];});
  if(entryWorld){REGIONS[0].places.forEach((p,i)=>p.name=entryWorld.places[i]);REGIONS[0].spawn=[1200,1320];}
  if(root.ThinkstarGrade===5)REGIONS[0].obstacles.push(oval('altar',793,174,38,34));

  // Spread arrival-area friends across real clearings, using the painted map coordinates.
  const clearings=[null,
    [[320,820],[580,790],[900,790],[1050,710],[280,610],[600,570],[850,650],[1050,400],[720,340],[550,470],[950,300],[400,800]],
    [[740,810],[1050,850],[550,750],[1390,750],[920,620],[280,700],[840,350],[620,180],[980,430],[350,180],[1450,450],[1040,650]],
    [[300,720],[590,850],[870,840],[1120,870],[1440,750],[520,590],[1100,590],[400,350],[690,350],[850,140],[1100,100],[550,150]],
    [[650,870],[950,850],[1050,680],[430,770],[350,570],[650,450],[800,250],[430,170],[200,650],[1070,530],[900,900],[680,120]]
  ];
  REGIONS.forEach((r,i)=>{if(i)r.habitats.mild=clearings[i].map(([x,y])=>[x*px,y*py,0,1]);});
  // All worlds share the first garden's dimensions; nested walkable openings scale too.
  const enlarge=p=>p.map(v=>v*1.2);
  function enlargeShape(shape){
    for(const key of ['x','y','x1','y1','x2','y2','r','rx','ry','w','h'])if(typeof shape[key]==='number')shape[key]*=1.2;
    if(shape.points)shape.points=shape.points.map(enlarge);
    shape.openings?.forEach(enlargeShape);
  }
  REGIONS.forEach(r=>{
    r.width=2880;r.height=1800;r.spawn=enlarge(r.spawn);
    r.roads=r.roads.map(line=>line.map(enlarge));
    r.places.forEach(p=>{p.x*=1.2;p.y*=1.2;});
    r.obstacles.forEach(enlargeShape);r.gaps.forEach(enlargeShape);
    for(const t of Object.keys(r.habitats))r.habitats[t]=r.habitats[t].map(([x,y,rad,n])=>[x*1.2,y*1.2,rad*1.2,n]);
    if(r.shrine){for(const k of ['x','y','r'])r.shrine[k]*=1.2;r.shrine.gate=enlarge(r.shrine.gate);r.shrine.sign=enlarge(r.shrine.sign);}
  });
  const COLS = 2880 / G, ROWS = 1800 / G;
  function segDist(x, y, s) {
    const vx = s.x2 - s.x1, vy = s.y2 - s.y1, l2 = vx * vx + vy * vy || 1;
    let t = ((x - s.x1) * vx + (y - s.y1) * vy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    return Math.hypot(x - (s.x1 + vx * t), y - (s.y1 + vy * t));
  }
  // pad>0: 도형을 넓혀서 판정(플레이어 반지름), pad<0: 좁혀서 판정(틈 안에 완전히 들어왔는지)
  function hit(s, x, y, pad) {
    switch (s.t) {
      case 'p': {
        let inside=false, edge=Infinity; const a=s.points;
        for(let i=0,j=a.length-1;i<a.length;j=i++){
          const [ax,ay]=a[i],[bx,by]=a[j];
          if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
          edge=Math.min(edge,segDist(x,y,{x1:ax,y1:ay,x2:bx,y2:by}));
        }
        return pad<0 ? inside&&edge>-pad : inside||edge<pad;
      }
      case 'c': return Math.hypot(x - s.x, y - s.y) < s.r + pad;
      case 'e': { const a = s.rx + pad, b = s.ry + pad; if (a <= 0 || b <= 0) return false; const dx = x - s.x, dy = y - s.y; return dx * dx / (a * a) + dy * dy / (b * b) < 1; }
      case 'r': return x > s.x - pad && x < s.x + s.w + pad && y > s.y - pad && y < s.y + s.h + pad;
      case 's': return segDist(x, y, s) < s.r + pad;
    }
    return false;
  }
  function blockedAt(reg, x, y, pad) {
    if (x < pad || y < pad || x > reg.width - pad || y > reg.height - pad) return true;
    for (const s of reg.obstacles) {
      if (hit(s, x, y, pad) && !(s.openings||reg.gaps).some(g => hit(g, x, y, -pad))) return true;
    }
    return false;
  }
  const cellAt = (x, y) => Math.min(ROWS - 1, Math.max(0, Math.floor(y / G))) * COLS + Math.min(COLS - 1, Math.max(0, Math.floor(x / G)));
  const center = i => ({ x: (i % COLS + .5) * G, y: (Math.floor(i / COLS) + .5) * G });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function neighbors(free, i, fn) {
    const c = i % COLS, r = (i - c) / COLS;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
      const j = nr * COLS + nc; if (!free[j]) continue;
      if (dr && dc && !(free[r * COLS + nc] && free[nr * COLS + c])) continue;   // 모서리 끼어 지나가기 금지
      fn(j, dr && dc ? 1.41421 : 1);
    }
  }
  // 시작 칸에서 체비쇼프 반경을 넓혀 가며 pred를 만족하는 가장 가까운 칸
  function nearestCell(start, pred, maxRing = 40) {
    const sc = start % COLS, sr = (start - sc) / COLS;
    for (let d = 0; d <= maxRing; d++) {
      let best = -1, bd = Infinity;
      for (let r = sr - d; r <= sr + d; r++) {
        if (r < 0 || r >= ROWS) continue;
        const step = (r === sr - d || r === sr + d) ? 1 : 2 * d || 1;
        for (let c = sc - d; c <= sc + d; c += step) {
          if (c < 0 || c >= COLS) continue;
          const j = r * COLS + c; if (!pred(j)) continue;
          const dd = (r - sr) * (r - sr) + (c - sc) * (c - sc); if (dd < bd) { bd = dd; best = j; }
        }
      }
      if (best >= 0) return best;
    }
    return -1;
  }

  const geoCache = [];
  function geo(ri) {
    if (geoCache[ri]) return geoCache[ri];
    const reg = REGIONS[ri];
    const free = new Uint8Array(COLS * ROWS);
    for (let i = 0; i < free.length; i++) { const p = center(i); free[i] = blockedAt(reg, p.x, p.y, CELL_PAD) ? 0 : 1; }
    let sc = cellAt(reg.spawn[0], reg.spawn[1]);
    if (!free[sc]) sc = nearestCell(sc, i => free[i]);
    const reach = new Uint8Array(free.length);
    const q = [sc]; reach[sc] = 1;
    for (let h = 0; h < q.length; h++) neighbors(free, q[h], j => { if (!reach[j]) { reach[j] = 1; q.push(j); } });
    const spawn = center(sc);
    // 서식지 주머니 → 맛별 12개 고정 슬롯. 모든 슬롯은 출발점에서 도달 가능한 칸에 스냅된다.
    const taken = [], slots = {};
    for (const t of ['mild', 'medium', 'spicy']) {
      slots[t] = [];
      for (const [px, py, pr, n] of reg.habitats[t]) {
        for (let k = 0; k < n; k++) {
          const ang = k * 2 * Math.PI / n - Math.PI / 2 + (n > 1 ? .4 : 0), rad = n === 1 ? 0 : pr * (k % 2 ? .98 : .65);
          const want = cellAt(px + Math.cos(ang) * rad, py + Math.sin(ang) * rad);
          let c = nearestCell(want, i => reach[i] && (dist(spawn,center(i))>=340) && taken.every(p => dist(p, center(i)) >= MIN_GAP), 30);
          if (c < 0) c = nearestCell(want, i => reach[i] && (dist(spawn,center(i))>=340));
          const p = c < 0 ? spawn : center(c);
          taken.push(p); slots[t].push(p);
        }
      }
    }
    return geoCache[ri] = { reg, free, reach, spawn, slots, taken, reachCount: q.length };
  }

  // A*: goalR>0이면 목표점 반경 goalR 안의 아무 칸이나 도착으로 인정 (친구 옆에 서기)
  function findPath(ri, sx, sy, gx, gy, goalR = 0) {
    const g = geo(ri), free = g.free;
    let start = cellAt(sx, sy);
    const connects = i => { const p = center(i); return free[i] && clearSeg(g.reg,sx,sy,p.x,p.y); };
    if (!connects(start)) start = nearestCell(start, connects);
    if (start < 0) return null;
    let goal = cellAt(gx, gy);
    if (!goalR) { if (!free[goal]) goal = nearestCell(goal, i => free[i]); if (goal < 0) return null; }
    const target = goalR ? { x: gx, y: gy } : center(goal);
    const isGoal = goalR ? (i => {const p=center(i);return dist(p,target)<=goalR&&clearSeg(g.reg,p.x,p.y,target.x,target.y);}) : (i => i === goal);
    if (isGoal(start)) return [];
    const h = i => { const p = center(i); return Math.hypot(p.x - target.x, p.y - target.y) / G; };
    const gs = new Float32Array(free.length).fill(Infinity), from = new Int32Array(free.length).fill(-1), closed = new Uint8Array(free.length);
    const heap = []; const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { let l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    gs[start] = 0; push(h(start), start);
    let found = -1, guard = 0;
    while (heap.length && guard++ < 40000) {
      const [, i] = pop(); if (closed[i]) continue; closed[i] = 1;
      if (isGoal(i)) { found = i; break; }
      neighbors(free, i, (j, w) => { if (closed[j]) return; const ng = gs[i] + w; if (ng < gs[j]) { gs[j] = ng; from[j] = i; push(ng + h(j), j); } });
    }
    if (found < 0) return null;
    const path = []; for (let i = found; i !== start && i >= 0; i = from[i]) path.push(center(i));
    path.push(center(start));                  // 실제 위치 → 자기 칸(또는 가장 가까운 빈 칸) 노드부터 시작. 당기기로 생략될 수 있음
    path.push(center(start));
    return path.reverse();
  }
  // 실제 위치 → 격자 노드 선분이 플레이어 원으로 통과 가능한지 (6px 간격 표본)
  function clearSeg(reg, x1, y1, x2, y2) {
    const d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.ceil(d / 6));
    for (let i = 1; i <= n; i++) { const t = i / n; if (blockedAt(reg, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, R)) return false; }
    return true;
  }
  // 친구 곁에 설 자리: 도달 가능한 칸 중 희망 지점에 가장 가까운 칸
  function standSpot(ri, it) {
    const g = geo(ri), want = cellAt(it.x + 80, it.y + 36);
    let c = nearestCell(want, i => g.reach[i] && dist(center(i), it) >= 40 && dist(center(i), it) <= 110, 10);
    if (c < 0) c = nearestCell(cellAt(it.x, it.y), i => g.reach[i]);
    return c < 0 ? g.spawn : center(c);
  }

  /* ======================================================================
     배치 — 안정적인 미션 ID 순서로 맛별 고정 슬롯 (나머지 연산 없음)
     ====================================================================== */
  const dangerSeen=new Set();
  const mem = { region:0, x: null, y: null, rescued: null, companion: null, lastHero: null, encounter: null };
  const positionKey = (root.ThinkstarTeacherPreview?"teacher-preview-":"")+"thinkstar-position-v1-grade"+(root.ThinkstarGrade||5);
  try { const saved=JSON.parse(sessionStorage.getItem(positionKey)||"null");if(saved&&Number.isInteger(saved.region)&&saved.region>=0&&saved.region<REGIONS.length&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)){mem.region=saved.region;const scale=saved.region>0&&saved.geometry!==2?1.2:1;mem.x=saved.x*scale;mem.y=saved.y*scale;} } catch {}
  function savePosition(){try{sessionStorage.setItem(positionKey,JSON.stringify({region:mem.region,x:mem.x,y:mem.y,geometry:2}));}catch{}}
  function regionIndex(r) { if (r == null) return mem.region; if (typeof r === 'number') return Math.max(0, Math.min(REGIONS.length - 1, r)); const i = REGIONS.findIndex(z => z.key === r); return i < 0 ? 0 : i; }
  function layout(catalog, region) {
    const ri = regionIndex(region), g = geo(ri);
    const here = catalog.filter(m => (m.region || 0) === ri);
    const groups = { mild: [], medium: [], spicy: [] };
    here.forEach(m => groups[taste(m)].push(m));
    const pos = new Map(), taken = g.taken.slice();
    for (const t of ['mild', 'medium', 'spicy']) {
      const pockets = g.reg.habitats[t], offsets = pockets.map((_, i) => pockets.slice(0,i).reduce((n,p)=>n+p[3],0));
      const order = Array.from({length:Math.max(...pockets.map(p=>p[3]))},(_,k)=>pockets.flatMap((p,j)=>k<p[3]?[offsets[j]+k]:[])).flat();
      // Keep one gentle first encounter; spread the rest across separate landmarks.
      if(ri===0&&t==='mild'){const nearest=order.reduce((a,b)=>dist(g.slots[t][a],g.spawn)<dist(g.slots[t][b],g.spawn)?a:b);order.splice(order.indexOf(nearest),1);order.unshift(nearest);}
      groups[t].sort((a, b) => (a.entryRank??99)-(b.entryRank??99)||(a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).forEach((m, i) => {
        let p = g.slots[t][order[i]];
        if (!p) {                                  // 12개를 넘는 비정상 카탈로그: 서식지 중심 근처 빈 칸
          const [hx, hy] = g.reg.habitats[t][0];
          const c = nearestCell(cellAt(hx, hy), j => g.reach[j] && taken.every(q => dist(q, center(j)) >= MIN_GAP), 40);
          p = c < 0 ? g.spawn : center(c); taken.push(p);
        }
        pos.set(m.id, p);
      });
    }
    return here.map(m => ({ m, t: taste(m), x: pos.get(m.id).x, y: pos.get(m.id).y }));
  }
  function spawnTo(ri) { const g = geo(ri); mem.region = ri; mem.x = g.spawn.x; mem.y = g.spawn.y; }
  function ensurePos(ctx) {
    if (mem.region && ctx.regionOpen && !ctx.regionOpen(mem.region)) spawnTo(0);
    if (mem.x == null || mem.y == null) spawnTo(mem.region);
  }

  /* ======================================================================
     지형 그리기 — 충돌 도형과 같은 데이터로 SVG 생성
     ====================================================================== */
  const TASTE_TINT = { mild: '#ffe98a', medium: '#ffb36b', spicy: '#8b5cf6' };
  function bbox(s) {
    if (s.t === 'c') return { x: s.x - s.r, y: s.y - s.r, w: 2 * s.r, h: 2 * s.r };
    if (s.t === 'e') return { x: s.x - s.rx, y: s.y - s.ry, w: 2 * s.rx, h: 2 * s.ry };
    if (s.t === 'r') return { x: s.x, y: s.y, w: s.w, h: s.h };
    return { x: Math.min(s.x1, s.x2) - s.r, y: Math.min(s.y1, s.y2) - s.r, w: Math.abs(s.x2 - s.x1) + 2 * s.r, h: Math.abs(s.y2 - s.y1) + 2 * s.r };
  }
  function crystalPoly(x, y, r, fill) {
    let out = `<circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="${fill}" opacity=".18"/>`;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * 1.256 + .3, len = r * (i % 2 ? .95 : 1.25);
      const tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len, bx = x + Math.cos(a + 1.1) * r * .45, by = y + Math.sin(a + 1.1) * r * .45, cx = x + Math.cos(a - 1.1) * r * .45, cy = y + Math.sin(a - 1.1) * r * .45;
      out += `<polygon points="${tx.toFixed(1)},${ty.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}" fill="${fill}" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`;
    }
    return out + `<circle cx="${x}" cy="${y}" r="${r * .35}" fill="#fff" opacity=".8"/>`;
  }
  function drawShape(s, P) {
    const k = s.k;
    if (s.t === 's') {
      const line = (stroke, w, extra = '') => `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
      if (k === 'water') return line(P.waterEdge, s.r * 2 + 12) + line(P.water, s.r * 2) + line('#fff', s.r * .6, 'opacity=".35" stroke-dasharray="22 46"');
      if (k === 'void') return line(P.waterEdge, s.r * 2 + 14, 'opacity=".8"') + line(P.water, s.r * 2) + line(P.purple, s.r * .5, 'opacity=".55" stroke-dasharray="6 30"');
      if (k === 'hedge') return line(P.treeDark, s.r * 2 + 6) + line(P.tree, s.r * 2) + line('#fff', 4, 'opacity=".25" stroke-dasharray="8 18"');
      if (k === 'root') return line(P.wallDark, s.r * 2 + 8) + line(P.wall, s.r * 2) + line('#fff', s.r * .5, 'opacity=".22" stroke-dasharray="40 30"');
      if (k === 'rock') return line(P.rockDark, s.r * 2 + 8) + line(P.rock, s.r * 2) + line('#fff', s.r * .5, 'opacity=".25" stroke-dasharray="14 40"');
      return line(P.wallDark, s.r * 2 + 8) + line(P.wall, s.r * 2) + line('#fff', s.r * .6, 'opacity=".35" stroke-dasharray="18 14"');  // wall
    }
    if (s.t === 'e') {
      if (k === 'wreck') return `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="#6b4a33" stroke="#3d2a1b" stroke-width="5"/><path d="M${s.x - s.rx * .8} ${s.y}h${s.rx * 1.6}M${s.x - s.rx * .5} ${s.y - s.ry * .7}v${s.ry * 1.4}M${s.x} ${s.y - s.ry * .9}v${s.ry * 1.8}M${s.x + s.rx * .5} ${s.y - s.ry * .7}v${s.ry * 1.4}" stroke="#c9a77b" stroke-width="4"/>`;
      const ice = s.ice ? `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx * .9}" ry="${s.ry * .88}" fill="#fff" opacity=".45"/><path d="M${s.x - s.rx * .5} ${s.y - s.ry * .3}l80 50 60-30 90 60M${s.x + s.rx * .2} ${s.y + s.ry * .5}l50-40 70 30" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>` : `<ellipse cx="${s.x - s.rx * .15}" cy="${s.y - s.ry * .2}" rx="${s.rx * .55}" ry="${s.ry * .45}" fill="#fff" opacity=".22"/><path d="M${s.x - s.rx * .4} ${s.y + s.ry * .3}q40-14 80 0t80 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`;
      return `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx + 10}" ry="${s.ry + 10}" fill="${P.waterEdge}"/><ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="${P.water}"/>${ice}`;
    }
    if (s.t === 'r') {
      const { x, y, w, h } = s, roofH = h * .42;
      if (k === 'tent') return `<ellipse cx="${x + w / 2}" cy="${y + h}" rx="${w * .6}" ry="12" fill="#000" opacity=".12"/><polygon points="${x},${y + h} ${x + w / 2},${y} ${x + w},${y + h}" fill="${P.wall}" stroke="${P.wallDark}" stroke-width="4" stroke-linejoin="round"/><polygon points="${x + w * .38},${y + h} ${x + w / 2},${y + h * .45} ${x + w * .62},${y + h}" fill="${P.wallDark}"/>`;
      if (k === 'lighthouse') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#f3e9df" stroke="#9c6a3c" stroke-width="4"/><path d="M${x} ${y + h * .3}h${w}M${x} ${y + h * .6}h${w}" stroke="#d9534f" stroke-width="${h * .12}"/><rect x="${x + 8}" y="${y - 26}" width="${w - 16}" height="34" rx="6" fill="${P.gold}" stroke="#9c6a3c" stroke-width="3"/>`;
      const body = `<rect x="${x}" y="${y + roofH}" width="${w}" height="${h - roofH}" fill="${P.wall}" stroke="${P.wallDark}" stroke-width="4"/>`;
      const roof = `<polygon points="${x - 6},${y + roofH} ${x + w * .5},${y} ${x + w + 6},${y + roofH}" fill="${P.wallDark}" stroke="${P.wallDark}" stroke-width="4" stroke-linejoin="round"/>`;
      const door = `<rect x="${x + w * .42}" y="${y + h * .62}" width="${w * .16}" height="${h * .38}" rx="6" fill="${P.wallDark}"/>`;
      const books = k === 'library' ? `<path d="M${x + 20} ${y + roofH + 20}h${w - 40}M${x + 20} ${y + roofH + 44}h${w - 40}M${x + 20} ${y + roofH + 68}h${w - 40}" stroke="${P.gold}" stroke-width="8" stroke-dasharray="18 10"/>` : '';
      return `<ellipse cx="${x + w / 2}" cy="${y + h}" rx="${w * .6}" ry="14" fill="#000" opacity=".14"/>${body}${roof}${door}${books}`;
    }
    const { x, y, r } = s;
    if (k === 'tree') return `<ellipse cx="${x + r * .1}" cy="${y + r * .55}" rx="${r * .9}" ry="${r * .4}" fill="#000" opacity=".16"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.treeDark}"/><circle cx="${x - r * .18}" cy="${y - r * .2}" r="${r * .72}" fill="${P.tree}"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .3}" fill="#fff" opacity=".28"/>`;
    if (k === 'trunk') return `<circle cx="${x}" cy="${y}" r="${r + 8}" fill="${P.wallDark}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.wall}"/><circle cx="${x}" cy="${y}" r="${r * .62}" fill="none" stroke="${P.wallDark}" stroke-width="5" stroke-dasharray="30 12"/><circle cx="${x}" cy="${y}" r="${r * .25}" fill="${P.gold}" opacity=".9"/>`;
    if (k === 'rock') return `<ellipse cx="${x}" cy="${y + r * .6}" rx="${r}" ry="${r * .38}" fill="#000" opacity=".16"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.rockDark}"/><circle cx="${x - r * .15}" cy="${y - r * .18}" r="${r * .7}" fill="${P.rock}"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .22}" fill="#fff" opacity=".35"/>`;
    if (k === 'pillar') return `<circle cx="${x}" cy="${y + 4}" r="${r}" fill="${P.wallDark}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.wall}" stroke="${P.wallDark}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r * .45}" fill="${P.gold}" opacity=".8"/>`;
    if (k === 'crystal') return crystalPoly(x, y, r, P.crystal || P.purple);
    if (k === 'altar') return `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="${P.purple}" opacity=".35"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.wall}" stroke="${P.gold}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="${r * .55}" fill="${P.gold}"/><circle cx="${x}" cy="${y}" r="${r * .25}" fill="#fff" opacity=".9"/>`;
    if (k === 'dome') return `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="${P.purple}" opacity=".4"/><circle cx="${x}" cy="${y}" r="${r}" fill="${P.wall}" stroke="${P.wallDark}" stroke-width="5"/><path d="M${x - r * .7} ${y}a${r * .7} ${r * .7} 0 0 1 ${r * 1.4} 0" fill="${P.gold}" opacity=".85"/><circle cx="${x}" cy="${y - r * .3}" r="${r * .18}" fill="#fff"/>`;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.rock}" stroke="${P.rockDark}" stroke-width="4"/>`;
  }
  function drawGap(gp, reg, P) {
    const s = reg.obstacles.find(o => o.t === 's' && segDist(gp.x, gp.y, o) < o.r + 4);
    if (!s) return '';
    const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180 / Math.PI + 90, len = s.r * 2 + 48, wdt = 2*(gp.r-R);
    const g = `<circle cx="${gp.x}" cy="${gp.y}" r="${gp.r}" fill="${P.road}" stroke="${P.roadEdge}" stroke-width="3"/><g transform="translate(${gp.x} ${gp.y}) rotate(${ang})">`;
    if (s.k === 'water' || s.k === 'void') {   // 다리
      return `${g}<rect x="${-wdt / 2 - 6}" y="${-len / 2}" width="${wdt + 12}" height="${len}" rx="8" fill="${P.roadEdge}"/><rect x="${-wdt / 2}" y="${-len / 2}" width="${wdt}" height="${len}" rx="6" fill="${P.road}"/><path d="${Array.from({ length: Math.floor(len / 14) }, (_, i) => `M${-wdt / 2} ${-len / 2 + 7 + i * 14}h${wdt}`).join('')}" stroke="${P.roadEdge}" stroke-width="3" opacity=".8"/><rect x="${-wdt / 2 - 6}" y="${-len / 2}" width="6" height="${len}" fill="${P.wallDark}"/><rect x="${wdt / 2}" y="${-len / 2}" width="6" height="${len}" fill="${P.wallDark}"/></g>`;
    }
    // 울타리·성벽의 문: 계단 + 아치
    return `${g}<rect x="${-wdt / 2}" y="${-len / 2}" width="${wdt}" height="${len}" fill="${P.road}" opacity=".9"/><path d="${[0, 1, 2, 3].map(i => `M${-wdt / 2 + i * 4} ${len / 2 - 10 - i * 12}h${wdt - i * 8}`).join('')}" stroke="${P.wallDark}" stroke-width="4" opacity=".75"/><path d="M${-wdt / 2 - 10} ${-len / 2 - 10}v-40a${wdt / 2 + 10} ${wdt / 2 + 10} 0 0 1 ${wdt + 20} 0v40" fill="none" stroke="${P.gold}" stroke-width="10" stroke-linecap="round"/></g>`;
  }
  function drawShrine(reg, P) {
    const s = reg.shrine; if (!s) return '';
    const [gx, gy] = s.gate;
    const lanterns = ring(s.x, s.y, s.r + 40, [60, 120, 160, 200, 240, 280, 320, 20]).map(p => `<circle class="ws-lantern" cx="${p[0]}" cy="${p[1]}" r="16" fill="${P.gold}"/><circle class="ws-lantern" cx="${p[0]}" cy="${p[1]}" r="34" fill="${P.gold}" opacity=".22"/>`).join('');
    return `<circle class="ws-glow" cx="${s.x}" cy="${s.y}" r="${s.r * 1.25}" fill="url(#ws-glow-${reg.key})"/>
      <circle cx="${s.x}" cy="${s.y}" r="${s.r * .92}" fill="${P.purple}" opacity=".16"/>
      <circle cx="${s.x}" cy="${s.y}" r="${s.r * .9}" fill="none" stroke="${P.gold}" stroke-width="4" stroke-dasharray="14 18" opacity=".75"/>
      <circle cx="${s.x}" cy="${s.y}" r="${s.r * .55}" fill="none" stroke="${P.gold}" stroke-width="3" stroke-dasharray="6 14" opacity=".6"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="${gx - 90 + i * 8}" y="${gy + 8 + i * 16}" width="${180 - i * 16}" height="12" rx="4" fill="${P.wall}" stroke="${P.wallDark}" stroke-width="2" opacity=".95"/>`).join('')}
      ${lanterns}`;
  }
  function terrainSvg(ri) {
    const g = geo(ri), reg = g.reg, P = reg.palette;
    const defs = `<defs><radialGradient id="ws-glow-${reg.key}"><stop offset="0" stop-color="${P.gold}" stop-opacity=".55"/><stop offset=".45" stop-color="${P.purple}" stop-opacity=".45"/><stop offset="1" stop-color="${P.purple}" stop-opacity="0"/></radialGradient></defs>`;
    const ground = `<rect width="${W}" height="${H}" fill="${P.ground}" opacity=".82"/>`;
    const wash = ['mild', 'medium', 'spicy'].map(t => reg.habitats[t].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.9}" ry="${r * 1.5}" fill="${TASTE_TINT[t]}" opacity="${t === 'spicy' ? .28 : .3}"/>`).join('')).join('');
    const roads = reg.roads.map(pts => { const d = 'M' + pts.map(p => p.join(' ')).join('L'); return `<path d="${d}" fill="none" stroke="${P.roadEdge}" stroke-width="62" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/><path d="${d}" fill="none" stroke="${P.road}" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>`; }).join('');
    const sorted = reg.obstacles.map((s, i) => ({ s, i, b: bbox(s) })).sort((a, b) => (a.b.y + a.b.h) - (b.b.y + b.b.h));
    const flat = sorted.filter(o => o.s.t === 's' || o.s.t === 'e').map(o => drawShape(o.s, P)).join('');
    const tall = sorted.filter(o => o.s.t === 'c' || o.s.t === 'r').map(o => drawShape(o.s, P)).join('');
    const gaps = reg.gaps.map(gp => drawGap(gp, reg, P)).join('');
    const spawn = `<circle cx="${g.spawn.x}" cy="${g.spawn.y}" r="46" fill="#fff" opacity=".35"/><circle cx="${g.spawn.x}" cy="${g.spawn.y}" r="30" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" opacity=".8"/>`;
    return `<svg class="world-terrain" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${defs}${ground}${wash}${roads}${drawShrine(reg, P)}${flat}${gaps}${spawn}${tall}</svg>`;
  }
  function propsHtml(ri) {
    return REGIONS[ri].obstacles.filter(s => s.prop).map(s => {
      const b = bbox(s), w = Math.round(b.w * 1.3), h = Math.round(b.h * 1.5);
      return `<i class="world-prop prop-${s.prop}" style="left:${Math.round(b.x + b.w / 2 - w / 2)}px;top:${Math.round(b.y + b.h - h)}px;width:${w}px;height:${h}px"></i>`;
    }).join('');
  }
  function placesHtml(ri) {
    const reg = REGIONS[ri];
    const labels = reg.places.map(p => `<div class="world-place${p.spicy ? ' spicy' : ''}" style="left:${p.x}px;top:${p.y}px"><b>${p.spicy ? '🔥 ' : ''}${esc(p.name)}</b><small>${esc(p.note)}</small></div>`).join('');
    const sign = reg.shrine ? `<div class="world-spicy-sign" style="left:${reg.shrine.sign[0]}px;top:${reg.shrine.sign[1]}px">⚠ 매운맛 영역 · 각오하고 올라가요</div>` : '';
    return labels + sign;
  }
  function minimapSvg(ri, items, passed) {
    const W=REGIONS[ri].width,H=REGIONS[ri].height;
    const g = geo(ri), reg = g.reg, P = reg.palette;
    const obs = `<image href="${mapImage(ri)}" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
    const shrine="";
    const dots = items.map(it => `<circle cx="${it.x}" cy="${it.y}" r="26" fill="${TASTE_TINT[it.t]}" stroke="${passed(it.m.id) ? '#fff' : '#1f2d4d'}" stroke-width="8"/>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><rect width="${W}" height="${H}" fill="${P.ground}"/>${shrine}${obs}${dots}<rect class="mm-view" x="0" y="0" width="100" height="100" fill="none" stroke="#fff" stroke-width="10" opacity=".8"/><circle class="mm-player" cx="${g.spawn.x}" cy="${g.spawn.y}" r="40" fill="#fff" stroke="#1f2d4d" stroke-width="12"/></svg>`;
  }

  /* ---------------- HTML ---------------- */
  function html(ctx) {
    const { catalog = [], passed = () => false, hero = 0, sprite, helper } = ctx;
    ensurePos(ctx);
    const W=REGIONS[mem.region].width,H=REGIONS[mem.region].height;
    const items = layout(catalog);
    const totalFriends = ctx.allFriends || catalog;
    const own = totalFriends.filter(m => passed(m.id)).length;
    const companions = pickCompanions(ctx.allFriends || catalog, passed);
    const rescued = mem.rescued;

    const creaturesHtml = items.map(({ m, t, x, y }) => {
      const got = passed(m.id);
      const isComp = companions.some(c=>c.id===m.id);
      const ring = rescued === m.id ? ' rescued' : '';
      return `<button type="button" class="wc wc-${t}${got ? ' got' : ' hidden-friend'}${isComp ? ' is-companion' : ''}${ring}"
        data-creature="${esc(m.id)}" style="left:${x}px;top:${y}px"
        aria-label="${got ? esc(m.friendName) : '아직 만나지 않은 친구'} · ${esc(m.title)} · ${tastes[t]}">
        ${sprite(m, !got, 'wc-art')}
        <span class="wc-difficulty">${{mild:'● 순한맛',medium:'◆ 보통맛',spicy:'✦ 매운맛'}[t]}</span><span class="wc-name">${ctx.retryLeft?.(m.id)?'잠시 쉬는 중':got ? esc(m.friendName) : ''}</span>
      </button>`;
    }).join('');

    const listHtml = items.map(({m}) => {
      const got = passed(m.id);
      return `<li><button type="button" class="wl-item" data-creature="${esc(m.id)}">
        ${sprite(m, !got, 'tiny')}<b>${got ? esc(m.friendName) : '아직 만나지 않은 친구'}</b>
        <small>${esc(m.subject)} · ${tastes[taste(m)]} · ${esc(m.title)}</small></button></li>`;
    }).join('');

    return `<section class="world-home">
  <section class="world-top">
    <div class="world-title">
      <p class="eyebrow">창용쌤 제작</p>
      <h1>${root.ThinkstarGrade||5}학년 ${ZONES[mem.region].label}</h1>
    </div>
    <div class="world-tools"><button type="button" class="secondary" data-action="party">동행 ${companions.length}/${root.ThinkstarParty.capacity(totalFriends,passed)}</button>
      <div class="hero-pick world-hero" role="group" aria-label="탐험가 고르기">
        <span>탐험가</span>
        <button type="button" data-action="hero" data-value="0" aria-pressed="${hero === 0}">카이</button>
        <button type="button" data-action="hero" data-value="1" aria-pressed="${hero === 1}">루미</button>
      </div>
      <button type="button" class="record-button world-count" data-action="collection" aria-label="전체 ${totalFriends.length}명 중 내 친구 ${own}명, 수집 목록 열기">✦ 내 친구 <b>${own}/${totalFriends.length}</b></button>
    </div>
  </section>

  <nav class="world-zones" aria-label="구역 바로가기">
    ${ZONES.map((z,i) => `<button type="button" class="wz-jump wz-jump-${z.key}" data-zone="${z.key}" aria-disabled="${!!(i&&ctx.regionOpen&&!ctx.regionOpen(i))}">${i&&ctx.regionOpen&&!ctx.regionOpen(i)?'🔒 ':''}${z.label}<small>${catalog.filter(m=>(m.region||0)===i&&passed(m.id)).length}/12 친구</small></button>`).join('')}
  </nav>

  <section class="world-frame">
    <div class="world-viewport" tabindex="0" role="application"
      aria-label="생각별 정원. 화살표나 WASD로 움직이고, 친구 옆에서 Enter를 누르면 만날 수 있어요. 연못·바위·건물은 돌아가야 해요.">
      <div class="world-stage map-${ZONES[mem.region].key}" style="width:${W}px;height:${H}px">
        <div class="world-ground ground-${ZONES[mem.region].key}" style="background-image:url('${mapImage(mem.region,true)}')" aria-hidden="true"></div>
        <div class="world-places" aria-hidden="true">${placesHtml(mem.region)}</div>
        ${creaturesHtml}
        <div class="world-player${rescued ? ' rescued' : ''}" aria-hidden="true">
          ${helper('', 'world-hero-art')}
          <span class="world-player-shadow"></span>
        </div>
        ${companions.map(c=>`<div class="world-companion" aria-hidden="true">${sprite(c,false,'world-companion-art')}</div>`).join('')}
      </div>
      <div class="world-weather" aria-hidden="true"></div><div class="spicy-warning" role="status" hidden><b>⚠ 매운맛 성역</b><span>여러 단서를 연결해야 해요. 준비됐나요?</span></div><div class="world-region" role="status" aria-live="polite"></div>
      <div class="world-minimap" aria-hidden="true">${minimapSvg(mem.region, items, passed)}</div>
      <div class="world-encounter" hidden>
        <button type="button" class="primary world-encounter-btn"></button>
      </div>
    </div>

    <div class="world-dpad" aria-label="이동 패드">
      <button type="button" data-dir="up" aria-label="위로">▲</button>
      <button type="button" data-dir="left" aria-label="왼쪽으로">◀</button>
      <button type="button" data-dir="right" aria-label="오른쪽으로">▶</button>
      <button type="button" data-dir="down" aria-label="아래로">▼</button>
    </div>
  </section>

  <p class="world-guide" role="status">친구를 톡 누르거나 빈 땅을 누르면 길을 찾아 걸어가요. 키보드는 화살표·WASD, 가까이에서 <kbd>Enter</kbd>. 매운맛 친구는 멀리 성역 안쪽에 있어요.</p>

  ${!root.ThinkstarTeacherPreview&&root.ThinkstarGate?(()=>{const g=root.ThinkstarGate(catalog,passed);return `<div class="gate-progress"><b>${g.open?'새로운 지대가 열렸어요!':`다음 지대까지 친구 ${g.done}/${g.need}명`}</b><progress value="${Math.min(g.done,g.need)}" max="${g.need}" aria-label="새 지대 개방 진행"></progress><span>${g.keptOpen?'이전에 열린 지대는 계속 탐험할 수 있어요':`${ZONES[0].label} 70% 이상 · ${g.need}/${g.total}명`}</span></div>`;})():''}
  <section class="world-field-guide field-${ZONES[mem.region].key}" aria-label="이 지대 탐험 안내">
    <img src="${mapImage(mem.region)}" alt="${esc(ZONES[mem.region].label)} 전체 풍경" width="160" height="100">
    <div><b>${esc(ZONES[mem.region].sub)}</b><p>${['다양한 길에서 첫 친구들을 찾아요. 신전 안쪽에는 깊이 생각할 도전이 있어요.','버섯 숲길과 반딧불 언덕을 탐험해요. 다리 너머 거대한 뿌리 안쪽에 매운맛 친구가 있어요.','얼음 호숫가를 돌아 수정 성역으로 가요. 관찰한 단서를 차근차근 이어 보세요.','시장을 지나 두 다리를 건너요. 등대 안쪽에서 여러 조건을 연결하는 도전을 만나요.','별의 도서관과 전망대를 둘러봐요. 은하의 다리 너머에서 마지막 단서를 찾아요.'][mem.region]}</p>
    <div class="world-taste-counts">${Object.entries(tastes).map(([t,label])=>{const group=items.filter(it=>it.t===t);return `<span class="taste-${t}">${label} <b>${group.filter(it=>passed(it.m.id)).length}/${group.length}</b></span>`;}).join('')}</div></div>
  </section>

  ${ctx.bossPanel?.(mem.region)||''}
  <details class="world-list">
    <summary>친구 목록에서 바로 고르기</summary>
    <ul>${listHtml}</ul>
  </details>
</section>`;
  }

  function pickCompanions(catalog,passed){
    const ids=root.ThinkstarParty?root.ThinkstarParty.get(catalog,passed):catalog.filter(m=>passed(m.id)).slice(0,3).map(m=>m.id);
    return ids.map(id=>catalog.find(m=>m.id===id)).filter(Boolean);
  }

  /* ---------------- 엔진 ---------------- */
  let live = null;

  function mount(container, ctx) {
    unmount();
    const vp = container.querySelector('.world-viewport');
    if (!vp) return;
    const { catalog = [], passed = () => false } = ctx;
    const onEncounter = id => { mem.encounter={id,region:mem.region,x:mem.x,y:mem.y};savePosition();ctx.onEncounter?.(id); };
    const stage = vp.querySelector('.world-stage');
    const playerEl = vp.querySelector('.world-player');
    const heroArt=playerEl.querySelector('.hero-art');let facing=0,walkTime=0;
    const compEls = [...vp.querySelectorAll('.world-companion')];
    const encWrap = vp.querySelector('.world-encounter');
    const encBtn = vp.querySelector('.world-encounter-btn');
    const regionEl=vp.querySelector('.world-region');let regionKey='';let inDanger=false,warningUntil=0;
    const warning=vp.querySelector('.spicy-warning');
    const mmPlayer = vp.querySelector('.mm-player'), mmView = vp.querySelector('.mm-view');
    const ac = new AbortController();
    const sig = ac.signal;
    const reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phoneView = root.matchMedia?.('(max-width: 599px), (pointer: coarse) and (max-height: 599px)');
    let cameraScale = CAMERA_SCALE;
    ensurePos(ctx);
    const ri = mem.region, reg = REGIONS[ri], gg = geo(ri);
    const W=reg.width,H=reg.height;
    const items = layout(catalog, ri);
    const byId = new Map(items.map(it => [it.m.id, it]));

    // 문제를 열기 직전 좌표를 유지한다. 보상 때문에 중앙이나 임의 슬롯으로 옮기지 않는다.
    // 저장된 위치가 막힌 곳이면(지형이 바뀐 경우 등) 가장 가까운 도달 가능한 칸으로
    if (blockedAt(reg, mem.x, mem.y, R) || !gg.reach[cellAt(mem.x, mem.y)]) { const c = nearestCell(cellAt(mem.x, mem.y), i => gg.reach[i]); const p = c < 0 ? gg.spawn : center(c); mem.x = p.x; mem.y = p.y; }

    const st = {
      x: mem.x, y: mem.y,
      keys: new Set(), path: null, targetId: null, stuck: 0,
      near: null, raf: 0, last: 0, camX: 0, camY: 0, face: 1
    };
    // 동행: 플레이어가 실제로 지나간 발자국(trail)을 따라온다 → 플레이어가 간 길이므로 지형을 뚫지 않는다
    const trail = [{ x: st.x, y: st.y }];
    for (let j = 1; j <= 10; j++) { const prev = trail[trail.length - 1], p = { x: st.x - j * 10, y: st.y + 8 }; trail.push(blockedAt(reg, p.x, p.y, R) ? prev : p); }
    trail.reverse();
    const followers=compEls.map((el,i)=>{const p=trailPoint(46*(i+1));return {el,x:p.x,y:p.y};});
    function trailPoint(back) {
      let acc = 0;
      for (let i = trail.length - 1; i > 0; i--) {
        const a = trail[i], b = trail[i - 1], d = dist(a, b);
        if (acc + d >= back) { const t = d ? (back - acc) / d : 0; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
        acc += d;
      }
      return trail[0];
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const free = (x, y) => !blockedAt(reg, x, y, R);

    function toWorld(ev) {
      const r = stage.getBoundingClientRect();
      return { x: clamp((ev.clientX - r.left) / cameraScale, R + 2, W - R - 2), y: clamp((ev.clientY - r.top) / cameraScale, R + 2, H - R - 2) };
    }
    function camera(instant) {
      cameraScale = CAMERA_SCALE / (phoneView?.matches ? 1.3 : 1);
      const vw = vp.clientWidth / cameraScale, vh = vp.clientHeight / cameraScale;
      const tx = clamp(st.x - vw / 2, 0, Math.max(0, W - vw));
      const ty = clamp(st.y - vh / 2, 0, Math.max(0, H - vh));
      if (instant || reduced) { st.camX = tx; st.camY = ty; }
      else { st.camX += (tx - st.camX) * 0.18; st.camY += (ty - st.camY) * 0.18; }
      stage.style.transformOrigin = "0 0";
      stage.style.transform = `translate3d(${-st.camX*cameraScale}px,${-st.camY*cameraScale}px,0) scale(${cameraScale})`;
      if (mmView) { mmView.setAttribute('x', Math.round(st.camX)); mmView.setAttribute('y', Math.round(st.camY)); mmView.setAttribute('width', vw); mmView.setAttribute('height', vh); }
    }
    function draw() {
      const danger=!!reg.shrine&&Math.hypot(st.x-reg.shrine.x,st.y-reg.shrine.y)<reg.shrine.r+60;
      if(danger!==inDanger){inDanger=danger;vp.classList.toggle("danger-zone",danger);if(danger&&!dangerSeen.has(ri)){dangerSeen.add(ri);warningUntil=performance.now()+5000;}}
      if(warning)warning.hidden=!danger||performance.now()>=warningUntil;
      const zone=ZONES[mem.region];
      if(regionKey!==zone.key){regionKey=zone.key;vp.dataset.region=regionKey;regionEl.textContent=zone.label+' · '+zone.sub.split(' · ')[0];
        container.querySelectorAll('.wz-jump').forEach(b=>{const selected=b.dataset.zone===regionKey;b.setAttribute('aria-current',selected?'location':'false');const nav=b.parentElement;if(selected&&nav&&nav.scrollWidth>nav.clientWidth)nav.scrollLeft=b.offsetLeft-nav.offsetLeft-(nav.clientWidth-b.clientWidth)/2;});
      }
      playerEl.style.transform = `translate(${Math.round(st.x)}px,${Math.round(st.y)}px)`;
      followers.forEach(f=>f.el.style.transform=`translate(${Math.round(f.x)}px,${Math.round(f.y)}px)`);
      if (mmPlayer) { mmPlayer.setAttribute('cx', Math.round(st.x)); mmPlayer.setAttribute('cy', Math.round(st.y)); }
    }
    function updateNear() {
      let best = null, bd = NEAR;
      items.forEach(it => { const d = dist(st, it); if (d < bd&&clearSeg(reg,st.x,st.y,it.x,it.y)) { bd = d; best = it; } });
      const chosen=byId.get(st.targetId);if(chosen&&dist(st,chosen)<NEAR&&clearSeg(reg,st.x,st.y,chosen.x,chosen.y))best=chosen;
      if (best === st.near) return;
      vp.querySelectorAll('.wc.near').forEach(el => el.classList.remove('near'));
      st.near = best;
      if (best) {
        vp.querySelector(`.wc[data-creature="${CSS.escape(best.m.id)}"]`)?.classList.add('near');
        const got = passed(best.m.id);
        encBtn.textContent = got ? `${best.m.friendName} · 다시 도전` : '이 친구 만나기';
        encBtn.setAttribute('aria-label', `${got ? best.m.friendName : '아직 만나지 않은 친구'} · ${best.m.title} 도전 열기`);
        encWrap.dataset.taste=best.t;
        encBtn.dataset.taste=best.t;
        encWrap.hidden = false;
        if(!got&&!reduced){vp.classList.remove("encounter-jolt");void vp.offsetWidth;vp.classList.add("encounter-jolt");}
      } else encWrap.hidden = true;
    }
    function blocked() {
      const app = document.getElementById('app');
      return document.hidden || (app && app.inert) || document.querySelector('dialog[open], .modal[open], [aria-modal="true"]');
    }
    function stopAll() { st.keys.clear(); st.path = null; st.targetId = null; vp.classList.remove('moving'); }

    // 축 분리 미끄러짐: x 먼저, 막히면 y만. 격자 밖 실제 위치에서 정확한 도형으로 판정
    function tryMove(mx, my) {
      const bx = st.x, by = st.y;
      if (mx && free(st.x + mx, st.y)) st.x += mx;
      if (my && free(st.x, st.y + my)) st.y += my;
      return st.x !== bx || st.y !== by;
    }
    // 경로 당기기: 실제 위치에서 더 먼 노드까지 선분이 비어 있으면 중간 노드 건너뜀
    function pullPath() {
      if (!st.path) return;
      let n = 0;
      while (st.path.length > 1 && n < 6 && clearSeg(reg, st.x, st.y, st.path[1].x, st.path[1].y)) { st.path.shift(); n++; }
    }
    function setPath(p, id) {
      st.keys.clear(); st.targetId = id || null;
      if (!p || !p.length) { st.path = null; return; }
      st.path = p; st.stuck = 0; pullPath();
    }

    function step(ts) {
      st.raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (ts - (st.last || ts)) / 1000); st.last = ts;
      if (blocked()) { stopAll(); camera(); return; }
      let dx = 0, dy = 0;
      if (st.keys.has('up')) dy -= 1; if (st.keys.has('down')) dy += 1;
      if (st.keys.has('left')) dx -= 1; if (st.keys.has('right')) dx += 1;
      let want = SPEED * dt;
      if (dx || dy) { st.path = null; st.targetId = null; const n = Math.hypot(dx, dy); dx /= n; dy /= n; }
      else if (st.path && st.path.length) {
        const wp = st.path[0], d = dist(st, wp);
        if (d < 4) { st.path.shift(); pullPath(); if (!st.path.length) st.path = null; }
        else { dx = (wp.x - st.x) / d; dy = (wp.y - st.y) / d; if (d < want) want = d; }
      }
      let moving = !!(dx || dy);
      if(moving){facing=(Math.round(Math.atan2(-dx,dy)/(Math.PI/4))+8)%8;walkTime+=dt;}else walkTime=0;
      if(heroArt){const row=ctx.hero?facing:[0,1,2,3,4,3,2,1][facing];heroArt.style.scale=!ctx.hero&&[3,6,7].includes(facing)?'-1 1':'1 1';heroArt.style.backgroundImage=`url('assets/hero-casual-${ctx.hero||0}.png')`;heroArt.style.backgroundPosition=`${(moving&&!reduced?Math.floor(walkTime*8)%4:0)/3*100}% ${row/7*100}%`;heroArt.classList.add('directional-hero');}
      if (moving) {
        const beforeX = st.x, beforeY = st.y;
        moving = tryMove(dx * want, dy * want);
        if (st.path) { if (!moving || Math.hypot(st.x - beforeX, st.y - beforeY) < want * .25) { st.stuck += dt; if (st.stuck > .5) { st.path = null; st.targetId = null; } } else st.stuck = 0; }
        if (dx && moving) st.face = dx < 0 ? -1 : 1;
        if (moving) {
          mem.x = st.x; mem.y = st.y;
          const last = trail[trail.length - 1];
          if (dist(last, st) >= 10) { trail.push({ x: st.x, y: st.y }); if (trail.length > 120) trail.shift(); }
        }
      }
      vp.classList.toggle('moving', moving);
      followers.forEach((f,i)=>{
        const gp = trailPoint(46 * (i + 1) + 8);
        const k=reduced?1:Math.min(1,dt*6);f.x+=(gp.x-f.x)*k;f.y+=(gp.y-f.y)*k;
      });
      draw(); camera(); updateNear();
    }

    /* --- 입력: 키보드 --- */
    const KEY = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
    function keyAllowed(ev) {
      if (!container.isConnected || blocked()) return false;
      const t = ev.target;
      if (t && t.closest && t.closest('input, textarea, select, button, [contenteditable="true"], dialog, .modal')) return false;
      return vp.contains(t);
    }
    root.addEventListener('keydown', ev => {
      if (!keyAllowed(ev)) return;
      const dir = KEY[ev.key] || ({KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right'})[ev.code];
      if (dir) { ev.preventDefault(); st.keys.add(dir); return; }
      if (ev.key === 'Enter' && st.near && !encWrap.hidden) { ev.preventDefault(); onEncounter && onEncounter(st.near.m.id); }
    }, { signal: sig });
    root.addEventListener('keyup', ev => { const dir = KEY[ev.key] || ({KeyW:'up',KeyA:'left',KeyS:'down',KeyD:'right'})[ev.code]; if (dir) st.keys.delete(dir); }, { signal: sig });

    /* --- 입력: 탭/클릭 → 격자 A*로 장애물을 돌아가는 경로 (순간이동 없음) --- */
    vp.addEventListener('pointerdown', ev => {
      if (ev.button && ev.button !== 0) return;
      const btn = ev.target.closest('button');
      if (btn && !btn.classList.contains('wc')) return; // 만남 버튼 등은 그대로
      if (btn) { ev.preventDefault(); const it = byId.get(btn.dataset.creature); if (it) walkTo(it); return; }
      if (!stage.contains(ev.target) || ev.target.closest('.world-minimap')) return;
      const p = toWorld(ev);
      setPath(findPath(ri, st.x, st.y, p.x, p.y, 0), null);
    }, { signal: sig });
    vp.addEventListener('click', ev => {
      const btn = ev.target.closest('button.wc');
      if (btn) { ev.preventDefault(); const it = byId.get(btn.dataset.creature); if (it) walkTo(it); }
    }, { signal: sig });
    encBtn.addEventListener('click', ev => { ev.preventDefault(); if (st.near && onEncounter) onEncounter(st.near.m.id); }, { signal: sig });

    function walkTo(it) {
      setPath(findPath(ri, st.x, st.y, it.x, it.y, 72), it.m.id);
      vp.focus({ preventScroll: true });
    }

    /* --- 구역 점프 · 목록 --- */
    container.querySelectorAll('.wz-jump').forEach(b => b.addEventListener('click', () => {
      const i=ZONES.findIndex(z=>z.key===b.dataset.zone);if(i<0||i===mem.region)return;if(ctx.regionOpen&&!ctx.regionOpen(i)){ctx.regionNotice?.();return;}unmount();spawnTo(i);mem.rescued=null;ctx.onRegion?.();
    }, { signal: sig }));
    container.querySelectorAll('.wl-item').forEach(b => b.addEventListener('click', () => {
      const it = byId.get(b.dataset.creature); if (!it) return;
      const p = standSpot(ri, it);   // 접근성 목록은 직접 선택: 친구 옆 도달 가능한 칸으로 이동
      st.x = p.x; st.y = p.y; mem.x = st.x; mem.y = st.y; st.path = null; st.targetId = null;
      trail.length = 0; trail.push({ x: st.x, y: st.y }); followers.forEach(f => { f.x = st.x; f.y = st.y; });
      camera(true); draw(); updateNear(); vp.focus({ preventScroll: true });
      if (onEncounter) onEncounter(it.m.id);
    }, { signal: sig }));

    /* --- D-pad: 누르고 있는 동안 이동 --- */
    container.querySelectorAll('.world-dpad [data-dir]').forEach(b => {
      const dir = b.dataset.dir;
      const release = () => { st.keys.delete(dir); b.classList.remove('held'); };
      b.addEventListener('blur', release, { signal: sig });
      b.addEventListener('pointerdown', ev => { ev.preventDefault(); try { b.setPointerCapture(ev.pointerId); } catch {} st.path = null; st.targetId = null; st.keys.add(dir); b.classList.add('held'); }, { signal: sig });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => b.addEventListener(n, release, { signal: sig }));
      b.addEventListener('contextmenu', ev => ev.preventDefault(), { signal: sig });
      b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); st.path = null; st.targetId = null; st.keys.add(dir); } }, { signal: sig });
      b.addEventListener('keyup', ev => { if (ev.key === 'Enter' || ev.key === ' ') release(); }, { signal: sig });
    });

    /* --- 포커스/가시성 변화 시 정지 --- */
    root.addEventListener('blur', stopAll, { signal: sig });
    root.addEventListener('pagehide', savePosition, { signal: sig });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); }, { signal: sig });
    root.addEventListener('resize', () => camera(true), { signal: sig });

    draw(); camera(true); updateNear();
    st.raf = requestAnimationFrame(step);
    live = { ac, st, container };
    // 구조 링 표시는 1회
    if (mem.rescued) setTimeout(() => { mem.rescued = null; }, 0);
  }

  function unmount() {
    if (!live) return;
    live.ac.abort();
    cancelAnimationFrame(live.st.raf);
    mem.x = live.st.x; mem.y = live.st.y;savePosition();
    live = null;
  }

  function rescue(id) {
    if (!id) return;
    unmount();
    if(mem.encounter?.id===id){mem.region=mem.encounter.region;mem.x=mem.encounter.x;mem.y=mem.encounter.y;}
    mem.rescued = id;savePosition();
  }

  /* ---------------- 검증용 기하 API ---------------- */
  function verify(catalog) {
    return REGIONS.map((reg, ri) => {
      const g = geo(ri), items = catalog ? layout(catalog, ri) : [];
      const unreachable = items.filter(it => findPath(ri, g.spawn.x, g.spawn.y, it.x, it.y, 72) === null).map(it => it.m.id);
      const slotsOffReach = ['mild', 'medium', 'spicy'].flatMap(t => g.slots[t].filter(p => !g.reach[cellAt(p.x, p.y)]).map(p => `${t}:${p.x},${p.y}`));
      const counts = { mild: 0, medium: 0, spicy: 0 }; items.forEach(it => counts[it.t]++);
      const tooClose = []; items.forEach((a, i) => items.slice(i + 1).forEach(b => { if (dist(a, b) < MIN_GAP - 1) tooClose.push(a.m.id + '~' + b.m.id); }));
      return { region: reg.key, spawn: g.spawn, reachableCells: g.reachCount, items: items.length, counts, unreachable, slotsOffReach, tooClose, ok: !unreachable.length && !slotsOffReach.length };
    });
  }
  const geometry = {
    W: REGIONS[0].width, H: REGIONS[0].height, dimensions: { width: REGIONS[0].width, height: REGIONS[0].height, cell: G, radius: R },
    regions: REGIONS.map(r => r.key),
    size: region => ({width:REGIONS[regionIndex(region)].width,height:REGIONS[regionIndex(region)].height}),
    layout: (catalog, region) => layout(catalog || [], region),
    blocked: (x, y, region) => blockedAt(REGIONS[regionIndex(region)], x, y, R),
    path: (start, end, region, goalRadius = 0) => findPath(regionIndex(region), start.x, start.y, end.x, end.y, goalRadius),
    spawn: region => geo(regionIndex(region)).spawn,
    places: region => REGIONS[regionIndex(region)].places.map(p => ({ ...p })),
    obstacles: region => REGIONS[regionIndex(region)].obstacles.map(s => ({ ...s })),
    slots: region => geo(regionIndex(region)).slots,
    verify
  };

  root.ThinkstarWorld = { html, mount, unmount, rescue, zones:ZONES, geometry, currentRegion:()=>mem.region };
})(globalThis);
