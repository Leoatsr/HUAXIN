import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';

// 样式
import './styles/tokens.css';
import './styles/app.css';

// 数据 + 工具
import { FLORA } from './data/flora.js';
import { enrichFlora, getSeason } from './utils/phenology.js';
import { read, write, usePersistedState } from './utils/storage.js';
import { trackCheckin, trackAddToTrip, trackNavToMap, trackScreenView } from './utils/analytics.js';
import { syncCheckinsToReports } from './utils/bloom-feedback.js';
import { fetchAllRegionGDD, reenrichWithWeather } from './utils/weather.js';
import { setScreenMeta, setSpotMeta } from './utils/meta.js';

// UI
import { TopBar } from './ui/TopBar.jsx';

// 浮动组件（不大，同步加载）
import { MusicPlayer } from './components/MusicPlayer.jsx';
// NatureAmbient 已整合进 SpotDetail · 不再全局浮动
import { AlertBanner } from './components/AlertBanner.jsx';
import { OnboardingGuide } from './components/OnboardingGuide.jsx';
import { LangSwitcher } from './components/LangSwitcher.jsx';
import { WeatherBadge, LoadingIndicator } from './components/StateViews.jsx';
import { FeedbackButton } from './components/FeedbackWidget.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { OfflineIndicator } from './components/OfflineIndicator.jsx';

// i18n
import { LangProvider } from './utils/i18n-context.jsx';

// ═══ 主 4 tab 同步加载（首屏/核心） ═══
import { Landing } from './screens/Landing.jsx';
import { MapWorkspace } from './screens/MapWorkspace.jsx';
import { HuaxinPanel } from './screens/HuaxinPanel.jsx';
import { MoodPanel } from './screens/MoodPanel.jsx';
import { MoodHub } from './screens/MoodHub.jsx';
import { DiaryPanel } from './screens/DiaryPanel.jsx';
import { DiaryHub } from './screens/DiaryHub.jsx';
import { WrappedPanel } from './screens/WrappedPanel.jsx';
import { ReverencePanel } from './screens/ReverencePanel.jsx';
import { PoemDiscoveryPanel } from './screens/PoemDiscoveryPanel.jsx';
import { PoetFootprintPanel } from './screens/PoetFootprintPanel.jsx';
import { PoetNetworkPanel } from './screens/PoetNetworkPanel.jsx';
import { PoetryHub } from './screens/PoetryHub.jsx';

// ═══ 扩展面板懒加载（首次进入才下载对应代码） ═══
const WikiPanel = lazy(() => import('./screens/WikiPanel.jsx').then(m => ({ default: m.WikiPanel })));
const PoemPanel = lazy(() => import('./screens/PoemPanel.jsx').then(m => ({ default: m.PoemPanel })));
const CalendarPanel = lazy(() => import('./screens/CalendarPanel.jsx').then(m => ({ default: m.CalendarPanel })));
const DashboardPanel = lazy(() => import('./screens/DashboardPanel.jsx').then(m => ({ default: m.DashboardPanel })));
const TripPanel = lazy(() => import('./screens/TripPanel.jsx').then(m => ({ default: m.TripPanel })));
const AIPanel = lazy(() => import('./screens/AIPanel.jsx').then(m => ({ default: m.AIPanel })));
const RecommendPanel = lazy(() => import('./screens/RecommendPanel.jsx').then(m => ({ default: m.RecommendPanel })));
const FeedPanel = lazy(() => import('./screens/FeedPanel.jsx').then(m => ({ default: m.FeedPanel })));
const CrowdPanel = lazy(() => import('./screens/CrowdPanel.jsx').then(m => ({ default: m.CrowdPanel })));
const PuzzlePanel = lazy(() => import('./screens/PuzzlePanel.jsx').then(m => ({ default: m.PuzzlePanel })));
const SubscriptionPanel = lazy(() => import('./screens/SubscriptionPanel.jsx').then(m => ({ default: m.SubscriptionPanel })));
const DailyCheckinPanel = lazy(() => import('./screens/DailyCheckinPanel.jsx').then(m => ({ default: m.DailyCheckinPanel })));

// ═══ 模态组件懒加载（触发才加载） ═══
const TravelGuide = lazy(() => import('./components/TravelGuide.jsx').then(m => ({ default: m.TravelGuide })));
const SpotShareCard = lazy(() => import('./components/ShareCards.jsx').then(m => ({ default: m.SpotShareCard })));
const MoodShareCard = lazy(() => import('./components/ShareCards.jsx').then(m => ({ default: m.MoodShareCard })));
const LoginPanel = lazy(() => import('./components/AuthComponents.jsx').then(m => ({ default: m.LoginPanel })));

