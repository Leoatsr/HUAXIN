/* ═══════════════════════════════════════════════════════════════
   endangered-flora · 中国濒危/保护植物名录
   ───────────────────────────────────────────────────────────────
   来源参考：
     · 国务院《国家重点保护野生植物名录》（2021 更新）
     · IUCN 濒危物种红色名录
     · 中国生物多样性红色名录（2013）
   
   保护级别（cn）：
     '一级'  国家一级重点保护野生植物
     '二级'  国家二级重点保护野生植物
   
   IUCN 等级：
     'EX'  灭绝
     'EW'  野外灭绝
     'CR'  极危
     'EN'  濒危
     'VU'  易危
     'NT'  近危
   
   精选 · 有花的 / 有人文价值的 29 种
   ═══════════════════════════════════════════════════════════════ */

export const ENDANGERED_FLORA = [
  {
    name: '水杉',
    sciName: 'Metasequoia glyptostroboides',
    cn: '一级',
    iucn: 'EN',
    habitat: '四川、湖北、湖南交界',
    story: '1943 年在湖北利川发现 · 原以为 300 万年前已灭绝 · 被誉为"活化石"。',
    peril: '原生种群仅在湖北、湖南、重庆的一片约 600 平方公里区域。野生成熟植株不足 5000 株。',
    reverence: '杉中寿者 · 见证了白垩纪至今的地球生物史。',
    todayPlace: '湖北利川',
    todaySite: '湖北利川·小河水杉王',
    lat: 30.291, lon: 108.935
  },
  {
    name: '银杏',
    sciName: 'Ginkgo biloba',
    cn: '一级',
    iucn: 'EN',
    habitat: '浙江天目山',
    story: '银杏类植物曾遍布世界 · 2.7 亿年前繁盛 · 现仅存一种。',
    peril: '野生银杏仅存浙江天目山 · 其他地方的都是人工栽培。',
    reverence: '"公孙树" · 爷爷栽树孙子才能吃到果 · 是时间的馈赠。',
    todayPlace: '浙江临安',
    todaySite: '浙江临安·天目山国家公园',
    lat: 30.337, lon: 119.441
  },
  {
    name: '珙桐',
    sciName: 'Davidia involucrata',
    cn: '一级',
    iucn: 'NT',
    habitat: '西南山区',
    story: '花朵下垂如鸽子飞翔 · 故名"中国鸽子树"。第三纪孑遗植物。',
    peril: '野生种群因栖息地破碎化而零星分布。',
    reverence: '春末花开如万鸽群舞 · 中国特有 · 1904 年英国植物学家威尔逊惊叹"最优美的乔木"。',
    todayPlace: '四川都江堰',
    todaySite: '四川都江堰·龙池国家森林公园',
    lat: 31.082, lon: 103.534
  },
  {
    name: '红豆杉',
    sciName: 'Taxus chinensis',
    cn: '一级',
    iucn: 'VU',
    habitat: '秦岭、云贵川山区',
    story: '孑遗植物 · 因含紫杉醇（抗癌药）遭大量盗伐。',
    peril: '野生资源锐减 · 天然种群很难再见。',
    reverence: '"紫杉" · 红豆深秋缀枝 · 古人视为吉祥物。',
    todayPlace: '陕西太白山',
    todaySite: '陕西太白山·太白红豆杉保护区',
    lat: 34.083, lon: 107.775
  },
  {
    name: '独蒜兰',
    sciName: 'Pleione bulbocodioides',
    cn: '二级',
    iucn: 'EN',
    habitat: '西南山区石壁',
    story: '兰科小精灵 · 独生一花 · 粉紫色 · 如小号角。',
    peril: '因观赏价值高被大量采挖 · 野生种群急剧减少。',
    reverence: '"独兰" · 不争 · 独开于险壁。',
    todayPlace: '云南昆明',
    todaySite: '云南昆明·中科院昆明植物园',
    lat: 25.136, lon: 102.743
  },
  {
    name: '大花黄牡丹',
    sciName: 'Paeonia ludlowii',
    cn: '一级',
    iucn: 'EN',
    habitat: '西藏林芝',
    story: '野生黄色牡丹 · 花径可达 12cm · 被称为"雪域国色"。',
    peril: '分布狭窄 · 仅西藏米林、林芝一带 · 野生不足 3000 株。',
    reverence: '海拔 2900-3500m 的高原之花 · 见者有幸。',
    todayPlace: '西藏林芝',
    todaySite: '西藏林芝·巴宜大花黄牡丹保护区',
    lat: 29.655, lon: 94.361
  },
  {
    name: '滇池金线鲃',
    sciName: 'Davidia involucrata var. vilmoriniana', // 注：这条留着备用，本数据里主要是植物
    cn: null, iucn: null, _skip: true
  },
  {
    name: '雪莲',
    sciName: 'Saussurea involucrata',
    cn: '二级',
    iucn: 'VU',
    habitat: '天山、昆仑山高山流石滩',
    story: '生于海拔 4000m 以上雪线附近 · 开花需 5-8 年。',
    peril: '因药用价值过度采挖 · 加上高山生境脆弱 · 野生极度稀少。',
    reverence: '"一朵雪莲开数年" · 古人以之喻坚贞。',
    todayPlace: '新疆乌鲁木齐',
    todaySite: '天山一号冰川保护区',
    lat: 43.110, lon: 86.820
  },
  {
    name: '兜兰',
    sciName: 'Paphiopedilum spp.',
    cn: '一级',
    iucn: 'CR/EN',
    habitat: '云贵川、两广、海南',
    story: '花朵唇瓣如拖鞋状兜兜 · 有"东方美人"之称。',
    peril: '中国 18 种兜兰均被列为国家一级保护 · 多种野外近乎绝迹。',
    reverence: '兰之尊贵者 · 每一株都是森林馈赠。',
    todayPlace: '广西桂林',
    todaySite: '广西桂林·雅长兰科植物保护区',
    lat: 24.77, lon: 106.388
  },
  {
    name: '石蝴蝶',
    sciName: 'Primulina eburnea',
    cn: null,
    iucn: 'VU',
    habitat: '华南石灰岩山区',
    story: '叶片贴石而生 · 花如紫色蝴蝶。',
    peril: '仅生于特定石灰岩缝隙 · 栖息地一旦开发即消失。',
    reverence: '石缝中的小精灵 · 讲一方水土养一方花。',
    todayPlace: '广西桂林',
    todaySite: '广西桂林·乐满地喀斯特地貌',
    lat: 25.057, lon: 110.493
  },
  {
    name: '杓兰',
    sciName: 'Cypripedium spp.',
    cn: '二级',
    iucn: 'VU/EN',
    habitat: '东北、西南山地',
    story: '唇瓣呈兜状如勺 · 故名杓兰。花型奇特如陷阱。',
    peril: '因观赏价值被挖 · 繁殖又极慢。',
    reverence: '兰中独特者 · "勺兰" · 见之当如贵客。',
    todayPlace: '吉林长白山',
    todaySite: '吉林长白山·北坡林下',
    lat: 42.02, lon: 128.056
  },
  {
    name: '南方红豆杉',
    sciName: 'Taxus wallichiana var. mairei',
    cn: '一级',
    iucn: 'EN',
    habitat: '南方山林',
    story: '与红豆杉同属 · 生长慢 · 千年不倒。',
    peril: '同样因紫杉醇被盗伐严重。',
    reverence: '老杉不言 · 见证山河。',
    todayPlace: '江西井冈山',
    todaySite: '江西井冈山·红豆杉自然保护区',
    lat: 26.573, lon: 114.171
  },
  {
    name: '马褂木',
    sciName: 'Liriodendron chinense',
    cn: '二级',
    iucn: 'NT',
    habitat: '华中、华南山地',
    story: '叶形如古代马褂 · 第三纪孑遗。花黄绿色如郁金香。',
    peril: '野生分散 · 优良木材被砍。',
    reverence: '"中国郁金香" · 叶落满山如古人衣冠纷飞。',
    todayPlace: '浙江杭州',
    todaySite: '浙江杭州·西湖植物园',
    lat: 30.247, lon: 120.129
  },
  {
    name: '伯乐树',
    sciName: 'Bretschneidera sinensis',
    cn: '一级',
    iucn: 'EN',
    habitat: '南岭山脉',
    story: '花红色串状 · 5 月盛开如盏盏红灯。中国特有单种属。',
    peril: '生态位狭窄 · 结实率极低。',
    reverence: '"伯乐"取意识物者 · 能识得此花者 · 也是伯乐。',
    todayPlace: '广东南岭',
    todaySite: '广东南岭·伯乐树保护点',
    lat: 24.955, lon: 113.049
  },
  {
    name: '凤仙花·华南分布种',
    sciName: 'Impatiens chinensis',
    cn: null,
    iucn: 'NT',
    habitat: '华南',
    story: '一年生草本 · 花期长 · 色如朱砂。',
    peril: '湿地减少 · 野生种群压缩。',
    reverence: '"指甲花" · 古代女子捣汁染指 · 素色生活的浪漫。',
    todayPlace: '广东肇庆',
    todaySite: '广东肇庆·鼎湖山自然保护区',
    lat: 23.17, lon: 112.535
  },
  {
    name: '野生杜鹃（云锦杜鹃）',
    sciName: 'Rhododendron fortunei',
    cn: null,
    iucn: 'NT',
    habitat: '华南、华东山地',
    story: '高山大乔木杜鹃 · 春末花开如锦绣铺山。',
    peril: '古树被移栽贩卖 · 高山生境破坏。',
    reverence: '"云中火海" · 一山开花如一山起火。',
    todayPlace: '浙江宁波',
    todaySite: '浙江宁波·四明山杜鹃谷',
    lat: 29.753, lon: 121.054
  },
  {
    name: '金花茶',
    sciName: 'Camellia petelotii',
    cn: '二级',
    iucn: 'EN',
    habitat: '广西十万大山',
    story: '罕见的黄色山茶 · 被誉为"茶族皇后"。',
    peril: '分布极窄 · 过度采挖导致野生近乎消失。',
    reverence: '山茶多红 · 唯此独黄 · 中国特有珍品。',
    todayPlace: '广西防城港',
    todaySite: '广西防城港·十万大山金花茶园',
    lat: 21.88, lon: 108.105
  },
  {
    name: '香果树',
    sciName: 'Emmenopterys henryi',
    cn: '二级',
    iucn: 'NT',
    habitat: '华中山地',
    story: '花后萼片变白如花 · 犹如"重开一次花"。',
    peril: '优质木材遭伐 · 结实率低。',
    reverence: '"一树开两次花" · 古人以喻善意不止于一时。',
    todayPlace: '湖南张家界',
    todaySite: '湖南张家界·国家森林公园',
    lat: 29.326, lon: 110.441
  },
  {
    name: '巨魔芋',
    sciName: 'Amorphophallus titanum',
    cn: null,
    iucn: 'EN',
    habitat: '热带雨林（中国引入）',
    story: '世界最大花序 · 开花时散腐尸气味吸引昆虫。',
    peril: '野生种群极少 · 开花罕见。',
    reverence: '自然最极致的戏剧 · 丑美之间 · 生命之奇。',
    todayPlace: '云南西双版纳',
    todaySite: '云南西双版纳·热带植物园',
    lat: 21.916, lon: 101.271
  },
  {
    name: '望天树',
    sciName: 'Parashorea chinensis',
    cn: '一级',
    iucn: 'EN',
    habitat: '云南西双版纳、广西',
    story: '中国热带雨林中唯一超过 70 米的巨树。',
    peril: '原始雨林破坏 · 分布区极度狭窄。',
    reverence: '"雨林之神" · 站在其下如站在大教堂。',
    todayPlace: '云南西双版纳',
    todaySite: '云南西双版纳·望天树景区',
    lat: 21.616, lon: 101.571
  },
  {
    name: '普陀鹅耳枥',
    sciName: 'Carpinus putoensis',
    cn: '一级',
    iucn: 'CR',
    habitat: '浙江舟山普陀山',
    story: '1930 年在普陀山发现 · 全球野生仅存 1 株 · 为"地球独子"之一。',
    peril: '自然更新极困难 · 幼苗存活率极低 · 科研人员已人工繁育数千株。',
    reverence: '一个物种的命脉 · 寄托在这一棵老树上。',
    todayPlace: '浙江舟山',
    todaySite: '舟山·普陀山慧济寺',
    lat: 30.007, lon: 122.391
  },
  {
    name: '银杉',
    sciName: 'Cathaya argyrophylla',
    cn: '一级',
    iucn: 'VU',
    habitat: '广西花坪、湖南城步、贵州梵净山',
    story: '1955 年广西花坪首次发现 · 中国特有 · 第三纪孑遗植物 · 与大熊猫并称"植物界活化石"。',
    peril: '种子产量极低 · 天然更新几乎不可能 · 野外仅存数千株。',
    reverence: '叶背有银白色气孔带 · 故名"银杉"。',
    todayPlace: '广西桂林',
    todaySite: '广西花坪国家级自然保护区',
    lat: 25.609, lon: 109.896
  },
  {
    name: '百山祖冷杉',
    sciName: 'Abies beshanzuensis',
    cn: '一级',
    iucn: 'CR',
    habitat: '浙江百山祖',
    story: '1963 年在浙江百山祖发现 · 全球野生仅存 3 株成年植株 · 被列为"世界最濒危的 12 种植物之一"。',
    peril: '种子败育率极高 · 自然更新停滞数十年。',
    reverence: '人类若救不活这三棵树 · 这个物种就在地球上永远消失了。',
    todayPlace: '浙江丽水',
    todaySite: '百山祖国家公园',
    lat: 27.742, lon: 119.175
  },
  {
    name: '华盖木',
    sciName: 'Pachylarnax sinica',
    cn: '一级',
    iucn: 'CR',
    habitat: '云南西畴、文山',
    story: '1979 年才被正式发现命名 · 木兰科一新属 · 野生成年植株仅存 50 余株。',
    peril: '仅分布于云南东南部狭窄山脊 · 栖息地碎片化严重。',
    reverence: '树冠如华盖 · 开花时硕大如莲 · 森林之伞。',
    todayPlace: '云南文山',
    todaySite: '云南西畴·小桥沟自然保护区',
    lat: 23.456, lon: 104.702
  },
  {
    name: '天目铁木',
    sciName: 'Ostrya rehderiana',
    cn: '一级',
    iucn: 'CR',
    habitat: '浙江天目山',
    story: '1925 年在天目山发现 · 全球野生仅存 5 株 · 皆为千年老树。',
    peril: '五株皆雌雄异株 · 自然授粉极难 · 幼苗几乎零成活。',
    reverence: '苏轼当年游天目 · 它们已立于此 · 比苏轼还早数百年。',
    todayPlace: '浙江临安',
    todaySite: '天目山国家公园',
    lat: 30.337, lon: 119.441
  },
  {
    name: '元宝山冷杉',
    sciName: 'Abies yuanbaoshanensis',
    cn: '一级',
    iucn: 'CR',
    habitat: '广西融水元宝山',
    story: '1979 年在广西元宝山发现 · 仅存于该山顶一带 · 野生成年植株约 500 株。',
    peril: '分布区极狭窄 · 气候变暖可能使其无处可退。',
    reverence: '站立在华南最后的高寒之地。',
    todayPlace: '广西柳州',
    todaySite: '元宝山国家级自然保护区',
    lat: 25.450, lon: 108.866
  },
  {
    name: '崖柏',
    sciName: 'Thuja sutchuenensis',
    cn: '一级',
    iucn: 'CR',
    habitat: '重庆城口大巴山',
    story: '1892 年命名 · 1998 年重新发现（此前被 IUCN 宣告"野外灭绝"）。',
    peril: '多生于悬崖峭壁 · 种群极小 · 人为采挖压力大。',
    reverence: '"失而复得" · 它在悬崖上活了下来。',
    todayPlace: '重庆城口',
    todaySite: '大巴山国家级自然保护区',
    lat: 31.948, lon: 108.646
  },
  {
    name: '红皮糙果茶',
    sciName: 'Camellia crapnelliana',
    cn: '二级',
    iucn: 'VU',
    habitat: '华南（广东、广西、海南、福建）',
    story: '中国特有山茶 · 果壳红褐粗糙 · 花白心黄。',
    peril: '因果仁含油 · 长期被砍伐取油 · 野生种群日减。',
    reverence: '山间少见的"白山茶" · 不在园中争艳。',
    todayPlace: '广东清远',
    todaySite: '南岭国家森林公园',
    lat: 24.917, lon: 113.045
  },
  {
    name: '龙脑香',
    sciName: 'Dipterocarpus turbinatus',
    cn: '一级',
    iucn: 'EN',
    habitat: '云南西双版纳',
    story: '东南亚龙脑香科在中国的代表 · 高可达 40 米 · 树脂为古代珍贵香料"龙脑"。',
    peril: '热带雨林砍伐后无法自然恢复 · 种子寿命极短。',
    reverence: '古代丝路商人心中最珍贵的香。',
    todayPlace: '云南西双版纳',
    todaySite: '中国科学院西双版纳热带植物园',
    lat: 21.914, lon: 101.270
  },
  {
    name: '金花兰',
    sciName: 'Coelogyne aurea',
    cn: '二级',
    iucn: 'EN',
    habitat: '海南、广西石灰岩山区',
    story: '石斛科 · 花金黄带褐斑 · 生于石壁。',
    peril: '因花色鲜艳被大量采挖作观赏兰 · 野生濒临绝迹。',
    reverence: '石壁上的一把金色扇子 · 短暂而惊艳。',
    todayPlace: '海南三亚',
    todaySite: '吊罗山国家森林公园',
    lat: 18.667, lon: 109.876
  }
].filter(e => !e._skip);


export const PROTECTION_LEVEL_INFO = {
  '一级': {
    name: '国家一级重点保护',
    desc: '濒临灭绝的物种 · 全国性严格保护 · 禁止一切非法采集、买卖、运输。',
    color: '#a0301c'
  },
  '二级': {
    name: '国家二级重点保护',
    desc: '数量稀少的物种 · 需经省级林草部门批准方可采集利用。',
    color: '#c89a4a'
  }
};

export const IUCN_INFO = {
  'EX': { name: '灭绝', desc: '已无确定个体存活', color: '#6a6a6a' },
  'EW': { name: '野外灭绝', desc: '仅存于人工栽培', color: '#7a5a4a' },
  'CR': { name: '极危', desc: '野外生存概率极低', color: '#a0301c' },
  'EN': { name: '濒危', desc: '面临绝种高风险', color: '#c85a4a' },
  'VU': { name: '易危', desc: '面临中度灭绝风险', color: '#c89a4a' },
  'NT': { name: '近危', desc: '近期可能受威胁', color: '#a88a5a' }
};
