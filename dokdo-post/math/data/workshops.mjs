// 단원 전체 콘텐츠: 6작업장 × 핵심 4미션 + 작업장별 복습 3문항 + 종합 배송 1건.
// 각 단계(step)는 kind(조작 종류)·params·check(answer, ctx)로 이루어진다. check는 화면과 무관하게 순수하게 판정한다.
import {cuboid, edgeId, viewSets, STANDARD_VIEW, perpendicularFaces, lateralFaces, isParallel, OPPOSITE, FACES, FACE_LABEL,
  faceDims, facesAtVertex, cuboidFaceShapes, classifySolid, hiddenEdgeLengthSum, perimeter} from '../lib/geometry.mjs';
import {foldNet, isCubeNet, canonicalKey, unfoldByFolds, meetingPoints, meetingSegments, CUBE_NETS, NOT_CUBE_NETS, DIRECTION_LABEL} from '../lib/net.mjs';

export const DIMS = {x: 4, y: 3, z: 2};
const D = (x, y, z) => ({x, y, z});
const E = edgeId;
const setEq = (a, b) => a.length === b.length && a.every(v => b.includes(v));
const ok = (message = '') => ({ok: true, message});
const no = (message, wrong = [], detail = {}) => ({ok: false, message, wrong, ...detail});
const label = f => FACE_LABEL[f];

// ---------- 입체 설명(분류대) ----------
export function solidDesc(id, kind, opts = {}) {
  const base = {id, kind, ...opts};
  if (kind === 'cuboid' || kind === 'cube') {
    const dims = kind === 'cube' ? D(opts.size, opts.size, opts.size) : D(...opts.dims);
    return {...base, dims, faceShapes: cuboidFaceShapes(dims), name: opts.name || (kind === 'cube' ? '정육면체 상자' : '직육면체 상자')};
  }
  const shapes = {
    cylinder: ['circle', 'circle', 'curved'], 'tri-prism': ['tri', 'tri', 'rect', 'rect', 'rect'],
    oblique: ['para', 'para', 'para', 'para', 'rect', 'rect'], 'hex-prism': ['hex', 'hex', 'rect', 'rect', 'rect', 'rect', 'rect', 'rect'],
    pyramid: ['square', 'tri', 'tri', 'tri', 'tri']
  }[kind];
  const names = {cylinder: '원기둥 통', 'tri-prism': '삼각기둥 상자', oblique: '비스듬한 상자', 'hex-prism': '육각기둥 상자', pyramid: '사각뿔 상자'};
  return {...base, faceShapes: shapes, name: opts.name || names[kind]};
}
const SHAPE_LABEL = {circle: '원', curved: '굽은 면', tri: '삼각형', para: '평행사변형', hex: '육각형', square: '정사각형', rect: '직사각형'};

function checkSort(solids, predicate, answer, wording) {
  const selected = answer?.selected || [];
  const correct = solids.filter(predicate).map(s => s.id);
  const extra = selected.filter(id => !correct.includes(id));
  const missing = correct.filter(id => !selected.includes(id));
  if (!extra.length && !missing.length) return ok();
  if (extra.length) {
    const s = solids.find(x => x.id === extra[0]);
    const bad = classifySolid(s).nonRect[0];
    const why = bad !== undefined ? `${s.name}의 면을 펼치면 ${SHAPE_LABEL[s.faceShapes[bad]]}이 있어요.` : `${s.name}은 ${wording.extra}`;
    return no(why, extra, {reveal: {solid: s.id, face: bad}});
  }
  return no(wording.missing, [], {missing});
}

// ---------- 겨냥도 도우미 ----------
function sketchTruth(dims, view = STANDARD_VIEW) {
  const solid = cuboid(dims.x, dims.y, dims.z);
  const sets = viewSets(solid, view);
  const truth = {};
  for (const e of solid.edges) truth[e.id] = sets.hiddenEdges.includes(e.id) ? 'dashed' : 'solid';
  return {solid, sets, truth};
}
function checkSketchTypes(dims, view, answer, {only} = {}) {
  const {truth} = sketchTruth(dims, view);
  const edges = answer?.edges || {};
  const ids = only || Object.keys(truth);
  const wrong = ids.filter(id => edges[id] !== truth[id]);
  const extra = Object.keys(edges).filter(id => !truth[id]);
  if (extra.length) return no('꼭짓점과 꼭짓점을 잇는 모서리가 아닌 선이 있어요. 면 안쪽의 대각선은 모서리가 아니에요.', extra);
  if (!wrong.length) return ok();
  const missing = ids.filter(id => !edges[id]);
  if (missing.length) return no(`아직 긋지 않은 모서리가 ${missing.length}개 있어요.`, missing);
  const hidden = wrong.filter(id => truth[id] === 'dashed');
  return no(hidden.length ? '가려진 모서리는 점선으로 그려요. 표시된 선만 고쳐요.' : '보이는 모서리는 실선으로 그려요. 표시된 선만 고쳐요.', wrong);
}

// ---------- 전개도 도우미 ----------
function netMessage(result, dims, labelOf = id => id) {
  const e = result.errors[0];
  if (!e) return result.missing.length ? `${result.missing.map(m => DIRECTION_LABEL[m]).join('·')} 쪽 면이 비어요.` : '';
  if (e.type === 'count') return `면이 ${e.detail}개예요. 직육면체는 면 6개가 필요해요.`;
  if (e.type === 'overlap2d') return '조각이 모눈에서 서로 겹쳐 있어요.';
  if (e.type === 'edge-length') return `${labelOf(e.pieces[0])}과 ${labelOf(e.pieces[1])}이 닿은 모서리의 길이가 서로 달라서 이어지지 않아요.`;
  if (e.type === 'disconnected') return '조각이 한 덩어리로 이어져 있지 않아요. 변 전체가 맞닿게 붙여요.';
  if (e.type === 'overlap') return `접으면 ${labelOf(e.pieces[0])}과 ${labelOf(e.pieces[1])}이 같은 자리(${DIRECTION_LABEL[e.detail]} 면)에 겹쳐요${result.missing.length ? `. ${result.missing.map(m => DIRECTION_LABEL[m]).join('·')} 면은 비어요` : ''}.`;
  if (e.type === 'size') return `${labelOf(e.pieces[0])}은 ${e.detail.need[0]}×${e.detail.need[1]}cm여야 하는데 ${e.detail.got[0]}×${e.detail.got[1]}cm예요. 접해서 만나는 모서리의 길이를 비교해요.`;
  return '전개도가 아직 맞지 않아요.';
}
function cells(list) { return list.map(([x, y], i) => ({id: `c${i}`, x, y, w: 1, h: 1})); }
function checkCubeNet(answer, ctx, {mustDiffer} = {}) {
  const pieces = answer?.pieces || [];
  const result = isCubeNet(pieces.map(p => [p.x, p.y]));
  if (!result.ok) return no(netMessage(result, null, id => '정사각형'), result.errors.flatMap(e => e.pieces), {fold: true});
  if (mustDiffer !== undefined) {
    const prev = ctx?.stepAnswers?.[mustDiffer]?.pieces;
    if (prev && canonicalKey(prev) === canonicalKey(pieces)) return no('접을 수는 있지만 앞에서 만든 모양을 돌리거나 뒤집은 같은 모양이에요. 다른 모양을 만들어요.', []);
  }
  return ok();
}
function checkRectNet(dims, answer, ctx, {mustDiffer, pieceLabel} = {}) {
  const pieces = answer?.pieces || [];
  const result = foldNet(pieces, dims);
  const nameOf = id => { const p = pieces.find(x => x.id === id); return p ? `${p.w}×${p.h} 조각` : id; };
  if (!result.ok) return no(netMessage(result, dims, pieceLabel || nameOf), result.errors.flatMap(e => e.pieces), {fold: true});
  if (mustDiffer !== undefined) {
    const prev = ctx?.stepAnswers?.[mustDiffer]?.pieces;
    if (prev && canonicalKey(prev) === canonicalKey(pieces)) return no('접을 수는 있지만 앞에서 만든 전개도와 같은 모양이에요. 다른 모양을 설계해요.', []);
  }
  return ok();
}
function checkFill(fields, answer) {
  const values = answer?.values || {};
  const wrong = fields.filter(f => String(values[f.id] ?? '').trim() !== String(f.answer)).map(f => f.id);
  if (!wrong.length) return ok();
  const f = fields.find(x => x.id === wrong[0]);
  return no(f.wrongMessage || '값을 다시 확인해요. 표시된 칸만 고쳐요.', wrong);
}
function checkChoice(answerIds, answer, {multi = false, wrongMessage} = {}) {
  const selected = answer?.selected || [];
  if (setEq(selected, answerIds)) return ok();
  const extra = selected.filter(id => !answerIds.includes(id));
  if (multi && !extra.length && selected.length) return no('맞는 것이 더 있어요. "모두" 고르는 문제예요.', []);
  return no(wrongMessage || '다시 살펴봐요.', extra);
}

// 직육면체 4×3×2 전개도 표준 십자 모양(4×3 아랫면 기준). dims {x:4,y:3,z:2}: 아랫면 4×2, 앞면 4×3, 옆면 3×2
export function crossNet(dims) {
  const solid = cuboid(dims.x, dims.y, dims.z);
  const folds = [E('LBF', 'RBF'), E('LBK', 'RBK'), E('LBF', 'LBK'), E('RBF', 'RBK'), E('LTF', 'RTF')];
  return unfoldByFolds(dims, folds);
}

// ---------- 작업장 1 분류대 ----------
const W1_SORT_SOLIDS = [
  solidDesc('cyl', 'cylinder'), solidDesc('tri', 'tri-prism'), solidDesc('obl', 'oblique'),
  solidDesc('box', 'cuboid', {dims: [4, 3, 2]}), solidDesc('cube', 'cube', {size: 2})
];
const W1_MARK_SOLIDS = [
  solidDesc('b432', 'cuboid', {dims: [4, 3, 2], name: '4×3×2 상자'}), solidDesc('c222', 'cube', {size: 2, name: '2×2×2 상자'}),
  solidDesc('b335', 'cuboid', {dims: [3, 5, 3], name: '3×5×3 상자'}), solidDesc('c333', 'cube', {size: 3, name: '3×3×3 상자'})
];
const W1_TURN_SOLIDS = [
  solidDesc('tissue', 'cuboid', {dims: [5, 2, 3], name: '휴지 상자', tilt: [0.9, 0.5]}),
  solidDesc('gift', 'cube', {size: 3, name: '선물 상자', tilt: [0.7, 0.9]}),
  solidDesc('tent', 'tri-prism', {name: '텐트 모양 상자', tilt: [1.2, 0.4]})
];
const W1_REVIEW_SOLIDS = [
  solidDesc('hex', 'hex-prism'), solidDesc('long', 'cuboid', {dims: [5, 2, 2], tilt: [1.1, 0.6]}),
  solidDesc('dice', 'cube', {size: 4, tilt: [0.6, 0.8]}), solidDesc('pyr', 'pyramid')
];
const W1_REVIEW_MARK = [
  solidDesc('q444', 'cube', {size: 4, name: '4×4×4 상자'}), solidDesc('q226', 'cuboid', {dims: [2, 2, 6], name: '2×2×6 상자'}),
  solidDesc('q111', 'cube', {size: 1, name: '1×1×1 상자'}), solidDesc('q343', 'cuboid', {dims: [3, 4, 3], name: '3×4×3 상자'})
];

