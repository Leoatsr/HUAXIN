import React, { useState, useEffect } from 'react';
import { Brandmark, FI, QP, LandscapeSVG, InkDivider } from './landing-atoms.jsx';
import { HX_24, HX_PILLARS } from './landing-data.js';

/* ═══════════════════════════════════════════════════════════════
   Nav · 固定顶栏 · 滚动时加深
   "下载" 按钮点击走 onEnter（进入 app）
   ═══════════════════════════════════════════════════════════════ */
export function Nav({ season, onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`hx-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="hx-nav__brand">
        <Brandmark size={24} color={QP[season].t} stamen="#f8e0a0"/>
        <span>花 信 风</span>
      </div>
      <div className="hx-nav__links">
        <a href="#huaxin">花信</a>
        <a href="#map">地图</a>
        <a href="#fortune">花签</a>
        <a href="#wiki">百科</a>
        <a href="#diary">花历</a>
      </div>
      <button className="hx-nav__cta" onClick={onEnter}>进 入</button>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Hero · 首屏 · 千里江山图 + 花信风大标题 + 双 CTA
   ═══════════════════════════════════════════════════════════════ */
export function Hero({ season, onEnter, onEnterMood }) {
  const now = new Date();
  const qp = QP[season];
  return (
    <header className="hx-hero">
      <div className="hx-hero__paper"/>
      <LandscapeSVG season={season} style={{ opacity: .55 }}/>
      <div className="hx-hero__grain"/>

      <div className="hx-hero__inner">
        <div className="hx-fade" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <div style={{ height: 1, width: 48, background: 'var(--gold)', opacity: .6 }}/>
          <span className="hx-eyebrow" style={{ fontSize: 11, letterSpacing: 6 }}>
            花信风 · HuaXinFeng
          </span>
          <div style={{ height: 1, width: 48, background: 'var(--gold)', opacity: .6 }}/>
        </div>

        <h1 className="hx-fade-2 hx-display" style={{ letterSpacing: 'clamp(10px, 1.2vw, 22px)' }}>
          花 信 风
        </h1>

        <div className="hx-fade-2" style={{ marginTop: 18, fontSize: 13, letterSpacing: 5, color: 'var(--ink-soft)', fontWeight: 500 }}>
          A WIND THAT ARRIVES WITH EACH FLOWER'S APPOINTED SEASON
        </div>

        <div className="hx-fade-3 hx-verse-lg" style={{ marginTop: 48, maxWidth: 680 }}>
          应花期而来的风也<br/>
          <span style={{ color: 'var(--ink-mute)', fontSize: '.85em' }}>一候一花，二十四番，应候而至</span>
        </div>

        <div className="hx-fade-3" style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-soft)', letterSpacing: 3 }}>
          — 南朝 · 宗懔 《荆楚岁时记》
        </div>

        <div className="hx-fade-4" style={{ marginTop: 60, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="hx-cta" onClick={onEnter} style={{ border: 'none' }}>
            入&nbsp;&nbsp;山
            <span style={{ fontSize: 14, color: 'var(--gold)', letterSpacing: 0 }}>→</span>
          </button>
          <button className="hx-cta hx-cta--ghost" onClick={onEnterMood} style={{ border: '1.5px solid var(--line-cool)' }}>
            今&nbsp;日&nbsp;得&nbsp;签
          </button>
        </div>

        {/* 此刻 strip */}
        <div className="hx-fade-4" style={{ marginTop: 70, display: 'flex', alignItems: 'center', gap: 16, padding: '10px 22px', background: 'rgba(250,245,237,.6)', backdropFilter: 'blur(8px)', borderRadius: 30, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 18 }}>{qp.emoji}</span>
          <span style={{ fontSize: 12, letterSpacing: 3, color: 'var(--ink-mute)' }}>
            此刻 · {now.getMonth() + 1}月{now.getDate()}日 · 谷雨 · 花事正盛
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: qp.t, boxShadow: `0 0 8px ${qp.t}` }}/>
        </div>
      </div>

      {/* 向下滚动提示 */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: 4, writingMode: 'vertical-rl', opacity: .6 }}>
        向 下 · 随 风
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   二十四番花信风 · 8 节气 × 3 候 grid
   ═══════════════════════════════════════════════════════════════ */
export function HuaxinSection() {
  const [activeJq, setActiveJq] = useState('all');
  const jieqis = ['all', ...Array.from(new Set(HX_24.map(h => h.jq)))];
  const currentIdx = 23; // 谷雨二候 · 荼靡（当下时节）

  return (
    <section id="huaxin" className="hx-section">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="hx-eyebrow-bracket" style={{ marginBottom: 20 }}>花 信</div>
        <h2 className="hx-display">二 十 四 番</h2>
        <div className="hx-eng-sub" style={{ marginTop: 14 }}>THE TWENTY-FOUR FLOWER WINDS</div>
        <InkDivider glyph="应 候 而 至" width={280}/>
        <p style={{ fontSize: 13, lineHeight: 2, color: 'var(--ink-mute)', letterSpacing: 2, maxWidth: 560, margin: '0 auto' }}>
          自小寒至谷雨，凡八气、二十四候，每候应一花。<br/>
          一花开罢，一风吹来——是为花信风。
        </p>
      </div>

      {/* 节气 filter */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', margin: '40px 0 28px' }}>
        {jieqis.map(j => (
          <button key={j} className={`hx-season-chip ${activeJq === j ? 'is-active' : ''}`}
            onClick={() => setActiveJq(j)}>
            {j === 'all' ? '全部' : j}
          </button>
        ))}
      </div>

      <div className="hx-24grid">
        {HX_24.map(h => {
          const dim = activeJq !== 'all' && h.jq !== activeJq;
          return (
            <div key={h.n} className={`hx-24cell ${h.n === currentIdx ? 'is-current' : ''}`}
              style={{ opacity: dim ? .35 : 1 }}>
              <div className="hx-24cell__index">№ {String(h.n).padStart(2, '0')}</div>
              <div className="hx-24cell__jieqi">{h.jq} · {h.hou_label}</div>
              <div className="hx-24cell__name" style={{ color: h.n === currentIdx ? 'var(--ink)' : 'var(--ink-body)' }}>
                {h.name}
              </div>
              <div className="hx-24cell__flower">
                <FI sp={h.sp} sz={36} co={h.c}/>
              </div>
              <div className="hx-24cell__hou">
                {h.n === currentIdx && <span style={{ color: 'var(--vermillion)', fontWeight: 700, letterSpacing: 3 }}>· 此 刻 ·</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--ink-soft)', letterSpacing: 3 }}>
        【雅事】春风二十四番，应候而至，踏青赏花正当时
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Pillars · 三栏意境 · 候 · 诗 · 山
   ═══════════════════════════════════════════════════════════════ */
export function PillarsSection() {
  return (
    <section className="hx-section hx-section--tight" style={{ background: 'linear-gradient(180deg, transparent, rgba(235,224,208,.35) 40%, transparent)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        {HX_PILLARS.map((p, i) => (
          <div key={p.title} style={{ padding: '56px 36px', borderLeft: i > 0 ? '1px solid var(--line)' : 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, right: 28, fontSize: 72, fontWeight: 900, color: 'var(--gold)', opacity: .12, letterSpacing: 0, lineHeight: 1 }}>{p.glyph}</div>
            <div className="hx-eyebrow-bracket" style={{ marginBottom: 18 }}>{p.eyebrow}</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, letterSpacing: 6, color: 'var(--ink)', margin: '0 0 18px', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
              {p.title}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 2, color: 'var(--ink-mute)', letterSpacing: 1.5, margin: 0 }}>
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
