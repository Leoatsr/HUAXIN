import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18N } from '../data/i18n.js';

/* ═══════════════════════════════════════════════════════════════
   LangContext - 全局语言状态
   - localStorage key: 'hx.lang'
   - 默认 zh
   - 对外暴露 { lang, setLang, t } 接口
   - t(key) 返回当前语言对应字串，找不到回退到 zh
   ═══════════════════════════════════════════════════════════════ */

export const LangContext = createContext({
  lang: 'zh',
  setLang: () => {},
  t: (k) => k
});

const STORAGE_KEY = 'hx.lang';

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && I18N[saved]) return saved;
    } catch {}
    // 首次默认用浏览器语言
    const bl = navigator.language.slice(0, 2).toLowerCase();
    return I18N[bl] ? bl : 'zh';
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
    // 同步 html 标签 lang 属性利于 SEO 和字体
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key) => {
    const dict = I18N[lang] || I18N.zh;
    return dict[key] || I18N.zh[key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
