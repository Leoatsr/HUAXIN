/* ═══════════════════════════════════════════════════════════════
   smartSearch · 智能搜索解析器
   ───────────────────────────────────────────────────────────────
   让朋友可以用自然语言搜：
     · "北京 4 月"       → 区域北京 + 花期 4 月
     · "红色的花"         → 按颜色匹配花种
     · "盛花"             → 仅筛选当前盛花期景点
     · "洛阳"             → 景点名含洛阳
     · "梅花"             → 花种梅花
     · "江南 樱花"        → 华东 + 樱花
   简单启发式 · 不用 LLM
   ═══════════════════════════════════════════════════════════════ */

// 花色 → 花种关键词映射
const COLOR_MAP = {
  '红': ['梅花','桃花','杜鹃','山茶','海棠','牡丹','芍药','玫瑰','凤凰木','红叶','枫'],
  '粉': ['樱花','桃花','海棠','梅花','紫荆','梨花','杏花','荷花','紫薇'],
  '白': ['玉兰','梨花','樱花','白牡丹','杏花','茉莉','油桐','木兰'],
  '黄': ['油菜花','金桂','蜡梅','迎春','向日葵','银杏','连翘','黄花风铃木','菜花'],
  '紫': ['薰衣草','紫藤','紫薇','紫荆','鸢尾','二月兰'],
  '蓝': ['蓝花楹','鸢尾','勿忘我'],
  '金': ['油菜花','银杏','金桂','向日葵']
};

// 地域别名（粗）
const REGION_ALIASES = {
  '江南': ['华东', '苏州', '杭州', '南京', '无锡', '上海'],
  '华北': ['华北', '北京', '天津', '石家庄'],
  '关中': ['西安', '西北'],
  '岭南': ['华南', '广州', '深圳', '南宁'],
  '巴蜀': ['四川', '成都', '重庆', '西南'],
  '塞北': ['西北', '内蒙', '新疆'],
  '东北': ['东北', '哈尔滨', '沈阳', '长春'],
  '江东': ['华东'],
  '川西': ['西南', '四川']
};

/**
 * 解析 query 为结构化过滤条件
 * @param {string} query
 * @returns {{ text: string, months: number[], regions: string[], speciesKeywords: string[], mustBloom: boolean }}
 */
export function parseSmartQuery(query) {
  const result = {
    text: '',
    months: [],
    regions: [],
    speciesKeywords: [],
    mustBloom: false
  };
  if (!query) return result;

  let q = query.trim();

  // 1. 月份识别：1 月、4月、十月
  const monthZh = { '一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9, '十':10, '十一':11, '十二':12 };
  const monthMatches = [
    ...q.matchAll(/(\d{1,2})\s*月/g),
    ...q.matchAll(/([一二三四五六七八九十]|十一|十二)月/g)
  ];
  monthMatches.forEach(m => {
    const raw = m[1];
    const n = /\d/.test(raw) ? Number(raw) : monthZh[raw];
    if (n && n >= 1 && n <= 12 && !result.months.includes(n)) result.months.push(n);
    q = q.replace(m[0], ' ');
  });

  // 2. 季节识别 · 先匹配长词（春天 > 春）
  const seasonMonths = {
    '春天': [3,4,5], '夏天': [6,7,8], '秋天': [9,10,11], '冬天': [12,1,2],
    '春': [3,4,5], '夏': [6,7,8], '秋': [9,10,11], '冬': [12,1,2]
  };
  Object.keys(seasonMonths).forEach(k => {
    if (q.includes(k)) {
      seasonMonths[k].forEach(m => {
        if (!result.months.includes(m)) result.months.push(m);
      });
      q = q.replace(k, ' ');
    }
  });

  // 3. 盛花识别
  if (/盛花|正开|在开|开了|盛放/.test(q)) {
    result.mustBloom = true;
    q = q.replace(/盛花|正开|在开|开了|盛放/g, ' ');
  }

  // 4. 地域识别
  Object.keys(REGION_ALIASES).forEach(alias => {
    if (q.includes(alias)) {
      result.regions.push(...REGION_ALIASES[alias]);
      q = q.replace(alias, ' ');
    }
  });

  // 5. 颜色识别
  const colorMatches = q.match(/(红|粉|白|黄|紫|蓝|金)色?的?花?/g);
  if (colorMatches) {
    colorMatches.forEach(cm => {
      const c = cm[0];
      if (COLOR_MAP[c]) {
        result.speciesKeywords.push(...COLOR_MAP[c]);
      }
      q = q.replace(cm, ' ');
    });
  }

  // 6. 剩余文本
  result.text = q.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * 把 parsed query 应用到 flora 列表
 */
export function applySmartSearch(flora, parsed) {
  let list = flora;

  // 月份筛选（景点花期 pk 是 [开始月, 结束月]）
  if (parsed.months.length > 0) {
    list = list.filter(f => {
      if (!f.pk) return false;
      const [start, end] = f.pk;
      return parsed.months.some(m => {
        if (start <= end) return m >= start && m <= end;
        // 跨年（如 12-2）
        return m >= start || m <= end;
      });
    });
  }

  // 地域
  if (parsed.regions.length > 0) {
    list = list.filter(f => parsed.regions.some(r => f.rg === r || (f.n || '').includes(r)));
  }

  // 花色（花种关键词 OR 匹配）
  if (parsed.speciesKeywords.length > 0) {
    list = list.filter(f => parsed.speciesKeywords.some(kw => (f.sp || '').includes(kw)));
  }

  // 仅盛花
  if (parsed.mustBloom) {
    list = list.filter(f => f._st && f._st.l >= 3);
  }

  // 文本模糊匹配
  if (parsed.text) {
    const q = parsed.text.toLowerCase();
    list = list.filter(f =>
      (f.n || '').toLowerCase().includes(q) ||
      (f.sp || '').toLowerCase().includes(q) ||
      (f.rg || '').toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * 为搜索框生成提示语（让用户知道能搜什么）
 */
export const SEARCH_HINTS = [
  '北京 4 月',
  '江南 樱花',
  '红色的花',
  '春天 盛花',
  '岭南 3月',
  '洛阳 牡丹'
];
