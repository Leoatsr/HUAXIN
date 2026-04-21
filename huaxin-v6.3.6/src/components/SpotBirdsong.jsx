import React, { useState, useCallback, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   SpotBirdsong · 景点鸟鸣内联组件
   ───────────────────────────────────────────────────────────────
   设计原则：
     · 初始态：一行"听此地鸟鸣？"按钮（不主动加载 · 避免消耗流量）
     · 点击后：调 /api/birds?lat=X&lon=Y&season=Z
     · 成功：显示小播放器 · 可切换 · 可暂停
     · 失败：显示"此地暂无录音" · 不强塞其他音
     · 播放器嵌在 SpotDetail 内 · 不浮动
   
   Props:
     spot  · { id, lat, lon, n, sp }
     season · 'spring' | 'summer' | 'autumn' | 'winter'
   ═══════════════════════════════════════════════════════════════ */

export function SpotBirdsong({ spot, season = 'spring' }) {
  const [state, setState] = useState('idle');  // 'idle' | 'loading' | 'ready' | 'empty' | 'error'
  const [birds, setBirds] = useState([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState(null);
  const audioRef = useRef(null);

  // spot 变化 · 重置 · 并静默探测
  useEffect(() => {
    setState('probing');  // 静默探测中 · 不显示任何 UI
    setBirds([]);
    setIdx(0);
    setPlaying(false);
    setMessage(null);
    if (audioRef.current) audioRef.current.pause();

    if (!spot?.lat || !spot?.lon) {
      setState('empty');
      return;
    }

    let cancelled = false;
    const probe = async () => {
      try {
        const url = `/api/birds?lat=${spot.lat}&lon=${spot.lon}&season=${season}`;
        const res = await fetch(url);
        if (cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.results?.length) {
          setBirds(data.results);
          setState('discovered');  // 发现了 · 但还没开播 · 等用户点
        } else {
          setState('empty');  // 什么都不显示
        }
      } catch (e) {
        if (!cancelled) setState('empty');
      }
    };
    probe();
    return () => { cancelled = true; };
  }, [spot?.id, spot?.lat, spot?.lon, season]);

  // 播放控制
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !birds.length) return;
    if (!playing) { a.pause(); return; }
    const b = birds[idx];
    if (!b?.url) return;
    a.src = b.url;
    a.loop = false;
    a.volume = 0.5;
    const p = a.play();
    if (p && p.catch) {
      p.catch(err => {
        console.warn('bird audio fail', err);
        // 自动跳下一条
        if (birds.length > 1) {
          setIdx(i => (i + 1) % birds.length);
        } else {
          setPlaying(false);
          setMessage('此条播放失败');
        }
      });
    }
  }, [playing, idx, birds]);

  // 用户点"听一听" · 把已探测的 birds 变为播放状态
  const startListening = useCallback(() => {
    if (birds.length > 0) {
      setIdx(0);
      setState('ready');
      setPlaying(true);
    }
  }, [birds]);

  if (!spot) return null;

  // ═══ 静默探测中 / 空 / 错误 · 都不显示任何 UI ═══
  if (state === 'probing' || state === 'empty' || state === 'error') {
    return null;
  }

  // ═══ discovered 态 · 探测到有 · 推送给用户 ═══
  if (state === 'discovered') {
    return (
      <section style={{
        margin: '14px 20px',
        padding: '12px 14px',
        background: 'color-mix(in oklch, var(--qing) 8%, var(--bg-elev))',
        border: '1px solid var(--qing)',
        borderLeft: '3px solid var(--qing)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        animation: 'fadeIn 0.4s ease-out'
      }}>
        <span style={{ fontSize: 18 }}>🐦</span>
        <span className="serif" style={{
          flex: 1,
          fontSize: 12,
          color: 'var(--ink)',
          letterSpacing: '0.08em',
          lineHeight: 1.7,
          fontWeight: 600
        }}>
          此地发现 <span style={{ color: 'var(--zhusha)' }}>{birds.length}</span> 种真实鸟鸣录音
        </span>
        <button onClick={startListening}
          style={{
            background: 'var(--qing)',
            color: 'var(--paper)',
            border: 'none',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.2em',
            fontWeight: 600
          }}>
          听一听
        </button>
      </section>
    );
  }

  // ═══ ready 态 · 播放器（用户已点"听一听"后）═══
  const bird = birds[idx];
  return (
    <section style={{
      margin: '14px 20px',
      padding: '14px 16px',
      background: 'color-mix(in oklch, var(--qing) 5%, var(--paper))',
      border: '1px solid var(--qing)',
      borderLeft: '3px solid var(--qing)',
      borderRadius: 'var(--radius-sm)'
    }}>
      <audio ref={audioRef}
        preload="none"
        onEnded={() => {
          if (birds.length > 1) {
            setIdx(i => (i + 1) % birds.length);
            setPlaying(true);
          } else {
            setPlaying(false);
          }
        }}
        onError={() => {
          if (birds.length > 1) {
            setIdx(i => (i + 1) % birds.length);
          } else {
            setPlaying(false);
            setMessage('播放失败');
          }
        }}
      />

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8
      }}>
        <span style={{ fontSize: 14 }}>🐦</span>
        <span className="serif" style={{
          flex: 1,
          fontSize: 13,
          color: 'var(--ink)',
          fontWeight: 600,
          letterSpacing: '0.08em'
        }}>
          {bird?.birdCn || bird?.bird || '未知鸟种'}
        </span>
        <span className="mono" style={{
          fontSize: 9,
          color: 'var(--ink-3)',
          letterSpacing: '0.15em'
        }}>
          {idx + 1}/{birds.length}
        </span>
      </div>

      <div style={{
        fontSize: 10,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-serif)',
        letterSpacing: '0.1em',
        marginBottom: 10,
        lineHeight: 1.7
      }}>
        录于 {bird?.location || '—'} · {bird?.recordist || '匿名'}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setPlaying(v => !v)}
          style={{
            flex: 1,
            background: playing ? 'var(--zhusha)' : 'var(--qing)',
            color: 'var(--paper)',
            border: 'none',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.2em',
            fontWeight: 600
          }}>
          {playing ? '暂 停' : '播 放'}
        </button>
        {birds.length > 1 && (
          <button onClick={() => { setIdx(i => (i + 1) % birds.length); setPlaying(true); }}
            style={{
              background: 'transparent',
              color: 'var(--qing)',
              border: '1px solid var(--qing)',
              padding: '7px 12px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.15em'
            }}>
            换 一 条
          </button>
        )}
        <button onClick={() => { setState('idle'); setPlaying(false); setBirds([]); }}
          title="收起"
          style={{
            background: 'transparent',
            color: 'var(--ink-3)',
            border: '1px solid var(--line)',
            padding: '7px 10px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 12
          }}>×</button>
      </div>

      {message && (
        <div style={{
          marginTop: 6,
          fontSize: 10,
          color: 'var(--zhusha)',
          textAlign: 'center',
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.1em'
        }}>{message}</div>
      )}

      <div style={{
        marginTop: 8,
        fontSize: 9,
        color: 'var(--ink-4)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.2em',
        textAlign: 'right'
      }}>
        CC · xeno-canto
      </div>
    </section>
  );
}
