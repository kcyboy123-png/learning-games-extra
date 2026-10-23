// 몽실이의 뽑기 심부름 · 상태와 추첨 로직 (DOM 없음, 브라우저와 Node 공용)
// 모든 함수는 새 상태를 돌려주고 입력 상태를 바꾸지 않는다.
export const STORAGE_KEY = 'animal-number-pong-v1';
export const LIMITS = Object.freeze({ totalMin: 1, totalMax: 100, countMin: 1, countMax: 5, historyMax: 1000 });
export const DEFAULT_CONFIG = Object.freeze({ total: 30, excluded: [], count: 1, unique: true });

const defaultFill = buffer => globalThis.crypto.getRandomValues(buffer);

// 0 이상 n 미만의 정수를 편향 없이 고른다 (rejection sampling).
export function randomBelow(n, fill = defaultFill) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('n은 1 이상의 정수여야 해요');
  if (n === 1) return 0;
  const range = 0x100000000;
  const limit = range - (range % n);
  const buffer = new Uint32Array(1);
  do { fill(buffer); } while (buffer[0] >= limit);
  return buffer[0] % n;
}

// pool에서 count개를 중복 없이 고른다. pool이 부족하면 있는 만큼만 돌려준다.
export function pickNumbers(pool, count, random = randomBelow) {
  const rest = pool.slice();
  const out = [];
  while (out.length < count && rest.length) out.push(rest.splice(random(rest.length), 1)[0]);
  return out;
}

export function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const { total, count } = raw;
  if (!Number.isInteger(total) || total < LIMITS.totalMin || total > LIMITS.totalMax) return null;
  if (!Number.isInteger(count) || count < LIMITS.countMin || count > LIMITS.countMax) return null;
  if (!Array.isArray(raw.excluded)) return null;
  if (raw.excluded.some(n => !Number.isInteger(n) || n < 1 || n > total)) return null;
  const excluded = [...new Set(raw.excluded)].sort((a, b) => a - b);
  return { total, count, unique: raw.unique !== false, excluded };
}

export function configEquals(a, b) {
  return a.total === b.total && a.count === b.count && a.unique === b.unique
    && a.excluded.length === b.excluded.length && a.excluded.every((n, i) => n === b.excluded[i]);
}

export function createState(config = DEFAULT_CONFIG, prefs = {}) {
  const normalized = normalizeConfig(config);
  if (!normalized) throw new Error('잘못된 설정이에요');
  return { version: 1, config: normalized, prefs: { fast: prefs?.fast === true }, history: [] };
}

export function drawnNumbers(state) {
  const drawn = new Set();
  for (const entry of state.history) for (const n of entry.numbers) drawn.add(n);
  return drawn;
}

export function availableNumbers(state) {
  const excluded = new Set(state.config.excluded);
  const drawn = state.config.unique ? drawnNumbers(state) : new Set();
  const out = [];
  for (let n = 1; n <= state.config.total; n++) if (!excluded.has(n) && !drawn.has(n)) out.push(n);
  return out;
}

// ok=false면 reason: 'all-excluded' | 'exhausted'. short=true면 남은 인원이 count보다 적다.
export function drawStatus(state) {
  const pool = availableNumbers(state);
  if (state.config.excluded.length >= state.config.total) return { ok: false, reason: 'all-excluded', pool, count: 0, short: false };
  if (!pool.length) return { ok: false, reason: 'exhausted', pool, count: 0, short: false };
  const count = Math.min(state.config.count, pool.length);
  return { ok: true, reason: null, pool, count, short: pool.length < state.config.count };
}

// 결과는 여기서 확정된다. 연출 전에 먼저 저장할 수 있도록 revealed=false로 기록한다.
export function draw(state, random = randomBelow, now = Date.now()) {
  const status = drawStatus(state);
  if (!status.ok) return { state, entry: null, reason: status.reason };
  const entry = { numbers: pickNumbers(status.pool, status.count, random), at: now, revealed: false };
  let history = [...state.history, entry];
  if (!state.config.unique && history.length > LIMITS.historyMax) history = history.slice(-LIMITS.historyMax);
  return { state: { ...state, history }, entry, reason: null };
}

export function revealLast(state) {
  const last = state.history[state.history.length - 1];
  if (!last || last.revealed) return state;
  return { ...state, history: [...state.history.slice(0, -1), { ...last, revealed: true }] };
}

// 마지막 뽑기를 통째로 되돌린다. 되돌린 항목을 함께 돌려준다.
export function undo(state) {
  if (!state.history.length) return { state, entry: null };
  const entry = state.history[state.history.length - 1];
  return { state: { ...state, history: state.history.slice(0, -1) }, entry };
}

export function resetHistory(state) {
  return { ...state, history: [] };
}

// 설정이 실제로 바뀌면 기록을 비운다. 같으면 상태를 그대로 돌려준다. 잘못된 설정이면 null.
export function applyConfig(state, raw) {
  const config = normalizeConfig(raw);
  if (!config) return null;
  if (configEquals(config, state.config)) return state;
  return { ...state, config, history: [] };
}

export function setPrefs(state, prefs) {
  return { ...state, prefs: { ...state.prefs, ...prefs } };
}

export function serialize(state) {
  return JSON.stringify({ version: 1, config: state.config, prefs: state.prefs, history: state.history });
}

function sanitizeHistory(raw, config) {
  if (!Array.isArray(raw)) return null;
  const excluded = new Set(config.excluded);
  const seen = new Set();
  const history = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || !Array.isArray(item.numbers)) return null;
    if (item.numbers.length < 1 || item.numbers.length > LIMITS.countMax) return null;
    const inRound = new Set();
    for (const n of item.numbers) {
      if (!Number.isInteger(n) || n < 1 || n > config.total || excluded.has(n) || inRound.has(n)) return null;
      if (config.unique && seen.has(n)) return null;
      inRound.add(n); seen.add(n);
    }
    history.push({ numbers: item.numbers.slice(), at: Number.isFinite(item.at) ? item.at : 0, revealed: true });
  }
  return history.slice(-LIMITS.historyMax);
}

// 손상된 저장은 null. 설정은 멀쩡한데 기록만 이상하면 기록을 비우고 설정은 살린다.
// 연출 중 종료된(revealed=false) 결과는 복원 시 공개된 것으로 확정한다.
export function restore(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  let data;
  try { data = JSON.parse(raw); } catch { return null; }
  if (!data || typeof data !== 'object' || data.version !== 1) return null;
  const config = normalizeConfig(data.config);
  if (!config) return null;
  const state = createState(config, data.prefs && typeof data.prefs === 'object' ? data.prefs : {});
  const history = sanitizeHistory(data.history, config);
  return history ? { ...state, history } : state;
}

export function loadState(storage) {
  try { return restore(storage?.getItem(STORAGE_KEY)); } catch { return null; }
}

// 번호퐁 규칙(1명·중복 없음·제외 없음)과 다른 저장은 범위만 살려 새 판으로 연다.
// 그대로 쓰면 여러 명이 뽑혀 하나만 보이거나, 전체 제외로 발사가 멈출 수 있다.
export function loadPongState(storage) {
  const saved = loadState(storage);
  if (!saved) return createState();
  const { total, count, unique, excluded } = saved.config;
  return count === 1 && unique && !excluded.length ? saved : createState({ ...DEFAULT_CONFIG, total });
}

export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, serialize(state)); return true; } catch { return false; }
}
