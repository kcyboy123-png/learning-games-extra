import {NATURAL_SAMPLES} from './natural-samples.mjs?v=20261120-release21';
import {timing, chordAt, PITCHES} from './core.mjs?v=20261120-release21';
import {ensembleAccompaniment as accompanimentPattern} from './accompaniment.mjs?v=20261120-release21';
import {instrumentById, instrumentRoot} from './instruments.mjs?v=20261120-release21';

const PIANO_ROOTS = Array.from({length: 16}, (_, index) => 39 + index * 3);
const SAMPLE_INSTRUMENTS = new Set(['piano', 'bass', 'pluck']);
const sampleRoot = pitch => PIANO_ROOTS.reduce((best, root) => Math.abs(root - pitch) < Math.abs(best - pitch) ? root : best);

// Align visuals with the output device, not the audio graph's ahead-of-speaker clock.
export function audibleTime(context,now=performance.now()){
  if(!context)return 0;
  const stamp=context.getOutputTimestamp?.();
  if(stamp?.performanceTime>0&&Number.isFinite(stamp.contextTime))return Math.max(0,Math.min(context.currentTime,stamp.contextTime+(now-stamp.performanceTime)/1000));
  return Math.max(0,context.currentTime-(context.outputLatency||0)-(context.baseLatency||0));
}

export class Player {
  constructor() {
    this.context = null;
    this.master = null;
    this.volume = .7;
    this.generation = 0;
    this.voices = new Set();
    this.timers = new Set();
    this.noise = new Map();
    this.piano = new Map();
    this.instruments = new Map();
    this.sampleLoads = new Map();
    this.loading = false;
    this.scheduled = false;
    this.timeline = null;
    this.onLoading = () => {};
    this.onInterrupt = () => {};
  }

  // A take whose clock stops (suspended/interrupted) is cancelled so listeners never wait on silent audio.
  stateChanged() {
    if (!this.scheduled || this.context.state === 'running') return;
    this.stop();
    this.onInterrupt();
  }

  connectGraph() {
      this.master = this.context.createGain();
      this.master.gain.value = this.volume * .65;
      // Keep the recorded stereo attack dry; a quiet room return adds body without washing out notes.
      this.room = this.context.createConvolver();
      this.roomGain = this.context.createGain();
      this.roomGain.gain.value = .06;
      this.roomImpulse = this.context.createBuffer(2, Math.ceil(this.context.sampleRate * 1.4), this.context.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = this.roomImpulse.getChannelData(channel);
        let seed = 733 + channel * 419, smooth = 0;
        for (let i = 0; i < data.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          smooth = smooth * .65 + (seed / 4294967296 * 2 - 1) * .35;
          data[i] = i < this.context.sampleRate * .018 ? 0 : smooth * Math.exp(-6 * i / data.length);
        }
      }
      this.room.buffer = this.roomImpulse;
      this.room.connect(this.roomGain);
      this.roomGain.connect(this.master);
      this.limiter = this.context.createDynamicsCompressor();
      this.limiter.threshold.value = -6;
      this.limiter.knee.value = 6;
      this.limiter.ratio.value = 4;
      this.limiter.attack.value = .003;
      this.limiter.release.value = .2;
      this.master.connect(this.limiter);
      this.limiter.connect(this.context.destination);
  }

