import * as T from '../lib/three.module.min.js';
import {treeFrames,treeAtlasSize} from './tree-frames.mjs';

let atlas,ready=false,failed=false;
const seasonMaterials=[];
const shadowMaterial=new T.MeshStandardMaterial({color:'#74894c',colorWrite:false,depthWrite:false});
const crownShadowMaterial=shadowMaterial.clone();
const trunk=new T.CylinderGeometry(.10,.18,1.5,7),crown=new T.SphereGeometry(1,10,7);

function materials(){
 if(atlas)return;
 atlas=new T.TextureLoader().load(new URL('./assets/trees-soft.png',import.meta.url).href,()=>{ready=true;for(const m of seasonMaterials)m.map.needsUpdate=true;},undefined,()=>{failed=true;});
 atlas.colorSpace=T.SRGBColorSpace;
 // Atlas rows: spring/summer, autumn/winter. Insets avoid adjacent-cell mip bleeding.
 for(const index of [3,0,1,2]){
  const[x,y,w,h]=treeFrames[index],[aw,ah]=treeAtlasSize,map=atlas.clone();map.repeat.set(w/aw,h/ah);map.offset.set(x/aw,1-(y+h)/ah);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;map.needsUpdate=true;
  seasonMaterials.push(new T.SpriteMaterial({map,color:'#fff8f0',alphaTest:.3,transparent:false,depthWrite:true}));
 }
}

export function paintedTree(parent,x,z,size,pink,stage){
 if(typeof Image==='undefined')return null;
 materials();
 const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size*[.45,.75,1][stage]);parent.add(g);
 const sprite=new T.Sprite(seasonMaterials[pink?1:2]);sprite.visible=ready&&!failed;sprite.scale.set(2.8,2.6,1);sprite.center.set(.5,.004);sprite.position.y=.105;sprite.userData.treePink=pink;sprite.userData.treeSprite=true;g.add(sprite);
 // Shared 3D crowns keep shadows stable after terrain rebuilds and camera turns.
 for(const [geo,pos,scale] of [[trunk,[0,.78,0],[1,1,1]],[crown,[0,1.98,0],[.66,.66,.65]],[crown,[-.46,1.74,.1],[.52,.43,.53]],[crown,[.43,1.82,.26],[.51,.47,.52]],[crown,[-.1,1.85,-.46],[.55,.47,.48]],[crown,[.1,2.3,.05],[.47,.35,.45]]]){
  const m=new T.Mesh(geo,geo===trunk?shadowMaterial:crownShadowMaterial);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.userData.treeShadow=true;g.add(m);
 }
 return g;
}

export function treeArtSeason(scene,season){
 crownShadowMaterial.visible=true;
 scene.traverse(o=>{if(o.userData.treeSprite){const s=season===1&&!o.userData.treePink?2:season,[,,w,h,root]=treeFrames[[3,0,1,2][s]];o.material=seasonMaterials[s];o.center.set(root,2/h);o.scale.set(w/h*2.6,2.6,1);}});
}


export function treeArtReady(scene){
 // Keep a visible 3D fallback while the local atlas loads or if it cannot be read.
 for(const m of [shadowMaterial,crownShadowMaterial]){m.colorWrite=failed||!ready;m.depthWrite=failed||!ready;}
 scene.traverse(o=>{if(o.userData.treeSprite)o.visible=ready&&!failed;});
 return ready||failed;
}
