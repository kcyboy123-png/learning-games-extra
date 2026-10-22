import {createAtmosphere} from './atmosphere.mjs';
import { createWorld } from './scene.mjs';
import {drawMask,maskKinds,maskNames} from './mask-art.mjs';

// Visible chapter numbers; these are learning spaces, not architectural reconstructions.
export function createChapterWorld(THREE, scene, chapter) {
  if (![2,3,4,5,6,7,8].includes(chapter)) throw new RangeError('Only chapters 2–8 have a world.');
  const art = createWorld(THREE, scene, { artOnly:true });
  const { M,G,L,colliders,occluders,addCollider,addTree,addPine,addShrub,addGrass,
    addBuilding,addJarCluster,addSackFull,addSackOpen,addGrain,addBasket,addMat,addLogPile,rr } = art;
  const palace = chapter === 2, inspectables = [], animated = [], clothMotion = [], npcExtras = [];
  const bounds = palace ? { minX:-19,maxX:19,minZ:-34,maxZ:19 } : { minX:-17.5,maxX:17.5,minZ:-32,maxZ:18 };
  const stations = palace
    ? [{x:-8,z:10.2},{x:8,z:-2},{x:-8,z:-14},{x:8,z:-25}]
    : [{x:-7,z:9},{x:7,z:-2},{x:-7,z:-13},{x:7,z:-23}];
  const tagHeights={2:[4,4.4,5.8,5.8],3:[4.2,5.8,4.1,5.8],4:[4,4.1,4.1,5.8],5:[4.1,4.1,4.1,5.8],6:[4.2,5.8,4.1,5.8],7:[4.2,5.8,4.1,5.8],8:[4.2,5.8,4.1,5.8]};
  stations.forEach((station,i)=>station.tagY=tagHeights[chapter][i]);
  const stationNames = {
    2:['농부의 경험을 책으로','왕실 관측소의 하루','누구나 전할 수 있는 말','국경의 지도, 바다의 소식'],
    3:['글과 그림으로 전하는 가르침','기록을 찾아 판결하라','네 사람의 하루','두 세대의 가족 기록'],
    4:['마을에 전해진 전쟁 소식','수군의 준비','함께 지킨 사람들','남한산성의 겨울'],
    5:['논의 일손을 나누자','우리 집의 작물 계획','장시의 약속을 지켜라','달라진 마을 명부'],
    6:['사신의 가방','마을의 문제를 연구하라','새로운 가르침을 둘러싼 목소리','사람들이 바라던 세상'],
    7:['오늘 밤의 이야기꾼','그림 속 하루를 찾아라','소원을 담은 그림','마을 공연을 열어라'],
    8:['열린 문 앞의 토론','옛 모습과 새 모습','새 문물과 달라진 생활','여덟 권의 기록을 잇다'],
  }[chapter];
  const atmosphere={
    2:{sky:0xc6d9d8,hemi:0xe8f3e9,sun:0xffedcb,soil:'#a18f6e'},
    3:{sky:0xdacda9,hemi:0xffe5bc,sun:0xffd39b,soil:'#a1855b'},
    4:{sky:0xaab8c0,hemi:0xdce6eb,sun:0xd9e4ea,soil:'#817d6d'},
    5:{sky:0xc8d7bb,hemi:0xf0efd2,sun:0xffe3a0,soil:'#a58b5e'},
    6:{sky:0xb9b1c6,hemi:0xe4dbe9,sun:0xf2d6b9,soil:'#968675'},
    7:{sky:0xe0c4a8,hemi:0xffedd7,sun:0xffd698,soil:'#ab9069'},
    8:{sky:0xbac6cf,hemi:0xe5e9ec,sun:0xf7dbb3,soil:'#9f9788'},
  }[chapter];
  const spawn = {x:0,z:palace?16:15}, exit = {x:0,z:palace?-30:-28};
  const colors = { red:0x9f4438, green:0x41746a, cream:0xe6d7af, blue:0x496d80, bronze:0x9a804b };
  const materialCache=new Map(),cylinderCache=new Map();
  const mat = color => {
    if(!materialCache.has(color))materialCache.set(color,new THREE.MeshStandardMaterial({color,roughness:.86}));
    return materialCache.get(color);
  };
  const red = mat(colors.red), green = mat(colors.green), paper = mat(0xeadfbd),
    ink = mat(0x363b36), bronze = new THREE.MeshStandardMaterial({color:colors.bronze,metalness:.45,roughness:.4}),
    water = new THREE.MeshStandardMaterial({color:0x7eaca4,transparent:true,opacity:.8,roughness:.25});
  const mesh = (geo,material,x,y,z,sx=1,sy=1,sz=1,parent=scene) => {
    const m = new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
    m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const box = (material,x,y,z,w,h,d,parent=scene) => mesh(G.box,material,x,y,z,w,h,d,parent);
  const wood = (x,y,z,w,h,d,c=0x92724b) => L.deck.push({x,y,z,sx:w,sy:h,sz:d,c});
  const column = (x,y,z,h,c=0x7e6243,scale=1) => L.column.push({x,y,z,sy:h,sx:scale,sz:scale,c});
  const paving = [];
  const plane = (material,x,z,w,d,y=.012) => {const m=mesh(G.plane,material,x,y,z,w,d,1);m.rotation.x=-Math.PI/2;m.castShadow=false;return m;};
  const cylinder = (material,x,y,z,top,bottom,height,n=16,parent=scene) => {
    const key=[top,bottom,height,n].join(':');
    if(!cylinderCache.has(key))cylinderCache.set(key,new THREE.CylinderGeometry(top,bottom,height,n));
    return mesh(cylinderCache.get(key),material,x,y,z,1,1,1,parent);
  };
  const sphereGeo = new THREE.SphereGeometry(1,12,8);
  const rope = (points,material=bronze,r=.035) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,5,false),material,0,0,0);
  const ring = (x,y,z,r,rx=0,ry=0) => {
    const m=mesh(new THREE.TorusGeometry(r,.045,7,40),bronze,x,y,z);m.rotation.set(rx,ry,0);return m;
  };
  const label = (text,x,y,z,w=2.5) => {
    // Match the texture and board aspect ratios, then shrink the whole font uniformly.
    // Canvas fillText(maxWidth) would squash long Korean captions horizontally.
    const h=w<1.2?.42:.6;
    const texture=art.canvasTex(Math.ceil(w/h*256),256,(g,cw,ch)=>{
      g.fillStyle='#ede0bc';g.fillRect(0,0,cw,ch);g.strokeStyle='#765f3e';g.lineWidth=9;g.strokeRect(7,7,cw-14,ch-14);
      const family='Gungsuh, "궁서", "Gowun Batang", "Noto Serif KR", serif';
      g.font=`128px ${family}`;
      const size=Math.min(128,128*(cw-64)/g.measureText(text).width);
      g.font=`${size}px ${family}`;g.fillStyle='#3e463b';g.textAlign='center';g.textBaseline='middle';g.fillText(text,cw/2,ch/2);
    });
    const m=mesh(G.plane,new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide}),x,y,z,w,h,1);
    m.castShadow=false;m.receiveShadow=false;return m;
  };
  const inspect = (id,title,text,x,z,stand={x,z:z+1.6}) => inspectables.push({id,title,text,x,z,stand});
  const hangingCloth=(x,y,z,w,h,color=0xb7aa8b)=>{
    const geometry=new THREE.PlaneGeometry(w,h,6,8);geometry.translate(0,-h/2,0);
    const fabric=M.cloth.clone();fabric.color.set(color);fabric.side=THREE.DoubleSide;
    const sheet=mesh(geometry,fabric,x,y,z);sheet.castShadow=false;sheet.userData.ambientCloth=true;
    clothMotion.push({mesh:sheet,rest:geometry.attributes.position.array.slice(),h,phase:x*.7+z*.2});
    wood(x,y+.03,z,w+.12,.06,.07);return sheet;
  };

  const table = (x,z,w=2,d=1,y=.75) => {
    wood(x,y,z,w,.13,d);for(const dx of [-w*.4,w*.4])for(const dz of [-d*.36,d*.36])column(x+dx,y/2,z+dz,y,0x67503a,.6);
    addCollider(x,z,w,d);
  };
  const pictureScroll=(src,x,y,z,w,h,crop)=>{
    const texture=art.canvasTex(512,512,(g,cw,ch)=>{g.fillStyle='#dfd0a5';g.fillRect(0,0,cw,ch);});
    if(typeof Image==='function'){
      const image=new Image();image.onload=()=>{const g=texture.image.getContext('2d');g.drawImage(image,...(crop||[0,0,image.width,image.height]),16,16,480,480);texture.needsUpdate=true;};
      image.onerror=()=>{};image.src=src;
    }
    mesh(G.plane,new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:1}),x,y,z,w,h);
    for(const dy of [-h/2,h/2])cylinder(M.woodDark,x,y+dy,z,.04,.04,w+.14,10).rotation.z=Math.PI/2;
  };
  // Side-stitched books: beige folded leaves, dyed-paper covers and five-hole thread binding; no modern binding.
  const pageTex=art.canvasTex(128,96,(g,w,h)=>{g.fillStyle='#e8dcb9';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,92,60,.32)';g.lineWidth=1;for(let x=12;x<w;x+=11){g.beginPath();g.moveTo(x,6);g.lineTo(x,h-6);g.stroke();}g.strokeStyle='rgba(120,92,60,.6)';g.lineWidth=2;g.beginPath();g.moveTo(w/2,4);g.lineTo(w/2,h-4);g.stroke();});
  const pageMat=new THREE.MeshStandardMaterial({map:pageTex,roughness:1,side:THREE.DoubleSide});
  const leaves=mat(0xe3d6b2),thread=mat(0x3b2f24);
  const book = (x,y,z,w=.6,open=false,color=0xd2bd93) => {
    const d=.75,t=.075;
    box(leaves,x,y,z,w*.97,t,d*.97);
    box(mat(color),x,y+t/2+.004,z,w,.012,d);box(mat(color),x,y-t/2-.004,z,w,.012,d);
    for(let i=0;i<3;i++)box(thread,x+w*.485,y-t*.3+i*t*.3,z,.006,.006,d*.95);
    for(let i=0;i<5;i++)box(thread,x-w*.42,y+t/2+.012,z-d*.36+i*d*.18,.02,.004,.02);
    box(thread,x-w*.42,y+t/2+.012,z,.004,.004,d*.74);
    if(open)for(const s of [-1,1]){const page=mesh(G.plane,pageMat,x+s*w*.26,y+t/2+.02,z,w*.5,d*.9,1);page.rotation.x=-Math.PI/2;page.rotation.y=s*.08;page.castShadow=false;}
  };
  const pavilion = (x,z,w,d,{royal=false,open=false}={}) => {
    const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
    // Floor, carved beams, paper lattice, bracket blocks and individual eave ends.
    box(M.stonePlinth,0,.18,0,w+.5,.36,d+.5,group);
    box(M.plank,0,.4,0,w,.12,d,group);
    for(const dz of [-d/2+.2,d/2-.2])for(const dx of [-w/2+.22,-w/6,w/6,w/2-.22]){
      box(M.rock,dx,.46,dz,.5,.16,.5,group);
      cylinder(royal?red:M.wood,dx,1.9,dz,.12,.15,2.8,10,group);
      box(royal?green:M.woodDark,dx,3.24,dz,.62,.17,.66,group);
      box(royal?red:M.wood,dx,3.4,dz,.82,.13,.46,group);
    }
    for(const dz of [-d/2+.2,d/2-.2]){
      box(royal?red:M.woodDark,0,3.38,dz,w+.2,.22,.24,group);
      box(royal?green:M.wood,0,3.58,dz,w+.5,.14,.4,group);
    }
    for(let u=-w/2;u<=w/2;u+=.36) {
      box(royal?green:M.wood,u,3.6,0,.12,.15,d+1,group);
      const e=mesh(G.eaveTile,M.ridge,u,3.65,d/2+.62,1,1,1,group);
      e.castShadow=false;
    }
    if(!open){
      box(M.plaster,0,1.7,-d/2+.15,w-.4,2.45,.15,group);
      for(const dx of [-w*.32,0,w*.32])mesh(G.plane,M.latticeFine,dx,1.85,-d/2+.24,w*.25,1.95,1,group);
      addCollider(x,z-d/2+.15,w,.3);
    }
    const roof=mesh(art.makeRoofGeometry(w,d,1.3,.65,.35,.22),M.tile.clone(),0,3.7,0,1,1,1,group);
    roof.userData.roofSurface=true;
    roof.material.transparent=true;occluders.push(roof);
    mesh(art.makeGableGeometry(w,d,1.3),royal?red:M.woodDark,0,3.7,0,1,1,1,group);
    box(M.ridge,0,5.04,0,w*.84,.2,.28,group);
    addCollider(x,z,w+.5,d+.5);
    return group;
  };
  // The host supplies illustrated actors; environment geometry never draws block people.
  const npc = (id,x,z,role,height=2.25,pose='standing',expression='calm',ground=0) =>
    npcExtras.push({id,x,z,role,height,pose,expression,ground});
  const wall = (x,z,w,d) => {
    box(M.stoneWall,x,.48,z,w,.96,d);
    box(M.plaster,x,1.08,z,w,.35,d*.8);
    const alongX=w>d;
    const cap=mesh(art.makeRoofGeometry(alongX?w:d,.5,.19,.12,.025,.02),M.tile,x,1.26,z);
    if(!alongX)cap.rotation.y=Math.PI/2;
    addCollider(x,z,w,d);
  };
  const garden = (x,z,w,d,{tree=false,pine=false}={}) => {
    box(M.stonePlinth,x,.16,z,w,.32,d);
    plane(M.mud,x,z,w-.2,d-.2,.33);
    for(let dx=-w/2+.25;dx<w/2;dx+=.65)for(const dz of [-d/2,d/2])
      mesh(sphereGeo,M.rock,x+dx,.3,z+dz,.36,.18,.21);
    for(let dz=-d/2+.4;dz<d/2;dz+=.75)for(const dx of [-w/2,w/2])
      mesh(sphereGeo,M.rock,x+dx,.3,z+dz,.24,.16,.4);
    for(let i=0;i<12;i++)addShrub(x+rr(-w*.35,w*.35),z+rr(-d*.3,d*.3),rr(.6,1));
    for(let i=0;i<10;i++){
      const dx=x+rr(-w*.34,w*.34),dz=z-d*.3+rr(-.15,.15),h=rr(1.7,2.5);
      column(dx,h/2,dz,h,0x708357,.15);
      for(let k=0;k<3;k++)L.leaf.push({x:dx+(k%2?.15:-.15),y:h*.5+k*.28,z:dz,sx:.32,sy:.12,sz:.22,ry:rr(0,3),c:0x8b9e66});
    }
    if(tree)addTree(x,z,1.05);if(pine)addPine(x,z,1.1);
    addCollider(x,z,w+.3,d+.3);
  };
  const bench = (x,z,w=2) => {
    wood(x,.48,z,w,.15,.48,0x8b7352);
    for(const dx of [-w*.35,w*.35])box(M.rock,x+dx,.22,z,.28,.44,.38);
    addCollider(x,z,w,.5);
  };
  const toolRack = (x,z) => {
    for(const dx of [-.65,.65])column(x+dx,1,z,2,0x78613e,.75);
    wood(x,1.65,z,1.65,.12,.16);
    for(let i=0;i<3;i++){
      const shaft=box(M.wood,x-.45+i*.45,.88,z+.1,.06,1.45,.06);shaft.rotation.z=(i-1)*.12;
      box(M.woodDark,x-.45+i*.45,.24,z+.13,.32,.16,.08);
    }
    addCollider(x,z,1.7,.5);
  };

  // Thin, curved rice blades: five per clump, shared by every paddy in chapters 2 and 5.
  const riceGeo=(()=>{const positions=[],indices=[];
    for(let blade=0;blade<5;blade++){
      const angle=blade*Math.PI*2/5+.4,height=.3+(blade%3)*.07,bend=.16+(blade%2)*.07,base=positions.length/3;
      for(let step=0;step<=5;step++){
        const t=step/5,width=.012*(1-t*.85)+.001,lean=bend*t*t;
        for(const edge of [-1,1])positions.push(Math.cos(angle)*lean-Math.sin(angle)*width*edge,height*t,Math.sin(angle)*lean+Math.cos(angle)*width*edge);
        if(step<5){const k=base+step*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;})();
  const riceMat=mat(0x6f9446);riceMat.side=THREE.DoubleSide;
  const paddySoil=mat(0x5c4a33);
  const mudWater=new THREE.MeshStandardMaterial({color:0x6f6a4e,transparent:true,opacity:.55,roughness:.35});
  // One flooded paddy: mud under shallow muddy water, an irregular earthen bund, spaced transplanted clumps and a dense nursery corner.
  const paddy=(x,z,w,d,{rows=6,cols=13,flag=false,nursery='sw'}={})=>{
    plane(paddySoil,x,z,w,d,.03);
    const sheet=plane(mudWater,x,z,w-.3,d-.3,.055);
    const rippleMat=new THREE.MeshBasicMaterial({color:0xc1c9b4,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
    for(let i=0;i<9;i++){
      const ripple=mesh(new THREE.RingGeometry(.16,.174,24),rippleMat,x+rr(-w*.36,w*.36),.063,z+rr(-d*.32,d*.32));
      ripple.rotation.x=-Math.PI/2;ripple.scale.y=.6;
    }
    const loop=[],n=16;
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,px=Math.cos(a),pz=Math.sin(a),k=1/Math.max(Math.abs(px),Math.abs(pz));loop.push(new THREE.Vector3(x+px*k*(w/2+.05)+rr(-.12,.12),.08+rr(-.02,.03),z+pz*k*(d/2+.05)+rr(-.12,.12)));}
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop,true,'catmullrom',.6),64,.17,7,true),paddySoil,0,0,0);
    for(let i=0;i<14;i++){const p=loop[i%n];mesh(sphereGeo,paddySoil,p.x+rr(-.15,.15),.1,p.z+rr(-.15,.15),rr(.12,.24),rr(.06,.1),rr(.1,.2));}
    const clumps=[],sx=(w-1.4)/(cols-1),sz=(d-1.2)/(rows-1);
    for(let r=0;r<rows;r++)for(let j=0;j<cols;j++)clumps.push({x:x-(w-1.4)/2+j*sx+rr(-.05,.05),y:.05,z:z-(d-1.2)/2+r*sz+rr(-.05,.05),ry:rr(0,6.28),sx:rr(.85,1.15),sy:rr(.85,1.2),c:[0x6e9147,0x8aa54f,0x5e873d][(r+j)%3]});
    const seedlings=art.buildInstanced(riceGeo,riceMat,clumps,false,true);if(flag)seedlings.userData.riceSeedlings=true;
    const bed=[],nx=nursery==='sw'?x-w/2+1.1:x+w/2-1.1,nz=z+d/2-.9;
    for(let r=0;r<8;r++)for(let j=0;j<18;j++)bed.push({x:nx-.85+j*.1+rr(-.02,.02),y:.05,z:nz-.35+r*.1+rr(-.02,.02),ry:rr(0,6.28),sx:rr(.5,.7),sy:rr(.55,.8),c:0x86a64e});
    art.buildInstanced(riceGeo,riceMat,bed,false,true);
    mesh(sphereGeo,paddySoil,nx,.06,nz,1.05,.05,.55);
    addCollider(x,z,w+.4,d+.4);
    return sheet;
  };

  scene.background = new THREE.Color(atmosphere.sky);
  scene.fog = new THREE.Fog(atmosphere.sky,48,150);
  scene.add(new THREE.HemisphereLight(atmosphere.hemi,0x8d9675,1.9));
  const sun = new THREE.DirectionalLight(atmosphere.sun,chapter===4?1.55:2.1);
  sun.position.set(-24,36,14);sun.target.position.set(0,0,-8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-26,right:26,top:36,bottom:-36,near:2,far:100});
  sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
  const fill=new THREE.DirectionalLight(0xd4e5ed,.6);fill.position.set(20,15,-25);scene.add(fill);
  plane(M.ground,0,-8,180,190,0);
  const soil=art.canvasTex(256,256,(g,w,h)=>{
    g.fillStyle=atmosphere.soil;g.fillRect(0,0,w,h);
    for(let i=0;i<4200;i++){
      g.fillStyle=i%2?'rgba(255,244,208,.13)':'rgba(72,58,37,.1)';
      g.fillRect(rr(0,w),rr(0,h),rr(1,3),rr(1,3));
    }
  },{repeat:true});soil.repeat.set(14,19);
  const yard=new THREE.MeshStandardMaterial({map:soil,roughness:1});
  plane(yard,0,-7,palace?35:32,palace?49:46);
  const wearTexture=art.canvasTex(128,128,(g,w,h)=>{
    g.clearRect(0,0,w,h);
    for(let i=0;i<50;i++){
      g.fillStyle=`rgba(97,76,47,${rr(.02,.085)})`;g.beginPath();
      g.ellipse(rr(20,108),rr(20,108),rr(4,21),rr(3,12),rr(0,3),0,Math.PI*2);g.fill();
    }
  });
  const wear=new THREE.MeshStandardMaterial({map:wearTexture,transparent:true,depthWrite:false,roughness:1});
  for(const p of stations){
    plane(wear,p.x,p.z+2.2,8,5,.027);
    plane(wear,p.x*.5,p.z+1.5,5,2,.029);
  }
  // Stone slabs remain level; every station connects to the generous central avenue.
  for(let z=bounds.minZ+2;z<bounds.maxZ;z+=1.25)for(let x=-1.5;x<=1.5;x+=1.05)
    paving.push({x:x+rr(-.04,.04),y:.035,z:z+rr(-.04,.04),sx:.98,sy:.06,sz:1.12,c:palace?0xc4c3b7:0xb9ad94});
  for(const p of stations){
    plane(yard,p.x,p.z+1.5,10,8,.02);
    for(let x=Math.min(0,p.x);x<=Math.max(0,p.x);x+=1.05)
      paving.push({x,y:.04,z:p.z+1.6,sx:.95,sy:.06,sz:1.1,c:0xc4b99e});
  }
  art.buildInstanced(G.box,M.rock,paving,false,true);
  for(const x of [bounds.minX-.2,bounds.maxX+.2])wall(x,(bounds.minZ+bounds.maxZ)/2,.65,bounds.maxZ-bounds.minZ+1);
  wall(0,bounds.minZ-.25,bounds.maxX*2+1,.65);
  wall(0,bounds.maxZ+.25,bounds.maxX*2+1,.65);
  for(let z=bounds.minZ;z<=bounds.maxZ;z+=1.5)for(const side of [-1,1]){
    addShrub(side*(bounds.maxX+.5),z,.9);
    if(Math.round(z*2)%6===0){addTree(side*(bounds.maxX+3),z,rr(1.1,1.55));addPine(side*(bounds.maxX+7),z-3,1.5);}
  }
  for(let x=bounds.minX;x<bounds.maxX;x+=2.4){addShrub(x,bounds.minZ+.7,.6);addTree(x,bounds.minZ-5,rr(1.1,1.5));addShrub(x,bounds.maxZ+.8,.8);}
  for(const [radius,height,color,top] of [[70,24,'#657c6b','#a4b6a3'],[112,36,'#8caaa3','#c3d2c3']]){
    const tex=art.mountainTex(color,top,1,.2,4);
    const m=mesh(new THREE.CylinderGeometry(radius,radius,height,72,1,true),new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide,alphaTest:.5}),0,height/2-2,-8);
    m.castShadow=false;m.receiveShadow=false;
  }

  if(palace){
    // These working yards are invented learning-space arrangements, not a restored palace plan.
    addBuilding(-1,-2.2,{x:-15.6,W:5.6,D:3.2,wallH:2.25,rise:1.05,door:M.plankDoor,wallMat:M.plank});
    addBuilding(-1,-26,{x:-15.4,W:6,D:3.5,wallH:2.4,rise:1.15,door:M.lattice});
    addBuilding(1,10,{x:15.5,W:5.8,D:3.5,wallH:2.35,rise:1.05,door:M.latticeFine});
    garden(-8,-3.4,5.6,3.8,{pine:true});
    garden(8.7,9.5,5.4,3.6,{tree:true});
    garden(12.7,-15.9,5.1,3.5,{pine:true});
    garden(-8.2,-28.5,5.1,2.5);
    bench(-7.4,-.9,2.7);bench(8,12,2.5);
    wall(-13,-6.5,4.2,.45);wall(14.3,5.8,4.5,.45);
    addJarCluster(-13.4,-.6,4);addJarCluster(14,13,3);addLogPile(-13.7,-4.3,0);
    toolRack(-12.6,2);toolRack(14.3,-9.5);
    for(const [x,z] of [[-14,-24],[-13.4,-25.2],[13.9,-19.8]]){
      addBasket(x,0,z);addSackFull(x+.55,z,.75);addMat(x,z+.5);
    }
    // Bundled paper and small timber stacks suggest work and maintenance without adding a mission.
    table(-12.7,-27.2,1.5,.8,.65);
    for(let i=0;i<4;i++)book(-12.7,.76+i*.1,-27.2,.55,false,i%2?0x6b806b:0x807358);
    // The farming demonstration garden: irrigation, dry beds and a farmer's illustrated notebook.
    addBuilding(-1,9,{x:-15,W:6.5,D:4,wallH:2.35,rise:1.12,kind:'tile',door:M.latticeFine});
    paddy(-9,7.2,6.2,5,{rows:5,cols:11,nursery:'se'});
    table(-8,10.2,2.1,.9,.78);book(-8,.88,10.2,.88,true);
    label('농부의 경험을 모아요',-8,1.5,10.1,3);
    addBasket(-10,0,11);addSackFull(-10.8,10.6,.85);addSackFull(-11.6,10.7,.9);addJarCluster(-13,12.3,3);
    
    inspect('farm','우리 땅의 농사 경험','땅과 날씨, 씨 뿌리는 때를 농부에게 물어 모았어요.',-8,10.2,{x:-8,z:11.7});
    addTree(-13,3.6,1.15);addShrub(-12.8,3.6,.9);

    // Four recognizable scientific instruments, each with an open viewing position.
    const courtStone=M.rock.clone();courtStone.map=courtStone.map.clone();courtStone.map.repeat.set(7,5);courtStone.map.needsUpdate=true;
    plane(courtStone,9,-4.2,12,8,.045);
    addBuilding(1,-5,{x:16,W:7,D:3.8,wallH:2.4,rise:1.2,door:M.latticeFine});
    const armX=6,armZ=-5.2;
    // 혼천의: cross-shaped stone base with water channels, four pillars, graduated outer rings, tilted inner rings and a central earth.
    const tickTex=art.canvasTex(512,32,(g,w,h)=>{g.fillStyle='#9a804b';g.fillRect(0,0,w,h);g.fillStyle='#4b3b22';for(let i=0;i<72;i++)g.fillRect(i*w/72,i%6?10:4,2,i%6?12:24);},{repeat:true});
    const graduated=bronze.clone();graduated.map=tickTex;
    box(M.rock,armX,.14,armZ,2.6,.28,.5);box(M.rock,armX,.14,armZ,.5,.28,2.6);
    plane(water,armX,armZ,2.2,.12,.29);plane(water,armX,armZ,.12,2.2,.29);
    for(const dx of [-.7,.7])for(const dz of [-.7,.7]){cylinder(bronze,armX+dx,1,armZ+dz,.07,.09,1.5,10);const brace=cylinder(bronze,armX+dx*.75,1.9,armZ+dz*.75,.045,.045,.8,8);brace.rotation.set(dz>0?.45:-.45,0,dx>0?-.45:.45);}
    const ringOf=(r,rx=0,ry=0,m=bronze)=>{const t=mesh(new THREE.TorusGeometry(r,.045,7,48),m,armX,1.95,armZ);t.rotation.set(rx,ry,0);return t;};
    ringOf(1.02,Math.PI/2,0,graduated);ringOf(.98,0,0,graduated);ringOf(.9,0,Math.PI/2);
    ringOf(.84,.92,0,graduated);
    const inner=ringOf(.66,-.5,-.7);animated.push({mesh:inner,axis:'y',base:inner.rotation.y,amount:.06});
    ringOf(.58,1.1,.4);
    cylinder(bronze,armX,1.95,armZ,.02,.02,2.3,6).rotation.x=-.65;
    mesh(sphereGeo,mat(0x4f6f6b),armX,1.95,armZ,.17,.17,.17);
    label('혼천의 · 천체의 움직임',armX,3.2,armZ+1.2,2.9);
    addCollider(armX,armZ,2.8,2.8);
    inspect('armillary','혼천의','여러 고리가 천체의 움직임과 위치를 살피는 데 쓰였어요.',armX,armZ,{x:6,z:-3.2});
    const rainX=11.2,rainZ=-5.2;
    // 측우기: a stepped stone stand (측우대), the bronze cylinder with lip rings, rainwater inside and a graduated measuring rule.
    box(M.rock,rainX,.22,rainZ,1.5,.44,1.5);box(M.stonePlain,rainX,.6,rainZ,1.1,.32,1.1);box(M.rock,rainX,.8,rainZ,1.25,.08,1.25);
    mesh(new THREE.CylinderGeometry(.37,.35,1.02,22,1,true),bronze,rainX,1.35,rainZ);
    ring(rainX,1.86,rainZ,.37,Math.PI/2);ring(rainX,1.2,rainZ,.37,Math.PI/2);
    cylinder(water,rainX,1.7,rainZ,.33,.33,.02,20);
    const ruleTex=art.canvasTex(32,256,(g,w,h)=>{g.fillStyle='#d9c79a';g.fillRect(0,0,w,h);g.fillStyle='#4a3a26';for(let i=0;i<24;i++)g.fillRect(0,4+i*10.4,i%5?9:18,2);});
    const rule=mesh(G.plane,new THREE.MeshStandardMaterial({map:ruleTex,side:THREE.DoubleSide,roughness:1}),rainX+.62,1.25,rainZ+.5,.12,1.15,1);rule.rotation.set(0,-.4,-.14);
    label('측우기 · 빗물의 깊이',rainX,2.6,rainZ,2.8);addCollider(rainX,rainZ,1.6,1.6);
    inspect('rain','측우기','원통 안에 모인 빗물의 깊이로 내린 비의 양을 재요.',rainX,rainZ,{x:11.2,z:-3.5});
    const sunX=5.4,sunZ=-.5;
    // 앙부일구: a hemispherical bowl with seasonal lines, hour lines fanning from the pole, a tilted gnomon (영침) and four legs.
    box(M.rock,sunX,.12,sunZ,1.3,.24,1.3);
    for(const dx of [-.35,.35])for(const dz of [-.35,.35])cylinder(bronze,sunX+dx,.5,sunZ+dz,.05,.07,.55,8);
    const bowlGeo=new THREE.SphereGeometry(.68,28,14,0,Math.PI*2,Math.PI/2,Math.PI/2);
    const bowlMat=bronze.clone();bowlMat.side=THREE.DoubleSide;
    mesh(bowlGeo,bowlMat,sunX,1.45,sunZ);
    ring(sunX,1.45,sunZ,.68,Math.PI/2);
    for(let i=-3;i<=3;i++){
      const radius=Math.sqrt(.65*.65-(i*.13)**2),points=[];
      for(let k=0;k<=20;k++){const a=Math.PI*k/20;points.push([sunX+Math.cos(a)*radius,1.45-Math.sin(a)*radius,sunZ+i*.13]);}
      rope(points,paper,i?.006:.01);
    }
    for(let i=-3;i<=3;i++){
      const a=Math.PI/2+i*.33,points=[];
      for(let k=0;k<=12;k++){const b=Math.PI*(.5+k/24);points.push([sunX+Math.cos(b)*Math.cos(a)*.65,1.45-Math.sin(b)*.65,sunZ+Math.cos(b)*Math.sin(a)*.65]);}
      rope(points,paper,.006);
    }
    rope([[sunX,.82,sunZ+.05],[sunX,1.62,sunZ-.5]],ink,.025);mesh(sphereGeo,ink,sunX,1.62,sunZ-.5,.04,.04,.04);
    label('앙부일구 · 해 그림자',sunX,2.2,sunZ,3.1);addCollider(sunX,sunZ,1.45,1.45);
    inspect('sundial','앙부일구','오목한 면에 드리운 해 그림자로 시각을 알아요. 햇빛이 필요해요.',sunX,sunZ,{x:5.4,z:1.3});
    const waterX=11.4,waterZ=-.5;
    // 자격루: stepped supply vessels (파수호) feed two tall receiving cylinders (수수호); floats lift graduated rods that trip the bell, drum and gong figures.
    box(M.plank,waterX,.3,waterZ,2.9,.6,1.9);
    const vessel=(dx,h,r)=>{const geo=new THREE.LatheGeometry([new THREE.Vector2(0,-.3),new THREE.Vector2(r*.8,-.3),new THREE.Vector2(r,.22),new THREE.Vector2(r,.3),new THREE.Vector2(r*.85,.3),new THREE.Vector2(r*.78,-.2)],20);mesh(geo,bronze,waterX+dx,h,waterZ);cylinder(water,waterX+dx,h+.2,waterZ,r*.84,r*.84,.016,20);for(const dz of [-.3,.3])column(waterX+dx,.3+(h-.5)/2,waterZ+dz,h-.5,0x6f5940,.7);};
    vessel(-1.05,2.05,.36);vessel(-.35,1.55,.3);vessel(.25,1.1,.25);
    rope([[waterX-1.05,2.1,waterZ],[waterX-.35,1.95,waterZ],[waterX-.35,1.6,waterZ]],bronze,.04);
    rope([[waterX-.35,1.6,waterZ],[waterX+.25,1.45,waterZ],[waterX+.25,1.15,waterZ]],bronze,.04);
    rope([[waterX+.25,1.15,waterZ],[waterX+.9,1.05,waterZ],[waterX+.9,.9,waterZ]],bronze,.035);
    for(const dz of [-.45,.45]){cylinder(bronze,waterX+.9,1.05,waterZ+dz,.17,.19,.9);column(waterX+.9,1.75,waterZ+dz,1.5,0xd9cba0,.16);for(let i=0;i<6;i++)box(ink,waterX+.98,1.2+i*.2,waterZ+dz,.02,.02,.1);}
    box(M.wood,waterX,2.75,waterZ-.7,2.8,.12,.16);
    for(const dx of [-1.2,1.2])column(waterX+dx,1.5,waterZ-.7,2.9,0x6f5940,.75);
    // Signal figures (인형) with bell, drum and gong stand on the upper frame.
    const jackTex=art.canvasTex(64,96,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#a53f32';g.fillRect(20,36,24,50);g.fillRect(10,40,10,22);g.fillRect(44,40,10,22);g.fillStyle='#e8d2b4';g.beginPath();g.arc(32,24,12,0,7);g.fill();g.fillStyle='#262626';g.fillRect(18,8,28,8);});
    const jackMat=new THREE.MeshStandardMaterial({map:jackTex,transparent:true,alphaTest:.3,side:THREE.DoubleSide,roughness:1});
    for(const [i,dx] of [-.85,0,.85].entries()){
      mesh(G.plane,jackMat,waterX+dx,3.15,waterZ-.62,.42,.63,1);
      if(i===0)mesh(new THREE.LatheGeometry([new THREE.Vector2(0,.18),new THREE.Vector2(.1,.16),new THREE.Vector2(.16,0),new THREE.Vector2(.18,-.06)],14),bronze,waterX+dx+.4,3.2,waterZ-.62);
      if(i===1){cylinder(M.wood,waterX+dx+.4,3.2,waterZ-.62,.17,.17,.22,14).rotation.z=Math.PI/2;cylinder(paper,waterX+dx+.52,3.2,waterZ-.62,.16,.16,.02,14).rotation.z=Math.PI/2;}
      if(i===2)cylinder(bronze,waterX+dx+.4,3.2,waterZ-.62,.19,.19,.03,18).rotation.x=Math.PI/2;
    }
    box(M.plank,waterX,.85,waterZ-.55,2.6,1.15,.45);
    for(const dx of [-1.1,-.37,.37,1.1])box(M.woodDark,waterX+dx,.9,waterZ-.29,.065,.96,.055);
    for(const y of [.42,.9,1.4])box(M.woodDark,waterX,y,waterZ-.28,2.6,.07,.055);
    box(M.woodDark,waterX,3.55,waterZ-.62,3,.1,.5);
    label('자격루 · 물의 흐름으로 시각을 알려요',waterX,4,waterZ,3.4);
    
    addCollider(waterX,waterZ,3,2);
    inspect('waterclock','자격루','물의 흐름을 이용하고 장치가 자동으로 시각을 알렸어요. 햇빛이 없어도 쓸 수 있어요.',waterX,waterZ,{x:11.4,z:1.4});
    addPine(14,1.6,1.05);addShrub(14,1.6,.8);
    for(const [x,z] of [[14,10],[-14,-5],[14,-16]]){
      addTree(x,z,1.15);addShrub(x,z,.85);addCollider(x,z,.6,.6);
      for(const dx of [-1,1])addShrub(x+dx,z+.4,.5);
    }

    // Sejong's study: an open, layered royal pavilion and a quiet desk, without invented Chinese text.
    pavilion(-9,-18,8,4.4,{royal:true});
    label('백성을 생각하는 세종',-9,2.95,-14.25,4.4);
    table(-9,-16.8,3.2,1.15,1);
    book(-9.6,1.1,-16.8,.9,true);book(-8.4,1.12,-16.8,.7,false,0x486779);
    box(ink,-8.1,1.12,-16.5,.3,.045,.22);rope([[-8.35,1.14,-16.65],[-8.1,1.23,-16.8]],M.woodDark,.025);
    // Only the station actor is the king; avoid a second portrait behind the desk.
    
    
    for(const x of [-11.8,-6.2]){book(x,.63,-18.4,.7);book(x,.8,-18.4,.62,false,0x8f6656);}
    // Letter tiles sit on a lower outdoor table, so the play path stays outside the raised pavilion.
    table(-8,-13.7,2.7,.9,.73);
    for(const [i,t] of ['ㅁ','ㅜ','ㄹ'].entries())label(t,-8.8+i*.8,1.04,-13.65,.65);
    inspect('study','세종의 고민','백성이 자신의 뜻을 쉽게 글로 전하도록 새 글자를 만들었어요.',-9,-16.8,{x:-8,z:-12.5});
    addPine(-14.3,-15,1.35);addJarCluster(-14.2,-20.5,3);
    const pondX=-12,pondZ=-9.8;
    cylinder(M.rock,pondX,.08,pondZ,1.8,1.9,.16,24);cylinder(water,pondX,.17,pondZ,1.6,1.6,.03,24);
    for(let i=0;i<5;i++){const a=i*2.4;mesh(sphereGeo,M.rock,pondX+Math.cos(a)*1.7,.2,pondZ+Math.sin(a)*1.7,.55,.28,.4);}
    addCollider(pondX,pondZ,3.8,3.8);

    // Border and maritime records stay in the same palace, with a model boat and a relief map.
    pavilion(9,-28.4,7,3,{open:true});
    label('국경의 지도 · 바다의 소식',9,2.95,-25.3,4.8);
    table(8,-25,3.4,1.4,.85);
    const mapTexture=art.canvasTex(512,256,(g,w,h)=>{
      g.fillStyle='#b6c8bd';g.fillRect(0,0,w,h);
      g.fillStyle='#d9c89b';g.beginPath();g.moveTo(150,0);g.lineTo(270,35);g.lineTo(285,85);g.lineTo(335,155);g.lineTo(275,220);g.lineTo(245,175);g.lineTo(225,120);g.lineTo(150,70);g.closePath();g.fill();
      g.strokeStyle='#6e8b8b';g.lineWidth=5;g.beginPath();g.moveTo(170,45);g.quadraticCurveTo(215,35,264,76);g.stroke();
      g.fillStyle='#907b50';g.beginPath();g.ellipse(360,210,10,25,.4,0,7);g.fill();
    });
    plane(new THREE.MeshStandardMaterial({map:mapTexture,roughness:1}),8,-25,3.15,1.25,.94);
    for(let i=0;i<4;i++){column(7.1+i*.24,1.04,-25.25,.23,0x8d4d39,.2);}
    const hull=mesh(new THREE.SphereGeometry(.65,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),M.wood,10.5,.95,-25,1.3,.5,.5);
    column(10.5,1.35,-25,.8,0x6a4e38,.3);
    const sail=mesh(new THREE.PlaneGeometry(.55,.65),paper,10.7,1.46,-25);sail.rotation.y=-.15;
    inspect('relations','교류와 군사적 대응','문물을 주고받기도 하고, 필요할 때 국경과 바다를 지키기 위해 군사적으로 대응했어요.',8,-25,{x:8,z:-23.5});
    addBasket(11.5,0,-24);addSackFull(12,-24.3,.75);addTree(14.2,-22.5,1);
  } else if(chapter===3) {
    // A broad village commons, distinct from the formal palace and the troubled chapter-one lane.
    addBuilding(-1,10,{x:-13.4,W:6.3,D:3.9,wallH:2.3,rise:1.1,door:M.latticeFine});
    addBuilding(1,10,{x:12.6,W:4.5,D:3.5,wallH:2,rise:1.15,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(1,1,{x:13.4,W:6,D:3.6,wallH:2.3,rise:1.1,door:M.latticeFine});
    addBuilding(-1,-2,{x:-13.5,W:4.5,D:3.4,wallH:2,rise:1,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(-1,-14,{x:-13.8,W:6,D:3,wallH:2.1,rise:1.1,kind:'thatch',wallMat:M.plank,door:M.plankDoor});
    addBuilding(1,-14,{x:13.5,W:5.5,D:3.4,wallH:2,rise:1.05,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    for(const [x,z] of [[-11,15],[11,15],[-12,4],[14,-6],[-13,-23],[13,-27]]){addTree(x,z,1.15);addShrub(x,z,.65);}
    addJarCluster(10,7,4);addJarCluster(-11,-5,3);addLogPile(11,-17,0);addBasket(-12,0,-17);addSackFull(10,-11,.85);
    addBuilding(-1,-26,{x:-12.5,W:5.6,D:3.5,wallH:1.95,rise:1.05,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    garden(-7.3,-1.5,4.8,3.2,{tree:true});
    garden(-7.5,-23.8,4.4,3.2);
    bench(-8.1,1.1,2.3);wall(-12.5,-21.4,5,.4);
    toolRack(10,-9.1);addLogPile(-10.4,-27.5,.2);addJarCluster(-9.4,-26.6,3);
    for(const [x,z] of [[10,-16.5],[10.7,5.6],[-10,-4.5]]){
      addBasket(x,0,z);addMat(x+.7,z);addJarCluster(x+.7,z+.6,2);
    }
    const wellX=7.5,wellZ=-10.6;
    cylinder(M.rock,wellX,.35,wellZ,.72,.8,.7,16);
    cylinder(ink,wellX,.707,wellZ,.56,.56,.012,20);
    cylinder(water,wellX,.714,wellZ,.49,.49,.012,20);
    for(const dx of [-.85,.85])column(wellX+dx,1.2,wellZ,2.4,0x776042,.9);
    wood(wellX,2.4,wellZ,2,.14,.18);
    rope([[wellX,2.34,wellZ],[wellX,1.4,wellZ],[wellX,.8,wellZ]],M.woodDark,.022);
    addBasket(wellX+1.2,0,wellZ+.4);addCollider(wellX,wellZ,2,1.6);
    // A modest household drying rail: no unsupported ceremonial arrangement.
    for(const dx of [-1.1,1.1])column(7.3+dx,1.05,-17,2.1,0x7c6d50,.7);
    wood(7.3,2,-17,2.4,.06,.06);
    for(let i=0;i<3;i++){
      const cloth=M.cloth.clone();cloth.color.set([0xb3b6a4,0xa0a89d,0xc1b08b][i]);
      const sheet=mesh(G.plane,cloth,6.6+i*.7,1.56,-17,.5,.8,1);
      sheet.rotation.y=(i-1)*.08;
    }
    addCollider(7.3,-17,2.5,.35);

    // School yard: low desks, books and an illustrated example rather than fake historical calligraphy.
    for(const [i,[x,z]] of [[-8.6,7],[-5.7,7],[-8.6,9.2],[-5.7,9.2]].entries()){
      table(x,z,1.5,.8,.5);book(x,.6,z,.58,true);addMat(x,z-.45);
      // Two distinct seated pupils; the remaining desks hold lesson materials.
      if(i<2)npc(`school-child-${i}`,x,z-.45,'student',1.4,'seated',i%2?'focused':'curious');
    }
    label('서당 · 글과 그림으로 배워요',-7,2.7,6.1,4.2);
    for(const x of [-9.7,-4.3])column(x,1.3,5.65,2.6,0x705a3d,.7);
    const illustrated=art.canvasTex(384,256,(g,w,h)=>{
      g.fillStyle='#e5d6ac';g.fillRect(0,0,w,h);g.strokeStyle='#766849';g.lineWidth=3;g.strokeRect(10,10,w-20,h-20);
      for(let i=0;i<3;i++){const x=76+i*115;g.fillStyle=['#6e8581','#b18d69','#83966c'][i];g.beginPath();g.arc(x,91,15,0,7);g.fill();g.beginPath();g.moveTo(x-13,111);g.lineTo(x+13,111);g.lineTo(x+26,178);g.lineTo(x-26,178);g.closePath();g.fill();}
      g.strokeStyle='#7c6f51';g.beginPath();g.moveTo(80,140);g.lineTo(180,140);g.lineTo(300,140);g.stroke();
    });
    // A hanging picture scroll (족자) on wooden rollers replaces a modern-looking wall board.
    wood(-7,2.6,5.65,5.6,.1,.1,0x5e4a35);
    mesh(G.plane,new THREE.MeshStandardMaterial({map:illustrated,side:THREE.DoubleSide,roughness:1}),-7,1.55,5.65,2.4,1.6,1);
    for(const y of [2.37,.73])cylinder(M.woodDark,-7,y,5.65,.05,.05,2.6,10).rotation.z=Math.PI/2;
    rope([[-7.9,2.37,5.65],[-7,2.58,5.65],[-6.1,2.37,5.65]],M.woodDark,.012);
    inspect('education','글과 그림으로 전한 가르침','학교와 책은 유교의 가르침을 전했어요. 그림은 글을 읽기 어려운 사람의 이해를 도왔어요.',-7,5.65,{x:-7,z:10.5});

    // The local official's open desk, legal records and everyday ceremony objects.
    pavilion(8,-5,6,3.4);
    label('기록을 펼쳐 판단해요',8,2.9,-1.5,4);
    table(7,-2,3,1,.82);book(6.3,.92,-2,.8,true);book(7.6,.92,-2,.65,false,0x697e84);
    
    for(let i=0;i<3;i++)book(9.4,.55+i*.15,-5.3,.75,false,0x7c6b51);
    inspect('law','경국대전과 생활','당시의 법에 담긴 조건을 확인해 사건을 판단해요. 오늘날의 법과는 달라요.',7,-2,{x:7,z:-.5});

    // Four lives are compared side by side; no occupation is presented as a person's worth.
    const peopleX=[-10.3,-7.8,-5.3,-2.8];
    for(const [i,x] of peopleX.entries()){
      table(x,-13.8,1.8,.9,.68);
      if(i===1||i===2)npc(`daily-life-${i}`,x,-15.1,i===1?'artisan':'farmer',2.25,'standing','thoughtful');
      label(['양반','중인','상민','천민'][i],x,2.55,-13.85,1.75);
    }
    book(peopleX[0],.78,-13.8,.7,true);
    for(const dx of [-.4,0,.4]){cylinder(M.jar,peopleX[1]+dx,.88,-13.8,.09,.12,.28,10);box(paper,peopleX[1]+dx,.86,-13.68,.12,.15,.01);}
    addBasket(peopleX[2],.75,-13.8);addSackFull(peopleX[2]+.5,-12.8,.65);
    wood(peopleX[3],.84,-13.8,.9,.12,.5,0xb9a784);addBasket(peopleX[3]+.7,0,-14);
    for(const x of [-11.5,-1.6])column(x,1.5,-16,3,0x84633d,.9);
    const awning=mesh(new THREE.PlaneGeometry(10.5,2.7),M.cloth,-6.5,3.05,-15.5);awning.rotation.x=-Math.PI/2+.1;
    awning.material=awning.material.clone();awning.material.color.set(0xb4a17e);awning.material.transparent=true;occluders.push(awning);
    inspect('lives','네 사람의 생활 기록','신분에 따라 맡는 일과 의무, 누리는 기회가 달랐어요. 각 사람의 이야기를 모두 살펴요.',-7,-13.8,{x:-7,z:-11.5});

    // Two household records face the same open comparison yard.
    pavilion(7.8,-26,8.2,3.4);
    table(5.3,-23,2.4,1.1,.72);table(10,-23,2.4,1.1,.72);
    label('조선 전기의 기록',5.3,2.6,-22.4,2.9);label('조선 후기의 기록',10,2.6,-22.4,2.9);
    book(5,.83,-23,.75,true);book(9.7,.83,-23,.75,true);

    // Equal-sized figures avoid implying that legal/social inequality reflects human worth.
    inspect('family','두 세대의 가족 기록','상속과 제사 관행이 시기에 따라 어떻게 달라졌는지 비교해요. 모든 가족의 모습이 같지는 않았어요.',7.6,-23,{x:7.6,z:-21.4});
    addJarCluster(13,-24,3);addBasket(12.5,0,-22.7);addMat(3.5,-25);
  }
  if(chapter===4){
    // Separate record sites span two wars; this is not one simultaneous battlefield.
    addBuilding(-1,10,{x:-13.4,W:5.3,D:3.7,wallH:1.9,rise:1,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(-1,-1,{x:-13.3,W:4.6,D:3.3,wallH:1.85,rise:.95,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(1,11,{x:12.9,W:4.2,D:3.3,wallH:1.95,rise:1,kind:'thatch',wallMat:M.plank,door:M.plankDoor});
    addBuilding(-1,-15,{x:-13.6,W:5.1,D:3.4,wallH:2,rise:1,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    for(const [x,z] of [[-12,4],[13,6],[-12,-23],[14,-18]])addPine(x,z,1.1);
    table(-7,9,2.1,.8,.72);book(-7,.82,9,.7,true);
    label('1592년 · 마을에 전해진 소식',-7,2.6,9.2,4.3);
    art.addCart(-10.4,11.6,.2);art.addBundle(-9,10.9,.9);art.addBundle(-9.5,11.7,.75);
    addBasket(-10,0,9.4);addSackFull(-11.2,11.9,.75);
    // A broken fence: one leaning post, a missing rail and a fallen rail on the ground.
    for(let i=0;i<4;i++)L.column.push({x:-11.7+i*.55,y:.46,z:6.2,sy:i===2?.7:.92,sx:.6,sz:.6,rz:i===2?.38:0,c:0x776851});
    wood(-11.4,.66,6.2,1.3,.1,.12,0x6e6150);
    L.deck.push({x:-10.3,y:.05,z:6.75,sx:1.3,sy:.08,sz:.12,ry:.5,c:0x6e6150});
    npc('refugee-helper',-8.6,8.4,'teacher',2.25,'standing','worried');
    // A worn lean-to shelter with a sagging cloth, an almost empty sack and a cold hearth.
    for(const [dx,h] of [[-1.1,1.9],[1.1,1.7]])column(-12.4+dx,h/2,-7.7,h,0x6b5a46,.7);
    for(const [dx,h] of [[-1.1,1.1],[1.1,1]])column(-12.4+dx,h/2,-9.4,h,0x6b5a46,.7);
    const lean=mesh(new THREE.PlaneGeometry(2.6,2,6,4),M.cloth.clone(),-12.4,1.45,-8.5);lean.material.color.set(0x8d8872);lean.material.side=THREE.DoubleSide;lean.rotation.x=-Math.PI/2+.5;
    hangingCloth(-11.1,1.6,-8.5,.6,.9,0x8a8068);
    addSackOpen(-12.8,-6.4,.8,.9);addGrain(-12.75,.02,-6.35,.18);addBasket(-13.3,0,-10.4);
    for(let i=0;i<6;i++){const a=i/6*6.28;mesh(sphereGeo,M.rock,-10.6+Math.cos(a)*.4,.06,-10.6+Math.sin(a)*.4,.14,.08,.12);}
    mesh(sphereGeo,ink,-10.6,.04,-10.6,.3,.03,.3);
    addCollider(-12.4,-8.5,2.8,2.2);
    inspect('war-news','피란길의 기록','전쟁 소식을 전하고 사람들이 안전하게 이동할 수 있도록 도와요.',-7,9,{x:-7,z:10.5});

    // A shore and a supply boat emphasize preparation rather than a firing spectacle.
    plane(water,12,-2.8,6.6,10,.04);addCollider(12,-2.8,6.6,10);
    for(let i=0;i<12;i++)mesh(sphereGeo,M.rock,8.6,.16,2.1-i*.83,.38,.25,.48);
    box(M.plank,10.7,.22,-1.6,3.8,.25,1.45);
    for(const x of [9.3,11.9])for(const z of [-2.1,-1.1])column(x,.35,z,.7,0x665339,1.1);
    const boatGeo=new THREE.CylinderGeometry(1.15,.8,.75,6);
    mesh(boatGeo,M.plank,12,.6,-4.7,1,1,2.35);
    box(M.plank,12,1,-4.7,1.8,.15,4.2);
    for(const x of [11.15,12.85])box(M.woodDark,x,1.27,-4.7,.12,.45,3.7);
    for(let i=0;i<5;i++)wood(12,1.13,-6.2+i*.73,1.8,.07,.1);
    column(12,2,-4.7,2.5,0x756044,.9);
    const sail=mesh(G.plane,M.cloth,12.45,2.25,-4.7,.85,1.6,1);sail.rotation.y=-.2;
    for(const x of [10.7,13.3]){
      const oar=mesh(G.log,M.wood,x,.74,-4.5,2.7,.65,.65);oar.rotation.z=x<12?.15:-.15;
    }
    table(7,-2,2,.8,.7);book(7,.8,-2,.7);
    label('수군의 준비 · 식량과 배',7,2.7,-1.75,3.9);
    for(const [x,z] of [[5.7,-3.8],[6.3,-4],[6.8,-3.7]])addSackFull(x,z,.8);
    toolRack(5.3,-5);addBasket(6.1,0,-5.2);addLogPile(7,-5.2,0);
    npc('naval-supply-worker',5.6,-2.8,'artisan',2.25,'standing','focused');
    inspect('naval','준비와 협력','수군은 배와 식량, 무기를 미리 준비했어요. 배는 구조를 단순화한 학습용 모형이에요.',7,-2,{x:7,z:-.5});

    table(-7,-13,3.1,1,.75);
    for(const [i,x] of [-8,-7,-6].entries()){book(x,.85,-13,.6,true);label(['수군','의병','명군'][i],x,1.75,-13,.9);}
    label('함께 지킨 노력과 전쟁의 피해',-7,2.8,-12.8,4.2);
    addMat(-9.4,-13.4);art.addBundle(-10,-12.4,.75);addBasket(-10.4,0,-14.4);
    bench(-9.2,-16,2);addJarCluster(-12,-18,2);addLogPile(-11.2,-16.7,0);
    
    inspect('cooperation','노력과 피해를 함께','수군과 의병의 활약, 명군의 도움을 살피고 전쟁으로 삶이 무너진 사람들의 기록도 남겨요.',-7,-13,{x:-7,z:-11.5});

    const snow=mat(0xd9e1df);
    for(let i=0;i<19;i++){
      const x=rr(3,15),z=rr(-30,-20.5),m=mesh(new THREE.CircleGeometry(rr(.35,.85),7),snow,x,.065,z,1,1,1);
      m.rotation.x=-Math.PI/2;m.scale.y=rr(.45,.9);m.castShadow=false;
    }
    // Visible snow cover: a soft white ground sheet, drifts against the wall, snow on the wall top and pavilion ridge, bare trees.
    const snowTex=art.canvasTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,20,128,128,128);gr.addColorStop(0,'rgba(236,240,240,.95)');gr.addColorStop(.7,'rgba(236,240,240,.7)');gr.addColorStop(1,'rgba(236,240,240,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
    const snowSheet=new THREE.MeshStandardMaterial({map:snowTex,transparent:true,depthWrite:false,roughness:1});
    for(const [x,z,w,d] of [[9,-25.5,15,11],[4,-22,7,6]]){
      const drift=mesh(new THREE.CircleGeometry(1,40),snowSheet,x,.06,z,w/2,d/2,1);drift.rotation.x=-Math.PI/2;drift.castShadow=false;
    }
    for(let i=0;i<9;i++)mesh(sphereGeo,snow,3.5+i*1.35,.1,-28.6,rr(.5,.8),rr(.16,.3),rr(.4,.6));
    box(snow,8.5,1.95,-29.5,12.2,.1,1);box(snow,8,5.16,-26.4,5.4,.08,.32);
    for(const [x,z] of [[13.5,-21],[4.8,-27.2]]){column(x,1.2,z,2.4,0x5b4e42,.4);for(const [dx,dz,rz] of [[.4,0,.5],[-.35,.1,-.6],[.1,-.3,.2]])L.column.push({x:x+dx,y:2.3,z:z+dz,sy:.9,sx:.2,sz:.2,rz,c:0x5b4e42});}
    box(M.stoneWall,8.5,.95,-29.5,12,1.9,.9);addCollider(8.5,-29.5,12,.9);
    for(let i=0;i<10;i++)box(M.stonePlain,3.1+i*1.2,2.12,-29.5,.7,.45,1);
    pavilion(8,-26.4,6.2,3);
    label('1636~1637년 · 남한산성의 겨울',7.5,2.85,-23.25,5);
    table(7,-23,2.6,1,.76);book(6.45,.86,-23,.7,true);book(7.55,.86,-23,.7,true);
    addSackFull(10.4,-23.8,.8);addSackFull(11,-24,.65);addLogPile(11.2,-24.7,.1);
    for(let i=0;i<3;i++)addBasket(10.1+i*.65,0,-22.1);
    
    inspect('winter','어려움 속의 두 주장','항전과 화친의 근거를 살펴요. 추위와 굶주림 속에서 결국 인조는 청에 항복했어요.',7,-23,{x:7,z:-21.5});
    // Snow is the chapter's visual motif; dated record sites still distinguish the two wars.
    const settled=art.canvasTex(512,768,(g,w,h)=>{
      g.fillStyle='#e5e9e5';g.fillRect(0,0,w,h);
      for(let i=0;i<8000;i++){g.fillStyle=i%2?'rgba(255,255,255,.22)':'rgba(119,141,150,.1)';g.fillRect(rr(0,w),rr(0,h),rr(1,3),rr(1,3));}
      // Compressed snow beside the central walking route and the four approaches.
      g.strokeStyle='rgba(137,132,114,.35)';g.lineWidth=24;g.lineCap='round';
      g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.stroke();
      for(const s of stations){const y=(s.z+1.6+32)/50*h;g.beginPath();g.moveTo(w/2,y);g.lineTo((s.x+17)/34*w,y);g.stroke();}
    });
    const snowGround=plane(new THREE.MeshStandardMaterial({map:settled,roughness:1}),0,-7,34,50,.032);
    snowGround.userData.settledSnow=true;
    const roofSnow=new THREE.MeshStandardMaterial({color:0xe9eeed,roughness:1,transparent:true});
    const roofs=[];scene.traverse(o=>{if(o.userData.roofSurface)roofs.push(o);});
    for(const roof of roofs){
      const cap=new THREE.Mesh(roof.geometry,roofSnow.clone());cap.position.copy(roof.position);cap.position.y+=.085;cap.rotation.copy(roof.rotation);cap.scale.copy(roof.scale);cap.scale.x*=.98;cap.scale.z*=.98;cap.receiveShadow=true;cap.userData.snowCap=true;roof.parent.add(cap);occluders.push(cap);
    }
    for(const side of [-1,1])for(let z=-29;z<18;z+=2.3){
      mesh(sphereGeo,snow,side*16.8,.12,z,rr(.7,1.2),rr(.15,.3),rr(.8,1.4));
      box(snow,side*17.3,1.52,z,.8,.13,2.35);
    }
    // Tapered drifts meet the ground instead of looking like balls laid on a white sheet.
    const bank=(x,z,w,d,h)=>{
      const geo=new THREE.PlaneGeometry(w,d,16,12);geo.rotateX(-Math.PI/2);
      const vertices=geo.attributes.position;
      for(let i=0;i<vertices.count;i++){
        const u=vertices.getX(i)/(w/2),v=vertices.getZ(i)/(d/2);
        const edge=Math.max(0,1-u*u)*Math.max(0,1-v*v);
        vertices.setY(i,.034+h*edge*edge*(1+.16*Math.sin(u*7+z)+.1*Math.cos(v*9+x)));
      }
      geo.computeVertexNormals();const drift=mesh(geo,snow,x,0,z);drift.userData.snowBank=true;
    };
    for(const side of [-1,1])for(let z=-29;z<17;z+=3.1){
      if(stations.some(s=>Math.sign(s.x)===side&&Math.abs(z-(s.z+1.6))<2.5))continue;
      bank(side*2.6+rr(-.12,.12),z,rr(1.7,2.3),rr(3.5,4.2),rr(.24,.48));
    }
    for(const [x,z,w,d] of [[-13.4,10,5.3,3.7],[-13.3,-1,4.6,3.3],[12.9,11,4.2,3.3],[-13.6,-15,5.1,3.4]]){
      for(const end of [-1,1])bank(x,z+end*(w/2+.35),d+1.5,1.7,rr(.45,.68));
      for(const end of [-1,1])bank(x-Math.sign(x)*(d/2+.25),z+end*w*.34,1.7,w*.42,rr(.32,.52));
    }
    const trampled=art.canvasTex(256,1024,(g,w,h)=>{
      g.clearRect(0,0,w,h);
      const edge=g.createLinearGradient(0,0,w,0);
      edge.addColorStop(0,'rgba(236,240,237,0)');edge.addColorStop(.12,'rgba(226,232,229,.86)');edge.addColorStop(.38,'rgba(154,157,146,.37)');edge.addColorStop(.62,'rgba(145,148,137,.4)');edge.addColorStop(.88,'rgba(225,232,230,.86)');edge.addColorStop(1,'rgba(236,240,237,0)');g.fillStyle=edge;g.fillRect(0,0,w,h);
      for(let i=0;i<600;i++){g.fillStyle=i%3?'rgba(132,123,103,.15)':'rgba(238,241,235,.24)';g.beginPath();g.ellipse(rr(25,w-25),rr(0,h),rr(1,5),rr(2,8),rr(-.5,.5),0,Math.PI*2);g.fill();}
      for(let i=0;i<115;i++){
        const x=w*.5+Math.sin(i*.27)*23+(i%2?9:-9)+rr(-7,7),y=i*9;
        g.save();g.translate(x,y);g.rotate(i%2?.12:-.16);g.fillStyle='rgba(100,105,98,.4)';g.beginPath();g.ellipse(0,0,3.8,5.7,0,0,Math.PI*2);g.fill();g.fillRect(-2.6,6,5.2,3);g.restore();
      }
    });
    const packedMaterial=new THREE.MeshStandardMaterial({map:trampled,transparent:true,depthWrite:false,roughness:.88});
    packedMaterial.userData.trampledSnow=true;
    const packed=plane(packedMaterial,0,-7,3.65,49,.078);packed.userData.trampledSnow=true;
    for(const s of stations){const strip=plane(packedMaterial,s.x/2,s.z+1.6,1.7,Math.abs(s.x)+.5,.079);strip.rotation.z=Math.PI/2;}
    // Small deposits sit on existing foliage clusters, leaving the green underneath visible.
    const treeSnow=[];
    for(const [i,p] of [...L.leaf,...L.pine].entries()){
      if(p.y<2.2||i%3!==0||Math.abs(p.x)>24)continue;
      treeSnow.push({x:p.x,y:p.y+(p.sy||1)*.22,z:p.z,sx:(p.sx||.5)*.85,sy:.06+(i%4)*.012,sz:(p.sz||.5)*.75,c:0xe9efec});
    }
    const snowyBranches=art.buildInstanced(sphereGeo,snow,treeSnow,false,true);snowyBranches.userData.treeSnow=true;
  }
  if(chapter===5){
    // Fields, crop beds and a market belong to one late-Joseon village.
    addBuilding(-1,8,{x:-14,W:5.4,D:3.5,wallH:2,rise:1.05,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(1,-1,{x:13.7,W:5.2,D:3.4,wallH:2,rise:1.05,kind:'thatch',wallMat:M.mud,door:M.plankDoor});
    addBuilding(-1,-17,{x:-13.6,W:5.6,D:3.4,wallH:2.1,rise:1.05,kind:'thatch',wallMat:M.plank,door:M.plankDoor});
    addBuilding(1,-26,{x:13.8,W:5.3,D:3.4,wallH:2.25,rise:1.1,door:M.latticeFine});
    garden(10.8,10.4,4.5,3,{tree:true});garden(-8,-25.6,5.2,3.4,{pine:true});
    bench(9.8,12.7);addJarCluster(11.7,7,4);addLogPile(-12.5,2,.1);
    // The transplanting paddy: 6×13 spaced clumps (shared helper) plus the dense nursery corner and a wooden inlet gate.
    paddy(-8.2,5.9,7.1,4.2,{flag:true});
    box(M.woodDark,-11.86,.12,4.5,.42,.12,.38);
    addBasket(-8.2,0,9.2);addMat(-9,9.3);
    label('논의 변화 · 모내기와 일손',-7,2.6,9.3,3.9);
    toolRack(-12,10.8);addBasket(-11.4,0,9);
    inspect('rice','모내기로 달라진 일손','논 한쪽의 빽빽한 못자리에서 어린 모를 길러 넓은 논에 옮겨 심어요. 생산량과 노동의 변화가 있었지만 모든 농가의 사정이 같지는 않았어요.',-7,9,{x:-7,z:10.5});

    for(const [i,x] of [4.8,7.2,9.6].entries()){
      plane(M.mud,x,-5,2,4,.04);addCollider(x,-5,2,4);
      for(let row=0;row<5;row++){
        mesh(sphereGeo,paddySoil,x,.05,-6.6+row*.75,1,.07,.16);
        for(let j=0;j<3;j++){
          const px=x-.6+j*.6,pz=-6.6+row*.75;
          column(px,.25,pz,.5,0x698247,.2);
          L.leaf.push({x:px,y:.3,z:pz,sx:.22,sy:.16,sz:.22,ry:rr(0,3),c:[0x7e9b48,0x6c8c47,0x789056][i]});
        }
      }
      label(['먹을거리','판매할 작물','여러 쓰임'][i],x,1.2,-2.7,1.8);
    }
    table(7,-2,2.2,.8,.72);book(7,.82,-2,.75,true);label('우리 집의 작물 계획',7,2.55,-1.75,3.6);
    for(const x of [10.7,11.4]){addBasket(x,0,-1.7);addSackFull(x,-.8,.75);}
    
    inspect('crops','유래와 쓰임을 구분해요','먹을거리와 팔 작물을 함께 살펴요. 작물이 어디서 왔는지와 어떻게 쓰이는지는 다른 기준이에요.',7,-2,{x:7,z:-.5});

    // Tiled and cloth-covered stalls reuse the existing wood, basket and grain assets.
    for(const [i,x] of [-10,-7,-4].entries()){
      table(x,-13.8,2.2,1.1,.76);
      for(const dx of [-1.2,1.2])column(x+dx,1.3,-14.4,2.6,0x806342,.8);
      const cloth=M.cloth.clone();cloth.color.set([0xa48260,0x81977d,0xa49c70][i]);
      const canopy=mesh(G.plane,cloth,x,2.7,-14.1,2.75,2.1,1);canopy.rotation.x=-Math.PI/2+.1;
      canopy.material.transparent=true;occluders.push(canopy);
      label(['쌀과 곡식','옷감','약초'][i],x,2,-12.95,1.9);
    }
    addBasket(-10,.84,-13.8);art.addGrain(-10,.98,-13.8,1.4);
    for(let i=0;i<3;i++){const fabric=M.cloth.clone();fabric.color.set([0xa3b6b0,0xc0ab86,0x8c9d81][i]);box(fabric,-7,.88+i*.1,-13.8,1.4,.09,.65);}
    for(let i=0;i<4;i++)L.leaf.push({x:-4.6+i*.4,y:.96,z:-13.8,sx:.25,sy:.12,sz:.4,c:0x7b8c58});
    const coinShape=new THREE.Shape();coinShape.absarc(0,0,.13,0,Math.PI*2,false);
    const hole=new THREE.Path();hole.moveTo(-.035,-.035);hole.lineTo(-.035,.035);hole.lineTo(.035,.035);hole.lineTo(.035,-.035);hole.closePath();coinShape.holes.push(hole);
    const coinGeo=new THREE.ExtrudeGeometry(coinShape,{depth:.018,bevelEnabled:false,curveSegments:16});
    for(let i=0;i<5;i++){const coin=mesh(coinGeo,bronze,-6.5+i*.14,.87,-13.3);coin.rotation.x=-Math.PI/2;}
    art.addCart(-10.8,-10.9,.08);addSackFull(-11.6,-12,.9);addJarCluster(-12,-16,3);
    
    
    inspect('trade','장시와 동전','장시를 오가는 보부상이 늘었고 상평통보가 널리 쓰였어요. 거래 수량과 가격은 학습용 약속이에요.',-7,-13,{x:-7,z:-11.5});

    pavilion(7.8,-26.5,6.6,3.2);table(7,-23,2.6,1,.78);
    book(6.4,.88,-23,.8,true);book(7.6,.88,-23,.8,true);
    label('달라진 마을의 명부',7.5,2.85,-23.2,3.9);
    
    addJarCluster(11,-24.2,3);addBasket(11.6,0,-22.5);
    inspect('register','흔들린 신분 질서','재산을 모아 양반 신분을 얻는 사람도 나타났어요. 변화가 곧 모든 차별의 소멸을 뜻하지는 않아요.',7,-23,{x:7,z:-21.5});
  }
  if(chapter===6){
    // A quiet comparison court: different dates and beliefs are not collapsed into one historical meeting.
    addBuilding(-1,9,{x:-13.7,W:6,D:3.5,wallH:2.25,rise:1.1,door:M.latticeFine});
    addBuilding(1,0,{x:13.6,W:5.8,D:3.4,wallH:2.3,rise:1.1,door:M.lattice});
    addBuilding(-1,-15,{x:-13.8,W:5.8,D:3.3,wallH:2.15,rise:1.05,door:M.latticeFine});
    addBuilding(1,-25,{x:13.8,W:5.6,D:3.5,wallH:2.2,rise:1.1,door:M.latticeFine});
    garden(8.2,10,5,3.4,{pine:true});garden(-7.8,-3,4.9,3.3,{tree:true});garden(-8,-25,4.8,3.3,{pine:true});
    bench(7.5,12.6,2.5);bench(-7.6,-.6,2.5);
    for(const [x,z] of [[-11.8,5],[11.8,-8],[-12,-19],[11.3,-28]])addJarCluster(x,z,2);
    table(-7,9,3.3,1.2,.8);
    label('사신의 가방 · 새로운 문물',-7,2.8,9.3,4.2);
    // Telescope, a mechanical clock and a globe are recognizable learning models.
    const telescope=cylinder(bronze,-7.6,1.25,9,.1,.14,1.25,16);telescope.rotation.z=1.15;
    cylinder(ink,-8.14,1.5,9,.09,.09,.025,16).rotation.z=1.15;
    for(const dx of [-.2,.2])column(-7.6+dx,.99,9,.36,0x665238,.3);
    box(M.woodDark,-6.4,1.27,9,.55,.8,.27);
    const face=art.canvasTex(128,128,(g,w,h)=>{
      g.fillStyle='#e9dfbb';g.fillRect(0,0,w,h);g.strokeStyle='#4b453b';g.lineWidth=4;g.beginPath();g.arc(64,64,49,0,7);g.stroke();
      for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.moveTo(64+Math.sin(a)*41,64-Math.cos(a)*41);g.lineTo(64+Math.sin(a)*47,64-Math.cos(a)*47);g.stroke();}
      g.beginPath();g.moveTo(64,29);g.lineTo(64,64);g.lineTo(85,76);g.stroke();
    });
    mesh(G.plane,new THREE.MeshStandardMaterial({map:face}),-6.4,1.28,9.145,.43,.55,1);
    const globeMap=art.canvasTex(256,128,(g,w,h)=>{
      g.fillStyle='#8ca9a5';g.fillRect(0,0,w,h);g.fillStyle='#b9b17e';
      for(const [x,y,rx,ry] of [[65,45,35,25],[110,80,17,30],[170,40,45,20],[215,94,20,12]]){g.beginPath();g.ellipse(x,y,rx,ry,.3,0,7);g.fill();}
      g.strokeStyle='rgba(241,228,180,.5)';g.lineWidth=1;
      for(let i=1;i<8;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.stroke();}
      for(let i=1;i<4;i++){g.beginPath();g.moveTo(0,i*32);g.lineTo(w,i*32);g.stroke();}
    });
    mesh(sphereGeo,new THREE.MeshStandardMaterial({map:globeMap,roughness:.9}),-5.4,1.42,9,.35,.35,.35);
    cylinder(M.wood,-5.4,1.03,9,.18,.25,.28);book(-8.3,.9,9,.5);
    art.addBundle(-9.5,9.5,.9);addBasket(-10,0,8.5);
    
    inspect('imports','새 문물의 쓰임','중국을 오가던 사신 등을 통해 시계·천리경·지도·서적이 전해졌어요. 전시 모형은 실물의 세부를 단순화했어요.',-7,9,{x:-7,z:10.5});

    pavilion(8,-5.2,6.3,3.2);table(7,-2,3,1,.77);
    label('실학 · 생활의 문제를 연구해요',8,2.9,-1.9,4.5);
    for(const [i,x] of [6,7,8].entries())book(x,.87,-2,.65,true,[0x6c8069,0x7c7055,0x657c8e][i]);
    // Survey rope, crop basket and trade samples point to three research fields.
    rope([[5.4,.85,-2.2],[5.7,.85,-1.8],[6,.85,-2.2]],M.woodDark,.018);
    addBasket(10,0,-2.4);addSackFull(10.6,-2.5,.65);
    for(let i=0;i<3;i++)book(10,.12+i*.12,-4.7,.6);
    
    inspect('research','자료와 해결 방법','농업·상공업·우리 역사와 지리 등 실제 문제를 조사하고 백성의 삶을 낫게 할 방법을 연구했어요.',7,-2,{x:7,z:-.5});

    table(-8,-13,2,.95,.75);table(-5.3,-13,2,.95,.75);
    book(-8,.85,-13,.75,true);book(-5.3,.85,-13,.75,true);
    label('받아들인 생각',-8,2.3,-12.6,2.2);label('당시 지배층의 우려',-5.3,2.3,-12.6,2.8);
    bench(-7,-16,3);addMat(-10,-13.6);addBasket(-10.2,0,-14.8);
    
    
    inspect('voices','서로 다른 목소리','천주교를 신앙으로 받아들인 사람들의 생각과 당시 지배층의 우려를 구분해 살펴요.',-7,-13,{x:-7,z:-11.5});

    pavilion(8,-26.5,6.4,3.1,{open:true});table(7,-23,3.1,1,.76);
    book(6.2,.86,-23,.85,true);book(7.8,.86,-23,.85,true);
    label('공통점과 차이를 함께 살펴요',7.7,2.85,-23.1,4.4);
    label('천주교',6.2,1.7,-22.8,1.5);label('동학',7.8,1.7,-22.8,1.5);
    
    inspect('ideas','사람들이 바라던 세상','평등의 생각이라는 공통점과 서로 다른 배경을 함께 살펴요. 두 가르침을 같은 것으로 묶지 않아요.',7,-23,{x:7,z:-21.5});
    for(const [x,z] of [[-10,12],[11,-6],[-11,-17],[11,-27]]){
      cylinder(M.rock,x,.2,z,.28,.33,.4);column(x,1.25,z,2.1,0x6f5842,.7);
      mesh(G.lantern,M.lantern,x,2.25,z,1.15,1.35,1.15);addCollider(x,z,.6,.6);
    }
  }
  if(chapter===7){
    // A late-Joseon culture courtyard, not a reconstruction of a named venue.
    garden(8,9,5,3.2,{tree:true});garden(-8,-3.5,5,3.2,{pine:true});garden(-8,-25,5,3.2,{tree:true});
    for(const [side,z] of [[-1,5],[1,-12],[-1,-20]])addBuilding(side,z,{x:side*15,W:5.4,D:3.6,wallH:2.2,rise:1.1,door:M.lattice});
    table(-7,9,3.6,1.2,.75);book(-7.8,.86,9,.9,true);book(-6.2,.86,9,.9,true);
    label('한글 소설 · 함께 읽는 이야기',-7,2.8,9.2,4.2);addBasket(-10,0,8);toolRack(-11,6);
    
    inspect('novels','함께 읽는 한글 소설','한글 소설이 널리 읽히면서 사람들은 이야기 속 인물과 사회의 모습을 함께 생각했어요.',-7,9,{x:-7,z:10.5});
    pavilion(8,-5.3,6.4,3.2,{open:true});table(7,-2,3.5,1,.75);
    for(let i=0;i<3;i++){const x=5.9+i*1.1;book(x,.86,-2,.8,true);cylinder(M.woodDark,x+.3,1,-2,.035,.035,.5,8);}
    label('풍속화 · 그림 속 하루',8,2.9,-1.9,4);addJarCluster(11,-4,3);
    pictureScroll('assets/chapter-media/v2-painting-hd.jpg',9,1.9,-4.9,1.65,1.86,[141,56,1716,1934]);
    label('김홍도 · 벼타작 / 국립중앙박물관',9,.72,-4.85,2.8);
    
    inspect('genre-painting','풍속화의 생활 단서','사람의 행동과 도구, 관계를 살펴요. 그림만으로 이름이나 신분을 단정하지 않아요.',7,-2,{x:7,z:-.5});
    addMat(-7,-15);addMat(-9,-15);addMat(-5,-15);bench(-10,-13.3,2);bench(-4.5,-15.8,2);
    table(-7,-13,3.3,1,.75);book(-7.7,.86,-13,.8,true);book(-6.3,.86,-13,.8,true);
    label('민화 · 장수와 복을 바라는 마음',-7,2.9,-13.7,4.4);
    for(let i=0;i<3;i++)pictureScroll('assets/chapter-media/v2-folk.webp',-8.8+i*1.8,1.6,-15.3,1.05,2.1,[i*512,0,512,1024]);
    inspect('folk-wishes','그림에 담은 바람','민화에는 장수·복·배움을 바라는 마음이 담기기도 했어요. 그림의 소재와 뜻을 함께 살펴요.',-7,-13,{x:-7,z:-11.5});
    const drum=cylinder(M.wood,10.8,.65,-24,.52,.52,.7,20);drum.rotation.z=Math.PI/2;
    for(const dx of [-.36,.36])cylinder(paper,10.8+dx,.65,-24,.5,.5,.025,20).rotation.z=Math.PI/2;
    wood(10.8,.21,-24,1.5,.2,.65);addMat(11,-25);
    pavilion(8,-26.2,6.4,3,{open:true});addMat(7,-23);
    // Mask rack: four code-drawn 2.5D masks hang facing the yard, each named.
    const maskTex=kind=>art.canvasTex(128,160,(g,w,h)=>{g.clearRect(0,0,w,h);drawMask(g,64,78,52,kind);});
    for(const dx of [-1.5,1.5])column(7.5+dx,1.25,-23.9,2.5,0x6b563d,.7);
    wood(7.5,2.45,-23.9,3.4,.08,.1,0x5e4a35);
    for(const [i,kind] of maskKinds.entries()){
      const x=6.3+i*.8,m=mesh(G.plane,new THREE.MeshStandardMaterial({map:maskTex(kind),transparent:true,alphaTest:.2,side:THREE.DoubleSide,roughness:.9}),x,1.85,-23.85,.56,.7,1);m.castShadow=false;
      rope([[x,2.42,-23.9],[x,2.2,-23.85]],M.woodDark,.01);
      label(maskNames[kind],x,1.3,-23.8,.75);
    }
    label('판소리와 탈놀이 · 함께 여는 공연',8,2.9,-22.9,4.4);
    
    inspect('mask-story','탈놀이 속 이야기','웃음과 풍자를 통해 당시 사회의 모순을 드러내기도 했어요. 모든 탈놀이가 같은 내용인 것은 아니에요.',7,-23,{x:7,z:-21.5});
  }
  if(chapter===8){
    // v16: an open-port era street. Hanok shops and low brick offices share one avenue and one cross
    // street; the mix is interpretive and these introductions did not all arrive in the same year.
    garden(8,11.5,4.6,3,{tree:true});garden(-8,-4.5,4.6,3,{pine:true});garden(-8,-25,4.6,3,{tree:true});
    const shop=(side,z,sign)=>{addBuilding(side,z,{x:side*13.4,W:5,D:3.4,wallH:2.2,rise:1.1,door:M.lattice});const s=label(sign,side*11.58,2.45,z,1.1);s.rotation.y=side<0?Math.PI/2:-Math.PI/2;};
    shop(-1,9.5,'책방');shop(-1,-9,'약방');shop(1,-18,'주막');
    table(-7,9,3.4,1,.75);book(-7.8,.86,9,.9,true);book(-6.2,.86,9,.9,true);
    label('1876년 · 강화도 조약',-7,2.9,9.2,3.8);
    inspect('treaty','개항의 과정과 조건','일본의 무력 압박 속에서 강화도 조약을 맺었어요. 조약의 불평등한 내용과 이후 변화를 구분해 살펴요.',-7,9,{x:-7,z:10.5});
    // A modest brick school frontage beside retained hanok, rather than a modern skyline.
    const brick=art.canvasTex(128,128,(g,w,h)=>{g.fillStyle='#a77558';g.fillRect(0,0,w,h);g.strokeStyle='#cbbba4';g.lineWidth=3;for(let y=0;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let x=(y/24%2)*24;x<w;x+=48){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+24);g.stroke();}}},{repeat:true});brick.repeat.set(8,6);
    const brickMat=new THREE.MeshStandardMaterial({map:brick,roughness:1});
    const glass=mat(0x8aaba9),iron=mat(0x3f4440);
    const newBuilding=(x,z,w,d,h,sign)=>{
      if(sign)label(sign,x,h-.2,z+d/2+.07,Math.min(2.6,w*.5));
      const group=new THREE.Group();group.position.set(x,0,z);group.userData.periodBrickBuilding=true;scene.add(group);
      const walls=box(brickMat,0,h/2+.2,0,w,h,d,group);walls.material=brickMat.clone();walls.material.transparent=true;occluders.push(walls);
      box(M.stonePlinth,0,.16,0,w+.35,.32,d+.35,group);
      const roof=mesh(art.makeRoofGeometry(w,d,.8,.28,0,0),M.tile.clone(),0,h+.2,0,1,1,1,group);roof.material.transparent=true;occluders.push(roof);
      box(M.ridge,0,h+1.04,0,w+.55,.12,.2,group);
      box(paper,0,h+.18,d/2+.03,w+.2,.18,.16,group);
      for(const dx of [-w*.31,w*.31]){
        box(paper,dx,h*.58,d/2+.025,1.22,1.54,.1,group);
        box(glass,dx,h*.58,d/2+.09,.98,1.3,.035,group);
        box(M.woodDark,dx,h*.58,d/2+.13,.06,1.35,.05,group);
        box(M.woodDark,dx,h*.58,d/2+.13,1.03,.06,.05,group);
        box(M.stonePlinth,dx,h*.58-.8,d/2+.11,1.32,.12,.22,group);
      }
      box(M.plankDoor,0,1.05,d/2+.04,1.05,1.8,.1,group);
      box(M.stonePlinth,0,.2,d/2+.35,1.5,.22,.7,group);
      addCollider(x,z,w+.35,d+.4);return group;
    };
    // Four brick fronts: school, telegraph office, newspaper press and a general store, each signed.
    newBuilding(9,-6.5,6,2.5,3.2,'새 학교');
    newBuilding(-13,1,4.4,3.4,3.3,'전신국');
    newBuilding(-13,-19,4.6,3.4,3.5,'신문 인쇄소');
    newBuilding(13,10,4.3,3.4,3.3,'잡화점');hangingCloth(13,2.55,11.95,2.2,.6,0x8e6b5a);
    addBuilding(1,-27.5,{x:14.6,W:4.5,D:3,wallH:2.1,rise:1,door:M.lattice});
    // A paved cross street joins the avenue to the pharmacy lane and the tram stop; wider slabs flank the spawn.
    const street=[];
    for(let x=-10.3;x<=11.3;x+=1.05)for(const dz of [-.56,.56])street.push({x:x+rr(-.04,.04),y:.04,z:-8.6+dz+rr(-.03,.03),sx:.98,sy:.06,sz:1.05,c:0xb3aa98});
    for(const x of [-3.4,3.4])for(let z=12.3;z<=17;z+=1.12)street.push({x,y:.036,z,sx:.98,sy:.06,sz:1.05,c:0xbfb5a0});
    art.buildInstanced(G.box,M.rock,street,false,true);
    // Street lamps on iron posts line the avenue away from every station lane.
    const lamp=(x,z)=>{cylinder(M.rock,x,.14,z,.26,.3,.28,10);column(x,1.7,z,3.1,0x3f4440,.3);box(iron,x,3.28,z,.46,.08,.46);mesh(G.lantern,M.lantern,x,3.05,z,.9,1.2,.9);addCollider(x,z,.5,.5);};
    for(const z of [13.5,5,-5,-15.5,-25])for(const side of [-1,1])lamp(side*2.95,z);
    bench(-4.3,2,2);bench(4.3,-17,2);art.addCart(5.6,-9.9,.15);
    // Notice board by the spawn: printed sheets beside hand-written ones.
    for(const dx of [-.8,.8])column(-4.2+dx,.95,13,1.9,0x6b563d,.5);box(M.plank,-4.2,1.2,13,1.6,1.1,.08);
    for(const [dx,dy,w] of [[-.45,1.25,.5],[.15,1.1,.4],[.5,1.35,.35]])box(paper,-4.2+dx,dy,13.06,w,.55,.02);
    addCollider(-4.2,13,1.7,.3);label('벽보 · 새 소식',-4.2,2.05,13.05,1.6);
    table(-11.5,-7.4,1.6,.7,.7);for(let i=0;i<3;i++)book(-11.9+i*.4,.81,-7.4,.3,false);
    addBasket(11.6,0,7.2);addJarCluster(11.9,6.1,3);
    for(const [x,z] of [[-12,-22],[11.4,6.6],[-12,-3]]){
      box(M.woodDark,x,.4,z,.8,.8,.7);box(M.plank,x,.84,z,.86,.09,.76);
      for(let i=0;i<3;i++)wood(x-.28+i*.28,.43,z+.36,.04,.68,.04);
    }
    table(7,-2,3.3,1,.75);book(7,.86,-2,.9,true);label('옛 모습 곁에 생긴 새 학교',8,2.9,-1.9,4.1);
    npc('new-school-reader',9,-4,'teacher',2.25,'standing','thoughtful');
    inspect('new-school','함께 남은 옛 모습과 새 모습','개항 뒤 새 문물이 들어왔지만 한옥과 한복, 이전의 생활도 함께 남아 있었어요. 변화는 한날에 일어나지 않았어요.',7,-2,{x:7,z:-.5});
    table(-7,-13,3.6,1,.75);box(M.woodDark,-8,1,-13,.75,.25,.5);cylinder(bronze,-8,1.2,-13,.06,.06,.25);wood(-8,1.32,-13,.65,.08,.1);
    box(M.woodDark,-6.2,1.16,-13,.55,.7,.3);cylinder(ink,-6.2,1.65,-13,.22,.08,.3,16);label('전신은 소식 · 전화는 목소리',-7,2.9,-12.9,4.4);
    
    inspect('communication','전신과 전화','전신은 글로 된 소식을, 전화는 목소리를 전하는 데 쓰였어요. 전시된 모양은 이해를 돕는 학습 모형이에요.',-7,-13,{x:-7,z:-11.5});
    // A stationary early tram at the east kerb, with a stop platform at the end of the cross street.
    for(let z=-13.5;z<3.5;z+=.65)box(M.woodDark,14.6,.025,z,1.65,.04,.12);
    for(const x of [14,15.2])wood(x,.06,-5,.055,.05,17.5,0x504f49);
    wood(14.6,4.05,-5,.025,.025,18.5,0x45433c);
    for(const z of [1.5,-5,-12])wood(15.6,4.05,z,2.1,.06,.06,0x655b49);
    const trolleyPole=box(iron,14.6,3.2,-10.4,.045,1.7,.045);trolleyPole.rotation.x=-.35;
    for(const x of [13.85,15.35])for(const z of [-11.2,-8.8]){const wheel=cylinder(ink,x,.28,z,.25,.25,.13,12);wheel.rotation.z=Math.PI/2;}
    box(mat(0x896042),14.6,1.3,-10,1.8,2,4);box(mat(0x455c54),14.6,2.4,-10,2.1,.22,4.3);
    for(const z of [-11.2,-10,-8.8])box(paper,13.68,1.7,z,.025,.75,.85);
    addCollider(14.6,-10,2.2,4.5);
    box(M.stonePlinth,12.9,.11,-9.2,1.4,.22,2.2);addCollider(12.9,-9.2,1.4,2.2);label('전차 정거장',12.9,1.75,-8,1.5);
    // Telegraph poles carry one wire along the east wall, behind the tram.
    for(const z of [1.5,-5,-12,-22]){column(16.6,2.1,z,4.2,0x655b49,.6);wood(16.6,4.2,z,1.2,.08,.08);}
    wood(16.6,4.25,-10,.03,.03,25,0x45433c);
    pavilion(8,-26.3,6.4,3,{open:true});table(7,-23,3.6,1,.75);for(let i=0;i<4;i++)book(5.8+i*.8,.86,-23,.6,true);
    label('옛 기록과 새 기록을 함께',8,2.9,-22.9,4.1);
    inspect('last-record','이어지는 여덟 권의 기록','새 문물이 들어온 사실과 사람들의 생활이 어떻게 달라졌는지를 함께 기록해요.',7,-23,{x:7,z:-21.5});
  }


  if(chapter>=7){
    // Scuffed walking lines, dropped straw and pebbles stay flat and nonblocking.
    const scuffTexture=art.canvasTex(128,128,(g,w,h)=>{
      g.clearRect(0,0,w,h);g.fillStyle='rgba(94,70,43,.13)';
      for(let i=0;i<46;i++){g.beginPath();g.ellipse(rr(8,120),rr(8,120),rr(3,10),rr(1,4),rr(0,3),0,Math.PI*2);g.fill();}
      g.strokeStyle='rgba(229,213,164,.3)';g.lineWidth=1;
      for(let i=0;i<60;i++){const x=rr(0,128),y=rr(0,128);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(2,9),y+rr(-3,3));g.stroke();}
    });
    const scuffMat=new THREE.MeshStandardMaterial({map:scuffTexture,transparent:true,depthWrite:false,roughness:1});
    for(const [i,p] of stations.entries()){
      plane(scuffMat,p.x,p.z+2.3,6,3.8,.075);
      plane(scuffMat,p.x*.55,p.z+1.5,4.5,2.2,.077);
      const side=p.x<0?-1:1,x=p.x+side*3.2,z=p.z-.3;
      addJarCluster(x,z,2);addBasket(x-side*.65,0,z+.5);art.addBundle(x,z-1,.55,.3);
      for(let k=0;k<5;k++)mesh(sphereGeo,M.rock,x+rr(-.9,.9),.04,z+1+rr(-.2,.5),rr(.035,.09),.025,rr(.035,.08));
      // A short cloth hangs from a stock rack, below all place captions.
      hangingCloth(x,z<0?1.95:1.8,z-.7,.85,.65,[0xa29875,0x8e9d90,0xb29a7f,0x999b89][i]);
      for(const dx of [-.46,.46])column(x+dx,.92,z-.7,1.84,0x786447,.38);
    }
    if(chapter===7){
      // Rolled picture paper, inkstone and covered goods beside the painter.
      table(10.5,-4,1.25,.7,.62);box(ink,10.3,.72,-4,.32,.045,.22);
      for(let i=0;i<3;i++){const scroll=cylinder(paper,10.5+i*.13,.76,-4.05,.06,.06,.6,10);scroll.rotation.x=Math.PI/2;}
      addMat(-10,-15.5,.2);addMat(-4.7,-14.5,-.2);
      hangingCloth(9.9,2.5,-25.1,.7,1.2,0x9b745d);
    }else{
      // Delivery parcels and printed sheets retain the scale of a working street.
      table(-10.2,-14.8,1.4,.8,.62);for(let i=0;i<4;i++)book(-10.2,.72+i*.07,-14.8,.6,false,0x928369);
      addJarCluster(12.4,-22.6,2);art.addBundle(-10,7.5,.75,-.2);
      hangingCloth(9.9,2.7,-5.1,.7,1,0x8a9689);
    }
  }
  // An unmistakable exit court; the host adds the active time-gate interaction here.
  plane(M.stonePlinth,exit.x,exit.z,4.8,3,.055);
  for(const side of [-1,1]){
    cylinder(M.rock,side*2.5,.4,exit.z,.38,.48,.8,10);
    cylinder(M.wood,side*2.5,1.8,exit.z,.14,.18,2.3,10);
    mesh(G.lantern,M.lantern,side*2.5,2.9,exit.z,1.3,1.6,1.3);
    addCollider(side*2.5,exit.z,.8,.8);
  }
  label(chapter===8?'모은 기록을 펼치고 돌아가요':'기록을 모아 다음 여행으로',0,4.45,exit.z-.5,4.2);
  // Fine ground details sit outside the primary travel lanes and never block controls.
  for(let i=0;i<90;i++){const side=i%2?1:-1;addGrass(side*rr(12.5,bounds.maxX-1),rr(bounds.minZ+2,bounds.maxZ-2),rr(.7,1));}
  for(let z=bounds.minZ+3;z<bounds.maxZ-2;z+=.55){
    if(stations.some(p=>Math.abs(z-p.z-1.5)<2.3)||Math.abs(z-exit.z)<2)continue;
    for(const side of [-1,1])if(rr(0,1)>.3)addGrass(side*rr(2.3,2.65),z,rr(.35,.65));
  }
  art.finish();
  // Batch repeated static props after their group transforms are final.
  scene.updateMatrixWorld(true);
  const batches=new Map(),moving=new Set([...occluders,...animated.map(a=>a.mesh),...clothMotion.map(a=>a.mesh)]);
  scene.traverse(m=>{
    if(!m.isMesh||m.isInstancedMesh||moving.has(m)||Array.isArray(m.material))return;
    const key=`${m.geometry.uuid}:${m.material.uuid}:${m.castShadow}:${m.receiveShadow}`;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push(m);
  });
  for(const list of batches.values())if(list.length>2){
    const first=list[0],batch=new THREE.InstancedMesh(first.geometry,first.material,list.length);
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    for(let i=0;i<list.length;i++){batch.setMatrixAt(i,list[i].matrixWorld);list[i].removeFromParent();}
    batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();scene.add(batch);
  }
  const ambient=createAtmosphere(THREE,scene,M,chapter);
  return {
    chapter,spawn,exit,bounds,colliders,occluders,stations,stationNames,inspectables,npcExtras,
    npc:{...stations[0]},clueMaterials:{cloth:M.cloth,wood:M.wood},
    update(t,reducedOverride){const reduced=reducedOverride??globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;ambient.update(t,reduced);if(reduced)t=0;
      for(const f of clothMotion){const pos=f.mesh.geometry.attributes.position;
        for(let i=0;i<pos.count;i++){const k=-f.rest[i*3+1]/f.h;pos.array[i*3+2]=reduced?0:Math.sin(t*1.2+f.phase+k*2.4)*.065*k;}
        pos.needsUpdate=true;
      }
      for(const a of animated)a.mesh.rotation[a.axis]=a.base+Math.sin(t*.22)*a.amount;},
  };
}
