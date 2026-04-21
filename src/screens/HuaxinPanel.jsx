import React, { useMemo } from 'react';
import { Icon, Seal, PetalMark } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import {
  HUAXIN_24, HUAXIN_POEMS, HUAXIN_TO_FLORA_SP, currentHouIndex
} from '../data/huaxin.js';

/* ═══════════════════════════════════════════════════════════════
   二十四番花信风
   ═══════════════════════════════════════════════════════════════ */
export function HuaxinPanel({ flora, onSelectSpot }) {
  const { jq: activeJq, hou: activeHou, totalIdx } = currentHouIndex();
  const safeJq = activeJq >= 0 ? activeJq : 7;
  const safeHou = activeHou >= 0 ? activeHou : 1;
  const safeTotal = safeJq * 3 + safeHou;

  const currentJq = HUAXIN_24[safeJq];
  const activeFlower = currentJq.f[safeHou];
  const poem = HUAXIN_POEMS[activeFlower];

  // 匹配到的真实景点
  const relatedSpots = useMemo(() => {
    const candidateSp = HUAXIN_TO_FLORA_SP[activeFlower] || [activeFlower];
    return flora
      .filter(f => candidateSp.some(sp => f.sp === sp))
      .sort((a, b) => (b._st?.l || 0) - (a._st?.l || 0))
      .slice(0, 8);
  }, [flora, activeFlower]);

  const relatedCount = useMemo(() => {
    const candidateSp = HUAXIN_TO_FLORA_SP[activeFlower] || [activeFlower];
    return flora.filter(f => candidateSp.some(sp => f.sp === sp)).length;
  }, [flora, activeFlower]);

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--paper)' }}>
      <ScreenHeader
        eyebrow="二十四番 · 八气二十四候"
        title="花 信 风"
        sub="小寒至谷雨 · 八节气 · 每五日一候 · 每候一花信"
        right={
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            今日 · 第 {safeTotal + 1} 候
          </div>
        }
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>
      <div style={{
        position: 'relative',
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 36px 36px',
        overflow: 'hidden'
      }}>
        {/* 风线装饰 */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.12 }}
          viewBox="0 0 1400 400" preserveAspectRatio="none">
          <path d="M0 80 C 300 40, 700 120, 1400 60" fill="none" stroke="var(--qing)" strokeWidth="1"/>
          <path d="M0 200 C 400 150, 900 260, 1400 180" fill="none" stroke="var(--qing)" strokeWidth="1"/>
          <path d="M0 320 C 300 280, 800 360, 1400 300" fill="none" stroke="var(--qing)" strokeWidth="1"/>
        </svg>

      <div style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        margin: '0 -20px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 4, position: 'relative', minWidth: 700
        }}>
          {HUAXIN_24.map((jq, i) => (
            <div key={jq.jq} style={{ textAlign: 'center' }}>
              <div style={{
                padding: '10px 0',
                borderBottom: `1px solid ${i === safeJq ? 'var(--zhusha)' : 'var(--line)'}`
              }}>
                <div className="serif" style={{
                  fontSize: 18, letterSpacing: '0.12em',
                  color: i === safeJq ? 'var(--zhusha)' : 'var(--ink)'
                }}>{jq.jq}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>
                  {jq.date}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
                {jq.f.map((flower, j) => {
                  const isActive = i === safeJq && j === safeHou;
                  const isPast = i < safeJq || (i === safeJq && j < safeHou);
                  return (
                    <div key={j} style={{
                      padding: '10px 6px',
                      background: isActive ? 'var(--zhusha)' :
                        (isPast ? 'var(--bg-sunk)' : 'transparent'),
                      color: isActive ? 'var(--paper)' :
                        (isPast ? 'var(--ink-3)' : 'var(--ink)'),
                      borderRadius: 'var(--radius-sm)',
                      border: isActive ? 'none' : '1px solid var(--line-2)'
                    }}>
                      <div className="mono" style={{ fontSize: 9, opacity: 0.7 }}>
                        {['初','二','三'][j]}候
                      </div>
                      <div className="serif" style={{ fontSize: 13, marginTop: 2 }}>
                        {flower}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>

        <div style={{ position: 'absolute', bottom: 14, right: 18 }}>
          <Seal size="sm" rotate={-3}>花信<br/>有时</Seal>
        </div>
      </div>

      {/* 当前花信三栏详情 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20, marginTop: 24
      }}>
        {/* 当前花信 */}
        <div className="card" style={{ padding: 24 }}>
          <div className="cn-caps">当前花信 · {safeTotal + 1}/24</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="serif" style={{ fontSize: 40, letterSpacing: '0.1em' }}>
              {activeFlower}
            </span>
            <span className="serif" style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              {currentJq.jq} · {['初','二','三'][safeHou]}候
            </span>
          </div>
          {poem && (
            <>
              <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
                <span className="pill qing">花语 · {poem.lang}</span>
              </div>
              <div className="serif" style={{ fontSize: 13, color: 'var(--ink-2)',
                marginTop: 18, lineHeight: 1.9 }}>
                全国 <strong style={{ color: 'var(--zhusha)' }}>{relatedCount}</strong> 处「{activeFlower}」正应时节。
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn primary" onClick={() => onSelectSpot && relatedSpots[0] && onSelectSpot(relatedSpots[0].id)}>
              查看地图 · {relatedCount} 处
            </button>
          </div>
        </div>

        {/* 关联景点 */}
        <div className="card" style={{ padding: 24 }}>
          <div className="cn-caps">关联景点 · 盛放中</div>
          {relatedSpots.length === 0 && (
            <div style={{ padding: '16px 0', color: 'var(--ink-3)', fontSize: 13 }}>
              暂无对应景点
            </div>
          )}
          {relatedSpots.map((s, i) => (
            <button key={s.id} onClick={() => onSelectSpot && onSelectSpot(s.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: '12px 0', gap: 10,
                borderBottom: i < relatedSpots.length - 1 ? '1px dotted var(--line)' : 'none',
                width: '100%', border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left'
              }}>
              <PetalMark peak={s._st && s._st.l >= 4}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 13, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {s._st?.st || '—'} · {s.rg}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--jin)' }}>
                {s._pred ? (s._pred.confidence + '%') : ''}
              </span>
            </button>
          ))}
        </div>

        {/* 诗词 */}
        {poem && (
          <div className="card paper-bg" style={{ padding: 24 }}>
            <div className="cn-caps">诗词</div>
            <div className="serif" style={{ fontSize: 14, lineHeight: 2.1,
              marginTop: 12, letterSpacing: '0.08em' }}>
              {poem.poem.split('\n').map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-3)',
              fontFamily: 'var(--font-serif)' }}>
              — {poem.author}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
