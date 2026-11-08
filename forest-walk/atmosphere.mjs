import * as T from './vendor/three.module.js';
import {worldAt} from './trail.mjs';

// A few sunlit openings, not a full-screen filter: controls and faces stay crisp.
export function createAtmosphere(scene){
  const beams=[105,124,196,229,346,411].map((s,i)=>{
    const p=worldAt(s,i%2?2.5:-2.8),g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute([-6,13,-5,-4.5,13,-5,4,0,2,-1,0,2],3));
    g.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));g.setIndex([0,1,2,0,2,3]);g.computeBoundingSphere();
    const m=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
      uniforms:{strength:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 vUv;uniform float strength;void main(){float edge=pow(max(0.,sin(vUv.x*3.14159)),2.);float end=smoothstep(0.,.22,vUv.y)*(1.-smoothstep(.78,1.,vUv.y));gl_FragColor=vec4(.94,.89,.65,edge*end*strength);}'
    });const mesh=new T.Mesh(g,m);mesh.position.copy(p);mesh.renderOrder=4;scene.add(mesh);return {s,mesh};
  });
  return {beams,update(s){for(const b of beams){const d=Math.abs(s-b.s);b.mesh.visible=d<65;b.mesh.material.uniforms.strength.value=.12*(1-T.MathUtils.smoothstep(d,22,65));}}};
}
