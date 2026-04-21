import React from 'react';

/* ═══════════════════════════════════════════════════════════════
   flower-marks · 诗人足迹站点的花朵 SVG 标记
   ───────────────────────────────────────────────────────────────
   替代 InkMap 里朱砂圆点 · 每站用该站实际写的花
   
   每种花：
     · 5-8 瓣
     · 一套专属色
     · 可旋转 · 可缩放
   ═══════════════════════════════════════════════════════════════ */

// 花朵配色 · 每种花有自己的视觉
const FLOWER_PALETTE = {
  // 春花
  '杏':    { petals: 5, petal: '#f8b8c0', center: '#f8e080',  bg: '#fbd8dc' },
  '桃':    { petals: 5, petal: '#ffa8b8', center: '#f8c050',  bg: '#ffc8d4' },
  '樱':    { petals: 5, petal: '#ffc0d0', center: '#f8d070',  bg: '#ffd8e4' },
  '梨':    { petals: 5, petal: '#fdf4f0', center: '#f8e090',  bg: '#faefe8' },
  '牡丹':  { petals: 7, petal: '#c23850', center: '#f8e080',  bg: '#e06878' },
  '桂':    { petals: 4, petal: '#e8b850', center: '#c89a30',  bg: '#eec878' },

  // 夏花
  '荷':    { petals: 8, petal: '#f8c0c8', center: '#f8e080',  bg: '#ffc8d8' },
  '紫薇':  { petals: 6, petal: '#b880c0', center: '#f8d070',  bg: '#cc9ad0' },
  '海棠':  { petals: 5, petal: '#e06880', center: '#f8c850',  bg: '#e88890' },
  '荔枝':  { petals: 4, petal: '#c04060', center: '#a03840',  bg: '#d06080' },

  // 秋花
  '菊':    { petals: 12, petal: '#e8a050', center: '#c89a30', bg: '#f0b868' },
  '芦':    { petals: 6, petal: '#e8d0b0', center: '#a88a5a',  bg: '#f0d8b8' },
  '枫':    { petals: 0, petal: '#c04a30', center: '#a03820',  bg: '#d86040' },  // 红叶用三角
  '荻':    { petals: 6, petal: '#d8c8a8', center: '#a88a5a',  bg: '#e0d0b0' },

  // 冬花
  '梅':    { petals: 5, petal: '#d86b7a', center: '#f8e080',  bg: '#e08898' },

  // 植物（非开花）
  '柳':    { petals: 0, petal: '#8a9a4a', center: '#6a7a2a',  bg: '#a8b868' },  // 柳叶
  '竹':    { petals: 0, petal: '#5a7a4a', center: '#3a5a2a',  bg: '#7a9a6a' },  // 竹叶
  '藤':    { petals: 0, petal: '#7a5a4a', center: '#5a3a2a',  bg: '#9a7a6a' },
  '杨梅':  { petals: 4, petal: '#8a3020', center: '#6a2010',  bg: '#a04030' },

  // 泛指
  '杂花':  { petals: 5, petal: '#e8a088', center: '#f8d070',  bg: '#efb89a' },
  '百花':  { petals: 5, petal: '#e8a088', center: '#f8d070',  bg: '#efb89a' },
  '春花':  { petals: 5, petal: '#ffb8c4', center: '#f8d070',  bg: '#ffcdd4' },
  '落花':  { petals: 5, petal: '#c8a098', center: '#a88070',  bg: '#d0b0a8' },
  '芳草':  { petals: 0, petal: '#8a9a4a', center: '#6a7a2a',  bg: '#a0b068' }
};

/**
 * 把 footprint.flower（如 "杏花 · 牡丹"）归一化为主花种 key
 */
export function extractFlowerKey(flowerText) {
  if (!flowerText) return '杂花';
  // 取第一个 · 去掉"花"字 · 去括号
  const first = flowerText.split('·')[0].split('・')[0].trim()
    .replace(/花$/, '')
    .replace(/\（[^）]+\）/g, '')
    .replace(/\([^)]+\)/g, '')
    .trim();

  // 精确匹配
  if (FLOWER_PALETTE[first]) return first;

  // 模糊匹配
  for (const key of Object.keys(FLOWER_PALETTE)) {
    if (first.includes(key) || key.includes(first)) return key;
  }

  return '杂花';
}

/**
 * 花朵 SVG · 可直接插入 <svg> 内
 * @param {object} props - { flowerKey, x, y, size, highlighted, poetColor, onClick, id }
 */
export function FlowerMarker({ flowerKey, x, y, size = 14, highlighted = false, poetColor, onClick, id, label }) {
  const p = FLOWER_PALETTE[flowerKey] || FLOWER_PALETTE['杂花'];
  const r = highlighted ? size * 1.3 : size;
  const rotation = id ? (id * 37) % 360 : 0;  // 每朵花稍转一下 · 不千篇一律

  return (
    <g transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}>

      {/* 诗人色底圈 · 小而隐约 · 用于辨识诗人 */}
      {poetColor && (
        <circle r={r + 6}
          fill={poetColor}
          opacity={highlighted ? 0.18 : 0.10}/>
      )}

      {/* 高亮光晕 */}
      {highlighted && (
        <circle r={r + 10} fill={poetColor || '#c23820'} opacity="0.08">
          <animate attributeName="r" values={`${r+6};${r+14};${r+6}`}
            dur="2.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.15;0.04;0.15"
            dur="2.2s" repeatCount="indefinite"/>
        </circle>
      )}

      <g transform={`rotate(${rotation})`}>
        {/* 花瓣 */}
        {p.petals > 0 ? (
          Array.from({ length: p.petals }, (_, i) => {
            const deg = (i * 360 / p.petals);
            const rx = r * 0.33;
            const ry = r * 0.65;
            return (
              <ellipse key={i}
                cx="0" cy={-r * 0.5}
                rx={rx} ry={ry}
                fill={p.petal}
                opacity="0.88"
                transform={`rotate(${deg})`}/>
            );
          })
        ) : flowerKey === '枫' ? (
          // 红叶 · 五角
          <path d={`M 0 ${-r} L ${r*0.6} ${-r*0.1} L ${r*0.35} ${r*0.7} L ${-r*0.35} ${r*0.7} L ${-r*0.6} ${-r*0.1} Z`}
            fill={p.petal} opacity="0.88"/>
        ) : (
          // 柳/竹/藤 · 长叶
          <g>
            <ellipse cx="0" cy="0" rx={r*0.28} ry={r*0.95}
              fill={p.petal} opacity="0.88"/>
            <ellipse cx={-r*0.35} cy={r*0.15} rx={r*0.22} ry={r*0.7}
              fill={p.petal} opacity="0.7" transform={`rotate(-28)`}/>
            <ellipse cx={r*0.35} cy={r*0.15} rx={r*0.22} ry={r*0.7}
              fill={p.petal} opacity="0.7" transform={`rotate(28)`}/>
          </g>
        )}

        {/* 花蕊 */}
        {p.petals > 0 && (
          <>
            <circle r={r * 0.32} fill={p.center} opacity="0.95"/>
            <circle r={r * 0.15} fill="#c89a30" opacity="0.85"/>
          </>
        )}
      </g>

      {/* 标签（可选） */}
      {label && highlighted && (
        <text y={r + 18}
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontSize="11"
          fill="var(--ink)"
          fontWeight="600"
          letterSpacing="2"
          style={{ pointerEvents: 'none' }}>
          {label}
        </text>
      )}
    </g>
  );
}

export { FLOWER_PALETTE };
