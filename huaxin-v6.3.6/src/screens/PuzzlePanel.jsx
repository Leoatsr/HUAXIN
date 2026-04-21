import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '../ui/atoms.jsx';
import { ScreenHeader } from '../components/ScreenHeader.jsx';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   花卉拼图 · 3x3 滑块拼图
   - 用花卉百科中的 74 种花做题库
   - 每次随机选一种花，把它的象征性图案（SVG 花瓣）打散
   - 用户移动滑块复原
   - 完成后记录到 localStorage
   ═══════════════════════════════════════════════════════════════ */

// 7 种花的代表色（用于 SVG 花瓣）
const FLOWER_COLORS = {
  '梅花':   '#f8d0d8',
  '桃花':   '#f8b0c8',
  '樱花':   '#fce4ec',
  '牡丹':   '#e868a0',
  '荷花':   '#f5a0b8',
  '菊花':   '#f8e080',
  '杜鹃花': '#e04070',
  '油菜花': '#f5d030',
  '梨花':   '#fafafa',
  '兰花':   '#e8c8e8',
  '紫藤':   '#9868c0',
  '海棠花': '#f090a8'
};

const SIZE = 3;  // 3x3
const TOTAL = SIZE * SIZE;

// 生成乱序的数组（确保有解）
function shuffleTiles() {
  // 从已解初始态开始做大量合法移动 → 保证有解
  const tiles = Array.from({ length: TOTAL }, (_, i) => i);
  let empty = TOTAL - 1;
  for (let n = 0; n < 80; n++) {
    const neighbors = [];
    const row = Math.floor(empty / SIZE);
    const col = empty % SIZE;
    if (row > 0) neighbors.push(empty - SIZE);
    if (row < SIZE - 1) neighbors.push(empty + SIZE);
    if (col > 0) neighbors.push(empty - 1);
    if (col < SIZE - 1) neighbors.push(empty + 1);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[empty], tiles[pick]] = [tiles[pick], tiles[empty]];
    empty = pick;
  }
  return { tiles, emptyIdx: empty };
}

function isSolved(tiles) {
  return tiles.every((v, i) => v === i);
}

