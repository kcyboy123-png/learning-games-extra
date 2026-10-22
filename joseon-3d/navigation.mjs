export function walkable(w,x,z,r=.32){const b=w.bounds;return x>=b.minX+r&&x<=b.maxX-r&&z>=b.minZ+r&&z<=b.maxZ-r&&!w.colliders.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r);}
export function move(w,p,dx,dz){let {x,z}=p;if(walkable(w,x+dx,z+dz))return{x:x+dx,z:z+dz};if(walkable(w,x+dx,z))x+=dx;if(walkable(w,x,z+dz))z+=dz;return{x,z};}
export function route(w,start,end){if(!walkable(w,end.x,end.z))return[];const step=.5,b=w.bounds,nx=Math.ceil((b.maxX-b.minX)/step)+1,nz=Math.ceil((b.maxZ-b.minZ)/step)+1;const point=i=>({x:b.minX+(i%nx)*step,z:b.minZ+Math.floor(i/nx)*step});const id=p=>Math.round((p.z-b.minZ)/step)*nx+Math.round((p.x-b.minX)/step);const first=id(start),goal=id(end),open=[first],parent=new Map([[first,-1]]),cost=new Map([[first,0]]);let count=0;
while(open.length&&count++<nx*nz){open.sort((a,c)=>{let p=point(a),q=point(c);return cost.get(a)+Math.hypot(p.x-end.x,p.z-end.z)-cost.get(c)-Math.hypot(q.x-end.x,q.z-end.z);});const cur=open.shift();if(cur===goal){const out=[];for(let i=cur;i!==first;i=parent.get(i))out.unshift(point(i));if(out.length)out.push(end);return smoothRoute(w,start,out);}const p=point(cur);for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const q={x:p.x+dx*step,z:p.z+dz*step};if(!walkable(w,q.x,q.z)||!walkable(w,q.x,p.z)||!walkable(w,p.x,q.z))continue;const i=id(q),g=cost.get(cur)+Math.hypot(dx,dz)*step;if(g<(cost.get(i)??Infinity)){cost.set(i,g);parent.set(i,cur);if(!open.includes(i))open.push(i);}}}return[];}

// Remove grid zigzags only where the whole segment clears the character's body.
export function smoothRoute(w,start,points){
 const out=[];let from=start,i=0;
 while(i<points.length){
  let best=i;
  for(let j=i+1;j<points.length;j++){
   const to=points[j],n=Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/.1);let clear=true;
   for(let k=1;k<=n;k++)if(!walkable(w,from.x+(to.x-from.x)*k/n,from.z+(to.z-from.z)*k/n,.37)){clear=false;break;}
   if(clear)best=j;
  }
  from=points[best];out.push(from);i=best+1;
 }
 return out;
}
