import React from 'react';
import { Icon } from '../ui/atoms.jsx';

/* ═══════════════════════════════════════════════════════════════
   StateViews · Loading / Empty / Error 的统一组件
   ───────────────────────────────────────────────────────────────
   统一前：5+ 处空态各写各的 · emoji/尺寸/opacity 差异巨大
   统一后：通过三个组件管控所有状态页 · 一次调整全站生效
   ═══════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────
   EmptyState · 空态
   Props:
     symbol    显示符号/emoji · 默认 🌸（花信风主符号）
     title     大字（如"行囊尚空"、"还没花友留言"）
     sub       解释性小字（如"先去地图收藏一些"）
     action    可选 · { label, onClick } · CTA 按钮
     variant   'full' 占整屏 · 'card' 卡片级 · 'inline' 小块（默认 card）
─────────────────────────────────────────────────────────────── */
export function EmptyState({
  symbol = '🌸',
  title,
  sub,
  action,
  variant = 'card'
}) {
  const symbolSize = variant === 'full' ? 64 : variant === 'card' ? 48 : 28;
  const titleSize  = variant === 'full' ? 22 : variant === 'card' ? 17 : 14;
  const subSize    = variant === 'full' ? 13 : 12;
  const padding    = variant === 'full' ? 48 : variant === 'card' ? 36 : 20;
  const minHeight  = variant === 'full' ? 'calc(100vh - 46px)' : 'auto';

  const content = (
    <div style={{
      textAlign: 'center',
      maxWidth: 400,
      margin: '0 auto'
    }}>
      <div style={{
        fontSize: symbolSize,
        opacity: 0.35,
        lineHeight: 1,
        marginBottom: 14
      }}>{symbol}</div>

      {title && (
        <div className="serif" style={{
          fontSize: titleSize,
          letterSpacing: '0.15em',
          color: 'var(--ink)',
          marginBottom: sub ? 8 : 0
        }}>{title}</div>
      )}

      {sub && (
        <div className="serif" style={{
          fontSize: subSize,
          color: 'var(--ink-3)',
          lineHeight: 1.8,
          letterSpacing: '0.05em'
        }}>{sub}</div>
      )}

      {action && (
        <button
          className="btn primary"
          onClick={action.onClick}
          style={{ marginTop: 22 }}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );

  if (variant === 'full') {
    return (
      <div style={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding
      }}>{content}</div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="card" style={{ padding, textAlign: 'center' }}>
        {content}
      </div>
    );
  }

  // inline
  return (
    <div style={{ padding, textAlign: 'center' }}>
      {content}
    </div>
  );
}


/* ───────────────────────────────────────────────────────────────
   LoadingIndicator · 加载中
   Props:
     size    'inline'（小 · 随 hint 显示）· 'full'（整屏）
     hint    提示文字 · 默认"花事载入中"
─────────────────────────────────────────────────────────────── */
export function LoadingIndicator({ size = 'inline', hint = '花事载入中' }) {
  const petalSize = size === 'full' ? 44 : 18;

  const petalSvg = (
    <svg viewBox="0 0 24 24" width={petalSize} height={petalSize} style={{
      animation: 'hx-sway 1.6s ease-in-out infinite',
      transformOrigin: '50% 70%'
    }}>
      <g opacity="0.8">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="12" cy="7.5" rx="3" ry="4.5"
            fill="var(--zhusha)"
            transform={`rotate(${a} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="2.5" fill="var(--jin)"/>
      </g>
    </svg>
  );

  if (size === 'full') {
    return (
      <div style={{
        minHeight: 'calc(100vh - 46px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        flexDirection: 'column',
        gap: 14
      }}>
        {petalSvg}
        <div className="mono" style={{
          fontSize: 11,
          letterSpacing: '0.25em',
          color: 'var(--ink-3)'
        }}>{hint}</div>
      </div>
    );
  }

  // inline
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 11,
      letterSpacing: '0.15em',
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }}>
      {petalSvg}
      <span>{hint}</span>
    </div>
  );
}


/* ───────────────────────────────────────────────────────────────
   ErrorInline · 局部错误提示
   Props:
     message    错误文字
     retry      可选 · 重试回调 → 显示"再试一次"按钮
     dismiss    可选 · 关闭回调 → 显示关闭图标
─────────────────────────────────────────────────────────────── */
export function ErrorInline({ message, retry, dismiss }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      background: 'color-mix(in oklch, var(--zhusha) 8%, var(--bg-elev))',
      border: '1px solid color-mix(in oklch, var(--zhusha) 25%, transparent)',
      borderLeft: '2.5px solid var(--zhusha)',
      borderRadius: 'var(--radius-md)',
      fontSize: 12,
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-serif)',
      lineHeight: 1.6
    }}>
      <span style={{
        color: 'var(--zhusha)',
        fontSize: 14,
        flexShrink: 0,
        fontWeight: 600
      }}>⚠</span>
      <span style={{ flex: 1 }}>{message}</span>
      {retry && (
        <button onClick={retry} style={{
          background: 'none',
          border: '1px solid var(--zhusha)',
          color: 'var(--zhusha)',
          padding: '3px 10px',
          borderRadius: 4,
          fontSize: 11,
          cursor: 'pointer',
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.05em'
        }}>再试</button>
      )}
      {dismiss && (
        <button onClick={dismiss} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: 'var(--ink-3)',
          fontSize: 14,
          lineHeight: 1
        }}>×</button>
      )}
    </div>
  );
}


/* ───────────────────────────────────────────────────────────────
   WeatherBadge · 天气数据状态小徽章
   - 展示于 header 右侧
   - 三态：loading（加载真实数据）· ok（真实数据已用）· fallback（本地估算）
─────────────────────────────────────────────────────────────── */
export function WeatherBadge({ status }) {
  if (status === 'idle' || !status) return null;

  const CONFIG = {
    loading:  { dot: 'var(--jin)',   label: '正在拉取天气',    blink: true  },
    ok:       { dot: 'var(--qing)',  label: '实时气象',        blink: false },
    fallback: { dot: 'var(--ink-3)', label: '本地估算',        blink: false }
  };

  const c = CONFIG[status];
  if (!c) return null;

  return (
    <div className="mono" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 10,
      color: 'var(--ink-3)',
      letterSpacing: '0.1em'
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: c.dot,
        animation: c.blink ? 'hx-breathe 1.4s ease-in-out infinite' : 'none',
        flexShrink: 0
      }}/>
      <span>{c.label}</span>
    </div>
  );
}
