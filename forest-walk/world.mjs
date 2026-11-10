import {loadLandscapePlants} from './landscape-plants.mjs';
import {createWildlife} from './wildlife.mjs?v=cowork2-20261108';
import {createAtmosphere} from './atmosphere.mjs?v=refine10b-20261110';
import * as T from './vendor/three.module.js';
import {createWaymarkers} from './waymarkers.mjs?v=wayfinding23-20261110';
import {footStep,STRIDE} from './lib/gait.mjs?v=teacher-motion10-20261110';
import {surfaceTexture,foliageGeometry,mossRockGeometry,fernGeometry,grassGeometry,broadleafGeometry,creekFoamGeometry,floatingLeafGeometry,characterGeometry,forestMaterials,woodlandTree,contactTexture,stoneStepGeometry,cascadeGeometry,squirrelTailGeometry} from './art.mjs?v=leaf-reflect10-20261110';
import {pathX,pathSlope,elevation,grade,riverX,terrain,outcrop,browRim,worldAt,clamp,forkGap,halfWidth,BRIDGE,RIVER,FORK,SUMMIT,OUTCROPS,LENGTH,SCENIC,seats,stops} from './trail.mjs?v=forest-full-qa-20261107';
import {loadFern} from './fern-prop.mjs?v=cowork2-20261108';
import {createBridge,batchBridgeParts} from './bridge.mjs?v=leaf-reflect10-20261110';
import {createMotion,setRoutine,stepMotion,placeMotion,holdAt,friendRoutines,yawBetween,worldXZ} from './lib/npcmotion.mjs?v=forest-full-qa-20261107';
import {ANIMALS,ENCOUNTER_SITES,picnicLayout,NOODLE_SPOT} from './lib/life.mjs?v=leaf-reflect10-20261110';
// npc.mjs (parent-owned Tripo teacher/friend models) is optional: if it or its assets are missing, the procedural createChild
// characters below stay. Loaded lazily so a broken/missing module can never stop the world from opening.
const npcModule=import('./npc.mjs?v=final13-20261110').catch(()=>null);
// Tripo rigs know 'greet' (raised, waving hand) but not the procedural 'wave'; everything else passes through unchanged.
export const actorActivity=(actor,activity)=>activity==='wave'&&actor?.root?.name?.startsWith('tripo')?'greet':activity;
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.94,envMapIntensity:.22,...extra});
const cloth=color=>new T.MeshPhysicalMaterial({color,roughness:.95,envMapIntensity:.18,sheen:.16,sheenColor:'#e6d2a1',sheenRoughness:.9});
// Albedo detail stays subtle beneath the storybook palette, avoiding dark double-tinting.
function softenMap(material,strength){material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
  vec4 sampledDiffuseColor=texture2D(map,vMapUv);
  diffuseColor*=mix(vec4(1.0),sampledDiffuseColor,${strength.toFixed(2)});
#endif`);};material.customProgramCacheKey=()=>`soft-map-${strength}`;return material;}
// Grain remains in world space so differently sized rocks keep a consistent texture scale.
function mineralDetail(material,moss){
  const previous=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.customProgramCacheKey=()=>key+'-mineral-v2';
  material.onBeforeCompile=shader=>{
    previous(shader);shader.uniforms.uMoss={value:moss};
    shader.fragmentShader=shader.fragmentShader.replace('texture2D(map,vMapUv)','texture2D(map,mix(vec2(vMineral.x+vMineral.z*.37,vMineral.y),vMineral.xz,smoothstep(.45,.85,abs(vStoneTop)))*.8)');
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMineral; varying float vStoneTop;').replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 mineralPosition=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        mineralPosition=instanceMatrix*mineralPosition;
      #endif
      vMineral=(modelMatrix*mineralPosition).xyz;vStoneTop=normal.y;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMineral; varying float vStoneTop; uniform sampler2D uMoss;').replace('#include <color_fragment>',`#include <color_fragment>
      float grain=sin(vMineral.x*49.+sin(vMineral.z*37.)*3.)*sin(vMineral.y*57.+vMineral.z*41.);
      float fissure=pow(1.-abs(sin(vMineral.x*3.3+vMineral.y*8.+sin(vMineral.z*4.)*1.6)),20.);
      float mottling=sin(vMineral.x*6.1+sin(vMineral.z*4.3))*sin(vMineral.y*7.2-vMineral.z*3.7);
      float grainFade=1.-smoothstep(.5,1.7,max(fwidth(vMineral.x*49.),fwidth(vMineral.z*57.)));
      float crackFade=1.-smoothstep(.25,1.,fwidth(vMineral.x*3.3+vMineral.y*8.+vMineral.z*4.));
      diffuseColor.rgb*=.91+grain*.045*grainFade-fissure*.085*crackFade+mottling*.09;
      float cover=smoothstep(.16,.72,vStoneTop)*smoothstep(-.38,.50,sin(vMineral.x*2.1+sin(vMineral.z*1.7))*sin(vMineral.z*2.4)+mottling*.24);
      vec3 mossColor=texture2D(uMoss,vMineral.xz*1.25).rgb;
      mossColor=mix(vec3(.12,.18,.075),mossColor*vec3(.64,.78,.40),.62);
      diffuseColor.rgb=mix(diffuseColor.rgb,mossColor,cover*.61);
    `);
  };
}
const sphere=new T.SphereGeometry(1,20,14), box=new T.BoxGeometry(1,1,1), cylinder=new T.CylinderGeometry(1,1,1,12), cone=new T.ConeGeometry(1,1,9);
const contactPlane=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
const beanieCuff=new T.TorusGeometry(1,.09,8,28).rotateX(Math.PI/2);
const shirtShape=characterGeometry.shirt;
const roundedShape=new T.Shape();roundedShape.moveTo(-.32,-.5);roundedShape.lineTo(.32,-.5);roundedShape.quadraticCurveTo(.5,-.5,.5,-.32);roundedShape.lineTo(.5,.32);roundedShape.quadraticCurveTo(.5,.5,.32,.5);roundedShape.lineTo(-.32,.5);roundedShape.quadraticCurveTo(-.5,.5,-.5,.32);roundedShape.lineTo(-.5,-.32);roundedShape.quadraticCurveTo(-.5,-.5,-.32,-.5);
const roundedBox=new T.ExtrudeGeometry(roundedShape,{depth:.7,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.1,bevelThickness:.15,curveSegments:5});roundedBox.translate(0,0,-.35);
const seamPoints=roundedShape.getPoints(5);seamPoints.pop();
const bagSeam=new T.TubeGeometry(new T.CatmullRomCurve3(seamPoints.map(p=>new T.Vector3(p.x*.30,p.y*.37,-.133)),true),56,.0025,6,true);
function part(parent,geo,m,p,s){const o=new T.Mesh(geo,m);o.position.set(...p);o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
let seed=9281;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const smoothstep=(s,a,b)=>T.MathUtils.smoothstep(s,a,b);
// Colour keyframes along the trail: warm sunlit forest, cool creek, deep squirrel forest, ochre ridge, sunset summit.
// Eased (smoothstep) blend between keyframes so light/fog never kink at a key while walking.
const colorKeys=new WeakMap();
function keyed(keys,s,out=[]){let a=keys.at(-1),b=a,t=0;for(let i=1;i<keys.length;i++)if(s<=keys[i][0]){a=keys[i-1];b=keys[i];t=clamp((s-a[0])/(b[0]-a[0]),0,1);t=t*t*(3-2*t);break;}
  for(const row of [a,b])if(!colorKeys.has(row))colorKeys.set(row,row.map(v=>typeof v==='number'?v:new T.Color(v)));
  const ca=colorKeys.get(a),cb=colorKeys.get(b);
  for(let j=0;j<a.length;j++)out[j]=typeof a[j]==='number'?a[j]+(b[j]-a[j])*t:(out[j]||new T.Color()).copy(ca[j]).lerp(cb[j],t);
  return out;
}
const floorKeys=[[0,'#6d825e'],[115,'#889b5c'],[210,'#6a8668'],[300,'#728c5c'],[380,'#677f5e'],[450,'#7a9058'],[475,'#5b7750'],[580,'#87956f'],[712,'#a99f6c'],[722,'#a99f6c'],[732,'#7f905e'],[760,'#6f8456']];
// A brief lighter keyframe at 450 (glade in the squirrel forest) breaks the long shelter→squirrel climb before the deep forest at 475.
// [s, fog colour, fog density, sun colour, sun intensity, hemisphere sky, hemisphere ground, hemisphere intensity, fill colour, fill intensity, shade tint]
// Sun peak lowered (5.1→4.6) and hemisphere bounce raised with a green/ochre floor colour so shaded undergrowth and skin keep
// detail without raising exposure; fog is tinted per section (warm gold-green forest, soft teal creek, airy blue-grey ridge)
// instead of near-white. Shade tint drives the contact shadows so grounding matches each section's ambient.
export const moods=[
  [0,'#cfd8c4',.0082,'#ffe6bc',3.8,'#d6e2d8','#978d69',1.45,'#dfe6e3',1.0,'#3b4636'],
  [115,'#c8d2bd',.0108,'#ffebc5',4.0,'#dbe5d5','#a09470',1.54,'#dfe5db',.98,'#474a30'],
  [210,'#b3cbc4',.0135,'#ffedca',4.05,'#d9e5d7','#7f927c',1.40,'#d1e3e8',.88,'#2e4341'],
  [300,'#cfd9c0',.0082,'#fdebc2',3.9,'#dbe3cf','#858559',1.45,'#e6e6d3',1.0,'#404733'],
  [380,'#c9d6cb',.0088,'#f6ecd2',3.6,'#d5e0d8','#8c947b',1.5,'#dbe6e0',1.05,'#33443f'],
  [450,'#d6dcb8',.0078,'#fff1d5',4.0,'#e0e5c8','#8c895a',1.5,'#ebe6cf',.95,'#454a2e'],
  [475,'#b1c5ba',.0087,'#f3eccf',3.5,'#c9d6c8','#66755a',1.55,'#d2dccf',1.05,'#2f3f33'],
  [580,'#d7e0df',.0038,'#ffe9c5',3.9,'#d9e4ea','#9a9270',1.35,'#dde6ea',1.0,'#4a4a3b'],
  [712,'#e6d9c4',.0036,'#ffd19a',3.6,'#d4dfe6','#948b74',1.3,'#ead9c4',.95,'#4e4538']];
export const moodAt=s=>keyed(moods,s);
function barkTexture(){const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');x.fillStyle='#c8bca2';x.fillRect(0,0,128,256);for(let i=0;i<90;i++){x.strokeStyle=i%2?'#6a5d4940':'#eee3bd40';x.lineWidth=1+rnd()*3;let px=rnd()*128;x.beginPath();x.moveTo(px,0);for(let y=0;y<=256;y+=16){px+=(rnd()-.5)*6;x.lineTo(px,y);}x.stroke();}for(let i=0;i<180;i++){const y=i*1.5; x.strokeStyle=i%3?'#5e40212a':'#fff0b328';x.lineWidth=.5; x.beginPath();x.moveTo(0,y);x.bezierCurveTo(30,y+Math.sin(i)*3,90,y-2,128,y+Math.sin(i*.7)*2);x.stroke();}for(let k=0;k<3;k++)for(let r=2;r<14;r+=2){x.strokeStyle='#5e402165';x.beginPath();x.ellipse(27+k*39,45+k*72,r*1.8,r*.35,.1,0,Math.PI*2);x.stroke();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(1,1);t.colorSpace=T.SRGBColorSpace;return t;}
export async function createWorld(canvas){
  seed=9281;
  const [surfaces,fernProp,gardenPlants]=await Promise.all([forestMaterials(),loadFern(),loadLandscapePlants()]);
  // Optional surface upgrade: keep the original atlas if a download fails.
  // Optional material sets fall back together to the existing atlas.
  async function materialSet(key,name){
    const loaded=await Promise.allSettled(['','-normal','-rough'].map(suffix=>new T.TextureLoader().loadAsync(new URL('./assets/woodland-'+name+suffix+'.webp',import.meta.url).href)));
    if(loaded.some(t=>t.status==='rejected')){for(const t of loaded)if(t.status==='fulfilled')t.value.dispose();return;}
    const [map,normal,rough]=loaded.map(t=>t.value);
    for(const t of [map,normal,rough]){t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;}
    map.colorSpace=T.SRGBColorSpace;surfaces[key].dispose();surfaces[key]=map;surfaces[key+'Normal']=normal;surfaces[key+'Rough']=rough;
  }
  await Promise.all([materialSet('bark','bark'),materialSet('soil','soil'),materialSet('floor','moss')]);
  function softenDistantRelief(material){
    const previous=material.onBeforeCompile,key=material.customProgramCacheKey();
    material.customProgramCacheKey=()=>key+'-distant-relief';
    material.onBeforeCompile=shader=>{previous(shader);
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',T.ShaderChunk.normal_fragment_maps.replace('mapN.xy *= normalScale;','mapN.xy *= normalScale * mix(1.,.18,smoothstep(12.,65.,length(vViewPosition)));'));
    };
  }
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
        vBed=(modelMatrix*bedWorld).xyz;vWet=waterLevel-vBed.y;`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWaterTime; varying vec3 vBed; varying float vWet;').replace('#include <color_fragment>',`#include <color_fragment>
        diffuseColor.rgb*=1.-.13*smoothstep(-.16,.04,vWet);
        if(vWet>.02){
          diffuseColor.rgb*=mix(1.,.73,smoothstep(.02,.28,vWet));
          float bend=sin(vBed.x*11.7+uWaterTime*.9+sin(vBed.z*6.1))+sin(vBed.z*13.3-uWaterTime*.7+vBed.x*2.3);
          float light=smoothstep(.80,.98,1.-abs(sin(bend*1.5)))*(1.-smoothstep(.5,1.5,vWet))*(.25+.75*smoothstep(-.2,.65,sin(vBed.z*2.1-vBed.x*1.7)));
          diffuseColor.rgb+=vec3(.018,.026,.021)*light;
        }`).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          roughnessFactor*=mix(1.,.64,smoothstep(-.10,.08,vWet));`);
    };
  }
  const foliage=await new T.TextureLoader().loadAsync(new URL('./assets/forest-foliage-v2.png',import.meta.url).href);foliage.colorSpace=T.SRGBColorSpace;foliage.anisotropy=8;
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
  const scene=new T.Scene();scene.userData.contactTexture=contactTexture();
  const contactMat=new T.MeshBasicMaterial({map:scene.userData.contactTexture,color:'#253e30',transparent:true,opacity:.36,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  scene.userData.actorContact=contactMat.clone();scene.userData.actorContact.opacity=.32;
  const panorama=await new T.TextureLoader().loadAsync(new URL('./assets/summit-panorama-v4.png',import.meta.url).href);panorama.colorSpace=T.SRGBColorSpace;scene.background=panorama;scene.fog=new T.FogExp2('#d5e0d7',.009);
  const env=panorama.clone();env.mapping=T.EquirectangularReflectionMapping;env.needsUpdate=true;const pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(env).texture;env.dispose();pmrem.dispose();
  const camera=new T.PerspectiveCamera(52,1,.1,520);
  const fill=new T.DirectionalLight('#e3e6d6',1.0);scene.add(fill,fill.target);
  const hemi=new T.HemisphereLight('#d6e2d8','#7f8160',1.45);scene.add(hemi);scene.add(new T.AmbientLight('#fff0d6',.15));
  const sun=new T.DirectionalLight('#ffe0a1',4.3);sun.position.set(-20,28,8);sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<700?1024:2048,innerWidth<700?1024:2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:90});sun.shadow.radius=2.0;sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
  const atmosphere=createAtmosphere(scene);
  const groups=new Map(),dummy=new T.Object3D(),windTime={value:0},gust={value:1};
  function breeze(material,amount=1){material.onBeforeCompile=shader=>{shader.uniforms.uWind=windTime;shader.uniforms.uGust=gust;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWind;uniform float uGust;').replace('#include <begin_vertex>',`#include <begin_vertex>
    vec3 treeBase=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
    float flutter=sin(uWind*1.1+treeBase.x*.7+treeBase.z*.3)*uGust;
    transformed.x+=flutter*${(.035*amount).toFixed(3)}*max(0.,position.y+.8);
    transformed.z+=sin(uWind*.8+treeBase.z)*uGust*${(.02*amount).toFixed(3)}*max(0.,position.y+.8);`);};material.customProgramCacheKey=()=>'breeze-'+amount;}
  const smallLeaf=new T.SphereGeometry(1,6,4);
  const trees=[0,1,2].map(woodlandTree);
  const geos={tree0:trees[0].geometry,tree1:trees[1].geometry,tree2:trees[2].geometry,leaf:foliageGeometry(),rock:mossRockGeometry(),rock1:mossRockGeometry(1),rock2:mossRockGeometry(2),pebble:new T.IcosahedronGeometry(1,1),grass:grassGeometry(),fern:fernGeometry(),shrub:broadleafGeometry(),shrub1:broadleafGeometry(1),petal:smallLeaf,litter:smallLeaf,stem:cylinder};
  if(fernProp)geos.fernDetail=fernProp.geometry;Object.assign(geos,gardenPlants);
  const CHUNK=40;
  function instance(kind,color,x,y,z,sx,sy,sz,ry=0,rz=0){if(kind==='rock'){const variant=Math.abs(Math.floor(x*7+z*3))%3;if(variant)kind='rock'+variant;}const key=kind+':'+Math.floor(-z/CHUNK);if(!groups.has(key))groups.set(key,{kind,items:[]});groups.get(key).items.push({color,x,y,z,sx,sy,sz,ry,rz});}
  const nearRiver=(x,s,w)=>s>RIVER.start-20&&s<RIVER.end+6&&Math.abs(x-riverX(s))<w;
  const onBridge=s=>s>BRIDGE.from-1.2&&s<BRIDGE.to+1.2;
  const onDeck=(x,s)=>s>SUMMIT.from&&Math.abs(x-pathX(s))<5.2;
  // Small sunlit glades beside the long climbs (shelter exit, squirrel forest twice): no trees or tall shrubs, lighter ground,
  // white flowers and a leaf pile on the trail. [s, side, inner offset, outer offset]
  const glades=[[405,1,2.4,8],[450,-1,2.4,8],[497,1,2.4,8]];
  const inGlade=(x,s)=>glades.some(([gs,side,a,b])=>{const d=(x-pathX(s))*side;return Math.abs(s-gs)<7&&d>a&&d<b;});
  const col=new T.Color();
  // Terrain: 140 m wide, from before the gate to the drop beyond the summit platform.
  const landLength=LENGTH+90,land=new T.PlaneGeometry(140,landLength,112,Math.round(landLength/1.5));land.rotateX(-Math.PI/2);land.translate(0,0,-(landLength/2-35));const ps=land.attributes.position,colors=[];
  // Ridge/summit mountain side and the brow beyond the rail: steeper ground turns to scree/rock colour, outcrops read as bare
  // stone and dry-grass patches wander at ~5 m scale, so the slope is no longer one flat green tint from the trail to the crest.
  const loam=new T.Color('#756e52'),gladeTint=new T.Color('#a7b468'),scree=new T.Color('#a6a28a'),stone=new T.Color('#9d9b90'),dryGrass=new T.Color('#b6b078');
  const browGreen=new T.Color('#86985f');
  for(let i=0;i<ps.count;i++){const x=ps.getX(i);let s=-ps.getZ(i);
    // G08: behind the summit rail the mesh rows (1.5 m apart) are no longer straight lines in s: each vertex slides ±.75 m
    // along the trail with x (ramped in from LENGTH+.5, amplitude < row pitch so rows never fold). The brow silhouette seen from
    // the deck is therefore an uneven line instead of one vertex row. Nothing here is walkable; the deck rows (s <= LENGTH) are untouched.
    if(s>LENGTH+.5){s+=clamp((s-LENGTH-.5)/2.5,0,1)*(.45*Math.sin(x*.9+1)+.3*Math.sin(x*2.3+.5));ps.setZ(i,-s);}
    ps.setY(i,terrain(x,s));const d=Math.abs(x-pathX(s)),side=x-pathX(s),beyond=s>LENGTH+.3;col.copy(keyed(floorKeys,s)[1]);if(nearRiver(x,s,2.1))col.set('#768a7b');else if(d<1.95&&!beyond)col.set('#b3a27b');if(d>2.8||beyond)col.lerp(loam,(.5+.5*Math.sin(x*.43+s*.61)*Math.sin(s*.17-x*.53))*(beyond?.09:.52));
    if(s>440&&(side>4||beyond)){const slope=Math.hypot(terrain(x+.7,s)-terrain(x-.7,s),terrain(x,s+.7)-terrain(x,s-.7))/1.4,knob=side>4&&!beyond?outcrop(d,s):0;
      // Beyond the rail: grassy hillside colour grows with the fall (continuous with the valley trees) and scree is kept faint, so the
      // brow is not a brown/grey plate under the railing.
      col.lerp(dryGrass,(.5+.5*Math.sin(x*1.3+s*.9)*Math.sin(s*2.1-x*.7))*.35).lerp(scree,smoothstep(slope,.6,1.3)*(beyond?.18:.5)).lerp(stone,clamp(knob/.9,0,.85));
      if(beyond)col.lerp(browGreen,.34+.40*clamp((elevation(LENGTH)-terrain(x,s))/6,0,1));} // G10: less bare-earth right behind the rail
    if(inGlade(x,s))col.lerp(gladeTint,.55);col.multiplyScalar(.84+.15*Math.sin(x*.4+s*.31)+rnd()*.09);colors.push(col.r,col.g,col.b);}land.setAttribute('color',new T.Float32BufferAttribute(colors,3));land.computeVertexNormals();const turf=surfaces.floor;turf.repeat.set(64,360);for(const t of [surfaces.floorNormal,surfaces.floorRough])if(t)t.repeat.copy(turf.repeat);const ground=new T.Mesh(land,softenMap(mat('#ffffff',{vertexColors:true,map:turf,normalMap:surfaces.floorNormal,normalScale:new T.Vector2(.26,.26),roughnessMap:surfaces.floorRough}),.75));ground.receiveShadow=true;scene.add(ground);
  const floorShader=ground.material.onBeforeCompile;
  ground.material.customProgramCacheKey=()=> 'woodland-floor-patches-v2';
  ground.material.onBeforeCompile=shader=>{floorShader(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vForestFloor;').replace('#include <begin_vertex>','#include <begin_vertex>\nvForestFloor=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vForestFloor;').replace('#include <color_fragment>',`#include <color_fragment>
      float floorPatch=sin(vForestFloor.x*.73+sin(vForestFloor.z*.34))*sin(vForestFloor.z*.57-vForestFloor.x*.21);
      float loam=smoothstep(-.08,.64,floorPatch);
      diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.28,.94,.70),loam*.66);
      vec2 litterCell=floor(vForestFloor.xz*5.);
      float litterSeed=fract(sin(dot(litterCell,vec2(127.1,311.7)))*43758.5453);
      vec2 litterUV=fract(vForestFloor.xz*5.)-.5;
      float litter=(1.-smoothstep(.10,.21,length(litterUV*vec2(1.,2.4))))*step(.86,litterSeed)*loam;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.28,.20,.095),litter*.55);
    `);
  };
  land.setAttribute('waterLevel',new T.Float32BufferAttribute(Array.from({length:ps.count},(_,i)=>{const s=-ps.getZ(i);return nearRiver(ps.getX(i),s,2.5)&&s<RIVER.end-8?elevation(s)-.74:-999;}),1));caustics(ground.material);softenDistantRelief(ground.material);
  function ribbon(center,width,yfun,start,end,steps,material){const v=[],uv=[],ind=[];for(let i=0;i<=steps;i++){const s=start+(end-start)*i/steps;for(const side of [-1,1]){const x=center(s)+side*(width+.24*Math.sin(s*.41)+.13*Math.cos(s*.91));v.push(x,yfun(s,x),-s);uv.push((side+1)/2,i/steps);}}for(let i=0;i<steps;i++){const k=i*2;ind.push(k,k+2,k+1,k+1,k+2,k+3);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();const m=new T.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;}
  const soil=surfaces.soil;soil.repeat.set(1.25,206);for(const t of [surfaces.soilNormal,surfaces.soilRough])if(t)t.repeat.copy(soil.repeat);const pathMat=softenMap(mat('#ffffff',{map:soil,normalMap:surfaces.soilNormal,normalScale:new T.Vector2(.40,.40),roughnessMap:surfaces.soilRough,vertexColors:true,side:T.DoubleSide}),.92);
  // Broad damp patches and foot-worn centre interrupt the uniform soil ribbon.
  const soilShader=pathMat.onBeforeCompile;
  pathMat.customProgramCacheKey=()=> 'trail-damp-patches-v2';
  pathMat.onBeforeCompile=shader=>{soilShader(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vTrailSoil;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTrailSoil=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vTrailSoil;').replace('#include <color_fragment>',`#include <color_fragment>
      float drift=sin(vTrailSoil.x*1.6+sin(vTrailSoil.z*.37))*sin(vTrailSoil.z*.63+vTrailSoil.x*.4);
      float damp=smoothstep(.15,.75,drift);
      float grit=sin(vTrailSoil.x*83.+sin(vTrailSoil.z*27.))*sin(vTrailSoil.z*91.);
      float gritFade=1.-smoothstep(.6,2.,max(fwidth(vTrailSoil.x*83.),fwidth(vTrailSoil.z*91.)));
      diffuseColor.rgb*=vec3(1.065,1.005,.91)*(1.-damp*.12+grit*.018*gritFade);
    `);};
  softenDistantRelief(pathMat);
  // Trail surface widens into two lanes at the fork and is cut away over the bridge span and the fork island.
  {const pathV=[],pathUV=[],pathC=[],pathI=[],COLS=14,ROWS=Math.round((LENGTH+6)/.35);const vergeA=new T.Color('#718264'),vergeB=new T.Color('#8a8a5e'),dampA=new T.Color('#d8c49c'),dampB=new T.Color('#cfc09a');
    for(let i=0;i<=ROWS;i++){const s=-5+i*(LENGTH+6)/ROWS,w=1.88+(halfWidth(s)-2.35)*1.3+.10*Math.sin(s*2.2)+.06*Math.sin(s*5.8),gap=forkGap(s);
      // G02: the two outer columns wander in/out by up to ±18 cm and the verge colour blends with a wandering offset, so the
      // trail edge is a ragged line instead of two parallel rules; the walkable middle keeps its light soil colour with only
      // a faint damp/dusty drift (≤.22) at 4~9 m scale. Geometry width/collision are unchanged (visual mesh only).
      for(let j=0;j<=COLS;j++){const u=(j-COLS/2)/(COLS/2),fray=smoothstep(Math.abs(u),.6,1)*(.12*Math.sin(s*1.7+u*3.1)+.06*Math.sin(s*4.3-u*2)),x=pathX(s)+u*(w+fray),edge=smoothstep(Math.abs(u),.65,1);pathV.push(x,T.MathUtils.lerp(elevation(s)+.065,terrain(x,s)+.018,edge),-s);pathUV.push(j/COLS,i/ROWS);
        const verge=.13*Math.sin(s*1.3+u)*Math.cos(s*.47+u*2.3)+.07*Math.sin(s*3.7),drift=.5+.5*Math.sin(s*.23+u*.8)*Math.cos(s*.11+1.3);
        col.set(s>520?'#ded5b7':'#e7d9bc').lerp(s>520?dampB:dampA,drift*.22*(1-smoothstep(Math.abs(u),.5,.9))).lerp(s>520?vergeB:vergeA,smoothstep(Math.abs(u)+verge,.56,.98));col.multiplyScalar(.93+.07*Math.sin(s*.8+j*1.7));pathC.push(col.r,col.g,col.b);
        if(i<ROWS&&j<COLS&&!(s>BRIDGE.from+.8&&s<BRIDGE.to-.8)&&!(gap>0&&Math.abs((j+.5-COLS/2)/(COLS/2)*w)<gap-.1)){const k=i*(COLS+1)+j;pathI.push(k,k+COLS+1,k+1,k+1,k+COLS+1,k+COLS+2);}}}
    const pathGeo=new T.BufferGeometry();pathGeo.setAttribute('position',new T.Float32BufferAttribute(pathV,3));pathGeo.setAttribute('uv',new T.Float32BufferAttribute(pathUV,2));pathGeo.setAttribute('color',new T.Float32BufferAttribute(pathC,3));pathGeo.setIndex(pathI);pathGeo.computeVertexNormals();const pathMesh=new T.Mesh(pathGeo,pathMat);pathMesh.receiveShadow=true;scene.add(pathMesh);}
  // Fork island: a soil-and-grass mound with flowers on the flower-lane side and ferns on the fern-lane side.
  // The mesh carries UVs on the same scale as the ground plane so the shared turf texture is actually visible on it, and its
  // vertex colours wander between soil, grass and gravel instead of running in straight bands. Walkable edges are unchanged.
  // Visual-only breakup of the long mound (G02): the mesh outline bulges/narrows with s, the crest dips into saddles every
  // few metres and colours sit in 3~6 m clusters (moss / grass / bare soil / leaf litter / gravel). terrain(), forkGap() and
  // islandHeight() are untouched, so collision, lane width and the camera clamp are exactly as before.
  {const iv=[],ic=[],iuv=[],ii=[];let rows=0;const COLS=10;const wander=(x,s)=>Math.sin(x*2.3+s*1.1)*Math.cos(s*.7-x*1.7)*.5+Math.sin(x*5.1+s*2.9)*.5;
    const cluster=(x,s)=>Math.sin(s*.31+x*.9)*Math.cos(s*.17-x*.5)+.6*Math.sin(s*.73+x*2.1);
    const soil=new T.Color('#76805b'),soilLight=new T.Color('#9a986e'),gravel=new T.Color('#aea893'),lane=new T.Color('#b3a27b'),moss=new T.Color('#62804a'),litterTint=new T.Color('#9c7d50'),grassL=new T.Color('#7f9450'),grassR=new T.Color('#5d7d47');
    for(let s=FORK.from+.5;s<=FORK.to-.49;s+=.5,rows++){const gap=forkGap(s),bulge=Math.max(0,Math.sin(s*.9)*Math.sin(s*.37+1))*.3*clamp(gap/FORK.gap,0,1);
      for(let j=0;j<=COLS;j++){const u=(j-COLS/2)/(COLS/2),hw=gap+.10+bulge*(u<0?.5+.5*Math.sin(s*.5):.5-.5*Math.sin(s*.5)),x=pathX(s)+u*hw,c=cluster(x,s);
        // Keep the decorative island above the shared terrain so the two meshes cannot cut through one another.
        const y=Math.max(terrain(x,s)+.045,elevation(s)+.08);iv.push(x,y,-s);iuv.push((x+70)/140,s/810);
        const n=wander(x,s),grassPatch=smoothstep(n+Math.abs(u)*.3,-.1,.45)*smoothstep(-c,-.4,.6),edgeMix=smoothstep(Math.abs(u)+n*.14,.72,1.02);
        col.copy(soil).lerp(soilLight,.5+.5*Math.sin(x*3.7+s*1.3)).lerp(u<0?grassL:grassR,grassPatch*.95).lerp(moss,smoothstep(c,.5,1.4)*.7).lerp(litterTint,smoothstep(-c,.4,1.2)*.55).lerp(gravel,Math.max(0,Math.sin(x*7.3+s*4.1)*Math.cos(s*1.9))*.3).lerp(lane,edgeMix*.6);
        col.multiplyScalar(.86+.14*Math.sin(s*2.7+x*3.1)*Math.cos(s*.9));ic.push(col.r,col.g,col.b);}}
    for(let r=0;r<rows-1;r++)for(let j=0;j<COLS;j++){const k=r*(COLS+1)+j;ii.push(k,k+COLS+1,k+1,k+1,k+COLS+1,k+COLS+2);}
    const ig=new T.BufferGeometry();ig.setAttribute('position',new T.Float32BufferAttribute(iv,3));ig.setAttribute('color',new T.Float32BufferAttribute(ic,3));ig.setAttribute('uv',new T.Float32BufferAttribute(iuv,2));ig.setIndex(ii);ig.computeVertexNormals();const island=new T.Mesh(ig,softenMap(mat('#ffffff',{vertexColors:true,side:T.DoubleSide,map:turf,bumpMap:turf,bumpScale:.025}),.35));island.receiveShadow=true;scene.add(island);
    const onIsland=(u,s)=>{const g=forkGap(s);if(g<1)return null;const x=pathX(s)+u*g;return {x,y:Math.max(terrain(x,s),elevation(s)+.08)};};
    // Loose layer in drifts: ~18 litter/gravel pockets (6~12 pieces each) instead of an even sprinkle, so the mound shows
    // bare soil between pockets. The saddle dip is visual only, so sit the pieces a little lower where the crest was lowered.
    const visY=p=>p.y+.025;
    for(let k=0;k<18;k++){const cs=FORK.from+3+rnd()*(FORK.to-FORK.from-6),cu=(rnd()-.5)*1.5,n=6+Math.floor(rnd()*7),leafy=rnd()<.5;
      for(let i=0;i<n;i++){const s=cs+(rnd()-.5)*2.2,u=clamp(cu+(rnd()-.5)*.8,-.96,.96),p=onIsland(u,s);if(!p)continue;const y=Math.max(visY(p,s),elevation(s)+.08);
        if(leafy?i%4===0:i%3)instance('pebble',i%2?'#a89c84':'#c2b69d',p.x,y+.02,-s,.04+rnd()*.07,.02+rnd()*.03,.05+rnd()*.09,rnd()*6);
        else instance('litter',['#b8924f','#9c7a3f','#c9a85a'][i%3],p.x,y+.025,-s,.05+rnd()*.03,.006,.09+rnd()*.04,rnd()*6);}}
    // Grass: half in tufts of 4~7, half scattered; both sit on the visually lowered crest.
    let tuftS=0,tuftU=0;
    for(let i=0;i<110;i++){let s,u;if(i<56){if(i%6===0){tuftS=FORK.from+2+rnd()*(FORK.to-FORK.from-4);tuftU=(rnd()-.5)*1.5;}s=tuftS+(rnd()-.5)*1.4;u=clamp(tuftU+(rnd()-.5)*.6,-.95,.95);}else{s=FORK.from+2+rnd()*(FORK.to-FORK.from-4);u=(rnd()-.5)*1.9;}
      const p=onIsland(u,s);if(!p)continue;instance('grass',i%4?'#9fb665':'#b9c47a',p.x,Math.max(visY(p,s),elevation(s)+.08),-s,.3+rnd()*.3,.35+rnd()*.3,.3+rnd()*.3,rnd()*6);}
    // Flowers in clumps on the flower-lane side, fern clumps on the fern-lane side. Clumps gather around 7 random beds
    // (±3 m jitter) so there are bare stretches of soil between beds rather than one even row of plants.
    const beds=Array.from({length:7},()=>FORK.from+6+rnd()*(FORK.to-FORK.from-12));
    for(let c=0;c<40;c++){const cs=clamp(beds[Math.floor(rnd()*7)]+(rnd()-.5)*6,FORK.from+4,FORK.to-4),cu=(rnd()-.5)*1.3,n=2+Math.floor(rnd()*6),flower=['#f2b9c9','#fff2cf','#d9b8e6','#f7d57a'][c%4];
      for(let i=0;i<n;i++){const s=cs+(rnd()-.5)*1.7,u=clamp(cu+(rnd()-.5)*.5,-.88,.88),p0=onIsland(u,s);if(!p0)continue;const p={x:p0.x,y:Math.max(visY(p0,s),elevation(s)+.08)};
        if(cu<0){const h=.2+rnd()*.2;if(i%2===0)instance('grass','#9fb665',p.x,p.y,-s,.45+rnd()*.3,.5,.45+rnd()*.3,rnd()*6);instance('stem','#5f7f44',p.x,p.y+h/2,-s,.011,h,.011);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;instance('petal',flower,p.x+Math.cos(a)*.08,p.y+h,-s+Math.sin(a)*.08,.08,.03,.055,a);}instance('petal','#e4bb57',p.x,p.y+h+.015,-s,.04,.025,.04);}
        else{const r=.5+rnd()*.5;instance('fern',i%3?'#7fa25a':'#93b068',p.x,p.y,-s,r,r,r,rnd()*6);if(i===0)instance('rock','#aab3a0',p.x+.2,p.y-.05,-s+.2,.3,.2,.3,c);}}}
    // Shrub + stone pairs at irregular spacings and offsets (was every 9 m dead centre), sizes varied so no two read alike.
    for(const [s,off,sc] of [[270,-.35,.8],[279,.4,1.0],[291,-.5,.7],[298,.2,1.05],[309,-.3,.9],[317,.45,.75]]){const x=pathX(s)+off,y=Math.max(terrain(x,s),elevation(s)+.08);instance('shrub','#c9d9a8',x,y,-s,.9*sc,.8*sc,.9*sc,s);instance('rock','#c3c8b4',x-off*1.6,y-.05,-s+.4,.55*sc,.35*sc,.5*sc,s);}}
  const flow=surfaceTexture('water');flow.repeat.set(1.4,72);const waterMat=new T.MeshPhysicalMaterial({color:'#85b9b2',bumpMap:flow,bumpScale:.0045,roughness:.18,metalness:0,envMapIntensity:1.52,clearcoat:.62,clearcoatRoughness:.20,transparent:true,opacity:.88,depthWrite:false,side:T.DoubleSide});
  // shortcut: baked creek surroundings omit moving people and parallax; use live reflection only with a measured GPU budget.
  waterMat.name='creek-reflection-water';
  try{
    const cube=await new T.CubeTextureLoader().loadAsync(['px','nx','py','ny','pz','nz'].map(face=>new URL('./assets/creek-reflection-'+face+'.webp',import.meta.url).href));
    cube.colorSpace=T.SRGBColorSpace;
    const filter=new T.PMREMGenerator(renderer);waterMat.envMap=filter.fromCubemap(cube).texture;cube.dispose();filter.dispose();
  }catch{/* The existing panorama reflection remains available when the optional capture is missing. */}
  const water=ribbon(riverX,2.2,s=>elevation(s)-.74,RIVER.start-5,RIVER.end-6,Math.round((RIVER.end-RIVER.start)*2),waterMat);
  waterMat.onBeforeCompile=shader=>{
    shader.uniforms.uFlow=waterTime;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vStream;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStream=uv;');
    // G04: no more one even field of parallel glints. Along the creek (ckM = metres downstream) pools and runs alternate
    // every ~17 m, a fast thread wanders bank to bank, and a breakup noise decides where ripples appear at all; ripple
    // direction leans with the thread so streaks are not all parallel, and their strength/speed follow the thread. Across
    // the creek the shallow margin turns wet-stone grey-green with a faint darker waterline so the water meets the banks
    // and stones instead of ending in a hard teal edge. No extra sparkle, reflection or lights: same material, same uniforms.
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlow; varying vec2 vStream;').replace('#include <color_fragment>',`#include <color_fragment>
      float ckU=vStream.x*2.-1.,ckM=vStream.y*${((RIVER.end-6)-(RIVER.start-5)).toFixed(1)};
      float ckRun=.5+.5*sin(ckM*.37+sin(ckM*.11)*2.4);
      float ckThread=.45*sin(ckM*.21+sin(ckM*.06)*1.7),ckDist=ckU-ckThread;
      float ckSpeed=.3+.7*max(0.,1.-ckDist*ckDist*1.6),ckStrength=ckSpeed*(.3+.7*ckRun);
      vec2 ckDir=normalize(vec2(.5*cos(ckM*.21+sin(ckM*.06)*1.7)+.3*sin(ckU*2.1+ckM*.5),1.)),ckP=vec2(ckU*1.1,ckM);
      float ckAlong=dot(ckP,ckDir),ckAcross=dot(ckP,vec2(ckDir.y,-ckDir.x));
      float ckBreak=smoothstep(.05,.75,sin(ckU*6.3+ckM*2.1)*sin(ckM*1.3-ckU*2.7)+.3*sin(ckM*4.9+ckU*1.4));
      float ckW=sin(ckAlong*7.5+sin(ckAcross*3.1+ckM*.4)*1.4-uFlow*(1.2+ckSpeed*1.6))*.6+sin(ckAlong*12.+ckAcross*4.5+sin(ckM*.7)*1.5-uFlow*(.9+ckSpeed*1.2))*.4;
      float glintAA=max(.025,fwidth(ckW));
      float ckGlint=smoothstep(.80-glintAA,.98+glintAA,ckW)*ckBreak*ckStrength;
      float ckDepth=(1.-smoothstep(.18,.98,abs(ckU)))*(.68+.32*(1.-ckRun));
      float ckMargin=smoothstep(.55,1.,abs(ckU)),ckLine=smoothstep(.78,.92,abs(ckU))*(1.-smoothstep(.92,1.,abs(ckU)));
      diffuseColor.rgb=mix(vec3(.38,.46,.35),vec3(.055,.32,.35),ckDepth)*(.92+.08*sin(ckM*.9+ckU*2.+sin(ckM*.3)*2.));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.30,.38,.36),ckMargin*.55)*(1.-ckLine*.22);
      diffuseColor.a*=mix(.12,.66,ckDepth)*(1.-smoothstep(.9,1.,abs(ckU))*.45);
      diffuseColor.rgb+=vec3(.20,.26,.24)*ckGlint;`).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(.07+.21*ckStrength+.10*ckMargin,.07,.34);
    `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float ckN=.14+.74*ckStrength;
      normal=normalize(normal+vec3(sin(ckAlong*9.+sin(ckAcross*2.7)*1.5+uFlow*(1.+ckSpeed*1.3))*.014*ckN,cos(ckAcross*5.+ckAlong*3.-uFlow*1.8)*.011*ckN,0.));
      float grazing=pow(1.-max(0.,dot(normal,normalize(vViewPosition))),3.);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.23,.37,.39),grazing*.055*(1.-ckMargin*.5));
      diffuseColor.a=mix(diffuseColor.a,.90,grazing*.72*(1.-ckMargin*.58));`);
  };
  // Broken whitewater follows the creek slope; the clear pool remains visible between crests.
  const riffleMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
    uniforms:{uTime:waterTime},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 q=vec2(vUv.x*14.,vUv.y*240.+uTime*.62);
        float bend=sin(q.x*2.2+q.y*.7)+.45*sin(q.x*5.1-q.y*1.3);
        float streak=sin(q.y*3.+bend*1.5);
        float breakup=sin(q.x*4.7+q.y*1.8)+.5*sin(q.x*9.1-q.y*3.2);
        float crestAA=max(.025,fwidth(streak));
        float crest=smoothstep(.76-crestAA,.98+crestAA,streak)*smoothstep(.0,.75,breakup);
        float bank=smoothstep(0.,.12,vUv.x)*(1.-smoothstep(.88,1.,vUv.x));
        gl_FragColor=vec4(.88,.96,.92,crest*bank*(.08+.16*smoothstep(-.4,.6,bend)));
      }`});
  for(const [start,end] of [[150,175],[196,215],[228,262],[285,318],[340,372],[395,425]])ribbon(riverX,1.9,s=>elevation(s)-.713,start,end,80,riffleMat).renderOrder=2;
  const cascadeMat=new T.MeshPhysicalMaterial({color:'#a3ccc1',roughness:.25,transparent:true,opacity:.94,depthWrite:false,side:T.DoubleSide,envMapIntensity:.35});
  cascadeMat.onBeforeCompile=shader=>{
    shader.uniforms.uFlow=waterTime;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vCascade;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCascade=uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uFlow; varying vec2 vCascade;').replace('#include <color_fragment>',`#include <color_fragment>
      float strand=smoothstep(.12,.88,sin(vCascade.x*77.+sin(vCascade.x*23.)*3.2+sin(vCascade.y*18.-uFlow*7.)*.28));
      float channel=smoothstep(-.65,.35,sin(vCascade.x*20.+.5+sin(vCascade.y*9.)*.16));
      float base=smoothstep(.64,.98,vCascade.y);
      float broken=smoothstep(-.2,.7,sin(vCascade.x*37.+vCascade.y*42.-uFlow*2.)+.5*sin(vCascade.x*91.-vCascade.y*28.));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,1.,.96),min(.9,strand*.78+base*broken*.62));
      diffuseColor.a*=smoothstep(0.,.09,vCascade.x)*(1.-smoothstep(.91,1.,vCascade.x))*(.07+channel*(.14+strand*(.43+broken*.30))+base*broken*.48);`);
  };
  const fallingWater=cascadeGeometry();
  for(const s of [152,165,178,192,201,224,232,241,249,258,270,286,301,316,331,346,356,373,391,406,419,433,444]){
    const drop=elevation(s)-elevation(s-.95)+.16;
    const sheet=new T.Mesh(fallingWater,cascadeMat);sheet.position.set(riverX(s),elevation(s)-.56,-s);sheet.scale.y=drop;sheet.renderOrder=3;scene.add(sheet);
    for(const side of [-1,1])instance('rock','#b4bdb2',riverX(s)+side*1.45,elevation(s)-.94,-s,.7,.43,.55,s);
  }
  // The spring: the creek rises among stones at the top of the shelter valley.
  for(let i=0;i<12;i++){const s=RIVER.end-7+(i%4)*.7,x=riverX(s)-2.6+(i%6)*.95;part(scene,geos.rock,softenMap(mat('#c5ccbe',{vertexColors:true,map:surfaces.stone}),.72),[x,elevation(s)-.72,-s],[.9,.8+(i%3)*.2,1.15]);}
  const ripples=[];const rippleMat=new T.MeshBasicMaterial({color:'#ddfff0',transparent:true,opacity:.09,depthWrite:false,side:T.DoubleSide});
  rippleMat.forceSinglePass=true;
  for(let i=0;i<180;i++){const s=RIVER.start+rnd()*(RIVER.end-RIVER.start-12),x=riverX(s)+(rnd()-.5)*3.6;const o=new T.Mesh(new T.TorusGeometry(.22+rnd()*.4,.012,3,14,Math.PI*(.4+rnd())),rippleMat);o.rotation.x=-Math.PI/2;o.rotation.z=rnd()*6;o.position.set(x,elevation(s)-.71,-s);o.userData={s,phase:rnd()*7};scene.add(o);ripples.push(o);}
  // Clearings keep each stop readable: bird side, creek view, shelter, squirrel approach, lookout and summit deck.
  const clearing=(x,s)=>{const side=x-pathX(s);
    return Math.abs(s-115)<9&&side>0&&side<6||s>186&&s<226&&side>0&&side<10||Math.abs(s-366)<11&&Math.abs(side)<6.5||Math.abs(s-475)<9&&side>0&&side<8||Math.abs(s-578)<8&&side<0&&side>-7||s>694&&Math.abs(side)<14||Math.abs(s-30)<6&&side>0&&side<6||inGlade(x,s);};
  function plantTree(s,x,size,barkColor,leafColors,opts={}){
    const y=terrain(x,s),angle=rnd()*Math.PI*2,tree=trees[Math.floor(rnd()*3)],variant=trees.indexOf(tree),tall=size*(.88+rnd()*.26);
    col.set(barkColor).lerp(new T.Color(rnd()<.5?'#b8a88c':'#ece3cf'),rnd()*.4);
    instance('tree'+variant,'#'+col.getHexString(),x,y,-s,size,tall,size,angle,(rnd()-.5)*.10);
    for(const [j,crown] of tree.crowns.entries()){
      if(opts.sparse&&j%2)continue;
      // G03: full canopies drop a few side crowns at random and jitter crown size, so light gaps and uneven crowns replace
      // identical domes (fewer leaf cards too).
      if(!opts.sparse&&j%4===3&&rnd()<.45)continue;
      const cx=x+(crown.x*Math.cos(angle)+crown.z*Math.sin(angle))*size,cz=-s+(-crown.x*Math.sin(angle)+crown.z*Math.cos(angle))*size,r=crown.size*size*(.86+rnd()*.28);
      // Vary the existing crown lobes within their footprint; gaps admit light without more overlapping cards.
      const lobe=Math.sin(j*2.4+angle),breadth=.88+.30*lobe;
      const fan=Math.sin(angle*2+j*1.73),lift=.38*Math.cos(j*2.11+angle);
      instance('leaf',leafColors[j%leafColors.length],cx+r*.16*fan,y+crown.y*tall+r*(.12*lobe+lift),cz+r*.12*Math.cos(j+angle),r*(opts.leafScale||1.4)*(1+.18*Math.sin(j*3.4+variant))*breadth,r*(.80+.24*Math.sin(j+angle)**2),r*(1.03+.29*fan)*(.96-.12*lobe),angle+j*1.37,.42*Math.sin(j+angle));
    }
  }
  // Zone forests: counts, distances, sizes and leaf palettes change with the section mood.
  const zoneTrees=[
    {from:-20,to:75,count:70,near:4.5,spread:30,size:[.8,1.2],leaf:['#dfe5c8','#cfdcbb','#e9e3c4','#bfd2b7'],bark:'#dcd2bb'},
    {from:70,to:165,count:125,near:4.8,spread:34,size:[.95,1.35],leaf:['#d9dfb4','#c5d7a6','#e6e0ac','#b5c9a1'],bark:'#e3d8bf'},
    {from:160,to:255,count:110,near:4.5,spread:30,size:[.8,1.2],leaf:['#c5d7b2','#a7c5ad','#dce1b4','#a2bda0'],bark:'#d9d2bf'},
    {from:250,to:345,count:95,near:5.5,spread:30,size:[.75,1.15],leaf:['#dde6c2','#d0dcb8','#e4e5c4','#c6d6b3'],bark:'#ddd3bc'},
    {from:340,to:435,count:100,near:4.8,spread:30,size:[.85,1.25],leaf:['#d6e0c2','#c7d6bd','#dfe3c6','#bdd0b4'],bark:'#dbd2bd'},
    {from:430,to:525,count:140,near:4.6,spread:28,size:[.9,1.3],leaf:['#c2d3aa','#b4c9a4','#cbd7ad','#a9c29c'],bark:'#cfc4ab'},
    {from:520,to:645,count:95,near:5,spread:26,size:[.34,.55],leaf:['#d9d6a4','#cfd09e','#e0d9ab','#c4c894'],bark:'#d3c7a8'},
    {from:640,to:745,count:52,near:6,spread:22,size:[.3,.45],leaf:['#dcd6a6','#d1cf9c'],bark:'#d3c7a8'}];
  for(const z of zoneTrees)for(let i=0;i<z.count;i++){
    const s=z.from+rnd()*(z.to-z.from),x=pathX(s)+(rnd()<.5?-1:1)*(z.near+Math.pow(rnd(),1.35)*z.spread);
    if(nearRiver(x,s,3.2)||clearing(x,s)||s>515&&x<pathX(s)-4||onBridge(s)&&Math.abs(x-pathX(s))<6)continue;
    plantTree(s,x,z.size[0]+rnd()*(z.size[1]-z.size[0]),z.bark,z.leaf);
  }
  // Smaller trees fill the creek valley seen from the ridge and summit, keeping the vista a forest instead of a bare slope.
  for(let i=0;i<330;i++){
    const s=500+rnd()*245,x=pathX(s)-12-rnd()*52;if(nearRiver(x,s,4))continue;
    const size=.45+rnd()*.3;plantTree(s,x,size,'#d2dbce',['#c5d5c3','#bfcfb6','#cdd8bd'],{sparse:true,leafScale:1.35});
  }
  // Low shrub drifts and a few boulders on the valley slope below the ridge/summit, out to the land edge, so the fall-away
  // reads as planted hillside instead of a bare plane (cheap instances; no extra trees in front of the view).
  for(let i=0;i<300;i++){
    const s=505+rnd()*240,x=pathX(s)-9-rnd()*56;if(nearRiver(x,s,4))continue;
    const size=1.5+rnd()*1.4,y=terrain(x,s);instance('shrub1',i%3?'#b8c99a':'#a9bd8c',x,y-.1,-s,size,size*.8,size,rnd()*6);
    // G10: no moss boulders inside the ridge look-back view (s 520–600, within 18 m of the trail on the valley side): seen from the
    // lookout at 30–40 m they read as smooth brown/green domes between the fence shrubs and the far forest. rnd() calls are kept
    // so every other placement stays where the parent already reviewed it. Terrain/walkable band untouched.
    if(i%5===0){const rw=1.2+rnd(),rl=1+rnd();if(!(s>520&&s<600&&x>pathX(s)-18))instance('rock','#b9bfab',x+1,terrain(x+1,s)-.3,-s+.5,rw,.6,rl,i);}
  }
  // Beyond the summit rail: an irregular planted brow (grass, ferns, low shrubs, rocks) on the drop and small trees lower
  // down, so the railing meets hillside and then the panorama, not a flat shelf. Nothing here is walkable (s > LENGTH).
  // G08: planting is placed relative to browRim(x). Grass/ferns shrink near the rim; shrubs (1–2 m) only appear once the
  // slope is already 2.2 m below the deck, so no foliage stands in front of the railing and the vista stays open.
  const deckTop=elevation(LENGTH);
  for(let i=0;i<520;i++){
    const x=pathX(LENGTH)+(rnd()-.5)*34,s=browRim(x)-.3+rnd()*22,y=terrain(x,s),k=i%9,below=clamp((deckTop-y)/3,0,1),low=.55+.45*below;
    if(k<5)instance('grass','#c9c88e',x,y,-s,(.7+rnd()*.5)*low,(.8+rnd()*.4)*low,(.7+rnd()*.5)*low,rnd()*6);
    else if(k<7){if(deckTop-y<2.2)continue;instance('shrub',k===5?'#b9c48f':'#d3d9a6',x,y-.05,-s,1.1+rnd()*.9,.9+rnd()*.6,1.1+rnd()*.9,rnd()*6);}
    else if(k===7)instance('fern','#aebf80',x,y,-s,(.9+rnd()*.5)*low,.9*low,(.9+rnd()*.5)*low,rnd()*6);
    else instance('rock','#c7c6b2',x,y-.2,-s,.8+rnd()*.9,.5+rnd()*.4,.7+rnd()*.7,rnd()*6);
  }
  // A few half-buried rocks right on the rim (0.5–1 m, tops under the lower rail bar) break the edge line without a wall.
  for(let i=0;i<9;i++){const x=pathX(LENGTH)+(i-4)*3.1+rnd()*1.6,s=browRim(x)+.2+rnd()*.9;instance('rock','#b9b7a2',x,terrain(x,s)-.22,-s,.55+rnd()*.5,.35+rnd()*.3,.5+rnd()*.5,rnd()*6);}
  for(let i=0;i<36;i++){const s=LENGTH+8+rnd()*16,x=pathX(LENGTH)+(rnd()-.5)*40;plantTree(s,x,.38+rnd()*.25,'#d2dbce',['#c5d5c3','#bfcfb6'],{sparse:true,leafScale:1.35});}
  // Sparse outer groves give free-look depth without closing the creek or summit vista.
  for(let i=0;i<190;i++){
    const s=-8+rnd()*528,side=i%2?1:-1,x=pathX(s)+side*(18+rnd()*24);
    if(nearRiver(x,s,5))continue;
    plantTree(s,x,.64+rnd()*.48,'#c6c9b8',['#b9cdb4','#c3d3b8'],{sparse:true,leafScale:1.6});
    instance('shrub1','#bfcdad',x,terrain(x,s),-s,2.1,1.6,2.1,rnd()*6);
  }
  // A middle layer of saplings closes the empty space beneath the tall canopy.
  for(let i=0;i<320;i++){
    const s=18+rnd()*622,side=i%2?1:-1,x=pathX(s)+side*(5.4+rnd()*10);
    if(nearRiver(x,s,3.4)||clearing(x,s)||side<0&&s>515)continue;
    plantTree(s,x,.27+rnd()*.17,'#cbbd94',['#b9d3a2','#c1d4a5'],{leafScale:1.3});
  }
  const flowerPalette=s=>s<160?['#fff3cf','#f9e6a6']:s<340?['#e5d3d7','#f5eed8','#d2cedb']:s<520?['#d7b7d4','#f9f0cf']:['#f7d57a','#fff0c5'];
  // G03: layered verges. Offsets start at the real trail edge (halfWidth, so fork lanes stay clear). Grass hugs the edge,
  // ferns begin ~.6 m further out and stay below knee height near the trail, small shrubs (shared low-poly geometry, no
  // shadow) only from 1.3 m out and at a quarter of the old count. gapNoise leaves bare pockets within 4.5 m of the trail
  // and bloom() gathers the flowers into colour patches instead of an even sprinkle.
  const gapNoise=(s,side)=>.5+.5*Math.sin(s*.9+side*.7)*Math.sin(s*.37+side);
  const bloom=(s,side)=>.5+.5*Math.sin(s*.31+side*2)*Math.cos(s*.11-side);
  for(let i=0;i<11500;i++){
    const s=-6+rnd()*(LENGTH+10),side=rnd()<.5?-1:1,edge=halfWidth(s),off=edge+.1+Math.pow(rnd(),1.7)*12,x=pathX(s)+side*off;
    if(nearRiver(x,s,2.5)||onBridge(s)&&Math.abs(x-pathX(s))<4||onDeck(x,s)||Math.abs(s-115)<4&&side>0&&Math.abs(x-pathX(s))<3.8||Math.abs(s-475)<7&&side>0&&Math.abs(x-pathX(s))<4.5||Math.abs(s-578)<3&&side<0&&Math.abs(x-pathX(s))<4)continue;
    if(off<4.5&&gapNoise(s,side)<.3)continue;const y=terrain(x,s);
    const size=.55+rnd()*.55,ridge=s>520,fern=i%3===0&&off>edge+.6;instance(fern?'fern':'grass',ridge?'#c9c58a':'#abc58f',x,y,-s,size,size*(ridge?.8:1)*(fern&&off<edge+1.4?.72:1),size,rnd()*6);
    if(i%8===0&&off>edge+1.3&&!nearRiver(x,s,3.4)&&!ridge){for(let j=0;j<2;j++)instance('shrub1',j%2?'#dce4c8':'#c6d8c0',x+(rnd()-.5)*.6,y-.03,-s+(rnd()-.5)*.6,.60+rnd()*.38,.48+rnd()*.30,.60+rnd()*.38,rnd()*6);}
    const b=bloom(s,side);if(i%4===0&&b>.42||i%4===2&&b>.82){const h=.25+rnd()*.22;instance('stem','#4b7542',x,y+h/2,-s,.012,h,.012);const flower=flowerPalette(s)[i%flowerPalette(s).length];for(let j=0;j<5;j++){const a=j*Math.PI*2/5;instance('petal',flower,x+Math.cos(a)*.075,y+h+.012*Math.sin(j*2.1+s),-s+Math.sin(a)*.075,.075,.018,.055,a);}instance('petal','#e4bb57',x,y+h+.015,-s,.042,.025,.042);}
  }
  // Glade floor: white flower drifts, a few pale stones and taller grass where the light comes through.
  for(const [gs,side,a,b] of glades){
    for(let i=0;i<42;i++){const s=gs+(rnd()-.5)*11,x=pathX(s)+side*(a+.4+rnd()*(b-a-1)),y=terrain(x,s),h=.22+rnd()*.2;
      instance('grass','#c3cf84',x,y,-s,.6+rnd()*.4,.7+rnd()*.3,.6+rnd()*.4,rnd()*6);instance('stem','#5b7a44',x,y+h/2,-s,.012,h,.012);
      for(let j=0;j<5;j++){const t=j*Math.PI*2/5;instance('petal',i%3?'#fff8e4':'#f3e7b0',x+Math.cos(t)*.08,y+h,-s+Math.sin(t)*.08,.085,.035,.06,t);}instance('petal','#e4bb57',x,y+h+.015,-s,.045,.025,.045);}
    for(let i=0;i<3;i++){const s=gs-4+i*4,x=pathX(s)+side*(a+1.6+i*1.1),y=terrain(x,s);instance('rock','#d2d3c4',x,y+.05,-s,.6+i*.2,.32,.5+i*.15,i*2.1);}
  }
  // Mid-height shrubs break the bare lawn silhouette beyond the path's small plants.
  for(let i=0;i<800;i++){
    const s=-5+rnd()*700,side=i%2?1:-1,x=pathX(s)+side*(5+rnd()*17);
    if(nearRiver(x,s,3.6)||side<0&&s>515||onDeck(x,s)||clearing(x,s))continue;
    const size=1.1+rnd()*.9;
    instance(Math.abs(x-pathX(s))>12?'shrub1':'shrub',s>520?'#d4d8a8':'#dce5ce',x,terrain(x,s),-s,size,size*1.2,size,i*2.4);
  }
  // Garden-room models form small drifts outside the walkable edge, not a continuous hedge.
  const gardenBeds=[96,124,190,202,214,222,282,350,386,455,490,548,610,675];
  for(const [bed,center] of gardenBeds.entries())for(const side of [-1,1])for(let j=0;j<5;j++){
    const s=center+(j-2)*.92+.75*Math.sin(bed*7+j),edge=halfWidth(s),off=edge+.85+(j%3)*.55+.4*Math.sin(s*.61)**2,x=pathX(s)+side*(onBridge(s)?Math.max(4.8,off):off);
    if(nearRiver(x,s,2.9)||onDeck(x,s)||Math.abs(s-475)<12||Math.abs(s-578)<12)continue;
    let kind='liriope',scale=.56+.12*(.5+.5*Math.sin(s*.7+side));
    if(j===1){kind='daisy';scale=.62+.18*Math.sin(bed*2)**2;}
    if(j===3&&s<510){kind='hydrangea';scale=.38+.17*Math.cos(bed)**2;}
    if(j===4&&bed%2===0){kind='maple';scale=.44+.14*Math.sin(bed)**2;}
    if(!geos['garden_'+kind])continue;
    instance('garden_'+kind,kind==='maple'?'#a1b990':kind==='hydrangea'?'#e6dcdf':'#f0ebd3',x,terrain(x,s)-.015,-s,scale,scale,scale,bed*.77+j*1.9);
    if(j===0&&bed%2===0){const rx=x+side*.5;instance('rock','#9fae91',rx,terrain(rx,s)-.06,-s-.3,.48,.23,.39,s);instance('fern','#a1ba84',x-side*.2,terrain(x-side*.2,s+.6),-s-.6,.64,.54,.64,s*.5);}
  }
  const benchSpots=[[115,-3],[200,-4],[seats[0].s,seats[0].offset],[seats[1].s,seats[1].offset],[372,-3.1],[708,-3.2]];
  // G03: the 2.7 m verge row was a continuous wall (1.2 m shrub + fern + 1.7 m shrub every step, both sides). clumpN now
  // skips ~a third of the steps, the inner shrub is the low-poly kind sitting ~.9 m outside the trail edge with a shorter
  // fern in front of it, and the tall outer shrub only appears at clump peaks, so the border reads as separate thickets.
  const clumpN=(s,side)=>.5+.5*Math.sin(s*.27+side*1.3)*Math.cos(s*.083-side*.6);
  for(let s=5;s<700;s+=2.7)for(const side of [-1,1]){
    const c=clumpN(s+1.3,side);if(c<.36)continue;
    const edge=halfWidth(s),x=pathX(s)+side*(edge+.9+.30*Math.sin(s)),y=terrain(x,s);
    if(nearRiver(x,s,2.8)||onBridge(s)||onDeck(x,s)||benchSpots.some(([bs,bo])=>Math.abs(s-bs)<3&&Math.sign(bo)===side)||Math.abs(s-475)<1&&side>0||Math.abs(s-578)<2&&side<0||Math.abs(s-30)<2&&side>0)continue;
    instance('shrub1',s>520?'#d9dfa8':'#dbe7b7',x,y,-s,.82+.16*c,.70+.30*c,.86+.12*c,s*.4);
    const fx=x-side*.45;instance('fern','#c8d89c',fx,terrain(fx,s-.7),-s+.7,.95,.8,.95,s);
    if(s<440&&c>.62&&!nearRiver(x+side*1.4,s,3.5))instance('shrub','#c4d4b2',x+side*1.4,terrain(x+side*1.4,s),-s-1,1.5,1.7,1.5,s*.7);
  }
  for(let i=0;i<520;i++){const s=RIVER.start+rnd()*(RIVER.end-RIVER.start-10),side=rnd()<.5?-1:1,x=riverX(s)+side*(2.1+rnd()*1.4),y=terrain(x,s);if(Math.abs(x-pathX(s))<2.8)continue;const r=.35+rnd()*.9;instance('rock',['#e3e3de','#bdccd0','#d4d8d3'][i%3],x,y+.12,-s,r*(.8+rnd()*.5),r*(.42+rnd()*.30),r*(.65+rnd()*.45),rnd()*6);}
  // Interlocking banks and submerged stones hide the smooth terrain lip at the waterline.
  for(let s=RIVER.start+1;s<RIVER.end-8;s+=1.35)for(const side of [-1,1]){
    const x=riverX(s)+side*(2.25+.28*Math.sin(s*1.7)),r=.65+rnd()*.55;
    if(Math.abs(x-pathX(s))<2.65)continue;
    // Offset the existing stones into uneven clusters without changing the seeded forest or the trail clearance.
    const shiftedS=s+.38*Math.sin(s*.73+side),candidate=riverX(shiftedS)+(x-riverX(s))+side*.24*Math.sin(s*.43);
    const clear=Math.abs(candidate-pathX(shiftedS))>=2.65,bankS=clear?shiftedS:s,bankX=clear?candidate:x,cluster=.82+.26*Math.sin(s*.43+side);
    instance(side>0?'rock1':'rock2','#d1d9c5',bankX,elevation(bankS)-.44,-bankS,r*cluster,(.45+rnd()*.58)*(.82+.18*Math.cos(s*.43+side)),r*(.70+rnd()*.40)*cluster,s+.35*Math.sin(s));
    const leafX=bankX+side*.55;
    instance('fern','#d0daac',leafX,terrain(leafX,bankS),-bankS,.8,.8,.8,s);
  }
  for(let i=0;i<760;i++){
    const s=RIVER.start+rnd()*(RIVER.end-RIVER.start-10),x=riverX(s)+(rnd()-.5)*3.7,r=.16+rnd()*.40;
    instance('rock',i%3?'#91b2a8':'#bfc2a1',x,elevation(s)-1.25,-s,r,.10+rnd()*.16,r*.75,rnd()*6);
  }
  for(let i=0;i<480;i++){
    const s=-2+rnd()*700,side=i%2?1:-1,x=pathX(s)+side*(7+rnd()*16);
    if(nearRiver(x,s,4)||side<0&&s>515||onDeck(x,s))continue;
    const y=terrain(x,s),r=1.2+rnd()*.9;
    instance('rock','#cbd3bd',x,y+.22,-s,r,r*.55,r*.8,i);
    for(let j=0;j<3;j++)instance(j?'shrub1':'shrub','#d8e6c3',x+Math.cos(j*2.1)*r*.6,y+.1,-s+Math.sin(j*2.1)*r*.6,r*.9,r*.85,r*.9,i+j);
  }
  // Foreground boulders frame the creek approach without entering the walkable corridor or covering the quiet bench at s=200.
  for(const s of [190,193.5,207.5]){
    const x=pathX(s)-4.4,y=terrain(x,s);
    instance('rock','#dce1d5',x,y+.3,-s,1.18,.68,.95,s);
    for(let j=0;j<4;j++){
      const fx=x+Math.cos(j*2.4)*1.1,fs=s+Math.sin(j*2.4),fy=terrain(fx,fs),h=.30+j*.06;
      instance('fern','#c7d6a4',fx,fy,-fs,.85,.85,.85,j);
      instance('stem','#68864e',fx,fy+h/2,-fs,.013,h,.013);
      for(let k=0;k<5;k++){const a=k*Math.PI*2/5;instance('petal','#fff5da',fx+Math.cos(a)*.095,fy+h,-fs+Math.sin(a)*.095,.095,.035,.065,a);}
      instance('petal','#eac86d',fx,fy+h+.02,-fs,.048,.025,.048);
    }
  }
  for(let i=0;i<270;i++){
    const s=3+i*2.5+Math.sin(i*3)*.8,side=i%2?1:-1,x=pathX(s)+side*(3.8+(i%3)*.55);
    if(nearRiver(x,s,2.4)||s>696||stops.some(p=>Math.abs(s-p.s)<5)||onBridge(s)||benchSpots.some(([bs,bo])=>Math.abs(s-bs)<3.5&&Math.sign(bo)===side))continue;
    const r=.6+(i%5)*.15;instance('rock',s>520?'#d4d2c3':'#dfe1dc',x,terrain(x,s)+r*.3,-s,r*(1+Math.sin(i)*.2),r*(.45+(i%3)*.1),r*(.65+(i%2)*.3),i*2.4);
  }
  // G02: trail gravel in drifts. A slow noise along s makes stretches with many stones and stretches with few; stone size
  // follows the same drift (so a gravelly patch has bigger stones) and 55% of stones gather toward the verges. The density
  // test drops ~35% of draws, so the loop runs 9400 times to keep roughly the previous ~6000 stones.
  for(let i=0;i<9400;i++){const s=rnd()*LENGTH;if(onBridge(s)||s>SUMMIT.from)continue;const drift=.5+.5*Math.sin(s*.19+.7)*Math.cos(s*.067-1.1);if(rnd()>.3+.7*drift)continue;
    const toVerge=rnd()<.55,x=pathX(s)+(toVerge?(rnd()<.5?-1:1)*(.9+1.35*Math.sqrt(rnd())):(rnd()-.5)*3.2),size=(.7+.6*drift)*(.6+.8*Math.pow(rnd(),1.6));
    instance('pebble',['#827767','#9b8d76','#a89c86','#726e62'][i%4],x,elevation(s)+.068,-s,(.025+.095*rnd())*size,(.010+.025*rnd())*size,(.04+.11*rnd())*size,rnd()*6);}
  for(let i=0;i<2900;i++){
    const s=4+rnd()*694,side=i%2?1:-1,offset=i%3?side*(2.0+rnd()*3.5):(rnd()-.5)*4.0,x=pathX(s)+offset;
    if(onBridge(s)||nearRiver(x,s,2.5)||onDeck(x,s))continue;
    const y=Math.abs(offset)<2.3?elevation(s)+.075:terrain(x,s)+.025;
    instance('litter',['#8c704b','#b69d61','#857e4e','#c4ab70'][i%4],x,y,-s,.035+rnd()*.025,.006,.075+rnd()*.055,rnd()*6);
  }
  // G03: low borders in three bands measured from the trail edge (halfWidth, so fork lanes and feet stay clear): grass
  // within .35 m, ferns (knee-high, 80% height) to 1.4 m, low-poly shrubs only beyond. clumpN pockets (offset from the
  // verge row) leave open ground between thickets; 4400 -> 3200 loop with ~45% dropped.
  for(let i=0;i<3200;i++){
    const s=35+rnd()*660,side=i%2?1:-1,edge=halfWidth(s),off=edge-.05+rnd()*2.3,x=pathX(s)+side*off;
    if(onBridge(s)||onDeck(x,s)||nearRiver(x,s,2.6)||Math.abs(s-200)<3&&side<0||Math.abs(s-475)<1&&side>0&&off<2.7||Math.abs(s-578)<2&&side<0)continue;
    const c=clumpN(s-4,-side);if(c<.3||off<edge+.5&&c<.55)continue;
    const band=off-edge,y=terrain(x,s),scale=(.5+rnd()*.5)*(band<.4?.7:band<1.3?.9:1.1),kind=band<.35?'grass':band<1.4?(i%4?'fern':'grass'):(i%3?'fern':'shrub1');
    instance(kind,i%2?(s>520?'#dfdca2':'#e3e9ba'):'#b6d3a1',x,y,-s,scale,scale*(kind==='fern'&&band<1.4?.8:1),scale,rnd()*6);
    if(i%7===0&&bloom(s,side)>.5){const h=.28;instance('stem','#7a8b4e',x,y+h/2,-s,.009,h,.009);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;instance('petal','#fff5d9',x+Math.cos(a)*.065,y+h,-s+Math.sin(a)*.065,.07,.025,.045,a);}instance('petal','#e6b647',x,y+h+.015,-s,.03,.02,.03);}
  }
  // Uphill-side shrubs on the ridge and summit approach. Same 960 budget as before, redistributed: two thirds of the shrubs
  // gather in four wavy contour drifts (4.5 / 8.5 / 13.5 / 20 m from the trail, reaching the previously bare 13–24 m band),
  // one third stays scattered, and the 160 rocks that used to be sprinkled at random now pile on the OUTCROPS as boulder
  // clusters (flatter, greyer, slightly tilted) so each knob reads as bedrock with shrubs around its foot.
  const drifts=[4.5,8.5,13.5,20];
  for(let i=0;i<960;i++){
    const s=500+rnd()*245,band=i%4,ridge=s>520,wide=s>694?16:9;
    const off=ridge&&i%3?drifts[band]+(rnd()-.5)*3+1.8*Math.sin(s*.17+band*2):3.8+rnd()*wide;
    const x=pathX(s)+Math.max(3.8,off),y=terrain(x,s),size=(.85+rnd()*.85)*(off>12?1.25:1);
    if(onDeck(x,s)||Math.abs(s-475)<4&&x-pathX(s)<5)continue;
    instance(off>8?'shrub1':'shrub',i%2?'#d3d9a6':'#b9c48f',x,y,-s,size,size*.9,size,rnd()*6);
    if(i%6===0){const [os,od,r]=OUTCROPS[i%OUTCROPS.length],a=rnd()*Math.PI*2,q=Math.sqrt(rnd())*r*.85,rs=os+Math.sin(a)*q/.9,rx=pathX(rs)+od+Math.cos(a)*q,rsize=.9+rnd()*1.3;
      instance('rock',i%12?'#b9b7a6':'#c9c6b3',rx,terrain(rx,rs)-.15,-rs,rsize*(1+rnd()*.6),rsize*.45,rsize*(.8+rnd()*.4),rnd()*6,(rnd()-.5)*.3);}
  }
  for(let i=0;i<40;i++){
    const s=694+rnd()*26,x=pathX(s)-5.3-rnd()*5,y=terrain(x,s),size=.8+rnd()*1.1;
    instance('rock','#d2d5c3',x,y-.15,-s,size,size*.7,size,i);
    instance('fern','#d3dfae',x+.5,y+.15,-s+.4,1.2,1.2,1.2,i);
    instance('shrub','#dce7b8',x-.4,y+.12,-s-.5,1.5,1.4,1.5,i);
  }
  for(const [s,offset,size] of [[705,-8,.62],[713,-9,.70],[718,-11,.60],[709,9.5,.55]]){
    const x=pathX(s)+offset,y=terrain(x,s),tree=trees[1];instance('tree1','#e0d5bf',x,y,-s,size,size,size);
    for(const c of tree.crowns){const r=c.size*size;instance('leaf','#dce6bc',x+c.x*size,y+c.y*size,-s+c.z*size,r*1.35,r*.8,r*1.2);}
  }
  const foamGeo=creekFoamGeometry(),foamMat=new T.MeshBasicMaterial({color:'#d8eee6',transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide,forceSinglePass:true});
  for(let i=0;i<150;i++){
    const s=RIVER.start+4+i*2.55,x=riverX(s)+Math.sin(i*3)*1.1;if(s>RIVER.end-10||Math.abs(x-pathX(s))<2.9)continue;
    const r=.35+(i%4)*.14;instance('rock','#cfd7d3',x,elevation(s)-.70,-s,r,r*.6,r*.8,i);
    const ring=new T.Mesh(foamGeo,foamMat);ring.scale.set(r*1.45,1,r*1.45);ring.position.set(x,elevation(s)-.67,-s);ring.rotation.x=Math.atan((elevation(s+.1)-elevation(s-.1))/.2);scene.add(ring);ripples.push(ring);ring.userData={s,phase:i,radius:r*1.45,foam:true};
  }
  for(let i=0;i<110;i++){
    const s=698+rnd()*18,x=pathX(s)-5.1-rnd()*2.5,y=terrain(x,s),r=.55+rnd()*.6;
    instance(i%3?'grass':'fern','#d9dda4',x,y,-s,r,r,r,i);
    if(i%4===0)instance('shrub','#dce3b5',x,y,-s,.72,.65,.72,i);
  }
  // Low meadow pockets cover exposed bank soil, while keeping the trail and animal clear.
  for(let i=0;i<2000;i++){
    const s=38+rnd()*705,side=i%2?1:-1,x=pathX(s)+side*(3.2+rnd()*(s>694?9:4.8));
    if(onBridge(s)||onDeck(x,s)||nearRiver(x,s,2.6)||Math.abs(s-475)<6&&side>0)continue;
    const y=terrain(x,s),scale=.55+rnd()*.55;
    instance('grass',s>520?'#d6d49a':'#ced8a4',x,y,-s,scale,scale,scale,i);
    if(i%6===0){const h=.16+rnd()*.18;instance('stem','#56773e',x,y+h/2,-s,.008,h,.008);for(let j=0;j<5;j++){const a=j*1.256;instance('petal',i%12?'#d7d8bd':'#fff3d2',x+Math.cos(a)*.07,y+h,-s+Math.sin(a)*.07,.075,.028,.045,a);}instance('petal','#d6a73c',x,y+h+.01,-s,.03,.02,.03);}
  }
  // Broken outcrops sit on the exposed slopes beside the creek and along the ridge.
  for(const s of [196,203,228,236,244,252,345,352,372,386,402,420,540,556,572,600,618,660,690,700]){
    for(let j=0;j<3;j++){
      const x=s<RIVER.end?riverX(s)-3.6-j*.75:pathX(s)-(s>690?6.7:4.4)-j*.8,ss=s+j*.8,y=terrain(x,ss),r=.85+j*.28;
      if(Math.abs(x-pathX(ss))<r*1.4+(s>690?4.6:2.2))continue;
      instance(j%2?'rock1':'rock2','#b7c0ac',x,y-.20,-ss,r*(1.05+.18*Math.sin(s)),r*(.52+.14*Math.cos(s+j)**2),r,s+j);
      instance('fern','#c2d497',x+.5,y+.2,-ss+.3,.75,.75,.75,j);
    }
  }
  // Low creek-side plants reveal the water below the bridge without clearing the forest.
  for(const {kind,items} of groups.values())if(['fern','shrub','shrub1'].includes(kind))for(const p of items){const s=-p.z;if(s>190&&s<BRIDGE.to+2&&p.x>pathX(s)+2&&p.x<riverX(s)+1){p.sx*=.72;p.sy*=.62;p.sz*=.72;}}
  // Small summit flowers sit beyond the platform, leaving the mountain silhouette open.
  for(let i=0;i<46;i++){
    const s=704+i*.28,side=i%3===0?1:-1,x=pathX(s)+side*(5.0+.65*(1+Math.sin(i*2.4))),y=terrain(x,s);
    instance('grass','#c5c48c',x,y,-s,.70,.8,.70,i);
    if(i%2===0){instance('fern','#91ac69',x,y,-s,.45,.45,.45,i);const h=.24+.06*Math.sin(i);instance('stem','#638046',x,y+h/2,-s,.012,h,.012);for(let j=0;j<5;j++){const angle=j*Math.PI*2/5;instance('petal','#fff0c5',x+Math.cos(angle)*.06,y+h,-s+Math.sin(angle)*.06,.065,.025,.048,angle);}instance('petal','#d7ae4c',x,y+h+.01,-s,.03,.02,.03);}
  }
  // Layered verge clusters frame each spot while keeping the path and wildlife approach open.
  for(const [a,b] of [[100,130],[196,225],[342,380],[462,492],[565,595],[702,718]])for(let i=0;i<48;i++){
    const s=a+(b-a)*i/48,side=i%2?1:-1,edge=s>694?5.2:2.25;
    if(s>466&&s<484&&side===1||Math.abs(s-578)<3&&side<0||onBridge(s))continue;
    const x=pathX(s)+side*(edge+.75*(.5+.5*Math.sin(i*2.3))),y=terrain(x,s);
    if(nearRiver(x,s,2.4))continue;
    const r=.45+.25*(.5+.5*Math.sin(i*1.7));
    instance(i%3?'fern':'shrub',i%2?'#c1d78a':'#a6c48d',x,y,-s,r,r*.8,r,i);
    if(i%2===0){const h=.25+.08*Math.sin(i);instance('stem','#668243',x,y+h/2,-s,.009,h,.009);for(let j=0;j<6;j++){const a=j*Math.PI/3;instance('petal',i%6?'#fff5d6':'#cbb9df',x+Math.cos(a)*.075,y+h,-s+Math.sin(a)*.075,.078,.022,.038,a);}instance('petal','#d8a743',x,y+h+.01,-s,.028,.018,.028);}
  }
  // Clear every bench and seat footprint so resting places are readable from the path.
  for(const group of groups.values())if(['grass','fern','shrub','shrub1','stem','petal'].includes(group.kind))group.items=group.items.filter(p=>!benchSpots.some(([bs,bo])=>Math.abs(p.z+bs)<2.1&&Math.abs(p.x-(pathX(bs)+bo))<1.9));
  // Keep the fork island green enough to distinguish it from the two sandy walking lanes.
  for(let s=FORK.from+4;s<FORK.to-4;s+=1.9){const gap=forkGap(s);if(gap<1)continue;
    for(const side of [-1,1]){const x=pathX(s)+side*gap*(.35+.18*Math.sin(s*1.3)),y=Math.max(terrain(x,s),elevation(s)+.08);
      instance('grass','#b5c48b',x,y,-s,.75,.75,.75,s);
      if(Math.sin(s*.43+side)>.1)instance('fern','#b5c894',x+.14,y,-s+.25,.5,.46,.5,s*.3);
    }
  }
  // Close the bare creek hillside with staggered groves; the trail and observation corridor stay open.
  {const savedSeed=seed;
    for(const [s,off,size] of [[222,15,.9],[230,19,1.05],[239,13,.85],[244,24,1.15],[252,17,1],[259,26,.9],[226,29,1.05],[247,33,1.1]]){
      const x=pathX(s)+off;plantTree(s,x,size,'#d2c9ad',['#cad4ac','#e0dfb1','#b7c9a6'],{leafScale:1.65});
      for(let j=0;j<5;j++){const fs=s+Math.sin(j*2.4)*2.2,fx=x+Math.cos(j*2.4)*2.2;instance('shrub1','#d0dcad',fx,terrain(fx,fs),-fs,1.8,1.5,1.8,j);}
    }
    seed=savedSeed;
    for(const [s,side] of [[204,-1],[216,1],[221,-1]]){const x=riverX(s)+side*3.0;
      if(Math.abs(x-pathX(s))<3.4)continue;
      for(let j=0;j<7;j++){const fs=s+Math.sin(j*2.4)*1.25,fx=x+Math.cos(j*2.4)*1.25,sc=.9+(j%3)*.17;
        if(Math.abs(fx-pathX(fs))<2.9)continue;
        instance(j%3?'fern':'shrub1',j%3?'#c4d39a':'#c0d0a2',fx,terrain(fx,fs),-fs,sc,sc*.85,sc,j*.7);
      }
    }
  }
  // 폭포 view corridor: between the shelter stop and the waterfall ledge (s 376–393, creek side of the trail) no trunk, crown or
  // tall shrub stands in the line of sight. Filtered after placement so every rnd() draw (and every other placement the parent
  // reviewed) stays exactly where it was; grass, ferns and rocks remain.
  const fallsCorridor=(x,s,margin)=>{const side=x-pathX(s);return s>376&&s<393&&side<-2.0-margin&&side>-11+margin;};
  for(const group of groups.values()){
    if(group.kind.startsWith('tree')||group.kind==='shrub'||group.kind==='shrub1')group.items=group.items.filter(p=>!fallsCorridor(p.x,-p.z,0));
    else if(group.kind==='leaf')group.items=group.items.filter(p=>!fallsCorridor(p.x,-p.z,.4));
  }
  // Low, clustered understory keeps the walkable path and activity sightlines open.
  for(let s=16;s<520;s+=2.3){
    for(const side of [-1,1]){
      const patch=.5+.5*Math.sin(s*.19+side*2.1);if(patch<.25)continue;
      for(let j=0;j<5;j++){
        const ss=s+Math.sin(j*2.4+s)*1.3,x=pathX(ss)+side*(3.2+j*.72+.45*Math.sin(s*.7+j));
        if(nearRiver(x,ss,2.75)||(clearing(x,ss)&&!(ss>186&&ss<244))||onBridge(ss)||fallsCorridor(x,ss,0))continue;
        const y=terrain(x,ss),sc=.45+.45*patch,spread=1.18+.12*Math.sin(s*.31+j)**2;
        instance(j%3===0?'fern':'shrub1',j%2?'#b2c295':'#96ae83',x,y,-ss,sc*spread,sc*.82,sc*spread,s+j);
        if(j===0)instance('rock','#c4c8b0',x+side*.55,y-.1,-ss+.4,.35,.22,.45,s);
      }
    }
  }
  // Small islands of vegetation between creek boulders frame the bridge without covering the deck.
  for(let i=0;i<85;i++){
    const s=188+i*.55,side=i%2?1:-1,x=riverX(s)+side*(2.8+.8*Math.sin(i*2.4));
    if(Math.abs(x-pathX(s))<2.65||nearRiver(x,s,2.5))continue;
    const sc=.55+.35*(.5+.5*Math.sin(i*1.3));
    instance('shrub1','#bdcda2',x,terrain(x,s),-s,sc,sc*.75,sc,i*2.4);
  }
  if(fernProp){
    // High-detail accents are limited to the near banks and stop approaches, not the entire forest.
    for(const [a,b] of [[102,124],[186,244],[345,360],[400,420],[456,488]]){
      for(let s=a;s<b;s+=2.4)for(const side of [-1,1]){
        const x=pathX(s)+side*(3.15+1.0*(.5+.5*Math.sin(s*1.7)));
        if(nearRiver(x,s,2.65)||onBridge(s)||(clearing(x,s)&&!(s>186&&s<244))||fallsCorridor(x,s,0))continue;
        const sc=.55+.47*(.5+.5*Math.sin(s*2.3));
        instance('fernDetail','#c5cdb4',x,terrain(x,s)-.02,-s,sc,sc*.85,sc,s*2.4);
      }
    }
    for(let i=0;i<24;i++){
      const s=197+i*.9,side=i%2?1:-1,x=riverX(s)+side*(3.0+.4*Math.sin(i));
      if(Math.abs(x-pathX(s))<2.5)continue;
      const sc=.72+.50*Math.sin(i*2.3)**2;instance('fernDetail','#b8c69d',x,terrain(x,s)-.02,-s,sc,sc*(.68+.25*Math.cos(i)**2),sc,i*2.4);
    }
  }
  // Small submerged stones, clustered instead of a uniformly tiled creek bed.
  for(let i=0;i<220;i++){
    const s=184+i*.25,x=riverX(s)+Math.sin(i*2.399)*1.65,y=terrain(x,s);
    if(y>elevation(s)-.84||Math.abs(x-pathX(s))<1.8)continue;
    const r=.09+.10*(.5+.5*Math.sin(i*1.71));
    instance(i%2?'rock1':'rock2',['#afb6a2','#bcb093','#879d95'][i%3],x,y+.025,-s,r*1.65,r*.46,r,i);
  }
  // Low flowers gather in a few bank pockets; activity targets and the deck stay clear.
  for(let k=0;k<16;k++){
    const s=190+k*3.1,x=pathX(s)+(k%2?1:-1)*(3.5+.5*Math.sin(k*1.7));
    if(nearRiver(x,s,2.6)||onBridge(s))continue;
    for(let j=0;j<3;j++){
      const px=x+.26*Math.cos(j*2.4+k),ss=s+.28*Math.sin(j*2.4+k),y=terrain(px,ss),h=.15+j*.025;
      instance('stem','#64804d',px,y+h/2,-ss,.009,h,.009);
      for(let n=0;n<6;n++){const a=n*Math.PI/3;instance('petal','#f2eed9',px+Math.cos(a)*.055,y+h,-ss+Math.sin(a)*.055,.052,.016,.035,a);}
      instance('petal','#cbaa4e',px,y+h+.008,-ss,.027,.018,.027);
    }
  }
  // Redistribute existing low plants into pockets; keep the path and activity clearings open.
  for(const {kind,items} of groups.values())if(['grass','fern','shrub','shrub1'].includes(kind)){
    for(const p of items){const s=-p.z,side=Math.sign(p.x-pathX(s)),distance=Math.abs(p.x-pathX(s));
      if(distance<2.8||distance>20||onBridge(s)||clearing(p.x,s))continue;
      const pocket=3.4+2.6*(.5+.5*Math.sin(s*.19+side*2.4));
      const blend=distance>14?.28:.45;
      const nx=pathX(s)+side*(distance*(1-blend)+pocket*blend);
      if(nearRiver(nx,s,2.8)||fallsCorridor(nx,s,.4))continue;
      p.y+=terrain(nx,s)-terrain(p.x,s);p.x=nx;const scale=.78+.38*(.5+.5*Math.sin(s*.57+side));
      const layer=kind.startsWith('shrub')?.82+.34*smoothstep(Math.abs(nx-pathX(s)),4,11):kind==='grass'?.82:1;
      p.sx*=scale;p.sy*=scale*layer;p.sz*=scale;
    }
  }
  // Small clearings keep generated rocks and shrubs from piercing the animals.
  const animalClearings=Object.entries(ENCOUNTER_SITES).flatMap(([id,sites])=>sites.map(s=>({...worldAt(s,ANIMALS.find(a=>a.id===id).offset),radius:id==='deer'?2:1.2}))).concat([{...worldAt(475,3.6),radius:1.1}]);
  for(const group of groups.values())group.items=group.items.filter(p=>!animalClearings.some(c=>Math.hypot(p.x-c.x,p.z-c.z)<c.radius+Math.min(1,Math.max(p.sx,p.sz)*.35)));
  const forestChunks=[],forestMaterialsByKind=new Map(),forestDepthByKind=new Map();
  for(const {kind,items} of groups.values()){if(!items.length)continue;const stone=surfaces.stone;const m=mat('#ffffff',kind.startsWith('garden_')?{vertexColors:true,side:T.DoubleSide,roughness:.86}:kind==='fernDetail'?{map:fernProp.map,side:T.DoubleSide,roughness:.95,bumpMap:fernProp.map,bumpScale:.008}:kind.startsWith('tree')?{vertexColors:true,color:'#ead6b7',map:surfaces.bark,normalMap:surfaces.barkNormal,normalScale:new T.Vector2(.48,.48),roughnessMap:surfaces.barkRough}:kind==='leaf'?{map:foliage,alphaTest:.44,vertexColors:true,side:T.DoubleSide,emissive:'#53613a',emissiveIntensity:.025,roughness:.78}:['grass','fern','shrub','shrub1'].includes(kind)?{vertexColors:true,side:T.DoubleSide}:kind.startsWith('rock')?{vertexColors:true,map:stone,bumpMap:stone,bumpScale:.065}:{});const inst=new T.InstancedMesh(kind.startsWith('rock')?geos[kind].clone():geos[kind],m,items.length);for(let i=0;i<items.length;i++){const p=items[i];dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx,p.sy*(kind==='shrub'?.76:1),p.sz);dummy.rotation.set(0,p.ry,p.rz);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);col.set(p.color);if(kind.startsWith('shrub'))col.lerp(new T.Color('#779987'),.10);else if(kind==='fern')col.lerp(new T.Color('#98a76e'),.12);if(['leaf','shrub','shrub1','fern'].includes(kind)){const warm=.5+.5*Math.sin(p.x*.7+p.z*.23);col.lerp(new T.Color('#c7d29b'),warm*.12);col.multiplyScalar(.88+.12*warm);}inst.setColorAt(i,col);}if(kind==='leaf'){m.alphaToCoverage=true;inst.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:foliage,alphaTest:.44,side:T.DoubleSide});breeze(m);breeze(inst.customDepthMaterial);
      const leafWind=m.onBeforeCompile;m.onBeforeCompile=shader=>{leafWind(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 leafSide=gl_FrontFacing?vec3(1.03,1.02,.96):vec3(1.09,1.14,.98);
        diffuseColor.rgb*=leafSide;
      `).replace('#include <map_fragment>',`#include <map_fragment>
        // Recover the existing leaf veins without another texture lookup.
        float leafTone=dot(sampledDiffuseColor.rgb,vec3(.21,.72,.07));
        diffuseColor.rgb*=mix(.96,1.13,smoothstep(.10,.62,leafTone));
      `).replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
        // shortcut: ambient leaf-back bounce; use physical transmission only with a measured GPU budget.
        reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.045,.055,.025)*(gl_FrontFacing?.25:1.)*smoothstep(.08,.48,leafTone);
      `);};m.customProgramCacheKey=()=> 'canopy-leaf-detail-v5';}if(kind==='grass'||kind==='fern'||kind==='fernDetail'){breeze(m,kind==='grass'?.9:.6);}if(kind.startsWith('rock')){softenMap(m,.72);mineralDetail(m,surfaces.floor);inst.geometry.setAttribute('waterLevel',new T.InstancedBufferAttribute(new Float32Array(items.map(p=>{const s=-p.z;return nearRiver(p.x,s,2.5)&&s<RIVER.end-8?elevation(s)-.74:-999;})),1));caustics(m);}if(kind.startsWith('shrub'))m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vLeaf;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLeaf=uv;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vLeaf;').replace('#include <color_fragment>',`#include <color_fragment>
        float veinAA=max(.002,fwidth(vLeaf.x));
        float mid=1.-smoothstep(.008,.020+veinAA,abs(vLeaf.x-.5));
        float veinPhase=(vLeaf.y-abs(vLeaf.x-.5)*(.48+.35*vLeaf.y))*43.;
        float branches=pow(max(0.,cos(veinPhase)),18.)*(1.-smoothstep(.30,.49,abs(vLeaf.x-.5)))*(1.-smoothstep(.35,1.2,fwidth(veinPhase)));
        float edge=smoothstep(.27,.49,abs(vLeaf.x-.5));
        branches*=smoothstep(.02,.17,vLeaf.y)*(1.-smoothstep(.78,1.,vLeaf.y));
        diffuseColor.rgb*=.96+.10*mid+.065*branches;
        diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,1.08,.91),edge*.28);
        if(!gl_FrontFacing)diffuseColor.rgb*=vec3(.94,1.02,.92);`).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        roughnessFactor=clamp(.79+.12*abs(vLeaf.x-.5)*2.,.79,.91);`);
    };if(kind.startsWith('tree')){
      softenMap(m,.96);softenDistantRelief(m);
    }
    // Chunks vary by instance data, not material; share identical shader state across the trail.
    if(forestMaterialsByKind.has(kind)){m.dispose();inst.material=forestMaterialsByKind.get(kind);}else forestMaterialsByKind.set(kind,m);
    if(inst.customDepthMaterial){if(forestDepthByKind.has(kind)){inst.customDepthMaterial.dispose();inst.customDepthMaterial=forestDepthByKind.get(kind);}else forestDepthByKind.set(kind,inst.customDepthMaterial);}
    inst.castShadow=kind.startsWith('tree')||kind==='leaf'||kind==='shrub'||kind.startsWith('rock');inst.receiveShadow=true;inst.computeBoundingSphere();inst.updateMatrix();inst.matrixAutoUpdate=false;scene.add(inst);forestChunks.push({mesh:inst,kind,from:Math.min(...items.map(p=>-p.z)),to:Math.max(...items.map(p=>-p.z)),shadow:inst.castShadow});}
  const contacts=[];
  for(const {kind,items} of groups.values())if(kind.startsWith('tree')||kind.startsWith('rock')||kind==='shrub')for(const p of items){
    const s=-p.z;if(nearRiver(p.x,s,2.5)||kind==='shrub'&&p.sy<1.1||kind.startsWith('rock')&&p.sx<.4)continue;
    const onPath=Math.abs(p.x-pathX(s))<1.95,y=onPath?elevation(s)+.078:terrain(p.x,s)+.018;
    contacts.push({...p,y,r:kind.startsWith('tree')?.95:kind==='shrub'?.7:.88});
  }
  const shadows=new T.InstancedMesh(contactPlane,contactMat,contacts.length);
  contacts.forEach((p,i)=>{const s=-p.z,dx=(terrain(p.x+.1,s)-terrain(p.x-.1,s))/.2,dz=(terrain(p.x,s-.1)-terrain(p.x,s+.1))/.2;dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.sx*p.r,1,p.sz*p.r);dummy.rotation.set(-Math.atan(dz),0,Math.atan(dx));dummy.updateMatrix();shadows.setMatrixAt(i,dummy.matrix);});shadows.computeBoundingSphere();scene.add(shadows);
  // G08: the bark canvas has its streaks along v. Posts/legs (vertical members) use it as is; every horizontal plank/rail uses a
  // rotated clone (streaks along u = along the length of an x-long box or a tube) with 2.4–3.4 tiles per piece and a per-material
  // offset, so grain runs along the timber instead of a single stretched tile across it and adjacent planks don't repeat knots.
  const woodGrain=barkTexture();woodGrain.repeat.set(1,1);
  const grainAlong=(offset=0,repeat=3)=>{const t=woodGrain.clone();t.center.set(.5,.5);t.rotation=Math.PI/2;t.repeat.set(repeat,1);t.offset.set(offset,0);t.needsUpdate=true;return t;};
  const plankGrain=grainAlong(0,3),wood=mat('#b4a184',{map:plankGrain,bumpMap:plankGrain,bumpScale:.018}),darkWood=mat('#8d806c',{map:woodGrain}),darkPlank=mat('#8d806c',{map:grainAlong(.37,2.6),bumpMap:plankGrain,bumpScale:.02});
  // Creek bridge: the miniature-styled timber bridge from bridge.mjs (rounded planks/posts/rails, wood + moss + rock assets)
  // over BRIDGE.from-1 .. BRIDGE.to+1. The previous box/bag-geometry bridge that stood here was removed with it, so only one
  // bridge is drawn; trail collision (halfWidth) is unchanged. Missing textures/JSON fall back inside createBridge.
  const bridge=await createBridge(scene,BRIDGE);
  // Reuse the approved cedar texture for the shelter and summit instead of drawn stripes.
  const cedar=bridge.children.find(m=>m.material?.map)?.material.map;
  if(cedar){for(const [material,repeat] of [[wood,3],[darkPlank,2.6]]){const t=cedar.clone();t.rotation=Math.PI/2;t.repeat.set(repeat,.7);t.offset.set(.17,0);material.map=material.bumpMap=t;material.bumpScale=.022;material.roughness=.96;material.needsUpdate=true;}}
  // Stone steps through the fork lanes and up to the shelter.
  const stoneSteps=[0,1,2].map(stoneStepGeometry),stepMat=softenMap(mat('#ffffff',{map:surfaces.stone,bumpMap:surfaces.stone,bumpScale:.035,vertexColors:true}),.65);
  // G02: stride 0.95~1.55 m, lane positions drift slowly, ~14% of slabs missing, wider size/turn range and a slight settle
  // tilt (≤.04 rad ≈ 2.6 cm over a slab) so the run reads as laid stones, not a stair generator. Top stays within clearance.
  const stepChunks=new Map();
  for(let s=256;s<344;s+=1.25+.3*Math.sin(s*1.7)+.12*Math.sin(s*.4)){
    const p=worldAt(s),steps=new T.Group();steps.position.set(p.x,p.y-.07,p.z);steps.rotation.y=-Math.atan(pathSlope(s));scene.add(steps);
    const gap=forkGap(s),lanes=gap>0?[-(gap+halfWidth(s))/2,(gap+halfWidth(s))/2]:[-1.25,0,1.25];
    for(const [k,lane] of lanes.entries()){if(rnd()<.14)continue;const sc=.78+.3*rnd();
      const slab=part(steps,stoneSteps[(k+Math.floor(s))%3],stepMat,[lane+.24*Math.sin(s*.6+k*2)+.1*Math.sin(s*2.9+k),.035-.02*rnd(),.34*Math.sin(k+s)+.12*(rnd()-.5)],[sc*(.89+.16*Math.sin(s+k*3)),.95,sc*(.70+.24*Math.sin(s+k))]);
      slab.rotation.y=.28*Math.sin(s*1.3+k*2);slab.rotation.z=.04*Math.sin(s*2.1+k);slab.rotation.x=.03*Math.cos(s*1.7+k*3);}
    const key=Math.floor(s/20);if(!stepChunks.has(key)){const chunk=new T.Group();chunk.name='trail-stones';scene.add(chunk);stepChunks.set(key,chunk);}
    const chunk=stepChunks.get(key);steps.updateMatrixWorld(true);
    for(const slab of [...steps.children])chunk.attach(slab);scene.remove(steps);
  }
  // Keep the same stones and transforms, but submit nearby copies together.
  for(const chunk of stepChunks.values()){batchBridgeParts(chunk);for(const mesh of chunk.children)mesh.name='trail-stone-batch';}
  // Immutable waterbars share materials and nearby draw submissions without changing their transforms.
  const waterbarChunks=new Map(),edgingStone=mat('#9ca58b',{vertexColors:true});
  // Low timber waterbars and stone edging read as an ascending mountain trail.
  for(const [a,b] of [[125,160],[222,250],[430,468],[486,520],[584,625],[652,690]])for(let s=a;s<=b;s+=3.2+Math.sin(s)*.45){
    const p=worldAt(s),g=new T.Group();g.position.set(p.x,p.y-.05,p.z);g.rotation.y=-Math.atan(pathSlope(s));scene.add(g);
    part(g,box,darkPlank,[0,0,0],[3.9,.10,.14]);
    for(const side of [-1,1])part(g,geos.rock,edgingStone,[side*2.25,.06,0],[.28,.23,.3]);
    const key=Math.floor(s/20);if(!waterbarChunks.has(key)){const chunk=new T.Group();chunk.name='waterbar-chunk';scene.add(chunk);waterbarChunks.set(key,chunk);}g.updateMatrixWorld(true);for(const mesh of [...g.children])waterbarChunks.get(key).attach(mesh);scene.remove(g);
  }
  for(const chunk of waterbarChunks.values()){batchBridgeParts(chunk);chunk.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});}
  // Seats share the instanced contact-shadow material so they sit on the ground instead of floating on a lit patch.
  function seatContact(g,sx,sz){const c=new T.Mesh(contactPlane,contactMat);c.scale.set(sx,1,sz);c.position.y=.012;g.add(c);}
  function bench(s,offset){const p=worldAt(s,offset),g=new T.Group();g.position.set(p.x,p.y,p.z);g.rotation.y=-Math.PI/2;scene.add(g);seatContact(g,1.12,.42);for(const x of [-.7,.7])for(const z of [-.23,.23])part(g,box,darkWood,[x,.23,z],[.12,.46,.12]);for(let i=0;i<3;i++)part(g,box,wood,[0,.5,-.25+i*.25],[1.9,.1,.21]);part(g,box,wood,[0,.88,-.4],[1.9,.18,.1]);for(const x of [-.7,.7])part(g,box,darkWood,[x,.66,-.4],[.09,.52,.09]);batchBridgeParts(g);return g;}
  function log(s,offset,yaw){const p=worldAt(s,offset),g=new T.Group();g.position.set(p.x,p.y,p.z);g.rotation.y=yaw;scene.add(g);seatContact(g,1.3,.36);const trunk=part(g,cylinder,softenMap(mat('#a88c66',{map:surfaces.bark,bumpMap:surfaces.bark,bumpScale:.05}),.9),[0,.28,0],[.27,2.2,.27]);trunk.rotation.z=Math.PI/2;for(const x of [-1.1,1.1])part(g,cylinder,mat('#d9c7a3'),[x,.28,0],[.26,.02,.26]).rotation.z=Math.PI/2;return g;}
  bench(115,-3);
  const seatGroups=[bench(seats[0].s,seats[0].offset),log(seats[1].s,seats[1].offset,seats[1].yaw)];seatGroups[0].rotation.y=seats[0].yaw;
  const friendBench=bench(372,-3.1);friendBench.rotation.y=.2;bench(708,-3.2);
  const quietBench=bench(200,-4);quietBench.rotation.y=Math.PI/2;
  // Friends along the trail. Procedural children are created at once (so the scene is complete immediately); when the
  // parent's npc.mjs and its Tripo assets are present, each is swapped for the Tripo friend/boy at the same place and pose.
  // `friends` is the live slot table: update() always poses whatever currently sits in a slot.
  const friends={seated:createChild(scene,'#819eb7',false,1),watcher:createChild(scene,'#94a47a',false,2,1),gateFriend:createChild(scene,'#c76f5b',false,3,2),shelterFriend:createChild(scene,'#7fa36b',false,0,1),summitFriend:createChild(scene,'#b48bc4',false,2)};
  // Each friend owns a small deterministic motion state (lib/npcmotion.mjs, trail coordinates) whose home is the reviewed
  // position above; the ground reference per friend is the one that position already used (bench/trail height = elevation,
  // creek bank = terrain), so a friend walking a few metres from a bench stays on the same reference and never hops.
  const friendGround={seated:s=>elevation(s)+.09,watcher:(s,x)=>terrain(x,s)+.08,gateFriend:s=>elevation(s)+.09,shelterFriend:s=>elevation(s)+.09,summitFriend:s=>elevation(s)+.09};
  const motions=Object.fromEntries(Object.keys(friends).map(key=>[key,createMotion(friendRoutines[key].home)]));
  const holds=Object.fromEntries(Object.keys(friends).map(key=>[key,holdAt(friendRoutines[key].home)]));
  function settle(key){const m=motions[key],actor=friends[key],x=pathX(m.s)+m.offset;actor.root.position.set(x,friendGround[key](m.s,x),-m.s);actor.root.rotation.y=m.yaw;}
  for(const key of Object.keys(friends))settle(key);
  const npcKinds={seated:'friend',watcher:'boy',gateFriend:'friend',shelterFriend:'friend',summitFriend:'friend'};
  const upgrades=npcModule.then(m=>m&&Promise.allSettled(Object.keys(friends).map(async key=>{
    const actor=await m.loadNPC(scene,npcKinds[key]),old=friends[key];
    actor.root.position.copy(old.root.position);actor.root.rotation.copy(old.root.rotation);scene.remove(old.root);friends[key]=actor;
  }))).catch(()=>null);
  // Side posts mark the entrance without crossing the follow-camera sightline.
  for(const side of [-1,1]){const p=worldAt(3,side*2.6);part(scene,cylinder,darkWood,[p.x,p.y+1.1,p.z],[.11,2.2,.11]);part(scene,sphere,wood,[p.x,p.y+2.22,p.z],[.14,.08,.14]);}
  const posts=[];
  // G08: signs are no longer a paper-thin double-sided plane on one stick: a 6 cm framed board (darkPlank box) carries a face
  // on each side (the back is not mirrored any more), hangs between two posts with caps, and each post foot gets a small
  // contact ellipse. Positions/labels unchanged. (G10: the one-post `plaque` variant was removed with the summit plaque.)
  function sign(s,label,offset=-3){const plaque=false;const p=worldAt(s,offset),c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#765231';ctx.fillRect(0,0,512,160);for(let i=0;i<25;i++){ctx.strokeStyle=i%2?'#d4b88355':'#33281550';ctx.lineWidth=1+i%3;ctx.beginPath();ctx.moveTo(0,i*7);ctx.bezierCurveTo(140,i*7-8,350,i*7+10,512,i*7-2);ctx.stroke();}ctx.strokeStyle='#4f3824';ctx.lineWidth=10;ctx.strokeRect(5,5,502,150);ctx.fillStyle='#fff0cd';ctx.font=`600 ${plaque?58:50}px SUIT, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,80);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
    const w=plaque?.78:1.8,h=plaque?.26:.56,top=plaque?1.18:1.2,g=new T.Group();g.position.set(p.x,p.y,p.z);scene.add(g);
    const face=new T.MeshStandardMaterial({map:tex,roughness:1,toneMapped:false});
    part(g,box,darkPlank,[0,top,0],[w+.08,h+.08,.06]);
    for(const dir of [1,-1]){const m=new T.Mesh(new T.PlaneGeometry(w,h),face);m.position.set(0,top,dir*.0315);m.rotation.y=dir<0?Math.PI:0;g.add(m);}
    const legs=plaque?[0]:[-(w/2-.12),w/2-.12];
    for(const x of legs){part(g,box,darkWood,[x,(top+h/2+.04)/2,0],[.09,top+h/2+.04,.09]);part(g,sphere,wood,[x,top+h/2+.05,0],[.07,.045,.07]);const c=new T.Mesh(contactPlane,contactMat);c.scale.set(.19,1,.15);c.position.set(x,.012,0);g.add(c);}
    g.userData.s=s;posts.push(g);}
  const waymarkers=createWaymarkers(scene,darkPlank,cedar?.image,contactPlane,contactMat);posts.push(...waymarkers.groups);
  // G10: the G08 '바람봉 · 105 m' plaque (s717.4) is removed — it doubled the existing '바람봉' sign at s714 and its height did not
  // match the HUD (106 m). One summit sign, name only.
  // Summit platform: timber deck, end railing and side rails.
  // G08: five plank materials with grain along the board, each with its own tile offset/count and a slight warm/cool and
  // roughness drift; joints follow a 4-row stagger instead of a 2-row zigzag. Heights unchanged (deck stays level and flush).
  const deckWoods=[['#bfb49e',3.1,.93],['#cec4ae',2.6,.96],['#aea58f',3.4,.92],['#c4baa7',2.8,.95],['#b8ae99',3.2,.94]].map(([color,rep,rough],i)=>{const g=cedar?cedar.clone():grainAlong(i*.21,rep);if(cedar){g.rotation=Math.PI/2;g.repeat.set(.48,.7);g.offset.set(i*.17,i*.09);}return mat(color,{map:g,bumpMap:g,bumpScale:.014,roughness:rough});});
  // World-space grain stays the same size on both short and long deck boards.
  for(const material of deckWoods){
    material.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vDeck;').replace('#include <begin_vertex>','#include <begin_vertex>\nvDeck=(modelMatrix*vec4(position,1.)).xyz;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vDeck;').replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replaceAll('vMapUv','vec2(vDeck.z*.65,vDeck.x*.16)')).replace('#include <color_fragment>',`#include <color_fragment>
        float deckPhase=vDeck.z*110.+sin(vDeck.x*1.6+vDeck.z*3.)*1.2;
        float deckAA=1.-smoothstep(.6,1.6,fwidth(deckPhase));
        float worn=.5+.5*sin(vDeck.x*.7+vDeck.z*2.3);
        diffuseColor.rgb*=vec3(1.025,.99,.94)*(.96+.045*worn+.018*sin(deckPhase)*deckAA);
      `);
    };material.customProgramCacheKey=()=> 'deck-world-grain';
  }
  const nails=new T.InstancedMesh(cylinder,mat('#665844'),160);let nailIndex=0;
  for(let row=0;row<=36;row++){const s=SUMMIT.from+2+row*.5,p=worldAt(s),joint=[1.2,-1.2,2.6,-.4][row%4];
    for(const [left,right] of [[-4.5,joint],[joint,4.5]])part(scene,box,deckWoods[(row*3+(left<joint?0:2))%5],[p.x+(left+right)/2,p.y-.025,p.z],[right-left-.018,.12,.46]);
    for(const x of [-4.3,joint-.12,joint+.12,4.3]){dummy.position.set(p.x+x,p.y+.04,p.z);dummy.scale.set(.019,.008,.019);dummy.rotation.set(0,0,0);dummy.updateMatrix();nails.setMatrixAt(nailIndex++,dummy.matrix);}
  }
  nails.count=nailIndex;nails.computeBoundingSphere();scene.add(nails);
  // Fascia boards close the deck edge at the rail and along both sides, so the falling ground behind the rail never shows a
  // gap under the planks (the end board sits 2 cm behind the last plank row, below the walking surface).
  {const end=worldAt(SUMMIT.rail+.27),midS=(SUMMIT.from+2+SUMMIT.rail)/2,mid=worldAt(midS);part(scene,box,darkPlank,[end.x,end.y-.1,end.z],[9.1,.26,.08]);
    for(const side of [-1,1]){const f=part(scene,box,darkPlank,[mid.x+side*4.53,mid.y-.1,mid.z],[SUMMIT.rail-SUMMIT.from-2+.5,.26,.08]);f.rotation.y=Math.PI/2-Math.atan(pathSlope(midS));}}
  for(let i=-4;i<=4;i+=2){const p=worldAt(SUMMIT.rail,i);part(scene,cylinder,darkWood,[p.x,p.y+.55,p.z],[.105,1.1,.105]);part(scene,sphere,wood,[p.x,p.y+1.12,p.z],[.12,.07,.12]);}const end=worldAt(SUMMIT.rail);for(const h of [.48,1])part(scene,box,wood,[end.x,end.y+h,end.z],[9,.14,.14]);
  // Side rails are x-long boxes turned 90° so their grain also runs along the rail.
  for(const side of [-1,1])for(let s=SUMMIT.from+3;s<=SUMMIT.rail;s+=3){const p=worldAt(s,side*4.4);part(scene,cylinder,darkWood,[p.x,p.y+.52,p.z],[.09,1.05,.09]);if(s<SUMMIT.rail){const rail=part(scene,box,wood,[p.x,p.y+1,p.z-1.5],[3.1,.14,.14]);rail.rotation.y=Math.PI/2-Math.atan(pathSlope(s));}}
  // Rope fence on the valley side of the ridge.
  for(let s=526;s<640;s+=3.5){const p=worldAt(s,-2.75);part(scene,cylinder,darkWood,[p.x,p.y+.4,p.z],[.055,.8,.055]);}
  const ropePoints=[];for(let s=526;s<=638;s+=.5){const p=worldAt(s,-2.75);ropePoints.push(new T.Vector3(p.x,p.y+.65-.09*Math.sin((s-526)/3.5*Math.PI)**2,p.z));}
  const rope=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ropePoints),220,.025,5,false),mat('#d7c6a0'));scene.add(rope);
  // Lookout rock on the ridge: a flat slab where the child can turn and look down the valley.
  {const p=worldAt(578,-3.3);part(scene,geos.rock1,softenMap(mat('#c9ccba',{vertexColors:true,map:surfaces.stone}),.7),[p.x,terrain(p.x,578)+.05,p.z],[1.9,.55,1.5]);}
  sign(714,'바람봉',3.35);
  function bird(){
    const g=new T.Group(),back=mat('#697574'),cream=mat('#e5d5ac'),dark=mat('#293733'),wing=mat('#4c5c59');
    part(g,sphere,back,[0,0,0],[.15,.18,.25]);part(g,sphere,cream,[0,-.035,.12],[.125,.14,.15]);
    const head=new T.Group();head.position.set(0,.19,.13);g.add(head);g.userData.head=head;
    part(head,sphere,dark,[0,0,0],[.12,.115,.13]);
    for(const side of [-1,1]){part(head,sphere,cream,[side*.098,-.025,.04],[.03,.055,.07]);
      part(head,sphere,mat('#171f1c'),[side*.105,.02,.082],[.019,.022,.014]);part(head,sphere,mat('#fff9dc'),[side*.114,.027,.091],[.006,.007,.005]);
      const w=part(g,sphere,wing,[side*.12,.015,-.035],[.06,.14,.21]);w.rotation.z=side*.18;
      const stripe=part(g,sphere,cream,[side*.158,.018,.01],[.012,.022,.13]);stripe.rotation.x=-.25;
      const foot=part(g,cylinder,mat('#8b7760'),[side*.07,-.19,.02],[.012,.11,.012]);foot.rotation.x=-.2;
      part(g,sphere,dark,[side*.07,-.24,.065],[.035,.012,.06]);}
    const beak=part(head,cone,mat('#736249'),[0,-.008,.165],[.04,.105,.028]);beak.rotation.x=Math.PI/2;
    for(const side of [-1,0,1]){const tail=part(g,sphere,wing,[side*.038,-.025,-.285],[.032,.025,.15]);tail.rotation.x=-.22;tail.rotation.y=side*.12;}
    return g;
  }
  const birdBark=softenMap(mat('#ded4ba',{map:surfaces.bark,bumpMap:surfaces.bark,bumpScale:.04}),.78);
  // A perch is a swaying branch group: the sway is the silent cue that something sits there.
  function perch(s,offset,phase){const bp=worldAt(s,offset),g=new T.Group();g.position.set(bp.x+1.45,bp.y+1.8,bp.z);scene.add(g);
    const branch=new T.CatmullRomCurve3([new T.Vector3(0,0,.05),new T.Vector3(-.65,-.25,0),new T.Vector3(-1.75,-.24,-.1)]);g.add(new T.Mesh(new T.TubeGeometry(branch,12,.065,7,false),birdBark));
    const songbird=bird();songbird.position.set(-1.45,0,0);g.add(songbird);
    part(scene,geos.tree0,birdBark,[bp.x+1.45,terrain(bp.x+1.45,s),bp.z],[.68,.68,.68]);for(let j=0;j<6;j++)part(scene,geos.leaf,mat(j%2?'#d8e0bd':'#c4d5ae',{map:foliage,alphaTest:.44,side:T.DoubleSide,vertexColors:true}),[bp.x+1.45+Math.cos(j)*1.1,bp.y+5.8+(j%2)*.6,bp.z+Math.sin(j)*1.1],[1.4,1,1.4]).customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:foliage,alphaTest:.44,side:T.DoubleSide});
    return {group:g,bird:songbird,base:bp,phase};}
  const perches=[perch(115,2.8,0),perch(142,2.6,2.1)];const songbird=perches[0].bird,bp=perches[0].base;
  const furMap=surfaceTexture('fur');furMap.repeat.set(2,2);const squirrel=new T.Group(),fur=softenMap(new T.MeshPhysicalMaterial({color:'#a56830',map:furMap,bumpMap:furMap,bumpScale:.012,roughness:.92,sheen:.75,sheenColor:'#eab76e',sheenRoughness:.75,side:T.DoubleSide}),.66),belly=mat('#efd7af');part(squirrel,sphere,fur,[0,.28,0],[.18,.29,.22]);part(squirrel,sphere,belly,[0,.28,.15],[.12,.21,.1]);const sqHead=new T.Group();sqHead.position.set(0,.53,.1);squirrel.add(sqHead);part(sqHead,sphere,fur,[0,0,0],[.18,.17,.20]);for(const x of [-.13,.13]){part(sqHead,sphere,fur,[x,.16,-.01],[.07,.11,.05]);part(sqHead,sphere,mat('#211d1a'),[x*.78,.025,.16],[.025,.03,.019]);}part(sqHead,sphere,belly,[0,-.04,.175],[.086,.063,.085]);part(sqHead,sphere,mat('#32251e'),[0,-.02,.248],[.024,.021,.02]);for(const x of [-.10,.10])part(squirrel,sphere,fur,[x,.27,.21],[.043,.08,.048]);part(squirrel,sphere,mat('#bd9860'),[0,.29,.25],[.049,.066,.045]);const tail=new T.Group();tail.position.set(0,.16,-.17);squirrel.add(tail);
  squirrel.scale.setScalar(.84);
  const tailGeo=squirrelTailGeometry();
  // Tiny tufts cast blocky self-shadows at the scene shadow resolution.
  const tailFur=fur.clone();tailFur.vertexColors=true;tailFur.onBeforeCompile=fur.onBeforeCompile;const tailMesh=part(tail,tailGeo,tailFur,[0,0,0],[1,1,1]);tailMesh.receiveShadow=false;tail.rotation.x=-.20;
  for(const x of [-.13,.13]){part(sqHead,sphere,mat('#fff1cc'),[x*.78-.007,.035,.177],[.008,.009,.006]);part(sqHead,sphere,mat('#c49b70'),[x,.165,.027],[.037,.068,.015]);}
  for(const x of [-.12,.12])part(squirrel,sphere,fur,[x,.065,.12],[.085,.06,.14]);scene.add(squirrel);
  const wildlife=createWildlife(scene,squirrel);
  const sp=worldAt(475,3.6);
  // The squirrel's bush and climbing tree: the bush shakes as a silent cue, the trunk is where it climbs.
  const rustleBush=part(scene,geos.shrub,mat('#9fbd7c',{vertexColors:true,side:T.DoubleSide}),[sp.x+1.5,terrain(sp.x+1.5,476),-476],[1.3,1.1,1.3]);
  const climbTree=worldAt(478.5,5.6);climbTree.y=terrain(climbTree.x,478.5);part(scene,geos.tree0,birdBark,[climbTree.x,climbTree.y,climbTree.z],[.8,.8,.8]);
  for(let j=0;j<6;j++)part(scene,geos.leaf,mat(j%2?'#c9d8ae':'#b5c99e',{map:foliage,alphaTest:.44,side:T.DoubleSide,vertexColors:true}),[climbTree.x+Math.cos(j)*1.3,climbTree.y+6.8+(j%2)*.7,climbTree.z+Math.sin(j)*1.3],[1.6,1.1,1.6]).customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:foliage,alphaTest:.44,side:T.DoubleSide});
  // Flower-lane butterfly (life.mjs ANIMALS 'butterfly'): flutters over the flowers of the left lane and settles on one while the
  // child looks at it for the journal. A thin body between the two wings so it reads at a couple of metres.
  const butterfly=new T.Group(),wings=[];
  const wingShape=new T.Shape();wingShape.moveTo(0,0);wingShape.bezierCurveTo(.09,.24,.32,.25,.28,.06);wingShape.bezierCurveTo(.23,-.01,.26,-.12,.13,-.16);wingShape.bezierCurveTo(.04,-.18,.02,-.07,0,0);
  const wingGeo=new T.ShapeGeometry(wingShape,10);wingGeo.rotateX(-Math.PI/2);
  for(const side of [-1,1]){const w=new T.Group();w.scale.x=side;butterfly.add(w);wings.push(w);const membrane=new T.Mesh(wingGeo,mat('#e7cb63',{side:T.DoubleSide}));w.add(membrane);
    for(const [x,z,r] of [[.19,-.12,.027],[.16,.085,.018]]){const spot=new T.Mesh(new T.CircleGeometry(r,14).rotateX(-Math.PI/2),mat('#876e3c',{side:T.DoubleSide}));spot.position.set(x,.002,z);w.add(spot);}}
  for(const side of [-1,1]){const antenna=part(butterfly,cylinder,mat('#57452e'),[side*.025,.025,.085],[.004,.08,.004]);antenna.rotation.z=side*.4;}

  part(butterfly,sphere,mat('#4a3a2a'),[0,0,0],[.018,.012,.07]);scene.add(butterfly);
  const butterflySpot=ANIMALS.find(a=>a.id==='butterfly'),butterflyHome=worldAt(butterflySpot.s,butterflySpot.offset);butterflyHome.y=terrain(butterflyHome.x,butterflySpot.s);
  const observationSignals=[];
  for(let i=0;i<3;i++){
    // G07: thinner, smaller arcs (tube .018→.012, radii .38/.59/.80→.30/.47/.64) so the song cue reads as a soft hum rather than a wifi badge; still three arcs for silent play.
    const signal=new T.Mesh(new T.TorusGeometry(.30+i*.17,.012,4,28,Math.PI*1.1),new T.MeshBasicMaterial({color:'#fff5bf',transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide}));
    scene.add(signal);observationSignals.push(signal);
  }
  // G04: a lobed leaf with stem and veins (vertex colours), ~.34 m across so a tablet can still find it from the bridge camera.
  const driftingLeaf=part(scene,floatingLeafGeometry(),mat('#ffffff',{vertexColors:true,side:T.DoubleSide,roughness:.85}),[0,0,0],[.34,.34,.34]);driftingLeaf.visible=false;
  const squirrelMemo={revealed:false,climbed:false};
  // ---- The four scenic places (trail.mjs SCENIC): 시냇물 leaf route, 폭포, 전망대, 정상. Visual objects only; the trail,
  // terrain() and the creek ribbon are untouched. ----
  const stoneMat=softenMap(mat('#c3c9b9',{vertexColors:true,map:surfaces.stone,bumpMap:surfaces.stone,bumpScale:.06}),.72);mineralDetail(stoneMat,surfaces.floor);
  // 시냇물: two stones the followed leaf catches on (a pause at 194.2, its resting place at 188), just off the channel centre.
  const LEAF_ROUTE={start:BRIDGE.from-5,pause:194.2,rest:188};
  for(const [s,off,r] of [[LEAF_ROUTE.pause,.75,.30],[LEAF_ROUTE.rest,1.15,.42]])part(scene,geos.rock2,stoneMat,[riverX(s)+off,elevation(s)-.80,-s],[r,r*.6,r*.9]).rotation.y=s;
  // 폭포: a boulder ledge across the creek above the shelter, a 3.1 m falling sheet (same cascade shader as the small drops),
  // a lip pool on top, foam in the plunge pool, drifting spray and a rainbow arc that appears while the child watches.
  const fallsS=SCENIC.waterfall.s,fallsX=riverX(fallsS),poolY=elevation(fallsS-1)-.74,fallsTop=poolY+3.1;
  const falls={x:fallsX,y:poolY,z:-fallsS,top:fallsTop,s:fallsS};
  // Stones are placed by their real bounding box (bottom + wanted height), so stacking does not depend on the sculpted origin.
  const rockGeo=i=>{const g=[geos.rock,geos.rock1,geos.rock2][i%3];if(!g.boundingBox)g.computeBoundingBox();return g;};
  const placeStone=(i,x,bottom,z,width,height,depth,ry=0)=>{const g=rockGeo(i),bb=g.boundingBox,sy=height/Math.max(.05,bb.max.y-bb.min.y),sx=width/Math.max(.05,bb.max.x-bb.min.x),sz=depth/Math.max(.05,bb.max.z-bb.min.z);const rock=part(scene,g,stoneMat,[x,bottom-bb.min.y*sy,z],[sx,sy,sz]);rock.rotation.y=ry;return rock;};
  // [x offset, s offset behind the pool, width, bottom above the pool, height, depth, yaw]: a front row the sheet pours over
  // (tops ~2.6 m), a taller row behind it (tops ~3.5 m) and a third row hiding the creek ribbon joint (tops ~3.9 m).
  const ledge=[[-2.3,.2,2.2,-.5,3.0,2.0,.3],[-.9,.6,2.0,-.5,3.1,2.1,1.2],[.8,.5,2.1,-.5,3.1,2.0,2.2],[2.3,.1,2.0,-.5,2.9,1.9,.7],[-1.6,2.0,2.4,.2,3.3,2.2,1.9],[.6,2.2,2.5,.2,3.4,2.2,.4],[2.5,2.3,2.0,.2,3.2,2.0,2.8],[-.4,3.8,2.7,.6,3.4,2.4,1.1],[1.9,4.0,2.3,.6,3.3,2.2,.2],[-3.4,1.2,1.9,-.6,2.0,1.8,2.5],[3.5,1.4,1.8,-.6,1.8,1.7,1.4]];
  ledge.forEach(([dx,ds,w,bottom,h,d,ry],i)=>{placeStone(i,fallsX+dx,poolY+bottom,-(fallsS+ds),w,h,d,ry).rotation.z=(i%2?-1:1)*.06;});
  {const sheet=new T.Mesh(fallingWater,cascadeMat);sheet.position.set(fallsX,fallsTop,-fallsS);sheet.scale.set(1.15,fallsTop-poolY,1.35);sheet.renderOrder=3;scene.add(sheet);
    // The cascade starts behind the ledge; no separate flat disc floating over the rocks.
    for(let i=0;i<4;i++){const ring=new T.Mesh(foamGeo,foamMat);const r=.9+i*.25;ring.scale.set(r,1,r);ring.position.set(fallsX-.9+i*.6,poolY+.015,-(fallsS-1.4-i*.35));scene.add(ring);ripples.push(ring);ring.userData={s:fallsS-1.4-i*.35,phase:i*1.7,radius:r,foam:true};}}
  // A shared soft alpha mask gives spray a vapor edge instead of visible spheres.
  const sprayCanvas=document.createElement('canvas');sprayCanvas.width=sprayCanvas.height=64;
  const sprayCtx=sprayCanvas.getContext('2d'),sprayFade=sprayCtx.createRadialGradient(32,32,0,32,32,32);
  sprayFade.addColorStop(0,'rgba(255,255,255,.7)');sprayFade.addColorStop(.4,'rgba(255,255,255,.35)');sprayFade.addColorStop(1,'rgba(255,255,255,0)');sprayCtx.fillStyle=sprayFade;sprayCtx.fillRect(0,0,64,64);
  const sprayMap=new T.CanvasTexture(sprayCanvas);
  const spray=Array.from({length:8},(_,i)=>{const m=new T.Sprite(new T.SpriteMaterial({map:sprayMap,color:'#e4f1ec',transparent:true,opacity:0,depthWrite:false}));m.userData.i=i;scene.add(m);return m;});
  const rainbow=new T.Group();rainbow.position.set(fallsX+.5,poolY+.75,-(fallsS-1.7));rainbow.rotation.y=-.35;scene.add(rainbow);
  ['#ff7b7b','#ffb65c','#ffe878','#8fd99a','#73b9ff','#b79bff'].forEach((color,i)=>{const arc=new T.Mesh(new T.RingGeometry(2.00-i*.11,2.11-i*.11,64,1,0,Math.PI),new T.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));arc.material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vBow;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBow=position.xy;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vBow;').replace('#include <color_fragment>',`#include <color_fragment>
        float edge=(length(vBow)-${(2.00-i*.11).toFixed(2)})/.11;
        diffuseColor.a*=smoothstep(0.,.28,edge)*(1.-smoothstep(.72,1.,edge))*smoothstep(0.,.65,vBow.y);
      `);};arc.material.customProgramCacheKey=()=> 'mist-bow-'+i;arc.castShadow=arc.receiveShadow=false;rainbow.add(arc);});
  rainbow.visible=false;
  // 전망대: a timber viewing rail on the valley edge of the lookout rock and a fingerpost naming the two directions.
  const labelTexture=(label,px=46)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#765231';ctx.fillRect(0,0,512,128);for(let i=0;i<18;i++){ctx.strokeStyle=i%2?'#d4b88355':'#33281550';ctx.lineWidth=1+i%3;ctx.beginPath();ctx.moveTo(0,i*7);ctx.bezierCurveTo(140,i*7-8,350,i*7+10,512,i*7-2);ctx.stroke();}ctx.strokeStyle='#4f3824';ctx.lineWidth=9;ctx.strokeRect(5,5,502,118);ctx.fillStyle='#fff0cd';ctx.font=`600 ${px}px SUIT, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,64);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;};
  {const ls=SCENIC.lookout.s;for(const s of [ls-2.2,ls+2.2]){const p=worldAt(s,-4.7);part(scene,cylinder,darkWood,[p.x,terrain(p.x,s)+.45,p.z],[.08,.95,.08]);part(scene,sphere,wood,[p.x,terrain(p.x,s)+.94,p.z],[.1,.06,.1]);}
    // The rail box's local z runs along the rail: rotation.y = atan2(dx,dz) maps +z onto the a→b direction.
    const a=worldAt(ls-2.2,-4.7),b=worldAt(ls+2.2,-4.7),rail=part(scene,box,wood,[(a.x+b.x)/2,(terrain(a.x,ls-2.2)+terrain(b.x,ls+2.2))/2+.86,(a.z+b.z)/2],[.12,.12,Math.hypot(b.x-a.x,b.z-a.z)]);rail.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);
    const fp=worldAt(ls+3.2,-3.0),fg=new T.Group();fg.position.set(fp.x,terrain(fp.x,ls+3.2),fp.z);scene.add(fg);part(fg,cylinder,darkWood,[0,1.0,0],[.07,2.0,.07]);part(fg,sphere,wood,[0,2.02,0],[.09,.06,.09]);
    // A board extends along local +x; rotation.y = yaw maps +x onto (cos yaw, -sin yaw): -π/2 points back down the trail (+z), +π/2 ahead (-z).
    for(const [label,h,yaw] of [['← 쉼터 계곡',1.35,-Math.PI*.5-.3],['바람봉 정상 →',1.68,Math.PI*.5-.15]]){const bg=new T.Group();bg.position.y=h;bg.rotation.y=yaw;fg.add(bg);part(bg,box,darkPlank,[.5,0,0],[1.06,.28,.05]);const face=new T.MeshStandardMaterial({map:labelTexture(label,54),roughness:1,toneMapped:false});for(const dir of [1,-1]){const m=new T.Mesh(new T.PlaneGeometry(1,.24),face);m.position.set(.5,0,dir*.027);m.rotation.y=dir<0?Math.PI:0;bg.add(m);}}}
  // 정상: a stone cairn (돌탑) and a flag pole with a yellow flag at the far end of the deck. (It is NOT visible from the lookout:
  // the 580–625 climb rises faster than the line of sight from 578, so the lookout gets its own nearer marker flag below.)
  let flag;
  {const cs=SCENIC.summit.s,cp=worldAt(cs,-3.6);[[.95,.34,.85,0],[.8,.30,.72,.4],[.66,.26,.6,-.5],[.52,.22,.48,1.1],[.4,.19,.36,-.2],[.28,.15,.26,.6]].reduce((y,[w,h,d,ry],i)=>{placeStone(i,cp.x+(i%2?.04:-.04),y,cp.z,w,h,d,ry);return y+h*.9;},cp.y-.12);
    const fp=worldAt(cs+.5,3.9);part(scene,cylinder,darkWood,[fp.x,fp.y+1.75,fp.z],[.05,3.5,.05]);part(scene,sphere,wood,[fp.x,fp.y+3.52,fp.z],[.08,.08,.08]);
    const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(1.05,-.22);shape.lineTo(0,-.5);flag=new T.Mesh(new T.ShapeGeometry(shape),mat('#f4ca62',{side:T.DoubleSide}));flag.position.set(fp.x,fp.y+3.42,fp.z);flag.castShadow=true;scene.add(flag);}
  // 전망대 → 정상 길잡이 깃발: a trail-marker pole with the same yellow flag on the next rise (604.5, valley edge just beyond the
  // rope fence at -2.75, inside the tree-free verge), ~27 m ahead of the lookout so "정상 쪽 보기" has a flag that is really in view.
  let marker;const lookoutFlag=(()=>{const ms=SCENIC.lookout.s+26.5,mp=worldAt(ms,-3.8),base=terrain(mp.x,ms);part(scene,cylinder,darkWood,[mp.x,base+1.6,mp.z],[.05,3.2,.05]);part(scene,sphere,wood,[mp.x,base+3.22,mp.z],[.08,.08,.08]);
    marker=new T.Mesh(flag.geometry,flag.material);marker.position.set(mp.x,base+3.12,mp.z);marker.castShadow=true;scene.add(marker);return new T.Vector3(mp.x,base,mp.z);})();
  const leafMemo={rested:false},fallsMemo={seen:false},photoMemo={posed:false,sliding:false},greetMemo={shelter:false,until:-1};let previousUpdate=0;
  // Hiking-life friend routines (life.mjs layouts): the shelter friend walks to the picnic mat and sits across from the child,
  // the summit friend sits by the noodle mat, the creek boy stands and waves when a piece of litter is picked up. Routine objects
  // are cached so setRoutine() sees the same identity each frame; only the held activity (sit ↔ eat) is swapped in place.
  const picnicRoutines=new Map(),mealPhase=spot=>[{at:[spot.s,spot.offset],yaw:spot.yaw,activity:'sit',seconds:Infinity}];
  const picnicRoutine=seat=>{if(!picnicRoutines.has(seat))picnicRoutines.set(seat,mealPhase(picnicLayout(seat).friend));return picnicRoutines.get(seat);};
  const noodleRoutine=mealPhase(NOODLE_SPOT.friend),cheerRoutine=[{at:[friendRoutines.watcher.home.s,friendRoutines.watcher.home.offset],yaw:'face',activity:'wave',seconds:Infinity}];
  // Leaf piles on the trail scatter when walked through: a walking-only reaction, no button.
  const piles=[[88,-.8],[104,.6],[128,-.3],[146,.9],[300,-.6],[405,.5],[450,-.6],[497,.7],[505,.4]].map(([s,o])=>({s,o,x:pathX(s)+o,z:-s,y:elevation(s)+.08,kick:-99}));
  const leavesPerPile=26,scatter=new T.InstancedMesh(smallLeaf,mat('#ffffff',{vertexColors:false}),piles.length*leavesPerPile),leafHomes=[];
  const leafColors=['#c98b45','#b8a052','#d9b35e','#9c7a3f'];
  for(const [p,pile] of piles.entries())for(let i=0;i<leavesPerPile;i++){const a=rnd()*Math.PI*2,r=Math.pow(rnd(),.6)*.9;leafHomes.push({pile:p,x:pile.x+Math.cos(a)*r,y:pile.y+.012+rnd()*.02,z:pile.z+Math.sin(a)*r,dx:Math.cos(a),dz:Math.sin(a),spin:rnd()*6,size:.04+rnd()*.03,lift:.25+rnd()*.35});scatter.setColorAt(p*leavesPerPile+i,col.set(leafColors[i%4]));}
  scatter.castShadow=false;scene.add(scatter);
  function placeLeaves(time,reduced){
    for(const [i,leaf] of leafHomes.entries()){const age=time-piles[leaf.pile].kick,active=!reduced&&age>=0&&age<1.7,t=active?age/1.7:0,out=t*.8,up=Math.sin(Math.PI*t)*leaf.lift;
      dummy.position.set(leaf.x+leaf.dx*out,leaf.y+up,leaf.z+leaf.dz*out);dummy.scale.set(leaf.size,.006,leaf.size*1.7);dummy.rotation.set(active?t*2:0,leaf.spin+(active?t*5:0),0);dummy.updateMatrix();scatter.setMatrixAt(i,dummy.matrix);}
    scatter.instanceMatrix.needsUpdate=true;}
  placeLeaves(0,true);scatter.computeBoundingSphere();
  const woodlandFog=new T.Color('#d5e0d7');
  // The scene root and these stone chunks never move; animated children keep their own updates.
  scene.updateMatrix();scene.matrixAutoUpdate=false;
  for(const chunk of stepChunks.values())chunk.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
  const photoSlot=new T.Vector3(),frameMood=[];
  return {renderer,scene,camera,wildlife,fernProp,panorama,sun,posts,waymarkers,squirrel,songbird,bp,butterfly,creekBench:seatGroups[0],seatGroups,rustleBush,climbTree,piles,bridge,falls,leaf:driftingLeaf,lookoutFlag,friends,upgrades,
    photoPosed:()=>photoMemo.posed,fallsSeen:()=>fallsMemo.seen,leafRested:()=>leafMemo.rested,
    resetWildlife(){squirrelMemo.revealed=false;squirrelMemo.climbed=false;leafMemo.rested=false;fallsMemo.seen=false;photoMemo.posed=false;photoMemo.sliding=false;greetMemo.shelter=false;greetMemo.until=-1;
      for(const key of Object.keys(friends)){const h=friendRoutines[key].home;Object.assign(motions[key],{s:h.s,offset:h.offset,yaw:h.yaw,activity:h.activity,moving:false,arrived:true,routine:null,index:0,elapsed:0});settle(key);}},
    motions,
    // `life` (optional, from app.mjs) describes the hiking-life activities this frame: {focus:'bird'|'butterfly'|'chipmunk'|null,
    // focusT:0..1, picnic:{active,seat,eating}, noodle:{active,eating}, cheerUntil:time}. Null keeps the previous behaviour.
    update(time,s,idle,reduced,observation=null,hero=null,life=null){
      // Fog hides distant fine plants; retain all ridge trees so valley views and photos keep their silhouette.
      for(const chunk of forestChunks){const distance=Math.max(chunk.from-s,s-chunk.to,0),vista=s>515&&(chunk.kind==='leaf'||chunk.kind.startsWith('tree')||chunk.kind.startsWith('rock'));
        chunk.mesh.visible=vista||distance<(chunk.kind.startsWith('garden_')?65:180);chunk.mesh.castShadow=chunk.shadow&&distance<50;
      }
      for(const post of posts)post.visible=Math.abs(post.userData.s-s)<85;
      atmosphere.update(s);
      const events={leafKick:false};
      const pose=(actor,activity)=>actor.pose(0,false,time,true,reduced,0,actorActivity(actor,activity));
      // 정상 단체 사진: while the child takes the group photo (and afterwards, as long as they stay on the deck) the summit
      // friend walks over to stand at the child's right, faces the camera (+z) and waves; leaving the deck sends them home.
      // Cup noodles at the summit end the photo pose: the friend walks to the mat instead.
      const noodling=!!life?.noodle?.active,picnicking=!!life?.picnic?.active;
      const groupShot=observation?.spot===SUMMIT.platform&&observation.id==='group'&&!noodling;
      if(groupShot&&observation.done)photoMemo.posed=true;if(s<SUMMIT.from+4||noodling)photoMemo.posed=false;
      const posing=groupShot||photoMemo.posed;
      const dt=clamp(time-previousUpdate,0,.05);previousUpdate=time;
      {const sf=friends.summitFriend,sm=motions.summitFriend;
        if(posing&&hero){photoSlot.set(hero.x+1.05,worldAt(s).y,hero.z+.05);
          const k=reduced?1:1-Math.exp(-dt*2.6);sf.root.position.lerp(photoSlot,k);
          sf.root.rotation.y+=Math.atan2(Math.sin(-sf.root.rotation.y),Math.cos(sf.root.rotation.y))*k;
          pose(sf,'wave');photoMemo.sliding=true;}
        else if(photoMemo.sliding){
          // The slide is over: hand the actual deck position back to the routine, which walks home from there (no pop).
          photoMemo.sliding=false;const z=sf.root.position.z;placeMotion(sm,-z,sf.root.position.x-pathX(-z));setRoutine(sm,friendRoutines.summitFriend.wander);}}
      // Friends: short local routines (lib/npcmotion.mjs) step only within 70 m of the child and freeze with the world when
      // paused (update is not called). An observation at their place returns them to the reviewed pose (bench friends sit,
      // the creek boy crouches, the gate friend waves), the gate/shelter friends greet once when the child comes close, and
      // reduced motion keeps every friend at home. Feet are driven by the actual metres walked.
      const heroXZ=hero?{x:hero.x,z:hero.z}:null,faceHero=key=>heroXZ?yawBetween(worldXZ(motions[key].s,motions[key].offset),heroXZ):null;
      const nearHome=(key,radius)=>Math.abs(s-friendRoutines[key].home.s)<radius;
      if(nearHome('shelterFriend',7)){if(!greetMemo.shelter){greetMemo.shelter=true;greetMemo.until=time+7;}}else greetMemo.shelter=false;
      const cheering=life&&time<life.cheerUntil;
      const shelterVisit=!!life&&Math.abs(s-362)<32;
      if(shelterVisit){picnicRoutine(life.picnic.seat)[0].activity=picnicking?(life.picnic.eating?'eat':'sit'):'look';}
      if(noodling)noodleRoutine[0].activity=life.noodle.eating?'eat':'sit';
      const routineFor={
        seated:()=>observation?.spot===BRIDGE.center?holds.seated:friendRoutines.seated.wander,
        watcher:()=>cheering?cheerRoutine:observation?.spot===BRIDGE.center?holds.watcher:friendRoutines.watcher.wander,
        gateFriend:()=>observation?.spot===30?friendRoutines.gateFriend.wave:nearHome('gateFriend',9)?friendRoutines.gateFriend.greet:friendRoutines.gateFriend.wander,
        shelterFriend:()=>shelterVisit?picnicRoutine(life.picnic.seat):observation?.spot===362?holds.shelterFriend:time<greetMemo.until?friendRoutines.shelterFriend.greet:friendRoutines.shelterFriend.wander,
        summitFriend:()=>noodling?noodleRoutine:friendRoutines.summitFriend.wander};
      for(const key of Object.keys(friends)){
        if(key==='summitFriend'&&posing&&hero)continue;
        const m=motions[key],actor=friends[key],home=friendRoutines[key].home;
        if(reduced){const target=key==='shelterFriend'&&shelterVisit?picnicRoutine(life.picnic.seat)[0]:key==='summitFriend'&&noodling?noodleRoutine[0]:null;Object.assign(m,{s:target?target.at[0]:home.s,offset:target?target.at[1]:home.offset,yaw:target?(typeof target.yaw==='number'?target.yaw:faceHero(key)??home.yaw):home.yaw,activity:target?target.activity:home.activity,moving:false,arrived:true});}
        else{setRoutine(m,routineFor[key]());if(Math.abs(m.s-s)<70)stepMotion(m,dt,{face:faceHero(key)});}
        settle(key);
        actor.pose(m.traveled,m.moving,time,!m.moving,reduced,m.moving?grade(m.s)*-Math.cos(m.yaw):0,actorActivity(actor,m.moving?'look':m.activity));
      }
      const mood=keyed(moods,s,frameMood);scene.fog.color.copy(mood[1]);scene.fog.density=mood[2]*.68+(observation?.spot===578?-.0008:0);sun.color.copy(mood[3]);sun.intensity=mood[4]*1.06;
      hemi.color.copy(mood[5]);hemi.groundColor.copy(mood[6]);hemi.intensity=mood[7]*.98;fill.color.copy(mood[8]);fill.intensity=mood[9]*.82;
      // Contact shadows take the section's shade tint and firm up slightly under stronger sun (no extra lights or passes).
      const contactStrength=.28+.08*clamp((mood[4]-3.9)/.7,0,1);contactMat.color.copy(mood[10]);contactMat.opacity=contactStrength;scene.userData.actorContact.color.copy(mood[10]);scene.userData.actorContact.opacity=contactStrength+.07;
      gust.value=1+1.6*smoothstep(s,505,560)*(1-.25*smoothstep(s,650,712));
      waterTime.value=reduced?0:time;windTime.value=reduced?0:time;
      flow.offset.y=reduced?0:-time*.018;flow.offset.x=reduced?0:Math.sin(time*.13)*.018;
      for(const r of ripples){if(Math.abs(r.userData.s-s)>70)continue;const pulse=reduced?1:1+Math.sin(time*.9+r.userData.phase)*.07;r.position.z=-r.userData.s+(reduced?0:Math.sin(time*.7+r.userData.phase)*.08);if(r.userData.foam)r.scale.set(r.userData.radius*(1+(pulse-1)*.35),1,r.userData.radius*(1+(pulse-1)*.7));else r.scale.setScalar(pulse);}
      // Journal looks (life.mjs focus): the animal reacts while the child draws it. Bird: a hop and a head turn toward the child;
      // butterfly: lands on a flower and folds its wings; 다람쥐: comes out, sits up and holds a nut.
      const focus=life?.focus||null,focusT=reduced?1:clamp(life?.focusT||0,0,1);
      const ambientTime=reduced?0:time,wild=observation?.spot===475,settled=wild?(reduced?1:clamp(observation.elapsed/observation.duration,0,1)):focus==='chipmunk'?focusT:0;
      if(focus==='chipmunk')squirrelMemo.revealed=true;
      const climbing=wild&&observation.id==='space'?clamp((observation.elapsed-1.6)/2.2,0,1):0,climb=reduced&&wild&&observation.id==='space'?1:climbing;
      // Silent story in three readable steps: the squirrel hides in the shaking bush (its head bobs up now and then while the
      // child is near), steps out onto the ground when the child stops to watch, and climbs the trunk for 'space'.
      // Walking past without watching is fine: nothing is marked, and the bush keeps shaking. Once seen it stays out
      // (or up the tree) instead of popping back into hiding.
      const near=Math.abs(s-475)<16;if(wild)squirrelMemo.revealed=true;if(climb>=1)squirrelMemo.climbed=true;
      const e=wild?(reduced?1:clamp(observation.elapsed/1.2,0,1)):squirrelMemo.revealed?1:0,emerge=e*e*(3-2*e);
      const peek=!squirrelMemo.revealed&&near&&!reduced?Math.max(0,Math.sin(time*.9)-.3)*.45:0;
      const hx=rustleBush.position.x-.15,hy=rustleBush.position.y+.5+peek,hz=rustleBush.position.z+.2;
      const ex=hx+(sp.x-hx)*emerge,ey=hy+(sp.y-hy)*emerge,ez=hz+(sp.z-hz)*emerge,up=!wild&&squirrelMemo.climbed?1:climb;
      squirrel.position.set(ex+(climbTree.x-.42-ex)*up,ey+(climbTree.y+2.5-ey)*up*up,ez+(climbTree.z-ez)*up);squirrel.rotation.y=-Math.PI/2+up*(Math.PI/2);squirrel.rotation.x=-up*Math.PI*.46;
      const drawn=focus==='chipmunk'&&!squirrelMemo.climbed;
      sqHead.rotation.y=wild?(observation.id==='wait'?.35:-.25)*(1-climb):drawn?.3*focusT:Math.sin(ambientTime*.8)*.16;
      sqHead.rotation.x=wild?settled*(observation.id==='space'?.3:-.15):drawn?-.22*focusT:peek>0?-.2:0;
      tail.rotation.x=-.20+(wild?settled*(observation.id==='wait'?.16:.42):drawn?.3*focusT:Math.sin(ambientTime*2)*.045);
      // Sitting up for the journal: the body tips back a little (nut held to the mouth), nothing else moves.
      squirrel.rotation.x+=drawn?-.35*focusT:0;
      wildlife.update(time,s,reduced,life,hero);
      const shake=near&&!(wild&&observation.done)&&!drawn&&!reduced?Math.sin(time*9)*Math.sin(time*2.3)*.06*(1+peek):0;rustleBush.scale.set(1.3*(1+shake),1.1*(1-shake*.5),1.3*(1+shake));rustleBush.rotation.y=shake*.5;
      const birdWatching=observation?.spot===115,waterWatching=[210,362].includes(observation?.spot),age=reduced?1.5:(observation?.elapsed||0);
      for(const p of perches){p.group.rotation.z=reduced?0:Math.sin(time*1.1+p.phase)*.035+Math.sin(time*3.7+p.phase)*.008;p.bird.userData.head.rotation.y=reduced?0:Math.sin(time*.9+p.phase)*.32;p.bird.userData.head.rotation.z=reduced?0:Math.sin(time*.65+p.phase)*.08;}
      const birdDrawn=focus==='bird';
      songbird.position.y=birdDrawn?(reduced?0:Math.max(0,Math.sin(focusT*Math.PI*2))*.09):(birdWatching&&observation.id==='watch'&&!reduced?Math.sin(Math.min(age/2.5,1)*Math.PI)*.12:0);
      perches[1].bird.rotation.y=Math.sin(ambientTime*.6+1)*.3;
      for(const [i,signal] of observationSignals.entries()){signal.material.opacity=.8;
        signal.visible=birdWatching&&observation.id==='listen'||waterWatching&&!['leaf','follow','falls'].includes(observation.id);
        signal.scale.setScalar(reduced?1:.85+Math.sin(age*2+i)*.1);
        // G07: bird arcs at half strength (.8→.45) and slightly smaller; the water rings keep their old on-screen size (1.5→1.9 compensates the smaller torus) and strength.
        if(birdWatching){signal.position.set(bp.x,bp.y+2,bp.z+.12);signal.rotation.set(0,0,-.2);signal.material.opacity=.45;signal.scale.multiplyScalar(.9);}
        else if(waterWatching){const rs=observation.spot===210?206:364;signal.position.set(riverX(rs),elevation(rs)-.69-i*.002,-rs);signal.rotation.set(-Math.PI/2,0,i*.8);signal.scale.multiplyScalar(1.9);}
      }
      // 시냇물 leaf route: 'leaf' floats it out from under the deck (below); 'follow' carries it on downstream with a pause at the
      // first stone and a rest at the second, where it stays (bobbing) for the rest of the walk while the child is near.
      const leafFollow=observation?.spot===BRIDGE.center&&observation.id==='follow';
      if(waterWatching&&observation.id==='leaf')leafMemo.rested=false;
      if(leafFollow){
        const t=reduced?1:clamp(age/observation.duration,0,1),prog=t<.3?t/.3*.42:t<.48?.42:.42+(t-.48)/.52*.58;
        const ls=LEAF_ROUTE.start-prog*(LEAF_ROUTE.start-LEAF_ROUTE.rest),side=.25+prog*.23,wob=reduced?0:Math.sin(age*2.2)*.08*(prog<.42||prog>.43?1:.2);
        driftingLeaf.visible=true;driftingLeaf.position.set(riverX(ls)+side+wob,elevation(ls)-.725+(reduced?0:Math.abs(Math.sin(age*3.1))*.008),-ls);
        driftingLeaf.rotation.set(Math.atan((elevation(ls+.1)-elevation(ls-.1))/.2),.3+age*.3,reduced?0:Math.sin(age*2.1)*.06);
        if(observation.done)leafMemo.rested=true;
      }else if(leafMemo.rested&&Math.abs(s-BRIDGE.center)<45){
        const ls=LEAF_ROUTE.rest;driftingLeaf.visible=true;driftingLeaf.position.set(riverX(ls)+.48,elevation(ls)-.725+(reduced?0:Math.abs(Math.sin(ambientTime*1.6))*.006),-ls);
        driftingLeaf.rotation.set(Math.atan((elevation(ls+.1)-elevation(ls-.1))/.2),1.8+(reduced?0:Math.sin(ambientTime*.7)*.08),0);
      }else driftingLeaf.visible=waterWatching&&observation.id==='leaf';
      if(waterWatching&&observation.id==='leaf'){
        // The leaf comes out from under the downstream deck edge (204) and drifts 5 m into open water in front of the
        // camera, so the reaction is visible the moment the button is pressed instead of staying under the bridge.
        const t=reduced?.5:clamp(age/observation.duration,0,1),ls=BRIDGE.from+.2-t*5.2,wob=reduced?0:Math.sin(age*2.6)*.12;
        // Lies on the surface (1.5 cm above the water ribbon at elevation-.74) and tilts with the creek slope; the stem
        // trails upstream as the blade turns slowly.
        driftingLeaf.position.set(riverX(ls)+.25+wob,elevation(ls)-.725+(reduced?0:Math.abs(Math.sin(age*3.1))*.008),-ls);
        driftingLeaf.rotation.set(Math.atan((elevation(ls+.1)-elevation(ls-.1))/.2),reduced?.5:.3+age*.35,reduced?0:Math.sin(age*2.1)*.06);
        // Two faint rings trail the leaf (same rings as the listening cue, reused) so the drift reads even when the leaf is small.
        for(const [i,signal] of observationSignals.entries()){if(i>1)continue;const ph=(age*.9+i*.5)%1;signal.visible=!reduced;signal.position.set(driftingLeaf.position.x,driftingLeaf.position.y-.004,driftingLeaf.position.z+ph*.9);signal.rotation.set(-Math.PI/2,0,0);signal.scale.setScalar(.3+ph*.9);signal.material.opacity=.5*(1-ph);}}
      songbird.rotation.y=birdDrawn?.65+.5*focusT:birdWatching&&observation.id==='watch'?.65:Math.sin(ambientTime*.7)*.2;
      {const landing=focus==='butterfly'?focusT:0,b=butterflyHome,hover=1-landing;
        butterfly.position.set(b.x+Math.sin(ambientTime*.7)*.5*hover,b.y+.38+(.62+Math.sin(ambientTime*1.3)*.25)*hover,b.z+Math.cos(ambientTime*.5)*.35*hover);
        butterfly.rotation.y=Math.sin(ambientTime*.4)*.6*hover;
        const flap=reduced?0:Math.sin(time*11)*.8*hover+(1-hover)*(1.25-Math.sin(time*1.6)*.12);
        wings.forEach((w,i)=>w.rotation.z=flap*(i?1:-1));}
      // 폭포: spray drifts up from the plunge pool whenever the child is within 60 m (stronger while watching); the rainbow fades in
      // 1.6 s into 'falls' and then stays over the pool for the rest of the visit (fallsMemo), so a second look finds it there.
      {const watching=observation?.spot===SCENIC.waterfall.stop&&observation.id==='falls',near=Math.abs(s-fallsS)<60;
        if(watching&&(reduced||observation.elapsed>1.6))fallsMemo.seen=true;
        const bow=watching?(reduced?1:clamp((observation.elapsed-1.6)/1.4,0,1)):fallsMemo.seen&&Math.abs(s-fallsS)<50?.75:0;
        rainbow.visible=bow>0;if(rainbow.visible)rainbow.children.forEach((arc,i)=>arc.material.opacity=.26*bow*(1-i*.04));
        for(const m of spray){const i=m.userData.i,ph=reduced?(i*.37)%1:(time*.45+i*.37)%1;m.visible=near;if(!near)continue;
          m.position.set(fallsX-1.1+(i%4)*.7+(reduced?0:Math.sin(time*.8+i)*.18),poolY+.25+ph*2.4,-(fallsS-1.0)+Math.sin(i*2.1)*.5+ph*1.1);
          m.scale.set(1.1+ph*1.5,1.2+ph*1.8,1);m.material.opacity=(.16+(watching?.20:0))*(1-ph)*Math.min(1,ph*4);}}
      if(flag)flag.rotation.y=reduced?0:Math.sin(time*2.6)*.12+Math.sin(time*.9)*.08;
      if(marker)marker.rotation.y=reduced?0:Math.sin(time*2.9+1)*.14+Math.sin(time*.8)*.08;
      if(hero){for(const pile of piles){if(hero.moving&&Math.hypot(hero.x-pile.x,hero.z-pile.z)<1.25&&time-pile.kick>2.2){pile.kick=time;events.leafKick=true;}}}
      if(hero===null||piles.some(p=>time-p.kick<1.8))placeLeaves(time,reduced);
      const p=worldAt(s);fill.position.set(p.x+12,p.y+14,p.z+6);fill.target.position.set(p.x,p.y+1,p.z);fill.target.updateMatrixWorld();const sunset=smoothstep(s,640,712);sun.position.set(p.x-18,p.y+26-sunset*10,p.z-16+sunset*6);sun.target.position.set(p.x,p.y,p.z-7);sun.target.updateMatrixWorld();
      return events;
    }};
}
export const HAT_COLORS=['#d9534f','#4e7fb5','#e0b24c'];
export function createChild(scene,bagColor='#d6ad47',teacher=false,variant=0,hat=0){
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
  part(head,characterGeometry.head,faceSkin,[0,0,0],[.34,.315,.30]);part(head,variant===1?characterGeometry.bob:characterGeometry.hair,sculptHair,[0,.04,-.015],[.374,.350,.341]).name='hair';

  if(variant===2){head.children[1].rotation.y=.25;head.children[1].scale.y*=1.04;}
  if(variant===3){part(head,sphere,bagMat,[0,.07,-.32],[.10,.09,.07]);const pony=part(head,characterGeometry.ponytail,hair,[0,-.025,-.40],[.14,.25,.16]);pony.rotation.x=.3;}
  // Limited hat variation (cap or beanie) so friends read differently from behind.
  // G06: a hat presses the hair down a little (same mesh, 15% lower crown, 3% narrower) and the shared crown dome is
  // sized to enclose the lock lift (hair reaches ~.41 wide / ~.34 high in head units under a hat); the sphere it replaces
  // narrowed to .36 at its rim and topped out at .42, which is why locks cut through the cap top and the beanie rim.
  if(!teacher&&hat){const pressed=head.children[1];pressed.position.y=.02;pressed.scale.x*=.97;pressed.scale.y*=.85;pressed.scale.z*=.97;}
  if(!teacher&&hat===1){
    const color=new T.Color(HAT_COLORS[variant%3]),capMat=cloth(color),brimMat=mat(color.clone().multiplyScalar(.68));
    part(head,characterGeometry.cap,capMat,[0,.085,-.015],[.445,.33,.425]).name='hat-crown';
    const brim=part(head,cylinder,brimMat,[0,.105,.38],[.30,.018,.21]);brim.rotation.x=.12;
    part(head,sphere,brimMat,[0,.412,-.015],[.032,.02,.032]);
  }
  if(!teacher&&hat===2){
    const color=new T.Color(HAT_COLORS[(variant+1)%3]),beanie=cloth(color),cuffMat=cloth(color.clone().multiplyScalar(.78));
    part(head,characterGeometry.cap,beanie,[0,.07,-.015],[.445,.37,.425]).name='hat-crown';
    part(head,beanieCuff,cuffMat,[0,.11,-.015],[.425,.405,.42]);
    part(head,sphere,mat('#f4ead6'),[0,.465,-.015],[.07,.07,.07]);
  }
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
  return {root,head,hands,pose(distance,moving,time,rest=false,reduced=false,slope=0,activity='stand'){
    if(time<previousTime){gait=restBlend=bagPitch=bodySway=0;}
    const dt=Math.max(0,Math.min(.05,time-previousTime));previousTime=time;gait+=(Number(moving)-gait)*(1-Math.exp(-dt*(moving?12:9)));
    restBlend+=(Number(rest&&!moving)-restBlend)*(reduced?1:1-Math.exp(-dt*6));
    const phase=distance/STRIDE*Math.PI*2;
    const climb=clamp(slope,-.5,.5);
    const pelvisDrop=(.035+(STRIDE-.70)*.3+Math.abs(climb)*.18)*gait;
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
    // Greeting: the right arm rises overhead and sways; readable even on small screens, and still in reduced motion.
    if(activity==='wave'){const w=reduced?0:Math.sin(time*8.5)*.3;arms[1].rotation.x=-3.0*restBlend;arms[1].rotation.z=(.3+w*.5)*restBlend;elbows[1].rotation.x=-.1*restBlend;hands[1].rotation.z=(.3+w*.6)*restBlend;hands[1].rotation.y=.2*restBlend;head.rotation.y=.12*restBlend;head.rotation.x=-.06*restBlend;}
    if(activity==='crouch'||activity==='reach'){
      for(let i=0;i<2;i++){legs[i].rotation.x-=.68*restBlend;knees[i].rotation.x+=1.12*restBlend;ankles[i].rotation.x-=.44*restBlend;arms[i].rotation.x-=(i?.50:.30)*restBlend;elbows[i].rotation.x-=(i?.40:.62)*restBlend;}
      body.position.y-=.085*restBlend;torso.rotation.x+=.30*restBlend;head.rotation.x=.16*restBlend;
    }
    if(activity==='sit'||activity==='eat'){
      for(let i=0;i<2;i++){legs[i].rotation.x-=1.4*restBlend;knees[i].rotation.x+=1.5*restBlend;ankles[i].rotation.x-=.1*restBlend;arms[i].rotation.x-=.8*restBlend;elbows[i].rotation.x-=.3*restBlend;}
      head.rotation.y=-.35*restBlend;torso.rotation.x=.08*restBlend;
    }
    // Hand actions (hiking life): right hand to the mouth for a sip or a bite, right hand down to the ground when reaching for
    // litter (crouched above), both hands forward for the teacher pouring from the thermos.
    if(activity==='drink'||activity==='eat'){
      arms[1].rotation.x=-1.75*restBlend;arms[1].rotation.z=.05*restBlend;elbows[1].rotation.x=-1.9*restBlend;elbows[1].rotation.z=-.75*restBlend;
      hands[1].rotation.set(-.3*restBlend,.2,.6*restBlend);head.rotation.y=0;head.rotation.x=(activity==='drink'?-.15:.1)*restBlend;
    }
    if(activity==='reach'){arms[1].rotation.x=-1.15*restBlend;elbows[1].rotation.x=-.1*restBlend;torso.rotation.x+=.42*restBlend;head.rotation.x=.38*restBlend;}
    if(activity==='pour'){for(let i=0;i<2;i++){arms[i].rotation.x=-1.25*restBlend;arms[i].rotation.z=(i?-1:1)*.14*restBlend;elbows[i].rotation.x=-.55*restBlend;hands[i].rotation.set(-.2*restBlend,(i?1:-1)*.5,0);}head.rotation.x=.26*restBlend;head.rotation.y=0;}
  }};
}








