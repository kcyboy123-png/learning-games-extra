// Contact follows the pointer immediately; the animal keeps its own slower response.
export const CONTACT_RESPONSE={dog:{hold:180,angle:.7,shift:.6},cat:{hold:220,angle:.55,shift:.45},pig:{hold:260,angle:.4,shift:.35}};
export function startContactFeedback(room,s){
 room.contactFeedback={started:s.started,part:s.part,noticed:s.started,points:[],x:s.x,y:s.y,originX:s.x,originY:s.y,at:s.started,released:null};
 room.inputPending=true;
}
function trackGesture(f,x,y,t){
 f.originX??=x;f.originY??=y;
 if(Math.hypot(x-f.originX,y-f.originY)>=10)f.dragging=true;
 const dx=x-(f.arrowX??f.originX),dy=y-(f.arrowY??f.originY),distance=Math.hypot(dx,dy);
 if(distance>2){const dt=t-(f.movedAt??f.started??f.at),target=Math.atan2(dy,dx);
  if(f.direction==null||dt>220)f.direction=target;
  else f.direction+=Math.atan2(Math.sin(target-f.direction),Math.cos(target-f.direction))*(1-Math.exp(-Math.max(8,dt)/24));
  f.strength=Math.min(1,distance/Math.max(8,dt)/.7);f.movedAt=t;f.arrowX=x;f.arrowY=y;
 }
}
function drawGestureArrow(room,f,alpha,t){
 if(!f.dragging||f.direction==null)return;
 const c=room.ctx,a=f.direction,power=room.reduced?0:(f.strength||0)*Math.exp(-Math.max(0,t-f.movedAt)/130);
 const release=room.reduced?0:1-alpha,reach=35+power*9+release*10,size=12+power*5,px=f.x+Math.cos(a)*reach,py=f.y+Math.sin(a)*reach;
 c.globalAlpha=alpha;c.beginPath();c.moveTo(f.x+Math.cos(a)*24,f.y+Math.sin(a)*24);c.lineTo(px,py);
 c.moveTo(px-Math.cos(a-.65)*size,py-Math.sin(a-.65)*size);c.lineTo(px,py);c.lineTo(px-Math.cos(a+.65)*size,py-Math.sin(a+.65)*size);
 c.strokeStyle='#244e40';c.lineWidth=9;c.stroke();c.strokeStyle='#fff4ce';c.lineWidth=4;c.stroke();
}
function drawPlayGrip(room,f,alpha,t,color){
 const c=room.ctx;
 if(room.species==='pig')return;
 const p=room.toyPoint;
 if(f.released==null&&p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){f.gripX=p.x;f.gripY=p.y;}
 if(f.gripX==null)return;
 c.globalAlpha=alpha*.85;const dx=f.gripX-f.x,dy=f.gripY-f.y,d=Math.hypot(dx,dy);
 // Show the actual held toy, not a second toy or a predicted landing point.
 if(d>12&&d<180){c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.gripX,f.gripY);c.strokeStyle='#244e40';c.lineWidth=4;c.stroke();c.strokeStyle=color;c.lineWidth=2;c.stroke();}
 const r=room.reduced?16:16+3*Math.exp(-(t-f.at)/100)+(f.released==null?0:(1-alpha)*7);
 c.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2+.18;c.moveTo(f.gripX+Math.cos(a)*r,f.gripY+Math.sin(a)*r);c.arc(f.gripX,f.gripY,r,a,a+.85);}
 c.strokeStyle='#244e40';c.lineWidth=6;c.stroke();c.strokeStyle=color;c.lineWidth=3;c.stroke();
}
export function drawContactFeedback(room,t){
 const s=room.stroke??room.brushStroke,c=room.ctx;
 let f=room.contactFeedback;
 if(s&&s.inside!==false&&room.point){
  if(!f||f.started!==s.started)f=room.contactFeedback={started:s.started,points:[],x:s.x,y:s.y,at:t};
  if(f.part!==s.part){f.part=s.part;f.noticed=t;f.points.length=0;}
  f.released=null;f.at=t;f.x=s.x;f.y=s.y;
  trackGesture(f,s.x,s.y,t);
  const last=f.points.at(-1);
  if(last&&t-last.at>230)f.points.length=0;
  if(!f.points.length||Math.hypot(s.x-last.x,s.y-last.y)>3){f.points.push({x:s.x,y:s.y,at:t});if(f.points.length>18)f.points.shift();}
 }else if(f){
  if(s||!(room.brushAfter!=null&&t-room.brushAfter<420)&&(!room.affection||!['touch','affection','contactEnd'].includes(room.motionKind))){room.contactFeedback=null;return;}
  f.released??=t;
  if(t-f.released>=420){room.contactFeedback=null;return;}
 }
 if(!f)return;
 const release=f.released==null?0:(t-f.released)/420,age=t-(f.noticed??f.started),alpha=1-release;
 c.save();c.lineCap='round';c.lineJoin='round';
 if(!room.reduced)for(let i=1;i<f.points.length;i++){const a=f.points[i-1],b=f.points[i],fade=Math.max(0,1-(t-b.at)/230)*alpha;if(!fade)continue;c.globalAlpha=fade;c.strokeStyle='#375744';c.lineWidth=11;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle={head:'#ffe494',chin:'#ffd0c2',back:'#b9efdb'}[f.part]||'#ffe494';c.lineWidth=6;c.stroke();}
 const radius=room.reduced?22:22+12*Math.exp(-age/120)+release*18;
 const glide=!room.reduced&&f.dragging&&f.released==null?(f.strength||0)*Math.exp(-Math.max(0,t-f.movedAt)/130):0;
 c.globalAlpha=alpha;c.fillStyle='#fff2c44d';c.strokeStyle='#6c4a32';c.lineWidth=4;c.beginPath();c.ellipse(f.x,f.y,radius+glide*5,radius-glide*3,f.direction||0,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#fff5d6';c.lineWidth=2;c.stroke();
 c.fillStyle='#fff8df';c.beginPath();c.arc(f.x,f.y,4,0,Math.PI*2);c.fill();
 if(!room.reduced&&age<360){c.globalAlpha=alpha*(1-age/360);c.beginPath();c.arc(f.x,f.y,30+age*.09,0,Math.PI*2);c.strokeStyle='#3f5948';c.lineWidth=6;c.stroke();c.strokeStyle='#fff6ce';c.lineWidth=3;c.stroke();}
 if(!room.reduced&&age<180&&f.released==null){c.globalAlpha=1-age/180;c.strokeStyle='#fff5d6';c.lineWidth=3;for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;c.beginPath();c.moveTo(f.x+Math.cos(a)*(radius+4),f.y+Math.sin(a)*(radius+4));c.lineTo(f.x+Math.cos(a)*(radius+11),f.y+Math.sin(a)*(radius+11));c.stroke();}}
 drawGestureArrow(room,f,alpha,t);c.restore();
}

