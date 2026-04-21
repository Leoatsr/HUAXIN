import React, { useState, useEffect, useMemo } from 'react';
import { Seal } from '../ui/atoms.jsx';
import { getUserLocation, findNearbyBlooming, fallbackTopBlooming } from '../utils/geolocation.js';
import { SpotImage } from './SpotImage.jsx';
import { trackOnboardingComplete } from '../utils/analytics.js';

/* ═══════════════════════════════════════════════════════════════
   OnboardingGuide · 首次沉浸式体验流（90s）
   ───────────────────────────────────────────────────────────────
   Stage 1 · 登场（0-3s）    水墨花开 + 诗句
   Stage 2 · 感知（3-6s）    定位请求（三层降级）
   Stage 3 · 承诺（6-10s）   "附近有 {N} 处花正开"
   Stage 4 · 落地           点 CTA → 关闭引导 → 筛选地图

   全程只让用户点 1 次（最后的 CTA）
   其他自动推进 · 不可回退（回退只会打断沉浸）
   ═══════════════════════════════════════════════════════════════ */

const HOKU_LINES = [
  { text: '莫恨芳菲歇 · 须知叶盖开', author: '唐 · 韩愈' },
  { text: '春风不相识 · 何事入罗帏', author: '唐 · 李白' },
  { text: '人闲桂花落 · 夜静春山空', author: '唐 · 王维' },
  { text: '花开堪折直须折 · 莫待无花空折枝', author: '唐 · 杜秋娘' },
  { text: '接天莲叶无穷碧 · 映日荷花别样红', author: '宋 · 杨万里' }
];

// 根据当前月份挑诗
function pickHoku() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5)  return HOKU_LINES[0];  // 春
  if (month >= 6 && month <= 8)  return HOKU_LINES[4];  // 夏
  if (month >= 9 && month <= 10) return HOKU_LINES[2];  // 秋
  return HOKU_LINES[1];                                  // 冬
}

/**
 * Props:
 *   flora:        FLORA 全集（带 _st 积温状态）
 *   onComplete:   关闭回调
 *   onJumpToSpot: (spotId) => void · 点 CTA 后跳到景点
 */
export function OnboardingGuide({ flora, onComplete, onJumpToSpot }) {
  const [stage, setStage] = useState(1);     // 1 / 2 / 3
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle'); // idle / asking / done
  const [nearby, setNearby] = useState([]);

  const hoku = useMemo(pickHoku, []);

  // Stage 1 → 2 · 3s 后自动推进
  useEffect(() => {
    if (stage !== 1) return;
    const timer = setTimeout(() => setStage(2), 2800);
    return () => clearTimeout(timer);
  }, [stage]);

  // Stage 2 · 获取定位
  useEffect(() => {
    if (stage !== 2) return;
    setLocStatus('asking');

    let cancelled = false;
    getUserLocation({ timeout: 4000 }).then(loc => {
      if (cancelled) return;
      setLocation(loc);

      // 找附近花事
      let found = findNearbyBlooming(flora, loc, 100, 3);
      if (found.length === 0) {
        // 扩大到 300km
        found = findNearbyBlooming(flora, loc, 300, 3);
      }
      if (found.length === 0) {
        // 全国 Top 盛花
        found = fallbackTopBlooming(flora, 3);
      }
      setNearby(found);
      setLocStatus('done');

      // 最少显示 1.5s 的"感知"状态 · 避免一闪而过
      setTimeout(() => {
        if (!cancelled) setStage(3);
      }, 1400);
    });

    return () => { cancelled = true; };
  }, [stage, flora]);

  // 起始时间戳（引导挂载瞬间）· 用于计算时长
  const startedAt = useMemo(() => Date.now(), []);

  const go = () => {
    const firstSpot = nearby[0];
    trackOnboardingComplete({
      status: 'complete',
      durationMs: Date.now() - startedAt,
      locSource: location?.source
    });
    if (firstSpot && onJumpToSpot) {
      onJumpToSpot(firstSpot.id);
    }
    onComplete();
  };

  const skip = () => {
    trackOnboardingComplete({
      status: 'skip',
      durationMs: Date.now() - startedAt,
      locSource: location?.source
    });
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'linear-gradient(180deg, var(--paper) 0%, var(--bg-elev) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      overflow: 'hidden',
      fontFamily: 'var(--font-serif)'
    }}>

      {/* ═══ 纸纹底 ═══ */}
      <PaperTexture/>

      {/* ═══ 背景装饰 · 散落花瓣（克制） ═══ */}
      <BackgroundPetals/>

      {/* ═══ 顶部跳过（轻量存在） ═══ */}
      <button onClick={skip} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 11, color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.25em', zIndex: 3,
        padding: 8,
        transition: 'color 220ms ease'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>
        跳过  →
      </button>

      {/* ═══ 主内容区 ═══ */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: 'min(520px, 100%)',
        textAlign: 'center'
      }}>

        {/* Stage 1 · 登场 */}
        {stage === 1 && <Stage1Intro hoku={hoku}/>}

        {/* Stage 2 · 感知 */}
        {stage === 2 && <Stage2Sensing status={locStatus} location={location}/>}

        {/* Stage 3 · 承诺 */}
        {stage === 3 && (
          <Stage3Promise
            location={location}
            nearby={nearby}
            onGo={go}
            onSkip={skip}
          />
        )}
      </div>
    </div>
  );
}


