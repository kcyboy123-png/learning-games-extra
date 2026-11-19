import {cleanEnv} from './physics-v1.mjs';
export const TARGET_RADIUS=1;
export const MISSIONS=[
  {id:'near',name:'첫 착륙',target:7,description:'7 m 앞 파란 과녁 안에 내려요.'},
  {id:'far',name:'조금 더 멀리',target:10,description:'10 m 앞 과녁을 향해 힘과 각도를 바꿔요.'},
  {id:'fold',name:'접기로 바꾸기',target:7,description:'균형형에서 날개나 클립을 바꾸고, 힘을 맞춰 7 m 과녁에 내려요.'}
];
export const missionById=id=>MISSIONS.find(m=>m.id===id)??null;
export function cleanMissions(raw){return {id:missionById(raw?.id)?.id??null,completed:MISSIONS.filter(m=>Array.isArray(raw?.completed)&&raw.completed.includes(m.id)).map(m=>m.id)};}
export const missionEnv=m=>cleanEnv({target:m.target});
export function sameConditions(a,b){return !!a&&!!b&&a.launch.method===b.launch.method&&JSON.stringify(cleanEnv(a.env))===JSON.stringify(cleanEnv(b.env));}
export function landingError(f){return {side:f.landing[0],depth:f.landing[2]-f.env.target};}
export function landedInside(f){return f.reason==='landed'&&f.targetDistance<=TARGET_RADIUS;}
export const distanceLabel=d=>d.toFixed(d>TARGET_RADIUS&&d<TARGET_RADIUS+.005?3:2);
export function landingWords(f){const {side,depth}=landingError(f);return `${Math.abs(depth)<.005?'앞뒤는 과녁 중심과 나란해요':`과녁보다 ${Math.abs(depth).toFixed(2)} m ${depth<0?'못 미쳤어요':'넘어갔어요'}`}. ${Math.abs(side)<.005?'좌우는 가운데예요':`${side<0?'왼쪽':'오른쪽'}으로 ${Math.abs(side).toFixed(2)} m 벗어났어요`}.`;}
export function landingMap(f,previous){
  const current=landingError(f),prior=previous?landingError(previous):null;
  const extent=Math.max(2,Math.abs(current.side),Math.abs(current.depth),...(prior?[Math.abs(prior.side),Math.abs(prior.depth)]:[]))*1.15,scale=66/extent;
  const dot=(p,old)=>`<circle cx="${140+p.side*scale}" cy="${86-p.depth*scale}" r="${old?5:6}" fill="${old?'#c4ae8b':'#263f4c'}" stroke="#fffdf7" stroke-width="2" ${old?'stroke-dasharray="2 2"':''}/>`;
  return `<figure class="landing-map"><svg viewBox="0 0 280 176" role="img" aria-label="위에서 본 착륙 위치. 위쪽은 과녁 너머, 아래쪽은 출발 쪽. ${landingWords(f)}"><path d="M18 86H262M140 20V152" stroke="#d9ddd4" stroke-dasharray="3 5"/><circle cx="140" cy="86" r="${TARGET_RADIUS*scale}" fill="#d8edf6" stroke="#3695bc"/><path d="M135 86H145M140 81V91" stroke="#3695bc"/>${prior?dot(prior,true):''}${dot(current,false)}<g fill="#697569" font-size="11" text-anchor="middle"><text x="140" y="13">과녁 너머 ↑</text><text x="140" y="171">↓ 출발 쪽</text><text x="25" y="79">왼쪽</text><text x="254" y="79">오른쪽</text></g></svg><figcaption>위에서 보기 · <b>● 이번</b>${prior?' · <span>● 지난번</span>':''} · 원 반지름 1 m</figcaption></figure>`;
}
export function distanceChange(f,previous){if(!sameConditions(f,previous))return '';const cm=Math.round(previous.targetDistance*100)-Math.round(f.targetDistance*100);return cm===0?'지난번과 같은 거리예요.':`지난번보다 ${(Math.abs(cm)/100).toFixed(2)} m ${cm>0?'가까워졌어요!':'멀어졌어요.'}`;}
export function matchProgress(m){
  const n=m.records.length,paired=n-n%2,sums=[0,0];for(const r of m.records.slice(0,paired))sums[r.player]+=r.cm;
  const last=n%2?m.records.at(-1):null;
  let final=null;
  if(n===5&&!m.pending){const p=1,other=m.records.filter(r=>r.player!==p).reduce((s,r)=>s+r.cm,0),own=m.records.filter(r=>r.player===p).reduce((s,r)=>s+r.cm,0);final={tie:other-own,win:other-own-1,opponent:m.records.at(-1).cm};}
  return {rounds:paired/2,sums,last,final};
}
export function finalTargetText(f){if(!f)return '';if(f.tie<0)return `합계 승부는 정해졌어요. 이번에는 상대의 ${f.opponent} cm보다 가까이 도전해요.`;if(f.tie===0)return '기록이 0 cm이면 비겨요. 과녁 중심에 도전해요!';return `이번 기록 ${f.win} cm 이하이면 이겨요. ${f.tie} cm이면 비겨요.`;}
