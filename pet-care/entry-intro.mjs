export function playEntryIntro(dialog) {
 if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const key = 'pet-care-opening-20261122';
 try {
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, 'seen');
 } catch {}

 const video = dialog.querySelector('video');
 const skip = dialog.querySelector('button');
 const events = new AbortController();
 const options = {signal: events.signal};
 return new Promise(resolve => {
  const finish = () => {
   clearTimeout(timeout);
   events.abort();
   dialog.close();
   video.pause();
   video.removeAttribute('src');
   video.load();
   resolve();
  };
  let timeout = setTimeout(finish, 1700);
  video.addEventListener('playing', () => {
   dialog.dataset.playing = 'true';
   clearTimeout(timeout);
   timeout = setTimeout(finish, 5500);
  }, {...options, once:true});
  for (const type of ['ended', 'error']) video.addEventListener(type, finish, options);
  skip.addEventListener('click', finish, options);
  document.addEventListener('visibilitychange', () => {
   if (document.hidden) finish();
  }, options);
  dialog.addEventListener('cancel', event => {
   event.preventDefault();
   finish();
  }, options);
  dialog.showModal();
  video.src = video.dataset.src;
  video.play().catch(() => {
   if (!events.signal.aborted) finish();
  });
 });
}
