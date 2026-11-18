import {createMusic} from './math/lib/media.mjs';
import {setSoundEnabled,sfx} from './math/ui/audio.mjs?v=audio-journey-20261117';

// Sound preferences stay separate from the child's learning record.
export function createPostSound(storage) {
  const key='dotori-dokdo-post:sound:v1', music=createMusic();
  // Each visit starts with music and effects on; mute remains available for this visit.
  let enabled=true, unlocked=false, playing=false;
  music.chapter(new URL('./assets/audio/forest-post.mp3',import.meta.url).href);
  const apply=async()=>{const audible=enabled&&unlocked&&!document.hidden;setSoundEnabled(audible);if(audible&&playing)return true;playing=audible;const ok=await music.enable(audible);if(!ok)playing=false;return ok;};
  const unlock=()=>{unlocked=true;apply();};
  document.addEventListener('pointerdown',unlock,{once:true});
  document.addEventListener('keydown',unlock,{once:true});
  document.addEventListener('visibilitychange',apply);
  addEventListener('pagehide',()=>{playing=false;music.enable(false);setSoundEnabled(false);});
  addEventListener('pageshow',apply);
  return {
    sfx,
    get enabled(){return enabled;},
    async toggle(){enabled=!enabled;unlocked=true;try{storage?.setItem(key,enabled?'on':'off');}catch{}const played=await apply();if(enabled)sfx.select();return played;},
    unlock
  };
}
