import { HUAXIN_POEMS } from '../data/huaxin.js';

/* ═══════════════════════════════════════════════════════════════
   wrapped · 年鉴数据聚合
   ───────────────────────────────────────────────────────────────
   Spotify Wrapped 风格 · 从 checkins 生成 5 屏卡片数据
     屏 1：你的一年 · 总数字
     屏 2：你最爱的花种 · Top 3
     屏 3：你的足迹 · 省份地图
     屏 4：你最有诗意的一次打卡笔记
     屏 5：一首送你的诗 · 基于最爱花种匹配
   ═══════════════════════════════════════════════════════════════ */

// 可能匹配的季节
const SEASON_OF_MONTH = {
  1: '冬', 2: '冬', 3: '春', 4: '春', 5: '春',
  6: '夏', 7: '夏', 8: '夏',
  9: '秋', 10: '秋', 11: '秋', 12: '冬'
};

/**
 * 检查是否有足够数据生成年鉴
 * @returns {boolean}
 */
export function hasEnoughData(checkins, minCount = 3) {
  if (!checkins) return false;
  const count = Object.keys(checkins).filter(k => {
    const ck = checkins[k];
    return ck && ck.ts;
  }).length;
  return count >= minCount;
}

/**
 * 生成年鉴数据
 * @param {object} checkins - localStorage checkins
 * @param {array} flora - FLORA（含 _st 等计算字段）
 * @param {object} favs - 收藏
 * @param {number} year - 年份 · 默认当前
 */
export function buildWrapped(checkins, flora, favs, year) {
  const targetYear = year || new Date().getFullYear();
  const yearStart = new Date(`${targetYear}-01-01`).getTime();
  const yearEnd = new Date(`${targetYear + 1}-01-01`).getTime();

  // 筛选当年的打卡
  const entries = Object.entries(checkins || {})
    .map(([id, ck]) => {
      if (!ck || !ck.ts || ck.ts < yearStart || ck.ts >= yearEnd) return null;
      const spot = flora.find(f => f.id === Number(id));
      if (!spot) return null;
      return { id: Number(id), spot, ck };
    })
    .filter(Boolean)
    .sort((a, b) => a.ck.ts - b.ck.ts);

  // ═══ 屏 1 · 数字总览 ═══
  const overview = {
    totalCheckins: entries.length,
    uniqueSpots: new Set(entries.map(e => e.id)).size,
    uniqueSpecies: new Set(entries.map(e => e.spot.sp)).size,
    uniqueRegions: new Set(entries.map(e => e.spot.rg)).size,
    favCount: Object.values(favs || {}).filter(v => v).length,
    firstCheckinDate: entries[0]?.ck.date || null,
    lastCheckinDate: entries[entries.length - 1]?.ck.date || null
  };

  // ═══ 屏 2 · 最爱花种 Top 3 ═══
  const speciesCount = {};
  entries.forEach(e => {
    speciesCount[e.spot.sp] = (speciesCount[e.spot.sp] || 0) + 1;
  });
  const topSpecies = Object.entries(speciesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sp, count]) => ({ species: sp, count }));

  // ═══ 屏 3 · 足迹地区 ═══
  const regionCount = {};
  entries.forEach(e => {
    regionCount[e.spot.rg] = (regionCount[e.spot.rg] || 0) + 1;
  });
  const regions = Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .map(([rg, count]) => ({ region: rg, count }));

  // 季节分布
  const seasonCount = { 春: 0, 夏: 0, 秋: 0, 冬: 0 };
  entries.forEach(e => {
    const d = new Date(e.ck.ts);
    const s = SEASON_OF_MONTH[d.getMonth() + 1];
    if (s) seasonCount[s]++;
  });
  const favoriteSeason = Object.entries(seasonCount)
    .sort((a, b) => b[1] - a[1])[0];

  // ═══ 屏 4 · 最有诗意的一次笔记 ═══
  const notesEntries = entries.filter(e => e.ck.note && e.ck.note.trim().length > 0);
  // 选"最长"的一条（简单启发式 · 写得多的更有故事）
  const bestNote = notesEntries
    .sort((a, b) => (b.ck.note?.length || 0) - (a.ck.note?.length || 0))[0] || null;

  // ═══ 屏 5 · 专属诗 ═══
  // 最爱花种 → 对应诗（HUAXIN_POEMS）
  const topSpecies1 = topSpecies[0]?.species;
  const poem = topSpecies1 && HUAXIN_POEMS[topSpecies1]
    ? { species: topSpecies1, ...HUAXIN_POEMS[topSpecies1] }
    : null;

  // ═══ 花月分布（月份条用）═══
  const monthCount = Array.from({ length: 12 }, () => 0);
  entries.forEach(e => {
    const d = new Date(e.ck.ts);
    monthCount[d.getMonth()]++;
  });

  return {
    year: targetYear,
    overview,
    topSpecies,
    regions,
    seasonCount,
    favoriteSeason: favoriteSeason?.[0] || '春',
    monthCount,
    bestNote,
    poem,
    hasData: entries.length > 0
  };
}
