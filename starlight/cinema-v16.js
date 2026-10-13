'use strict';
window.installCinemaV16 = function (G) {
  const root = document.querySelector('#modal');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const media = {
    dolmen: {file:'dolmen-v16',label:'마을 사람들이 밧줄과 나무 받침을 이용해 함께 큰 돌을 옮기는 장면'},
    siege: {file:'siege-v16',label:'고구려 산성 밖으로 수나라군의 횃불과 깃발이 다가오는 장면'},
    stars: {file:'stars-v16',label:'잔디밭의 첨성대 앞에서 반짝이는 별을 바라보는 루미'},
    cheer: {file:'cheer-v16',label:'금빛 별이 빛나는 가운데 두 주먹을 들고 기뻐하는 루미'}
  };
  function withCleanup(dispose) {
    const previous=G.cleanupMission;
    G.cleanupMission=()=>{dispose();previous?.();};
  }
  function mount(stage,key,{autoplay=true,controls=true}={}) {
    const info=media[key],events=new AbortController();
    const video=document.createElement('video');
    video.className='cinema-video';video.muted=true;video.defaultMuted=true;
    video.playsInline=true;video.preload='none';
    video.poster=`assets/cinema/${info.file}.jpg`;
    video.setAttribute('aria-label',info.label);
    stage.prepend(video);stage.classList.add('cinema-stage');
    let alive=true,wanted=false,failed=false,userPaused=false,resumeVisible=false,timer,attempt=0;
    const limited=()=>reduced.matches||navigator.connection?.saveData;
    const button=document.createElement('button');
    button.type='button';button.className='cinema-toggle';button.textContent='장면 재생';
    button.setAttribute('aria-label','장면 재생');
    if(controls)stage.append(button);
    const status=document.createElement('span');status.className='cinema-status';status.setAttribute('role','status');
    if(controls)stage.append(status);
    const on=(target,type,handler)=>target.addEventListener(type,handler,{signal:events.signal});
    const label=(text)=>{button.textContent=text;button.setAttribute('aria-label',text);};
    function stop(){wanted=false;attempt++;clearTimeout(timer);video.pause();label(video.ended?'장면 다시 보기':'장면 재생');}
    function fallback(){
      if(!alive||failed)return;failed=true;stop();video.removeAttribute('src');video.load();
      status.textContent='그림으로 살펴보고 바로 도전해도 좋아요.';label('장면 다시 보기');
    }
    function watch(){clearTimeout(timer);if(wanted&&!document.hidden)timer=setTimeout(fallback,8000);}
    function play(explicit=false){
      if(!alive||document.hidden||limited()&&!explicit)return;
      wanted=true;userPaused=false;failed=false;const token=++attempt;
      if(!video.getAttribute('src'))video.src=`assets/cinema/${info.file}.mp4`;
      if(video.ended)video.currentTime=0;
      watch();video.play()?.then(()=>{if(!alive)return;if(token!==attempt)return;if(!wanted||document.hidden)video.pause();}).catch(()=>{
        if(!alive||token!==attempt)return;clearTimeout(timer);wanted=false;label('장면 재생');status.textContent='재생을 누르거나 바로 도전해요.';
      });
    }
    on(video,'playing',()=>{clearTimeout(timer);status.textContent='';label('장면 일시정지');});
    on(video,'waiting',watch);
    on(video,'ended',()=>{wanted=false;clearTimeout(timer);label('장면 다시 보기');});
    on(video,'error',fallback);
    on(button,'click',()=>{if(!video.paused){userPaused=true;resumeVisible=false;stop();}else play(true);});
    on(document,'visibilitychange',()=>{
      if(document.hidden){resumeVisible=wanted&&!userPaused;video.pause();clearTimeout(timer);}
      else if(resumeVisible&&!userPaused){resumeVisible=false;play();}
    });
    on(reduced,'change',()=>{if(reduced.matches){resumeVisible=false;stop();}});
    if(autoplay)play();
    return {
      video,
      setActive(active){if(active){if(!wanted&&!failed&&!userPaused&&!video.ended)play();}else if(wanted)stop();},
      reset(){stop();failed=false;userPaused=false;if(video.readyState)video.currentTime=0;},
      destroy(){if(!alive)return;alive=false;attempt++;events.abort();clearTimeout(timer);video.pause();video.removeAttribute('src');video.load();video.remove();button.remove();status.remove();}
    };
  }
  const scenes={
    GJ01:{key:'dolmen',className:'dolmen',title:'함께 끌자, 고인돌!',eyebrow:'고조선 · 온 마을의 힘',headline:'혼자서는 꿈쩍도 하지 않는 돌!',copy:'사람을 모으고, 하나 둘 함께 당겨 보자.',rule:'200명 모집 · 5초 안에 20번 끌기',action:'사람 모으러 가기',note:'운반 모습을 상상한 장면 · 200명은 이번 게임의 설정',badge:'힘을 모아!',sound:'stone'},
    GG01:{key:'siege',className:'siege',title:'고구려의 산성을 지켜!',eyebrow:'긴급 전령 · 612년',headline:'수나라가 공격해 왔다!',copy:'성 밖에 적의 횃불이 보여. 솔과 함께 산성을 지키자!',rule:'초록 구간에서 발사 · 10번 연속 명중',action:'활을 들고 산성 지키기',note:'수나라의 침입을 배경으로 한 가상의 산성 방어 장면',badge:'산성에 비상!',sound:'alarm'},
    SL03:{key:'stars',className:'stars',title:'첨성대 아래, 별빛의 밤',eyebrow:'신라 · 경주 첨성대',headline:'별빛을 따라, 하늘의 기록 속으로',copy:'옛 신라 사람들은 하늘의 변화를 살폈어.',rule:'흩어진 일곱 별을 이어 기록을 되찾자.',action:'별빛 기록 잇기',note:'첨성대 주변 잔디밭을 참고한 상상 장면 · 별 배치는 게임용',badge:'별빛의 밤',sound:'star'}
  };
  const oldIntro=G.showMissionIntro;
  G.showMissionIntro=(id,start)=>{
    const scene=scenes[id];if(!scene)return oldIntro(id,start);
    G.modal(scene.title,`<section class="cinema-story cinema-story-${scene.className}"><div class="cinema-view"><span class="cinema-badge">${scene.badge}</span><span class="cinema-scene-label">${scene.eyebrow}</span></div><div class="cinema-copy"><span class="cinema-eyebrow">${scene.eyebrow}</span><h3>${scene.headline}</h3><p>${scene.copy}</p><strong class="cinema-rule">${scene.rule}</strong><button class="btn gold" id="story-start">${scene.action}</button><small>${scene.note}</small></div></section>`,'루미의 시간 여행');
    root.classList.add('cinema-modal');
    const film=mount(root.querySelector('.cinema-view'),scene.key);
    withCleanup(()=>{film.destroy();root.classList.remove('cinema-modal');});
    root.querySelector('#story-start').onclick=start;
    G.sound(scene.sound);
  };
  const celebrate=G.celebrateRegion;
  G.celebrateRegion=(...args)=>{
    celebrate(...args);
    const stage=root.querySelector('.success-scene');
    if(!stage)return;
    stage.querySelector(':scope > img')?.remove();
    stage.classList.add('cinema-celebration');
    const film=mount(stage,'cheer');withCleanup(()=>film.destroy());
  };
  G.cinema={mountPull(stage){return mount(stage,'dolmen',{autoplay:false,controls:false});}};
};
