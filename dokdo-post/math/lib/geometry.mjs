// 직육면체의 수학 모델. 화면 그림이 아니라 좌표로 면·모서리·꼭짓점을 만든다.
// 좌표: x 오른쪽, y 위, z 앞(보는 사람 쪽). 상자는 원점을 중심으로 둔다.

export const FACES = ['front', 'back', 'top', 'bottom', 'right', 'left'];
export const FACE_LABEL = {front: '앞면', back: '뒷면', top: '윗면', bottom: '아랫면', right: '오른쪽 면', left: '왼쪽 면'};
export const FACE_NORMAL = {
  front: [0, 0, 1], back: [0, 0, -1], top: [0, 1, 0], bottom: [0, -1, 0], right: [1, 0, 0], left: [-1, 0, 0]
};
export const OPPOSITE = {front: 'back', back: 'front', top: 'bottom', bottom: 'top', right: 'left', left: 'right'};

// 꼭짓점 id: x(L/R) y(B/T) z(K=뒤/F=앞) 순서. 예) RTF = 오른쪽·위·앞.
export function vertexId(sx, sy, sz) {
  return (sx > 0 ? 'R' : 'L') + (sy > 0 ? 'T' : 'B') + (sz > 0 ? 'F' : 'K');
}
export function edgeId(a, b) { return [a, b].sort().join('-'); }

export function cuboid(w, h, d) {
  const dims = {x: w, y: h, z: d};
  const vertices = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    vertices.push({id: vertexId(sx, sy, sz), pos: [sx * w / 2, sy * h / 2, sz * d / 2], sign: [sx, sy, sz]});
  }
  const byId = Object.fromEntries(vertices.map(v => [v.id, v]));
  const edges = [];
  const seen = new Set();
  for (const a of vertices) for (const b of vertices) {
    const diff = a.sign.map((s, i) => s !== b.sign[i]);
    if (diff.filter(Boolean).length !== 1) continue;
    const id = edgeId(a.id, b.id);
    if (seen.has(id)) continue;
    seen.add(id);
    const axis = ['x', 'y', 'z'][diff.indexOf(true)];
    edges.push({id, a: a.id, b: b.id, axis, length: dims[axis]});
  }
  const faces = FACES.map(id => {
    const n = FACE_NORMAL[id];
    const axisIndex = n.findIndex(v => v !== 0);
    const sign = n[axisIndex];
    const faceVertices = vertices.filter(v => v.sign[axisIndex] === sign).map(v => v.id);
    const faceEdges = edges.filter(e => faceVertices.includes(e.a) && faceVertices.includes(e.b)).map(e => e.id);
    return {id, name: FACE_LABEL[id], normal: n, vertices: orderLoop(faceVertices, byId), edges: faceEdges, dims: faceDims(dims, id)};
  });
  return {dims, vertices, edges, faces, vertex: id => byId[id]};
}

// 면의 네 꼭짓점을 둘레 순서로 정렬한다(그릴 때 사용).
function orderLoop(ids, byId) {
  const out = [ids[0]];
  while (out.length < 4) {
    const last = byId[out[out.length - 1]];
    const next = ids.find(id => !out.includes(id) && last.sign.filter((s, i) => s !== byId[id].sign[i]).length === 1);
    out.push(next);
  }
  return out;
}

// 면 위의 두 변 길이 [가로, 세로]. 앞/뒤: x,y / 위/아래: x,z / 왼/오: z,y
export function faceDims(dims, faceId) {
  if (faceId === 'front' || faceId === 'back') return [dims.x, dims.y];
  if (faceId === 'top' || faceId === 'bottom') return [dims.x, dims.z];
  return [dims.z, dims.y];
}

export function isParallel(a, b) { return OPPOSITE[a] === b; }
export function isPerpendicular(a, b) { return a !== b && OPPOSITE[a] !== b; }
export function perpendicularFaces(faceId) { return FACES.filter(f => isPerpendicular(f, faceId)); }
export function lateralFaces(baseA, baseB = OPPOSITE[baseA]) {
  if (!isParallel(baseA, baseB)) return null;
  return FACES.filter(f => f !== baseA && f !== baseB);
}
export function parallelPairs() { return [['front', 'back'], ['top', 'bottom'], ['right', 'left']]; }
export function facesAtVertex(vid) {
  return [vid[0] === 'R' ? 'right' : 'left', vid[1] === 'T' ? 'top' : 'bottom', vid[2] === 'F' ? 'front' : 'back'];
}
export function edgesAtVertex(solid, vid) { return solid.edges.filter(e => e.a === vid || e.b === vid).map(e => e.id); }
export function perimeter(dimsPair) { return 2 * (dimsPair[0] + dimsPair[1]); }

export function isCube(dims) { return dims.x === dims.y && dims.y === dims.z; }
export function isSquare(w, h) { return w === h; }
export function squareFaces(dims) { return FACES.filter(f => { const [a, b] = faceDims(dims, f); return a === b; }); }

