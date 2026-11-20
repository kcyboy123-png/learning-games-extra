import {G,PAPER_MASS,RAD,PRESETS,DEFAULT_ENV,DEFAULT_LAUNCH,clamp,cleanDesign as baseDesign,cleanLaunch,cleanEnv,geometry as oldGeometry,windAt,axes,coefficients} from './physics-v1.mjs?v=20261120-quality6-2';
export {G,PAPER_MASS,RAD,PRESETS,DEFAULT_ENV,DEFAULT_LAUNCH,clamp,cleanLaunch,cleanEnv,windAt,axes,coefficients};
export const PHYSICS_VERSION='rigid-paper-2';
export function cleanDesign(input={}){
 const d=input&&typeof input==='object'?input:{},base=baseDesign(d);
 const clipCount=Number.isInteger(d.clipCount)&&d.clipCount>=0&&d.clipCount<=2?d.clipCount:Number(base.clip);
 return {...base,clip:clipCount>0,clipCount,paperGsm:[70,80,100].includes(d.paperGsm)?d.paperGsm:80,tipAngle:[20,40,60].includes(d.tipAngle)?d.tipAngle:40};
}
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),norm=a=>Math.hypot(...a),unit=a=>mul(a,1/Math.max(1e-12,norm(a)));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-dot(a.slice(0,3),b.slice(0,3))];
const rotate=(q,v)=>add(v,mul(cross(q.slice(0,3),add(cross(q.slice(0,3),v),mul(v,q[3]))),2));
const basis=q=>({right:rotate(q,[1,0,0]),up:rotate(q,[0,1,0]),forward:rotate(q,[0,0,1])});
export const poseAxes=s=>s.length>=16?basis(unit(s.slice(12,16))):axes(s[6],s[8],s[9]);
export function geometry(d={}){
 const design=cleanDesign(d),g=oldGeometry(design),paperMass=PAPER_MASS*(design.paperGsm/80),clipMass=design.clipCount*.0005,mass=paperMass+clipMass;
 if(design.tipAngle!==40&&design.tip>0){
  // Undo the legacy 40-degree projection before rotating around the same hinge.
  const hinge=g.half-design.tip/100,a=design.tipAngle*RAD;
  for(const panel of g.panels)if(panel.kind==='tip')panel.points=panel.points.map(([x,y,z])=>{const reach=(Math.abs(x)-hinge)/Math.cos(40*RAD),across=hinge+reach*Math.cos(a);return [Math.sign(x)*across,design.tipDirection*reach*Math.sin(a)+across*.055,z];});
  g.vertices=g.panels.flatMap(p=>p.points).concat(g.vertices.slice(-2));g.span=2*Math.max(...g.panels.flatMap(p=>p.points.map(v=>Math.abs(v[0]))));
  g.area=g.panels.reduce((sum,p)=>sum+Math.abs(p.points.reduce((s,v,i)=>{const next=p.points[(i+1)%p.points.length];return s+v[0]*next[2]-next[0]*v[2];},0))/2,0);g.chord=g.area/g.span;g.aspect=g.span*g.span/g.area;
 }
 const cg=(paperMass*g.cgPaper+clipMass*design.clipPosition/100)/mass,clip=mass-paperMass,offset=cg-g.cgPaper;
 // Estimated folded-sheet mass distribution; the parallel-axis terms are exact for these masses.
 const pitch=paperMass*(g.length*g.length/18+offset*offset)+clip*(design.clipPosition/100-cg)**2;
 const roll=paperMass*(g.span*g.span/24+(design.fold/100)**2/12)+(design.clipCount===2?clip*.008**2:0);
 return {...g,d:design,paperMass,mass,cg,cgZ:g.nose-cg,inertia:pitch,inertias:[pitch,pitch+roll,roll],sideArea:g.length*design.fold/100+2*g.chord*design.tip/100*Math.sin(design.tipAngle*RAD)};
}
function aerodynamic(velocity,a,omega,t,g,e,rho){
 const air=add(velocity,mul(windAt(e,t),-1)),speed=norm(air),flow=unit(air),alpha=speed<1e-9?0:Math.atan2(-dot(air,a.up),dot(air,a.forward)),beta=speed<1e-9?0:Math.asin(clamp(dot(flow,a.right),-1,1));
 const c=coefficients(alpha,g),q=.5*rho*speed*speed,drag=mul(flow,-q*g.area*c.cd),lift=mul(unit(add(a.up,mul(flow,-dot(a.up,flow)))),q*g.area*c.cl);
 const sideMagnitude=-q*g.sideArea*1.1*Math.sin(beta)*Math.abs(Math.sin(beta)),side=mul(a.right,sideMagnitude);
 const cp=g.cgPaper+.010+.003*Math.sin(alpha),normal=c.cl*Math.cos(alpha)+c.cd*Math.sin(alpha),rateScale=1/(2*Math.max(speed,.05));
 // shortcut: aerodynamic moment derivatives are estimates, to replace after physical flight measurements.
 const cm=.003+g.d.elevator*.0015+(g.cg-cp)/g.chord*normal+1.4*omega[0]*g.chord*rateScale;
 const torque=[-q*g.area*g.chord*cm, -(g.cgPaper+.03-g.cg)*sideMagnitude-q*g.area*g.span*.12*omega[1]*g.span*rateScale,
   q*g.area*g.span*(.22*(.055+g.d.tipDirection*g.d.tip/100/g.span*(Math.sin(g.d.tipAngle*RAD)/Math.sin(40*RAD)))*Math.sin(beta)-.12*omega[2]*g.span*rateScale)];
 const angularMomentum=omega.map((v,i)=>v*g.inertias[i]),gyro=cross(omega,angularMomentum),angularAcceleration=torque.map((v,i)=>(v-gyro[i])/g.inertias[i]);
 return {acceleration:add(mul(add(add(drag,lift),side),1/g.mass),[0,-G,0]),angularAcceleration,torque,drag,side,lift,air,alpha,beta,stall:c.stall,speed};
}
export function forces(s,t,g,e,rho=1.225){
 const f=aerodynamic(s.slice(3,6),poseAxes(s),[-s[7],s[10]??0,s[11]??0],t,g,e,rho);
 return {...f,pitchAcceleration:-f.angularAcceleration[0],yawAcceleration:f.angularAcceleration[1],rollAcceleration:f.angularAcceleration[2]};
}
// Internal state: position, velocity, unit quaternion, body angular velocity.
function derivative(s,t,g,e,rho){const f=aerodynamic(s.slice(3,6),basis(unit(s.slice(6,10))),s.slice(10,13),t,g,e,rho);return [...s.slice(3,6),...f.acceleration,...mul(qmul(s.slice(6,10),[...s.slice(10,13),0]),.5),...f.angularAcceleration];}
function rk4(s,t,dt,g,e,rho){const k1=derivative(s,t,g,e,rho),k2=derivative(add(s,mul(k1,dt/2)),t+dt/2,g,e,rho),k3=derivative(add(s,mul(k2,dt/2)),t+dt/2,g,e,rho),k4=derivative(add(s,mul(k3,dt)),t+dt,g,e,rho),next=s.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);next.splice(6,4,...unit(next.slice(6,10)));return next;}
function snapshot(s){const q=s.slice(6,10),a=basis(q),pitch=Math.asin(clamp(a.forward[1],-1,1)),yaw=Math.atan2(a.forward[0],a.forward[2]),base=axes(pitch,yaw),roll=Math.atan2(dot(a.right,base.up),dot(a.right,base.right));return [...s.slice(0,6),pitch,-s[10],yaw,roll,s[11],s[12],...q];}
export function contact(s,g,point=false){const a=poseAxes(s);let lowest=s.slice(0,3);if(!point)for(const v of g.vertices){const p=add(s.slice(0,3),add(add(mul(a.right,v[0]),mul(a.up,v[1])),mul(a.forward,v[2]-g.cgZ)));if(p[1]<lowest[1])lowest=p;}return lowest;}
export function simulate(design={},launch={},environment={},options={}){
 const g=geometry(design),l=cleanLaunch(launch),e=cleanEnv(environment),dt=options.dt??1/240,rho=options.rho??1.225;
 if(!Number.isFinite(dt)||dt<=0||dt>1/30||!Number.isFinite(rho)||rho<0||rho>10)throw Error('Invalid integration settings');
 const speed=2+10*l.power/100,pitch=l.pitch*RAD,yaw=l.yaw*RAD,q=qmul([0,Math.sin(yaw/2),0,Math.cos(yaw/2)],[-Math.sin(pitch/2),0,0,Math.cos(pitch/2)]),forward=basis(q).forward;
 let s=[0,1.35,0,...mul(forward,speed),...q,0,0,0],t=0,stallTime=0,maxHeight=1.35,reason='timeout',landing=null,minPower=Infinity,maxPower=-Infinity,peakAirspeed=0;
 const path=[{t,s:snapshot(s)}];
 for(let i=0;i<Math.ceil(30/dt);i++){
  const f=aerodynamic(s.slice(3,6),basis(s.slice(6,10)),s.slice(10,13),t,g,e,rho),power=dot(add(f.drag,f.side),f.air);minPower=Math.min(minPower,power);maxPower=Math.max(maxPower,power);peakAirspeed=Math.max(peakAirspeed,f.speed);
  let used=dt,next=rk4(s,t,dt,g,e,rho);if(!next.every(Number.isFinite)||norm(next.slice(3,6))>200){reason='invalid';break;}
  if(contact(snapshot(next),g,options.point)[1]<=0){let low=0,high=dt;for(let j=0;j<19;j++){const m=(low+high)/2;if(contact(snapshot(rk4(s,t,m,g,e,rho)),g,options.point)[1]>0)low=m;else high=m;}used=(low+high)/2;next=rk4(s,t,used,g,e,rho);reason='landed';}
  if(f.stall>.5)stallTime+=used;s=next;t+=used;maxHeight=Math.max(maxHeight,s[1]);
  if(reason==='landed'){landing=contact(snapshot(s),g,options.point);landing[1]=0;path.push({t,s:snapshot(s)});break;}
  if(i%4===3)path.push({t,s:snapshot(s)});
 }
 return {version:2,physics:PHYSICS_VERSION,design:g.d,launch:l,env:e,path,reason,landing,duration:t,distance:landing?Math.hypot(landing[0],landing[2]):0,targetDistance:landing?Math.hypot(landing[0],landing[2]-e.target):null,maxHeight,stallTime,peakAirspeed,dragPowerMax:maxPower,dragPowerMin:minPower};
}
export function sampleFlight(f,t){
 const path=f.path;let low=0,high=path.length-1;while(high-low>1){const m=(low+high)>>1;if(path[m].t<t)low=m;else high=m;}
 const a=path[low],b=path[high],r=clamp((t-a.t)/Math.max(b.t-a.t,1e-9),0,1),s=a.s.map((v,i)=>v+(b.s[i]-v)*r);
 if(s.length>=16){const qa=a.s.slice(12,16),qb=b.s.slice(12,16),sign=dot(qa,qb)<0?-1:1;s.splice(12,4,...unit(qa.map((v,i)=>v+(qb[i]*sign-v)*r)));}return s;
}
