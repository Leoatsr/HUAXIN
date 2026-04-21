import React, { useState, useEffect } from 'react';
import { Placeholder } from '../ui/atoms.jsx';
import { FLORA_KEYWORDS, getFlickrUrl, getPicsumUrl } from '../data/flora-keywords.js';

/* ═══════════════════════════════════════════════════════════════
   SpotImage · 景点/花种真实图展示
   三层 fallback 策略：
   ┌───────────────────────────────────────────────────────────┐
   │ Tier 1: 构建时预取的高质量图 (public/flora-images/)         │
   │   ↓ 失败 / 未配置                                           │
   │ Tier 2: LoremFlickr 运行时加载 (免 API key 免配置)         │
   │   ↓ 失败 / 禁用                                             │
   │ Tier 3: SVG 渐变占位 (Placeholder · 离线 / 初始态)          │
   └───────────────────────────────────────────────────────────┘

   Props:
     species    - 花种名称（必需）
     name       - 显示覆盖标题（可选）
     aspect     - 宽高比 '16/10' '4/3' '1/1' 等
     count      - 该花种总共几张（默认 3）· 用于随机选图
     idx        - 指定索引（不传则按景点 id hash 选图）
     hashSeed   - 景点 id 等（用于 idx 的 hash 种子）
     style      - 追加样式
     mode       - 'auto' 三层自动 | 'flickr' 强制在线 | 'local' 强制本地 | 'off' 仅占位
   ═══════════════════════════════════════════════════════════════ */

// 全局 manifest（构建时预取的 flora-images/manifest.json）
// 第一次加载后缓存
let MANIFEST_CACHE = null;
let MANIFEST_PROMISE = null;

function loadManifest() {
  if (MANIFEST_CACHE) return Promise.resolve(MANIFEST_CACHE);
  if (MANIFEST_PROMISE) return MANIFEST_PROMISE;
  MANIFEST_PROMISE = fetch('/flora-images/manifest.json')
    .then(r => r.ok ? r.json() : null)
    .then(m => { MANIFEST_CACHE = m || {}; return MANIFEST_CACHE; })
    .catch(() => { MANIFEST_CACHE = {}; return {}; });
  return MANIFEST_PROMISE;
}

export function SpotImage({
  species,
  name,
  aspect = '16/10',
  count = 3,
  idx,
  hashSeed = 0,
  style = {},
  mode = 'auto'
}) {
  const [tier, setTier] = useState('loading'); // loading | local | flickr | placeholder | error
  const [src, setSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // 决定显示第几张
  const resolveIdx = () => {
    if (typeof idx === 'number') return idx;
    // 按花种 + hashSeed 确定性 hash
    let h = hashSeed | 0;
    for (let i = 0; i < species.length; i++) h = ((h << 5) - h + species.charCodeAt(i)) | 0;
    return Math.abs(h) % count;
  };

  useEffect(() => {
    let cancelled = false;
    const actualIdx = resolveIdx();

    async function resolve() {
      if (mode === 'off') {
        setTier('placeholder');
        return;
      }

      // Tier 1: 本地预取图
      if (mode !== 'flickr') {
        const manifest = await loadManifest();
        if (cancelled) return;
        const list = manifest[species];
        if (list && list.length > 0) {
          setSrc(list[actualIdx % list.length]);
          setTier('local');
          return;
        }
      }

      // Tier 2: LoremFlickr
      if (mode !== 'local') {
        setSrc(getFlickrUrl(species, actualIdx));
        setTier('flickr');
        return;
      }

      // Tier 3: 占位
      setTier('placeholder');
    }

    resolve();
    return () => { cancelled = true; };
  }, [species, idx, hashSeed, count, mode]);

  // 占位态
  if (tier === 'placeholder' || tier === 'loading' || !src) {
    return (
      <div style={{ position: 'relative', ...style }}>
        <Placeholder label={name || species} aspect={aspect}/>
      </div>
    );
  }

  // 图片态（带 blur-up）
  return (
    <div style={{
      position: 'relative',
      aspectRatio: aspect,
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: `linear-gradient(135deg, var(--bg-sunk), var(--bg))`,
      ...style
    }}>
      {/* 占位底 */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, oklch(0.94 0.008 80), oklch(0.94 0.008 80) 6px, oklch(0.97 0.006 80) 6px, oklch(0.97 0.006 80) 12px)',
          display: 'grid', placeItems: 'center',
          color: 'var(--ink-3)',
          fontSize: 11, letterSpacing: '0.1em',
          fontFamily: 'var(--font-mono)'
        }}>{name || species}</div>
      )}
      <img
        src={src}
        alt={name || species}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          // LoremFlickr 失败 → 自动切 Picsum
          if (tier === 'flickr') {
            setLoaded(false);
            setSrc(getPicsumUrl(species, resolveIdx()));
            setTier('picsum');
          } else if (tier === 'picsum') {
            // Picsum 也失败 → 最后回落占位
            setTier('placeholder');
          } else {
            setTier('placeholder');
          }
        }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity var(--dur-calm) var(--ease-out)'
        }}
      />
      {/* 景点标题水印（右下角） */}
      {name && loaded && (
        <div style={{
          position: 'absolute', bottom: 8, right: 10,
          padding: '3px 10px',
          background: 'rgba(250, 245, 237, 0.88)',
          backdropFilter: 'blur(4px)',
          borderRadius: 4,
          fontSize: 10,
          color: 'var(--ink-2)',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-serif)'
        }}>{name}</div>
      )}
    </div>
  );
}
