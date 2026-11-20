import * as THREE from './lib/three.module.min.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const length=v=>Math.hypot(...v);
const angle=v=>Math.atan2(v[1],v[0]);
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const point=(p,origin)=>new THREE.Vector3(p[0]-origin[0],origin[1]-p[1],0);
export function solveArm(shoulder,target,a,b,bend=1){
 const delta=sub(target,shoulder),distance=clamp(length(delta),Math.abs(a-b)+.001,a+b-.001);
 const direction=angle(delta),offset=Math.acos(clamp((a*a+distance*distance-b*b)/(2*a*distance),-1,1));
 const turn=direction+bend*offset;
 return [shoulder[0]+Math.cos(turn)*a,shoulder[1]+Math.sin(turn)*a];
}
function distanceToSegment(p,a,b){const d=sub(b,a),t=clamp(((p[0]-a[0])*d[0]+(p[1]-a[1])*d[1])/(d[0]*d[0]+d[1]*d[1]||1),0,1);return Math.hypot(p[0]-a[0]-t*d[0],p[1]-a[1]-t*d[1]);}
const material=texture=>new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.18,side:THREE.DoubleSide,toneMapped:false,color:0xf9f5ea});

export const PUPPETS={
 cello:{body:[150,0,550,1024],height:1.48,arms:[
  {rect:[750,150,600,330],shoulder:[1075,225],elbow:[1040,340],wrist:[1190,399],knuckles:[[1220,397],[1240,403],[1260,408],[1280,412],[1215,428]],tips:[[1226,447],[1247,448],[1268,441],[1288,427],[1240,434]],attach:[303,337],target:[460,565],scale:1.08,bend:1,layer:.005,grip:true,rigidWrist:[750,405,600,70]},
  {rect:[900,510,410,390],shoulder:[989,703],elbow:[1080,804],wrist:[1211,671],knuckles:[[1210,553],[1205,575],[1200,596],[1194,617],[1245,614]],tips:[[1191,539],[1185,560],[1177,581],[1180,605],[1215,635]],attach:[518,337],target:[474,310],scale:.65,bend:1,layer:.004},
 ]},
 shaker:{body:[180,0,450,1024],height:1.5,arms:[
  {rect:[850,160,480,350],shoulder:[1245,270],elbow:[1120,430],wrist:[1005,350],knuckles:[[930,270],[930,290],[934,315],[939,335],[985,276]],tips:[[908,265],[906,291],[913,313],[927,334],[966,287]],attach:[318,300],target:[286,425],scale:.57,bend:-1,layer:.003,grip:true},
  {rect:[850,510,480,330],shoulder:[1245,580],elbow:[1120,760],wrist:[1000,659],knuckles:[[940,548],[940,570],[940,594],[948,614],[987,610]],tips:[[900,542],[895,561],[897,581],[905,606],[966,627]],attach:[505,300],target:[488,514],scale:.7,bend:-1,layer:.002,grip:true},
 ]},
 girl:{body:[20,0,690,1024],height:1.35,arms:[
  {rect:[850,500,550,320],shoulder:[1305,565],elbow:[1250,738],wrist:[1010,690],knuckles:[[974,668],[959,683],[951,698],[955,711],[1008,697]],tips:[[888,658],[877,682],[883,703],[907,719],[972,726]],attach:[472,365],target:[303,494],scale:.6,bend:-1,layer:-.002},
  {rect:[850,120,550,320],shoulder:[1305,190],elbow:[1250,366],wrist:[1010,317],knuckles:[[974,281],[959,294],[950,308],[958,323],[1008,312]],tips:[[889,277],[876,300],[883,320],[918,332],[972,337]],attach:[505,370],target:[325,527],scale:.6,bend:-1,layer:.002},
 ]},
 boy:{body:[100,0,640,1024],height:1.35,arms:[
  {rect:[900,490,450,250],shoulder:[1260,550],elbow:[1200,684],wrist:[1035,655],knuckles:[[984,642],[974,651],[968,661],[967,674],[1020,665]],tips:[[926,654],[934,677],[951,692],[972,681],[1001,682]],attach:[546,369],target:[365,507],scale:.8,bend:-1,layer:-.002},
  {rect:[900,220,450,250],shoulder:[1260,275],elbow:[1200,409],wrist:[1035,380],knuckles:[[984,367],[974,376],[968,386],[967,399],[1020,390]],tips:[[926,379],[934,402],[951,417],[972,406],[1001,407]],attach:[585,385],target:[390,544],scale:.82,bend:-1,layer:.002},
 ]},
 flute:{body:[100,0,560,1024],height:1.65,arms:[
  {rect:[880,200,400,260],shoulder:[1200,280],elbow:[1095,401],wrist:[1004,305],knuckles:[[949,234],[963,238],[977,245],[990,254],[1006,276]],tips:[[907,250],[927,254],[947,257],[969,263],[991,292]],attach:[335,300],target:[258,306],scale:.6,bend:-1,layer:.002},
  {rect:[960,470,350,300],shoulder:[1225,580],elbow:[1165,696],wrist:[1076,602],knuckles:[[1025,506],[1038,515],[1050,526],[1060,541],[1042,562]],tips:[[990,499],[984,514],[984,532],[1015,551],[1020,575]],attach:[508,300],target:[375,295],scale:.65,bend:-1,layer:.003},
 ]},
 guitar:{body:[170,0,550,1024],height:1.42,arms:[
  {rect:[920,180,350,320],shoulder:[1055,235],elbow:[988,356],wrist:[1135,413],knuckles:[[1180,414],[1188,428],[1184,441],[1178,454],[1150,418]],tips:[[1232,425],[1224,446],[1210,462],[1185,478],[1209,400]],attach:[306,327],target:[362,425],scale:.67,bend:1,layer:.004},
  {rect:[960,530,330,350],shoulder:[1020,700],elbow:[1098,812],wrist:[1200,681],knuckles:[[1224,573],[1218,589],[1210,606],[1203,623],[1227,643]],tips:[[1203,552],[1187,569],[1180,587],[1176,612],[1202,645]],attach:[494,315],target:[565,375],scale:.65,bend:1,layer:.003},
 ]},
};

