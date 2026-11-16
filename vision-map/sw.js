// 画面だけを手元に置く（データは毎回クラウドから）。版を変えたら名前を変える
const V = "vmap-v4";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(["./", "index.html", "manifest.json", "talk.js", "sales_talk.js"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => { const u = new URL(e.request.url); if (u.origin === location.origin && e.request.method === "GET") e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });
