import {HOUR,startHealth,healthView,healthCare,nextTreatment,changeHealth,healthBlocksPlay} from './health.mjs?v=drop-guide-20261122';
import {playGuide} from './play-guide.mjs?v=opening-20261122';
import {playFeedback,startContactFeedback} from './contact-feedback.mjs?v=drop-guide-20261122';
import {prepareAudio} from './audio.mjs';
import {SCENT_SPOTS,featherReady,scentWarmth,scentReady,rubScent,scentSpot} from './hunt.mjs?v=drop-guide-20261122';
import {dragSample,flickVector,toyRoll,makeToyDrop} from './fetch.mjs?v=opening-20261122';
import {HIDE_SPOTS,nextHideSpot} from './hide.mjs';
import {PLACES,outingPose,loadPlaceImage,outdoorMoment,curiosityPose} from './places.mjs';
import {collectFriends,validateFriends,restoreFriends,validateFriend,restoreFriend,completeWebp,archivedFriends,replaceRememberedFriend} from './friends.mjs?v=drop-guide-20261122';
import {toyName,lifeSuggestion} from './activities.mjs';
import {createMusic} from './music.mjs';
import {foley} from './foley.mjs';
import {contactPhase,responsePose,afterContact,contactTap,nextInvitation} from './companion.mjs';
import {contactTarget,sampleStroke} from './contact.mjs?v=drop-guide-20261122';
import {moveStroke,settleStrokePart} from './stroke.mjs?v=drop-guide-20261122';
import {PETS,petById} from './pets.mjs';
import {KEY,DAY,PHOTO_LIMIT,createPet,careGauge,playBondPose,age,day,asleep as ordinaryAsleep,canEndRest,favorite,interact,remember,inviteReady,cleanName,experience,creditTouch,familiarTouch,sleepReady as ordinarySleepReady,bondStage,preferredPart,reunionMemory,lifeMoment,companionPlace} from './model.mjs?v=drop-guide-20261122';
import {playEntryIntro} from './entry-intro.mjs?v=opening-20261122';
import {Room} from './scene.mjs?v=opening-20261122';
const $=id=>document.getElementById(id);const petGuide='동물의 몸을 누른 채 천천히 움직여 보세요.';
const brushGuide='털 위를 누른 채 천천히 쓸어 주세요. 빗이 따라와요.';
let room;let s=null,broken=false,mode='home',busyUntil=0,lastInput=Date.now(),nextInvite=Date.now()+22000,action=null,speechUntil=0,ready=false,conflict=false,lastSleep=false,pending=null,offer=null,nextApproach=Date.now()+45000,nextDiscovery=Date.now()+60000;
let initialRaw=null;try{initialRaw=localStorage.getItem(KEY);if(initialRaw)s=validateFriend(JSON.parse(initialRaw));}catch(e){broken=true;$('saveError').hidden=false;$('saveError').textContent='이전 기록을 읽지 못했어요. 덮어쓰지 않았습니다. 메뉴에서 원본 내보내기 또는 기록 복구를 해 주세요.';}
const originalRecord=initialRaw;const requestedPet=petById(new URLSearchParams(location.search).get('pet')).id;room=new Room($('scene'),s?.variant??requestedPet);
function persist(){if(!s||broken||conflict)return false;const now=Date.now();const view=s.health?healthView(s.health,Math.max(now,observedHealthWall)):null;if(view?.phase!=='clock'&&view?.phase!=='memorial'){s.seenAt=Math.max(s.seenAt,now);if(view)s.health=view.state;}try{localStorage.setItem(KEY,JSON.stringify(s));$('saveError').hidden=true;return true;}catch(e){$('saveError').hidden=false;$('saveError').textContent='이 기기에 저장하지 못했어요. 메뉴에서 기록 파일을 내보내 주세요. 현재 화면의 기록은 유지됩니다.';return false;}}
function say(text,ms=4500){if($('speech').textContent!==text)$('speech').textContent=text;speechUntil=Date.now()+ms;}
function reactionPose(extra,previous){return room.extraArtReady?extra:previous;}
function sound(type='touch'){if(s?.sound){music.duck();foley(type,room.species);}}
let travelRequest=0,nextOutdoor=Date.now()+12000;const outdoorCycles={},placeSoft=new Map();
const music=createMusic();
function syncMusic(){music.set(!!s?.music&&!document.hidden,s?asleep(s):false,['touch','affection','brush','food','water','reunion'].includes(action?.kind));}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{syncMusic();music.unlock();},{capture:true});
window.addEventListener('pagehide',()=>music.stop());
window.addEventListener('blur',()=>{releaseStroke('pointercancel');room.point=null;});
room.onFootstep=()=>sound('step');
function markInput(){lastInput=Date.now();}
function button(label,fn,icon=''){const b=document.createElement('button');b.type='button';if(icon){const sp=document.createElement('span');sp.className='icon';sp.setAttribute('aria-hidden','true');if(icon==='ball'&&room.propRects?.[0]){const c=document.createElement('canvas');c.className='toy-icon';c.width=c.height=32;c.getContext('2d').drawImage(room.props,...room.propRects[0],0,0,32,32);sp.classList.add('ball-icon');sp.append(c);}else if(icon==='toy')sp.innerHTML='<svg width=26 height=26 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="m5 19 9-9M4 4l1 3 3 1-3 1-1 3-1-3L0 8l3-1zM17 2l1.5 4.5L23 8l-4.5 1.5L17 14l-1.5-4.5L11 8l4.5-1.5zM19 17v4m-2-2h4"/></svg>';else sp.textContent=icon;b.append(sp);}b.append(document.createTextNode(label));b.onclick=()=>{markInput();fn();};return b;}
function chooseMode(next){
 if(next==='play'&&healthBlocksPlay(healthPhase()))return;
 if(lockedHealth(healthPhase()))return;
 if(['invite','discovery'].includes(action?.kind)||(next==='hand'&&action?.kind==='curiosity'))finish();
 mode=next;controls();
}
function renderQueue(){
 const queued=pending?(pending.kind==='touch'?({head:'머리 쓰다듬기',chin:'턱 밑 쓰다듬기',back:'등 쓰다듬기'}[pending.part]):pending.kind==='hide'?'숨바꼭질':pending.kind==='name'?'이름 부르기':pending.kind==='play'?(toyName(room.species,pending.toy)+' 놀이'):pending.kind==='quiet'?(pending.quiet==='window'?'창가에 함께 앉기':'곁에서 쉬기'):({water:'물 마시기',food:'식사',brush:'빗질'}[pending.care])):'';
 const queueButton=$('queued'),queueLabel=queued?queued+' 예약 취소':'예약 없음';
 if(queueButton.textContent!==queued)queueButton.textContent=queued;
 if(queueButton.getAttribute('aria-label')!==queueLabel)queueButton.setAttribute('aria-label',queueLabel);
 if(queueButton.hidden!==!queued)queueButton.hidden=!queued;
}
function queue(next,message){pending=next;renderQueue();say(message);}
function controls(){const el=$('actions'),keyboard=el.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');el.dataset.mode=mode;el.replaceChildren();$('hint').classList.toggle('drag-instruction',mode==='hand'||action?.kind==='brush');if(!['fetch','hunt'].includes(mode)){$('playGuide').hidden=true;room.playGuide=null;room.playAction=null;document.body.dataset.playGuide='false';}const hand=mode==='hand'&&s&&!asleep(s);$('handExit').hidden=!hand;$('camera').hidden=!!hand;$('scene').setAttribute('aria-label',petById(room.variant).name+(hand?'. 직접 눌러 쓰다듬기. 키보드 1은 머리, 2는 턱, 3은 등, Escape는 마치기.':'. 눌러서 인사할 수 있어요.'));if(mode==='hide')$('scene').setAttribute('aria-label','숨바꼭질. 화면의 쿠션을 눌러 친구를 찾아요.');if(mode==='fetch')$('scene').setAttribute('aria-label','장난감을 끌고 놓아요. Enter로 굴리거나 받고 Escape로 마쳐요.');if(mode==='hunt')$('scene').setAttribute('aria-label',room.species==='pig'?'주머니를 문질러 찾기. 방향키 왼쪽/아래/오른쪽으로 주머니 선택, Enter로 문지르기, Escape로 마치기.':room.species==='cat'?'깃털을 끌고 놓아 잡기. Enter로 깃털 움직이기, Escape로 마치기.':'공을 끌고 놓기. Enter로 굴리거나 받기, Escape로 마치기.');if(!s||!ready)return;$('place').hidden=false;$('place').textContent=PLACES[room.place||'home'].name+' · '+(room.place?'장소 바꾸기':'외출');const add=(name,fn,ic)=>el.append(button(name,fn,ic));if(lockedHealth(healthPhase())){$('hint').textContent='';return;}if(asleep(s)){add('조용히 머물기',()=>say('편히 쉬고 있어요. 곁에 있어도 좋아요.'),'☾');add('사진',takePhoto,'◎');add('추억',showAlbum,'▤');if(canEndRest(s))add('함께 쉬기 마치기',()=>{if(canEndRest(s)){s.restUntil=0;persist();update();}controls();},'☀');$('hint').textContent='잠든 친구를 깨우지 않고 함께 있어요.';return;}
 if(mode==='hand'){$('hint').textContent=petGuide;}
 else if(mode==='hide'){if(action?.kind!=='hide')add('다시 숨기',hide,'↻');add('마치기',home,'←');$('hint').textContent=action?.kind==='hide'?'쿠션을 하나씩 눌러 살펴봐요.':'';}
 else if(mode==='hunt'){add('손길',()=>{finish();mode='hand';controls();},'♡');add('같이 쉬기',()=>{finish();quiet('rest');},'☾');add('마치기',home,'←');huntHint();}
 else if(mode==='fetch'){add('손길',()=>{finish();mode='hand';controls();},'♡');add('같이 쉬기',()=>{finish();quiet('rest');},'☾');add('마치기',home,'←');$('hint').textContent='공을 끌거나 빈 바닥을 눌러 그쪽으로 굴려요. 가져오면 눌러 받아요.';}
 else if(mode==='play'){add(room.species==='dog'?'공 주고받기':toyName(room.species,'ball'),()=>play('ball'),'ball');add(room.species==='cat'?'낚싯대 놀이':room.species==='pig'?'냄새로 찾기':toyName(room.species,'bone'),()=>play('bone'),'◇');if(!room.place)add('숨바꼭질',hide,'⌕');else add('같이 쉬기',()=>quiet('rest'),'☾');add('돌아가기',home,'←');$('hint').textContent='장난감을 고르거나 바닥을 눌러 굴릴 방향을 정해요.';}
 else if(mode==='care'){add('물',()=>care('water'),'♧');add('먹이',()=>care('food'),'∪');add('빗질',()=>care('brush'),'≋');add('돌아가기',home,'←');$('hint').textContent=action?.kind==='brush'?brushGuide:'빗질을 누른 뒤 몸 위를 쓸어 보세요.';}
 else{add('손길',()=>{chooseMode('hand');say('',0);$('scene').focus({preventScroll:true});},'♡');if(!healthBlocksPlay(healthPhase()))add('놀이',()=>{chooseMode('play');say('무엇으로 놀까?');},'toy');add('돌봄',()=>{chooseMode('care');say('편안하게 돌봐 주세요.');},'∪');$('hint').textContent=room.place?'바닥을 누르면 걸어요 · 친구를 눌러 쓰다듬어요':'펫을 눌러 인사 · 바닥을 누르면 가까이 다가와요';}
 if(keyboard)(hand||mode==='fetch'||mode==='hunt'?$('scene'):el.querySelector('button'))?.focus({preventScroll:true});
}
function home(){pending=null;if(['fetch','hunt','hide','found'].includes(action?.kind))finish();if(mode==='hand'&&(['affection','contactEnd'].includes(action?.kind)||action?.kind==='touch'&&action.gesture&&!room.stroke)){mode='home';controls();return;}if(['settle','handoff','invite'].includes(action?.kind)){action=null;finish();}if(['curiosity','outing','water','food','brush','hide','rest','window','affection','contactEnd','approach','reunion','discovery'].includes(action?.kind)||action?.kind==='touch')finish();mode='home';controls();}
function releaseToy(){if(room.carry&&room.toyPosition)room.toyX=Math.max(.02,Math.min(.98,room.toyPosition.x/room.w));room.carry=false;}
function begin(pose,ms,kind,done=null){const phase=readHealth(true)?.phase;if(clinic||lockedHealth(phase)||healthBlocksPlay(phase)&&!healthKind(kind))return false;room.playFeedback=null;room.hunt=null;room.toyLift=0;room.ballRoll=null;room.ballDrag=false;room.toyDragY=null;room.toyFloorY=null;room.rollingFrame=null;if(kind==='fetch'||kind==='hunt')room.fetchDrop=null;room.outdoorInterest=null;room.affection=null;room.contactPhase=null;room.stroke=null;if(!s||asleep(s)||conflict)return false;pending=null;if(kind!=='play'||!['curiosity','approach','reunion','discovery'].includes(action?.kind))room.velocity=0;action={kind,at:Date.now(),until:Date.now()+ms,done,from:room.x};busyUntil=action.until;clearOffer();room.touchPart=null;room.familiarTouch=false;room.hide=false;room.prop=null;releaseToy();room.point=null;room.target=room.x;room.setPose(pose);room.motionKind=kind;room.motionStart=performance.now();return true;}
function pet(part='head',gesture=false){
 if(!s)return;if(asleep(s)){say('잠든 친구는 눈으로만 살펴봐요.');return;}
 if(action&&['water','food','brush','play'].includes(action.kind)){queue({kind:'touch',part},'손길을 기억했어요. 하던 일을 마치고 다가올게요.');return;}
 const repeated=Date.now()-(s.care.touch||0)<7000;
 if(!begin({head:8,chin:9,back:10}[part],repeated?1800:3200,'touch'))return;
 room.touchPart=part;room.contactPhase=gesture?'notice':null;room.target=room.x;action.gesture=gesture;action.part=part;
 s.care.touch=Date.now();
 const line={head:'머리를 맡기고 눈을 살며시 감아요.',chin:'턱을 손 쪽으로 살짝 기대어요.',back:'등을 쓰다듬자 편안하게 돌아봐요.'}[part];
 const familiar=familiarTouch(s,part)&&bondStage(s)>=1;room.familiarTouch=familiar;if(!gesture)remember(s,line);sound();say('',0);persist();
}
function clearOffer(){offer=null;$('offer').hidden=true;}
function offerFollowup(kind,label,afterNest=false){
 offer=kind;$('offer').textContent=label;$('offer').hidden=false;
 action={kind:'invite',afterNest,at:Date.now(),until:Date.now()+10000};
}
function welcomeBack(){
 const memory=reunionMemory(s);if(!memory||!begin(11,4800,'reunion'))return false;
 action.memory=memory;busyUntil=0;nextApproach=Date.now()+65000;
 if(memory.kind==='toy'){room.toy=memory.toy;room.toyX=s.bond.toyX;room.target=Math.max(.3,Math.min(.7,room.toyX+(room.x<room.toyX?-.05:.05)));say('지난번 함께 놀던 '+toyName(room.species,memory.toy)+'을 다시 네 곁에 놓으려 해요.',4800);}
 else if(memory.kind==='rest'||memory.kind==='window'){room.target=memory.kind==='window'?.34:s.bond.spot;say(memory.kind==='rest'?'함께 쉬던 자리를 기억하고 있어요.':'나란히 바라보던 창가에서 다시 눈이 마주쳐요.',4800);}
 else{room.target=companionPlace(s);say('익숙한 손길을 기억하고 '+({head:'머리를',chin:'턱을',back:'몸 옆을'}[memory.part])+' 살짝 맡겨요.',4800);}
 persist();return true;
}
function callName(){
 if(!s||!ready||conflict)return;markInput();
 if(asleep(s)){say('새근새근, 이름은 깨어나면 불러 줘요.');return;}if(action?.kind==='name'){say(s.name+'가 네 목소리를 듣고 있어요.');return;}
 if(action&&['water','food','brush','play'].includes(action.kind)){queue({kind:'name'},'목소리를 들었어요. 하던 일을 마치고 다가올 거예요.');return;}
 if(action?.kind==='hide'){say('쿠션을 살짝 눌러 친구를 찾아봐요.',2100);return;}
 if(['fetch','hunt'].includes(action?.kind))finish();
 pending=null;if(!begin(reactionPose(24,11),3400,'name'))return;room.target=room.x+Math.max(-.08,Math.min(.08,.5-room.x));
 experience(s,'name');interact(s,'name');remember(s,'이름을 부르자 나를 바라보며 눈을 맞췄어요');say(s.name+', 여기 있어.');persist();
}
function quiet(kind){
 if(!s)return;if(['fetch','hunt'].includes(action?.kind))finish();if(Date.now()<busyUntil&&action?.kind!=='invite'){queue({kind:'quiet',quiet:kind},'하던 일을 마치고 함께 앉아요.');return;}
 const toySeat=kind==='rest'&&action?.afterNest&&room.toy!=null?room.toyX:null;
 const lying=kind==='rest'&&[3,23].includes(room.renderPose);
 if(!begin(lying?23:5,8500,kind))return;action.lying=lying;mode='home';controls();
 busyUntil=0;
 room.target=lying?room.x:toySeat!=null?Math.max(.3,Math.min(.7,toySeat)):room.place?(kind==='window'?.58:bondStage(s)>=2?.5:Math.max(.4,Math.min(.6,room.x))):kind==='window'?.34:companionPlace(s);
 say(room.place?(kind==='window'?'주변 풍경을 바라보다가 눈을 맞춰요.':'가까이 앉아 편안하게 쉬어요.'):kind==='window'?(room.rain?'빗방울을 함께 바라보다가 눈을 맞춰요.':'창가의 햇살 속에서 함께 눈을 맞춰요.'):'익숙한 쿠션 곁에서 함께 쉬어요.',7000);
}
function invite(){
 const kind=lifeSuggestion(s,room.rain)||nextInvitation(s);s.bond.invitations=Math.min(100000,s.bond.invitations+1);
 nextInvite=Date.now()+65000;offer=kind;room.setPose(kind==='toy'?reactionPose(26,5):5);if(kind==='window'||kind==='rest')room.target=kind==='window'?.34:s.bond.spot;
 if(kind==='toy'){room.toy=favorite(s);room.toyX=Math.min(.76,room.x+.12);}
 const label={toy:'같이 놀기',window:'창가에 함께 앉기',rest:'곁에서 쉬기',water:'놀이 뒤 물 한 모금',brush:'식사 뒤 살살 빗질'}[kind];
 say({toy:'장난감을 네 쪽에 놓았어요. 같이 놀까?',window:'창밖을 보다가 네 쪽을 돌아봐요.',rest:'함께 쉬던 자리에서 기다려요.',water:'놀고 나서 함께 물을 마시던 시간이 떠올랐나 봐요.',brush:'식사 뒤 편안했던 빗질을 기다려요.'}[kind],10000);
 $('offer').textContent=label;$('offer').hidden=false;
 action={kind:'invite',at:Date.now(),until:Date.now()+10000};busyUntil=0;persist();
}
function play(toy,where){
 if(!s||asleep(s)||healthBlocksPlay(healthPhase()))return;
 if(action?.kind==='invite'){action=null;busyUntil=0;}
 if(Date.now()<busyUntil){queue({kind:'play',toy,where},'하던 일을 마치면 같이 놀아요.');return;}
 if(room.species!=='dog'&&toy==='bone')startHunt();
 else startFetch(where,toy);
}
function startHunt(){if(!begin(11,Infinity,'hunt'))return;mode='hunt';action.round=0;action.seed=Math.floor(Math.random()*3);room.hunt=action;controls();say('',0);resetHunt();}
function huntHint(){
 $('hint').textContent=(room.species==='cat'?'깃털을 톡 건드리거나 끌다가 잠깐 멈춰 보세요':'세 점이 밝아지는 곳을 살펴봐요. 방향키 ← · ↓ · → 로도 골라요.')+' · '+(action.round+1)+' / 3';
}
function resetHunt(){const a=action;a.phase='seek';a.distance=0;a.sampleX=null;a.sampleLift=null;a.lastMove=Date.now();a.sniffAt=0;a.rubs=[0,0,0];a.rubX=null;a.drag=null;a.guided=false;a.cursor=room.x;a.warm=0;room.ballDrag=false;room.target=room.x;room.setPose(11);if(room.species==='cat'){room.toy='bone';room.toyX=room.x>.5?.32:.68;room.toyLift=.24;room.toyPosition=null;room.toyPoint=null;}else{room.toy=null;a.goal=SCENT_SPOTS[(a.seed+a.round)%3];}if(a.round)huntHint();}
function moveHunt(x,y){const a=action;if(a.phase!=='seek')return;const next=Math.max(.22,Math.min(.78,x/innerWidth));if(room.species==='cat'){const lift=Math.max(.08,Math.min(.42,(room.ground-y)/room.base)),d=Math.hypot(next-(a.sampleX??room.toyX),lift-(a.sampleLift??room.toyLift));if(d>.002){a.distance+=d;a.lastMove=Date.now();a.sampleX=next;a.sampleLift=lift;}room.toyX=next;room.toyLift=lift;room.ballDrag=true;room.target=next;room.setPose(5);}else{const i=rubScent(a,next);a.guided=true;a.cursor=SCENT_SPOTS[i];room.target=a.cursor;room.setPose(22);a.warm=scentWarmth(a.cursor,a.goal);if(a.drag==null)$('hint').textContent=a.warm>.4?'가까워졌어요. 이 근처를 살펴봐요.':'다른 자리를 골라 냄새를 찾아봐요.';}}
function onFloor(e){return e.clientY>innerHeight*.42&&e.clientY<innerHeight-110;}
function boundedX(x){return Math.max(.22,Math.min(.78,x/innerWidth));}
function huntDown(e){if(!e.isPrimary||action.phase!=='seek'||action.drag!=null)return;if(room.species==='cat'){
 const p=room.toyPoint;if(!p)return;
 action.downX=e.clientX;action.downY=e.clientY;action.travel=0;action.downAt=performance.now();
 action.gripX=p.x-e.clientX;action.gripY=p.y-e.clientY;
 room.toyX=p.x/innerWidth;room.toyLift=(room.ground-p.y)/room.base;action.sampleX=room.toyX;action.sampleLift=room.toyLift;room.ballDrag=true;
 }else if(e.clientY<innerHeight*.42||e.clientY>innerHeight-110)return;action.drag=e.pointerId;playFeedback(room,e,'start',performance.now());markInput();$('scene').setPointerCapture(e.pointerId);if(room.species==='pig'){rubScent(action,boundedX(e.clientX),true);moveHunt(e.clientX,e.clientY);}}
