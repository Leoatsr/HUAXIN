import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   花信风 · 落地页专用 Atoms
   从 Claude Design handoff 完整移植
   ═══════════════════════════════════════════════════════════════ */

// ─── Brandmark · 5 瓣樱花品牌 ───
export function Brandmark({ size = 40, color = '#e08090', stamen = '#f8e0a0' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <g opacity=".92">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="12" cy="7.5" rx="3" ry="4.5" transform={`rotate(${a} 12 12)`} fill={color} />
        ))}
        <circle cx="12" cy="12" r="2.5" fill={stamen} />
      </g>
    </svg>
  );
}

// ─── FI · 花卉图标（按花种参数化）───
export function FI({ sp, sz = 18, co }) {
  const cl = co || '#e080a0';
  const P5 = (r) => [0, 72, 144, 216, 288].map((a) => (
    <ellipse key={a} cx="12" cy={12 - r} rx="3" ry={r} transform={`rotate(${a} 12 12)`} fill={cl} />
  ));
  const P6 = (r) => [0, 60, 120, 180, 240, 300].map((a) => (
    <ellipse key={a} cx="12" cy={12 - r} rx="2.6" ry={r} transform={`rotate(${a} 12 12)`} fill={cl} />
  ));
  const map = {
    樱花: () => <g opacity=".9">{P5(4.5)}<circle cx="12" cy="12" r="2.3" fill="#f8e0a0"/></g>,
    桃花: () => <g opacity=".9">{P5(5)}<circle cx="12" cy="12" r="2" fill="#ffe0e8"/></g>,
    梅花: () => (
      <g opacity=".92">
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx="12" cy="6.5" r="3.2" transform={`rotate(${a} 12 12)`} fill={cl}/>
        ))}
        <circle cx="12" cy="12" r="2" fill="#f8e0a0"/>
      </g>
    ),
    牡丹: () => (
      <g opacity=".85">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="12" cy="6" rx="3.5" ry="4.5" transform={`rotate(${a} 12 12)`} fill={cl}/>
        ))}
        <circle cx="12" cy="12" r="2.5" fill="#f8e0a0"/>
      </g>
    ),
    荷花: () => (
      <g fill={cl} opacity=".88">
        <ellipse cx="12" cy="8" rx="3" ry="6"/>
        <ellipse cx="8" cy="10" rx="2.5" ry="5" transform="rotate(-20 8 10)"/>
        <ellipse cx="16" cy="10" rx="2.5" ry="5" transform="rotate(20 16 10)"/>
        <ellipse cx="12" cy="14" rx="2.5" ry="4"/>
      </g>
    ),
    红枫: () => <g fill={cl} opacity=".9"><path d="M12,2L14,8L20,8L15,12L17,19L12,15L7,19L9,12L4,8L10,8Z"/></g>,
    银杏: () => <g fill={cl} opacity=".9"><path d="M12,20L12,12Q6,8 4,4Q8,2 12,6Q16,2 20,4Q18,8 12,12"/></g>,
    油菜: () => <g opacity=".9">{[0, 90, 180, 270].map((a) => (<ellipse key={a} cx="12" cy="7" rx="2.2" ry="3.5" transform={`rotate(${a} 12 12)`} fill={cl}/>))}<circle cx="12" cy="12" r="1.8" fill="#fff4c8"/></g>,
    玉兰: () => <g opacity=".88">{P6(4.5)}<circle cx="12" cy="12" r="1.8" fill="#fff8e8"/></g>,
    杜鹃: () => <g opacity=".9">{P5(4.2)}<circle cx="12" cy="12" r="2" fill={cl}/></g>,
    郁金香: () => <g fill={cl} opacity=".88"><path d="M8,14Q8,6 12,4Q16,6 16,14Z"/><path d="M9,14L9,20L15,20L15,14Z" opacity=".5"/></g>,
    菊花: () => <g opacity=".88">{[0,30,60,90,120,150,180,210,240,270,300,330].map((a) => (<ellipse key={a} cx="12" cy="6.5" rx="1.6" ry="4" transform={`rotate(${a} 12 12)`} fill={cl}/>))}<circle cx="12" cy="12" r="2" fill="#f8e0a0"/></g>,
    桂花: () => <g opacity=".9">{[0,90,180,270].map((a) => (<circle key={a} cx="12" cy="8.5" r="2" transform={`rotate(${a} 12 12)`} fill={cl}/>))}<circle cx="12" cy="12" r="1.4" fill="#fff4c0"/></g>,
    山茶: () => <g opacity=".9">{P6(5)}<circle cx="12" cy="12" r="2.2" fill="#fff8e0"/></g>,
    水仙: () => <g opacity=".9">{P6(4)}<circle cx="12" cy="12" r="2.6" fill={cl}/><circle cx="12" cy="12" r="1.5" fill="#fff4c0"/></g>,
    兰花: () => <g fill={cl} opacity=".85"><path d="M12,4Q8,8 6,14Q10,12 12,10Q14,12 18,14Q16,8 12,4Z"/></g>,
    迎春: () => <g opacity=".9">{[0,60,120,180,240,300].map((a) => (<ellipse key={a} cx="12" cy="7" rx="2" ry="3.2" transform={`rotate(${a} 12 12)`} fill={cl}/>))}<circle cx="12" cy="12" r="1.6" fill="#fff8c0"/></g>,
    海棠: () => <g opacity=".9">{P5(4.8)}<circle cx="12" cy="12" r="1.8" fill="#fff4e0"/></g>,
    梨花: () => <g opacity=".9">{P5(4.3)}<circle cx="12" cy="12" r="1.8" fill="#ffe8a0"/></g>,
    芍药: () => <g opacity=".87">{[0,45,90,135,180,225,270,315].map((a) => (<ellipse key={a} cx="12" cy="6.5" rx="3.2" ry="4.2" transform={`rotate(${a} 12 12)`} fill={cl}/>))}<circle cx="12" cy="12" r="2" fill="#f8e0a0"/></g>,
    蔷薇: () => <g opacity=".88">{P5(4.5)}<circle cx="12" cy="12" r="2.2" fill={cl}/><circle cx="12" cy="12" r="1.2" fill="#fff4e0"/></g>,
    木槿: () => <g opacity=".88">{P5(5.2)}<circle cx="12" cy="12" r="1.6" fill={cl}/></g>,
    楝花: () => <g opacity=".88">{P5(4)}<circle cx="12" cy="12" r="1.4" fill="#fff4e0"/></g>
  };
  const R = map[sp] || map.樱花;
  return <svg viewBox="0 0 24 24" width={sz} height={sz}><R/></svg>;
}