const workshop1 = {
  id: 'w1', name: '분류대', subtitle: '어떤 상자를 보낼까?', learning: '직육면체·정육면체의 정의와 포함 관계',
  npc: {name: '분류원', greeting: '어서 와! 상자 모양표가 뒤섞여서 어떤 상자를 보낼지 모르겠어. 면부터 같이 살펴보자.', start: '첫 상자 살펴보기'},
  missions: [
    {id: 'w1-m1', title: '면부터 살펴보기', situation: '상자를 돌려 보고 한 면을 떼어 모양을 확인해요.',
      steps: [
        {kind: 'peel', dims: D(4, 3, 2), instruction: '면 하나를 눌러 떼어 낸 뒤, 그 면의 모양을 모두 표시해요.', moa: '네 각이 모두 직각인지, 변의 길이는 어떤지 봐요.',
          hint: '네 각이 모두 직각이면 직사각형이에요. 네 변의 길이까지 모두 같으면 정사각형이에요.',
          check(answer) {
            if (!answer?.face) return no('먼저 면 하나를 눌러 떼어 내요.');
            const [a, b] = faceDims(D(4, 3, 2), answer.face);
            const want = a === b ? ['rect', 'square'] : ['rect'];
            const got = answer.shapes || [];
            if (setEq(want, got)) return ok();
            if (got.includes('square') && a !== b) return no(`이 면은 ${a}cm와 ${b}cm로 변의 길이가 달라요. 네 각이 직각이니 직사각형이에요.`, ['square']);
            return no('네 각이 모두 직각이에요. 직사각형 표시를 확인해요.', ['rect']);
          }},
        {kind: 'peel', dims: D(3, 3, 3), instruction: '이번에는 정육면체 상자예요. 면 하나를 떼어 모양을 모두 표시해요.', moa: '정사각형이면 직사각형이기도 할까요?',
          hint: '정사각형은 네 각이 직각이고 네 변이 모두 같아요. 네 각이 직각이므로 직사각형이기도 해요.',
          check(answer) {
            if (!answer?.face) return no('먼저 면 하나를 눌러 떼어 내요.');
            const got = answer.shapes || [];
            if (setEq(['rect', 'square'], got)) return ok();
            if (got.includes('square') && !got.includes('rect')) return no('정사각형도 네 각이 직각이라 직사각형이에요. 둘 다 표시해요.', ['rect']);
            return no('네 변이 모두 3cm로 같아요. 정사각형 표시도 확인해요.', ['square']);
          }}
      ],
      summary: '직사각형은 네 각이 모두 직각인 사각형이고, 정사각형은 그중 네 변의 길이도 같은 특별한 직사각형이에요.'},
    {id: 'w1-m2', title: '배송 상자 고르기', situation: '여러 물체 중 직육면체인 것만 배송대에 올려요.',
      steps: [{kind: 'sort', solids: W1_SORT_SOLIDS, instruction: '물체를 돌려 보고 직육면체인 것을 모두 골라 배송대에 올려요.', moa: '직사각형 6개로 둘러싸였는지 봐요.',
        hint: '직육면체는 직사각형 6개로 둘러싸인 입체도형이에요. 정육면체도 직사각형(정사각형) 6개로 둘러싸였어요.',
        check: answer => checkSort(W1_SORT_SOLIDS, s => classifySolid(s).isCuboid, answer, {extra: '직사각형 6개로 둘러싸이지 않았어요.', missing: '직사각형 6개로 둘러싸인 물체가 더 있어요. 정육면체도 직육면체예요.'})}],
      summary: '직사각형 6개로 둘러싸인 입체도형을 직육면체라고 해요. 둥근 면이나 삼각형 면이 있으면 직육면체가 아니에요.'},
    {id: 'w1-m3', title: '특별 표시 붙이기', situation: '배송대의 직육면체 중 정육면체에는 특별 표시를 덧붙여요.',
      steps: [{kind: 'sort', solids: W1_MARK_SOLIDS, mode: 'mark', instruction: '모든 면이 정사각형인 상자에 정육면체 표시를 붙여요. 직육면체 표시는 그대로 두어요.', moa: '한 면만 정사각형이면 될까요? 돌려서 다른 면도 봐요.',
        hint: '정육면체는 정사각형 6개로 둘러싸인 직육면체예요. 모든 면을 돌려 가며 확인해요.',
        check: answer => checkSort(W1_MARK_SOLIDS, s => classifySolid(s).isCube, answer, {extra: '정사각형이 아닌 면이 있어요. 돌려서 다른 면을 봐요.', missing: '모든 면이 정사각형인 상자가 더 있어요.'})}],
      summary: '정육면체는 정사각형 6개로 둘러싸인 입체도형이에요. 정사각형도 직사각형이므로 정육면체는 직육면체이기도 해요.'},
    {id: 'w1-m4', title: '방향을 바꿔도 같은 상자', situation: '비스듬히 놓인 생활 속 상자를 분류하고 공통점과 차이점을 정리해요.',
      steps: [
        {kind: 'sort', solids: W1_TURN_SOLIDS, instruction: '비스듬히 놓인 상자를 돌려 보고 직육면체인 것을 모두 골라요.', moa: '색이나 놓인 방향은 상관없어요. 면의 모양만 봐요.',
          hint: '상자를 원래 방향으로 천천히 돌린 뒤 면이 모두 직사각형인지 봐요.',
          check: answer => checkSort(W1_TURN_SOLIDS, s => classifySolid(s).isCuboid, answer, {extra: '면 중에 직사각형이 아닌 것이 있어요.', missing: '놓인 방향이 달라도 면이 모두 직사각형이면 직육면체예요.'})},
        {kind: 'fill', instruction: '직육면체와 정육면체의 공통점과 차이점을 완성해요.', moa: '두 상자의 면 모양을 떠올려요.',
          hint: '둘 다 면이 6개이고 모두 직사각형이에요. 정육면체는 그 면이 모두 정사각형이에요.',
          selects: [
            {id: 's1', label: '공통점: 둘 다 면이 ___개예요.', options: ['4', '6', '8', '12'], answer: '6'},
            {id: 's2', label: '공통점: 모든 면이 ___이에요.', options: ['삼각형', '직사각형', '원'], answer: '직사각형'},
            {id: 's3', label: '차이점: 정육면체는 모든 면이 ___이에요.', options: ['정사각형', '직사각형이 아님', '길쭉한 직사각형'], answer: '정사각형'}
          ],
          check(answer) { return checkFill([{id: 's1', answer: '6'}, {id: 's2', answer: '직사각형'}, {id: 's3', answer: '정사각형'}].map(f => ({...f, wrongMessage: '표시된 빈칸을 다시 골라요.'})), answer); }}
      ],
      summary: '놓인 방향·색·크기가 달라도 면의 모양으로 분류해요. 직육면체와 정육면체는 면이 6개이고, 정육면체는 모든 면이 정사각형이에요.'}
  ],
  reviews: [
    {id: 'w1-r1', title: '복습 1 · 새 입체 분류', situation: '새로운 물체 중 직육면체를 모두 찾아요.',
      steps: [{kind: 'sort', solids: W1_REVIEW_SOLIDS, instruction: '직육면체인 것을 모두 골라요.', moa: '모두 고르는 문제예요.', hint: '면이 모두 직사각형인지 돌려 보며 확인해요.',
        check: answer => checkSort(W1_REVIEW_SOLIDS, s => classifySolid(s).isCuboid, answer, {extra: '직사각형이 아닌 면이 있어요.', missing: '직육면체가 더 있어요. 정육면체도 직육면체예요.'})}],
      summary: '직육면체는 직사각형 6개로 둘러싸인 입체도형이에요.'},
    {id: 'w1-r2', title: '복습 2 · 모든 면이 정사각형', situation: '모든 면이 정사각형인 상자를 모두 찾아요.',
      steps: [{kind: 'sort', solids: W1_REVIEW_MARK, mode: 'mark', instruction: '모든 면이 정사각형인 상자를 모두 골라요.', moa: '크기는 달라도 돼요.', hint: '세 길이가 모두 같은 상자를 찾아요.',
        check: answer => checkSort(W1_REVIEW_MARK, s => classifySolid(s).isCube, answer, {extra: '정사각형이 아닌 면이 있어요.', missing: '모든 면이 정사각형인 상자가 더 있어요. 작은 상자도 봐요.'})}],
      summary: '정육면체는 크기와 관계없이 모든 면이 정사각형인 직육면체예요.'},
    {id: 'w1-r3', title: '복습 3 · 틀린 말 고치기', situation: '"정육면체는 직육면체가 아니다"라는 말을 바르게 고쳐요.',
      steps: [{kind: 'choice', instruction: '바르게 고친 문장을 골라요.', moa: '정사각형은 직사각형일까요?', hint: '정사각형은 네 각이 직각이라 직사각형에 포함돼요.',
        options: [
          {id: 'a', text: '정육면체는 모든 면이 정사각형인 특별한 직육면체예요.'},
          {id: 'b', text: '직육면체는 모두 정육면체예요.'},
          {id: 'c', text: '정육면체는 면이 8개라서 직육면체가 아니에요.'},
          {id: 'd', text: '정육면체와 직육면체는 면의 수가 달라요.'}
        ], answer: ['a'],
        check: answer => checkChoice(['a'], answer, {wrongMessage: '직육면체와 정육면체는 모두 면이 6개예요. 정사각형도 직사각형이에요.'})}],
      summary: '정육면체는 직육면체에 포함돼요. 직육면체 중 모든 면이 정사각형인 것이 정육면체예요.'}
  ]
};