/* ═══ Stage 1 · 水墨花开 ═══ */
function Stage1Intro({ hoku }) {
  return (
    <div style={{ animation: 'hx-stage-fade 500ms ease-out' }}>
      {/* 花瓣 SVG · stroke-draw 动画 */}
      <svg viewBox="0 0 200 200" width="160" height="160"
        style={{ margin: '0 auto', display: 'block' }}>
        <defs>
          <radialGradient id="petalGlow">
            <stop offset="0%"  stopColor="#e85845" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#a0301c" stopOpacity="0.3"/>
          </radialGradient>
        </defs>

        {[0, 72, 144, 216, 288].map((angle, i) => (
          <ellipse key={angle}
            cx="100" cy="50" rx="20" ry="40"
            fill="url(#petalGlow)"
            transform={`rotate(${angle} 100 100)`}
            style={{
              transformOrigin: '100px 100px',
              animation: `hx-petal-open 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 120}ms both`
            }}/>
        ))}

        {/* 花蕊 */}
        <circle cx="100" cy="100" r="10"
          fill="#e8b86a"
          style={{
            animation: 'hx-scale-in 800ms ease-out 700ms both'
          }}/>
        <circle cx="100" cy="100" r="4"
          fill="#7a1a0e"
          style={{
            animation: 'hx-scale-in 800ms ease-out 800ms both'
          }}/>
      </svg>

      {/* 品牌字 */}
      <div style={{
        fontSize: 38,
        letterSpacing: '0.4em',
        color: 'var(--ink)',
        marginTop: 32,
        fontWeight: 700,
        animation: 'hx-text-appear 800ms ease-out 600ms both'
      }}>花 信 风</div>

      {/* 诗句 */}
      <div style={{
        fontSize: 15,
        letterSpacing: '0.15em',
        color: 'var(--ink-2)',
        marginTop: 24,
        lineHeight: 2,
        animation: 'hx-text-appear 1000ms ease-out 1200ms both'
      }}>
        <div>「{hoku.text}」</div>
        <div style={{
          fontSize: 11,
          color: 'var(--ink-3)',
          marginTop: 8,
          letterSpacing: '0.3em'
        }}>— {hoku.author}</div>
      </div>
    </div>
  );
}


/* ═══ Stage 2 · 感知位置 ═══ */
function Stage2Sensing({ status, location }) {
  const hint = (() => {
    if (status === 'asking') return '正在感知你在哪里…';
    if (location?.source === 'gps')     return `已找到你在 · ${location.name || '你的位置'}`;
    if (location?.source === 'ip')      return `大致在 · ${location.name || '你的城市'}`;
    if (location?.source === 'default') return '暂时无法定位 · 先带你去洛阳看牡丹';
    return '…';
  })();

  return (
    <div style={{ animation: 'hx-stage-fade 500ms ease-out' }}>
      {/* 脉动光圈 */}
      <div style={{
        position: 'relative',
        width: 120, height: 120,
        margin: '0 auto'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            border: '1.5px solid color-mix(in oklch, var(--zhusha) 45%, transparent)',
            borderRadius: '50%',
            animation: `hx-ping 2s ease-out ${i * 0.6}s infinite`
          }}/>
        ))}
        <div style={{
          position: 'absolute', inset: 40,
          background: 'radial-gradient(circle, var(--jin), var(--zhusha))',
          borderRadius: '50%',
          boxShadow: '0 0 30px color-mix(in oklch, var(--zhusha) 40%, transparent)'
        }}/>
      </div>

      <div className="serif" style={{
        fontSize: 17,
        letterSpacing: '0.2em',
        color: 'var(--ink)',
        marginTop: 32,
        lineHeight: 1.8
      }}>{hint}</div>
    </div>
  );
}


