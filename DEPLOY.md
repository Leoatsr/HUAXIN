# 🚀 花信风 部署与进阶配置

## 基础部署（已就绪）

当前应用是 Vite + React SPA，可直接部署到：

- **Vercel**（推荐）— 连接 GitHub 自动部署
- **Netlify** — 拖拽 `dist/` 文件夹即可
- **任何静态主机** — `npm run build` 后的 `dist/` 即可用

```bash
npm install
npm run dev          # 本地开发
npm run build        # 生产构建
npm run preview      # 预览生产版本
```

---

## 进阶：启用数据分析

### 方案 A：Google Analytics 4（推荐）

1. 注册 [Google Analytics](https://analytics.google.com/)，创建 GA4 媒体资源
2. 获取 Measurement ID（格式如 `G-XXXXXXXXXX`）
3. 编辑 `index.html`，取消 "Google Analytics 4" 注释块的注释
4. 替换所有 `G-XXXXXXXXXX` 为你的真实 ID
5. 重新构建部署

应用内部已通过 `window._hxTrack` 触发以下事件：
- `app_entered` · `checkin` · `favorite_add/remove`
- `spot_view` · `search` · `share` · `daily_checkin`
- `subscription_add` · `trip_add`

所有事件会自动转发到 GA4。

### 方案 B：Umami（隐私友好）

1. 自托管或用 [Umami Cloud](https://cloud.umami.is/)
2. 获取 Website ID + 域名
3. 编辑 `index.html` 取消 Umami 注释块
4. 填入你的 Website ID 和域名

### 方案 C：PostHog / Plausible / Mixpanel

应用 `_hxTrack` 已预留扩展点，添加相应 SDK 即可自动收集事件。

---

## 进阶：SEO 预渲染（SSR 替代方案）

当前是纯客户端渲染（CSR），搜索引擎爬虫可能抓不到内容。提升 SEO 有三种方案：

### 方案 1：Vite Prerender Plugin（最轻量）

```bash
npm install -D vite-plugin-prerender
```

在 `vite.config.js` 中添加：
```js
import prerender from "vite-plugin-prerender";

export default {
  plugins: [
    react(),
    prerender({
      staticDir: "dist",
      routes: ["/"], // 仅预渲染首页
    }),
  ],
};
```

构建时会为指定路由生成静态 HTML，解决基础 SEO 问题。

### 方案 2：迁移到 Next.js（完整 SSR）

适合需要为每个景点生成独立 URL 并被搜索引擎索引的场景：

```bash
npx create-next-app@latest huaxin-next
# 将 flower-wind.jsx 改造为 Next.js pages/index.jsx
# 添加 pages/spot/[id].jsx 动态路由
# 使用 getStaticPaths + getStaticProps 为 408 景点生成静态页
```

输出：每个景点独立 URL，搜索引擎完全可索引，首屏加载更快。

### 方案 3：Astro（最佳 SEO/性能）

```bash
npm create astro@latest
# 用 Astro Island 架构，静态为主 + 交互孤岛
```

输出：极快的 TTFB + 完美 SEO + 保留 React 交互。

---

## 进阶：接入后端（用户数据持久化）

当前所有用户数据存储在 `window.storage`（本地）。换设备会丢失。

### 推荐：Supabase（开源 Firebase）

```bash
npm install @supabase/supabase-js
```

需要你提供：
- Supabase Project URL
- Supabase Anon Key

数据表设计：
```sql
CREATE TABLE user_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  spot_id INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_favs (
  user_id UUID REFERENCES auth.users(id),
  spot_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, spot_id)
);
```

然后将应用内 `window.storage.set/get` 替换为 Supabase 调用即可。

---

## 进阶：推送通知（Push API）

当前使用浏览器 `Notification` API，只在标签页打开时工作。真正的推送需要：

1. 注册 Service Worker
2. 配置 VAPID 密钥
3. 后端存储订阅信息
4. 后端定时任务推送

推荐使用 [Web Push Library](https://github.com/web-push-libs/web-push) + Supabase Edge Functions。

---

## 文件清单

部署时需上传到 GitHub 的文件：
```
├── index.html            ← 含 SEO/OG/GA 占位符
├── manifest.webmanifest  ← PWA 清单
├── package.json          ← 依赖配置
├── vite.config.js        ← Vite 配置
├── README.md             ← 产品说明
├── DEPLOY.md             ← 本文档
└── src/
    ├── main.jsx          ← React 挂载
    └── App.jsx           ← 主应用（flower-wind.jsx 重命名）
```