// ---------- 작업장 2 검사대 ----------
function checkParts(solid, answer, kind, needed, msgs) {
  const sel = answer?.[kind] || [];
  const diag = answer?.diagonals || [];
  const others = ['faces', 'edges', 'vertices'].filter(k => k !== kind).flatMap(k => answer?.[k] || []);
  if (diag.length) return no('면 안쪽의 대각선은 모서리가 아니에요. 모서리는 면과 면이 만나는 선분이에요.', diag);
  if (others.length) return no(msgs.other, others);
  const unique = [...new Set(sel)];
  if (unique.length === needed) return ok();
  return no(msgs.missing(needed - unique.length), []);
}
const BOX = cuboid(4, 3, 2);
const CUBE3 = cuboid(3, 3, 3);
const workshop2 = {
  id: 'w2', name: '검사대', subtitle: '보호대를 빠짐없이 붙여 줘!', learning: '면 6개·모서리 12개·꼭짓점 8개와 공통점',
  npc: {name: '검사원', greeting: '도착했구나! 상자의 면, 모서리, 꼭짓점을 함께 살펴보자.', start: '상자 검사 시작'},
  missions: [
    {id: 'w2-m1', title: '면 검사 도장', situation: '상자의 서로 다른 면 6개에 모두 검사 도장을 찍어요.',
      steps: [{kind: 'solid', dims: D(4, 3, 2), mode: 'faces', count: 6, counterLabel: '도장', instruction: '면을 눌러 도장을 찍어요. 뒤집어서 뒤쪽 면도 찾아요.', moa: '같은 면을 두 번 눌러도 수는 늘지 않아요.',
        hint: '면은 선분으로 둘러싸인 평평한 부분이에요. 앞·뒤·위·아래·왼쪽·오른쪽 6개예요.',
        check: answer => checkParts(BOX, answer, 'faces', 6, {other: '면이 아닌 곳을 눌렀어요. 평평한 부분을 눌러요.', missing: n => `아직 도장을 찍지 않은 면이 ${n}개 있어요. 돌려서 뒤쪽을 봐요.`})}],
      summary: '선분으로 둘러싸인 평평한 부분을 면이라고 해요. 직육면체의 면은 6개예요.'},
    {id: 'w2-m2', title: '모서리 보호대', situation: '면과 면이 만나는 선분마다 보호대를 붙여요.',
      steps: [{kind: 'solid', dims: D(4, 3, 2), mode: 'edges', count: 12, counterLabel: '보호대', diagonals: true, instruction: '면과 면이 만나는 선분을 눌러요.', moa: '뒤쪽에도 모서리가 있어요. 돌려 볼까요?',
        hint: '모서리는 면과 면이 만나는 선분이에요. 위에 4개, 아래에 4개, 세로로 4개 있어요.',
        check: answer => checkParts(BOX, answer, 'edges', 12, {other: '면이나 꼭짓점이 아니라 선분을 눌러요.', missing: n => `보호대를 붙이지 않은 모서리가 ${n}개 있어요.`})}],
      summary: '면과 면이 만나는 선분을 모서리라고 해요. 직육면체의 모서리는 12개예요.'},
    {id: 'w2-m3', title: '꼭짓점 보호캡', situation: '모서리와 모서리가 만나는 점마다 보호캡을 씌워요.',
      steps: [{kind: 'solid', dims: D(4, 3, 2), mode: 'vertices', count: 8, counterLabel: '보호캡', showFacesAtVertex: true, instruction: '꼭짓점을 눌러 보호캡을 씌워요. 한 꼭짓점에 모이는 면 3개도 살펴봐요.', moa: '보이지 않는 뒤쪽 꼭짓점도 돌려서 찾아요.',
        hint: '꼭짓점은 모서리와 모서리가 만나는 점이에요. 위에 4개, 아래에 4개 있어요.',
        check: answer => checkParts(BOX, answer, 'vertices', 8, {other: '꼭짓점은 모서리가 만나는 점이에요. 점을 눌러요.', missing: n => `보호캡이 없는 꼭짓점이 ${n}개 있어요. 뒤쪽을 돌려 봐요.`})}],
      summary: '모서리와 모서리가 만나는 점을 꼭짓점이라고 해요. 직육면체의 꼭짓점은 8개이고, 한 꼭짓점에는 면 3개와 모서리 3개가 모여요.'},
    {id: 'w2-m4', title: '두 상자 비교표', situation: '정육면체도 같은 검사를 하고 두 상자를 비교해요.',
      steps: [
        {kind: 'solid', dims: D(3, 3, 3), mode: 'all', count: {faces: 6, edges: 12, vertices: 8}, counterLabel: '검사', instruction: '정육면체의 면·모서리·꼭짓점을 모두 찾아 표시해요. 종류 버튼으로 바꿔 가며 눌러요.', moa: '정육면체도 직육면체와 같은 수일까요?',
          hint: '정육면체도 면 6개, 모서리 12개, 꼭짓점 8개예요.',
          check(answer) {
            const f = new Set(answer?.faces || []).size, e = new Set(answer?.edges || []).size, v = new Set(answer?.vertices || []).size;
            if (f === 6 && e === 12 && v === 8) return ok();
            const parts = [f < 6 && `면 ${6 - f}개`, e < 12 && `모서리 ${12 - e}개`, v < 8 && `꼭짓점 ${8 - v}개`].filter(Boolean);
            return no(`아직 표시하지 않은 것: ${parts.join(', ')}.`, []);
          }},
        {kind: 'fill', instruction: '비교표를 완성해요.', moa: '수는 같아도 길이는 다를 수 있어요.',
          hint: '구성 요소의 수는 같아요. 정육면체는 모서리의 길이가 모두 같고 면이 모두 정사각형이에요.',
          fields: [
            {id: 'cf', label: '정육면체 면의 수', answer: '6', unit: '개'}, {id: 'ce', label: '정육면체 모서리의 수', answer: '12', unit: '개'}, {id: 'cv', label: '정육면체 꼭짓점의 수', answer: '8', unit: '개'}
          ],
          selects: [
            {id: 'shape', label: '정육면체 면의 모양', options: ['모두 정사각형', '모두 직사각형이지만 정사각형은 아님', '삼각형'], answer: '모두 정사각형'},
            {id: 'len', label: '정육면체 모서리의 길이', options: ['모두 같다', '세 가지로 다르다', '두 가지로 다르다'], answer: '모두 같다'},
            {id: 'box', label: '직육면체(4×3×2) 모서리의 길이', options: ['모두 같다', '세 가지로 다르다'], answer: '세 가지로 다르다'}
          ],
          check: answer => checkFill([{id: 'cf', answer: '6'}, {id: 'ce', answer: '12'}, {id: 'cv', answer: '8'}, {id: 'shape', answer: '모두 정사각형'}, {id: 'len', answer: '모두 같다'}, {id: 'box', answer: '세 가지로 다르다'}].map(f => ({...f, wrongMessage: '표시된 칸을 다시 확인해요. 개수와 길이는 다른 이야기예요.'})), answer)}
      ],
      summary: '직육면체와 정육면체는 모두 면 6개·모서리 12개·꼭짓점 8개예요. 정육면체는 모든 면이 정사각형이고 모든 모서리의 길이가 같아요.'}
  ],
  reviews: [
    {id: 'w2-r1', title: '복습 1 · 이름 붙이기', situation: '표시된 세 부분의 이름을 붙여요.',
      steps: [{kind: 'fill', figure: {dims: D(4, 3, 2), marks: [{type: 'face', id: 'top', label: 'ㄱ'}, {type: 'edge', id: E('RBF', 'RTF'), label: 'ㄴ'}, {type: 'vertex', id: 'LTF', label: 'ㄷ'}]},
        instruction: 'ㄱ, ㄴ, ㄷ의 이름을 골라요.', moa: '평평한 부분, 선분, 점이에요.', hint: '면은 평평한 부분, 모서리는 면이 만나는 선분, 꼭짓점은 모서리가 만나는 점이에요.',
        selects: [{id: 'g', label: 'ㄱ', options: ['면', '모서리', '꼭짓점'], answer: '면'}, {id: 'n', label: 'ㄴ', options: ['면', '모서리', '꼭짓점'], answer: '모서리'}, {id: 'd', label: 'ㄷ', options: ['면', '모서리', '꼭짓점'], answer: '꼭짓점'}],
        check: answer => checkFill([{id: 'g', answer: '면'}, {id: 'n', answer: '모서리'}, {id: 'd', answer: '꼭짓점'}].map(f => ({...f, wrongMessage: '표시된 것을 다시 골라요.'})), answer)}],
      summary: '면·모서리·꼭짓점은 각각 평평한 부분, 선분, 점이에요.'},
    {id: 'w2-r2', title: '복습 2 · 수 채우기', situation: '새로운 5×2×2 상자의 구성 요소 수를 채워요.',
      steps: [{kind: 'fill', figure: {dims: D(5, 2, 2)}, instruction: '면·모서리·꼭짓점의 수를 적어요.', moa: '상자 크기가 달라도 수는 같을까요?', hint: '모든 직육면체는 면 6, 모서리 12, 꼭짓점 8이에요.',
        fields: [{id: 'f', label: '면', answer: '6', unit: '개'}, {id: 'e', label: '모서리', answer: '12', unit: '개'}, {id: 'v', label: '꼭짓점', answer: '8', unit: '개'}],
        check: answer => checkFill([{id: 'f', answer: '6'}, {id: 'e', answer: '12'}, {id: 'v', answer: '8'}].map(f => ({...f, wrongMessage: '표시된 칸을 다시 세어 봐요. 돌려서 뒤쪽도 세요.'})), answer)}],
      summary: '크기가 달라도 직육면체의 면·모서리·꼭짓점 수는 6·12·8이에요.'},
    {id: 'w2-r3', title: '복습 3 · 한 꼭짓점에 모이는 면', situation: '보호캡을 씌운 꼭짓점에 모이는 면 3개를 찾아요.',
      steps: [{kind: 'solid', dims: D(4, 3, 2), mode: 'faces', markVertex: 'RTK', instruction: '캡을 씌운 꼭짓점에 모이는 면을 모두 눌러요.', moa: '꼭짓점 하나에 면이 몇 개 모일까요?', hint: '꼭짓점을 둘러싼 면 3개를 찾아요. 돌려서 뒤쪽 면도 봐요.',
        check(answer) {
          const want = facesAtVertex('RTK');
          const got = [...new Set(answer?.faces || [])];
          if (setEq(want, got)) return ok();
          const extra = got.filter(f => !want.includes(f));
          return extra.length ? no(`${label(extra[0])}은 이 꼭짓점에 닿지 않아요.`, extra) : no('이 꼭짓점에 모이는 면이 더 있어요.', []);
        }}],
      summary: '한 꼭짓점에는 면 3개와 모서리 3개가 모여요.'}
  ]
};

