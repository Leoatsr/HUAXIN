import React, { useState, useMemo } from 'react';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { InkMap } from '../components/InkMap.jsx';
import { MapCanvas } from '../components/MapCanvas.jsx';
import { PoetTrailOverlay, detectEncounters } from '../components/PoetTrailOverlay.jsx';
import { POETS, POETS_BY_DYNASTY } from '../data/poet-footprint.js';
import { matchStory } from '../data/encounter-stories.js';
import { POET_CIRCLES } from '../data/poet-circles.js';

export function DynastyGardenPanel({ onBack }) {
  const [mode, setMode] = useState('ensemble');
  const [soloPoetId, setSoloPoetId] = useState('dufu');
  const [selectedScene, setSelectedScene] = useState(null);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [mapCenter, setMapCenter] = useState([104.5, 35]);
  const [mapZoom, setMapZoom] = useState(1);

  // 核心 8 位 · 群像默认
  const CORE_POET_IDS = ['dufu', 'libai', 'baijuyi', 'sushi', 'wangwei', 'menghaoran', 'liuyuxi', 'dumu'];
  // 当前选中的诗人圈 id · null = 用 CORE + extra
  const [activeCircleId, setActiveCircleId] = useState(null);
  const [extraPoetIds, setExtraPoetIds] = useState([]);

  const poetIds = useMemo(() => {
    if (mode === 'solo') return [soloPoetId];
    if (activeCircleId) {
      const c = POET_CIRCLES.find(x => x.id === activeCircleId);
      if (c) return c.poetIds;
    }
    return [...CORE_POET_IDS, ...extraPoetIds];
  }, [mode, soloPoetId, activeCircleId, extraPoetIds]);

  const activeCircle = useMemo(() =>
    activeCircleId ? POET_CIRCLES.find(c => c.id === activeCircleId) : null,
    [activeCircleId]
  );

  const currentStop = useMemo(() => {
    if (!selectedScene) return null;
    const poet = POETS.find(p => p.id === selectedScene.poetId);
    if (!poet) return null;
    const stop = poet.footprints[selectedScene.stopIdx];
    if (!stop) return null;
    return { poet, stop };
  }, [selectedScene]);

  const encounterStats = useMemo(() => {
    if (mode !== 'ensemble') return null;
    const encs = detectEncounters(POETS);
    return {
      total: encs.length,
      precise: encs.filter(e => e.type === 'precise').length,
      loose: encs.filter(e => e.type === 'loose').length
    };
  }, [mode]);

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="朝代花园 · 千年花事一庭收"
        title="朝 · 代 · 花 · 园"
        sub={<>真实山河之上 · 三十位诗人的一生 · 相遇与错过</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(20px, 4vw, 48px) 24px' }}>

        {/* 模式切换 + 诗人选择 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: 12, marginBottom: 20,
          padding: '14px 20px',
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-md)',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--bg-sunk)',
            padding: 4,
            borderRadius: 'var(--radius-md)'
          }}>
            <button onClick={() => { setMode('ensemble'); setSelectedScene(null); setSelectedEncounter(null); }}
              className="serif"
              style={{
                background: mode === 'ensemble' ? 'var(--zhusha)' : 'transparent',
                color: mode === 'ensemble' ? 'var(--paper)' : 'var(--ink-2)',
                border: 'none', cursor: 'pointer',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                letterSpacing: '0.2em',
                fontWeight: 600
              }}>群 像</button>
            <button onClick={() => { setMode('solo'); setSelectedScene(null); setSelectedEncounter(null); }}
              className="serif"
              style={{
                background: mode === 'solo' ? 'var(--zhusha)' : 'transparent',
                color: mode === 'solo' ? 'var(--paper)' : 'var(--ink-2)',
                border: 'none', cursor: 'pointer',
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                letterSpacing: '0.2em',
                fontWeight: 600
              }}>单 位</button>
          </div>

          {mode === 'solo' && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              maxWidth: '100%',
              padding: '2px 0'
            }}>
              {Object.entries(POETS_BY_DYNASTY).map(([dynasty, list]) => (
                list.length === 0 ? null : (
                  <div key={dynasty} style={{
                    display: 'flex', gap: 6, flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span className="cn-caps" style={{
                      fontSize: 9, color: 'var(--ink-3)',
                      letterSpacing: '0.2em',
                      minWidth: 32
                    }}>{dynasty}</span>
                    {list.map(p => (
                      <button key={p.id}
                        onClick={() => { setSoloPoetId(p.id); setSelectedScene(null); }}
                        className="serif"
                        style={{
                          background: soloPoetId === p.id ? p.color : 'var(--bg-sunk)',
                          color: soloPoetId === p.id ? 'var(--paper)' : 'var(--ink-2)',
                          border: soloPoetId === p.id ? 'none' : `1px solid ${p.color}`,
                          cursor: 'pointer',
                          padding: '4px 9px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 11,
                          letterSpacing: '0.1em',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>{p.name}</button>
                    ))}
                  </div>
                )
              ))}
            </div>
          )}

          <div style={{ flex: 1 }}/>

          {mode === 'ensemble' && encounterStats && (
            <div style={{
              display: 'flex', gap: 14,
              fontSize: 11,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.15em',
              color: 'var(--ink-3)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c23820' }}/>
                精准 {encounterStats.precise}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c89a4a' }}/>
                宽松 {encounterStats.loose}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {(mode === 'ensemble' ? POETS.filter(p => poetIds.includes(p.id)) : POETS.filter(p => p.id === soloPoetId)).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 16, height: 3, borderRadius: 1, background: p.color }}/>
                <span style={{
                  fontSize: 10, color: 'var(--ink-3)',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.15em'
                }}>{p.name}</span>
                {/* 非核心诗人 · 显示删除 × */}
                {mode === 'ensemble' && !CORE_POET_IDS.includes(p.id) && (
                  <button
                    onClick={() => setExtraPoetIds(ids => ids.filter(id => id !== p.id))}
                    title="隐藏此诗人"
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', color: 'var(--ink-3)',
                      fontSize: 10, padding: 0, marginLeft: -2
                    }}>×</button>
                )}
              </div>
            ))}
            {/* 群像模式 · 追加诗人 */}
            {mode === 'ensemble' && (
              <PoetAddButton
                currentIds={poetIds}
                onAdd={(id) => setExtraPoetIds(ids => [...ids, id])}
              />
            )}
          </div>
        </div>

        {/* ═══ 诗人圈快选 · 仅群像模式 ═══ */}
        {mode === 'ensemble' && (
          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 16,
            padding: '10px 16px',
            background: 'color-mix(in oklch, var(--jin) 4%, var(--bg-elev))',
            borderRadius: 'var(--radius-md)',
            borderLeft: '2px solid var(--jin)'
          }}>
            <span className="cn-caps" style={{
              fontSize: 9, color: 'var(--ink-3)',
              letterSpacing: '0.3em', marginRight: 4
            }}>诗 人 圈</span>

            {/* 默认 · 回到核心 8 位 */}
            <button
              onClick={() => { setActiveCircleId(null); setExtraPoetIds([]); }}
              style={{
                background: !activeCircleId ? 'var(--jin)' : 'transparent',
                color: !activeCircleId ? 'var(--paper)' : 'var(--ink-2)',
                border: '1px solid var(--jin)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.15em',
                fontWeight: 600
              }}>
              默认八家
            </button>

            {POET_CIRCLES.map(c => (
              <button key={c.id}
                onClick={() => setActiveCircleId(c.id)}
                title={c.desc + ' · ' + c.story}
                style={{
                  background: activeCircleId === c.id ? 'var(--zhusha)' : 'var(--paper)',
                  color: activeCircleId === c.id ? 'var(--paper)' : 'var(--ink-2)',
                  border: '1px solid ' + (activeCircleId === c.id ? 'var(--zhusha)' : 'var(--line)'),
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* 当前诗人圈描述 */}
        {mode === 'ensemble' && activeCircle && (
          <div style={{
            marginBottom: 14,
            padding: '10px 16px',
            background: 'var(--paper)',
            border: '1px solid var(--zhusha)',
            borderLeft: '3px solid var(--zhusha)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            fontFamily: 'var(--font-serif)',
            color: 'var(--ink-2)',
            letterSpacing: '0.08em',
            lineHeight: 1.7
          }}>
            <span style={{ fontWeight: 700, color: 'var(--zhusha)' }}>
              {activeCircle.name}
            </span>
            <span style={{ color: 'var(--ink-3)', margin: '0 10px' }}>·</span>
            <span>{activeCircle.desc}</span>
            <span style={{ color: 'var(--ink-3)', margin: '0 10px' }}>·</span>
            <span style={{ fontStyle: 'italic' }}>{activeCircle.story}</span>
            {activeCircle.note && (
              <div style={{
                marginTop: 6, fontSize: 10,
                color: 'var(--ink-3)', fontStyle: 'italic'
              }}>※ {activeCircle.note}</div>
            )}
          </div>
        )}

        {/* 主区：地图 + 右侧详情 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(500px, 1fr) minmax(320px, 420px)',
          gap: 20
        }} className="garden-layout">

          <MapCanvas
            spots={[]}
            showRegionLabels={true}
            center={mapCenter}
            zoom={mapZoom}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
            fillViewport={true}
            fillOffsetPx={300}
            minHeight={420}
            maxHeight={780}
          >
            <PoetTrailOverlay
              poetIds={poetIds}
              selectedScene={selectedScene}
              onSelectScene={(poetId, stopIdx) => {
                setSelectedScene({ poetId, stopIdx });
                setSelectedEncounter(null);
              }}
              onSelectEncounter={(e) => {
                setSelectedEncounter(e);
                setSelectedScene(null);
              }}
              center={mapCenter}
              zoom={mapZoom}
              showEncounters={mode === 'ensemble'}
            />
          </MapCanvas>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentStop && !selectedEncounter && (
              <SceneCard poet={currentStop.poet} stop={currentStop.stop}/>
            )}
            {selectedEncounter && (
              <EncounterCard encounter={selectedEncounter}/>
            )}
            {!currentStop && !selectedEncounter && (
              <IntroCard mode={mode}/>
            )}

            <div style={{
              padding: '14px 18px',
              background: 'var(--bg-sunk)',
              borderRadius: 'var(--radius-md)',
              fontSize: 11,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.1em',
              lineHeight: 1.9,
              marginTop: 'auto'
            }}>
              点地图上任何一朵花 → 读那一年那一地<br/>
              <span style={{ color: '#c23820' }}>红圈</span> = 真实相遇 ·
              <span style={{ color: '#c89a4a' }}> 黄圈</span> = 同时代
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .garden-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}


function SceneCard({ poet, stop }) {
  return (
    <div style={{
      padding: '22px 24px',
      background: `linear-gradient(180deg, color-mix(in oklch, ${poet.color} 6%, var(--paper)), var(--paper))`,
      border: `1px solid ${poet.color}`,
      borderLeft: `3px solid ${poet.color}`,
      borderRadius: 'var(--radius-md)'
    }}>
      <div className="mono" style={{
        fontSize: 11, color: poet.color,
        letterSpacing: '0.3em', fontWeight: 700, marginBottom: 4
      }}>
        {stop.year} 年 · {poet.name} {stop.age} 岁
      </div>
      <h3 className="serif" style={{
        fontSize: 22, color: 'var(--ink)',
        margin: '4px 0', letterSpacing: '0.15em', fontWeight: 700
      }}>
        《{stop.poemTitle}》
      </h3>
      <div className="serif" style={{
        fontSize: 12, color: 'var(--ink-3)',
        letterSpacing: '0.15em', marginBottom: 14
      }}>
        {stop.place} · 今日：{stop.todayLabel}
      </div>

      <div style={{
        padding: '14px 16px',
        background: 'var(--bg-sunk)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14, color: 'var(--ink)',
        fontFamily: 'var(--font-serif)',
        lineHeight: 2.1, letterSpacing: '0.1em',
        fontStyle: 'italic', marginBottom: 12
      }}>
        {stop.poemLines.map((line, i) => <div key={i}>{line}</div>)}
      </div>

      <div style={{
        fontSize: 11, color: poet.color,
        fontFamily: 'var(--font-serif)',
        letterSpacing: '0.2em', marginBottom: 10
      }}>
        ✿ {stop.flower}
      </div>

      <div style={{
        fontSize: 13, color: 'var(--ink-2)',
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.9, letterSpacing: '0.05em'
      }}>
        {stop.background}
      </div>
    </div>
  );
}


function EncounterCard({ encounter }) {
  const isPrecise = encounter.type === 'precise';
  const color = isPrecise ? '#c23820' : '#c89a4a';
  const story = isPrecise ? matchStory(encounter) : null;

  return (
    <div style={{
      background: `linear-gradient(135deg, color-mix(in oklch, ${color} 6%, var(--paper)), var(--paper))`,
      border: `2px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }}>
      {/* 头图（如果有）*/}
      {story?.image && (
        <div style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          background: 'var(--bg-sunk)'
        }}>
          <img src={story.image}
            alt={story.imageAlt || ''}
            loading="lazy"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {story.imageCaption && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '16px 16px 10px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))',
              color: 'var(--paper)',
              fontSize: 10,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.1em',
              fontStyle: 'italic'
            }}>
              {story.imageCaption}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '20px 22px' }}>
        <div className="mono" style={{
          fontSize: 10, color: color,
          letterSpacing: '0.35em', fontWeight: 700, marginBottom: 6
        }}>
          {isPrecise ? '⊙ 精 准 相 遇' : '◦ 同 时 代'}
        </div>
        <h3 className="serif" style={{
          fontSize: 22, color: 'var(--ink)',
          margin: '4px 0 6px',
          letterSpacing: '0.15em', fontWeight: 700
        }}>
          {story?.title || encounter.title}
        </h3>
        <div style={{
          fontSize: 11, color: 'var(--ink-3)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.15em', marginBottom: 14
        }}>
          {story ? `${story.year} · ${story.place}` : encounter.story}
        </div>

        {/* setup + scene（仅精准相遇有）*/}
        {story?.setup && (
          <div style={{
            fontSize: 13, color: 'var(--ink-2)',
            fontFamily: 'var(--font-serif)',
            lineHeight: 2.0, letterSpacing: '0.05em',
            marginBottom: 12
          }}>
            {story.setup}
          </div>
        )}

        {story?.scene && (
          <div style={{
            fontSize: 13, color: 'var(--ink)',
            fontFamily: 'var(--font-serif)',
            lineHeight: 2.0, letterSpacing: '0.06em',
            padding: '12px 14px',
            background: 'var(--bg-sunk)',
            borderLeft: `2px solid ${color}`,
            borderRadius: 'var(--radius-sm)',
            marginBottom: 14,
            fontStyle: 'italic'
          }}>
            {story.scene}
          </div>
        )}

        {/* 双列诗句（精准相遇用 story 的 linesA/B · 否则用 encounter stop 的 poemLines）*/}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[encounter.a, encounter.b].map((stop, i) => {
            // 优先级：story 的 linesA/B（精准）> stop.poemLines（宽松也能显示）> 标题
            const storyLines = story && ((i === 0 && story.linesA) || (i === 1 && story.linesB));
            const actualLines = storyLines || (stop.poemLines && stop.poemLines.length > 0 ? stop.poemLines : null);
            return (
              <div key={i} style={{
                padding: '12px 14px',
                background: 'var(--paper)',
                borderLeft: `2px solid ${stop.poetColor}`,
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div className="mono" style={{
                  fontSize: 9, color: stop.poetColor,
                  letterSpacing: '0.25em', fontWeight: 700, marginBottom: 4
                }}>
                  {stop.poetName} · {stop.year}
                </div>
                <div className="serif" style={{
                  fontSize: 11, color: 'var(--ink-3)',
                  letterSpacing: '0.1em', marginBottom: 4
                }}>
                  {stop.place}
                </div>
                {/* 诗题 */}
                {stop.poemTitle && (
                  <div className="serif" style={{
                    fontSize: 12, color: 'var(--ink-2)',
                    letterSpacing: '0.1em', marginBottom: 6,
                    fontWeight: 600
                  }}>
                    《{stop.poemTitle.replace(/^《|》$/g, '')}》
                  </div>
                )}
                {/* 诗句正文 */}
                {actualLines && (
                  <div className="serif" style={{
                    fontSize: 12, color: 'var(--ink)',
                    fontStyle: 'italic', letterSpacing: '0.08em',
                    lineHeight: 1.9
                  }}>
                    {storyLines ? (
                      `「${storyLines}」`
                    ) : (
                      // poemLines 是数组 · 每行分开显示
                      actualLines.map((line, li) => (
                        <div key={li}>{line}</div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 后续命运 */}
        {story?.aftermath && (
          <div style={{
            fontSize: 12, color: 'var(--ink-2)',
            fontFamily: 'var(--font-serif)',
            lineHeight: 2.0, letterSpacing: '0.05em',
            padding: '12px 14px',
            background: `color-mix(in oklch, ${color} 5%, var(--bg-elev))`,
            borderRadius: 'var(--radius-sm)',
            marginBottom: 10
          }}>
            <div className="mono" style={{
              fontSize: 9, color: color,
              letterSpacing: '0.3em', fontWeight: 700, marginBottom: 6
            }}>
              此 后 ——
            </div>
            {story.aftermath}
          </div>
        )}

        {/* 文学史定位 */}
        {story?.impact && (
          <div style={{
            textAlign: 'center',
            padding: '10px 12px',
            fontSize: 12,
            color: color,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.15em',
            fontStyle: 'italic',
            fontWeight: 600,
            borderTop: `1px dashed ${color}`,
            marginTop: 6
          }}>
            {story.impact.split('**').map((s, i) =>
              i % 2 === 0 ? s : <b key={i} style={{ color: 'var(--ink)', fontStyle: 'normal' }}>{s}</b>
            )}
          </div>
        )}

        {/* 宽松相遇 · 保留原简短描述 */}
        {!isPrecise && (
          <div style={{
            fontSize: 12, color: 'var(--ink-2)',
            fontFamily: 'var(--font-serif)',
            lineHeight: 1.9, letterSpacing: '0.05em',
            padding: '10px 14px',
            background: `color-mix(in oklch, ${color} 6%, var(--bg-elev))`,
            borderRadius: 'var(--radius-sm)',
            fontStyle: 'italic'
          }}>
            这一时期 · 两条生命线曾在这一带交错而过。
          </div>
        )}
      </div>
    </div>
  );
}


function IntroCard({ mode }) {
  return (
    <div style={{
      padding: '26px 26px',
      background: 'var(--bg-elev)',
      borderLeft: '3px solid var(--jin)',
      borderRadius: 'var(--radius-md)'
    }}>
      <div className="cn-caps" style={{ marginBottom: 10 }}>
        {mode === 'ensemble' ? '群 像 模 式' : '单 位 模 式'}
      </div>
      <div style={{
        fontSize: 13, color: 'var(--ink-2)',
        fontFamily: 'var(--font-serif)',
        lineHeight: 2.0, letterSpacing: '0.05em'
      }}>
        {mode === 'ensemble' ? (
          <>
            四位诗人 · 四种颜色的线 · 画在真实山河之上。<br/>
            <span style={{ color: '#c23820' }}>红圈</span>是他们真实的相遇<br/>
            <span style={{ color: '#c89a4a' }}>黄圈</span>是同时代的擦肩<br/>
            <br/>
            点任何一朵花 → 读那一年那一地的诗。
          </>
        ) : (
          <>
            选一位诗人 · 看他的一生如何在这片土地上漂泊。<br/>
            花朵的品种 = 他在那里实际写过的花。<br/>
            线条的流动 = 年代的先后。<br/>
            <br/>
            点任何一朵花 → 读那一刻的心事。
          </>
        )}
      </div>
    </div>
  );
}


/* ═══ PoetAddButton · 追加诗人下拉 · 按朝代分组 ═══ */
function PoetAddButton({ currentIds, onAdd }) {
  const [open, setOpen] = React.useState(false);
  const available = POETS.filter(p => !currentIds.includes(p.id));
  if (available.length === 0) return null;
  const grouped = {};
  Object.entries(POETS_BY_DYNASTY).forEach(([d, list]) => {
    const remain = list.filter(p => !currentIds.includes(p.id));
    if (remain.length) grouped[d] = remain;
  });
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{
          background: 'var(--bg-elev)',
          border: '1px dashed var(--line)',
          borderRadius: 'var(--radius-sm)',
          padding: '3px 10px',
          cursor: 'pointer',
          fontSize: 10,
          color: 'var(--ink-3)',
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.15em'
        }}>
        + 加诗人（{available.length}）
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0,
          marginTop: 4,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          padding: 10,
          zIndex: 10,
          minWidth: 260, maxWidth: 320,
          maxHeight: 420,
          overflow: 'auto'
        }}>
          {Object.entries(grouped).map(([dynasty, list]) => (
            <div key={dynasty} style={{ marginBottom: 10 }}>
              <div className="cn-caps" style={{
                fontSize: 9, color: 'var(--ink-3)',
                letterSpacing: '0.3em', marginBottom: 5
              }}>{dynasty}</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 3
              }}>
                {list.map(p => (
                  <button key={p.id}
                    onClick={() => { onAdd(p.id); setOpen(false); }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${p.color}`,
                      borderLeft: `3px solid ${p.color}`,
                      padding: '4px 7px',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--ink-2)',
                      letterSpacing: '0.08em',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
