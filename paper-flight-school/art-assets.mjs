import * as T from './vendor/three.module.js';
import {woodlandTree,foliageGeometry} from './forest-geometry.mjs';

const base=new URL('./assets/reused/',import.meta.url),loader=new T.TextureLoader();
export const artStatus={loaded:[],failed:[]};
export const artMaterial=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.78,envMapIntensity:.22,...extra});
export function addMesh(parent,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
export function instances(parent,geometry,material,items){
 const o=new T.InstancedMesh(geometry,material,items.length),dummy=new T.Object3D();
 items.forEach((p,i)=>{dummy.position.set(...p.p);dummy.rotation.set(...(p.r??[0,0,0]));dummy.scale.set(...(p.s??[1,1,1]));dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);if(p.c)o.setColorAt(i,new T.Color(p.c));});
 o.castShadow=o.receiveShadow=true;o.computeBoundingSphere();parent.add(o);return o;
}
export function loadTexture(name,onChange,{repeat=[1,1],linear=false}={}){
 const t=loader.load(new URL(name,base).href,()=>{artStatus.loaded.push(name);onChange();},undefined,()=>{artStatus.failed.push(name);onChange();});
 t.colorSpace=linear?T.NoColorSpace:T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t;
}
export function oak(onChange,repeat=[2,2]){const map=loadTexture('bridge-wood.webp',onChange,{repeat});return artMaterial(0xf1dcc1,{map,bumpMap:map,bumpScale:.001,roughness:.52});}

export function gardenTrees(parent,onChange){
 const leaves=loadTexture('forest-foliage-v2.png',onChange),bark=loadTexture('woodland-bark.webp',onChange),normal=loadTexture('woodland-bark-normal.webp',onChange,{linear:true}),rough=loadTexture('woodland-bark-rough.webp',onChange,{linear:true});
 const leafMat=artMaterial(0xb6ce9a,{map:leaves,alphaTest:.44,vertexColors:true,side:T.DoubleSide,roughness:.85});leafMat.alphaToCoverage=true;
 const barkMat=artMaterial(0xc5b5a0,{map:bark,normalMap:normal,normalScale:new T.Vector2(.45,.45),roughnessMap:rough,vertexColors:true});
 const crowns=[],trunks=[[],[],[]],trees=[0,1,2].map(woodlandTree);
 for(const side of [-1,1])for(let i=0;i<10;i++){
  const x=side*(17+(i%3)*2.5),z=-3+i*7.3,scale=.72+.12*Math.sin(i*4+side),yaw=i*2.39;
  trunks[i%3].push({p:[x,0,z],s:[scale,scale,scale],r:[0,yaw,0]});
  for(const [k,c] of trees[i%3].crowns.entries())for(let j=0;j<3;j++){
   const a=j*2.4+k*.7,cx=c.x+Math.sin(a)*.65,cz=c.z+Math.cos(a)*.65;
   crowns.push({p:[x+(cx*Math.cos(yaw)+cz*Math.sin(yaw))*scale,(c.y+Math.sin(j*3+k)*.6)*scale,z+(cz*Math.cos(yaw)-cx*Math.sin(yaw))*scale],s:[c.size*scale,c.size*scale,c.size*scale],r:[.2*Math.sin(k),yaw+a,.2*Math.cos(k)],c:new T.Color().setHSL(.22+.018*Math.sin(i+k),.29,.60+.08*Math.sin(j+k))});
  }
 }
 trunks.forEach((items,i)=>instances(parent,trees[i].geometry,barkMat,items));
 const crown=instances(parent,foliageGeometry(),leafMat,crowns);crown.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:leaves,alphaTest:.44,side:T.DoubleSide});
}

