export function createTimeGate(THREE,camera){
 const group=new THREE.Group();camera.add(group);group.visible=false;
 const uniforms={travel:{value:0},opacity:{value:0},aspect:{value:1}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`varying vec2 vUv;uniform float travel,opacity,aspect;
   void main(){
    vec2 p=(vUv-.5)*2.;p.x*=aspect;float r=length(p),a=atan(p.y,p.x);
    float depth=-log(r+.035);
    float spiral=a*5.+depth*3.-travel*.8;
    float silk=pow(.5+.5*sin(spiral+sin(a*3.+depth)*.6),9.);
    float waves=.5+.5*sin(depth*11.+travel*5.);
    float rays=pow(.5+.5*sin(a*37.+sin(a*11.)*2.),22.);
    float flecks=pow(waves,12.)*rays;
    float center=exp(-r*17.);
    float edge=smoothstep(.1,1.5,r);
    vec3 color=mix(vec3(.04,.18,.21),vec3(.29,.64,.61),silk);
    color+=vec3(.7,.53,.23)*flecks*.7+vec3(.38,.6,.53)*center;
    float alpha=(edge*(.12+silk*.25)+flecks*.55+center*.5)*opacity;
    gl_FragColor=vec4(color,alpha);
   }`});
 const tunnel=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);tunnel.frustumCulled=false;tunnel.renderOrder=100;group.add(tunnel);
 const overlay=document.createElement('div');overlay.id='time-arrival';overlay.hidden=true;overlay.innerHTML='<span>기록 너머로</span><strong>고려 말, 어느 마을</strong>';
 Object.assign(overlay.style,{pointerEvents:'none',inset:'max(76px, env(safe-area-inset-top)) 12px auto',width:'fit-content',maxWidth:'calc(100% - 24px)',margin:'0 auto',padding:'12px 20px',borderRadius:'14px',background:'rgba(15,40,43,.84)',color:'#fff2d6'});
 Object.assign(overlay.querySelector('strong').style,{fontSize:'clamp(17px, 4vw, 24px)',marginTop:'6px'});
 document.body.append(overlay);
 let remaining=0,total=3.2,quiet=false;
 return{
  start(reduced,title='고려 말, 어느 마을'){overlay.querySelector('strong').textContent=title;quiet=reduced;total=reduced?.8:3.2;remaining=total;uniforms.opacity.value=0;overlay.style.opacity='1';overlay.hidden=false;group.visible=!quiet;},
  running:()=>remaining>0,
  update(dt,reduced){
   if(!remaining)return 0;
   if(reduced&&!quiet){quiet=true;group.visible=false;remaining=Math.min(remaining,.8);}
   remaining=Math.max(0,remaining-Math.max(0,dt));const progress=1-remaining/total;
   uniforms.travel.value=progress*1.2+progress*progress*5.;
   uniforms.opacity.value=Math.min(1,progress*7,remaining*1.5);
   uniforms.aspect.value=camera.aspect||1;
   overlay.style.opacity=String(Math.min(1,remaining*2));
   if(!remaining){overlay.hidden=true;group.visible=false;}
   return quiet?0:Math.pow(1-progress,3);
  }
 };
}
