import {frameRect} from './assets.mjs';
import {drawKid, drawMoa, drawParcel} from './sprites.mjs';
import {reducedMotion} from './dom.mjs?v=tablet-20261115';

// 사전 렌더한 트럭으로 3D 런타임 없이 동일한 마을·캐릭터의 배송을 축하한다.
export function animateEnding(canvas, assets) {
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  const t0 = performance.now();
  function actor(kind, x, bottom, height) {
    const img = assets?.images?.[kind], sp = assets?.manifest?.sprites?.[kind];
    if (img && sp) {
      const f = frameRect(sp, 'down', 0), width = height * f.sw / f.sh;
      ctx.drawImage(img, f.sx, f.sy, f.sw, f.sh, x - width / 2, bottom - height, width, height);
    } else if (kind === 'hero') drawKid(ctx, x, bottom, 0, 0, 1.5, false);
    else drawMoa(ctx, x, bottom, 0, 0, 1.3, false, 'happy');
  }
  function drawScene(k) {
    ctx.clearRect(0, 0, 600, 240);
    ctx.fillStyle = '#abc3a2'; ctx.fillRect(0, 0, 600, 240);
    const world = assets?.images?.world;
    if (world) ctx.drawImage(world, 0, world.height * .22, world.height, world.height * .4, 0, 0, 600, 240);
    const light = ctx.createLinearGradient(0, 0, 0, 240);
    light.addColorStop(0, '#fff1c433'); light.addColorStop(.5, '#ead7b699'); light.addColorStop(1, '#e6c897');
    ctx.fillStyle = light; ctx.fillRect(0, 0, 600, 240);
    ctx.fillStyle = '#68745528'; ctx.beginPath(); ctx.ellipse(373, 216, 181, 13, 0, 0, Math.PI * 2); ctx.fill();
    const truck = assets?.images?.truck, tx = 300 + (1 - Math.min(1, k * 2)) * 280;
    if (truck) ctx.drawImage(truck, tx + 20, 5, 215 * truck.width / truck.height, 215);
    else {
      ctx.fillStyle = '#dba846'; ctx.fillRect(tx, 65, 220, 130);
      ctx.fillStyle = '#326b72'; ctx.fillRect(tx, 105, 55, 65);
      for (const x of [tx + 35, tx + 185]) { ctx.fillStyle = '#34433c'; ctx.beginPath(); ctx.arc(x, 200, 18, 0, Math.PI * 2); ctx.fill(); }
    }
    actor('hero', 135, 221, 170); actor('moa', 63, 225, 104);
    const lift = Math.max(0, Math.min(1, (k - .4) / .6));
    drawParcel(ctx, 230 + lift * 45, 216 - lift * 24, 58);
    ctx.strokeStyle = '#fff6cf'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(264, 166); ctx.lineTo(271, 173); ctx.lineTo(285, 157); ctx.stroke();
    if (k > .5) {
      ctx.fillStyle = '#fff3b2';
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * Math.PI * 2, r = 38 + 10 * Math.sin(k * Math.PI);
        const x = 272 + Math.cos(a) * r, y = 154 + Math.sin(a) * r * .65;
        ctx.fillRect(x - 3, y - 1, 6, 2); ctx.fillRect(x - 1, y - 3, 2, 6);
      }
    }
  }
  if (reducedMotion()) { drawScene(1); return; }
  const tick = now => {
    const k = Math.min(1, (now - t0) / 2600); drawScene(k);
    if (k < 1 && canvas.isConnected) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
