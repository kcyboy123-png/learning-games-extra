// Use world coordinates, not screen pixels. A blocked axis can slide without jitter.
export function moveActor(actor, vector, elapsedSeconds, speed, canStand) {
  const length = Math.hypot(vector.x, vector.y);
  if (!length) return {...actor, moving:false};
  const dx = vector.x / length, dy = vector.y / length;
  const distance = speed * Math.min(Math.max(elapsedSeconds, 0), .05);
  let x = actor.x, y = actor.y;
  const steps = Math.max(1, Math.ceil(distance / 2));
  for (let i=0; i<steps; i++) {
    if (canStand(x + dx*distance/steps, y)) x += dx*distance/steps;
    if (canStand(x, y + dy*distance/steps)) y += dy*distance/steps;
  }
  const direction = (Math.round(Math.atan2(dy, dx) / (Math.PI/4)) + 8) % 8;
  return {...actor, x, y, direction, moving:Math.hypot(x-actor.x,y-actor.y) > .001};
}
