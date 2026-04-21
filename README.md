# 花信风 · HuaXinFeng

> 千里山河 · 一纸花信 · 一生诗踪

一款关于中国花事、节气与诗人的桌面 Web 应用。在真实中国地图上展开 404 个赏花景点 · 89 种花卉百科 · 24 番花信 · 30 位唐宋诗人的 236 个生命足迹点 · 以及穿越千年的诗人相遇。

**Live**: [shihua.vercel.app](https://shihua.vercel.app)

---

## ✨ 核心特性

| 维度 | 数量 |
|---|---|
| 🌸 赏花景点 | **404** 个 · 含 11 个台湾景点 |
| 🌿 花卉百科 | **89** 种 · 原产/故事/养护/诗词 |
| 🔴 濒危植物 | **29** 种 · 国家级保护 · 带坐标 |
| 📅 二十四番花信 | **24** 番 · 每番一花一诗 |
| 📜 唐宋诗人 | **30** 位 · 初唐 5 / 盛唐 8 / 中唐 10 / 晚唐 6 / 宋 1 |
| 📍 诗人足迹站 | **236** 站 · 每站诗一首 + 今日可造访 |
| 🌏 语言 | **8** 种 · 中/英/日/韩/法/西/德/俄 |

---

## 🗺️ 三大地图视图

### 1. 花事地图 · 当下的花
真实中国地图 · 404 个景点 · 按花种筛选 · 点击花朵进景点详情 · 真实 GDD 天气 API · 真实鸟鸣 API（Xeno-canto）· 8 大区划 · 花期状态色标 · 出行工具集成（小红书/天气/携程/大众点评 · 国内外差异提示）。

### 2. 诗踪 · 一位诗人的一生
选择一位诗人（30 位可选 · 按朝代分组）· 其一生的足迹按年代在地图上连线 · 每一站显示当年所作之诗 · 点击花朵读诗与心境 · 关联今日可访问的真实景点。

### 3. 朝代花园 · 千年交织
30 位诗人 273 年时间线 · 群像模式显示多位诗人的行动轨迹 · 相遇点自动检测（精准同年同地 / 宽松十年内五百公里）· **相遇圈聚类**（地图上 30px 内自动合并）· **浮卡片交互**（点圈→地图上弹卡 → 点卡 → 右栏读详情）· 10 个预设诗人圈：
- 李 杜 · 小 李 杜 · 元 白 · 刘 白
- 盛唐三巨头 · 山水田园 · 边塞三家 · 梁园三子
- 韩孟诗派 · 初唐四杰

### 统一地图容器（v6.2）
三个视图共用同一个 `MapCanvas` 组件 —— 同样的纸张纹理 · 同样的边框阴影 · 同样的缩放控件（+/−/重置）· 同样的投影系统。视觉与交互完全一致。

---

## 🪶 亮点诗人完整编年

- **李白** 13 站：江油→荆门→扬州→安陆→长安→梁宋→秋浦→宣城→白帝→当涂
- **杜甫** 13 站：吴越→泰山→长安→梁宋→华州→秦州→成都→夔州→岳阳→耒阳
- **王维** 10 站：华山→长安→济州→嵩山→凉州→渭城→辋川→长安→辋川
- **孟浩然** 10 站：望楚山→鹿门→扬州→长安→洞庭→若耶→建德→过故人庄→春晓→岘山
- **白居易** 10 站
- **苏轼** 7 站

每站包含：创作年份 + 诗人年龄 + 古地名 · 今日对应位置 + 今日可造访景点 · 代表诗 + 花/植物意象 + 季节 · 背景故事（贬谪原因 / 心境 / 相遇）· 考证确定度 · 今日状态。

---

## 🔴 濒危植物 · 29 种

国家一级/二级重点保护野生植物 · IUCN 等级标注。包含：

- 水杉 · 银杏 · 珙桐 · 红豆杉 · 独蒜兰 · 大花黄牡丹 · 雪莲 · 兜兰
- **普陀鹅耳枥**（全球仅 1 株野生 · 舟山）
- **百山祖冷杉**（全球仅 3 株成年 · 浙江）
- **天目铁木**（全球仅 5 株 · 浙江）
- **华盖木**（仅 50 余株 · 云南）
- **崖柏**（1998 年"失而复得" · 重庆）
- **银杉**（植物界活化石 · 广西花坪）· 等

每种带：学名 · 保护级别 · IUCN 等级 · 原生分布 · 故事背景 · 濒危原因 · 敬畏话语 · 今日可造访的保护区坐标。

---

## 🎨 设计美学

- **水墨真实地图**：D3 球面投影 · 真实中国经纬度 · 水墨纸张纹理 · 淡墨边界
- **Claude Design 落地页**：Hero 千里江山意境 · 24 番 × 3 候 grid · 竹筒摇签真动画 · 12 花卉 hover 放大
- **季节主题 CSS 变量**：春/夏/秋/冬四季自动切换配色（瞬切 · 无需重渲染）
- **oklch 色彩空间**：柔和色阶 · 现代浏览器原生支持

---

## 🚀 如何启动

```bash
git clone https://github.com/Leoatsr/HUAXIN.git
cd HUAXIN/build
npm install
npm run dev       # 开发模式 http://localhost:5173
npm run build     # 产出 dist/
```

### 部署

**首选**：Vercel —— 一键 git 集成 · 有 Serverless API 支持（鸟鸣 API 走 `/api/birds.js`）

```bash
vercel --prod
```

**次选**：Netlify / Cloudflare Pages / GitHub Pages —— 纯静态可用 · 但鸟鸣 API 需另接代理。

### 国内访问

- CDN 已国内化：`staticfile` + `bootcdn` + `cdnjs` 三层兜底
- 字体国内化：`fonts.font.im` 镜像 Google Fonts
- 出行工具国内站点自动标 **CN** 徽章 · 海外用户有提示

---

## 📁 目录结构

```
build/
├── api/                     ⬅️ Vercel Serverless
│   └── birds.js             Xeno-canto 鸟鸣 API · 4 层降级
│
├── src/
│   ├── main.jsx
│   ├── App.jsx              ~712 行 · 编排器 + 路由
│   │
│   ├── data/                ⬅️ 纯数据
│   │   ├── flora.js         404 景点
│   │   ├── flora-wiki.js    89 种花卉百科
│   │   ├── endangered-flora.js  29 种濒危植物
│   │   ├── huaxin.js        24 番花信
│   │   ├── poet-footprint.js    30 位诗人 · 236 站 · ~4000 行
│   │   ├── poet-circles.js      10 组诗人圈预设
│   │   ├── poet-relations.js    诗人关系网
│   │   ├── encounter-stories.js 相遇故事
│   │   ├── poet-colors.js       诗人色板
│   │   ├── poem-flora-map.js    诗 × 花映射
│   │   ├── badges.js · china-geo.js · i18n.js
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── phenology.js     物候 · 花期 · GDD 计算
│   │   ├── weather.js       open-meteo API + 6 小时缓存
│   │   ├── storage.js       localStorage 封装
│   │   ├── trip.js          行程优化 · TSP
│   │   ├── coords.js        GCJ-02 / WGS-84 转换
│   │   ├── map-urls.js      高德/百度/谷歌深链
│   │   ├── analytics.js     GA4
│   │   └── ...
│   │
│   ├── components/          ⬅️ 业务组件
│   │   ├── InkMap.jsx       水墨中国地图 + D3 投影
│   │   ├── MapCanvas.jsx    ⭐ v6.2 统一地图容器（InkMap + 缩放 + 徽章）
│   │   ├── FlowerMarker.jsx 25 种花瓣 SVG 调色
│   │   ├── PoetTrailOverlay.jsx  诗人足迹 + 相遇圈聚类 + 浮卡片
│   │   ├── SpotDetail.jsx
│   │   ├── SpotBirdsong.jsx 鸟鸣静默探测
│   │   ├── TravelTools.jsx  出行工具 + CN 标识
│   │   ├── MusicPlayer.jsx · NatureAmbient.jsx
│   │   └── ...
│   │
│   ├── screens/             ⬅️ 屏幕
│   │   ├── Landing.jsx
│   │   ├── MapWorkspace.jsx         花事地图
│   │   ├── PoetFootprintPanel.jsx   诗踪 · 单人追踪
│   │   ├── DynastyGardenPanel.jsx   朝代花园 · 千年群像
│   │   ├── HuaxinPanel.jsx          二十四番
│   │   ├── MoodHub + MoodPanel      花签
│   │   ├── DiaryHub + DiaryPanel    花历
│   │   ├── PoetryHub + PoemDiscoveryPanel
│   │   ├── WikiPanel · CalendarPanel · WrappedPanel · ReverencePanel
│   │   └── marketing/               Claude Design 落地页
│   │
│   ├── ui/
│   │   ├── atoms.jsx · TopBar.jsx
│   │
│   └── styles/
│       ├── tokens.css · app.css
│
├── public/
│   ├── manifest.webmanifest PWA 清单
│   ├── sw.js                Service Worker
│   └── icons/
│
└── vercel.json              SPA 路由 + API 豁免
```

---

## 📊 当前数据统计

```
诗人：30 位（初 5 / 盛 8 / 中 10 / 晚 6 / 宋 1）
站点：236 站（100% 有坐标）
景点：404 个
花卉：89 种
濒危：29 种
花信：24 番（每番 1 花 + 1 诗）
语言：8 种
代码：~27600 行
```

---

## 🧭 版本历史

### v6.x · 诗人宇宙完工 + 地图统一
- **v6.2** ⭐ MapCanvas 统一地图容器 · 诗踪/朝代花园真正复用花事地图视觉 · 29 濒危 · 89 花卉
- **v6.1** 唐宋诗人全扩完 · 236 站
- **v6.0** 盛唐 3 位 + 中唐 2 位扩展

### v5.x · 朝代花园成熟
- **v5.9** 相遇圈聚类 + 浮卡片 + 一屏填满
- **v5.8** 出行 CN 标 + 鸟鸣静默 + 诗人圈 + 按钮分清
- **v5.7** 初盛唐 10 位扩展到生平所有
- **v5.6** 扩到 30 位诗人
- **v5.4** 相遇圈重设计
- **v5.3** Serverless 里程碑（/api/birds.js）
- **v5.0.1** 真实中国地图 · 修复 D3 球面 bug

### v4.x · 诗踪引入
- **v4.9** 诗踪三栏
- **v4.5** 诗踪 + 诗人关系
- **v4.3** 长辈模式 + 敬畏濒危 + 离线 SW
- **v4.1** GA4 + 打卡 + 智能搜索

### v3.x · 落地页整合
- **v3.0** Claude Design marketing 9-section 落地页

### v2.x · 功能全貌建立
- 17 屏 / 3 模态 / 3 浮动组件
- PWA + Service Worker + 动态 meta
- TSP 行程优化 · AI 规则引擎 · 拼图游戏

---

## 🔑 关键设计决策

1. **地图必须真实 · 历史才真实** → v5.0.1 切换到 d3 球面投影真实经纬度
2. **朝代花园群像 · 诗踪单人 · 共享底图** → v6.2 MapCanvas 统一容器
3. **每站实际写的花更真实** → 诗人 footprint 的 `flower` 字段来自原诗意象
4. **相遇圈聚类 > 挤成一坨** → 30px 内合并 · 保视觉清晰
5. **鸟鸣静默探测 · 非每地都有** → API 有结果才提示 · 避免噪音
6. **国内站保留但加海外提示** → CN 徽章 + 底部说明
7. **zip 顶级目录 = 项目名** → 部署时直接解压即用 · 不需 `/build` 子目录

---

## 🙌 致谢与来源

- 数据来源：国务院《国家重点保护野生植物名录》（2021）· IUCN Red List · 中国生物多样性红色名录（2013）
- 诗人编年参考：仇兆鳌《杜诗详注》· 孔凡礼《苏轼年谱》· 朱金城《白居易集笺校》· 安旗《李白全集编年注释》
- 地图数据：datav.aliyun.com 真实 GeoJSON
- 天气 API：open-meteo（免费无 key）
- 鸟鸣 API：Xeno-canto（Creative Commons）
- 字体：fonts.font.im 镜像的 Google Fonts
- 设计系统：Claude Design

---

## 📮 作者 · 独立开发

一个人做的一个关于花和诗的慢 app。希望它陪你走过四季。

- GitHub: [Leoatsr/HUAXIN](https://github.com/Leoatsr/HUAXIN)
- Live: [shihua.vercel.app](https://shihua.vercel.app)

---

🌸 *「不知细叶谁裁出，二月春风似剪刀。」* —— 贺知章
