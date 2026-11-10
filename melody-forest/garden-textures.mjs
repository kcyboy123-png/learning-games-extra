// textures.mjs — small procedural canvas textures shared by every material: bark, wood grain, stone, leaf/petal/tuft
// cards, hydrangea florets, water ripples, glows. Generated once at load (no downloads, no generated-image assets).
import * as T from './lib/three.module.min.js';
const cache=new Map();

function rng(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function canvas(w,h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;return cv;}
function finish(cv,o={}){const t=new T.CanvasTexture(cv);t.colorSpace=o.linear?T.NoColorSpace:T.SRGBColorSpace;if(o.repeat){t.wrapS=t.wrapT=T.RepeatWrapping;}t.anisotropy=4;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;return t;}
// Draws a shape at the 5 wrap offsets so repeating textures have no visible seam.
function tiled(x,w,h,fn){for(const [ox,oy] of [[0,0],[w,0],[-w,0],[0,h],[0,-h]]){x.save();x.translate(ox,oy);fn();x.restore();}}
function get(key,make){if(!cache.has(key))cache.set(key,make());return cache.get(key);}

// Bark: pale neutral base (the material colour tints it), vertical ridges, dark fissures, small knots.
export const barkTex=()=>get('bark',()=>{const w=512,h=1024,cv=canvas(w,h),x=cv.getContext('2d'),r=rng(11);x.fillStyle='#c4b69c';x.fillRect(0,0,w,h);
 for(let i=0;i<70;i++){const px=r()*w,py=r()*h,len=80+r()*320,width=5+r()*15,phase=r()*6.28;
  tiled(x,w,h,()=>{const path=()=>{x.beginPath();for(let k=0;k<=16;k++){const y=py+k/16*len,xx=px+Math.sin(k*.28+phase)*width*.4;x.lineTo(xx,y);}};
   x.lineCap='round';path();x.strokeStyle='rgba(65,49,33,.46)';x.lineWidth=width;x.stroke();x.translate(-width*.32,0);path();x.strokeStyle='rgba(245,223,184,.48)';x.lineWidth=width*.35;x.stroke();});
 }
 for(let i=0;i<300;i++){const px=r()*w,py=r()*h,len=12+r()*100,a=r()*.15-.075,alpha=.08+r()*.15;
  tiled(x,w,h,()=>{x.strokeStyle=`rgba(67,52,35,${alpha})`;x.lineWidth=.6+r()*1.2;x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px-2,py+len*.3,px+4,py+len*.7,px+a*len,py+len);x.stroke();});}
 for(let i=0;i<32;i++){const px=r()*w,py=r()*h,len=90+r()*300,phase=r()*6.28;
  tiled(x,w,h,()=>{x.beginPath();x.moveTo(px,py);for(let j=1;j<=8;j++)x.lineTo(px+Math.sin(j*.8+phase)*4,py+len*j/8);x.strokeStyle='rgba(55,42,29,.48)';x.lineWidth=2.2+r()*3.2;x.stroke();x.translate(-2,0);x.strokeStyle='rgba(244,221,180,.42)';x.lineWidth=.9;x.stroke();});}
 for(let i=0;i<7;i++){const px=r()*w,py=r()*h;tiled(x,w,h,()=>{for(let k=5;k>0;k--){x.beginPath();x.ellipse(px,py,3+k*2.5,8+k*7,.08,0,Math.PI*2);x.strokeStyle='rgba(64,48,33,.32)';x.lineWidth=1.2;x.stroke();}});}
 for(let i=0;i<42;i++){const px=r()*w,py=r()*h,ww=5+r()*13,hh=25+r()*90;tiled(x,w,h,()=>{const g=x.createLinearGradient(px-ww,0,px+ww,0);g.addColorStop(0,'rgba(43,36,28,.14)');g.addColorStop(.45,'rgba(244,223,190,.15)');g.addColorStop(1,'rgba(43,36,28,0)');x.fillStyle=g;x.beginPath();x.moveTo(px-ww*.5,py);x.bezierCurveTo(px-ww,py+hh*.4,px-ww*.8,py+hh*.8,px,py+hh);x.bezierCurveTo(px+ww,py+hh*.7,px+ww,py+hh*.2,px-ww*.5,py);x.fill();});}
 for(let i=0;i<9000;i++){x.fillStyle=r()<.5?'rgba(65,53,37,.06)':'rgba(245,228,195,.09)';x.fillRect(r()*w,r()*h,.7+r()*1.5,1+r()*4);}
 return finish(cv,{repeat:true});});
// Opaque leaf detail follows the actual rounded mesh outline: soft veins, never a cutout card.
export const foliageDetailTex=()=>get('foliage-detail',()=>{const cv=canvas(128,256),x=cv.getContext('2d'),r=rng(619),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#d8e4bd');g.addColorStop(.55,'#f2f3df');g.addColorStop(1,'#e0e7c6');x.fillStyle=g;x.fillRect(0,0,128,256);x.strokeStyle='rgba(91,113,63,.20)';x.lineWidth=1.2;x.beginPath();x.moveTo(64,8);x.quadraticCurveTo(61,120,64,250);x.stroke();for(let k=0;k<7;k++){const y=25+k*29;for(const side of [-1,1]){x.lineWidth=.65;x.beginPath();x.moveTo(64,y);x.quadraticCurveTo(64+side*20,y+8,64+side*(46+k%3),y+26+k%2*3);x.stroke();}}for(let k=0;k<1800;k++){x.fillStyle='rgba(110,125,80,.035)';x.fillRect(r()*128,r()*256,1,1);}return finish(cv);});

export function surfaceData(source,rough=false){return get(source.uuid+(rough?'|rough':'|height'),()=>{const cv=canvas(source.image.width,source.image.height),x=cv.getContext('2d');x.drawImage(source.image,0,0);const im=x.getImageData(0,0,cv.width,cv.height);for(let i=0;i<im.data.length;i+=4){const l=im.data[i]*.2126+im.data[i+1]*.7152+im.data[i+2]*.0722;const v=rough?Math.min(250,165+(255-l)*.32):l;im.data[i]=im.data[i+1]=im.data[i+2]=v;}x.putImageData(im,0,0);return finish(cv,{repeat:true,linear:true});});}

