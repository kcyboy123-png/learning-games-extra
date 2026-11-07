import * as T from './vendor/three.module.js';
import {shapes} from './assets/character-shapes-v5.mjs';
import {riverStones} from './assets/river-stones-20261102.mjs';

export const characterGeometry=Object.fromEntries(Object.entries(shapes).map(([name,data])=>{
  const g=new T.BufferGeometry();for(const [key,values] of Object.entries(data))g.setAttribute(key,new T.Float32BufferAttribute(values,key==='uv'?2:3));g.computeBoundingSphere();return [name,g];
}));

// The backpack has rounded shoulders; the original box stays unchanged for the bridge woodwork.
{
  const outline=new T.Shape();outline.moveTo(-.30,-.43);outline.lineTo(.30,-.43);
  outline.quadraticCurveTo(.43,-.43,.43,-.30);outline.lineTo(.41,.24);
  outline.bezierCurveTo(.40,.38,.32,.45,.21,.45);outline.lineTo(-.21,.45);
  outline.bezierCurveTo(-.32,.45,-.40,.38,-.41,.24);outline.lineTo(-.43,-.30);
  outline.quadraticCurveTo(-.43,-.43,-.30,-.43);
  const g=new T.ExtrudeGeometry(outline,{depth:.99,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:6,steps:1,curveSegments:8});
  g.translate(0,0,-.495);g.computeBoundingSphere();characterGeometry.backpack=g;
}

// One shared hand mesh keeps softly curled fingers attached to a rounded palm.
{
  const positions=[],normals=[],uv=[];
  const append=g=>{const flat=g.index?g.toNonIndexed():g;positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);uv.push(...flat.attributes.uv.array);if(flat!==g)flat.dispose();g.dispose();};
  append(new T.SphereGeometry(1,20,14).scale(.60,.59,.39).translate(0,.17,0));
  const fingers=[[-.36,-.75],[-.12,-.94],[.12,-.89],[.36,-.71]].map(([x,end])=>[[x,-.05,0],[x,end*.55,.025],[x,end,.16],[x,end+.055,.25]]);
  fingers.push([[-.40,.32,.02],[-.65,.08,.10],[-.68,-.18,.20],[-.57,-.27,.27]]);
  for(const [index,points] of fingers.entries()){
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),g=new T.TubeGeometry(curve,14,1,10,false),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const t=Math.floor(i/11)/14,c=curve.getPointAt(t),r=(index===4?.21:.18)*(1-.25*t)*Math.sqrt(Math.max(.0001,1-t*t));const v=new T.Vector3().fromBufferAttribute(p,i).sub(c).multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z);}
    g.computeVertexNormals();append(g);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeBoundingSphere();characterGeometry.hand.dispose();characterGeometry.hand=g;
}

// Soft shoulder taper, loose waist and rolled hems share the existing rig dimensions.
for(const [name,outline,depth] of [
  ['shirt',[[0,0],[.19,0],[.228,.024],[.231,.09],[.208,.23],[.218,.34],[.200,.39],[.153,.433],[.092,.46],[0,.46]],.77],
  ['shorts',[[0,-.236],[.106,-.236],[.115,-.225],[.116,-.201],[.114,-.190],[.123,-.12],[.119,-.04],[.107,.018],[0,.018]],1.06]
]){
  const profile=new T.SplineCurve(outline.map(v=>new T.Vector2(...v)));
  const g=new T.LatheGeometry(profile.getPoints(32),32),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z);
    const fold=name==='shirt'
      ?.015*Math.sin(a*5+y*5)*Math.exp(-Math.pow((y-.12)/.13,2))+.006*Math.cos(a*6+y*18)*Math.exp(-Math.pow((y-.31)/.08,2))
      :.006*Math.sin(a*4+y*10)*Math.exp(-Math.pow((y+.10)/.08,2));
    p.setXYZ(i,x+Math.sin(a)*fold,y,z*depth+Math.cos(a)*fold);
    const shade=(name==='shorts'&&y<-.192?.90:.96)+.04*Math.cos(a*5+y*9);colors.push(shade,shade,shade);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingSphere();characterGeometry[name].dispose();characterGeometry[name]=g;
}

