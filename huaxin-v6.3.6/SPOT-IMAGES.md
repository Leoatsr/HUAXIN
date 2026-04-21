# 花信风 · 景点真实图片系统

## 当前状态

**零配置即可使用**。所有景点详情和首选推荐卡的图片会自动显示。

图片来源采用三层 fallback：

```
Tier 1  public/flora-images/{花种}/{1..3}.jpg
        ↓  缺失
Tier 2  loremflickr.com 运行时在线图（无 API key · 免费）
        ↓  加载失败
Tier 3  SVG 占位符（你之前看到的纯色）
```

**你现在部署 → 朋友打开看到 Tier 2 的 LoremFlickr 图**，已经比纯色占位好得多。

---

## 🎨 想升级到最高质量（Unsplash 高清图）？

跑一次下载脚本即可。

### 步骤

**1. 注册 Unsplash 开发者账号**

打开 https://unsplash.com/developers
- 登录（可用 Google/邮箱）
- 点 "New Application"
- 勾选同意条款
- 名字随便填（如 `huaxinfeng-dev`）
- 描述也随便填
- 提交后在 App 页面找到 **Access Key**（很长一串）

**2. 本地运行下载脚本**（72 花种 × 3 图 = 216 张图 · 约 2-3 分钟）

Windows PowerShell：

```powershell
cd C:\Users\ghani\Desktop\huaxin-v3.0\build
$env:UNSPLASH_KEY="你拿到的Access_Key"
node scripts/fetch-flora-images.mjs
```

Mac / Linux：

```bash
cd huaxin-v3.0/build
UNSPLASH_KEY=你拿到的Access_Key node scripts/fetch-flora-images.mjs
```

**3. 下载完成后**

`public/flora-images/` 里会有 72 个文件夹，每个 3 张图，加一份 `manifest.json` 和 `credits.json`。

**4. 重新部署到 Vercel**

```powershell
vercel --prod
```

刷新 `shihua.vercel.app` → 所有景点自动显示 Unsplash 高质量摄影图。

---

## 📊 图片按花种共享（不按景点）

重要：**72 花种共享 216 张图**，而不是 404 景点各自独立 1200+ 张图。

理由：
- 用户看「杭州樱花」和「苏州樱花」本质都是想看"樱花的样子"，同组图 OK
- 数据量从 500MB 降到 ~40MB，Vercel 100GB/月带宽够几万人访问
- Unsplash 免费层 50 req/hour，216 图跑不过限流

如果有某些**核心景点**（如婺源油菜花、林芝桃花）你希望专属摄影图，那得手动替换：
- 例如要替换「林芝 · 嘎拉桃花」
- 找张合适的图 → 放到 `public/flora-images/桃花/4.jpg`
- 在 `public/flora-images/manifest.json` 的 `"桃花"` 数组里加上 `"/flora-images/桃花/4.jpg"`
- 在 `SpotImage` 的 `idx` 属性传 `3`（0-indexed 的第 4 张）

---

## 📜 法律与版权

- LoremFlickr 用的是 Flickr 上 CC 授权图（商用要看具体图的 license）
- Unsplash 是 CC0（无归属要求，但最好在 About 页面挂个感谢）
- 脚本会生成 `public/flora-images/credits.json` 记录每张图的作者和原始链接
- 如果将来要商用，建议附个 Attribution 页显示 credits.json 的内容

---

## 🔧 SpotImage 组件 API

如果你想在其他地方用真实图：

```jsx
import { SpotImage } from './components/SpotImage.jsx';

// 景点卡片里用
<SpotImage
  species="樱花"
  name="杭州·太子湾"
  hashSeed={spot.id}   // 同景点图稳定不变
  aspect="16/10"       // 或 '1/1' '4/3'
  mode="auto"          // auto | flickr | local | off
/>
```

---

## 💡 常见问题

**Q: 为什么有些花种搜不到图？**
A: Unsplash 上"胡杨""格桑花""雾凇"等中国特色植物可能冷门。脚本会跳过无结果的，那个花种就继续走 Tier 2 (LoremFlickr)。

**Q: 图片加载慢？**
A: 首次打开某个景点会下载对应图，之后浏览器自动缓存。Service Worker 也会缓存。部署到 Vercel 后图片走 CDN 很快。

**Q: 可以关掉外部图，只用占位？**
A: 在 SpotImage 传 `mode="off"`，或者在 `flora-keywords.js` 里把 FLORA_KEYWORDS 全删掉。
