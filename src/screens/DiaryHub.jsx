import React, { useState } from 'react';
import { DiaryPanel } from './DiaryPanel.jsx';
import { CalendarPanel } from './CalendarPanel.jsx';

/* ═══════════════════════════════════════════════════════════════
   DiaryHub · 花历与日历
   ───────────────────────────────────────────────────────────────
   花信风顶级 tab · 两个子视图：
     花历   · 个人打卡 · 徽章 · 年鉴
     日历   · 花事时间视角 · 每月每候有什么花
   ═══════════════════════════════════════════════════════════════ */

export function DiaryHub({ flora, checkins, favs, onSelectSpot, onGotoFlower, onGoWrapped, initialTab = 'diary' }) {
  const [tab, setTab] = useState(initialTab);

  const TABS = [
    { key: 'diary',    label: '花 历',       sub: '个人足迹 · 徽章' },
    { key: 'calendar', label: '花事日历',    sub: '一年节候 · 花开何时' }
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
      {tab === 'diary' && (
        <DiaryPanel
          flora={flora}
          checkins={checkins}
          favs={favs}
          onSelectSpot={onSelectSpot}
          onGoWrapped={onGoWrapped}
        />
      )}
      {tab === 'calendar' && (
        <CalendarPanel
          flora={flora}
          onGotoFlower={onGotoFlower}
          onSelectSpot={onSelectSpot}
        />
      )}
    </div>
  );
}
