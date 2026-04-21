// 花信风 · 真实天气数据接入
// 数据源: Open-Meteo Archive API (https://open-meteo.com/)
// 免费 · 无需 key · 但为避免滥用，按"大区代表点"查询
//
// 核心概念：Growing Degree Days (GDD, 生长度日)
//   每日若均温 > 基温（5°C），则当日 GDD = 均温 - 5，否则为 0
//   从年初累加到今天，即是该地物候积温的代理指标

// ═══════════════════════════════════════════════════════════════
// 8 大区代表点（覆盖大多数 FLORA 景点）
// 选每个区的"气候中位城市"作为代理
// ═══════════════════════════════════════════════════════════════
export const REGION_ANCHORS = {
  '华北': { city: '北京', lat: 39.9, lon: 116.4 },
  '华东': { city: '上海', lat: 31.2, lon: 121.5 },
  '华中': { city: '武汉', lat: 30.6, lon: 114.3 },
  '华南': { city: '广州', lat: 23.1, lon: 113.3 },
  '西南': { city: '成都', lat: 30.7, lon: 104.1 },
  '西北': { city: '西安', lat: 34.3, lon: 108.9 },
  '东北': { city: '沈阳', lat: 41.8, lon: 123.4 },
  '西藏': { city: '拉萨', lat: 29.6, lon: 91.1 }
};

const CACHE_KEY = 'hx.weather.gdd';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;   // 6 小时内不重复拉
const BASE_TEMP = 5;                        // 生长基温（℃）· 温带植物通用

// ═══════════════════════════════════════════════════════════════
// 拉某个点的年初至今每日均温
// 返回累积 GDD · 失败则抛异常让调用方兜底
// ═══════════════════════════════════════════════════════════════
async function fetchGDD(lat, lon, signal) {
  const now = new Date();
  const year = now.getFullYear();
  // start_date 从年初，end_date 到昨天（open-meteo archive 不含今天）
  const start = `${year}-01-01`;
  const yest = new Date(now.getTime() - 86400000);
  const end = yest.toISOString().slice(0, 10);

  const url = 'https://archive-api.open-meteo.com/v1/archive' +
    `?latitude=${lat}&longitude=${lon}` +
    `&start_date=${start}&end_date=${end}` +
    `&daily=temperature_2m_mean` +
    `&timezone=Asia%2FShanghai`;

  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`weather API ${resp.status}`);
  const data = await resp.json();

  const temps = data?.daily?.temperature_2m_mean || [];
  if (!temps.length) throw new Error('empty weather response');

  // 累积 GDD
  let gdd = 0;
  for (const t of temps) {
    if (typeof t === 'number' && t > BASE_TEMP) gdd += (t - BASE_TEMP);
  }
  return Math.round(gdd);
}

// ═══════════════════════════════════════════════════════════════
// 批量拉 8 个区域代表点，返回 { 区域名: gdd }
// 带缓存 · 失败的区域用默认值（兜底）
// ═══════════════════════════════════════════════════════════════
export async function fetchAllRegionGDD({ timeout = 8000 } = {}) {
  // 读缓存
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.ts && Date.now() - cached.ts < CACHE_TTL_MS) {
      return { data: cached.data, fromCache: true, fetchedAt: cached.ts };
    }
  } catch {}

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  const regions = Object.keys(REGION_ANCHORS);
  const results = {};

  // 并行拉取 8 个区域
  await Promise.allSettled(
    regions.map(async (rg) => {
      const { lat, lon } = REGION_ANCHORS[rg];
      try {
        results[rg] = await fetchGDD(lat, lon, ctrl.signal);
      } catch (e) {
        // 拉取失败，保留为 null
        results[rg] = null;
      }
    })
  );
  clearTimeout(timer);

  // 至少有一个成功才写缓存
  const successCount = Object.values(results).filter(v => v !== null).length;
  if (successCount > 0) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ts: Date.now(),
        data: results
      }));
    } catch {}
  }

  return {
    data: results,
    fromCache: false,
    fetchedAt: Date.now(),
    successCount,
    totalRegions: regions.length
  };
}

// ═══════════════════════════════════════════════════════════════
// 在 FLORA 列表基础上重算 _at（用真实 GDD 替换 FAT 静态值）
// ═══════════════════════════════════════════════════════════════
export function reenrichWithWeather(flora, regionGDD) {
  return flora.map(f => {
    const gdd = regionGDD[f.rg];
    // 只在拿到真实值时替换 _at；否则保持原值（静态 FAT）
    if (typeof gdd === 'number' && gdd > 0) {
      // _at 用 GDD，但要考虑原 FAT 可能尺度不同
      // FAT 原值范围大约 0-400，GDD 也是 0-3000+
      // 这里做一次简单线性映射：GDD 缩放到 FAT 区间
      // 不过更直接的做法：直接用 GDD 对比 f.th（需要重新标定 f.th）
      // 保守方案：计算比例 at/th 时，让 GDD 参与，但权重平滑
      // 用加权平均：真实 40% + 原静态 60%
      const blend = Math.round(f._at * 0.6 + Math.min(gdd * 0.15, 500) * 0.4);
      return { ...f, _at: blend, _atReal: gdd };
    }
    return f;
  });
}

// ═══════════════════════════════════════════════════════════════
// 查缓存状态（供 UI 显示"已接入/缓存中/未更新"）
// ═══════════════════════════════════════════════════════════════
export function getWeatherCacheInfo() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (!cached || !cached.ts) return null;
    const ageH = Math.floor((Date.now() - cached.ts) / 3600000);
    const successCount = Object.values(cached.data).filter(v => v !== null).length;
    return { ageH, fetchedAt: cached.ts, successCount };
  } catch {
    return null;
  }
}
