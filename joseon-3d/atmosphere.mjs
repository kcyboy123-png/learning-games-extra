// Ambient motion is decorative: it never changes navigation or learning state.
export function createAtmosphere(THREE,scene,materials,chapter=1){
 const clock={value:0},strength={value:1};
 for(const material of [materials.leaf,materials.pine,materials.grass].filter(Boolean)){
  material.onBeforeCompile=shader=>{
   shader.uniforms.ambientTime=clock;shader.uniforms.ambientStrength=strength;
   shader.vertexShader='uniform float ambientTime; uniform float ambientStrength;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
     vec3 windPlace=position;
     #ifdef USE_INSTANCING
       windPlace=(instanceMatrix*vec4(position,1.0)).xyz;
     #endif
     float wind=sin(ambientTime*0.8+windPlace.x*0.24+windPlace.z*0.19);
     transformed.x+=wind*0.055*ambientStrength*clamp(position.y+0.35,0.0,1.0);
     transformed.z+=sin(ambientTime*0.6+windPlace.x*0.2)*0.025*ambientStrength*clamp(position.y+0.35,0.0,1.0);`);
  };
  material.customProgramCacheKey=()=> 'joseon-ambient-wind-v9';
 }
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d');
 const glow=ctx.createRadialGradient(64,32,2,64,32,60);glow.addColorStop(0,'rgba(245,244,227,.75)');glow.addColorStop(.6,'rgba(239,240,230,.3)');glow.addColorStop(1,'rgba(239,240,230,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,128,64);
 const texture=new THREE.CanvasTexture(canvas),cloudMat=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide,fog:true});
 const clouds=[];for(let i=0;i<7;i++){
  const cloud=new THREE.Mesh(new THREE.PlaneGeometry(17+i%3*4,9),cloudMat);cloud.rotation.x=-Math.PI/2;cloud.position.set(-40+i*13,15+i%3*2,-34+i%4*14);scene.add(cloud);clouds.push({mesh:cloud,x:cloud.position.x});
 }
 const snowy=chapter===4,rainy=chapter===1,count=snowy?420:rainy?100:0;
 const coords=new Float32Array(count*(snowy?3:6)),base=[];
 for(let i=0;i<count;i++)base.push({x:-12+(i*7.31)%25,z:snowy?-30+(i*3.13)%10:-24+(i*3.13)%38,y:(i*.73)%9});
 let weather=null;
 if(count){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(coords,3));
  weather=snowy?new THREE.Points(geometry,new THREE.PointsMaterial({map:texture,color:0xf5f4e8,size:.15,transparent:true,opacity:.9,depthWrite:false})):new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xc6d0cf,transparent:true,opacity:.25,depthWrite:false}));
  weather.frustumCulled=false;scene.add(weather);
 }
 return {weather:rainy?'light-rain':snowy?'winter-snow':'clear',update(t,reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false){
  clock.value=reduced?0:t;strength.value=reduced?0:1;
  for(const c of clouds)c.mesh.position.x=c.x+(reduced?0:Math.sin(t*.015+c.x)*9);
  if(weather){weather.visible=!reduced;if(reduced)return;
   base.forEach((p,i)=>{const y=((p.y-t*(snowy?.45:4))%9+9)%9,x=p.x+Math.sin(t*.45+i)*(snowy?.3:.04),j=i*(snowy?3:6);coords[j]=x;coords[j+1]=y;coords[j+2]=p.z;if(!snowy){coords[j+3]=x+.035;coords[j+4]=y+.24;coords[j+5]=p.z;}});weather.geometry.attributes.position.needsUpdate=true;
  }
 }};
}
