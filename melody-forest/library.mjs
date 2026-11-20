import { validateSong, songParts } from './core.mjs?v=20261120-review25b';

// Kept works live beside, never inside, the current-song key. A broken or full store is reported, never replaced.
export const LEGACY_LIBRARY_KEY = 'changyong-eight-bars-library-v1';
export const PREVIOUS_LIBRARY_KEY = 'changyong-eight-bars-library-v2';
export const LIBRARY_KEY = 'changyong-eight-bars-library-v3';
export const LEGACY_DRAFT_KEY = 'changyong-eight-bars-v1';
export const PREVIOUS_DRAFT_KEY = 'changyong-eight-bars-v2';
export const DRAFT_KEY = 'changyong-eight-bars-v3';
const BROKEN = '작품 저장소를 읽지 못했어요. 보관한 작품은 지우지 않았어요.';
const FULL = '저장 공간이 모자라 보관하지 못했어요. 작품 파일로 저장해 주세요.';
const text = song => JSON.stringify(validateSong(song));

export const isEmptySong = song => songParts(song).every(part => part.bars.every(bar => !bar.length));

// Every work comes back as a fresh validated copy, so editing an opened song never touches the store.
function parse(raw, version) {
  if (raw === null) return [];
  try {
    const value = JSON.parse(raw);
    if (value?.version !== version || !Array.isArray(value.works)) throw Error();
    const ids = new Set();
    return value.works.map(work => {
      if (typeof work?.id !== 'string' || !/^[\w-]{1,40}$/.test(work.id) || ids.has(work.id) || typeof work.savedAt !== 'string' || Number.isNaN(Date.parse(work.savedAt))) throw Error();
      ids.add(work.id);
      return { id: work.id, savedAt: work.savedAt, song: validateSong(work.song) };
    });
  } catch { throw new Error(BROKEN); }
}
export const readLibrary = storage => [
  ...parse(storage.getItem(LEGACY_LIBRARY_KEY), 1).map(work => ({...work, id: 'legacy-' + work.id})),
  ...parse(storage.getItem(PREVIOUS_LIBRARY_KEY), 2).map(work => ({...work, id: 'v2-' + work.id})),
  ...parse(storage.getItem(LIBRARY_KEY), 3),
];

export function readDraft(storage) {
  const raw = storage.getItem(DRAFT_KEY) ?? storage.getItem(PREVIOUS_DRAFT_KEY) ?? storage.getItem(LEGACY_DRAFT_KEY);
  return raw === null ? null : validateSong(JSON.parse(raw));
}

export function saveDraft(storage, song) {
  // Leave an unreadable draft intact so exporting the current work cannot destroy recovery data.
  const previous = storage.getItem(DRAFT_KEY);
  if (previous !== null) validateSong(JSON.parse(previous));
  storage.setItem(DRAFT_KEY, text(song));
}

// Compare inside the shared lock: serialization alone would still let a stale tab overwrite a newer draft.
export function createDraftSaver(storage, locks = globalThis.navigator?.locks) {
  let previous = storage.getItem(DRAFT_KEY);
  return song => {
    const snapshot = validateSong(song);
    return withLibraryLock(() => {
      if (storage.getItem(DRAFT_KEY) !== previous) throw Object.assign(new Error('다른 창에서 먼저 저장했어요. 이 창의 작품은 파일로 보관해 주세요.'), {code: 'DRAFT_CONFLICT'});
      saveDraft(storage, snapshot);
      previous = text(snapshot);
    }, locks);
  };
}

// Tabs share one store; the browser lock lets only one tab read-add-write at a time.
export function withLibraryLock(task, locks = globalThis.navigator?.locks) {
  return locks?.request ? locks.request(LIBRARY_KEY, () => task()) : Promise.reject(new Error('이 브라우저에서는 안전하게 보관할 수 없어요. 작품 파일로 저장해 주세요.'));
}

// An explicit snapshot: re-read first so another tab's works stay, and the same song is kept only once.
export function keepSong(storage, song, now = new Date()) {
  const same = text(song);
  for (let tries = 0; tries < 3; tries++) {
    const raw = storage.getItem(LIBRARY_KEY), works = parse(raw, 3), kept = readLibrary(storage).find(work => text(work.song) === same);
    if (kept) return { work: kept, duplicate: true };
    const work = { id: `n${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 7)}`, savedAt: now.toISOString(), song: validateSong(song) };
    // Another tab kept a work after our read: start over rather than write its work away.
    if (storage.getItem(LIBRARY_KEY) !== raw) continue;
    try { storage.setItem(LIBRARY_KEY, JSON.stringify({ version: 3, works: [...works, work] })); } catch { throw new Error(FULL); }
    return { work, duplicate: false };
  }
  throw new Error('다른 창에서 저장소를 쓰는 중이에요. 잠시 뒤 다시 보관해 주세요.');
}

// Opening keeps an unsaved current song first; if that fails nothing is opened, so the current song is never lost.
export function openWork(storage, current, id) {
  const work = readLibrary(storage).find(item => item.id === id);
  if (!work) throw new Error('보관한 작품을 찾지 못했어요. 저장소를 다시 열어 주세요.');
  if (!isEmptySong(current)) keepSong(storage, current);
  return work.song;
}
