import {PALETTES,canPaint,paintSwatch,setBuildingPaint} from './building-paint.mjs?v=paint1';
export function createPaintUI({world,getState,getBuilding,otherOwnerAlive,save,toast,refresh}){
 const $=id=>document.getElementById(id),panel=$('paintPanel');let editing=null,chosen=0;
 const close=()=>{if(!editing)return;editing=null;panel.classList.remove('open');document.body.classList.remove('painting');world.endPaintPreview(getState());};
 const update=()=>{
  const b=getBuilding();$('paintBuilding').hidden=!canPaint(b);
  if(editing&&(!b||b.id!==editing.id||otherOwnerAlive()))close();
 };
 $('paintBuilding').onclick=()=>{
  const b=getBuilding();if(!canPaint(b))return;
  if(otherOwnerAlive()){toast('다른 탭에서 진행 중이에요. 이 탭에서 이어받아 주세요.');return;}
  editing={id:b.id};chosen=b.paint??0;$('paintNotice').textContent='색을 누르면 건물에서 미리 보여요.';
  $('paintChoices').innerHTML=PALETTES.map((p,i)=>`<button type="button" data-paint="${i}" aria-pressed="${i===chosen}" aria-label="${p.name}">${paintSwatch(b.type,i)}<span>${p.name}</span><b class="paint-check" aria-hidden="true">✓</b></button>`).join('');
  panel.classList.add('open');document.body.classList.add('painting');world.previewPaint(getState(),b.id,chosen);$('paintChoices').querySelector(`[data-paint="${chosen}"]`).focus({preventScroll:true});
 };
 $('paintChoices').onclick=e=>{
  const button=e.target.closest('[data-paint]');if(!button||!editing)return;
  if(otherOwnerAlive()){close();toast('다른 탭이 진행 중이라 미리보기를 닫았어요.');return;}
  chosen=Number(button.dataset.paint);for(const b of $('paintChoices').children)b.setAttribute('aria-pressed',String(b===button));
  world.previewPaint(getState(),editing.id,chosen);$('paintNotice').textContent=PALETTES[chosen].name+' · 미리 보는 중';
 };
 $('paintApply').onclick=()=>{
  if(!editing)return;
  if(otherOwnerAlive()){close();toast('다른 탭이 진행 중이에요. 이 탭에서 이어받아 주세요.');return;}
  const r=setBuildingPaint(getState(),editing.id,chosen);if(r.error){toast(r.error);close();return;}
  close();const stored=save('건물 색');refresh();toast(stored?'마음에 드는 색으로 꾸몄어요.':'색을 바꿨어요. 마을 파일로 보관해 주세요.');$('paintBuilding').focus({preventScroll:true});
 };
 for(const id of ['paintCancel','paintClose'])$(id).onclick=()=>{close();$('paintBuilding').focus({preventScroll:true});};
 return {close,update,get active(){return !!editing;}};
}