// UserMenu 要立即可见（TopBar 上），同步加载
import { UserMenu } from './components/AuthComponents.jsx';

// ═══════════════════════════════════════════════════════════════
// LazyFallback · Suspense 兜底 · 复用 LoadingIndicator（花瓣摇曳）
// ═══════════════════════════════════════════════════════════════
function LazyFallback() {
  return <LoadingIndicator size="full" hint="花 事 载 入 中"/>;
}

// ═══════════════════════════════════════════════════════════════
// Error Boundary · 从原 App.jsx 保留
// ═══════════════════════════════════════════════════════════════
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[花信风]', error, info); }
  reset = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', padding: 20
        }}>
          <div className="card" style={{ maxWidth: 400, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🌸</div>
            <div className="serif" style={{ fontSize: 18, marginTop: 12 }}>花事暂时遇到问题</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8,
              fontFamily: 'var(--font-mono)' }}>
              {this.state.error?.message || '未知错误'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn zhusha" onClick={this.reset}>重试</button>
              <button className="btn" onClick={() => window.location.reload()}>刷新</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════
// 核心应用
// ═══════════════════════════════════════════════════════════════
function AppCore() {
  // 所有景点数据 - 先用静态 FAT 即时渲染，后台异步拉真实天气增强
  const baseFlora = useMemo(() => enrichFlora(FLORA), []);
  const [flora, setFlora] = useState(baseFlora);
  const [weatherStatus, setWeatherStatus] = useState('idle'); // idle | loading | ok | fallback

  // 首次挂载时异步拉真实天气增强积温
  useEffect(() => {
    let cancelled = false;
    setWeatherStatus('loading');
    fetchAllRegionGDD()
      .then((result) => {
        if (cancelled) return;
        if (result.successCount === 0 && !result.fromCache) {
          setWeatherStatus('fallback');
          return;
        }
        const enhanced = reenrichWithWeather(baseFlora, result.data);
        setFlora(enhanced);
        setWeatherStatus('ok');
      })
      .catch(() => {
        if (!cancelled) setWeatherStatus('fallback');
      });
    return () => { cancelled = true; };
  }, [baseFlora]);

  // 全局状态
  const savedNav = read('nav') || {};
  const [screen, setScreen] = useState(savedNav.screen || 'landing');
  const [selectedId, setSelectedId] = useState(savedNav.sel || null);
  const [season, setSeason] = useState(() => read('season') || getSeason());
  const [favs, setFavs] = usePersistedState('favs', {});
  const [checkins, setCheckins] = usePersistedState('checkins', {});
  const [trip, setTrip] = usePersistedState('trip', []);

  // 花种筛选（用于从百科/诗词跳到地图时 only 显示某花种）
  const [speciesFilter, setSpeciesFilter] = useState(null);
  // 百科打开时定位到哪个花种
  const [wikiInitialSp, setWikiInitialSp] = useState(null);

  // 新手引导 + 入境指南
  const [onboarded, setOnboarded] = usePersistedState('onboarded', false);
  const [seniorMode, setSeniorMode] = usePersistedState('seniorMode', false);

  // 长辈模式 · 切 html data 属性 · 配合 CSS 全局放大字号 / 简化 UI
  useEffect(() => {
    if (seniorMode) {
      document.documentElement.setAttribute('data-senior', 'true');
    } else {
      document.documentElement.removeAttribute('data-senior');
    }
  }, [seniorMode]);
  const [showTravelGuide, setShowTravelGuide] = useState(false);

  // 用户系统
  const [user, setUser] = useState(() => read('userProfile'));
  const [showLogin, setShowLogin] = useState(false);

  // 分享卡
  const [shareSpot, setShareSpot] = useState(null);  // 传入 spot 对象
  const [shareMood, setShareMood] = useState(null);  // 传入 mood card

  // 引导高亮 · 引导跳转后在 SpotDetail 显示"为你挑的"4.5s
  const [justOnboardedSpot, setJustOnboardedSpot] = useState(null);

  // 设置面板
  const [showSettings, setShowSettings] = useState(false);

  // 动态更新页面 meta（SPA 内部导航时 title / og:title 同步）
  useEffect(() => {
    if (screen === 'map' && selectedId) {
      const spot = flora.find(f => f.id === selectedId);
      if (spot) { setSpotMeta(spot); return; }
    }
    setScreenMeta(screen);
  }, [screen, selectedId, flora]);

  // 季节切换时更新 body 属性 → 触发 CSS 主题
  useEffect(() => { document.body.dataset.season = season; }, [season]);
  useEffect(() => { write('season', season); }, [season]);

  // 持久化导航
  useEffect(() => { write('nav', { screen, sel: selectedId }); }, [screen, selectedId]);

  // ═══ Hash-based routing ═══ 保留原功能：分享链接
  useEffect(() => {
    const parseHash = () => {
      const m = window.location.hash.match(/^#\/spot\/(\d+)/);
      if (m) {
        const id = Number(m[1]);
        const spot = flora.find(f => f.id === id);
        if (spot) {
          setSelectedId(id);
          if (screen === 'landing') setScreen('map');
        }
      }
    };
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [flora]); // eslint-disable-line

  useEffect(() => {
    if (!selectedId) return;
    const target = '#/spot/' + selectedId;
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target);
    }
    const spot = flora.find(f => f.id === selectedId);
    if (spot) {
      document.title = `${spot.n} · ${spot.sp} · 花信风`;
    }
  }, [selectedId, flora]);

  // ═══ 全局键盘快捷键 ═══
  // 1-5: 切换主 tab · D=概览 · W=百科 · P=诗词 · C=日历 · Esc=返回地图
  useEffect(() => {
    const handler = (e) => {
      // 忽略在 input/textarea 中的按键
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const map = {
        '1': 'map', '2': 'huaxin', '3': 'mood', '4': 'diary',
        'd': 'dashboard', 'D': 'dashboard',
        'w': 'wiki', 'W': 'wiki',
        'p': 'poem', 'P': 'poem',
        'c': 'calendar', 'C': 'calendar',
        't': 'trip', 'T': 'trip',
        'a': 'ai', 'A': 'ai',
        'r': 'recommend', 'R': 'recommend',
        'f': 'feed', 'F': 'feed',
        's': 'crowd', 'S': 'crowd',
        'g': 'puzzle', 'G': 'puzzle',
        'b': 'subscribe', 'B': 'subscribe',
        'k': 'checkin', 'K': 'checkin',
        'h': 'landing', 'H': 'landing'
      };
      if (map[e.key]) {
        e.preventDefault();
        setScreen(map[e.key]);
        if (map[e.key] === 'landing') setSelectedId(null);
        if (map[e.key] !== 'map') setSpeciesFilter(null);
      }
      if (e.key === 'Escape' && screen !== 'map' && screen !== 'landing') {
        setScreen('map');
        setSpeciesFilter(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  // ═══ 动作 ═══
  const toggleFav = (id) => {
    setFavs(prev => {
      const n = { ...prev };
      if (n[id]) delete n[id]; else n[id] = true;
      return n;
    });
  };

  const doCheckin = (id, note = '', bloom = null) => {
    const spot = flora.find(f => f.id === id);
    const ts = Date.now();
    setCheckins(prev => ({
      ...prev,
      [id]: {
        date: new Date().toLocaleDateString('zh-CN'),
        ts,
        note,
        bloom
      }
    }));
    // 同步到 bloomReports · 用于可信度
    if (bloom) {
      const all = read('bloomReports') || {};
      const list = all[id] || [];
      list.push({ bloom, ts, source: 'checkin' });
      all[id] = list;
      write('bloomReports', all);
    }
    trackCheckin({ spotId: id, species: spot?.sp, hasNote: !!note, bloom });
  };

  const toggleTrip = (id) => {
    setTrip(prev => {
      const isIn = prev.includes(id);
      const next = isIn ? prev.filter(x => x !== id) : [...prev, id];
      trackAddToTrip({ spotId: id, action: isIn ? 'remove' : 'add', tripSize: next.length });
      return next;
    });
  };

  // ═══ 扩展面板导航 ═══ 已接入的真跳转 / 未接入的提示
  const onNavExtra = (panelKey, spot) => {
    if (panelKey === 'wiki') {
      // 旧 · 独立百科屏 · 现跳花签 hub 内的百科 tab
      setWikiInitialSp(spot?.sp || null);
      setScreen('mood');
      // tab 切换需要改 MoodHub 支持 initialTab · 后续支持（先跳到 mood 看基础）
      return;
    }
    if (panelKey === 'poem') {
      setScreen('poem');
      return;
    }
    if (panelKey === 'calendar') {
      // 旧 · 独立日历屏 · 现跳花历 hub 内的日历 tab
      setScreen('diary');
      return;
    }
    if (panelKey === 'dashboard') {
      setScreen('dashboard');
      return;
    }
    if (panelKey === 'trip') {
      setScreen('trip');
      return;
    }
    if (panelKey === 'ai') {
      setScreen('ai');
      return;
    }
    if (panelKey === 'recommend') {
      setScreen('recommend');
      return;
    }
    if (panelKey === 'feed') {
      setScreen('feed');
      return;
    }
    if (panelKey === 'crowd') {
      setScreen('crowd');
      return;
    }
    if (panelKey === 'puzzle') {
      setScreen('puzzle');
      return;
    }
    if (panelKey === 'subscribe') {
      setScreen('subscribe');
      return;
    }
    if (panelKey === 'checkin') {
      setScreen('checkin');
      return;
    }
    if (panelKey === 'reverence') {
      setScreen('reverence');
      return;
    }
    if (panelKey === 'poetry') {
      setScreen('poetry');
      return;
    }
    if (panelKey === 'discovery' || panelKey === 'footprint' || panelKey === 'poetNetwork') {
      // 旧入口统一跳 poetry hub
      setScreen('poetry');
      return;
    }
    // 其他未接入的
    alert(`「${panelKey}」此模块暂未接入。`);
  };

  // ═══ 跳回地图并只显示某花种 ═══
  const gotoFlower = (sp) => {
    setSpeciesFilter(sp);
    setScreen('map');
  };

  // ═══ 屏幕切换 ═══
  const navTo = (s) => {
    const prev = screen;
    setScreen(s);
    if (s === 'landing') setSelectedId(null);
    // 离开 map 时清除花种筛选
    if (s !== 'map') setSpeciesFilter(null);
    trackScreenView({ screen: s, prevScreen: prev });
  };

  return (
    <>
      {/* 首次访问的新手引导 */}
      {!onboarded && screen !== 'landing' && (
        <OnboardingGuide
          flora={flora}
          onComplete={() => setOnboarded(true)}
          onJumpToSpot={(id) => {
            setSelectedId(id);
            setScreen('map');
            setJustOnboardedSpot(id);
            // 5 秒后清空 · 避免下次用户再点同一景点还高亮
            setTimeout(() => setJustOnboardedSpot(null), 5500);
          }}
        />
      )}

      {screen !== 'landing' && (
        <TopBar
          screen={screen}
          onNav={navTo}
          season={season}
          onSeasonChange={setSeason}
          onSettings={() => setShowSettings(true)}
          musicSlot={<MusicPlayer anchor="topbar"/>}
          rightSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <WeatherBadge status={weatherStatus}/>
              <UserMenu
                user={user}
                onLogout={() => { setUser(null); write('userProfile', null); }}
                onShowDiary={() => navTo('diary')}
                onShowLogin={() => setShowLogin(true)}
              />
              <LangSwitcher onTravelGuide={() => setShowTravelGuide(true)}/>
            </div>
          }
        />
      )}

      {/* 花期提醒横幅 · 仅在地图屏显示 */}
      {screen === 'map' && (
        <AlertBanner flora={flora}
          onGoSpot={(id) => { if (id) setSelectedId(id); }}/>
      )}

      <div key={screen} style={{ paddingTop: screen === 'landing' ? 0 : 46 }} className="hx-enter">
        <Suspense fallback={<LazyFallback/>}>
        {screen === 'landing' && (
          <Landing
            onEnter={() => navTo('map')}
            onNavTo={navTo}
          />
        )}
        {screen === 'map' && (
          <MapWorkspace
            flora={flora}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            favs={favs}
            toggleFav={toggleFav}
            checkins={checkins}
            doCheckin={doCheckin}
            trip={trip}
            toggleTrip={toggleTrip}
            speciesFilter={speciesFilter}
            clearSpeciesFilter={() => setSpeciesFilter(null)}
            onNavExtra={onNavExtra}
            onShareSpot={setShareSpot}
            highlightSpotId={justOnboardedSpot}
          />
        )}
        {screen === 'huaxin' && (
          <HuaxinPanel
            flora={flora}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
          />
        )}
        {screen === 'mood' && (
          <MoodHub
            flora={flora}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onShareMood={setShareMood}
            onGotoFlower={gotoFlower}
            initialTab={wikiInitialSp ? 'wiki' : 'mood'}
            initialSp={wikiInitialSp}
          />
        )}
        {screen === 'diary' && (
          <DiaryHub
            flora={flora}
            checkins={checkins}
            favs={favs}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onGotoFlower={gotoFlower}
            onGoWrapped={() => navTo('wrapped')}
          />
        )}
        {screen === 'wrapped' && (
          <WrappedPanel
            flora={flora}
            checkins={checkins}
            favs={favs}
            onBack={() => navTo('diary')}
          />
        )}
        {screen === 'reverence' && (
          <ReverencePanel
            onBack={() => navTo('map')}
          />
        )}
        {screen === 'discovery' && (
          <PoemDiscoveryPanel
            flora={flora}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => {
              setSelectedId(id);
              trackNavToMap({ from: 'discovery', spotId: id });
              setScreen('map');
            }}
          />
        )}
        {screen === 'poetry' && (
          <PoetryHub
            flora={flora}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => {
              setSelectedId(id);
              trackNavToMap({ from: 'poetry', spotId: id });
              setScreen('map');
            }}
          />
        )}
        {screen === 'footprint' && (
          <PoetFootprintPanel
            flora={flora}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => {
              setSelectedId(id);
              trackNavToMap({ from: 'footprint', spotId: id });
              setScreen('map');
            }}
            onGoNetwork={() => navTo('poetNetwork')}
          />
        )}
        {screen === 'poetNetwork' && (
          <PoetNetworkPanel
            onBack={() => navTo('footprint')}
            onSelectPoet={(poetId) => { navTo('footprint'); /* TODO: 能传选中诗人 */ }}
          />
        )}
        {screen === 'wiki' && (
          <WikiPanel
            flora={flora}
            initialSp={wikiInitialSp}
            onBack={() => navTo('map')}
            onGotoFlower={gotoFlower}
          />
        )}
        {screen === 'poem' && (
          <PoemPanel
            flora={flora}
            onBack={() => navTo('map')}
            onGotoFlower={gotoFlower}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onGoDiscovery={() => navTo('discovery')}
          />
        )}
        {screen === 'calendar' && (
          <CalendarPanel
            flora={flora}
            onBack={() => navTo('map')}
            onGotoFlower={gotoFlower}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
          />
        )}
        {screen === 'dashboard' && (
          <DashboardPanel
            flora={flora}
            checkins={checkins}
            favs={favs}
            onBack={() => navTo('map')}
            onGotoFlower={gotoFlower}
            onNavToDiary={() => navTo('diary')}
          />
        )}
        {screen === 'trip' && (
          <TripPanel
            flora={flora}
            trip={trip}
            setTrip={setTrip}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onClearAll={() => setTrip([])}
          />
        )}
        {screen === 'ai' && (
          <AIPanel
            flora={flora}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onGotoFlower={gotoFlower}
          />
        )}
        {screen === 'recommend' && (
          <RecommendPanel
            flora={flora}
            favs={favs}
            checkins={checkins}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
            onGotoFlower={gotoFlower}
          />
        )}
        {screen === 'feed' && (
          <FeedPanel
            flora={flora}
            checkins={checkins}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
          />
        )}
        {screen === 'crowd' && (
          <CrowdPanel
            flora={flora}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
          />
        )}
        {screen === 'puzzle' && (
          <PuzzlePanel
            flora={flora}
            checkins={checkins}
            onBack={() => navTo('map')}
            onGotoFlower={gotoFlower}
          />
        )}
        {screen === 'subscribe' && (
          <SubscriptionPanel
            flora={flora}
            favs={favs}
            onBack={() => navTo('map')}
            onSelectSpot={(id) => { setSelectedId(id); trackNavToMap({ from: screen, spotId: id }); setScreen('map'); }}
          />
        )}
        {screen === 'checkin' && (
          <DailyCheckinPanel
            onBack={() => navTo('map')}
          />
        )}
        </Suspense>
      </div>

      {/* 模态组件也懒加载 · 包 Suspense */}
      <Suspense fallback={null}>
        {showTravelGuide && (
          <TravelGuide onClose={() => setShowTravelGuide(false)}/>
        )}
        {showLogin && (
          <LoginPanel
            onLogin={(u) => setUser(u)}
            onClose={() => setShowLogin(false)}
          />
        )}
        {shareSpot && (
          <SpotShareCard
            spot={shareSpot}
            onClose={() => setShareSpot(null)}
          />
        )}
        {shareMood && (
          <MoodShareCard
            card={shareMood}
            onClose={() => setShareMood(null)}
          />
        )}
      </Suspense>

      {/* 全局浮动组件 · 非落地页时可见 */}
      {screen !== 'landing' && (
        <>
          <FeedbackButton/>
          <OfflineIndicator/>
        </>
      )}

      {/* 设置面板 */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        seniorMode={seniorMode}
        onToggleSenior={() => setSeniorMode(v => !v)}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <AppCore/>
      </LangProvider>
    </ErrorBoundary>
  );
}
