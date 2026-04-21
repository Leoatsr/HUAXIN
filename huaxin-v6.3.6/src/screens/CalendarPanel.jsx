import React, { useState, useMemo } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';

/* ═══════════════════════════════════════════════════════════════
   花事日历 · 12月 × 花种 矩阵
   - 横轴：12 个月
   - 纵轴：按花种分组，每行一个花种
   - 单元格颜色深浅 = 该月该花种的盛花景点数
   - 单元格 hover 显示数字，点击跳地图并按花种+月份筛选
   - 顶部"当月盛花 Top"推荐
   ═══════════════════════════════════════════════════════════════ */
export function CalendarPanel({ flora, onBack, onGotoFlower, onSelectSpot }) {
  const currentMonth = new Date().getMonth() + 1;  // 1-12
  const [sortBy, setSortBy] = useState('peak');    // peak | alpha | count
  const [hoverCell, setHoverCell] = useState(null);  // {sp, month}

  // ═══ 计算 花种 → 每月景点数 矩阵 ═══
  const matrix = useMemo(() => {
    const m = {};  // { sp: { months: [12], totalSpots, peakMonth } }
    flora.forEach(f => {
      if (!f.pk || !Array.isArray(f.pk) || f.pk.length < 2) return;
      const [start, end] = f.pk;
      if (!m[f.sp]) {
        m[f.sp] = { sp: f.sp, months: new Array(12).fill(0), spots: [], peakMonth: start };
      }
      // 花期可能跨月（如 3-5 月）或跨年（如 12-2 月）
      if (start <= end) {
        for (let i = start; i <= end; i++) m[f.sp].months[i - 1]++;
      } else {
        // 跨年
        for (let i = start; i <= 12; i++) m[f.sp].months[i - 1]++;
        for (let i = 1; i <= end; i++) m[f.sp].months[i - 1]++;
      }
      m[f.sp].spots.push(f);
    });
    // 补充 totalSpots 和 peakMonth
    Object.values(m).forEach(row => {
      row.totalSpots = row.spots.length;
      const maxVal = Math.max(...row.months);
      row.peakMonth = row.months.indexOf(maxVal) + 1;
    });
    return m;
  }, [flora]);

  // 排序花种行
  const sortedSpecies = useMemo(() => {
    const rows = Object.values(matrix);
    if (sortBy === 'peak') {
      // 按盛花月份排序（peakMonth 升序，同月按景点数降序）
      rows.sort((a, b) =>
        a.peakMonth !== b.peakMonth
          ? a.peakMonth - b.peakMonth
          : b.totalSpots - a.totalSpots
      );
    } else if (sortBy === 'alpha') {
      rows.sort((a, b) => a.sp.localeCompare(b.sp));
    } else {
      rows.sort((a, b) => b.totalSpots - a.totalSpots);
    }
    return rows;
  }, [matrix, sortBy]);

  // 最大单元格值（用于归一化颜色深浅）
  const maxCellValue = useMemo(() => {
    let max = 1;
    Object.values(matrix).forEach(r => {
      r.months.forEach(v => { if (v > max) max = v; });
    });
    return max;
  }, [matrix]);

  // ═══ 当月盛花 Top ═══
  const currentMonthTop = useMemo(() => {
    return Object.values(matrix)
      .filter(r => r.months[currentMonth - 1] > 0)
      .sort((a, b) => b.months[currentMonth - 1] - a.months[currentMonth - 1])
      .slice(0, 8);
  }, [matrix, currentMonth]);

  // 点击单元格：跳到该花种
  const onCellClick = (sp) => {
    if (onGotoFlower) onGotoFlower(sp);
  };

  const MONTH_LABELS = ['一','二','三','四','五','六','七','八','九','十','冬','腊'];
  const MONTH_JIE = ['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="岁时花历 · 十二月令"
        title="花事日历"
        sub={<>按月观花 · {Object.keys(matrix).length} 种花 · 当前 <strong style={{ color: 'var(--zhusha)' }}>{currentMonth} 月</strong></>}
        onBack={onBack}
      />

      {/* ─── 当月盛花 Top ─── */}
      {currentMonthTop.length > 0 && (
        <div style={{ padding: '0 clamp(24px, 5vw, 48px) 20px' }}>
          <div className="card" style={{
            padding: 'clamp(20px, 3vw, 28px)',
            background: 'linear-gradient(135deg, var(--bg-elev), var(--paper))',
            borderLeft: '3px solid var(--zhusha)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 20, right: 20 }}>
              <Seal size="sm" rotate={-4}>{currentMonth}月<br/>花事</Seal>
            </div>
            <div className="cn-caps">当月盛花</div>
            <div className="serif" style={{
              fontSize: 'clamp(20px, 2.5vw, 26px)',
              letterSpacing: '0.15em', marginTop: 8, marginBottom: 16
            }}>
              {MONTH_LABELS[currentMonth - 1]}月 · {MONTH_JIE[currentMonth - 1]} 时节
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {currentMonthTop.map(r => (
                <button key={r.sp}
                  onClick={() => onGotoFlower && onGotoFlower(r.sp)}
                  className="btn"
                  style={{
                    background: 'var(--bg-elev)',
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                  <Icon.flower/>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span className="serif" style={{ fontSize: 14, color: 'var(--ink)' }}>{r.sp}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {r.months[currentMonth - 1]} 处
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 排序控制 ─── */}
      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 14px', display: 'flex', gap: 8 }}>
        {[
          ['peak', '按花期'],
          ['count', '按景点数'],
          ['alpha', '按字序']
        ].map(([k, l]) => (
          <button key={k} onClick={() => setSortBy(k)} className="btn sm"
            style={{
              background: sortBy === k ? 'var(--zhusha)' : 'transparent',
              color: sortBy === k ? 'var(--paper)' : 'var(--ink-2)',
              borderColor: sortBy === k ? 'var(--zhusha)' : 'var(--line)'
            }}>{l}</button>
        ))}
      </div>

      {/* ─── 主矩阵 ─── */}
      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>
        <div className="card" style={{
          padding: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            minWidth: 760,
            fontFamily: 'var(--font-sans)'
          }}>
            {/* 月份表头 */}
            <thead>
              <tr style={{ background: 'var(--bg-sunk)' }}>
                <th style={{
                  padding: '14px 12px', textAlign: 'left',
                  position: 'sticky', left: 0, background: 'var(--bg-sunk)',
                  borderBottom: '1px solid var(--line)',
                  minWidth: 110, zIndex: 2,
                  fontFamily: 'var(--font-serif)', fontSize: 11,
                  letterSpacing: '0.3em', color: 'var(--ink-3)', fontWeight: 400
                }}>花 种</th>
                {MONTH_LABELS.map((m, i) => (
                  <th key={i} style={{
                    padding: '10px 4px', minWidth: 52,
                    background: i + 1 === currentMonth
                      ? 'color-mix(in oklch, var(--zhusha) 15%, var(--bg-sunk))'
                      : 'var(--bg-sunk)',
                    borderBottom: `1px solid ${i + 1 === currentMonth ? 'var(--zhusha)' : 'var(--line)'}`,
                    borderLeft: i + 1 === currentMonth ? '1px solid var(--zhusha)' : 'none',
                    borderRight: i + 1 === currentMonth ? '1px solid var(--zhusha)' : 'none'
                  }}>
                    <div className="serif" style={{
                      fontSize: 15,
                      color: i + 1 === currentMonth ? 'var(--zhusha)' : 'var(--ink)',
                      letterSpacing: '0.05em'
                    }}>{m}</div>
                    <div className="mono" style={{
                      fontSize: 9,
                      color: i + 1 === currentMonth ? 'var(--zhusha)' : 'var(--ink-3)',
                      marginTop: 2
                    }}>{MONTH_JIE[i]}</div>
                  </th>
                ))}
                <th style={{
                  padding: '14px 10px',
                  background: 'var(--bg-sunk)',
                  borderBottom: '1px solid var(--line)',
                  fontFamily: 'var(--font-serif)', fontSize: 10,
                  letterSpacing: '0.2em', color: 'var(--ink-3)', fontWeight: 400,
                  minWidth: 60
                }}>合计</th>
              </tr>
            </thead>

            <tbody>
              {sortedSpecies.map((row, rowIdx) => (
                <tr key={row.sp}>
                  <td style={{
                    padding: '10px 12px', position: 'sticky', left: 0,
                    background: rowIdx % 2 ? 'var(--bg)' : 'var(--bg-elev)',
                    borderBottom: '1px solid var(--line-2)',
                    zIndex: 1
                  }}>
                    <button
                      onClick={() => onGotoFlower && onGotoFlower(row.sp)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: 0, fontFamily: 'var(--font-serif)', fontSize: 13,
                        color: 'var(--ink)', letterSpacing: '0.05em',
                        display: 'block', width: '100%', textAlign: 'left'
                      }}>
                      {row.sp}
                    </button>
                  </td>
                  {row.months.map((n, i) => {
                    const intensity = n / maxCellValue;
                    const isHover = hoverCell && hoverCell.sp === row.sp && hoverCell.month === i + 1;
                    const isCurrentMonth = i + 1 === currentMonth;
                    return (
                      <td key={i}
                        style={{
                          padding: 2, textAlign: 'center',
                          background: rowIdx % 2 ? 'var(--bg)' : 'var(--bg-elev)',
                          borderBottom: '1px solid var(--line-2)',
                          borderLeft: isCurrentMonth ? '1px solid color-mix(in oklch, var(--zhusha) 30%, var(--line-2))' : 'none',
                          borderRight: isCurrentMonth ? '1px solid color-mix(in oklch, var(--zhusha) 30%, var(--line-2))' : 'none'
                        }}>
                        {n > 0 ? (
                          <button
                            onMouseEnter={() => setHoverCell({ sp: row.sp, month: i + 1 })}
                            onMouseLeave={() => setHoverCell(null)}
                            onClick={() => onCellClick(row.sp)}
                            title={`${row.sp} · ${i + 1}月 · ${n} 处`}
                            style={{
                              width: '100%', height: 36,
                              border: 'none',
                              background: isHover
                                ? 'var(--zhusha)'
                                : `color-mix(in oklch, var(--zhusha) ${intensity * 65 + 5}%, var(--bg))`,
                              color: isHover ? 'var(--paper)' : (intensity > 0.5 ? 'var(--paper)' : 'var(--ink-2)'),
                              cursor: 'pointer',
                              borderRadius: 2,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              transition: 'transform var(--dur-fast) var(--ease-out)',
                              transform: isHover ? 'scale(1.08)' : 'scale(1)'
                            }}>
                            {n}
                          </button>
                        ) : (
                          <div style={{
                            width: '100%', height: 36,
                            background: 'transparent',
                            display: 'grid', placeItems: 'center',
                            color: 'var(--ink-4)', fontSize: 10
                          }}>·</div>
                        )}
                      </td>
                    );
                  })}
                  <td style={{
                    padding: '10px 12px', textAlign: 'center',
                    background: rowIdx % 2 ? 'var(--bg)' : 'var(--bg-elev)',
                    borderBottom: '1px solid var(--line-2)',
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: 'var(--zhusha)'
                  }}>{row.totalSpots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 说明 */}
        <div style={{
          marginTop: 16, padding: 14,
          display: 'flex', gap: 20, alignItems: 'center',
          flexWrap: 'wrap', fontSize: 11, color: 'var(--ink-3)'
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>少</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: 2,
                background: `color-mix(in oklch, var(--zhusha) ${o * 65 + 5}%, var(--bg))`
              }}/>
            ))}
            <span>多</span>
          </div>
          <span>· 数字 = 该月盛放的景点数</span>
          <span>· 点单元格跳到地图按花种筛选</span>
          <span>· 红框 = 当月</span>
        </div>
      </div>
    </div>
  );
}
