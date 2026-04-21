// 花信风 · 行程相关工具函数
import { distKm } from './phenology.js';

// ═══════════════════════════════════════════════════════════════
// TSP 最近邻贪心算法（近似最优路径）
// 从第一个景点开始，每次找最近的未访问景点
// 不是最优解但计算快（O(n²)），对 <50 点的行程足够
// ═══════════════════════════════════════════════════════════════
export function optimizeTripOrder(spots) {
  if (spots.length <= 2) return [...spots];
  const result = [spots[0]];
  const remaining = spots.slice(1);
  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let minIdx = 0, minDist = Infinity;
    remaining.forEach((s, i) => {
      const d = distKm(last.lat, last.lon, s.lat, s.lon);
      if (d < minDist) { minDist = d; minIdx = i; }
    });
    result.push(remaining.splice(minIdx, 1)[0]);
  }
  return result;
}

// 相邻景点间距离（km 数组）
export function calcLegs(spots) {
  const legs = [];
  for (let i = 0; i < spots.length - 1; i++) {
    legs.push(distKm(spots[i].lat, spots[i].lon, spots[i + 1].lat, spots[i + 1].lon));
  }
  return legs;
}

export function totalDistance(legs) {
  return legs.reduce((a, b) => a + b, 0);
}

// ═══════════════════════════════════════════════════════════════
// 花期重叠窗口
// 计算所有景点花期交集，返回可同时看完的时间窗（相对今天的 ±N 天）
// 如果窗口为空（没有任何时间能同时看），则建议分批
// ═══════════════════════════════════════════════════════════════
export function findBloomWindow(spots) {
  const windows = spots.map(s => {
    if (!s._pred) return null;
    const { daysUntil } = s._pred;
    // 假设每个景点花期 ± 7 天
    return [daysUntil - 7, daysUntil + 7];
  }).filter(Boolean);

  if (windows.length === 0) return null;
  if (windows.length < spots.length) return { partial: true };

  const maxStart = Math.max(...windows.map(w => w[0]));
  const minEnd = Math.min(...windows.map(w => w[1]));
  if (maxStart > minEnd) return { impossible: true, spread: Math.min(...windows.map(w => w[0])) };
  return { start: maxStart, end: minEnd };
}

// 把相对天数转成日期字符串
export function daysToDateStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ═══════════════════════════════════════════════════════════════
// 生成行程文字导出（Markdown 格式）
// ═══════════════════════════════════════════════════════════════
export function exportTripToText(spots, legs) {
  const lines = [];
  lines.push(`# 花信风 · 赏花行程`);
  lines.push(`*${new Date().toLocaleDateString('zh-CN')} 制定 · ${spots.length} 站 · ${totalDistance(legs).toFixed(0)} 公里*`);
  lines.push('');
  spots.forEach((s, i) => {
    const num = i + 1;
    lines.push(`## ${num}. ${s.n}`);
    lines.push(`- **花种**：${s.sp}`);
    if (s._pred) lines.push(`- **预计盛花**：${s._pred.dateStr}（置信度 ${s._pred.confidence}%）`);
    if (s.tp) lines.push(`- **贴士**：${s.tp}`);
    if (i < spots.length - 1) {
      lines.push(`- **至下一站**：${legs[i].toFixed(0)} km`);
    }
    lines.push('');
  });
  lines.push(`---`);
  lines.push(`*由花信风自动生成 · huaxinfeng.app*`);
  return lines.join('\n');
}
