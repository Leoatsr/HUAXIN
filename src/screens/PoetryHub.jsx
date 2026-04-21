import React, { useState } from 'react';
import { PoetFootprintPanel } from './PoetFootprintPanel.jsx';
import { PoemDiscoveryPanel } from './PoemDiscoveryPanel.jsx';
import { DynastyGardenPanel } from './DynastyGardenPanel.jsx';

/* ═══════════════════════════════════════════════════════════════
   PoetryHub · 诗词与花
   ───────────────────────────────────────────────────────────────
   花信风顶级 tab · 三个子视图：
     诗踪      · 跟着诗人足迹（时间+地图+诗）
     寻诗      · 以诗寻景（12 首精选 → 景点）
     朝代花园  · 诗人关系空间化表达
   ═══════════════════════════════════════════════════════════════ */

export function PoetryHub({ flora, onBack, onSelectSpot, initialTab = 'footprint' }) {
  const [tab, setTab] = useState(initialTab);

  const TABS = [
    { key: 'footprint', label: '诗 踪',       sub: '跟着诗人的足迹'      },
    { key: 'discovery', label: '寻 诗',       sub: '以诗寻景'            },
    { key: 'garden',    label: '朝代花园',    sub: '诗人之间的关系'       }
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>

      {/* hub 顶部 tab 栏 */}
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
      {tab === 'footprint' && (
        <PoetFootprintPanel
          flora={flora}
          onBack={onBack}
          onSelectSpot={onSelectSpot}
          onGoNetwork={() => setTab('garden')}
        />
      )}
      {tab === 'discovery' && (
        <PoemDiscoveryPanel
          flora={flora}
          onBack={onBack}
          onSelectSpot={onSelectSpot}
        />
      )}
      {tab === 'garden' && (
        <DynastyGardenPanel
          onBack={onBack}
        />
      )}
    </div>
  );
}
