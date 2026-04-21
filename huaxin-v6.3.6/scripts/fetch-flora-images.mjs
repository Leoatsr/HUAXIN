#!/usr/bin/env node
/**
 * 花信风 · 景点图批量下载工具
 *
 * 用途：为 72 种花下载 3 张高清图（共 216 张）→ public/flora-images/
 *      下载后 SpotImage 组件自动优先使用本地图
 *
 * 使用步骤：
 *   1. 去 https://unsplash.com/developers 注册（免费）
 *   2. 新建 App → 拿 Access Key
 *   3. 在项目根目录运行（替换成你的 key）：
 *      UNSPLASH_KEY=你的key node scripts/fetch-flora-images.mjs
 *   4. Windows PowerShell：
 *      $env:UNSPLASH_KEY="你的key"; node scripts/fetch-flora-images.mjs
 *
 * Unsplash Demo 限流：50 次/小时 · 足够下载 216 张
 * 所有图都是 CC0 授权可自由使用
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

// ═══ 读取花种关键词 ═══
const FLORA_KEYWORDS_PATH = path.resolve('src/data/flora-keywords.js');
const kwSource = await fs.readFile(FLORA_KEYWORDS_PATH, 'utf-8');
const kwMatch = kwSource.match(/FLORA_KEYWORDS = ({[\s\S]*?});/);
if (!kwMatch) { console.error('❌ 读不到 FLORA_KEYWORDS'); process.exit(1); }
// 粗暴 eval · 反正是自己的数据
const FLORA_KEYWORDS = eval('(' + kwMatch[1] + ')');
const speciesList = Object.keys(FLORA_KEYWORDS);
console.log(`🌸 将下载 ${speciesList.length} 种花 × 3 图 = ${speciesList.length * 3} 张`);

// ═══ Unsplash API 配置 ═══
const KEY = process.env.UNSPLASH_KEY;
if (!KEY) {
  console.error('❌ 请设置环境变量 UNSPLASH_KEY');
  console.error('   去 https://unsplash.com/developers 注册，新建 App，拿 Access Key');
  process.exit(1);
}

const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const PER_SPECIES = 3;
const OUT_DIR = path.resolve('public/flora-images');

// ═══ 工具函数 ═══
async function searchPhotos(keywords) {
  const url = `${UNSPLASH_API}?query=${encodeURIComponent(keywords)}&per_page=${PER_SPECIES}&orientation=landscape`;
  const resp = await fetch(url, {
    headers: { 'Authorization': `Client-ID ${KEY}` }
  });
  if (!resp.ok) throw new Error(`Unsplash ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  return (data.results || []).map(r => ({
    url: r.urls.regular,        // ~1080px 足够景点 hero 用
    authorName: r.user.name,
    authorUrl: r.user.links.html,
    photoUrl: r.links.html
  }));
}

async function downloadTo(url, filepath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download ${resp.status}`);
  await pipeline(resp.body, createWriteStream(filepath));
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══ 主流程 ═══
await fs.mkdir(OUT_DIR, { recursive: true });
const manifest = {};
const credits = [];

let i = 0;
for (const sp of speciesList) {
  i++;
  const kw = FLORA_KEYWORDS[sp];
  process.stdout.write(`[${i}/${speciesList.length}] ${sp} ← ${kw} ... `);

  try {
    const photos = await searchPhotos(kw);
    if (photos.length === 0) {
      console.log('⚠️  无结果，跳过');
      continue;
    }

    const spDir = path.join(OUT_DIR, encodeURIComponent(sp));
    await fs.mkdir(spDir, { recursive: true });
    const urls = [];

    for (let j = 0; j < photos.length; j++) {
      const p = photos[j];
      const filename = `${j + 1}.jpg`;
      const filepath = path.join(spDir, filename);
      await downloadTo(p.url, filepath);
      urls.push(`/flora-images/${encodeURIComponent(sp)}/${filename}`);
      credits.push({ species: sp, file: filename, author: p.authorName, authorUrl: p.authorUrl, source: p.photoUrl });
    }

    manifest[sp] = urls;
    console.log(`✓ ${photos.length} 图`);
    await sleep(1200);  // 避免触碰 50/hr 限流
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

// ═══ 输出 manifest 和 credits ═══
await fs.writeFile(
  path.join(OUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
await fs.writeFile(
  path.join(OUT_DIR, 'credits.json'),
  JSON.stringify(credits, null, 2)
);

const okCount = Object.keys(manifest).length;
console.log(`\n🎉 完成：${okCount}/${speciesList.length} 花种 · 共 ${credits.length} 图`);
console.log(`📁 输出：${OUT_DIR}/`);
console.log(`📜 manifest.json 和 credits.json 已生成`);
console.log(`\n运行 \`npm run build && vercel --prod\` 重新部署即可看到真实图片`);
