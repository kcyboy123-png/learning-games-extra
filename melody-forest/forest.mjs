// '햇살이 머무는 숲' — a real-time three.js stage that follows the app; it never owns the song or the sound.
// Illustrated cutouts live in a real 3D woodland; vegetation is instanced to keep draw calls low.
import * as THREE from './lib/three.module.min.js';
import {pianoKey, WHITE_KEYS, loadForestArt, forestCamera, forestCharacter, forestMapId, forestAtPiano, forestOpeningShot, FOREST_OPENING_SECONDS} from './forest-state.mjs';
import {PALETTES,buildLandmarks} from './forest-landmarks.mjs';
import {createStorybookChild,backingKey} from './forest-character.mjs';
import {forestInput, forestStep, forestOrbit, forestRoute, forestLook, forestEye, forestTurnToward} from './forest-controls.mjs';

const V = (x, y, z) => new THREE.Vector3(x, y, z), C = h => new THREE.Color(h);
// The bench and the seated child sit on the keyboard centreline (22 keys centred at x=0).
const KEY_W = .058, GIRL_X = -.15, SEAT_Z = .44, SEAT_Y = .65;
const FIRST_VIEW = {yaw: .16, pitch: .04}, SEATED_ORBIT = {yaw: .31, pitch: .52, distance: 6};
const keyX = i => (i - (WHITE_KEYS - 1) / 2) * KEY_W;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mat = (m = {}) => new THREE.Matrix4().compose(m.p || V(0, 0, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(...(m.r || [0, 0, 0]))), m.s ? (typeof m.s === 'number' ? V(m.s, m.s, m.s) : V(...m.s)) : V(1, 1, 1));

// Merge parts into one vertex-coloured geometry: [geometry, transform, colour, shade(y,normal)->factor].
function merge(parts) {
  const pos = [], nor = [], col = [], c = new THREE.Color();
  for (const [g0, m, hex = 0xffffff, shade] of parts) {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    if (m) g.applyMatrix4(m);
    const p = g.attributes.position, n = g.attributes.normal, vc = g.attributes.color;
    c.set(hex);
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i));
      const k = shade ? shade(p.getY(i), n.getY(i)) : 1;
      col.push((vc ? vc.getX(i) : 1) * c.r * k, (vc ? vc.getY(i) : 1) * c.g * k, (vc ? vc.getZ(i) : 1) * c.b * k);
    }
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return out;
}
// Displace by a smooth function of direction so shared vertices stay welded.
function lumpy(g, amount, freq = 3.1) {
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const d = v.clone().normalize();
    const n = Math.sin(d.x * freq + 1.3) * Math.cos(d.y * freq * 1.3) + Math.sin(d.z * freq * 1.7 + d.x * 2.1) * .6;
    v.multiplyScalar(1 + n * amount); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
function radialTexture(inner = 'rgba(255,255,255,1)') {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const x = cv.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(.45, inner.replace(/[\d.]+\)$/, '.55)')); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function rod(a, b, r, seg = 8) {
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r, r, d.length(), seg);
  return [g, new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()), V(1, 1, 1))];
}

// ---------- scenery ----------
const PATH = new THREE.CatmullRomCurve3([V(1.9, 0, 13.5), V(1.6, 0, 8.6), V(-.9, 0, 5.7), V(.95, 0, 3.2), V(.62, 0, 1.25)]);
const WALK_FROM = .21; // she starts on the path just ahead of the entrance camera
const PATH_PTS = PATH.getSpacedPoints(60), PATH_LEN = PATH.getLength();
const pathDist = (x, z) => PATH_PTS.reduce((m, p) => Math.min(m, Math.hypot(p.x - x, p.z - z)), 99);
const groundY = (x, z) => {
  const r = Math.hypot(x, z + .6), flat = smooth(4.5, 11, r) * smooth(1.2, 3.5, pathDist(x, z));
  return flat * (.55 * Math.sin(x * .23) * Math.cos(z * .19) + .3 * Math.sin(x * .61 + z * .47) + .9 * smooth(16, 40, r));
};