function huntKey(spot){if(action?.kind!=='hunt'||action.phase!=='seek'||action.drag!=null)return;const a=action;if(room.species==='cat'){moveHunt((room.toyX>.5?.34:.66)*innerWidth,room.ground-room.base*.2);a.distance=Math.max(.08,a.distance);}else{a.keySpot=spot??(a.keySpot??0);rubScent(a,SCENT_SPOTS[a.keySpot],true);moveHunt(SCENT_SPOTS[a.keySpot]*innerWidth,room.ground);}}
function recordMiniGame(kind){
 const toy=kind==='fetch'?action.toy:'bone';
 interact(s,toy);s.bond.plays=Math.min(100000,s.bond.plays+1);s.bond.last='play';
 s.bond.lastToy=toy;s.bond.toy=toy;s.bond.toyX=Math.max(.24,Math.min(.76,room.toyX));
 remember(s,kind==='fetch'?toyName(room.species,toy)+'을 세 번 주고받고 눈을 맞췄어요':room.species==='cat'?'깃털을 세 번 잡으며 함께 호흡을 맞췄어요':'냄새를 따라 숨은 장난감을 세 번 찾았어요');
 persist();
}
function huntFound(a,t){
 a.phase='found';a.at=t;a.drag=null;room.ballDrag=false;sound('touch');
 if(a.round===2)recordMiniGame('hunt');
}
function updateHunt(t){if(document.hidden)return;const a=action;if(a.phase==='seek'){if(room.species==='cat'&&a.drag==null&&featherReady(a.distance,t-a.lastMove,Math.abs(room.x-room.toyX))){a.phase='crouch';a.at=t;room.target=room.x;room.setPose(22);room.ballDrag=false;}
 else if(room.species==='pig'){if(a.guided&&(a.rubs?.[scentSpot(a.cursor)]||0)>=1&&scentReady(a.cursor,a.goal,room.x)){a.sniffAt||=t;room.setPose(22);if(t-a.sniffAt>350){room.toy='bone';room.toyX=a.goal;room.target=room.x;room.setPose(1);huntFound(a,t);$('hint').textContent=a.round===2?'세 번 모두 찾았어요! 장난감을 찾은 친구와 눈을 맞춰요.':'찾았어요! 코로 찾고 함께 눈을 맞춰요.';}}else a.sniffAt=0;}}
 else if(a.phase==='crouch'&&t-a.at>650){room.target=room.x;room.toyX=Math.max(.22,Math.min(.78,room.x-room.base/innerWidth*.32));room.setPose(7);room.toyLift=.23;huntFound(a,t);$('hint').textContent=a.round===2?'세 번 모두 잡았어요! 친구와 잠깐 눈을 맞춰요.':'잡았어요! 잠깐 쉬었다가 다시 살살 움직여 주세요.';}
 else if(a.phase==='found'){if(t-a.at>1050)room.setPose(t-a.at<1720?reactionPose(27,playBondPose(s)):playBondPose(s));if(t-a.at>1800+bondStage(s)*200){a.round++;if(a.round===3){a.until=t;finish();say('우리, 호흡이 잘 맞았어.',2800);}else resetHunt();}}}
