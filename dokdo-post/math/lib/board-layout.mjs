// 전개도 보드 크기 계산(순수 함수, DOM 없음). 바탕 조각 + 보관함(또는 옮길 수 있는 조각)로 만들 수 있는
// 실제 정답 배치를 찾아, 최소 한 개(가능하면 여러 개)가 보드 안에 들어가도록 모눈 크기와 원점을 정한다.
// 판정은 lib/net.mjs의 foldNet/isCubeNet을 그대로 쓴다(정답 데이터 변경 없음).
import {foldNet, isCubeNet, overlaps2D} from './net.mjs';

export const FREE_BOARD = {cols: 15, rows: 12, ox: 0, oy: 0};

export function boundsOf(pieces) {
  if (!pieces.length) return {x: 0, y: 0, w: 0, h: 0};
  const minX = Math.min(...pieces.map(p => p.x)), minY = Math.min(...pieces.map(p => p.y));
  const maxX = Math.max(...pieces.map(p => p.x + p.w)), maxY = Math.max(...pieces.map(p => p.y + p.h));
  return {x: minX, y: minY, w: maxX - minX, h: maxY - minY};
}
function union(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return {x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y};
}
export function cellFor(cols, rows, {maxW = 500, maxH = 380, maxCell = 60} = {}) {
  return Math.min(maxCell, Math.floor(maxW / cols), Math.floor(maxH / rows));
}

// step: {base, tray, dims, net:'cube'?, fixedBase, movable, replaceable, rotatable}
// 반환: [{x, y, w, h, rest, bbox}] — rest는 그 조각을 놓기 전 나머지 조각들
export function validPlacements(step) {
  const base = step.base || [];
  if (!base.length) return [];
  const isCube = step.net === 'cube';
  const ok = pieces => (isCube ? isCubeNet(pieces.map(p => [p.x, p.y])) : foldNet(pieces, step.dims)).ok;
  const candidates = [];
  const add = (rest, w, h) => { candidates.push({rest, w, h}); if (w !== h) candidates.push({rest, w: h, h: w}); };
  for (const t of step.tray || []) if ((t.count ?? 1) > 0) add(base, t.w, t.h);
  if (!step.fixedBase && (step.movable || step.replaceable)) {
    for (const v of base) {
      const rest = base.filter(p => p !== v);
      if (step.rotatable) add(rest, v.w, v.h); else candidates.push({rest, w: v.w, h: v.h});
      for (const t of step.tray || []) if ((t.count ?? 1) > 0) add(rest, t.w, t.h);
    }
  }
  const bb = boundsOf(base);
  const reach = Math.max(1, ...candidates.map(c => Math.max(c.w, c.h)));
  const out = [], seen = new Set();
  for (const c of candidates) {
    for (let x = bb.x - reach; x <= bb.x + bb.w; x++) for (let y = bb.y - reach; y <= bb.y + bb.h; y++) {
      const key = `${x},${y},${c.w},${c.h},${c.rest.length}`;
      if (seen.has(key)) continue;
      const piece = {id: '__cand', x, y, w: c.w, h: c.h};
      if (overlaps2D([...c.rest, piece]).length) continue;
      const pieces = [...c.rest, piece];
      if (!ok(pieces)) continue;
      seen.add(key);
      out.push({x, y, w: c.w, h: c.h, rest: c.rest, bbox: boundsOf(pieces)});
    }
  }
  return out;
}

// 보드 계획: 바탕 + 정답 배치(가능한 한 많이, 셀이 minCell 이상 유지되는 범위)를 포함하는 모눈.
// 반환 {cols, rows, ox, oy, cell, included, total}
export function planBoard(step, {maxW = 500, maxH = 380, minCell = 24, maxCell = 60, margin = 1} = {}) {
  const base = step.base || [];
  if (!base.length) return {...FREE_BOARD, cell: cellFor(FREE_BOARD.cols, FREE_BOARD.rows, {maxW: 450, maxH: 360, maxCell}), included: 0, total: 0};
  const placements = validPlacements(step);
  const area = b => b.w * b.h;
  placements.sort((a, b) => area(union(boundsOf(base), a.bbox)) - area(union(boundsOf(base), b.bbox)));
  let box = boundsOf(base);
  let included = 0;
  for (const [i, p] of placements.entries()) {
    const next = union(box, p.bbox);
    const cols = next.w + 2 * margin, rows = next.h + 2 * margin;
    if (i === 0 || cellFor(cols, rows, {maxW, maxH, maxCell}) >= minCell) { box = next; included++; }
  }
  if (!placements.length) box = {x: box.x - 2, y: box.y - 2, w: box.w + 4, h: box.h + 4};
  const cols = Math.max(8, box.w + 2 * margin), rows = Math.max(6, box.h + 2 * margin);
  return {cols, rows, ox: margin - box.x, oy: margin - box.y, cell: cellFor(cols, rows, {maxW, maxH, maxCell}), included, total: placements.length};
}
// 조각 목록이 보드(cols, rows, ox, oy) 안에 완전히 들어가는지
export function fitsBoard(pieces, plan) {
  return pieces.every(p => p.x + plan.ox >= 0 && p.y + plan.oy >= 0 && p.x + p.w + plan.ox <= plan.cols && p.y + p.h + plan.oy <= plan.rows);
}