/* ═══ Stage 3 · 承诺落地 ═══ */
function Stage3Promise({ location, nearby, onGo, onSkip }) {
  const count = nearby.length;
  const first = nearby[0];

  // 平均距离描述
  const radiusDesc = (() => {
    if (count === 0) return null;
    const maxDist = Math.max(...nearby.map(s => s._distance || 0));
    if (maxDist < 50) return '身边 50 公里内';
    if (maxDist < 150) return '身边 150 公里内';
    if (maxDist < 500) return '这个省内';
    return '全国最盛';
  })();

  if (count === 0 || !first) {
    return (
      <div style={{ animation: 'hx-stage-fade 500ms ease-out' }}>
        <div style={{
          fontSize: 56, opacity: 0.4, marginBottom: 16
        }}>🌸</div>
        <div className="serif" style={{
          fontSize: 18, color: 'var(--ink)', lineHeight: 2,
          letterSpacing: '0.15em'
        }}>
          此时无花正盛 ——<br/>
          但一年四季都有可赏。
        </div>
        <button onClick={onGo}
          style={{
            marginTop: 32,
            padding: '14px 36px',
            background: 'var(--zhusha)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 100,
            cursor: 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: 14,
            letterSpacing: '0.35em',
            fontWeight: 600,
            boxShadow: '0 6px 20px color-mix(in oklch, var(--zhusha) 30%, transparent)',
            transition: 'transform 220ms ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          入 山 寻 花
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'hx-stage-fade 500ms ease-out' }}>
      {/* 承诺文案 */}
      <div className="serif" style={{
        fontSize: 18,
        color: 'var(--ink-2)',
        letterSpacing: '0.15em',
        lineHeight: 2.0,
        marginBottom: 28
      }}>
        {radiusDesc}<br/>
        有 <span style={{
          color: 'var(--zhusha)',
          fontSize: 36,
          fontWeight: 700,
          padding: '0 6px',
          letterSpacing: 0,
          fontFamily: 'var(--font-serif)'
        }}>{count}</span> 处花事正开
      </div>

      {/* 第一处景点图 · 被选中的那朵花 */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 380,
        margin: '0 auto',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 10px 32px color-mix(in oklch, var(--ink) 18%, transparent), 0 2px 8px color-mix(in oklch, var(--ink) 10%, transparent)',
        border: '1px solid var(--line)',
        animation: 'hx-scale-in 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms both'
      }}>
        <SpotImage
          species={first.sp}
          name={first.n}
          hashSeed={first.id}
          aspect="16/9"
          style={{ borderRadius: 0 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(20,12,6,0.82) 100%)',
          pointerEvents: 'none'
        }}/>
        <div style={{
          position: 'absolute', left: 18, right: 18, bottom: 16,
          color: '#f5e6c8',
          textAlign: 'left',
          pointerEvents: 'none'
        }}>
          <div className="cn-caps" style={{
            color: 'rgba(245, 230, 200, 0.75)',
            marginBottom: 4
          }}>
            {first.sp}  ·  第一站
          </div>
          <div className="serif" style={{
            fontSize: 20,
            letterSpacing: '0.15em',
            fontWeight: 600
          }}>{first.n}</div>
          {first._distance != null && (
            <div className="mono" style={{
              fontSize: 10, color: 'rgba(245, 230, 200, 0.6)',
              marginTop: 4, letterSpacing: '0.15em'
            }}>
              距你 {first._distance < 1 ? '<1' : first._distance.toFixed(0)} 公里
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onGo}
        style={{
          marginTop: 32,
          padding: '14px 40px',
          background: 'var(--zhusha)',
          color: 'var(--paper)',
          border: 'none',
          borderRadius: 100,
          cursor: 'pointer',
          fontFamily: 'var(--font-serif)',
          fontSize: 15,
          letterSpacing: '0.35em',
          fontWeight: 600,
          boxShadow: '0 8px 24px color-mix(in oklch, var(--zhusha) 35%, transparent)',
          transition: 'transform 220ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        带我去看
      </button>

      <div style={{
        marginTop: 18, fontSize: 11,
        color: 'var(--ink-3)',
        letterSpacing: '0.2em'
      }}>
        或{' '}
        <button onClick={onSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-2)',
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            textDecoration: 'underline',
            padding: 0,
            letterSpacing: '0.2em'
          }}>自己逛逛</button>
      </div>
    </div>
  );
}


/* ═══ 纸纹底 ═══ */
function PaperTexture() {
  return (
    <svg style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      opacity: 0.5
    }}>
      <defs>
        <filter id="ob-paper" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="5"/>
          <feColorMatrix values="0 0 0 0 0.7
                                 0 0 0 0 0.6
                                 0 0 0 0 0.5
                                 0 0 0 0.05 0"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#ob-paper)"/>
    </svg>
  );
}

/* ═══ 装饰 · 散落花瓣（克制） ═══ */
function BackgroundPetals() {
  const petals = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 8 + Math.random() * 84,
    delay: Math.random() * 12,
    duration: 14 + Math.random() * 8,
    size: 6 + Math.random() * 8,
    opacity: 0.08 + Math.random() * 0.14
  }));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {petals.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: -20,
          left: `${p.left}%`,
          width: p.size,
          height: p.size * 1.5,
          background: 'radial-gradient(ellipse, var(--zhusha), color-mix(in oklch, var(--zhusha) 40%, transparent))',
          borderRadius: '50% 50% 0 50%',
          opacity: p.opacity,
          animation: `hx-petal-fall ${p.duration}s linear ${p.delay}s infinite`
        }}/>
      ))}
    </div>
  );
}
