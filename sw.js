const CACHE_NAME = 'church-store-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/config/firebase.js',
  './js/services/auth.js',
  './js/services/store.js',
  './js/services/storage.js',
  './js/components/header.js',
  './js/components/store-card.js',
  './js/components/bottom-nav.js',
  './js/components/image-upload.js',
  './js/pages/login.js',
  './js/pages/home.js',
  './js/pages/detail.js',
  './js/pages/map.js',
  './js/pages/business.js',
  './js/pages/admin.js',
  './js/pages/install.js',
  './manifest.json',
  './assets/icons/church-logo.png'
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
  // 외부 API는 캐시하지 않음
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('googleapis') ||
      url.includes('gstatic') || url.includes('kakao') ||
      url.includes('naver') || url.includes('nominatim') ||
      url.includes('qrserver') || url.includes('unpkg') ||
      url.includes('fonts.google')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
