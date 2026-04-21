/* ═══════════════════════════════════════════════════════════════
   /api/birds · 按地理位置返回真实鸟鸣
   ───────────────────────────────────────────────────────────────
   多策略查询 · 直到找到结果：
     1. 精确 ±1° box
     2. 放宽 ±3° box
     3. 仅中国高品质
     4. 兜底 · 东亚常见鸟
   ═══════════════════════════════════════════════════════════════ */

function getRegion(lat, lon) {
  if (lat > 40 && lon > 115) return '东北';
  if (lat > 34 && lon > 110) return '华北';
  if (lat > 34 && lon < 110) return '西北';
  if (lat > 28 && lat < 34 && lon < 105) return '西南';
  if (lat > 28 && lat < 34 && lon >= 105) return '华中';
  if (lat < 28 && lon > 115) return '华南';
  if (lat < 28 && lon < 115) return '西南';
  if (lat > 28 && lon > 115) return '华东';
  return '华中';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const { lat, lon } = req.query || {};
  const latN = parseFloat(lat), lonN = parseFloat(lon);

  if (isNaN(latN) || isNaN(lonN) || latN < 18 || latN > 54 || lonN < 73 || lonN > 135) {
    return res.status(400).json({
      error: 'lat/lon invalid or out of China range',
      fallback: true
    });
  }

  const region = getRegion(latN, lonN);

  const strategies = [
    () => {
      const b = `${(latN-1).toFixed(2)},${(lonN-1).toFixed(2)},${(latN+1).toFixed(2)},${(lonN+1).toFixed(2)}`;
      return `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(`box:${b} q:">C"`)}`;
    },
    () => {
      const b = `${(latN-3).toFixed(2)},${(lonN-3).toFixed(2)},${(latN+3).toFixed(2)},${(lonN+3).toFixed(2)}`;
      return `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(`box:${b}`)}`;
    },
    () => `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent('cnt:china q:A')}`,
    () => `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent('gen:Pycnonotus cnt:china')}`
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      const url = strategies[i]();
      const xcRes = await fetch(url, {
        headers: { 'User-Agent': 'HuaXinFeng/1.0 (flower-season-map)' },
        signal: AbortSignal.timeout(8000)
      });

      if (!xcRes.ok) continue;

      const data = await xcRes.json();
      const recordings = (data.recordings || [])
        .filter(r => {
          if (!r.file) return false;
          const u = r.file.startsWith('//') ? 'https:' + r.file : r.file;
          if (!u.startsWith('https://')) return false;
          const lenSec = parseDuration(r.length);
          return lenSec >= 5 && lenSec <= 180;
        });

      if (recordings.length === 0) continue;

      const shuffled = recordings.sort(() => Math.random() - 0.5).slice(0, 5);

      const results = shuffled.map(r => ({
        id: r.id,
        url: r.file.startsWith('//') ? 'https:' + r.file : r.file,
        bird: r.en || '',
        birdCn: r.en && r.gen && r.sp
          ? `${r.en} (${r.gen} ${r.sp})`
          : (r.en || r.gen || '鸟鸣'),
        location: r.loc || '—',
        recordist: r.rec || '—',
        length: r.length || '—',
        license: r.lic || 'CC'
      }));

      return res.status(200).json({
        region,
        strategy: i + 1,
        count: results.length,
        results
      });

    } catch (e) {
      continue;
    }
  }

  return res.status(200).json({
    region,
    count: 0,
    results: [],
    fallback: true
  });
}

function parseDuration(s) {
  if (!s) return 0;
  const parts = String(s).split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parseInt(s) || 0;
}
