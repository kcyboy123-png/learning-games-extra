const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const finite = n => Number.isFinite(n) ? n : 0;

export function forestInput(x, z) {
  x = clamp(finite(x), -1, 1); z = clamp(finite(z), -1, 1);
  const length = Math.max(1, Math.hypot(x, z));
  return {x: x / length, z: z / length};
}

export function forestWalkable(x, z, obstacles = []) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < -5.8 || x > 5.8 || z < -4 || z > 13.6) return false;
  // Include the player's shoulder width around the piano case and scenery.
  if (x > -.98 && x < .98 && z > -2.7 && z < .48) return false;
  return !obstacles.some(o => Math.hypot(x - o.x, z - o.z) < o.radius + .22);
}

export function forestStep(position, input, yaw, dt, obstacles = []) {
  const v = forestInput(input.x, input.z), angle = finite(yaw);
  const distance = clamp(finite(dt), 0, .05) * 1.8;
  const dx = (v.x * Math.cos(angle) + v.z * Math.sin(angle)) * distance;
  const dz = (-v.x * Math.sin(angle) + v.z * Math.cos(angle)) * distance;
  let {x, z} = position;
  if (forestWalkable(x + dx, z + dz, obstacles)) { x += dx; z += dz; }
  else if (forestWalkable(x + dx, z, obstacles)) x += dx;
  else if (forestWalkable(x, z + dz, obstacles)) z += dz;
  const moved = Math.hypot(x - position.x, z - position.z);
  return {x, z, moved, heading: moved > 1e-5 ? Math.atan2(x - position.x, z - position.z) : null};
}

// First person while exploring: the eye sits on the player, drag turns yaw/pitch, and there is no orbit distance.
// yaw 0 looks toward -z (the piano), matching forestStep; positive pitch looks down.
export const EYE_HEIGHT = 1.35;
export function forestLook(view, dx = 0, dy = 0) {
  return {yaw: (view.yaw - finite(dx) * .005) % (Math.PI * 2), pitch: clamp(view.pitch + finite(dy) * .004, -.7, .7)};
}
export function forestEye(position, ground, view, height = EYE_HEIGHT) {
  const y = finite(ground) + height, c = Math.cos(view.pitch);
  return {position: {x: position.x, y, z: position.z},
    target: {x: position.x - Math.sin(view.yaw) * c, y: y - Math.sin(view.pitch), z: position.z - Math.cos(view.yaw) * c}};
}
// The piano assist walks a world route; the view eases round to face the way the player is going.
export function forestTurnToward(view, heading, dt) {
  const want = finite(heading) + Math.PI, k = 1 - Math.exp(-clamp(finite(dt), 0, .05) * 4);
  const turn = Math.atan2(Math.sin(want - view.yaw), Math.cos(want - view.yaw));
  return {yaw: view.yaw + turn * k, pitch: view.pitch + (.04 - view.pitch) * k};
}

export function forestOrbit(orbit, dx = 0, dy = 0, zoom = 0) {
  return {yaw: (orbit.yaw - finite(dx) * .005) % (Math.PI * 2),
    pitch: clamp(orbit.pitch + finite(dy) * .004, -.08, .85),
    distance: clamp(orbit.distance + finite(zoom) * .003, 1.7, 6)};
}

// A small grid is sufficient for the clearing; the assist must not walk through rocks after exploring.
export function forestRoute(start, obstacles = []) {
  const step = .2, cols = 59, rows = 89;
  const point = i => ({x: -5.8 + i % cols * step, z: -4 + Math.floor(i / cols) * step});
  const key = p => clamp(Math.round((p.z + 4) / step), 0, rows - 1) * cols + clamp(Math.round((p.x + 5.8) / step), 0, cols - 1);
  const from = key(start), goal = key({x: .62, z: 1.25}), queue = [from], prev = new Map([[from, -1]]);
  for (let n = 0; n < queue.length && !prev.has(goal); n++) {
    const i = queue[n], x = i % cols, z = Math.floor(i / cols);
    for (const [dx, dz] of [[0,-1],[1,0],[-1,0],[0,1]]) {
      const nx = x + dx, nz = z + dz, next = nz * cols + nx;
      if (nx < 0 || nx >= cols || nz < 0 || nz >= rows || prev.has(next)) continue;
      const p = point(next);
      if (!forestWalkable(p.x, p.z, obstacles)) continue;
      prev.set(next, i); queue.push(next);
    }
  }
  if (!prev.has(goal)) return [];
  const path = [{x: .62, z: 1.25}];
  for (let i = goal; i !== from; i = prev.get(i)) path.push(point(i));
  path.reverse();
  // Remove grid-sized zigzags only where the entire shortcut has body clearance.
  const result=[];let anchor=start,index=0;
  while(index<path.length){
    let next=index;
    for(let j=path.length-1;j>index;j--){
      const end=path[j],steps=Math.ceil(Math.hypot(end.x-anchor.x,end.z-anchor.z)/.04);
      let clear=true;
      for(let k=1;k<=steps;k++)if(!forestWalkable(anchor.x+(end.x-anchor.x)*k/steps,anchor.z+(end.z-anchor.z)*k/steps,obstacles)){clear=false;break;}
      if(clear){next=j;break;}
    }
    result.push(path[next]);anchor=path[next];index=next+1;
  }
  return result;
}
