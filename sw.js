// ホーム画面に置くためだけのSW。データは毎回取りに行く(キャッシュしない)
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
