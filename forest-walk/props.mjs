// Hiking-life props: three pieces of litter on the trail edges, a collecting bag, the water flask, the picnic mat with the
// gimbap lunchbox and the summit cup noodles (teacher's thermos, chopsticks, steam). Low-poly shared geometry, built once;
// update() only moves/scales/shows existing objects (no geometry or texture work per frame). Hand-held items are placed at
// the world positions app.mjs reads from the rigs each frame, so Tripo and procedural characters work the same way.
import * as T from './vendor/three.module.js';
import {worldAt,elevation,pathSlope} from './trail.mjs?v=forest-full-qa-20261107';
import {LITTER,litterById,picnicLayout,NOODLE_SPOT,MEALS} from './lib/life.mjs?v=forest-full-qa-20261107';
const std=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.86,metalness:0,...extra});
const sphere=new T.SphereGeometry(1,12,9),box=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,14),disc=new T.CircleGeometry(1,16).rotateX(-Math.PI/2);
function part(parent,geo,m,p,s,shadow=true){const o=new T.Mesh(geo,m);o.position.set(...p);o.scale.set(...s);o.castShadow=shadow;o.receiveShadow=shadow;parent.add(o);return o;}
const groundAt=(s,offset)=>{const p=worldAt(s,offset);return {x:p.x,y:elevation(s)+.075,z:p.z};};
const ease=t=>t*t*(3-2*t);
let seed=4421;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};

