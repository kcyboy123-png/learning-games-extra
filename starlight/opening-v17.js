'use strict';
window.installOpeningV14=function(G){
 let current=null;
 const SEEN='starlight-departure-v19',limited=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData;
 // A short wordless departure: Lumi's existing clip and one line, then the map. Music follows the student's own setting.
 function depart(onComplete,{replay=false}={}){
  if(current)return;
  G.audio?.enableOpeningSound();
  const previous=document.activeElement,dialog=document.createElement('dialog'),events=new AbortController();
  let closed=false,timer=null,still=false;
  dialog.id='opening-scene';dialog.setAttribute('aria-labelledby','opening-title');
  dialog.innerHTML=`<div class="opening-backdrop" aria-hidden="true"></div><video id="opening-video" playsinline muted preload="auto" poster="assets/lumi-opening-v14.jpg" aria-label="시간의 문 앞에서 출발을 준비하는 루미"></video><div class="opening-shade" aria-hidden="true"></div><header class="opening-heading"><h2 id="opening-title">루미와 시간여행을 떠나자!</h2></header><footer class="opening-footer"><div class="opening-actions"><button type="button" id="opening-skip">${replay?'닫기':'바로 출발'} <span aria-hidden="true">→</span></button></div><div class="opening-progress" aria-hidden="true"><span></span></div></footer>`;
  document.body.append(dialog);current=dialog;
  const video=dialog.querySelector('video'),progress=dialog.querySelector('.opening-progress span'),on=(el,type,handler)=>el.addEventListener(type,handler,{signal:events.signal});
  function finish(){if(closed)return;closed=true;clearTimeout(timer);events.abort();video.pause();video.removeAttribute('src');video.load();dialog.close();dialog.remove();current=null;document.documentElement.classList.remove('opening-active');if(!replay)try{localStorage.setItem(SEEN,'seen');}catch{}if(previous?.isConnected)previous.focus({preventScroll:true});onComplete();}
  // Reduced motion or a clip that cannot play shows the still picture briefly, then continues on its own.
  function hold(ms){clearTimeout(timer);if(!document.hidden)timer=setTimeout(finish,ms);}
  function showStill(){if(closed||still)return;still=true;dialog.classList.add('still');video.pause();video.removeAttribute('src');video.load();hold(2500);}
  function watch(){if(still)return;clearTimeout(timer);if(!document.hidden)timer=setTimeout(showStill,4000);}
  function play(){watch();video.play()?.catch(()=>{if(!closed&&!document.hidden)showStill();});}
  on(video,'playing',()=>{if(!still)clearTimeout(timer);});on(video,'waiting',watch);on(video,'error',showStill);on(video,'ended',finish);
  on(video,'timeupdate',()=>{progress.style.width=Math.min(100,video.currentTime/5*100)+'%';if(video.currentTime>=5)finish();});
  on(dialog.querySelector('#opening-skip'),'click',finish);
  on(dialog,'cancel',e=>{e.preventDefault();finish();});
  on(document,'visibilitychange',()=>{if(document.hidden){clearTimeout(timer);if(!still)video.pause();}else if(still)hold(2500);else play();});
  document.documentElement.classList.add('opening-active');dialog.showModal();dialog.querySelector('#opening-skip').focus({preventScroll:true});
  // The exploration song starts here and simply continues into the map; a replay from the title stays quiet.
  if(!replay)G.audio?.setScene('opening');
  if(limited()){still=true;dialog.classList.add('still');hold(3500);}else{video.src='assets/lumi-opening-v14.mp4';play();}
 }
 // The earlier narrated guide (about 44 seconds) now opens from ‘놀이 방법’ and returns to the same music scene.
 const steps=[['태블릿은 가로로, 휴대폰은 세로로!','편한 방향으로 루미와 함께 출발하자.'],['길을 톡 눌러 이동','화면 아래 화살표로도 걸을 수 있어.'],['느낌표 친구에게 미션 받기','반짝이는 숨은 별빛도 찾아보자.'],['1,000점에서 시작','첫 성공 +10점 · 오답 −10점 · 힌트 −3점'],['미션 3개 다음은 기억 3문제!','기억까지 완성한 뒤 다음 나라로 떠나자.'],['별빛 박물관을 완성하자','모든 미션과 기억 문제를 끝내면 엔딩이 기다려!']];
 function guide(onClose=()=>{}){
  if(current)return;
  G.audio?.enableOpeningSound();
  const back=G.audio?.status().scene||'title',previous=document.activeElement,dialog=document.createElement('dialog'),events=new AbortController();
  let closed=false,timer=null,userPaused=false,resumeVisible=false,failed=false,narration=true;
  dialog.id='tutorial-scene';dialog.setAttribute('aria-labelledby','tutorial-title');
  dialog.innerHTML=`<header><div><small>루미가 알려 주는 놀이 방법</small><h2 id="tutorial-title">함께 떠날 준비됐어?</h2></div><span class="tutorial-length">짧은 안내 · 소리 없이도 볼 수 있어요</span></header><div class="tutorial-screen"><video playsinline preload="none" poster="assets/lumi-opening-v14.jpg" aria-label="루미의 초대와 실제 게임 조작을 보여 주는 놀이 안내 영상"></video><div class="tutorial-fallback" hidden><img src="assets/lumi.png" alt="안내하는 루미"><ol>${steps.map(([a,b])=>`<li><strong>${a}</strong><span>${b}</span></li>`).join('')}</ol></div></div><footer><p class="device-orientation-guide" aria-label="권장 화면 방향"><span>태블릿·PC는 <strong>가로로</strong></span><span>휴대폰은 <strong>세로로</strong></span></p><p id="tutorial-status" role="status">안내 영상을 여는 중…</p><div class="tutorial-buttons"><button class="btn light" id="tutorial-pause">일시정지</button><button class="btn light" id="tutorial-voice" aria-pressed="${narration}">설명 소리 ${narration?'켜짐':'꺼짐'}</button><button class="btn light" id="tutorial-music" aria-pressed="${G.state.music}">음악 ${G.state.music?'켜짐':'꺼짐'}</button><button class="btn gold" id="tutorial-start">안내 닫기</button></div></footer>`;
  document.body.append(dialog);current=dialog;const video=dialog.querySelector('video'),status=dialog.querySelector('#tutorial-status'),pause=dialog.querySelector('#tutorial-pause');
  const on=(el,event,handler)=>el.addEventListener(event,handler,{signal:events.signal});
  function music(){G.audio?.setScene(!video.paused&&!failed?'tutorial':back);}
  function finish(){if(closed)return;closed=true;clearTimeout(timer);events.abort();video.pause();video.removeAttribute('src');video.load();dialog.close();dialog.remove();current=null;document.documentElement.classList.remove('opening-active');G.audio?.setScene(back);if(previous?.isConnected)previous.focus({preventScroll:true});onClose();}
  function fallback(message){if(closed||failed)return;failed=true;clearTimeout(timer);video.pause();video.removeAttribute('src');video.load();video.hidden=true;dialog.querySelector('.tutorial-fallback').hidden=false;pause.textContent='영상으로 보기';status.textContent=message;music();}
  function watch(){clearTimeout(timer);if(!document.hidden&&!userPaused)timer=setTimeout(()=>fallback('영상 대신 그림 안내를 읽어 봐!'),8000);}
  function resume(){failed=false;userPaused=false;video.hidden=false;dialog.querySelector('.tutorial-fallback').hidden=true;if(!video.getAttribute('src'))video.src='assets/tutorial-v17.mp4?v=harin-20261006';if(video.ended)video.currentTime=0;watch();video.play()?.catch(()=>{if(closed||failed)return;clearTimeout(timer);pause.textContent='재생';status.textContent='재생을 누르면 설명이 시작돼.';music();});}
  on(video,'playing',()=>{clearTimeout(timer);pause.textContent='일시정지';status.textContent='길 누르기 → 미션 3개 → 여행의 기억 3문제';music();});
  on(video,'waiting',watch);on(video,'error',()=>fallback('그림 안내를 읽어 봐!'));on(video,'ended',finish);
  on(pause,'click',()=>{if(video.paused)resume();else{userPaused=true;resumeVisible=false;clearTimeout(timer);video.pause();pause.textContent='계속 보기';status.textContent='천천히 읽어 봐. 준비되면 계속 보자!';music();}});
  on(dialog.querySelector('#tutorial-start'),'click',finish);
  on(dialog.querySelector('#tutorial-voice'),'click',e=>{narration=!narration;video.muted=!narration;e.currentTarget.textContent='설명 소리 '+(narration?'켜짐':'꺼짐');e.currentTarget.setAttribute('aria-pressed',String(narration));});
  on(dialog.querySelector('#tutorial-music'),'click',e=>{G.state.music=!G.state.music;G.save();e.currentTarget.textContent='음악 '+(G.state.music?'켜짐':'꺼짐');e.currentTarget.setAttribute('aria-pressed',String(G.state.music));music();});
  on(dialog,'cancel',e=>{e.preventDefault();finish();});
  on(document,'visibilitychange',()=>{if(document.hidden){resumeVisible=!video.paused&&!userPaused;clearTimeout(timer);video.pause();}else if(resumeVisible){resumeVisible=false;resume();}});
  document.documentElement.classList.add('opening-active');dialog.showModal();video.muted=!narration;video.volume=.9;pause.focus({preventScroll:true});
  if(limited())fallback('움직임을 줄인 그림 안내야. 원하면 영상으로 볼 수도 있어!');else resume();
 }
 G.opening={play:depart,guide,seenKey:SEEN};
};
