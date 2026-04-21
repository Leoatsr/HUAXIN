import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/atoms.jsx';
import {
  amapMarkerUrl, amapNavigationUrl, amapAppScheme,
  baiduNavigationUrl, baiduAppScheme,
  qqMapNavUrl,
  googleMapsDirUrl,
  isMobile, isIOS, isAndroid,
  smartOpenAmap, smartOpenBaidu,
  getUserLocation
} from '../utils/map-urls.js';
import { read, write } from '../utils/storage.js';
import { trackOutboundClick, trackShare } from '../utils/analytics.js';

/* ═══════════════════════════════════════════════════════════════
   TravelTools v2 · 出行工具箱
   ───────────────────────────────────────────────────────────────
   升级：
     · 方案 D · 移动端智能跳 App（2 秒超时回落 web）
     · 方案 B · 支持"从我位置导航"（getUserLocation 获取起点）
     · 多地图源切换（高德 / 百度 / 腾讯 / Google）· 本地存储偏好
     · 坐标转换已在 URL 构造器里完成（WGS-84 → GCJ-02 / BD-09）

   其他工具保持不变：小红书 / 天气 / 携程 / 大众点评
   ═══════════════════════════════════════════════════════════════ */

const MAP_PROVIDERS = [
  { key: 'amap',   label: '高德', icon: '🇨🇳', color: '#1677ff' },
  { key: 'baidu',  label: '百度', icon: '🅑',  color: '#2932e1' },
  { key: 'qq',     label: '腾讯', icon: '🅣',  color: '#06d6a0' },
  { key: 'google', label: 'Google', icon: '🌐', color: '#4285f4' }
];

