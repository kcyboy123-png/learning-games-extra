import * as T from '../lib/three.module.min.js';
import {CELL,GROUND_Y,toWorld} from './grid.mjs?v=perf1';
import {SIZE,RIVER} from './data.mjs?v=perf1';
import {surfaceOptions} from './surfaces.mjs?v=perf1';
import {paintedTree} from './tree-art.mjs?v=perf1';
import {naturalFeature} from './landscape.mjs?v=perf1';

// All decorations sit beyond the original building grid. Switching islands never moves a saved plot.
export function createIslandScenery(world){
 const group=new T.Group();group.name='mist-island-scenery';world.scene.add(group);
 const island=new T.Group(),farIsland=new T.Group(),boat=new T.Group();
 island.name='mist-island';farIsland.name='island-on-horizon';boat.name='island-ferry';
 group.add(island,farIsland);world.scene.add(boat);boat.visible=false;
 const ownedGeometry=new Set(),ownedMaterial=new Set(),batches=new Map();
 const geo=g=>(ownedGeometry.add(g),g),material=o=>{const m=new T.MeshStandardMaterial({roughness:.88,...o});ownedMaterial.add(m);return m;};
 const solid=material({color:'#ffffff'}),water=material({color:'#69bab8',roughness:.43,metalness:.02,...surfaceOptions('#7cc5be')}),flow=material({color:'#85dfdc',emissive:'#4faaa9',emissiveIntensity:.28,side:T.DoubleSide,transparent:true,opacity:.84,roughness:.25,depthWrite:false});
 const box=geo(new T.BoxGeometry(1,1,1)),rock=geo(new T.IcosahedronGeometry(1,1)),leaf=geo(new T.SphereGeometry(1,10,7)),stem=geo(new T.CylinderGeometry(.7,1,1,8)),petal=geo(new T.IcosahedronGeometry(1,0));
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
 const artTrees=[],treeBatches=new Map(),treeMaps=new Map();
 function artTree(parent,x,z,size,tint='#eee4f9'){
  const pink=tint!=='#d3e4bb',key=parent.uuid+pink;
  if(!treeMaps.has(pink)){const tree=paintedTree(new T.Group(),0,0,1,pink,2);if(!tree)return;tree.traverse(o=>{if(o.userData.treeSprite)treeMaps.set(pink,o.material.map);});}
  if(!treeBatches.has(key))treeBatches.set(key,{parent,map:treeMaps.get(pink),parts:[]});
  treeBatches.get(key).parts.push({x,z,size,tint});
 }
 function finishTrees(){for(const {parent,map,parts}of treeBatches.values()){
  const positions=[],offsets=[],uvs=[],colors=[],indices=[];
  parts.forEach(({x,z,size,tint},i)=>{color.set(tint);for(const [u,v]of[[0,0],[1,0],[1,1],[0,1]]){positions.push(x,.105*size,z);offsets.push((u-.5)*2.8*size,(v-.004)*2.6*size);uvs.push(u,v);colors.push(color.r,color.g,color.b);}const n=i*4;indices.push(n,n+1,n+2,n,n+2,n+3);});
  const geometry=geo(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('billboardOffset',new T.Float32BufferAttribute(offsets,2));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeBoundingSphere();geometry.boundingSphere.radius+=Math.max(...parts.map(p=>p.size))*3;
  const m=new T.MeshBasicMaterial({map,vertexColors:true,alphaTest:.3,side:T.DoubleSide});ownedMaterial.add(m);
  // One draw per atlas frame; the GPU faces every canopy toward the camera without per-tree updates.
  m.onBeforeCompile=shader=>{shader.vertexShader='attribute vec2 billboardOffset;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','vec4 mvPosition=modelViewMatrix*vec4(transformed,1.0); mvPosition.xy+=billboardOffset*vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz)); gl_Position=projectionMatrix*mvPosition;');};m.customProgramCacheKey=()=> 'island-canopies-v1';
  const mesh=new T.Mesh(geometry,m);mesh.name='mist-painted-canopies';mesh.visible=!!map.image?.complete;parent.add(mesh);artTrees.push(mesh);
 }treeBatches.clear();}
 artTree(island,-9,-24.5,5,'#bbc1ff');
 artTree(island,-15.4,-25.2,2.1,'#eee0fa');
 for(const [x,z,size]of[[-24,-17,1.2],[-25,-9,1.5],[-25,1,1.2],[-25,12,1.4],[-23,21,1.1],[26,-14,1.3],[25,-22,1.3]])artTree(island,x,z,size,'#d3e4bb');
 for(let i=0;i<24;i++){
  const a=i*Math.PI*2/24,{x,z}=coastline(a,-2.2);
  if(Math.abs(x-rx)<3||x>5&&z<-20)continue;
  artTree(island,x,z,1.35+(i%4)*.28,i%3?'#f3dce6':'#d3e4bb');
 }
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
 crags.forEach(crag=>{crag[1]*=1.45;crag[4]*=1.45;});
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
 for(const [x,y,z,w,h]of[[25.8,4.35,-23.2,2.7,8.3],[25.1,.75,-21.7,2.8,1.5]]){
  const m=new T.Mesh(geo(new T.PlaneGeometry(w,h,4,8)),flow);m.position.set(x,y,z);m.rotation.set(-.065,.55,0);island.add(m);falls.push(m);
  add(island,leaf,'#e2f5e7',x,y-h/2+.07,z+.1,w*.65,.09,.4);
 }
 add(island,leaf,'#77c5c0',24,.09,-22.5,3,.045,2);
 add(island,leaf,'#e2f5e7',23.8,.16,-22.6,.85,.025,.32);
 // Flower banks are outside the buildable boundary, leaving the complete centre available.
 for(let i=0;i<210;i++){
  const a=i*2.399,{x,z}=coastline(a,-.7-(i%5)*.65);
  if(Math.abs(x-rx)<1.8||Math.abs(x)<extent&&Math.abs(z)<extent)continue;
  add(island,petal,'#81a47a',x,.18,z,.48,.19,.40);
  for(let j=0;j<5;j++)add(island,petal,['#f7d5e7','#fff0d1','#c8b4e8'][i%3],x+Math.sin(j*1.257)*.22,.37,z+Math.cos(j*1.257)*.22,.19,.07,.20);
  add(island,petal,'#e8d58d',x,.41,z,.09,.035,.09);
 }
 // Match the real coastline and landmarks at a distance, without loading a second town.
 farIsland.position.set(34,-.1,-38);farIsland.scale.setScalar(.42);
 const outline=new T.Shape();for(let i=0;i<120;i++){const {x,z}=coastline(i*Math.PI*2/120);i?outline.lineTo(x,z):outline.moveTo(x,z);}outline.closePath();
 const shore=surface(farIsland,outline,'#e2d3b1',-.12);shore.scale.set(1.025,1,1.025);
 surface(farIsland,outline,'#a4bf7b',GROUND_Y-.025);
 artTree(farIsland,-9,-24.5,5,'#bbc1ff');artTree(farIsland,-15.4,-25.2,2.1,'#eee0fa');
 for(let i=0;i<24;i++){const a=i*Math.PI*2/24,{x,z}=coastline(a,-2.2);if(Math.abs(x-rx)<3||x>5&&z<-20)continue;artTree(farIsland,x,z,1.35+(i%4)*.28,i%3?'#f3dce6':'#d3e4bb');}
 for(let x=2;x<SIZE;x++)for(let y=0;y<SIZE;y++){
  const feature=naturalFeature(x,y);if(!feature)continue;const p=toWorld(x,y);
  if(feature==='tree')artTree(farIsland,p.x,p.z,1.2+(x%3)*.18,(x+y)%3?'#f3dce6':'#d3e4bb');
  for(let j=0;j<3;j++)add(farIsland,petal,j%2?'#c8b6e5':'#f3d7df',p.x+Math.sin(j*2.4)*.7,.25,p.z+Math.cos(j*2.4)*.7,.4,.1,.35);
 }
 crags.forEach(([x,y,z,sx,sy,sz,angle],i)=>{add(farIsland,rock,'#a8b2a7',x,y,z,sx,sy,sz,0,angle);add(farIsland,petal,'#91b079',x,y+sy*.7,z,sx*.8,.25,sz*.8);});
 for(let i=0;i<20;i++)add(farIsland,petal,'#8bcac1',rx,.11,-27+i*2.8,1.3,.025,2.2);
 for(let i=0;i<90;i++){const a=i*2.399,{x,z}=coastline(a,-1.2-(i%4)*.65);if(Math.abs(x-rx)<2)continue;add(farIsland,petal,'#82a967',x,.18,z,.7,.13,.6);for(let j=0;j<3;j++)add(farIsland,petal,['#f7d7e2','#fff0c4','#d9c4ed'][i%3],x+Math.cos(j*2.1)*.3,.37,z+Math.sin(j*2.1)*.3,.3,.08,.3);}
 for(const fall of falls){const copy=fall.clone();farIsland.add(copy);}add(farIsland,petal,'#9fdbd0',24,.12,-22.5,3.2,.04,2.1);
 for(const parent of[island,farIsland])for(const [x,z]of[[-18,-24],[-4,-25],[20,-24]])for(let i=0;i<4;i++)add(parent,rock,i%2?'#c6dbea':'#bfafd9',x+(i-1.5)*.55,.55+(i%2)*.25,z+Math.sin(i)*.45,.32,.75+(i%2)*.25,.3,.15,i*.7,.1);
 const waterPixels=new Uint8Array(64*128*4);
 for(let y=0;y<128;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=.6+.4*Math.sin(x*.83+Math.sin(y*.15)*.45)**2;waterPixels[i]=190+v*65;waterPixels[i+1]=232+v*23;waterPixels[i+2]=225+v*30;waterPixels[i+3]=(Math.sin(x/63*Math.PI)**.35)*v*245;}
 const fallsTexture=new T.DataTexture(waterPixels,64,128);fallsTexture.wrapT=T.RepeatWrapping;fallsTexture.needsUpdate=true;flow.map=fallsTexture;flow.needsUpdate=true;
 const mist=new T.Group();mist.name='island-discovery-mist';farIsland.add(mist);
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(Math.max(0,1-r*r)**2*235);}
 const mistTexture=new T.DataTexture(pixels,64,64);mistTexture.needsUpdate=true;
 const mistMaterial=new T.SpriteMaterial({map:mistTexture,color:'#dfdcf6',transparent:true,opacity:.82,depthWrite:false});ownedMaterial.add(mistMaterial);
 const sprayMaterial=new T.SpriteMaterial({map:mistTexture,color:'#e9e3fa',transparent:true,opacity:.22,depthWrite:false});ownedMaterial.add(sprayMaterial);
 for(const parent of[island,farIsland])for(const [x,y,z,w,h]of[[-9,.6,-23,16,4],[25,1,-21,9,4]]){const spray=new T.Sprite(sprayMaterial);spray.position.set(x,y,z);spray.scale.set(w,h,1);parent.add(spray);}
 for(let i=0;i<8;i++){const cloud=new T.Sprite(mistMaterial);cloud.position.set((i%4-1.5)*11,2.5+Math.floor(i/4)*4,5+Math.floor(i/4)*6);cloud.scale.set(36,14,1);mist.add(cloud);}

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
 finish();finishTrees();
 let active=false,disposed=false,ferryPromise=null,ferryModel=null,ferryDisposer=null,harborReady=false,mistAmount=1,lastMistTime=null;
 function setHarborReady(ready,immediate=false){ready=!!ready;const discovered=ready&&!harborReady;harborReady=ready;if(immediate||!ready)mistAmount=ready?0:1;mist.visible=mistAmount>0;mistMaterial.opacity=mistAmount*.82;return discovered&&!immediate;}
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
  const dt=lastMistTime===null?0:Math.max(0,Math.min(.25,time-lastMistTime));lastMistTime=time;
  if(harborReady)mistAmount=reduced?0:Math.max(0,mistAmount-dt/6);
  mist.visible=mistAmount>0;mistMaterial.opacity=mistAmount*.82;
  if(mist.visible){mist.position.x=reduced?0:Math.sin(t*.18)*.6;mist.scale.setScalar(1+(1-mistAmount)*.5);}
  for(const tree of artTrees)if(!tree.visible&&tree.material.map?.image?.complete)tree.visible=true;
  flow.opacity=.86+Math.sin(t*1.5)*.035;fallsTexture.offset.y=reduced?0:-t*.16;
  if(boat.visible){body.rotation.z=Math.sin(t*1.7)*.017;body.rotation.x=Math.sin(t*1.1)*.012;body.position.y=Math.sin(t*1.3)*.025;wake.material.opacity=reduced?.35:.35+Math.sin(t*2)*.08;}
 }
 function dispose(){if(disposed)return;disposed=true;ferryDisposer?.(ferryModel);ferryModel=null;group.removeFromParent();boat.removeFromParent();group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});boat.traverse(o=>{if(o.isInstancedMesh)o.dispose();});for(const g of ownedGeometry)g.dispose();for(const m of ownedMaterial)m.dispose();mistTexture.dispose();fallsTexture.dispose();}
 setIsland(false);
 return {group,island,farIsland,mist,boat,passenger,falls,setIsland,setHarborReady,tick,loadFerry,dispose};
}
