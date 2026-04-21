import React, { useState, useEffect, useMemo } from 'react';
import { getSeason } from '../utils/phenology.js';

/* ═══════════════════════════════════════════════════════════════
   AlertBanner · 顶部滚动花期提醒
   - 根据 flora 的 _pred 数据自动生成提醒
   - 5 种提醒：将开 / 盛花中 / 花期将尽 / 接力 / 季节雅事
   - 15 秒自动轮播
   ═══════════════════════════════════════════════════════════════ */
export function AlertBanner({ flora, onGoSpot }) {
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(0);

  const alerts = useMemo(() => {
    const result = [];
    const cs = getSeason();

    flora.forEach(f => {
      const pred = f._pred;
      if (!pred) return;
      const du = pred.daysUntil;
      const lvl = (f._st && f._st.l) || 0;

      // 3-7 天后进入盛花期
      if (du >= 3 && du <= 7) {
        result.push({
          type: 'upcoming',
          m: `${f.n} ${f.sp}将于 ${du} 日后进入盛花期`,
          id: f.id, pri: 3
        });
      }
      // 盛花中（-10 ~ 0 天）
      if (du <= 0 && du >= -10 && lvl >= 3) {
        result.push({
          type: 'blooming',
          m: `${f.n} ${f.sp}正值盛花期${f.po ? ' · ' + f.po : ''}`,
          id: f.id, pri: 4
        });
      }
      // 将尽（-14 ~ -8 天）
      if (du < -8 && du >= -14 && lvl >= 2) {
        result.push({
          type: 'ending',
          m: `${f.n} ${f.sp}花期渐近尾声，欲赏请趁本周`,
          id: f.id, pri: 5
        });
      }
      // 接力
      if (du < -14 && lvl <= 1) {
        const next = flora.find(x =>
          x.sp === f.sp && x.id !== f.id &&
          x._pred && x._pred.daysUntil > 0 && x._pred.daysUntil < 30
        );
        if (next) {
          result.push({
            type: 'baton',
            m: `${(f.n.split('·')[1] || f.n).trim()}${f.sp}已谢，${next.n}正在接力绽放`,
            id: next.id, pri: 2
          });
        }
      }
    });

    // 季节雅事
    const seasonalTips = {
      spring: [
        '春风二十四番，应候而至',
        '三月桃花雨，四月梨花雪',
        '谷雨前后，正是牡丹盛时'
      ],
      summer: [
        '荷香清露，最宜月下小酌',
        '接天莲叶无穷碧，七月赏荷时',
        '暑气蒸腾，薰衣草花海宜清晨前往'
      ],
      autumn: [
        '霜降后红叶最艳，西风不胜银杏金',
        '九月桂花十月菊，十一月红枫正当时',
        '气温骤降后红叶最红'
      ],
      winter: [
        '暗香浮动月黄昏，寻梅需踏雪而行',
        '冬至前后雾凇最盛',
        '南方冬樱十二月盛开'
      ]
    };
    (seasonalTips[cs] || []).forEach((m, idx) =>
      result.push({ type: 'wisdom', m, pri: 1, id: null })
    );

    result.sort((a, b) => b.pri - a.pri);

    if (result.length === 0) {
      result.push({ type: 'tip', m: '点击花事图标查看盛花期预测，基于 3 年历史数据推算', pri: 0, id: null });
    }
    return result.slice(0, 12);
  }, [flora]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI(j => (j + 1) % alerts.length);
        setVisible(true);
      }, 400);
    }, 15000);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [alerts.length]);

  if (!alerts.length) return null;
  const cur = alerts[i % alerts.length];

  const typeStyle = {
    blooming: { bg: 'color-mix(in oklch, var(--zhusha) 8%, var(--bg-elev))', color: 'var(--zhusha)' },
    upcoming: { bg: 'color-mix(in oklch, var(--qing) 8%, var(--bg-elev))',   color: 'var(--qing)' },
    ending:   { bg: 'color-mix(in oklch, var(--jin) 10%, var(--bg-elev))',   color: 'var(--jin)' },
    baton:    { bg: 'var(--bg-elev)', color: 'var(--ink-2)' },
    wisdom:   { bg: 'var(--bg-elev)', color: 'var(--ink-2)' },
    tip:      { bg: 'var(--bg-elev)', color: 'var(--ink-3)' }
  }[cur.type] || { bg: 'var(--bg-elev)', color: 'var(--ink-2)' };

  const prefix = {
    blooming: '【花信】',
    upcoming: '【预告】',
    ending:   '【急报】',
    baton:    '【接力】',
    wisdom:   '【雅事】',
    tip:      '【花信风】'
  }[cur.type] || '';

  return (
    <div
      onClick={() => cur.id && onGoSpot && onGoSpot(cur.id)}
      style={{
        position: 'fixed', top: 54, left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
        opacity: visible ? 1 : 0,
        transition: 'var(--t-all)',
        zIndex: 80,
        background: typeStyle.bg,
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--line)',
        padding: '7px 18px',
        borderRadius: 18,
        boxShadow: 'var(--shadow-sm)',
        cursor: cur.id ? 'pointer' : 'default',
        fontSize: 13,
        color: typeStyle.color,
        maxWidth: 'min(680px, 88vw)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        letterSpacing: '0.1em',
        fontFamily: 'var(--font-serif)'
      }}>
      {prefix}{cur.m}
      {cur.id && (
        <span style={{
          fontSize: 10,
          color: 'var(--zhusha)',
          marginLeft: 8,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em'
        }}>看 →</span>
      )}
    </div>
  );
}
