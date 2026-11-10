import {ANIMALS,LITTER} from './life.mjs';

export function animalTrailHint(animal,life,s){
  const gap=(life.encounters?.[animal.id]??animal.s)-s;
  if(Math.abs(gap)<animal.r)return '바로 이 근처예요. 정상 쪽을 바라보면 '+(animal.offset<0?'왼쪽':'오른쪽')+' 숲을 천천히 살펴봐요.';
  return (gap>0?'앞으로':'걸어온 길로 돌아가서')+' 약 '+Math.max(10,Math.round(Math.abs(gap)/10)*10)+' m · '+animal.where+' 주변을 살펴봐요.';
}

// One invitation per discovery per walk; callers wait for an empty message slot.
export function screenDirection(dx,dz,rightX,rightZ){
  const right=dx*rightX+dz*rightZ,forward=dx*rightZ-dz*rightX;
  if(forward<0&&Math.abs(forward)>Math.abs(right))return '뒤쪽';
  return Math.abs(right)<.4?'앞쪽':right<0?'왼쪽':'오른쪽';
}

export function nearbyJournal(life,s){
  return ANIMALS.map(a=>({...a,seen:life.journal.includes(a.id)})).sort((a,b)=>Number(a.seen)-Number(b.seen)||Math.abs((life.encounters?.[a.id]??a.s)-s)-Math.abs((life.encounters?.[b.id]??b.s)-s));
}

export function nextDiscoveryHint(life,pos,shown,direction=a=>a.offset<0?'왼쪽':'오른쪽'){
  const animal=ANIMALS.find(a=>!life.journal.includes(a.id)&&!shown.has('animal:'+a.id)&&Math.abs((life.encounters?.[a.id]??a.s)-pos.s)<a.r);
  if(animal)return {key:'animal:'+animal.id,text:direction({...animal,s:life.encounters?.[animal.id]??animal.s})+' 숲에서 작은 움직임이 보여요. 멈춰서 살펴볼까요?'};
  const litter=LITTER.find(l=>life.litter.left.includes(l.id)&&!shown.has('litter:'+l.id)&&Math.abs(l.s-pos.s)<5);
  return litter?{key:'litter:'+litter.id,text:'길 '+direction(litter)+'에 '+litter.name+'이 있어요. 가까이 가서 주워 볼까요?'}:null;
}