function startFetch(where,toy='ball'){
 if(!begin(11,Infinity,'fetch'))return;
 mode='fetch';action.phase='ready';action.round=0;action.home=room.x;action.toy=toy;
 room.toy=toy;room.toyX=room.x>.5?room.x-.15:room.x+.15;room.toyPosition=null;room.toyPoint=null;
 controls();say('',0);
 if(where!=null)throwFetch({target:boundedX(where)});
}
function fetchKey(){
 if(action?.kind!=='fetch'||action.drag)return;
 if(action.phase==='offer'){receiveFetch();return;}
 if(action.phase==='ready')throwFetch({target:room.toyX>.5?.26:.74});
}
function receiveFetch(){
 const a=action;if(a?.kind!=='fetch'||a.phase!=='offer')return;
 const point=room.toyPosition;
 if(room.carry&&point&&room.w){
  room.toyX=point.x/room.w;room.carry=false;
  if(!room.reduced){
   room.fetchDrop=makeToyDrop({x:room.toyX,y:point.y+(point.bottomOffset??0),floor:room.ground+7,at:performance.now(),toy:a.toy});
   a.phase='drop';a.dropHit=false;return;
  }
  point.y=room.ground+7;
 }
 completeFetch(a);
}
function completeFetch(a){
 room.carry=false;room.fetchDrop=null;room.toyFloorY=null;
 room.setPose(reactionPose(27,playBondPose(s)));a.phase='thanks';a.at=Date.now();a.round++;
 if(a.round===3)recordMiniGame('fetch');sound('touch');
}
function throwFetch({target,vector={x:0,y:0},now=performance.now()}){
 const a=action;if(a?.kind!=='fetch')return;
 const roll=toyRoll({x:room.toyX,y:room.toyDragY??0,vx:vector.x,vy:vector.y,w:innerWidth,depth:floorDepth(),at:now,target,toy:a.toy});
 a.phase='roll';a.at=Date.now();a.goal=roll.to;a.rollMs=roll.duration;
 room.ballDrag=false;room.toyDragY=null;room.ballRoll=roll;room.setPose(5);sound('step');
}
const floorDepth=()=>Math.min(108,innerHeight*.13);
function hoverToy(e){
 const d=action.drag,now=performance.now();
 dragSample(d,e.clientX,e.clientY,now);
 room.toyX=Math.max(.14,Math.min(.86,d.x+(e.clientX-d.downX)/innerWidth));
 room.toyDragY=Math.max(-floorDepth(),Math.min(0,e.clientY-d.downY));
 room.facing=room.toyX>room.x?1:-1;
}
function fetchDown(e){
 if(!e.isPrimary||action.drag)return;
 const a=action,now=performance.now();
 if(a.phase==='offer'){playFeedback(room,e,'start',now);playFeedback(room,e,'release',now);receiveFetch();return;}
 if(a.phase!=='ready')return;
 playFeedback(room,e,'start',now);
 a.drag={id:e.pointerId,x:room.toyX,facing:room.facing,downX:e.clientX,downY:e.clientY,travel:0,at:now,samples:[{x:e.clientX,y:e.clientY,t:now}]};
 room.ballDrag=true;room.setPose(5);$('scene').setPointerCapture(e.pointerId);sound('touch');
}
function releaseFetch(reason){
 const a=action,d=a?.drag;if(!d)return;
 a.drag=null;room.ballDrag=false;const now=performance.now();
 if(reason!=='pointerup'){room.toyX=d.x;room.toyDragY=null;room.facing=d.facing;room.setPose(11);return;}
 if(d.travel<10&&now-d.at<=450){fetchKey();return;}
 if(d.travel<10){room.toyDragY=null;room.setPose(11);return;}
 throwFetch({vector:flickVector(d,now),now});
}
function updateFetch(t){const a=action;if(a.phase==='roll'){if(t-a.at>240)room.target=a.goal;if(t-a.at>=a.rollMs&&Math.abs(room.x-a.goal)<.018){room.target=room.x;room.toyFloorY=room.ballRoll?.y1??0;room.ballRoll=null;room.rollingFrame=null;room.fetchDrop=null;room.setPose(2);a.phase='pickup';a.at=t;}}
 else if(a.phase==='pickup'&&t-a.at>460){room.carry=room.species==='dog';room.toyFloorY=null;room.target=a.home;room.setPose(11);a.phase='return';}
 else if(a.phase==='return'&&Math.abs(room.x-a.home)>=.012&&room.species!=='dog'){room.toyX=boundedX(room.x+Math.sign(a.home-room.x)*.075);}
 else if(a.phase==='return'&&Math.abs(room.x-a.home)<.012){
  room.target=room.x;room.setPose(11);a.phase='offer';
 }else if(a.phase==='drop'){
  const drop=room.fetchDrop,age=performance.now()-drop.at;
  if(!a.dropHit&&age>=drop.fall){a.dropHit=true;sound('step');}
  if(age<drop.duration)return;
  if(room.toyPosition)room.toyPosition.y=room.ground+7;
  completeFetch(a);
 }
 else if(a.phase==='thanks'&&t-a.at>1100+bondStage(s)*200){if(a.round===3){a.until=t;finish();say('함께 주고받으니 더 즐거웠어.',2800);}else{a.phase='ready';room.setPose(11);$('hint').textContent='공을 끌거나 빈 바닥을 눌러 굴려요 · '+(a.round+1)+' / 3';}}
 else if(a.phase==='thanks'&&t-a.at>=750)room.setPose(playBondPose(s));
}
function care(kind){
 if(kind==='food'&&!['sick','critical'].includes(healthPhase())&&action?.kind!=='food'&&Date.now()-(s.care.food||0)<3600000){say('아직 배불러요. 물을 마시거나 함께 쉬어 볼까요?');return;}
 if(Date.now()<busyUntil){if(action?.kind===kind){say({water:'지금 물을 마시고 있어요.',food:'지금 먹이를 먹고 있어요.',brush:'지금 부드럽게 빗고 있어요.'}[kind]);return;}queue({kind:'care',care:kind},'하던 일을 마치면 '+({water:'물 마시기',food:'식사',brush:'빗질'}[kind])+'로 이어갈게요.');return;}if(!begin(1,kind==='brush'?7500:4200,kind))return;room.prop=kind;room.mealStart=kind==='brush'?null:performance.now();room.brushStroke=null;room.brushAfter=null;if(kind==='brush'){$('hint').textContent=brushGuide;$('hint').classList.add('drag-instruction');}say({water:'천천히 마셔도 괜찮아.',food:'맛있게 먹어.',brush:''}[kind]);sound(kind);persist();}
