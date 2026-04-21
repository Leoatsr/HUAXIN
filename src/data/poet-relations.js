/* ═══════════════════════════════════════════════════════════════
   poet-relations · 诗人之间的真实历史关系
   ───────────────────────────────────────────────────────────────
   关系类型：
     friendship   挚友
     admiration   追慕崇拜（晚辈对前辈）
     meeting      有交集 / 同游
     influence    文学影响（无生平交集）
     reunion      晚年唱和
   
   原则：所有关系均**有史料依据** · 不编造私交。
   参考：
     · 李白杜甫同游：《鲁郡东石门送杜二甫》等诗互证
     · 白居易元稹：《白氏长庆集》大量唱和
     · 苏轼推崇杜甫：苏轼《王定国诗集叙》等
   ═══════════════════════════════════════════════════════════════ */

export const POET_RELATIONS = [
  {
    from: 'dufu',
    to: 'libai',
    type: 'admiration',
    label: '崇拜追慕',
    years: '744-770',
    detail: '744 年 33 岁的杜甫在洛阳初见 43 岁的李白 · 同游梁宋、齐鲁。终生追慕 · 写过约 15 首赠怀李白的诗（《赠李白》《春日忆李白》《梦李白二首》等）· 李白仅回赠数首。',
    evidence: '《杜工部集》'
  },
  {
    from: 'libai',
    to: 'dufu',
    type: 'meeting',
    label: '744-745 同游',
    years: '744-745',
    detail: '两位诗人在人生中仅有两年短暂交集 · 之后终生未再相见。李白赠杜甫诗不多（《鲁郡东石门送杜二甫》《沙丘城下寄杜甫》）。',
    evidence: '《李太白集》'
  },
  {
    from: 'baijuyi',
    to: 'yuanzhen',
    type: 'friendship',
    label: '终生挚友',
    years: '803-831',
    detail: '白居易与元稹 · 年齿相若 · 同登科第 · 同为新乐府运动核心。一生唱和 · 相互贬谪时仍书信不断。元稹 831 年先卒 · 白居易写《祭元微之文》悼念。',
    evidence: '《白氏长庆集》《元氏长庆集》大量唱和诗'
  },
  {
    from: 'baijuyi',
    to: 'liuyuxi',
    type: 'reunion',
    label: '晚年洛阳唱和',
    years: '826-842',
    detail: '白居易与刘禹锡"刘白"齐名。晚年同在洛阳 · 组"九老会" · 唱和频繁。刘禹锡 842 年卒 · 白居易哭之："四海齐名白与刘"。',
    evidence: '《刘白唱和集》'
  },
  {
    from: 'sushi',
    to: 'dufu',
    type: 'admiration',
    label: '推尊为诗圣',
    years: '1037-1101',
    detail: '苏轼毕生推尊杜甫 · 称"古今诗人众矣 · 而杜子美为首"（《王定国诗集叙》）。苏轼的儒家情怀 · 很大程度得自杜甫影响。',
    evidence: '《东坡志林》《苏轼文集》'
  },
  {
    from: 'sushi',
    to: 'libai',
    type: 'influence',
    label: '诗风承袭',
    years: '1037-1101',
    detail: '苏轼评李白："李太白 · 狂士也。"豪放派词风继承李白气象 · 但儒家底色更近杜甫。苏轼多次写诗涉及李白旧游之地。',
    evidence: '《东坡题跋》'
  },
  {
    from: 'sushi',
    to: 'baijuyi',
    type: 'admiration',
    label: '自比乐天',
    years: '1094-1101',
    detail: '苏轼晚年贬惠州、儋州 · 常以白居易自况（白居易晚年也经贬谪）。苏轼有"出处依稀似乐天"之句。',
    evidence: '《苏轼诗集》'
  }
];

/* ═══ 关系类型视觉属性 ═══ */
export const RELATION_STYLES = {
  friendship:  { color: '#c23820', dash: '0',     label: '挚友',       weight: 3 },
  admiration:  { color: '#c89a4a', dash: '4 3',   label: '追慕崇拜',   weight: 2 },
  meeting:     { color: '#5a7a9a', dash: '0',     label: '同游交集',   weight: 2 },
  influence:   { color: '#8a7560', dash: '2 3',   label: '文学影响',   weight: 1 },
  reunion:     { color: '#3a7a5a', dash: '0',     label: '晚年唱和',   weight: 2 }
};
