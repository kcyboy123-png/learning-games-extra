// Cached ground samples; the same footprint rules govern manual and click walking.
export function strollRouter(stand){
 const canStand=(x,z)=>stand(x,z)&&stand(x-.06,z)&&stand(x+.06,z)&&stand(x,z-.06)&&stand(x,z+.06);
 const cache=new Map(),edges=new Map(),step=.6,key=(x,z)=>x+','+z;
 const neighbours=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
 const valid=(x,z)=>{const k=key(x,z);if(!cache.has(k))cache.set(k,canStand(x*step,z*step));return cache.get(k);};
 function clear(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.06));for(let i=1;i<=n;i++)if(!canStand(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;}
 return (from,to)=>{
  if(!canStand(to.x,to.z))return[];if(clear(from,to))return[{...to}];
  const sx=Math.round(from.x/step),sz=Math.round(from.z/step),open=[],seen=new Map();
  for(let x=sx-1;x<=sx+1;x++)for(let z=sz-1;z<=sz+1;z++){const p={x:x*step,z:z*step};if(valid(x,z)&&clear(from,p)){const g=Math.hypot(p.x-from.x,p.z-from.z);open.push({x,z,g,f:g+Math.hypot(to.x-p.x,to.z-p.z),prev:null});seen.set(key(x,z),g);}}
  for(let count=0;open.length&&count<9000;count++){
   let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
   const n=open.splice(best,1)[0],p={x:n.x*step,z:n.z*step};if(n.g>seen.get(key(n.x,n.z)))continue;
   if(Math.hypot(p.x-to.x,p.z-to.z)<step*2&&clear(p,to)){
    const points=[];for(let q=n;q;q=q.prev)points.push({x:q.x*step,z:q.z*step});points.reverse();points.push({...to});
    const out=[];let anchor=from;for(let i=0;i<points.length;){let j=points.length-1;while(j>i&&!clear(anchor,points[j]))j--;out.push(points[j]);anchor=points[j];i=j+1;}return out;
   }
   for(const [dx,dz]of neighbours){
    const x=n.x+dx,z=n.z+dz;if(Math.abs(x)>48||Math.abs(z)>48||!valid(x,z))continue;
    const q={x:x*step,z:z*step},g=n.g+Math.hypot(dx,dz)*step,k=key(x,z);if(g>=(seen.get(k)??Infinity))continue;
    const edgeKey=key(n.x,n.z)+'>'+k;if(!edges.has(edgeKey)){const pass=clear(p,q);edges.set(edgeKey,pass);edges.set(k+'>'+key(n.x,n.z),pass);}if(!edges.get(edgeKey))continue;
    seen.set(k,g);open.push({x,z,g,f:g+Math.hypot(q.x-to.x,q.z-to.z),prev:n});
   }
  }return[];
 };
}
