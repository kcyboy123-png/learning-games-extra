import {sound} from './audio.mjs?v=20261120-quality6-2';
import {nextExperiment,flightProfile,comparisonSummary} from './flight-feedback.mjs?v=20261120-quality6-2';
import {PRESETS,cleanDesign,cleanEnv,cleanLaunch,geometry,simulate,sampleFlight,windAt} from './physics.mjs?v=20261120-quality6-2';
import {load,save} from './state.mjs?v=20261120-quality6-2';
import {cleanMissions,sameConditions} from './gameplay.mjs?v=20261120-quality6-2';
import {GAUGE_HALF_MS,gaugePower,launchFromGauge,designChanges} from './controls.mjs?v=20261120-quality6-2';
import {EVENTS,eventInfo,formatScore,flightScore,COURSES,courseById,courseEnv,emptySports,currentRun,courseKey,selectEvent,unlocked,qualified,winningScore,startTournament,commitFlight,bestScore,nextCourse,flightName,standings} from './sports.mjs?v=20261120-quality6-2';
import {FlightScene} from './scene.mjs?v=20261120-quality6-2';
const $=id=>document.getElementById(id),clone=x=>structuredClone(x);
function updateSound(){
 const b=$('soundButton');b.setAttribute('aria-pressed',String(!sound.settings.muted));b.setAttribute('aria-label',sound.settings.muted?'소리 켜기':'소리 끄기');b.title=sound.settings.muted?'소리 켜기':'소리 끄기';b.dataset.muted=String(sound.settings.muted);
 $('musicVolume').value=Math.round(sound.settings.music*100);$('effectsVolume').value=Math.round(sound.settings.effects*100);
 $('musicVolumeValue').textContent=$('musicVolume').value+'%';$('effectsVolumeValue').textContent=$('effectsVolume').value+'%';
 $('soundStatus').textContent=sound.error||(sound.settings.muted?'모든 소리가 꺼져 있어요. 위쪽 소리 버튼으로 켤 수 있어요.':'배경음과 효과음은 따로 조절할 수 있어요.');
}
sound.onchange=updateSound;updateSound();
let storage=null,loaded;try{storage=localStorage;loaded=load(storage);}catch{loaded={data:null,error:'지금은 저장할 수 없어요. 이번 방문 동안 계속 날릴 수 있어요.'};}
const data=loaded.data??{version:1,design:cleanDesign(),launch:cleanLaunch(),env:cleanEnv(),last:null,match:null};
data.missions=cleanMissions(data.missions);data.sports??=emptySports();data.launch.method='gauge';
let saveBlocked=!!loaded.error,phase='workshop',part='wing',editor='design',foldOpen=false,envOpen=false,flight=null,previous=null,scene=null,presetBefore=null;
let experimentPower=null,appliedExperiment=null;
let chargeAt=0,chargePower=0,flightAt=0,flightTime=0,flightHiddenAt=0,landingAt=0,renderDirty=true,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const design=()=>data.design,launch=()=>data.launch,course=()=>courseById(data.sports.current),run=()=>currentRun(data.sports);
const environment=()=>course()?courseEnv(course()):data.env;
const event=()=>data.sports.event,info=()=>eventInfo(event()),scoreText=value=>formatScore(value,event());
const sportPicker=()=>'<div class="sport-picker" aria-label="비행 종목">'+Object.entries(EVENTS).map(([id,e])=>'<button data-sport="'+id+'" aria-pressed="'+(event()===id)+'"><span aria-hidden="true">'+(id==='distance'?'↗':'◷')+'</span><b>'+e.name+'</b><small>'+(id==='distance'?'날아간 거리':'떠 있는 시간')+'</small></button>').join('')+'</div>';
const flightWords=f=>'떠 있던 시간 '+f.duration.toFixed(2)+'초 · 날아간 거리 '+f.distance.toFixed(2)+' m';
const priorConfig=()=>{if(course()){const r=run()?.records.at(-1)??run()?.previous;return r?{...r,env:environment(),course:course().id}:null;}return data.sports.practice[event()]??null;};
const priorCompatible=()=>sameConditions(priorConfig(),{launch:launch(),env:environment()});
function status(text){if(!saveBlocked)$('status').textContent=text;}
function persist(){if(saveBlocked)return;if(!save(storage,data)){saveBlocked=true;$('status').textContent='지금은 저장할 수 없어요. 이번 방문 동안 계속 날릴 수 있어요.';$('status').classList.add('save-error');}}
if(loaded.error){$('status').textContent=loaded.error;$('status').classList.add('save-error');}
function sceneFail(text){$('webglError').hidden=false;$('webglError').textContent=text;scene=null;$('actionArea').querySelectorAll('button').forEach(b=>b.disabled=true);}
try{scene=new FlightScene($('scene'),sceneFail);scene.setDesign(design(),part);}catch{sceneFail('3D 화면을 열지 못했어요. WebGL을 지원하는 브라우저에서 다시 열어 주세요. 기존 기록은 보관돼요.');}
const icon=(type)=>type==='glider'?'<path d="M6 36 34 5 62 36 36 29 34 38 32 29Z M34 5V38"/>':type==='dart'?'<path d="M4 34 65 3 44 42 31 31 16 39 18 29Z M18 29 65 3 31 31"/>':'<path d="M4 33 34 4 64 33 40 27 34 39 28 27Z M34 4V39"/>';
const rangeText=(id,value,unit)=>['pitch','yaw','elevator'].includes(id)?value===0?(id==='yaw'?'가운데':'평평하게'):(id==='yaw'?(value<0?'왼쪽 ':'오른쪽 '):(value<0?'아래로 ':'위로 '))+Math.abs(value)+'°':value+unit;
const range=(id,label,value,min,max,step,unit,ends)=>`<div class="range-block"><label class="range-label" for="${id}">${label}<output id="${id}Value">${rangeText(id,value,unit)}</output></label><div class="range-adjust"><button data-step-for="${id}" data-step="-1" aria-label="${label} ${step}${unit} 줄이기" ${value<=min?'disabled':''}>−</button><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-valuetext="${rangeText(id,value,unit)}" style="--range-fill:${(value-min)/(max-min)*100}%"><button data-step-for="${id}" data-step="1" aria-label="${label} ${step}${unit} 늘리기" ${value>=max?'disabled':''}>＋</button></div><div class="range-ends"><span>${ends[0]}</span>${['pitch','yaw','elevator'].includes(id)?'<button class="range-zero" data-zero-for="'+id+'" '+(value===0?'disabled':'')+'>'+(id==='yaw'?'가운데로':'평평하게')+'</button>':''}<span>${ends[1]}</span></div></div>`;
const tipHint=()=>design().tip===0?'0 cm는 평평한 날개예요. 길이를 늘리면 방향과 각도를 바꿀 수 있어요.':'양쪽 끝을 '+design().tipAngle+'°만큼 '+(design().tipDirection===1?'위':'아래')+'로 접어요.';
function planePlan(d){
 const g=geometry(d),points=p=>p.map(v=>(v[0]*1000).toFixed(2)+','+((g.nose-v[2])*1000).toFixed(2)).join(' ');
 return '<svg class="plane-plan" viewBox="-110 -12 220 300" role="img" aria-label="개조한 비행기를 위에서 본 모습">'+g.panels.map(p=>'<polygon data-panel="'+p.kind+'" points="'+points(p.points)+'"/>').join('')+Array.from({length:d.clipCount},(_,i)=>'<rect data-plan-clip x="'+((d.clipCount===2?(i===0?-8:8):0)-3)+'" y="'+(d.clipPosition*10-9)+'" width="6" height="18" rx="3"/>').join('')+'</svg>';
}
function updateModificationMemo(){
 const p=priorConfig(),el=$('modificationMemo');if(!p||!el)return;const names=designChanges(p.design,design());el.textContent=names.length?'지난 비행에서 바꾼 것: '+names.join(' · '):'지난 비행과 같은 비행기예요.';const restore=document.querySelector('[data-action="restore"]');if(restore)restore.disabled=names.length===0;
}
const partIcons={paper:'M10 4H28L34 10V36H10Z M28 4V10H34',wing:'M3 31 22 5 41 31 25 26 22 36 19 26Z M22 5V36',tip:'M4 26H31L40 10 M31 26V33',rear:'M4 23H26L40 14 M26 23V32',clip:'M16 12V29a6 6 0 0 0 12 0V10a9 9 0 0 0-18 0V29a12 12 0 0 0 24 0V12'};
function partEditor(){const d=design();let html='<div class="parts" aria-label="개조할 부분">'+[['paper','종이'],['wing','날개 폭'],['tip','날개 끝'],['rear','뒤쪽'],['clip','클립']].map(([id,name])=>`<button data-part="${id}" aria-pressed="${part===id}"><svg viewBox="0 0 44 42" aria-hidden="true"><path d="${partIcons[id]}"/></svg>${name}</button>`).join('')+'</div>';
 if(priorConfig())html+='<p id="modificationMemo" class="modification-memo" role="status" tabindex="-1"></p>';
 if(part==='paper')html+='<h3>어떤 종이로 만들까요?</h3><div class="mod-choices">'+[[70,'가볍게'],[80,'기본'],[100,'무겁게']].map(([v,name])=>'<button data-paper="'+v+'" aria-pressed="'+(d.paperGsm===v)+'"><span class="paper-swatch" aria-hidden="true"></span><b>'+name+'</b><small>'+v+' g/m²</small></button>').join('')+'</div><p class="small">A4 크기는 같아요. 종이 무게를 바꿔 날아가는 모습을 비교해요.</p><p class="small">종이가 휘어지는 차이는 계산하지 않아요.</p>';
 if(part==='wing')html+=range('fold','중앙에서 접는 길이',d.fold,1.5,4.5,.5,' cm',['넓은 날개','좁은 날개'])+'<p class="small">중앙에서 멀리 접으면 날개가 좁아져요.</p>';
 if(part==='tip')html+=range('tip','날개 끝에서 접는 길이',d.tip,0,2,.5,' cm',['접지 않기','2 cm'])+`<div class="segmented"><button data-tip="1" aria-pressed="${d.tipDirection===1}" ${d.tip===0?'disabled':''}>위로 접기 ↗</button><button data-tip="-1" aria-pressed="${d.tipDirection===-1}" ${d.tip===0?'disabled':''}>아래로 접기 ↘</button></div>`+'<h3 class="mod-label">얼마나 꺾을까요?</h3><div class="mod-choices">'+[[20,'살짝'],[40,'기본'],[60,'많이']].map(([v,name])=>'<button data-tip-angle="'+v+'" aria-pressed="'+(d.tipAngle===v)+'" '+(d.tip===0?'disabled':'')+'><svg viewBox="0 0 58 44" aria-hidden="true"><path d="M5 22H31L'+(31+21*Math.cos(v*Math.PI/180)).toFixed(2)+' '+(22-d.tipDirection*21*Math.sin(v*Math.PI/180)).toFixed(2)+'"/></svg><b>'+name+' '+v+'°</b></button>').join('')+'</div><p class="small" id="tipHint">'+tipHint()+'</p>';
 if(part==='rear')html+=range('elevator','뒤쪽 1.8 cm를 꺾는 각도',d.elevator,-12,12,1,'°',['아래로','위로'])+'<p class="small">뒤쪽을 올리거나 내려 기수의 움직임을 살펴봐요.</p>';
 if(part==='clip')html+='<h3>클립을 몇 개 끼울까요?</h3><div class="mod-choices">'+[0,1,2].map(n=>'<button data-clips="'+n+'" aria-pressed="'+(d.clipCount===n)+'"><b>'+n+'개</b><small>'+(n?(n*.5).toFixed(1)+' g 더하기':'클립 빼기')+'</small></button>').join('')+'</div><p class="small">청록색 고리는 앞뒤 무게중심이에요. 클립 2개는 양쪽에 하나씩 끼워요.</p>'+(d.clip?range('clipPosition','앞코에서 클립까지',d.clipPosition,2,12,1,' cm',['앞쪽','뒤쪽']):'<p class="small">클립을 끼우면 위치를 바꿀 수 있어요.</p>');
 return html;
}

