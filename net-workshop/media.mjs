const $=id=>document.getElementById(id);
let muted=false,started=false,exited=false,timeout,successAt=0;
try{muted=localStorage.getItem('net-workshop-muted')==='true';}catch{}
const music=new Audio(),success=new Audio();music.preload='none';success.preload='none';music.loop=true;music.volume=.16;success.volume=.22;
const sound=document.createElement('button');sound.id='sound-toggle';sound.className='quiet';sound.type='button';
const sync=()=>{sound.textContent=muted?'소리 꺼짐':'소리 켜짐';sound.setAttribute('aria-pressed',String(!muted));sound.title=muted?'배경음악과 효과음 켜기':'배경음악과 효과음 끄기';sound.setAttribute('aria-label',muted?'소리 켜기':'소리 끄기');};sync();
const play=()=>{if(started&&!muted&&!document.hidden)music.play().catch(()=>{muted=true;sync();});};
sound.onclick=()=>{muted=!muted;try{localStorage.setItem('net-workshop-muted',String(muted));}catch{}if(muted){music.pause();success.pause();}else play();sync();};
export function playSuccess(complete=false){if(!started||muted||document.hidden||performance.now()-successAt<180)return;successAt=performance.now();success.currentTime=0;success.volume=complete?.28:.16;success.play().catch(()=>{});}
const dialog=$('entrance'),video=$('entrance-video');
const reducedMotion=()=>{try{if(localStorage.getItem('net-workshop-reduced')==='true')return true;}catch{}return matchMedia('(prefers-reduced-motion: reduce)').matches;};
function leave(){if(exited)return;exited=true;clearTimeout(timeout);video.pause();video.removeAttribute('src');video.load();dialog.close();document.body.classList.remove('entrance-open');document.dispatchEvent(new Event('close'));document.querySelector('header').inert=false;$('game-main').inert=false;document.querySelector('nav button[aria-pressed=true]')?.focus({preventScroll:true});}
function enter(silent=false){if(started)return;started=true;if(silent){muted=true;try{localStorage.setItem('net-workshop-muted','true');}catch{}}sync();music.src='media/music.mp3';success.src='media/success.mp3';play();if(reducedMotion()){leave();return;}dialog.classList.add('playing');$('skip-intro').hidden=false;$('skip-intro').focus();video.src='media/intro.mp4';video.play().catch(leave);timeout=setTimeout(leave,7000);}
video.addEventListener('ended',leave);video.addEventListener('error',()=>{if(started)leave();});$('enter-game').onclick=()=>enter();$('enter-silent').onclick=()=>enter(true);$('skip-intro').onclick=leave;dialog.addEventListener('cancel',e=>{e.preventDefault();if(!started)enter(true);leave();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){music.pause();success.pause();video.pause();}else{play();if(started&&!exited)video.play().catch(leave);}});window.addEventListener('pagehide',()=>{music.pause();success.pause();video.pause();});
window.addEventListener('pageshow',()=>{if(started&&exited)play();});
// Keep media optional: the lesson still starts if loading or playback fails.
window.addEventListener('nets-ready',()=>{document.querySelector('.topbar').append(sound);document.querySelector('header').inert=true;$('game-main').inert=true;document.body.classList.add('entrance-open');dialog.showModal();$('enter-game').focus();},{once:true});
