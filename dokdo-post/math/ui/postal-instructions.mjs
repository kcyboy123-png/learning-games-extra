// Action wording supplements, never replaces, each lesson's exact conditions.
export function actionFor(step,kind=step.mode){
 if(kind==='ready')return '표시를 마쳤어요 · ‘포장 확인’을 눌러요';
 if(step.mode==='all'&&String(kind).endsWith('-next'))return `종류 버튼 ‘${{faces:'면',edges:'모서리',vertices:'꼭짓점'}[kind.replace('-next','')]}’를 눌러 다음 종류를 찾아요`;
 if(step.kind==='net-build'&&kind==='place')return '빈 모눈 칸을 눌러 들고 있는 조각을 놓아요';
 if(step.kind==='net-build'&&kind==='check')return step.blankLength?'빈칸 길이도 적고 ‘접어서 확인’을 눌러요':'여섯 면을 놓았어요 · 접어서 확인해요';
 if(step.kind==='sketch'&&kind==='second')return '이을 꼭짓점을 하나 더 눌러요';
 if(step.kind==='peel')return kind==='shape'?'펼친 면의 모양을 모두 골라요':'상자의 평평한 면을 하나 눌러요';
 if(step.kind==='solid'){
  if(step.mode==='all')return {faces:'면 6개를 찾아 눌러요',edges:'모서리 12개를 찾아 눌러요',vertices:'꼭짓점 8개를 찾아 눌러요'}[kind==='all'?'faces':kind];
  if(kind==='vertices')return `꼭짓점 ${step.count}곳에 보호캡을 붙여요`;
  if(kind==='edges')return `모서리 ${step.count}개에 보호대를 붙여요`;
  if(kind==='pair-second')return '첫 면을 골랐어요 · 짝이 될 면을 눌러요';
  if(kind==='pairs')return '조건에 맞는 면 두 개를 짝지어요';
  return Number.isInteger(step.count)?`${step.counterLabel||'면'} ${step.count}개를 찾아 눌러요`:'조건에 맞는 면을 찾아 눌러요';
 }
 if(step.kind==='net-build')return (step.part?step.part+' · ':'')+(step.replaceable?'맞지 않는 조각을 바꿔요':step.movable?'조각을 옮겨 전개도를 고쳐요':step.fixedBase?'빠진 면에 종이 조각을 붙여요':'종이 조각을 골라 전개도를 만들어요')+(step.blankLength?' · 빈칸도 채워요':'');
 return {peel:'면 하나를 누르고, 모양을 골라요',sort:step.mode==='mark'?'정육면체를 모두 표시해요':'직육면체를 모두 배송대에 올려요',fill:'빈칸에 답을 적거나 골라요',choice:step.answer?.length>1?'조건에 맞는 답을 모두 골라요':'조건에 맞는 답 하나를 골라요',sketch:step.tool==='draw'?'꼭짓점 두 개를 눌러 빠진 선을 그려요':'선을 눌러 실선·점선을 바꿔요','cut-plan':'잘라도 한 장으로 이어지는 그림을 골라요','net-predict':'종이를 접은 상자를 떠올리고 골라요','net-points':step.ask==='segment'?'접으면 만나는 모서리를 찾아요':'접으면 만나는 점을 모두 찾아요','tray-count':'상자에 필요한 종이 장수를 맞춰요',link:'상자와 알맞은 그림을 연결해요'}[step.kind];
}
