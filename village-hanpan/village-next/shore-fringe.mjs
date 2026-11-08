import * as T from '../lib/three.module.min.js';
import {coastSurface} from './coast-surface.mjs?v=living15';

// A low outer skin follows the existing grass silhouette; no playable ground is raised.
export function createShoreFringe(){
 const positions=[],colors=[],color=new T.Color();
 const bands=[[.055,.025,'#9cbd6e'],[.22,.025,'#9cbd6e'],[.32,-.35,'#baa987'],[.56,-.74,'#8da89c']];
 for(const [cx,w,seed] of [[-8.4,26.5,4.7],[14.4,14.5,1.9]]){
  const edge=t=>{const cs=Math.cos(t),sn=Math.sin(t),k=1+.018*(Math.sin(seed+t*3)*.5+Math.sin(seed*1.7+t*5)*.3+Math.sin(seed*2.3+t*11)*.2);return [cx+Math.sign(cs)*Math.abs(cs)**.5*w/2*k,Math.sign(sn)*Math.abs(sn)**.5*43.3/2*k];};
  const sample=(i,band)=>{const t=i/192*Math.PI*2,p=edge(t),a=edge(t-.005),b=edge(t+.005),dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),lobe=4*Math.exp(-(((p[1]+12)/4)**2))*T.MathUtils.smoothstep(Math.abs(p[0]),19,21)+5*Math.exp(-(((p[0]-cx-2)/4.2)**2))*T.MathUtils.smoothstep(-p[1],18,21),width=band[0]*(1+.18*Math.sin(t*13+seed))*(band[0]===.055?1:1+lobe);return [p[0]+dz/length*width,band[1],p[1]-dx/length*width];};
  const add=(i,band)=>{positions.push(...sample(i,band));color.set(band[2]);colors.push(color.r,color.g,color.b);};
  for(let i=0;i<192;i++){if(i<96||Math.abs(edge((i+.5)/192*Math.PI*2)[0]-6)<2)continue;for(let j=0;j<bands.length-1;j++){
   add(i,bands[j]);add(i+1,bands[j]);add(i,bands[j+1]);add(i,bands[j+1]);add(i+1,bands[j]);add(i+1,bands[j+1]);
  }}
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.userData.owned=true;
 const material=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,...coastSurface('rock')});material.userData.owned=true;
 const fringe=new T.Mesh(geometry,material);fringe.name='mainland-shore-fringe';fringe.receiveShadow=true;return fringe;
}
