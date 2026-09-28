/* 독해수업 PWA 서비스 워커 — 파일을 새로 올릴 때 VERSION 숫자를 하나 올리면 설치된 앱이 새 내용으로 갱신됩니다. */
const VERSION = 'v2';
const CACHE = 'reading-class-' + VERSION;
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 네트워크 우선, 실패하면 캐시(오프라인) — 새 파일을 올리면 다음 실행 때 바로 반영됩니다. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; /* 구글 폰트·네이버 사전 등은 그대로 둠 */
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
