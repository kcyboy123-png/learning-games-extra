import {gradeNote,tierRules,developmentSummary,shortageNote} from './grading-ui.mjs?v=tier2';
import {tickResidents,syncResidents} from './residents.mjs?v=npc7';
// village-next B단계 입력·안내·저장·루프. 경제는 core, 좌표는 grid, 표현은 world에만 맡긴다.
import {World} from './world.mjs?v=npc7';
import {villagePromises,promisePreview} from './promises.mjs?v=late1';
import {assessTier,economy,upkeepOf,annualReviews,YEAR,createState,build,demolish,relocate,canRelocate,relocateLeft,advance,metrics,tier,month,duration,calendarMonth,monthLabel,serialize,parseSave,continueFree,buildCost,canBuild,at,cells,network,connected,TYPES,OPTIONS,MONTH,RULE,SCOPE,unlocked,unlockMonth,toggleClosed,harvest,upgrade,clearLandscape,HARVEST,HARVEST_SECONDS,DEMAND_MONTH} from './core.mjs?v=tier2';
import {toCell,toWorld,spots,placeInfo,facing,entrance,path,walkable,inside,CELL,perimeter,foot,roadSet} from './grid.mjs?v=animals8';
import {groundVector,inputVector,step} from './move.mjs?v=animals8';
import {naturalFeature,growthStage,isGarden} from './landscape.mjs?v=animals8';
import {PLAY_SPEED,realSeconds,season,SEASONS,TABS,TIERS} from './data.mjs?v=80min1';
import {KEY,BACKUP,OWNER,A_KEY} from './app-keys.mjs?v=animals8';
const EARLY=['house','road','snack']; // 초반 강조. 나머지는 해금되면 탭에 나타난다.
const SERVICE={health:['의료','clinic','hospital'],education:['교육','school','library'],leisure:['여가','kids','library']};
const $=id=>document.getElementById(id);
let state,storageOK=true,fromSave=false,corrupt=null,raw=null;
// localStorage 접근 자체가 막히면(SecurityError) 저장 기능 전체를 끈다. 읽을 수는 있지만 검증에 실패하면 손상 원본을 보존하고 덮어쓰지 않는다.
try{raw=localStorage.getItem(KEY);}catch(e){storageOK=false;console.warn('저장소에 접근할 수 없어요',e);}
if(raw){try{state=parseSave(raw);fromSave=true;}catch(e){corrupt=raw;console.warn('저장 기록을 읽지 못했어요',e);}}
if(!state)state=createState();
const TAB=Math.random().toString(36).slice(2)+Date.now().toString(36);let owned=false; // 6. 한 탭만 시간을 진행한다
await Promise.race([Promise.all([document.fonts.load('700 48px SUIT'),document.fonts.load('32px Wanted')]).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,3000))]);
let world;try{world=new World($('world'));window.__world=world;window.__vn={get state(){return state;},world};}catch(e){$('error').hidden=false;$('error').textContent='입체 화면을 열지 못했어요. WebGL을 지원하는 Chrome 또는 Edge에서 다시 열어주세요.';throw e;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let gardenSignature='';
let time=0,last=performance.now(),toastEnd=0,uiTick=0,lastMonth=month(state),mode=null,sel=null,infoId=null,npcs=[],bubble=null,reported=false,reviewShown=0;
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');toastEnd=time+4;}
// ---- 저장 ----
function save(reason=''){if(otherOwnerAlive()){owned=false;state.paused=true;$('saved').textContent='다른 탭 진행 중 · 저장 보호';return false;}if(!storageOK){$('saved').textContent='저장 불가';return false;}if(corrupt){$('saved').textContent='손상 기록 보호 중 · 저장 안 함';return false;}try{state.savedAt=Date.now();localStorage.setItem(KEY,serialize(state));$('saved').textContent='자동 저장됨'+(reason?' · '+reason:'');return true;}catch{storageOK=false;$('saved').textContent='저장 공간 확인 필요';toast('저장할 수 없어요. 저장 공간을 확인해 주세요.');return false;}}
function download(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([serialize(state)],{type:'application/json'}));a.download=`개울마을-${RULE}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);toast('마을 파일을 내보냈어요.');}
$('file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}try{const next=parseSave(await f.text());if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}if(storageOK&&localStorage.getItem(KEY))localStorage.setItem(BACKUP,localStorage.getItem(KEY));state=next;state.paused=true;corrupt=null;resetSession();if(save('불러옴'))toast('마을 파일을 불러왔어요. 이전 기록은 백업에 남겼어요.');else toast('파일은 열었지만 저장하지 못했어요. 내보내기로 보관해 주세요.');showPause();}catch(err){toast('불러오지 못했어요: '+err.message+' (원본은 그대로예요)');}};
// ---- 시간 표시 ----
const mmss=sec=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
function ui(){const m=month(state),v=metrics(state),grade=assessTier(state,undefined,v),t=tier(grade.total);
 $('calendar').textContent=`${state.mode==='free'?'자유 꾸미기':1+Math.floor(month(state)/12)+'년 차'} · ${SEASONS[season(calendarMonth(state))]} · ${monthLabel(state)}`;$('left').textContent=state.mode==='free'?'최종 기록은 그대로 보관돼요':state.ended?'종료':`남은 시간 ${mmss(realSeconds(duration(state)-state.t))}`;$('monthBar').style.width=`${(state.t%MONTH)/MONTH*100}%`;
 $('money').textContent=Math.floor(state.money).toLocaleString();$('pop').textContent=`${state.pop}명 / 집 ${v.housing}`;$('sat').textContent=Math.round(state.sat)+'%';$('score').textContent=grade.total;$('tierName').textContent=`${t[1]} · 발전 ${Math.round(v.D*100)} / 삶 ${Math.round(v.Q*100)}${grade.total<grade.rawTotal?' · 조건 제한':''}`;
 $('pause').textContent=state.paused?'▶ 재개':'❚❚ 일시정지';$('pause').disabled=state.ended;world.season(season(calendarMonth(state)));const note=['❄ 눈 덮인 겨울 · 따뜻한 집을 준비해요','🌸 벚꽃 피는 봄 · 새로운 이웃을 맞아요','☀ 초록이 짙은 여름 · 시원한 그늘을 만들어요','🍂 단풍 드는 가을 · 마을의 결실을 살펴요'][season(calendarMonth(state))];if($('seasonNote').textContent!==note)$('seasonNote').textContent=note;
 const hb=$('navHarvest');hb.disabled=state.ended||state.harvestAt!==null;hb.textContent=state.harvestAt!==null?`🥬 돌보는 중 ${realSeconds(HARVEST_SECONDS-(state.t-state.harvestAt))}초`:state.harvested.includes(m)?'🥬 이번 달 완료':`🥬 텃밭 돌보기 +${HARVEST}`;
 $('reviewYears').textContent=state.result&&(state.runMonths??12)<36?'이전 규칙 기록':`성장 기록 · ${Math.min(3,annualReviews(state).length)}/3`;
 need(v);if($('promisesPanel').classList.contains('open'))promiseCards();if($('statusPanel').classList.contains('open'))status(v);if(infoId!==null)info();}
// ---- 현재 필요 카드: 진행 불가 → 생활 수요 → 기금 → 여유 ----
function need(v){const b=$('needAction');let title,why,act=null,label='';const m=month(state),se=season(calendarMonth(state));
 const queue=state.buildings.filter(b=>b.progress<1),cut=state.buildings.find(b=>b.progress>=1&&!b.starter&&!['road','bridge'].includes(b.type)&&!b.closed&&!connected(state,b,v.net)),busy=t=>queue.some(b=>b.type===t);
 const cheapest=list=>list.filter(t=>unlocked(state,t)).sort((a,b)=>TYPES[a].cost-TYPES[b].cost)[0];const go=t=>{act=()=>startPlace(t);label=`${TYPES[t].name} 고르기 · ${TYPES[t].cost}`;};
 const lacking=Object.entries(SERVICE).find(([k])=>m>=DEMAND_MONTH[k]&&v[k+'Cap']<state.pop&&!queue.some(b=>TYPES[b.type][k]));
 const soon=Object.entries(SERVICE).find(([k])=>m===DEMAND_MONTH[k]-1&&v[k+'Cap']<state.pop&&!queue.some(b=>TYPES[b.type][k]));
 if(state.ended){title='마을의 세 해가 끝났어요';why='결과를 확인하고 마을을 자유롭게 둘러보세요.';}
 else if(state.scoringV===2&&state.cashStress>0&&v.income<v.upkeep&&state.money<v.upkeep-v.income){title='운영비 부족을 먼저 해결해요';why=shortageNote(state)+`. 월 순수입 ${Math.round(v.income-v.upkeep)}. 이용하지 않는 시설을 눌러 휴업해요.`;act=()=>{closePanels();$('statusPanel').classList.add('open');status(v);};label='운영비 확인';}
 else if(cut){title='길이 끊겼어요';why=`${TYPES[cut.type].name}이(가) 마을 입구와 이어지지 않아 이용하지 못해요. 산책길을 옆까지 이어 주세요.`;act=()=>{world.focus(cut.x,cut.y);startPlace('road');};label='산책길 잇기 · 12';}
 else if(v.energy<1&&!busy('solar')&&!busy('generator')){const t=state.money>=TYPES.generator.cost&&v.use-v.production>7?'generator':'solar';title='전력이 부족해요';why=`공급 ${Math.round(v.production)} / 소비 ${Math.round(v.use)}${se===0||se===2?' (겨울·여름은 수요 20%↑)':''}. 전력이 모자라면 만족도와 삶의 질이 내려가요. ${TYPES[t].name}(${TYPES[t].cost})을 지어 ${TYPES[t].e>0?`+${TYPES[t].e}`:''} 공급을 더해요.`;go(t);}
 else if(!state.buildings.some(b=>b.type==='snack')){title='동네에서 간단히 먹을 곳이 없어요';why=`식생활 ${Math.min(state.pop,v.foodCap)}/${state.pop} 충족. 분식집을 지으면 주민 16명이 먹을 수 있어요.`;go('snack');}
 else if(lacking){const[k,[name,...types]]=lacking,t=cheapest(types);title=`${name} 시설이 필요해요`;why=`${name} ${v[k+'Cap']}/${state.pop}명 충족. ${monthLabel(state,DEMAND_MONTH[k])}부터 평가 중이라 점수와 만족도가 내려가요.`;if(t)go(t);}
 else if(soon){const[k,[name,...types]]=soon,t=cheapest(types);title=`다음 달 ${name} 평가가 시작돼요`;why=`${monthLabel(state,m+1)}부터 ${name} 수요(${state.pop}명)를 평가해요. 지금 지어 두면 벌점 없이 맞출 수 있어요.`;if(t)go(t);}
 else if(calendarMonth(state)===5&&m>=3&&!v.drain&&!busy('drain')){title='비 오는 날을 준비해요';why=`7월 집중호우에 배수시설이 없으면 만족도가 내려가요. 지금 지으면 제때 완공돼요.`;go('drain');}
 else if(m>=5&&calendarMonth(state)>=7&&calendarMonth(state)<=8&&!v.fire&&!busy('fire')){title='안전 훈련을 준비해요';why=`9월 안전훈련에 소방서가 없으면 안전 점수와 만족도가 내려가요.`;go('fire');}
 else if(state.pop<v.popGoal&&v.housing<=state.pop&&!busy('house')&&!busy('apartment')){title='집이 부족해요';why=`살 집 ${v.housing}명분 / 주민 ${state.pop}명. 집을 늘리면 새 이웃을 맞을 수 있어요.`;go(unlocked(state,'apartment')&&state.money>=TYPES.apartment.cost&&state.pop>=20?'apartment':'house');}
 else if(v.foodCap<state.pop&&!queue.some(b=>TYPES[b.type].food)){const t=cheapest(['snack','convenience','japanese','western','chinese']);title='먹을 곳이 모자라요';why=`식생활 ${v.foodCap}/${state.pop}명. 가게를 하나 더 지으면 수입과 만족이 함께 올라요.`;go(t);}
 else if(v.income-v.upkeep<0){title='월 순수입이 마이너스예요';why=`수입 ${Math.round(v.income)} / 유지비 ${v.upkeep}. 이용률 낮은 시설을 눌러 휴업하면 유지비가 0이 돼요. 텃밭 돌보기(월 1회 +${HARVEST})도 도움이 돼요.`;act=()=>{closePanels();$('statusPanel').classList.add('open');status(v);};label='마을 현황 보기';}
 else if(state.money<120){title='기금이 모자라요';why=`120이 필요하고 지금 ${Math.floor(state.money)}이 있어요. 월 수입 ${Math.round(v.income-v.upkeep)}을 기다리거나 텃밭을 돌봐요(월 1회 +${HARVEST}).`;if(!state.harvested.includes(m)&&state.harvestAt===null){act=doHarvest;label=`텃밭 돌보기 +${HARVEST}`;}}
 else if(queue.length>=2){title='공사가 진행 중이에요';why=`${queue.length}곳 공사 중. 동시에 2곳까지 진행되고 나머지는 차례를 기다려요. 다음 자리를 미리 골라 둬도 좋아요.`;act=openBuild;label='다음 시설 고르기';}
 else if(v.landscaping.score<50&&m>=1){title='조경을 가꿔 봐요';why=`조경 점수 ${v.landscaping.score}. 집 가까이 꽃밭·가로수·벤치를 심으면 환경 점수가 올라요(과하면 상한).`;act=()=>openBuild('조경');label='조경 열기';}
 else if(state.economyV===2&&[11,23].includes(m)){title='다음 해 운영비를 준비해요';why=economyText()+' 이용률 낮은 시설은 휴업할 수 있어요.';act=()=>{closePanels();$('statusPanel').classList.add('open');status(v);};label='운영비 확인';}
 else if(m>=12&&villagePromises(state).some(p=>p.unlockIndex>=12&&!p.done)){title='자란 마을의 새 약속';why='개울 건너 생활권과 오래된 창고, 계절에 맞는 태양광을 살펴봐요.';act=()=>{closePanels();$('promisesPanel').classList.add('open');promiseCards();};label='후반 약속 보기';}
 else{title='우리 마을을 더 가꿔 볼까요?';why=state.mode==='run'&&m===(state.runMonths??12)-1?'마지막 달이에요. 남은 시간 안에 공사를 마쳐요.':`현재 목표는 주민 ${v.popGoal}명이 행복하게 사는 마을이에요. 집·생활 시설·정원을 균형 있게 늘려 보세요.`;act=openBuild;label='짓기 열기';}
 $('needTitle').textContent=title;$('needWhy').textContent=why;b.hidden=!act;b.textContent=label;b.onclick=act;}
function economyText(){const e=economy(state);return state.economyV===2?`새 마을 운영 규칙 · 현재 수입 ${e.income*100}% · 유지비 ${e.upkeep}배. 1년 차 100%/1배 → 2년 차 60%/1.5배 → 3년 차 40%/2배.`:'기존 작품은 이전 수입·유지비 규칙을 유지해요.';}
function status(v){const rows=[['운영 규칙',economyText()],['월 수입',Math.round(v.income)],['월 유지비',v.upkeep],['월 순수입',Math.round(v.income-v.upkeep)],['주민 / 집',`${state.pop} / ${v.housing}`],['현재 인구 발전 목표',`${state.pop} / ${v.popGoal}명 · 연차 상한 32→48→64명`],...(state.scoringV===2?[['재정 회복',shortageNote(state)]]:[]),['식생활',`${Math.min(state.pop,v.foodCap)} / ${state.pop}`],['의료 · 교육 · 여가',`${v.healthCap} · ${v.educationCap} · ${v.leisureCap} / ${state.pop}`],['전력',`${Math.round(v.production)} 공급 · ${Math.round(v.use)} 소비`],['조경 · 안전',`${v.landscaping.score} · ${v.fire?'소방':'소방×'} ${v.drain?'배수':'배수×'}`],['발전도 · 삶의 질',`${Math.round(v.D*100)} · ${Math.round(v.Q*100)}`]];
 const q=state.buildings.filter(b=>b.progress<1).map((b,i)=>`<li>${TYPES[b.type].name} (${b.x},${b.y}) — ${i<2?`공사 ${realSeconds((1-b.progress)*TYPES[b.type].time)}초 남음`:`대기 ${i-1}번째`}</li>`).join('');
 $('statusBody').innerHTML=rows.map(([k,x])=>`<div><span>${k}</span><b>${x}</b></div>`).join('')+`<h3>공사 현황</h3>${q?`<ul>${q}</ul>`:'<p>진행 중인 공사가 없어요.</p>'}<p class="dim">원점수 = 1000 × 발전도 × 삶의 질. 월말 기록 ${state.hist.length}/${state.runMonths??12}. </p>${gradeNote(assessTier(state,undefined,v))}${tierRules(state)}<p>${developmentSummary(state)}</p>`;}
// Recorded years are derived from existing month snapshots, without changing save files.
function recordCards(){if(state.result&&(state.runMonths??12)<36){const r=state.result;return `<p>이전 ${state.runMonths??12}개월 규칙에서 확정된 기록</p><b class="big">${r.tier} · ${r.total}점</b><p>${r.title}</p>`;}const years=annualReviews(state),past=years.slice(0,2);return '<div class="year-records">'+[1,2,3].map(y=>{const r=y===3?state.result:past[y-1];return `<article class="year-record ${r?'earned':''}"><small>${y===3?'3년 종합 · 최종':y+'년 차'}</small><strong>${r?r.tier:'아직 자라는 중'}</strong><b>${r?r.total+'점':mmss(realSeconds(y*YEAR))+' 시점 평가'}</b><span>${r?r.title:'함께 살기 좋은 마을을 만들어요'}</span>${r?.rawTotal>r?.total?'<details><summary>평가 조건</summary>'+gradeNote(r)+'</details>':''}</article>`;}).join('')+'</div>'+(years[2]?`<p class="dim"><b>3년 차만 비교 · ${years[2].tier} ${years[2].total}점</b><br>1·2년 차와 같은 12개월 기준입니다. 위의 최종 티어는 세 해 전체를 반영한 확정 기록이에요.</p>`:'');}
function reviewBody(){if(state.result&&(state.runMonths??12)<36)return recordCards()+'<p>이전 결과는 새 3년 규칙으로 다시 계산하지 않고 보존해요.</p>';return `<p class="dim"><b>${state.scoringV===2?'새 평가 기준 · 생활·안전·재정 조건 적용':'이전 평가 기준 · 기존 기록 보존'}</b></p>`+recordCards()+`<p class="dim">같은 시간의 기록끼리 비교해요. 1·2년 차는 그해 마지막 월말 원점수 70% + 그해 월별 원점수 평균 30%. 3년 최종은 종료 원점수 70% + 36개월 월별 원점수 평균 30%입니다. 새 규칙에서는 이 원점수에 평가 시점의 상위 티어 조건을 적용해요.</p><p>${developmentSummary(state)}</p><details><summary>티어 기준 보기</summary><div class="tier-list">${TIERS.map(([n,name,title])=>`<p><b>${name} · ${n}점 이상</b><span>${title}</span></p>`).join('')}</div>${tierRules(state)}</details>`;}
$('reviewYears').onclick=()=>{$('reviewBody').innerHTML=reviewBody();modal($('reviewDialog'));};
$('closeReview').onclick=()=>$('reviewDialog').close();
function celebrateYear(year){reviewShown=year;endPlace();const r=annualReviews(state)[year-1];$('annualTitle').textContent=`${year}년의 마음이 모였어요`;$('annualBody').innerHTML=`<span class="award-flower" aria-hidden="true">✿</span><b class="big">${r.tier} · ${r.total}점</b><p>${r.title}</p>${gradeNote(r)}<p>발전 ${r.D} · 삶의 질 ${r.Q}</p><p class="dim">${r.D<r.Q?'이웃의 생활 시설과 살 집을 더 챙겨 볼까요?':'전력·만족도·편안한 집을 더 살펴볼까요?'} 다음 해에는 더 살기 좋은 마을로!</p><p class="dim">${economyText()} 후반 약속에서 새 목표를 확인해요.</p>`; $('nextYear').textContent=`${year+1}년 차 시작하기`;modal($('annualDialog'));$('annualTitle').focus();$('annualDialog').scrollTop=0;save('연차 평가');}
$('nextYear').onclick=()=>$('annualDialog').close();
function advancePlay(dt){
 dt*=PLAY_SPEED;
 if(state.paused||state.ended)return;
 if(state.mode!=='run'){advance(state,dt);return;}
 const completed=Math.floor(state.t/YEAR);
 if(completed>reviewShown&&completed<3){celebrateYear(completed);return;}
 const boundary=Math.min(duration(state),(completed+1)*YEAR);
 advance(state,Math.min(dt,Math.max(0,boundary-state.t-state.carry)));
 const year=Math.floor(state.t/YEAR);
 if(year>reviewShown&&year<3&&!state.ended)celebrateYear(year);
}
let promiseMarkup='';
function promiseCards(){const items=villagePromises(state),count=items.filter(p=>p.done).length;$('promiseCount').textContent=`${count}/${items.length} 지금 지키는 약속`;const html=items.map(p=>{const locked=!unlocked(state,p.type),action=p.option?'시설에서 적용하기':TYPES[p.type].name+' 고르기';return `<article class="promise ${p.done?'done':''}"><div><span aria-hidden="true">${p.done?'✿':'○'}</span><b>${p.title}</b></div><p>${p.description}</p><small>${p.done?'지키는 중':'함께 살펴봐요'} · ${p.progress}</small>${p.done?'':`<button data-promise="${p.id}" ${locked?'disabled':''}>${locked?monthLabel(state,unlockMonth(p.type))+'에 열려요':action}</button>`}</article>`;}).join('');if(promiseMarkup===html)return;promiseMarkup=html;$('promiseList').innerHTML=html;$('promiseList').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=items.find(p=>p.id===b.dataset.promise);if(p.option){const v=metrics(state),h=v.live.find(x=>(p.id==='comfort'?TYPES[x.type].cap:(TYPES[x.type].cap||TYPES[x.type].food))&&!x.opts.includes(p.option)&&x.opts.length<2);if(!h){toast('옵션을 넣을 수 있는 집·가게를 먼저 준비해 주세요.');return;}closePanels();infoId=h.id;world.focus(h.x,h.y);$('infoPanel').classList.add('open');info();}else startPlace(p.type);});}
$('openPromises').onclick=()=>{const open=$('promisesPanel').classList.contains('open');closePanels();if(!open){$('promisesPanel').classList.add('open');promiseCards();}};
$('closePromises').onclick=closePanels;

// ---- 짓기 패널 ----
let tab='생활';
function openBuild(t){closePanels();if(typeof t==='string')tab=t;$('buildPanel').classList.add('open');$('tabs').innerHTML=Object.keys(TABS).map(k=>`<button data-tab="${k}" class="${k===tab?'on':''}">${k}</button>`).join('');$('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>openBuild(b.dataset.tab));
 const types=Object.keys(TYPES).filter(k=>TABS[tab].includes(TYPES[k].group)),open=types.filter(k=>unlocked(state,k)),locked=types.filter(k=>!unlocked(state,k));
 $('buildList').innerHTML=open.map(t=>{const d=TYPES[t];return`<button data-type="${t}" class="${state.money<d.cost?'poor':''} ${EARLY.includes(t)?'early':''}"><b>${d.name}${d.foot>1?' (2×2)':''}</b><small>${d.cost} · ${realSeconds(d.time)}초 · 유지 ${upkeepOf(state,{type:t,progress:1})}/월${d.e?` · 전력 ${d.e>0?'+':''}${d.e}`:''}</small><span>${d.desc}</span></button>`;}).join('')||'<p class="dim">이 분류에는 아직 열린 시설이 없어요.</p>';
 $('locked').innerHTML=locked.length?`<summary>다음에 열려요 (${locked.length})</summary><ul>${locked.map(t=>`<li>${monthLabel(state,unlockMonth(t))} — ${TYPES[t].name}: ${TYPES[t].desc}</li>`).join('')}</ul>`:'';
 $('buildList').querySelectorAll('button').forEach(b=>b.onclick=()=>startPlace(b.dataset.type));}
function closePanels(){for(const id of['buildPanel','statusPanel','infoPanel','placePanel','naturePanel','promisesPanel'])$(id).classList.remove('open');}
function startPlace(type,moving=null){if(state.paused||state.ended){toast('시간을 재개한 뒤 지을 수 있어요.');return;}closePanels();infoId=null;natSel=null;mode={type,moving};sel=null;const list=spots(state,type,324);world.showSpots(list.slice(0,3),type);$('placeSpot').innerHTML='<option value="">자리를 선택하세요</option>'+list.map((p,i)=>`<option value="${p.gx},${p.gy}">${i<3?'추천 '+(i+1)+' · ':''}(${p.gx}, ${p.gy})</option>`).join('');$('placePanel').classList.add('open');$('placeTitle').textContent=moving?`${TYPES[type].name} 옮기기`:`${TYPES[type].name} 자리 고르기`;
 $('placeHint').textContent=list.length?(type==='bridge'?'개울 위 반짝이는 자리를 누르세요. 길 끝에 이어져야 해요.':type==='workshop'?'오래된 창고(14,7) 자리에서만 고칠 수 있어요. 건너편 길과 이어 주세요.':`반짝이는 추천 자리를 누르거나 다른 빈 땅을 눌러 보세요.${foot(type)>1?' 2×2칸을 차지해요(누른 칸이 왼쪽 위).':''} 길에 붙어야 이용할 수 있어요.`):type==='bridge'?'개울에 닿는 길이 없어요. 산책길을 개울 옆까지 이어 주세요.':type==='workshop'?'창고 자리에 이미 건물이 있거나 길이 없어요.':'길에 붙은 빈 땅이 없어요. 산책길을 먼저 이어 주세요.';$('confirm').hidden=true;$('placeCost').textContent='';$('placeImpact').textContent='';if(list[0])world.focus(list[0].gx,list[0].gy);$('placeSpot').focus();}
$('placeSpot').onchange=()=>{if(!$('placeSpot').value){sel=null;world.clearPreview();$('confirm').hidden=true;$('placeCost').textContent='';$('placeImpact').textContent='';return;}const[x,y]=$('placeSpot').value.split(',').map(Number);pick(x,y);world.focus(x,y);};
function pick(gx,gy){if(!mode)return;const{type,moving}=mode;sel={gx,gy};const err=moving?(canBuild(state,type,gx,gy,moving)):canBuild(state,type,gx,gy);const info=placeInfo(state,type,gx,gy);
 const price=moving?cells({type,x:gx,y:gy}).filter(([x,y])=>naturalFeature(x,y)&&!state.landscape.cleared.includes(`${x},${y}`)).length*12:buildCost(state,type,gx,gy);const ok=!err&&state.money>=price;
 const dir=facing(state,{type,x:gx,y:gy});
 world.preview(type,gx,gy,dir,ok);$('confirm').hidden=false;$('confirm').disabled=!ok;$('confirm').textContent=moving?'여기로 옮기기':'여기에 짓기';
 $('placeCost').innerHTML=err?`<span class="bad">${err}</span>`:`${moving?`재배치 무료${price?` · 자연 정비비 ${price}`:''}`:`비용 ${price}`}${info.natural&&!moving?` (자연 정비 포함)`:''} · ${info.connected?'<span class="good">길과 이어져요</span>':'<span class="bad">길과 떨어져 있어요 — 완공해도 이용할 수 없어요</span>'}${state.money<price?' · <span class="bad">기금 부족</span>':''}`;
 const changes=err?[]:promisePreview(state,type,gx,gy,moving);$('placeImpact').textContent=err?'':changes.length?'완공 후 예상 · '+changes.slice(0,2).map(p=>p.title+': '+p.before+' → '+p.after).join(' / ')+' (지금 인구·계절 기준)':'완공해도 현재 약속의 충족 상태는 같아요. 길 연결과 시설 역할도 함께 살펴보세요.';}
$('confirm').onclick=()=>{if(!mode||!sel)return;const{type,moving}=mode;const price=moving?0:buildCost(state,type,sel.gx,sel.gy);const r=moving?relocate(state,moving,sel.gx,sel.gy):build(state,type,sel.gx,sel.gy);if(r.error){toast(r.error);return;}
 world.sync(state,!reduced);save(moving?'재배치':'건설');toast(moving?`건물을 옮겼어요(재배치 무료${r.fee?` · 자연 정비비 ${r.fee} 지불`:''}). 이 건물의 무료 이동은 끝났어요.`:`${TYPES[type].name} 공사를 시작했어요. 비용 ${price}은 지금 사용됐어요.`);endPlace();ui();};
$('cancelPlace').onclick=endPlace;
function endPlace(){mode=null;sel=null;world.clearPreview();world.showSpots([]);$('placePanel').classList.remove('open');}
let natSel=null;function natureInfo(gx,gy){closePanels();infoId=null;natSel={gx,gy};$('natTitle').textContent=naturalFeature(gx,gy)==='tree'?'마을의 나무':'들꽃 무리';$('natBody').textContent=`(${gx},${gy}) 그대로 두면 자연 보전 점수에 보탬이 돼요. 정비하면 12를 쓰고 그 자리에 지을 수 있어요(건설 때 함께 정비되니 미리 할 필요는 없어요).`;$('naturePanel').classList.add('open');}
$('natClear').onclick=()=>{if(!natSel)return;const r=clearLandscape(state,natSel.gx,natSel.gy);if(r.error){toast(r.error);return;}world.sync(state,false);save('정비');toast('자연물을 정비했어요(12).');closePanels();};$('natKeep').onclick=closePanels;$('closeNature').onclick=closePanels;
// ---- 시설 정보 ----
function info(){const b=state.buildings.find(b=>b.id===infoId);if(!b){closePanels();infoId=null;return;}const d=TYPES[b.type],v=metrics(state),live=b.progress>=1,con=connected(state,b,v.net);
 $('infoTitle').textContent=d.name+(b.starter?' (시작 시설)':'');const opts=b.opts.map(o=>OPTIONS[o].name).join(', ');$('infoBody').innerHTML=`<p>${d.desc}</p><div><span>상태</span><b class="${live?b.closed?'bad':con?'good':'bad':''}">${live?b.closed?'휴업 중(유지비·효과 0)':con?'이용 중':'길 미연결':`공사 ${realSeconds((1-b.progress)*d.time)}초 남음`}</b></div><div><span>유지비</span><b>${upkeepOf(state,b)}/월${d.e?` · 전력 ${d.e>0?'+':''}${d.e}`:''}</b></div><div><span>자리</span><b>(${b.x}, ${b.y})${d.foot>1?' 2×2':''}</b></div>${opts?`<div><span>친환경 옵션</span><b>${opts}</b></div>`:''}`;
 const canOpt=live&&b.opts.length<2&&(d.cap||d.food||d.health||d.education||d.leisure);$('optRow').innerHTML=canOpt?Object.entries(OPTIONS).filter(([k])=>!b.opts.includes(k)).map(([k,o])=>`<button data-opt="${k}" ${state.money<o.cost?'disabled':''}>${o.name} · ${o.cost}<small>${o.desc}</small></button>`).join(''):'';$('optRow').querySelectorAll('button').forEach(x=>x.onclick=()=>{const r=upgrade(state,b.id,x.dataset.opt);if(r.error){toast(r.error);return;}save('옵션');toast(`${OPTIONS[x.dataset.opt].name} 적용. ${OPTIONS[x.dataset.opt].cost} 사용.`);info();});
 $('closeShop').hidden=!(live&&!b.starter&&!['road','bridge'].includes(b.type));$('closeShop').textContent=b.closed?'영업 재개 (무료)':'휴업하기 (유지비·효과 0)';
 const why=canRelocate(state,b),eligible=b.progress>=1&&!b.starter&&!['road','bridge','workshop'].includes(b.type);$('move').hidden=!eligible;$('move').disabled=!!why;$('move').textContent=why?why:`무료로 옮기기 · ${realSeconds(relocateLeft(state,b))}초 남음`;
 $('remove').hidden=b.starter;$('remove').textContent=live?'철거 (환급 없음)':'공사 취소 (65% 환급)';}
$('move').onclick=()=>{const b=state.buildings.find(b=>b.id===infoId);if(!b)return;startPlace(b.type,b.id);};
$('closeShop').onclick=()=>{const r=toggleClosed(state,infoId);if(r.error){toast(r.error);return;}world.sync(state,false);save('휴업');toast(r.closed?'휴업했어요. 유지비와 효과가 0이 돼요. 언제든 무료로 재개할 수 있어요.':'영업을 재개했어요.');info();};
$('remove').onclick=()=>{const b=state.buildings.find(b=>b.id===infoId);if(!b)return;$('removeText').textContent=b.progress<1?`공사를 취소하면 남은 공사비의 65%만 돌려받아요.`:`완공된 ${TYPES[b.type].name}을 철거하면 환급이 없어요. 정말 철거할까요?`;modal($('removeDialog'));};
$('confirmRemove').onclick=()=>{const prev=$('removeDialog').dataset.prev==='1';$('removeDialog').dataset.keep='1';$('removeDialog').close();state.paused=prev;const r=demolish(state,infoId);if(r.error){toast(r.error);return;}closePanels();infoId=null;world.sync(state,false);save('철거');toast(r.refund?`환급 ${r.refund}을 받았어요.`:'철거했어요.');ui();};
$('cancelRemove').onclick=()=>$('removeDialog').close();
// ---- 일시정지 ----
function showPause(){$('pauseOverlay').hidden=!state.paused||state.ended||!!document.querySelector('dialog[open]');const other=!owned&&otherOwnerAlive();$('takeover').hidden=!other;$('resume').hidden=other;$('pauseText').textContent=!other?'시간이 멈춰 있어요. 멈춘 동안에는 건설·철거를 할 수 없고 둘러보기만 돼요.':'다른 탭에서 이 마을이 진행 중이에요. 한 탭에서만 진행할 수 있어요. 여기서 이어받으면 다른 탭은 멈춰요.';}
function setPaused(p){if(state.ended)return;if(!p&&!owned&&otherOwnerAlive()){state.paused=true;showPause();ui();return;}state.paused=p;if(p)endPlace();else claim();showPause();save(p?'일시정지':'');ui();}
// 2. 대화창이 열린 동안 시간을 멈추고, 취소로 닫히면 이전 정지 상태로 돌아간다. 확정 동작은 dataset.keep=1 로 복원을 막는다.
function modal(d){d.dataset.prev=state.paused?'1':'0';if(!state.ended)state.paused=true;d.showModal();d.addEventListener('close',()=>{if(!d.dataset.keep&&!state.ended){state.paused=d.dataset.prev==='1';if(!state.paused){if(otherOwnerAlive()){owned=false;state.paused=true;}else claim();}}delete d.dataset.keep;showPause();ui();},{once:true});}
// 6. 탭 소유권: 진행 중인 탭이 2초마다 도장을 찍는다. 다른 탭은 도장이 살아 있으면 멈춘 채 시작하고, 이어받기 버튼으로 소유권을 가져간다.
function claim(){owned=true;stamp();}
function stamp(){if(!storageOK||!owned)return;try{localStorage.setItem(OWNER,JSON.stringify({id:TAB,at:Date.now()}));}catch{}}
function otherOwnerAlive(){try{const o=JSON.parse(localStorage.getItem(OWNER)||'null');return !!o&&o.id!==TAB&&Date.now()-o.at<6000;}catch{return false;}}
setInterval(()=>{if(owned&&!state.paused){stamp();save('진행');}},2000); // 진행 탭은 2초마다 저장해 이어받기 손실을 2초 이내로 줄인다
$('pause').onclick=()=>setPaused(!state.paused);$('resume').onclick=()=>setPaused(false);
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden&&!state.paused&&!state.ended)setPaused(true);});
$('takeover').onclick=()=>{try{const r=localStorage.getItem(KEY);if(r){state=parseSave(r);corrupt=null;resetSession();}}catch{}claim();setPaused(false);};
// ---- 하단 메뉴 · 시점 ----
$('navBuild').onclick=()=>$('buildPanel').classList.contains('open')?closePanels():openBuild();
$('closeNeed').onclick=()=>{$('need').classList.add('hide');};
  $('navNeed').onclick=()=>{closePanels();$('need').classList.toggle('hide');};
$('navStatus').onclick=()=>{const open=$('statusPanel').classList.contains('open');closePanels();if(!open){$('statusPanel').classList.add('open');status(metrics(state));}};
$('navDeco').onclick=()=>openBuild('조경');
function doHarvest(){const r=harvest(state);if(r.error){toast(r.error);return;}closePanels();const g=toCell(world.player.g.position.x,world.player.g.position.z);world.player.route=path(state,g,{gx:6,gy:10})||[];save('텃밭');toast(`텃밭을 돌보는 중이에요. ${realSeconds(HARVEST_SECONDS)}초 뒤 기금 +${HARVEST}.`);ui();}
$('navHarvest').onclick=doHarvest;
$('closeStatus').onclick=$('closeBuild').onclick=$('closeInfo').onclick=()=>{closePanels();infoId=null;};
$('rotate').onclick=()=>world.angle+=Math.PI/2;$('zoomIn').onclick=()=>world.targetZoom=Math.min(1.8,world.targetZoom+.2);$('zoomOut').onclick=()=>world.targetZoom=Math.max(.45,world.targetZoom-.2);
function resetView(){world.angle=.65;world.zoom=world.targetZoom=1.56;world.focus(4.9,5.05);}
$('homeView').onclick=resetView;$('overview').onclick=()=>{world.angle=.65;world.targetZoom=.5;world.focus(8,8);};
$('help').onclick=()=>modal($('introDialog'));$('startPlaying').onclick=()=>{$('introDialog').dataset.keep='1';$('introDialog').close();if(!state.ended){if(otherOwnerAlive()){state.paused=true;showPause();ui();}else setPaused(false);}};
$('newGame').onclick=()=>modal($('newDialog'));$('cancelNew').onclick=()=>$('newDialog').close();
for(const id of ['corruptDialog','resultDialog'])$(id).addEventListener('cancel',e=>e.preventDefault());
$('confirmNew').onclick=()=>{if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}$('newDialog').dataset.keep='1';$('newDialog').close();if(storageOK){try{const cur=localStorage.getItem(KEY);if(cur)localStorage.setItem(BACKUP,cur);}catch{toast('백업을 만들지 못해 새로 시작하지 않았어요.');return;}}corrupt=null;state=createState();state.paused=true;resetSession();if(save('새 마을'))toast('새 마을을 시작했어요. 이전 마을은 백업으로 남겼어요.');else toast('새 마을을 저장하지 못했어요. 내보내기로 보관해 주세요.');showPause();ui();};
$('export').onclick=download;$('import').onclick=()=>$('file').click();
$('freeMode').onclick=()=>{$('resultDialog').close();if(continueFree(state)){save('자유 꾸미기');showPause();toast('자유 꾸미기 모드예요. 확정된 결과는 바뀌지 않아요.');}};
// ---- 터치/마우스: 탭=선택·걷기, 드래그=카메라, 핀치=확대. 손가락을 뗄 때 건설되지 않는다. ----
const canvas=$('world');let drag=null,pinch=null;const touches=new Map();
canvas.addEventListener('pointerdown',e=>{document.activeElement?.blur();try{canvas.setPointerCapture(e.pointerId);}catch{return;}touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const[a,b]=[...touches.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:world.targetZoom};if(drag)drag.moved=true;}if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:false};});
canvas.addEventListener('pointermove',e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&touches.size===2){const[a,b]=[...touches.values()];world.targetZoom=Math.max(.45,Math.min(1.8,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.d)));return;}if(!drag||e.pointerId!==drag.id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;if(drag.moved)world.pan(e.clientX-drag.lx,e.clientY-drag.ly);drag.lx=e.clientX;drag.ly=e.clientY;});
canvas.addEventListener('pointerup',e=>{touches.delete(e.pointerId);pinch=null;if(!drag||drag.id!==e.pointerId)return;const tap=!drag.moved;drag=null;if(!tap)return;const p=world.point(e.clientX,e.clientY);if(!p)return;const{gx,gy}=toCell(p.x,p.z);if(!inside(gx,gy))return;
 if(mode){pick(gx,gy);return;}
 const neighbor=npcs.find(n=>{if(!n.p.g.visible)return false;const pos=n.p.g.position.clone();pos.y+=.7;const q=world.screen(pos);return Math.hypot(q.x-e.clientX,q.y-e.clientY)<32;});
 if(neighbor&&!state.paused){const v=metrics(state),promise=villagePromises(state).find(p=>!p.done);const lines=[v.food===1?'덕분에 따뜻한 한 끼를 먹을 수 있어요!':'동네에 맛있는 가게가 생기면 좋겠어요.',promise?promise.title+'! 우리 함께 만들어 볼까요?':'약속을 모두 지켰네요. 이 마을에 살아서 좋아요.',['눈 오는 날엔 따뜻한 집이 참 고마워요.','벚꽃이 폈어요! 같이 이 길을 걸어요.','나무 그늘에 앉아 바람을 느껴 봐요.','단풍이 예뻐요. 우리 마을도 많이 자랐네요.'][season(calendarMonth(state))]];neighbor.helloCount=(neighbor.helloCount||0)+1;bubble={p:neighbor.p,text:lines[(neighbor.helloCount-1)%lines.length],end:time+5};toast('이웃을 톡 누르면 마을 이야기를 들을 수 있어요.');return;}
 const b=at(state,gx,gy);if(b&&b.type!=='road'){closePanels();infoId=b.id;$('infoPanel').classList.add('open');info();return;}if(!b&&naturalFeature(gx,gy)&&!state.landscape.cleared.includes(`${gx},${gy}`)){natureInfo(gx,gy);return;}
 const route=path(state,toCell(world.player.g.position.x,world.player.g.position.z),{gx,gy});if(!route.length){toast('길이나 빈 잔디를 눌러 주세요. 개울은 다리가 있어야 건너요.');return;}world.player.route=route;const end=route.at(-1);world.marker.position.set(end.x,world.marker.position.y,end.z);world.marker.visible=true;});
canvas.addEventListener('pointercancel',()=>{drag=null;pinch=null;touches.clear();});canvas.addEventListener('lostpointercapture',()=>{drag=null;pinch=null;touches.clear();});
canvas.addEventListener('wheel',e=>{e.preventDefault();world.targetZoom=Math.max(.45,Math.min(1.8,world.targetZoom-e.deltaY*.001));},{passive:false});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!state.ended)state.paused=true;endPlace();showPause();ui();save('화면 중단');$('error').hidden=false;$('error').textContent='입체 화면이 잠시 중단됐어요. 진행은 저장되어 있어요. 새로고침해 주세요.';});
addEventListener('keydown',e=>{if(e.key==='Escape'){if(mode)endPlace();else closePanels();}});
// ---- 화면 기준 이동(4번): 방향키·WASD·십자버튼 → 현재 카메라 각도의 화면 위/오른쪽을 지면 XZ에 투영한 연속 벡터로 이동(축 스냅 없음). 수동 입력은 탭 경로를 취소한다.
const keys=new Set(),KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{const k=KEYMAP[e.code];if(!k||e.target.closest?.('input,select,textarea,button,[contenteditable="true"]'))return;e.preventDefault();keys.add(k);});addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)keys.delete(k);});
addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
addEventListener('focusin',()=>keys.clear());
for(const b of document.querySelectorAll('#dpad button')){const k=b.dataset.dir;const on=e=>{e.preventDefault();keys.add(k);b.setPointerCapture?.(e.pointerId);},off=()=>keys.delete(k);b.addEventListener('pointerdown',on);for(const t of['pointerup','pointercancel','lostpointercapture','pointerleave'])b.addEventListener(t,off);}
function manualMove(dt){const{ix,iy}=inputVector(keys);if(!ix&&!iy)return;if(mode||state.paused||document.querySelector('dialog[open]')){keys.clear();return;}const v=groundVector(world.angle,ix,iy);if(!v)return;world.player.route=[];world.marker.visible=false;const roads=roadSet(state);
 const p=world.player.g.position,n=step({x:p.x,z:p.z},v,dt*2.2,(gx,gy)=>walkable(state,gx,gy,roads),CELL,toCell),travel=Math.hypot(n.x-p.x,n.z-p.z);p.x=n.x;p.z=n.z;const target=Math.atan2(v.x,v.z),diff=Math.atan2(Math.sin(target-world.player.g.rotation.y),Math.cos(target-world.player.g.rotation.y));world.player.g.rotation.y+=diff*Math.min(1,dt*14);world.player.distance+=travel;world.player.moving=travel>.0001?1:0;}
// 4. 새 마을·불러오기·이어받기 때 입력 모드·선택·정보창·플레이어 경로·말풍선·주민을 모두 초기화한다.
function resetSession(){for(const n of npcs)world.removePerson(n.p);npcs=[];endPlace();closePanels();infoId=null;sel=null;mode=null;bubble=null;world.marker.visible=false;world.sync(state,false);world.place(world.player,5,6.5);resetView();reviewShown=Math.max(0,Math.floor(state.t/YEAR)-(state.t>0&&state.t%YEAR===0?1:0));npcHomes();lastMonth=month(state);}
// ---- 시각 주민: 집에서 나와 가장 최근 완공한 가게로 길을 따라 걷고 돌아온다. 돈·만족을 바꾸지 않는다. ----
function npcHomes(){syncResidents(state,npcs,world);}
function npcTick(dt){npcHomes();const next=tickResidents(state,npcs,dt,time,world);if(next&&(!bubble||time>=bubble.end))bubble=next;}
// ---- 루프 ----
// 시뮬레이션에는 실제 경과 시간의 1.5배를 준다(느린 기기에서 시간을 깎지 않음). 연출용 dt만 짧게 자른다.
function loop(now){const real=document.hidden?0:(now-last)/1000,dt=Math.min(.25,real);last=now;time+=dt;
 const before=state.buildings.filter(b=>b.progress<1).map(b=>b.id);if(owned)advancePlay(Math.min(real,60));const done=before.filter(id=>{const b=state.buildings.find(b=>b.id===id);return b&&b.progress>=1;});
 if(done.length){world.sync(state,!reduced);save('완공');const b=state.buildings.find(b=>b.id===done[0]);toast(`${TYPES[b.type].name} 완공! ${!connected(state,b)?'길과 이어지지 않아 아직 이용하지 못해요.':TYPES[b.type].food||TYPES[b.type].leisure||TYPES[b.type].health||TYPES[b.type].education?'주민이 길을 따라 찾아갈 거예요.':'이제 이용할 수 있어요.'}`);if(TYPES[b.type].cap)npcHomes();}
 const m=month(state);if(m!==lastMonth){lastMonth=m;world.sync(state,false);save(monthLabel(state));const opened=Object.values(TYPES).filter(d=>d.unlock===m).map(d=>d.name);const news=opened.length?`${opened.join('·')} 시설이 열렸어요.`:['눈 내리는 마을, 단열과 전력을 챙겨요.','꽃 피는 계절, 정원과 이웃을 돌봐요.','푸른 여름, 전력과 배수 시설을 살펴요.','단풍 드는 계절, 마을의 빈틈을 채워요.'][season(calendarMonth(state))];toast(`${Math.floor(m/12)+1}년 차 · ${monthLabel(state)}. ${news}`);}
 if(state.ended&&!$('resultDialog').open&&state.mode==='run'&&!document.querySelector('dialog[open]')){const r=state.result;$('resultBody').innerHTML=`<b class="big">${r.total}점 · ${r.tier}</b><p>${r.title} — ${r.special}</p>${gradeNote(r)}<p>종료 원점수 ${r.endScore} · 월평균 원점수 ${r.average} · 발전 ${r.D} · 삶의 질 ${r.Q} · 조경 ${r.landscape}</p><p class="dim">잘한 점: ${r.D>=r.Q?'마을 발전이 꾸준했어요.':'주민의 삶을 잘 돌봤어요.'} 다음에 바꿔볼 점: ${r.rawTotal>r.total?'위에 나온 평가 조건을 먼저 보완해요.':r.D<r.Q?'필수 시설과 인구 목표를 더 챙겨요.':'만족도·전력·주거 여유를 더 챙겨요.'}</p><p>${developmentSummary(state)}</p>${recordCards()}`;$('resultDialog').showModal();$('resultTitle').focus();$('resultDialog').scrollTop=0;save('결과');}
 manualMove(dt);npcTick(dt);if(bubble&&bubble.p.g.visible&&time<bubble.end){const p=bubble.p.g.position.clone();p.y=1.5;const s=world.screen(p);$('bubble').textContent=bubble.text;$('bubble').style.cssText=`display:block;left:${s.x}px;top:${s.y}px`;}else $('bubble').style.display='none';
 if(time>toastEnd)$('toast').classList.remove('show');if(!world.player.route.length)world.marker.visible=false;world.paused=state.paused;world.frame(dt,time,reduced);
 uiTick+=dt;if(uiTick>.25){const growth=state.buildings.filter(b=>b.progress>=1&&isGarden(b)).map(b=>`${b.id}:${growthStage(state,b)}`).join('|');if(growth!==gardenSignature){gardenSignature=growth;world.sync(state,false);}ui();uiTick=0;}if(!reported&&time>3){console.info('village-next render',JSON.stringify(world.renderer.info.render),'memory',JSON.stringify(world.renderer.info.memory));reported=true;}requestAnimationFrame(loop);}
addEventListener('storage',e=>{if(e.key===OWNER){if(otherOwnerAlive()&&owned){owned=false;if(!state.ended)state.paused=true;endPlace();showPause();toast('다른 탭이 마을을 이어받아 이 탭은 멈췄어요.');ui();}return;}
 if(e.key!==KEY||!e.newValue||owned)return;try{const next=parseSave(e.newValue);state=next;state.paused=true;corrupt=null;resetSession();showPause();ui();}catch{}});
// ---- 시작 ----
state.paused=true;resetSession();showPause();ui();
$('startPlaying').textContent=fromSave?'이어서 마을 만들기':'마을 만들기 시작';let hadA=false;try{hadA=!!localStorage.getItem(A_KEY);}catch{}$('introSub').textContent=(fromSave?`저장된 마을 · ${Math.floor(month(state)/12)+1}년 차 ${monthLabel(state)} · 기금 ${Math.floor(state.money)}`:'3월에 시작하는 3년 · 총 80분 · 주민 8명')+' · '+economyText()+' · '+(state.scoringV===2?'새 평가 기준 적용':'이전 평가 기준 보존')+(hadA&&!fromSave?' · A단계 시제품 기록은 그대로 보관되고 B는 새 저장으로 시작해요':'');
if(!storageOK)toast('저장소를 쓸 수 없어 이번 플레이는 저장되지 않아요.');
if(corrupt){$('corruptDialog').showModal();}else modal($('introDialog'));
$('corruptExport').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([corrupt],{type:'application/json'}));a.download=`개울마을-손상기록-${Date.now()}.json`;a.click();toast('손상된 기록을 파일로 내보냈어요.');};
$('corruptNew').onclick=()=>{if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}try{localStorage.setItem(BACKUP+'-corrupt',corrupt);}catch{toast('백업에 보관하지 못해 새로 시작하지 않았어요.');return;}corrupt=null;$('corruptDialog').close();save('손상 기록 보관 후 새 마을');modal($('introDialog'));};requestAnimationFrame(loop);
