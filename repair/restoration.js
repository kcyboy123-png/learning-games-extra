'use strict';
// Optional reward films. The saved repair/score never depends on media playback.
window.RepairCinema = (() => {
 const titles=['다리 입구가 튼튼해졌어요','꽃수레가 건널 다리 완성','꽃길에 색이 돌아왔어요','반쪽 정원이 온실까지 이어져요','탑 아래에 빛이 돌아왔어요','시계탑이 다시 깨어나요','모양숲, 반짝 축제의 시작'];
 const lessons=['모양과 크기가 같은 부품을 딱 맞게 포갰어요.','대응하는 변과 각을 찾아 다리를 이었어요.','대칭축을 따라 꽃길의 양쪽을 맞췄어요.','대칭축에서 같은 거리의 자리를 채웠어요.','반 바퀴 돌려 겹치는 문양을 찾았어요.','대칭의 중심을 사이에 두고 짝을 완성했어요.','포개고, 접고, 돌린 35번의 수리가 축제가 되었어요.'];
 const path=s=>window.EMBEDDED_ASSETS?.[s]||s;
 let current=null, replayDialog=null, lastFocus=null;
 const valid=day=>Number.isInteger(day)&&day>=1&&day<=7;
 function markup(day){if(!valid(day))return '';return `<section class="repair-film" aria-label="${titles[day-1]}"><div class="repair-film-stage"><img class="repair-film-poster" src="${path('assets/restore-day-'+day+'.webp')}" alt="${titles[day-1]}의 완성 모습"><video hidden playsinline muted preload="none" aria-label="${titles[day-1]} 복구 영상" tabindex="-1"></video><span class="repair-film-label">${day===7?'우리 손으로 만든 축제':'DAY '+day+' · 복구의 순간'}</span><button class="repair-film-start" type="button">▶ 변화 보기</button></div><div class="repair-film-tools"><button class="btn secondary small" type="button" data-film="toggle">영상 재생</button><button class="btn quiet small" type="button" data-film="skip" hidden>영상 건너뛰기</button><span class="repair-film-status" role="status">${day===7?'처음 마을에서 축제까지':'내가 고친 곳을 영상으로 만나요'}</span></div><progress class="repair-film-progress" max="1" value="0" aria-label="복구 영상 진행"></progress></section>`}
 function mount(host,day,{autoplay=false}={}){
  stop();if(!host||!valid(day))return;
  const video=host.querySelector('video'),poster=host.querySelector('.repair-film-poster'),start=host.querySelector('.repair-film-start'),toggle=host.querySelector('[data-film="toggle"]'),skip=host.querySelector('[data-film="skip"]'),status=host.querySelector('.repair-film-status'),progress=host.querySelector('progress');
  let timer=0,disposed=false,ended=false,loaded=false,request=0,cleanup=[];
  const live=()=>!disposed&&host.isConnected;
  const on=(el,type,fn)=>{el.addEventListener(type,fn);cleanup.push(()=>el.removeEventListener(type,fn))};
  function cancelTimer(){clearTimeout(timer);timer=0}
  function still(message){request++;cancelTimer();video.pause();video.hidden=true;poster.hidden=false;start.hidden=false;start.textContent='↻ 다시 보기';toggle.textContent='다시 보기';skip.hidden=true;status.textContent=message;ended=true}
  function fallback(){if(!live())return;still('영상 연결이 느려 완성 그림을 보여드려요. 계속 진행할 수 있어요.');video.removeAttribute('src');video.load();loaded=false}
  function watch(){cancelTimer();timer=setTimeout(fallback,10000)}
  async function play(){
   if(!live())return;const ticket=++request;ended=false;status.textContent='복구의 순간을 준비하고 있어요…';start.hidden=true;skip.hidden=false;video.muted=true;video.defaultMuted=true;
   if(!loaded){video.src=path('assets/restore-day-'+day+'.mp4');loaded=true;}else if(video.ended)video.currentTime=0;
   if(video.hidden){video.currentTime=0;progress.value=0;}watch();
   try{await video.play();if(!live()||ticket!==request)return;}
   catch{if(!live()||ticket!==request)return;cancelTimer();start.hidden=false;toggle.textContent='영상 재생';skip.hidden=true;status.textContent='재생 버튼을 누르면 볼 수 있어요.'}
  }
  function pause(){request++;cancelTimer();video.pause();toggle.textContent='이어서 보기';status.textContent='잠시 멈췄어요. 이어 보거나 바로 진행해도 좋아요.'}
  on(start,'click',play);on(toggle,'click',()=>video.paused||ended?play():pause());on(skip,'click',()=>still('수리는 이미 저장됐어요. 바뀐 마을로 돌아가 볼까요?'));
  on(video,'playing',()=>{if(!live())return;if(ended||document.hidden){video.pause();return}cancelTimer();video.hidden=false;poster.hidden=true;start.hidden=true;toggle.textContent='잠깐 멈추기';status.textContent='내가 해결한 주문이 마을을 바꾸는 중';skip.hidden=false});
  on(video,'timeupdate',()=>{if(Number.isFinite(video.duration)&&video.duration>0)progress.value=Math.min(1,video.currentTime/video.duration)});
  on(video,'ended',()=>{progress.value=1;still(day===7?'모든 수리 완료! 축제를 즐겨요.':'복구 완료! 수리 전후 모습도 비교해 보세요.')});
  on(video,'error',fallback);on(video,'waiting',()=>{if(!video.paused)watch()});on(video,'stalled',()=>{if(!video.paused)watch()});
  on(document,'visibilitychange',()=>{if(document.hidden&&!video.paused)pause()});on(window,'pagehide',()=>pause());
  current={stop(){if(disposed)return;disposed=true;request++;cancelTimer();cleanup.forEach(fn=>fn());video.pause();video.removeAttribute('src');video.load();}};
  const reduced=window.Shop?.state.settings.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(autoplay&&!reduced&&!navigator.connection?.saveData)void play();
  else status.textContent=reduced?'움직임 줄이기 설정 · 원하면 영상을 재생해요.':navigator.connection?.saveData?'데이터 절약 중 · 원하면 영상을 재생해요.':'원할 때 복구의 순간을 다시 보세요.';
 }
 function stop(){current?.stop();current=null}
 function close(){stop();if(!replayDialog)return;const old=replayDialog;replayDialog=null;old.close();old.remove();document.body.classList.remove('has-restoration-replay');if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});lastFocus=null}
 function open(day){
  if(!valid(day)||!window.Shop)return;
  const completed=Shop.state.runs.story.completed;
  if(!Array.from({length:5},(_,i)=>`D${day}-0${i+1}`).every(id=>completed[id]))return;
  close();lastFocus=document.activeElement;
  replayDialog=document.createElement('dialog');replayDialog.className='restoration-replay';replayDialog.setAttribute('aria-labelledby','restoration-replay-title');
  replayDialog.innerHTML=`<div class="restore-replay-header"><div><span class="eyebrow">나의 수리 앨범 · DAY ${day}</span><h2 id="restoration-replay-title">${titles[day-1]}</h2></div><button class="btn secondary small" data-close-film>닫기</button></div>${markup(day)}<p class="restore-lesson">${lessons[day-1]}</p><p class="fine">다시 보아도 점수와 수리 기록은 바뀌지 않아요.</p>`;
  document.body.append(replayDialog);document.body.classList.add('has-restoration-replay');replayDialog.showModal();
  replayDialog.querySelector('[data-close-film]').onclick=close;
  replayDialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  mount(replayDialog.querySelector('.repair-film'),day,{autoplay:true});replayDialog.querySelector('[data-close-film]').focus({preventScroll:true});
 }
 return {markup,mount,stop,open,close,titles,lessons};
})();
