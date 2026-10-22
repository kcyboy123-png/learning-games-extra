import {restoreChapter} from './chapter-lessons.mjs';
import {restore as restoreFirst} from './progress.mjs';
import {readVisit,recordVisit,safeStorage} from './reset-progress.mjs';
export const chapterNames=['새 나라의 시작','세종의 뜰','사람들의 하루','전쟁과 사람들','움직이는 마을','새로운 생각','문화가 꽃피다','새 시대의 문턱'];
export function menuURL(n,search='') { const q=new URLSearchParams(search);q.delete('chapter');if(n!==1)q.set('chapter',n);return (n===1?'./':'chapter.html')+(q.size?'?'+q:''); }
export function readMenuProgress(storage,search=''){
 const qa=new URLSearchParams(search).get('qa'),suffix=qa!==null?'-qa-'+qa.slice(0,40):'';
 return chapterNames.map((_,i)=>{try{const raw=storage.getItem((i===0?'joseon-first-mission-3d-v1':'joseon3d-chapter-'+(i+1))+suffix);JSON.parse(raw||'null');const p=i===0?restoreFirst(raw):restoreChapter(i+1,raw);return i===0?(p.complete?'첫 기록 완성':'첫 기록 탐험'):p.missions.filter(m=>m.complete).length+'/4 기록';}catch{return '기록 확인 불가';}});
}
export function bindGameMenu({chapter=1,pause=()=>{},resume=()=>{},notice=()=>{}}={}){
 const opener=document.createElement('button');opener.id='game-menu-open';opener.textContent='☰ 메뉴';opener.setAttribute('aria-haspopup','dialog');
 const jump=document.createElement('button');jump.id='menu-jump';jump.textContent='다른 시간으로 이동하기';jump.setAttribute('aria-haspopup','dialog');
 const actions=document.createElement('div');actions.className='header-actions';actions.append(jump,opener);
 document.querySelector('header').append(actions);
 const dialog=document.createElement('dialog');dialog.id='game-menu';dialog.setAttribute('aria-labelledby','game-menu-title');
 dialog.innerHTML=`<div class="menu-heading"><div><span class="eyebrow">조선 기록원정대</span><h2 id="game-menu-title">여행자의 수첩</h2></div><button id="menu-close" autofocus>계속 탐험하기 ×</button></div>
 <div class="menu-creator"><img src="assets/changyong-profile-v2.jpg" alt="창용쌤의 파란 용 로고"><div><strong>창용쌤이 만든 역사 학습 모험</strong><p>관찰하고, 생각하고, 직접 기록하는 시간여행</p></div></div>
 <div class="menu-settings"><button id="menu-motion" aria-pressed="false"></button><button id="menu-fullscreen">화면 크게 보기</button></div>
 <section class="menu-current" aria-label="현재 목표"><b>지금의 발걸음</b><p id="menu-goal"></p></section>
 <details open><summary>이동과 조사 방법</summary><p>방향키·WASD 또는 화면의 ↑ ← ↓ →로 걸어요. 가고 싶은 길이나 사람의 이름표를 눌러도 돼요. 가까이서 <b>E</b> 또는 대화 버튼으로 이야기해요. 시점은 별하를 따라 움직여요.</p><p>미션은 원하는 순서로 할 수 있어요. 각 미션의 마지막 기록까지 마친 뒤 <b>여행의 기억 3문제</b>를 풀면 다음 시간문이 열려요. 1장은 세 사람의 이야기를 모으는 첫 미션 체험이에요.</p></details>
 <details><summary>점수와 저장 안내</summary><p>각 장은 1,000점으로 시작해요. 미션 기록을 완성하면 +10점, 새로운 오답을 확정하면 −10점이에요. 같은 답의 중복 감점은 막아 두었어요. 수군 훈련은 5척을 놓쳐 실패한 도전마다 −10점이에요.</p><p>맞힌 활동과 완성 기록은 <b>이 기기·이 브라우저에 자동 저장</b>돼요. 아직 확인하지 않은 선택이나 진행 중인 훈련은 저장되지 않아요. 비공개 모드·브라우저 데이터 삭제·다른 기기로 이동하면 이어지지 않을 수 있어요. 기존 공개 게임의 기록과는 별도예요. 완성한 기록은 그 사람의 이름표를 다시 눌러 읽을 수 있어요.</p><p>배경음·효과음·눈 밟는 소리 설정은 기록과 별도의 설정으로 이 브라우저에만 기억돼요. 소리가 없어도 모든 활동을 할 수 있어요.</p></details>
 <details id="menu-chapter-details"><summary>원하는 시대로 이동하기</summary><p>다른 장에 가도 확인된 기록은 남아요. 진행 중인 활동은 다시 시작할 수 있어요.</p><nav id="menu-chapters" aria-label="장 선택"></nav></details>
 <details><summary>수업과 화면 안내</summary><p>태블릿·PC는 가로, 휴대폰은 세로를 권장해요. 방향은 자유롭게 바꿔도 돼요. 움직임이 불편하면 ‘움직임 줄이기’를 켜 주세요. 메뉴를 연 동안 별하는 멈춰요.</p><p>마을과 대사는 학습을 위해 재구성했어요. 실제 유적의 배치를 그대로 복원한 것은 아니에요. 서로 다른 시기의 사건과 문물이 한 장에 함께 등장할 수 있으니 각 활동의 설명을 살펴봐요.</p></details>
 <div class="menu-footer"><a id="menu-home">이 장의 첫 화면</a><button id="menu-restart">처음부터 다시하기…</button></div><p id="menu-status" role="status"></p>`;
 document.body.append(dialog);let active=false,trigger=opener;
 const motion=document.querySelector('#motion'),status=dialog.querySelector('#menu-status'),chapterDetails=dialog.querySelector('#menu-chapter-details');
 const sync=()=>{const on=motion.getAttribute('aria-pressed')==='true';const b=dialog.querySelector('#menu-motion');b.setAttribute('aria-pressed',String(on));b.textContent='움직임 줄이기 · '+(on?'켜짐':'꺼짐');};
 const end=()=>{if(!active)return;active=false;resume();trigger.focus();};
 dialog.addEventListener('close',end);dialog.addEventListener('keydown',e=>e.stopPropagation());
 dialog.querySelector('#menu-close').onclick=()=>dialog.close();
 const open=(toChapters=false)=>{if(dialog.open)return;trigger=toChapters?jump:opener;status.textContent='';sync();dialog.querySelector('#menu-goal').textContent=[document.querySelector('#quest strong')?.textContent,document.querySelector('#distance')?.textContent].filter(Boolean).join(' · ')||'시간 속으로 들어가 사람들의 이야기를 살펴보세요.';let states;try{const store=safeStorage();states=store?readMenuProgress(store,location.search):chapterNames.map(()=>'저장 사용 불가');}catch{states=chapterNames.map(()=> '저장 사용 불가');}
 dialog.querySelector('#menu-chapters').innerHTML=chapterNames.map((n,i)=>`<a href="${menuURL(i+1,location.search).replaceAll('&','&amp;').replaceAll('"','&quot;')}" data-n="${i+1}" ${i+1===chapter?'aria-current="page"':''}>${i+1}장 · ${n}<small>${states[i]}</small></a>`).join('');
 active=true;pause();dialog.showModal();
 if(toChapters){for(const d of dialog.querySelectorAll('details'))d.open=d===chapterDetails;chapterDetails.scrollIntoView({block:'start'});(chapterDetails.querySelector('a[aria-current]')||chapterDetails.querySelector('a')||chapterDetails.querySelector('summary')).focus();}};
 opener.onclick=()=>open();jump.onclick=()=>open(true);
 dialog.querySelector('#menu-chapters').addEventListener('click',e=>{const a=e.target.closest('a[data-n]');if(a)recordVisit(safeStorage(),location.search,Number(a.dataset.n));});
 dialog.querySelector('#menu-motion').onclick=()=>{motion.click();sync();};
 dialog.querySelector('#menu-home').href=menuURL(chapter,location.search);
 dialog.querySelector('#menu-restart').onclick=()=>{dialog.close();document.querySelector('#restart').click();};
 dialog.querySelector('#menu-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='이 브라우저에서는 전체화면을 지원하지 않아요. 기기를 가로로 돌려 더 넓게 볼 수 있어요.';}};
 document.addEventListener('fullscreenchange',()=>dialog.querySelector('#menu-fullscreen').textContent=document.fullscreenElement?'전체화면 끝내기':'화면 크게 보기');
 return {isOpen:()=>dialog.open};
}
export function startLabel(visit){return visit?'게임 이어하기':'게임 시작하기';}
// Storage is read through safeStorage(): a blocked localStorage getter must never stop the start button.
export function bindStart(button,chapter,begin){
 const store=safeStorage(),visit=readVisit(store,location.search);
 if(!visit)recordVisit(store,location.search,chapter);
 button.disabled=false;button.textContent=startLabel(visit);
 button.onclick=()=>{if(visit&&chapter===1&&visit.chapter!==1){location.href=menuURL(visit.chapter,location.search);return;}recordVisit(store,location.search,chapter);begin();};
}
