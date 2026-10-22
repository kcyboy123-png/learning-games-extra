import {safeStorage,readSoundSettings,saveSoundSettings} from './reset-progress.mjs';
const search=()=>globalThis.location?.search||'';
const videoPlaying=()=>[...document.querySelectorAll('video')].some(v=>!v.paused&&!v.ended);
// Dialogs opened by E, Enter or an automatic arrival never fire a click: watch the open attribute itself.
function watchDialogs(fn){try{if(typeof MutationObserver==='function')new MutationObserver(fn).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true});}catch{/* no observer: click/keydown/close listeners still run */}}
// Background music: starts only after the start button, pauses for any open dialog, playing video or hidden tab.
// A refused play() is reported on the button instead of pretending the music is on. The button always toggles the
// preference (so a failing track can still be switched off); the menu must stay silent, so the retry runs on close.
export function bindBackgroundAudio(chapter=1){
 const audio=document.createElement('audio');audio.id='village-music';audio.src=chapter===4?"assets/audio/snow-village.m4a":`assets/audio/journey-${Math.ceil(chapter/2)}.m4a`;audio.loop=true;audio.preload='none';audio.volume=1;document.body.append(audio);
 let started=false,muted=readSoundSettings(safeStorage(),search()).bgm===false,waiting=false,broken=false,attempt=0;
 const button=document.createElement('button');button.id='music-toggle';document.querySelector('#game-menu .menu-settings').append(button);
 function label(){button.textContent='배경음 · '+(broken?'파일을 불러오지 못했어요':muted?'꺼짐':waiting?'재생 못 함 · 메뉴를 닫으면 다시 시도':'켜짐');button.setAttribute('aria-pressed',String(!muted));}
 label();
 const blocked=()=>document.hidden||!!document.querySelector('dialog[open]')||videoPlaying();
 function sync(){
  if(!started||muted||blocked()||broken){audio.pause();return;}
  if(!audio.paused)return;
  const n=++attempt,result=audio.play();
  // Only the newest attempt may change the label; a pause() of ours rejects the old one with AbortError.
  if(result&&typeof result.then==='function')result.then(()=>{if(n!==attempt)return;if(waiting){waiting=false;label();}}).catch(error=>{if(n!==attempt||muted||broken||error?.name==='AbortError'||blocked())return;waiting=true;label();});
 }
 audio.addEventListener('error',()=>{broken=true;audio.pause();label();});
 document.querySelector('#start').addEventListener('click',()=>{started=true;sync();});
 button.onclick=()=>{muted=!muted;waiting=false;label();saveSoundSettings(safeStorage(),search(),{bgm:!muted});sync();};
 document.addEventListener('click',()=>queueMicrotask(sync));document.addEventListener('keydown',()=>queueMicrotask(sync));
 document.addEventListener('close',sync,true);document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')sync();},true);
 document.addEventListener('ended',sync,true);document.addEventListener('visibilitychange',sync);
 watchDialogs(sync);
 addEventListener('pagehide',()=>audio.pause());addEventListener('pageshow',()=>queueMicrotask(sync));
 return {sync};
}

// Short, quiet WebAudio cues for inspecting, completing a record and entering a time gate.
// No files, no network: three synthesized tones. Snow footsteps keep their own emitter; nothing here walks.
// Cues are skipped (never queued) while muted, before a user gesture, during a menu/restart dialog, a video or a hidden tab,
// and hush() cuts tones that are already sounding or scheduled when one of those states begins.
export function createFeedbackSounds({search:s=search(),storage=safeStorage(),isBlocked}={}){
 const Ctx=globalThis.AudioContext||globalThis.webkitAudioContext;
 let context,master,muted=readSoundSettings(storage,s).fx===false,lastAny=-1;const last={},gap={inspect:.25,record:.6,gate:1.5},live=new Set();
 function unlock(){if(!Ctx||muted)return;try{if(!context){context=new Ctx();master=context.createGain();master.gain.value=.8;master.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});}catch{/* silent play stays possible */}}
 function blocked(){return document.hidden||!!document.querySelector('#game-menu[open],dialog[aria-labelledby="prototype-restart-title"][open]')||videoPlaying();}
 const blockedNow=()=>isBlocked?isBlocked():blocked();
 function hush(){if(!context||!master)return;try{const t=context.currentTime;master.gain.cancelScheduledValues?.(t);master.gain.setValueAtTime(0,t);for(const o of live){try{o.stop(t);}catch{/* already stopped */}}live.clear();}catch{/* nothing audible to cut */}}
 function tone(t,type,f0,f1,dur,peak,delay=0){const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+delay);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+delay+dur);g.gain.setValueAtTime(0,t+delay);g.gain.linearRampToValueAtTime(peak,t+delay+.015);g.gain.exponentialRampToValueAtTime(.0008,t+delay+dur);o.connect(g);g.connect(master);live.add(o);o.onended=()=>{live.delete(o);o.disconnect();g.disconnect();};o.start(t+delay);o.stop(t+delay+dur+.02);}
 const cues={
  inspect(t){tone(t,'triangle',640,480,.09,.05);},
  record(t){tone(t,'sine',523,523,.22,.06);tone(t,'sine',784,784,.3,.05,.14);},
  gate(t){tone(t,'sine',196,588,1.1,.045);tone(t,'triangle',392,784,.9,.025,.2);}
 };
 function play(name){
  const cue=cues[name];if(!cue||muted||!context||blockedNow())return false;
  if(context.state!=='running'){unlock();return false;}
  const t=context.currentTime;if(t-lastAny<.12||t-(last[name]??-9)<gap[name])return false;
  lastAny=t;last[name]=t;try{master.gain.cancelScheduledValues?.(t);master.gain.setValueAtTime(.8,t);cue(t);}catch{return false;}return true;
 }
 return {play,unlock,hush,isBlocked:blockedNow,supported:()=>!!Ctx,isMuted:()=>muted,toggle(){muted=!muted;if(muted)hush();else unlock();return muted;}};
}
export function bindFeedbackSounds(opts={}){
 const sfx=createFeedbackSounds(opts);
 addEventListener('pointerdown',sfx.unlock,{passive:true});addEventListener('keydown',sfx.unlock);
 // Tones already sounding stop as soon as a menu, video or hidden tab would block new ones.
 const guard=()=>{if(sfx.isBlocked())sfx.hush();};
 document.addEventListener('visibilitychange',guard);document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')guard();},true);
 document.addEventListener('click',()=>queueMicrotask(guard));watchDialogs(guard);addEventListener('pagehide',sfx.hush);
 const button=document.createElement('button');button.id='effects-toggle';
 const label=()=>{button.textContent='효과음 · '+(!sfx.supported()?'이 브라우저에서 사용 불가':sfx.isMuted()?'꺼짐':'켜짐');button.setAttribute('aria-pressed',String(!sfx.isMuted()));};
 label();button.disabled=!sfx.supported();
 button.onclick=()=>{const muted=sfx.toggle();label();saveSoundSettings(opts.storage??safeStorage(),opts.search??search(),{fx:!muted});};
 document.querySelector('#game-menu .menu-settings')?.append(button);
 return sfx;
}