// ---------- 작업장 3 설계대 ----------
const HID = sketchTruth(DIMS).sets.hiddenEdges;
const workshop3 = {
  id: 'w3', name: '설계대', subtitle: '뒤쪽 선도 설계도에 남겨 줘!', learning: '겨냥도·실선과 점선·보이는 부분과 안 보이는 부분',
  npc: {name: '설계사', greeting: '설계도에 뒤쪽 선이 빠졌어. 겨냥도를 같이 완성하자.', start: '설계도 그리기 시작'},
  missions: [
    {id: 'w3-m1', title: '입체가 잘 보이는 시점', situation: '같은 상자를 세 방향에서 그린 그림 중 입체 모양을 알기 쉬운 것을 골라요.',
      steps: [{kind: 'choice', figures: 'views', dims: DIMS, instruction: '입체 모양을 가장 잘 알 수 있는 그림을 골라요.', moa: '정면 그림만으로 두께를 알 수 있을까요?', hint: '세 면이 함께 보이는 비스듬한 그림이 입체 모양을 알기 쉬워요.',
        options: [{id: 'front', text: '정면에서 본 그림'}, {id: 'side', text: '옆에서 본 그림'}, {id: 'oblique', text: '비스듬히 본 그림(겨냥도)'}], answer: ['oblique'],
        check: answer => checkChoice(['oblique'], answer, {wrongMessage: '이 그림은 면 하나만 보여서 깊이를 알기 어려워요. 상자를 돌려 비교해요.'})}],
      summary: '직육면체의 모양을 잘 알 수 있도록 비스듬히 본 그림을 겨냥도라고 해요. 앞으로는 정해진 일반 시점으로 그려요.'},
    {id: 'w3-m2', title: '숨은 세 선 찾기', situation: '겨냥도에서 가려진 모서리를 먼저 표시한 뒤 투명하게 확인해요.',
      steps: [
        {kind: 'sketch', dims: DIMS, view: STANDARD_VIEW, given: 'all-solid', tool: 'toggle', instruction: '보이지 않는 모서리를 눌러 점선으로 바꿔요.', moa: '상자 뒤쪽 아래 꼭짓점에 모이는 선이에요.', hint: '보이지 않는 모서리는 3개예요. 뒤쪽·아래쪽·왼쪽 면이 만나는 곳을 생각해요.',
          check: answer => checkSketchTypes(DIMS, STANDARD_VIEW, answer), reveal: 'transparent'},
        {kind: 'fill', instruction: '일반 시점의 겨냥도에서 보이는 것과 보이지 않는 것의 수를 적어요.', moa: '이 수는 정해진 일반 시점에서만 맞아요.', hint: '면 3/3, 모서리 9/3, 꼭짓점 7/1이에요.',
          fields: [{id: 'fv', label: '보이는 면', answer: '3', unit: '개'}, {id: 'fh', label: '보이지 않는 면', answer: '3', unit: '개'}, {id: 'ev', label: '보이는 모서리', answer: '9', unit: '개'}, {id: 'eh', label: '보이지 않는 모서리', answer: '3', unit: '개'}, {id: 'vv', label: '보이는 꼭짓점', answer: '7', unit: '개'}, {id: 'vh', label: '보이지 않는 꼭짓점', answer: '1', unit: '개'}],
          check: answer => checkFill([{id: 'fv', answer: '3'}, {id: 'fh', answer: '3'}, {id: 'ev', answer: '9'}, {id: 'eh', answer: '3'}, {id: 'vv', answer: '7'}, {id: 'vh', answer: '1'}].map(f => ({...f, wrongMessage: '표시된 칸을 다시 세요. 보이는 수와 보이지 않는 수를 더하면 전체 수예요.'})), answer)}
      ],
      summary: '겨냥도에서 보이는 모서리는 실선, 보이지 않는 모서리는 점선으로 그려요. 일반 시점에서는 면 3개·모서리 9개·꼭짓점 7개가 보여요.'},
    {id: 'w3-m3', title: '겨냥도 직접 완성', situation: '빠진 모서리를 두 꼭짓점을 이어 그리고 실선·점선을 정해요.',
      steps: [
        {kind: 'sketch', dims: D(3, 3, 3), view: STANDARD_VIEW, tool: 'draw', missing: [E('LTF', 'RTF'), E('LBF', 'LBK'), E('LBK', 'RBK')], instruction: '정육면체 겨냥도에서 빠진 모서리 3개를 꼭짓점 두 개를 차례로 눌러 그려요. 선 종류를 고른 뒤 그려요.', moa: '보이는 선은 실선, 가려진 선은 점선이에요.',
          hint: '앞쪽 위 모서리 1개는 보이고, 뒤쪽 아래 꼭짓점에 모이는 2개는 가려져요.',
          check: answer => checkSketchTypes(D(3, 3, 3), STANDARD_VIEW, answer, {only: [E('LTF', 'RTF'), E('LBF', 'LBK'), E('LBK', 'RBK')]})},
        {kind: 'sketch', dims: DIMS, view: STANDARD_VIEW, tool: 'draw', missing: [E('RTF', 'RTK'), E('RBF', 'RTF'), E('LBK', 'LTK'), E('LBF', 'LBK')], instruction: '직육면체 겨냥도에서 빠진 모서리 4개를 그려요.', moa: '위치와 선 종류를 함께 확인해요.',
          hint: '오른쪽 위·앞쪽 오른쪽 세로 모서리는 보여요. 왼쪽 뒤 세로·왼쪽 아래 깊이 모서리는 가려져요.',
          check: answer => checkSketchTypes(DIMS, STANDARD_VIEW, answer, {only: [E('RTF', 'RTK'), E('RBF', 'RTF'), E('LBK', 'LTK'), E('LBF', 'LBK')]})}
      ],
      summary: '겨냥도는 보이는 모서리를 실선, 보이지 않는 모서리를 점선으로 그려요. 마주 보는 모서리는 평행하게 그려요.'},
    {id: 'w3-m4', title: '설계도 수리와 길이', situation: '잘못 그린 선을 고치고 보이지 않는 모서리 세 개의 길이 합을 구해요.',
      steps: [
        {kind: 'sketch', dims: DIMS, view: STANDARD_VIEW, tool: 'toggle', given: {[E('LTF', 'LTK')]: 'dashed', [E('RBF', 'RBK')]: 'dashed', [E('LBK', 'RBK')]: 'solid'}, showLengths: true, instruction: '실선·점선이 잘못된 모서리를 눌러 고쳐요.', moa: '화면의 사선 길이가 아니라 적힌 길이를 봐요.',
          hint: '보이는 모서리 2개가 점선으로, 가려진 모서리 1개가 실선으로 잘못 그려져 있어요.',
          check: answer => checkSketchTypes(DIMS, STANDARD_VIEW, answer)},
        {kind: 'fill', figure: {dims: DIMS, sketch: true, showLengths: true}, instruction: '가로 4cm, 세로 3cm, 높이 2cm 상자에서 보이지 않는 모서리 세 개의 길이의 합을 구해요.', moa: '방향이 같은 모서리는 길이가 같아요.',
          hint: '가려진 모서리는 가로·세로·높이 방향으로 하나씩이에요. 4+3+2를 구해요.',
          fields: [{id: 'sum', label: '보이지 않는 모서리 길이의 합', answer: String(hiddenEdgeLengthSum(cuboid(4, 3, 2))), unit: 'cm'}],
          check: answer => checkFill([{id: 'sum', answer: '9', wrongMessage: '화면에서 잰 사선이 아니라 적힌 실제 길이를 써요. 가려진 모서리는 방향마다 하나씩이에요.'}], answer)}
      ],
      summary: '겨냥도에서 방향이 같은 모서리는 길이가 같아요. 가려진 모서리는 가로·세로·높이 하나씩이라 길이의 합은 4+3+2=9cm예요.'}
  ],
  reviews: [
    {id: 'w3-r1', title: '복습 1 · 겨냥도의 목적', situation: '겨냥도를 그리는 까닭을 골라요.',
      steps: [{kind: 'choice', instruction: '겨냥도를 그리는 까닭으로 알맞은 것을 골라요.', moa: '왜 비스듬히 그릴까요?', hint: '입체의 모양을 한눈에 알 수 있게 하려는 거예요.',
        options: [{id: 'a', text: '직육면체의 모양을 한눈에 알 수 있게 보이는 면과 보이지 않는 면을 함께 나타내려고'}, {id: 'b', text: '상자를 실제 크기로 똑같이 그리려고'}, {id: 'c', text: '면 하나의 모양만 정확히 나타내려고'}, {id: 'd', text: '상자를 펼쳐서 종이로 만들려고'}], answer: ['a'],
        check: answer => checkChoice(['a'], answer, {wrongMessage: '겨냥도는 입체의 모양을 알기 쉽게 비스듬히 그린 그림이에요. 펼친 그림은 전개도예요.'})}],
      summary: '겨냥도는 입체도형의 모양을 잘 알 수 있도록 그린 그림이에요.'},
    {id: 'w3-r2', title: '복습 2 · 새 방향의 가려진 선', situation: '왼쪽 앞 위에서 본 겨냥도에서 가려진 모서리를 표시해요.',
      steps: [{kind: 'sketch', dims: D(4, 3, 2), view: {x: -1, y: 1, z: 1}, given: 'all-solid', tool: 'toggle', instruction: '이 방향에서 보이지 않는 모서리를 눌러 점선으로 바꿔요.', moa: '이번에는 상자를 왼쪽에서 봐요. 가려진 꼭짓점이 달라져요.', hint: '가려진 꼭짓점은 오른쪽 뒤 아래예요. 거기에 모이는 모서리 3개가 점선이에요.',
        check: answer => checkSketchTypes(D(4, 3, 2), {x: -1, y: 1, z: 1}, answer)}],
      summary: '보는 방향이 바뀌면 가려지는 모서리도 바뀌어요. 가려진 모서리는 항상 점선으로 그려요.'},
    {id: 'w3-r3', title: '복습 3 · 바꿔 그린 곳 고치기', situation: '실선과 점선을 서로 바꾸어 그린 곳을 고쳐요.',
      steps: [{kind: 'sketch', dims: D(3, 2, 2), view: STANDARD_VIEW, tool: 'toggle', given: {[E('LTF', 'LTK')]: 'dashed', [E('LBK', 'LTK')]: 'solid'}, instruction: '잘못된 선을 눌러 바르게 고쳐요.', moa: '위쪽 왼쪽 깊이 모서리는 보이나요?', hint: '보이는 선이 점선으로, 가려진 선이 실선으로 바뀌어 있어요.',
        check: answer => checkSketchTypes(D(3, 2, 2), STANDARD_VIEW, answer)}],
      summary: '실선은 보이는 모서리, 점선은 보이지 않는 모서리예요.'}
  ]
};

