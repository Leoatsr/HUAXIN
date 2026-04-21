# 花信风 · 部署指南

> 面向 v2.9+ · 生产就绪的 PWA · 10892 行代码 · 59 文件

---

## 🎯 TL;DR（最快路径）

如果你只想**最快看到线上**：

```bash
cd build
npm install
npm run build
# dist/ 就是可上线的静态产物
```

然后推到 **Netlify**（已配置好 `netlify.toml`）：

```bash
# 方式 1：网页拖拽
# 打开 https://app.netlify.com/drop → 拖 dist 目录 → 拿到一个 .netlify.app 域名

# 方式 2：命令行（需先装 netlify-cli）
npm i -g netlify-cli
netlify deploy --dir=dist --prod
```

**5 分钟上线**。

---

## ✅ 部署前 Checklist

打钩的都能做了才动部署。

### 代码层面
- [ ] `cd build && npm install` 能跑过（node ≥ 18 推荐）
- [ ] `npm run build` 能跑过且无警告
- [ ] `dist/` 目录生成，含 `index.html` + `assets/` + `sw.js` + `manifest.webmanifest` + `icons/`
- [ ] `npm run preview` 本地验证一遍（访问 http://localhost:4173）
- [ ] 右下角音乐/自然音浮钮能点开
- [ ] 顶部提醒横幅 15s 轮播
- [ ] 多语言切换 8 种都能切
- [ ] 浏览器 devtools → Application → Service Workers 能看到 sw.js 已注册
- [ ] Lighthouse 跑一下（PWA 分数预期 90+）

### 配置层面
- [ ] `index.html` 里 `twitter:card` 和 `og:*` 的 meta 都是相对路径（已做）
- [ ] 域名决定了：选哪个（看下一节）
- [ ] 如果用 Google Analytics：填 `index.html` 里的 `G-XXXXXXXXXX`
- [ ] 如果用 Umami：填 instance URL + website-id

---

## 🌐 选一条部署路径

### 路径 A · Netlify（推荐，因为 `netlify.toml` 已就绪）

**优点**：配置文件已写好 · 静态部署 · 免费版够用 · 支持 SPA 路由 rewrite · SW headers 正确

**步骤**：
1. 在 https://app.netlify.com 登录 · New site · Import from Git
2. 选你的 GitHub `Leoatsr/HUAXIN` 仓库
3. Branch: `main`（或你主分支名）
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy · 拿到 `https://random-name.netlify.app`
7. Site settings · Change site name → 改成你想要的（比如 `huaxinfeng`，则域名变成 `huaxinfeng.netlify.app`）

**如果要用自定义域名**：
- Site settings · Domain management · Add domain
- 按提示配 DNS（CNAME 到 `huaxinfeng.netlify.app`）
- 自动上 HTTPS（Netlify 给免费 Let's Encrypt）

---

### 路径 B · Vercel（`vercel.json` 也已就绪）

**步骤**：
1. https://vercel.com/new · Import Git Repository
2. Framework Preset: Vite（会自动检测）
3. Build command: `npm run build`（自动填）
4. Output directory: `dist`（自动填）
5. Deploy

`vercel.json` 里已配置了 SPA rewrite + SW headers。

---

### 路径 C · Cloudflare Pages

**优点**：免费带宽无限 · CDN 全球最快（除中国大陆）· 和你的 `huaxinfeng.leoatsr.workers.dev` 同一个账号

**步骤**：
1. https://dash.cloudflare.com → Pages → Create
2. Connect to Git · 选仓库
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy

注意：Cloudflare 不自动读 `_redirects`，但 `public/_redirects` 已经写了，会被 copy 到 `dist/`，所以 SPA 路由没问题。

---

## 🇨🇳 中国访问方案（你 memory 里的老问题）

Netlify / Vercel / Cloudflare **国内全部不可直接访问**或极慢。如果你的目标用户是国内，必须选一种方案：

### 方案 ① · ICP 备案 + 国内云（最正规）
- **成本**：¥71/年（阿里云/腾讯云域名）+ 备案 20 天审核期
- **需要**：身份证 + 手持照 + 备案地居住证明
- **适合**：确定长期运营，想要最稳的国内访问
- **部署到**：阿里云 OSS / 腾讯云 COS + CDN · 或部署 Nginx 到 ECS

### 方案 ② · Cloudflare Workers + 中国优化
- **成本**：0
- **做法**：你已有 `huaxinfeng.leoatsr.workers.dev`。用 Cloudflare 的 CN Network（需企业版）或者加其他 CDN 做中国加速
- **适合**：先以"海外用户 + 部分国内可访问"状态上线，验证产品

### 方案 ③ · 微信小程序版
- **成本**：个人号 免费 / 企业号 ¥300/年
- **做法**：用 Taro/uni-app 把 React 代码编译成小程序
- **适合**：国内为主、且用户习惯微信打开
- **代价**：要重写相当一部分代码（小程序 API 差异大）

