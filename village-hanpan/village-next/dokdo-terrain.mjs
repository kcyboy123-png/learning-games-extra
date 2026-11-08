// Photo-informed game terrain, not surveyed elevation data. Keep the save grid unchanged.
import {mappedCoastlines} from './dokdo-geography.mjs';
export const coastlines=mappedCoastlines;
export function insideCoast(p,x,z){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
export function coastDistance(p,x,z){let best=Infinity;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a[0]-u*dx,z-a[1]-u*dz));}return best;}
const gauss=(x,z,cx,cz,sx,sz)=>Math.exp(-((x-cx)**2/sx**2+(z-cz)**2/sz**2));
export function naturalHeight(x,z){
 const side=coastlines.findIndex(p=>insideCoast(p,x,z));if(side<0)return -.9;
 const coast=coastDistance(coastlines[side],x,z),edge=Math.min(1,coast/1.5);
 let h;if(side===0){
  h=1.6+14.5*gauss(x,z,-12,-4,5.2,8.4)+4.8*gauss(x,z,-15,-14,2.8,4.5);
 }else{
  h=2.8+6.5*gauss(x,z,13,-7,7.4,9.2)+1.3*gauss(x,z,17,1,4,5);
  h-=6.5*gauss(x,z,14,-2,1.7,2.2);
 }
 const strata=.16*Math.sin(z*2.6+x*.6)+.14*Math.sin(x*4.3-z*.4);
 return Math.max(.05,(h+strata)*edge);
}
// Relative facility positions follow KIOST's facility map, mapped to the existing game grid.
export const cliffSites={dokdoKeeper:[[16,11]],dokdoHome:[[6,8]],dokdoWeather:[[15,9]],dokdoSolar:[[16,10]]};
export const fixedTypes=new Set(Object.keys(cliffSites));
export const gardenTypes=['dokdoFlower','dokdoSedum','dokdoDeck','bench','flowerArch','fountain','dokdoTea','dokdoGuest','dokdoMemory','dokdoResearch','dokdoHistory','dokdoFlag'];
export const baseTrailCells=[...Array.from({length:14},(_,i)=>[i+3,12]),[3,11],[6,11],[13,11],[13,10],[15,11],[15,10],[7,11],[6,9],[3,10],[6,10],[15,13],[14,13],[14,14]];
// Fictional coastal walks use unbuildable water cells; existing building pockets stay intact.
export const coastalLevels=[];
export const coastalSet=new Set(coastalLevels.map(([x,y])=>`${x},${y}`));
// Saved starter roads remain in the save; only the useful lower connections stay visible.
export const trailCells=baseTrailCells.filter(([x,y])=>!['15,13','14,13','14,14'].includes(`${x},${y}`));
export const trailSet=new Set(trailCells.map(p=>p.join(',')));
const surface=new Map();
for(let gx=2;gx<18;gx++)for(let gy=0;gy<18;gy++){
 const x=(gx-8.5)*2.4,z=(gy-8.5)*2.4,hs=[[0,0],[-.95,-.95],[-.95,.95],[.95,-.95],[.95,.95]].map(([dx,dz])=>naturalHeight(x+dx,z+dz));
 surface.set(`${gx},${gy}`,{low:Math.min(...hs),high:Math.max(...hs),center:hs[0]});
}
export const plotSurface=(gx,gy)=>surface.get(`${gx},${gy}`)||{low:-.9,high:-.9};
const reserved=new Set(Object.values(cliffSites).flat().map(p=>p.join(',')));
export function freePlot(gx,gy){const p=plotSurface(gx,gy);return p.center>.5&&p.high<14&&p.high-Math.max(0,p.low)<6.8&&!trailSet.has(`${gx},${gy}`)&&!reserved.has(`${gx},${gy}`);}
export const gardenSites=[...surface.keys()].map(k=>k.split(',').map(Number)).filter(([x,y])=>freePlot(x,y));
export const slotCells=[...Object.values(cliffSites).flat(),...gardenSites];
const deckLevels=new Map();
for(let x=2;x<18;x++)for(let y=0;y<18;y++)deckLevels.set(`${x},${y}`,Math.max(.8,naturalHeight((x-8.5)*2.4,(y-8.5)*2.4)+.18));
// A low arch between natural shoulders leaves the channel open beneath it.
for(let x=7;x<=12;x++)deckLevels.set(`${x},12`,2.4+Math.sin((x-7)/5*Math.PI)*.65);
for(const [x,y,h]of [[3,12,5.0],[4,12,4.7],[5,12,4.1],[6,12,3.4],[3,11,5.1],[6,11,4.6],[7,11,3.2],[13,11,4.5],[13,10,6.0],[15,11,4.6],[15,10,6.0],[3,10,5.1],[6,10,6.2],[6,13,3.2],[13,9,7.8],[15,9,7.5],[15,13,2.8],[16,14,1],[14,14,1],[14,13,1.4],[13,12,3.0],[14,12,2.3],[15,12,2.9],[16,12,2.2],[12,13,2.4]])deckLevels.set(`${x},${y}`,h);
for(const [x,y,h]of coastalLevels)deckLevels.set(`${x},${y}`,h);
export const deckHeight=(x,y)=>trailSet.has(`${x},${y}`)?deckLevels.get(`${x},${y}`)??.8:Math.max(.15,plotSurface(x,y).high+.10);
// Continuous hillside walks share one graph for drawing, picking, foot height and navigation.
export const walkNodes=trailCells.map(([x,y])=>({x:(x-8.5)*2.4,z:(y-8.5)*2.4,y:deckHeight(x,y),kind:'lower'}));
export const walkEdges=[];
const baseIndex=new Map(trailCells.map((p,i)=>[p.join(','),i]));
for(let i=0;i<trailCells.length;i++){const [x,y]=trailCells[i];for(const [dx,dy]of [[1,0],[0,1]]){const j=baseIndex.get(`${x+dx},${y+dy}`);if(j!==undefined)walkEdges.push({a:i,b:j,width:y===12&&x>=7&&x<12?1.55:1.25});}}
const addWalk=(start,points,end,kind)=>{let previous=baseIndex.get(start.join(','));for(const [x,y,z]of points){const next=walkNodes.length;walkNodes.push({x,y,z,kind});walkEdges.push({a:previous,b:next,width:1.05});previous=next;}if(end)walkEdges.push({a:previous,b:baseIndex.get(end.join(',')),width:1.05});};
addWalk([6,10],[[-8,7,1.1],[-8.5,8.3,1.05],[-9.25,10.4,.15],[-10.45,12.6,-.4],[-13.3,14.8,-2.4],[-12.95,16.2,-4],[-12.2,15,-6.8],[-10.9,12.8,-8.05],[-11.65,10.1,-10.65],[-12.25,9.1,-12.05],[-13.5,10.2,-10.3],[-14.05,12.1,-6.85],[-15.7,10.7,-3.1],[-16.05,8.6,-.45],[-15.7,7.5,1.5],[-15.15,6.2,3.3]],[3,10],'seodo');
addWalk([13,10],[[10.8,6.4,.55],[10.45,7,-2.05],[9.8,7.5,-3.35],[9.45,8.1,-6.05],[9.75,8.7,-8.55],[11.1,9,-9.4],[12.25,8.2,-11.75],[12.4,6.8,-12.8],[14.2,7.1,-10],[15.5,7.8,-8],[16.55,8.3,-6.05],[17.4,8,-3.1],[18.15,6.8,-3.9],[18.05,4.8,-.4],[20.75,3.3,3.45],[20.2,2.6,5.3],[19.8,2.3,7.4]],[16,12],'dongdo');
addWalk([14,12],[[11.1,1.3,11.15],[9,.27,13.9],[9,.27,15.1]],null,'pier');
// Short widened viewing stretches share the same collision and picking widths.
for(const id of [29,36,45,50]){walkNodes[id].lookout=true;for(const e of walkEdges)if(e.a===id||e.b===id)e.width=1.45;}
export function nearestWalk(x,z,height){
 let best=null,score=Infinity;
 for(let i=0;i<walkEdges.length;i++){const e=walkEdges[i],a=walkNodes[e.a],b=walkNodes[e.b],dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,u=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l)),px=a.x+u*dx,pz=a.z+u*dz,py=a.y+(b.y-a.y)*u,d=Math.hypot(x-px,z-pz),cost=d+(height===undefined?0:Math.max(0,Math.abs(py-height)-.30)*4);if(cost<score){score=cost;best={x:px,y:py,z:pz,d,u,edge:i,width:e.width};}}
 return best;
}
export const walkHeight=(x,z,height)=>nearestWalk(x,z,height)?.y??.8;
export function walkRoute(from,to){
 const start=nearestWalk(from.x,from.z,from.y),end=nearestWalk(to.x,to.z,to.y);if(!start||!end)return[];
 if(start.edge===end.edge)return[{x:end.x,y:end.y,z:end.z}];
 const dist=new Map(),previous=new Map(),open=new Set(walkNodes.map((_,i)=>i)),edge=walkEdges[start.edge];
 for(const id of [edge.a,edge.b]){const n=walkNodes[id];dist.set(id,Math.hypot(n.x-start.x,n.z-start.z));previous.set(id,null);}
 while(open.size){let id=null,best=Infinity;for(const i of open)if((dist.get(i)??Infinity)<best){best=dist.get(i);id=i;}if(id===null)break;open.delete(id);for(const e of walkEdges){const next=e.a===id?e.b:e.b===id?e.a:null;if(next===null||!open.has(next))continue;const a=walkNodes[id],b=walkNodes[next],cost=best+Math.hypot(b.x-a.x,b.z-a.z,b.y-a.y);if(cost<(dist.get(next)??Infinity)){dist.set(next,cost);previous.set(next,id);}}}
 const target=walkEdges[end.edge];let id=[target.a,target.b].sort((a,b)=>(dist.get(a)+Math.hypot(walkNodes[a].x-end.x,walkNodes[a].z-end.z))-(dist.get(b)+Math.hypot(walkNodes[b].x-end.x,walkNodes[b].z-end.z)))[0];
 if(!dist.has(id))return[];const route=[];while(id!==null){route.push({x:walkNodes[id].x,y:walkNodes[id].y,z:walkNodes[id].z});id=previous.get(id);}route.reverse();route.unshift({x:start.x,y:start.y,z:start.z});route.push({x:end.x,y:end.y,z:end.z});return route.filter((p,i,a)=>i?Math.hypot(p.x-a[i-1].x,p.z-a[i-1].z)>.01:Math.hypot(p.x-from.x,p.z-from.z)>.01);
}
export function walkStep(p,v,distance){
 const n=Math.max(1,Math.ceil(distance/.04)),step=distance/n;let out={x:p.x,y:p.y,z:p.z,edge:p.walkEdge??nearestWalk(p.x,p.z,p.y).edge};
 for(let i=0;i<n;i++){
  let edge=walkEdges[out.edge],best=.35;
  // At a landing, follow the intended branch instead of jumping to an overlapping stair.
  for(const id of [edge.a,edge.b]){const node=walkNodes[id];if(Math.hypot(out.x-node.x,out.z-node.z)>edge.width/2+.08||Math.abs(out.y-node.y)>.65)continue;
   for(let k=0;k<walkEdges.length;k++){const e=walkEdges[k],other=e.a===id?e.b:e.b===id?e.a:null;if(other===null)continue;const b=walkNodes[other],dx=b.x-node.x,dz=b.z-node.z,d=Math.hypot(dx,dz),alignment=(dx*v.x+dz*v.z)/d;if(alignment>best){best=alignment;out.edge=k;}}
  }
  edge=walkEdges[out.edge];const a=walkNodes[edge.a],b=walkNodes[edge.b],dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,x=out.x+v.x*step,z=out.z+v.z*step,u=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l)),qx=a.x+u*dx,qz=a.z+u*dz,d=Math.hypot(x-qx,z-qz),limit=Math.max(.16,edge.width/2-.18),t=d>limit?limit/d:1;
  // Wide landings can meet a narrower stair: steer onto it without snapping sideways.
  const tx=qx+(x-qx)*t,tz=qz+(z-qz)*t,travel=Math.hypot(tx-out.x,tz-out.z),blend=travel>step?step/travel:1;
  const nx=out.x+(tx-out.x)*blend,nz=out.z+(tz-out.z)*blend,nu=Math.max(0,Math.min(1,((nx-a.x)*dx+(nz-a.z)*dz)/l));
  out={x:nx,y:out.y+Math.max(-step*2.6,Math.min(step*2.6,a.y+(b.y-a.y)*nu-out.y)),z:nz,edge:out.edge};
 }
 return out;
}
export function dokdoHeight(x,z){
 const h=naturalHeight(x,z);if(h<0)return h;const p=nearestWalk(x,z);
 // Carve only a narrow walking shelf, never flatten the whole construction grid cell.
 return p&&p.d<p.width/2+.12?Math.min(h,p.y-.15):h;
}
