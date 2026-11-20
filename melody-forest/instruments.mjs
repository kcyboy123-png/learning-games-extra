import {NATURAL_SAMPLES} from './natural-samples.mjs?v=20261120-keys42';
import {CELLO_SAMPLES} from './cello-samples.mjs?v=20261120-keys42';
export const INSTRUMENTS = [
  {id: 'piano', name: '피아노', version: 1},
  {id: 'marimba', name: '마림바', version: 1},
  {id: 'bell', name: '별빛 벨', version: 1},
  {id:'cello',name:'첼로',version:3,folder:'cello-solo',extension:'flac',transpose:-12,gain:.9,attack:.012,release:.16,shortNotes:true,recordings:CELLO_SAMPLES,samples:Object.fromEntries(Object.entries(CELLO_SAMPLES).map(([root,take])=>[root,take.file]))},
  {id:'shaker',name:'셰이커',version:3,percussion:true,folder:'shaker',extension:'flac',gain:1,attack:.002,release:.02,recordings:{60:{file:'egg-shaker-48k24',gain:.5,offset:0}},samples:{60:'egg-shaker-48k24'}},
  ...['flute','guitar'].map(id=>({id,name:id==='flute'?'플루트':'클래식 기타',version:2,folder:'natural',extension:'flac',gain:id==='flute'?1.1:1,attack:id==='flute'?.008:.003,release:id==='flute'?.12:.8,shortNotes:id==='flute',recordings:NATURAL_SAMPLES[id],samples:Object.fromEntries(Object.entries(NATURAL_SAMPLES[id]).map(([root,take])=>[root,take.file]))})),
];

export const instrumentById = id => INSTRUMENTS.find(instrument => instrument.id === id);
export const instrumentRoot = (instrument, pitch) => Object.keys(instrument.samples).map(Number)
  .reduce((best, root) => Math.abs(root - pitch - (instrument.transpose??0)) < Math.abs(best - pitch - (instrument.transpose??0)) ? root : best);
