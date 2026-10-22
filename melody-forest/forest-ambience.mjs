// Forest sound never shares the composition player's context or scheduled notes.
export function createForestAmbience({AudioClass=globalThis.Audio,chime=false}={}) {
  const make=(file,loop,gain)=>{
    if(typeof AudioClass!=='function')return null;
    const audio=new AudioClass(new URL(`./assets/audio/forest/${file}`,import.meta.url).href);
    audio.loop=loop;audio.preload='none';audio.volume=0;audio.muted=true;
    return {audio,gain,pending:null,playing:false,blocked:false};
  };
  const bgm=make('forest-entry.mp3',true,.18),bell=chime?make('forest-chime.mp3',false,.14):null;
  const tracks=[bgm,bell].filter(Boolean);
  let state={phase:null,screen:'edit',volume:.45,hidden:false,enabled:true},unlocked=false,dead=false,chimed=false;
  const exploring=()=>!dead&&unlocked&&state.enabled&&!state.hidden&&state.screen==='edit'&&['opening','arrive','walk'].includes(state.phase)&&state.volume>0;
  function halt(track){
    track.pending=null;track.playing=false;track.audio.muted=true;track.audio.volume=0;track.audio.pause();
    try{track.audio.currentTime=0;}catch{/* Metadata may not be available yet. */}
  }
  function start(track){
    track.audio.muted=false;track.audio.volume=state.volume*track.gain;
    if(track.pending||track.playing||track.blocked)return;
    const attempt={};track.pending=attempt;
    if(track===bell)chimed=true;
    const failed=()=>{
      if(track.pending!==attempt)return;
      track.pending=null;track.playing=false;track.blocked=true;
      track.audio.muted=true;track.audio.volume=0;track.audio.pause();
      if(track===bell)chimed=false;
    };
    let play;
    try{play=track.audio.play();}catch{failed();return;}
    Promise.resolve(play).then(()=>{
      // A late play() must never resurrect audio over the notebook or a hidden tab.
      if(!exploring()){halt(track);return;}
      if(track.pending===attempt){track.pending=null;track.playing=true;}
    },failed);
  }
  function reconcile(){
    if(!exploring()){tracks.forEach(halt);return;}
    if(bgm)start(bgm);
    if(bell&&!chimed)start(bell);
    else if(bell&&!bell.blocked)bell.audio.volume=state.volume*bell.gain;
  }
  return {
    sync(next={}){
      if(dead)return;
      state={...state,...next};state.volume=Number.isFinite(state.volume)?Math.max(0,Math.min(1,state.volume)):0;
      reconcile();
    },
    // The caller invokes this only from a trusted pointer/key gesture, and may retry after browser blocking.
    unlock(){if(dead)return;unlocked=true;tracks.forEach(t=>t.blocked=false);reconcile();},
    dispose(){
      if(dead)return;dead=true;tracks.forEach(t=>{halt(t);t.audio.removeAttribute?.('src');t.audio.load?.();});
    }
  };
}
