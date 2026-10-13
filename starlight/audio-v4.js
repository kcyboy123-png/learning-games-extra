'use strict';
// Original Suno tracks supplied by the owner. Files are served with the game.
window.STAR_AUDIO_TRACKS={exploration:'assets/audio/exploration.mp3',challenge:'assets/audio/challenge.mp3',ending:'assets/audio/ending.mp3'};
window.installAudioV4=function(G){
 let ctx,master,scene='title',unlocked=false,lastTap=0;const playing=new Set();
 const music=new Audio();music.id='starlight-bgm';music.preload='none';music.hidden=true;music.setAttribute('playsinline','');document.body.appendChild(music);
 let musicGain,musicSource,currentTrack=null,pendingTrack=null,swapTimer,duckTimer,duckUntil=0,endingFinished=false,pageHidden=false,playRequest=0;
 const positions=new Map();
 function ensure(){try{ctx||=new(window.AudioContext||window.webkitAudioContext)();if(!master){master=ctx.createGain();master.connect(ctx.destination);}if(ctx.state==='suspended')ctx.resume().catch(()=>{});master.gain.value=G.state.sfxVolume;return true;}catch{return false;}}
 function tone(context,out,frequency,start,duration,volume=.14,type='sine',endFrequency){const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,start);if(endFrequency)o.frequency.exponentialRampToValueAtTime(endFrequency,start+duration);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.009);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(out);o.start(start);o.stop(start+duration+.02);if(context===ctx){playing.add(o);o.onended=()=>{playing.delete(o);o.disconnect();g.disconnect();};}}
 function noise(context,out,start,duration,volume,cutoff){const length=Math.ceil(context.sampleRate*duration),buffer=context.createBuffer(1,length,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.value=volume;source.connect(filter);filter.connect(gain);gain.connect(out);source.start(start);if(context===ctx){playing.add(source);source.onended=()=>{playing.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};}}
 function render(context,out,kind,at){
  const notes=(freqs,step=.1,dur=.24,volume=.11)=>freqs.forEach((f,i)=>tone(context,out,f,at+i*step,dur,volume));
  if(kind==='alarm'){[0,.28,.56].forEach(t=>{tone(context,out,90,at+t,.22,.12,'triangle',55);noise(context,out,at+t,.1,.08,500);});tone(context,out,220,at+.8,.55,.075,'triangle',165);}
  else if(kind==='tap')tone(context,out,620,at,.075,.06,'triangle',360);
  else if(kind==='tick'){tone(context,out,1100,at,.035,.026,'triangle',700);noise(context,out,at,.018,.018,3200);}
  else if(kind==='page')noise(context,out,at,.1,.07,1700);
  else if(kind==='arrow'){noise(context,out,at,.11,.11,4500);tone(context,out,1250,at+.08,.19,.12,'sine',1050);}
  else if(kind==='hammer'){tone(context,out,320,at,.2,.15,'triangle',155);tone(context,out,1280,at,.26,.045);noise(context,out,at,.065,.11,2900);}
  else if(kind==='water'){noise(context,out,at,.2,.11,950);tone(context,out,360,at+.03,.17,.06,'sine',200);}
  else if(kind==='brush')noise(context,out,at,.13,.065,2300);
  else if(kind==='stone'){noise(context,out,at,.22,.12,480);tone(context,out,120,at,.2,.09,'triangle',70);}
  else if(kind==='oops')notes([330,294],.12,.24,.09);
  else if(kind==='correct')notes([523,659,784],.11,.3,.12);
  else if(kind==='star')notes([1047,1319,1568],.07,.3,.09);
  else if(kind==='region')notes([523,659,784,1047,1319],.14,.45,.11);
  else if(kind==='ending'){notes([392,523,659,784,1047],.2,.7,.1);[262,330,392,523].forEach(f=>tone(context,out,f,at+1.1,1.5,.07));}
  else notes([523,659,784,1047],.11,.33,.12);
 }
 function play(kind){if(!G.state.sound||document.hidden||!ensure())return;if(kind==='tap'&&performance.now()-lastTap<55)return;if(kind==='tap')lastTap=performance.now();render(ctx,master,kind,ctx.currentTime+.005);if(['correct','win','region','ending','oops'].includes(kind)){duckUntil=performance.now()+(kind==='ending'?2700:950);clearTimeout(duckTimer);updateMusic();duckTimer=setTimeout(updateMusic,kind==='ending'?2750:1000);}}
 function stop(){playing.forEach(n=>{try{n.stop();}catch{}});playing.clear();}
 const wantedTrack=()=>STAR_AUDIO_TRACKS[scene==='ending'?'ending':'exploration'];
 const wantedVolume=()=>G.state.musicVolume*(scene==='tutorial'?.20:scene==='review'?.55:1)*(performance.now()<duckUntil?.4:1);
 function connectMusic(){if(!ensure()||musicSource)return;try{musicGain=ctx.createGain();musicGain.gain.value=0;musicSource=ctx.createMediaElementSource(music);musicSource.connect(musicGain);musicGain.connect(ctx.destination);}catch{musicGain=null;}}
 // A separate gain keeps BGM volume independent of effects, including on mobile Safari.
 function fadeMusic(value,seconds=.3){if(musicGain){const gain=musicGain.gain;gain.cancelScheduledValues(ctx.currentTime);gain.setValueAtTime(gain.value,ctx.currentTime);gain.linearRampToValueAtTime(value,ctx.currentTime+seconds);music.volume=1;}else music.volume=value;}
 function cancelSwap(){clearTimeout(swapTimer);pendingTrack=null;playRequest++;}
 function resumeMusic(){if(!music.paused){fadeMusic(wantedVolume());return;}const request=++playRequest;music.play().then(()=>{if(request===playRequest&&!music.paused)fadeMusic(wantedVolume(),.55);}).catch(()=>{});}
 function updateMusic(){
  const track=wantedTrack();
  if(!track||!unlocked||!G.state.music||document.hidden||pageHidden||scene==='title'||(scene==='ending'&&endingFinished)){cancelSwap();music.pause();fadeMusic(0,0);return;}
  connectMusic();
  if(pendingTrack===track)return;
  if(currentTrack!==track){
   const fading=!!currentTrack&&!music.paused;cancelSwap();pendingTrack=track;
   const switchTrack=()=>{pendingTrack=null;positions.set(currentTrack,music.currentTime||0);music.pause();currentTrack=track;music.src=track;music.loop=scene!=='ending';music.currentTime=scene==='ending'?0:(positions.get(track)||0);fadeMusic(0,0);resumeMusic();};
   if(fading){fadeMusic(0,.18);swapTimer=setTimeout(switchTrack,190);}else switchTrack();
  }else{if(pendingTrack)cancelSwap();music.loop=scene!=='ending';resumeMusic();}
 }
 function setScene(next){if(next==='ending'&&scene!=='ending'){endingFinished=false;positions.delete(STAR_AUDIO_TRACKS.ending);if(currentTrack===STAR_AUDIO_TRACKS.ending)music.currentTime=0;}scene=next;music.dataset.scene=scene;updateMusic();}
 music.addEventListener('ended',()=>{if(scene==='ending')endingFinished=true;});
 const unlock=()=>{unlocked=true;if(G.state.sound)ensure();updateMusic();};document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
 // Unlocks audio from the tutorial's click only; the saved music on/off and volume stay as the student left them.
 function enableOpeningSound(){unlocked=true;ensure();}
 const visibility=()=>{if(document.hidden||pageHidden){stop();updateMusic();ctx?.suspend().catch(()=>{});}else{if(unlocked&&(G.state.sound||G.state.music))ctx?.resume().catch(()=>{});updateMusic();}};
 document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',()=>{pageHidden=true;visibility();});window.addEventListener('pageshow',()=>{pageHidden=false;visibility();});
 document.addEventListener('click',e=>{if(e.target.closest('#nav-regions,#nav-museum,#nav-journal,#nav-settings,[data-region],#back-museum'))play('page');});
 function settings(){return `<div class="setting-row"><div><strong>효과음</strong><p>물소리·망치질·발견·정답·엔딩의 소리</p></div><button class="btn light small" id="sound-toggle" aria-pressed="${G.state.sound}">${G.state.sound?'켜짐':'꺼짐'}</button></div><div class="setting-row"><label for="sfx-volume">효과음 크기</label><div class="audio-setting"><input class="audio-volume" id="sfx-volume" type="range" min="0" max="100" value="${Math.round(G.state.sfxVolume*100)}"><output id="sfx-value">${Math.round(G.state.sfxVolume*100)}%</output></div></div>${Object.values(STAR_AUDIO_TRACKS).some(Boolean)?`<div class="setting-row"><strong>배경음악</strong><button class="btn light small" id="music-toggle" aria-pressed="${G.state.music}">${G.state.music?'켜짐':'꺼짐'}</button></div><div class="setting-row"><label for="music-volume">배경음악 크기</label><div class="audio-setting"><input class="audio-volume" id="music-volume" type="range" min="0" max="100" value="${Math.round(G.state.musicVolume*100)}"><output id="music-value">${Math.round(G.state.musicVolume*100)}%</output></div></div>`:''}`;}
 function bindSettings(){const sound=document.querySelector('#sound-toggle');sound.onclick=()=>{G.state.sound=!G.state.sound;G.save();sound.textContent=G.state.sound?'켜짐':'꺼짐';sound.setAttribute('aria-pressed',String(G.state.sound));if(G.state.sound)play('star');else stop();};const volume=document.querySelector('#sfx-volume');volume.oninput=()=>{G.state.sfxVolume=+volume.value/100;document.querySelector('#sfx-value').textContent=volume.value+'%';if(master)master.gain.value=G.state.sfxVolume;G.save();};volume.onchange=()=>play('tap');const toggle=document.querySelector('#music-toggle');if(toggle){toggle.onclick=()=>{G.state.music=!G.state.music;G.save();toggle.textContent=G.state.music?'켜짐':'꺼짐';toggle.setAttribute('aria-pressed',String(G.state.music));updateMusic();};const v=document.querySelector('#music-volume');v.oninput=()=>{G.state.musicVolume=+v.value/100;document.querySelector('#music-value').textContent=v.value+'%';G.save();updateMusic();};}}
 G.audio={play,stop,setScene,enableOpeningSound,settings,bindSettings,renderEffect:render,status:()=>({context:ctx?.state||'not-started',sound:G.state.sound,scene,bgmAvailable:Object.values(STAR_AUDIO_TRACKS).some(Boolean),bgmPlaying:!music.paused,track:currentTrack,position:music.currentTime,endingFinished,activeSounds:playing.size})};
};
