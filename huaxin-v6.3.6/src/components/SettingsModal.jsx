import React from 'react';
import { Icon } from '../ui/atoms.jsx';

/* ═══════════════════════════════════════════════════════════════
   SettingsModal · 轻量设置面板
   ───────────────────────────────────────────────────────────────
   低调入口 · 通过 TopBar 齿轮图标唤起
   目前只有「长辈模式」一个开关 · 后续可扩展
   ═══════════════════════════════════════════════════════════════ */

export function SettingsModal({ open, onClose, seniorMode, onToggleSenior }) {
  if (!open) return null;

  return (
    <div onClick={onClose}
      className="hx-modal-enter"
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'color-mix(in oklch, var(--ink) 45%, transparent)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-lg)',
          padding: 28,
          width: 'min(420px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)'
        }}>

        {/* 头部 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 20
        }}>
          <div>
            <div className="cn-caps">花信风 · 设置</div>
            <div className="serif" style={{
              fontSize: 20,
              letterSpacing: '0.2em',
              marginTop: 4,
              color: 'var(--ink)'
            }}>阅 · 观 · 宜</div>
          </div>
          <button onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 22, color: 'var(--ink-3)', padding: 4, lineHeight: 1
            }}>×</button>
        </div>

        {/* 长辈模式开关 */}
        <SettingRow
          title="长 辈 模 式"
          desc="放大字号 · 按钮变大 · 减少动效"
          active={seniorMode}
          onToggle={onToggleSenior}
        />

        {/* 未来扩展区 · 占位 */}
        <div style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px dashed var(--line)',
          textAlign: 'center', color: 'var(--ink-3)',
          fontSize: 11, fontFamily: 'var(--font-serif)',
          letterSpacing: '0.15em', lineHeight: 1.7
        }}>
          更多设置 · 陆续而来
        </div>
      </div>
    </div>
  );
}


function SettingRow({ title, desc, active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        textAlign: 'left',
        background: active
          ? 'color-mix(in oklch, var(--zhusha) 8%, var(--bg-sunk))'
          : 'var(--bg-sunk)',
        border: active
          ? '1px solid var(--zhusha)'
          : '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        gap: 14,
        transition: 'var(--t-card)'
      }}>
      <div style={{ flex: 1 }}>
        <div className="serif" style={{
          fontSize: 16,
          letterSpacing: '0.2em',
          color: active ? 'var(--zhusha)' : 'var(--ink)',
          fontWeight: 600
        }}>{title}</div>
        <div style={{
          fontSize: 12, color: 'var(--ink-3)',
          marginTop: 4, fontFamily: 'var(--font-serif)',
          letterSpacing: '0.05em'
        }}>{desc}</div>
      </div>
      {/* iOS 风格开关 */}
      <div style={{
        width: 44, height: 26,
        borderRadius: 13,
        background: active ? 'var(--zhusha)' : 'var(--line)',
        position: 'relative',
        transition: 'background var(--dur-normal) var(--ease-out)',
        flexShrink: 0
      }}>
        <div style={{
          position: 'absolute',
          top: 2,
          left: active ? 20 : 2,
          width: 22, height: 22,
          borderRadius: '50%',
          background: 'var(--bg)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left var(--dur-normal) var(--ease-out)'
        }}/>
      </div>
    </button>
  );
}
