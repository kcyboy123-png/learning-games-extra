import * as T from './vendor/three.module.js';
import {worldAt,terrain} from './trail.mjs';
import {ANIMALS} from './lib/life.mjs';
const sizes={chipmunk:.62,rabbit:.70,deer:1.65};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
// Cowork R1: the head, ears and body sway used to jump to a new pose the instant a look started/ended or the child crossed the
// 4.5 m alert radius. Each pose target is now approached exponentially (`rate` per second, dt capped like the game clock), so
// the animal turns toward the child instead of snapping. Pure helpers, shared with tests.
export const approach=(current,target,dt,rate=7)=>Number.isFinite(dt)&&dt>0?current+(target-current)*(1-Math.exp(-Math.min(dt,.05)*rate)):current;
// The animal's attention and encounter locations belong to this browser only.
export function createWildlife(scene,squirrel){
  const roots={chipmunk:squirrel},actors={},phases={rabbit:1.4,deer:3.8,chipmunk:.2};
  const sphere=new T.SphereGeometry(1,16,12),fur=new T.MeshStandardMaterial({color:'#aa9279',roughness:.96});
  for(const id of ['rabbit','deer']){
    const root=new T.Group();root.name='wild-'+id;root.visible=false;scene.add(root);roots[id]=root;
    const h=sizes[id],body=new T.Mesh(sphere,fur);body.position.y=h*.37;body.scale.set(h*.24,h*.3,h*.38);root.add(body);
    const head=new T.Mesh(sphere,fur);head.position.set(0,h*.65,h*.3);head.scale.set(h*.14,h*.19,h*.2);root.add(head);
    for(const side of [-1,1]){const ear=new T.Mesh(sphere,fur);ear.position.set(side*h*.1,h*.85,h*.27);ear.scale.set(h*.045,h*(id==='rabbit'?.23:.12),h*.055);root.add(ear);}
    if(id==='deer')for(const x of [-1,1])for(const z of [-1,1]){const leg=new T.Mesh(sphere,fur);leg.position.set(x*h*.14,h*.19,z*h*.25);leg.scale.set(h*.04,h*.22,h*.05);root.add(leg);}
  }
  async function load(id){
    const root=roots[id],fallback=[...root.children];
    try{
      const response=await fetch(new URL(`./assets/wild-${id}.json`,import.meta.url),{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('animal mesh unavailable');
      const data=await response.json(),g=new T.BufferGeometry();
      for(const [name,n] of [['position',3],['normal',3],['uv',2]])g.setAttribute(name,new T.Float32BufferAttribute(data[name],n));
      g.setIndex(data.index);g.computeBoundingBox();g.computeBoundingSphere();
      const map=await new T.TextureLoader().loadAsync(new URL(`./assets/wild-${id}.webp`,import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
      const material=new T.MeshStandardMaterial({map,roughness:.94}),mesh=new T.SkinnedMesh(g,material),h=g.boundingBox.max.y;
      const base=new T.Bone(),head=new T.Bone(),left=new T.Bone(),right=new T.Bone();
      const neck=h*(id==='deer'?.68:.49);head.position.set(0,neck,0);base.add(head);
      left.position.set(-h*.10,h*.27,0);right.position.set(h*.10,h*.27,0);head.add(left,right);mesh.add(base);
      const weights=[],indices=[];
      for(let i=0;i<data.position.length;i+=3){const [x,y,z]=data.position.slice(i,i+3);const hw=smooth(neck-.10*h,neck+.19*h,y)*(id==='chipmunk'?smooth(-.03,.08,z):1),ear=smooth(h*.81,h*.95,y)*.72;
        weights.push(1-hw,hw*(1-ear),x<0?hw*ear:0,x>=0?hw*ear:0);indices.push(0,1,2,3);}
      g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));mesh.bind(new T.Skeleton([base,head,left,right]));
      mesh.castShadow=true;mesh.receiveShadow=false;mesh.name='tripo-'+id;root.add(mesh);for(const old of fallback)old.visible=false;
      actors[id]={mesh,head,left,right,loaded:true};
    }catch{actors[id]={loaded:false};}
  }
  const ready=Promise.all(Object.keys(roots).map(load));
  function update(time,s,reduced,life,hero){
    for(const [id,root] of Object.entries(roots)){
      const a=ANIMALS.find(a=>a.id===id),at=life?.encounters?.[id]??a.s,near=Math.abs(s-at)<60,watch=life?.focus===id,t=reduced?0:time+phases[id];
      if(id!=='chipmunk'){
        root.visible=near;if(!near)continue;
        const p=worldAt(at,a.offset);p.y=terrain(p.x,at);root.position.set(p.x,p.y+.005,p.z);
        const cycle=t%17,hop=id==='rabbit'&&!watch&&!reduced&&cycle>12&&cycle<13?Math.sin((cycle-12)*Math.PI*2):0;
        root.position.y+=Math.abs(hop)*.12;root.rotation.x=hop*.08;
        const facing=a.offset>0?-Math.PI/2:Math.PI/2,sway=root.userData,dtRoot=Number.isFinite(sway.t)?time-sway.t:0;sway.t=time;
        sway.yaw=approach(sway.yaw??0,watch?0:Math.sin(t*.22)*.10,dtRoot);root.rotation.y=facing+(reduced?0:sway.yaw);
        const fx=Math.sin(root.rotation.y),fz=Math.cos(root.rotation.y),rx=fz,rz=-fx;
        root.rotation.x+=Math.atan2(terrain(p.x-fx*.35,at+fz*.35)-terrain(p.x+fx*.35,at-fz*.35),.7);
        root.rotation.z=Math.atan2(terrain(p.x+rx*.35,at-rz*.35)-terrain(p.x-rx*.35,at+rz*.35),.7);
      }
      const rig=actors[id];if(!rig?.loaded)continue;
      const distance=hero?Math.hypot(hero.x-root.position.x,hero.z-root.position.z):99;
      const alert=!!hero&&(watch||distance<4.5),dt=Number.isFinite(rig.t)?time-rig.t:0;rig.t=time;
      const toHero=alert?Math.atan2(hero.x-root.position.x,hero.z-root.position.z)-root.rotation.y:0;
      const headY=alert?Math.max(-.3,Math.min(.3,Math.atan2(Math.sin(toHero),Math.cos(toHero)))):Math.sin(t*.65)*.12;
      const headX=(alert?-.08:Math.sin(t*.42)*.07)+(id==='chipmunk'?Math.sin(t*5)*.025:0);
      rig.look=rig.look||{y:headY,x:headX};rig.look.y=approach(rig.look.y,headY,dt);rig.look.x=approach(rig.look.x,headX,dt,9);
      rig.head.rotation.y=reduced?0:rig.look.y;rig.head.rotation.x=reduced?0:rig.look.x;
      rig.left.rotation.z=reduced?0:Math.sin(t*1.2)*.06+Math.max(0,Math.sin(t*2.9)-.85)*.4;
      rig.right.rotation.z=reduced?0:-Math.sin(t*.95)*.055;
    }
  }
  return {roots,ready,update,snapshot:()=>Object.fromEntries(Object.entries(roots).map(([id,r])=>[id,{loaded:!!actors[id]?.loaded,head:actors[id]?.head?.rotation.toArray().slice(0,3),visible:r.visible,position:r.position.toArray(),triangles:actors[id]?.mesh?.geometry.index.count/3||0}]))};
}

