import {TOUCH_SCALE} from './touch-scale.mjs';
import {drawContactFeedback,drawPlayFeedback,CONTACT_RESPONSE} from './contact-feedback.mjs';
import {touchPose} from './touch-poses.mjs';
import {settleStrokePart} from './stroke.mjs';
import {SCENT_SPOTS} from './hunt.mjs';
import {rollPosition} from './fetch.mjs';
import {makeToyArt} from './toy-art.mjs';
import {afterglowWeight,contactPhase,responsePose} from './companion.mjs';
import {reactionTargets,easeReaction} from './reaction.mjs';
import {PET_BOUNDS} from './pet-bounds.mjs';
import {petById,petArt,BANK_POSES,speciesHeight,mouthAnchor} from './pets.mjs';
import {ASSET_BOUNDS} from './asset-bounds.mjs';
const lerp=(a,b,t)=>a+(b-a)*t;
export function settledHeight(previous,target,dt,enabled=true,ms=85){return enabled&&Number.isFinite(previous)?lerp(previous,target,1-Math.exp(-Math.max(0,dt)/ms)):target;}
export function dropStep(p,floor,seconds,gravity){p.vy=(p.vy||0)+gravity*seconds;p.y+=p.vy*seconds;if(p.y>=floor){p.y=floor;p.vy=-p.vy*.18;if(Math.abs(p.vy)<28){p.vy=0;p.dropping=false;}}}
export function bridgePose(to,from,age,sinceWalk,available=true){
 if(!available)return to;
 if(from===38&&to!==38&&age<360)return age<160?38:21;
 if((from===35||from===39)&&to===23&&age<280)return from;
 if(from>=8&&from<=11&&to>=8&&to<=11&&age<140)return from;
 if(from>=8&&from<=10&&to===5&&age<180)return 11;
 if(to===23&&from!==23&&from!==3&&age<560)return sinceWalk<180?20:age<280?21:23;
 if(to===3&&from===23)return age<420?23:3;
 if(to===3&&from!==3&&age<1040)return sinceWalk<180?20:age<300?21:23;
 if((from===3||from===23||from===35||from===39)&&to!==3&&to!==23&&age<600)return age<280?(from===35||from===39?from:23):21;
 if(to===4&&from!==4&&age<300)return age<120?21:22;
 if(from===4&&to!==4&&age<340)return age<180?22:21;
 if((from===7||from===22)&&[0,1,5,8,9,10,11].includes(to)&&age<280)return age<100?(from===22?22:20):21;
 if((to===2||to===26)&&from!==to&&age<320)return age<150?21:20;
 if((from===2||from===26)&&[0,1,5,8,9,10,11,24,25,27].includes(to)&&age<320)return age<140?20:21;
 if([0,1,5,8,9,10,11,24,25,27].includes(to)&&sinceWalk<460)return sinceWalk<180?20:21;
 return to;
}
function idleTurn(){return new Promise(resolve=>{
 if(globalThis.requestIdleCallback)globalThis.requestIdleCallback(resolve,{timeout:1000});
 else setTimeout(resolve,16);
});}
const BRIDGE_HEIGHT=[.88,.92,.88,.68];
export function risePose(age,from=0){return (from===3||from===23||from===35||from===39)?(age<230?(from===35||from===39?from:23):age<480?21:20):from===38?(age<160?38:age<300?21:20):from>=8&&from<=11?(age<100?11:age<220?21:20):age<90?21:20;}
export function walkFrame(stride){return Math.floor(stride/.034)%8;}
export class Room{
 constructor(canvas,variant='puppy'){this.variant=petById(variant).id;this.species=petById(variant).species;this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.pose=0;this.extraArtReady=false;this.lastDraw=0;this.stride=0;this.focus=1;this.x=.55;this.target=.55;this.size=1;this.night=new Date().getHours()>=19||new Date().getHours()<7;this.backgroundReady={};this.backgroundLoads={};this.rain=false;this.toy=null;this.toyX=.73;this.toyPosition=null;this.prop=null;this.hide=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.point=null;this.time=0;this.active=true;this.rects=[];this.nightRoom=new Image();this.props=new Image();this.props.fetchPriority='high';this.props.src='assets/props-trim.webp';this.room=new Image();this.pet=new Image();this.pet.fetchPriority='high';this.pet.src=this.variant==='puppy'?'assets/puppy-trim.webp':petArt(this.variant,'base');const speciesReady=this.loadActionArt(),detailReady=this.loadDetailArt();this.ready=Promise.all([this.loadBackground(this.night).catch(()=>this.loadBackground(!this.night)),this.pet.decode(),this.props.decode()]).then(async()=>{this.measure();await speciesReady;if(this.actionArtError&&this.variant!=='puppy')throw Error('Pet poses unavailable');this.actionArt=this.pendingArt;this.pendingArt=null;await detailReady;this.shadowMap=this.makeShadow();this.petDay=this.lightAtlas(this.pet,4,2);this.petNight=this.lightAtlas(this.pet,4,2,true);this.propRects=this.bounds(this.props,3,2);this.resize();this.renderReady=true;this.draw(0);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));setTimeout(()=>this.loadExtraArt(),2000);});this.resize=()=>{const d=Math.min(devicePixelRatio||1,1.5);this.w=innerWidth;this.h=innerHeight;canvas.width=Math.round(this.w*d);canvas.height=Math.round(this.h*d);this.ctx.setTransform(d,0,0,d,0,0);this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';};addEventListener('resize',this.resize);this.lastFrame=0;const loop=t=>{requestAnimationFrame(loop);if(!this.active||!this.renderReady||t-this.lastFrame<32&&!this.inputPending)return;this.inputPending=false;this.lastFrame=t;this.draw(t);};requestAnimationFrame(loop);}
 async loadExtraArt(){
  try{
   await idleTurn();
   const {EXTRA_ART_BOUNDS}=await import('./extra-art-bounds.mjs');
   const meta=EXTRA_ART_BOUNDS[this.variant];
   if(!meta)throw Error('Missing reaction bounds');
   const image=new Image();
   image.decoding='async';image.fetchPriority='low';image.src=petArt(this.variant,'extra-reactions');
   await image.decode();
   if(image.width!==meta.width||image.height!==meta.height||meta.rects.length!==4)throw Error('Reaction sheet mismatch');
   const lighting=async night=>{
    await idleTurn();
    const canvas=this.lightAtlas(image,2,2,night,meta.rects);
    return globalThis.createImageBitmap?createImageBitmap(canvas):canvas;
   };
   const day=await lighting(false),night=await lighting(true);
   this.actionArt??={};
   meta.rects.forEach((rect,index)=>{const pose=24+index;this.actionArt[pose]={pose,rect,day,night};});
   this.extraArtReady=true;
  }catch{this.extraArtError=true;}
  this.loadTouchArt();
 }
 async loadTouchArt(){
  try{
   const {TOUCH_ART_BOUNDS}=await import('./touch-art-bounds.mjs'),meta=TOUCH_ART_BOUNDS[this.variant],ready={};
   if(!meta||meta.length!==2)throw Error('Missing touch poses');
   for(let bank=0;bank<2;bank++){
    await new Promise(resolve=>setTimeout(resolve,600));await idleTurn();
    const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=petArt(this.variant,'touch-'+bank);await image.decode();
    const m=meta[bank];if(image.width!==m.width||image.height!==m.height||m.rects.length!==4)throw Error('Touch sheet mismatch');
    await idleTurn();const dayCanvas=this.lightAtlas(image,2,2,false,m.rects),day=globalThis.createImageBitmap?await createImageBitmap(dayCanvas):dayCanvas;
    await idleTurn();const nightCanvas=this.lightAtlas(image,2,2,true,m.rects),night=globalThis.createImageBitmap?await createImageBitmap(nightCanvas):nightCanvas;
    m.rects.forEach((rect,i)=>{const pose=28+bank*4+i;ready[pose]={pose,rect,day,night};});
   }
   Object.assign(this.actionArt??={},ready);this.touchArtReady=true;
  }catch{this.touchArtError=true;}
  this.loadMomentArt();
 }
 async loadMomentArt(){
  try{
   await new Promise(resolve=>setTimeout(resolve,600));await idleTurn();
   const {MOMENT_ART_BOUNDS}=await import('./moment-art-bounds.mjs'),m=MOMENT_ART_BOUNDS[this.variant];
   if(!m)throw Error('Missing contact moments');
   const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=petArt(this.variant,'contact-moments');await image.decode();
   if(image.width!==m.width||image.height!==m.height||m.rects.length!==4)throw Error('Contact moments mismatch');
   await idleTurn();const dayCanvas=this.lightAtlas(image,2,2,false,m.rects),day=globalThis.createImageBitmap?await createImageBitmap(dayCanvas):dayCanvas;
   await idleTurn();const nightCanvas=this.lightAtlas(image,2,2,true,m.rects),night=globalThis.createImageBitmap?await createImageBitmap(nightCanvas):nightCanvas;
   const ready={};m.rects.forEach((rect,i)=>{const pose=36+i;ready[pose]={pose,rect,day,night};});Object.assign(this.actionArt??={},ready);this.momentArtReady=true;
  }catch{this.momentArtError=true;}
 }
 async loadDetailArt(){this.detail=new Image();this.detail.decoding='async';this.detail.src=this.variant==='puppy'?'assets/puppy-detail.webp':petArt(this.variant,'detail');try{await this.detail.decode();this.detailRect=this.bounds(this.detail,1,1)[0];this.detailDay=this.lightAtlas(this.detail,1,1);this.detailNight=this.lightAtlas(this.detail,1,1,true);}catch{this.detailError=true;}}
 loadBackground(night,retry=false){const key=night?'night':'day';if(retry&&this.backgroundErrors?.[key])delete this.backgroundLoads[key];if(this.backgroundLoads[key])return this.backgroundLoads[key];const im=night?this.nightRoom:this.room;im.fetchPriority='high';im.src=night?'assets/night.webp':'assets/room.webp';return this.backgroundLoads[key]=im.decode().then(()=>{this[night?'softNight':'softDay']=this.softBackground(im);this.backgroundReady[key]=true;if(this.backgroundErrors)delete this.backgroundErrors[key];}).catch(error=>{(this.backgroundErrors??={})[key]=true;throw error;});}
 loadFallbackArt(){this.bridge=new Image();this.bridge.src='assets/posture-bridges.webp';this.bridge.decode().then(()=>{this.bridgeRects=this.reactionBounds(this.bridge);this.bridgeDay=this.lightAtlas(this.bridge,2,2);this.bridgeNight=this.lightAtlas(this.bridge,2,2,true);}).catch(()=>{this.bridgeError=true;});this.walkAtlas=new Image();this.walkAtlas.src='assets/walk-cycle.webp';this.walkAtlas.decode().then(()=>{this.walkRects=this.bounds(this.walkAtlas,4,2);this.walkHeight=this.walkRects.map(r=>r[3]).sort((a,b)=>a-b)[4];this.walkDay=this.lightAtlas(this.walkAtlas,4,2);this.walkNight=this.lightAtlas(this.walkAtlas,4,2,true);}).catch(()=>{this.walkError=true;});this.reactions=new Image();this.reactions.src='assets/reactions.webp';
this.reactions.decode().then(()=>{this.reactionRects=this.reactionBounds();this.reactionDay=this.lightAtlas(this.reactions,2,2);this.reactionNight=this.lightAtlas(this.reactions,2,2,true);}).catch(()=>{this.reactionError=true;});
}
 async loadActionArt(){
 if(this.variant!=='puppy')return this.loadSpeciesArt();
 try{const specs=[['care-detail-trim.webp',[1,2,4,5]],['walk-detail-a-trim.webp',[12,13,14,15]],['walk-detail-b-trim.webp',[16,17,18,19]],['reactions-active-trim.webp',[null,9,10,11]],['bridge-active-trim.webp',[20,21,22,null]],['sleep-detail.webp',[3]],['touch-close.webp',[8]],['lying-close.webp',[23]]];
 const banks=await Promise.all(specs.map(async([file,poses])=>{let fallbackIndex=null;const im=new Image();im.decoding='async';im.fetchPriority='low';im.src='assets/'+file;try{await im.decode();}catch(error){if(file==='touch-close.webp'||file==='lying-close.webp'){this[file==='touch-close.webp'?'closeArtError':'lyingArtError']=true;fallbackIndex=file==='touch-close.webp'?0:3;im.src='assets/'+(fallbackIndex===0?'reactions-detail.webp':'bridge-detail.webp');await im.decode();}else throw error;}
 await new Promise(resolve=>setTimeout(resolve,0));const cells=fallbackIndex!==null?2:poses.length===1?1:2,rects=cells===1?this.bounds(im,1,1):this.reactionBounds(im),day=this.lightAtlas(im,cells,cells);await new Promise(resolve=>setTimeout(resolve,0));const night=this.lightAtlas(im,cells,cells,true);return poses.map((pose,i)=>({pose,rect:rects[fallbackIndex??i],day,night})).filter(f=>f.pose!==null);}));
 this.pendingArt=Object.fromEntries(banks.flat().map(f=>[f.pose,f]));
 }catch{this.actionArtError=true;this.loadFallbackArt();}
 }
 async loadSpeciesArt(){
  try{
   const load=async(bank,poses,cols=2)=>{
    const im=new Image();im.decoding='async';im.fetchPriority='low';im.fetchPriority='high';im.src=petArt(this.variant,bank);await im.decode();
    const rects=this.bounds(im,cols,2);await new Promise(r=>setTimeout(r,0));const day=this.lightAtlas(im,cols,2);
    await new Promise(r=>setTimeout(r,0));const night=this.lightAtlas(im,cols,2,true);
    return poses.map((pose,i)=>({pose,rect:rects[i],day,night}));
   };
   const banks=await Promise.all(['walk','bond','care-fine'].map(async bank=>{
    if(bank==='care-fine')return load(bank,[1,2,4,3]).catch(()=>{this.fineArtError=true;return [];});
    const poses=BANK_POSES[bank];
    try{return (await Promise.all([load(bank+'-fine-a',poses.slice(0,4)),load(bank+'-fine-b',poses.slice(4))])).flat();}
    catch{(this.fineFallbacks??=[]).push(bank);return load(bank,poses,4);}
   }));
   const heights=banks.flat().filter(f=>f.pose>=12&&f.pose<20).map(f=>f.rect[3]).sort((a,b)=>a-b);this.walkReferenceHeight=(heights[3]+heights[4])/2;
   const contacts=banks.flat().filter(f=>f.pose>=8&&f.pose<12).map(f=>f.rect[3]).sort((a,b)=>a-b);this.bondReferenceHeight=(contacts[1]+contacts[2])/2;
   this.pendingArt=Object.fromEntries(banks.flat().map(f=>[f.pose,f]));
  }catch{this.actionArtError=true;}
 }
 bounds(im,cols,rows){const file=im.src.split('/').pop(),cached=this.variant==='puppy'?ASSET_BOUNDS[file]:PET_BOUNDS[this.variant+'/'+file]??ASSET_BOUNDS[file];if(cached&&cached.width===im.width&&cached.height===im.height)return cached.rects;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,c.width,c.height).data,cw=c.width/cols,ch=c.height/rows,rects=[];for(let i=0;i<cols*rows;i++){let l=cw,r=0,top=ch,bot=0;const ox=Math.round(i%cols*cw),oy=Math.round(Math.floor(i/cols)*ch);for(let y=0;y<Math.floor(ch);y++)for(let x=0;x<Math.floor(cw);x++){if(data[((oy+y)*c.width+ox+x)*4+3]>100){l=Math.min(l,x);r=Math.max(r,x);top=Math.min(top,y);bot=Math.max(bot,y);}}rects.push([ox+Math.max(0,l-2),oy+Math.max(0,top-2),r-l+4,bot-top+4]);}return rects;}
 reactionBounds(im=this.reactions){const cached=ASSET_BOUNDS[im.src.split('/').pop()];if(cached&&cached.width===im.width&&cached.height===im.height)return cached.rects;
 // Ignore isolated alpha flecks below the feet, which otherwise make the sprite float.
 const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;
 const g=cv.getContext('2d');g.drawImage(im,0,0);const data=g.getImageData(0,0,cv.width,cv.height).data,cw=Math.floor(im.width/2),ch=Math.floor(im.height/2);
 return [0,1,2,3].map(i=>{const ox=i%2*cw,oy=Math.floor(i/2)*ch;let start=-1,bestStart=0,bestEnd=ch-1;
 let bestLength=0;
 for(let y=0;y<=ch;y++){let count=0;if(y<ch)for(let x=0;x<cw;x++)if(data[((oy+y)*cv.width+ox+x)*4+3]>100)count++;
 if(count>cw*.08){if(start<0)start=y;}else if(start>=0){if(y-start>bestLength){bestLength=y-start;bestStart=start;bestEnd=y-1;}start=-1;}}
 const top=Math.max(0,bestStart-5),bottom=Math.min(ch-1,bestEnd+5);let left=cw,right=0;
 for(let y=top;y<=bottom;y++)for(let x=0;x<cw;x++)if(data[((oy+y)*cv.width+ox+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);}
 left=Math.max(0,left-2);right=Math.min(cw-1,right+2);return [ox+left,oy+top,right-left+1,bottom-top+1];});
 }
 lightAtlas(im,cols,rows,night=false,rects){
 const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);g.globalCompositeOperation='source-atop';
 const cw=im.width/cols,ch=im.height/rows;for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
 const file=im.src.split('/').pop(),mirrored=file==='walk.webp'||(file==='bond-fine-b.webp'&&row*cols+col<2)||(file==='bond.webp'&&row*cols+col>=4&&row*cols+col<=5)||file.startsWith('walk-')||(['bridge-detail.webp','bridge-active-trim.webp','posture-bridges.webp'].includes(file)&&row*cols+col<2);const x=col*cw,y=row*ch,body=rects?.[row*cols+col]??(this.variant==='puppy'?ASSET_BOUNDS[file]:PET_BOUNDS[this.variant+'/'+file])?.rects[row*cols+col]??[x,y,cw,ch],shade=g.createLinearGradient(body[0],body[1],body[0]+body[2]*(mirrored?0:.35),body[1]+body[3]);shade.addColorStop(0,night?'#ffe1ae12':'#fff4d906');shade.addColorStop(.42,night?'#a48f7110':'#b8a88e00');shade.addColorStop(1,night?'#564c3d48':'#80736119');g.fillStyle=shade;g.fillRect(x,y,cw,ch);if(mirrored)continue;const side=g.createLinearGradient(body[0],0,body[0]+body[2],0);side.addColorStop(0,night?'#ffe6bb0b':'#ffe7bd12');side.addColorStop(.45,'#fff0');side.addColorStop(1,night?'#514c4510':'#756e650c');g.fillStyle=side;g.fillRect(x,y,cw,ch);}
 return c;
 }
 softBackground(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.filter='blur(2.5px)';g.drawImage(im,0,0);g.filter='none';g.globalCompositeOperation='destination-in';const fade=g.createLinearGradient(0,0,0,c.height);fade.addColorStop(0,'#fff');fade.addColorStop(.45,'#fff');fade.addColorStop(.87,'#fff0');g.fillStyle=fade;g.fillRect(0,0,c.width,c.height);return c;}
 makeShadow(){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');g.scale(1,.5);const grad=g.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'#36291ecc');grad.addColorStop(.4,'#36291e70');grad.addColorStop(1,'#36291e00');g.fillStyle=grad;g.fillRect(0,0,128,128);return c;}
 shadow(x,y,rx,ry,alpha=1){this.ctx.save();this.ctx.globalAlpha=alpha;this.ctx.drawImage(this.shadowMap,x-rx,y-ry,rx*2,ry*2);this.ctx.restore();}
 measure(){this.rects=this.bounds(this.pet,4,2);}
 propImage(i,x,y,width){const [sx,sy,sw,sh]=this.propRects[i],height=width*sh/sw;this.ctx.drawImage(this.props,sx,sy,sw,sh,x-width/2,y-height,width,height);}
 setPose(p){if(p>=24&&p<=27&&!this.extraArtReady)p=[11,8,2,1][p-24];if(p!==this.pose){this.previousPose=this.renderPose??this.pose;this.poseChangedAt=performance.now();this.pose=p;}}
 frameRect(p){if(this.actionArt?.[p])return this.actionArt[p].rect;return p===0&&this.detailRect?this.detailRect:p>=20?this.bridgeRects[p-20]:p>=12?this.walkRects[p-12]:p>=8?(this.reactionRects?.[p-8]||this.rects[[1,1,5,0][p-8]]):this.rects[p];}
 frameHeight(p,base){if(p>=8&&p<12&&this.bondReferenceHeight&&this.actionArt?.[p])return base*this.actionArt[p].rect[3]/this.bondReferenceHeight;const calibrated=speciesHeight(this.variant,p);if(p>=12&&p<20&&this.walkReferenceHeight&&this.actionArt?.[p])return base*(calibrated??.88)*this.actionArt[p].rect[3]/this.walkReferenceHeight;if(calibrated!==null)return base*calibrated;if(this.actionArt?.[p]&&p>=12&&p<20)return base*.88;return p>=20?base*BRIDGE_HEIGHT[p-20]:p>=12?base*.88*this.walkRects[p-12][3]/this.walkHeight:base*(p===3?.48:p===4?.88:1);}
 draw(t){const c=this.ctx,w=this.w,h=this.h;if(!w)return;if(this.stroke){settleStrokePart(this.stroke,t);this.touchPart=this.stroke.part;this.contactPhase=this.stroke.inside===false?'pause':contactPhase(this.stroke,t,this.contactPhase);this.setPose(responsePose(this.touchPart,this.contactPhase,this.species));}const dt=Math.min(64,this.lastDraw?t-this.lastDraw:33);this.lastDraw=t;this.time=t;if(this.pendingArt&&(this.pose===0||this.pose===3)&&!this.velocity&&!this.carry){this.actionArt=this.pendingArt;this.pendingArt=null;}let useNight=false,mixing=false;if(this.placeArt){const bg=this.placeArt.image,k=Math.max(w/bg.width,h/bg.height);this.renderNight=false;this.lightMix=0;c.drawImage(bg,(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);this.depth=lerp(this.depth||0,this.touchPart||this.prop==='brush'?1:0,this.reduced?1:1-Math.exp(-dt/600));if(this.depth>.01){c.save();c.globalAlpha=this.depth*.7;c.drawImage(this.placeArt.soft,(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);c.restore();}}else{const key=this.night?'night':'day';if(!this.backgroundReady[key]&&!this.backgroundLoads[key])this.loadBackground(this.night).catch(()=>{});useNight=this.backgroundReady[key]?this.night:!this.night;this.renderNight=useNight;const bg=useNight?this.nightRoom:this.room,k=Math.max(w/bg.width,h/bg.height);const wanted=useNight?1:0;this.lightMix=this.lightMix??wanted;this.lightMix=this.reduced?wanted:this.lightMix+Math.max(-dt/1200,Math.min(dt/1200,wanted-this.lightMix));if(!this.backgroundReady.day||!this.backgroundReady.night)this.lightMix=wanted;mixing=this.lightMix>0&&this.lightMix<1;c.drawImage(mixing?this.room:bg,(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);if(mixing){c.save();c.globalAlpha=this.lightMix;c.drawImage(this.nightRoom,(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);c.restore();}this.depth=lerp(this.depth||0,this.touchPart||this.prop==='brush'?1:0,this.reduced?1:1-Math.exp(-dt/600));if(this.depth>.01){c.save();c.globalAlpha=this.depth*.7;c.drawImage(mixing?this.softDay:(useNight?this.softNight:this.softDay),(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);if(mixing){c.globalAlpha=this.depth*.7*this.lightMix;c.drawImage(this.softNight,(w-bg.width*k)/2,(h-bg.height*k)/2,bg.width*k,bg.height*k);}c.restore();}}const oldX=this.x;const distance=this.target-this.x;if(Math.abs(distance)<.001)this.moveStartedAt=null;else if(this.moveStartedAt==null){this.moveStartedAt=t;this.moveRiseFrom=this.renderPose??this.pose;this.facing=distance>0?1:-1;this.stride=Math.floor(this.stride/.272)*.272;}const rising=!this.reduced&&this.moveStartedAt!=null&&t-this.moveStartedAt<((this.moveRiseFrom===3||this.moveRiseFrom===23||this.moveRiseFrom===35||this.moveRiseFrom===39)?600:this.moveRiseFrom===38?420:(this.moveRiseFrom>=8&&this.moveRiseFrom<=11)?320:160)&&!!(this.actionArt?.[20]||this.bridgeRects);this.velocity=rising?0:lerp(this.velocity||0,Math.max(-.22,Math.min(.22,distance*3)),1-Math.exp(-dt/140));const step=this.velocity*dt/1000;
if(this.reduced||Math.abs(distance)<.001||Math.sign(step)===Math.sign(distance)&&Math.abs(step)>=Math.abs(distance)){this.x=this.target;this.velocity=0;}else this.x+=step;this.stride+=Math.abs(this.x-oldX)*w/(Math.min(w*(w<600?.9:.56),h*.64)*this.size);this.focus=lerp(this.focus,this.affection&&this.motionKind!=='touch'?1.035+.075*afterglowWeight(t,this.affection):(this.touchPart||this.motionKind==='contactEnd')?1.11:this.prop==='brush'&&this.renderPose===1?1.06:this.pose===11&&this.renderPose===11&&!this.velocity?1.035:this.pose===1&&this.renderPose===1?1.025:1,this.reduced?1:1-Math.exp(-dt/420));const base=Math.min(w*(w<600?.9:.56),h*.64)*this.size*this.focus;this.base=base;const worldBase=base/this.focus;this.worldBase=worldBase;const ground=h-(h<500?145:170);this.ground=ground; const walk=Math.abs(this.velocity||0)>0;let pose=this.pose;if(pose===0&&!this.reduced&&t%16000>14500)pose=5;if(rising)pose=risePose(t-this.moveStartedAt,this.moveRiseFrom);else if(walk&&!this.reduced){this.facing=(this.velocity>0?1:-1);this.lastWalkAt=t;pose=this.actionArt?.[12]||this.walkRects?12+walkFrame(this.stride,this.velocity):6+Math.floor(this.stride/.085)%2;}else if(!this.reduced)pose=bridgePose(pose,this.previousPose,t-(this.poseChangedAt??-1000),t-(this.lastWalkAt??-1000),!!(this.actionArt?.[20]||this.bridgeRects));if(walk&&!rising&&!this.reduced){const foot=Math.floor(this.stride/.136);if(foot!==this.lastFoot){this.lastFoot=foot;this.onFootstep?.();}}if(!walk&&!rising)pose=touchPose(this,t,pose);this.renderPose=pose;const reaction=this.reaction??={angle:0,shift:0,breath:0,lift:0};const targets=this.reactionGoal??={};reactionTargets(walk?'walk':this.motionKind??'idle',this.species,t,t-(this.motionStart??t),this.stroke,this.reduced,targets,this.contactPhase,this.affection,this.touchPart);if(this.stroke){const feel=CONTACT_RESPONSE[this.species]??CONTACT_RESPONSE.cat;targets.angle*=feel.angle;targets.shift*=feel.shift;}easeReaction(reaction,targets,dt,this.stroke?(t-this.stroke.started<120?30:45):180);
const rect=this.frameRect(pose),desiredHeight=this.frameHeight(pose,base)*(TOUCH_SCALE[this.variant]?.[pose]??1),silhouetteChange=pose!==this.lastRenderPose&&(pose>=28&&pose<=39||this.lastRenderPose>=28&&this.lastRenderPose<=39||this.stroke&&pose>=8);if(pose!==this.lastRenderPose){this.renderChangedAt=t;this.lastRenderPose=pose;}this.visualHeight=settledHeight(this.visualHeight,desiredHeight,dt,!this.reduced&&!walk&&!silhouetteChange,(this.pose===3||this.previousPose===3||this.previousPose===23)?140:85);const visualHeight=this.visualHeight,half=visualHeight*rect[2]/rect[3]/2;const px=Math.max(half+8,Math.min(w-half-8,w*this.x+base*reaction.shift));this.px=px;this.drawBounds={left:px-half,right:px+half};
 if(this.rain){c.fillStyle='#48536724';c.fillRect(0,0,w,h);c.save();c.beginPath();c.rect(w*.32,0,w*.26,h*.46);c.clip();c.strokeStyle='#e4ecf190';c.lineWidth=1;for(let i=0;i<28;i++){const xx=w*.32+(i*37%Math.max(1,w*.26)),yy=(i*83+(this.reduced?0:t*.06))%(h*.48);c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-3,yy+18);c.stroke();}c.restore();}
 if(!this.place){this.shadow(w*.65,ground-5,worldBase*.35,worldBase*.045,.5);this.propImage(5,w*.65,ground-8,worldBase*.64);}
 this.contactWidth=lerp(this.contactWidth??half*.85,Math.max(half*.85,base*.25),this.reduced?1:1-Math.exp(-dt/100));this.shadow(px,ground-1,this.contactWidth,base*.065,.65+this.lightMix*.2);
 if(pose!==3&&pose!==23&&pose!==35&&pose!==39){this.shadow(px-half*.34,ground-2,half*.32,base*.018,.48);this.shadow(px+half*.3,ground-2,half*.28,base*.018,.48);}


 
 const scaleY=this.reduced||walk?1:1+reaction.breath;const desiredLean=this.touchPart==='chin'?-.005:this.touchPart==='back'?.004:0;this.contactLean=lerp(this.contactLean||0,desiredLean*(this.familiarTouch?1.25:1),1-Math.exp(-dt/(this.stroke?210:450)));const targetTilt=(pose===1||pose>=8&&pose<12||pose>=28&&pose<=39)?Math.max(-.018,Math.min(.018,(this.stroke?0:Math.sin(t/900)*.002)+this.contactLean+reaction.angle)):0;this.contactTilt=this.reduced?0:lerp(this.contactTilt||0,targetTilt,1-Math.exp(-dt/(this.stroke?90:180)));const tilt=this.contactTilt;const lift=walk&&!this.reduced?Math.sin(this.stride/.136*Math.PI)**2*base*.002:0;if(this.petBox&&pose!==this.petBoxPose)this.previousContact={box:this.petBox,pose:this.petBoxPose,facing:this.petBoxFacing,at:t};this.petBoxPose=pose;this.petBoxFacing=this.facing;this.petBox={x:px-half,y:ground-visualHeight,w:half*2,h:visualHeight};
 const paint=(p,alpha)=>{if(alpha<=0)return;if(p>=8&&p<12&&!this.reactionRects&&!this.actionArt?.[p])p=[1,1,5,0][p-8];const sheetFor=useNight=>this.actionArt?.[p]?(useNight?this.actionArt[p].night:this.actionArt[p].day):p===0&&this.detailRect?(useNight?this.detailNight:this.detailDay):p>=20?(useNight?this.bridgeNight:this.bridgeDay):p>=12?(useNight?this.walkNight:this.walkDay):p>=8?(useNight?this.reactionNight:this.reactionDay):(useNight?this.petNight:this.petDay);const sheet=sheetFor(mixing?false:useNight);const [sx,sy,sw,sth]=this.frameRect(p);const height=visualHeight;const width=height*sw/sth;c.save();c.globalAlpha=alpha;c.translate(px,ground-lift);c.rotate(tilt);c.scale((p>=12&&p<22)&&this.facing>0?-1:1,scaleY);c.drawImage(sheet,sx,sy,sw,sth,-width/2,-height,width,height);if(mixing){c.globalAlpha=alpha*this.lightMix;c.drawImage(sheetFor(true),sx,sy,sw,sth,-width/2,-height,width,height);}c.restore();};
 // Distinct silhouettes must stay opaque; crossfading them creates a double face.
 if(this.hunt&&this.species==='pig'){c.save();for(const x of SCENT_SPOTS){if(this.hunt.phase==='found'&&x===this.hunt.goal)continue;const cx=x*w,cy=ground+9,r=Math.min(48,w*.085);this.shadow(cx,cy+2,r,r*.22,.3);this.propImage(5,cx,cy,r*2);}if(this.hunt.phase==='seek'&&this.hunt.guided){c.strokeStyle='#fff1bd';c.lineWidth=2;c.globalAlpha=.25+this.hunt.warm*.6;c.beginPath();c.ellipse(this.hunt.cursor*w,ground+3,14+this.hunt.warm*10,5,0,0,Math.PI*2);c.stroke();}c.restore();}
 paint(pose,1);
 if(this.ballRoll)this.toyX=this.reduced?this.ballRoll.to:rollPosition(this.ballRoll,t);
 if(this.toy){const mouth=pose>=20?{x:px+(pose<22?(this.facing||-1)*base*.13:-base*.1),y:ground-base*(pose===22?.28:pose===23?.3:.48)}:pose>=12?{x:px+(this.facing||-1)*base*.17,y:ground-base*.35}:pose===5?{x:px-base*.16,y:ground-base*.64}:pose===2?{x:px-base*.07,y:ground-base*.25}:{x:px+base*.01,y:ground-base*(pose===6||pose===7?.45:.49)};if(this.variant!=='puppy'){const [mx,my]=mouthAnchor(this.variant,pose),mirror=pose>=12&&pose<22&&this.facing>0?-1:1;mouth.x=px+mx*visualHeight*rect[2]/rect[3]*mirror;mouth.y=ground-my*visualHeight;}const mx=mouth.x-px,my=(mouth.y-ground)*scaleY;mouth.x=px+mx*Math.cos(tilt)-my*Math.sin(tilt);mouth.y=ground-lift+mx*Math.sin(tilt)+my*Math.cos(tilt);const tx=this.carry?mouth.x:w*this.toyX,ty=this.carry?mouth.y:this.toyLift?ground-base*this.toyLift:ground+7;const p=this.toyPosition??={x:tx,y:ty};const ease=this.reduced||this.ballDrag?1:1-Math.exp(-dt/90),old=p.x;p.x=lerp(p.x,tx,ease);
 if(this.carry){p.dropping=false;p.vy=0;p.y=lerp(p.y,ty,ease);}else if(this.reduced){p.y=ty;p.dropping=false;}else{if(p.wasCarry){p.dropping=true;p.vy=0;}if(p.dropping)dropStep(p,ty,dt/1000,base*5);else p.y=lerp(p.y,ty,ease);}
 if(this.carry&&p.wasCarry&&walk&&this.variant!=='puppy'){p.x=tx;p.y=ty;}
 p.wasCarry=!!this.carry;p.rotation=this.carry?0:(p.rotation||0)+(p.x-old)/(worldBase*.075);
 if(!this.carry)this.shadow(p.x,ground+5,base*.12,base*.018,Math.max(.12,.55-(ground-p.y)/base));
 if(this.hunt&&this.species==='cat'){c.save();c.strokeStyle='#6a4b2e';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(w*.92,ground-base*.68);c.lineTo(w*.78,ground-base*.84);c.stroke();c.strokeStyle='#e6d6b5';c.lineWidth=1.2;c.beginPath();c.moveTo(w*.78,ground-base*.84);c.quadraticCurveTo((w*.78+p.x)/2,p.y-base*.15,p.x,p.y);c.stroke();c.restore();}
 this.drawToy(this.toy,p.x,p.y,(this.carry?base:worldBase)*.14,p.rotation,this.carry&&this.variant!=='puppy');this.toyPoint={x:p.x,y:p.y};}else{this.toyPoint=null;this.toyPosition=null;}
 if(this.prop==='water'||this.prop==='food')this.bowl(px-base*.13,ground+15,worldBase*.19,this.prop,t);
 if(this.prop==='brush'){const bx=this.point?.x??px+base*.21+Math.sin(t/420)*base*.045,by=this.point?.y??ground-base*.42+Math.sin(t/420)*base*.025;const targetX=Math.max(px-base*.28,Math.min(px+base*.3,bx)),targetY=Math.max(ground-base*.75,Math.min(ground-base*.24,by));const brush=this.brushPoint??={x:targetX,y:targetY};const blend=this.reduced?1:1-Math.exp(-dt/120);brush.x=lerp(brush.x,targetX,blend);brush.y=lerp(brush.y,targetY,blend);this.propImage(4,brush.x,brush.y,worldBase*.22);}
 if(this.prop!=='brush')this.brushPoint=null;
 if(this.hide){this.propImage(5,px+base*.1,ground+5,worldBase*.84);}
 if(this.playSignal){const q=this.playSignal,age=t-q.at;if(age>=450)this.playSignal=null;else if(!this.reduced){c.save();c.globalAlpha=(1-age/450)*.65;c.strokeStyle='#fff5d7';c.lineWidth=2;c.beginPath();c.ellipse(q.x,q.y,12+age*.06,5+age*.025,0,0,Math.PI*2);c.stroke();c.restore();}}
 if(this.place==='park'&&(this.motionKind==='outing'||this.motionKind==='curiosity'&&this.outdoorInterest==='petal')){const x=w*(.36+(this.reduced?0:Math.sin(t/650)*.045)),y=ground-base*.45+(this.reduced?0:Math.cos(t/800)*base*.06);c.save();c.translate(x,y);c.rotate(this.reduced?0:Math.sin(t/600));c.fillStyle='#f6c7ce';c.beginPath();c.ellipse(0,0,8,4,0,0,Math.PI*2);c.fill();c.restore();}
 drawContactFeedback(this,t);
 drawPlayFeedback(this,t);

 }
 drawToy(kind,x,y,size,angle=0,centered=false){if(kind==='bone'&&['cat','pig'].includes(this.species)){const c=this.ctx,art=this.speciesToy??=makeToyArt(this.species),h=size*(this.species==='cat'?1.65:1.2);c.save();c.translate(x,y-h/2);c.rotate(this.species==='cat'?(this.reduced?0:Math.sin(this.time/280)*.12):angle);c.drawImage(art,-h/2,-h/2,h,h);c.restore();return;}const i=kind==='ball'?0:1,width=size*(i===0?1.2:1.8),height=width*this.propRects[i][3]/this.propRects[i][2];this.ctx.save();this.ctx.translate(x,centered?y:y-height/2);if(i===0)this.ctx.rotate(angle);this.propImage(i,0,height/2,width);this.ctx.restore();}
 bowl(x,y,size,type){this.shadow(x,y-1,size*.8,size*.12,.7);this.propImage(type==='water'?2:3,x,y,size*1.35);if(type==='water'&&!this.reduced){const width=size*1.35,height=width*this.propRects[2][3]/this.propRects[2][2],phase=this.time%1100/1100;this.ctx.save();this.ctx.strokeStyle='rgba(255,252,235,'+((1-phase)*.38)+')';this.ctx.lineWidth=1;this.ctx.beginPath();this.ctx.ellipse(x,y-height*.58,width*(.08+phase*.18),height*(.025+phase*.055),0,0,Math.PI*2);this.ctx.stroke();this.ctx.restore();}}
 photo(){const c=document.createElement('canvas');c.width=960;c.height=Math.round(960*this.h/this.w);c.getContext('2d').drawImage(this.canvas,0,0,c.width,c.height);return new Promise((resolve,reject)=>c.toBlob(blob=>{if(!blob){reject(Error('사진 압축 실패'));return;}const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);},'image/webp',.78));}
}



