import React, { useMemo, useState } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { buildWrapped, hasEnoughData } from '../utils/wrapped.js';
import { trackShare } from '../utils/analytics.js';

/* ═══════════════════════════════════════════════════════════════
   WrappedPanel · 年度花事复盘
   ───────────────────────────────────────────────────────────────
   Spotify Wrapped 风格 · 5 屏故事
     屏 1 · 年度概览（数字）
     屏 2 · 最爱花种 Top 3
     屏 3 · 足迹地图
     屏 4 · 最有诗意的一笔
     屏 5 · 送你的诗
   
   点右上「保存为图片」→ 生成一张可发朋友圈的长图
   ═══════════════════════════════════════════════════════════════ */

export function WrappedPanel({ flora, checkins, favs, onBack }) {
  const [stage, setStage] = useState(0);  // 0-4
  const [exporting, setExporting] = useState(false);

  const wrapped = useMemo(
    () => buildWrapped(checkins, flora, favs),
    [checkins, flora, favs]
  );

  const enough = useMemo(() => hasEnoughData(checkins, 1), [checkins]);

  if (!enough) {
    return (
      <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
        <ScreenHeader
          eyebrow="年度花事 · 复盘时刻"
          title="今 岁 花 历"
          onBack={onBack}
        />
        <EmptyState
          variant="full"
          symbol="🌸"
          title="你今年还没打卡"
          sub={<>去地图上挑几处花事<br/>打过卡才有得复盘</>}
          action={onBack ? { label: '去花事地图', onClick: onBack, icon: <Icon.chev d="left"/> } : null}
        />
      </div>
    );
  }

  const totalStages = 5;

  const nextStage = () => {
    if (stage < totalStages - 1) setStage(stage + 1);
  };
  const prevStage = () => {
    if (stage > 0) setStage(stage - 1);
  };

  const exportPng = async () => {
    const svgEl = document.getElementById('wrapped-export-svg');
    if (!svgEl) return;
    setExporting(true);
    try {
      const { svgToPng } = await import('../components/ShareCards.jsx').then(m => ({
        svgToPng: m.svgToPng || (async () => {
          // fallback · 直接做一次 svg → png
          const s = new XMLSerializer().serializeToString(svgEl);
          const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res; img.onerror = rej; img.src = url;
          });
          const canvas = document.createElement('canvas');
          const vb = svgEl.viewBox.baseVal;
          canvas.width = vb.width * 2;
          canvas.height = vb.height * 2;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          return new Promise(res => {
            canvas.toBlob(b => {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(b);
              link.download = `花信风-${wrapped.year}年花历.png`;
              link.click();
              setTimeout(() => URL.revokeObjectURL(link.href), 1000);
              res();
            }, 'image/png');
          });
        })
      }));
      // 用 fallback
      const s = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([s], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res; img.onerror = rej; img.src = url;
      });
      const canvas = document.createElement('canvas');
      const vb = svgEl.viewBox.baseVal;
      canvas.width = vb.width * 2;
      canvas.height = vb.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      await new Promise(res => {
        canvas.toBlob(b => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(b);
          link.download = `花信风-${wrapped.year}年花历.png`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          res();
        }, 'image/png');
      });
      trackShare({ target: 'wrapped_card' });
    } catch (e) {
      // ignore
    }
    setExporting(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 46px)',
      background: 'var(--bg)'
    }}>
      <ScreenHeader
        eyebrow={`${wrapped.year} 年花事 · 复盘时刻`}
        title="今 岁 花 历"
        sub={<>共 {wrapped.overview.totalCheckins} 次打卡 · {wrapped.overview.uniqueSpecies} 种花 · {wrapped.overview.uniqueRegions} 个大区</>}
        onBack={onBack}
        backLabel="返回花历"
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px', maxWidth: 560, margin: '0 auto' }}>
        {/* 进度条 */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 16
        }}>
          {Array.from({ length: totalStages }, (_, i) => (
            <button key={i}
              onClick={() => setStage(i)}
              style={{
                flex: 1, height: 3,
                background: i <= stage ? 'var(--zhusha)' : 'var(--line)',
                border: 'none', borderRadius: 2,
                cursor: 'pointer',
                padding: 0,
                transition: 'background var(--dur-normal) var(--ease-out)'
              }}/>
          ))}
        </div>

        {/* 卡片 */}
        <div key={stage} className="hx-enter" style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--line)',
          background: 'var(--paper)',
          aspectRatio: '9 / 16',
          maxHeight: 'calc(100vh - 220px)',
          position: 'relative'
        }}>
          {stage === 0 && <Stage0Overview wrapped={wrapped}/>}
          {stage === 1 && <Stage1Species wrapped={wrapped}/>}
          {stage === 2 && <Stage2Regions wrapped={wrapped}/>}
          {stage === 3 && <Stage3Note wrapped={wrapped}/>}
          {stage === 4 && <Stage4Poem wrapped={wrapped}/>}
        </div>

        {/* 控制 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={prevStage} disabled={stage === 0}>
            <Icon.chev d="left"/>
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', paddingTop: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }}>
            {stage + 1} / {totalStages}
          </div>
          <button className="btn" onClick={nextStage} disabled={stage === totalStages - 1}>
            <Icon.chev/>
          </button>
        </div>

        {/* 导出 */}
        <div style={{ marginTop: 20 }}>
          <button className="btn zhusha" style={{ width: '100%', justifyContent: 'center' }}
            onClick={exportPng} disabled={exporting}>
            <Icon.share/> {exporting ? '正在生成长图...' : '保存整份 · 可发朋友圈'}
          </button>
        </div>

        {/* 隐藏的导出用 SVG · 包含所有 5 屏 */}
        <div style={{ position: 'absolute', left: -99999, top: -99999 }} aria-hidden>
          <FullExportSvg wrapped={wrapped}/>
        </div>
      </div>
    </div>
  );
}

