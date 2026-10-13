'use strict';
(()=>{const previous=JOSEON_MISSIONS.render;
JOSEON_MISSIONS.render=function(m,root,G){
 const s=G.draft(m.id).play;
 root.classList.toggle('landmarks11',m.id===1);
 root.closest('#dialog-inner')?.classList.toggle('origin-entry11',m.id===0&&!s.entered);
 if(m.id===8)s.educationRev=11;
 if(m.id===10){
  // Every correct answer occupies a different position; label IDs still drive scoring.
  s.statusPositions11||=G.shuffle([0,1,2,3]);
  s.statusLabels11||=G.shuffle([0,1,2,3]);
  const stage=s.stage||0;
  s.statusOrder=s.statusLabels11.filter(i=>i!==stage);
  s.statusOrder.splice(s.statusPositions11[stage],0,stage);
 }
 previous(m,root,G);
 if(m.id===3&&s.step===2)window.JOSEON_FX11?.rain(root,G);
 else window.JOSEON_FX11?.stopRain();
 if(m.id===5){
  // Requests 1 and 2 use daytime pictures (clear, then bright cloudy); request 3 keeps the night scene.
  const scene=root.querySelector('.observatory-scene'),stage=s.stage||0;
  if(scene&&stage<2){
   scene.classList.add(stage===0?'sunny11':'cloudy20');
   const copy=document.createElement('div');copy.className='weather-copy11';
   while(scene.firstChild)copy.append(scene.firstChild);
   scene.innerHTML=stage===0?'<img src="assets/v11/observatory-sunny.webp" alt="비가 그친 뒤 따뜻한 햇빛이 비치고 해 그림자가 생긴 맑은 낮의 관측소">':'<img src="assets/v11/observatory-cloudy-v20.webp" alt="밝은 회색 구름이 하늘을 덮어 해가 보이지 않고 그림자도 생기지 않는 흐린 낮의 관측소">';
   scene.append(copy);
  }
 }
 if(m.id===17){
  const paper=root.querySelector('.order-paper');if(!paper)return;
  const text=paper.querySelector('p');text.className='crop-order11';
  if((s.stage||0)===0){
   const food=(s.chosen||[]).filter(i=>i<2).length,sale=(s.chosen||[]).filter(i=>i>=2).length;
   text.innerHTML=`<span class="${food===1?'ready':''}"><i>${food===1?'✓':'1'}</i><b>먹을거리 1개</b><small>감자 또는 고구마</small></span><em>＋</em><span class="${sale===1?'ready':''}"><i>${sale===1?'✓':'1'}</i><b>판매용 1개</b><small>고추 또는 인삼</small></span>`;
   text.setAttribute('aria-label',`먹을거리 1개와 판매용 1개를 골라요. 현재 먹을거리 ${food}개, 판매용 ${sale}개`);
  }
 }
};})();
