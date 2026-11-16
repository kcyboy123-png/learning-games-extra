// 실행: node --test games/box-delivery/public/tests/
// 콘텐츠의 미션 수와 각 단계의 정답 유효성을 자동 풀이로 검사한다(정답 그림 하나가 아니라 규칙으로 푼다).
import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTENT, crossNet, solidDesc} from '../data/workshops.mjs';
import {cuboid, viewSets, STANDARD_VIEW, perpendicularFaces, lateralFaces, facesAtVertex, parallelPairs, faceDims, classifySolid, FACES} from '../lib/geometry.mjs';
import {foldNet, isCubeNet, meetingPoints, meetingSegments, unfoldByFolds, CUBE_NETS, canonicalKey} from '../lib/net.mjs';
import {edgeId} from '../lib/geometry.mjs';

const allSteps = [];
for (const w of CONTENT.workshops) for (const a of [...w.missions, ...w.reviews]) for (const [i, s] of a.steps.entries()) allSteps.push({a, s, i, w});
for (const [i, s] of CONTENT.final.steps.entries()) allSteps.push({a: CONTENT.final, s, i, w: null});

test('구조: 6작업장 × 4미션 × 3복습 + 종합 5단계', () => {
  assert.equal(CONTENT.workshops.length, 6);
  for (const w of CONTENT.workshops) {
    assert.equal(w.missions.length, 4, w.name); assert.equal(w.reviews.length, 3, w.name);
    assert.ok(w.npc?.greeting && w.npc?.start);
    for (const a of [...w.missions, ...w.reviews]) {
      assert.ok(a.id && a.title && a.situation && a.summary, a.id);
      assert.ok(a.steps.length >= 1);
      for (const s of a.steps) { assert.ok(s.kind && s.instruction && typeof s.check === 'function', `${a.id} step`); assert.ok(s.hint, `${a.id} hint`); }
    }
  }
  assert.equal(CONTENT.final.steps.length, 5);
  const ids = new Set();
  for (const w of CONTENT.workshops) for (const a of [...w.missions, ...w.reviews]) { assert.ok(!ids.has(a.id)); ids.add(a.id); }
  assert.equal(ids.size, 42);
});

test('빈 답은 어떤 단계도 통과하지 못한다', () => {
  for (const {a, s, i} of allSteps) {
    const r = s.check({}, {stepAnswers: []});
    assert.equal(r.ok, false, `${a.id} step ${i} accepted empty answer`);
    assert.ok(typeof r.message === 'string' && r.message.length > 0, `${a.id} step ${i} needs message`);
  }
});

