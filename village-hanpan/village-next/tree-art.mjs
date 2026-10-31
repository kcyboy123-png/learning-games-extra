import * as T from '../lib/three.module.min.js';
import {treeFrames,treeAtlasSize} from './tree-frames.mjs';

let atlas,ready=false,failed=false;
const seasonMaterials=[],silhouetteMaterials=[];
const shadowMaterial=new T.MeshStandardMaterial({color:'#74894c',colorWrite:false,depthWrite:false});
const crownShadowMaterial=shadowMaterial.clone();
const trunk=new T.CylinderGeometry(.10,.18,1.5,7),crown=new T.SphereGeometry(1,10,7);
const silhouetteGeometry=new T.PlaneGeometry(1,1);

function materials(){
 if(atlas)return;
 atlas=new T.TextureLoader().load(new URL('./assets/trees-soft.png',import.meta.url).href,()=>{ready=true;for(const m of [...seasonMaterials,...silhouetteMaterials])m.map.needsUpdate=true;},undefined,()=>{failed=true;});
 atlas.colorSpace=T.SRGBColorSpace;
 // Atlas rows: spring/summer, autumn/winter. Insets avoid adjacent-cell mip bleeding.
 for(const index of [3,0,1,2]){
  const[x,y,w,h]=treeFrames[index],[aw,ah]=treeAtlasSize,map=atlas.clone();map.repeat.set(w/aw,h/ah);map.offset.set(x/aw,1-(y+h)/ah);map.colorSpace=T.SRGBColorSpace;map.userData.shared=true;map.needsUpdate=true;
  seasonMaterials.push(new T.SpriteMaterial({map,color:'#fff1dd',alphaTest:.3,transparent:false,depthWrite:true}));
  const canopy=map.clone();canopy.repeat.y*=.72;canopy.offset.y+=h/ah*.28;canopy.userData.shared=true;
  silhouetteMaterials.push(new T.MeshBasicMaterial({map:canopy,alphaTest:.45,side:T.DoubleSide,colorWrite:false,depthWrite:false}));
 }
}

export function paintedTree(parent,x,z,size,pink,stage){
 if(typeof Image==='undefined')return null;
 materials();
 const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size*[.45,.75,1][stage]);parent.add(g);
 const sprite=new T.Sprite(seasonMaterials[pink?1:2]);sprite.visible=ready&&!failed;sprite.scale.set(2.8,2.6,1);sprite.center.set(.5,.004);sprite.position.y=.105;sprite.userData.treePink=pink;sprite.userData.treeSprite=true;g.add(sprite);
 // The painted silhouette casts the tree's own outline instead of disconnected sphere shadows.
 for(const [geo,pos,scale] of [[trunk,[0,.78,0],[1,1,1]],[crown,[0,1.98,0],[.66,.66,.65]],[crown,[-.46,1.74,.1],[.52,.43,.53]],[crown,[.43,1.82,.26],[.51,.47,.52]],[crown,[-.1,1.85,-.46],[.55,.47,.48]],[crown,[.1,2.3,.05],[.47,.35,.45]]]){
  const m=new T.Mesh(geo,geo===trunk?shadowMaterial:crownShadowMaterial);m.position.set(...pos);m.scale.set(...scale);m.castShadow=geo===trunk;g.add(m);
 }
 const cast=new T.Mesh(silhouetteGeometry,silhouetteMaterials[pink?1:2]);cast.scale.set(2.35,1.85,1);cast.position.y=1.85;cast.rotation.x=-Math.PI/2;cast.castShadow=true;cast.visible=ready&&!failed;cast.userData.treeSilhouette=true;cast.userData.keepArtHierarchy=true;g.add(cast);
 return g;
}

export function treeArtSeason(scene,season){
 crownShadowMaterial.visible=season!==0;
 scene.traverse(o=>{if(o.userData.treeSprite){const s=season===1&&!o.userData.treePink?2:season,[,,w,h,root]=treeFrames[[3,0,1,2][s]];o.material=seasonMaterials[s];o.center.set(root,2/h);o.scale.set(w/h*2.6,2.6,1);const cast=o.parent.children.find(n=>n.userData.treeSilhouette);cast.material=silhouetteMaterials[s];cast.material.visible=true;cast.scale.x=o.scale.x*.85;}});
}

export function treeArtView(scene,angle){scene.traverse(o=>{if(o.userData.treeSilhouette)o.rotation.set(-Math.PI/2,0,angle);});}

export function treeArtReady(scene){
 // Keep a visible 3D fallback while the local atlas loads or if it cannot be read.
 for(const m of [shadowMaterial,crownShadowMaterial]){m.colorWrite=failed||!ready;m.depthWrite=failed||!ready;}
 scene.traverse(o=>{if(o.userData.treeSprite||o.userData.treeSilhouette)o.visible=ready&&!failed;});
 return ready||failed;
}
