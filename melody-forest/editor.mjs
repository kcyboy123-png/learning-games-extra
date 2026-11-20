import { PITCHES, clone, used, isChordTone, chordAt, editableSong, partBars, firstPart, emptyBars, complete, songParts } from './core.mjs?v=20261120-refine36';
import {instrumentById} from './instruments.mjs?v=20261120-refine36';

// Pure editing steps: every operation returns { song } or { error } and never mutates its input.
export const LENGTHS = { 1: '반 박', 2: '1박', 3: '1.5박', 4: '2박', 8: '4박' };
export const register = midi => midi >= 84 ? '더 높은' : midi >= 72 ? '높은' : '낮은';
export const allowedPitches = (song, bar) => PITCHES.filter(p => song.free || isChordTone(p.midi, chordAt(song, bar)));
const isAllowed = (song, bar, pitch) => allowedPitches(song, bar).some(p => p.midi === pitch);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const NOT_GUIDE = '초록 점이 있는 음부터 골라 보세요. 다른 흰 건반은 모든 음 사용을 켜면 쓸 수 있어요.';

function edit(song, instrument, fn) {
  instrument ??= firstPart(song);
  if (!instrumentById(instrument)) return {error: '편집할 악기를 다시 골라 주세요.'};
  const next = editableSong(song);
  let part = next.parts.find(part => part.instrument === instrument);
  if (!part) { part = {instrument, bars: emptyBars()}; next.parts.push(part); }
  const error = fn(part);
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

// Keep undo/redo focused on a changed measure, including edits in another part.
export function historyBar(before,after,instrument,currentBar){
 const oldBars=partBars(before,instrument),newBars=partBars(after,instrument);
 const changed=Array.from({length:8},(_,bar)=>bar).filter(bar=>!same(oldBars[bar],newBars[bar]));
 return changed.includes(currentBar)?currentBar:changed[0]??null;
}

export function addNote(song, bar, pitch, ticks, instrument) {
  return edit(song, instrument, next => {
    if (![1, 2, 3, 4, 8].includes(ticks)) return '음표 길이를 다시 골라 주세요.';
    if (pitch !== null && !PITCHES.some(p => p.midi === pitch)) return '표시된 흰 건반의 음만 넣을 수 있어요.';
    if (pitch !== null && !isAllowed(song, bar, pitch)) return NOT_GUIDE;
    if (used(next.bars[bar]) + ticks > 8) return '이 마디에 남은 박보다 길어요. 짧은 음표를 고르거나 다음 마디를 눌러요.';
    next.bars[bar].push({ pitch, ticks });
  });
}

export function setNoteTicks(song, bar, index, ticks, instrument) {
  return edit(song, instrument, next => {
    const notes = next.bars[bar], note = notes?.[index];
    if (!note || ![1, 2, 3, 4, 8].includes(ticks)) return '바꿀 음표를 다시 골라 주세요.';
    if (note.ticks === ticks) return '이미 그 길이예요.';
    if (used(notes) - note.ticks + ticks > 8) return '마디에 자리가 모자라요. 다른 음표는 그대로 두었어요. 뒤 음표를 줄이거나 지운 뒤 늘려 보세요.';
    note.ticks = ticks;
  });
}

export function setNotePitch(song, bar, index, pitch, instrument) {
  return edit(song, instrument, next => {
    const note = next.bars[bar]?.[index];
    if (!note) return '바꿀 음표를 다시 골라 주세요.';
    if (pitch !== null && !isAllowed(song, bar, pitch)) return NOT_GUIDE;
    if (note.pitch === pitch) return '이미 그 음이에요.';
    note.pitch = pitch;
  });
}

// Move to the next usable pitch: chord tones in guided mode, every C major key in free mode.
export function shiftNote(song, bar, index, direction, instrument = firstPart(song)) {
  const note = partBars(song, instrument)[bar]?.[index];
  if (!note || note.pitch === null) return { error: '쉼표는 높이를 바꿀 수 없어요.' };
  const options = allowedPitches(song, bar).map(p => p.midi);
  const target = direction > 0 ? options.find(m => m > note.pitch) : options.findLast(m => m < note.pitch);
  if (target === undefined) return { error: direction > 0 ? '더 높일 수 있는 음이 없어요.' : '더 낮출 수 있는 음이 없어요.' };
  return setNotePitch(song, bar, index, target, instrument);
}

export function deleteNote(song, bar, index, instrument) {
  return edit(song, instrument, next => {
    if (!next.bars[bar]?.[index]) return '지울 음표를 다시 골라 주세요.';
    next.bars[bar].splice(index, 1);
  });
}

export function pasteBar(song, bar, clip, instrument) {
  return edit(song, instrument, next => {
    if (!Array.isArray(clip) || !clip.length || used(clip) > 8) return '먼저 붙여 넣을 마디를 복사해 주세요.';
    if(instrument==='shaker'&&clip.some(n=>n.ticks!==1||(n.pitch!==60&&n.pitch!==null)))return '셰이커 박자만 붙여 넣을 수 있어요.';
    if (same(next.bars[bar], clip)) return '이미 같은 음표가 들어 있어요.';
    next.bars[bar] = clone(clip);
  });
}

export function clearPart(song, instrument) {
  return edit(song, instrument, part => { part.bars = emptyBars(); });
}

export function toggleShaker(song, bar, slot) {
  if(!Number.isInteger(bar)||bar<0||bar>7||!Number.isInteger(slot)||slot<0||slot>7)return {error:'박자를 다시 골라 주세요.'};
  return edit(song,'shaker',part=>{
    const notes=Array.from({length:8},(_,i)=>part.bars[bar][i]??{pitch:null,ticks:1});
    notes[slot]={pitch:notes[slot].pitch===null?60:null,ticks:1};part.bars[bar]=notes;
  });
}

// Continue only when the child asks; never fill or advance their score automatically.
export function nextOpenBar(song,instrument,current){
 const bars=partBars(song,instrument);
 for(let step=1;step<=8;step++){const index=(current+step)%8;if(used(bars[index])<8)return index;}
 return -1;
}

export function soloPart(song,instrument){
 const result=structuredClone(song);result.parts=[{instrument,bars:structuredClone(partBars(song,instrument))}];result.accompaniment=false;return result;
}

export function completionTarget(song){
 if(complete(song))return null;
 const best=songParts(song).reduce((a,b)=>b.bars.filter(bar=>used(bar)===8).length>a.bars.filter(bar=>used(bar)===8).length?b:a),bar=best.bars.findIndex(b=>used(b)<8);
 return {instrument:best.instrument,bar:Math.max(0,bar),needsSound:bar<0};
}

export function repeatIntoEmpty(song,instrument,bar){
 const bars=partBars(song,instrument);if(!bars[bar]?.length)return {error:'먼저 한 마디를 만들어 주세요.'};
 for(let step=1;step<8;step++){
  const target=(bar+step)%8;if(bars[target].length)continue;
  const result=pasteBar(song,target,bars[bar],instrument);return result.error?result:{...result,bar:target};
 }
 return {error:'빈 마디가 없어요. 만든 음표는 그대로 두었어요.'};
}

export function clearMeasure(song,instrument,bar){
 if(!Number.isInteger(bar)||bar<0||bar>7)return {error:'비울 마디를 다시 골라 주세요.'};
 if(!partBars(song,instrument)[bar].length)return {error:'이미 빈 마디예요.'};
 return edit(song,instrument,part=>{part.bars[bar]=[];});
}