// ---------- 작업장 4 고정대 ----------
function checkFaceSet(want, answer, msgs) {
  const got = [...new Set(answer?.faces || [])];
  if (setEq(want, got)) return ok();
  const extra = got.filter(f => !want.includes(f));
  if (extra.length) return no(msgs.extra(extra[0]), extra);
  return no(msgs.missing, []);
}
const workshop4 = {
  id: 'w4', name: '고정대', subtitle: '어느 면을 밑면으로 할까?', learning: '면의 평행·수직·밑면·옆면',
  npc: {name: '고정 기사', greeting: '상자를 고정하려면 어느 면이 마주 보고 어느 면이 수직인지 알아야 해. 같이 찾아보자.', start: '면 관계 살피기'},
  missions: [
    {id: 'w4-m1', title: '평행한 세 쌍', situation: '한 면을 고르고 마주 보는 면을 찾아 세 쌍을 모두 표시해요.',
      steps: [{kind: 'solid', dims: DIMS, mode: 'pairs', count: 3, counterLabel: '평행한 쌍', instruction: '면을 하나 누른 뒤 마주 보는 면을 눌러 짝을 만들어요. 세 쌍을 모두 찾아요.', moa: '마주 보는 두 면은 아무리 넓혀도 만나지 않아요.',
        hint: '앞·뒤, 위·아래, 왼쪽·오른쪽이 각각 평행한 한 쌍이에요.',
        check(answer) {
          const pairs = answer?.pairs || [];
          const bad = pairs.find(([a, b]) => !isParallel(a, b));
          if (bad) return no(`${label(bad[0])}과 ${label(bad[1])}은 한 모서리에서 만나요. 마주 보는 면을 골라요.`, [bad.join('+')]);
          const keys = new Set(pairs.map(p => [...p].sort().join('+')));
          if (keys.size === 3) return ok();
          return no(`평행한 쌍이 ${3 - keys.size}개 더 있어요.`, []);
        }}],
      summary: '직육면체에서 마주 보는 두 면은 서로 평행해요. 평행한 면은 모두 3쌍이에요.'},
    {id: 'w4-m2', title: '한 면과 수직인 네 면', situation: '기준 면과 수직으로 만나는 면에 고정 패드를 붙여요.',
      steps: [{kind: 'solid', dims: DIMS, mode: 'faces', baseFace: 'front', count: 4, counterLabel: '고정 패드', instruction: '별 표시한 앞면과 수직인 면을 모두 눌러 패드를 붙여요.', moa: '앞면과 만나는 면은 모두 직각으로 만나요.',
        hint: '앞면과 모서리를 공유하는 면 4개가 수직이에요. 뒷면은 앞면과 평행해요.',
        check: answer => checkFaceSet(perpendicularFaces('front'), answer, {extra: f => `${label(f)}은 앞면과 수직이 아니라 평행이에요.`, missing: '앞면과 수직인 면이 더 있어요. 앞면과 만나는 면을 모두 찾아요.'})}],
      summary: '직육면체에서 한 면과 수직인 면은 4개예요. 마주 보는 면은 수직이 아니라 평행이에요.'},
    {id: 'w4-m3', title: '밑면 바꿔 보기', situation: '평행한 한 쌍을 밑면으로 정하면 나머지 네 면이 옆면이에요.',
      steps: [
        {kind: 'solid', dims: DIMS, mode: 'faces', basePair: ['front', 'back'], count: 4, counterLabel: '옆면', instruction: '앞면과 뒷면을 밑면으로 정했어요. 옆면 4개를 모두 눌러요.', moa: '밑면이 꼭 아래에 있어야 하는 건 아니에요.',
          hint: '밑면 2개를 뺀 나머지 면이 옆면이에요.',
          check: answer => checkFaceSet(lateralFaces('front', 'back'), answer, {extra: f => `${label(f)}은 지금 밑면이에요.`, missing: '옆면이 더 있어요. 밑면이 아닌 면 4개를 모두 골라요.'})},
        {kind: 'solid', dims: DIMS, mode: 'faces', basePair: ['left', 'right'], count: 4, counterLabel: '옆면', instruction: '이번에는 왼쪽 면과 오른쪽 면을 밑면으로 정했어요. 옆면 4개를 모두 눌러요.', moa: '돌려서 밑면이 아래로 오게 보면 쉬워요.',
          hint: '왼쪽·오른쪽 면을 뺀 나머지 면이 옆면이에요.',
          check: answer => checkFaceSet(lateralFaces('left', 'right'), answer, {extra: f => `${label(f)}은 지금 밑면이에요.`, missing: '옆면이 더 있어요.'})}
      ],
      summary: '서로 평행한 두 면을 밑면, 밑면과 수직인 네 면을 옆면이라고 해요. 어떤 평행한 쌍도 밑면으로 정할 수 있어요.'},
    {id: 'w4-m4', title: '고정 위치 응용', situation: '두 기준 면에 동시에 수직인 면을 찾고 마주 보는 면의 둘레를 구해요.',
      steps: [
        {kind: 'solid', dims: DIMS, mode: 'faces', baseFace: 'front', secondFace: 'bottom', count: 2, counterLabel: '고정 위치', instruction: '별(앞면)과 마름모(아랫면) 두 기준 면에 동시에 수직인 면을 모두 눌러요.', moa: '각 기준 면과 수직인 면을 따로 생각한 뒤 겹치는 면을 찾아요.',
          hint: '앞면과 수직인 면: 위·아래·왼쪽·오른쪽. 아랫면과 수직인 면: 앞·뒤·왼쪽·오른쪽. 둘 다 들어 있는 면이에요.',
          check: answer => checkFaceSet(perpendicularFaces('front').filter(f => perpendicularFaces('bottom').includes(f)), answer, {extra: f => `${label(f)}은 두 기준 면 중 하나와 평행하거나 기준 면 자체예요.`, missing: '두 기준 면 모두와 수직인 면이 더 있어요.'})},
        {kind: 'fill', figure: {dims: DIMS, sketch: true, showLengths: true, highlight: 'back'}, instruction: '앞면(가로 4cm, 세로 3cm)과 마주 보는 면의 둘레를 구해요.', moa: '마주 보는 면은 모양과 크기가 같아요.',
          hint: '뒷면도 4cm와 3cm인 직사각형이에요. 둘레는 (4+3)×2예요.',
          fields: [{id: 'p', label: '뒷면의 둘레', answer: String(perimeter(faceDims(DIMS, 'back'))), unit: 'cm'}],
          check: answer => checkFill([{id: 'p', answer: '14', wrongMessage: '마주 보는 면은 합동이에요. 4+3+4+3을 구해요.'}], answer)}
      ],
      summary: '두 기준 면에 동시에 수직인 면은 두 기준 면 모두와 모서리를 공유해요. 마주 보는 면은 합동이라 둘레도 같아요.'}
  ],
  reviews: [
    {id: 'w4-r1', title: '복습 1 · 마주 보는 면', situation: '윗면과 마주 보는 면을 찾아요.',
      steps: [{kind: 'solid', dims: D(3, 2, 2), mode: 'faces', baseFace: 'top', count: 1, counterLabel: '선택', instruction: '별 표시한 윗면과 평행한 면을 눌러요.', moa: '마주 보는 면 하나예요.', hint: '윗면과 마주 보는 면은 아랫면이에요.',
        check: answer => checkFaceSet(['bottom'], answer, {extra: f => `${label(f)}은 윗면과 만나요.`, missing: '윗면과 마주 보는 면을 골라요.'})}],
      summary: '마주 보는 두 면은 평행해요.'},
    {id: 'w4-r2', title: '복습 2 · 다른 밑면의 옆면', situation: '윗면과 아랫면을 밑면으로 할 때 옆면을 찾아요.',
      steps: [{kind: 'solid', dims: D(3, 2, 2), mode: 'faces', basePair: ['top', 'bottom'], count: 4, counterLabel: '옆면', instruction: '윗면·아랫면이 밑면일 때 옆면 4개를 모두 눌러요.', moa: '모두 고르는 문제예요.', hint: '밑면 2개를 뺀 나머지 4면이에요.',
        check: answer => checkFaceSet(lateralFaces('top', 'bottom'), answer, {extra: f => `${label(f)}은 밑면이에요.`, missing: '옆면이 더 있어요.'})}],
      summary: '밑면을 정하면 나머지 네 면이 옆면이에요.'},
    {id: 'w4-r3', title: '복습 3 · 틀린 말 고치기', situation: '"밑면은 항상 바닥에 놓인 한 면이다"라는 말을 바르게 고쳐요.',
      steps: [{kind: 'choice', instruction: '바르게 고친 문장을 골라요.', moa: '밑면은 몇 개일까요?', hint: '밑면은 평행한 두 면이고, 어떤 쌍도 밑면이 될 수 있어요.',
        options: [{id: 'a', text: '밑면은 서로 평행한 두 면이고, 어느 평행한 쌍도 밑면으로 정할 수 있어요.'}, {id: 'b', text: '밑면은 항상 가장 넓은 한 면이에요.'}, {id: 'c', text: '밑면은 옆면과 평행한 면이에요.'}, {id: 'd', text: '밑면은 화면에서 아래쪽에 보이는 면 하나예요.'}], answer: ['a'],
        check: answer => checkChoice(['a'], answer, {wrongMessage: '밑면은 2개이고 옆면과 수직이에요. 상자를 돌리면 다른 쌍도 밑면이 될 수 있어요.'})}],
      summary: '밑면은 평행한 두 면이에요. 바닥에 놓인 한 면만 밑면인 것은 아니에요.'}
  ]
};

