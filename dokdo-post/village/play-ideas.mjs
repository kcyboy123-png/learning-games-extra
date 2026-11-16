// Optional invitations, never quests or saved progress.
export function playIdeas(s){
 if(s.island==='mist'){
  const ideas=[];
  if(!s.buildings.some(b=>b.type==='dokdoFlag'))ideas.push({title:'독도에 나만의 쉼터를 놓아 볼까요?',why:'태극기 전망쉼터는 무료예요. 표시되는 빈 부지에서 마음에 드는 곳을 골라요.',label:'무료 태극기 쉼터 놓기',action:'flag'});
  ideas.push({title:'강치에게 어떤 이야기를 들을까요?',why:'동도·서도와 바다 생물 이야기를 듣고, 궁금한 풍경을 직접 찾아봐요.',label:'강치와 이야기',action:'gangchi'},
   {title:'절벽과 바다를 천천히 둘러볼까요?',why:'토끼와 둘레길을 걸으며 두 섬의 높낮이와 바다를 살펴봐요. 풍경 보기에서 다시 토끼에게 돌아올 수 있어요.',label:'바다 풍경 보기',action:'scenic'},
   {title:'독도에 작은 정원을 꾸며 볼까요?',why:'실제 시설은 정해진 자리에, 상상 건물과 정원은 표시되는 빈 부지에 놓아요. 자유롭게 골라도 괜찮아요.',label:'독도 꾸미기 둘러보기',action:'dokdo'});
  return ideas;
 }
 return [{title:'토끼와 우리 마을을 걸어 볼까요?',why:'가게와 정원 사이를 걸으며 이웃에게 가까이 가 봐요. 새 건물을 짓지 않아도 즐길 수 있어요.',label:'토끼와 산책하기',action:'walk'},
  {title:'나만의 정원을 만들어 볼까요?',why:'꽃·나무·벤치를 집 가까이에 골고루 놓아 색과 모양을 바꿔 봐요.',label:'꾸미기 둘러보기',action:'garden'},
  {title:'다른 가게도 구경해 볼까요?',why:'서로 다른 가게의 모양과 예상 수입을 비교해요. 같은 시설은 추가 수입이 줄어요. 구경만 해도 괜찮아요.',label:'가게 둘러보기',action:'shop'},
  {title:'우리 마을의 환경은 어떨까요?',why:'부족한 항목을 살펴봐요. 공장은 수입과 환경 부담을 함께 생각하며 가동 여부를 고를 수 있어요.',label:'친환경 안내 보기',action:'eco'}];
}
