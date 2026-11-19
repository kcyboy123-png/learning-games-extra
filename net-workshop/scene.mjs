import * as THREE from './vendor/three.module.js';
import {poses,corners,foldAngles,findFoldSequence} from './geometry.mjs';
export const COLORS=['#f3e9d8','#f3e9d8','#f3e9d8','#f3e9d8','#f3e9d8','#f3e9d8'];
export const SELECTED_COLOR='#f6c58c';

export function createScene(host){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{
    host.innerHTML='<p class="webgl-error">이 기기에서 3D를 열지 못했어요.<br>펼친 종이에서 문제를 계속 풀 수 있어요.<br><button class="secondary" data-action="choose-again">펼친 종이로 돌아가기</button></p>';
    return {setBusy(){},setDirect(){return false;},setSequence(){},setNet(){},update(){},rotate(){},reset(){},zoom(){},transparent(){},lookAtFace(){}};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.append(renderer.domElement);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.23;
  renderer.domElement.setAttribute('aria-label','접힌 상자 관찰 화면. 아래 보기 버튼으로 방향을 바꿀 수 있어요.');
  renderer.domElement.setAttribute('role','img');
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,4,-4,.1,200);
  const group=new THREE.Group();scene.add(group);
  scene.add(new THREE.HemisphereLight(0xfff6e7,0x77727b,1.65));
  const light=new THREE.DirectionalLight(0xfff5e5,3.3);light.position.set(-5,8,3);light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.00015;light.shadow.normalBias=.012;light.shadow.radius=4;
  scene.add(light);scene.add(light.target);
  const fill=new THREE.DirectionalLight(0xeaf0ff,.7);fill.position.set(6,2,-5);scene.add(fill);
  const paperFill=new THREE.DirectionalLight(0xfff4df,1.3);paperFill.position.set(-2,3,8);scene.add(paperFill);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const shadowContext=shadowCanvas.getContext('2d'),gradient=shadowContext.createRadialGradient(64,64,4,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.48)');gradient.addColorStop(.45,'rgba(0,0,0,.22)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  shadowContext.fillStyle=gradient;shadowContext.fillRect(0,0,128,128);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  floor.rotation.x=-Math.PI/2;scene.add(floor);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShadowMaterial({opacity:.025,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.receiveShadow=true;scene.add(contact);
  const paperCanvas=document.createElement('canvas');paperCanvas.width=paperCanvas.height=512;
  const paperContext=paperCanvas.getContext('2d'),pixels=paperContext.createImageData(512,512);let grain=17;
  for(let i=0;i<pixels.data.length;i+=4){grain=(1664525*grain+1013904223)>>>0;const value=243+(grain%13);pixels.data.set([value,value,value,255],i);}
  paperContext.putImageData(pixels,0,0);
  const paperLight=paperContext.createLinearGradient(0,0,512,512);paperLight.addColorStop(0,'#fffdf7');paperLight.addColorStop(1,'#eee5d7');paperContext.globalCompositeOperation='multiply';paperContext.fillStyle=paperLight;paperContext.fillRect(0,0,512,512);
  const paperTexture=new THREE.CanvasTexture(paperCanvas);paperTexture.colorSpace=THREE.SRGBColorSpace;paperTexture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  let direct=null,busy=false;
  let net,meshes=[],labels=[],backLabels=[],faceText=[],lines=[],markers=[],sequence=[],progress=0,yaw=-.88,pitch=.48,zoom=1,ghost=false,selected=null;
  const labelTexture=(text,badge=null,fixed=false)=>{
    const cv=document.createElement('canvas');cv.width=cv.height=512;const ctx=cv.getContext('2d');ctx.scale(4,4);
    if(badge){ctx.beginPath();ctx.arc(64,64,57,0,Math.PI*2);ctx.fillStyle=badge==='target'?'#303236':'#e6bf87';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#fff1db';ctx.stroke();}
    ctx.fillStyle=badge==='target'?'#fff1db':'#292724';ctx.font=`700 ${Math.min(badge?64:84,112/[...text].length)}px SUIT,"Malgun Gothic",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    if(!badge&&ghost){ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='#f2eee7';ctx.strokeText(text,64,65);}
    ctx.fillText(text,64,65);
    if(fixed){ctx.font='600 16px SUIT,"Malgun Gothic",sans-serif';ctx.fillText('고정',64,112);}
    const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
  };
  function clear(){
    group.traverse(o=>{o.geometry?.dispose();if(o.material){if(o.material.map!==paperTexture)o.material.map?.dispose();o.material.dispose();}});group.clear();meshes=[];labels=[];backLabels=[];lines=[];markers=[];
  }
  function setNet(next,faceLabels=['가','나','다','라','마','바']){
    clear();net=next;faceText=faceLabels;if(!net?.connected){renderer.render(scene,camera);return;}
    sequence=findFoldSequence(net)??net.links.map((_,i)=>i);
    const reach=Math.max(...net.dimensions)*3;
    Object.assign(light.shadow.camera,{left:-reach,right:reach,top:reach,bottom:-reach,near:.1,far:100});
    light.shadow.camera.updateProjectionMatrix();
    net.faces.forEach((f,i)=>{
      // The paper thickness is visual only; the shared geometry still controls all hinges and answers.
      const thickness=Math.min(...net.dimensions)*.008,bevel=thickness*.65,outline=new THREE.Shape();
      outline.moveTo(-f.w/2+bevel,-f.h/2+bevel);outline.lineTo(f.w/2-bevel,-f.h/2+bevel);outline.lineTo(f.w/2-bevel,f.h/2-bevel);outline.lineTo(-f.w/2+bevel,f.h/2-bevel);outline.closePath();
      const geo=new THREE.ExtrudeGeometry(outline,{depth:thickness,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,steps:1});geo.translate(0,0,-thickness/2);
      const uv=geo.attributes.uv,position=geo.attributes.position;for(let j=0;j<uv.count;j++)uv.setXY(j,position.getX(j)/f.w+.5,position.getY(j)/f.h+.5);
      const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:net.monochrome?0xe9e7e1:COLORS[i],map:paperTexture,bumpMap:paperTexture,bumpScale:Math.min(...net.dimensions)*.0015,roughness:.78,metalness:0,transparent:true,opacity:1}));
      mesh.castShadow=true;mesh.receiveShadow=true;
      const hinge=net.links.find(link=>link.child===i);
      if(hinge){
        const ends=hinge.dx?[[-hinge.dx*f.w/2,-f.h/2],[-hinge.dx*f.w/2,f.h/2]]:[[-f.w/2,-hinge.dy*f.h/2],[f.w/2,-hinge.dy*f.h/2]];
        const offset=Math.min(...net.dimensions)*.014;
        const crease=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([offset,-offset].flatMap(z=>ends.map(([x,y])=>new THREE.Vector3(x,y,z)))),new THREE.LineDashedMaterial({color:0x86735b,dashSize:Math.min(f.w,f.h)*.045,gapSize:Math.min(f.w,f.h)*.035,transparent:true,opacity:.6}));
        crease.computeLineDistances();mesh.add(crease);
      }
      group.add(mesh);meshes.push(mesh);
      const perimeter=[[-f.w/2,-f.h/2,0],[f.w/2,-f.h/2,0],[f.w/2,f.h/2,0],[-f.w/2,f.h/2,0]].map(p=>new THREE.Vector3(...p));
      const edge=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(perimeter),new THREE.LineBasicMaterial({color:0xa29a8d,transparent:true,opacity:.18}));group.add(edge);lines.push(edge);
      const sprite=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:labelTexture(faceLabels[i],null,!!direct&&i===net.root),depthTest:true,transparent:true,side:THREE.FrontSide}));
      const size=Math.min(f.w,f.h)*.76;sprite.scale.set(size,size,1);sprite.renderOrder=3;group.add(sprite);labels.push(sprite);
      const back=new THREE.Mesh(sprite.geometry.clone(),sprite.material.clone());back.scale.copy(sprite.scale);back.renderOrder=3;group.add(back);backLabels.push(back);
    });
    update(0,null,[]);
  }
  function update(value,chosen=selected,markItems=[]){
    progress=value;selected=chosen;if(!net?.connected)return;
    const frames=poses(net,foldAngles(net,value,sequence));
    const matrix=new THREE.Matrix4(),vector=a=>new THREE.Vector3(...a);
    frames.forEach((p,i)=>{
      matrix.makeBasis(vector(p.u),vector(p.v),vector(p.n));meshes[i].quaternion.setFromRotationMatrix(matrix);meshes[i].position.set(...p.c);
      const targetFace=markItems.some(m=>m.kind==='face'&&m.face===i&&m.target);
      meshes[i].material.color.set(i===chosen?SELECTED_COLOR:targetFace?0xdce8ed:net.monochrome?0xe9e7e1:COLORS[i]);
      lines[i].material.color.set(i===chosen?0xe3b778:ghost?0xe5dac8:0x8a8276);lines[i].material.opacity=direct?.48:ghost?.72:.18;
      meshes[i].material.opacity=ghost?.27:1;meshes[i].material.depthWrite=!ghost;lines[i].material.depthTest=!ghost;
      meshes[i].children.forEach(crease=>{crease.visible=!ghost&&value<.999;});
      lines[i].position.copy(meshes[i].position);lines[i].quaternion.copy(meshes[i].quaternion);
      labels[i].position.set(...p.c.map((v,k)=>v+p.n[k]*Math.min(...net.dimensions)*.012));
      labels[i].quaternion.copy(meshes[i].quaternion);
      backLabels[i].visible=!!direct;backLabels[i].position.set(...p.c.map((v,k)=>v-p.n[k]*Math.min(...net.dimensions)*.012));
      backLabels[i].quaternion.copy(meshes[i].quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI));
    });
    markers.forEach(o=>{group.remove(o);o.geometry?.dispose();o.material.map?.dispose();o.material.dispose();});markers=[];
    for(const m of markItems){
      if(!net.faces[m.face])continue;const pts=corners(net.faces[m.face],frames[m.face]);
      const color=m.target?(ghost?0xfff0d7:0x303236):0xd9a05b;
      if(m.kind==='edge'){
        const a=vector(pts[m.corner]),b=vector(pts[(m.corner+1)%4]),direction=b.clone().sub(a),radius=Math.min(...net.dimensions)*.018;
        const edge=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,direction.length(),10),new THREE.MeshBasicMaterial({color,depthTest:!ghost,depthWrite:false}));
        edge.position.copy(a).add(b).multiplyScalar(.5);edge.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());edge.userData.target=m.target;edge.renderOrder=5;group.add(edge);markers.push(edge);
      }
      if(m.kind==='face'){
        const f=net.faces[m.face],p=frames[m.face],inset=.07,offset=Math.min(...net.dimensions)*.016;
        const ring=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>vector(p.c.map((v,k)=>v+p.u[k]*x*f.w*(.5-inset)+p.v[k]*y*f.h*(.5-inset)+p.n[k]*offset)));
        for(let j=0;j<4;j++){const a=ring[j],b=ring[(j+1)%4],d=b.clone().sub(a);const outline=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(f.w,f.h)*.009,Math.min(f.w,f.h)*.009,d.length(),8),new THREE.MeshBasicMaterial({color:m.target?0x345a6c:0xb77b2c,transparent:true,depthTest:!ghost,depthWrite:false}));outline.position.copy(a).add(b).multiplyScalar(.5);outline.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());outline.userData.faceBorder=true;outline.userData.target=m.target;outline.renderOrder=5;group.add(outline);markers.push(outline);}continue;
      }
      const point=m.kind==='edge'?pts[m.corner].map((v,i)=>(v+pts[(m.corner+1)%4][i])/2):pts[m.corner];
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTexture(m.text,m.target?'target':'choice'),depthTest:!ghost,transparent:true}));
      const size=Math.min(...net.dimensions)*.31;sprite.scale.set(size,size,1);sprite.position.set(...point);sprite.renderOrder=6;group.add(sprite);markers.push(sprite);
    }
    render();
  }
  function render(){
    if(!host.clientWidth||!host.clientHeight)return;
    if(!net?.connected){renderer.render(scene,camera);return;}
    const frames=poses(net,foldAngles(net,progress,sequence));
    const points=net.faces.flatMap((f,i)=>corners(f,frames[i]).map(p=>new THREE.Vector3(...p).applyEuler(group.rotation)));
    const box=new THREE.Box3().setFromPoints(points);
    let center=box.getCenter(new THREE.Vector3());
    const flat=direct?new THREE.Box3().setFromPoints(net.faces.flatMap((f,i)=>corners(f,poses(net,net.links.map(()=>0))[i]).map(p=>new THREE.Vector3(...p)))):null;
    if(flat)center=flat.getCenter(new THREE.Vector3());
    const aspect=host.clientWidth/Math.max(host.clientHeight,1);
    floor.position.y=box.min.y-Math.min(...net.dimensions)*.02;
    floor.position.x=center.x;floor.position.z=center.z;const floorSize=box.getSize(new THREE.Vector3());
    floor.scale.set(Math.max(floorSize.x*1.7,.5),Math.max(floorSize.z*1.7,.5),1);
    contact.position.copy(floor.position);contact.position.y+=Math.min(...net.dimensions)*.002;contact.scale.set(Math.max(...net.dimensions)*8,Math.max(...net.dimensions)*8,1);
    floor.visible=contact.visible=!ghost&&!direct;light.target.position.copy(center);
    const turn=direct?Math.min(1,progress*net.links.length):0,viewYaw=direct?-.55*turn+yaw+.88:yaw,viewPitch=direct?.42*turn+pitch-.48:pitch;
    camera.position.set(center.x+18*Math.sin(viewYaw)*Math.cos(viewPitch),center.y+18*Math.sin(viewPitch),center.z+18*Math.cos(viewYaw)*Math.cos(viewPitch));camera.lookAt(center);camera.updateMatrixWorld();
    const viewPoints=points.map(p=>p.clone().applyMatrix4(camera.matrixWorldInverse));
    const projectedExtent=Math.max(...viewPoints.map(p=>Math.max(Math.abs(p.x)/aspect,Math.abs(p.y))));
    const extent=flat?Math.max(Math.max(flat.getSize(new THREE.Vector3()).x/aspect,flat.getSize(new THREE.Vector3()).y)*.62/zoom,projectedExtent*1.1):projectedExtent*Math.max(1.1,1.14/zoom);
    camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  }
  const resize=new ResizeObserver(()=>{renderer.setSize(Math.max(1,host.clientWidth),Math.max(1,host.clientHeight));render();});resize.observe(host);
  let drag=null,dragStart=null,dragMoved=false,dragPointer=null,dragFace=-1;
  function pickFace(e){
    const rect=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
    // Decorative crease lines must never intercept a face tap.
    const hit=ray.intersectObjects(meshes,false)[0];return hit?meshes.indexOf(hit.object):-1;
  }
  renderer.domElement.addEventListener('pointerdown',e=>{
    if(dragPointer!==null||!e.isPrimary||e.button!==0){drag=null;dragPointer=null;return;}
    dragFace=direct&&!busy?pickFace(e):-1;dragPointer=e.pointerId;dragStart=[e.clientX,e.clientY];dragMoved=false;drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==dragPointer)return;
    if(Math.hypot(e.clientX-dragStart[0],e.clientY-dragStart[1])>10)dragMoved=true;
    if(!dragMoved)return;
    yaw-=(e.clientX-drag[0])*.008;pitch=Math.max(-1.2,Math.min(1.4,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];render();
  });
  renderer.domElement.addEventListener('pointerup',e=>{
    if(e.pointerId!==dragPointer)return;
    if(direct&&!busy&&dragFace>=0&&drag&&!dragMoved&&Math.hypot(e.clientX-dragStart[0],e.clientY-dragStart[1])<=10){
      if(pickFace(e)===dragFace)direct(dragFace);
    }drag=null;dragPointer=null;
  });
  for(const event of ['pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,e=>{if(e.pointerId===dragPointer){drag=null;dragPointer=null;}});
  function lookAtFace(face){const normal=poses(net,foldAngles(net,progress,sequence))[face]?.n;if(!normal)return;yaw=Math.atan2(normal[0],normal[2])+.22;pitch=Math.max(-1.2,Math.min(1.2,Math.asin(Math.max(-1,Math.min(1,normal[1])))+.22));zoom=1;render();}
  function refreshLabels(){meshes.forEach(mesh=>mesh.children.forEach(crease=>{crease.visible=!ghost&&progress<.999;}));labels.forEach((label,i)=>{label.material.map.dispose();label.material.map=labelTexture(faceText[i],null,!!direct&&i===net.root);backLabels[i].material.map=label.material.map;});render();}
  document.fonts.ready.then(refreshLabels);
  return {setBusy:value=>{busy=value;},setDirect:callback=>{direct=callback;renderer.domElement.setAttribute('aria-label',callback?'면을 누르면 접히는 종이. 아래 면 이름 버튼으로도 접거나 펼칠 수 있어요.':'접힌 상자 관찰 화면. 아래 보기 버튼으로 방향을 바꿀 수 있어요.');renderer.domElement.style.cursor=callback?'pointer':'';render();return true;},setSequence:value=>{sequence=value.slice();},setNet,update,lookAtFace,rotate:(direction)=>{yaw+=direction*.5;render();},reset:()=>{yaw=-.88;pitch=.48;zoom=1;render();},zoom:delta=>{zoom=Math.max(.65,Math.min(1.14/1.1,zoom+delta));render();return zoom;},transparent:value=>{ghost=value;meshes.forEach(m=>{m.material.opacity=value?.27:1;m.material.depthWrite=!value;});lines.forEach((m,i)=>{m.material.depthTest=!value;m.material.opacity=value?.72:.18;m.material.color.set(i===selected?0xe3b778:value?0xe5dac8:0x8a8276);});markers.forEach(m=>{m.material.depthTest=!value;if(m.isMesh&&!m.userData.faceBorder)m.material.color.set(m.userData.target?(value?0xfff0d7:0x303236):0xd9a05b);});refreshLabels();}};
}
