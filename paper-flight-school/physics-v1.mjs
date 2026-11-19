// SI units. Estimated rigid-paper aerodynamics; not calibrated flight prediction.
export const G=9.80665, PAPER_MASS=.21*.297*.080, RAD=Math.PI/180;
export const PRESETS={
  dart:{name:'화살형',fold:4.5,tip:.5,tipDirection:1,elevator:0,clip:true,clipPosition:3},
  balanced:{name:'균형형',fold:3,tip:1,tipDirection:1,elevator:3,clip:false,clipPosition:3},
  glider:{name:'넓은 날개',fold:1.5,tip:1.5,tipDirection:1,elevator:5,clip:false,clipPosition:3}
};
export const DEFAULT_ENV={windSpeed:0,windDirection:90,gust:false,seed:2147,target:10};
export const DEFAULT_LAUNCH={power:50,pitch:12,yaw:0,method:'gauge'};
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const finite=(x,d,a,b)=>Number.isFinite(x)?clamp(x,a,b):d;
export function cleanDesign(d={}) {
  const type=Object.hasOwn(PRESETS,d.type)?d.type:'balanced', p=PRESETS[type];
  return {type,fold:finite(d.fold,p.fold,1.5,4.5),tip:finite(d.tip,p.tip,0,2),tipDirection:d.tipDirection===-1?-1:1,elevator:finite(d.elevator,p.elevator,-12,12),clip:typeof d.clip==='boolean'?d.clip:p.clip,clipPosition:finite(d.clipPosition,p.clipPosition,2,12)};
}
export function cleanEnv(e={}) {return {windSpeed:finite(e.windSpeed,0,0,4),windDirection:finite(e.windDirection,90,-180,180),gust:e.gust===true,seed:Math.round(finite(e.seed,2147,1,2147483646)),target:finite(e.target,10,3,25)};}
export function cleanLaunch(l={}) {return {power:finite(l.power,50,0,100),pitch:finite(l.pitch,12,-5,40),yaw:finite(l.yaw,0,-35,35),method:l.method==='fixed'?'fixed':'gauge'};}
const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=a=>Math.hypot(...a), unit=a=>mul(a,1/Math.max(norm(a),1e-9));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function cut(poly,axis,value,above) {
  const out=[];
  for(let i=0;i<poly.length;i++) {
    const a=poly[i],b=poly[(i+1)%poly.length],ia=above?a[axis]>=value:a[axis]<=value,ib=above?b[axis]>=value:b[axis]<=value;
    if(ia)out.push(a);
    if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((x,j)=>x+t*(b[j]-x)));}
  } return out;
}
const area=poly=>Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[2]-q[0]*p[2];},0))/2;
export function geometry(input={}) {
  const d=cleanDesign(input),length={dart:.27,balanced:.245,glider:.22}[d.type],half=(10.5-d.fold)/100;
  const nose=length*.58,tail=-length*.42,knee={dart:-.19,balanced:.04,glider:.16}[d.type]*length;
  const base=[[.002,0,nose],[half,0,knee],[half*.90,0,tail],[.004,0,tail+.008]];
  const hinge=half-d.tip/100, rear=tail+.018;
  const tip=cut(base,0,hinge,true),body=cut(base,0,hinge,false);
  const parts=[{kind:'wing',poly:cut(body,2,rear,true)},{kind:'rear',poly:cut(body,2,rear,false)},{kind:'tip',poly:tip}];
  const panels=[];
  for(const side of [-1,1])for(const part of parts){
    if(part.poly.length<3 || area(part.poly)<1e-9)continue;
    panels.push({kind:part.kind,points:part.poly.map(([x,y,z])=>{
      if(part.kind==='tip'){const a=d.tipDirection*40*RAD;y=(x-hinge)*Math.sin(a);x=hinge+(x-hinge)*Math.cos(a);}
      if(part.kind==='rear'){const a=d.elevator*RAD;y=(rear-z)*Math.sin(a);z=rear+(z-rear)*Math.cos(a);}
      y+=x*.055;
      return [side*x,y,z];
    })});
  }
  const span=2*Math.max(...panels.flatMap(p=>p.points.map(v=>Math.abs(v[0]))));
  const S=panels.reduce((s,p)=>s+area(p.points),0),chord=S/span;
  const cgPaper=.46*length+(d.fold-3)*.001,clipMass=d.clip?.0005:0,mass=PAPER_MASS+clipMass;
  const cg=(PAPER_MASS*cgPaper+clipMass*d.clipPosition/100)/mass;
  const cgZ=nose-cg;
  const vertices=panels.flatMap(p=>p.points).concat([[0,-d.fold/100,nose-.025],[0,-d.fold/100,tail+.01]]);
  return {d,length,half,nose,tail,panels,vertices,span,area:S,chord,aspect:span*span/S,mass,cg,cgZ,cgPaper,inertia:PAPER_MASS*length*length/18+clipMass*(d.clipPosition/100-cg)**2};
}
export function windAt(env,t){
  const e=cleanEnv(env),a=e.windDirection*RAD,phase=(e.seed%997)/997*Math.PI*2;
  const pulse=e.gust?1+.25*Math.sin(t*1.7+phase)+.12*Math.sin(t*3.1+phase*.7):1;
  const sway=e.gust?.12*Math.sin(t*.8+phase):0;
  return [Math.sin(a+sway)*e.windSpeed*pulse,0,Math.cos(a+sway)*e.windSpeed*pulse];
}
export function axes(pitch,yaw,roll=0){
  const forward=[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)];
  const right=[Math.cos(yaw),0,-Math.sin(yaw)],up=cross(forward,right);
  return {forward,right:add(mul(right,Math.cos(roll)),mul(up,Math.sin(roll))),up:add(mul(up,Math.cos(roll)),mul(right,-Math.sin(roll)))};
}
export function coefficients(alpha,g){
  const blend=clamp((Math.abs(alpha)-.22)/.24,0,1),s=blend*blend*(3-2*blend);
  const slope=Math.PI*g.aspect/(1+Math.sqrt(1+(g.aspect/2)**2));
  const cl=(1-s)*(.045+slope*alpha)+s*Math.sin(2*alpha);
  const cd=.037+cl*cl/(Math.PI*.76*g.aspect)+s*1.7*Math.sin(alpha)**2+.012*(g.d.tip/2)+.012*Math.abs(g.d.elevator)/12;
  return {cl,cd,stall:s};
}
export function forces(state,t,g,env,rho=1.225){
  const velocity=state.slice(3,6),air=add(velocity,mul(windAt(env,t),-1)),speed=norm(air),a=axes(state[6],state[8],state[9]);
  const alpha=speed<1e-8?0:Math.atan2(-dot(air,a.up),dot(air,a.forward));
  const coeff=coefficients(alpha,g),q=.5*rho*speed*speed,flow=unit(air);
  const liftDir=unit(add(a.up,mul(flow,-dot(a.up,flow))));
  const drag=mul(flow,-q*g.area*coeff.cd),lift=mul(liftDir,q*g.area*coeff.cl);
  const acceleration=add(mul(add(lift,drag),1/g.mass),[0,-G,0]);
  // shortcut: estimated CP and pitch derivatives; replace with measured data before predictive use.
  const cp=g.cgPaper+.010+.003*Math.sin(alpha),normalCoeff=coeff.cl*Math.cos(alpha)+coeff.cd*Math.sin(alpha);
  const cm=.003+g.d.elevator*.0015+(g.cg-cp)/g.chord*normalCoeff-1.4*state[7]*g.chord/(2*Math.max(speed,.05));
  const pitchAcceleration=q*g.area*g.chord*cm/g.inertia;
  const slip=wrap(Math.atan2(air[0],air[2])-state[8]);
  const alignment=clamp(speed/3,0,1),yawRate=clamp(slip*.75,-.7,.7)*alignment;
  const rollTarget=clamp(-slip*(.25+.3*g.d.tip*g.d.tipDirection),-.45,.45)*alignment;
  return {acceleration,pitchAcceleration,yawRate,rollRate:(rollTarget-state[9])*2,drag,air,alpha,stall:coeff.stall};
}
function derivative(s,t,g,e,rho){const f=forces(s,t,g,e,rho);return [...s.slice(3,6),...f.acceleration,s[7],f.pitchAcceleration,f.yawRate,f.rollRate];}
function rk4(s,t,dt,g,e,rho){const k1=derivative(s,t,g,e,rho),k2=derivative(add(s,mul(k1,dt/2)),t+dt/2,g,e,rho),k3=derivative(add(s,mul(k2,dt/2)),t+dt/2,g,e,rho),k4=derivative(add(s,mul(k3,dt)),t+dt,g,e,rho);return s.map((x,i)=>x+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);}
export function contact(s,g,point=false){
  const a=axes(s[6],s[8],s[9]);let lowest=[s[0],s[1],s[2]];
  if(!point)for(const v of g.vertices){const p=add(s.slice(0,3),add(add(mul(a.right,v[0]),mul(a.up,v[1])),mul(a.forward,v[2]-g.cgZ)));if(p[1]<lowest[1])lowest=p;}
  return lowest;
}
export function simulate(design={},launch={},environment={},options={}){
  const g=geometry(design),l=cleanLaunch(launch),e=cleanEnv(environment),dt=options.dt??1/240,rho=options.rho??1.225;
  if(!Number.isFinite(dt)||dt<=0||dt>1/30||!Number.isFinite(rho)||rho<0)throw Error('Invalid integration settings');
  const speed=2+10*l.power/100,pitch=l.pitch*RAD,yaw=l.yaw*RAD;
  let s=[0,1.35,0,speed*Math.cos(pitch)*Math.sin(yaw),speed*Math.sin(pitch),speed*Math.cos(pitch)*Math.cos(yaw),pitch,0,yaw,0],t=0,stallTime=0,maxHeight=s[1];
  const path=[{t:0,s:[...s]}];let reason='timeout',landing=null,minPower=Infinity,maxPower=-Infinity;
  for(let i=0;i<Math.ceil(30/dt);i++){
    const f=forces(s,t,g,e,rho),power=dot(f.drag,f.air);minPower=Math.min(minPower,power);maxPower=Math.max(maxPower,power);
    if(f.stall>.5)stallTime+=dt;
    const next=rk4(s,t,dt,g,e,rho);
    if(!next.every(Number.isFinite)||norm(next.slice(3,6))>200){reason='invalid';break;}
    const c0=contact(s,g,options.point),c1=contact(next,g,options.point);
    if(c1[1]<=0){
      let low=0,high=1;
      for(let j=0;j<18;j++){const m=(low+high)/2,sm=s.map((v,k)=>v+(next[k]-v)*m);if(contact(sm,g,options.point)[1]>0)low=m;else high=m;}
      const r=(low+high)/2;s=s.map((v,k)=>v+(next[k]-v)*r);t+=dt*r;landing=contact(s,g,options.point);landing[1]=0;reason='landed';path.push({t,s:[...s]});break;
    }
    s=next;t+=dt;maxHeight=Math.max(maxHeight,s[1]);if(i%4===3)path.push({t,s:[...s]});
  }
  return {version:1,design:g.d,launch:l,env:e,path,reason,landing,duration:t,distance:landing?Math.hypot(landing[0],landing[2]):0,targetDistance:landing?Math.hypot(landing[0],landing[2]-e.target):null,maxHeight,stallTime,dragPowerMax:maxPower,dragPowerMin:minPower};
}
export function sampleFlight(f,t){
  const path=f.path;let low=0,high=path.length-1;
  while(high-low>1){const m=(low+high)>>1;if(path[m].t<t)low=m;else high=m;}
  const a=path[low],b=path[high],r=clamp((t-a.t)/Math.max(b.t-a.t,1e-9),0,1);return a.s.map((v,i)=>v+(b.s[i]-v)*r);
}
