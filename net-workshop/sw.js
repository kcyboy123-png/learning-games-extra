// v1.0.0: compact stages and optional entrance media.
const CACHE='net-workshop-v75';

const FILES=['./','./index.html','./style.css','./app.mjs','./media.mjs','./media/intro-poster.jpg','./stage-game.mjs','./challenge.mjs', './direct-fold.mjs','./geometry.mjs','./questions.mjs','./progress.mjs','./curriculum.mjs','./bank-data.mjs','./printables/cube-nets.pdf','./printables/question-nets.pdf','./printables/teacher-guide.pdf','./scene.mjs','./icon.svg','./vendor/three.module.js','./fonts/SUIT-Regular.woff2','./fonts/SUIT-Bold.woff2'];

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));

self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('net-workshop-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

self.addEventListener('fetch',event=>{

  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;

  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request,{ignoreSearch:true})).then(response=>response||new Response('오프라인에서 이 파일을 찾을 수 없습니다.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));

});

