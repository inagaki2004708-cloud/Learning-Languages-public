// sw.js の完全版
// キャッシュネームのバージョンを v2 に上げることで、スマホに「コードが新しくなった」と通知します
const CACHE_NAME = 'english-pro-cache-v2'; 
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    'https://cdn.jsdelivr.net/npm/chart.js' 
];

// インストール時に新しいキャッシュを保存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // 新しいサービスワーカーをすぐにアクティブにする
    );
});

// 古いキャッシュ（v1など）を自動で削除する
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // 古いバージョンのキャッシュを削除
                        console.log('古いキャッシュを削除しました:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // すべてのタブ・ページに即時適用
    );
});

// 【修正後】ネットワークリクエストをインターセプト
self.addEventListener('fetch', event => {
    // 💡 Firebase Auth や Googleの認証関連の通信はキャッシュせずスルーさせる
    if (
        event.request.url.includes('__/') || 
        event.request.url.includes('identitytoolkit') || 
        event.request.url.includes('googleapis')
    ) {
        return; 
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // キャッシュがあればそれを返す
                }
                return fetch(event.request);
            })
    );
});