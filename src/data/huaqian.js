// 花信风 · 花签 数据
// 上上 / 上 / 中上 / 中 / 中下 / 下 / 下下
// 每支签对应一首诗、一种花、一则解签词

export const HUAQIAN = [
  {
    id: 22, tier: '上上', name: '海棠春睡',
    poem: '只恐夜深花睡去\n故烧高烛照红妆',
    author: '苏轼《海棠》',
    desc: '春事正浓，所谋之事如海棠初绽，虽未大放，然生机勃发。宜静待，忌燥进。',
    yi: ['赏海棠','访友','题诗','品茗'],
    ji: ['争执','夜行','决断'],
    sp: '海棠花'
  },
  {
    id: 1, tier: '上上', name: '国色天香',
    poem: '唯有牡丹真国色\n花开时节动京城',
    author: '刘禹锡《赏牡丹》',
    desc: '时运亨通，如洛阳牡丹盛放于谷雨，得天时地利。宜当机立断，忌犹豫不决。',
    yi: ['求财','上任','远行','结亲'],
    ji: ['迁延','自怨'],
    sp: '牡丹'
  },
  {
    id: 3, tier: '上', name: '暗香浮动',
    poem: '疏影横斜水清浅\n暗香浮动月黄昏',
    author: '林逋《山园小梅》',
    desc: '君子自有德风，不必扬名。内敛修为，自有花香引人寻。宜读书，忌张扬。',
    yi: ['读书','修心','访故'],
    ji: ['争名','夸耀'],
    sp: '梅花'
  },
  {
    id: 5, tier: '上', name: '桃花灼灼',
    poem: '桃之夭夭，灼灼其华\n之子于归，宜其室家',
    author: '《诗经·桃夭》',
    desc: '喜事将至，姻缘正盛。如桃花开时，笑迎春风。宜表白，忌犹疑。',
    yi: ['婚嫁','表白','聚会'],
    ji: ['独行','封闭'],
    sp: '桃花'
  },
  {
    id: 8, tier: '中上', name: '杏花春雨',
    poem: '小楼一夜听春雨\n深巷明朝卖杏花',
    author: '陆游《临安春雨初霁》',
    desc: '细雨润物，事在细处。不急一时，慢慢来方稳妥。宜闲庭信步，忌急于求成。',
    yi: ['闲游','慢事','抒怀'],
    ji: ['速战','攀比'],
    sp: '杏花'
  },
  {
    id: 12, tier: '中', name: '梨花带雨',
    poem: '梨花一枝春带雨\n白居易《长恨歌》',
    author: '白居易《长恨歌》',
    desc: '情思绵绵，虽美却带忧色。宜细细品味，勿过度执着。宜抒情，忌沉溺。',
    yi: ['抒情','写作','独酌'],
    ji: ['纠缠','痴执'],
    sp: '梨花'
  },
  {
    id: 15, tier: '中', name: '兰生幽谷',
    poem: '兰生幽谷无人识\n客种东轩遗我香',
    author: '苏辙',
    desc: '才华在身，时机未至。静待伯乐，勿自轻。宜潜修，忌急于求显。',
    yi: ['修业','独善','远游'],
    ji: ['揠苗','躁进'],
    sp: '兰花'
  },
  {
    id: 20, tier: '中下', name: '荼蘼花事',
    poem: '开到荼蘼花事了\n丝丝天棘出莓墙',
    author: '王淇《春暮游小园》',
    desc: '一事将尽，宜收尾。所谋之事近尾声，得失之间，当知取舍。宜总结，忌恋战。',
    yi: ['结账','告别','休整'],
    ji: ['新启','重开'],
    sp: '荼蘼'
  },
  {
    id: 23, tier: '下', name: '落花无言',
    poem: '落花人独立\n微雨燕双飞',
    author: '晏几道',
    desc: '孤独感袭来，外界喧嚣与己无关。静心自处，方能见真我。宜独处，忌攀援。',
    yi: ['独处','反省','节制'],
    ji: ['社交','冲动'],
    sp: '梨花'
  },
  {
    id: 24, tier: '下下', name: '风雨落红',
    poem: '感时花溅泪\n恨别鸟惊心',
    author: '杜甫《春望》',
    desc: '时运不济，外侵内扰。韬光养晦，耐心等待转机。宜低调，忌出头。',
    yi: ['守静','自保','休养'],
    ji: ['决裂','冒进'],
    sp: '杜鹃花'
  }
];

// 随机抽一支（按 tier 权重：上上1/上2/中上2/中2/中下1/下1/下下1）
export function drawHuaqian() {
  const weights = { '上上': 15, '上': 25, '中上': 20, '中': 20, '中下': 10, '下': 7, '下下': 3 };
  const rnd = Math.random() * 100;
  let acc = 0;
  let targetTier = '中';
  for (const [tier, w] of Object.entries(weights)) {
    acc += w;
    if (rnd <= acc) { targetTier = tier; break; }
  }
  const pool = HUAQIAN.filter(q => q.tier === targetTier);
  return pool[Math.floor(Math.random() * pool.length)] || HUAQIAN[0];
}

// 今日的签 - 按日期种子抽，保证一天一样
export function todaysHuaqian() {
  const now = new Date();
  const seed = now.getFullYear() * 1000 + now.getMonth() * 50 + now.getDate();
  return HUAQIAN[seed % HUAQIAN.length];
}