// ─── QP · 季节调色板 ───
export const QP = {
  spring: { s: '#e8dcd0', m1: '#3a6b5a', m2: '#4a8a6a', w: '#6aaab0', t: '#d4756b', accent: '#c0604a', label: '春', emoji: '🌸' },
  summer: { s: '#d8d4c0', m1: '#2a5a48', m2: '#3a7858', w: '#5898a0', t: '#5a8a50', accent: '#4a7a40', label: '夏', emoji: '🌿' },
  autumn: { s: '#e0d0b8', m1: '#8a6a30', m2: '#a08040', w: '#7090a0', t: '#c8703a', accent: '#a85830', label: '秋', emoji: '🍁' },
  winter: { s: '#e0dcd8', m1: '#6a7a80', m2: '#8a9098', w: '#8aa0b0', t: '#6a8aaa', accent: '#5a78a0', label: '冬', emoji: '❄' }
};

// ─── LandscapeSVG · 千里江山图底 ───
export function LandscapeSVG({ season = 'spring', style = {} }) {
  const qp = QP[season];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}>
      <defs>
        <linearGradient id="hx-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={qp.s} stopOpacity="0"/>
          <stop offset="100%" stopColor={qp.s} stopOpacity=".55"/>
        </linearGradient>
        <linearGradient id="hx-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={qp.w} stopOpacity=".28"/>
          <stop offset="100%" stopColor={qp.w} stopOpacity=".08"/>
        </linearGradient>
        <radialGradient id="hx-sun" cx="0.78" cy="0.18" r="0.22">
          <stop offset="0%" stopColor="#fff4d8" stopOpacity=".55"/>
          <stop offset="100%" stopColor="#fff4d8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1600" height="520" fill="url(#hx-sky)"/>
      <rect x="0" y="0" width="1600" height="900" fill="url(#hx-sun)"/>
      {/* 远山层次 */}
      <path d="M0,440 Q180,330 380,370 T760,300 T1140,340 T1600,320 L1600,900 L0,900Z" fill={qp.m1} opacity=".18"/>
      <path d="M0,500 Q200,400 420,430 T820,370 T1220,400 T1600,380 L1600,900 L0,900Z" fill={qp.m2} opacity=".28"/>
      <path d="M0,560 Q160,440 320,480 T600,410 T880,450 T1180,400 T1600,430 L1600,900 L0,900Z" fill={qp.m1} opacity=".38"/>
      <path d="M0,640 Q140,500 280,540 T520,470 T760,520 T1000,460 T1240,510 T1600,480 L1600,900 L0,900Z" fill={qp.m2} opacity=".48"/>
      <rect x="0" y="680" width="1600" height="220" fill="url(#hx-water)"/>
      {/* 亭台 */}
      <g opacity=".42">
        <path d="M540,720 Q558,710 576,720" stroke={qp.m1} strokeWidth="1.8" fill="none"/>
        <line x1="558" y1="710" x2="558" y2="694" stroke={qp.m1} strokeWidth="1"/>
        <path d="M1040,735 Q1055,728 1070,735" stroke={qp.m1} strokeWidth="1.4" fill="none"/>
      </g>
      {/* 花枝 */}
      {[{x:200,y:610,r:11},{x:430,y:640,r:9},{x:670,y:620,r:13},{x:910,y:635,r:10},{x:1150,y:605,r:12},{x:1400,y:630,r:11}].map((p, i) => (
        <g key={i} opacity=".55">
          <circle cx={p.x} cy={p.y} r={p.r} fill={qp.t}/>
          <line x1={p.x} y1={p.y + p.r} x2={p.x} y2={p.y + p.r + 10} stroke={qp.m1} strokeWidth="1.5"/>
        </g>
      ))}
      {/* 飞鸟 */}
      {[{x:400,y:200},{x:480,y:180},{x:560,y:210},{x:1060,y:190},{x:1140,y:220}].map((p, i) => (
        <path key={'b'+i} d={`M${p.x},${p.y} q6,-4 12,0 q6,4 12,0`} stroke={qp.m1} strokeWidth="1.3" fill="none" opacity=".4"/>
      ))}
      <rect x="0" y="540" width="1600" height="80" fill={qp.s} opacity=".18"/>
      <rect x="0" y="660" width="1600" height="40" fill={qp.s} opacity=".3"/>
    </svg>
  );
}

// ─── Seal · 红色印章 ───
export function HxSeal({ text = '花信', size = 56, rotate = -3 }) {
  return (
    <div style={{
      width: size, height: size,
      background: 'var(--vermillion-ink)',
      color: '#fff4d8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, letterSpacing: 2, lineHeight: 1.1,
      fontFamily: 'var(--font-serif)',
      fontSize: size * 0.22,
      borderRadius: 3,
      transform: `rotate(${rotate}deg)`,
      boxShadow: `0 3px 10px rgba(160,48,28,.25)`,
      writingMode: 'vertical-rl',
      textOrientation: 'upright',
      padding: 6
    }}>{text}</div>
  );
}

// ─── InkDivider · 金色分隔 ───
export function InkDivider({ glyph, width = 240 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '24px auto', width }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: .5 }}/>
      {glyph && <span style={{ fontSize: 12, letterSpacing: 4, color: 'var(--gold)', fontWeight: 600 }}>{glyph}</span>}
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: .5 }}/>
    </div>
  );
}
