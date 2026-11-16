// 배송 마을 지도. 타일 단위 충돌·경로 탐색·목적지. 화면 그리기는 ui/village-scene.mjs가 맡는다.
export const TILE = 48;
export const MAP_W = 36, MAP_H = 24;

// 작업장·배송장 위치. rect: 건물 몸체(막힘), door: 문 앞 타일(도착 판정).
export const PLACES = [
  {id: 'w1', name: '분류대', icon: 'sort', rect: [9, 2, 5, 5], door: [11, 7], color: '#d98f3c', roof: '#c9533a'},
  {id: 'w2', name: '검사대', icon: 'lens', rect: [16, 1, 6, 6], door: [18, 7], color: '#2a8c8f', roof: '#c9533a'},
  {id: 'w3', name: '설계대', icon: 'ruler', rect: [24, 2, 5, 5], door: [26, 7], color: '#5b7fb9', roof: '#3f6d9c'},
  {id: 'w4', name: '고정대', icon: 'clamp', rect: [9, 14, 5, 5], door: [11, 19], color: '#8f6b3f', roof: '#c9533a'},
  {id: 'w5', name: '정육면체 포장대', icon: 'cube', rect: [16, 13, 6, 6], door: [18, 19], color: '#2f7f6c', roof: '#3f6d9c'},
  {id: 'w6', name: '맞춤 포장대', icon: 'tape', rect: [24, 14, 5, 5], door: [26, 19], color: '#b9793f', roof: '#c9533a'},
  {id: 'final', name: '배송장', icon: 'truck', rect: [0, 15, 5, 5], door: [2, 14], color: '#e3b23c', roof: '#6b6b6b'}
];

// 지도 생성. 문자: . 풀 / = 돌길 / ~ 물 / B 다리 / # 건물 / T 나무 / f 울타리 / l 가로등 / b 벤치 / r 바위 / F 꽃 / P 광장
export function buildMap() {
  const g = Array.from({length: MAP_H}, () => Array(MAP_W).fill('.'));
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) g[y][x] = c; };
  const fill = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, c); };
  // 강과 다리
  fill(5, 0, 3, MAP_H, '~');
  fill(5, 8, 3, 2, 'B');
  // 길
  fill(8, 8, 27, 2, '=');       // 위쪽 큰길
  fill(8, 20, 27, 2, '=');      // 아래쪽 큰길
  fill(18, 8, 2, 14, '=');      // 가운데 세로길
  fill(31, 8, 2, 14, '=');      // 동쪽 세로길
  fill(10, 8, 2, 14, '=');      // 서쪽 세로길
  fill(1, 8, 4, 2, '=');        // 다리 건너 서쪽 길
  fill(2, 10, 2, 4, '=');       // 배송장으로 내려가는 길
  fill(14, 10, 10, 3, 'P');     // 가운데 광장
  // 건물. 문 앞 타일은 길로 둔다.
  for (const p of PLACES) { const [x, y, w, h] = p.rect; fill(x, y, w, h, '#'); }
  for (const p of PLACES) { const [dx, dy] = p.door; set(dx, dy, '='); if (g[dy + 1]?.[dx] === '.') set(dx, dy + 1, '='); }
  // 나무·꽃·울타리·가로등·벤치·바위
  const trees = [[9, 0], [14, 0], [23, 1], [30, 1], [33, 3], [1, 2], [2, 5], [34, 6], [14, 12], [24, 12], [34, 11], [34, 16], [9, 22], [15, 23], [23, 23], [30, 23], [33, 22], [1, 22], [3, 0], [12, 12], [29, 12], [8, 13], [22, 23], [0, 12]];
  for (const [x, y] of trees) if (g[y][x] === '.') set(x, y, 'T');
  const flowers = [[13, 11], [22, 11], [13, 17], [23, 17], [8, 11], [30, 11], [8, 17], [30, 17], [1, 11], [4, 12], [12, 1], [28, 1], [21, 0], [12, 22], [28, 22]];
  for (const [x, y] of flowers) if (g[y][x] === '.') set(x, y, 'F');
  for (let y = 0; y < MAP_H; y++) if (g[y][8] === '.' && y !== 8 && y !== 9) set(8, y, 'f');
  const lamps = [[13, 10], [23, 10], [13, 19], [23, 19], [9, 10], [30, 10], [30, 19], [1, 10]];
  for (const [x, y] of lamps) if (g[y][x] === '.' || g[y][x] === 'F') set(x, y, 'l');
  const benches = [[14, 11], [24, 11], [22, 17]];
  for (const [x, y] of benches) if (g[y][x] === '.' || g[y][x] === 'F') set(x, y, 'b');
  const rocks = [[4, 3], [4, 6], [4, 20], [4, 22], [33, 8], [33, 21]];
  for (const [x, y] of rocks) if (g[y][x] === '.') set(x, y, 'r');
  return g;
}

export const WALKABLE = new Set(['.', '=', 'B', 'F', 'P']);
export function isWalkableTile(map, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
  return WALKABLE.has(map[ty][tx]);
}
// 발 밑 상자(가로 22, 세로 12)가 모두 걸을 수 있는 타일 위에 있어야 선다.
export function canStandAt(map, x, y) {
  const corners = [[x - 11, y - 6], [x + 11, y - 6], [x - 11, y + 5], [x + 11, y + 5]];
  return corners.every(([cx, cy]) => isWalkableTile(map, Math.floor(cx / TILE), Math.floor(cy / TILE)));
}
export function tileOf(x, y) { return [Math.floor(x / TILE), Math.floor(y / TILE)]; }
export function centerOf(tx, ty) { return [tx * TILE + TILE / 2, ty * TILE + TILE / 2]; }

// 너비 우선 탐색 경로. 목표가 막힌 타일이면 가장 가까운 걸을 수 있는 타일로 바꾼다.
export function findPath(map, from, to) {
  const start = from.slice(), goal = nearestWalkable(map, to);
  if (!goal) return null;
  const key = (x, y) => y * MAP_W + x;
  const prev = new Map([[key(...start), null]]);
  const queue = [start];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === goal[0] && y === goal[1]) {
      const path = [];
      let k = key(x, y);
      while (k !== null) { path.push([k % MAP_W, Math.floor(k / MAP_W)]); k = prev.get(k); }
      return path.reverse();
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!isWalkableTile(map, nx, ny) || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), key(x, y));
      queue.push([nx, ny]);
    }
  }
  return null;
}
export function nearestWalkable(map, [tx, ty], radius = 3) {
  if (isWalkableTile(map, tx, ty)) return [tx, ty];
  let best = null, bestD = Infinity;
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const x = tx + dx, y = ty + dy;
    if (!isWalkableTile(map, x, y)) continue;
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = [x, y]; }
  }
  return best;
}

export function placeByIndex(i) { return PLACES[i] || null; }
export function placeAtTile(tx, ty) { return PLACES.find(p => p.door[0] === tx && p.door[1] === ty) || null; }
export const START_POSITION = centerOf(19, 10);