// ---------- 작업장 5 정육면체 포장대 ----------
const CUBE1 = {x: 1, y: 1, z: 1};
const ALL_CUBE_EDGES = cuboid(1, 1, 1).edges.map(e => e.id);
const planCuts = folds => ALL_CUBE_EDGES.filter(e => !folds.includes(e));
const PLAN_GOOD = [E('LBF', 'RBF'), E('LBK', 'RBK'), E('LBF', 'LBK'), E('RBF', 'RBK'), E('LTF', 'RTF')];  // 십자 모양
const PLAN_NOT_FLAT = [...PLAN_GOOD, E('RTF', 'RTK')];       // 접힌 모서리 6개: 펼쳐지지 않음
const PLAN_SPLIT = PLAN_GOOD.slice(0, 4);                      // 접힌 모서리 4개: 윗면이 떨어짐
const CUT_PLANS = [
  {id: 'A', folds: PLAN_NOT_FLAT, cuts: planCuts(PLAN_NOT_FLAT)},
  {id: 'B', folds: PLAN_GOOD, cuts: planCuts(PLAN_GOOD)},
  {id: 'C', folds: PLAN_SPLIT, cuts: planCuts(PLAN_SPLIT)}
];
const PREDICT = [
  {id: 'p1', cells: CUBE_NETS[0]}, {id: 'p2', cells: NOT_CUBE_NETS[0]}, {id: 'p3', cells: CUBE_NETS[8]}, {id: 'p4', cells: NOT_CUBE_NETS[3]}
];
const FIVE_BASE = [[0, 0], [1, 0], [2, 0], [3, 0], [1, -1]];
const CROSS_CELLS = CUBE_NETS[4];  // 1-4-1 십자
const crossPieces = cells(CROSS_CELLS);
const crossFold = isCubeNet(CROSS_CELLS);
const workshop5 = {
  id: 'w5', name: '정육면체 포장대', subtitle: '정사각형 여섯 장을 접어요', learning: '정육면체 전개도·겹침·대응점·대응 모서리',
  npc: {name: '포장원', greeting: '정육면체 상자를 종이로 만들어야 해. 어떻게 잘라야 한 장으로 펼쳐질까?', start: '상자 펼치기 시작'},
  missions: [
    {id: 'w5-m1', title: '잘라서 펼치기', situation: '모서리를 잘라 상자를 한 장으로 펼치는 절개안을 골라요.',
      steps: [{kind: 'cut-plan', plans: CUT_PLANS, instruction: '빨간 선을 따라 자르면 한 장의 평면으로 펼쳐지는 절개안을 골라요.', moa: '잘린 모서리는 실선, 접힌 모서리는 점선이 돼요.',
        hint: '여섯 면이 모두 이어지면서도 평평하게 펼쳐지려면 접힌 모서리가 5개 남아야 해요.',
        check(answer) {
          const plan = CUT_PLANS.find(p => p.id === answer?.selected);
          if (!plan) return no('절개안을 하나 골라요.');
          const r = unfoldByFolds(CUBE1, plan.folds);
          if (r.ok) return ok();
          return no(r.status === 'disconnected' ? '이 절개안은 면이 떨어져 두 조각이 돼요.' : '이 절개안은 접힌 모서리가 너무 많아 평평하게 펼쳐지지 않아요.', [plan.id]);
        }}],
      summary: '정육면체를 모서리를 따라 잘라 펼친 그림을 전개도라고 해요. 전개도에서 잘린 모서리는 실선, 접히는 모서리는 점선으로 그려요. 겨냥도의 점선(가려짐)과 뜻이 달라요.'},
    {id: 'w5-m2', title: '될까, 안 될까?', situation: '정사각형 6개로 된 모양이 정육면체 전개도인지 먼저 예상하고 접어서 확인해요.',
      steps: PREDICT.map((c, i) => ({kind: 'net-predict', candidate: c, index: i, total: PREDICT.length, instruction: `모양 ${i + 1}/${PREDICT.length}: 접으면 정육면체가 될까요? 예상을 고른 뒤 제출하고 접어서 확인해요.`, moa: '면이 겹치거나 빈 면이 생기면 전개도가 아니에요.',
        hint: '접었을 때 같은 자리에 두 면이 오면 겹쳐요. 한 줄로 4개가 넘거나 2×2로 뭉치면 겹쳐요.',
        check(answer) {
          const r = isCubeNet(c.cells);
          if (typeof answer?.predict !== 'boolean') return no('될지 안 될지 먼저 골라요.');
          if (answer.predict === r.ok) return ok();
          return no(r.ok ? '접어 보면 여섯 면이 모두 제자리에 와요. 접어서 확인해요.' : netMessage(r, CUBE1, () => '정사각형'), [], {fold: true});
        }})),
      summary: '정육면체 전개도는 정사각형 6개가 이어져 있고, 접었을 때 면이 겹치지 않고 빈 면도 없어야 해요. 면이 6개라는 것만으로는 부족해요.'},
    {id: 'w5-m3', title: '한 면 더 붙이기', situation: '정사각형 5개짜리 전개도에 마지막 한 면을 붙이고, 다른 모양도 만들어요.',
      steps: [
        {kind: 'net-build', net: 'cube', base: cells(FIVE_BASE), fixedBase: true, tray: [{w: 1, h: 1, count: 1}], instruction: '정사각형 5/6. 조각을 골라 빈자리에 붙여요. 접었을 때 겹치지 않는 자리를 찾아요.', moa: '접었을 때 면이 겹치지 않을까요?',
          hint: '붙일 수 있는 자리는 여러 곳이지만 접어도 되는 자리는 정해져 있어요. 정답은 하나가 아니에요.',
          check: (answer, ctx) => checkCubeNet(answer, ctx)},
        {kind: 'net-build', net: 'cube', base: [], tray: [{w: 1, h: 1, count: 6}], instruction: '정사각형 6개로 앞에서 만든 것과 다른 모양의 전개도를 만들어요.', moa: '돌리거나 뒤집어서 같은 모양이면 새 모양이 아니에요.',
          hint: '정육면체 전개도는 모두 11가지예요. 한 줄에 3개나 2개만 두는 모양도 있어요.',
          check: (answer, ctx) => checkCubeNet(answer, ctx, {mustDiffer: 0})}
      ],
      summary: '정육면체 전개도는 한 가지가 아니라 여러 가지예요. 돌리거나 뒤집어서 같은 모양은 같은 전개도로 봐요.'},
    {id: 'w5-m4', title: '접히면 만나는 자리', situation: '전개도에서 접었을 때 만나는 점과 모서리를 예측하고 접어서 확인해요.',
      steps: [
        {kind: 'net-points', pieces: crossPieces, tree: crossFold.tree, ask: 'point', from: '0,0', instruction: '점 ㄱ(표시된 점)과 접었을 때 만나는 점을 모두 눌러요.', moa: '접히는 동안 잠시 멈춰 점을 따라가요.', hint: '같은 꼭짓점이 되는 점은 전개도 가장자리에 여러 개 있어요.',
          check(answer) {
            const want = meetingPoints(crossPieces, crossFold.tree, '0,0');
            const got = answer?.selected || [];
            if (setEq(want, got)) return ok();
            const extra = got.filter(k => !want.includes(k));
            return extra.length ? no('그 점은 접으면 다른 꼭짓점이 돼요. 접기 슬라이더로 따라가 봐요.', extra, {fold: true}) : no('만나는 점이 더 있어요.', [], {fold: true});
          }},
        {kind: 'net-points', pieces: crossPieces, tree: crossFold.tree, ask: 'segment', from: '0,0|1,0', instruction: '모서리 ㄱㄴ(표시된 선분)과 접었을 때 만나는 모서리를 눌러요.', moa: '잘린 두 변이 접히면 한 모서리가 돼요.', hint: '맞닿는 모서리는 길이가 같고, 접으면 같은 자리에서 만나요.',
          check(answer) {
            const want = meetingSegments(crossPieces, crossFold.tree, '0,0|1,0');
            const got = answer?.selected || [];
            if (setEq(want, got)) return ok();
            return no('그 변은 접으면 다른 모서리가 돼요. 접기로 확인해요.', got.filter(k => !want.includes(k)), {fold: true});
          }}
      ],
      summary: '전개도를 접으면 떨어져 있던 점과 변이 만나 한 꼭짓점과 한 모서리가 돼요. 접은 뒤 같은 자리에 오는 점과 모서리를 대응시킬 수 있어요.'}
  ],
  reviews: [
    {id: 'w5-r1', title: '복습 1 · 전개도 모두 고르기', situation: '정육면체 전개도를 모두 골라요.',
      steps: [{kind: 'choice', figures: 'nets', instruction: '정육면체의 전개도를 모두 골라요.', moa: '모두 고르는 문제예요.', hint: '2×2로 뭉친 부분이 있거나 한 줄에 5개 이상이면 겹쳐요.',
        options: [{id: 'n1', cells: CUBE_NETS[2]}, {id: 'n2', cells: NOT_CUBE_NETS[2]}, {id: 'n3', cells: CUBE_NETS[10]}, {id: 'n4', cells: NOT_CUBE_NETS[1]}],
        answer: ['n1', 'n3'],
        check: answer => checkChoice(['n1', 'n3'], answer, {multi: true, wrongMessage: '그 모양은 접으면 면이 겹치거나 빈 면이 생겨요.'})}],
      summary: '겹치지 않고 빈 면이 없어야 정육면체 전개도예요.'},
    {id: 'w5-r2', title: '복습 2 · 만나는 점', situation: '접었을 때 점 ㄱ과 만나는 점을 찾아요.',
      steps: [{kind: 'net-points', pieces: cells(CUBE_NETS[8]), tree: isCubeNet(CUBE_NETS[8]).tree, ask: 'point', from: '0,0', instruction: '점 ㄱ과 접었을 때 만나는 점을 모두 눌러요.', moa: '접어서 확인할 수 있어요.', hint: '접으면 같은 꼭짓점이 되는 점이에요.',
        check(answer) {
          const want = meetingPoints(cells(CUBE_NETS[8]), isCubeNet(CUBE_NETS[8]).tree, '0,0');
          const got = answer?.selected || [];
          return setEq(want, got) ? ok() : no('접기로 점을 따라가 봐요.', got.filter(k => !want.includes(k)), {fold: true});
        }}],
      summary: '전개도를 접었을 때 같은 꼭짓점이 되는 점을 찾을 수 있어요.'},
    {id: 'w5-r3', title: '복습 3 · 겹치는 까닭', situation: '정사각형 6개인데 정육면체가 되지 않는 까닭을 찾아요.',
      steps: [{kind: 'choice', figures: 'nets', instruction: '이 모양(2×3)이 정육면체 전개도가 아닌 까닭을 골라요.', moa: '접어 보면 알 수 있어요.', hint: '2×2로 붙은 부분을 접으면 두 면이 같은 자리에 와요.',
        figureCells: NOT_CUBE_NETS[0],
        options: [{id: 'a', text: '접으면 면이 겹치고 빈 면이 생겨요.'}, {id: 'b', text: '정사각형이 6개보다 적어요.'}, {id: 'c', text: '정사각형의 크기가 서로 달라요.'}, {id: 'd', text: '한 조각으로 이어져 있지 않아요.'}], answer: ['a'],
        check: answer => checkChoice(['a'], answer, {wrongMessage: '정사각형은 6개이고 크기도 같고 이어져 있어요. 접었을 때를 생각해요.'})}],
      summary: '면이 6개여도 접었을 때 겹치면 전개도가 아니에요.'}
  ]
};

