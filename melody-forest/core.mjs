import {instrumentById} from './instruments.mjs?v=20261120-film23';
import {FOREST_MAPS, forestMapFor} from './forest-state.mjs?v=20261120-film23';

export const PITCHES = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84]
  .map((midi, step) => ({ midi, name: ['도', '레', '미', '파', '솔', '라', '시'][step % 7], step }));

export const CHORDS = { C6:[0,4,7,9], G7:[7,11,2,5], C: [0, 4, 7], F: [5, 9, 0], G: [7, 11, 2], Am: [9, 0, 4], Dm: [2, 5, 9], Em: [4, 7, 11] };
export const PROGRESSIONS = [
  {id:'christmas-carol',name:'캐롤 만들기 · 종소리 화음',subtitle:'반복하는 가락과 G7 → C로 따뜻하게 마무리해요',style:'christmas',version:3,featured:true,chords:['C','C6','F','Dm','C','Am','G7','C']},
  {id:'christmas',name:'크리스마스 캐롤',subtitle:'도·파·솔 화음으로 만드는 경쾌한 캐롤',style:'christmas',version:3,featured:true,chords:['C','C','F','C','F','C','G','C']},
  { id: 'basic', name: '기본 피아노', subtitle: '차분한 피아노 위에 첫 가락을 놓아요', style: 'piano', featured: true, chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'] },
  { id: 'pop', name: '리듬 팝', subtitle: '경쾌한 리듬을 타고 노래해요', style: 'pop', featured: true, chords: ['C', 'G', 'Am', 'F', 'C', 'Am', 'G', 'C'] },
  { id: 'warm', name: '따뜻한 아르페지오', subtitle: '차례로 흐르는 화음에 마음을 담아요', style: 'warm', featured: true, chords: ['C', 'Am', 'F', 'G', 'Am', 'F', 'G', 'C'] },
  { id: 'dream', name: '별빛 오솔길', subtitle: '은은한 종소리 사이에 가락을 반짝여요', style: 'dream', featured: true, chords: ['C', 'Em', 'Am', 'G', 'F', 'C', 'Dm', 'G'] },
  { id: 'journey', name: '구름섬 여행', subtitle: '통통 튀는 마림바와 구름 위를 걸어요', style: 'journey', featured: true, chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G'] },
  { id: 'moon', name: '달에게 보내는 편지', subtitle: '긴 피아노 울림과 작은 종소리로 인사를', style: 'moon', featured: true, chords: ['Am', 'F', 'C', 'G', 'Dm', 'Am', 'G', 'C'] },
  { id: 'a-minor', name: '가단조 기본', subtitle: '라를 중심으로 흐르는 반주에 가락을 놓아요', style: 'minor', version: 2, featured: false, chords: ['Am', 'Dm', 'Am', 'Em', 'Am', 'Dm', 'Em', 'Am'] },
  { id: 'd-minor', name: '비 내리는 숲 · 라단조', subtitle: '레를 중심으로 차분하게 흐르는 반주예요', style: 'minor', version: 3, featured: false, chords: ['Dm', 'Am', 'Dm', 'F', 'Dm', 'C', 'Am', 'Dm'] },
  { id: 'walk', name: '햇살 산책', subtitle: '밝고 편안하게 걸어요', featured: false, chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'] },
  { id: 'letter', name: '마음의 편지', subtitle: '다정한 마음을 전해요', featured: false, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'G', 'C'] },
  { id: 'adventure', name: '작은 모험', subtitle: '새로운 길을 찾아가요', featured: false, chords: ['C', 'G', 'Am', 'F', 'C', 'F', 'G', 'C'] },
];

export function makeSong() {
  return { version: 3, title: '나의 첫 멜로디', progression: 'christmas-carol', bpm: 108, free: false, forestMap: 'christmas', accompaniment: true, parts: [{instrument: 'piano', bars: emptyBars()}] };
}

export const emptyBars = () => Array.from({length: 8}, () => []);
export const songParts = song => song.version === 3 ? song.parts : [{instrument: song.instrument, bars: song.bars}];
export const partBars = (song, instrument) => songParts(song).find(part => part.instrument === instrument)?.bars ?? emptyBars();
export const firstPart = song => (songParts(song).find(part => part.bars.some(bar => bar.length)) ?? songParts(song)[0]).instrument;
export const hasNotes = song => songParts(song).some(part => part.bars.some(bar => bar.some(note => note.pitch !== null)));
export const songForestMap = song => song.forestMap ?? forestMapFor(song.progression);
// Reading old works preserves their format; only an edit creates an ensemble copy.
export function editableSong(song) {
  const safe = validateSong(song);
  if (safe.version === 3) return safe;
  const {instrument, bars, ...rest} = safe;
  return {...rest, version: 3, forestMap: songForestMap(safe), accompaniment: true, parts: [{instrument, bars}]};
}

export const clone = value => structuredClone(value);
export const used = bar => bar.reduce((total, note) => total + note.ticks, 0);
export const isChordTone = (midi, chord) => Number.isInteger(midi) && !!CHORDS[chord]?.includes(((midi % 12) + 12) % 12);
export const chordAt = (song, i) => PROGRESSIONS.find(item => item.id === song.progression)?.chords[i];
export const complete = song => hasNotes(song) && songParts(song).some(part => part.bars.length === 8 && part.bars.every(bar => used(bar) === 8));

export function validateSong(value) {
  const fail = () => { throw new Error('올바른 8마디 작곡 파일이 아니에요.'); };
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![1, 2, 3].includes(value.version)) fail();
  if (typeof value.title !== 'string' || value.title.trim().length === 0 || value.title.length > 80) fail();
  if (!PROGRESSIONS.some(item => item.id === value.progression && (item.version ?? 1) <= value.version)) fail();
  if (!Number.isInteger(value.bpm) || value.bpm < 60 || value.bpm > 160) fail();
  if (typeof value.free !== 'boolean') fail();
  if (value.version >= 2 && !FOREST_MAPS.some(map => map.id === value.forestMap && (map.version ?? 1) <= value.version)) fail();
  const readBars = (bars,percussion=false) => {
  if (!Array.isArray(bars) || bars.length !== 8) fail();
  return Array.from(bars, bar => {
    if (!Array.isArray(bar) || bar.length > 8) fail();
    const notes = Array.from(bar, note => {
      if (!note || typeof note !== 'object' || Array.isArray(note)) fail();
      if (note.pitch !== null && !PITCHES.some(item => item.midi === note.pitch)) fail();
      if (![1, 2, 3, 4, 8].includes(note.ticks)) fail();
      if (percussion && (note.ticks !== 1 || (note.pitch !== null && note.pitch !== 60))) fail();
      return { pitch: note.pitch, ticks: note.ticks };
    });
    if (used(notes) > 8) fail();
    return notes;
  });
  };
  const common = {version: value.version, title: value.title.trim(), progression: value.progression, bpm: value.bpm, free: value.free, ...(value.version >= 2 ? {forestMap: value.forestMap} : {})};
  if (value.version === 3) {
    if (typeof value.accompaniment !== 'boolean' || !Array.isArray(value.parts) || value.parts.length < 1 || value.parts.length > 7) fail();
    const ids = new Set();
    const parts = Array.from(value.parts, part => {
      if (!part || !instrumentById(part.instrument) || ids.has(part.instrument)) fail();
      ids.add(part.instrument);
      return {instrument: part.instrument, bars: readBars(part.bars,part.instrument==='shaker')};
    });
    return {...common, accompaniment: value.accompaniment, parts};
  }
  const instrument = instrumentById(value.instrument);
  if (!instrument || instrument.version > value.version) fail();
  return {...common, instrument: value.instrument, bars: readBars(value.bars)};
}

export function timing(song, start = 0, end = 8) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 8 || start >= end) throw new Error('재생할 마디를 확인해 주세요.');
  const score = validateSong(song);
  const secondsPerTick = 30 / score.bpm;
  const events = [];
  for (const part of songParts(score)) for (let bar = start; bar < end; bar++) {
    let offset = 0;
    part.bars[bar].forEach((note, index) => {
      events.push({ time: ((bar - start) * 8 + offset) * secondsPerTick, duration: note.ticks * secondsPerTick, pitch: note.pitch, bar, index, instrument: part.instrument });
      offset += note.ticks;
    });
  }
  return { duration: (end - start) * 8 * secondsPerTick, events: events.sort((a, b) => a.time - b.time) };
}

export function badges(song) {
  const earned = [];
  if (complete(song)) earned.push('8마디 완성');
  for (const part of songParts(song)) {
  const musicalBars = part.bars.filter(bar => used(bar) === 8 && bar.some(note => note.pitch !== null));
  const signatures = musicalBars.map(bar => JSON.stringify(bar));
  if (new Set(signatures).size < signatures.length) earned.push('반복의 발견');
  if (musicalBars.some((bar, i) => musicalBars.slice(i + 1).some(other =>
    bar.length === other.length && bar.every((note, j) => note.ticks === other[j].ticks) &&
    bar.some((note, j) => note.pitch !== null && other[j].pitch !== null && note.pitch !== other[j].pitch)
  ))) earned.push('가락의 변주');
  }
  return [...new Set(earned)];
}
