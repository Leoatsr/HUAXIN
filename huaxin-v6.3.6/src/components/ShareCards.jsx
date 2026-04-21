import React, { useRef, useState } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ErrorInline } from './StateViews.jsx';
import { trackShare } from '../utils/analytics.js';

/* ═══════════════════════════════════════════════════════════════
   分享卡 · 把景点/花签生成可下载的 PNG
   ── 实现原理：SVG 渲染 → Blob → Canvas.drawImage → toDataURL
   两种卡片共用同一个导出函数
   ═══════════════════════════════════════════════════════════════ */

// SVG 转 PNG 核心函数
async function svgToPng(svgElement, filename = 'huaxin.png') {
  return new Promise((resolve, reject) => {
    const xml = new XMLSerializer().serializeToString(svgElement);
    const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.viewBox.baseVal.width * 2;   // 2x DPI
      canvas.height = svgElement.viewBox.baseVal.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(url);
      }, 'image/png');
    };
    img.onerror = reject;
    img.src = svg64;
  });
}

// ═══════════════════════════════════════════════════════════════
// SpotShareCard · 景点分享卡
// ═══════════════════════════════════════════════════════════════
export function SpotShareCard({ spot, onClose }) {
  const svgRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  if (!spot) return null;

  const download = async () => {
    if (!svgRef.current) return;
    setExporting(true);
    setError(null);
    try {
      await svgToPng(svgRef.current, `花信风-${spot.n}.png`);
      trackShare({ target: 'card', spotId: spot.id, species: spot.sp });
    } catch (e) {
      setError('导出失败 · 可尝试截图保存');
    }
    setExporting(false);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div className="cn-caps">分享此景</div>
      </div>

      {/* SVG 卡片（可预览 + 可导出） */}
      <div style={{
        background: 'var(--bg-sunk)',
        padding: 10,
        borderRadius: 'var(--radius-md)',
        display: 'grid', placeItems: 'center'
      }}>
        <svg ref={svgRef} viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: 400, height: 'auto',
            boxShadow: 'var(--shadow-md)', borderRadius: 4 }}>
          {/* 宣纸底 */}
          <defs>
            <radialGradient id="paperGrad" cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#faf2e3"/>
              <stop offset="100%" stopColor="#f0e6d0"/>
            </radialGradient>
            <radialGradient id="flowerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8a0b8"/>
              <stop offset="100%" stopColor="#d06488"/>
            </radialGradient>
          </defs>
          <rect width="600" height="800" fill="url(#paperGrad)"/>

          {/* 左上朱砂印章 */}
          <g transform="translate(45, 45)">
            <rect width="72" height="72" fill="#c23820" rx="3"/>
            <text x="36" y="34" textAnchor="middle"
              fontFamily="serif" fontSize="22" fill="#faf2e3"
              letterSpacing="2">花信</text>
            <text x="36" y="56" textAnchor="middle"
              fontFamily="serif" fontSize="14" fill="#faf2e3"
              letterSpacing="6">风</text>
          </g>

          {/* 右上日期 */}
          <text x="555" y="80" textAnchor="end"
            fontFamily="serif" fontSize="14" fill="#8a7560"
            letterSpacing="4">
            {new Date().toLocaleDateString('zh-CN')}
          </text>

          {/* 中间花 SVG */}
          <g transform="translate(300, 280)">
            {[0, 72, 144, 216, 288].map(deg => (
              <ellipse key={deg}
                cx="0" cy="-60" rx="40" ry="70"
                fill="url(#flowerGrad)"
                opacity="0.9"
                transform={`rotate(${deg})`}/>
            ))}
            <circle cx="0" cy="0" r="24" fill="#f8e080"/>
            <circle cx="0" cy="0" r="12" fill="#f8a030"/>
          </g>

          {/* 景点名 */}
          <text x="300" y="480" textAnchor="middle"
            fontFamily="serif" fontSize="36" fill="#2a1d13"
            letterSpacing="12"
            fontWeight="600">
            {spot.n.length > 12 ? spot.n.slice(0, 12) : spot.n}
          </text>

          {/* 花种 */}
          <text x="300" y="528" textAnchor="middle"
            fontFamily="serif" fontSize="20" fill="#c23820"
            letterSpacing="14">
            {spot.sp}
          </text>

          {/* 诗句（截断） */}
          {spot.po && (
            <text x="300" y="600" textAnchor="middle"
              fontFamily="serif" fontSize="18" fill="#5a4530"
              fontStyle="italic" letterSpacing="5">
              「{spot.po.length > 24 ? spot.po.slice(0, 24) + '…' : spot.po}」
            </text>
          )}

          {/* 分割线 */}
          <line x1="140" y1="660" x2="460" y2="660"
            stroke="#8a7560" strokeWidth="0.5"/>

          {/* 底部信息 */}
          <text x="300" y="700" textAnchor="middle"
            fontFamily="serif" fontSize="14" fill="#8a7560"
            letterSpacing="4">
            {spot.rg} · {spot._st ? spot._st.st : '待花开'}
          </text>
          {spot._pred && (
            <text x="300" y="726" textAnchor="middle"
              fontFamily="serif" fontSize="12" fill="#8a7560"
              letterSpacing="3">
              预计 {spot._pred.dateStr} 盛花
            </text>
          )}

          {/* 标识 */}
          <text x="300" y="770" textAnchor="middle"
            fontFamily="monospace" fontSize="10" fill="#a08970"
            letterSpacing="3">
            huaxinfeng · 花信风
          </text>
        </svg>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorInline message={error} dismiss={() => setError(null)}/>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
          返回
        </button>
        <button className="btn zhusha" onClick={download}
          disabled={exporting}
          style={{ flex: 2, justifyContent: 'center' }}>
          <Icon.share/> {exporting ? '导出中...' : '保存为图片'}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// MoodShareCard · 花签分享卡
