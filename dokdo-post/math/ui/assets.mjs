// 미술 자산 preload. assets/ 는 GPT가 생성·관리하며 여기서는 읽기만 한다. 파일이 없으면 폴백(null)으로 진행한다.
// art-manifest.json 의 좌표·프레임 정보는 기본값(DEFAULT_MANIFEST)에 병합되어 판정 코드 변경 없이 배치를 바꿀 수 있다.
export const DEFAULT_MANIFEST = {
  world: {
    width: 1536, height: 1024,
    places: [
      {id: 'w1', door: [520, 380]}, {id: 'w2', door: [865, 380]}, {id: 'w3', door: [1210, 380]},
      {id: 'w4', door: [520, 865]}, {id: 'w5', door: [865, 865]}, {id: 'w6', door: [1210, 865]},
      {id: 'final', door: [100, 590]}
    ],
    walkRects: [
      [50, 365, 1400, 110],      // 상단 길
      [380, 850, 1080, 110],     // 하단 길
      [390, 430, 90, 470],       // 세로 연결길 x390
      [1020, 430, 90, 470],      // 세로 연결길 x1020
      [1400, 430, 90, 470],      // 세로 연결길 x1400
      [520, 430, 520, 160],      // 중앙 광장
      [55, 430, 100, 200]        // 배송장 길
    ],
    start: [780, 500]
  },
  sprites: {
    hero: {columns: 4, rows: 2, foot: [192, 460], frameWidth: 384, frameHeight: 512, order: ['down', 'left', 'right', 'up'], screenHeight: 100},
    moa: {columns: 4, rows: 2, foot: [192, 460], frameWidth: 384, frameHeight: 512, order: ['down', 'left', 'right', 'up'], screenHeight: 62}
  }
};

const FILES = {
  world: 'assets/village-world.webp',
  hero: 'assets/hero-sheet.png',
  moa: 'assets/moa-sheet.png',
  workshop: 'assets/workshop.webp',
  inspection: 'assets/inspection.webp',
  packing: 'assets/packing.webp',
  truck: 'assets/delivery-truck.webp'
};

function loadImage(src, timeoutMs = 12000) {
  return new Promise(resolve => {
    const img = new Image();
    let done = false;
    const finish = v => { if (!done) { done = true; resolve(v); } };
    const t = setTimeout(() => finish(null), timeoutMs);
    img.onload = () => { clearTimeout(t); finish(img); };
    img.onerror = () => { clearTimeout(t); finish(null); };
    img.src = src;
  });
}
async function loadManifest() {
  try {
    const res = await fetch('assets/art-manifest.json', {cache: 'no-cache'});
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
function merge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return base;
  const out = {...base};
  for (const [k, v] of Object.entries(extra)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) out[k] = merge(base[k], v);
    else if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}
// manifest의 places는 id 기준으로 병합(일부만 적어도 됨)
function mergePlaces(basePlaces, extraPlaces) {
  if (!Array.isArray(extraPlaces)) return basePlaces;
  const out = basePlaces.map(p => ({...p}));
  for (const e of extraPlaces) {
    if (!e || !e.id) continue;
    const i = out.findIndex(p => p.id === e.id);
    if (i >= 0) out[i] = {...out[i], ...e}; else out.push(e);
  }
  return out;
}

export async function loadAssets(onProgress = () => {}) {
  const status = {loaded: {}, missing: [], manifestLoaded: false};
  const entries = Object.entries(FILES);
  const images = {};
  let count = 0;
  const report = () => onProgress(count / (entries.length + 1));
  const [manifestRaw, ...imgs] = await Promise.all([
    loadManifest().then(m => { count++; report(); return m; }),
    ...entries.map(([key, src]) => loadImage(src).then(img => { count++; report(); return [key, img]; }))
  ]);
  for (const [key, img] of imgs) {
    images[key] = img;
    status.loaded[key] = !!img;
    if (!img) status.missing.push(FILES[key]);
  }
  let manifest = DEFAULT_MANIFEST;
  if (manifestRaw && typeof manifestRaw === 'object') {
    status.manifestLoaded = true;
    const places = mergePlaces(DEFAULT_MANIFEST.world.places, manifestRaw.world?.places);
    manifest = merge(DEFAULT_MANIFEST, manifestRaw);
    manifest.world.places = places;
    if (!Array.isArray(manifestRaw.world?.walkRects)) manifest.world.walkRects = DEFAULT_MANIFEST.world.walkRects;
    if (!Array.isArray(manifestRaw.world?.start)) manifest.world.start = DEFAULT_MANIFEST.world.start;
  }
  // 시트 실제 크기로 프레임 크기 보정(manifest에 frameWidth가 없을 때)
  for (const key of ['hero', 'moa']) {
    const sp = manifest.sprites[key], img = images[key];
    if (img && !manifestRaw?.sprites?.[key]?.frameWidth) { sp.frameWidth = Math.floor(img.naturalWidth / sp.columns); sp.frameHeight = Math.floor(img.naturalHeight / sp.rows); }
  }
  return {images, manifest, status};
}

// 스프라이트 시트에서 (방향, 걸음 프레임) 칸을 고른다. 열 순서는 manifest.order.
export function frameRect(sprite, direction, step) {
  const col = Math.max(0, sprite.order.indexOf(direction));
  const row = step % sprite.rows;
  return {sx: col * sprite.frameWidth, sy: row * sprite.frameHeight, sw: sprite.frameWidth, sh: sprite.frameHeight};
}
