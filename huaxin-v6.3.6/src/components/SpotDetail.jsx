import React, { useState, useEffect, useMemo } from 'react';
import { Icon, Seal, Placeholder, StatusPill } from '../ui/atoms.jsx';
import { SpotImage } from './SpotImage.jsx';
import { TravelTools } from './TravelTools.jsx';
import { SpotBirdsong } from './SpotBirdsong.jsx';
// 旧 SpotBirdSound 已合并到 SpotBirdsong · 不再使用
import { EtiquetteTips } from './EtiquetteTips.jsx';
import { EmptyState } from './StateViews.jsx';
import { HAS_WIKI } from '../data/constants.js';
import { HUAXIN_POEMS } from '../data/huaxin.js';
import { addBloomReport, summarizeReports, calculateConfidence } from '../utils/bloom-feedback.js';
import { trackBloomReport } from '../utils/analytics.js';
import { recommendPoemsForSpot } from '../utils/poem-match.js';

/* ═══════════════════════════════════════════════════════════════
   景点详情 · 右侧栏
   Props: spot 当前景点, isFav/onFav, isChecked/onCheckin,
          inTrip/onTripToggle, onShowWiki, onShare
   ═══════════════════════════════════════════════════════════════ */
export function SpotDetail({
  spot,
  isFav, onFav,
  isChecked, onCheckin,
  inTrip, onTripToggle,
  onShowWiki, onShare,
  highlighted  // 从引导跳进来时为 true · 显示"为你挑的"印章 + 呼吸
}) {
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinBloom, setCheckinBloom] = useState(null); // 开花进度：bud/early/peak/late/past
  const [showHighlight, setShowHighlight] = useState(!!highlighted);
  const [quickReport, setQuickReport] = useState(null); // 'reporting' | 'thanks' | null

  // 3 秒后自动消隐
  useEffect(() => {
    if (!highlighted) return;
    setShowHighlight(true);
    const t = setTimeout(() => setShowHighlight(false), 4500);
    return () => clearTimeout(t);
  }, [highlighted, spot?.id]);

  // 花友实测反馈（最近 30 天）· 动态可信度
  // 注意：必须在早退 return 之前调用全部 hooks · 即使 spot 为 null
  const bloomSummary = useMemo(
    () => spot ? summarizeReports(spot.id) : null,
    [spot?.id, isChecked]
  );
  const confidenceData = useMemo(
    () => spot ? calculateConfidence(spot._st?.l ?? 0, spot.id) : null,
    [spot?.id, spot?._st?.l, isChecked]
  );

  // 与此景相关的诗（12 首精选中）
  const relatedPoems = useMemo(
    () => spot ? recommendPoemsForSpot(spot, 3) : [],
    [spot?.id, spot?.sp]
  );

  // ═══ 以下是早退 · 所有 hooks 都已在上方调用 ═══
  if (!spot) {
    return (
      <EmptyState
        variant="inline"
        title="点一处花事"
        sub="地图上任选"
      />
    );
  }

  const s = spot;
  const poem = HUAXIN_POEMS[s.sp];
  const pred = s._pred;
  const st = s._st;
  const atRatio = Math.min(100, Math.round(((s._at || 0) / s.th) * 100));

  const dynamicConfidence = confidenceData?.score ?? pred?.confidence ?? 45;

  // 7 日模拟温度（简单伪随机）
  const weekTemps = [];
  for (let i = 0; i < 7; i++) {
    const seed = (s.id * 7 + i * 3) % 10;
    weekTemps.push(14 + Math.floor(seed * 1.2));
  }

  const handleCheckin = () => {
    if (isChecked) return;
    onCheckin && onCheckin(s.id, checkinNote, checkinBloom);
    setCheckinOpen(false);
    setCheckinNote('');
    setCheckinBloom(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* ─── Hero ─── */}
      <div style={{ position: 'relative', padding: 20, borderBottom: '1px solid var(--line-2)' }}>
        <div style={{ position: 'absolute', top: 28, right: 28, zIndex: 2 }}>
          <Seal size="sm" rotate={-6}>{s.rg}</Seal>
        </div>

        {/* 为你挑的 · 引导跳入时显示 */}
        {showHighlight && (
          <>
            <div className="hx-picked-seal" style={{
              position: 'absolute',
              top: 28, left: 28, zIndex: 3
            }}>
              <div style={{
                width: 58, height: 58,
                borderRadius: 6,
                background: 'var(--zhusha)',
                color: 'var(--paper)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.1em',
                lineHeight: 1.35,
                transform: 'rotate(-6deg)',
                boxShadow: '0 4px 12px color-mix(in oklch, var(--zhusha) 35%, transparent)',
                border: '2px solid var(--paper)',
                outline: '1.5px solid var(--zhusha)'
              }}>
                <span>为你</span>
                <span>挑的</span>
              </div>
            </div>
            {/* 图片外层呼吸光环 */}
            <div style={{
              position: 'absolute',
              top: 20, left: 20, right: 20,
              aspectRatio: '16/10',
              borderRadius: 'var(--radius-md)',
              pointerEvents: 'none',
              zIndex: 1,
              boxShadow: '0 0 0 2px var(--zhusha), 0 0 0 10px color-mix(in oklch, var(--zhusha) 20%, transparent)',
              animation: 'hx-picked-glow 2s ease-in-out infinite'
            }}/>
          </>
        )}

        <SpotImage
          species={s.sp}
          name={s.n}
          hashSeed={s.id}
          aspect="16/10"
        />
        <div style={{ marginTop: 16 }}>
          <div className="cn-caps">{s.rg} · {s.pk ? `${s.pk[0]}月-${s.pk[1]}月盛花` : '花期未定'}</div>
          <div className="serif" style={{ fontSize: 22, marginTop: 6, letterSpacing: '0.05em' }}>{s.n}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="pill zhusha"><Icon.flower/> {s.sp}</span>
            {st && <StatusPill st={st.st} l={st.l}/>}
            {s._at && <span className="pill qing"><Icon.thermo/> 积温 {s._at}°C·d</span>}
          </div>
        </div>
      </div>

      {/* 鸟鸣组件现在移到下方 · TravelTools 之后 */}
      {/* ─── 花期预测 ─── */}
      {pred && (
        <section style={{ padding: 20, borderBottom: '1px solid var(--line-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="cn-caps">花期预测</div>
              <div className="serif" style={{ fontSize: 16, marginTop: 4 }}>
                {pred.daysUntil <= 0 ? '已在花期' :
                 pred.daysUntil <= 7 ? `约 ${pred.daysUntil} 日后盛花` :
                 `预计 ${pred.dateStr}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="serif" style={{ fontSize: 28, color: 'var(--zhusha)' }}>
                {dynamicConfidence}
                <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 2 }}>%</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                {bloomSummary && bloomSummary.total >= 3 ? `${bloomSummary.total} 位花友实测` : 'CONFIDENCE'}
              </div>
            </div>
          </div>

          {/* 物候进度条 · 休眠 → 末花 */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-serif)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.15em' }}>
              <span>休眠</span><span>营养</span><span>花芽</span><span>初花</span><span>盛花</span><span>末花</span>
            </div>
            <div style={{ position: 'relative', height: 28, marginTop: 6 }}>
              <div style={{ position: 'absolute', top: 13, left: 0, right: 0, height: 2, background: 'var(--line)' }}/>
              {/* 当前进度 = st.l / 4 */}
              <div style={{ position: 'absolute', top: 13, left: 0,
                width: `${((st?.l || 0) / 4) * 100}%`, height: 2, background: 'var(--zhusha)' }}/>
              {[0, 20, 40, 60, 80].map((p, i) => {
                const passed = (st?.l || 0) >= i;
                const isCurrent = (st?.l || 0) === i;
                return (
                  <div key={i} style={{
                    position: 'absolute', left: `${p}%`, top: isCurrent ? 8 : 11,
                    transform: 'translateX(-50%)',
                    width: isCurrent ? 12 : 6, height: isCurrent ? 12 : 6, borderRadius: '50%',
                    background: passed ? 'var(--zhusha)' : 'var(--bg)',
                    border: passed ? 'none' : '1.5px solid var(--ink-4)',
                    boxShadow: isCurrent ? '0 0 0 3px var(--bg), 0 0 0 4px var(--zhusha)' : 'none'
                  }}/>
                );
              })}
            </div>
          </div>

          {/* 积温条 */}
          {s._at != null && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="cn-caps">活动积温</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>
                  {s._at} / {s.th} °C·d
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-sunk)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${atRatio}%`, height: '100%',
                  background: 'linear-gradient(90deg, var(--qing), var(--zhusha))' }}/>
              </div>
            </div>
          )}

          {/* 花友实测 · 快捷反馈 */}
          <div style={{
            marginTop: 18,
            padding: '14px 16px',
            background: 'color-mix(in oklch, var(--qing) 6%, var(--bg-elev))',
            border: '1px solid color-mix(in oklch, var(--qing) 25%, var(--line))',
            borderLeft: '2px solid var(--qing)',
            borderRadius: 'var(--radius-md)'
          }}>
            {quickReport === 'thanks' ? (
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <div className="serif" style={{ fontSize: 14, color: 'var(--qing)', letterSpacing: '0.1em' }}>
                  🌸 已记录 · 谢谢你
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, fontFamily: 'var(--font-serif)' }}>
                  你的实况会影响下次预测的准确度
                </div>
              </div>
            ) : bloomSummary && bloomSummary.total >= 3 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="cn-caps">花友实测 · {bloomSummary.total} 条</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>近 30 日</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontFamily: 'var(--font-serif)' }}>
                  <BloomStat label="已盛" count={bloomSummary.blooming} total={bloomSummary.total} color="var(--zhusha)"/>
                  <BloomStat label="未开" count={bloomSummary.notYet} total={bloomSummary.total} color="var(--ink-3)"/>
                  <BloomStat label="已谢" count={bloomSummary.past} total={bloomSummary.total} color="var(--ink-4)"/>
                </div>
                <button
                  onClick={() => setQuickReport('reporting')}
                  style={{
                    marginTop: 12, width: '100%',
                    background: 'none',
                    border: '1px dashed var(--qing)',
                    borderRadius: 6, padding: '8px',
                    fontSize: 11, color: 'var(--qing)',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    transition: 'var(--t-button)'
                  }}>
                  添一条实测 +
                </button>
              </>
            ) : (
              <>
                <div className="serif" style={{ fontSize: 13, color: 'var(--ink-2)', letterSpacing: '0.05em', marginBottom: 10 }}>
                  你去过这里吗？<br/>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>你的一笔实况 · 会让花信风更懂这里</span>
                </div>
                <button
                  onClick={() => setQuickReport('reporting')}
                  className="btn sm zhusha"
                  style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.15em' }}>
                  报个实况
                </button>
              </>
            )}

            {/* 报告选项 */}
            {quickReport === 'reporting' && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px dashed var(--line)'
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8, letterSpacing: '0.1em' }}>
                  你去时花开到什么程度？
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                  {[
                    { key: 'bud',   label: '含苞', icon: '◐' },
                    { key: 'early', label: '初开', icon: '◒' },
                    { key: 'peak',  label: '盛花', icon: '●' },
                    { key: 'late',  label: '末花', icon: '◑' },
                    { key: 'past',  label: '已谢', icon: '◌' }
                  ].map(b => (
                    <button key={b.key}
                      onClick={() => {
                        addBloomReport(s.id, b.key, 'quick');
                        trackBloomReport({ spotId: s.id, bloom: b.key, source: 'quick' });
                        setQuickReport('thanks');
                        setTimeout(() => setQuickReport(null), 2600);
                      }}
                      style={{
                        padding: '8px 4px',
                        border: '1px solid var(--line)',
                        background: 'var(--bg-elev)',
                        borderRadius: 5,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 11,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 2,
                        transition: 'var(--t-button)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--zhusha)';
                        e.currentTarget.style.color = 'var(--zhusha)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--line)';
                        e.currentTarget.style.color = '';
                      }}>
                      <span style={{ fontSize: 14 }}>{b.icon}</span>
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setQuickReport(null)}
                  style={{
                    marginTop: 8, width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 10, color: 'var(--ink-3)',
                    letterSpacing: '0.15em'
                  }}>
                  取消
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── 7 日天气 ─── */}
      <section style={{ padding: 20, borderBottom: '1px solid var(--line-2)' }}>
        <div className="cn-caps" style={{ marginBottom: 12 }}>七日花气</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, alignItems: 'end', height: 80 }}>
          {weekTemps.map((t, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>{t}°</span>
              <div style={{
                width: 14, height: t * 2,
                background: i === 0 ? 'var(--zhusha)' : 'var(--ink-4)',
                opacity: i === 0 ? 1 : 0.5,
                borderRadius: '2px 2px 0 0'
              }}/>
              <span className="serif" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                {['今', '二', '三', '四', '五', '六', '七'][i]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 诗词 ─── */}
      {(s.po || poem) && (
        <section style={{ padding: 20, borderBottom: '1px solid var(--line-2)', background: 'var(--paper)' }}>
          <div className="cn-caps" style={{ marginBottom: 10 }}>诗词 · {poem ? poem.author : '花事'}</div>
          <div className="serif" style={{ fontSize: 15, lineHeight: 2, color: 'var(--ink)', letterSpacing: '0.08em' }}>
            {poem ? poem.poem.split('\n').map((l, i) => <div key={i}>{l}</div>) : s.po}
          </div>
        </section>
      )}

      {/* ─── 此景可配之诗（精选诗词映射）─── */}
      {relatedPoems && relatedPoems.length > 0 && (
        <section style={{
          padding: 20,
          borderBottom: '1px solid var(--line-2)',
          background: 'color-mix(in oklch, var(--jin) 4%, var(--bg-elev))'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 12
          }}>
            <span className="cn-caps" style={{ color: 'var(--ink-2)' }}>
              此景可配之诗
            </span>
            <span className="mono" style={{
              fontSize: 9, color: 'var(--jin)',
              letterSpacing: '0.2em'
            }}>✦ 精选映射</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {relatedPoems.map(({ poem: rp, reasons }) => (
              <div key={rp.id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--paper)',
                  border: '1px solid var(--line-2)',
                  borderLeft: '2px solid var(--jin)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                {/* 诗名 + 作者 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', gap: 10
                }}>
                  <span className="serif" style={{
                    fontSize: 14,
                    letterSpacing: '0.1em',
                    color: 'var(--ink)',
                    fontWeight: 600
                  }}>《{rp.title}》</span>
                  <span className="serif" style={{
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.15em',
                    whiteSpace: 'nowrap'
                  }}>{rp.author}</span>
                </div>

                {/* 诗句首行 */}
                <div className="serif" style={{
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  marginTop: 6,
                  lineHeight: 1.8,
                  letterSpacing: '0.06em',
                  fontStyle: 'italic'
                }}>
                  {rp.lines && rp.lines[0]}
                </div>

                {/* 匹配理由 */}
                {reasons && reasons.length > 0 && (
                  <div style={{
                    marginTop: 8,
                    display: 'flex', gap: 4, flexWrap: 'wrap'
                  }}>
                    {reasons.map((r, i) => (
                      <span key={i} style={{
                        fontSize: 9,
                        padding: '1px 7px',
                        background: 'color-mix(in oklch, var(--jin) 14%, var(--bg-elev))',
                        color: 'var(--ink-2)',
                        borderRadius: 100,
                        fontFamily: 'var(--font-serif)',
                        letterSpacing: '0.1em'
                      }}>{r}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 推荐理由 / 小贴士 ─── */}
      {s.tp && (
        <section style={{ padding: 20, borderBottom: '1px solid var(--line-2)' }}>
          <div className="cn-caps" style={{ marginBottom: 8 }}>花事建议</div>
          <div className="serif" style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.8 }}>
            {s.tp}
          </div>
        </section>
      )}

      {/* ─── 出行工具 · 5 个权威平台跳转 ─── */}
      <TravelTools spot={s}/>

      {/* ─── 此地鸟鸣 · Xeno-canto 实时查询 ─── */}
      <SpotBirdsong spot={s} season={getSpotSeason(s)}/>

      {/* ─── 雅事贴士 · 按花种通用规则 ─── */}
      <EtiquetteTips spot={s}/>

      {/* ─── 打卡笔记输入框 ─── */}
      {checkinOpen && (
        <section style={{ padding: 20, borderBottom: '1px solid var(--line-2)', background: 'var(--bg-sunk)' }}>
          {/* 开花进度选择 */}
          <div className="cn-caps" style={{ marginBottom: 8 }}>今日花况 · 可选</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
            marginBottom: 14
          }}>
            {[
              { key: 'bud',   label: '含苞', icon: '◐' },
              { key: 'early', label: '初开', icon: '◒' },
              { key: 'peak',  label: '盛花', icon: '●' },
              { key: 'late',  label: '末花', icon: '◑' },
              { key: 'past',  label: '已谢', icon: '◌' }
            ].map(b => {
              const active = checkinBloom === b.key;
              return (
                <button key={b.key}
                  onClick={() => setCheckinBloom(active ? null : b.key)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 6,
                    border: active ? '1.5px solid var(--zhusha)' : '1px solid var(--line)',
                    background: active
                      ? 'color-mix(in oklch, var(--zhusha) 10%, var(--bg-elev))'
                      : 'var(--bg-elev)',
                    color: active ? 'var(--zhusha)' : 'var(--ink-2)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    fontWeight: active ? 600 : 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'var(--t-button)'
                  }}>
                  <span style={{
                    fontSize: 15,
                    color: active ? 'var(--zhusha)' : 'var(--ink-3)'
                  }}>{b.icon}</span>
                  <span>{b.label}</span>
                </button>
              );
            })}
          </div>

          <div className="cn-caps" style={{ marginBottom: 8 }}>落笔一记 · 花友手札</div>
          <textarea
            value={checkinNote}
            onChange={e => setCheckinNote(e.target.value)}
            placeholder="此刻所见所感..."
            style={{
              width: '100%', minHeight: 70, padding: 10,
              border: '1px solid var(--line)', borderRadius: 6,
              fontFamily: 'var(--font-serif)', fontSize: 13,
              background: 'var(--bg-elev)', color: 'var(--ink)', resize: 'vertical'
            }}/>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
            <button className="btn sm" onClick={() => setCheckinOpen(false)}>取消</button>
            <button className="btn sm zhusha" onClick={handleCheckin}>落款</button>
          </div>
        </section>
      )}

      <div style={{ flex: 1 }}/>

      {/* ─── 底部操作 ─── */}
      <section style={{ padding: 20, display: 'flex', gap: 8, borderTop: '1px solid var(--line-2)',
        background: 'var(--bg-elev)', position: 'sticky', bottom: 0 }}>
        {isChecked ? (
          <button className="btn" style={{ flex: 1, background: 'var(--bg-sunk)' }} disabled>
            <Icon.check/> 已到此
          </button>
        ) : (
          <button className="btn zhusha" style={{ flex: 1 }}
            onClick={() => setCheckinOpen(v => !v)}>
            <Icon.pin/> 到此一游
          </button>
        )}
        <button className="btn" onClick={onFav} title={isFav ? '已收藏' : '收藏'}
          style={{ color: isFav ? 'var(--zhusha)' : 'var(--ink-2)' }}>
          {Icon.heart(isFav)}
        </button>
        <button className="btn" onClick={onTripToggle} title={inTrip ? '已加入行程' : '加入行程'}
          style={{ color: inTrip ? 'var(--jin)' : 'var(--ink-2)' }}>
          <Icon.bookmark/>
        </button>
        {onShowWiki && HAS_WIKI.has(s.sp) && (
          <button className="btn" onClick={onShowWiki} title="花卉百科">
            <Icon.flower/>
          </button>
        )}
        <button className="btn" onClick={onShare} title="分享">
          <Icon.share/>
        </button>
      </section>
    </div>
  );
}

/* ═══ BloomStat · 花友实测小统计 ═══ */
function BloomStat({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 20,
        color: count > 0 ? color : 'var(--ink-4)',
        letterSpacing: 0,
        fontWeight: 700,
        lineHeight: 1
      }}>
        {count}
      </div>
      <div style={{
        fontSize: 10,
        color: 'var(--ink-3)',
        marginTop: 3,
        letterSpacing: '0.1em'
      }}>
        {label} · {pct}%
      </div>
    </div>
  );
}


/* ═══ 辅助 · 从景点推断季节 ═══ */
function getSpotSeason(spot) {
  // 景点自带 m 字段（月份）· 如 3-4 月 → 春
  // 否则从 sp（花种）推断 · 或用当前月份
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}
