// Photo controls render only when changed; the simulation loop rests until closing.
export function createPhotoMode({world:w,getState,getTime,name,notify}){
 const dialog=document.createElement('dialog');dialog.className='photo-mode';dialog.setAttribute('aria-label','마을 사진관');
 dialog.innerHTML=`<header class="photo-top"><div><b>우리 마을 사진관</b><small>마음에 드는 순간을 담아요</small></div><button data-close>촬영 마치기 ×</button></header><div class="photo-frame" aria-hidden="true"></div><section class="photo-tools"><div class="photo-presets" role="group" aria-label="사진 구도"><button data-pose="rabbit">토끼와 함께</button><button data-pose="wide">마을 전경</button><button data-pose="lane">골목 풍경</button><button data-pose="dokdo">독도 풍경</button></div><div class="photo-adjust"><button data-turn="-1" aria-label="왼쪽으로 돌리기">↶</button><label>확대 <input aria-label="사진 확대" type="range" min="0.35" max="2.4" step="0.05" value="1.4"></label><button data-turn="1" aria-label="오른쪽으로 돌리기">↷</button><label><input type="checkbox" checked>마을 이름</label><button data-shutter class="photo-shutter">📷 사진 저장</button></div><p role="status" class="photo-status">메뉴 없이 풍경만 저장해요.</p></section>`;
 document.body.append(dialog);let saved=null,active=false,frameRequest=0;
 const status=dialog.querySelector('.photo-status'),zoom=dialog.querySelector('input[type=range]');
 function render(){if(frameRequest){cancelAnimationFrame(frameRequest);frameRequest=0;}w.paused=true;w.frame(0,getTime(),false);}
 function scheduleRender(){if(!frameRequest)frameRequest=requestAnimationFrame(()=>{frameRequest=0;if(active)render();});}
 function preset(kind){const p=w.player.g.position;w.center.copy(p);w.followPlayer=false;w.lookHeight=p.y+.55;w.cameraHeight=kind==='lane'?18:24;w.angle=.85;
  w.zoom=w.targetZoom=kind==='dokdo'?.35:kind==='wide'?.4:kind==='lane'?1.1:1.55;
  if(kind==='wide'){w.focus(9,9);w.lookHeight=.2;}if(kind==='dokdo'){w.focus(11,10);w.lookHeight=4;}
  zoom.value=w.zoom;for(const b of dialog.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String(b.dataset.pose===kind));render();
 }
 function close(){if(!active)return;active=false;w.center.copy(saved.center);for(const k of ['zoom','targetZoom','angle','cameraHeight','lookHeight','followPlayer','paused'])w[k]=saved[k];w.marker.visible=saved.marker;document.body.classList.remove('taking-photo');render();w.paused=saved.paused;dialog.close();saved.focus?.focus();}
 dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 for(const b of dialog.querySelectorAll('[data-pose]'))b.onclick=()=>preset(b.dataset.pose);
 for(const b of dialog.querySelectorAll('[data-turn]'))b.onclick=()=>{w.angle+=Number(b.dataset.turn)*Math.PI/8;scheduleRender();};
 zoom.oninput=()=>{w.zoom=w.targetZoom=Number(zoom.value);for(const b of dialog.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed','false');scheduleRender();};
 dialog.querySelector('[data-shutter]').onclick=async()=>{const button=dialog.querySelector('[data-shutter]');button.disabled=true;try{
  render();const c=document.createElement('canvas');c.width=w.canvas.width;c.height=w.canvas.height;const ctx=c.getContext('2d');ctx.drawImage(w.canvas,0,0);
  if(dialog.querySelector('input[type=checkbox]').checked){const size=Math.max(18,Math.round(c.width/48));ctx.font=`bold ${size}px sans-serif`;ctx.textBaseline='bottom';ctx.shadowColor='#172e40';ctx.shadowBlur=5;ctx.fillStyle='#fff9e9';ctx.fillText(name(),size,size+c.height-size*2);}
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('사진을 만들지 못했어요.');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name().replace(/[\\/:*?"<>|]/g,'')}-${getState().island==='mist'?'독도':'마을'}-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  status.textContent=`사진을 저장했어요 · ${c.width} × ${c.height}px`;dialog.classList.remove('photo-flash');void dialog.offsetWidth;dialog.classList.add('photo-flash');
 }catch(e){status.textContent=e.message;notify(e.message);}finally{button.disabled=false;}};
 // Canvas resizing clears WebGL after window.resize; redraw once its actual size is settled.
 new ResizeObserver(()=>{if(active)scheduleRender();}).observe(w.canvas);
 return {get active(){return active;},open(){if(active)return;saved={center:w.center.clone(),focus:document.activeElement,marker:w.marker.visible};for(const k of ['zoom','targetZoom','angle','cameraHeight','lookHeight','followPlayer','paused'])saved[k]=w[k];active=true;w.marker.visible=false;document.body.classList.add('taking-photo');dialog.querySelector('.photo-top b').textContent=getState().island==='mist'?'독도 사진관':'우리 마을 사진관';dialog.querySelector('[data-pose=lane]').textContent=getState().island==='mist'?'둘레길 풍경':'골목 풍경';dialog.querySelector('[data-pose=dokdo]').disabled=getState().island!=='mist';dialog.querySelector('[data-pose=wide]').disabled=getState().island==='mist';status.textContent='메뉴 없이 풍경만 저장해요.';dialog.showModal();preset('rabbit');},close};
}
