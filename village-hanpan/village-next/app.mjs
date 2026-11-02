import {upgradeCards,UPGRADE_LOOKS} from './upgrade-ui.mjs?v=cozy2';
import {cozyDescription,fundingAdvice,operatingPreviewText,placementBenefits,constructionText,catalogueBudget,buildBudget,guidedPlacement,buildingBenefit,completionMessage,incomeRate,starterChoices,incomePreviewText} from './economy-ui.mjs?v=cozy2';
import {growthStatus,ratingName,gradeNote,tierRules,developmentSummary,shortageNote} from './grading-ui.mjs?v=cozy2';
import {tickResidents,syncResidents} from './residents.mjs?v=cozy2';
// village-next B단계 입력·안내·저장·루프. 경제는 core, 좌표는 grid, 표현은 world에만 맡긴다.
import {World} from './world.mjs?v=cozy2';
import {villagePromises,promisePreview,newlyKeptPromises} from './promises.mjs?v=cozy2';
import {enableCozy,cozyGrowth,buildingSpec,assessTier,economy,upkeepOf,annualReviews,YEAR,createState,build,demolish,relocate,canRelocate,relocateLeft,advance,metrics,month,duration,calendarMonth,monthLabel,serialize,parseSave,continueFree,buildCost,clearingCost,canBuild,at,cells,network,connected,TYPES,OPTIONS,MONTH,RULE,SCOPE,unlocked,unlockMonth,toggleClosed,harvest,upgrade,clearLandscape,HARVEST,HARVEST_SECONDS,demandMonth,UPGRADE_TYPES} from './core.mjs?v=cozy2';
import {toCell,toWorld,spots,placeInfo,facing,entrance,path,walkable,inside,CELL,perimeter,foot,roadSet} from './grid.mjs?v=cozy2';
import {groundVector,inputVector,step,stickVector,PLAYER_SPEED} from './move.mjs?v=cozy2';
import {naturalFeature,growthStage,isGarden} from './landscape.mjs?v=cozy2';
import {PLAY_SPEED,realSeconds,season,SEASONS,TABS,TIERS} from './data.mjs?v=cozy2';
import {KEY,BACKUP,OWNER,A_KEY} from './app-keys.mjs?v=cozy2';
const EARLY=['house','road','snack']; // 초반 강조. 나머지는 해금되면 탭에 나타난다.
const SERVICE={health:['의료','clinic','hospital'],education:['교육','school','library'],leisure:['여가','kids','library']};
const $=id=>document.getElementById(id);
let state,storageOK=true,fromSave=false,corrupt=null,raw=null;
// localStorage 접근 자체가 막히면(SecurityError) 저장 기능 전체를 끈다. 읽을 수는 있지만 검증에 실패하면 손상 원본을 보존하고 덮어쓰지 않는다.
try{raw=localStorage.getItem(KEY);}catch(e){storageOK=false;console.warn('저장소에 접근할 수 없어요',e);}
if(raw){try{state=parseSave(raw);fromSave=true;}catch(e){corrupt=raw;console.warn('저장 기록을 읽지 못했어요',e);}}
if(!state){state=createState();state.money=600;}
// Preserve the pre-migration town once before switching the ongoing play style.
if(!corrupt&&state.cozyV!==1&&raw&&storageOK){try{if(!localStorage.getItem(BACKUP+'-before-cozy'))localStorage.setItem(BACKUP+'-before-cozy',raw);}catch{storageOK=false;}}
enableCozy(state);
const TAB=Math.random().toString(36).slice(2)+Date.now().toString(36);let owned=false; // 6. 한 탭만 시간을 진행한다
await Promise.race([Promise.all([document.fonts.load('700 48px SUIT'),document.fonts.load('32px Wanted')]).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,3000))]);
let world;try{world=new World($('world'));window.__world=world;window.__vn={get state(){return state;},world};}catch(e){$('error').hidden=false;$('error').textContent='입체 화면을 열지 못했어요. WebGL을 지원하는 Chrome 또는 Edge에서 다시 열어주세요.';throw e;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let gardenSignature='';
let time=0,last=performance.now(),toastEnd=0,uiTick=0,lastMonth=month(state),mode=null,sel=null,infoId=null,npcs=[],bubble=null,reported=false,reviewShown=0;
let lesson=false,recommendedSpot=null;
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');toastEnd=time+4;}
// ---- 저장 ----
function save(reason=''){if(otherOwnerAlive()){owned=false;state.paused=true;$('saved').textContent='다른 탭 진행 중 · 저장 보호';return false;}if(!storageOK){$('saved').textContent='저장 불가';return false;}if(corrupt){$('saved').textContent='손상 기록 보호 중 · 저장 안 함';return false;}try{state.savedAt=Date.now();localStorage.setItem(KEY,serialize(state));$('saved').textContent='자동 저장됨'+(reason?' · '+reason:'');return true;}catch{storageOK=false;$('saved').textContent='저장 공간 확인 필요';toast('저장할 수 없어요. 저장 공간을 확인해 주세요.');return false;}}
function download(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([serialize(state)],{type:'application/json'}));a.download=`개울마을-${RULE}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);toast('마을 파일을 내보냈어요.');}
$('file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}try{const next=parseSave(await f.text());if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}if(storageOK&&localStorage.getItem(KEY))localStorage.setItem(BACKUP,localStorage.getItem(KEY));state=next;state.paused=true;corrupt=null;resetSession();if(save('불러옴'))toast('마을 파일을 불러왔어요. 이전 기록은 백업에 남겼어요.');else toast('파일은 열었지만 저장하지 못했어요. 내보내기로 보관해 주세요.');showPause();}catch(err){toast('불러오지 못했어요: '+err.message+' (원본은 그대로예요)');}};
// ---- 시간 표시 ----
const mmss=sec=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
function ui(){const m=month(state),v=metrics(state),growth=growthStatus(state,v);
 $('calendar').textContent=`${1+Math.floor(month(state)/12)}년 차 · ${SEASONS[season(calendarMonth(state))]} · ${monthLabel(state)}`;$('left').textContent=state.mode==='free'?'3년 평가는 고정 · 계속 가꿔요':state.ended?'종료':`남은 시간 ${mmss(realSeconds(duration(state)-state.t))}`;$('monthBar').style.width=`${(state.t%MONTH)/MONTH*100}%`;
 $('money').textContent=Math.floor(state.money).toLocaleString();$('incomeRate').textContent=incomeRate(v);$('incomeRate').title=state.paused?'일시정지 중 · 재개하면 이 속도로 변해요':'유지비를 뺀 현재 속도 · 진행 중인 실제 시간 기준';$('pop').textContent=`${state.pop}명 / 집 ${v.housing}`;$('sat').textContent=Math.round(state.sat)+'%';$('score').textContent=state.result?ratingName(state.result.total):growth.name;$('scoreScope').textContent=state.result?'3년 종합 평가 · 기록 고정':'마을 성장';$('tierName').textContent=state.result?`${state.result.total}점 · 최종 기록`:`${growth.detail}`;
 $('pause').textContent=state.paused?'▶ 재개':'❚❚ 일시정지';$('pause').disabled=state.ended;world.season(season(calendarMonth(state)));const note=['❄ 눈 덮인 겨울 · 따뜻한 집을 준비해요','🌸 벚꽃 피는 봄 · 새로운 이웃을 맞아요','☀ 초록이 짙은 여름 · 시원한 그늘을 만들어요','🍂 단풍 드는 가을 · 마을의 결실을 살펴요'][season(calendarMonth(state))];if($('seasonNote').textContent!==note)$('seasonNote').textContent=note;
 const hb=$('navHarvest');hb.disabled=state.ended||state.harvestAt!==null;hb.textContent=state.harvestAt!==null?`🥬 돌보는 중 ${realSeconds(HARVEST_SECONDS-(state.t-state.harvestAt))}초`:state.harvested.includes(m)?'🥬 이번 달 완료':`🥬 텃밭 돌보기 +${HARVEST}`;
 $('reviewYears').textContent=state.result&&(state.runMonths??12)<36?'이전 규칙 기록':`성장 기록 · ${Math.min(3,annualReviews(state).length)}/3`;
 refreshPlaceBudget();if($('buildPanel').classList.contains('open'))refreshCatalogueBudget();need(v);$('phoneGrowth').textContent=growth.name;$('phoneTask').textContent=$('needTitle').textContent+' ›';if($('promisesPanel').classList.contains('open'))promiseCards();if($('statusPanel').classList.contains('open'))status(v);if(infoId!==null)info();}
// ---- 현재 필요 카드: 진행 불가 → 생활 수요 → 기금 → 여유 ----
function need(v){
 const b=$('needAction'),queue=state.buildings.filter(b=>b.progress<1);let title,why,action,label;
 if(queue.length){title='마을이 조금씩 자라고 있어요';why='공사가 끝나는 동안 다른 곳을 꾸며 봐요.';action=()=>openBuild('조경');label='꾸미기 열기';}
 else if(!v.live.some(b=>!b.starter&&buildingSpec(state,b.type).food)){title='어떤 가게를 열어 볼까요?';why='마음에 드는 가게를 골라 길 옆에 놓아 보세요.';action=()=>openBuild('생활');label='가게 둘러보기';}
 else if(v.housing<=state.pop){title='새 이웃을 맞이해 볼까요?';why='길 옆에 집을 지으면 새 이웃이 찾아와요.';action=()=>openBuild('주거');label='집 둘러보기';}
 else{title='나만의 정원을 만들어 볼까요?';why='꽃과 나무, 벤치를 섞어 놓으면 마을이 더 다채로워져요.';action=()=>openBuild('조경');label='꾸미기 열기';}
 $('needTitle').textContent=title;$('needWhy').textContent=why;b.hidden=false;b.textContent=label;b.onclick=action;
}
function status(v){const g=cozyGrowth(state);$('statusBody').innerHTML=`<p class="cozy-score"><span>마을 성장</span><strong>${g.score}점</strong></p><p>꽃과 나무, 다양한 건물과 외관을 완성하면 조금씩 올라가요.</p><div><span>함께 사는 이웃</span><b>${state.pop}명</b></div><div><span>내가 가꾼 정원</span><b>${g.gardens}곳</b></div><div><span>내가 지은 건물</span><b>${g.buildings}동</b></div><p class="dim">기금은 꾸준히 모여요. 서두르지 않고 마음대로 꾸며요.</p>`;}
// Recorded years are derived from existing month snapshots, without changing save files.
$('reviewYears').onclick=()=>{const old=annualReviews(state);$('reviewBody').innerHTML=old.length?'<p>이전 방식으로 남긴 기록이에요. 지금의 꾸미기 점수와는 별개로 보관해요.</p>'+old.map(r=>`<p>${r.year}년 차 · ${r.total}점</p>`).join(''):'<p>아직 이전 기록이 없어요. 지금의 성장은 메뉴의 마을 현황에서 볼 수 있어요.</p>';modal($('reviewDialog'));};
$('closeReview').onclick=()=>$('reviewDialog').close();
function advancePlay(dt){advance(state,dt*PLAY_SPEED);}
let promiseMarkup='',lastPromiseCheck=-2,celebratedPromises=new Set(villagePromises(state).filter(p=>p.done).map(p=>p.id));
function celebratePromises(){
 if(state.paused||state.ended||lesson||mode||time<toastEnd||time-lastPromiseCheck<2||document.querySelector('dialog[open]'))return;lastPromiseCheck=time;
 const fresh=newlyKeptPromises(state,celebratedPromises);if(!fresh.length)return;toast('마을 약속 달성! '+fresh.slice(0,2).map(p=>p.title).join(' · ')+(fresh.length>2?` 외 ${fresh.length-2}개`:''));if(!reduced){const p=toCell(world.player.g.position.x,world.player.g.position.z);world.sparkle(p.gx,p.gy);}
}

function promiseCards(){const items=villagePromises(state),count=items.filter(p=>p.done).length;$('promiseCount').textContent=`${count}/${items.length} 지금 지키는 약속`;const html=items.map(p=>{const locked=!unlocked(state,p.type),action=p.option?'시설에서 적용하기':buildingSpec(state,p.type).name+' 고르기';return `<article class="promise ${p.done?'done':''}"><div><span aria-hidden="true">${p.done?'✿':'○'}</span><b>${p.title}</b></div><p>${p.description}</p><small>${p.done?'지키는 중':'함께 살펴봐요'} · ${p.progress}</small>${p.done?'':`<button data-promise="${p.id}" ${locked?'disabled':''}>${locked?monthLabel(state,unlockMonth(p.type))+'에 열려요':action}</button>`}</article>`;}).join('');if(promiseMarkup===html)return;promiseMarkup=html;$('promiseList').innerHTML=html;$('promiseList').querySelectorAll('button').forEach(b=>b.onclick=()=>{const p=items.find(p=>p.id===b.dataset.promise);if(p.option){const v=metrics(state),h=v.live.find(x=>(p.id==='comfort'?buildingSpec(state,x.type).cap:(buildingSpec(state,x.type).cap||buildingSpec(state,x.type).food))&&!x.opts.includes(p.option)&&x.opts.length<2);if(!h){toast('옵션을 넣을 수 있는 집·가게를 먼저 준비해 주세요.');return;}closePanels();infoId=h.id;world.focus(h.x,h.y);$('infoPanel').classList.add('open');info();}else startPlace(p.type);});}
$('openPromises').onclick=()=>{const open=$('promisesPanel').classList.contains('open');closePanels();if(!open){$('promisesPanel').classList.add('open');promiseCards();}};
$('closePromises').onclick=dismissPanels;

// ---- 짓기 패널 ----
let tab='생활',fullCatalogue=false;
function openBuild(t){closePanels();if(typeof t==='string'){tab=t;fullCatalogue=true;}const choices=null;$('buildPanel').classList.add('open');$('buildPanel').scrollTop=0;$('locked').open=false;
 $('buildGuide').textContent='마음에 드는 것을 골라 마을에 놓아 보세요.';$('moreBuildings').hidden=true;
 $('tabs').hidden=!!choices;$('tabs').innerHTML=choices?'':Object.keys(TABS).map(k=>`<button data-tab="${k}" aria-pressed="${k===tab}" class="${k===tab?'on':''}">${k}</button>`).join('');$('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{const selected=b.dataset.tab;openBuild(selected);$('tabs').querySelector(`[data-tab="${selected}"]`).focus();});
 const types=choices||Object.keys(TYPES).filter(k=>TABS[tab].includes(buildingSpec(state,k).group)),open=types.filter(k=>unlocked(state,k)),locked=types.filter(k=>!unlocked(state,k));
 $('buildList').innerHTML=open.map(t=>{const d=buildingSpec(state,t);return `<button data-type="${t}" data-cost="${d.cost}"><span class="build-head"><b>${d.name}</b><strong class="build-price">${d.cost}<small>코인</small></strong></span><span class="build-value">${cozyDescription(t)}${d.foot>1?' · 넓은 자리 2×2칸':''}</span><span class="build-action">${catalogueBudget(state.money,d.cost)}</span></button>`;}).join('');
 $('locked').hidden=!locked.length;$('locked').innerHTML=locked.length?`<summary>다음에 열려요 (${locked.length})</summary><ul>${locked.map(t=>`<li>${monthLabel(state,unlockMonth(t))} — ${buildingSpec(state,t).name}: ${buildingSpec(state,t).desc}</li>`).join('')}</ul>`:'';
 $('buildList').querySelectorAll('button').forEach(b=>b.onclick=()=>startPlace(b.dataset.type));}
function refreshCatalogueBudget(){for(const button of $('buildList').querySelectorAll('[data-cost]')){const cost=Number(button.dataset.cost);button.classList.toggle('poor',state.money<cost);button.querySelector('.build-action').textContent=catalogueBudget(state.money,cost);}}
$('moreBuildings').onclick=()=>{fullCatalogue=!fullCatalogue;openBuild();};
function closePanels(){$('need').classList.add('hide');$('navNeed').setAttribute('aria-expanded','false');if(mode)endPlace();world.highlightBuilding(null);infoId=null;document.body.classList.remove('phone-need');$('phoneGoal').setAttribute('aria-expanded','false');$('phoneMenuOpen').setAttribute('aria-expanded','false');for(const id of['phoneMenu','buildPanel','statusPanel','infoPanel','placePanel','naturePanel','promisesPanel'])$(id).classList.remove('open');}
function dismissPanels(){const inMenu=$('phoneMenu').classList.contains('open');closePanels();infoId=null;$(inMenu?'phoneMenuOpen':'navBuild').focus();}
function focusPlace(gx,gy){world.focus(gx,gy);if(innerWidth<=820&&innerHeight>480)world.pan(0,-innerHeight*(innerWidth<=600?.2:.1));else if(innerHeight<=480)world.pan(-innerWidth*.15,0);else if(innerWidth>820)world.pan(innerWidth*.1,0);}
function startPlace(type,moving=null){if(state.paused||state.ended){toast('시간을 재개한 뒤 지을 수 있어요.');return;}closePanels();infoId=null;natSel=null;mode={type,moving};sel=null;$('cancelPlace').textContent=moving?'취소':'시설 목록';const list=spots(state,type,324),guided=!moving;world.showSpots(guided?list.slice(0,3):[],type);$('placeSpot').innerHTML='<option value="">자리를 선택하세요</option>'+list.map((p,i)=>`<option value="${p.gx},${p.gy}">${guided&&i<3?'추천 '+(i+1)+' · ':''}(${p.gx}, ${p.gy})</option>`).join('');$('placePanel').classList.add('open');$('placeTitle').textContent=moving?`${buildingSpec(state,type).name} 옮기기`:`${buildingSpec(state,type).name} 자리 고르기`;
 $('placeHint').textContent=list.length?(type==='bridge'?'개울 위 반짝이는 자리를 누르세요. 길 끝에 이어져야 해요.':type==='workshop'?'오래된 창고(14,7) 자리에서만 고칠 수 있어요. 건너편 길과 이어 주세요.':`반짝이는 추천 자리를 누르거나 다른 빈 땅을 눌러 보세요.${foot(type)>1?' 2×2칸을 차지해요(누른 칸이 왼쪽 위).':''} 길에 붙어야 이용할 수 있어요.`):type==='bridge'?'개울에 닿는 길이 없어요. 산책길을 개울 옆까지 이어 주세요.':type==='workshop'?'창고 자리에 이미 건물이 있거나 길이 없어요.':'길에 붙은 빈 땅이 없어요. 산책길을 먼저 이어 주세요.';$('confirm').hidden=true;$('placeCost').textContent='';$('placeBudget').textContent='';$('placeImpact').textContent='';$('placeIncome').textContent='';$('placeDecision').textContent='';$('fundingAdvice').textContent='';$('placeHarvest').hidden=true;recommendedSpot=guided?(list[0]||null):null;$('recommendSpot').hidden=!recommendedSpot;$('otherSpots').open=false;$('placeDetails').open=false;$('placeDetails').hidden=true;$('placeTitle').textContent=(lesson&&guided&&type==='snack'?'1 / 3 · ':'')+(moving?buildingSpec(state,type).name+' 옮기기':buildingSpec(state,type).name+' 자리 보기');if(recommendedSpot){$('placeHint').textContent='아래 ‘추천 자리 보기’를 누르세요. 지도에서 반짝이는 땅을 직접 눌러도 돼요.';focusPlace(recommendedSpot.gx,recommendedSpot.gy);$('recommendSpot').focus();}else{$('placeHint').textContent=list.length?(type==='bridge'?'개울 위 자리를 골라 양쪽 길을 이어요.':type==='workshop'?'오래된 창고(14, 7)를 골라 고쳐요.':`지도에서 길 옆 빈 땅을 눌러요.${foot(type)>1?' 2×2칸이 필요해요.':''}`):'지을 자리가 없어요. 빈 땅과 길 연결을 확인해 주세요.';$('otherSpots').querySelector('summary').focus();}}
$('recommendSpot').onclick=()=>{if(!mode||!recommendedSpot)return;const{gx,gy}=recommendedSpot;pick(gx,gy);focusPlace(gx,gy);$('placeSpot').value=`${gx},${gy}`;$('confirm').focus();};
$('placeSpot').onchange=()=>{if(!$('placeSpot').value){sel=null;world.clearPreview();$('placeDetails').hidden=true;$('confirm').hidden=true;$('placeCost').textContent='';$('placeBudget').textContent='';$('placeImpact').textContent='';$('placeIncome').textContent='';$('placeDecision').textContent='';$('fundingAdvice').textContent='';$('placeHarvest').hidden=true;return;}const[x,y]=$('placeSpot').value.split(',').map(Number);pick(x,y);focusPlace(x,y);$('otherSpots').open=false;($('confirm').disabled?$('placeCost'):$('confirm')).focus();};
function pick(gx,gy){if(!mode)return;const{type,moving}=mode;sel={gx,gy};const err=moving?(canBuild(state,type,gx,gy,moving)):canBuild(state,type,gx,gy);const info=placeInfo(state,type,gx,gy);
 const price=moving?clearingCost(state,type,gx,gy):buildCost(state,type,gx,gy);const ok=!err&&state.money>=price;$('placeDetails').hidden=!!err;
 const dir=facing(state,{type,x:gx,y:gy});
 world.preview(type,gx,gy,dir,ok);$('recommendSpot').hidden=ok||!recommendedSpot;$('confirm').hidden=false;$('confirm').disabled=!ok;$('confirm').textContent=moving?'여기로 옮기기':`${isGarden({type})?"여기에 꾸미기":"여기에 짓기"} · ${price} 사용`;$('placeTitle').textContent=(lesson&&recommendedSpot&&type==='snack'?'2 / 3 · ':'')+(moving?'옮길 자리 확인':buildingSpec(state,type).name+' 자리 확인');$('placeHint').textContent=ok?(['road','bridge'].includes(type)?'테두리가 놓일 자리예요. 아래 버튼으로 공사를 시작해요.':isGarden({type})?'테두리가 꾸밀 자리예요. 아래 버튼을 누르면 이곳에 놓아요.':'테두리가 건물이 놓일 자리예요. 흰 화살표 쪽으로 이웃들이 드나들어요.'):err?(recommendedSpot?'다른 빈 땅을 누르거나 추천 자리를 다시 골라 주세요.':'지도에서 다른 빈 땅을 골라 주세요.'):'기금이 부족해요. 수입이 모이면 이 자리에서 바로 지을 수 있어요. 텃밭 돌보기도 도움이 돼요.';
 $('placeCost').innerHTML=err?`<span class="bad">${err}</span>`:`${moving?`재배치 무료${price?` · 자연 정비비 ${price}`:''}`:`비용 ${price}`}${info.natural&&!moving?` (자연 정비 포함)`:''} · ${isGarden({type})?'꽃과 나무는 길에서 떨어져 있어도 괜찮아요.':info.connected?'<span class="good">길과 이어져요</span>':'<span class="bad">길을 이어 주면 이웃들이 찾아와요</span>'}`;
 $('placeBudget').textContent=err?'':buildBudget(state.money,price);$('placeBudget').classList.toggle('short',state.money<price);$('fundingAdvice').textContent=err?'':fundingAdvice(state,price);$('placeHarvest').hidden=!!err||state.money>=price||state.harvestAt!==null||state.harvested.includes(month(state));$('placeHarvest').disabled=state.paused||state.ended;
 $('placeImpact').hidden=!!starterChoices(state);const changes=err?[]:promisePreview(state,type,gx,gy,moving);$('placeDecision').textContent=err?'':cozyDescription(type);$('placeIncome').textContent=err?'':incomePreviewText(state,type,gx,gy,moving);$('placeImpact').textContent=err?'':changes.length?'완공 후 예상 · '+changes.slice(0,2).map(p=>p.title+': '+p.before+' → '+p.after).join(' / ')+' (지금 인구·계절 기준)':'완공해도 현재 약속의 충족 상태는 같아요. 길 연결과 시설 역할도 함께 살펴보세요.';}
let previewSecond=-1;
function refreshPlaceBudget(){
 if(!mode||!sel||canBuild(state,mode.type,sel.gx,sel.gy,mode.moving||0))return;
 const price=mode.moving?clearingCost(state,mode.type,sel.gx,sel.gy):buildCost(state,mode.type,sel.gx,sel.gy);
 $('placeBudget').textContent=buildBudget(state.money,price);$('placeBudget').classList.toggle('short',state.money<price);$('fundingAdvice').textContent=fundingAdvice(state,price);$('placeHarvest').hidden=state.money>=price||state.harvestAt!==null||state.harvested.includes(month(state));$('placeHarvest').disabled=state.paused||state.ended;
 if($('confirm').disabled!==(state.money<price))pick(sel.gx,sel.gy);
 else if(Math.floor(state.t/PLAY_SPEED)!==previewSecond){previewSecond=Math.floor(state.t/PLAY_SPEED);$('placeDecision').textContent=cozyDescription(mode.type);$('placeIncome').textContent=incomePreviewText(state,mode.type,sel.gx,sel.gy,mode.moving);}
}
$('confirm').onclick=()=>{if(!mode||!sel)return;const{type,moving}=mode;const price=moving?0:buildCost(state,type,sel.gx,sel.gy);const r=moving?relocate(state,moving,sel.gx,sel.gy):build(state,type,sel.gx,sel.gy);if(r.error){toast(r.error);return;}
 world.sync(state,!reduced);save(moving?'재배치':'건설');toast(moving?`건물을 옮겼어요(재배치 무료${r.fee?` · 자연 정비비 ${r.fee} 지불`:''}).`:`${buildingSpec(state,type).name} 공사를 시작했어요. 비용 ${price}은 지금 사용됐어요.`);endPlace();ui();};
$('placeHarvest').onclick=()=>doHarvest(true);
$('cancelPlace').onclick=()=>{const previous=mode;endPlace();if(previous&&!previous.moving){openBuild();$('buildList').querySelector(`[data-type="${previous.type}"]`)?.focus();}else $('navBuild').focus();};
function endPlace(){mode=null;sel=null;recommendedSpot=null;world.clearPreview();world.showSpots([]);$('placePanel').classList.remove('open');}
let natSel=null;function natureInfo(gx,gy){closePanels();infoId=null;natSel={gx,gy};$('natTitle').textContent=naturalFeature(gx,gy)==='tree'?'마을의 나무':'들꽃 무리';$('natBody').textContent=`(${gx},${gy}) 그대로 두면 자연 보전 점수에 보탬이 돼요. 정비하면 12를 쓰고 그 자리에 지을 수 있어요(건설 때 함께 정비되니 미리 할 필요는 없어요).`;$('naturePanel').classList.add('open');}
$('natClear').onclick=()=>{if(!natSel)return;const r=clearLandscape(state,natSel.gx,natSel.gy);if(r.error){toast(r.error);return;}world.sync(state,false);save('정비');toast('자연물을 정비했어요(12).');closePanels();};$('natKeep').onclick=dismissPanels;$('closeNature').onclick=dismissPanels;
// ---- 시설 정보 ----
let upgradeMarkup='',upgradeBuilding=null;
function info(){const b=state.buildings.find(b=>b.id===infoId);if(!b){closePanels();infoId=null;return;}const d=buildingSpec(state,b.type),v=metrics(state),live=b.progress>=1,con=connected(state,b,v.net);
 if(world.highlightBuilding(b))focusPlace(b.x+(foot(b.type)-1)/2,b.y+(foot(b.type)-1)/2);if(upgradeBuilding!==b)$('manageBuilding').open=false;$('manageBuilding').hidden=!!b.starter;
 $('infoTitle').textContent=d.name+(b.starter?' (시작 시설)':'');$('infoBody').innerHTML=`<p>${cozyDescription(b.type)}</p><p class="facility-state">${live?b.closed?'휴업 중 · 재개하면 효과를 받아요':(con||isGarden(b))?'이용 중':'길과 연결하면 이용할 수 있어요':constructionText(state,b)}</p>`;
 const ecoEligible=UPGRADE_TYPES.includes(b.type);
 $('upgradeSection').hidden=!ecoEligible;$('upgradeNote').textContent=b.opts.length>=2?'개선 2개 완료 · 건물의 새 모습을 살펴봐요.':`남은 개선 ${2-b.opts.length}개 · 효과를 비교해 골라요. 모습도 바뀌어요.`;const html=ecoEligible?upgradeCards(state,b):'';
 if(upgradeMarkup!==html||upgradeBuilding!==b){const focusedOpt=$('optRow').contains(document.activeElement)?document.activeElement.dataset.opt:null;upgradeMarkup=html;upgradeBuilding=b;$('optRow').innerHTML=html;$('optRow').querySelectorAll('button').forEach(x=>x.onclick=()=>{const opt=x.dataset.opt,r=upgrade(state,b.id,opt);if(r.error){toast(r.error);return;}world.sync(state,false);if(!reduced)world.sparkle(b.x,b.y);save('친환경 개선');toast(`${OPTIONS[opt].name} 완료! ${UPGRADE_LOOKS[opt]}이 생겼어요.`);info();ui();});if(focusedOpt){const next=$('optRow').querySelector(`[data-opt="${focusedOpt}"]`);(next&&!next.disabled?next:$('upgradeNote')).focus({preventScroll:!!next&&!next.disabled});}}
 $('closeShop').hidden=!(live&&!b.starter&&!['road','bridge'].includes(b.type));$('operationImpact').textContent=live&&!b.starter&&!['road','bridge'].includes(b.type)?(b.closed?'다시 열면 이웃이 이용하고 마을 성장에도 보탬이 돼요.':'쉬는 동안 이웃이 이용하지 않아요. 다시 열 수 있어요.'):'';$('closeShop').textContent=b.closed?'영업 재개 (무료)':'휴업하기 (유지비·효과 0)';
 const why=canRelocate(state,b),eligible=b.progress>=1&&!b.starter&&!['road','bridge','workshop'].includes(b.type);$('move').hidden=!eligible;$('move').disabled=!!why;$('move').textContent=why?why:'무료로 옮기기';
 $('remove').hidden=b.starter;$('remove').textContent=live?'철거 (환급 없음)':'공사 취소 (65% 환급)';}
$('move').onclick=()=>{const b=state.buildings.find(b=>b.id===infoId);if(!b)return;startPlace(b.type,b.id);};
$('closeShop').onclick=()=>{const r=toggleClosed(state,infoId);if(r.error){toast(r.error);return;}world.sync(state,false);save('휴업');toast(r.closed?'휴업했어요. 유지비와 효과가 0이 돼요. 언제든 무료로 재개할 수 있어요.':'영업을 재개했어요.');info();};
$('remove').onclick=()=>{const b=state.buildings.find(b=>b.id===infoId);if(!b)return;$('removeText').textContent=b.progress<1?`공사를 취소하면 남은 공사비의 65%만 돌려받아요.`:`완공된 ${buildingSpec(state,b.type).name}을 철거하면 환급이 없어요. 정말 철거할까요?`;modal($('removeDialog'));};
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
setInterval(()=>{if(owned&&!state.paused){stamp();save('진행');}},2000);
addEventListener('pagehide',()=>{if(!owned||otherOwnerAlive())return;save('보관');try{localStorage.removeItem(OWNER);}catch{}}); // 진행 탭은 2초마다 저장해 이어받기 손실을 2초 이내로 줄인다
$('pause').onclick=()=>setPaused(!state.paused);$('resume').onclick=()=>setPaused(false);
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden&&!state.paused&&!state.ended)setPaused(true);});
$('takeover').onclick=()=>{try{const r=localStorage.getItem(KEY);if(r){state=parseSave(r);corrupt=null;resetSession();}}catch{}claim();setPaused(false);};
// ---- 하단 메뉴 · 시점 ----
$('navBuild').onclick=()=>$('buildPanel').classList.contains('open')?closePanels():openBuild();
$('closeNeed').onclick=()=>{closePanels();$('navNeed').focus();};
$('navNeed').onclick=()=>{const open=!$('need').classList.contains('hide');closePanels();if(!open){document.body.classList.add('phone-need');$('need').classList.remove('hide');$('navNeed').setAttribute('aria-expanded','true');}};
$('navStatus').onclick=()=>{const open=$('statusPanel').classList.contains('open');closePanels();if(!open){$('statusPanel').classList.add('open');status(metrics(state));}};
$('navDeco').onclick=()=>openBuild('조경');
function doHarvest(keepPlace=false){const r=harvest(state);if(r.error){toast(r.error);return;}if(keepPlace!==true){closePanels();const g=toCell(world.player.g.position.x,world.player.g.position.z);world.player.route=path(state,g,{gx:6,gy:10})||[];world.followPlayer=true;}save('텃밭');toast(`텃밭을 돌보는 중이에요. ${realSeconds(HARVEST_SECONDS)}초 뒤 기금 +${HARVEST}.`);ui();}
$('navHarvest').onclick=doHarvest;
$('closeStatus').onclick=$('closeBuild').onclick=$('closeInfo').onclick=dismissPanels;
$('rotate').onclick=()=>world.angle+=Math.PI/2;$('zoomIn').onclick=()=>world.targetZoom=Math.min(1.8,world.targetZoom+.2);$('zoomOut').onclick=()=>world.targetZoom=Math.max(.45,world.targetZoom-.2);
function resetView(){world.entrance=null;world.cameraHeight=32;world.lookHeight=.2;world.angle=.65;world.zoom=world.targetZoom=1.4;world.focus(4.9,5.05);}
$('homeView').onclick=resetView;$('overview').onclick=()=>{world.angle=.65;world.targetZoom=.5;world.focus(8,8);};
$('newGame').onclick=()=>modal($('newDialog'));$('cancelNew').onclick=()=>$('newDialog').close();
for(const id of ['corruptDialog','resultDialog'])$(id).addEventListener('cancel',e=>e.preventDefault());
$('confirmNew').onclick=()=>{if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}$('newDialog').dataset.keep='1';$('newDialog').close();if(storageOK){try{const cur=localStorage.getItem(KEY);if(cur)localStorage.setItem(BACKUP,cur);}catch{toast('백업을 만들지 못해 새로 시작하지 않았어요.');return;}}corrupt=null;state=createState();state.money=600;state.paused=false;resetSession();if(save('새 마을'))toast('새 마을을 시작했어요. 이전 마을은 백업으로 남겼어요.');else toast('새 마을을 저장하지 못했어요. 내보내기로 보관해 주세요.');showPause();ui();};
$('export').onclick=download;$('import').onclick=()=>$('file').click();
$('freeMode').onclick=()=>{if(otherOwnerAlive()){toast('다른 탭에서 진행 중이에요. 그 탭에서 이어가 주세요.');return;}if(continueFree(state)){claim();$('resultDialog').close();save('계속 운영');showPause();ui();toast('이어서 마을을 가꿔요. 3년 최종 평가와 점수는 고정돼요.');}};
// Phone menus reuse the existing actions and keep the map clear between taps.
$('phoneGoal').onclick=()=>$('navNeed').click();
$('phoneMenuOpen').onclick=()=>{const open=$('phoneMenu').classList.contains('open');closePanels();if(open)return;$('phoneMenu').classList.add('open');$('phoneViewOptions').open=false;$('phoneMenuOpen').setAttribute('aria-expanded','true');$('phoneSummary').textContent='마음에 드는 곳부터 천천히 가꿔요.';for(const b of document.querySelectorAll('[data-phone-action]')){const source=$(b.dataset.phoneAction);b.disabled=source.disabled;if(b.dataset.phoneAction==='navHarvest')b.textContent=source.textContent;}};
$('phoneMenuClose').onclick=dismissPanels;$('help').onclick=()=>$('phoneMenuOpen').click();$('helpGuide').onclick=()=>modal($('helpDialog'));$('closeHelp').onclick=()=>$('helpDialog').close();
for(const b of document.querySelectorAll('[data-phone-action]'))b.onclick=()=>{const source=$(b.dataset.phoneAction);if(source.disabled)return;closePanels();source.click();};
$('phoneStick').onclick=()=>{const on=document.body.classList.toggle('phone-stick');stopStick();$('phoneStick').setAttribute('aria-pressed',String(on));$('phoneStick').textContent=on?'조이스틱 끄기':'조이스틱 켜기';closePanels();};
// ---- 터치/마우스: 탭=선택·걷기, 드래그=카메라, 핀치=확대. 손가락을 뗄 때 건설되지 않는다. ----
const canvas=$('world');let drag=null,pinch=null;const touches=new Map();
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{document.activeElement?.blur();try{canvas.setPointerCapture(e.pointerId);}catch{return;}touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const[a,b]=[...touches.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:world.targetZoom};if(drag)drag.moved=true;}if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,started:e.timeStamp,moved:false};});
canvas.addEventListener('pointermove',e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&touches.size===2){const[a,b]=[...touches.values()];world.targetZoom=Math.max(.45,Math.min(1.8,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.d)));return;}if(!drag||e.pointerId!==drag.id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8)drag.moved=true;if(drag.moved)world.pan(e.clientX-drag.lx,e.clientY-drag.ly);drag.lx=e.clientX;drag.ly=e.clientY;});
canvas.addEventListener('pointerup',e=>{touches.delete(e.pointerId);pinch=null;if(!drag||drag.id!==e.pointerId)return;const tap=!drag.moved,held=e.timeStamp-drag.started>=550;drag=null;if(!tap)return;const p=world.point(e.clientX,e.clientY);if(!p)return;const{gx,gy}=toCell(p.x,p.z);if(!inside(gx,gy))return;
 if(mode){pick(gx,gy);return;}
 const neighbor=npcs.find(n=>{if(!n.p.g.visible)return false;const pos=n.p.g.position.clone();pos.y+=.7;const q=world.screen(pos);return Math.hypot(q.x-e.clientX,q.y-e.clientY)<32;});
 if(neighbor&&!state.paused){const v=metrics(state),promise=villagePromises(state).find(p=>!p.done);const lines=[v.food===1?'덕분에 따뜻한 한 끼를 먹을 수 있어요!':'동네에 맛있는 가게가 생기면 좋겠어요.',promise?promise.title+'! 우리 함께 만들어 볼까요?':'약속을 모두 지켰네요. 이 마을에 살아서 좋아요.',['눈 오는 날엔 따뜻한 집이 참 고마워요.','벚꽃이 폈어요! 같이 이 길을 걸어요.','나무 그늘에 앉아 바람을 느껴 봐요.','단풍이 예뻐요. 우리 마을도 많이 자랐네요.'][season(calendarMonth(state))]];neighbor.helloCount=(neighbor.helloCount||0)+1;bubble={p:neighbor.p,text:lines[(neighbor.helloCount-1)%lines.length],end:time+5};toast('이웃을 톡 누르면 마을 이야기를 들을 수 있어요.');return;}
 const b=at(state,gx,gy);if(b&&b.type!=='road'){closePanels();infoId=b.id;$('infoPanel').classList.add('open');info();return;}if(held&&!b&&naturalFeature(gx,gy)&&!state.landscape.cleared.includes(`${gx},${gy}`)){natureInfo(gx,gy);return;}
 if(state.paused||state.ended)return;const from=toCell(world.player.g.position.x,world.player.g.position.z),route=path(state,from,{gx,gy});if(!route.length){if(from.gx===gx&&from.gy===gy)return;toast('갈 수 있는 빈 땅이나 길을 눌러 주세요. 개울은 다리로 건너요.');return;}closePanels();infoId=null;world.followPlayer=true;world.player.route=route;const end=route.at(-1);world.marker.position.set(end.x,world.marker.position.y,end.z);world.marker.visible=true;});
canvas.addEventListener('pointercancel',()=>{drag=null;pinch=null;touches.clear();});canvas.addEventListener('lostpointercapture',()=>{drag=null;pinch=null;touches.clear();});
canvas.addEventListener('wheel',e=>{e.preventDefault();world.targetZoom=Math.max(.45,Math.min(1.8,world.targetZoom-e.deltaY*.001));},{passive:false});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!state.ended)state.paused=true;endPlace();showPause();ui();save('화면 중단');$('error').hidden=false;$('error').textContent='입체 화면이 잠시 중단됐어요. 진행은 저장되어 있어요. 새로고침해 주세요.';});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))dismissPanels();});
// ---- 화면 기준 이동(4번): 방향키·WASD·십자버튼 → 현재 카메라 각도의 화면 위/오른쪽을 지면 XZ에 투영한 연속 벡터로 이동(축 스냅 없음). 수동 입력은 탭 경로를 취소한다.
const keys=new Set(),KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{const k=KEYMAP[e.code];if(!k||e.target.closest?.('input,select,textarea,[contenteditable="true"]'))return;e.preventDefault();keys.add(k);});addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)keys.delete(k);});
addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
addEventListener('focusin',()=>keys.clear());
let stick={ix:0,iy:0,power:0},stickPointer=null;
const moveStick=$('moveStick');
function stopStick(){stick={ix:0,iy:0,power:0};stickPointer=null;$('stickKnob').style.transform='translate(0,0)';}
function dragStick(e){const r=moveStick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;stick=stickVector(dx,dy);const d=Math.hypot(dx,dy)||1,k=Math.min(40,d)/d;$('stickKnob').style.transform=`translate(${dx*k}px,${dy*k}px)`;}
moveStick.addEventListener('pointerdown',e=>{e.preventDefault();if(mode||state.paused||state.ended||document.querySelector('dialog[open]')||stickPointer!==null)return;try{moveStick.setPointerCapture(e.pointerId);}catch{return;}stickPointer=e.pointerId;closePanels();infoId=null;dragStick(e);});
moveStick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)dragStick(e);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])moveStick.addEventListener(name,e=>{if(e.pointerId===stickPointer)stopStick();});
addEventListener('blur',stopStick);document.addEventListener('visibilitychange',stopStick);
$('followPlayer').onclick=()=>{const p=world.player.g.position;world.center.set(p.x,0,p.z);world.followPlayer=true;};
function manualMove(dt){const keyboard=inputVector(keys),usingKeys=keyboard.ix||keyboard.iy,{ix,iy}=usingKeys?keyboard:stick,power=usingKeys?1:stick.power;if(!ix&&!iy)return;if(mode||state.paused||state.ended||document.querySelector('dialog[open]')){keys.clear();stopStick();return;}const v=groundVector(world.angle,ix,iy);if(!v)return;world.player.route=[];world.marker.visible=false;world.followPlayer=true;const roads=roadSet(state);
 const p=world.player.g.position,n=step({x:p.x,z:p.z},v,dt*PLAYER_SPEED*power,(gx,gy)=>walkable(state,gx,gy,roads),CELL,toCell),travel=Math.hypot(n.x-p.x,n.z-p.z);p.x=n.x;p.z=n.z;const target=Math.atan2(v.x,v.z),diff=Math.atan2(Math.sin(target-world.player.g.rotation.y),Math.cos(target-world.player.g.rotation.y));world.player.g.rotation.y+=diff*Math.min(1,dt*14);world.player.distance+=travel;world.player.moving=travel>.0001?1:0;}
// 4. 새 마을·불러오기·이어받기 때 입력 모드·선택·정보창·플레이어 경로·말풍선·주민을 모두 초기화한다.
function resetSession(){celebratedPromises=new Set(villagePromises(state).filter(p=>p.done).map(p=>p.id));lastPromiseCheck=-2;fullCatalogue=false;lastIncomeMilestone=Math.floor(state.pop/4);stopStick();keys.clear();enableCozy(state);lesson=false;$('need').classList.add('hide');for(const n of npcs)world.removePerson(n.p);npcs=[];endPlace();closePanels();infoId=null;sel=null;mode=null;bubble=null;world.marker.visible=false;world.sync(state,false);world.place(world.player,5,6.5);resetView();reviewShown=Math.max(0,Math.floor(state.t/YEAR)-(state.t>0&&state.t%YEAR===0?1:0));npcHomes();lastMonth=month(state);}
// ---- 시각 주민: 집에서 나와 가장 최근 완공한 가게로 길을 따라 걷고 돌아온다. 돈·만족을 바꾸지 않는다. ----
function npcHomes(){const before=npcs.length;syncResidents(state,npcs,world);if(before>=4&&npcs.length>before&&!state.paused){const names={cat:'고양이',fox:'여우',panda:'판다',deer:'사슴'};toast(`마을이 자라 새 이웃이 왔어요! ${npcs.slice(before).map(n=>names[n.p.species]||'새로운').join('·')} 친구를 찾아보세요.`);}}
function npcTick(dt){npcHomes();const next=tickResidents(state,npcs,dt,time,world);if(next&&(!bubble||time>=bubble.end))bubble=next;}
let lastIncomeMilestone=Math.floor(state.pop/4);
// ---- 루프 ----
// 시뮬레이션에는 실제 경과 시간의 1.5배를 준다(느린 기기에서 시간을 깎지 않음). 연출용 dt만 짧게 자른다.
function loop(now){const real=document.hidden?0:(now-last)/1000,dt=Math.min(.25,real);last=now;time+=dt;
 const before=state.buildings.filter(b=>b.progress<1).map(b=>b.id);if(owned)advancePlay(Math.min(real,60));const done=before.filter(id=>{const b=state.buildings.find(b=>b.id===id);return b&&b.progress>=1;});
 if(!state.cozyV&&state.economyV===4&&!done.length&&month(state)===lastMonth&&Math.floor(state.pop/4)>lastIncomeMilestone){lastIncomeMilestone=Math.floor(state.pop/4);if(state.pop===12||state.pop===16)toast(`이웃 ${state.pop}명! 지금 순수입 ${incomeRate(metrics(state))} · 손님과 생활시설이 함께 늘면 수입도 자라요.`);}
 if(done.length){world.sync(state,!reduced);save('완공');const b=state.buildings.find(b=>b.id===done[0]);toast(`${buildingSpec(state,b.type).name} 완성! 마을이 더 다채로워졌어요.`);if(buildingSpec(state,b.type).cap)npcHomes();}
 const m=month(state);if(m!==lastMonth){lastMonth=m;world.sync(state,false);save(monthLabel(state));}

 manualMove(dt);npcTick(dt);if(bubble&&bubble.p.g.visible&&time<bubble.end){const p=bubble.p.g.position.clone();p.y=1.5;const s=world.screen(p);$('bubble').textContent=bubble.text;$('bubble').style.cssText=`display:block;left:${s.x}px;top:${s.y}px`;}else $('bubble').style.display='none';
 if(time>toastEnd)$('toast').classList.remove('show');if(!world.player.route.length)world.marker.visible=false;world.paused=state.paused;world.frame(dt,time,reduced);
 uiTick+=dt;if(uiTick>.25){const growth=state.buildings.filter(b=>b.progress>=1&&isGarden(b)).map(b=>`${b.id}:${growthStage(state,b)}`).join('|');if(growth!==gardenSignature){gardenSignature=growth;world.sync(state,false);}ui();uiTick=0;}if(!reported&&time>3){console.info('village-next render',JSON.stringify(world.renderer.info.render),'memory',JSON.stringify(world.renderer.info.memory));reported=true;}requestAnimationFrame(loop);}
addEventListener('storage',e=>{if(e.key===OWNER){if(otherOwnerAlive()&&owned){owned=false;if(!state.ended)state.paused=true;endPlace();showPause();toast('다른 탭이 마을을 이어받아 이 탭은 멈췄어요.');ui();}return;}
 if(e.key!==KEY||!e.newValue||owned)return;try{const next=parseSave(e.newValue);state=next;state.paused=true;corrupt=null;resetSession();showPause();ui();}catch{}});
// ---- 시작 ----
state.paused=true;resetSession();showPause();ui();
if(!storageOK)toast('저장소를 쓸 수 없어 이번 플레이는 저장되지 않아요.');
if(corrupt){$('corruptDialog').showModal();}else setPaused(false);
$('corruptExport').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([corrupt],{type:'application/json'}));a.download=`개울마을-손상기록-${Date.now()}.json`;a.click();toast('손상된 기록을 파일로 내보냈어요.');};
$('corruptNew').onclick=()=>{if(otherOwnerAlive()){toast('다른 탭에서 마을이 진행 중이에요. 먼저 이 탭에서 이어받아 주세요.');return;}try{localStorage.setItem(BACKUP+'-corrupt',corrupt);}catch{toast('백업에 보관하지 못해 새로 시작하지 않았어요.');return;}corrupt=null;$('corruptDialog').close();save('손상 기록 보관 후 새 마을');setPaused(false);};requestAnimationFrame(loop);
