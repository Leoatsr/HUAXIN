import React, { useState, useMemo } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   DailyCheckinPanel · 每日签到
   - 每天可签到一次，连续签到累计 streak
   - 7 个成就徽章：3/7/14/30/60/100/365 天
   - localStorage: dailyCheckin = { lastDate, streak, total, rewards }
   ═══════════════════════════════════════════════════════════════ */

const REWARDS = [
  { days: 3,   seal: '三日', label: '初心可嘉' },
  { days: 7,   seal: '一旬', label: '一旬花客' },
  { days: 14,  seal: '两旬', label: '花事深知' },
  { days: 30,  seal: '满月', label: '月满花圆' },
  { days: 60,  seal: '双月', label: '持之以恒' },
  { days: 100, seal: '百日', label: '百日知花' },
  { days: 365, seal: '周年', label: '岁岁有信' }
];

const DAILY_POEMS = [
  '一候花风起 · 岁岁花事新',
  '满园春色关不住 · 一枝红杏出墙来',
  '等闲识得东风面 · 万紫千红总是春',
  '疏影横斜水清浅 · 暗香浮动月黄昏',
  '接天莲叶无穷碧 · 映日荷花别样红',
  '停车坐爱枫林晚 · 霜叶红于二月花',
  '忽如一夜春风来 · 千树万树梨花开',
  '人闲桂花落 · 夜静春山空',
  '春风又绿江南岸 · 明月何时照我还',
  '年年岁岁花相似 · 岁岁年年人不同',
  '乱花渐欲迷人眼 · 浅草才能没马蹄',
  '杏花春雨江南 · 一日看尽长安花'
];

const todayKey = () => new Date().toISOString().slice(0, 10);
const isYesterday = (d) => {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return d === y.toISOString().slice(0, 10);
};

// ═══ 连签 Toast ═══
function DailyStreakToast({ streak }) {
  return (
    <div style={{
      position: 'fixed', top: 80, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      background: 'var(--bg-elev)',
      border: '1px solid var(--zhusha)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 26px',
      boxShadow: 'var(--shadow-lg)',
      textAlign: 'center',
      animation: 'hx-pulse 1.2s ease-out',
      fontFamily: 'var(--font-serif)'
    }}>
      <div className="cn-caps" style={{ color: 'var(--zhusha)' }}>
        签到成功
      </div>
      <div style={{ fontSize: 16, marginTop: 6,
        letterSpacing: '0.15em', color: 'var(--ink)' }}>
        连续 {streak} 日
      </div>
    </div>
  );
}

export function DailyCheckinPanel({ onBack }) {
  const [state, setState] = useState(() =>
    read('dailyCheckin') || { lastDate: null, streak: 0, total: 0, rewards: [] }
  );
  const [justChecked, setJustChecked] = useState(false);

  const today = todayKey();
  const alreadyChecked = state.lastDate === today;

  const todayPoem = useMemo(() => {
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    return DAILY_POEMS[seed % DAILY_POEMS.length];
  }, []);

  const checkin = () => {
    if (alreadyChecked) return;
    const newStreak = isYesterday(state.lastDate) ? state.streak + 1 : 1;
    const earnedReward = REWARDS.find(r =>
      r.days === newStreak && !state.rewards.includes(r.days)
    );
    const next = {
      lastDate: today,
      streak: newStreak,
      total: state.total + 1,
      rewards: earnedReward ? [...state.rewards, earnedReward.days] : state.rewards
    };
    setState(next);
    write('dailyCheckin', next);
    setJustChecked(true);
    setTimeout(() => setJustChecked(false), 2800);
  };

  const ringProgress = Math.min(state.streak / 7, 1);
  const nextReward = REWARDS.find(r => r.days > state.streak);

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)',
      position: 'relative' }}>
      {justChecked && <DailyStreakToast streak={state.streak}/>}

      {/* 头部 */}
      <div style={{
        padding: 'clamp(24px, 4vw, 40px) clamp(24px, 5vw, 48px) 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div className="cn-caps">日课一笔 · 花事在心</div>
          <div className="serif" style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            letterSpacing: '0.25em', marginTop: 6
          }}>每 日 签 到</div>
          <div className="serif" style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
            连续 {state.streak} 日 · 累计 {state.total} 次
          </div>
        </div>
        {onBack && (
          <button className="btn" onClick={onBack}>
            <Icon.chev d="left"/> 返回
          </button>
        )}
      </div>

      <div style={{
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20
      }}>
        {/* 主签到卡 */}
        <div className="card paper-bg" style={{
          padding: 'clamp(24px, 4vw, 40px)',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 20, right: 22 }}>
            <Seal size="md" rotate={-4}>
              {state.streak >= 7 ? '花客' :
               state.streak >= 3 ? '初心' : '日课'}
            </Seal>
          </div>

          {/* 进度圆环 */}
          <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, margin: '0 auto' }}>
            <circle cx="60" cy="60" r="52"
              fill="none" stroke="var(--line-2)" strokeWidth="4"/>
            <circle cx="60" cy="60" r="52"
              fill="none" stroke="var(--zhusha)" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${ringProgress * 326.7} 326.7`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray var(--dur-calm) var(--ease-out)' }}/>
            <text x="60" y="56" textAnchor="middle"
              fontFamily="var(--font-serif)" fontSize="32"
              fill="var(--zhusha)">{state.streak}</text>
            <text x="60" y="76" textAnchor="middle"
              fontFamily="var(--font-serif)" fontSize="11"
              letterSpacing="0.2em" fill="var(--ink-3)">连续日</text>
          </svg>

          <div className="serif" style={{
            fontSize: 15, color: 'var(--ink-2)',
            margin: '18px 0 8px', letterSpacing: '0.15em',
            lineHeight: 1.8, fontStyle: 'italic'
          }}>「 {todayPoem} 」</div>

          <button onClick={checkin} disabled={alreadyChecked}
            className={alreadyChecked ? 'btn' : 'btn zhusha'}
            style={{ marginTop: 16, padding: '12px 36px',
              fontSize: 14, letterSpacing: '0.3em' }}>
            {alreadyChecked ? '✓ 今日已签' : '今日一签'}
          </button>

          {nextReward && (
            <div className="mono" style={{
              marginTop: 12, fontSize: 10, color: 'var(--ink-3)',
              letterSpacing: '0.15em'
            }}>
              距「{nextReward.seal}」徽章 · 还差 {nextReward.days - state.streak} 日
            </div>
          )}
        </div>

        {/* 徽章列表 */}
        <div>
          <div className="cn-caps" style={{ marginBottom: 14 }}>花事徽章</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REWARDS.map(r => {
              const unlocked = state.rewards.includes(r.days);
              return (
                <div key={r.days} className="card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    opacity: unlocked ? 1 : 0.55,
                    borderLeft: `3px solid ${unlocked ? 'var(--jin)' : 'var(--line)'}`
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: unlocked ? 'var(--jin)' : 'var(--bg-sunk)',
                    color: unlocked ? 'var(--paper)' : 'var(--ink-3)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-serif)', fontSize: 13,
                    letterSpacing: '0.05em', flexShrink: 0
                  }}>{r.seal}</div>
                  <div style={{ flex: 1 }}>
                    <div className="serif" style={{ fontSize: 14,
                      color: unlocked ? 'var(--ink)' : 'var(--ink-2)',
                      letterSpacing: '0.08em' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink-3)',
                      marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                      连续 {r.days} 日 · {unlocked ? '已得' : '未得'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
