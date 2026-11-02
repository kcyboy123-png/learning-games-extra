import * as T from '../lib/three.module.min.js';

// Small, deterministic, shared material maps: no network assets or per-building textures.
export const surfaceTime={value:0},surfaceWinter={value:0};
const maps=new Map();
let architectureArt;
function paintArchitecture(kind,ctx,map){
 const quadrant={plaster:[0,0],wood:[1,0],roof:[0,1],stone:[1,1]}[kind];
 if(!quadrant||typeof Image==='undefined')return;
 architectureArt??=new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);
  image.src=new URL('./assets/architecture-study-20261102.png',import.meta.url).href;
 });
 architectureArt.then(image=>{
  if(!image)return;
  const w=image.naturalWidth/2,h=image.naturalHeight/2;
  // Preserve the existing palette and seasonal shaders beneath the shared painted grain.
  ctx.globalAlpha=kind==='plaster'?.28:.48;
  ctx.drawImage(image,quadrant[0]*w,quadrant[1]*h,w,h,0,0,256,256);
  ctx.globalAlpha=1;map.needsUpdate=true;
 });
}
const palettes={
 wood:['#8e6b4a','#a9805a','#8e6a4a','#8b6a4a','#956e51','#bd9869','#b28b60','#7a5b41','#6f5139','#c9a97a','#d6bb8d'],
 plaster:['#f7f7f2','#f4f1e8','#ecebe4','#fff2c9','#f1e7d2','#eadfc9','#f1e3c3','#f6e4c0','#e6d4b0','#efdcb6','#e8dcc4','#f5e9d2','#e9e4d4','#d9d2c0'],
 stone:['#eadbb9','#eedfc0','#e5d6b5','#edddba','#e8d7b3','#ead7ac','#eedfb9','#e5cf9f','#b8ac90','#bfb294','#a9a99c','#9e8f78','#a39276','#c8b693','#9d9480','#a09374','#cdc6a6'],
 leaf:['#7fa857','#97ba67','#6a9850','#e9a4b4','#f4c0ca','#d9929f'],
 roof:['#719784','#618b79','#5c8170','#4d7362','#52745e','#385443','#4a6a70','#3a5459','#5f7b6b','#4b6457','#3d4247','#2c3034','#7a3b32','#5a2a24','#7d8b8e','#a77760','#825743','#7b926a','#5c7653','#7d6b52','#7d7d74','#6fa08a','#4a7fa6']
};
function texture(kind){
 if(maps.has(kind))return maps.get(kind);
 const c=document.createElement('canvas');c.width=c.height=kind==='grass'?1024:256;const ctx=c.getContext('2d');let seed=1729;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle='#f4f3ef';ctx.fillRect(0,0,c.width,c.height);
 for(let i=0;i<2400;i++){const v=175+Math.floor(rand()*75);ctx.fillStyle=`rgba(${v},${v},${v},${kind==='grass'||kind==='leaf'?.08:kind==='plaster'?.18:.27})`;ctx.fillRect(rand()*256,rand()*256,1+rand()*3,1+rand()*3);}
 if(kind==='grass'||kind==='leaf'){
  for(let i=0;i<160;i++){const x=rand()*256,y=rand()*256,r=3+rand()*21;const gr=ctx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'#7d9e6020');gr.addColorStop(1,'#ffffff00');ctx.fillStyle=gr;ctx.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<400;i++){const x=rand()*256,y=rand()*256;ctx.strokeStyle=i%3?'#a0ab7825':'#ffffff40';ctx.lineWidth=.6+rand();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*3-1.5,y-2-rand()*4);ctx.stroke();}
 }
 if(kind==='wood')for(let i=0;i<90;i++){ctx.strokeStyle=i%4?'#775d3933':'#fff4d077';ctx.lineWidth=.4+rand();ctx.beginPath();let x=rand()*256;ctx.moveTo(x,0);for(let y=0;y<=256;y+=8)ctx.lineTo(x+Math.sin(y*.04+i)*2,y);ctx.stroke();}
 if(kind==='plaster')for(let y=0;y<256;y++){const eave=.14*Math.exp(-y/30),base=.08*Math.exp(-(255-y)/20);ctx.fillStyle=`rgba(100,76,44,${eave+base})`;ctx.fillRect(0,y,256,1);}
 if(kind==='roof')for(let y=0;y<256;y+=32){ctx.fillStyle='#3b4c5735';ctx.fillRect(0,y,256,2);ctx.fillStyle='#ffffff40';ctx.fillRect(0,y+2,256,1);}
 if(kind==='stone')for(let i=0;i<240;i++){ctx.strokeStyle='#807b6d33';const x=rand()*256,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+rand()*6,y+rand()*2);ctx.stroke();}
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;map.userData.shared=true;
 if(kind==='grass'){
  map.repeat.set(.12,.12);
  // Detailed neutral meadow albedo is softly blended so paths and buildings remain legible.
  const art=new Image();art.onload=()=>{ctx.fillStyle='#fffef5';ctx.fillRect(0,0,1024,1024);ctx.globalAlpha=.28;ctx.drawImage(art,0,0,1024,1024);ctx.globalAlpha=1;map.needsUpdate=true;};
  art.src=new URL('./assets/meadow-soft.png',import.meta.url).href;
 }
 paintArchitecture(kind,ctx,map);maps.set(kind,map);return map;
}
export function surfaceOptions(color){
 if(color==='#7cc5be')return{onBeforeCompile(shader){shader.uniforms.streamTime=surfaceTime;shader.uniforms.streamWinter=surfaceWinter;shader.vertexShader='varying vec2 vStreamUv;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStreamUv=uv;');shader.fragmentShader='varying vec2 vStreamUv;uniform float streamTime,streamWinter;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat flow=streamTime*(1.-streamWinter);float wave=sin(vStreamUv.y*170.-flow*1.4+sin(vStreamUv.x*22.+flow*.4)*2.);float edge=pow(abs(vStreamUv.x-.5)*2.,3.);diffuseColor.rgb*=.82+edge*.18;diffuseColor.rgb+=vec3(.09,.16,.15)*smoothstep(.86,1.,wave)*(1.-streamWinter);');},customProgramCacheKey:()=> 'village-stream-v1'};

 const kind=color==='#9cbd6e'?'grass':Object.keys(palettes).find(k=>palettes[k].includes(color));
 if(!kind){if(['#ddc990','#9cab83','#8fd1c7','#c1d9cb'].includes(color))return{roughness:.32,onBeforeCompile(shader){shader.vertexShader='varying vec3 vWindowPoint;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWindowPoint=position;');shader.fragmentShader='varying vec3 vWindowPoint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat reflection=pow(max(0.,sin((vWindowPoint.x+vWindowPoint.y*.55)*13.)),12.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.89,.96,.95),reflection*.16);');},customProgramCacheKey:()=> 'village-window-v1'};return{};}const map=texture(kind);
 const options={map,bumpMap:map,bumpScale:kind==='roof'?.025:kind==='stone'?.018:kind==='wood'?.012:kind==='plaster'?.004:0,roughness:kind==='roof'?.8:.92};
 if(kind==='roof'||color==='#d9d2c0')Object.assign(options,{
  onBeforeCompile(shader){
   shader.uniforms.roofWinter=surfaceWinter;
   shader.vertexShader='varying float vRoofUp;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\nvRoofUp=dot(normalize(transformedNormal),normalize(mat3(viewMatrix)*vec3(0.,1.,0.)));');
   shader.fragmentShader='varying float vRoofUp;uniform float roofWinter;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat snow=roofWinter*smoothstep(.28,.82,vRoofUp);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.84,.91,.92),snow*.96);');
  },customProgramCacheKey:()=> 'village-roof-snow-v1'
 });
 return options;
}
