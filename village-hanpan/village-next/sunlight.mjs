import * as T from '../lib/three.module.min.js';

// Quarter-size highlight blur; UI stays outside this scene-only lighting pass.
export function createSunlight(renderer){
 const hdr=renderer.extensions.has('EXT_color_buffer_float');
 if(!hdr)return null;
 const sceneTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true});
 sceneTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 const glowTarget=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false});
 const gl=renderer.getContext();let usable=false;
 try{
  const counts=gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA16F,gl.SAMPLES);
  sceneTarget.samples=Math.max(0,...Array.from(counts||[]).filter(n=>n<=4));
  usable=[sceneTarget,glowTarget].every(target=>{renderer.setRenderTarget(target);return gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;});
 }catch{}finally{renderer.setRenderTarget(null);}
 if(!usable){sceneTarget.dispose();glowTarget.dispose();return null;}
 const camera=new T.OrthographicCamera(-1,1,1,-1,0,1),scene=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2));scene.add(quad);
 const vertexShader='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const blur=new T.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:sceneTarget.texture},stepSize:{value:new T.Vector2()}},vertexShader,fragmentShader:`
  uniform sampler2D source;uniform vec2 stepSize;varying vec2 vUv;
  vec3 bright(vec2 uv){vec3 c=texture2D(source,uv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));return c*smoothstep(.8,1.55,l);}
  void main(){vec3 c=bright(vUv)*.20;
   c+=(bright(vUv+stepSize*vec2(1.,0.))+bright(vUv-stepSize*vec2(1.,0.))+bright(vUv+stepSize*vec2(0.,1.))+bright(vUv-stepSize*vec2(0.,1.)))*.12;
   c+=(bright(vUv+stepSize)+bright(vUv-stepSize)+bright(vUv+stepSize*vec2(1.,-1.))+bright(vUv+stepSize*vec2(-1.,1.)))*.08;
   gl_FragColor=vec4(c,1.);
  }`});
 const finish=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{source:{value:sceneTarget.texture},depthMap:{value:sceneTarget.depthTexture},inverseProjection:{value:new T.Matrix4()},contactStep:{value:new T.Vector2()},glow:{value:glowTarget.texture},amount:{value:.18},stepSize:{value:new T.Vector2()}},vertexShader,fragmentShader:`
  uniform sampler2D source,glow,depthMap;uniform mat4 inverseProjection;uniform vec2 stepSize,contactStep;uniform float amount;varying vec2 vUv;
  vec3 positionAt(vec2 uv){vec4 p=inverseProjection*vec4(uv*2.-1.,texture2D(depthMap,uv).x*2.-1.,1.);return p.xyz/p.w;}
  float contactShade(){
   vec3 p=positionAt(vUv),normal=normalize(cross(dFdx(p),dFdy(p)));float shade=0.;
   for(int i=0;i<8;i++){float a=(float(i)+.5)*.78539816;vec3 delta=positionAt(clamp(vUv+vec2(cos(a),sin(a))*contactStep,vec2(.001),vec2(.999)))-p;float d=length(delta);shade+=max(dot(normal,delta)/(d+.001)-.12,0.)*(1.-smoothstep(.10,.60,d));}
   return 1.-min(.24,shade*.16);
  }
  void main(){vec3 c=texture2D(source,vUv).rgb;
   c*=contactShade();
   vec3 b=texture2D(glow,vUv).rgb*.4;
   b+=(texture2D(glow,vUv+stepSize).rgb+texture2D(glow,vUv-stepSize).rgb+texture2D(glow,vUv+stepSize*vec2(1.,-1.)).rgb+texture2D(glow,vUv+stepSize*vec2(-1.,1.)).rgb)*.15;
   gl_FragColor=vec4(c+b*amount*vec3(1.,.92,.74),1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const size=new T.Vector2();
 return {
  resize(){renderer.getDrawingBufferSize(size);const w=Math.max(1,size.x),h=Math.max(1,size.y);sceneTarget.setSize(w,h);glowTarget.setSize(Math.max(1,Math.ceil(w/4)),Math.max(1,Math.ceil(h/4)));blur.uniforms.stepSize.value.set(7/w,7/h);finish.uniforms.stepSize.value.set(5/w,5/h);},
  season(se){finish.uniforms.amount.value=[.10,.23,.15,.20][se];},
  render(world,camera3d){try{finish.uniforms.inverseProjection.value.copy(camera3d.projectionMatrixInverse);finish.uniforms.contactStep.value.set(.26/(camera3d.right-camera3d.left),.26/(camera3d.top-camera3d.bottom));renderer.setRenderTarget(sceneTarget);renderer.render(world,camera3d);quad.material=blur;renderer.setRenderTarget(glowTarget);renderer.render(scene,camera);quad.material=finish;renderer.setRenderTarget(null);renderer.render(scene,camera);}finally{renderer.setRenderTarget(null);}},
  dispose(){sceneTarget.dispose();glowTarget.dispose();quad.geometry.dispose();blur.dispose();finish.dispose();}
 };
}
