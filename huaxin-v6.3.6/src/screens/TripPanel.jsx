import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { TripShareCard } from '../components/ShareCards.jsx';
import { InkMap } from '../components/InkMap.jsx';
import {
  optimizeTripOrder, calcLegs, totalDistance,
  findBloomWindow, daysToDateStr, exportTripToText
} from '../utils/trip.js';
import { wgs84ToGcj02, wgs84ToBd09 } from '../utils/coords.js';
import { isMobile, isIOS, isAndroid } from '../utils/map-urls.js';
import { read } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   行程规划 · 让加入行程的景点真正能被规划
   - 左：已加景点列表 + 上下移 + 删除 + 距下站距离
   - 右：地图连线可视化
   - 顶：总览卡（距离/站数/花期建议出发日）
   - 底：重排/清空/导出操作
   ═══════════════════════════════════════════════════════════════ */
export function TripPanel({
  flora, trip, setTrip,
  onBack, onSelectSpot, onClearAll
}) {
  const [showExport, setShowExport] = useState(false);
  const [showTripCard, setShowTripCard] = useState(false);

  // 根据 trip 数组（存的是景点 id）还原景点对象
  const tripSpots = useMemo(() => {
    return trip
      .map(id => flora.find(f => f.id === id))
      .filter(Boolean);
  }, [trip, flora]);

  // 计算每段距离
  const legs = useMemo(() => calcLegs(tripSpots), [tripSpots]);
  const total = totalDistance(legs);

  // 花期窗口
  const window = useMemo(() => findBloomWindow(tripSpots), [tripSpots]);

  // ═══ 操作 ═══
  const moveUp = (idx) => {
    if (idx === 0) return;
    const newTrip = [...trip];
    [newTrip[idx - 1], newTrip[idx]] = [newTrip[idx], newTrip[idx - 1]];
    setTrip(newTrip);
  };
  const moveDown = (idx) => {
    if (idx === trip.length - 1) return;
    const newTrip = [...trip];
    [newTrip[idx + 1], newTrip[idx]] = [newTrip[idx], newTrip[idx + 1]];
    setTrip(newTrip);
  };
  const removeAt = (idx) => {
    setTrip(trip.filter((_, i) => i !== idx));
  };
  const optimize = () => {
    const optimized = optimizeTripOrder(tripSpots);
    setTrip(optimized.map(s => s.id));
  };
  const exportText = () => {
    const text = exportTripToText(tripSpots, legs);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setShowExport(true);
    setTimeout(() => setShowExport(false), 2200);
  };

  /* ═══ 多景点一键导航 · 按用户地图偏好 ═══ */
  const openMultiSpotNav = (spots) => {
    if (spots.length < 2) return;
    const mapProvider = read('mapProvider') || 'amap';
    const navMode = read('navMode') || 'car';

    // 高德支持多点：from + to + via
    // 百度只支持 from→to + 途经点
    // 其他地图不支持多点，只跳最后一站

    const mobile = isMobile();

    if (mapProvider === 'amap') {
      // 高德 Web URI 只支持 from + to + 1 个 via
      // 超过 3 站时，只能分段 · 取最经济方案：from = 第 1 站 · to = 最后一站 · via = 中间某一站
      const first = spots[0];
      const last = spots[spots.length - 1];
      const [fLon, fLat] = wgs84ToGcj02(first.lon, first.lat);
      const [tLon, tLat] = wgs84ToGcj02(last.lon, last.lat);
      const fName = encodeURIComponent(first.n);
      const tName = encodeURIComponent(last.n);
      let url = `https://uri.amap.com/navigation?from=${fLon},${fLat},${fName}&to=${tLon},${tLat},${tName}&mode=${navMode}&policy=1&src=huaxinfeng&coordinate=gaode&callnative=1`;
      if (spots.length >= 3) {
        const via = spots[Math.floor(spots.length / 2)];
        const [vLon, vLat] = wgs84ToGcj02(via.lon, via.lat);
        const vName = encodeURIComponent(via.n);
        url += `&via=${vLon},${vLat},${vName}`;
      }

      if (mobile) {
        // App scheme · 多景点在 App 里效果最好
        if (isIOS()) {
          const [fLonG, fLatG] = wgs84ToGcj02(first.lon, first.lat);
          const [tLonG, tLatG] = wgs84ToGcj02(last.lon, last.lat);
          const appUrl = `iosamap://path?sourceApplication=huaxinfeng&sid=BGVIS1&slat=${fLatG}&slon=${fLonG}&sname=${fName}&did=BGVIS2&dlat=${tLatG}&dlon=${tLonG}&dname=${tName}&dev=0&t=${navMode === 'walk' ? 2 : 0}`;
          const fallback = setTimeout(() => { window.location.href = url; }, 2000);
          document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(fallback); }, { once: true });
          window.location.href = appUrl;
          return;
        }
        if (isAndroid()) {
          const appUrl = `androidamap://route?sourceApplication=huaxinfeng&slat=${fLat}&slon=${fLon}&sname=${fName}&dlat=${tLat}&dlon=${tLon}&dname=${tName}&dev=0&t=${navMode === 'walk' ? 2 : 0}`;
          const fallback = setTimeout(() => { window.location.href = url; }, 2000);
          document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(fallback); }, { once: true });
          window.location.href = appUrl;
          return;
        }
      }

      window.open(url, '_blank');
      if (spots.length > 3) {
        alert(`行程共 ${spots.length} 站 · 已为你生成前后 2 站 + 中间 1 站的路线\n余下景点请在高德里手动调整`);
      }
      return;
    }

    if (mapProvider === 'baidu') {
      const first = spots[0];
      const last = spots[spots.length - 1];
      const [fLon, fLat] = wgs84ToBd09(first.lon, first.lat);
      const [tLon, tLat] = wgs84ToBd09(last.lon, last.lat);
      const bMode = navMode === 'car' ? 'driving' : navMode === 'walk' ? 'walking' : 'transit';
      let url = `https://api.map.baidu.com/direction?origin=latlng:${fLat},${fLon}|name:${encodeURIComponent(first.n)}&destination=latlng:${tLat},${tLon}|name:${encodeURIComponent(last.n)}&mode=${bMode}&output=html&src=huaxinfeng`;
      window.open(url, '_blank');
      if (spots.length > 2) {
        alert(`百度地图只支持起终两点 · 为你生成${first.n} → ${last.n}\n中间景点请在百度里手动添加`);
      }
      return;
    }

    // 其他地图只能跳单点（最后一站）
    const last = spots[spots.length - 1];
    alert(`${mapProvider === 'google' ? 'Google' : '腾讯'}地图不支持多点一键 · 将为你打开最后一站「${last.n}」的导航`);
    const [gLon, gLat] = wgs84ToGcj02(last.lon, last.lat);
    if (mapProvider === 'google') {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${last.lat},${last.lon}`, '_blank');
    } else {
      window.open(`https://apis.map.qq.com/uri/v1/routeplan?type=drive&tocoord=${gLat},${gLon}&to=${encodeURIComponent(last.n)}&referer=huaxinfeng`, '_blank');
    }
  };

  // ═══ 空状态 ═══
  if (tripSpots.length === 0) {
    return (
      <EmptyState
        variant="full"
        symbol="🌸"
        title="行 囊 尚 空"
        sub={<>到花事地图选一些想访的景点<br/>点右侧的书签按钮加入行程</>}
        action={onBack ? { label: '去挑花事', onClick: onBack, icon: <Icon.chev d="left"/> } : null}
      />
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="行前筹谋 · 按花而行"
        title="花 事 行 程"
        sub={<>{tripSpots.length} 站 · {total.toFixed(0)} 公里</>}
        onBack={onBack}
        backLabel="返回地图"
      />

      {/* ─── 总览卡 + 花期建议 ─── */}
      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 20px' }}>
        <div className="card paper-bg" style={{
          padding: 'clamp(20px, 3vw, 28px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 20,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <Seal size="sm" rotate={-4}>花事<br/>有程</Seal>
          </div>

          {/* 站数 */}
          <div>
            <div className="cn-caps">站 数</div>
            <div className="serif" style={{ fontSize: 36, marginTop: 4, color: 'var(--zhusha)', lineHeight: 1 }}>
              {tripSpots.length}
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
              处花事
            </div>
          </div>

          {/* 总距 */}
          <div>
            <div className="cn-caps">里 程</div>
            <div className="serif" style={{ fontSize: 36, marginTop: 4, color: 'var(--qing)', lineHeight: 1 }}>
              {total < 1000 ? total.toFixed(0) : (total / 1000).toFixed(1)}
              <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 4 }}>
                {total < 1000 ? 'km' : '千 km'}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
              直线距离
            </div>
          </div>

          {/* 花期建议 */}
          <div>
            <div className="cn-caps">花 期 建 议</div>
            {window && !window.impossible && !window.partial && (
              <>
                <div className="serif" style={{ fontSize: 18, marginTop: 4, color: 'var(--jin)', lineHeight: 1.3 }}>
                  {window.start <= 0 && window.end >= 0
                    ? '此刻正好'
                    : `${daysToDateStr(window.start)} ~ ${daysToDateStr(window.end)}`}
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                  所有景点花期重叠
                </div>
              </>
            )}
            {window && window.impossible && (
              <>
                <div className="serif" style={{ fontSize: 14, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                  花期错开
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                  建议分批出行
                </div>
              </>
            )}
            {window && window.partial && (
              <>
                <div className="serif" style={{ fontSize: 14, marginTop: 4, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                  部分景点花期未定
                </div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                  按历史数据推算
                </div>
              </>
            )}
            {!window && (
              <div className="serif" style={{ fontSize: 14, marginTop: 4, color: 'var(--ink-3)' }}>
                —
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={optimize} disabled={tripSpots.length < 3}>
            <Icon.sparkle/> 优化顺序
          </button>
          <button className="btn" onClick={() => openMultiSpotNav(tripSpots)}
            disabled={tripSpots.length < 2}
            style={{
              background: 'color-mix(in oklch, #1677ff 12%, var(--bg-elev))',
              color: '#1677ff',
              border: '1px solid #1677ff'
            }}>
            🗺 一 键 全 程 导 航
          </button>
          <button className="btn" onClick={exportText}>
            <Icon.share/> {showExport ? '已复制到剪贴板' : '导出文字备忘'}
          </button>
          <button className="btn zhusha" onClick={() => setShowTripCard(true)}
            disabled={tripSpots.length < 2}>
            🌸 生成行程卡
          </button>
          <div style={{ flex: 1 }}/>
          <button className="btn ghost" onClick={() => {
            if (confirm('清空所有行程？')) onClearAll && onClearAll();
          }} style={{ color: 'var(--ink-3)' }}>
            <Icon.close/> 清空
          </button>
        </div>
      </div>

      {/* ─── 双栏：列表 + 地图 ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 420px) 1fr',
        gap: 20,
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        alignItems: 'start'
      }}>
        {/* 行程列表 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--line-2)',
            background: 'var(--bg-sunk)'
          }}>
            <div className="cn-caps">行 程 单</div>
          </div>
          <div>
            {tripSpots.map((s, i) => (
              <div key={s.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px',
                  background: i === 0 ? 'color-mix(in oklch, var(--zhusha) 4%, var(--bg-elev))' : 'var(--bg-elev)',
                  borderBottom: '1px solid var(--line-2)'
                }}>
                  <div style={{
                    width: 28, height: 28,
                    display: 'grid', placeItems: 'center',
                    background: i === 0 ? 'var(--zhusha)' : 'var(--bg-sunk)',
                    color: i === 0 ? 'var(--paper)' : 'var(--ink-2)',
                    borderRadius: '50%',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13
                  }}>{i + 1}</div>

                  <button onClick={() => onSelectSpot && onSelectSpot(s.id)}
                    style={{
                      flex: 1, minWidth: 0, textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0
                    }}>
                    <div className="serif" style={{
                      fontSize: 14,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                      {s.sp}
                      {s._st && ` · ${s._st.st}`}
                      {s._pred && ` · ${s._pred.dateStr}`}
                    </div>
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      style={{
                        background: 'var(--bg)', border: '1px solid var(--line)',
                        borderRadius: 3, cursor: i === 0 ? 'not-allowed' : 'pointer',
                        padding: '2px 6px', opacity: i === 0 ? 0.3 : 1
                      }}>
                      <Icon.chev d="up"/>
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === tripSpots.length - 1}
                      style={{
                        background: 'var(--bg)', border: '1px solid var(--line)',
                        borderRadius: 3, cursor: i === tripSpots.length - 1 ? 'not-allowed' : 'pointer',
                        padding: '2px 6px', opacity: i === tripSpots.length - 1 ? 0.3 : 1
                      }}>
                      <Icon.chev d="down"/>
                    </button>
                  </div>

                  <button onClick={() => removeAt(i)} title="移除"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-3)', padding: 4
                    }}>
                    <Icon.close/>
                  </button>
                </div>

                {/* 距离说明 */}
                {i < tripSpots.length - 1 && (
                  <div style={{
                    padding: '6px 18px 6px 58px',
                    fontSize: 11, color: 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--bg)',
                    borderBottom: '1px dotted var(--line-2)',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span style={{
                      width: 1, height: 14,
                      background: 'var(--line)',
                      display: 'inline-block'
                    }}/>
                    ↓ {legs[i].toFixed(0)} km
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 地图连线 */}
        <div className="card" style={{ padding: 0, height: 620, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0
          }}>
            <TripMap spots={tripSpots} onSelect={(s) => onSelectSpot && onSelectSpot(s.id)}/>
          </div>
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'var(--bg-elev)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            fontSize: 11,
            color: 'var(--ink-2)',
            fontFamily: 'var(--font-mono)'
          }}>
            行 程 路 线 图
          </div>
        </div>
      </div>

      {/* 行程分享卡 */}
      {showTripCard && (
        <TripShareCard
          spots={tripSpots}
          totalKm={total}
          onClose={() => setShowTripCard(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 专门给 Trip 用的地图：复用 InkMap 但在其上画连线
// ═══════════════════════════════════════════════════════════════
function TripMap({ spots, onSelect }) {
  // 根据 spots 范围计算地图中心和缩放
  const bounds = useMemo(() => {
    if (spots.length === 0) return null;
    const lats = spots.map(s => s.lat);
    const lons = spots.map(s => s.lon);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lonSpread = Math.max(...lons) - Math.min(...lons);
    const spread = Math.max(latSpread, lonSpread);
    // spread 越大，zoom 越小
    const zoom = spread > 30 ? 0.8 : spread > 15 ? 1.3 : spread > 5 ? 2.5 : 4;
    return { center: [centerLon, centerLat], zoom };
  }, [spots]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <InkMap
        spots={spots}
        selectedId={null}
        onSelect={onSelect}
        center={bounds ? bounds.center : [104.5, 35]}
        zoom={bounds ? bounds.zoom : 1}
        showRegionLabels={false}
      />
      {/* 叠加一层 SVG 画连线（跟 InkMap 同 viewBox） */}
      <svg viewBox="0 0 820 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* 路径线（简化版 - 假设 InkMap 投影相同，需要重算 x/y） */}
        <TripPath spots={spots} bounds={bounds}/>
      </svg>
    </div>
  );
}

// 在 SVG 上画连接路径
// 这里需要做和 InkMap 内部一样的 projection
function TripPath({ spots, bounds }) {
  const proj = useMemo(() => {
    const center = bounds ? bounds.center : [104.5, 35];
    const zoom = bounds ? bounds.zoom : 1;
    return d3.geoMercator().center(center).scale(680 * zoom).translate([410, 300]);
  }, [bounds]);

  if (spots.length < 2) return null;
  const points = spots.map(s => proj([s.lon, s.lat])).filter(Boolean);
  if (points.length < 2) return null;

  // 画虚线连接
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  return (
    <g>
      <path d={path}
        fill="none"
        stroke="var(--zhusha)"
        strokeWidth="1.8"
        strokeDasharray="4,3"
        opacity="0.65"/>
      {/* 序号标记 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="10"
            fill="var(--paper)"
            stroke="var(--zhusha)" strokeWidth="1.5"/>
          <text x={p[0]} y={p[1] + 4}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-serif)"
            fill="var(--zhusha)"
            fontWeight="600">
            {i + 1}
          </text>
        </g>
      ))}
    </g>
  );
}
