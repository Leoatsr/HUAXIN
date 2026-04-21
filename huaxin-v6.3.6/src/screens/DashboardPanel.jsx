import React, { useMemo } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { buildBadgeContext, BADGES } from '../data/badges.js';

/* ═══════════════════════════════════════════════════════════════
   花事概览 Dashboard
   - 4 大数字：景点/花种/区域/当月盛花
   - 区域分布：8 大区条形图
   - 花种 Top 15
   - 月份分布：12 月条形图，当月红框
   - 季节分布：春夏秋冬四卡
   - 个人花事（有打卡时显示）
   ═══════════════════════════════════════════════════════════════ */
export function DashboardPanel({ flora, checkins, favs, onBack, onGotoFlower, onNavToDiary }) {
  const currentMonth = new Date().getMonth() + 1;

  // ═══ 统计计算 ═══
  const stats = useMemo(() => {
    const speciesMap = {};
    const regionMap = {};
    const seasonMap = { spring: 0, summer: 0, autumn: 0, winter: 0 };
    const monthMap = new Array(12).fill(0);

    flora.forEach(f => {
      // 花种
      if (!speciesMap[f.sp]) {
        speciesMap[f.sp] = { sp: f.sp, count: 0, seasons: new Set() };
      }
      speciesMap[f.sp].count++;
      speciesMap[f.sp].seasons.add(f.s);

      // 区域
      regionMap[f.rg] = (regionMap[f.rg] || 0) + 1;

      // 季节
      if (f.s && seasonMap[f.s] !== undefined) seasonMap[f.s]++;

      // 月份（根据 pk 盛花月份）
      if (f.pk && Array.isArray(f.pk) && f.pk.length >= 2) {
        const [start, end] = f.pk;
        if (start <= end) {
          for (let i = start; i <= end; i++) monthMap[i - 1]++;
        } else {
          for (let i = start; i <= 12; i++) monthMap[i - 1]++;
          for (let i = 1; i <= end; i++) monthMap[i - 1]++;
        }
      }
    });

    // 当月盛花景点
    const currentMonthSpots = monthMap[currentMonth - 1];

    return {
      totalSpots: flora.length,
      totalSpecies: Object.keys(speciesMap).length,
      totalRegions: Object.keys(regionMap).length,
      currentMonthSpots,
      speciesMap,
      regionMap,
      seasonMap,
      monthMap
    };
  }, [flora, currentMonth]);

  // 花种 Top 15
  const topSpecies = useMemo(() => {
    return Object.values(stats.speciesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [stats]);

  // 区域排序
  const sortedRegions = useMemo(() => {
    return Object.entries(stats.regionMap)
      .sort((a, b) => b[1] - a[1]);
  }, [stats]);

  // 月份最大值（归一化条形高度）
  const monthMax = Math.max(...stats.monthMap, 1);
  const regionMax = Math.max(...sortedRegions.map(r => r[1]), 1);
  const speciesMax = topSpecies.length > 0 ? topSpecies[0].count : 1;

  // 个人统计
  const personalCtx = useMemo(() =>
    buildBadgeContext(checkins, flora), [checkins, flora]);
  const unlockedBadges = BADGES.filter(b => b.check(personalCtx)).length;
  const hasPersonalData = Object.keys(checkins).length > 0 || Object.keys(favs).length > 0;

  const MONTH_LABELS = ['一','二','三','四','五','六','七','八','九','十','冬','腊'];
  const SEASON_STYLES = {
    spring: { label: '春', emoji: '🌸', color: 'oklch(0.60 0.16 30)' },
    summer: { label: '夏', emoji: '🌿', color: 'oklch(0.55 0.10 170)' },
    autumn: { label: '秋', emoji: '🍁', color: 'oklch(0.60 0.16 55)' },
    winter: { label: '冬', emoji: '❄', color: 'oklch(0.50 0.10 240)' }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="数据一纸 · 花事如尺"
        title="花事概览"
        sub={<>{new Date().toLocaleDateString('zh-CN')} · 全国数据一览</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>

        {/* ─── 4 大数字 ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 24
        }}>
          {[
            { label: '赏花景点', value: stats.totalSpots, sub: '全国覆盖', color: 'var(--zhusha)' },
            { label: '花卉种数', value: stats.totalSpecies, sub: '含多种乔木', color: 'var(--qing)' },
            { label: '八大区域', value: stats.totalRegions, sub: '东北到西藏', color: 'var(--jin)' },
            { label: `${currentMonth}月盛花`, value: stats.currentMonthSpots, sub: '当月景点', color: 'var(--ink)' }
          ].map((m, i) => (
            <div key={i} className="card" style={{
              padding: 'clamp(18px, 2.5vw, 24px)',
              borderTop: `3px solid ${m.color}`,
              position: 'relative'
            }}>
              <div className="cn-caps" style={{ marginBottom: 8 }}>{m.label}</div>
              <div className="serif" style={{
                fontSize: 'clamp(36px, 5vw, 48px)',
                color: m.color, lineHeight: 1,
                letterSpacing: '0.02em'
              }}>
                {m.value}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ─── 双列布局 ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 20,
          marginBottom: 20
        }}>

          {/* 区域分布 */}
          <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 16 }}>
              <div className="cn-caps">区域分布</div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {sortedRegions.length} 大区
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedRegions.map(([region, count]) => (
                <div key={region}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="serif" style={{ fontSize: 13 }}>{region}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-sunk)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / regionMax) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--qing), var(--zhusha))',
                      transition: 'width var(--dur-slow) var(--ease-out)'
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 季节分布 */}
          <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
            <div className="cn-caps" style={{ marginBottom: 16 }}>四季花事</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 10
            }}>
              {['spring','summer','autumn','winter'].map(season => {
                const s = SEASON_STYLES[season];
                const count = stats.seasonMap[season];
                const pct = Math.round((count / stats.totalSpots) * 100);
                return (
                  <div key={season} style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid color-mix(in oklch, ${s.color} 30%, var(--line))`,
                    background: `color-mix(in oklch, ${s.color} 5%, var(--bg))`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 22, opacity: 0.8 }}>{s.emoji}</div>
                    <div className="serif" style={{
                      fontSize: 18, color: s.color, marginTop: 4,
                      letterSpacing: '0.1em'
                    }}>{s.label}</div>
                    <div className="serif" style={{
                      fontSize: 24, color: 'var(--ink)', marginTop: 8, lineHeight: 1
                    }}>{count}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 月份条形图 */}
            <div style={{ marginTop: 24 }}>
              <div className="cn-caps" style={{ marginBottom: 10 }}>月份分布</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 3, alignItems: 'end',
                height: 90
              }}>
                {stats.monthMap.map((n, i) => {
                  const pct = Math.max(4, (n / monthMax) * 100);
                  const isCurrent = i + 1 === currentMonth;
                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4, height: '100%',
                      justifyContent: 'flex-end'
                    }}>
                      <span className="mono" style={{
                        fontSize: 10,
                        color: isCurrent ? 'var(--zhusha)' : 'var(--ink-3)'
                      }}>{n}</span>
                      <div style={{
                        width: '100%',
                        height: `${pct}%`,
                        minHeight: 4,
                        background: isCurrent ? 'var(--zhusha)' : 'var(--ink-4)',
                        opacity: isCurrent ? 1 : 0.55,
                        borderRadius: '2px 2px 0 0'
                      }}/>
                      <span className="serif" style={{
                        fontSize: 10,
                        color: isCurrent ? 'var(--zhusha)' : 'var(--ink-3)',
                        fontWeight: isCurrent ? 600 : 400
                      }}>{MONTH_LABELS[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 花种 Top 15 ─── */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 16 }}>
            <div className="cn-caps">花种榜 · Top 15</div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              共 {stats.totalSpecies} 种
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10
          }}>
            {topSpecies.map((sp, idx) => (
              <button key={sp.sp}
                onClick={() => onGotoFlower && onGotoFlower(sp.sp)}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  position: 'relative', overflow: 'hidden'
                }}>
                {/* 排名条 */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${(sp.count / speciesMax) * 100}%`,
                  background: `color-mix(in oklch, var(--zhusha) ${12 + (1 - idx / 15) * 8}%, var(--bg))`,
                  opacity: 0.4
                }}/>
                <div className="serif" style={{
                  position: 'relative',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  width: 24,
                  textAlign: 'center'
                }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <div className="serif" style={{ fontSize: 14, color: 'var(--ink)' }}>{sp.sp}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                    {[...sp.seasons].map(s => SEASON_STYLES[s]?.label).filter(Boolean).join('·')}
                  </div>
                </div>
                <div className="serif" style={{
                  position: 'relative',
                  fontSize: 16, color: 'var(--zhusha)'
                }}>{sp.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 个人花事（有打卡时显示） ─── */}
        {hasPersonalData && (
          <div className="card paper-bg" style={{
            padding: 'clamp(20px, 3vw, 28px)',
            borderLeft: '3px solid var(--jin)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div className="cn-caps">我的花事</div>
                <div className="serif" style={{ fontSize: 22, letterSpacing: '0.1em', marginTop: 4 }}>
                  {personalCtx.uniqueSpecies === 0 ? '初见花事' :
                   personalCtx.uniqueSpecies < 5 ? '初识花事' :
                   personalCtx.uniqueSpecies < 15 ? '识花者' : '花痴'}
                </div>
              </div>
              {onNavToDiary && (
                <button className="btn sm" onClick={onNavToDiary}>
                  详看花历 <Icon.chev/>
                </button>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12
            }}>
              {[
                ['已打卡',  Object.keys(checkins).length, '处景点'],
                ['已收藏',  Object.keys(favs).length, '处心仪'],
                ['采花',    personalCtx.uniqueSpecies, '种'],
                ['踏青',    personalCtx.uniqueRegions, '区'],
                ['徽章',    `${unlockedBadges}/${BADGES.length}`, '解锁']
              ].map(([label, value, unit]) => (
                <div key={label} style={{
                  padding: 14,
                  background: 'var(--bg-elev)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line-2)',
                  textAlign: 'center'
                }}>
                  <div className="cn-caps" style={{ fontSize: 10 }}>{label}</div>
                  <div className="serif" style={{
                    fontSize: 24, color: 'var(--jin)',
                    marginTop: 6, lineHeight: 1
                  }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasPersonalData && (
          <EmptyState
            title="还没开始你的花事"
            sub="到地图上选个花事去打卡吧"
          />
        )}
      </div>
    </div>
  );
}
