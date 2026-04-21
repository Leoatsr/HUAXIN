import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '../utils/i18n-context.jsx';

/* ═══════════════════════════════════════════════════════════════
   LangSwitcher · 语言切换下拉
   8 种语言 · 点击按钮展开菜单 · 外部点击收起
   ═══════════════════════════════════════════════════════════════ */

const LANG_OPTIONS = [
  { code: 'zh', name: '中文',     flag: '🇨🇳' },
  { code: 'en', name: 'English',  flag: '🇬🇧' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
  { code: 'ko', name: '한국어',   flag: '🇰🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch',  flag: '🇩🇪' },
  { code: 'ru', name: 'Русский',  flag: '🇷🇺' },
  { code: 'th', name: 'ไทย',       flag: '🇹🇭' }
];

export function LangSwitcher({ onTravelGuide }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 外部点击关闭
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = LANG_OPTIONS.find(o => o.code === lang) || LANG_OPTIONS[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        className="btn sm ghost"
        title="Language / 语言"
        style={{ minWidth: 64 }}>
        <span style={{ fontSize: 13 }}>{current.flag}</span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
          {lang.toUpperCase()}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          overflow: 'hidden',
          minWidth: 170
        }}>
          {LANG_OPTIONS.map(opt => (
            <button key={opt.code}
              onClick={() => { setLang(opt.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                width: '100%',
                background: opt.code === lang
                  ? 'color-mix(in oklch, var(--zhusha) 8%, var(--bg))'
                  : 'transparent',
                border: 'none', cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={e => {
                if (opt.code !== lang) e.currentTarget.style.background = 'var(--bg-sunk)';
              }}
              onMouseLeave={e => {
                if (opt.code !== lang) e.currentTarget.style.background = 'transparent';
              }}>
              <span style={{ fontSize: 16 }}>{opt.flag}</span>
              <span style={{
                fontSize: 13,
                color: opt.code === lang ? 'var(--zhusha)' : 'var(--ink)'
              }}>{opt.name}</span>
              {opt.code === lang && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10, color: 'var(--zhusha)'
                }}>✓</span>
              )}
            </button>
          ))}

          {/* 入境指南入口（非中文时显示） */}
          {lang !== 'zh' && onTravelGuide && (
            <>
              <div style={{ borderTop: '1px solid var(--line-2)' }}/>
              <button onClick={() => { onTravelGuide(); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', width: '100%',
                  background: 'var(--bg-sunk)',
                  border: 'none', cursor: 'pointer',
                  textAlign: 'left'
                }}>
                <span style={{ fontSize: 15 }}>🌏</span>
                <span className="serif" style={{ fontSize: 12, color: 'var(--jin)' }}>
                  Travel Guide
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