// ---------- 작업장 6 맞춤 포장대 ----------
const TRAY_432 = [{w: 4, h: 3}, {w: 4, h: 2}, {w: 3, h: 2}, {w: 4, h: 4}, {w: 3, h: 3}, {w: 2, h: 2}, {w: 5, h: 2}];
const NEED_432 = {'4x3': 2, '4x2': 2, '3x2': 2};
const sizeKey = (w, h) => `${Math.max(w, h)}x${Math.min(w, h)}`;
const base432 = crossNet(DIMS);  // bottom 4×2 at (0,0)
function piecesExcept(net, faceId) { return net.pieces.filter(p => p.id !== faceId); }
const workshop6 = {
  id: 'w6', name: '맞춤 포장대', subtitle: '길이가 다른 상자도 딱 맞게!', learning: '직육면체 전개도·길이 대응·직접 그리기·만들기',
  npc: {name: '맞춤 포장원', greeting: '길이가 다른 4×3×2 상자야. 면의 크기가 딱 맞아야 포장이 돼. 함께 설계하자.', start: '맞춤 포장 시작'},
  missions: [
    {id: 'w6-m1', title: '맞는 면을 준비하기', situation: '4×3×2cm 주문에 맞는 직사각형을 종류별로 2장씩 준비해요.',
      steps: [{kind: 'tray-count', dims: DIMS, tray: TRAY_432, instruction: '가로 4cm, 세로 3cm, 높이 2cm 상자에 필요한 직사각형을 종류별로 2장씩 골라요.', moa: '마주 보는 면은 크기가 같아요.',
        hint: '앞·뒤는 4×3, 위·아래는 4×2, 왼·오른쪽은 3×2예요. 각각 2장씩 모두 6장이에요.',
        check(answer) {
          const counts = answer?.counts || {};
          const wrong = [];
          for (const [k, v] of Object.entries(counts)) if (v && !NEED_432[k]) wrong.push(k);
          if (wrong.length) return no(`${wrong[0].replace('x', '×')}cm 면은 이 상자에 없어요. 상자의 세 길이 4, 3, 2 중 두 개로 된 직사각형만 필요해요.`, wrong);
          for (const [k, n] of Object.entries(NEED_432)) if ((counts[k] || 0) !== n) wrong.push(k);
          if (!wrong.length) return ok();
          return no(`${wrong[0].replace('x', '×')}cm 면은 마주 보는 면까지 2장이 필요해요.`, wrong);
        }}],
      summary: '직육면체의 마주 보는 면은 서로 합동이에요. 세 길이가 다른 상자는 세 종류의 직사각형이 2장씩 필요해요.'},
    {id: 'w6-m2', title: '불량 포장안 고치기', situation: '면이 겹치는 안과 길이가 맞지 않는 안을 구분해 고쳐요.',
      steps: [
        {kind: 'net-build', dims: DIMS, base: [...piecesExcept(base432, 'right'), {id: 'right', x: -2, y: 2, w: 2, h: 3}], movable: true, rotatable: true, tray: [], instruction: '불량 안 1: 접으면 면이 겹쳐요. 조각 하나를 눌러 들고 다른 자리에 놓아 고쳐요. 필요하면 돌려요.', moa: '겹치는 두 면을 표시해 줄게요.',
          hint: '겹치는 조각을 떼어 다른 면의 변 전체와 맞닿게 붙여요. 비어 있는 오른쪽 면 자리를 생각해요.',
          check: (answer, ctx) => checkRectNet(DIMS, answer, ctx)},
        {kind: 'net-build', dims: DIMS, base: [...piecesExcept(base432, 'right'), {...base432.pieces.find(p => p.id === 'right'), w: 4, h: 2}], movable: true, rotatable: true, replaceable: true, tray: [{w: 3, h: 2, count: 1}, {w: 2, h: 3, count: 1}, {w: 4, h: 3, count: 1}], blankLength: {piece: 'left', side: 'h', answer: 2}, instruction: '불량 안 2: 모서리 길이가 안 맞는 조각이 있어요. 그 조각을 눌러 뗀 뒤 맞는 조각을 붙이고, 빠진 길이도 적어요.', moa: '맞닿는 변의 길이가 같아야 접혀요.',
          hint: '아랫면 4×2의 짧은 변(2cm)에 붙는 면은 변 하나가 2cm여야 해요. 왼쪽·오른쪽 면은 3×2예요.',
          check(answer, ctx) {
            const r = checkRectNet(DIMS, answer, ctx);
            if (!r.ok) return r;
            if (String(answer?.values?.blank ?? '').trim() !== '2') return no('빠진 길이는 맞닿는 변과 같아요. 아랫면의 짧은 변 길이를 봐요.', ['blank']);
            return ok();
          }}
      ],
      summary: '전개도는 면의 배치와 모서리 길이 두 조건을 모두 만족해야 해요. 맞닿아 접히는 두 변은 길이가 같아요.'},
    {id: 'w6-m3', title: '전개도 직접 설계', situation: '1cm 모눈에 여섯 직사각형을 놓아 4×3×2 상자의 전개도를 설계해요.',
      steps: [
        {kind: 'net-build', dims: DIMS, base: [], tray: [{w: 4, h: 3, count: 2}, {w: 4, h: 2, count: 2}, {w: 3, h: 2, count: 2}], rotatable: true, instruction: '조각을 골라 모눈에 놓아요. 돌리기로 가로·세로를 바꿀 수 있어요. 접는 선은 맞닿은 변에 자동으로 점선 표시돼요.', moa: '접기 전에 맞닿는 길이를, 접은 뒤 겹침과 빈 면을 확인해요.',
          hint: '아랫면 4×2를 가운데 두고 네 변에 앞·뒤(4×3)·왼·오(3×2)를 붙인 뒤 윗면을 한 곳에 붙이는 방법이 있어요.',
          check: (answer, ctx) => checkRectNet(DIMS, answer, ctx)},
        {kind: 'net-build', dims: DIMS, base: [], tray: [{w: 4, h: 3, count: 2}, {w: 4, h: 2, count: 2}, {w: 3, h: 2, count: 2}], rotatable: true, instruction: '이번에는 앞과 다른 모양의 전개도를 설계해요.', moa: '같은 상자도 여러 전개도가 있어요.',
          hint: '윗면을 다른 옆면에 붙이거나 옆면을 다른 자리에 붙이면 모양이 달라져요.',
          check: (answer, ctx) => checkRectNet(DIMS, answer, ctx, {mustDiffer: 0})}
      ],
      summary: '직육면체 전개도는 정답 그림 하나가 아니라 연결·길이·접힌 뒤 면의 위치로 판단해요. 같은 상자도 여러 전개도를 가져요.'},
    {id: 'w6-m4', title: '장난감 부품 조립', situation: '머리·몸통·팔·다리 전개도에 빠진 한 면을 채워 접고 로봇 장난감을 만들어요.',
      steps: [
        {kind: 'net-build', part: '머리', dims: D(2, 2, 2), base: piecesExcept(crossNet(D(2, 2, 2)), 'top'), fixedBase: true, tray: [{w: 2, h: 2, count: 1}, {w: 2, h: 1, count: 1}], instruction: '머리(2×2×2): 빠진 면 하나를 붙여요.', moa: '정육면체 머리예요.', hint: '정육면체는 모든 면이 정사각형이에요.',
          check: (answer, ctx) => checkRectNet(D(2, 2, 2), answer, ctx)},
        {kind: 'net-build', part: '몸통', dims: DIMS, base: piecesExcept(base432, 'back'), fixedBase: true, tray: [{w: 4, h: 3, count: 1}, {w: 3, h: 4, count: 1}, {w: 4, h: 2, count: 1}], rotatable: true, instruction: '몸통(4×3×2): 빠진 면 하나를 붙여요.', moa: '마주 보는 면과 같은 크기예요.', hint: '빠진 면은 앞면과 마주 보는 뒷면이에요. 4×3 조각을 붙여요.',
          check: (answer, ctx) => checkRectNet(DIMS, answer, ctx)},
        {kind: 'net-build', part: '팔(2개 복제)', dims: D(1, 3, 1), base: piecesExcept(crossNet(D(1, 3, 1)), 'left'), fixedBase: true, tray: [{w: 1, h: 3, count: 1}, {w: 3, h: 1, count: 1}, {w: 1, h: 1, count: 1}], rotatable: true, instruction: '팔(1×3×1): 빠진 면 하나를 붙여요. 같은 팔은 자동으로 하나 더 만들어요.', moa: '길쭉한 면이 필요해요.', hint: '옆면은 1×3이에요. 맞닿는 변이 3cm인지 1cm인지 봐요.',
          check: (answer, ctx) => checkRectNet(D(1, 3, 1), answer, ctx)},
        {kind: 'net-build', part: '다리(2개 복제)', robotFinal: true, dims: D(1, 3, 1), base: piecesExcept(crossNet(D(1, 3, 1)), 'top'), fixedBase: true, tray: [{w: 1, h: 1, count: 1}, {w: 1, h: 3, count: 1}], rotatable: true, instruction: '다리(1×3×1): 빠진 면 하나를 붙여요. 같은 다리는 자동으로 하나 더 만들어요.', moa: '작은 정사각형 면이 빠졌어요.', hint: '위·아래 면은 1×1이에요.',
          check: (answer, ctx) => checkRectNet(D(1, 3, 1), answer, ctx)}
      ],
      summary: '부품마다 빠진 면은 마주 보는 면과 같은 크기예요. 전개도를 접어 만든 직육면체 부품을 모아 장난감을 만들 수 있어요.'}
  ],
  reviews: [
    {id: 'w6-r1', title: '복습 1 · 빈칸에 길이 넣기', situation: '5×3×2 상자 전개도의 빈칸에 실제 모서리 길이를 넣어요.',
      steps: [{kind: 'fill', figure: {net: crossNet(D(5, 3, 2)), blanks: [{piece: 'front', side: 'w', id: 'a'}, {piece: 'right', side: 'w', id: 'b'}, {piece: 'back', side: 'h', id: 'c'}]}, instruction: '빈칸 ㄱ, ㄴ, ㄷ에 알맞은 길이를 적어요.', moa: '맞닿은 변은 길이가 같아요.', hint: '아랫면은 5×2, 앞·뒤는 5×3, 왼·오른쪽은 3×2예요.',
        fields: [{id: 'a', label: 'ㄱ', answer: '5', unit: 'cm'}, {id: 'b', label: 'ㄴ', answer: '3', unit: 'cm'}, {id: 'c', label: 'ㄷ', answer: '3', unit: 'cm'}],
        check: answer => checkFill([{id: 'a', answer: '5'}, {id: 'b', answer: '3'}, {id: 'c', answer: '3'}].map(f => ({...f, wrongMessage: '표시된 칸을 다시 봐요. 맞닿은 변이나 마주 보는 면의 길이와 같아요.'})), answer)}],
      summary: '전개도에서 맞닿아 접히는 변과 마주 보는 면의 변은 길이가 같아요.'},
    {id: 'w6-r2', title: '복습 2 · 카드 연결', situation: '같은 상자의 입체·겨냥도·전개도 카드를 연결해요.',
      steps: [{kind: 'link', solids: [{id: 's1', dims: D(4, 3, 2), name: '4×3×2 상자'}, {id: 's2', dims: D(3, 3, 3), name: '3×3×3 상자'}, {id: 's3', dims: D(5, 2, 2), name: '5×2×2 상자'}],
        sketches: [{id: 'k1', dims: D(5, 2, 2)}, {id: 'k2', dims: D(4, 3, 2)}, {id: 'k3', dims: D(3, 3, 3)}],
        nets: [{id: 'n1', net: crossNet(D(3, 3, 3))}, {id: 'n2', net: crossNet(D(5, 2, 2))}, {id: 'n3', net: crossNet(D(4, 3, 2))}],
        answer: {s1: {sketch: 'k2', net: 'n3'}, s2: {sketch: 'k3', net: 'n1'}, s3: {sketch: 'k1', net: 'n2'}},
        instruction: '상자마다 알맞은 겨냥도와 전개도를 골라 연결해요.', moa: '길이 표시를 비교해요.', hint: '겨냥도의 세 길이와 전개도의 면 크기를 상자의 길이와 맞춰요.',
        check(answer) {
          const want = {s1: {sketch: 'k2', net: 'n3'}, s2: {sketch: 'k3', net: 'n1'}, s3: {sketch: 'k1', net: 'n2'}};
          const links = answer?.links || {};
          const wrong = [];
          for (const s of Object.keys(want)) { if (links[s]?.sketch !== want[s].sketch) wrong.push(`${s}:sketch`); if (links[s]?.net !== want[s].net) wrong.push(`${s}:net`); }
          return wrong.length ? no('표시된 연결을 다시 봐요. 상자의 세 길이와 카드의 길이를 비교해요.', wrong) : ok();
        }}],
      summary: '같은 직육면체를 입체·겨냥도·전개도로 나타낼 수 있어요. 세 길이로 서로 연결해요.'},
    {id: 'w6-r3', title: '복습 3 · 면 크기 수리', situation: '면 크기가 맞지 않는 전개도를 수리해요.',
      steps: [{kind: 'net-build', dims: D(3, 2, 2), base: (() => { const n = unfoldByFolds(D(3, 2, 2), [E('LBF', 'RBF'), E('LBK', 'RBK'), E('LBF', 'LBK'), E('RBF', 'RBK'), E('RTF', 'RTK')]); return n.pieces.map(p => p.id === 'front' ? {...p, w: 3, h: 3} : p); })(), movable: true, replaceable: true, tray: [{w: 3, h: 2, count: 1}, {w: 2, h: 2, count: 1}], instruction: '3×2×2 상자 전개도에서 크기가 맞지 않는 조각을 떼고 맞는 조각으로 바꿔요.', moa: '마주 보는 면과 같은 크기여야 해요.', hint: '앞면은 뒷면과 같은 3×2예요.',
        check: (answer, ctx) => checkRectNet(D(3, 2, 2), answer, ctx)}],
      summary: '전개도의 각 면은 상자의 실제 면과 크기가 같아야 해요.'}
  ]
};