/* ═══ 通用 · 卡片容器 ═══ */
function Card({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      padding: 'clamp(20px, 6%, 32px)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-serif)'
    }}>
      {children}
    </div>
  );
}

/* ═══ Stage 0 · 数字总览 ═══ */
function Stage0Overview({ wrapped }) {
  const { overview } = wrapped;
  return (
    <Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <div className="cn-caps" style={{ color: 'var(--zhusha)' }}>你的 {wrapped.year}</div>
        <div className="serif" style={{
          fontSize: 'clamp(28px, 6vw, 42px)',
          letterSpacing: '0.3em',
          marginTop: 14,
          color: 'var(--ink)',
          fontWeight: 600
        }}>
          你走过
        </div>
        <div className="serif" style={{
          fontSize: 'clamp(56px, 15vw, 96px)',
          letterSpacing: 0,
          color: 'var(--zhusha)',
          margin: '20px 0',
          fontWeight: 700,
          lineHeight: 1
        }}>
          {overview.uniqueSpots}
        </div>
        <div className="serif" style={{
          fontSize: 'clamp(14px, 3vw, 18px)',
          color: 'var(--ink-2)',
          letterSpacing: '0.15em',
          lineHeight: 2
        }}>
          处花事
        </div>

        <div style={{
          marginTop: 30, padding: '0 10%',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24
        }}>
          <MiniStat label="打卡次数" value={overview.totalCheckins}/>
          <MiniStat label="花种" value={overview.uniqueSpecies}/>
          <MiniStat label="大区" value={overview.uniqueRegions}/>
          <MiniStat label="收藏" value={overview.favCount}/>
        </div>
      </div>
      <StageFooter n={1}/>
    </Card>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="serif" style={{
        fontSize: 28,
        color: 'var(--ink)',
        fontWeight: 600,
        lineHeight: 1.1
      }}>{value}</div>
      <div className="cn-caps" style={{ marginTop: 4, fontSize: 9 }}>{label}</div>
    </div>
  );
}

