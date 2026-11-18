// Delivery is saved by the caller before this optional, silent celebration.
export function momoRewardVideo(dialog, body, close, button, autoplay=false) {
  const giftReplay=body.querySelector('.replay-gift');
  if(giftReplay)giftReplay.textContent='컵 드는 모습 보기';
  const replay=button('▷ 배송 영상 다시 보기',play);
  body.querySelector('.reward-actions').append(replay);
  function play(){
    body.querySelector('.video-notice')?.remove();
    const reply=document.createDocumentFragment();reply.append(...body.childNodes);
    const heading=document.createElement('h2');heading.textContent='마음이 도착했어요';
    const video=document.createElement('video');video.src=new URL('./assets/video/momo-delivery-reward.mp4',import.meta.url).href;
    video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label','독도 친구가 모모의 바다빛 컵으로 차를 마셔요');
    const status=document.createElement('p');status.textContent='모모의 선물로 따뜻한 한 모금';status.setAttribute('role','status');
    const resume=button('▶ 영상 재생',start);resume.hidden=true;
    const skip=button('건너뛰고 답장 보기',()=>finish(),true);
    const actions=document.createElement('div');actions.className='reward-actions';actions.append(resume,skip);
    body.append(heading,video,status,actions);dialog.classList.add('reward-video-view');dialog.scrollTop=0;
    let done=false,watchdog=null,wasPlaying=false,deadline=0;
    const disarm=()=>{clearTimeout(watchdog);watchdog=null;};
    function checkProgress(){watchdog=null;const remaining=deadline-performance.now();if(remaining>0)watchdog=setTimeout(checkProgress,remaining);else finish('영상을 불러오지 못했어요. 답장은 잘 도착했어요.');}
    const arm=()=>{deadline=performance.now()+10000;if(watchdog===null)watchdog=setTimeout(checkProgress,10000);};
    function finish(message){
      if(done)return;done=true;disarm();video.pause();video.removeAttribute('src');video.load();
      dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',closed);close.removeEventListener('click',cancel,true);document.removeEventListener('visibilitychange',visibility);
      body.replaceChildren(reply);dialog.classList.remove('reward-video-view');
      if(message){const note=document.createElement('p');note.className='video-notice';note.textContent=message;note.setAttribute('role','status');body.append(note);}
      if(dialog.open)(body.querySelector('.reward-actions button.primary')||replay).focus({preventScroll:true});dialog.scrollTop=0;
    }
    function cancel(e){e.preventDefault();e.stopImmediatePropagation();finish();}
    function closed(){finish();}
    async function start(){if(done)return;resume.hidden=true;wasPlaying=true;arm();try{await video.play();if(done||document.hidden)video.pause();}catch{if(!done){wasPlaying=false;disarm();resume.hidden=false;status.textContent='재생 또는 답장 보기';}}}
    function visibility(){if(document.hidden){wasPlaying=wasPlaying||!video.paused;video.pause();disarm();}else if(wasPlaying)start();}
    video.addEventListener('timeupdate',()=>{if(!done&&!document.hidden)arm();});
    video.addEventListener('playing',()=>{status.textContent='모모의 선물로 따뜻한 한 모금';});
    video.addEventListener('ended',()=>finish());video.addEventListener('error',()=>{if(!done)finish('영상을 불러오지 못했어요. 답장은 잘 도착했어요.');});
    dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',closed);close.addEventListener('click',cancel,true);document.addEventListener('visibilitychange',visibility);
    skip.focus();start();
  }
  if(autoplay&&!matchMedia('(prefers-reduced-motion: reduce)').matches)play();
}
