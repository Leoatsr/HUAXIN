import { POEM_MAP } from '../data/poem-flora-map.js';

/* ═══════════════════════════════════════════════════════════════
   poem-match · 诗词 ↔ 景点 双向匹配
   ───────────────────────────────────────────────────────────────
   策略：
     · 同花种是硬条件（毕竟写梅的诗要配梅花景点）
     · 月份重合 +30 分
     · 氛围标签匹配 +20 分每项
     · 特定场景匹配（"高山"→海拔推断/"古寺"→景点名含寺等）+10 分
   ═══════════════════════════════════════════════════════════════ */

/**
 * 根据一首诗 · 推荐 N 个景点
 * @param {object} poem - POEM_MAP 里的一条
 * @param {array} flora - FLORA 列表
 * @param {number} limit - 最多返回几个
 * @returns {array} [{ spot, score, reasons }]
 */
export function recommendSpotsForPoem(poem, flora, limit = 6) {
  if (!poem) return [];

  const candidates = flora.filter(f => f.sp === poem.species);
  if (candidates.length === 0) return [];

  const scored = candidates.map(spot => {
    let score = 50;  // 起步分（花种已经匹配）
    const reasons = [];

    // 1. 花期月份重合
    if (poem.months && spot.pk) {
      const overlap = poem.months.some(m => {
        const [start, end] = spot.pk;
        if (start <= end) return m >= start && m <= end;
        return m >= start || m <= end;
      });
      if (overlap) {
        score += 30;
        reasons.push('花期相符');
      }
    }

    // 2. 氛围匹配（基于景点名和诗的氛围标签）
    const name = spot.n || '';
    const atmo = poem.atmosphere || [];

    if (atmo.includes('temple') && /[寺庵]/.test(name)) {
      score += 25;
      reasons.push('古寺氛围');
    }
    if (atmo.includes('alpine')) {
      // 高山 · 景点名含山、峰、岭
      if (/[山峰岭]/.test(name)) {
        score += 18;
        reasons.push('高山之境');
      }
    }
    if (atmo.includes('field') || atmo.includes('rural')) {
      // 田野 · 名字含田、乡、村
      if (/[田乡村落坪]/.test(name)) {
        score += 18;
        reasons.push('田野风光');
      }
    }
    if (atmo.includes('pond') || atmo.includes('vast')) {
      // 水景 · 名字含湖、池、湾、塘
      if (/[湖池塘湾潭泉]/.test(name)) {
        score += 20;
        reasons.push('水畔之境');
      }
    }
    if (atmo.includes('garden') || atmo.includes('royal')) {
      // 园 · 名字含园、苑、坛
      if (/[园苑坛]/.test(name)) {
        score += 15;
        reasons.push('园中雅致');
      }
    }
    if (atmo.includes('snow') || atmo.includes('cold')) {
      // 雪景 · 偏北方（简单判断 · 景点区 rg 含"东北""华北""西北"）
      if (/东北|华北|西北|内蒙|新疆|东三省/.test(spot.rg || '')) {
        score += 20;
        reasons.push('北方寒地');
      }
    }

    // 3. 已指定推荐（硬加分）
    if (poem.recommendedSpots && poem.recommendedSpots.includes(spot.id)) {
      score += 40;
      reasons.unshift('精选');
    }

    return { spot, score, reasons };
  });

  // 分数高 → 前
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}


/**
 * 根据景点 · 反查相关诗
 * @param {object} spot - 一个景点
 * @param {number} limit - 最多返回几首
 * @returns {array} [{ poem, score }]
 */
export function recommendPoemsForSpot(spot, limit = 3) {
  if (!spot) return [];

  const candidates = POEM_MAP.filter(p => p.species === spot.sp);
  if (candidates.length === 0) return [];

  const scored = candidates.map(poem => {
    let score = 50;
    const reasons = [];

    // 花期月份
    if (poem.months && spot.pk) {
      const overlap = poem.months.some(m => {
        const [start, end] = spot.pk;
        if (start <= end) return m >= start && m <= end;
        return m >= start || m <= end;
      });
      if (overlap) { score += 25; reasons.push('花期相符'); }
    }

    // 氛围复用上面的规则（反向）
    const name = spot.n || '';
    const atmo = poem.atmosphere || [];

    if (atmo.includes('temple') && /[寺庵]/.test(name)) { score += 20; reasons.push('古寺'); }
    if (atmo.includes('alpine') && /[山峰岭]/.test(name)) { score += 15; }
    if (atmo.includes('pond') && /[湖池塘]/.test(name)) { score += 18; reasons.push('水畔'); }
    if (atmo.includes('garden') && /[园苑]/.test(name)) { score += 12; }

    return { poem, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}


/**
 * 按氛围标签筛选诗
 * @param {string} atmosphere - 单个氛围标签（如 'snow'）
 * @returns {array} POEM_MAP 中匹配的
 */
export function filterPoemsByAtmosphere(atmosphere) {
  if (!atmosphere || atmosphere === 'all') return POEM_MAP;
  return POEM_MAP.filter(p => (p.atmosphere || []).includes(atmosphere));
}


/**
 * 按季节筛诗
 */
export function filterPoemsByMonth(month) {
  if (month == null) return POEM_MAP;
  return POEM_MAP.filter(p => (p.months || []).includes(month));
}
