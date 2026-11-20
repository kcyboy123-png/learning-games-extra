import {Player} from './audio.mjs?v=20261120-fix30';
import {timing,validateSong} from './core.mjs?v=20261120-fix30';

export function encodeWav(buffer){
  const channels=buffer.numberOfChannels, frames=buffer.length, bytes=frames*channels*2;
  const result=new ArrayBuffer(44+bytes),view=new DataView(result);
  const text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,36+bytes,true);text(8,'WAVE');text(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);
  view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);
  view.setUint16(32,channels*2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,bytes,true);
  const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
  for(let i=0;i<frames;i++)for(let c=0;c<channels;c++){
    const sample=data[c][i];
    if(!Number.isFinite(sample))throw new Error('음악 파일을 만들지 못했어요. 다시 시도해 주세요.');
    const value=Math.max(-1,Math.min(1,sample));
    view.setInt16(44+(i*channels+c)*2,Math.round(value*(value<0?32768:32767)),true);
  }
  return result;
}

export async function renderWav(song,signal){
  const score=validateSong(song),duration=timing(score).duration;
  const Audio=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;
  if(!Audio)throw new Error('이 브라우저는 음악 저장을 지원하지 않아요. 최신 Chrome이나 Edge에서 시도해 주세요.');
  signal?.throwIfAborted();
  const player=new Player();
  // Render the same mix independently of speaker volume, with room for the final release.
  player.context=new Audio(2,Math.ceil((duration+3)*44100),44100);
  const cancel=()=>player.stop();
  signal?.addEventListener('abort',cancel,{once:true});
  try{
    const ready=await player.play(score);
    signal?.throwIfAborted();
    if(!ready)throw new Error('음악 저장이 중단되었어요. 다시 시도해 주세요.');
    const buffer=await player.context.startRendering();
    signal?.throwIfAborted();
    return new Blob([encodeWav(buffer)],{type:'audio/wav'});
  }finally{signal?.removeEventListener('abort',cancel);player.stop();}
}
