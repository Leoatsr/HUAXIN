import React, { useState, useMemo, useEffect } from 'react';
import { Icon, PetalMark } from '../ui/atoms.jsx';
import { InkMap } from '../components/InkMap.jsx';
import { SpotDetail } from '../components/SpotDetail.jsx';
import { REGIONS } from '../data/constants.js';
import { filterSpots, getSeason } from '../utils/phenology.js';
import { parseSmartQuery, applySmartSearch, SEARCH_HINTS } from '../utils/smart-search.js';

/* 自定义 hook · 监听 window 宽度断点 */
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

/* ═══════════════════════════════════════════════════════════════
   主工作区：左侧筛选 | 中间地图 | 右侧景点详情
   ═══════════════════════════════════════════════════════════════ */
export function MapWorkspace({
  flora,
  selectedId, setSelectedId,
  favs, toggleFav,
  checkins, doCheckin,
  trip, toggleTrip,
  speciesFilter,           // 外部传入：按花种筛选（从百科跳过来）
  clearSpeciesFilter,
  onNavExtra,              // 跳转到 AI/Wiki/Poem 等扩展面板
  onShareSpot,             // 触发景点分享卡
  highlightSpotId          // 引导跳入后给 SpotDetail "为你挑的" 高亮
}) {
  const [filter, setFilter] = useState('current');
  const [regionId, setRegionId] = useState('all');
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);

  const season = getSeason();

  // ═══ 筛选 + 搜索管线 ═══
  const filteredSpots = useMemo(() => {
    // 1. filter
    let list = filterSpots(flora, filter, season, favs);

    // 2. 花种筛选（外部传入）
    if (speciesFilter) {
      list = list.filter(f => f.sp === speciesFilter);
    }

    // 3. region
    if (regionId !== 'all') {
      const zhName = REGIONS.find(r => r.id === regionId)?.n.replace(/\s/g, '') || '';
      if (zhName) list = list.filter(f => f.rg === zhName);
    }

    // 4. search · 智能解析
    if (search) {
      const parsed = parseSmartQuery(search);
      list = applySmartSearch(list, parsed);
    }

    return list;
  }, [flora, filter, regionId, search, season, favs, speciesFilter]);

  const selected = flora.find(f => f.id === selectedId);

  // 当前地图中心 + 缩放（根据 region）
  const [mapCenter, mapZoom] = useMemo(() => {
    const r = REGIONS.find(x => x.id === regionId) || REGIONS[0];
    return [[r.cx, r.cy], r.z * zoom];
  }, [regionId, zoom]);

  // 右侧景点列表（从 filteredSpots 中取 top 20 + 按积温状态排序）
  const listForSide = useMemo(() => {
    const sorted = [...filteredSpots].sort((a, b) => (b._st?.l || 0) - (a._st?.l || 0));
    return sorted.slice(0, 30);
  }, [filteredSpots]);

  // 顶部汇总
  const bloomingCount = filteredSpots.filter(f => f._st && f._st.l >= 3).length;
  const speciesTally = useMemo(() => {
    const m = {};
    filteredSpots.forEach(f => { m[f.sp] = (m[f.sp] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [filteredSpots]);

  // 响应式：窄屏改为堆叠 + 侧栏折叠 + 详情弹出
  const isMobile = useIsMobile(860);
  const [mobilePanel, setMobilePanel] = useState('map'); // 'filter' | 'map' | 'detail'

  // 选中景点时自动切到详情面板
  useEffect(() => {
    if (isMobile && selectedId) setMobilePanel('detail');
  }, [isMobile, selectedId]);

  return (
    <div style={{
      display: isMobile ? 'block' : 'grid',
      gridTemplateColumns: isMobile ? undefined : 'minmax(260px, 300px) minmax(480px, 1fr) minmax(340px, 400px)',
      height: isMobile ? undefined : 'calc(100vh - 46px)',
      minHeight: isMobile ? 'calc(100vh - 46px)' : undefined,
      minWidth: isMobile ? 0 : 1200,
      position: 'relative'
    }}>
      {/* 移动端 · 底部 tab 切换 */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 40,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'var(--bg-elev)',
          borderTop: '1px solid var(--line)',
          boxShadow: '0 -2px 10px rgba(0,0,0,.06)'
        }}>
          {[
            { key: 'filter', label: '筛选', icon: '⊟' },
            { key: 'map',    label: '地图', icon: '◉' },
            { key: 'detail', label: '详情', icon: '◈' }
          ].map(t => (
            <button key={t.key}
              onClick={() => setMobilePanel(t.key)}
              style={{
                padding: '10px 4px',
                background: 'transparent',
                border: 'none',
                borderTop: mobilePanel === t.key ? '2px solid var(--zhusha)' : '2px solid transparent',
                color: mobilePanel === t.key ? 'var(--zhusha)' : 'var(--ink-3)',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                letterSpacing: '0.15em',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}
      {/* ─── 左侧：筛选 + 附近 ─── */}
      <aside style={{
        background: 'var(--bg-elev)',
        borderRight: isMobile ? 'none' : '1px solid var(--line)',
        borderBottom: isMobile ? '1px solid var(--line)' : 'none',
        display: isMobile && mobilePanel !== 'filter' ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        height: isMobile ? 'calc(100vh - 46px - 50px)' : undefined,
        paddingBottom: isMobile ? 10 : 0
      }}>
        {/* 搜索 */}
        <div style={{ padding: '16px 24px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg)'
          }}>
            <Icon.search/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`试试 · ${SEARCH_HINTS[(new Date().getHours() + new Date().getDate()) % SEARCH_HINTS.length]}`}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)'
              }}/>
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 0 }}>
                <Icon.close/>
              </button>
            )}
          </div>
          {/* 智能搜索提示词 */}
          {!search && (
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap',
              marginTop: 8, paddingLeft: 2
            }}>
              {SEARCH_HINTS.slice(0, 3).map(h => (
                <button key={h}
                  onClick={() => setSearch(h)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--line-2)',
                    borderRadius: 100,
                    padding: '3px 10px',
                    fontSize: 10.5,
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--font-serif)',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    transition: 'var(--t-button)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--zhusha)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 筛选 */}
        <div style={{ padding: '8px 24px 16px' }}>
          {speciesFilter && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px',
              background: 'color-mix(in oklch, var(--zhusha) 10%, var(--bg))',
              border: '1px solid color-mix(in oklch, var(--zhusha) 30%, var(--bg))',
              borderRadius: 'var(--radius-md)',
              marginTop: 12
            }}>
              <Icon.flower/>
              <span className="serif" style={{ fontSize: 12, color: 'var(--zhusha)', flex: 1 }}>
                只看「{speciesFilter}」
              </span>
              {clearSpeciesFilter && (
                <button onClick={clearSpeciesFilter}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--zhusha)', padding: 0 }}>
                  <Icon.close/>
                </button>
              )}
            </div>
          )}
          <div className="cn-caps" style={{ margin: '12px 0 8px' }}>花期</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              ['current', '当季'],
              ['future1', '一月内'],
              ['future3', '三月内'],
              ['all', '全年']
            ].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className="btn sm"
                style={{
                  background: filter === k ? 'var(--ink)' : 'transparent',
                  color: filter === k ? 'var(--bg)' : 'var(--ink-2)',
                  borderColor: filter === k ? 'var(--ink)' : 'var(--line)'
                }}>{l}</button>
            ))}
            {Object.keys(favs).length > 0 && (
              <button onClick={() => setFilter('favs')} className="btn sm"
                style={{
                  background: filter === 'favs' ? 'var(--zhusha)' : 'transparent',
                  color: filter === 'favs' ? 'var(--paper)' : 'var(--zhusha)',
                  borderColor: 'var(--zhusha)'
                }}>♥ {Object.keys(favs).length}</button>
            )}
          </div>

          <div className="cn-caps" style={{ margin: '18px 0 8px' }}>区域</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setRegionId(r.id)} className="btn sm"
                style={{
                  background: regionId === r.id ? 'var(--zhusha)' : 'transparent',
                  color: regionId === r.id ? 'var(--paper)' : 'var(--ink-2)',
                  borderColor: regionId === r.id ? 'var(--zhusha)' : 'var(--line)',
                  fontFamily: 'var(--font-serif)', letterSpacing: '0.1em'
                }}>{r.n}</button>
            ))}
          </div>
        </div>

        {/* 附近列表 */}
        <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid var(--line-2)' }}>
          <div style={{ padding: '14px 24px 8px' }}>
            <div className="cn-caps">花事 · {filteredSpots.length} 处</div>
          </div>
          {listForSide.map((s, i) => (
            <button key={s.id} onClick={() => setSelectedId(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 24px',
                border: 'none',
                background: selectedId === s.id ? 'var(--bg-sunk)' : 'transparent',
                borderLeft: selectedId === s.id ? '3px solid var(--zhusha)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
              <PetalMark peak={s._st && s._st.l >= 4} active={selectedId === s.id}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {s.sp} · {s._st?.st || ''}
                </div>
              </div>
              {favs[s.id] && <span style={{ color: 'var(--zhusha)', fontSize: 11 }}>♥</span>}
              {checkins[s.id] && <span style={{ color: 'var(--jin)', fontSize: 11 }}>✓</span>}
            </button>
          ))}
          {listForSide.length === 0 && (
            <div style={{ padding: '24px 24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 12 }}>
              无匹配花事
            </div>
          )}
        </div>

        {/* 底部扩展入口 · 分 3 组 · 8 个核心按钮 */}
        {onNavExtra && (
          <div style={{ borderTop: '1px solid var(--line-2)', padding: '12px 24px' }}>
            {/* 工具组 */}
            <div style={{ marginBottom: 8 }}>
              <div className="mono" style={{
                fontSize: 9, color: 'var(--ink-3)',
                letterSpacing: '0.2em', marginBottom: 6
              }}>TOOLS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn sm ghost" onClick={() => onNavExtra('dashboard')} title="花事概览">概览</button>
                <button className="btn sm ghost" onClick={() => onNavExtra('trip')} title="行程规划">行程</button>
                <button className="btn sm ghost" onClick={() => onNavExtra('recommend')} title="为你推荐">推荐</button>
              </div>
            </div>
            {/* 探索组 */}
            <div style={{ marginBottom: 8 }}>
              <div className="mono" style={{
                fontSize: 9, color: 'var(--ink-3)',
                letterSpacing: '0.2em', marginBottom: 6
              }}>EXPLORE</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn sm ghost" onClick={() => onNavExtra('feed')} title="花事圈">花圈</button>
                <button className="btn sm ghost" onClick={() => onNavExtra('crowd')} title="花讯播报">播报</button>
                <button className="btn sm ghost" onClick={() => onNavExtra('ai')} title="AI 助手">AI</button>
              </div>
            </div>
            {/* 特殊组 */}
            <div>
              <div className="mono" style={{
                fontSize: 9, color: 'var(--jin)',
                letterSpacing: '0.2em', marginBottom: 6
              }}>SPECIAL</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn sm ghost" onClick={() => onNavExtra('reverence')} title="濒危保护植物"
                  style={{ color: 'var(--zhusha)', fontWeight: 600 }}>🌸 敬畏</button>
                <button className="btn sm ghost" onClick={() => onNavExtra('puzzle')} title="花卉拼图"
                  style={{ color: 'var(--qing)', fontWeight: 600 }}>🎨 拼图</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ─── 中间：地图 ─── */}
      <main style={{
        position: 'relative',
        background: 'var(--paper)',
        overflow: 'hidden',
        display: isMobile && mobilePanel !== 'map' ? 'none' : 'block',
        height: isMobile ? 'calc(100vh - 46px - 50px)' : undefined
      }}>
        {/* 顶部悬浮统计 */}
        <div style={{
          position: 'absolute', top: 20, left: 24, right: 24, zIndex: 5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'var(--bg-elev)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)', padding: '10px 16px',
            boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
            pointerEvents: 'auto'
          }}>
            <div className="cn-caps" style={{ marginBottom: 4 }}>
              花事 · {new Date().toLocaleDateString('zh-CN')}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span className="serif" style={{ fontSize: 16 }}>{bloomingCount} 处盛花</span>
              {speciesTally.map(([sp, n]) => (
                <span key={sp} className="pill zhusha">{sp} · {n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 地图 */}
        <InkMap
          spots={filteredSpots}
          selectedId={selectedId}
          onSelect={s => setSelectedId(s.id)}
          favs={favs}
          checkins={checkins}
          center={mapCenter}
          zoom={mapZoom}
        />

        {/* 缩放控件 */}
        <div style={{
          position: 'absolute', right: 20, bottom: 24,
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-elev)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button onClick={() => setZoom(z => Math.min(4, z * 1.3))}
            className="btn sm ghost" style={{ borderRadius: 0, border: 'none' }}><Icon.plus/></button>
          <div style={{ height: 1, background: 'var(--line-2)' }}/>
          <button onClick={() => setZoom(z => Math.max(0.5, z / 1.3))}
            className="btn sm ghost" style={{ borderRadius: 0, border: 'none' }}><Icon.minus/></button>
          <div style={{ height: 1, background: 'var(--line-2)' }}/>
          <button onClick={() => { setZoom(1); setRegionId('all'); }}
            className="btn sm ghost" style={{ borderRadius: 0, border: 'none', padding: 4 }} title="重置">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 3 L12 21 M3 12 L21 12"/>
            </svg>
          </button>
        </div>

        {/* 行程浮条（底部） · 点击进入规划 */}
        {trip.length > 0 && (
          <button
            onClick={() => onNavExtra && onNavExtra('trip')}
            style={{
              position: 'absolute', left: 20, bottom: 24, zIndex: 5,
              background: 'var(--bg-elev)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)', padding: '8px 14px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
            <Icon.bookmark/>
            <div style={{ textAlign: 'left' }}>
              <div className="cn-caps" style={{ fontSize: 10 }}>花事行程</div>
              <div className="serif" style={{ fontSize: 13, color: 'var(--ink)' }}>
                {trip.length} 站 · 点看规划
              </div>
            </div>
            <Icon.chev/>
          </button>
        )}
      </main>

      {/* ─── 右侧：景点详情 ─── */}
      <aside style={{
        background: 'var(--bg)',
        borderLeft: isMobile ? 'none' : '1px solid var(--line)',
        borderTop: isMobile ? '1px solid var(--line)' : 'none',
        display: isMobile && mobilePanel !== 'detail' ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: isMobile ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        height: isMobile ? 'calc(100vh - 46px - 50px)' : undefined,
        paddingBottom: isMobile ? 10 : 0
      }}>
        <SpotDetail
          spot={selected}
          highlighted={selected && highlightSpotId && selected.id === highlightSpotId}
          isFav={!!favs[selected?.id]}
          onFav={() => selected && toggleFav(selected.id)}
          isChecked={!!checkins[selected?.id]}
          onCheckin={doCheckin}
          inTrip={selected && trip.includes(selected.id)}
          onTripToggle={() => selected && toggleTrip(selected.id)}
          onShowWiki={onNavExtra ? () => onNavExtra('wiki', selected) : null}
          onShare={() => {
            if (!selected) return;
            if (onShareSpot) {
              onShareSpot(selected);
            } else {
              const url = window.location.origin + window.location.pathname + '#/spot/' + selected.id;
              if (navigator.clipboard) navigator.clipboard.writeText(url);
            }
          }}
        />
      </aside>
    </div>
  );
}
