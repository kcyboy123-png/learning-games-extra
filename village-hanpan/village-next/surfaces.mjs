import * as T from '../lib/three.module.min.js';

// Small, deterministic, shared material maps: no network assets or per-building textures.
const maps=new Map();
const palettes={
 wood:['#8e6b4a','#a9805a','#8e6a4a','#8b6a4a','#956e51','#bd9869','#b28b60','#7a5b41','#6f5139','#c9a97a','#d6bb8d'],
 plaster:['#f7f7f2','#f4f1e8','#ecebe4','#fff2c9','#f1e7d2','#eadfc9','#f1e3c3','#f6e4c0','#e6d4b0','#efdcb6','#e8dcc4','#f5e9d2','#e9e4d4','#d9d2c0'],
 stone:['#b8ac90','#bfb294','#a9a99c','#9e8f78','#a39276','#c8b693','#9d9480','#a09374','#cdc6a6'],
 leaf:['#7fa857','#97ba67','#6a9850','#e9a4b4','#f4c0ca','#d9929f'],
 roof:['#5c8170','#4d7362','#52745e','#385443','#4a6a70','#3a5459','#5f7b6b','#4b6457','#3d4247','#2c3034']
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
  const art=new Image();art.onload=()=>{ctx.fillStyle='#fffef5';ctx.fillRect(0,0,1024,1024);ctx.globalAlpha=.74;ctx.drawImage(art,0,0,1024,1024);ctx.globalAlpha=1;map.needsUpdate=true;};
  art.src=new URL('./assets/meadow-soft.png',import.meta.url).href;
 }
 maps.set(kind,map);return map;
}
export function surfaceOptions(color){
 const kind=color==='#9cbd6e'?'grass':Object.keys(palettes).find(k=>palettes[k].includes(color));
 if(!kind)return{};const map=texture(kind);
 return kind==='roof'?{map,bumpMap:map,bumpScale:.025,roughness:.8}:{map,roughness:.92};
}
