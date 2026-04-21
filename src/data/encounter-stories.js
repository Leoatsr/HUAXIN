/* ═══════════════════════════════════════════════════════════════
   encounter-stories · 精准相遇的历史场景库
   ───────────────────────────────────────────────────────────────
   按相遇的关键词（两位诗人+年份 ±）匹配
   包含：
     · 意象背景画（使用 Wikimedia Commons 公有领域画作）
     · 历史场景叙述
     · 各自的代表诗句
     · 后续轨迹（他们之后的命运）
   ═══════════════════════════════════════════════════════════════ */

export const ENCOUNTER_STORIES = {
  // 李白 × 杜甫 · 744 梁园
  'libai-dufu-744': {
    title: '梁园把酒 · 千古一遇',
    year: 744,
    place: '洛阳 → 梁宋（今河南开封商丘一带）',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/%E6%9D%8E%E7%99%BD%E6%9D%9C%E7%94%AB%E9%AB%98%E9%80%82%E9%87%91%E9%99%B5%E9%85%92%E8%82%86.jpg/800px-%E6%9D%8E%E7%99%BD%E6%9D%9C%E7%94%AB%E9%AB%98%E9%80%82%E9%87%91%E9%99%B5%E9%85%92%E8%82%86.jpg',
    imageAlt: '李白杜甫高适金陵酒肆·清·作者不详',
    imageCaption: '后世想象 · 李白杜甫高适游梁宋',
    setup: '这一年 · 43 岁的李白刚被"赐金放还"离开长安 · 33 岁的杜甫还是困居洛阳的无名诗人。他们在洛阳初相识 · 一见如故。',
    scene: '他们和高适一起 · 穿过汴水 · 游梁宋（今河南开封、商丘一带）。登台怀古 · 饮酒赋诗。秋色已深 · 落叶满台 · 梁园是汉代梁孝王旧地 · 正应慨古伤今。',
    linesA: '醉眠秋共被，携手日同行。',
    linesB: '痛饮狂歌空度日，飞扬跋扈为谁雄。',
    aftermath: '第二年秋 · 两人在鲁郡东石门分别。此后 26 年 · 再未相见。杜甫一生为李白写了约 15 首诗。李白 762 年卒于当涂 · 杜甫 770 年卒于湘江舟中。',
    impact: '中国文学史上 · 最珍贵的两人**从未重聚**。'
  },

  // 李白 × 杜甫 · 745 鲁郡
  'libai-dufu-745': {
    title: '鲁郡东石门 · 此别终生',
    year: 745,
    place: '鲁郡（今山东曲阜）',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Li_Bai_Strolling.jpg/480px-Li_Bai_Strolling.jpg',
    imageAlt: '李白行吟图·南宋·梁楷',
    imageCaption: '梁楷《李白行吟图》· 约 13 世纪',
    setup: '744 年的相聚后 · 他们约在鲁郡再见。杜甫准备往长安谋仕 · 李白已是自由漫游的中年诗人。',
    scene: '秋波落泗水 · 海色明徂徕。两人喝酒到夜 · 互赠一首诗为别。没有人知道这是最后一次。',
    linesA: '飞蓬各自远，且尽手中杯。',
    linesB: '何时石门路，重有金樽开。',
    aftermath: '李白此后漫游江东 · 杜甫入长安困顿十年。安史之乱后 · 李白流放夜郎 · 杜甫入蜀避乱。两人的人生从此分向两极。',
    impact: '杜甫晚年梦见李白数次 · "三夜频梦君 · 情亲见君意"。'
  },

  // 默认 · 未匹配到具体故事时
  '_default': {
    title: null,  // 用 encounter.title
    image: null,
    scene: null
  }
};

/**
 * 匹配故事 · 按两位诗人 id + 年份
 */
export function matchStory(encounter) {
  if (!encounter || encounter.type !== 'precise') return null;
  const { a, b, year } = encounter;
  // 排序两个诗人 id · 保证查 key 稳定
  const ids = [a.poetId, b.poetId].sort();
  const key = `${ids[0]}-${ids[1]}-${year}`;
  if (ENCOUNTER_STORIES[key]) return ENCOUNTER_STORIES[key];
  // 容错：±1 年
  for (let d = 1; d <= 2; d++) {
    if (ENCOUNTER_STORIES[`${ids[0]}-${ids[1]}-${year + d}`]) {
      return ENCOUNTER_STORIES[`${ids[0]}-${ids[1]}-${year + d}`];
    }
    if (ENCOUNTER_STORIES[`${ids[0]}-${ids[1]}-${year - d}`]) {
      return ENCOUNTER_STORIES[`${ids[0]}-${ids[1]}-${year - d}`];
    }
  }
  return null;
}
