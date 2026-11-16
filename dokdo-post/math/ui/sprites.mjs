// 런타임 그림: 아이(노란 겉옷·소포 배낭), 상자 로봇 모아, 작업장 NPC. 모두 캔버스 도형으로 그린다.
// 시안의 캐릭터를 잘라 쓰지 않고 같은 색·실루엣을 유지한다.
const C = {skin: '#f3c9a3', hair: '#5a3a22', hoodie: '#f2c33c', hoodieDark: '#d9a72a', shorts: '#2b7a8a', shoe: '#e9dcc4', sock: '#fff',
  moa: '#2aa7a3', moaDark: '#1d7f7c', screen: '#1d2a2e', eye: '#fff4b0', pouch: '#f2c33c', box: '#c9a06a', boxDark: '#a67f4e', strap: '#3b3b3b'};

function facing(dir) {
  // 8방향(0=오른쪽, 시계 방향으로 증가, 화면 y 아래) → down/up/left/right
  if (dir === 1 || dir === 2 || dir === 3) return 'down';
  if (dir === 5 || dir === 6 || dir === 7) return 'up';
  return dir === 4 ? 'left' : 'right';
}

export function drawKid(ctx, x, y, dir = 2, phase = 0, scale = 1, moving = false) {
  const f = facing(dir);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (f === 'left' ? -1 : 1), scale);
  const swing = moving ? Math.sin(phase) * 5 : 0;
  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 2, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
  // 다리
  ctx.fillStyle = C.sock;
  ctx.fillRect(-9, -16 + Math.max(0, swing) * .3, 7, 14);
  ctx.fillRect(2, -16 + Math.max(0, -swing) * .3, 7, 14);
  ctx.fillStyle = C.shoe;
  ctx.fillRect(-10, -4 + Math.max(0, swing) * .3, 9, 5);
  ctx.fillRect(1, -4 + Math.max(0, -swing) * .3, 9, 5);
  // 배낭(뒤를 볼 때 앞에 그린다)
  if (f === 'up') drawPack(ctx, 0, -34);
  // 반바지
  ctx.fillStyle = C.shorts; roundRect(ctx, -12, -26, 24, 12, 3); ctx.fill();
  // 겉옷
  ctx.fillStyle = C.hoodie; roundRect(ctx, -13, -48, 26, 24, 6); ctx.fill();
  ctx.fillStyle = C.hoodieDark; ctx.fillRect(-13, -30, 26, 3);
  // 팔
  ctx.fillStyle = C.hoodie;
  ctx.fillRect(-18, -46 + swing * .4, 6, 16);
  ctx.fillRect(12, -46 - swing * .4, 6, 16);
  ctx.fillStyle = C.skin; ctx.fillRect(-18, -31 + swing * .4, 6, 5); ctx.fillRect(12, -31 - swing * .4, 6, 5);
  // 어깨끈
  if (f !== 'up') { ctx.fillStyle = C.strap; ctx.fillRect(-9, -48, 3, 18); ctx.fillRect(6, -48, 3, 18); }
  // 머리
  ctx.fillStyle = C.skin; roundRect(ctx, -13, -72, 26, 26, 9); ctx.fill();
  ctx.fillStyle = C.hair;
  roundRect(ctx, -14, -76, 28, 14, 8); ctx.fill();
  if (f === 'up') { roundRect(ctx, -14, -76, 28, 24, 8); ctx.fill(); }
  else {
    ctx.beginPath(); ctx.moveTo(-14, -66); ctx.quadraticCurveTo(-6, -80, 4, -70); ctx.quadraticCurveTo(10, -78, 14, -66); ctx.lineTo(14, -62); ctx.lineTo(-14, -62); ctx.fill();
    // 얼굴
    ctx.fillStyle = '#2a1d14';
    if (f === 'down') { ctx.fillRect(-7, -58, 3, 4); ctx.fillRect(4, -58, 3, 4); ctx.fillStyle = '#c96a5a'; ctx.fillRect(-3, -51, 6, 2); }
    else { ctx.fillRect(5, -58, 3, 4); ctx.fillStyle = '#c96a5a'; ctx.fillRect(6, -51, 4, 2); }
  }
  if (f !== 'up' && f !== 'down') drawPack(ctx, -14, -34, true);
  ctx.restore();
}
function drawPack(ctx, x, y, side = false) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = C.box; roundRect(ctx, side ? -8 : -11, -14, side ? 10 : 22, 20, 3); ctx.fill();
  ctx.fillStyle = C.boxDark; ctx.fillRect(side ? -8 : -11, -6, side ? 10 : 22, 3);
  ctx.fillStyle = '#2aa7a3'; ctx.fillRect(side ? -6 : -4, -11, 4, 4);
  ctx.restore();
}