// A continuous swept fringe replaces the bead-like bangs and repeated sawtooth edge.
{
  const positions=[],uv=[],colors=[],indices=[],sides=56,rings=18;
  const radius=(a,theta)=>.95+(.048*Math.cos(a*5+theta*1.4)+.018*Math.sin(a*9-theta))*Math.sin(theta)**2-.055*Math.max(0,-Math.cos(a))*T.MathUtils.smoothstep(theta,1.65,2.2);
  const point=(a,theta,r)=>[Math.sin(a)*Math.sin(theta)*r+.085*Math.sin(theta)**2-.075*Math.exp(-theta*theta/.4),Math.cos(theta)*(1+.12*Math.sin(a+.6)*Math.sin(theta))+.055*Math.exp(-Math.pow((theta-.45)/.30,2))*(.5+.5*Math.sin(a*2+.6)),Math.cos(a)*Math.sin(theta)*r*.96];
  for(let j=0;j<=rings;j++)for(let i=0;i<=sides;i++){
    const a=i/sides*Math.PI*2,front=(Math.cos(a)+1)/2,t=j/rings;
    const edge=2.04-.56*Math.pow(front,2)+.16*Math.sin(a*3+.6)*Math.pow(front,3)+.025*Math.sin(a*7+.4);
    const theta=.002+t*edge,sweep=a+.24*Math.sin(theta),wave=Math.cos(sweep*7+theta*.9);
    const r=radius(a,theta);
    positions.push(...point(a,theta,r));
    uv.push(i/sides,t);const shade=.94+.04*wave*Math.sin(theta);colors.push(shade,shade,shade);
    if(j<rings&&i<sides){const k=j*(sides+1)+i;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  }
  // Staggered overlapping layers avoid identical crown-to-neck segments.
  const locks=[[-0.86,0.12,1.86,0.27,-0.8],[-0.39,0.3,1.67,0.3,-0.62],[0.08,0.08,1.64,0.31,-0.8],[0.5,0.42,1.82,0.28,-0.52],[0.94,0.16,1.94,0.32,-0.7],[1.38,0.35,2.1,0.28,-0.58],[1.85,0.1,2.19,0.34,-0.7],[2.31,0.28,2.11,0.32,-0.54],[2.75,0.14,2.23,0.32,-0.82],[3.22,0.38,2.13,0.29,-0.55],[3.64,0.12,2.24,0.33,-0.7],[4.08,0.32,2.1,0.3,-0.58],[4.55,0.08,2.16,0.32,-0.82],[5.03,0.34,1.98,0.32,-0.54],[-0.15,0.08,1.2,0.23,-1.05],[0.72,0.15,1.3,0.24,-0.93],[1.7,0.06,1.38,0.27,-1.12],[2.65,0.19,1.23,0.25,-0.88],[3.68,0.07,1.4,0.27,-1.02],[4.62,0.16,1.28,0.23,-0.95]];
  for(const [lock,[center,start,end,widthMax,bend]] of locks.entries()){
    const base=positions.length/3;
    for(let j=0;j<=10;j++)for(let i=0;i<=6;i++){
      const t=j/10,u=i/3-1,theta=start+t*(end-start)-.18*u*u*t**5,width=.015+widthMax*(.32+.68*Math.sin(Math.PI*t)**.58);
      const a=center+bend*(1-t)**1.3+.10*Math.sin(Math.PI*t)+u*width;
      const baseRadius=radius(a,theta);
      const lift=.001+(lock<14?.11+.035*Math.sin(lock*1.4):.19)*Math.sin(Math.PI*t)**.85*Math.max(0,1-u*u)**1.1;
      const p=point(a,theta,baseRadius+lift);p[1]+=Math.cos(theta)*lift;positions.push(...p);
      uv.push(i/6,t);const shade=.82+.18*(1-u*u)+.025*Math.sin(lock*2);colors.push(shade,shade,shade);
      if(j<10&&i<6){const k=base+j*7+i;indices.push(k,k+7,k+1,k+1,k+7,k+8);}
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();characterGeometry.hair.dispose();characterGeometry.hair=g;
}
{
  const outline=new T.SplineCurve([[.025,-.375],[.045,-.355],[.057,-.31],[.066,-.26],[.069,-.22],[.077,-.16],[.078,-.11],[.053,-.095]].map(p=>new T.Vector2(...p)));
  const g=new T.LatheGeometry(outline.getPoints(24),20),indices=[],weights=[];
  for(let i=0;i<g.attributes.position.count;i++){
    const bend=T.MathUtils.smoothstep(-g.attributes.position.getY(i),.18,.29);
    indices.push(0,1,0,0);weights.push(1-bend,bend,0,0);
  }
  g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));g.computeBoundingSphere();characterGeometry.arm=g;
}
{
  const outline=new T.SplineCurve([[0,-.5],[.79,-.5],[.91,-.46],[.94,-.36],[.91,-.12],[.94,.14],[.84,.34],[.52,.48],[0,.51]].map(p=>new T.Vector2(...p)));
  const g=new T.LatheGeometry(outline.getPoints(28),24),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z),fold=.052*Math.sin(a*3+y*4)*Math.exp(-Math.pow((y+.22)/.25,2));
    p.setXYZ(i,x+Math.sin(a)*fold,y,z+Math.cos(a)*fold);
    const shade=.88+.12*T.MathUtils.smoothstep(y,-.50,.35);colors.push(shade,shade,shade);
  }
  g.computeVertexNormals();
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingSphere();characterGeometry.sleeve.dispose();characterGeometry.sleeve=g;
}
{
  const g=characterGeometry.head,p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),blush=Math.exp(-(((Math.abs(x)-.60)/.22)**2+((y+.27)/.20)**2))*Math.max(0,z);
    p.setXYZ(i,x*(1-.10*T.MathUtils.smoothstep(-y,.25,.95)),y,z+.024*blush);
    colors.push(1,1-blush*.32,1-blush*.32);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingSphere();
  // Exported triangles duplicate their corners; smooth their shared face normals after sculpting.
  const n=g.attributes.normal,shared=new Map(),keys=[];
  for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');keys.push(key);if(!shared.has(key))shared.set(key,new T.Vector3());shared.get(key).add(new T.Vector3().fromBufferAttribute(n,i));}
  for(let i=0;i<p.count;i++){const v=shared.get(keys[i]).clone().normalize();n.setXYZ(i,v.x,v.y,v.z);}

}

