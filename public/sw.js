// 花信风 · Service Worker
// 策略：
//   - install: 预缓存核心壳（index.html / manifest / icons）
//   - fetch: 静态资源 cache-first · 天气 API stale-while-revalidate · 其他 network-first 兜底缓存
//   - activate: 清理旧版本缓存
//
// 增加缓存版本号 CACHE_VERSION 即可触发全量刷新

const CACHE_VERSION = 'v2';
const CACHE_STATIC = `huaxin-static-${CACHE_VERSION}`;
const CACHE_DYNAMIC = `huaxin-dynamic-${CACHE_VERSION}`;
const CACHE_WEATHER = `huaxin-weather-${CACHE_VERSION}`;
const CACHE_IMAGES = `huaxin-images-${CACHE_VERSION}`;

// 核心壳 · 安装时预缓存
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/og-image.png'
];

// ═══════════════════════════════════════════════════════════════
// Install
// ═══════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())  // 即使预缓存失败也继续
  );
});

// ═══════════════════════════════════════════════════════════════
// Activate · 清旧版缓存
// ═══════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_STATIC, CACHE_DYNAMIC, CACHE_WEATHER, CACHE_IMAGES]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => !keep.has(n)).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// ═══════════════════════════════════════════════════════════════
// Fetch 拦截
// ═══════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只处理 GET
  if (req.method !== 'GET') return;

  // 跨域第三方（字体/CDN 等）走 cache-first
  if (url.origin !== self.location.origin) {
    // 天气 API 用 stale-while-revalidate
    if (url.hostname.includes('open-meteo.com')) {
      event.respondWith(staleWhileRevalidate(req, CACHE_WEATHER));
      return;
    }
    // 图片（unsplash / picsum 等）走专门 images 缓存 · cache-first
    if (url.hostname.includes('unsplash.com') ||
        url.hostname.includes('picsum.photos') ||
        url.hostname.includes('source.unsplash.com') ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(url.pathname)) {
      event.respondWith(cacheFirst(req, CACHE_IMAGES));
      return;
    }
    // 其他跨域资源（字体/CDN）cache-first
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // 同站 · 导航请求（index.html）network-first，离线回退缓存
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstShell(req));
    return;
  }

  // 静态资源（JS/CSS/SVG/字体）cache-first
  if (/\.(js|css|svg|png|jpg|jpeg|woff2?|ttf|otf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // 其他默认 network-first + 兜底缓存
  event.respondWith(networkFirst(req, CACHE_DYNAMIC));
});

// ═══════════════════════════════════════════════════════════════
// 策略实现
// ═══════════════════════════════════════════════════════════════

// cache-first: 先查缓存，没有才请求并缓存
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp && resp.status === 200) cache.put(req, resp.clone());
    return resp;
  } catch {
    return cached || Response.error();
  }
}

// network-first: 先请求，失败才用缓存
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const resp = await fetch(req);
    if (resp && resp.status === 200) cache.put(req, resp.clone());
    return resp;
  } catch {
    const cached = await cache.match(req);
    return cached || Response.error();
  }
}

// 导航专用 · 失败返回缓存的 index.html
async function networkFirstShell(req) {
  const cache = await caches.open(CACHE_STATIC);
  try {
    const resp = await fetch(req);
    if (resp && resp.status === 200) cache.put('/', resp.clone());
    return resp;
  } catch {
    const cached = await cache.match('/') || await cache.match('/index.html');
    if (cached) return cached;
    // 兜底离线页
    return new Response(OFFLINE_PAGE, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// stale-while-revalidate: 缓存立刻返回，后台刷新
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((resp) => {
    if (resp && resp.status === 200) cache.put(req, resp.clone());
    return resp;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ═══════════════════════════════════════════════════════════════
// 离线兜底页面（当 index.html 都没缓存时显示）
// ═══════════════════════════════════════════════════════════════
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="zh-CN"><head>
  <meta charset="UTF-8"><title>花信风 · 暂无连接</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:serif;background:#f4ece0;color:#3a2818;margin:0;
      display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;}
    h1{font-size:24px;letter-spacing:8px;margin:0 0 12px;}
    p{font-size:14px;color:#8a7560;letter-spacing:2px;}
    .flower{font-size:56px;opacity:0.5;}
  </style>
</head><body><div>
  <div class="flower">🌸</div>
  <h1>花信风</h1>
  <p>暂无网络连接</p>
  <p style="margin-top:24px;font-size:12px;">请检查网络后刷新页面</p>
</div></body></html>`;

// ═══════════════════════════════════════════════════════════════
// 接收主线程消息（如手动刷新缓存、获取缓存大小）
// ═══════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(names =>
      Promise.all(names.map(n => caches.delete(n)))
    ).then(() => {
      event.source?.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});
