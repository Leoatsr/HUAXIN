// 花信风 · 物候推算（从原 App.jsx 抽取并加注释）
import { FAT } from '../data/constants.js';

// 获取当前季节 - 按北半球物候粗分
export function getSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

// 两个经纬度之间的球面距离（km）
export function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dO = (lon2 - lon1) * Math.PI / 180;
  const x = Math.sin(dL / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ═══ 基于三年历史数据的花期预测 ═══
// f: FLORA 单条记录
// 返回 { month, day, daysUntil, confidence, dateStr } 或 null
export function predictBloom(f) {
  if (!f.hist || f.hist.length === 0) return null;

  // 解析历史盛花日期 → 年内序日
  const doys = f.hist.map(d => {
    const [m, dd] = d.split('-').map(Number);
    return (m - 1) * 30.44 + dd;
  });
  const avgDoy = doys.reduce((a, b) => a + b, 0) / doys.length;

  // 根据积温比例调整：积温越高开得越早
  const atRatio = (FAT[f.id] || 200) / f.th;
  const adjust = atRatio > 1 ? -3 : atRatio > 0.85 ? 0 : Math.round((1 - atRatio) * 20);
  const predDoy = Math.round(avgDoy + adjust);
  const predMonth = Math.min(12, Math.max(1, Math.ceil(predDoy / 30.44)));
  const predDay = Math.min(28, Math.max(1, Math.round(predDoy - (predMonth - 1) * 30.44)));

  // 距今天数
  const now = new Date();
  const nowDoy = now.getMonth() * 30.44 + now.getDate();
  const daysUntil = predDoy - nowDoy;

  // 置信度：越近越高
  const confidence =
    daysUntil <= 0 ? 95 :
    daysUntil < 15 ? 88 :
    daysUntil < 30 ? 75 :
    daysUntil < 60 ? 60 : 45;

  return {
    month: predMonth,
    day: predDay,
    daysUntil: Math.round(daysUntil),
    confidence,
    dateStr: `${predMonth}月${predDay}日`
  };
}

// ═══ 根据积温/阈值/预测，计算景点当前花期状态 ═══
// 返回 { st, l }  st=状态文案, l=状态等级 0-4
export function calcSt(at, th, pred) {
  const p = th > 0 ? at / th : 0;
  if (pred && pred.daysUntil < -14) return { st: '已谢', l: 0 };
  if (pred && pred.daysUntil < -7)  return { st: '末花期', l: 1 };
  if (p >= 1.2) return { st: '已谢', l: 0 };
  if (p >= 1)   return { st: '盛花期', l: 4 };
  if (p >= 0.85) return { st: '初花期', l: 3 };
  if (p >= 0.7) return { st: '含苞待放', l: 2 };
  return { st: '积温中', l: 1 };
}

// ═══ 为 FLORA 列表批量生成物候数据 ═══
// 返回新数组，每个元素带 _at/_st/_pred 字段
export function enrichFlora(floraArr) {
  return floraArr.map(f => {
    const _pred = predictBloom(f);
    const _at = FAT[f.id] || 200;
    const _st = calcSt(_at, f.th, _pred);
    return { ...f, _at, _st, _pred };
  });
}

// 按 filter 键过滤景点
// filter: current | all | spring | summer | autumn | winter | future1 | future3 | future6 | favs
export function filterSpots(flora, filter, season, favs = {}) {
  if (filter === 'current') {
    // 当季 + 花期接近（daysUntil 在 [-7, 30] 范围内）
    return flora.filter(f => {
      if (!f._pred) return f.s === season;
      const d = f._pred.daysUntil;
      return d >= -7 && d <= 30;
    });
  }
  if (filter === 'favs') {
    return flora.filter(f => favs[f.id]);
  }
  if (filter === 'future1') return flora.filter(f => f._pred && f._pred.daysUntil > 0 && f._pred.daysUntil <= 30);
  if (filter === 'future3') return flora.filter(f => f._pred && f._pred.daysUntil > 0 && f._pred.daysUntil <= 90);
  if (filter === 'future6') return flora.filter(f => f._pred && f._pred.daysUntil > 0 && f._pred.daysUntil <= 180);
  if (['spring','summer','autumn','winter'].includes(filter)) return flora.filter(f => f.s === filter);
  if (filter === 'all') return flora;
  return flora;
}

// 按区域过滤
export function filterByRegion(flora, regionZh) {
  if (regionZh === 'all' || !regionZh) return flora;
  return flora.filter(f => f.rg === regionZh);
}
