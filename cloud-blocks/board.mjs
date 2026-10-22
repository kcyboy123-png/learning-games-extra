import * as T from './lib/three.module.min.js';
const themes=[{sky:0xeaf6ef,leaf:0x82b99c,cube:0xeab884},{sky:0xeaf3df,leaf:0x7da56d,cube:0x9cbba1},{sky:0xe9edf9,leaf:0x9c9ab9,cube:0xb4a5cf},{sky:0xf2eafa,leaf:0xb8a1c4,cube:0xdfb36d}];
export function bevel(w,h,d,r=.06){
 r=Math.min(r,w/2,h/2,d/2);
 const g=new T.BoxGeometry(w,h,d,4,4,4),a=g.attributes.position,v=new T.Vector3(),c=new T.Vector3();
 for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);c.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));v.sub(c).normalize().multiplyScalar(r).add(c);a.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;
}
// Concatenates already world-transformed geometries that share one material (the bundled Three has no BufferGeometryUtils).
export function merge(geometries){
 let vertices=0,indices=0;for(const g of geometries){vertices+=g.attributes.position.count;indices+=g.index?g.index.count:g.attributes.position.count;}
 const position=new Float32Array(vertices*3),normal=new Float32Array(vertices*3),uv=new Float32Array(vertices*2),index=new (vertices>65535?Uint32Array:Uint16Array)(indices);
 let v=0,i=0;
 for(const g of geometries){const p=g.attributes.position,count=p.count,x=g.index,total=x?x.count:count;
  position.set(p.array.subarray(0,count*3),v*3);normal.set(g.attributes.normal.array.subarray(0,count*3),v*3);if(g.attributes.uv)uv.set(g.attributes.uv.array.subarray(0,count*2),v*2);
  for(let k=0;k<total;k++)index[i+k]=(x?x.array[k]:k)+v;v+=count;i+=total;}
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(position,3));out.setAttribute('normal',new T.BufferAttribute(normal,3));out.setAttribute('uv',new T.BufferAttribute(uv,2));out.setIndex(new T.BufferAttribute(index,1));return out;
}
function wood(){const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#5c4031';x.fillRect(0,0,512,256);for(let i=0;i<170;i++){x.strokeStyle=`rgba(25,13,7,${.04+(i%5)*.025})`;x.beginPath();for(let j=0;j<=512;j+=8){const y=i*1.6+Math.sin(j*.016+i)*1.5;x.lineTo(j,y);}x.stroke();}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export class Board{
 constructor(el,onEdit,mini=false){this.el=el;this.onEdit=onEdit;this.mini=mini;this.yaw=.68;this.pitch=.66;this.zoom=1;
 try{this.renderer=new T.WebGLRenderer({antialias:true,alpha:true});}catch{el.innerHTML='<p class="no3d">이 기기에서는 3D를 표시할 수 없어요.<br>아래 칸 조작판으로 계속 풀 수 있어요.</p>';return;}
 this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=!mini;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;el.append(this.renderer.domElement);
 this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(38,1,.1,100);this.scene.add(new T.HemisphereLight(0xdcecf0,0x423028,1.35));const sun=new T.DirectionalLight(0xffdfaa,3.4);sun.position.set(-4,9,5);sun.castShadow=!mini;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8});sun.shadow.bias=-.001;this.scene.add(sun);const fill=new T.DirectionalLight(0x9ecddd,1.2);fill.position.set(5,4,-5);this.scene.add(fill);this.group=new T.Group();this.scene.add(this.group);this.ray=new T.Raycaster();this.targets=[];
 const c=this.renderer.domElement;c.setAttribute('aria-label','입체 작업판. 누르면 블록을 바꾸고 드래그하면 회전합니다.');
 if(!mini){c.style.touchAction='none';c.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(this.drag){this.drag.moved=true;return;}cancelAnimationFrame(this.animation);c.setPointerCapture(e.pointerId);this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};});c.addEventListener('pointermove',e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>(e.pointerType==='touch'?12:6))d.moved=true;if(d.moved){this.yaw-=(e.clientX-d.lastX)*.008;this.pitch=Math.max(.25,Math.min(1.25,this.pitch+(e.clientY-d.lastY)*.006));this.draw();}d.lastX=e.clientX;d.lastY=e.clientY;});c.addEventListener('pointerup',e=>{const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;if(d.moved)return;const r=c.getBoundingClientRect();this.ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);const hit=this.ray.intersectObjects(this.targets)[0];if(hit)this.onEdit?.(hit.object.userData.cell);});const cancel=e=>{if(this.drag?.id===e.pointerId)this.drag=null;};c.addEventListener('pointercancel',cancel);c.addEventListener('lostpointercapture',cancel);}
 this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(el);
 }
 mesh(geo,color,pos,group=this.group){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.78}));m.position.set(...pos);m.castShadow=!this.mini;m.receiveShadow=true;group.add(m);return m;}
 set(q,h,zone=0,won=false){cancelAnimationFrame(this.animation);if(!this.renderer)return;this.q=q;this.h=h;this.won=won;this.targets=[];this.group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});this.group.clear();const n=q.size,theme=themes[zone];this.scene.background=null;
 const base=this.mesh(bevel(n+.76,.38,n+.76,.12),0xffffff,[0,-.25,0]);base.material.map=wood();
 const brass=this.mesh(bevel(n+.85,.055,n+.85,.07),0xbd9657,[0,-.09,0]);brass.material.metalness=.62;brass.material.roughness=.32;
 this.mesh(bevel(n+.6,.045,n+.6,.05),0x253c37,[0,-.052,0]);
 for(const x of [-1,1])for(const z of [-1,1]){const pin=this.mesh(new T.CylinderGeometry(.045,.045,.018,12),0xd8b574,[x*(n/2+.24),-.017,z*(n/2+.24)]);pin.material.metalness=.65;}

 for(let i=0;i<n*n;i++){const x=(i%n-(n-1)/2),z=(Math.floor(i/n)-(n-1)/2),locked=q.fixed?.[i]!=null;
 const tile=this.mesh(bevel(.94,.07,.94,.025),q.balance?(i%n<n/2?0xf4dcb4:0xc9dfee):0xf8f1df,[x,-.035,z]);tile.userData.cell=i;this.targets.push(tile);
 for(let k=0;k<h[i];k++){const col=locked?0x7e8994:([0xbcd6cd,0xb5c8a5,0xaaaecf,0xe3c38c][zone]);const cube=this.mesh(bevel(.92,.94,.92,.055),col,[x,k+.49,z]);cube.material.roughness=.28;cube.material.metalness=.08;cube.userData.cell=i;this.targets.push(cube);}

 if(q.ghost&&h[i]<q.reference[i]){const g=this.mesh(new T.BoxGeometry(.86,.86,.86),0xffd47f,[x,.5,z]);g.castShadow=false;g.material.transparent=true;g.material.opacity=.25;}
 
 }
 if(won)this.castle(q,h,zone);
 const label=(text,color,pos,rotation=0)=>{const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,256,96);ctx.fillStyle='#fff';ctx.font='bold 52px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,50);const tx=new T.CanvasTexture(canvas);const m=new T.Mesh(new T.PlaneGeometry(1.35,.5),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide,toneMapped:false}));m.position.set(...pos);m.rotation.x=-Math.PI/2;m.rotation.z=rotation;this.group.add(m);};
 label('앞','#a5664c',[0,.015,n/2+.28]);label('오른쪽','#447b91',[n/2+.28,.015,0],Math.PI/2);
 if(!this.mini){
 const plinth=this.mesh(new T.CylinderGeometry(n*.86,n*.9,.18,80),0x203c38,[0,-.59,0]);plinth.material.roughness=.48;
 const ring=this.mesh(new T.TorusGeometry(n*.88,.018,6,100),0xc2a06a,[0,-.485,0]);ring.rotation.x=Math.PI/2;ring.material.metalness=.6;
 for(let i=0;i<48;i++){const a=i*Math.PI/24,r=n*.86;const tick=this.mesh(new T.BoxGeometry(.012,.006,i%4===0?.13:.055),0xa88752,[Math.sin(a)*r,-.483,Math.cos(a)*r]);tick.rotation.y=a;}
 const floor=this.mesh(new T.PlaneGeometry(200,200),0x203c38,[0,-.7,0]);floor.rotation.x=-Math.PI/2;floor.material=new T.ShadowMaterial({opacity:.22});
 }this.draw();}
 castle(q,h,zone=0){
 const n=q.size,stone=0xf4e6cc,trim=0xcab68e,roof=[0x427a78,0x426b60,0x575d88,0x447b87][zone],gold=0xd6ae59;
 // Decorative masonry never changes the solved block layout or hit targets. Ornaments are modelled in a scratch group,
 // then merged per tower and material so the finished castle costs a few draw calls per column instead of one per piece.
 const build=new T.Group(),materials=new Map(),parts=[];let cell=-1;
 const material=(color,extra)=>{const key=`${color}|${extra?JSON.stringify(extra):''}`;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.78,...extra}));return [key,materials.get(key)];};
 const part=(geo,color,pos,parent=build,extra)=>{const [key,mat]=material(color,extra),m=new T.Mesh(geo,mat);m.position.set(...pos);m.userData.batch=`${cell}|${key}`;parent.add(m);parts.push(m);return m;};
 const box=(w,y,d,c,p,parent)=>part(new T.BoxGeometry(w,y,d),c,p,parent);
 const arch=(width,height,color,pos,parent)=>{const r=width/2,shape=new T.Shape();shape.moveTo(-r,0);shape.lineTo(r,0);shape.lineTo(r,height-r);shape.absarc(0,height-r,r,0,Math.PI,false);shape.lineTo(-r,0);return part(new T.ShapeGeometry(shape,12),color,pos,parent);};
 const occupied=(x,z)=>x>=0&&z>=0&&x<n&&z<n?h[z*n+x]:0;
 const front=Math.max(...h.map((v,i)=>v?Math.floor(i/n):-1));
 const gate=h.map((v,i)=>({v,i})).filter(o=>o.v&&Math.floor(o.i/n)===front).sort((a,b)=>Math.abs(a.i%n-(n-1)/2)-Math.abs(b.i%n-(n-1)/2))[0]?.i;
 for(let i=0;i<h.length;i++){
  const height=h[i];if(!height)continue;cell=i;const col=i%n,row=Math.floor(i/n),x=col-(n-1)/2,z=row-(n-1)/2;
  for(const [dx,dz,angle] of [[0,1,0],[1,0,Math.PI/2],[0,-1,Math.PI],[-1,0,-Math.PI/2]]){
   const neighbor=occupied(col+dx,row+dz),face=new T.Group();face.position.set(x,0,z);face.rotation.y=angle;build.add(face);
   const add=(w,y,d,c,p)=>box(w,y,d,c,p,face);
   for(let k=neighbor;k<height;k++){
    add(.925,.94,.025,stone,[0,k+.49,.472]);
    add(.94,.055,.045,trim,[0,k+.055,.48]);
    for(let course=1;course<4;course++){
     add(.91,.012,.01,trim,[0,k+course*.235,.488]);
     for(const sx of (course%2?[-.3,.3]:[0]))add(.012,.22,.01,trim,[sx,k+course*.235-.112,.489]);
    }
    const door=i===gate&&dz===1&&k===0,w=door?.43:.23,wh=door?.78:.48;
    arch(w+.09,wh+.07,trim,[0,k+.12,.501],face);
    arch(w,wh,door?0x4f3c30:0x284952,[0,k+.14,.508],face);
    if(door){for(const sx of [-.13,0,.13])add(.014,.57,.016,gold,[sx,.43,.519]);add(.4,.025,.02,gold,[0,.38,.523]);}
    else{add(.019,.37,.018,gold,[0,k+.35,.522]);add(.23,.018,.018,gold,[0,k+.34,.522]);}
   }
  }
  box(.99,.09,.99,trim,[x,height+.015,z]);
  const peak=height>=Math.max(occupied(col-1,row),occupied(col+1,row),occupied(col,row-1),occupied(col,row+1));
  if(peak){
   part(new T.CylinderGeometry(.43,.46,.23,12),stone,[x,height+.15,z]);
   for(let layer=0;layer<4;layer++){
    const r=.64-layer*.115,cap=part(new T.ConeGeometry(r,.40,8),roof,[x,height+.37+layer*.17,z],build,{roughness:.38,metalness:.18});cap.rotation.y=Math.PI/8;
   }
   part(new T.SphereGeometry(.055,8,6),gold,[x,height+1.1,z]);
   part(new T.CylinderGeometry(.012,.012,.29,6),gold,[x,height+1.23,z]);
   const flag=new T.Shape();flag.moveTo(0,0);flag.lineTo(.26,-.07);flag.lineTo(0,-.14);part(new T.ShapeGeometry(flag),zone===3?0x872f43:0xe4ba69,[x,height+1.37,z],build,{side:T.DoubleSide});
  }else{
   for(const [dx,dz] of [[0,1],[1,0],[0,-1],[-1,0]])if(occupied(col+dx,row+dz)<height){
    box(dx?.08:.96,.16,dz?.08:.96,stone,[x+dx*.44,height+.12,z+dz*.44]);
    for(const t of [-.35,0,.35])box(.16,.19,.16,stone,[x+dx*.44+(dz?t:0),height+.28,z+dz*.44+(dx?t:0)]);
   }
  }
 }
 build.updateMatrixWorld(true);
 const batches=new Map();
 for(const m of parts){if(!m.geometry.attributes.normal)m.geometry.computeVertexNormals();m.geometry.applyMatrix4(m.matrixWorld);const b=batches.get(m.userData.batch)??batches.set(m.userData.batch,{material:m.material,geometries:[]}).get(m.userData.batch);b.geometries.push(m.geometry);}
 for(const {material,geometries} of batches.values()){const merged=new T.Mesh(merge(geometries),material);merged.castShadow=!this.mini;merged.receiveShadow=true;this.group.add(merged);for(const g of geometries)g.dispose();}
 }
 draw(){if(!this.renderer||!this.q)return;const w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,true);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();const distance=(this.q.size*1.35+this.q.max*1.0+3)*this.zoom*.88*(this.won?1.18:1)*Math.max(1,.9/this.camera.aspect),target=new T.Vector3(0,this.q.max*.32+(this.won?.4:0),0);this.camera.position.set(Math.sin(this.yaw)*Math.cos(this.pitch)*distance,target.y+Math.sin(this.pitch)*distance,Math.cos(this.yaw)*Math.cos(this.pitch)*distance);this.camera.lookAt(target);this.renderer.render(this.scene,this.camera);}
 attach(el){this.el=el;if(this.renderer){el.append(this.renderer.domElement);this.resize.disconnect();this.resize.observe(el);}else el.innerHTML='<p class="no3d">3D 표시를 지원하지 않는 기기예요.<br>아래 칸 조작판으로 계속 풀 수 있어요.</p>';}
 reveal(){if(!this.renderer||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const start=performance.now();const tick=now=>{const t=Math.min(1,(now-start)/1400),k=t*t*(3-2*t);this.yaw=1.7-1.02*k;this.pitch=.86-.2*k;this.zoom=1.2-.2*k;this.draw();if(t<1)this.animation=requestAnimationFrame(tick);};this.animation=requestAnimationFrame(tick);}
 home(){cancelAnimationFrame(this.animation);this.yaw=.68;this.pitch=.66;this.zoom=1;this.draw();}
 dispose(){cancelAnimationFrame(this.animation);this.resize?.disconnect();this.group?.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});this.renderer?.dispose();this.renderer?.forceContextLoss();}
}
