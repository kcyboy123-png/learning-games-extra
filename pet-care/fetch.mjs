const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const tossGravity=4600;
export function rollTarget(start,end,ms){const delta=end-start,speed=Math.abs(delta)/Math.max(80,ms);return clamp(end+Math.sign(delta)*clamp(speed*380,.04,.24),.22,.78);}
export function rollPosition(roll,now){const t=clamp((now-roll.at)/roll.duration,0,1);return roll.from+(roll.to-roll.from)*(1-(1-t)**3);}

export function dragSample(d,x,y,t){
 const last=d.samples.at(-1);
 if(!last||x!==last.x||y!==last.y)d.samples.push({x,y,t});
 while(d.samples.length>8||d.samples.length>1&&t-d.samples[0].t>145)d.samples.shift();
 d.travel=Math.max(d.travel,Math.hypot(x-d.downX,y-d.downY));
}

// Use the last moving part of the gesture. Keeping the toy in place lets its momentum fall away.
export function flickVector(d,t){
 const end=d.samples.at(-1),start=d.samples[0];
 if(!end||end===start)return {x:0,y:0};
 const dt=Math.max(20,end.t-start.t),glide=Math.exp(-Math.max(0,t-end.t-18)/60);
 return {x:(end.x-start.x)/dt*glide,y:(end.y-start.y)/dt*glide};
}

export function toyRoll({x,y,vx,vy,w,depth,at,toy='ball',target}){
 const speed=Math.hypot(vx,vy),cloth=toy==='bone';
 const duration=clamp(420+speed*(cloth?145:230),440,cloth?850:1330);
 const friction=cloth?.26:.43;
 const rawX=target??x+vx*duration*friction/w;
 const floorY=target!=null?0:clamp(vy*duration*friction*.55,-Math.min(18,depth*.22),0);
 const launch=target==null?Math.min(cloth?525:610,Math.abs(vx)*160+Math.max(0,-vy)*430):270;
 const fallMs=(launch+Math.sqrt(launch*launch-2*tossGravity*y))/tossGravity*1000;
 return {from:x,to:clamp(rawX,.14,.86),y0:y,y1:floorY,launch,fallMs,at,duration,toy,impact:target==null?Math.min(1,speed/1.8):.36,
  side:rawX<.14?-1:rawX>.86?1:0,bank:target==null&&toy==='ball'&&speed>.58};
}
export function toyFrame(roll,t){
 const age=Math.max(0,t-roll.at),f=clamp(age/roll.duration,0,1),ease=1-(1-f)**2.4;
 const rebound=roll.bank&&roll.side?Math.sin(Math.PI*f)**4*.035*roll.side:0;
 const x=clamp(roll.from+(roll.to-roll.from)*ease+rebound,.12,.88);
 const floorY=roll.y1*ease;
 const airborne=age<roll.fallMs,seconds=age/1000;
 const y=airborne?floorY+roll.y0-roll.launch*seconds+tossGravity*seconds*seconds/2:floorY;
 const bounceMs=Math.min(roll.toy==='bone'?105:165,roll.duration-roll.fallMs);
 const bounce=clamp((age-roll.fallMs)/bounceMs,0,1);
 const hop=bounce<1?Math.sin(Math.PI*bounce)*roll.impact*(roll.toy==='bone'?3:7):0;
 return {x,y,hop,floorY};
}

export function makeToyDrop({x,y,floor,at,toy}){
 const rise=clamp(floor-y,0,500);
 const fall=rise<3?0:Math.sqrt(2*rise/1850)*1000;
 const settle=fall>0?(toy==='ball'?200:85):0;
 return {x,rise,fall,settle,at,duration:fall+settle,toy};
}
export function sampleToyDrop(drop,t,floor){
 const age=Math.max(0,t-drop.at);
 if(age<drop.fall){const f=age/drop.fall;return {y:floor-drop.rise*(1-f*f),angle:0};}
 if(age>=drop.duration||drop.settle===0)return {y:floor,angle:0};
 const f=(age-drop.fall)/drop.settle;
 if(drop.toy==='ball')return {y:floor-Math.min(10,drop.rise*.07)*Math.sin(Math.PI*f),angle:0};
 return {y:floor,angle:.13*Math.sin(Math.PI*2*f)*(1-f)};
}
