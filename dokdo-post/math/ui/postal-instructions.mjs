import {FACE_LABEL} from '../lib/geometry.mjs';
// Action wording supplements, never replaces, each lesson's exact conditions.
export function actionFor(step,kind=step.mode){
 if(kind==='ready')return '표시를 마쳤어요 · ‘포장 확인’을 눌러요';
 if(step.mode==='all'&&String(kind).endsWith('-next'))return `종류 버튼 ‘${{faces:'면',edges:'모서리',vertices:'꼭짓점'}[kind.replace('-next','')]}’를 눌러 다음 종류를 찾아요`;
 if(step.kind==='net-build'&&kind==='place')return '빈 칸에 놓아요 · 취소하려면 ‘보관함에 넣기’';
 if(step.kind==='net-build'&&kind==='check')return step.blankLength?'빈칸 길이도 적고 ‘접어서 확인’을 눌러요':'여섯 면을 놓았어요 · 접어서 확인해요';
 if(step.kind==='sketch'&&kind==='second')return '이을 꼭짓점을 하나 더 눌러요';
 if(step.kind==='peel')return kind==='selected'?'내 답 확인을 눌러요':'네 변의 길이가 모두 같나요?';
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

// Keep the actual question visible while the hands-on instruction changes.
export function questionFor(step,kind=step.mode){
 if(step.kind==='solid'&&step.secondFace)return '두 기준 면 모두에 수직인 면을 골라요';
 if(step.kind==='solid'&&step.basePair)return `밑면을 뺀 옆면 ${step.count}개를 찾아요`;
 if(step.kind==='sort')return step.mode==='mark'?'정육면체 상자를 모두 골라요':'직육면체 상자를 모두 골라요';
 if(step.kind==='solid'&&step.mode==='all')return actionFor(step,kind==='all'?'faces':kind);
 if(step.kind==='solid'&&!step.baseFace&&!step.basePair&&!step.markVertex){
  if(step.mode==='faces')return '상자의 모든 면에 도장을 찍어요';
  if(step.mode==='edges')return '모서리 12개에 보호대를 붙여요';
  if(step.mode==='vertices')return '꼭짓점 8곳에 보호캡을 붙여요';
 }
 if(step.kind==='link')return '이 상자와 맞는 그림을 골라요';
 if(step.kind==='net-predict')return '이 종이를 접으면 정육면체가 될까요?';
 if(step.kind==='cut-plan')return '어디를 자르면 한 장으로 펼쳐질까요?';
 if(step.kind==='tray-count')return '상자에 맞는 종이 3종류를 2장씩 준비해요';
 if(step.kind==='sketch'&&step.tool==='draw')return step.instruction.replace('정육면체 겨냥도에서 ','').replace('직육면체 겨냥도에서 ','').replace('를 꼭짓점 두 개를 차례로 눌러 그려요. 선 종류를 고른 뒤 그려요.','를 그려요.');
 if(step.kind==='solid'&&step.mode==='pairs')return '마주 보는 면을 세 쌍 찾아요';
 if(step.kind==='net-build'){
  if(step.replaceable)return step.blankLength?'크기가 맞지 않는 조각을 바꾸고 길이를 적어요':'크기가 맞지 않는 조각을 바꿔요';
  if(step.movable)return '겹치는 조각을 다른 자리로 옮겨요';
  if(step.fixedBase)return (step.part?step.part+` (${step.dims.x}×${step.dims.y}×${step.dims.z}) · `:'')+'빠진 면 하나를 붙여요';
  if(step.instruction.includes('다른 모양'))return '앞에서 만든 것과 다른 전개도를 만들어요';
  return '종이 조각으로 상자 전개도를 만들어요';
 }
 return step.instruction.replace(/^[①②③④⑤]\s*[^:]+:\s*/, '').replace('정사각형 5/6.','정사각형 한 장을 더 붙여요.');
}

export function moveFor(step,kind=step.mode){
 if(['ready','check','second','pair-second','place'].includes(kind)||String(kind).endsWith('-next'))return actionFor(step,kind);
 if(step.kind==='solid'&&step.secondFace)return `★ ${FACE_LABEL[step.baseFace]} · ◆ ${FACE_LABEL[step.secondFace]}이 기준이에요. 면을 눌러요.`;
 if(step.kind==='solid'&&step.basePair)return `${step.basePair.map(f=>FACE_LABEL[f]).join(' · ')}이 밑면이에요. 상자를 돌려 찾아요.`;
 if(step.kind==='solid')return step.mode==='pairs'?'면 두 개를 차례로 눌러 한 쌍을 만들어요.':step.mode==='all'?({faces:'상자의 넓은 면을 눌러요.',edges:'면과 면이 만나는 선을 눌러요.',vertices:'선이 모이는 끝점을 눌러요.'}[kind]||'먼저 면을 누르세요.'):step.mode==='vertices'?'동그란 꼭짓점을 톡 눌러요. 뒤쪽은 상자를 돌려서 찾아요.':step.mode==='edges'?'선을 톡 누르면 보호대 · 상자를 끌면 회전':'넓은 면을 톡 눌러요. 뒤쪽은 상자를 끌어 돌려요.';
 return {sort:'맞는 상자를 모두 골라요 · 다시 누르면 취소',choice:step.answer?.length>1?'맞는 카드를 모두 눌러요. 다시 누르면 취소돼요.':'맞는 카드 한 장을 눌러요.',fill:'지금 보이는 빈칸부터 채워요.',sketch:step.tool==='draw'?'선 종류 선택 → 시작점 → 끝점':'바꿀 선을 누르면 실선 ↔ 점선으로 바뀌어요.','cut-plan':'안을 고르면 크게 보여요. 상자를 돌려 보고 하나 골라요.','net-predict':'종이 모양을 보고 아래에서 ‘될 거예요’ 또는 ‘안 될 거예요’를 눌러요.','net-build':step.replaceable?'맞지 않는 조각 선택 → 보관함에 넣기 → 맞는 종이 붙이기':step.movable?'바꿀 조각을 눌러 집은 뒤, 놓을 칸을 눌러요.':'종이 한 장 선택 → 붙일 칸 누르기','net-points':step.ask==='segment'?'노란 선과 만날 선을 눌러요. 접기 보기로 확인할 수 있어요.':'노란 점과 만날 점들을 눌러요. 접기 보기로 확인할 수 있어요.','tray-count':'종이 아래 ＋로 한 장 추가하고, −로 빼요.',link:'그림의 글자를 골라요 · 다음 그림으로 계속'}[step.kind]||actionFor(step,kind);
}

// An unfinished input is not a mathematical mistake. Never consult check/answers here.
export function hasResponse(step,a){
 if(step.kind==='peel')return Boolean(a.face&&a.shapes?.length);
 if(['sort','choice','net-points'].includes(step.kind))return Boolean(a.selected?.length);
 if(step.kind==='cut-plan')return a.selected!=null;
 if(step.kind==='net-predict')return typeof a.predict==='boolean';
 if(step.kind==='fill')return [...(step.fields||[]),...(step.selects||[])].every(f=>String(a.values?.[f.id]??'').trim()!=='');
 if(step.kind==='link')return step.solids.every(s=>a.links?.[s.id]?.sketch&&a.links?.[s.id]?.net);
 if(step.kind==='tray-count')return Object.values(a.counts||{}).some(n=>n>0);
 if(step.kind==='solid')return ['faces','edges','vertices','diagonals','pairs'].some(k=>a[k]?.length);
 if(step.kind==='net-build')return Boolean(a.pieces?.length)&&(!step.blankLength||String(a.values?.blank??'').trim()!=='')&&!a.board?.held;
 return true;
}
