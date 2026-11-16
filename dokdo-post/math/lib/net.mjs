// 전개도 판정 엔진. 조각(piece)은 모눈 위의 직사각형 {id, x, y, w, h} (정수, y는 아래로 +).
// 판정은 정답 그림과 비교하지 않고 "6조각·한 조각으로 연결·모서리 길이 대응·접은 뒤 6방향 점유(겹침·빈 면 없음)"으로 한다.
import {cross, dot, add, scaleVec, rotateAboutLine, samePoint, faceDims, FACE_NORMAL, OPPOSITE, cuboid} from './geometry.mjs';

const DIRS = {E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1]};
const KEY = v => `${v[0] > 0 ? '+' : v[0] < 0 ? '-' : '0'}${v[1] > 0 ? '+' : v[1] < 0 ? '-' : '0'}${v[2] > 0 ? '+' : v[2] < 0 ? '-' : '0'}`;
export const DIRECTION_FACE = {'+00': 'right', '-00': 'left', '0+0': 'top', '0-0': 'bottom', '00+': 'front', '00-': 'back'};
export const DIRECTION_LABEL = {right: '오른쪽', left: '왼쪽', top: '위', bottom: '아래', front: '앞', back: '뒤'};

export function overlaps2D(pieces) {
  const out = [];
  for (let i = 0; i < pieces.length; i++) for (let j = i + 1; j < pieces.length; j++) {
    const a = pieces[i], b = pieces[j];
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) out.push([a.id, b.id]);
  }
  return out;
}

// 두 조각이 변 전체를 공유하면 접을 수 있는 이웃. 일부만 닿으면 partial(길이가 맞지 않음).
export function adjacency(pieces) {
  const full = [], partial = [];
  for (let i = 0; i < pieces.length; i++) for (let j = 0; j < pieces.length; j++) {
    if (i === j) continue;
    const a = pieces[i], b = pieces[j];
    // b가 a의 동쪽에 닿는 경우
    if (b.x === a.x + a.w) {
      const lo = Math.max(a.y, b.y), hi = Math.min(a.y + a.h, b.y + b.h);
      if (hi > lo) (a.y === b.y && a.h === b.h ? full : partial).push({a: a.id, b: b.id, dir: 'E'});
    }
    if (b.y === a.y + a.h) {
      const lo = Math.max(a.x, b.x), hi = Math.min(a.x + a.w, b.x + b.w);
      if (hi > lo) (a.x === b.x && a.w === b.w ? full : partial).push({a: a.id, b: b.id, dir: 'S'});
    }
  }
  // 반대 방향도 등록
  const both = [];
  for (const e of full) { both.push(e); both.push({a: e.b, b: e.a, dir: e.dir === 'E' ? 'W' : 'N'}); }
  return {full: both, partial};
}

function components(pieces, edges) {
  const seen = new Set(), comps = [];
  for (const p of pieces) {
    if (seen.has(p.id)) continue;
    const comp = [], stack = [p.id];
    while (stack.length) {
      const id = stack.pop();
      if (seen.has(id)) continue;
      seen.add(id); comp.push(id);
      for (const e of edges) if (e.a === id && !seen.has(e.b)) stack.push(e.b);
    }
    comps.push(comp);
  }
  return comps;
}

// 접기 규칙: 방향 D로 접으면 새 법선 N' = D, D에 해당하는 축은 ∓N으로 바뀐다.
function foldFrame(frame, dir) {
  const {U, V, N} = frame;
  if (dir === 'E') return {N: U, U: scaleVec(N, -1), V};
  if (dir === 'W') return {N: scaleVec(U, -1), U: N, V};
  if (dir === 'S') return {N: V, U, V: scaleVec(N, -1)};
  return {N: scaleVec(V, -1), U, V: N};
}

