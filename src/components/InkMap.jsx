import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { RIVERS, MTNS } from '../data/constants.js';
import { PetalMark } from '../ui/atoms.jsx';
import {
  CHINA_BORDER, HAINAN_ISLAND, TAIWAN_ISLAND,
  CHINA_RIVERS, REGION_LABELS
} from '../data/china-geo.js';

/* ═══════════════════════════════════════════════════════════════
   水墨风中国地图
   - 宣纸纹理 + 墨晕
   - 用 D3 geoMercator 把 404 个景点的 (lat,lon) 投影到 (x,y)
   - 宋代山水色调（oklch 青绿）
   ═══════════════════════════════════════════════════════════════ */

// China bbox ≈ 73.5°E~135.1°E, 18.2°N~53.5°N
// viewBox = 820×600
// center ≈ (104.5, 35)
export function buildProjection(center = [104.5, 35], scale = 680, translate = [410, 300]) {
  return d3.geoMercator().center(center).scale(scale).translate(translate);
}

export function InkMap({
  spots = [],
  selectedId,
  onSelect,
  favs = {},
  checkins = {},
  center = [104.5, 35],
  zoom = 1,
  showRegionLabels = true
}) {
  const proj = useMemo(
    () => buildProjection(center, 680 * zoom, [410, 300]),
    [center, zoom]
  );

  // 真实轮廓 · 手工投影（避开 d3.geoPath 的球面绕序问题）
  const coordsToPath = (coords) => {
    if (!coords || coords.length === 0) return '';
    return coords.map((c, i) => {
      const p = proj(c);
      if (!p) return '';
      return `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    }).filter(Boolean).join(' ') + ' Z';
  };
  const coordsToLine = (coords) => {
    if (!coords || coords.length === 0) return '';
    return coords.map((c, i) => {
      const p = proj(c);
      if (!p) return '';
      return `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    }).filter(Boolean).join(' ');
  };

  const borderPath = useMemo(() => coordsToPath(CHINA_BORDER), [proj]);
  const hainanPath = useMemo(() => coordsToPath(HAINAN_ISLAND), [proj]);
  const taiwanPath = useMemo(() => coordsToPath(TAIWAN_ISLAND), [proj]);
  const yellowRiverPath = useMemo(() => coordsToLine(CHINA_RIVERS.yellow), [proj]);
  const yangtzeRiverPath = useMemo(() => coordsToLine(CHINA_RIVERS.yangtze), [proj]);

  // 提前计算所有景点投影位置，避免每次渲染重算
  const projectedSpots = useMemo(() => {
    return spots
      .map(s => {
        const p = proj([s.lon, s.lat]);
        if (!p) return null;
        const [x, y] = p;
        if (x < -20 || x > 840 || y < -20 || y > 620) return null;
        return { ...s, _x: x, _y: y };
      })
      .filter(Boolean);
  }, [spots, proj]);

  // 区域标签 · 用真实数据源
  const regionLabels = useMemo(() => {
    return REGION_LABELS.map(r => {
      const p = proj([r.lon, r.lat]);
      return p ? { ...r, x: p[0], y: p[1] } : null;
    }).filter(Boolean);
  }, [proj]);

  return (
    <svg viewBox="0 0 820 600" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        {/* 纸张纹理 */}
        <pattern id="paper" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="oklch(0.965 0.012 85)"/>
          <circle cx="20" cy="30" r="0.5" fill="oklch(0.22 0.012 60 / 0.04)"/>
          <circle cx="70" cy="55" r="0.4" fill="oklch(0.22 0.012 60 / 0.03)"/>
          <circle cx="45" cy="80" r="0.3" fill="oklch(0.22 0.012 60 / 0.03)"/>
          <circle cx="85" cy="15" r="0.3" fill="oklch(0.22 0.012 60 / 0.02)"/>
        </pattern>
        {/* 墨晕滤镜 */}
        <filter id="inkblur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.2"/>
        </filter>
      </defs>

      {/* 底色：宣纸 */}
      <rect width="820" height="600" fill="url(#paper)"/>

      {/* 中国大陆真实轮廓 */}
      <path d={borderPath}
        fill="oklch(0.955 0.006 85)"
        stroke="oklch(0.22 0.012 60 / 0.35)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* 西部高原墨晕 · 青藏高原区域 */}
      <g opacity="0.08" filter="url(#inkblur)">
        <ellipse cx="250" cy="320" rx="95" ry="55" fill="oklch(0.55 0.015 200)"/>
        <ellipse cx="330" cy="295" rx="70" ry="38" fill="oklch(0.55 0.015 200)"/>
        <ellipse cx="400" cy="305" rx="55" ry="30" fill="oklch(0.55 0.015 200)"/>
      </g>

      {/* 黄河 · 长江 · 真实走向 */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {yellowRiverPath && (
          <path d={yellowRiverPath}
            stroke="oklch(0.55 0.03 80)"
            strokeWidth="1.3" opacity="0.55"/>
        )}
        {yangtzeRiverPath && (
          <path d={yangtzeRiverPath}
            stroke="oklch(0.55 0.025 220)"
            strokeWidth="1.3" opacity="0.55"/>
        )}
      </g>

      {/* 附加山脉（constants 里的虚线山脉）*/}
      <g opacity="0.25" fill="none" stroke="oklch(0.55 0.03 80)" strokeWidth="0.8" strokeDasharray="3,3">
        {MTNS.map((m, i) => {
          const d = m.co.map((c, idx) => {
            const p = proj(c);
            return p ? `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}` : '';
          }).join(' ');
          return <path key={i} d={d}/>;
        })}
      </g>

      {/* 区域标签 */}
      {showRegionLabels && (
        <g fontFamily="var(--font-serif)" fontSize="11" fill="oklch(0.56 0.012 70)" letterSpacing="0.3em">
          {regionLabels.map(r => (
            <text key={r.n} x={r.x} y={r.y} opacity="0.55" textAnchor="middle">{r.n}</text>
          ))}
        </g>
      )}

      {/* 景点标记 */}
      {projectedSpots.map(s => {
        const active = selectedId === s.id;
        const peak = s._st && s._st.l >= 4;
        const faved = !!favs[s.id];
        const checked = !!checkins[s.id];
        return (
          <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => onSelect && onSelect(s)}>
            {peak && !active && (
              <circle cx={s._x} cy={s._y} r="9" fill="var(--zhusha)" opacity="0.12"/>
            )}
            {active && <circle cx={s._x} cy={s._y} r="11" fill="var(--zhusha)" opacity="0.18"/>}
            <circle cx={s._x} cy={s._y}
              r={active ? 5 : (peak ? 3.5 : 2.6)}
              fill={active || peak ? 'var(--zhusha)' : 'oklch(0.45 0.02 60)'}
              opacity={active ? 1 : peak ? 0.95 : 0.55}
            />
            {active && <circle cx={s._x} cy={s._y} r="8" fill="none" stroke="var(--zhusha)" strokeWidth="1"/>}
            {checked && <circle cx={s._x + 4} cy={s._y - 4} r="2" fill="var(--jin)"/>}
            {faved && <circle cx={s._x - 4} cy={s._y - 4} r="2" fill="var(--zhusha)"/>}
            {(active || peak) && (
              <text x={s._x + 9} y={s._y + 3.5}
                fontFamily="var(--font-serif)"
                fontSize={active ? 12 : 10}
                fill="var(--ink)"
                opacity={active ? 1 : 0.7}
                style={{ pointerEvents: 'none' }}>
                {(s.n || '').split('·')[0]}
              </text>
            )}
          </g>
        );
      })}

      {/* 台湾 · 海南（真实经纬度投影）*/}
      {taiwanPath && (
        <path d={taiwanPath}
          fill="oklch(0.955 0.006 85)"
          stroke="oklch(0.22 0.012 60 / 0.35)"
          strokeWidth="1" strokeLinejoin="round"/>
      )}
      {hainanPath && (
        <path d={hainanPath}
          fill="oklch(0.955 0.006 85)"
          stroke="oklch(0.22 0.012 60 / 0.35)"
          strokeWidth="1" strokeLinejoin="round"/>
      )}

      {/* 指南针（右下） */}
      <g transform="translate(760 530)" opacity="0.55">
        <circle r="18" fill="none" stroke="var(--ink-3)" strokeWidth="0.7"/>
        <path d="M0 -16 L 2.5 0 L 0 16 L -2.5 0 Z" fill="var(--ink-2)"/>
        <text y="-22" textAnchor="middle" fontSize="10" fontFamily="var(--font-serif)" fill="var(--ink-2)">北</text>
      </g>

      {/* 比例尺 */}
      <g transform="translate(40 560)" fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)">
        <line x1="0" y1="0" x2="80" y2="0" stroke="var(--ink-3)" strokeWidth="0.7"/>
        <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--ink-3)" strokeWidth="0.7"/>
        <line x1="80" y1="-3" x2="80" y2="3" stroke="var(--ink-3)" strokeWidth="0.7"/>
        <text x="0" y="14">0</text>
        <text x="62" y="14">{Math.round(500 / zoom)}km</text>
      </g>
    </svg>
  );
}
