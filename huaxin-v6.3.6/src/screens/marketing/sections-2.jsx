import React, { useState, useRef, useEffect } from 'react';
import { Brandmark, FI, QP, LandscapeSVG, HxSeal, InkDivider } from './landing-atoms.jsx';
import { HX_WIKI, HX_BADGES, HX_STATS, HX_24, FORTUNES } from './landing-data.js';

/* ═══════════════════════════════════════════════════════════════
   MapSection · 左图文 · 右 iPhone mockup
   ═══════════════════════════════════════════════════════════════ */
export function MapSection({ season }) {
  const qp = QP[season];
  const spots = [
    { n: '杭州 · 太子湾',   sp: '樱花', c: '#e8a0b0', x: 150, y: 200, status: '盛花', dist: 2.4 },
    { n: '苏州 · 拙政园',   sp: '海棠', c: '#e88898', x: 210, y: 280, status: '始盛', dist: 12 },
    { n: '南京 · 玄武湖',   sp: '梅花', c: '#d87080', x: 180, y: 360, status: '盛花', dist: 28 },
    { n: '扬州 · 瘦西湖',   sp: '桃花', c: '#e87088', x: 260, y: 340, status: '末花', dist: 45 },
    { n: '洛阳 · 王城公园', sp: '牡丹', c: '#c04860', x: 100, y: 310, status: '待放', dist: 120 }
  ];

  return (
    <section id="map" className="hx-section hx-section--wide" style={{ padding: '120px 0', overflow: 'hidden' }}>
      <div className="hx-map-grid" style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(24px, 6vw, 96px)', display: 'grid', gridTemplateColumns: '1fr minmax(380px, 480px)', gap: 80, alignItems: 'center' }}>

        {/* 左栏文案 */}
        <div>
          <div className="hx-eyebrow-bracket" style={{ marginBottom: 22 }}>山 水</div>
          <h2 className="hx-display-sm" style={{ letterSpacing: 10 }}>
            一张会呼吸的<br/>中国 · 赏花地图
          </h2>
          <InkDivider width={120}/>
          <p style={{ fontSize: 15, lineHeight: 2.1, color: 'var(--ink-mute)', letterSpacing: 1.5, maxWidth: 520 }}>
            以《千里江山图》为底色，以花信为坐标，收录四百零四处赏花地——从岭南木棉到东北冷杉。
          </p>
          <p style={{ fontSize: 15, lineHeight: 2.1, color: 'var(--ink-mute)', letterSpacing: 1.5, maxWidth: 520, marginTop: 6 }}>
            每一枚花标，实时调取当地积温、降水、日照，换算剩余积温差——预告何日花开，误差不过三日。
          </p>

          <div style={{ display: 'flex', gap: 32, marginTop: 42, flexWrap: 'wrap' }}>
            {[['404', '赏花景点'], ['34', '省份'], ['±3日', '物候精度']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--ink)', letterSpacing: 3, lineHeight: 1, textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', letterSpacing: 4, marginTop: 8, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右栏 iPhone mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {/* Halo 光晕 */}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${qp.t}20, transparent 70%)`, zIndex: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}/>

          <div className="hx-phone" style={{ position: 'relative', zIndex: 1 }}>
            <div className="hx-phone__notch"/>
            <div className="hx-phone__screen">
              {/* 状态栏 */}
              <div style={{ position: 'absolute', top: 14, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 30px', fontSize: 13, fontWeight: 700, color: 'var(--ink)', zIndex: 21 }}>
                <span>9:41</span>
                <span style={{ fontSize: 12 }}>● ● ● ▪</span>
              </div>

              {/* 地图背景 */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(155deg, #f4ece0, #ebe0d0)' }}>
                <LandscapeSVG season={season} style={{ opacity: .5 }}/>

                {/* 省份轮廓（暗纹） */}
                <svg viewBox="0 0 340 720" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35 }}>
                  <path d="M60,200 Q100,180 150,200 Q200,180 260,210 Q290,260 270,320 Q250,380 200,400 Q150,410 110,390 Q70,360 60,300 Z" fill="none" stroke="var(--mountain)" strokeWidth="0.8" strokeDasharray="2,3"/>
                  <path d="M90,400 Q140,410 210,420 Q270,430 280,480 Q260,520 200,520 Q140,510 110,480 Q85,450 90,400 Z" fill="none" stroke="var(--mountain)" strokeWidth="0.8" strokeDasharray="2,3"/>
                </svg>

                {/* 景点 markers */}
                {spots.map((s, i) => (
                  <button key={i} style={{
                    position: 'absolute', left: s.x, top: s.y, transform: 'translate(-50%,-100%)',
                    width: 34, height: 34, borderRadius: '50%',
                    background: i === 0 ? s.c : 'rgba(250,245,237,.92)',
                    border: `2px solid ${s.c}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: `0 2px 8px ${s.c}50`
                  }}>
                    <FI sp={s.sp} sz={18} co={i === 0 ? '#fff' : s.c}/>
                  </button>
                ))}

                {/* 顶部 chip */}
                <div style={{ position: 'absolute', top: 52, left: 12, right: 12, display: 'flex', gap: 6, justifyContent: 'space-between', zIndex: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(250,245,237,.9)', padding: '5px 12px', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                    <Brandmark size={16} color={qp.t}/>
                    <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ink)', letterSpacing: 3 }}>花 信 风</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(250,245,237,.9)', padding: '5px 10px', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                    <span style={{ fontSize: 11 }}>{qp.emoji}</span>
                    <span style={{ fontSize: 11, color: qp.t, fontWeight: 700, letterSpacing: 2 }}>{qp.label}</span>
                  </div>
                </div>

                {/* 提醒横幅 */}
                <div style={{ position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)', background: 'rgba(250,245,237,.95)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.05)', fontSize: 11, color: 'var(--ink)', whiteSpace: 'nowrap', letterSpacing: 1.5, zIndex: 23 }}>
                  【花信】谷雨 · 荼靡 始盛 <span style={{ color: 'var(--vermillion)', marginLeft: 4 }}>→</span>
                </div>

                {/* 附近面板 */}
                <div style={{ position: 'absolute', left: 10, top: 128, width: 150, background: 'rgba(250,245,237,.96)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '8px 8px 4px', boxShadow: '0 1px 8px rgba(0,0,0,.06)', zIndex: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink)', fontWeight: 700, letterSpacing: 2, paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,.04)' }}>
                    <span>附近花事</span>
                    <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>{spots.length}</span>
                  </div>
                  {spots.slice(0, 4).map(s => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 2px', borderBottom: '1px solid rgba(0,0,0,.03)' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.c + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FI sp={s.sp} sz={12} co={s.c}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: 'var(--ink)', fontWeight: 600, letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.n}</div>
                        <div style={{ fontSize: 9, color: 'var(--ink-soft)' }}>{s.sp} · {s.dist}km</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAB 功能按钮 */}
                <div style={{ position: 'absolute', left: 8, bottom: 12, display: 'flex', flexDirection: 'column', gap: 5, zIndex: 25 }}>
                  {['📊', '🤖', '✨', '📜'].map(i => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(250,245,237,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 6px rgba(0,0,0,.06)', border: '1px solid rgba(0,0,0,.04)' }}>{i}</div>
                  ))}
                </div>

                {/* 书签 Rail */}
                <div style={{ position: 'absolute', right: 0, top: '40%', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 25 }}>
                  {[['#e8c060', '花签'], ['#8aaa78', '花信'], ['#b08860', '花历']].map(([c, l]) => (
                    <div key={l} style={{ background: c, color: '#fff', padding: '10px 5px', borderRadius: '4px 0 0 4px', writingMode: 'vertical-rl', fontSize: 10, letterSpacing: 3, fontWeight: 700, boxShadow: '-1px 2px 4px rgba(0,0,0,.08)' }}>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HuaqianSection · 花签 · 摇竹筒抽签
   ═══════════════════════════════════════════════════════════════ */
export function HuaqianSection() {
  const [phase, setPhase] = useState('idle');
  const [fortune, setFortune] = useState(null);
  const timer = useRef();

  const draw = () => {
    if (phase === 'shaking') return;
    setPhase('shaking');
    setFortune(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setFortune(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
      setPhase('drawn');
    }, 1400);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <section id="fortune" className="hx-section" style={{ background: 'linear-gradient(180deg, transparent, rgba(235,220,196,.3), transparent)', padding: '140px clamp(24px, 6vw, 96px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div className="hx-eyebrow-bracket" style={{ marginBottom: 20 }}>花 签</div>
        <h2 className="hx-display-sm">今 · 日 · 得 · 签</h2>
        <div className="hx-eng-sub" style={{ marginTop: 14 }}>DRAW YOUR FLOWER FORTUNE</div>
        <InkDivider glyph="签 出 · 静 待 天 意" width={280}/>
      </div>

      <div className="hx-fortune-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 60, alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>

        {/* 竹筒 */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', minHeight: 360 }}>
          <div style={{
            position: 'relative',
            width: 180, height: 320,
            background: 'linear-gradient(145deg, #a07848 0%, #7a5a30 35%, #5a4220 60%, #8a6638 100%)',
            borderRadius: '18px 18px 30px 30px',
            boxShadow: '0 20px 50px rgba(90,60,30,.4), inset 0 2px 6px rgba(255,240,200,.3), inset 0 -10px 20px rgba(0,0,0,.3)',
            transform: phase === 'shaking' ? 'rotate(-5deg)' : 'rotate(0deg)',
            transition: 'transform .15s ease',
            animation: phase === 'shaking' ? 'hx-shake .15s linear infinite' : 'none'
          }}>
            {/* 竹节线 */}
            {[60, 140, 220].map(y => (
              <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: y, height: 6, background: 'linear-gradient(90deg, #3a2810, #6a4820, #3a2810)', boxShadow: 'inset 0 1px 2px rgba(255,240,200,.25), 0 1px 2px rgba(0,0,0,.4)' }}/>
            ))}
            {/* 筒口阴影 */}
            <div style={{ position: 'absolute', inset: '0 4px auto 4px', height: 10, background: 'radial-gradient(ellipse at center, rgba(0,0,0,.6), transparent 80%)' }}/>
            {/* 签 */}
            {[...Array(9)].map((_, i) => {
              const lifted = phase === 'shaking' && i === 4;
              const base = -4 + i * 3.5;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  bottom: phase === 'drawn' ? (i === 4 ? 'auto' : 16) : 16,
                  top: phase === 'drawn' && i === 4 ? -260 : 'auto',
                  left: `${18 + i * 16}px`,
                  width: 4,
                  height: phase === 'drawn' && i === 4 ? 260 : 240,
                  transform: `rotate(${lifted ? -6 + Math.sin(i) * 2 : base}deg)`,
                  transformOrigin: 'bottom center',
                  background: i === 4 ? 'linear-gradient(180deg, #fce4a4 0%, #e8c070 50%, #b08040 100%)' : 'linear-gradient(180deg, #f0d8a0 0%, #c8a460 60%, #8a6838 100%)',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                  transition: 'all .9s ease'
                }}>
                  {i === 4 && phase === 'drawn' && (
                    <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 60, background: 'var(--vermillion-ink)', color: '#fff4d8', writingMode: 'vertical-rl', fontSize: 8, fontWeight: 900, letterSpacing: 1, textAlign: 'center', paddingTop: 6, borderRadius: 1 }}>签</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: 4 }}>
            {phase === 'idle' ? '点 · 按 · 摇 · 签' : phase === 'shaking' ? '签 出 · 静 待 天 意' : '今 · 日 · 得 · 签'}
          </div>
        </div>

        {/* 签卡 */}
        <div>
          {phase !== 'drawn' ? (
            <div style={{
              background: 'linear-gradient(145deg, #faf0dc, #f0e4c8)',
              border: '1.5px solid var(--gold)',
              boxShadow: 'inset 0 0 0 3px rgba(245,237,224,.6), inset 0 0 0 4px rgba(180,140,70,.3), 0 20px 60px rgba(0,0,0,.12)',
              borderRadius: 6,
              padding: '56px 40px',
              textAlign: 'center',
              minHeight: 360,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
              position: 'relative'
            }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 6, fontWeight: 700 }}>· 签 未 出 ·</div>
              <div style={{ fontSize: 28, color: 'var(--ink)', letterSpacing: 10, fontWeight: 900, textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>花 信 签</div>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', letterSpacing: 3, lineHeight: 2.2, maxWidth: 320 }}>
                以花为引，以诗为语。<br/>
                今日花事，今日签意。<br/>
                点按竹筒，摇一签得一花。
              </p>
              <button onClick={draw} disabled={phase === 'shaking'} className="hx-cta" style={{ marginTop: 18 }}>
                {phase === 'shaking' ? '摇 签 中 …' : '摇 · 签'}
              </button>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(145deg, #faf0dc, #f0e4c8)',
              border: '1.5px solid var(--gold)',
              boxShadow: 'inset 0 0 0 3px rgba(245,237,224,.6), inset 0 0 0 4px rgba(180,140,70,.3), 0 20px 60px rgba(0,0,0,.14), inset 0 0 120px rgba(200,160,80,.08)',
              borderRadius: 6,
              padding: '40px 36px 32px',
              textAlign: 'center',
              minHeight: 360,
              position: 'relative',
              animation: 'hx-fade-up .6s ease both'
            }}>
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <HxSeal text={fortune.rank} size={48}/>
              </div>

              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 6, fontWeight: 700, marginBottom: 10 }}>· {fortune.rank} ·</div>

              <FI sp={HX_24[Math.floor(Math.random() * HX_24.length)].sp} sz={56} co={fortune.c}/>

              <h3 style={{ fontSize: 30, fontWeight: 900, letterSpacing: 10, color: 'var(--ink)', margin: '14px 0 18px', textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
                {fortune.name}
              </h3>

              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 4, fontWeight: 600, marginBottom: 14 }}>· 签 诗 ·</div>
              <div style={{ fontSize: 16, color: 'var(--ink)', letterSpacing: 6, lineHeight: 2.2, fontWeight: 500, margin: '0 auto 10px', maxWidth: 380, textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>
                {fortune.verse}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 4, fontWeight: 600, marginBottom: 22 }}>— {fortune.poet} —</div>

              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 4, fontWeight: 600, marginBottom: 10 }}>· 签 解 ·</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', letterSpacing: 3, lineHeight: 2, maxWidth: 360, margin: '0 auto 26px' }}>
                {fortune.interp}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={draw} className="hx-cta hx-cta--ghost" style={{ padding: '8px 22px', fontSize: 13, letterSpacing: 4 }}>再 · 摇 · 一 次</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WikiSection · 花卉百科 12 卡
   ═══════════════════════════════════════════════════════════════ */
export function WikiSection() {
  const [focus, setFocus] = useState(null);
  return (
    <section id="wiki" className="hx-section">
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div className="hx-eyebrow-bracket" style={{ marginBottom: 20 }}>百 科</div>
        <h2 className="hx-display-sm">花 卉 百 科</h2>
        <div className="hx-eng-sub" style={{ marginTop: 14 }}>A FLORAL ENCYCLOPEDIA</div>
        <InkDivider glyph="名 · 种 · 花 语 · 诗 词" width={320}/>
      </div>

      <div className="hx-wiki-grid">
        {HX_WIKI.map(w => (
          <div key={w.name} className="hx-wiki-card"
            onMouseEnter={() => setFocus(w.name)}
            onMouseLeave={() => setFocus(null)}>
            <div className="hx-wiki-card__cover" style={{
              background: `linear-gradient(145deg, ${w.c}18, ${w.c}30)`
            }}>
              <div style={{
                transform: focus === w.name ? 'scale(1.12) rotate(8deg)' : 'scale(1)',
                transition: 'transform .5s ease'
              }}>
                <FI sp={w.sp} sz={78} co={w.c}/>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, color: w.c, letterSpacing: 2, fontWeight: 700, opacity: .8 }}>{w.peak}</div>
            </div>
            <div className="hx-wiki-card__body">
              <div className="hx-wiki-card__name">{w.name}</div>
              <div className="hx-wiki-card__latin">{w.latin}</div>
              <div className="hx-wiki-card__meta">
                <span style={{ color: w.c, fontWeight: 700 }}>{w.lang}</span>
                <span>{w.genus}</span>
              </div>
              <div className="hx-wiki-card__poem">
                「{w.poem}」<br/>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>— {w.poet}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DiarySection · 一年一册花事 + 8 徽章
   ═══════════════════════════════════════════════════════════════ */
export function DiarySection() {
  return (
    <section id="diary" className="hx-section">
      <div className="hx-diary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
        <div>
          <div className="hx-eyebrow-bracket" style={{ marginBottom: 20 }}>花 历</div>
          <h2 className="hx-display-sm" style={{ letterSpacing: 10 }}>一 年 · 一 册 花 事</h2>
          <InkDivider width={120}/>
          <p style={{ fontSize: 14, lineHeight: 2.1, color: 'var(--ink-mute)', letterSpacing: 1.5, maxWidth: 480 }}>
            每一次打卡入册。春来一朵桃，夏起一支荷，秋落一片枫，冬见一枝梅——年岁合集，便是一部你的《花历》。
          </p>
          <p style={{ fontSize: 13, lineHeight: 2, color: 'var(--ink-soft)', letterSpacing: 3, marginTop: 18 }}>
            十 二 枚 徽 章 · 八 项 风 雅
          </p>
        </div>

        <div>
          <div className="hx-badges">
            {HX_BADGES.map(b => (
              <div key={b.name} className="hx-badge" style={{
                borderColor: b.c + '40',
                background: `radial-gradient(circle at 50% 40%, ${b.c}14, var(--paper-lift))`
              }}>
                <div className="hx-badge__emoji">{b.emoji}</div>
                <div className="hx-badge__name" style={{ color: b.c }}>{b.name}</div>
                <div className="hx-badge__desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DownloadCTA · 跟着风去赏花 · 大号入山按钮
   ═══════════════════════════════════════════════════════════════ */
export function DownloadCTA({ season, onEnter }) {
  const qp = QP[season];
  return (
    <section id="download" className="hx-section" style={{ textAlign: 'center', padding: '140px 24px 120px', position: 'relative', overflow: 'hidden' }}>
      {/* 装饰花瓣 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .35 }}>
        {[...Array(14)].map((_, i) => {
          const x = (i * 83) % 100;
          const y = (i * 61) % 100;
          const size = 22 + (i % 3) * 8;
          return (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `rotate(${i * 33}deg)` }}>
              <FI sp={['樱花','桃花','梅花','海棠'][i % 4]} sz={size} co={qp.t}/>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="hx-eyebrow-bracket" style={{ marginBottom: 22 }}>入 山</div>
        <h2 className="hx-display">跟 着 风 去 赏 花</h2>
        <div className="hx-eng-sub" style={{ marginTop: 14 }}>CHASE A CHINESE COLOR, FOLLOWING THE RHYTHM OF HEAVEN AND EARTH</div>

        <div style={{ marginTop: 40, fontSize: 15, color: 'var(--ink-mute)', letterSpacing: 3, lineHeight: 2 }}>
          免 费 · 无 广 告 · 即 开 即 用
        </div>

        <div style={{ marginTop: 46, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="hx-cta" onClick={onEnter} style={{ background: 'var(--vermillion)', color: '#fff8e8', border: '1.5px solid var(--vermillion)' }}>
            入 山 寻 花
            <span style={{ fontSize: 14, letterSpacing: 0 }}>→</span>
          </button>
        </div>

        <div style={{ marginTop: 64, display: 'flex', gap: 44, justifyContent: 'center', flexWrap: 'wrap' }}>
          {HX_STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--ink)', letterSpacing: 2, textShadow: '0 1px 0 rgba(255,255,255,.5)' }}>{s.n}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', letterSpacing: 3, marginTop: 6, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-soft)', letterSpacing: 2, marginTop: 3, opacity: .6 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Footer · 4 列
   ═══════════════════════════════════════════════════════════════ */
export function Footer({ season }) {
  return (
    <footer className="hx-footer">
      <div className="hx-footer__bg"/>
      <div className="hx-footer-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <Brandmark size={30} color={QP[season].t}/>
            <span style={{ fontWeight: 900, letterSpacing: 8, fontSize: 18, color: '#f5e8c8' }}>花 信 风</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 2, letterSpacing: 2, opacity: .7, maxWidth: 380 }}>
            花信风，应花期而来的风也。<br/>
            融合二十四番花信风与现代气象，为你绘制一张可呼吸的中国赏花地图。
          </p>
          <div style={{ marginTop: 24, fontSize: 11, letterSpacing: 3, opacity: .5 }}>
            🌸 HuaXinFeng · 跟 着 天 地 节 律 追 一 场 中 国 色
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#c8b898', marginBottom: 16, fontWeight: 700 }}>产 品</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, letterSpacing: 2 }}>
            <a href="#huaxin">花信</a>
            <a href="#map">地图</a>
            <a href="#fortune">花签</a>
            <a href="#wiki">百科</a>
            <a href="#diary">花历</a>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#c8b898', marginBottom: 16, fontWeight: 700 }}>雅 事</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, letterSpacing: 2 }}>
            <a href="#">诗词集</a>
            <a href="#">节气</a>
            <a href="#">广群芳谱</a>
            <a href="#">花之语</a>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#c8b898', marginBottom: 16, fontWeight: 700 }}>关 于</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, letterSpacing: 2 }}>
            <a href="https://github.com/Leoatsr/HUAXIN" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#">联 系</a>
            <a href="#">许 可</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '64px auto 0', padding: '22px 0 0', borderTop: '1px solid rgba(200,160,80,.15)', display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: 2, opacity: .5, flexWrap: 'wrap', gap: 14 }}>
          <span>© {new Date().getFullYear()} 花信风 · 以宋人之眼，观今日花事。</span>
          <span>— 南朝 · 宗懔 《荆楚岁时记》</span>
        </div>
    </footer>
  );
}