// dims: {x,y,z} 목표 상자. 결과: {ok, errors:[{type, pieces, detail}], assignment:{pieceId: faceId}, tree, missing}
export function foldNet(pieces, dims) {
  const errors = [];
  const ids = pieces.map(p => p.id);
  if (pieces.length !== 6) errors.push({type: 'count', pieces: ids, detail: pieces.length});
  const ov = overlaps2D(pieces);
  for (const pair of ov) errors.push({type: 'overlap2d', pieces: pair});
  const {full, partial} = adjacency(pieces);
  const comps = components(pieces, full);
  if (comps.length > 1) {
    // 다른 조각 덩어리와 일부만 닿아 있으면 "모서리 길이가 맞지 않아 이어지지 않음"으로 안내한다.
    const compOf = {}; comps.forEach((c, i) => c.forEach(id => compOf[id] = i));
    const lengthPairs = partial.filter(e => compOf[e.a] !== compOf[e.b]);
    for (const e of lengthPairs) errors.push({type: 'edge-length', pieces: [e.a, e.b]});
    errors.push({type: 'disconnected', pieces: comps.map(c => c[0]), detail: comps});
  }
  // BFS 접기: 첫 조각을 아랫면(법선 -y)으로 둔다. 첫 조각이 어떤 면이든 되도록 상자의 세 길이를 첫 조각에 맞게 다시 이름 붙인다.
  const assignment = {}, frames = {}, tree = [], normals = {};
  let d = dims;
  if (dims && pieces.length) {
    const rootPiece = pieces[0];
    const rest = [dims.x, dims.y, dims.z];
    const take = v => { const i = rest.indexOf(v); if (i < 0) return false; rest.splice(i, 1); return true; };
    if (take(rootPiece.w) && take(rootPiece.h)) d = {x: rootPiece.w, y: rest[0], z: rootPiece.h};
    else { errors.push({type: 'size', pieces: [rootPiece.id], detail: {need: [dims.x, dims.z], got: [rootPiece.w, rootPiece.h], face: 'bottom'}}); d = null; }
  }
  if (pieces.length) {
    const root = pieces[0].id;
    frames[root] = {N: [0, -1, 0], U: [1, 0, 0], V: [0, 0, 1]};
    const queue = [root]; const visited = new Set([root]);
    while (queue.length) {
      const id = queue.shift();
      for (const e of full) {
        if (e.a !== id || visited.has(e.b)) continue;
        visited.add(e.b);
        frames[e.b] = foldFrame(frames[id], e.dir);
        tree.push({parent: id, child: e.b, dir: e.dir});
        queue.push(e.b);
      }
    }
    for (const p of pieces) {
      const f = frames[p.id];
      if (!f) continue;
      const key = KEY(f.N);
      const face = DIRECTION_FACE[key];
      if (normals[key]) errors.push({type: 'overlap', pieces: [normals[key], p.id], detail: face});
      else normals[key] = p.id;
      assignment[p.id] = face;
      if (d) {
        const need = [dimAlong(d, f.U), dimAlong(d, f.V)];
        if (need[0] !== p.w || need[1] !== p.h) errors.push({type: 'size', pieces: [p.id], detail: {need, got: [p.w, p.h], face}});
      }
    }
  }
  const missing = Object.keys(DIRECTION_FACE).filter(k => !normals[k]).map(k => DIRECTION_FACE[k]);
  const ok = errors.length === 0 && missing.length === 0;
  return {ok, errors, assignment, tree, frames, missing, cycle: full.length / 2 > pieces.length - 1};
}

function dimAlong(dims, axis) {
  if (axis[0]) return dims.x;
  if (axis[1]) return dims.y;
  return dims.z;
}

export function cubeDims(size = 1) { return {x: size, y: size, z: size}; }
export function isCubeNet(cells) {
  const pieces = cells.map(([x, y], i) => ({id: 'c' + i, x, y, w: 1, h: 1}));
  return foldNet(pieces, cubeDims(1));
}

// 접기 애니메이션용 3D 좌표. t=0 평면, t=1 상자. 평면은 y=0 (모눈 x→X, 모눈 y→Z).
// 반환: {pieceId: [[x,y,z]×4 (시계 방향 모서리: 좌상, 우상, 우하, 좌하)]}
export function foldPositions(pieces, tree, t) {
  const angle = t * Math.PI / 2;
  const byId = Object.fromEntries(pieces.map(p => [p.id, p]));
  const transform = {};
  if (!pieces.length) return {};
  const parentOf = {}; for (const e of tree) parentOf[e.child] = e;
  function tf(id) {
    if (transform[id]) return transform[id];
    const link = parentOf[id];
    if (!link) return transform[id] = p => p;
    const parent = byId[link.parent];
    const d = DIRS[link.dir];
    // 공유 변 위의 점과 아이 쪽으로 향하는 방향
    const edgePoint = link.dir === 'E' ? [parent.x + parent.w, 0, parent.y]
      : link.dir === 'W' ? [parent.x, 0, parent.y]
      : link.dir === 'S' ? [parent.x, 0, parent.y + parent.h]
      : [parent.x, 0, parent.y];
    const D = [d[0], 0, d[1]];
    const axis = cross(D, [0, 1, 0]);
    const parentTf = tf(link.parent);
    return transform[id] = p => parentTf(rotateAboutLine(p, edgePoint, axis, angle));
  }
  const out = {};
  for (const p of pieces) {
    const f = tf(p.id);
    out[p.id] = [[p.x, 0, p.y], [p.x + p.w, 0, p.y], [p.x + p.w, 0, p.y + p.h], [p.x, 0, p.y + p.h]].map(f);
  }
  return out;
}

