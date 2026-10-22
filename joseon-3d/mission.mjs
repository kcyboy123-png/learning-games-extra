import {scenes} from './story.mjs';
import {SAVE_KEY,fresh,restore,score,mistake} from './progress.mjs';
const names=['family','farmer','temple'];
const $=s=>document.querySelector(s);
export function createMission({pause,resume,changed,notice,onExplore,onRecords}){
 const qa=new URLSearchParams(location.search).get('qa');
 const saveKey=SAVE_KEY+(qa!==null?'-qa-'+qa.slice(0,40):'');
 let p;try{p=restore(localStorage.getItem(saveKey));}catch{p=fresh();}
 const dialog=$('#dialog');let cleanup=()=>{},selected=-1;
 // A failed save is also shown inside the dialog, because the status line sits behind the modal while the result is read.
 let saved=true;const unsavedNote=()=>saved?'':'<p class="note" role="status">저장 공간을 사용할 수 없어 이 기록은 새로고침하면 사라져요. 지금 화면에서는 이어져요.</p>';
 function save(){try{localStorage.setItem(saveKey,JSON.stringify(p));saved=true;}catch{saved=false;notice('저장 공간을 사용할 수 없어 이번 탐험은 이 화면에서만 이어져요.');}changed(p);}
 function show(html){cleanup();cleanup=()=>{};dialog.classList?.remove('family-question');dialog.innerHTML=html;if(!dialog.open){pause();dialog.showModal();}dialog.scrollTop=0;dialog.setAttribute("tabindex","-1");dialog.focus();}
 function release(){cleanup();cleanup=()=>{};resume();changed(p);}
 function close(){if(dialog.open)dialog.close();else release();}
 dialog.addEventListener('close',release);
 dialog.addEventListener('cancel',e=>e.preventDefault());
 function button(id,fn){$('#'+id).onclick=fn;}
 function back(){return '<button id="back" class="quiet">마을로 돌아가기</button>';}
 function video(key,next,title){
  show(`<div class="cinema"><video playsinline muted autoplay preload="auto" poster="assets/story/${key}.${key==='highfive'?'webp':'jpg'}" src="assets/story/${key}.mp4"></video><span class="film-title">${title}</span><button id="skip" aria-label="영상 닫고 계속하기" hidden>×</button><button id="retry" hidden>영상 재생하기</button></div>`);
  const v=dialog.querySelector('video');let finished=false,played=0,last=0,seeking=false,wall=performance.now();
  const finish=()=>{if(finished)return;finished=true;next();};
  const timer=setTimeout(()=>{if(!finished){$('#retry').hidden=false;$('#retry').textContent='영상 연결이 늦어져요 · 그림으로 계속';$('#retry').onclick=finish;}},15000);
  // The close button appears after one second of actual playback: seeks, pauses and hidden tabs do not count.
  // Browsers stop timeupdate while a tab is hidden, so the reference point is re-armed on every
  // visibility change (and after seeks): the first event back in the foreground counts nothing.
  const rearm=()=>{last=v.currentTime;wall=performance.now();};
  v.onended=finish;v.onplay=rearm;v.onseeking=()=>{seeking=true;rearm();};v.onseeked=()=>{seeking=false;rearm();};document.addEventListener('visibilitychange',rearm);
  v.ontimeupdate=()=>{const now=performance.now(),delta=v.currentTime-last;if(!v.paused&&!v.seeking&&!seeking&&!document.hidden&&delta>0)played+=Math.min(delta,(now-wall)/1000+.1);last=v.currentTime;wall=now;if(played>=1)$('#skip').hidden=false;};
  v.onerror=()=>{$('#retry').textContent='영상을 불러오지 못했어요 · 그림으로 계속';$('#retry').hidden=false;$('#retry').onclick=finish;};
  button('skip',finish);button('retry',()=>{v.play().then(()=>{if(!finished&&v.isConnected)$('#retry').hidden=true;}).catch(()=>{if(finished||!v.isConnected)return;$('#retry').textContent='그림으로 계속';$('#retry').onclick=finish;});});
  v.play().catch(()=>{if(!finished&&v.isConnected)$('#retry').hidden=false;});
  cleanup=()=>{finished=true;clearTimeout(timer);document.removeEventListener('visibilitychange',rearm);v.onended=null;v.ontimeupdate=null;v.onplay=null;v.onseeking=null;v.onseeked=null;v.onerror=null;v.pause();};
 }
 function penalty(key){if(p.complete)return '완성한 기록을 다시 살펴봐요. 복습에는 감점이 없어요.';const deducted=mistake(p,key);if(deducted){save();dialog.querySelector('.penalty')?.remove();const el=document.createElement('span');el.className='penalty pop';el.textContent='−10점';dialog.append(el);el.addEventListener('animationend',()=>el.remove());}return deducted?'다시 단서를 살펴봐요. −10점':'다시 단서를 살펴봐요. 같은 답에는 추가 감점이 없어요.';}
 const encountered=new Set();
 function explore(i){close();onExplore?.(i);}
 function scene(i){if(p.done.includes(i)){result(i);return;}if(encountered.has(i)){explore(i);return;}encountered.add(i);video(names[i],()=>explore(i),scenes[i].name);}
 function fieldQuestion(i){
  if(p.done.includes(i)){result(i);return;}
  const s=scenes[i];selected=-1;
  show(`<div class="sheet-head"><div><span class="eyebrow">고려 말 · 사람들의 이야기</span><h2>${s.name}</h2></div>${back()}</div><p class="voice" aria-live="polite">“${s.voice}”</p><section class="question"><img class="question-context" src="assets/story/${names[i]}.jpg" alt="${s.name}에서 살펴본 상황"><p class="question-help">살펴본 두 단서를 떠올려요. 알맞은 까닭을 하나 고르고 아래 확인 버튼을 눌러요.</p><h3>${s.question}</h3><div id="choices">${s.options.map((o,k)=>`<button class="choice" data-answer="${k}" aria-pressed="false">${o}</button>`).join('')}<p id="feedback" role="status"></p><button id="submit" disabled>이 까닭으로 기록하기</button><small>답을 확정해서 틀렸을 때 −10점</small></div></section>`);
  dialog.classList.add('family-question');button('back',close);
  for(const b of dialog.querySelectorAll('[data-answer]'))b.onclick=()=>{selected=Number(b.dataset.answer);dialog.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#submit').disabled=false;};
  button('submit',()=>{if(selected<0)return;if(selected!==s.a){$('#feedback').textContent=penalty(`scene${i}:${selected}`);return;}if(!p.done.includes(i))p.done.push(i);save();result(i);});
 }
 function result(i){const s=scenes[i];show(`<div class="record-result"><span class="eyebrow">찾아낸 기록 ${p.done.length}/3</span><h2>${s.reason}</h2><img src="assets/story/${names[i]}.jpg" alt="${s.name}"><p>${s.why}</p>${unsavedNote()}<button id="next">${p.done.length===3?'모든 기록 모아 보기':'기록장에 담고 마을로'}</button></div>`);button('next',p.done.length===3?continueRecords:close);}
 function continueRecords(){if(onRecords&&!p.complete){close();onRecords(gather);}else gather();}
 function gather(){show(`<div class="record-result"><span class="eyebrow">세 사람의 목소리 · 하나의 기록</span><h2>사람들의 이야기가<br>첫 기록으로 이어졌어요.</h2><div class="records">${scenes.map((s,i)=>`<article><img src="assets/story/${names[i]}.jpg" alt=""><strong>${s.reason}</strong></article>`).join('')}</div><button id="next">1392년으로 이어 보기 →</button></div>`);button('next',()=>video('founding',founding,'1392 · 조선의 시작'));}
 function founding(){show(`<div class="record-result"><span class="eyebrow">1392</span><h2>조선의 시작</h2><img src="assets/story/founding.jpg" alt="조선 건국을 표현한 창작 장면"><p>이성계와 일부 신진 사대부가 고려를 무너뜨리고 조선을 세웠어요.<br>새 나라는 유교를 바탕으로 다스리고자 했어요.</p><button id="next">조선의 첫 기록 확인하기 →</button></div>`);button('next',record);}
 function record(){selected=-1;const options=['이순신과 각지에서 모인 의병','이성계와 일부 신진 사대부','중국을 오가던 사신과 보부상'];show(`<div class="record-result"><span class="eyebrow">기록 완성하기</span><h2>알맞은 말 조각을 골라요.</h2><img src="assets/story/founding.jpg" alt="조선의 시작"><p class="sentence">유교를 바탕으로 조선을 세운 세력은<br><strong id="blank">어떤 사람들이었을까요?</strong>입니다.</p><div class="record-options">${options.map((o,k)=>`<button data-answer="${k}" aria-pressed="false">${o}</button>`).join('')}</div><p id="feedback" role="status"></p><button id="submit" disabled>기록 완성하기</button></div>`);
  dialog.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.answer);$('#blank').textContent=options[selected];dialog.querySelectorAll('[data-answer]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#submit').disabled=false;});
  button('submit',()=>{if(selected!==1){$('#feedback').textContent=penalty(`record:${selected}`);return;}p.complete=true;save();video('highfive',finish,'조선의 기록 한 장을 완성했어요');});
 }
 function finish(review=false){show(`<div class="record-result celebration"><span class="eyebrow">첫 번째 기록 완성</span><h2>새 나라가 필요한 까닭</h2><img src="assets/story/highfive.webp" alt="별하와 먹동이가 함께 축하해요"><p>이성계와 일부 신진 사대부는<br>유교를 바탕으로 조선을 세웠어요.</p><strong class="score">집중 점수 ${score(p)}점</strong><p class="note">이 시범판의 첫 미션을 마쳤어요.<br>${review?"1392년, 조선의 시작에 도착했어요.":"이제 대문 앞 시간문이 열렸어요. 마을 대문으로 가 보세요."}<br>기존 조선 게임의 학습 기록과는 별도로 저장됩니다.</p>${unsavedNote()}<button id="next">${review?"도착 마당으로 돌아가기":"대문 앞 시간문으로 가기"}</button></div>`);button('next',close);}
 return {state:()=>p,score:()=>score(p),scene,fieldQuestion,start(){close();},review(){finish(true);},continue:continueRecords};
}

