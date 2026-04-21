import React, { useMemo } from 'react';
import { Icon, PetalMark } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { SpotImage } from '../components/SpotImage.jsx';
import { getSeason } from '../utils/phenology.js';

/* ═══════════════════════════════════════════════════════════════
   推荐面板 - 基于多维度打分为用户挑选花事
   打分逻辑：
   - 当前季节 +3
   - 花期接近今日 +5
   - 与已收藏同花种 +4
   - 与已打卡同区域 +2
   - 稀有花种（全国 <5 处） +2
   ═══════════════════════════════════════════════════════════════ */
export function RecommendPanel({ flora, favs, checkins, onBack, onSelectSpot, onGotoFlower }) {
  const season = getSeason();

  // 用户偏好统计
  const userPrefs = useMemo(() => {
    const favSpecies = new Set();
    const checkedRegions = new Set();
    Object.keys(favs).forEach(id => {
      const s = flora.find(f => f.id === Number(id));
      if (s) favSpecies.add(s.sp);
    });
    Object.keys(checkins).forEach(id => {
      const s = flora.find(f => f.id === Number(id));
      if (s) checkedRegions.add(s.rg);
    });
    return { favSpecies, checkedRegions };
  }, [flora, favs, checkins]);

  // 稀有花种（全国 <5 处）
  const rareSpecies = useMemo(() => {
    const counts = {};
    flora.forEach(f => counts[f.sp] = (counts[f.sp] || 0) + 1);
    return new Set(Object.entries(counts).filter(([, n]) => n < 5).map(([sp]) => sp));
  }, [flora]);

  // ═══ 打分排序 ═══
  const scored = useMemo(() => {
    return flora
      .filter(f => !favs[f.id] && !checkins[f.id])  // 排除已收藏/打卡
      .map(f => {
        let score = 0;
        const reasons = [];

        // 当前季节
        if (f.s === season) { score += 3; reasons.push('当季'); }

        // 花期接近
        if (f._pred) {
          const d = f._pred.daysUntil;
          if (d >= -3 && d <= 14) { score += 5; reasons.push('花期将至'); }
          else if (d >= 15 && d <= 45) { score += 2; }
        }

        // 同花种
        if (userPrefs.favSpecies.has(f.sp)) {
          score += 4;
          reasons.push(`你爱${f.sp}`);
        }

        // 同区域
        if (userPrefs.checkedRegions.has(f.rg)) {
          score += 2;
        }

        // 稀有
        if (rareSpecies.has(f.sp)) {
          score += 2;
          reasons.push('稀有');
        }

        return { ...f, _score: score, _reasons: reasons };
      })
      .filter(f => f._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [flora, favs, checkins, season, userPrefs, rareSpecies]);

  // 分组
  const topPicks = scored.slice(0, 4);
  const byReason = {
    timely: scored.filter(s => s._reasons.includes('花期将至')).slice(0, 6),
    similar: scored.filter(s => s._reasons.some(r => r.startsWith('你爱'))).slice(0, 6),
    rare: scored.filter(s => s._reasons.includes('稀有')).slice(0, 6)
  };

  const hasUserData = Object.keys(favs).length > 0 || Object.keys(checkins).length > 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="投其所好 · 择花而推"
        title="为 你 推 荐"
        sub={<>根据{hasUserData ? '收藏与足迹' : '当前季节'}挑选 · 共 {scored.length} 处</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>

        {/* ─── Top 4 大卡片 ─── */}
        {topPicks.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div className="cn-caps" style={{ marginBottom: 14 }}>综合推荐 · Top 4</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14
            }}>
              {topPicks.map((s, i) => (
                <button key={s.id}
                  onClick={() => onSelectSpot && onSelectSpot(s.id)}
                  className="card paper-bg"
                  style={{
                    padding: i === 0 ? 0 : 'clamp(18px, 2.5vw, 22px)',
                    borderLeft: i === 0 ? '3px solid var(--zhusha)' : '3px solid var(--qing)',
                    cursor: 'pointer', textAlign: 'left',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                  {/* 首选卡 · 大图置顶 */}
                  {i === 0 && (
                    <SpotImage
                      species={s.sp}
                      name={s.n}
                      hashSeed={s.id}
                      aspect="16/8"
                      style={{ borderRadius: 0 }}
                    />
                  )}
                  <div style={{ padding: i === 0 ? 'clamp(18px, 2.5vw, 22px)' : 0 }}>
                    <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }}>
                      <div className="serif" style={{
                        fontSize: 11, color: i === 0 ? 'var(--paper)' : 'var(--zhusha)',
                        letterSpacing: '0.1em',
                        background: i === 0 ? 'var(--zhusha)' : 'transparent',
                        padding: i === 0 ? '3px 10px' : 0,
                        borderRadius: 4
                      }}>{i === 0 ? '首选' : `#${i + 1}`}</div>
                    </div>
                    <div className="cn-caps">{s.rg}</div>
                    <div className="serif" style={{
                      fontSize: 18, letterSpacing: '0.05em',
                      marginTop: 6, color: 'var(--ink)'
                    }}>{s.n}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="pill zhusha">{s.sp}</span>
                      {s._st && <span className="pill">{s._st.st}</span>}
                      {s._pred && <span className="pill qing">{s._pred.dateStr}</span>}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-3)',
                      fontFamily: 'var(--font-serif)' }}>
                      ◇ {s._reasons.join(' · ') || '当季之选'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── 花期将至 ─── */}
        {byReason.timely.length > 0 && (
          <RecSection title="花期将至 · 近期可访"
            items={byReason.timely} onSelectSpot={onSelectSpot}/>
        )}

        {/* ─── 投你所好 ─── */}
        {byReason.similar.length > 0 && (
          <RecSection title="投你所好 · 同类花种"
            items={byReason.similar} onSelectSpot={onSelectSpot}/>
        )}

        {/* ─── 稀有花种 ─── */}
        {byReason.rare.length > 0 && (
          <RecSection title="稀有少见 · 不易逢"
            items={byReason.rare} onSelectSpot={onSelectSpot}/>
        )}

        {!hasUserData && topPicks.length === 0 && (
          <EmptyState
            title="还没有足够数据为你推荐"
            sub="先去地图上收藏一些喜欢的花吧"
          />
        )}
      </div>
    </div>
  );
}

function RecSection({ title, items, onSelectSpot }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="cn-caps" style={{ marginBottom: 14 }}>{title}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10
      }}>
        {items.map(s => (
          <button key={s.id}
            onClick={() => onSelectSpot && onSelectSpot(s.id)}
            style={{
              padding: '12px 14px',
              background: 'var(--bg-elev)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
            <PetalMark peak={s._st && s._st.l >= 4}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{
                fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{s.n}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                {s.sp} · {s.rg}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
