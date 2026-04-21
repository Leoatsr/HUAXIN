# 花信风 · Vercel 5 分钟部署

> 你选的路径：Vercel 新开 · 海外优先 · 域名暂不定 ✅
>
> 代码已准备好：3 处硬编码域名已改为相对路径或 `YOUR_DOMAIN` 占位符。
> 推 Vercel 部署会拿到 `https://xxx.vercel.app` 的免费二级域名。

---

## 🚀 2 条路 · 选一条

### 路线 A · 从 GitHub 推送（推荐，持续部署）

你已有仓库 `github.com/Leoatsr/HUAXIN`：

```bash
# 1. 在本地 v2.9 目录里
cd build

# 2. 把新代码 push 到 GitHub
git add .
git commit -m "v2.9 · deploy-ready · Vercel config"
git push origin main

# 3. 打开 https://vercel.com/new
#    点 "Import Git Repository"
#    选 Leoatsr/HUAXIN
#    Framework 自动识别为 Vite
#    Root Directory 保持默认（不用改）
#    Environment Variables 空着
#    点 Deploy

# 4. 等 1-2 分钟，拿到 URL 如 https://huaxin-abc123.vercel.app
```

之后每次 `git push` 都会自动部署。

### 路线 B · Vercel CLI 一次性部署（更快，但不自动更新）

```bash
cd build
npm install
npm i -g vercel       # 或 npx vercel
vercel login          # 首次，浏览器扫码
vercel --prod         # 当场部署，yes/no 交互
# 2 分钟后给你 URL
```

---

## 🔧 拿到 URL 后要改的 3 个地方

替换 `YOUR_DOMAIN.vercel.app` 为真实的 `huaxin-xxx.vercel.app`：

```bash
cd build
REAL_DOMAIN="huaxin-abc123.vercel.app"   # 改成你拿到的

sed -i '' "s|YOUR_DOMAIN.vercel.app|$REAL_DOMAIN|g" index.html
# Linux 下用: sed -i "s|YOUR_DOMAIN.vercel.app|$REAL_DOMAIN|g" index.html

git add index.html
git commit -m "update og:url with real domain"
git push
```

Vercel 会再部一次 15 秒内完成。

---

## ✅ 部署成功 4 件事（验证清单）

打开 `https://huaxin-xxx.vercel.app/`：

1. ✅ Landing 页能看到「千里江山图」滚动
2. ✅ 进花事地图，能看到水墨中国地图 + 景点红点
3. ✅ F12 → Console → 看到 `[花信风] SW 已注册 /`
4. ✅ F12 → Application → Service Workers 里有活跃的 sw.js

如果 4 项全过 —— **恭喜，上线了**。

---

## 📤 给朋友发链接

你在小岛上可以用这段：

> 嘿，我做了个中国赏花地图，想请你给点反馈：
> https://huaxin-xxx.vercel.app/
>
> 主要看三个：
> 1. 第一次打开的 5 步引导是否清楚？
> 2. 哪个功能你会真的再打开一次？
> 3. 哪里让你觉得「这是个 demo 不是产品」？
>
> 随便玩 5 分钟告诉我即可，谢谢 🌸

---

## ⚠️ Vercel 限免费层边界

- **100 GB 带宽/月** · 静态页面 + SW 缓存后，够几千人访问
- **无商业用途限制**（个人项目免费）
- **Edge Functions** 不用管（我们没用）

---

## 🏝️ 度假期间可以做的事

部署完后你有了一个**可以随时点开的真实产品 URL**。无论在哪里：
- 在机场、飞机上、海岛上，随时打开看
- 发给朋友，收到反馈就记下来（哪怕 3 条也好）
- 回来后我们一起做视觉升级 / 景点真图 / 或者你发现的新问题

祝度假愉快 🏝
