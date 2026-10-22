// Pure stage logic for '햇살이 머무는 숲' (no three.js here, so node tests can load it).
// Phases: null → loading → opening → arrive → walk → sit → compose. Close/fail return to the plain editor.
const FLOW = {
  open: {null: 'loading'},
  ready: {loading: 'opening'},
  opened: {opening: 'arrive'},
  walk: {arrive: 'walk'},
  blocked: {walk: 'arrive'},
  arrived: {arrive: 'sit', walk: 'sit'},
  seated: {sit: 'compose'},
  skip: {loading: 'compose', opening: 'compose', arrive: 'compose', walk: 'compose', sit: 'compose'},
  map: {walk: 'arrive'} // a stage change mid-assist returns to exploring on the new stage; seated stays seated
};
export function forestReduce(phase, event) {
  if (event === 'close' || event === 'fail') return null;
  return FLOW[event]?.[phase] ?? phase;
}

// The forest stays behind the library and backing choices; the cinematic view needs real sound (first beat), not just a play request.
export function forestView({phase, screen, playing, audible}) {
  const visible = !!phase;
  return {visible, intro: visible && screen === 'edit' && phase !== 'compose', cinema: visible && screen === 'edit' && phase === 'compose' && !!playing && !!audible};
}

// Exploring is seen through the player's own eyes; sitting and composing use the external seated shot.
export function forestAtPiano(p) { return Number.isFinite(p.x) && Number.isFinite(p.z) && p.z >= .65 && p.z <= 1.8 && Math.abs(p.x) <= 1.05; }
export function forestCamera(phase) { return phase === 'opening' ? 'opening' : phase === 'sit' || phase === 'compose' ? 'seated' : 'first-person'; }
export const FOREST_OPENING_SECONDS = 5.2;
// A short high view settles into the exact walking eye; the picture fades well before the camera reaches it.
export function forestOpeningShot(position, eye, progress) {
  const t=Math.max(0,Math.min(1,progress)),k=t*t*t*(t*(t*6-15)+10);
  // An arcing dolly descends beside the child before easing into the walking eye.
  const from={x:position.x+4.3,y:position.y+4.2,z:position.z+4.7};
  const control={x:position.x-2.2,y:position.y+3.5,z:position.z+3.1};
  const positionAt={},target={};
  const look={x:position.x-.4,y:position.y+.85,z:position.z-3.2};
  for(const axis of ['x','y','z']){
    positionAt[axis]=(1-k)*(1-k)*from[axis]+2*(1-k)*k*control[axis]+k*k*eye.position[axis];
    target[axis]=look[axis]+(eye.target[axis]-look[axis])*k;
  }
  return {position:positionAt,target};
}
// Standing is visible only during the opening; ordinary walking remains first person.
export function forestCharacter(phase, sitT = 0, openingT = 0) {
  const opacity = phase === 'opening' ? Math.max(0,Math.min(1,(.5-openingT)/.22)) : phase === 'compose' ? 1 : phase === 'sit' ? Math.max(0, Math.min(1, (sitT - .5) * 2)) : 0;
  return {visible: opacity > 0, opacity};
}

// Six stages, one per featured backing. The UI protects the current song before changing maps.
export const FOREST_MAPS = [
  {id: 'basic', name: '햇살이 머무는 숲', icon: '☀'},
  {id: 'pop', name: '리듬 놀이터', icon: '🎈'},
  {id: 'warm', name: '바람의 숲', icon: '🌾'},
  {id: 'dream', name: '별빛 오솔길', icon: '✨'},
  {id: 'journey', name: '구름섬', icon: '☁'},
  {id: 'moon', name: '달빛 우체국', icon: '🌙'}
];
const LEGACY_MAP = {walk: 'basic', letter: 'warm', adventure: 'pop'};
export function forestMapId(id) { return FOREST_MAPS.some(m => m.id === id) ? id : 'basic'; }
export function forestMapFor(progression) { return forestMapId(LEGACY_MAP[progression] || progression); }
export function forestMapName(id) { const m = FOREST_MAPS.find(m => m.id === forestMapId(id)); return `${m.icon} ${m.name}`; }

// 22 modelled white keys from C3 (midi 48) to C6 (midi 84); the app's 15 pitches are keys 7..21. Black keys return null.
export const KEY_START = 48, WHITE_KEYS = 22;
const WHITE = [0, null, 1, null, 2, 3, null, 4, null, 5, null, 6];
export function pianoKey(midi) {
  if (!Number.isInteger(midi) || midi < KEY_START) return null;
  const step = WHITE[midi % 12], index = step === null ? null : (Math.floor(midi / 12) - 4) * 7 + step;
  return index !== null && index < WHITE_KEYS ? index : null;
}

export function webglAvailable(doc = globalThis.document) {
  try {
    const gl = doc.createElement('canvas').getContext('webgl2') || doc.createElement('canvas').getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
// Keep a partial image-load failure from leaking the other successfully loaded texture.
export async function loadForestArt(loader, urls) {
  const results = await Promise.allSettled(urls.map(url => loader.loadAsync(url)));
  if (results.some(r => r.status === 'rejected')) {
    results.forEach(r => { if (r.status === 'fulfilled') r.value.dispose(); });
    throw new Error('Forest illustration could not load');
  }
  return results.map(r => r.value);
}
