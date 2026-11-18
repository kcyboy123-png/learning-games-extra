import {STORIES,portrait,itemImage,coachFor,placeNames} from '../story.mjs?v=ui-journey-20261118';
import {findActivity} from './data/workshops.mjs';
import {runMission} from './ui/mission.mjs?v=ui-journey-20261118';
const host=parent.postGame,$=id=>document.getElementById(id);let mission;
const soundToggle=host.soundButton();soundToggle.id='lessonSound';$('leave').before(soundToggle);
document.addEventListener('pointerdown',()=>host.sound.unlock(),{once:true});
document.addEventListener('keydown',()=>host.sound.unlock(),{once:true});
document.addEventListener('click',e=>{const target=e.target.closest('button,[role="button"]');if(!target||target.id==='lessonSound'||target.closest('.primary-slot,.summary,.net-layout,.look-choice'))return;host.sound.sfx[target.closest('svg')?'place':'select']();});
function fit(){const portrait=innerHeight>innerWidth,s=portrait?innerWidth/1024:Math.min(innerWidth/1024,innerHeight/768),height=portrait?Math.max(768,innerHeight/s):768,app=$('app');app.classList.toggle('portrait',portrait);app.style.height=height+'px';app.style.transform=`scale(${s})`;app.style.left=`${(innerWidth-1024*s)/2}px`;app.style.top=`${Math.max(0,(innerHeight-height*s)/2)}px`;app.style.setProperty('--touch-size',48/s+'px');app.style.setProperty('--reading-size',18/s+'px');app.style.setProperty('--small-size',15/s+'px');}
addEventListener('resize',fit);fit();
const purposes=[
'컵을 안전하게 담을 상자를 골라요.',
'액자가 다치지 않게 상자에 보호대를 붙여요.',
'도구함을 알아볼 수 있게 상자 그림을 그려요.',
'등불이 기울지 않게 받칠 면을 찾아요.',
'간식을 담을 상자를 종이로 접어요.',
'편지 상자와 종이 우체부를 만들어요.',
'모두의 편지를 담을 마지막 상자를 준비해요.'];
let job='';
const hud={setLocation(){$('location').textContent=host.request.name+'의 소포';},setGoal(t){$('goal').textContent=t.replace(/복습/g,'출발 점검');},setSub(items){$('subbar').replaceChildren(...[job,...items].filter(Boolean).map(text=>{const tag=document.createElement('span');tag.textContent=text;return tag;}));},update(){}};
window.startPostalLesson=()=>{soundToggle.refresh?.();mission?.destroy();const found=findActivity(host.progress.current().id);const wi=host.progress.current().workshop,group=host.progress.activities.filter(a=>a.workshop===wi),done=group.filter(a=>host.progress.isComplete(a.id)).length;job=`${done<4?'포장':'출발 점검'} ${done+1}/${group.length}`;const gift=document.createElement('img');gift.src=itemImage(wi);gift.alt='';$('parcelSymbol').replaceChildren(gift);$('parcelSymbol').dataset.phase='gift';$('parcelSymbol').setAttribute('aria-label',host.request.item);$('sender').textContent=host.request.item;$('recipient').textContent=placeNames[host.request.destination]+' · '+STORIES[wi].to;const begin=(guided)=>{host.progress.setExtra('postal-intro:'+wi,true);host.save();mission=runMission({activity:{...found.activity,situation:purposes[wi]||purposes[6],postal:true,postalGuide:guided,postalResident:wi,parcelItem:host.request.item},workshop:found.workshop?{...found.workshop,name:host.request.name+'의 부탁'}:null,progress:host.progress,container:$('scene'),hud,assets:null,onSave:host.save,onDone:()=>{mission?.destroy();host.done(found);}});};if(host.progress.getExtra('postal-intro:'+wi)){begin(false);return;}hud.setLocation();hud.setGoal('포장 시작하기');hud.setSub([]);$('scene').replaceChildren();const card=document.createElement('section');card.className='story-welcome';const art=document.createElement('div');art.className='story-art';for(const [src,alt]of [['../'+portrait(wi),host.request.name],[itemImage(wi),host.request.item]]){const img=document.createElement('img');img.src=src;img.alt=alt;art.append(img);}const title=document.createElement('h2');title.textContent=host.request.name+'의 선물을 포장해요';const text=document.createElement('p');text.textContent=purposes[wi];const why=document.createElement('p');why.className='first-move';why.textContent='한 번에 한 가지씩 해 봐요.';card.append(art,title,text,why);for(const [label,guided]of [['포장 시작',false]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>begin(guided);card.append(b);}const note=document.createElement('p');note.className='start-note';note.textContent='어려우면 ‘도움이 필요해요’를 눌러요.';card.append(note);$('scene').append(card);};
$('leave').onclick=()=>{mission?.destroy();host.save();host.leave();};
window.startPostalLesson();




