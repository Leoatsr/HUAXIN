import React, { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   OfflineIndicator · 离线状态提示
   ───────────────────────────────────────────────────────────────
   · 监听 navigator.onLine + online/offline 事件
   · 离线时顶部显示灰褐色条幅
   · 恢复在线时显示 2 秒绿色"已恢复"后隐藏
   ═══════════════════════════════════════════════════════════════ */

export function OfflineIndicator() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowRestored(true);
      setTimeout(() => setShowRestored(false), 2200);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowRestored(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online && !showRestored) return null;

  const isOnline = online;

  return (
    <div style={{
      position: 'fixed',
      top: 46,  // 位于 TopBar 之下
      left: 0, right: 0,
      zIndex: 99,
      padding: '8px 16px',
      background: isOnline
        ? 'color-mix(in oklch, #4a8a5a 12%, var(--bg-elev))'
        : 'color-mix(in oklch, var(--ink-3) 12%, var(--bg-elev))',
      borderBottom: isOnline
        ? '1px solid #4a8a5a'
        : '1px solid var(--ink-3)',
      color: isOnline ? '#3a6a4a' : 'var(--ink-2)',
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'var(--font-serif)',
      letterSpacing: '0.2em',
      animation: 'hx-fade-up 300ms ease-out',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }}>
      {isOnline ? (
        <>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8, borderRadius: '50%',
            background: '#4a8a5a'
          }}/>
          <span>网络已恢复</span>
        </>
      ) : (
        <>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--ink-3)',
            animation: 'hx-breathe 1.5s ease-in-out infinite'
          }}/>
          <span>暂无网络 · 你仍可浏览已缓存的花事</span>
        </>
      )}
    </div>
  );
}
