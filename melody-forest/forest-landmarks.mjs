import * as THREE from './lib/three.module.min.js';

export const PALETTES = {
  basic: {sky:0x8fc3dc,horizon:0xdde8cd,fog:0xdce2cb,ground:0x8aa577,deep:0x546e50,warm:0xb7bd8c,leaf:0xffffff,sun:0xffeed4,power:1.65,ambient:1.15,exposure:1.03,trees:30,farTrees:64,shafts:.09},
  pop: {sky:0x82cbdc,horizon:0xffe5c2,fog:0xe8e6ca,ground:0x92b181,deep:0x577d5c,warm:0xc8c893,leaf:0xe4ffcf,sun:0xffdeb1,power:2,ambient:1,exposure:1.06,trees:18,farTrees:40,shafts:.035},
  warm: {sky:0x9bc7cf,horizon:0xffe4b8,fog:0xe8dfbc,ground:0xaaa575,deep:0x818259,warm:0xd3bd89,leaf:0xf6e5ae,sun:0xffd69a,power:1.8,ambient:1,exposure:1.05,trees:12,farTrees:28,shafts:.05},
  dream: {sky:0x101738,horizon:0x353a61,fog:0x252c4c,ground:0x41677c,deep:0x253d58,warm:0x779391,leaf:0x8aa4ed,sun:0xb8cdff,power:.72,ambient:.7,exposure:1.06,character:0xbcc9e2,trees:24,farTrees:40,shafts:.05},
  journey: {sky:0x6ebce5,horizon:0xb8dfe4,fog:0xc4dde3,ground:0xa6c59a,deep:0x84a8a1,warm:0xe8e2bf,leaf:0xc7f4d6,sun:0xfff1d1,power:1.6,ambient:1,exposure:1.0,trees:0,farTrees:0,shafts:.035},
  moon: {sky:0x111c36,horizon:0x35435f,fog:0x26364d,ground:0x527576,deep:0x2c505e,warm:0x899985,leaf:0x9dbfcb,sun:0xcbdfff,power:.85,ambient:.74,exposure:1.06,character:0xc8d2df,trees:16,farTrees:35,shafts:.035}
};

