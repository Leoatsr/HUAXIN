import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   传统乐器 SVG 图标（8 种 · 水墨写意风）
   颜色用 oklch 深浅棕调，与水墨美学一致
   ═══════════════════════════════════════════════════════════════ */

// 通用色
const C = {
  wood:  'oklch(0.55 0.08 60)',   // 深木
  wood2: 'oklch(0.70 0.10 70)',   // 浅木
  wood3: 'oklch(0.45 0.07 50)',   // 极深木
  string:'oklch(0.80 0.05 80)',   // 琴弦金
  skin:  'oklch(0.80 0.04 75)'    // 蒙皮
};

export function InstrIcon({ type, size = 20 }) {
  const s = size;
  const o = 0.85;

  if (type === 'guqin') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="4" y="13" width="24" height="5" rx="2.5" fill={C.wood}/>
        <line x1="6" y1="14" x2="6" y2="17" stroke={C.string} strokeWidth="0.6"/>
        <line x1="10" y1="14" x2="10" y2="17" stroke={C.string} strokeWidth="0.6"/>
        <line x1="14" y1="14" x2="14" y2="17" stroke={C.string} strokeWidth="0.6"/>
        <line x1="6" y1="15.5" x2="28" y2="15.5" stroke={C.string} strokeWidth="0.3"/>
        <line x1="6" y1="14.8" x2="28" y2="14.8" stroke={C.string} strokeWidth="0.3"/>
        <line x1="6" y1="16.2" x2="28" y2="16.2" stroke={C.string} strokeWidth="0.3"/>
      </g>
    </svg>
  );

  if (type === 'guzheng') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <path d="M3,18 Q16,10 29,14" stroke={C.wood} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {[8, 12, 16, 20, 24].map(x => (
          <line key={x} x1={x} y1={11 + x * 0.15} x2={x} y2={17 - x * 0.05}
            stroke={C.string} strokeWidth="0.4"/>
        ))}
        <circle cx="6" cy="17" r="1" fill={C.wood2}/>
      </g>
    </svg>
  );

  if (type === 'pipa') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <ellipse cx="16" cy="20" rx="6" ry="7" fill={C.wood2}/>
        <rect x="14.5" y="5" width="3" height="15" rx="1.5" fill={C.wood3}/>
        {[7, 9, 11, 13].map(y => (
          <line key={y} x1="13" y1={y} x2="19" y2={y} stroke={C.wood} strokeWidth="0.5"/>
        ))}
        <line x1="15" y1="13" x2="15" y2="26" stroke={C.string} strokeWidth="0.3"/>
        <line x1="16" y1="13" x2="16" y2="26" stroke={C.string} strokeWidth="0.3"/>
        <line x1="17" y1="13" x2="17" y2="26" stroke={C.string} strokeWidth="0.3"/>
      </g>
    </svg>
  );

  if (type === 'erhu') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="15" y="4" width="2" height="22" rx="1" fill={C.wood}/>
        <circle cx="16" cy="24" r="4.5" fill="none" stroke={C.wood3} strokeWidth="1.5"/>
        <rect x="13" y="22" width="6" height="5" rx="1" fill={C.skin} opacity="0.5"/>
        <line x1="15.5" y1="6" x2="15.5" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <line x1="16.5" y1="6" x2="16.5" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <rect x="12" y="6" width="8" height="1.5" rx="0.5" fill={C.wood3}/>
      </g>
    </svg>
  );

  if (type === 'xiao') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="14.5" y="3" width="3" height="26" rx="1.5" fill={C.wood2}/>
        {[10, 13, 16, 19, 22].map(y => (
          <circle key={y} cx="16" cy={y} r="0.8" fill={C.wood3}/>
        ))}
        <circle cx="16" cy="5" r="1" fill={C.wood3}/>
      </g>
    </svg>
  );

  if (type === 'dizi') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="3" y="14.5" width="26" height="3" rx="1.5" fill={C.wood2}/>
        {[8, 12, 16, 20, 24].map(x => (
          <circle key={x} cx={x} cy="16" r="0.7" fill={C.wood3}/>
        ))}
      </g>
    </svg>
  );

  if (type === 'yangqin') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <path d="M5,14 L27,10 L27,22 L5,18 Z" fill={C.wood2} stroke={C.wood3} strokeWidth="0.5"/>
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={6 + i * 2.6} y1={14 + i * 0.1}
            x2={26 - i * 0.1} y2={10 + i * 0.2}
            stroke={C.string} strokeWidth="0.3"/>
        ))}
        <rect x="13" y="22" width="2" height="7" rx="1" fill={C.wood}/>
        <rect x="17" y="22" width="2" height="7" rx="1" fill={C.wood}/>
      </g>
    </svg>
  );

  if (type === 'ruan') return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <circle cx="16" cy="20" r="7" fill={C.wood2} stroke={C.wood3} strokeWidth="0.6"/>
        <rect x="14.5" y="4" width="3" height="14" rx="1" fill={C.wood}/>
        {[6, 9, 12].map(y => (
          <line key={y} x1="13" y1={y} x2="19" y2={y} stroke={C.wood3} strokeWidth="0.5"/>
        ))}
        <circle cx="16" cy="20" r="2" fill={C.wood3}/>
        {[14.5, 16, 17.5].map(x => (
          <line key={x} x1={x} y1="13" x2={x} y2="26" stroke={C.string} strokeWidth="0.3"/>
        ))}
      </g>
    </svg>
  );

  // ═══ 新增 · 弹拨类 ═══
  if (type === 'liuqin') return (
    // 柳琴：小梨形琵琶
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <ellipse cx="16" cy="21" rx="5" ry="6" fill={C.wood2}/>
        <rect x="15" y="6" width="2" height="14" rx="1" fill={C.wood3}/>
        {[8, 10, 12].map(y => <line key={y} x1="13.5" y1={y} x2="18.5" y2={y} stroke={C.wood} strokeWidth="0.4"/>)}
        {[15.3, 16, 16.7].map(x => <line key={x} x1={x} y1="14" x2={x} y2="25" stroke={C.string} strokeWidth="0.3"/>)}
      </g>
    </svg>
  );

  if (type === 'sanxian') return (
    // 三弦：长颈圆鼓
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <ellipse cx="16" cy="22" rx="4.5" ry="3.5" fill={C.skin} stroke={C.wood3} strokeWidth="0.6"/>
        <rect x="15" y="3" width="2" height="19" rx="1" fill={C.wood}/>
        <rect x="13.5" y="3" width="5" height="2" rx="0.5" fill={C.wood3}/>
        {[15.3, 16, 16.7].map(x => <line key={x} x1={x} y1="5" x2={x} y2="24" stroke={C.string} strokeWidth="0.3"/>)}
      </g>
    </svg>
  );

  if (type === 'yueqin') return (
    // 月琴：圆月形琴身 + 短颈
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <circle cx="16" cy="20" r="7" fill={C.wood2} stroke={C.wood3} strokeWidth="0.6"/>
        <circle cx="16" cy="20" r="1.5" fill={C.wood3}/>
        <rect x="15" y="7" width="2" height="11" rx="1" fill={C.wood}/>
        {[9, 11, 13].map(y => <line key={y} x1="14" y1={y} x2="18" y2={y} stroke={C.wood} strokeWidth="0.4"/>)}
        {[15.3, 16, 16.7, 17.4].map(x => <line key={x} x1={x} y1="14" x2={x} y2="26" stroke={C.string} strokeWidth="0.3"/>)}
      </g>
    </svg>
  );

  if (type === 'konghou') return (
    // 箜篌：竖琴状 · 弯弓
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <path d="M7,6 Q5,16 8,28" stroke={C.wood3} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M23,6 Q20,4 7,6" stroke={C.wood} strokeWidth="1.5" fill="none"/>
        <rect x="22" y="6" width="2" height="22" rx="1" fill={C.wood}/>
        {[10, 13, 16, 19, 22, 25].map((y, i) => (
          <line key={y} x1={8.5 - i * 0.3} y1={y} x2="22" y2={y - (22 - y) * 0.1}
            stroke={C.string} strokeWidth="0.3"/>
        ))}
      </g>
    </svg>
  );

  // ═══ 新增 · 拉弦类 ═══
  if (type === 'gaohu') return (
    // 高胡：和二胡类似但琴筒更小、声音更高亮
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="15.5" y="4" width="1.5" height="22" rx="0.7" fill={C.wood}/>
        <circle cx="16" cy="24" r="3.5" fill="none" stroke={C.wood3} strokeWidth="1.5"/>
        <rect x="14" y="22.5" width="4" height="4" rx="0.8" fill={C.skin} opacity="0.55"/>
        <line x1="15.7" y1="6" x2="15.7" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <line x1="16.3" y1="6" x2="16.3" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <rect x="12.5" y="6" width="7" height="1.2" rx="0.4" fill={C.wood3}/>
      </g>
    </svg>
  );

  if (type === 'banhu') return (
    // 板胡：椰壳琴筒 + 木板
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="15" y="4" width="2" height="21" rx="1" fill={C.wood}/>
        <circle cx="16" cy="24" r="4.2" fill={C.wood2} stroke={C.wood3} strokeWidth="1"/>
        <circle cx="16" cy="24" r="2" fill={C.wood3} opacity="0.5"/>
        <line x1="15.5" y1="6" x2="15.5" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <line x1="16.5" y1="6" x2="16.5" y2="22" stroke={C.string} strokeWidth="0.4"/>
      </g>
    </svg>
  );

  if (type === 'jinghu') return (
    // 京胡：小琴筒 · 竹制
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <rect x="15.5" y="3" width="1.5" height="23" rx="0.7" fill={C.wood2}/>
        <rect x="14.5" y="22" width="3.5" height="5" rx="0.8" fill={C.wood} opacity="0.7"/>
        <line x1="15.7" y1="5" x2="15.7" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <line x1="16.3" y1="5" x2="16.3" y2="22" stroke={C.string} strokeWidth="0.4"/>
        <rect x="13" y="5" width="7" height="1" rx="0.4" fill={C.wood3}/>
        {/* 竹节 */}
        <line x1="15.3" y1="10" x2="17.3" y2="10" stroke={C.wood3} strokeWidth="0.4"/>
        <line x1="15.3" y1="15" x2="17.3" y2="15" stroke={C.wood3} strokeWidth="0.4"/>
      </g>
    </svg>
  );

  if (type === 'matouqin') return (
    // 马头琴：梯形琴身 · 顶端马头
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        {/* 马头 */}
        <path d="M14,4 Q16,2 18,4 L18,7 Q18,8 17,8 L17,6 L16,7 L15,6 L15,8 Q14,8 14,7 Z" fill={C.wood3}/>
        <circle cx="17" cy="5.5" r="0.4" fill={C.wood}/>
        {/* 琴颈 */}
        <rect x="15.3" y="8" width="1.4" height="11" fill={C.wood}/>
        {/* 梯形琴身 */}
        <path d="M11,19 L21,19 L19,28 L13,28 Z" fill={C.skin} stroke={C.wood3} strokeWidth="0.8"/>
        <line x1="15.7" y1="8" x2="15.7" y2="26" stroke={C.string} strokeWidth="0.4"/>
        <line x1="16.3" y1="8" x2="16.3" y2="26" stroke={C.string} strokeWidth="0.4"/>
      </g>
    </svg>
  );

  // ═══ 新增 · 吹管类 ═══
  if (type === 'xun') return (
    // 陶埙：蛋形陶器 + 吹口
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <ellipse cx="16" cy="19" rx="8" ry="10" fill={C.wood3} stroke={C.wood} strokeWidth="0.6"/>
        <ellipse cx="16" cy="11" rx="2" ry="1.2" fill={C.wood} opacity="0.7"/>
        {[[12,17],[16,16],[20,17],[14,22],[18,22],[16,25]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.7" fill="oklch(0.3 0.05 50)"/>
        ))}
      </g>
    </svg>
  );

  if (type === 'sheng') return (
    // 笙：多管竖列 + 底部斗
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <ellipse cx="16" cy="25" rx="8" ry="3.5" fill={C.wood3}/>
        {/* 管子 */}
        {[-6, -3.5, -1, 1.5, 4, 6.5].map((offset, i) => (
          <rect key={i} x={16 + offset - 0.6} y={4 + i % 2 * 2}
            width="1.2" height={20 - i % 2 * 2} rx="0.5"
            fill={C.wood2}/>
        ))}
        <rect x="10" y="23" width="12" height="1.5" fill={C.wood} opacity="0.5"/>
      </g>
    </svg>
  );

  if (type === 'suona') return (
    // 唢呐：圆锥状 + 大喇叭口
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <path d="M14,4 L18,4 L19,22 L22,28 L10,28 L13,22 Z" fill={C.wood3} stroke={C.wood} strokeWidth="0.5"/>
        <ellipse cx="16" cy="28" rx="6" ry="1.2" fill={C.wood}/>
        <rect x="15.3" y="4" width="1.4" height="2" rx="0.5" fill={C.wood}/>
        {[9, 12, 15, 18].map(y => <circle key={y} cx="16" cy={y} r="0.7" fill={C.wood}/>)}
      </g>
    </svg>
  );

  if (type === 'hulusi') return (
    // 葫芦丝：葫芦 + 下挂 3 根竹管
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        {/* 葫芦 */}
        <ellipse cx="16" cy="8" rx="3" ry="3.5" fill="oklch(0.65 0.12 75)"/>
        <ellipse cx="16" cy="12" rx="4.5" ry="4" fill="oklch(0.60 0.14 70)"/>
        <rect x="15.4" y="5" width="1.2" height="2" fill={C.wood3}/>
        {/* 3 根竹管 */}
        <rect x="12" y="15" width="1.4" height="13" rx="0.5" fill={C.wood2}/>
        <rect x="15.3" y="15" width="1.4" height="13" rx="0.5" fill={C.wood2}/>
        <rect x="18.6" y="15" width="1.4" height="13" rx="0.5" fill={C.wood2}/>
        {[19, 22, 25].map(y => <circle key={y} cx="16" cy={y} r="0.5" fill={C.wood3}/>)}
      </g>
    </svg>
  );

  // ═══ 新增 · 敲击类 ═══
  if (type === 'bianzhong') return (
    // 编钟：架子上挂 3 口钟
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        {/* 架子 */}
        <rect x="4" y="5" width="24" height="1.2" fill={C.wood3}/>
        <rect x="4" y="5" width="1.2" height="22" fill={C.wood3}/>
        <rect x="26.8" y="5" width="1.2" height="22" fill={C.wood3}/>
        <rect x="4" y="26" width="24" height="1.2" fill={C.wood3}/>
        {/* 3 口钟 */}
        {[9, 16, 23].map((cx, i) => (
          <g key={i}>
            <line x1={cx} y1="6" x2={cx} y2="9" stroke={C.wood3} strokeWidth="0.5"/>
            <path d={`M${cx - 3},9 Q${cx},8.5 ${cx + 3},9 L${cx + 3.5},${17 + i * 1} Q${cx},${18 + i * 1} ${cx - 3.5},${17 + i * 1} Z`}
              fill="oklch(0.55 0.08 75)" stroke="oklch(0.35 0.08 60)" strokeWidth="0.5"/>
            <rect x={cx - 0.5} y={9.5} width="1" height="2" fill="oklch(0.35 0.08 60)"/>
          </g>
        ))}
      </g>
    </svg>
  );

  return (
    <svg viewBox="0 0 32 32" width={s} height={s}>
      <g opacity={o}>
        <circle cx="16" cy="16" r="6" fill="none" stroke={C.wood} strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="2" fill={C.wood2}/>
      </g>
    </svg>
  );
}
