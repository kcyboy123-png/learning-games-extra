export const PITCHES = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84]
  .map((midi, step) => ({ midi, name: ['도', '레', '미', '파', '솔', '라', '시'][step % 7], step }));

export const CHORDS = { C: [0, 4, 7], F: [5, 9, 0], G: [7, 11, 2], Am: [9, 0, 4], Dm: [2, 5, 9], Em: [4, 7, 11] };
export const PROGRESSIONS = [
  { id: 'basic', name: '기본 피아노', subtitle: '차분한 피아노 위에 첫 가락을 놓아요', style: 'piano', featured: true, chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'] },
  { id: 'pop', name: '리듬 팝', subtitle: '경쾌한 리듬을 타고 노래해요', style: 'pop', featured: true, chords: ['C', 'G', 'Am', 'F', 'C', 'Am', 'G', 'C'] },
  { id: 'warm', name: '따뜻한 아르페지오', subtitle: '차례로 흐르는 화음에 마음을 담아요', style: 'warm', featured: true, chords: ['C', 'Am', 'F', 'G', 'Am', 'F', 'G', 'C'] },
  { id: 'dream', name: '별빛 오솔길', subtitle: '은은한 종소리 사이에 가락을 반짝여요', style: 'dream', featured: true, chords: ['C', 'Em', 'Am', 'G', 'F', 'C', 'Dm', 'G'] },
  { id: 'journey', name: '구름섬 여행', subtitle: '통통 튀는 마림바와 구름 위를 걸어요', style: 'journey', featured: true, chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm', 'G'] },
  { id: 'moon', name: '달에게 보내는 편지', subtitle: '긴 피아노 울림과 작은 종소리로 인사를', style: 'moon', featured: true, chords: ['Am', 'F', 'C', 'G', 'Dm', 'Am', 'G', 'C'] },
  { id: 'walk', name: '햇살 산책', subtitle: '밝고 편안하게 걸어요', featured: false, chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'] },
  { id: 'letter', name: '마음의 편지', subtitle: '다정한 마음을 전해요', featured: false, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'G', 'C'] },
  { id: 'adventure', name: '작은 모험', subtitle: '새로운 길을 찾아가요', featured: false, chords: ['C', 'G', 'Am', 'F', 'C', 'F', 'G', 'C'] },
];

export function makeSong() {
  return { version: 1, title: '나의 첫 멜로디', progression: 'basic', bpm: 100, instrument: 'piano', free: false, bars: Array.from({ length: 8 }, () => []) };
}

export const clone = value => structuredClone(value);
export const used = bar => bar.reduce((total, note) => total + note.ticks, 0);
export const isChordTone = (midi, chord) => Number.isInteger(midi) && !!CHORDS[chord]?.includes(((midi % 12) + 12) % 12);
export const chordAt = (song, i) => PROGRESSIONS.find(item => item.id === song.progression)?.chords[i];
export const complete = song => song.bars.length === 8 && song.bars.every(bar => used(bar) === 8);

export function validateSong(value) {
  const fail = () => { throw new Error('올바른 8마디 작곡 파일이 아니에요.'); };
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) fail();
  if (typeof value.title !== 'string' || value.title.trim().length === 0 || value.title.length > 80) fail();
  if (!PROGRESSIONS.some(item => item.id === value.progression)) fail();
  if (!Number.isInteger(value.bpm) || value.bpm < 60 || value.bpm > 160) fail();
  if (!['piano', 'marimba', 'bell'].includes(value.instrument) || typeof value.free !== 'boolean') fail();
  if (!Array.isArray(value.bars) || value.bars.length !== 8) fail();
  const bars = Array.from(value.bars, bar => {
    if (!Array.isArray(bar) || bar.length > 8) fail();
    const notes = Array.from(bar, note => {
      if (!note || typeof note !== 'object' || Array.isArray(note)) fail();
      if (note.pitch !== null && !PITCHES.some(item => item.midi === note.pitch)) fail();
      if (![1, 2, 4, 8].includes(note.ticks)) fail();
      return { pitch: note.pitch, ticks: note.ticks };
    });
    if (used(notes) > 8) fail();
    return notes;
  });
  return { version: 1, title: value.title.trim(), progression: value.progression, bpm: value.bpm, instrument: value.instrument, free: value.free, bars };
}

export function timing(song, start = 0, end = 8) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > 8 || start >= end) throw new Error('재생할 마디를 확인해 주세요.');
  const score = validateSong(song);
  const secondsPerTick = 30 / score.bpm;
  const events = [];
  for (let bar = start; bar < end; bar++) {
    let offset = 0;
    score.bars[bar].forEach((note, index) => {
      events.push({ time: ((bar - start) * 8 + offset) * secondsPerTick, duration: note.ticks * secondsPerTick, pitch: note.pitch, bar, index });
      offset += note.ticks;
    });
  }
  return { duration: (end - start) * 8 * secondsPerTick, events };
}

export function badges(song) {
  const earned = [];
  if (complete(song)) earned.push('8마디 완성');
  const musicalBars = song.bars.filter(bar => used(bar) === 8 && bar.some(note => note.pitch !== null));
  const signatures = musicalBars.map(bar => JSON.stringify(bar));
  if (new Set(signatures).size < signatures.length) earned.push('반복의 발견');
  if (musicalBars.some((bar, i) => musicalBars.slice(i + 1).some(other =>
    bar.length === other.length && bar.every((note, j) => note.ticks === other[j].ticks) &&
    bar.some((note, j) => note.pitch !== null && other[j].pitch !== null && note.pitch !== other[j].pitch)
  ))) earned.push('가락의 변주');
  return earned;
}