const spectatorAssets=new Map();
async function spectator(id,onChange){
 if(!spectatorAssets.has(id))spectatorAssets.set(id,(async()=>{
  const response=await fetch(new URL('../crowd/'+id+'.bin',base),{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Spectator mesh '+id);
  const buffer=await response.arrayBuffer();if(buffer.byteLength<8)throw Error('Truncated spectator');const h=new DataView(buffer),n=h.getUint32(0,true),count=h.getUint32(4,true);
  if(n>60000||count>180000||buffer.byteLength!==8+n*36+count*4)throw Error('Invalid spectator layout');
  const geo=new T.BufferGeometry();let offset=8;
  for(const [key,size] of [['position',3],['normal',3],['uv',2],['clothMask',1]]){geo.setAttribute(key,new T.BufferAttribute(new Float32Array(buffer,offset,n*size),size));offset+=n*size*4;}
  geo.setIndex(new T.BufferAttribute(new Uint32Array(buffer,offset,count),1));geo.computeBoundingSphere();
  const map=await loader.loadAsync(new URL('../crowd/'+id+'.webp',base).href);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  const mat=artMaterial(0xfff8ef,{map,roughness:.86});
  mat.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float clothMask; varying float vCloth; varying vec3 vOutfit;').replace('#include <color_vertex>','#include <color_vertex>\nvCloth=clothMask; vOutfit=instanceColor;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vCloth; varying vec3 vOutfit;').replace('#include <color_fragment>','float clothLight=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)); diffuseColor.rgb=mix(diffuseColor.rgb,vOutfit*(.24+clothLight*1.6),clamp(vCloth,0.,1.)*.94);');};mat.customProgramCacheKey=()=> 'spectator-clothes-v2';
  artStatus.loaded.push('crowd/'+id);return {geo,mat};
 })().catch(error=>{artStatus.failed.push(id+'-seated.bin');return null;}));
 const asset=await spectatorAssets.get(id);onChange();return asset;
}
export async function spectators(parent,places,onChange){
 const roster=['boy-a','teacher-female','girl-b','boy-b','girl-a','teacher-male'],coats=[0x426d8a,0xeddcc2,0x729a7f,0xb76e65,0x9691af,0xc09c53,0x425f52];
 await Promise.all(roster.map(async(id,index)=>{
  const asset=await spectator(id,onChange);if(!asset)return;
  const items=places.filter((_,i)=>(i*5+Math.floor(i/7))%roster.length===index).map((p,i)=>{const h=(id.startsWith('teacher')?.93:.91)+(i%4)*.045;return {p:[p.x,p.y,p.z],r:[0,p.yaw+.19*Math.sin(i*7+index),.025*Math.sin(i*3)],s:[h*(.92+(i%3)*.06),h,h],c:coats[(i*3+index)%coats.length]};});
  if(items.length)instances(parent,asset.geo,asset.mat,items);
 }));onChange();
}

const plantAssets=new Map();
export async function plantedBorders(parent,beds,onChange){
 await Promise.all(['liriope','daisy','hydrangea'].map(async(kind,k)=>{
  if(!plantAssets.has(kind))plantAssets.set(kind,(async()=>{
   const r=await fetch(new URL('landscape-'+kind+'.json',base),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Plant mesh');const data=await r.json();
   if(!data.position?.length||data.position.length>36000||data.normal?.length!==data.position.length||data.color?.length!==data.position.length)throw Error('Invalid plant geometry');
   const g=new T.BufferGeometry();for(const key of ['position','normal','color'])g.setAttribute(key,new T.Float32BufferAttribute(data[key],3));g.computeBoundingSphere();return g;
  })().catch(()=>{artStatus.failed.push('landscape-'+kind);return null;}));
  const g=await plantAssets.get(kind);if(!g)return;const items=[];
  for(const [x,z,length] of beds)for(let i=0;i<Math.ceil(length/.85);i++){
   const s=k===0?.65:k===1?.48:.52;if((i+k)%3!==0)continue;
   items.push({p:[x+.23*Math.sin(i*7+k),.22,z-length/2+i*.85],r:[0,i*2.4,0],s:[s,s,s]});
  }
  if(items.length)instances(parent,g,artMaterial(0xffffff,{vertexColors:true,side:T.DoubleSide}),items);artStatus.loaded.push('landscape-'+kind);onChange();
 }));
}

export function lawn(parent,onChange){
 const map=loadTexture('grass-detail.webp',onChange,{repeat:[18,52],linear:true});
 const albedo=loadTexture('../lawn-albedo.png',onChange,{repeat:[17,58]});
 const ground=addMesh(parent,new T.PlaneGeometry(26,88),artMaterial(0xdad5b7,{map:albedo,bumpMap:map,bumpScale:.018,roughness:1}),0,.001,27);ground.rotation.x=-Math.PI/2;
 const colors=[],positions=[];
 for(let j=0;j<4;j++){
  const a=j*2.4,dx=Math.cos(a),dz=Math.sin(a),width=.0016,height=.020+(j%3)*.005;
  positions.push(-dx*width,0,-dz*width,dx*width,0,dz*width,dx*.008,height*.6,dz*.008,dx*.008,height*.6,dz*.008,dx*width,0,dz*width,dx*.024,height,dz*.024);
  for(let i=0;i<6;i++){const v=i===5?1:i===2||i===3?.95:.84;colors.push(v*.9,v,v*.7);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 let seed=721;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296),items=[];
 for(let i=0;i<24000;i++){
  const x=(rand()-.5)*22,z=-3+rand()*rand()*55;const scale=.65+rand()*.7;
  items.push({p:[x,.003,z],s:[scale,scale,scale],r:[0,rand()*6.28,0],c:new T.Color().setHSL(.21+rand()*.035,.30,.5+rand()*.14)});
 }
 const grass=instances(parent,geo,artMaterial(0x9db16b,{vertexColors:true,side:T.DoubleSide}),items);grass.castShadow=false;
}

export function distantLandscape(parent,onChange){
 const map=loadTexture('summit-panorama-v4.png',onChange);map.wrapS=T.MirroredRepeatWrapping;map.wrapT=T.ClampToEdgeWrapping;map.repeat.set(2,.62);map.offset.y=.38;
 const hills=new T.Mesh(new T.CylinderGeometry(165,165,180,96,1,true),new T.MeshBasicMaterial({map,side:T.BackSide,fog:false,toneMapped:false}));hills.position.y=-10;hills.rotation.y=.5;parent.add(hills);
}
