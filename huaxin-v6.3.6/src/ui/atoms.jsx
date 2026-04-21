import React from 'react';

/* ─── Icons (minimal stroke, 14×14) ─────────────────────────── */
export const Icon = {
  search:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  map:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>,
  bookmark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>,
  diary:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z"/><path d="M5 4v14M9 8h6M9 12h6"/></svg>,
  wind:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h9"/></svg>,
  sparkle:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4"/></svg>,
  plus:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>,
  minus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14"/></svg>,
  close:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  share:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/></svg>,
  heart: (filled) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></svg>,
  pin:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  thermo:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z"/></svg>,
  cloud:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 20 10a4 4 0 0 1-1 8H7Z"/></svg>,
  play:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>,
  menu:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  globe:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
  check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5 9-10"/></svg>,
  flower:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8V4M12 14.2V20M9.8 12H4M14.2 12H20M10.5 10.5 6.5 6.5M13.5 13.5l4 4M13.5 10.5l4-4M10.5 13.5l-4 4"/></svg>,
  chev: (d = 'right') => {
    const r = { right: 0, left: 180, up: 270, down: 90 }[d];
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ transform: `rotate(${r}deg)` }}><path d="m9 6 6 6-6 6"/></svg>;
  }
};

/* ─── 印章（朱砂红） ─────────────────────────── */
export function Seal({ children, size = 'md', rotate = -4 }) {
  const cls = size === 'sm' ? 'seal sm' : 'seal';
  return <div className={cls} style={{ transform: `rotate(${rotate}deg)` }}>{children}</div>;
}

/* ─── 条纹占位符 ─────────────────────────────── */
export function Placeholder({ label, aspect = '4/3', style = {} }) {
  return (
    <div style={{
      aspectRatio: aspect,
      background: 'repeating-linear-gradient(135deg, oklch(0.94 0.008 80), oklch(0.94 0.008 80) 6px, oklch(0.97 0.006 80) 6px, oklch(0.97 0.006 80) 12px)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--ink-3)',
      letterSpacing: '0.04em',
      ...style,
    }}>{label}</div>
  );
}

/* ─── 地图标记 · 花瓣点 ─────────────────────────────── */
export function PetalMark({ active = false, peak = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      {peak && <circle cx="7" cy="7" r="6" fill="var(--zhusha)" opacity="0.15"/>}
      <circle cx="7" cy="7" r={active ? 5 : 3}
        fill={active || peak ? 'var(--zhusha)' : 'var(--ink-3)'}
        opacity={active ? 1 : peak ? 0.9 : 0.55}
      />
      {active && <circle cx="7" cy="7" r="6" fill="none" stroke="var(--zhusha)" strokeWidth="0.8" opacity="0.5"/>}
    </svg>
  );
}

/* ─── 状态徽章 ─────────────────────────────── */
export function StatusPill({ st, l }) {
  // st: 盛花期/初花期/含苞待放/积温中/末花期/已谢
  const cls = l >= 3 ? 'pill zhusha' : l === 2 ? 'pill qing' : 'pill';
  return <span className={cls}>{st}</span>;
}