export async function createLifeProps(scene){
  const V=new T.Vector3();
  // ---- Litter: a crumpled foil wrapper, a blue bottle cap, a paper cup on its side ---------------------------------------
  const crumple=new T.IcosahedronGeometry(1,1);{const p=crumple.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*(.75+rnd()*.5),p.getY(i)*(.6+rnd()*.5),p.getZ(i)*(.75+rnd()*.5));crumple.computeVertexNormals();}
  const litter=new Map();
  for(const l of LITTER){
    const g=new T.Group();g.name='litter-'+l.id;const home=groundAt(l.s,l.offset);g.position.set(home.x,home.y,home.z);g.userData={home,id:l.id};
    if(l.id==='wrapper'){part(g,crumple,std('#dfe3e6',{metalness:.55,roughness:.32}),[0,.03,0],[.075,.035,.055]);part(g,box,std('#d64b3c'),[0,.055,.012],[.07,.012,.03]);}
    else if(l.id==='cap'){part(g,cyl,std('#3b78b5'),[0,.007,0],[.03,.013,.03]);part(g,cyl,std('#dfe8ef'),[0,.015,0],[.022,.003,.022],false);}
    else{const cup=part(g,cyl,std('#f3efe4',{side:T.DoubleSide}),[0,.034,0],[.034,.09,.03]);cup.rotation.z=Math.PI/2.15;cup.rotation.y=.4;
      const band=part(g,cyl,std('#c8423a'),[0,.034,0],[.0345,.018,.0305]);band.rotation.copy(cup.rotation);band.position.x+=.02;}
    scene.add(g);litter.set(l.id,g);
  }
  // ---- Collecting bag (left hand) and water flask (right hand) -----------------------------------------------------------
  const bag=new T.Group();bag.name='litter-bag';part(bag,box,std('#e9dfc5'),[0,-.09,0],[.14,.17,.07]);part(bag,new T.TorusGeometry(.045,.008,6,14),std('#a89566'),[0,0,0],[1,1,1],false);bag.visible=false;scene.add(bag);
  const flask=new T.Group();flask.name='flask';part(flask,cyl,std('#4a86b8',{metalness:.35,roughness:.4}),[0,0,0],[.034,.14,.034]);part(flask,cyl,std('#e6c46f'),[0,.085,0],[.024,.03,.024]);part(flask,box,std('#2d4f6e'),[0,-.01,.035],[.05,.06,.004],false);flask.visible=false;scene.add(flask);
  // ---- Picnic: gingham mat (parent's cloth texture, soft sage fallback), lunchbox with a hinged lid, three gimbap slices -----
  const clothMat=std('#f4f1e6',{roughness:.95,side:T.DoubleSide}),assets={cloth:false,gimbap:false};
  try{const tex=await new T.TextureLoader().loadAsync(new URL('./assets/picnic-cloth-adobe.webp',import.meta.url).href);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;clothMat.map=tex;clothMat.needsUpdate=true;assets.cloth=true;}
  catch{clothMat.color.set('#b9c9a8');}
  const stoolGeo=new T.CylinderGeometry(.27,.25,.065,12),stoolWood=std('#ae8961');
  function stool(){const g=new T.Group();part(g,stoolGeo,stoolWood,[0,.40,.1],[1,1,1]);for(const x of [-.17,.17])for(const z of [-.07,.27])part(g,box,stoolWood,[x,.19,z],[.055,.38,.055]);g.visible=false;scene.add(g);return g;}
  const picnicStool=stool(),noodleStools=[stool(),stool()];
  const matGeo=new T.PlaneGeometry(1.4,1.1).rotateX(-Math.PI/2);
  const picnic=new T.Group();picnic.name='picnic';picnic.visible=false;scene.add(picnic);
  const mat=new T.Mesh(matGeo,clothMat);mat.receiveShadow=true;mat.position.y=.012;picnic.add(mat);
  const lunch=new T.Group();picnic.add(lunch);
  const boxMat=std('#f2b7a4'),rimMat=std('#d9907c');
  part(lunch,box,boxMat,[0,.035,0],[.34,.07,.22]);part(lunch,box,std('#fbf3e6'),[0,.071,0],[.31,.004,.19],false);
  const lid=new T.Group();lid.position.set(0,.07,-.11);lunch.add(lid);part(lid,box,rimMat,[0,.012,.11],[.34,.024,.22]);
  const pieces=[];
  for(let i=0;i<MEALS.picnic.pieces;i++){const g=new T.Group();g.position.set(-.1+i*.1,.07,0);lunch.add(g);
    part(g,cyl,std('#1f2a1f',{roughness:.7}),[0,.026,0],[.028,.052,.028]);part(g,disc,std('#f6f3e8'),[0,.053,0],[.024,1,.024],false);
    for(const [k,c] of [['#e8873a',[0,0,.007]],['#4e8a3f',[.008,0,-.004]],['#f2d35b',[-.008,0,-.004]],['#b05a3c',[0,0,-.011]]].entries())part(g,cyl,std(c[0]),[c[1][0],.054,c[1][2]],[.0055,.003,.0055],false);
    pieces.push(g);}
  // Replace only the food meshes after the optional Tripo pair loads; keep code slices on failure.
  try{
    const [response,map]=await Promise.all([fetch(new URL('./assets/gimbap-tripo.json',import.meta.url),{signal:AbortSignal.timeout(15000)}),new T.TextureLoader().loadAsync(new URL('./assets/gimbap-tripo.webp',import.meta.url).href)]);
    if(!response.ok)throw Error('Food mesh unavailable');const data=await response.json(),geo=new T.BufferGeometry();
    for(const [key,size] of [['position',3],['normal',3],['uv',2],['color',3]])geo.setAttribute(key,new T.Float32BufferAttribute(data[key],size));geo.setIndex(data.index);
    map.colorSpace=T.SRGBColorSpace;const material=std('#ffffff',{map,vertexColors:true});
    for(const g of pieces){for(const child of g.children)child.material?.dispose();g.clear();part(g,geo,material,[0,0,0],[.075,.075,.075]);}assets.gimbap=true;
  }catch{}
  // ---- Cup noodles at the summit: second mat, cup with broth and noodles, steam, chopsticks, the teacher's thermos ---------
  const noodle=new T.Group();noodle.name='noodle';noodle.visible=false;scene.add(noodle);
  const mat2=new T.Mesh(matGeo,clothMat);mat2.receiveShadow=true;mat2.position.y=.012;mat2.scale.set(.8,1,.8);noodle.add(mat2);
  const cup=new T.Group();noodle.add(cup);
  part(cup,new T.CylinderGeometry(.056,.043,.11,16,1,true),std('#f6f2e8',{side:T.DoubleSide}),[0,.055,0],[1,1,1]);part(cup,disc,std('#e9e2d2'),[0,.002,0],[.043,1,.043],false);
  part(cup,cyl,std('#c8423a'),[0,.09,0],[.0545,.016,.0545],false);
  const broth=part(cup,disc,std('#d2a556',{transparent:true,opacity:.85}),[0,.1,0],[.052,1,.052],false);
  const strands=[];for(let i=0;i<4;i++){const t=part(cup,new T.TorusGeometry(.03,.0055,6,14),std('#f0d48a'),[(rnd()-.5)*.02,.102+i*.004,(rnd()-.5)*.02],[1,1,1],false);t.rotation.set(-Math.PI/2+(rnd()-.5)*.4,rnd()*3,0);strands.push(t);}
  const steam=Array.from({length:3},(_,i)=>{const m=new T.Mesh(sphere,new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false}));m.userData.i=i;cup.add(m);return m;});
  const sticks=new T.Group();sticks.name='chopsticks';for(const x of [-.006,.006])part(sticks,cyl,std('#c9a070'),[x,0,0],[.0035,.2,.0035],false);
  const strand=part(sticks,new T.TorusGeometry(.012,.004,5,10),std('#f0d48a'),[0,-.1,0],[1,1,1],false);sticks.visible=false;scene.add(sticks);
  const thermos=new T.Group();thermos.name='thermos';part(thermos,cyl,std('#355e4a',{metalness:.3,roughness:.5}),[0,0,0],[.045,.26,.045]);part(thermos,cyl,std('#d9d2c0'),[0,.145,0],[.034,.03,.034]);
  thermos.visible=false;scene.add(thermos);
  const stream=new T.Mesh(cyl,std('#dbeff2',{transparent:true,opacity:.7}));stream.scale.set(.006,1,.006);stream.visible=false;scene.add(stream);const mouth=new T.Vector3();
  const layoutGroup=(group,spot)=>{const p=worldAt(spot.s,spot.offset);group.position.set(p.x,elevation(spot.s)+(spot.s>=702?.14:.075),p.z);group.rotation.set(0,spot.yaw||0,0);group.updateMatrixWorld(true);};
  let picnicSeat=-1,picked=0,pulseAt=-9,lastLift=null;
  const tmp=new T.Vector3();
  function placePicnic(seat){if(picnicSeat===seat)return;picnicSeat=seat;const L=picnicLayout(seat);layoutGroup(picnic,L.mat);const b=worldAt(L.box.s,L.box.offset);
    // The box sits on the mat at its own trail point: convert that world point into the mat's (rotated) local frame.
    tmp.set(b.x,picnic.position.y,b.z);picnic.worldToLocal(tmp);lunch.position.set(tmp.x,0,tmp.z);lunch.rotation.y=0;picnic.updateMatrixWorld(true);}
  layoutGroup(noodle,NOODLE_SPOT.mat);{const c=worldAt(NOODLE_SPOT.cup.s,NOODLE_SPOT.cup.offset);cup.position.set(c.x-noodle.position.x,0,c.z-noodle.position.z);}
  const lowTable=new T.Group();lowTable.position.set(cup.position.x,0,cup.position.z);noodle.add(lowTable);
  part(lowTable,new T.CylinderGeometry(.34,.33,.05,16),stoolWood,[0,.49,0],[1,1,1]);
  for(const x of [-.19,.19])for(const z of [-.19,.19])part(lowTable,box,stoolWood,[x,.235,z],[.055,.47,.055]);
  cup.position.y=.515;cup.scale.setScalar(1.4);
  // ---- Per-frame placement. `hands` = {heroL,heroR,teacherR} world Vector3s (already read from the rigs); `view` = flags from
  // app.mjs: {picnicShown,noodleShown,seat}. Progress values come from life.mjs so a frame never changes state here. ---------
  function update(time,life,hands,view,reduced){
    const pickup=life.litter.pickup;
    picnicStool.visible=!!view.picnicShown;
    if(picnicStool.visible){const L=picnicLayout(view.seat||0);layoutGroup(picnicStool,{...L.friend,yaw:0});}
    noodleStools.forEach((g,i)=>{g.visible=!!view.noodleShown;if(g.visible)layoutGroup(g,i?{...NOODLE_SPOT.friend,yaw:0}:NOODLE_SPOT.seat);});
    for(const [id,g] of litter){
      const left=life.litter.left.includes(id);g.visible=left;if(!left)continue;
      const h=g.userData.home;
      if(pickup?.id===id&&hands.heroR){
        // The piece stays on the ground until the hand has reached down (60 % of the reach), then rises with the hand; it only
        // disappears when life.mjs completes the pickup (cancelling drops it straight back home).
        const t=Math.max(0,(pickup.elapsed/pickup.duration-.6)/.4);g.position.set(h.x+(hands.heroR.x-h.x)*t,h.y+(hands.heroR.y-h.y)*t,h.z+(hands.heroR.z-h.z)*t);
      }else g.position.set(h.x,h.y,h.z);
    }
    if(life.litter.picked.length!==picked){picked=life.litter.picked.length;pulseAt=time;}
    const bagShown=!!hands.heroL&&(!!pickup||time-life.litter.lastPickedAt<2.5)&&(life.litter.picked.length>0||!!pickup);
    bag.visible=bagShown;
    if(bagShown){const pulse=reduced?0:Math.max(0,1-(time-pulseAt)/.45);const sc=1+.16*picked+Math.sin(pulse*Math.PI)*.18;bag.position.copy(hands.heroL);bag.position.y-=.02;bag.scale.set(sc,1+.1*picked,sc);}
    const drink=life.water.drink;flask.visible=!!drink&&!!hands.heroR;
    if(flask.visible){const t=drink.elapsed/drink.duration,tilt=ease(Math.max(0,Math.min(1,(t-.3)/.5)))*(1-ease(Math.max(0,(t-.85)/.15)));flask.position.copy(hands.heroR).addScaledVector(hands.heroForward,.13);flask.position.y-=.07;flask.scale.setScalar(1.5);flask.rotation.set(-tilt*1.05,Math.atan2(hands.heroForward.x,hands.heroForward.z),.15,'YXZ');}
    // Picnic: lid angle follows the open/pack action, the current slice travels to the hand during a bite and shrinks away at
    // its end; remaining slices are the pieces not yet eaten. Hidden entirely while the child is not at the picnic.
    const pc=life.meals.picnic,picnicShown=!!view.picnicShown;picnic.visible=picnicShown;
    if(picnicShown){placePicnic(view.seat||0);const a=pc.action,p=a?a.elapsed/a.duration:0;
      let open=pc.stage==='open'?1:0;if(a?.id==='open')open=ease(p);if(a?.id==='pack')open=1-ease(p);
      lid.rotation.x=-1.95*open;
      const left=MEALS.picnic.pieces-pc.bites;
      for(const [i,g] of pieces.entries()){const index=MEALS.picnic.pieces-1-i;const eating=a?.id==='bite'&&index===left-1;g.visible=index<left&&open>.2;
        if(eating&&hands.heroR){const t=ease(Math.min(1,p/.45)),shrink=p>.7?1-(p-.7)/.3:1;tmp.copy(hands.heroR).addScaledVector(hands.heroForward,.10);tmp.y+=.02;lunch.worldToLocal(tmp);const home=-.1+index*.1;
          g.position.set(home+(tmp.x-home)*t,.07+(tmp.y-.07)*t,tmp.z*t);g.scale.setScalar(Math.max(.01,shrink));}
        else{g.position.set(-.1+index*.1,.07,0);g.scale.setScalar(1);}}
    }
    // Cup noodles: the thermos sits in the teacher's hand and tips over the cup while pouring (a thin stream for the pour's
    // middle), broth and noodles appear with the pour, steam rises while the cup is full, chopsticks sit in the child's hand for a bite.
    const nd=life.meals.noodle,noodleShown=!!view.noodleShown;noodle.visible=noodleShown;
    const act=nd.action,np=act?act.elapsed/act.duration:0,poured=nd.stage==='open'?1:act?.id==='pour'?ease(Math.max(0,(np-.25)/.6)):0;
    thermos.visible=noodleShown&&!!hands.teacherR;
    stream.visible=false;
    if(thermos.visible){const tip=act?.id==='pour'?ease(Math.min(1,np/.3))*(1-ease(Math.max(0,(np-.8)/.2))):0;thermos.position.copy(hands.teacherR).addScaledVector(hands.teacherForward,.1);thermos.position.y-=.05;
      // Upright in the hand; while pouring it pitches its top toward the cup (yaw first, then the tip about its own x axis).
      cup.getWorldPosition(tmp);const yaw=Math.atan2(tmp.x-thermos.position.x,tmp.z-thermos.position.z);thermos.rotation.set(tip*1.3,yaw,0,'YXZ');
      if(tip>.5&&!reduced){thermos.updateMatrixWorld(true);mouth.set(0,.16,0);thermos.localToWorld(mouth);tmp.y+=.14;const direction=tmp.clone().sub(mouth),len=direction.length();
        stream.visible=true;stream.position.copy(mouth).addScaledVector(direction,.5);stream.scale.y=len;stream.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());}}
    if(noodleShown){broth.visible=poured>.05;broth.scale.set(.052*poured,1,.052*poured);for(const [i,t] of strands.entries())t.visible=poured>.3+i*.15;
      const full=nd.stage==='open'||act?.id==='pour';
      for(const m of steam){const i=m.userData.i,ph=reduced?(i*.33+.2)%1:(time*.5+i*.33)%1;m.visible=full&&(poured>.9||nd.stage==='open');if(!m.visible)continue;
        m.position.set(Math.sin(time*.9+i)*.02,.12+ph*.28,Math.cos(time*.7+i*2)*.02);m.scale.setScalar(.018+ph*.04);m.material.opacity=.22*(1-ph)*Math.min(1,ph*5);}
      if(act?.id==='pack'){const t=ease(np);cup.scale.setScalar(1.4*Math.max(.02,1-t*.9));cup.position.y=.515+t*.25;}else{cup.scale.setScalar(1.4);cup.position.y=.515;}
    }
    sticks.visible=noodleShown&&act?.id==='bite'&&!!hands.heroR;
    if(sticks.visible){sticks.position.copy(hands.heroR).addScaledVector(hands.heroForward,.10);sticks.position.y+=.02;sticks.rotation.set(-.9,Math.atan2(hands.heroForward.x,hands.heroForward.z),.3,'YXZ');strand.visible=np>.35;}
  }
  function reset(){picnicStool.visible=false;for(const g of noodleStools)g.visible=false;for(const g of litter.values()){const h=g.userData.home;g.visible=true;g.position.set(h.x,h.y,h.z);}bag.visible=flask.visible=picnic.visible=noodle.visible=sticks.visible=thermos.visible=stream.visible=false;picked=0;pulseAt=-9;picnicSeat=-1;lid.rotation.x=0;cup.scale.setScalar(1.4);cup.position.y=.515;}
  const snapshot=()=>({assets:{...assets},litter:Object.fromEntries([...litter].map(([id,g])=>[id,{visible:g.visible,x:+g.position.x.toFixed(2),y:+g.position.y.toFixed(2),z:+g.position.z.toFixed(2)}])),
    stools:{picnic:picnicStool.visible,noodle:noodleStools.map(g=>g.visible)},bag:{visible:bag.visible,scale:+bag.scale.x.toFixed(2)},flask:{visible:flask.visible,tilt:+flask.rotation.x.toFixed(2)},
    picnic:{visible:picnic.visible,seat:picnicSeat,lid:+lid.rotation.x.toFixed(2),pieces:pieces.map(g=>g.visible)},
    noodle:{visible:noodle.visible,broth:broth.visible,steam:steam.some(m=>m.visible),thermos:thermos.visible,chopsticks:sticks.visible}});
  return {mealTemplates:{lunch,cup,clothMat,stool:picnicStool,gimbap:pieces[0],sticks,thermos},hideMeals(){for(const g of [picnic,noodle,picnicStool,...noodleStools,thermos,sticks,stream])g.visible=false;},litter,bag,flask,picnic,noodle,thermos,sticks,assets,update,reset,snapshot,litterSpots:()=>LITTER.map(l=>({id:l.id,name:litterById(l.id).name,...groundAt(l.s,l.offset)}))};
}
