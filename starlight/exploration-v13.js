'use strict';
(()=>{
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 function project(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;return[a[0]+t*dx,a[1]+t*dy];}
 function nearest(map,p){let best={d:Infinity};for(const[a,b]of map.edges){const xy=project(p,map.nodes[a],map.nodes[b]),d=distance(p,xy);if(d<best.d)best={d,xy,a,b};}return best;}
 function constrain(map,p,inset=0){const road=nearest(map,p),radius=map.radius-inset;if(road.d<=radius)return[...p];return road.xy.map((v,i)=>v+(p[i]-v)*radius/road.d);}
 function clearLine(map,a,b){const n=Math.max(1,Math.ceil(distance(a,b)/2));for(let i=0;i<=n;i++){const p=a.map((v,j)=>v+(b[j]-v)*i/n);if(nearest(map,p).d>map.radius-1.1)return false;}return true;}
 function nodePath(map,start,end){const cost=map.nodes.map(()=>Infinity),prev={},todo=new Set(map.nodes.map((_,i)=>i));cost[start]=0;while(todo.size){const u=[...todo].sort((a,b)=>cost[a]-cost[b])[0];todo.delete(u);if(u===end)break;for(const[a,b]of map.edges){const v=a===u?b:b===u?a:null;if(v!==null&&todo.has(v)){const n=cost[u]+distance(map.nodes[u],map.nodes[v]);if(n<cost[v]){cost[v]=n;prev[v]=u;}}}}const path=[end];while(path[0]!==start&&prev[path[0]]!==undefined)path.unshift(prev[path[0]]);return path.map(i=>map.nodes[i]);}
 function route(map,start,point){const target=constrain(map,point,2);if(clearLine(map,start,target))return[target];const from=nearest(map,start),to=nearest(map,target);let best=[],cost=Infinity;for(const a of[from.a,from.b])for(const b of[to.a,to.b]){const points=[start,from.xy,...nodePath(map,a,b),to.xy,target];let length=0;for(let i=1;i<points.length;i++)length+=distance(points[i-1],points[i]);if(length<cost){cost=length;best=points;}}const result=[];let i=0;while(i<best.length-1){let j=best.length-1;while(j>i+1&&!clearLine(map,best[i],best[j]))j--;if(distance(best[i],best[j])>.01)result.push([...best[j]]);i=j;}return result;}
 window.STAR_EXPLORATION={distance,nearest,constrain,clearLine,route,collectRadius:38,glowRadius:200};
})();
