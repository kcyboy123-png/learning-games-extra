import {portrait,itemImage} from './story.mjs?v=gift-focus-20261118';

const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
const art=(src,cls,alt='')=>{const n=el('img',cls);n.src=src;n.alt=alt;return n;};
const asset=path=>new URL(path,import.meta.url).href;

export function welcomeLetter(){
  const root=el('aside','welcome-letter');root.setAttribute('aria-label','모모에게 편지가 왔어요');
  const letter=el('span','flying-letter','✉');letter.setAttribute('aria-hidden','true');
  letter.append(art(itemImage(0),'welcome-gift'));
  root.append(letter,art(asset(portrait(0)),'welcome-momo'),el('strong','','모모가 기다려!'));
  const skip=el('button','','바로 걷기');skip.type='button';root.append(skip);document.body.append(root);
  const events=new AbortController(),shownAt=performance.now();let timer,frame;
  const finish=()=>{clearTimeout(timer);cancelAnimationFrame(frame);events.abort();root.remove();};
  document.addEventListener('pointerdown',()=>{if(performance.now()-shownAt>=800)finish();},{signal:events.signal});
  document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D','Escape','Enter',' '].includes(e.key))finish();},{signal:events.signal});
  skip.onclick=finish;frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{timer=setTimeout(finish,4500);});});
}

export function momoRequestFilm(dialog){
  const root=el('figure','momo-request-film'),video=el('video','');
  video.src=asset('./assets/video/momo-request.mp4');video.poster=asset('./assets/video/momo-request.webp');video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label','모모가 바다빛 컵을 소중히 들어 보여요');
  const control=el('button','film-control','건너뛰기');control.type='button';
  const route=el('figcaption','gift-route');route.append(art(itemImage(0),'','바다빛 컵'),el('span','','→'),el('span','gift-boat','⛵'),el('span','','→'),art(asset(portrait(1)),'','독도 친구'),el('strong','','독도 친구에게'));
  root.append(video,control,route);let dismissed=false;
  const stop=()=>{video.pause();resume=false;dismissed=true;control.textContent='다시 보기';root.classList.add('film-finished');};
  control.onclick=()=>{if(!video.paused){stop();return;}dismissed=false;if(video.error)video.load();else video.currentTime=0;play();};
  async function play(){resume=true;try{await video.play();if(dismissed||!root.isConnected||document.hidden)video.pause();else {control.textContent='건너뛰기';root.classList.remove('film-finished');}}catch{resume=false;control.textContent='영상 보기';root.classList.add('film-finished');}}
  video.addEventListener('ended',()=>{resume=false;control.textContent='다시 보기';root.classList.add('film-finished');});
  video.addEventListener('error',()=>{control.textContent='영상 다시 보기';root.classList.add('film-finished');});
  const events=new AbortController();let resume=false;
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resume=resume||!video.paused;video.pause();}else if(resume&&!dismissed){resume=false;play();}},{signal:events.signal});
  dialog.addEventListener('close',()=>{events.abort();dismissed=true;video.pause();video.removeAttribute('src');video.load();},{once:true});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)control.textContent='영상 보기';else queueMicrotask(play);return root;
}

export function cupPractice(onPlace){
  const root=el('div','cup-practice'),cup=el('button','practice-cup'),box=el('button','practice-box');
  cup.type=box.type='button';cup.setAttribute('aria-label','컵 집기');box.setAttribute('aria-label','상자에 컵 놓기');
  cup.append(art(itemImage(0),'',''));box.append(el('span','box-opening'),el('span','box-front','♡'));
  const arrow=el('span','practice-arrow','→');arrow.setAttribute('aria-hidden','true');root.append(cup,arrow,box);
  let drag=null,placed=false,suppressClick=false;
  const place=()=>{if(placed)return;placed=true;root.classList.add('cup-placed');cup.style.transform='';cup.setAttribute('aria-label','상자에 담은 컵');box.setAttribute('aria-label','컵을 안전하게 포장할 준비 완료');onPlace();};
  cup.onclick=e=>{if(placed||(suppressClick&&e.detail!==0))return;root.classList.add('cup-held');box.focus({preventScroll:true});};box.onclick=()=>{if(root.classList.contains('cup-held'))place();else cup.focus({preventScroll:true});};
  cup.addEventListener('pointerdown',e=>{if(placed||e.button!==0)return;suppressClick=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,scale:root.getBoundingClientRect().width/root.offsetWidth,target:box.getBoundingClientRect()};cup.setPointerCapture(e.pointerId);root.classList.add('cup-held');});
  cup.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;drag.moved ||= Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8;const scale=drag.scale,r=drag.target;box.classList.toggle('drop-ready',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);cup.style.transform=`translate(${(e.clientX-drag.x)/scale}px,${(e.clientY-drag.y)/scale}px)`;});
  const end=e=>{if(drag?.id!==e.pointerId)return;const r=box.getBoundingClientRect(),moved=drag.moved;drag=null;box.classList.remove('drop-ready');cup.style.transform='';suppressClick=moved||e.type!=='pointerup';if(e.type==='pointerup'&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)place();else if(moved||e.type!=='pointerup')root.classList.remove('cup-held');if(cup.hasPointerCapture(e.pointerId))cup.releasePointerCapture(e.pointerId);};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])cup.addEventListener(name,end);
  return root;
}
