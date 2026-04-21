/* 花信风 · 落地页数据
   数据来自 Claude Design handoff · 与 v2.9 app 数据无关
   用途：marketing 落地页的 9 个 section */

// ═══ 24 番花信风 ═══
export const HX_24 = [
  // 小寒
  { jq: '小寒', n: 1, hou: 1, name: '梅花', sp: '梅花', c: '#d87080', hou_label: '一候' },
  { jq: '小寒', n: 2, hou: 2, name: '山茶', sp: '山茶', c: '#c05060', hou_label: '二候' },
  { jq: '小寒', n: 3, hou: 3, name: '水仙', sp: '水仙', c: '#f5d068', hou_label: '三候' },
  // 大寒
  { jq: '大寒', n: 4, hou: 1, name: '瑞香', sp: '梅花', c: '#b87c90', hou_label: '一候' },
  { jq: '大寒', n: 5, hou: 2, name: '兰花', sp: '兰花', c: '#9aa868', hou_label: '二候' },
  { jq: '大寒', n: 6, hou: 3, name: '山矾', sp: '梨花', c: '#e8d8b0', hou_label: '三候' },
  // 立春
  { jq: '立春', n: 7, hou: 1, name: '迎春', sp: '迎春', c: '#e8b848', hou_label: '一候' },
  { jq: '立春', n: 8, hou: 2, name: '樱桃', sp: '樱花', c: '#e08898', hou_label: '二候' },
  { jq: '立春', n: 9, hou: 3, name: '望春', sp: '玉兰', c: '#d4b8c8', hou_label: '三候' },
  // 雨水
  { jq: '雨水', n: 10, hou: 1, name: '菜花', sp: '油菜', c: '#e8c048', hou_label: '一候' },
  { jq: '雨水', n: 11, hou: 2, name: '杏花', sp: '桃花', c: '#e8a0a8', hou_label: '二候' },
  { jq: '雨水', n: 12, hou: 3, name: '李花', sp: '梨花', c: '#f0e8d0', hou_label: '三候' },
  // 惊蛰
  { jq: '惊蛰', n: 13, hou: 1, name: '桃花', sp: '桃花', c: '#e87088', hou_label: '一候' },
  { jq: '惊蛰', n: 14, hou: 2, name: '棣棠', sp: '迎春', c: '#e8a030', hou_label: '二候' },
  { jq: '惊蛰', n: 15, hou: 3, name: '蔷薇', sp: '蔷薇', c: '#d87098', hou_label: '三候' },
  // 春分
  { jq: '春分', n: 16, hou: 1, name: '海棠', sp: '海棠', c: '#e88898', hou_label: '一候' },
  { jq: '春分', n: 17, hou: 2, name: '梨花', sp: '梨花', c: '#f4e8d0', hou_label: '二候' },
  { jq: '春分', n: 18, hou: 3, name: '木兰', sp: '玉兰', c: '#c8a8c0', hou_label: '三候' },
  // 清明
  { jq: '清明', n: 19, hou: 1, name: '桐花', sp: '玉兰', c: '#b8a0c8', hou_label: '一候' },
  { jq: '清明', n: 20, hou: 2, name: '麦花', sp: '梨花', c: '#e8d888', hou_label: '二候' },
  { jq: '清明', n: 21, hou: 3, name: '柳花', sp: '迎春', c: '#a8c078', hou_label: '三候' },
  // 谷雨
  { jq: '谷雨', n: 22, hou: 1, name: '牡丹', sp: '牡丹', c: '#c04860', hou_label: '一候' },
  { jq: '谷雨', n: 23, hou: 2, name: '荼靡', sp: '蔷薇', c: '#f0e0d8', hou_label: '二候' },
  { jq: '谷雨', n: 24, hou: 3, name: '楝花', sp: '楝花', c: '#b8b0d0', hou_label: '三候' }
];

