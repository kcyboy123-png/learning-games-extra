// Framework-independent lesson progression. Choice clicks do not alter this state.
export function shuffled(items, random = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function validateConfig(config) {
  if (!config.id || !config.chapters?.length) throw Error('Game id and chapters required');
  const ids = new Set();
  for (const chapter of config.chapters) {
    if (!chapter.id || ids.has(chapter.id)) throw Error('Duplicate/missing chapter id');
    ids.add(chapter.id);
    if (!chapter.missions?.length || !chapter.review?.length) throw Error('Missions and review required');
    for (const q of [...chapter.missions, ...chapter.review]) {
      if (!q.id || ids.has(q.id)) throw Error('Duplicate/missing activity id');
      ids.add(q.id);
      const optionIds = q.options.map(o => o.id);
      if (optionIds.length !== 4 || new Set(optionIds).size !== 4 || !optionIds.includes(q.answer)) {
        throw Error(`Invalid four-choice question: ${q.id}`);
      }
      if (!q.explanation) throw Error(`Missing learning summary: ${q.id}`);
    }
  }
  return config;
}

export function createJourney(config, saved = null) {
  validateConfig(config);
  const rules = {start:1000, mission:10, review:10, wrong:-10, hint:-3, ...config.scoring};
  let state = {version:1, gameId:config.id, chapter:0, completed:[], review:[], events:[]};
  function chapter() { return config.chapters[state.chapter]; }
  function score() { return rules.start + state.events.reduce((sum,e) => sum + e.points, 0); }
  function stage() {
    if (state.chapter >= config.chapters.length) return 'ending';
    if (chapter().missions.some(m => !state.completed.includes(m.id))) return 'mission';
    return chapter().review.some(q => !state.review.includes(q.id)) ? 'review' : 'chapter-complete';
  }
  function current() {
    if (stage() === 'mission') return chapter().missions.find(m => !state.completed.includes(m.id));
    if (stage() === 'review') return chapter().review.find(q => !state.review.includes(q.id));
    return null;
  }
  function event(kind, points, activity, id) {
    if (state.events.some(e => e.id === id)) return false;
    state.events.push({id, kind, points, activity}); return true;
  }
  const api = {
    snapshot: () => structuredClone(state), score, stage, current,
    chapter: () => state.chapter,
    submit(activityId, answerId, attemptId) {
      const q = current();
      if (!q || q.id !== activityId || !q.options.some(o => o.id === answerId)) return {accepted:false};
      if (typeof attemptId !== 'string' || !attemptId || attemptId.length > 100) return {accepted:false};
      if (state.events.some(e => e.id === attemptId)) return {accepted:false};
      const correct = q.answer === answerId;
      const reviewing = stage() === 'review';
      event(correct ? 'success' : 'wrong', correct ? rules[reviewing ? 'review' : 'mission'] : rules.wrong, q.id, attemptId);
      if (correct) (reviewing ? state.review : state.completed).push(q.id);
      return {accepted:true, correct, explanation:q.explanation, score:score()};
    },
    hint(activityId, requestId) {
      const q = current();
      if (!q || q.id !== activityId || !q.hint || typeof requestId !== 'string' || !requestId) return null;
      if (!event('hint', rules.hint, q.id, requestId)) return null;
      return q.hint;
    },
    nextChapter() {
      if (stage() !== 'chapter-complete') return false;
      state.chapter++; return true;
    },
    title() {
      return [...(config.titles || [])].sort((a,b) => b.min-a.min).find(t => score() >= t.min)?.name || '새싹 탐험가';
    }
  };
  // Saves are only local classroom convenience, not tamper-proof leaderboard data.
  // Replay valid events, so partial/corrupted data cannot unlock later missions.
  if (saved?.version === 1 && saved.gameId === config.id && Array.isArray(saved.events)) {
    for (const e of saved.events.slice(0, 20000)) {
      if (stage() === 'chapter-complete' && state.chapter < saved.chapter) api.nextChapter();
      const q = current();
      if (!q || q.id !== e.activity || typeof e.id !== 'string') break;
      if (e.kind === 'hint') api.hint(q.id, e.id);
      else if (e.kind === 'success') api.submit(q.id, q.answer, e.id);
      else if (e.kind === 'wrong') api.submit(q.id, q.options.find(o => o.id !== q.answer).id, e.id);
    }
    if (stage() === 'chapter-complete' && state.chapter < saved.chapter) api.nextChapter();
  }
  return api;
}

export function loadJourney(config, storage) {
  try { return createJourney(config, JSON.parse(storage.getItem(`changyong:${config.id}:v1`))); }
  catch { return createJourney(config); }
}
export function saveJourney(config, journey, storage) {
  try { storage.setItem(`changyong:${config.id}:v1`, JSON.stringify(journey.snapshot())); return true; }
  catch { return false; }
}
