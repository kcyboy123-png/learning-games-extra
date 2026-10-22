import { validateSong } from './core.mjs';

// Kept works live beside, never inside, the current-song key. A broken or full store is reported, never replaced.
export const LIBRARY_KEY = 'changyong-eight-bars-library-v1';
const BROKEN = '작품 저장소를 읽지 못했어요. 보관한 작품은 지우지 않았어요.';
const FULL = '저장 공간이 모자라 보관하지 못했어요. 작품 파일로 저장해 주세요.';
const text = song => JSON.stringify(validateSong(song));

export const isEmptySong = song => song.bars.every(bar => !bar.length);

// Every work comes back as a fresh validated copy, so editing an opened song never touches the store.
function parse(raw) {
  if (raw === null) return [];
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.works)) throw Error();
    const ids = new Set();
    return value.works.map(work => {
      if (typeof work?.id !== 'string' || !/^[\w-]{1,40}$/.test(work.id) || ids.has(work.id) || typeof work.savedAt !== 'string' || Number.isNaN(Date.parse(work.savedAt))) throw Error();
      ids.add(work.id);
      return { id: work.id, savedAt: work.savedAt, song: validateSong(work.song) };
    });
  } catch { throw new Error(BROKEN); }
}
export const readLibrary = storage => parse(storage.getItem(LIBRARY_KEY));

// Tabs share one store; the browser lock lets only one tab read-add-write at a time.
export function withLibraryLock(task, locks = globalThis.navigator?.locks) {
  return locks?.request ? locks.request(LIBRARY_KEY, () => task()) : Promise.reject(new Error('이 브라우저에서는 안전하게 보관할 수 없어요. 작품 파일로 저장해 주세요.'));
}

// An explicit snapshot: re-read first so another tab's works stay, and the same song is kept only once.
export function keepSong(storage, song, now = new Date()) {
  const same = text(song);
  for (let tries = 0; tries < 3; tries++) {
    const raw = storage.getItem(LIBRARY_KEY), works = parse(raw), kept = works.find(work => text(work.song) === same);
    if (kept) return { work: kept, duplicate: true };
    const work = { id: `w${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 7)}`, savedAt: now.toISOString(), song: validateSong(song) };
    // Another tab kept a work after our read: start over rather than write its work away.
    if (storage.getItem(LIBRARY_KEY) !== raw) continue;
    try { storage.setItem(LIBRARY_KEY, JSON.stringify({ version: 1, works: [...works, work] })); } catch { throw new Error(FULL); }
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
