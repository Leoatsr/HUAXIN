/* 花种 → Unsplash/Flickr 搜索关键词
   72 种花全覆盖 · 每个都选了高搜索命中率的英文关键词 */
export const FLORA_KEYWORDS = {
  '牡丹':      'peony,chinese-peony,luoyang',
  '杜鹃花':    'azalea,rhododendron',
  '野杏花':    'apricot-blossom,xinjiang',
  '郁金香':    'tulip,tulip-field',
  '桃花':      'peach-blossom,pink-flower',
  '高山杜鹃':  'alpine-rhododendron,mountain-flower',
  '蓝花楹':    'jacaranda,purple-tree',
  '梨花':      'pear-blossom,white-flower',
  '芍药':      'chinese-peony,paeonia',
  '云锦杜鹃':  'rhododendron,red-azalea',
  '樱花':      'cherry-blossom,sakura',
  '梅花':      'plum-blossom,winter-flower',
  '油菜花':    'rapeseed,canola-field,yellow-flower',
  '薰衣草':    'lavender,lavender-field,provence',
  '荷花':      'lotus,water-lily,pond',
  '野花草甸':  'wildflower-meadow,grassland',
  '格桑花':    'cosmos-flower,tibetan-wildflower',
  '银杏':      'ginkgo,yellow-autumn-leaves',
  '胡杨':      'populus-euphratica,desert-tree',
  '彩林':      'autumn-forest,colorful-leaves',
  '白桦林':    'birch-forest,autumn',
  '黄栌':      'cotinus,autumn-red-leaves',
  '红枫':      'red-maple,japanese-maple,autumn',
  '雾凇':      'frost,rime-ice,winter',
  '冬樱花':    'winter-cherry-blossom',
  '丁香花':    'lilac,purple-flower',
  '三角梅':    'bougainvillea,pink-flower',
  '桂花':      'osmanthus,sweet-olive',
  '苹果梨花':  'pear-blossom,orchard',
  '凤凰花':    'royal-poinciana,flame-tree',
  '紫荆花':    'bauhinia,hong-kong-flower',
  '菊花':      'chrysanthemum,autumn-flower',
  '朱槿':      'hibiscus,red-flower',
  '杏花':      'apricot-blossom',
  '紫菜花':    'purple-rape,canola',
  '竹林':      'bamboo-forest,green',
  '兰花':      'orchid,cymbidium',
  '山茶花':    'camellia,japanese-camellia',
  '蜡梅':      'wintersweet,chimonanthus',
  '茶花':      'camellia',
  '辛夷花':    'magnolia-liliiflora',
  '沙漠花':    'desert-flower,cactus-bloom',
  '向日葵':    'sunflower,field',
  '紫藤':      'wisteria,purple-vine',
  '木棉花':    'kapok-tree,red-cotton',
  '玉兰花':    'magnolia,white-magnolia',
  '月季':      'rose,chinese-rose',
  '海棠花':    'crabapple-blossom,malus',
  '水仙花':    'narcissus,daffodil',
  '芦花':      'reed,reed-field,autumn',
  '紫云英':    'milk-vetch,purple-field',
  '绣球花':    'hydrangea,blue-flower',
  '睡莲':      'water-lily,pond',
  '紫薇花':    'crape-myrtle,lagerstroemia',
  '合欢花':    'silk-tree,albizia',
  '栀子花':    'gardenia,white-flower',
  '茉莉花':    'jasmine,white-flower',
  '玫瑰':      'rose,garden-rose',
  '芙蓉花':    'hibiscus,cotton-rose',
  '虞美人':    'poppy,field-poppy,red',
  '波斯菊':    'cosmos,pink-flower',
  '鸡蛋花':    'plumeria,frangipani',
  '凌霄花':    'trumpet-vine,orange-flower',
  '木槿花':    'hibiscus-syriacus,rose-of-sharon',
  '石榴花':    'pomegranate-flower,red',
  '蔷薇':      'rose,rambler-rose',
  '百合':      'lily,white-lily',
  '迎春花':    'winter-jasmine,yellow',
  '金针花':    'daylily,orange-flower',
  '蝴蝶兰':    'moth-orchid,phalaenopsis',
  '椰树':      'coconut-tree,tropical',
  '牵牛花':    'morning-glory,blue-purple'
};

/* 根据花种获取 LoremFlickr URL · 无需 API key 无需配置 */
export function getFlickrUrl(species, idx = 0, w = 800, h = 600) {
  const kw = FLORA_KEYWORDS[species] || 'flower,chinese-garden';
  // lock 参数让同一花种同一索引的图稳定不变
  const lock = hashStr(species) + idx * 7;
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${lock}`;
}

/* Picsum · 稳定兜底图源（不支持主题，但可用 seed 保证同景点同图）
   当 LoremFlickr 失败时作为最后的视觉救场 */
export function getPicsumUrl(species, idx = 0, w = 800, h = 600) {
  const seed = `${species}-${idx}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
