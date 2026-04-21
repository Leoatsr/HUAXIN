/* ═══════════════════════════════════════════════════════════════
   geolocation · 用户定位 · 三层降级
   ───────────────────────────────────────────────────────────────
   Layer 1 · 浏览器 Geolocation API（精确，需用户授权）
   Layer 2 · IP 粗定位（省级精度，无需授权，ipapi.co）
   Layer 3 · 默认值（洛阳·国花园 · 最有国风认知度的地点）

   所有 WGS-84 坐标，由调用方按需转换
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_LOCATION = {
  lat: 34.6198,
  lon: 112.4542,
  name: '洛阳',
  source: 'default',
  accuracy: null
};

/**
 * 获取用户位置 · 自动降级
 * @param {object} opts - { timeout: 毫秒, skipPrecise: 跳过精确定位 }
 * @returns {Promise<{lat, lon, name?, source, accuracy?}>}
 */
export async function getUserLocation(opts = {}) {
  const timeout = opts.timeout || 5000;

  // Layer 1 · 浏览器 Geolocation
  if (!opts.skipPrecise && navigator.geolocation) {
    try {
      const pos = await precisePosition(timeout);
      return {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        source: 'gps',
        accuracy: pos.coords.accuracy
      };
    } catch (e) {
      // 用户拒绝 / 超时 / 不可用 → 继续降级
    }
  }

  // Layer 2 · IP 粗定位
  try {
    const ipLoc = await ipLocation(Math.min(timeout, 3000));
    if (ipLoc) return ipLoc;
  } catch (e) {
    // IP API 失败 → 降级
  }

  // Layer 3 · 默认
  return DEFAULT_LOCATION;
}

function precisePosition(timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout);
    navigator.geolocation.getCurrentPosition(
      pos => { clearTimeout(timer); resolve(pos); },
      err => { clearTimeout(timer); reject(err); },
      { enableHighAccuracy: false, timeout, maximumAge: 60 * 60 * 1000 }
    );
  });
}

async function ipLocation(timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    // ipapi.co · 免费无需 key · CORS 支持 · 多备一个 fallback
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') return null;
    return {
      lat: data.latitude,
      lon: data.longitude,
      name: data.city || data.region || data.country_name,
      source: 'ip',
      accuracy: 50000  // 50km 粗估
    };
  } catch (e) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * 计算两点距离（公里）· 球面直线
 */
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 在 flora 里找「附近正在盛花」的景点
 * @param {array} flora - 带 _st 状态的景点列表
 * @param {object} loc - { lat, lon }
 * @param {number} radiusKm - 搜索半径
 * @param {number} limit - 最多返回几个
 * @returns {array} 附近景点（按距离排序）
 */
export function findNearbyBlooming(flora, loc, radiusKm = 100, limit = 3) {
  const withDistance = flora
    .filter(f => f._st && f._st.l >= 2)  // 初开+ 算正开
    .map(f => ({
      ...f,
      _distance: haversine(loc.lat, loc.lon, f.lat, f.lon)
    }))
    .filter(f => f._distance <= radiusKm)
    .sort((a, b) => a._distance - b._distance);

  return withDistance.slice(0, limit);
}

/**
 * 搜索失败时的降级：按赏花热度找全国 Top 3
 */
export function fallbackTopBlooming(flora, limit = 3) {
  return flora
    .filter(f => f._st && f._st.l >= 3)  // 盛花
    .slice(0, limit);
}
