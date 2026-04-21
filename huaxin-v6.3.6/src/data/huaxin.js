// 花信风 · 二十四番花信风数据
// 从 小寒 到 谷雨，共 8 节气 × 3 候 = 24 候
// 每候对应一种花信（花事风物）

export const HUAXIN_24 = [
  { jq: '小寒', jp: 'XIAO HAN', date: '01.05', f: ['梅花', '山茶', '水仙'] },
  { jq: '大寒', jp: 'DA HAN',   date: '01.20', f: ['瑞香', '兰花', '山矾'] },
  { jq: '立春', jp: 'LI CHUN',  date: '02.04', f: ['迎春', '樱桃', '望春'] },
  { jq: '雨水', jp: 'YU SHUI',  date: '02.19', f: ['菜花', '杏花', '李花'] },
  { jq: '惊蛰', jp: 'JING ZHE', date: '03.05', f: ['桃花', '棠棣', '蔷薇'] },
  { jq: '春分', jp: 'CHUN FEN', date: '03.20', f: ['海棠', '梨花', '木兰'] },
  { jq: '清明', jp: 'QING MING',date: '04.05', f: ['桐花', '麦花', '柳花'] },
  { jq: '谷雨', jp: 'GU YU',    date: '04.20', f: ['牡丹', '荼蘼', '楝花'] }
];

// 每候的诗词与花语（用于当前花信展示）
export const HUAXIN_POEMS = {
  '梅花':   { poem: '遥知不是雪，为有暗香来', author: '王安石《梅花》', lang: '凌寒独放' },
  '山茶':   { poem: '似共梅花争粉香，天心预报蜡梅妆', author: '杨万里', lang: '谦逊理想' },
  '水仙':   { poem: '借水开花自一奇，水沉为骨玉为肌', author: '杨万里《水仙花》', lang: '清白高洁' },
  '瑞香':   { poem: '雪里开花到春晚，蜜蜂那得一枝来', author: '范成大', lang: '吉祥喜庆' },
  '兰花':   { poem: '兰生幽谷无人识，客种东轩遗我香', author: '苏辙', lang: '高洁幽雅' },
  '山矾':   { poem: '江梅摇落无颜色，山矾丛开正可怜', author: '黄庭坚', lang: '素净' },
  '迎春':   { poem: '百花未发已争先，领袖春光独占妍', author: '韩琦', lang: '报春使者' },
  '樱桃':   { poem: '红颗累累樱桃熟', author: '宋诗', lang: '少女情怀' },
  '望春':   { poem: '望春应有日，只被雪遮遮', author: '古诗', lang: '思春之情' },
  '菜花':   { poem: '儿童急走追黄蝶，飞入菜花无处寻', author: '杨万里', lang: '田园之乐' },
  '杏花':   { poem: '沾衣欲湿杏花雨，吹面不寒杨柳风', author: '志南和尚', lang: '少女情怀' },
  '李花':   { poem: '桃花嫣然出篱笑，似开未开最有情', author: '苏轼', lang: '纯洁' },
  '桃花':   { poem: '竹外桃花三两枝，春江水暖鸭先知', author: '苏轼', lang: '爱情' },
  '棠棣':   { poem: '棠棣之华，鄂不韡韡', author: '诗经', lang: '兄弟情谊' },
  '蔷薇':   { poem: '花心愁欲断，春色岂知心', author: '李世民', lang: '爱情的思念' },
  '海棠':   { poem: '只恐夜深花睡去，故烧高烛照红妆', author: '苏轼《海棠》', lang: '美人' },
  '梨花':   { poem: '梨花淡白柳深青，柳絮飞时花满城', author: '苏轼', lang: '纯真' },
  '木兰':   { poem: '叶似桃花有子身，带烟含雨大如船', author: '古诗', lang: '高洁' },
  '桐花':   { poem: '桐花万里丹山路，雏凤清于老凤声', author: '李商隐', lang: '情窦初开' },
  '麦花':   { poem: '麦花雪白菜花稀', author: '范成大', lang: '朴素' },
  '柳花':   { poem: '柳花着地无人惜', author: '温庭筠', lang: '离别' },
  '牡丹':   { poem: '唯有牡丹真国色，花开时节动京城', author: '刘禹锡《赏牡丹》', lang: '富贵' },
  '荼蘼':   { poem: '开到荼蘼花事了，丝丝天棘出莓墙', author: '王淇《春暮游小园》', lang: '末路之美' },
  '楝花':   { poem: '楝花开后风光好', author: '古诗', lang: '春尽' }
};

// 花信 → 花种匹配（用于从 FLORA 筛选对应景点）
export const HUAXIN_TO_FLORA_SP = {
  '梅花': ['梅花','蜡梅'],
  '桃花': ['桃花'],
  '樱桃': ['樱花','冬樱花'],
  '杏花': ['杏花','野杏花'],
  '李花': ['梨花'],
  '海棠': ['海棠花'],
  '梨花': ['梨花'],
  '木兰': ['玉兰花','木兰','辛夷花'],
  '牡丹': ['牡丹'],
  '荼蘼': ['荼蘼'],
  '蔷薇': ['蔷薇','月季','玫瑰'],
  '迎春': ['迎春花'],
  '兰花': ['兰花','蝴蝶兰'],
  '山茶': ['山茶花','茶花'],
  '菜花': ['油菜花','紫菜花'],
  '水仙': ['水仙花']
};

// 根据当前日期计算应处于第几候
export function currentHouIndex() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const jiePoints = [
    [1,5], [1,20], [2,4], [2,19], [3,5], [3,20], [4,5], [4,20]
  ];
  // 找到当前日期落在哪个节气之后
  let jqIdx = -1;
  for (let i = 0; i < jiePoints.length; i++) {
    const [m, d] = jiePoints[i];
    if (month > m || (month === m && day >= d)) jqIdx = i;
  }
  if (jqIdx < 0) return { jq: -1, hou: -1, totalIdx: -1 }; // 春信未至

  // 计算在该节气内第几候 (0/1/2) — 每候约 5 天
  const startM = jiePoints[jqIdx][0], startD = jiePoints[jqIdx][1];
  const startDoy = (startM - 1) * 30.44 + startD;
  const nowDoy = (month - 1) * 30.44 + day;
  const diff = nowDoy - startDoy;
  const hou = Math.min(2, Math.max(0, Math.floor(diff / 5)));
  return { jq: jqIdx, hou, totalIdx: jqIdx * 3 + hou };
}
