function suffixOf(search=''){const qa=new URLSearchParams(search).get('qa');return qa!==null?'-qa-'+qa.slice(0,40):'';}
export function prototypeKeys(search=''){
 const suffix=suffixOf(search);
 return ['joseon-first-mission-3d-v1','joseon3d-chapter-2','joseon3d-chapter-3','joseon3d-chapter-4','joseon3d-chapter-5','joseon3d-chapter-6','joseon3d-chapter-7','joseon3d-chapter-8'].map(k=>k+suffix);
}
export function visitKey(search=''){return 'joseon3d-visit'+suffixOf(search);}
// Chapter-1 optional village errands live in their own key; the 8-key prototypeKeys contract is unchanged.
export function sidequestKey(search=''){return 'joseon3d-ch1-sidequests'+suffixOf(search);}
// Even reading the localStorage getter throws under strict privacy settings; callers get null and keep playing.
export function safeStorage(){try{const s=globalThis.localStorage;return s&&typeof s.getItem==='function'?s:null;}catch{return null;}}
// Sound preferences use their own key. It is not in prototypeKeys, so records, scores and restart stay untouched.
export function soundKey(search=''){return 'joseon3d-sound'+suffixOf(search);}
export function readSoundSettings(storage,search=''){const d={bgm:true,steps:true,fx:true};try{const v=JSON.parse(storage.getItem(soundKey(search))||'null');for(const k of Object.keys(d))if(typeof v?.[k]==='boolean')d[k]=v[k];}catch{}return d;}
export function saveSoundSettings(storage,search='',patch={}){try{storage.setItem(soundKey(search),JSON.stringify({...readSoundSettings(storage,search),...patch}));return true;}catch{return false;}}
export function readVisit(storage,search=''){
 try{const v=JSON.parse(storage.getItem(visitKey(search))||'null');const n=Number(v?.chapter);return Number.isInteger(n)&&n>=1&&n<=8?{chapter:n}:null;}catch{return null;}
}
export function recordVisit(storage,search='',chapter=1){
 try{storage.setItem(visitKey(search),JSON.stringify({chapter,at:Date.now()}));return true;}catch{return false;}
}
export function bindRestart(button,notice){
 const dialog=document.createElement('dialog');
 dialog.setAttribute('aria-labelledby','prototype-restart-title');
 dialog.style.width='min(520px,92vw)';
 dialog.innerHTML='<h2 id="prototype-restart-title">처음부터 시작할까요?</h2><p>이 시범판의 1~8장 진행 기록과 점수를 지웁니다.<br>기존 공개 조선 게임의 기록은 지워지지 않습니다.</p><p id="prototype-restart-error" role="status"></p><div style="display:flex;gap:10px"><button id="prototype-restart-cancel" autofocus>취소</button><button id="prototype-restart-confirm">기록 지우고 처음부터</button></div>';
 document.body.append(dialog);
 const error=dialog.querySelector('#prototype-restart-error');
 dialog.querySelector('#prototype-restart-cancel').onclick=()=>dialog.close();
 dialog.addEventListener('keydown',event=>event.stopPropagation());
 dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});
 button.onclick=()=>{
  error.textContent='';
  if(!dialog.open)dialog.showModal();
 };
 dialog.querySelector('#prototype-restart-confirm').onclick=()=>{
  try{for(const key of [...prototypeKeys(location.search),visitKey(location.search),sidequestKey(location.search)])localStorage.removeItem(key);}
  catch{error.textContent='기록을 지우지 못했어요. 브라우저 저장 설정을 확인해 주세요.';notice(error.textContent);return;}
  location.href='./'+location.search;
 };
}