// ═══ 花卉百科 ═══
export const HX_WIKI = [
  { name: '梅花',  latin: 'Prunus mume',          genus: '蔷薇科 · 李属',   lang: '坚贞 · 高洁',   peak: '一月 · 小寒',    c: '#d87080', sp: '梅花', poem: '墙角数枝梅，凌寒独自开。',              poet: '王安石' },
  { name: '桃花',  latin: 'Prunus persica',       genus: '蔷薇科 · 桃属',   lang: '爱情 · 美满',   peak: '三月 · 惊蛰',    c: '#e87088', sp: '桃花', poem: '人面不知何处去，桃花依旧笑春风。',     poet: '崔护' },
  { name: '樱花',  latin: 'Prunus serrulata',     genus: '蔷薇科 · 樱属',   lang: '生命 · 纯洁',   peak: '三月 · 春分',    c: '#e8a0b0', sp: '樱花', poem: '我愿将来生世世，都作樱花树下人。',     poet: '丰子恺' },
  { name: '玉兰',  latin: 'Magnolia denudata',    genus: '木兰科 · 木兰属', lang: '高洁 · 感激',   peak: '三月 · 惊蛰',    c: '#d4b8c8', sp: '玉兰', poem: '玉兰如白鹤，振翅欲凌云。',             poet: '文震亨' },
  { name: '海棠',  latin: 'Malus spectabilis',    genus: '蔷薇科 · 苹果属', lang: '思念 · 温和',   peak: '四月 · 春分',    c: '#e88898', sp: '海棠', poem: '东风袅袅泛崇光，香雾空蒙月转廊。',     poet: '苏轼' },
  { name: '牡丹',  latin: 'Paeonia suffruticosa', genus: '毛茛科 · 芍药属', lang: '富贵 · 雍容',   peak: '四月 · 谷雨',    c: '#c04860', sp: '牡丹', poem: '唯有牡丹真国色，花开时节动京城。',     poet: '刘禹锡' },
  { name: '荷花',  latin: 'Nelumbo nucifera',     genus: '莲科 · 莲属',     lang: '清廉 · 纯净',   peak: '六月 · 小暑',    c: '#e8a0a8', sp: '荷花', poem: '接天莲叶无穷碧，映日荷花别样红。',     poet: '杨万里' },
  { name: '桂花',  latin: 'Osmanthus fragrans',   genus: '木樨科 · 木樨属', lang: '友好 · 吉祥',   peak: '九月 · 白露',    c: '#e8c060', sp: '桂花', poem: '人闲桂花落，夜静春山空。',             poet: '王维' },
  { name: '菊花',  latin: 'Chrysanthemum morifolium', genus: '菊科 · 菊属', lang: '隐逸 · 长寿',   peak: '十月 · 寒露',    c: '#e8b048', sp: '菊花', poem: '采菊东篱下，悠然见南山。',             poet: '陶渊明' },
  { name: '红枫',  latin: 'Acer palmatum',        genus: '槭树科 · 槭属',   lang: '深情 · 热烈',   peak: '十一月 · 立冬',  c: '#c84830', sp: '红枫', poem: '停车坐爱枫林晚，霜叶红于二月花。',     poet: '杜牧' },
  { name: '山茶',  latin: 'Camellia japonica',    genus: '山茶科 · 山茶属', lang: '可爱 · 谦让',   peak: '一月 · 小寒',    c: '#c05060', sp: '山茶', poem: '山茶花开春未归，春归正值花盛时。',     poet: '陆游' },
  { name: '水仙',  latin: 'Narcissus tazetta',    genus: '石蒜科 · 水仙属', lang: '清雅 · 自爱',   peak: '一月 · 小寒',    c: '#e8c860', sp: '水仙', poem: '得水能仙与天奇，寒香寂寞动冰肌。',     poet: '黄庭坚' }
];

// ═══ 成就徽章 ═══
export const HX_BADGES = [
  { emoji: '🌸', name: '探花使',   desc: '首次赏花打卡',  c: '#e08898' },
  { emoji: '💐', name: '采花令',   desc: '打卡十地',     c: '#c04860' },
  { emoji: '🗺', name: '行者',     desc: '跨越七省',     c: '#3a6b5a' },
  { emoji: '🔄', name: '四时',     desc: '集齐四季',     c: '#b08040' },
  { emoji: '🎋', name: '风雅客',   desc: '抽签三十次',    c: '#8a7a5a' },
  { emoji: '📜', name: '诗心',     desc: '收藏五十首',    c: '#a0301c' },
  { emoji: '💎', name: '稀客',     desc: '见罕见花候',    c: '#6a8aaa' },
  { emoji: '🍃', name: '早春人',   desc: '立春首签',      c: '#5a8a50' }
];

// ═══ 三栏意境 ═══
export const HX_PILLARS = [
  { eyebrow: '节·气', title: '顺时而游', glyph: '候',
    body: '二十四番花信风，应候而至。融合气象实时积温与古法物候，提早三日为你预告每一枝的盛放。' },
  { eyebrow: '雅·事', title: '以诗相伴', glyph: '诗',
    body: '每一处花信，配一则宋人小记、一首唐人近体；旅次之间，翻开是《广群芳谱》，合上是清明帖。' },
  { eyebrow: '山·水', title: '千里江山', glyph: '山',
    body: '全图以《千里江山图》青绿为本，水墨为底；景点以花为记，江河以气象为色——一张可呼吸的中国地图。' }
];

// ═══ 数据展示 ═══
export const HX_STATS = [
  { n: '404', label: '赏花景点', sub: 'across 34 省' },
  { n: '二十四', label: '番花信风', sub: 'phenology solar terms' },
  { n: '七十四', label: '花卉百科', sub: 'flora entries' },
  { n: '五十二', label: '诗词雅集', sub: 'classical poems' }
];

// ═══ 花签 · 5 支签 ═══
export const FORTUNES = [
  { rank: '上上签', name: '春风得意', verse: '春风得意马蹄疾，一日看尽长安花。',     poet: '孟郊',    interp: '万事顺遂，花开堪折。所愿之事，近在旦夕。', c: '#c84848' },
  { rank: '上 签',  name: '桃之夭夭', verse: '桃之夭夭，灼灼其华。之子于归，宜其室家。', poet: '《诗经》', interp: '缘分已至，人间良辰。静待花开，自有佳音。', c: '#e07090' },
  { rank: '中 签',  name: '疏影横斜', verse: '疏影横斜水清浅，暗香浮动月黄昏。',     poet: '林逋',    interp: '当下虽淡，幽香自远。守拙抱朴，得其所归。', c: '#a07850' },
  { rank: '下 签',  name: '花自飘零', verse: '花自飘零水自流。一种相思，两处闲愁。', poet: '李清照',  interp: '时节未至，不强求。且收此心，待东风再起。', c: '#607890' },
  { rank: '上上签', name: '国色天香', verse: '唯有牡丹真国色，花开时节动京城。',     poet: '刘禹锡',  interp: '气象正盛。所行之路，皆有繁花相迎。',       c: '#b04050' }
];
