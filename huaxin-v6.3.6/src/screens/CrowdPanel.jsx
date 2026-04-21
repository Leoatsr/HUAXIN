import React, { useState, useMemo } from 'react';
import { Icon, PetalMark } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   花讯播报 · 众包实况
   - 用户可提交某景点当前花况
   - 显示全部播报（伪造几条 + 用户自提）
   - 数据存 localStorage（单机版，没有真实后端）
   ═══════════════════════════════════════════════════════════════ */

const SEED_REPORTS = [
  { spotName: '洛阳·国花园',  sp: '牡丹',    status: 'peak',   note: '国花正盛，早晚人少', minsAgo: 30 },
  { spotName: '杭州·太子湾',  sp: '樱花',    status: 'peak',   note: '花瓣开始飘落，拍雨中花瓣正好', minsAgo: 55 },
  { spotName: '伊犁·霍城',    sp: '薰衣草',  status: 'budding',note: '花苞初现，预计半月后盛花', minsAgo: 90 },
  { spotName: '苏州·拙政园',  sp: '紫藤',    status: 'early',  note: '初绽一小片，主藤架要再等几日', minsAgo: 120 },
  { spotName: '南京·鸡鸣寺',  sp: '樱花',    status: 'fading', note: '满树转为新绿，落樱成阵', minsAgo: 180 },
  { spotName: '广州·流花湖',  sp: '木棉',    status: 'faded',  note: '花期已过，果荚初结', minsAgo: 300 }
];

const STATUS_OPTS = [
  { k: 'peak',    l: '盛花期',     c: 'var(--zhusha)' },
  { k: 'early',   l: '初花期',     c: 'var(--jin)' },
  { k: 'budding', l: '含苞待放',   c: 'var(--qing)' },
  { k: 'fading',  l: '末花将谢',   c: 'var(--ink-3)' },
  { k: 'faded',   l: '已谢',       c: 'var(--ink-4)' }
];

