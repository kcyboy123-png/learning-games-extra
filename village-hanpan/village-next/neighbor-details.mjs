// Three distinct silhouettes share the village rig, materials and geometry cache.
export function addNeighborDetails(p,h){
 const {T,petBall,mesh,geometry}=h,{species,body,head,ears,limbs,knees,fur,cream}=p;
 let trunk=null;
 if(species==='penguin'){
  head.position.y=.99;head.scale.x=1.10;body.scale.x=1.06;
  for(const side of[-1,1])petBall(head,cream,side*.15,-.015,.252,.185,.218,.05);
  petBall(head,'#dfad68',0,-.13,.36,.08,.038,.07);
  petBall(body,cream,0,.54,.245,.22,.25,.055);
  for(const side of[-1,1]){const bow=petBall(body,'#be7e80',side*.055,.78,.245,.065,.04,.025);bow.rotation.z=side*.3;}petBall(body,'#e9b99b',0,.78,.277,.025);
  petBall(head,'#9ab8a0',-.09,.335,-.04,.23,.06,.20);petBall(head,'#6e9685',-.09,.385,-.04,.045,.025,.035);
  for(let k=0;k<2;k++){petBall(limbs[k*2+1],fur,0,-.17,-.01,.13,.24,.065);petBall(knees[k],'#dfad68',0,-.19,.09,.16,.045,.21);}
 }else if(species==='sheep'){
  petBall(head,'#f5edd9',0,.235,-.075,.37,.17,.275);
  petBall(body,'#b49fb8',0,.42,0,.36,.17,.27);
  for(let i=0;i<5;i++){const t=i*1.257;petBall(head,'#d8a6b3',.27+Math.sin(t)*.036,.245+Math.cos(t)*.036,.21,.027,.027,.014);}petBall(head,'#eed39b',.27,.245,.23,.020);
  for(let i=0;i<27;i++){const a=i*2.399,y=.12+(i%4)*.065;petBall(head,'#f5edd9',Math.sin(a)*.34,y,Math.cos(a)*.24-.08,.12,.105,.11);}
  for(const side of[-1,1]){const ear=new T.Group();ear.position.set(side*.39,.04,-.04);ear.rotation.z=side*.5;ear.userData.restZ=ear.rotation.z;head.add(ear);ears.push(ear);petBall(ear,fur,side*.045,-.01,0,.15,.085,.08);petBall(ear,'#dcb7ac',side*.05,-.005,.06,.095,.045,.025);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;petBall(body,'#f5edd9',Math.sin(a)*.25,.70,Math.cos(a)*.17,.13,.13,.12);}
 }else if(species==='elephant'){
  petBall(body,'#7ca69e',.29,.52,.17,.13,.16,.07);petBall(body,'#f4e7c9',.29,.55,.235,.10,.065,.012);petBall(body,'#d7b276',.29,.52,.254,.025,.025,.008);
  for(let i=0;i<3;i++)petBall(head,fur,(i-1)*.055,.315,.07,.045,.065,.04);
  for(const side of[-1,1]){const ear=new T.Group();ear.position.set(side*.37,.05,-.055);ear.rotation.z=-side*.1;ear.userData.restZ=ear.rotation.z;head.add(ear);ears.push(ear);petBall(ear,fur,side*.10,0,0,.24,.29,.08);petBall(ear,'#d5b8b9',side*.12,0,.06,.16,.21,.025);}
  trunk=new T.Group();trunk.position.set(0,-.10,.29);head.add(trunk);
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(0,-.13,.09),new T.Vector3(0,-.26,.15),new T.Vector3(.035,-.24,.26)]);
  mesh(trunk,geometry('baby-elephant-trunk',()=>new T.TubeGeometry(curve,14,.063,10,false)),fur,0,0,0);petBall(trunk,fur,.035,-.24,.26,.069,.058,.065);
 }
 return{trunk};
}
