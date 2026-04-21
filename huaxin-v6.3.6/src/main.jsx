import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ═══════════════════════════════════════════════════════════════
// Service Worker 注册 · 支持 PWA 和离线
// 只在 production 注册（避免 vite dev 的 hot reload 冲突）
// ═══════════════════════════════════════════════════════════════
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[花信风] SW 已注册', reg.scope);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[花信风] 发现新版本，下次刷新生效');
            }
          });
        });
      })
      .catch((err) => console.warn('[花信风] SW 注册失败', err));
  });
}