{
  const g=characterGeometry.shirt,p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const fold=Math.exp(-Math.pow((y-.065)/.055,2))*Math.sin(x*29+z*12)*.007;
    p.setY(i,y+.006*Math.sin(x*17+z*13)*Math.exp(-Math.pow(y/.08,2)));
    p.setZ(i,z+Math.sign(z)*fold);
    const underarm=.06*Math.exp(-Math.pow((y-.32)/.10,2))*T.MathUtils.smoothstep(Math.abs(x),.16,.22);
    const shade=.88+.12*(1-Math.min(1,Math.abs(x)/.25))+.02*Math.sin(y*40+x*25)-underarm;
    colors.push(shade,shade,shade);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingSphere();
}

// The bob uses the same swept layers, extended continuously below the ears.
{
  const g=characterGeometry.hair.clone(),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),lower=T.MathUtils.smoothstep(-y,0,.5);p.setXYZ(i,x*(1+.06*lower),Math.max(y*(y<0?1.15:1),-.55+.06*x*x),z*(1+.08*lower));}
  g.computeVertexNormals();g.computeBoundingSphere();characterGeometry.bob=g;
  const tail=new T.SphereGeometry(1,20,14),v=tail.attributes.position;
  for(let i=0;i<v.count;i++){const y=v.getY(i),t=(y+1)/2;v.setXYZ(i,v.getX(i)*(.48+.52*t),y,v.getZ(i)*(.55+.45*t)-.24*(1-t));}
  tail.computeVertexNormals();tail.computeBoundingSphere();characterGeometry.ponytail=tail;
}

