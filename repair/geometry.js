'use strict';
window.MathLab = (() => {
 const S=[[0,0],[3,0],[3,1],[2,1],[2,3],[0,3]], T=[[0,0],[4,0],[4,1],[3,1],[3,2],[1,2],[1,3],[0,3]];
 const shapes={S,T,practiceTriangle:[[0,0],[8,0],[0,6]],P:[[0,0],[6,0],[8,2*Math.sqrt(3)],[2,2*Math.sqrt(3)]],Q:[[0,0],[4,0],[6,2],[2,2]],R:[[0,0],[3,0],[3,4],[0,8],[-3,8],[-3,4]],triangle:[[0,0],[4,0],[0,3]],square:[[-2,-2],[2,-2],[2,2],[-2,2]],rectangle:[[-3,-2],[3,-2],[3,2],[-3,2]],equilateral:[[-2,-2/Math.sqrt(3)],[2,-2/Math.sqrt(3)],[0,4/Math.sqrt(3)]],isosceles:[[-2,-1.5],[2,-1.5],[0,1.5]],trapezoid:[[-3,-2],[3,-2],[1.5,2],[-1.5,2]],kite:[[0,0],[1,4],[4,4],[4,1]]};
 const near=(a,b,e=1e-5)=>Math.abs(a-b)<e;
 const eq=(a,b,e=1e-5)=>!!a&&!!b&&near(a[0],b[0],e)&&near(a[1],b[1],e);
 function center(poly){const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2]}
 function centered(poly){const c=center(poly);return poly.map(p=>[p[0]-c[0],p[1]-c[1]])}
 function rotate(p,deg,c=[0,0]){const a=deg*Math.PI/180,x=p[0]-c[0],y=p[1]-c[1];return[c[0]+x*Math.cos(a)-y*Math.sin(a),c[1]+x*Math.sin(a)+y*Math.cos(a)]}
 function reflect(p,axis){if(axis.kind==='v')return[2*axis.at-p[0],p[1]];if(axis.kind==='h')return[p[0],2*axis.at-p[1]];if(axis.kind==='d')return[p[1],p[0]];return[-p[1],-p[0]]}
 function samePoly(a,b){if(a.length!==b.length)return false;for(let i=0;i<b.length;i++){if(a.every((p,j)=>eq(p,b[(i+j)%b.length]))||a.every((p,j)=>eq(p,b[(i-j+b.length)%b.length])))return true}return false}
 function transform(poly,turn=0,flip=false){return poly.map(p=>rotate([flip?-p[0]:p[0],p[1]],turn))}
 function congruent(a,b){const x=centered(a),y=centered(b);return[0,90,180,270].some(d=>samePoly(transform(x,d),y)||samePoly(transform(x,d,true),y))}
 function reflectionSymmetry(poly,axis){return samePoly(poly,poly.map(p=>reflect(p,axis)))}
 function centralSymmetry(poly,c=center(poly)){return samePoly(poly,poly.map(p=>rotate(p,180,c)))}
 function bounds(poly,pad=1){let xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return[Math.floor(Math.min(...xs)-pad),Math.ceil(Math.max(...xs)+pad),Math.floor(Math.min(...ys)-pad),Math.ceil(Math.max(...ys)+pad)]}
 function perimeter(poly){return poly.reduce((n,p,i)=>n+Math.hypot(p[0]-poly[(i+1)%poly.length][0],p[1]-poly[(i+1)%poly.length][1]),0)}
 return {shapes,near,eq,center,centered,rotate,reflect,samePoly,transform,congruent,reflectionSymmetry,centralSymmetry,bounds,perimeter};
})();