function buildScenery(scene, R, leafTexture, theme=PALETTES.basic) {
  const surfaceY=(x,z)=>groundY(x,z)-(theme===PALETTES.journey?Math.min(25,Math.hypot(Math.max(0,Math.abs(x)-7),Math.max(0,z-15,-5-z))*4):0);
  const lambert = o => new THREE.MeshLambertMaterial({vertexColors: true, ...o});
  // Sky dome with a warm low sun glow, matched to the fog for a soft woodland horizon.
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {top: {value: C(theme.sky)}, hor: {value: C(theme.horizon)}, sun: {value: V(-.45, .55, -.7).normalize()}},
    vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,hor,sun;varying vec3 vP;void main(){float h=max(vP.y,0.);vec3 c=mix(hor,top,smoothstep(.05,.75,h));c+=vec3(1.,.82,.5)*pow(max(dot(vP,sun),0.),12.)*.22;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'
  }));
  scene.add(sky);

  const ground = new THREE.PlaneGeometry(150, 150, 80, 80).rotateX(-Math.PI / 2);
  const gp = ground.attributes.position, gc = [], grass = C(theme.ground), warm = C(theme.warm), deep = C(theme.deep), earth = C(0xc9b88a), tmp = new THREE.Color();
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), r = Math.hypot(x, z + .6);
    gp.setY(i, surfaceY(x, z));
    tmp.copy(deep).lerp(grass, 1 - smooth(8, 30, r)).lerp(warm, 1 - smooth(1.5, 6, r));
    tmp.lerp(earth, (1 - smooth(.25, .9, pathDist(x, z))) * .55).multiplyScalar(.92 + .1 * Math.sin(x * 1.7) * Math.sin(z * 1.3));
    gc.push(tmp.r, tmp.g, tmp.b);
  }
  ground.setAttribute('color', new THREE.Float32BufferAttribute(gc, 3)); ground.computeVertexNormals();
  // Soft painted grain prevents the meadow from reading as a flat plastic plane.
  const groundCanvas = document.createElement('canvas'); groundCanvas.width = groundCanvas.height = 512;
  const paint = groundCanvas.getContext('2d'); paint.fillStyle = '#e9ebdc'; paint.fillRect(0,0,512,512);
  const grain = rng(8037);
  for(let n=0;n<8500;n++) {const x=grain()*512,y=grain()*512,v=grain();paint.fillStyle=v<.5?'rgba(78,97,59,.055)':'rgba(255,255,231,.13)';paint.fillRect(x,y,1+grain()*3,2+grain()*5);}
  for(let n=0;n<45;n++){const x=grain()*512,y=grain()*512,r=12+grain()*38,gr=paint.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,n%3?'rgba(68,92,40,.18)':'rgba(164,132,72,.16)');gr.addColorStop(1,'rgba(80,100,50,0)');paint.fillStyle=gr;paint.fillRect(x-r,y-r,r*2,r*2);}
  const groundTexture = new THREE.CanvasTexture(groundCanvas);groundTexture.colorSpace=THREE.SRGBColorSpace;groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;groundTexture.repeat.set(12,12);
  const groundMesh = new THREE.Mesh(ground, lambert({map:groundTexture})); groundMesh.receiveShadow = true; scene.add(groundMesh);

  const glow = radialTexture();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(5, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({map: glow, color: 0xffe6a6, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, fog: false}));
  pool.position.set(.3, .03, -.4); pool.scale.set(1.2, 1, 1); scene.add(pool);
  const pathLight=pool.clone();pathLight.material=pool.material.clone();pathLight.material.opacity=.16;
  pathLight.position.set(1,surfaceY(1,8)+.025,8);pathLight.scale.set(.65,1,.85);scene.add(pathLight);

  const add = (geo, material, list, colorFn, shadow) => {
    const m = new THREE.InstancedMesh(geo, material, list.length);
    list.forEach((t, i) => { m.setMatrixAt(i, mat(t)); if (colorFn) m.setColorAt(i, colorFn(t, i)); });
    if (shadow) m.castShadow = true;
    m.receiveShadow = true; scene.add(m); return m;
  };

  // Stepping stones winding from the entrance to the bench.
  const stoneGeo = merge([[new THREE.CylinderGeometry(.3, .33, .09, 24, 1), null, 0xd9d0bc, (y, ny) => ny > .5 ? 1.08 : .78]]);
  const stones = [];
  for (let k = 0; k < 19; k++) { const t = .02 + k * .052, p = PATH.getPointAt(Math.min(.97, t)), side = (k % 2 ? 1 : -1) * .12;
    stones.push({p: V(p.x + side, surfaceY(p.x, p.z) + .035, p.z), r: [0, R() * 3, 0], s: [.8 + R() * .45, 1, .7 + R() * .35]}); }
  add(stoneGeo, lambert(), stones, () => C(0xffffff).multiplyScalar(.9 + R() * .15));

  // Mossy rocks: faceted stone with moss baked on upward faces.
  const rockBase = lumpy(new THREE.IcosahedronGeometry(1, 3), .09, 2.3);
  const rockGeo = merge([[rockBase, null, 0xb7ae9c, (y, ny) => ny > .45 ? 1 : .82]]), rc = rockGeo.attributes.color, rn = rockGeo.attributes.normal, moss = C(0x7d9a45);
  for(let i=0;i<rc.count;i++){const c=new THREE.Color(rc.getX(i),rc.getY(i),rc.getZ(i));c.lerp(moss,smooth(.15,.8,rn.getY(i)));rc.setXYZ(i,c.r,c.g,c.b);}
  const rocks = [[-1.9, -.4, .55], [2.3, .6, .4], [-2.6, 2.2, .35], [1.9, 5.4, .45], [-2.1, 7.4, .6], [3.1, -2.6, .7], [-3.4, -2.9, .9], [3.6, 9.5, .5], [-.4, 10.4, .38], [2.8, 2.2, .3], [-1.4, 4.0, .28]];
  add(rockGeo, lambert({flatShading: false}), rocks.map(([x, z, s]) => ({p: V(x, surfaceY(x, z) + s * .15, z), r: [R() * .4, R() * 6, 0], s: [s * 1.2, s * .65, s]})), null, true);

  // Trees: flared trunks + layered lumpy canopy clusters, placed to frame the clearing and keep sightlines clear.
  const trunkG = new THREE.CylinderGeometry(.18, .29, 1, 16, 8, true).translate(0, .5, 0), tp = trunkG.attributes.position;
  for (let i = 0; i < tp.count; i++) { const y = tp.getY(i), f = 1 + .55 * (1 - y) ** 6 + .055 * Math.sin(Math.atan2(tp.getZ(i),tp.getX(i))*9 + y*3); tp.setX(i, tp.getX(i) * f + Math.sin(y*3.8)*.09); tp.setZ(i, tp.getZ(i) * f+Math.sin(y*5)*.055); }
  trunkG.computeVertexNormals();
  const barkCanvas=document.createElement('canvas'); barkCanvas.width=256; barkCanvas.height=512;
  const bx=barkCanvas.getContext('2d'); bx.fillStyle='#9a8163'; bx.fillRect(0,0,256,512);
  for(let i=0;i<210;i++){const x=R()*256;bx.strokeStyle=i%3?'rgba(49,40,28,.22)':'rgba(231,211,167,.25)';bx.lineWidth=.5+R()*2;bx.beginPath();bx.moveTo(x,0);for(let y=0;y<=512;y+=16)bx.lineTo(x+Math.sin(y*.024+i)*3,y);bx.stroke();}
  const bark=new THREE.CanvasTexture(barkCanvas);bark.colorSpace=THREE.SRGBColorSpace;bark.wrapS=bark.wrapT=THREE.RepeatWrapping;bark.repeat.set(2,3);
  const trunkGeo=trunkG;
  const trunkMaterial=new THREE.MeshLambertMaterial({map:bark,color:0xb4a080});
  const trunks = [], leaves = [], greens = [0x5f8f3e, 0x6e9e44, 0x86ad4c, 0x4f7f3a, 0x9bb957];
  const clear = (x, z) => Math.hypot(x, z + .6) > 6.2 && pathDist(x, z) > 2.8 && !(z > 3 && x > 1 && Math.abs(z / Math.max(x, .01) - 1.5) < .9) && !(z > 2 && Math.abs(x - 2.6) < 2.8);
  let tries = 0;
  while (trunks.length < theme.trees && tries++ < 900) {
    const a = R() * Math.PI * 2, r = 6.4 + R() * 9, x = Math.cos(a) * r, z = Math.sin(a) * r - 1.5;
    if (!clear(x, z) || trunks.some(t => Math.hypot(t.p.x - x, t.p.z - z) < 2.4)) continue;
    const h = 5 + R() * 3, s = .9 + R() * .5, y = surfaceY(x, z) - .1;
    trunks.push({p: V(x, y, z), r: [(R() - .5) * .08, R() * 6, (R() - .5) * .08], s: [s, h, s]});
    for (let k = 0; k < 3; k++) leaves.push({p: V(x + (R() - .5) * 1.6, y + h - .3 + k * .9 + R() * .4, z + (R() - .5) * 1.6), r: [0, R() * 6, 0], s: [1.6 + R() * .9, 1.15 + R() * .5, 1.6 + R() * .9], c: greens[Math.floor(R() * 5)]});
  }
  // High canopy fringe so the sky reads as a clearing, and a far ring of hazy woodland that fades into the fog.
  for (let k = 0; k < (theme.farTrees ? 16 : 0); k++) { const a = k / 16 * Math.PI * 2 + R() * .2, r = 11 + R() * 4, x = Math.cos(a) * r, z = Math.sin(a) * r - 2;
    if (z > 5 && x > -1) continue; leaves.push({p: V(x, 8.8 + R() * 2.5, z), r: [0, R() * 6, 0], s: [2.6 + R(), 1.4, 2.6 + R()], c: greens[k % 5]}); }
  for (let k = 0; k < theme.farTrees; k++) { const a = R() * Math.PI * 2, r = 22 + R() * 30, x = Math.cos(a) * r, z = Math.sin(a) * r, y = surfaceY(x, z), h = 4 + R() * 5;
    trunks.push({p: V(x, y - .2, z), r: [0, R() * 6, 0], s: [1.2, h, 1.2]});
    leaves.push({p: V(x, y + h + .5, z), r: [0, R() * 6, 0], s: [2.6 + R() * 1.5, 2.4 + R() * 1.6, 2.6 + R() * 1.5], c: [0x4f7a4a, 0x5d8a52, 0x6f9a5a][k % 3]}); }
  // Bushes hugging the clearing edge.
  for (let k = 0; k < 34; k++) { const a = R() * Math.PI * 2, r = 4.6 + R() * 3.4, x = Math.cos(a) * r, z = Math.sin(a) * r - .8;
    if (pathDist(x, z) < 1.6 || (z > 2 && Math.abs(x - 2.6) < 2.4)) continue;
    leaves.push({p: V(x, surfaceY(x, z) + .25, z), r: [0, R() * 6, 0], s: [.55 + R() * .5, .45 + R() * .3, .55 + R() * .5], c: greens[(k + 2) % 5]}); }
  add(trunkGeo, trunkMaterial, trunks, null, true);
  // Forking limbs are visible through the small openings between the illustrated leaf cards.
  const limbParts=[];
  for(const t of trunks.filter(t=>Math.hypot(t.p.x,t.p.z)<22))for(let i=0;i<5;i++){
    const a=i*2.4+t.r[1],h=t.s[1],y=t.p.y+h*(.55+i*.045),x=t.p.x,z=t.p.z;
    const points=[V(x,y,z),V(x+Math.cos(a)*.55,y+h*.12,z+Math.sin(a)*.55),V(x+Math.cos(a+.15)*1.05,y+h*.22,z+Math.sin(a+.15)*1.05),V(x+Math.cos(a+.22)*1.5,y+h*.27,z+Math.sin(a+.22)*1.5)];
    for(let n=0;n<3;n++){const [g,m]=rod(points[n],points[n+1],[.095,.06,.025][n],7);limbParts.push([g,m,0x806d50]);}
  }
  const limbs=new THREE.Mesh(merge(limbParts),lambert());limbs.castShadow=true;scene.add(limbs);
  const cards=[];
  for(const t of leaves){const near=Math.hypot(t.p.x,t.p.z)<23,bush=t.p.y<2;
    for(let j=0;j<(bush?18:near?22:10);j++){
      const a=R()*Math.PI*2,v=R()*1.8-.9,r=Math.sqrt(1-v*v);
      cards.push({p:V(t.p.x+Math.cos(a)*r*t.s[0]*.82,t.p.y+v*t.s[1]*.75,t.p.z+Math.sin(a)*r*t.s[2]*.82),r:[(R()-.5)*1.4,a,R()*.8-.4],s:(bush?.55:1.2)+R()*(bush?.5:1.5),c:bush?0xd3dfaf:0xe3e9c9});
    }
  }
  const foliageMaterial=new THREE.MeshLambertMaterial({map:leafTexture,alphaTest:.35,side:THREE.DoubleSide,color:theme.leaf,emissive:theme.leaf,emissiveMap:leafTexture,emissiveIntensity:.28});
  const foliage=add(new THREE.PlaneGeometry(1,1),foliageMaterial,cards,t=>C(t.c),true);
  // Alpha-tested shadow material prevents rectangular card shadows.
  foliage.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafTexture,alphaTest:.35,side:THREE.DoubleSide});
  const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.42,.35,-.3,.75,0,1);leafShape.bezierCurveTo(.3,.75,.42,.35,0,0);
  const smallLeaf=new THREE.ShapeGeometry(leafShape,3),lp=smallLeaf.attributes.position;
  for(let i=0;i<lp.count;i++)lp.setZ(i,Math.sin(lp.getY(i)*Math.PI)*.12-Math.abs(lp.getX(i))*.18);
  smallLeaf.computeVertexNormals();
  // Small fern beds supply a finer foreground scale than the tree crowns.
  const fernParts=[];
  for(let f=0;f<7;f++) {
    const a=f*Math.PI*2/7;
    for(let n=1;n<9;n++) {
      const d=n/9, x=Math.sin(a)*d*.55,z=Math.cos(a)*d*.55,y=Math.sin(d*Math.PI*.85)*.42;
      for(const side of [-1,1]) fernParts.push([smallLeaf,mat({p:V(x,y,z),r:[-.9,a+side*.8,side*.7],s:[.18*(1-d*.7),.25*(1-d*.7),.18]}),f%2?0x7da85c:0x4f8652]);
    }
  }
  const fernSpots=[];
  for(let i=0;i<100;i++) {const a=R()*6.28,r=2.5+R()*9,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(pathDist(x,z)<.8 || Math.hypot(x,z+.9)<2)continue;
    fernSpots.push({p:V(x,surfaceY(x,z),z),r:[0,R()*6.28,0],s:.55+R()*.6});
  }
  add(merge(fernParts),lambert({side:THREE.DoubleSide}),fernSpots);

  // Flowers in three tints along the path and the clearing rim; grass tufts everywhere close.
  const flower = (petal) => { const parts = [[new THREE.CylinderGeometry(.006, .008, .2, 4), mat({p: V(0, .1, 0)}), 0x5d8a3a]];
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; parts.push([new THREE.SphereGeometry(.034, 6, 4), mat({p: V(Math.cos(a) * .036, .2, Math.sin(a) * .036), r: [0, -a, 0], s: [1.15, .32, .62]}), petal]); }
    parts.push([new THREE.SphereGeometry(.02, 6, 4), mat({p: V(0, .208, 0)}), 0xf3b63f]); return merge(parts); };
  const flowerMat = lambert();
  [0xf6a5b8, 0xfff6ea, 0xc8b2ee].forEach((tint, f) => {
    const list = [];
    for (let k = 0; k < 70; k++) { let x, z;
      if (k < 34) { const p = PATH.getPointAt(R() * .97), side = R() < .5 ? -1 : 1; x = p.x + side * (.55 + R() * .9); z = p.z + (R() - .5) * .6; }
      else { const a = R() * Math.PI * 2, r = 2.6 + R() * 4.5; x = Math.cos(a) * r; z = Math.sin(a) * r - .6; }
      if (Math.hypot(x - GIRL_X, z - .3) < 1.9 || Math.hypot(x, z + .9) < 1.9 || pathDist(x, z) < .45) continue;
      list.push({p: V(x, surfaceY(x, z), z), r: [(R() - .5) * .3, R() * 6, (R() - .5) * .3], s: .9 + R() * .9});
    }
    add(flower(tint), flowerMat, list);
  });
  const bladeParts=[];
  for(let k=0;k<4;k++){
    const pos=[],indices=[],h=.25+k*.035;
    for(let j=0;j<=4;j++){const t=j/4,w=.019*(1-t)+.001;pos.push(-w,h*t,t*t*.16,w,h*t,t*t*.16);if(j<4){const n=j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(indices);g.computeVertexNormals();
    bladeParts.push([g,mat({r:[(k-2)*.12,k*1.3,0]}),0xffffff,y=>.5+y*1.4]);
  }
  const tufts = [];
  for (let k = 0; k < 4200; k++) { const a = R() * Math.PI * 2, r = 1.7 + R() * 11, x = Math.cos(a) * r, z = Math.sin(a) * r - .6;
    if (pathDist(x, z) < .5 || Math.hypot(x, z + .9) < 1.7 || Math.hypot(x - GIRL_X, z - .4) < 1) continue;
    tufts.push({p: V(x, surfaceY(x, z), z), r: [0, R() * 6, 0], s: .4 + R() * .7, c: [0x7fae4c, 0x93b957, 0x6c9a44][k % 3]}); }
  const grassTime={value:0},grassMaterial=lambert({side:THREE.DoubleSide});
  grassMaterial.onBeforeCompile=shader=>{shader.uniforms.grassTime=grassTime;shader.vertexShader='uniform float grassTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(grassTime*1.4 + instanceMatrix[3].x*.8 + instanceMatrix[3].z*.4)*.045*pow(clamp(position.y/.4,0.,1.),2.);');};
  add(merge(bladeParts),grassMaterial,tufts,t=>C(t.c));

  // Quiet, close-up details sit beside the path, leaving the playable clearing open.
  const detailRandom=rng(431902), mushroomBeds=[[-2.3,2.5],[2.8,2.8],[-2.2,5.5],[3.2,6.4],[-3.1,-1.8],[2.7,-2.2]];
  const caps=new THREE.LatheGeometry([[0,.18],[.05,.18],[.12,.19],[.125,.205],[.1,.255],[.045,.285],[0,.29]].map(([x,y])=>new THREE.Vector2(x,y)),12);
  const stem=new THREE.CylinderGeometry(.022,.033,.19,8).translate(0,.095,0);
  [0xb9774e,0xe7d5a8].forEach(color=>{
    const parts=[[stem,null,0xf2e7ce],[caps,null,color,(y,ny)=>ny<-.2?.8:1]];
    for(let j=0;j<4;j++){const a=j*Math.PI/2+.4;parts.push([new THREE.SphereGeometry(.018,6,3),mat({p:V(Math.cos(a)*.068,.269,Math.sin(a)*.068),s:[1,.18,.7]}),0xf5e8cd]);}
    const clusters=[];
    mushroomBeds.forEach(([x,z])=>{for(let j=0;j<3;j++){
      const a=detailRandom()*Math.PI*2,r=.12+detailRandom()*.3,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
      clusters.push({p:V(px,surfaceY(px,pz),pz),r:[0,detailRandom()*6.28,(detailRandom()-.5)*.13],s:.48+detailRandom()*.65});
    }});
    add(merge(parts),lambert(),clusters);
  });
  caps.dispose();stem.dispose();
  const litter=[];
  for(let i=0;i<100;i++){
    const a=detailRandom()*Math.PI*2,r=2.3+detailRandom()*5,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(pathDist(x,z)<.6)continue;
    litter.push({p:V(x,surfaceY(x,z)+.025,z),r:[-Math.PI/2,0,detailRandom()*6.28],s:[.14+detailRandom()*.1,.18+detailRandom()*.12,.2],c:[0xbfa05a,0xd1b66d,0x9e794b][i%3]});
  }
  add(smallLeaf.clone(),new THREE.MeshLambertMaterial({side:THREE.DoubleSide}),litter,t=>C(t.c));

  // Warm sun shafts: open cones with a view-angle fade, additive, never writing depth.
  const sunDir = V(-.5, 1, -.45).normalize(), shaftMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: {color: {value: C(0xffdf9e)}, opacity: {value: .22}},
    vertexShader: 'varying float vF;varying float vV;void main(){vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);vec3 n=normalize(mat3(modelMatrix*instanceMatrix)*normal);vF=abs(dot(n,normalize(cameraPosition-w.xyz)));vV=position.y+.5;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: 'uniform vec3 color;uniform float opacity;varying float vF;varying float vV;void main(){float a=pow(vF,2.2)*smoothstep(0.,.3,vV)*smoothstep(1.,.55,vV);gl_FragColor=vec4(color,a*opacity);\n#include <colorspace_fragment>\n}'
  });
  const shafts = [[.4, -.3, 1.25], [-3.4, -4.2, 1.0], [3.4, -3.5, .9], [-4.2, 1.8, .8], [2.6, 4.4, .75], [-1.2, 6.5, .6], [2.1,8.7,.7],[-2.6,9.4,.55]].map(([x, z, s]) =>
    ({p: V(x, 0, z).addScaledVector(sunDir, 7.5), r: [0, 0, 0], s: [s, 16, s], q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), sunDir)}));
  const shaftMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.55, 1.5, 1, 20, 1, true), shaftMat, shafts.length);
  shafts.forEach((t, i) => shaftMesh.setMatrixAt(i, new THREE.Matrix4().compose(t.p, t.q, V(...t.s))));
  shaftMesh.renderOrder = 2; scene.add(shaftMesh);

  // Drifting motes of light in the clearing.
  const N = 170, mp = new Float32Array(N * 3), base = [];
  for (let i = 0; i < N; i++) { const b = [(R() - .5) * 11, .3 + R() * 4.5, (R() - .5) * 11 - .5, R() * 6.3]; base.push(b); mp.set(b.slice(0, 3), i * 3); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({map: glow, color: 0xffe3a0, size: .085, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85}));
  motes.renderOrder = 3; scene.add(motes);
  const colliders = [...rocks.map(([x,z,s])=>({x,z,radius:s*1.2,height:s*1.2})), ...trunks.map(t=>({x:t.p.x,z:t.p.z,radius:t.s[0]*.45,height:20}))];
  return {sky,shaftMat, motes, moteBase: base, glow, grassTime, colliders};
}

