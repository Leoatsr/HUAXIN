import React, { useState, useMemo } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { POETS } from '../data/poet-footprint.js';
import { POET_RELATIONS, RELATION_STYLES } from '../data/poet-relations.js';

/* ═══════════════════════════════════════════════════════════════
   PoetNetworkPanel · 诗人关系图
   ───────────────────────────────────────────────────────────────
   设计理念：不是社交网络图 · 是"时间长河图"
   
   横轴 = 年份（700 - 1110）
   每位诗人一条横线 = 他的生命起止
   诗人之间的连线 = 真实历史关系
   
   "览物之情得无异乎时"——他们其实在同一条时间河里 · 只是位置不同
   ═══════════════════════════════════════════════════════════════ */

export function PoetNetworkPanel({ onBack, onSelectPoet }) {
  const [hoveredRelation, setHoveredRelation] = useState(null);

  // SVG 尺寸
  const W = 1000;
  const H = 520;
  const padding = { top: 80, right: 50, bottom: 80, left: 100 };

  // 时间范围：从最早诗人出生前 · 到最晚去世后
  const allYears = POETS.flatMap(p => {
    const [start, end] = p.lifespan.split(' - ').map(Number);
    return [start, end];
  });
  const minYear = Math.floor(Math.min(...allYears) / 50) * 50;  // 700
  const maxYear = Math.ceil(Math.max(...allYears) / 50) * 50;   // 1150
  const yearRange = maxYear - minYear;

  // 时间 → X
  const yearToX = (y) => padding.left + ((y - minYear) / yearRange) * (W - padding.left - padding.right);

  // 每位诗人分到一个 Y 行
  const poetRow = useMemo(() => {
    // 按出生年排序
    const sorted = [...POETS].sort((a, b) => {
      const ay = parseInt(a.lifespan.split(' - ')[0]);
      const by = parseInt(b.lifespan.split(' - ')[0]);
      return ay - by;
    });
    const map = {};
    sorted.forEach((p, i) => { map[p.id] = i; });
    return { map, sorted };
  }, []);

  const rowCount = poetRow.sorted.length;
  const rowHeight = (H - padding.top - padding.bottom) / Math.max(rowCount, 1);
  const idxToY = (idx) => padding.top + idx * rowHeight + rowHeight / 2;

  // 年份刻度
  const yearTicks = [];
  for (let y = minYear; y <= maxYear; y += 50) yearTicks.push(y);

  // 找一条关系的控制点（曲线）
  const relationPath = (rel) => {
    const fromPoet = POETS.find(p => p.id === rel.from);
    const toPoet = POETS.find(p => p.id === rel.to);
    if (!fromPoet || !toPoet) return null;
    const [fromStart, fromEnd] = fromPoet.lifespan.split(' - ').map(Number);
    const [toStart, toEnd] = toPoet.lifespan.split(' - ').map(Number);

    // 用关系的 years 字段解析主要年份
    const relYears = rel.years.split('-').map(s => parseInt(s.trim()));
    const midYear = relYears.length === 2
      ? (relYears[0] + relYears[1]) / 2
      : relYears[0];

    const x = yearToX(midYear);
    const y1 = idxToY(poetRow.map[rel.from]);
    const y2 = idxToY(poetRow.map[rel.to]);
    const midY = (y1 + y2) / 2;
    const curve = Math.abs(y1 - y2) * 0.3;

    return { x, y1, y2, midY, curve, midYear };
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="诗人关系 · 时间之河"
        title="人 · 与 · 人"
        sub={<>他们不是独立的星 · 而是同一条时间长河里的浪</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>

        {/* 序言 */}
        <div style={{
          padding: '20px 28px',
          background: 'var(--bg-elev)',
          borderLeft: '3px solid var(--zhusha)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24
        }}>
          <div className="serif" style={{
            fontSize: 14, lineHeight: 2.0,
            color: 'var(--ink-2)',
            letterSpacing: '0.05em'
          }}>
            杜甫比李白小 11 岁 · 他们在 744 年同游梁宋 · 从此终生未再相见。<br/>
            白居易晚年在洛阳 · 与刘禹锡唱和酬答 · "四海齐名白与刘"。<br/>
            苏轼比杜甫晚了三百多年 · 但一生推尊杜甫 · 视为诗圣。<br/>
            <span style={{
              color: 'var(--zhusha)', fontStyle: 'italic',
              letterSpacing: '0.1em'
            }}>
              他们并非孤独的星 · 是互相照亮的光。
            </span>
          </div>
        </div>

        {/* 关系图例 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 14,
          padding: '16px 24px',
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24
        }}>
          {Object.entries(RELATION_STYLES).map(([key, style]) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <svg width="30" height="10">
                <line x1="0" y1="5" x2="30" y2="5"
                  stroke={style.color}
                  strokeWidth={style.weight}
                  strokeDasharray={style.dash}/>
              </svg>
              <span style={{
                fontSize: 11,
                color: 'var(--ink-2)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.15em'
              }}>{style.label}</span>
            </div>
          ))}
        </div>

        {/* 关系图 SVG */}
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          overflowX: 'auto'
        }}>
          <svg viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', minWidth: 720, height: 'auto', display: 'block' }}
            xmlns="http://www.w3.org/2000/svg">

            {/* 时间刻度 · 背景竖线 */}
            {yearTicks.map(y => (
              <g key={y}>
                <line x1={yearToX(y)} y1={padding.top - 20}
                  x2={yearToX(y)} y2={H - padding.bottom + 10}
                  stroke="var(--line-2)" strokeWidth="0.5" strokeDasharray="2 3"/>
                <text x={yearToX(y)} y={padding.top - 30}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="11"
                  fill="var(--ink-3)"
                  letterSpacing="2">
                  {y}
                </text>
              </g>
            ))}

            {/* 朝代背景色带 */}
            <rect
              x={yearToX(618)} y={padding.top - 10}
              width={yearToX(907) - yearToX(618)}
              height={H - padding.top - padding.bottom + 20}
              fill="#a04a3a" opacity="0.04"/>
            <text
              x={(yearToX(618) + yearToX(907)) / 2}
              y={H - padding.bottom + 30}
              textAnchor="middle"
              fontFamily="var(--font-serif)"
              fontSize="14"
              fill="#a04a3a"
              opacity="0.6"
              letterSpacing="8">
              唐
            </text>

            <rect
              x={yearToX(960)} y={padding.top - 10}
              width={yearToX(1127) - yearToX(960)}
              height={H - padding.top - padding.bottom + 20}
              fill="#c89a4a" opacity="0.05"/>
            <text
              x={(yearToX(960) + yearToX(1127)) / 2}
              y={H - padding.bottom + 30}
              textAnchor="middle"
              fontFamily="var(--font-serif)"
              fontSize="14"
              fill="#c89a4a"
              opacity="0.7"
              letterSpacing="8">
              北宋
            </text>

            {/* 诗人生命线 */}
            {poetRow.sorted.map((poet, idx) => {
              const [start, end] = poet.lifespan.split(' - ').map(Number);
              const x1 = yearToX(start);
              const x2 = yearToX(end);
              const y = idxToY(idx);

              return (
                <g key={poet.id}
                  onClick={() => onSelectPoet && onSelectPoet(poet.id)}
                  style={{ cursor: onSelectPoet ? 'pointer' : 'default' }}>
                  {/* 生命线 */}
                  <line x1={x1} y1={y} x2={x2} y2={y}
                    stroke={poet.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"/>
                  {/* 出生点 */}
                  <circle cx={x1} cy={y} r="5" fill={poet.color} stroke="var(--paper)" strokeWidth="1.5"/>
                  {/* 去世点 · 空心 */}
                  <circle cx={x2} cy={y} r="5" fill="var(--paper)" stroke={poet.color} strokeWidth="2"/>
                  {/* 诗人名 */}
                  <text x={x1 - 10} y={y + 5}
                    textAnchor="end"
                    fontFamily="var(--font-serif)"
                    fontSize="17"
                    fontWeight="700"
                    fill={poet.color}
                    letterSpacing="2">
                    {poet.name}
                  </text>
                  {/* 生卒年 · 右侧 */}
                  <text x={x2 + 8} y={y + 4}
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                    fill="var(--ink-3)"
                    letterSpacing="1">
                    {start}-{end}
                  </text>
                </g>
              );
            })}

            {/* 关系连线 */}
            {POET_RELATIONS.map((rel, i) => {
              const path = relationPath(rel);
              if (!path) return null;
              const style = RELATION_STYLES[rel.type] || RELATION_STYLES.influence;
              const isHovered = hoveredRelation === i;

              // 贝塞尔曲线 · 从 (x, y1) 弯到 (x, y2)
              const d = `M ${path.x} ${path.y1} Q ${path.x + (path.y2 > path.y1 ? 20 : -20)} ${path.midY} ${path.x} ${path.y2}`;

              return (
                <g key={i}
                  onMouseEnter={() => setHoveredRelation(i)}
                  onMouseLeave={() => setHoveredRelation(null)}
                  style={{ cursor: 'help' }}>
                  <path d={d}
                    fill="none"
                    stroke={style.color}
                    strokeWidth={isHovered ? style.weight + 1.5 : style.weight}
                    strokeDasharray={style.dash}
                    opacity={isHovered ? 1 : 0.7}
                    style={{ transition: 'all 200ms' }}/>
                  {/* 标签 */}
                  {isHovered && (
                    <g>
                      <rect x={path.x - 40} y={path.midY - 10} width="80" height="20"
                        fill="var(--paper)" stroke={style.color} strokeWidth="1" rx="3"/>
                      <text x={path.x} y={path.midY + 4}
                        textAnchor="middle"
                        fontFamily="var(--font-serif)"
                        fontSize="11"
                        fill={style.color}
                        fontWeight="700"
                        letterSpacing="2">
                        {rel.label}
                      </text>
                    </g>
                  )}
                  {/* 中点小标签（不 hover 时也显示 · 但淡）*/}
                  {!isHovered && (
                    <text x={path.x + (path.y2 > path.y1 ? 24 : -24)} y={path.midY + 3}
                      textAnchor="middle"
                      fontFamily="var(--font-serif)"
                      fontSize="9"
                      fill={style.color}
                      opacity="0.65"
                      letterSpacing="1">
                      {path.midYear}
                    </text>
                  )}
                </g>
              );
            })}

          </svg>
        </div>

        {/* 关系详情 · hover 时显示 */}
        {hoveredRelation != null && POET_RELATIONS[hoveredRelation] && (
          <div style={{
            marginTop: 20,
            padding: '20px 26px',
            background: 'var(--bg-elev)',
            borderLeft: `3px solid ${RELATION_STYLES[POET_RELATIONS[hoveredRelation].type].color}`,
            borderRadius: 'var(--radius-md)',
            animation: 'hx-fade-up 200ms ease-out'
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 12,
              marginBottom: 10, flexWrap: 'wrap'
            }}>
              <span className="serif" style={{
                fontSize: 18,
                color: 'var(--ink)',
                fontWeight: 700,
                letterSpacing: '0.15em'
              }}>
                {POETS.find(p => p.id === POET_RELATIONS[hoveredRelation].from)?.name}
                <span style={{
                  margin: '0 10px',
                  color: RELATION_STYLES[POET_RELATIONS[hoveredRelation].type].color
                }}>→</span>
                {POETS.find(p => p.id === POET_RELATIONS[hoveredRelation].to)?.name}
              </span>
              <span className="mono" style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                letterSpacing: '0.15em'
              }}>
                {POET_RELATIONS[hoveredRelation].years}
              </span>
            </div>
            <div className="serif" style={{
              fontSize: 14,
              color: 'var(--ink-2)',
              lineHeight: 2.0,
              letterSpacing: '0.04em'
            }}>
              {POET_RELATIONS[hoveredRelation].detail}
            </div>
            <div style={{
              marginTop: 10,
              fontSize: 10,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.2em'
            }}>
              史料 · {POET_RELATIONS[hoveredRelation].evidence}
            </div>
          </div>
        )}

        {/* 关系列表（hover 不便利时的备用） */}
        <div style={{ marginTop: 32 }}>
          <div className="cn-caps" style={{ marginBottom: 14 }}>
            诗人交集 · {POET_RELATIONS.length} 条考证关系
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 12
          }}>
            {POET_RELATIONS.map((rel, i) => {
              const style = RELATION_STYLES[rel.type];
              const fromPoet = POETS.find(p => p.id === rel.from);
              const toPoet = POETS.find(p => p.id === rel.to);
              return (
                <div key={i}
                  onMouseEnter={() => setHoveredRelation(i)}
                  onMouseLeave={() => setHoveredRelation(null)}
                  style={{
                    padding: 16,
                    background: 'var(--bg-elev)',
                    borderLeft: `3px solid ${style.color}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'help',
                    transition: 'var(--t-card)',
                    transform: hoveredRelation === i ? 'translateY(-2px)' : 'none',
                    boxShadow: hoveredRelation === i ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: 6
                  }}>
                    <span className="serif" style={{
                      fontSize: 14,
                      color: 'var(--ink)',
                      fontWeight: 600,
                      letterSpacing: '0.1em'
                    }}>
                      {fromPoet?.name} → {toPoet?.name}
                    </span>
                    <span style={{
                      fontSize: 9,
                      color: style.color,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.15em',
                      fontWeight: 700
                    }}>
                      {style.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.1em'
                  }}>
                    {rel.years} · {rel.detail.slice(0, 50)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 尾部 · 下一步 */}
        <div style={{
          marginTop: 40,
          padding: '20px 24px',
          textAlign: 'center',
          background: 'var(--bg-sunk)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--ink-3)',
          fontSize: 11,
          fontFamily: 'var(--font-serif)',
          lineHeight: 2.0,
          letterSpacing: '0.1em'
        }}>
          <span style={{ color: 'var(--ink-2)' }}>目前收录 4 位诗人 · {POET_RELATIONS.length} 条关系</span><br/>
          所有交往 · 师承 · 追慕 · 均有史料依据 · 不臆测私交。<br/>
          后续将加入 王维 · 陆游 · 李清照 · 刘禹锡 · 元稹 ···
        </div>
      </div>
    </div>
  );
}
