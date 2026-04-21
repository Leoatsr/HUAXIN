/* ═══════════════════════════════════════════════════════════════
   坐标系转换
   ───────────────────────────────────────────────────────────────
   中国地图领域有 3 套坐标系：
     · WGS-84   国际标准 · GPS 原始 · Google Maps 境外 · 苹果地图
     · GCJ-02   中国「火星坐标」· 高德、腾讯、Google Maps 中国
     · BD-09    百度专用 · 在 GCJ-02 基础上再加密

   不转换会导致偏移 50-500 米 · 点击跳转后位置错位

   花信风 FLORA 数据的 lat/lon 按 WGS-84 原始 GPS 记录
   需要按目标地图转换

   算法是业界标准公式 · 非逆向
   ═══════════════════════════════════════════════════════════════ */

const a = 6378245.0;
const ee = 0.00669342162296594323;
const PI = 3.14159265358979324;
const xPI = PI * 3000.0 / 180.0;

function outOfChina(lng, lat) {
  return !(lng > 72.004 && lng < 137.8347 && lat > 0.8293 && lat < 55.8271);
}

function transformLat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

/* WGS-84 → GCJ-02 · 高德/腾讯/Google 中国所需 */
export function wgs84ToGcj02(lng, lat) {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
  return [lng + dLng, lat + dLat];
}

/* GCJ-02 → BD-09 · 百度所需 */
export function gcj02ToBd09(lng, lat) {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPI);
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
}

/* WGS-84 → BD-09 · 便捷链式 */
export function wgs84ToBd09(lng, lat) {
  const [gLng, gLat] = wgs84ToGcj02(lng, lat);
  return gcj02ToBd09(gLng, gLat);
}
