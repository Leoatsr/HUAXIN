import React from 'react';
import './marketing/landing.css';
import { Nav, Hero, HuaxinSection, PillarsSection } from './marketing/sections-1.jsx';
import { MapSection, HuaqianSection, WikiSection, DiarySection, DownloadCTA, Footer } from './marketing/sections-2.jsx';

/* ═══════════════════════════════════════════════════════════════
   Landing · Marketing 落地页（从 Claude Design handoff 迁移）
   9 段滚动 · 点 Nav "进入" / Hero "入山" / DownloadCTA "入山寻花" 都跳 app
   "今日得签" 按钮跳 app 的 mood 屏
   ═══════════════════════════════════════════════════════════════ */
export function Landing({ onEnter, onNavTo }) {
  const season = getCurrentSeason();

  // "今日得签" → 跳花签屏
  const enterMood = () => {
    if (onNavTo) onNavTo('mood');
    else if (onEnter) onEnter();
  };

  return (
    <div className="hx-landing-root">
      <Nav season={season} onEnter={onEnter}/>
      <Hero season={season} onEnter={onEnter} onEnterMood={enterMood}/>
      <HuaxinSection/>
      <PillarsSection/>
      <MapSection season={season}/>
      <HuaqianSection/>
      <WikiSection/>
      <DiarySection/>
      <DownloadCTA season={season} onEnter={onEnter}/>
      <Footer season={season}/>
    </div>
  );
}

// 按月份推断当前季节
function getCurrentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}
