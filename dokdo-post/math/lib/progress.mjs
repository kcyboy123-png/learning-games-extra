// 진행·점수·저장. 화면과 무관한 순수 상태 기계.
// 활동 순서: 작업장1 미션4 → 복습3 → 작업장2 … → 작업장6 복습3 → 종합 배송.
// 점수: 시작 1000, 첫 성공 +10(핵심24·복습18·종합1), 오답 제출 -10, 요청 힌트 -3(활동당 1회) → 최대 1430.
export const SAVE_KEY = 'box-delivery:progress:v1';
export const SETTINGS_KEY = 'box-delivery:settings:v1';
export const RULES = {start: 1000, success: 10, wrong: -10, hint: -3};

export function activityList(content) {
  const list = [];
  content.workshops.forEach((w, wi) => {
    w.missions.forEach(m => list.push({id: m.id, kind: 'mission', workshop: wi, title: m.title}));
    w.reviews.forEach(r => list.push({id: r.id, kind: 'review', workshop: wi, title: r.title}));
  });
  list.push({id: content.final.id, kind: 'final', workshop: content.workshops.length, title: content.final.title});
  return list;
}

export function createProgress(content, saved = null, rules = RULES) {
  const activities = activityList(content);
  const index = Object.fromEntries(activities.map((a, i) => [a.id, i]));
  const state = {version: 1, gameId: content.id, events: [], extra: {}};
  const completed = new Set();
  const hinted = new Set();
  const lastWrong = {};
  const wrongCount = {};

  function current() { return activities.find(a => !completed.has(a.id)) || null; }
  function score() { return rules.start + state.events.reduce((s, e) => s + e.points, 0); }
  function hasEvent(id) { return state.events.some(e => e.id === id); }
  function push(e) { state.events.push(e); return e; }
  function validId(id) { return typeof id === 'string' && id.length > 0 && id.length <= 100 && !hasEvent(id); }

  const api = {
    activities,
    current,
    score,
    isComplete: id => completed.has(id),
    completedIds: () => [...completed],
    snapshot: () => structuredClone(state),
    wrongCount: id => wrongCount[id] || 0,
    hinted: id => hinted.has(id),
    setExtra(key, value) { state.extra[key] = structuredClone(value); },
    getExtra(key) { return state.extra[key]; },
    // 작업장 i의 미션·복습이 모두 끝났으면 도장.
    workshopDone(wi) { return activities.filter(a => a.workshop === wi && a.kind !== 'final').every(a => completed.has(a.id)); },
    stamps() { return content.workshops.map((_, i) => api.workshopDone(i)).filter(Boolean).length; },
    finalDone: () => completed.has(content.final.id),
    stage() {
      const c = current();
      if (!c) return {type: 'ending', activity: null, workshop: content.workshops.length};
      return {type: c.kind, activity: c, workshop: c.workshop};
    },
    // 성공은 현재 활동에 대해서만, 첫 번째만 보상.
    success(activityId, eventId) {
      const c = current();
      if (!c || c.id !== activityId || !validId(eventId)) return {accepted: false};
      completed.add(activityId);
      push({id: eventId, kind: 'success', activity: activityId, points: rules.success});
      return {accepted: true, score: score()};
    },
    // 같은 오답(signature)을 연달아 다시 내면 감점하지 않는다.
    wrong(activityId, eventId, signature = '') {
      const c = current();
      if (!c || c.id !== activityId || !validId(eventId)) return {accepted: false};
      const repeated = lastWrong[activityId] !== undefined && lastWrong[activityId] === signature;
      lastWrong[activityId] = signature;
      wrongCount[activityId] = (wrongCount[activityId] || 0) + 1;
      push({id: eventId, kind: 'wrong', activity: activityId, points: repeated ? 0 : rules.wrong, signature});
      return {accepted: true, repeated, score: score()};
    },
    // 힌트는 활동당 한 번만 감점. 이후 같은 힌트는 무료.
    hint(activityId, eventId) {
      const c = current();
      if (!c || c.id !== activityId) return {accepted: false, charged: false};
      if (hinted.has(activityId)) return {accepted: true, charged: false};
      if (!validId(eventId)) return {accepted: false, charged: false};
      hinted.add(activityId);
      push({id: eventId, kind: 'hint', activity: activityId, points: rules.hint});
      return {accepted: true, charged: true, score: score()};
    },
    title() { return api.finalDone() ? '믿음직한 배송 기사' : api.stamps() >= 3 ? '성실한 배송 기사' : '새내기 배송 기사'; },
    maxScore: () => rules.start + activities.length * rules.success
  };

  // 저장본은 이벤트를 순서대로 다시 적용해서 복원한다. 깨진 항목부터는 무시한다.
  if (saved && typeof saved === 'object' && saved.version === 1 && saved.gameId === content.id && Array.isArray(saved.events)) {
    for (const e of saved.events.slice(0, 50000)) {
      if (!e || typeof e !== 'object' || typeof e.id !== 'string' || typeof e.activity !== 'string') break;
      if (index[e.activity] === undefined) break;
      const c = current();
      if (!c || c.id !== e.activity) break;
      if (e.kind === 'success') api.success(e.activity, e.id);
      else if (e.kind === 'wrong') api.wrong(e.activity, e.id, typeof e.signature === 'string' ? e.signature : '');
      else if (e.kind === 'hint') api.hint(e.activity, e.id);
      else break;
    }
    if (saved.extra && typeof saved.extra === 'object') state.extra = structuredClone(saved.extra);
  }
  return api;
}

// 저장소 입출력. 손상된 데이터는 corrupted로 알린다.
export function loadSaved(storage, key = SAVE_KEY) {
  if (!storage) return {data: null, corrupted: false, unavailable: true};
  let raw;
  try { raw = storage.getItem(key); } catch { return {data: null, corrupted: false, unavailable: true}; }
  if (raw === null || raw === undefined) return {data: null, corrupted: false};
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || data.version !== 1 || !Array.isArray(data.events)) return {data: null, corrupted: true};
    return {data, corrupted: false};
  } catch { return {data: null, corrupted: true}; }
}
export function saveProgress(storage, progress, key = SAVE_KEY) {
  if (!storage) return false;
  try { storage.setItem(key, JSON.stringify(progress.snapshot())); return true; } catch { return false; }
}
export function loadSettings(storage, key = SETTINGS_KEY) {
  try { const s = JSON.parse(storage.getItem(key)); return s && typeof s === 'object' ? s : {}; } catch { return {}; }
}
export function saveSettings(storage, settings, key = SETTINGS_KEY) {
  try { storage.setItem(key, JSON.stringify(settings)); return true; } catch { return false; }
}
// 오답 서명: 조각 id·배열 순서를 무시하고 실제 배치(좌표·치수)와 입력값만으로 만든다.
// 같은 오답을 다시 내면 추가 감점이 없도록 wrong()의 signature로 쓴다. 저장 형식은 바뀌지 않는다.
export function answerSignature(answer) {
  const norm = v => {
    if (Array.isArray(v)) {
      const items = v.map(norm);
      return items.slice().sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0));
    }
    if (v && typeof v === 'object') {
      const out = {};
      for (const k of Object.keys(v).sort()) { if (k === 'id' || k === 'fromTray') continue; out[k] = norm(v[k]); }
      return out;
    }
    return typeof v === 'string' ? v.trim() : v;
  };
  try { return JSON.stringify(norm(answer ?? {})); } catch { return String(answer); }
}
export function newEventId() {
  try { return crypto.randomUUID(); } catch { return `e-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}
