import React, { useState, useRef } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { HUAQIAN, drawHuaqian, todaysHuaqian } from '../data/huaqian.js';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   花签 · 竹签筒求签
   一天一次，抽完保存到 localStorage
   ═══════════════════════════════════════════════════════════════ */
export function MoodPanel({ flora, onSelectSpot, onShareMood }) {
  const todayKey = new Date().toLocaleDateString('zh-CN');
  const lastMood = read('lastMood');

  // 初始：若今日已抽，显示之前抽到的；否则显示"今日签"（固定种子）
  const [qian, setQian] = useState(() => {
    if (lastMood && lastMood.date === todayKey && lastMood.qianId != null) {
      return HUAQIAN.find(q => q.id === lastMood.qianId) || todaysHuaqian();
    }
    return todaysHuaqian();
  });
  const [drawn, setDrawn] = useState(() =>
    lastMood && lastMood.date === todayKey
  );
  const [shaking, setShaking] = useState(false);

  const handleDraw = () => {
    if (shaking) return;
    setShaking(true);
    setTimeout(() => {
      const q = drawHuaqian();
      setQian(q);
      setDrawn(true);
      write('lastMood', { date: todayKey, qianId: q.id });
      setShaking(false);
    }, 800);
  };

  // 跳转到对应花种的地图
  const handleJumpFlower = () => {
    if (!qian.sp) return;
    const target = flora.find(f => f.sp === qian.sp);
    if (target && onSelectSpot) onSelectSpot(target.id);
  };

  const tierBg = {
    '上上': 'var(--zhusha)',
    '上':   'var(--zhusha)',
    '中上': 'var(--jin)',
    '中':   'var(--qing)',
    '中下': 'var(--ink-3)',
    '下':   'var(--ink-3)',
    '下下': 'var(--ink-2)'
  }[qian.tier] || 'var(--ink)';

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="每日一签 · 竹签筒求签"
        title="花 签"
        sub="一日一签 · 一签一诗 · 以花观心"
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 32
      }}>
        {/* ─── 左：竹签筒 ─── */}
        <div style={{
          position: 'relative', background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)',
          padding: 40, minHeight: 480, display: 'grid', placeItems: 'center'
        }}>
          <svg viewBox="0 0 280 420"
            className={shaking ? 'hx-shake' : ''}
            style={{ width: 280, height: 420 }}>
            <defs>
              <linearGradient id="bamb" x1="0" x2="1">
                <stop offset="0%"   stopColor="oklch(0.55 0.06 100)"/>
                <stop offset="50%"  stopColor="oklch(0.70 0.08 100)"/>
                <stop offset="100%" stopColor="oklch(0.45 0.05 100)"/>
              </linearGradient>
            </defs>
            <ellipse cx="140" cy="350" rx="80" ry="14" fill="oklch(0.22 0.012 60 / 0.18)"/>
            <rect x="70" y="140" width="140" height="210" rx="6" fill="url(#bamb)"/>
            <line x1="70" y1="200" x2="210" y2="200" stroke="oklch(0.35 0.05 100)" strokeWidth="1.5"/>
            <line x1="70" y1="270" x2="210" y2="270" stroke="oklch(0.35 0.05 100)" strokeWidth="1.5"/>
            <ellipse cx="140" cy="140" rx="70" ry="12" fill="oklch(0.40 0.06 100)"/>
            {/* sticks */}
            {[-36, -18, 0, 20, 40].map((x, i) => (
              <g key={i}>
                <rect x={138 + x} y={i === 2 ? 40 : 60 + i * 4}
                  width="4" height={i === 2 ? 110 : 90}
                  fill={i === 2 ? 'var(--zhusha)' : 'oklch(0.80 0.04 90)'} rx="1"/>
                {i === 2 && <circle cx={140} cy={35} r="6" fill="var(--zhusha)"/>}
              </g>
            ))}
          </svg>

          <div style={{ position: 'absolute', top: 30, right: 30 }}>
            <Seal size="sm" rotate={8}>今日<br/>一签</Seal>
          </div>

          <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center' }}>
            <button className="btn zhusha"
              onClick={handleDraw}
              disabled={shaking}
              style={{
                padding: '12px 28px',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.3em',
                fontSize: 14
              }}>
              {shaking ? '摇 签 中' : (drawn ? '再 摇 一 次' : '摇  签')}
            </button>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 10 }}>
              {drawn ? '今日已抽 · 可重摇' : '轻摇竹筒 · 听命于风'}
            </div>
          </div>
        </div>

        {/* ─── 右：签面 ─── */}
        <div className="paper-bg" style={{
          position: 'relative', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)', padding: '40px 48px',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="cn-caps">第 {qian.id} 签 · {qian.tier}</div>
              <div className="serif" style={{ fontSize: 'clamp(22px, 3.5vw, 30px)',
                letterSpacing: '0.15em', marginTop: 8 }}>
                {qian.name}
              </div>
            </div>
            <div style={{
              display: 'inline-grid', placeItems: 'center',
              width: 56, height: 56, background: tierBg, color: 'var(--paper)',
              fontFamily: 'var(--font-serif)', fontSize: 14,
              letterSpacing: '0.1em', lineHeight: 1.1, textAlign: 'center',
              borderRadius: 2, transform: 'rotate(-4deg)',
              boxShadow: '0 1px 0 oklch(0.22 0.012 60 / 0.25)'
            }}>
              {qian.tier.split('').map((c, i) => <div key={i}>{c}</div>)}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--ink-3)', opacity: 0.3, margin: '24px 0' }}/>

          {/* 签诗 */}
          <div className="serif" style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            lineHeight: 2.2, letterSpacing: '0.12em',
            textAlign: 'center', padding: '12px 0'
          }}>
            {qian.poem.split('\n').map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)',
            fontFamily: 'var(--font-serif)', marginTop: 4 }}>
            — {qian.author}
          </div>

          <div style={{ height: 1, background: 'var(--ink-3)', opacity: 0.3, margin: '24px 0' }}/>

          {/* 签解 */}
          <div style={{ display: 'grid', gridTemplateColumns: '68px 1fr',
            gap: 16, rowGap: 14, fontSize: 13 }}>
            <div className="cn-caps" style={{ letterSpacing: '0.3em' }}>签 解</div>
            <div className="serif" style={{ lineHeight: 1.8, color: 'var(--ink-2)' }}>
              {qian.desc}
            </div>
            <div className="cn-caps" style={{ letterSpacing: '0.3em' }}>宜</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {qian.yi.map(t => <span key={t} className="pill zhusha">{t}</span>)}
            </div>
            <div className="cn-caps" style={{ letterSpacing: '0.3em' }}>忌</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {qian.ji.map(t => <span key={t} className="pill">{t}</span>)}
            </div>
          </div>

          <div style={{ flex: 1 }}/>

          <div style={{ display: 'flex', gap: 10, marginTop: 28, borderTop: '1px dotted var(--line)', paddingTop: 16 }}>
            <button className="btn" style={{ flex: 1 }}
              onClick={() => {
                if (onShareMood) {
                  onShareMood({
                    name: qian.name,
                    mood: qian.tier || qian.name,
                    poem: qian.poem,
                    meaning: qian.desc
                  });
                } else {
                  const txt = `花信风 · 第${qian.id}签 · ${qian.tier}\n${qian.name}\n\n${qian.poem}\n— ${qian.author}\n\n${qian.desc}`;
                  if (navigator.clipboard) navigator.clipboard.writeText(txt);
                }
              }}>
              <Icon.share/> 分签结缘
            </button>
            <button className="btn primary" style={{ flex: 1 }}
              onClick={handleJumpFlower}>
              <Icon.pin/> 访 {qian.sp}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
