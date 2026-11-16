// A chapter's track persists through its missions. Unlock sound on a user gesture.
export function createMusic(createAudio = src => new Audio(src)) {
  let audio = null, source = '', enabled = false;
  return {
    async enable(value = true) {
      enabled = value;
      if (!value) audio?.pause();
      else if (audio) { try { await audio.play(); } catch { return false; } }
      return true;
    },
    async chapter(src) {
      if (src === source) return;
      audio?.pause(); source = src; audio = src ? createAudio(src) : null;
      if (audio) { audio.loop = true; audio.volume = .22; }
      if (enabled && audio) { try { await audio.play(); } catch { /* Next gesture retries. */ } }
    },
    stop() { audio?.pause(); audio = null; source = ''; }
  };
}
