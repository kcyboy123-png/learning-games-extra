// Reused from the user's forest-full-15min art.mjs; original tree and curved leaf geometry.
import * as T from './vendor/three.module.js?v=20261120-quality6';
export function woodlandTree(variant=0){
  const positions=[],normals=[],uv=[],crowns=[];
  const trunk=new T.CatmullRomCurve3([[0,0,0],[.32-variant*.48,2,.12+variant*.18],[-.85+variant*.82,5,.55-variant*.25],[.65-variant*.72,7.4,-.36],[.3+variant*.35,10,.55]].map(p=>new T.Vector3(...p)));
  function limb(curve,start,end,steps=10,sides=7){
    const g=new T.TubeGeometry(curve,steps,1,sides,false),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const t=Math.floor(i/(sides+1))/steps,center=curve.getPointAt(t),r=end+(start-end)*Math.pow(1-t,.96),v=new T.Vector3().fromBufferAttribute(p,i).sub(center).multiplyScalar(r).add(center);p.setXYZ(i,v.x,v.y,v.z);}
    const tex=g.attributes.uv;for(let i=0;i<tex.count;i++){const along=tex.getX(i),around=tex.getY(i);tex.setXY(i,around*1.65,along*curve.getLength()/1.75);}
    g.computeVertexNormals();const flat=g.toNonIndexed();positions.push(...flat.attributes.position.array);normals.push(...flat.attributes.normal.array);uv.push(...flat.attributes.uv.array);flat.dispose();g.dispose();
  }
  limb(trunk,.48+variant*.11,.07+variant*.02,18,10);
  for(let i=0;i<7;i++){
    const t=[.43,.52,.57,.67,.71,.80,.85][i]+Math.sin(i*2+variant)*.018,start=trunk.getPointAt(t),a=i*2.399+variant*.75+Math.sin(i*3.1+variant)*.42,len=1.5+(i%3)*.95+Math.sin(i+variant)*.5;
    const mid=start.clone().add(new T.Vector3(Math.cos(a)*len*.48,.22+Math.sin(i+variant)*.38,Math.sin(a)*len*.48));
    const end=start.clone().add(new T.Vector3(Math.cos(a)*len,.65+(i%3)*.42+.24*Math.sin(i*1.3+variant),Math.sin(a)*len));
    limb(new T.CatmullRomCurve3([start,mid,end]),.17-i*.011,.022,8,6);crowns.push({x:end.x,y:end.y,z:end.z,size:1.22+(i%3)*.34});
    if(i%2===0){const fork=mid.clone().add(new T.Vector3(Math.cos(a+.48+variant*.12)*len*.72,.46+(i%3)*.18,Math.sin(a+.48+variant*.12)*len*.72));limb(new T.CatmullRomCurve3([mid,mid.clone().lerp(fork,.5),fork]),.09,.015,5,5);crowns.push({x:fork.x,y:fork.y,z:fork.z,size:1.02+.14*Math.sin(i+variant)**2});}
  }
  crowns.push({x:.2,y:10.3,z:.3,size:1.8});
  for(let i=0;i<5;i++){const a=i*1.256+variant*.4;limb(new T.CatmullRomCurve3([new T.Vector3(0,.38,0),new T.Vector3(Math.cos(a)*(.7+variant*.12),.18,Math.sin(a)*(.7+variant*.12)),new T.Vector3(Math.cos(a)*(1.65+.25*Math.sin(i*3+variant)),-.07,Math.sin(a)*(1.65+.25*Math.sin(i*3+variant)))]),.25,.025,6,5);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));// Broad buttress roots anchor mature trunks without adding polygons.
  const roots=geometry.attributes.position;
  for(let i=0;i<roots.count;i++){
    const y=roots.getY(i),x=roots.getX(i),z=roots.getZ(i),a=Math.atan2(z,x);
    const flare=Math.exp(-Math.max(0,y)*1.5)*(.30+.16*Math.cos(a*5+variant));
    const flute=.045*Math.sin(a*7+y*.55+variant)*Math.exp(-Math.max(0,y)*.35);
    roots.setXYZ(i,x*(1+flare+flute),y,z*(1+flare+flute));
  }
  geometry.computeVertexNormals();
  // Root deformation needs new normals, but unindexed triangles must still share smooth bark lighting.
  const treeNormals=geometry.attributes.normal,treeSums=new Map(),treeKeys=[];
  for(let i=0;i<roots.count;i++){
    const key=[roots.getX(i),roots.getY(i),roots.getZ(i)].map(v=>v.toFixed(5)).join(',');treeKeys.push(key);
    if(!treeSums.has(key))treeSums.set(key,new T.Vector3());
    treeSums.get(key).add(new T.Vector3().fromBufferAttribute(treeNormals,i));
  }
  for(let i=0;i<roots.count;i++){const n=treeSums.get(treeKeys[i]).clone().normalize();treeNormals.setXYZ(i,n.x,n.y,n.z);}
  // Root shade and sun-facing bark variation are baked once into the shared tree geometry.
  const barkColors=[];
  for(let i=0;i<roots.count;i++){const y=roots.getY(i),x=roots.getX(i),z=roots.getZ(i),base=.82+.18*T.MathUtils.smoothstep(y,0,2.4),patch=.5+.5*Math.sin(x*5+z*4+variant),moss=(1-T.MathUtils.smoothstep(y,.1,1.3))*(.35+.65*patch);barkColors.push(base*(1-.22*moss),base*(.97+.03*moss),base*(.92-.13*moss));}
  geometry.setAttribute('color',new T.Float32BufferAttribute(barkColors,3));
  geometry.computeBoundingSphere();return {geometry,crowns};
}


export function foliageGeometry(){
  const positions=[],normals=[],colors=[],uv=[];
  // Split the third branch into two half-atlas fans: four directions, still 36 triangles.
  for(let i=0;i<4;i++){
    const half=i>1,card=new T.PlaneGeometry(half?1.025:2.05,1.6,3,half?1:2).toNonIndexed(),p=card.attributes.position;
    const q=new T.Quaternion().setFromEuler(new T.Euler(-.38-i*.24,i*2.399,.24*Math.cos(i*1.7)));
    for(let j=0;j<p.count;j++){
      const x=p.getX(j)+(half?(i===2?-.30:.30):0),y=p.getY(j);
      const v=new T.Vector3(x,y,.40*(1-x*x)-.13*y*y+.10*x*y);
      v.x*=.86+.14*Math.cos(y*2.+i);v.applyQuaternion(q);v.x+=Math.cos(i*2.399)*.30;v.z+=Math.sin(i*2.399)*.30;v.y+=.18*Math.sin(i*1.7);
      positions.push(v.x,v.y,v.z);
      const n=v.clone().multiply(new T.Vector3(.78,1,.78)).setY(v.y+.88).normalize();
      const curvedNormal=new T.Vector3(.80*x-.10*y,.26*y-.10*x,1).normalize().applyQuaternion(q);
      n.lerp(curvedNormal,.48).normalize();normals.push(n.x,n.y,n.z);
      const outer=T.MathUtils.smoothstep(Math.hypot(v.x,v.z),.20,1.15);
      const shade=.73+.17*T.MathUtils.smoothstep(v.y,-.6,.65)+.13*outer;
      colors.push(shade,shade*(.99+.01*outer),shade*(.96+.04*outer));
      const u=card.attributes.uv.getX(j);uv.push(half?u*.5+(i===3?.5:0):i%2?1-u:u,card.attributes.uv.getY(j));
    }
    card.dispose();
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;
}

