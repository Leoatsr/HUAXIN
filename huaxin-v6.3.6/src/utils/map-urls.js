import { wgs84ToGcj02, wgs84ToBd09 } from './coords.js';

/* ═══════════════════════════════════════════════════════════════
   导航 URL 构造器
   ───────────────────────────────────────────────────────────────
   支持：
     · 高德 (amap)    移动端优先 scheme · web fallback
     · 百度 (baidu)   移动端优先 scheme · web fallback
     · 腾讯 (qq)      只有 web（app scheme 需要注册 key）
     · Google         境外 / 海外华人

   每家地图的坐标系都不一样：
     · 高德/腾讯/Google China  → GCJ-02
     · 百度                   → BD-09
     · Google (海外)           → WGS-84（直接用）

   功能：
     · POI 定位（单点）
     · 路径规划（起点 + 终点）
   ═══════════════════════════════════════════════════════════════ */

/* 检测运行环境 · 是否移动端 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/* ═══ 高德地图 URL ═══ */
// 单点定位
export function amapMarkerUrl({ lon, lat, name }) {
  const [gLon, gLat] = wgs84ToGcj02(lon, lat);
  const n = encodeURIComponent(name);
  return `https://uri.amap.com/marker?position=${gLon},${gLat}&name=${n}&src=huaxinfeng&coordinate=gaode&callnative=1`;
}

// 路径规划（起点可选 · 不传则由高德获取当前位置）
export function amapNavigationUrl({ lon, lat, name, fromLon, fromLat, fromName, mode = 'car' }) {
  const [gLon, gLat] = wgs84ToGcj02(lon, lat);
  const n = encodeURIComponent(name);
  let url = `https://uri.amap.com/navigation?to=${gLon},${gLat},${n}&mode=${mode}&policy=1&src=huaxinfeng&coordinate=gaode&callnative=1`;
  if (fromLon && fromLat) {
    const [fLon, fLat] = wgs84ToGcj02(fromLon, fromLat);
    const fn = encodeURIComponent(fromName || '我的位置');
    url += `&from=${fLon},${fLat},${fn}`;
  }
  return url;
}

// App scheme（iOS / Android 原生直达）
export function amapAppScheme({ lon, lat, name, mode = 'car' }) {
  const [gLon, gLat] = wgs84ToGcj02(lon, lat);
  const n = encodeURIComponent(name);
  if (isIOS()) {
    return `iosamap://path?sourceApplication=huaxinfeng&dlat=${gLat}&dlon=${gLon}&dname=${n}&dev=0&t=${mode === 'walk' ? 2 : mode === 'bus' ? 1 : 0}`;
  }
  if (isAndroid()) {
    return `androidamap://route?sourceApplication=huaxinfeng&dlat=${gLat}&dlon=${gLon}&dname=${n}&dev=0&t=${mode === 'walk' ? 2 : mode === 'bus' ? 1 : 0}`;
  }
  return null;
}

/* ═══ 百度地图 URL ═══ */
export function baiduMarkerUrl({ lon, lat, name }) {
  const [bLon, bLat] = wgs84ToBd09(lon, lat);
  const n = encodeURIComponent(name);
  return `https://api.map.baidu.com/marker?location=${bLat},${bLon}&title=${n}&output=html&src=huaxinfeng`;
}

export function baiduNavigationUrl({ lon, lat, name, mode = 'driving' }) {
  const [bLon, bLat] = wgs84ToBd09(lon, lat);
  const n = encodeURIComponent(name);
  return `https://api.map.baidu.com/direction?destination=latlng:${bLat},${bLon}|name:${n}&mode=${mode}&output=html&src=huaxinfeng`;
}

export function baiduAppScheme({ lon, lat, name, mode = 'driving' }) {
  const [bLon, bLat] = wgs84ToBd09(lon, lat);
  const n = encodeURIComponent(name);
  // 百度统一使用 bdapp 协议（iOS/Android 共用）
  return `bdapp://map/direction?destination=latlng:${bLat},${bLon}|name:${n}&coord_type=bd09ll&mode=${mode}&src=huaxinfeng`;
}

/* ═══ 腾讯地图 URL（只有 web） ═══ */
export function qqMapUrl({ lon, lat, name }) {
  const [qLon, qLat] = wgs84ToGcj02(lon, lat);
  const n = encodeURIComponent(name);
  return `https://apis.map.qq.com/uri/v1/marker?marker=coord:${qLat},${qLon};title:${n};addr:${n}&referer=huaxinfeng`;
}

export function qqMapNavUrl({ lon, lat, name, mode = 'driving' }) {
  const [qLon, qLat] = wgs84ToGcj02(lon, lat);
  const n = encodeURIComponent(name);
  return `https://apis.map.qq.com/uri/v1/routeplan?type=${mode}&to=${n}&tocoord=${qLat},${qLon}&referer=huaxinfeng`;
}

/* ═══ Google Maps URL（境外优先） ═══ */
export function googleMapsUrl({ lon, lat, name }) {
  // Google 用 WGS-84 原始坐标
  const n = encodeURIComponent(name);
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${n}`;
}

export function googleMapsDirUrl({ lon, lat, name }) {
  const n = encodeURIComponent(name);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${n}&travelmode=driving`;
}

/* ═══════════════════════════════════════════════════════════════
   智能跳转函数 · 移动端尝试 App · 失败回落 web
   ═══════════════════════════════════════════════════════════════ */
export function smartOpenAmap({ lon, lat, name, mode = 'car', useApp = true }) {
  if (!useApp || !isMobile()) {
    // 桌面直接 web
    window.open(amapNavigationUrl({ lon, lat, name, mode }), '_blank');
    return;
  }

  // 移动端：尝试唤起 App，2 秒内没跳走就回落 web
  const appUrl = amapAppScheme({ lon, lat, name, mode });
  const webUrl = amapNavigationUrl({ lon, lat, name, mode });

  if (!appUrl) {
    window.open(webUrl, '_blank');
    return;
  }

  const fallbackTimer = setTimeout(() => {
    window.location.href = webUrl;
  }, 2000);

  // 如果用户跳走了 App（页面隐藏），清除 fallback
  const onVisible = () => {
    if (document.hidden) clearTimeout(fallbackTimer);
  };
  document.addEventListener('visibilitychange', onVisible, { once: true });

  window.location.href = appUrl;
}

export function smartOpenBaidu({ lon, lat, name, mode = 'driving', useApp = true }) {
  if (!useApp || !isMobile()) {
    window.open(baiduNavigationUrl({ lon, lat, name, mode }), '_blank');
    return;
  }
  const appUrl = baiduAppScheme({ lon, lat, name, mode });
  const webUrl = baiduNavigationUrl({ lon, lat, name, mode });

  const fallbackTimer = setTimeout(() => {
    window.location.href = webUrl;
  }, 2000);
  const onVisible = () => { if (document.hidden) clearTimeout(fallbackTimer); };
  document.addEventListener('visibilitychange', onVisible, { once: true });
  window.location.href = appUrl;
}

/* ═══════════════════════════════════════════════════════════════
   获取用户当前位置 · Promise
   ═══════════════════════════════════════════════════════════════ */
export function getUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000, ...options }
    );
  });
}