// 겨냥도 시점. view는 카메라가 있는 방향의 부호. 일반 시점 = 앞·위·오른쪽에서 봄 {x:1,y:1,z:1}.
export const STANDARD_VIEW = {x: 1, y: 1, z: 1};
export function viewSets(solid, view = STANDARD_VIEW) {
  const visibleFaces = FACES.filter(f => {
    const n = FACE_NORMAL[f];
    return n[0] * view.x + n[1] * view.y + n[2] * view.z > 0;
  });
  const hiddenFaces = FACES.filter(f => !visibleFaces.includes(f));
  const hiddenVertex = vertexId(-view.x, -view.y, -view.z);
  const hiddenEdges = edgesAtVertex(solid, hiddenVertex);
  return {
    visibleFaces, hiddenFaces,
    visibleEdges: solid.edges.map(e => e.id).filter(id => !hiddenEdges.includes(id)),
    hiddenEdges,
    visibleVertices: solid.vertices.map(v => v.id).filter(id => id !== hiddenVertex),
    hiddenVertices: [hiddenVertex]
  };
}

// 겨냥도용 사선 투영. 뒤로 갈수록 (view.x 방향, view.y 방향)으로 밀린다. 화면 y는 아래가 +.
export function obliqueProject(pos, dims, view = STANDARD_VIEW, scale = 40, depthRatio = [0.45, 0.32]) {
  const [x, y, z] = pos;
  const depth = (dims.z / 2 - z * view.z);
  const px = x * view.x + depth * depthRatio[0] * view.x;
  const py = y * view.y + depth * depthRatio[1] * view.y;
  return [px * scale, -py * scale];
}

// 숨은 모서리 세 길이의 합(일반 시점). 각 방향 하나씩이므로 x+y+z.
export function hiddenEdgeLengthSum(solid, view = STANDARD_VIEW) {
  const {hiddenEdges} = viewSets(solid, view);
  return hiddenEdges.reduce((sum, id) => sum + solid.edges.find(e => e.id === id).length, 0);
}

// 일반 입체 설명(분류대에서 사용). faces: 각 면의 모양 이름.
export function classifySolid(desc) {
  // desc.faceShapes: ['rect','rect',...] / 'square'는 정사각형(직사각형에 포함)
  const shapes = desc.faceShapes || [];
  const allRect = shapes.length === 6 && shapes.every(s => s === 'rect' || s === 'square');
  const allSquare = allRect && shapes.every(s => s === 'square');
  return {isCuboid: allRect, isCube: allSquare, nonRect: shapes.map((s, i) => [s, i]).filter(([s]) => s !== 'rect' && s !== 'square').map(([, i]) => i)};
}

export function cuboidFaceShapes(dims) {
  return FACES.map(f => { const [a, b] = faceDims(dims, f); return a === b ? 'square' : 'rect'; });
}

// 3D 회전·투영(회전하는 상자 화면용). yaw: y축 회전, pitch: x축 회전(라디안).
export function rotate(pos, yaw, pitch) {
  const [x, y, z] = pos;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  return [x1, y2, z2];
}
export function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
export function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
export function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
export function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
export function scaleVec(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
export function norm(a) { const l = Math.hypot(...a) || 1; return a.map(v => v / l); }
export function nearly(a, b, eps = 1e-6) { return Math.abs(a - b) < eps; }
export function samePoint(a, b, eps = 1e-6) { return nearly(a[0], b[0], eps) && nearly(a[1], b[1], eps) && nearly(a[2], b[2], eps); }

// 로드리게스 회전: 점 p를 직선(point, axis)을 중심으로 angle만큼 돌린다.
export function rotateAboutLine(p, point, axis, angle) {
  const k = norm(axis);
  const v = sub(p, point);
  const c = Math.cos(angle), s = Math.sin(angle);
  const term1 = scaleVec(v, c);
  const term2 = scaleVec(cross(k, v), s);
  const term3 = scaleVec(k, dot(k, v) * (1 - c));
  return add(point, add(term1, add(term2, term3)));
}

// 범용 다면체 생성기(분류대의 다른 입체). faces는 바깥에서 볼 때 반시계 방향 꼭짓점 번호.
export function prism(baseXZ, height, {shear = [0, 0]} = {}) {
  const n = baseXZ.length;
  const bottom = baseXZ.map(([x, z]) => [x, -height / 2, z]);
  const top = baseXZ.map(([x, z]) => [x + shear[0], height / 2, z + shear[1]]);
  const vertices = [...bottom, ...top];
  const faces = [];
  faces.push({ids: bottom.map((_, i) => n - 1 - i), kind: 'cap'});
  faces.push({ids: top.map((_, i) => n + i), kind: 'cap'});
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push({ids: [i, j, n + j, n + i], kind: 'side'});
  }
  return {vertices, faces};
}
export function regularPolygon(sides, radius) {
  return Array.from({length: sides}, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a) * radius];
  });
}
export function boxMesh(w, h, d) {
  return prism([[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], h);
}
