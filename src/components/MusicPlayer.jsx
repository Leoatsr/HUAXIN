import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { InstrIcon } from '../ui/InstrIcon.jsx';
import { getAC, playN } from '../utils/audio.js';
import { TRACKS, INST_CONF, INST_LABEL, INST_CATEGORY } from '../data/music.js';

/* ═══════════════════════════════════════════════════════════════
   MusicPlayer · 国乐播放器
   ───────────────────────────────────────────────────────────────
   anchor='topbar'（默认·v6.3.5）嵌入 TopBar · inline flex 元素
   anchor='float'  浮动 · 右上 top:60 right:20
   ═══════════════════════════════════════════════════════════════ */
export function MusicPlayer({ anchor = 'topbar' }) {
  const [show, setShow] = useState(false);
  const [ti, setTi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selInst, setSelInst] = useState('all');

  const tmRef = useRef(null);
  const niRef = useRef(0);
  const loopRef = useRef(0);
  const playRef = useRef(false);

  // 按乐器筛选
  const filteredTracks = useMemo(() =>
    selInst === 'all' ? TRACKS : TRACKS.filter(tr => tr.inst === selInst),
    [selInst]);
  const t = filteredTracks[ti % Math.max(1, filteredTracks.length)] || TRACKS[0];

  // 停止
  const stop = useCallback(() => {
    playRef.current = false;
    if (tmRef.current) clearTimeout(tmRef.current);
    setPlaying(false);
  }, []);

  // 播放
  const play = useCallback((idx, trackList) => {
    stop();
    const list = trackList || filteredTracks;
    if (!list.length) return;
    const tr = list[idx % list.length];
    const ic = INST_CONF[tr.inst] || INST_CONF.guqin;
    niRef.current = 0;
    loopRef.current = 0;
    playRef.current = true;
    setPlaying(true);
    const beatMs = 60000 / tr.bpm;
    // 开场低频音（古琴泛音）
    playN(ic.scale[0] / 2, 6, 'sine', ic.vol * 0.2);

    const tick = () => {
      if (!playRef.current) return;
      const [ni, dur] = tr.notes[niRef.current % tr.notes.length];
      if (ni >= 0) {
        const freq = ic.scale[ni % ic.scale.length];
        const d = dur * beatMs / 1000;
        const pan = (Math.random() - 0.5) * 0.4;
        playN(freq, d, ic.wave, ic.vol, pan);
        // 25% 概率加高八度和声
        if (Math.random() > 0.75) {
          playN(freq * 1.5, d * 0.6, ic.wave, ic.vol * 0.25, pan);
        }
      }
      niRef.current++;
      if (niRef.current >= tr.notes.length) {
        niRef.current = 0;
        loopRef.current++;
        // 循环两次后切下一首
        if (loopRef.current >= 2) {
          const next = (idx + 1) % list.length;
          setTi(next);
          play(next, list);
          return;
        }
        playN(ic.scale[0] / 2, 5, 'sine', ic.vol * 0.15);
      }
      tmRef.current = setTimeout(tick, dur * beatMs + (ni < 0 ? 100 : 0));
    };
    tick();
  }, [stop, filteredTracks]);

  const toggle = () => {
    if (playing) stop();
    else { getAC(); play(ti, filteredTracks); }
  };
  const next = () => {
    const n = (ti + 1) % filteredTracks.length;
    setTi(n);
    if (playing) play(n, filteredTracks);
  };
  const prev = () => {
    const n = (ti - 1 + filteredTracks.length) % filteredTracks.length;
    setTi(n);
    if (playing) play(n, filteredTracks);
  };
  const random = () => {
    const insts = ['all', ...Object.keys(INST_CONF)];
    const rInst = insts[Math.floor(Math.random() * insts.length)];
    setSelInst(rInst);
    const newList = rInst === 'all' ? TRACKS : TRACKS.filter(tr => tr.inst === rInst);
    const rIdx = Math.floor(Math.random() * newList.length);
    setTi(rIdx);
    getAC();
    play(rIdx, newList);
  };
  const pickInst = (k) => {
    setSelInst(k);
    setTi(0);
    const newList = k === 'all' ? TRACKS : TRACKS.filter(tr => tr.inst === k);
    if (playing) play(0, newList);
  };

  // 键盘快捷键（仅在展开且不在输入框时）
  useEffect(() => {
    if (!show) return;
    const h = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      const insts = ['all', ...Object.keys(INST_CONF)];
      const curIdx = insts.indexOf(selInst);
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        pickInst(insts[(curIdx - 1 + insts.length) % insts.length]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        pickInst(insts[(curIdx + 1) % insts.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line
  }, [show, selInst, ti, playing, filteredTracks.length]);

  // 收起形态
  if (!show) {
    // topbar 模式：紧凑 · 内联 · 30x28 小长方形按钮
    if (anchor === 'topbar') {
      return (
        <button onClick={() => setShow(true)}
          title={playing ? `${t.name} · ${INST_LABEL[t.inst]}` : '国 乐'}
          style={{
            width: 30, height: 26,
            borderRadius: 5,
            border: playing ? '1px solid var(--zhusha)' : '1px solid var(--line)',
            cursor: 'pointer', padding: 0,
            background: 'var(--bg-sunk)',
            display: 'grid', placeItems: 'center',
            position: 'relative'
          }}>
          <InstrIcon type={t.inst} size={14}/>
          {playing && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--zhusha)',
              border: '2px solid var(--bg)',
              animation: 'hx-pulse 1.5s ease-in-out infinite'
            }}/>
          )}
        </button>
      );
    }
    // float 模式：右上浮动（保留作备用）
    return (
      <button onClick={() => setShow(true)}
        title={playing ? `${t.name} · ${INST_LABEL[t.inst]}` : '国 乐'}
        style={{
          position: 'fixed', top: 60, right: 20, zIndex: 90,
          width: 40, height: 40, borderRadius: '50%',
          border: playing ? '2px solid var(--zhusha)' : '1px solid var(--line)',
          cursor: 'pointer', padding: 0,
          background: 'var(--bg-elev)',
          boxShadow: 'var(--shadow-md)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-serif)'
        }}>
        <div style={{ position: 'relative' }}>
          <InstrIcon type={t.inst} size={22}/>
          {playing && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--zhusha)',
              border: '2px solid var(--bg-elev)',
              animation: 'hx-pulse 1.5s ease-in-out infinite'
            }}/>
          )}
        </div>
      </button>
    );
  }

  // 展开形态 · topbar 模式下 dropdown 从按钮下方弹出
  const panelStyle = anchor === 'topbar'
    ? {
        position: 'absolute', top: 52, right: 0, zIndex: 110,
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: 14, width: 320,
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)'
      }
    : {
        position: 'fixed', top: 60, right: 20, zIndex: 90,
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        padding: 14, width: 320,
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)'
      };

  return (
    <div style={{ position: anchor === 'topbar' ? 'relative' : 'static' }}>
      {anchor === 'topbar' && (
        <button onClick={() => setShow(false)}
          title="收起"
          style={{
            width: 30, height: 26,
            borderRadius: 5,
            border: '1px solid var(--zhusha)',
            cursor: 'pointer', padding: 0,
            background: 'var(--bg-sunk)',
            display: 'grid', placeItems: 'center'
          }}>
          <InstrIcon type={t.inst} size={14}/>
        </button>
      )}
      <div style={panelStyle}>
      {/* 头部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10
      }}>
        <div className="cn-caps" style={{ fontSize: 11 }}>国乐 · 听花</div>
        <button onClick={() => setShow(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-3)', padding: 2 }}>
          <Icon.close/>
        </button>
      </div>

      {/* 乐器筛选（按家族分类） */}
      <div style={{ marginBottom: 10, maxHeight: 180, overflowY: 'auto' }}>
        {/* 全部 + 随机 */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <button onClick={() => pickInst('all')}
            style={{ ...instBtnStyle(selInst === 'all'), flex: 1 }}>全部</button>
          <button onClick={random}
            style={{
              ...instBtnStyle(false), flex: 1,
              background: 'color-mix(in oklch, var(--zhusha) 15%, var(--bg))',
              color: 'var(--zhusha)',
              borderColor: 'color-mix(in oklch, var(--zhusha) 30%, var(--bg))'
            }}>随机</button>
        </div>
        {/* 4 个家族 */}
        {INST_CATEGORY.map(cat => (
          <div key={cat.key} style={{ marginBottom: 6 }}>
            <div className="cn-caps" style={{
              fontSize: 9, letterSpacing: '0.3em',
              color: 'var(--ink-3)', marginBottom: 3, paddingLeft: 2
            }}>{cat.label}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {cat.insts.map(k => (
                <button key={k} onClick={() => pickInst(k)}
                  style={instBtnStyle(selInst === k)}>
                  {INST_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 当前播放 */}
      <div style={{
        background: 'var(--bg-sunk)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <InstrIcon type={t.inst} size={28}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{
            fontSize: 14, color: 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            letterSpacing: '0.05em'
          }}>{t.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
            {INST_LABEL[t.inst]} · {t.era} · {(ti % filteredTracks.length) + 1}/{filteredTracks.length}
          </div>
        </div>
      </div>

      {/* 控制 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14
      }}>
        <button onClick={prev} className="btn sm ghost" style={{
          border: 'none', padding: 6, fontSize: 14
        }} title="上一首">◁</button>
        <button onClick={toggle}
          style={{
            border: 'none', background: 'var(--ink)', color: 'var(--bg)',
            borderRadius: '50%', width: 42, height: 42, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            fontSize: 16
          }}>
          {playing ? '❙❙' : '▶'}
        </button>
        <button onClick={next} className="btn sm ghost" style={{
          border: 'none', padding: 6, fontSize: 14
        }} title="下一首">▷</button>
      </div>

      {/* 键盘提示 */}
      <div style={{
        fontSize: 9, color: 'var(--ink-3)',
        textAlign: 'center', marginTop: 10, opacity: 0.6,
        fontFamily: 'var(--font-mono)', letterSpacing: '0.1em'
      }}>
        ↑↓ 乐器 · ←→ 曲目 · Space 播放
      </div>

      {/* 进度条 */}
      {playing && (
        <div style={{
          height: 2, borderRadius: 1, background: 'var(--line-2)',
          overflow: 'hidden', marginTop: 8
        }}>
          <div style={{
            height: '100%', width: '60%', borderRadius: 1,
            background: 'linear-gradient(90deg, var(--zhusha), var(--qing))',
            animation: 'hx-progress 3s linear infinite'
          }}/>
        </div>
      )}
      </div>
    </div>
  );
}

function instBtnStyle(active) {
  return {
    border: `1px solid ${active ? 'var(--zhusha)' : 'var(--line-2)'}`,
    borderRadius: 12,
    padding: '3px 8px',
    cursor: 'pointer',
    fontSize: 10,
    background: active ? 'color-mix(in oklch, var(--zhusha) 12%, var(--bg))' : 'transparent',
    color: active ? 'var(--zhusha)' : 'var(--ink-2)',
    fontWeight: active ? 600 : 400,
    fontFamily: 'var(--font-serif)',
    letterSpacing: '0.05em'
  };
}
