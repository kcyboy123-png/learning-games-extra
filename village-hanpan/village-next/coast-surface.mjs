// Mainland shore only: shared world-space grain needs no new texture downloads.
export function coastSurface(kind='sand'){
 return {roughness:.96,defines:{COAST_ROCK:kind==='rock'?1:0},onBeforeCompile(shader){
  shader.vertexShader='varying vec3 coastPoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 shoreLocal=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    shoreLocal=instanceMatrix*shoreLocal;
   #endif
   coastPoint=(modelMatrix*shoreLocal).xyz;`);
  shader.fragmentShader='varying vec3 coastPoint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   #if COAST_ROCK == 1
    float broad=sin(coastPoint.x*2.3+sin(coastPoint.z*1.7))*sin(coastPoint.z*3.1);
   #else
    float broad=.60*sin(coastPoint.x*.19+sin(coastPoint.z*.16))+.40*sin(coastPoint.z*.27-coastPoint.x*.13);
   #endif
   vec2 grainCell=floor(coastPoint.xz*64.);
   float grain=fract(sin(dot(grainCell,vec2(127.1,311.7)))*43758.5453)-.5;
   float grainFade=1.-smoothstep(.01,.075,length(fwidth(coastPoint.xz)));
   float wet=1.-smoothstep(-.58,-.16,coastPoint.y+.035*sin(coastPoint.x*2.1+sin(coastPoint.z*1.4)));
   float reliefFade=1.-smoothstep(.08,.3,length(fwidth(coastPoint)));
   float coastRelief=(sin(coastPoint.x*7.+sin(coastPoint.z*3.))*sin(coastPoint.z*9.+coastPoint.y*19.))*.006*reliefFade;
   #if COAST_ROCK == 1
    float strata=sin(coastPoint.y*18.+sin(coastPoint.x*1.9+coastPoint.z*1.3)*1.6);
    diffuseColor.rgb*=1.+broad*.065+strata*.025+grain*grainFade*.07;
    diffuseColor.rgb*=mix(vec3(1.),vec3(.61,.77,.79),wet*.55);
    float seam=smoothstep(.91,1.,sin(coastPoint.x*7.+coastPoint.y*13.)*sin(coastPoint.z*8.-coastPoint.y*9.));
    diffuseColor.rgb*=1.-seam*.065*reliefFade;
   #else
    float ripple=sin(coastPoint.z*10.+coastPoint.x*2.+sin(coastPoint.x*.8)*3.+sin(coastPoint.z*.6));
    float turf=smoothstep(.025,.09,diffuseColor.g-diffuseColor.r)*smoothstep(-.05,.1,coastPoint.y);
    diffuseColor.rgb*=mix(vec3(1.),mix(vec3(.80,.94,.76),vec3(1.025,1.035,.91),smoothstep(.12,.88,.5+.5*broad)),turf);
    diffuseColor.rgb*=1.+broad*.065*(1.-turf)+ripple*.012*(1.-turf)+grain*grainFade*mix(.08,.12,turf);
    diffuseColor.rgb*=mix(vec3(1.),vec3(.70,.83,.84),wet*.52);
   #endif`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 shoreDx=dFdx(-vViewPosition),shoreDy=dFdy(-vViewPosition);
   vec3 shoreR1=cross(shoreDy,normal),shoreR2=cross(normal,shoreDx);
   float shoreDet=dot(shoreDx,shoreR1);
   vec3 shoreGradient=sign(shoreDet)*(dFdx(coastRelief)*shoreR1+dFdy(coastRelief)*shoreR2);
   if(abs(shoreDet)>.0000001)normal=normalize(abs(shoreDet)*normal-shoreGradient);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   roughnessFactor=mix(.96,.48,1.-smoothstep(-.58,-.16,coastPoint.y));`);
 },customProgramCacheKey:()=>`mainland-coast-${kind}-living15`};
}