let previousHide=-1;
const hideNames=['맨 왼쪽','왼쪽 가운데','오른쪽 가운데','맨 오른쪽'];
function hide(){
 if(action?.kind==='hide'||healthBlocksPlay(healthPhase()))return;
 if(Date.now()<busyUntil&&action?.kind!=='found'){queue({kind:'hide'},'하던 일을 마치면 숨바꼭질하자.');return;}
 const keyboard=document.activeElement?.matches(':focus-visible');
 if(!begin(5,Infinity,'hide'))return;
 previousHide=nextHideSpot(previousHide);action.spot=previousHide;action.checked=[];
 room.hide=true;room.toy=null;room.findCue=null;mode='hide';controls();say('쿠션 뒤에 숨었어요. 하나씩 눌러 찾아봐요!',5000);
 drawHideTargets();
 if(keyboard)$('hideTargets').firstElementChild?.focus();
}
function drawHideTargets(){
 const board=$('hideTargets'),active=action?.kind==='hide'&&!$('panel').open&&!action.pause;
 board.hidden=!active;if(!active)return;
 if(!board.childElementCount){
  for(const [i,x] of HIDE_SPOTS.entries()){
   const b=button(hideNames[i]+' 쿠션',()=>checkHide(i));b.style.left=(x*100)+'%';board.append(b);
  }
 }
 board.style.setProperty('--cushion-y',(room.ground??innerHeight-170)+'px');
 for(const [i,b] of Array.from(board.children).entries())b.classList.toggle('checked',action.checked.includes(i));
}
function checkHide(i){
 const a=action;if(a?.kind!=='hide'||a.pause||$('panel').open)return;
 const x=HIDE_SPOTS[i],y=room.ground-28;
 room.findCue={x:x*room.w,y,at:performance.now(),found:i===a.spot};
 room.inputPending=true;
 if(i===a.spot){
  room.hide=false;action=null;busyUntil=0;room.x=x;room.target=x;room.velocity=0;room.moveStartedAt=null;
  begin(reactionPose(26,1),2000,'found');interact(s,'found');remember(s,'쿠션 뒤에서 눈이 마주쳤어요');
  say('찾았다! 쿠션 뒤에서 눈이 마주쳤어요.',2400);sound('touch');persist();controls();drawHideTargets();return;
 }
 if(!a.checked.includes(i))a.checked.push(i);
 if(a.checked.length>=2)say(Math.abs(i-a.spot)===1?'근처 쿠션에서 바스락 소리가 났어요.':'아직 다른 쪽에 숨어 있어요.',2300);
 else say('여기엔 없어요. 다른 쿠션을 살펴봐요.',2200);
 sound('step');drawHideTargets();
}
function finish(){room.playFeedback=null;
 const previous=action,kind=previous?.kind,done=previous?.done,completed=!!previous&&(previous.pause?.wall??Date.now())>=previous.until;
 room.hunt=null;room.toyLift=0;room.ballRoll=null;room.ballDrag=false;room.toyDragY=null;room.toyFloorY=null;room.rollingFrame=null;if(['fetch','hunt'].includes(kind)){mode='home';controls();}
 if(kind==='discovery'&&completed){s.bond.discoveryDay=day(s);persist();}
 if(kind==='brush'){$('hint').classList.remove('drag-instruction');if(mode==='care')$('hint').textContent='빗질을 누른 뒤 몸 위를 쓸어 보세요.';}
 if(completed&&['water','food','brush'].includes(kind)&&!lockedHealth(readHealth(true)?.phase)){if(kind==='water'&&s.bond.last==='play')experience(s,'waterAfterPlay');if(kind==='brush'&&s.bond.last==='food')experience(s,'brushAfterFood');s.care[kind]=Date.now();if(s.health){s.health=healthCare(s.health,kind,Math.max(s.care[kind],observedHealthWall));warningDismissed=false;readHealth(true);}interact(s,kind);remember(s,{water:'깨끗한 물을 마셨어요',food:'편안하게 식사했어요',brush:'털을 부드럽게 빗었어요'}[kind]);}
 if(kind==='outing'&&mode==='home')controls();
 if(completed&&kind==='outing'){interact(s,'outing');remember(s,PLACES[room.place].memory);persist();}
 if(completed&&kind==='water'&&room.place==='picnic'){remember(s,PLACES.picnic.memory);persist();}
 if(kind==='touch'&&!previous.gesture&&Date.now()-previous.at>=1400&&creditTouch(s,{[previous.part]:900}))persist();

 if(kind&&kind!=='invite')nextInvite=Math.max(nextInvite,Date.now()+12000);
 if(completed&&['rest','window'].includes(kind)){s.bond.spot=room.target;experience(s,kind);remember(s,room.place?PLACES[room.place].name+'에서 '+(kind==='rest'?'나란히 쉬었어요':'주변 풍경을 함께 바라보았어요'):kind==='rest'?'익숙한 쿠션 곁에서 함께 쉬었어요':'창가에 나란히 앉아 바깥을 보았어요');}
 if(completed&&['water','food','brush','rest','window'].includes(kind)){s.bond.last=kind;persist();}
 action=null;busyUntil=0;clearOffer();room.affection=null;room.contactPhase=null;room.stroke=null;room.touchPart=null;room.familiarTouch=false;room.brushStroke=null;room.brushAfter=null;room.mealStart=null;releaseToy();room.prop=null;room.point=null;room.hide=false;
 room.target=room.x;room.setPose(asleep(s)?3:kind==='curiosity'&&previous.moment==='settle'&&[3,23].includes(room.renderPose)?23:kind==='rest'&&completed&&[3,23].includes(room.renderPose)?23:((kind==='reunion'&&previous.memory?.kind==='rest')||(kind==='discovery'&&previous.moment==='beside'))&&room.renderPose===23?23:(['curiosity','outing','affection','contactEnd','approach','reunion','discovery'].includes(kind)||kind==='touch'&&previous.gesture)?11:0);
 if(pending&&!asleep(s)&&!conflict){
  if(kind!=='handoff'){room.setPose(11);action={kind:'handoff',at:Date.now(),until:Date.now()+500};busyUntil=action.until;return;}
  const next=pending;pending=null;if(next.kind==='name')callName();else if(next.kind==='touch')pet(next.part);else if(next.kind==='quiet')quiet(next.quiet);else if(next.kind==='play')play(next.toy,next.where);else if(next.kind==='hide')hide();else care(next.care);return;
 }
 if(!completed&&['water','food','brush'].includes(kind)){room.setPose(11);say('잠깐 눈을 맞춰요. 다른 일을 해도 괜찮아요.',2200);}
 if(completed&&!asleep(s)&&['water','food','brush'].includes(kind)){
  const pose=kind==='water'?reactionPose(27,playBondPose(s)):kind==='brush'&&bondStage(s)>=1?reactionPose(25,playBondPose(s)):playBondPose(s);
  room.setPose(pose);action={kind:'settle',at:Date.now(),until:Date.now()+1700,after:kind,ending:previous.ending};
  say(({water:'물 한 모금 마시고 네 쪽을 바라봐요.',food:'잘 먹었어. 곁에서 쉬어도 될까?',brush:'부드러운 손길에 눈이 스르르 감겨요.'})[kind],3500);
 }
 if(completed&&!asleep(s)&&!conflict){
  if(['fetch','hunt'].includes(kind)&&previous.round===3)offerFollowup('water','놀이 뒤 물 한 모금');

 }
 if(kind==='settle'&&previous.after==='water'&&room.place==='picnic'&&!asleep(s)){offer='rest';$('offer').textContent='돗자리에서 함께 쉬기';$('offer').hidden=false;action={kind:'invite',at:Date.now(),until:Date.now()+10000};}
 if(kind==='settle'){
  const routine=previous.after==='food'&&s.bond.experiences.includes('brushAfterFood')?'brush':null;
  if(routine&&!offer){offer=routine;$('offer').textContent=routine==='water'?'놀이 뒤 물 한 모금':'식사 뒤 살살 빗질';$('offer').hidden=false;say('함께하던 순서를 기억하나 봐요. 다른 일을 해도 괜찮아요.');action={kind:'invite',at:Date.now(),until:Date.now()+10000};}
 }
 if(!action&&['affection','settle'].includes(kind)&&bondStage(s)>=1&&Date.now()>=nextApproach&&!asleep(s)&&!conflict&&!$('panel').open&&!document.hidden){if(begin(11,3200,'approach')){busyUntil=0;nextApproach=Date.now()+65000;const step=[0,.04,.08,.12][bondStage(s)];room.target=room.x+Math.max(-step,Math.min(step,.5-room.x));action.part=preferredPart(s);say(room.species==='cat'?'먼저 다가와 익숙한 손길을 기다려요.':room.species==='pig'?'코를 살짝 들고 네 곁으로 다가와요.':'먼저 곁에 와서 고개를 맡겨요.',3200);}}
 done?.();
}
function noticeOutdoors(){const moment=outdoorMoment(room.place,room.species,outdoorCycles[room.place]||0);if(!moment||!begin(11,5200,'curiosity'))return;outdoorCycles[room.place]=(outdoorCycles[room.place]||0)+1;nextOutdoor=Date.now()+52000;action.moment=moment;room.outdoorInterest=moment;action.stage=bondStage(s);busyUntil=0;const near=Math.max(-(.04+action.stage*.025),Math.min(.04+action.stage*.025,.5-room.x));room.target=moment==='greet'?room.x+near:moment==='sniff'||moment==='toy'?Math.max(.32,Math.min(.68,room.x+(room.x>.5?-.04:.04))):room.x;if(moment==='toy'){room.toy=favorite(s);room.toyX=room.target;}say('',0);}
function discover(){
 const kind=lifeMoment(s);if(!kind||!begin(11,5200,'discovery'))return;
 action.moment=kind;busyUntil=0;const today=day(s);s.bond.discoveryAttempts=s.bond.discoveryAttemptDay===today?(s.bond.discoveryAttempts||0)+1:1;s.bond.discoveryAttemptDay=today;s.bond.discoveryAt=Date.now();nextDiscovery=Date.now()+180000;
 if(kind==='toy'){room.toy=favorite(s);room.target=Math.max(.3,Math.min(.7,s.bond.toyX));room.toyX=s.bond.toyX;}
 else room.target=kind==='window'?.34:.5;
 say(kind==='toy'?'오늘은 먼저 익숙한 장난감을 골랐어요.':kind==='window'?(room.rain?'창밖의 빗방울을 살피다가 네 쪽을 돌아봐요.':'햇살을 살피다가 네 쪽을 돌아봐요.'):'네 곁에 먼저 자리를 잡고 편하게 기대어요.',5200);persist();
}
function update(){
 syncMusic();
 const guide=['fetch','hunt'].includes(mode)&&!$('panel').open?playGuide(action,room.species,room.x,room.reduced):null;
 room.playGuide=guide;room.playAction=guide?action:null;
 const guideEl=$('playGuide');guideEl.hidden=!guide;
 if(document.body.dataset.playGuide!==String(!!guide))document.body.dataset.playGuide=String(!!guide);
 if(guide){
  const title=guide.title,steps=guide.steps.map((text,i)=>(i<guide.step?'✓ ':i===guide.step?'▶ ':'')+text).join('  →  '),round='함께 놀기 · '+guide.round+' / 3';
  for(const [id,text] of [['playTitle',title],['playSteps',steps],['playRound',round]])if($(id).textContent!==text)$(id).textContent=text;
 }

 if(!s||!ready)return;
 drawHideTargets();
 const priorPhase=document.body.dataset.health,view=renderHealth(),phase=view?.phase;
 if(view&&priorPhase!==phase&&phase!=='clock'&&phase!=='memorial'&&(s.health.sickAt!==view.state.sickAt||s.health.recoverAt!==view.state.recoverAt))saveHealth(view.state);
 if(lockedHealth(phase)){
  if(action){pending=null;action=null;finish();mode='home';controls();}
  room.target=room.x;room.setPose(23);
  $('placeActivity').hidden=true;
  return;
 }
 const t=Date.now(),sleep=sleepReady(s,action,t);if(asleep(s,t))pending=null;
 room.size=.88+Math.min(1,age(s)/30)*.16;room.night=new Date().getHours()>=19||new Date().getHours()<7;
 room.rain=!room.place&&(s.weather==='rain'||s.weather==='auto'&&Math.floor(t/DAY)%5===2);
 const spot=$('placeActivity'),hideSpot=!room.place||mode!=='home'||sleep||(!!action&&action.kind!=='curiosity')||$('panel').open;if(spot.hidden!==hideSpot)spot.hidden=hideSpot;const label=room.place?PLACES[room.place].activity:'';if(spot.textContent!==label)spot.textContent=label;
 const dayline=$('dayline'),dayText=s.name+'와 함께한 '+day(s)+'일',dayLabel=s.name+' 이름 부르기';if(dayline.textContent!==dayText)dayline.textContent=dayText;if(dayline.getAttribute('aria-label')!==dayLabel)dayline.setAttribute('aria-label',dayLabel);
 const side=room.x<.43?'left':'right';if(document.body.dataset.petSide!==side)document.body.dataset.petSide=side;
 if(sleep!==lastSleep){pending=null;finish();mode='home';controls();const shortcut=$('statusCare');if(shortcut)shortcut.disabled=asleep(s,t);lastSleep=sleep;say(sleep?'새근새근, 곁에서 편히 쉬어요.':'잘 쉬었어. 다시 함께 놀까?');}
 if(sleep)room.setPose(3);
 if(!action&&healthBlocksPlay(phase))room.setPose(23);
 if(action&&!action.pause){
  const dt=t-action.at;
  if(action.kind==='brush'&&t>=action.until&&room.brushStroke?.inside&&performance.now()-room.brushStroke.at<250){
   busyUntil=action.until=t+450;
  }
  if(t>=action.until&&!(action.kind==='touch'&&room.stroke&&!$('panel').open))finish();
  else if(action.kind==='hunt'){updateHunt(t);}
  else if(action.kind==='fetch'){updateFetch(t);}
  else if(action.kind==='curiosity'){room.setPose(curiosityPose(action.moment,room.species,dt));if(action.moment==='greet'&&dt>1800&&Math.abs(room.target-room.x)<.012)room.setPose(action.stage?responsePose(preferredPart(s),'accept',room.species):1);
  }else if(action.kind==='outing'){room.setPose(outingPose(action.activity,room.species,dt));room.target=dt<5100?action.anchor:.5;if(dt>=6400&&bondStage(s)>=1)room.setPose(responsePose(preferredPart(s),'accept',room.species));
  }else if(action.kind==='name'){
   room.setPose(dt<1900?reactionPose(24,11):11);
  }else if(action.kind==='touch'){
   if(room.stroke&&!$('panel').open){settleStrokePart(room.stroke,performance.now());room.touchPart=room.stroke.part;room.familiarTouch=familiarTouch(s,room.touchPart)&&bondStage(s)>=1;sampleStroke(room.stroke,performance.now());action.until=t+350;busyUntil=action.until;const phase=room.stroke.inside===false?'pause':contactPhase(room.stroke,performance.now(),room.contactPhase),key=room.stroke.part+':'+phase;room.responseKey=key;room.contactPhase=phase;room.setPose(responsePose(room.touchPart,phase,room.species));}else room.setPose(action.heldPose??({head:8,chin:9,back:10}[room.touchPart]??1));
  }else if(action.kind==='approach'){room.setPose(dt<700||Math.abs(room.target-room.x)>.01?11:{head:8,chin:9,back:10}[action.part]);
  }else if(action.kind==='reunion'){const m=action.memory;if(m.kind==='toy'&&dt>1800&&(action.picked||Math.abs(room.x-room.target)<.035)){action.picked=true;room.target=companionPlace(s);room.carry=room.species==='dog'&&Math.abs(room.x-room.target)>.025;room.toyX=room.x;room.setPose(Math.abs(room.x-room.target)<.01&&bondStage(s)>=2?{head:8,chin:9,back:10}[preferredPart(s)]:room.species==='cat'?7:room.species==='pig'?22:11);}const arrived=Math.abs(room.target-room.x)<.01;if(m.kind!=='toy')room.setPose(!arrived||dt<900?11:m.kind==='touch'?{head:8,chin:9,back:10}[m.part]:m.kind==='rest'&&bondStage(s)>=3&&dt>2200?23:m.kind==='window'?5:11);
  }else if(action.kind==='discovery'){if(action.moment==='toy'&&dt>1800&&(action.picked||Math.abs(room.x-room.target)<.035)){action.picked=true;room.target=companionPlace(s);room.carry=room.species==='dog'&&Math.abs(room.x-room.target)>.025;room.toyX=room.x;}room.setPose(action.moment==='beside'&&dt>2900?23:action.moment==='window'&&dt<3000?5:action.moment==='toy'&&action.picked?(room.species==='cat'?7:room.species==='pig'?22:11):11);
  }else if(action.kind==='settle'&&dt>=950&&['water','brush'].includes(action.after)){room.setPose(playBondPose(s));
  }else if(action.kind==='contactEnd'){room.setPose(11);
  }else if(action.kind==='affection'){room.setPose(responsePose(room.affection.part,'after',room.species,performance.now()-room.affection.at,room.affection.pose,room.affection.duration));
  }else if(action.kind==='window'){room.setPose(5);}
  else if(action.kind==='rest'){if(action.lying||dt>2400)room.setPose(23);else if(dt>800&&bondStage(s)>=2&&Math.abs(room.target-room.x)<.02)room.setPose(playBondPose(s));}
 }
 if(action?.kind==='touch'&&!room.stroke&&room.affection&&performance.now()-room.affection.at>=room.affection.duration)room.affection=null;
 document.body.classList.toggle('petting-drag',room.touchPart!=null||!!room.affection);
 const motionKind=sleep?'sleep':action?.kind??'idle';if(room.motionKind!==motionKind){room.motionKind=motionKind;room.motionStart=performance.now();}
 renderQueue();
 if(t>speechUntil&&$('speech').textContent)$('speech').textContent='';
 if(clinic||healthBlocksPlay(phase)||recoveryNotice(view)||phase==='warning'&&!warningDismissed)return;
 if(room.place&&mode==='home'&&!action&&!pending&&t>=nextOutdoor&&t-lastInput>=8000&&!$('panel').open&&!document.hidden&&!conflict&&!sleep&&![3,23].includes(room.renderPose)&&Math.abs(room.velocity)<.001){noticeOutdoors();return;}
 if(!room.place&&mode==='home'&&!action&&t>=nextDiscovery&&t-lastInput>=8000&&!$('panel').open&&!document.hidden&&!conflict&&!sleep&&lifeMoment(s,t)){discover();return;}
 if(!room.place&&mode==='home'&&inviteReady({now:t,next:nextInvite,lastInput,busy:!!action,blocked:$('panel').open||document.hidden||conflict,sleeping:sleep}))invite();
}
setInterval(update,160);
function strokeDown(e,frame){
 const {part:hit,pose:startPose,box}=frame;
 if(action?.kind!=='brush')pet(hit,true);room.point={x:e.clientX,y:e.clientY};if(action?.kind==='touch'&&e.isPrimary){const now=performance.now();room.stroke={pointerId:e.pointerId,noticeMs:[480,360,280,240][bondStage(s)],variant:room.variant,pose:startPose,facing:frame.facing,inside:true,sampleAt:now,calmMs:{head:0,chin:0,back:0},started:now,partStarted:now,distance:0,box:{...box},part:room.touchPart,candidate:room.touchPart,zones:frame.zones,region:frame.region,regionCandidate:frame.region,regionSince:now,since:now,changed:now,at:now,x:e.clientX,y:e.clientY,lean:0};startContactFeedback(room,room.stroke);$('scene').setPointerCapture(e.pointerId);}
}
$('scene').addEventListener('pointerdown',e=>{const owner=room.stroke?.pointerId??action?.drag?.id??action?.drag??action?.brushPointer;
 if(!e.isPrimary||owner!=null&&owner!==e.pointerId)return;markInput();if(!s||!ready||$('panel').open||conflict||clinic||lockedHealth(healthPhase()))return;const point={x:e.clientX,y:e.clientY};const frame=contactTarget(room.petBox,point,room.variant,room.renderPose,room.facing,room.previousContact,performance.now(),room.restingCare);
 if(action?.kind==='fetch'||action?.kind==='hunt'){
  const kind=action.kind,cat=kind==='hunt'&&room.species==='cat';
  const toyActive=kind==='fetch'?['ready','offer'].includes(action.phase):cat&&action.phase==='seek';
  const point=room.toyPoint,radius=kind==='fetch'?Math.max(36,room.base*.11):Math.max(40,room.base*.14);
  if(kind==='hunt'&&!cat&&action.phase==='seek'&&Math.abs(e.clientY-(room.ground-12))<48&&Math.abs(e.clientX/innerWidth-SCENT_SPOTS[scentSpot(e.clientX/innerWidth)])<.1){huntDown(e);return;}
  const aimY=kind==='fetch'?point?.grabY:point?.y;
  if(toyActive&&point&&Math.hypot(e.clientX-point.x,e.clientY-aimY)<radius){kind==='fetch'?fetchDown(e):huntDown(e);return;}
  if(kind==='fetch'){
   const roll=room.ballRoll;
   if(action.phase==='offer'||action.phase==='drop'||roll&&!room.reduced&&performance.now()<roll.at+roll.fallMs)return;
  }
  if(frame){finish();mode='hand';controls();strokeDown(e,frame);return;}
  if(kind==='hunt'&&!cat)huntDown(e);
  else if(kind==='fetch'&&action.phase==='ready'&&onFloor(e)){playFeedback(room,e,'start',performance.now());playFeedback(room,e,'release',performance.now());throwFetch({target:boundedX(e.clientX)});}
  return;
 }
 if(action?.kind==='hide')return;if(sleepReady(s,action)){say('새근새근, 편하게 쉬고 있어요.');return;}if(healthBlocksPlay(healthPhase())&&!frame)return;if(action?.kind==='brush'){
  if(frame){
   const now=performance.now();action.brushPointer=e.pointerId;room.point=point;room.brushAfter=null;
   room.brushStroke={pointerId:e.pointerId,variant:room.variant,pose:frame.pose,facing:frame.facing,box:{...frame.box},zones:frame.zones,part:frame.part,candidate:frame.part,region:frame.region,regionCandidate:frame.region,regionSince:now,started:now,partStarted:now,changed:now,since:now,at:now,x:point.x,y:point.y,inside:true};
   startContactFeedback(room,room.brushStroke);$('scene').setPointerCapture(e.pointerId);
  }
  return;
 }if(healthBlocksPlay(healthPhase())&&!frame)return;if((mode==='home'||mode==='play')&&room.toyPoint&&Math.hypot(e.clientX-room.toyPoint.x,e.clientY-room.toyPoint.y)<Math.max(40,room.base*.16)&&(Date.now()>=busyUntil||action?.kind==='invite')){play(room.toy);return;}if(frame){strokeDown(e,frame);}else if(e.clientX>=room.petBox.x&&e.clientX<=room.petBox.x+room.petBox.w&&e.clientY>=room.petBox.y&&e.clientY<=room.petBox.y+room.petBox.h){say('머리나 턱 아래, 몸 옆을 살살 쓰다듬어 주세요.',1800);return;}else if(mode!=='hand'&&Date.now()>=busyUntil&&e.clientY>innerHeight*.42&&e.clientY<innerHeight-115){if(mode==='play'){play(room.toy||favorite(s),e.clientX/innerWidth);}else{if(action?.kind==='outing'&&['sniff','petal'].includes(action.activity)&&Date.now()-action.at<5100){
  room.target=action.anchor=Math.max(.3,Math.min(.7,e.clientX/innerWidth));room.playSignal={x:e.clientX,y:e.clientY,at:performance.now()};say(action.activity==='sniff'?'여기 풀숲도 살펴볼까?':'이쪽 꽃잎을 따라가요.',1800);return;
 }if(['curiosity','outing','rest','window','approach','reunion','discovery'].includes(action?.kind))finish();if(action?.kind==='invite'){action=null;clearOffer();nextInvite=Math.max(nextInvite,Date.now()+12000);room.setPose(11);}room.target=Math.max(.3,Math.min(.7,e.clientX/innerWidth));say('네 곁으로 갈게.',2200);}}});
