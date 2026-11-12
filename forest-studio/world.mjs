// world.mjs — three.js scene: continuous terrain, surrounding forest, first-person walk, overview orbit,
// instanced student materials, preview ghosts, selection, footprint marker, photos. Heights always come from terrain.mjs.
import * as T from './vendor/three.module.js';
import {classroom,renderRatio,nextRenderScale} from './render-profile.mjs';
import {reflectionMaterial,installReflection} from './pond-reflection.mjs';
import {MATERIALS,material,restY,footSamples,coverMask,inFoot,MASK_RES,BOUND,SITE,toWorld} from './core.mjs';
import {height,siteFactor,insideSite,intersectRay,DEFAULT_TERRAIN} from './terrain.mjs';
import {walkHeight,deckSurfaces,step as walkStep,look as walkLook,eye as eyeOf,EYE} from './walk.mjs';
import {prototype,coverGroup,isCoverKind,mat,mesh,bake,rng,G,branch,cache as matCache,leafDepth,waterMat} from './materials.mjs';
import {surfaceData,shadowTex,glowTex,moonTex,rayTex,sparkTex,poolTex,mossTex,tuftTex,daisyTex,bloomTex,cloudTex,depthFor} from './textures.mjs';
const uTime={value:0};
// visual-three round 3: leaf translucency. Sun direction in view space + strength (morning .5, night .12) shared by every
// foliage card material; leaves between the camera and the sun glow warm yellow-green as if light passes through them.
const uSunView={value:new T.Vector3(0,1,0)},uTrans={value:.5};
// shortcut: foliage bounce approximates sky/ground light, not nearby objects; use baked probes if local color bleeding becomes essential.
const TRANS_FRAG='{float tl=pow(max(0.0,dot(normalize(-vViewPosition),uSunView)),3.2)*uTrans;float backlit=.35+.65*max(0.0,dot(-normal,uSunView));totalEmissiveRadiance+=diffuseColor.rgb*vec3(1.0,0.96,0.72)*tl*backlit*.85;float bounced=1.0-max(0.0,dot(normal,normalize(mat3(viewMatrix)*vec3(0.0,1.0,0.0))));totalEmissiveRadiance+=diffuseColor.rgb*vec3(.055,.052,.032)*uTrans*bounced;}';
// Two lighting environments on the same forest. Morning is the default: warm direct sun, soft sky fill, dappled light,
// a few gentle shafts, a clear sky. Night: navy/teal moonlight, warm pools at lanterns and the pavilion, a few fireflies.
export const ENVIRONMENTS={
 // Round 1 (Argon review): golden sun + bright yellow-green ground bounce + a soft cool fill so shadows are never black;
 // pale blue haze (fog colour) over the far forest; a thin cloud veil on the sky dome.
 morning:{sun:{color:'#ffe6bd',intensity:4.8,pos:[-10,16,11]},fill:{color:'#c8ddec',intensity:.48,pos:[18,11,-14]},hemi:{sky:'#c9dfed',ground:'#a79a73',intensity:.94},exposure:1.08,fog:'#b4cbbf',sky:{top:'#80acbd',mid:'#c9dfe0',low:'#e9e8c4',tint:'#fff0c8',tintPower:.72},clouds:{color:'#ffffff',opacity:.38},glow:true,rays:true,night:false,dapple:1,lamp:1,trans:.72},
 // Night: blue-violet moonlight and sky fill keep paths, trunks and flowers readable; warm lamp pools give the contrast.
 night:{sun:{color:'#9ba6ec',intensity:2.1,pos:[16,30,-12]},fill:{color:'#5a60b4',intensity:.5,pos:[-18,10,14]},hemi:{sky:'#4a4f9c',ground:'#243030',intensity:2.9},exposure:1.04,fog:'#242a52',sky:{top:'#0b1030',mid:'#1f2b64',low:'#344578',tint:'#aab4ff',tintPower:.35},clouds:{color:'#9aa3d2',opacity:.24},glow:false,rays:false,night:true,dapple:0,lamp:2.4,trans:.12}
};
export const WALK_FOG=[18,62]; // walking haze (near, far): the far forest dissolves into the fog colour sooner than before (80)
export const LAMP_LIMIT=3; // point lights kept in the scene at all times (count never changes → no shader recompiles)
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
// Foliage breeze and cover-mask soil mix are injected once per material.
// Round 2: canopy materials also get a height gradient (lit yellow-green top, soft darker underside) so leaf clumps and
// inner masses stop reading as uniformly shaded balls. The height is the prototype-local y (trees 2–4, shrubs < 1).
// Keep per-material wind strength out of program keys; retain the old GLSL literal's three-decimal precision.
function prepare(m){if(m.userData.prepared)return m;m.userData.prepared=true;const sway=m.userData.sway,canopy=!!m.userData.canopy,blossom=!!m.userData.blossom,card=!!m.userData.sprig&&(m.isMeshLambertMaterial||m.isMeshStandardMaterial);if(sway||canopy){m.onBeforeCompile=sh=>{sh.uniforms.uTime=uTime;sh.uniforms.uSunView=uSunView;sh.uniforms.uTrans=uTrans;sh.uniforms.uSway={value:Number((sway||0).toFixed(3))};
  sh.vertexShader='uniform float uTime;uniform float uSway;varying float vLocalY;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvLocalY=position.y;\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.5;\n#else\nfloat ph=0.0;\n#endif\nfloat sw=sin(uTime*1.1+ph+position.x*.8+position.z*.6)*${sway?'uSway':'0.000'}*smoothstep(0.05,1.2,position.y);\ntransformed.x+=sw;transformed.z+=sw*.6;`);
  if(canopy)sh.fragmentShader='varying float vLocalY;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\n{float gf=smoothstep(0.3,4.8,vLocalY);diffuseColor.rgb*=mix(${blossom?'vec3(.84,.69,.78),vec3(1.06,1.015,.98)':'vec3(.66,.78,.72),vec3(1.055,1.035,.89)'},gf);}`);
  if(card)sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n{vec3 up=normalize(mat3(viewMatrix)*vec3(0.0,1.0,0.0));if(dot(normal,up)<0.0)normal=-normal;normal=normalize(mix(normal,up,.16));}');
  if(card)sh.fragmentShader='uniform vec3 uSunView;uniform float uTrans;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+TRANS_FRAG);};m.customProgramCacheKey=()=>'sway-uniform-v1'+(sway?'w':'s')+(canopy?'c':'')+(blossom?'b':'')+(card?'t':'');}return m;}
function applyMeshFlags(m){m.castShadow=!m.userData.noShadow;m.receiveShadow=!m.userData.noReceive;const d=m.material?.userData?.depth;if(d)m.customDepthMaterial=d;prepare(m.material);}
// Planted geometry is rebuilt on edits; wind stays animated in its shader, not Object3D transforms.
function freezeTransforms(root){root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});}
// Ground tufts and tiny wildflowers: instanced cards that hide themselves wherever a student path/deck covers the ground.
function maskedCard(tex,color,sway,maskTex,bound){const m=new T.MeshLambertMaterial({map:tex,color,emissive:new T.Color(color),emissiveMap:tex,emissiveIntensity:.04,alphaTest:.3,side:T.DoubleSide});m.userData={sway:0,prepared:true,depth:depthFor(tex)};
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=uTime;sh.uniforms.coverMask={value:maskTex};sh.uniforms.bound={value:new T.Vector2(bound.hx,bound.hz)};sh.uniforms.uSunView=uSunView;sh.uniforms.uTrans=uTrans;sh.uniforms.uSway={value:Number(sway.toFixed(3))};
  sh.vertexShader='uniform float uTime;uniform float uSway;varying vec2 vMaskUv;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.5;float sw=sin(uTime*1.3+ph+position.x*.8)*uSway*smoothstep(0.0,1.0,position.y);transformed.x+=sw;transformed.z+=sw*.6;vMaskUv=(instanceMatrix[3].xz+bound)/(2.0*bound);`).replace('void main() {','uniform vec2 bound;\nvoid main() {');
  sh.fragmentShader='uniform sampler2D coverMask;varying vec2 vMaskUv;uniform vec3 uSunView;uniform float uTrans;\n'+sh.fragmentShader.replace('#include <alphatest_fragment>','if(vMaskUv.x>0.0&&vMaskUv.x<1.0&&vMaskUv.y>0.0&&vMaskUv.y<1.0&&texture2D(coverMask,vMaskUv).r>0.3)discard;\n#include <alphatest_fragment>').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+TRANS_FRAG);};
 m.customProgramCacheKey=()=>'masked-uniform-v1';return m;}
// Scenery hide mask (visual-three round 2, Codex review): the student cover mask PLUS ponds, decks, furniture and rocks,
// so no scenery grass pokes through a water surface or a bench. Only scenery reads it; the ground soil tint keeps coverMask.
function sceneryMask(items,base,data){data.set(base);for(const it of items){const m=material(it.kind);if(!m)continue;let foot=null;if(m.base==='pond'||m.base==='rigid'||m.base==='deck')foot=m.foot;else if(it.kind==='rock')foot={w:.62,d:.5,round:true};if(!foot)continue;
 const r=Math.max(foot.w,foot.d)*it.scale+.35;const i0=Math.max(0,Math.floor((it.x-r+BOUND.hx)/(2*BOUND.hx)*MASK_RES)),i1=Math.min(MASK_RES-1,Math.ceil((it.x+r+BOUND.hx)/(2*BOUND.hx)*MASK_RES)),j0=Math.max(0,Math.floor((it.z-r+BOUND.hz)/(2*BOUND.hz)*MASK_RES)),j1=Math.min(MASK_RES-1,Math.ceil((it.z+r+BOUND.hz)/(2*BOUND.hz)*MASK_RES));
 const c=Math.cos(it.rotation),s=Math.sin(it.rotation),w=foot.w+.2/it.scale,d=foot.d+.2/it.scale;for(let j=j0;j<=j1;j++){const dz=(j+.5)/MASK_RES*2*BOUND.hz-BOUND.hz-it.z;for(let i=i0;i<=i1;i++){const dx=(i+.5)/MASK_RES*2*BOUND.hx-BOUND.hx-it.x,lx=(dx*c-dz*s)/it.scale,lz=(dx*s+dz*c)/it.scale;if(foot.round?(lx/w)**2+(lz/d)**2<=1:Math.abs(lx)<=w&&Math.abs(lz)<=d)data[j*MASK_RES+i]=255;}}}return data;}
export class ForestWorld{
 constructor(container,handlers,deferBuild=false){
  this.preparing=deferBuild;
  this.container=container;this.h=handlers;this.mode='walk';this.terrain=DEFAULT_TERRAIN;this.items=[];this.surfaces=[];this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.dirty=true;
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});this.renderScale=1;this.renderer.setPixelRatio(renderRatio(container.clientWidth,container.clientHeight,devicePixelRatio,classroom));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;container.prepend(this.renderer.domElement);
  const canvas=this.renderer.domElement;canvas.setAttribute('aria-label','숲속 3D 화면');canvas.tabIndex=0;canvas.setAttribute('role','application');canvas.style.touchAction='none';
  // Soft aerial perspective: pale blue-green haze that starts beyond the clearing, never washing the ground flat.
  this.scene=new T.Scene();this.scene.matrixAutoUpdate=false;this.fogColor=new T.Color('#d4e3d7');this.scene.fog=new T.Fog(this.fogColor,22,80);
  const sky=new T.Mesh(new T.SphereGeometry(170,24,12),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new T.Color('#7fb0e0')},mid:{value:new T.Color('#d6e6ec')},low:{value:new T.Color('#e9e5cc')},tint:{value:new T.Color('#fff0c8')},tintPower:{value:.75},sunDir:{value:new T.Vector3(...ENVIRONMENTS.morning.sun.pos).normalize()}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top,mid,low,tint,sunDir;uniform float tintPower;varying vec3 vP;void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=h<0.08?mix(low,mid,smoothstep(-0.05,0.08,h)):mix(mid,top,smoothstep(0.08,0.6,h));float s=max(0.0,dot(d,sunDir));c=mix(c,tint,pow(s,6.0)*tintPower);gl_FragColor=vec4(c,1.0);}'}));this.scene.add(sky);this.sky=sky;
  // Lower, warmer sun so the hills shade on their flanks and trunks cast long readable shadows.
  this.hemi=new T.HemisphereLight('#d7e7ff','#6e7d4e',1.25);this.scene.add(this.hemi);const sun=new T.DirectionalLight('#ffe6bd',3.0);sun.position.set(-22,25,13);
  this.fill=new T.DirectionalLight('#d6e4ff',.5);this.fill.position.set(20,14,-16);this.scene.add(this.fill); // shadow-free fill from the far side: lifts the shadow side of trunks and crowns
  this.clouds=new T.Mesh(new T.SphereGeometry(166,32,16),new T.MeshBasicMaterial({map:cloudTex(),transparent:true,depthWrite:false,fog:false,side:T.BackSide,opacity:.5}));this.clouds.raycast=()=>{};this.scene.add(this.clouds);
  // A faint warm glow around the sun side of the sky: soft light, no particle haze over the plants.
  const glow=new T.Sprite(new T.SpriteMaterial({map:glowTex(),transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending}));glow.scale.set(90,90,1);this.scene.add(glow);this.glow=glow;sun.castShadow=true;sun.shadow.mapSize.set(classroom?1024:innerWidth>900?3072:2048,classroom?1024:innerWidth>900?3072:2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:4,far:90});sun.shadow.bias=-.00025;sun.shadow.normalBias=.020;sun.shadow.radius=2.8;this.scene.add(sun);this.scene.add(sun.target);this.sun=sun;
  // Night pieces (hidden in the morning): moon, stars, warm lamp lights, fireflies. Morning pieces: light shafts.
  this.moon=new T.Sprite(new T.SpriteMaterial({map:moonTex(),transparent:true,depthWrite:false,fog:false}));this.moon.scale.set(34,34,1);this.scene.add(this.moon);
  this.lamps=[];for(let i=0;i<LAMP_LIMIT;i++){const l=new T.PointLight('#ffb864',0,7.5,2);this.scene.add(l);this.lamps.push(l);}this.lampSpots=[];this.lampGlow=null;
  this.dappleU={value:1};this.buildAtmosphere();
  this.walkCam=new T.PerspectiveCamera(62,1,.08,240);this.viewCam=new T.PerspectiveCamera(50,1,.3,320);this.camera=this.walkCam;
  this.orbit={yaw:.35,elev:.95,dist:26,tx:0,tz:0};this.walk={x:0,z:9.75,yaw:0,pitch:.03};this.move={x:0,z:0};this.camY=null;
  this.objects=new T.Group();this.scene.add(this.objects);this.covers=new T.Group();this.scene.add(this.covers);this.ghost=new T.Group();this.scene.add(this.ghost);this.ghostMats=new Map();
  // Shared once: the meadow texture and the cover-mask texture survive terrain rebuilds.
  this.meadowTex=new T.TextureLoader().load('./assets/meadow.webp',()=>{this.dirty=true;});this.meadowTex.colorSpace=T.SRGBColorSpace;this.meadowTex.wrapS=this.meadowTex.wrapT=T.RepeatWrapping;this.meadowTex.anisotropy=4;
  this.maskData=new Uint8Array(MASK_RES*MASK_RES);this.maskTex=new T.DataTexture(this.maskData,MASK_RES,MASK_RES,T.RedFormat);this.maskTex.magFilter=this.maskTex.minFilter=T.LinearFilter;this.maskTex.needsUpdate=true; // linear: soft soil edges instead of stepped squares
  this.hideData=new Uint8Array(MASK_RES*MASK_RES);this.hideTex=new T.DataTexture(this.hideData,MASK_RES,MASK_RES,T.RedFormat);this.hideTex.magFilter=this.hideTex.minFilter=T.LinearFilter;this.hideTex.needsUpdate=true;
  if(!deferBuild){this.buildTerrain();this.buildScenery();}this.setEnvironment('morning');
  this.selection=new T.Group();this.selection.visible=false;this.scene.add(this.selection);
  this.selection.userData.noReflection=true;this.ghost.userData.noReflection=true;this.marker=this.makeMarker();this.marker.userData.noReflection=true;this.marker.visible=false;this.scene.add(this.marker);
  this.ray=new T.Raycaster();this.pointers=new Map();this.canvasEvents(canvas);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  this.last=performance.now();this.loop=t=>{this.frame=requestAnimationFrame(this.loop);if(document.hidden||this.preparing){this.last=t;return;}const dt=Math.min(.05,(t-this.last)/1000);if(t-this.last<(classroom?32:15))return;this.sampleFrame(t-this.last);this.last=t;this.tick(dt,t);};this.frame=requestAnimationFrame(this.loop);
 }
 // Ignore one-off loading stalls; only sustained slow play lowers the 3D buffer, never text or saved objects.
 sampleFrame(ms){
  if(!classroom||this.entrance||this.preparing||ms>250){this.frameSamples=0;this.slowFrames=0;return;}
  this.frameSamples=(this.frameSamples||0)+1;this.slowFrames=(this.slowFrames||0)+(ms>45?1:0);
  if(this.frameSamples<60)return;
  const scale=nextRenderScale(this.renderScale,this.slowFrames,this.frameSamples);this.frameSamples=0;this.slowFrames=0;
  if(scale!==this.renderScale){this.renderScale=scale;this.resize();}
 }
 // Keep synchronous rebuilds compatible; boot yields between bounded generation batches.
 static async create(container,handlers){
  await ForestWorld.pause();
  const world=new ForestWorld(container,handlers,true);
  try{await world.buildInSlices(world.terrainSteps());await world.buildInSlices(world.scenerySteps());return world;}
  catch(error){cancelAnimationFrame(world.frame);world.resizeObserver.disconnect();world.renderer.dispose();throw error;}
 }
 static pause(){return new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));}
 async buildInSlices(steps){let start=performance.now();for(const _ of steps){if(performance.now()-start>=8){await ForestWorld.pause();start=performance.now();}}}
 // ---- terrain ----
 buildTerrain(){for(const _ of this.terrainSteps()){} }
 *terrainSteps(){const size=120,seg=200;const geo=new T.PlaneGeometry(size,size,seg,seg);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,col=new Float32Array(pos.count*3),uv=geo.attributes.uv;const r=rng(99);
  // Soft grass: pale base, lighter on the hill tops, cooler in the hollow, sun-facing flanks a touch warmer.
  const grass=new T.Color('#8fae67'),grass2=new T.Color('#608353'),soil=new T.Color('#c9b48a'),moss=new T.Color('#7fa060'),far=new T.Color('#8eaa84'),high=new T.Color('#b2cb7d'),low=new T.Color('#6e945a'),c=new T.Color();
  const nrm=geo.attributes.normal;const sunDir=new T.Vector3(...ENVIRONMENTS.morning.sun.pos).normalize();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const y=height(x,z,this.terrain);pos.setY(i,y);if(i%1024===1023)yield;}
  geo.computeVertexNormals();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i);const f=siteFactor(x,z);const n=.5+.5*Math.sin(x*.9+1.7)*Math.cos(z*1.1+.4)+.25*Math.sin(x*3.1)*Math.sin(z*2.7);c.copy(grass).lerp(grass2,clamp(n,0,1)*.7);
   if(this.terrain==='clearing-v6'){c.lerp(high,clamp(y/.8,0,1)*.55);c.lerp(low,clamp(-y/.27,0,1)*.6);const dist=Math.hypot(x,z-9.75);c.lerp(soil,.5*(1-Math.min(1,dist/2.4)));}
   const facing=nrm.getX(i)*sunDir.x+nrm.getY(i)*sunDir.y+nrm.getZ(i)*sunDir.z;c.multiplyScalar(.9+facing*.22);
   c.lerp(moss,clamp((f-1)/.5,0,1)*.6);c.lerp(far,clamp((f-1.8)/1.5,0,1)*.7);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;uv.setXY(i,x/3.2,z/3.2);if(i%1024===1023)yield;}
  geo.setAttribute('color',new T.BufferAttribute(col,3));
  const tex=this.meadowTex;
  const groundBump=surfaceData(mossTex()).clone();groundBump.repeat.set(4,4);groundBump.needsUpdate=true;const m=new T.MeshStandardMaterial({vertexColors:true,map:tex,bumpMap:groundBump,bumpScale:.018,roughness:1});m.addEventListener('dispose',()=>groundBump.dispose());
  const bx=BOUND.hx,bz=BOUND.hz;m.onBeforeCompile=sh=>{sh.uniforms.coverMask={value:this.maskTex};sh.uniforms.bound={value:new T.Vector2(bx,bz)};sh.uniforms.uDapple=this.dappleU;sh.uniforms.detail={value:mossTex()};sh.vertexShader='varying vec3 vWorld;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
   // The photo grass is softened (half contrast, lifted to a pale green) and layered with a fine moss/blade detail map at a
   // different scale, so the meadow tiling disappears and relief + vertex tint stay readable. Morning adds dappled light:
   // soft bright patches between tree shade, strongest under the surrounding forest, faint in the open clearing.
   sh.fragmentShader='uniform sampler2D coverMask;uniform sampler2D detail;uniform vec2 bound;uniform float uDapple;varying vec3 vWorld;\n'+sh.fragmentShader.replace('#include <map_fragment>','#ifdef USE_MAP\nvec4 sampledDiffuseColor=texture2D(map,vMapUv);float lum=dot(sampledDiffuseColor.rgb,vec3(0.3,0.59,0.11));vec3 soft=mix(vec3(lum),sampledDiffuseColor.rgb,0.45);soft=mix(vec3(0.79,0.87,0.66),soft,0.24);vec3 det=texture2D(detail,vWorld.xz*0.55).rgb;soft*=mix(vec3(1.0),det*1.12,0.5);vec3 det2=texture2D(detail,vWorld.xz*2.3+vec2(0.37,0.11)).rgb;soft*=mix(vec3(1.0),det2*1.1,0.13);diffuseColor*=vec4(soft*1.10,1.0);\n#endif').replace('#include <color_fragment>','#include <color_fragment>\n{float pm=sin(vWorld.x*0.9+2.0)*sin(vWorld.z*0.8+1.0)+0.5*sin(vWorld.x*2.3+0.7)*sin(vWorld.z*1.9+3.0);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.43,0.55,0.29),smoothstep(0.45,1.15,pm)*0.36);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.78,0.82,0.5),smoothstep(0.55,1.2,-pm)*0.22);}\nvec2 mu=(vWorld.xz+bound)/(2.0*bound);float mk=(mu.x>0.0&&mu.x<1.0&&mu.y>0.0&&mu.y<1.0)?texture2D(coverMask,mu).r:0.0;mk=smoothstep(0.12,0.9,mk);diffuseColor.rgb*=mix(vec3(1.0),vec3(0.82,0.76,0.62),mk*0.45);\nif(uDapple>0.0){float n1=sin(vWorld.x*1.9+sin(vWorld.z*1.3)*1.6)*sin(vWorld.z*1.6+sin(vWorld.x*1.1)*1.3);float n2=sin(vWorld.x*4.1+1.0)*sin(vWorld.z*3.7+2.0);float v=n1*0.65+n2*0.35;float sf=length(vWorld.xz/vec2(10.0,12.0));float str=mix(0.1,0.4,smoothstep(0.85,1.2,sf));float shade=smoothstep(-0.05,0.55,v)*str*uDapple;diffuseColor.rgb*=1.0-shade;diffuseColor.rgb+=vec3(0.06,0.05,0.02)*(1.0-smoothstep(-0.4,0.2,v))*str*uDapple;}');};
  const ground=new T.Mesh(geo,m);ground.receiveShadow=true;this.scene.add(ground);this.ground=ground;
  // Coarse outer ring continues the same height field far past the detailed plane, so a distant overview
  // (portrait phones fit at 75–100 units) never sees the ground end. Slightly lowered to avoid z-fighting.
  const ringGeo=new T.RingGeometry(59.5,420,72,10);ringGeo.rotateX(-Math.PI/2);const rp=ringGeo.attributes.position,rc=new Float32Array(rp.count*3);
  for(let i=0;i<rp.count;i++){const x=rp.getX(i),z=rp.getZ(i);rp.setY(i,height(x,z,this.terrain)-.15);const f=siteFactor(x,z);c.copy(moss).lerp(far,clamp((f-1.8)/1.5,0,1)*.85);rc[i*3]=c.r;rc[i*3+1]=c.g;rc[i*3+2]=c.b;}
  ringGeo.setAttribute('color',new T.BufferAttribute(rc,3));ringGeo.computeVertexNormals();const ring=new T.Mesh(ringGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));ring.receiveShadow=false;this.scene.add(ring);this.groundRing=ring;
 }
 rebuildTerrain(terrain){if(terrain===this.terrain)return;this.terrain=terrain;this.scene.remove(this.ground);this.ground.geometry.dispose();this.ground.material.dispose();if(this.groundRing){this.scene.remove(this.groundRing);this.groundRing.geometry.dispose();this.groundRing.material.dispose();}this.buildTerrain();
  // Surrounding forest and markers follow the new ground height.
  if(this.scenery){this.scene.remove(this.scenery);ForestWorld.disposeOwned(this.scenery);this.scene.remove(this.far);this.far.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.buildScenery();}
  // Fireflies and light shafts sit on the ground height, so they are rebuilt for the other terrain too.
  if(this.fireflies){for(const o of [this.stars,this.fireflies]){this.scene.remove(o);o.geometry.dispose();o.material.dispose();}this.scene.remove(this.rays);this.rays.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.rays.children[0]?.children[0]?.material.dispose();this.buildAtmosphere();this.setEnvironment(this.environment);}this.dirty=true;}
 // Rebuilds the surrounding forest with the current prototypes (after the Blender models have loaded).
 refreshScenery(){if(!this.scenery)return;this.scene.remove(this.scenery);ForestWorld.disposeOwned(this.scenery);this.scene.remove(this.far);this.far.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.buildScenery();this.dirty=true;}
 // Owned geometries are freed; prototype geometries shared by instances are kept.
 static disposeOwned(root){root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.isMesh&&o.userData.owned){if(!o.userData.sharedGeometry)o.geometry.dispose();if(o.userData.ownMaterial)o.material.dispose();}});}
 // ---- surrounding forest: three layers of visible boundary, never inside the clearing ----
 buildScenery(){for(const _ of this.scenerySteps()){} }
 *scenerySteps(){const r=rng(471),T_=this.terrain;const placed=[];const H=(x,z)=>height(x,z,T_);
  const put=(kind,x,z,s,rot)=>{placed.push({kind,x,y:H(x,z),z,s,rot});};
  const ring=(fmin,fmax)=>{for(let t=0;t<400;t++){const a=r()*6.28,f=fmin+r()*(fmax-fmin);const rr=f;const x=Math.cos(a)*SITE.hx*rr,z=Math.sin(a)*SITE.hz*rr;const sf=siteFactor(x,z);if(sf<fmin||sf>fmax)continue;return [x,z];}return null;};
  const near=(x,z,d)=>placed.some(p=>Math.hypot(p.x-x,p.z-z)<d);
  // Edge planting in clusters with gaps (not a necklace): some directions thick shrubs, some rocks, some bare mound.
  const clusters=[];for(let k=0;k<13;k++)clusters.push({a:k/13*6.28+r()*.3,kinds:[['hydrangea','fern','boxwood'],['azalea','fern','silvergrass'],['camellia','boxwood','fern'],['silvergrass','fern','rock'],['boxwood','hydrangea','fern']][k%5],n:6+Math.floor(r()*8)});
  for(const cl of clusters)for(let i=0;i<cl.n;i++){const a=cl.a+(r()-.5)*.42,f=1.02+r()*.2;const x=Math.cos(a)*SITE.hx*f,z=Math.sin(a)*SITE.hz*f;const sf=siteFactor(x,z);if(sf<1.01||sf>1.25)continue;const kind=cl.kinds[i%cl.kinds.length];put(kind,x,z,kind==='rock'?.9+r()*1.2:.8+r()*.6,r()*6.28);}
  for(let i=0;i<14;i++){const p=ring(1.0,1.16);if(!p)continue;put('rock',p[0],p[1],1+r()*1.4,r()*6.28);}
  const trees=['oak','birch','pine','fir','maple','willow','cherry','oak','pine','fir'];let n=0,tries=0;
  while(n<62&&tries++<2000){const p=ring(1.06,1.7);if(!p||near(p[0],p[1],2.4))continue;const a=Math.atan2(p[1],p[0]);const kind=trees[Math.floor(((a+6.28)*1.9+r()*2)%trees.length)];put(kind,p[0],p[1],1+r()*.55,r()*6.28);n++;}
  n=0;tries=0;while(n<90&&tries++<3000){const p=ring(1.6,2.9);if(!p||near(p[0],p[1],2.6))continue;placed.push({kind:['oak','pine','fir','maple','birch'][n%5],lod:'far',x:p[0],y:H(p[0],p[1]),z:p[1],s:1.5+r()*.9,rot:r()*6.28});n++;}
  // Far silhouettes: cheap cone+blob trees on the ridges.
  // Round 3 (visual-three): the ridge silhouettes are trunks with a few large frond cards instead of smooth dark spheres,
  // so nothing in the haze reads as a green ball between the nearer trees.
  const farG=new T.Group();for(let i=0;i<160;i++){const p=ring(2.8,4.4);if(!p)continue;const y=H(p[0],p[1]),s=2+r()*2;branch(farG,[p[0],y-.5,p[1]],[p[0],y+s*1.2,p[1]],.18*s,'#5c6f55');
   const pal=[['#7f9a68','#6a8a5c','#5d7d52'],['#8aa66e','#729260','#5f8054'],['#93a872','#7a9264','#66815a']][i%3];for(let k=0;k<4;k++){const a=k/4*6.28+r()*.8,d=s*.3;const cx=p[0]+Math.cos(a)*d,cz=p[1]+Math.sin(a)*d,cy=y+s*(1.05+r()*.5);const m=mesh(farG,G.plane,pal[k%3],cx,cy,cz,s*1.3,s*1.3,1,{card:'twigoval',canopy:true,emissiveIntensity:.06});m.rotation.set((r()-.5)*.6,a+1.57,(r()-.5)*.5);}if(i%8===7)yield;}
  for(const m of farG.children)m.castShadow=false;const far=bake(farG);far.traverse(o=>{if(o.isMesh){o.castShadow=false;prepare(o.material);}});this.scene.add(far);this.far=far;
  this.scenery=new T.Group();this.scene.add(this.scenery);const byKind=new Map();for(const p of placed){const key=p.kind+'|'+(p.lod??'full');if(!byKind.has(key))byKind.set(key,[]);byKind.get(key).push(p);}
  const dummy=new T.Object3D();for(const [key,list] of byKind){const [kind,lod]=key.split('|');const transforms=new Float32Array(list.length*16);list.forEach((p,i)=>{dummy.position.set(p.x,p.y-.03,p.z);dummy.rotation.set(0,p.rot,0);dummy.scale.setScalar(p.s);dummy.updateMatrix();dummy.matrix.toArray(transforms,i*16);});for(const part of prototype(kind,classroom&&material(kind)?.drawer==='tree'?'far':lod).children){const inst=new T.InstancedMesh(part.geometry,part.material,list.length);inst.userData.noShadow=part.userData.noShadow;inst.userData.noReceive=part.userData.noReceive;inst.instanceMatrix.array.set(transforms);inst.computeBoundingSphere();applyMeshFlags(inst);this.scenery.add(inst);}yield;}
  // Ground life: grass tufts (sparse in the open clearing, thick under the edge forest) and tiny wildflowers. Scenery only —
  // not student placements — and they vanish under any path/deck the student lays (cover mask discard).
  const geo=new T.PlaneGeometry(1,1,1,2);geo.translate(0,.5,0);
  const tuftGeo=(()=>{const a=geo.clone(),b=geo.clone().rotateY(Math.PI/2);const pa=a.attributes.position,pb=b.attributes.position,n=pa.count;const pos=new Float32Array(n*6),uv=new Float32Array(n*4),nor=new Float32Array(n*6);pos.set(pa.array,0);pos.set(pb.array,n*3);uv.set(a.attributes.uv.array,0);uv.set(b.attributes.uv.array,n*2);nor.set(a.attributes.normal.array,0);nor.set(b.attributes.normal.array,n*3);const idx=[...a.index.array,...b.index.array.map(i=>i+n)];const g2=new T.BufferGeometry();g2.setAttribute('position',new T.BufferAttribute(pos,3));g2.setAttribute('uv',new T.BufferAttribute(uv,2));g2.setAttribute('normal',new T.BufferAttribute(nor,3));g2.setIndex(idx);a.dispose();b.dispose();return g2;})();geo.dispose();
  // Natural clumps, not an even sprinkle: tufts gather around the edge planting, rocks and trunks (sf 0.9–1.7) and along the
  // clearing rim; the central editing area (sf < 0.9) stays clear. Each clump = one anchor + a loose ring of tufts.
  const anchors=placed.filter(p=>p.lod!=='far'&&p.kind!=='rock'?r()<.55:true).map(p=>({x:p.x,z:p.z,n:p.kind==='rock'?7:4,rad:p.kind==='rock'?1.1:1.4}));
  for(let k=0;k<26;k++){const a=k/26*6.28+r()*.2,f=.9+r()*.12;anchors.push({x:Math.cos(a)*SITE.hx*f,z:Math.sin(a)*SITE.hz*f,n:5,rad:1.2});}
  const spots=[];for(const an of anchors)for(let i=0;i<an.n&&spots.length<900;i++){const a=r()*6.28,d=Math.sqrt(r())*an.rad;const x=an.x+Math.cos(a)*d,z=an.z+Math.sin(a)*d;const sf=siteFactor(x,z);if(sf<.88||sf>1.75||Math.hypot(x,z-9.75)<2.6)continue;spots.push({x,z,sf});}
  const place=function*(list,mesh_,size){for(let i=0;i<list.length;i++){const p=list[i];dummy.position.set(p.x,H(p.x,p.z)-.01,p.z);dummy.rotation.set(0,r()*6.28,0);const s=size(p);dummy.scale.set(s*(.7+r()*.6),s*(.75+r()*.6),s*(.7+r()*.6));dummy.updateMatrix();mesh_.setMatrixAt(i,dummy.matrix);if(i%512===511)yield;}mesh_.computeBoundingSphere();mesh_.castShadow=false;mesh_.receiveShadow=true;mesh_.raycast=()=>{};this.scenery.add(mesh_);}.bind(this);
  const tufts=new T.InstancedMesh(tuftGeo,maskedCard(tuftTex(),'#aec68f',.05,this.hideTex,BOUND),spots.length);yield* place(spots,tufts,p=>p.sf<1?.22+r()*.1:.3+r()*.2);
  const fl=spots.filter((p,i)=>i%4===0);const flowers=new T.InstancedMesh(tuftGeo,maskedCard(daisyTex(),'#fff6e0',.03,this.hideTex,BOUND),fl.length);yield* place(fl,flowers,()=>.09+r()*.05);
  const fl2=spots.filter((p,i)=>i%6===2&&p.sf>.95);const blooms=new T.InstancedMesh(tuftGeo,maskedCard(bloomTex(),'#f2b7cf',.03,this.hideTex,BOUND),fl2.length);yield* place(fl2,blooms,()=>.1+r()*.05);
  // visual-three round 2: low meadow grass across the open clearing — short tufts (10–17 cm) thinning toward the middle,
  // with a few tiny white flowers; none on the entrance landing. Scenery only: they never block taps and they discard
  // under any path/deck the student lays (cover mask), so the clearing stays an editing area, not a lawn to mow.
  // Density follows a low-frequency noise: drifts of grass with bare ground between (Codex: no even sprinkle); where the
  // drift is thickest a few low moss cushions sit between the tufts. Everything reads the scenery hide mask.
  const dens=(x,z)=>{const dn=.5+.5*Math.sin(x*.55+1.3)*Math.cos(z*.48+.4)+.35*Math.sin(x*1.5+.6)*Math.sin(z*1.3+2);return .18+Math.max(0,dn-.25)*1.3;};
  // (Codex r2c: solid moss cushions read as green stickers on the meadow → removed; the ground shader's soft moss patches stay.)
  const low=[];for(let cluster=0;cluster<3400;cluster++){if(cluster%128===127)yield;const a=r()*6.28,f=Math.sqrt(r())*.96,cx=Math.cos(a)*SITE.hx*f,cz=Math.sin(a)*SITE.hz*f;if(r()>.5+Math.min(.5,dens(cx,cz)*.5))continue;const radius=.32+r()*.5;
   for(let k=0;k<12;k++){const angle=r()*6.28,d=Math.sqrt(r())*radius,x=cx+Math.cos(angle)*d,z=cz+Math.sin(angle)*d,sf=siteFactor(x,z);if(sf>.96||Math.hypot(x,z-9.75)<.65)continue;low.push({x,z,sf});}}
  // A short curved 3D grass carpet catches light at ground level; no crossed cutout silhouettes.
  const gp=[],gc=[],gi=[];for(let blade=0;blade<7;blade++){const a=blade*2.4,h=.035+r()*.045,lean=.02+r()*.045,width=.0045+r()*.0045,base=gp.length/3,c=new T.Color(['#426638','#8aab58','#658c43'][blade%3]);for(let j=0;j<3;j++){const t=j/2;for(const side of [-1,1]){gp.push(Math.cos(a)*(.018+lean*t*t)-Math.sin(a)*width*(1-t)*side,h*t,Math.sin(a)*(.018+lean*t*t)+Math.cos(a)*width*(1-t)*side);gc.push(c.r*(.74+.28*t),c.g*(.80+.20*t),c.b*(.74+.22*t));}}for(let j=0;j<2;j++){const b=base+j*2;gi.push(b,b+1,b+2,b+1,b+3,b+2);}}
  const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));gg.setAttribute('color',new T.Float32BufferAttribute(gc,3));gg.setIndex(gi);gg.computeVertexNormals();const gn=gg.attributes.normal,gv=new T.Vector3();for(let i=0;i<gn.count;i++){gv.fromBufferAttribute(gn,i);if(gv.y<0)gv.negate();gv.y+=.65;gv.normalize();gn.setXYZ(i,gv.x,gv.y,gv.z);}
  const gm=maskedCard(tuftTex(),'#ffffff',.018,this.hideTex,BOUND);gm.map=null;gm.emissiveMap=null;gm.emissiveIntensity=.018;gm.alphaTest=0;gm.vertexColors=true;
  // Thin grass is lit toward the sky on either face, avoiding black needle silhouettes.
  const grassCompile=gm.onBeforeCompile;gm.onBeforeCompile=sh=>{grassCompile(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n{vec3 skyNormal=normalize(mat3(viewMatrix)*vec3(0.0,1.0,0.0));if(dot(normal,skyNormal)<0.0)normal=-normal;normal=normalize(mix(normal,skyNormal,.52));}');};gm.customProgramCacheKey=()=>'meadow-grass-sky';
  if(classroom)low.splice(0,low.length,...low.filter((_,i)=>i%4===0));
  yield;const lowTufts=new T.InstancedMesh(gg,gm,low.length);lowTufts.userData={owned:true,ownMaterial:true};const grassColor=new T.Color();low.forEach((p,i)=>{const wave=Math.sin(p.x*.7+p.z);lowTufts.setColorAt(i,grassColor.setRGB(.87+.10*wave,.94+.06*wave,.88+.08*wave));});yield* place(low,lowTufts,()=>.72+r()*.38);this.meadow=lowTufts;
  const lf=low.filter((p,i)=>i%43===0);const lowFlowers=new T.InstancedMesh(tuftGeo,maskedCard(daisyTex(),'#fffbe8',.02,this.hideTex,BOUND),lf.length);yield* place(lf,lowFlowers,()=>.035+r()*.025);if(classroom)this.scenery.traverse(o=>{o.castShadow=false;});freezeTransforms(this.scenery);freezeTransforms(this.far); }
 // ---- atmosphere: stars, fireflies, light shafts (built once; visibility follows the environment) ----
 buildAtmosphere(){const r=rng(2026);
  const sp=[],sc=[];for(let i=0;i<420;i++){const a=r()*6.28,e=Math.asin(.06+r()*.94);sp.push(Math.cos(a)*Math.cos(e)*162,Math.sin(e)*162,Math.sin(a)*Math.cos(e)*162);const b=.45+r()*.55;sc.push(b,b,b*(.9+r()*.1));}
  const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));
  this.stars=new T.Points(sg,new T.PointsMaterial({size:2.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.85,fog:false,depthWrite:false}));this.stars.raycast=()=>{};this.scene.add(this.stars);
  // Fireflies: one draw call, ~110 points drifting and blinking in the shader; restrained size and count.
  const fp=[],fs=[];for(let i=0;i<110;i++){const a=r()*6.28,f=.25+r()*1.4;const x=Math.cos(a)*SITE.hx*f,z=Math.sin(a)*SITE.hz*f;fp.push(x,height(x,z,this.terrain)+.5+r()*1.7,z);fs.push(r());}
  const fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(fp,3));fg.setAttribute('aSeed',new T.Float32BufferAttribute(fs,1));
  this.fireflies=new T.Points(fg,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uTime,uPixel:{value:this.renderer.getPixelRatio()},map:{value:sparkTex()}},
   vertexShader:'uniform float uTime,uPixel;attribute float aSeed;varying float vA;void main(){vec3 p=position;p.x+=sin(uTime*.7+aSeed*6.0)*.4;p.y+=sin(uTime*1.1+aSeed*9.0)*.28;p.z+=cos(uTime*.6+aSeed*4.0)*.4;float b=smoothstep(.1,.9,sin(uTime*1.5+aSeed*20.0)*.5+.5);vA=.15+.85*b;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(6.0+5.0*b)*uPixel*(16.0/max(2.0,-mv.z));gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform sampler2D map;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vec3(0.85,1.0,0.5)*t.rgb,t.a*vA);}'}));this.fireflies.raycast=()=>{};this.scene.add(this.fireflies);
  // Light shafts: seven crossed gradient quads on the sun side of the clearing, aligned with the sun direction.
  // Kept faint (Codex previz review): a hint of light in the air, never a bright beam burning the trees.
  // Round 3 (visual-three): one quad per shaft, turned every frame to face the camera around the shaft's own axis
  // (cylindrical billboard), and faded out when the camera comes within a few metres — so walking never shows a
  // crossed pair of flat sheets. Opacity per shaft is set in render().
  this.rays=new T.Group();const sunDir=new T.Vector3(...ENVIRONMENTS.morning.sun.pos).normalize();for(let i=0;i<5;i++){const x=-6.4+i*2.2,z=-2.8+(i%3)*2;const w=.48+r()*.55,h=8+r()*3;const g=new T.Group();const rm=new T.MeshBasicMaterial({map:rayTex(),transparent:true,depthWrite:false,fog:false,side:T.DoubleSide,blending:T.AdditiveBlending,opacity:.15,color:'#ffedc9'});
   const q=new T.Mesh(new T.PlaneGeometry(1,1),rm);q.scale.set(w,h,1);q.raycast=()=>{};g.add(q);g.position.set(x,height(x,z,this.terrain)+h*.38,z);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),sunDir);g.userData.base=.21;this.rays.add(g);}this.scene.add(this.rays);}
 // Turn each light shaft toward the camera around its axis and fade it with proximity (called from render()).
 orientRays(camera){if(!this.rays?.visible)return;const cam=camera.position,v=this.rayLocal??=new T.Vector3();for(const g of this.rays.children){const q=g.children[0];g.updateWorldMatrix(true,false);const inverse=g.userData.rayInverse??=new T.Matrix4(),matrix=g.userData.rayMatrix??=new T.Matrix4();if(!g.userData.rayCached||!matrix.equals(g.matrixWorld)){matrix.copy(g.matrixWorld);inverse.copy(matrix).invert();g.userData.rayCached=true;}v.copy(cam).applyMatrix4(inverse);q.rotation.y=Math.atan2(v.x,v.z);const d=Math.hypot(v.x,v.z);q.material.opacity=g.userData.base*clamp((d-2.5)/4,0,1);}}
 // Every render goes through here: the camera actually used (screen camera OR the photo camera) drives the view-space
 // sun direction for leaf translucency and the light-shaft billboards, so a photo matches the same pose from any screen.
 renderWith(camera){waterMat().userData.time.value=uTime.value;camera.updateMatrixWorld();uSunView.value.copy(this.sun.position).normalize().transformDirection(camera.matrixWorldInverse);this.orientRays(camera);this.renderer.render(this.scene,camera);}
 setEnvironment(name){const e=ENVIRONMENTS[name]??ENVIRONMENTS.morning;this.environment=ENVIRONMENTS[name]?name:'morning';
  this.sun.color.set(e.sun.color);this.sun.intensity=e.sun.intensity;this.sun.position.set(...e.sun.pos);const dir=this.sun.position.clone().normalize();
  this.fill.color.set(e.fill.color);this.fill.intensity=e.fill.intensity;this.fill.position.set(...e.fill.pos);this.clouds.material.color.set(e.clouds.color);this.clouds.material.opacity=e.clouds.opacity;waterMat().userData.sky.value.set(e.sky.mid);
  this.hemi.color.set(e.hemi.sky);this.hemi.groundColor.set(e.hemi.ground);this.hemi.intensity=e.hemi.intensity;this.renderer.toneMappingExposure=e.exposure;this.fogColor.set(e.fog);
  const u=this.sky.material.uniforms;u.top.value.set(e.sky.top);u.mid.value.set(e.sky.mid);u.low.value.set(e.sky.low);u.tint.value.set(e.sky.tint);u.tintPower.value=e.sky.tintPower;u.sunDir.value.copy(dir);
  uTrans.value=e.trans??.5;this.glow.visible=e.glow;this.glow.position.copy(dir).multiplyScalar(150);this.moon.visible=e.night;this.moon.position.copy(dir).multiplyScalar(150);this.stars.visible=e.night;this.rays.visible=e.rays;this.fireflies.visible=e.night;if(this.lampGlow)this.lampGlow.visible=e.night;this.dappleU.value=e.dapple;
  for(const m of matCache.values())if(m.userData.lamp)m.emissiveIntensity=m.userData.lampIntensity*e.lamp;
  this.assignLamps(true);this.dirty=true;}
 // Up to LAMP_LIMIT real point lights follow the lanterns/pavilions nearest the camera; every lamp also gets a warm ground pool.
 assignLamps(force){const night=!!ENVIRONMENTS[this.environment]?.night;const now=performance.now();if(!force&&now-(this.lampTime??0)<350)return;this.lampTime=now;
  if(!night||!this.lampSpots.length){for(const l of this.lamps)l.intensity=0;return;}
  const c=this.camera.position;if(!force&&this.lampX===c.x&&this.lampZ===c.z)return;this.lampX=c.x;this.lampZ=c.z;const spots=this.sortedLampSpots??=[];spots.length=this.lampSpots.length;for(let i=0;i<spots.length;i++)spots[i]=this.lampSpots[i];spots.sort((a,b)=>((a.x-c.x)**2+(a.z-c.z)**2)-((b.x-c.x)**2+(b.z-c.z)**2));
  this.lamps.forEach((l,i)=>{const s=spots[i];if(!s){l.intensity=0;return;}l.position.set(s.x,s.y,s.z);l.intensity=s.power;l.distance=s.reach;});this.dirty=true;}
 // ---- student items ----
 setItems(items,terrain=this.terrain){const stamp=JSON.stringify(items);if(items===this.items&&terrain===this.terrain&&stamp===this.itemStamp)return;this.itemStamp=stamp;this.rebuildTerrain(terrain);this.items=items;
  for(const m of [...this.objects.children]){this.objects.remove(m);ForestWorld.disposeOwned(m);}for(const m of [...this.covers.children]){this.covers.remove(m);ForestWorld.disposeOwned(m);}
  const heights=new Map(items.map(it=>[it,restY(items,it,terrain)]));this.surfaces=deckSurfaces(items,terrain,heights);
  const dummy=new T.Object3D();const skirts=[],byKind=new Map();for(const it of items){if(!byKind.has(it.kind))byKind.set(it.kind,[]);byKind.get(it.kind).push(it);}
  for(const def of MATERIALS){const same=byKind.get(def.id);if(!same?.length)continue;
   if(isCoverKind(def.id)){const g=new T.Group();for(const it of same){const y=heights.get(it);const cover=coverGroup(def.id,it,(x,z)=>height(x,z,terrain),y);if(def.id==='pond')cover.children[0].material=reflectionMaterial(waterMat(),y);g.add(cover);}const baked=bake(g);baked.traverse(o=>{if(o.isMesh){applyMeshFlags(o);o.castShadow=def.id!=='pond';o.userData.ids=null;o.userData.kind=def.id;o.userData.owned=true;installReflection(o,camera=>{uSunView.value.copy(this.sun.position).normalize().transformDirection(camera.matrixWorldInverse);this.orientRays(camera);});}});baked.userData.items=same;this.covers.add(baked);continue;}
   const transforms=new Float32Array(same.length*16),ids=same.map(x=>x.id);same.forEach((x,i)=>{dummy.position.set(x.x,heights.get(x),x.z);dummy.rotation.set(0,x.rotation,0);dummy.scale.setScalar(x.scale);dummy.updateMatrix();dummy.matrix.toArray(transforms,i*16);});
   for(const part of prototype(def.id).children){const inst=new T.InstancedMesh(part.geometry,part.material,same.length);inst.userData.ids=ids;inst.userData.noShadow=part.userData.noShadow;inst.userData.noReceive=part.userData.noReceive;if(part.material.userData?.contact)inst.raycast=()=>{};/* contact-shadow discs never intercept taps */inst.instanceMatrix.array.set(transforms);inst.computeBoundingSphere();applyMeshFlags(inst);this.objects.add(inst);}
   if(def.base==='rigid'||def.base==='deck')for(const it of same){if(it.on)continue;let min=Infinity;for(const s of footSamples(it,def.foot))min=Math.min(min,height(s.x,s.z,terrain));const y=heights.get(it);const top=def.base==='deck'?y-.13:y+.02,bottom=min-.06;if(top-bottom<.04)continue;skirts.push({it,def,top,bottom});}}
  if(skirts.length){const inst=new T.InstancedMesh(G.box,mat('#5c5244',{rough:1}),skirts.length);skirts.forEach(({it,def,top,bottom},i)=>{dummy.position.set(it.x,(top+bottom)/2,it.z);dummy.rotation.set(0,it.rotation,0);dummy.scale.set(def.foot.w*2*it.scale*.92,top-bottom,def.foot.d*2*it.scale*.92);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.userData.ids=skirts.map(s=>s.it.id);applyMeshFlags(inst);this.objects.add(inst);}
  // Lamp spots: lanterns (bulb at .72) and pavilions (hanging lamp at 1.75); warm pools on the ground, instanced.
  if(this.lampGlow){this.lampGlow.geometry.dispose();this.lampGlow.material.dispose();this.lampGlow=null;} // the mesh itself was removed with the other objects above
  this.lampSpots=[];for(const it of items){if(it.kind!=='lantern'&&it.kind!=='pavilion')continue;const y=heights.get(it);const pav=it.kind==='pavilion';this.lampSpots.push({x:it.x,y:y+(pav?1.75:.72)*it.scale,z:it.z,gy:y,power:pav?9:5,reach:pav?9:6.5,pool:pav?8.5:4.6,scale:it.scale});}
  if(this.lampSpots.length){const geo=new T.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);const inst=new T.InstancedMesh(geo,new T.MeshBasicMaterial({map:poolTex(),transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending}),this.lampSpots.length);
   this.lampSpots.forEach((s,i)=>{dummy.position.set(s.x,s.gy+.04,s.z);dummy.rotation.set(0,0,0);dummy.scale.set(s.pool*s.scale,1,s.pool*s.scale);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});inst.raycast=()=>{};inst.visible=!!ENVIRONMENTS[this.environment]?.night;inst.userData.owned=true;inst.userData.ownMaterial=true;this.objects.add(inst);this.lampGlow=inst;}
  this.assignLamps(true);
  coverMask(items,this.maskData);this.maskTex.needsUpdate=true;sceneryMask(items,this.maskData,this.hideData);this.hideTex.needsUpdate=true;this.plantFringes();freezeTransforms(this.objects);freezeTransforms(this.covers);this.dirty=true;
 }
 // Low curved blades tie planted objects to the soil; they never add saved items or collision bodies.
 plantFringes(){
  this.fringe=null;this.clover=null;this.borderBlooms=null;const assets=this.fringeAssets??={};let {geometry,leafMaterial}=assets;if(!geometry){const verts=[],colors=[],indices=[],r=rng(983);const palette=['#6d914c','#97ad62','#7fa253'];
  for(let blade=0;blade<12;blade++){const angle=blade*2.4,h=.13+r()*.17,width=.026+r()*.014,lean=.08+r()*.13,base=verts.length/3,c=new T.Color(palette[blade%3]);
   for(let k=0;k<5;k++){const t=k/4,ww=width*(1-t)*.5,x=Math.cos(angle)*lean*t*t,z=Math.sin(angle)*lean*t*t;
    for(const side of [-1,1]){verts.push(x-Math.sin(angle)*ww*side,h*t,z+Math.cos(angle)*ww*side);colors.push(c.r*(.7+.3*t),c.g*(.7+.3*t),c.b*(.7+.3*t));}}
   for(let k=0;k<4;k++){const i=base+k*2;indices.push(i,i+1,i+2,i+1,i+3,i+2);}}
  geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  leafMaterial=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide,emissive:'#3d5427',emissiveIntensity:.12});leafMaterial.userData={sway:.025};prepare(leafMaterial);Object.assign(assets,{geometry,leafMaterial});}
  const spots=[];for(const it of this.items){const def=material(it.kind);if(!['tree','shrub','flower'].includes(def?.drawer)&&!['stonepath','rock'].includes(it.kind))continue;
   let seed=37;for(const c of it.id)seed+=c.charCodeAt(0);const rr=rng(seed),tree=def.drawer==='tree',edge=['stonepath','rock'].includes(it.kind);
   for(let k=0;k<(edge?12:tree?18:14)&&spots.length<4200;k++){const a=rr()*6.28,d=(edge?.48:tree?.38:.20)+Math.sqrt(rr())*(edge?.48:tree?1.18:.86),x=it.x+Math.cos(a)*d*it.scale,z=it.z+Math.sin(a)*d*it.scale;
    if(!insideSite(x,z,1))continue;const ix=Math.floor((x+BOUND.hx)/(2*BOUND.hx)*MASK_RES),iz=Math.floor((z+BOUND.hz)/(2*BOUND.hz)*MASK_RES);
    if(ix<0||iz<0||ix>=MASK_RES||iz>=MASK_RES||this.hideData[iz*MASK_RES+ix]>70)continue;
    spots.push({x,z,y:height(x,z,this.terrain),s:it.scale*(edge?.35+rr()*.25:.48+rr()*.55),a,tree,edge});}}
  if(classroom)spots.splice(0,spots.length,...spots.filter((_,i)=>i%4===0));
  if(!spots.length)return;
  const cloverSpots=[],flowerSpots=[],fernSpots=[];spots.forEach((p,i)=>{if(i%3!==0)cloverSpots.push(p);if(i%7===2&&!p.tree)flowerSpots.push(p);if(p.tree&&i%13===0)fernSpots.push(p);});
  const mesh=new T.InstancedMesh(geometry,leafMaterial,spots.length),dummy=new T.Object3D();spots.forEach((p,i)=>{dummy.position.set(p.x,p.y-.006,p.z);dummy.rotation.y=p.a;dummy.scale.setScalar(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();mesh.castShadow=false;mesh.receiveShadow=true;mesh.raycast=()=>{};this.objects.add(mesh);this.fringe=mesh;
  // Low clover leaves connect separate planting beds without changing student items or collision.
  let {cg,cm}=assets;if(!cg){const cv=[],cc=[],ci=[];for(let sprig=0;sprig<4;sprig++){const bx=Math.cos(sprig*2.4)*.12,bz=Math.sin(sprig*2.4)*.12,yy=.045+sprig*.014;
   for(let leaf=0;leaf<3;leaf++){const a=leaf*Math.PI*2/3+sprig,dx=Math.cos(a),dz=Math.sin(a),cx=bx+dx*.055,cz=bz+dz*.055,base=cv.length/3,col=new T.Color(['#477d35','#5d913b','#759d49'][leaf]);
    cv.push(cx,yy+.018,cz);cc.push(col.r,col.g,col.b);
    for(let j=0;j<8;j++){const t=j/8*Math.PI*2,u=Math.cos(t)*.068,v=Math.sin(t)*.046;cv.push(cx+dx*u-dz*v,yy+Math.sin(t)*.006,cz+dz*u+dx*v);cc.push(col.r*.88,col.g*.94,col.b*.87);}
    for(let j=0;j<8;j++)ci.push(base,base+j+1,base+(j+1)%8+1);}}
  cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(cv,3));cg.setAttribute('color',new T.Float32BufferAttribute(cc,3));cg.setIndex(ci);cg.computeVertexNormals();
  cm=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});cm.userData={sway:.009};prepare(cm);Object.assign(assets,{cg,cm});}
  const clover=new T.InstancedMesh(cg,cm,cloverSpots.length);
  cloverSpots.forEach((p,i)=>{dummy.position.set(p.x,p.y+.004,p.z);dummy.rotation.y=p.a;dummy.scale.setScalar(p.s*1.05);dummy.updateMatrix();clover.setMatrixAt(i,dummy.matrix);});
  clover.computeBoundingSphere();clover.castShadow=false;clover.receiveShadow=true;clover.raycast=()=>{};clover.userData={};this.objects.add(clover);this.clover=clover;
  // Small meadow blooms follow planted borders; the same accepted positions exclude water and paving.
  let {fg,fm}=assets;if(!fg){const fv=[],fc=[],fi=[];const face=(points,color)=>{const base=fv.length/3,c=new T.Color(color);for(const p of points){fv.push(...p);fc.push(c.r,c.g,c.b);}for(let j=1;j<points.length-1;j++)fi.push(base,base+j,base+j+1);};
  for(let k=0;k<3;k++){const x=Math.cos(k*2.4)*.1,z=Math.sin(k*2.4)*.1,y=.15+k*.065;
   face([[x-.004,0,z],[x+.004,0,z],[x+.004,y,z],[x-.004,y,z]],'#567635');
   for(let pet=0;pet<9;pet++){const a=pet/9*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),points=[];for(let j=0;j<8;j++){const t=j/8*Math.PI*2,u=.04+Math.cos(t)*.035,v=Math.sin(t)*.016;points.push([x+dx*u-dz*v,y+u*.10,z+dz*u+dx*v]);}face(points,k===1?'#eed6d7':'#f6edcf');}
   const center=[];for(let j=0;j<10;j++){const a=j/10*Math.PI*2;center.push([x+Math.cos(a)*.017,y+.008,z+Math.sin(a)*.017]);}face(center,'#d7a83d');}
  fg=new T.BufferGeometry();fg.setAttribute('position',new T.Float32BufferAttribute(fv,3));fg.setAttribute('color',new T.Float32BufferAttribute(fc,3));fg.setIndex(fi);fg.computeVertexNormals();
  fm=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});fm.userData={sway:.018};prepare(fm);Object.assign(assets,{fg,fm});}
  const blooms=new T.InstancedMesh(fg,fm,flowerSpots.length);
  flowerSpots.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.y=p.a;dummy.scale.setScalar(p.s*(p.edge?1.25:1));dummy.updateMatrix();blooms.setMatrixAt(i,dummy.matrix);});blooms.computeBoundingSphere();blooms.castShadow=false;blooms.receiveShadow=true;blooms.raycast=()=>{};blooms.userData={};this.objects.add(blooms);this.borderBlooms=blooms;

  const fernMatrices=new Float32Array(fernSpots.length*16);fernSpots.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.y=p.a;dummy.scale.setScalar(.4+p.s*.23);dummy.updateMatrix();dummy.matrix.toArray(fernMatrices,i*16);});for(const part of prototype('fern',classroom?'classroom':'full').children){if(!fernSpots.length)break;const f=new T.InstancedMesh(part.geometry,part.material,fernSpots.length);f.instanceMatrix.array.set(fernMatrices);f.computeBoundingSphere();applyMeshFlags(f);f.castShadow=false;f.raycast=()=>{};this.objects.add(f);}

 }
 // Prepare first-use GPU buffers and shadow variants behind the loading cover in bounded batches.
 async prepareDraw(camera){
  const nodes=[];this.scene.traverseVisible(o=>{if(o.isMesh||o.isPoints||o.isLine||o.isSprite)nodes.push({o,culled:o.frustumCulled,hook:o.onBeforeRender});});
  const size=this.renderer.getDrawingBufferSize(new T.Vector2()),target=new T.WebGLRenderTarget(size.x,size.y),previous=this.renderer.getRenderTarget();target.texture.colorSpace=T.SRGBColorSpace;
  try{this.renderer.setRenderTarget(target);for(const {o} of nodes){o.visible=false;if(o.userData.waterSurface)o.onBeforeRender=()=>{};}
   // Small draws let the loading UI breathe when a batch includes a large tree or flower bed.
   let slice=performance.now();for(let i=0;i<nodes.length;i+=6){const batch=nodes.slice(i,i+6);for(const {o} of batch){o.visible=true;o.frustumCulled=false;}this.renderWith(camera);for(const {o} of batch)o.visible=false;if(performance.now()-slice>=8||i+6>=nodes.length){await ForestWorld.pause();slice=performance.now();}}
    for(const {o,culled,hook} of nodes){o.visible=true;o.frustumCulled=culled;o.onBeforeRender=hook;}this.renderWith(camera);await ForestWorld.pause();
  }finally{for(const {o,culled,hook} of nodes){o.visible=true;o.frustumCulled=culled;o.onBeforeRender=hook;}this.renderer.setRenderTarget(previous);target.dispose();this.renderer.shadowMap.needsUpdate=true;}
 }
 async prepareTextures(){
  const textures=new Set(),materials=new Set();this.scene.traverse(o=>{for(const m of [o.material,o.customDepthMaterial])if(m&&!materials.has(m)){materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);}});
  let start=performance.now();for(const texture of textures){this.renderer.initTexture(texture);if(performance.now()-start>=8){await ForestWorld.pause();start=performance.now();}}
 }
 // ---- preview ghost ----
 async preparePlacement(){
  const previews=new T.Group(),seen=new Set();let sliceStart=performance.now();
  for(const def of MATERIALS){if(isCoverKind(def.id))continue;for(const ok of [true,false]){
   for(const part of prototype(def.id).children){const material=this.ghostMaterial(part.material,ok);if(seen.has(material))continue;seen.add(material);const mesh=new T.Mesh(part.geometry,material);mesh.castShadow=false;mesh.receiveShadow=false;previews.add(mesh);}
  }if(performance.now()-sliceStart>=8){await ForestWorld.pause();sliceStart=performance.now();}}
  this.scene.add(previews);
  try{await this.prepareTextures();await this.renderer.compileAsync(this.scene,this.camera);}catch(error){console.warn('재료 미리보기는 선택할 때 준비합니다.',error);}finally{this.scene.remove(previews);}
 }
 ghostMaterial(src,ok){const key=src.uuid+(ok?'+':'-');if(!this.ghostMats.has(key)){const m=src.clone();m.transparent=true;m.opacity=.58;m.depthWrite=false;if(m.emissive){m.emissive=new T.Color(ok?'#2f6b3a':'#7a2a2a');m.emissiveIntensity=ok?.35:.6;}m.userData={...src.userData,prepared:false};prepare(m);this.ghostMats.set(key,m);}return this.ghostMats.get(key);}
 setGhost(cands,results){if(!cands&&!this.ghost.children.length){this.ghostPointStates=null;return;}const previous=this.ghostPointStates;if(cands&&previous&&previous.length===cands.length&&cands.every((c,i)=>c.kind===previous[i].kind&&!!results[i].ok===previous[i].ok)){cands.forEach((c,i)=>{const y=results[i].ok?results[i].y:height(c.x,c.z,this.terrain),g=this.ghost.children[i*2],ring=this.ghost.children[i*2+1];g.position.set(c.x,y,c.z);g.rotation.y=c.rotation;g.scale.setScalar(c.scale);ring.position.set(c.x,y+.03,c.z);ring.rotation.y=c.rotation;ring.scale.set(c.scale,1,c.scale);});this.dirty=true;return;}this.ghostPointStates=cands?.every(c=>!isCoverKind(c.kind))?cands.map((c,i)=>({kind:c.kind,ok:!!results[i].ok})):null;for(const c of [...this.ghost.children]){this.ghost.remove(c);ForestWorld.disposeOwned(c);}
  if(!cands){this.dirty=true;return;}
  cands.forEach((c,i)=>{const res=results[i],def=material(c.kind);const ok=!!res.ok;const y=res.ok?res.y:height(c.x,c.z,this.terrain);
   let g;if(isCoverKind(c.kind)){g=coverGroup(c.kind,{...c,id:c.id||'ghost'},(x,z)=>height(x,z,this.terrain),y);g.traverse(o=>{if(o.isMesh){o.userData.owned=true;}});}
   else{g=prototype(c.kind).clone();g.position.set(c.x,y,c.z);g.rotation.set(0,c.rotation,0);g.scale.setScalar(c.scale);}
   g.traverse(o=>{if(o.isMesh){o.material=this.ghostMaterial(o.material,ok);o.castShadow=false;o.receiveShadow=false;o.raycast=()=>{};}});this.ghost.add(g);
   const foot=def.foot??{w:.45,d:.45,round:true};const ring=this.footRing(foot,ok?'#f5f1c8':'#e0836a');ring.position.set(c.x,y+.03,c.z);ring.rotation.y=c.rotation;ring.scale.set(c.scale,1,c.scale);ring.raycast=()=>{};this.ghost.add(ring);});
  this.dirty=true;}
 footRing(foot,color){const key=foot.round?'round':'rect:'+foot.d/foot.w,cache=this.ringGeometries??=new Map();let shape=cache.get(key);if(!shape){shape=foot.round?new T.RingGeometry(1,1.06,40):(()=>{const w=1,d=foot.d/foot.w;const s=new T.Shape();s.moveTo(-w-.05,-d-.05);s.lineTo(w+.05,-d-.05);s.lineTo(w+.05,d+.05);s.lineTo(-w-.05,d+.05);s.closePath();const hole=new T.Path();hole.moveTo(-w,-d);hole.lineTo(w,-d);hole.lineTo(w,d);hole.lineTo(-w,d);hole.closePath();s.holes.push(hole);return new T.ShapeGeometry(s);})();cache.set(key,shape);}const mats=this.ringMaterials??=new Map();if(!mats.has(color))mats.set(color,new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));const m=new T.Mesh(shape,mats.get(color));m.userData.owned=true;m.userData.sharedGeometry=true;m.userData.ownMaterial=false;m.rotation.x=-Math.PI/2;if(foot.round)m.scale.set(foot.w,foot.d,1);else m.scale.set(foot.w,foot.w,1);const g=new T.Group();g.add(m);return g;}
 // ---- selection frame ----
 select(id){const old=this.selectionKey;if(old&&old.id===id&&old.stamp===this.itemStamp&&old.terrain===this.terrain&&old.mode===this.mode)return;this.selectionKey={id,stamp:this.itemStamp,terrain:this.terrain,mode:this.mode};for(const c of [...this.selection.children]){this.selection.remove(c);ForestWorld.disposeOwned(c);}const it=this.items.find(x=>x.id===id);this.selection.visible=!!it&&this.mode==='view';if(!it)return;const def=material(it.kind);const foot=def.foot??{w:.5,d:.5,round:true};const ring=this.footRing(foot,'#fff6c8');ring.position.set(it.x,restY(this.items,it,this.terrain)+.04,it.z);ring.rotation.y=it.rotation;ring.scale.set(it.scale,1,it.scale);this.selection.add(ring);this.dirty=true;}
 makeMarker(){const g=new T.Group();for(const s of [-1,1]){const f=mesh(g,G.ball,'#fff3c4',s*.14,.02,s*.1,.09,.02,.16,{emissive:'#ffd98a',emissiveIntensity:.5});f.rotation.y=s*.15;}const ring=new T.Mesh(new T.RingGeometry(.42,.5,32),new T.MeshBasicMaterial({color:'#fff3c4',transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;g.add(ring);
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=144;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#173e31';ctx.strokeStyle='#fff6d9';ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(4,4,312,100,26);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(142,103);ctx.lineTo(160,139);ctx.lineTo(178,103);ctx.fill();
  ctx.fillStyle='#fff6d9';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('현재 위치',160,54);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const label=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,toneMapped:false,fog:false,sizeAttenuation:false}));
  label.name='current-position';label.center.set(.5,0);label.position.y=.12;label.visible=false;label.renderOrder=1000;g.add(label);this.locationLabel=label;
  g.traverse(o=>{o.raycast=()=>{};});return g;}
 setMarker(x,z){const c=this.markerCache??={};if(c.x===x&&c.z===z&&c.yaw===this.walk.yaw&&c.surfaces===this.surfaces&&c.terrain===this.terrain)return;Object.assign(c,{x,z,yaw:this.walk.yaw,surfaces:this.surfaces,terrain:this.terrain});this.marker.position.set(x,walkHeight(x,z,this.terrain,this.surfaces)+.02,z);this.marker.rotation.y=this.walk.yaw;this.dirty=true;}
 // ---- canopy see-through (overview only) ----
 setCanopyFade(on){this.canopyFaded=!!on;for(const m of matCache.values()){if(!m.userData.canopy)continue;const opacity=on?(m.userData.sprig?.25:.22):(m.userData.sprig?1:(m.userData.baseOpacity??1));if(m.transparent===!!on&&m.opacity===opacity&&m.depthWrite===!on)continue;if(m.userData.sprig){m.opacity=on?.25:1;m.transparent=on;m.depthWrite=!on;}else{m.transparent=on;m.opacity=on?.22:(m.userData.baseOpacity??1);m.depthWrite=!on;}m.needsUpdate=true;}this.dirty=true;}
 // ---- modes and cameras ----
 setMode(mode){this.selectionKey=null;this.mode=mode;this.locationLabel.visible=mode==='view';this.selection.visible=false;this.marker.visible=mode==='view';if(mode==='view')this.setMarker(this.walk.x,this.walk.z);this.move={x:0,z:0};this.camY=null;this.avatar?.tick(0,0);this.updateCamera();this.dirty=true;}
 setWalkPose(p){this.walk={x:p.x,z:p.z,yaw:p.yaw??0,pitch:p.pitch??.03};this.camY=null;this.updateCamera();this.dirty=true;}
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;const ratio=renderRatio(w,h,devicePixelRatio,classroom,this.renderScale);if(this.renderer.getPixelRatio()!==ratio){this.renderer.setPixelRatio(ratio);this.dirty=true;}const size=this.resizeSize??=new T.Vector2();this.renderer.getSize(size);if(size.x===w&&size.y===h&&this.aspect===w/h)return;this.renderer.setSize(w,h);const labelHeight=42*2*Math.tan(50*Math.PI/360)/h;this.locationLabel.scale.set(labelHeight*320/144,labelHeight,1);this.aspect=w/h;this.walkCam.aspect=this.aspect;this.walkCam.updateProjectionMatrix();this.viewCam.aspect=this.aspect;this.viewCam.updateProjectionMatrix();this.updateCamera();this.dirty=true;}
 // Walking keeps the soft near haze; the overview pushes the haze back with the camera so the clearing always reads clearly.
 walkGround(){const c=this.groundCache??={};if(c.x!==this.walk.x||c.z!==this.walk.z||c.terrain!==this.terrain||c.surfaces!==this.surfaces){c.x=this.walk.x;c.z=this.walk.z;c.terrain=this.terrain;c.surfaces=this.surfaces;c.y=walkHeight(c.x,c.z,c.terrain,c.surfaces);}return c.y;}
 updateCamera(){const fog=this.scene?.fog;if(this.mode==='walk'){if(fog){fog.near=WALK_FOG[0];fog.far=WALK_FOG[1];}const gy=this.walkGround()+EYE;if(this.camY===null)this.camY=gy;this.walkCam.up.set(0,1,0);this.camera=this.walkCam;if(this.avatar?.actor)this.avatar.camera();else{const e=eyeOf(this.walk.x,this.camY,this.walk.z,this.walk);this.walkCam.position.set(e.position.x,e.position.y,e.position.z);this.walkCam.lookAt(e.target.x,e.target.y,e.target.z);}}
  else{const o=this.orbit;o.elev=clamp(o.elev,.5,1.3);o.dist=clamp(o.dist,8,this.maxDist??36);if(fog){fog.near=Math.max(22,o.dist+14);fog.far=Math.max(80,o.dist+110);}o.tx=clamp(o.tx,-8,8);o.tz=clamp(o.tz,-10,10);const ty=height(o.tx,o.tz,this.terrain);const px=o.tx+Math.cos(o.elev)*Math.sin(o.yaw)*o.dist,py=ty+Math.sin(o.elev)*o.dist,pz=o.tz+Math.cos(o.elev)*Math.cos(o.yaw)*o.dist;this.viewCam.position.set(px,Math.max(py,height(px,pz,this.terrain)+2.5),pz);this.viewCam.up.set(0,1,0);this.viewCam.lookAt(o.tx,ty,o.tz);this.camera=this.viewCam;}}
 // First overview: fit the whole clearing into the part of the canvas not covered by UI (insets in px). Later orbits are kept.
 fitSite(insets={top:70,bottom:230,left:0,right:0}){const o=this.orbit;o.tx=0;o.tz=0;const w=this.renderer.domElement.clientWidth,h=this.renderer.domElement.clientHeight;if(!w||!h)return;
  // Portrait phones need more distance than the desktop cap; the fitted distance also becomes this screen's zoom-out limit.
  this.maxDist=140;let pts=this.fitPoints;if(!pts||this.fitTerrain!==this.terrain){pts=[];for(let i=0;i<36;i++){const a=i/36*6.28;let lo=0,hi=20;for(let k=0;k<18;k++){const m=(lo+hi)/2;if(siteFactor(Math.cos(a)*m,Math.sin(a)*m)<1)lo=m;else hi=m;}const x=Math.cos(a)*lo,z=Math.sin(a)*lo;pts.push(new T.Vector3(x,height(x,z,this.terrain)+.4,z));}this.fitPoints=pts;this.fitTerrain=this.terrain;}
  const uxMin=insets.left/w*2-1,uxMax=1-insets.right/w*2,uyMin=insets.bottom/h*2-1,uyMax=1-insets.top/h*2;const v=new T.Vector3();
  for(let iter=0;iter<4;iter++){o.dist=10;for(let k=0;k<40;k++){this.updateCamera();let ok=true;for(const p of pts){v.copy(p).project(this.viewCam);if(v.x<uxMin||v.x>uxMax||v.y<uyMin||v.y>uyMax){ok=false;break;}}if(ok)break;o.dist*=1.06;}
   // Re-centre the projected site inside the usable region, then refit.
   let minx=1,maxx=-1,miny=1,maxy=-1;this.updateCamera();for(const p of pts){v.copy(p).project(this.viewCam);minx=Math.min(minx,v.x);maxx=Math.max(maxx,v.x);miny=Math.min(miny,v.y);maxy=Math.max(maxy,v.y);}
   const dx=((uxMin+uxMax)/2-(minx+maxx)/2),dy=((uyMin+uyMax)/2-(miny+maxy)/2);if(Math.abs(dx)<.01&&Math.abs(dy)<.01)break;
   const span=o.dist*Math.tan(this.viewCam.fov*Math.PI/360);const c=Math.cos(o.yaw),s=Math.sin(o.yaw);const px=-dx*span*this.viewCam.aspect,pz=-dy*span/Math.max(.35,Math.sin(o.elev));o.tx+=px*c-pz*s;o.tz+=-px*s-pz*c;}
  o.dist=o.dist*1.04;this.maxDist=Math.max(36,o.dist*1.1);this.updateCamera();this.dirty=true;}
 orbitBy(dyaw,delev,dzoom,dpanx=0,dpanz=0){const o=this.orbit;o.yaw+=dyaw;o.elev+=delev;o.dist*=dzoom;if(dpanx||dpanz){const c=Math.cos(o.yaw),s=Math.sin(o.yaw);o.tx+=dpanx*c-dpanz*s;o.tz+=-dpanx*s-dpanz*c;}this.updateCamera();this.dirty=true;}
 // ---- per-frame ----
 tick(dt,t){uTime.value=this.reduced?0:t/1000;let moved=0;
  if(this.entrance){this.avatar?.tick(dt,0);this.entrance.tick(dt);this.render();return;}
  if(this.mode==='walk'&&(this.move.x||this.move.z)){const n=walkStep(this.walk,this.move,this.walk.yaw,dt,this.items);moved=n.moved;this.walk.x=n.x;this.walk.z=n.z;this.h.onWalk?.(this.walk,moved);}
  this.avatar?.tick(dt,moved);
  if(this.mode==='walk'){const gy=this.walkGround()+EYE;if(this.camY===null)this.camY=gy;const k=1-Math.exp(-dt*18);this.camY+=(gy-this.camY)*k;if(Math.abs(gy-this.camY)>.0005||moved)this.dirty=true;this.updateCamera();}
  if(ENVIRONMENTS[this.environment]?.night){this.assignLamps(false);if(!this.reduced)this.dirty=true;}
  if(this.dirty||(!this.reduced)){this.render();this.dirty=false;}}
 render(){const w=waterMat();w.normalMap.offset.set(uTime.value*.02,uTime.value*.013);this.renderWith(this.camera);}
 // ---- input ----
 canvasEvents(canvas){
  canvas.addEventListener('pointerdown',e=>{if(e.button>0)return;canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),ghost:false});if(this.pointers.size===1&&this.mode==='view'){const p=this.pick(e.clientX,e.clientY);if(p&&this.h.ghostAt?.(p.x,p.z))this.pointers.get(e.pointerId).ghost=true;}if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];this.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};}});
  canvas.addEventListener('pointermove',e=>{const p=this.pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
   if(this.pointers.size===2&&this.pinch){const [a,b]=[...this.pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;if(this.mode==='view'){this.orbitBy(0,0,this.pinch.d/Math.max(1,d),-(mx-this.pinch.mx)*.02*this.orbit.dist/20,-(my-this.pinch.my)*.02*this.orbit.dist/20);}this.pinch={d,mx,my};return;}
   if(this.mode==='walk'){Object.assign(this.walk,walkLook(this.walk,dx,dy));this.dirty=true;this.h.onLook?.();}
   else if(p.ghost){const hit=this.pick(e.clientX,e.clientY);if(hit)this.h.ghostMove?.(hit.x,hit.z);}
   else{const r=canvas.getBoundingClientRect();this.orbitBy(-dx/r.width*2.6,dy/r.height*1.6,1);}});
  const up=e=>{const p=this.pointers.get(e.pointerId);if(!p)return;this.pointers.delete(e.pointerId);if(this.pointers.size<2)this.pinch=null;const dist=Math.hypot(e.clientX-p.sx,e.clientY-p.sy);if(e.type==='pointerup'&&dist<10&&performance.now()-p.t<600&&this.mode==='view'){const hit=this.pick(e.clientX,e.clientY,true);if(hit)this.h.onTap?.(hit.x,hit.z,hit.id);}else if(p.ghost&&e.type==='pointerup')this.h.ghostDrop?.();};
  canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',e=>{if(this.pointers.has(e.pointerId))up({...e,type:'pointercancel',clientX:this.pointers.get(e.pointerId).x,clientY:this.pointers.get(e.pointerId).y});});
  canvas.addEventListener('wheel',e=>{if(this.mode!=='view')return;e.preventDefault();this.orbitBy(0,0,e.deltaY>0?1.1:.91);},{passive:false});
 }
 // Picks the terrain surface by ray marching the exact height field, and the nearest instanced item.
 pick(clientX,clientY,withItems=false){const rect=this.renderer.domElement.getBoundingClientRect();const point=this.pickPoint??=new T.Vector2();point.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(point,this.camera);const o=this.ray.ray.origin,d=this.ray.ray.direction;const hit=intersectRay(o.x,o.y,o.z,d.x,d.y,d.z,this.terrain,200);if(!hit)return null;let id;if(withItems){const roots=this.pickRoots??=[],hits=this.pickHits??=[];if(this.pickSurfaces!==this.surfaces){roots.length=0;for(const root of [this.objects,this.covers])root.traverse(o=>{if(o.isMesh||o.isLine||o.isPoints||o.isSprite)roots.push(o);});this.pickSurfaces=this.surfaces;}hits.length=0;this.ray.intersectObjects(roots,false,hits);const h=hits.find(x=>x.distance<=hit.t+.05||x.object.userData.ids||x.object.userData.kind);if(h){if(h.object.userData.ids)id=h.object.userData.ids[h.instanceId];else if(h.object.parent?.userData.items){const items=h.object.parent.userData.items;let best=null,bd=1e9;for(const it of items){const dd=(it.x-h.point.x)**2+(it.z-h.point.z)**2;if(dd<bd){bd=dd;best=it;}}id=best?.id;}}}return {x:hit.x,z:hit.z,id};}
 // ---- photos ----
 // Photos always show full canopies and no editing helpers; whatever happens, the editing state comes back.
 capture(items,pose=null,width=1600,height_=1000,includeCharacter=false){const saved={items:this.items,mode:this.mode,walk:{...this.walk},orbit:{...this.orbit},camY:this.camY,size:this.renderer.getSize(new T.Vector2()),pixelRatio:this.renderer.getPixelRatio(),aspect:this.aspect,sel:this.selection.visible,marker:this.marker.visible,ghost:this.ghost.visible,faded:!!this.canopyFaded,fov:this.walkCam.fov};
  const savedTime=uTime.value,fog=this.scene.fog,savedFog=[fog.near,fog.far];
  try{if(saved.faded)this.setCanopyFade(false);uTime.value=0; // photos are deterministic: no breeze offset
   if(pose){fog.near=WALK_FOG[0];fog.far=WALK_FOG[1];} // an absolute-pose photo always uses the walking haze, whichever screen asked for it
   const actor=this.avatar?.actor?.root;if(actor)actor.visible=includeCharacter;if(this.avatar)this.avatar.contact.visible=includeCharacter;
   if(classroom)this.renderer.setPixelRatio(1);this.renderer.setSize(width,height_,false);this.aspect=width/height_;if(items!==this.items)this.setItems(items);this.covers.traverse(o=>{if(o.material?.pondReflection)o.material.pondReflection.last=-Infinity;});this.selection.visible=false;this.marker.visible=false;this.ghost.visible=false;
   if(pose){this.walkCam.fov=pose.fov;this.walkCam.aspect=pose.aspect??this.aspect;this.walkCam.updateProjectionMatrix();const e=eyeOf(pose.x,pose.y,pose.z,pose);this.walkCam.position.set(e.position.x,e.position.y,e.position.z);this.walkCam.up.set(0,1,0);this.walkCam.lookAt(e.target.x,e.target.y,e.target.z);this.renderWith(this.walkCam);} // photo camera drives sun-view/ray uniforms too (round 3 regression fix)
   else{this.viewCam.aspect=this.aspect;this.viewCam.updateProjectionMatrix();this.mode='view';this.orbit={yaw:.35,elev:.95,dist:27,tx:0,tz:0};this.updateCamera();this.renderWith(this.viewCam);}
   return this.renderer.domElement.toDataURL('image/png');}
  finally{uTime.value=savedTime;fog.near=savedFog[0];fog.far=savedFog[1];this.walkCam.fov=saved.fov;this.renderer.setPixelRatio(saved.pixelRatio);this.renderer.setSize(saved.size.x,saved.size.y,false);this.aspect=saved.aspect;this.walkCam.aspect=this.aspect;this.walkCam.updateProjectionMatrix();this.viewCam.aspect=this.aspect;this.viewCam.updateProjectionMatrix();if(this.items!==saved.items)this.setItems(saved.items);this.mode=saved.mode;this.walk=saved.walk;this.orbit=saved.orbit;this.camY=saved.camY;this.selection.visible=saved.sel;this.marker.visible=saved.marker;this.ghost.visible=saved.ghost;if(saved.faded)this.setCanopyFade(true);this.avatar?.tick(0,0);this.updateCamera();this.covers.traverse(o=>{if(o.material?.pondReflection)o.material.pondReflection.last=-Infinity;});this.render();}}
 walkPose(){if(this.avatar?.actor&&this.mode==='walk'){const p=this.walkCam.position,d=this.walkCam.getWorldDirection(new T.Vector3());return {x:p.x,y:p.y,z:p.z,yaw:Math.atan2(-d.x,-d.z),pitch:Math.asin(-d.y),fov:this.walkCam.fov,aspect:1.6};}return {x:this.walk.x,y:walkHeight(this.walk.x,this.walk.z,this.terrain,this.surfaces)+EYE,z:this.walk.z,yaw:this.walk.yaw,pitch:this.walk.pitch,fov:62,aspect:1.6};}
 thumbnail(kind){const s=new T.Scene();const bg=document.createElement('canvas');bg.width=bg.height=256;const ctx=bg.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#f8f7ee');gradient.addColorStop(1,'#dce6d1');ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);const backdrop=new T.CanvasTexture(bg);backdrop.colorSpace=T.SRGBColorSpace;s.background=backdrop;s.add(new T.HemisphereLight('#fff9ea','#a4ae98',2.8));const light=new T.DirectionalLight('#ffffff',2.6);light.position.set(-3,6,5);s.add(light);const fill=new T.DirectionalLight('#dce9f0',1.2);fill.position.set(4,3,-2);s.add(fill);let p;if(isCoverKind(kind)){p=bake(coverGroup(kind,{id:'thumb',kind,x:0,z:0,scale:1,rotation:0},()=>0,.05));}else p=prototype(kind).clone();p.traverse(o=>{if(o.isMesh)prepare(o.material);});s.add(p);const bounds=new T.Box3().setFromObject(p),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());const extent=Math.max(size.x,size.y,size.z)*.62;const c=new T.OrthographicCamera(-extent,extent,extent,-extent,.1,60);c.position.copy(center).add(new T.Vector3(4,3,5));c.lookAt(center);c.updateMatrixWorld();let fit=0;const corner=new T.Vector3();for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){corner.set(x,y,z).applyMatrix4(c.matrixWorldInverse);fit=Math.max(fit,Math.abs(corner.x),Math.abs(corner.y));}fit*=1.12;c.left=c.bottom=-fit;c.right=c.top=fit;c.updateProjectionMatrix();const shadow=new T.Mesh(new T.PlaneGeometry(Math.max(.2,size.x)*1.35,Math.max(.2,size.z)*1.35),new T.MeshBasicMaterial({map:shadowTex(),transparent:true,opacity:.38,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(center.x,bounds.min.y-.004,center.z);s.add(shadow);const old=this.renderer.getSize(new T.Vector2()),pixelRatio=this.renderer.getPixelRatio();if(classroom)this.renderer.setPixelRatio(1);this.renderer.setSize(256,256,false);this.renderer.render(s,c);const url=this.renderer.domElement.toDataURL('image/webp');this.renderer.setPixelRatio(pixelRatio);this.renderer.setSize(old.x,old.y,false);shadow.geometry.dispose();shadow.material.dispose();backdrop.dispose();if(isCoverKind(kind))p.traverse(o=>{if(o.isMesh)o.geometry.dispose();});this.dirty=true;return url;}
 stats(){const i=this.renderer.info;return {geometries:i.memory.geometries,textures:i.memory.textures,calls:i.render.calls,triangles:i.render.triangles};}
}