// G06: one shared hat crown for the cap and the beanie. A sphere narrowed below the hair's widest point, so the swept
// locks cut through its rim and top; this dome keeps a vertical band for the lower 30% and an elliptical crown above,
// sized by the caller to enclose the full lock lift. capProfile(y) is the unit-dome radius for y in [0,1] (shared with tests).
export function capProfile(y){y=Math.max(0,Math.min(1,y));if(y<=.3)return 1-.012*Math.pow(1-y/.3,2);const t=(y-.3)/.7;return Math.sqrt(Math.max(0,1-t*t));}
{
  const points=[];
  for(const y of [1,.995,.98,.955,.92,.875,.82,.76,.69,.61,.52,.43,.34,.3,.2,.1,0])points.push(new T.Vector2(y>=1?0:capProfile(y),y));
  const g=new T.LatheGeometry(points.reverse(),28);g.computeBoundingSphere();characterGeometry.cap=g;
}

export function stoneStepGeometry(variant=0){
  const outline=new T.Shape();
  outline.moveTo(-.54,-.43);outline.quadraticCurveTo(-.69,-.39,-.64,-.20);
  outline.lineTo(-.60,.32+variant*.025);outline.quadraticCurveTo(-.57,.47,-.38,.44);
  outline.lineTo(.40,.42-variant*.025);outline.quadraticCurveTo(.65,.43,.62,.25);
  outline.lineTo(.66,-.25);outline.quadraticCurveTo(.65,-.47,.42,-.44);outline.lineTo(-.54,-.43);
  const g=new T.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:3});
  g.rotateX(-Math.PI/2);g.translate(0,-.13,0);
  const p=g.attributes.position,colors=[],c=new T.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    p.setXYZ(i,x+.055*Math.sin(z*13+variant),y+.004*Math.sin(x*12+z*13+variant),z+.060*Math.sin(x*9+variant));
    c.set(y<-.05?'#93958a':'#c9c4b2').multiplyScalar(.90+.10*Math.sin(x*8+z*7+variant));colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}

export function squirrelTailGeometry(){
  const curve=new T.CatmullRomCurve3([[0,0,0],[0,.20,-.18],[0,.46,-.27],[0,.67,-.16],[0,.71,.045]].map(p=>new T.Vector3(...p)));
  const g=new T.TubeGeometry(curve,24,1,16,false),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const t=Math.floor(i/17)/24,a=(i%17)/16*Math.PI*2,c=curve.getPointAt(t),v=new T.Vector3().fromBufferAttribute(p,i).sub(c);
    const r=.006+.245*Math.sin(Math.PI*t)**.50;
    v.multiplyScalar(r*(1+.035*Math.sin(a*7+t*23))).add(c);p.setXYZ(i,v.x,v.y,v.z);
    g.attributes.uv.setXY(i,(i%17)/16,t);
  }
  g.computeVertexNormals();
  const flat=g.toNonIndexed(),vertices=Array.from(flat.attributes.position.array),normals=Array.from(flat.attributes.normal.array),uv=Array.from(flat.attributes.uv.array);
  for(let i=0;i<180;i++){
    const row=3+i%19,side=(i*7)%16,index=row*17+side,t=row/24;
    const at=new T.Vector3().fromBufferAttribute(p,index),radial=at.clone().sub(curve.getPointAt(t)).normalize();
    const across=new T.Vector3().crossVectors(curve.getTangentAt(t),radial).normalize().multiplyScalar(.006);
    const tip=at.clone().addScaledVector(radial,.022+.018*(.5+.5*Math.sin(i*2.4))).addScaledVector(curve.getTangentAt(t),.045);
    for(const v of [at.clone().sub(across),at.clone().add(across),tip])vertices.push(v.x,v.y,v.z);
    for(let j=0;j<3;j++)normals.push(radial.x,radial.y,radial.z);
    uv.push(side/16,t,(side+.2)/16,t,side/16,t+.035);
  }
  const fur=new T.BufferGeometry();fur.setAttribute('position',new T.Float32BufferAttribute(vertices,3));fur.setAttribute('uv',new T.Float32BufferAttribute(uv,2));fur.setIndex(Array.from({length:vertices.length/3},(_,i)=>i));fur.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
  const colors=[];for(let i=0;i<vertices.length;i+=3){const y=vertices[i+1],shade=.78+.18*T.MathUtils.smoothstep(y,.1,.8)+.04*Math.sin(vertices[i]*63+y*49);colors.push(shade,shade*.96,shade*.89);}
  fur.setAttribute('color',new T.Float32BufferAttribute(colors,3));fur.computeBoundingSphere();flat.dispose();g.dispose();return fur;
}

