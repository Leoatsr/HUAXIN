import React, { useMemo, useState } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { EmptyState } from '../components/StateViews.jsx';
import { SpotImage } from '../components/SpotImage.jsx';
import { read, write } from '../utils/storage.js';
import { trackLikePost } from '../utils/analytics.js';
import { DEMO_POSTS } from '../data/demo-posts.js';

/* ═══════════════════════════════════════════════════════════════
   花事圈 · 雅集示范 + 用户打卡
   ───────────────────────────────────────────────────────────────
   · 上方：用户自己的打卡动态（localStorage checkins）
   · 下方：20 条精心策划的雅集示范（明确标注）
   · 每条含配图（SpotImage）· 古诗引用 · 节气时序 · 雅号署名
   · 本地点赞（"赏"· 类似雅集的赞同）
   ═══════════════════════════════════════════════════════════════ */
export function FeedPanel({ flora, checkins, onBack, onSelectSpot }) {
  const [likedIds, setLikedIds] = useState(() => read('feedLikes') || {});

  const toggleLike = (postId, spotId) => {
    setLikedIds(prev => {
      const next = { ...prev };
      const willLike = !next[postId];
      if (next[postId]) delete next[postId]; else next[postId] = true;
      write('feedLikes', next);
      trackLikePost({ postId, liked: willLike, spotId });
      return next;
    });
  };

  // 用户自己的打卡 → 转换成 post 格式
  const myPosts = useMemo(() => {
    return Object.entries(checkins)
      .map(([id, ck]) => {
        const spot = flora.find(f => f.id === Number(id));
        if (!spot || !ck.ts) return null;
        const daysAgo = Math.floor((Date.now() - ck.ts) / 86400000);
        return {
          postId: `my-${id}`,
          author: '我',
          avatar: '己',
          spotId: Number(id),
          spot,
          note: ck.note || `在${spot.n}遇见${spot.sp}，如约而至。`,
          likes: 0,
          daysAgo: Math.max(0, daysAgo),
          isMine: true
        };
      })
      .filter(Boolean);
  }, [flora, checkins]);

  // 示范动态 → 附带 spot 对象
  const demoPosts = useMemo(() => {
    return DEMO_POSTS
      .map((p, i) => {
        const spot = flora.find(f => f.id === p.spotId);
        if (!spot) return null;
        return { ...p, spot, postId: `demo-${i}`, isDemo: true };
      })
      .filter(Boolean);
  }, [flora]);

  const timeLabel = (d) => {
    if (d === 0) return '今日';
    if (d === 1) return '昨日';
    if (d < 7) return `${d} 日前`;
    if (d < 30) return `${Math.floor(d / 7)} 旬前`;
    if (d < 365) return `${Math.floor(d / 30)} 月前`;
    return `${Math.floor(d / 365)} 载前`;
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="花友雅集 · 花事即景"
        title="花 事 圈"
        sub={<>{myPosts.length} 条你的 · {demoPosts.length} 条雅集示范</>}
        onBack={onBack}
      />

      {/* 示范内容说明 · 顶部横幅 */}
      <div style={{
        padding: '12px clamp(24px, 5vw, 48px)',
        maxWidth: 760, margin: '0 auto',
        display: 'flex', alignItems: 'flex-start', gap: 12
      }}>
        <div style={{
          flex: 1,
          padding: '10px 14px',
          background: 'color-mix(in oklch, var(--jin) 8%, var(--bg-elev))',
          border: '1px solid color-mix(in oklch, var(--jin) 25%, transparent)',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          color: 'var(--ink-2)',
          lineHeight: 1.7,
          letterSpacing: '0.05em'
        }}>
          <span className="serif" style={{ color: 'var(--jin)', fontWeight: 600 }}>【雅集示范】</span>
          以下内容由编辑精心撰写，为你呈现花事圈的模样。
          当真实花友入席后，此处将由你们的花事笔记填满——你的打卡、手札、花签，都会在此成册。
        </div>
      </div>

      {/* Feed · 用户打卡优先 */}
      <div style={{
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        maxWidth: 760, margin: '0 auto'
      }}>
        {/* 自己的 */}
        {myPosts.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <div className="cn-caps" style={{
              marginBottom: 14,
              color: 'var(--jin)',
              letterSpacing: '0.15em'
            }}>◇ 我 的 花 事 · {myPosts.length} 条 ◇</div>
            {myPosts.map(p => (
              <PostCard key={p.postId} post={p}
                liked={likedIds[p.postId]}
                onToggleLike={() => toggleLike(p.postId, p.spotId)}
                onSpotClick={() => onSelectSpot && onSelectSpot(p.spotId)}
                timeLabel={timeLabel}/>
            ))}
          </div>
        )}

        {/* 示范 */}
        <div>
          <div className="cn-caps" style={{
            marginBottom: 14,
            letterSpacing: '0.15em'
          }}>◇ 雅 集 示 范 · {demoPosts.length} 条 ◇</div>
          {demoPosts.map(p => (
            <PostCard key={p.postId} post={p}
              liked={likedIds[p.postId]}
              onToggleLike={() => toggleLike(p.postId, p.spotId)}
              onSpotClick={() => onSelectSpot && onSelectSpot(p.spotId)}
              timeLabel={timeLabel}/>
          ))}
        </div>

        {myPosts.length === 0 && (
          <EmptyState
            variant="inline"
            symbol="◇"
            title="尚未留下你的花事"
            sub="在地图上点「到此一游」写一笔"
          />
        )}
      </div>
    </div>
  );
}