$('scene').addEventListener('pointermove',e=>{if(action?.kind==='hunt'){if(action.drag===e.pointerId){playFeedback(room,e,'move',performance.now());markInput();if(room.species==='cat')action.travel=Math.max(action.travel,Math.hypot(e.clientX-action.downX,e.clientY-action.downY));moveHunt(e.clientX+(action.gripX||0),e.clientY+(action.gripY||0));}return;}if(action?.kind==='fetch'){if(action.drag?.id===e.pointerId){playFeedback(room,e,'move',performance.now());markInput();hoverToy(e);}return;}if(!e.isPrimary||(room.stroke&&room.stroke.pointerId!==e.pointerId))return;if(e.buttons&&s&&!sleepReady(s,action)&&!$('panel').open&&!conflict){markInput();if(room.stroke){if(moveStroke(room.stroke,{x:e.clientX,y:e.clientY},performance.now())){room.inputPending=true;if(room.touchPart!==room.stroke.part){room.touchPart=room.stroke.part;room.setPose(responsePose(room.touchPart,'notice',room.species));room.familiarTouch=familiarTouch(s,room.touchPart)&&bondStage(s)>=1;}room.point={x:e.clientX,y:e.clientY};}else{room.point=null;}}else if(action?.kind==='brush'&&action.brushPointer===e.pointerId){
 const point={x:e.clientX,y:e.clientY};room.point=room.brushStroke&&moveStroke(room.brushStroke,point,performance.now())?point:null;room.inputPending=true;
 }else if(action?.kind==='touch'&&room.touchPart)room.point={x:e.clientX,y:e.clientY};}});
function releaseStroke(reason,event){if(action?.pause)return;
 const owner=room.stroke?.pointerId??action?.drag?.id??action?.drag??action?.brushPointer;
 if(event&&owner!=null&&owner!==event.pointerId)return;if(room.playFeedback&&(!event||room.playFeedback.id===event.pointerId)&&room.playFeedback.released==null){if(reason==='pointerup'&&event)playFeedback(room,event,'release',performance.now());else playFeedback(room,event,'cancel',performance.now());}
 if(action?.kind==='brush'){if(action.brushPointer!=null){delete action.brushPointer;room.point=null;room.brushStroke=null;room.brushAfter=reason==='pointerup'?performance.now():null;if(reason==='pointerup'&&action.until-Date.now()<420)busyUntil=action.until=Date.now()+420;if(reason!=='pointerup')room.contactFeedback=null;room.inputPending=true;}return;}if(action?.kind==='hunt'){if((reason==='lostpointercapture'||reason==='pointerleave')&&action.drag==null)return;if(reason==='pointerup'&&event&&action.drag!=null&&action.phase==='seek'&&room.species==='cat'){
 const travel=Math.max(action.travel,Math.hypot(event.clientX-action.downX,event.clientY-action.downY));
 if(travel<10&&performance.now()-action.downAt<=450){const offset=room.toyX>.5?-.08:.08;moveHunt((room.toyX+offset)*innerWidth,room.ground-room.base*Math.min(.42,room.toyLift+.055));}
 else moveHunt(event.clientX+action.gripX,event.clientY+action.gripY);
 }action.drag=null;room.ballDrag=false;if(reason!=='pointerup'){action.distance=0;action.sniffAt=0;action.guided=false;}return;}if(action?.kind==='fetch'){
 const d=action.drag;
 if(reason==='pointerup'&&event&&d)hoverToy(event);
 releaseFetch(reason);return;
 }const stroke=room.stroke;room.point=null;room.stroke=null;room.contactPhase=null;room.responseKey=null;if(!stroke||action?.kind!=='touch')return;if(reason==='pointerup'&&stroke.inside!==false)room.lastTouchRelease=performance.now();sampleStroke(stroke,performance.now());if(reason==='pointerup'&&creditTouch(s,stroke.calmMs)){room.familiarTouch=familiarTouch(s,stroke.part)&&bondStage(s)>=1;remember(s,'부드러운 손길을 편안하게 받아 주었어요');persist();}const reaction=afterContact(stroke,performance.now(),reason,room.familiarTouch);if(asleep(s)||conflict)return;if(!reaction&&contactTap(stroke,performance.now(),reason)){room.affection={at:performance.now(),duration:240,from:{...room.reaction},direction:0,part:stroke.part,pose:room.renderPose};room.touchPart=stroke.part;room.setPose(responsePose(stroke.part,'accept',room.species));action={kind:'touch',part:stroke.part,gesture:true,heldPose:room.renderPose>=28&&room.renderPose<=34||room.renderPose===36?room.renderPose:null,at:Date.now(),until:Date.now()+1100+bondStage(s)*120};busyUntil=0;return;}if(!reaction){if(reason==='pointerup'&&stroke.inside!==false)room.affection={at:performance.now(),duration:420,from:{...room.reaction},direction:0,part:stroke.part,pose:room.renderPose};room.touchPart=null;room.setPose(11);action={kind:'contactEnd',at:Date.now(),until:Date.now()+420};busyUntil=0;return;}reaction.duration+=bondStage(s)*180;reaction.pose=room.renderPose??room.pose;reaction.deepContact=room.familiarTouch&&performance.now()-stroke.started>=5000&&Object.values(stroke.calmMs||{}).reduce((a,b)=>a+b,0)>=1200;reaction.from={...room.reaction};room.affection=reaction;room.touchPart=null;action={kind:'affection',at:Date.now(),until:Date.now()+reaction.duration};busyUntil=0;if(reaction.part==='chin'&&room.species==='dog'&&Math.abs(reaction.direction)>.25)room.target=Math.max(.3,Math.min(.7,room.x+reaction.direction*.025));sound('breath');}
