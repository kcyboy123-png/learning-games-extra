// Pure course helpers shared by the app and node:test. No DOM, no three.js.
import {sections,sectionAt,sectionIndex,LENGTH,SPEED,elevation,stops,SUMMIT} from '../trail.mjs';
import {ANIMALS} from './life.mjs';
const experiences=[...stops,...ANIMALS.filter(a=>!stops.some(p=>p.s===a.s)).map(a=>({...a,name:a.label}))].sort((a,b)=>a.s-b.s);
export function nextExperience(s){const p=experiences.find(p=>s<p.s+p.r);return p?(Math.abs(s-p.s)<p.r?'여기서 · ':'다음 · ')+p.name+(Math.abs(s-p.s)<p.r?'':' '+Math.ceil(p.s-s)+' m'):'정상에 도착했어요';}
// Where the solo teacher character waits for the child; the guide stays ahead until the summit.
export const guideSpots=[
  {s:36,offset:-2.2,activity:'look',yaw:Math.PI*.72},
  {s:120,offset:-2.3,activity:'look',yaw:Math.PI*.72},
  {s:224,offset:-2.2,activity:'look',yaw:Math.PI*.72},
  {s:258,offset:-2.6,activity:'guide',yaw:Math.PI*.72},
  {s:368,offset:-2.15,activity:'guide',yaw:Math.PI*.72},
  {s:468,offset:-2.4,activity:'observe',yaw:Math.PI*.72},
  {s:584,offset:-2.5,activity:'look',yaw:Math.PI*.72},
  {s:708,offset:-2.75,activity:'guide',yaw:Math.PI*.72}
];
export function guideSpot(s){return guideSpots.find(g=>g.s>s+4)||guideSpots.at(-1);}
export function distanceText(s){return '정상까지 '+Math.max(0,Math.round(LENGTH-s))+' m';}
export function heightText(s){return '↑ '+Math.max(0,Math.round(elevation(s)-elevation(0)))+' m 올라왔어요';}
export const finishedAt=s=>s>=SUMMIT.platform-2;
// Median position of the other walkers; a child far behind may choose to walk to them.
export function groupTarget(peers,self,{threshold=25,gather=null}={}){
  if(gather&&Number.isFinite(gather.s))return {s:gather.s,count:peers.length,reason:'gather',behind:gather.s-self.s};
  const ahead=peers.map(p=>p.y).filter(Number.isFinite).sort((a,b)=>a-b);
  if(!ahead.length)return null;
  const median=ahead[Math.floor(ahead.length/2)];
  const behind=median-self.s;
  if(behind<threshold)return null;
  return {s:median,count:ahead.length,reason:'friends',behind};
}
// Automatic walking toward a target: forward only, stops a few metres short, never teleports.
export function autoWalkInput(self,target,stopWithin=4){
  if(!target||!Number.isFinite(target.s))return null;
  const remaining=target.s-self.s;
  if(remaining<=stopWithin)return null;
  return {x:0,y:1};
}
// Recommended timetable: each section is its straight walk (length / SPEED) plus the `rest` seconds the trail data
// recommends for looking, choosing and resting there. The sum follows the current walking speed. It is guidance for the
// teacher panel only; the child walks at their own pace and nothing counts down.
export const clock=seconds=>{const r=Math.max(0,Math.round(seconds));return Math.floor(r/60)+':'+String(r%60).padStart(2,'0');};
export function buildSchedule(list=sections,speed=SPEED){
  let t=0;return list.map(z=>{const walkSeconds=(z.to-z.from)/speed,restSeconds=Math.max(0,Number(z.rest)||0),startSeconds=t;t+=walkSeconds+restSeconds;
    return {id:z.id,name:z.name,walkSeconds,restSeconds,startSeconds,endSeconds:t,span:clock(startSeconds)+'~'+clock(t)};});
}
export const schedule=buildSchedule();
export const plannedSeconds=()=>schedule.at(-1).endSeconds;
export const restSeconds=()=>schedule.reduce((sum,row)=>sum+row.restSeconds,0);
export const sectionSpan=index=>schedule[index]?.span||'';
export const paceText=index=>{const row=schedule[index];return row?'걷기 '+clock(row.walkSeconds)+' · 머물기 '+clock(row.restSeconds):'';};
export const planText=()=>'걷기 약 '+Math.round(LENGTH/SPEED/60)+'분과 살펴보기·쉬기 약 '+Math.round(restSeconds()/60)+'분, 모두 약 '+Math.round(plannedSeconds()/60)+'분 권장 흐름이에요. 실제 시간은 아이마다 달라요.';
// Solo stay line for each stop card: what is actually worth looking at there, plus the section's recommended stay
// (sections[].rest, rounded to 5 s) as an optional suggestion. Guidance only: nothing counts down, locks or advances.
const stayLooks={30:'친구 곁에서 숲 입구의 큰 나무와 햇빛을 올려다봐요',115:'새가 앉은 가지와 흔들리는 잎을 바라봐요',210:'잎이 굽이 너머로 사라질 때까지 시냇물을 따라가 봐요',
  362:'앉아서 물소리를 듣고, 저 위 폭포의 물보라와 무지개를 바라봐요',475:'수풀과 나무 사이가 어떻게 움직이는지 지켜봐요',578:'계곡 쪽과 정상 쪽, 보고 싶은 방향을 골라 바라봐요',712:'발아래 숲을 바라보고, 선생님·친구들과 사진도 찍어요'};
export const stayClock=seconds=>{const r=Math.max(0,Math.round(seconds/5)*5),m=Math.floor(r/60),s=r%60;return m?m+'분'+(s?' '+s+'초':''):s+'초';};
export const restAt=s=>Math.max(0,Number(sectionAt(s).rest)||0);
export const stayText=spot=>{const look=stayLooks[spot];return look?look+'. 약 '+stayClock(restAt(spot))+' 쉬어 가도 좋아요 · 골라도, 그냥 바라봐도 좋아요.':'';};
export function sectionText(index){const z=sections[index];return z?`${sectionSpan(index)} ${z.name}: ${z.guide}`:'';}
export function gatherText(index,role='teacher'){const z=sections[index];return z?(role==='teacher'?'선생님: ':'')+z.name+'에 잠시 모여요.':'';}
// Follow button / arrival wording. 'gather' walks to the meeting place the teacher named (not to the teacher's own position),
// so it never says "to the teacher"; 'friends' walks to where the classmates actually are.
export const followLabel=reason=>reason==='gather'?'모이는 곳으로 가기':'친구들 곁으로 가기';
export const followStartText=reason=>(reason==='gather'?'모이는 곳으로 걸어가요.':'친구들이 있는 곳으로 걸어가요.')+' 아무 방향키나 누르면 멈춰요.';
export const arrivedText=reason=>reason==='gather'?'모이는 곳에 왔어요.':'친구들 곁에 왔어요.';
// HUD line: the teacher counts students; a student counts everyone walking with them (classmates and the teacher).
export const companionText=(role,code,online)=>'방 '+code+(role==='teacher'?' · 학생 ':' · 함께 ')+Math.max(0,online|0)+'명';
export const startText=lookName=>'내 모습은 '+lookName+'. 위쪽 방향키를 눌러 걸어 볼까요?';
export function gatherSpot(index){const z=sections[index];if(!z)return null;const stop=stops.find(p=>p.s>=z.from&&p.s<z.to);return {s:stop?stop.s:(z.from+z.to)/2,name:z.name};}
export {sections,sectionAt,sectionIndex,LENGTH,SPEED};
export const straightWalkMinutes=()=>LENGTH/SPEED/60;
