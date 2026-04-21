import { read, write } from './storage.js';

/* ═══════════════════════════════════════════════════════════════
   bloom-feedback · 花期实测反馈闭环
   ───────────────────────────────────────────────────────────────
   数据模型：
     localStorage['bloomReports'] = {
       [spotId]: [{ bloom, ts, source }]
     }
     bloom: 'bud' | 'early' | 'peak' | 'late' | 'past'
     source: 'checkin' | 'quick' (快捷卡反馈)

   职责：
     · 写入报告（附带时效管理 · 30 天过期）
     · 聚合 · 当前景点最近 30 天的共识
     · 对比 · 用户实测 vs 系统预测 · 给可信度
   ═══════════════════════════════════════════════════════════════ */

const REPORT_TTL_DAYS = 30;
const MS_PER_DAY = 86400000;

export function addBloomReport(spotId, bloom, source = 'quick') {
  if (!spotId || !bloom) return;
  const all = read('bloomReports') || {};
  const list = all[spotId] || [];
  list.push({ bloom, ts: Date.now(), source });
  all[spotId] = list;
  write('bloomReports', all);
}

/**
 * 读取某景点最近 30 天内的有效报告
 */
export function getRecentReports(spotId) {
  const all = read('bloomReports') || {};
  const list = all[spotId] || [];
  const cutoff = Date.now() - REPORT_TTL_DAYS * MS_PER_DAY;
  return list.filter(r => r.ts >= cutoff);
}

/**
 * 聚合 · 返回 { total, peak, earlyOrLate, notYet, past, consensusBloom }
 */
export function summarizeReports(spotId) {
  const reports = getRecentReports(spotId);
  if (reports.length === 0) return null;

  const counts = { bud: 0, early: 0, peak: 0, late: 0, past: 0 };
  reports.forEach(r => { counts[r.bloom] = (counts[r.bloom] || 0) + 1; });

  // 最多人选的 bloom
  let consensusBloom = null, maxCount = 0;
  Object.keys(counts).forEach(k => {
    if (counts[k] > maxCount) { maxCount = counts[k]; consensusBloom = k; }
  });

  return {
    total: reports.length,
    counts,
    consensusBloom,
    // 汇总大类
    blooming: counts.early + counts.peak + counts.late,    // 正在开
    notYet: counts.bud,
    past: counts.past
  };
}

/**
 * 对比系统预测和实际反馈 · 返回 0-100 的可信度
 * 
 * 简单算法：
 *   · 共识 bloom 和预测 _st.l 对应档位比较
 *   · 档位相符 +20% · 相差 1 档 +0% · 相差 2+ 档 -20%
 *   · 基础值 50%
 * 
 * 映射：
 *   预测 _st.l:  0=休眠 1=蓓蕾 2=初开 3=盛花 4=末花 5=过期
 *   反馈 bloom:          bud=1  early=2  peak=3 late=4  past=5
 */
export function calculateConfidence(systemStL, spotId) {
  const report = summarizeReports(spotId);
  if (!report || report.total < 3) return null;  // 样本不足

  const bloomToLevel = { bud: 1, early: 2, peak: 3, late: 4, past: 5 };
  const reportedL = bloomToLevel[report.consensusBloom] ?? 3;
  const diff = Math.abs(systemStL - reportedL);

  let confidence = 50;
  if (diff === 0) confidence = 90;
  else if (diff === 1) confidence = 70;
  else if (diff === 2) confidence = 45;
  else confidence = 25;

  // 样本多的话略微提升
  if (report.total >= 10) confidence = Math.min(95, confidence + 5);

  return {
    score: confidence,
    sampleSize: report.total,
    reportedBloom: report.consensusBloom,
    predictedLevel: systemStL,
    match: diff === 0 ? 'match' : diff === 1 ? 'close' : 'mismatch'
  };
}

/**
 * 从所有 checkins 中把带 bloom 的同步到 bloomReports（数据迁移）
 * 用户用了新版打卡后 · 老的 checkins 也要能计入反馈
 */
export function syncCheckinsToReports(checkins) {
  if (!checkins) return;
  const all = read('bloomReports') || {};
  let changed = false;
  Object.entries(checkins).forEach(([spotId, ck]) => {
    if (!ck || !ck.bloom) return;
    const list = all[spotId] || [];
    // 去重：同一 ts + source='checkin' 的不重复加
    const exists = list.some(r => r.source === 'checkin' && r.ts === ck.ts);
    if (!exists) {
      list.push({ bloom: ck.bloom, ts: ck.ts, source: 'checkin' });
      all[spotId] = list;
      changed = true;
    }
  });
  if (changed) write('bloomReports', all);
}
