const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function contactPoint(box,point){return {x:clamp(point?.x??box.x+box.w*.68,box.x+box.w*.65,box.x+box.w*.76),y:clamp(point?.y??box.y+box.h*.55,box.y+box.h*.50,box.y+box.h*.64)};}
export function followContact(from,to,dt,base){const dx=to.x-from.x,dy=to.y-from.y,d=Math.hypot(dx,dy),step=Math.min(d*(1-Math.exp(-dt/110)),base*.28*dt/1000);return d?{x:from.x+dx/d*step,y:from.y+dy/d*step}:to;}
export function loadHand(room){if(room.variant!=='cat-silver')return;const im=new Image();im.decoding='async';im.src='assets/petting-hand.png';im.decode().then(()=>room.handImage=im).catch(()=>{room.handUnavailable=true;});}
export function drawHand(room,t,dt){
 if(!room.handImage)return;
 const on=room.touchPart==='back'&&room.renderPose===10&&!room.handReleased&&!room.handBlocked;
 const h=room.handState??={amount:0,x:0,y:0};h.amount=room.reduced?(on?1:0):clamp(h.amount+(on?1:-1)*dt/(on?480:350),0,1);
 if(!h.amount){h.x=0;h.pressure=0;room.handContact=null;return;}
 const previousX=h.x,previousY=h.y;
 if(on){const p=contactPoint(room.petBox,room.point);if(!h.x)h.started=t;const glide=room.point||room.reduced?0:(1-Math.cos((t-h.started)/420))*room.base*.012;p.y+=glide;
  if(!h.x){h.x=p.x;h.y=p.y;}const q=room.reduced?p:followContact(h,p,dt,room.base);h.x=q.x;h.y=q.y;
 }
 const speed=previousX?Math.hypot(h.x-previousX,h.y-previousY)/Math.max(1,dt)*1000/room.base:0;
 h.calm=1-clamp(speed/.28,0,1)*.55;
 const contact=on?clamp((h.amount-.68)/.32,0,1):0;
 h.pressure=room.reduced?contact:(h.pressure||0)+(contact-(h.pressure||0))*(1-Math.exp(-dt/110));
 const targetRoll=room.reduced?0:clamp((h.y-previousY)/Math.max(1,dt)*.035,-.045,.045);
 h.roll=(h.roll||0)+(targetRoll-(h.roll||0))*(1-Math.exp(-dt/150));
 const ease=h.amount*h.amount*(3-2*h.amount),size=Math.max(room.base*.86,(room.h-h.y)/.8),x=h.x+(1-ease)*size*.55,y=h.y+(1-ease)*size*.8-Math.sin((1-ease)*Math.PI)*size*.13,c=room.ctx;
 c.save();c.globalAlpha=ease;
 c.translate(x,y);c.rotate(.6+h.roll);
 // Reuse the existing soft shadow map; no per-frame blur or texture generation.
 if(room.shadow&&h.pressure>.01){room.shadow(size*.03,size*.02,size*.13,size*.025,h.pressure*.28);room.shadow(size*.20,size*.22,size*.14,size*.07,h.pressure*.13);}
 c.drawImage(room.handImage,-size*.20,-size*.20,size,size);c.restore();
 room.handContact={x:h.x,y:h.y,amount:h.amount};
}
