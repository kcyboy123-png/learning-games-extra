// 실행: node --test games/box-delivery/public/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {foldNet, isCubeNet, canonicalKey, sameNet, unfoldByFolds, meetingPoints, meetingSegments, boundarySegments, CUBE_NETS, NOT_CUBE_NETS, foldPositions} from '../lib/net.mjs';
import {edgeId, cuboid, samePoint} from '../lib/geometry.mjs';
import {crossNet, DIMS} from '../data/workshops.mjs';

const cells = list => list.map(([x, y], i) => ({id: `c${i}`, x, y, w: 1, h: 1}));

test('정육면체 전개도 11종은 모두 접힌다', () => {
  assert.equal(CUBE_NETS.length, 11);
  for (const net of CUBE_NETS) { const r = isCubeNet(net); assert.ok(r.ok, `fail: ${JSON.stringify(net)} ${JSON.stringify(r.errors)}`); }
  assert.equal(new Set(CUBE_NETS.map(n => canonicalKey(cells(n)))).size, 11, '11종이 서로 다른 모양');
});

test('전개도가 아닌 6칸 모양은 겹침/빈 면으로 판정', () => {
  for (const net of NOT_CUBE_NETS) {
    const r = isCubeNet(net);
    assert.ok(!r.ok);
    assert.ok(r.errors.some(e => e.type === 'overlap'), '겹치는 면 쌍을 알려 준다');
  }
});

test('모든 6칸 폴리오미노 중 정육면체 전개도는 정확히 11가지(회전·뒤집기 동치)', () => {
  // 고정 헥소미노 생성(BFS 성장)
  const key = s => s.map(c => c.join(',')).sort().join(';');
  let shapes = new Set(['0,0']);
  for (let n = 1; n < 6; n++) {
    const next = new Set();
    for (const s of shapes) {
      const cellsList = s.split(';').map(c => c.split(',').map(Number));
      for (const [x, y] of cellsList) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (cellsList.some(c => c[0] === nx && c[1] === ny)) continue;
        const grown = [...cellsList, [nx, ny]];
        const minX = Math.min(...grown.map(c => c[0])), minY = Math.min(...grown.map(c => c[1]));
        next.add(key(grown.map(([a, b]) => [a - minX, b - minY])));
      }
    }
    shapes = next;
  }
  const valid = new Set();
  let total = new Set();
  for (const s of shapes) {
    const c = cells(s.split(';').map(x => x.split(',').map(Number)));
    total.add(canonicalKey(c));
    if (foldNet(c, {x: 1, y: 1, z: 1}).ok) valid.add(canonicalKey(c));
  }
  assert.equal(total.size, 35, '자유 헥소미노는 35가지');
  assert.equal(valid.size, 11);
});

test('회전·뒤집기·이동한 전개도는 같은 모양', () => {
  const a = cells(CUBE_NETS[0]);
  const rotated = a.map(p => ({...p, x: -p.y + 10, y: p.x + 3}));
  const flipped = a.map(p => ({...p, x: -p.x, y: p.y}));
  assert.ok(sameNet(a, rotated)); assert.ok(sameNet(a, flipped));
  assert.ok(!sameNet(a, cells(CUBE_NETS[1])));
});

test('직육면체 4×3×2 십자 전개도: 6면 배정·크기 일치', () => {
  const net = crossNet(DIMS);
  assert.ok(net.ok);
  const r = foldNet(net.pieces, DIMS);
  assert.ok(r.ok, JSON.stringify(r.errors));
  assert.deepEqual(Object.values(r.assignment).sort(), ['back', 'bottom', 'front', 'left', 'right', 'top']);
  const sizes = net.pieces.map(p => `${p.w}x${p.h}`).sort();
  assert.deepEqual(sizes, ['3x2', '3x2', '4x2', '4x2', '4x3', '4x3']);
});

test('자유 설계: 첫 조각이 아랫면이 아니어도(앞면 4×3부터 놓아도) 유효한 전개도로 인정', () => {
  const net = crossNet(DIMS);
  const reordered = [...net.pieces.filter(p => p.id === 'front'), ...net.pieces.filter(p => p.id !== 'front')];
  const r = foldNet(reordered, DIMS);
  assert.ok(r.ok, JSON.stringify(r.errors));
  const sideFirst = [...net.pieces.filter(p => p.id === 'left'), ...net.pieces.filter(p => p.id !== 'left')];
  assert.ok(foldNet(sideFirst, DIMS).ok);
  // 상자의 어떤 면과도 크기가 맞지 않는 조각이 첫 조각이면 크기 오류
  const bad = [{id: 'x', x: 0, y: 0, w: 5, h: 5}, ...net.pieces.filter(p => p.id !== 'bottom')];
  assert.ok(foldNet(bad, DIMS).errors.some(e => e.type === 'size' && e.pieces[0] === 'x'));
});