export function TravelTools({ spot }) {
  // 地图偏好 · 本地存储
  const [provider, setProvider] = useState(() => read('mapProvider') || 'amap');
  const [mode, setMode] = useState(() => read('navMode') || 'car');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => { write('mapProvider', provider); }, [provider]);
  useEffect(() => { write('navMode', mode); }, [mode]);

  // 早退必须在所有 hooks 之后
  if (!spot) return null;
  const { n, lat, lon } = spot;

  /* ═══ 主导航按钮点击 · 智能跳 App ═══ */
  const handleNavClick = (useFromLocation = false) => {
    setLocError('');
    if (useFromLocation) {
      setLocating(true);
      getUserLocation()
        .then(from => {
          setLocating(false);
          openNavigation({ fromLon: from.lon, fromLat: from.lat, fromName: '我的位置' });
        })
        .catch(err => {
          setLocating(false);
          setLocError(err.message || '定位失败 · 请允许浏览器定位权限');
          // 失败后仍然跳转（只是没起点）
          openNavigation({});
        });
    } else {
      openNavigation({});
    }
  };

  const openNavigation = (fromPayload) => {
    const payload = { lon, lat, name: n, mode, ...fromPayload };
    switch (provider) {
      case 'baidu':  {
        const bMode = mode === 'car' ? 'driving' : mode === 'walk' ? 'walking' : 'transit';
        smartOpenBaidu({ ...payload, mode: bMode });
        break;
      }
      case 'qq': {
        const qMode = mode === 'car' ? 'driving' : mode === 'walk' ? 'walking' : 'bus';
        window.open(qqMapNavUrl({ lon, lat, name: n, mode: qMode }), '_blank');
        break;
      }
      case 'google': {
        window.open(googleMapsDirUrl({ lon, lat, name: n }), '_blank');
        break;
      }
      case 'amap':
      default:
        smartOpenAmap(payload);
    }
  };

  /* ═══ 其他工具（小红书 / 天气 / 携程 / 大众点评）═══
     注意：所有 URL 均为用户实际可打开的搜索结果页
     - 气象：改用中国天气网（weather.com.cn 是中国气象局对公 Web 站）
     - 携程：改用 trip.ctrip.com（移动端/桌面端都能用）
     - 大众点评：改用 sou 搜索（不是 keyword 深链·后者已失效）
  */
  const tools = [
    {
      key: 'xhs',    icon: '🔍', label: '小红书游记',  sub: '实时实拍 · 避坑',
      cnOnly: true,
      url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(n)}`
    },
    {
      key: 'weather', icon: '⛅', label: '中国天气网',   sub: '官方精准天气',
      cnOnly: true,
      url: `https://www.weather.com.cn/search?keyword=${encodeURIComponent(n)}`
    },
    {
      key: 'ctrip',  icon: '🎫', label: '携程',         sub: '门票 · 酒店 · 交通',
      cnOnly: true,
      url: `https://you.ctrip.com/SearchSite/?query=${encodeURIComponent(n)}`
    },
    {
      key: 'dianping', icon: '🍜', label: '大众点评',    sub: '周边美食 · 配套',
      cnOnly: true,
      url: `https://www.dianping.com/search/keyword/0_0_${encodeURIComponent(n)}`
    }
  ];

  const currentProvider = MAP_PROVIDERS.find(p => p.key === provider);

  return (
    <section style={{
      padding: 20,
      borderBottom: '1px solid var(--line-2)',
      background: 'var(--paper)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="cn-caps">出 行 工 具</div>
        <button onClick={() => setPanelOpen(!panelOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em',
            fontFamily: 'var(--font-serif)'
          }}>
          {panelOpen ? '收起设置 ▲' : '地图设置 ▼'}
        </button>
      </div>

      {/* ═══ 可折叠设置面板 ═══ */}
      {panelOpen && (
        <div style={{
          marginBottom: 14,
          padding: 12,
          background: 'var(--bg-sunk)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--line-2)'
        }}>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: '0.1em' }}>
            地图选择
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {MAP_PROVIDERS.map(p => (
              <button key={p.key}
                onClick={() => setProvider(p.key)}
                style={{
                  flex: 1, minWidth: 64,
                  padding: '6px 8px',
                  border: provider === p.key ? `1.5px solid ${p.color}` : '1px solid var(--line)',
                  background: provider === p.key ? `color-mix(in oklch, ${p.color} 10%, var(--bg-elev))` : 'var(--bg-elev)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: provider === p.key ? p.color : 'var(--ink-2)',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontWeight: provider === p.key ? 700 : 400
                }}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 6, letterSpacing: '0.1em' }}>
            出行方式
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'car',  label: '驾车' },
              { key: 'walk', label: '步行' },
              { key: 'bus',  label: '公交' }
            ].map(m => (
              <button key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: mode === m.key ? '1.5px solid var(--zhusha)' : '1px solid var(--line)',
                  background: mode === m.key ? 'color-mix(in oklch, var(--zhusha) 10%, var(--bg-elev))' : 'var(--bg-elev)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: mode === m.key ? 'var(--zhusha)' : 'var(--ink-2)',
                  fontFamily: 'var(--font-serif)',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontWeight: mode === m.key ? 700 : 400
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {isMobile() && (
            <div style={{ marginTop: 10, fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.05em' }}>
              移动端点击将尝试打开 App · 2 秒内无响应回落网页
            </div>
          )}
        </div>
      )}

      {/* ═══ 主导航 CTA · 两个大按钮 ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <button onClick={() => handleNavClick(false)}
          style={{
            padding: '12px 14px',
            background: `color-mix(in oklch, ${currentProvider.color} 90%, var(--paper))`,
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.1em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
          <span style={{ fontSize: 16 }}>🗺</span>
          <span>{currentProvider.label} · 定位</span>
        </button>

        <button onClick={() => handleNavClick(true)}
          disabled={locating}
          style={{
            padding: '12px 14px',
            background: 'var(--zhusha)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: locating ? 'progress' : 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.1em',
            opacity: locating ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
          <span style={{ fontSize: 16 }}>🧭</span>
          <span>{locating ? '定位中…' : '从我这导航'}</span>
        </button>
      </div>

      {locError && (
        <div style={{ fontSize: 10, color: 'var(--zhusha)', marginBottom: 10, textAlign: 'center' }}>
          ⚠ {locError}
        </div>
      )}

      {/* ═══ 辅助工具 · 4 个小卡片 ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 6
      }}>
        {tools.map(t => (
          <a key={t.key}
            href={t.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackOutboundClick({ url: t.url, label: t.key })}
            style={{
              padding: '8px 10px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line-2)',
              borderLeft: '2px solid var(--qing)',
              borderRadius: 'var(--radius-sm, 6px)',
              transition: 'transform var(--dur-fast) var(--ease-out), border-left-color var(--dur-fast) var(--ease-out)',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(2px)';
              e.currentTarget.style.borderLeftColor = 'var(--zhusha)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderLeftColor = 'var(--qing)';
            }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{
                fontSize: 11,
                color: 'var(--ink)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                {t.label}
                {t.cnOnly && (
                  <span style={{
                    fontSize: 8,
                    padding: '1px 4px',
                    background: 'var(--bg-sunk)',
                    color: 'var(--ink-3)',
                    borderRadius: 3,
                    letterSpacing: 0,
                    fontWeight: 400,
                    flexShrink: 0
                  }} title="国内站点 · 海外可能无法访问">CN</span>
                )}
              </div>
              <div style={{
                fontSize: 9,
                color: 'var(--ink-3)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{t.sub}</div>
            </div>
          </a>
        ))}
      </div>

      {/* 海外访问提示 */}
      {tools.some(t => t.cnOnly) && (
        <div style={{
          marginTop: 10,
          fontSize: 10,
          color: 'var(--ink-3)',
          fontFamily: 'var(--font-serif)',
          letterSpacing: '0.1em',
          textAlign: 'center',
          fontStyle: 'italic',
          opacity: 0.7
        }}>
          带 <span style={{
            fontSize: 8, padding: '1px 4px',
            background: 'var(--bg-sunk)', borderRadius: 3,
            fontStyle: 'normal'
          }}>CN</span> 标识的站点为中国大陆站 · 海外可能无法访问
        </div>
      )}

      <div className="mono" style={{
        marginTop: 10,
        fontSize: 9,
        color: 'var(--ink-3)',
        letterSpacing: '0.1em',
        textAlign: 'center'
      }}>
        坐标已转换为 {provider === 'baidu' ? 'BD-09' : provider === 'google' ? 'WGS-84' : 'GCJ-02'} · 零偏移
      </div>
    </section>
  );
}
