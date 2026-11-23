import * as THREE from './lib/three.module.min.js';
import {copyChristmasTree} from './christmas-tree.mjs';

export const PALETTES = {
  christmas:{sky:0x364968,horizon:0xb8baca,fog:0x9caec2,ground:0xe0e8ed,deep:0xb6c8d5,warm:0xf0e5d4,leaf:0xe6edf2,sun:0xffdcaa,power:1.65,ambient:.85,exposure:1.08,light:[-6,9,3],trees:20,farTrees:40,shafts:.02},
  basic: {sky:0x80b7d4,horizon:0xc2d9d0,fog:0xb7cfc0,ground:0x829b68,deep:0x49634c,warm:0xb8bb88,leaf:0xffffff,sun:0xffe4ba,power:2.25,ambient:.82,exposure:1.03,light:[-7,10,3],trees:30,farTrees:64,shafts:.065},
  pop: {sky:0x7fc6e4,horizon:0xcbdfe1,fog:0xc8d8c8,ground:0x8ba879,deep:0x526e5c,warm:0xc9c590,leaf:0xf3efd9,sun:0xffe4c0,power:2.2,ambient:.84,exposure:1.04,light:[-6,9,4],trees:18,farTrees:40,shafts:.025},
  warm: {sky:0x9bbecb,horizon:0xe8cfab,fog:0xd4c2a2,ground:0x9e9b67,deep:0x72704e,warm:0xd3b57c,leaf:0xffcf84,sun:0xffc880,power:2.3,ambient:.76,exposure:1.03,light:[-8,7,2],trees:12,farTrees:28,shafts:.04},
  dream: {sky:0x10172f,horizon:0x343c62,fog:0x293857,ground:0x41677c,deep:0x253d58,warm:0x6d888d,leaf:0x9babdf,sun:0xb8cdff,power:1.02,ambient:.64,exposure:1.08,light:[-5,9,2],character:0xbbc6d6,trees:24,farTrees:40,shafts:.018},
  journey: {sky:0x69b8e3,horizon:0xb9dcea,fog:0xbdd8e6,ground:0x91b089,deep:0x668f85,warm:0xd5d6aa,leaf:0xdbf0d3,sun:0xffebc7,power:2.15,ambient:.78,exposure:1.02,light:[-7,10,3],trees:0,farTrees:0,shafts:.015},
  moon: {sky:0x101a30,horizon:0x344760,fog:0x2b3d55,ground:0x527576,deep:0x2c505e,warm:0x80938a,leaf:0xa9c4d2,sun:0xcbdfff,power:1.05,ambient:.66,exposure:1.07,light:[-5,10,-4],character:0xc4cedc,trees:16,farTrees:35,shafts:.018},
  rain: {sky:0x586e81,horizon:0xa6b5ba,fog:0x92a8ad,ground:0x627f73,deep:0x3c5b59,warm:0x99aaa0,leaf:0xb5cbd0,sun:0xd8e4e8,power:.9,ambient:.86,exposure:1.04,light:[-6,11,2],character:0xcbd7dc,trees:22,farTrees:48,shafts:0},
  sunset: {sky:0x65728f,horizon:0xd9aaa1,fog:0xb9a6a8,ground:0x7e8575,deep:0x535e62,warm:0xb8a18a,leaf:0xe3b8a1,sun:0xffc19c,power:1.45,ambient:.76,exposure:1.04,light:[-12,4,-9],trees:12,farTrees:30,shafts:.018,lake:true}
};

// Landscape-specific color and planting, shared by the live scenery renderer.
Object.assign(PALETTES.christmas,{sky:0x101f39,horizon:0x394967,fog:0x526681,ground:0xe7eef5,deep:0xb3c5db,warm:0xf4ede3,leaf:0xdde8ef,trees:12,farTrees:26,flowers:[],meadow:[0xb8c8d2,0xd4dde2,0xa5b9c4],foliage:[0xd5e3ed,0xb2c9d9,0xe6edf0,0xc5d6df],path:0xd2d8df,winter:true,power:1.35,ambient:.64,character:0xe6d5c8,exposure:1.08,sun:0xffd6a3});
Object.assign(PALETTES.basic,{flowers:[0xfff6c9,0xf8e6a8,0xf4e7cf],meadow:[0x90aa55,0xb8bd77,0x738e4d]});
Object.assign(PALETTES.pop,{sky:0x75bfd4,horizon:0xe7d7c5,flowers:[0xeb8eaa,0xffd474,0xc8a8e2],meadow:[0x87a978,0xa6bf8b,0x618d70]});
Object.assign(PALETTES.warm,{horizon:0xf2d49c,fog:0xd7bb8e,flowers:[0xe3bc62,0xf5df9c,0xcb9358],meadow:[0xc8af66,0xe2cb86,0xa78f55],foliage:[0xe6ac53,0xd68b37,0xeed092,0xbd914a]});
Object.assign(PALETTES.dream,{sky:0x18152f,horizon:0x48446c,fog:0x353752,flowers:[0xb8b0da,0xd8dbec,0x879ad2],meadow:[0x526f83,0x6b8698,0x4f637d]});
Object.assign(PALETTES.journey,{flowers:[0xfff0ca,0xb9dceb,0xf3d4ba],meadow:[0x9dbf8c,0xc2d5a2,0x83ab86]});
Object.assign(PALETTES.moon,{sky:0x10263a,horizon:0x3c6376,fog:0x365565,flowers:[0xc5ddd9,0xa5c8cc,0xe5e6cd],meadow:[0x537c79,0x78958b,0x426766]});
Object.assign(PALETTES.rain,{sky:0x486578,horizon:0x8ca8af,fog:0x7e9da4,flowers:[0x8eafc5,0xb4c9d5,0x7ba3b5],meadow:[0x537f73,0x74998b,0x3d695f],foliage:[0x94b7b0,0x719e94,0xb5cbc1,0x85aaa3],path:0x879b9c});
Object.assign(PALETTES.sunset,{sky:0x756c93,horizon:0xf2b491,fog:0xcea18e,ground:0xa18d73,warm:0xd0ae86,flowers:[0xe8c192,0xe2a579,0xc88c82],meadow:[0xb29b72,0xcbb68d,0x8d8868],foliage:[0xf4c18c,0xd79865,0xe9b5a0,0xc9a280]});

