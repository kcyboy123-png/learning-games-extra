import {STORIES,portrait,itemImage,coachFor,placeNames} from '../story.mjs?v=refine-20261116-r5';
import {findActivity} from './data/workshops.mjs';
import {runMission} from './ui/mission.mjs?v=refine-20261116-r5';
const host=parent.postGame,$=id=>document.getElementById(id);let mission;
function fit(){const portrait=innerHeight>innerWidth,s=portrait?innerWidth/1024:Math.min(innerWidth/1024,innerHeight/768),height=portrait?Math.max(768,innerHeight/s):768,app=$('app');app.classList.toggle('portrait',portrait);app.style.height=height+'px';app.style.transform=`scale(${s})`;app.style.left=`${(innerWidth-1024*s)/2}px`;app.style.top=`${Math.max(0,(innerHeight-height*s)/2)}px`;app.style.setProperty('--touch-size',48/s+'px');app.style.setProperty('--reading-size',18/s+'px');app.style.setProperty('--small-size',15/s+'px');}
addEventListener('resize',fit);fit();
const purposes=[
'둥근 컵도 네모난 상자에 담을 수 있어요. 우체국에서 쓸 직육면체 상자를 살펴봐요.',
'액자가 다치지 않게, 상자의 면·모서리·꼭짓점을 살펴봐요.',
'기록과 도구를 담을 상자를 그려요. 보이지 않는 모서리도 확인해요.',
'등불을 보호할 상자에서 마주 보는 면과 수직인 면을 확인해요.',
'간식 상자를 만들기 전, 학습용 종이 여섯 면이 정육면체로 접히는지 살펴봐요.',
'편지 상자와 종이 우체부를 만들어요. 표시된 cm는 학습용 모형의 길이예요.',
'모두의 소포를 보내기 전, 상자에 배운 내용을 함께 점검해요.'];
let job='';
const hud={setLocation(){$('location').textContent=host.request.name+'의 소포';},setGoal(t){$('goal').textContent=t.replace(/복습/g,'출발 점검');},setSub(items){$('subbar').textContent=[job,...items].filter(Boolean).join(' · ');},update(){}};
window.startPostalLesson=()=>{mission?.destroy();const found=findActivity(host.progress.current().id);const wi=host.progress.current().workshop,group=host.progress.activities.filter(a=>a.workshop===wi),done=group.filter(a=>host.progress.isComplete(a.id)).length;job=`${done<4?'포장 준비':'출발 점검'} ${done+1}/${group.length}${host.progress.getExtra('draft:'+found.activity.id)?' · 하던 작업':''}`;const gift=document.createElement('img');gift.src=itemImage(wi);gift.alt='';$('parcelSymbol').replaceChildren(gift);$('sender').textContent=host.request.item;$('recipient').textContent=placeNames[host.request.destination]+' · '+STORIES[wi].to;const begin=(guided)=>{host.progress.setExtra('postal-intro:'+wi,true);host.save();mission=runMission({activity:{...found.activity,situation:purposes[wi]||purposes[6],postal:true,postalGuide:guided,postalResident:wi,parcelItem:host.request.item},workshop:found.workshop?{...found.workshop,name:host.request.name+'의 부탁'}:null,progress:host.progress,container:$('scene'),hud,assets:null,onSave:host.save,onDone:()=>{mission?.destroy();host.done(found);}});};if(host.progress.getExtra('postal-intro:'+wi)){begin(false);return;}hud.setLocation();hud.setGoal('포장 시작하기');hud.setSub([]);$('scene').replaceChildren();const card=document.createElement('section');card.className='story-welcome';const art=document.createElement('div');art.className='story-art';for(const [src,alt]of [['../'+portrait(wi),host.request.name],[itemImage(wi),host.request.item]]){const img=document.createElement('img');img.src=src;img.alt=alt;art.append(img);}const title=document.createElement('h2');title.textContent=host.request.name+'의 선물을 포장해요';const text=document.createElement('p');text.textContent=purposes[wi];const why=document.createElement('p');why.className='first-move';why.textContent='포장 방법을 함께 살펴볼까, 바로 시작해 볼까?';card.append(art,title,text,why);for(const [label,guided]of [['같이 해보기',true],['혼자 해볼게',false]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>begin(guided);card.append(b);}const note=document.createElement('p');note.className='start-note';note.textContent='같이 해보기: 점수 차감 없는 조작 안내부터 시작해요. 두 방법의 학습 내용과 채점은 같아요.';card.append(note);$('scene').append(card);};
$('leave').onclick=()=>{mission?.destroy();host.save();host.leave();};
window.startPostalLesson();


