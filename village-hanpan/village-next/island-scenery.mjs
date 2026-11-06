import * as T from '../lib/three.module.min.js';
import {CELL,GROUND_Y,toWorld} from './grid.mjs?v=perf1';
import {SIZE,RIVER} from './data.mjs?v=perf1';
import {surfaceOptions} from './surfaces.mjs?v=perf1';
import {paintedTree} from './tree-art.mjs?v=perf1';

// All decorations sit beyond the original building grid. Switching islands never moves a saved plot.
export function createIslandScenery(world){
 const group=new T.Group();group.name='mist-island-scenery';world.scene.add(group);
 const island=new T.Group(),farIsland=new T.Group(),boat=new T.Group();
 island.name='mist-island';farIsland.name='island-on-horizon';boat.name='island-ferry';
 group.add(island,farIsland);world.scene.add(boat);boat.visible=false;
 const ownedGeometry=new Set(),ownedMaterial=new Set(),batches=new Map();
 const geo=g=>(ownedGeometry.add(g),g),material=o=>{const m=new T.MeshStandardMaterial({roughness:.88,...o});ownedMaterial.add(m);return m;};
 const solid=material({color:'#ffffff'}),water=material({color:'#69bab8',roughness:.43,metalness:.02,...surfaceOptions('#7cc5be')}),flow=material({color:'#c7eee4',transparent:true,opacity:.84,roughness:.25,depthWrite:false});
 const box=geo(new T.BoxGeometry(1,1,1)),rock=geo(new T.IcosahedronGeometry(1,1)),leaf=geo(new T.SphereGeometry(1,10,7)),stem=geo(new T.CylinderGeometry(.7,1,1,8)),petal=geo(new T.SphereGeometry(1,6,4));
 const dummy=new T.Object3D(),color=new T.Color();
 function add(parent,shape,c,x,y,z,sx=1,sy=sx,sz=sx,rx=0,ry=0,rz=0){
  const key=parent.uuid+shape.uuid;let list=batches.get(key);if(!list){list={parent,shape,parts:[]};batches.set(key,list);}list.parts.push({c,x,y,z,sx,sy,sz,rx,ry,rz});
 }
 function finish(){for(const {parent,shape,parts}of batches.values()){
  const m=new T.InstancedMesh(shape,solid,parts.length);m.name='island-batched-details';
  parts.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(p.rx,p.ry,p.rz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,color.set(p.c));});
  m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.receiveShadow=true;m.castShadow=false;parent.add(m);
 }batches.clear();}
 function surface(parent,shape,c,y){const g=geo(new T.ShapeGeometry(shape,16));g.rotateX(-Math.PI/2);const m=new T.Mesh(g,material({color:c,...(typeof document!=='undefined'&&c==='#a4bf7b'?surfaceOptions('#9cbd6e'):{})}));m.position.y=y;m.receiveShadow=true;parent.add(m);return m;}
 const extent=SIZE*CELL/2,rx=toWorld(RIVER,0).x;
 function coastline(a,lip=0){const cs=Math.cos(a),sn=Math.sin(a),wave=1+.025*Math.sin(a*5)+.015*Math.sin(a*9+.4);return{x:Math.sign(cs)*Math.sqrt(Math.abs(cs))*(extent+7.2+lip)*wave,z:Math.sign(sn)*Math.sqrt(Math.abs(sn))*(extent+6+lip)*wave};}
 function landShape(left,right){
  const points=Array.from({length:120},(_,i)=>coastline(i*Math.PI*2/120,left<-extent-.3?.25:0));
  const clip=(pts,bound,less)=>{const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ai=less?a.x<=bound:a.x>=bound,bi=less?b.x<=bound:b.x>=bound;if(ai)out.push(a);if(ai!==bi){const t=(bound-a.x)/(b.x-a.x);out.push({x:bound,z:a.z+(b.z-a.z)*t});}}return out;};
  const poly=left<0?clip(points,right,true):clip(points,left,false),shape=new T.Shape();poly.forEach((p,i)=>i?shape.lineTo(p.x,p.z):shape.moveTo(p.x,p.z));shape.closePath();return shape;
 }
 const sea=new T.Mesh(geo(new T.PlaneGeometry(240,240)),water);sea.rotation.x=-Math.PI/2;sea.position.y=-.67;island.add(sea);
 for(const [left,right]of[[-extent-.3,rx-CELL/2],[rx+CELL/2,extent+.3]]){
  surface(island,landShape(left-.15,right+.15),'#e2d3b1',-.12);
  surface(island,landShape(left,right),'#a4bf7b',GROUND_Y-.025);
 }
 // A clear stream continues the existing bridges, waterfront rules and footpaths.
 add(island,box,'#cfceb0',rx,-.80,0,CELL,.12,extent*2+5);
 for(let i=0;i<100;i++){
  const angle=i*Math.PI*2/100,{x,z}=coastline(angle,-.15),size=.3+(i%5)*.10;
  if(Math.abs(x-rx)<1.7)continue;
  add(island,rock,['#c5c7bd','#e2d7cc','#bcc6c2','#c9bdd1'][i%4],x,-.16,z,size,.18+size*.3,size*.7,0,angle,.1);
 }
 for(let i=0;i<76;i++){const side=i%2?1:-1,z=-extent+1+Math.floor(i/2)*(extent*2-2)/38;add(island,rock,i%3?'#c5c9b5':'#b2bbaa',rx+side*1.28,-.09,z,.23,.17,.37,0,i*.8);}
 // Reuse the established painted canopy rather than replacing it with geometric spheres.
 const artTrees=[];
 function artTree(parent,x,z,size,tint='#eee4f9'){
  const tree=paintedTree(parent,x,z,size,tint!=='#d3e4bb',2);if(!tree)return;
  tree.name='mist-painted-tree';tree.traverse(o=>{
   if(o.userData.treeSprite){const m=o.material.clone();m.color.set(tint);ownedMaterial.add(m);o.material=m;delete o.userData.treeSprite;o.userData.islandTreeSprite=true;artTrees.push(o);}
   // The painted artwork already includes volume. Reuse the small shadow rig only in shadow passes.
   if(o.userData.treeShadow){o.visible=false;}
  });return tree;
 }
 artTree(island,-9,-24.5,3.6,'#d5c5ff');
 artTree(island,-15.4,-25.2,2.1,'#eee0fa');
 for(const [x,z,size]of[[-24,-17,1.2],[-25,-9,1.5],[-25,1,1.2],[-25,12,1.4],[-23,21,1.1],[26,-14,1.3],[25,-22,1.3]])artTree(island,x,z,size,'#d3e4bb');
 // An asymmetric weathered cliff wraps the cave; moss grows in patches, never in flat terraces.
 const cliff=geo(new T.SphereGeometry(1,12,8)),cp=cliff.attributes.position;
 for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i),z=cp.getZ(i),r=1+.10*Math.sin(x*7+y*4)*Math.cos(z*6-y*3);cp.setXYZ(i,x*r,y*r,z*r);}cliff.computeVertexNormals();
 const crags=[
  [9.8,.65,-26,2.4,1.3,2.2,.15],[16.6,.7,-26.2,3.1,1.5,2.4,-.2],
  [9.8,2,-26.9,2.1,2,1.7,-.25],[16.3,2.3,-27.5,2.5,2.5,2.1,.4],
  [10.2,3.3,-27.6,2.7,1.6,2.4,.17],[13.6,3.9,-28.2,3,1.7,2.6,-.13],
  [17.8,3.6,-28.9,2.4,2,2.3,.3],[19.6,1,-26.4,2.5,1.5,2.4,.1],
  [22.5,1.1,-26.3,2.7,1.7,2,.25],[24.7,2.9,-27.1,2.4,2.1,2.2,-.2],
  [25.1,5,-28,2.0,1.7,2.0,.15],[22.8,4.3,-28.1,1.7,1.6,1.7,-.2]
 ];
 crags.forEach(([x,y,z,sx,sy,sz,angle],i)=>{
  add(island,cliff,['#a8b2a7','#b6bdb0','#9da99e','#c0c4b6'][i%4],x,y,z,sx,sy,sz,.08*Math.sin(i),angle,.07*Math.cos(i));
  for(let j=0;j<3;j++)add(island,leaf,['#819d70','#9bb283','#aec191'][j],x+(j-1)*sx*.44,y+sy*.72,z+sz*.18,.7+sx*.22,.19,sz*.42,0,angle+j*.7,.1);
 });
 const mouth=new T.Shape();mouth.moveTo(-1.9,0);mouth.lineTo(-1.8,1.4);mouth.quadraticCurveTo(-.9,2.5,.5,2.3);mouth.quadraticCurveTo(1.8,2,2,0);mouth.closePath();
 const mouthMesh=new T.Mesh(geo(new T.ShapeGeometry(mouth,9)),material({color:'#3e5952'}));mouthMesh.position.set(12,0,-24.6);island.add(mouthMesh);
 for(let i=0;i<42;i++){
  const x=7+(i%14)*1.3,z=-24.2-Math.floor(i/14)*1.05,y=i<14?.1:3.5+(i%4)*.21;
  if(i<14&&x>10&&x<14)continue;
  for(let j=0;j<5;j++){const a=j*1.25+i;add(island,petal,['#769965','#96ae79','#b2c38c'][j%3],x+Math.sin(a)*.25,y+.10+j*.04,z+Math.cos(a)*.26,.18,.07,.42,-.3,a,.18);}
 }
 for(let i=0;i<23;i++){
  const x=7.8+i*.63,y=3.8-(i%3)*.18,z=-25.4;
  for(let j=0;j<5;j++){const side=j%2?-1:1;add(island,petal,j%2?'#87a36c':'#b1c38c',x+side*.12+Math.sin(j*.8+i)*.1,y-j*.30,z+j*.06,.16,.23,.08,.1,side*.3,side*.5);}
 }
 const falls=[];
 for(const [x,y,z,w,h]of[[23.8,3.1,-22.8,1.25,5.8],[22.4,.75,-21.7,1.9,1.5]]){
  const m=new T.Mesh(geo(new T.PlaneGeometry(w,h,4,8)),flow);m.position.set(x,y,z);m.rotation.x=-.065;island.add(m);falls.push(m);
  add(island,leaf,'#e2f5e7',x,y-h/2+.07,z+.1,w*.65,.09,.4);
 }
 add(island,leaf,'#77c5c0',24,.09,-22.5,3,.045,2);
 add(island,leaf,'#e2f5e7',23.8,.16,-22.6,.85,.025,.32);
 // Flower banks are outside the buildable boundary, leaving the complete centre available.
 for(let i=0;i<120;i++){
  const a=i*2.399,{x,z}=coastline(a,-.6-(i%3)*.3);
  if(Math.abs(x-rx)<1.8||Math.abs(x)<extent&&Math.abs(z)<extent)continue;
  add(island,leaf,'#81a47a',x,.18,z,.37,.19,.30);
  for(let j=0;j<4;j++)add(island,petal,['#f2d9e6','#fff0d1','#c9bfdd'][i%3],x+Math.sin(j*1.57)*.12,.36,z+Math.cos(j*1.57)*.12,.105,.045,.11);
  add(island,petal,'#e8d58d',x,.39,z,.055,.025,.055);
 }
 // Distant land is only a silhouette; it never simulates a second village.
 farIsland.position.set(0,-.1,-64);farIsland.scale.setScalar(.62);
 add(farIsland,leaf,'#8fab9a',0,-.9,0,16,1.3,10);
 add(farIsland,leaf,'#a8bd98',0,0,0,14,.6,9);
 add(farIsland,stem,'#ac9a8a',-3,2,0,.5,4,.5);
 for(let i=0;i<8;i++)add(farIsland,leaf,['#c0b8cd','#dbc8d8','#c9bfd2'][i%3],-3+Math.sin(i*2.4)*2.4,4.5+(i%3)*.2,Math.cos(i*2.4)*2.2,2,1.5,2);
 add(farIsland,rock,'#a5b8ae',8,1,-3,3,2.8,3);

 // Ferry points along local +Z. Passenger anchor is separate from batched cabin geometry.
 const body=new T.Group();body.name='ferry-body';boat.add(body);
 const hullShape=new T.Shape();hullShape.moveTo(-1.15,-1.7);hullShape.quadraticCurveTo(-1.3,.7,0,2.3);hullShape.quadraticCurveTo(1.3,.7,1.15,-1.7);hullShape.quadraticCurveTo(0,-2,-1.15,-1.7);
 const hg=geo(new T.ExtrudeGeometry(hullShape,{depth:.65,bevelEnabled:true,bevelSize:.15,bevelThickness:.12,bevelSegments:2,steps:1,curveSegments:10}));hg.rotateX(-Math.PI/2);hg.rotateY(Math.PI);
 const hull=new T.Mesh(hg,material({color:'#9a704f'}));hull.position.y=-.45;body.add(hull);
 const dg=geo(new T.ShapeGeometry(hullShape,10));dg.rotateX(-Math.PI/2);dg.rotateY(Math.PI);const deck=new T.Mesh(dg,material({color:'#d6b684'}));deck.position.y=.23;body.add(deck);
 for(let i=0;i<10;i++)add(body,box,'#b69669',0,.25,-1.55+i*.31,1.8,.035,.022);
 for(const x of[-.95,.95])for(const z of[-1.35,.95])add(body,stem,'#a78459',x,1.14,z,.055,1.8,.055);
 for(const x of[-1.04,1.04]){add(body,box,'#b39464',x,.64,-.25,.07,.09,2.8);add(body,box,'#c0a373',x,.47,-.25,.05,.06,2.8);}
 const canopyShape=new T.Shape();canopyShape.moveTo(-1.14,0);canopyShape.quadraticCurveTo(0,.95,1.14,0);canopyShape.lineTo(1.14,-.07);canopyShape.quadraticCurveTo(0,.88,-1.14,-.07);canopyShape.closePath();
 const cg=geo(new T.ExtrudeGeometry(canopyShape,{depth:2.6,bevelEnabled:false,curveSegments:12}));cg.translate(0,0,-1.55);
 const canopy=new T.Mesh(cg,material({color:'#fff0cf',side:T.DoubleSide}));canopy.position.y=1.95;body.add(canopy);
 for(const z of[-1.4,.9])add(body,box,'#c2a473',0,.55,z,1.65,.16,.35);
 for(const x of[-.68,.68])add(body,rock,'#f2dfb2',x,.79,1.48,.15,.19,.13);
 const passenger=new T.Group();passenger.name='ferry-passenger-anchor';passenger.position.set(0,.26,.2);body.add(passenger);boat.userData.passenger=passenger;
 const wake=new T.Mesh(geo(new T.RingGeometry(.7,1,28,1,0,Math.PI)),material({color:'#c5e9dc',transparent:true,opacity:.45,side:T.DoubleSide,depthWrite:false}));wake.rotation.set(-Math.PI/2,0,Math.PI);wake.position.set(0,-.48,-1.4);wake.scale.set(1.4,2.8,1);boat.add(wake);
 finish();
 let active=false,disposed=false,ferryPromise=null,ferryModel=null,ferryDisposer=null;
 const fallbackParts=body.children.filter(o=>o!==passenger);
 // The 1.6 MB asset and official loader are fetched only after the travel UI requests them.
 function loadFerry(){
  if(disposed)return Promise.resolve(false);if(ferryModel)return Promise.resolve(true);if(ferryPromise)return ferryPromise;
  ferryPromise=import('./ferry-model.mjs').then(async ({loadTripoFerry,disposeFerry})=>{
   const model=await loadTripoFerry();if(disposed){disposeFerry(model);return false;}
   ferryModel=model;ferryDisposer=disposeFerry;body.add(model);for(const part of fallbackParts)part.visible=false;
   passenger.position.set(0,-.24,.3);boat.userData.ferrySource='tripo';delete boat.userData.ferryError;return true;
  }).catch(()=>{ferryPromise=null;boat.userData.ferryError='배 모델을 불러오지 못해 기본 배를 사용해요.';return false;});
  return ferryPromise;
 }
 function setIsland(value){active=!!value;island.visible=active;farIsland.visible=!active;}
 function tick(time,reduced=false){if(disposed)return;const t=reduced?0:time;
  for(const tree of artTrees)if(!tree.visible&&tree.material.map?.image?.complete)tree.visible=true;
  if(active)flow.opacity=.80+Math.sin(t*1.5)*.045;
  if(boat.visible){body.rotation.z=Math.sin(t*1.7)*.017;body.rotation.x=Math.sin(t*1.1)*.012;body.position.y=Math.sin(t*1.3)*.025;wake.material.opacity=reduced?.35:.35+Math.sin(t*2)*.08;}
 }
 function dispose(){if(disposed)return;disposed=true;ferryDisposer?.(ferryModel);ferryModel=null;group.removeFromParent();boat.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});boat.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of ownedGeometry)g.dispose();for(const m of ownedMaterial)m.dispose();}
 setIsland(false);
 return {group,island,farIsland,boat,passenger,falls,setIsland,tick,loadFerry,dispose};
}
