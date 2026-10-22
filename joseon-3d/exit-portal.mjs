import {createPortalVisual} from './portal-visual.mjs';
export const portalStand={x:0,z:-24.9};
export const arrivalSpawn={x:60,z:4};
export const arrivalBounds={minX:54,maxX:66,minZ:-5,maxZ:7};
export function createExitPortal(THREE,scene,world){
 const door=new THREE.Group();door.position.set(0,1.8,-26);door.visible=false;scene.add(door);
 const visual=createPortalVisual(THREE,door);
 // A bounded arrival vignette, not an invented second mission or reconstructed palace.
 const occluders=[];
 const arrival=new THREE.Group();arrival.position.x=60;arrival.visible=false;scene.add(arrival);
 const art=world.arrivalArt,earth=art.materials.ground,stone=art.materials.stoneWall,wood=art.materials.wood;
 function box(x,y,z,w,h,d,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;arrival.add(m);return m;}
 box(0,-.12,0,160,.2,180,earth);
 for(const source of art.backdrop){const m=source.clone();arrival.add(m);}
 const gate=art.gate.clone(true);gate.position.set(0,0,-6.1);arrival.add(gate);
 for(let z=-3;z<6;z+=1.2)for(let x=-1;x<=1;x++)box(x*.85,.005,z,.79,.025,1.1,art.materials.rock);
 for(const x of [-6.5,6.5])box(x,.65,0,.6,1.3,16,stone);
 const frontWall=box(0,.65,7.6,13,1.3,.5,stone.clone());frontWall.material.transparent=true;occluders.push(frontWall);
 box(-4.3,.65,-5.7,4,1.3,.5,stone);box(4.3,.65,-5.7,4,1.3,.5,stone);
 
 const shrubMat=art.materials.leaf,shrubGeo=art.leaf;
 for(let i=0;i<34;i++){const m=new THREE.Mesh(shrubGeo,shrubMat);const side=i%2?1:-1;m.position.set(side*(6.8+(i%3)*.35),.55,-6+Math.floor(i/2)*.8);m.scale.set(.8,.7,.9);arrival.add(m);}
 for(const side of [-1,1])for(let t=0;t<3;t++){
   const x=side*(8+t%2),z=-8+t*6;
   box(x,1.65,z,.25,3.3,.25,wood);
   for(let j=0;j<24;j++){const a=j*2.4,m=new THREE.Mesh(shrubGeo,shrubMat);m.position.set(x+Math.cos(a)*(j%3)*.55,3+Math.sin(j)*.45,z+Math.sin(a)*(j%3)*.55);m.scale.set(.65,.6,.7);m.rotation.y=a;arrival.add(m);}
  }
  return{
  occluders,
  near(pos){return Math.hypot(pos.x-portalStand.x,pos.z-portalStand.z)<2;},
  enter(){door.visible=false;arrival.visible=true;art.sun.position.x+=60;art.sun.target.position.x+=60;art.sun.color.set(0xffedcb);},
  update(ready,time,reduced){
   door.visible=ready&&!arrival.visible;if(!door.visible)return;
   visual.update(time,reduced);
  }
 };
}
