import {createMusic} from './music.mjs';
import {foley} from './foley.mjs';
import {CONTACT_REACTIONS,contactPhase,responsePose,afterContact,nextInvitation} from './companion.mjs';
import {contactPart,sampleStroke} from './contact.mjs';
import {moveStroke} from './stroke.mjs';
import {PETS,petById} from './pets.mjs';
import {KEY,DAY,createPet,validate,age,day,asleep,favorite,interact,remember,inviteReady,cleanName,experience,playEnding,creditTouch,familiarTouch,sleepReady,playChoice,bondStage,preferredPart,reunionMemory,lifeMoment,companionPlace,playMemory} from './model.mjs';
import {Room} from './scene.mjs';
const $=id=>document.getElementById(id);let room;let s=null,broken=false,mode='home',busyUntil=0,lastInput=Date.now(),nextInvite=Date.now()+22000,action=null,speechUntil=0,ready=false,conflict=false,lastSleep=false,pending=null,offer=null,nextApproach=Date.now()+45000,nextDiscovery=Date.now()+60000;
let initialRaw=null;try{initialRaw=localStorage.getItem(KEY);if(initialRaw)s=validate(JSON.parse(initialRaw));}catch(e){broken=true;$('saveError').hidden=false;$('saveError').textContent='이전 기록을 읽지 못했어요. 덮어쓰지 않았습니다. 메뉴에서 원본 내보내기 또는 기록 복구를 해 주세요.';}
const originalRecord=initialRaw;const requestedPet=petById(new URLSearchParams(location.search).get('pet')).id;room=new Room($('scene'),s?.variant??requestedPet);
function persist(){if(!s||broken||conflict)return false;s.seenAt=Math.max(s.seenAt,Date.now());try{localStorage.setItem(KEY,JSON.stringify(s));$('saveError').hidden=true;return true;}catch(e){$('saveError').hidden=false;$('saveError').textContent='이 기기에 저장하지 못했어요. 메뉴에서 기록 파일을 내보내 주세요. 현재 화면의 기록은 유지됩니다.';return false;}}
function say(text,ms=4500){$('speech').textContent=text;speechUntil=Date.now()+ms;}
function sound(type='touch'){if(s?.sound){music.duck();foley(type,room.species);}}
const music=createMusic();
function syncMusic(){music.set(!!s?.music&&!document.hidden,s?asleep(s):false,['touch','affection','brush','food','water','reunion'].includes(action?.kind));}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{syncMusic();music.unlock();},{capture:true});
window.addEventListener('pagehide',()=>music.stop());
room.onFootstep=()=>sound('step');
function markInput(){lastInput=Date.now();}
function button(label,fn,icon=''){const b=document.createElement('button');b.type='button';if(icon){const sp=document.createElement('span');sp.className='icon';sp.setAttribute('aria-hidden','true');sp.textContent=icon;b.append(sp);}b.append(document.createTextNode(label));b.onclick=()=>{markInput();fn();};return b;}
function controls(){const el=$('actions');el.replaceChildren();if(!s||!ready)return;const add=(name,fn,ic)=>el.append(button(name,fn,ic));if(asleep(s)){add('조용히 머물기',()=>say('편히 쉬고 있어요. 곁에 있어도 좋아요.'),'☾');add('사진',takePhoto,'◎');add('추억',showAlbum,'▤');$('hint').textContent='잠든 친구를 깨우지 않고 함께 있어요.';return;}
 if(mode==='hand'){add('머리',()=>pet('head'),'♡');add('턱 밑',()=>pet('chin'),'♡');add('등',()=>pet('back'),'♡');add('돌아가기',home,'←');$('hint').textContent='친구를 누른 채 천천히 쓰다듬어요 · 머리·턱·등에 따라 반응해요';}
 else if(mode==='play'){add('매듭공',()=>play('ball'),'◉');add('뼈 인형',()=>play('bone'),'◇');add('숨바꼭질',hide,'⌕');add('돌아가기',home,'←');$('hint').textContent='장난감을 고르거나 바닥을 눌러 굴릴 방향을 정해요.';}
 else if(mode==='care'){add('물',()=>care('water'),'♧');add('먹이',()=>care('food'),'∪');add('빗질',()=>care('brush'),'≋');add('돌아가기',home,'←');$('hint').textContent='빗질 중에는 펫 위를 살살 움직여 보세요. 버튼만 눌러도 돼요.';}
 else{add('손길',()=>{mode='hand';controls();pet('head');},'♡');add('놀이',()=>{mode='play';controls();say('무엇으로 놀까?');},'◉');add('돌봄',()=>{mode='care';controls();say('편안하게 돌봐 주세요.');},'∪');$('hint').textContent='펫을 눌러 인사 · 바닥을 누르면 가까이 다가와요';}}
