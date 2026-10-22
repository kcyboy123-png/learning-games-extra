import { PITCHES, clone, used, isChordTone, chordAt } from './core.mjs';

// Pure editing steps: every operation returns { song } or { error } and never mutates its input.
export const LENGTHS = { 1: '반 박', 2: '1박', 4: '2박', 8: '4박' };
export const register = midi => midi >= 84 ? '더 높은' : midi >= 72 ? '높은' : '낮은';
export const allowedPitches = (song, bar) => PITCHES.filter(p => song.free || isChordTone(p.midi, chordAt(song, bar)));
const isAllowed = (song, bar, pitch) => allowedPitches(song, bar).some(p => p.midi === pitch);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const NOT_GUIDE = '파란 음부터 골라 보세요. 다른 음은 자유롭게 만들기를 켜면 사용할 수 있어요.';

function edit(song, fn) {
  const next = clone(song);
  const error = fn(next);
  return error ? { error } : { song: next };
}

export function createHistory(limit = 60) {
  return { past: [], future: [], limit };
}

// Record the state before a successful edit. A new edit always clears redo.
export function commit(history, song) {
  history.past.push(clone(song));
  if (history.past.length > history.limit) history.past.shift();
  history.future.length = 0;
}

export function undo(history, song) {
  if (!history.past.length) return null;
  history.future.push(clone(song));
  return history.past.pop();
}

export function redo(history, song) {
  if (!history.future.length) return null;
  history.past.push(clone(song));
  return history.future.pop();
}

export function addNote(song, bar, pitch, ticks) {
  return edit(song, next => {
    if (![1, 2, 4, 8].includes(ticks)) return '음표 길이를 다시 골라 주세요.';
    if (pitch !== null && !PITCHES.some(p => p.midi === pitch)) return '다장조 건반의 음만 넣을 수 있어요.';
    if (pitch !== null && !isAllowed(song, bar, pitch)) return NOT_GUIDE;
    if (used(next.bars[bar]) + ticks > 8) return '이 마디에 남은 박보다 길어요. 짧은 음표를 고르거나 다음 마디를 눌러요.';
    next.bars[bar].push({ pitch, ticks });
  });
}

export function setNoteTicks(song, bar, index, ticks) {
  return edit(song, next => {
    const notes = next.bars[bar], note = notes?.[index];
    if (!note || ![1, 2, 4, 8].includes(ticks)) return '바꿀 음표를 다시 골라 주세요.';
    if (note.ticks === ticks) return '이미 그 길이예요.';
    if (used(notes) - note.ticks + ticks > 8) return '마디에 자리가 모자라요. 다른 음표는 그대로 두었어요. 뒤 음표를 줄이거나 지운 뒤 늘려 보세요.';
    note.ticks = ticks;
  });
}

export function setNotePitch(song, bar, index, pitch) {
  return edit(song, next => {
    const note = next.bars[bar]?.[index];
    if (!note || note.pitch === null) return '쉼표는 높이를 바꿀 수 없어요.';
    if (!isAllowed(song, bar, pitch)) return NOT_GUIDE;
    if (note.pitch === pitch) return '이미 그 음이에요.';
    note.pitch = pitch;
  });
}

// Move to the next usable pitch: chord tones in guided mode, every C major key in free mode.
export function shiftNote(song, bar, index, direction) {
  const note = song.bars[bar]?.[index];
  if (!note || note.pitch === null) return { error: '쉼표는 높이를 바꿀 수 없어요.' };
  const options = allowedPitches(song, bar).map(p => p.midi);
  const target = direction > 0 ? options.find(m => m > note.pitch) : options.findLast(m => m < note.pitch);
  if (target === undefined) return { error: direction > 0 ? '더 높일 수 있는 음이 없어요.' : '더 낮출 수 있는 음이 없어요.' };
  return setNotePitch(song, bar, index, target);
}

export function deleteNote(song, bar, index) {
  return edit(song, next => {
    if (!next.bars[bar]?.[index]) return '지울 음표를 다시 골라 주세요.';
    next.bars[bar].splice(index, 1);
  });
}

export function pasteBar(song, bar, clip) {
  return edit(song, next => {
    if (!Array.isArray(clip) || !clip.length || used(clip) > 8) return '먼저 붙여 넣을 마디를 복사해 주세요.';
    if (same(next.bars[bar], clip)) return '이미 같은 음표가 들어 있어요.';
    next.bars[bar] = clone(clip);
  });
}
