/* ═══════════════════════════════════════════════════════════════
   dynasty-garden · 朝代花园场景数据
   ───────────────────────────────────────────────────────────────
   每位诗人选 3-4 个最具代表性的"场景"
   场景 = 一个可视化建筑/意象 + 一段故事
   
   空间布局（SVG viewBox 1200×780）：
     · 左半（0-540）是唐园 · 右半（660-1200）是北宋园
     · 中间 120px 是"留白"（300 年的静默）
     · y 轴用诗人出生年做粗排 · 但允许艺术调整
   ═══════════════════════════════════════════════════════════════ */

export const GARDEN_SCENES = [
  /* ═══ 李白 · 唐园 · 4 个场景 ═══ */
  {
    id: 'libai-1',
    poetId: 'libai',
    x: 120, y: 160,
    icon: '⛰',       // 山
    iconType: 'mountain',
    title: '敬亭山',
    subtitle: '李白 54 岁 · 宣城',
    year: 754,
    story: '离开长安已十年 · 七登敬亭山 · 写下"相看两不厌 · 只有敬亭山"。',
    poem: '众鸟高飞尽，孤云独去闲。相看两不厌，只有敬亭山。',
    mood: '山老人亦老 · 终于有个朋友不厌烦'
  },
  {
    id: 'libai-2',
    poetId: 'libai',
    x: 280, y: 260,
    icon: '🍶',
    iconType: 'wine',
    title: '沉香亭',
    subtitle: '李白 42 岁 · 长安',
    year: 742,
    story: '供奉翰林 · 一日玄宗与贵妃于沉香亭前赏牡丹 · 急召李白作词。',
    poem: '云想衣裳花想容，春风拂槛露华浓。',
    mood: '盛唐的巅峰 · 也是跌落的前夜'
  },
  {
    id: 'libai-3',
    poetId: 'libai',
    x: 420, y: 350,
    icon: '🏮',
    iconType: 'lantern',
    title: '梁园酒肆',
    subtitle: '李白 43 · 杜甫 33',
    year: 744,
    story: '一生中唯一与杜甫同游。他们喝酒 · 游山 · 然后再也没见过面。',
    poem: '飞蓬各自远，且尽手中杯。',
    mood: '一场注定短暂的相遇',
    special: 'meeting'  // 标记为两位诗人交集点
  },
  {
    id: 'libai-4',
    poetId: 'libai',
    x: 520, y: 440,
    icon: '⛵',
    iconType: 'boat',
    title: '白帝城',
    subtitle: '李白 59 岁 · 奉节',
    year: 759,
    story: '流放夜郎途中遇大赦 · "轻舟已过万重山"——一生最痛快的诗。同年杜甫 48 岁正在成都草堂。',
    poem: '朝辞白帝彩云间，千里江陵一日还。',
    mood: '绝处逢生的一刻'
  },

  /* ═══ 杜甫 · 唐园 · 4 个场景 ═══ */
  {
    id: 'dufu-1',
    poetId: 'dufu',
    x: 380, y: 500,
    icon: '🏛',
    iconType: 'pavilion',
    title: '曲江',
    subtitle: '杜甫 26 岁 · 长安',
    year: 737,
    story: '科举未第 · 在曲江见落花纷飞 · 写下"花飞减春"的少年愁思。',
    poem: '一片花飞减却春，风飘万点正愁人。',
    mood: '少年还不知道前方有多漂泊'
  },
  {
    id: 'dufu-2',
    poetId: 'dufu',
    x: 220, y: 560,
    icon: '🌱',
    iconType: 'grass',
    title: '成都草堂',
    subtitle: '杜甫 48 岁 · 安史之乱后',
    year: 759,
    story: '避乱入蜀 · 建草堂安顿下来。写下"黄四娘家花满蹊"——漂泊中难得明快的一年。',
    poem: '黄四娘家花满蹊，千朵万朵压枝低。',
    mood: '终于有一处可以写花的快乐'
  },
  {
    id: 'dufu-3',
    poetId: 'dufu',
    x: 340, y: 620,
    icon: '🍂',
    iconType: 'leaf',
    title: '夔州白帝',
    subtitle: '杜甫 56 岁 · 晚年',
    year: 767,
    story: '漂泊至夔州 · 病痛缠身 · 遥望长安故园不可得。菊蕊凄凉 · 孤舟一系。',
    poem: '丛菊两开他日泪，孤舟一系故园心。',
    mood: '晚年最沉郁的一笔'
  },
  {
    id: 'dufu-4',
    poetId: 'dufu',
    x: 490, y: 680,
    icon: '🌊',
    iconType: 'river',
    title: '湘江之上',
    subtitle: '杜甫 59 岁 · 最后的春天',
    year: 770,
    story: '舟行潭州 · 偶遇旧识李龟年 · 一生漂泊至此。同年冬卒于船上。',
    poem: '正是江南好风景，落花时节又逢君。',
    mood: '一生的最后一首花诗',
    special: 'end'  // 标记为人生终点
  },

  /* ═══ 白居易 · 唐园 · 4 个场景（整体靠下 · 晚出生半世纪）═══ */
  {
    id: 'baijuyi-1',
    poetId: 'baijuyi',
    x: 130, y: 440,
    icon: '🌸',
    iconType: 'peach',
    title: '庐山大林寺',
    subtitle: '白居易 45 岁 · 江州司马',
    year: 817,
    story: '贬江州期间游庐山 · 高山寺院桃花正盛。"春归无觅处 · 转入此中来"—— 失意中的小惊喜。',
    poem: '人间四月芳菲尽，山寺桃花始盛开。',
    mood: '贬谪生涯里的一朵意外'
  },
  {
    id: 'baijuyi-2',
    poetId: 'baijuyi',
    x: 60, y: 520,
    icon: '🎵',
    iconType: 'pipa',
    title: '浔阳江头',
    subtitle: '白居易 44 岁 · 江州',
    year: 816,
    story: '直谏被贬。浔阳江畔送客 · 闻琵琶女身世 · 写下《琵琶行》。"同是天涯沦落人"。',
    poem: '同是天涯沦落人，相逢何必曾相识。',
    mood: '开始写懂人间苦的诗'
  },
  {
    id: 'baijuyi-3',
    poetId: 'baijuyi',
    x: 210, y: 620,
    icon: '🏞',
    iconType: 'bridge',
    title: '杭州白堤',
    subtitle: '白居易 50 岁 · 刺史',
    year: 822,
    story: '任杭州刺史 · 浚西湖、筑堤（后称白堤）。"最爱湖东行沙堤"—— 他的杭州比苏轼早了 250 年。',
    poem: '乱花渐欲迷人眼，浅草才能没马蹄。',
    mood: '终于可以做点实在的事'
  },
  {
    id: 'baijuyi-4',
    poetId: 'baijuyi',
    x: 440, y: 560,
    icon: '🏡',
    iconType: 'house',
    title: '洛阳香山',
    subtitle: '白居易 60 岁 · 晚年',
    year: 832,
    story: '退居洛阳 · 自号"香山居士" · 与刘禹锡、元稹组"九老会"。',
    poem: '纱巾草履竹疏衣，晚下香山蹋翠微。',
    mood: '晚年最惬意的一段'
  },

  /* ═══ 苏轼 · 北宋园 · 4 个场景 ═══ */
  {
    id: 'sushi-1',
    poetId: 'sushi',
    x: 760, y: 240,
    icon: '🌊',
    iconType: 'lake',
    title: '杭州西湖',
    subtitle: '苏轼 37 岁 · 通判',
    year: 1073,
    story: '任杭州通判 · 初见西湖。"欲把西湖比西子"—— 从此西湖有了名字。',
    poem: '水光潋滟晴方好，山色空蒙雨亦奇。',
    mood: '初到此地就爱上了'
  },
  {
    id: 'sushi-2',
    poetId: 'sushi',
    x: 920, y: 360,
    icon: '🌸',
    iconType: 'crab-apple',  // 海棠
    title: '黄州东坡',
    subtitle: '苏轼 44 岁 · 第一次贬',
    year: 1080,
    story: '乌台诗案后贬黄州 · 躬耕东坡 · 自号"东坡居士"。深夜执烛看海棠 · 人生最低谷里的最柔情。',
    poem: '只恐夜深花睡去，故烧高烛照红妆。',
    mood: '人从谷底开出了花',
    special: 'turning'  // 人生转折
  },
  {
    id: 'sushi-3',
    poetId: 'sushi',
    x: 1040, y: 480,
    icon: '🥭',
    iconType: 'lychee',
    title: '惠州荔枝园',
    subtitle: '苏轼 58 岁 · 再贬',
    year: 1094,
    story: '再贬惠州（岭南瘴疠地）· 年近六十。别人视之为惩罚 · 他却爱上了荔枝。',
    poem: '日啖荔枝三百颗，不辞长作岭南人。',
    mood: '越贬越南 · 越写越豁达'
  },
  {
    id: 'sushi-4',
    poetId: 'sushi',
    x: 900, y: 600,
    icon: '🌴',
    iconType: 'tropical',
    title: '儋州东坡书院',
    subtitle: '苏轼 61 岁 · 最远之贬',
    year: 1097,
    story: '三贬海南（当时视为绝地）· 与黎族邻居往来。北归前四年 · 写下"问汝平生功业 · 黄州惠州儋州"。',
    poem: '半醒半醉问诸黎，竹刺藤梢步步迷。',
    mood: '他把三次贬谪写成了一生的功业',
    special: 'end'
  }
];

