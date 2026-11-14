// 版本與檔案清單由 vite.config.js 打包時填入，內容不同瀏覽器才會發現新版
const BUILD = '__BUILD__';
const VERSION = '__VERSION__';
const NOTES = '__NOTES__';
const ASSETS = '__ASSETS__';

// 同一個 github.io 網域底下可能還有其他專案，只動自己前綴的快取
const PREFIX = 'fs-island-';
const CACHE = PREFIX + BUILD;
const HASHED = new Set(ASSETS.map((a) => new URL(a, self.location).href));

self.addEventListener('install', (e) => {
  // 不自動接管，等訪客按更新；資源全部下載成功才算裝好，避免更新到一半缺檔
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'GET_VERSION') e.ports[0]?.postMessage({ build: BUILD, version: VERSION, notes: NOTES });
  else if (e.data?.type === 'SKIP_WAITING') e.waitUntil(self.skipWaiting());
});

// 頁面一律先問網路：GitHub Pages 的 HTML 會在瀏覽器留 10 分鐘，要重新驗證才不會拿到舊頁面
async function page(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' });
    if (res.ok) await cache.put('./', res.clone());
    return res;
  } catch {
    return (await cache.match('./')) || Response.error();
  }
}

async function asset(req) {
  const cache = await caches.open(CACHE);
  return (await cache.match(req)) || fetch(req);
}

// 音樂與照片不預先快取，用到才下載
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') e.respondWith(page(e.request));
  else if (HASHED.has(e.request.url)) e.respondWith(asset(e.request));
});
