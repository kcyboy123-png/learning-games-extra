import * as THREE from './lib/three.module.min.js';

export const PALETTES = {
  basic: {sky:0x8fc3dc,horizon:0xdde8cd,fog:0xdce2cb,ground:0x7fa64f,deep:0x5a7d3c,warm:0xc4c76d,leaf:0xffffff,sun:0xffedc8,power:2,ambient:.95,exposure:1.05,trees:30,farTrees:64,shafts:.22},
  pop: {sky:0x82cbdc,horizon:0xffe5c2,fog:0xe8e6ca,ground:0x8cbb70,deep:0x4c8761,warm:0xd9d292,leaf:0xe4ffcf,sun:0xffdeb1,power:2,ambient:1,exposure:1.06,trees:18,farTrees:40,shafts:.14},
  warm: {sky:0x9bc7cf,horizon:0xffe4b8,fog:0xe8dfbc,ground:0xa6b76b,deep:0x798b51,warm:0xead59a,leaf:0xf6e5ae,sun:0xffd69a,power:1.8,ambient:1,exposure:1.05,trees:12,farTrees:28,shafts:.18},
  dream: {sky:0x101738,horizon:0x535b83,fog:0x35455f,ground:0x41677c,deep:0x253d58,warm:0x779391,leaf:0x8aa4ed,sun:0xb8cdff,power:.9,ambient:.85,exposure:1.12,trees:24,farTrees:40,shafts:.08},
  journey: {sky:0x6ebce5,horizon:0xe8f2ec,fog:0xcbe8ef,ground:0xa6c59a,deep:0x84a8a1,warm:0xe8e2bf,leaf:0xc7f4d6,sun:0xfff1d1,power:1.7,ambient:1.2,exposure:1.05,trees:0,farTrees:0,shafts:.07},
  moon: {sky:0x111c36,horizon:0x617a93,fog:0x3b516b,ground:0x527576,deep:0x2c505e,warm:0x899985,leaf:0x9dbfcb,sun:0xcbdfff,power:1,ambient:.9,exposure:1.1,trees:16,farTrees:35,shafts:.07}
};

