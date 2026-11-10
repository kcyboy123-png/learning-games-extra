import * as THREE from './lib/three.module.min.js';
import {GLTFLoader} from './lib/GLTFLoader.js';
import {barkTex,foliageDetailTex,surfaceData} from './garden-textures.mjs?v=20261110-polish5';

// Local, self-made forest-studio models. Keep the piano terrace and approach open.
export const GARDEN_PLANTS = {
  cherry: [[-4.8,-5.5,1.12,.3]],
  hydrangea: [[-2.7,-1.8,.90,0],[-3.3,-.5,.72,.8],[-3.8,1.1,.82,1.7],
    [2.6,-2.3,.82,.4],[3.5,-1.1,.92,2.1],[4.4,1.4,.80,1.2]],
  cosmos: [[-2.4,1.8,.72,.4],[-3.2,3.3,.85,1.1],[-4.4,-.1,.80,2.1],
    [3.5,2.2,.76,2.6],[4.8,.3,.82,.8],[1.8,-3.8,.70,1.5]]
};

export const MAP_GARDENS = {
  basic:GARDEN_PLANTS,
  pop:{cherry:[[-4,-7.5,.86,.5]],hydrangea:[[-3.1,-2,.8,0],[-3.5,.3,.9,1],[3.2,-3.6,.8,2],[5.4,-3.2,.85,.7]],cosmos:[[-2.6,1.5,.8,.5],[-3.5,3.2,.9,1.4],[2.6,-2.1,.75,2],[5.3,2.6,.8,.8]],liriope:[[-3.7,2,.85,0],[5.5,-1.8,.8,2]]},
  warm:{maple:[[-3.6,-7.5,1.05,.7]],cosmos:[[-2.8,-2.8,.85,0],[-3.6,-.8,.9,1],[-3.5,2.3,.85,2],[3.4,-3.7,.8,.4],[3.8,-1.7,.9,2],[4.1,1.4,.75,1]],liriope:[[-3,-1,.9,0],[-4.1,3.4,1,1],[3,-2.9,.8,2],[4.3,2.8,.9,.5]]},
  dream:{hydrangea:[[-3.1,-3.3,.95,0],[-3.8,-1.2,.85,.8],[-3.5,1.4,.8,2],[3.2,-3.1,.9,.4],[4.1,-.6,.85,1.4]],cosmos:[[-2.7,2.8,.65,0],[4.5,2,.65,2]],liriope:[[-2.8,-1,.85,1],[-4.5,3.2,.9,2],[3.1,-1.7,.8,0],[4.8,3.4,.9,1]]},
  journey:{hydrangea:[[-4.7,-1.5,.75,0],[-3.4,.2,.8,1],[-4.1,2.3,.7,2],[4.5,-1.5,.7,.4],[4.8,1.2,.8,1]],cosmos:[[-2.7,1.5,.65,.4],[-3.6,3.5,.75,1],[3.5,-2,.65,2],[4.7,3.6,.7,.7]],liriope:[[-4.9,4.4,.85,0],[4.8,5.4,.85,1]]},
  moon:{hydrangea:[[-3.5,1.2,.8,0],[-4.8,1.5,.9,1],[-6.7,.8,.75,2],[3.8,-3.5,.9,.4],[4.7,-1.6,.85,1]],cosmos:[[-2.8,2.7,.65,0],[3.1,-2.5,.6,1]],liriope:[[-3.6,3.2,.9,0],[-5.8,1.1,.8,2],[4.6,.1,.85,1],[4.8,3.5,.8,2]]}
};
// Low planting ribbons frame the piano approach; never fill the terrace itself.
for(const [id,plants] of Object.entries(MAP_GARDENS)){
 const ribbon=id==='moon'?[[3.9,-4.5,1.05,0],[5.5,-3.2,1.1,1],[-4.4,3.5,1,2],[4.8,5.1,1.1,1]]:
 [[-4.3,4.6,1.05,0],[-4.8,6.5,1.1,1],[4.8,4.8,1,2],[4.9,7,1.15,.5]];
 plants.liriope=[...(plants.liriope||[]),...ribbon];
 plants.cosmos=[...(plants.cosmos||[]),[-3.6,4.4,.85,.7],[4.3,5.7,.85,2.1],[-4.5,7.6,.9,1.3],[4.7,8.5,.9,.3]];
 if(id!=='warm')plants.hydrangea=[...(plants.hydrangea||[]),[-4.8,5.4,.85,.6],[4.9,6.1,.8,2]];
}
for(const [id,plants] of Object.entries(MAP_GARDENS)){
 const kind=id==='warm'?'cosmos':'hydrangea';
 plants[kind]=[...(plants[kind]||[]),[-2.9,.4,.95,.2],[3.6,1.5,1,1.7]];
 plants.cosmos=plants.cosmos.map(([x,z,s,a])=>[x,z,s*1.10,a]);
}
const MAP_TINTS={pop:[0xfff2eb,0xe7efcd],warm:[0xffdfb2,0xdac48d],dream:[0xd4daff,0xb5d4dc],journey:[0xfff6f4,0xe4efdc],moon:[0xd8e8ff,0xb9d6ce]};

