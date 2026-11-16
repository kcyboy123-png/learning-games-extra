// 실행: node --test games/box-delivery/public/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgress, loadSaved, saveProgress, SAVE_KEY, answerSignature} from '../lib/progress.mjs';
import {CONTENT} from '../data/workshops.mjs';

function fakeStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return {getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), map: m};
}

test('활동 수: 핵심 24 + 복습 18 + 종합 1 = 43, 최대 1430점', () => {
  const p = createProgress(CONTENT);
  assert.equal(p.activities.length, 43);
  assert.equal(p.activities.filter(a => a.kind === 'mission').length, 24);
  assert.equal(p.activities.filter(a => a.kind === 'review').length, 18);
  assert.equal(p.activities.filter(a => a.kind === 'final').length, 1);
  assert.equal(p.maxScore(), 1430);
  assert.equal(p.score(), 1000);
});

test('성공은 현재 활동만, 같은 이벤트 id는 한 번만, 다음 활동으로 넘어간다', () => {
  const p = createProgress(CONTENT);
  const first = p.current();
  assert.equal(first.id, 'w1-m1');
  assert.equal(p.success('w1-m2', 'e1').accepted, false, '순서 밖 활동은 거부');
  assert.equal(p.success('w1-m1', 'e1').accepted, true);
  assert.equal(p.success('w1-m1', 'e1').accepted, false, '중복 이벤트');
  assert.equal(p.success('w1-m1', 'e2').accepted, false, '이미 완료');
  assert.equal(p.score(), 1010);
  assert.equal(p.current().id, 'w1-m2');
});

test('오답 -10, 같은 오답 반복은 추가 감점 없음, 힌트는 활동당 한 번 -3', () => {
  const p = createProgress(CONTENT);
  p.wrong('w1-m1', 'w1', 'A'); assert.equal(p.score(), 990);
  p.wrong('w1-m1', 'w2', 'A'); assert.equal(p.score(), 990, '같은 오답 반복');
  p.wrong('w1-m1', 'w3', 'B'); assert.equal(p.score(), 980);
  assert.equal(p.wrongCount('w1-m1'), 3);
  assert.deepEqual(p.hint('w1-m1', 'h1'), {accepted: true, charged: true, score: 977});
  assert.equal(p.hint('w1-m1', 'h2').charged, false);
  assert.equal(p.score(), 977);
  assert.equal(p.hint('w1-m2', 'h3').accepted, false, '현재 활동이 아닌 힌트');
});

test('작업장 도장은 미션 4개와 복습 3문항을 모두 끝내야 찍힌다', () => {
  const p = createProgress(CONTENT);
  for (const id of ['w1-m1', 'w1-m2', 'w1-m3', 'w1-m4']) p.success(id, 'e-' + id);
  assert.equal(p.stamps(), 0);
  assert.equal(p.stage().type, 'review');
  for (const id of ['w1-r1', 'w1-r2', 'w1-r3']) p.success(id, 'e-' + id);
  assert.equal(p.stamps(), 1);
  assert.equal(p.stage().workshop, 1);
});

test('전체 완료 시 종합 배송 후 엔딩, 점수 최대 1430', () => {
  const p = createProgress(CONTENT);
  for (const a of p.activities) p.success(a.id, 'e-' + a.id);
  assert.equal(p.stage().type, 'ending');
  assert.equal(p.score(), 1430);
  assert.equal(p.stamps(), 6);
  assert.equal(p.title(), '믿음직한 배송 기사');
});

test('저장·복원: 이벤트 재적용으로 같은 상태', () => {
  const p = createProgress(CONTENT);
  p.wrong('w1-m1', 'x1', 'A'); p.hint('w1-m1', 'h1'); p.success('w1-m1', 's1'); p.success('w1-m2', 's2');
  p.setExtra('player', {x: 1, y: 2});
  const st = fakeStorage();
  assert.ok(saveProgress(st, p));
  const loaded = loadSaved(st);
  assert.ok(!loaded.corrupted);
  const q = createProgress(CONTENT, loaded.data);
  assert.equal(q.score(), p.score());
  assert.equal(q.current().id, 'w1-m3');
  assert.deepEqual(q.getExtra('player'), {x: 1, y: 2});
  assert.equal(q.wrongCount('w1-m1'), 1);
  assert.ok(q.hinted('w1-m1'));
});

test('손상된 저장 데이터는 corrupted로 알리고 처음부터 시작한다', () => {
  const st = fakeStorage({[SAVE_KEY]: '{not json'});
  const l = loadSaved(st);
  assert.ok(l.corrupted && l.data === null);
  const st2 = fakeStorage({[SAVE_KEY]: JSON.stringify({version: 9, events: []})});
  assert.ok(loadSaved(st2).corrupted);
  assert.ok(createProgress(CONTENT, null).current().id === 'w1-m1');
});

test('조작된 이벤트(순서를 건너뛴 성공)는 뒤 미션을 열지 못한다', () => {
  const data = {version: 1, gameId: 'box-delivery', events: [{id: 'a', kind: 'success', activity: 'w6-m4', points: 10}], extra: {}};
  const q = createProgress(CONTENT, data);
  assert.equal(q.current().id, 'w1-m1');
  assert.equal(q.score(), 1000);
});

test('오답 서명은 조각 id·순서를 무시하고 배치·치수·입력값으로만 만든다(같은 오답 재제출 무감점)', () => {
  const a = {pieces: [{id: 't1', x: 0, y: 0, w: 4, h: 2}, {id: 't2', x: 4, y: 0, w: 3, h: 2, fromTray: true}], values: {blank: '2'}};
  const b = {pieces: [{id: 't9', x: 4, y: 0, w: 3, h: 2}, {id: 'bottom', x: 0, y: 0, w: 4, h: 2}], values: {blank: '2'}};
  assert.equal(answerSignature(a), answerSignature(b));
  assert.notEqual(answerSignature(a), answerSignature({...a, pieces: [a.pieces[0], {...a.pieces[1], x: 5}]}));
  assert.notEqual(answerSignature(a), answerSignature({...a, values: {blank: '3'}}));
  assert.equal(answerSignature({faces: ['top', 'front']}), answerSignature({faces: ['front', 'top']}));
  assert.equal(answerSignature({pairs: [['front', 'back'], ['top', 'bottom']]}), answerSignature({pairs: [['bottom', 'top'], ['back', 'front']]}));
  const p = createProgress(CONTENT);
  p.wrong('w1-m1', 'x1', answerSignature(a)); p.wrong('w1-m1', 'x2', answerSignature(b));
  assert.equal(p.score(), 990, '같은 배치는 한 번만 감점');
});

test('저장 실패는 false로 알린다', () => {
  const p = createProgress(CONTENT);
  assert.equal(saveProgress({setItem() { throw Error('quota'); }}, p), false);
  assert.equal(saveProgress(null, p), false);
});
