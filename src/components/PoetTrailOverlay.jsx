import React, { useMemo, useState } from 'react';
import { POETS } from '../data/poet-footprint.js';
import { buildProjection } from './InkMap.jsx';
import { FlowerMarker, extractFlowerKey } from './FlowerMarker.jsx';

/* ═══════════════════════════════════════════════════════════════
   PoetTrailOverlay · 诗人足迹连线叠层
   ───────────────────────────────────────────────────────────────
   · 叠在 InkMap 上
   · 支持单人模式 · 群像模式
   · 每位诗人一条彩色连线 + 站点花朵
   · 相遇点高亮（精准红圈 · 宽松黄圈）
   ═══════════════════════════════════════════════════════════════ */

// 中国地理距离近似（经度 1° ≈ 111km · 纬度根据余弦调整）
function geoDist(a, b) {
  const dLat = (b[1] - a[1]) * 111;
  const dLon = (b[0] - a[0]) * 111 * Math.cos((a[1] + b[1]) / 2 * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * 检测相遇点
 * 精准：同一年 · ≤ 200km
 * 宽松：同一十年内 · ≤ 500km
 */
export function detectEncounters(poets) {
  const encounters = [];
  const allStops = [];

  // 扁平化所有站点
  poets.forEach(p => {
    p.footprints.forEach((f, idx) => {
      if (f.lat != null && f.lon != null) {
        allStops.push({
          poetId: p.id,
          poetName: p.name,
          poetColor: p.color,
          year: f.year,
          lat: f.lat,
          lon: f.lon,
          place: f.todayPlace,
          todayLabel: f.todayLabel,
          poemTitle: f.poemTitle,
          poemLines: f.poemLines,  // v6.3.4 · 传递诗句全文到相遇卡片
          idx
        });
      }
    });
  });

  // 两两比对 · 只比较不同诗人的站点
  for (let i = 0; i < allStops.length; i++) {
    for (let j = i + 1; j < allStops.length; j++) {
      const a = allStops[i], b = allStops[j];
      if (a.poetId === b.poetId) continue;

      const yearDiff = Math.abs(a.year - b.year);
      const distKm = geoDist([a.lon, a.lat], [b.lon, b.lat]);

      if (yearDiff <= 1 && distKm <= 200) {
        encounters.push({
          type: 'precise',  // 红圈
          a, b,
          midLat: (a.lat + b.lat) / 2,
          midLon: (a.lon + b.lon) / 2,
          year: Math.min(a.year, b.year),
          title: `${a.poetName} × ${b.poetName}`,
          story: `${a.year}·${a.place} ≈ ${b.year}·${b.place}`
        });
      } else if (yearDiff <= 10 && distKm <= 500) {
        encounters.push({
          type: 'loose',  // 黄圈
          a, b,
          midLat: (a.lat + b.lat) / 2,
          midLon: (a.lon + b.lon) / 2,
          year: Math.min(a.year, b.year),
          title: `${a.poetName} ≈ ${b.poetName}`,
          story: `${a.year}·${a.place} / ${b.year}·${b.place}`
        });
      }
    }
  }

  return encounters;
}

/**
 * 主组件
 * @param {object} props
 *   poetIds: 要显示的诗人 id 数组
 *   selectedScene: { poetId, stopIdx } 当前高亮的站
 *   onSelectScene: (poetId, stopIdx) => void
 *   onSelectEncounter: (encounter) => void
 *   center, zoom: 地图投影参数（与 InkMap 一致）
 *   showEncounters: 是否显示相遇圈
 */
export function PoetTrailOverlay({
  poetIds = [],
  selectedScene = null,
  onSelectScene,
  onSelectEncounter,
  center = [104.5, 35],
  zoom = 1,
  showEncounters = true
}) {
  // 展开的簇索引（展开时显示簇内所有点）
  const [expandedClusterIdx, setExpandedClusterIdx] = useState(null);
  // 浮卡片 · 点击一个相遇事件后显示
  const [hoverCard, setHoverCard] = useState(null);  // { encounter, x, y }

  const proj = useMemo(
    () => buildProjection(center, 680 * zoom, [410, 300]),
    [center, zoom]
  );

  const displayPoets = useMemo(
    () => POETS.filter(p => poetIds.includes(p.id)),
    [poetIds]
  );

  // 每个诗人的足迹点（投影后）
  const poetTrails = useMemo(() => {
    return displayPoets.map(poet => {
      const points = poet.footprints
        .map((f, idx) => {
          if (f.lat == null || f.lon == null) return null;
          const p = proj([f.lon, f.lat]);
          if (!p) return null;
          const flowerKey = extractFlowerKey(f.flower);
          return {
            x: p[0],
            y: p[1],
            year: f.year,
            idx,
            flowerKey,
            poemTitle: f.poemTitle,
            todayLabel: f.todayLabel
          };
        })
        .filter(Boolean);
      return { poet, points };
    });
  }, [displayPoets, proj]);

  // 相遇点（投影后）· 30px 内聚类
  const encounterClusters = useMemo(() => {
    if (!showEncounters || displayPoets.length < 2) return [];
    const encs = detectEncounters(displayPoets);
    const projected = encs.map(e => {
      const p = proj([e.midLon, e.midLat]);
      if (!p) return null;
      return { ...e, x: p[0], y: p[1] };
    }).filter(Boolean);

    // 聚类算法 · 30px 内合并为簇
    const CLUSTER_RADIUS = 30;
    const clusters = [];
    const used = new Set();

    projected.forEach((e, i) => {
      if (used.has(i)) return;
      const cluster = { items: [e], x: e.x, y: e.y };
      used.add(i);
      projected.forEach((e2, j) => {
        if (i === j || used.has(j)) return;
        const dx = e2.x - cluster.x;
        const dy = e2.y - cluster.y;
        if (Math.sqrt(dx*dx + dy*dy) < CLUSTER_RADIUS) {
          cluster.items.push(e2);
          used.add(j);
          // 重新计算簇中心
          cluster.x = cluster.items.reduce((s, x) => s + x.x, 0) / cluster.items.length;
          cluster.y = cluster.items.reduce((s, x) => s + x.y, 0) / cluster.items.length;
        }
      });
      // 簇内最早年份
      cluster.earliestYear = Math.min(...cluster.items.map(x => x.year));
      cluster.hasPrecise = cluster.items.some(x => x.type === 'precise');
      clusters.push(cluster);
    });

    return clusters;
  }, [displayPoets, proj, showEncounters]);

  return (
    <svg
      viewBox="0 0 820 600"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 5
      }}>

      {/* ═══ 每位诗人的连线 ═══ */}
      {poetTrails.map(({ poet, points }) => {
        if (points.length < 2) return null;
        const d = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
        return (
          <g key={poet.id}>
            {/* 外发光层 · 柔化 */}
            <path d={d}
              fill="none"
              stroke={poet.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.12"/>
            {/* 主线 */}
            <path d={d}
              fill="none"
              stroke={poet.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"/>
            {/* 年份方向箭头粒子（缓慢流动）*/}
            <circle r="2.5" fill={poet.color} opacity="0.8">
              <animateMotion dur="8s" repeatCount="indefinite" path={d}/>
            </circle>
          </g>
        );
      })}

      {/* ═══ 所有花朵站点 · 自动错开重叠 ═══ */}
      {(() => {
        // 把所有诗人的点扁平化 · 计算错开偏移
        const allPoints = [];
        poetTrails.forEach(({ poet, points }) => {
          points.forEach(pt => {
            allPoints.push({ poet, pt, key: poet.id + '-' + pt.idx });
          });
        });

        // 对每个点 · 查它是否有相邻点（30px 内）· 有则算偏移
        const offsets = {};
        const THRESH = 30;
        for (let i = 0; i < allPoints.length; i++) {
          const a = allPoints[i];
          const neighbors = [];
          for (let j = 0; j < allPoints.length; j++) {
            if (j === i) continue;
            const b = allPoints[j];
            const dx = a.pt.x - b.pt.x;
            const dy = a.pt.y - b.pt.y;
            if (Math.sqrt(dx*dx + dy*dy) < THRESH) neighbors.push(j);
          }
          if (neighbors.length > 0) {
            // 按 key 排序定位 · 给固定位置
            const groupIdx = [i, ...neighbors].sort().indexOf(i);
            const groupSize = neighbors.length + 1;
            const angle = (groupIdx * 2 * Math.PI) / groupSize;
            const radius = 15 + (groupSize > 4 ? 8 : 0);
            offsets[a.key] = {
              dx: Math.cos(angle) * radius,
              dy: Math.sin(angle) * radius
            };
          } else {
            offsets[a.key] = { dx: 0, dy: 0 };
          }
        }

        return allPoints.map(({ poet, pt, key }) => {
          const isSelected = selectedScene
            && selectedScene.poetId === poet.id
            && selectedScene.stopIdx === pt.idx;
          const off = offsets[key] || { dx: 0, dy: 0 };
          return (
            <g key={key} style={{ pointerEvents: 'auto' }}>
              {/* 如果有偏移·画短引线连到真实位置 */}
              {(off.dx !== 0 || off.dy !== 0) && (
                <line
                  x1={pt.x} y1={pt.y}
                  x2={pt.x + off.dx} y2={pt.y + off.dy}
                  stroke={poet.color}
                  strokeWidth="0.6"
                  opacity="0.4"/>
              )}
              <FlowerMarker
                flowerKey={pt.flowerKey}
                x={pt.x + off.dx} y={pt.y + off.dy}
                size={isSelected ? 13 : 9}
                highlighted={isSelected}
                poetColor={poet.color}
                id={poet.id.charCodeAt(0) + pt.idx}
                label={isSelected ? `${pt.year} · ${pt.poemTitle}` : null}
                onClick={() => onSelectScene && onSelectScene(poet.id, pt.idx)}
              />
            </g>
          );
        });
      })()}

      {/* ═══ 相遇簇 · 渲染在最上层 ═══ */}
      {encounterClusters.map((cluster, clusterIdx) => {
        const isExpanded = expandedClusterIdx === clusterIdx;
        const size = cluster.items.length;
        const isPrecise = cluster.hasPrecise;
        const ringColor = isPrecise ? '#c23820' : '#c89a4a';

        // 单个相遇 · 直接渲染
        if (size === 1 && !isExpanded) {
          const e = cluster.items[0];
          const outerR = isPrecise ? 30 : 24;
          const midR = isPrecise ? 20 : 16;
          const innerR = isPrecise ? 10 : 8;
          return (
            <g key={'cluster-' + clusterIdx}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(ev) => {
                ev.stopPropagation();
                setHoverCard({ encounter: e, x: cluster.x, y: cluster.y });
              }}>
              <circle cx={cluster.x} cy={cluster.y} r={outerR + 4}
                fill="var(--paper)" opacity="0.92"/>
              <circle cx={cluster.x} cy={cluster.y} r={outerR}
                fill={ringColor} opacity="0.12">
                <animate attributeName="r" values={`${outerR-4};${outerR+6};${outerR-4}`} dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.25;0.08;0.25" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx={cluster.x} cy={cluster.y} r={midR}
                fill="none" stroke={ringColor} strokeWidth="2" opacity="0.95"/>
              <circle cx={cluster.x} cy={cluster.y} r={midR - 4}
                fill="none" stroke={ringColor} strokeWidth="0.8"
                strokeDasharray={isPrecise ? "0" : "3 2"} opacity="0.6"/>
              <circle cx={cluster.x} cy={cluster.y} r={innerR}
                fill={ringColor} opacity="0.95"/>
              <text x={cluster.x} y={cluster.y + 4}
                textAnchor="middle" fontFamily="serif"
                fontSize={isPrecise ? 14 : 12}
                fill="var(--paper)" fontWeight="700" letterSpacing="1">
                {isPrecise ? '遇' : '近'}
              </text>
              <rect x={cluster.x - 20} y={cluster.y - outerR - 14}
                width="40" height="16" fill={ringColor} rx="2"/>
              <text x={cluster.x} y={cluster.y - outerR - 3}
                textAnchor="middle" fontFamily="var(--font-mono)"
                fontSize="10" fill="var(--paper)" fontWeight="700" letterSpacing="1">
                {e.year}
              </text>
            </g>
          );
        }

        // 簇 · 未展开 · 显示合并圈
        if (!isExpanded) {
          return (
            <g key={'cluster-' + clusterIdx}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(ev) => {
                ev.stopPropagation();
                setExpandedClusterIdx(clusterIdx);
                setHoverCard(null);
              }}>
              <circle cx={cluster.x} cy={cluster.y} r={34}
                fill="var(--paper)" opacity="0.95"/>
              <circle cx={cluster.x} cy={cluster.y} r={30}
                fill={ringColor} opacity="0.15">
                <animate attributeName="r" values="28;34;28" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx={cluster.x} cy={cluster.y} r={26}
                fill="none" stroke={ringColor} strokeWidth="2.5" opacity="0.9"/>
              <circle cx={cluster.x} cy={cluster.y} r={20}
                fill={ringColor} opacity="0.95"/>
              <text x={cluster.x} y={cluster.y - 2}
                textAnchor="middle" fontFamily="serif"
                fontSize="16" fill="var(--paper)" fontWeight="700">
                ⊙
              </text>
              <text x={cluster.x} y={cluster.y + 11}
                textAnchor="middle" fontFamily="var(--font-mono)"
                fontSize="10" fill="var(--paper)" fontWeight="700">
                {size}
              </text>
            </g>
          );
        }

        // 展开 · 显示簇内所有点 + 收起按钮
        return (
          <g key={'cluster-' + clusterIdx}>
            {/* 收起按钮（簇中心） */}
            <circle cx={cluster.x} cy={cluster.y} r={12}
              fill="var(--paper)" stroke="var(--ink-2)" strokeWidth="1"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(ev) => { ev.stopPropagation(); setExpandedClusterIdx(null); }}/>
            <text x={cluster.x} y={cluster.y + 4}
              textAnchor="middle" fontSize="12" fill="var(--ink-2)"
              style={{ pointerEvents: 'none' }}>×</text>
            {cluster.items.map((e, i) => {
              // 环形展开
              const angle = (i * 2 * Math.PI) / cluster.items.length - Math.PI / 2;
              const radius = 32;
              const ex = cluster.x + Math.cos(angle) * radius;
              const ey = cluster.y + Math.sin(angle) * radius;
              const pr = e.type === 'precise';
              const rc = pr ? '#c23820' : '#c89a4a';
              return (
                <g key={'enc-' + i}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setHoverCard({ encounter: e, x: ex, y: ey });
                  }}>
                  <line x1={cluster.x} y1={cluster.y} x2={ex} y2={ey}
                    stroke={rc} strokeWidth="0.8" opacity="0.4"/>
                  <circle cx={ex} cy={ey} r={13}
                    fill={rc} opacity="0.95"/>
                  <text x={ex} y={ey + 3}
                    textAnchor="middle" fontFamily="var(--font-mono)"
                    fontSize="9" fill="var(--paper)" fontWeight="700">
                    {e.year}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* ═══ 浮卡片 · 点击相遇后显示 ═══ */}
      {hoverCard && (() => {
        const e = hoverCard.encounter;
        const cx = hoverCard.x;
        const cy = hoverCard.y;
        // 卡片位置 · 避开圈 · 向右上方浮
        const cardW = 220, cardH = 82;
        let cardX = cx + 22;
        let cardY = cy - cardH - 10;
        // 防越界
        if (cardX + cardW > 820) cardX = cx - cardW - 22;
        if (cardY < 10) cardY = cy + 22;
        return (
          <g style={{ pointerEvents: 'auto' }}>
            {/* 引线 */}
            <line x1={cx} y1={cy} x2={cardX + cardW/2} y2={cardY + cardH/2}
              stroke="#c23820" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 2"/>
            {/* 卡片背景 */}
            <rect x={cardX} y={cardY} width={cardW} height={cardH}
              rx="6"
              fill="var(--paper)"
              stroke="#c23820"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))', cursor: 'pointer' }}
              onClick={() => {
                onSelectEncounter && onSelectEncounter(e);
                setHoverCard(null);
              }}/>
            {/* 卡片边线装饰 */}
            <rect x={cardX} y={cardY} width="4" height={cardH}
              fill="#c23820" rx="6"/>
            {/* 关闭按钮 */}
            <g style={{ cursor: 'pointer' }}
              onClick={(ev) => { ev.stopPropagation(); setHoverCard(null); }}>
              <circle cx={cardX + cardW - 10} cy={cardY + 10} r="8"
                fill="var(--bg-sunk)"/>
              <text x={cardX + cardW - 10} y={cardY + 13}
                textAnchor="middle" fontSize="11" fill="var(--ink-3)">×</text>
            </g>
            {/* 年份徽章 */}
            <rect x={cardX + 12} y={cardY + 10} width="40" height="18"
              fill="#c23820" rx="2"/>
            <text x={cardX + 32} y={cardY + 23}
              textAnchor="middle" fontFamily="var(--font-mono)"
              fontSize="10" fill="var(--paper)" fontWeight="700">
              {e.year}
            </text>
            {/* 诗人 */}
            <text x={cardX + 58} y={cardY + 24}
              fontFamily="serif" fontSize="13"
              fill="var(--ink)" fontWeight="700" letterSpacing="1">
              {e.title || '相遇'}
            </text>
            {/* 地点 */}
            <text x={cardX + 12} y={cardY + 46}
              fontFamily="serif" fontSize="11"
              fill="var(--ink-2)" letterSpacing="0.5">
              {e.a?.place || '—'} {e.b?.place && e.a?.place !== e.b?.place ? `/ ${e.b.place}` : ''}
            </text>
            {/* 提示 · 点读详情 */}
            <text x={cardX + 12} y={cardY + 66}
              fontFamily="serif" fontSize="10"
              fill="#c23820" fontStyle="italic">
              → 点此读故事详情
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
