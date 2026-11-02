import * as T from './vendor/three.module.js';
import {footStep,STRIDE} from './lib/gait.mjs?v=walk-memory-20261102';
import {surfaceTexture,foliageGeometry,mossRockGeometry,fernGeometry,grassGeometry,broadleafGeometry,creekFoamGeometry,characterGeometry,forestMaterials,woodlandTree,contactTexture,stoneStepGeometry,cascadeGeometry,squirrelTailGeometry} from './art.mjs?v=walk-memory-20261102';
import {pathX,pathSlope,elevation,riverX,terrain,worldAt,clamp} from './trail.mjs?v=walk-memory-20261102';
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.94,envMapIntensity:.22,...extra});
const cloth=color=>new T.MeshPhysicalMaterial({color,roughness:.95,envMapIntensity:.18,sheen:.16,sheenColor:'#e6d2a1',sheenRoughness:.9});
// Albedo detail stays subtle beneath the storybook palette, avoiding dark double-tinting.
function softenMap(material,strength){material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
  vec4 sampledDiffuseColor=texture2D(map,vMapUv);
  diffuseColor*=mix(vec4(1.0),sampledDiffuseColor,${strength.toFixed(2)});
#endif`);};material.customProgramCacheKey=()=>`soft-map-${strength}`;return material;}
// Grain remains in world space so differently sized rocks keep a consistent texture scale.
function mineralDetail(material){
  const previous=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>key+'-mineral';
  material.onBeforeCompile=shader=>{
    previous(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMineral;').replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 mineralPosition=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        mineralPosition=instanceMatrix*mineralPosition;
      #endif
      vMineral=(modelMatrix*mineralPosition).xyz;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMineral;').replace('#include <color_fragment>',`#include <color_fragment>
      float grain=sin(vMineral.x*49.+sin(vMineral.z*37.)*3.)*sin(vMineral.y*57.+vMineral.z*41.);
      float fissure=pow(1.-abs(sin(vMineral.x*3.3+vMineral.y*8.+sin(vMineral.z*4.)*.55)),20.);
      float mottling=sin(vMineral.x*6.1+sin(vMineral.z*4.3))*sin(vMineral.y*7.2-vMineral.z*3.7);
      diffuseColor.rgb*=.95+grain*.08-fissure*.10+mottling*.08;
    `);
  };
}
const sphere=new T.SphereGeometry(1,20,14), box=new T.BoxGeometry(1,1,1), cylinder=new T.CylinderGeometry(1,1,1,12), cone=new T.ConeGeometry(1,1,9);
const contactPlane=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
const shirtShape=characterGeometry.shirt;
const roundedShape=new T.Shape();roundedShape.moveTo(-.32,-.5);roundedShape.lineTo(.32,-.5);roundedShape.quadraticCurveTo(.5,-.5,.5,-.32);roundedShape.lineTo(.5,.32);roundedShape.quadraticCurveTo(.5,.5,.32,.5);roundedShape.lineTo(-.32,.5);roundedShape.quadraticCurveTo(-.5,.5,-.5,.32);roundedShape.lineTo(-.5,-.32);roundedShape.quadraticCurveTo(-.5,-.5,-.32,-.5);
const roundedBox=new T.ExtrudeGeometry(roundedShape,{depth:.7,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.1,bevelThickness:.15,curveSegments:5});roundedBox.translate(0,0,-.35);
const seamPoints=roundedShape.getPoints(5);seamPoints.pop();
const bagSeam=new T.TubeGeometry(new T.CatmullRomCurve3(seamPoints.map(p=>new T.Vector3(p.x*.30,p.y*.37,-.133)),true),56,.0025,6,true);
function part(parent,geo,m,p,s){const o=new T.Mesh(geo,m);o.position.set(...p);o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
let seed=9281;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function barkTexture(){const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');x.fillStyle='#c8bca2';x.fillRect(0,0,128,256);for(let i=0;i<90;i++){x.strokeStyle=i%2?'#6a5d4940':'#eee3bd40';x.lineWidth=1+rnd()*3;let px=rnd()*128;x.beginPath();x.moveTo(px,0);for(let y=0;y<=256;y+=16){px+=(rnd()-.5)*6;x.lineTo(px,y);}x.stroke();}for(let i=0;i<180;i++){const y=i*1.5; x.strokeStyle=i%3?'#5e402155':'#fff0b34a';x.lineWidth=.5; x.beginPath();x.moveTo(0,y);x.bezierCurveTo(30,y+Math.sin(i)*3,90,y-2,128,y+Math.sin(i*.7)*2);x.stroke();}for(let k=0;k<3;k++)for(let r=2;r<14;r+=2){x.strokeStyle='#5e402165';x.beginPath();x.ellipse(27+k*39,45+k*72,r*1.8,r*.35,.1,0,Math.PI*2);x.stroke();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,1);t.colorSpace=T.SRGBColorSpace;return t;}
export async function createWorld(canvas){
  seed=9281;
  const surfaces=await forestMaterials();
  const waterTime={value:0};
  function caustics(material){
    const previous=material.onBeforeCompile,key=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>key+'-creek-bed';
    material.onBeforeCompile=shader=>{
      previous(shader);shader.uniforms.uWaterTime=waterTime;
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float waterLevel; varying vec3 vBed; varying float vWet;').replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 bedWorld=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          bedWorld=instanceMatrix*bedWorld;
        #endif
        vBed=(modelMatrix*bedWorld).xyz;vWet=max(0.,waterLevel-vBed.y);`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime; varying vec3 vBed; varying float vWet;').replace('#include <color_fragment>',`#include <color_fragment>
        if(vWet>.02){
          float bend=sin(vBed.x*7.+uWaterTime*.9+sin(vBed.z*4.))+sin(vBed.z*8.-uWaterTime*.7+cos(vBed.x*3.));
          float light=pow(1.-abs(sin(bend*1.5)),10.)*(1.-smoothstep(.5,1.5,vWet));
          diffuseColor.rgb+=vec3(.10,.15,.11)*light;
        }`);
    };
  }
  const foliage=await new T.TextureLoader().loadAsync(new URL('./assets/forest-foliage-v2.png',import.meta.url).href);foliage.colorSpace=T.SRGBColorSpace;foliage.anisotropy=4;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.10;
  const scene=new T.Scene();scene.userData.contactTexture=contactTexture();
  const contactMat=new T.MeshBasicMaterial({map:scene.userData.contactTexture,color:'#29484b',transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  scene.userData.actorContact=contactMat.clone();scene.userData.actorContact.opacity=.32;
  const panorama=await new T.TextureLoader().loadAsync(new URL('./assets/summit-panorama-v4.png',import.meta.url).href);panorama.colorSpace=T.SRGBColorSpace;scene.background=panorama;scene.fog=new T.FogExp2('#d5e0d7',.009);
  const env=panorama.clone();env.mapping=T.EquirectangularReflectionMapping;env.needsUpdate=true;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(env).texture;env.dispose();pmrem.dispose();
  const camera=new T.PerspectiveCamera(52,1,.1,420);
  const fill=new T.DirectionalLight('#e4ece7',1.65);scene.add(fill,fill.target);
  scene.add(new T.HemisphereLight('#dce9e5','#65513b',1.25));scene.add(new T.AmbientLight('#fff0d6',.15));
  const sun=new T.DirectionalLight('#ffe0a1',5.4);sun.position.set(-20,28,8);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<700?1024:2048,innerWidth<700?1024:2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:90});sun.shadow.radius=3;sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
  const groups=new Map(),dummy=new T.Object3D(),windTime={value:0};
  function breeze(material){material.onBeforeCompile=shader=>{shader.uniforms.uWind=windTime;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
    vec3 treeBase=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
    float flutter=sin(uWind*1.1+treeBase.x*.7+treeBase.z*.3);
    transformed.x+=flutter*.035*max(0.,position.y+.8);
    transformed.z+=sin(uWind*.8+treeBase.z)*.02*max(0.,position.y+.8);`);};}
  const smallLeaf=new T.SphereGeometry(1,6,4);
  const trees=[0,1,2].map(woodlandTree);
  const geos={tree0:trees[0].geometry,tree1:trees[1].geometry,tree2:trees[2].geometry,leaf:foliageGeometry(),rock:mossRockGeometry(),rock1:mossRockGeometry(1),rock2:mossRockGeometry(2),pebble:new T.IcosahedronGeometry(1,1),grass:grassGeometry(),fern:fernGeometry(),shrub:broadleafGeometry(),petal:smallLeaf,litter:smallLeaf,stem:cylinder};
  function instance(kind,color,x,y,z,sx,sy,sz,ry=0,rz=0){if(kind==='rock'){const variant=Math.abs(Math.floor(x*7+z*3))%3;if(variant)kind='rock'+variant;}const key=kind+':'+Math.floor(-z/32);if(!groups.has(key))groups.set(key,{kind,items:[]});groups.get(key).items.push({color,x,y,z,sx,sy,sz,ry,rz});}
  const land=new T.PlaneGeometry(110,270,110,270);land.rotateX(-Math.PI/2);land.translate(0,0,-100);const ps=land.attributes.position,colors=[];const col=new T.Color();
  for(let i=0;i<ps.count;i++){const x=ps.getX(i),s=-ps.getZ(i);ps.setY(i,terrain(x,s));const d=Math.abs(x-pathX(s));col.set(s<116&&Math.abs(x-riverX(s))<2.1?'#829691':d<1.95?'#b3a27b':'#6d825e');if(d>2.8)col.lerp(new T.Color('#93836a'),(.5+.5*Math.sin(x*.43+s*.61)*Math.sin(s*.17-x*.53))*.40);col.multiplyScalar(.84+.15*Math.sin(x*.4+s*.31)+rnd()*.09);colors.push(col.r,col.g,col.b);}land.setAttribute('color',new T.Float32BufferAttribute(colors,3));land.computeVertexNormals();const turf=surfaces.floor;turf.repeat.set(32,80);const ground=new T.Mesh(land,softenMap(mat('#ffffff',{vertexColors:true,map:turf,bumpMap:turf,bumpScale:.045}),.75));ground.receiveShadow=true;scene.add(ground);
  land.setAttribute('waterLevel',new T.Float32BufferAttribute(Array.from({length:ps.count},(_,i)=>{const s=-ps.getZ(i);return s>-10&&s<110&&Math.abs(ps.getX(i)-riverX(s))<2.5?elevation(s)-.74:-999;}),1));caustics(ground.material);
  function ribbon(center,width,yfun,start,end,steps,material){const v=[],uv=[],ind=[];for(let i=0;i<=steps;i++){const s=start+(end-start)*i/steps;for(const side of [-1,1]){const x=center(s)+side*(width+.24*Math.sin(s*.41)+.13*Math.cos(s*.91));v.push(x,yfun(s,x),-s);uv.push((side+1)/2,i/steps);}}for(let i=0;i<steps;i++){const k=i*2;ind.push(k,k+2,k+1,k+1,k+2,k+3);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();const m=new T.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;}
  const soil=surfaces.soil;soil.repeat.set(.85,42);const pathMat=softenMap(mat('#ffffff',{map:soil,bumpMap:soil,bumpScale:.045,vertexColors:true,side:T.DoubleSide}),.88);
  const pathV=[],pathUV=[],pathC=[],pathI=[];
  for(let i=0;i<=600;i++){const s=-5+i*212/600;for(let j=0;j<=10;j++){const u=(j-5)/5,w=1.88+.10*Math.sin(s*2.2)+.06*Math.sin(s*5.8);const x=pathX(s)+u*w,edge=T.MathUtils.smoothstep(Math.abs(u),.65,1);pathV.push(x,T.MathUtils.lerp(elevation(s)+.065,terrain(x,s)+.018,edge),-s);pathUV.push(j/10,i/600);col.set('#f3e0bd').lerp(new T.Color('#718264'),T.MathUtils.smoothstep(Math.abs(u),.64,.98));col.multiplyScalar(.93+.07*Math.sin(s*.8+j*1.7));pathC.push(col.r,col.g,col.b);if(i<600&&j<10&&(s<58.8||s>65.2)){const k=i*11+j;pathI.push(k,k+11,k+1,k+1,k+11,k+12);}}}
  const pathGeo=new T.BufferGeometry();pathGeo.setAttribute('position',new T.Float32BufferAttribute(pathV,3));pathGeo.setAttribute('uv',new T.Float32BufferAttribute(pathUV,2));pathGeo.setAttribute('color',new T.Float32BufferAttribute(pathC,3));pathGeo.setIndex(pathI);pathGeo.computeVertexNormals();const pathMesh=new T.Mesh(pathGeo,pathMat);pathMesh.receiveShadow=true;scene.add(pathMesh);
  const flow=surfaceTexture('water');flow.repeat.set(1,18);const waterMat=new T.MeshPhysicalMaterial({color:'#72b2b1',bumpMap:flow,bumpScale:.009,roughness:.22,metalness:0,envMapIntensity:.38,clearcoat:.35,clearcoatRoughness:.18,transparent:true,opacity:.88,depthWrite:false,side:T.DoubleSide});
  const water=ribbon(riverX,2.2,s=>elevation(s)-.74,-10,110,350,waterMat);
  waterMat.onBeforeCompile=shader=>{
    shader.uniforms.uFlow=waterTime;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vStream;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStream=uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlow; varying vec2 vStream;').replace('#include <color_fragment>',`#include <color_fragment>
      
      float depth=clamp((1.4*exp(-pow(abs(vStream.x*2.-1.),4.))-.74)/.66,0.,1.);
      float pool=.88+.12*sin(vStream.y*83.+sin(vStream.x*9.)*1.8);
      diffuseColor.rgb=mix(vec3(.12,.28,.21),vec3(.025,.12,.13),depth)*pool;
      diffuseColor.a*=mix(.18,.86,depth);
      float wave=sin(vStream.y*920.+sin(vStream.x*43.)*1.8+uFlow*2.1)*.55+sin(vStream.x*79.+vStream.y*1380.-uFlow*1.7)*.45;
      diffuseColor.rgb+=vec3(.12,.14,.12)*pow(max(0.,wave),12.);`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      normal=normalize(normal+vec3(sin(vStream.y*1480.+sin(vStream.x*31.)*1.5+uFlow*2.3)*.025,cos(vStream.x*67.+vStream.y*760.-uFlow*1.8)*.018,0.));
      float grazing=pow(1.-max(0.,dot(normal,normalize(vViewPosition))),3.);
      diffuseColor.rgb+=vec3(.07,.09,.09)*grazing;`);
  };

  // Broken whitewater follows the creek slope; the clear pool remains visible between crests.
  const riffleMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
    uniforms:{uTime:waterTime},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 q=vec2(vUv.x*22.,vUv.y*360.+uTime*.8);
        float bend=sin(q.x*2.2+q.y*.7)+.45*sin(q.x*5.1-q.y*1.3);
        float streak=sin(q.y*3.+bend*1.5);
        float breakup=sin(q.x*4.7+q.y*1.8)+.5*sin(q.x*9.1-q.y*3.2);
        float crest=smoothstep(.56,.94,streak)*smoothstep(-.2,.65,breakup);
        float bank=smoothstep(0.,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x));
        gl_FragColor=vec4(.80,.94,.88,crest*bank*.32);
      }`});
  for(const [start,end] of [[42,58],[70,84],[99,108]])ribbon(riverX,1.9,s=>elevation(s)-.713,start,end,80,riffleMat).renderOrder=2;
  const cascadeMat=new T.MeshPhysicalMaterial({color:'#a3ccc1',roughness:.25,transparent:true,opacity:.94,depthWrite:false,side:T.DoubleSide,envMapIntensity:.35});
  cascadeMat.onBeforeCompile=shader=>{
    shader.uniforms.uFlow=waterTime;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vCascade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCascade=uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlow; varying vec2 vCascade;').replace('#include <color_fragment>',`#include <color_fragment>
      float strand=pow(max(0.,sin(vCascade.x*83.+sin(vCascade.x*23.)*2.+vCascade.y*7.-uFlow*3.)),5.);
      float base=smoothstep(.64,.98,vCascade.y);
      float broken=smoothstep(-.2,.7,sin(vCascade.x*37.+vCascade.y*42.-uFlow*2.)+.5*sin(vCascade.x*91.-vCascade.y*28.));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,1.,.96),strand*.58+base*broken*.42);
      diffuseColor.a*=smoothstep(0.,.09,vCascade.x)*(1.-smoothstep(.91,1.,vCascade.x))*(.10+strand*broken*.36+base*broken*.52);`);
  };
  const fallingWater=cascadeGeometry();
  for(const s of [50,55,70,73,77,81,85,92,102]){
    const drop=elevation(s)-elevation(s-.95)+.16;
    const sheet=new T.Mesh(fallingWater,cascadeMat);sheet.position.set(riverX(s),elevation(s)-.56,-s);sheet.scale.y=drop;sheet.renderOrder=3;scene.add(sheet);
    for(const side of [-1,1])instance('rock','#b4bdb2',riverX(s)+side*1.45,elevation(s)-.94,-s,.7,.43,.55,s);
  }

  for(let i=0;i<9;i++){const s=109.4+(i%3)*.65,x=riverX(s)-2.5+(i%6)*.9;part(scene,geos.rock,softenMap(mat('#c5ccbe',{vertexColors:true,map:surfaces.stone}),.72),[x,elevation(s)-.75,-s],[.9,.8+(i%3)*.2,1.15]);}
  const ripples=[];const rippleMat=new T.MeshBasicMaterial({color:'#ddfff0',transparent:true,opacity:.09,depthWrite:false,side:T.DoubleSide});
  let vegetationSeed;for(let i=0;i<72;i++){if(i===32)vegetationSeed=seed;const s=-3+rnd()*111,x=riverX(s)+(rnd()-.5)*3.6;const o=new T.Mesh(new T.TorusGeometry(.22+rnd()*.4,.012,3,14,Math.PI*(.4+rnd())),rippleMat);o.rotation.x=-Math.PI/2;o.rotation.z=rnd()*6;o.position.set(x,elevation(s)-.71,-s);o.userData={s,phase:rnd()*7};scene.add(o);ripples.push(o);}
  seed=vegetationSeed;
  // Instanced vegetation keeps this small scene practical on classroom tablets.
  for(let i=0;i<300;i++){
    const s=-15+rnd()*242,x=pathX(s)+(rnd()<.5?-1:1)*(4.5+Math.pow(rnd(),1.35)*30);if(x>pathX(s)&&x-pathX(s)<10&&s>35&&s<60||s>205||Math.abs(x-riverX(s))<3.1||s>181&&Math.abs(x-pathX(s))<24||s>145&&x>pathX(s)+4)continue;
    const y=terrain(x,s),size=.78+rnd()*.5,angle=rnd()*Math.PI*2,tree=trees[i%3];
    instance('tree'+i%3,'#e0d5bf',x,y,-s,size,size,size,angle);
    for(const [j,crown] of tree.crowns.entries()){
      const cx=x+(crown.x*Math.cos(angle)+crown.z*Math.sin(angle))*size,cz=-s+(-crown.x*Math.sin(angle)+crown.z*Math.cos(angle))*size,r=crown.size*size;
      instance('leaf',['#e3e9ce','#d3e0bf','#eee8c9','#bed3b9'][j%4],cx,y+crown.y*size,cz,r*1.4,r*.82,r*1.2,angle+j*.72,.13*Math.sin(j));
    }
  }
  // Smaller trees below the ridge keep the opened vista a forest instead of a bare green slope.
  const valleySeed=seed;
  for(let i=0;i<120;i++){
    const s=116+rnd()*91,x=pathX(s)+13+rnd()*28,y=terrain(x,s),size=.48+rnd()*.30,angle=rnd()*6,tree=trees[i%3];
    instance('tree'+i%3,'#d2dbce',x,y,-s,size,size,size,angle);
    for(const [j,c] of tree.crowns.entries()){
      const r=c.size*size;instance('leaf','#c5d5c3',x+(c.x*Math.cos(angle)+c.z*Math.sin(angle))*size,y+c.y*size,-s+(-c.x*Math.sin(angle)+c.z*Math.cos(angle))*size,r*1.35,r*.8,r*1.2,angle+j);
    }
  }
  seed=valleySeed;
  // A middle layer of saplings closes the empty space beneath the tall canopy.
  for(let i=0;i<100;i++){
    const s=18+rnd()*158,side=i%2?1:-1,x=pathX(s)+side*(5.4+rnd()*10);
    if(Math.abs(x-riverX(s))<3.4||side>0&&s>145)continue;
    const y=terrain(x,s),size=.27+rnd()*.17,angle=rnd()*6,tree=trees[i%3];
    instance('tree'+i%3,'#cbbd94',x,y,-s,size,size,size,angle);
    for(const c of tree.crowns){const r=c.size*size;instance('leaf','#d3e2b5',x+(c.x*Math.cos(angle)+c.z*Math.sin(angle))*size,y+c.y*size,-s+(-c.x*Math.sin(angle)+c.z*Math.cos(angle))*size,r*1.3,r*.82,r*1.2,angle);}
  }
  for(let i=0;i<3700;i++){
    const s=-6+rnd()*214,side=rnd()<.5?-1:1,x=pathX(s)+side*(2.5+Math.pow(rnd(),1.7)*12);if(Math.abs(x-riverX(s))<2.5||s>191&&s<206&&Math.abs(x-pathX(s))<5||Math.abs(s-53)<3&&side===-1&&Math.abs(x-pathX(s))<4.5||Math.abs(s-136)<7&&side===1&&Math.abs(x-pathX(s))<4.5||Math.abs(s-24)<4&&side===1&&Math.abs(x-pathX(s))<3.8)continue;const y=terrain(x,s);
    const size=.55+rnd()*.55;instance(i%3===0?'fern':'grass','#abc58f',x,y,-s,size,size,size,rnd()*6);
    if(i%4===0&&Math.abs(x-riverX(s))>3.4){for(let j=0;j<2;j++)instance('shrub',j%2?'#dce4c8':'#c6d8c0',x+(rnd()-.5)*.6,y-.03,-s+(rnd()-.5)*.6,.60+rnd()*.38,.48+rnd()*.30,.60+rnd()*.38,rnd()*6);}
    if(i%4===0){const h=.25+rnd()*.22;instance('stem','#4b7542',x,y+h/2,-s,.012,h,.012);const flower=i%12===0?'#d7b7d4':'#f9f0cf';for(let j=0;j<5;j++){const a=j*Math.PI*2/5;instance('petal',flower,x+Math.cos(a)*.075,y+h,-s+Math.sin(a)*.075,.075,.035,.055,a);}instance('petal','#e4bb57',x,y+h+.015,-s,.042,.025,.042);}
  }
  // Mid-height shrubs break the bare lawn silhouette beyond the path's small plants.
  for(let i=0;i<240;i++){
    const s=-5+rnd()*196,side=i%2?1:-1,x=pathX(s)+side*(5+rnd()*17);
    if(Math.abs(x-riverX(s))<3.6||s>145&&side>0||s>181)continue;
    const size=1.1+rnd()*.9;
    instance('shrub','#dce5ce',x,terrain(x,s),-s,size,size*1.2,size,i*2.4);
  }
  for(let s=5;s<183;s+=2.7)for(const side of [-1,1]){
    const x=pathX(s)+side*(3.0+.30*Math.sin(s)),y=terrain(x,s);
    if(Math.abs(x-riverX(s))<2.8||side<0&&[24,57,91].some(stop=>Math.abs(s-stop)<3)||Math.abs(s-136)<1&&side>0&&Math.abs(x-pathX(s))<2.7)continue;
    instance('shrub','#dbe7b7',x,y,-s,1.05,1.20,1.05,s*.4);
    instance('fern','#c8d89c',x+side*.7,y,-s+.7,1.1,1,1.1,s);
    if(s<85&&Math.abs(x+side*1.4-riverX(s))>3.5)instance('shrub','#c4d4b2',x+side*1.4,terrain(x+side*1.4,s),-s-1,1.5,1.7,1.5,s*.7);
  }
  for(let i=0;i<180;i++){const s=rnd()*110,side=rnd()<.5?-1:1,x=riverX(s)+side*(2.1+rnd()*1.4),y=terrain(x,s);if(Math.abs(x-pathX(s))<2.8)continue;const r=.35+rnd()*.9;instance('rock',['#e3e3de','#bdccd0','#d4d8d3'][i%3],x,y+.12,-s,r*(.8+rnd()*.5),r*(.42+rnd()*.30),r*(.65+rnd()*.45),rnd()*6);}
  // Interlocking banks and submerged stones hide the smooth terrain lip at the waterline.
  for(let s=1;s<109;s+=1.35)for(const side of [-1,1]){
    const x=riverX(s)+side*(2.25+.28*Math.sin(s*1.7)),r=.65+rnd()*.55;
    if(Math.abs(x-pathX(s))<2.65)continue;
    instance('rock','#e5e7d7',x,elevation(s)-.40,-s,r,.44+rnd()*.35,r*.85,s);
    const leafX=x+side*.55;
    instance('fern','#d0daac',leafX,terrain(leafX,s),-s,.8,.8,.8,s);
  }
  for(let i=0;i<260;i++){
    const s=rnd()*110,x=riverX(s)+(rnd()-.5)*3.7,r=.16+rnd()*.40;
    instance('rock',i%3?'#91b2a8':'#bfc2a1',x,elevation(s)-1.25,-s,r,.10+rnd()*.16,r*.75,rnd()*6);
  }
  for(let i=0;i<160;i++){
    const s=-2+rnd()*183,side=i%2?1:-1,x=pathX(s)+side*(7+rnd()*16);
    if(Math.abs(x-riverX(s))<4||s>145&&side>0)continue;
    const y=terrain(x,s),r=1.2+rnd()*.9;
    instance('rock','#cbd3bd',x,y+.22,-s,r,r*.55,r*.8,i);
    for(let j=0;j<3;j++)instance('shrub','#d8e6c3',x+Math.cos(j*2.1)*r*.6,y+.1,-s+Math.sin(j*2.1)*r*.6,r*.9,r*.85,r*.9,i+j);
  }
  // Foreground boulders frame the creek without entering the walkable corridor.
  for(const s of [46,50,53]){
    const x=pathX(s)-3.9,y=terrain(x,s);
    instance('rock','#dce1d5',x,y+.3,-s,1.18,.68,.95,s);
    for(let j=0;j<4;j++){
      const fx=x+Math.cos(j*2.4)*1.1,fs=s+Math.sin(j*2.4),fy=terrain(fx,fs),h=.30+j*.06;
      instance('fern','#c7d6a4',fx,fy,-fs,.85,.85,.85,j);
      instance('stem','#68864e',fx,fy+h/2,-fs,.013,h,.013);
      for(let k=0;k<5;k++){const a=k*Math.PI*2/5;instance('petal','#fff5da',fx+Math.cos(a)*.095,fy+h,-fs+Math.sin(a)*.095,.095,.035,.065,a);}
      instance('petal','#eac86d',fx,fy+h+.02,-fs,.048,.025,.048);
    }
  }
  for(let i=0;i<76;i++){
    const s=3+i*2.5+Math.sin(i*3)*.8,side=i%2?1:-1,x=pathX(s)+side*(3.8+(i%3)*.55);
    if(Math.abs(x-riverX(s))<2.4||s>186||Math.abs(s-24)<5||Math.abs(s-53)<3.5&&side<0||Math.abs(s-136)<7||Math.abs(s-91)<5)continue;
    const r=.6+(i%5)*.15;instance('rock','#dfe1dc',x,terrain(x,s)+r*.3,-s,r*(1+Math.sin(i)*.2),r*(.45+(i%3)*.1),r*(.65+(i%2)*.3),i*2.4);
  }
  for(let i=0;i<1800;i++){const s=rnd()*191;if(s>58.8&&s<65.2)continue;const x=pathX(s)+(rnd()-.5)*4.5;instance('pebble',i%3?'#a5977d':'#c3b79f',x,elevation(s)+.075,-s,.025+rnd()*.095,.015+rnd()*.035,.04+rnd()*.11,rnd()*6);}
  for(let i=0;i<850;i++){
    const s=4+rnd()*185,side=i%2?1:-1,offset=i%3?side*(2.0+rnd()*3.5):(rnd()-.5)*4.0,x=pathX(s)+offset;
    if(s>58&&s<66||Math.abs(x-riverX(s))<2.5&&s<111)continue;
    const y=Math.abs(offset)<2.3?elevation(s)+.075:terrain(x,s)+.025;
    instance('litter',['#8c704b','#b69d61','#857e4e','#c4ab70'][i%4],x,y,-s,.035+rnd()*.025,.006,.075+rnd()*.055,rnd()*6);
  }
  // Dense low borders frame the four scenes without covering feet or narrowing the trail.
  for(let i=0;i<1350;i++){
    const s=35+rnd()*168,side=i%2?1:-1,x=pathX(s)+side*(2.25+rnd()*2.1);
    if(s>58&&s<67||s>190||Math.abs(x-riverX(s))<2.6||Math.abs(s-57)<3&&side<0||Math.abs(s-136)<1&&side>0&&Math.abs(x-pathX(s))<2.7)continue;
    const y=terrain(x,s),scale=.65+rnd()*.65;
    instance(i%3?'fern':'shrub',i%2?'#e3e9ba':'#b6d3a1',x,y,-s,scale,scale,scale,rnd()*6);
    if(i%7===0){const h=.28;instance('stem','#7a8b4e',x,y+h/2,-s,.009,h,.009);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;instance('petal','#fff5d9',x+Math.cos(a)*.065,y+h,-s+Math.sin(a)*.065,.07,.025,.045,a);}instance('petal','#e6b647',x,y+h+.015,-s,.03,.02,.03);}
  }
  for(let i=0;i<340;i++){
    const s=119+rnd()*86,x=pathX(s)+3.8+rnd()*9,y=terrain(x,s),size=.85+rnd()*.85;
    if(s>191&&x-pathX(s)<5||Math.abs(s-136)<4&&x-pathX(s)<5)continue;
    instance('shrub',i%2?'#cddcb0':'#a7c29d',x,y,-s,size,size*.9,size,rnd()*6);
    if(i%6===0)instance('rock','#d0d3bb',x,y-.1,-s,size,size*.55,size*.8,i);
  }
  for(let i=0;i<32;i++){
    const s=189+rnd()*19,x=pathX(s)-5.3-rnd()*5,y=terrain(x,s),size=.8+rnd()*1.1;
    instance('rock','#d2d5c3',x,y-.15,-s,size,size*.7,size,i);
    instance('fern','#d3dfae',x+.5,y+.15,-s+.4,1.2,1.2,1.2,i);
    instance('shrub','#dce7b8',x-.4,y+.12,-s-.5,1.5,1.4,1.5,i);
  }
  for(const [s,offset,size] of [[193,-8,.62],[201,-9,.70],[206,-11,.60]]){
    const x=pathX(s)+offset,y=terrain(x,s),tree=trees[1];instance('tree1','#e0d5bf',x,y,-s,size,size,size);
    for(const c of tree.crowns){const r=c.size*size;instance('leaf','#dce6bc',x+c.x*size,y+c.y*size,-s+c.z*size,r*1.35,r*.8,r*1.2);}
  }
  const foamGeo=creekFoamGeometry(),foamMat=new T.MeshBasicMaterial({color:'#d8eee6',transparent:true,opacity:.30,depthWrite:false,side:T.DoubleSide});
  for(let i=0;i<44;i++){
    const s=4+i*2.35,x=riverX(s)+Math.sin(i*3)*1.1;if(Math.abs(x-pathX(s))<2.9)continue;
    const r=.35+(i%4)*.14;instance('rock','#cfd7d3',x,elevation(s)-.70,-s,r,r*.6,r*.8,i);
    const ring=new T.Mesh(foamGeo,foamMat);ring.scale.set(r*1.45,1,r*1.45);ring.position.set(x,elevation(s)-.67,-s);ring.rotation.x=Math.atan((elevation(s+.1)-elevation(s-.1))/.2);scene.add(ring);ripples.push(ring);ring.userData={s,phase:i,radius:r*1.45,foam:true};
  }
  for(let i=0;i<90;i++){
    const s=190+rnd()*15,x=pathX(s)-5.1-rnd()*2.5,y=terrain(x,s),r=.55+rnd()*.6;
    instance(i%3?'grass':'fern','#d9dda4',x,y,-s,r,r,r,i);
    if(i%4===0)instance('shrub','#dce3b5',x,y,-s,.72,.65,.72,i);
  }
  // Low meadow pockets cover exposed bank soil, while keeping the trail and animal clear.
  for(let i=0;i<620;i++){
    const s=38+rnd()*166,side=i%2?1:-1,x=pathX(s)+side*(3.2+rnd()*4.8);
    if(s>58&&s<66||s>191&&Math.abs(x-pathX(s))<5||s<111&&Math.abs(x-riverX(s))<2.6)continue;
    const y=terrain(x,s),scale=.55+rnd()*.55;
    instance('grass','#ced8a4',x,y,-s,scale,scale,scale,i);
    if(i%6===0){const h=.22+rnd()*.18;instance('stem','#56773e',x,y+h/2,-s,.008,h,.008);for(let j=0;j<5;j++){const a=j*1.256;instance('petal',i%12?'#c1b7dc':'#fff3d2',x+Math.cos(a)*.07,y+h,-s+Math.sin(a)*.07,.075,.028,.045,a);}instance('petal','#d6a73c',x,y+h+.01,-s,.03,.02,.03);}
  }
  // Broken outcrops sit on the exposed slopes behind the creek and beside the ridge.
  for(const s of [48,54,72,78,84,90,96,130,140,194,201]){
    for(let j=0;j<3;j++){
      const x=s<110?riverX(s)-3.6-j*.75:pathX(s)-(s>190?6.7:4.4)-j*.8,ss=s+j*.8,y=terrain(x,ss),r=.85+j*.28;
      if(Math.abs(x-pathX(ss))<r*1.4+(s>190?4.6:2.2))continue;
      instance('rock','#b7c0ac',x,y-.15,-ss,r*1.15,r*.70,r,s+j);
      instance('fern','#c2d497',x+.5,y+.2,-ss+.3,.75,.75,.75,j);
    }
  }
  // Low creek-side plants reveal the water below the bridge without clearing the forest.
  for(const {kind,items} of groups.values())if(['fern','shrub'].includes(kind))for(const p of items){const s=-p.z;if(s>44&&s<59&&p.x>pathX(s)+2&&p.x<riverX(s)+1){p.sx*=.72;p.sy*=.62;p.sz*=.72;}}
  // Small summit flowers sit beyond the platform, leaving the mountain silhouette open.
  for(let i=0;i<46;i++){
    const s=192+i*.28,side=i%3===0?1:-1,x=pathX(s)+side*(5.0+.65*(1+Math.sin(i*2.4))),y=terrain(x,s);
    instance('grass','#c5c48c',x,y,-s,.70,.8,.70,i);
    if(i%2===0){instance('fern','#91ac69',x,y,-s,.45,.45,.45,i);const h=.24+.06*Math.sin(i);instance('stem','#638046',x,y+h/2,-s,.012,h,.012);for(let j=0;j<5;j++){const angle=j*Math.PI*2/5;instance('petal','#fff0c5',x+Math.cos(angle)*.06,y+h,-s+Math.sin(angle)*.06,.065,.025,.048,angle);}instance('petal','#d7ae4c',x,y+h+.01,-s,.03,.02,.03);}
  }
  // Layered verge clusters frame each spot while keeping the path and wildlife approach open.
  for(const [a,b] of [[44,58],[78,99],[126,146],[192,204]])for(let i=0;i<48;i++){
    const s=a+(b-a)*i/48,side=i%2?1:-1,edge=s>190?5.2:2.25;
    if(s>131&&s<141&&side===1)continue;
    const x=pathX(s)+side*(edge+.75*(.5+.5*Math.sin(i*2.3))),y=terrain(x,s);
    if(s<111&&Math.abs(x-riverX(s))<2.4)continue;
    const r=.45+.25*(.5+.5*Math.sin(i*1.7));
    instance(i%3?'fern':'shrub',i%2?'#c1d78a':'#a6c48d',x,y,-s,r,r*.8,r,i);
    if(i%2===0){const h=.25+.08*Math.sin(i);instance('stem','#668243',x,y+h/2,-s,.009,h,.009);for(let j=0;j<6;j++){const a=j*Math.PI/3;instance('petal',i%6?'#fff5d6':'#cbb9df',x+Math.cos(a)*.075,y+h,-s+Math.sin(a)*.075,.078,.022,.038,a);}instance('petal','#d8a743',x,y+h+.01,-s,.028,.018,.028);}
  }
  // Clear the existing bench footprint so the resting place is readable from the path.
  for(const group of groups.values())if(['grass','fern','shrub','stem','petal'].includes(group.kind))group.items=group.items.filter(p=>Math.abs(p.z+87.5)>1.5||Math.abs(p.x-(pathX(87.5)-3.2))>1.65);
  for(const {kind,items} of groups.values()){const stone=surfaces.stone;const m=mat('#ffffff',kind.startsWith('tree')?{map:surfaces.bark,bumpMap:surfaces.bark,bumpScale:.08}:kind==='leaf'?{map:foliage,alphaTest:.43,vertexColors:true,side:T.DoubleSide,emissive:'#273b18',emissiveIntensity:.07,roughness:.76}:['grass','fern','shrub'].includes(kind)?{vertexColors:true,side:T.DoubleSide}:kind.startsWith('rock')?{vertexColors:true,map:stone,bumpMap:stone,bumpScale:.065}:{});const inst=new T.InstancedMesh(kind.startsWith('rock')?geos[kind].clone():geos[kind],m,items.length);for(let i=0;i<items.length;i++){const p=items[i];dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy,p.sz);dummy.rotation.set(0,p.ry,p.rz);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);col.set(p.color);if(kind==='shrub')col.lerp(new T.Color('#779987'),.18);else if(kind==='fern')col.lerp(new T.Color('#98a76e'),.12);if(['leaf','shrub','fern'].includes(kind)){const warm=.5+.5*Math.sin(p.x*.7+p.z*.23);col.lerp(new T.Color('#bdc774'),warm*.18);col.multiplyScalar(.84+.25*warm);}inst.setColorAt(i,col);}if(kind==='leaf'){m.alphaToCoverage=true;inst.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:foliage,alphaTest:.43,side:T.DoubleSide});breeze(m);breeze(inst.customDepthMaterial);}if(kind.startsWith('rock')){softenMap(m,.72);mineralDetail(m);inst.geometry.setAttribute('waterLevel',new T.InstancedBufferAttribute(new Float32Array(items.map(p=>{const s=-p.z;return s>-10&&s<110&&Math.abs(p.x-riverX(s))<2.5?elevation(s)-.74:-999;})),1));caustics(m);}if(kind==='shrub')m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vLeaf;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLeaf=uv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vLeaf;').replace('#include <color_fragment>',`#include <color_fragment>
        float mid=1.-smoothstep(.015,.045,abs(vLeaf.x-.5));
        float branches=pow(max(0.,cos((vLeaf.y-abs(vLeaf.x-.5)*.65)*39.)),22.)*(1.-smoothstep(.30,.49,abs(vLeaf.x-.5)));
        diffuseColor.rgb*=.94+.10*mid+.055*branches;`);
    };if(kind.startsWith('tree')){
      softenMap(m,.96);const original=m.onBeforeCompile;
      m.customProgramCacheKey=()=> 'bark-furrows';
      m.onBeforeCompile=shader=>{original(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float furrow=abs(sin(vMapUv.x*57.+sin(vMapUv.y*8.)*.8+sin(vMapUv.y*17.+vMapUv.x*12.)*.3));
        diffuseColor.rgb*=.74+.32*smoothstep(.03,.50,furrow);
      `);};
    }inst.castShadow=kind.startsWith('tree')||kind==='leaf'||kind==='shrub'||kind.startsWith('rock');inst.receiveShadow=true;inst.computeBoundingSphere();scene.add(inst);}
  const contacts=[];
  for(const {kind,items} of groups.values())if(kind.startsWith('tree')||kind.startsWith('rock')||kind==='shrub')for(const p of items){
    const s=-p.z;if(s<116&&Math.abs(p.x-riverX(s))<2.5||kind==='shrub'&&p.sy<1.1||kind.startsWith('rock')&&p.sx<.4)continue;
    const onPath=Math.abs(p.x-pathX(s))<1.95,y=onPath?elevation(s)+.078:terrain(p.x,s)+.018;
    contacts.push({...p,y,r:kind.startsWith('tree')?.95:kind==='shrub'?.7:.88});
  }
  const shadows=new T.InstancedMesh(contactPlane,contactMat,contacts.length);
  contacts.forEach((p,i)=>{const s=-p.z,dx=(terrain(p.x+.1,s)-terrain(p.x-.1,s))/.2,dz=(terrain(p.x,s-.1)-terrain(p.x,s+.1))/.2;dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx*p.r,1,p.sz*p.r);dummy.rotation.set(-Math.atan(dz),0,Math.atan(dx));dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);});shadows.computeBoundingSphere();scene.add(shadows);
  const woodGrain=barkTexture();woodGrain.repeat.set(1,1);const wood=mat('#ae8b60',{map:woodGrain,bumpMap:woodGrain,bumpScale:.018}),darkWood=mat('#8e7859',{map:woodGrain});
  for(let s=59;s<=65.1;s+=.36){const p=worldAt(s);const b=part(scene,box,wood,[p.x,p.y,-s],[3.05*Math.hypot(1,pathSlope(s)),.18,.34*Math.hypot(1,pathSlope(s))]);b.rotation.y=-Math.atan(pathSlope(s));}
  for(const side of [-1,1]){
    for(let s=59;s<=65.1;s+=1.5){const p=worldAt(s,side*1.42);const post=part(scene,characterGeometry.bag,darkWood,[p.x,p.y+.48,p.z],[.27,1.16,.27]);post.rotation.y=-Math.atan(pathSlope(s));}
    for(const h of [.86,.37]){
      const points=Array.from({length:25},(_,i)=>{const p=worldAt(59+i*6/24,side*1.42);return new T.Vector3(p.x,p.y+h,p.z);});
      part(scene,new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.095,10,false),wood,[0,0,0],[1,1,1]);
    }
  }

  // End caps and pegs make the bridge read as joined timber at the approach.
  const peg=mat('#66533b');
  for(const side of [-1,1])for(let s=59;s<=65.1;s+=1.5){
    const p=worldAt(s,side*1.42);
    part(scene,characterGeometry.bag,wood,[p.x,p.y+1.08,p.z],[.33,.13,.33]);
    for(const h of [.37,.86])part(scene,sphere,peg,[p.x-side*.15,p.y+h,p.z],[.025,.025,.025]);
  }
  const stoneSteps=[0,1,2].map(stoneStepGeometry),stepMat=softenMap(mat('#ffffff',{map:surfaces.stone,bumpMap:surfaces.stone,bumpScale:.035,vertexColors:true}),.65);
  for(let s=71;s<98;s+=1.15+.17*Math.sin(s)){
    const p=worldAt(s),steps=new T.Group();steps.position.set(p.x,p.y-.07,p.z);steps.rotation.y=-Math.atan(pathSlope(s));scene.add(steps);
    for(let j=-1;j<=1;j++){const slab=part(steps,stoneSteps[(j+Math.floor(s))%3],stepMat,[j*1.25+.17*Math.sin(s+j),.035,.34*Math.sin(j+s)],[.89+.16*Math.sin(s+j*3),.95,.70+.24*Math.sin(s+j)]);slab.rotation.y=.17*Math.sin(s+j*2);}
  }
  // Low timber waterbars and stone edging read as an ascending mountain trail.
  for(const [a,b] of [[32,51],[101,124],[148,181]])for(let s=a;s<=b;s+=3.2+Math.sin(s)*.45){
    const p=worldAt(s),g=new T.Group();g.position.set(p.x,p.y-.05,p.z);g.rotation.y=-Math.atan(pathSlope(s));scene.add(g);
    part(g,box,darkWood,[0,0,0],[3.9,.10,.14]);
    for(const side of [-1,1])part(g,geos.rock,mat('#9ca58b',{vertexColors:true}),[side*2.25,.06,0],[.28,.23,.3]);
  }
  function bench(s,offset){const p=worldAt(s,offset),g=new T.Group();g.position.set(p.x,p.y,p.z);g.rotation.y=-Math.PI/2;scene.add(g);for(const x of [-.7,.7])for(const z of [-.23,.23])part(g,box,darkWood,[x,.23,z],[.12,.46,.12]);for(let i=0;i<3;i++)part(g,box,wood,[0,.5,-.25+i*.25],[1.9,.1,.21]);part(g,box,wood,[0,.88,-.4],[1.9,.18,.1]);for(const x of [-.7,.7])part(g,box,darkWood,[x,.66,-.4],[.09,.52,.09]);return g;}
  bench(24,-3);const creekBench=bench(87.5,-3.2);creekBench.rotation.y=.35;bench(195,-3);
  const quietBench=bench(57,-4);quietBench.rotation.y=Math.PI/2;
  const seated=createChild(scene,'#819eb7',false,1),watcher=createChild(scene,'#94a47a',false,2);
  const seat=worldAt(57,-4);seated.root.position.set(seat.x,seat.y,seat.z);seated.root.rotation.y=Math.PI/2;
  const watchX=riverX(59)+3;watcher.root.position.set(watchX,terrain(watchX,59)+.08,-59);watcher.root.rotation.y=-Math.PI*.42;
  const posts=[];
  function sign(s,label,offset=-3){const p=worldAt(s,offset),c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#765231';ctx.fillRect(0,0,512,160);for(let i=0;i<25;i++){ctx.strokeStyle=i%2?'#d4b88355':'#33281550';ctx.lineWidth=1+i%3;ctx.beginPath();ctx.moveTo(0,i*7);ctx.bezierCurveTo(140,i*7-8,350,i*7+10,512,i*7-2);ctx.stroke();}ctx.strokeStyle='#4f3824';ctx.lineWidth=10;ctx.strokeRect(5,5,502,150);ctx.fillStyle='#fff0cd';ctx.font='600 57px SUIT, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,80);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;part(scene,box,darkWood,[p.x,p.y+.6,p.z],[.1,1.2,.1]);const m=new T.Mesh(new T.PlaneGeometry(1.8,.56),new T.MeshStandardMaterial({map:tex,roughness:1,side:T.DoubleSide,toneMapped:false}));m.position.set(p.x,p.y+1.2,p.z);scene.add(m);posts.push(m);}
  sign(7,'바람봉 올라가는 길');sign(83,'계곡 쉼터');sign(180,'정상이 가까워요');
  const deckWoods=['#b29a7c','#c2aa88','#a28a6c','#bca486','#a9947c'].map(color=>mat(color,{map:woodGrain,bumpMap:woodGrain,bumpScale:.055}));
  const nails=new T.InstancedMesh(cylinder,mat('#665844'),108);let nailIndex=0;
  for(let row=0;row<=26;row++){const s=192+row*.5,p=worldAt(s),joint=row%2?1.2:-1.2;
    for(const [left,right] of [[-4.5,joint],[joint,4.5]])part(scene,box,deckWoods[row%5],[p.x+(left+right)/2,p.y-.025,p.z],[right-left-.018,.12,.46]);
    for(const x of [-4.3,joint-.12,joint+.12,4.3]){dummy.position.set(p.x+x,p.y+.04,p.z);dummy.scale.set(.019,.008,.019);dummy.rotation.set(0,0,0);dummy.updateMatrix();nails.setMatrixAt(nailIndex++,dummy.matrix);}
  }
  nails.count=nailIndex;nails.computeBoundingSphere();scene.add(nails);
  for(let i=-4;i<=4;i+=2){const p=worldAt(205,i);part(scene,cylinder,darkWood,[p.x,p.y+.55,p.z],[.105,1.1,.105]);part(scene,sphere,wood,[p.x,p.y+1.12,p.z],[.12,.07,.12]);}const end=worldAt(205);for(const h of [.48,1])part(scene,box,wood,[end.x,end.y+h,end.z],[9,.14,.14]);
  for(const side of [-1,1])for(let s=193;s<=205;s+=3){const p=worldAt(s,side*4.4);part(scene,cylinder,darkWood,[p.x,p.y+.52,p.z],[.09,1.05,.09]);if(s<205){const rail=part(scene,box,wood,[p.x,p.y+1,p.z-1.5],[.14,.14,3.1]);rail.rotation.y=-Math.atan(pathSlope(s));}}
  for(let s=121;s<190;s+=3.5){const p=worldAt(s,2.75);part(scene,cylinder,darkWood,[p.x,p.y+.4,p.z],[.055,.8,.055]);}
  const ropePoints=[];for(let s=121;s<=188;s+=.5){const p=worldAt(s,2.75);ropePoints.push(new T.Vector3(p.x,p.y+.65-.09*Math.sin((s-121)/3.5*Math.PI)**2,p.z));}
  const rope=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ropePoints),150,.025,5,false),mat('#d7c6a0'));scene.add(rope);
  sign(200.5,'바람봉',3.35);
  function bird(){const g=new T.Group();const gray=mat('#5b6b67'),white=mat('#f1e8d1');part(g,sphere,gray,[0,0,0],[.16,.19,.23]);part(g,sphere,white,[0,-.02,.14],[.12,.14,.11]);part(g,sphere,gray,[0,.2,.1],[.13,.12,.13]);part(g,cone,mat('#bd9653'),[0,.18,.27],[.045,.1,.045]).rotation.x=Math.PI/2;for(const x of [-.085,.085])part(g,sphere,mat('#202c29'),[x,.22,.19],[.018,.018,.018]);return g;}
  const songbird=bird(),bp=worldAt(24,2.8);songbird.position.set(bp.x,bp.y+1.8,bp.z);scene.add(songbird);const birdBark=softenMap(mat('#ded4ba',{map:surfaces.bark,bumpMap:surfaces.bark,bumpScale:.04}),.78);const branch=new T.CatmullRomCurve3([new T.Vector3(bp.x+1.45,bp.y+1.8,bp.z+.05),new T.Vector3(bp.x+.8,bp.y+1.55,bp.z),new T.Vector3(bp.x-.3,bp.y+1.56,bp.z-.1)]);scene.add(new T.Mesh(new T.TubeGeometry(branch,12,.065,7,false),birdBark));
  part(scene,geos.tree0,birdBark,[bp.x+1.45,terrain(bp.x+1.45,24),bp.z],[.68,.68,.68]);for(let j=0;j<6;j++)part(scene,geos.leaf,mat(j%2?'#d8e0bd':'#c4d5ae',{map:foliage,alphaTest:.43,side:T.DoubleSide,vertexColors:true}),[bp.x+1.45+Math.cos(j)*1.1,bp.y+5.8+(j%2)*.6,bp.z+Math.sin(j)*1.1],[1.4,1,1.4]).customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:foliage,alphaTest:.43,side:T.DoubleSide});
  const furMap=surfaceTexture('fur');furMap.repeat.set(2,2);const squirrel=new T.Group(),fur=softenMap(new T.MeshPhysicalMaterial({color:'#a56830',map:furMap,bumpMap:furMap,bumpScale:.012,roughness:.92,sheen:.75,sheenColor:'#eab76e',sheenRoughness:.75,side:T.DoubleSide}),.66),belly=mat('#efd7af');part(squirrel,sphere,fur,[0,.28,0],[.18,.29,.22]);part(squirrel,sphere,belly,[0,.28,.15],[.12,.21,.1]);const sqHead=new T.Group();sqHead.position.set(0,.53,.1);squirrel.add(sqHead);part(sqHead,sphere,fur,[0,0,0],[.18,.17,.20]);for(const x of [-.13,.13]){part(sqHead,sphere,fur,[x,.16,-.01],[.07,.11,.05]);part(sqHead,sphere,mat('#211d1a'),[x*.78,.025,.16],[.025,.03,.019]);}part(sqHead,sphere,belly,[0,-.04,.175],[.086,.063,.085]);part(sqHead,sphere,mat('#32251e'),[0,-.02,.248],[.024,.021,.02]);for(const x of [-.10,.10])part(squirrel,sphere,fur,[x,.27,.21],[.043,.08,.048]);part(squirrel,sphere,mat('#bd9860'),[0,.29,.25],[.049,.066,.045]);const tail=new T.Group();tail.position.set(0,.16,-.17);squirrel.add(tail);
  squirrel.scale.setScalar(.84);
  const tailGeo=squirrelTailGeometry();
  // Tiny tufts cast blocky self-shadows at the scene shadow resolution.
  const tailFur=fur.clone();tailFur.vertexColors=true;tailFur.onBeforeCompile=fur.onBeforeCompile;const tailMesh=part(tail,tailGeo,tailFur,[0,0,0],[1,1,1]);tailMesh.receiveShadow=false;tail.rotation.x=-.20;
  for(const x of [-.13,.13]){part(sqHead,sphere,mat('#fff1cc'),[x*.78-.007,.035,.177],[.008,.009,.006]);part(sqHead,sphere,mat('#c49b70'),[x,.165,.027],[.037,.068,.015]);}
  for(const x of [-.12,.12])part(squirrel,sphere,fur,[x,.065,.12],[.085,.06,.14]);scene.add(squirrel);
  const butterfly=new T.Group(),wings=[];for(const side of [-1,1]){const w=part(butterfly,sphere,mat('#edc85f'),[side*.12,0,0],[.15,.02,.2]);wings.push(w);}scene.add(butterfly);
  const summitLight=new T.Color('#ffd19a'),woodlandFog=new T.Color('#d5e0d7'),summitFog=new T.Color('#e9dfc9');
  const observationSignals=[];
  for(let i=0;i<3;i++){
    const signal=new T.Mesh(new T.TorusGeometry(.38+i*.21,.018,4,28,Math.PI*1.1),new T.MeshBasicMaterial({color:'#fff5bf',transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));
    scene.add(signal);observationSignals.push(signal);
  }
  const driftingLeaf=part(scene,sphere,mat('#e5bd56'),[0,0,0],[.17,.015,.34]);driftingLeaf.visible=false;
  return {renderer,scene,camera,panorama,sun,posts,squirrel,songbird,
    update(time,s,idle,reduced,observation=null){
      seated.pose(0,false,time,true,reduced,0,'sit');watcher.pose(0,false,time,true,reduced,0,'crouch');
      scene.fog.density=.009-clamp((s-148)/45,0,1)*.005;
      waterTime.value=reduced?0:time;windTime.value=reduced?0:time;
      flow.offset.y=reduced?0:-time*.018;flow.offset.x=reduced?0:Math.sin(time*.13)*.018;
      for(const r of ripples){const pulse=reduced?1:1+Math.sin(time*.9+r.userData.phase)*.07;r.position.z=-r.userData.s+(reduced?0:Math.sin(time*.7+r.userData.phase)*.08);if(r.userData.foam)r.scale.set(r.userData.radius*(1+(pulse-1)*.35),1,r.userData.radius*(1+(pulse-1)*.7));else r.scale.setScalar(pulse);}
      const ambientTime=reduced?0:time,wild=observation?.spot===136,settled=wild?(reduced?1:clamp(observation.elapsed/observation.duration,0,1)):0,sp=worldAt(136,3.6);
      squirrel.position.set(sp.x,sp.y,sp.z);squirrel.rotation.y=-Math.PI/2;
      sqHead.rotation.y=wild?(observation.id==='wait'?.35:-.25):Math.sin(ambientTime*.8)*.16;
      sqHead.rotation.x=wild?settled*(observation.id==='space'?.3:-.15):0;
      tail.rotation.x=-.20+(wild&&observation.id==='wait'?settled*.16:Math.sin(ambientTime*2)*.045);
      const birdWatching=observation?.spot===24,waterWatching=[62,91].includes(observation?.spot),age=reduced?1.5:(observation?.elapsed||0);
      songbird.position.y=bp.y+1.8+(birdWatching&&observation.id==='watch'&&!reduced?Math.sin(Math.min(age/2.5,1)*Math.PI)*.12:0);
      for(const [i,signal] of observationSignals.entries()){
        signal.visible=birdWatching&&observation.id==='listen'||waterWatching&&observation.id!=='leaf';
        signal.scale.setScalar(reduced?1:.85+Math.sin(age*2+i)*.1);
        if(birdWatching){signal.position.set(bp.x,bp.y+2,bp.z+.12);signal.rotation.set(0,0,-.2);}
        else if(waterWatching){const rs=observation.spot===62?70:94;signal.position.set(riverX(rs),elevation(rs)-.69-i*.002,-rs);signal.rotation.set(-Math.PI/2,0,i*.8);signal.scale.multiplyScalar(1.5);}
      }
      driftingLeaf.visible=waterWatching&&observation.id==='leaf';
      if(driftingLeaf.visible){const ls=72-(reduced?1.5:clamp(age/3,0,1)*3);driftingLeaf.position.set(riverX(ls)+.3,elevation(ls)-.68,-ls);driftingLeaf.rotation.y=reduced?.5:age*.3;}

      songbird.rotation.y=birdWatching&&observation.id==='watch'?.65:Math.sin(ambientTime*.7)*.2;const b=worldAt(112,2.9);butterfly.position.set(b.x+Math.sin(ambientTime*.7)*.5,b.y+1+Math.sin(ambientTime*1.3)*.25,b.z);wings.forEach((w,i)=>w.rotation.z=reduced?0:Math.sin(time*11)*(i?1:-1)*.8);
      const sunset=T.MathUtils.smoothstep(s,184,198);sun.color.set('#ffe6bc').lerp(summitLight,sunset);sun.intensity=4.7-.45*sunset;scene.fog.color.copy(woodlandFog).lerp(summitFog,sunset);
      const p=worldAt(s);fill.position.set(p.x+6,p.y+10,p.z+12);fill.target.position.set(p.x,p.y+1,p.z);fill.target.updateMatrixWorld();sun.position.set(p.x-18,p.y+26-sunset*10,p.z-16+sunset*6);sun.target.position.set(p.x,p.y,p.z-7);sun.target.updateMatrixWorld();
    }};
}
export function createChild(scene,bagColor='#d6ad47',teacher=false,variant=0){
  bagColor=new T.Color(bagColor).offsetHSL(-.008,.08,-.065);
  const root=new T.Group(),body=new T.Group();root.add(body);scene.add(root);
  let shadow;if(scene.userData.actorContact){shadow=new T.Mesh(contactPlane,scene.userData.actorContact);shadow.scale.set(.47,1,.34);shadow.position.y=-.014;root.add(shadow);}
  const skin=new T.MeshPhysicalMaterial({color:variant===2?'#dbaa83':'#efbf9f',roughness:.76,envMapIntensity:.38,sheen:.15,sheenColor:'#ffd0b5',sheenRoughness:.8}),shirt=cloth(['#e9ddc6','#e5d4c5','#dbe2d0','#e8dbc9'][variant]),pants=cloth(teacher?'#948d77':variant===3?'#576d82':'#4e6c55'),hair=new T.MeshPhysicalMaterial({color:['#191916','#171715','#4b2c1b','#211c16'][variant],roughness:.64,envMapIntensity:.32,sheen:.30,sheenColor:'#b49677',sheenRoughness:.65}),bagMat=cloth(bagColor),shoe=mat('#4c4235',{roughness:.84}),sole=mat('#8c8168');
  const sculptHair=hair.clone();sculptHair.vertexColors=true;
  sculptHair.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHair;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHair=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vHair;').replace('#include <color_fragment>',`#include <color_fragment>
      float comb=sin(atan(vHair.x,vHair.z)*73.+vHair.y*11.+sin(vHair.y*7.)*1.5);
      diffuseColor.rgb*=.95+.05*smoothstep(-.7,.8,comb);
    `);
  };
  const faceSkin=skin.clone();faceSkin.vertexColors=true;
  const foldedShirt=shirt.clone();foldedShirt.vertexColors=true;const foldedPants=pants.clone();foldedPants.vertexColors=true;
  const legs=[],arms=[],elbows=[],hands=[],knees=[],ankles=[];const torso=new T.Group();body.add(torso);
  for(const side of [-1,1]){
    const leg=new T.Group();leg.name='leg-'+side;leg.position.set(side*.145,.56,0);body.add(leg);
    part(leg,characterGeometry.shorts,foldedPants,[0,0,0],[1.06,1,1.05]);
    const pocketCurve=new T.CatmullRomCurve3([[side*.114,-.055,.069],[side*.131,-.093,.020],[side*.128,-.132,-.020]].map(v=>new T.Vector3(...v)));
    part(leg,new T.TubeGeometry(pocketCurve,10,.0025,5,false),pants,[0,0,0],[1,1,1]);
    const knee=new T.Group();knee.name='knee-'+side;knee.position.y=-.24;leg.add(knee);part(knee,teacher?cylinder:sphere,teacher?pants:skin,teacher?[0,-.10,0]:[0,-.055,0],teacher?[.108,.29,.115]:[.08,.13,.085]);
    if(!teacher){part(knee,new T.CylinderGeometry(1,1,1,32),shirt,[0,-.17,0],[.084,.10,.084]);const sockBand=part(knee,new T.TorusGeometry(.085,.0025,6,32),pants,[0,-.136,0],[1,1,1]);sockBand.rotation.x=Math.PI/2;sockBand.castShadow=sockBand.receiveShadow=false;}const ankle=new T.Group();ankle.name='ankle-'+side;ankle.position.y=-.24;knee.add(ankle);part(ankle,characterGeometry.shoe,shoe,[0,.015,.055],[.113,.085,.17]);part(ankle,sphere,sole,[0,-.034,.06],[.117,.025,.17]).name='sole-'+side;
    const shoeCollar=part(ankle,new T.TorusGeometry(.078,.009,8,24),shoe,[0,.067,-.007],[1,1.03,1]);shoeCollar.rotation.x=Math.PI/2;
    part(ankle,roundedBox,sole,[0,.040,-.104],[.054,.067,.014]);
    part(ankle,roundedBox,shoe,[0,.078,.07],[.070,.029,.065]);for(const z of [.09,.125])part(ankle,roundedBox,sole,[0,.081-(z-.09)*.25,z],[.068,.007,.009]);legs.push(leg);knees.push(knee);ankles.push(ankle);
    const arm=new T.Group();arm.name='arm-'+side;arm.position.set(side*.226,.93,0);arm.rotation.z=side*.08;torso.add(arm);
    part(arm,characterGeometry.sleeve,foldedShirt,[side*.008,-.048,0],[.118,.192,.117]);
    part(arm,new T.TorusGeometry(.096,.0035,6,24),shirt,[side*.008,-.143,0],[1,1.08,1]).rotation.x=Math.PI/2;
    const upper=new T.Bone(),elbow=new T.Bone();elbow.position.y=-.24;upper.add(elbow);
    const armSkin=new T.SkinnedMesh(characterGeometry.arm,skin);armSkin.name='continuous-arm';armSkin.castShadow=true;armSkin.receiveShadow=true;armSkin.frustumCulled=false;arm.add(armSkin);armSkin.add(upper);armSkin.bind(new T.Skeleton([upper,elbow]));
    const hand=part(elbow,characterGeometry.hand,skin,[0,-.175,.015],[side*.082,.080,.078]);hand.name='hand-'+side;hands.push(hand);arms.push(arm);elbows.push(elbow);
  }
  part(torso,shirtShape,foldedShirt,[0,.56,0],[1.07,1,1.08]);part(torso,cylinder,skin,[0,1.04,0],[.075,.12,.075]);
  const collar=part(torso,new T.TorusGeometry(.084,.013,6,20),mat('#e2d8bf'),[0,1.018,0],[1,1,.8]);collar.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const flap=part(torso,sphere,shirt,[side*.047,.988,.102],[.045,.043,.018]);flap.rotation.z=side*.40;}
  part(torso,roundedBox,shirt,[0,.91,.166],[.022,.10,.005]);for(const y of [.89,.94])part(torso,sphere,mat('#d5cbb5'),[0,y,.166],[.008,.008,.004]);
  const head=new T.Group();head.position.set(0,1.30,0);head.scale.setScalar(.92);torso.add(head);
  part(head,characterGeometry.head,faceSkin,[0,0,0],[.34,.315,.30]);part(head,variant===1?characterGeometry.bob:characterGeometry.hair,sculptHair,[0,.04,-.015],[.374,.350,.341]);
  
  if(variant===2){head.children[1].rotation.y=.25;head.children[1].scale.y*=1.04;}
  if(variant===3){part(head,sphere,bagMat,[0,.07,-.32],[.10,.09,.07]);const pony=part(head,characterGeometry.ponytail,hair,[0,-.025,-.40],[.14,.25,.16]);pony.rotation.x=.3;}
  for(const x of [-.33,.33]){part(head,sphere,skin,[x,-.015,0],[.055,.075,.052]);part(head,sphere,mat('#dca58d'),[x,-.012,.040],[.022,.033,.009]);}
  const eyes=[];const ink=mat('#342d27'),iris=mat('#624834');
  for(const x of [-.125,.125]){const eye=new T.Group();eye.position.set(x,-.025,.28);eye.rotation.y=Math.sign(x)*.20;head.add(eye);part(eye,sphere,mat('#f8eedb'),[0,0,0],[.046,.057,.018]);part(eye,sphere,iris,[0,-.001,.011],[.037,.050,.013]);part(eye,sphere,ink,[0,.001,.021],[.025,.037,.006]);part(eye,sphere,mat('#fff9e9'),[-.010,.017,.028],[.009,.010,.004]);eyes.push(eye);}
  const brow=new T.TubeGeometry(new T.CatmullRomCurve3([[-.034,0,0],[0,.009,.004],[.034,-.002,0]].map(v=>new T.Vector3(...v))),8,.005,5,false);
  for(const x of [-.125,.125])part(head,brow,hair,[x,.047,.283],[x<0?1:-1,1,1]);
  part(head,sphere,skin,[0,-.078,.294],[.019,.021,.022]);
  const smileCurve=new T.CatmullRomCurve3([[-.035,-.132,.282],[0,-.148,.273],[.035,-.132,.282]].map(p=>new T.Vector3(...p)));
  part(head,new T.TubeGeometry(smileCurve,12,.005,6,false),mat('#a36954'),[0,0,0],[1,1,1]);
  const bag=new T.Group();bag.position.set(0,.79,-.235);torso.add(bag);
  part(bag,characterGeometry.backpack,bagMat,[0,0,0],[.40,.47,.22]);part(bag,characterGeometry.backpack,bagMat,[0,-.10,-.13],[.34,.19,.095]);
  const trim=mat(new T.Color(bagColor).multiplyScalar(.82));
  const zip=new T.CatmullRomCurve3([[-.151,-.03,-.148],[-.151,.13,-.148],[-.092,.185,-.148],[.092,.185,-.148],[.151,.13,-.148],[.151,-.03,-.148]].map(v=>new T.Vector3(...v)));
  part(bag,new T.TubeGeometry(zip,32,.0025,6,false),trim,[0,0,0],[1,1,1]).castShadow=false;
  part(bag,bagSeam,trim,[0,-.10,-.055],[.89,.40,1]).castShadow=false;
  part(bag,roundedBox,mat('#b29a63'),[.08,.176,-.153],[.014,.044,.008]);
  part(bag,new T.TorusGeometry(.012,.003,5,12),trim,[.08,.155,-.158],[1,1,1]);part(bag,box,trim,[0,-.025,-.182],[.26,.009,.008]);part(bag,roundedBox,mat('#b29a63'),[.09,-.048,-.188],[.013,.034,.007]);
  const patch=part(bag,roundedBox,mat('#986539'),[0,.10,-.147],[.044,.044,.008]);patch.rotation.z=Math.PI/4;
  for(const x of [-.125,.125])part(bag,sphere,mat('#e8d6a0'),[x,-.025,-.190],[.010,.010,.006]);
  for(const side of [-1,1])part(bag,characterGeometry.bag,bagMat,[side*.19,-.12,0],[.075,.18,.16]);
  for(const detail of bag.children)if(detail.geometry===bagSeam||detail.geometry.type==='TubeGeometry'){detail.castShadow=false;detail.receiveShadow=false;}
  part(bag,new T.TorusGeometry(.063,.014,8,20),bagMat,[0,.265,.01],[1,1,1]);
  for(const x of [-.17,.17]){
    const curve=new T.CatmullRomCurve3([[x,.63,.125],[x,.83,.15],[x,.99,.095],[x,1.025,-.035],[x,.97,-.17],[x,.83,-.24]].map(p=>new T.Vector3(...p)));
    const strap=new T.TubeGeometry(curve,20,1,8,false),p=strap.attributes.position;
    for(let i=0;i<p.count;i++){const t=Math.floor(i/9)/20,c=curve.getPointAt(t),v=new T.Vector3().fromBufferAttribute(p,i).sub(c);v.set(v.x*.033,v.y*.016,v.z*.016).add(c);p.setXYZ(i,v.x,v.y,v.z);}
    strap.computeVertexNormals();part(torso,strap,bagMat,[0,0,0],[1,1,1]);
    part(torso,roundedBox,mat('#a18c58'),[x,.735,.160],[.044,.040,.012]);
    part(torso,roundedBox,bagMat,[x,.735,.168],[.026,.045,.008]);
  }
  if(teacher){head.children[1].scale.y*=.78;part(head,cylinder,mat('#ddbf85'),[0,.25,0],[.45,.055,.4]);part(head,cylinder,mat('#ceb17c'),[0,.35,0],[.28,.2,.27]);part(head,cylinder,mat('#867255'),[0,.27,0],[.287,.055,.277]);const pole=part(torso,cylinder,mat('#bb9961'),[-.39,1.12,.13],[.018,.9,.018]);const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(.32,-.08);shape.lineTo(0,-.17);const flag=new T.Mesh(new T.ShapeGeometry(shape),mat('#f4ca62',{side:T.DoubleSide}));flag.position.set(pole.position.x,1.56,.13);torso.add(flag);root.scale.setScalar(1.14);}
  torso.position.y=.65;for(const part of torso.children)part.position.y-=.65;
  let gait=0,previousTime=0,restBlend=0,bagPitch=0,bodySway=0;
  return {root,head,pose(distance,moving,time,rest=false,reduced=false,slope=0,activity='stand'){
    if(time<previousTime){gait=restBlend=bagPitch=bodySway=0;}
    const dt=Math.max(0,Math.min(.05,time-previousTime));previousTime=time;gait+=(Number(moving)-gait)*(1-Math.exp(-dt*(moving?12:9)));
    restBlend+=(Number(rest&&!moving)-restBlend)*(reduced?1:1-Math.exp(-dt*6));
    const phase=distance/STRIDE*Math.PI*2;
    const climb=clamp(slope,-.5,.5);
    const pelvisDrop=(.035+Math.abs(climb)*.18)*gait;
    const bob=reduced?0:Math.sin(phase*2)*.004*gait;
    if(shadow)shadow.rotation.x=-Math.atan(climb);
    for(let i=0;i<2;i++){
      const step=footStep(distance,i),a=phase+i*Math.PI,z=step.z*gait,v=step.z/(STRIDE*.55/2);
      const lift=step.lift*(1+Math.abs(climb)) * gait;
      const down=.48-pelvisDrop+bob-climb*z-lift,d=clamp(Math.hypot(z,down),.12,.4799);
      const hip=Math.atan2(-z,down)-Math.acos(d/.48),knee=2*Math.acos(d/.48);
      legs[i].rotation.x=hip;knees[i].rotation.x=knee;ankles[i].rotation.x=-Math.atan(climb)-hip-knee+step.roll*gait;
      // The opposite arm leads the forward foot, including the uphill stride.
      arms[i].rotation.x=-(i?.04:.12)+v*.28*gait;
      elbows[i].rotation.x=-(i?.28:.36)-Math.max(0,-v)*.23*gait;
      arms[i].rotation.z=(i?1:-1)*(.09+(rest?.025:0));
      hands[i].rotation.set(.10+(reduced?0:Math.sin(a-.4)*.06*gait),(i?1:-1)*.35,(i?1:-1)*.12);
    }
    torso.rotation.x=Math.atan(climb)*.28*gait;
    bodySway+=(Math.sin(phase)*.018*gait-bodySway)*(1-Math.exp(-dt*10));
    bagPitch+=(Math.sin(phase*2+.4)*.035*gait-bagPitch)*(1-Math.exp(-dt*8));
    body.position.y=-.045-pelvisDrop+bob+(reduced?0:Math.sin(time*1.7+variant)*.003*(1-gait));
    body.rotation.z=reduced?0:bodySway;torso.rotation.y=reduced?0:Math.sin(phase)*.04*gait;head.rotation.z=reduced?0:-bodySway*.85;
    bag.rotation.x=reduced?0:bagPitch;bag.rotation.z=reduced?0:-bodySway*.5;head.rotation.y=rest?-.35:reduced?0:Math.sin(time*.5+variant)*.04;
    const blink=!reduced&&Math.sin(time*.7+variant)>.997;eyes.forEach(eye=>eye.scale.y=blink?.12:1);
    if(activity==='look'){head.rotation.y-=restBlend*.25;head.rotation.x=-restBlend*.12;}
    else head.rotation.x=0;
    if(activity==='bag'){arms[0].rotation.x-=.7*restBlend;elbows[0].rotation.x-=.8*restBlend;}
    if(activity==='observe'){
      torso.rotation.x+=.18*restBlend;torso.rotation.y-=.08*restBlend;head.rotation.x=.32*restBlend;head.rotation.y=-.50*restBlend;
      arms[0].rotation.x-=.18*restBlend;elbows[0].rotation.x-=.38*restBlend;hands[0].rotation.x-=.14*restBlend;
      arms[1].rotation.x-=.24*restBlend;elbows[1].rotation.x-=.52*restBlend;hands[1].rotation.x-=.22*restBlend;
    }
    if(activity==='guide'){arms[1].rotation.z=.48*restBlend;arms[1].rotation.x=-.85*restBlend;elbows[1].rotation.x=-.65*restBlend;head.rotation.y=.30*restBlend;hands[1].rotation.y-=.75*restBlend;hands[1].rotation.x-=.26*restBlend;}
    if(activity==='crouch'){
      for(let i=0;i<2;i++){legs[i].rotation.x-=.68*restBlend;knees[i].rotation.x+=1.12*restBlend;ankles[i].rotation.x-=.44*restBlend;arms[i].rotation.x-=(i?.50:.30)*restBlend;elbows[i].rotation.x-=(i?.40:.62)*restBlend;}
      body.position.y-=.085*restBlend;torso.rotation.x+=.30*restBlend;head.rotation.x=.16*restBlend;
    }
    if(activity==='sit'){
      for(let i=0;i<2;i++){legs[i].rotation.x-=1.4*restBlend;knees[i].rotation.x+=1.5*restBlend;ankles[i].rotation.x-=.1*restBlend;arms[i].rotation.x-=.8*restBlend;elbows[i].rotation.x-=.3*restBlend;}
      head.rotation.y=-.35*restBlend;torso.rotation.x=.08*restBlend;
    }
  }};
}