export function CrowdPanel({ flora, onBack, onSelectSpot }) {
  const [reports, setReports] = useState(() => {
    const saved = read('crowdReports');
    return saved || [];
  });

  // 提交表单状态
  const [selSpot, setSelSpot] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');

  // 搜索景点
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return flora
      .filter(f => (f.n || '').toLowerCase().includes(q) ||
                   (f.sp || '').toLowerCase().includes(q))
      .slice(0, 5);
  }, [search, flora]);

  const submit = () => {
    if (!selSpot || !status) return;
    const newReport = {
      id: `r-${Date.now()}`,
      spotId: selSpot.id,
      spotName: selSpot.n,
      sp: selSpot.sp,
      rg: selSpot.rg,
      status,
      note: note.trim(),
      ts: Date.now()
    };
    const next = [newReport, ...reports].slice(0, 50);
    setReports(next);
    write('crowdReports', next);
    setSelSpot(null);
    setSearch('');
    setStatus('');
    setNote('');
  };

  // 合并伪数据
  const allReports = useMemo(() => {
    const now = Date.now();
    const seeded = SEED_REPORTS.map((r, i) => ({
      ...r,
      id: `seed-${i}`,
      ts: now - r.minsAgo * 60 * 1000,
      rg: '—'
    }));
    return [...reports, ...seeded].sort((a, b) => b.ts - a.ts);
  }, [reports]);

  const timeLabel = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    if (mins < 1440) return `${Math.floor(mins / 60)} 小时前`;
    return `${Math.floor(mins / 1440)} 天前`;
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="实况众包 · 以众致精"
        title="花 讯 播 报"
        sub={<>{allReports.length} 条实况 · 帮助其他花友及时决策</>}
        onBack={onBack}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 380px) 1fr',
        gap: 20,
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        alignItems: 'start'
      }}>
        {/* ─── 左：提交花讯 ─── */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
          <div className="cn-caps" style={{ marginBottom: 14 }}>提 交 花 讯</div>

          {/* 搜索景点 */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>① 选择景点</div>
            {!selSpot && (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg)'
                }}>
                  <Icon.search/>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="搜索景点或花种"
                    style={{
                      border: 'none', outline: 'none', background: 'transparent',
                      flex: 1, fontFamily: 'var(--font-sans)', fontSize: 13
                    }}/>
                </div>
                {searchResults.length > 0 && (
                  <div style={{ marginTop: 6, maxHeight: 180, overflow: 'auto' }}>
                    {searchResults.map(s => (
                      <button key={s.id}
                        onClick={() => { setSelSpot(s); setSearch(''); }}
                        style={{
                          width: '100%', padding: '8px 10px',
                          background: 'var(--bg)',
                          border: '1px solid var(--line-2)',
                          borderRadius: 6,
                          cursor: 'pointer', textAlign: 'left',
                          marginTop: 4
                        }}>
                        <div className="serif" style={{ fontSize: 12 }}>{s.n}</div>
                        <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{s.sp} · {s.rg}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {selSpot && (
              <div style={{
                padding: '10px 12px',
                background: 'var(--bg-sunk)',
                border: '1px solid var(--zhusha)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <Icon.flower/>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 13 }}>{selSpot.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{selSpot.sp}</div>
                </div>
                <button onClick={() => setSelSpot(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-3)' }}>
                  <Icon.close/>
                </button>
              </div>
            )}
          </div>

          {/* 选状态 */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>② 花期状态</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_OPTS.map(opt => (
                <button key={opt.k} onClick={() => setStatus(opt.k)}
                  className="btn sm"
                  style={{
                    background: status === opt.k ? opt.c : 'transparent',
                    color: status === opt.k ? 'var(--paper)' : opt.c,
                    borderColor: opt.c
                  }}>{opt.l}</button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>③ 补充（可选）</div>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="比如：周末人多 / 花瓣正飘落"
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-sans)', fontSize: 12,
                background: 'var(--bg)', color: 'var(--ink)'
              }}/>
          </div>

          <button className="btn zhusha"
            onClick={submit}
            disabled={!selSpot || !status}
            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
            <Icon.check/> 发布花讯
          </button>
        </div>

        {/* ─── 右：播报列表 ─── */}
        <div>
          <div className="cn-caps" style={{ marginBottom: 14 }}>最 新 花 讯</div>
          {allReports.map(r => {
            const opt = STATUS_OPTS.find(s => s.k === r.status);
            return (
              <div key={r.id} className="card" style={{
                padding: '14px 18px',
                marginBottom: 10,
                borderLeft: `3px solid ${opt ? opt.c : 'var(--line)'}`,
                display: 'flex', alignItems: 'flex-start', gap: 14
              }}>
                <PetalMark peak={r.status === 'peak'}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => {
                      const spot = flora.find(f => f.n === r.spotName);
                      if (spot && onSelectSpot) onSelectSpot(spot.id);
                    }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: 0, fontFamily: 'var(--font-serif)', fontSize: 14,
                        color: 'var(--ink)', letterSpacing: '0.03em'
                      }}>
                      {r.spotName}
                    </button>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {timeLabel(r.ts)}
                    </span>
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="pill zhusha" style={{ fontSize: 10 }}>{r.sp}</span>
                    {opt && (
                      <span className="pill" style={{
                        fontSize: 10,
                        background: `color-mix(in oklch, ${opt.c} 10%, var(--bg))`,
                        color: opt.c,
                        borderColor: `color-mix(in oklch, ${opt.c} 25%, var(--bg))`
                      }}>
                        {opt.l}
                      </span>
                    )}
                  </div>
                  {r.note && (
                    <div style={{
                      marginTop: 8, fontSize: 12,
                      color: 'var(--ink-2)',
                      fontFamily: 'var(--font-serif)',
                      lineHeight: 1.6
                    }}>
                      ▸ {r.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {allReports.length === 0 && (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)' }}>
              还没有花讯 · 来做第一个播报人
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
