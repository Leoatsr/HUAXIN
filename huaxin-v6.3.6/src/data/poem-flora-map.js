/* ═══════════════════════════════════════════════════════════════
   poem-flora-map · 12 首诗 × 景点双向映射
   ───────────────────────────────────────────────────────────────
   每首诗的标注维度：
     id            唯一键
     title         诗名
     author        作者 + 朝代
     lines         正文 · 按句存 array
     species       花种（对应 FLORA 里的 sp 字段）
     seasonHint    季节 · '早春' / '春' / '春末' / '夏' ...
     months        建议赏花月 array
     atmosphere    氛围标签 array · 'snow' / 'field' / 'pond' / 'alpine' / 'temple' / 'garden' / 'wild' / 'ink'
     imagery       关键意象 array · 用于推荐理由
     recommendedSpots  推荐景点的 id（首选 2-3 个 · 人工精挑 · 其余靠算法）
     annotation    一句话导语 · 让用户知道"为什么这诗配这景"
   ═══════════════════════════════════════════════════════════════ */

export const POEM_MAP = [
  {
    id: 'p01-wangan-meihua',
    title: '梅花',
    author: '王安石 · 宋',
    lines: [
      '墙角数枝梅，凌寒独自开。',
      '遥知不是雪，为有暗香来。'
    ],
    species: '梅花',
    seasonHint: '冬末 · 正月',
    months: [1, 2],
    atmosphere: ['snow', 'cold', 'solitary'],
    imagery: ['雪', '寒', '暗香', '独自', '远望'],
    recommendedSpots: [],  // 从 FLORA 里按 species='梅花' + 北方冬末 筛
    annotation: '诗中有"疑雪"之景 · 宜往北方寒地赏梅 · 雪中见其孤傲。'
  },
  {
    id: 'p02-baijuyi-dalin',
    title: '大林寺桃花',
    author: '白居易 · 唐',
    lines: [
      '人间四月芳菲尽，山寺桃花始盛开。',
      '长恨春归无觅处，不知转入此中来。'
    ],
    species: '桃花',
    seasonHint: '春末 · 四月',
    months: [4],
    atmosphere: ['alpine', 'temple', 'delayed'],
    imagery: ['山寺', '四月', '高山', '迟开', '意外'],
    recommendedSpots: [],  // 高山寺院 / 林芝 / 庐山
    annotation: '白居易写庐山大林寺 · 山寺海拔高 · 四月才桃花盛。适合去林芝、庐山、香格里拉等高海拔桃林。'
  },
  {
    id: 'p03-yang-youcai',
    title: '宿新市徐公店',
    author: '杨万里 · 宋',
    lines: [
      '篱落疏疏一径深，树头新绿未成阴。',
      '儿童急走追黄蝶，飞入菜花无处寻。'
    ],
    species: '油菜花',
    seasonHint: '春中 · 三月',
    months: [3, 4],
    atmosphere: ['field', 'rural', 'innocence'],
    imagery: ['篱落', '菜花', '儿童', '黄蝶', '田野'],
    recommendedSpots: [],  // 婺源 / 汉中 / 罗平
    annotation: '金黄菜花田 · 配童趣之野。宜往婺源篁岭、汉中盆地、云南罗平等梯田花海。'
  },
  {
    id: 'p04-liu-mudan',
    title: '赏牡丹',
    author: '刘禹锡 · 唐',
    lines: [
      '庭前芍药妖无格，池上芙蕖净少情。',
      '唯有牡丹真国色，花开时节动京城。'
    ],
    species: '牡丹',
    seasonHint: '春末 · 四月',
    months: [4, 5],
    atmosphere: ['garden', 'grand', 'royal'],
    imagery: ['国色', '京城', '倾动', '庭院'],
    recommendedSpots: [],  // 洛阳 / 菏泽
    annotation: '牡丹为花中之王 · 盛开时"动京城"。当去洛阳国花园、菏泽曹州牡丹园 · 见最盛之姿。'
  },
  {
    id: 'p05-yang-xiaochi',
    title: '小池',
    author: '杨万里 · 宋',
    lines: [
      '泉眼无声惜细流，树阴照水爱晴柔。',
      '小荷才露尖尖角，早有蜻蜓立上头。'
    ],
    species: '荷花',
    seasonHint: '初夏 · 五月',
    months: [5, 6],
    atmosphere: ['pond', 'delicate', 'intimate'],
    imagery: ['泉眼', '小荷', '尖尖角', '蜻蜓', '初露'],
    recommendedSpots: [],  // 小荷初期的池塘
    annotation: '不是满塘的荷 · 是"小荷才露尖尖角"的初夏小池。适合苏州园林、杭州小池、江南水乡初夏。'
  },
  {
    id: 'p06-yang-jingci',
    title: '晓出净慈寺送林子方',
    author: '杨万里 · 宋',
    lines: [
      '毕竟西湖六月中，风光不与四时同。',
      '接天莲叶无穷碧，映日荷花别样红。'
    ],
    species: '荷花',
    seasonHint: '夏盛 · 六月',
    months: [6, 7],
    atmosphere: ['pond', 'vast', 'grand'],
    imagery: ['西湖', '六月', '接天', '无穷', '映日'],
    recommendedSpots: [],  // 西湖必选
    annotation: '杨万里同写荷 · 此处为"接天连碧"的壮阔。必去杭州西湖 · 或微山湖、洪湖、白洋淀等大湖赏。'
  },
  {
    id: 'p07-baijuyi-zihua',
    title: '紫薇花',
    author: '白居易 · 唐',
    lines: [
      '紫薇花对紫微翁，名目虽同貌不同。',
      '独占芳菲当夏景，不将颜色托春风。'
    ],
    species: '紫薇',
    seasonHint: '仲夏 · 七月',
    months: [6, 7, 8, 9],
    atmosphere: ['garden', 'long-bloom', 'solitary'],
    imagery: ['独占', '夏景', '不托春风', '百日红'],
    recommendedSpots: [],
    annotation: '紫薇又名"百日红" · 夏日独开 · 不与春花争艳。适合公园、庭院赏。'
  },
  {
    id: 'p08-wangwei-niaoming',
    title: '鸟鸣涧',
    author: '王维 · 唐',
    lines: [
      '人闲桂花落，夜静春山空。',
      '月出惊山鸟，时鸣春涧中。'
    ],
    species: '桂花',
    seasonHint: '秋初 · 九月',
    months: [9, 10],
    atmosphere: ['temple', 'silence', 'night', 'alpine'],
    imagery: ['人闲', '桂花落', '夜静', '山空', '月'],
    recommendedSpots: [],  // 桂林山水 / 苏州寺院桂林
    annotation: '此非观花 · 是**闻花**。夜静桂落 · 当去桂林山中、苏州灵岩寺、杭州满觉陇等夜赏桂花。'
  },
  {
    id: 'p09-tao-yinjiu',
    title: '饮酒·其五',
    author: '陶渊明 · 东晋',
    lines: [
      '采菊东篱下，悠然见南山。',
      '山气日夕佳，飞鸟相与还。'
    ],
    species: '菊花',
    seasonHint: '秋中 · 九月',
    months: [9, 10, 11],
    atmosphere: ['rural', 'garden', 'solitary', 'wild'],
    imagery: ['东篱', '南山', '悠然', '日夕', '飞鸟'],
    recommendedSpots: [],
    annotation: '不是菊展的菊 · 是"东篱下"的野菊。适合乡村小院、开封菊会之外，可往庐山、南山寻古。'
  },
  {
    id: 'p10-dumu-shanxing',
    title: '山行',
    author: '杜牧 · 唐',
    lines: [
      '远上寒山石径斜，白云生处有人家。',
      '停车坐爱枫林晚，霜叶红于二月花。'
    ],
    species: '红叶',
    seasonHint: '秋末 · 十一月',
    months: [10, 11, 12],
    atmosphere: ['alpine', 'solitary', 'grand'],
    imagery: ['寒山', '石径', '白云', '枫林', '霜叶', '二月花'],
    recommendedSpots: [],
    annotation: '红叶之最 · 必往北京香山、苏州天平山、南京栖霞山、川西米亚罗。霜后之红胜过春花。'
  },
  {
    id: 'p11-yuan-yinghua',
    title: '樱桃花',
    author: '元稹 · 唐',
    lines: [
      '樱桃花，一枝两枝千万朵。',
      '花砖曾立摘花人，窣破罗裙红似火。'
    ],
    species: '樱花',
    seasonHint: '春中 · 三月末',
    months: [3, 4],
    atmosphere: ['garden', 'lush', 'romance'],
    imagery: ['一枝', '千万朵', '繁花', '红似火'],
    recommendedSpots: [],
    annotation: '不是日式清淡樱 · 是繁枝绚烂的古典樱。适合武汉东湖、南京鸡鸣寺、无锡鼋头渚、西安青龙寺。'
  },
  {
    id: 'p12-wangmian-mome',
    title: '墨梅',
    author: '王冕 · 元',
    lines: [
      '我家洗砚池头树，朵朵花开淡墨痕。',
      '不要人夸好颜色，只留清气满乾坤。'
    ],
    species: '梅花',
    seasonHint: '冬末 · 一月',
    months: [1, 2, 3],
    atmosphere: ['ink', 'solitary', 'scholar'],
    imagery: ['洗砚池', '淡墨痕', '清气', '不夸'],
    recommendedSpots: [],
    annotation: '文人梅 · 重气不重色。适合苏州光福、杭州灵峰、南京梅花山的清寂之处。'
  }
];

/* ═══ 氛围标签中文 ═══ */
export const ATMOSPHERE_LABELS = {
  snow:       '雪景',
  cold:       '寒地',
  solitary:   '独处',
  alpine:     '高山',
  temple:     '古寺',
  delayed:    '迟开',
  field:      '田野',
  rural:      '乡间',
  innocence:  '童趣',
  garden:     '庭园',
  grand:      '壮阔',
  royal:      '贵气',
  pond:       '池塘',
  delicate:   '细腻',
  intimate:   '私密',
  vast:       '辽阔',
  'long-bloom': '久开',
  silence:    '幽静',
  night:      '夜色',
  wild:       '野趣',
  lush:       '繁盛',
  romance:    '柔情',
  ink:        '文墨',
  scholar:    '书卷'
};

/* ═══ 季节提示中文（用于筛选）═══ */
export const SEASON_HINTS = ['早春', '春中', '春末', '夏初', '仲夏', '夏末', '秋初', '秋中', '秋末', '冬'];
