import * as T from '../lib/three.module.min.js';
import {coastSurface} from './coast-surface.mjs?v=living15';
import {surfaceTime,surfaceOptions} from './surfaces.mjs?v=perf1';

// The existing grass edge is the inner boundary. Everything slopes outward, never into a plot.
export function createFrontCoast(){
 const group=new T.Group();group.name='mainland-front-coast';
 const positions=[],shoreUV=[],colors=[],indices=[],waterPositions=[],waterUV=[],waterIndices=[],stones=[],grass=[];
 const color=new T.Color(),n=96,bands=[[0,.075,'#9cbd6e'],[.42,.075,'#9cbd6e'],[.60,-.10,'#e8d2a7'],[.80,-.32,'#d4c4a4'],[1,-.64,'#9fb7ad'],[1.32,-.94,'#648e87']];
 for(const [cx,w,seed]of[[-8.4,26.5,4.7],[14.4,14.5,1.9]]){
  const edge=t=>{const cs=Math.cos(t),sn=Math.sin(t),k=1+.018*(Math.sin(seed-t*3)*.5+Math.sin(seed*1.7-t*5)*.3+Math.sin(seed*2.3-t*11)*.2);return[cx+Math.sign(cs)*Math.abs(cs)**.5*w/2*k,Math.sign(sn)*Math.abs(sn)**.5*43.3/2*k];};
  // Equal-distance samples avoid a straight, undersampled shoreline at the long sides.
  const samples=[{p:edge(0),d:0}];for(let j=1;j<=512;j++){const p=edge(j/512*Math.PI),last=samples.at(-1);samples.push({p,d:last.d+Math.hypot(p[0]-last.p[0],p[1]-last.p[1])});}
  const at=u=>{const d=Math.max(0,Math.min(1,u))*samples.at(-1).d;let j=1;while(j<samples.length-1&&samples[j].d<d)j++;const a=samples[j-1],b=samples[j],v=(d-a.d)/(b.d-a.d);return[a.p[0]+(b.p[0]-a.p[0])*v,a.p[1]+(b.p[1]-a.p[1])*v];};
  const start=positions.length/3,ws=waterPositions.length/3;
  for(let i=0;i<=n;i++){
   const t=i/n*Math.PI,p=at(i/n),a=at(i/n-.001),b=at(i/n+.001),len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/len,nz=-(b[0]-a[0])/len;
   const front=Math.max(T.MathUtils.smoothstep(p[1],8,18),T.MathUtils.smoothstep(Math.abs(p[0]),19.5,21.5)*(.70+.25*Math.sin(p[1]*.28+seed))*T.MathUtils.smoothstep(p[1],0,5)),pocket=.5+.5*Math.sin(p[0]*.44+p[1]*.29+seed),headland=Math.max(Math.exp(-(((p[0]+18)/4)**2+((p[1]-20)/4)**2)),Math.exp(-(((p[0]-21)/3)**2+((p[1]-11)/4)**2)),Math.exp(-(((p[0]-15)/4)**2+((p[1]-22)/3)**2))),rawWidth=.32+front*(.35+.65*pocket+5.8*Math.exp(-(((p[0]+15.8)/3.35)**2+((p[1]-21)/4)**2))+4.4*Math.exp(-(((p[0]+4)/2.7)**2+((p[1]-22)/4)**2))+6.6*Math.exp(-(((p[0]-17.8)/3.05)**2+((p[1]-22)/4)**2))+6.7*Math.exp(-(((p[0]-22)/2)**2+((p[1]-9)/4.1)**2))+4.2*Math.exp(-(((p[0]+22)/2)**2+((p[1]-13)/3.5)**2)));
   const scallop=1+front*(.42*Math.sin(p[0]*.43+p[1]*.19+seed)+.16*Math.sin(p[0]*1.13-p[1]*.41));
   const width=scallop*T.MathUtils.lerp(Math.min(rawWidth,Math.max(.18,(Math.abs(p[0]-6)-1.25)/1.32)),rawWidth,T.MathUtils.smoothstep(Math.abs(p[0]-6),3,6));const river=Math.abs(p[0]-6)<2&&p[1]<19;let grassTop;
   for(const [r,y,c]of bands){const rock=1-T.MathUtils.smoothstep(pocket,.18,.60),landR=r===0?-.10:r===.42?Math.max(.10,Math.min(.57,.22+.14*rock+.13*headland+.08*Math.sin(p[0]*.58+p[1]*.31))):r===.60?.65+.13*pocket:r===.80?.80+.055*Math.sin(p[0]*.9+p[1]*.5):r;const px=p[0]+nx*width*landR,pz=p[1]+nz*width*landR,outside=T.MathUtils.smoothstep(Math.max(Math.abs(px),Math.abs(pz)),21.65,22.25),rise=r>0&&r<1?.40*headland*(.72+.28*rock)*outside*Math.sin(r*Math.PI):0;positions.push(px,Math.min(.075,y+(r>.42?rock*.22*Math.sin(r*Math.PI):0))+rise+(r===.42?.025*outside:0),pz);shoreUV.push(px-cx,-pz);color.set(c);if(r===.42)color.lerp(new T.Color('#91aa68'),pocket*.30);if(r===.60)color.lerp(new T.Color('#8e9384'),rock*.68);if(r>.42&&r<1)color.lerp(new T.Color('#a4a798'),rock*.48);if(r>.42&&rise>.05)color.lerp(new T.Color('#a8aa8c'),headland*.65);color.multiplyScalar(.97+.03*Math.sin(t*9+seed));colors.push(color.r,color.g,color.b);if(r===.42)grassTop={x:px,y:positions[positions.length-2],z:pz};}
   for(const r of[1,1.6,3]){waterPositions.push(p[0]+nx*(width*r+(r-1)*1.2),-.635,p[1]+nz*(width*r+(r-1)*1.2));waterUV.push(i/n,r);}
   if(i<n&&!river){for(let j=0;j<bands.length-1;j++){const k=start+i*bands.length+j;indices.push(k,k+bands.length,k+1,k+1,k+bands.length,k+bands.length+1);}for(let j=0;j<2;j++){const k=ws+i*3+j;waterIndices.push(k,k+3,k+1,k+1,k+3,k+4);}}
   if(front>.4&&!river&&Math.abs(p[0]-6)>3.4&&(pocket<.55||headland>.50)&&i%2===0){
    const r=(.62+.75*(.5+.5*Math.sin(i*2.31)))*(1+headland*.25),offset=.60+.30*(.5+.5*Math.sin(i*7.8));
    stones.push({x:p[0]+nx*width*offset,z:p[1]+nz*width*offset,y:-.07-offset*.12+headland*.30,r,angle:t+i,color:i%3?'#bcb6a6':'#a2aaa0'});
    stones.push({x:p[0]+nx*(width*offset+.45)+nz*.2,z:p[1]+nz*(width*offset+.45)-nx*.2,y:-.38,r:r*.62,angle:i*1.7,color:'#829d9c'});
   }
   if(front>.3&&!river&&i%3===0&&Math.sin(i*.47+seed)>.1)grass.push({...grassTop,scale:.95+.85*(.5+.5*Math.sin(i*5))});
  }
 }
 // Curved mouth banks share the shore mesh and stay in the river strip or beyond the build grid.
 for(const side of [-1,1]){const start=positions.length/3;
  for(let i=0;i<=15;i++){const z=16+i*.55,flare=T.MathUtils.smoothstep(z,20,25),bank=1.12+flare*(side<0?2.10:2.85)+(.12+flare*.32)*Math.sin(z*.65+side)+.06*Math.sin(z*1.6),sink=T.MathUtils.smoothstep(z,19.8,24.8)*1.12;
   for(const [offset,y,c]of [[.53,.055,'#9cbd6e'],[.10,-.18,'#d4c8a7'],[-.18,-.43,'#c0c5aa'],[-.36,-.73,'#749a90']]){positions.push(6+side*(bank+offset)+1.15*flare*flare,y-sink,z);shoreUV.push(6+side*(bank+offset)+1.15*flare*flare-(side<0?-8.4:14.4),-z);color.set(c);colors.push(color.r,color.g,color.b);}
   if(i<15)for(let j=0;j<3;j++){const k=start+i*4+j;if(side<0)indices.push(k,k+4,k+1,k+1,k+4,k+5);else indices.push(k,k+1,k+4,k+1,k+5,k+4);}
  }
 }
 const fanStart=waterPositions.length/3;
 for(let row=0;row<=12;row++){const z=20.4+row*.6,w=.80+T.MathUtils.smoothstep(z,21,27)*3.65;for(let col=0;col<=8;col++){waterPositions.push(6+T.MathUtils.smoothstep(z,21,27)*1.15+(col/4-1)*w,-.585,z);waterUV.push(-2+col/8,1.2+row/12*1.8);if(row<12&&col<8){const k=fanStart+row*9+col;waterIndices.push(k,k+9,k+1,k+1,k+9,k+10);}}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(shoreUV,2));geo.setIndex(indices);geo.computeVertexNormals();geo.userData.owned=true;
 // Match the flat meadow normal at the seam, then retain the beach slope outward.
 const normals=geo.attributes.normal,up=new T.Vector3(0,1,0),blend=new T.Vector3();
 for(let i=0;i<2*(n+1)*bands.length;i++){const band=i%bands.length;if(band>1)continue;blend.fromBufferAttribute(normals,i).lerp(up,band===0?1:.80).normalize();normals.setXYZ(i,blend.x,blend.y,blend.z);}

 const material=new T.MeshStandardMaterial({vertexColors:true,map:typeof document==='undefined'?null:surfaceOptions('#9cbd6e').map,...coastSurface('sand')});material.userData.owned=true;
 // Reuse the meadow map at its original UV scale only on the grassy lip, not the sand.
 const shoreCompile=material.onBeforeCompile;material.onBeforeCompile=shader=>{shoreCompile(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('diffuseColor *= sampledDiffuseColor;','diffuseColor *= mix(vec4(1.),sampledDiffuseColor,smoothstep(.025,.09,vColor.g-vColor.r));'));};
 material.customProgramCacheKey=()=> 'front-meadow-join-living15';
 const shore=new T.Mesh(geo,material);shore.receiveShadow=true;shore.name='front-connected-shore';group.add(shore);
 const rockGeo=new T.IcosahedronGeometry(1,1),ra=rockGeo.attributes.position;
 // Flatten the crest and vary the base: a low rock outcrop, rather than an egg-shaped pebble.
 for(let i=0;i<ra.count;i++){const x=ra.getX(i),y=ra.getY(i),z=ra.getZ(i),k=1+.12*Math.sin(x*4+z*3);ra.setXYZ(i,x*k,Math.min(.55+.18*x+.12*Math.sin(z*4),y)*.92,z*(1+.16*Math.sin(x*3-y*2)));}
 rockGeo.computeVertexNormals();
 const rn=rockGeo.attributes.normal,rc=[];
 for(let i=0;i<ra.count;i++){const normal=new T.Vector3().fromBufferAttribute(rn,i),soft=new T.Vector3(ra.getX(i),ra.getY(i)*1.3,ra.getZ(i)).normalize();normal.lerp(soft,.40).normalize();rn.setXYZ(i,normal.x,normal.y,normal.z);const shade=.64+.36*T.MathUtils.smoothstep(ra.getY(i),-.7,.5);color.setRGB(shade,shade,shade);if(ra.getY(i)>.25&&Math.sin(ra.getX(i)*4+ra.getZ(i)*3)>.3)color.lerp(new T.Color('#9dae85'),.18);rc.push(color.r,color.g,color.b);}
 rockGeo.setAttribute('color',new T.Float32BufferAttribute(rc,3));rockGeo.computeBoundingBox();rockGeo.userData.owned=true;
 const rockMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.94,...coastSurface('rock')});rockMaterial.userData.owned=true;
 const rockSites=Array.from({length:Math.min(58,stones.length)},(_,i)=>stones[Math.min(stones.length-1,Math.floor(i*(stones.length-1)/Math.max(1,Math.min(58,stones.length)-1)))]);
 const rocks=new T.InstancedMesh(rockGeo,rockMaterial,rockSites.length),pose=new T.Object3D();
 rockSites.forEach((site,i)=>{const s={...site,r:Math.min(1.15,site.r*(.48+.62*(.5+.5*Math.sin(i*2.399+site.x*.17))))};pose.position.set(s.x,s.y,s.z);pose.rotation.set(.06*Math.sin(s.x*.7),s.angle+.16*Math.sin(s.z),.19*Math.cos(s.z*.5));pose.scale.set(s.r*(1.38+.30*Math.sin(s.angle*2)),s.r*(.86+.24*Math.sin(s.angle*3)),s.r*(1.02+.20*Math.cos(s.angle*2)));pose.updateMatrix();
  // Keep the complete rock bounding box beyond the original rectangular building grid.
  const bounds=rockGeo.boundingBox.clone().applyMatrix4(pose.matrix),limit=21.65;
  if(bounds.max.x>-limit&&bounds.min.x<limit&&bounds.min.z<limit){
   const dz=limit-bounds.min.z,dx=s.x<0?-limit-bounds.max.x:limit-bounds.min.x;
   if(Math.abs(s.x)>12&&Math.abs(dx)<dz)pose.position.x+=dx;else pose.position.z+=dz;if(Math.min(Math.abs(dx),dz)>.45){pose.position.y-=.14;pose.scale.multiplyScalar(.65);}pose.updateMatrix();
  }
  rocks.setMatrixAt(i,pose.matrix);rocks.setColorAt(i,color.set(s.color));});rocks.receiveShadow=true;rocks.name='front-headland-stones';group.add(rocks);
 const gp=[],gc=[];
 for(const p of grass)for(let j=0;j<5;j++){
  const a=j*2.4+p.x,dx=Math.cos(a),dz=Math.sin(a),h=(.18+j%3*.075)*p.scale,w=.075*p.scale;
  const y=p.y+.01,left=[p.x-dz*w,y,p.z+dx*w],right=[p.x+dz*w,y,p.z-dx*w],tip=[p.x+dx*.28+.05,h+y,p.z+dz*.23];
  for(const q of[left,right,tip]){gp.push(...q);color.set(q===tip?'#c2ca81':'#7f9b55');gc.push(color.r,color.g,color.b);}
 }
 const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));gg.setAttribute('color',new T.Float32BufferAttribute(gc,3));gg.computeVertexNormals();gg.userData.owned=true;
 const gm=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});gm.userData.owned=true;const tufts=new T.Mesh(gg,gm);tufts.receiveShadow=true;tufts.name='front-dune-grass';group.add(tufts);
 const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(waterPositions,3));wg.setAttribute('uv',new T.Float32BufferAttribute(waterUV,2));wg.setIndex(waterIndices);wg.userData.owned=true;
 const wm=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{clock:surfaceTime},vertexShader:`varying vec2 vUv; varying vec2 shoreXZ; void main(){vUv=uv;shoreXZ=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float clock; varying vec2 vUv; varying vec2 shoreXZ; void main(){float fade=1.-smoothstep(1.,3.,vUv.y);if(vUv.x<0.)fade*=sin((vUv.x+2.)*3.14159265)*.8*smoothstep(1.2,1.65,vUv.y);else fade*=smoothstep(0.,.05,vUv.x)*(1.-smoothstep(.95,1.,vUv.x));float ripple=sin(shoreXZ.x*1.7+shoreXZ.y*2.4-clock*.5);float depth=.5+.5*sin(shoreXZ.x*.45+shoreXZ.y*.32);float foam=(1.-smoothstep(.008,.04,abs(vUv.y-1.10-.065*sin(clock*.6+shoreXZ.x*.7+sin(shoreXZ.y*.4)))))*smoothstep(-.10,.65,sin(shoreXZ.x*.81+shoreXZ.y*.67+sin(shoreXZ.y*.8)))*smoothstep(.1,.7,sin(shoreXZ.x*3.7-shoreXZ.y*2.4));float sparkle=pow(max(0.,sin(shoreXZ.x*3.1+shoreXZ.y*1.6-clock*.5)),22.)*smoothstep(.45,.9,sin(shoreXZ.x*.32-shoreXZ.y*.25));vec3 c=mix(mix(vec3(.16,.49,.52),vec3(.36,.68,.60),depth),vec3(.82,.92,.88),foam*.54);c+=vec3(.11,.10,.06)*sparkle*smoothstep(1.15,1.8,vUv.y);gl_FragColor=vec4(c,(.075+depth*.09+ripple*.010+foam*.12)*fade);}`});wm.userData.owned=true;
 const wash=new T.Mesh(wg,wm);wash.name='front-tidal-water';group.add(wash);return group;
}
