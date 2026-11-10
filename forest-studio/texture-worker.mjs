import * as textures from './textures.mjs';
const maps=[['bark','barkTex'],['wood','woodTex'],['cedar','cedarTex'],['stone','stoneTex'],['moss','mossTex'],['ripple','rippleNormal']];
function send(key,texture,linear){const image=texture.image,pixels=image.getContext('2d').getImageData(0,0,image.width,image.height).data;postMessage({key,width:image.width,height:image.height,linear,pixels:pixels.buffer},[pixels.buffer]);}
for(const [key,name] of maps){const texture=textures[name]();send(key,texture,key==='ripple');if(key!=='ripple')for(const rough of [false,true])send(key+(rough?'|rough':'|height'),textures.surfaceData(texture,rough),true);}
postMessage({done:true});