### 方案 ④ · 暂不考虑国内
- **做法**：部署到 Netlify，只面向海外华人 / 访华外国人
- **TravelGuide 组件（入境指南）正好适配这类用户**
- **适合**：v1.0 MVP，先验证产品力再说国内

**我的建议（如果你还没决定）**：
先走 **方案 ④** 部署到 Netlify → 拿海外华人朋友圈测试一周 → 根据反馈决定是否走 ①。方案 ① 至少会吞掉你 3 周（备案 + 国内部署踩坑）。

---

## 📋 部署后 Checklist

### 立即验证
- [ ] 访问根域名，页面能正常加载
- [ ] Landing → 点击进入 → MapWorkspace 能出现
- [ ] 切换主 Tab（花签/花历/二十四番）
- [ ] 右下角音乐播放器能出声
- [ ] 多语言切换
- [ ] DevTools → Application → Service Workers 显示已注册
- [ ] DevTools → Application → Manifest 显示正确
- [ ] Lighthouse 分数（Performance 80+ / Accessibility 90+ / PWA 90+ / SEO 90+）

### PWA 验证
- [ ] 手机访问（或 Chrome 移动模拟）
- [ ] 浏览器地址栏右侧出现「安装」按钮
- [ ] 点击安装后能作为独立 app 启动
- [ ] 断网再刷新，离线兜底页能出现
- [ ] 图标 192 / 512 都能正确显示

### SEO 验证
- [ ] 在 https://metatags.io 里粘贴你的域名 · 预览 og:image/title/description
- [ ] Google Search Console 提交 sitemap（https://your-domain/sitemap.xml）
- [ ] Bing Webmaster Tools 同上

### 可选 · 分析
- [ ] 在 `index.html` 中填 Google Analytics ID 或 Umami instance
- [ ] 部署后访问网站，验证 `console.log('[花信风]', ...)` 有输出
- [ ] 过一天看 GA4/Umami 有访客数据

---

## 🔐 部署后的安全加固（可选）

### CORS & CSP
- `index.html` 目前没有 CSP（Content-Security-Policy）
- 如果担心第三方脚本注入，在 `netlify.toml` 或 `vercel.json` 加：
  ```toml
  [[headers]]
    for = "/*"
    [headers.values]
      Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.font.im; font-src 'self' https://fonts.font.im; img-src 'self' data: https:; connect-src 'self' https://archive-api.open-meteo.com https://www.google-analytics.com;"
  ```

### HTTPS 重定向
- Netlify/Vercel/CF Pages 都自动重定向 HTTP→HTTPS
- 如果用自己的服务器，Nginx 加 `return 301 https://$host$request_uri;`

---

## 📊 部署后要盯的指标

部署第一周，建议每天看：

1. **访客数**（GA4/Umami 的 Real-time + Daily）
2. **停留时长**（核心指标：>2 分钟说明产品有粘性）
3. **跳出率**（>80% 说明 Landing 没留住人）
4. **错误率**（GA4 里看 JS errors · 或 Sentry 接入）
5. **最热门的屏幕**（看 pageview 排名，决定未来优化优先级）

---

## 🚨 部署失败 · 常见问题

### "Service Worker 注册失败"
- 检查浏览器 devtools 里的错误
- 确保 `sw.js` 是从**根路径**（`/sw.js`）serve 的，不是子路径
- Netlify 的 `Service-Worker-Allowed: /` header 已配置

### "刷新后 404"
- SPA 路由没生效 · `_redirects` 或 `netlify.toml` 的 rewrite 规则没被读
- 确认 `public/_redirects` 存在（部署时会复制到 `dist/`）
- 或 `netlify.toml` 的 `[[redirects]]` 块配置对

### "白屏，控制台报 `failed to load module`"
- Vite base 配置问题。检查 `vite.config.js` 里的 `base: './'`
- 如果部署到子路径（如 `username.github.io/huaxin/`），base 要改成 `/huaxin/`

### "og:image 不显示"
- 微信 / 钉钉 / QQ 爬虫都不跑 JS，只读 `<meta>` 标签
- 确认 `public/og-image.svg` 有被打进 `dist/`
- **注意**：有些平台不支持 SVG og:image，需要提供 PNG。可以用 `convert og-image.svg og-image.png`（需装 ImageMagick）

---

## 🌴 你现在的下一步

1. **今天**：先本地 `npm run build` 一下，确认能跑过
2. **岛上**：如果想做点事，按这份 checklist 一项项做
3. **岛上闲时**：写一份 200 字的"花信风是什么"文案，放 Landing 页或第一次介绍用
4. **回来后**：登录 Netlify 网页拖 dist 目录 → 搞定

---

**祝你小岛愉快。度假回来，花信风在线。**