// All landmarks live outside the shared walking corridor; no map can block the piano approach.
export function buildLandmarks(parent,id,groundY,leafTexture) {
  const root=new THREE.Group();parent.add(root);
  const animations=[],colliders=[],materials=new Map();
  const material=(color,glow=false)=>{
    const key=`${color}-${glow}`;
    if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.04,emissive:glow?color:0,emissiveIntensity:glow?.8:0}));
    return materials.get(key);
  };
  const mesh=(g,c,x,y,z,s=1,group=root,glow=false)=>{const m=new THREE.Mesh(g,material(c,glow));m.position.set(x,y,z);typeof s==='number'?m.scale.setScalar(s):m.scale.set(...s);m.castShadow=!glow;m.receiveShadow=true;group.add(m);return m;};
  const sphere=new THREE.SphereGeometry(1,16,10),box=new THREE.BoxGeometry(1,1,1);
  const pole=(x,y,z,h,r=.05,c=0xa58c61,g=root)=>mesh(new THREE.CylinderGeometry(r,r*1.18,h,10),c,x,y+h/2,z,1,g);
  const batches=(geo,c,items,glow=false)=>{const m=new THREE.InstancedMesh(geo,material(c,glow),items.length),dummy=new THREE.Object3D();items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...(p.length>=6?p.slice(3,6):[p[3]||1,p[3]||1,p[3]||1]));dummy.rotation.set(0,p[6]||0,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});root.add(m);return m;};
  const stars=()=>{const a=[];for(let i=0;i<350;i++){const t=i*2.39996,r=35+(i%17),y=10+(i%23)*1.3;a.push(Math.cos(t)*r,y,Math.sin(t)*r-10);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));root.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xe4edff,size:.1,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false})));};
  const lantern=(x,z)=>{const y=groundY(x,z);pole(x,y,z,1.6,.045,0x72594a);mesh(box,0x6e5745,x,y+1.58,z,[.29,.04,.29]);mesh(box,0xffd390,x,y+1.8,z,[.21,.36,.21],root,true);mesh(new THREE.ConeGeometry(.24,.18,4),0x6e5745,x,y+2.07,z,1);colliders.push({x,z,radius:.18,height:2.2});};

  if(id==='pop'){
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
    for(let i=0;i<7;i++){const x=6.7,z=-1+i*.6,y=groundY(x,z)+.55;mesh(box,[0xeaa1aa,0xf0ba78,0xe2d777,0x94c9a0,0x7fb9d1,0x9eafe1,0xcaa4d8][i],x,y,z,[1.8-i*.12,.18,.47]);}
    colliders.push({x:6.7,z:.8,radius:1.1,height:.8});
  } else if(id==='warm'){
    for(const [x,z,size] of [[-.8,-6.5,1],[8.2,-7,1],[-12,-12,.8]]){
      const y=groundY(x,z);mesh(new THREE.CylinderGeometry(.5,.85,3.5,16),0xe5d4ae,x,y+1.75*size,z,size);mesh(new THREE.ConeGeometry(.85,1,12),0x9a6850,x,y+3.9*size,z,size);
      const rotor=new THREE.Group();rotor.position.set(x,y+3*size,z+.62*size);rotor.scale.setScalar(size);root.add(rotor);
      for(let i=0;i<4;i++){const blade=new THREE.Group();blade.rotation.z=i*Math.PI/2;rotor.add(blade);mesh(box,0x96744e,0,.95,0,[.07,2.2,.06],blade);mesh(box,0xf6e6bf,.21,1.27,0,[.42,1.25,.05],blade);for(let j=0;j<4;j++)mesh(box,0xc0a17a,.21,.75+j*.3,.04,[.42,.035,.04],blade);}
      mesh(sphere,0x94704e,0,0,.07,.15,rotor);animations.push(t=>rotor.rotation.z=t*.18);
    }
    const seedHeads=[];for(let i=0;i<100;i++){const side=i%2?1:-1,x=side*(6.3+(i%9)*.19),z=-3+Math.floor(i/2)*.24,y=groundY(x,z);seedHeads.push([x,y+.65+(i%3)*.09,z,.05,.16,.05]);}batches(sphere,0xe1ca85,seedHeads);
  } else if(id==='dream'){
    stars();const petals=[],cores=[];
    for(let i=0;i<32;i++){const side=i%2?1:-1,x=side*(3.3+(i%5)*.4),z=-4+Math.floor(i/2)*.85,y=groundY(x,z)+.28;cores.push([x,y,z,.065]);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;petals.push([x+Math.cos(a)*.15,y,z+Math.sin(a)*.15,.12,.045,.1]);}}
    batches(sphere,0x9cbdff,petals,true);batches(sphere,0xffe8a2,cores,true);
    const halo=mesh(new THREE.TorusGeometry(2.1,.035,8,70),0xaabdf1,0,3.4,-5.5,1,root,true);halo.rotation.y=.15;
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
  } else if(id==='moon'){
    stars();mesh(sphere,0xffedc7,3,6,-18,1.6,root,true);
    const pondX=-8.3,pondZ=-2.2,y=groundY(pondX,pondZ)+.03;
    const water=mesh(new THREE.CircleGeometry(2.9,64),0x7b9cbd,pondX,y,pondZ);water.rotation.x=-Math.PI/2;water.scale.y=1.3;water.material.dispose();water.material=new THREE.MeshStandardMaterial({color:0x8aaec5,roughness:.14,metalness:.55});
    for(let i=0;i<4;i++){const ring=mesh(new THREE.TorusGeometry(.55+i*.45,.016,5,64),0xbcd3df,pondX,y+.015,pondZ);ring.rotation.x=-Math.PI/2;ring.scale.y=1.3;}
    colliders.push({x:pondX,z:pondZ,radius:3.7,height:.15});
    const x=7.6,z=-3.2,base=groundY(x,z);
    mesh(new THREE.CylinderGeometry(1.8,1.9,.22,6),0xb8b6a6,x,base+.1,z);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;pole(x+Math.cos(a)*1.5,base,z+Math.sin(a)*1.5,2.6,.09,0xb5b7b0);}
    mesh(new THREE.ConeGeometry(2.1,1.15,6),0x4f657d,x,base+3.05,z);mesh(sphere,0xffd7a1,x,base+2.4,z,.22,root,true);
    pole(5.5,groundY(5.5,1.5),1.5,1.1,.09,0xb3a27f);
    mesh(box,0x788f9b,5.5,groundY(5.5,1.5)+1.25,1.5,[.55,.55,.4]);mesh(box,0xffe0a9,5.5,groundY(5.5,1.5)+1.3,1.71,[.32,.025,.015],root,true);
    colliders.push({x,z,radius:2.1,height:3.7},{x:5.5,z:1.5,radius:.35,height:1.6});
    for(const [lx,lz] of [[-4,-4],[4,-4],[-4,3],[4,6],[-3.5,10]])lantern(lx,lz);
  }
  // Shared primitive geometries may be unreferenced on a given stage.
  if(!root.children.some(c=>c.geometry===sphere)&&!root.getObjectByProperty('geometry',sphere))sphere.dispose();
  if(!root.getObjectByProperty('geometry',box))box.dispose();
  return {colliders,animate(t,reduced){for(const fn of animations)fn(reduced?0:t);}};
}


