import * as T from './vendor/three.module.js';
import {geometry,axes,poseAxes,sampleFlight,windAt,RAD} from './physics.mjs';
import {studioDetails} from './scenery.mjs';
import {gardenTrees,lawn,oak,artStatus,distantLandscape} from './art-assets.mjs';
import {createVenues,workshopPrize,schoolArchitecture} from './venues.mjs';
const color={paper:0xfffdf6,ink:0x4d483f,blue:0x208dcc};
function material(c,extra={}){return new T.MeshStandardMaterial({color:c,roughness:.85,envMapIntensity:.22,...extra});}
function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(parent,w,h,d,x,y,z,c){return mesh(new T.BoxGeometry(w,h,d),material(c),parent,x,y,z);}
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
const paperTexture=()=>canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#fffdf5';c.fillRect(0,0,w,h);let seed=427;for(let i=0;i<11000;i++){seed=seed*16807%2147483647;const x=seed%w;seed=seed*16807%2147483647;const y=seed%h;c.strokeStyle=i%3?'#8477560b':'#ffffff70';c.lineWidth=.45;c.beginPath();c.moveTo(x,y);c.lineTo(x+2+seed%5,y+.6);c.stroke();}});
function textSprite(text,fg='#475657',bg=null){
  const texture=canvasTexture(512,160,c=>{if(bg){c.fillStyle=bg;c.beginPath();c.roundRect(2,2,508,156,32);c.fill();}c.fillStyle=fg;c.font='bold 82px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,80);});
  const s=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));s.scale.set(2.4,.75,1);return s;
}
export class FlightScene {
  constructor(host,onFail){
    this.host=host;this.onFail=onFail;this.mode='workshop';this.viewRotation=.18;this.artStatus=artStatus;
    this.artChanged=()=>{this.needsDraw=true;this.windowDirty=true;};
    this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.04;
    this.renderer.domElement.setAttribute('aria-label','설계와 비행을 보여 주는 3차원 화면');this.renderer.domElement.setAttribute('role','img');
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onFail('3D 화면 연결이 끊겼어요. 기록은 보관했어요. 새로고침해 주세요.');});
    host.append(this.renderer.domElement);this.camera=new T.PerspectiveCamera(42,1,.015,250);
    this.workshop=this.makeWorkshop();this.world=this.makeWorld();this.world.scale.x=-1;this.plane=new T.Group();this.workshop.add(this.plane);
    this.windowTarget=new T.WebGLRenderTarget(1536,576);this.windowScreen.material.map=this.windowTarget.texture;this.paper=paperTexture();this.resize=new ResizeObserver(()=>this.resizeToHost());this.resize.observe(host);this.resizeToHost();this.makeReflections();
  }
  makeReflections(){
    const environment=new T.Scene();environment.background=new T.Color(0xb8d0de);
    const room=new T.Mesh(new T.BoxGeometry(12,10,12),new T.MeshBasicMaterial({color:0xd2c5ac,side:T.BackSide}));environment.add(room);
    for(const [x,y,z,w,h,c] of [[-5,2,0,3,6,0xfffff4],[4,3,-5,5,4,0xdceeff],[0,4.9,0,6,4,0xffffff]]){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.lookAt(0,0,0);environment.add(m);}
    const pmrem=new T.PMREMGenerator(this.renderer);this.reflection=pmrem.fromScene(environment,.08);this.workshop.environment=this.world.environment=this.reflection.texture;pmrem.dispose();environment.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  }
  light(scene,world=false){
    const hemisphere=new T.HemisphereLight(0xe4f3ff,0x77785d,.88);scene.add(hemisphere);
    const sun=new T.DirectionalLight(0xffefd2,2.05);sun.position.set(world?-12:-.6,world?25:1.2,world?-8:.2);sun.castShadow=true;
    const e=world?35:.8;Object.assign(sun.shadow.camera,{left:-e,right:e,top:e,bottom:-e,near:.01,far:world?100:5});sun.shadow.mapSize.set(world?3072:2048,world?3072:2048);sun.shadow.radius=2;sun.shadow.normalBias=world?.012:.0006;sun.shadow.bias=-.00002;scene.add(sun);
    const fill=new T.DirectionalLight(0xbfdff5,.6);fill.position.set(3,5,6);scene.add(fill);if(world)this.venueLights={sun,fill,hemisphere};
  }
  makeWorkshop(){
    const s=new T.Scene();s.background=new T.Color(0xeee9dd);this.light(s);
    const woodMaterial=oak(this.artChanged,[2.5,1.6]);
    const desk=mesh(new T.BoxGeometry(1.7,.035,1.3),woodMaterial,s,0,-.078,0);
    box(s,1.8,.7,.025,0,.27,-.67,0xe8e5dc);
    box(s,.95,.36,.015,-.1,.20,-.649,0xdce9e6);this.windowScreen=mesh(new T.PlaneGeometry(.95,.36),new T.MeshBasicMaterial({color:0xffffff}),s,-.1,.20,-.638);
    for(const x of [-.585,.385])box(s,.018,.40,.035,x,.20,-.63,0xf8f6ed);
    box(s,.99,.018,.035,-.1,.20,-.62,0xf8f6ed);
    box(s,1,.025,.09,-.1,.01,-.61,0xf3eee2);
    box(s,.22,.018,.29,-.38,-.047,-.31,0x6c8e95);box(s,.20,.012,.27,-.38,-.032,-.31,0xf3eee1);
    const cup=mesh(new T.CylinderGeometry(.036,.031,.09,24),material(0xd6c9af),s,.26,-.015,-.4);
    for(let i=0;i<4;i++){const pencil=box(s,.006,.17,.006,.245+i*.01,.06,-.4,0xb59765);pencil.rotation.z=(i-1.5)*.10;}
    const ruler=box(s,.025,.002,.30,.27,-.057,.12,0xeedfc3);
    const ticks=canvasTexture(96,1024,(c,w,h)=>{c.fillStyle='#dfca9f';c.fillRect(0,0,w,h);c.strokeStyle='#8d7752';for(let i=0;i<=60;i++){c.beginPath();c.moveTo(0,i*h/60);c.lineTo(i%5===0?45:24,i*h/60);c.stroke();}c.fillStyle='#6c5942';c.font='24px sans-serif';for(let i=1;i<12;i++)c.fillText(String(i),53,i*h/12+8);});
    const rulerTop=mesh(new T.PlaneGeometry(.025,.30),material(0xffffff,{map:ticks}),s,.27,-.0558,.12);rulerTop.rotation.x=-Math.PI/2;
    studioDetails(s,this.artChanged);workshopPrize(s);
    const contactMap=canvasTexture(256,256,c=>{const g=c.createRadialGradient(128,128,15,128,128,124);g.addColorStop(0,'rgba(32,45,30,.24)');g.addColorStop(.5,'rgba(32,45,30,.10)');g.addColorStop(1,'rgba(32,45,30,0)');c.fillStyle=g;c.fillRect(0,0,256,256);});
    this.paperContact=mesh(new T.PlaneGeometry(.20,.32),new T.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false}),s,0,-.0561,0);this.paperContact.rotation.x=-Math.PI/2;this.paperContact.castShadow=false;return s;
  }
  makeWorld(){
    const s=new T.Scene();s.background=new T.Color(0xc5e0e8);s.fog=new T.Fog(0xc5e0e8,60,150);this.light(s,true);
    const ground=mesh(new T.PlaneGeometry(200,200),material(0x80966a),s,0,-.006,30);ground.rotation.x=-Math.PI/2;
    this.fieldSurface=new T.Group();s.add(this.fieldSurface);lawn(this.fieldSurface,this.artChanged);
    for(let z=-4;z<70;z+=5){const stripe=mesh(new T.PlaneGeometry(25,2.5),material(0xffffff,{transparent:true,opacity:.035,depthWrite:false}),this.fieldSurface,0,.004,z);stripe.rotation.x=-Math.PI/2;}
    for(const x of [-3.5,3.5]){const sideline=mesh(new T.PlaneGeometry(.055,44),material(0xf1ead7),this.fieldSurface,x,.008,18);sideline.rotation.x=-Math.PI/2;}
    box(s,3,.04,85,-14,0,27,0xdccfb7);box(s,3,.04,85,14,0,27,0xdccfb7);
    this.schoolBuilding=new T.Group();schoolArchitecture(this.schoolBuilding);s.add(this.schoolBuilding);this.parkSurroundings=new T.Group();s.add(this.parkSurroundings);gardenTrees(this.parkSurroundings,this.artChanged);this.landscape=new T.Group();s.add(this.landscape);distantLandscape(this.landscape,this.artChanged);this.venues=createVenues(this.artChanged);for(const venue of Object.values(this.venues))s.add(venue);
    for(const side of [-1,1])for(const z of [6,18,30]){
      box(s,1.8,.11,.55,side*12.5,.5,z,0xab8154);box(s,1.8,.45,.09,side*12.5,.82,z+.26,0xb78f60);
      for(const x of [-.65,.65])box(s,.07,.5,.43,side*12.5+x,.25,z,0x5c625b);
    }
    const line=mesh(new T.PlaneGeometry(4,.06),material(0xfaf8ec),s,0,.007,-.25);line.rotation.x=-Math.PI/2;
    this.distanceGuide=new T.Group();s.add(this.distanceGuide);
    for(const z of [5,10,15,20,25,30]){
      const mark=mesh(new T.PlaneGeometry(6,.045),material(0xf0e8d2,{transparent:true,opacity:.32}),this.distanceGuide,0,.015,z);mark.rotation.x=-Math.PI/2;mark.castShadow=false;
      const map=canvasTexture(512,192,c=>{c.fillStyle='#f8f3df';c.font='bold 104px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(z+' m',256,96);});
      const label=mesh(new T.PlaneGeometry(1.5,.56),material(0xffffff,{map,transparent:true,depthWrite:false}),this.distanceGuide,-4.35,.018,z);label.rotation.x=-Math.PI/2;label.scale.x=-1;label.castShadow=false;
    }
    this.landingMark=new T.Group();const ring=mesh(new T.RingGeometry(.16,.22,32),material(0xf7b45b,{side:T.DoubleSide,transparent:true,depthWrite:false}),this.landingMark);ring.rotation.x=-Math.PI/2;
    this.landingLabel=textSprite('착륙','#665132','#fff9ed');this.landingLabel.material.sizeAttenuation=false;this.landingMark.add(this.landingLabel);this.landingMark.visible=false;s.add(this.landingMark);
    this.windSock=new T.Group();mesh(new T.CylinderGeometry(.025,.025,3.6,8),material(0xece9dd),this.windSock,0,1.8,0);
    this.sock=new T.Group();this.sock.position.y=3.4;this.windSock.add(this.sock);
    for(let i=0;i<5;i++){const part=mesh(new T.CylinderGeometry(.18-i*.018,.16-i*.018,.18,12,1,true),material(i%2?0xf8f2e3:0xd28e59,{side:T.DoubleSide}),this.sock,0,-i*.015,i*.17+.09);part.rotation.x=Math.PI/2;}
    this.windSock.position.set(-4,0,3);s.add(this.windSock);return s;
  }
  setVenue(id){
    if(this.venue===id)return;this.venue=id;for(const [key,g] of Object.entries(this.venues))g.visible=key===id;this.schoolBuilding.visible=id==='school';this.parkSurroundings.visible=id!=='world';this.landscape.visible=id==='school';this.fieldSurface.visible=id==='school';this.world.background.set(id==='world'?0xaacbdc:0xc5e0e8);
    const {sun,fill,hemisphere}=this.venueLights;
    sun.color.set(id==='world'?0xd6e9ff:id==='city'?0xffc294:0xffefd2);sun.intensity=id==='world'?1.1:id==='city'?1.8:2.05;hemisphere.intensity=id==='world'?.7:.88;
    sun.position.set(id==='city'?44:-12,id==='city'?16:25,id==='city'?80:-8);fill.color.set(id==='city'?0xb6c5ed:0xbfdff5);hemisphere.groundColor.set(id==='city'?0x8a7770:0x77785d);
    this.world.fog.color.set(id==='world'?0x142840:id==='city'?0xc7a0a1:0xc5e0e8);this.world.fog.near=id==='school'?60:85;this.world.fog.far=id==='school'?150:240;
    this.windowDirty=true;this.needsDraw=true;
  }
  renderWindow(){
    if(!this.windowTarget)return;const camera=new T.PerspectiveCamera(48,.95/.36,.1,200);camera.position.set(-2,5,12);camera.lookAt(0,4,43);const old=this.renderer.getRenderTarget(),visible=this.plane.visible;this.plane.visible=false;this.renderer.setRenderTarget(this.windowTarget);this.renderer.render(this.world,camera);this.renderer.setRenderTarget(old);this.plane.visible=visible;this.windowDirty=false;
  }
  setDesign(d,selected=''){
    const g=geometry(d);this.g=g;
    this.plane.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});this.plane.clear();
    for(const panel of g.panels){const points=panel.points.map(p=>[p[0],p[1],p[2]-g.cgZ]),positions=[];for(let i=1;i<points.length-1;i++)positions.push(...points[0],...points[i],...points[i+1]);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));const uv=[];for(let i=0;i<positions.length;i+=3)uv.push(positions[i]/.21+.5,positions[i+2]/.297+.5);geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
      const shades=[];for(let i=0;i<positions.length;i+=3){const shade=.87+.13*Math.min(1,Math.abs(positions[i])/.024);shades.push(shade,shade,shade*.995);}geo.setAttribute('color',new T.Float32BufferAttribute(shades,3));
      mesh(geo,material(panel.kind===selected?0xc7e5df:color.paper,{side:T.DoubleSide,vertexColors:true,map:this.paper,bumpMap:this.paper,bumpScale:.000018,roughness:.91}),this.plane).receiveShadow=true;
      const edgePositions=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];edgePositions.push(...a,...b,b[0],b[1]-.00018,b[2],...a,b[0],b[1]-.00018,b[2],a[0],a[1]-.00018,a[2]);}const edgeGeo=new T.BufferGeometry();edgeGeo.setAttribute('position',new T.Float32BufferAttribute(edgePositions,3));edgeGeo.computeVertexNormals();mesh(edgeGeo,material(0xc6bfae,{side:T.DoubleSide}),this.plane);
      if(panel.kind==='wing'){
        const nose=points.reduce((a,b)=>a[2]>b[2]?a:b),aft=points.reduce((a,b)=>a[2]<b[2]?a:b);
        const outside=points.reduce((a,b)=>Math.abs(a[0])>Math.abs(b[0])?a:b),root=points.filter(p=>Math.abs(p[0])<.006).sort((a,b)=>a[2]-b[2])[0]??aft;
        const seam=[root[0]+(outside[0]-root[0])*.48,root[1]+(outside[1]-root[1])*.48,root[2]+(outside[2]-root[2])*.48];
        const layer=new T.BufferGeometry();layer.setAttribute('position',new T.Float32BufferAttribute([nose[0],nose[1]+.0003,nose[2],root[0],root[1]+.0003,root[2],seam[0],seam[1]+.0003,seam[2]],3));layer.setAttribute('color',new T.Float32BufferAttribute([.99,.985,.965,.90,.89,.85,.97,.96,.93],3));layer.computeVertexNormals();mesh(layer,material(0xffffff,{side:T.DoubleSide,vertexColors:true,roughness:.91}),this.plane);
        for(let k=0;k<3;k++){const ridge=[nose,seam].map(p=>new T.Vector3(p[0],p[1]+.00036+k*.00004,p[2]+k*.00032));this.plane.add(new T.Line(new T.BufferGeometry().setFromPoints(ridge),new T.LineBasicMaterial({color:k===0?0xb1a990:0xfffcef,transparent:true,opacity:k===0?.45:.75})));}
      }
      const line=new T.Line(new T.BufferGeometry().setFromPoints(points.concat([points[0]]).map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color:panel.kind===selected?0x197d88:0xa49d87,transparent:true,opacity:panel.kind===selected?1:.28}));this.plane.add(line);
    }
    const keel=[0,0,g.nose-g.cgZ,0,0,g.tail-g.cgZ,0,-g.d.fold/100,g.tail+.01-g.cgZ,0,0,g.nose-g.cgZ,0,-g.d.fold/100,g.tail+.01-g.cgZ,0,-g.d.fold/100,g.nose-.025-g.cgZ];const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(keel,3));geo.computeVertexNormals();mesh(geo,material(0xf2ecde,{side:T.DoubleSide}),this.plane);
    for(const side of [-1,1]){const fold=new T.BufferGeometry();fold.setAttribute('position',new T.Float32BufferAttribute([side*.002,.00011,g.nose-g.cgZ,side*.004,.00022,g.tail+.008-g.cgZ,0,-g.d.fold/100,g.tail+.01-g.cgZ,side*.002,.00011,g.nose-g.cgZ,0,-g.d.fold/100,g.tail+.01-g.cgZ,0,-g.d.fold/100,g.nose-.025-g.cgZ],3));fold.computeVertexNormals();mesh(fold,material(side<0?0xe5dfd0:0xf4efe2,{side:T.DoubleSide}),this.plane);}
    for(let ci=0;ci<g.d.clipCount;ci++){
      const clipX=g.d.clipCount===2?(ci===0?-.008:.008):0,wire=[[.0015,-.008],[.0015,.008]],arc=(cx,cz,r,start,end)=>{for(let i=1;i<=16;i++){const a=start+(end-start)*i/16;wire.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}};
      arc(-.001,.008,.0025,0,Math.PI);wire.push([-.0035,-.009]);arc(.001,-.009,.0045,Math.PI,2*Math.PI);wire.push([.0055,.009]);arc(0,.009,.0055,0,Math.PI);wire.push([-.0055,-.005]);
      const pts=wire.map(([x,z])=>new T.Vector3(clipX+x,.002,g.nose-g.d.clipPosition/100-g.cgZ+z));const clip=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'centripetal'),100,.00065,6,false),material(selected==='clip'?0xc0a05e:0x8a989b,{metalness:.9,roughness:.2}));clip.name='paperclip-'+ci;this.plane.add(clip);
    }
    if(selected==='clip'){const balance=mesh(new T.RingGeometry(.004,.006,32),new T.MeshBasicMaterial({color:0x087e9b,side:T.DoubleSide,depthTest:false}),this.plane,0,.009,0);balance.rotation.x=-Math.PI/2;balance.renderOrder=3;}
    this.plane.traverse(o=>{if(o.isMesh)o.receiveShadow=false;});this.setPose([0,0,0,0,0,0,0,0,0,0]);
  }
  setPose(s){const a=poseAxes(s),m=new T.Matrix4().makeBasis(new T.Vector3(...a.right),new T.Vector3(...a.up),new T.Vector3(...a.forward));this.plane.quaternion.setFromRotationMatrix(m);this.plane.position.set(s[0],s[1],s[2]);}
  setMode(mode){this.mode=mode;const s=mode==='workshop'?this.workshop:this.world;s.add(this.plane);this.landingMark.visible=false;this.flight=null;this.currentTrail?.removeFromParent();this.previousTrail?.removeFromParent();this.wake?.removeFromParent();if(this.aimArrow)this.aimArrow.visible=false;}
  setEnvironment(e){this.env=e;this.sock.rotation.y=e.windDirection*RAD;this.sock.rotation.x=e.windSpeed===0?.8:0;}
  setDiscipline(id){if(this.discipline===id)return;this.discipline=id;this.distanceGuide.visible=id==='distance';this.windowDirty=true;this.needsDraw=true;}
  setCharge(power){this.charge=power/100;}
  setReady(launch){this.launch=launch;this.setPose([0,1.35,0,0,0,0,launch.pitch*RAD,0,launch.yaw*RAD,0]);this.landingMark.visible=false;const direction=new T.Vector3(...axes(launch.pitch*RAD,launch.yaw*RAD).forward);if(!this.aimArrow){this.aimArrow=new T.ArrowHelper(direction,new T.Vector3(0,1.35,0),.8,0x248bc5,.13,.06);this.world.add(this.aimArrow);}this.aimArrow.position.copy(this.plane.position);this.aimArrow.setDirection(direction);this.aimArrow.visible=true;}
  makeTrail(f,previous=false){const geo=new T.BufferGeometry().setFromPoints(f.path.map(p=>new T.Vector3(...p.s.slice(0,3))));const line=new T.Line(geo,previous?new T.LineDashedMaterial({color:0xbba987,dashSize:.16,gapSize:.14,transparent:true,opacity:.7}):new T.LineBasicMaterial({color:0x238fce,transparent:true,opacity:.85}));line.computeLineDistances();this.world.add(line);return line;}
  // Bridge the held pose for 100 ms without altering the physical flight samples.
  showFlight(f,previous){this.releaseOffset=['ready','charging'].includes(this.lastDraw?.[1])?this.plane.position.clone().sub(new T.Vector3(...sampleFlight(f,0).slice(0,3))):new T.Vector3();this.releaseView={position:this.camera.position.clone(),target:this.camera.position.clone().addScaledVector(this.camera.getWorldDirection(new T.Vector3()),.9)};this.flightView=null;this.flight=f;this.flightBounds=new T.Box3().setFromPoints(f.path.map(p=>new T.Vector3(...p.s.slice(0,3)))).getBoundingSphere(new T.Sphere());this.flightBounds.radius=Math.max(.35,this.flightBounds.radius+Math.max(...this.g.vertices.map(v=>Math.hypot(v[0],v[1],v[2]-this.g.cgZ)))+.02);if(this.aimArrow)this.aimArrow.visible=false;for(const key of ['currentTrail','previousTrail','wake'])if(this[key]){this[key].geometry.dispose();this[key].material.dispose();this[key].removeFromParent();this[key]=null;}this.currentTrail=this.makeTrail(f);this.trailHead=0;if(previous)this.previousTrail=this.makeTrail(previous,true);this.currentTrail.geometry.setDrawRange(0,1);
    const geometry=new T.BufferGeometry(),fade=[];geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(24*18),3).setUsage(T.DynamicDrawUsage));for(let i=0;i<24;i++)fade.push(i/24,i/24,(i+1)/24,i/24,(i+1)/24,(i+1)/24);geometry.setAttribute('fade',new T.Float32BufferAttribute(fade,1));geometry.setAttribute('edge',new T.Float32BufferAttribute(Array.from({length:24},()=>[-1,1,-1,1,1,-1]).flat(),1));
    const material=new T.ShaderMaterial({uniforms:{strength:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,vertexShader:'attribute float fade;attribute float edge;varying float vFade;varying float vEdge;void main(){vFade=fade;vEdge=edge;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;varying float vFade;varying float vEdge;void main(){float soft=1.-smoothstep(.3,1.,abs(vEdge));gl_FragColor=vec4(mix(vec3(.12,.55,.68),vec3(.70,.95,.97),vFade),vFade*.5*soft*strength);}',toneMapped:false});this.wake=new T.Mesh(geometry,material);this.wake.name='flight-wake';this.wake.frustumCulled=false;this.world.add(this.wake);
  }
  draw(t=0,phase='workshop',reduced=false,settle=1){
    this.lastDraw=[t,phase,reduced,settle];const land=Math.max(0,Math.min(1,settle)),landEase=land*land*(3-2*land);
    if(this.windowDirty&&this.mode==='workshop')this.renderWindow();
    const target=new T.Vector3(),closeWorkshop=this.mode==='workshop'&&this.host.clientHeight<=240;let camera,bank=0;
    const flightSpeed=this.flight&&phase==='flying'?Math.hypot(...sampleFlight(this.flight,t).slice(3,6)):0,release=Math.min(1,t/.36),releaseEase=release*release*(3-2*release);
    const fov=this.mode==='workshop'?48:phase==='result'&&!reduced&&this.flightView?this.flightView.fov+(50-this.flightView.fov)*landEase:50+(!reduced&&phase==='flying'?5*Math.min(1,flightSpeed/12)*releaseEase:0);if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
    if(this.mode==='workshop'){
      this.setPose([0,-.0558+this.g.d.fold/100,0,0,0,0,0,0,this.viewRotation,0]);this.paperContact.rotation.z=-this.viewRotation;this.paperContact.scale.x=this.g.span/.145;camera=new T.Vector3(.19,.23,.35);target.set(-.015,.045,-.09);
      if(closeWorkshop){camera.set(.12,.16,.22);target.set(0,-.02,0);}
    }else if(this.flight&&(phase==='flying'||phase==='result')){
      const s=sampleFlight(this.flight,t);this.setPose(s);if(phase==='flying'&&!reduced&&this.releaseOffset){const u=Math.min(1,t/.1);this.plane.position.addScaledVector(this.releaseOffset,1-u*u*(3-2*u));}const horizontal=Math.hypot(s[3],s[5]),a={forward:horizontal>.05?[s[3]/horizontal,0,s[5]/horizontal]:axes(0,this.flight.launch.yaw*RAD).forward},wind=windAt(this.flight.env,t);if(this.flight.env.windSpeed>0)this.sock.rotation.y=Math.atan2(wind[0],wind[2]);
      if(phase==='result'){
        const landing=this.flight.landing??s.slice(0,3);this.landingMark.visible=!!this.flight.landing;this.landingMark.position.set(landing[0],.025,landing[2]);const arrival=!reduced&&this.flightView ? .25+.75*landEase : 1;this.landingMark.traverse(o=>{if(o.material)o.material.opacity=arrival;});
        target.set(landing[0],.15,landing[2]);const radius=1.4,halfFov=Math.min(this.camera.fov*RAD/2,Math.atan(Math.tan(this.camera.fov*RAD/2)*this.camera.aspect));const direction=!reduced&&this.flightView?this.flightView.position.clone().sub(this.flightView.target):new T.Vector3(.65,.75,-1);if(!reduced&&this.flightView){direction.x*=-1;direction.y=Math.max(.6,Math.hypot(direction.x,direction.z)*.7);}camera=target.clone().add(direction.normalize().multiplyScalar(radius/Math.sin(halfFov)*1.12));
        const px=2*Math.tan(this.camera.fov*RAD/2)/this.host.clientHeight;this.landingLabel.scale.set(px*76.8,px*24,1);this.landingLabel.position.y=px*camera.distanceTo(this.landingMark.position)*25;
      }else if(reduced){target.copy(this.flightBounds.center);const halfFov=Math.min(this.camera.fov*RAD/2,Math.atan(Math.tan(this.camera.fov*RAD/2)*this.camera.aspect));camera=target.clone().add(new T.Vector3(.65,.75,-1).normalize().multiplyScalar(this.flightBounds.radius/Math.sin(halfFov)*1.1));}else{const past=sampleFlight(this.flight,Math.max(0,t-.12)),dx=s[3]+past[3],dz=s[5]+past[5],length=Math.hypot(dx,dz),forward=length>.08?[dx/length,dz/length]:[a.forward[0],a.forward[2]],distance=.88+Math.min(flightSpeed,15)*.018;target.set(s[0]+forward[0]*.18,s[1]+.025,s[2]+forward[1]*.18);camera=new T.Vector3(s[0]-forward[0]*distance+forward[1]*.35,s[1]+.42,s[2]-forward[1]*distance-forward[0]*.35);bank=Math.max(-.045,Math.min(.045,Math.atan2(s[3]*past[5]-s[5]*past[3],s[3]*past[3]+s[5]*past[5])*.15))*releaseEase;}
      if(this.currentTrail){
        const path=this.flight.path,count=path.filter(p=>p.t<=t).length,head=Math.min(count,path.length-1),positions=this.currentTrail.geometry.attributes.position;
        // Restore the prior live endpoint before advancing it to the current physical position.
        positions.setXYZ(this.trailHead,...path[this.trailHead].s.slice(0,3));positions.setXYZ(head,...s.slice(0,3));positions.needsUpdate=true;this.trailHead=head;
        this.currentTrail.geometry.setDrawRange(0,!reduced&&phase==='flying'&&t<.1?0:head+1);const ink=Math.max(0,Math.min(1,(t-.1)/.14));this.currentTrail.material.opacity=phase==='flying' ? .32*(reduced?1:ink*ink*(3-2*ink)) : (!reduced&&this.flightView ? .32+.53*landEase : .85);
      }
    }else {const compact=this.camera.aspect<1;camera=compact?new T.Vector3(.015,1.62,-.80):new T.Vector3(.015,1.60,-.60);target.set(0,.12,6);if(this.launch)this.setReady(this.launch);if(phase==='charging'){
      const power=this.charge??0,direction=new T.Vector3(...axes(this.launch.pitch*RAD,this.launch.yaw*RAD).forward);
      if(!reduced){this.plane.position.addScaledVector(direction,-(.055*power+.03*power*power));this.plane.position.y+=.012*power;}
      this.aimArrow.position.copy(this.plane.position);this.aimArrow.setLength(.8+power*.65,.13+power*.01,.06+power*.01);
    }else this.aimArrow?.setLength(.8,.13,.06);}
    if(this.mode!=='workshop'){camera.x*=-1;target.x*=-1;}
    if(phase==='flying'&&!reduced&&this.releaseView){const u=Math.min(1,t/.36),ease=u*u*(3-2*u);camera.lerpVectors(this.releaseView.position,camera,ease);target.lerpVectors(this.releaseView.target,target,ease);}
    if(phase==='result'&&!reduced&&this.flightView){camera.lerpVectors(this.flightView.position,camera,landEase);target.lerpVectors(this.flightView.target,target,landEase);bank=this.flightView.bank*(1-landEase);}
    this.camera.position.copy(camera);this.camera.lookAt(target);if(bank)this.camera.rotateZ(bank);
    if(closeWorkshop||(this.mode!=='workshop'&&!this.flight)||(phase==='flying'&&!reduced))this.fitReadyPlane();
    if(phase==='flying')this.flightView={position:this.camera.position.clone(),target:target.clone(),fov:this.camera.fov,bank};
    if(phase==='result'){const px=2*Math.tan(this.camera.fov*RAD/2)/this.host.clientHeight;this.landingLabel.position.y=px*this.camera.position.distanceTo(this.landingMark.getWorldPosition(new T.Vector3()))*25;}
    if(this.previousTrail){this.previousTrail.visible=phase==='result';this.previousTrail.material.opacity=.7*(!reduced&&this.flightView ? .25+.75*landEase : 1);}
    if(this.wake){
      this.wake.visible=phase==='flying'&&!reduced&&t>.1;
      if(this.wake.visible){
        const fade=Math.min(1,(t-.1)/.14);this.wake.material.uniforms.strength.value=fade*fade*(3-2*fade)*Math.min(1,flightSpeed/4);
        const positions=this.wake.geometry.attributes.position.array,points=[],eye=this.world.worldToLocal(this.camera.position.clone());
        // Face the view while keeping the ribbon center on the actual past trajectory.
        for(let i=0;i<=24;i++){
          const q=sampleFlight(this.flight,Math.max(0,t-.285+i*.26/24)),center=new T.Vector3(...q.slice(0,3)),width=.006+.008*i/24;
          const side=new T.Vector3(...q.slice(3,6)).cross(eye.clone().sub(center));
          if(side.lengthSq()<1e-10)side.set(1,0,0);side.normalize().multiplyScalar(width);
          points.push([center.clone().sub(side).toArray(),center.add(side).toArray()]);
        }
        for(let i=0;i<24;i++)positions.set([...points[i][0],...points[i][1],...points[i+1][0],...points[i][1],...points[i+1][1],...points[i+1][0]],i*18);
        this.wake.geometry.attributes.position.needsUpdate=true;
      }
    }
    this.renderer.render(this.mode==='workshop'?this.workshop:this.world,this.camera);this.needsDraw=false;
  }
  fitReadyPlane(){
    // Pull back along the eye-to-paper ray at extreme folds and angles.
    this.plane.updateWorldMatrix(true,false);this.camera.updateMatrixWorld();const anchor=this.plane.getWorldPosition(new T.Vector3());
    for(let pass=0;pass<5;pass++){
      let fits=true;for(const p of this.g.vertices){const v=new T.Vector3(p[0],p[1],p[2]-this.g.cgZ).applyMatrix4(this.plane.matrixWorld).project(this.camera);if(Math.abs(v.x)>.88||v.y<-.86||v.y>.62){fits=false;break;}}
      if(fits)break;this.camera.position.sub(anchor).multiplyScalar(1.15).add(anchor);this.camera.updateMatrixWorld();
    }
  }
  resizeToHost(){const {width,height}=this.host.getBoundingClientRect();if(width&&height&&(width!==this.width||height!==this.height)){this.width=width;this.height=height;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.needsDraw=true;if(this.g)this.draw(...(this.lastDraw??[0,this.mode,false]));}}
}
