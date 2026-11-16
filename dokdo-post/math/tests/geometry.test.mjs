// 실행: node --test games/box-delivery/public/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {cuboid, viewSets, STANDARD_VIEW, perpendicularFaces, lateralFaces, isParallel, isPerpendicular, faceDims, hiddenEdgeLengthSum, perimeter, facesAtVertex, cuboidFaceShapes, classifySolid, obliqueProject, rotateAboutLine, samePoint} from '../lib/geometry.mjs';

test('직육면체는 면 6·모서리 12·꼭짓점 8', () => {
  const s = cuboid(4, 3, 2);
  assert.equal(s.faces.length, 6); assert.equal(s.edges.length, 12); assert.equal(s.vertices.length, 8);
  for (const f of s.faces) { assert.equal(f.vertices.length, 4); assert.equal(f.edges.length, 4); }
  for (const v of s.vertices) assert.equal(s.edges.filter(e => e.a === v.id || e.b === v.id).length, 3);
});

test('모서리 길이는 방향별로 4,3,2가 각각 4개', () => {
  const s = cuboid(4, 3, 2);
  const byLen = {};
  for (const e of s.edges) byLen[e.length] = (byLen[e.length] || 0) + 1;
  assert.deepEqual(byLen, {4: 4, 3: 4, 2: 4});
});

test('일반 시점: 보이는 면3·모서리9·꼭짓점7, 숨은 꼭짓점은 왼쪽 뒤 아래', () => {
  const s = cuboid(4, 3, 2);
  const v = viewSets(s, STANDARD_VIEW);
  assert.equal(v.visibleFaces.length, 3); assert.equal(v.hiddenFaces.length, 3);
  assert.equal(v.visibleEdges.length, 9); assert.equal(v.hiddenEdges.length, 3);
  assert.equal(v.visibleVertices.length, 7); assert.deepEqual(v.hiddenVertices, ['LBK']);
  assert.deepEqual(v.visibleFaces.sort(), ['front', 'right', 'top']);
});

test('다른 시점(왼쪽 앞 위)에서는 숨은 꼭짓점이 오른쪽 뒤 아래로 바뀐다', () => {
  const v = viewSets(cuboid(4, 3, 2), {x: -1, y: 1, z: 1});
  assert.deepEqual(v.hiddenVertices, ['RBK']);
  assert.equal(v.hiddenEdges.length, 3);
  assert.ok(v.hiddenEdges.every(id => id.includes('RBK')));
});

test('숨은 모서리 세 길이의 합은 4+3+2=9', () => {
  assert.equal(hiddenEdgeLengthSum(cuboid(4, 3, 2)), 9);
});

test('평행·수직 관계: 한 면과 수직인 면 4개, 평행 1개', () => {
  for (const f of ['front', 'back', 'top', 'bottom', 'left', 'right']) {
    assert.equal(perpendicularFaces(f).length, 4);
    assert.ok(!perpendicularFaces(f).includes(f));
  }
  assert.ok(isParallel('front', 'back')); assert.ok(!isPerpendicular('front', 'back')); assert.ok(isPerpendicular('front', 'top'));
  assert.deepEqual(lateralFaces('front', 'back').sort(), ['bottom', 'left', 'right', 'top']);
  assert.deepEqual(lateralFaces('left', 'right').sort(), ['back', 'bottom', 'front', 'top']);
  assert.equal(lateralFaces('front', 'top'), null);
  const both = perpendicularFaces('front').filter(f => perpendicularFaces('bottom').includes(f));
  assert.deepEqual(both.sort(), ['left', 'right']);
});

test('마주 보는 면은 합동: 앞면 4×3의 반대편 둘레 14', () => {
  const d = {x: 4, y: 3, z: 2};
  assert.deepEqual(faceDims(d, 'front'), faceDims(d, 'back'));
  assert.equal(perimeter(faceDims(d, 'back')), 14);
});

test('한 꼭짓점에 모이는 면 3개', () => {
  assert.deepEqual(facesAtVertex('RTK').sort(), ['back', 'right', 'top']);
  assert.deepEqual(facesAtVertex('LBF').sort(), ['bottom', 'front', 'left']);
});

test('정육면체는 직육면체에 포함: 분류가 배타적이지 않다', () => {
  const cube = classifySolid({faceShapes: cuboidFaceShapes({x: 3, y: 3, z: 3})});
  assert.ok(cube.isCuboid && cube.isCube);
  const box = classifySolid({faceShapes: cuboidFaceShapes({x: 4, y: 3, z: 2})});
  assert.ok(box.isCuboid && !box.isCube);
  const twoSquare = classifySolid({faceShapes: cuboidFaceShapes({x: 3, y: 5, z: 3})});
  assert.ok(twoSquare.isCuboid && !twoSquare.isCube, '정사각형 면이 두 개뿐이면 정육면체가 아니다');
  const cyl = classifySolid({faceShapes: ['circle', 'circle', 'curved']});
  assert.ok(!cyl.isCuboid);
});

test('사선 투영에서 앞면은 실제 비율의 직사각형', () => {
  const d = {x: 4, y: 3, z: 2};
  const a = obliqueProject([-2, -1.5, 1], d, STANDARD_VIEW, 10), b = obliqueProject([2, -1.5, 1], d, STANDARD_VIEW, 10), c = obliqueProject([2, 1.5, 1], d, STANDARD_VIEW, 10);
  assert.equal(b[0] - a[0], 40); assert.equal(a[1] - c[1], 30);
});

test('직선 둘레 회전 90도', () => {
  const p = rotateAboutLine([1, 0, 0], [0, 0, 0], [0, 0, 1], Math.PI / 2);
  assert.ok(samePoint(p, [0, 1, 0], 1e-9));
});
