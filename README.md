<div align="center">

# 🌸 花信风 · HuaXinFeng

**基于中国传统物候学的智能赏花地图**

*以二十四番花信风为脉络，用积温模型预测花期，让你在最美的时刻遇见最美的花。*

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![D3.js](https://img.shields.io/badge/D3.js-GeoJSON-orange?logo=d3dotjs)](https://d3js.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## ✨ 产品理念

> "花信风，应花期而来的风也。"

花信风是一款融合了中国传统物候文化与现代气象科学的赏花应用。我们基于**积温预测模型**和 **Open-Meteo 实时气象数据**，为全国 **408 个赏花景点**提供精准的花期预测，并以水墨画风格的交互地图呈现，让赏花成为一次文化之旅。

---

## 📊 产品规格

| 维度 | 数据 |
|------|------|
| 代码 | 5,388 行 · 单文件 React 应用 |
| 景点 | 408 个 · 覆盖全国 34 省 + 台湾 + 南海 |
| 花卉 | 72 种 · **74 种深度百科词条（100% 覆盖）** |
| 区域 | 10 大区（华北/华东/华南/华中/西南/西北/东北/西藏/台湾/南海）|
| 诗词 | 52 首经典古诗词 + **20 首鉴赏导读** |
| 物候 | **24 番花信风 + 72 候全年物候** |
| 景点详情 | 45 个重点景点完整信息 + 24 种花种贴士 + 11 个官方网站 |
| 环境音 | 🌿 **5 种程序化自然音**（鸟鸣/虫鸣/溪流/风声/细雨）|
| 音乐 | 21 首五声音阶民乐 · 8 种传统乐器 |
| 成就 | 25 枚徽章 · 7 维度 · 4 级进阶（铜银金钻）|
| 语言 | 中文 / English / 日本語 / 한국어 |
| 组件 | 30 个 React 组件 · 9 个功能面板 |

---

## 🎯 核心功能

### 🗺 智能花事地图

- **D3.js GeoJSON 中国地图**，支持拖拽/缩放/双指手势
- 水墨画风格山川河流底图 + 季节性生成式风景画
- 按「当季 / 全年 / 未来1月」筛选花期状态
- 10 大区域快速定位 + 景点搜索（名称/花种/区域）
- 每个景点实时调用 **Open-Meteo API** 获取当年积温数据

### 🌡 积温预测模型

- 基于 3 年历史花期数据 + 物种活动积温阈值
- 预测精度显示（置信度百分比）
- 实时积温进度条（已积累 vs 目标阈值）
- 花期状态分级：休眠 → 营养生长 → 花芽分化 → 初花 → 盛花 → 末花

### 🌺 二十四番花信风

小寒至谷雨，八气二十四候，每五日一候，每候一花信：

```
小寒：梅花 → 山茶 → 水仙
大寒：瑞香 → 兰花 → 山矾
立春：迎春 → 樱花 → 望春
雨水：菜花 → 杏花 → 李花
惊蛰：桃花 → 棠棣 → 蔷薇
春分：海棠 → 梨花 → 木兰
清明：桐花 → 麦花 → 柳花
谷雨：牡丹 → 荼蘼 → 楝花
```

点击每候可跳转地图查看对应景点，或打开花卉百科。

### 📖 花卉百科

19 种核心花卉的深度资料：别名、拉丁学名、科属、花语、原产历史、文化典故、养护要诀、2-3 首古诗词关联。

---

## 🎨 体验特色

### 🎋 花签 · 竹签筒求签

- SVG 竹签筒动画（待机 → 摇签 → 抽签 → 揭签）
- 每日一签，含花卉诗句 + 运势解读
- Canvas 生成精美签面卡片，支持分享

### 🎵 五声民乐

- 21 首程序化生成的五声音阶旋律
- 8 种传统乐器音色：古琴 / 古筝 / 琵琶 / 二胡 / 竹笛 / 洞箫 / 扬琴 / 中阮
- Web Audio API 实时合成 + 混响效果
- 键盘快捷键控制（↑↓ 切换乐器，←→ 切换曲目，空格播放）

### 🎨 季节主题

整体色调随季节自动切换：
- 🌸 春：暖粉底调 + 赤色强调
- 🌿 夏：青绿底调 + 翠色强调
- 🍁 秋：暖金底调 + 橙色强调
- ❄ 冬：冷灰底调 + 蓝色强调

### 📜 诗词花事

22 首经典古诗词与赏花景点联动，点击诗句可直接跳转地图定位对应景点。

---

## 🏅 成就系统

**25 枚徽章 · 7 大维度 · 4 级进阶**

| 维度 | 徽章 | 解锁条件 |
|------|------|---------|
| 🌸 探花者 | 初识花事 → 花中帝王 | 打卡 1/5/15/30 处 |
| 💐 采花令 | 初窥门径 → 花神降世 | 采集 3/8/15/25 种花 |
| 🗺 行者 | 踏青一步 → 九州花事 | 跨越 2/4/6/8 个区域 |
| 🔄 四时 | 双季之约 → 四季花神 | 跨 2/3/4 个季节 |
| 💬 社交 | 花之初恋 → 花事作家 | 收藏 3/10/20 + 笔记 3/10 |
| 🎋 风雅 | 古都寻花 / 南北花使 | 访古都 / 南北跨区 |
| 💎 稀有 | 月月赏花 / 高原花使 / 海岛花事 | 隐藏成就 |

每枚徽章可生成 **Canvas 成就卡片**，一键分享至微信/小红书/微博/推特。

---

## 🤖 AI 赏花助手

双引擎架构：

- **主引擎**：Anthropic Claude API，注入实时花事数据上下文
- **降级引擎**：本地关键词匹配（支持城市/花种/季节查询）

示例问答：
- "杭州现在有什么花可以看？"
- "推荐周末带父母赏花去处"
- "牡丹最佳观赏时间和地点"

---

## 👥 社交功能

### 🌺 花事圈

- 发帖（200字 + 景点标记）
- 点赞（用户去重）+ 转发
- 共享 Feed（所有用户可见）

### 📡 花讯播报（众包）

- 5 档状态：🌸盛花 / 🌱含苞 / 🌼初花 / 🍂将谢 / ❄已谢
- 共享存储，为预测模型提供校准数据

### 📤 分享

- 景点卡片（Canvas 生成 + QR码）
- 花签卡片
- 成就卡片
- 8 渠道：微信/朋友圈/小红书/微博/推特/Facebook/链接/系统

---

## 👤 用户系统

| 功能 | 说明 |
|------|------|
| 微信登录 | OAuth 一键授权（需接入微信开放平台）|
| 手机登录 | 3步流程：输入号码 → 验证码(60s倒计时) → 设置昵称 |
| 状态持久化 | 自动登录 + 跨会话数据保持 |
| 用户菜单 | 头像 + 下拉菜单（花历/设置/退出）|
| 引导登录 | 进入45秒后自动弹出（仅一次）|

---

## 🧭 产品导航

### 右侧书签

| 书签 | 功能 |
|------|------|
| 🟡 花签 | 每日花签 · 竹签筒求签 |
| 🟢 花信 | 二十四番花信风 |
| 🟤 花历 | 个人花历 + 成就徽章 |

### FAB 工具栏（左下角）

| 工具 | 功能 |
|------|------|
| 📊 花事概览 | 全国花事仪表盘 |
| 🤖 AI助手 | 智能赏花问答 |
| ✨ 为你推荐 | 个性化推荐 |
| 🌺 花事圈 | 社交动态 |
| 🗓 花事日历 | 节气花事 + iCal导出 |
| 📡 花讯播报 | 众包实况 |
| 📜 诗词花事 | 诗词地图联动 |

### 新手引导

首次访问自动触发 5 步引导教程，可跳过，仅显示一次。

---

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + Hooks |
| 地图 | D3.js + GeoJSON (DataV Aliyun) |
| 构建 | Vite + esbuild |
| 部署 | Vercel (auto-deploy from GitHub) |
| 气象 | Open-Meteo Archive API |
| AI | Anthropic Claude API |
| 音频 | Web Audio API (程序化合成) |
| 存储 | window.storage (Anthropic Artifacts) |
| 图形 | Canvas 2D (分享卡片/成就卡片/QR码) |
| 样式 | CSS-in-JS (inline styles) |

### 架构特点

- **纯前端单文件**：整个应用是一个 4,462 行的 React JSX 文件
- **零后端依赖**：所有数据本地计算，API 调用仅限天气和 AI
- **渐进增强**：无 API 时自动降级为本地引擎
- **跨平台**：响应式设计，支持桌面/平板/手机

---

## 🚀 部署指南

### 方式一：Vercel 自动部署（推荐）

1. Fork 本仓库
2. 登录 [Vercel](https://vercel.com)
3. Import 仓库 → 自动检测 Vite 配置
4. 部署完成，后续推送自动重新部署

### 方式二：本地开发

```bash
# 克隆仓库
git clone https://github.com/Leoatsr/HUAXIN.git
cd HUAXIN

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 更新代码流程

1. 下载最新的三个文件：
   - `flower-wind.jsx` → 重命名为 `src/App.jsx`
   - `index.html` → 替换根目录
   - `manifest.webmanifest` → 放到 `public/` 目录
2. 提交到 GitHub → Vercel 自动重新部署

### 可选：启用数据分析

`index.html` 中已预留 `window._hxTrack` 埋点接口，默认仅输出到 console。

启用 Google Analytics：
```html
<!-- 在 </head> 前添加 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXX');
</script>
```
然后在 `index.html` 的 `_hxTrack` 函数中取消 gtag 注释即可。

---

## 📁 项目结构

```
HUAXIN/
├── index.html          # 入口 HTML
├── package.json        # 依赖配置
├── vite.config.js      # Vite 构建配置
└── src/
    ├── main.jsx        # React 挂载入口
    └── App.jsx         # 📌 应用主文件 (4,462 行)
```

### 核心组件清单

```
ScrollLanding       千里江山图首页
App                 主应用容器（地图 + 导航 + 状态管理）
Card                景点详情卡（预测 + 气象 + 打卡 + 笔记）
FI                  花卉 SVG 图标渲染器
MusicPlayer         五声民乐播放器
MoodCard            花签竹签筒
SpotShareCard       景点分享卡（Canvas + QR）
MoodShareCard       花签分享卡
SpeciesWheel        花谱浏览器
NearbyPanel         附近花事（可折叠）
HuaxinPanel         二十四番花信风面板
FlowerWiki          花卉百科弹窗
DiaryPanel          个人花历 + 成就系统
CalendarPanel       节气花事日历 + iCal
CrowdPanel          众包花讯播报
PoemPanel           诗词花事地图
DashboardPanel      花事概览仪表盘
AIAssistant         AI 赏花助手
RecommendPanel      个性化推荐
SocialFeed          花事圈社交 Feed
LoginPanel          用户登录
UserMenu            用户头像菜单
OnboardingGuide     新手引导
LangSwitcher        语言切换器
LandscapeSVG        生成式水墨风景
ZoomControls        缩放控制
AlertBanner         花期提醒横幅
Mk                  地图标记点
```

---

## 🌍 数据来源

| 数据 | 来源 |
|------|------|
| 地图 GeoJSON | [DataV Aliyun](https://datav.aliyun.com/portal/school/atlas/area_selector) |
| 气象数据 | [Open-Meteo Archive API](https://open-meteo.com/) |
| 花期数据 | 中国物候学文献 + 景区公开数据 |
| 诗词数据 | 中国古典诗词库 |
| 积温阈值 | 物候学研究论文 + 历史观测校正 |

---

## 🗺 未来规划

| 优先级 | 功能 | 状态 |
|--------|------|------|
| 🔲 | PWA 离线模式 (Service Worker) | 需额外文件 |
| 🔲 | 微信小程序版本 | 需独立开发 |
| 🔲 | AR 拍照识花 | 需 TensorFlow.js |
| 🔲 | 百科扩充至 72 种 | 数据工作 |
| 🔲 | 真实微信 OAuth 后端 | 需服务器 |
| 🔲 | 真实 SMS 验证码后端 | 需云服务 |

---

## 📜 致谢

- 物候学思想来源于中国古代「二十四番花信风」传统
- 地图数据由阿里云 DataV 提供
- 气象数据由 Open-Meteo 开放API提供
- AI 能力由 Anthropic Claude 提供

---

<div align="center">

**花信风** · 应花期而来的风

*让每一次赏花，都成为一次文化之旅。*

🌸

</div>
