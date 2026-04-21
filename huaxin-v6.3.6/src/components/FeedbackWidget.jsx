import React, { useState } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { EmptyState, ErrorInline } from './StateViews.jsx';
import { read, write } from '../utils/storage.js';
import { trackFeedbackSubmit, trackShare } from '../utils/analytics.js';

/* ═══════════════════════════════════════════════════════════════
   FeedbackWidget · 用户反馈收集 · 三合一
   ───────────────────────────────────────────────────────────────
   · 反馈表（本地存储 + 可选跳 Tally.so）
   · 一键分享到微信（生成分享文案 + 复制）
   · 感谢早期用户的仪式感
   
   设计哲学：
   - 花信风是「内容型产品」· 反馈比代码更重要
   - 0 用户阶段 · 反馈就是产品的生命线
   - 收集所有反馈到 localStorage · 用户可导出
   ═══════════════════════════════════════════════════════════════ */


export function FeedbackModal({ open, onClose }) {
  const [tab, setTab] = useState('feedback'); // feedback | share | thanks
  const [text, setText] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const submit = () => {
    setError(null);
    if (!text.trim()) {
      setError('请写点什么吧 · 哪怕一个字');
      return;
    }
    try {
      const list = read('feedbacks') || [];
      list.push({
        text: text.trim(),
        contact: contact.trim(),
        ts: Date.now(),
        ua: navigator.userAgent.slice(0, 100)
      });
      write('feedbacks', list);
      trackFeedbackSubmit({ textLength: text.trim().length, hasContact: !!contact.trim() });
      setSubmitted(true);
      setText('');
      setContact('');
      setTimeout(() => {
        setSubmitted(false);
        setTab('thanks');
      }, 1200);
    } catch (e) {
      setError('保存失败 · 请稍后重试');
    }
  };

  const shareText = `【花信风】一款基于中国传统物候学的智能赏花地图 · 24番花信风 · 408景点 · 74花种 · 每一场花事都有最美时节\n\n立即访问 → https://shihua.vercel.app/`;

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      trackShare({ target: 'text_copy' });
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setError('复制失败 · 请手动长按选中文字');
    }
  };

  const exportFeedbacks = () => {
    const list = read('feedbacks') || [];
    if (list.length === 0) return;
    const text = list.map((f, i) =>
      `#${i + 1} · ${new Date(f.ts).toLocaleString('zh-CN')}\n${f.text}${f.contact ? '\n联系：' + f.contact : ''}`
    ).join('\n\n───────────\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      onClick={onClose}
      className="hx-modal-enter"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 480, width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: 'var(--shadow-lg, 0 20px 60px rgba(0,0,0,.25))'
        }}>

        {/* 头部 */}
        <div style={{
          padding: '20px 24px 14px',
          borderBottom: '1px solid var(--line-2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
        }}>
          <div>
            <div className="cn-caps">花友之声 · 开发者亲览</div>
            <div className="serif" style={{
              fontSize: 22,
              letterSpacing: '0.2em',
              marginTop: 4,
              color: 'var(--ink)'
            }}>
              {tab === 'thanks' ? '谢 · 意' : '留 · 言'}
            </div>
          </div>
          <button onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: 'var(--ink-3)', padding: 4
            }}>×</button>
        </div>

        {/* Tab 切换 */}
        {tab !== 'thanks' && (
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--line-2)'
          }}>
            {[
              { key: 'feedback', label: '留 言' },
              { key: 'share',    label: '分 享' }
            ].map(t => (
              <button key={t.key}
                onClick={() => { setTab(t.key); setError(null); }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid var(--zhusha)' : '2px solid transparent',
                  color: tab === t.key ? 'var(--zhusha)' : 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  letterSpacing: '0.2em',
                  transition: 'var(--t-button)'
                }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: '20px 24px 24px' }}>
          {/* ═══ 留言 Tab ═══ */}
          {tab === 'feedback' && !submitted && (
            <>
              <div className="serif" style={{
                fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 14
              }}>
                花信风还是一枝独开的幼苗 · 你是最早的花友。<br/>
                遇见什么问题、想要什么功能、觉得哪里好看或丑 · 都可以告诉我。<br/>
                <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                  所有留言保存在你的浏览器里 · 你可以随时导出复制给我
                </span>
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="比如：梅花山景点找不到 · 希望加入杜鹃花 · 动效好看 · 按钮太小点不到 · 建议添加..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elev)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: 'var(--ink)',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--zhusha)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />

              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="可选 · 微信号/邮箱 · 方便我回复你"
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '10px 12px',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elev)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--ink)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--zhusha)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />

              {error && (
                <div style={{ marginTop: 12 }}>
                  <ErrorInline message={error} dismiss={() => setError(null)}/>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn zhusha" onClick={submit}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  <Icon.share/> 递上这一笔
                </button>
                {(read('feedbacks') || []).length > 0 && (
                  <button className="btn" onClick={exportFeedbacks}>
                    {copied ? '已复制' : '导出所有留言'}
                  </button>
                )}
              </div>

              <div style={{
                marginTop: 12, fontSize: 10, color: 'var(--ink-3)',
                textAlign: 'center', letterSpacing: '0.1em'
              }}>
                你已写 {(read('feedbacks') || []).length} 条留言
              </div>
            </>
          )}

          {tab === 'feedback' && submitted && (
            <EmptyState
              variant="inline"
              symbol="🌸"
              title="收到"
              sub="每一字每一句，都会被认真看到"
            />
          )}

          {/* ═══ 分享 Tab ═══ */}
          {tab === 'share' && (
            <>
              <div className="serif" style={{
                fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.9, marginBottom: 14
              }}>
                如果你觉得花信风还有点意思 · 分享给一个爱花的朋友。<br/>
                <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                  每多一位花友 · 就多一份让这个产品活下去的动力
                </span>
              </div>

              {/* 预览文案 */}
              <div style={{
                padding: 14,
                background: 'var(--bg-elev)',
                border: '1px solid var(--line)',
                borderLeft: '2px solid var(--zhusha)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                lineHeight: 1.9,
                color: 'var(--ink-2)',
                whiteSpace: 'pre-wrap',
                marginBottom: 14
              }}>
                {shareText}
              </div>

              {error && (
                <div style={{ marginBottom: 12 }}>
                  <ErrorInline message={error} dismiss={() => setError(null)}/>
                </div>
              )}

              <button className="btn zhusha" onClick={copyShare}
                style={{ width: '100%', justifyContent: 'center' }}>
                <Icon.share/>
                {copied ? '已复制 · 去朋友圈粘贴' : '复制分享文案'}
              </button>

              <div style={{
                marginTop: 12, fontSize: 11, color: 'var(--ink-3)',
                textAlign: 'center', lineHeight: 1.8
              }}>
                复制后 · 粘贴到微信 / 朋友圈 / 小红书 / 微博
              </div>
            </>
          )}

          {/* ═══ 谢意 Tab ═══ */}
          {tab === 'thanks' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 56, opacity: 0.5, marginBottom: 16 }}>🙏</div>
              <div className="serif" style={{
                fontSize: 16,
                lineHeight: 2.0,
                color: 'var(--ink-2)',
                letterSpacing: '0.05em'
              }}>
                花信风还很年轻，<br/>
                有时粗糙、有时笨拙 ——<br/>
                但因你的留言而生长。
              </div>
              <div className="serif" style={{
                fontSize: 12,
                color: 'var(--ink-3)',
                marginTop: 18,
                letterSpacing: '0.2em'
              }}>
                — 开 发 者 敬 上 —
              </div>
              <button className="btn" onClick={() => setTab('feedback')}
                style={{ marginTop: 22 }}>
                再留一笔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   FeedbackButton · 浮动按钮 · 放在屏幕角落
   ═══════════════════════════════════════════════════════════════ */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="留言 / 分享"
        style={{
          position: 'fixed',
          left: 20,
          bottom: 20,
          zIndex: 30,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--zhusha)',
          color: 'var(--paper)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(160,48,28,.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          transition: 'var(--t-button)',
          animation: 'hx-breathe 3s ease-in-out infinite'
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >✍</button>

      <FeedbackModal open={open} onClose={() => setOpen(false)}/>
    </>
  );
}
