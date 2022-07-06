// Cache name
const CACHE_NAME = 'pwa-sample-caches-v1';
// Cache targets
const urlsToCache = [
  'https://bigaru.com/img',
//  './html001/',
//  './html001/index.html',
//  './html001/pages/a.html',
//  './html001/pages/b.html',
//  './html001/pages/c.html',
//  './html001/css/style.css',
//  './html001/images/a.jpg',
//  './html001/images/b.jpg',
//  './html001/images/c.jpg'
];

// 登録後にインストール
// installは一度だけ発生します
self.addEventListener('install', (event) => {
    console.log("install start");
    // インストール時は静的なキャッシュなどを読む仕様がよい
    // キャッシュの保存はコメント
    // event.waitUntil(
    //     caches
    //         .open(CACHE_NAME)
    //         .then((cache) => {
    //             console.log("caches complete");
    //             return cache.addAll(urlsToCache);
    //         })
    // );
    event.waitUntil(self.skipWaiting());
});

// Service Workerによる制御(Activate)
self.addEventListener('activate', (event) => {
    console.log("activate start");
    event.waitUntil(self.clients.claim());
});


// caches.open(CACHE_NAME).then((cache) => {
//     return cache.add('/hoge.png');
// });

caches.open(CACHE_NAME).then((cache) => {
    console.log("fetch satrtcache.addAll");
    return cache.addAll(urlsToCache);
});

self.addEventListener('fetch', (event) => {
    console.log("fetch satrt");
    // event.respondWith(
    //     caches
    //     .match(event.request)
    //     .then((response) => {
    //         console.log("fetch");
    //         return response ? response : fetch(event.request);
    //     })
    // );


    // event.respondWith(
    //     caches.match(event.request).then((response) => {
    //         if (response) {
    //             return response;
    //         }
    //         return fetch(event.request);
    //     })
    // );
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request).then((response) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});