export async function loadGarden() {
  const loader=new GLTFLoader(),templates=new Map();
  await Promise.all([...new Set(Object.values(MAP_GARDENS).flatMap(Object.keys))].map(async kind=>{
    try {
      const {scene}=await loader.loadAsync(new URL(`./assets/garden/${kind}.glb`,import.meta.url).href);
      scene.updateMatrixWorld(true);
      const parts=[];
      scene.traverse(o=>{
        if(!o.isMesh)return;
        const name=o.material.name,geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);
        if(!geometry.attributes.position?.array.every(Number.isFinite))throw Error('Invalid plant geometry');
        if(name==='leaf'||name==='blossom'){
          const normal=geometry.attributes.normal,position=geometry.attributes.position,v=new THREE.Vector3(),up=new THREE.Vector3();
          for(let i=0;i<normal.count;i++){
            v.fromBufferAttribute(normal,i);if(v.y<0)v.negate();
            up.set(position.getX(i)*.25,.8,position.getZ(i)*.25).normalize();
            v.lerp(up,.35).normalize();normal.setXYZ(i,v.x,v.y,v.z);
          }
        }
        parts.push({name,geometry});o.geometry.dispose();o.material.dispose();
      });
      templates.set(kind,parts);
    }catch(error){console.warn(`[garden] ${kind} unavailable; original forest retained`,error.message);}
  }));
  return {
    build(parent,groundY,id='basic'){
      const plants=MAP_GARDENS[id]||GARDEN_PLANTS,[flowerTint,leafTint]=MAP_TINTS[id]||[0xfff7f3,0xe0ead1];
      const root=new THREE.Group();root.name='garden-transplant';parent.add(root);
      const textures=new Map();
      const texture=source=>{if(!textures.has(source)){const t=source.clone();t.needsUpdate=true;textures.set(source,t);}return textures.get(source);};
      for(const [kind,parts] of templates){
        const placements=plants[kind];if(!placements)continue;
        for(const {name,geometry} of parts){
          const bark=name==='bark',leaf=['leaf','sepal','grass'].includes(name),petal=['petal','floret','blossom'].includes(name);
          const map=bark?texture(barkTex()):leaf?texture(foliageDetailTex()):null;
          const material=new THREE.MeshStandardMaterial({vertexColors:!bark,color:bark?0x9e8765:petal?flowerTint:leafTint,
            map,roughness:bark?.94:.85,side:bark?THREE.FrontSide:THREE.DoubleSide,
            bumpMap:bark?texture(surfaceData(barkTex())):null,bumpScale:.055});
          const mesh=new THREE.InstancedMesh(geometry.clone(),material,placements.length),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();
          placements.forEach(([x,z,s,angle],i)=>{
            rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),angle);
            matrix.compose(new THREE.Vector3(x,groundY(x,z),z),rotation,scale.setScalar(s));mesh.setMatrixAt(i,matrix);
          });
          mesh.name=`garden-${kind}-${name}`;mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
        }
      }
      root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
      return ['cherry','maple'].flatMap(kind=>templates.has(kind)?plants[kind]||[]:[]).map(([x,z,s])=>({x,z,radius:.25*s,height:4*s}));
    },
    dispose(){for(const parts of templates.values())for(const p of parts)p.geometry.dispose();templates.clear();}
  };
}
