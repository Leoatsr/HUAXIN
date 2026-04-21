// 花信风 · 动态 meta 更新
// 对"内部导航"有效（SPA 切换时 title 变化，搜索引擎 JS 渲染后能抓到）
// 对"微信/QQ 分享" 限制：这些爬虫通常不执行 JS，分享 deep link 仍展示根 meta
//
// 使用方式：
//   useEffect(() => { updateMeta({ title: '花事地图', description: '...' }); }, [])

const DEFAULTS = {
  title: '花信风 · 跟着天地节律追一场中国色',
  description: '基于中国传统物候学的智能赏花地图。二十四番花信风 × 积温预测 × 实时气象。',
  ogImage: '/og-image.png'
};

function setOrCreateMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updateMeta({ title, description, ogImage, url } = {}) {
  const t = title ? `${title} · 花信风` : DEFAULTS.title;
  const d = description || DEFAULTS.description;
  const img = ogImage || DEFAULTS.ogImage;
  const u = url || window.location.href;

  if (document.title !== t) document.title = t;

  setOrCreateMeta('name', 'description', d);
  setOrCreateMeta('property', 'og:title', t);
  setOrCreateMeta('property', 'og:description', d);
  setOrCreateMeta('property', 'og:image', img);
  setOrCreateMeta('property', 'og:url', u);
  setOrCreateMeta('name', 'twitter:title', t);
  setOrCreateMeta('name', 'twitter:description', d);
  setOrCreateMeta('name', 'twitter:image', img);
}

export function resetMeta() {
  updateMeta({});
}

// 景点专用（用到 spot 的信息）
export function setSpotMeta(spot) {
  if (!spot) return resetMeta();
  updateMeta({
    title: `${spot.n} · ${spot.sp}`,
    description: [
      spot.n,
      `赏${spot.sp}`,
      spot._pred ? `预计 ${spot._pred.dateStr} 盛开` : '',
      spot.tp || spot.po || ''
    ].filter(Boolean).join(' · ').slice(0, 140),
    url: `${window.location.origin}${window.location.pathname}#/spot/${spot.id}`
  });
}

// 主屏专用
export function setScreenMeta(screen) {
  const MAP = {
    landing:   { t: '千里江山 · 中国赏花地图',    d: '花信风落地页 · 24 番花信，万树花期' },
    map:       { t: '花事地图',                  d: '404 景点 · 74 花卉 · 实时物候预测' },
    huaxin:    { t: '二十四番花信风',             d: '从小寒到谷雨，72 候 24 花信' },
    mood:      { t: '花签 · 每日一签',           d: '以花观心，今日所得' },
    diary:     { t: '我的花历',                  d: '打卡足迹 · 年度热力图 · 12 徽章' },
    wiki:      { t: '花卉百科',                  d: '74 种中国名花 · 别名/花语/典故' },
    poem:      { t: '诗词花事',                  d: '500+ 首花卉古诗，从《诗经》到《花信词》' },
    calendar:  { t: '花事日历',                  d: '12 月 × 花种矩阵' },
    dashboard: { t: '花事概览',                  d: '全国花事数据一览' },
    trip:      { t: '花事行程',                  d: 'TSP 路线优化 · 花期窗口重叠' }
  };
  const cfg = MAP[screen];
  if (cfg) updateMeta({ title: cfg.t, description: cfg.d });
  else resetMeta();
}
