import React, { useState } from 'react';
import { MoodPanel } from './MoodPanel.jsx';
import { WikiPanel } from './WikiPanel.jsx';

/* ═══════════════════════════════════════════════════════════════
   MoodHub · 花签与花卉
   ───────────────────────────────────────────────────────────────
   花信风顶级 tab · 两个子视图：
     花签   · 竹签筒抽签 · 一日一签
     百科   · 74 种花的科普详情
   ═══════════════════════════════════════════════════════════════ */

export function MoodHub({ flora, onSelectSpot, onShareMood, onGotoFlower, initialTab = 'mood', initialSp = null }) {
  const [tab, setTab] = useState(initialTab);

  const TABS = [
    { key: 'mood', label: '花 签',   sub: '一日一签 · 花语寄情' },
    { key: 'wiki', label: '百 科',   sub: '74 种花 · 科属意象' }
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>

      {/* hub tab 栏 */}
      <div style={{
        position: 'sticky',
        top: 46, zIndex: 50,
        background: 'color-mix(in oklch, var(--bg) 92%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--line-2)',
        padding: '14px clamp(24px, 5vw, 48px) 0'
      }}>
        <div style={{
          display: 'flex',
          gap: 28,
          alignItems: 'baseline'
        }}>
          {TABS.map(t => {
            const active = t.key === tab;
            return (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 14px',
                  color: active ? 'var(--zhusha)' : 'var(--ink-2)',
                  borderBottom: active
                    ? '2px solid var(--zhusha)'
                    : '2px solid transparent',
                  transition: 'var(--t-button)',
                  textAlign: 'left',
                  marginBottom: -1
                }}>
                <div className="serif" style={{
                  fontSize: 17,
                  letterSpacing: '0.2em',
                  fontWeight: active ? 700 : 500
                }}>
                  {t.label}
                </div>
                <div className="mono" style={{
                  fontSize: 10,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.15em',
                  marginTop: 3
                }}>
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* tab 内容 */}
      {tab === 'mood' && (
        <MoodPanel
          flora={flora}
          onSelectSpot={onSelectSpot}
          onShareMood={onShareMood}
        />
      )}
      {tab === 'wiki' && (
        <WikiPanel
          flora={flora}
          initialSp={initialSp}
          onGotoFlower={onGotoFlower}
        />
      )}
    </div>
  );
}