const venueIcon=id=>'<svg viewBox="0 0 64 54" aria-hidden="true">'+(id==='school'?'<path d="M8 48V22h48v26M4 22L32 7l28 15M27 48V33h10v15M8 30h12m24 0h12M8 39h12m24 0h12M32 7V1h13v6"/>':id==='city'?'<path d="M13 47V22M4 27l9-17 10 17ZM48 47V18M37 24 48 5l12 19ZM24 38h17v5H24zM27 43v6m12-6v6M3 49h58"/>':'<path d="M5 24q27-25 54 0v23H5zM5 24q27 18 54 0M12 28v15m10-11v14m10-12v14m10-16v14m10-18v15M32 8V1h14v7"/>')+'</svg>';
const windText=e=>e.windSpeed===0?'바람 없음':({'90':'오른쪽 바람','-90':'왼쪽 바람','0':'뒷바람','180':'맞바람'}[e.windDirection]??'바람')+' '+e.windSpeed+' m/s';
const cupDone=()=>!!course()&&run().records.length===3;
const cupRank=()=>cupDone()?standings(course(),run(),event()).find(r=>!r.virtual).rank:null;
function cupOutcome(){
 const next=nextCourse(course());
 if(cupRank()===1)return next?course().invitation:'세계대회 1등! 세 무대의 정상에 올랐어요.';
 if(next&&unlocked(data.sports,next.id))return '이전 1등 기록으로 '+next.short+'에 참가할 수 있어요.';
 return '1등까지 '+scoreText(Math.max(0,winningScore(course(),event())-bestScore(run())))+' 더 '+(event()==='airtime'?'오래':'멀리')+'!';
}
let memoKey='',memo=null;
function lastMemo(){
 const p=priorConfig();if(!p)return '';const key=JSON.stringify(p);if(key!==memoKey){memo=simulate(p.design,p.launch,p.env);memoKey=key;}if(memo.reason!=='landed')return '';
 return '<div class="last-memo"><span>지난 '+info().name+' <b>'+p.launch.power+'% · '+scoreText(flightScore(memo,event()))+'</b></span><p>'+flightWords(memo)+'</p></div>';
}
function cupBanner(){
 const c=course();if(!c)return '';const r=run(),n=r.records.length,visible=phase==='flying'?n-1:n,shown=(phase==='result'||phase==='flying')?n-1:n;
 return '<div class="cup-banner"><span class="cup-place">'+c.name+' · '+info().name+'</span><strong>'+(n===3&&phase!=='flying'?'세 번의 비행 완료':flightName(shown))+'</strong><p>'+info().description+'</p><ol class="flight-slots" aria-label="세 번의 비행 기록">'+[0,1,2].map(i=>'<li class="'+(i<visible?'recorded':i===visible?'current':'')+'"><span>'+(i+1)+'회</span><b>'+(i<visible?scoreText(r.records[i].score):i===visible?(phase==='flying'?'비행 중':phase==='result'?'다음':'준비'):'—')+'</b></li>').join('')+'</ol><div class="cup-rule">'+(visible?'지금 최고 <b>'+scoreText(Math.max(...r.records.slice(0,visible).map(x=>x.score)))+'</b>':'세 번 중 최고 기록으로 1등에 도전해요.')+'</div></div>';
}
function cupResults(){
 if(!cupDone())return '';const rows=standings(course(),run(),event()),best=data.sports.best[courseKey(data.sports)],last=run().records.at(-1);
 return '<div class="last-landing"><strong>마지막 비행 · '+last.launch.power+'% · '+scoreText(last.score)+'</strong></div><div class="cup-finish '+(cupRank()===1?'winner':'retry')+'"><span class="medal-mark"><b>'+rows.find(x=>!x.virtual).rank+'<small>위</small></b></span><h3>'+course().short+(cupRank()===1?' 1등!':' · 다시 도전!')+'</h3><p>'+cupOutcome()+'</p><strong class="cup-total">최고 '+scoreText(bestScore(run()))+'</strong><small>나의 역대 최고 '+scoreText(best)+'</small></div><table class="standings"><caption>'+info().name+' · 큰 기록이 좋아요</caption><thead><tr><th>순위</th><th>참가자</th><th>최고 기록</th></tr></thead><tbody>'+rows.map(x=>'<tr class="'+(!x.virtual?'my-score':'')+'"><td>'+x.rank+'위</td><th scope="row">'+x.name+(x.virtual?' <small>가상</small>':'')+'</th><td>'+scoreText(x.total)+'</td></tr>').join('')+'</tbody></table><p class="small">세 번 중 최고 기록으로 비교해요. 가상 선수도 같은 바람과 물리로 날려요. 공동 1등도 1등으로 인정해요.</p><button class="secondary" data-action="restart-cup">같은 대회 다시 준비</button><button class="text-button" data-action="missions">다른 종목·대회 고르기</button>';
}
function anglePreview(){const l=launch();return '<div id="anglePreview" class="angle-preview" role="img" aria-label="'+(l.pitch<0?'아래로 ':'위로 ')+Math.abs(l.pitch)+'도, 좌우 '+l.yaw+'도 던지는 방향"><svg viewBox="0 0 280 90" aria-hidden="true"><defs><marker id="aimHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="#1483a5"/></marker></defs><path d="M12 65H125M205 65V12" stroke="#b7bda9" stroke-dasharray="3 4"/><path d="M22 65H108" transform="rotate('+(-l.pitch)+' 22 65)" stroke="#1483a5" stroke-width="3" marker-end="url(#aimHead)"/><path d="M205 65V18" transform="rotate('+l.yaw+' 205 65)" stroke="#1483a5" stroke-width="3" marker-end="url(#aimHead)"/><text x="20" y="85">옆에서 · '+rangeText('pitch',l.pitch,'°')+'</text><text x="165" y="85">위에서 · '+(l.yaw===0?'가운데':(l.yaw<0?'왼쪽 ':'오른쪽 ')+Math.abs(l.yaw)+'°')+'</text></svg></div>';}
function workshopControls(){
  const d=design();if(cupDone())return cupBanner()+cupResults();if(editor==='aim')return (!course()?sportPicker():'')+cupBanner()+lastMemo()+anglePreview()+`<h3>어느 쪽으로 날릴까요?</h3><p class="help">파란 화살표처럼 던져요.</p>${range('pitch','던지는 각도',launch().pitch,-5,40,1,'°',['낮게','높게'])}${range('yaw','좌우 방향',launch().yaw,-35,35,1,'°',['왼쪽','오른쪽'])}${envControls()}`;
  return (!course()?sportPicker():'')+cupBanner()+lastMemo()+`<div class="section-heading"><h3>비행기 모양 고르기</h3><span>이대로 날려도 좋아요</span></div><div class="preset-row">${Object.entries(PRESETS).map(([k,p])=>`<button class="preset" data-preset="${k}" aria-pressed="${d.type===k}"><svg viewBox="0 0 70 45" aria-hidden="true">${icon(k)}</svg>${p.name}${(event()==='airtime'?'glider':'dart')===k?'<em class="preset-recommend">추천</em>':''}</button>`).join('')}</div>${presetBefore?'<button class="preset-undo" data-action="undo-preset">방금 고른 모양 되돌리기</button>':''}<details id="foldDetails" ${foldOpen?'open':''}><summary>비행기 개조하기 <small>종이·날개·클립</small></summary>${partEditor()}<div class="design-measures"><span>비행기 무게<strong>${(geometry(d).mass*1000).toFixed(2)} g</strong></span><span>날개 폭<strong>${(geometry(d).span*100).toFixed(1)} cm</strong></span></div></details>${priorConfig()?'<button class="text-button" data-action="restore">지난번 비행기 모양으로 되돌리기</button>':''}`;
}
function envControls(){
 const e=environment();if(course())return '<div class="environment-note">이번 대회 <b>'+windText(e)+'</b><p>세 번 모두 같은 바람이에요.</p></div>';
 return '<details id="envDetails" '+(envOpen?'open':'')+'><summary>바람 바꾸기</summary>'+range('windSpeed','바람 세기',e.windSpeed,0,4,.5,' m/s',['바람 없음','강한 바람'])+'<label for="windDirection">공기가 가는 방향</label><select id="windDirection">'+[[180,'↓ 나를 향해 · 맞바람'],[0,'↑ 앞으로 · 뒷바람'],[90,'→ 오른쪽으로'],[-90,'← 왼쪽으로']].map(([v,t])=>'<option value="'+v+'" '+(e.windDirection===v?'selected':'')+'>'+t+'</option>').join('')+'</select><label class="check"><input id="gust" type="checkbox" '+(e.gust?'checked':'')+' '+(e.windSpeed===0?'disabled':'')+'>바람이 조금씩 변해요</label><p id="gustHint" class="small" '+(e.windSpeed===0?'':'hidden')+'>바람 세기를 올리면 변화도 켤 수 있어요.</p></details>';
}
function preparedControls(){
 const d=design(),l=launch();return cupBanner()+'<div class="plane-card">'+planePlan(d)+'<strong>'+PRESETS[d.type].name+'</strong><span>'+info().description+'</span><span class="mod-summary">'+d.paperGsm+' g/m² · 클립 '+d.clipCount+'개<br>날개 끝 '+(d.tip===0?'접지 않음':d.tip+' cm · '+(d.tipDirection===1?'위로 ':'아래로 ')+d.tipAngle+'°')+'</span></div><div class="flight-settings"><div><span>위아래</span><strong>'+(l.pitch<0?'아래로 ':'위로 ')+Math.abs(l.pitch)+'°</strong></div><div><span>좌우</span><strong>'+(l.yaw===0?'가운데':(l.yaw<0?'왼쪽 ':'오른쪽 ')+Math.abs(l.yaw)+'°')+'</strong></div><div><span>종목</span><strong>'+info().name+'</strong></div></div><p class="help">'+(phase==='flying'?'처음 땅에 닿으면 기록이 정해져요.':'맵 아래 버튼을 누르고, 원하는 힘에서 한 번 더 눌러요.')+'</p>'+(phase==='flying'?'<p class="flight-power">이번에 던진 힘 <strong>'+flight.launch.power+'%</strong></p>':'');
}
function experimentMarkup(){
 if(!flight||flight.reason!=='landed')return '';const p=previous&&sameConditions(previous,flight)?previous:null,next=nextExperiment(flight,event(),p);
 return '<section class="next-experiment" aria-label="다음 비행 실험"><span class="experiment-eyebrow">다음에는 한 가지만</span><p>'+next.reason+'</p><button class="experiment-button" data-action="experiment">'+next.label+'</button><button class="text-button" data-action="modify">직접 접기를 바꾸기</button></section><details class="flight-analysis"><summary>지난 비행과 자세히 비교하기</summary><p class="comparison-note">'+comparisonSummary(flight,previous)+'</p>'+flightProfile(flight,p,event())+'<div class="result-stats"><span>던진 힘 <b>'+flight.launch.power+'%</b></span><span>체공시간 <b>'+flight.duration.toFixed(2)+'초</b></span><span>비거리 <b>'+flight.distance.toFixed(2)+' m</b></span></div><p class="small">'+next.observation+' 추천은 비교할 방법이며, 더 좋은 기록을 보장하지 않아요.</p></details>'+cupBanner();
}
function resultControls(){
 if(cupDone())return cupBanner()+cupResults();if(!flight||flight.reason!=='landed')return '<h3>작업대에서 다시 준비해요</h3><p class="help">이번 비행은 계산 범위를 벗어나 기록에 넣지 않았어요.</p>';
 const value=flightScore(flight,event()),comparable=previous&&sameConditions(previous,flight),delta=comparable?value-flightScore(previous,event()):null;
 return '<div class="result-heading success"><span>'+info().name+'</span><h3>'+(delta>0?'지난 기록을 넘었어요!':'이번 비행의 기록이에요.')+'</h3></div><div class="metric"><strong>'+(value/100).toFixed(2)+'</strong><span>'+info().unit+'</span><small>'+(event()==='airtime'?'출발부터 첫 지면 접촉까지':'출발점과 착륙점 사이의 수평 직선거리')+'</small></div>'+(delta!==null?'<p class="improvement">'+(delta===0?'지난번과 같은 기록이에요.':delta>0?'지난번보다 '+scoreText(delta)+' 더 '+(event()==='airtime'?'오래':'멀리')+'!':'지난 기록까지 '+scoreText(-delta)+' 남았어요.')+'</p>':'')+experimentMarkup();
}
function gaugeMarkup(){
 const prior=priorCompatible()?priorConfig():null;
 return `<div class="dock-gauge"><div class="gauge-heading"><strong id="gaugeLabel">${phase==='charging'?'② 원하는 힘에서 던져요':'① 힘 조절 시작'}</strong><span><b id="gaugeNumber">0</b><small>%</small></span></div><div class="gauge-track" role="meter" aria-label="던지는 힘" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="gaugeFill"></div><div class="gauge-ticks" aria-hidden="true"><i></i><i></i><i></i></div>${prior?`<i class="previous-mark" style="left:${prior.launch.power}%" aria-label="지난번 ${prior.launch.power}%"></i>`:''}${experimentPower!==null?`<i class="experiment-mark" style="left:${experimentPower}%" aria-label="이번 비교 힘 ${experimentPower}%"></i>`:''}<i id="gaugeNeedle" style="left:0%"></i></div><div class="gauge-scale" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div><div class="gauge-foot"><span id="gaugeDirection">살짝</span><span>${experimentPower!==null?'비교 '+experimentPower+'% · 실선'+(prior?' / 지난 '+prior.launch.power+'% · 점선':''):prior?'지난번 '+prior.launch.power+'% · 점선':'힘과 각도를 바꾸며 기록을 비교해요'}</span><span>힘껏</span></div></div>`;
}
function renderDock(){
 const working=phase==='workshop',timing=['ready','charging'].includes(phase);
 const complete=cupDone()&&phase!=='flying',next=course()?nextCourse(course()):null,advance=!!next&&unlocked(data.sports,next.id);
 $('dockContent').innerHTML=complete?'<div class="dock-message"><strong>이번 대회 최고 '+scoreText(bestScore(run()))+'</strong><span>'+cupOutcome()+'</span></div>':timing?gaugeMarkup():working?`<div class="dock-message"><strong>${cupDone()?cupOutcome():appliedExperiment?appliedExperiment.text:priorConfig()?'이 비행기로 다시 날려 볼까요?':course()?'내 비행기로 대회에 참가해요':'준비됐으면, 경기장으로!'}</strong><span>${cupDone()?'기록과 비행기 모양은 보관했어요.':appliedExperiment&&appliedExperiment.kind!=='power'?'다음에는 지난 힘 '+priorConfig().launch.power+'%에 맞춰 직접 던져요.':experimentPower!==null?'다음 힘 게이지에서 '+experimentPower+'% 금빛 선에 맞춰요.':info().name+' · '+windText(environment())}</span></div>`:phase==='flying'?`<div class="dock-message"><strong>${flight.launch.power}%로 출발!</strong><span>중력과 바람을 따라 날아가요.</span><div class="flight-progress" role="meter" aria-label="확정된 던지는 힘" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${flight.launch.power}" style="--locked-power:${flight.launch.power}%"><i id="launchedPower" style="transform:scaleX(${flight.launch.power/100})"></i></div></div>`:`<div class="dock-message"><strong>${flight?.reason==='landed'?flight.launch.power+'% → '+scoreText(flightScore(flight,event())):'다시 준비할 수 있어요.'}</strong><span>${flight?.reason==='landed'?(event()==='distance'?'체공 '+flight.duration.toFixed(2)+'초':'비거리 '+flight.distance.toFixed(2)+' m'):'작업대에서 준비하고 새로운 힘으로 던져요.'}</span></div>`;
 const label=complete?(advance?'다음 대회 준비':'같은 대회 다시 준비'):working?'경기장으로':phase==='ready'?'힘 조절 시작':phase==='charging'?'지금 던지기':phase==='flying'?'날아가는 중':course()?flightName(run().records.length)+' 준비':'작업대에서 다시 준비';
 $('actionArea').innerHTML=`<button id="mainAction" class="primary" data-action="${complete?(advance?'next-cup':'restart-cup'):working?'field':timing?'throw':phase==='result'?'workshop':'none'}" ${phase==='flying'||!scene?'disabled':''}><span>${label}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${phase==='charging'||phase==='flying'?'M3 10 21 3 15 21 11 13 3 10z M11 13 21 3':'M4 12h15M13 5l7 7-7 7'}"/></svg></button>${timing?`<button class="dock-cancel" data-action="${phase==='charging'?'cancel':'workshop'}">${phase==='charging'?'힘 조절 취소':'작업대로'}</button>`:''}`;
}
function updateWind(e,t){
 const w=windAt(e,t),speed=Math.hypot(...w),angle=speed===0?0:Math.atan2(w[0],w[2])*180/Math.PI;
 const names={'0':'뒷바람','90':'오른쪽 바람','-90':'왼쪽 바람','180':'맞바람'};
 $('windName').textContent=e.windSpeed===0?'바람 없음':names[e.windDirection]??'바람';
 $('windValue').textContent=speed.toFixed(1)+' m/s'+(e.gust&&speed>0?(phase==='result'?' · 착륙 때':' · 변화 있음'):'');
 $('windArrow').textContent=speed===0?'○':'↑';$('windArrow').style.transform='rotate('+angle+'deg)';
}
function updateNumbers(){
 updateModificationMemo();const g=geometry(design()),e=environment();if($('gust')){$('gust').disabled=e.windSpeed===0;$('gustHint').hidden=e.windSpeed>0;}$('spanLabel').textContent=`날개 폭 ${(g.span*100).toFixed(1)} cm`;$('paperLabel').textContent='A4 · '+design().paperGsm+' g/m²';$('planeMass').textContent=`${(g.mass*1000).toFixed(2)} g`;
 updateWind(e,phase==='result'&&flight?flight.duration:phase==='flying'?flightTime:0);$('targetBadge').textContent=info().name;
 scene?.setVenue(course()?.venue??'school');scene?.setDiscipline(event());scene?.setEnvironment(e);
 const measures=document.querySelectorAll('.design-measures strong');if($('elevatorValue')){const a=design().elevator,text=a===0?'평평하게':(a<0?'아래로 ':'위로 ')+Math.abs(a)+'°';$('elevatorValue').textContent=text;$('elevator').setAttribute('aria-valuetext',text);}if(measures.length){measures[0].textContent=(g.mass*1000).toFixed(2)+' g';measures[1].textContent=(g.span*100).toFixed(1)+' cm';}
}
function render(keepScroll=false){
 const controlScroll=keepScroll?$('controlContent').scrollTop:0;
 const working=phase==='workshop',busy=['charging','flying'].includes(phase);document.body.dataset.phase=phase;document.querySelector('.app').style.setProperty('--charge',phase==='charging'?chargePower/100:0);document.querySelector('.app').style.setProperty('--release',phase==='flying'?flight.launch.power/100:0);document.body.dataset.motion=reduced?'reduced':'full';document.body.dataset.venue=course()?.venue??'school';
 $('workshopNav').classList.toggle('active',working);$('workshopNav').setAttribute('aria-current',working?'page':'false');$('workshopNav').disabled=phase==='flying';
 const inMission=!!course();$('practiceNav').classList.toggle('active',!inMission);$('missionNav').classList.toggle('active',inMission);$('practiceNav').setAttribute('aria-pressed',String(!inMission));$('missionNav').setAttribute('aria-pressed',String(inMission));
 for(const id of ['practiceNav','missionNav','aboutButton','modelLink'])$(id).disabled=busy;
 $('workbenchTitle').textContent=working?'나의 작업대':phase==='result'?'착륙 기록':'준비한 비행기';$('editorTabs').hidden=!working||cupDone();
 document.querySelectorAll('[data-editor]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.editor===editor)));
 $('controlContent').innerHTML=working?(data.sports.archive?'<div class="season-note">새 비행 시즌 <button class="text-button" data-action="archive">이전 기록 보기</button></div>':'')+workshopControls():phase==='result'?resultControls():preparedControls();$('controlContent').scrollTop=controlScroll;
 $('stageLabel').textContent=course()?course().name+' · '+({workshop:'선수 준비',ready:'출발 준비',charging:'힘 고르기',flying:'비행 중',result:'기록 확정'}[phase]):working?'종이 한 장으로 시작하는 비행':phase==='result'?'다시 도전할 준비':'나의 비행장';
 if(phase==='flying')$('stageLabel').textContent=(course()?.short??'자유비행')+' · '+info().name+' · 비행 중';
 $('stageTitle').textContent=working?'접고, 바꾸고, 날려요.':phase==='charging'?'한 번 더 눌러요.':phase==='result'?(cupDone()?(cupRank()===1?'1등! 멋진 비행이에요.':'다시, 1등에 도전해요.'):'기록을 한 번 더 높여요.'):(event()==='airtime'?'하늘에 오래 머물러요.':'더 멀리 날려요.');
 $('stageHint').textContent=working?(priorConfig()?'이 모양 그대로, 힘만 바꿔도 좋아요.':'모양을 고른 뒤 경기장으로 가요.'): phase==='charging'?'아래 버튼을 한 번 더 누르면 출발!':phase==='flying'?'내가 누른 힘으로 날아가고 있어요.':phase==='result'?'처음 땅에 닿은 곳을 표시했어요.':'파란 화살표가 던지는 방향이에요.';
 for(const id of ['planeInfo','dimension','viewTools'])$(id).hidden=!working;$('windBadge').hidden=working;$('targetBadge').hidden=working;$('flightReadout').hidden=phase!=='flying';$('flightReadout').dataset.sport=event();$('trailLegend').hidden=!(phase==='result'&&previous&&sameConditions(previous,flight));
 $('missionPill').hidden=!course()||working;
 if(course()){const attempt=(phase==='result'||phase==='flying')?run().records.length:Math.min(3,run().records.length+1);$('missionPill').innerHTML='<span>'+info().name+' · '+attempt+' / 3회</span><b>'+('1등 기준 '+scoreText(winningScore(course(),event())))+'</b>';}else $('missionPill').textContent='';
 if($('foldDetails'))$('foldDetails').addEventListener('toggle',e=>foldOpen=e.target.open);
 if($('envDetails'))$('envDetails').addEventListener('toggle',e=>envOpen=e.target.open);
 updateNumbers();renderDock();layoutDock();renderDirty=true;
}
function revealDeck(){if(matchMedia('(max-width:900px)').matches)document.querySelector('.flight-deck').scrollIntoView({block:'start',behavior:'instant'});}
function toWorkshop(){sound.setPhase('workshop');if(run()?.pending){run().pending=false;persist();}phase='workshop';scene?.setMode('workshop');scene?.setDesign(design(),editor==='design'?part:'');render();revealDeck();$('workbenchTitle').focus({preventScroll:true});status('이대로 힘만 바꾸거나, 접기와 각도를 바꿔 다시 날려요.');}
function focusExperiment(kind){
 requestAnimationFrame(()=>{
  const input=$(kind==='fold'?'fold':'pitch'),anchor=kind==='fold'?input?.closest('.range-block'):$('anglePreview');
  if(!anchor||!input)return;
  const deck=document.querySelector('.flight-deck'),sticky=getComputedStyle(deck).position==='sticky';
  anchor.style.scrollMarginTop=(sticky?deck.getBoundingClientRect().height+24:16)+'px';
  anchor.scrollIntoView({block:'start',behavior:'instant'});input.focus({preventScroll:true});
  input.closest('.range-block').classList.add('experiment-changed');
 });
}
function toReady(){if(phase!=='workshop'||!scene||cupDone())return;phase='ready';sound.setPhase('ready');scene.setMode('field');scene.setDesign(design());scene.setReady(launch());render();revealDeck();$('mainAction').focus({preventScroll:true});status('맵 아래 힘 조절 시작을 누르고, 원하는 힘에서 한 번 더 눌러요.');}
function cancelCharge(){if(phase!=='charging')return;phase='ready';sound.setPhase('ready');chargePower=0;render();$('mainAction').focus({preventScroll:true});status('힘 조절을 취소했어요. 다시 시작할 수 있어요.');}
function beginFlight(input){
 experimentPower=null;appliedExperiment=null;sound.setPhase('ready');
 presetBefore=null;const last=priorConfig();previous=last?simulate(last.design,last.launch,last.env):null;
 const d=clone(design()),e=clone(environment());data.launch=input;flight=simulate(d,input,e);flightTime=0;
 if(flight.reason==='landed'){if(course()&&!commitFlight(data.sports,run().id+'-'+(run().records.length+1),flight)){phase='workshop';render();status('작업대에서 다음 비행을 준비해요.');return;}if(!course())data.sports.practice[event()]={id:crypto.randomUUID(),score:flightScore(flight,event()),design:d,launch:clone(input),env:e};persist();}
 if(flight.reason!=='landed'){phase='result';render();return;}
 phase='flying';sound.setPhase('flying');flightHiddenAt=0;landingAt=0;scene.setEnvironment(e);scene.showFlight(flight,previous&&sameConditions(previous,flight)?previous:null);render();$('flightTime').textContent='0.0 초';$('flightHeight').textContent=event()==='distance'?'0.0 m 거리':sampleFlight(flight,0)[1].toFixed(1)+' m 높이';scene.draw(0,'flying',reduced);flightAt=performance.now();sound.effect('launch',input.power);status(`${input.power}%의 힘으로 던졌어요. 착륙하는 곳을 살펴봐요.`);
}
function throwAction(){
 if(!scene)return;
 if(phase==='ready'){phase='charging';sound.setPhase('charging');chargeAt=performance.now();chargePower=0;render();$('mainAction').focus({preventScroll:true});status('움직이는 막대를 보고 지금 던지기를 눌러요.');return;}
 if(phase==='charging'){const input=launchFromGauge(launch(),performance.now()-chargeAt);if(input)beginFlight(input);else{$('gaugeLabel').textContent='② 원하는 힘에서 다시 눌러요';status('아직 출발하지 않았어요. 원하는 힘에서 한 번 더 눌러요.');}}
}
function finish(){flightTime=flight.duration;landingAt=performance.now();phase='result';render();scene?.setEnvironment(flight.env);scene?.draw(flightTime,'result',reduced,0);const won=cupDone()&&cupRank()===1;sound.setPhase('result',won?1.5:.55);sound.effect('land');if(won)sound.effect('win');$('mainAction').focus({preventScroll:true});status(cupDone()?'대회 '+cupRank()+'위! 최고 '+scoreText(bestScore(run()))+'. '+cupOutcome():info().name+' '+scoreText(flightScore(flight,event()))+'. 작업대에서 다시 준비할 수 있어요.');}
function openMissions(){
 $('sportChoices').innerHTML=sportPicker();$('cupCards').innerHTML=COURSES.map((c,i)=>{const open=unlocked(data.sports,c.id),key=courseKey(data.sports,c.id),r=data.sports.runs[key],progress=open&&r&&r.records.length<3;return '<button class="course-card '+c.id+'" data-course="'+c.id+'" '+(!open?'disabled':'')+'><span class="venue-icon" aria-hidden="true">'+venueIcon(c.id)+'</span><span><strong>'+c.name+'</strong><small>'+(!open?COURSES.slice(0,i).find(prior=>!qualified(data.sports,prior.id)).short+' 1등을 하면 열려요':progress?'기록 '+r.records.length+'/3회 · 이어서 준비':info().name+' · '+windText(courseEnv(c))+' · 세 번 중 최고 기록')+'</small><em>'+(!open?'이전 대회 1등 필요':progress?'내 비행기로 이어서 준비':qualified(data.sports,c.id)?'1등 달성 ✓ · 다시 참가':'내 비행기로 참가')+'</em></span></button>';}).join('');if(!$('missionDialog').open)$('missionDialog').showModal();
}
function layoutDock(){
 const dock=document.querySelector('.flight-dock'),deck=document.querySelector('.flight-deck');
 const parent=deck;
 if(dock.parentElement!==parent)parent.append(dock);
}
matchMedia('(max-width:900px)').addEventListener('change',layoutDock);
function restorePending(){
 const r=run();if(!r?.pending||!scene)return false;
 const latest=r.records.at(-1),prior=r.records.at(-2)??r.previous;flight=simulate(latest.design,latest.launch,environment());previous=prior?simulate(prior.design,prior.launch,environment()):null;
 if(flight.reason!=='landed')return false;
 phase='result';landingAt=0;flightTime=flight.duration;scene.setMode('field');scene.setDesign(latest.design);scene.setEnvironment(environment());scene.showFlight(flight,previous);render();scene.draw(flightTime,'result',reduced);status('저장된 비행 결과예요. 같은 비행을 두 번 세지 않아요.');return true;
}
function enterCup(id){
 experimentPower=null;appliedExperiment=null;
 if(!startTournament(data.sports,id,crypto.randomUUID()))return;
 editor='design';part='wing';persist();$('missionDialog').close();
 if(!restorePending())toWorkshop();
}
function storeDesign(){experimentPower=null;appliedExperiment=null;document.querySelectorAll('.experiment-changed').forEach(e=>e.classList.remove('experiment-changed'));presetBefore=null;document.querySelector('[data-action="undo-preset"]')?.remove();data.design=cleanDesign(design());persist();scene?.setDesign(design(),part);updateNumbers();renderDock();renderDirty=true;}
document.addEventListener('click',event=>{
 if(event.target instanceof HTMLDialogElement){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();return;}
 const b=event.target.closest('button');if(!b||b.disabled)return;const action=b.dataset.action;
 if(b.id==='soundButton'){sound.configure('muted',!sound.settings.muted);return;}
 if(event.isTrusted)sound.unlock();
 if(!['charging','flying'].includes(phase)&&action!=='throw')sound.effect(b.dataset.preset||b.dataset.paper||b.dataset.tip||b.dataset.clips||b.dataset.tipAngle?'fold':'click');
 if(b.hasAttribute('data-close')){b.closest('dialog').close();return;}
 if(b.id==='workshopNav'||action==='workshop'){if(phase!=='flying')toWorkshop();return;}
 if(action==='cancel'){cancelCharge();return;}
 if(action==='throw'){throwAction();return;}
 if(['charging','flying'].includes(phase))return;
 if(action==='archive'){const a=data.sports.archive;if(!a)return;$('archiveContent').innerHTML='<p>이전 비행 계산의 기록이에요. 현재 대회의 최고 기록과 따로 보관해요. 다음 대회는 현재 비행 계산에서 1등을 해야 열려요.</p><table class="standings"><thead><tr><th>종목 · 대회</th><th>기록</th></tr></thead><tbody>'+Object.entries(a.best).map(([key,score])=>{const [sport,place]=key.split('-');return '<tr><th>'+eventInfo(sport).name+' · '+courseById(place).short+'</th><td>'+formatScore(score,sport)+'</td></tr>';}).join('')+'</tbody></table><p>이전 시즌의 대회 비행 '+Object.values(a.runs).reduce((n,r)=>n+r.records.length,0)+'회도 원래 입력과 함께 보관했어요.</p>';$('archiveDialog').showModal();return;}
 if(action==='modify'&&phase==='result'&&flight&&!cupDone()){editor='design';foldOpen=true;toWorkshop();document.querySelector('[data-part="'+part+'"]')?.focus();status('바꾸고 싶은 부분을 고른 뒤 다시 날려 보세요.');return;}
 if(action==='experiment'&&phase==='result'&&flight){
  const next=nextExperiment(flight,data.sports.event,previous);experimentPower=null;
  appliedExperiment={kind:next.kind,text:next.kind==='pitch'?'각도 '+launch().pitch+'° → '+next.value+'°로 바꿨어요':next.kind==='fold'?'접는 길이 '+design().fold+' → '+next.value+' cm로 바꿨어요':'힘 '+next.value+'%에 비교 표시를 놓았어요'};
  if(next.kind==='pitch'){launch().pitch=next.value;editor='aim';}
  else if(next.kind==='fold'){design().fold=next.value;part='wing';foldOpen=true;editor='design';}
  else {experimentPower=next.value;editor='aim';}
  persist();toWorkshop();if(next.kind!=='power')focusExperiment(next.kind);status(next.kind==='power'?'다음 힘 게이지의 금빛 표시에 맞춰 직접 눌러 보세요.':next.reason);return;
 }
 if(action==='field'){toReady();return;}
 if(b.id==='practiceNav'){experimentPower=null;appliedExperiment=null;data.sports.current=null;persist();toWorkshop();return;}
 if(b.id==='missionNav'||action==='missions'){openMissions();return;}
 if(b.dataset.sport){if(b.dataset.sport===data.sports.event||!selectEvent(data.sports,b.dataset.sport))return;experimentPower=null;appliedExperiment=null;persist();toWorkshop();if($('missionDialog').open)openMissions();return;}
 if(b.dataset.course){enterCup(b.dataset.course);return;}
 if(action==='next-cup'){const next=nextCourse(course());if(next)enterCup(next.id);return;}
 if(action==='restart-cup'){enterCup(course().id);return;}
 if(b.id==='aboutButton'||b.id==='modelLink'){$('reducedMotion').checked=reduced;$('aboutDialog').showModal();return;}
 if(phase!=='workshop')return;
 if(b.dataset.stepFor||b.dataset.zeroFor){const el=$(b.dataset.stepFor??b.dataset.zeroFor);if(!el||el.disabled)return;if(b.dataset.zeroFor)el.value=0;else if(Number(b.dataset.step)>0)el.stepUp();else el.stepDown();el.dispatchEvent(new Event('input',{bubbles:true}));if(b.disabled)el.focus({preventScroll:true});return;}
 if(action==='undo-preset'&&presetBefore){data.design=clone(presetBefore);storeDesign();render(true);document.querySelector('[data-preset="'+design().type+'"]')?.focus({preventScroll:true});status('모양을 고르기 전의 종이·접기·클립으로 돌아왔어요.');return;}
 if(b.dataset.editor){editor=b.dataset.editor;scene?.setDesign(design(),editor==='design'?part:'');render();document.querySelector(`[data-editor="${editor}"]`)?.focus({preventScroll:true});return;}
 if(b.dataset.preset){if(b.dataset.preset===design().type){status('이미 고른 기본 모양이에요. 개조한 부분도 그대로예요.');return;}const before=clone(design());Object.assign(design(),cleanDesign({type:b.dataset.preset,...PRESETS[b.dataset.preset],paperGsm:design().paperGsm}));storeDesign();presetBefore=before;render(true);document.querySelector(`[data-preset="${b.dataset.preset}"]`)?.focus({preventScroll:true});status(PRESETS[b.dataset.preset].name+' 기본 접기·클립으로 바꿨어요. 종이 선택은 그대로예요.');return;}
 if(b.dataset.part){if(part===b.dataset.part)return;part=b.dataset.part;scene?.setDesign(design(),part);render(true);document.querySelector(`[data-part="${part}"]`)?.focus({preventScroll:true});return;}
 if(b.dataset.paper||b.dataset.tipAngle||b.dataset.clips){const key=b.dataset.paper?'paperGsm':b.dataset.tipAngle?'tipAngle':'clipCount',value=Number(b.dataset.paper??b.dataset.tipAngle??b.dataset.clips);design()[key]=value;if(key==='clipCount')design().clip=value>0;storeDesign();render(true);const attr={paperGsm:'data-paper',tipAngle:'data-tip-angle',clipCount:'data-clips'}[key];document.querySelector('['+attr+'="'+value+'"]')?.focus({preventScroll:true});status(key==='paperGsm'?'종이를 '+value+' g/m²로 바꿨어요. 총무게를 확인해 보세요.':key==='clipCount'?'클립 '+value+'개를 적용했어요.':tipHint());return;}
 if(b.dataset.tip){design().tipDirection=Number(b.dataset.tip);storeDesign();render(true);document.querySelector(`[data-tip="${design().tipDirection}"]`)?.focus({preventScroll:true});return;}
 if(action==='restore'&&priorConfig()){foldOpen=true;data.design=clone(priorConfig().design);storeDesign();render();$('modificationMemo')?.focus({preventScroll:true});status('지난번 종이·접기·클립으로 돌아왔어요. 각도와 바람은 그대로예요.');return;}
 if(b.id==='resetView'&&scene){scene.viewRotation=.18;renderDirty=true;status('비행기를 처음 방향으로 돌렸어요.');return;}
 if(scene&&(b.id==='rotateLeft'||b.id==='rotateRight')){scene.viewRotation+=(b.id==='rotateLeft'?1:-1)*Math.PI/6;renderDirty=true;}
});
document.addEventListener('input',event=>{
 const el=event.target,id=el.id;if(['pitch','yaw','windSpeed','windDirection','gust'].includes(id)){experimentPower=null;appliedExperiment=null;document.querySelectorAll('.experiment-changed').forEach(e=>e.classList.remove('experiment-changed'));if(phase==='workshop')renderDock();}if(id==='musicVolume'||id==='effectsVolume'){sound.configure(id==='musicVolume'?'music':'effects',Number(el.value)/100);return;}if(event.isTrusted)sound.unlock();if(id==='reducedMotion'){reduced=el.checked;document.body.dataset.motion=reduced?'reduced':'full';renderDirty=true;return;}if(phase!=='workshop')return;
 if(['fold','tip','elevator','clipPosition'].includes(id)){design()[id]=Number(el.value);storeDesign();if(id==='tip'){document.querySelectorAll('[data-tip],[data-tip-angle]').forEach(b=>b.disabled=design().tip===0);$('tipHint').textContent=tipHint();}}
 if(['pitch','yaw'].includes(id)){launch()[id]=Number(el.value);persist();$('anglePreview')?.insertAdjacentHTML('afterend',anglePreview());const previews=document.querySelectorAll('#anglePreview');if(previews.length>1)previews[0].remove();}
 if(['windSpeed','windDirection','gust'].includes(id)&&!course()){data.env[id]=id==='gust'?el.checked:Number(el.value);persist();updateNumbers();renderDock();renderDirty=true;}
 const output=$(id+'Value');if(output){const unit=['pitch','yaw','elevator'].includes(id)?'°':id==='windSpeed'?' m/s':' cm',text=rangeText(id,Number(el.value),unit);output.textContent=text;el.setAttribute('aria-valuetext',text);el.style.setProperty('--range-fill',(Number(el.value)-Number(el.min))/(Number(el.max)-Number(el.min))*100+'%');document.querySelectorAll('[data-step-for="'+id+'"]').forEach(b=>b.disabled=Number(b.dataset.step)<0?Number(el.value)<=Number(el.min):Number(el.value)>=Number(el.max));const zero=document.querySelector('[data-zero-for="'+id+'"]');if(zero)zero.disabled=Number(el.value)===0;}
});
document.addEventListener('keydown',e=>{if(e.repeat&&e.target.id==='mainAction'){e.preventDefault();return;}if(e.code==='Escape'&&phase==='charging')cancelCharge();});
document.addEventListener('visibilitychange',()=>{
 sound.visibility(document.hidden);
 if(document.hidden){if(phase==='charging')cancelCharge();else if(phase==='flying'&&!flightHiddenAt)flightHiddenAt=performance.now();}
 else if(flightHiddenAt){flightAt+=performance.now()-flightHiddenAt;flightHiddenAt=0;if(phase==='flying')status('비행을 이어서 보고 있어요.');}
});
function tick(now){
 if(phase==='charging'){chargePower=gaugePower(now-chargeAt);sound.charge(chargePower);const growing=Math.floor((now-chargeAt)/GAUGE_HALF_MS)%2===0,direction=growing?'세져요 →':'← 약해져요';if($('gaugeDirection').textContent!==direction)$('gaugeDirection').textContent=direction;$('gaugeNumber').textContent=chargePower;$('gaugeNeedle').style.left=chargePower+'%';$('gaugeFill').style.transform=`scaleX(${chargePower/100})`;document.querySelector('[role=meter]')?.setAttribute('aria-valuenow',String(chargePower));scene?.setCharge(chargePower);document.querySelector('.app').style.setProperty('--charge',chargePower/100);}
 if(phase==='flying'){flightTime=Math.max(flightTime,Math.min(flight.duration,((flightHiddenAt||now)-flightAt)/1000));const s=sampleFlight(flight,flightTime);$('flightTime').textContent=flightTime.toFixed(1)+' 초';$('flightHeight').textContent=event()==='distance'?Math.hypot(s[0],s[2]).toFixed(1)+' m 거리':Math.max(0,s[1]).toFixed(1)+' m 높이';updateWind(flight.env,flightTime);if(flightTime>=flight.duration)finish();}
 const settling=phase==='result'&&!reduced&&landingAt?Math.max(0,Math.min(1,(now-landingAt)/520)):1;
 if(scene&&(phase==='flying'||phase==='charging'||settling<1||(phase==='result'&&scene.lastDraw?.[3]<1)||renderDirty||scene.needsDraw)){scene.draw(flightTime,phase,reduced,settling);renderDirty=false;}
 requestAnimationFrame(tick);
}
render();restorePending();requestAnimationFrame(tick);
