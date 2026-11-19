import {W,H,TOP,cells,ghost,matrix,landingRows} from './engine.mjs';
export const COLORS=['#54c5df','#f9d76c','#b990f1','#f69c57','#689ceb','#83cf80','#f07a70','#9fa9b3'];
const backgrounds=new WeakMap(),gridPaths=[];
const tileImages=new Map(),nextImages=new WeakMap(),boardImages=new WeakMap();
const activeFlightCanvases=new WeakSet();
export const FLIGHT_MS=400,FLIGHT_GAP=65,FLIGHT_FADE=260;
export function flightDuration(n){return FLIGHT_MS+(Math.max(1,Math.min(4,n))-1)*FLIGHT_GAP+FLIGHT_FADE;}
export function flightHits(age,n){return Math.max(0,Math.min(n,1+Math.floor((age-FLIGHT_MS)/FLIGHT_GAP)));}
export function drawFlights(canvas,flights,now){
 if(!flights.length&&!activeFlightCanvases.has(canvas))return;
 const box=canvas.getBoundingClientRect(),c=canvas.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1);
 const w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
 c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,box.width,box.height);
 if(!flights.length){activeFlightCanvases.delete(canvas);return;}activeFlightCanvases.add(canvas);
 const rect=el=>{const r=el.getBoundingClientRect();return{x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};};
 // Keep both playing fields and all block previews readable beneath the flight.
 c.save();c.beginPath();c.rect(0,0,box.width,box.height);
 for(const el of canvas.parentElement.querySelectorAll('canvas:not(#battleEffects)')){const r=rect(el);if(r.w)c.rect(r.x-2,r.y-2,r.w+4,r.h+4);}c.clip('evenodd');
 for(const f of flights){
  const s=rect(f.from),t=rect(f.to),dir=t.x>s.x?1:-1;
  const sx=dir>0?s.x+s.w+6:s.x-6,tx=dir>0?t.x-3:t.x+t.w+3;
  const sy=s.y+s.h*(f.sourceY??.85),ty=t.y+t.h*.47,size=Math.max(14,Math.min(25,s.w*.105));
  for(let i=0;i<f.n;i++){
   const age=now-f.born-i*FLIGHT_GAP;if(age<0||age>FLIGHT_MS+FLIGHT_FADE)continue;
   const iy=ty+(i-(f.n-1)/2)*size*.85;
   if(age<FLIGHT_MS){
    const u=age/FLIGHT_MS,p=.2*u+.8*u*u,cy=Math.min(sy,iy)-32;
    const point=q=>({x:sx+(tx-sx)*q,y:(1-q)*(1-q)*sy+2*(1-q)*q*cy+q*q*iy});
    const a=point(p),tail=point(Math.max(0,p-.18));
    c.strokeStyle=f.own?'#ffd68b':'#f4a27a';c.lineWidth=size*.4;c.globalAlpha=.5;c.beginPath();c.moveTo(tail.x,tail.y);c.lineTo(a.x,a.y);c.stroke();
    if(age<110){c.globalAlpha=1-age/110;c.lineWidth=3;c.beginPath();c.moveTo(sx,sy-size);c.lineTo(sx,sy+size);c.stroke();}
    for(let k=2;k>=0;k--){const q=point(Math.max(0,p-k*.045));c.save();c.translate(q.x,q.y);c.rotate(dir*(u*.65-.2));c.globalAlpha=k?.16:1;tile(c,-size/2,-size/2,size,f.color,k?.16:1);c.restore();}c.globalAlpha=1;
   }else{
    const p=(age-FLIGHT_MS)/FLIGHT_FADE,r=6+p*(16+f.n*3);c.globalAlpha=(1-p)**2;c.strokeStyle=f.own?'#ffe5a8':'#ffb694';c.lineWidth=3*(1-p)+1;
    // The contact stripe hugs the rim; fragments recoil away from the playing field.
    c.fillStyle=c.strokeStyle;c.fillRect(tx-2,iy-size*1.2,4,size*2.4);
    for(let k=0;k<4;k++){const a=(k-1.5)*.43,travel=p*(24+k*5),x=tx-dir*(4+travel*Math.cos(a)),y=iy+travel*Math.sin(a)*1.8;c.save();c.translate(x,y);c.rotate(k+p*4);c.fillRect(-3,-2,6*(1-p),4*(1-p));c.restore();}
    if(p<.2){c.save();c.translate(tx-dir*size*.25,iy);c.scale(.45,1.25);tile(c,-size/2,-size/2,size,f.color,1-p*5);c.restore();}
    c.beginPath();c.arc(tx,iy,r,0,Math.PI*2);c.stroke();
    for(let k=0;k<8;k++){const a=k*Math.PI/4+i*.3;c.beginPath();c.moveTo(tx+Math.cos(a)*r*.5,iy+Math.sin(a)*r*.5);c.lineTo(tx+Math.cos(a)*(r+9),iy+Math.sin(a)*(r+9));c.stroke();}
    c.globalAlpha=1;
   }
  }
 }c.restore();
}
function rounded(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
// Reuse the same crisp block artwork during movement and particle bursts.
export function tile(c,x,y,s,type,alpha=1){
 const key=s+':'+type;let sprite=tileImages.get(key);
 if(!sprite){
  sprite=document.createElement('canvas');sprite.width=sprite.height=s*2;const p=sprite.getContext('2d');p.scale(2,2);
  const color=COLORS[type-1]||'#ffffff',shade='#'+color.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*.72).toString(16).padStart(2,'0')).join('');
  const g=p.createLinearGradient(0,0,0,s);g.addColorStop(0,color);g.addColorStop(.35,color);g.addColorStop(1,shade);
  rounded(p,1.5,1.5,s-3,s-3,s*.16);p.fillStyle=g;p.fill();p.strokeStyle='#ffffff70';p.lineWidth=1;p.stroke();
  rounded(p,4,4,s-8,s-8,s*.11);p.strokeStyle='#ffffff20';p.stroke();
  p.beginPath();p.moveTo(s*.2,3);p.lineTo(s*.8,3);p.strokeStyle='#ffffff88';p.stroke();
  p.beginPath();p.moveTo(s*.2,s-3);p.lineTo(s*.8,s-3);p.strokeStyle='#00000032';p.stroke();
  if(type===8){p.strokeStyle='#36414d77';for(const y of[s*.4,s*.6]){p.beginPath();p.moveTo(s*.28,y);p.lineTo(s*.72,y);p.stroke();}}
  tileImages.set(key,sprite);
 }
 c.save();c.globalAlpha=alpha;c.drawImage(sprite,x,y,s,s);c.restore();
}
export function drawBoard(canvas,p,effects=[],now=performance.now(),reduced=false){
 const c=canvas.getContext('2d'),s=48,bw=W*s,bh=(H-TOP)*s;const resized=canvas.width!==bw||canvas.height!==bh;canvas.width!==bw&&(canvas.width=bw);canvas.height!==bh&&(canvas.height=bh);
 const piece=p?.piece,key=p?p.board.map(r=>r.join('')).join('|')+':'+[piece?.type,piece?.rot,piece?.x,piece?.y,p.dead,reduced].join(','):'empty';
 const active=!reduced&&effects.some(e=>e.type==='lock'&&now>=e.born&&now-e.born<(e.lines?360+Math.min(4,e.lines)*105:120));
 if(!active&&!resized&&boardImages.get(canvas)===key)return;
 if(active)boardImages.delete(canvas);else boardImages.set(canvas,key);
 let bg=backgrounds.get(canvas);if(!bg){bg=c.createLinearGradient(0,0,bw,bh);bg.addColorStop(0,'#111a26');bg.addColorStop(1,'#1b2938');backgrounds.set(canvas,bg);}
 if(!gridPaths.length){for(let x=0;x<=W;x++){const path=new Path2D();path.moveTo(x*s,0);path.lineTo(x*s,bh);gridPaths.push(path);}for(let y=0;y<=H-TOP;y++){const path=new Path2D();path.moveTo(0,y*s);path.lineTo(bw,y*s);gridPaths.push(path);}}
 c.clearRect(0,0,bw,bh);c.fillStyle=bg;c.fillRect(0,0,bw,bh);c.strokeStyle='#9aaec91a';c.lineWidth=1;for(const path of gridPaths)c.stroke(path);
 c.strokeStyle='#bdcde52b';c.beginPath();c.moveTo(bw/2,0);c.lineTo(bw/2,bh);c.stroke();
 if(!p)return;
 const ready=landingRows(p);
 for(const row of ready){c.fillStyle='#ffdc7a25';c.fillRect(0,(row-TOP)*s,bw,s);}
 const landed=!reduced?effects.findLast(e=>e.type==='lock'&&!e.lines&&now-e.born<120):null;
 for(let y=TOP;y<H;y++)for(let x=0;x<W;x++)if(p.board[y][x]){
  const hit=landed?.occupied.some(([cx,cy])=>cx===x&&cy===y);
  if(hit){const t=(now-landed.born)/120;c.save();c.translate(x*s+s/2,(y-TOP)*s+s);c.scale(1,1-.02*Math.sin(Math.PI*t));tile(c,-s/2,-s,s,p.board[y][x]);c.restore();}
  else tile(c,x*s,(y-TOP)*s,s,p.board[y][x]);
 }
 for(const row of ready){c.strokeStyle='#ffe5a8';c.lineWidth=2;c.strokeRect(2,(row-TOP)*s+2,bw-4,s-4);}
 if(!reduced)for(const e of effects){const strength=Math.min(4,e.lines),duration=e.lines?360+strength*105:800,t=(now-e.born)/duration;if(e.type!=='lock'||t<0||t>=1)continue;
  if(e.lines&&t<.6)for(const[x,y,color]of e.fragments||[]){
   const f=t/.6,burst=1-(1-f)**2,dx=(x-(W-1)/2)*burst*(22+strength*8),dy=-Math.sin(burst*Math.PI)*(28+strength*12)+f*f*45;
   c.save();c.translate(x*s+s/2+dx,(y-TOP)*s+s/2+dy);c.rotate((x-(W-1)/2)*f*.35);c.scale(1-f*.8,1-f*.8);tile(c,-s/2,-s/2,s,color,(1-f)**2*.9);c.restore();
  }
  c.save();c.globalCompositeOperation='screen';
  if(e.lines)for(const row of e.rows){const y=(row-TOP+.5)*s,power=Math.min(6,e.combo);
   if(now-e.born<65){const hit=1-(now-e.born)/65;c.fillStyle=`rgba(255,227,173,${(.3+strength*.065)*hit})`;c.fillRect(0,y-s/2,bw,s);c.fillStyle=`rgba(255,250,229,${.85*hit})`;c.fillRect(0,y-2,bw,4);}
   if(row===e.rows[0]){const center=(e.rows.reduce((sum,r)=>sum+r,0)/e.rows.length-TOP+.5)*s,wave=1-(1-t)**3;c.strokeStyle=`rgba(255,216,138,${(1-t)**2})`;c.lineWidth=(2+strength)*(1-t);c.beginPath();c.ellipse(bw/2,center,20+wave*bw*.62,12+strength*4+wave*35,0,0,Math.PI*2);c.stroke();}
   for(let i=0;i<8+strength*4+power*2;i++){const a=i*2.39996+row,speed=55+(i%7)*24+strength*16+power*6,x=(i+.5)/(8+strength*4+power*2)*bw+Math.cos(a)*speed*t,py=y+Math.sin(a)*speed*t*.6+100*t*t;
    c.globalAlpha=(1-t)*(1-t);c.fillStyle=i%3?'#ffcd70':'#fff4cf';c.save();c.translate(x,py);c.rotate(a+t*4);c.fillRect(-3,-2,5+(i%4)*2,3);c.restore();}
   c.globalAlpha=1;
  }else if(t<.15){const fade=1-t/.15;for(const[x,y]of e.occupied){c.fillStyle=`rgba(255,235,200,${fade*.25})`;c.fillRect(x*s+3,(y-TOP+1)*s-2,s-6,2);}}
  c.restore();
 }
 if(p.piece){const g=ghost(p);c.save();c.setLineDash([5,5]);for(const[x,y]of cells(g)){if(y>=TOP){rounded(c,x*s+4,(y-TOP)*s+4,s-8,s-8,5);c.strokeStyle='#0c1521';c.lineWidth=5;c.stroke();c.lineWidth=2.6;c.strokeStyle='#fff2d1';c.stroke();c.fillStyle='#ffe9b315';c.fill();}}c.restore();
  for(const[x,y]of cells(p.piece))if(y>=TOP)tile(c,x*s,(y-TOP)*s,s,p.piece.type+1);
 }
 if(p.board.slice(TOP,TOP+3).some(r=>r.some(Boolean))){c.fillStyle='#f0a373';c.font='bold 20px sans-serif';c.textAlign='center';c.fillText('위쪽을 비워 보자',bw/2,24);}
}
export function drawNext(canvas,types,large=false){const height=Math.max(90,types.length*90)*2,key=large+':'+types.join(',');if(nextImages.get(canvas)===key&&canvas.width===224&&canvas.height===height)return;const c=canvas.getContext('2d');canvas.width=224;canvas.height=height;c.scale(2,2);c.clearRect(0,0,112,canvas.height/2);types.forEach((type,i)=>{const m=matrix(type),points=[];m.forEach((r,y)=>r.forEach((v,x)=>{if(v)points.push([x,y]);}));const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));const s=large?27:23,ox=(112-(maxX-minX+1)*s)/2,oy=i*90+(90-(maxY-minY+1)*s)/2;for(const[x,y]of points)tile(c,ox+(x-minX)*s,oy+(y-minY)*s,s,type+1);});nextImages.set(canvas,key);}
export function demoBoard(){const board=Array.from({length:H},()=>Array(W).fill(0));const rows=[[0,0,0,0,0,0,0,0],[0,0,3,0,0,0,0,0],[0,2,3,0,0,0,0,5],[1,2,3,3,0,0,5,5],[1,1,6,6,0,0,7,7],[4,4,4,6,0,0,7,2]];rows.forEach((r,i)=>board[H-rows.length+i]=[0,...r,0]);return{board,piece:{type:1,rot:0,x:4,y:6}};}
