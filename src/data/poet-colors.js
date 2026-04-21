/* ═══════════════════════════════════════════════════════════════
   poet-colors · 诗人专属色盘
   ───────────────────────────────────────────────────────────────
   每位诗人一套"气质色" · 用于地图足迹线、花朵底圈、关系图等
   
   配色理念：
     · 避免饱和度过高
     · 保留传统中国色谱感（朱褐、月青、香褐、东坡金等）
     · 每人的色彩与其诗风呼应
   ═══════════════════════════════════════════════════════════════ */

export const POET_COLORS = {
  // ═══ 已收录 4 位 ═══
  libai:    { color: '#5a7a9a', name: '月色青蓝', mood: '月与酒' },
  dufu:     { color: '#a04a3a', name: '沉郁朱褐', mood: '飘泊' },
  baijuyi:  { color: '#7a8a4a', name: '香山褐绿', mood: '闲适' },
  sushi:    { color: '#c89a4a', name: '东坡金',   mood: '旷达' },

  // ═══ 初唐 ═══
  wangbo:    { color: '#b86070', name: '滕王阁朱', mood: '早慧' },
  luobinwang:{ color: '#a0b8c0', name: '咏鹅鹅青', mood: '少年' },
  chenziang: { color: '#7a6050', name: '幽州台褐', mood: '苍凉' },
  hezhizhang:{ color: '#c8b060', name: '越乡橘黄', mood: '归老' },

  // ═══ 盛唐 ═══
  wangwei:   { color: '#6a8e6e', name: '辋川苔绿', mood: '禅寂' },
  menghaoran:{ color: '#a89860', name: '鹿门淡金', mood: '隐逸' },
  wangchangling:{ color: '#8a6a80', name: '边塞葡紫', mood: '七绝' },
  censhen:   { color: '#b88060', name: '北庭风沙', mood: '边塞' },
  gaoshi:    { color: '#706070', name: '塞北侠灰', mood: '豪情' },
  weiyingwu: { color: '#9ab09a', name: '苏州淡碧', mood: '简澹' },

  // ═══ 中唐 ═══
  hanyu:     { color: '#604848', name: '古文深褐', mood: '雄深' },
  liuzongyuan:{ color: '#4a6658', name: '永州幽绿', mood: '孤清' },
  liuyuxi:   { color: '#b04a60', name: '桃花朱红', mood: '诗豪' },
  yuanzhen:  { color: '#906a8a', name: '长恨微紫', mood: '情深' },

  // ═══ 晚唐 ═══
  lishangyin:{ color: '#806090', name: '锦瑟缁紫', mood: '隐晦' },
  dumu:      { color: '#d0a060', name: '江南杏黄', mood: '风流' }
};

/**
 * 返回诗人色 · 找不到则给默认
 */
export function getPoetColor(id) {
  return POET_COLORS[id]?.color || '#8a7560';
}