export function PuzzlePanel({ flora, checkins, onBack, onGotoFlower }) {
  // 可玩花种 = 用户至少打卡过的花种 + 常见花（保底）
  const playableSpecies = useMemo(() => {
    const myFlowers = new Set();
    Object.keys(checkins).forEach(id => {
      const s = flora.find(f => f.id === Number(id));
      if (s && FLOWER_COLORS[s.sp]) myFlowers.add(s.sp);
    });
    // 保底：前 8 种最常见花
    const defaults = ['梅花','桃花','樱花','牡丹','菊花','梨花','荷花','兰花'];
    defaults.forEach(sp => myFlowers.add(sp));
    return [...myFlowers];
  }, [flora, checkins]);

  const [currentSp, setCurrentSp] = useState(playableSpecies[0] || '梅花');
  const [puzzle, setPuzzle] = useState(shuffleTiles);
  const [moves, setMoves] = useState(0);
  const [startTs, setStartTs] = useState(Date.now());
  const [solved, setSolved] = useState(false);
  const [bestStats, setBestStats] = useState(() => read('puzzleBest') || {});

  // 检查完成
  useEffect(() => {
    if (isSolved(puzzle.tiles) && !solved) {
      setSolved(true);
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      const key = currentSp;
      const prev = bestStats[key];
      if (!prev || elapsed < prev.time || moves < prev.moves) {
        const next = { ...bestStats, [key]: { time: elapsed, moves } };
        setBestStats(next);
        write('puzzleBest', next);
      }
    }
  }, [puzzle]);  // eslint-disable-line

  const newGame = (sp = currentSp) => {
    setCurrentSp(sp);
    setPuzzle(shuffleTiles());
    setMoves(0);
    setStartTs(Date.now());
    setSolved(false);
  };

  // 移动滑块
  const handleTileClick = (idx) => {
    if (solved) return;
    const { emptyIdx } = puzzle;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const eRow = Math.floor(emptyIdx / SIZE);
    const eCol = emptyIdx % SIZE;
    const isAdjacent = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
    if (!isAdjacent) return;
    const newTiles = [...puzzle.tiles];
    [newTiles[idx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[idx]];
    setPuzzle({ tiles: newTiles, emptyIdx: idx });
    setMoves(m => m + 1);
  };

  const color = FLOWER_COLORS[currentSp] || 'var(--zhusha)';
  const elapsed = solved
    ? Math.floor((Date.now() - startTs) / 1000)
    : null;

  // 渲染完整花 SVG（用于参考和完成图）
  const FlowerSVG = ({ size = 300 }) => (
    <svg viewBox="0 0 300 300" style={{ width: size, height: size }}>
      <defs>
        <radialGradient id="petalGrad">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </radialGradient>
      </defs>
      {/* 5 花瓣 */}
      {[0, 72, 144, 216, 288].map(deg => (
        <ellipse key={deg}
          cx="150" cy="80" rx="42" ry="68"
          fill="url(#petalGrad)"
          transform={`rotate(${deg} 150 150)`}
          opacity="0.9"/>
      ))}
      {/* 花心 */}
      <circle cx="150" cy="150" r="28" fill="#f8e080"/>
      <circle cx="150" cy="150" r="14" fill="#ffb060"/>
      {/* 小花蕊 */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <circle key={deg}
          cx="150" cy="130" r="3"
          fill="#8a5028"
          transform={`rotate(${deg} 150 150)`}/>
      ))}
      {/* 叶子 */}
      <ellipse cx="60" cy="240" rx="35" ry="12" fill="#4a8050" opacity="0.7" transform="rotate(-25 60 240)"/>
      <ellipse cx="240" cy="245" rx="35" ry="12" fill="#4a8050" opacity="0.7" transform="rotate(25 240 245)"/>
    </svg>
  );

  // 拼图单格
  const renderTile = (idx) => {
    const tileValue = puzzle.tiles[idx];
    const isEmpty = idx === puzzle.emptyIdx;
    if (isEmpty) {
      return <div style={{ background: 'var(--bg-sunk)' }}/>;
    }
    // tileValue 在完整图中所在位置
    const origRow = Math.floor(tileValue / SIZE);
    const origCol = tileValue % SIZE;
    const pct = (SIZE / 1) * 100;
    return (
      <button
        onClick={() => handleTileClick(idx)}
        style={{
          width: '100%', height: '100%',
          padding: 0, border: '1px solid var(--line-2)',
          borderRadius: 2, overflow: 'hidden',
          cursor: 'pointer',
          background: 'var(--bg-elev)',
          position: 'relative'
        }}>
        <div style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: `${pct}%`,
            height: `${pct}%`,
            top: `-${origRow * 100}%`,
            left: `-${origCol * 100}%`,
            transform: `translate(0, 0)`
          }}>
            <FlowerSVG size={200}/>
          </div>
        </div>
      </button>
    );
  };

  const best = bestStats[currentSp];

  return (
    <div style={{ minHeight: 'calc(100vh - 46px)', background: 'var(--bg)' }}>
      <ScreenHeader
        eyebrow="花事消遣 · 九宫一花"
        title="花 卉 拼 图"
        sub="3×3 滑块 · 复原一朵花"
        onBack={onBack}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        padding: '0 clamp(24px, 5vw, 48px) 48px',
        maxWidth: 1000, margin: '0 auto'
      }}>
        {/* ─── 左：拼图区 ─── */}
        <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
          {/* 状态条 */}
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="cn-caps">当前 · {currentSp}</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-2)' }}>
              <div>
                <div className="cn-caps" style={{ fontSize: 9 }}>步 数</div>
                <div className="serif" style={{ fontSize: 18, color: 'var(--zhusha)', lineHeight: 1 }}>
                  {moves}
                </div>
              </div>
              {best && (
                <div>
                  <div className="cn-caps" style={{ fontSize: 9 }}>最 佳</div>
                  <div className="serif" style={{ fontSize: 14, color: 'var(--jin)', lineHeight: 1 }}>
                    {best.moves} 步
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 拼图网格 */}
          <div style={{
            position: 'relative',
            aspectRatio: '1',
            maxWidth: 360,
            margin: '0 auto',
            padding: 4,
            background: 'var(--bg-sunk)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${SIZE}, 1fr)`,
              gap: 4,
              width: '100%', height: '100%'
            }}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i}>{renderTile(i)}</div>
              ))}
            </div>

            {/* 胜利覆盖层 */}
            {solved && (
              <div style={{
                position: 'absolute', inset: 4,
                background: 'color-mix(in oklch, var(--bg-elev) 90%, transparent)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                animation: 'hx-shake 600ms ease'
              }}>
                <FlowerSVG size={140}/>
                <div className="serif" style={{
                  fontSize: 22, letterSpacing: '0.15em',
                  color: 'var(--zhusha)', marginTop: 12
                }}>{currentSp} · 已 复 原</div>
                <div className="mono" style={{
                  fontSize: 12, color: 'var(--ink-2)', marginTop: 6
                }}>
                  {moves} 步 · {elapsed} 秒
                </div>
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn primary" onClick={() => newGame()}>
              <Icon.sparkle/> 重 开
            </button>
            {solved && onGotoFlower && (
              <button className="btn zhusha" onClick={() => onGotoFlower(currentSp)}>
                <Icon.pin/> 去看 {currentSp}
              </button>
            )}
          </div>
        </div>

        {/* ─── 右：花种选择 + 排行 ─── */}
        <div>
          <div className="card" style={{ padding: 'clamp(20px, 3vw, 24px)', marginBottom: 14 }}>
            <div className="cn-caps" style={{ marginBottom: 12 }}>换 花 ·  题 库</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: 6
            }}>
              {playableSpecies.map(sp => (
                <button key={sp}
                  onClick={() => newGame(sp)}
                  className="btn sm"
                  style={{
                    background: sp === currentSp ? 'var(--zhusha)' : 'transparent',
                    color: sp === currentSp ? 'var(--paper)' : 'var(--ink-2)',
                    borderColor: sp === currentSp ? 'var(--zhusha)' : 'var(--line)',
                    fontFamily: 'var(--font-serif)',
                    justifyContent: 'center'
                  }}>{sp}</button>
              ))}
            </div>
          </div>

          {/* 最佳记录 */}
          <div className="card paper-bg" style={{ padding: 'clamp(20px, 3vw, 24px)' }}>
            <div className="cn-caps" style={{ marginBottom: 12 }}>最 佳 战 绩</div>
            {Object.keys(bestStats).length === 0 && (
              <div style={{ color: 'var(--ink-3)', fontSize: 12, padding: '16px 0', textAlign: 'center' }}>
                还没有记录 · 复原一朵花试试
              </div>
            )}
            {Object.entries(bestStats)
              .sort((a, b) => a[1].moves - b[1].moves)
              .map(([sp, stat]) => (
                <div key={sp} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px dotted var(--line)',
                  fontSize: 12
                }}>
                  <span className="serif">{sp}</span>
                  <span className="mono" style={{ color: 'var(--ink-3)' }}>
                    {stat.moves} 步 · {stat.time} 秒
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
