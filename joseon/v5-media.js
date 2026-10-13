'use strict';
(()=>{
let generation=0;const active=new Set();
const closeGuards=new Set();
// v21: every playIn list is tracked as a session from its first clip until the 650ms end fade has finished. The last clip
// leaves `active` as soon as it ends or is closed, so this set is what lets releaseIn(host)/cancel() still drop the pending
// onDone during that fade. A host reused for a new list therefore never receives the previous list's completion.
const sessions=new Set();
function endSessions(root){for(const s of sessions)if(!root||!s.host.isConnected||root.contains(s.host))s.end();}
function syncCloseButton(){const dialog=document.querySelector('#dialog');for(const guard of closeGuards)if(!guard.host.isConnected)closeGuards.delete(guard);const playing=Boolean(dialog&&[...closeGuards].some(g=>dialog.contains(g.host)));dialog?.classList.toggle('video-playing',playing);if(playing&&document.activeElement?.classList.contains('dialog-close'))document.activeElement.blur();}
function guardCloseButton(host){const guard={host};closeGuards.add(guard);syncCloseButton();return()=>{closeGuards.delete(guard);syncCloseButton();};}
// v20: clips watched to the end are remembered by file path inside the game save (seenClips), so export/import and the QA
// save key carry the list with them. v21 keeps writing that list but no longer uses it to decide anything about the X:
// every clip, first viewing or not, gets the same close button after about two seconds of real playback.
const clipKey=v=>v.getAttribute('src')||v.querySelector('source')?.getAttribute('src')||'';
const memory={
 list(){const s=window.JOSEON?.state;if(!s)return null;if(!Array.isArray(s.seenClips))s.seenClips=[];return s.seenClips;},
 add(src){const l=this.list();if(!src||!l||l.includes(src))return;l.push(src);window.JOSEON.save?.();}
};
// v21: small, light close mark at the clip's top-right. The <button> itself is the 44px touch area; the visible glyph is smaller.
function closeButton(host,onClose){const b=document.createElement('button');b.type='button';b.className='clip-close21';b.setAttribute('aria-label','영상 닫기');b.innerHTML='<span aria-hidden="true">×</span>';b.onclick=e=>{e.preventDefault();e.stopPropagation();onClose();};host.append(b);return b;}
// Inline <video> elements (performance, winter) get a positioned wrapper for the close button; the reward film is already positioned.
function closeHost(v){const film=v.closest('.reward-film7,.seen-video-wrap20');if(film)return film;const w=document.createElement('div');w.className='seen-video-wrap20';v.replaceWith(w);w.append(v);return w;}
// v21: counts real playback of one clip and creates the close button once about `seconds` of it have passed. Progress is
// measured from currentTime deltas between timeupdate events, so loading, buffering and pauses add nothing; deltas that
// arrive while the tab is hidden are dropped and the mark is re-synced when it becomes visible again. A delta is never
// discarded just because it is large: on a busy main thread the first timeupdate may arrive after 2-3 seconds of
// genuine playback and must still count. Seeks are recognised by the element's own seeking/seeked events (the
// post-seek timeupdate is dropped and the mark moves to the new position); reloads reset the mark through
// emptied/loadedmetadata. Nothing is drawn before the threshold. Returns stop(): it cancels the counter and removes the
// button, and every playback session calls it from its own settle/teardown so a cancelled or replaced clip can never
// reveal a button or run onClose late. onClose is still guarded by the caller's own settled flag.
function revealClose(v,host,onClose,seconds=2){
 const ac=new AbortController(),opt={signal:ac.signal};let mark=v.currentTime,played=0,button=null,stopped=false,seekPending=false;
 const stop=()=>{if(stopped)return;stopped=true;ac.abort();button?.remove();button=null;};
 const resync=()=>{mark=v.currentTime;seekPending=false;};
 const tick=()=>{if(stopped||button)return;const now=v.currentTime,delta=now-mark;mark=now;if(document.hidden||seekPending||v.seeking||!(delta>0))return;played+=delta;if(played<seconds)return;if(!v.isConnected||!host.isConnected)return stop();button=closeButton(host,()=>{if(stopped)return;stop();onClose();});};
 v.addEventListener('timeupdate',tick,opt);
 v.addEventListener('seeking',()=>{seekPending=true;},opt);
 for(const type of ['playing','seeked','loadedmetadata','emptied'])v.addEventListener(type,resync,opt);
 document.addEventListener('visibilitychange',resync,opt);
 return stop;
}
// Every playback session (playIn clip, watch, hold) stores its own teardown on the element so that cancel/releaseIn can stop
// its timers, listeners and pending completion callbacks even while the host is still in the DOM.
function detach(v){v._progressGuard?.stop();const teardown=v._teardown;delete v._teardown;teardown?.();v.onended=null;v.onerror=null;v.onpause=null;v.onloadedmetadata=null;}
function cancel(){window.JOSEON_FX11?.stopRain();generation++;endSessions(null);for(const v of active){detach(v);v.pause();v.removeAttribute('src');v.load();v.closest('.cinema-layer')?.remove();}active.clear();closeGuards.clear();syncCloseButton();}
function available(keys){return (Array.isArray(keys)?keys:[keys]).map(k=>JOSEON_MEDIA_MANIFEST.clips[k]).filter(Boolean);}
// Shared progress watchdog. A clip counts as stalled only when it should be advancing (not paused, not ended, tab visible)
// and currentTime has not moved for `ms`. Clips waiting for a user tap or sitting in a hidden tab never count, so long
// clips that keep playing are never cut short. Stops itself once the clip ends, leaves the page or leaves `active`.
function guardProgress(v,onStall,onResume,ms=15000){
 const ac=new AbortController(),opt={signal:ac.signal};let timer=null,mark=v.currentTime,flagged=false,stopped=false;
 const stop=()=>{if(stopped)return;stopped=true;ac.abort();clearTimeout(timer);timer=null;if(v._progressGuard===guard)delete v._progressGuard;};
 const arm=()=>{clearTimeout(timer);timer=stopped?null:setTimeout(check,ms);};
 const moved=()=>{if(v.currentTime===mark)return false;mark=v.currentTime;if(flagged){flagged=false;onResume?.();}return true;};
 const check=()=>{timer=null;if(stopped)return;if(!v.isConnected||!active.has(v)||v.ended)return stop();if(moved()||v.paused||document.hidden)return arm();if(!flagged){flagged=true;onStall?.();}arm();};
 v.addEventListener('timeupdate',()=>{if(moved())arm();},opt);
 v.addEventListener('playing',()=>{mark=v.currentTime;arm();},opt);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){mark=v.currentTime;arm();}},opt);
 const guard={stop,reset(){flagged=false;mark=v.currentTime;arm();}};v._progressGuard=guard;arm();return guard;
}
// Load errors arrive on the video itself for `src`, but on the last <source> child when sources are used.
function onMediaError(v,handler,opt){v.addEventListener('error',()=>handler(),opt);v.querySelectorAll('source').forEach(s=>s.addEventListener('error',()=>{if(v.networkState===HTMLMediaElement.NETWORK_NO_SOURCE||!s.nextElementSibling)handler();},opt));}
// play() rejections: AbortError = we interrupted it ourselves (load/pause/cancel), NotSupportedError = the media failed to load,
// anything else (NotAllowedError) = autoplay refused, wait for a tap. Returns null when nothing should be shown.
const playFault=err=>err?.name==='AbortError'?null:err?.name==='NotSupportedError'?'error':'play';
const troubleText=error=>error?'영상을 불러오지 못했어요. 다시 시도해 주세요.':'영상이 멈춘 것 같아요. 연결을 확인하고 다시 시도해 주세요.';
function playIn(host,keys,onDone,options={}){
 const clips=available(keys);if(!host||!clips.length){onDone?.();return false;}const stamp=generation;let i=0,layer=document.createElement('div');layer.className='cinema-layer';host.classList.add('cinema-host');host.append(layer);const releaseClose=guardCloseButton(host);
 // session.end() is the one teardown for the list as a whole: it stops any further clip, clears the end-fade timer, removes
 // the layer and the close guard, and forgets the session. It is idempotent and never calls onDone.
 let finished=false,fadeTimer=null;const session={host,end(){finished=true;clearTimeout(fadeTimer);fadeTimer=null;sessions.delete(session);layer.remove();releaseClose();}};sessions.add(session);
 const done=()=>{if(stamp!==generation||finished)return;finished=true;layer.classList.add('cinema-out');fadeTimer=setTimeout(()=>{fadeTimer=null;if(!sessions.has(session))return;sessions.delete(session);layer.remove();releaseClose();if(stamp===generation&&host.isConnected)onDone?.();},650);};
 const next=()=>{if(stamp!==generation||finished||!host.isConnected)return;const a=clips[i++];if(!a)return done();layer.innerHTML='<video autoplay muted playsinline preload="auto"></video>';const v=layer.querySelector('video');active.add(v);v.poster=a.poster||'';v.src=a.src;v.muted=true;let settled=false;
  const advance=()=>{if(settled||stamp!==generation)return;settled=true;guard.stop();stopClose();v.pause();active.delete(v);next();};
  const boxKind=()=>layer.querySelector('.cinema-play8')?.dataset.kind;
  const clearBox=kind=>{const box=layer.querySelector('.cinema-play8');if(box&&(!kind||box.dataset.kind===kind))box.remove();};
  const retry=reload=>{clearBox();if(reload)v.load();guard.reset();v.play().catch(err=>{const kind=playFault(err);if(kind)recover(kind);});};
  // kind: 'play' = autoplay refused (wait for a tap), 'error' = load failed, 'stall' = no playback progress.
  // A late play() rejection must never replace an error/stall box that already offers retry and the continue path.
  const recover=kind=>{if(settled||stamp!==generation||!v.isConnected)return;if(kind==='play'&&boxKind()&&boxKind()!=='play')return;clearBox();const error=kind!=='play';const box=document.createElement('div');box.className='cinema-play8';box.dataset.kind=kind;box.innerHTML=`<p>${error?troubleText(kind==='error'):'장면을 재생하려면 아래 버튼을 눌러 주세요.'}</p><button type="button">${error?'영상 다시 시도':'영상 재생하기 ▶'}</button>${error?'<button class="media-continue8" type="button">연결 오류 · 학습 계속하기</button>':''}`;layer.append(box);box.querySelector('button').onclick=()=>retry(kind==='error'||(kind==='stall'&&!v.currentTime));box.querySelector('.media-continue8')?.addEventListener('click',advance);};
  const guard=guardProgress(v,()=>recover('stall'),()=>clearBox('stall'));
  v.addEventListener('playing',()=>clearBox('play'));
  // v21: this clip's own close button appears after two seconds of its own playback and ends only this clip (advance moves
  // to the next clip in the list, which starts its own counter). The counter is per clip and stops with it.
  const stopClose=revealClose(v,layer,advance);
  v.onended=()=>{memory.add(a.src);advance();};onMediaError(v,()=>recover('error'));
  v._teardown=()=>{settled=true;guard.stop();stopClose();clearBox();};
  retry(false);};next();return true;
}
// Ordinary progression waits for the movie; load errors and stalled downloads offer a retry or a way to continue.
function watch(v,buttons){if(!v)return;v.controls=false;const releaseClose=guardCloseButton(v);active.add(v);const handlers=buttons.map(b=>b.onclick);buttons.forEach(b=>b.disabled=true);let complete=false;const ac=new AbortController(),opt={signal:ac.signal},src=clipKey(v);
 const waitText='이 장면을 본 뒤 다음으로 이어져요.';const note=document.createElement('span');note.className='video-wait8';note.textContent=waitText;buttons[0]?.before(note);
 const normal=()=>{note.removeAttribute('data-state');note.textContent=waitText;};
 const release=()=>{if(complete)return;complete=true;ac.abort();guard.stop();stopClose();v.onpause=null;releaseClose();active.delete(v);buttons.forEach((b,i)=>{b.disabled=false;b.onclick=handlers[i];});note.remove();};
 // v21: the positioned wrapper is prepared before playback starts; the close button itself is created only after two
 // seconds of real playback and ends just this clip, unlocking the following buttons.
 const stopClose=revealClose(v,closeHost(v),()=>{release();v.pause();});
 const showPlay=()=>{if(complete||note.dataset.state)return;note.dataset.state='play';note.innerHTML='<button class="secondary" type="button">영상 재생하기 ▶</button>';note.querySelector('button').onclick=()=>v.play().then(normal).catch(()=>{});};
 const failed=err=>{const kind=playFault(err);if(kind==='error')showTrouble(true);else if(kind)showPlay();};
 const showTrouble=error=>{if(complete)return;note.dataset.state=error?'error':'stall';note.innerHTML=`<span>${troubleText(error)}</span><button class="secondary" type="button">영상 다시 시도</button><button class="secondary media-continue8" type="button">연결 오류 · 학습 계속하기</button>`;note.querySelector('button').onclick=()=>{normal();if(error||!v.currentTime)v.load();guard.reset();v.play().catch(failed);};note.querySelector('.media-continue8').onclick=()=>{v.pause();release();};};
 const guard=guardProgress(v,()=>showTrouble(false),()=>{if(note.dataset.state==='stall')normal();});
 v.addEventListener('ended',()=>{memory.add(src);release();},opt);onMediaError(v,()=>showTrouble(true),opt);
 v.onpause=()=>{if(!complete&&v.paused&&!v.ended)showPlay();};
 // Screen replaced or cancelled: unlock quietly, drop the notice and stop listening. No further UI changes afterwards.
 v._teardown=release;
 v.play().catch(failed);
}
function hold(host,key,seen,onDone){
 const a=available(key)[0];if(!host||!a){onDone?.();return;}
 const v=document.createElement('video');v.className='scene-loop scene-hold11';v.muted=true;v.playsInline=true;v.loop=false;v.preload='auto';v.poster=a.poster||'';host.prepend(v);active.add(v);const releaseClose=seen?()=>{}:guardCloseButton(v);
 let done=false,guard=null,metaTimer=null,stopClose=()=>{};const clearBox=kind=>{const box=host.querySelector('.hold-trouble11');if(box&&(!kind||box.dataset.kind===kind))box.remove();host.querySelector('.hold-retry11')?.remove();};
 // settle() ends the session exactly once: metadata timer, progress guard, close counter and media handlers are cleared together.
 const settle=()=>{if(done)return false;done=true;clearTimeout(metaTimer);metaTimer=null;guard?.stop();stopClose();v.onended=null;v.onerror=null;v.onloadedmetadata=null;v.onpause=null;v.pause();releaseClose();return true;};
 const release=()=>{if(settle())onDone?.();};
 const drop=()=>{active.delete(v);clearBox();v.remove();release();};
 // v21: a real viewing can be closed after two seconds of playback, leaving the still picture. The seen=true path only
 // holds the last frame and never plays, so it gets no button.
 if(!seen)stopClose=revealClose(v,host,drop);
 const showPlay=()=>{if(done||host.querySelector('.hold-retry11,.hold-trouble11'))return;const b=document.createElement('button');b.className='hold-retry11';b.type='button';b.textContent='영상 재생하기 ▶';host.append(b);b.onclick=()=>v.play().then(()=>b.remove()).catch(()=>{});};
 const failed=err=>{const kind=playFault(err);if(kind==='error')trouble(true);else if(kind)showPlay();};
 const trouble=error=>{if(done||!v.isConnected)return;clearBox();const box=document.createElement('div');box.className='hold-trouble11';box.dataset.kind=error?'error':'stall';box.innerHTML=`<p>${troubleText(error)}</p><button type="button">영상 다시 시도</button><button class="media-continue8" type="button">연결 오류 · 학습 계속하기</button>`;host.append(box);box.querySelector('button').onclick=()=>{clearBox();if(error||!v.currentTime)v.load();guard?.reset();v.play().catch(failed);};box.querySelector('.media-continue8').onclick=drop;};
 v.onended=()=>{memory.add(a.src);release();};v.onerror=()=>{if(seen)drop();else trouble(true);};
 v.onloadedmetadata=()=>{if(seen){v.currentTime=Math.max(0,v.duration-.05);release();}};
 // Cancelled or screen replaced: end without calling onDone and remove any retry/trouble UI left in the host.
 v._teardown=()=>{settle();clearBox();};
 v.src=a.src;
 if(seen){metaTimer=setTimeout(()=>{if(!done&&v.isConnected)drop();},15000);return;}
 guard=guardProgress(v,()=>trouble(false),()=>clearBox('stall'));
 v.onpause=()=>{if(!done&&v.paused&&!v.ended&&!host.querySelector('.hold-trouble11'))showPlay();};
 v.play().catch(failed);
}
window.JOSEON_MEDIA={cancel,playIn,hold,intro:playIn,available,seenClips(){return [...(memory.list()||[])];},releaseIn(root){if(!root)return;endSessions(root);for(const guard of closeGuards)if(!guard.host.isConnected||root.contains(guard.host))closeGuards.delete(guard);syncCloseButton();for(const v of active)if(!v.isConnected||root.contains(v)){detach(v);v.pause();v.removeAttribute('src');v.load();active.delete(v);}},question(host,keys){if(!host||!available(keys).length)return;const body=host.parentElement,nodes=[...body.querySelectorAll('.quiz-question,.answers,.actions')];nodes.forEach(n=>n.classList.add('cinema-pending'));playIn(host,keys,()=>nodes.forEach(n=>n.classList.remove('cinema-pending')));},loop(host,key){const a=available(key)[0];if(!host||!a)return;const v=document.createElement('video');v.className='scene-loop';v.src=a.src;v.muted=true;v.loop=true;v.autoplay=true;v.playsInline=true;host.prepend(v);active.add(v);v.play().catch(()=>{active.delete(v);v.remove();});},once(root,key,keys,draw){root._seenClips||=new Set();if(root._seenClips.has(key)||!available(keys).length)return false;root._seenClips.add(key);root.innerHTML='<div class="mission-cinema cinema-host"></div>';playIn(root.firstElementChild,keys,()=>{if(root.isConnected)draw();});return true;}};

