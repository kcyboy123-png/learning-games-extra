// 실행: node --test games/box-delivery-upgrade/public/tests/
// 모든 net-build 단계의 보드 계획 안에 실제 정답 배치가 존재하는지(순수 보드 크기 도우미로) 검사한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTENT, crossNet, DIMS} from '../data/workshops.mjs';
import {planBoard, validPlacements, fitsBoard, FREE_BOARD} from '../lib/board-layout.mjs';
import {unfoldByFolds} from '../lib/net.mjs';
import {edgeId} from '../lib/geometry.mjs';

const netSteps = [];
for (const w of CONTENT.workshops) for (const a of [...w.missions, ...w.reviews]) for (const [i, s] of a.steps.entries()) if (s.kind === 'net-build') netSteps.push({id: `${a.id}#${i}`, s});
for (const [i, s] of CONTENT.final.steps.entries()) if (s.kind === 'net-build') netSteps.push({id: `final#${i}`, s});

test('바탕이 있는 모든 net-build 단계: 보드 안에 들어가는 정답 배치가 1개 이상, 셀 24px 이상', () => {
  for (const {id, s} of netSteps) {
    if (!s.base.length) continue;
    const plan = planBoard(s);
    const placements = validPlacements(s);
    assert.ok(placements.length > 0, `${id}: 정답 배치 없음`);
    const inside = placements.filter(p => fitsBoard([...p.rest, p], plan));
    assert.ok(inside.length > 0, `${id}: 보드(${plan.cols}×${plan.rows}) 안 정답 없음`);
    assert.ok(fitsBoard(s.base, plan), `${id}: 바탕이 보드 밖`);
    assert.ok(plan.cell >= 24, `${id}: 셀 ${plan.cell}px`);
    assert.ok(plan.cols * plan.cell <= 500 && plan.rows * plan.cell <= 380, `${id}: 보드가 500×380 초과`);
    // 단계 check도 같은 답을 받아들인다
    const p = inside[0];
    const answer = {pieces: [...p.rest, {id: 'n', x: p.x, y: p.y, w: p.w, h: p.h}], values: {blank: String(s.blankLength?.answer ?? '')}};
    assert.ok(s.check(answer, {stepAnswers: []}).ok, `${id}: check 거부`);
  }
});

test('몸통(w6-m4 2단계): 빠진 4×3 면을 위에 붙이는 배치가 보드 안에 있다', () => {
  const s = CONTENT.workshops[5].missions[3].steps[1];
  const plan = planBoard(s);
  const above = validPlacements(s).find(p => p.y < 0);
  assert.ok(above, '위쪽 배치 존재');
  assert.ok(fitsBoard([...above.rest, above], plan));
  assert.ok(plan.rows >= 12);
});

test('종합 배송 마지막 단계: 보드가 380px 높이를 넘지 않으면서 오른쪽 면 자리가 들어간다', () => {
  const s = CONTENT.final.steps[4];
  const plan = planBoard(s);
  assert.ok(plan.rows * plan.cell <= 380);
  assert.ok(fitsBoard([...s.base, {x: 5, y: 0, w: 4, h: 2}], plan));
});

test('자유 설계 보드(15×12)에는 십자 전개도와 윗면을 옆면 끝에 붙인 전개도가 모두 들어간다', () => {
  const cross = crossNet(DIMS).pieces;
  const alt = unfoldByFolds(DIMS, [edgeId('LBF', 'RBF'), edgeId('LBK', 'RBK'), edgeId('LBF', 'LBK'), edgeId('RBF', 'RBK'), edgeId('RTF', 'RTK')]).pieces;
  const shift = (pieces, dx, dy) => pieces.map(p => ({...p, x: p.x + dx, y: p.y + dy}));
  const b = pieces => ({x: Math.min(...pieces.map(p => p.x)), y: Math.min(...pieces.map(p => p.y))});
  for (const net of [cross, alt]) {
    const o = b(net);
    assert.ok(fitsBoard(shift(net, -o.x, -o.y), FREE_BOARD), '왼쪽 위에 붙여 놓으면 들어감');
    assert.ok(fitsBoard(shift(net, -o.x + 1, -o.y + 1), FREE_BOARD), '한 칸 여유');
  }
});
