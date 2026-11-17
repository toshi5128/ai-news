// 入れるだけ（ホーム画面に追加できるように）。キャッシュはしない＝いつも最新を読む
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