// ---------- grand piano and bench ----------
function caseShape(s = 1) {
  const sh = new THREE.Shape();
  sh.moveTo(-.72 * s, 0); sh.lineTo(.72 * s, 0); sh.lineTo(.72 * s, .25 * s);
  sh.bezierCurveTo(.72 * s, .78 * s, .26 * s, .86 * s, .18 * s, 1.32 * s);
  sh.bezierCurveTo(.11 * s, 1.74 * s, -.06 * s, 1.88 * s, -.36 * s, 1.88 * s);
  sh.quadraticCurveTo(-.72 * s, 1.88 * s, -.72 * s, 1.55 * s); sh.lineTo(-.72 * s, 0);
  return sh;
}
function buildPiano(scene) {
  const g = new THREE.Group(); g.position.set(0, 0, .02); scene.add(g);
  const BOTTOM = .63, H = .27, TOP = BOTTOM + H, IVORY = 0xf4ead4, WOOD = 0xb57f4c, GOLD = 0xffffff;
  const flat = (geo) => geo.rotateX(-Math.PI / 2); // shape (x, depth) → floor plan (x, -z)
  const body = flat(new THREE.ExtrudeGeometry(caseShape(), {depth: H, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 4, curveSegments: 36}));
  const lid = flat(new THREE.ExtrudeGeometry(caseShape(), {depth: .022, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 2, curveSegments: 36})).translate(.72, 0, 0);
  const inner = flat(new THREE.ShapeGeometry(caseShape(.9), 36)), plate = flat(new THREE.ShapeGeometry(caseShape(.72), 36));
  const LID = .58, lidM = mat({p: V(-.72, TOP + .03, 0), r: [0, 0, LID]});
  const legPts = [[.034, 0], [.05, .04], [.044, .1], [.05, .25], [.064, .42], [.08, .55], [.095, .6], [.06, .63]].map(([r, y]) => new THREE.Vector2(r, y));
  const leg = new THREE.LatheGeometry(legPts, 18);
  const lacquer = [
    [body, mat({p: V(0, BOTTOM, 0)}), IVORY, (y, ny) => ny < -.5 ? .72 : 1],
    [lid, lidM, IVORY],
    [inner, mat({p: V(.07, TOP + .029, -.1)}), WOOD],
    [new THREE.BoxGeometry(1.48, .07, .27), mat({p: V(0, .66, .12)}), IVORY],                       // keybed
    [new THREE.BoxGeometry(.08, .12, .3), mat({p: V(-.7, .72, .12)}), IVORY], [new THREE.BoxGeometry(.08, .12, .3), mat({p: V(.7, .72, .12)}), IVORY], // key cheeks
    [new THREE.BoxGeometry(1.32, .07, .05), mat({p: V(0, .77, -.015), r: [-.25, 0, 0]}), 0x5b3a26], // fallboard
    [new THREE.BoxGeometry(.62, .3, .018), mat({p: V(0, TOP + .2, -.16), r: [-.28, 0, 0]}), WOOD],  // music stand
    [new THREE.BoxGeometry(.18, .24, .012), mat({p: V(-.09, TOP + .22, -.145), r: [-.28, .12, 0]}), 0xfffcf2], // open notebook
    [new THREE.BoxGeometry(.18, .24, .012), mat({p: V(.09, TOP + .22, -.145), r: [-.28, -.12, 0]}), 0xfffcf2],
    [new THREE.BoxGeometry(.22, .1, .08), mat({p: V(0, .1, -.42)}), WOOD]                           // lyre box
  ];
  for (const [x, z] of [[-.6, -.14], [.6, -.14], [-.3, -1.62]]) lacquer.push([leg, mat({p: V(x, BOTTOM - .63, z)}), IVORY, y => .8 + y * .35]);
  const gold = [[plate, mat({p: V(.12, TOP + .033, -.22)}), GOLD]];
  for(let i=0;i<36;i++) {const k=i/35;gold.push(rod(V(-.59+k*1.12,TOP+.045,-.29),V(-.57+k*.46,TOP+.045,-1.59+k*.3),.0015,4));}
  const rim = caseShape().getSpacedPoints(120).map(p => V(p.x, TOP + .026, -p.y));
  gold.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 240, .011, 6, true), null, GOLD]);
  gold.push([new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim.map(p => V(p.x, BOTTOM + .02, p.z)), true), 240, .009, 6, true), null, GOLD]);
  const lidPoint = V(.95, 0, -.75).applyMatrix4(lidM);
  gold.push(rod(V(.42, TOP + .03, -.75), lidPoint, .009));
  gold.push(rod(V(-.06, .14, -.42), V(-.06, BOTTOM, -.42), .011), rod(V(.06, .14, -.42), V(.06, BOTTOM, -.42), .011));
  for (const x of [-.06, 0, .06]) gold.push([new THREE.BoxGeometry(.03, .012, .1), mat({p: V(x, .05, -.32)}), GOLD]);
  for (const [x, z] of [[-.6, -.14], [.6, -.14], [-.3, -1.62]]) gold.push([new THREE.SphereGeometry(.03, 12, 8), mat({p: V(x, .03, z)}), GOLD], [new THREE.TorusGeometry(.062, .01, 6, 18), mat({p: V(x, .5, z), r: [Math.PI / 2, 0, 0]}), GOLD]);
  // Bench: rose velvet cushion on curved wooden legs.
  const cushion = new THREE.Shape(); { const w = .32, d = .17, r = .05; cushion.moveTo(-w + r, -d); cushion.lineTo(w - r, -d); cushion.quadraticCurveTo(w, -d, w, -d + r); cushion.lineTo(w, d - r); cushion.quadraticCurveTo(w, d, w - r, d); cushion.lineTo(-w + r, d); cushion.quadraticCurveTo(-w, d, -w, d - r); cushion.lineTo(-w, -d + r); cushion.quadraticCurveTo(-w, -d, -w + r, -d); }
  const bx = GIRL_X, bz = SEAT_Z + .02;
  lacquer.push([flat(new THREE.ExtrudeGeometry(cushion, {depth: .05, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 4, curveSegments: 8})), mat({p: V(bx, SEAT_Y - .1, bz)}), 0xd98d8f, (y, ny) => .8 + ny * .25]);
  lacquer.push([new THREE.BoxGeometry(.62, .05, .32), mat({p: V(bx, SEAT_Y - .12, bz)}), WOOD]);
  for (const [x, z] of [[-.27, -.13], [.27, -.13], [-.27, .13], [.27, .13]]) lacquer.push([leg, mat({p: V(bx + x, 0, bz + z), s: [.6, .87, .6]}), WOOD]);
  const lacquerMat = new THREE.MeshStandardMaterial({vertexColors: true, roughness: .3, envMapIntensity: .8});
  const goldMat = new THREE.MeshStandardMaterial({color: 0xe0b45c, metalness: .85, roughness: .3, envMapIntensity: 1.2});
  const caseMesh = new THREE.Mesh(merge(lacquer), lacquerMat), goldMesh = new THREE.Mesh(merge(gold), goldMat);
  caseMesh.castShadow = caseMesh.receiveShadow = goldMesh.castShadow = true; g.add(caseMesh, goldMesh);
  // Modelled keys: 22 white (C3–C6) and their black keys; pressed keys tilt down and glow.
  const white = new THREE.InstancedMesh(new THREE.BoxGeometry(KEY_W - .004, .024, .16), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .35}), WHITE_KEYS);
  const blacks = [];
  for (let i = 0; i < WHITE_KEYS - 1; i++) if (![2, 6].includes(i % 7)) blacks.push(i);
  const black = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, .028, .095), new THREE.MeshStandardMaterial({color: 0x241c1c, roughness: .25}), blacks.length);
  blacks.forEach((i, k) => black.setMatrixAt(k, mat({p: V(keyX(i) + KEY_W / 2, .745, .07)})));
  white.castShadow = black.castShadow = true; g.add(white, black);
  const base = C(0xfffbf0), hot = C(0xffcf6e), tmpC = new THREE.Color(), press = new Float32Array(WHITE_KEYS);
  function drawKeys() {
    for (let i = 0; i < WHITE_KEYS; i++) {
      white.setMatrixAt(i, mat({p: V(keyX(i), .72 - press[i] * .007, .12), r: [press[i] * .06, 0, 0]}));
      white.setColorAt(i, tmpC.copy(base).lerp(hot, press[i] * .85));
    }
    white.instanceMatrix.needsUpdate = true; white.instanceColor.needsUpdate = true;
  }
  drawKeys();
  return {group: g, press, drawKeys, keyWorld: i => V(keyX(i), .73, .14 + g.position.z)};
}

