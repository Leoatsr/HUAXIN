import React, { useState, useMemo } from 'react';
import { Icon, Seal, Placeholder } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { FLORA_WIKI, WIKI_SPECIES } from '../data/flora-wiki.js';

/* ═══════════════════════════════════════════════════════════════
   花卉百科
   左：花种列表（可搜索）
   右：选中花卉的详情卡（别名/学名/科属/花语/原产/故事/养护/诗词）
   点击底部 "去看此花" 跳到地图 filter 到该花种
   ═══════════════════════════════════════════════════════════════ */
export function WikiPanel({ flora, initialSp, onBack, onGotoFlower }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(initialSp || WIKI_SPECIES[0]);

  // 花种 → 景点数量
  const counts = useMemo(() => {
    const m = {};
    for (const f of flora) m[f.sp] = (m[f.sp] || 0) + 1;
    return m;
  }, [flora]);

  // 搜索过滤
  const filtered = useMemo(() => {
    if (!search) return WIKI_SPECIES;
    const q = search.toLowerCase();
    return WIKI_SPECIES.filter(sp => {
      const w = FLORA_WIKI[sp];
      return sp.toLowerCase().includes(q) ||
        (w.alias || '').toLowerCase().includes(q) ||
        (w.sci || '').toLowerCase().includes(q);
    });
  }, [search]);

  const current = FLORA_WIKI[selected];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      {/* 头部 · 带背景色和分隔线 · 保留 Wiki 独有的侧栏视觉 */}
      <div style={{
        borderBottom: '1px solid var(--line-2)',
        background: 'var(--bg-elev)'
      }}>
        <ScreenHeader
          eyebrow={`草木皆知 · ${WIKI_SPECIES.length} 卷`}
          title="花卉百科"
          onBack={onBack}
          backLabel="返回花事地图"
        />
      </div>

      {/* 双栏 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 280px) 1fr',
        minHeight: 'calc(100vh - 46px - 76px)'
      }}>
        {/* ─── 左：花种列表 ─── */}
        <aside style={{
          borderRight: '1px solid var(--line-2)',
          background: 'var(--bg-elev)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-2)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg)'
            }}>
              <Icon.search/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="花名 · 学名"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)'
                }}/>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.map(sp => {
              const w = FLORA_WIKI[sp];
              const count = counts[sp] || 0;
              const active = sp === selected;
              return (
                <button key={sp} onClick={() => setSelected(sp)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '12px 18px',
                    border: 'none',
                    background: active ? 'var(--bg-sunk)' : 'transparent',
                    borderLeft: active ? '3px solid var(--zhusha)' : '3px solid transparent',
                    cursor: 'pointer', textAlign: 'left'
                  }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="serif" style={{
                      fontSize: 14, letterSpacing: '0.05em',
                      color: active ? 'var(--zhusha)' : 'var(--ink)'
                    }}>{sp}</div>
                    <div style={{
                      fontSize: 10, color: 'var(--ink-3)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{w.sci}</div>
                  </div>
                  {count > 0 && (
                    <span className="pill" style={{ fontSize: 10, padding: '2px 6px' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
                未找到相关花卉
              </div>
            )}
          </div>
        </aside>

        {/* ─── 右：详情 ─── */}
        <main style={{ padding: 'clamp(20px, 3vw, 36px)', overflow: 'auto' }}>
          {!current && (
            <div style={{ color: 'var(--ink-3)', padding: 48, textAlign: 'center' }}>
              请在左侧选择花卉
            </div>
          )}
          {current && (
            <div style={{ maxWidth: 840, margin: '0 auto' }}>
              {/* 头部 */}
              <div style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(20px, 3vw, 32px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 24, right: 24 }}>
                  <Seal size="sm" rotate={-6}>草木<br/>志</Seal>
                </div>

                <div className="cn-caps">{current.family}</div>
                <div className="serif" style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  letterSpacing: '0.1em',
                  marginTop: 8,
                  color: 'var(--ink)'
                }}>{selected}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ink-3)',
                  marginTop: 4,
                  fontStyle: 'italic'
                }}>{current.sci}</div>

                <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                  {(current.alias || '').split(/[、,，]/).filter(Boolean).map(a => (
                    <span key={a} className="pill">{a}</span>
                  ))}
                  {current.flang && <span className="pill zhusha">花语 · {current.flang}</span>}
                </div>

                {counts[selected] > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <button className="btn zhusha" onClick={() => onGotoFlower && onGotoFlower(selected)}>
                      <Icon.pin/> 全国 {counts[selected]} 处赏此花
                    </button>
                  </div>
                )}
              </div>

              {/* 三栏正文 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16, marginTop: 20
              }}>
                {current.origin && (
                  <section className="card" style={{ padding: 20 }}>
                    <div className="cn-caps" style={{ marginBottom: 10 }}>原 产</div>
                    <div className="serif" style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--ink-2)' }}>
                      {current.origin}
                    </div>
                  </section>
                )}
                {current.care && (
                  <section className="card" style={{ padding: 20 }}>
                    <div className="cn-caps" style={{ marginBottom: 10 }}>养 护</div>
                    <div className="serif" style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--ink-2)' }}>
                      {current.care}
                    </div>
                  </section>
                )}
              </div>

              {/* 故事 */}
              {current.story && (
                <section className="card paper-bg" style={{
                  padding: 'clamp(20px, 3vw, 32px)',
                  marginTop: 16
                }}>
                  <div className="cn-caps" style={{ marginBottom: 12 }}>花 事 典 故</div>
                  <div className="serif" style={{
                    fontSize: 14, lineHeight: 2.1,
                    letterSpacing: '0.03em',
                    color: 'var(--ink)'
                  }}>
                    {current.story}
                  </div>
                </section>
              )}

              {/* 诗词 */}
              {current.poems && current.poems.length > 0 && (
                <section style={{ marginTop: 16 }}>
                  <div className="cn-caps" style={{ marginBottom: 12, paddingLeft: 4 }}>
                    花  事  入  诗 · {current.poems.length} 首
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {current.poems.map((p, i) => (
                      <div key={i} className="card" style={{
                        padding: 'clamp(18px, 2.5vw, 24px)',
                        borderLeft: '3px solid var(--zhusha)'
                      }}>
                        <div className="serif" style={{
                          fontSize: 'clamp(14px, 1.6vw, 16px)',
                          lineHeight: 2,
                          letterSpacing: '0.08em',
                          color: 'var(--ink)'
                        }}>
                          {p.t.split(/[。!?！？]/).filter(Boolean).map((line, j, arr) => (
                            <div key={j}>{line}{j < arr.length - 1 ? '。' : ''}</div>
                          ))}
                        </div>
                        <div style={{
                          marginTop: 10,
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          fontFamily: 'var(--font-serif)',
                          textAlign: 'right'
                        }}>
                          — {p.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div style={{ height: 48 }}/>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
