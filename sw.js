// Offline support: app shell precache + cache-first runtime caching for audio, pictures and fonts.
const VERSION = 'bhp-v1.3.4';
const SHELL = ['./','index.html','css/app.css','js/app.js','js/data.js','js/phonics.js','js/missions.js','js/activities.js','js/audio.js',
  'js/store.js','js/sprites.js','js/emoji.js','js/items.js','js/rewards.js','js/fit.js','js/stories.js','js/talk.js','assets/audio/st/timings.json?v=8','assets/audio/silence.mp3','manifest.webmanifest','assets/img/icon.svg','assets/img/icon-192.png','assets/audio/manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isAsset = /\/assets\/(audio|emoji)\//.test(url.pathname) || /fonts\.(gstatic|googleapis)\.com/.test(url.host);
  if (isAsset){
    e.respondWith(caches.open(VERSION).then(async c => { const hit = await c.match(req); if (hit) return hit;
      const res = await fetch(req); if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }));
    return;
  }
  if (url.origin === location.origin){ // network-first for app code so updates arrive quickly
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
  }
});