// 접었을 때 만나는 점/모서리 계산.
// 모눈 점 (x,y)별로 그 점을 꼭짓점으로 가진 조각의 3D 위치를 모은다.
export function foldedPoints(pieces, tree) {
  const pos = foldPositions(pieces, tree, 1);
  const points = new Map();
  for (const p of pieces) {
    const corners = [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.h], [p.x, p.y + p.h]];
    corners.forEach((c, i) => {
      const key = `${c[0]},${c[1]}`;
      if (!points.has(key)) points.set(key, {x: c[0], y: c[1], key, world: []});
      points.get(key).world.push(pos[p.id][i]);
    });
  }
  return [...points.values()];
}

export function meetingPoints(pieces, tree, key) {
  const points = foldedPoints(pieces, tree);
  const me = points.find(p => p.key === key);
  if (!me) return [];
  return points.filter(p => p.key !== key && p.world.some(w => me.world.some(m => samePoint(w, m, 1e-4)))).map(p => p.key);
}

// 경계(잘린) 변 목록: 각 조각의 변 중 완전 공유되지 않은 것. 단위 길이 세그먼트로 나눈다.
export function boundarySegments(pieces) {
  const {full} = adjacency(pieces);
  const segs = [];
  for (const p of pieces) {
    const sides = {N: [[p.x, p.y], [p.x + p.w, p.y]], S: [[p.x, p.y + p.h], [p.x + p.w, p.y + p.h]], W: [[p.x, p.y], [p.x, p.y + p.h]], E: [[p.x + p.w, p.y], [p.x + p.w, p.y + p.h]]};
    for (const [dir, [a, b]] of Object.entries(sides)) {
      if (full.some(e => e.a === p.id && e.dir === dir)) continue;
      const len = dir === 'N' || dir === 'S' ? p.w : p.h;
      for (let i = 0; i < len; i++) {
        const s = dir === 'N' || dir === 'S' ? [[a[0] + i, a[1]], [a[0] + i + 1, a[1]]] : [[a[0], a[1] + i], [a[0], a[1] + i + 1]];
        segs.push({piece: p.id, dir, a: s[0], b: s[1], key: segKey(s[0], s[1])});
      }
    }
  }
  return segs;
}
export function segKey(a, b) { return [`${a[0]},${a[1]}`, `${b[0]},${b[1]}`].sort().join('|'); }

export function meetingSegments(pieces, tree, key) {
  const segs = boundarySegments(pieces);
  const pos = foldPositions(pieces, tree, 1);
  const byId = Object.fromEntries(pieces.map(p => [p.id, p]));
  const world = s => {
    const p = byId[s.piece];
    const corners = pos[s.piece];
    const map = ([x, y]) => {
      const u = (x - p.x) / p.w, v = (y - p.y) / p.h;
      const top = add(scaleVec(corners[0], 1 - u), scaleVec(corners[1], u));
      const bottom = add(scaleVec(corners[3], 1 - u), scaleVec(corners[2], u));
      return add(scaleVec(top, 1 - v), scaleVec(bottom, v));
    };
    return [map(s.a), map(s.b)];
  };
  const mine = segs.filter(s => s.key === key);
  if (!mine.length) return [];
  const mineW = mine.map(world);
  const out = new Set();
  for (const s of segs) {
    if (s.key === key) continue;
    const [a, b] = world(s);
    for (const [ma, mb] of mineW) {
      if ((samePoint(a, ma, 1e-4) && samePoint(b, mb, 1e-4)) || (samePoint(a, mb, 1e-4) && samePoint(b, ma, 1e-4))) out.add(s.key);
    }
  }
  return [...out];
}

