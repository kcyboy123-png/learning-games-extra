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
export const coastalLevels=[[2,11,4.8],[2,12,4.4],[2,13,4.0],[17,12,2.1],[17,11,2.1],[16,13,1.8],[16,14,1.2],[15,14,1.1],[3,13,4.2],[4,13,4.4],[17,13,1.8],[17,14,1.3]];
export const coastalSet=new Set(coastalLevels.map(([x,y])=>`${x},${y}`));
export const trailCells=[...baseTrailCells,...coastalLevels.map(([x,y])=>[x,y])];
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
// Extend trail elevations sideways once; off-path cliff heights must never affect feet.
const walkingLevels=new Map();
for(let x=0;x<=20;x++)for(let y=-2;y<=20;y++){
 let distance=Infinity,height=0,count=0;
 for(const [tx,ty]of trailCells){const d=(tx-x)**2+(ty-y)**2;if(d<distance){distance=d;height=deckHeight(tx,ty);count=1;}else if(d===distance){height+=deckHeight(tx,ty);count++;}}
 walkingLevels.set(`${x},${y}`,height/count);
}
export function walkHeight(x,z){
 const gx=x/2.4+8.5,gy=z/2.4+8.5,cx=Math.floor(gx),cy=Math.floor(gy);
 const blend=v=>Math.max(0,Math.min(1,(v-.2)/.6)),u=blend(gx-cx),v=blend(gy-cy);
 const h=(dx,dy)=>walkingLevels.get(`${cx+dx},${cy+dy}`)??.8;
 return (h(0,0)*(1-u)+h(1,0)*u)*(1-v)+(h(0,1)*(1-u)+h(1,1)*u)*v;
}
export function dokdoHeight(x,z){
 let h=naturalHeight(x,z);if(h<0)return h;
 const gx=Math.round(x/2.4+8.5),gy=Math.round(z/2.4+8.5),dx=Math.abs(x-(gx-8.5)*2.4),dz=Math.abs(z-(gy-8.5)*2.4);
 if(trailSet.has(`${gx},${gy}`)&&(dx<1.02||dz<1.02))h=Math.min(h,walkHeight(x,z)-.16);
 return h;
}