// ---------- 자동 풀이 ----------
function fullEdges(dims, view) {
  const solid = cuboid(dims.x, dims.y, dims.z);
  const sets = viewSets(solid, view);
  const out = {};
  for (const e of solid.edges) out[e.id] = sets.hiddenEdges.includes(e.id) ? 'dashed' : 'solid';
  return out;
}
function bruteNet(step, dims, prevAnswers) {
  // 고정 바탕 + 보관함 조각 하나를 가능한 모든 위치·방향에 놓아 본다
  const base = step.base.map(p => ({...p}));
  const tray = step.tray.flatMap(t => Array.from({length: t.count}, () => ({w: t.w, h: t.h})));
  const isCube = step.net === 'cube';
  const check = pieces => (isCube ? isCubeNet(pieces.map(p => [p.x, p.y])) : foldNet(pieces, dims)).ok;
  if (step.base.length === 6) {
    // 고치기: 조각 하나를 떼어 다른 자리/방향에 놓거나 보관함 조각으로 바꾼다
    for (const victim of base) {
      const rest = base.filter(p => p !== victim);
      const candidates = [{w: victim.w, h: victim.h}, {w: victim.h, h: victim.w}, ...tray, ...tray.map(t => ({w: t.h, h: t.w}))];
      for (const c of candidates) for (let x = -8; x <= 12; x++) for (let y = -8; y <= 12; y++) {
        const pieces = [...rest, {id: 'fix', x, y, w: c.w, h: c.h}];
        if (check(pieces)) return pieces;
      }
    }
    return null;
  }
  if (base.length) {
    for (const t of tray) for (const c of [t, {w: t.h, h: t.w}]) for (let x = -8; x <= 12; x++) for (let y = -8; y <= 12; y++) {
      const pieces = [...base, {id: 'new', x, y, w: c.w, h: c.h}];
      if (check(pieces)) return pieces;
    }
    return null;
  }
  // 자유 설계: 십자 전개도와 다른 전개도
  const prev = prevAnswers?.[0]?.pieces;
  if (isCube) {
    for (const net of CUBE_NETS) {
      const pieces = net.map(([x, y], i) => ({id: `c${i}`, x, y, w: 1, h: 1}));
      if (!prev || canonicalKey(prev) !== canonicalKey(pieces)) return pieces;
    }
  }
  const E = edgeId;
  const options = [
    crossNet(dims).pieces,
    unfoldByFolds(dims, [E('LBF', 'RBF'), E('LBK', 'RBK'), E('LBF', 'LBK'), E('RBF', 'RBK'), E('RTF', 'RTK')]).pieces
  ];
  for (const pieces of options) if (!prev || canonicalKey(prev) !== canonicalKey(pieces)) return pieces;
  return null;
}
function solve(step, prevAnswers) {
  switch (step.kind) {
    case 'peel': { const [a, b] = faceDims(step.dims, 'front'); return {face: 'front', shapes: a === b ? ['rect', 'square'] : ['rect']}; }
    case 'sort': return {selected: step.solids.filter(s => (step.mode === 'mark' ? classifySolid(s).isCube : classifySolid(s).isCuboid)).map(s => s.id)};
    case 'solid': {
      const solid = cuboid(step.dims.x, step.dims.y, step.dims.z);
      if (step.mode === 'pairs') return {pairs: parallelPairs()};
      if (step.mode === 'all') return {faces: FACES.slice(), edges: solid.edges.map(e => e.id), vertices: solid.vertices.map(v => v.id)};
      if (step.mode === 'edges') return {edges: solid.edges.map(e => e.id), diagonals: []};
      if (step.mode === 'vertices') return {vertices: solid.vertices.map(v => v.id)};
      if (step.markVertex) return {faces: facesAtVertex(step.markVertex)};
      if (step.basePair) return {faces: lateralFaces(...step.basePair)};
      if (step.baseFace && step.secondFace) return {faces: perpendicularFaces(step.baseFace).filter(f => perpendicularFaces(step.secondFace).includes(f))};
      if (step.baseFace && step.count === 1) return {faces: [FACES.find(f => f !== step.baseFace && !perpendicularFaces(step.baseFace).includes(f))]};
      if (step.baseFace) return {faces: perpendicularFaces(step.baseFace)};
      return {faces: FACES.slice()};
    }
    case 'choice': return {selected: step.answer.slice()};
    case 'fill': { const values = {}; for (const f of step.fields || []) values[f.id] = f.answer; for (const s of step.selects || []) values[s.id] = s.answer; return {values}; }
    case 'sketch': return {edges: fullEdges(step.dims, step.view || STANDARD_VIEW)};
    case 'cut-plan': return {selected: step.plans.find(p => unfoldByFolds({x: 1, y: 1, z: 1}, p.folds).ok).id};
    case 'net-predict': return {predict: isCubeNet(step.candidate.cells).ok};
    case 'net-build': { const pieces = bruteNet(step, step.dims, prevAnswers); return {pieces, values: {blank: String(step.blankLength?.answer ?? '')}}; }
    case 'net-points': return {selected: step.ask === 'point' ? meetingPoints(step.pieces, step.tree, step.from) : meetingSegments(step.pieces, step.tree, step.from)};
    case 'tray-count': { const d = step.dims; const counts = {}; for (const t of step.tray) counts[`${Math.max(t.w, t.h)}x${Math.min(t.w, t.h)}`] = 0; for (const [a, b] of [[d.x, d.y], [d.x, d.z], [d.y, d.z]]) counts[`${Math.max(a, b)}x${Math.min(a, b)}`] = 2; return {counts}; }
    case 'link': return {links: JSON.parse(JSON.stringify(step.answer))};
    default: throw Error('no solver for ' + step.kind);
  }
}

test('모든 단계는 규칙으로 만든 정답을 통과한다(정답 유효성)', () => {
  const groups = new Map();
  for (const item of allSteps) { if (!groups.has(item.a.id)) groups.set(item.a.id, []); groups.get(item.a.id).push(item); }
  for (const [id, items] of groups) {
    const stepAnswers = [];
    for (const {s, i} of items) {
      const answer = solve(s, stepAnswers);
      assert.ok(answer, `${id} step ${i}: solver found no answer`);
      const r = s.check(answer, {stepAnswers});
      assert.ok(r.ok, `${id} step ${i} (${s.kind}) rejected valid answer: ${r.message}`);
      stepAnswers.push(answer);
    }
  }
});

test('분류대: 정육면체도 직육면체로 골라야 통과, 빠뜨리면 안내한다', () => {
  const step = CONTENT.workshops[0].missions[1].steps[0];
  const onlyBox = step.check({selected: ['box']});
  assert.ok(!onlyBox.ok && onlyBox.message.includes('정육면체'));
  const withCyl = step.check({selected: ['box', 'cube', 'cyl']});
  assert.ok(!withCyl.ok && withCyl.reveal?.solid === 'cyl');
});