function makeArm(texture,definition,body,unit){
 const {rect,shoulder,elbow,wrist,knuckles,tips,attach,scale,layer}=definition;
 const geometry=new THREE.PlaneGeometry(rect[2],rect[3],100,60),position=geometry.attributes.position,uv=geometry.attributes.uv;
 const joints=[shoulder,elbow,wrist,...knuckles.flatMap((k,i)=>[k,[(k[0]+tips[i][0])*.5,(k[1]+tips[i][1])*.5]])];
 const parents=[-1,0,1,...knuckles.flatMap((_,i)=>[2,3+i*2])];
 const palm=[knuckles.reduce((s,p)=>s+p[0],0)/5,knuckles.reduce((s,p)=>s+p[1],0)/5];
 const ends=[elbow,wrist,palm,...knuckles.flatMap((k,i)=>[joints[4+i*2],tips[i]])];
 const bones=joints.map((p,i)=>{const b=new THREE.Bone();b.position.copy(point(p,parents[i]<0?p:joints[parents[i]]));return b;});
 bones.forEach((b,i)=>{if(parents[i]>=0)bones[parents[i]].add(b);});
 const indices=[],weights=[];
 for(let i=0;i<position.count;i++){
  const p=[rect[0]+uv.getX(i)*rect[2],rect[1]+(1-uv.getY(i))*rect[3]];
  position.setXYZ(i,p[0]-shoulder[0],shoulder[1]-p[1],0);
  uv.setXY(i,p[0]/texture.image.width,1-p[1]/texture.image.height);
  const rigid=definition.rigidWrist&&p[0]>=definition.rigidWrist[0]&&p[0]<=definition.rigidWrist[0]+definition.rigidWrist[2]&&p[1]>=definition.rigidWrist[1]&&p[1]<=definition.rigidWrist[1]+definition.rigidWrist[3];
  const candidates=rigid?[{n:2,d:0}]:joints.map((j,n)=>({n,d:distanceToSegment(p,j,ends[n])})).filter(c=>!definition.grip||c.n<3).sort((a,b)=>a.d-b.d);
  const nearest=candidates[0],parent=rigid?-1:parents[nearest.n];
  const jointDistance=length(sub(p,joints[nearest.n]));
  const blend=parent>=0?clamp(1-jointDistance/(nearest.n>=3?20:38),0,1)*.5:0;
  indices.push(nearest.n,Math.max(0,parent),0,0);weights.push(1-blend,blend,0,0);
 }
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
 const mesh=new THREE.SkinnedMesh(geometry,material(texture));mesh.add(bones[0]);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;
 const group=new THREE.Group();group.position.set((attach[0]-body[0]-body[2]/2)*unit,(body[1]+body[3]-attach[1])*unit,layer);group.scale.setScalar(unit*scale);group.add(mesh);
 const upper=length(sub(elbow,shoulder))*scale,lower=length(sub(wrist,elbow))*scale;
 const restUpper=angle(sub(elbow,shoulder)),restLower=angle(sub(wrist,elbow)),current=definition.target.slice(),curl=Array(5).fill(0);
 let wristAngle=0;
 return {group,mesh,bones,current,curl,
  pose(target,fingers,dt,reduced,wristTurn=0,pace=20){
   const ease=reduced?1:1-Math.exp(-dt*pace);
   for(let i=0;i<2;i++)current[i]+=(target[i]-current[i])*ease;
   const delta=sub(current,attach),distance=length(delta),margin=Math.min(upper,lower)*.02,reach=clamp(distance,Math.abs(upper-lower)+margin,upper+lower-margin);
   const wristTarget=distance?[attach[0]+delta[0]*reach/distance,attach[1]+delta[1]*reach/distance]:[attach[0],attach[1]+reach];
   const joint=solveArm(attach,wristTarget,upper,lower,definition.bend);
   const upperTurn=wrap(angle(sub(joint,attach))-restUpper),lowerTurn=wrap(angle(sub(wristTarget,joint))-restLower);
   wristAngle=reduced?0:wristAngle+(wristTurn-wristAngle)*(1-Math.exp(-dt*22));
   bones[0].rotation.z=-upperTurn;bones[1].rotation.z=-(lowerTurn-upperTurn);bones[2].rotation.z=lowerTurn+wristAngle;
   for(let i=0;i<5;i++){
    const rate=i===4?18:fingers[i]>curl[i]?45:18;
    curl[i]=reduced?0:curl[i]+(fingers[i]-curl[i])*(1-Math.exp(-dt*rate));
    bones[3+i*2].rotation.z=curl[i]*.38;bones[4+i*2].rotation.z=curl[i]*(i===4?.22:.55);
   }
  },
 };
}