function home(){pending=null;if(action?.kind==='play'){room.toyX=room.x;s.bond.toy=room.toy;s.bond.toyX=Math.max(.24,Math.min(.76,room.x));action=null;pending=null;finish();persist();}else if(['water','food','brush','hide','rest','window','affection','contactEnd','approach','reunion','discovery'].includes(action?.kind)||action?.kind==='touch')finish();mode='home';controls();}
function releaseToy(){if(room.carry&&room.toyPosition)room.toyX=Math.max(.02,Math.min(.98,room.toyPosition.x/room.w));room.carry=false;}
function begin(pose,ms,kind,done=null){room.affection=null;room.contactPhase=null;room.stroke=null;if(!s||asleep(s)||conflict)return false;pending=null;if(kind!=='play'||!['approach','reunion','discovery'].includes(action?.kind))room.velocity=0;action={kind,at:Date.now(),until:Date.now()+ms,done,from:room.x};busyUntil=action.until;clearOffer();room.touchPart=null;room.familiarTouch=false;room.hide=false;room.prop=null;releaseToy();room.point=null;room.target=room.x;room.setPose(pose);return true;}
function pet(part='head',gesture=false){
 if(!s)return;if(asleep(s)){say('잠든 친구는 눈으로만 살펴봐요.');return;}
 if(action&&['water','food','brush','play'].includes(action.kind)){pending={kind:'touch',part};say('손길을 기억했어요. 하던 일을 마치고 다가올게요.');return;}
 const repeated=Date.now()-(s.care.touch||0)<7000;
 if(!begin(gesture?11:{head:8,chin:9,back:10}[part],repeated?1800:3200,'touch'))return;
 room.touchPart=part;room.contactPhase=gesture?'notice':null;room.target=room.x;action.gesture=gesture;action.part=part;
 s.care.touch=Date.now();
 const line={head:'머리를 맡기고 눈을 살며시 감아요.',chin:'턱을 손 쪽으로 살짝 기대어요.',back:'등을 쓰다듬자 편안하게 돌아봐요.'}[part];
 const familiar=familiarTouch(s,part)&&bondStage(s)>=1;room.familiarTouch=familiar;if(!gesture)remember(s,line);sound();say(gesture?CONTACT_REACTIONS[part].notice:familiar?'익숙한 손길이네. 네 손에 조금 더 기대어요.':line,3000);persist();
}
function clearOffer(){offer=null;$('offer').hidden=true;}
function welcomeBack(){
 const memory=reunionMemory(s);if(!memory||!begin(11,4800,'reunion'))return false;
 action.memory=memory;busyUntil=0;nextApproach=Date.now()+65000;
 if(memory.kind==='toy'){room.toy=memory.toy;room.toyX=s.bond.toyX;room.target=Math.max(.3,Math.min(.7,room.toyX+(room.x<room.toyX?-.05:.05)));say('지난번 함께 놀던 '+(memory.toy==='ball'?'매듭공':'뼈 인형')+'을 다시 네 곁에 놓으려 해요.',4800);}
 else if(memory.kind==='rest'||memory.kind==='window'){room.target=memory.kind==='window'?.34:s.bond.spot;say(memory.kind==='rest'?'함께 쉬던 자리를 기억하고 있어요.':'나란히 바라보던 창가에서 다시 눈이 마주쳐요.',4800);}
 else{room.target=companionPlace(s);say('익숙한 손길을 기억하고 '+({head:'머리를',chin:'턱을',back:'몸 옆을'}[memory.part])+' 살짝 맡겨요.',4800);}
 persist();return true;
}
function callName(){
 if(!s||!ready||conflict)return;markInput();
 if(asleep(s)){say('새근새근, 이름은 깨어나면 불러 줘요.');return;}
 if(action&&['water','food','brush','play'].includes(action.kind)){pending={kind:'name'};say('목소리를 들었어요. 하던 일을 마치고 다가올 거예요.');return;}
 pending=null;if(!begin(11,3400,'name'))return;room.target=room.x;
 experience(s,'name');interact(s,'name');remember(s,'이름을 부르자 눈을 맞추며 다가왔어요');say(s.name+', 여기 있어.');persist();
}
function quiet(kind){
 if(!s)return;if(Date.now()<busyUntil&&action?.kind!=='invite'){pending={kind:'quiet',quiet:kind};say('하던 일을 마치고 함께 앉아요.');return;}
 if(!begin(5,8500,kind))return;
 busyUntil=0;
 room.target=kind==='window'?.34:.65;
 say(kind==='window'?'창가에 나란히 앉아 잠깐 바라봐요.':'익숙한 쿠션 곁에서 함께 쉬어요.',7000);
}
function invite(){
 const kind=nextInvitation(s);s.bond.invitations=Math.min(100000,s.bond.invitations+1);
 nextInvite=Date.now()+65000;offer=kind;room.setPose(5);if(kind==='window'||kind==='rest')room.target=kind==='window'?.34:s.bond.spot;
 if(kind==='toy'){room.toy=favorite(s);room.toyX=Math.min(.76,room.x+.12);}
 const label={toy:'같이 놀기',window:'창가에 함께 앉기',rest:'곁에서 쉬기',water:'놀이 뒤 물 한 모금',brush:'식사 뒤 살살 빗질'}[kind];
 say({toy:'장난감을 네 쪽에 놓았어요. 같이 놀까?',window:'창밖을 보다가 네 쪽을 돌아봐요.',rest:'함께 쉬던 자리에서 기다려요.',water:'놀고 나서 함께 물을 마시던 시간이 떠올랐나 봐요.',brush:'식사 뒤 편안했던 빗질을 기다려요.'}[kind],10000);
 $('offer').textContent=label;$('offer').hidden=false;
 action={kind:'invite',at:Date.now(),until:Date.now()+10000};busyUntil=0;persist();
}
function play(toy,where=.73){
 if(!s||asleep(s))return;if(action?.kind==='invite'){action=null;busyUntil=0;}
 if(Date.now()<busyUntil){pending={kind:'play',toy,where};say('하던 일을 마치면 고른 장난감으로 놀아요.');return;}
 if(!begin(2,8200,'play'))return;
 action.toy=toy;action.ending=playEnding(s,toy);action.returnTarget=companionPlace(s);action.destination=s.bond.experiences.includes('rest')?s.bond.spot:.65;room.toy=toy;room.toyX=Math.max(.24,Math.min(.76,where));room.target=room.toyX+(room.x<room.toyX?-.04:.04);action.approachMs=Math.max(1800,Math.abs(room.target-room.x)/.22*1000+700);action.until+=action.approachMs-1800;busyUntil=action.until;
 say(room.species==='cat'?'가만히 살피다가 앞발로 잡아요. 바닥을 눌러 밀어 줄 곳을 골라요.':room.species==='pig'?'코를 낮춰 장난감을 찾아요. 바닥을 눌러 함께 갈 곳을 골라요.':'바닥을 누르면 가져다줘요. 친구를 누르면 장난쳐요.',4500);sound();persist();
}
function care(kind){if(Date.now()<busyUntil){pending={kind:'care',care:kind};say('하던 일을 마치면 '+({water:'물 마시기',food:'식사',brush:'빗질'}[kind])+'로 이어갈게요.');return;}if(kind==='food'&&Date.now()-(s.care.food||0)<3600000){say('아직 배불러요. 물을 마시거나 함께 쉬어 볼까요?');return;}if(!begin(kind==='brush'?1:4,kind==='brush'?6000:4200,kind))return;room.prop=kind;say({water:'천천히 마셔도 괜찮아.',food:'맛있게 먹어.',brush:'기분 좋은 손길. 그만하고 싶으면 돌아가도 돼요.'}[kind]);sound(kind);persist();}
function hide(){if(Date.now()<busyUntil)return;if(!begin(5,14000,'hide'))return;room.hide=true;room.target=[.36,.55,.67][s.memories.length%3];say('쿠션 뒤에 누가 있을까? 펫을 눌러 찾아봐요.',12000);}
function found(){if(action?.kind!=='hide')return;room.hide=false;action=null;busyUntil=0;begin(1,2200,'found');interact(s,'found');remember(s,'쿠션 뒤에서 눈이 마주쳤어요');say('찾았다! 눈이 마주쳤어.');sound();persist();}
function finish(){
 const previous=action,kind=previous?.kind,done=previous?.done,completed=!!previous&&Date.now()>=previous.until;
 if(kind==='discovery'&&completed){s.bond.discoveryDay=day(s);persist();}
 if(completed&&['water','food','brush'].includes(kind)){if(kind==='water'&&s.bond.last==='play')experience(s,'waterAfterPlay');if(kind==='brush'&&s.bond.last==='food')experience(s,'brushAfterFood');s.care[kind]=Date.now();interact(s,kind);remember(s,{water:'깨끗한 물을 마셨어요',food:'편안하게 식사했어요',brush:'털을 부드럽게 빗었어요'}[kind]);}
 if(kind==='touch'&&!previous.gesture&&Date.now()-previous.at>=1400&&creditTouch(s,{[previous.part]:900}))persist();
 if(kind==='hide'&&!asleep(s)&&!conflict){room.hide=false;action=null;busyUntil=0;begin(11,2200,'peek');room.target=.5;say('여기 있었네! 스스로 나와 눈을 맞춰요.');return;}
 if(kind&&kind!=='invite')nextInvite=Math.max(nextInvite,Date.now()+12000);
 if(kind==='play'&&completed){
  s.bond.lastEnding=previous.ending;s.bond.lastToy=previous.toy;interact(s,previous.toy);remember(s,previous.toy==='ball'?'매듭공을 함께 굴렸어요':'뼈 인형을 가지고 놀았어요');
  if(previous.ending==='nest')s.bond.spot=previous.destination;
  s.bond.plays=Math.min(100000,s.bond.plays+1);experience(s,previous.ending);
  room.toyX=room.x;s.bond.toy=room.toy;s.bond.toyX=Math.max(.24,Math.min(.76,room.toyX));
  remember(s,playMemory(room.species,previous.ending));
 }
 if(completed&&['rest','window'].includes(kind)){s.bond.spot=room.target;experience(s,kind);remember(s,kind==='rest'?'익숙한 쿠션 곁에서 함께 쉬었어요':'창가에 나란히 앉아 바깥을 보았어요');}
 if(completed&&['water','food','brush','play','rest','window'].includes(kind)){s.bond.last=kind;persist();}
 action=null;busyUntil=0;clearOffer();room.affection=null;room.contactPhase=null;room.stroke=null;room.touchPart=null;room.familiarTouch=false;releaseToy();room.prop=null;room.point=null;room.hide=false;
 room.target=room.x;room.setPose(asleep(s)?3:((kind==='reunion'&&previous.memory?.kind==='rest')||(kind==='discovery'&&previous.moment==='beside'))&&room.renderPose===23?23:['affection','contactEnd','approach','reunion','discovery'].includes(kind)?11:0);
 if(pending&&!asleep(s)&&!conflict){
  if(kind!=='handoff'){room.setPose(11);action={kind:'handoff',at:Date.now(),until:Date.now()+500};busyUntil=action.until;return;}
  const next=pending;pending=null;if(next.kind==='name')callName();else if(next.kind==='touch')pet(next.part);else if(next.kind==='quiet')quiet(next.quiet);else if(next.kind==='play')play(next.toy,next.where);else care(next.care);return;
 }
 if(!completed&&['water','food','brush'].includes(kind)){room.setPose(11);say('잠깐 눈을 맞춰요. 다른 일을 해도 괜찮아요.',2200);}
 if(completed&&!asleep(s)&&['water','food','brush','play'].includes(kind)){
  room.setPose(1);action={kind:'settle',at:Date.now(),until:Date.now()+1700,after:kind};
  say(({water:'물 한 모금 마시고 네 쪽을 바라봐요.',food:'잘 먹었어. 곁에서 쉬어도 될까?',brush:'부드러운 손길에 눈이 스르르 감겨요.',play:previous?.ending==='nest'?'장난감을 놓고 네가 오기를 기다려요.':'장난감을 곁에 두고 네 손길을 기다려요.'})[kind],3500);
 }
 if(kind==='settle'){
  const routine=previous.after==='play'&&s.bond.experiences.includes('waterAfterPlay')?'water':previous.after==='food'&&s.bond.experiences.includes('brushAfterFood')?'brush':null;
  if(routine){offer=routine;$('offer').textContent=routine==='water'?'놀이 뒤 물 한 모금':'식사 뒤 살살 빗질';$('offer').hidden=false;say('함께하던 순서를 기억하나 봐요. 다른 일을 해도 괜찮아요.');action={kind:'invite',at:Date.now(),until:Date.now()+10000};}
 }
 if(!action&&['affection','settle'].includes(kind)&&bondStage(s)>=1&&Date.now()>=nextApproach&&!asleep(s)&&!conflict&&!$('panel').open&&!document.hidden){if(begin(11,3200,'approach')){busyUntil=0;nextApproach=Date.now()+65000;const step=[0,.04,.08,.12][bondStage(s)];room.target=room.x+Math.max(-step,Math.min(step,.5-room.x));action.part=preferredPart(s);say(room.species==='cat'?'먼저 다가와 익숙한 손길을 기다려요.':room.species==='pig'?'코를 살짝 들고 네 곁으로 다가와요.':'먼저 곁에 와서 고개를 맡겨요.',3200);}}
 done?.();
}
function discover(){
 const kind=lifeMoment(s);if(!kind||!begin(11,5200,'discovery'))return;
 action.moment=kind;busyUntil=0;const today=day(s);s.bond.discoveryAttempts=s.bond.discoveryAttemptDay===today?(s.bond.discoveryAttempts||0)+1:1;s.bond.discoveryAttemptDay=today;s.bond.discoveryAt=Date.now();nextDiscovery=Date.now()+180000;
 if(kind==='toy'){room.toy=favorite(s);room.target=Math.max(.3,Math.min(.7,s.bond.toyX));room.toyX=s.bond.toyX;}
 else room.target=kind==='window'?.34:.5;
 say(kind==='toy'?'오늘은 먼저 익숙한 장난감을 골랐어요.':kind==='window'?(room.rain?'창밖의 빗방울을 살피다가 네 쪽을 돌아봐요.':'햇살을 살피다가 네 쪽을 돌아봐요.'):'네 곁에 먼저 자리를 잡고 편하게 기대어요.',5200);persist();
}
function update(){
 syncMusic();
 if(!s||!ready)return;const t=Date.now(),sleep=sleepReady(s,action,t);if(asleep(s,t))pending=null;
 room.size=.88+Math.min(1,age(s)/30)*.16;room.night=new Date().getHours()>=19||new Date().getHours()<7;
 room.rain=s.weather==='rain'||s.weather==='auto'&&Math.floor(t/DAY)%5===2;
 $('dayline').textContent=s.name+'와 함께한 '+day(s)+'일';$('dayline').setAttribute('aria-label',s.name+' 이름 부르기');
 const side=room.x<.43?'left':'right';if(document.body.dataset.petSide!==side)document.body.dataset.petSide=side;
 if(sleep!==lastSleep){pending=null;finish();controls();lastSleep=sleep;say(sleep?'새근새근, 곁에서 편히 쉬어요.':'잘 쉬었어. 다시 함께 놀까?');}
 if(sleep)room.setPose(3);
 if(action){
  let dt=t-action.at;if(action.kind==='play')dt-=action.approachMs-1800;
  if(t>=action.until)finish();
  else if(action.kind==='play'){
   const end=action.ending;
   if(dt<1800)room.setPose(2);
   else if(dt<2900){room.setPose(room.species==='cat'?7:room.species==='pig'?22:2);room.target=room.x;room.carry=room.species==='dog';if(!room.carry)room.toyX=room.x-room.base/innerWidth*.24;}
   else if(dt<4600){room.target=end==='nest'?action.destination:end==='tease'?.4:(action.returnTarget??.5);room.setPose(0);room.carry=room.species==='dog';if(!room.carry)room.toyX=room.x+(room.target>room.x?1:-1)*room.base/innerWidth*.24;}
   else if(dt<6000){room.toyX=room.x;room.carry=false;room.setPose(end==='tease'?2:5);}
   else if(dt<7200&&end==='tease'){room.carry=room.species==='dog';room.target=.6;room.setPose(room.species==='cat'?7:2);if(!room.carry)room.toyX=room.x+room.base/innerWidth*.24;}
   else{room.toyX=room.x;room.carry=false;room.setPose(0);}
  }else if(action.kind==='name'){
   if(dt>650){room.setPose(11);room.target=.5;}
  }else if(action.kind==='touch'){
   if(room.stroke&&!$('panel').open){sampleStroke(room.stroke,performance.now());action.until=t+350;busyUntil=action.until;const phase=room.stroke.inside===false?'pause':contactPhase(room.stroke,performance.now(),room.contactPhase),key=room.stroke.part+':'+phase;if(room.responseKey!==key){room.responseKey=key;say(phase==='pause'?'잠깐 눈을 맞춰요. 조금 천천히 쓰다듬어 주세요.':CONTACT_REACTIONS[room.stroke.part][phase],2000);}room.contactPhase=phase;room.setPose(responsePose(room.touchPart,phase,room.species));}else room.setPose({head:8,chin:9,back:10}[room.touchPart]??1);
  }else if(action.kind==='approach'){room.setPose(dt<700||Math.abs(room.target-room.x)>.01?11:{head:8,chin:9,back:10}[action.part]);
  }else if(action.kind==='reunion'){const m=action.memory;if(m.kind==='toy'&&dt>1800&&(action.picked||Math.abs(room.x-room.target)<.035)){action.picked=true;room.target=companionPlace(s);room.carry=room.species==='dog'&&Math.abs(room.x-room.target)>.025;room.toyX=room.x;room.setPose(Math.abs(room.x-room.target)<.01&&bondStage(s)>=2?{head:8,chin:9,back:10}[preferredPart(s)]:room.species==='cat'?7:room.species==='pig'?22:11);}const arrived=Math.abs(room.target-room.x)<.01;if(m.kind!=='toy')room.setPose(!arrived||dt<900?11:m.kind==='touch'?{head:8,chin:9,back:10}[m.part]:m.kind==='rest'&&bondStage(s)>=3&&dt>2200?23:m.kind==='window'?5:11);
  }else if(action.kind==='discovery'){if(action.moment==='toy'&&dt>1800&&(action.picked||Math.abs(room.x-room.target)<.035)){action.picked=true;room.target=companionPlace(s);room.carry=room.species==='dog'&&Math.abs(room.x-room.target)>.025;room.toyX=room.x;}room.setPose(action.moment==='beside'&&dt>2900?23:action.moment==='window'&&dt<3000?5:action.moment==='toy'&&action.picked?(room.species==='cat'?7:room.species==='pig'?22:11):11);
  }else if(action.kind==='contactEnd'){room.setPose(11);
  }else if(action.kind==='affection'){room.setPose(responsePose(room.affection.part,'after',room.species,performance.now()-room.affection.at,room.affection.pose,room.affection.duration)); 
  }else if(action.kind==='window'){room.setPose(5);}
  else if(action.kind==='rest'&&dt>2400){room.setPose(3);}
 }
 document.body.classList.toggle('petting-drag',room.touchPart!=null||!!room.affection);
 const motionKind=sleep?'sleep':action?.kind??'idle';if(room.motionKind!==motionKind){room.motionKind=motionKind;room.motionStart=performance.now();}
 const queued=pending?(pending.kind==='touch'?({head:'머리 쓰다듬기',chin:'턱 밑 쓰다듬기',back:'등 쓰다듬기'}[pending.part]):pending.kind==='name'?'이름 부르기':pending.kind==='play'?(pending.toy==='ball'?'매듭공 놀이':'뼈 인형 놀이'):pending.kind==='quiet'?(pending.quiet==='window'?'창가에 함께 앉기':'곁에서 쉬기'):({water:'물 마시기',food:'식사',brush:'빗질'}[pending.care])):'';
 if($('queued').textContent!==queued)$('queued').textContent=queued;$('queued').setAttribute('aria-label',queued?queued+' 예약 취소':'예약 없음');$('queued').hidden=!queued;
 if(t>speechUntil)$('speech').textContent='';
 if(!action&&t>=nextDiscovery&&t-lastInput>=8000&&!$('panel').open&&!document.hidden&&!conflict&&!sleep&&lifeMoment(s,t)){discover();return;}
 if(inviteReady({now:t,next:nextInvite,lastInput,busy:!!action,blocked:$('panel').open||document.hidden||conflict,sleeping:sleep}))invite();
}
setInterval(update,160);
$('scene').addEventListener('pointerdown',e=>{if(!e.isPrimary||(room.stroke&&room.stroke.pointerId!==e.pointerId))return;markInput();if(!s||!ready||$('panel').open||conflict)return;if(action?.kind==='hide'){const b=room.petBox;if(e.clientX>=b.x-20&&e.clientX<=b.x+b.w+20&&e.clientY>=b.y&&e.clientY<=b.y+b.h+20)found();return;}if(sleepReady(s,action)){say('새근새근, 편하게 쉬고 있어요.');return;}if(action?.kind==='play'){const elapsed=Date.now()-action.at-(action.approachMs-1800);if(elapsed<4600){const b=room.petBox,inside=e.clientX>=b.x&&e.clientX<=b.x+b.w&&e.clientY>=b.y&&e.clientY<=b.y+b.h;if(!inside&&(e.clientY<=innerHeight*.42||e.clientY>=innerHeight-115))return;action.ending=playChoice(e.clientX/innerWidth,inside);action.destination=Math.max(.3,Math.min(.7,e.clientX/innerWidth));action.returnTarget=action.destination;room.playSignal={x:e.clientX,y:e.clientY,at:performance.now()};say({return:'네 앞으로 가져갈게!',tease:'같이 장난치자!',nest:'그 자리에 놓고 함께 쉴까?'}[action.ending],2800);}return;}if(room.toyPoint&&Math.hypot(e.clientX-room.toyPoint.x,e.clientY-room.toyPoint.y)<Math.max(40,room.base*.16)&&(Date.now()>=busyUntil||action?.kind==='invite')){play(room.toy);return;}const box=room.petBox,inside=e.clientX>=box.x&&e.clientX<=box.x+box.w&&e.clientY>=box.y&&e.clientY<=box.y+box.h;if(inside){const hit=contactPart(box,{x:e.clientX,y:e.clientY},null,room.variant,room.renderPose,room.facing),startPose=room.renderPose;if(!hit){say('머리나 턱 아래, 몸 옆을 살살 쓰다듬어 주세요.',1800);return;}if(action?.kind!=='brush')pet(hit,true);room.point={x:e.clientX,y:e.clientY};if(action?.kind==='touch'&&e.isPrimary){const now=performance.now();room.stroke={pointerId:e.pointerId,noticeMs:[480,360,280,240][bondStage(s)],variant:room.variant,pose:startPose,facing:room.facing,inside:true,sampleAt:now,calmMs:{head:0,chin:0,back:0},started:now,partStarted:now,distance:0,box:{...box},part:room.touchPart,candidate:room.touchPart,since:now,changed:now,at:now,x:e.clientX,y:e.clientY,lean:0};$('scene').setPointerCapture(e.pointerId);}}else if(Date.now()>=busyUntil&&e.clientY>innerHeight*.42&&e.clientY<innerHeight-115){if(mode==='play'){play(room.toy||favorite(s),e.clientX/innerWidth);}else{if(['rest','window','approach','reunion','discovery'].includes(action?.kind))finish();if(action?.kind==='invite'){action=null;clearOffer();nextInvite=Math.max(nextInvite,Date.now()+12000);room.setPose(11);}room.target=Math.max(.3,Math.min(.7,e.clientX/innerWidth));say('네 곁으로 갈게.',2200);}}});
$('scene').addEventListener('pointermove',e=>{if(!e.isPrimary||(room.stroke&&room.stroke.pointerId!==e.pointerId))return;if(e.buttons&&s&&!sleepReady(s,action)&&!$('panel').open&&!conflict){markInput();if(room.stroke){if(moveStroke(room.stroke,{x:e.clientX,y:e.clientY},performance.now())){if(room.touchPart!==room.stroke.part){room.touchPart=room.stroke.part;room.familiarTouch=familiarTouch(s,room.touchPart)&&bondStage(s)>=1;say({head:'머리를 살며시 맡겨요.',chin:'턱을 조금 더 기대어요.',back:'등을 따라 편안하게 돌아봐요.'}[room.touchPart],2200);}room.point={x:e.clientX,y:e.clientY};}else{room.point=null;}}else if(action?.kind==='brush'||action?.kind==='touch')room.point={x:e.clientX,y:e.clientY};}});
function releaseStroke(reason){const stroke=room.stroke;room.point=null;room.stroke=null;room.contactPhase=null;room.responseKey=null;if(!stroke||action?.kind!=='touch')return;sampleStroke(stroke,performance.now());if(reason==='pointerup'&&creditTouch(s,stroke.calmMs)){room.familiarTouch=familiarTouch(s,stroke.part)&&bondStage(s)>=1;remember(s,'부드러운 손길을 편안하게 받아 주었어요');persist();}const reaction=afterContact(stroke,performance.now(),reason,room.familiarTouch);if(asleep(s)||conflict)return;if(!reaction){room.touchPart=null;room.setPose(11);action={kind:'contactEnd',at:Date.now(),until:Date.now()+420};busyUntil=0;say('손길이 멈추자 조용히 바라봐요.',1600);return;}reaction.duration+=bondStage(s)*180;reaction.pose=room.renderPose??room.pose;reaction.from={...room.reaction};if(reaction.pose>=8&&reaction.pose<=10)reaction.from.angle=(reaction.from.angle||0)+Math.max(-.022,Math.min(.022,(stroke.x-room.px)/room.base*.05));room.affection=reaction;room.touchPart=null;action={kind:'affection',at:Date.now(),until:Date.now()+reaction.duration};busyUntil=0;if(reaction.part==='chin'&&room.species==='dog'&&Math.abs(reaction.direction)>.25)room.target=Math.max(.3,Math.min(.7,room.x+reaction.direction*.025));sound('breath');say(room.species==='cat'?(reaction.part==='head'?'눈을 살며시 감고 손길의 여운을 느껴요.':'눈을 살며시 감았다가 네 쪽을 바라봐요.'):room.species==='pig'?'코를 들고 살펴보다 편안하게 머물러요.':reaction.part==='head'?'손길이 머물던 자리에 잠깐 기대어요.':'네 쪽을 바라보며 곁에 머물러요.',reaction.duration);}
for(const type of ['pointerup','pointercancel','pointerleave','lostpointercapture'])$('scene').addEventListener(type,e=>{if(e.isPrimary&&(!room.stroke||room.stroke.pointerId===e.pointerId))releaseStroke(type);});
$('scene').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();markInput();if(action?.kind==='play'){if(Date.now()-action.at-(action.approachMs-1800)<4600){action.ending='tease';say('같이 장난치자!',2800);}return;}action?.kind==='hide'?found():pet();}});
function panel(title){releaseStroke('pointercancel');if(['approach','reunion','discovery'].includes(action?.kind))finish();room.point=null;markInput();const body=$('panelBody');body.replaceChildren();const h=document.createElement('h2');h.textContent=title;body.append(h);if(!$('panel').open)$('panel').showModal();return body;}
function para(body,text){const p=document.createElement('p');p.textContent=text;body.append(p);return p;}
function option(body,label,fn){const b=button(label,fn);b.className='soft';body.append(b);return b;}
function close(){if($('panel').open)$('panel').close();markInput();}
$('closePanel').onclick=close;$('panel').addEventListener('close',markInput);$('panel').addEventListener('click',e=>{if(e.target===$('panel')){const r=$('panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
let photoPending=false;
async function takePhoto(){if(!s||!ready||photoPending||broken||conflict)return;if(s.photos.length>=12){showAlbum();say('사진 12장을 간직하고 있어요. 내보내거나 골라 정리해 주세요.');return;}const record=s,at=Date.now(),sleeping=asleep(s);photoPending=true;$('camera').setAttribute('aria-busy','true');try{const url=await room.photo();if(s!==record||broken||conflict)return;if(url.length>250000){say('사진이 너무 커서 저장하지 못했어요.');return;}s.photos.push({at,url});remember(s,'함께한 순간을 사진으로 남겼어요');if(!persist()){say('사진은 임시로 담았어요. 추억에서 사진 저장으로 보관해 주세요.',6000);return;}if(!sleeping&&!asleep(s)){sound('photo');$('scene').classList.remove('shutter');void $('scene').offsetWidth;$('scene').classList.add('shutter');}say(asleep(s)?'잠든 모습을 조용히 간직했어요.':'이 순간을 추억에 담았어요.');}catch{say('사진을 담지 못했어요. 잠시 뒤 다시 찍어 주세요.');}finally{photoPending=false;$('camera').removeAttribute('aria-busy');}}
function download(text,name,type){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function showAlbum(){if(!s)return;const body=panel('우리의 추억');para(body,s.name+'와 함께한 '+day(s)+'일. 작은 순간들을 간직해요.');if(age(s)>=30)para(body,'우리의 첫 30일을 함께했어요. 앞으로도 같은 친구와 계속 지내요.');para(body,'첫 추억과 30일 기념은 간직하고, 나머지는 최근 기록으로 채워요. 사진은 직접 지우기 전까지 남아요.');option(body,'사진 찍기',()=>{close();takePhoto();});option(body,'한 줄 남기기',()=>{const existing=body.querySelector('form input');if(existing){existing.focus();return;}const form=document.createElement('form'),input=document.createElement('input'),b=document.createElement('button');input.maxLength=80;input.placeholder='오늘 기억하고 싶은 순간';input.setAttribute('aria-label','오늘의 한 줄');b.textContent='간직하기';b.className='primary';form.append(input,b);body.append(form);input.focus();form.onsubmit=e=>{e.preventDefault();if(input.value.trim()){remember(s,input.value.trim().slice(0,80));persist();showAlbum();}};});const grid=document.createElement('div');grid.className='photos';s.photos.forEach((photo,i)=>{const f=document.createElement('figure'),img=new Image(),cap=document.createElement('figcaption'),a=document.createElement('a');img.src=photo.url;img.alt=s.name+'의 추억 사진 '+(i+1);cap.textContent=new Date(photo.at).toLocaleDateString('ko-KR');a.href=photo.url;a.download='우리의-추억-'+(i+1)+'.webp';a.textContent='사진 저장';f.append(img,cap,a);const del=button('삭제',()=>{const confirm=panel('이 사진을 지울까요?');para(confirm,'사진 저장으로 먼저 보관할 수 있어요. 다른 기록은 유지됩니다.');option(confirm,'취소',showAlbum);option(confirm,'이 사진 삭제',()=>{const old=s.photos.slice();s.photos.splice(i,1);if(!persist())s.photos=old;showAlbum();});});f.append(del);grid.append(f);});body.append(grid);if(!s.photos.length)para(body,'오른쪽 위 카메라로 첫 사진을 남겨 보세요.');for(const m of s.memories.slice().reverse()){const row=document.createElement('div'),small=document.createElement('small');row.className='memory';small.textContent=m.day+'일째';row.append(small,document.createTextNode(m.text));body.append(row);}}
function choosePet(){
 const body=panel('우리의 친구들');para(body,'친구마다 이름과 함께한 날, 추억을 따로 간직해요. 이전 친구의 기록도 남아 있어요.');
 const grid=document.createElement('div');grid.className='pet-grid';body.append(grid);
 for(const p of PETS){const b=button(p.name,()=>{
  if(s?.variant===p.id){close();return;}
  const confirm=panel(p.name+' 만나기');para(confirm,s?'지금 친구의 기록을 보관한 뒤 선택한 친구를 만나요.':'선택한 친구를 만나 이름을 지어 주세요.');
  option(confirm,'돌아가기',choosePet);option(confirm,'만나러 가기',()=>{
   try{
    if(broken||conflict)throw Error('먼저 현재 기록을 복구하거나 새로고침해 주세요.');
    const slot=KEY+'-pet-'+p.id,raw=localStorage.getItem(slot);let target=raw?validate(JSON.parse(raw)):null;
    if(target&&target.variant!==p.id)throw Error('친구 기록이 일치하지 않아요. 원본 기록을 확인해 주세요.');
    if(s)localStorage.setItem(KEY+'-pet-'+s.variant,JSON.stringify(s));
    if(target)localStorage.setItem(KEY,JSON.stringify(target));else localStorage.removeItem(KEY);
    location.href=location.pathname+'?pet='+encodeURIComponent(p.id);
   }catch(e){para(confirm,'친구를 바꾸지 못했어요. '+e.message);}
  });
 });b.setAttribute('aria-label',p.name+' 선택');b.setAttribute('aria-pressed',String(room.variant===p.id));
 const img=new Image();img.loading='lazy';img.src=p.id==='puppy'?'assets/puppy-detail.webp':'assets/pets/'+p.id+'/detail.webp';img.alt='';b.prepend(img);grid.append(b);}
}
function showMenu(){const body=panel('잠깐, 우리 이야기');if(s){para(body,s.name+' · '+petById(s.variant).name+' · 함께한 '+day(s)+'일');option(body,'다른 친구 만나기',choosePet);para(body,'현실의 하루가 이곳에서도 하루예요. 쉬었다 와도 아프거나 마음이 멀어지지 않아요. 30일 이후에도 계속 함께해요.');option(body,s.music?'배경음 끄기':'배경음 켜기',()=>{s.music=!s.music;persist();syncMusic();music.unlock();showMenu();});option(body,s.sound?'효과음 끄기':'효과음 켜기',()=>{s.sound=!s.sound;persist();sound();showMenu();});option(body,'기록 파일 내보내기',()=>download(JSON.stringify(s,null,2),'너와나의하루-기록.json','application/json'));option(body,'이름 바꾸기',()=>{const p=panel('이름을 불러 주세요'),f=document.createElement('form'),input=document.createElement('input'),b=document.createElement('button');input.value=s.name;input.maxLength=12;input.setAttribute('aria-label','펫 이름');b.textContent='이름 저장';b.className='primary';f.append(input,b);p.append(f);f.onsubmit=e=>{e.preventDefault();if(cleanName(input.value)){s.name=cleanName(input.value);persist();close();say(s.name+', 반가워!');}};});option(body,'창가에 함께 앉기',()=>{close();quiet('window');});option(body,'쿠션 곁에서 쉬기',()=>{close();quiet('rest');});option(body,'창가에서 비 구경',()=>{s.weather='rain';persist();close();say('오늘은 빗소리 대신 창밖을 조용히 바라봐요.');});option(body,'비 그치기',()=>{s.weather='clear';persist();close();});if(!asleep(s))option(body,'함께 쉬기',()=>{finish();s.restUntil=Date.now()+120000;remember(s,'곁에 앉아 조용히 쉬었어요');persist();close();update();controls();});option(body,'추억 펼치기',showAlbum);}
 if(broken&&originalRecord)option(body,'읽지 못한 원본 보관',()=>download(originalRecord,'펫-원본기록.txt','text/plain'));
 option(body,'기록 파일 복구',()=>$('restoreFile').click());const a=document.createElement('a');a.href='classic/';a.textContent='기존 펫키우기 · 강아지 / 고양이 / 햄스터 / 토끼';a.className='classic';body.append(a);para(body,'새 교감 모드의 기록은 기존 게임과 별도로 저장됩니다. 이 기기의 브라우저에 저장되며, 기기를 바꿀 때는 기록 파일을 옮겨 주세요.');const activities=document.createElement('section'),heading=document.createElement('h3');activities.className='quiet-actions';heading.textContent='나란히 쉬어 갈까?';activities.append(heading);for(const name of ['창가에 함께 앉기','쿠션 곁에서 쉬기','함께 쉬기','추억 펼치기']){const b=[...body.children].find(e=>e.tagName==='BUTTON'&&e.textContent===name);if(b){if(asleep(s)&&name!=='추억 펼치기'){b.disabled=true;b.title='친구가 깨어나면 함께해요.';}activities.append(b);}}if(activities.children.length>1){body.insertBefore(activities,body.children[2]||null);const h=document.createElement('h3');h.className='settings-heading';h.textContent='친구와 기록 관리';activities.after(h);}} 
$('restoreFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{if(f.size>4000000)throw Error('4MB 이하 기록 파일을 선택해 주세요.');const candidate=validate(JSON.parse(await f.text()));const body=panel('기록을 불러올까요?');para(body,candidate.name+'의 '+day(candidate)+'일 기록입니다. 현재 기록은 이전 기록으로 보관합니다.');option(body,'취소',showMenu);option(body,'이 기록 불러오기',()=>{try{const previous=localStorage.getItem(KEY);if(previous)localStorage.setItem(KEY+'-previous',previous);localStorage.setItem(KEY,JSON.stringify(candidate));if(candidate.variant!==room.variant){location.reload();return;}s=candidate;broken=false;conflict=false;close();enter();say('기록을 이어서 만나요.');}catch{para(body,'저장 공간이 부족해 불러오지 못했어요. 현재 기록은 유지됩니다.');}});}catch(err){const body=panel('기록을 확인해 주세요');para(body,err.message);}};
$('choosePet').onclick=choosePet;$('petKind').textContent=petById(room.variant).name;$('scene').setAttribute('aria-label',petById(room.variant).name+'. 눌러서 인사할 수 있어요.');$('dayline').onclick=callName;$('offer').onclick=()=>{markInput();const choice=offer;choice==='toy'?play(favorite(s)):['water','brush'].includes(choice)?care(choice):choice&&quiet(choice);};
$('queued').onclick=()=>{markInput();pending=null;update();say('예약만 취소했어요. 지금 하던 일은 계속해요.',2200);};
$('camera').onclick=()=>{markInput();takePhoto();};$('album').onclick=showAlbum;$('menu').onclick=showMenu;
function enter(){lastInput=Date.now();nextInvite=lastInput+22000;nextApproach=lastInput+45000;nextDiscovery=lastInput+60000;room.affection=null;room.stroke=null;room.contactPhase=null;room.responseKey=null;action=null;pending=null;busyUntil=0;clearOffer();room.carry=false;room.prop=null;room.hide=false;room.point=null;room.touchPart=null;room.familiarTouch=false;room.velocity=0;delete document.body.dataset.welcome;$('welcome').hidden=true;if(!s)return;lastSleep=asleep(s);room.setPose(lastSleep?3:0);room.x=s.bond.spot;room.target=s.bond.spot;room.toy=s.bond.toy;room.toyX=s.bond.toyX;room.toyPosition=null;controls();update();if(age(s)>=30&&!s.memories.some(m=>m.text==='우리의 첫 30일, 앞으로도 함께해요')){remember(s,'우리의 첫 30일, 앞으로도 함께해요');persist();showAlbum();}}
$('adopt').onsubmit=e=>{e.preventDefault();if(!ready||broken||s)return;s=createPet($('petName').value);s.variant=room.variant;remember(s,'처음 만나 이름을 불러 주었어요');persist();enter();room.x=.67;begin(5,3000,'hello');room.target=.55;say(s.name+', 만나서 반가워. 천천히 친해지자.',6000);};
room.ready.then(()=>{ready=true;$('loading').hidden=true;$('start').disabled=broken;if(s){enter();if(!welcomeBack())say(asleep(s)?'새근새근, 편히 쉬고 있어요. 곁에서 조용히 만나요.':s.toys.ball+s.toys.bone>0?s.name+'가 좋아하던 '+(favorite(s)==='ball'?'매듭공':'뼈 인형')+'이 여기 있어요.':'다시 만나서 반가워, '+s.name+'!');}else if(!broken){document.body.dataset.welcome='';$('welcome').hidden=false;}else showMenu();}).catch(()=>{$('loading').replaceChildren(document.createTextNode('그림을 불러오지 못했어요. 기록은 그대로예요. '),button('다시 불러오기',()=>location.reload()));});
document.addEventListener('visibilitychange',()=>{syncMusic();if(document.hidden){releaseStroke('pointercancel');room.point=null;}room.active=!document.hidden;if(!document.hidden){markInput();update();}});
addEventListener('storage',e=>{if(e.key===KEY&&s){conflict=true;finish();const body=panel('다른 창에서 기록이 바뀌었어요');para(body,'서로 덮어쓰지 않도록 이 창의 저장을 멈췄어요. 새로고침하면 최신 기록을 불러옵니다.');option(body,'최신 기록 불러오기',()=>location.reload());}});
if(new URLSearchParams(location.search).has('qa'))window.bondQA={state:()=>structuredClone(s),room,action:()=>action?{kind:action.kind,ending:action.ending}:null,offer:()=>offer,mode:()=>mode,busy:()=>Date.now()<busyUntil,stage:()=>bondStage(s),invite:()=>{nextInvite=Date.now()-1;lastInput=Date.now()-9000;},update};


addEventListener('blur',()=>releaseStroke('pointercancel'));