export function cascadeGeometry(){
  const v=[],uv=[],indices=[];
  for(let j=0;j<=12;j++)for(let i=0;i<=24;i++){
    const u=i/24,t=j/12,drop=T.MathUtils.smoothstep(t,.15,.82);
    v.push((u-.5)*3.6,-drop+.16*Math.sin(u*23)*drop*(1-drop),.95*t);uv.push(u,t);
    if(j<12&&i<24){const k=j*25+i;indices.push(k,k+25,k+1,k+1,k+25,k+26);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

export async function forestMaterials(){
  const atlas=await new T.TextureLoader().loadAsync(new URL('./assets/forest-surfaces-20261102.png',import.meta.url).href),result={};
  for(const [name,x,y] of [['soil',0,0],['bark',1,0],['stone',0,1],['floor',1,1]]){
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d'),w=atlas.image.width/2,h=atlas.image.height/2;
    ctx.drawImage(atlas.image,x*w,y*h,w,h,0,0,512,512);
    const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;result[name]=t;
  }
  atlas.dispose();return result;
}

export function contactTexture(){
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(.24,'rgba(255,255,255,.48)');g.addColorStop(.60,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  return new T.CanvasTexture(c);
}

export function woodlandTree(variant=0){
  const positions=[],normals=[],uv=[],crowns=[];
  const trunk=new T.CatmullRomCurve3([[0,0,0],[.12-variant*.18,2,.04+variant*.10],[-.45+variant*.38,5,.25],[.35-variant*.35,7.4,-.12],[.16+variant*.2,10,.3]].map(p=>new T.Vector3(...p)));
  function limb(curve,start,end,steps=10,sides=7){
    const g=new T.TubeGeometry(curve,steps,1,sides,false),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const t=Math.floor(i/(sides+1))/steps,center=curve.getPointAt(t),r=end+(start-end)*Math.pow(1-t,.8),v=new T.Vector3().fromBufferAttribute(p,i).sub(center).multiplyScalar(r).add(center);p.setXYZ(i,v.x,v.y,v.z);}
    const tex=g.attributes.uv;for(let i=0;i<tex.count;i++){const along=tex.getX(i),around=tex.getY(i);tex.setXY(i,around,along*curve.getLength()/2.8);}
    g.computeVertexNormals();const flat=g.toNonIndexed();positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);uv.push(...flat.attributes.uv.array);flat.dispose();g.dispose();
  }
  limb(trunk,.48+variant*.11,.07+variant*.02,18,10);
  for(let i=0;i<7;i++){
    const t=[.43,.52,.57,.67,.71,.80,.85][i]+Math.sin(i*2+variant)*.018,start=trunk.getPointAt(t),a=i*2.399+variant*.75,len=1.65+(i%3)*.72+Math.sin(i+variant)*.35;
    const mid=start.clone().add(new T.Vector3(Math.cos(a)*len*.55,.35,Math.sin(a)*len*.55));
    const end=start.clone().add(new T.Vector3(Math.cos(a)*len,1.45+(i%2)*.5,Math.sin(a)*len));
    limb(new T.CatmullRomCurve3([start,mid,end]),.19-i*.012,.035,8,6);crowns.push({x:end.x,y:end.y,z:end.z,size:1.4+(i%3)*.28});
    if(i%2===0){const fork=mid.clone().add(new T.Vector3(Math.cos(a+.65)*len*.6,.85,Math.sin(a+.65)*len*.6));limb(new T.CatmullRomCurve3([mid,mid.clone().lerp(fork,.5),fork]),.09,.015,5,5);crowns.push({x:fork.x,y:fork.y,z:fork.z,size:1.2});}
  }
  crowns.push({x:.2,y:10.3,z:.3,size:1.8});
  for(let i=0;i<5;i++){const a=i*1.256+variant*.4;limb(new T.CatmullRomCurve3([new T.Vector3(0,.38,0),new T.Vector3(Math.cos(a)*.6,.12,Math.sin(a)*.6),new T.Vector3(Math.cos(a)*1.45,-.07,Math.sin(a)*1.45)]),.25,.025,6,5);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.computeBoundingSphere();return {geometry,crowns};
}

// Shared small procedural assets: no downloads and one draw call per instanced family.
export function surfaceTexture(kind){
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');let seed=615;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  ctx.fillStyle=kind==='fur'?'#e8d1ad':kind==='water'?'#50999b':kind==='soil'?'#e4d7ba':kind==='grass'?'#cbd0b5':'#eef0df';ctx.fillRect(0,0,256,256);
  for(let i=0;i<7000;i++){
    const x=random()*256,y=random()*256,r=random();
    ctx.fillStyle=kind==='fur'?(i%2?'#fff3d84a':'#7c583a42'):kind==='water'?(i%3?'#a2d6bf30':'#174e6026'):i%2?'#ffffff16':'#263b2e0a';
    if(kind==='fur'){
      const lean=(random()-.5)*3,len=3+r*9;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.35+r*.35;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+lean,y+len*.55,x+lean*.5,y+len);ctx.stroke();
    }else{ctx.beginPath();ctx.ellipse(x,y,kind==='water'?2+r*8:1+r*4,kind==='water'?.5+r:1+r*2,kind==='water'?-.35+(random()-.5)*1.1:random()*6,0,Math.PI*2);ctx.fill();}
  }
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;
  return t;
}

export function foliageGeometry(){
  const positions=[],normals=[],colors=[],uv=[];
  const card=new T.PlaneGeometry(1.85,1.5,3,2).toNonIndexed(),p=card.attributes.position;
  // Curved, intersecting textured branches hold their silhouette from multiple angles.
  for(let i=0;i<5;i++){
    const q=new T.Quaternion().setFromEuler(new T.Euler(i===4?-Math.PI/2:.15*Math.sin(i),i*Math.PI/2.5,i===4?0:.22*Math.cos(i)));
    for(let j=0;j<p.count;j++){
      const v=new T.Vector3(p.getX(j),p.getY(j),.16*(1-p.getX(j)**2));v.applyQuaternion(q);v.y+=i===4?.25:0;
      positions.push(v.x,v.y,v.z);const n=v.clone().setY(v.y+.6).normalize();normals.push(n.x,n.y,n.z);
      const shade=.88+i*.025;colors.push(shade,shade,shade);uv.push(card.attributes.uv.getX(j),card.attributes.uv.getY(j));
    }
  }
  card.dispose();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;
}

export function mossRockGeometry(variant=0){
  const shape=riverStones[variant%3],g=new T.BufferGeometry();
  for(const [name,size] of [['position',3],['normal',3],['uv',2]])g.setAttribute(name,new T.Float32BufferAttribute(shape[name],size));
  const p=g.attributes.position,colors=[],c=new T.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=Math.sin(x*9+z*5)*Math.sin(y*8-z*9);
    const moss=T.MathUtils.smoothstep(y+n*.32+Math.sin(x*8-z*6)*.15,.32,.83)*Math.max(0,g.attributes.normal.getY(i));
    c.set('#c7cdcb').lerp(new T.Color('#5e782f'),moss);c.multiplyScalar(.96+n*.10+y*.04);colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
  // Share normals across duplicate vertices, preserving the broad cut faces without triangle stippling.
  const normals=g.attributes.normal,shared=new Map(),keys=[];
  for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');keys.push(key);if(!shared.has(key))shared.set(key,new T.Vector3());shared.get(key).add(new T.Vector3().fromBufferAttribute(normals,i));}
  for(let i=0;i<p.count;i++){const n=shared.get(keys[i]).clone().normalize();n.lerp(new T.Vector3().fromBufferAttribute(normals,i),.28).normalize();normals.setXYZ(i,n.x,n.y,n.z);}
  return g;
}

export function creekFoamGeometry(){
  const vertices=[];
  // Broken crests wrap the stone, then stretch downstream rather than forming rings.
  for(let strand=0;strand<3;strand++)for(let i=0;i<32;i++){
    if((i+strand*5)%9<4)continue;
    const at=(t,side)=>{
      const a=-Math.PI*.18+t*Math.PI*1.35,width=(.006+.016*Math.sin(t*Math.PI))*(.8+.2*Math.sin(t*41+strand));
      if(strand===0){const r=.90+.07*Math.sin(t*17)+side*width;return [Math.cos(a)*r,0,Math.sin(a)*r*.8];}
      const sign=strand===1?-1:1,x=sign*(.86-.43*t+.10*Math.sin(t*7+strand));
      return [x+side*width*(1-t*.7),0,.12+t*1.9+.07*Math.sin(t*13+strand)];
    };
    for(const [t,d] of [[i/32,-1],[(i+1)/32,-1],[i/32,1],[i/32,1],[(i+1)/32,-1],[(i+1)/32,1]])vertices.push(...at(t,d));
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
}

// G04: the floated leaf. A small five-lobed (maple-like) blade lying in the XZ plane, tip towards -z and a short stem out of the
// notch towards +z. Radial rings give interior vertices so the midrib and the five lobe veins are drawn with vertex colours
// (no texture), and the blade curls up a little at the edges so it reads as a leaf resting on water, not a flat yellow egg.
// Radius ≈.5 before scaling; ~500 triangles, one mesh.
export function floatingLeafGeometry(){
  const RINGS=4,N=80,positions=[],colors=[],uv=[],index=[]; // 4.5° steps land exactly on the five lobe directions (0, ±72°, ±144°)
  const blade=new T.Color('#e2b24c'),rim=new T.Color('#c9883a'),vein=new T.Color('#9a6a2a'),stem=new T.Color('#8a5a2a'),c=new T.Color();
  const radius=t=>.5*(.42+.58*Math.pow(Math.abs(Math.cos(2.5*t)),.55))*(.78+.22*Math.cos(t));
  const push=(x,y,z,col)=>{positions.push(x,y,z);colors.push(col.r,col.g,col.b);uv.push(x+.5,z+.5);};
  const at=(k,i)=>1+(k-1)*N+(i%N);
  push(0,0,0,vein);
  for(let k=1;k<=RINGS;k++)for(let i=0;i<N;i++){
    const t=-Math.PI+i*2*Math.PI/N,rho=k/RINGS,r=radius(t)*rho,x=Math.sin(t)*r,z=-Math.cos(t)*r;
    const lobe=Math.round(t/(Math.PI*.4))*Math.PI*.4,d=Math.abs(r*Math.sin(t-lobe)),veinMix=Math.cos(t-lobe)>0?Math.max(0,1-d/.018):0;
    c.copy(blade).lerp(rim,Math.pow(rho,3)*.7).lerp(vein,veinMix*.8);
    push(x,.12*x*x+.05*z*z,z,c);
  }
  for(let i=0;i<N;i++)index.push(0,at(1,i+1),at(1,i));
  for(let k=1;k<RINGS;k++)for(let i=0;i<N;i++){const a=at(k,i),b=at(k,i+1),cc=at(k+1,i),d=at(k+1,i+1);index.push(a,b,cc,b,d,cc);}
  const s0=positions.length/3;
  push(-.008,.002,.10,stem);push(.008,.002,.10,stem);push(-.006,.004,.27,stem);push(.006,.004,.27,stem);
  index.push(s0,s0+2,s0+1,s0+1,s0+2,s0+3);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  g.setIndex(index);g.computeVertexNormals();g.computeBoundingSphere();return g;
}

export function broadleafGeometry(detail=0){
  const positions=[],normals=[],colors=[],uv=[],c=new T.Color();
  // Smooth curved leaves, with a lit centre vein, replace flat triangular fans.
  // detail=1 is the shared low-poly shrub (18 slightly larger leaves, 3x2 patches: ~330 vs ~1150 triangles) used for
  // small verge shrubs and far hillside drifts, which never cast shadows.
  const low=detail>0,count=low?18:32,segT=low?3:5,segU=low?2:3,grow=low?1.18:1;
  for(let i=0;i<count;i++){
    const a=i*2.399,r=.16+.43*Math.sqrt((i%9)/9),h=.17+(i%6)*.12+.075*Math.sin(i*1.9);
    const center=new T.Vector3(Math.cos(a)*r,h,Math.sin(a)*r),q=new T.Quaternion().setFromEuler(new T.Euler(.12+(i%5)*.18,a,.35*Math.sin(i)));
    const length=(.105+(i%4)*.019)*grow,width=length*(.43+.19*(.5+.5*Math.sin(i*2.1))),v=[],idx=[],shades=[],tex=[];
    for(let j=0;j<=segT;j++)for(let k=0;k<=segU;k++){
      const t=j/segT,u=k/segU*2-1,outline=Math.pow(Math.sin(Math.PI*t),.65),p=new T.Vector3(u*width*outline,.055*(1-u*u)*outline-.04*(t-.5)**2,(t-.5)*length*2);
      p.applyQuaternion(q).add(center);v.push(p.x,p.y,p.z);tex.push(k/segU,t);
      c.set(['#537842','#739950','#8da65a','#53794e'][i%4]).multiplyScalar(.93+.13*(1-Math.abs(u))+.05*t);shades.push(c.r,c.g,c.b);
      if(j<segT&&k<segU){const n=j*(segU+1)+k,w=segU+1;idx.push(n,n+w,n+1,n+1,n+w,n+w+1);}
    }
    const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(v,3));leaf.setAttribute('color',new T.Float32BufferAttribute(shades,3));leaf.setAttribute('uv',new T.Float32BufferAttribute(tex,2));leaf.setIndex(idx);leaf.computeVertexNormals();const flat=leaf.toNonIndexed();positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);colors.push(...flat.attributes.color.array);uv.push(...flat.attributes.uv.array);leaf.dispose();flat.dispose();
    const base=new T.Vector3(0,.06,0),direction=center.clone().sub(base),stem=new T.CylinderGeometry(.004,.007,direction.length(),3,1,true);
    stem.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction.clone().normalize()));stem.translate((base.x+center.x)/2,(base.y+center.y)/2,(base.z+center.z)/2);
    const branch=stem.toNonIndexed();positions.push(...branch.attributes.position.array);normals.push(...branch.attributes.normal.array);
    for(let k=0;k<branch.attributes.position.count;k++){colors.push(.19,.29,.10);uv.push(.5,.5);}stem.dispose();branch.dispose();
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;
}

