import {postEntrancePose} from './post-entrance.mjs?v=encore-20261119';
import {strollRouter} from './stroll-route.mjs?v=encore-20261119';
import {meadowFloor,meadowStep} from './meadow-walk.mjs?v=encore-20261119';
import {groundVector,inputVector,stickVector,PLAYER_SPEED} from './village/move.mjs';
import {World} from './village/world.mjs?v=reference-camera-20261115';
import {postGarden} from './post-garden.mjs?v=encore-20261119';
import {deliveryGarden} from './delivery-garden.mjs?v=optimization-20-20261118';
import * as T from './lib/three.module.min.js';
import {developedVillage} from './village/qa-developed.mjs';
import {enableCozy,canBuild} from './village/core.mjs';
import {toWorld,walkable} from './village/grid.mjs';
import {seedDokdo} from './village/dokdo-layout.mjs';
import {cliffSites,gardenSites,walkRoute,walkHeight,walkStep,walkNodes,walkEdges} from './village/dokdo-terrain.mjs';
import {createIslandScenery} from './village/dokdo-scenery.mjs';
import {ferryPose} from './village/islands.mjs';
import {applyEntrancePose,voyagePose} from './village/entrance-camera.mjs';
export const STOPS={start:[7,12],r0:[7,11],r1:[5,7],r2:[9,5],r3:[13,10],r4:[15,13],r5:[13,15],P:[9,11],H:[12,16]};
export const DOCKS={A:{x:9,y:.27,z:15.1},B:{...toWorld(14,12),y:2.3},C:{...toWorld(6,12),y:3.4}};
const LANES=[[[5,7],[7,7],[7,12]],[[7,11],[13,11],[13,15],[12,15],[12,16]],[[9,5],[9,7],[7,7]],[[13,10],[13,11]],[[13,13],[15,13]]];
export function baseline(){
 const s=enableCozy(developedVillage());s.money=30000000;s.populationPeak=40;s.paused=false;s.postNature=true;s.buildings=[];s.nextId=1;s.landscape.cleared=[];
 const add=(type,x,y)=>s.buildings.push({id:s.nextId++,type,x,y,opts:[],progress:1,starter:false,completedAt:0});
 const roads=new Set();for(const line of LANES)for(let i=1;i<line.length;i++){let [x,y]=line[i-1];const [tx,ty]=line[i];roads.add(x+','+y);while(x!==tx||y!==ty){x+=Math.sign(tx-x);y+=Math.sign(ty-y);roads.add(x+','+y);}}
 for(const k of roads){const [x,y]=k.split(',').map(Number);add(x===11?'bridge':'road',x,y);}
 for(const [x,y]of [[4,6],[9,3],[16,10],[15,16],[9,10],[6,10],[6,8]])add('house',x,y);
 for(const [x,y]of [[3,4],[4,3],[5,4],[6,3],[6,5],[3,9],[4,9],[3,11],[4,12],[4,14],[5,16],[8,2],[10,2],[10,4],[14,3],[15,4],[16,5],[14,7],[16,8],[17,15],[15,15],[14,18]])add('tree',x,y);
 // Small woodland pockets leave the delivery lanes and cottage doors open.
 for(const [x,y]of [[5,11],[8,8],[14,8],[17,12]])add('tree',x,y);
 for(const [x,y]of [[5,6],[8,5],[14,10],[14,14]])add('bench',x,y);
 // Clear natural obstacles along walkable lanes, leaving the original shoreline woodland intact.
 for(const k of roads)s.landscape.cleared.push(k);
 for(const q of [[5,10],[5,13],[6,14],[10,13],[16,14],[14,16]])s.landscape.cleared.push(q.join(','));
 for(const b of s.buildings)s.landscape.cleared.push(b.x+','+b.y);
 const d={...structuredClone(s),...seedDokdo(s),island:'mist',dokdoV:1};
 for(const [type,sites]of Object.entries(cliffSites)){const [x,y]=sites[0];d.buildings.push({id:d.nextId++,type,x,y,opts:[],progress:1,starter:false,completedAt:0});}
 for(const type of ['dokdoFlag','dokdoSedum','dokdoFlower']){const q=gardenSites.find(([x,y])=>!canBuild(d,type,x,y));if(q)d.buildings.push({id:d.nextId++,type,x:q[0],y:q[1],opts:[],progress:1,starter:false,completedAt:0});}
 return {main:s,mist:d};
}
export function createScene(canvas,onArrive){
 const dialog=document.getElementById('dialog'),stickKnob=document.getElementById('stickKnob');
 const maps=baseline(),canStand=meadowFloor(maps.main),world=new World(canvas),scenery=createIslandScenery(world);scenery.setHarborReady(true,true);scenery.boat.scale.setScalar(.72);scenery.loadFerry();
 const stroll=strollRouter(canStand);let clickRoute=[],stalled=0;
 let carriedLook='',parcelRibbon,parcelStamp;
 function setParcelLook(look){
  if(look.dims){const {x,y,z}=look.dims,m=Math.max(x,y,z);world.player.carry.scale.set(x/m*1.15,y/m,z/m*1.92);world.player.carry.userData.dimensions={x,y,z};}
  const colors={leaf:'#78996a',sea:'#689da9',rose:'#b98386'},symbols={leaf:'❧',wave:'≈',star:'★'},ribbon=colors[look.ribbon]?look.ribbon:'leaf',stamp=symbols[look.stamp]?look.stamp:'leaf',key=ribbon+stamp;if(key===carriedLook)return;carriedLook=key;
  if(!parcelRibbon){parcelRibbon=new T.Mesh(new T.BoxGeometry(.035,.235,.126),new T.MeshStandardMaterial({color:colors[ribbon],roughness:1}));parcelRibbon.position.set(0,-.42,.02);world.player.carry.add(parcelRibbon);parcelStamp=new T.Mesh(new T.PlaneGeometry(.064,.07),new T.MeshStandardMaterial({roughness:1,side:T.DoubleSide}));parcelStamp.position.set(.058,-.45,.084);world.player.carry.add(parcelStamp);}
  parcelRibbon.material.color.set(colors[ribbon]);const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#fff4d5';c.fillRect(0,0,96,96);c.strokeStyle='#8d956d';c.lineWidth=5;c.setLineDash([8,5]);c.strokeRect(4,4,88,88);c.fillStyle='#47684e';c.font='bold 65px sans-serif';c.textAlign='center';c.fillText(symbols[stamp],48,72);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;parcelStamp.material.map?.dispose();parcelStamp.material.map=texture;parcelStamp.material.needsUpdate=true;world.player.carry.userData.look={ribbon,stamp};
 }
 const discoveryPoint=new T.Vector3();
 let discoveryEffect=null;
 function clearDiscovery(){if(!discoveryEffect)return;const g=discoveryEffect.g;world.scene.remove(g);const geometries=new Set(),materials=new Set();g.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());discoveryEffect=null;}
 function discover(id){
  clearDiscovery();const g=new T.Group(),p=world.player.g.position;g.name='postal-discovery';g.position.copy(p);g.position.y+=1.2;world.scene.add(g);
  const color=id==='butterfly'?'#efd795':id==='sea'?'#b9e5e0':'#ffe6a2';
  const geometry=new T.SphereGeometry(.1,10,6),material=new T.MeshStandardMaterial({color,roughness:.8,emissive:id==='light'?color:'#000000',emissiveIntensity:.35});
  for(let i=0;i<(id==='butterfly'?4:3);i++){const m=new T.Mesh(geometry,material);if(id==='butterfly'){m.scale.set(1.2,.3,1.9);m.position.set(i%2?.13:-.13,0,i<2?-.12:.12);}else{m.scale.set(id==='sea'?3:1,.3,1);m.position.set((i-1)*.45,i*.15,0);}g.add(m);}
  if(id==='butterfly'){const body=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshStandardMaterial({color:'#887256',roughness:1}));body.scale.set(.7,.7,5);g.add(body);}
  discoveryEffect={g,id,start:performance.now(),baseY:g.position.y};
 }
 function tickDiscovery(now,dt){if(!discoveryEffect)return;const {g,id,start}=discoveryEffect,t=(now-start)/1000;if(t>7){clearDiscovery();return;}if(reduced)return;if(id==='butterfly'){const p=world.player.g.position;g.position.lerp(discoveryPoint.set(p.x+.45+Math.sin(t*2)*.2,p.y+1.35+Math.sin(t*3)*.12,p.z+.3),1-Math.exp(-dt*2.14));for(let i=0;i<4;i++)g.children[i].rotation.z=Math.sin(t*14)*(i%2?1:-1)*.5;}else{g.rotation.y=t*.5;g.position.y=discoveryEffect.baseY+Math.sin(t*3)*.04;g.children.forEach((dot,i)=>dot.scale.y=.3+Math.sin(t*3+i)*.12);}}
 const npcs=Array.from({length:6},(_,i)=>world.person('#9c8867',String.fromCharCode(97+i)));
 const cart=new T.Group();world.scene.add(cart);
 const cartMaterials=new Map();
 function box(x,y,z,w,h,d,color){if(!cartMaterials.has(color))cartMaterials.set(color,new T.MeshStandardMaterial({color,roughness:.9}));const m=new T.Mesh(new T.BoxGeometry(w,h,d),cartMaterials.get(color));m.position.set(x,y,z);m.castShadow=true;cart.add(m);}
 // A small side packing table leaves the cottage roof and front door visible.
 box(0,.67,0,1.05,.10,.62,'#b4966e');for(const x of [-.43,.43])for(const z of [-.24,.24])box(x,.34,z,.065,.68,.065,'#927750');
 for(const x of [-.52,.52])box(x,.88,-.28,.055,1.65,.055,'#b79b72');
 for(let i=0;i<6;i++){
  const color=i%2?'#eee5cd':'#a6b69a';box(-.55+i*.22,1.72,-.04,.22,.075,.86,color);
  const hem=new T.Mesh(new T.CylinderGeometry(.11,.11,.035,16,1,false,0,Math.PI),new T.MeshStandardMaterial({color,roughness:1}));hem.rotation.x=Math.PI/2;hem.rotation.z=Math.PI;hem.position.set(-.55+i*.22,1.69,.40);cart.add(hem);
 }

 // A roll and tied paper stack make the outdoor counter recognisably a packing place.
 const roll=new T.Mesh(new T.CylinderGeometry(.085,.085,.38,12),new T.MeshStandardMaterial({color:'#eadab7',roughness:1}));roll.rotation.z=Math.PI/2;roll.position.set(-.24,.81,.02);cart.add(roll);
 box(-.25,.89,.02,.065,.015,.17,'#a2b39a');
 box(.24,.87,0,.28,.28,.3,'#c5ab80');box(.24,1.015,0,.07,.012,.3,'#9bad8b');
 const p=toWorld(...STOPS.P);cart.position.set(p.x+1.15,.1,p.z-2.0);
 const postalGarden=postGarden(STOPS);world.scene.add(postalGarden);
 const naturePaths=new T.Group();world.scene.add(naturePaths);
 const dirt=new T.MeshStandardMaterial({color:'#c6ae79',roughness:1});
 // Visual bends stay on walkable grass; the existing route and bridge rules still guide walking.
 for(const lane of LANES){
  const curve=new T.CatmullRomCurve3(lane.map(c=>{const p=toWorld(...c);return new T.Vector3(p.x,.144,p.z);}),false,'centripetal');
  const points=curve.getPoints(100),positions=[];
  const edges=points.map((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,n=Math.hypot(dx,dz)||1;return [[p.x-dz/n*.48,p.z+dx/n*.48],[p.x+dz/n*.48,p.z-dx/n*.48]];});
  for(let i=1;i<points.length;i++){const corners=[...edges[i-1],...edges[i]];for(const k of [0,2,1,1,2,3])positions.push(corners[k][0],.144,corners[k][1]);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();naturePaths.add(new T.Mesh(geometry,dirt));
 }
 // Small mail details identify the post office without covering the resident.
 box(-.72,.35,.15,.07,.7,.07,'#8a7659');box(-.72,.8,.15,.32,.38,.3,'#ad6957');box(-.72,.86,.31,.22,.035,.018,'#694d40');
 for(let i=0;i<3;i++)box(-.22,.75+i*.025,.06,.24,.018,.16,'#f5ecd5');
 box(1.05,.28,-.08,.65,.08,.32,'#ad9671');for(const x of [.8,1.3])box(x,.14,-.08,.06,.28,.25,'#937c5c');
 const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const ink=signCanvas.getContext('2d');ink.fillStyle='#f5e8c7';ink.fillRect(0,0,512,128);ink.fillStyle='#496b56';ink.font='bold 48px sans-serif';ink.textAlign='center';ink.fillText('도토리 우체국',256,82);const sign=new T.Mesh(new T.PlaneGeometry(1.0,.25),new T.MeshStandardMaterial({map:new T.CanvasTexture(signCanvas),side:T.DoubleSide}));sign.position.set(0,1.50,.39);cart.add(sign);
 // A quiet stone lane joins the cottages; the existing grass paths remain free to walk.
 const start=toWorld(7,11),end=toWorld(10,11),stoneGeo=new T.BoxGeometry(.44,.035,.43),stoneColors=['#d5ceb8','#dcd4be','#cfc7b1'].map(color=>new T.MeshStandardMaterial({color,roughness:1}));
 for(let i=0;i<=16;i++)for(let j=-1;j<=1;j++){const m=new T.Mesh(stoneGeo,stoneColors[(i+j+3)%3]);m.position.set(start.x+i*.45,.16,start.z+j*.46);m.receiveShadow=true;naturePaths.add(m);}
 for(const [gx,gy]of [[6,10],[6,8],[9,10]]){const q=toWorld(gx,gy);for(let i=0;i<3;i++){const m=new T.Mesh(stoneGeo,stoneColors[i]);m.position.set(q.x+(gx===6?.9+i*.45:0),.16,q.z+(gx===6?0:.9+i*.45));m.receiveShadow=true;naturePaths.add(m);}}
 // Identical paving keeps its original material and shadow flags with fewer draw calls.
 for(const material of stoneColors){
  const tiles=naturePaths.children.filter(m=>m.geometry===stoneGeo&&m.material===material);
  const batch=new T.InstancedMesh(stoneGeo,material,tiles.length);batch.receiveShadow=true;
  tiles.forEach((tile,i)=>{tile.updateMatrix();batch.setMatrixAt(i,tile.matrix);naturePaths.remove(tile);});naturePaths.add(batch);
 }
 const goalRing=new T.Mesh(new T.RingGeometry(.65,.70,48),new T.MeshBasicMaterial({color:'#ffe6a1',transparent:true,opacity:.75,side:T.DoubleSide,depthWrite:false}));goalRing.rotation.x=-Math.PI/2;world.scene.add(goalRing);
 const playerRing=new T.Mesh(new T.RingGeometry(.41,.445,40),new T.MeshBasicMaterial({color:'#fff3c9',transparent:true,opacity:.7,side:T.DoubleSide,depthTest:false}));playerRing.rotation.x=-Math.PI/2;playerRing.renderOrder=21;world.scene.add(playerRing);
 const receivers=['b','d'].map(id=>world.person('#71826a',id));
 const deliveryProps=deliveryGarden(DOCKS);world.scene.add(deliveryProps);
 const dock=new T.Group();world.scene.add(dock);const h=toWorld(...STOPS.H);
 const boards=new T.InstancedMesh(new T.BoxGeometry(2.1,.12,.3),new T.MeshStandardMaterial({color:'#a8875c'}),8),boardMatrix=new T.Matrix4();for(let i=0;i<8;i++)boards.setMatrixAt(i,boardMatrix.makeTranslation(h.x,.15,h.z+i*.32));dock.add(boards);

 let greeting=null,clickAt=0,entrance=null;
 function finishEntrance(skipped=false){if(!entrance)return;const done=entrance.done;entrance=null;world.angle=.58;follow();world.zoom=world.targetZoom;document.body.classList.remove('postal-entering');document.getElementById('skipPostalEntrance')?.remove();world.frame(0,clock,reduced);done?.(skipped);}
 function startEntrance(done){if(reduced||island!=='main'){done?.(false);return;}reset();entrance={t:0,done};world.followPlayer=false;applyEntrancePose(world,postEntrancePose(0,world.player.g.position,world.aspect));document.body.classList.add('postal-entering');const skip=document.createElement('button');skip.id='skipPostalEntrance';skip.textContent='바로 걷기';skip.onclick=()=>finishEntrance(true);document.body.append(skip);}
 document.addEventListener('pointerdown',e=>{if(!entrance)return;finishEntrance(true);if(e.target===canvas)e.stopImmediatePropagation();},{capture:true});
 document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Escape','Enter','Space'].includes(e.code))finishEntrance(true);},{capture:true});
 let island='main',target=null,arrival=null,paused=false,last=performance.now(),clock=0,sailing=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const projectionPoint=new T.Vector3();
 const mapPaths={main:LANES.map(l=>l.map(c=>toWorld(...c))),mist:walkEdges.map(e=>[walkNodes[e.a],walkNodes[e.b]])};
 const stopPoints=Object.fromEntries(Object.entries(STOPS).map(([id,c])=>[id,{...toWorld(...c),y:.103}]));
 function point(id){return (island==='mist'?DOCKS:stopPoints)[id]||null;}
 function setIsland(value,place){finishEntrance(true);greeting=null;clickRoute=[];routeKey='';clearDiscovery();deliveryProps.userData.stop?.();island=value;world.sync(maps[island],false);world.static.visible=island==='main';scenery.setIsland(island==='mist');postalGarden.visible=cart.visible=naturePaths.visible=dock.visible=island==='main';deliveryProps.visible=island==='mist';receivers.forEach((r,i)=>{r.g.visible=island==='mist';const q=DOCKS[i?'C':'B'];r.g.position.set(q.x+.45,q.y,q.z-.4);});npcs.forEach((p,i)=>{p.g.visible=island==='main';if(island==='main')world.place(p,...STOPS['r'+i]);p.watering=i===2;});world.people.forEach(p=>p.route=[]);const q=point(place)||point(island==='main'?'start':'A');world.player.g.position.set(q.x,q.y,q.z);delete world.player.g.position.walkEdge;world.center.set(island==='main'?0:0,0,island==='main'?2:-2);world.angle=.58;follow();world.zoom=world.targetZoom;world.season(2,true);world.scene.background.set("#c7e5e1");world.sun.intensity=island==="mist"?2.35:2.65;world.hemi.intensity=island==="mist"?1.55:1.38;world.sun.color.set('#ffe3b5');world.hemi.groundColor.set('#bac7a4');if(world.gardenDecor)world.gardenDecor.visible=island==='main';target=null;nearby=null;}
 let routeKey='',routeNodes=[];
 function route(id){
  const q=point(id);if(!q)return[];
  if(island==='mist')return walkRoute(world.player.g.position,q);
  const p=world.player.g.position,key=[Math.round(p.x*2),Math.round(p.z*2),id].join(':');
  if(key===routeKey)return routeNodes;
  routeKey=key;routeNodes=stroll(p,q);return routeNodes;
 }

 const keys=new Set(),held=new Map();let nearby=null,guideTime=0,trailKey='';
 const trail=new T.Group();world.scene.add(trail);
 const arrow=new T.Shape();arrow.moveTo(-.12,-.09);arrow.lineTo(0,.16);arrow.lineTo(.12,-.09);arrow.lineTo(0,-.015);arrow.closePath();
 const arrowGeometry=new T.ShapeGeometry(arrow),arrowMaterial=new T.MeshBasicMaterial({color:'#fff2cf',side:T.DoubleSide,transparent:true,opacity:.88,depthWrite:false}),rimMaterial=new T.MeshBasicMaterial({color:'#71896a',side:T.DoubleSide,transparent:true,opacity:.8,depthWrite:false});
 const dots=Array.from({length:40},()=>{const g=new T.Group();const rim=new T.Mesh(arrowGeometry,rimMaterial),m=new T.Mesh(arrowGeometry,arrowMaterial);rim.scale.setScalar(1.32);rim.renderOrder=-2;m.renderOrder=-1;m.position.z=.002;g.add(rim,m);g.rotation.x=-Math.PI/2;trail.add(g);return g;});
 function near(id){const q=point(id),p=world.player.g.position;return !!q&&Math.hypot(p.x-q.x,p.z-q.z)<1.5&&Math.abs(p.y-q.y)<.9;}
 function walk(id){if(!point(id))return false;target=id;guideTime=0;return true;}
 function travel(id){if(paused||sailing||dialog.open||!point(id))return false;routeKey='';const nodes=route(id);if(!nodes.length)return false;clickRoute=nodes.map(q=>({...q}));
  if(id.startsWith('r')||id==='B'||id==='C'){
   let gap=.85;while(clickRoute.length){const b=clickRoute.at(-1),a=clickRoute.at(-2)||world.player.g.position,d=Math.hypot(b.x-a.x,b.z-a.z);if(d>gap){const t=gap/d;clickRoute[clickRoute.length-1]={x:b.x+(a.x-b.x)*t,z:b.z+(a.z-b.z)*t,y:(b.y??.103)+((a.y??.103)-(b.y??.103))*t};break;}gap-=d;clickRoute.pop();}
  }
  stalled=0;guideTime=0;trailKey='';const q=point(id);clickMarker.position.set(q.x,q.y+.08,q.z);clickMarker.visible=true;clickAt=performance.now();return true;}
 let stick={ix:0,iy:0,power:0},fieldStick={ix:0,iy:0,power:0},stickPointer=null;
 const canvasPointers=new Map(),fieldPad=document.getElementById('fieldPad');
 function reset(){clickRoute=[];clickMarker.visible=false;if(!keys.size&&!held.size&&stickPointer===null&&!stick.power&&!fieldStick.power&&!canvasPointers.size&&fieldPad.hidden)return;keys.clear();held.clear();stick={ix:0,iy:0,power:0};stickPointer=null;fieldStick={ix:0,iy:0,power:0};canvasPointers.clear();fieldPad.hidden=true;stickKnob.style.transform='translate(0,0)';}
 function follow(){world.followPlayer=true;const p=world.player.g.position;world.center.x=p.x;world.center.z=p.z;world.lookHeight=p.y+.8;world.cameraHeight=world.lookHeight+20.2;world.targetZoom=world.aspect<.8?3.105:2.565;}
 const pad=document.getElementById('stick');
 function steer(e){clickRoute=[];clickMarker.visible=false;const r=pad.getBoundingClientRect(),dx=e.clientX-r.x-r.width/2,dy=e.clientY-r.y-r.height/2;stick=stickVector(dx,dy,48);const d=Math.max(1,Math.hypot(dx,dy)/40);stickKnob.style.transform=`translate(${dx/d}px,${dy/d}px)`;}
 pad.addEventListener('pointerdown',e=>{if(paused||sailing||dialog.open)return;e.preventDefault();stickPointer=e.pointerId;pad.setPointerCapture(e.pointerId);steer(e);});
 pad.addEventListener('pointermove',e=>{if(stickPointer===e.pointerId)steer(e);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(name,reset);
 const codes={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
 addEventListener('keydown',e=>{if(!codes[e.code]||paused||dialog.open)return;e.preventDefault();clickRoute=[];clickMarker.visible=false;keys.add(codes[e.code]);});
 addEventListener('keyup',e=>keys.delete(codes[e.code]));addEventListener('blur',reset);document.addEventListener('visibilitychange',reset);
 document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.move);});b.addEventListener('pointermove',e=>{if(!held.has(e.pointerId))return;const over=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-move]');held.set(e.pointerId,over?.dataset.move||'');});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>held.delete(e.pointerId));});
 function manual(dt){if(sailing||dialog.open){reset();return;}const {ix,iy}=inputVector(held.size?new Set([...keys,...[...held.values()].flatMap(v=>v.split(' '))]):keys),vx=ix+stick.ix*stick.power+fieldStick.ix*fieldStick.power,vy=iy+stick.iy*stick.power+fieldStick.iy*fieldStick.power,inputPower=Math.min(1,Math.hypot(vx,vy));let power=inputPower,v=groundVector(world.angle,vx,vy);if(v){clickRoute=[];clickMarker.visible=false;}else if(clickRoute.length){const p=world.player.g.position;while(clickRoute.length&&Math.hypot(clickRoute[0].x-p.x,clickRoute[0].z-p.z)<.18)clickRoute.shift();if(clickRoute.length){const q=clickRoute[0],d=Math.hypot(q.x-p.x,q.z-p.z);v={x:(q.x-p.x)/d,z:(q.z-p.z)/d};power=Math.min(1,d/(dt*PLAYER_SPEED));}else clickMarker.visible=false;}if(v){const p=world.player.g.position,n=island==='mist'?walkStep(p,v,dt*PLAYER_SPEED*power):meadowStep(p,v,dt*PLAYER_SPEED*power,canStand);const distance=Math.hypot(n.x-p.x,n.z-p.z);if(clickRoute.length){stalled=distance<.001?stalled+dt:0;if(stalled>.6){clickRoute=[];clickMarker.visible=false;}}p.x=n.x;p.z=n.z;if(island==='mist'){p.y=n.y;p.walkEdge=n.edge;}world.player.route=[];const turn=Math.atan2(v.x,v.z)-world.player.g.rotation.y;world.player.g.rotation.y+=Math.atan2(Math.sin(turn),Math.cos(turn))*Math.min(1,dt*14);world.player.distance+=distance;world.player.moving=distance>.0001?1:0;if(!world.followPlayer)follow();world.followPlayer=true;}else world.player.moving=0;
 const here=target&&near(target)?target:null;if(here!==nearby){nearby=here;const actor=here?.startsWith('r')?npcs[+here.slice(1)]:here==='B'?receivers[0]:here==='C'?receivers[1]:null;greeting=actor&&!actor.watering?{actor,at:performance.now()}:null;if(greeting){actor.social=2.4;actor.socialSampleTime=clock;actor.g.rotation.y=Math.atan2(world.player.g.position.x-actor.g.position.x,world.player.g.position.z-actor.g.position.z);}onArrive(here);}
 guideTime-=dt;if(guideTime<=0){guideTime=.4;const p=world.player.g.position,key=[island,target,p.x,p.y,p.z].join(':');if(key===trailKey)return;trailKey=key;const nodes=clickRoute.length?[world.player.g.position,...clickRoute]:target&&!near(target)?[world.player.g.position,...route(target)]:[],r=[];for(let i=1;i<nodes.length&&r.length<dots.length;i++){const a=nodes[i-1],b=nodes[i],distance=Math.hypot(b.x-a.x,b.z-a.z);if(distance<.25)continue;const n=Math.max(1,Math.ceil(distance/1.15));for(let j=1;j<=n&&r.length<dots.length;j++){const t=j/n;r.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:(a.y??.1)+((b.y??.1)-(a.y??.1))*t,angle:Math.atan2(a.x-b.x,a.z-b.z)});}}dots.forEach((m,i)=>{m.visible=i<r.length;if(m.visible){const q=r[i];m.position.set(q.x,(island==='mist'?(q.y??walkHeight(q.x,q.z)):.1)+.2,q.z);m.rotation.z=q.angle;}});}}
 canvas.addEventListener('wheel',e=>{e.preventDefault();world.targetZoom=Math.max(.34,Math.min(3.6,world.targetZoom-e.deltaY*.001));},{passive:false});

 const clickMarker=new T.Mesh(new T.RingGeometry(.24,.32,24),new T.MeshBasicMaterial({color:'#fff2c8',side:T.DoubleSide,depthWrite:false}));clickMarker.rotation.x=-Math.PI/2;clickMarker.visible=false;world.scene.add(clickMarker);
 function clickWalk(x,y){
  if(paused||sailing||dialog.open)return;
  const q=world.point(x,y,true);if(!q)return;
  const picked=island==='main'?world.pickObject(x,y):null;if(picked?.id&&!['road','bridge'].includes(maps.main.buildings.find(b=>b.id===picked.id)?.type))return;
  const nodes=island==='mist'?walkRoute(world.player.g.position,q):stroll(world.player.g.position,q);if(!nodes.length)return;
  clickRoute=nodes;stalled=0;guideTime=0;trailKey='';const end=nodes.at(-1);clickMarker.position.set(end.x,(end.y??.103)+.08,end.z);clickMarker.visible=true;clickAt=performance.now();
 }
 // Tap to stroll; drag for manual movement, two fingers/right drag rotate.
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 canvas.addEventListener('pointerdown',e=>{
  if(paused||sailing||dialog.open)return;
  e.preventDefault();canvas.setPointerCapture(e.pointerId);
  clickRoute=[];clickMarker.visible=false;const rotate=e.button===2||e.shiftKey;canvasPointers.set(e.pointerId,{x:e.clientX,y:e.clientY,ox:e.clientX,oy:e.clientY,rotate,moved:false});if(canvasPointers.size>1)for(const p of canvasPointers.values())p.moved=true;
  fieldStick={ix:0,iy:0,power:0};fieldPad.hidden=rotate||canvasPointers.size>1;
  fieldPad.style.left=e.clientX+'px';fieldPad.style.top=e.clientY+'px';fieldPad.firstElementChild.style.transform='translate(0,0)';
 });
 canvas.addEventListener('pointermove',e=>{
  const q=canvasPointers.get(e.pointerId);if(!q)return;q.moved ||= Math.hypot(e.clientX-q.ox,e.clientY-q.oy)>8;
  if(canvasPointers.size>1||q.rotate){world.angle-=(e.clientX-q.x)*(canvasPointers.size>1?.003:.006);fieldStick={ix:0,iy:0,power:0};fieldPad.hidden=true;}
  else {const dx=e.clientX-q.ox,dy=e.clientY-q.oy;fieldStick=stickVector(dx,dy,48);const d=Math.max(1,Math.hypot(dx,dy)/32);fieldPad.firstElementChild.style.transform=`translate(${dx/d}px,${dy/d}px)`;}
  q.x=e.clientX;q.y=e.clientY;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{
  const q=canvasPointers.get(e.pointerId);if(event==='pointerup'&&q&&!q.moved&&!q.rotate&&e.button===0)clickWalk(e.clientX,e.clientY);
  canvasPointers.delete(e.pointerId);fieldStick={ix:0,iy:0,power:0};fieldPad.hidden=true;
  for(const q of canvasPointers.values()){q.ox=q.x;q.oy=q.y;}
 });

 let frameHandle=null;
 function scheduleFrame(){if(frameHandle===null&&!paused&&!document.hidden)frameHandle=requestAnimationFrame(frame);}
 document.addEventListener('visibilitychange',()=>{last=performance.now();scheduleFrame();});
 function frame(now){frameHandle=null;const dt=Math.min(.2,(now-last)/1000);last=now;if(paused||document.hidden)return;clock+=dt;if(entrance){entrance.t+=dt;applyEntrancePose(world,postEntrancePose(entrance.t,world.player.g.position,world.aspect));if(entrance.t>=4.25)finishEntrance();}if(sailing){const u=Math.min(.48,(now-sailing)/3500*.48),pose=ferryPose(u,1,1);scenery.boat.position.set(pose.x,-.1,pose.z);scenery.boat.rotation.y=pose.angle;applyEntrancePose(world,voyagePose(u,pose,island,world.aspect));}manual(dt);tickDiscovery(now,dt);if(!sailing&&world.followPlayer)world.cameraHeight=world.lookHeight+20.2;trail.visible=!entrance;goalRing.visible=!!target&&!sailing&&!entrance;const destination=target&&point(target);if(destination){goalRing.position.set(destination.x,destination.y+.07,destination.z);goalRing.material.opacity=near(target)?.85:.42;}playerRing.visible=!sailing;playerRing.position.copy(world.player.g.position);playerRing.position.y+=.1;world.paused=paused;world.frame(dt,clock,reduced);if(clickMarker.visible)clickMarker.scale.setScalar(reduced?1:1+.22*Math.sin(Math.min(1,(now-clickAt)/450)*Math.PI));if(greeting){const t=(now-greeting.at)/1000;if(t>1.6)greeting=null;else if(!reduced&&!greeting.actor.residentArt?.e.ready)greeting.actor.limbs[3].rotation.z=Math.sin(t/1.6*Math.PI)*(.8+Math.sin(t*13)*.13);}receivers.forEach((r,i)=>{if(island==='mist')r.g.position.y=DOCKS[i?'C':'B'].y;});scenery.tick(clock,reduced);if(deliveryProps.visible)deliveryProps.userData.tick?.(reduced);if(postalGarden.visible)postalGarden.userData.tick(clock,reduced);scheduleFrame();}scheduleFrame();
 setIsland('main','start');
 return {startEntrance,get entering(){return !!entrance;},discover,setParcelLook,useGift:id=>{if(id<6)deliveryProps.userData.use?.(id,receivers[id<3?0:1]);},reflectDeliveries:ids=>{postalGarden.userData.update(ids);deliveryProps.userData.update(ids);},world,maps,get mapPaths(){return mapPaths[island];},point,route,walk,travel,setIsland,get island(){return island;},near,follow,rotate(delta){world.angle+=delta;},zoom(delta){world.targetZoom=Math.max(.6,Math.min(3.6,world.targetZoom+delta));},stop:reset,get moving(){return clickRoute.length>0;},pause(v){paused=v;reset();last=performance.now();scheduleFrame();},sail(on){sailing=on?performance.now():null;world.followPlayer=false;},overview(){world.followPlayer=false;world.center.set(0,0,island==='main'?2:-2);world.targetZoom=.43;world.cameraHeight=34;world.lookHeight=1;},project(id){const q=point(id);return q?world.screen(projectionPoint.set(q.x,q.y+2.35,q.z)):null;},boat:scenery.boat,scenery,validStops:()=>Object.entries(STOPS).every(([k,[x,y]])=>walkable(maps.main,x,y))};
}








