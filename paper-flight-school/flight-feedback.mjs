import {clamp} from './physics.mjs?v=20261120-quality6';
import {designChanges} from './controls.mjs?v=20261120-quality6';
import {sameConditions} from './gameplay.mjs?v=20261120-quality6';
export function changedInputs(current,previous){
 if(!previous)return [];
 const names=designChanges(previous.design,current.design);
 if(previous.launch.pitch!==current.launch.pitch)names.push('위아래 각도');
 if(previous.launch.yaw!==current.launch.yaw)names.push('좌우 방향');
 if(previous.launch.power!==current.launch.power)names.push('던진 힘');
 return names;
}
function proposedExperiment(f,event){
 const stalled=f.duration>0&&f.stallTime/f.duration>.25,high=f.launch.pitch>15;
 const observation=stalled?'날개가 공기를 크게 맞받은 구간이 길었어요.':'이번 비행은 '+f.duration.toFixed(2)+'초 동안 '+f.distance.toFixed(2)+' m를 날았어요.';
 if((stalled||high)&&f.launch.pitch>-5){const value=Math.max(-5,f.launch.pitch-5);return {kind:'pitch',value,observation,reason:'각도만 조금 낮춰, 비행 모습을 비교해요.',label:'각도 '+f.launch.pitch+'° → '+value+'°로 준비'};}
 if(f.launch.power<65){const value=Math.min(100,f.launch.power+15);return {kind:'power',value,observation,reason:'모양과 각도는 그대로 두고, 힘만 조금 더 줘 봐요.',label:'힘 '+value+'%에 비교 표시 놓기'};}
 if(event==='airtime'&&f.design.fold>1.5){const value=Math.max(1.5,f.design.fold-.5);return {kind:'fold',value,observation,reason:'접는 길이를 줄여 날개를 넓히면 어떻게 될까요?',label:'접는 길이 '+f.design.fold+' → '+value+' cm · 날개 넓히기'};}
 const value=clamp(f.launch.pitch+(event==='distance'&&f.launch.pitch>5?-5:5),-5,40);
 return {kind:'pitch',value,observation,reason:'각도 한 곳만 바꾸고, 지난번 힘에 맞춰 비교해요.',label:'각도 '+f.launch.pitch+'° → '+value+'°로 준비'};
}
export function comparisonSummary(f,previous){
 if(!previous)return '첫 기록이에요. 다음에는 한 가지만 바꿔 비교해요.';
 if(!sameConditions(f,previous))return '바람 조건이 달라 지난 비행과 직접 비교하기 어려워요.';
 const names=changedInputs(f,previous);
 if(!names.length)return '모양·각도·힘·바람이 같아요. 같은 조건의 비행이에요.';
 if(names.length===1)return names[0]+'만 달라졌어요. 비행 모습을 비교해요.';
 return names.join(' · ')+'이 함께 달라졌어요. 어느 변화의 효과인지는 따로 확인해요.';
}
export function nextExperiment(f,event,previous=null){
 const next=proposedExperiment(f,event);
 // Avoid a two-flight angle loop without claiming that a heuristic is an optimum.
 if(previous&&sameConditions(f,previous)&&next.kind==='pitch'&&next.value===previous.launch.pitch&&changedInputs(f,previous).length===1){
  const value=f.design.fold>1.5?f.design.fold-.5:f.design.fold+.5;
  return {kind:'fold',value,observation:next.observation,reason:'이번에는 날개 폭 한 곳을 바꿔 비교해요. 힘은 지난번에 맞춰요.',label:'접는 길이 '+f.design.fold+' → '+value+' cm로 준비'};
 }
 return next;
}
export function flightProfile(f,previous,event){
 const x=p=>event==='airtime'?p.t:Math.hypot(p.s[0],p.s[2]),all=[f,...(previous?[previous]:[])],maxX=Math.max(.5,...all.flatMap(a=>a.path.map(x))),maxY=Math.max(1.5,...all.flatMap(a=>a.path.map(p=>p.s[1])));
 const coords=p=>[30+x(p)/maxX*248,104-Math.max(0,p.s[1])/maxY*76];
 const points=a=>a.path.filter((_,i)=>i%3===0||i===a.path.length-1).map(p=>coords(p).map(v=>v.toFixed(2)).join(',')).join(' ');
 const [lx,ly]=coords(f.path.at(-1));
 return '<figure class="flight-profile"><figcaption>내 비행 살펴보기'+(previous?' · 점선은 지난번':'')+'</figcaption><svg viewBox="0 0 296 138" role="img" aria-label="실제 계산한 비행기 중심 높이 그래프. 가로축은 '+(event==='airtime'?'시간':'출발점으로부터 수평거리')+'"><path d="M30 22V104H280" fill="none" stroke="#829886"/><path d="M30 66H280" stroke="#cad8c7" stroke-dasharray="3 5"/><text x="0" y="20">'+maxY.toFixed(1)+'m</text><text x="24" y="123">0</text><text x="278" y="123" text-anchor="end">'+maxX.toFixed(1)+(event==='airtime'?'초':'m')+'</text>'+(previous?'<polyline points="'+points(previous)+'" fill="none" stroke="#896b37" stroke-width="2" stroke-dasharray="4 5"/>':'')+'<polyline points="'+points(f)+'" fill="none" stroke="#087e9b" stroke-width="3" stroke-linejoin="round"/><circle cx="'+lx+'" cy="'+ly+'" r="4" fill="#087e9b"/></svg></figure>';
}