/* ═══ Stage 1 · 最爱花种 ═══ */
function Stage1Species({ wrapped }) {
  const { topSpecies } = wrapped;
  const first = topSpecies[0];
  return (
    <Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="cn-caps" style={{ color: 'var(--zhusha)', textAlign: 'center' }}>
          你最爱的花
        </div>
        {first && (
          <>
            <div className="serif" style={{
              fontSize: 'clamp(36px, 10vw, 72px)',
              letterSpacing: '0.2em',
              marginTop: 20,
              color: 'var(--zhusha)',
              textAlign: 'center',
              fontWeight: 700
            }}>
              {first.species}
            </div>
            <div className="serif" style={{
              textAlign: 'center', color: 'var(--ink-2)',
              marginTop: 6, fontSize: 14, letterSpacing: '0.2em'
            }}>
              遇见 {first.count} 次
            </div>
          </>
        )}

        {topSpecies.length > 1 && (
          <div style={{ marginTop: 40 }}>
            <div className="cn-caps" style={{ textAlign: 'center', marginBottom: 12 }}>还有</div>
            {topSpecies.slice(1).map((s, i) => (
              <div key={s.species} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 20px',
                borderBottom: '1px dotted var(--line)'
              }}>
                <span className="serif" style={{ fontSize: 16, letterSpacing: '0.1em' }}>{s.species}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>× {s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <StageFooter n={2}/>
    </Card>
  );
}

/* ═══ Stage 2 · 足迹 ═══ */
function Stage2Regions({ wrapped }) {
  const { regions, favoriteSeason, seasonCount, monthCount } = wrapped;
  const maxM = Math.max(...monthCount, 1);
  return (
    <Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="cn-caps" style={{ color: 'var(--zhusha)', textAlign: 'center' }}>
          你的足迹
        </div>
        <div className="serif" style={{
          fontSize: 'clamp(24px, 6vw, 36px)',
          letterSpacing: '0.2em',
          textAlign: 'center',
          marginTop: 14,
          color: 'var(--ink)',
          fontWeight: 600
        }}>
          {regions.length} 个大区
        </div>
        <div className="serif" style={{
          textAlign: 'center', color: 'var(--ink-2)', marginTop: 4,
          fontSize: 13, letterSpacing: '0.15em'
        }}>
          最爱 {favoriteSeason}天 · 共 {seasonCount[favoriteSeason]} 次
        </div>

        {/* 月份柱状图 */}
        <div style={{ marginTop: 28, padding: '0 4%' }}>
          <div className="cn-caps" style={{ marginBottom: 8 }}>月度分布</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, alignItems: 'end', height: 80 }}>
            {monthCount.map((n, i) => (
              <div key={i} style={{
                height: `${(n / maxM) * 100}%`,
                minHeight: n > 0 ? 6 : 2,
                background: n > 0 ? 'var(--zhusha)' : 'var(--line)',
                borderRadius: 2,
                opacity: n > 0 ? 0.5 + (n / maxM) * 0.5 : 0.3
              }}/>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, marginTop: 4 }}>
            {monthCount.map((_, i) => (
              <div key={i} className="mono" style={{
                fontSize: 8, color: 'var(--ink-3)', textAlign: 'center'
              }}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* 足迹区域 */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, padding: '0 10%' }}>
            {regions.slice(0, 6).map(r => (
              <span key={r.region} style={{
                padding: '4px 10px',
                background: 'var(--bg-sunk)',
                borderRadius: 100,
                fontSize: 11,
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.1em',
                color: 'var(--ink-2)'
              }}>{r.region} · {r.count}</span>
            ))}
          </div>
        </div>
      </div>
      <StageFooter n={3}/>
    </Card>
  );
}

/* ═══ Stage 3 · 最有诗意的一笔 ═══ */
function Stage3Note({ wrapped }) {
  const { bestNote } = wrapped;
  return (
    <Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="cn-caps" style={{ color: 'var(--zhusha)', textAlign: 'center' }}>
          你最有诗意的一笔
        </div>
        {bestNote ? (
          <>
            <div className="serif" style={{
              fontSize: 14, color: 'var(--ink-2)',
              textAlign: 'center', marginTop: 20,
              letterSpacing: '0.15em'
            }}>
              {bestNote.spot.n} · {bestNote.spot.sp}
            </div>
            <div className="serif" style={{
              fontSize: 'clamp(14px, 3.5vw, 18px)',
              color: 'var(--ink)',
              lineHeight: 2.0,
              letterSpacing: '0.05em',
              marginTop: 24,
              padding: '20px 22px',
              background: 'var(--bg-sunk)',
              borderLeft: '2px solid var(--zhusha)',
              borderRadius: 'var(--radius-md)',
              fontStyle: 'italic'
            }}>
              「{bestNote.ck.note}」
            </div>
            <div style={{
              textAlign: 'center', marginTop: 18,
              fontSize: 11, color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.15em'
            }}>
              — {bestNote.ck.date}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center', color: 'var(--ink-3)',
            fontSize: 14, marginTop: 40, padding: '0 10%',
            fontStyle: 'italic', lineHeight: 2
          }}>
            这一年<br/>
            你还没写过花事笔记<br/>
            明年遇见花时<br/>
            记得留一笔
          </div>
        )}
      </div>
      <StageFooter n={4}/>
    </Card>
  );
}

/* ═══ Stage 4 · 送你的诗 ═══ */
function Stage4Poem({ wrapped }) {
  const { poem, year } = wrapped;
  return (
    <Card>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <div className="cn-caps" style={{ color: 'var(--zhusha)' }}>送你一首诗</div>
        {poem ? (
          <>
            <div className="serif" style={{
              fontSize: 11, color: 'var(--ink-3)', marginTop: 16,
              letterSpacing: '0.2em'
            }}>
              取自你最爱的 · {poem.species}
            </div>
            <div className="serif" style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              color: 'var(--ink)',
              lineHeight: 2.2,
              letterSpacing: '0.1em',
              marginTop: 32,
              padding: '0 8%',
              fontWeight: 500
            }}>
              {poem.lines && poem.lines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {!poem.lines && poem.text && <div>「{poem.text}」</div>}
            </div>
            <div className="serif" style={{
              fontSize: 13,
              color: 'var(--jin)',
              marginTop: 24,
              letterSpacing: '0.3em'
            }}>
              — {poem.author || ''}
            </div>
          </>
        ) : (
          <div style={{
            fontSize: 18,
            color: 'var(--ink-2)',
            marginTop: 40,
            letterSpacing: '0.2em',
            fontFamily: 'var(--font-serif)',
            lineHeight: 2
          }}>
            明年再遇花时<br/>
            会有诗送你
          </div>
        )}

        <div style={{
          marginTop: 'auto', padding: '32px 0 8px',
          color: 'var(--ink-3)', fontSize: 11,
          letterSpacing: '0.3em',
          fontFamily: 'var(--font-mono)'
        }}>
          — 花信风 · {year} —
        </div>
      </div>
    </Card>
  );
}

/* ═══ Stage footer · 翻页提示 ═══ */
function StageFooter({ n }) {
  return (
    <div style={{
      textAlign: 'center',
      paddingTop: 12,
      color: 'var(--ink-3)',
      fontSize: 10,
      letterSpacing: '0.25em',
      fontFamily: 'var(--font-mono)'
    }}>
      {n} / 5 · 点右箭头继续
    </div>
  );
}

/* ═══ FullExportSvg · 导出长图的 SVG ═══ */
function FullExportSvg({ wrapped }) {
  const { overview, topSpecies, regions, seasonCount, favoriteSeason, bestNote, poem, year, monthCount } = wrapped;
  const W = 720;
  const H = 1600;

  const maxM = Math.max(...monthCount, 1);

  return (
    <svg id="wrapped-export-svg" xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <radialGradient id="wrap-bg" cx="50%" cy="20%" r="90%">
          <stop offset="0%" stopColor="#faf2e3"/>
          <stop offset="100%" stopColor="#eee0c8"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#wrap-bg)"/>

      {/* 顶部印章 + 年份 */}
      <g transform="translate(40, 48)">
        <rect width="60" height="60" fill="#c23820" rx="3"/>
        <text x="30" y="28" textAnchor="middle" fontFamily="serif" fontSize="18" fill="#faf2e3" letterSpacing="2">花信</text>
        <text x="30" y="48" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#faf2e3" letterSpacing="4">风</text>
      </g>
      <text x={W - 40} y="80" textAnchor="end" fontFamily="serif" fontSize="28" fill="#2a1d13" letterSpacing="6" fontWeight="700">
        {year} 年花历
      </text>
      <text x={W - 40} y="106" textAnchor="end" fontFamily="monospace" fontSize="12" fill="#8a7560" letterSpacing="3">
        huaxinfeng · wrapped
      </text>

      {/* 屏 1 · 概览 */}
      <text x={W / 2} y="200" textAnchor="middle" fontFamily="serif" fontSize="20" fill="#c23820" letterSpacing="8">你的 {year}</text>
      <text x={W / 2} y="270" textAnchor="middle" fontFamily="serif" fontSize="24" fill="#2a1d13" letterSpacing="8">你走过</text>
      <text x={W / 2} y="370" textAnchor="middle" fontFamily="serif" fontSize="96" fill="#c23820" fontWeight="700">{overview.uniqueSpots}</text>
      <text x={W / 2} y="410" textAnchor="middle" fontFamily="serif" fontSize="18" fill="#5a4530" letterSpacing="6">处花事</text>

      <g transform="translate(90, 460)">
        <g transform="translate(0, 0)">
          <text fontFamily="serif" fontSize="32" fill="#2a1d13" fontWeight="600">{overview.totalCheckins}</text>
          <text y="24" fontFamily="monospace" fontSize="10" fill="#8a7560" letterSpacing="2">打卡次数</text>
        </g>
        <g transform="translate(180, 0)">
          <text fontFamily="serif" fontSize="32" fill="#2a1d13" fontWeight="600">{overview.uniqueSpecies}</text>
          <text y="24" fontFamily="monospace" fontSize="10" fill="#8a7560" letterSpacing="2">花种</text>
        </g>
        <g transform="translate(360, 0)">
          <text fontFamily="serif" fontSize="32" fill="#2a1d13" fontWeight="600">{overview.uniqueRegions}</text>
          <text y="24" fontFamily="monospace" fontSize="10" fill="#8a7560" letterSpacing="2">大区</text>
        </g>
        <g transform="translate(540, 0)">
          <text fontFamily="serif" fontSize="32" fill="#2a1d13" fontWeight="600">{overview.favCount}</text>
          <text y="24" fontFamily="monospace" fontSize="10" fill="#8a7560" letterSpacing="2">收藏</text>
        </g>
      </g>

      <line x1="100" y1="560" x2={W - 100} y2="560" stroke="#c8b898" strokeWidth="0.5"/>

      {/* 屏 2 · 最爱花 */}
      <text x={W / 2} y="630" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#c23820" letterSpacing="6">你最爱的花</text>
      {topSpecies[0] && (
        <>
          <text x={W / 2} y="720" textAnchor="middle" fontFamily="serif" fontSize="64" fill="#c23820" letterSpacing="10" fontWeight="700">
            {topSpecies[0].species}
          </text>
          <text x={W / 2} y="760" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#8a7560" letterSpacing="4">
            遇见 {topSpecies[0].count} 次
          </text>
        </>
      )}
      {topSpecies.length > 1 && (
        <g transform="translate(200, 820)">
          {topSpecies.slice(1).map((s, i) => (
            <text key={s.species} x="0" y={i * 28} fontFamily="serif" fontSize="16" fill="#5a4530" letterSpacing="3">
              {s.species} · {s.count} 次
            </text>
          ))}
        </g>
      )}

      <line x1="100" y1="920" x2={W - 100} y2="920" stroke="#c8b898" strokeWidth="0.5"/>

      {/* 屏 3 · 足迹 */}
      <text x={W / 2} y="990" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#c23820" letterSpacing="6">你的足迹</text>
      <text x={W / 2} y="1040" textAnchor="middle" fontFamily="serif" fontSize="28" fill="#2a1d13" letterSpacing="6" fontWeight="600">
        {regions.length} 个大区 · 最爱{favoriteSeason}天
      </text>
      {/* 月份柱 */}
      <g transform={`translate(${W / 2 - 240}, 1080)`}>
        {monthCount.map((n, i) => {
          const barH = (n / maxM) * 80;
          return (
            <g key={i} transform={`translate(${i * 40}, 0)`}>
              <rect x="0" y={80 - Math.max(2, barH)} width="28" height={Math.max(2, barH)} fill="#c23820" opacity={n > 0 ? 0.5 + (n / maxM) * 0.5 : 0.2} rx="2"/>
              <text x="14" y="100" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#8a7560">{i + 1}</text>
            </g>
          );
        })}
      </g>

      <line x1="100" y1="1230" x2={W - 100} y2="1230" stroke="#c8b898" strokeWidth="0.5"/>

      {/* 屏 4 · 诗意一笔 */}
      {bestNote ? (
        <g transform="translate(90, 1290)">
          <text fontFamily="monospace" fontSize="10" fill="#c23820" letterSpacing="4">最有诗意的一笔</text>
          <text y="30" fontFamily="serif" fontSize="14" fill="#8a7560" letterSpacing="3">{bestNote.spot.n} · {bestNote.spot.sp}</text>
          {wrapLongText(bestNote.ck.note, 30).slice(0, 3).map((line, i) => (
            <text key={i} y={60 + i * 26} fontFamily="serif" fontSize="15" fill="#2a1d13" fontStyle="italic" letterSpacing="2">
              「{line}」
            </text>
          ))}
        </g>
      ) : (
        <text x={W / 2} y="1320" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#8a7560" fontStyle="italic">
          这一年你还没写过笔记
        </text>
      )}

      <line x1="100" y1="1430" x2={W - 100} y2="1430" stroke="#c8b898" strokeWidth="0.5"/>

      {/* 屏 5 · 送诗 */}
      {poem && poem.lines && (
        <g transform="translate(90, 1480)">
          <text fontFamily="monospace" fontSize="10" fill="#c23820" letterSpacing="4">送你的诗 · 取自 {poem.species}</text>
          {poem.lines.slice(0, 2).map((line, i) => (
            <text key={i} y={40 + i * 28} fontFamily="serif" fontSize="18" fill="#2a1d13" letterSpacing="4" fontWeight="500">
              {line}
            </text>
          ))}
          {poem.author && (
            <text y={40 + poem.lines.length * 28 + 10} fontFamily="serif" fontSize="12" fill="#c89a4a" letterSpacing="4">
              — {poem.author}
            </text>
          )}
        </g>
      )}

      {/* 底部 URL */}
      <text x={W / 2} y={H - 28} textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#a08970" letterSpacing="4">
        shihua.vercel.app · 花信风
      </text>
    </svg>
  );
}

// 简单中文断行 · 按字数
function wrapLongText(text, n) {
  if (!text) return [];
  const lines = [];
  for (let i = 0; i < text.length; i += n) {
    lines.push(text.slice(i, i + n));
  }
  return lines;
}
