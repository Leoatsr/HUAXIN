// 花信风 · 花历徽章 定义
// 通过 checkins/favs 解锁

export const BADGES = [
  { id: 'explorer',   name: '探花者',    tier: 'gold',    cond: '打卡 15 处',    check: (ctx) => Object.keys(ctx.checkins).length >= 15 },
  { id: 'collector',  name: '采花令',    tier: 'silver',  cond: '采 15 种',      check: (ctx) => ctx.uniqueSpecies >= 15 },
  { id: 'hiker',      name: '踏青者',    tier: 'silver',  cond: '跨 6 区',       check: (ctx) => ctx.uniqueRegions >= 6 },
  { id: 'fourseason', name: '四季',      tier: 'bronze',  cond: '跨 3 季',       check: (ctx) => ctx.uniqueSeasons >= 3 },
  { id: 'ancient',    name: '古都寻花',  tier: 'gold',    cond: '访 3 古都',     check: (ctx) => ctx.ancientCities >= 3 },
  { id: 'south_north',name: '南北花使',  tier: 'silver',  cond: '南北跨区',      check: (ctx) => ctx.uniqueRegions >= 4 && ctx.hasNorth && ctx.hasSouth },
  { id: 'monthly',    name: '月月赏花',  tier: 'diamond', cond: '12 月不辍',     check: (ctx) => ctx.uniqueMonths >= 12 },
  { id: 'highland',   name: '高原花使',  tier: 'diamond', cond: '海拔 3000+',    check: (ctx) => ctx.highAltitude >= 1 },
  { id: 'peony_king', name: '花中帝王',  tier: 'gold',    cond: '赏牡丹',        check: (ctx) => ctx.speciesSet.has('牡丹') },
  { id: 'cherry',     name: '樱花使者',  tier: 'silver',  cond: '赏樱 3 处',     check: (ctx) => (ctx.speciesCount['樱花'] || 0) >= 3 },
  { id: 'plum',       name: '寻梅',      tier: 'bronze',  cond: '赏梅',          check: (ctx) => ctx.speciesSet.has('梅花') },
  { id: 'starter',    name: '花开初见',  tier: 'bronze',  cond: '初次打卡',      check: (ctx) => Object.keys(ctx.checkins).length >= 1 }
];

export const TIER_COLORS = {
  bronze:  'oklch(0.55 0.12 55)',
  silver:  'oklch(0.70 0.02 260)',
  gold:    'var(--jin)',
  diamond: 'oklch(0.65 0.08 200)'
};

// 古都名单（用于 古都寻花 徽章）
export const ANCIENT_CITIES = ['洛阳', '西安', '南京', '北京', '开封', '杭州', '安阳', '成都'];

// 根据 checkins + FLORA 计算徽章解锁上下文
export function buildBadgeContext(checkins, flora) {
  const ctx = {
    checkins,
    uniqueSpecies: 0,
    uniqueRegions: 0,
    uniqueSeasons: 0,
    uniqueMonths: 0,
    ancientCities: 0,
    highAltitude: 0,
    hasNorth: false,
    hasSouth: false,
    speciesSet: new Set(),
    speciesCount: {}
  };
  const regionSet = new Set();
  const seasonSet = new Set();
  const monthSet = new Set();
  const ancientSet = new Set();
  const NORTH = new Set(['东北', '华北', '西北']);
  const SOUTH = new Set(['华南', '西南', '华东', '华中']);
  // 海拔 3000+ 的景点 id（近似 · 林芝/西藏/青海/新疆高原）
  const HIGH_ALT_IDS = new Set([5, 6, 7, 22]);

  for (const id of Object.keys(checkins)) {
    const spot = flora.find(f => f.id === Number(id));
    if (!spot) continue;
    ctx.speciesSet.add(spot.sp);
    ctx.speciesCount[spot.sp] = (ctx.speciesCount[spot.sp] || 0) + 1;
    regionSet.add(spot.rg);
    seasonSet.add(spot.s);
    if (spot.pk) monthSet.add(spot.pk[0]);
    if (NORTH.has(spot.rg)) ctx.hasNorth = true;
    if (SOUTH.has(spot.rg)) ctx.hasSouth = true;
    for (const anc of ANCIENT_CITIES) {
      if (spot.n && spot.n.includes(anc)) { ancientSet.add(anc); break; }
    }
    if (HIGH_ALT_IDS.has(spot.id)) ctx.highAltitude++;
  }
  ctx.uniqueSpecies = ctx.speciesSet.size;
  ctx.uniqueRegions = regionSet.size;
  ctx.uniqueSeasons = seasonSet.size;
  ctx.uniqueMonths = monthSet.size;
  ctx.ancientCities = ancientSet.size;
  return ctx;
}