// ---------- 종합 배송 ----------
const FINAL_DIMS = D(5, 4, 2);
const FINAL_SOLIDS = [
  solidDesc('order', 'cuboid', {dims: [5, 4, 2], name: '5×4×2 상자', tilt: [0.8, 0.5]}), solidDesc('cube4', 'cube', {size: 4, name: '4×4×4 상자'}),
  solidDesc('tri2', 'tri-prism', {name: '삼각기둥 상자'}), solidDesc('cyl2', 'cylinder', {name: '원기둥 통'})
];
const finalNet = crossNet(FINAL_DIMS);
export const finalDelivery = {
  id: 'final', title: '종합 배송 · 축제의 장난감 상자', name: '배송장', situation: '새로운 5×4×2cm 주문 상자를 처음부터 끝까지 직접 확인하고 배송장으로 보내요.',
  npc: {name: '배송 기사', greeting: '마지막 주문이야. 5×4×2cm 상자야. 배운 걸 모두 써서 확인해 줘!', start: '종합 배송 시작'},
  steps: [
    {kind: 'sort', solids: FINAL_SOLIDS, instruction: '① 분류: 직육면체인 것을 모두 골라요.', moa: '정육면체도 직육면체예요.', hint: '직사각형 6개로 둘러싸인 것을 모두 골라요.',
      check: answer => checkSort(FINAL_SOLIDS, s => classifySolid(s).isCuboid, answer, {extra: '직사각형이 아닌 면이 있어요.', missing: '직육면체가 더 있어요.'})},
    {kind: 'solid', dims: FINAL_DIMS, mode: 'vertices', count: 8, counterLabel: '보호캡', instruction: '② 검사: 주문 상자의 꼭짓점 8곳에 보호캡을 씌워요.', moa: '뒤쪽도 돌려 봐요.', hint: '꼭짓점은 위 4개, 아래 4개예요.',
      check: answer => checkParts(cuboid(5, 4, 2), answer, 'vertices', 8, {other: '꼭짓점은 점이에요.', missing: n => `보호캡이 없는 꼭짓점이 ${n}개 있어요.`})},
    {kind: 'sketch', dims: FINAL_DIMS, view: STANDARD_VIEW, tool: 'draw', missing: [E('LBK', 'LTK'), E('LBF', 'LBK')], given: {[E('LBK', 'RBK')]: 'solid'}, showLengths: true, instruction: '③ 설계: 겨냥도에서 빠진 가려진 모서리 2개를 점선으로 그리고, 잘못된 선 1개를 고쳐요.', moa: '겨냥도의 점선은 가려진 모서리예요.', hint: '뒤쪽 아래 왼쪽 꼭짓점에 모이는 모서리 3개가 모두 점선이어야 해요.',
      check: answer => checkSketchTypes(FINAL_DIMS, STANDARD_VIEW, answer)},
    {kind: 'solid', dims: FINAL_DIMS, mode: 'faces', basePair: ['top', 'bottom'], count: 4, counterLabel: '옆면', instruction: '④ 고정: 윗면·아랫면을 밑면으로 정했어요. 옆면 4개를 모두 눌러요.', moa: '밑면 2개를 뺀 나머지예요.', hint: '앞·뒤·왼쪽·오른쪽 면이에요.',
      check: answer => checkFaceSet(lateralFaces('top', 'bottom'), answer, {extra: f => `${label(f)}은 밑면이에요.`, missing: '옆면이 더 있어요.'})},
    {kind: 'net-build', dims: FINAL_DIMS, base: piecesExcept(finalNet, 'right'), fixedBase: true, tray: [{w: 4, h: 2, count: 1}, {w: 2, h: 4, count: 1}, {w: 5, h: 2, count: 1}, {w: 4, h: 4, count: 1}], rotatable: true, blankLength: {piece: 'front', side: 'h', answer: 4}, instruction: '⑤ 포장: 전개도의 빠진 면을 붙이고 빈칸의 길이를 적어요.', moa: '전개도의 점선은 접는 선이에요.', hint: '빠진 면은 왼쪽 면과 마주 보는 오른쪽 면이에요. 4×2 조각이에요.',
      check(answer, ctx) {
        const r = checkRectNet(FINAL_DIMS, answer, ctx);
        if (!r.ok) return r;
        if (String(answer?.values?.blank ?? '').trim() !== '4') return no('빈칸의 길이는 상자의 세로 4cm예요. 마주 보는 면과 같아요.', ['blank']);
        return ok();
      }}
  ],
  summary: '입체 → 겨냥도 → 전개도로 같은 상자를 확인했어요. 네가 확인한 면, 선, 점 덕분에 안전하게 도착했어요.'
};

export const CONTENT = {
  id: 'box-delivery', title: '상자 배송 대작전',
  workshops: [workshop1, workshop2, workshop3, workshop4, workshop5, workshop6],
  final: finalDelivery,
  opening: [
    {speaker: '모아', text: '마을 축제 전날인데 물류센터의 상자가 뒤섞이고 출고판이 멈췄어요. 모양표가 뒤섞였어요!'},
    {speaker: '모아', text: '새 배송 기사님, 상자를 살펴보고 딱 맞게 포장해 줄래요? 천천히 해도 괜찮아요.'},
    {speaker: '모아', text: '작업장 여섯 곳이 차례로 불을 켤 거예요. 먼저 분류대로 가요. 길 위의 점을 따라가면 돼요.'}
  ],
  conceptRecord: [
    {workshop: 0, label: '직육면체·정육면체 분류'}, {workshop: 1, label: '면·모서리·꼭짓점'}, {workshop: 2, label: '겨냥도'},
    {workshop: 3, label: '평행·수직·밑면·옆면'}, {workshop: 4, label: '정육면체 전개도'}, {workshop: 5, label: '직육면체 전개도'}
  ]
};
export function findActivity(id) {
  for (const w of CONTENT.workshops) {
    const m = [...w.missions, ...w.reviews].find(a => a.id === id);
    if (m) return {activity: m, workshop: w};
  }
  if (id === CONTENT.final.id) return {activity: CONTENT.final, workshop: null};
  return null;
}