// All landmarks live outside the shared walking corridor; no map can block the piano approach.
export function buildLandmarks(parent,id,groundY,leafTexture,woodTexture,glowTexture,christmasTree=null,christmasLantern=null,christmasArch=null,distantTree=null) {
  const root=new THREE.Group();root.name='landmarks-'+id;parent.add(root);
  const animations=[],colliders=[],materials=new Map(),animatedTransforms=new Set();
  const animateObject=(object,fn)=>{animatedTransforms.add(object);animations.push(fn);};
  // Each stage owns its grain map so switching maps never disposes the piano's texture.
  const grain=['basic','pop','warm','moon','rain','sunset'].includes(id)&&woodTexture?woodTexture.clone():null;
  if(grain){grain.repeat.set(3,2);grain.needsUpdate=true;}
  const material=(color,glow=false)=>{
    const key=`${color}-${glow}`;
    if(!materials.has(key)){
      const timber=!glow&&[0xceae79,0xb49360,0xa78659,0x92714e,0x8e7653,0xb5b7b0,0xbebfac,0x906f51,0x96744e,0xb59d71,0x806346].includes(color);
      materials.set(key,new THREE.MeshStandardMaterial({color,map:timber?grain:null,bumpMap:timber?grain:null,bumpScale:.018,roughness:timber?.9:.72,metalness:.04,emissive:glow?color:0,emissiveIntensity:glow?.55:0}));
    }
    return materials.get(key);
  };
  const mesh=(g,c,x,y,z,s=1,group=root,glow=false)=>{const m=new THREE.Mesh(g,material(c,glow));m.position.set(x,y,z);typeof s==='number'?m.scale.setScalar(s):m.scale.set(...s);m.castShadow=!glow;m.receiveShadow=true;group.add(m);return m;};
  const sphere=new THREE.SphereGeometry(1,16,10),box=new THREE.BoxGeometry(1,1,1);
  const pole=(x,y,z,h,r=.05,c=0xa58c61,g=root)=>mesh(new THREE.CylinderGeometry(r,r*1.18,h,10),c,x,y+h/2,z,1,g);
  const batches=(geo,c,items,glow=false)=>{const m=new THREE.InstancedMesh(geo,material(c,glow),items.length),dummy=new THREE.Object3D();items.forEach((p,i)=>{dummy.position.set(...p.slice(0,3));dummy.scale.set(...(p.length>=6?p.slice(3,6):[p[3]||1,p[3]||1,p[3]||1]));dummy.rotation.set(0,p[6]||0,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.castShadow=!glow;m.receiveShadow=true;root.add(m);return m;};
  const stars=()=>{const a=[];for(let i=0;i<350;i++){const t=i*2.39996,r=35+(i%17),y=7+((Math.sin(i*127.1)*43758.5453)%1+1)%1*33;a.push(Math.cos(t)*r,y,Math.sin(t)*r-10);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));root.add(new THREE.Points(g,new THREE.PointsMaterial({map:glowTexture||null,color:0xd4e3f2,size:.16,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false,fog:false})));};
  const snowfall=(layers,speed=.65,color=0xf4f8ff)=>{
    const snowTime={value:0};
    for(const [layer,count,size,opacity] of layers){
      const snow=[];for(let i=0;i<count;i++){const n=i+layer*1321;snow.push(Math.sin(n*127.1)*14,(n*1.618)%12,Math.cos(n*71.7)*(layer?7:17)-5);}
      const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.Float32BufferAttribute(snow,3));
      const snowMaterial=new THREE.PointsMaterial({color,map:glowTexture||null,size,transparent:true,opacity,depthWrite:false});
      snowMaterial.onBeforeCompile=shader=>{
        shader.uniforms.snowTime=snowTime;shader.uniforms.snowSpeed={value:speed};
        shader.uniforms.snowMaxSize={value:layer?18:12};
        shader.vertexShader='uniform float snowTime; uniform float snowSpeed; uniform float snowMaxSize; varying float snowVisibility;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mod(position.y-snowTime*(snowSpeed+.09*mod(abs(position.x),5.))+120.,12.)-.3;transformed.x+=sin(snowTime*.65+position.z)*.55;transformed.z+=sin(snowTime*.23+position.x)*.28;');
        // Fade flakes near the lens and ground; cap raster size without reducing snowfall density.
        shader.vertexShader=shader.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\ngl_PointSize=min(gl_PointSize,snowMaxSize);snowVisibility=smoothstep(.6,2.6,-mvPosition.z)*smoothstep(-.3,.35,transformed.y);');
        shader.fragmentShader='varying float snowVisibility;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_particle_fragment>','#include <map_particle_fragment>\ndiffuseColor.a*=snowVisibility;');
      };
      const flakes=new THREE.Points(snowGeo,snowMaterial);flakes.name=layer?'winter-snow-near':'winter-snow';flakes.frustumCulled=false;root.add(flakes);
      animations.push(t=>{snowTime.value=t;snowMaterial.opacity=t===0?opacity*.45:opacity;});
    }
  };
  const lantern=(x,z)=>{const y=groundY(x,z);pole(x,y,z,1.6,.045,0x72594a);mesh(box,0x6e5745,x,y+1.58,z,[.29,.04,.29]);mesh(box,0xffd390,x,y+1.8,z,[.21,.36,.21],root,true);mesh(new THREE.ConeGeometry(.24,.18,4),0x6e5745,x,y+2.07,z,1);colliders.push({x,z,radius:.18,height:2.2});};

  // A quiet stone clearing grounds the piano; the path into it stays flat and open.
  const clearing=mesh(new THREE.CircleGeometry(1.85,64),id==='dream'||id==='moon'?0x566b74:0xa2a88d,0,.008,-.62);clearing.rotation.x=-Math.PI/2;clearing.castShadow=false;
  // Three broken rings of small stone pavers replace the featureless circular slab.
  for(let band=0;band<3;band++){
    const count=12+band*6,inner=.06+band*.58,geo=new THREE.RingGeometry(inner+.012,inner+.56,6,1,.018,Math.PI*2/count-.036);
    const paving=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:id==='moon'||id==='dream'?0x8a9690:0xb8ad91,roughness:.96}),count),dummy=new THREE.Object3D();
    paving.name='clearing-pavers';
    for(let i=0;i<count;i++){dummy.position.set(0,.012,-.62);dummy.rotation.set(-Math.PI/2,0,i*Math.PI*2/count+band*.19);dummy.updateMatrix();paving.setMatrixAt(i,dummy.matrix);paving.setColorAt(i,new THREE.Color().setScalar(.88+(i%4)*.035));}
    paving.receiveShadow=true;root.add(paving);
  }
  const border=[],edgeMoss=[];for(let i=0;i<38;i++){const a=i*Math.PI*2/38,r=1.84+Math.sin(i*4.7)*.035;border.push([Math.cos(a)*r,.009,-.62+Math.sin(a)*r,.11+(i%3)*.015,.026,.075+(i%4)*.008,-a]);if(i%3===0)edgeMoss.push([Math.cos(a+.06)*1.83,.016,-.62+Math.sin(a+.06)*1.83,.10,.018,.07,-a]);}batches(sphere,0x929879,border);batches(sphere,id==='moon'||id==='dream'?0x526c63:0x788a52,edgeMoss);
  const windowAt=(x,y,z,w=.45,h=.6)=>{mesh(box,0x594c3b,x,y,z,[w+.12,h+.12,.09]);mesh(box,0xffdfa0,x,y,z+.055,[w,h,.025],root,true);mesh(box,0x78664c,x,y,z+.08,[.035,h,.025]);mesh(box,0x78664c,x,y,z+.08,[w,.035,.025]);};
  const shingles=(x,y,z,r,rows,color)=>{for(let i=0;i<rows;i++){const radius=r*(1-i/rows);mesh(new THREE.ConeGeometry(radius,.5,12),color,x,y+i*.28,z);}};

  // Layered cloud banks sit beyond the trees; the island map also has clouds below its ledge.
  if(!PALETTES[id].character){
    const puffs=[];for(let i=0;i<7;i++){const x=-38+i*12,z=-42-(i%3)*8,y=13+(i%3)*2.1;for(let k=0;k<5;k++)puffs.push([x+(k-2)*1.5,y+Math.sin(k*.8)*.6,z+(k%2)*.5,2.3,.8+(k%3)*.3,1.3]);}
    const clouds=batches(sphere,id==='warm'?0xeee0c8:0xeaf3f6,puffs);clouds.castShadow=false;clouds.material.roughness=1;
  }

  if(id==='christmas'){
    if(christmasArch){
      const arch=copyChristmasTree(christmasArch);arch.position.set(-.3,groundY(-.3,-4.6),-4.6);root.add(arch);
      arch.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(arch);
      for(const xx of [bounds.min.x+.35,bounds.max.x-.35])colliders.push({x:xx,z:-4.6,radius:.48,height:5.4});
    }
    stars();
    const x=-.3,z=-10.5,y=groundY(x,z);
    if(christmasTree){const tree=copyChristmasTree(christmasTree);tree.position.set(x,y,z);root.add(tree);
      const lamps=[];for(let i=0;i<96;i++){const t=i/95,a=t*Math.PI*12,h=1+t*3.85,r=1.65*(1-t)+.12;lamps.push([x+Math.cos(a)*r,y+h,z+Math.sin(a)*r,.025,.025,.025]);}
      const bulbs=batches(sphere,0xffce78,lamps,true);bulbs.material=new THREE.MeshBasicMaterial({color:0xffd491});
    }else{
    pole(x,y,z,4.8,.2,0x72594a);
    for(let j=0;j<5;j++){
      const r=2.25-j*.37,h=y+1.25+j*.68;
      const branch=new THREE.ConeGeometry(r,1.9,32,5),bp=branch.attributes.position;
      for(let i=0;i<bp.count;i++){const a=Math.atan2(bp.getZ(i),bp.getX(i)),q=1+.045*Math.sin(a*11+j)+.025*Math.cos(a*17);bp.setX(i,bp.getX(i)*q);bp.setZ(i,bp.getZ(i)*q);bp.setY(i,bp.getY(i)+.035*Math.sin(a*13+j));}branch.computeVertexNormals();
      mesh(branch,j%2?0x315b4c:0x244b40,x,h,z);
      const powder=new THREE.ConeGeometry(r*.80,.32,32,2),pp=powder.attributes.position;
      for(let i=0;i<pp.count;i++){const a=Math.atan2(pp.getZ(i),pp.getX(i)),q=1+.06*Math.sin(a*7+j);pp.setX(i,pp.getX(i)*q);pp.setZ(i,pp.getZ(i)*q);pp.setY(i,pp.getY(i)+.045*Math.sin(a*9));}powder.computeVertexNormals();mesh(powder,0xe2e9ef,x,h+.72,z);
      for(let k=0;k<12;k++){const t=k*Math.PI/6+j*.6;mesh(sphere,k%3?0xffd184:0xb64b49,x+Math.cos(t)*r*.77,h-.35,z+Math.sin(t)*r*.77,.065,root,true);}
    }
    const garland=[];for(let i=0;i<180;i++){const t=i/179,height=.45+t*4.2,r=2.08*(1-t)+.10,a=t*Math.PI*10;garland.push([x+Math.cos(a)*r,y+height,z+Math.sin(a)*r,.026,.026,.026]);}batches(sphere,0xffce7f,garland,true);
    const ornaments=[[],[]];for(let i=0;i<42;i++){const t=(i+.5)/42,height=.7+t*3.8,r=1.95*(1-t)+.12,a=i*2.4;ornaments[i%2].push([x+Math.cos(a)*r,y+height,z+Math.sin(a)*r,.075,.09,.075]);}ornaments.forEach((items,i)=>{const m=batches(sphere,i?0xc39343:0xa84543,items);m.material=m.material.clone();m.material.metalness=.32;m.material.roughness=.32;});
    const shape=new THREE.Shape();for(let k=0;k<10;k++){const t=k*Math.PI/5+Math.PI/2,r=k%2?.17:.4;const px=Math.cos(t)*r,py=Math.sin(t)*r;k?shape.lineTo(px,py):shape.moveTo(px,py);}shape.closePath();
    mesh(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false}),0xffdf8c,x,y+5.05,z,1,root,true);
    }
    let lampTemplate;
    for(const [lx,lz] of [[-3,-3],[-4,2],[4,2]]){
      if(christmasLantern){const lamp=lampTemplate?lampTemplate.clone(true):copyChristmasTree(christmasLantern);lampTemplate=lamp;lamp.position.set(lx,groundY(lx,lz),lz);root.add(lamp);colliders.push({x:lx,z:lz,radius:.3,height:2.2});}else lantern(lx,lz);
    }
    // Smaller copies guide the eye towards the cabin, sharing the existing lamp's resources.
    for(const [lx,lz] of [[-4.8,-5],[-6.1,-7.3],[-7.2,-9.4]]){
      if(lampTemplate){const lamp=lampTemplate.clone(true);lamp.name='christmas-path-lantern';lamp.scale.multiplyScalar(.46);lamp.position.set(lx,groundY(lx,lz),lz);root.add(lamp);colliders.push({x:lx,z:lz,radius:.18,height:1.05});}
    }
    const bench=new THREE.Group();bench.name='christmas-snow-bench';bench.position.set(4.9,groundY(4.9,-4.8),-4.8);bench.rotation.y=-.25;root.add(bench);
    for(const side of [-1,1]){
      for(const z of [-.23,.23])mesh(box,0x685b50,side*.76,.27,z,[.09,.54,.09],bench);
      mesh(box,0x685b50,side*.76,.87,-.29,[.075,.9,.075],bench);
      const arm=mesh(new THREE.TorusGeometry(.22,.035,8,24,Math.PI),0x685b50,side*.89,.66,0,1,bench);arm.rotation.y=Math.PI/2;
    }
    for(let i=0;i<4;i++)mesh(box,0xb49360,0,.55,-.24+i*.16,[1.9,.075,.135],bench);
    for(let i=0;i<3;i++)mesh(box,0xa78659,0,.82+i*.18,-.3,[1.9,.13,.07],bench);
    mesh(sphere,0xe7eef5,0,.615,-.04,[.97,.055,.34],bench);mesh(sphere,0xe7eef5,0,1.27,-.3,[.98,.055,.08],bench);
    const benchWreath=mesh(new THREE.TorusGeometry(.17,.05,8,24),0x315c4d,0,1,-.22,1,bench);mesh(sphere,0xa84543,0,.87,-.15,[.12,.055,.04],bench);
    colliders.push({x:4.9,z:-4.8,radius:1.1,height:1.35});
    const snowman=new THREE.Group();snowman.name='christmas-snowman';snowman.position.set(-3.5,groundY(-3.5,-6),-6);snowman.rotation.y=.2;root.add(snowman);
    mesh(sphere,0xe7eef5,0,.45,0,[.52,.47,.47],snowman);mesh(sphere,0xf3f6f5,0,1.02,0,[.38,.36,.34],snowman);mesh(sphere,0xf3f6f5,0,1.5,0,.27,snowman);
    mesh(new THREE.CylinderGeometry(.34,.34,.045,28),0x284d49,0,1.73,0,1,snowman);mesh(new THREE.CylinderGeometry(.22,.25,.3,24),0x284d49,0,1.9,0,1,snowman);
    mesh(new THREE.CylinderGeometry(.247,.25,.065,24),0xb34c49,0,1.79,0,1,snowman);mesh(sphere,0xe7eef5,0,2.06,0,[.23,.035,.23],snowman);
    for(const side of [-1,1])mesh(sphere,0x35414a,side*.09,1.55,.239,.027,snowman);
    const nose=mesh(new THREE.ConeGeometry(.055,.22,12),0xd68b49,0,1.47,.32,1,snowman);nose.rotation.x=Math.PI/2;
    for(let i=0;i<5;i++){const a=Math.PI*(.18+i*.16);mesh(sphere,0x35414a,Math.cos(a)*.115,1.44-Math.sin(a)*.065,.24,.014,snowman);}
    const scarf=mesh(new THREE.TorusGeometry(.28,.065,10,30),0xb34c49,0,1.3,0,1,snowman);scarf.rotation.x=Math.PI/2;
    const tail=mesh(box,0xb34c49,.16,1.07,.33,[.14,.4,.045],snowman);tail.rotation.z=-.15;
    for(let i=0;i<3;i++)mesh(box,0xe5c797,.16,.95+i*.09,.357,[.14,.025,.012],snowman);
    for(const h of [.72,.94,1.12])mesh(sphere,0x35414a,0,h,.34,.033,snowman);
    for(const side of [-1,1]){
      const arm=mesh(new THREE.CylinderGeometry(.018,.026,.63,8),0x806346,side*.56,1.1,0,1,snowman);arm.rotation.z=-side*1.05;
      const twig=mesh(new THREE.CylinderGeometry(.012,.016,.23,6),0x806346,side*.77,1.29,0,1,snowman);twig.rotation.z=side*.3;
    }
    colliders.push({x:-3.5,z:-6,radius:.9,height:2.1});

    const sleigh=new THREE.Group();sleigh.name='christmas-gift-sleigh';sleigh.position.set(1.7,groundY(1.7,-5.6),-5.6);sleigh.rotation.y=-.45;root.add(sleigh);
    const runnerCurve=new THREE.CatmullRomCurve3([[-.95,.11,0],[-.4,.09,0],[.5,.09,0],[1.02,.17,0],[1.2,.43,0],[1.08,.57,0]].map(p=>new THREE.Vector3(...p)));
    const runnerGeo=new THREE.TubeGeometry(runnerCurve,28,.035,8,false);
    const sideShape=new THREE.Shape();sideShape.moveTo(-.88,.38);sideShape.lineTo(.87,.38);sideShape.quadraticCurveTo(1.04,.6,.91,.78);sideShape.quadraticCurveTo(.6,.53,.18,.56);sideShape.lineTo(-.48,.56);sideShape.quadraticCurveTo(-.75,.62,-.83,1.04);sideShape.lineTo(-1.01,1.04);sideShape.quadraticCurveTo(-.97,.62,-.88,.38);
    const panelGeo=new THREE.ExtrudeGeometry(sideShape,{depth:.055,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2,steps:1});
    for(const side of [-1,1]){
      mesh(runnerGeo,0xc9a35d,0,0,side*.43,1,sleigh);mesh(panelGeo,0xa84045,0,0,side*.49,1,sleigh);
      for(const xx of [-.65,.62])mesh(box,0xc9a35d,xx,.27,side*.43,[.065,.3,.065],sleigh);
      mesh(box,0xe0be7b,0,.44,side*.525,[1.6,.035,.025],sleigh);
    }
    mesh(box,0x806346,-.03,.43,0,[1.65,.1,.94],sleigh);mesh(box,0xa84045,-.85,.73,0,[.12,.6,1.03],sleigh);
    for(const [gx,gz,size,color,h] of [[-.47,-.08,.48,0x315c4d,.7],[.19,-.14,.43,0xe0be7b,.67],[.45,.25,.32,0xb65c55,.63],[-.45,-.08,.32,0xd0b07b,1.1]]){
      mesh(box,color,gx,h,gz,[size,size,size],sleigh);
      mesh(box,0xf3e3bd,gx,h,gz,[size+.012,size*.12,size+.012],sleigh);mesh(box,0xf3e3bd,gx,h,gz,[size*.12,size+.012,size+.012],sleigh);
      for(const side of [-1,1]){const bow=mesh(new THREE.TorusGeometry(size*.13,.014,6,16),0xf3e3bd,gx+side*size*.12,h+size*.54,gz,1,sleigh);bow.rotation.y=side*.4;}
    }
    colliders.push({x:1.7,z:-5.6,radius:1.3,height:1.35});

    const postbox=new THREE.Group();postbox.name='christmas-santa-postbox';postbox.position.set(-5.1,groundY(-5.1,-2.2),-2.2);postbox.rotation.y=.35;root.add(postbox);
    pole(0,0,0,.9,.075,0x315c4d,postbox);mesh(box,0xa84045,0,1.13,0,[.55,.5,.45],postbox);
    const postRoof=mesh(new THREE.CylinderGeometry(.275,.275,.45,24,1,false,Math.PI/2,Math.PI),0xa84045,0,1.38,0,1,postbox);postRoof.rotation.x=Math.PI/2;
    mesh(sphere,0xe7eef5,0,1.65,0,[.3,.06,.26],postbox);mesh(box,0x493c39,0,1.35,.231,[.36,.045,.015],postbox);
    mesh(box,0xf3e3bd,0,1.13,.235,[.27,.17,.015],postbox);
    const envelope=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.13,1.2,.247),new THREE.Vector3(0,1.1,.247),new THREE.Vector3(.13,1.2,.247)]);postbox.add(new THREE.Line(envelope,new THREE.LineBasicMaterial({color:0xa84045})));
    pole(.32,1.15,0,.4,.015,0xc9a35d,postbox);mesh(box,0xa84045,.41,1.49,0,[.18,.12,.035],postbox);
    mesh(sphere,0xe7eef5,0,.025,0,[.4,.05,.32],postbox);colliders.push({x:-5.1,z:-2.2,radius:.5,height:1.75});
    const bellGeometry=new THREE.LatheGeometry([[.03,.38],[.09,.36],[.15,.28],[.17,.13],[.23,.04],[.25,0],[.22,-.025]].map(p=>new THREE.Vector2(...p)),24);
    for(const side of [-1,1]){
      const decoration=new THREE.Group();decoration.name='christmas-bell-wreath';decoration.position.set(side*4.8,2.85,-7.5);root.add(decoration);
      mesh(new THREE.TorusGeometry(.42,.095,10,32),0x315c4d,0,0,0,1,decoration);
      for(let i=0;i<9;i++){const a=i*Math.PI*2/9;mesh(sphere,0xb74943,Math.cos(a)*.42,Math.sin(a)*.42,.09,.045,decoration);}
      for(const sign of [-1,1]){const bell=mesh(bellGeometry,0xd9b364,sign*.15,-.13,.13,1,decoration);bell.rotation.z=sign*.22;mesh(sphere,0xb6914c,sign*.17,-.18,.13,.045,decoration);const bow=mesh(new THREE.TorusGeometry(.13,.035,8,24),0xad4247,sign*.13,.43,.11,[1,.6,1],decoration);bow.rotation.z=sign*.3;}
      mesh(box,0xad4247,0,.3,.12,[.07,.3,.035],decoration);pole(0,.44,0,.35,.012,0xc9a35d,decoration);
    }
    const stockingShape=new THREE.Shape();stockingShape.moveTo(-.13,.5);stockingShape.lineTo(.13,.5);stockingShape.lineTo(.13,.04);stockingShape.quadraticCurveTo(.37,-.03,.34,-.17);stockingShape.quadraticCurveTo(.29,-.3,-.06,-.23);stockingShape.quadraticCurveTo(-.16,-.17,-.13,.03);stockingShape.closePath();
    const stockingGeo=new THREE.ExtrudeGeometry(stockingShape,{depth:.08,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1});
    for(let i=0;i<3;i++){
      const stocking=new THREE.Group();stocking.name='christmas-stocking';stocking.position.set(-3.5+i*.65,2.43,-7.35);stocking.rotation.z=(i-1)*.1;root.add(stocking);
      mesh(stockingGeo,i===1?0x315c4d:0xad4247,0,0,0,1,stocking);mesh(box,0xf4ebd9,0,.47,.04,[.35,.17,.15],stocking);
      for(let j=0;j<3;j++)mesh(sphere,0xe4c488,0,.28-j*.09,.105,.025,stocking);
      pole(0,.56,0,.5,.012,0xc9a35d,stocking);
    }
    const sack=new THREE.Group();sack.name='christmas-gift-sack';sack.position.set(-2.6,groundY(-2.6,-4.2),-4.2);root.add(sack);
    mesh(sphere,0xa54e48,0,.34,0,[.43,.38,.34],sack);mesh(new THREE.TorusGeometry(.22,.065,10,24),0xb85e52,0,.67,0,1,sack).rotation.x=Math.PI/2;
    mesh(new THREE.TorusGeometry(.24,.016,6,24),0xe4c488,0,.56,0,1,sack).rotation.x=Math.PI/2;
    for(const [gx,gz,c,h] of [[-.12,0,0x315c4d,.81],[.14,.03,0xe4c488,.78]]){const gift=mesh(box,c,gx,h,gz,[.25,.32,.25],sack);gift.rotation.z=gx;mesh(box,0xf4ebd9,gx,h,gz+.13,[.045,.33,.015],sack);}
    colliders.push({x:-2.6,z:-4.2,radius:.45,height:1.05});
    const cookie=new THREE.Group();cookie.name='christmas-gingerbread-house';cookie.position.set(4.3,groundY(4.3,-9),-9);cookie.rotation.y=-.18;root.add(cookie);
    mesh(box,0xb97d50,0,.62,0,[1.15,1.2,.85],cookie);const cookieRoof=mesh(new THREE.ConeGeometry(1.02,.8,4),0x975d42,0,1.57,0,[1,1,.85],cookie);cookieRoof.rotation.y=Math.PI/4;
    const icing=[];for(let i=0;i<11;i++){const t=i/10;icing.push([-.72+t*.72,1.21+t*.75,.62,.075,.065,.07],[t*.72,1.96-t*.75,.62,.075,.065,.07]);}
    for(const item of icing)mesh(sphere,0xf5ebd9,...item.slice(0,3),item.slice(3),cookie);
    mesh(box,0x784d3d,0,.38,.44,[.3,.7,.04],cookie);for(const dx of [-.36,.36]){mesh(box,0xffd698,dx,.8,.445,[.22,.25,.035],cookie,true);mesh(box,0xf5ebd9,dx,.8,.47,[.025,.28,.02],cookie);}
    for(let i=0;i<7;i++)mesh(sphere,i%2?0xad4247:0x315c4d,-.54+i*.18,.07,.64,[.085,.1,.085],cookie);
    colliders.push({x:4.3,z:-9,radius:1,height:2.05});
    const caneCurve=new THREE.CatmullRomCurve3([[0,0,0],[0,.65,0],[0,.96,0],[.05,1.13,0],[.21,1.2,0],[.36,1.1,0],[.37,.94,0]].map(p=>new THREE.Vector3(...p)));
    const caneGeo=new THREE.TubeGeometry(caneCurve,112,.045,10,false),caneColors=[];
    for(let i=0;i<caneGeo.attributes.position.count;i++){const c=new THREE.Color(Math.floor(caneGeo.attributes.uv.getX(i)*16)%2?0xa8323c:0xfff3df);caneColors.push(c.r,c.g,c.b);}
    caneGeo.setAttribute('color',new THREE.Float32BufferAttribute(caneColors,3));
    const caneMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4});
    for(const [cx,cz,turn] of [[-3.7,-1.4,.2],[3.6,-2.4,-.4],[5.8,-6.8,-.8]]){
      const cane=new THREE.Group();cane.name='christmas-candy-cane';cane.position.set(cx,groundY(cx,cz),cz);cane.rotation.y=turn;root.add(cane);
      const stick=new THREE.Mesh(caneGeo,caneMaterial);stick.castShadow=stick.receiveShadow=true;cane.add(stick);
      for(const side of [-1,1]){const bow=mesh(new THREE.TorusGeometry(.07,.02,6,18),0xa84543,side*.065,.65,.06,1,cane);bow.scale.set(1,.65,1);bow.rotation.z=side*.25;}
      mesh(sphere,0xe7eef5,0,.025,0,[.18,.045,.13],cane);colliders.push({x:cx,z:cz,radius:.3,height:1.25});
    }
    for(const [lx,lz] of [[-3,-3],[4,2]]){const light=new THREE.PointLight(0xffc487,4.5,8,2);light.position.set(lx,groundY(lx,lz)+1.8,lz);root.add(light);const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture||null,color:0xffc88f,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.copy(light.position);halo.scale.set(1.5,1.5,1);root.add(halo);}
    const starHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture||null,color:0xffdca6,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}));starHalo.position.set(x,y+5.05,z);starHalo.scale.set(1.7,1.7,1);root.add(starHalo);

    const banks=[];for(let i=0;i<22;i++){const sx=(i%2?1:-1)*(4.5+(i%4)*.48),sz=-7+Math.floor(i/2)*1.1;banks.push([sx,groundY(sx,sz)+.05,sz,.55+(i%3)*.2,.12+(i%4)*.025,.42]);}const drifts=batches(sphere,0xdbe6ef,banks);drifts.name='snowbanks';drifts.material.roughness=.95;
    const holly=[],berries=[];
    for(let i=0;i<72;i++){const side=i%2?1:-1,hx=side*(4.6+Math.sin(i*2.39)*.68),hz=-5.8+Math.floor(i/2)*.28+Math.cos(i*1.7)*.28,hy=groundY(hx,hz)+.22;
      for(let k=0;k<3;k++){const a=k*2.1+i;holly.push([hx+Math.cos(a)*.12,hy,hz+Math.sin(a)*.12,.15,.045,.07,a]);berries.push([hx+Math.cos(a)*.045,hy+.065,hz+Math.sin(a)*.045,.035,.035,.035]);}}
    batches(sphere,0x315c4d,holly).name='christmas-holly';batches(sphere,0xb74943,berries);
    // Warm pools use the existing glow texture without adding shadow-casting lights.
    for(const [lx,lz] of [[-3,-3],[-4,2],[4,2]]){const pool=mesh(new THREE.PlaneGeometry(2.8,2.8),0xffd39d,lx,groundY(lx,lz)+.022,lz);pool.rotation.x=-Math.PI/2;pool.castShadow=false;pool.material=new THREE.MeshBasicMaterial({map:glowTexture,color:0xffc782,transparent:true,opacity:.19,depthWrite:false,blending:THREE.AdditiveBlending});}
    const cabinX=-8,cabinZ=-11.5,base=groundY(cabinX,cabinZ);
    mesh(box,0x7f665c,cabinX,base+1,cabinZ,[2.4,2,1.8]);const roof=mesh(new THREE.ConeGeometry(2.05,1.25,4),0xd9e3ed,cabinX,base+2.48,cabinZ,[1,.85,.8]);roof.rotation.y=Math.PI/4;
    windowAt(cabinX-.65,base+1.25,cabinZ+.93,.5,.65);windowAt(cabinX+.65,base+1.25,cabinZ+.93,.5,.65);mesh(box,0x4b6058,cabinX,base+.62,cabinZ+.93,[.52,1.18,.08]);mesh(sphere,0xe6c887,cabinX+.15,base+.6,cabinZ+1,.035);
    const logs=[];for(let j=0;j<10;j++)logs.push([cabinX,base+.12+j*.2,cabinZ+.91,2.38,.018,.035]);batches(box,0xa38872,logs);
    const wreath=mesh(new THREE.TorusGeometry(.20,.065,8,24),0x426953,cabinX,base+1.55,cabinZ+1.04);mesh(sphere,0xb44e4d,cabinX,base+1.38,cabinZ+1.10,[.1,.055,.04]);colliders.push({x:cabinX,z:cabinZ,radius:1.65,height:3.3});
    const greenery=[],garlandLights=[];
    for(const side of [-1,1]){
      for(let i=0;i<45;i++){const t=i/44,gx=side*(3.5+t*3.3),gy=3.35-Math.sin(t*Math.PI)*.38;
        greenery.push([gx,gy,-5.8,.14,.095,.10]);
        if(i%5===0)garlandLights.push([gx,gy-.12,-5.7,.045,.045,.045]);
      }
      for(let i=0;i<3;i++){
        const gx=side*(4.7+i*.35),gz=-3.8-i*.35,sz=.32+i*.09,gy=groundY(gx,gz)+sz/2;
        const gift=new THREE.Group();gift.name='christmas-path-gift';gift.position.set(gx,gy,gz);gift.rotation.y=side*(.15+i*.2);root.add(gift);
        mesh(box,[0xa84045,0x315c4d,0xd0b07b][i],0,0,0,[sz,sz,sz],gift);
        mesh(box,0xf3e3bd,0,0,0,[sz+.012,sz*.12,sz+.012],gift);mesh(box,0xf3e3bd,0,0,0,[sz*.12,sz+.012,sz+.012],gift);
        for(const sign of [-1,1]){const bow=mesh(new THREE.TorusGeometry(sz*.14,.018,6,16),0xf3e3bd,sign*sz*.12,sz*.56,0,1,gift);bow.rotation.y=sign*.35;}
        colliders.push({x:gx,z:gz,radius:sz*.8,height:sz+.15});
      }
    }
    batches(sphere,0x315c4d,greenery).name='christmas-side-garlands';batches(sphere,0xffd698,garlandLights,true);
    snowfall([[0,2400,.18,.88],[1,360,.30,.72]]);
    colliders.push({x,z,radius:2.2,height:6.5});
  } else if(id==='basic'){
    // A built-in treehouse gives the sunlit forest a recognisable destination.
    const x=2.8,z=-5.8,y=groundY(x,z);
    pole(x,y,z,5.2,.48,0x92714e);pole(x-1.1,y,z+.8,2.05,.13,0x8e7653);pole(x+1.1,y,z+.8,2.05,.13,0x8e7653);
    mesh(new THREE.CylinderGeometry(1.75,1.8,.18,12),0xa78659,x,y+1.9,z);
    mesh(new THREE.CylinderGeometry(1.18,1.3,1.75,8),0xceae79,x,y+2.85,z);
    shingles(x,y+3.84,z,1.58,5,0x65805a);
    const boards=[];for(let i=0;i<10;i++)boards.push([x,y+2.06+i*.164,z+1.21,1.75,.023,.035]);batches(box,0xb18a59,boards);
    mesh(new THREE.BoxGeometry(.52,1.05,.08),0x6c8053,x,y+2.52,z+1.3);mesh(sphere,0xe0bb6f,x+.17,y+2.45,z+1.36,.035);
    windowAt(x-.77,y+3.12,z+1.24,.4,.48);windowAt(x+.77,y+3.12,z+1.24,.4,.48);
    batches(box,0x92714e,[-.77,.77].map(dx=>[x+dx,y+2.83,z+1.32,.6,.065,.21]));
    const shutters=[];for(const dx of [-.77,.77])for(const side of [-1,1])shutters.push([x+dx+side*.3,y+3.12,z+1.3,.13,.6,.07]);batches(box,0x7b9467,shutters);
    const deck=[];for(let i=0;i<12;i++){const dz=-1.45+i*.26,w=2*Math.sqrt(Math.max(.1,1.65**2-dz**2));deck.push([x,y+2.003,z+dz,w,.018,.012]);}batches(box,0x80674b,deck);
    batches(box,0x92714e,[[-1,0,0],[1,0,0]].map(([side])=>[x+side*.33,y+2.53,z+1.35,.065,1.17,.09]));
    mesh(box,0xe2c896,x,y+3.12,z+1.35,[.75,.07,.12]);
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
    const flowers=[[],[],[]],colors=[0xe998ad,0xffdba0,0xb9a8d4],centres=[],archLeaves=[];
    for(let i=0;i<27;i++){const a=i*Math.PI/26,x=Math.cos(a)*2.65,y=1.1+Math.sin(a)*2.65;
      for(let k=0;k<5;k++){const p=k*Math.PI*2/5+i*.6;flowers[i%3].push([x+Math.cos(p)*.12,y+Math.sin(p)*.12,-4.76,.115,.105,.055]);}
      centres.push([x,y,-4.69,.06,.06,.035]);archLeaves.push([x+Math.cos(a)*.17,y+Math.sin(a)*.17,-4.88,.11,.22,.065,a]);}
    flowers.forEach((f,i)=>batches(sphere,colors[i],f));
    batches(sphere,0xe7bd68,centres);batches(sphere,0x79946a,archLeaves);
    for(const side of [-1,1]){
      const x=side*6.8;pole(x,0,-3,4.2,.09,0x9c7e58);pole(x,0,8,3.5,.09,0x9c7e58);
      const points=[];for(let i=0;i<=24;i++){const z=-3+i*11/24,y=3.9-.6*Math.sin(i/24*Math.PI);points.push(new THREE.Vector3(x,y,z));}
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),30,.015,4,false),0xf4dfb6,0,0,0);
      for(let i=0;i<10;i++){const z=-2.6+i*1.05,y=3.9-.6*Math.sin((i+.4)/10*Math.PI),shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.48,0);shape.lineTo(.24,-.6);shape.closePath();const flag=mesh(new THREE.ShapeGeometry(shape),colors[i%3],x,y,z);flag.rotation.y=side*Math.PI/2;flag.material.side=THREE.DoubleSide;}
    }
    // An oversized sculptural xylophone is scenery, not an extra input surface.
    const instrumentStart=root.children.length;
    for(let i=0;i<7;i++){const x=4.4,z=-2.5+i*.6,y=groundY(x,z)+.55,bar=mesh(box,[0xeaa1aa,0xf0ba78,0xe2d777,0x94c9a0,0x7fb9d1,0x9eafe1,0xcaa4d8][i],x,y,z,[1.8-i*.12,.18,.47]);bar.name='rhythm-bar';animateObject(bar,(t,energy)=>bar.position.y=y+energy*.06*(.5+.5*Math.sin(i*1.7)));}
    const feet=[];for(const x of [3.85,4.95])for(const z of [-2.5,1.1])feet.push([x,.23,z,.1,.46,.1]);batches(box,0x906f51,feet);
    batches(box,0x906f51,[[3.85,.42,-.7,.12,.13,4.1],[4.95,.42,-.7,.12,.13,4.1]]);
    const bolts=[];for(let i=0;i<7;i++)for(const side of [-1,1])bolts.push([4.4+side*(.65-i*.045),groundY(4.4,-2.5+i*.6)+.65,-2.5+i*.6,.026,.013,.026]);batches(sphere,0x8e7860,bolts);
    const instrument=new THREE.Group(),instrumentOrigin=new THREE.Vector3(4.4,0,-.7);instrument.name='garden-xylophone';instrument.position.copy(instrumentOrigin);instrument.scale.setScalar(.78);
    for(const part of root.children.slice(instrumentStart)){part.position.sub(instrumentOrigin);instrument.add(part);}root.add(instrument);
    const drumX=-4.5,drumZ=-3,y=groundY(drumX,drumZ);mesh(new THREE.CylinderGeometry(.73,.65,.7,32),0xc88b73,drumX,y+.37,drumZ);const skin=mesh(new THREE.CylinderGeometry(.75,.75,.035,32),0xffe6ba,drumX,y+.74,drumZ);skin.name='rhythm-drum';animateObject(skin,(t,energy)=>skin.scale.set(1+energy*.025,1,1+energy*.025));
    const rims=[];for(let i=0;i<16;i++){const a=i*Math.PI/8;rims.push([drumX+Math.cos(a)*.69,y+.4,drumZ+Math.sin(a)*.69,.025,.32,.025]);}batches(box,0xf1d7a4,rims);
    const flags=[];for(let i=0;i<18;i++){const a=(i+.5)*Math.PI/18;flags.push([Math.cos(a)*2.65,1.1+Math.sin(a)*2.65,-4.72,.025]);}batches(sphere,0xffe5b0,flags,true);
    colliders.push({x:drumX,z:drumZ,radius:.8,height:.8},{x:4.4,z:-.7,radius:.9,height:.8});
  } else if(id==='warm'){
    const masonry=[],plinths=[];
    for(const [x,z,size] of [[-.8,-6.5,1],[8.2,-7,1],[-12,-12,.8]]){
      const y=groundY(x,z);mesh(new THREE.CylinderGeometry(.5,.85,3.5,16),0xe5d4ae,x,y+1.75*size,z,size);mesh(new THREE.ConeGeometry(.85,1,12),0x9a6850,x,y+3.9*size,z,size);
      const rotor=new THREE.Group();rotor.position.set(x,y+3*size,z+.99*size);rotor.scale.setScalar(size);root.add(rotor);
      for(let i=0;i<4;i++){const blade=new THREE.Group();blade.rotation.z=i*Math.PI/2;rotor.add(blade);mesh(box,0x96744e,0,.95,0,[.07,2.2,.06],blade);mesh(box,0xf6e6bf,.21,1.27,0,[.42,1.25,.05],blade);for(let j=0;j<4;j++)mesh(box,0xc0a17a,.21,.75+j*.3,.04,[.42,.035,.04],blade);}
      mesh(sphere,0x94704e,0,0,.07,.15,rotor);animateObject(rotor,t=>rotor.rotation.z=t*.18);
      mesh(box,0x8b6b4d,x,y+.55*size,z+.76*size,[.4*size,.95*size,.05]);windowAt(x,y+2.1*size,z+.64*size,.25*size,.38*size);
      for(let row=0;row<9;row++)for(let n=0;n<12;n++){const a=(n+(row%2)*.5)*Math.PI/6,h=.22+row*.3,r=.85-h*.1+.009;masonry.push([x+Math.sin(a)*r*size,y+h*size,z+Math.cos(a)*r*size,.33*size,.018*size,.018*size,a]);}
      plinths.push([x,y+.13*size,z,.98*size,.26*size,.98*size],[x,y+3.4*size,z,.65*size,.10*size,.65*size]);
      mesh(box,0x96744e,x,y+.04,z+1.04*size,[.7*size,.1*size,.44*size]);
      colliders.push({x,z,radius:.9*size,height:4.6*size});
    }
    batches(box,0xbca988,masonry);batches(new THREE.CylinderGeometry(1,1,1,24),0xb49975,plinths);
    const seedHeads=[];for(let i=0;i<100;i++){const side=i%2?1:-1,x=side*(6.3+(i%9)*.19),z=-3+Math.floor(i/2)*.24,y=groundY(x,z);seedHeads.push([x,y+.65+(i%3)*.09,z,.05,.16,.05]);}batches(sphere,0xe1ca85,seedHeads);
    const stalks=seedHeads.map(p=>[p[0],p[1]-.35,p[2],.015,.55,.015]);batches(box,0xae9d64,stalks);
    for(const x of [-4.8,4.8]){const fence=[];for(let i=0;i<9;i++)fence.push([x,groundY(x,-4+i*.8)+.4,-4+i*.8,.07,.8,.07]);batches(box,0xb59d71,fence);mesh(box,0xc6af82,x,.57,-.8,[.07,.07,7.2]);}
  } else if(id==='dream'){
    stars();const petals=[],cores=[];
    for(let i=0;i<32;i++){const side=i%2?1:-1,x=side*(3.3+(i%5)*.4),z=-4+Math.floor(i/2)*.85,y=groundY(x,z)+.22;cores.push([x,y,z,.04]);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;petals.push([x+Math.cos(a)*.10,y,z+Math.sin(a)*.10,.08,.03,.065]);}}
    const nightPetals=batches(sphere,0x8fa9d2,petals,true);nightPetals.material.emissiveIntensity=.25;batches(sphere,0xe5d3a0,cores,true);
    const halo=mesh(new THREE.TorusGeometry(2.1,.045,8,70),0x819bbd,0,3.4,-5.5);halo.rotation.y=.15;halo.material.metalness=.6;halo.material.roughness=.32;
    const pedestal=mesh(new THREE.CylinderGeometry(1.05,1.3,.26,32),0x606b85,0,.15,-5.5);
    mesh(new THREE.CylinderGeometry(1.35,1.42,.12,32),0x45526c,0,.06,-5.5);
    mesh(new THREE.CylinderGeometry(.16,.23,1.1,12),0x778caa,0,.8,-5.5);
    const markers=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;markers.push([Math.cos(a)*2.1,3.4+Math.sin(a)*2.1,-5.45,.055]);}batches(sphere,0xe8c991,markers,true);
    const orbit=mesh(new THREE.TorusGeometry(1.08,.024,8,64),0xe8d1a0,0,2.65,-5.5,1,root,true);orbit.rotation.x=.5;orbit.rotation.y=.4;
    const star=mesh(new THREE.OctahedronGeometry(.34),0xd9e1ff,0,2.65,-5.5,1,root,true);animateObject(star,t=>{star.rotation.y=t*.18;star.position.y=2.65+Math.sin(t*.7)*.08;});
    const crystals=[];for(let i=0;i<22;i++){const side=i%2?1:-1,x=side*(4.8+(i%4)*.3),z=-4+Math.floor(i/2)*.8;crystals.push([x,groundY(x,z)+.25,z,.11,.3+(i%3)*.1,.12,i*.7]);}const crystal=batches(new THREE.OctahedronGeometry(1),0x9faed0,crystals);crystal.name='listening-crystals';crystal.material.emissive.set(0x9bacef);animations.push((t,energy)=>crystal.material.emissiveIntensity=.06+energy*.38);
    colliders.push({x:0,z:-5.5,radius:1.35,height:4.2});
    const fireflies=[];for(let i=0;i<65;i++)fireflies.push(Math.sin(i*2.4)*4,1+(i%7)*.27,Math.cos(i*1.7)*6);
    const insectGeo=new THREE.BufferGeometry();insectGeo.setAttribute('position',new THREE.Float32BufferAttribute(fireflies,3));
    const bugs=new THREE.Points(insectGeo,new THREE.PointsMaterial({map:glowTexture||null,color:0xd5ecad,size:.09,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));root.add(bugs);animateObject(bugs,t=>{bugs.rotation.y=Math.sin(t*.12)*.09;bugs.position.y=Math.sin(t*.5)*.12;});
    const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture||null,color:0xa3b7f0,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));aura.position.set(0,2.65,-5.55);aura.scale.set(2.2,2.2,1);root.add(aura);
  } else if(id==='journey'){
    const clouds=[];for(let i=0;i<24;i++){const a=i*2.4,r=19+(i%7)*3,x=Math.cos(a)*r,z=Math.sin(a)*r;for(let k=0;k<5;k++)clouds.push([x+(k-2)*1.3,-2.1+(i%4)*.3+Math.sin(k)*.4,z+(k%2)*.7,2+(k%2)*.6,.9+(k%3)*.3,1.7]);}const cloudBank=batches(sphere,0xf1f7fb,clouds);cloudBank.castShadow=false;
    const crowns=[];
    for(const [x,y,z,s] of [[-6,4,-25,3.5],[5,6,-30,3],[-15,9,-40,4],[16,10,-43,4.5]]){
      const rock=new THREE.CylinderGeometry(s,.18,s*1.45,11,5),p=rock.attributes.position;
      for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),h=p.getY(i),wave=1+.12*Math.sin(a*3+.6)+.06*Math.cos(h*4+a*5);p.setXYZ(i,p.getX(i)*wave,h+.12*Math.sin(a*5),p.getZ(i)*wave);}rock.computeVertexNormals();
      const shades=[];for(let i=0;i<p.count;i++){const h=p.getY(i)/(s*1.45)+.5,c=new THREE.Color(0x748a92).lerp(new THREE.Color(0xb4b2a0),h).multiplyScalar(.88+.12*Math.sin(h*28));shades.push(c.r,c.g,c.b);}rock.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
      const cliff=mesh(rock,0xffffff,x,y-s*.725,z);cliff.material.vertexColors=true;cliff.material.roughness=1;
      mesh(new THREE.CylinderGeometry(s*.96,s,.25,24),0x87ae8c,x,y+.1,z);
      for(let j=0;j<3;j++){const tx=x+Math.cos(j*2.4)*s*.3,tz=z+Math.sin(j*2.4)*s*.3;pole(tx,y,tz,2+j*.4,.13,0xa5997b);for(let k=0;k<10;k++){const a=k*2.4;crowns.push([tx+Math.cos(a)*.7,y+2.5+j*.4+Math.sin(k*1.7)*.5,tz+Math.sin(a)*.7,1.8,1.6,1,k*1.8]);}}
      for(let j=0;j<4;j++){const a=j*1.7;mesh(new THREE.IcosahedronGeometry(1,1),0x798d91,x+Math.cos(a)*s*.6,y-s*.6,z+Math.sin(a)*s*.6,[s*.45,s*.3,s*.4]);}
    }
    // Rails visibly mark the safe central garden rather than suggesting a walkable drop.
    for(const side of [-1,1]){const x=side*6.1;for(let i=0;i<10;i++)pole(x,groundY(x,-3+i*1.7),-3+i*1.7,.72,.065,0xf1e7cb);mesh(box,0xf1e7cb,x,.65,4.5,[.1,.09,16.6]);}
    const gate=mesh(new THREE.TorusGeometry(3,.065,10,70,Math.PI),0xe0cda2,0,.8,-5.4);gate.rotation.z=0;
    for(const side of [-1,1]){pole(side*3,groundY(side*3,-5.4),-5.4,.8,.065,0xe0cda2);mesh(new THREE.CylinderGeometry(.24,.32,.24,16),0xc6c5a3,side*3,.1,-5.4);}
    const balloonStart=root.children.length;
    const balX=-7,balY=6.1,balZ=-20;
    const balloon=mesh(sphere,0xf4d7ab,balX,balY,balZ,[1.25,1.65,1.25]);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const seam=mesh(new THREE.TorusGeometry(1.24,.018,5,48),0xe8b48a,balX,balY,balZ);seam.rotation.y=a;seam.scale.y=1.33;}
    mesh(new THREE.CylinderGeometry(.34,.27,.42,12),0xb89360,balX,balY-2.32,balZ);
    for(const dx of [-.25,.25]){const rope=mesh(new THREE.CylinderGeometry(.012,.012,.95,5),0x9e876a,balX+dx,balY-1.7,balZ);}
    const balloonGroup=new THREE.Group();balloonGroup.name='floating-balloon';for(const part of root.children.slice(balloonStart))balloonGroup.add(part);root.add(balloonGroup);animateObject(balloonGroup,t=>balloonGroup.position.y=Math.sin(t*.38)*.18);
    for(const side of [-1,1]){const x=side*3.8,z=-3.4;mesh(new THREE.CylinderGeometry(.62,.45,.4,24),0xd8cbb0,x,.2,z);pole(x,.4,z,2.1,.1,0x9d8961);for(let i=0;i<24;i++){const a=i*2.4;crowns.push([x+Math.cos(a)*.65,2.5+Math.sin(i*1.8)*.42,z+Math.sin(a)*.65,1.15,1.1,1,a]);}colliders.push({x,z,radius:.7,height:3.5});}
    const foliage=batches(new THREE.PlaneGeometry(1,1),0xc5dfba,crowns);foliage.material.map=leafTexture||null;foliage.material.alphaTest=.4;foliage.material.side=THREE.DoubleSide;
    foliage.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafTexture||null,alphaTest:.4,side:THREE.DoubleSide});
    const stepping=[];for(let i=0;i<13;i++)stepping.push([0,.025,-2.5-i*.22,.5,.03,.09]);batches(box,0xd1ba91,stepping);
  } else if(id==='rain'||id==='sunset'){
    const wet=id==='rain',x=-5.2,z=-3.6,y=groundY(x,z)+.025;
    const water=new THREE.Mesh(new THREE.CircleGeometry(wet?1.3:2.9,64),new THREE.MeshStandardMaterial({color:wet?0x7e9da5:0x839aac,roughness:.28,metalness:.3}));
    water.name=wet?'rain-puddle':'sunset-lake';water.position.set(x,y,z);water.rotation.x=-Math.PI/2;water.scale.y=wet?.7:1.3;water.receiveShadow=true;root.add(water);
    const shore=[],reeds=[];for(let i=0;i<42;i++){const a=i*Math.PI*2/42,r=wet?1.35:3;shore.push([x+Math.cos(a)*r,y+.04,z+Math.sin(a)*r*(wet?.7:1.3),.17,.08,.13]);if(!wet&&i%3===0)reeds.push([x+Math.cos(a)*3.1,y+.31,z+Math.sin(a)*4,.018,.6,.018]);}
    batches(sphere,wet?0x647c7a:0x9a8c83,shore);if(reeds.length)batches(box,0xa59b78,reeds);
    for(let i=0;i<5;i++){const r=.18+i*(wet?.18:.45),ring=new THREE.Mesh(new THREE.RingGeometry(r,r+.014,48),new THREE.MeshBasicMaterial({color:wet?0xbcd3d8:0xe4beb0,transparent:true,opacity:.25,depthWrite:false}));ring.position.set(x,y+.015,z);ring.rotation.x=-Math.PI/2;root.add(ring);animateObject(ring,t=>{const scale=1+Math.sin(t*(wet?1.1:.35)-i)*.08;ring.scale.set(scale,scale*(wet?.7:1.3),1);});}
    if(!wet)colliders.push({x,z,radius:3.7,height:.2});
    // A solitary bench faces the water, clear of the shared path and piano.
    const bx=3.6,bz=-4.6,by=groundY(bx,bz),boards=[];
    for(let i=0;i<4;i++)boards.push([bx,by+.5,bz+i*.13,1.9,.065,.1]);
    for(let i=0;i<3;i++)boards.push([bx,by+.78+i*.13,bz-.07,1.9,.095,.06]);
    batches(box,0x92714e,boards);for(const side of [-1,1]){pole(bx+side*.72,by,bz+.16,.5,.07,0x806346);pole(bx+side*.72,by,bz-.07,1.13,.045,0x806346);}
    colliders.push({x:bx,z:bz,radius:1.1,height:1.2});
    if(wet){
      for(const dx of [-1.4,1.4])pole(bx+dx,by,bz-.3,2.6,.09,0x92714e);
      const roof=mesh(new THREE.ConeGeometry(2.1,.75,4),0x697e7c,bx,by+2.8,bz-.05,[1,.65,.72]);roof.rotation.y=Math.PI/4;
      colliders.push({x:bx-1.4,z:bz-.3,radius:.15,height:2.8},{x:bx+1.4,z:bz-.3,radius:.15,height:2.8});
      const drops=[],seeds=[],tips=[];for(let i=0;i<260;i++){const dx=Math.sin(i*2.399)*11,dz=Math.cos(i*1.71)*12-2,h=(i*.731)%9;seeds.push(h,h);tips.push(0,.25);drops.push(dx,h,dz,dx-.04,h+.25,dz);}
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(drops,3));
      const rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xc2d6df,transparent:true,opacity:.32,depthWrite:false}));rain.name='soft-rain';root.add(rain);
      geometry.setAttribute('rainSeed',new THREE.Float32BufferAttribute(seeds,1));geometry.setAttribute('rainTip',new THREE.Float32BufferAttribute(tips,1));
      const rainTime={value:0};rain.material.onBeforeCompile=shader=>{
        shader.uniforms.rainTime=rainTime;shader.vertexShader='uniform float rainTime; attribute float rainSeed; attribute float rainTip;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y=mod(rainSeed-rainTime*3.2,9.)+rainTip;');
      };
      animations.push(t=>{rainTime.value=t;});
    }else{
      const sun=new THREE.Mesh(new THREE.SphereGeometry(1.6,24,16),new THREE.MeshBasicMaterial({color:0xf3bf9d,fog:false}));sun.name='setting-sun';sun.position.set(-12,3.8,-38);root.add(sun);
      const glints=[];for(let i=0;i<24;i++)glints.push([x+Math.sin(i*2.4)*.12,y+.025,z-2+i*.16,.15+(i%5)*.09,1,.025]);
      const reflection=batches(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),0xe9bdab,glints,true);reflection.castShadow=false;reflection.material.transparent=true;reflection.material.opacity=.4;
      animations.push(t=>reflection.material.opacity=.34+Math.sin(t*.45)*.035);
      lantern(4.7,-6.5);
    }
  } else if(id==='moon'){
    stars();
    const moon=mesh(new THREE.SphereGeometry(1,24,16),0xd9e2d6,-3,6,-22,1.1,root,true);moon.material=moon.material.clone();moon.material.emissiveIntensity=.25;moon.material.roughness=1;
    const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture||null,color:0xb5cde9,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));moonHalo.position.copy(moon.position);moonHalo.scale.set(5.5,5.5,1);root.add(moonHalo);
    const moonLight=new THREE.DirectionalLight(0xb8d5ff,.3);moonLight.position.set(-4,8,-25);root.add(moonLight);
    const pondX=-5.2,pondZ=-3.6,y=groundY(pondX,pondZ)+.03;
    const water=mesh(new THREE.CircleGeometry(2.9,64),0x7b9cbd,pondX,y,pondZ);water.rotation.x=-Math.PI/2;water.scale.y=1.3;water.material.dispose();water.material=new THREE.MeshStandardMaterial({color:0x8aaec5,roughness:.14,metalness:.55});
    const glints=[];for(let i=0;i<28;i++){const z=pondZ-2.2+i*.14,x=pondX+.1+Math.sin(i*2.4)*.13;glints.push([x,y+.021,z,.20+(i%4)*.12,1,.025+(i%3)*.012]);}
    const shimmer=batches(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),0xcbdce6,glints,true);shimmer.material.dispose();shimmer.material=new THREE.MeshBasicMaterial({map:glowTexture||null,color:0xcbdce6,transparent:true,opacity:.34,depthWrite:false,blending:THREE.AdditiveBlending});shimmer.castShadow=false;
    animations.push(t=>shimmer.material.opacity=.29+Math.sin(t*.45)*.04);
    for(let i=0;i<4;i++){const radius=.55+i*.45,ring=new THREE.Mesh(new THREE.RingGeometry(radius-.008,radius+.008,64),new THREE.MeshBasicMaterial({color:0xa9c6d4,transparent:true,opacity:.28-i*.045,depthWrite:false}));ring.position.set(pondX,y+.015,pondZ);root.add(ring);ring.rotation.x=-Math.PI/2;ring.scale.y=1.3;ring.name='pond-ripple';animateObject(ring,t=>{const swell=1+Math.sin(t*.65-i*.9)*.018;ring.scale.set(swell,1.3*swell,1);});}
    colliders.push({x:pondX,z:pondZ,radius:3.7,height:.15});
    const x=1.8,z=-7.8,base=groundY(x,z);
    mesh(new THREE.CylinderGeometry(1.8,1.9,.22,6),0xb8b6a6,x,base+.1,z);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;pole(x+Math.cos(a)*1.5,base,z+Math.sin(a)*1.5,2.6,.09,0xb5b7b0);}
    mesh(new THREE.ConeGeometry(2.1,1.15,6),0x4f657d,x,base+3.05,z);mesh(sphere,0xffd7a1,x,base+2.4,z,.22,root,true);
    for(let row=0;row<4;row++){const h=row*.22;mesh(new THREE.ConeGeometry(2.12*(1-h/1.15),.055,6,1,true),row%2?0x647c90:0x526f88,x,base+2.5+h,z);}
    batches(box,0x9d9e90,[[x,base+.055,z+1.7,1.3,.1,.45],[x,base+.13,z+1.43,1.3,.12,.35]]);
    const bases=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;bases.push([x+Math.cos(a)*1.5,base+.18,z+Math.sin(a)*1.5,.23,.36,.23]);}batches(box,0x87958e,bases);
    pole(5.5,groundY(5.5,1.5),1.5,1.1,.09,0xb3a27f);
    mesh(box,0x788f9b,5.5,groundY(5.5,1.5)+1.25,1.5,[.55,.55,.4]);mesh(box,0xffe0a9,5.5,groundY(5.5,1.5)+1.3,1.71,[.32,.025,.015],root,true);
    colliders.push({x,z,radius:2.1,height:3.7},{x:5.5,z:1.5,radius:.35,height:1.6});
    const shore=[],lilies=[];for(let i=0;i<42;i++){const a=i*Math.PI*2/42;shore.push([pondX+Math.cos(a)*2.97,y+.04,pondZ+Math.sin(a)*3.83,.23,.12,.17]);if(i%7===0)lilies.push([pondX+Math.cos(a)*1.6,y+.035,pondZ+Math.sin(a)*2,.22,.018,.18]);}batches(sphere,0x7c8c86,shore);batches(sphere,0x739888,lilies);
    // A post-office facade sits behind the existing pavilion, with warm windows and a little clock.
    mesh(box,0xbebfac,x,base+1.28,z-.9,[2.1,2.4,.12]);windowAt(x-.55,base+1.65,z-.8,.45,.6);windowAt(x+.55,base+1.65,z-.8,.45,.6);
    const siding=[];for(let i=0;i<11;i++)siding.push([x,base+.17+i*.205,z-.828,2.06,.012,.015]);batches(box,0x8e998c,siding);
    batches(box,0x82918b,[-.55,.55].map(dx=>[x+dx,base+1.30,z-.73,.65,.065,.18]));
    mesh(box,0x637d79,x,base+.65,z-.77,[.6,1.15,.08]);const clock=mesh(new THREE.CircleGeometry(.22,32),0xffe7b1,x,base+2.25,z-.82);mesh(box,0x5b6a62,x,base+2.3,z-.80,[.018,.13,.02]);mesh(box,0x5b6a62,x+.055,base+2.25,z-.80,[.12,.018,.02]);
    for(const [lx,lz] of [[-2.4,-2.4],[4,-4],[-4,3],[5.8,6],[-3.5,10]])lantern(lx,lz);
    for(const [lx,lz,power] of [[-2.4,-2.4,7],[1.8,-6.8,9]]){const light=new THREE.PointLight(0xffddb0,power,10,2);light.position.set(lx,groundY(lx,lz)+1.8,lz);root.add(light);}
    // Small mail slots and a hanging sign make the pavilion read as a post office.
    const slots=[];for(let i=0;i<3;i++)slots.push([x-.8+i*.8,base+.76,z-.79,.24,.035,.04]);batches(box,0x506974,slots);
    mesh(box,0x49616a,x,base+2.6,z+.9,[1.15,.3,.08]);
    const envelope=mesh(box,0xf1d4a1,x,base+2.6,z+.96,[.28,.15,.025]);envelope.rotation.z=.12;
  }
  // Recognisable distant silhouettes stay behind the musicians and the walking route.
  if(id==='christmas'){
    // A festoon behind the performers frames the tree without obstructing the walking route.
    const cablePoints=[],festoon=[];
    for(const x of [-7,7]){pole(x,groundY(x,-7.5),-7.5,4.4-groundY(x,-7.5),.055,0x72594a);colliders.push({x,z:-7.5,radius:.12,height:4.4});}
    for(let i=0;i<=48;i++){const t=i/48,x=-7+14*t,z=-7.5,y=4.35-1.15*Math.sin(Math.PI*t);cablePoints.push(new THREE.Vector3(x,y,z));if(i%2===0)festoon.push([x,y-.06,z,.033,.055,.033]);}
    const cable=new THREE.Line(new THREE.BufferGeometry().setFromPoints(cablePoints),new THREE.LineBasicMaterial({color:0x796b58}));cable.name='christmas-festoon';root.add(cable);
    const festoonBulbs=batches(sphere,0xffd698,festoon,true);festoonBulbs.material.emissiveIntensity=1.8;
    const detailedFir=root.getObjectByName('tripo-christmas-tree');
    const farFir=distantTree&&detailedFir?copyChristmasTree(distantTree,detailedFir.getObjectByProperty('isMesh',true).material):null;
    for(const [x,z,h] of [[-5,-9,3.2],[-9,-14,4.5],[7,-15,4],[1,-19,3.5],[-11,-22,5],[10,-25,5.5],[-3,-28,5.2],[4,-32,6],[-15,-34,6],[14,-36,6.2],[-12,-9,4.8],[10,-10,5.2],[-5,-17,4.2],[5,-21,5.2],[-16,-18,6.2],[15,-20,6.5],[-20,-25,3.8],[-15,-29,3.2],[-8,-25,3.4],[-2,-24,3.6],[5,-27,3.3],[12,-30,3.5],[19,-26,3.8],[-12,-35,3.5],[0,-36,3.6],[9,-38,3.4],[-7,-11,4.2],[5,-12,4.4],[-3,-15,4.5],[3,-16,4.8],[-11,-17,5.3],[11,-17,5.5],[-18,-13,5.6],[18,-14,5.4],[-14,-23,4.6],[15,-25,4.8],[-6,-22,4.2],[2,-23,4.4],[-10,-30,4.4],[8,-32,4.5],[-21,-18,5.2],[22,-20,5.4],[-25,-27,5.5],[25,-28,5.7],[-18,-33,4.3],[18,-35,4.5],[-6,-35,4],[5,-36,4.2],[-9,-6,3.5],[9,-6,3.7],[-12,-3,4.2],[12,-3,4.3]]){
      if(christmasTree){const tx=x+Math.sin(z)*.8,tz=z+Math.cos(x)*1.3;const tree=(farFir||detailedFir).clone(true);tree.name='winter-fir';tree.position.set(tx,groundY(tx,tz),tz);tree.scale.multiplyScalar(h/5.4);tree.scale.x*=.86+.09*Math.sin(x);tree.scale.z*=.91;tree.rotation.y=x*.7;if(Math.hypot(tx,tz)>12)tree.traverse(o=>{if(o.isMesh)o.castShadow=false;});root.add(tree);continue;}
      const y=groundY(x,z);pole(x,y,z,h,.13,0x78604f);
      for(let j=0;j<3;j++){mesh(new THREE.ConeGeometry(h*.34-j*.22,h*.55,12),0x496c68,x,y+h*.35+j*h*.23,z);mesh(new THREE.ConeGeometry(h*.29-j*.2,.25,12),0xdce8ee,x,y+h*.6+j*h*.23,z);}
    }
    const light=new THREE.PointLight(0xffc783,8,13,2);light.position.set(-.3,2.5,-8);root.add(light);
    for(let i=0;i<5;i++){const x=-1.1+(i%3)*.55,z=-8.6-Math.floor(i/3)*.5,y=groundY(x,z),h=.3+(i%3)*.08;
      mesh(box,[0x9f514d,0x476b57,0xdec89c][i%3],x,y+h/2,z,[.42,h,.4]);
      mesh(box,0xe7c888,x,y+h+.012,z,[.44,.025,.065]);mesh(box,0xe7c888,x,y+h+.016,z,[.065,.025,.42]);
      mesh(box,0xe7c888,x,y+h/2,z+.205,[.065,h,.012]);
      for(const side of [-1,1]){const bow=mesh(new THREE.TorusGeometry(.055,.012,5,12),0xe7c888,x+side*.055,y+h+.055,z);bow.rotation.y=side*.4;bow.scale.set(1.2,.65,1);}
    }
  }
  if(id==='pop'){
    const ribbon=[];for(let i=0;i<15;i++){const x=-4+i*.57,y=3.6-.5*Math.sin(i/14*Math.PI);ribbon.push([x,y,-6,.6,.025,.025]);const flag=mesh(new THREE.ConeGeometry(.22,.38,3),[0xe4a095,0xefd18d,0x9db9bf][i%3],x,y-.2,-6);flag.rotation.z=Math.PI;flag.rotation.y=.4;animateObject(flag,t=>flag.rotation.x=Math.sin(t*.8+i*.45)*.09);}batches(box,0xe8dbbe,ribbon);
  }
  if(id==='dream'){
    const points=[[-7,6,-23],[-5,7.3,-23],[-3,6.7,-23],[-1,8,-23],[2,7.2,-23]],line=[];
    for(let i=0;i<points.length;i++){const [x,y,z]=points[i];mesh(sphere,0xe3dbb9,x,y,z,.07,root,true);if(i)line.push(...points[i-1],...points[i]);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(line,3));root.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x9baccb,transparent:true,opacity:.45})));
  }
  if(id==='journey'){
    const windsock=new THREE.Group();windsock.position.set(4.7,3,-7);root.add(windsock);pole(4.7,groundY(4.7,-7),-7,3,.045,0xc0a782);for(let i=0;i<6;i++){const band=mesh(new THREE.CylinderGeometry(.16-i*.016,.18-i*.016,.23,12,1,true),i%2?0xf2dfb3:0xa1c6d4,.13+i*.22,-i*.025,0,1,windsock);band.rotation.z=Math.PI/2;}animateObject(windsock,t=>windsock.rotation.y=Math.sin(t*.5)*.2);
  }
  if(id==='moon'){
    const trail=[];for(let i=0;i<9;i++){const x=4.5+i*.08,z=-4-i*.5,y=groundY(x,z);trail.push([x,y+.15,z,.1,.15,.1]);}batches(box,0xe8c58e,trail,true);
  }
  if(id==='rain'){
    for(const [x,z,r] of [[-3.7,2.3,.65],[4.8,3,.8],[-6,-7,1]]){const y=groundY(x,z)+.018,m=mesh(new THREE.CircleGeometry(r,40),0x7f9eaa,x,y,z);m.rotation.x=-Math.PI/2;m.scale.y=.55;m.material=m.material.clone();m.material.roughness=.12;m.material.metalness=.4;}
  }
  if(id==='sunset'){
    const x=-5.3,z=-4.1,y=groundY(x,z)+.1,boat=new THREE.Group();boat.position.set(x,y,z);root.add(boat);
    mesh(new THREE.SphereGeometry(1,16,8),0xa17b58,0,.1,0,[.5,.12,.23],boat);pole(0,.12,0,.68,.018,0xd0b383,boat);const sail=mesh(new THREE.ConeGeometry(.22,.5,3),0xf2dfb5,.12,.55,0,[1,1,.08],boat);animateObject(boat,t=>{boat.rotation.z=Math.sin(t*.6)*.025;boat.position.y=y+Math.sin(t*.7)*.015;});
  }
  if(id==='basic'||id==='warm'){
    const positions=[];for(let i=0;i<28;i++){const x=(i%2?1:-1)*(3.4+(i%7)*.46),z=-6+(i%13)*.8;positions.push(x,groundY(x,z)+.7+(i%5)*.24,z);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const motes=new THREE.Points(geo,new THREE.PointsMaterial({map:glowTexture||null,color:id==='warm'?0xe8b65b:0xffefb5,size:id==='warm'?.13:.07,transparent:true,opacity:.5,depthWrite:false}));root.add(motes);animateObject(motes,t=>{motes.position.x=Math.sin(t*.23)*.25;motes.position.y=Math.sin(t*.4)*.15;});
  }
  if(['dream','moon','sunset'].includes(id)){
    const settings={dream:[640,.13,.58,.28,0xe3eaff],moon:[960,.17,.72,.42,0xe8f2ff],sunset:[520,.16,.65,.35,0xffe8d8]}[id];
    const [count,size,opacity,speed,color]=settings;
    snowfall([[0,count,size,opacity]],speed,color);
    const dusting=[];
    for(let i=0;i<16;i++){const x=(i%2?1:-1)*(4.2+(i%3)*.6),z=-7+Math.floor(i/2)*1.35;
      if(id==='sunset'&&x<0)continue;
      dusting.push([x,groundY(x,z)+.035,z,.42+(i%3)*.12,.045,.3]);
    }
    const snow=batches(sphere,id==='sunset'?0xe7d8ce:0xc8d9e5,dusting);snow.name='first-snow-banks';snow.castShadow=false;
  }
  if(id==='christmas'){
    // Group background firs by spatial cell so offscreen sections can still be culled.
    root.updateMatrixWorld(true);
    const groups=new Map(), inverse=root.matrixWorld.clone().invert();
    for(const tree of root.children.filter(o=>o.name==='winter-fir')){
      tree.traverse(o=>{
        if(!o.isMesh)return;
        const key=[Math.floor(tree.position.x/12),Math.floor(tree.position.z/12),o.geometry.uuid,o.material.uuid,o.castShadow].join('/');
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(o);
      });
      root.remove(tree);
    }
    for(const meshes of groups.values()){
      const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
      batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
      meshes.forEach((m,i)=>batch.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,m.matrixWorld)));
      batch.computeBoundingSphere();root.add(batch);
    }
  }
  {
    // Batch only static primitives; moving objects and their descendants retain individual transforms.
    root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
    root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.name||!o.visible||![sphere,box].includes(o.geometry)||Array.isArray(o.material))return;
      for(let parent=o;parent;parent=parent.parent)if(animatedTransforms.has(parent))return;
      const key=`${o.geometry.uuid}/${o.material.uuid}/${o.castShadow}/${o.receiveShadow}`;
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
    });
    for(const items of groups.values()){
      if(items.length<3)continue;
      const first=items[0],batch=new THREE.InstancedMesh(first.geometry,first.material,items.length);
      batch.name=id==='christmas'?'christmas-prop-batch':'landmark-prop-batch';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
      items.forEach((o,i)=>{batch.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(id==='christmas'&&!o.children.length)o.removeFromParent();else o.visible=false;});
      batch.computeBoundingSphere();root.add(batch);
    }
    root.traverse(o=>{if(!animatedTransforms.has(o)){o.updateMatrix();o.matrixAutoUpdate=false;}});
  }
  // Shared primitive geometries may be unreferenced on a given stage.
  if(!root.children.some(c=>c.geometry===sphere)&&!root.getObjectByProperty('geometry',sphere))sphere.dispose();
  if(!root.getObjectByProperty('geometry',box))box.dispose();
  return {colliders,animate(t,reduced,energy=0){for(const fn of animations)fn(reduced?0:t,reduced?0:Math.max(0,Math.min(1,energy)));}};
}