for(const type of ['pointerup','pointercancel','pointerleave','lostpointercapture'])$('scene').addEventListener(type,e=>{if(e.isPrimary&&(!room.stroke||room.stroke.pointerId===e.pointerId))releaseStroke(type,e);});
for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture'])$('scene').addEventListener(type,()=>{if(ready&&room.active)room.inputPending=true;});
function directionalPlay(e){
 if((action?.kind==='hunt'&&room.species==='pig')&&['ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)){
 e.preventDefault();if(e.repeat)return true;markInput();const spot=['ArrowLeft','ArrowDown','ArrowRight'].indexOf(e.key);
 if(action.kind==='hunt')huntKey(spot);

 return true;
 }
}
$('actions').addEventListener('keydown',directionalPlay);
$('scene').addEventListener('keydown',e=>{if(clinic||lockedHealth(healthPhase()))return;if((action?.kind==='hunt'||action?.kind==='fetch'||action?.kind==='hide')&&e.repeat&&['Enter',' ','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();return;}
 if(directionalPlay(e))return;if(action?.kind==='hunt'&&['Enter',' ','Escape'].includes(e.key)){e.preventDefault();markInput();e.key==='Escape'?home():huntKey();return;}if(action?.kind==='fetch'&&['Enter',' ','Escape'].includes(e.key)){e.preventDefault();markInput();e.key==='Escape'?home():fetchKey();return;}if(mode==='hand'&&['1','2','3','Escape'].includes(e.key)){e.preventDefault();markInput();if(e.repeat)return;if(e.key==='Escape')home();else pet({'1':'head','2':'chin','3':'back'}[e.key]);return;}if(action?.kind==='hide')return;if(e.key==='Enter'||e.key===' '){e.preventDefault();markInput();if(!e.repeat)pet();}});
function canPauseActivity(){return ['play','hide','fetch','hunt','water','food','brush'].includes(action?.kind);}
function pauseActivity(){
 if(action.pause)return;
 playFeedback(room,null,'cancel',performance.now());
 const canvas=$('scene'),id=action.kind==='fetch'?action.drag?.id:action.drag??action.brushPointer;
 if(id!=null){
  releaseStroke('pointercancel');
  if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 }
 action.pause={wall:Date.now(),frame:performance.now()};
 room.active=false;
}
function resumePanel(){
 if($('panel').open||document.hidden)return;
 if(action?.pause){
  const wall=Date.now()-action.pause.wall,frame=performance.now()-action.pause.frame;
  action.at+=wall;if(room.fetchDrop)room.fetchDrop.at+=frame;if(room.mealStart!=null)room.mealStart+=frame;
  if(Number.isFinite(action.until)){action.until+=wall;busyUntil=action.until;}
  if(action.lastMove!=null)action.lastMove+=wall;
  if(action.sniffAt)action.sniffAt+=wall;
  if(room.ballRoll)room.ballRoll.at+=frame;
  if(room.moveStartedAt!=null)room.moveStartedAt+=frame;
  delete action.pause;
 }
 room.active=!document.hidden;
 markInput();
}
function panel(title){travelRequest++;if(canPauseActivity())pauseActivity();else releaseStroke('pointercancel');if(['curiosity','approach','reunion','discovery'].includes(action?.kind))finish();room.point=null;markInput();const body=$('panelBody');body.replaceChildren();const h=document.createElement('h2');h.id='panelTitle';h.textContent=title;body.append(h);if(!$('panel').open)$('panel').showModal();return body;}
function para(body,text){const p=document.createElement('p');p.textContent=text;body.append(p);return p;}
function option(body,label,fn){const b=button(label,fn);b.className='soft';body.append(b);return b;}
function close(){travelRequest++;if($('panel').open)$('panel').close();resumePanel();}
$('closePanel').onclick=close;$('panel').addEventListener('close',resumePanel);$('panel').addEventListener('click',e=>{if(e.target===$('panel')){const r=$('panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
let photoPending=false;
async function takePhoto(){if(!s||!ready||photoPending||broken||conflict||lockedHealth(healthPhase()))return;if(s.photos.length>=12){showAlbum();say('사진 12장을 간직하고 있어요. 내보내거나 골라 정리해 주세요.');return;}const record=s,at=Date.now(),sleeping=asleep(s),photoPlace=room.place;let photoSaved=false,photoAdded=false;photoPending=true;const albumButton=$('albumCapture');if(albumButton){albumButton.disabled=true;albumButton.textContent='사진 저장 중…';}$('camera').disabled=true;$('camera').setAttribute('aria-busy','true');try{const url=await room.photo();if(s!==record||broken||conflict)return;if(!completeWebp(url))throw Error('사진 형식 오류');if(url.length>PHOTO_LIMIT){say('사진이 너무 커서 저장하지 못했어요.');return;}s.photos.push({at,url});photoAdded=true;remember(s,photoPlace?PLACES[photoPlace].name+'에서 함께 사진을 남겼어요':'함께한 순간을 사진으로 남겼어요');if(!persist()){say('사진은 임시로 담았어요. 추억에서 사진 저장으로 보관해 주세요.',6000);return;}photoSaved=true;if(!sleeping&&!asleep(s)){sound('photo');$('scene').classList.remove('shutter');void $('scene').offsetWidth;$('scene').classList.add('shutter');}say(asleep(s)?'잠든 모습을 조용히 간직했어요.':'이 순간을 추억에 담았어요.');}catch{say('사진을 담지 못했어요. 잠시 뒤 다시 찍어 주세요.');}finally{photoPending=false;$('camera').disabled=false;$('camera').removeAttribute('aria-busy');if(photoAdded&&$('panel').open&&$('albumCapture')){const draft=$('panelBody').querySelector('form'),focus=document.activeElement,scroll=$('panelBody').scrollTop;showAlbum();if(draft){$('panelBody').append(draft);if(draft.contains(focus))focus.focus({preventScroll:true});}$('panelBody').scrollTop=scroll;}const capture=$('albumCapture');if(capture){capture.disabled=s.photos.length>=12;capture.textContent='사진 찍기';if(albumButton){let status=$('albumCaptureStatus');if(!status){status=document.createElement('p');status.id='albumCaptureStatus';status.setAttribute('role','status');capture.after(status);}status.textContent=$('speech').textContent;}}const note=$('photoSwitchStatus');if(note)note.textContent=photoSaved?'사진 저장이 끝났어요. 이제 만나러 가기를 다시 눌러 주세요.':'사진 저장을 마치지 못했어요. 보관함에서 사진을 확인해 주세요.';}}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function showAlbum(){if(!s)return;if(healthPhase()==='memorial'){showMemorial(s);return;}const body=panel('우리의 추억');if(!$('saveError').hidden)para(body,'아직 기기에 저장하지 못한 임시 기록이 있어요. 사진 저장이나 메뉴의 기록 내보내기로 먼저 보관해 주세요.');para(body,s.name+'와 함께한 '+day(s)+'일. 작은 순간들을 간직해요.');if(age(s)>=30)para(body,'우리의 첫 30일을 함께했어요. 앞으로도 같은 친구와 계속 지내요.');para(body,'첫 추억과 30일 기념은 간직하고, 나머지는 최근 기록으로 채워요. 사진은 직접 지우기 전까지 남아요.');para(body,'사진 '+s.photos.length+'/12장'+(s.photos.length>=12?' · 사진 저장으로 보관한 뒤 한 장을 지우면 다시 찍을 수 있어요.':''));const capture=option(body,'사진 찍기',takePhoto);capture.id='albumCapture';capture.disabled=s.photos.length>=12||photoPending;if(photoPending)capture.textContent='사진 저장 중…';option(body,'한 줄 남기기',()=>{const existing=body.querySelector('form input');if(existing){existing.focus();return;}const form=document.createElement('form'),input=document.createElement('input'),b=document.createElement('button');input.maxLength=80;input.placeholder='오늘 기억하고 싶은 순간';input.setAttribute('aria-label','오늘의 한 줄');b.textContent='간직하기';b.className='primary';form.append(input,b);body.append(form);input.focus();form.onsubmit=e=>{e.preventDefault();if(input.value.trim()){const before=s.memories.slice();remember(s,input.value.trim().slice(0,80));if(persist())showAlbum();else{s.memories=before;let error=form.querySelector('[role=status]');if(!error){error=para(form,'');error.setAttribute('role','status');}error.textContent='저장하지 못했어요. 쓴 글은 그대로 두었어요. 저장 공간을 확인한 뒤 다시 간직하기를 눌러 주세요.';}}};});const grid=document.createElement('div');grid.className='photos';s.photos.forEach((photo,i)=>{const f=document.createElement('figure'),img=new Image(),cap=document.createElement('figcaption'),a=document.createElement('a');img.loading='lazy';img.decoding='async';img.src=photo.url;img.alt=s.name+'의 추억 사진 '+(i+1);cap.textContent=new Date(photo.at).toLocaleDateString('ko-KR');a.href=photo.url;a.download='우리의-추억-'+(i+1)+'.webp';a.textContent='사진 저장';f.append(img,cap,a);const del=button('삭제',()=>{const confirm=panel('이 사진을 지울까요?');para(confirm,'사진 저장으로 먼저 보관할 수 있어요. 다른 기록은 유지됩니다.');option(confirm,'취소',showAlbum);option(confirm,'이 사진 삭제',()=>{const old=s.photos.slice();s.photos.splice(i,1);const saved=persist();if(!saved)s.photos=old;showAlbum();if(!saved)para($('panelBody'),'삭제하지 못했어요. 사진은 그대로 보관하고 있어요. 저장 설정을 확인해 주세요.');});});del.setAttribute('aria-label',(i+1)+'번째 사진 삭제');f.append(del);grid.append(f);});body.append(grid);if(!s.photos.length)para(body,'위의 사진 찍기를 눌러 첫 사진을 남겨 보세요.');for(const m of s.memories.slice().reverse()){const row=document.createElement('div'),small=document.createElement('small');row.className='memory';small.textContent=m.day+'일째';row.append(small,document.createTextNode(m.text));body.append(row);}}
function choosePet(){
 const body=panel('우리의 친구들');para(body,'친구마다 이름과 함께한 날, 추억을 따로 간직해요. 이전 친구의 기록도 남아 있어요.');
 const grid=document.createElement('div');grid.className='pet-grid';body.append(grid);
 for(const p of PETS){const b=button(p.name,()=>{
  if(s?.variant===p.id){close();return;}
  const confirm=panel(p.name+' 만나기');para(confirm,s?'지금 친구의 기록을 보관한 뒤 선택한 친구를 만나요.':'선택한 친구를 만나 이름을 지어 주세요.');
  option(confirm,'돌아가기',choosePet);option(confirm,'만나러 가기',()=>{
   try{
    if(photoPending){if(!$('photoSwitchStatus'))para(confirm,'사진을 담는 중이에요. 저장을 마친 뒤 친구를 바꿔 주세요.').id='photoSwitchStatus';return;}if(broken||conflict)throw Error('먼저 현재 기록을 복구하거나 새로고침해 주세요.');
    const slot=KEY+'-pet-'+p.id,raw=localStorage.getItem(slot);let target=raw?validateFriend(JSON.parse(raw)):null;
    if(target&&target.variant!==p.id)throw Error('친구 기록이 일치하지 않아요. 원본 기록을 확인해 주세요.');
    if(s)localStorage.setItem(KEY+'-pet-'+s.variant,JSON.stringify(s));
    if(target)localStorage.setItem(KEY,JSON.stringify(target));else localStorage.removeItem(KEY);
    location.href=location.pathname+'?pet='+encodeURIComponent(p.id);
   }catch(e){para(confirm,'친구를 바꾸지 못했어요. '+e.message);}
  });
 });b.setAttribute('aria-label',p.name+' 선택');b.setAttribute('aria-pressed',String(room.variant===p.id));
 const img=new Image();img.loading='lazy';img.src=p.id==='puppy'?'assets/puppy-detail.webp':'assets/pets/'+p.id+'/detail.webp';img.alt='';b.prepend(img);grid.append(b);}
}
function showPlaces(){if(!s||!ready||healthBlocksPlay(healthPhase()))return;const body=panel('어디로 함께 갈까요?');para(body,'장소를 바꾸면 하던 활동은 멈춰요. 추억과 사진은 그대로 간직해요.');for(const [id,place]of Object.entries(PLACES)){const b=option(body,place.name,()=>travel(id,body));b.classList.add('place-choice');b.dataset.place=id;if((room.place||'home')===id)b.setAttribute('aria-current','location');b.disabled=(room.place||'home')===id||(id!=='home'&&asleep(s));const small=document.createElement('small');small.textContent=(room.place||'home')===id?'지금 함께 있는 곳':place.description;b.append(small);}para(body,'다시 접속하면 우리 집에서 만나요.');}
async function travel(id,body){if(!s||conflict||clinic||healthBlocksPlay(healthPhase())||!Object.hasOwn(PLACES,id))return;if(id!=='home'&&asleep(s)){say('친구가 깨어나면 함께 나가요.');return;}const request=++travelRequest,friend=s;let loading=body.querySelector('[data-travel-status]');if(!loading){loading=para(body,'');loading.dataset.travelStatus='';loading.setAttribute('role','status');}loading.textContent=PLACES[id].name+' · 준비하고 있어요…';try{const image=id==='home'?(await room.loadBackground(room.night,true),null):await loadPlaceImage(id);if(request!==travelRequest||s!==friend||conflict||!$('panel').open)return;if(id!=='home'&&asleep(s))throw Error('친구가 잠들었어요. 깨어나면 다시 나가요.');let soft=null;if(image){soft=placeSoft.get(id);if(!soft){soft=room.softBackground(image);placeSoft.set(id,soft);}}pending=null;releaseStroke('pointercancel');finish();room.place=id==='home'?null:id;room.placeArt=image?{image,soft}:null;room.x=Math.max(.34,Math.min(.66,room.x));room.target=room.x;room.velocity=0;room.moveStartedAt=null;room.lastWalkAt=-1000;room.depth=0;room.toy=null;room.prop=null;mode='home';controls();close();if(!room.reduced)$('scene').animate([{opacity:.75},{opacity:1}],{duration:240,easing:'ease-out'});nextInvite=Date.now()+20000;nextDiscovery=Date.now()+60000;nextOutdoor=Date.now()+12000;if(room.place){remember(s,PLACES[id].name+'에 함께 나왔어요');persist();}say('',0);update();if(room.place&&!asleep(s))noticeOutdoors();}catch(error){if(request===travelRequest&&$('panel').open){loading.textContent='장소를 바꾸지 못했어요. 지금 있는 곳은 그대로예요. 다시 선택해 주세요.';}}}
function outdoorActivity(){if(!s||!room.place||asleep(s)||conflict)return;markInput();const place=PLACES[room.place];if(action?.kind==='curiosity')finish();else if(action)return;if(place.kind==='water'){care('water');return;}if(!begin(5,7600,'outing'))return;action.activity=place.kind;action.anchor=place.kind==='watch'?.58:.36;busyUntil=0;room.target=action.anchor;if(['sniff','petal'].includes(place.kind))$('hint').textContent='바닥을 눌러 함께 살펴볼 곳을 골라요.';say(place.kind==='sniff'?({dog:'잠깐 멈춰 새로운 냄새를 맡아요.',cat:'풀숲을 조심스럽게 살펴봐요.',pig:'코를 낮춰 풀 냄새를 맡아요.'}[room.species]):place.kind==='petal'?'꽃잎을 따라가다가 네 쪽을 돌아봐요.':'잔잔한 물결을 바라보다가 눈을 맞춰요.',4000);}
function showStatus(){if(!s)return;const body=panel(s.name+'의 상태');para(body,['아직 서로 알아가는 중','익숙해진 친구','먼저 찾는 친구','편안한 단짝'][bondStage(s)]+' · '+(asleep(s)?'지금은 쉬는 중':'함께한 '+day(s)+'일'));const label=document.createElement('label'),meter=document.createElement('meter');label.className='bond-meter';label.textContent='친밀감 '+s.affection+' / 100';meter.min=0;meter.max=100;meter.value=s.affection;meter.setAttribute('aria-label','친밀감');label.append(meter);body.append(label);para(body,'함께한 날, 놀이와 편안한 손길이 쌓이면 먼저 다가오고 좋아하는 부위를 맡겨요. 쉬었다 와도 친밀감은 줄지 않아요.');const careTitle=document.createElement('h3');careTitle.textContent='돌봄 상태';body.append(careTitle);const gauges=document.createElement('div');gauges.className='care-gauges';for(const [kind,name] of [['water','물'],['food','먹이'],['brush','청결 · 빗질']]){const row=document.createElement('label'),bar=document.createElement('meter'),value=s.health?Math.ceil(readHealth(true).values[kind]):careGauge(s,kind);row.className='bond-meter';row.textContent=name+' '+value+' / 100';bar.min=0;bar.max=100;bar.value=value;bar.dataset.care=kind;bar.setAttribute('aria-label',name);row.append(bar);gauges.append(row);}body.append(gauges);para(body,s.health?'책임 돌봄 · 돌봄을 끝내면 해당 게이지가 채워져요.':'편안한 돌봄 · 게이지가 낮아져도 아프지 않아요.');option(body,s.health?'책임 돌봄 설정':'책임 돌봄 알아보기',healthSettings);const shortcut=option(body,'돌봄 하러 가기',()=>{if(asleep(s)){shortcut.disabled=true;return;}close();home();mode='care';controls();});shortcut.id='statusCare';shortcut.disabled=asleep(s);const h=document.createElement('h3');h.textContent='익숙한 손길';body.append(h);const touches=document.createElement('div');touches.className='touch-status';for(const part of ['head','chin','back']){const item=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('span');name.textContent={head:'머리',chin:'턱 밑',back:'등'}[part];detail.textContent=familiarTouch(s,part)?'편안해해요':'알아가는 중';item.append(name,detail);touches.append(item);}body.append(touches);const heading=document.createElement('h3');heading.textContent='최근 돌봄';body.append(heading);for(const kind of ['food','water','brush']){const row=document.createElement('div');row.className='care-record';const name=document.createElement('span'),when=document.createElement('span');name.textContent={food:'먹이',water:'물',brush:'빗질'}[kind];when.textContent=s.care[kind]?new Date(s.care[kind]).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'아직 함께하지 않았어요';row.append(name,when);body.append(row);}para(body,'돌봄 시간은 마지막으로 끝낸 활동의 기록이에요.');}
function showMenu(){const body=panel('잠깐, 우리 이야기');if(s){para(body,s.name+' · '+petById(s.variant).name+' · 함께한 '+day(s)+'일');option(body,'다른 친구 만나기',choosePet);const phase=healthPhase();if(phase==='memorial')option(body,'새 친구 만나기',newFriend);else option(body,s.health?'책임 돌봄 설정':'책임 돌봄 알아보기',healthSettings);option(body,'지난 친구들의 앨범',showArchivedFriends);para(body,s.health?'책임 돌봄 · 현실 시간에 따라 게이지가 변해요.':'편안한 돌봄 · 쉬었다 와도 아프거나 마음이 멀어지지 않아요.');option(body,s.music?'배경음 끄기':'배경음 켜기',()=>{s.music=!s.music;persist();syncMusic();music.unlock();showMenu();});option(body,s.sound?'효과음 끄기':'효과음 켜기',()=>{s.sound=!s.sound;persist();sound();showMenu();});option(body,'현재 친구 기록 내보내기',()=>download(JSON.stringify(s,null,2),'너와나의하루-기록.json','application/json'));option(body,'전체 친구 백업',()=>{try{if(broken||conflict)throw Error('최신 기록을 확인한 뒤 백업해 주세요.');const pack=collectFriends(localStorage,s);download(JSON.stringify(pack),'너와나의하루-전체친구.json','application/json');say(pack.pets.length+'명의 친구와 사진·추억을 백업했어요.');}catch(e){para(body,'백업하지 못했어요. '+e.message);}});if(lockedHealth(phase)){if(phase==='memorial')option(body,'추억 앨범',()=>showMemorial(s));return;}option(body,'이름 바꾸기',()=>{const p=panel('이름을 불러 주세요'),f=document.createElement('form'),input=document.createElement('input'),b=document.createElement('button');input.value=s.name;input.maxLength=12;input.setAttribute('aria-label','펫 이름');input.required=true;input.oninput=()=>input.setCustomValidity('');b.textContent='이름 저장';b.className='primary';f.append(input,b);p.append(f);f.onsubmit=e=>{e.preventDefault();if(!cleanName(input.value)){input.setCustomValidity('친구의 이름을 한 글자 이상 적어 주세요.');input.reportValidity();return;}if(cleanName(input.value)){const before=s.name;s.name=cleanName(input.value);if(persist()){close();say(s.name+', 반가워!');}else{s.name=before;let error=f.querySelector('[role=status]');if(!error){error=para(f,'');error.setAttribute('role','status');}error.textContent='이름을 저장하지 못했어요. 입력한 이름은 남겨 두었으니 저장 공간을 확인한 뒤 다시 눌러 주세요.';}}};});option(body,room.place?'풍경 함께 바라보기':'창가에 함께 앉기',()=>{close();quiet('window');});option(body,room.place?'곁에서 쉬기':'쿠션 곁에서 쉬기',()=>{close();quiet('rest');});if(!room.place)option(body,'창가에서 비 구경',()=>{s.weather='rain';persist();close();say('오늘은 빗소리 대신 창밖을 조용히 바라봐요.');});if(!room.place)option(body,'비 그치기',()=>{s.weather='clear';persist();close();});if(!asleep(s))option(body,'함께 쉬기',()=>{finish();s.restUntil=Date.now()+120000;remember(s,'곁에 앉아 조용히 쉬었어요');persist();close();update();controls();});option(body,'추억 펼치기',showAlbum);}
 try{const previous=localStorage.getItem(KEY+'-previous');if(previous)option(body,'복구 전 기록 내보내기',()=>download(previous,'너와나의하루-복구전기록.json','application/json'));}catch{}
 if(broken&&originalRecord)option(body,'읽지 못한 원본 보관',()=>download(originalRecord,'펫-원본기록.txt','text/plain'));
 option(body,'기록 파일 복구',()=>$('restoreFile').click());const a=document.createElement('a');a.href='classic/';a.textContent='기존 펫키우기 · 강아지 / 고양이 / 햄스터 / 토끼';a.className='classic';body.append(a);para(body,'새 교감 모드의 기록은 기존 게임과 별도로 저장됩니다. 이 기기의 브라우저에 저장되며, 기기를 바꿀 때는 기록 파일을 옮겨 주세요.');const activities=document.createElement('section'),heading=document.createElement('h3');activities.className='quiet-actions';heading.textContent='나란히 쉬어 갈까?';activities.append(heading);for(const name of [room.place?'풍경 함께 바라보기':'창가에 함께 앉기',room.place?'곁에서 쉬기':'쿠션 곁에서 쉬기','함께 쉬기','추억 펼치기']){const b=[...body.children].find(e=>e.tagName==='BUTTON'&&e.textContent===name);if(b){if(asleep(s)&&name!=='추억 펼치기'){b.disabled=true;b.title='친구가 깨어나면 함께해요.';}activities.append(b);}}if(activities.children.length>1){body.insertBefore(activities,body.children[2]||null);const h=document.createElement('h3');h.className='settings-heading';h.textContent='친구와 기록 관리';activities.after(h);}}
let restoreRequest=0;
$('restoreFile').onchange=async e=>{const request=++restoreRequest;const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>32000000)throw Error('32MB 이하 기록 파일을 선택해 주세요.');const text=await f.text();if(request!==restoreRequest)return;const raw=JSON.parse(text);if(raw?.format==='pet-friends'){const pack=validateFriends(raw),body=panel('전체 친구를 불러올까요?');para(body,pack.pets.length+'명의 친구와 '+(pack.archives?.length??0)+'개의 보관 앨범을 확인해요. 같은 친구의 최신 책임 돌봄과 사진을 보호합니다.');option(body,'취소',showMenu);option(body,'전체 친구 불러오기',()=>{try{if(photoPending)throw Error('사진 저장을 마친 뒤 불러와 주세요.');if(conflict)throw Error('다른 창에서 기록이 바뀌었어요. 새로고침해 주세요.');restoreFriends(localStorage,pack,s);location.reload();}catch(e){para(body,'불러오지 못했어요. '+e.message);}});return;}const candidate=validateFriend(raw);const body=panel('기록을 불러올까요?');para(body,candidate.name+'의 '+day(candidate)+'일 기록입니다. 현재 기록은 이전 기록으로 보관합니다.');option(body,'취소',showMenu);option(body,'이 기록 불러오기',()=>{try{if(photoPending||conflict)throw Error('사진 저장이 끝났는지, 다른 창의 기록이 바뀌었는지 확인해 주세요.');const restored=restoreFriend(localStorage,candidate,s);if(restored.active!==room.variant){location.reload();return;}s=restored.pets[0];broken=false;conflict=false;$('saveError').hidden=true;close();enter();say('기록을 이어서 만나요.');}catch(e){para(body,'불러오지 못했어요. '+e.message);}});}catch(err){if(request!==restoreRequest)return;const body=panel('기록을 확인해 주세요');para(body,err.message);}};
$('choosePet').onclick=choosePet;$('petKind').textContent=petById(room.variant).name;$('scene').setAttribute('aria-label',petById(room.variant).name+'. 눌러서 인사할 수 있어요.');$('dayline').onclick=callName;$('offer').onclick=()=>{markInput();const choice=offer;choice==='toy'?play(favorite(s)):['water','brush'].includes(choice)?care(choice):choice&&quiet(choice);};
$('queued').onclick=()=>{markInput();pending=null;update();say('예약만 취소했어요. 지금 하던 일은 계속해요.',2200);};
$('place').onclick=showPlaces;$('placeActivity').onclick=outdoorActivity;$('handExit').onclick=()=>{markInput();home();};$('status').onclick=showStatus;$('camera').onclick=()=>{markInput();takePhoto();};$('album').onclick=showAlbum;$('menu').onclick=showMenu;
const careLabels={water:'물 주기',food:'먹이 주기',brush:'빗질하기'};
const gaugeLabels={water:'물',food:'먹이',brush:'청결'};
let health=null,healthFriend=null,healthSecond=null,observedHealthWall=0,treating=false,warningDismissed=false;
function readHealth(force=false){
 const now=Date.now(),second=Math.floor(now/1000);
 if(force||healthFriend!==s||healthSecond!==second){
  if(healthFriend!==s){treating=false;warningDismissed=false;observedHealthWall=0;}
  healthFriend=s;healthSecond=second;
  health=s?.health?healthView(s.health,Math.max(now,observedHealthWall)):null;
  // A suspected clock jump can be corrected before the memorial is confirmed.
  if(health&&health.phase!=='clock')observedHealthWall=health.state.wall;
 }
 return health;
}
const healthPhase=()=>readHealth()?.phase;
const asleep=(record,t)=>record===s&&['sick','critical','recovery'].includes(healthPhase())?false:ordinaryAsleep(record,t);
const sleepReady=(record,activity,t)=>asleep(record,t)&&ordinarySleepReady(record,activity,t);
const lockedHealth=phase=>['paused','clock','memorial'].includes(phase);
const healthKind=kind=>['water','food','brush','touch','rest','window','name'].includes(kind);
let clinic=null,clinicArt=null;
let recoveryMotion=null;
function settleAtHome(){
 room.place=null;room.placeArt=null;room.clinic=false;room.depth=0;
 room.x=Math.min(.57,Math.max(.49,s.bond.spot));room.target=room.x;room.velocity=0;
 room.moveStartedAt=null;room.toy=null;room.toyPoint=null;room.prop=null;
 mode='home';
}
function leaveClinic(){
 clinic=null;settleAtHome();controls();renderHealth();
}
async function openClinic(){
 if(!s||clinic||broken||conflict||readHealth(true)?.phase!=='sick')return;
 if(action)finish();
 settleAtHome();close();say('',0);
 const visit={friend:s,step:'loading',start:0};clinic=visit;
 renderHealth();
 try{
  if(!clinicArt){
   const image=new Image();image.decoding='async';image.src='assets/places/clinic.webp';
   let timeout;
   try{await Promise.race([image.decode(),new Promise((_,fail)=>{timeout=setTimeout(()=>fail(Error('clinic art')),5000);})]);}
   finally{clearTimeout(timeout);}
   clinicArt={image,soft:image};
  }
  if(clinic!==visit||s!==visit.friend)return;
  room.clinic=true;room.placeArt=clinicArt;visit.step='arrived';
 }catch{
  if(clinic!==visit||s!==visit.friend)return;
  visit.step='fallback';
 }
 renderHealth();
}
function completeExam(){
 const next=changeHealth(s.health,'exam',Math.max(Date.now(),observedHealthWall));
 if(next===s.health||!saveHealth(next))return false;
 return true;
}
function finishVisit(){
 if(!completeExam())return;
 treating=true;leaveClinic();
 say('집에 돌아왔어요. '+s.name+' 곁에서 돌봐 주세요.',3600);
}
function clinicCard(view){
 const next=nextTreatment(view.values);
 const advice=next?{water:'집에 가면 먼저 물을 챙겨 주세요.',food:'집에 가면 먹이를 챙겨 주세요.',brush:'집에서 털을 살살 빗어 주세요.'}[next]:'집에서 편안히 쉬게 해 주세요.';
 if(clinic.step==='loading')return {title:'병원으로 가요',detail:s.name+'와 천천히 이동해요.',button:'병원 준비 중…',disabled:true,other:'집으로 돌아가기',alternative:leaveClinic};
 if(clinic.step==='fallback')return {title:'집에서 받는 돌봄 안내',detail:advice,button:'집에서 돌보기',act:finishVisit,other:'돌아가기',alternative:leaveClinic};
 if(clinic.step==='arrived')return {title:s.name+'의 진찰',detail:'진찰 매트에서 잠시 상태를 살펴봐요.',button:'진찰받기',act:()=>{clinic.step='exam';clinic.start=performance.now();renderHealth();},other:view.state.examinedAt!=null?'바로 진찰받기':'집으로 돌아가기',alternative:view.state.examinedAt!=null?()=>{if(completeExam()){clinic.step='advice';renderHealth();}}:leaveClinic};
 if(clinic.step==='exam')return {title:'진찰 중이에요',detail:'곁에서 기다리면 돼요.',button:'상태를 살피는 중…',disabled:true};
 return {title:'수의사의 돌봄 안내',detail:advice,button:'집으로 돌아가기',act:()=>{treating=true;leaveClinic();say('집에 돌아왔어요. '+s.name+' 곁에서 돌봐 주세요.',3600);}};
}
const formatTime=t=>new Date(t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
function saveHealth(next){
 const previous=s.health,seen=s.seenAt,observed=observedHealthWall;
 if(next.endedAt!==null&&previous?.endedAt==null)s.seenAt=Math.max(seen,next.wall-(next.elapsed-next.endedAt));
 s.health=next;readHealth(true);
 if(persist())return true;
 s.health=previous;s.seenAt=seen;observedHealthWall=observed;readHealth(true);
 return false;
}
function healthSettings(){
 const body=panel('책임 돌봄');const view=readHealth(true);
 if(!view){
  para(body,'친구를 돌보는 시간이 현실 시간과 함께 흘러요. 물이나 먹이가 오랫동안 부족하면 아플 수 있어요. 물과 먹이를 한 번도 주지 않은 채 7일이 지나면 친구는 세상을 떠나요.');
  para(body,'지금부터 게이지 100으로 시작해요. 여행이나 방학에는 쉬어가기로 돌봄 시간을 멈출 수 있어요.');
  option(body,'책임 돌봄 시작',()=>{
   if(!s||s.health||broken||conflict)return;
   if(saveHealth(startHealth(Date.now(),crypto.randomUUID()))){warningDismissed=false;close();renderHealth();}
  });
 }else if(view.phase==='paused'){
  para(body,'물·먹이·청결, 아픔과 회복에 걸리는 시간이 모두 멈춰 있어요.');
  option(body,'돌봄 이어가기',()=>runHealthCommand('resume'));
 }else if(lockedHealth(view.phase))para(body,view.phase==='clock'?'거실에서 마지막 돌봄 시각을 확인해 주세요.':'앨범에서 함께한 사진과 추억을 볼 수 있어요.');
 else{
  para(body,'쉬어가기를 시작하면 게이지와 회복 시간을 멈춰요. 다른 친구를 먼저 돌보거나 오래 자리를 비울 때 사용할 수 있어요.');
  option(body,'쉬어가기 시작',()=>runHealthCommand('pause'));
 }
 option(body,'돌아가기',showMenu);
}
function runHealthCommand(command){
 if(!s?.health||broken||conflict||photoPending)return;
 const next=changeHealth(s.health,command,Math.max(Date.now(),observedHealthWall));
 if(next===s.health||!saveHealth(next))return;
 if(command==='recover'||command==='remember')treating=false;
 if(command==='remember'){mode='home';say('',0);room.place=null;room.placeArt=null;}
 close();renderHealth();
}
function healthCard(view){
 const {phase,issue,values,remaining}=view;
 if(recoveryNotice(view)){
  const needsWater=phase==='warning'&&issue==='water';
  const sleeping=ordinaryAsleep(s);
  return {title:'기운이 돌아왔어요!',detail:s.name+'가 천천히 고개를 들었어요.',button:needsWater?'물 주기':sleeping?'확인':'같이 놀기',act:()=>acknowledgeRecovery(needsWater?'water':sleeping?'close':'play'),other:'나중에',alternative:()=>acknowledgeRecovery('close')};
 }
 if(phase==='warning')return {title:{water:'물이 필요해요',food:'먹이가 필요해요',brush:'털을 빗어 주세요'}[issue],label:gaugeLabels[issue],value:Math.ceil(values[issue]),button:careLabels[issue],act:()=>care(issue),other:'나중에',alternative:()=>{warningDismissed=true;renderHealth();}};
 if(clinic&&phase==='sick')return clinicCard(view);
 if(phase==='sick'||phase==='critical'){
  const timeLeft=Math.ceil(remaining/HOUR)+'시간 남았어요';
  if(phase==='critical')return {title:'지금 돌봄이 필요해요',detail:timeLeft+' · 먼저 물을 주세요.',button:'지금 물 주기',act:()=>{settleAtHome();care('water');}};
  const examined=view.state.examinedAt===view.state.sickAt;
  if(!examined&&!treating)return {title:s.name+'가 아파요',detail:'병원에서 상태를 살펴봐요.',button:'병원에 데려가기',act:openClinic};
  const next=nextTreatment(values);
  return {title:next?{water:'먼저 물을 챙겨 주세요',food:'먹이를 챙겨 주세요',brush:'털을 빗어 주세요'}[next]:'편안히 쉬게 해 주세요',detail:phase==='critical'?timeLeft:'치료에 필요한 돌봄을 하나씩 해요.',button:next?careLabels[next]:'쉬게 하기',act:()=>next?care(next):runHealthCommand('recover')};
 }
 if(phase==='recovery')return {title:'회복 중이에요',label:'회복',value:Math.floor(view.progress*100),detail:formatTime(Date.now()+view.recoveryRemaining)+' 회복 예정',button:'곁에 있기',act:()=>{chooseMode('hand');$('scene').focus({preventScroll:true});}};
 if(phase==='paused')return {title:view.state.recoverAt==null?'잠시 쉬어가는 중이에요':'회복 시간 멈춤',detail:view.state.recoverAt==null?'돌봄 시간이 멈춰 있어요.':'회복까지 '+Math.ceil(view.recoveryRemaining/60000)+'분 남았어요.',button:'돌봄 이어가기',act:()=>runHealthCommand('resume')};
 if(phase==='clock')return {title:'마지막 돌봄 후 7일이 지났어요',detail:'돌봄 기준 '+formatTime(Math.max(s.care.water,s.care.food,s.health.startedAt))+'\n현재 '+formatTime(Date.now())+'\n시간이 다르면 기기 설정에서 확인해 주세요.',button:'시간 확인 후 추억 남기기',act:confirmMemorial,other:'시간 다시 확인',alternative:()=>{readHealth(true);renderHealth();}};
 if(phase==='memorial')return {title:s.name+'를 기억해요',detail:'함께한 사진과 이야기를 간직했어요.',button:'추억 앨범',act:()=>showMemorial(s)};
 return null;
}
function recoveryNotice(view){
 return !!view&&['well','warning'].includes(view.phase)&&view.state.recoveredAt!=null&&view.state.recoverySeenAt!==view.state.recoveredAt;
}
function acknowledgeRecovery(next){
 const state=changeHealth(s.health,'seenRecovery',Math.max(Date.now(),observedHealthWall));
 if(state===s.health||!saveHealth(state))return;
 if(next==='water')care('water');
 if(next==='play')chooseMode('play');
 renderHealth();
}
function confirmMemorial(){
 const body=panel(s.name+'가 세상을 떠났어요');
 para(body,'기기의 날짜와 시각이 맞는지 확인해 주세요. 추억을 남기면 사진과 기록을 앨범에서 볼 수 있어요.');
 option(body,'돌아가기',close);
 option(body,'추억 남기기',()=>runHealthCommand('remember'));
}
function renderHealth(){
 const view=readHealth(),phase=view?.phase??'',old=document.body.dataset.health??'';
 if(old!==phase){
  document.body.dataset.health=phase;
  if(phase==='well')warningDismissed=false;
  if(mode==='home')controls();
 }
 if(clinic&&phase!=='sick'){leaveClinic();return view;}
 if(clinic?.step==='exam'&&performance.now()-clinic.start>=3400){clinic.step=completeExam()?'advice':'arrived';}
 const reclining=!!view&&(['sick','critical','recovery','clock'].includes(phase)||phase==='paused'&&view.state.sickAt!=null);
 if(!reclining)room.careSeated=false;
 if(reclining&&!room.careSeated&&!clinic&&!action){settleAtHome();say('',0);room.careSeated=true;}
 room.restingCare=reclining&&!room.clinic;
 if(room.restingCare){room.target=room.x;room.velocity=0;room.toy=null;room.toyPoint=null;}
 const releasing=!reclining&&old==='recovery'&&recoveryNotice(view);
 if(releasing)recoveryMotion=performance.now();
 room.recoveryMotion=recoveryMotion;
 if(recoveryMotion!=null&&performance.now()-recoveryMotion>1100){room.recoveryMotion=null;recoveryMotion=null;}
 document.body.toggleAttribute('data-clinic',!!clinic);
 const stopped=lockedHealth(phase),portrait=$('healthPortrait');
 room.memorial=phase==='memorial';portrait.hidden=!room.memorial;
 if(room.memorial){
  const src=s.photos.at(-1)?.url??(s.variant==='puppy'?'assets/puppy-detail.webp':'assets/pets/'+s.variant+'/detail.webp');
  if($('healthPhoto').getAttribute('src')!==src){$('healthPhoto').src=src;$('healthPhoto').alt=s.name+'의 사진';}
 }
 room.healthBowl=!clinic&&(phase==='recovery'||phase==='critical'||phase==='sick'&&(treating||view.state.examinedAt===view.state.sickAt)||phase==='warning'&&view.issue==='water')?'water':null;
 const visible=!!view&&(phase!=='well'||recoveryNotice(view))&&!(phase==='warning'&&warningDismissed&&!recoveryNotice(view))&&!$('panel').open&&(stopped||!action&&mode==='home');
 $('healthCard').hidden=!visible;
 const badge=$('healthNotice');
 badge.hidden=!view||visible||!['warning','sick','critical','recovery'].includes(phase);
 if(!badge.hidden){
  const label={warning:'돌봄 필요',sick:'아픈 상태',critical:'지금 돌봄 필요',recovery:'회복 중'}[phase];
  if(badge.textContent!==label)badge.textContent=label;
 }
 const cardFlag=visible?'yes':'no';if(document.body.dataset.healthCard!==cardFlag)document.body.dataset.healthCard=cardFlag;
 if(visible){
  const card=healthCard(view);
  for(const [id,value] of [['healthTitle',card.title],['healthDetail',card.detail??''],['healthAction',card.button],['healthOther',card.other??'']])if($(id).textContent!==value)$(id).textContent=value;
  $('healthMeterRow').hidden=card.value==null;
  if(card.value!=null){const label=card.label+' '+card.value+' / 100';if($('healthMeterLabel').textContent!==label)$('healthMeterLabel').textContent=label;$('healthMeter').value=card.value;}
  $('healthAction').disabled=!!card.disabled;$('healthAction').onclick=card.act??null;$('healthOther').hidden=!card.other;$('healthOther').onclick=card.alternative??null;
 }
 return view;
}
$('healthNotice').onclick=()=>{warningDismissed=false;home();renderHealth();};
function showMemorial(record){
 const body=panel(record.name+'의 추억 앨범');
 para(body,record.name+'와 함께한 '+Math.max(1,Math.ceil((record.seenAt-record.adoptedAt)/DAY))+'일');
 const grid=document.createElement('div');grid.className='photos archived-photos';
 for(const [i,photo] of record.photos.entries()){
  const figure=document.createElement('figure'),image=new Image(),save=document.createElement('a');
  image.loading='lazy';image.src=photo.url;image.alt=record.name+'의 사진 '+(i+1);
  save.href=photo.url;save.download=record.name+'-추억-'+(i+1)+'.webp';save.textContent='사진 저장';
  figure.append(image,save);grid.append(figure);
 }
 body.append(grid);
 for(const entry of record.memories.slice().reverse())para(body,entry.day+'일째 · '+entry.text);
 option(body,'닫기',close);
}
function showArchivedFriends(){
 const body=panel('지난 친구들의 앨범');
 try{
  const friends=archivedFriends(localStorage);
  if(!friends.length)para(body,'아직 따로 보관한 앨범이 없어요.');
  for(const record of friends)option(body,record.name+' · '+petById(record.variant).name,()=>showMemorial(record));
 }catch(error){para(body,error.message);}
 option(body,'돌아가기',showMenu);
}
function newFriend(){
 const body=panel('새 친구 만나기');
 para(body,s.name+'의 사진과 이야기는 추억 앨범에 보관해요.');
 const field=document.createElement('input');field.maxLength=12;field.placeholder='새 친구 이름';field.setAttribute('aria-label','새 친구 이름');body.append(field);
 option(body,'새 친구 시작',()=>{
  const name=cleanName(field.value);if(!name){field.focus();return;}
  if(broken||conflict||photoPending)return;
  try{
   const next=createPet(name);next.variant=s.variant;
   remember(next,'처음 만나 이름을 불러 주었어요');
   replaceRememberedFriend(localStorage,s,next);
   location.reload();
  }catch(error){para(body,'앨범과 새 기록을 함께 저장할 공간을 확인해 주세요. '+error.message);}
 });
}

function enter(){if(clinic)settleAtHome();clinic=null;recoveryMotion=null;room.clinic=false;room.restingCare=false;room.careSeated=false;mode='home';lastInput=Date.now();nextInvite=lastInput+22000;nextApproach=lastInput+45000;nextDiscovery=lastInput+60000;room.affection=null;room.stroke=null;room.contactPhase=null;room.responseKey=null;action=null;pending=null;busyUntil=0;clearOffer();room.carry=false;room.prop=null;room.hide=false;room.point=null;room.touchPart=null;room.familiarTouch=false;room.velocity=0;delete document.body.dataset.welcome;$('welcome').hidden=true;if(!s)return;lastSleep=asleep(s);room.setPose(lastSleep?3:0);room.x=s.bond.spot;room.target=s.bond.spot;room.toy=s.bond.toy;room.toyX=s.bond.toyX;room.toyPosition=null;room.fetchDrop=null;controls();update();if(!lockedHealth(healthPhase())&&age(s)>=30&&!s.memories.some(m=>m.text==='우리의 첫 30일, 앞으로도 함께해요')){remember(s,'우리의 첫 30일, 앞으로도 함께해요');persist();showAlbum();}}
$('petName').oninput=()=>$('petName').setCustomValidity('');
$('adopt').onsubmit=e=>{e.preventDefault();if(!ready||broken||conflict||s)return;if(!cleanName($('petName').value)){$('petName').setCustomValidity('친구의 이름을 한 글자 이상 적어 주세요.');$('petName').reportValidity();return;}s=createPet($('petName').value);s.variant=room.variant;remember(s,'처음 만나 이름을 불러 주었어요');persist();enter();room.x=.67;begin(5,3000,'hello');room.target=.55;say(s.name+', 만나서 반가워. 천천히 친해지자.',6000);};
const entryIntro=playEntryIntro($('entryIntro'));
room.ready.then(async()=>{await entryIntro;if(!s||s.music||s.sound)prepareAudio();ready=true;$('loading').hidden=true;$('start').disabled=broken||conflict;if(s){enter();if(!healthBlocksPlay(healthPhase())&&!recoveryNotice(readHealth())&&!welcomeBack())say(asleep(s)?'새근새근, 편히 쉬고 있어요. 곁에서 조용히 만나요.':s.toys.ball+s.toys.bone>0?s.name+'가 좋아하던 '+toyName(room.species,favorite(s))+'이 여기 있어요.':'다시 만나서 반가워, '+s.name+'!');}else if(!broken){document.body.dataset.welcome='';$('welcome').hidden=false;}else showMenu();}).catch(()=>{$('loading').replaceChildren(document.createTextNode('그림을 불러오지 못했어요. 기록은 그대로예요. '),button('다시 불러오기',()=>location.reload()));});
document.addEventListener('visibilitychange',()=>{syncMusic();if(document.hidden){if(s?.health&&readHealth(true)?.phase!=='clock'&&!lockedHealth(healthPhase()))persist();if(canPauseActivity())pauseActivity();else releaseStroke('pointercancel');room.point=null;room.active=false;}else{if(!$('panel').open)resumePanel();else room.active=!action?.pause;markInput();update();}});
addEventListener('storage',e=>{if((e.key===KEY||e.key===null)&&(s||e.newValue!==null)){conflict=true;$('start').disabled=true;if(s)finish();const body=panel('다른 창에서 기록이 바뀌었어요');para(body,'서로 덮어쓰지 않도록 이 창의 저장을 멈췄어요. 새로고침하면 최신 기록을 불러옵니다.');option(body,'최신 기록 불러오기',()=>location.reload());}});
if(new URLSearchParams(location.search).has('qa'))window.bondQA={state:()=>structuredClone(s),room,action:()=>action?{kind:action.kind,ending:action.ending,moment:action.moment,phase:action.phase,round:action.round}:null,offer:()=>offer,mode:()=>mode,busy:()=>Date.now()<busyUntil,stage:()=>bondStage(s),invite:()=>{nextInvite=Date.now()-1;lastInput=Date.now()-9000;},update};









