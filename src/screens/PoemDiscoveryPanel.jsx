import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { POEM_MAP, ATMOSPHERE_LABELS } from '../data/poem-flora-map.js';
import { recommendSpotsForPoem } from '../utils/poem-match.js';
import { FLOWER_PALETTE, extractFlowerKey } from '../components/FlowerMarker.jsx';

/* ═══════════════════════════════════════════════════════════════
   PoemDiscoveryPanel · 以诗寻景
   ───────────────────────────────────────────────────────────────
   左侧：12 首诗（可按花种/季节筛选）
   右侧：选中诗的景点推荐 + 推荐理由
   
   朋友点击景点 → 跳 map + setSelectedId
   ═══════════════════════════════════════════════════════════════ */

function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export function PoemDiscoveryPanel({ flora, onBack, onSelectSpot }) {
  const [selectedPoemId, setSelectedPoemId] = useState(POEM_MAP[0].id);
  const [filterSeason, setFilterSeason] = useState('all');  // 'all' / 'spring' / 'summer' / 'autumn' / 'winter'

  const isMobile = useIsMobile(860);
  const [mobileSide, setMobileSide] = useState('list'); // 'list' | 'detail'

  const selectedPoem = POEM_MAP.find(p => p.id === selectedPoemId);

  const filteredPoems = useMemo(() => {
    if (filterSeason === 'all') return POEM_MAP;
    const seasonMonths = {
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      autumn: [9, 10, 11],
      winter: [12, 1, 2]
    };
    const months = seasonMonths[filterSeason] || [];
    return POEM_MAP.filter(p =>
      (p.months || []).some(m => months.includes(m))
    );
  }, [filterSeason]);

  const recommendations = useMemo(
    () => selectedPoem ? recommendSpotsForPoem(selectedPoem, flora, 6) : [],
    [selectedPoem, flora]
  );

  const onPickPoem = (id) => {
    setSelectedPoemId(id);
    if (isMobile) setMobileSide('detail');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="以诗寻景 · 十二首精选"
        title="寻 · 诗 · 之 · 景"
        sub={<>每首诗有其季节、氛围与花 · 寻那首诗里的景 · 实地去一次</>}
        onBack={onBack}
      />

      {/* 季节筛选 */}
      <div style={{
        padding: '0 clamp(24px, 5vw, 48px) 16px',
        display: 'flex', gap: 6, flexWrap: 'wrap'
      }}>
        {[
          { k: 'all',    l: '全年' },
          { k: 'spring', l: '春' },
          { k: 'summer', l: '夏' },
          { k: 'autumn', l: '秋' },
          { k: 'winter', l: '冬' }
        ].map(s => (
          <button key={s.k}
            onClick={() => setFilterSeason(s.k)}
            className="btn sm"
            style={{
              background: filterSeason === s.k ? 'var(--zhusha)' : 'var(--bg-elev)',
              color: filterSeason === s.k ? 'var(--paper)' : 'var(--ink-2)',
              border: `1px solid ${filterSeason === s.k ? 'var(--zhusha)' : 'var(--line)'}`,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.2em'
            }}>
            {s.l}
          </button>
        ))}
      </div>

      {/* 移动端 Tab */}
      {isMobile && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          margin: '0 clamp(24px, 5vw, 48px) 16px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          {[
            { k: 'list',   l: '诗 选' },
            { k: 'detail', l: '景 推' }
          ].map(t => (
            <button key={t.k}
              onClick={() => setMobileSide(t.k)}
              style={{
                padding: '10px',
                background: mobileSide === t.k ? 'var(--zhusha)' : 'var(--bg-elev)',
                color: mobileSide === t.k ? 'var(--paper)' : 'var(--ink-2)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.25em',
                fontSize: 13
              }}>
              {t.l}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? undefined : 'minmax(340px, 400px) 1fr',
        gap: isMobile ? 0 : 24,
        padding: '0 clamp(24px, 5vw, 48px) 48px'
      }}>

        {/* ─── 左侧 · 诗选 ─── */}
        {(!isMobile || mobileSide === 'list') && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredPoems.map(p => {
              const active = p.id === selectedPoemId;
              return (
                <button key={p.id}
                  onClick={() => onPickPoem(p.id)}
                  className="card interactive"
                  style={{
                    padding: 16,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderLeft: active
                      ? '3px solid var(--zhusha)'
                      : '3px solid transparent',
                    background: active
                      ? 'color-mix(in oklch, var(--zhusha) 5%, var(--bg-elev))'
                      : 'var(--bg-elev)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="serif" style={{
                      fontSize: 17,
                      letterSpacing: '0.15em',
                      color: active ? 'var(--zhusha)' : 'var(--ink)',
                      fontWeight: 600
                    }}>《{p.title}》</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {p.seasonHint}
                    </span>
                  </div>
                  <div className="serif" style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    marginTop: 4,
                    letterSpacing: '0.15em'
                  }}>
                    {p.author}
                  </div>
                  <div className="serif" style={{
                    fontSize: 12,
                    color: 'var(--ink-2)',
                    marginTop: 8,
                    lineHeight: 1.8,
                    letterSpacing: '0.06em',
                    fontStyle: 'italic',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {p.lines[0]}
                  </div>
                  <div style={{
                    display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: 10, padding: '2px 7px',
                      background: 'var(--bg-sunk)',
                      borderRadius: 100,
                      color: 'var(--ink-2)',
                      fontFamily: 'var(--font-serif)',
                      letterSpacing: '0.1em'
                    }}>{p.species}</span>
                    {(p.atmosphere || []).slice(0, 2).map(a => (
                      <span key={a} style={{
                        fontSize: 10, padding: '2px 7px',
                        background: 'var(--bg-sunk)',
                        borderRadius: 100,
                        color: 'var(--ink-3)',
                        fontFamily: 'var(--font-serif)',
                        letterSpacing: '0.1em'
                      }}>{ATMOSPHERE_LABELS[a] || a}</span>
                    ))}
                  </div>
                </button>
              );
            })}
            {filteredPoems.length === 0 && (
              <div style={{
                padding: 40, textAlign: 'center',
                color: 'var(--ink-3)', fontSize: 13,
                fontFamily: 'var(--font-serif)'
              }}>
                此季尚无收录 · 敬请期待
              </div>
            )}
          </aside>
        )}

        {/* ─── 右侧 · 景推 ─── */}
        {(!isMobile || mobileSide === 'detail') && selectedPoem && (
          <main>
            {/* 诗展示 */}
            <div style={{
              padding: '28px 32px',
              background: 'linear-gradient(135deg, var(--bg-elev), var(--paper))',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 20,
              position: 'relative'
            }}>
              {/* 印章 */}
              <div style={{
                position: 'absolute', top: 20, right: 20
              }}>
                <Seal size="sm" rotate={-4}>{selectedPoem.species}</Seal>
              </div>

              <div className="cn-caps" style={{ color: 'var(--zhusha)' }}>
                {selectedPoem.seasonHint}
              </div>
              <div className="serif" style={{
                fontSize: 24,
                letterSpacing: '0.15em',
                marginTop: 6,
                color: 'var(--ink)',
                fontWeight: 700
              }}>《{selectedPoem.title}》</div>
              <div className="serif" style={{
                fontSize: 12,
                color: 'var(--ink-3)',
                marginTop: 4,
                letterSpacing: '0.2em'
              }}>{selectedPoem.author}</div>

              <div className="serif" style={{
                fontSize: 15,
                color: 'var(--ink)',
                marginTop: 18,
                lineHeight: 2.2,
                letterSpacing: '0.08em',
                fontStyle: 'italic'
              }}>
                {selectedPoem.lines.map((line, i) => <div key={i}>{line}</div>)}
              </div>

              {/* 导语 */}
              <div style={{
                marginTop: 18,
                padding: '12px 16px',
                background: 'var(--bg-sunk)',
                borderLeft: '2px solid var(--jin)',
                borderRadius: 4,
                fontSize: 13,
                color: 'var(--ink-2)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.9,
                letterSpacing: '0.04em'
              }}>
                {selectedPoem.annotation}
              </div>

              {/* 氛围标签 */}
              <div style={{
                marginTop: 14,
                display: 'flex', gap: 6, flexWrap: 'wrap'
              }}>
                {(selectedPoem.atmosphere || []).map(a => (
                  <span key={a} style={{
                    fontSize: 11, padding: '3px 10px',
                    background: 'color-mix(in oklch, var(--qing) 14%, var(--bg-elev))',
                    color: 'var(--qing)',
                    borderRadius: 100,
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.1em'
                  }}>
                    {ATMOSPHERE_LABELS[a] || a}
                  </span>
                ))}
              </div>
            </div>

            {/* 推荐景点 */}
            <div>
              <div className="cn-caps" style={{ marginBottom: 14 }}>
                {recommendations.length > 0
                  ? `寻此诗之景 · 为你挑 ${recommendations.length} 处`
                  : '寻此诗之景'}
              </div>

              {recommendations.length === 0 ? (
                <EmptyState
                  variant="inline"
                  symbol="🌸"
                  title="暂无匹配景点"
                  sub={<>花信风正在扩充 {selectedPoem.species} 的景点数据</>}
                />
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 12
                }}>
                  {recommendations.map(({ spot, score, reasons }) => (
                    <button key={spot.id}
                      onClick={() => onSelectSpot && onSelectSpot(spot.id)}
                      className="card interactive"
                      style={{
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        overflow: 'hidden'
                      }}>
                      <PoemSpotCover spot={spot} species={spot.sp}/>
                      <div style={{ padding: 14 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline'
                        }}>
                          <span className="serif" style={{
                            fontSize: 15,
                            letterSpacing: '0.1em',
                            color: 'var(--ink)',
                            fontWeight: 600
                          }}>{spot.n}</span>
                          <span className="mono" style={{
                            fontSize: 10,
                            color: 'var(--zhusha)',
                            letterSpacing: '0.1em'
                          }}>{score}%</span>
                        </div>
                        <div className="mono" style={{
                          fontSize: 10,
                          color: 'var(--ink-3)',
                          marginTop: 4,
                          letterSpacing: '0.1em'
                        }}>
                          {spot.rg} · {spot.pk ? `${spot.pk[0]}月-${spot.pk[1]}月` : ''}
                        </div>
                        {reasons && reasons.length > 0 && (
                          <div style={{
                            marginTop: 10,
                            display: 'flex', gap: 4, flexWrap: 'wrap'
                          }}>
                            {reasons.map((r, i) => (
                              <span key={i} style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                background: 'var(--bg-sunk)',
                                borderRadius: 100,
                                color: 'var(--ink-2)',
                                fontFamily: 'var(--font-serif)',
                                letterSpacing: '0.1em'
                              }}>{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 诚实提示 */}
            <div style={{
              marginTop: 32,
              padding: '16px 20px',
              textAlign: 'center',
              background: 'var(--bg-sunk)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink-3)',
              fontSize: 11,
              fontFamily: 'var(--font-serif)',
              lineHeight: 1.9,
              letterSpacing: '0.1em'
            }}>
              <span style={{ color: 'var(--ink-2)' }}>诗词寻景 · 目前精选 12 首</span><br/>
              陆续增加中 · 你最想看见哪首诗的景？<br/>
              欢迎点击右下 ✍ 告诉我
            </div>
          </main>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PoemSpotCover · 纸本花瓣封面（替代外部图片）
   v6.3.3 改用 FLOWER_PALETTE · 支持 25 种花 · 其余 fallback "杂花"
   ═══════════════════════════════════════════════════════════════ */
function PoemSpotCover({ spot, species }) {
  // 从花种名（"梅花"/"桃花"/"荷花"...）提取 key（"梅"/"桃"/"荷"）
  const key = extractFlowerKey(species);
  const p = FLOWER_PALETTE[key] || FLOWER_PALETTE['杂花'];

  // 本地重命名 · 对齐旧代码里的字段
  const petal = p.petal;
  const centerColor = p.center;
  const bg = p.bg;
  const petalCount = p.petals;

  // 根据 id 给一点旋转和偏移 · 不千篇一律
  const seed = (spot.id || 0) * 31;
  const rotate1 = (seed % 360);
  const rotate2 = ((seed * 7) % 360);

  return (
    <div style={{
      position: 'relative',
      aspectRatio: '16 / 9',
      background: `linear-gradient(135deg, color-mix(in oklch, ${bg} 30%, var(--paper)), var(--paper))`,
      overflow: 'hidden'
    }}>
      <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* 背景大花 · 淡 · 装饰 */}
        <g transform={`translate(260, 40) rotate(${rotate1})`} opacity="0.22">
          {petalCount > 0 ? Array.from({ length: petalCount }, (_, i) => {
            const deg = (i * 360 / petalCount);
            return (
              <ellipse key={i} cx="0" cy="-30" rx="14" ry="28"
                fill={petal}
                transform={`rotate(${deg})`}/>
            );
          }) : (
            /* 叶片（枫/柳/竹/藤等无花瓣植物） */
            <path d="M 0 -25 L 18 5 L 0 -3 L -18 5 Z" fill={petal}/>
          )}
          <circle cx="0" cy="0" r="8" fill={centerColor}/>
        </g>

        {/* 主花 · 大 · 正中偏左 */}
        <g transform={`translate(80, 90) rotate(${rotate2})`}>
          {petalCount > 0 ? Array.from({ length: petalCount }, (_, i) => {
            const deg = (i * 360 / petalCount);
            return (
              <ellipse key={i} cx="0" cy="-42" rx="20" ry="40"
                fill={petal} opacity="0.85"
                transform={`rotate(${deg})`}/>
            );
          }) : (
            <>
              <path d="M 0 -35 L 25 10 L 5 -2 L -5 -2 L -25 10 Z" fill={petal} opacity="0.85"/>
              <path d="M 0 -25 L 15 6 L 0 -2 L -15 6 Z" fill={petal} opacity="0.95"/>
            </>
          )}
          <circle cx="0" cy="0" r="14" fill={centerColor}/>
          <circle cx="0" cy="0" r="7" fill="#f8a030"/>
        </g>

        {/* 朱砂落款 · 右下 */}
        <g transform="translate(275, 155)">
          <rect x="-18" y="-14" width="36" height="28" fill="#c23820" rx="2"/>
          <text x="0" y="1" textAnchor="middle"
            fontFamily="serif" fontSize="9" fill="#faf2e3"
            letterSpacing="1">{species}</text>
          <text x="0" y="10" textAnchor="middle"
            fontFamily="serif" fontSize="7" fill="#faf2e3"
            letterSpacing="1">花事</text>
        </g>
      </svg>
    </div>
  );
}