export function drawMoa(ctx, x, y, dir = 2, phase = 0, scale = 1, moving = false, mood = 'normal') {
  const f = facing(dir);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (f === 'left' ? -1 : 1), scale);
  const bob = moving ? Math.abs(Math.sin(phase)) * 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 2, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
  // 다리
  ctx.fillStyle = C.moaDark;
  ctx.fillRect(-9, -10 - bob, 6, 10); ctx.fillRect(3, -10 - bob, 6, 10);
  ctx.fillStyle = '#17302f'; ctx.fillRect(-10, -3, 8, 3); ctx.fillRect(2, -3, 8, 3);
  // 몸통
  ctx.fillStyle = C.moa; roundRect(ctx, -11, -28 - bob, 22, 18, 4); ctx.fill();
  ctx.fillStyle = C.moaDark; ctx.fillRect(-11, -14 - bob, 22, 3);
  // 팔
  ctx.fillStyle = C.moaDark; ctx.fillRect(-16, -26 - bob, 5, 12); ctx.fillRect(11, -26 - bob, 5, 12);
  ctx.fillStyle = '#17302f'; ctx.fillRect(-17, -15 - bob, 6, 4); ctx.fillRect(11, -15 - bob, 6, 4);
  // 주머니
  if (f !== 'up') { ctx.fillStyle = C.pouch; roundRect(ctx, 5, -22 - bob, 7, 7, 2); ctx.fill(); }
  // 머리(상자)
  ctx.fillStyle = C.moa; roundRect(ctx, -15, -52 - bob, 30, 24, 6); ctx.fill();
  ctx.fillStyle = C.moaDark; ctx.fillRect(-15, -31 - bob, 30, 3);
  // 안테나
  ctx.strokeStyle = C.moaDark; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, -52 - bob); ctx.lineTo(10, -62 - bob); ctx.stroke();
  ctx.fillStyle = C.pouch; ctx.beginPath(); ctx.arc(10, -64 - bob, 3.5, 0, Math.PI * 2); ctx.fill();
  // 얼굴 화면
  if (f !== 'up') {
    ctx.fillStyle = C.screen; roundRect(ctx, f === 'down' ? -12 : -6, -49 - bob, f === 'down' ? 24 : 18, 17, 4); ctx.fill();
    ctx.fillStyle = C.eye;
    if (mood === 'happy') {
      ctx.lineWidth = 2; ctx.strokeStyle = C.eye;
      ctx.beginPath(); ctx.arc(f === 'down' ? -5 : 0, -40 - bob, 3, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(f === 'down' ? 5 : 7, -40 - bob, 3, Math.PI, 0); ctx.stroke();
    } else {
      roundRect(ctx, f === 'down' ? -7 : -1, -45 - bob, 3, 8, 1.5); ctx.fill();
      roundRect(ctx, f === 'down' ? 4 : 6, -45 - bob, 3, 8, 1.5); ctx.fill();
    }
  }
  ctx.restore();
}

// 작업장 NPC. variant에 따라 앞치마 색이 바뀐다.
export function drawNpc(ctx, x, y, color = '#2b7a8a', scale = 1, wave = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 2, 17, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a3a2c'; ctx.fillRect(-10, -18, 8, 18); ctx.fillRect(2, -18, 8, 18);
  ctx.fillStyle = '#6b4b2a'; ctx.fillRect(-11, -4, 10, 5); ctx.fillRect(1, -4, 10, 5);
  ctx.fillStyle = '#f4efe2'; roundRect(ctx, -15, -54, 30, 36, 6); ctx.fill();
  ctx.fillStyle = color; roundRect(ctx, -11, -46, 22, 30, 4); ctx.fill();
  ctx.fillStyle = '#f4efe2'; ctx.fillRect(-19, -52, 6, 18);
  ctx.save(); ctx.translate(16, -50); ctx.rotate(-wave); ctx.fillRect(-3, 0, 6, 18); ctx.fillStyle = C.skin; ctx.fillRect(-3, -5, 6, 6); ctx.restore();
  ctx.fillStyle = C.skin; roundRect(ctx, -12, -78, 24, 25, 8); ctx.fill();
  ctx.fillStyle = '#3a3a3a'; roundRect(ctx, -13, -82, 26, 10, 6); ctx.fill();
  ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(-9, -68, 7, 5); ctx.strokeRect(2, -68, 7, 5);
  ctx.fillStyle = '#c96a5a'; ctx.fillRect(-3, -58, 6, 2);
  ctx.restore();
}

// 작은 소포 상자
export function drawParcel(ctx, x, y, size = 16, color = C.box) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = color; ctx.fillRect(-size / 2, -size, size, size);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-size / 2, -size, size, size * .22);
  ctx.fillStyle = '#2aa7a3'; ctx.fillRect(-size / 2 + size * .4, -size, size * .2, size);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
