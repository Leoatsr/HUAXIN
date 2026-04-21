import React, { useState, useMemo } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { HUAXIN_24, HUAXIN_POEMS } from '../data/huaxin.js';
import { FLORA_WIKI } from '../data/flora-wiki.js';

/* ═══════════════════════════════════════════════════════════════
   诗词花事
   三个视图：二十四番诗、花卉入诗、景点诗句
   花卉入诗使用 FLORA_WIKI 里的 poems，24番用 HUAXIN_POEMS
   ═══════════════════════════════════════════════════════════════ */
export function PoemPanel({ flora, onBack, onGotoFlower, onSelectSpot, onGoDiscovery }) {
  const [view, setView] = useState('huaxin'); // huaxin | wiki | spots
  const [search, setSearch] = useState('');

  // ═══ 1. 二十四番花信诗 ═══
  const huaxinPoems = useMemo(() => {
    const arr = [];
    HUAXIN_24.forEach((jq, jqIdx) => {
      jq.f.forEach((flower, hIdx) => {
        const p = HUAXIN_POEMS[flower];
        if (!p) return;
        arr.push({
          sp: flower,
          jq: jq.jq,
          date: jq.date,
          hou: ['初候','二候','三候'][hIdx],
          houIdx: jqIdx * 3 + hIdx,
          poem: p.poem,
          author: p.author,
          lang: p.lang
        });
      });
    });
    return arr;
  }, []);

  // ═══ 2. 花卉入诗（来自 FLORA_WIKI.poems） ═══
  const wikiPoems = useMemo(() => {
    const arr = [];
    for (const [sp, w] of Object.entries(FLORA_WIKI)) {
      if (!w.poems) continue;
      for (const p of w.poems) {
        arr.push({ sp, text: p.t, author: p.a });
      }
    }
    return arr;
  }, []);

  // ═══ 3. 景点诗句（来自 FLORA.po） ═══
  const spotPoems = useMemo(() => {
    return flora
      .filter(f => f.po)
      .map(f => ({ spotId: f.id, name: f.n, sp: f.sp, text: f.po, region: f.rg }))
      .sort((a, b) => a.sp.localeCompare(b.sp));
  }, [flora]);

  // 搜索过滤
  const doFilter = (arr, fields) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter(x => fields.some(f => (x[f] || '').toLowerCase().includes(q)));
  };

  const filteredHuaxin = useMemo(() =>
    doFilter(huaxinPoems, ['sp','poem','author','jq']),
    [huaxinPoems, search]);
  const filteredWiki = useMemo(() =>
    doFilter(wikiPoems, ['sp','text','author']),
    [wikiPoems, search]);
  const filteredSpots = useMemo(() =>
    doFilter(spotPoems, ['sp','text','name']),
    [spotPoems, search]);

  const viewCount =
    view === 'huaxin' ? filteredHuaxin.length :
    view === 'wiki' ? filteredWiki.length : filteredSpots.length;

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--paper)' }}>
      <ScreenHeader
        eyebrow="墨香 · 花信 · 山川"
        title="诗词花事"
        sub="以诗为尺 · 以花为记"
        onBack={onBack}
        right={onGoDiscovery ? (
          <button onClick={onGoDiscovery}
            className="btn"
            style={{
              background: 'color-mix(in oklch, var(--jin) 18%, var(--bg-elev))',
              color: 'var(--ink)',
              border: '1px solid var(--jin)',
              letterSpacing: '0.25em',
              fontFamily: 'var(--font-serif)',
              fontWeight: 600
            }}>
            ✦ 以诗寻景
          </button>
        ) : null}
      />

      {/* 控制条 */}
      <div style={{
        padding: '8px clamp(24px, 5vw, 48px) 20px',
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['huaxin', `二十四番 · ${huaxinPoems.length}`],
            ['wiki',   `花卉入诗 · ${wikiPoems.length}`],
            ['spots',  `景点诗句 · ${spotPoems.length}`]
          ].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} className="btn sm"
              style={{
                background: view === k ? 'var(--zhusha)' : 'transparent',
                color: view === k ? 'var(--paper)' : 'var(--ink-2)',
                borderColor: view === k ? 'var(--zhusha)' : 'var(--line)',
                fontFamily: 'var(--font-serif)'
              }}>{l}</button>
          ))}
        </div>
        <div style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elev)',
          minWidth: 200
        }}>
          <Icon.search/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="诗句 · 花名 · 作者"
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)'
            }}/>
        </div>
      </div>

      {/* 诗词列表 */}
      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>
        {viewCount === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            无匹配诗词
          </div>
        )}

        {view === 'huaxin' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16
          }}>
            {filteredHuaxin.map((p, i) => (
              <div key={i} className="card paper-bg" style={{
                padding: 24, borderLeft: '3px solid var(--zhusha)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                    {p.houIdx + 1}/24
                  </div>
                </div>
                <div className="cn-caps">{p.jq} · {p.hou} · {p.date}</div>
                <div className="serif" style={{
                  fontSize: 20, letterSpacing: '0.1em',
                  marginTop: 8, color: 'var(--zhusha)'
                }}>{p.sp}</div>
                <div className="serif" style={{
                  fontSize: 14, lineHeight: 2, letterSpacing: '0.08em',
                  marginTop: 14, color: 'var(--ink)'
                }}>
                  {p.poem.split('\n').map((line, j) => <div key={j}>{line}</div>)}
                </div>
                <div style={{
                  marginTop: 10, fontSize: 11, color: 'var(--ink-3)',
                  fontFamily: 'var(--font-serif)', textAlign: 'right'
                }}>
                  — {p.author}
                </div>
                {p.lang && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <span className="pill qing">花语 · {p.lang}</span>
                    {onGotoFlower && (
                      <button className="pill zhusha" onClick={() => onGotoFlower(p.sp)}
                        style={{ cursor: 'pointer', border: 'none' }}>
                        <Icon.pin/> 看此花
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'wiki' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16
          }}>
            {filteredWiki.map((p, i) => (
              <div key={i} className="card" style={{
                padding: 24, borderLeft: '3px solid var(--qing)'
              }}>
                <div className="cn-caps" style={{ marginBottom: 8 }}>
                  {p.sp}
                </div>
                <div className="serif" style={{
                  fontSize: 14, lineHeight: 2, letterSpacing: '0.06em',
                  color: 'var(--ink)'
                }}>
                  {p.text.split(/[。!?！？]/).filter(Boolean).map((line, j, arr) => (
                    <div key={j}>{line}{j < arr.length - 1 ? '。' : ''}</div>
                  ))}
                </div>
                <div style={{
                  marginTop: 10, fontSize: 11, color: 'var(--ink-3)',
                  fontFamily: 'var(--font-serif)', textAlign: 'right'
                }}>
                  — {p.author}
                </div>
                {onGotoFlower && (
                  <button className="btn sm ghost" onClick={() => onGotoFlower(p.sp)}
                    style={{ marginTop: 10 }}>
                    <Icon.pin/> 看此花
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 'spots' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 14
          }}>
            {filteredSpots.map((p) => (
              <button key={p.spotId}
                onClick={() => onSelectSpot && onSelectSpot(p.spotId)}
                className="card"
                style={{
                  padding: 20, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid var(--line)',
                  background: 'var(--bg-elev)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="pill zhusha" style={{ fontSize: 10 }}>{p.sp}</span>
                  <span className="cn-caps" style={{ fontSize: 10 }}>{p.region}</span>
                </div>
                <div className="serif" style={{
                  fontSize: 14, lineHeight: 1.9,
                  color: 'var(--ink)', letterSpacing: '0.05em'
                }}>
                  {p.text}
                </div>
                <div style={{
                  marginTop: 10, fontSize: 11, color: 'var(--ink-3)',
                  fontFamily: 'var(--font-serif)'
                }}>
                  — {p.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
