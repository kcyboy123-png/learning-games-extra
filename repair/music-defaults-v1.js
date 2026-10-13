/* Apply the music-on default once; subsequent user choices remain saved. */
(() => {
  'use strict';
  const game = document.currentScript.dataset.game;
  const configs = {
    ttukttak: {key: 'ttukttak_audio_v1', volume: 28},
    starlight: {key: 'starlight-history-v1', volume: .3},
    repair: {key: 'ttakmatne-save-v1', volume: 25, nested: true, master: 'sound'},
    goryeo: {key: 'goryeo-audio-v1', volume: 25, master: 'enabled'}
  };
  const config = configs[game];
  if (!config) return;
  const marker = 'changyong-music-default-20261011:' + game;
  try {
    if (localStorage.getItem(marker) === 'applied') return;
    const raw = localStorage.getItem(config.key);
    if (raw !== null) {
      const record = JSON.parse(raw);
      // Preserve unreadable/foreign saves for the game's own recovery flow.
      if (!record || typeof record !== 'object' || Array.isArray(record)) return;
      const prefs = config.nested ? record.settings : record;
      if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) return;
      prefs.music = true;
      if (config.master) prefs[config.master] = true;
      if (!Number.isFinite(prefs.musicVolume) || prefs.musicVolume <= 0) {
        prefs.musicVolume = config.volume;
      }
      localStorage.setItem(config.key, JSON.stringify(record));
    }
    localStorage.setItem(marker, 'applied');
  } catch (_) {
    // Restricted storage must never prevent a student from starting a game.
  }
})();
