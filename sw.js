const CACHE_NAME = 'english-pro-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://cdn.jsdelivr.net/npm/chart.js' // CDNもキャッシュ
];

// インストール時にキャッシュを保存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// ネットワークリクエストをインターセプトしてキャッシュから返す
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュがあればそれを返し、なければネットワークへリクエスト
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});