export function playFeedback(room,event,phase,t){
 let f=room.playFeedback;
 if(phase==='cancel'){if(!event||!f||f.id===event.pointerId){room.playFeedback=null;room.inputPending=true;}return;}
 if(phase==='start')f=room.playFeedback={id:event.pointerId,at:t,x:event.clientX,y:event.clientY,originX:event.clientX,originY:event.clientY,points:[],released:null};
 if(!f||f.id!==event.pointerId||f.released!=null)return;
 trackGesture(f,event.clientX,event.clientY,t);f.x=event.clientX;f.y=event.clientY;
 room.inputPending=true;
 if(phase==='release'){f.released=t;return;}
 const last=f.points.at(-1);
 // A stalled pointer stream must not draw a long connecting slash on resumption.
 if(last&&t-last.at>220)f.points.length=0;
 if(!f.points.length||Math.hypot(last.x-f.x,last.y-f.y)>3){f.points.push({x:f.x,y:f.y,at:t});if(f.points.length>12)f.points.shift();}
 room.inputPending=true;
}
export function drawPlayFeedback(room,t){
 const f=room.playFeedback;if(!f)return;
 const age=t-f.at,release=f.released==null?0:(t-f.released)/360;
 if(release>=1){room.playFeedback=null;return;}
 const c=room.ctx;c.save();c.globalAlpha=1-release;c.lineCap='round';
 const color=room.species==='dog'?'#ffe28c':room.species==='cat'?'#e4edff':'#d9edb0';
 if(!room.reduced)for(let i=1;i<f.points.length;i++){const a=f.points[i-1],b=f.points[i],fade=Math.max(0,1-(t-b.at)/220);if(!fade)continue;c.globalAlpha=(1-release)*fade;c.strokeStyle='#304b3e';c.lineWidth=11;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.strokeStyle=color;c.lineWidth=6;c.stroke();}
 c.globalAlpha=1-release;const r=room.reduced?23:23+12*Math.exp(-age/120)+release*20;
 c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.strokeStyle='#4f4035';c.lineWidth=5;c.stroke();c.strokeStyle=color;c.lineWidth=3;c.stroke();
 c.fillStyle=color;c.beginPath();c.arc(f.x,f.y,4,0,Math.PI*2);c.fill();
 if(!room.reduced&&age<360){c.globalAlpha=(1-release)*(1-age/360);c.beginPath();c.arc(f.x,f.y,31+age*.09,0,Math.PI*2);c.strokeStyle='#304b3e';c.lineWidth=6;c.stroke();c.strokeStyle=color;c.lineWidth=3;c.stroke();}
 if(room.playAction?.kind!=='fetch'||f.released!=null)drawPlayGrip(room,f,1-release,t,color);drawGestureArrow(room,f,1-release,t);c.restore();
}
