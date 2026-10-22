import {timing, chordAt} from './core.mjs';
import {accompanimentPattern} from './accompaniment.mjs';

const PIANO_ROOTS = Array.from({length: 16}, (_, index) => 39 + index * 3);
const SAMPLE_INSTRUMENTS = new Set(['piano', 'bass', 'pluck']);
const sampleRoot = pitch => PIANO_ROOTS.reduce((best, root) => Math.abs(root - pitch) < Math.abs(best - pitch) ? root : best);
const sampleName = root => ['C', '', '', 'Ds', '', '', 'Fs', '', '', 'A'][root % 12] + (Math.floor(root / 12) - 1);

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
    this.sampleLoads = new Map();
    this.loading = false;
    this.scheduled = false;
    this.onLoading = () => {};
    this.onInterrupt = () => {};
  }

  // A take whose clock stops (suspended/interrupted) is cancelled so listeners never wait on silent audio.
  stateChanged() {
    if (!this.scheduled || this.context.state === 'running') return;
    this.stop();
    this.onInterrupt();
  }

  async ready(generation) {
    if (!this.context) {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) throw new Error('이 브라우저에서는 소리 재생을 지원하지 않아요.');
      this.context = new Audio();
      this.master = this.context.createGain();
      this.master.gain.value = this.volume * .65;
      this.master.connect(this.context.destination);
      this.context.onstatechange = () => this.stateChanged();
    }
    if (this.context.state === 'suspended') await this.context.resume();
    return generation === this.generation;
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
            const url = new URL(`./assets/audio/piano/${sampleName(root)}.mp3`, import.meta.url);
            const response = await fetch(url, {signal: AbortSignal.timeout(12000)});
            if (!response.ok) throw new Error(`Piano sample HTTP ${response.status}`);
            const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
            let peak = 0;
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
              for (const sample of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample));
            }
            if (peak === 0 || !Number.isFinite(peak)) throw new Error('Empty piano sample');
            this.piano.set(root, {buffer, scale: Math.min(4, .9 / peak)});
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
    if (this.loading) {
      this.loading = false;
      this.onLoading(false);
    }
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    for (const voice of this.voices) {
      voice.osc.onended = null;
      voice.osc.stop();
      voice.osc.disconnect();
      voice.gain.disconnect();
    }
    this.voices.clear();
  }

  at(time, generation, callback) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (generation !== this.generation) return;
      // Follow the audio clock if the browser temporarily suspends audio.
      if (this.context.currentTime < time - .015) this.at(time, generation, callback);
      else callback();
    }, Math.max(10, (time - this.context.currentTime) * 1000));
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
      const length = duration * .98, release = Math.min(.16, length * .28);
      const volume = level * sample.scale;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + .004);
      gain.gain.setValueAtTime(volume, time + length - release);
      gain.gain.linearRampToValueAtTime(0, time + length);
      source.connect(gain);
      gain.connect(this.master);
      this.trackVoice(source, gain);
      source.start(time);
      source.stop(time + length + .005);
      return;
    }
    const partials = instrument === 'pad' ? [[.9988, 'sine', .35], [1.0012, 'sine', .35], [2, 'sine', .1], [3, 'sine', .035]]
      : instrument === 'bell' ? [[1, 'sine', 1], [2.76, 'sine', .22]]
      : [[1, 'sine', 1], [3, 'sine', .16]];
    const length = Math.max(.04, duration * .94);
    for (const [ratio, type, weight] of partials) {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = type;
      osc.frequency.value = 440 * 2 ** ((pitch - 69) / 12) * ratio;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(level * weight, time + (instrument === 'pad' ? Math.min(.22, length * .2) : .008));
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001, level * weight * (instrument === 'pad' ? .65 : .15)), time + length * .8);
      gain.gain.linearRampToValueAtTime(0, time + length);
      osc.connect(gain);
      gain.connect(this.master);
      this.trackVoice(osc, gain);
      osc.start(time);
      osc.stop(time + length + .005);
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

  async play(song, {start = 0, end = 8, accompaniment = true, accompanimentOnly = false, onTick = () => {}, onBeat = () => {}, onBackingNote = null, onEnd = () => {}} = {}) {
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
    if (!accompanimentOnly && SAMPLE_INSTRUMENTS.has(song.instrument)) pitches.push(...track.events.filter(event => event.pitch !== null).map(event => event.pitch));
    if (!await this.loadPiano(pitches, generation)) return false;
    const origin = this.context.currentTime + .06;
    try {
      for (const event of accompanimentOnly ? [] : track.events) {
        this.tone(event.pitch, origin + event.time, event.duration, song.instrument, .18);
        this.at(origin + event.time, generation, () => onTick({bar: event.bar, index: event.index, time: event.time}));
      }
      const beatSeconds = 60 / song.bpm;
      for (let bar = start; bar < end; bar++) {
        for (let beat = 0; beat < 4; beat++) {
          const time = ((bar - start) * 4 + beat) * beatSeconds;
          this.at(origin + time, generation, () => onBeat({bar, beat, time}));
        }
      }
      for (const event of backing) {
        const time = origin + ((event.bar - start) * 4 + event.beat) * beatSeconds;
        if (event.pitch === undefined) this.drum(event.instrument, time, event.duration * beatSeconds, event.level);
        else {
          this.tone(event.pitch, time, event.duration * beatSeconds, event.instrument, event.level);
          if (onBackingNote) this.at(time, generation, () => onBackingNote(event.pitch));
        }
      }
      this.at(origin + track.duration, generation, () => {
        this.stop();
        onEnd();
      });
      this.scheduled = true;
      if (this.context.state !== 'running') this.stateChanged();
      return this.scheduled;
    } catch (error) {
      this.stop();
      throw error;
    }
  }

  async preview(pitch, instrument = 'piano') {
    if (pitch === null) return false;
    this.stop();
    const generation = this.generation;
    if (!await this.ready(generation)) return false;
    if (SAMPLE_INSTRUMENTS.has(instrument) && !await this.loadPiano([pitch], generation)) return false;
    this.tone(pitch, this.context.currentTime + .02, .55, instrument, .18);
    return true;
  }
}
