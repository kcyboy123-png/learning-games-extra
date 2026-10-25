let active=null;

// The entrance film is manual only: the app starts straight in the 3D forest, and this button on the home screen replays it.
export function mountEntrance(root,theme=null,onReplay=()=>{}){
  const button=root.querySelector('[data-entrance]');
  if(!root.querySelector('.intro')||!button)return;
  button.textContent='↻ 입장 영상 다시 보기';
  button.setAttribute('aria-label',button.textContent);
  button.onclick=()=>{if(!active){onReplay();openEntrance(root);}};
}

function openEntrance(root){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const previousFocus=document.activeElement,previousInert=root.inert,previousOverflow=document.body.style.overflow;
  const overlay=document.createElement('section');
  overlay.className='entrance-overlay';overlay.tabIndex=-1;
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','피아노의 숲 입장 영상');
  const video=document.createElement('video');
  video.className='entrance-film';video.muted=true;video.playsInline=true;video.preload='auto';video.loop=false;
  video.setAttribute('aria-hidden','true');video.poster='assets/art/entrance-poster.webp';
  const status=document.createElement('p');status.className='entrance-status';
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const actions=document.createElement('div');actions.className='entrance-actions';
  const play=document.createElement('button'),proceed=document.createElement('button');
  play.type=proceed.type='button';play.textContent='입장 영상 재생';proceed.textContent='숲으로 들어가기';
  play.hidden=proceed.hidden=true;actions.append(play,proceed);overlay.append(video,status,actions);
  let closed=false,leaving=false,watchdog,fadeTimer,attempt=0,failed=false;
  active=overlay;root.inert=true;document.body.style.overflow='hidden';document.body.append(overlay);overlay.focus({preventScroll:true});

  function clearWatchdog(){clearTimeout(watchdog);watchdog=undefined;}
  function message(text){status.textContent=text;status.hidden=!text;}
  function showFailure(){
    if(closed||leaving)return;
    attempt++;failed=true;clearWatchdog();video.pause();
    message('영상을 불러오지 못했어요. 다시 재생하거나 숲으로 들어갈 수 있어요.');
    play.textContent='영상 다시 재생';play.hidden=proceed.hidden=false;play.focus({preventScroll:true});
  }
  function watch(){
    if(closed||leaving||watchdog!==undefined)return;
    watchdog=setTimeout(showFailure,15000);
  }
  function dispose(restoreFocus=true){
    if(closed)return;
    closed=true;attempt++;clearWatchdog();clearTimeout(fadeTimer);
    video.onplaying=video.onwaiting=video.onstalled=video.ontimeupdate=video.onended=video.onerror=null;
    video.pause();video.removeAttribute('src');video.load();overlay.remove();
    root.inert=previousInert;document.body.style.overflow=previousOverflow;active=null;
    motion.removeEventListener('change',onMotion);window.removeEventListener('pagehide',onPageHide);
    if(restoreFocus){
      const target=previousFocus?.isConnected&&previousFocus!==document.body?previousFocus:root.querySelector('[data-entrance]');
      target?.focus({preventScroll:true});
    }
  }
  function finish(){
    if(closed||leaving)return;
    leaving=true;attempt++;clearWatchdog();video.pause();message('');actions.hidden=true;
    // Keep the last frame until the fade ends; clearing src here flashes the poster.
    overlay.classList.add('is-leaving');fadeTimer=setTimeout(()=>dispose(),motion.matches?0:450);
  }
  function start(){
    if(closed||leaving)return;
    const current=++attempt;play.hidden=proceed.hidden=true;message('숲으로 가는 길을 준비하고 있어요…');
    if(failed){failed=false;video.load();}
    watch();
    video.play().catch(()=>{
      if(closed||leaving||current!==attempt)return;
      clearWatchdog();message('재생 버튼을 누르면 숲으로 출발해요.');play.hidden=proceed.hidden=false;
      play.textContent='입장 영상 재생';play.focus({preventScroll:true});
    });
  }
  function onMotion(){if(motion.matches)finish();}
  function onPageHide(){dispose(false);}
  play.onclick=start;proceed.onclick=finish;
  video.onplaying=()=>{if(!closed&&!leaving){clearWatchdog();message('');}};
  video.ontimeupdate=()=>{if(!closed&&!leaving&&!video.paused){clearWatchdog();message('');}};
  video.onwaiting=video.onstalled=()=>{if(!closed&&!leaving){message('영상을 이어서 불러오고 있어요…');watch();}};
  video.onended=finish;video.onerror=showFailure;
  overlay.onkeydown=event=>{
    if(event.key!=='Tab')return;
    const controls=[play,proceed].filter(control=>!control.hidden&&!actions.hidden);
    if(!controls.length){event.preventDefault();overlay.focus();return;}
    const index=controls.indexOf(document.activeElement);
    event.preventDefault();controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length].focus();
  };
  motion.addEventListener('change',onMotion);window.addEventListener('pagehide',onPageHide);
  video.src='assets/art/entrance.mp4';start();
}
