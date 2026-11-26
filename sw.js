// 화면 파일(index.html·이미지)을 폰에 저장해 두는 서비스 워커.
// 인터넷이 되면 최신 파일을 쓰고, 느리거나(4초) 끊기면 저장본을 보여 준다.
// 구글(시트 데이터·지도) 요청은 건드리지 않는다. 일정 데이터는 index.html 이 따로 저장한다.
const CACHE = 'trip-v2';
const ASSETS = ['./', './index.html', './hero.webp',
  // 숙소 사진 (오프라인에서도 보이게)
  './photos/stay-07.jpg', './photos/stay-08.jpg', './photos/stay-12.jpg', './photos/stay-13.jpg', './photos/stay-14.jpg', './photos/stay-16.jpg', './photos/stay-18.jpg', './photos/stay-19.jpg', './photos/stay-20.jpg', './photos/stay-22.jpg', './photos/stay-23.jpg', './photos/stay-24.jpg', './photos/stay-34.jpg', './photos/stay-35.jpg', './photos/stay-36.jpg', './photos/stay-39.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const fromNet = fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  const slow = new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 4000));
  e.respondWith(
    Promise.race([fromNet, slow]).catch(() =>
      caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : null) || fromNet)
    )
  );
});
