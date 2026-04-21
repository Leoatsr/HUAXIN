import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { HUAXIN_24, currentHouIndex } from '../data/huaxin.js';

/* ═══════════════════════════════════════════════════════════════
   AI 赏花助手（本地规则引擎 · 无真 LLM 调用）
   识别意图：花种 / 区域 / 时节 / 推荐 / 寒暄 / 帮助
   每条回复都附带真实数据和可点击的景点卡
   ═══════════════════════════════════════════════════════════════ */
export function AIPanel({ flora, onBack, onSelectSpot, onGotoFlower }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '你好，我是花信风助手。可以问我「附近有什么花」、「什么时候去看樱花」、「带娃推荐去哪」等。试试输入花种、时间或区域吧。',
      spots: []
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // ═══ 意图识别 ═══
  const understand = (q) => {
    const text = q.trim();
    if (!text) return null;

    // 1. 寒暄
    if (/^(你好|hi|hello|嗨|在吗|早安|晚安)/i.test(text)) {
      return {
        text: '你好呀，今日花事正佳。问我想看什么花、哪天去、去哪里都行～',
        spots: []
      };
    }

    // 2. 帮助
    if (/帮助|help|怎么用|能做什么/.test(text)) {
      return {
        text: '我能帮你：\n· 找花：输入"樱花"/"牡丹"等\n· 推荐：输入"带娃"/"适合拍照"/"周末近郊"\n· 节气：输入"清明能看什么"/"现在看什么"\n· 地区：输入"北京"/"江南"/"西南"',
        spots: []
      };
    }

    // 3. 当前时节
    if (/现在|今|当前|此刻|这段时间|这个时候/.test(text)) {
      const { jq, hou, totalIdx } = currentHouIndex();
      if (jq >= 0) {
        const currentFlower = HUAXIN_24[jq].f[hou];
        const relevant = flora
          .filter(f => f._st && f._st.l >= 3)
          .slice(0, 4);
        return {
          text: `此刻是${HUAXIN_24[jq].jq}${['初','二','三'][hou]}候，花信为「${currentFlower}」。以下是全国正在盛花/初花的景点：`,
          spots: relevant
        };
      }
    }

    // 4. 推荐类意图
    const recommendIntents = [
      { pat: /带娃|孩子|家庭|亲子/, rule: (f) => f.rg === '华北' || f.rg === '华东', label: '带娃推荐交通便利、人流缓的城市公园' },
      { pat: /拍照|出片|摄影|好看|上镜/, rule: (f) => ['樱花','桃花','油菜花','梨花','牡丹','三角梅','薰衣草','银杏','红枫'].includes(f.sp), label: '最出片的花种' },
      { pat: /小众|冷门|人少|避开|清静/, rule: (f) => ['西藏','西北','西南'].includes(f.rg), label: '西部高原人少花美' },
      { pat: /周末|短途|近郊/, rule: (f) => f._pred && f._pred.daysUntil <= 7 && f._pred.daysUntil >= -3, label: '这周刚好花期的景点' },
      { pat: /浪漫|约会/, rule: (f) => ['樱花','梅花','桃花','薰衣草','紫藤','蔷薇','海棠花'].includes(f.sp), label: '浪漫之花' },
    ];
    for (const intent of recommendIntents) {
      if (intent.pat.test(text)) {
        const picks = flora.filter(intent.rule).slice(0, 4);
        return {
          text: `${intent.label}。为你挑了这几处：`,
          spots: picks
        };
      }
    }

    // 5. 地区查询
    const regionKeys = [
      ['华北', ['华北','北京','天津','河北','山西','内蒙']],
      ['华东', ['华东','上海','江苏','浙江','安徽','福建','山东','南京','苏州','杭州']],
      ['华中', ['华中','湖北','湖南','河南','江西','武汉','洛阳']],
      ['华南', ['华南','广东','广西','海南','广州','深圳','厦门']],
      ['西南', ['西南','四川','云南','贵州','重庆','成都','昆明']],
      ['西北', ['西北','陕西','甘肃','青海','宁夏','新疆','西安','伊犁']],
      ['东北', ['东北','辽宁','吉林','黑龙江','大连','长春']],
      ['西藏', ['西藏','拉萨','林芝']]
    ];
    for (const [rg, keywords] of regionKeys) {
      if (keywords.some(k => text.includes(k))) {
        const picks = flora.filter(f => f.rg === rg).slice(0, 6);
        return {
          text: `${rg}共有 ${flora.filter(f => f.rg === rg).length} 处花事，为你推荐这几个：`,
          spots: picks
        };
      }
    }

    // 6. 花种查询
    const matchedSpecies = new Set();
    flora.forEach(f => {
      if (text.includes(f.sp)) matchedSpecies.add(f.sp);
    });
    if (matchedSpecies.size > 0) {
      const sp = [...matchedSpecies][0];
      const picks = flora
        .filter(f => f.sp === sp)
        .sort((a, b) => (b._st?.l || 0) - (a._st?.l || 0))
        .slice(0, 4);
      return {
        text: `${sp}全国有 ${flora.filter(f => f.sp === sp).length} 处可赏。推荐：`,
        spots: picks,
        followupSp: sp
      };
    }

    // 7. 节气查询
    const jiePoints = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
    for (const jie of jiePoints) {
      if (text.includes(jie)) {
        const huaxinJq = HUAXIN_24.find(h => h.jq === jie);
        if (huaxinJq) {
          return {
            text: `「${jie}」三候之花信：${huaxinJq.f.join('、')}。现时正可访以下景点：`,
            spots: flora
              .filter(f => huaxinJq.f.some(hf => f.sp.includes(hf) || hf.includes(f.sp)))
              .slice(0, 4)
          };
        }
      }
    }

    // 8. 兜底
    return {
      text: '没完全理解。试试这样问：「想看樱花」「周末去哪」「北京附近」「清明能看什么」',
      spots: []
    };
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q) return;
    const userMsg = { role: 'user', text: q };
    const resp = understand(q);
    const aiMsg = { role: 'assistant', ...resp };
    setMessages(ms => [...ms, userMsg, aiMsg]);
    setInput('');
  };

  const quickAsks = [
    '现在能看什么花',
    '周末带娃去哪',
    '推荐出片的景点',
    '樱花在哪看',
    '北京附近'
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader
        eyebrow="问答 · 花事助理"
        title="花 事 助 理"
        sub="本地规则解答 · 不依赖联网"
        onBack={onBack}
      />

      {/* 消息区 */}
      <div ref={scrollRef}
        style={{
          flex: 1, overflow: 'auto',
          padding: '0 clamp(24px, 5vw, 48px) 20px',
          maxHeight: 'calc(100vh - 46px - 260px)'
        }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              {m.role === 'user' ? (
                <div style={{
                  display: 'flex', justifyContent: 'flex-end'
                }}>
                  <div style={{
                    background: 'var(--ink)', color: 'var(--bg)',
                    padding: '10px 16px',
                    borderRadius: '14px 14px 2px 14px',
                    maxWidth: '75%',
                    fontSize: 13,
                    lineHeight: 1.6
                  }}>{m.text}</div>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'var(--zhusha)', color: 'var(--paper)',
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--font-serif)', fontSize: 11
                    }}>花</div>
                    <span className="cn-caps">花事助理</span>
                  </div>
                  <div style={{
                    background: 'var(--bg-elev)',
                    border: '1px solid var(--line)',
                    padding: '14px 18px',
                    borderRadius: '2px 14px 14px 14px',
                    maxWidth: '85%',
                    fontSize: 13,
                    lineHeight: 1.9,
                    whiteSpace: 'pre-line',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-serif)'
                  }}>{m.text}</div>
                  {m.spots && m.spots.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 8, marginTop: 10, maxWidth: '85%'
                    }}>
                      {m.spots.map(s => (
                        <button key={s.id}
                          onClick={() => onSelectSpot && onSelectSpot(s.id)}
                          style={{
                            padding: '10px 12px',
                            background: 'var(--bg-elev)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer', textAlign: 'left'
                          }}>
                          <div className="serif" style={{ fontSize: 13 }}>{s.n}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                            {s.sp} · {s._st?.st || s.rg}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {m.followupSp && onGotoFlower && (
                    <button className="btn sm ghost" onClick={() => onGotoFlower(m.followupSp)}
                      style={{ marginTop: 8 }}>
                      看全部 {m.followupSp} 景点 <Icon.chev/>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 输入区 + 快捷问 */}
      <div style={{
        padding: '16px clamp(24px, 5vw, 48px)',
        borderTop: '1px solid var(--line-2)',
        background: 'var(--bg-elev)'
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {quickAsks.map(q => (
              <button key={q} onClick={() => {
                setInput(q);
                setTimeout(() => {
                  const resp = understand(q);
                  setMessages(ms => [...ms,
                    { role: 'user', text: q },
                    { role: 'assistant', ...resp }
                  ]);
                  setInput('');
                }, 50);
              }} className="btn sm ghost" style={{ fontSize: 11 }}>
                {q}
              </button>
            ))}
          </div>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 14px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg)'
          }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="问我想看什么花..."
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink)'
              }}/>
            <button className="btn sm zhusha" onClick={handleSend} disabled={!input.trim()}>
              <Icon.chev/> 问
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
