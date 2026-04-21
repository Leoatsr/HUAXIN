import React from 'react';
import { Icon } from './atoms.jsx';
import { currentHouIndex, HUAXIN_24 } from '../data/huaxin.js';

/* ═══ 顶部导航 · 4 tab + 日期/候/返回首页 + 右侧 slot ═══ */
export function TopBar({ screen, onNav, season, onSeasonChange, rightSlot, onSettings, musicSlot }) {
  const { jq, hou, totalIdx } = currentHouIndex();
  const currentJq = jq >= 0 ? HUAXIN_24[jq] : null;
  const houName = hou >= 0 ? ['初候','二候','三候'][hou] : '';
  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  const TABS = [
    ['map',     '花事地图'],
    ['huaxin',  '二十四番'],
    ['poetry',  '诗词与花', true],  // 第 3 项加灵魂 flag
    ['mood',    '花  签'],
    ['diary',   '花  历']
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 46,
      background: 'color-mix(in oklch, var(--bg) 92%, transparent)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--line-2)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 18, fontSize: 13
    }}>
      {/* 品牌 */}
      <button onClick={() => onNav('landing')}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-serif)', fontSize: 15, letterSpacing: '0.15em',
          color: 'var(--ink)', padding: 0 }}>
        花信风
      </button>
      <span style={{ width: 1, height: 16, background: 'var(--line)' }}/>

      {/* 主导航 */}
      {TABS.map(([k, l, soul]) => (
        <button key={k} onClick={() => onNav(k)}
          className="serif"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: screen === k
              ? 'var(--zhusha)'
              : soul
                ? 'var(--jin)'
                : 'var(--ink-2)',
            fontSize: 13, letterSpacing: '0.12em',
            padding: '4px 0',
            borderBottom: screen === k
              ? '1px solid var(--zhusha)'
              : soul
                ? '1px dotted var(--jin)'
                : '1px solid transparent',
            position: 'relative',
            fontWeight: soul ? 600 : 400
          }}>
          {soul && <span style={{
            position: 'absolute',
            top: -6, right: -10,
            fontSize: 8,
            color: 'var(--jin)'
          }}>✦</span>}
          {l}
        </button>
      ))}

      <div style={{ flex: 1 }}/>

      {/* 音乐播放器 · topbar 嵌入 */}
      {musicSlot}

      {/* 右侧：季节切换 */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg-sunk)', borderRadius: 6, padding: 2 }}>
        {[['spring','春'],['summer','夏'],['autumn','秋'],['winter','冬']].map(([k, l]) => (
          <button key={k} onClick={() => onSeasonChange(k)}
            className="serif"
            style={{
              background: season === k ? 'var(--zhusha)' : 'transparent',
              color: season === k ? 'var(--paper)' : 'var(--ink-3)',
              border: 'none', cursor: 'pointer',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 11, letterSpacing: '0.1em'
            }}>{l}</button>
        ))}
      </div>

      {/* 日期 · 候 */}
      {currentJq && (
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
          {dateStr} · {currentJq.jq}{houName}
        </span>
      )}

      {/* 设置按钮 · 齿轮 · 低调 */}
      {onSettings && (
        <button onClick={onSettings}
          title="设置"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, color: 'var(--ink-3)',
            display: 'flex', alignItems: 'center',
            transition: 'color var(--dur-fast) var(--ease-out)'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      )}

      {/* 右侧 slot · 通常是 LangSwitcher */}
      {rightSlot && (
        <>
          <span style={{ width: 1, height: 16, background: 'var(--line)' }}/>
          {rightSlot}
        </>
      )}
    </div>
  );
}
