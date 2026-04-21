# 🎨 OG Image 转 PNG 指南

## 为什么要转？

`public/og-image.svg` 是我用 SVG 设计的新版分享图（水墨 + 朱砂花瓣 + 印章 + URL）。
但 **微信 / 小红书 / Twitter / Facebook** 分享预览**只支持 PNG/JPG**。
所以需要把 SVG 转成 PNG · 替换掉 `public/og-image.png`（当前是旧版）。

---

## ⚡ 最快方案 · 在线工具（1 分钟）

### 推荐 · CloudConvert

1. 打开 https://cloudconvert.com/svg-to-png
2. **Select File** · 选 `build/public/og-image.svg`
3. 点 **Convert**
4. 转换完成后点 **Download**
5. **重命名**下载的文件为 `og-image.png`
6. **覆盖** `build/public/og-image.png`
7. 重新 `vercel --prod` 部署

### 备选 · Convertio
https://convertio.co/svg-png/

### 备选 · 国内可用
https://www.aconvert.com/cn/image/svg-to-png/

---

## 🎯 推荐输出尺寸

**1200 × 630 像素** · 这是 OG image 标准尺寸（Facebook / Twitter / 微信都适用）。
在线工具通常有 **Custom dimensions** 选项 · 填这个值即可。

---

## 🔍 转换后检查

1. 打开生成的 PNG · 确认：
   - 朱砂花瓣 · 深墨「花信风」字 · 印章清晰可见
   - URL `shihua.vercel.app` 在左下
   - 无锯齿

2. 部署后检查微信预览：
   - 微信 → 随便找人发 `https://shihua.vercel.app`
   - 等 2-3 秒看**缩略图**是不是新的

---

## 🧪 本地自动转换（如果你有 Node 开发环境）

```bash
# 进到 build 目录
npm install sharp --save-dev

# 新建 scripts/svg-to-og.mjs
cat > scripts/svg-to-og.mjs << 'EOF'
import sharp from 'sharp';
import { readFileSync } from 'fs';
const svg = readFileSync('public/og-image.svg');
await sharp(svg, { density: 200 })
  .resize(1200, 630)
  .png()
  .toFile('public/og-image.png');
console.log('✅ og-image.png 已生成');
EOF

node scripts/svg-to-og.mjs
```

---

## 💡 发布到朋友圈前的检查清单

- [ ] 部署到 shihua.vercel.app 完成
- [ ] og-image.png 已是新版（水墨 + 朱砂 + 印章）
- [ ] 用**微信扫一扫**或**直接发给自己** `https://shihua.vercel.app` → 看缩略图是否正确
- [ ] 如果缩略图还是旧的 · 等 10 分钟（微信有缓存）· 或用 `?v=2` 破缓存：
  ```
  https://shihua.vercel.app?v=2
  ```

---

## 📐 如果想自定义 OG image

源 SVG 在 `public/og-image.svg` · 用任意 SVG 编辑器（Figma / Illustrator / VSCode）打开修改即可。

当前设计元素：
- 纸色底（`#f6eedd`）
- 左侧大朱砂 5 瓣花（5 个 ellipse + 花蕊）
- 中央「花信风」大字 + 副标「中国花 · 中国诗 · 中国节气」
- 右下朱砂印章「花信有时」
- 左下 URL 小字

可以改的：
- 副标文案
- 角落的金色晕染
- 散落花瓣数量