/* ═══════════════════════════════════════════════════════════════
   诗人之间的真实关系路径（重构 · 诗意版）
   每条路径有：
     from/to 场景 id
     type    关系类型
     story   一句话描述这段关系
   ═══════════════════════════════════════════════════════════════ */
export const GARDEN_PATHS = [
  {
    from: 'libai-3', to: 'dufu-1',  // 李白梁园 ← 杜甫曲江
    type: 'meeting',
    label: '744 相遇',
    story: '李白 43 遇杜甫 33 · 梁园同游',
    particles: true  // 朱砂小点流动
  },
  {
    from: 'dufu-2', to: 'libai-4',  // 杜甫草堂 ↔ 李白白帝
    type: 'parallel',
    label: '同一年的两处',
    story: '759 · 杜甫在成都草堂安顿 · 李白遇赦出白帝',
    particles: false,
    dashed: true
  },
  {
    from: 'baijuyi-2', to: 'baijuyi-1',  // 白居易浔阳 → 庐山
    type: 'self',
    label: '贬谪的同一年',
    story: '白居易被贬江州时 · 游庐山写下桃花',
    particles: false,
    dashed: true
  },
  {
    from: 'sushi-2', to: 'dufu-3',  // 苏轼黄州 ← 追慕杜甫夔州
    type: 'admiration',
    label: '跨越三百年的追慕',
    story: '苏轼一生推尊杜甫为"诗圣" · 两人都在最深的漂泊里写出花',
    particles: true,
    long: true  // 跨越留白
  }
];

/* ═══ 图标类型 · SVG 简笔画 ═══ */
export const SCENE_ICONS = {
  mountain:   { emoji: '⛰', svg: 'mountain' },
  wine:       { emoji: '🍶', svg: 'wine' },
  lantern:    { emoji: '🏮', svg: 'lantern' },
  boat:       { emoji: '⛵', svg: 'boat' },
  pavilion:   { emoji: '🏛', svg: 'pavilion' },
  grass:      { emoji: '🌱', svg: 'grass' },
  leaf:       { emoji: '🍂', svg: 'leaf' },
  river:      { emoji: '🌊', svg: 'river' },
  peach:      { emoji: '🌸', svg: 'flower' },
  pipa:       { emoji: '🎵', svg: 'pipa' },
  bridge:     { emoji: '🏞', svg: 'bridge' },
  house:      { emoji: '🏡', svg: 'house' },
  lake:       { emoji: '🌊', svg: 'lake' },
  'crab-apple': { emoji: '🌸', svg: 'flower' },
  lychee:     { emoji: '🍊', svg: 'fruit' },
  tropical:   { emoji: '🌴', svg: 'palm' }
};
