import {Ambience} from './audio.mjs';

// This small module starts before the 3D module graph has finished downloading.
export const ambience=new Ambience();
const button=document.querySelector('#loadingSound');
let observed=false;
function status(){
 const playing=ambience.on&&ambience.ctx?.state==='running'&&ambience.tracks.some(t=>!t.audio.paused&&t.audio.currentTime>0);
 button.textContent=playing?'♫ 숲 소리 재생 중':ambience.on?'♫ 눌러서 숲 소리 듣기':'♫ 소리 켜고 기다리기';
 button.disabled=playing;
}
function start(){
 ambience.unlock();
 if(ambience.ctx&&!observed){observed=true;ambience.ctx.addEventListener('statechange',status);for(const {audio} of ambience.tracks)for(const event of ['playing','timeupdate','pause','error'])audio.addEventListener(event,status);}
 status();
}
button.onclick=()=>{if(!ambience.on)ambience.toggle();start();};
for(const event of ['pointerdown','keydown'])document.addEventListener(event,e=>{if(e.isTrusted&&!e.repeat)start();},{capture:true});
start();