// shortcut: painted 2D fingers suggest fingering; anatomical fingering at every pitch needs 3D hands.
export function createMusicianRig(texture,id){
 const config=PUPPETS[id],group=new THREE.Group(),{body,height}=config,unit=height/body[3];group.name='musician-'+id;
 texture.colorSpace=THREE.SRGBColorSpace;
 const bodyTexture=texture.clone();bodyTexture.repeat.set(body[2]/texture.image.width,body[3]/texture.image.height);bodyTexture.offset.set(body[0]/texture.image.width,1-(body[1]+body[3])/texture.image.height);bodyTexture.needsUpdate=true;
 const bodyMesh=new THREE.Mesh(new THREE.PlaneGeometry(body[2]*unit,height).translate(0,height/2,0),material(bodyTexture));group.add(bodyMesh);
 const arms=config.arms.map(def=>makeArm(texture,def,body,unit));arms.forEach(arm=>group.add(arm.group));
 let clock=0,breath=0,support=0;
 return {group,bodyMesh,arms,config,texture:bodyTexture,
  pose({dt=1/60,hands=[],pitch=60,gesture=0,playing=false,reduced=false,bow=0,time,pluck=0,breathStrength=Number(playing)}){
   if(reduced){gesture=0;bow=0;}
   clock+=dt;support=reduced?0:support+(gesture-support)*(1-Math.exp(-dt*12));
   breath=reduced?0:breath+(breathStrength-breath)*(1-Math.exp(-dt*5));
   arms.forEach((arm,i)=>{
    const def=config.arms[i],hit=reduced?0:(hands[i]?.hit??gesture),key=hands[i]?.key??pitch;
    let target=[def.target[0]+(key>=0?(clamp(key,i===0?0:7,21)-14)*3.5:0),def.target[1]+hit*5];
    const pianoHand=id==='girl'||id==='boy',whiteKey=key>=0?Math.round(key):0;
    const finger=pianoHand?(i===0?4-whiteKey%5:whiteKey%5):((key>=0?key:0)%5+5)%5;
    let wristTurn=0,fingers=Array.from({length:5},(_,f)=>playing||hit>0?(f===finger?hit:hit*.06):0);
    if(id==='cello'){
      wristTurn=i===0?bow*.035:clamp((pitch-60)/24,0,1)*.025;
      target=i===0?[def.target[0]+bow*28,def.target[1]]:[def.target[0]-(pitch-60)*.8,def.target[1]+(pitch-60)*2];
      const stoppedFinger=((pitch-60)%4+4)%4;
      fingers=i===0?[0,0,0,0,0]:Array.from({length:5},(_,f)=>f===4?.12:playing?(f===stoppedFinger?.65:.12):.08);
    }else if(id==='shaker'){
      wristTurn=i===0?-gesture*.12:0;
      target=[def.target[0]+(i===0?gesture*10:-support*3),def.target[1]-(i===0?gesture*34:-support*5)];
      fingers=[0,0,0,0,0];
    }else if(id==='guitar'){
      const fret=clamp((pitch-60)/24,0,1);
      target=i===0?[def.target[0]+gesture*10+gesture*(1-gesture)*8,def.target[1]+gesture*18]:[def.target[0]+fret*30,def.target[1]-fret*30];
      wristTurn=i===0?-gesture*.1:0;
      const fretFinger=((pitch-60)%4+4)%4;
      fingers=Array.from({length:5},(_,f)=>i===0?(f===pluck%2?gesture*.55:f===4?.08+gesture*.1:.12):(f===4?.14:f===fretFinger?(playing?.72:.3):.12));
    }else if(id==='flute'){
      const keys={0:[1,0,0,0,0,0],2:[0,1,1,1,1,1],4:[1,1,1,1,1,0],5:[1,1,1,1,0,0],7:[1,1,1,0,0,0],9:[1,1,0,0,0,0],11:[1,0,0,0,0,0]}[pitch%12]||[0,0,0,0,0,0];
      target=[def.target[0],def.target[1]+(reduced?0:Math.sin((time??clock)*1.3)*breath*.7)];
      fingers=Array.from({length:5},(_,f)=>f<3?(keys[(1-i)*3+f]*(playing?.75:.32)+.05):.1);
    }
    arm.pose(reduced?def.target:target,fingers,dt,reduced,wristTurn,playing||hit>0?(i===1&&(id==='guitar'||id==='cello')?14:20):9);
   });
  },
  setEnvironment(tint){group.traverse(o=>{if(o.material)o.material.color.set(tint);});},
  setOpacity(k){group.traverse(o=>{if(o.material){o.material.opacity=k;o.material.depthWrite=k>.995;o.material.alphaTest=.18*Math.max(.001,k);}});},
 };
}
