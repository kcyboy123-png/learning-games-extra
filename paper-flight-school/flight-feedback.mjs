import {clamp} from './physics.mjs';
import {designChanges} from './controls.mjs';
export function changedInputs(current,previous){
 if(!previous)return [];
 const names=designChanges(previous.design,current.design);
 if(previous.launch.pitch!==current.launch.pitch)names.push('위아래 각도');
 if(previous.launch.yaw!==current.launch.yaw)names.push('좌우 방향');
 if(previous.launch.power!==current.launch.power)names.push('던진 힘');
 return names;
}
export function nextExperiment(f,event){
 const lower=f.stallTime/f.duration>.25||(event==='distance'&&f.launch.pitch>15)||f.launch.pitch>=35;
 const pitch=clamp(f.launch.pitch+(lower?-5:5),-5,40);
 return {pitch:pitch===f.launch.pitch?clamp(pitch+5,-5,40):pitch,observation:f.stallTime/f.duration>.25?'비행 중 날개가 공기를 크게 맞받은 구간이 있었어요.':'최고 '+f.maxHeight.toFixed(2)+' m 높이까지 올라갔어요.'};
}
export function flightProfile(f,previous,event){
 const x=p=>event==='airtime'?p.t:Math.hypot(p.s[0],p.s[2]),all=[f,...(previous?[previous]:[])],maxX=Math.max(.5,...all.flatMap(a=>a.path.map(x))),maxY=Math.max(1.5,...all.flatMap(a=>a.path.map(p=>p.s[1])));
 const coords=p=>[30+x(p)/maxX*248,104-Math.max(0,p.s[1])/maxY*76];
 const points=a=>a.path.filter((_,i)=>i%3===0||i===a.path.length-1).map(p=>coords(p).map(v=>v.toFixed(2)).join(',')).join(' ');
 const [lx,ly]=coords(f.path.at(-1));
 return '<figure class="flight-profile"><figcaption>내 비행 살펴보기'+(previous?' · 점선은 지난번':'')+'</figcaption><svg viewBox="0 0 296 138" role="img" aria-label="실제 계산한 비행기 중심 높이 그래프. 가로축은 '+(event==='airtime'?'시간':'출발점으로부터 수평거리')+'"><path d="M30 22V104H280" fill="none" stroke="#829886"/><path d="M30 66H280" stroke="#cad8c7" stroke-dasharray="3 5"/><text x="0" y="20">'+maxY.toFixed(1)+'m</text><text x="24" y="123">0</text><text x="278" y="123" text-anchor="end">'+maxX.toFixed(1)+(event==='airtime'?'초':'m')+'</text>'+(previous?'<polyline points="'+points(previous)+'" fill="none" stroke="#896b37" stroke-width="2" stroke-dasharray="4 5"/>':'')+'<polyline points="'+points(f)+'" fill="none" stroke="#087e9b" stroke-width="3" stroke-linejoin="round"/><circle cx="'+lx+'" cy="'+ly+'" r="4" fill="#087e9b"/></svg></figure>';
}
