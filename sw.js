// sw.js
// キャッシュネームのバージョンを v3 に上げることで、変更を強制適用します
const CACHE_NAME = 'english-pro-cache-v3'; 
const urlsToCache = [
    './',
    './index.html',
    './languages.js', // 💡 ここを追加！これがないとオフラインや再起動時にエラーになります
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

