// 그림 지도 위의 보행 모델. 월드 좌표 = 배경 이미지 픽셀. 걷기 가능 영역은 manifest의 walkRects 합집합이며,
// 길 터치 이동은 32px 격자 BFS로 만든다. 지도 그림은 코드로 다시 그리지 않는다.
export const GRID = 32;

export function createWorld(manifestWorld) {
  const W = manifestWorld.width, H = manifestWorld.height;
  const rects = manifestWorld.walkRects.map(r => ({x: r[0], y: r[1], w: r[2], h: r[3]}));
  const cols = Math.ceil(W / GRID), rows = Math.ceil(H / GRID);
  const inside = (x, y) => rects.some(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  // 격자 칸은 중심이 걷기 영역 안에 있으면 걸을 수 있다.
  const walk = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) walk[r * cols + c] = inside(c * GRID + GRID / 2, r * GRID + GRID / 2) ? 1 : 0;
  const cellOf = (x, y) => [Math.floor(x / GRID), Math.floor(y / GRID)];
  const centerOf = (c, r) => [c * GRID + GRID / 2, r * GRID + GRID / 2];
  const walkable = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && walk[r * cols + c] === 1;

  // 발 밑 상자(가로 feetW, 세로 feetH)가 모두 걷기 영역 안이면 선다.
  function canStand(x, y, feetW = 20, feetH = 10) {
    return inside(x - feetW / 2, y - feetH / 2) && inside(x + feetW / 2, y - feetH / 2) && inside(x - feetW / 2, y + feetH / 2) && inside(x + feetW / 2, y + feetH / 2);
  }
  function nearestWalkable(c, r, radius = 4) {
    if (walkable(c, r)) return [c, r];
    let best = null, bestD = Infinity;
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      if (!walkable(c + dx, r + dy)) continue;
      const d = dx * dx + dy * dy;
      if (d < bestD) { bestD = d; best = [c + dx, r + dy]; }
    }
    return best;
  }
  // BFS 경로. 반환: [실제 출발점, 격자 중심…, 마지막 점]. 시작/목표 칸이 막혀 있으면 가장 가까운 칸으로 바꾼다.
  // 마지막 점은 발 충돌 상자가 설 수 있는 목적지(toXY)일 때만 그대로 쓰고, 아니면 걸을 수 있는 격자 중심을 유지한다.
  function findPath(fromXY, toXY) {
    const start = nearestWalkable(...cellOf(fromXY[0], fromXY[1]));
    const goal = nearestWalkable(...cellOf(toXY[0], toXY[1]));
    if (!start || !goal) return null;
    const finish = canStand(toXY[0], toXY[1]) ? [toXY[0], toXY[1]] : centerOf(goal[0], goal[1]);
    // 같은 칸(근접 탭): 바로 목적지로
    if (start[0] === goal[0] && start[1] === goal[1]) return [[fromXY[0], fromXY[1]], finish];
    const key = (c, r) => r * cols + c;
    const prev = new Map([[key(...start), -1]]);
    const queue = [start];
    while (queue.length) {
      const [c, r] = queue.shift();
      if (c === goal[0] && r === goal[1]) {
        const path = [];
        let k = key(c, r);
        while (k !== -1) { path.push(centerOf(k % cols, Math.floor(k / cols))); k = prev.get(k); }
        path.reverse();
        // 마지막 격자 중심 대신 설 수 있는 목적지, 또는 격자 중심 유지
        path[path.length - 1] = finish;
        // 첫 칸 중심이 출발점과 거의 같으면 생략
        if (Math.hypot(path[0][0] - fromXY[0], path[0][1] - fromXY[1]) < 6) path.shift();
        path.unshift([fromXY[0], fromXY[1]]);
        return path;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dx, nr = r + dy;
        if (!walkable(nc, nr) || prev.has(key(nc, nr))) continue;
        prev.set(key(nc, nr), key(c, r));
        queue.push([nc, nr]);
      }
    }
    return null;
  }
  const places = manifestWorld.places.map(p => ({...p}));
  function placeNear(x, y, radius = 46) {
    let best = null, bestD = radius;
    for (const p of places) { const d = Math.hypot(p.door[0] - x, p.door[1] - y); if (d < bestD) { bestD = d; best = p; } }
    return best;
  }
  return {width: W, height: H, rects, cols, rows, GRID, inside, canStand, findPath, places, placeNear, walkable, cellOf, centerOf, start: manifestWorld.start.slice()};
}
