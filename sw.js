// limoo 管理 Service Worker：画面は「ネット優先・失敗したら保存分」で、更新が反映されやすく、圏外でも開ける
const CACHE = 'limoo-admin-v33';
const SHELL = ['./', './index.html', './manifest.webmanifest', './config.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // Supabase等の外部通信はそのまま
  e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
});
// TODO(プッシュ通知): self.addEventListener('push', ...) で「新しい予約が入りました」を表示
