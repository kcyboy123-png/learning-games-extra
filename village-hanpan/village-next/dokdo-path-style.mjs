import {naturalHeight,walkNodes,coastlines,slotCells} from './dokdo-terrain.mjs';
// Rock treads replace only supported paths; navigation widths and heights stay unchanged.
export function rockWalk(e){
 const a=walkNodes[e.a],b=walkNodes[e.b],n=Math.max(10,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.2));
 for(let i=0;i<=n;i++){const u=i/n,h=naturalHeight(a.x+(b.x-a.x)*u,a.z+(b.z-a.z)*u);if(h<.1||h<a.y+(b.y-a.y)*u-1.4)return false;}
 return true;
}
// Game-built stone abutments join existing offshore approaches to the nearest cliff.
export function bridgeFooting(e){
 const a=walkNodes[e.a],b=walkNodes[e.b];if(a.kind!=='lower'||b.kind!=='lower'||a.x*b.x<=0||a.z!==8.4||b.z!==8.4)return null;
 const outline=coastlines[a.x<0?0:1],near=p=>{let best=null;for(let i=0;i<outline.length;i++){const c=outline[i],d=outline[(i+1)%outline.length],dx=d[0]-c[0],dz=d[1]-c[1],t=Math.max(0,Math.min(1,((p.x-c[0])*dx+(p.z-c[1])*dz)/(dx*dx+dz*dz))),x=c[0]+t*dx,z=c[1]+t*dz,distance=Math.hypot(x-p.x,z-p.z);if(!best||distance<best.distance)best={x,z,distance};}return best;};
 const c=near(a),d=near(b);if(Math.max(c.distance,d.distance)>3.6||Math.min(c.distance,d.distance)<.1||Math.hypot(c.x-d.x,c.z-d.z)<.4)return null;
 const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),side=((c.x-a.x)*dz-(c.z-a.z)*dx)>0?-1:1,nx=dz/l*e.width*.5*side,nz=-dx/l*e.width*.5*side;
 const cx=(a.x+b.x)/2,radius=Math.abs(b.x-a.x)*.90,back=Math.max(Math.min(c.z,d.z),...slotCells.filter(([x,z])=>Math.abs((x-8.5)*2.4-cx)<radius+1.25&&(z-8.5)*2.4<a.z).map(([x,z])=>(z-8.5)*2.4+1.25));
 return [[a.x+nx,a.y-.18,a.z+nz],[b.x+nx,b.y-.18,b.z+nz],[d.x,b.y-.18,Math.max(back,d.z)],[c.x,a.y-.18,Math.max(back,c.z)]];
}

// A closed visual foundation; collision and navigation still use the original path.
export function bridgeFootingMesh(e){
 const footing=bridgeFooting(e);if(!footing)return null;
 const a=walkNodes[e.a],b=walkNodes[e.b],cx=(a.x+b.x)/2,cz=(a.z+b.z)/2,points=[],faces=[],n=8,back=Math.max(footing[2][2],footing[3][2]),depth=cz-back;
  for(let ring=0;ring<4;ring++)for(let k=0;k<n;k++){const t=k/n*Math.PI*2,spread=[.49,.57,.72,.84][ring]*(1+.15*Math.sin(k*2.1+cx)+.09*Math.cos(k*3.2-cx)),x=cx+(Math.cos(t)*spread+(ring===1?.04*Math.sin(cx):0))*(b.x-a.x),z=Math.max(back,cz+Math.sin(t)*[e.width*.45,.65+depth*.16,1.18+depth*.30,1.60+depth*.36][ring]-[0,depth*.1,depth*.2,depth*.3][ring]),u=Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x))),top=a.y+(b.y-a.y)*u-.18,y=ring===0?top:ring===1?top*(.61+.12*Math.sin(cx))-.16-.34*(1+Math.sin(k*1.7+cx)):ring===2?top*(.28+.10*Math.sin(cx*1.8))-.15:-.85;points.push([x,y,z]);}
  for(let k=1;k<n-1;k++){faces.push([0,k+1,k],[n*3,n*3+k,n*3+k+1]);}
  for(let ring=0;ring<3;ring++)for(let k=0;k<n;k++){const a=ring*n+k,b=ring*n+(k+1)%n;faces.push([a,b,b+n],[a,b+n,a+n]);}
 return {points,faces};
}

// Widen the visual bridge around the unchanged navigable strip, never subtract from it.
export function bridgeFlare(e,u){
 const a=walkNodes[e.a],b=walkNodes[e.b];
 if(e.width!==1.55||a.z!==8.4||b.z!==8.4)return 0;
 const t=Math.max(0,Math.min(1,(a.x+(b.x-a.x)*u+3.6)/12));
 return .18*Math.sin(t*Math.PI)**2+.44*Math.sin(t*Math.PI*2)**2;
}

export function bridgeDrift(e,u){
 const a=walkNodes[e.a],b=walkNodes[e.b],t=(a.x+(b.x-a.x)*u+3.6)/12;
 return bridgeFlare(e,u)*.42*Math.sin(t*Math.PI*2+.12);
}