test('직육면체 전개도: 조각 하나를 돌리면 크기 오류, 떼면 연결 오류', () => {
  const net = crossNet(DIMS);
  const rotated = net.pieces.map(p => p.id === 'right' ? {...p, w: p.h, h: p.w} : p);
  const r1 = foldNet(rotated, DIMS);
  assert.ok(!r1.ok);
  assert.ok(r1.errors.some(e => e.type === 'size' || e.type === 'disconnected' || e.type === 'edge-length'));
  const far = net.pieces.map(p => p.id === 'top' ? {...p, x: p.x + 20} : p);
  const r2 = foldNet(far, DIMS);
  assert.ok(r2.errors.some(e => e.type === 'disconnected'));
  const wrongSize = net.pieces.map(p => p.id === 'right' ? {...p, w: 4, h: 2} : p);
  const r3 = foldNet(wrongSize, DIMS);
  assert.ok(r3.errors.some(e => e.type === 'size'), '길이가 맞지 않는 조각');
});

test('겹치는 배치는 접었을 때 같은 면으로 판정된다(오른쪽 면이 왼쪽 자리로)', () => {
  const net = crossNet(DIMS);
  const bad = [...net.pieces.filter(p => p.id !== 'right'), {id: 'right', x: -2, y: 2, w: 2, h: 3}];
  const r = foldNet(bad, DIMS);
  assert.ok(!r.ok);
  const ov = r.errors.find(e => e.type === 'overlap');
  assert.ok(ov && ov.detail === 'left');
  assert.deepEqual(r.missing, ['right']);
  // 고친 뒤(앞면 오른쪽에 2×3)에는 유효
  const fixed = [...net.pieces.filter(p => p.id !== 'right'), {id: 'right', x: 4, y: 2, w: 2, h: 3}];
  assert.ok(foldNet(fixed, DIMS).ok);
});

test('같은 상자의 다른 전개도도 인정된다(정답 그림 하나와 비교하지 않음)', () => {
  const alt = unfoldByFolds(DIMS, [edgeId('LBF', 'RBF'), edgeId('LBK', 'RBK'), edgeId('LBF', 'LBK'), edgeId('RBF', 'RBK'), edgeId('RTF', 'RTK')]);
  assert.ok(alt.ok);
  assert.ok(foldNet(alt.pieces, DIMS).ok);
  assert.ok(!sameNet(alt.pieces, crossNet(DIMS).pieces));
});

test('절개안: 접힌 모서리 5개(나무)만 한 장으로 펼쳐진다', () => {
  const E = edgeId;
  const good = [E('LBF', 'RBF'), E('LBK', 'RBK'), E('LBF', 'LBK'), E('RBF', 'RBK'), E('LTF', 'RTF')];
  assert.equal(unfoldByFolds({x: 1, y: 1, z: 1}, good).status, 'ok');
  assert.equal(unfoldByFolds({x: 1, y: 1, z: 1}, [...good, E('RTF', 'RTK')]).status, 'not-flat');
  assert.equal(unfoldByFolds({x: 1, y: 1, z: 1}, good.slice(0, 4)).status, 'disconnected');
  const all = cuboid(1, 1, 1).edges.map(e => e.id);
  assert.equal(unfoldByFolds({x: 1, y: 1, z: 1}, good).cutEdges.length, all.length - 5);
});

test('접힌 뒤 꼭짓점 대응: 경계의 점은 같은 3D 위치의 짝이 있고, 경계 변은 정확히 하나와 만난다', () => {
  const pieces = cells(CUBE_NETS[4]);
  const {tree} = isCubeNet(CUBE_NETS[4]);
  const partners = meetingPoints(pieces, tree, '0,0');
  assert.ok(partners.length >= 1 && partners.length <= 2);
  for (const s of boundarySegments(pieces)) {
    const m = meetingSegments(pieces, tree, s.key);
    assert.equal(m.length, 1, `변 ${s.key}는 정확히 한 변과 만나야 함`);
  }
  // 접은 결과는 8개의 서로 다른 꼭짓점 위치
  const pos = foldPositions(pieces, tree, 1);
  const pts = [];
  for (const corners of Object.values(pos)) for (const c of corners) if (!pts.some(p => samePoint(p, c, 1e-6))) pts.push(c);
  assert.equal(pts.length, 8);
});

test('접기 애니메이션 t=0은 평면, t=1은 상자', () => {
  const pieces = cells(CUBE_NETS[0]);
  const {tree} = isCubeNet(CUBE_NETS[0]);
  const flat = foldPositions(pieces, tree, 0);
  for (const corners of Object.values(flat)) for (const c of corners) assert.ok(Math.abs(c[1]) < 1e-9);
  const box = foldPositions(pieces, tree, 1);
  const ys = new Set();
  for (const corners of Object.values(box)) for (const c of corners) ys.add(Math.round(c[1] * 1000) / 1000);
  assert.deepEqual([...ys].sort(), [0, 1]);
});