// ═══════════════════════════════════════════════════════════════
export function MoodShareCard({ card, onClose }) {
  const svgRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  if (!card) return null;

  const download = async () => {
    if (!svgRef.current) return;
    setExporting(true);
    setError(null);
    try {
      await svgToPng(svgRef.current, `花信风-${card.name}.png`);
      trackShare({ target: 'mood_card' });
    } catch (e) {
      setError('导出失败 · 可尝试截图保存');
    }
    setExporting(false);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div className="cn-caps">分享此签</div>
      </div>

      <div style={{
        background: 'var(--bg-sunk)',
        padding: 10,
        borderRadius: 'var(--radius-md)',
        display: 'grid', placeItems: 'center'
      }}>
        <svg ref={svgRef} viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: 380, height: 'auto',
            boxShadow: 'var(--shadow-md)', borderRadius: 4 }}>
          <defs>
            <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f5e6c8"/>
              <stop offset="100%" stopColor="#d4b888"/>
            </linearGradient>
          </defs>

          {/* 竹签底 */}
          <rect x="180" y="60" width="240" height="680" rx="4"
            fill="url(#bambooGrad)" stroke="#8a6a40" strokeWidth="1.5"/>
          {/* 竹节线 */}
          {[180, 330, 480, 620].map(y => (
            <g key={y}>
              <line x1="180" y1={y} x2="420" y2={y}
                stroke="#8a6a40" strokeWidth="0.6" opacity="0.5"/>
              <circle cx="180" cy={y} r="2" fill="#8a6a40"/>
              <circle cx="420" cy={y} r="2" fill="#8a6a40"/>
            </g>
          ))}

          {/* 签名 */}
          <text x="300" y="150" textAnchor="middle"
            fontFamily="serif" fontSize="42" fill="#c23820"
            letterSpacing="12" fontWeight="700">
            {card.name}
          </text>

          {/* 分隔符 */}
          <text x="300" y="210" textAnchor="middle"
            fontFamily="serif" fontSize="16" fill="#8a6a40"
            letterSpacing="6">◇ ◇ ◇</text>

          {/* 情绪关键词 */}
          <text x="300" y="270" textAnchor="middle"
            fontFamily="serif" fontSize="22" fill="#2a1d13"
            letterSpacing="10">
            {card.mood}
          </text>

          {/* 诗句（竖着也可以，这里横排更稳） */}
          <text x="300" y="380" textAnchor="middle"
            fontFamily="serif" fontSize="16" fill="#5a4530"
            fontStyle="italic" letterSpacing="4">
            {card.poem.length > 18 ? card.poem.slice(0, 18) : card.poem}
          </text>
          {card.poem.length > 18 && (
            <text x="300" y="408" textAnchor="middle"
              fontFamily="serif" fontSize="16" fill="#5a4530"
              fontStyle="italic" letterSpacing="4">
              {card.poem.slice(18, 36)}
            </text>
          )}

          {/* 释义 */}
          <foreignObject x="220" y="460" width="160" height="200">
            <div xmlns="http://www.w3.org/1999/xhtml"
              style={{
                fontFamily: 'serif',
                fontSize: '13px',
                color: '#5a4530',
                lineHeight: 1.9,
                letterSpacing: '2px',
                textAlign: 'justify'
              }}>
              {card.meaning}
            </div>
          </foreignObject>

          {/* 日期 + 品牌 */}
          <text x="300" y="680" textAnchor="middle"
            fontFamily="serif" fontSize="12" fill="#a08970"
            letterSpacing="4">
            {new Date().toLocaleDateString('zh-CN')} 抽得此签
          </text>
          <text x="300" y="720" textAnchor="middle"
            fontFamily="monospace" fontSize="10" fill="#a08970"
            letterSpacing="3">
            huaxinfeng · 花信风
          </text>
        </svg>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorInline message={error} dismiss={() => setError(null)}/>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
          返回
        </button>
        <button className="btn zhusha" onClick={download}
          disabled={exporting}
          style={{ flex: 2, justifyContent: 'center' }}>
          <Icon.share/> {exporting ? '导出中...' : '保存为图片'}
        </button>
      </div>
    </Modal>
  );
}