let unlocked=false,current=-1,player=null,fadeTimer=null,battlePlayer=null,battleActive=false;const players=new Set();
function sync(){const G=window.JOSEON;if(!G||!unlocked||!G.state.settings.sound||document.hidden){for(const p of players)p.pause();battlePlayer?.pause();return;}if(battleActive){for(const p of players)p.pause();battlePlayer.volume=Math.min(.6,G.state.settings.volume*.75);battlePlayer.play().catch(()=>{});return;}battlePlayer?.pause();if(player){player.volume=Math.min(.65,G.state.settings.volume*.8);player.play().catch(()=>{});}}
function battle(on){if(on===battleActive)return;clearInterval(fadeTimer);battleActive=on;if(on){battlePlayer||=new Audio('assets/audio/naval-battle.mp3');battlePlayer.loop=true;battlePlayer.currentTime=0;}sync();}
function chapter(ch){const index=Math.floor(ch/2),a=JOSEON_MEDIA_MANIFEST.music[index];if(!a||!unlocked)return;if(index===current){sync();return;}clearInterval(fadeTimer);for(const p of players)if(p!==player){p.pause();players.delete(p);}current=index;const old=player;player=new Audio(a.src);players.add(player);player.loop=true;player.preload='auto';player.volume=0;if(window.JOSEON?.state.settings.sound&&!document.hidden)player.play().catch(()=>{});let tick=0;const fresh=player;fadeTimer=setInterval(()=>{tick++;const goal=(window.JOSEON?.state.settings.volume||0)*.8;fresh.volume=Math.max(0,Math.min(.65,goal*tick/20));if(old)old.volume=Math.max(0,old.volume*.78);if(tick>=20){clearInterval(fadeTimer);if(old){old.pause();players.delete(old);}sync();}},60);}
window.JOSEON_MEDIA.watch=watch;
window.JOSEON_MUSIC={chapter,sync,battle,unlock(ch){unlocked=true;chapter(ch);sync();},snapshot(){return {group:current,src:player?.src,paused:player?.paused,battle:battleActive,battlePaused:battlePlayer?.paused};}};
document.addEventListener('visibilitychange',sync);addEventListener('pagehide',()=>{for(const p of players)p.pause();battlePlayer?.pause();cancel();});
})();