test('검사대: 대각선을 모서리로 세면 틀리고, 중복 선택은 수에 들어가지 않는다', () => {
  const step = CONTENT.workshops[1].missions[1].steps[0];
  const edges = cuboid(4, 3, 2).edges.map(e => e.id);
  assert.ok(!step.check({edges, diagonals: ['diag-front']}).ok);
  assert.ok(!step.check({edges: [...edges.slice(0, 11), edges[0]]}).ok);
  assert.ok(step.check({edges: [...edges, edges[0]]}).ok);
});

test('설계대: 틀린 선만 표시하고 모서리가 아닌 선은 거부한다', () => {
  const step = CONTENT.workshops[2].missions[3].steps[0];
  const good = fullEdges({x: 4, y: 3, z: 2}, STANDARD_VIEW);
  assert.ok(step.check({edges: good}).ok);
  const bad = {...good, [edgeId('LBK', 'RBK')]: 'solid'};
  const r = step.check({edges: bad});
  assert.ok(!r.ok); assert.deepEqual(r.wrong, [edgeId('LBK', 'RBK')]);
  const draw = CONTENT.workshops[2].missions[2].steps[0];
  const r2 = draw.check({edges: {...fullEdges({x: 3, y: 3, z: 3}, STANDARD_VIEW), 'LBF-RTF': 'solid'}});
  assert.ok(!r2.ok && r2.wrong.includes('LBF-RTF'));
});

test('고정대: 이웃한 면을 짝지으면 거부, 평행한 세 쌍은 통과', () => {
  const step = CONTENT.workshops[3].missions[0].steps[0];
  assert.ok(!step.check({pairs: [['front', 'top']]}).ok);
  assert.ok(!step.check({pairs: [['front', 'back'], ['top', 'bottom']]}).ok);
  assert.ok(step.check({pairs: [['back', 'front'], ['left', 'right'], ['bottom', 'top']]}).ok);
});

test('정육면체 포장대: 5면에 한 면 더하기는 여러 정답을 인정하고 겹치는 자리는 거부한다', () => {
  const step = CONTENT.workshops[4].missions[2].steps[0];
  const base = step.base;
  const mk = (x, y) => ({pieces: [...base, {id: 'n', x, y, w: 1, h: 1}]});
  let okCount = 0;
  for (const [x, y] of [[0, 1], [1, 1], [2, 1], [3, 1]]) if (step.check(mk(x, y), {stepAnswers: []}).ok) okCount++;
  assert.equal(okCount, 4, '아래쪽 네 자리 모두 정답');
  assert.ok(!step.check(mk(2, -1), {stepAnswers: []}).ok, '같은 쪽에 두 개면 겹침');
  assert.ok(!step.check(mk(4, 0), {stepAnswers: []}).ok, '한 줄 다섯 개는 겹침');
  const second = CONTENT.workshops[4].missions[2].steps[1];
  const first = mk(0, 1);
  const rotatedSame = {pieces: first.pieces.map(p => ({...p, x: -p.y, y: p.x}))};
  assert.ok(!second.check(rotatedSame, {stepAnswers: [first]}).ok, '돌린 같은 모양은 새 모양이 아님');
});

test('맞춤 포장대: 필요한 직사각형은 세 종류 2장씩', () => {
  const step = CONTENT.workshops[5].missions[0].steps[0];
  assert.ok(step.check({counts: {'4x3': 2, '4x2': 2, '3x2': 2}}).ok);
  assert.ok(!step.check({counts: {'4x3': 2, '4x2': 2, '3x2': 1}}).ok);
  assert.ok(!step.check({counts: {'4x3': 2, '4x2': 2, '3x2': 2, '4x4': 1}}).ok);
});

test('종합 배송: 전개도 마지막 면은 돌려 붙인 다른 자리도 인정', () => {
  const step = CONTENT.final.steps[4];
  const base = step.base;
  const r1 = step.check({pieces: [...base, {id: 'n', x: 5, y: 0, w: 4, h: 2}], values: {blank: '4'}}, {stepAnswers: []});
  assert.ok(r1.ok, r1.message);
  const r2 = step.check({pieces: [...base, {id: 'n', x: 5, y: 2, w: 2, h: 4}], values: {blank: '4'}}, {stepAnswers: []});
  assert.ok(r2.ok, '앞면 오른쪽에 2×4로 붙여도 유효: ' + r2.message);
  const r3 = step.check({pieces: [...base, {id: 'n', x: 5, y: 0, w: 4, h: 2}], values: {blank: '5'}}, {stepAnswers: []});
  assert.ok(!r3.ok && r3.wrong.includes('blank'));
});

test('입체 설명 도우미', () => {
  assert.ok(classifySolid(solidDesc('a', 'cube', {size: 2})).isCube);
  assert.ok(!classifySolid(solidDesc('b', 'pyramid')).isCuboid);
});
