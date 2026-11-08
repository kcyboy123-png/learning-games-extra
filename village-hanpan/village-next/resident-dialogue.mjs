import {TYPES,season,MONTH} from './data.mjs?v=perf1';

const GARDENS=new Set(['flower','avenue','lavender','hydrangea','flowerArch','rosePark','moonGarden','starTree']);
export const personality=n=>['gardener','foodie','explorer','reader','neighbor'][(String(n.p.id||'a').charCodeAt(0)-97+260)%5];
export function prefersPlace(n,type){const d=TYPES[type];switch(personality(n)){case 'gardener':return GARDENS.has(type)||type==='tree';case 'foodie':return !!d.food;case 'explorer':return ['harbor','rabbitTower','skyTower','animalFarm','largePark'].includes(type);case 'reader':return ['library','bench','tree'].includes(type);default:return !!d.leisure;}}
export const outdoorPlace=type=>GARDENS.has(type)||['fountain','goldFountain','animalFarm','harbor','rabbitTower','skyTower','largePark','amusement'].includes(type);
export const gardenPlace=type=>GARDENS.has(type);
const PERSONAL={
 gardener:['꽃 옆에 잠깐 서 있으니 마음이 편안해요.','오늘은 어떤 색 꽃을 심어 볼까요?','작은 정원도 매일 보면 새로워요.','꽃길을 따라 천천히 산책하고 싶어요.'],
 foodie:['오늘은 어떤 가게에 들러 볼까요?','맛있는 한 끼 뒤에는 산책이 좋아요.','친구와 함께 먹으면 더 즐거워요.','다음에는 새로운 메뉴를 골라 봐야지.'],
 explorer:['처음 가 보는 길은 늘 설레요.','저 멀리에는 어떤 풍경이 있을까요?','우리 마을에서 좋아하는 장소를 찾아봐요.','오늘은 평소와 다른 길로 돌아가 볼래요.'],
 reader:['좋아하는 책 한 권이면 오후가 즐거워요.','잠깐 쉬면서 마을을 바라볼래요.','오늘 본 풍경을 그림으로 남기고 싶어요.','조용한 길에서 천천히 걷는 게 좋아요.'],
 neighbor:['안녕! 오늘도 만나서 반가워요.','이웃과 인사하면 하루가 즐거워요.','우리 마을에서 제일 좋아하는 곳은 어디예요?','함께 가꾸니 마을에 이야기가 쌓여요.']
};
const SEASONAL=[['겨울 산책 뒤에는 따뜻한 집이 좋아요.','겨울에도 우리 마을은 포근해요.'],['봄에는 꽃 색깔을 하나씩 찾아봐요.','따뜻한 봄, 산책하기 좋은 계절이에요.'],['여름에는 나무 그늘에서 쉬고 싶어요.','초록이 짙어지니 마을이 시원해 보여요.'],['가을 길에는 어떤 색이 숨어 있을까요?','가을빛 마을을 천천히 둘러보고 싶어요.']];
const PLACES={harbor:['배를 타면 어떤 풍경을 만날까요?','부두에서 물결을 바라보니 마음이 편해요.'],library:['오늘은 어떤 책을 골라 볼까요?','도서관에 다시 들르고 싶어요.'],bench:['이 벤치에서 잠깐 쉬어 갈래요.','쉬어 가는 시간도 소중해요.'],tree:['나무 곁은 내가 좋아하는 쉼터예요.','나무를 바라보며 숨을 천천히 쉬어요.'],chicken:['치킨집에 친구와 함께 와 보고 싶어요.','치킨집 앞을 지나니 배가 고파요.'],animalFarm:['동물 친구들은 지금 무엇을 할까요?','동물농장에 오면 구경할 게 많아요.']};
// Only runtime residents remember lines; saved towns and income never change.
export function residentDialogue(s,n,type){
 if(s.island==='mist'){const lines=['배 타고 놀러 왔어! 함께 걸을까?','네가 꾸민 정원에서 바다를 보니 좋아.','저쪽 꽃과 이쪽 쉼터가 잘 어울려!','바닷바람을 느끼며 천천히 걷자.','강치에게도 인사하고 갈 거야.','다음엔 마을 친구들과 또 놀러 올게!'];n.dialogueTurn=(n.dialogueTurn||0)+1;return lines[(n.dialogueTurn+n.p.id.charCodeAt(0))%lines.length];}
 const current=type||s.buildings.find(b=>b.id===n.target&&b.progress>=1&&!b.closed)?.type;
 const month=Math.floor(s.t/MONTH)+(s.startMonth??0),pool=[...PERSONAL[personality(n)],...SEASONAL[season(month%12)]];
 if(current){if(PLACES[current])pool.push(...PLACES[current]);else if(GARDENS.has(current))pool.push('이 꽃들은 어떤 색끼리 어울릴까요?','꽃을 가까이서 보니 작은 정원도 특별해요.');else if(TYPES[current]?.food)pool.push('가게 구경이 끝나면 동네를 한 바퀴 돌아야지.','다음에는 친구와 이 가게에 올래요.');else pool.push(`${TYPES[current].name}에 들렀다 가려고요.`);}
 const recent=n.recentLines||[],choices=pool.filter(line=>!recent.includes(line));
 n.dialogueTurn=(n.dialogueTurn||0)+1;const line=(choices.length?choices:pool)[(n.dialogueTurn-1)%(choices.length||pool.length)];
 n.recentLines=[...recent.slice(-4),line];return line;
}
