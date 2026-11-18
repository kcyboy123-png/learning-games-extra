// Pin coordinates describe its bottom centre; reserve the actual HUD rectangles.
export function placePin(point,width,height,viewport,blocks){
 const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
 let x=clamp(point.x,width/2+12,viewport.width-width/2-12),y=clamp(point.y,height+12,viewport.height-12);
 for(let pass=0;pass<2;pass++)for(const r of blocks){
  if(x+width/2<=r.left-8||x-width/2>=r.right+8||y<=r.top-8||y-height>=r.bottom+8)continue;
  y=r.top<viewport.height/2?r.bottom+height+10:r.top-10;
  y=clamp(y,height+12,viewport.height-12);
 }
 const overlap=(cx,cy)=>blocks.reduce((sum,r)=>sum+Math.max(0,Math.min(cx+width/2,r.right+8)-Math.max(cx-width/2,r.left-8))*Math.max(0,Math.min(cy,r.bottom+8)-Math.max(cy-height,r.top-8)),0);
 if(overlap(x,y)>0){
  // Vertical nudges can bounce between the expanded map and the task card.
  const xs=[x,width/2+12,viewport.width-width/2-12,...blocks.flatMap(r=>[r.left-width/2-10,r.right+width/2+10])];
  const ys=[y,height+12,viewport.height-12,...blocks.flatMap(r=>[r.top-10,r.bottom+height+10])];
  let bestArea=Infinity,bestDistance=Infinity;
  for(const px of xs)for(const py of ys){const cx=clamp(px,width/2+12,viewport.width-width/2-12),cy=clamp(py,height+12,viewport.height-12),area=overlap(cx,cy),distance=(cx-point.x)**2+(cy-point.y)**2;if(area<bestArea||area===bestArea&&distance<bestDistance){x=cx;y=cy;bestArea=area;bestDistance=distance;}}
 }
 return {x,y,shifted:Math.abs(x-point.x)>.5||Math.abs(y-point.y)>.5};
}
