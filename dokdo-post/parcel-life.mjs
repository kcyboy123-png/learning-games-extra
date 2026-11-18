import {sfx} from './math/ui/audio.mjs?v=audio-journey-20261117';
import {itemImage,portrait,STORIES} from './story.mjs?v=gift-focus-20261118';
import {findActivity} from './math/data/workshops.mjs';

// Use the actual lesson box; robot limbs are parts, not the shipping carton.
export function parcelDimensions(id){
  const ids=['w1-m1','w2-m3','w3-m4','w4-m4','w5-m3','w6-m3','final'];
  const step=findActivity(ids[id]||ids[0]).activity.steps.find(s=>s.dims||s.net==='cube');
  return step.dims?{...step.dims}:{x:1,y:1,z:1};
}

export const RIBBONS=[['leaf','잎새 초록','#78996a'],['sea','바다 파랑','#689da9'],['rose','꽃잎 분홍','#b98386']];
export const STAMPS=[['leaf','잎 우표','❧'],['wave','바다 우표','≈'],['star','별 우표','★']];
export function parcelLook(progress,id){
  const saved=progress.getExtra('parcel-look:'+id);
  return {ribbon:RIBBONS.some(r=>r[0]===saved?.ribbon)?saved.ribbon:'leaf',stamp:STAMPS.some(s=>s[0]===saved?.stamp)?saved.stamp:'leaf'};
}
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
export function parcelPicture(look){
  const ribbon=RIBBONS.find(r=>r[0]===look.ribbon)||RIBBONS[0],stamp=STAMPS.find(s=>s[0]===look.stamp)||STAMPS[0];
  const box=el('div','personal-parcel');box.style.setProperty('--ribbon',ribbon[2]);box.dataset.ribbon=ribbon[0];box.dataset.stamp=stamp[0];box.setAttribute('role','img');box.setAttribute('aria-label',ribbon[1]+' 리본 · '+stamp[1]);
  if(look.dims){const {x,y,z}=look.dims;box.style.width=Math.round(122*x/Math.max(x,y))+'px';box.style.height=Math.round(122*y/Math.max(x,y))+'px';box.dataset.dimensions=[x,y,z].join('×');box.setAttribute('aria-label',box.getAttribute('aria-label')+' · 학습 상자 비율 '+[x,y,z].join('×'));}
  box.append(el('span','parcel-band'),el('span','parcel-bow','∞'),el('span','personal-stamp',stamp[2]));return box;
}
export function parcelCustomizer(progress,id,save){
  const root=el('section','parcel-customizer'),preview=el('button','look-preview'),status=el('small','look-status','배송 준비 끝');status.setAttribute('role','status');
  let look={...parcelLook(progress,id),dims:parcelDimensions(id)},saveFailed=false;
  status.textContent='배송 준비 끝';preview.type='button';preview.setAttribute('aria-label','내 소포 · 끌어서 살펴보기');preview.title='끌어서 살펴보기';preview.append(parcelPicture(look));
  const gift=el('img','packed-gift');gift.src=itemImage(id);gift.alt='';preview.append(gift);
  const receiver=el('div','parcel-recipient'),face=el('img');face.src=new URL('./'+portrait(id<3?1:3),import.meta.url).href;face.alt='받을 친구';receiver.append(face,el('span',null,STORIES[id].to));
  root.append(el('h3',null,'내가 포장했어요!'),preview,receiver,el('small','parcel-purpose',STORIES[id].finish));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nudge=()=>{const box=preview.firstElementChild;box.getAnimations().forEach(a=>a.cancel());if(!reduced())box.animate([{transform:'translateY(0)'},{transform:'translateY(-8px) rotate(-3deg)'},{transform:'none'}],{duration:260,easing:'ease-out'});};
  let drag=null;
  preview.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};preview.setPointerCapture(e.pointerId);preview.classList.add('parcel-held');});
  preview.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const x=Math.max(-16,Math.min(16,(e.clientX-drag.x)*.2)),y=Math.max(-12,Math.min(12,(e.clientY-drag.y)*.15));preview.firstElementChild.style.transform=`translateY(-6px) rotate(${x}deg) skewY(${y*.2}deg)`;});
  const release=e=>{if(!drag||drag.id!==e.pointerId)return;drag=null;const box=preview.firstElementChild,from=box.style.transform;box.getAnimations().forEach(a=>a.cancel());box.style.transform='';preview.classList.remove('parcel-held');if(e.type==='pointerup'&&!reduced())box.animate([{transform:from||'translateY(-6px)'},{transform:'none'}],{duration:180,easing:'ease-out'});if(preview.hasPointerCapture(e.pointerId))preview.releasePointerCapture(e.pointerId);};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])preview.addEventListener(event,release);
  preview.addEventListener('click',e=>{if(e.detail===0)nudge();});
  const buttons=[];
  for(const [key,label,choices] of [['ribbon','리본',RIBBONS],['stamp','우표',STAMPS]]){
    const field=el('fieldset');field.append(el('legend',null,label));
    for(const [value,name,art] of choices){const b=el('button','look-choice',key==='ribbon'?({leaf:'초록',sea:'파랑',rose:'분홍'}[value]):({leaf:'잎',wave:'물결',star:'별'}[value]));b.setAttribute('aria-label',name);b.type='button';b.dataset.key=key;b.dataset.value=value;b.setAttribute('aria-pressed',String(look[key]===value));if(key==='ribbon')b.style.setProperty('--swatch',art);else b.prepend(el('span','stamp-choice',art));
      b.addEventListener('pointerdown',()=>preview.dataset.press=key);for(const event of ['pointerup','pointercancel','pointerleave'])b.addEventListener(event,()=>delete preview.dataset.press);
      b.onclick=()=>{
        if(look[key]===value&&!saveFailed){status.textContent='✓ 선택됨';nudge();return;}
        const changed=look[key]!==value;look={...look,[key]:value};
        progress.setExtra('parcel-look:'+id,{ribbon:look.ribbon,stamp:look.stamp});saveFailed=save?.()===false;
        if(changed){
          const current=preview.firstElementChild,next=parcelPicture(look);preview.dataset.action=key;
          current.style.setProperty('--ribbon',next.style.getPropertyValue('--ribbon'));current.dataset[key]=value;current.setAttribute('aria-label',next.getAttribute('aria-label'));
          for(const selector of key==='stamp'?['.personal-stamp']:['.parcel-band','.parcel-bow'])current.querySelector(selector).replaceWith(next.querySelector(selector));
          sfx[key==='stamp'?'stamp':'place']();
        }
        buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(look[btn.dataset.key]===btn.dataset.value)));
        root.classList.toggle('save-failed',saveFailed);status.textContent=saveFailed?'저장 실패 · 다시 눌러요':'✓ 저장됨';
      };buttons.push(b);field.append(b);
    }root.append(field);
  }root.append(status);return root;
}
export const USE_CAPTIONS=['컵을 들어 따뜻한 차를 마셔요.','마을 사진 액자를 책상 위에 세워요.','기록장을 펼쳐 오늘의 바다를 적어요.','등불을 켜고 저녁 편지를 읽어요.','간식 상자를 열고 함께 나눠 먹어요.','종이 우체부 옆에서 답장을 써요.','마을 친구들의 편지를 펼쳐 읽어요.'];
export function giftUseScene(id,look,assetBase=''){
  const scene=el('figure','gift-use');scene.dataset.gift=id;
  const art=el('div','gift-use-art');art.setAttribute('role','img');art.setAttribute('aria-label',USE_CAPTIONS[id]);
  const receiver=el('img','gift-receiver');receiver.src=assetBase+portrait(id<3?1:3);receiver.alt='';
  const gift=el('img','gift-in-use');gift.src=itemImage(id);gift.alt='';
  art.append(el('div','gift-table'),receiver,gift,el('span','use-effect',id===0?'〰':id===1||id===3?'✧':id===4?'●':id===6?'♡':'✎'));
  const parcel=parcelPicture(look);parcel.classList.add('delivered-parcel');art.append(parcel);
  scene.append(art,el('figcaption',null,USE_CAPTIONS[id]));
  const replay=el('button','replay-gift','다시 보기');replay.type='button';replay.onclick=()=>{art.classList.remove('playing');void art.offsetWidth;art.classList.add('playing');};scene.append(replay);art.classList.add('playing');return scene;
}
export function packingMoment(id,phase){
  const root=el('div','packing-moment'),art=el('div','packing-action-art'),gift=el('img','packing-action-gift');gift.src=itemImage(id);gift.alt='';art.append(parcelPicture({ribbon:'leaf',stamp:'leaf'}),gift);root.append(art);
  const b=el('button',null,phase==='box'?'선물 살짝 담아보기':'보호대 눌러 마무리');b.type='button';const caption=el('small',null,'원하면 해 봐요 · 바로 다음 작업으로 가도 돼요');
      b.onclick=()=>{root.classList.add('finished');caption.textContent=phase==='box'?'선물을 조심히 담았어요.':'모서리를 포근하게 감쌌어요.';b.disabled=true;};root.dataset.phase=phase;root.append(b,caption);return root;
}

