import React from 'react';
import { Icon } from '../ui/atoms.jsx';

/* ═══════════════════════════════════════════════════════════════
   ScreenHeader · 统一的屏幕头部组件
   ───────────────────────────────────────────────────────────────
   取代此前 18 屏各写各的头部。统一：
     · 外层 padding：clamp(24,4vw,40) clamp(24,5vw,48) 16 （最规范的一版）
     · 眉批 eyebrow：cn-caps · 10px · 字距 0.35em · 灰褐色
     · 主标题 title：serif · clamp(28,4vw,36) · 字距 0.25em · var(--ink)
     · 副标 sub：serif · 13px · var(--ink-2) · 字距 0.05em
     · 右上返回按钮：标准 btn（可选）
   
   Props:
     eyebrow  上方小字（如 "行前筹谋 · 按花而行"）
     title    主标题（如 "花事行程"）· 建议 2-4 字
     sub      下方副标（可选）
     onBack   返回按钮回调（传了才显示）
     backLabel 返回按钮文字（默认"返回"）
     right    右侧附加节点（可替换或增强返回按钮）
   ═══════════════════════════════════════════════════════════════ */
export function ScreenHeader({ eyebrow, title, sub, onBack, backLabel = '返回', right }) {
  return (
    <div style={{
      padding: 'clamp(24px, 4vw, 40px) clamp(24px, 5vw, 48px) 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 16
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        {eyebrow && <div className="cn-caps">{eyebrow}</div>}
        <div className="serif" style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          letterSpacing: '0.25em',
          marginTop: eyebrow ? 6 : 0,
          color: 'var(--ink)',
          lineHeight: 1.15
        }}>{title}</div>
        {sub && (
          <div className="serif" style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            marginTop: 8,
            letterSpacing: '0.05em',
            lineHeight: 1.6
          }}>{sub}</div>
        )}
      </div>
      {right}
      {onBack && !right && (
        <button className="btn" onClick={onBack}>
          <Icon.chev d="left"/> {backLabel}
        </button>
      )}
    </div>
  );
}
