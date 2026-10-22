export function createPortalVisual(THREE,parent){
 const group=new THREE.Group();parent.add(group);
 const uniforms={time:{value:0},opened:{value:1}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float time;uniform float opened;
   void main(){
    vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);
    float edge=1.-smoothstep(.86,1.,r);
    float curl=a*3.+log(r+.045)*6.+time*1.5;
    float thread=pow(.5+.5*sin(curl+sin(a*5.-time*.3)*.35),13.);
    float mist=.5+.5*sin(curl*.67+sin(r*15.-time)*.8);
    float rim=exp(-pow((r-.82)*25.,2.));
    float heart=exp(-r*12.);
    vec3 color=mix(vec3(.025,.14,.17),vec3(.23,.65,.63),mist*.5+thread*.45);
    color+=vec3(.49,.36,.14)*rim+vec3(.42,.67,.64)*heart;
    float alpha=edge*(.33+thread*.34+rim*.35+heart*.15);
    gl_FragColor=vec4(mix(vec3(.12,.2,.21),color,opened),alpha*(.22+.78*opened));
   }`});
 const veil=new THREE.Mesh(new THREE.PlaneGeometry(2.9,3.8),material);group.add(veil);
 const count=84,seeds=new Float32Array(count*3);
 for(let i=0;i<count;i++){seeds[i*3]=i/count;seeds[i*3+1]=(i*.61803398875)%1;seeds[i*3+2]=(i*.38196601125)%1;}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(seeds,3));
 const sparks=new THREE.Points(geometry,new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float time;varying float glow;void main(){
   float phase=fract(position.x-time*.095),r=.12+phase*.9;
   float a=position.y*6.28318+(1.-phase)*4.5+time*.12;
   vec3 p=vec3(cos(a)*r*1.3,sin(a)*r*1.7,-(1.-phase)*.75+.1);
   vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
   gl_PointSize=clamp((2.+position.z*2.)*14./max(1.,-view.z),1.,7.);
   glow=sin(phase*3.14159);
  }`,
  fragmentShader:'varying float glow;void main(){float d=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(.78,.88,.65,(1.-smoothstep(.05,1.,d))*glow*.8);}'
 }));sparks.frustumCulled=false;group.add(sparks);
 // This is a time-travel effect, not a claim about historical architecture.
 const bronze=new THREE.MeshStandardMaterial({color:0x897044,roughness:.6,metalness:.5});
 const rim=new THREE.Mesh(new THREE.TorusGeometry(1.5,.085,8,64),bronze);rim.scale.y=1.28;group.add(rim);
 const lightMaterial=new THREE.MeshBasicMaterial({color:0x86dfcb,transparent:true,opacity:.7,depthWrite:false});
 const inner=new THREE.Mesh(new THREE.TorusGeometry(1.4,.025,5,64),lightMaterial);inner.scale.y=1.28;inner.position.z=.04;group.add(inner);
 const floor=new THREE.Group();floor.position.y=-1.76;floor.rotation.x=-Math.PI/2;group.add(floor);
 for(const radius of [1.35,1.65]){
  const circle=new THREE.Mesh(new THREE.RingGeometry(radius-.025,radius,64),lightMaterial);floor.add(circle);
 }
 const glyphs=new THREE.Group();floor.add(glyphs);
 for(let i=0;i<12;i++){
  const mark=new THREE.Mesh(new THREE.PlaneGeometry(.06,.17),lightMaterial),angle=i*Math.PI/6;
  mark.position.set(Math.cos(angle)*1.5,Math.sin(angle)*1.5,.01);mark.rotation.z=angle;glyphs.add(mark);
 }
 return{group,update(time,reduced,ready=true){
  uniforms.time.value=reduced?0:time;uniforms.opened.value=ready?1:0;
  sparks.visible=ready;lightMaterial.opacity=ready?.7:.2;
  glyphs.rotation.z=ready&&!reduced?time*.06:0;
 }};
}