// ═══════════════════════════════════════════════════════════════
// TripShareCard · 行程分享卡 · 多景点 + 微小地图轨迹
// ═══════════════════════════════════════════════════════════════
export function TripShareCard({ spots = [], totalKm, onClose }) {
  const svgRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  if (!spots || spots.length === 0) return null;

  const download = async () => {
    if (!svgRef.current) return;
    setExporting(true);
    setError(null);
    try {
      await svgToPng(svgRef.current, `花信风-行程${spots.length}站.png`);
      trackShare({ target: 'trip_card', spotId: spots[0]?.id, species: spots.map(s => s.sp).join('/') });
    } catch (e) {
      setError('导出失败 · 可尝试截图保存');
    }
    setExporting(false);
  };

  // 计算地图 viewBox · 全部景点落进去
  const lats = spots.map(s => s.lat);
  const lons = spots.map(s => s.lon);
  const minLat = Math.min(...lats) - 1;
  const maxLat = Math.max(...lats) + 1;
  const minLon = Math.min(...lons) - 1;
  const maxLon = Math.max(...lons) + 1;
  const mapW = 500, mapH = 260;
  const tx = lon => ((lon - minLon) / (maxLon - minLon || 1)) * mapW;
  const ty = lat => mapH - ((lat - minLat) / (maxLat - minLat || 1)) * mapH;

  // 花期时间轴 · 找整个行程的花期范围
  const allMonths = spots.filter(s => s.pk).flatMap(s => s.pk);
  const monthRange = allMonths.length > 0
    ? `${Math.min(...allMonths)} - ${Math.max(...allMonths)} 月`
    : '—';

  // 花种统计
  const species = [...new Set(spots.map(s => s.sp))];

  // 第一站 / 最后一站名字（截断）
  const firstName = spots[0].n;
  const lastName = spots[spots.length - 1].n;

  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div className="cn-caps">行 程 分 享</div>
      </div>

      <div style={{
        background: 'var(--bg-sunk)',
        padding: 10,
        borderRadius: 8,
        display: 'grid', placeItems: 'center'
      }}>
        <svg ref={svgRef} viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: 400, height: 'auto',
            boxShadow: 'var(--shadow-md)', borderRadius: 4 }}>
          {/* 宣纸底 */}
          <defs>
            <radialGradient id="tripPaperGrad" cx="50%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#faf2e3"/>
              <stop offset="100%" stopColor="#f0e6d0"/>
            </radialGradient>
            <linearGradient id="tripRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c23820" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#e8a048" stopOpacity="0.9"/>
            </linearGradient>
          </defs>
          <rect width="600" height="900" fill="url(#tripPaperGrad)"/>

          {/* 左上朱砂印章 */}
          <g transform="translate(45, 45)">
            <rect width="72" height="72" fill="#c23820" rx="3"/>
            <text x="36" y="34" textAnchor="middle"
              fontFamily="serif" fontSize="22" fill="#faf2e3" letterSpacing="2">花信</text>
            <text x="36" y="56" textAnchor="middle"
              fontFamily="serif" fontSize="14" fill="#faf2e3" letterSpacing="6">风</text>
          </g>

          {/* 右上日期 */}
          <text x="555" y="80" textAnchor="end"
            fontFamily="serif" fontSize="14" fill="#8a7560" letterSpacing="4">
            {new Date().toLocaleDateString('zh-CN')}
          </text>

          {/* 主标题 */}
          <text x="300" y="175" textAnchor="middle"
            fontFamily="serif" fontSize="32" fill="#2a1d13"
            letterSpacing="12" fontWeight="600">
            花事行程
          </text>
          <text x="300" y="210" textAnchor="middle"
            fontFamily="serif" fontSize="14" fill="#8a7560" letterSpacing="6">
            共 {spots.length} 站 · {monthRange}
          </text>

          {/* 中央地图 */}
          <g transform="translate(50, 260)">
            {/* 地图背景纸纹 */}
            <rect x="0" y="0" width={mapW} height={mapH}
              fill="#f7ecd8" stroke="#c8b898" strokeWidth="0.5" rx="3"/>

            {/* 连线 */}
            {spots.length > 1 && (
              <path
                d={spots.map((s, i) => {
                  const x = tx(s.lon), y = ty(s.lat);
                  return (i === 0 ? 'M' : 'L') + x + ' ' + y;
                }).join(' ')}
                fill="none"
                stroke="url(#tripRouteGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 3"
                strokeLinecap="round"/>
            )}

            {/* 景点点 · 编号 */}
            {spots.map((s, i) => {
              const x = tx(s.lon), y = ty(s.lat);
              return (
                <g key={s.id}>
                  <circle cx={x} cy={y} r="10" fill="#c23820" opacity="0.2"/>
                  <circle cx={x} cy={y} r="6" fill="#c23820"/>
                  <text x={x} y={y + 1.8} textAnchor="middle"
                    fontFamily="serif" fontSize="9" fill="#faf2e3" fontWeight="700">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 景点列表 · 序号 + 名字 */}
          <g transform="translate(60, 555)">
            {spots.slice(0, 8).map((s, i) => (
              <g key={s.id} transform={`translate(0, ${i * 32})`}>
                {/* 序号圆圈 */}
                <circle cx="14" cy="14" r="11" fill="#c23820"/>
                <text x="14" y="18" textAnchor="middle"
                  fontFamily="serif" fontSize="12" fill="#faf2e3" fontWeight="700">
                  {i + 1}
                </text>
                {/* 景点名 */}
                <text x="38" y="18"
                  fontFamily="serif" fontSize="15" fill="#2a1d13" letterSpacing="3">
                  {s.n.length > 14 ? s.n.slice(0, 14) + '…' : s.n}
                </text>
                {/* 花种 */}
                <text x="480" y="18" textAnchor="end"
                  fontFamily="serif" fontSize="12" fill="#c23820" letterSpacing="2">
                  {s.sp}
                </text>
              </g>
            ))}
            {spots.length > 8 && (
              <text x="250" y={8 * 32 + 20} textAnchor="middle"
                fontFamily="serif" fontSize="11" fill="#8a7560" fontStyle="italic">
                … 还有 {spots.length - 8} 站
              </text>
            )}
          </g>

          {/* 分割线 */}
          <line x1="140" y1="830" x2="460" y2="830" stroke="#8a7560" strokeWidth="0.5"/>

          {/* 底部 · 花种概览 */}
          <text x="300" y="860" textAnchor="middle"
            fontFamily="serif" fontSize="13" fill="#8a7560" letterSpacing="3">
            {species.slice(0, 5).join(' · ')}{species.length > 5 ? ' …' : ''}
          </text>

          {/* 里程 */}
          {totalKm != null && (
            <text x="300" y="882" textAnchor="middle"
              fontFamily="serif" fontSize="11" fill="#a08970" letterSpacing="3">
              全程 约 {totalKm.toFixed(0)} 公里
            </text>
          )}

          {/* 标识 */}
          <text x="300" y="880" textAnchor="middle"
            fontFamily="monospace" fontSize="9" fill="#a08970" letterSpacing="3"
            style={{ opacity: totalKm != null ? 0 : 1 }}>
            huaxinfeng · 花信风
          </text>
        </svg>
      </div>

      {error && (
        <div style={{ marginTop: 12 }}>
          <ErrorInline message={error} dismiss={() => setError(null)}/>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
          返回
        </button>
        <button className="btn zhusha" onClick={download}
          disabled={exporting}
          style={{ flex: 2, justifyContent: 'center' }}>
          <Icon.share/> {exporting ? '导出中...' : '保存为图片'}
        </button>
      </div>
    </Modal>
  );
}

// 共用模态容器
function Modal({ children, onClose }) {
  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'color-mix(in oklch, var(--ink) 55%, transparent)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          width: 'min(460px, 100%)',
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>
        <button onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--bg-sunk)', border: 'none',
            cursor: 'pointer', color: 'var(--ink-3)',
            width: 28, height: 28, borderRadius: '50%',
            display: 'grid', placeItems: 'center'
          }}>
          <Icon.close/>
        </button>
        {children}
      </div>
    </div>
  );
}
