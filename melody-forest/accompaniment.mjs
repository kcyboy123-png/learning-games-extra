const VOICINGS = {
 C6:{bass:48,fifth:55,notes:[60,64,69]},G7:{bass:43,fifth:50,notes:[59,62,65]},
  C: {bass: 48, fifth: 55, notes: [60, 64, 67]},
  F: {bass: 41, fifth: 48, notes: [60, 65, 69]},
  G: {bass: 43, fifth: 50, notes: [59, 62, 67]},
  Am: {bass: 45, fifth: 52, notes: [60, 64, 69]},
  Dm: {bass: 38, fifth: 45, notes: [57, 62, 65]},
  Em: {bass: 40, fifth: 47, notes: [59, 64, 67]},
};
const STYLES = {'christmas-carol':'christmas',christmas:'christmas',basic: 'basic', pop: 'pop', warm: 'warm', dream: 'dream', journey: 'journey', moon: 'moon', 'a-minor': 'minor', 'd-minor':'rain', walk: 'basic', letter: 'warm', adventure: 'pop'};

// Times and durations are quarter-note beats, so every arrangement follows the song tempo.
export function accompanimentPattern(style, chord, bar) {
  style = STYLES[style];
  const voicing = VOICINGS[chord];
  if (!style || !voicing || !Number.isInteger(bar) || bar < 0 || bar > 7) throw new Error('반주 설정이 올바르지 않아요.');
  const {bass, fifth, notes} = voicing, events = [], cadence = bar === 7;
  const note = (pitch, beat, duration, instrument, level) => events.push({pitch, beat, duration: Math.min(duration, 4 - beat), instrument, level});
  const block = (beat, duration, instrument, level) => notes.forEach(pitch => note(pitch, beat, duration, instrument, level));
  const drum = (instrument, beat, duration, level) => events.push({instrument, beat, duration, level});

  if (style === 'christmas') {
    note(bass,0,cadence?1.8:.85,'bass',.046);
    if(cadence)block(0,1.8,'piano',.026);
    else {block(1,.48,'piano',.024);note(fifth,2,.85,'bass',.038);block(3,.48,'piano',.024);}
  } else if (style === 'rain') {
    note(bass,0,3.8,'bass',.045);
    for(const beat of cadence?[0]:[0,1,2,3])note(notes[beat%3],beat,1.2,'piano',beat===0?.045:.032);
  } else if (style === 'minor') {
    note(bass, 0, 3.8, 'bass', .05);
    if (cadence) {
      block(0, 1.8, 'piano', .035);
    } else {
      const order = [0, 1, 2, 1, 0, 1, 2, 1];
      for (let step = 0; step < 8; step++) {
        note(notes[order[step]], step / 2, .7, 'piano', step % 4 === 0 ? .05 : .032);
      }
    }
  } else if (style === 'basic') {
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

// The original patterns remain available for legacy comparisons; playback uses this arrangement.
export function ensembleAccompaniment(progression,chord,bar){
 const events=accompanimentPattern(progression,chord,bar),style=STYLES[progression],v=VOICINGS[chord];
 const add=(instrument,pitch,beat,duration,level)=>events.push({instrument,pitch,beat,duration:Math.min(duration,4-beat),level});
 if(style==='christmas'){
  add('cello',v.bass+12,0,bar===7?2.7:2.4,.017);
  for(const pitch of v.notes)add('pad',pitch,0,bar===7?2.7:3.8,.005);
  // A recurring short-short-long bell phrase makes the carol pulse recognisable.
  const motif=bar===7?[[2,0],[1,1],[0,2]]:bar%2===0?[[1,0],[1,.5],[1,1],[1,2],[1,2.5],[1,3]]:[[1,0],[2,.5],[0,1],[1,2],[2,2.5],[2,3]];
  for(const [index,beat] of motif)add('bell',v.notes[index]+12,beat,bar===7?1.5:beat%2===1?.8:.32,.025);
  if(bar!==7){
   for(const beat of [1,3])add('guitar',v.notes[0],beat,.48,.019);
   for(let step=0;step<8;step++)add('shaker',60,step/2,.10,step%2?.012:.008);
   for(const beat of [1.5,3.5])add('bell',v.notes[0]+24,beat,.24,.006);
  }
 }
 if(style!=='christmas'){
  // Revoice existing notes instead of doubling every chord.
  for(const event of events){
   if(event.instrument==='piano'&&['basic','warm','pop'].includes(style))event.instrument='guitar';
   if(event.instrument==='pluck'&&style==='pop')event.instrument='guitar';
   if(event.instrument==='bass'&&['minor','rain','moon'].includes(style)){event.instrument='cello';event.pitch+=12;event.level*=.65;}
  }
  if(style==='basic'&&bar%2===1&&bar!==7)add('flute',v.notes[2]+12,3,.65,.017);
  if(style==='warm'||style==='dream')add('cello',v.bass+12,0,2.8,.018);
  if(style==='journey'&&bar%2===0)add('guitar',v.notes[0],3,.6,.02);
  if(style==='minor'&&bar%2===0)add('guitar',v.notes[1],2.5,.9,.018);
  if(style==='rain'&&bar%2===1&&bar!==7)add('flute',v.notes[0]+12,2.5,.8,.012);
 }
 // Each landscape answers in a different register and leaves phrase-end space.
 if(bar!==7){
  if(style==='pop')for(const beat of [.5,2.5])add('shaker',60,beat,.12,.014);
  if(style==='basic'&&bar%2===0)add('guitar',v.notes[0],2.5,.55,.016);
  if(style==='warm'&&bar%4===2)add('flute',v.notes[1]+12,3, .8,.011);
  if(style==='dream'&&bar%2===0)add('bell',v.notes[0]+12,3.25,.65,.008);
  if(style==='journey')for(const beat of [.5,2.5])add('shaker',60,beat,.1,.012);
  if(style==='moon'&&bar%4===2)add('flute',v.notes[1]+12,2.5,1.1,.012);
  if(style==='rain'&&bar%4===0)add('guitar',v.notes[2],3,.75,.014);
  if(style==='minor'&&bar%4===2)add('flute',v.notes[2]+12,3,.8,.010);
 }
 // A quiet pluck is slightly spread, not a machine-simultaneous piano block.
 for(const event of events)if(event.instrument==='guitar'){
  const delay=Math.max(0,v.notes.indexOf(event.pitch))*.018;
  event.beat+=delay;event.duration=Math.min(event.duration,4-event.beat);
  event.level*=.94+(bar%3)*.025;
 }
 // Low held tones need less energy than upper answers; phrase ends leave room for the melody.
 for(const event of events){
  if(event.instrument==='bass'&&events.some(e=>e.instrument==='cello'&&e.beat===event.beat))event.level*=.62;
  if(event.instrument==='guitar'&&style==='warm')event.level*=.84;
  if(event.instrument==='cello')event.duration=Math.min(event.duration,bar===7?2.7:2.4);
  if(bar===7&&event.instrument==='bell')event.level*=.8;
 }
 // Bound overlapping nominal gains while retaining the arrangement's balance.
 const peak=Math.max(...events.map(e=>events.filter(other=>other.beat<=e.beat&&other.beat+other.duration>e.beat).reduce((sum,other)=>sum+other.level,0)));
 const scale=Math.min(1,.14/peak);for(const event of events)event.level*=scale;
 return events.sort((a,b)=>a.beat-b.beat);
}
