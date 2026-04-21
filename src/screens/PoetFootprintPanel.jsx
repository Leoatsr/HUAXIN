import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { InkMap, buildProjection } from '../components/InkMap.jsx';
import { MapCanvas } from '../components/MapCanvas.jsx';
import { PoetTrailOverlay } from '../components/PoetTrailOverlay.jsx';
import { POETS, CERTAINTY_LABELS, TODAY_STATUS_LABELS } from '../data/poet-footprint.js';

/* ═══════════════════════════════════════════════════════════════
   PoetFootprintPanel · 诗踪
   ───────────────────────────────────────────────────────────────
   "跟着诗人的足迹 · 览物之情 · 跨越千年心境共鸣"
   
   双标注：花名 + 贬谪/游历背景
   独立屏 · 不污染主地图
   
   用户路径：
     [切换诗人] → 看编年时间轴 → 点某一站 →
     左屏是诗 · 右屏是背景 + 今日对应景点
   ═══════════════════════════════════════════════════════════════ */

export function PoetFootprintPanel({ flora, onBack, onSelectSpot, onGoNetwork }) {
  const [activePoetId, setActivePoetId] = useState(POETS[0].id);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mapCenter, setMapCenter] = useState([104.5, 35]);
  const [mapZoom, setMapZoom] = useState(1);

  const activePoet = POETS.find(p => p.id === activePoetId);
  const current = activePoet?.footprints[selectedIndex] || null;

  // 把当前诗人的足迹转成 InkMap 喂得下的 spot 数组
  const mapSpots = useMemo(() => {
    if (!activePoet) return [];
    return activePoet.footprints
      .map((f, i) => {
        if (f.lat == null || f.lon == null) return null;
        return {
          id: `${activePoet.id}-${i}`,
          _idx: i,   // 用于 onSelect 反查
          n: `${f.year} · ${f.place.split(' ')[0]}`,
          lat: f.lat,
          lon: f.lon,
          sp: activePoet.name,
          rg: f.todayPlace,
          // 假 _st · 让当前选中的站显示为"盛花"
          _st: { l: i === selectedIndex ? 5 : 2 }
        };
      })
      .filter(Boolean);
  }, [activePoetId, selectedIndex]);

  // 足迹连线的路径（年代顺序）
  const footprintPath = useMemo(() => {
    if (mapSpots.length < 2) return null;
    return mapSpots;
  }, [mapSpots]);

  // 自动地图中心 · 取所有站点均值（切诗人时用于重置 mapCenter）
  const autoCenter = useMemo(() => {
    if (!mapSpots.length) return [104.5, 35];
    const lat = mapSpots.reduce((s, p) => s + p.lat, 0) / mapSpots.length;
    const lon = mapSpots.reduce((s, p) => s + p.lon, 0) / mapSpots.length;
    return [lon, lat];
  }, [mapSpots]);

  // 切诗人时 · 自动居中到该诗人均值 · 重置 zoom
  useEffect(() => {
    setMapCenter(autoCenter);
    setMapZoom(1);
  }, [activePoetId, autoCenter]);

  const selectedMapId = current ? `${activePoet.id}-${selectedIndex}` : null;

  const switchPoet = (id) => {
    setActivePoetId(id);
    setSelectedIndex(0);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 46px)',
      background: 'var(--bg)'
    }}>
      <ScreenHeader
        eyebrow="诗踪 · 千年前的人 · 千年后的我们"
        title="诗 · 踪"
        sub={<>跟着诗人足迹 · 览物之情 · 跨越时间之隔</>}
        onBack={onBack}
        right={onGoNetwork ? (
          <button onClick={onGoNetwork}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, var(--zhusha), var(--jin))',
              color: 'var(--paper)',
              border: 'none',
              letterSpacing: '0.2em',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700
            }}>
            ✦ 看他们之间的关系
          </button>
        ) : null}
      />

      {/* ─── 诗人切换 ─── */}
      <div style={{
        padding: '0 clamp(24px, 5vw, 48px) 20px'
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {POETS.map(p => {
            const active = p.id === activePoetId;
            return (
              <button key={p.id}
                onClick={() => switchPoet(p.id)}
                style={{
                  padding: '14px 22px',
                  background: active
                    ? `linear-gradient(135deg, ${p.color}, color-mix(in oklch, ${p.color} 70%, transparent))`
                    : 'var(--bg-elev)',
                  color: active ? 'var(--paper)' : 'var(--ink-2)',
                  border: `1px solid ${active ? p.color : 'var(--line)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-serif)',
                  transition: 'var(--t-card)',
                  textAlign: 'left',
                  minWidth: 160
                }}>
                <div style={{
                  fontSize: 20,
                  letterSpacing: '0.2em',
                  fontWeight: 700,
                  lineHeight: 1.2
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontSize: 10, marginTop: 4,
                  letterSpacing: '0.15em',
                  opacity: 0.85,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {p.dynasty} · {p.lifespan}
                </div>
                <div style={{
                  fontSize: 11, marginTop: 6,
                  letterSpacing: '0.05em',
                  opacity: 0.9,
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  {p.summary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 诗人生平简介 ─── */}
      {activePoet && (
        <div style={{
          margin: '0 clamp(24px, 5vw, 48px) 24px',
          padding: '20px 24px',
          background: `color-mix(in oklch, ${activePoet.color} 5%, var(--bg-elev))`,
          border: '1px solid var(--line)',
          borderLeft: `3px solid ${activePoet.color}`,
          borderRadius: 'var(--radius-md)'
        }}>
          <div className="serif" style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            lineHeight: 2.0,
            letterSpacing: '0.06em'
          }}>
            {activePoet.bio}
          </div>
          <div className="serif" style={{
            fontSize: 13,
            color: activePoet.color,
            marginTop: 12,
            letterSpacing: '0.15em',
            fontStyle: 'italic',
            fontWeight: 600
          }}>
            {activePoet.epitaph}
          </div>
        </div>
      )}

      {/* ─── 主区：三栏 · 左时间轴 / 中地图 / 右详情 ─── */}
      <div style={{
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 320px) minmax(400px, 1fr) minmax(340px, 400px)',
        gap: 20
      }} className="poet-layout">

        {/* 左侧 · 编年时间轴 */}
        <aside>
          <div className="cn-caps" style={{ marginBottom: 14 }}>编 年 足 迹</div>
          <div style={{
            position: 'relative',
            paddingLeft: 20
          }}>
            {/* 时间线竖线 */}
            <div style={{
              position: 'absolute',
              left: 6, top: 8, bottom: 8,
              width: 2,
              background: `color-mix(in oklch, ${activePoet?.color || 'var(--ink-3)'} 30%, var(--line))`
            }}/>

            {activePoet?.footprints.map((f, i) => {
              const active = i === selectedIndex;
              return (
                <button key={i}
                  onClick={() => setSelectedIndex(i)}
                  style={{
                    position: 'relative',
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    marginBottom: 4,
                    marginLeft: 0,
                    background: active
                      ? `color-mix(in oklch, ${activePoet.color} 10%, var(--bg-elev))`
                      : 'transparent',
                    border: active
                      ? `1px solid ${activePoet.color}`
                      : '1px solid transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'var(--t-card)',
                    fontFamily: 'var(--font-serif)'
                  }}>
                  {/* 圆点 */}
                  <div style={{
                    position: 'absolute',
                    left: -20,
                    top: 16,
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: active ? activePoet.color : 'var(--bg-elev)',
                    border: `2px solid ${activePoet.color}`,
                    transition: 'var(--t-card)',
                    boxShadow: active ? `0 0 0 3px color-mix(in oklch, ${activePoet.color} 20%, transparent)` : 'none'
                  }}/>

                  {/* 年份 + 年龄 */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: active ? activePoet.color : 'var(--ink)',
                      letterSpacing: '0.05em'
                    }}>
                      {f.year}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: 'var(--ink-3)',
                      letterSpacing: '0.15em'
                    }}>
                      {f.age} 岁
                    </span>
                  </div>

                  {/* 地点 */}
                  <div style={{
                    fontSize: 13,
                    color: 'var(--ink-2)',
                    marginTop: 3,
                    letterSpacing: '0.1em'
                  }}>
                    {f.place}
                  </div>

                  {/* 诗名 */}
                  <div style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    marginTop: 4,
                    fontStyle: 'italic',
                    letterSpacing: '0.05em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    《{f.poemTitle}》
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 中间 · 诗人足迹地图 · 真实中国底图 + 花朵站点 */}
        <section style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          minHeight: 500
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            justifyContent: 'space-between'
          }}>
            <span className="cn-caps">{activePoet?.name} · 足迹地图</span>
            <span className="mono" style={{
              fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em'
            }}>
              共 {activePoet?.footprints.length || 0} 站
            </span>
          </div>
          <MapCanvas
            spots={[]}
            showRegionLabels={true}
            center={mapCenter}
            zoom={mapZoom}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
            minHeight={460}
          >
            <PoetTrailOverlay
              poetIds={activePoet ? [activePoet.id] : []}
              selectedScene={activePoet ? { poetId: activePoet.id, stopIdx: selectedIndex } : null}
              onSelectScene={(_, stopIdx) => setSelectedIndex(stopIdx)}
              center={mapCenter}
              zoom={mapZoom}
              showEncounters={false}
            />
          </MapCanvas>
          {/* 地图图例 */}
          <div style={{
            display: 'flex', gap: 14, alignItems: 'center',
            fontSize: 10, color: 'var(--ink-3)',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.15em',
            padding: '0 4px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: activePoet?.color || 'var(--zhusha)'
              }}/>
              当前一站
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 8, height: 2,
                background: activePoet?.color || 'var(--zhusha)',
                opacity: 0.4
              }}/>
              漂泊路线（按年代）
            </span>
          </div>
        </section>

        {/* 右侧 · 当前一站详情 */}
        {current && (
          <main style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* 诗 */}
            <section style={{
              padding: '30px 32px',
              background: 'var(--paper)',
              border: `1px solid color-mix(in oklch, ${activePoet.color} 15%, var(--line))`,
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* 印章 */}
              <div style={{
                position: 'absolute',
                top: 24, right: 24
              }}>
                <Seal size="sm" rotate={-5}>{current.flower.split(' · ')[0]}</Seal>
              </div>

              {/* 年 · 地 */}
              <div className="mono" style={{
                fontSize: 11,
                color: activePoet.color,
                letterSpacing: '0.25em',
                fontWeight: 700
              }}>
                {current.year} 年 · {activePoet.name} {current.age} 岁 · {current.place}
              </div>

              {/* 诗名 */}
              <h2 className="serif" style={{
                fontSize: 28,
                color: 'var(--ink)',
                margin: '8px 0 4px',
                letterSpacing: '0.15em',
                fontWeight: 700
              }}>
                《{current.poemTitle}》
              </h2>

              {/* 季节 */}
              <div className="serif" style={{
                fontSize: 12,
                color: 'var(--ink-3)',
                letterSpacing: '0.2em',
                marginBottom: 18
              }}>
                {current.season} · {current.flower}
              </div>

              {/* 诗正文 */}
              <div className="serif" style={{
                fontSize: 17,
                color: 'var(--ink)',
                lineHeight: 2.4,
                letterSpacing: '0.12em',
                fontStyle: 'italic',
                padding: '16px 0',
                borderTop: '1px solid var(--line-2)',
                borderBottom: '1px solid var(--line-2)'
              }}>
                {current.poemLines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>

              {/* 考证度标识 */}
              <div style={{
                display: 'flex', gap: 8, marginTop: 14,
                flexWrap: 'wrap'
              }}>
                <CertaintyTag certainty={current.certainty}/>
                <TodayStatusTag status={current.todayStatus}/>
              </div>
            </section>

            {/* 贬谪/游历背景 */}
            <section style={{
              padding: '22px 26px',
              background: `color-mix(in oklch, ${activePoet.color} 6%, var(--bg-elev))`,
              borderLeft: `2px solid ${activePoet.color}`,
              borderRadius: 'var(--radius-md)'
            }}>
              <div className="cn-caps" style={{
                color: activePoet.color,
                marginBottom: 10
              }}>
                此时此地 · 他为何在这里
              </div>
              <div className="serif" style={{
                fontSize: 14,
                color: 'var(--ink-2)',
                lineHeight: 2.0,
                letterSpacing: '0.05em'
              }}>
                {current.background}
              </div>
            </section>

            {/* 今日对应 */}
            <section style={{
              padding: '22px 26px',
              background: 'var(--bg-elev)',
              border: '1px dashed var(--jin)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div className="cn-caps" style={{
                color: 'var(--jin)',
                marginBottom: 10
              }}>
                千年之后 · 你今日可去
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                flexWrap: 'wrap'
              }}>
                <div className="serif" style={{
                  fontSize: 20,
                  color: 'var(--ink)',
                  letterSpacing: '0.15em',
                  fontWeight: 600
                }}>
                  {current.todayLabel}
                </div>
                <div className="mono" style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.15em'
                }}>
                  {current.todayPlace}
                </div>
              </div>

              {/* 若关联 FLORA id · 给跳转按钮 */}
              {current.todayId && onSelectSpot && (
                <button
                  onClick={() => onSelectSpot(current.todayId)}
                  className="btn sm"
                  title="跳转到花事地图打开此景点"
                  style={{
                    marginTop: 14,
                    background: 'var(--jin)',
                    color: 'var(--paper)',
                    border: 'none',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.2em',
                    fontWeight: 600
                  }}>
                  🗺 去花事地图
                </button>
              )}

              {/* 在诗踪地图上定位这朵花 · 本地高亮 · 不跳转 */}
              <button
                onClick={() => {
                  const mapEl = document.querySelector('.poet-layout > section:nth-child(2)');
                  if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="btn sm ghost"
                title="本页定位 · 不跳转"
                style={{
                  marginTop: 10, marginLeft: current.todayId ? 8 : 0,
                  border: `1px solid ${activePoet.color}`,
                  color: activePoet.color,
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.2em',
                  fontWeight: 600,
                  background: 'transparent'
                }}>
                ✿ 诗踪地图上定位
              </button>

              {!current.todayId && current.todayStatus !== 'lost' && (
                <div style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em'
                }}>
                  花信风尚未收录此景 · 但你可自行前往 ·{' '}
                  搜索地图：<span style={{ color: 'var(--ink-2)' }}>{current.todayLabel}</span>
                </div>
              )}
            </section>

            {/* 底部导航 */}
            <div style={{
              display: 'flex', gap: 8, marginTop: 12
            }}>
              <button className="btn"
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                style={{ flex: 1, justifyContent: 'center' }}>
                <Icon.chev d="left"/> 上一站
              </button>
              <button className="btn"
                onClick={() => setSelectedIndex(Math.min(activePoet.footprints.length - 1, selectedIndex + 1))}
                disabled={selectedIndex === activePoet.footprints.length - 1}
                style={{ flex: 1, justifyContent: 'center' }}>
                下一站 <Icon.chev/>
              </button>
            </div>
          </main>
        )}
      </div>

      {/* ─── 尾部诚实 ─── */}
      <div style={{
        margin: '0 clamp(24px, 5vw, 48px) 48px',
        padding: '20px 24px',
        background: 'var(--bg-sunk)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 11,
          color: 'var(--ink-3)',
          lineHeight: 2.0,
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.1em'
        }}>
          目前收录 <b style={{ color: 'var(--ink-2)' }}>杜甫 · 李白 · 白居易 · 苏轼</b> 共 28 站。<br/>
          所有诗 · 创作年 · 创作地 · 均依学界考证（仇兆鳌、詹锳、朱金城、孔凡礼诸家年谱）· 不编不猜。<br/>
          后续将加入王维、陆游、李清照、刘禹锡、元稹 ··· 慢慢走 · 慢慢来。
        </div>
      </div>

      {/* 响应式 · 分档堆叠 */}
      <style>{`
        /* 中屏：地图搬到底 · 左右 2 列分到上方 */
        @media (max-width: 1180px) {
          .poet-layout {
            grid-template-columns: minmax(260px, 320px) 1fr !important;
          }
          .poet-layout > section:nth-child(2) {
            grid-column: 1 / -1 !important;
            min-height: 420px !important;
          }
        }
        /* 小屏：全单列 */
        @media (max-width: 760px) {
          .poet-layout {
            grid-template-columns: 1fr !important;
          }
          .poet-layout > section:nth-child(2) {
            min-height: 340px !important;
          }
        }
      `}</style>
    </div>
  );
}


/* ═══ 考证度标签 ═══ */
function CertaintyTag({ certainty }) {
  const info = CERTAINTY_LABELS[certainty] || CERTAINTY_LABELS.accepted;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      background: `color-mix(in oklch, ${info.color} 10%, var(--bg-elev))`,
      color: info.color,
      border: `1px solid ${info.color}`,
      borderRadius: 100,
      fontSize: 10,
      fontFamily: 'var(--font-serif)',
      letterSpacing: '0.15em'
    }}>
      <span style={{ fontWeight: 700 }}>{info.mark}</span>
      创作地 · {info.label}
    </span>
  );
}

function TodayStatusTag({ status }) {
  const info = TODAY_STATUS_LABELS[status] || TODAY_STATUS_LABELS.active;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      background: `color-mix(in oklch, ${info.color} 10%, var(--bg-elev))`,
      color: info.color,
      border: `1px solid ${info.color}`,
      borderRadius: 100,
      fontSize: 10,
      fontFamily: 'var(--font-serif)',
      letterSpacing: '0.15em'
    }}>
      <span style={{ fontWeight: 700 }}>{info.mark}</span>
      今日 · {info.label}
    </span>
  );
}


/* ═══════════════════════════════════════════════════════════════
   PoetFootprintOverlay · 足迹连线 SVG 覆盖层
   叠在 InkMap 上方 · 用相同的投影坐标系（手工复制）· 画按年代的虚线路径
   ═══════════════════════════════════════════════════════════════ */

function PoetFootprintOverlay({ spots, selectedIndex, poetColor = 'var(--zhusha)' }) {
  // 必须和 InkMap 内部投影保持一致
  const center = useMemo(() => {
    if (!spots.length) return [104.5, 35];
    const lat = spots.reduce((s, p) => s + p.lat, 0) / spots.length;
    const lon = spots.reduce((s, p) => s + p.lon, 0) / spots.length;
    return [lon, lat];
  }, [spots]);

  const proj = useMemo(
    () => buildProjection(center, 680, [410, 300]),
    [center]
  );

  const points = useMemo(() => spots.map(s => {
    const p = proj([s.lon, s.lat]);
    return p ? { x: p[0], y: p[1], idx: s._idx } : null;
  }).filter(Boolean), [spots, proj]);

  if (points.length < 2) return null;

  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ' ' + p.y).join(' ');

  return (
    <svg
      viewBox="0 0 820 600"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 3
      }}>
      {/* 连线 */}
      <path d={pathD}
        fill="none"
        stroke={poetColor}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        opacity="0.45"
        strokeLinecap="round"/>
      {/* 年代序号圈（叠在 InkMap 点上）*/}
      {points.map((p, i) => {
        const active = i === selectedIndex;
        return (
          <g key={i}>
            {active && (
              <circle cx={p.x} cy={p.y} r="14"
                fill={poetColor} opacity="0.14">
                <animate attributeName="r" from="10" to="18" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.25" to="0" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            )}
            <circle cx={p.x} cy={p.y} r="9"
              fill={active ? poetColor : 'var(--paper)'}
              stroke={poetColor}
              strokeWidth="1.5"
              opacity={active ? 1 : 0.7}/>
            <text x={p.x} y={p.y + 3}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fontWeight="700"
              fill={active ? 'var(--paper)' : poetColor}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
