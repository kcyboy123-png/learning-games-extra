import {PALETTES,canPaint,paintSwatch,setBuildingPaint,paintCost} from './building-paint.mjs?v=perf1';
export function createPaintUI({world,getState,getBuilding,otherOwnerAlive,save,toast,refresh}){
 const $=id=>document.getElementById(id),panel=$('paintPanel');let editing=null,chosen=0;
 const close=()=>{if(!editing)return;editing=null;panel.classList.remove('open');document.body.classList.remove('painting');world.endPaintPreview(getState());};
 const update=()=>{
  const b=getBuilding();$('paintBuilding').hidden=!canPaint(b);
  if(editing&&(!b||b.id!==editing.id||otherOwnerAlive()))close();
  if(editing){const cost=paintCost(getState(),b,chosen),same=(b.paint??0)===chosen,short=getState().money<cost;$('paintApply').disabled=same||short;$('paintApply').textContent=same?'현재 색이에요':`이 색으로 꾸미기 · ${cost}코인`;$('paintCost').textContent=same?'다른 색을 골라 미리 보세요.':short?`${cost}코인이 필요해요 · 기금을 더 모아 주세요.`:`확정할 때 ${cost}코인 · 미리보기와 취소는 무료`;}
 };
 $('paintBuilding').onclick=()=>{
  const b=getBuilding();if(!canPaint(b))return;
  if(otherOwnerAlive()){toast('다른 탭에서 진행 중이에요. 이 탭에서 이어받아 주세요.');return;}
  editing={id:b.id};chosen=b.paint??0;$('paintNotice').textContent='색을 누르면 건물에서 미리 보여요.';
  $('paintChoices').innerHTML=PALETTES.map((p,i)=>`<button type="button" data-paint="${i}" aria-pressed="${i===chosen}" aria-label="${p.name}">${paintSwatch(b.type,i)}<span>${p.name}</span><b class="paint-check" aria-hidden="true">✓</b></button>`).join('');
  panel.classList.add('open');document.body.classList.add('painting');world.previewPaint(getState(),b.id,chosen);update();$('paintChoices').querySelector(`[data-paint="${chosen}"]`).focus({preventScroll:true});
 };
 $('paintChoices').onclick=e=>{
  const button=e.target.closest('[data-paint]');if(!button||!editing)return;
  if(otherOwnerAlive()){close();toast('다른 탭이 진행 중이라 미리보기를 닫았어요.');return;}
  chosen=Number(button.dataset.paint);for(const b of $('paintChoices').children)b.setAttribute('aria-pressed',String(b===button));
  world.previewPaint(getState(),editing.id,chosen);$('paintNotice').textContent=PALETTES[chosen].name+' · 미리 보는 중';update();
 };
 $('paintApply').onclick=()=>{
  if(!editing)return;
  if(otherOwnerAlive()){close();toast('다른 탭이 진행 중이에요. 이 탭에서 이어받아 주세요.');return;}
  const r=setBuildingPaint(getState(),editing.id,chosen);if(r.error){toast(r.error);update();return;}
  close();const stored=save('건물 색');refresh();toast(stored?`마음에 드는 색으로 꾸몄어요 · ${r.cost}코인 사용`:'색을 바꿨어요. 마을 파일로 보관해 주세요.');$('paintBuilding').focus({preventScroll:true});
 };
 for(const id of ['paintCancel','paintClose'])$(id).onclick=()=>{close();$('paintBuilding').focus({preventScroll:true});};
 return {close,update,get active(){return !!editing;}};
}
