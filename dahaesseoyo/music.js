(function(root){
'use strict';
const sources={3:'assets/music/sun-tree.mp3',4:'assets/music/cloud-clock.mp3',5:'assets/music/coral-garden.mp3',6:'assets/music/star-gate.mp3'},regions=[null,sources[3],sources[4],sources[5],sources[6]],audio=new Audio();audio.loop=true;audio.preload='none';
let enabled=true,active=false,quiet=false,current='';try{enabled=localStorage.getItem('thinkstar-music')!=='off';}catch{}
function play(){if(enabled&&active&&!document.hidden)audio.play().catch(()=>{});else audio.pause();}
function update(region,view){const src=region===0?sources[root.ThinkstarGrade]:regions[region];active=!!src;quiet=view==='activity';audio.volume=quiet?.09:.2;if(src&&src!==current){current=src;audio.src=src;}play();}
document.addEventListener('pointerdown',play);document.addEventListener('keydown',play);document.addEventListener('visibilitychange',play);
root.ThinkstarMusic={update,enabled:()=>enabled,label:()=>enabled?'♫ 소리 켜짐':'♫ 소리 꺼짐',available:()=>!!sources[root.ThinkstarGrade],toggle(){enabled=!enabled;try{localStorage.setItem('thinkstar-music',enabled?'on':'off');}catch{}play();}};
})(globalThis);
