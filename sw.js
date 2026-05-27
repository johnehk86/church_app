const CACHE_NAME = 'church-store-v3';
const STATIC_ASSETS = [
  './css/style.css',
  './assets/icons/church-logo.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 페이지 이동(navigation)은 항상 네트워크 우선 (로그인 리다이렉트 보장)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 외부 URL은 무시
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // JS 파일은 항상 네트워크에서 가져옴 (최신 코드 보장)
  if (event.request.url.endsWith('.js')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS, 이미지 등은 캐시 활용
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
