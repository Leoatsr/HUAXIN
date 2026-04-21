import React, { useRef, useCallback } from 'react';
import { InkMap } from './InkMap.jsx';

/* ═══════════════════════════════════════════════════════════════
   MapCanvas · 统一地图画布容器
   ───────────────────────────────────────────────────────────────
   · 容器样式（圆角 · 边框 · 阴影 · paper 背景）
   · 受控 center/zoom
   · 缩放控件（右下 +/−/重置）
   · 顶部徽章插槽
   · ★ 拖拽平移（鼠标 + 触屏）
   · ★ 滚轮缩放（以鼠标位置为中心）
   
   用在 4 处：花事 / 诗踪 / 朝代花园 / 敬畏
   ═══════════════════════════════════════════════════════════════ */

// 经验值：InkMap 基础尺寸 820 × 600 · scale=680·zoom
// 拖拽 1px ≈ 多少经度/纬度？与当前 zoom 反比。
// 经度 1° ≈ scale/360/zoom 像素 ≈ 680*zoom/360 像素/度
// 所以 dPx 转 dLon ≈ dPx * 360 / (680*zoom) ≈ dPx * 0.529 / zoom
// 纬度稍微不同（Mercator 不线性）· 近似同处理 · 用户体验够用
function pxToGeo(dxPx, dyPx, zoom, svgWidth) {
  // 基于 viewBox 820 · 实际容器宽度 svgWidth · 所以 1 px 容器 = viewBox(820/svgWidth) 像素
  const ratio = 820 / svgWidth;
  const lonPerPx = 360 / (680 * zoom) * ratio;
  const latPerPx = 360 / (680 * zoom) * ratio;
  return [-dxPx * lonPerPx, dyPx * latPerPx];  // x 向左拖 · 经度变大
}

export function MapCanvas({
  spots = [], selectedId, onSelect,
  favs = {}, checkins = {},
  showRegionLabels = true,
  center = [104.5, 35], zoom = 1,
  onCenterChange, onZoomChange,
  showZoomControls = true,
  zoomMin = 0.6, zoomMax = 4,
  enablePan = true,
  enableWheelZoom = true,
  topBadge = null,
  children = null,
  minHeight = 460,
  maxHeight,
  fillViewport = false,
  fillOffsetPx = 300
}) {
  const containerRef = useRef(null);
  const dragState = useRef(null);  // { startX, startY, startCenter, width }

  const hasChanged = zoom !== 1 || center[0] !== 104.5 || center[1] !== 35;
  const canInteract = !!onCenterChange && !!onZoomChange;

  // ─── 拖拽 ───
  const handlePointerDown = useCallback((e) => {
    if (!enablePan || !onCenterChange) return;
    // 只处理左键（按钮 0）或 触摸
    if (e.button !== undefined && e.button !== 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCenter: [...center],
      width: rect.width,
      hasMoved: false
    };
    // 捕获指针 · 即使鼠标移出容器也能继续
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  }, [enablePan, onCenterChange, center]);

  const handlePointerMove = useCallback((e) => {
    const s = dragState.current;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;  // 抗抖
    s.hasMoved = true;
    const [dLon, dLat] = pxToGeo(dx, dy, zoom, s.width);
    onCenterChange([s.startCenter[0] + dLon, s.startCenter[1] + dLat]);
  }, [zoom, onCenterChange]);

  const handlePointerUp = useCallback((e) => {
    const s = dragState.current;
    dragState.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }, []);

  // ─── 滚轮缩放 ───
  const handleWheel = useCallback((e) => {
    if (!enableWheelZoom || !onZoomChange) return;
    e.preventDefault();
    // 向上滚（负 deltaY）= 放大
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Math.max(zoomMin, Math.min(zoomMax, zoom * factor));
    onZoomChange(newZoom);
  }, [enableWheelZoom, onZoomChange, zoom, zoomMin, zoomMax]);

  return (
    <div
      ref={containerRef}
      onPointerDown={canInteract && enablePan ? handlePointerDown : undefined}
      onPointerMove={canInteract && enablePan ? handlePointerMove : undefined}
      onPointerUp={canInteract && enablePan ? handlePointerUp : undefined}
      onPointerCancel={canInteract && enablePan ? handlePointerUp : undefined}
      onWheel={canInteract && enableWheelZoom ? handleWheel : undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: fillViewport ? `calc(100vh - ${fillOffsetPx}px)` : undefined,
        minHeight,
        maxHeight,
        flex: fillViewport ? undefined : 1,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        cursor: canInteract && enablePan ? (dragState.current ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none',  // 防手机端默认滚动 · 使拖拽生效
        userSelect: 'none'
      }}>
      {topBadge && (
        <div style={{
          position: 'absolute', top: 16, left: 20, zIndex: 5,
          pointerEvents: 'auto'
        }}>{topBadge}</div>
      )}

      <InkMap
        spots={spots}
        selectedId={selectedId}
        onSelect={onSelect}
        favs={favs}
        checkins={checkins}
        center={center}
        zoom={zoom}
        showRegionLabels={showRegionLabels}
      />

      {children}

      {showZoomControls && onZoomChange && (
        <div style={{
          position: 'absolute', right: 16, bottom: 16, zIndex: 6,
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onZoomChange(Math.min(zoomMax, zoom * 1.3)); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="放大"
            style={{
              width: 32, height: 32, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 16, color: 'var(--ink-2)',
              borderBottom: '1px solid var(--line)'
            }}
          >+</button>
          <button
            onClick={(e) => { e.stopPropagation(); onZoomChange(Math.max(zoomMin, zoom / 1.3)); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="缩小"
            style={{
              width: 32, height: 32, border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: 16, color: 'var(--ink-2)'
            }}
          >−</button>
          {hasChanged && onCenterChange && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onZoomChange(1);
                onCenterChange([104.5, 35]);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="重置视图"
              style={{
                width: 32, height: 24, border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 10, color: 'var(--ink-3)',
                borderTop: '1px solid var(--line)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.1em'
              }}
            >重置</button>
          )}
        </div>
      )}
    </div>
  );
}
