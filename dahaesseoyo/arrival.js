(function(root){
'use strict';
let audio, last=0;
const muted=()=>root.ThinkstarMusic?.enabled?.()===false;
function unlock(){if(muted())return;try{audio??=new (root.AudioContext||root.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
root.ThinkstarSound={play(kind){
 if(muted()||document.hidden)return;unlock();if(!audio||audio.state!=='running'||audio.currentTime-last<.15)return;last=audio.currentTime;
 const notes={enter:[330,495],correct:[659,880],capture:[523,659,784,1047],mythic:[392,523,659,784,1047]}[kind];if(!notes)return;
 notes.forEach((hz,i)=>{const t=audio.currentTime+i*.1,o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.setValueAtTime(hz,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.035,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(gain);gain.connect(audio.destination);o.start(t);o.stop(t+.24);});
}};
const reduced=()=>root.matchMedia('(prefers-reduced-motion: reduce)').matches;
function get(key){try{return sessionStorage.getItem(key);}catch{return null;}}
function set(key,value){try{sessionStorage.setItem(key,value);}catch{}}
function opening(){
 if(get('adventure-opening-v1')||reduced())return;set('adventure-opening-v1','seen');
 const layer=document.createElement('section');layer.className='adventure-opening';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','다했어요! 모험도감 오프닝');layer.setAttribute('aria-modal','true');
 layer.innerHTML='<video muted playsinline autoplay preload="auto" aria-label="도감 속에서 친구들과 네 세계가 펼쳐지는 오프닝" src="assets/video/adventure-opening.mp4"></video><div class="opening-title"><p>다 했어요? 이제 나의 모험을 시작해요.</p><h1>다했어요! 모험도감</h1></div><button class="opening-skip">바로 시작하기 →</button>';
 const app=document.getElementById('app'),previous=document.activeElement;app.inert=true;document.body.append(layer);const video=layer.querySelector('video'),button=layer.querySelector('button');let finished=false;
 const close=()=>{if(finished)return;finished=true;clearTimeout(fallback);video.pause();layer.remove();app.inert=false;if(previous?.isConnected&&previous!==document.body)previous.focus();else document.querySelector('.grade-card,.brand')?.focus();};
 const fallback=setTimeout(close,7500);video.addEventListener('ended',close,{once:true});video.addEventListener('error',close,{once:true});button.addEventListener('click',close);layer.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();button.focus();}});button.focus();video.play().catch(close);
}
document.addEventListener('DOMContentLoaded',()=>{
 if(get('adventure-arriving')==='yes'){set('adventure-arriving','');if(!reduced()){const app=document.getElementById('app');app.classList.add('map-materialize');setTimeout(()=>app.classList.remove('map-materialize'),1100);}}
 opening();
});
let travelling=false;
root.addEventListener('pageshow',()=>{travelling=false;document.querySelector('.time-tunnel')?.remove();});
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a.grade-card[href]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button)return;
 if(travelling){event.preventDefault();return;}if(reduced())return;event.preventDefault();travelling=true;set('adventure-arriving','yes');root.ThinkstarSound.play('enter');
 const layer=document.createElement('div');layer.className='time-tunnel';layer.setAttribute('role','status');layer.innerHTML='<i></i><i></i><i></i><p>새로운 세계로 출발!</p>';document.body.append(layer);setTimeout(()=>root.location.assign(link.href),950);
});
})(globalThis);
