import React, { useMemo } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { BADGES, TIER_COLORS, buildBadgeContext } from '../data/badges.js';

/* ═══════════════════════════════════════════════════════════════
   花历 · 个人足迹 + 徽章 + 手札
   ═══════════════════════════════════════════════════════════════ */
export function DiaryPanel({ flora, checkins, favs, onSelectSpot, onGoWrapped }) {
  // 统计
  const stats = useMemo(() => {
    const ctx = buildBadgeContext(checkins, flora);
    return {
      checkinCount: Object.keys(checkins).length,
      favCount: Object.keys(favs).length,
      species: ctx.uniqueSpecies,
      regions: ctx.uniqueRegions,
      seasons: ctx.uniqueSeasons,
      ctx
    };
  }, [checkins, flora, favs]);

  // 计算已解锁徽章
  const badges = useMemo(() => {
    return BADGES.map(b => ({
      ...b,
      unlocked: b.check(stats.ctx)
    }));
  }, [stats]);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  // 年度热力图：52 周 × 7 天
  const yearHeatmap = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const cells = new Array(52 * 7).fill(0);
    for (const spotId of Object.keys(checkins)) {
      const ck = checkins[spotId];
      if (!ck.ts) continue;
      const d = new Date(ck.ts);
      if (d.getFullYear() !== now.getFullYear()) continue;
      const dayOfYear = Math.floor((d - yearStart) / 86400000);
      const idx = dayOfYear;
      if (idx >= 0 && idx < cells.length) cells[idx] = (cells[idx] || 0) + 1;
    }
    return cells;
  }, [checkins]);

  // 最近笔记
  const recentNotes = useMemo(() => {
    return Object.entries(checkins)
      .map(([id, ck]) => {
        const spot = flora.find(f => f.id === Number(id));
        if (!spot) return null;
        return { id: Number(id), spot, note: ck.note, bloom: ck.bloom, date: ck.date, ts: ck.ts || 0 };
      })
      .filter(Boolean)
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 6);
  }, [checkins, flora]);

  // 区域分布
  const regionBreakdown = useMemo(() => {
    const m = {};
    for (const id of Object.keys(checkins)) {
      const spot = flora.find(f => f.id === Number(id));
      if (!spot) continue;
      m[spot.rg] = (m[spot.rg] || 0) + 1;
    }
    return ['华北','华东','华中','西南','西北','东北','华南','西藏']
      .map(r => [r, m[r] || 0]);
  }, [checkins, flora]);

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow={`个人花历 · ${new Date().getFullYear()}`}
        title="花 历"
        sub={<>已打卡 {stats.checkinCount} 处 · 收藏 {stats.favCount} · 采 {stats.species} 种 · 跨 {stats.regions} 区 · {stats.seasons} 季 · {unlockedCount} 枚徽章</>}
        right={onGoWrapped && stats.checkinCount >= 1 ? (
          <button onClick={onGoWrapped}
            className="btn zhusha"
            style={{
              letterSpacing: '0.2em',
              fontFamily: 'var(--font-serif)'
            }}>
            🌸 年度复盘
          </button>
        ) : null}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24
      }}>
        {/* ─── 热力图 + 笔记 ─── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 16 }}>
            <div className="cn-caps">年度花事</div>
            <div style={{ display: 'flex', gap: 4, fontSize: 10, color: 'var(--ink-3)', alignItems: 'center' }}>
              <span>少</span>
              {[0.15, 0.35, 0.55, 0.75, 1].map((o, i) => (
                <span key={i} style={{ width: 12, height: 12,
                  background: `oklch(0.58 0.15 35 / ${o})`, borderRadius: 2 }}/>
              ))}
              <span>多</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: 2 }}>
            {yearHeatmap.map((n, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 2,
                background: n > 0
                  ? `oklch(0.58 0.15 35 / ${Math.min(1, 0.25 + n * 0.2)})`
                  : 'var(--bg-sunk)'
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            marginTop: 10, fontFamily: 'var(--font-serif)', fontSize: 10,
            color: 'var(--ink-3)', letterSpacing: '0.15em' }}>
            {['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑'].map(j => <span key={j}>{j}</span>)}
          </div>

          <div style={{ height: 1, background: 'var(--line-2)', margin: '24px 0' }}/>

          <div className="cn-caps" style={{ marginBottom: 14 }}>近期笔记</div>
          {recentNotes.length === 0 && (
            <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '16px 0' }}>
              还没有花事记录 · 去地图上点击景点打卡
            </div>
          )}
          {recentNotes.map(n => (
            <button key={n.id} onClick={() => onSelectSpot && onSelectSpot(n.id)}
              style={{
                padding: '12px 0', borderBottom: '1px dotted var(--line)',
                display: 'flex', gap: 16, width: '100%', background: 'transparent',
                border: 'none', textAlign: 'left', cursor: 'pointer'
              }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', paddingTop: 2, minWidth: 44 }}>
                {n.date ? n.date.slice(-5).replace(/-/g, '.') : '—'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{n.spot.n} · {n.spot.sp}</span>
                  {n.bloom && (
                    <span style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: bloomBg(n.bloom),
                      color: bloomColor(n.bloom),
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-serif)'
                    }}>{bloomLabel(n.bloom)}</span>
                  )}
                </div>
                {n.note && (
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3,
                    fontFamily: 'var(--font-serif)', lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {n.note}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ─── 徽章 + 足迹 ─── */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 16 }}>
            <div className="cn-caps">徽章 · {unlockedCount} / {BADGES.length}</div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--jin)' }}>
              {unlockedCount >= 6 ? 'LV. 金花' : unlockedCount >= 3 ? 'LV. 银花' : 'LV. 青花'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {badges.map(b => {
              const tc = TIER_COLORS[b.tier];
              return (
                <div key={b.id} style={{
                  aspectRatio: '1',
                  border: `1px solid ${b.unlocked ? tc : 'var(--line)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 10,
                  background: b.unlocked
                    ? `color-mix(in oklch, ${tc} 8%, var(--bg-elev))`
                    : 'var(--bg-sunk)',
                  opacity: b.unlocked ? 1 : 0.5,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 6, height: 6, borderRadius: '50%', background: tc
                  }}/>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: b.unlocked ? tc : 'transparent',
                    border: b.unlocked ? 'none' : '1px dashed var(--ink-4)',
                    display: 'grid', placeItems: 'center',
                    color: b.unlocked ? 'var(--paper)' : 'var(--ink-4)',
                    fontFamily: 'var(--font-serif)', fontSize: 11, letterSpacing: '0.1em'
                  }}>{b.unlocked ? '印' : '？'}</div>
                  <div>
                    <div className="serif" style={{ fontSize: 12, lineHeight: 1.3 }}>{b.name}</div>
                    <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>
                      {b.cond}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: 'var(--line-2)', margin: '20px 0' }}/>

          <div className="cn-caps" style={{ marginBottom: 10 }}>足迹 · {stats.regions} 大区</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {regionBreakdown.filter(([, n]) => n > 0).map(([r, n]) => (
              <span key={r} className="pill">{r} · {n}</span>
            ))}
            {regionBreakdown.every(([, n]) => n === 0) && (
              <span className="pill">还没有足迹</span>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ═══ bloom 工具函数 ═══ */
function bloomLabel(b) {
  return { bud: '含苞', early: '初开', peak: '盛花', late: '末花', past: '已谢' }[b] || '';
}
function bloomColor(b) {
  return {
    bud:   'var(--ink-2)',
    early: 'var(--jin)',
    peak:  'var(--zhusha)',
    late:  'var(--ink-3)',
    past:  'var(--ink-4)'
  }[b] || 'var(--ink-3)';
}
function bloomBg(b) {
  return {
    bud:   'var(--bg-sunk)',
    early: 'color-mix(in oklch, var(--jin) 16%, var(--bg-elev))',
    peak:  'color-mix(in oklch, var(--zhusha) 14%, var(--bg-elev))',
    late:  'var(--bg-sunk)',
    past:  'var(--bg-sunk)'
  }[b] || 'var(--bg-sunk)';
}
