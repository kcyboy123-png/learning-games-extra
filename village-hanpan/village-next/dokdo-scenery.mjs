import * as T from '../lib/three.module.min.js';
import {part,createGangchi,batchParts} from './dokdo-models.mjs';
import {dokdoLand} from './dokdo-layout.mjs';
import {coastlines as outlines,coastDistance,dokdoHeight,naturalHeight,deckHeight,walkHeight,trailCells,trailSet,coastalSet,slotCells} from './dokdo-terrain.mjs';
export {dokdoHeight} from './dokdo-terrain.mjs';
import {mappedRocks,namedFeatures} from './dokdo-geography.mjs';
const C=2.4;
export function createIslandScenery(world){
 const group=new T.Group(),island=new T.Group(),farIsland=new T.Group(),boat=new T.Group(),body=new T.Group(),passenger=new T.Group();
 group.name='dokdo-landscape';island.name='dokdo-near';farIsland.name='dokdo-on-horizon';group.add(island,farIsland);world.scene.add(group,boat);boat.add(body);body.add(passenger);boat.visible=false;passenger.position.y=.35;
 const heightSamples=new Map();
 function sampleHeight(x,z){const key=`${x.toFixed(7)},${z.toFixed(7)}`;if(!heightSamples.has(key))heightSamples.set(key,dokdoHeight(x,z));return heightSamples.get(key);}
 const shared=new T.Group();island.add(shared);
 const positions=[],colors=[],uvs=[],norm=new T.Color(),step=.6;
 function vertex(x,z){const y=sampleHeight(x,z);positions.push(x,y,z);uvs.push((x+24)/49,(z+25)/43);const slope=Math.hypot(sampleHeight(x+.15,z)-sampleHeight(x-.15,z),sampleHeight(x,z+.15)-sampleHeight(x,z-.15))/.3;const green=y>1&&slope<1.9&&Math.sin(x*.8+z*.7)+.35*Math.sin(x*2.3-z*1.6)>.05;norm.set(green?'#91a46c':y<.6?'#657e7b':'#bbb5a6');norm.multiplyScalar(.94+.06*Math.sin(x*2.4-z*1.3));colors.push(norm.r,norm.g,norm.b);}
 for(let x=-30;x<30;x+=step)for(let z=-29;z<20;z+=step){if([sampleHeight(x,z),sampleHeight(x+step,z),sampleHeight(x,z+step),sampleHeight(x+step,z+step)].every(h=>h<0))continue;for(const [dx,dz]of[[0,0],[0,1],[1,0],[1,0],[0,1],[1,1]])vertex(x+dx*step,z+dz*step);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();
 // Blend shared-vertex normals: soften grid facets without rounding away the volcanic silhouette.
 const averaged=new Map(),normals=geometry.attributes.normal,keys=[];
 for(let i=0;i<positions.length;i+=3){const key=positions.slice(i,i+3).map(v=>v.toFixed(5)).join(',');keys.push(key);const n=averaged.get(key)||new T.Vector3();n.add(new T.Vector3().fromBufferAttribute(normals,i/3));averaged.set(key,n);}
 for(const n of averaged.values())n.normalize();
 for(let i=0;i<keys.length;i++){const n=new T.Vector3().fromBufferAttribute(normals,i).lerp(averaged.get(keys[i]),.65).normalize();normals.setXYZ(i,n.x,n.y,n.z);}
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
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec3 weights=pow(abs(normalize(rockNormal)),vec3(4.)); weights/=max(.001,weights.x+weights.y+weights.z);
   vec4 stone=texture2D(map,rockPosition.yz*.18)*weights.x+texture2D(map,rockPosition.xz*.18)*weights.y+texture2D(map,rockPosition.xy*.18)*weights.z;
   diffuseColor*=mix(vec4(1.),stone,.53);
   float strata=sin(rockPosition.y*5.4+sin(rockPosition.x*.8+rockPosition.z*.6)*1.1);
   float cliff=1.-smoothstep(.35,.8,abs(normalize(rockNormal).y));
   diffuseColor.rgb*=1.-cliff*.11*smoothstep(.35,.9,strata);
   float mineral=.5+.5*sin(rockPosition.x*.72+rockPosition.z*.48+sin(rockPosition.y*.63));
   float fissure=pow(.5+.5*sin(rockPosition.x*.95+rockPosition.z*.61+sin(rockPosition.y*.9)),12.);
   diffuseColor.rgb*=mix(vec3(.95,.98,1.02),vec3(1.035,1.01,.96),mineral)*(1.-fissure*cliff*.065);
   diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.65,.78,.81),1.-smoothstep(-.3,1.1,rockPosition.y));
   #endif`);
 };


 const sea=new T.Mesh(new T.PlaneGeometry(240,240),new T.MeshStandardMaterial({color:'#216b97',roughness:.52,metalness:.04}));sea.rotation.x=-Math.PI/2;sea.position.y=-.65;group.add(sea);
 const coastCanvas=document.createElement('canvas');coastCanvas.width=coastCanvas.height=128;const coastCtx=coastCanvas.getContext('2d'),coastPixels=coastCtx.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const wx=-28+x/127*58,wz=-28+y/127*52,d=Math.min(...outlines.map(p=>coastDistance(p,wx,wz))),v=Math.round(Math.max(0,1-d/3.6)*255),i=(y*128+x)*4;coastPixels.data[i]=coastPixels.data[i+1]=coastPixels.data[i+2]=v;coastPixels.data[i+3]=255;}coastCtx.putImageData(coastPixels,0,0);const coastMap=new T.CanvasTexture(coastCanvas);coastMap.flipY=false;
 const seaSpace={value:new T.Vector3(39,-20,.42)},seaClock={value:0};sea.material.onBeforeCompile=shader=>{shader.uniforms.seaTime=seaClock;shader.uniforms.seaSpace=seaSpace;shader.uniforms.coastMap={value:coastMap};shader.vertexShader='varying vec3 seaPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nseaPosition=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='uniform float seaTime; uniform vec3 seaSpace; uniform sampler2D coastMap; varying vec3 seaPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 float crossWave=sin(seaPosition.z*.67+seaTime*.28)+sin(seaPosition.x*.39-seaTime*.17);
 vec3 rippleNormal=normalize(vec3(.018*cos(seaPosition.x*1.7+seaPosition.z*2.3+seaTime*.65+crossWave),1.,.018*cos(seaPosition.x*2.9-seaPosition.z*1.8+seaTime*.39+crossWave)));
 normal=normalize(mat3(viewMatrix)*rippleNormal);
 float grazing=pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.22,.40,.46),grazing*.18);`);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float w=sin(seaPosition.x*.72+seaPosition.z*1.14+seaTime*.65+sin(seaPosition.z*.23)*1.7)*.55+sin(seaPosition.x*2.1-seaPosition.z*.45+seaTime*.39+sin(seaPosition.x*.37))*.3+sin(seaPosition.x*.41+seaPosition.z*3.2-seaTime*.3)*.15;
 float broad=.5+.25*sin(seaPosition.x*.13+seaPosition.z*.21+sin(seaPosition.z*.07))+.25*sin(seaPosition.x*.087-seaPosition.z*.16);
 float swell=sin(seaPosition.x*.75+seaPosition.z*.47+seaTime*.52+sin(seaPosition.z*.28)*1.6);
 float smallWave=pow(max(0.,sin(seaPosition.x*2.1+seaPosition.z*1.3+seaTime*.8+sin(seaPosition.z*.9))),20.)*smoothstep(.2,.9,sin(seaPosition.z*1.7-seaPosition.x*.9));
 float crest=pow(max(0.,swell),18.)*smoothstep(.15,.8,sin(seaPosition.x*.31-seaPosition.z*.23));
 vec2 coastUV=((seaPosition.xz-seaSpace.xy)/seaSpace.z-vec2(-28.,-28.))/vec2(58.,52.);
 float insideMap=step(0.,coastUV.x)*step(coastUV.x,1.)*step(0.,coastUV.y)*step(coastUV.y,1.);
 float shore=texture2D(coastMap,clamp(coastUV,0.,1.)).r*insideMap;
 vec2 mainlandDelta=max(abs(seaPosition.xz)-vec2(21.65),vec2(0.));
 float mainlandShore=(1.-smoothstep(.2,5.5,length(mainlandDelta)))*(1.-step(.9,seaSpace.z));
 shore=max(shore,mainlandShore*.82);
 diffuseColor.rgb=mix(vec3(.025,.12,.245),vec3(.09,.43,.39),smoothstep(0.,1.,shore)*.76)*(.86+broad*.20+w*.045);
 float lace=sin(seaPosition.x*7.+sin(seaPosition.z*4.)+seaTime*.4)*sin(seaPosition.z*6.-seaTime*.3);
 float wash=.5+.5*sin(shore*28.-seaTime*.8+sin(seaPosition.x*1.7+seaPosition.z*2.1));
 float foamPatch=smoothstep(-.45,.65,sin(seaPosition.x*1.17+seaPosition.z*.84+sin(seaPosition.z*1.9)));
 float foamBand=smoothstep(.70,.98,shore)*smoothstep(.48,.88,wash)*foamPatch*(.45+.55*smoothstep(-.6,.5,lace));
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.68,.84,.81),foamBand*.34);
 float glintWave=sin(seaPosition.x*4.6+seaPosition.z*7.1+seaTime*.72+sin(seaPosition.x*1.83+seaPosition.z*.79)*3.4+sin(seaPosition.z*2.7-seaPosition.x*.4)*2.);
 float glintCross=sin(seaPosition.x*1.4-seaPosition.z*2.3-seaTime*.38+sin(seaPosition.x*.6+seaPosition.z*.9)*2.);
 float sunPath=exp(-pow((seaPosition.x+seaPosition.z*.58-9.)/16.,2.));
 float glint=pow(max(0.,glintWave),28.)*smoothstep(.40,.92,glintCross)*(.10+.90*sunPath)*smoothstep(.10,.75,sin(seaPosition.x*.31+sin(seaPosition.z*.23))*sin(seaPosition.z*.47-seaPosition.x*.13));
 glint*=smoothstep(.15,.85,sin(seaPosition.x*5.7-seaPosition.z*4.9+seaTime*.22));
 diffuseColor.rgb+=vec3(.27,.26,.21)*glint*(1.-shore*.65);
 float fleck=pow(max(0.,sin(seaPosition.x*5.1+seaPosition.z*3.7+seaTime*.3+sin(seaPosition.z*1.8))*sin(seaPosition.z*6.4-seaPosition.x*2.8+seaTime*.2+sin(seaPosition.x*1.3))),12.);
 diffuseColor.rgb+=vec3(.045,.055,.05)*fleck*shore*smoothstep(.25,.85,broad);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.34,.40),(crest*.10+smallWave*.045)*(1.-shore));`);};

 // Each outline is traced from the published KIOST map, not a random ring of rocks.
 const dummy=new T.Object3D(),rockVertices=[];
 for(const rock of mappedRocks){const poly=rock.outline.map(p=>[...p]);let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a[0]*b[1]-b[0]*a[1];}if(area<0)poly.reverse();const cx=poly.reduce((n,p)=>n+p[0],0)/poly.length,cz=poly.reduce((n,p)=>n+p[1],0)/poly.length;
  // MOFA photo: one broad sea stack with three cave mouths, not three separate rocks.
  if(Math.hypot(rock.mapCenter[0]-474.4,rock.mapCenter[1]-377.6)<2){
   const rx=Math.max(...poly.map(p=>Math.abs(p[0]-cx))),rz=Math.max(...poly.map(p=>Math.abs(p[1]-cz))),bottom=[],top=[];
   for(let i=0;i<24;i++){const a=i*Math.PI/12;let opening=0;for(let k=0;k<3;k++){const d=Math.atan2(Math.sin(a-k*Math.PI*2/3),Math.cos(a-k*Math.PI*2/3));opening=Math.max(opening,1.8*Math.sqrt(Math.max(0,1-(d/.42)**2)));}bottom.push([cx+Math.cos(a)*rx,-.7+opening,cz+Math.sin(a)*rz]);top.push([cx+Math.cos(a)*rx*.38,3.5+.9*Math.cos(a+.6),cz+Math.sin(a)*rz*.38]);}
   for(let i=0;i<24;i++){const j=(i+1)%24;rockVertices.push(...bottom[i],...top[i],...bottom[j],...bottom[j],...top[i],...top[j],...top[i],cx,4.4,cz,...top[j]);}continue;
  }
  const radius=Math.max(...poly.map(p=>Math.hypot(p[0]-cx,p[1]-cz))),height=Math.max(.22,Math.min(3.2,radius*.85));
  const candle=Math.hypot(rock.mapCenter[0]-468.2,rock.mapCenter[1]-471.7)<2;
  const rim=poly.map(([x,z])=>[cx+(x-cx)*(candle?.30:.72),(candle?3.1:height)*(.83+.17*Math.sin(x*1.3+z)),cz+(z-cz)*(candle?.30:.72)]);
  for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length,a=[poly[i][0],-.7,poly[i][1]],b=[poly[j][0],-.7,poly[j][1]];rockVertices.push(...a,...rim[i],...b,...b,...rim[i],...rim[j]);}
  for(const [a,b,c]of T.ShapeUtils.triangulateShape(poly.map(p=>new T.Vector2(...p)),[]))rockVertices.push(...rim[c],...rim[b],...rim[a],poly[a][0],-.7,poly[a][1],poly[b][0],-.7,poly[b][1],poly[c][0],-.7,poly[c][1]);
 }
 // The Elephant Rock is a coastal sea arch on southern Seodo, never a detached elephant statue.
 for(const name of ['코끼리바위','독립문바위']){const site=namedFeatures.find(f=>f.name===name);
  const curve=new T.CatmullRomCurve3([new T.Vector3(-1.2,-.5,0),new T.Vector3(-1.1,1.7,0),new T.Vector3(0,2.7,0),new T.Vector3(1,1.7,0),new T.Vector3(1.2,-.5,0)]);
  const indexed=new T.TubeGeometry(curve,12,.45,5,false),arch=indexed.toNonIndexed();arch.translate(site.position[0],0,site.position[1]);rockVertices.push(...arch.attributes.position.array);indexed.dispose();arch.dispose();
 }
 const rockGeo=new T.BufferGeometry();rockGeo.setAttribute('position',new T.Float32BufferAttribute(rockVertices,3));rockGeo.computeVertexNormals();
 const rockColors=[];for(let i=0;i<rockVertices.length;i+=3){norm.set(rockVertices[i+1]<.4?'#7e9690':'#b5b2a6');norm.multiplyScalar(.94+.06*Math.sin(rockVertices[i]*2+rockVertices[i+2]));rockColors.push(norm.r,norm.g,norm.b);}rockGeo.setAttribute('color',new T.Float32BufferAttribute(rockColors,3));
 const rocks=new T.Mesh(rockGeo,terrain.material);rocks.name='dokdo-map-rocks';rocks.userData.mappedOutlines=mappedRocks.length;shared.add(rocks);
 // Haeguk ray florets, fleshy Sedum rosettes: instancing retains the previous two draws.
 function rosette(flower){const v=[],c=[],col=new T.Color();
  const triangle=(a,b,d,color)=>{v.push(...a,...b,...d);col.set(color);for(let i=0;i<3;i++)c.push(col.r,col.g,col.b);};
  const n=flower?10:6;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,w=flower?.24:.30,r=flower?.76:1,h=flower?.18:.35;
   const left=[Math.cos(a-w)*.35,0,Math.sin(a-w)*.35],right=[Math.cos(a+w)*.35,0,Math.sin(a+w)*.35],tip=[Math.cos(a)*r,h,Math.sin(a)*r];
   if(flower){const shoulderL=[Math.cos(a-w)*.64,.13,Math.sin(a-w)*.64],shoulderR=[Math.cos(a+w)*.64,.13,Math.sin(a+w)*.64];triangle([0,.1,0],shoulderL,tip,'#fff6ff');triangle([0,.1,0],tip,shoulderR,'#eadcf1');triangle(left,shoulderL,[0,.1,0],'#dbcae4');triangle([0,.1,0],shoulderR,right,'#eee2f4');}
   else{triangle([0,.1,0],left,tip,'#c1d9a0');triangle([0,.1,0],tip,right,'#77945b');}
   if(flower)triangle([0,.16,0],[Math.cos(a)*.27,.15,Math.sin(a)*.27],[Math.cos(a+Math.PI*2/n)*.27,.15,Math.sin(a+Math.PI*2/n)*.27],'#e5b94f');
  }const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;
 }
 const plants=new T.InstancedMesh(rosette(false),new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}),600),blooms=new T.InstancedMesh(rosette(true),new T.MeshStandardMaterial({vertexColors:true,roughness:.9,side:T.DoubleSide}),240);plants.name='dokdo-plants';blooms.name='dokdo-blooms';shared.add(plants,blooms);
 plants.userData.species=['섬기린초','땅채송화'];blooms.userData.species=['해국','섬기린초'];
 let pi=0,fi=0;const flowerColor=new T.Color();for(let i=0;i<3000&&pi<600;i++){const x=-22+rand()*45,z=-23+rand()*39,y=sampleHeight(x,z);if(trailSet.has(`${Math.round(x/C+8.5)},${Math.round(z/C+8.5)}`)||y<.8||y>14||Math.abs(sampleHeight(x+.2,z)-sampleHeight(x-.2,z))>.7||Math.abs(sampleHeight(x,z+.2)-sampleHeight(x,z-.2))>.7)continue;dummy.position.set(x,y+.08,z);dummy.scale.set(.28+i%3*.07,.42,.30+i%4*.04);dummy.rotation.set(0,i,0);dummy.updateMatrix();plants.setMatrixAt(pi++,dummy.matrix);if(fi<240&&i%3===0){dummy.position.y=y+.22;dummy.scale.set(.48+i%3*.04,.48,.48+i%3*.04);dummy.updateMatrix();blooms.setMatrixAt(fi,dummy.matrix);blooms.setColorAt(fi++,flowerColor.set(i%2?'#ddb5f2':'#ffe095'));}}plants.count=pi;blooms.count=fi;
 // Fixed lighthouse on Dongdo ridge. Its silhouette remains readable from the main town.
 const lx=19,lz=7,ly=sampleHeight(lx,lz);part(shared,'cylinder','#e7e3d3',lx,ly+1.45,lz,.43,2.9,.43);part(shared,'cylinder','#b7c9c7',lx,ly+3,lz,.58,.45,.58);part(shared,'cone','#536e70',lx,ly+3.42,lz,.68,.42);part(shared,'sphere','#ffe5a1',lx,ly+3.05,lz,.35,.16,.35);
 function railBetween(a,b){const d=new T.Vector3().subVectors(b,a),m=part(shared,'box','#9b8262',...(a.clone().add(b).multiplyScalar(.5).toArray()),.065,d.length(),.065);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 // Narrow permanent trails use the exact same height samples as walking and selection.
 for(const [gx,gy] of new Map(trailCells.map(p=>[p.join(','),p])).values()){
  const x=(gx-8.5)*C,z=(gy-8.5)*C,h=deckHeight(gx,gy);
  for(let plank=0;plank<6;plank++)part(shared,'box',coastalSet.has(`${gx},${gy}`)?(plank%2?'#cbb58d':'#d1bb94'):(plank%2?'#dcc9a4':'#e1d0ad'),x,h-.08,z+(plank-2.5)*.34,2.04,.16,.322);
  if(coastalSet.has(`${gx},${gy}`))for(const side of[-1,1]){const base=Math.max(-.95,naturalHeight(x+side*.78,z)),postHeight=Math.max(.15,h-base);part(shared,'box','#7f7563',x+side*.78,base+postHeight/2,z,.13,postHeight,.13);}

  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])if(!trailSet.has(`${gx+dx},${gy+dz}`)&&!(gx===6&&gy===9&&dz===-1)&&!(gx===14&&gy===12&&dz===1)){
   railBetween(new T.Vector3(x+dx*1.02-dz*1.02,h+.7,z+dz*1.02-dx*1.02),new T.Vector3(x+dx*1.02+dz*1.02,h+.7,z+dz*1.02+dx*1.02));
  }
  for(const [dx,dz]of [[1,0],[0,1]])if(trailSet.has(`${gx+dx},${gy+dz}`)){
   const h2=deckHeight(gx+dx,gy+dz),steps=Math.max(8,Math.ceil(Math.abs(h2-h)/.18));
   for(let j=0;j<steps;j++){const u=(j+.5)/steps,px=x+dx*C*u,pz=z+dz*C*u,py=walkHeight(px,pz);part(shared,'box','#e9d8b1',px,py-.07,pz,dx?C/steps+.035:1.9,.14,dz?C/steps+.035:1.9);}
   for(const side of [-1,1]){
    const start=trailSet.has(`${gx+dz*side},${gy+dx*side}`)?.43:0,end=trailSet.has(`${gx+dx+dz*side},${gy+dz+dx*side}`)?.57:1;
    const us=[start,...[.2,.8].filter(u=>u>start&&u<end),end];
    const points=us.map(u=>new T.Vector3(x+dx*C*u+dz*side*1.02,walkHeight(x+dx*C*u,z+dz*C*u)+.7,z+dz*C*u+dx*side*1.02));
    for(let i=0;i<points.length;i++){const q=points[i];part(shared,'box','#826b50',q.x,q.y-.34,q.z,.075,.8,.075);if(i)railBetween(points[i-1],q);}
   }
  }
 }
 const pier=new T.Group();shared.add(pier);pier.position.x=-5;part(pier,'box','#c4bca7',14,.05,16,2.2,.4,5);part(pier,'box','#c4bca7',13,.05,18.2,4.2,.4,1.25);
 for(const x of[12,14.9])for(const z of[17.8,18.6])part(pier,'cylinder','#737e79',x,.45,z,.07,.65,.07);
 for(let j=0;j<24;j++){const u=(j+.5)/24;part(shared,'box','#bda785',13.2-4.2*u,deckHeight(14,12)*(1-u)+.25*u-.07,8.4+5.5*u,1,.14,.27);}
 // A short switchback joins the existing home terrace to the actual trail, not an obsolete sea-level landing.
 const homeSteps=[new T.Vector3(-6,deckHeight(6,8),-1.2),new T.Vector3(-4.4,(deckHeight(6,8)+deckHeight(6,9))/2,0),new T.Vector3(-6,deckHeight(6,9),1.2)];
 for(let f=1;f<homeSteps.length;f++){const a=homeSteps[f-1],b=homeSteps[f],d=b.clone().sub(a),length=Math.hypot(d.x,d.z),steps=Math.ceil(Math.abs(d.y)/.17),angle=Math.atan2(d.x,d.z);
  for(let j=0;j<steps;j++){const q=a.clone().lerp(b,(j+.5)/steps),step=part(shared,'box','#c4baa5',q.x,q.y-.10,q.z,1,.20,length/steps+.04);step.rotation.y=angle;}
  for(const side of[-1,1]){const offset=new T.Vector3(d.z/length*.52*side,.7,-d.x/length*.52*side),aa=a.clone().add(offset),bb=b.clone().add(offset);railBetween(aa,bb);for(const q of[aa,bb])part(shared,'box','#826b50',q.x,q.y-.35,q.z,.075,.8,.075);}
 }
 batchParts(shared);const farCopy=shared.clone(true);farCopy.traverse(o=>{if(o.isMesh)o.castShadow=false;if(o.name==='dokdo-plants')o.count=Math.min(100,o.count);if(o.name==='dokdo-blooms')o.count=Math.min(40,o.count);});farIsland.add(farCopy);farIsland.position.set(39,0,-20);farIsland.scale.setScalar(.42);
 const mist=new T.Group();farIsland.add(mist);const cv=document.createElement('canvas');cv.width=256;cv.height=128;const ctx=cv.getContext('2d');
 for(const [x,y,r]of [[45,75,48],[95,60,58],[140,76,65],[200,65,50],[125,35,36]]){const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,'rgba(224,235,244,.75)');grad.addColorStop(.5,'rgba(224,235,244,.42)');grad.addColorStop(1,'rgba(224,235,244,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,128);}
 ctx.save();ctx.globalCompositeOperation='destination-in';ctx.scale(2,1);const fade=ctx.createRadialGradient(64,64,24,64,64,64);fade.addColorStop(0,'#fff');fade.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=fade;ctx.fillRect(0,0,128,128);ctx.restore();
 const texture=new T.CanvasTexture(cv),mistMat=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide});
 const cloud=new T.Mesh(new T.PlaneGeometry(70,30),mistMat);cloud.position.y=5;mist.add(cloud);const veil=new T.Mesh(new T.PlaneGeometry(62,17),mistMat);veil.position.set(3,10,-3);mist.add(veil);
 // Fine shore foam follows the actual coast, leaving the channel free of random rocks.
 const foamGeo=new T.BufferGeometry(),fp=[];for(const poly of outlines)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];for(let k=0;k<2;k++){const u=k/2,v=(k+.65)/2;fp.push(a[0]+(b[0]-a[0])*u,-.58,a[1]+(b[1]-a[1])*u,a[0]+(b[0]-a[0])*v,-.58,a[1]+(b[1]-a[1])*v);}}foamGeo.setAttribute('position',new T.Float32BufferAttribute(fp,3));const foam=new T.LineSegments(foamGeo,new T.LineBasicMaterial({color:'#d8e9de',transparent:true,opacity:.28}));shared.add(foam);farCopy.add(foam.clone());
 const gulls=new T.Group();island.add(gulls);for(let i=0;i<5;i++){const bird=new T.Group();for(const side of[-1,1]){const wing=part(bird,'sphere','#f4f0df',side*.19,0,0,.24,.035,.10);wing.rotation.z=side*.18;}part(bird,'sphere','#f3f0df',0,0,0,.12,.09,.22);part(bird,'sphere','#f3f0df',0,.055,-.18,.09,.08,.10);part(bird,'cone','#d6a84b',0,.02,-.30,.035,.14,.035).rotation.x=-Math.PI/2;for(const side of[-1,1])part(bird,'sphere','#343e3e',side*.36,-.015,0,.10,.022,.075);batchParts(bird);bird.userData.species='괭이갈매기';bird.position.set(-5+i*4,4+i%3,-4+i*2);gulls.add(bird);}
 const gangchi=createGangchi();gangchi.g.position.set(9,.27,16);gangchi.g.rotation.y=.4;island.add(gangchi.g);
 part(body,'sphere','#507c83',0,-.1,0,1.1,.45,2.1);part(body,'box','#f4e7cf',0,.45,0,1.9,.5,3.1);part(body,'box','#c8a673',0,1.5,0,2,.15,2.5);part(body,'box','#63959d',0,.94,-.8,1.2,.6,.7);
 const wakeCanvas=document.createElement('canvas');wakeCanvas.width=128;wakeCanvas.height=256;const wc=wakeCanvas.getContext('2d');for(let i=0;i<24;i++){const u=i/24,y=15+u*226,spread=7+u*42;wc.strokeStyle=`rgba(226,242,232,${.22*(1-u)})`;wc.lineWidth=1.5+u*2.2;for(const side of[-1,1]){wc.beginPath();wc.ellipse(64+side*spread+Math.sin(i*1.7)*2,y,2+u*4,3+u*2,side*.5,Math.PI*.15,Math.PI*1.1);wc.stroke();}wc.fillStyle=`rgba(217,236,228,${.10*(1-u)})`;wc.beginPath();wc.ellipse(64+Math.sin(i*2.4)*spread*.45,y,3+u*7,2+u*2,0,0,Math.PI*2);wc.fill();}const wake=new T.Mesh(new T.PlaneGeometry(3.4,4.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(wakeCanvas),transparent:true,depthWrite:false,opacity:.7}));wake.rotation.x=-Math.PI/2;wake.position.set(0,-.39,3.2);boat.add(wake);
 let ready=false,amount=1,last=null,active=false,ferry=null,loading=null;
 function setHarborReady(value,immediate=false){const changed=!!value&&!ready;ready=!!value;if(immediate||!ready)amount=ready?.48:1;mist.visible=amount>0;mistMat.opacity=amount*.72;return changed&&!immediate;}
 function setIsland(value){active=!!value;seaSpace.value.set(active?0:39,active?0:-20,active?1:.42);island.visible=active;farIsland.visible=!active;}
 function tick(time,reduced){const dt=last===null?0:Math.min(.2,Math.max(0,time-last));last=time;seaClock.value=reduced?0:time;if(ready)amount=reduced?.48:Math.max(.48,amount-dt/6);mistMat.opacity=amount*.72;mist.visible=amount>0;cloud.quaternion.copy(world.camera.quaternion);veil.quaternion.copy(world.camera.quaternion);mist.position.x=reduced?0:Math.sin(time*.15)*2.3;mist.position.z=reduced?0:Math.cos(time*.11)*.8;if(active){gangchi.tick(time,reduced);if(!reduced)gulls.children.forEach((g,i)=>{g.position.x=-5+i*4+Math.sin(time*.12+i)*3;g.position.y=4+i%3+Math.sin(time*.8+i)*.12;});}foam.material.opacity=reduced?.15:.15+Math.sin(time*1.2)*.04;if(boat.visible){body.rotation.z=reduced?0:Math.sin(time*1.6)*.018;body.rotation.x=reduced?0:Math.sin(time*.9)*.012;body.position.y=reduced?0:Math.sin(time*1.3)*.025;wake.material.opacity=reduced?.65:.62+Math.sin(time*1.2)*.08;}}
 function loadFerry(){if(loading)return loading;loading=import('./ferry-model.mjs').then(async({loadTripoFerry})=>{ferry=await loadTripoFerry();for(const p of body.children)if(p!==passenger)p.visible=false;body.add(ferry);passenger.position.set(0,-.24,.3);return true;}).catch(()=>{loading=null;return false;});return loading;}
 heightSamples.clear();
 setIsland(false);
 return{group,island,farIsland,mist,boat,passenger,gangchi,setHarborReady,setIsland,tick,loadFerry,dispose(){group.removeFromParent();boat.removeFromParent();}};
}