  async ready(generation) {
    if(this.context?.startRendering){if(!this.master)this.connectGraph();return generation===this.generation;}
    try{if(globalThis.navigator?.audioSession)navigator.audioSession.type='playback';}catch{/* Optional browser feature. */}
    if (!this.context || this.context.state==='closed') {
      if(this.context)this.context.onstatechange=null;
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) throw new Error('이 브라우저에서는 소리 재생을 지원하지 않아요.');
      this.context = new Audio();
      this.connectGraph();
      this.context.onstatechange = () => this.stateChanged();
    }
    if (this.context.state !== 'running') {
      let timeout;
      try{await Promise.race([this.context.resume(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('소리 재생이 대기 중이에요. 다른 소리 앱을 닫고 듣기를 다시 눌러 주세요.')),5000);})]);}
      finally{clearTimeout(timeout);}
    }
    if(generation!==this.generation)return false;
    if(!this.context.startRendering&&this.context.state!=='running')throw new Error('소리가 일시 중단되었어요. 다른 소리 앱을 닫고 듣기를 다시 눌러 주세요.');
    return generation === this.generation;
  }

  outputTime(){return audibleTime(this.context);}
  position(){
    if(!this.scheduled||!this.timeline)return null;
    const {origin,track,start,end,bpm,accompanimentOnly}=this.timeline,time=this.outputTime()-origin;
    if(time<0||time>=track.duration)return null;
    return {bar:Math.min(end-1,start+Math.floor(time/(240/bpm))),time,events:accompanimentOnly?[]:track.events.filter(e=>e.time<=time&&time<e.time+e.duration)};
  }

  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    if (this.master) this.master.gain.setTargetAtTime(this.volume * .65, this.context.currentTime, .02);
  }

  async loadPiano(pitches, generation) {
    if (pitches.some(pitch => !this.piano.has(sampleRoot(pitch)))) {
      this.loading = true;
      this.onLoading(true);
    }
    try {
      await Promise.all([...new Set(pitches.map(sampleRoot))].map(root => {
        if (this.piano.has(root)) return;
        if (!this.sampleLoads.has(root)) {
          const loading = (async () => {
            const url = new URL(`./assets/audio/natural/${NATURAL_SAMPLES.piano[root].file}.flac`, import.meta.url);
            const response = await fetch(url, {signal: AbortSignal.timeout(12000)});
            if (!response.ok) throw new Error(`Piano sample HTTP ${response.status}`);
            const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
            let peak = 0;
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
              for (const sample of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample));
            }
            if (peak === 0 || !Number.isFinite(peak)) throw new Error('Empty piano sample');
            this.piano.set(root, {buffer, scale: NATURAL_SAMPLES.piano[root].gain, offset: NATURAL_SAMPLES.piano[root].offset});
          })().finally(() => this.sampleLoads.delete(root));
          this.sampleLoads.set(root, loading);
        }
        return this.sampleLoads.get(root);
      }));
    } catch (cause) {
      if (generation !== this.generation) return false;
      throw new Error('피아노 소리를 불러오지 못했어요. 잠시 후 재생 버튼을 다시 눌러 주세요.', {cause});
    } finally {
      if (generation === this.generation && this.loading) {
        this.loading = false;
        this.onLoading(false);
      }
    }
    return generation === this.generation;
  }

  stop() {
    this.generation++;
    this.scheduled = false;
    this.timeline = null;
    if (this.loading) {
      this.loading = false;
      this.onLoading(false);
    }
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const voice of this.voices) {
      const now=this.context.currentTime;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setTargetAtTime(0,now,.005);
      voice.osc.stop(now+.025);
    }
    this.voices.clear();
    if (this.room) { this.room.buffer = null; this.room.buffer = this.roomImpulse; }
  }

  async loadInstrument(id, pitches, generation) {
    const instrument = instrumentById(id);
    if (!instrument) throw new Error('악기를 다시 골라 주세요.');
    if (!instrument.samples || !pitches.length) return generation === this.generation;
    const roots = [...new Set(pitches.map(pitch => instrumentRoot(instrument, pitch)))];
    if (roots.some(root => !this.instruments.has(id + ':' + root))) {
      this.loading = true;
      this.onLoading(true);
    }
    try {
      const takes=roots.flatMap(root=>instrument.shortNotes?[{root,short:false},{root,short:true}]:[{root,short:false}]);
      await Promise.all(takes.map(({root,short}) => {
        const take=short?instrument.recordings[root].short:instrument.recordings[root];
        const key = id + ':' + root + (short?':short':'');
        if (this.instruments.has(key)) return;
        if (!this.sampleLoads.has(key)) {
          const loading = (async () => {
            const response = await fetch(new URL(`./assets/audio/${instrument.folder}/${take.file}.${instrument.extension}`, import.meta.url), {signal: AbortSignal.timeout(12000)});
            if (!response.ok) throw new Error('Instrument sample HTTP ' + response.status);
            const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
            let peak = 0;
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
              for (const sample of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample));
            }
            if (!Number.isFinite(peak) || peak === 0) throw new Error('Empty instrument sample');
            this.instruments.set(key, {buffer, scale:take.gain, offset:take.offset});
          })().finally(() => this.sampleLoads.delete(key));
          this.sampleLoads.set(key, loading);
        }
        return this.sampleLoads.get(key);
      }));
    } catch (cause) {
      if (generation !== this.generation) return false;
      throw new Error(`${instrument.name} 소리를 준비하지 못했어요. 잠시 후 다시 골라 주세요.`, {cause});
    } finally {
      if (generation === this.generation && this.loading) {
        this.loading = false;
        this.onLoading(false);
      }
    }
    return generation === this.generation;
  }

  async prepareInstrument(id) {
    this.stop();
    const generation = this.generation;
    if (!await this.ready(generation)) return false;
    return this.loadInstrument(id, PITCHES.map(pitch => pitch.midi), generation);
  }

  at(time, generation, callback) {
    if(this.context?.startRendering)return;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (generation !== this.generation) return;
      // Follow the audio clock if the browser temporarily suspends audio.
      if (this.outputTime() < time) this.at(time, generation, callback);
      else callback();
    }, Math.max(4, (time - this.outputTime()) * 1000));
    this.timers.add(timer);
  }

  tone(pitch, time, duration, instrument, level) {
    if (pitch === null) return;
    if (!Number.isInteger(pitch) || pitch < 36 || pitch > 84 || !Number.isFinite(duration) || duration <= 0) {
      throw new Error('재생할 음표가 올바르지 않아요.');
    }
    if (SAMPLE_INSTRUMENTS.has(instrument)) {
      const root = sampleRoot(pitch), sample = this.piano.get(root);
      if (!sample) throw new Error('피아노 소리가 아직 준비되지 않았어요.');
      const source = this.context.createBufferSource(), gain = this.context.createGain();
      source.buffer = sample.buffer;
      source.playbackRate.value = 2 ** ((pitch - root) / 12);
      const held = Math.max(.04, duration);
      const release = instrument === 'pluck' ? .35 : pitch < 60 ? 1.15 : .85;
      const length = held + release;
      const volume = level * sample.scale;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + .004);
      gain.gain.setValueAtTime(volume, time + held);
      gain.gain.exponentialRampToValueAtTime(Math.max(.00001, volume * .001), time + length);
      gain.gain.linearRampToValueAtTime(0, time + length + .015);
      source.connect(gain);
      gain.connect(this.master);
      gain.connect(this.room);
      this.trackVoice(source, gain);
      source.start(time,sample.offset??0);
      source.stop(time + length + .02);
      return;
    }
    const definition = instrumentById(instrument);
    if (definition?.samples) {
      const root = instrumentRoot(definition, pitch), sample = this.instruments.get(instrument + ':' + root + (definition.shortNotes&&duration<=.34?':short':''));
      if (!sample) throw new Error(`${definition.name} 소리가 아직 준비되지 않았어요.`);
      const source = this.context.createBufferSource(), gain = this.context.createGain();
      source.buffer = sample.buffer;
      source.playbackRate.value = 2 ** ((pitch + (definition.transpose??0) - root) / 12);
      const breath=instrument==='flute'?Math.min(.085,Math.max(.025,duration*.08)):0;
      const held=definition.percussion?Math.max(.04,sample.buffer.duration-(sample.offset??0)-.02):Math.max(.04,duration-breath), end=held+(instrument==='flute'?Math.min(.12,breath+.035):definition.release);
      const volume = level * sample.scale * definition.gain;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + Math.min(definition.attack, held / 3));
      gain.gain.setValueAtTime(volume, time + held);
      gain.gain.exponentialRampToValueAtTime(.00001, time + end);
      gain.gain.linearRampToValueAtTime(0, time + end + .015);
      source.connect(gain);
      gain.connect(this.master);
      gain.connect(this.room);
      this.trackVoice(source, gain);
      source.start(time, sample.offset??0);
      source.stop(time + end + .02);
      return;
    }
    const pad=instrument==='pad',bell=instrument==='bell';
    // Each struck partial decays independently; upper overtones disappear first.
    const partials=pad?[[.9988,.35,1],[1.0012,.35,1],[2,.1,.8],[3,.035,.6]]
      :bell?[[1,.72,1],[2,.16,.72],[2.76,.10,.5],[5.4,.025,.23]]
      :[[1,.85,1],[4,.19,.24],[10,.025,.09]];
    const length=pad?Math.max(.04,duration):Math.max(.12,duration)+(bell?.5:.16);
    for(const [ratio,weight,decay] of partials){
      const osc=this.context.createOscillator(),gain=this.context.createGain();
      osc.type='sine';osc.frequency.value=440*2**((pitch-69)/12)*ratio;
      const end=length*decay,attack=Math.min(pad?.18:.004,end*.2);
      gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level*weight,time+attack);
      gain.gain.exponentialRampToValueAtTime(Math.max(.00001,level*weight*(pad?.5:.001)),time+end*.9);
      gain.gain.linearRampToValueAtTime(0,time+end);
      osc.connect(gain);gain.connect(this.master);if(bell)gain.connect(this.room);
      this.trackVoice(osc,gain);osc.start(time);osc.stop(time+end+.005);
    }
  }

  trackVoice(osc, gain) {
    const voice = {osc, gain};
    this.voices.add(voice);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      this.voices.delete(voice);
    };
  }

  drum(instrument, time, duration, level) {
    let source;
    if (instrument === 'kick') {
      source = this.context.createOscillator();
      source.type = 'sine';
      source.frequency.setValueAtTime(125, time);
      source.frequency.exponentialRampToValueAtTime(44, time + duration * .8);
    } else {
      if (!this.noise.has(instrument)) {
        const buffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * .15), this.context.sampleRate);
        const data = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < data.length; i++) {
          const next = Math.random() * 2 - 1;
          data[i] = instrument === 'hat' ? (next - previous) * .5 : next * .7 + previous * .3;
          previous = next;
        }
        this.noise.set(instrument, buffer);
      }
      source = this.context.createBufferSource();
      source.buffer = this.noise.get(instrument);
    }
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration * .9);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    source.connect(gain);
    gain.connect(this.master);
    this.trackVoice(source, gain);
    source.start(time);
    source.stop(time + duration);
  }

  async play(song, {start = 0, end = 8, accompaniment = song.accompaniment ?? true, accompanimentOnly = false, onTick = () => {}, onBeat = () => {}, onBackingNote = null, onEnd = () => {}} = {}) {
    this.stop();
    const generation = this.generation;
    song = structuredClone(song);
    const track = timing(song, start, end);
    if (!await this.ready(generation)) return false;
    const backing = [];
    if (accompaniment) for (let bar = start; bar < end; bar++) {
      for (const event of accompanimentPattern(song.progression, chordAt(song, bar), bar)) backing.push({...event, bar});
    }
    const pitches = backing.filter(event => SAMPLE_INSTRUMENTS.has(event.instrument)).map(event => event.pitch);
    if (!accompanimentOnly) pitches.push(...track.events.filter(event => event.pitch !== null && SAMPLE_INSTRUMENTS.has(event.instrument)).map(event => event.pitch));
    if (!await this.loadPiano(pitches, generation)) return false;
    const sounding=[...backing,...(accompanimentOnly?[]:track.events)].filter(event=>event.pitch!==null&&event.pitch!==undefined);
    for(const id of new Set(sounding.map(event=>event.instrument).filter(id=>instrumentById(id)))){
      if(!await this.loadInstrument(id,sounding.filter(event=>event.instrument===id).map(event=>event.pitch),generation))return false;
    }
    if(!this.context.startRendering&&this.context.state!=='running')throw new Error('소리가 일시 중단되었어요. 듣기를 다시 눌러 주세요.');
    const origin = this.context.currentTime + (this.context.startRendering ? 0 : .06);
    this.timeline={origin,track,start,end,bpm:song.bpm,accompanimentOnly};
    try {
      for (const event of accompanimentOnly ? [] : track.events) {
        this.tone(event.pitch, origin + event.time, event.duration, event.instrument, .18);
        this.at(origin + event.time, generation, () => {if(this.outputTime()<origin+event.time+event.duration)onTick({bar: event.bar, index: event.index, time: event.time, instrument: event.instrument, startTime: origin + event.time, duration: event.duration});});
      }
      const authored=new Set((accompanimentOnly?[]:track.events).filter(e=>e.pitch!==null).map(e=>`${e.bar}:${e.instrument}`));
      const beatSeconds = 60 / song.bpm;
      for (let bar = start; bar < end; bar++) {
        for (let beat = 0; beat < 4; beat++) {
          const time = ((bar - start) * 4 + beat) * beatSeconds;
          this.at(origin + time, generation, () => onBeat({bar, beat, time}));
        }
      }
      for (const event of backing) {
        const time = origin + ((event.bar - start) * 4 + event.beat) * beatSeconds;
        if (event.pitch === undefined) this.drum(event.instrument, time, event.duration * beatSeconds, event.level * 1.2 * (authored.has(`${event.bar}:${event.instrument}`)?.6:1));
        else {
          this.tone(event.pitch, time, event.duration * beatSeconds, event.instrument, event.level * 1.2 * (authored.has(`${event.bar}:${event.instrument}`)?.6:1));
          if (onBackingNote && SAMPLE_INSTRUMENTS.has(event.instrument)) this.at(time, generation, () => onBackingNote(event.pitch, time, event.duration * beatSeconds));
        }
      }
      this.at(origin + track.duration + 1.65, generation, () => {
        this.stop();
        onEnd();
      });
      this.scheduled = true;
      if (!this.context.startRendering && this.context.state !== 'running') this.stateChanged();
      return this.scheduled;
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  async preview(pitch, instrument = 'piano', duration = 1.1) {
    if (pitch === null) return false;
    if (this.scheduled) this.stop();
    else this.generation++; // Let earlier key strikes ring while cancelling stale sample loads.
    const generation = this.generation;
    if (!await this.ready(generation)) return false;
    if (SAMPLE_INSTRUMENTS.has(instrument) && !await this.loadPiano([pitch], generation)) return false;
    if (!await this.loadInstrument(instrument, [pitch], generation)) return false;
    const cue={start:this.context.currentTime+.02,duration};
    this.tone(pitch, cue.start, cue.duration, instrument, .18);
    return cue;
  }
}

