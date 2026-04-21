import React, { useState, useMemo } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { ENDANGERED_FLORA, PROTECTION_LEVEL_INFO, IUCN_INFO } from '../data/endangered-flora.js';

/* ═══════════════════════════════════════════════════════════════
   ReverencePanel · 花之敬畏
   ───────────────────────────────────────────────────────────────
   向中国濒危/保护植物致敬
   · 按 IUCN 等级分组
   · 每种有故事、濒危原因、敬畏之词
   · 不是炫技的数据展示 · 是要种下"慎待"的种子
   ═══════════════════════════════════════════════════════════════ */

export function ReverencePanel({ onBack }) {
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'EX/EW' | 'CR' | 'EN' | 'VU/NT'

  const grouped = useMemo(() => {
    const groups = { CR: [], EN: [], VU: [], NT: [], others: [] };
    ENDANGERED_FLORA.forEach(f => {
      const iucn = f.iucn || '';
      if (iucn.includes('CR')) groups.CR.push(f);
      else if (iucn.includes('EN')) groups.EN.push(f);
      else if (iucn.includes('VU')) groups.VU.push(f);
      else if (iucn.includes('NT')) groups.NT.push(f);
      else groups.others.push(f);
    });
    return groups;
  }, []);

  const levelCount = ENDANGERED_FLORA.length;
  const cnLevel1 = ENDANGERED_FLORA.filter(f => f.cn === '一级').length;

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="花之敬畏 · 濒危保护植物"
        title="慎 · 护 · 尊"
        sub={<>收录 {levelCount} 种中国珍稀植物 · 其中国家一级 {cnLevel1} 种 · 一花一世界 · 见者有幸</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>

        {/* ─── 序言 ─── */}
        <div style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, var(--bg-elev), var(--paper))',
          border: '1px solid var(--line)',
          borderLeft: '3px solid var(--zhusha)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24
        }}>
          <div className="serif" style={{
            fontSize: 15, lineHeight: 2.1, color: 'var(--ink-2)',
            letterSpacing: '0.04em'
          }}>
            一些花 · 从白垩纪看到如今。<br/>
            一些花 · 从你的外婆 · 只活到她的孙辈。<br/>
            一些花 · 你此生都难有机会见一眼。
            <div style={{ marginTop: 16, color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.9 }}>
              此屏列出中国境内**濒危 / 重点保护**的植物。<br/>
              愿你遇见它们时 · 只远观 · 不采摘 · 不喧哗。<br/>
              愿下一代人 · 也有幸见。
            </div>
          </div>
          <div style={{
            marginTop: 14, fontFamily: 'var(--font-mono)',
            fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.2em'
          }}>
            — 数据来源 · 国务院《国家重点保护野生植物名录》· IUCN 红色名录
          </div>
        </div>

        {/* ─── IUCN 等级图例 ─── */}
        <div style={{ marginBottom: 20 }}>
          <div className="cn-caps" style={{ marginBottom: 10 }}>IUCN 濒危等级</div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8
          }}>
            {Object.entries(IUCN_INFO).map(([key, info]) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px',
                background: 'var(--bg-elev)',
                border: '1px solid var(--line-2)',
                borderRadius: 100,
                fontSize: 11,
                fontFamily: 'var(--font-serif)'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: info.color
                }}/>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: info.color }}>{key}</span>
                <span style={{ color: 'var(--ink-2)', letterSpacing: '0.1em' }}>{info.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 敬畏地图 · 18 种濒危植物今日可观察地 ─── */}
        <section style={{ marginBottom: 36 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            marginBottom: 14, gap: 12
          }}>
            <div style={{ width: 3, height: 22, background: 'var(--zhusha)', borderRadius: 2 }}/>
            <div className="serif" style={{
              fontSize: 18, letterSpacing: '0.2em',
              color: 'var(--ink)', fontWeight: 600
            }}>敬 畏 · 分 布 图</div>
            <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }}/>
            <div className="mono" style={{
              fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.15em'
            }}>
              今日可观察
            </div>
          </div>
          <ReverenceMap
            flora={ENDANGERED_FLORA.filter(f => f.lat)}
            onSelect={setSelectedSpecies}
          />
        </section>

        {/* ─── 按等级分组展示 ─── */}
        {[
          { key: 'CR', title: '极 危 · Critically Endangered', color: '#a0301c' },
          { key: 'EN', title: '濒 危 · Endangered', color: '#c85a4a' },
          { key: 'VU', title: '易 危 · Vulnerable', color: '#c89a4a' },
          { key: 'NT', title: '近 危 · Near Threatened', color: '#a88a5a' }
        ].map(group => {
          const list = grouped[group.key];
          if (!list || list.length === 0) return null;
          return (
            <section key={group.key} style={{ marginBottom: 32 }}>
              {/* 分组标题 */}
              <div style={{
                display: 'flex', alignItems: 'baseline',
                marginBottom: 16, gap: 12
              }}>
                <div style={{
                  width: 3, height: 22, background: group.color,
                  borderRadius: 2
                }}/>
                <div className="serif" style={{
                  fontSize: 18, letterSpacing: '0.2em',
                  color: 'var(--ink)', fontWeight: 600
                }}>{group.title}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--line-2)' }}/>
                <div className="mono" style={{
                  fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.15em'
                }}>
                  {list.length} 种
                </div>
              </div>

              {/* 花卡网格 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 14
              }}>
                {list.map(f => (
                  <FloraCard key={f.sciName || f.name}
                    flora={f}
                    onClick={() => setSelectedSpecies(f)}/>
                ))}
              </div>
            </section>
          );
        })}

        {/* ─── 尾部敬意 ─── */}
        <div style={{
          marginTop: 40,
          padding: '28px 20px',
          textAlign: 'center',
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div className="serif" style={{
            fontSize: 14, lineHeight: 2.2,
            color: 'var(--ink-2)',
            letterSpacing: '0.06em',
            fontStyle: 'italic'
          }}>
            「上者灭绝百年 · 中者万里绝迹。<br/>
            花之敬畏 · 非为知识 · 为慎行。」
          </div>
          <div className="mono" style={{
            marginTop: 14, fontSize: 10, color: 'var(--ink-3)',
            letterSpacing: '0.25em'
          }}>
            HUAXINFENG · REVERENCE
          </div>
        </div>
      </div>

      {/* ─── 详情 Modal ─── */}
      {selectedSpecies && (
        <ReverenceModal
          flora={selectedSpecies}
          onClose={() => setSelectedSpecies(null)}
        />
      )}
    </div>
  );
}


/* ═══ 花卡 ═══ */
function FloraCard({ flora, onClick }) {
  const iucnInfo = IUCN_INFO[flora.iucn?.split('/')[0]] || null;
  const cnInfo = PROTECTION_LEVEL_INFO[flora.cn];

  return (
    <button onClick={onClick}
      className="card interactive"
      style={{
        padding: 18,
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* 左上 · 国家保护级标 */}
      {cnInfo && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          background: cnInfo.color,
          color: 'var(--paper)',
          fontSize: 10,
          padding: '4px 10px',
          borderBottomRightRadius: 8,
          letterSpacing: '0.15em',
          fontFamily: 'var(--font-serif)',
          fontWeight: 700
        }}>
          {cnInfo.name.replace('国家', '').replace('重点保护', '')}
        </div>
      )}

      {/* 右上 · IUCN 小点 */}
      {iucnInfo && (
        <div style={{
          position: 'absolute',
          top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: iucnInfo.color
          }}/>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            fontWeight: 700, color: iucnInfo.color
          }}>{flora.iucn}</span>
        </div>
      )}

      <div style={{ marginTop: cnInfo ? 24 : 0 }}>
        <div className="serif" style={{
          fontSize: 19,
          letterSpacing: '0.1em',
          color: 'var(--ink)',
          fontWeight: 600
        }}>{flora.name}</div>
        <div className="mono" style={{
          fontSize: 10, color: 'var(--ink-3)',
          marginTop: 4, fontStyle: 'italic',
          letterSpacing: '0.02em'
        }}>{flora.sciName}</div>

        <div style={{
          marginTop: 12,
          fontSize: 12, color: 'var(--ink-2)',
          fontFamily: 'var(--font-serif)',
          lineHeight: 1.75,
          letterSpacing: '0.03em',
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {flora.story}
        </div>

        <div style={{
          marginTop: 10, fontSize: 10,
          color: 'var(--ink-3)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.1em'
        }}>
          📍 {flora.habitat}
        </div>
      </div>
    </button>
  );
}


/* ═══ 详情 Modal ═══ */
function ReverenceModal({ flora, onClose }) {
  const iucnInfo = IUCN_INFO[flora.iucn?.split('/')[0]] || null;
  const cnInfo = PROTECTION_LEVEL_INFO[flora.cn];

  return (
    <div onClick={onClose}
      className="hx-modal-enter"
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'color-mix(in oklch, var(--ink) 55%, transparent)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 580, width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>

        {/* 关闭 */}
        <button onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 2,
            background: 'var(--bg-sunk)', border: 'none',
            cursor: 'pointer', color: 'var(--ink-2)',
            width: 32, height: 32, borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            fontSize: 18
          }}>×</button>

        {/* 头部等级 */}
        <div style={{
          padding: '28px 32px 20px',
          background: `linear-gradient(135deg, color-mix(in oklch, ${iucnInfo?.color || 'var(--ink)'} 6%, var(--bg-elev)), var(--bg-elev))`,
          borderBottom: '1px solid var(--line-2)'
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {cnInfo && (
              <span style={{
                padding: '4px 10px',
                background: cnInfo.color,
                color: 'var(--paper)',
                fontSize: 11,
                borderRadius: 4,
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.15em',
                fontWeight: 700
              }}>{cnInfo.name}</span>
            )}
            {iucnInfo && (
              <span style={{
                padding: '4px 10px',
                background: iucnInfo.color,
                color: 'var(--paper)',
                fontSize: 11,
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.15em',
                fontWeight: 700
              }}>IUCN {flora.iucn}</span>
            )}
          </div>
          <div className="serif" style={{
            fontSize: 28, color: 'var(--ink)',
            letterSpacing: '0.15em', fontWeight: 700
          }}>{flora.name}</div>
          <div className="mono" style={{
            fontSize: 12, color: 'var(--ink-3)',
            marginTop: 6, fontStyle: 'italic',
            letterSpacing: '0.05em'
          }}>{flora.sciName}</div>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px 32px 32px' }}>

          <Section label="生境分布">
            {flora.habitat}
          </Section>

          <Section label="物种故事">
            {flora.story}
          </Section>

          <Section label="濒危处境" color="var(--zhusha)">
            {flora.peril}
          </Section>

          <Section label="敬畏之心" isPoetry>
            {flora.reverence}
          </Section>

          {/* 等级详解 */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: 'var(--bg-sunk)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '2px solid var(--qing)'
          }}>
            <div className="cn-caps" style={{ marginBottom: 8 }}>保护等级释义</div>
            {cnInfo && (
              <div style={{
                fontSize: 12, color: 'var(--ink-2)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.9, marginBottom: 8
              }}>
                <span style={{ color: cnInfo.color, fontWeight: 700 }}>{cnInfo.name}</span>：{cnInfo.desc}
              </div>
            )}
            {iucnInfo && (
              <div style={{
                fontSize: 12, color: 'var(--ink-2)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.9
              }}>
                <span style={{ color: iucnInfo.color, fontWeight: 700 }}>IUCN {flora.iucn} ({iucnInfo.name})</span>：{iucnInfo.desc}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function Section({ label, children, color = 'var(--ink-2)', isPoetry = false }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="cn-caps" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontSize: 14,
        color,
        fontFamily: 'var(--font-serif)',
        lineHeight: 2.0,
        letterSpacing: '0.03em',
        fontStyle: isPoetry ? 'italic' : 'normal',
        padding: isPoetry ? '10px 14px' : 0,
        background: isPoetry ? 'color-mix(in oklch, var(--jin) 8%, transparent)' : 'transparent',
        borderLeft: isPoetry ? '2px solid var(--jin)' : 'none',
        borderRadius: isPoetry ? 4 : 0
      }}>
        {children}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   ReverenceMap · 敬畏分布图
   ───────────────────────────────────────────────────────────────
   在真实中国地图上标出 29 种濒危植物的今日可观察地
   · 按 IUCN 等级着色
   · 点击 → 打开敬畏详情 Modal
   · v6.3.2 用 MapCanvas 统一花事地图标准
   ═══════════════════════════════════════════════════════════════ */
import { InkMap } from '../components/InkMap.jsx';
import { MapCanvas } from '../components/MapCanvas.jsx';

function ReverenceMap({ flora, onSelect }) {
  const [mapCenter, setMapCenter] = React.useState([104.5, 35]);
  const [mapZoom, setMapZoom] = React.useState(1);

  // 把濒危植物当 spot 喂给 InkMap
  const spots = flora.map((f, i) => {
    const iucn = f.iucn || '';
    const sev = iucn.includes('CR') ? 5 :
                iucn.includes('EN') ? 4 :
                iucn.includes('VU') ? 3 : 2;
    return {
      id: `endangered-${i}`,
      _idx: i,
      _flora: f,
      n: f.name,
      lat: f.lat, lon: f.lon,
      sp: f.name,
      rg: f.todayPlace,
      _st: { l: sev }   // 用 "花期盛" 级别区分 IUCN 等级
    };
  });

  return (
    <div style={{ position: 'relative' }}>
      <MapCanvas
        spots={spots}
        onSelect={(s) => s._flora && onSelect && onSelect(s._flora)}
        showRegionLabels={true}
        center={mapCenter}
        zoom={mapZoom}
        onCenterChange={setMapCenter}
        onZoomChange={setMapZoom}
        minHeight={460}
        topBadge={
          <div style={{
            background: 'var(--bg-elev)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '10px 16px',
            boxShadow: 'var(--shadow-sm)',
            whiteSpace: 'nowrap'
          }}>
            <div className="cn-caps" style={{ marginBottom: 4 }}>
              敬畏 · 濒危植物
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span className="serif" style={{ fontSize: 16 }}>{flora.length} 种可造访</span>
              <span className="pill zhusha">CR · {flora.filter(f => (f.iucn||'').includes('CR')).length}</span>
              <span className="pill" style={{ background: 'color-mix(in oklch, var(--zhusha) 50%, var(--bg))', color: 'var(--paper)' }}>EN · {flora.filter(f => (f.iucn||'').includes('EN')).length}</span>
            </div>
          </div>
        }
      />
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        padding: '6px 10px',
        background: 'color-mix(in oklch, var(--paper) 92%, transparent)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-serif)',
        letterSpacing: '0.1em',
        pointerEvents: 'none',
        zIndex: 5
      }}>
        ✦ 点亮处即可造访
      </div>
    </div>
  );
}