// 회전·뒤집기·이동이 같은 전개도는 같은 모양으로 본다.
export function canonicalKey(pieces) {
  const transforms = [
    ([x, y]) => [x, y], ([x, y]) => [-x, y], ([x, y]) => [x, -y], ([x, y]) => [-x, -y],
    ([x, y]) => [y, x], ([x, y]) => [-y, x], ([x, y]) => [y, -x], ([x, y]) => [-y, -x]
  ];
  let best = null;
  for (const tf of transforms) {
    const rects = pieces.map(p => {
      const c1 = tf([p.x, p.y]), c2 = tf([p.x + p.w, p.y + p.h]);
      return [Math.min(c1[0], c2[0]), Math.min(c1[1], c2[1]), Math.abs(c2[0] - c1[0]), Math.abs(c2[1] - c1[1])];
    });
    const minX = Math.min(...rects.map(r => r[0])), minY = Math.min(...rects.map(r => r[1]));
    const key = rects.map(r => [r[0] - minX, r[1] - minY, r[2], r[3]].join(',')).sort().join(';');
    if (best === null || key < best) best = key;
  }
  return best;
}
export function sameNet(a, b) { return canonicalKey(a) === canonicalKey(b); }

// 정육면체/직육면체를 모서리 절개로 펼치기. foldEdges: 잘리지 않은(접히는) 모서리 id 목록.
// 5개 모서리가 6면을 모두 잇는 나무 구조일 때만 한 조각의 평면 전개도가 된다.
export function unfoldByFolds(dims, foldEdges) {
  const solid = cuboid(dims.x, dims.y, dims.z);
  const faceOf = {};
  for (const f of solid.faces) for (const e of f.edges) (faceOf[e] ||= []).push(f.id);
  const links = foldEdges.map(e => ({edge: e, faces: faceOf[e]})).filter(l => l.faces?.length === 2);
  const adj = {}; for (const f of solid.faces) adj[f.id] = [];
  for (const l of links) { adj[l.faces[0]].push({to: l.faces[1], edge: l.edge}); adj[l.faces[1]].push({to: l.faces[0], edge: l.edge}); }
  // 연결·순환 검사
  const seen = new Set(['bottom']), queue = ['bottom'];
  const pieces = [{id: 'bottom', x: 0, y: 0, w: dims.x, h: dims.z}];
  const frames = {bottom: {N: [0, -1, 0], U: [1, 0, 0], V: [0, 0, 1]}};
  while (queue.length) {
    const id = queue.shift();
    const parent = pieces.find(p => p.id === id), frame = frames[id];
    for (const {to} of adj[id]) {
      if (seen.has(to)) continue;
      seen.add(to);
      const M = FACE_NORMAL[to];
      const dir = dot(M, frame.U) > 0 ? 'E' : dot(M, frame.U) < 0 ? 'W' : dot(M, frame.V) > 0 ? 'S' : 'N';
      const childFrame = foldFrame(frame, dir);
      const w = dimAlong(dims, childFrame.U), h = dimAlong(dims, childFrame.V);
      const piece = {id: to, w, h,
        x: dir === 'E' ? parent.x + parent.w : dir === 'W' ? parent.x - w : parent.x,
        y: dir === 'S' ? parent.y + parent.h : dir === 'N' ? parent.y - h : parent.y};
      pieces.push(piece); frames[to] = childFrame; queue.push(to);
    }
  }
  const connected = seen.size === 6;
  const acyclic = links.length === 5;
  const status = !connected ? 'disconnected' : links.length > 5 ? 'not-flat' : 'ok';
  // 평면에서 겹치는 경우도 확인
  const flatOverlap = overlaps2D(pieces).length > 0;
  return {ok: connected && acyclic && !flatOverlap, status: flatOverlap && status === 'ok' ? 'overlap' : status, pieces, foldEdges: links.map(l => l.edge), cutEdges: solid.edges.map(e => e.id).filter(e => !foldEdges.includes(e))};
}

// 정육면체 전개도 11종(단위 셀 좌표). 유효성 테스트와 복습 후보 생성에 사용.
export const CUBE_NETS = [
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, -1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, -1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [2, -1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, -1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [1, -1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [2, -1]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [2, -1], [3, -1]],
  [[0, 0], [1, 0], [2, 0], [1, 1], [2, -1], [3, -1]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, -1], [3, -1]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]]
];
// 정육면체 전개도가 아닌 6칸 모양(겹침·빈 면). 예측 문항 후보.
export const NOT_CUBE_NETS = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [3, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, -1]]
];
export function facesOfNet(pieces, dims) {
  const {assignment} = foldNet(pieces, dims);
  return assignment;
}
export function oppositeOf(face) { return OPPOSITE[face]; }
export function faceSize(dims, face) { return faceDims(dims, face); }
