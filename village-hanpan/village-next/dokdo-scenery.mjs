import {rockWalk,bridgeFooting,bridgeFootingMesh,bridgeFlare,bridgeDrift} from './dokdo-path-style.mjs?v=living15';
import {cliffPoint} from './dokdo-relief.mjs?v=living15';
import * as T from '../lib/three.module.min.js';
import {part,createGangchi,batchParts} from './dokdo-models.mjs';
import {dokdoLand} from './dokdo-layout.mjs';
import {coastlines as outlines,coastDistance,dokdoHeight,naturalHeight,deckHeight,walkHeight,trailCells,trailSet,coastalSet,slotCells,walkNodes,walkEdges} from './dokdo-terrain.mjs';
export {dokdoHeight} from './dokdo-terrain.mjs';
import {mappedRocks,namedFeatures} from './dokdo-geography.mjs';
const C=2.4;
export function createIslandScenery(world){
 const group=new T.Group(),island=new T.Group(),farIsland=new T.Group(),boat=new T.Group(),body=new T.Group(),passenger=new T.Group();
 group.name='dokdo-landscape';island.name='dokdo-near';farIsland.name='dokdo-on-horizon';group.add(island,farIsland);world.scene.add(group,boat);boat.add(body);body.add(passenger);boat.visible=false;passenger.position.y=.35;
 const heightSamples=new Map();
 function samplePoint(x,z){const key=`${x.toFixed(7)},${z.toFixed(7)}`;if(!heightSamples.has(key))heightSamples.set(key,cliffPoint(x,z));return heightSamples.get(key);}
 const sampleHeight=(x,z)=>samplePoint(x,z)[1];
 const shared=new T.Group();island.add(shared);
 const positions=[],colors=[],uvs=[],norm=new T.Color(),vegetationTone=new T.Color('#8d9b62'),step=.6;
 function vertex(x,z){const y=sampleHeight(x,z);positions.push(...samplePoint(x,z));uvs.push((x+24)/49,(z+25)/43);const slope=Math.hypot(sampleHeight(x+.15,z)-sampleHeight(x-.15,z),sampleHeight(x,z+.15)-sampleHeight(x,z-.15))/.3;const greenery=y>1?(1-T.MathUtils.smoothstep(slope,.55,1.7))*T.MathUtils.smoothstep(Math.sin(x*.8+z*.7)+.35*Math.sin(x*2.3-z*1.6),-.3,.6):0;norm.set(y<.6?'#607d79':'#d0c1a9');norm.lerp(vegetationTone,greenery);const hollow=(sampleHeight(x+.6,z)+sampleHeight(x-.6,z)+sampleHeight(x,z+.6)+sampleHeight(x,z-.6))*.25-y;norm.multiplyScalar(.99-.43*T.MathUtils.smoothstep(hollow,.22,1.6)+.08*T.MathUtils.smoothstep(-hollow,.18,1.1));colors.push(norm.r,norm.g,norm.b);}
 for(let x=-30;x<30;x+=step)for(let z=-29;z<20;z+=step){if([sampleHeight(x,z),sampleHeight(x+step,z),sampleHeight(x,z+step),sampleHeight(x+step,z+step)].every(h=>h<0))continue;for(const [dx,dz]of[[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]])vertex(x+dx*step,z+dz*step);}
 // These low approach foundations are fictional construction, not added natural islands.
 for(const e of walkEdges){const mesh=bridgeFootingMesh(e);if(!mesh)continue;const {points,faces}=mesh;
  for(const face of faces)for(const i of face){const [x,y,z]=points[i];positions.push(x,y,z);uvs.push((x+24)/49,(z+25)/43);norm.set('#bdb29d');norm.lerp(new T.Color('#617b77'),1-T.MathUtils.smoothstep(y,-.5,1.1));if(i<8)norm.lerp(vegetationTone,.32*T.MathUtils.smoothstep(Math.sin(x*1.8+z*.7),-.2,.8));norm.multiplyScalar(.92+.08*Math.sin(x*.85+z*.65));colors.push(norm.r,norm.g,norm.b);}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();
 // Blend shared-vertex normals: soften grid facets without rounding away the volcanic silhouette.
 const averaged=new Map(),normals=geometry.attributes.normal,keys=[];
 for(let i=0;i<positions.length;i+=3){const key=positions.slice(i,i+3).map(v=>v.toFixed(5)).join(',');keys.push(key);const n=averaged.get(key)||new T.Vector3();n.add(new T.Vector3().fromBufferAttribute(normals,i/3));averaged.set(key,n);}
 for(const n of averaged.values())n.normalize();
 for(let i=0;i<keys.length;i++){const n=new T.Vector3().fromBufferAttribute(normals,i).lerp(averaged.get(keys[i]),.64).normalize();normals.setXYZ(i,n.x,n.y,n.z);}
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=1024;const tc=texCanvas.getContext('2d');tc.fillStyle='#d5cdb8';tc.fillRect(0,0,1024,1024);
 let seed=7461;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<70000;i++){const shade=100+Math.floor(rand()*125);tc.fillStyle=`rgba(${shade},${shade},${shade},.22)`;tc.fillRect(rand()*1024,rand()*1024,1+rand()*4,1+rand()*3);}
 for(let i=0;i<600;i++){const x=rand()*1024,y=rand()*1024;tc.strokeStyle=i%3?'rgba(88,78,63,.14)':'rgba(245,236,210,.3)';tc.lineWidth=.5+rand();tc.beginPath();tc.moveTo(x,y);tc.lineTo(x+rand()*15-7,y+8+rand()*25);tc.stroke();}
 const rockTexture=new T.CanvasTexture(texCanvas);rockTexture.colorSpace=T.SRGBColorSpace;rockTexture.anisotropy=4;
 const terrain=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,map:rockTexture,roughness:.97,flatShading:false}));terrain.receiveShadow=true;terrain.castShadow=true;shared.add(terrain);
 new T.TextureLoader().load('assets/dokdo/volcanic-rock.webp',map=>{map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.MirroredRepeatWrapping;map.repeat.set(6,6);map.anisotropy=4;terrain.material.map=map;terrain.material.needsUpdate=true;});
 terrain.material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 rockPosition; varying vec3 rockNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nrockPosition=position;rockNormal=normal;');
  shader.fragmentShader='varying vec3 rockPosition; varying vec3 rockNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   float bedding=rockPosition.y*2.6+sin(rockPosition.x*.91+rockPosition.z*.6)*3.6+sin(rockPosition.z*2.7-rockPosition.x*.4)*.7;
   float joint=rockPosition.x*1.6+rockPosition.z*1.1+rockPosition.y*.23+sin(rockPosition.y*.43);
   float relief=(sin(bedding)*.034+pow(.5+.5*sin(joint),14.)*.075)*(1.-smoothstep(.08,.35,length(fwidth(rockPosition))));
   vec3 dpX=dFdx(vViewPosition),dpY=dFdy(vViewPosition);
   vec3 rX=cross(dpY,normal),rY=cross(normal,dpX);
   float det=dot(dpX,rX);
   if(abs(det)>.0000001)normal=normalize(abs(det)*normal-sign(det)*(dFdx(relief)*rX+dFdy(relief)*rY));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec3 weights=pow(abs(normalize(rockNormal)),vec3(4.)); weights/=max(.001,weights.x+weights.y+weights.z);
   vec4 stone=texture2D(map,rockPosition.yz*.18)*weights.x+texture2D(map,rockPosition.xz*.18)*weights.y+texture2D(map,rockPosition.xy*.18)*weights.z;
   diffuseColor*=mix(vec4(1.),stone,.40);
   float strata=sin(rockPosition.y*2.6+sin(rockPosition.x*.8+rockPosition.z*.6)*3.6+sin(rockPosition.x*2.7)*.5);
   float cliff=1.-smoothstep(.35,.8,abs(normalize(rockNormal).y));
   diffuseColor.rgb*=1.-cliff*.10*smoothstep(.35,.9,strata);
   float mineral=.5+.5*sin(rockPosition.x*.72+rockPosition.z*.48+sin(rockPosition.y*.63));
   float fissure=pow(.5+.5*sin(rockPosition.x*.95+rockPosition.z*.61+sin(rockPosition.y*.9)),12.);
   diffuseColor.rgb*=mix(vec3(.88,.94,1.03),vec3(1.055,1.025,.97),mineral)*(1.-fissure*cliff*.19);
   float creviceMoss=smoothstep(.65,.92,fissure)*(1.-smoothstep(.4,.8,cliff))*smoothstep(1.,4.,rockPosition.y);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.24,.09),creviceMoss*.32);
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.64,.79,.80),1.-smoothstep(-.3,1.4,rockPosition.y));
   #endif`);
 };


 const sea=new T.Mesh(new T.PlaneGeometry(240,240),new T.MeshStandardMaterial({color:'#216b97',roughness:.46,metalness:.04}));sea.rotation.x=-Math.PI/2;sea.position.y=-.65;group.add(sea);
 const coastCanvas=document.createElement('canvas');coastCanvas.width=coastCanvas.height=128;const coastCtx=coastCanvas.getContext('2d'),coastPixels=coastCtx.createImageData(128,128);
 const shorePolys=[...outlines,...mappedRocks.map(r=>r.outline)].map(poly=>({poly,minX:Math.min(...poly.map(p=>p[0]))-3.6,maxX:Math.max(...poly.map(p=>p[0]))+3.6,minZ:Math.min(...poly.map(p=>p[1]))-3.6,maxZ:Math.max(...poly.map(p=>p[1]))+3.6}));
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const wx=-38+x/127*70,wz=-40+y/127*64;let d=3.6;for(const s of shorePolys)if(wx>=s.minX&&wx<=s.maxX&&wz>=s.minZ&&wz<=s.maxZ)d=Math.min(d,coastDistance(s.poly,wx,wz));const v=Math.round(Math.max(0,1-d/3.6)*255),i=(y*128+x)*4;coastPixels.data[i]=coastPixels.data[i+1]=coastPixels.data[i+2]=v;coastPixels.data[i+3]=255;}coastCtx.putImageData(coastPixels,0,0);const coastMap=new T.CanvasTexture(coastCanvas);coastMap.flipY=false;
 const seaSpace={value:new T.Vector3(39,-20,.42)},seaClock={value:0};sea.material.onBeforeCompile=shader=>{shader.uniforms.seaTime=seaClock;shader.uniforms.seaSpace=seaSpace;shader.uniforms.coastMap={value:coastMap};shader.vertexShader='varying vec3 seaPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nseaPosition=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='uniform float seaTime; uniform vec3 seaSpace; uniform sampler2D coastMap; varying vec3 seaPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 float crossWave=sin(seaPosition.z*.67+seaTime*.28)+sin(seaPosition.x*.39-seaTime*.17);
 vec3 rippleNormal=normalize(vec3(.085*cos(seaPosition.x*.72+seaPosition.z*.47+seaTime*.52)+.018*cos(seaPosition.x*1.7+seaPosition.z*2.3+seaTime*.65+crossWave),1.,.052*cos(seaPosition.z*.61-seaPosition.x*.26-seaTime*.34)+.018*cos(seaPosition.x*2.9-seaPosition.z*1.8+seaTime*.39+crossWave)));
 normal=normalize(mat3(viewMatrix)*rippleNormal);
 float grazing=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.22,.40,.46),grazing*.18);`);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float w=sin(seaPosition.x*.72+seaPosition.z*1.14+seaTime*.65+sin(seaPosition.z*.23)*1.7)*.55+sin(seaPosition.x*2.1-seaPosition.z*.45+seaTime*.39+sin(seaPosition.x*.37))*.3+sin(seaPosition.x*.41+seaPosition.z*3.2-seaTime*.3)*.15;
 float broad=.5+.17*sin(seaPosition.x*.13+seaPosition.z*.21+sin(seaPosition.z*.07))+.17*sin(seaPosition.x*.087-seaPosition.z*.16);
 float swell=sin(seaPosition.x*.43+seaPosition.z*.32+seaTime*.52+sin(seaPosition.z*.28)*1.6);
 float smallWave=pow(max(0.,sin(seaPosition.x*2.1+seaPosition.z*1.3+seaTime*.8+sin(seaPosition.z*.9))),20.)*smoothstep(.2,.9,sin(seaPosition.z*1.7-seaPosition.x*.9));
 float crest=pow(max(0.,swell),18.)*smoothstep(.15,.8,sin(seaPosition.x*.31-seaPosition.z*.23));
 vec2 coastUV=((seaPosition.xz-seaSpace.xy)/seaSpace.z-vec2(-38.,-40.))/vec2(70.,64.);
 float insideMap=step(0.,coastUV.x)*step(coastUV.x,1.)*step(0.,coastUV.y)*step(coastUV.y,1.);
 float shore=texture2D(coastMap,clamp(coastUV,0.,1.)).r*insideMap;shore=pow(shore,2.35);
 vec2 leftCoast=abs(seaPosition.xz-vec2(-8.4,0.))/vec2(13.35,21.75),rightCoast=abs(seaPosition.xz-vec2(14.4,0.))/vec2(7.35,21.75);
 float mainlandDistance=min((pow(pow(leftCoast.x,4.)+pow(leftCoast.y,4.),.25)-1.)*13.35,(pow(pow(rightCoast.x,4.)+pow(rightCoast.y,4.),.25)-1.)*7.35);
 float mainlandShore=(1.-smoothstep(.1,4.8,max(0.,mainlandDistance)))*(1.-step(.9,seaSpace.z));
 shore=max(shore,mainlandShore*.82);
 diffuseColor.rgb=mix(mix(vec3(.012,.095,.23),vec3(.018,.18,.34),broad),mix(vec3(.075,.46,.43),vec3(.055,.36,.40),insideMap),smoothstep(0.,1.,shore)*.86)*(.97+w*.065);
 float shoalLight=(1.-smoothstep(.025,.11,abs(sin(seaPosition.x*2.8+sin(seaPosition.z*2.1)+seaTime*.16)+sin(seaPosition.z*3.2-seaTime*.21))));
 diffuseColor.rgb+=vec3(.024,.060,.050)*shoalLight*pow(shore,3.);
 float lace=sin(seaPosition.x*7.+sin(seaPosition.z*4.)+seaTime*.4)*sin(seaPosition.z*6.-seaTime*.3);
 float wash=.5+.5*sin(shore*28.-seaTime*.8+sin(seaPosition.x*1.7+seaPosition.z*2.1));
 float foamPatch=smoothstep(-.05,.75,sin(seaPosition.x*1.17+seaPosition.z*.84+sin(seaPosition.z*1.9)));
 float foamBand=smoothstep(.62,.94,shore)*smoothstep(.48,.88,wash)*foamPatch*(.45+.55*smoothstep(-.6,.5,lace));
 float washFront=sin(shore*24.-seaTime*.72+sin(seaPosition.x*.63+seaPosition.z*.91)*.45);
 float surf=smoothstep(.85,.98,washFront)*smoothstep(.64,.91,shore)*foamPatch;
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.87,.83),foamBand*.16+surf*.24);
 float glintWave=sin(seaPosition.x*4.6+seaPosition.z*7.1+seaTime*.72+sin(seaPosition.x*1.83+seaPosition.z*.79)*3.4+sin(seaPosition.z*2.7-seaPosition.x*.4)*2.);
 float glintCross=sin(seaPosition.x*1.4-seaPosition.z*2.3-seaTime*.38+sin(seaPosition.x*.6+seaPosition.z*.9)*2.);
 float sunPath=exp(-pow((seaPosition.x+seaPosition.z*.58-9.)/9.,2.));
 float glint=pow(max(0.,glintWave),28.)*smoothstep(.40,.92,glintCross)*(.10+.90*sunPath)*smoothstep(.10,.75,sin(seaPosition.x*.31+sin(seaPosition.z*.23))*sin(seaPosition.z*.47-seaPosition.x*.13));
 glint*=smoothstep(.15,.85,sin(seaPosition.x*5.7-seaPosition.z*4.9+seaTime*.22));
 diffuseColor.rgb+=vec3(.66,.64,.49)*glint*(1.-shore*.65);
 float fleck=pow(max(0.,sin(seaPosition.x*5.1+seaPosition.z*3.7+seaTime*.3+sin(seaPosition.z*1.8))*sin(seaPosition.z*6.4-seaPosition.x*2.8+seaTime*.2+sin(seaPosition.x*1.3))),12.);
 diffuseColor.rgb+=vec3(.045,.055,.05)*fleck*shore*smoothstep(.25,.85,broad);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.34,.40),(crest*.055+smallWave*.014)*(1.-shore));`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  float ribbon=exp(-pow((seaPosition.x+seaPosition.z*.58-9.)/8.,2.));
  vec2 glitterUV=seaPosition.xz*vec2(1.45,2.1),glitterCell=floor(glitterUV);
  vec3 jitter=fract(sin(vec3(dot(glitterCell,vec2(127.1,311.7)),dot(glitterCell,vec2(269.5,183.3)),dot(glitterCell,vec2(419.2,371.9))))*43758.5453);
  vec2 spot=fract(glitterUV)-(.2+jitter.xy*.6);
  spot.x+=spot.y*(jitter.z-.5)*.8;
  float glintShape=dot(spot*vec2(3.2,12.),spot*vec2(3.2,12.));
  float glintEdge=max(.12,fwidth(glintShape));
  float blink=smoothstep(.3,.95,sin(seaTime*(.8+jitter.z*.5)+jitter.x*31.));
  float patches=smoothstep(-.4,.65,sin(seaPosition.x*.63+sin(seaPosition.z*.37)*2.)*sin(seaPosition.z*.52-seaPosition.x*.17));
  float sparkle=(1.-smoothstep(.7-glintEdge,.7+glintEdge,glintShape))*step(.67,jitter.z)*blink*patches*ribbon*(1.-shore*.8);
  totalEmissiveRadiance+=vec3(1.,.91,.74)*sparkle*.52;`);
 };

 // Each outline is traced from the published KIOST map, not a random ring of rocks.
 const dummy=new T.Object3D(),rockVertices=[];
 for(const rock of mappedRocks){const poly=rock.outline.map(p=>[...p]);let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a[0]*b[1]-b[0]*a[1];}if(area<0)poly.reverse();const cx=poly.reduce((n,p)=>n+p[0],0)/poly.length,cz=poly.reduce((n,p)=>n+p[1],0)/poly.length;
  // MOFA photo: one broad sea stack with three cave mouths, not three separate rocks.
  if(Math.hypot(rock.mapCenter[0]-474.4,rock.mapCenter[1]-377.6)<2){
   const rx=Math.max(...poly.map(p=>Math.abs(p[0]-cx))),rz=Math.max(...poly.map(p=>Math.abs(p[1]-cz))),bottom=[],top=[];
   for(let i=0;i<24;i++){const a=i*Math.PI/12;let opening=0;for(let k=0;k<3;k++){const d=Math.atan2(Math.sin(a-k*Math.PI*2/3),Math.cos(a-k*Math.PI*2/3));opening=Math.max(opening,1.8*Math.sqrt(Math.max(0,1-(d/.42)**2)));}bottom.push([cx+Math.cos(a)*rx,-.7+opening,cz+Math.sin(a)*rz]);top.push([cx+Math.cos(a)*rx*.38,3.5+.9*Math.cos(a+.6),cz+Math.sin(a)*rz*.38]);}
   for(let i=0;i<24;i++){const j=(i+1)%24;rockVertices.push(...bottom[i],...top[i],...bottom[j],...bottom[j],...top[i],...top[j],...top[i],cx,4.4,cz,...top[j]);}continue;
  }
  const radius=Math.max(...poly.map(p=>Math.hypot(p[0]-cx,p[1]-cz))),gaje=cz<-21,flat=Math.hypot(rock.mapCenter[0]-161.7,rock.mapCenter[1]-447.9)<2,height=gaje?Math.min(.65,.16+radius*.14):flat?.65:Math.max(.22,Math.min(3.2,radius*.85));
  const candle=Math.hypot(rock.mapCenter[0]-468.2,rock.mapCenter[1]-471.7)<2;
  const rim=poly.map(([x,z])=>[cx+(x-cx)*(candle?.32:gaje||flat?.94:.72)+(candle?.08:0),(candle?3.1:height)*(candle?.70+.30*Math.sin(x*2.3+z*.8):.83+.17*Math.sin(x*1.3+z)),cz+(z-cz)*(candle?.28:gaje||flat?.94:.72)]);
  for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length,a=[poly[i][0],-.7,poly[i][1]],b=[poly[j][0],-.7,poly[j][1]];rockVertices.push(...a,...rim[i],...b,...b,...rim[i],...rim[j]);}
  for(const [a,b,c]of T.ShapeUtils.triangulateShape(poly.map(p=>new T.Vector2(...p)),[]))rockVertices.push(...rim[c],...rim[b],...rim[a],poly[a][0],-.7,poly[a][1],poly[b][0],-.7,poly[b][1],poly[c][0],-.7,poly[c][1]);
 }
 // The Elephant Rock is a coastal sea arch on southern Seodo, never a detached elephant statue.
 for(const name of ['코끼리바위','독립문바위']){const site=namedFeatures.find(f=>f.name===name),elephant=name==='코끼리바위';
  // MOFA's southern Seodo photograph: a sloping headland with a narrow opening, not a round hoop.
  const outer=elephant?[[-2.4,-1.4],[-2.7,4.6],[-1.3,4.25],[.15,3.6],[.95,2.1],[2.3,.15],[2.5,-1.4]]:[[-4,-1.4],[-4.1,1.8],[-3.0,3.8],[-1.0,4.4],[0,4.0],[1.0,3.0],[1.5,.7],[1.8,-1.4]];
  const shape=new T.Shape(outer.map(([x,y])=>new T.Vector2(x,y))),hole=new T.Path();hole.moveTo(-.48,-1.05);hole.lineTo(.65,-1.05);hole.lineTo(.58,.85);hole.quadraticCurveTo(.25,2.2,-.10,2.55);hole.quadraticCurveTo(-.65,1.65,-.48,-1.05);shape.holes.push(hole);
  const geo=new T.ExtrudeGeometry(shape,{depth:elephant?2:2.2,bevelEnabled:true,bevelSize:.11,bevelThickness:.12,bevelSegments:1,curveSegments:6,steps:1});geo.translate(site.position[0],0,site.position[1]-1.0);rockVertices.push(...geo.attributes.position.array);geo.dispose();
 }
 const rockGeo=new T.BufferGeometry();rockGeo.setAttribute('position',new T.Float32BufferAttribute(rockVertices,3));rockGeo.computeVertexNormals();
 // Blend lighting across shared corners without moving the mapped rock silhouettes.
 averaged.clear();keys.length=0;
 const rockNormals=rockGeo.attributes.normal;
 for(let i=0;i<rockVertices.length;i+=3){const key=rockVertices.slice(i,i+3).map(v=>v.toFixed(5)).join(',');keys.push(key);const n=averaged.get(key)||new T.Vector3();n.add(new T.Vector3().fromBufferAttribute(rockNormals,i/3));averaged.set(key,n);}
 for(const n of averaged.values())n.normalize();
 for(let i=0;i<keys.length;i++){const n=new T.Vector3().fromBufferAttribute(rockNormals,i).lerp(averaged.get(keys[i]),.43).normalize();rockNormals.setXYZ(i,n.x,n.y,n.z);}
 const rockColors=[];for(let i=0;i<rockVertices.length;i+=3){norm.set('#c4bcaa');norm.lerp(new T.Color('#526e6c'),1-T.MathUtils.smoothstep(rockVertices[i+1],-.4,.8));norm.multiplyScalar(.89+.11*T.MathUtils.smoothstep(rockGeo.attributes.normal.getY(i/3),-.4,.8));rockColors.push(norm.r,norm.g,norm.b);}rockGeo.setAttribute('color',new T.Float32BufferAttribute(rockColors,3));
 const rocks=new T.Mesh(rockGeo,terrain.material);rocks.name='dokdo-map-rocks';rocks.userData.mappedOutlines=mappedRocks.length;shared.add(rocks);
 // Low coastal foliage uses species-specific leaves; flowers follow the game's season.
 function plantGeometry(kind){const v=[],c=[],col=new T.Color();
  const tri=(a,b,d,color)=>{v.push(...a,...b,...d);col.set(color);for(let i=0;i<3;i++)c.push(col.r,col.g,col.b);};
  const leaf=(x,y,z,a,length,width,color)=>{const center=[x,y+.065,z],edge=[];for(let i=0;i<8;i++){const t=i*Math.PI/4,u=Math.cos(t)*width,w=(1+Math.sin(t))*length*.5;edge.push([x+Math.cos(a)*w-Math.sin(a)*u,y+.018+.075*(1-Math.cos(t)*Math.cos(t)),z+Math.sin(a)*w+Math.cos(a)*u]);}for(let i=0;i<8;i++)tri(center,edge[i],edge[(i+1)%8],i<4?color:'#8ca780');};
  if(kind==='haeguk'){for(let i=0;i<7;i++)leaf(0,.02+i%2*.02,0,i*2.4,.42,.13,'#748f69');}
  else if(kind==='sedum'){for(let stem=0;stem<3;stem++){const x=(stem-1)*.15,z=stem%2*.13;tri([x-.018,0,z],[x+.018,0,z],[x,.43,z],'#7a9654');for(let i=0;i<6;i++)leaf(x,.06+i*.055,z,i*2.4+stem,.19,.083,'#789963');}}
  else if(kind==='haeguk-flower'){for(let f=0;f<3;f++){const x=(f-1)*.22,z=f%2*.18,y=.27+f%2*.08;for(let i=0;i<18;i++){const a=i*Math.PI/9,b=a+.12,d=a-.12;tri([x,y,z],[x+Math.cos(d)*.24,y+.075,z+Math.sin(d)*.24],[x+Math.cos(a)*.28,y+.045,z+Math.sin(a)*.28],'#c9b4d9');tri([x,y,z],[x+Math.cos(a)*.28,y+.045,z+Math.sin(a)*.28],[x+Math.cos(b)*.24,y+.075,z+Math.sin(b)*.24],'#e5d5ec');}for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;tri([x,y+.025,z],[x+Math.cos(a)*.085,y+.03,z+Math.sin(a)*.085],[x+Math.cos(b)*.085,y+.03,z+Math.sin(b)*.085],'#e2b348');}}}
  else{for(let f=0;f<6;f++){const x=Math.sin(f*2.4)*.22,z=Math.cos(f*2.4)*.22;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;tri([x,.43,z],[x+Math.cos(a-.35)*.04,.44,z+Math.sin(a-.35)*.04],[x+Math.cos(a)*.12,.46,z+Math.sin(a)*.12],'#f0d561');tri([x,.43,z],[x+Math.cos(a)*.12,.46,z+Math.sin(a)*.12],[x+Math.cos(a+.35)*.04,.44,z+Math.sin(a+.35)*.04],'#e8c44a');}}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;
 }
 const plantMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.80,side:T.DoubleSide});
 const plants=new T.InstancedMesh(plantGeometry('haeguk'),plantMaterial,176),sedums=new T.InstancedMesh(plantGeometry('sedum'),plantMaterial,180),blooms=new T.InstancedMesh(plantGeometry('haeguk-flower'),plantMaterial,100),yellowBlooms=new T.InstancedMesh(plantGeometry('sedum-flower'),plantMaterial,100);
 plants.name='dokdo-plants';sedums.name='dokdo-sedum';blooms.name='dokdo-blooms';yellowBlooms.name='dokdo-sedum-blooms';shared.add(plants,sedums,blooms,yellowBlooms);plants.userData.species='해국';sedums.userData.species='섬기린초';
 let pi=0,si=0,fi=0,yi=0;for(let i=0;i<3000&&(pi<176||si<180);i++){const x=-22+rand()*45,z=-23+rand()*39,y=sampleHeight(x,z);if(trailSet.has(`${Math.round(x/C+8.5)},${Math.round(z/C+8.5)}`)||y<.8||y>14||Math.abs(sampleHeight(x+.2,z)-sampleHeight(x-.2,z))>.7||Math.abs(sampleHeight(x,z+.2)-sampleHeight(x,z-.2))>.7)continue;if(Math.sin(x*.63+z*.41)+Math.sin(z*.85-x*.27)<-.85)continue;const sedum=x>5?i%3!==0:i%3===0;if(sedum?si>=180:pi>=176)continue;const point=samplePoint(x,z);dummy.position.set(point[0],y+.04,point[2]);dummy.scale.setScalar(.62+.84*(.5+.5*Math.sin(x*.81+z*.62)));dummy.rotation.set(Math.atan2(sampleHeight(x,z+.2)-sampleHeight(x,z-.2),.4)*.35,i,-Math.atan2(sampleHeight(x+.2,z)-sampleHeight(x-.2,z),.4)*.35);dummy.updateMatrix();if(sedum){sedums.setMatrixAt(si++,dummy.matrix);if(yi<100&&i%2)yellowBlooms.setMatrixAt(yi++,dummy.matrix);}else{plants.setMatrixAt(pi++,dummy.matrix);if(fi<100&&i%2)blooms.setMatrixAt(fi++,dummy.matrix);}}
 // Keep the pre-refinement visible foliage budget when relief changes candidate slopes.
 plants.count=Math.min(pi,84);sedums.count=Math.min(si,64);blooms.count=Math.min(fi,48);yellowBlooms.count=Math.min(yi,27);
 // Fixed lighthouse on Dongdo ridge. Its silhouette remains readable from the main town.
 const lx=19,lz=7,ly=sampleHeight(lx,lz);part(shared,'cylinder','#e7e3d3',lx,ly+1.45,lz,.43,2.9,.43);part(shared,'cylinder','#b7c9c7',lx,ly+3,lz,.58,.45,.58);part(shared,'cone','#536e70',lx,ly+3.42,lz,.68,.42);part(shared,'sphere','#ffe5a1',lx,ly+3.05,lz,.35,.16,.35);
 function railBetween(a,b,width=.04,parent=shared,color='#887c65'){const d=new T.Vector3().subVectors(b,a),m=part(parent,'box',color,...(a.clone().add(b).multiplyScalar(.5).toArray()),width,d.length(),width);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 // Continuous paths follow the same edges and heights used by the rabbit.
 for(const e of walkEdges){const footing=bridgeFooting(e),stone=rockWalk(e)||!!footing,a=walkNodes[e.a],b=walkNodes[e.b],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),nx=dz/length,nz=-dx/length,steps=Math.max(2,Math.ceil(length/(stone?.80:e.width===1.55?.68:.40)),Math.ceil(Math.abs(b.y-a.y)/.17));
  for(let j=0;j<steps;j++){const u=(j+.5)/steps,flare=bridgeFlare(e,u),drift=bridgeDrift(e,u),ground=naturalHeight(a.x+dx*u,a.z+dz*u),supported=stone||(ground>.1&&ground>a.y+(b.y-a.y)*u-1.4),depth=footing?.18:supported?Math.max(.20,a.y+(b.y-a.y)*u-naturalHeight(a.x+dx*u,a.z+dz*u)+.12):.14,m=part(shared,'box',(e.width===1.55?(footing?['#979686','#a09c89','#969580']:['#8c8270','#998b76','#908571']):supported?['#b5aa94','#bfb29b','#afa78f']:['#a79c84','#b2a58d','#a2957d'])[Math.abs(Math.floor(a.x*3+j*7))%3],a.x+dx*u+nx*drift,a.y+(b.y-a.y)*u-depth/2,a.z+dz*u+nz*drift,e.width+flare+(stone?.14*(1+Math.sin(j*1.7+a.x)):0),depth,length/steps+.015);m.rotation.y=angle;}
  for(const side of[-1,1]){
   const sheltered=[.1,.5,.9].every(u=>naturalHeight(a.x+dx*u+nx*(e.width/2+.16)*side,a.z+dz*u+nz*(e.width/2+.16)*side)>a.y+(b.y-a.y)*u+(stone?.28:.45));
   if(sheltered)continue;
   const trim=e.width===1.55?0:Math.min(.16,.22/length),count=Math.max(1,Math.ceil(length/2.5));
   const railPoint=u=>{const flare=bridgeFlare(e,u),offset=bridgeDrift(e,u)+(e.width+flare)*.5*side;return new T.Vector3(a.x+dx*u+nx*offset,a.y+(b.y-a.y)*u+.65-(e.width===1.55?.10*Math.sin(Math.PI*Math.max(0,Math.min(1,(a.x+dx*u+3.6)/12))):0),a.z+dz*u+nz*offset);};
   let previous;
   for(let j=0;j<=count;j++){const q=railPoint(trim+(1-2*trim)*j/count);if(previous)railBetween(previous,q);part(shared,'box','#887c65',q.x,q.y-.32,q.z,.045,.71,.045);previous=q;}}

  if(stone||e.width===1.55)continue;
  // Cliff walks use short brackets; the low bridge alone keeps water-reaching piles.
  const middle=new T.Vector3((a.x+b.x)/2,(a.y+b.y)/2-.14,(a.z+b.z)/2),ground=naturalHeight(middle.x,middle.z),drop=Math.max(.18,middle.y-Math.max(-.7,ground));
  if(ground<.1||drop<2.5)part(shared,'box','#697268',middle.x,middle.y-drop/2,middle.z,.13,drop,.13);
  else{let anchor=null;for(let r=.5;r<=3.6&&!anchor;r+=.25)for(let k=0;k<24;k++){const t=k*Math.PI/12,x=middle.x+Math.cos(t)*r,z=middle.z+Math.sin(t)*r;if(naturalHeight(x,z)>=middle.y-.5){anchor=new T.Vector3(x,middle.y-.5,z);break;}}
   if(anchor)railBetween(anchor,middle,.22,shared,'#858c7c');
   railBetween(new T.Vector3(a.x,a.y-.16,a.z),new T.Vector3(b.x,b.y-.16,b.z),.13);
  }
 }
 // One light arch replaces the central row of water-reaching piles.
 for(const side of[-1,1]){let previous;for(let j=0;j<=7;j++){const x=-3.6+12*j/7,e=walkEdges.find(e=>e.width===1.55&&walkNodes[e.a].x<=x+.001&&walkNodes[e.b].x>=x-.001);if(!e)continue;const a=walkNodes[e.a],b=walkNodes[e.b],u=(x-a.x)/(b.x-a.x),flare=bridgeFlare(e,u),q=new T.Vector3(x,a.y+(b.y-a.y)*u-.65+.40*Math.sin(Math.PI*j/7),8.4-bridgeDrift(e,u)+side*(e.width+flare)*.43);if(previous)railBetween(previous,q,.11,shared,'#756e5e');previous=q;}}
 for(const n of walkNodes){if(n.kind==='lower'&&n.z===8.4&&n.x>-3.59&&n.x<8.39)continue;const ground=naturalHeight(n.x,n.z),grounded=ground>.1&&ground>=n.y-1.4,depth=grounded?Math.max(.25,n.y-ground+.12):.16,radius=n.lookout?.76:n.kind==='lower'?.68:.56,m=part(shared,'cylinder',grounded?'#b5aa94':n.lookout?'#a69b84':'#a29882',n.x,n.y-depth/2,n.z,radius,depth,radius);m.rotation.y=Math.PI/12;if(n.lookout&&!grounded)part(shared,'cylinder','#786c57',n.x,n.y-.20,n.z,radius*.9,.12,radius*.9);}
 const pier=new T.Group();shared.add(pier);pier.position.x=-5;part(pier,'box','#c4bca7',14,.05,16,2.2,.4,5);part(pier,'box','#c4bca7',13,.05,18.2,4.2,.4,1.25);
 for(const x of[12,14.9])for(const z of[17.8,18.6])part(pier,'cylinder','#737e79',x,.45,z,.07,.65,.07);
 // A short switchback joins the existing home terrace to the actual trail, not an obsolete sea-level landing.
 const homeAccess=new T.Group();island.add(homeAccess);homeAccess.name='home-access';
 const homeSteps=[new T.Vector3(-6,deckHeight(6,8),-1.2),new T.Vector3(-4.4,(deckHeight(6,8)+deckHeight(6,9))/2,0),new T.Vector3(-6,deckHeight(6,9),1.2)];
 for(let f=1;f<homeSteps.length;f++){const a=homeSteps[f-1],b=homeSteps[f],d=b.clone().sub(a),length=Math.hypot(d.x,d.z),steps=Math.ceil(Math.abs(d.y)/.17),angle=Math.atan2(d.x,d.z);
  for(let j=0;j<steps;j++){const q=a.clone().lerp(b,(j+.5)/steps),step=part(homeAccess,'box','#c4baa5',q.x,q.y-.10,q.z,1,.20,length/steps+.04);step.rotation.y=angle;}
  for(const side of[-1,1]){const offset=new T.Vector3(d.z/length*.52*side,.7,-d.x/length*.52*side),aa=a.clone().add(offset),bb=b.clone().add(offset);railBetween(aa,bb,.065,homeAccess);for(const q of[aa,bb])part(homeAccess,'box','#826b50',q.x,q.y-.35,q.z,.075,.8,.075);}
 }
 batchParts(homeAccess);
 batchParts(shared);const farCopy=shared.clone(true);farCopy.traverse(o=>{if(o.isMesh)o.castShadow=false;if(o.name==='dokdo-plants')o.count=Math.min(100,o.count);if(o.name==='dokdo-blooms'||o.name==='dokdo-sedum-blooms')o.count=Math.min(18,o.count);if(o.name==='dokdo-sedum')o.count=Math.min(35,o.count);});farIsland.add(farCopy);farIsland.position.set(39,0,-20);farIsland.scale.setScalar(.42);
 const mist=new T.Group();farIsland.add(mist);const cv=document.createElement('canvas');cv.width=256;cv.height=128;const ctx=cv.getContext('2d');
 for(const [x,y,r]of [[35,80,30],[86,52,39],[139,79,41],[205,47,37],[164,30,24]]){const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(224,235,244,.62)');grad.addColorStop(.5,'rgba(224,235,244,.25)');grad.addColorStop(1,'rgba(224,235,244,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,128);}
 ctx.save();ctx.globalCompositeOperation='destination-in';ctx.scale(2,1);const fade=ctx.createRadialGradient(64,64,24,64,64,64);fade.addColorStop(0,'#fff');fade.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,128,128);ctx.restore();
 const texture=new T.CanvasTexture(cv),mistMat=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.72,depthWrite:false,depthTest:false,side:T.DoubleSide});
 const fogLayers=[[44,18,-15,3,5],[34,15,13,6,-3],[30,12,-4,10,0],[52,14,1,1,-8]].map(([w,h,x,y,z],i)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),mistMat.clone());m.position.set(x,y,z);m.userData.home=m.position.clone();m.userData.density=[.43,.36,.10,.46][i];mist.add(m);return m;});
 // Fine shore foam follows the actual coast, leaving the channel free of random rocks.
 const foamGeo=new T.BufferGeometry(),fp=[];for(const poly of [...outlines,...mappedRocks.filter(r=>r.mapCenter[1]<230).map(r=>r.outline)])for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];for(let k=0;k<2;k++){const u=k/2,v=(k+.65)/2;fp.push(a[0]+(b[0]-a[0])*u,-.58,a[1]+(b[1]-a[1])*u,a[0]+(b[0]-a[0])*v,-.58,a[1]+(b[1]-a[1])*v);}}foamGeo.setAttribute('position',new T.Float32BufferAttribute(fp,3));const foam=new T.LineSegments(foamGeo,new T.LineBasicMaterial({color:'#d8e9de',transparent:true,opacity:.28}));shared.add(foam);farCopy.add(foam.clone());
 const gulls=new T.Group();gulls.name='dokdo-gulls';island.add(gulls);
 const wingMatrix=new T.Matrix4();
 function poseWings(bird,flap){const {wingMesh,wings}=bird.userData;for(const w of wings){const angle=w.side*flap,pivot=w.side*.075;wingMatrix.makeRotationZ(angle);wingMatrix.setPosition(pivot*(1-Math.cos(angle)),-pivot*Math.sin(angle),0);wingMatrix.multiply(w.rest);wingMesh.setMatrixAt(w.index,wingMatrix);}wingMesh.instanceMatrix.needsUpdate=true;}
 for(let i=0;i<5;i++){const bird=new T.Group(),wingParts=[];for(const side of[-1,1]){const wing=part(bird,'sphere','#8f9b9c',side*.19,0,0,.24,.035,.10);wing.rotation.z=side*.18;wingParts.push({part:wing,side});}part(bird,'sphere','#f3f0df',0,0,0,.12,.09,.22);part(bird,'sphere','#f3f0df',0,.055,-.18,.09,.08,.10);part(bird,'cone','#d6a84b',0,.02,-.30,.035,.14,.035).rotation.x=-Math.PI/2;for(const side of[-1,1])wingParts.push({part:part(bird,'sphere','#343e3e',side*.36,-.015,0,.10,.022,.075),side});part(bird,'sphere','#303b3d',0,0,.23,.11,.024,.13);part(bird,'sphere','#f3f0df',0,.003,.32,.11,.025,.035);part(bird,'sphere','#252d2c',0,.02,-.34,.035,.026,.035);part(bird,'sphere','#b95242',0,.02,-.365,.026,.021,.03);for(const side of[-1,1]){part(bird,'sphere','#292d29',side*.075,.08,-.20,.014);part(bird,'sphere','#c4a64d',side*.06,-.10,.03,.012,.13,.012);}const sphereGeo=wingParts[0].part.geometry,spheres=bird.children.filter(m=>m.isMesh&&m.geometry===sphereGeo);
 bird.userData.wings=wingParts.map(({part,side})=>{part.updateMatrix();return{index:spheres.indexOf(part),side,rest:part.matrix.clone()};});
 batchParts(bird);bird.userData.wingMesh=bird.children.find(m=>m.isInstancedMesh&&m.geometry===sphereGeo);bird.userData.wingMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);bird.userData.wingMesh.computeBoundingSphere();bird.userData.wingMesh.boundingSphere.radius+=.35;poseWings(bird,i<3?.08:-.9);bird.scale.setScalar(1.25);bird.userData.species='괭이갈매기';bird.position.set(-5+i*4,4+i%3,-4+i*2);gulls.add(bird);}
 const gangchi=createGangchi();gangchi.g.position.set(9,.27,16);gangchi.g.rotation.y=.4;island.add(gangchi.g);
 part(body,'sphere','#507c83',0,-.1,0,1.1,.45,2.1);part(body,'box','#f4e7cf',0,.45,0,1.9,.5,3.1);part(body,'box','#c8a673',0,1.5,0,2,.15,2.5);part(body,'box','#63959d',0,.94,-.8,1.2,.6,.7);
 const wakeCanvas=document.createElement('canvas');wakeCanvas.width=128;wakeCanvas.height=256;const wc=wakeCanvas.getContext('2d');for(let i=0;i<24;i++){const u=i/24,y=15+u*226,spread=7+u*42;wc.strokeStyle=`rgba(226,242,232,${.22*(1-u)})`;wc.lineWidth=1.5+u*2.2;for(const side of[-1,1]){wc.beginPath();wc.ellipse(64+side*spread+Math.sin(i*1.7)*2,y,2+u*4,3+u*2,side*.5,Math.PI*.15,Math.PI*1.1);wc.stroke();}wc.fillStyle=`rgba(217,236,228,${.10*(1-u)})`;wc.beginPath();wc.ellipse(64+Math.sin(i*2.4)*spread*.45,y,3+u*7,2+u*2,0,0,Math.PI*2);wc.fill();}const wake=new T.Mesh(new T.PlaneGeometry(3.4,4.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(wakeCanvas),transparent:true,depthWrite:false,opacity:.7}));wake.rotation.x=-Math.PI/2;wake.position.set(0,-.39,3.2);boat.add(wake);
 let ready=false,amount=1,last=null,active=false,ferry=null,loading=null;
 function setHarborReady(value,immediate=false){const changed=!!value&&!ready;ready=!!value;if(immediate||!ready)amount=ready?.78:1;mist.visible=amount>0;mistMat.opacity=amount*.72;return changed&&!immediate;}
 function setIsland(value){active=!!value;seaSpace.value.set(active?0:39,active?0:-20,active?1:.42);island.visible=active;farIsland.visible=!active;}
 const perchedHeights=[sampleHeight(-17,1)+.20,sampleHeight(18,0)+.20];
 let lastSeason=-1;function tick(time,reduced){homeAccess.visible=!!world.dokdoHomeBuilt;if(lastSeason!==world.se){lastSeason=world.se;blooms.visible=world.se===3;yellowBlooms.visible=world.se===2;farCopy.traverse(o=>{if(o.name===blooms.name)o.visible=blooms.visible;if(o.name===yellowBlooms.name)o.visible=yellowBlooms.visible;});}const dt=last===null?0:Math.min(.2,Math.max(0,time-last));last=time;seaClock.value=reduced?0:time;if(ready)amount=reduced?.78:Math.max(.78,amount-dt/6);mist.visible=amount>0;fogLayers.forEach((m,i)=>{m.quaternion.copy(world.camera.quaternion);m.material.opacity=amount*m.userData.density;m.position.x=m.userData.home.x+(reduced?0:Math.sin(time*(.07+i*.02)+i)*1.5);m.position.y=m.userData.home.y+(reduced?0:Math.sin(time*.09+i)*.28);});mist.position.x=reduced?0:Math.sin(time*.15)*2.3;mist.position.z=reduced?0:Math.cos(time*.11)*.8;if(active){gangchi.tick(time,reduced);if(reduced)gulls.children.slice(0,3).forEach(g=>poseWings(g,.08));if(!reduced)gulls.children.forEach((g,i)=>{if(i<3){const phase=(time+i*.73)%5,envelope=phase<2.4?Math.sqrt(Math.sin(phase/2.4*Math.PI)):0;poseWings(g,.08+.65*Math.sin(time*8.5+i*2.1)*envelope);const a=time*.10+i*2.1;g.position.set(Math.sin(a)*16,8+i*.8+Math.sin(time*.7+i)*.14,Math.cos(a)*10-4);g.rotation.y=-a-Math.PI/2;g.rotation.z=Math.sin(a)*.08;}else{const x=i===3?-17:18,z=i===3?1:0;g.position.set(x,perchedHeights[i-3],z);g.rotation.y=.5+Math.sin(time*.2+i)*.15;}});}foam.material.opacity=reduced?.055:.055+Math.sin(time*1.2)*.018;if(boat.visible){body.rotation.z=reduced?0:Math.sin(time*1.6)*.018;body.rotation.x=reduced?0:Math.sin(time*.9)*.012;body.position.y=reduced?0:Math.sin(time*1.3)*.025;wake.material.opacity=reduced?.65:.62+Math.sin(time*1.2)*.08;}}
 function loadFerry(){if(loading)return loading;loading=import('./ferry-model.mjs').then(async({loadTripoFerry})=>{ferry=await loadTripoFerry();for(const p of body.children)if(p!==passenger)p.visible=false;body.add(ferry);passenger.position.set(0,-.24,.3);return true;}).catch(()=>{loading=null;return false;});return loading;}
 heightSamples.clear();
 setIsland(false);
 return{group,island,farIsland,mist,boat,passenger,gangchi,setHarborReady,setIsland,tick,loadFerry,dispose(){group.removeFromParent();boat.removeFromParent();}};
}
