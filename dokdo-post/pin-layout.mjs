// Pin coordinates describe its bottom centre; reserve the actual HUD rectangles.
export function placePin(point,width,height,viewport,blocks){
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
 let x=clamp(point.x,width/2+12,viewport.width-width/2-12),y=clamp(point.y,height+12,viewport.height-12);
 for(let pass=0;pass<2;pass++)for(const r of blocks){
  if(x+width/2<=r.left-8||x-width/2>=r.right+8||y<=r.top-8||y-height>=r.bottom+8)continue;
  y=r.top<viewport.height/2?r.bottom+height+10:r.top-10;
  y=clamp(y,height+12,viewport.height-12);
 }
 return {x,y,shifted:Math.abs(x-point.x)>.5||Math.abs(y-point.y)>.5};
}
