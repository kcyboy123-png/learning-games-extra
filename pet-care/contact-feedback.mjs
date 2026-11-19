// Contact follows the pointer immediately; the animal keeps its own slower response.
export const CONTACT_RESPONSE={dog:{hold:180,angle:.7,shift:.6},cat:{hold:220,angle:.55,shift:.45},pig:{hold:260,angle:.4,shift:.35}};
export function drawContactFeedback(room,t){
 const s=room.stroke,c=room.ctx;
 let f=room.contactFeedback;
 if(s&&s.inside!==false&&room.point){
  if(!f||f.started!==s.started)f=room.contactFeedback={started:s.started,points:[],x:s.x,y:s.y,at:t};
  if(f.part!==s.part){f.part=s.part;f.noticed=t;f.points.length=0;}
  f.released=null;f.at=t;f.x=s.x;f.y=s.y;
  const last=f.points.at(-1);
  if(last&&t-last.at>230)f.points.length=0;
  if(!f.points.length||Math.hypot(s.x-last.x,s.y-last.y)>3){f.points.push({x:s.x,y:s.y,at:t});if(f.points.length>18)f.points.shift();}
 }else if(f){
  if(s||!room.affection||!['touch','affection','contactEnd'].includes(room.motionKind)){room.contactFeedback=null;return;}
  f.released??=t;
  if(t-f.released>=420){room.contactFeedback=null;return;}
 }
 if(!f)return;
 const release=f.released==null?0:(t-f.released)/420,age=t-(f.noticed??f.started),alpha=1-release;
 c.save();c.lineCap='round';c.lineJoin='round';
 if(!room.reduced)for(let i=1;i<f.points.length;i++){const a=f.points[i-1],b=f.points[i],fade=Math.max(0,1-(t-b.at)/230)*alpha;if(!fade)continue;c.strokeStyle=`rgba(255,239,179,${fade*.7})`;c.lineWidth=5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
 const radius=room.reduced?14:14+9*Math.exp(-age/100)+release*8;
 c.globalAlpha=alpha;c.fillStyle='#fff2c44d';c.strokeStyle='#6c4a32';c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,radius,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#fff5d6';c.lineWidth=2;c.stroke();
 c.fillStyle='#fff8df';c.beginPath();c.arc(f.x,f.y,3,0,Math.PI*2);c.fill();
 if(!room.reduced&&age<180&&f.released==null){c.globalAlpha=1-age/180;c.strokeStyle='#fff5d6';c.lineWidth=3;for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;c.beginPath();c.moveTo(f.x+Math.cos(a)*(radius+4),f.y+Math.sin(a)*(radius+4));c.lineTo(f.x+Math.cos(a)*(radius+11),f.y+Math.sin(a)*(radius+11));c.stroke();}}
 c.restore();
}

export function playFeedback(room,event,phase,t){
 let f=room.playFeedback;
 if(phase==='cancel'){if(!event||!f||f.id===event.pointerId){room.playFeedback=null;room.inputPending=true;}return;}
 if(phase==='start')f=room.playFeedback={id:event.pointerId,at:t,x:event.clientX,y:event.clientY,points:[],released:null};
 if(!f||f.id!==event.pointerId||f.released!=null)return;
 f.x=event.clientX;f.y=event.clientY;
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
 if(!room.reduced)for(let i=1;i<f.points.length;i++){const a=f.points[i-1],b=f.points[i],fade=Math.max(0,1-(t-b.at)/220);if(!fade)continue;c.globalAlpha=(1-release)*fade*.75;c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
 c.globalAlpha=1-release;const r=room.reduced?17:17+7*Math.exp(-age/100)+release*10;
 c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.strokeStyle='#4f4035';c.lineWidth=5;c.stroke();c.strokeStyle=color;c.lineWidth=3;c.stroke();
 c.fillStyle=color;c.beginPath();c.arc(f.x,f.y,3,0,Math.PI*2);c.fill();c.restore();
}