// ---------- complete storybook illustration for the opening and the piano ----------
function buildGirl(scene, atlas, seatedGirl, seatedBoy, posesGirl, posesBoy) { return createStorybookChild(scene,atlas,seatedGirl,seatedBoy,posesGirl,posesBoy); }

// ---------- stage ----------
export async function createForest(host, {onEvent = () => {}} = {}) {
  const loader=new THREE.TextureLoader();
  const art=await loadForestArt(loader,['./assets/forest/children-storybook-v3.png','./assets/forest/leaf-cluster-v2.png','./assets/forest/girl-storybook-v2.png','./assets/forest/boy-seated-v4.png','./assets/forest/girl-playing-poses-v1.png','./assets/forest/boy-playing-poses-v1.png']);
  const [girlAtlas,leafTexture,seatedGirl,seatedBoy,posesGirl,posesBoy]=art;
  for(const t of art){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;}
  const canvas = document.createElement('canvas'); canvas.className = 'forest-canvas'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance'}); }
  catch (e) { art.forEach(t=>t.dispose());throw new Error('WebGL unavailable', {cause: e}); }
  host.append(canvas);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), R = rng(20261021);
  scene.fog = new THREE.Fog(0xdce2cb, 17, 60); scene.background = C(0xe4e6c2);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 220);
  const ambient=new THREE.HemisphereLight(0xe9f4eb, 0x667b55, .95);scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffedc8, 2.0); sun.position.set(-6, 12, -5.5); sun.target.position.set(.2, 0, -.3);
  sun.castShadow = true; Object.assign(sun.shadow.camera, {left: -12, right: 12, top: 12, bottom: -12, near: 2, far: 30});
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xffeedd, .55); fill.position.set(4, 3, 6); scene.add(fill);
  let mapId='basic',theme=PALETTES.basic,scenery=new THREE.Group();scene.add(scenery);
  let world=buildScenery(scenery,R,leafTexture,theme),landmarks=buildLandmarks(scenery,mapId,groundY,leafTexture);
  const piano=buildPiano(scene),girl=buildGirl(scene,girlAtlas,seatedGirl,seatedBoy,posesGirl,posesBoy);
  girl.textures.forEach(t=>renderer.initTexture(t));
  // Soft contact shadows under piano, bench and girl, on top of the real sun shadow.
  const shadowMat = new THREE.MeshBasicMaterial({map: radialTexture('rgba(0,0,0,1)'), transparent: true, opacity: .42, depthWrite: false, color: 0x2a3a1a, fog: false});
  const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const blobs = [[0, -.85, 1.9, 2.6], [GIRL_X, SEAT_Z, .9, .55]].map(([x, z, w, d]) => { const b = new THREE.Mesh(blobGeo, shadowMat); b.position.set(x, .015, z); b.scale.set(w, 1, d); scene.add(b); return b; });
  const girlBlob = new THREE.Mesh(blobGeo, shadowMat); girlBlob.scale.set(.6, 1, .6); scene.add(girlBlob);
  // Image-based light from the scene's own sky, so ivory lacquer and gold read as real materials.
  let env;
  function refreshEnvironment(){
    const pmrem=new THREE.PMREMGenerator(renderer),envScene=new THREE.Scene();
    envScene.add(world.sky.clone());
    const ground=new THREE.Mesh(new THREE.CircleGeometry(60,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:theme.ground}));
    ground.position.y=-1;envScene.add(ground);
    const next=pmrem.fromScene(envScene,.04);scene.environment=next.texture;env?.dispose();env=next;
    pmrem.dispose();ground.geometry.dispose();ground.material.dispose();
  }
  refreshEnvironment();
  function releaseScenery(group){
    const geometries=new Set(),materials=new Set(),textures=new Set();
    group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[],o.customDepthMaterial||[])){materials.add(m);for(const v of Object.values(m))if(v?.isTexture&&v!==leafTexture)textures.add(v);}});
    textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());
  }
  function setMap(id){
    id=forestMapId(id);if(id===mapId)return;
    const nextTheme=PALETTES[id],next=new THREE.Group();
    let nextWorld,nextLandmarks;
    try{nextWorld=buildScenery(next,rng(20261021),leafTexture,nextTheme);nextLandmarks=buildLandmarks(next,id,groundY,leafTexture);}
    catch(error){releaseScenery(next);throw error;}
    scene.remove(scenery);releaseScenery(scenery);scenery=next;scene.add(scenery);
    mapId=id;theme=nextTheme;world=nextWorld;landmarks=nextLandmarks;world.colliders.push(...landmarks.colliders);
    scene.fog.color.set(theme.fog);scene.fog.near=id==='journey'?35:17;scene.fog.far=id==='journey'?100:60;scene.background.set(theme.horizon);
    ambient.intensity=theme.ambient;sun.color.set(theme.sun);sun.intensity=theme.power;fill.intensity=mapId==='dream'||mapId==='moon'?.3:.55;
    renderer.toneMappingExposure=theme.exposure;world.shaftMat.uniforms.opacity.value=theme.shafts;
    input={x:0,z:0};state.moving=false;route=[];routeIndex=0;state.hands.forEach(h=>h.hit=0);
    if(forestCamera(state.phase)!=='seated'){placeOnPath(WALK_FROM);view={...FIRST_VIEW};state.openingT=motion.matches?1:0;shotFor(state.phase==='opening'?'opening':'arrive');camPos.copy(goalPos);camLook.copy(goalLook);}
    piano.press.fill(0);piano.drawKeys();refreshEnvironment();
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {phase: null, visible: false, cinema: false, openingT: 0, walkT: 0, sitT: 0, seated: 0, time: 0, cineT: 0, lift: 0, hands: [{x: 0, hit: 0, key: -1}, {x: 0, hit: 0, key: -1}], dead: false};
  Object.assign(state, {moving:false, heading:Math.PI, walkDistance:0});
  // `view` is the first-person look while exploring; `orbit` is the optional free view around the seated child.
  let input = {x:0,z:0}, view = {...FIRST_VIEW}, orbit = {...SEATED_ORBIT}, orbitChanged = false, route = [], routeIndex = 0;
  const camPos = V(2.6, 2.1, 12.8), camLook = V(0, 1, 2), goalPos = V(), goalLook = V();
  let raf = 0, last = 0, frame = 0;

  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 52 : 40; camera.updateProjectionMatrix();
  }
  function placeOnPath(t) {
    const p = PATH.getPointAt(t), d = PATH.getTangentAt(t);
    girl.root.position.set(p.x, groundY(p.x, p.z), p.z); girl.root.rotation.y = Math.atan2(d.x, d.z);
  }
  function setSeated(k) { state.seated = k; }
  // Puts the (still hidden) player on the bench and forgets any earlier free look, so the seated shot is always external.
  function takeSeat() { setSeated(1); girl.root.position.set(GIRL_X, 0, SEAT_Z); girl.root.rotation.y = Math.PI; orbit = {...SEATED_ORBIT}; orbitChanged = false; }
  // Returns the camera ease rate; Infinity means the camera is placed exactly (first person has no lag or bob).
  function shotFor(phase) {
    const g = girl.root.position;
    if (phase === 'opening') {
      const shot=forestOpeningShot(g,forestEye(g,g.y,view),state.openingT);
      goalPos.set(shot.position.x,shot.position.y,shot.position.z);goalLook.set(shot.target.x,shot.target.y,shot.target.z);return Infinity;
    }
    if (forestCamera(phase) === 'first-person') {
      const eye = forestEye(g, g.y, view);
      goalPos.set(eye.position.x, eye.position.y, eye.position.z); goalLook.set(eye.target.x, eye.target.y, eye.target.z); return Infinity;
    }
    if (state.cinema && !orbitChanged) {const t=motion.matches?0:1-Math.exp(-state.cineT/18),a=motion.matches?0:Math.sin(state.cineT*.09)*.18*t;goalPos.set(6.8-4.1*t+a,4.5-2*t,SEAT_Z+4.4-2*t-a);goalLook.set(-.1+.1*t,.78+.07*t,-.2-.2*t);return 2.4;}
    if (!orbitChanged) {goalPos.set(GIRL_X+2.7,2.5,SEAT_Z+2.4);goalLook.set(GIRL_X-.1,.78,-.2);return 2.4;}
    goalLook.set(g.x,g.y+.8,g.z-.5);
    const dx = Math.sin(orbit.yaw), dz = Math.cos(orbit.yaw);
    let distance = orbit.distance * Math.cos(orbit.pitch);
    // Shorten the view before a trunk or rock instead of clipping the camera inside it.
    for(const o of world.colliders){
      const ox=o.x-goalLook.x,oz=o.z-goalLook.z,along=ox*dx+oz*dz;
      if(goalLook.y+Math.tan(orbit.pitch)*along>groundY(o.x,o.z)+o.height+.2)continue;
      const across=ox*ox+oz*oz-along*along,r=o.radius+.15;
      if(along>0&&across<r*r)distance=Math.min(distance,Math.max(.65,along-Math.sqrt(r*r-across)));
    }
    goalPos.set(goalLook.x+dx*distance,goalLook.y+Math.sin(orbit.pitch)*orbit.distance,goalLook.z+dz*distance);
    goalPos.y=Math.max(goalPos.y,2.4,groundY(goalPos.x,goalPos.z)+.45);
    return 2.4;
  }

  function pose(dt) {
    state.hands.forEach(h=>h.hit=Math.max(0,h.hit-dt*6));
    girl.animate({dt,seated:state.seated>.6,moving:state.moving,heading:state.heading,camera,hands:state.hands,playing:state.cinema,piano,reduced:motion.matches,groundY});
    girlBlob.position.set(girl.root.position.x,girl.root.position.y+.02,girl.root.position.z);
    // The standing child dissolves before the opening camera becomes the walking player.
    const shown = forestCharacter(state.phase, state.sitT, state.openingT);
    girl.root.visible = girlBlob.visible = shown.visible; girl.setOpacity(shown.opacity);
  }

  function update(dt) {
    state.time += dt; const rm = motion.matches;
    state.moving=false;
    if (state.phase === 'opening') {
      state.openingT=rm?1:Math.min(1,state.openingT+dt/FOREST_OPENING_SECONDS);
      if(state.openingT>=1)onEvent('opened');
    } else if (state.phase === 'arrive' || state.phase === 'walk') {
      const p=girl.root.position;
      // Manual walking is relative to the first-person view; the assist follows a world route and turns the view to match.
      let direction=input, yaw=view.yaw;
      if(state.phase==='walk'){
        if(!route.length){onEvent('blocked');return false;}
        while(routeIndex<route.length&&Math.hypot(route[routeIndex].x-p.x,route[routeIndex].z-p.z)<.008)routeIndex++;
        if(routeIndex>=route.length){state.walkT=1;onEvent('arrived');direction={x:0,z:0};}
        else {const target=route[routeIndex],len=Math.hypot(target.x-p.x,target.z-p.z),scale=Math.min(1,len/(1.8*dt));direction={x:(target.x-p.x)/len*scale,z:(target.z-p.z)/len*scale};yaw=0;}
      }
      const next=forestStep(p,direction,yaw,dt,world.colliders);
      state.moving=next.moved>1e-5;state.walkDistance+=next.moved;
      if(next.heading!==null){const turn=Math.atan2(Math.sin(next.heading-state.heading),Math.cos(next.heading-state.heading));state.heading+=turn*(1-Math.exp(-dt*8));}
      if(state.phase==='walk'&&state.moving)view=forestTurnToward(view,state.heading,dt);
      p.set(next.x,groundY(next.x,next.z),next.z);
      if(state.phase==='arrive' && forestAtPiano(p)){input={x:0,z:0};onEvent('arrived');}
    } else if (state.phase === 'sit' && state.sitT < 1) {
      // The player is already on the bench; the camera pulls back while the seated illustration fades in (see forestCharacter).
      state.sitT = Math.min(1, state.sitT + dt * (rm ? 6 : .9));
      if (state.sitT >= 1) onEvent('seated');
    }
    if (state.cinema) state.cineT += dt;
    const k = shotFor(state.phase), a = rm || !Number.isFinite(k) ? 1 : 1 - Math.exp(-dt * k);
    camPos.lerp(goalPos, a); camLook.lerp(goalLook, a);
    camera.position.copy(camPos); camera.lookAt(camLook);
    // In compose the notebook covers the lower screen, so the shot is framed into the upper band; cinema uses the full frame.
    const notebook=state.phase==='compose'&&!state.cinema; camera.zoom+=((notebook?.45:1)-camera.zoom)*(rm?1:1-Math.exp(-dt*2.5));
    const liftGoal = notebook ? .32 : 0; state.lift += (liftGoal - state.lift) * (rm ? 1 : 1 - Math.exp(-dt * 2.5));
    const w = renderer.domElement.width, h = renderer.domElement.height;
    if (state.lift > .001) camera.setViewOffset(w, h, 0, h * state.lift, w, h); else camera.clearViewOffset();
    let busy = false;
    for (let i = 0; i < WHITE_KEYS; i++) if (piano.press[i] > 0) { piano.press[i] = Math.max(0, piano.press[i] - dt * 2.6); busy = true; }
    if (busy || state.keysDirty) { piano.drawKeys(); state.keysDirty = busy; }
    pose(dt);landmarks.animate(state.time,rm);
    if (!rm) {
      world.grassTime.value=state.time;
      world.shaftMat.uniforms.opacity.value = theme.shafts + Math.sin(state.time * .5) * .008;
      const p = world.motes.geometry.attributes.position;
      world.moteBase.forEach((b, i) => p.setXYZ(i, b[0] + Math.sin(state.time * .21 + b[3]) * .5, b[1] + Math.sin(state.time * .33 + b[3] * 2) * .35, b[2] + Math.cos(state.time * .17 + b[3]) * .5));
      p.needsUpdate = true;
    }
    return busy;
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (document.hidden) { input={x:0,z:0};state.moving=false;last = now; return; }
    const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; frame++;
    const busy = update(dt);
    // A calm composing view renders at half rate to spare tablet batteries.
    if (state.phase === 'compose' && !state.cinema && !busy && state.hands.every(h => h.hit <= 0) && frame % 2) return;
    renderer.render(scene, camera);
  }
  function start() { if (!raf && !state.dead) { last = 0; resize(); raf = requestAnimationFrame(tick); } }
  function halt() { cancelAnimationFrame(raf); raf = 0; }
  const onResize = () => { if (state.visible) resize(); };
  addEventListener('resize', onResize);
  const observer = new ResizeObserver(onResize); observer.observe(host);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); state.dead = true; halt(); onEvent('fail'); });

  function strikeKey(index, handIndex, strength) {
    if (index === null) return;
    piano.press[index] = Math.max(piano.press[index], strength); state.keysDirty = true;
    const hand = state.hands[handIndex]; hand.key = index; hand.hit = 1;
  }
  return {
    get dead() { return state.dead; },
    get nearPiano() {return forestAtPiano(girl.root.position);},
    move(x,z) {input=state.visible&&state.phase==='arrive'?forestInput(x,z):{x:0,z:0};},
    // Exploring drags turn the player's own eyes; seated drags orbit the child. Zoom only exists seated.
    look(dx,dy) {if(!state.visible||state.phase==='opening')return;if(forestCamera(state.phase)==='first-person')view=forestLook(view,dx,dy);else{orbit=forestOrbit(orbit,dx,dy);orbitChanged=true;}},
    zoom(delta) {if(state.visible&&forestCamera(state.phase)==='seated'){orbit=forestOrbit(orbit,0,0,delta);orbitChanged=true;}},
    resetControls() {input={x:0,z:0};state.moving=false;},
    // Mirrors the app: phase, visibility and the cinematic flag come from app state, never the other way round.
    setCharacter(value) {girl.setCharacter(value);},
    sync({phase, visible, cinema,avatar,map}) {
      if (state.dead) return;
      if(map)setMap(map);
      if(avatar&&avatar!==state.avatar){girl.setCharacter(avatar);state.avatar=avatar;}
      if (phase !== state.phase) {
        const prev = state.phase; state.phase = phase;
        input={x:0,z:0};state.moving=false;
        if (phase === 'opening') {state.openingT=motion.matches?1:0;state.sitT=0;setSeated(0);placeOnPath(WALK_FROM);view={...FIRST_VIEW};state.heading=Math.PI;shotFor('opening');camPos.copy(goalPos);camLook.copy(goalLook);}
        if (phase === 'arrive' || phase === 'loading') { state.walkT = 0; state.sitT = 0; setSeated(0); if(prev!=='walk'){placeOnPath(WALK_FROM); view = {...FIRST_VIEW};} }
        if (phase === 'walk') { state.walkT = 0; setSeated(0);route=forestRoute(girl.root.position,world.colliders);routeIndex=0; }
        if (phase === 'sit') { state.sitT = 0; takeSeat(); }
        if (phase === 'compose' && prev !== 'sit') { state.sitT = 1; takeSeat(); shotFor('compose'); camPos.copy(goalPos); camLook.copy(goalLook); }
        if ((phase === 'arrive' || phase === 'loading') && prev !== 'loading') { shotFor('arrive'); camPos.copy(goalPos); camLook.copy(goalLook); }
      }
      if (cinema && !state.cinema) {state.cineT = 0;orbitChanged=false;}
      state.cinema = !!cinema;
      if (visible !== state.visible) { state.visible = visible; host.hidden = !visible; if (visible) start(); else {input={x:0,z:0};state.moving=false;halt();} }
    },
    // Melody and actual backing events use independent hands, including low melody notes.
    strike(midi) { const i = pianoKey(midi); if (i !== null) strikeKey(i, 1, 1); },
    beat(root) { const i = pianoKey(backingKey(root)); if (i !== null) strikeKey(i, 0, .7); },
    dispose() {
      halt(); state.dead = true; removeEventListener('resize', onResize); observer.disconnect();
      scene.traverse(o => { o.geometry?.dispose(); o.customDepthMaterial?.dispose(); [].concat(o.material || []).forEach(m => { m.map?.dispose(); m.dispose(); }); });
      girl.textures.forEach(t=>t.dispose());art.forEach(t=>t.dispose());env.dispose(); world.glow.dispose(); renderer.dispose(); canvas.remove(); host.hidden = true;
    }
  };
}



