import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Seal, PetalMark } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   SubscriptionPanel · 花期订阅提醒
   - 用户订阅景点 → 花期将至 7 天内触发浏览器 Notification
   - localStorage key: hx.subs (id 数组)
   - 每次打开面板扫一次，有到期订阅就提醒
   ═══════════════════════════════════════════════════════════════ */
export function SubscriptionPanel({ flora, favs, onBack, onSelectSpot }) {
  const [subs, setSubs] = useState(() => read('subs') || []);
  const [notifyStatus, setNotifyStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // 请求通知权限
  const enableNotify = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      setNotifyStatus(perm);
      if (perm === 'granted') {
        new Notification('花信风 · 订阅已开启', {
          body: '花期将至时会提醒你',
          icon: '/icons/icon-192.png'
        });
      }
    } catch {}
  };

  // 取消订阅
  const removeSub = (id) => {
    const next = subs.filter(s => s !== id);
    setSubs(next);
    write('subs', next);
  };

  // 添加订阅
  const addSub = (id) => {
    if (subs.includes(id)) return;
    const next = [...subs, id];
    setSubs(next);
    write('subs', next);
  };

  // 扫描即将触发的提醒
  useEffect(() => {
    if (notifyStatus !== 'granted') return;
    const todayKey = new Date().toDateString();
    const notified = read('subsNotified') || {};
    subs.forEach(id => {
      const spot = flora.find(f => f.id === id);
      if (!spot || !spot._pred) return;
      const d = spot._pred.daysUntil;
      const key = `${id}-${todayKey}`;
      // 花期将至 1-7 天，且今日未提醒过
      if (d >= 1 && d <= 7 && !notified[key]) {
        try {
          new Notification(`花信风 · ${spot.n}`, {
            body: `${spot.sp}将于 ${d} 日后盛开`,
            tag: `sub-${id}`,
            silent: false
          });
          notified[key] = 1;
          write('subsNotified', notified);
        } catch {}
      }
    });
  }, [subs, flora, notifyStatus]);

  const subbedSpots = useMemo(() =>
    subs.map(id => flora.find(f => f.id === id)).filter(Boolean),
    [subs, flora]);

  const favSpots = useMemo(() =>
    Object.keys(favs)
      .map(id => flora.find(f => f.id === Number(id)))
      .filter(f => f && !subs.includes(f.id)),
    [favs, flora, subs]);

  // 按花期远近排序订阅列表
  const sortedSubs = useMemo(() =>
    [...subbedSpots].sort((a, b) => {
      const da = a._pred?.daysUntil ?? 9999;
      const db = b._pred?.daysUntil ?? 9999;
      // 正在盛花/即将盛花在前
      return Math.abs(da) - Math.abs(db);
    }),
    [subbedSpots]);

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="花期守候 · 应时相告"
        title="花 期 订 阅"
        sub={<>订阅 {subs.length} 处 · 花期将至时提醒你</>}
        onBack={onBack}
      />

      <div style={{ padding: '0 clamp(24px, 5vw, 48px) 48px' }}>

        {/* 通知权限卡 */}
        <div className="card paper-bg" style={{
          padding: 'clamp(16px, 2.5vw, 22px)',
          marginBottom: 20,
          borderLeft: `3px solid ${
            notifyStatus === 'granted' ? 'var(--qing)' :
            notifyStatus === 'denied' ? 'var(--ink-3)' : 'var(--jin)'
          }`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, flexWrap: 'wrap'
        }}>
          <div>
            <div className="cn-caps">
              {notifyStatus === 'granted' ? '通知已开启' :
               notifyStatus === 'denied' ? '通知已拒绝' :
               notifyStatus === 'unsupported' ? '浏览器不支持' :
               '通知未开启'}
            </div>
            <div className="serif" style={{
              fontSize: 13, color: 'var(--ink-2)',
              marginTop: 4, letterSpacing: '0.05em'
            }}>
              {notifyStatus === 'granted' ? '花期将至 7 日内自动提醒' :
               notifyStatus === 'denied' ? '请在浏览器设置中允许通知' :
               notifyStatus === 'unsupported' ? '无法开启浏览器推送' :
               '开启后花期将至时会弹窗提醒'}
            </div>
          </div>
          {notifyStatus === 'default' && (
            <button className="btn primary" onClick={enableNotify}>
              开启通知
            </button>
          )}
          {notifyStatus === 'granted' && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--qing)',
              animation: 'hx-pulse 2s ease-in-out infinite'
            }}/>
          )}
        </div>

        {/* 订阅列表 */}
        {sortedSubs.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            <div className="cn-caps" style={{ marginBottom: 12 }}>
              已订阅 · {sortedSubs.length}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12
            }}>
              {sortedSubs.map(s => (
                <div key={s.id} className="card" style={{
                  padding: 16,
                  borderLeft: '3px solid var(--zhusha)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start',
                    gap: 10 }}>
                    <PetalMark peak={s._st && s._st.l >= 4}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <button onClick={() => onSelectSpot && onSelectSpot(s.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, fontFamily: 'var(--font-serif)',
                          fontSize: 14, color: 'var(--ink)',
                          letterSpacing: '0.05em', textAlign: 'left',
                          whiteSpace: 'nowrap', overflow: 'hidden',
                          textOverflow: 'ellipsis', width: '100%'
                        }}>
                        {s.n}
                      </button>
                      <div style={{ marginTop: 4,
                        fontSize: 11, color: 'var(--ink-3)' }}>
                        {s.sp}
                      </div>
                    </div>
                    <button onClick={() => removeSub(s.id)}
                      title="取消订阅"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--ink-3)', padding: 2
                      }}>
                      <Icon.close/>
                    </button>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex',
                    gap: 6, flexWrap: 'wrap' }}>
                    {s._pred && (
                      <span className="pill zhusha">
                        {s._pred.daysUntil <= 0 ? '正在盛花' :
                         s._pred.daysUntil <= 7 ? `${s._pred.daysUntil} 日后` :
                         s._pred.dateStr}
                      </span>
                    )}
                    {s._st && <span className="pill">{s._st.st}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            symbol="🔔"
            title="尚未订阅任何花期"
            sub="从下方收藏中选择，或到地图上收藏景点后再订阅"
          />
        )}

        {/* 从收藏中添加订阅 */}
        {favSpots.length > 0 && (
          <div>
            <div className="cn-caps" style={{ marginBottom: 12 }}>
              收藏中 · 点击订阅
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10
            }}>
              {favSpots.map(s => (
                <button key={s.id}
                  onClick={() => addSub(s.id)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-elev)',
                    border: '1px dashed var(--line)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                  <span style={{ color: 'var(--qing)', fontSize: 14 }}>＋</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="serif" style={{
                      fontSize: 12, color: 'var(--ink)',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                      {s.sp}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {Object.keys(favs).length === 0 && sortedSubs.length === 0 && (
          <div className="card" style={{ padding: 24, textAlign: 'center',
            color: 'var(--ink-3)', fontSize: 12 }}>
            先到地图上收藏一些花事，再来这里订阅
          </div>
        )}
      </div>
    </div>
  );
}
