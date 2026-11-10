import * as T from './vendor/three.module.js';

// One planar view per pond; targets are released with their owned water materials.
export function reflectionMaterial(base,height){
 const material=base.clone(),compile=base.onBeforeCompile;
 const size=matchMedia('(max-width: 700px)').matches?320:512;
 const target=new T.WebGLRenderTarget(size,size,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:true});
 const matrix=new T.Matrix4(),ready={value:0},texture={value:target.texture};
 const reflection={target,matrix,ready,height,updates:0,last:-Infinity,position:new T.Vector3(),rotation:new T.Quaternion(),camera:null,width:0,heightPixels:0};
 material.pondReflection=reflection;material.userData.prepared=true;
 material.onBeforeCompile=shader=>{compile(shader);shader.uniforms.pondMatrix={value:matrix};shader.uniforms.pondReflection=texture;shader.uniforms.pondReady=ready;
  shader.vertexShader='varying vec2 vPondUv;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPondUv=uv;');
  shader.fragmentShader='varying vec2 vPondUv;uniform mat4 pondMatrix;uniform sampler2D pondReflection;uniform float pondReady;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`if(pondReady>0.5){
   vec4 projected=pondMatrix*vec4(vWaterWorld,1.0);vec2 uv=projected.xy/projected.w;
   uv+=vec2(sin(vWaterWorld.z*11.0+sin(vWaterWorld.x*7.0)+uWaterTime*.5),cos(vWaterWorld.x*9.0+sin(vWaterWorld.z*5.0)-uWaterTime*.4))*.00065;
   if(projected.w>0.0&&all(greaterThanEqual(uv,vec2(0.002)))&&all(lessThanEqual(uv,vec2(0.998)))){
    vec2 px=vec2(${(1/size).toFixed(8)});vec3 reflected=texture2D(pondReflection,uv).rgb*.6+(texture2D(pondReflection,uv+vec2(px.x,0)).rgb+texture2D(pondReflection,uv+vec2(0,px.y)).rgb)*.2;
    float fres=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),3.0);
    float depth=smoothstep(.0,.85,1.0-length((vPondUv-.5)*2.0));outgoingLight=mix(outgoingLight*mix(.82,.48,depth),reflected*mix(vec3(.88,.97,.98),vec3(.64,.89,.94),depth),.42+.48*fres);diffuseColor.a=.91;
   }
  }
  #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=>base.customProgramCacheKey()+'|planar-pond-v2-'+size;
 material.addEventListener('dispose',()=>target.dispose());
 return material;
}

export function installReflection(mesh,beforeView=()=>{}){
 const r=mesh.material.pondReflection;if(!r)return;
 mesh.userData.ownMaterial=true;mesh.userData.waterSurface=true;
 const drawingSize=new T.Vector2(),position=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3();
 const look=new T.Vector3(),plane=new T.Plane(),clip=new T.Vector4(),q=new T.Vector4();let mirror;
 const viewport=new T.Vector4(),scissor=new T.Vector4(),hidden=[];
 const bias=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 mesh.onBeforeRender=(renderer,scene,camera)=>{
  renderer.getDrawingBufferSize(drawingSize);const now=performance.now();
  // shortcut: 20 Hz while moving, 10 Hz still; validate target tablets before increasing either rate.
  const moving=camera.position.distanceToSquared(r.position)>.003||1-Math.abs(camera.quaternion.dot(r.rotation))>.0002;
  if(r.camera===camera&&r.width===drawingSize.x&&r.heightPixels===drawingSize.y&&now-r.last<(moving?50:100))return;
  camera.updateMatrixWorld();position.setFromMatrixPosition(camera.matrixWorld);if(position.y<=r.height+.005)return;
  if(!mirror||mirror.type!==camera.type)mirror=camera.clone();else mirror.copy(camera,false);direction.set(0,0,-1).transformDirection(camera.matrixWorld);up.set(0,1,0).applyQuaternion(camera.quaternion);
  position.y=2*r.height-position.y;direction.y=-direction.y;up.y=-up.y;
  mirror.position.copy(position);mirror.up.copy(up);mirror.lookAt(look.copy(position).add(direction));mirror.updateMatrixWorld();
  matrixCopy(r.matrix,bias,mirror);
  plane.normal.set(0,1,0);plane.constant=-r.height-.008;plane.applyMatrix4(mirror.matrixWorldInverse);clip.set(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant);const e=mirror.projectionMatrix.elements;
  q.set((Math.sign(clip.x)+e[8])/e[0],(Math.sign(clip.y)+e[9])/e[5],-1,(1+e[10])/e[14]);clip.multiplyScalar(2/clip.dot(q));e[2]=clip.x;e[6]=clip.y;e[10]=clip.z+1-.003;e[14]=clip.w;mirror.projectionMatrixInverse.copy(mirror.projectionMatrix).invert();
  const previousTarget=renderer.getRenderTarget(),previousClipping=renderer.clippingPlanes,previousXR=renderer.xr.enabled,previousShadow=renderer.shadowMap.autoUpdate,previousScissorTest=renderer.getScissorTest();renderer.getViewport(viewport);renderer.getScissor(scissor);
  hidden.length=0;scene.traverse(o=>{if(o.visible&&(o.userData.waterSurface||o.userData.noReflection)){hidden.push(o);o.visible=false;}});
  try{renderer.xr.enabled=false;renderer.shadowMap.autoUpdate=false;renderer.setRenderTarget(r.target);renderer.setScissorTest(false);renderer.clear();beforeView(mirror);renderer.render(scene,mirror);r.ready.value=1;r.updates++;r.last=now;r.position.copy(camera.position);r.rotation.copy(camera.quaternion);r.camera=camera;r.width=drawingSize.x;r.heightPixels=drawingSize.y;}
  finally{beforeView(camera);for(const o of hidden)o.visible=true;renderer.clippingPlanes=previousClipping;renderer.xr.enabled=previousXR;renderer.shadowMap.autoUpdate=previousShadow;renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(previousScissorTest);hidden.length=0;}
 };
}
function matrixCopy(matrix,bias,camera){matrix.copy(bias).multiply(camera.projectionMatrix).multiply(camera.matrixWorldInverse);}
