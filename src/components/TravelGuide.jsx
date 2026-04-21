import React from 'react';
import { Icon } from '../ui/atoms.jsx';

/* ═══════════════════════════════════════════════════════════════
   入境赏花指南 · 给外国游客看的
   - Modal 弹窗形式
   - 7 个核心主题：签证 / 支付 / 交通 / APP / 路线 / 紧急 / 实用中文
   - 双语对照（中文 + English）
   ═══════════════════════════════════════════════════════════════ */
export function TravelGuide({ lang = 'zh', onClose }) {
  const isZh = lang === 'zh';

  const sections = [
    {
      icon: '✈️',
      title: isZh ? '签证与入境' : 'Visa & Entry',
      body: isZh
        ? '中国对多国实施 144 小时 / 72 小时过境免签。2024 年起，法国、德国、意大利、荷兰、西班牙、马来西亚、泰国等多国公民可免签入境。请查阅中国国家移民管理局最新政策。'
        : 'China offers 144h/72h visa-free transit for many countries. Since 2024, citizens of France, Germany, Italy, Netherlands, Spain, Malaysia, Thailand and others can enter visa-free. Check the National Immigration Administration for the latest policy.'
    },
    {
      icon: '💳',
      title: isZh ? '支付方式' : 'Payment',
      body: isZh
        ? '景区门票可用支付宝 / 微信支付（绑定境外 Visa / Mastercard 即可使用）。也可用现金人民币。部分景区支持信用卡。建议提前下载支付宝 App。'
        : 'Use Alipay / WeChat Pay (link your Visa/Mastercard). Cash RMB also accepted. Some spots take credit cards. Download Alipay app beforehand for best experience.'
    },
    {
      icon: '🚄',
      title: isZh ? '交通指南' : 'Transportation',
      body: isZh
        ? '高铁覆盖全国主要城市（12306.cn 购票，支持外国护照）。花季热门线路：上海 → 杭州(45min) → 婺源(2h) → 黄山(1h)。建议使用高德地图导航。'
        : 'High-speed rail connects major cities (book on 12306.cn with passport). Popular flower routes: Shanghai → Hangzhou (45 min) → Wuyuan (2 h) → Huangshan (1 h). Use Amap or Baidu Maps for navigation.'
    },
    {
      icon: '📱',
      title: isZh ? '必备 APP' : 'Essential Apps',
      body: isZh
        ? '支付宝（支付 + 翻译）、高德地图（导航）、12306（火车票）、携程（酒店 + 门票）、谷歌翻译离线包。中国可正常使用这些 APP。'
        : 'Alipay (payment + translate), Amap (navigation), 12306 (trains), Trip.com (hotels), Google Translate offline pack. All work normally in China.'
    },
    {
      icon: '🌸',
      title: isZh ? '最佳赏花路线' : 'Best Flower Routes',
      body: isZh
        ? '春：洛阳牡丹 → 西安樱花 → 林芝桃花（3-4 月）\n夏：伊犁薰衣草 → 青海湖油菜花（6-7 月）\n秋：北京香山红叶 → 九寨沟彩林（10 月）\n冬：南京梅花 → 昆明冬樱花（12-2 月）'
        : 'Spring: Luoyang Peony → Xi\'an Cherry → Linzhi Peach (Mar-Apr)\nSummer: Yili Lavender → Qinghai Lake Rapeseed (Jun-Jul)\nAutumn: Beijing Red Leaves → Jiuzhaigou (Oct)\nWinter: Nanjing Plum → Kunming Winter Cherry (Dec-Feb)'
    },
    {
      icon: '🆘',
      title: isZh ? '紧急联系' : 'Emergency',
      body: isZh
        ? '报警：110 · 急救：120 · 火警：119\n旅游投诉：12345\n外交部全球领保：+86-10-12308'
        : 'Police: 110 · Ambulance: 120 · Fire: 119\nTourism hotline: 12345\nConsular protection: +86-10-12308'
    },
    {
      icon: '🗣',
      title: isZh ? '实用花卉中文' : 'Useful Flower Chinese',
      body: isZh
        ? 'Cherry Blossom = 樱花 (yīng huā)\nPeach = 桃花 (táo huā)\nPeony = 牡丹 (mǔ dān)\nPlum = 梅花 (méi huā)\nLotus = 荷花 (hé huā)\nMaple = 红枫 (hóng fēng)\nGinkgo = 银杏 (yín xìng)\nLavender = 薰衣草 (xūn yī cǎo)\nRapeseed = 油菜花 (yóu cài huā)\nWhere is...? = ...在哪里？(zài nǎ lǐ?)'
        : 'Cherry Blossom = 樱花 (yīng huā)\nPeach = 桃花 (táo huā)\nPeony = 牡丹 (mǔ dān)\nPlum = 梅花 (méi huā)\nLotus = 荷花 (hé huā)\nMaple = 红枫 (hóng fēng)\nGinkgo = 银杏 (yín xìng)\nLavender = 薰衣草 (xūn yī cǎo)\nRapeseed = 油菜花 (yóu cài huā)\nWhere is...? = ...在哪里？(zài nǎ lǐ?)'
    }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'color-mix(in oklch, var(--ink) 55%, transparent)',
      backdropFilter: 'blur(6px)',
      padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(20px, 3vw, 30px)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--bg-sunk)', border: 'none',
          cursor: 'pointer', color: 'var(--ink-3)',
          width: 28, height: 28, borderRadius: '50%',
          display: 'grid', placeItems: 'center'
        }}>
          <Icon.close/>
        </button>

        <div className="cn-caps">China · 入境赏花</div>
        <div className="serif" style={{
          fontSize: 'clamp(22px, 3vw, 28px)',
          letterSpacing: '0.15em',
          marginTop: 6, marginBottom: 18,
          color: 'var(--ink)'
        }}>
          🌏 {isZh ? '入境赏花指南' : 'China Flower Travel Guide'}
        </div>

        {sections.map((s, i) => (
          <div key={i} style={{
            marginBottom: 12,
            padding: 'clamp(12px, 2vw, 16px)',
            background: 'var(--bg)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div className="serif" style={{
              fontSize: 15, color: 'var(--ink)',
              marginBottom: 6, letterSpacing: '0.05em'
            }}>
              {s.icon} {s.title}
            </div>
            <div style={{
              fontSize: 13, color: 'var(--ink-2)',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-serif)'
            }}>{s.body}</div>
          </div>
        ))}

        <div className="mono" style={{
          textAlign: 'center',
          fontSize: 10, color: 'var(--ink-3)',
          marginTop: 10, letterSpacing: '0.15em'
        }}>
          huaxinfeng · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
