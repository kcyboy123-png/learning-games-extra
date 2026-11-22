import {flickVector,toyRoll,toyFrame} from './fetch.mjs?v=opening-20261122';
import {scentSpot} from './hunt.mjs?v=play-direct-20261120';
export function playGuide(a,species,x,reduced=false){
 if(!a||!['fetch','hunt'].includes(a.kind))return null;
 let step=0,title='',target=null;
 const toy=a.toy==='bone'?'뼈 인형':'공';
 const steps=a.kind==='fetch'?[toy+' 밀기','기다리기',toy+' 받기']:species==='cat'?['깃털 끌기','멈추기','잡았다!']:['주머니 문지르기','냄새 맡기','찾았다!'];
 if(a.kind==='fetch'){
  if(a.phase==='ready'){
   title=a.drag?(reduced?'손을 떼면 장난감이 바닥에 놓여요':'점선으로 굴러갈 길이 보여요. 손을 놓으세요'):a.round?'다시 '+toy+'을 잡고 밀어 보세요':toy+'을 잡고 원하는 방향으로 밀어 보세요';
   target='toy';
  }
  else if(a.phase==='drop'){step=2;title=toy+'이 바닥에 떨어져요';}
  else if(a.phase==='offer'){step=2;title=species==='dog'?'물고 있는 '+toy+'을 눌러 바닥에 내려놓아요':'바닥에 놓인 '+toy+'을 눌러 받아 주세요';target='toy';}
  else if(a.phase==='thanks'){step=2;title='받았어요! 다음 차례를 준비해요';}
  else{step=1;title=toy+'을 가져오는 중이에요';}
 }else if(a.phase==='found'){step=2;title=species==='cat'?'잡았어요! 다음 깃털을 기다려요':'찾았어요! 다음 주머니를 기다려요';}
 else if(species==='cat'){
  if(a.phase==='crouch'){step=1;title='잡으러 가요! 그대로 기다려 주세요';}
  else if(a.distance>=.06){step=1;title='원이 찼어요! 손을 떼면 잡아요';target='toy';}
  else{title='깃털을 좌우로 움직여 원을 채워요';target='toy';}
 }else{
  target='spots';
  const amount=a.rubs?.[scentSpot(a.cursor)]||0;
  if(!a.guided)title='주머니를 좌우로 문질러 원을 채워요';
  else if(amount<1)title='문지른 만큼 원이 차요. 조금 더!';
  else if(a.warm<.84)title='빈 주머니예요. 다른 주머니를 문질러요';
  else{step=1;title='냄새가 나요! 돼지가 장난감을 꺼내요';}

 }
 if((a.phase==='thanks'&&a.round===3)||(a.phase==='found'&&a.round===2))title='세 번 성공! 이제 쓰다듬거나 함께 쉬어요';
 return {title,steps,step,target,round:Math.min(3,(a.round||0)+(a.phase==='thanks'?0:1))};
}

export function drawPlayGuide(room){
 const g=room.playGuide;if(!g)return;const c=room.ctx;
 c.save();c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';
 if(g.target==='toy'&&room.toyPoint){
  const p=room.toyPoint,a=room.playAction;
  const guidingDrag=a?.kind==='fetch'&&a.drag;
  const markerY=a?.kind==='fetch'?p.grabY:p.y;
  if(!guidingDrag){c.beginPath();c.arc(p.x,markerY,30,0,Math.PI*2);c.strokeStyle='#274d3d';c.lineWidth=7;c.stroke();c.strokeStyle='#ffdf80';c.lineWidth=3;c.stroke();}
  const amount=a?.kind==='hunt'&&room.species==='cat'?Math.min(1,(a?.distance||0)/.06):a?.drag?Math.min(1,a.drag.travel/Math.max(60,room.w*.18)):0;
  if(amount&&!guidingDrag){c.beginPath();c.arc(p.x,p.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*amount);c.strokeStyle='#f9bb45';c.lineWidth=7;c.stroke();}
  if(guidingDrag){
   const now=performance.now(),v=flickVector(a.drag,now);
   const r=toyRoll({x:room.toyX,y:room.toyDragY??0,vx:v.x,vy:v.y,w:room.w,depth:Math.min(108,room.h*.13),at:now,toy:a.toy});
   if(Math.hypot((r.to-r.from)*room.w,r.y1-r.y0)>8){
    c.beginPath();c.moveTo(p.x,p.y);
    let end;
    for(let i=0;i<=8;i++){end=toyFrame(r,r.at+r.duration*i/8);c.lineTo(end.x*room.w,room.ground+7+end.y-end.hop);}
    c.setLineDash([6,6]);c.strokeStyle='#284738';c.lineWidth=7;c.stroke();c.lineWidth=3;c.strokeStyle='#ffeaa0';c.stroke();c.setLineDash([]);
    c.beginPath();c.arc(end.x*room.w,room.ground+7+end.y,6,0,Math.PI*2);c.fillStyle='#ffeaa0';c.fill();
   }
  }
  c.fillStyle='#274d3d';c.fillRect(p.x-40,markerY-67,80,25);c.fillStyle='#fff8dc';c.fillText(a?.phase==='offer'?(room.species==='dog'?'눌러 놓아요':'눌러 받아요'):a?.kind==='fetch'&&a.drag||amount>=1?'손을 떼요':'잡고 밀어요',p.x,markerY-54);
 }else if(g.target==='spots'){
  for(const [i,n] of [.28,.5,.72].entries()){
   const x=room.w*n,y=room.ground-12,selected=Math.abs((room.hunt?.cursor??-1)-n)<.06&&room.hunt?.guided;
   c.beginPath();c.arc(x,y,23,0,Math.PI*2);c.fillStyle=selected?'#f3cc65':'#fff8e8';c.fill();c.strokeStyle='#315744';c.lineWidth=3;c.stroke();c.fillStyle='#284836';
   const a=room.hunt,amount=a?.rubs?.[i]||0,empty=amount>=1&&Math.abs(n-a.goal)>.04;
   c.fillText(empty?'×':String(i+1),x,y);
   if(amount){c.beginPath();c.arc(x,y,27,-Math.PI/2,-Math.PI/2+Math.PI*2*amount);c.strokeStyle=empty?'#8c9488':'#edb73f';c.lineWidth=6;c.stroke();}
   c.font='bold 12px sans-serif';c.fillStyle='#274d3d';c.fillRect(x-34,y-58,68,22);c.fillStyle='#fff8dc';c.fillText(empty?'비었어요':amount>=1?'찾았다!':'↔ 문질러요',x,y-47);c.font='bold 15px sans-serif';
  }
 }
 c.restore();
}
