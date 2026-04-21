import React from 'react';
import { Icon } from '../ui/atoms.jsx';
import { SPECIES_ETIQUETTE, SEASON_TIPS } from '../data/flora-etiquette.js';

/* ═══════════════════════════════════════════════════════════════
   EtiquetteTips · 雅事贴士
   ───────────────────────────────────────────────────────────────
   按花种 + 季节的「通用规则」生成，不涉及具体景点的事实声称：
     · 拍摄光线（古今摄影师通识）
     · 服饰建议（色彩对比学）
     · 观赏节律（植物学事实）
     · 同框诗意（古诗引用）
     · 季节装备（气象通识）

   Props:
     spot  完整景点对象
   ═══════════════════════════════════════════════════════════════ */
export function EtiquetteTips({ spot }) {
  if (!spot) return null;

  const species = SPECIES_ETIQUETTE[spot.sp];
  const season = SEASON_TIPS[spot.s];

  // 两者都没有就不展示（不输出空块）
  if (!species && !season) return null;

  return (
    <section style={{
      padding: 20,
      borderBottom: '1px solid var(--line-2)',
      background: 'var(--paper)'
    }}>
      <div className="cn-caps" style={{ marginBottom: 12 }}>
        雅 事 贴 士 · {spot.sp}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {species?.light && (
          <TipRow icon="◐" label="最佳光线" text={species.light}/>
        )}
        {species?.tempo && (
          <TipRow icon="⌁" label="观赏节律" text={species.tempo}/>
        )}
        {species?.dress && (
          <TipRow icon="◇" label="服饰建议" text={species.dress}/>
        )}
        {season?.dress && (
          <TipRow icon="☂" label={`${seasonLabel(spot.s)} · 装备`} text={season.dress}/>
        )}
        {species?.note && (
          <TipRow icon="「」" label="雅人深致" text={species.note} italic/>
        )}
      </div>

      <div className="mono" style={{
        marginTop: 10,
        fontSize: 9,
        color: 'var(--ink-3)',
        letterSpacing: '0.1em',
        textAlign: 'center'
      }}>
        此处皆为通用建议 · 具体花况请查实况游记
      </div>
    </section>
  );
}

function TipRow({ icon, label, text, italic }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0,
        width: 20,
        fontSize: 12,
        color: 'var(--jin, var(--zhusha))',
        textAlign: 'center',
        fontFamily: 'var(--font-serif)',
        lineHeight: 1.8
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="cn-caps" style={{
          fontSize: 10,
          color: 'var(--ink-3)',
          marginBottom: 2
        }}>{label}</div>
        <div className="serif" style={{
          fontSize: 13,
          color: 'var(--ink-2)',
          lineHeight: 1.7,
          letterSpacing: '0.05em',
          fontStyle: italic ? 'italic' : 'normal'
        }}>{text}</div>
      </div>
    </div>
  );
}

function seasonLabel(s) {
  return { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[s] || '时节';
}
