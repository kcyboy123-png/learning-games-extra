(function(root){
'use strict';
const old=root.DrawerGrade5Catalog;
const names=['이슬이','초키','등롱이','새봄','종이돛','책비','로즈','뭉게','루나','꽃담','오로라','별지기'];
const descriptions=['아침 이슬을 모아 반짝이는 작은 친구','생각을 한 줄씩 그려 주는 분필 친구','다정한 불빛으로 길을 밝혀 주는 친구','작은 발견을 싹틔우는 수정 친구','새로운 길을 좋아하는 종이배 친구','좋은 문장을 기억하는 책갈피 친구','방향을 차근차근 찾아 주는 나침반 친구','번개도 품을 수 있는 따뜻한 구름 친구','다른 관점으로 세상을 비추는 달거울 친구','조각마다 새로운 꽃잎을 피우는 친구','작은 가능성을 빛으로 연결하는 정령','근거를 모아 생각을 지켜 주는 수호자'];
const defs=[['g5-fraction-snack','수와 생활','mild',0],['g5-budget-bundle','수와 생활','medium',6],['g5-grid-paint','도형·공간','mild',1],['g5-garden-int','도형·공간','spicy',10],['g5-library-guide','국어·읽기','medium',5],['g5-witness-read','국어·읽기','medium',8],['g5-plant-fair','과학','mild',3],['g5-cipher-table','논리·창작','medium',2],['g5-truth-clue','논리·창작','spicy',11]];
const catalog=defs.map(([id,subject,difficulty,friend])=>{const m=old.find(x=>x.id===id);return {...m,id:'cs-'+id.slice(3),subject,difficulty,friend,extensionId:null,isExtension:false,steps:m.steps.map((q,i)=>({...q,id:'cs-'+id.slice(3)+'-'+i,hints:[q.hints[0],'조건을 한 개씩 다시 확인하고, 작은 예로 시험해 보세요.'],prompt:q.prompt.replaceAll('그다음 주','다음 주'),document:q.document?{...q.document,lines:q.document.lines.map(x=>x.replace('확인된 이동 기록:','3교시는 10:40~11:20입니다. 확인된 이동 기록:'))}:undefined}))};});
function step(type,title,prompt,data,solution,hint){return {type,title,prompt,...data,solution,hints:[hint,'기록에 직접 나와 있는 것과 짐작한 것을 구별해 보세요.']};}
function choice(t,p,opts,a,sol,h){return step('choice',t,p,{options:opts,answer:a},sol,h);}
function numbers(t,p,fields,answers,sol,h){return step('numbers',t,p,{fields,answers},sol,h);}
function add(id,title,subject,difficulty,friend,steps,summary){catalog.push({id:'cs-'+id,title,desc:summary,summary,skill:summary,subject,category:subject,family:'science',color:'blue',difficulty,friend,edition:'grade5',grades:[5],steps:steps.map((q,i)=>({...q,id:'cs-'+id+'-'+i}))});}
const weather={caption:'가상 관측 기록 · 같은 장소, 오후 2시',heads:['요일','기온','비'],rows:[['월','20℃','0mm'],['화','22℃','0mm'],['수','18℃','8mm']]};
add('weather','구름 속 관측 노트','과학','mild',7,[
 {...choice('비가 온 날을 찾아요','관측표에서 확인해요.',['월요일','화요일','수요일'],2,'수요일의 강수량은 8mm예요.','비가 0mm보다 많이 내린 날을 찾아요.'),table:weather},
 {...numbers('기온이 얼마나 달라졌나요?','화요일에서 수요일로 기온이 내려갔어요.',['내려간 기온(℃)'],[4],'22−18=4℃ 내려갔어요.','높은 기온에서 낮은 기온을 빼요.'),table:weather},
 {...choice('기록만으로 말할 수 있는 것은?','관찰한 사실을 골라요.',['비가 오면 언제나 기온이 내려간다.','이 기록에서 수요일은 화요일보다 4℃ 낮다.','목요일에도 반드시 비가 온다.'],1,'이 표는 세 날의 기록이에요. 모든 날이나 목요일 날씨까지는 알 수 없어요.','관측하지 않은 날까지 단정하지 않아요.'),table:weather}
],'기록을 읽고 관찰한 사실과 예측을 구별해요.');
add('map','종이돛의 마을 지도','사회·생활','mild',4,[
 choice('도서관까지 몇 칸일까요?','학교에서 오른쪽과 위쪽으로만 이동해요.',['2칸','4칸','6칸'],1,'오른쪽 2칸, 위쪽 2칸으로 모두 4칸이에요.','가로와 세로로 각각 몇 칸 이동하는지 세어요.'),
 numbers('걸어간 거리를 구해요','지도에서 한 칸은 100m예요.',['학교에서 도서관까지 거리(m)'],[400],'4칸×100m=400m예요.','가로 2칸과 세로 2칸의 거리를 더해요.'),
 choice('먼저 위로 가도 될까요?','위로 2칸 간 뒤 오른쪽으로 2칸 가면?',['도서관에 도착하며 거리도 400m이다.','도서관에 도착하지만 200m 더 멀다.','도서관에 도착하지 못한다.'],0,'이동 순서가 달라도 가로 2칸, 세로 2칸은 같아요.','지도의 출발과 도착 위치를 손가락으로 따라가요.')
],'지도와 거리 표시를 보고 여러 경로를 비교해요.');
const room={caption:'작은 도서관의 공간 안내',heads:['공간','규칙'],rows:[['ㄱ 조용한 방','소리 내지 않고 혼자 읽기'],['ㄴ 이야기 방','작은 소리로 함께 이야기하기'],['ㄷ 만들기 방','도구를 사용해 만들기']]};
add('library-space','모두의 작은 도서관','사회·생활','mild',9,[
 {...choice('책을 읽고 의견을 나눠요','세 친구가 함께 책 이야기를 하려 해요.',['ㄱ 조용한 방','ㄴ 이야기 방','ㄷ 만들기 방'],1,'함께 이야기할 수 있는 ㄴ이 목적에 맞아요.','방 이름뿐 아니라 규칙도 읽어요.'),table:room},
 {...choice('어느 행동을 바꿔야 할까요?','각 공간의 규칙과 비교해요.',['ㄱ에서 혼자 묵독한다.','ㄴ에서 작은 소리로 의견을 나눈다.','ㄱ에서 큰 소리로 역할극을 한다.'],2,'조용한 방은 소리 내지 않고 읽는 공간이에요.','다른 이용자를 위해 어떤 규칙이 필요한지 생각해요.'),table:room},
 {...choice('정해진 규칙으로 판단해요','민지는 도구로 책갈피를 만들고 싶어요. 어느 공간이 맞을까요?',['ㄱ 조용한 방','ㄴ 이야기 방','ㄷ 만들기 방'],2,'도구를 사용하는 만들기 활동은 ㄷ 공간의 규칙에 맞아요.','하려는 활동과 규칙을 연결해요.'),table:room}
],'공동 공간의 목적과 규칙을 근거로 판단해요.');
catalog.sort((a,b)=>a.friend-b.friend);
catalog.forEach(m=>{m.steps.forEach((q,i)=>q.phase||= ['살펴보기','해결하기','확인하기'][i]);m.friendName=names[m.friend];m.friendDesc=descriptions[m.friend];});
catalog.find(m=>m.id==='cs-budget-bundle').difficulty='spicy';
catalog.find(m=>m.id==='cs-budget-bundle').steps[2]={"type": "numbers", "title": "빠짐없이 꾸러미를 찾아요", "prompt": "연필 300원, 지우개 500원, 공책 700원으로 정확히 2000원을 쓰는 꾸러미는 모두 몇 가지일까요? 같은 종류를 여러 개 사도 되고 안 사는 종류가 있어도 돼요. 물건의 개수가 같고 담는 순서만 다르면 같은 꾸러미예요.", "fields": ["서로 다른 꾸러미 수"], "answers": [4], "solution": "연필·지우개·공책 순으로 (0,4,0), (1,2,1), (2,0,2), (5,1,0)의 네 가지예요. 공책이 0권, 1권, 2권일 때를 나누어 빠짐없이 살펴요.", "id": "cs-budget-bundle-2", "phase": "확인하기", "revision": "world-quality-1", "hints": ["공책 개수가 0권, 1권, 2권인 경우로 나누어요.", "가격의 합이 정확히 2000원인지 확인해요."]};
catalog.find(m=>m.id==='cs-truth-clue').steps[1].document={title:'세 친구의 증언',lines:['하늘: 짝수야.','바다: 4보다 작아.','나무: 3의 배수야.','참인 말은 정확히 하나여야 해요.']};
catalog.find(m=>m.id==='cs-truth-clue').steps[1].prompt='비밀 번호가 5라고 하면, 참인 말이 정확히 하나일까요?';
catalog.find(m=>m.id==='cs-truth-clue').steps.forEach(q=>{if(q.type==='truth')q.prompt=`비밀 번호는 2, 3, 4, 5, 6 중 하나예요. 번호를 하나씩 넣어 세 친구의 말이 맞는지 확인해요. 맞는 말이 정확히 ${q.exact}개인 번호를 모두 찾아요.`;});
root.DrawerMissions=catalog;root.DrawerGrade5Catalog=catalog;root.DrawerLegacyAudit=[];
})(globalThis);
