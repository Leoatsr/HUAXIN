// 花信风 · localStorage 统一封装
// 键名保持和原 App.jsx 一致，升级后旧用户数据不丢失

const KEYS = {
  favs:      'hx.favs',       // 收藏 { [spotId]: true }
  checkins:  'checkins',      // 打卡 { [spotId]: { date, ts, note } } — 保留原键名
  trip:      'hx.trip',       // 行程 [spotId, ...]
  user:      'user_profile',  // 用户 { name, avatar... }
  subs:      'bloom_subs',    // 订阅 [{ spotId, ... }]
  lang:      'hx.lang',       // 语言 zh/en/...
  season:    'hx.season',     // 手动选季 spring/.../auto
  nav:       'hx-nav',        // { screen, sel }
  lastMood:  'hx.lastMood'    // 今日抽签日期
};

export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(KEYS[key] || key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(KEYS[key] || key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(KEYS[key] || key);
    return true;
  } catch {
    return false;
  }
}

// React hook: 持久化 state
import { useState, useEffect } from 'react';

export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    const v = read(key);
    return v == null ? initialValue : v;
  });
  useEffect(() => { write(key, state); }, [key, state]);
  return [state, setState];
}
