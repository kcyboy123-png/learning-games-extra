import {peopleRects,kingRect} from './people-atlas.mjs';

// Each role uses the same painterly artwork as its surroundings.
const PEOPLE={farmer:0,commoner:0,artisan:1,jungin:1,scholar:2,yangban:2,official:3,teacher:4,woman:5,nobi:5,'family-son':2,'family-daughter':5};
export const stationRoles={2:['rice-farmer','artisan','sejong','official'],3:['teacher','official','scholar','woman'],4:['woman','official','farmer','scholar'],5:['rice-farmer','teacher','woman','official'],6:['scholar','teacher','woman','farmer'],7:['scholar','artisan','woman','mask-dancer'],8:['official','woman','artisan','scholar']};
export function createPeople(THREE,scene,camera,peopleImage,kingImage,isReduced,maskImage,farmerImage){
  const textures=new Map();
  return function person(role,height=2.3,variant=0,tint){
    const king=role==='sejong',dancer=role==='mask-dancer';
    let sheet=peopleImage,rect,key,index;
    if(king){sheet=kingImage;rect=kingRect;key='king';index=3;}
    else if(dancer){sheet=maskImage;rect=[0,0,maskImage.width,maskImage.height];key='mask-dancer';index=1;}
    else if(role==='rice-farmer'){sheet=farmerImage;rect=[0,0,farmerImage.width,farmerImage.height];key='rice-farmer';index=0;}
    else{index=(role==='student'?6+variant%2:PEOPLE[role])??3;rect=peopleRects[index];key=index;}
    if(!textures.has(key)){
      const c=document.createElement('canvas');c.width=rect[2];c.height=rect[3];
      const g=c.getContext('2d');g.drawImage(sheet,...rect,0,0,c.width,c.height);
      const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.set(key,texture);
    }
    const group=new THREE.Group(),mesh=new THREE.Mesh(new THREE.PlaneGeometry(height*rect[2]/rect[3],height),new THREE.MeshStandardMaterial({map:textures.get(key),transparent:true,alphaTest:.15,roughness:1,side:THREE.DoubleSide}));
    if(tint)mesh.material.color.set(tint);
    // Breathe and turn around the feet so the cutout stays on its floor.
    mesh.geometry.translate(0,height/2,0);mesh.position.y=.04;group.add(mesh);scene.add(group);
    group.userData.role=role;
    return {group,update(_dx,_dz,t){
      const quiet=isReduced(),phase=t+index*1.7+group.position.x*.13+group.position.z*.19;
      mesh.rotation.y=Math.atan2(camera.position.x-group.position.x,camera.position.z-group.position.z)+(quiet?0:Math.sin(phase*.46)*.035);
      mesh.rotation.z=quiet?0:Math.sin(phase*.7)*.008;
      mesh.scale.y=quiet?1:1+Math.sin(phase*1.65)*.006;
    }};
  };
}