// All landmarks live outside the shared walking corridor; no map can block the piano approach.
export function buildLandmarks(parent,id,groundY,leafTexture) {
  const root=new THREE.Group();root.name='landmarks-'+id;parent.add(root);
  const animations=[],colliders=[],materials=new Map();
  const material=(color,glow=false)=>{
    const key=`${color}-${glow}`;
    if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.04,emissive:glow?color:0,emissiveIntensity:glow?.8:0}));
    return materials.get(key);
  };
  const mesh=(g,c,x,y,z,s=1,group=root,glow=false)=>{const m=new THREE.Mesh(g,material(c,glow));m.position.set(x,y,z);typeof s==='number'?m.scale.setScalar(s):m.scale.set(...s);m.castShadow=!glow;m.receiveShadow=true;group.add(m);return m;};
  const sphere=new THREE.SphereGeometry(1,16,10),box=new THREE.BoxGeometry(1,1,1);
  const pole=(x,y,z,h,r=.05,c=0xa58c61,g=root)=>mesh(new THREE.CylinderGeometry(r,r*1.18,h,10),c,x,y+h/2,z,1,g);
  const batches=(geo,c,items,glow=false)=>{const m=new THREE.InstancedMesh(geo,material(c,glow),items.length),dummy=new THREE.Object3D();items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...(p.length>=6?p.slice(3,6):[p[3]||1,p[3]||1,p[3]||1]));dummy.rotation.set(0,p[6]||0,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.castShadow=!glow;m.receiveShadow=true;root.add(m);return m;};
  const stars=()=>{const a=[];for(let i=0;i<350;i++){const t=i*2.39996,r=35+(i%17),y=7+((Math.sin(i*127.1)*43758.5453)%1+1)%1*33;a.push(Math.cos(t)*r,y,Math.sin(t)*r-10);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));root.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xd4e3f2,size:.075,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false})));};
  const lantern=(x,z)=>{const y=groundY(x,z);pole(x,y,z,1.6,.045,0x72594a);mesh(box,0x6e5745,x,y+1.58,z,[.29,.04,.29]);mesh(box,0xffd390,x,y+1.8,z,[.21,.36,.21],root,true);mesh(new THREE.ConeGeometry(.24,.18,4),0x6e5745,x,y+2.07,z,1);colliders.push({x,z,radius:.18,height:2.2});};

  // A quiet stone clearing grounds the piano; the path into it stays flat and open.
  const clearing=mesh(new THREE.CircleGeometry(1.85,64),id==='dream'||id==='moon'?0x566b74:0xa2a88d,0,.008,-.62);clearing.rotation.x=-Math.PI/2;clearing.castShadow=false;
  // Three broken rings of small stone pavers replace the featureless circular slab.
  for(let band=0;band<3;band++){
    const count=12+band*6,inner=.06+band*.58,geo=new THREE.RingGeometry(inner+.012,inner+.56,6,1,.018,Math.PI*2/count-.036);
    const paving=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:id==='moon'||id==='dream'?0x9eaaa8:0xd5cdb5,roughness:.96}),count),dummy=new THREE.Object3D();
    paving.name='clearing-pavers';
    for(let i=0;i<count;i++){dummy.position.set(0,.012,-.62);dummy.rotation.set(-Math.PI/2,0,i*Math.PI*2/count+band*.19);dummy.updateMatrix();paving.setMatrixAt(i,dummy.matrix);paving.setColorAt(i,new THREE.Color().setScalar(.88+(i%4)*.035));}
    paving.receiveShadow=true;root.add(paving);
  }
  const border=[];for(let i=0;i<38;i++){const a=i*Math.PI*2/38;border.push([Math.cos(a)*1.84,.014,-.62+Math.sin(a)*1.84,.14,.035,.095,-a]);}batches(sphere,0xa6a88c,border);
  const windowAt=(x,y,z,w=.45,h=.6)=>{mesh(box,0x594c3b,x,y,z,[w+.12,h+.12,.09]);mesh(box,0xffdfa0,x,y,z+.055,[w,h,.025],root,true);mesh(box,0x78664c,x,y,z+.08,[.035,h,.025]);mesh(box,0x78664c,x,y,z+.08,[w,.035,.025]);};
  const shingles=(x,y,z,r,rows,color)=>{for(let i=0;i<rows;i++){const radius=r*(1-i/rows);mesh(new THREE.ConeGeometry(radius,.5,12),color,x,y+i*.28,z);}};

  if(id==='basic'){
    // A built-in treehouse gives the sunlit forest a recognisable destination.
    const x=2.8,z=-5.8,y=groundY(x,z);
    pole(x,y,z,5.2,.48,0x92714e);pole(x-1.1,y,z+.8,2.05,.13,0x8e7653);pole(x+1.1,y,z+.8,2.05,.13,0x8e7653);
    mesh(new THREE.CylinderGeometry(1.75,1.8,.18,12),0xa78659,x,y+1.9,z);
    mesh(new THREE.CylinderGeometry(1.18,1.3,1.75,8),0xceae79,x,y+2.85,z);
    shingles(x,y+3.84,z,1.58,5,0x65805a);
    const boards=[];for(let i=0;i<10;i++)boards.push([x,y+2.06+i*.164,z+1.21,1.75,.023,.035]);batches(box,0xb18a59,boards);
    mesh(new THREE.BoxGeometry(.52,1.05,.08),0x6c8053,x,y+2.52,z+1.3);mesh(sphere,0xe0bb6f,x+.17,y+2.45,z+1.36,.035);
    windowAt(x-.77,y+3.12,z+1.24,.4,.48);windowAt(x+.77,y+3.12,z+1.24,.4,.48);
    const posts=[],rails=[];for(let i=0;i<13;i++){const a=i*Math.PI*2/13;if(Math.sin(a)>.7)continue;posts.push([x+Math.cos(a)*1.65,y+2.18,z+Math.sin(a)*1.65,.045,.5,.045]);}
    batches(box,0xe2c896,posts);const ring=mesh(new THREE.TorusGeometry(1.65,.04,6,48,Math.PI*1.5),0xe2c896,x,y+2.45,z);ring.rotation.x=-Math.PI/2;ring.rotation.z=Math.PI*.75;
    const ladder=[];for(let i=0;i<8;i++)ladder.push([x,y+.18+i*.22,z+2.1-i*.075,.65,.065,.12]);batches(box,0xb49360,ladder);
    for(const side of [-1,1]){const strut=pole(x+side*.36,y,z+1.82,2.05,.045,0x806346);strut.rotation.x=-.32;}
    const canopy=[];for(let i=0;i<30;i++){const a=i*2.4;canopy.push([x+Math.cos(a)*1.7,y+5.05+Math.sin(i*1.9)*.7,z+Math.sin(a)*1.4,2.2,2,1,a]);}
    const crown=batches(new THREE.PlaneGeometry(1,1),0xd2e2c7,canopy);crown.material.map=leafTexture||null;crown.material.alphaTest=.45;crown.material.side=THREE.DoubleSide;
    crown.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafTexture||null,alphaTest:.45,side:THREE.DoubleSide});
    // A birdhouse and curved garden bench stay well clear of the approach.
    const bx=-4.4,bz=-2.7,by=groundY(bx,bz);pole(bx,by,bz,2.2,.075,0x99805c);mesh(box,0xd6b380,bx,by+2.15,bz,[.4,.45,.38]);mesh(new THREE.ConeGeometry(.39,.3,4),0x718b5c,bx,by+2.52,bz);mesh(new THREE.CircleGeometry(.075,20),0x514932,bx,by+2.2,bz+.194);
    const bench=[];for(let i=0;i<4;i++)bench.push([-3.8,.48,-4.2+i*.13,1.7,.065,.1]);batches(box,0xb89968,bench);for(const xx of [-4.45,-3.15])pole(xx,0,-4,.47,.09,0x7a684b);
    colliders.push({x,z,radius:2.3,height:5.8},{x:bx,z:bz,radius:.3,height:2.8},{x:-3.8,z:-4,radius:.95,height:.55});
  } else if(id==='pop'){
    const arch=mesh(new THREE.TorusGeometry(2.65,.11,12,64,Math.PI),0xf1d8a1,0,1.1,-4.9);arch.rotation.z=0;
    pole(-2.65,0,-4.9,1.15,.12);pole(2.65,0,-4.9,1.15,.12);
    const flowers=[[],[],[]],colors=[0xe998ad,0xffd16b,0xa7b9ef];
    for(let i=0;i<31;i++){const a=i*Math.PI/30,x=Math.cos(a)*2.65,y=1.1+Math.sin(a)*2.65;flowers[i%3].push([x,y,-4.85,.2,.2,.14]);}
    flowers.forEach((f,i)=>batches(sphere,colors[i],f));
    for(const side of [-1,1]){
      const x=side*6.8;pole(x,0,-3,4.2,.09,0x9c7e58);pole(x,0,8,3.5,.09,0x9c7e58);
      const points=[];for(let i=0;i<=24;i++){const z=-3+i*11/24,y=3.9-.6*Math.sin(i/24*Math.PI);points.push(new THREE.Vector3(x,y,z));}
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),30,.015,4,false),0xf4dfb6,0,0,0);
      for(let i=0;i<10;i++){const z=-2.6+i*1.05,y=3.9-.6*Math.sin((i+.4)/10*Math.PI),shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.48,0);shape.lineTo(.24,-.6);shape.closePath();const flag=mesh(new THREE.ShapeGeometry(shape),colors[i%3],x,y,z);flag.rotation.y=side*Math.PI/2;flag.material.side=THREE.DoubleSide;}
    }
    // An oversized sculptural xylophone is scenery, not an extra input surface.
    for(let i=0;i<7;i++){const x=4.4,z=-2.5+i*.6,y=groundY(x,z)+.55,bar=mesh(box,[0xeaa1aa,0xf0ba78,0xe2d777,0x94c9a0,0x7fb9d1,0x9eafe1,0xcaa4d8][i],x,y,z,[1.8-i*.12,.18,.47]);bar.name='rhythm-bar';animations.push((t,energy)=>bar.position.y=y+energy*.06*(.5+.5*Math.sin(i*1.7)));}
    const feet=[];for(const x of [3.85,4.95])for(const z of [-2.5,1.1])feet.push([x,.23,z,.1,.46,.1]);batches(box,0x906f51,feet);
    const drumX=-4.5,drumZ=-3,y=groundY(drumX,drumZ);mesh(new THREE.CylinderGeometry(.73,.65,.7,32),0xc88b73,drumX,y+.37,drumZ);const skin=mesh(new THREE.CylinderGeometry(.75,.75,.035,32),0xffe6ba,drumX,y+.74,drumZ);skin.name='rhythm-drum';animations.push((t,energy)=>skin.scale.set(1+energy*.025,1,1+energy*.025));
    const rims=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;rims.push([drumX+Math.cos(a)*.69,y+.4,drumZ+Math.sin(a)*.69,.025,.32,.025]);}batches(box,0xf1d7a4,rims);
    const flags=[];for(let i=0;i<19;i++){const a=i*Math.PI/18;flags.push([Math.cos(a)*2.65,1.1+Math.sin(a)*2.65,-4.7,.055]);}batches(sphere,0xffe5b0,flags,true);
    colliders.push({x:drumX,z:drumZ,radius:.8,height:.8},{x:4.4,z:-.7,radius:1.1,height:.8});
  } else if(id==='warm'){
    for(const [x,z,size] of [[-.8,-6.5,1],[8.2,-7,1],[-12,-12,.8]]){
      const y=groundY(x,z);mesh(new THREE.CylinderGeometry(.5,.85,3.5,16),0xe5d4ae,x,y+1.75*size,z,size);mesh(new THREE.ConeGeometry(.85,1,12),0x9a6850,x,y+3.9*size,z,size);
      const rotor=new THREE.Group();rotor.position.set(x,y+3*size,z+.62*size);rotor.scale.setScalar(size);root.add(rotor);
      for(let i=0;i<4;i++){const blade=new THREE.Group();blade.rotation.z=i*Math.PI/2;rotor.add(blade);mesh(box,0x96744e,0,.95,0,[.07,2.2,.06],blade);mesh(box,0xf6e6bf,.21,1.27,0,[.42,1.25,.05],blade);for(let j=0;j<4;j++)mesh(box,0xc0a17a,.21,.75+j*.3,.04,[.42,.035,.04],blade);}
      mesh(sphere,0x94704e,0,0,.07,.15,rotor);animations.push(t=>rotor.rotation.z=t*.18);
      mesh(box,0x8b6b4d,x,y+.55*size,z+.76*size,[.4*size,.95*size,.05]);windowAt(x,y+2.1*size,z+.64*size,.25*size,.38*size);
      colliders.push({x,z,radius:.9*size,height:4.6*size});
    }
    const seedHeads=[];for(let i=0;i<100;i++){const side=i%2?1:-1,x=side*(6.3+(i%9)*.19),z=-3+Math.floor(i/2)*.24,y=groundY(x,z);seedHeads.push([x,y+.65+(i%3)*.09,z,.05,.16,.05]);}batches(sphere,0xe1ca85,seedHeads);
    const stalks=seedHeads.map(p=>[p[0],p[1]-.35,p[2],.015,.55,.015]);batches(box,0xae9d64,stalks);
    for(const x of [-4.8,4.8]){const fence=[];for(let i=0;i<9;i++)fence.push([x,groundY(x,-4+i*.8)+.4,-4+i*.8,.07,.8,.07]);batches(box,0xb59d71,fence);mesh(box,0xc6af82,x,.57,-.8,[.07,.07,7.2]);}
  } else if(id==='dream'){
    stars();const petals=[],cores=[];
    for(let i=0;i<32;i++){const side=i%2?1:-1,x=side*(3.3+(i%5)*.4),z=-4+Math.floor(i/2)*.85,y=groundY(x,z)+.28;cores.push([x,y,z,.065]);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;petals.push([x+Math.cos(a)*.15,y,z+Math.sin(a)*.15,.12,.045,.1]);}}
    batches(sphere,0x9cbdff,petals,true);batches(sphere,0xffe8a2,cores,true);
    const halo=mesh(new THREE.TorusGeometry(2.1,.035,8,70),0xaabdf1,0,3.4,-5.5,1,root,true);halo.rotation.y=.15;
    const pedestal=mesh(new THREE.CylinderGeometry(1.05,1.3,.26,32),0x606b85,0,.15,-5.5);
    const orbit=mesh(new THREE.TorusGeometry(1.08,.024,8,64),0xe8d1a0,0,2.65,-5.5,1,root,true);orbit.rotation.x=.5;orbit.rotation.y=.4;
    const star=mesh(new THREE.OctahedronGeometry(.34),0xd9e1ff,0,2.65,-5.5,1,root,true);animations.push(t=>{star.rotation.y=t*.18;star.position.y=2.65+Math.sin(t*.7)*.08;});
    const crystals=[];for(let i=0;i<22;i++){const side=i%2?1:-1,x=side*(4.8+(i%4)*.3),z=-4+Math.floor(i/2)*.8;crystals.push([x,groundY(x,z)+.25,z,.11,.3+(i%3)*.1,.12,i*.7]);}const crystal=batches(new THREE.OctahedronGeometry(1),0x9faed0,crystals);crystal.name='listening-crystals';crystal.material.emissive.set(0x9bacef);animations.push((t,energy)=>crystal.material.emissiveIntensity=.06+energy*.38);
    colliders.push({x:0,z:-5.5,radius:1.35,height:4.2});
    const fireflies=[];for(let i=0;i<80;i++)fireflies.push([Math.sin(i*2.4)*4,1+(i%7)*.27,Math.cos(i*1.7)*6,.025]);const bugs=batches(sphere,0xd5ecad,fireflies,true);animations.push(t=>{bugs.rotation.y=Math.sin(t*.12)*.09;bugs.position.y=Math.sin(t*.5)*.12;});
  } else if(id==='journey'){
    const clouds=[];for(let i=0;i<64;i++){const a=i*2.4,r=18+(i%7)*3;clouds.push([Math.cos(a)*r,-1.8+(i%5)*.45,Math.sin(a)*r,3+(i%3),1.1,2.3]);}batches(sphere,0xf1f7fb,clouds);
    const crowns=[];
    for(const [x,y,z,s] of [[-6,4,-25,3.5],[5,6,-30,3],[-15,9,-40,4],[16,10,-43,4.5]]){
      const rock=new THREE.CylinderGeometry(s,.18,s*1.45,11,5),p=rock.attributes.position;
      for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),h=p.getY(i),wave=1+.12*Math.sin(a*3+.6)+.06*Math.cos(h*4+a*5);p.setXYZ(i,p.getX(i)*wave,h+.12*Math.sin(a*5),p.getZ(i)*wave);}rock.computeVertexNormals();
      mesh(rock,0x879b9f,x,y-s*.725,z);mesh(new THREE.CylinderGeometry(s*.96,s, .25,18),0xa9cbaa,x,y+.1,z);
      for(let j=0;j<3;j++){const tx=x+Math.cos(j*2.4)*s*.3,tz=z+Math.sin(j*2.4)*s*.3;pole(tx,y,tz,2+j*.4,.13,0xa5997b);for(let k=0;k<10;k++){const a=k*2.4;crowns.push([tx+Math.cos(a)*.7,y+2.5+j*.4+Math.sin(k*1.7)*.5,tz+Math.sin(a)*.7,1.8,1.6,1,k*1.8]);}}
      for(let j=0;j<4;j++){const a=j*1.7;mesh(new THREE.IcosahedronGeometry(1,1),0x798d91,x+Math.cos(a)*s*.6,y-s*.6,z+Math.sin(a)*s*.6,[s*.45,s*.3,s*.4]);}
    }
    const foliage=batches(new THREE.PlaneGeometry(1,1),0xc5dfba,crowns);foliage.material.map=leafTexture||null;foliage.material.alphaTest=.4;foliage.material.side=THREE.DoubleSide;
    // Rails visibly mark the safe central garden rather than suggesting a walkable drop.
    for(const side of [-1,1]){const x=side*6.1;for(let i=0;i<10;i++)pole(x,groundY(x,-3+i*1.7),-3+i*1.7,.72,.065,0xf1e7cb);mesh(box,0xf1e7cb,x,.65,4.5,[.1,.09,16.6]);}
    const gate=mesh(new THREE.TorusGeometry(3,.065,10,70,Math.PI),0xe0cda2,0,.8,-5.4);gate.rotation.z=0;
    const balloonStart=root.children.length;
    const balX=-7,balY=8,balZ=-17;
    const balloon=mesh(sphere,0xf4d7ab,balX,balY,balZ,[1.25,1.65,1.25]);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const seam=mesh(new THREE.TorusGeometry(1.24,.018,5,48),0xe8b48a,balX,balY,balZ);seam.rotation.y=a;seam.scale.y=1.33;}
    mesh(new THREE.CylinderGeometry(.34,.27,.42,12),0xb89360,balX,balY-2.32,balZ);
    for(const dx of [-.25,.25]){const rope=mesh(new THREE.CylinderGeometry(.012,.012,.95,5),0x9e876a,balX+dx,balY-1.7,balZ);}
    const balloonGroup=new THREE.Group();balloonGroup.name='floating-balloon';for(const part of root.children.slice(balloonStart))balloonGroup.add(part);root.add(balloonGroup);animations.push(t=>balloonGroup.position.y=Math.sin(t*.38)*.18);
    for(const side of [-1,1]){const x=side*3.8,z=-3.4;mesh(new THREE.CylinderGeometry(.62,.45,.4,24),0xd8cbb0,x,.2,z);pole(x,.4,z,2.1,.1,0x9d8961);const cloudTree=[];for(let i=0;i<7;i++)cloudTree.push([x+Math.cos(i*2.4)*.55,2.5+Math.sin(i*1.8)*.25,z+Math.sin(i*2.4)*.55,.68,.48,.63]);batches(sphere,0xa9c6a0,cloudTree);colliders.push({x,z,radius:.7,height:3.5});}
    const stepping=[];for(let i=0;i<13;i++)stepping.push([0,.025,-2.5-i*.22,.5,.03,.09]);batches(box,0xd1ba91,stepping);
  } else if(id==='moon'){
    stars();
    const moon=mesh(new THREE.SphereGeometry(1,24,16),0xd9e2d6,-3,6,-22,1.1,root,true);moon.material=moon.material.clone();moon.material.emissiveIntensity=.25;moon.material.roughness=1;
    const moonLight=new THREE.DirectionalLight(0xb8d5ff,.3);moonLight.position.set(-4,8,-25);root.add(moonLight);
    const pondX=-5.2,pondZ=-3.6,y=groundY(pondX,pondZ)+.03;
    const water=mesh(new THREE.CircleGeometry(2.9,64),0x7b9cbd,pondX,y,pondZ);water.rotation.x=-Math.PI/2;water.scale.y=1.3;water.material.dispose();water.material=new THREE.MeshStandardMaterial({color:0x8aaec5,roughness:.14,metalness:.55});
    for(let i=0;i<4;i++){const ring=mesh(new THREE.TorusGeometry(.55+i*.45,.016,5,64),0xbcd3df,pondX,y+.015,pondZ);ring.rotation.x=-Math.PI/2;ring.scale.y=1.3;ring.name='pond-ripple';animations.push(t=>{const swell=1+Math.sin(t*.65-i*.9)*.018;ring.scale.set(swell,1.3*swell,1);});}
    colliders.push({x:pondX,z:pondZ,radius:3.7,height:.15});
    const x=1.8,z=-7.8,base=groundY(x,z);
    mesh(new THREE.CylinderGeometry(1.8,1.9,.22,6),0xb8b6a6,x,base+.1,z);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;pole(x+Math.cos(a)*1.5,base,z+Math.sin(a)*1.5,2.6,.09,0xb5b7b0);}
    mesh(new THREE.ConeGeometry(2.1,1.15,6),0x4f657d,x,base+3.05,z);mesh(sphere,0xffd7a1,x,base+2.4,z,.22,root,true);
    pole(5.5,groundY(5.5,1.5),1.5,1.1,.09,0xb3a27f);
    mesh(box,0x788f9b,5.5,groundY(5.5,1.5)+1.25,1.5,[.55,.55,.4]);mesh(box,0xffe0a9,5.5,groundY(5.5,1.5)+1.3,1.71,[.32,.025,.015],root,true);
    colliders.push({x,z,radius:2.1,height:3.7},{x:5.5,z:1.5,radius:.35,height:1.6});
    const shore=[],lilies=[];for(let i=0;i<42;i++){const a=i*Math.PI*2/42;shore.push([pondX+Math.cos(a)*2.97,y+.04,pondZ+Math.sin(a)*3.83,.23,.12,.17]);if(i%7===0)lilies.push([pondX+Math.cos(a)*1.6,y+.035,pondZ+Math.sin(a)*2,.22,.018,.18]);}batches(sphere,0x7c8c86,shore);batches(sphere,0x739888,lilies);
    // A post-office facade sits behind the existing pavilion, with warm windows and a little clock.
    mesh(box,0xbebfac,x,base+1.28,z-.9,[2.1,2.4,.12]);windowAt(x-.55,base+1.65,z-.8,.45,.6);windowAt(x+.55,base+1.65,z-.8,.45,.6);
    mesh(box,0x637d79,x,base+.65,z-.77,[.6,1.15,.08]);const clock=mesh(new THREE.CircleGeometry(.22,32),0xffe7b1,x,base+2.25,z-.82);mesh(box,0x5b6a62,x,base+2.3,z-.80,[.018,.13,.02]);mesh(box,0x5b6a62,x+.055,base+2.25,z-.80,[.12,.018,.02]);
    for(const [lx,lz] of [[-2.4,-2.4],[4,-4],[-4,3],[4,6],[-3.5,10]])lantern(lx,lz);
    for(const [lx,lz,power] of [[-2.4,-2.4,3.2],[1.8,-6.8,5]]){const light=new THREE.PointLight(0xffc88b,power,8,2);light.position.set(lx,groundY(lx,lz)+1.8,lz);root.add(light);}
    // Small mail slots and a hanging sign make the pavilion read as a post office.
    const slots=[];for(let i=0;i<3;i++)slots.push([x-.8+i*.8,base+.76,z-.79,.24,.035,.04]);batches(box,0x506974,slots);
    mesh(box,0x49616a,x,base+2.6,z+.9,[1.15,.3,.08]);
    const envelope=mesh(box,0xf1d4a1,x,base+2.6,z+.96,[.28,.15,.025]);envelope.rotation.z=.12;
  }
  // Shared primitive geometries may be unreferenced on a given stage.
  if(!root.children.some(c=>c.geometry===sphere)&&!root.getObjectByProperty('geometry',sphere))sphere.dispose();
  if(!root.getObjectByProperty('geometry',box))box.dispose();
  return {colliders,animate(t,reduced,energy=0){for(const fn of animations)fn(reduced?0:t,reduced?0:Math.max(0,Math.min(1,energy)));}};
}