export function fernGeometry(){
  const positions=[],colors=[],c=new T.Color();
  for(let frond=0;frond<7;frond++){
    const a=frond*2.399, length=.65+(frond%3)*.17;
    for(let j=1;j<15;j++){
      const t=j/15,spread=Math.sin(t*Math.PI)*(.12+.035*Math.sin(frond*1.9)),y=Math.sin(t*2.1)*(.48+.07*Math.sin(frond));
      for(const side of [-1,1]){
        const points=[[0,y,t*length],[side*spread,y+.035,(t-.065)*length],[side*spread*.82,y-.025,(t+.025)*length],[0,y+.035,t*length+.04]];
        for(const k of [0,1,2,0,2,3]){const [x,yy,z]=points[k];positions.push(x*Math.cos(a)-z*Math.sin(a),yy,z*Math.cos(a)+x*Math.sin(a));c.set(frond%2?'#688348':'#8b9e53').multiplyScalar(.75+t*.45);colors.push(c.r,c.g,c.b);}
      }
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}

export function grassGeometry(){
  const positions=[],colors=[],c=new T.Color();
  for(let i=0;i<11;i++){
    const a=i*2.4,h=.25+(i%5)*.075,x=Math.cos(a)*.14,z=Math.sin(a)*.14;
    for(const [dx,y,dz] of [[-.025,0,0],[.025,0,0],[.06,h*.65,.04],[-.025,0,0],[.06,h*.65,.04],[.01,h*.65,.04],[.01,h*.65,.04],[.06,h*.65,.04],[.11,h,.12]]){
      positions.push(x+dx*Math.cos(a)-dz*Math.sin(a),y,z+dx*Math.sin(a)+dz*Math.cos(a));c.set('#7c985d').multiplyScalar(.85+y*.3);colors.push(c.r,c.g,c.b);
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}



