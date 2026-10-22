import {createAtmosphere} from './atmosphere.mjs';
// 첫 미션 "새 나라가 필요한 까닭" - 고려 말 마을 환경(월드) 모듈
// createWorld(THREE, scene) 한 번 호출로 배경/안개/조명/흙길/초가·기와집/생활 소품/절 입구/산 세팅 완료.
// 반환: { colliders:[{x,z,w,d}], occluders:[Mesh], spawn:{x,z}, bounds:{minX,maxX,minZ,maxZ},
//         npc:{x,z}, stations:[{x,z}], update(t) }
// - 흐린 오후, 회녹색 수풀/돌/흙 톤. 상점·잔치·관광 요소 없음.
// - 길 중앙은 평면(콜라이더 없음), 길 위 돌/자갈 상단 높이 0.05 이하 (마커/그림자 보존).
// - update(t) 안에서는 기하 생성 없음(빨래/등 흔들림만).

export function createWorld(THREE, scene, { artOnly = false } = {}) {
  // ───────────────────────── 유틸 ─────────────────────────
  let seed = 13920817;
  const rnd = () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rr = (a, b) => a + (b - a) * rnd();
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const rgb = (r, g, b) => `rgb(${Math.floor(clamp01(r) * 255)},${Math.floor(clamp01(g) * 255)},${Math.floor(clamp01(b) * 255)})`;
  const hexOf = (r, g, b) => new THREE.Color(clamp01(r), clamp01(g), clamp01(b)).getHex();

  const setSRGB = (tex) => {
    if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else if ('encoding' in tex && THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  };
  const canvasTex = (w, h, draw, opts = {}) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const tex = new THREE.CanvasTexture(c);
    if (opts.repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; }
    tex.anisotropy = 4;
    if (!opts.linear) setSRGB(tex);
    tex.needsUpdate = true;
    return tex;
  };
  const cloneTex = (t, rx, ry) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; };

  const colliders = [];let gateModel;const backdrop=[];
  const addCollider = (x, z, w, d) => colliders.push({ x, z, w, d });

  const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
  const _c = new THREE.Color();
  const composeM = (x, y, z, rx, ry, rz, sx, sy, sz) => {
    _p.set(x, y, z); _e.set(rx, ry, rz); _q.setFromEuler(_e); _s.set(sx, sy, sz);
    return _m.compose(_p, _q, _s);
  };
  // 인스턴스 목록 → InstancedMesh (1 드로우콜)
  const buildInstanced = (geo, mat, list, cast = true, recv = true) => {
    if (!list.length) return null;
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      im.setMatrixAt(i, composeM(o.x, o.y, o.z, o.rx || 0, o.ry || 0, o.rz || 0, o.sx ?? 1, o.sy ?? o.sx ?? 1, o.sz ?? o.sx ?? 1));
      if (o.c !== undefined) im.setColorAt(i, _c.set(o.c));
    }
    im.instanceMatrix.needsUpdate = true;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = cast; im.receiveShadow = recv;
    im.frustumCulled = false; // 인스턴스 분포가 넓어 공유 bbox 컬링 오판 방지
    scene.add(im);
    return im;
  };
  const noiseFill = (g, w, h, base, amp, n) => {
    if (base) { g.fillStyle = base; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < n; i++) {
      const v = (rnd() - 0.5) * amp;
      g.fillStyle = v > 0 ? `rgba(255,250,240,${v})` : `rgba(10,12,8,${-v})`;
      const s = rr(1, 4);
      g.fillRect(rnd() * w, rnd() * h, s, s);
    }
  };
  const blotches = (g, w, h, n, color, a0, a1, r0, r1) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = color(rr(a0, a1));
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, rr(r0, r1), rr(r0 * 0.5, r1 * 0.7), rnd() * 3, 0, Math.PI * 2); g.fill();
    }
  };

  // ───────────────────────── 텍스처 (CanvasTexture만) ─────────────────────────
  // 거친 회벽: 얼룩 + 아래쪽 물때
  const texPlaster = canvasTex(256, 256, (g, w, h) => {
    noiseFill(g, w, h, '#d6d0c0', 0.14, 2600);
    blotches(g, w, h, 26, a => `rgba(110,104,92,${a})`, 0.05, 0.16, 8, 40);
    blotches(g, w, h, 10, a => `rgba(235,230,215,${a})`, 0.05, 0.12, 10, 30);
    const gr = g.createLinearGradient(0, h * 0.55, 0, h);
    gr.addColorStop(0, 'rgba(70,72,60,0)'); gr.addColorStop(1, 'rgba(70,72,60,0.42)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,84,70,0.22)'; g.lineWidth = 1;
    for (let i = 0; i < 10; i++) { const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-30, 30), y + rr(10, 70)); g.stroke(); }
  });
  // 흙벽(초가): 차분한 황갈 회색 + 짚 부스러기
  const texMud = canvasTex(256, 256, (g, w, h) => {
    noiseFill(g, w, h, '#b3a48a', 0.18, 3000);
    blotches(g, w, h, 30, a => `rgba(120,100,70,${a})`, 0.06, 0.18, 8, 36);
    g.strokeStyle = 'rgba(210,190,140,0.35)'; g.lineWidth = 1;
    for (let i = 0; i < 90; i++) { const x = rnd() * w, y = rnd() * h, a = rnd() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * rr(4, 12), y + Math.sin(a) * rr(2, 5)); g.stroke(); }
    const gr = g.createLinearGradient(0, h * 0.6, 0, h);
    gr.addColorStop(0, 'rgba(60,55,45,0)'); gr.addColorStop(1, 'rgba(60,55,45,0.45)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  // 판벽(세로 널판)
  const texPlank = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#6b5a44'; g.fillRect(0, 0, w, h);
    let x = 0;
    while (x < w) {
      const pw = rr(22, 40);
      const l = rr(0.7, 1.05);
      g.fillStyle = rgb(0.42 * l, 0.35 * l, 0.26 * l); g.fillRect(x, 0, pw, h);
      g.strokeStyle = 'rgba(30,22,14,0.35)'; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const gx = x + rr(2, pw - 2); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + rr(-3, 3), h); g.stroke(); }
      g.fillStyle = 'rgba(20,14,8,0.5)'; g.fillRect(x + pw - 2, 0, 2, h);
      x += pw;
    }
    noiseFill(g, w, h, null, 0.1, 900);
  }, { repeat: true });
  // 목재 결(기둥/통나무/수레)
  const texWood = canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#8a7152'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      g.strokeStyle = `rgba(${rnd() > 0.5 ? 60 : 160},${rnd() > 0.5 ? 42 : 130},${rnd() > 0.5 ? 28 : 95},${rr(0.12, 0.3)})`; g.lineWidth = rr(1, 3);
      const x = rnd() * w; g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y * 0.05 + i) * 3, y);
      g.stroke();
    }
    noiseFill(g, w, h, null, 0.12, 700);
  }, { repeat: true });
  // 바위/돌 표면(길 돌, 기단, 담)
  const texRock = canvasTex(128, 128, (g, w, h) => {
    noiseFill(g, w, h, '#8d8a80', 0.22, 2200);
    blotches(g, w, h, 18, a => `rgba(60,62,55,${a})`, 0.05, 0.16, 4, 18);
    blotches(g, w, h, 8, a => `rgba(120,130,95,${a})`, 0.05, 0.14, 4, 14);
  }, { repeat: true });
  // 막돌 쌓은 담
  const texStone = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#5a584f'; g.fillRect(0, 0, w, h);
    const rows = 4, cols = 8;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = (c + (r % 2) * 0.5) * (w / cols) + rr(-4, 4), y = r * (h / rows) + rr(-2, 2);
      const sw = w / cols - rr(4, 10), sh = h / rows - rr(3, 8);
      const l = rr(0.6, 0.95), m = rnd() < 0.25 ? 0.12 : 0;
      g.fillStyle = rgb(0.56 * l - m, 0.55 * l, 0.5 * l - m * 0.6);
      g.beginPath(); g.moveTo(x + rr(2, 6), y); g.lineTo(x + sw - rr(1, 4), y + 2); g.lineTo(x + sw, y + sh - rr(2, 5)); g.lineTo(x + rr(1, 3), y + sh); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,250,235,0.14)'; g.fillRect(x + 6, y + 3, sw - 12, 2);
    }
    blotches(g, w, h, 14, a => `rgba(100,120,70,${a})`, 0.08, 0.22, 4, 12);
  }, { repeat: true });
  const texStonePlinth = cloneTex(texStone, 2, 1);
  const texStoneWall = cloneTex(texStone, 4, 2);
  const texStoneGate = cloneTex(texStone, 5, 2);

  // 바깥 땅: 회녹색 풀/흙 섞임
  const texGround = canvasTex(512, 512, (g, w, h) => {
    noiseFill(g, w, h, '#6e7258', 0.2, 9000);
    blotches(g, w, h, 140, a => `rgba(110,100,78,${a})`, 0.08, 0.2, 10, 50);
    blotches(g, w, h, 120, a => `rgba(90,110,70,${a})`, 0.08, 0.2, 8, 40);
    g.strokeStyle = 'rgba(140,150,100,0.3)'; g.lineWidth = 1;
    for (let i = 0; i < 700; i++) { const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-3, 3), y - rr(3, 9)); g.stroke(); }
  }, { repeat: true });
  texGround.repeat.set(12, 20);
  // 다져진 흙길: 바퀴 자국 희미, 젖은 얼룩
  const texRoad = canvasTex(256, 1024, (g, w, h) => {
    noiseFill(g, w, h, '#857a67', 0.2, 9000);
    blotches(g, w, h, 90, a => `rgba(60,55,45,${a})`, 0.05, 0.14, 8, 40);
    blotches(g, w, h, 60, a => `rgba(170,160,135,${a})`, 0.05, 0.12, 6, 30);
    for (const u of [0.37, 0.63]) {
      g.strokeStyle = 'rgba(55,50,42,0.22)'; g.lineWidth = 7; g.beginPath();
      for (let y = 0; y <= h; y += 24) { const x = (u + Math.sin(y * 0.01) * 0.02) * w; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  }, { repeat: true });
  texRoad.repeat.set(1, 1.5); // 캔버스 1:4 비율 ↔ 길 7.6×46m

  // 오래된 기와: 열 폭/색 변화, 이끼/흰 풍화
  const texTile = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#343a3c'; g.fillRect(0, 0, w, h);
    const rh = 64;
    let x = 0;
    while (x < w) {
      const cw = Math.floor(rr(54, 72));
      const l = rr(0.75, 1.15), old = rnd() < 0.18;
      const base = old ? [0.42 * l, 0.43 * l, 0.42 * l] : [0.25 * l, 0.28 * l, 0.3 * l];
      for (let y = 0; y < h; y += rh) {
        const ll = rr(0.9, 1.1);
        const grad = g.createLinearGradient(x, 0, x + cw, 0);
        grad.addColorStop(0, rgb(base[0] * 0.5 * ll, base[1] * 0.5 * ll, base[2] * 0.5 * ll));
        grad.addColorStop(0.35, rgb(base[0] * 1.2 * ll, base[1] * 1.2 * ll, base[2] * 1.2 * ll));
        grad.addColorStop(0.6, rgb(base[0] * 1.45 * ll, base[1] * 1.45 * ll, base[2] * 1.4 * ll));
        grad.addColorStop(1, rgb(base[0] * 0.55 * ll, base[1] * 0.55 * ll, base[2] * 0.6 * ll));
        g.fillStyle = grad; g.fillRect(x, y, cw, rh);
        g.fillStyle = 'rgba(8,10,12,0.55)'; g.fillRect(x + cw - 9, y, 9, rh);
        g.fillStyle = 'rgba(8,10,12,0.5)'; g.fillRect(x, y + rh - 6, cw, 6);
        g.fillStyle = 'rgba(220,225,220,0.12)'; g.fillRect(x + 8, y + 3, cw - 20, 3);
      }
      x += cw;
    }
    blotches(g, w, h, 40, a => `rgba(120,135,95,${a})`, 0.08, 0.25, 4, 14);
    blotches(g, w, h, 30, a => `rgba(210,210,200,${a})`, 0.05, 0.16, 3, 10);
  }, { repeat: true });
  // 초가 지붕: 짚 결(세로), 묵은 짚 얼룩
  const texThatch = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9b8a62'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const l = rr(0.6, 1.2);
      g.strokeStyle = `rgba(${Math.floor(150 * l)},${Math.floor(130 * l)},${Math.floor(90 * l)},${rr(0.35, 0.8)})`; g.lineWidth = rr(1, 2.2);
      const x = rnd() * w, y = rnd() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-2, 2), y + rr(10, 36)); g.stroke();
    }
    blotches(g, w, h, 30, a => `rgba(70,65,45,${a})`, 0.06, 0.2, 10, 40);
    blotches(g, w, h, 14, a => `rgba(110,125,80,${a})`, 0.05, 0.14, 6, 20);
  }, { repeat: true });

  if(typeof Image!=='undefined'){const straw=new Image();straw.onload=()=>{texThatch.image=straw;texThatch.needsUpdate=true;};straw.src='assets/thatch-detail-v2.png';}
  // 문살(차분한 종이색, 발광 없음)
  const latticeDraw = (gapX, gapY, paper, frame) => (g, w, h) => {
    g.fillStyle = paper; g.fillRect(0, 0, w, h);
    noiseFill(g, w, h, null, 0.1, 800);
    blotches(g, w, h, 8, a => `rgba(120,110,90,${a})`, 0.04, 0.12, 10, 40);
    g.fillStyle = frame;
    g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
    g.fillRect(w / 2 - 6, 0, 12, h);
    g.fillStyle = '#5c4a35';
    for (let x = 14; x < w; x += gapX) g.fillRect(x, 0, 4, h);
    for (let y = 14; y < h; y += gapY) g.fillRect(0, y, w, 4);
  };
  const texLattice = canvasTex(256, 384, latticeDraw(22, 30, '#d9cfb3', '#4e3d2a'));
  const texLatticeFine = canvasTex(256, 384, latticeDraw(16, 16, '#d4c9ad', '#4a3a28'));
  const texWindow = canvasTex(128, 128, latticeDraw(18, 18, '#d8ccb0', '#4e3d2a'));
  // 널문(판자문): 초가 문
  const texPlankDoor = canvasTex(256, 384, (g, w, h) => {
    g.fillStyle = '#5a4a38'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 42) {
      const l = rr(0.8, 1.1);
      g.fillStyle = rgb(0.4 * l, 0.33 * l, 0.24 * l); g.fillRect(x + 2, 0, 38, h);
      g.strokeStyle = 'rgba(25,18,10,0.4)'; g.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const gx = x + rr(4, 36); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + rr(-4, 4), h); g.stroke(); }
    }
    g.fillStyle = '#3a2d20'; g.fillRect(0, 60, w, 14); g.fillRect(0, h - 90, w, 14);
    noiseFill(g, w, h, null, 0.1, 500);
  });
  // 절 입구 목문: 풍화된 회갈색 널, 검은 띠쇠(장식 없음)
  const texGateDoor = canvasTex(256, 384, (g, w, h) => {
    g.fillStyle = '#5b5042'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      const l = rr(0.8, 1.1);
      g.fillStyle = rgb(0.38 * l, 0.33 * l, 0.27 * l); g.fillRect(x + 2, 0, 28, h);
      g.strokeStyle = 'rgba(20,16,10,0.35)'; g.lineWidth = 1;
      for (let i = 0; i < 5; i++) { const gx = x + rr(3, 29); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + rr(-3, 3), h); g.stroke(); }
    }
    g.fillStyle = '#2a2520';
    for (const y of [50, h / 2 - 6, h - 70]) g.fillRect(0, y, w, 12);
    g.fillStyle = '#1e1b18';
    for (const y of [56, h / 2, h - 64]) for (let x = 16; x < w; x += 48) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(40,36,30,0.6)'; g.fillRect(w / 2 - 3, 0, 6, h);
    blotches(g, w, h, 12, a => `rgba(200,195,180,${a})`, 0.04, 0.1, 6, 24);
  });
  // 삼베/무명 천(자루, 보따리, 빨래)
  const texCloth = canvasTex(128, 128, (g, w, h) => {
    noiseFill(g, w, h, '#cfc2a4', 0.16, 1800);
    g.strokeStyle = 'rgba(90,80,60,0.18)'; g.lineWidth = 1;
    for (let i = 0; i < w; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
  }, { repeat: true });
  // 풀포기(알파)
  const texGrass = canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 11; i++) {
      const x0 = rr(14, 50), l = rr(0.7, 1.1);
      g.strokeStyle = rgb(0.45 * l, 0.52 * l, 0.3 * l); g.lineWidth = rr(1.5, 3);
      g.beginPath(); g.moveTo(x0, h); g.quadraticCurveTo(x0 + rr(-10, 10), h * 0.5, x0 + rr(-18, 18), rr(4, 24)); g.stroke();
    }
  });

  // 하늘: 흐린 오후, 낮은 구름층
  const texSky = canvasTex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0.0, '#6c7a80');
    gr.addColorStop(0.25, '#92a0a2');
    gr.addColorStop(0.42, '#b4bdb8');
    gr.addColorStop(0.5, '#c6c9bd');
    gr.addColorStop(0.56, '#aeb2a6');
    gr.addColorStop(1.0, '#7f8577');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const y = rr(h * 0.05, h * 0.46);
      g.fillStyle = `rgba(${rnd() > 0.5 ? 215 : 120},${rnd() > 0.5 ? 218 : 130},${rnd() > 0.5 ? 212 : 135},${rr(0.05, 0.14)})`;
      g.beginPath(); g.ellipse(rnd() * w, y, rr(20, 70), rr(5, 14), 0, 0, Math.PI * 2); g.fill();
    }
    // 구름 뒤 희미한 해 자리
    const sg = g.createRadialGradient(w * 0.3, h * 0.38, 2, w * 0.3, h * 0.38, 40);
    sg.addColorStop(0, 'rgba(235,232,220,0.5)'); sg.addColorStop(1, 'rgba(235,232,220,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
  });
  const mountainTex = (color, topColor, amp, baseFrac, freq) => canvasTex(2048, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const ph = [rnd() * 7, rnd() * 7, rnd() * 7, rnd() * 7];
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const u = (x / w) * Math.PI * 2;
      const y = baseFrac
        + Math.sin(u * freq + ph[0]) * 0.18 * amp
        + Math.sin(u * freq * 2.3 + ph[1]) * 0.1 * amp
        + Math.sin(u * freq * 5.1 + ph[2]) * 0.05 * amp
        + Math.abs(Math.sin(u * freq * 1.3 + ph[3])) * 0.2 * amp;
      g.lineTo(x, h - y * h);
    }
    g.lineTo(w, h); g.closePath();
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, topColor); gr.addColorStop(1, color);
    g.fillStyle = gr; g.fill();
  });

  // ───────────────────────── 재질 (재사용) ─────────────────────────
  const texFoliage=canvasTex(128,128,(g,w,h)=>{
    g.clearRect(0,0,w,h);
    for(let i=0;i<100;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*52,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;
      g.strokeStyle='#48553a';g.lineWidth=1;g.beginPath();g.moveTo(64,73);g.lineTo(x,y);g.stroke();
      g.fillStyle=pick(['#e1e7b9','#b4c98c','#91af70','#d0dc9f']);g.beginPath();g.ellipse(x,y,rr(4,8),rr(2,4),a,0,Math.PI*2);g.fill();}
  });
  const M = {
    plaster: new THREE.MeshStandardMaterial({ map: texPlaster, roughness: 0.97 }),
    mud: new THREE.MeshStandardMaterial({ map: texMud, roughness: 1 }),
    plank: new THREE.MeshStandardMaterial({ map: texPlank, roughness: 0.92 }),
    stonePlinth: new THREE.MeshStandardMaterial({ map: texStonePlinth, roughness: 1, color: 0xffffff }),
    stoneWall: new THREE.MeshStandardMaterial({ map: texStoneWall, roughness: 1, color: 0xffffff }),
    stoneGate: new THREE.MeshStandardMaterial({ map: texStoneGate, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ map: texRock, roughness: 1, color: 0xffffff }),
    stonePlain: new THREE.MeshStandardMaterial({ color: 0x7e7d74, roughness: 1 }),
    ground: new THREE.MeshStandardMaterial({ map: texGround, roughness: 1 }),
    road: new THREE.MeshStandardMaterial({ map: texRoad, roughness: 1 }),
    tile: new THREE.MeshStandardMaterial({ map: texTile, roughness: 0.85, side: THREE.DoubleSide }),
    thatch: new THREE.MeshStandardMaterial({ map: texThatch, roughness: 1, side: THREE.DoubleSide }),
    ridge: new THREE.MeshStandardMaterial({ color: 0x2f3537, roughness: 0.85 }),
    thatchRidge: new THREE.MeshStandardMaterial({ color: 0x6c5e42, roughness: 1 }),
    wood: new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.9 }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9, side: THREE.DoubleSide }),
    woodInst: new THREE.MeshStandardMaterial({ map: texWood, color: 0xffffff, roughness: 0.9 }),
    lattice: new THREE.MeshStandardMaterial({ map: texLattice, emissive: 0xd8c8a0, emissiveIntensity: 0.05, emissiveMap: texLattice, roughness: 0.95 }),
    latticeFine: new THREE.MeshStandardMaterial({ map: texLatticeFine, emissive: 0xd8c8a0, emissiveIntensity: 0.05, emissiveMap: texLatticeFine, roughness: 0.95 }),
    plankDoor: new THREE.MeshStandardMaterial({ map: texPlankDoor, roughness: 0.95 }),
    window: new THREE.MeshStandardMaterial({ map: texWindow, emissive: 0xd8c8a0, emissiveIntensity: 0.06, emissiveMap: texWindow, roughness: 0.95 }),
    gateDoor: new THREE.MeshStandardMaterial({ map: texGateDoor, roughness: 0.9 }),
    cloth: new THREE.MeshStandardMaterial({ map: texCloth, color: 0xffffff, roughness: 1, side: THREE.DoubleSide }),
    clothInst: new THREE.MeshStandardMaterial({ map: texCloth, color: 0xffffff, roughness: 1, side: THREE.DoubleSide }),
    lantern: new THREE.MeshStandardMaterial({ color: 0xe9dcc2, emissive: 0xffd9a0, emissiveIntensity: 0.3, roughness: 0.8 }),
    lanternCap: new THREE.MeshStandardMaterial({ color: 0x2a2219, roughness: 0.9 }),
    jar: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
    basket: new THREE.MeshStandardMaterial({ color: 0xa8926a, roughness: 1 }),
    grain: new THREE.MeshStandardMaterial({ color: 0xc8b377, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0xffffff, map:texFoliage,roughness:1,side:THREE.DoubleSide,alphaTest:.45 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 1 }),
    pine: new THREE.MeshStandardMaterial({ color: 0xffffff, map:texFoliage,roughness:1,side:THREE.DoubleSide,alphaTest:.45 }),
    grass: new THREE.MeshStandardMaterial({ map: texGrass, color: 0xffffff, roughness: 1, side: THREE.DoubleSide, alphaTest: 0.45, transparent: false }),
    moss: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
    flat: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }),
    sky: new THREE.MeshBasicMaterial({ map: texSky, side: THREE.BackSide, fog: false, depthWrite: false }),
  };

  // ───────────────────────── 배경 / 안개 / 조명 (흐린 오후) ─────────────────────────
  let sunLight;
  if (!artOnly) {
  const FOG = 0xb3bab1;
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, 32, 168);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(230, 32, 18), M.sky);
  sky.position.set(0, 0, -10);
  sky.renderOrder = -10;
  scene.add(sky);

  const hemi = new THREE.HemisphereLight(0xd7dfdc, 0x87917a, 1.65);
  scene.add(hemi);
  sunLight = new THREE.DirectionalLight(0xe8e4d8, 1.35);
  sunLight.position.set(-22, 30, -28);
  sunLight.target.position.set(0, 0, -6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  const sc = sunLight.shadow.camera;
  sc.near = 5; sc.far = 110; sc.left = -24; sc.right = 24; sc.top = 26; sc.bottom = -26;
  sunLight.shadow.bias = -0.0008;
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.radius = 3;
  scene.add(sunLight); scene.add(sunLight.target);
  const fill = new THREE.DirectionalLight(0xc8d5d7, 0.75);
  fill.position.set(18, 12, 20);
  scene.add(fill);

  // ───────────────────────── 지면 / 흙길 ─────────────────────────
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 260), M.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -10);
  ground.receiveShadow = true;
  scene.add(ground);
  }
  // Three small yards linked by a bending earthen lane, all level for touch navigation.
  const roadKnots=[[17,0],[8,-4],[1,-1],[-6,5],[-12,3],[-20,-3],[-28,0]];
  const roadX=z=>{for(let i=0;i<roadKnots.length-1;i++){const [a,x]=roadKnots[i],[b,y]=roadKnots[i+1];if(z<=a&&z>=b){let t=(a-z)/(a-b);t=t*t*(3-2*t);return x+(y-x)*t;}}return 0;};
  if (!artOnly) {
  const roadGeo=new THREE.BufferGeometry(),rp=[],ru=[],ri=[];
  for(let i=0;i<=120;i++){const z=17-i*45/120,x=roadX(z),width=3.3+1.15*Math.max(...[8,-7,-20].map(a=>Math.exp(-(((z-a)/3)**2))));
    rp.push(x-width,.006,z,x+width,.006,z);ru.push(0,i/16,1,i/16);
    if(i<120){let k=i*2;ri.push(k,k+1,k+2,k+1,k+3,k+2);}}
  roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));roadGeo.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));roadGeo.setIndex(ri);roadGeo.computeVertexNormals();
  const edge=canvasTex(128,4,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'black');gr.addColorStop(.15,'white');gr.addColorStop(.85,'white');gr.addColorStop(1,'black');g.fillStyle=gr;g.fillRect(0,0,w,h);},{linear:true,repeat:true});
  M.road.alphaMap=edge;M.road.transparent=true;M.road.depthWrite=false;
  const road=new THREE.Mesh(roadGeo,M.road);road.receiveShadow=true;scene.add(road);
  }

  // 불규칙 오래된 돌 기하 (모서리 깎임, 비정형 다각형) - 3종
  const makeStoneGeo = (n, rBase, h) => {
    const angs = [], rads = [];
    for (let i = 0; i < n; i++) { angs.push((i / n) * Math.PI * 2 + rr(-0.16, 0.16)); rads.push(rBase * rr(0.7, 1.18)); }
    const rings = [[1.0, -0.02], [0.96, h * 0.55], [0.74, h]];
    const ring = (k) => angs.map((a, i) => [Math.cos(a) * rads[i] * rings[k][0], rings[k][1], Math.sin(a) * rads[i] * rings[k][0]]);
    const R = rings.map((_, k) => ring(k));
    const pos = [], uv = [];
    const push = (p) => { pos.push(p[0], p[1], p[2]); uv.push(p[0] / (rBase * 2.4) + 0.5, p[2] / (rBase * 2.4) + 0.5); };
    const tri = (a, b, c) => { push(a); push(b); push(c); };
    for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      tri(R[k][i], R[k + 1][i], R[k][j]);
      tri(R[k][j], R[k + 1][i], R[k + 1][j]);
    }
    const top = [rr(-0.05, 0.05) * rBase, h + 0.004, rr(-0.05, 0.05) * rBase];
    for (let i = 0; i < n; i++) tri(R[2][i], top, R[2][(i + 1) % n]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    return geo;
  };
  const stoneGeos = [makeStoneGeo(7, 0.3, 0.045), makeStoneGeo(6, 0.27, 0.042), makeStoneGeo(8, 0.33, 0.045)];
  const stoneLists = [[], [], []];
  const stoneColor = () => {
    const l = rr(0.5, 0.9), k = rnd();
    if (k < 0.22) return hexOf(0.5 * l, 0.56 * l, 0.44 * l);   // 이끼 낀 회녹
    if (k < 0.42) return hexOf(0.62 * l, 0.57 * l, 0.5 * l);   // 갈회색
    return hexOf(0.58 * l, 0.58 * l, 0.56 * l);                 // 회색
  };
  const addStone = (x, z, s) => {
    const k = Math.floor(rnd() * 3);
    stoneLists[k].push({ x:x+roadX(z), y: 0, z, ry: rnd() * 6.283, sx: s * rr(0.85, 1.15), sy: rr(0.75, 1.0), sz: s * rr(0.85, 1.15), c: stoneColor() });
  };
  // 길: 가장자리는 촘촘, 중앙은 드문드문 (중앙은 흙길 평면)
  if (!artOnly) {
  for (let z = -27.4; z < 15.6; z += 0.56) {
    for (let x = -3.6; x <= 3.6; x += 0.56) {
      const ax = Math.abs(x);
      const prob = ax > 2.9 ? 0.92 : ax > 2.2 ? 0.62 : ax > 1.3 ? 0.3 : 0.14;
      if (rnd() > prob) continue;
      addStone(x + rr(-0.16, 0.16), z + rr(-0.16, 0.16), ax > 2.9 ? rr(0.85, 1.25) : rr(0.55, 1.0));
    }
  }
  // 길 가장자리 바깥(건물 앞 토방 옆) 돌 몇 개
  for (let z = -26; z < 15; z += 1.3) for (const s of [-1, 1]) if (rnd() < 0.5) addStone(s * rr(3.9, 4.6), z + rr(-0.4, 0.4), rr(0.6, 1.0));
  stoneLists.forEach((lst, i) => buildInstanced(stoneGeos[i], M.rock, lst, false, true));

  // 자갈 (납작 정이십면체, 상단 0.025)
  const pebbleGeo = new THREE.IcosahedronGeometry(0.05, 0);
  const pebbles = [];
  for (let i = 0; i < 420; i++) {
    const x = rr(-3.5, 3.5), z = rr(-27.4, 15.5);
    if (Math.abs(x) < 1.0 && rnd() < 0.6) continue;
    const l = rr(0.5, 0.95);
    pebbles.push({ x:x+roadX(z), y: 0.0, z, rx: rnd(), ry: rnd() * 6, sx: rr(0.6, 1.3), sy: 0.5, sz: rr(0.6, 1.3), c: hexOf(0.6 * l, 0.59 * l, 0.55 * l) });
  }
  buildInstanced(pebbleGeo, M.rock, pebbles, false, true);

  // 이끼/젖은 얼룩 (납작 원판, 돌 가장자리·길가)
  const mossGeo = new THREE.CircleGeometry(0.16, 7); mossGeo.rotateX(-Math.PI / 2);
  const mossList = [];
  for (let i = 0; i < 230; i++) {
    const side = rnd() < 0.5 ? -1 : 1;
    const x = side * rr(2.0, 4.4), z = rr(-27, 15.5);
    const l = rr(0.6, 1.0);
    mossList.push({ x:x+roadX(z), y: 0.008, z, ry: rnd() * 6, sx: rr(0.5, 1.4), sy: 1, sz: rr(0.4, 1.0), c: hexOf(0.3 * l, 0.38 * l, 0.22 * l) });
  }
  buildInstanced(mossGeo, M.moss, mossList, false, true);
  }

  // 풀포기 (십자 판, 알파)
  const grassGeo = (() => {
    const geo = new THREE.BufferGeometry();
    const w = 0.24, h = 0.34;
    const pos = [-w, 0, 0, w, 0, 0, w, h, 0, -w, h, 0, 0, 0, -w, 0, 0, w, 0, h, w, 0, h, -w];
    const uv = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
    geo.computeVertexNormals();
    return geo;
  })();
  const grassList = [];
  const addGrass = (x, z, s = 1) => {
    const l = rr(0.7, 1.15);
    grassList.push({ x, y: 0, z, ry: rnd() * 6, sx: s * rr(0.8, 1.3), sy: s * rr(0.7, 1.3), sz: s * rr(0.8, 1.3), c: hexOf(0.55 * l, 0.6 * l, 0.42 * l) });
  };
  if (!artOnly) for (let z = -27; z < 16; z += 0.45) for (const s of [-1, 1]) {
    if (rnd() < 0.75) addGrass(roadX(z)+s * rr(3.25, 3.75), z + rr(-0.2, 0.2), rr(0.6, 1.0));
    if (rnd() < 0.4) addGrass(roadX(z)+s * rr(1.6, 3.2), z + rr(-0.2, 0.2), rr(0.4, 0.7));
  }

  // ───────────────────────── 지붕 기하 ─────────────────────────
  // 로컬: 용마루가 x축, 경사면이 ±z. 원점은 벽 상단 중심.
  // pw: 경사 곡률(1.55 오목 기와 / 0.9 볼록 초가), lip: 처마 끝 두께 띠(초가는 두껍게)
  const makeRoofGeometry = (W, D, rise, over, lift, taper, pw = 1.55, lip = 0.06) => {
    const hw = W / 2 + over, hd = D / 2 + over, su = 14, sv = 7;
    const pos = [], uv = [], idx = [];
    for (const s of [1, -1]) {
      const base = pos.length / 3;
      for (let i = 0; i <= su; i++) {
        const u = -hw + (2 * hw * i) / su;
        for (let j = 0; j <= sv; j++) {
          const t = j / sv;
          const x = u * (1 - taper * t);
          const z = s * hd * (1 - t);
          const y = rise * Math.pow(t, pw) + lift * Math.pow(Math.abs(u) / hw, 4) * (1 - t);
          pos.push(x, y, z);
          uv.push((u + hw) / 0.36, (t * hd) / 0.32);
        }
      }
      for (let i = 0; i < su; i++) for (let j = 0; j < sv; j++) {
        const a = base + i * (sv + 1) + j, b = a + sv + 1;
        if (s > 0) idx.push(a, b, a + 1, b, b + 1, a + 1);
        else idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
      // 처마 끝 두께 띠
      const lb = pos.length / 3;
      for (let i = 0; i <= su; i++) {
        const u = -hw + (2 * hw * i) / su;
        const y = lift * Math.pow(Math.abs(u) / hw, 4);
        pos.push(u, y, s * hd, u, y - lip, s * hd);
        uv.push((u + hw) / 0.36, 0, (u + hw) / 0.36, lip / 0.32);
      }
      for (let i = 0; i < su; i++) {
        const a = lb + i * 2, b = a + 2;
        if (s > 0) idx.push(a, a + 1, b, b, a + 1, b + 1);
        else idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    return geo;
  };
  const makeGableGeometry = (W, D, rise) => {
    const hx = W / 2 - 0.02, hd = D / 2;
    const pos = [
      hx, 0, hd, hx, 0, -hd, hx, rise * 0.82, 0,
      -hx, 0, -hd, -hx, 0, hd, -hx, rise * 0.82, 0,
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1, 0, 0, 1, 0, 0.5, 1], 2));
    geo.computeVertexNormals();
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    return geo;
  };

  const foliageGeo=(()=>{const g=new THREE.BufferGeometry(),p=[],uv=[],ix=[];
    for(let j=0;j<3;j++){const a=j*Math.PI/3,c=Math.cos(a),sn=Math.sin(a),k=j*4;
      p.push(-c,-1,-sn,c,-1,sn,c,1,sn,-c,1,-sn);uv.push(0,0,1,0,1,1,0,1);ix.push(k,k+1,k+2,k,k+2,k+3);}
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;})();
  const thatchHeight=(u,v,rise)=>rise*1.15*Math.pow(Math.max(0,(1-u**4)*(1-v**4)),.6);
  const thatchRoof=(W,D,rise)=>{const g=new THREE.BufferGeometry(),p=[],uv=[],ix=[],a=W/2+.65,b=D/2+.65;
    for(let j=0;j<=16;j++)for(let i=0;i<=24;i++){let u=i/12-1,v=j/8-1;p.push(u*a*(1-.08*Math.abs(v)**6),thatchHeight(u,v,rise)-.1,v*b*(1-.08*Math.abs(u)**6));uv.push(i/24*a,j/16*b);if(i<24&&j<16){let k=j*25+i;ix.push(k,k+25,k+1,k+1,k+25,k+26);}}
    g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;};
  // 공용 기하 (재사용)
  const G = {
    box: new THREE.BoxGeometry(1, 1, 1),
    column: new THREE.BoxGeometry(0.18, 1, 0.18),
    eaveTile: new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10),
    lantern: new THREE.SphereGeometry(0.2, 12, 10),
    lanternCap: new THREE.CylinderGeometry(0.1, 0.15, 0.08, 8),
    jar: new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.2, 0), new THREE.Vector2(0.3, 0.1), new THREE.Vector2(0.35, 0.3),
      new THREE.Vector2(0.31, 0.5), new THREE.Vector2(0.2, 0.58), new THREE.Vector2(0.22, 0.64), new THREE.Vector2(0.16, 0.66),
    ], 14),
    basket: new THREE.CylinderGeometry(0.3, 0.22, 0.26, 12, 1, true),
    basketBottom: new THREE.CylinderGeometry(0.29, 0.29, 0.03, 12),
    log: new THREE.CylinderGeometry(0.09, 0.1, 0.9, 7),
    leaf: foliageGeo,
    trunk: new THREE.CylinderGeometry(0.13, 0.22, 1, 7),
    pine: foliageGeo.clone(),
    plane: new THREE.PlaneGeometry(1, 1),
    sackFull: new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.24, 0), new THREE.Vector2(0.3, 0.12), new THREE.Vector2(0.29, 0.4),
      new THREE.Vector2(0.2, 0.56), new THREE.Vector2(0.08, 0.63), new THREE.Vector2(0, 0.64),
    ], 12),
    sackOpen: new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.26, 0), new THREE.Vector2(0.31, 0.1), new THREE.Vector2(0.28, 0.22),
      new THREE.Vector2(0.22, 0.3), new THREE.Vector2(0.24, 0.34), new THREE.Vector2(0.2, 0.35), new THREE.Vector2(0.08, 0.06),
    ], 12),
    bundle: new THREE.SphereGeometry(0.26, 10, 8),
    grain: new THREE.SphereGeometry(0.12, 8, 6),
    wheel: new THREE.CylinderGeometry(0.44, 0.44, 0.08, 12),
    mat: new THREE.PlaneGeometry(1, 1),
    mortar: new THREE.CylinderGeometry(0.22, 0.18, 0.4, 10),
  };
  G.eaveTile.rotateX(Math.PI / 2);
  G.basket.translate(0, 0.13, 0);
  G.log.rotateZ(Math.PI / 2);
  G.trunk.translate(0, 0.5, 0);
  G.pine.scale(1,.22,.85);
  G.bundle.scale(1, 0.72, 1); G.bundle.translate(0, 0.19, 0);
  G.grain.scale(1, 0.45, 1);
  G.wheel.rotateZ(Math.PI / 2);
  G.mat.rotateX(-Math.PI / 2);
  G.mortar.translate(0, 0.2, 0);

  // 인스턴스 수집 목록
  const L = {
    column: [], eave: [], lantern: [], jar: [], basket: [], log: [], leaf: [], trunk: [], pine: [], gapWall: [],
    plinth: [], deck: [], sackFull: [], sackOpen: [], bundle: [], grain: [], wheel: [], mat: [], mortar: [],
  };
  const lanternAnim = []; // {i, x,y,z, phase}

  // ───────────────────────── 건물 생성 ─────────────────────────
  const FACE = 3.8; // 건물 전면 x 절대값
  const DECK = 0.6;
  const roofGeoCache = new Map();
  const getRoof = (W, D, rise, lift, kind) => {
    const key = `${W}|${D}|${rise}|${lift}|${kind}`;
    if (!roofGeoCache.has(key)) {
      roofGeoCache.set(key, kind === 'thatch'
        ? thatchRoof(W,D,rise)
        : makeRoofGeometry(W, D, rise, 0.55, lift, 0.22, 1.55, 0.07));
    }
    return roofGeoCache.get(key);
  };

  // side: -1 왼쪽(x<0) / +1 오른쪽. 로컬 전면 +z 가 길쪽.
  const buildings = [], occluders = [];
  const addBuilding = (side, zc, spec) => {
    const { W, D, wallH, rise, lift = 0.35, kind = 'tile', wallMat = M.plaster, door = M.lattice, windows = true, tint = 0xffffff } = spec;
    const thatch = kind === 'thatch';
    const PL = thatch ? 0.22 : 0.35;
    const theta = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const cx = spec.x ?? side * (FACE + D / 2);
    const grp = new THREE.Group();
    grp.position.set(cx, 0, zc);
    grp.rotation.y = theta;
    scene.add(grp);
    const toWorld = (lx, lz) => ({ x: cx + lx * Math.cos(theta) + lz * Math.sin(theta), z: zc - lx * Math.sin(theta) + lz * Math.cos(theta) });

    // 기단 (인스턴스)
    const pc = toWorld(0, 0);
    L.plinth.push({ x: pc.x, y: PL / 2, z: pc.z, ry: theta, sx: W + 0.25, sy: PL, sz: D + 0.25, c: thatch ? 0xa29a88 : 0xffffff });
    // 벽체
    const wall = new THREE.Mesh(G.box, wallMat.clone());
    wall.material.color.set(tint);
    wall.scale.set(W, wallH, D); wall.position.y = PL + wallH / 2;
    wall.castShadow = true; wall.receiveShadow = true; grp.add(wall);
    // 지붕
    const roofMat = (thatch ? M.thatch : M.tile).clone();
    const rl = rr(0.86, 1.08);
    roofMat.color.setRGB(rl * (thatch ? 1 : 0.98), rl, rl * (thatch ? 0.94 : 1.02));
    const roof = new THREE.Mesh(getRoof(W, D, rise, lift, kind), roofMat);
    roof.userData.roofSurface=true;
    roof.position.y = PL + wallH; roof.castShadow = true; roof.receiveShadow = true; grp.add(roof);
    // 용마루 (초가: 짚 용마름 / 기와: 검은 마루)
    const ridge = new THREE.Mesh(G.box, thatch ? M.thatchRidge : M.ridge);
    if (thatch) { ridge.scale.set(W*.55,.12,.3); ridge.position.y=PL+wallH+rise*1.2; }
    else { ridge.scale.set((W / 2 + 0.55) * 2 * (1 - 0.22) + 0.12, 0.16, 0.22); ridge.position.y = PL + wallH + rise + 0.05; }
    ridge.castShadow = true; if(!thatch)grp.add(ridge);
    // 박공
    const gable = new THREE.Mesh(makeGableGeometry(W, D, rise), (thatch ? M.thatch : M.woodDark).clone());
    gable.position.y = PL + wallH; if(!thatch)grp.add(gable);
    for (const mesh of [wall, roof, gable]) { mesh.material.transparent = true; occluders.push(mesh); }
    if(thatch){
      for(const u of [-.55,0,.55]){
        const points=[];for(let i=0;i<=24;i++){const v=i/12-1;points.push(new THREE.Vector3(u*(W/2+.65)*(1-.08*Math.abs(v)**6),PL+wallH+thatchHeight(u,v,rise)-.07,v*(D/2+.65)*(1-.08*Math.abs(u)**6)));}
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.022,4,false),M.thatchRidge));
      }
      if (!artOnly) {
        // Local repairs and uneven eaves suggest hardship without turning every home into ruins.
        const patch = new THREE.Mesh(G.plane,M.plankDoor);
        patch.scale.set(.52,.43,1);patch.position.set(-W*.33,PL+.65,D/2+.023);
        patch.rotation.z=-.06;grp.add(patch);
        for(let i=0;i<7;i++){
          const straw=new THREE.Mesh(G.log,M.thatchRidge);
          straw.scale.set(.35,.32,.32);straw.rotation.y=Math.PI/2;
          straw.position.set(-W*.36+i*.11,PL+wallH-.06,D/2+.54+(i%3)*.045);
          grp.add(straw);
        }
        const repair=new THREE.Mesh(G.plane,M.mud.clone());
        repair.material.color.set(0x82745c);repair.scale.set(.68,.23,1);
        repair.position.set(W*.31,PL+.21,D/2+.024);repair.rotation.z=.08;grp.add(repair);
      }
    }
    // 마루 / 토방 (인스턴스)
    const dk = toWorld(0, D / 2 + DECK / 2);
    L.deck.push({ x: dk.x, y: thatch ? 0.09 : 0.15, z: dk.z, ry: theta, sx: W - 0.2, sy: thatch ? 0.18 : 0.3, sz: DECK, c: thatch ? 0x8b8070 : 0x8f6f4c });
    // 문
    const doorW = Math.min(1.6, W * 0.4), doorH = Math.min(1.55, wallH - 0.35);
    const doorM = new THREE.Mesh(G.plane, door);
    doorM.scale.set(doorW, doorH, 1); doorM.position.set(side < 0 ? -W * 0.12 : W * 0.12, PL + (thatch ? 0.2 : 0.3) + doorH / 2 - 0.02, D / 2 + 0.012);
    grp.add(doorM);
    // 창
    if (windows) {
      const win = new THREE.Mesh(G.plane, M.window);
      win.scale.set(0.62, 0.62, 1); win.position.set(side < 0 ? W * 0.3 : -W * 0.3, PL + wallH * 0.6, D / 2 + 0.012);
      grp.add(win);
    }
    // 기둥(인스턴스) - 전면 모서리 + 중간
    const colH = wallH + 0.15;
    const colXs = [-W / 2 + 0.12, W / 2 - 0.12];
    if (W > 4.2) colXs.push(0);
    for (const lx of colXs) {
      const w = toWorld(lx, D / 2 + 0.06);
      L.column.push({ x: w.x, y: PL + colH / 2, z: w.z, ry: theta, sy: colH, c: thatch ? 0x8a7a62 : 0x7a6248 });
    }
    // 처마 끝 막새(인스턴스, 기와집만)
    if (!thatch) {
      const hw = W / 2 + 0.55, hd = D / 2 + 0.55;
      for (let u = -hw + 0.18; u < hw; u += 0.36) {
        const y = PL + wallH + lift * Math.pow(Math.abs(u) / hw, 4) - 0.02;
        const w = toWorld(u, hd + 0.02);
        L.eave.push({ x: w.x, y, z: w.z, ry: theta, c: 0x33393b });
      }
    }
    // 충돌체: 건물 + 마루
    const totalD = D + DECK;
    addCollider(cx-side*DECK/2, zc, totalD, W + 0.25);
    buildings.push({ side, zc, W, D, kind });
    return grp;
  };

  // 순서대로 배치(사양 소진 시 종료), 틈새 반환
  const layoutSide = (side, zStart, zEnd, specs) => {
    let z = zStart; const gaps = [];
    for (const sp of specs) {
      const zc = z - sp.W / 2 - 0.12;
      if (zc - sp.W / 2 < zEnd) break;
      addBuilding(side, zc, sp);
      const gap = sp.gap ?? rr(0.6, 1.6);
      const gz0 = zc - sp.W / 2 - 0.12, gz1 = gz0 - gap;
      gaps.push({ z0: gz0, z1: gz1, side });
      z = gz1;
    }
    return gaps;
  };

  // 왼쪽: 초가 농가 위주, 절 쪽(북쪽 끝)은 기와
  const leftSpecs = [
    { W: 4.2, D: 3.4, wallH: 1.95, rise: 1.0, kind: 'thatch', wallMat: M.mud, door: M.plankDoor, gap: 1.4 },
    { W: 4.6, D: 3.6, wallH: 2.0, rise: 1.05, kind: 'thatch', wallMat: M.mud, door: M.plankDoor, tint: 0xf3ede4, gap: 1.0 }, // 1번 피란길 가족 뒤편 초가
    { W: 3.8, D: 3.2, wallH: 2.1, rise: 0.95, kind: 'tile', wallMat: M.plaster, door: M.latticeFine, tint: 0xe9e5dc, gap: 1.8 },
    { W: 4.4, D: 3.5, wallH: 1.95, rise: 1.0, kind: 'thatch', wallMat: M.mud, door: M.plankDoor, tint: 0xeae2d6, gap: 1.2 },
    { W: 4.0, D: 3.3, wallH: 2.0, rise: 0.95, kind: 'thatch', wallMat: M.plank, door: M.plankDoor, windows: false, gap: 1.6 },
    { W: 4.8, D: 3.7, wallH: 2.3, rise: 1.05, kind: 'tile', wallMat: M.plaster, door: M.lattice, tint: 0xdedad0, gap: 1.0 }, // 절 앞 기와집
    { W: 4.2, D: 3.4, wallH: 2.25, rise: 1.0, kind: 'tile', wallMat: M.plaster, door: M.latticeFine, windows: false, gap: 0.8 },
  ];
  const rightSpecs = [
    { W: 3.8, D: 3.2, wallH: 2.1, rise: 0.95, kind: 'tile', wallMat: M.plaster, door: M.latticeFine, tint: 0xe2ddd2, gap: 1.6 },
    { W: 4.4, D: 3.5, wallH: 1.95, rise: 1.0, kind: 'thatch', wallMat: M.mud, door: M.plankDoor, gap: 1.2 },
    { W: 4.6, D: 3.6, wallH: 2.3, rise: 1.05, kind: 'tile', wallMat: M.plank, door: M.lattice, tint: 0xd9d2c6, gap: 2.0 },
    { W: 4.2, D: 3.4, wallH: 1.95, rise: 1.0, kind: 'thatch', wallMat: M.mud, door: M.plankDoor, tint: 0xf0e9dc, gap: 1.4 }, // 2번 농부 옆 초가
    { W: 3.6, D: 3.1, wallH: 1.9, rise: 0.92, kind: 'thatch', wallMat: M.plank, door: M.plankDoor, windows: false, gap: 1.8 },
    { W: 4.8, D: 3.7, wallH: 2.3, rise: 1.08, kind: 'tile', wallMat: M.plaster, door: M.lattice, tint: 0xe4e0d6, gap: 1.0 },
    { W: 3.0, D: 3.0, wallH: 2.15, rise: 0.95, kind: 'tile', wallMat: M.plaster, door: M.latticeFine, windows: false, gap: 0.8 },
  ];
  const gapsL=[],gapsR=[];
  if (!artOnly) {
  addBuilding(-1,8,{...leftSpecs[0],x:-10});
  addBuilding(1,9,{...rightSpecs[1],x:.6});
  addBuilding(-1,1,{...leftSpecs[3],x:-8.6});
  addBuilding(1,1.5,{...rightSpecs[0],x:6.8});
  addBuilding(-1,-7,{...leftSpecs[1],x:-.8});
  addBuilding(1,-7,{...rightSpecs[3],x:11});
  addBuilding(-1,-13,{...leftSpecs[4],x:-4.6});
  addBuilding(1,-14,{...rightSpecs[4],x:9.8});
  addBuilding(-1,-20,{...leftSpecs[5],x:-9.8});
  addBuilding(1,-20,{...rightSpecs[5],x:4.2});
  }

  // ───────────────────────── 생활 소품 생성기 ─────────────────────────
  const jarColors = [0x4f4238, 0x5e4a3a, 0x453528, 0x6a5440, 0x3e332a];
  const leafColors = [0x9eb282,0xb2c290,0x91ac78,0xacb982,0x9eac7b,0xb8bb8c];
  const clothColors = [0xbfb295, 0x8e9aa0, 0x6e7a8a, 0xa39a80, 0x9a8f78, 0x7d8a7a];

  const branch=(a,b,width=.4)=>{
    const v=new THREE.Vector3(b.x-a.x,b.y-a.y,b.z-a.z),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);
    L.trunk.push({x:a.x,y:a.y,z:a.z,sx:width,sy:v.length(),sz:width,rx:e.x,ry:e.y,rz:e.z});
  };
  const addTree=(x,z,scale=1,maxTop=99)=>{
    const h=Math.min(3.2*scale,maxTop-1.1);branch({x,y:0,z},{x:x+.18*scale,y:h,z:z-.15*scale},scale);
    for(let j=0;j<7;j++){
      const a=j*2.4,rad=(j===6?.2:1.15)*scale,center={x:x+Math.cos(a)*rad,y:h+(.2+(j%3)*.32)*scale,z:z+Math.sin(a)*rad};
      branch({x:x+.1,y:h*.65,z},center,.37*scale);
      for(let i=0;i<9;i++){const angle=rnd()*Math.PI*2,r=rr(.1,.65)*scale,k=rr(.28,.47)*scale;
        L.leaf.push({x:center.x+Math.cos(angle)*r,y:center.y+rr(-.15,.55)*scale,z:center.z+Math.sin(angle)*r,sx:k*1.25,sy:k*.85,sz:k,rx:rnd(),ry:rnd()*6,c:pick(leafColors)});}
    }
  };
  const addPine=(x,z,scale=1)=>{
    const top={x:x+.45*scale,y:3.5*scale,z:z-.2*scale};branch({x,y:0,z},top,.9*scale);
    for(let j=0;j<7;j++){const a=j*2.4,r=(j===6?.25:1.25-j*.1)*scale,center={x:top.x+Math.cos(a)*r,y:(1.9+j*.25)*scale,z:top.z+Math.sin(a)*r};
      branch({x:x+.2,y:center.y-.35,z},center,.3*scale);
      for(let i=0;i<5;i++)L.pine.push({x:center.x+rr(-.4,.4)*scale,y:center.y+rr(-.1,.1)*scale,z:center.z+rr(-.4,.4)*scale,sx:rr(.45,.7)*scale,sy:scale,sz:rr(.45,.75)*scale,ry:rnd()*6,c:pick([0x8fa581,0xa4b68f,0x91a783])});
    }
  };
  // 수풀(낮은 덤불) - leaf 기하 재사용
  const addShrub = (x, z, s = 0.5) => {
    const n = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const a = rnd() * 6.283, r = rr(0, 0.35) * s;
      const k = s * rr(0.7, 1.1);
      L.leaf.push({ x: x + Math.cos(a) * r, y: k * 0.75, z: z + Math.sin(a) * r, sx: k * rr(0.9, 1.3), sy: k * 0.8, sz: k * rr(0.9, 1.3), rx: rnd(), ry: rnd() * 3, c: pick(leafColors) });
    }
    for (let i = 0; i < 3; i++) addGrass(x + rr(-0.5, 0.5) * s, z + rr(-0.5, 0.5) * s, rr(0.5, 0.9));
  };
  const addJarCluster = (x, z, n) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + rnd(), r = n === 1 ? 0 : rr(0.3, 0.5);
      const s = rr(0.75, 1.15);
      L.jar.push({ x: x + Math.cos(a) * r, y: 0, z: z + Math.sin(a) * r, sx: s, sy: s * rr(0.9, 1.2), sz: s, ry: rnd() * 6, c: pick(jarColors) });
    }
  };
  const addLogPile = (x, z, ry) => {
    const rows = [4, 3, 2];
    rows.forEach((cnt, r) => {
      for (let i = 0; i < cnt; i++) {
        const off = (i - (cnt - 1) / 2) * 0.2;
        L.log.push({ x: x + Math.cos(ry + Math.PI / 2) * off, y: 0.09 + r * 0.17, z: z + Math.sin(ry + Math.PI / 2) * off, ry, c: [0x8a7a5c, 0x6f5f44, 0x948060][(i + r) % 3] });
      }
    });
  };
  const addBasket = (x, y, z) => L.basket.push({ x, y, z, ry: rnd() * 3 });
  const addBundle = (x, z, s = 1, ry = 0) => {
    L.bundle.push({ x, y: 0, z, ry, sx: s, sy: s, sz: s, c: pick(clothColors) });
    // 매듭
    L.bundle.push({ x: x + rr(-0.03, 0.03), y: 0.31 * s, z: z + rr(-0.03, 0.03), ry: rnd() * 3, sx: 0.32 * s, sy: 0.4 * s, sz: 0.32 * s, c: pick(clothColors) });
  };
  const addSackFull = (x, z, s = 1, rz = 0) => L.sackFull.push({ x, y: 0, z, ry: rnd() * 6, rz, sx: s, c: pick(clothColors) });
  const addSackOpen = (x, z, s = 1, rz = 0) => L.sackOpen.push({ x, y: 0, z, ry: rnd() * 6, rz, sx: s, c: pick(clothColors) });
  const addGrain = (x, y, z, s = 1) => L.grain.push({ x, y, z, ry: rnd() * 6, sx: s, sy: s, sz: s * rr(0.8, 1.1), c: pick([0xc8b377, 0xb9a46a, 0xd3bf84]) });
  const addMat = (x, z, ry = 0) => L.mat.push({ x, y: 0.012, z, ry, sx: 1.0, sy: 1, sz: 0.7, c: 0xb6a77c });
  const addMortar = (x, z) => L.mortar.push({ x, y: 0, z, ry: rnd() * 3, c: 0x6f5e48 });
  // 나무 수레 (바퀴 인스턴스 + 판재는 column/box 인스턴스)
  const addCart = (x, z, ry) => {
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const lw = (lx, lz) => ({ x: x + lx * cs + lz * sn, z: z - lx * sn + lz * cs });
    const b = lw(0, 0);
    L.deck.push({ x: b.x, y: 0.5, z: b.z, ry, sx: 1.05, sy: 0.08, sz: 1.7, c: 0x7c6a4e });
    for (const lx of [-0.5, 0.5]) { const p = lw(lx, 0); L.deck.push({ x: p.x, y: 0.66, z: p.z, ry, sx: 0.06, sy: 0.26, sz: 1.7, c: 0x6b5a40 }); }
    const ax = lw(0, 0.1); L.column.push({ x: ax.x, y: 0.44, z: ax.z, ry, rz: Math.PI / 2, sx: 0.6, sy: 1.5, sz: 0.6, c: 0x4e4030 });
    for (const lx of [-0.72, 0.72]) { const p = lw(lx, 0.1); L.wheel.push({ x: p.x, y: 0.44, z: p.z, ry, c: 0x5d4d38 }); }
    for (const lx of [-0.42, 0.42]) { const p = lw(lx, -1.25); L.column.push({ x: p.x, y: 0.52, z: p.z, ry, rx: 0.5, sx: 0.5, sy: 1.2, sz: 0.5, c: 0x6b5a40 }); }
    addCollider(b.x, b.z, Math.abs(cs) * 1.3 + Math.abs(sn) * 1.9, Math.abs(cs) * 1.9 + Math.abs(sn) * 1.3);
  };
  // 빨랫줄 (흔들리는 천 2~3장)
  const cloths = [];
  const addLaundry = (x, z, ry, n) => {
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const len = 2.0;
    for (const lx of [-len / 2, len / 2]) L.column.push({ x: x + lx * cs, y: 0.9, z: z - lx * sn, sx: 0.4, sy: 1.8, sz: 0.4, c: 0x7a6a50 });
    L.column.push({ x, y: 1.72, z, ry, rz: Math.PI / 2, sx: 0.12, sy: len, sz: 0.12, c: 0x5a4a38 });
    for (let i = 0; i < n; i++) {
      const lx = -len / 2 + 0.45 + i * (len - 0.9) / Math.max(1, n - 1);
      const mat = M.cloth.clone(); mat.color.set(pick(clothColors));
      const geo = new THREE.PlaneGeometry(0.45, 0.6, 1, 4);
      geo.translate(0, -0.3, 0);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x + lx * cs, 1.7, z - lx * sn);
      m.rotation.y = ry; m.castShadow = true;
      scene.add(m);
      cloths.push({ mesh: m, geo, orig: geo.attributes.position.array.slice(), phase: rnd() * 6 });
    }
  };

  // Later chapters share the textured art, without constructing the first chapter's map.
  if (artOnly) return {
    M, G, L, colliders, occluders, canvasTex, makeRoofGeometry, makeGableGeometry,
    addBuilding, addTree, addPine, addShrub, addGrass, addJarCluster, addLogPile,
    addBasket, addBundle, addSackFull, addSackOpen, addGrain, addMat, addMortar,
    addCart, addCollider, buildInstanced, mountainTex, rr,
    finish() {
      const materials = { plinth:M.stonePlinth, deck:M.woodInst, column:M.woodInst,
        eave:M.flat, lantern:M.lantern, jar:M.jar, basket:M.basket, log:M.woodInst,
        trunk:M.trunk, leaf:M.leaf, pine:M.pine, sackFull:M.clothInst, sackOpen:M.clothInst,
        bundle:M.clothInst, grain:M.grain, wheel:M.woodInst, mat:M.clothInst, mortar:M.woodInst,
        gapWall:M.stoneWall };
      for (const [key, list] of Object.entries(L)) {
        buildInstanced((key === 'eave' ? G.eaveTile : G[key]) || G.box, materials[key], list, !['leaf','pine','eave','grain','mat'].includes(key), true);
      }
      buildInstanced(G.basketBottom,M.basket,L.basket.map(o=>({...o,y:o.y+.015})),false,false);
      buildInstanced(grassGeo,M.grass,grassList,false,false);
    },
  };

  // ───────────────────────── 틈새: 돌담(높이 변화) + 소품 + 나무 ─────────────────────────
  let gapIdx = 0;
  for (const gp of [...gapsL, ...gapsR]) {
    const side = gp.side;
    const len = gp.z0 - gp.z1;
    const zc = (gp.z0 + gp.z1) / 2;
    const wh = rr(0.8, 1.35);
    L.gapWall.push({ x: side * (FACE + 1.05), y: wh / 2, z: zc, sx: 0.32, sy: wh, sz: len + 0.4, c: rnd() < 0.5 ? 0xffffff : 0xe6e2d8 });
    // 담 위 캡: 짚(농가) / 기와(기와집)
    const capStraw = rnd() < 0.55;
    L.gapWall.push({ x: side * (FACE + 1.05), y: wh + 0.06, z: zc, sx: capStraw ? 0.46 : 0.5, sy: 0.12, sz: len + 0.5, c: capStraw ? 0xa08a62 : 0x5c6163 });
    const kind = gapIdx++ % 6;
    if (len >= 1.3) {
      if (kind === 0) addJarCluster(side * 4.35, zc, 3);
      else if (kind === 1) { addLogPile(side * 4.3, zc, Math.PI / 2); addJarCluster(side * 4.4, zc + len * 0.35, 1); }
      else if (kind === 2) { addMortar(side * 4.3, zc - 0.2); addBasket(side * 4.25, 0, zc + 0.4); addShrub(side * 4.6, zc + len * 0.4, 0.45); }
      else if (kind === 3) { addJarCluster(side * 4.3, zc - 0.2, 2); addBasket(side * 4.2, 0, zc + len * 0.3); }
      else if (kind === 4) { addSackFull(side * 4.3, zc - 0.25, 0.9); addSackFull(side * 4.45, zc + 0.3, 0.8); addLogPile(side * 4.4, zc + len * 0.4, Math.PI / 2); }
      else { addShrub(side * 4.4, zc, 0.55); addBasket(side * 4.2, 0, zc - len * 0.3); }
      // 틈새 뒤 나무 (오른쪽은 카메라 가림 방지: 더 멀리, 낮게)
      if (len >= 1.5 && rnd() < 0.8) {
        if (side < 0) addTree(-6.2 + rr(-0.4, 0.4), zc, rr(1.0, 1.3));
        else addTree(7.6 + rr(-0.2, 0.3), zc, rr(0.85, 1.0), 5.1);
      }
    } else if (len >= 0.55) {
      if (rnd() < 0.5) addJarCluster(side * 4.35, zc, 1); else addShrub(side * 4.4, zc, 0.4);
    }
    // 담 아래 잡초
    for (let i = 0; i < 4; i++) addGrass(side * rr(4.0, 4.8), zc + rr(-len / 2, len / 2), rr(0.6, 1.0));
  }
  buildInstanced(G.box, M.stoneWall, L.gapWall, true, true);

  for(const [x,z,k] of [[-13,12,1.4],[-12,2,1.2],[13,7,1.1],[14,-4,1.3],[-10,-10,1.3],[13,-19,1.2],[-13,-23,1.4]])addTree(x,z,k);
  addPine(-7,-26,1.35);addPine(6,-26,1.2);for(let i=0;i<8;i++)addTree(i%2?-16:16,12-i*5,rr(1.15,1.5));
  for(let i=0;i<18;i++){const z=rr(-24,15),x=(i%2?-1:1)*rr(12,16);addShrub(x,z,rr(.4,.8));}
  // 절 너머 산자락 나무 군락 (종심 레이어)
  for (let i = 0; i < 16; i++) {
    const x = rr(-30, 30), z = rr(-34, -62);
    if (Math.abs(x) < 4) continue;
    if (rnd() < 0.5) addPine(x, z, rr(1.2, 1.8)); else addTree(x, z, rr(1.3, 2.0));
  }
  // 남쪽(스폰 뒤) 나무 + 수풀
  addTree(-14, 19.5, 1.3); addTree(7.5, 18.5, 1.1);
  addShrub(-4.5, 17.2, 0.7); addShrub(4.2, 17.6, 0.6);
  // 바깥 땅 잡초 (멀리 흩뿌림)
  for (let i = 0; i < 160; i++) { const s = rnd() < 0.5 ? -1 : 1; addGrass(s * rr(5, 14), rr(-30, 18), rr(0.7, 1.4)); }

  // 빨랫줄 1곳 (왼쪽 틈새 뒤, 오른쪽 틈새 뒤)
  addLaundry(-11, 4.5, 0.15, 2);
  addLaundry(12, -10, -0.2, 2);

  // ───────────────────────── 스테이션 연출 ─────────────────────────
  const stations = [{ x:-5.5,z:8 },{x:5.4,z:-7},{x:-3.2,z:-20}];
  const atHub=(dx,dz,draw)=>{const lengths=Object.fromEntries(Object.entries(L).map(([k,v])=>[k,v.length])),nc=colliders.length,nm=scene.children.length,ng=grassList.length;draw();
    for(const [k,v] of Object.entries(L))for(const p of v.slice(lengths[k])){p.x+=dx;p.z+=dz;}
    for(const p of colliders.slice(nc)){p.x+=dx;p.z+=dz;}for(const m of scene.children.slice(nm)){m.position.x+=dx;m.position.z+=dz;}
    for(const p of grassList.slice(ng)){p.x+=dx;p.z+=dz;}
  };
  // 1) 피란길의 가족 (초가 뒤편, 길가에 보따리 짐 / 바구니, 중앙·남쪽은 비워 둠)
  atHub(-4,3,()=>{
    addCart(-3.0,7.2,-.35);
    addBundle(-2.2, 4.45, 0.95, 0.4);
    addBundle(-2.45, 5.05, 1.1, 1.2);
    addBundle(-2.1, 5.62, 0.8, 2.3);
    addBasket(-2.6, 0, 5.6);
    addGrass(-2.75, 4.2, 0.6); addGrass(-2.9, 5.9, 0.7);
  });
  // 2) 빼앗긴 곡식의 농부 (열린 빈 자루, 한 줌 남은 곡식, 쓰러진 자루, 항아리, 빈 수레)
  atHub(4,-1,()=>{
    addSackOpen(2.0, -5.5, 1.0);
    addGrain(2.0, 0.05, -5.5, 0.55);
    addSackOpen(2.25, -6.4, 0.9, 1.25);
    addGrain(1.95, 0.02, -6.55, 0.3); addGrain(2.1, 0.02, -6.1, 0.25);
    addJarCluster(2.15, -5.0, 1);
    addCart(2.85, -7.7, 0.05);
    addMat(2.3, -4.6, 0.3);
    addGrain(2.2, 0.02, -4.55, 0.35);
  });
  // 3) 절 앞 (낮은 돌담, 작은 곡식함, 멍석, 돌계단은 문 앞 비통행 구역에)
  atHub(-2,-1,()=>{
    // 낮은 돌담 (길 가장자리, 통행 범위 밖)
    buildInstanced(G.box, M.stoneWall, [{ x: -3.15, y: 0.26, z: -19.0, sx: 0.3, sy: 0.52, sz: 3.6, c: 0xffffff }], true, true);
    addCollider(-3.15, -19.0, 0.3, 3.6);
    // 작은 곡식함 (나무 궤)
    L.deck.push({ x: -2.35, y: 0.2, z: -18.3, ry: 0.15, sx: 0.55, sy: 0.4, sz: 0.42, c: 0x6f5e44 });
    L.deck.push({ x: -2.35, y: 0.42, z: -18.3, ry: 0.15, sx: 0.6, sy: 0.05, sz: 0.47, c: 0x5a4a34 });
    addCollider(-2.35, -18.3, 0.6, 0.5);
    addGrain(-2.35, 0.44, -18.3, 0.28);
    addMat(-2.5, -19.4, 0.1);
    addGrain(-2.4, 0.02, -19.3, 0.3); addGrain(-2.65, 0.02, -19.55, 0.25);
    addBasket(-2.75, 0, -20.1);
    addGrass(-2.95, -17.4, 0.6); addGrass(-2.9, -20.7, 0.6);
  });

  for(let i=0;i<5;i++){const x=-7.8+i*.65;L.column.push({x,y:.4,z:12.5,sx:.5,sy:.8,sz:.5,rz:i===2?.7:0,c:0x73634b});}
  L.deck.push({x:-6.5,y:.65,z:12.5,sx:3,sy:.09,sz:.1,rz:.12,c:0x73634b});
  // Occupied NPC feet have physical space; approach remains open from the south.
  stations.forEach((p,i)=>addCollider(p.x,p.z,i===0?1.8:.7,.5));

  // ───────────────────────── 절 입구 (골목 끝: 차분한 목문 + 낮은 돌담 + 돌계단) ─────────────────────────
  {
    const gz = -28.4;
    const gateGrp = new THREE.Group();gateModel=gateGrp; gateGrp.position.set(0, 0, gz); scene.add(gateGrp);
    // 좌우 낮은 돌담 (높이 1.6)
    for (const s of [-1, 1]) {
      const wallW = 11;
      const wl = new THREE.Mesh(G.box, M.stoneGate);
      wl.scale.set(wallW, 1.6, 1.0); wl.position.set(s * (2.6 + wallW / 2), 0.8, 0);
      wl.castShadow = true; wl.receiveShadow = true; gateGrp.add(wl);
      const cap = new THREE.Mesh(makeRoofGeometry(wallW, 1.0, 0.4, 0.2, 0.05, 0.05, 1.3, 0.05), M.tile);
      cap.position.set(s * (2.6 + wallW / 2), 1.6, 0); cap.castShadow = true; gateGrp.add(cap);
    }
    // 돌계단 3단 (z < -27.1 : 통행 불가 구역이라 단차 판정 영향 없음)
    for (let i = 0; i < 3; i++) {
      const st = new THREE.Mesh(G.box, M.rock);
      const h = 0.11 * (i + 1);
      st.scale.set(5.2 - i * 0.3, h, 0.36); st.position.set(0, h / 2, 1.5 - i * 0.36);
      st.receiveShadow = true; st.castShadow = true; gateGrp.add(st);
    }
    // 문 기둥 (주춧돌 + 나무)
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(G.box, M.wood);
      post.scale.set(0.4, 3.0, 0.4); post.position.set(s * 2.4, 0.33 + 1.5, 0.2);
      post.castShadow = true; gateGrp.add(post);
      const base = new THREE.Mesh(G.box, M.rock);
      base.scale.set(0.66, 0.4, 0.66); base.position.set(s * 2.4, 0.2, 0.2); gateGrp.add(base);
    }
    // 인방
    const lintel = new THREE.Mesh(G.box, M.woodDark);
    lintel.scale.set(5.4, 0.32, 0.48); lintel.position.set(0, 3.1, 0.2); lintel.castShadow = true; gateGrp.add(lintel);
    // 문짝 (닫힘, 계단 위 높이)
    const doors = new THREE.Mesh(G.plane, M.gateDoor);
    doors.scale.set(4.3, 2.6, 1); doors.position.set(0, 0.33 + 1.3, 0.45); doors.receiveShadow = true; gateGrp.add(doors);
    // 문 지붕 (기와)
    const groof = new THREE.Mesh(makeRoofGeometry(5.6, 2.2, 1.15, 0.7, 0.4, 0.2, 1.55, 0.07), M.tile);
    groof.position.set(0, 3.25, 0.2); groof.castShadow = true; gateGrp.add(groof);
    const gridge = new THREE.Mesh(G.box, M.ridge);
    gridge.scale.set(5.6, 0.2, 0.26); gridge.position.set(0, 4.45, 0.2); gateGrp.add(gridge);
    const ggable = new THREE.Mesh(makeGableGeometry(5.6, 2.2, 1.15), M.woodDark);
    ggable.position.set(0, 3.25, 0.2); gateGrp.add(ggable);
    // 처마 막새
    for (let u = -3.4; u <= 3.4; u += 0.36) {
      const y = 3.25 + 0.4 * Math.pow(Math.abs(u) / 3.5, 4) - 0.02;
      L.eave.push({ x: u, y, z: gz + 0.2 + 1.8, ry: 0, c: 0x33393b });
    }
    // 문 앞 종이등 2개 (낮은 빛, 흔들림)
    for (const s of [-1, 1]) {
      const x = s * 1.9, y = 2.8, z = gz + 1.05;
      lanternAnim.push({ i: L.lantern.length, x, y, z, phase: rnd() * 6.28 });
      L.lantern.push({ x, y, z, sx: 1, sy: 1.25, sz: 1 });
    }
    // 석등 2개 (불 없음)
    for (const s of [-1, 1]) {
      const x = s * 2.75, z = -25.4;
      const ped = new THREE.Mesh(G.box, M.rock); ped.scale.set(0.46, 1.0, 0.46); ped.position.set(x, 0.5, z); ped.castShadow = true; scene.add(ped);
      const lamp = new THREE.Mesh(G.box, M.stonePlain); lamp.scale.set(0.42, 0.36, 0.42); lamp.position.set(x, 1.2, z); lamp.castShadow = true; scene.add(lamp);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.32, 4), M.stonePlain); cap.position.set(x, 1.55, z); cap.rotation.y = Math.PI / 4; cap.castShadow = true; scene.add(cap);
      addCollider(x, z, 0.6, 0.6);
    }
    // 문 앞 잡초/이끼
    for (let i = 0; i < 10; i++) addGrass(rr(-4.5, 4.5), rr(-27.6, -26.3), rr(0.5, 0.9));
    // 충돌: 문 전체 폭 막기
    addCollider(0, gz - 0.2, 32, 3.0);
  }

  // ───────────────────────── 남쪽 끝 낮은 돌담 + 우물 ─────────────────────────
  {
    const sw = new THREE.Mesh(G.box, M.stoneWall);
    sw.scale.set(4, 0.9, 0.6); sw.position.set(-10.5, 0.45, 16.2); sw.receiveShadow = true; sw.castShadow = true; scene.add(sw);
    const otherWall=sw.clone();otherWall.position.x=10.5;scene.add(otherWall);addCollider(-10.5,16.2,4,.6);addCollider(10.5,16.2,4,.6);
    // 우물 (스폰 옆)
    const well = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.75, 12), M.rock);
    well.position.set(-3.65, 0.375, 13.6); well.castShadow = true; scene.add(well);
    const wellRoof = new THREE.Mesh(thatchRoof(1.2,1.2,.32), M.thatch.clone());
    wellRoof.material.transparent=true;occluders.push(wellRoof);
    wellRoof.position.set(-3.65, 1.9, 13.6); wellRoof.castShadow = true; scene.add(wellRoof);
    L.column.push({ x: -3.65 - 0.5, y: 0.95, z: 13.6, sx: 0.4, sy: 1.5, sz: 0.4, c: 0x6a5a44 });
    L.column.push({ x: -3.65 + 0.5, y: 0.95, z: 13.6, sx: 0.4, sy: 1.5, sz: 0.4, c: 0x6a5a44 });
    addBasket(-4.5, 0, 14.2);
    addJarCluster(-4.6, 14.4, 1);
    addCollider(-3.65, 13.6, 1.4, 1.4);
  }

  // A depleted farm plot and stored goods make the contrast visible before the dialogue.
  const plot=new THREE.Mesh(new THREE.PlaneGeometry(2.7,4.5),M.mud);plot.rotation.x=-Math.PI/2;plot.position.set(8,.009,-1.8);plot.receiveShadow=true;scene.add(plot);
  for(let row=0;row<6;row++)L.deck.push({x:6.9+row*.43,y:.025,z:-1.8,sx:.1,sy:.05,sz:4.4,c:0x74634b});
  for(let i=0;i<10;i++)addGrass(7+rr(0,2),rr(-3.7,.1),.7);
  addSackFull(-5.7,-22,1);addSackFull(-5.1,-22.2,.9);addJarCluster(-5.7,-23.1,2);
  addCollider(-5.4,-22.1,1.1,.6);
  // Sparse supplies and repaired household tools are staged evidence, not a claim about every family.
  addSackOpen(8.8,-4.6,.8,1.15);addBasket(8.8,0,-3.8);addMat(8.1,-4.1,.15);
  addGrain(8.65,.025,-4.05,.2);addGrain(8.9,.025,-4.1,.16);
  addLogPile(-11.6,5.2,.2);
  for(const [x,z] of [[-11.8,5.3],[-9.9,-.4],[10.8,-10.3]]){
    L.deck.push({x,y:.17,z,sx:.65,sy:.08,sz:.4,ry:.15,c:0x655943});
    L.deck.push({x:x+.1,y:.23,z,sx:.62,sy:.055,sz:.11,ry:-.18,c:0x998365});
  }
  // A small patched cloth near the travellers' belongings, kept outside the walking lane.
  const patchTex=canvasTex(128,128,(g,w,h)=>{
    g.fillStyle='#918b77';g.fillRect(0,0,w,h);g.fillStyle='#b1a98d';g.fillRect(30,24,48,51);
    g.strokeStyle='#625b49';g.lineWidth=2;
    for(let i=0;i<6;i++){g.beginPath();g.moveTo(27+i*10,21);g.lineTo(31+i*10,27);g.stroke();}
    for(let i=0;i<5;i++){g.beginPath();g.moveTo(27,27+i*11);g.lineTo(33,31+i*11);g.stroke();}
  });
  const patched=new THREE.Mesh(G.plane,new THREE.MeshStandardMaterial({map:patchTex,side:THREE.DoubleSide,roughness:1}));
  patched.rotation.x=-Math.PI/2;patched.position.set(-6.2,.03,6.3);patched.scale.set(1.2,.8,1);scene.add(patched);

  // Plant the unwalkable perimeter; keep the playable paths and clue stands clear.
  for(let z=-26;z<=16;z+=1.25){
    addShrub(-13.35,z,rr(.85,1.15));addShrub(14.35,z,rr(.85,1.15));
    if(Math.round(z*4)%10===0){addTree(-16,z,.8);addPine(17,z,.85);}
  }
  for(let x=-12;x<=14;x+=1.2)addShrub(x,16.5,rr(.8,1.05));

  // ───────────────────────── 인스턴스 메시 생성 ─────────────────────────
  buildInstanced(G.box, M.stonePlinth, L.plinth, true, true);
  buildInstanced(G.box, M.woodInst, L.deck, true, true);
  buildInstanced(G.column, M.woodInst, L.column, true, true);
  buildInstanced(G.eaveTile, M.flat, L.eave, false, false);
  const lanternMesh = buildInstanced(G.lantern, M.lantern, L.lantern, false, false);
  const lanternCapList = L.lantern.map(o => ({ x: o.x, y: o.y + 0.24 * (o.sy || 1), z: o.z, sx: 1 }));
  const lanternCapMesh = buildInstanced(G.lanternCap, M.lanternCap, lanternCapList, false, false);
  buildInstanced(G.jar, M.jar, L.jar, true, true);
  buildInstanced(G.basket, M.basket, L.basket, true, true);
  buildInstanced(G.basketBottom, M.basket, L.basket.map(o => ({ ...o, y: o.y + 0.015 })), false, false);
  buildInstanced(G.log, M.woodInst, L.log, true, true);
  buildInstanced(G.trunk, M.trunk, L.trunk, true, true);
  buildInstanced(G.leaf, M.leaf, L.leaf, true, true);
  buildInstanced(G.pine, M.pine, L.pine, true, true);
  buildInstanced(G.sackFull, M.clothInst, L.sackFull, true, true);
  buildInstanced(G.sackOpen, M.clothInst, L.sackOpen, true, true);
  buildInstanced(G.bundle, M.clothInst, L.bundle, true, true);
  buildInstanced(G.grain, M.grain, L.grain, false, true);
  buildInstanced(G.wheel, M.woodInst, L.wheel, true, true);
  buildInstanced(G.mat, M.clothInst, L.mat, false, true);
  buildInstanced(G.mortar, M.woodInst, L.mortar, true, true);
  buildInstanced(grassGeo, M.grass, grassList, false, false);

  // 낮은 점광 (절 문 앞 종이등 2개만, 그림자 없음)
  const pointLights = [];
  for (const s of [-1, 1]) {
    const pl = new THREE.PointLight(0xffd9a0, 1.1, 6, 2);
    pl.position.set(s * 1.9, 2.6, -27.3); scene.add(pl); pointLights.push(pl);
  }

  // ───────────────────────── 원경 산 레이어 (회녹/회청) ─────────────────────────
  const mountainRing = (R, H, tex, y) => {
    const geo = new THREE.CylinderGeometry(R, R, H, 72, 1, true);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, alphaTest: 0.5, fog: true });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(0, y + H / 2, -10);
    scene.add(m);backdrop.push(m);
    return m;
  };
  mountainRing(62, 22, mountainTex('#46574f', '#687a70', 1.0, 0.18, 4), -1.5);
  mountainRing(98, 34, mountainTex('#687a80', '#93a3a4', 1.0, 0.2, 3), -2);
  mountainRing(142, 48, mountainTex('#8e9ca0', '#b4bebd', 0.9, 0.22, 2), -3);

  // ───────────────────────── update(t) : 종이등/빨래 흔들림 (기하 생성 없음) ─────────────────────────
  const ambient=createAtmosphere(THREE,scene,M,1);
  const update = (t,reducedOverride) => {
    const reduced=reducedOverride??globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
    ambient.update(t,reduced);
    if(reduced)t=0;
    if (lanternMesh) {
      for (const a of lanternAnim) {
        const sw = Math.sin(t * 1.4 + a.phase) * 0.035, sw2 = Math.cos(t * 1.0 + a.phase * 1.3) * 0.025;
        const o = L.lantern[a.i];
        lanternMesh.setMatrixAt(a.i, composeM(a.x + sw, a.y, a.z + sw2, sw2 * 1.5, 0, -sw * 1.5, o.sx, o.sy, o.sz));
        lanternCapMesh.setMatrixAt(a.i, composeM(a.x + sw * 0.6, a.y + 0.24 * o.sy, a.z + sw2 * 0.6, 0, 0, 0, 1, 1, 1));
      }
      lanternMesh.instanceMatrix.needsUpdate = true;
      lanternCapMesh.instanceMatrix.needsUpdate = true;
    }
    for (const f of cloths) {
      const pos = f.geo.attributes.position;
      const arr = pos.array, o = f.orig;
      for (let i = 0; i < pos.count; i++) {
        const y = o[i * 3 + 1]; // 0 ~ -0.6 (위가 0)
        const k = -y / 0.6;
        arr[i * 3 + 2] = Math.sin(t * 1.7 + f.phase + k * 2.5) * 0.09 * k;
      }
      pos.needsUpdate = true;
    }
    for (let i = 0; i < pointLights.length; i++) {
      pointLights[i].intensity = 1.1 + Math.sin(t * 6 + i * 1.7) * 0.08 + Math.sin(t * 11 + i) * 0.05;
    }
  };

  return {
    colliders, occluders,
    clueMaterials:{cloth:M.cloth,wood:M.wood},
    arrivalArt:{materials:M,gate:gateModel,leaf:G.leaf,backdrop,sun:sunLight},
    spawn: { x: 0, z: 15 },
    bounds: { minX:-13,maxX:14,minZ:-27,maxZ:15.8 },
    npc: { x: 2, z: -12 },
    stations,
    update,
  };
}




