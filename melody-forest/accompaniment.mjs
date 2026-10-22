const VOICINGS = {
  C: {bass: 48, fifth: 55, notes: [60, 64, 67]},
  F: {bass: 41, fifth: 48, notes: [60, 65, 69]},
  G: {bass: 43, fifth: 50, notes: [59, 62, 67]},
  Am: {bass: 45, fifth: 52, notes: [60, 64, 69]},
  Dm: {bass: 38, fifth: 45, notes: [57, 62, 65]},
  Em: {bass: 40, fifth: 47, notes: [59, 64, 67]},
};
const STYLES = {basic: 'basic', pop: 'pop', warm: 'warm', dream: 'dream', journey: 'journey', moon: 'moon', walk: 'basic', letter: 'warm', adventure: 'pop'};

// Times and durations are quarter-note beats, so every arrangement follows the song tempo.
export function accompanimentPattern(style, chord, bar) {
  style = STYLES[style];
  const voicing = VOICINGS[chord];
  if (!style || !voicing || !Number.isInteger(bar) || bar < 0 || bar > 7) throw new Error('반주 설정이 올바르지 않아요.');
  const {bass, fifth, notes} = voicing, events = [], cadence = bar === 7;
  const note = (pitch, beat, duration, instrument, level) => events.push({pitch, beat, duration: Math.min(duration, 4 - beat), instrument, level});
  const block = (beat, duration, instrument, level) => notes.forEach(pitch => note(pitch, beat, duration, instrument, level));
  const drum = (instrument, beat, duration, level) => events.push({instrument, beat, duration, level});

  if (style === 'basic') {
    note(bass, 0, 1.65, 'bass', .065);
    block(1, .8, 'piano', .035);
    if (!cadence) {
      note(fifth, 2, 1.65, 'bass', .05);
      block(3, bar === 3 ? .4 : .85, 'piano', .03);
      if (bar === 3) note(notes[2], 3.5, .45, 'piano', .04);
    }
  } else if (style === 'pop') {
    note(bass, 0, .9, 'bass', .06);
    note(bass, 1.5, .4, 'bass', .045);
    for (const beat of cadence ? [0, 1.5] : [0, 1.5, 2.5, 3.5]) block(beat, .35, 'pluck', .028);
    drum('kick', 0, .2, .07);
    drum('snare', 1, .13, .035);
    if (!cadence) {
      note(fifth, 2.5, .4, 'bass', .05);
      drum('kick', 2, .2, .055);
      drum('snare', 3, .13, .03);
      if (bar === 3) drum('snare', 3.75, .12, .018);
    }
    for (let step = 1; step < (cadence ? 4 : 8); step += 2) drum('hat', step / 2, .045, .022);
  } else if (style === 'dream') {
    // Leave silence between bell answers so the child's melody stays in front.
    note(bass, 0, cadence ? 1.9 : 3.9, 'bass', .036);
    block(0, cadence ? 1.9 : 3.9, 'pad', .014);
    note(notes[2], .5, 1.25, 'bell', .025);
    if (!cadence) {
      note(notes[bar % 2], 2.5, 1.25, 'bell', .022);
      if (bar === 3) note(notes[1], 3.5, .5, 'bell', .017);
    }
  } else if (style === 'journey') {
    // A light walking pulse with wooden mallet answers, rather than the pop backbeat.
    note(bass, 0, .8, 'bass', .05);
    block(.5, .5, 'piano', .025);
    note(notes[1], 1, .65, 'marimba', .035);
    note(notes[2], 1.5, .4, 'marimba', .03);
    if (!cadence) {
      note(fifth, 2, .8, 'bass', .042);
      block(2.5, .5, 'piano', .023);
      note(notes[bar === 3 ? 1 : 0], 3, .6, 'marimba', .035);
      if (bar === 3) note(notes[2], 3.5, .45, 'marimba', .025);
    }
  } else if (style === 'moon') {
    note(bass, 0, 1.9, 'bass', .04);
    block(0, 1.8, 'piano', .024);
    note(notes[1], 1.5, .5, 'bell', .02);
    if (!cadence) {
      block(2, 1.85, 'piano', .022);
      note(notes[bar === 3 ? 1 : 2], 3, .9, 'bell', .017);
    }
  } else {
    note(bass, 0, cadence ? 1.9 : 3.9, 'bass', .05);
    block(0, cadence ? 1.9 : 3.9, 'pad', .02);
    const order = bar === 3 ? [0, 1, 2, 1, 0, 2, 1, 2] : [0, 1, 2, 1, 0, 1, 2, 1];
    for (let step = 0; step < (cadence ? 4 : 8); step++) {
      note(notes[order[step]], step / 2, .78, 'piano', step % 4 === 0 ? .055 : .038);
    }
  }
  if (cadence) {
    note(bass, 2, 2, 'bass', .055);
    const soft = style === 'warm' || style === 'dream';
    block(2, 2, soft ? 'pad' : 'piano', soft ? .028 : .04);
  }
  return events.sort((a, b) => a.beat - b.beat);
}