/* ═══ PostCard · 单条动态 ═══ */
function PostCard({ post, liked, onToggleLike, onSpotClick, timeLabel }) {
  const p = post;
  const s = p.spot;

  return (
    <div style={{
      marginBottom: 18,
      background: 'var(--bg-elev)',
      border: '1px solid var(--line)',
      borderLeft: p.isMine
        ? '3px solid var(--jin)'
        : '3px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      transition: 'var(--t-card)'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
    }}>

      {/* 配图（示范用真实花种图 · 我的打卡也展示） */}
      <button onClick={onSpotClick}
        style={{
          display: 'block', width: '100%',
          border: 'none', cursor: 'pointer', padding: 0,
          background: 'transparent'
        }}>
        <SpotImage
          species={s.sp}
          name={s.n}
          hashSeed={s.id}
          aspect="16/9"
          style={{ borderRadius: 0 }}
        />
      </button>

      <div style={{ padding: 'clamp(16px, 2vw, 20px)' }}>
        {/* 作者 + 节气时序 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 4,
            background: p.isMine ? 'var(--jin)' : 'var(--zhusha)',
            color: 'var(--paper)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0,
            boxShadow: '0 2px 6px rgba(160,48,28,.25)',
            transform: 'rotate(-2deg)'
          }}>{p.avatar}</div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{
              fontSize: 14, color: 'var(--ink)',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}>
              {p.author}
              {p.isMine && <span style={{
                marginLeft: 8, fontSize: 9,
                padding: '1px 6px',
                background: 'var(--jin)',
                color: 'var(--paper)',
                borderRadius: 2,
                letterSpacing: '0.1em'
              }}>自己</span>}
              {p.isDemo && <span style={{
                marginLeft: 8, fontSize: 9,
                color: 'var(--ink-3)',
                fontStyle: 'italic',
                letterSpacing: '0.1em'
              }}>示 范</span>}
            </div>
            <div className="mono" style={{
              fontSize: 10, color: 'var(--ink-3)',
              marginTop: 2, letterSpacing: '0.08em'
            }}>
              {p.solarTerm || timeLabel(p.daysAgo)} · {s.rg}
            </div>
          </div>
        </div>

        {/* 景点 chip */}
        <button onClick={onSpotClick}
          style={{
            width: '100%', padding: '9px 12px',
            background: 'var(--bg)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius-sm, 6px)',
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 14,
            fontFamily: 'var(--font-serif)'
          }}>
          <span style={{ color: 'var(--zhusha)', fontSize: 13 }}>◆</span>
          <span style={{ fontSize: 13, flex: 1, color: 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.n}</span>
          <span className="pill zhusha">{s.sp}</span>
        </button>

        {/* 正文 · 手札 */}
        <div className="serif" style={{
          fontSize: 14, lineHeight: 2.0,
          color: 'var(--ink)', letterSpacing: '0.03em'
        }}>
          {p.note}
        </div>

        {/* 古诗引用 · 示范才有 */}
        {p.quote && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            borderLeft: '2px solid var(--jin)',
            background: 'color-mix(in oklch, var(--jin) 4%, var(--bg-sunk))',
            fontStyle: 'italic',
            fontFamily: 'var(--font-serif)'
          }}>
            <div style={{
              fontSize: 13, color: 'var(--ink-2)',
              letterSpacing: '0.1em', lineHeight: 1.7
            }}>「{p.quote}」</div>
            <div style={{
              fontSize: 11, color: 'var(--jin)',
              marginTop: 4, letterSpacing: '0.12em'
            }}>— {p.quoteAuthor}</div>
          </div>
        )}

        {/* 操作条 */}
        <div style={{
          display: 'flex', gap: 20, marginTop: 14,
          paddingTop: 12, borderTop: '1px dotted var(--line-2)',
          fontSize: 12, color: 'var(--ink-3)'
        }}>
          <button onClick={onToggleLike}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: liked ? 'var(--zhusha)' : 'var(--ink-3)',
              padding: 0, display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.1em',
              transition: 'color var(--dur-normal) var(--ease-out)'
            }}>
            <span key={liked ? 'on' : 'off'} className={liked ? 'hx-pop' : ''} style={{ display: 'inline-block' }}>
              {liked ? '◉' : '◎'}
            </span>
            <span> 赏 · {p.likes + (liked ? 1 : 0)}</span>
          </button>
          <div style={{ flex: 1 }}/>
          <button onClick={onSpotClick}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-3)',
              fontSize: 11, padding: 0,
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.1em'
            }}>
            访此地 →
          </button>
        </div>
      </div>
    </div>
  );
}