export function packingMilestone(id,step){
  const captions={peel:'상자 면의 모양을 살펴봤어요',sort:step.mode==='mark'?'정육면체에 특별 표시를 붙였어요':'보낼 수 있는 상자를 골랐어요',solid:step.mode==='vertices'?'꼭짓점 보호캡을 챙겼어요':step.mode==='edges'?'모서리 보호대를 챙겼어요':'상자의 면과 만나는 자리를 확인했어요',sketch:'상자의 모습을 그렸어요','cut-plan':'종이를 펼칠 절개안을 골랐어요','net-build':'상자를 접을 종이를 준비했어요','net-predict':'접히는 모양을 확인했어요','net-points':'접으면 만나는 자리를 찾았어요','tray-count':'상자에 필요한 종이를 챙겼어요',link:'상자와 맞는 종이를 연결했어요',fill:'포장에 필요한 조건을 확인했어요',choice:'출발 전 포장 지식을 확인했어요'};
  const root=el('div','packing-milestone');root.dataset.phase='checked';
  const art=el('div','milestone-art'),gift=el('img','milestone-gift');gift.src=itemImage(id);gift.alt='';
  const parcel=parcelPicture({ribbon:'leaf',stamp:'leaf',dims:parcelDimensions(id)});art.append(parcel,gift);
  root.append(art,el('span',null,captions[step.kind]||'이번 포장 점검을 마쳤어요'));return root;
}
