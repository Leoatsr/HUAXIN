/* ═══════════════════════════════════════════════════════════════
   花信风 · 统一埋点 API
   ───────────────────────────────────────────────────────────────
   · 所有 track 调用都走这一个文件 · 便于集中管理 + 测试
   · 包装 window._hxTrack（在 index.html 里定义 · 自动转发到 GA4）
   · 加 track_ts 时间戳 · dev 模式输出到控制台
   · 所有事件都带 fail-safe · 失败不影响主流程

   事件清单：
     · onboarding_complete   引导流完成
     · like_post             花事圈点赞/取消
     · checkin_spot          打卡景点
     · add_to_trip           加入行程
     · share_spot            分享景点/分享文案
     · feedback_submit       反馈提交
     · navigate_to_map       其他屏跳地图（流量分发）
     · screen_view           屏切换（自动）
     · outbound_click        外链点击（自动）
   ═══════════════════════════════════════════════════════════════ */

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

/* 底层 · 调用 window._hxTrack · 该函数会自动 fan out 到 GA4/Umami/PostHog */
function track(eventName, params = {}) {
  try {
    const payload = {
      ...params,
      track_ts: Date.now()
    };
    if (IS_DEV) {
      // 开发调试 · 彩色输出
      console.log(
        `%c📊 ${eventName}`,
        'color: #a0301c; font-weight: bold;',
        payload
      );
    }
    if (typeof window !== 'undefined' && typeof window._hxTrack === 'function') {
      window._hxTrack(eventName, payload);
    }
  } catch (e) {
    // 埋点失败不能影响主流程
    if (IS_DEV) console.warn('[analytics] track failed:', e);
  }
}

/* ═══ 7 个关键业务事件 ═══ */

/**
 * 引导流结束
 * @param {string} status - 'complete' / 'skip' / 'auto'
 * @param {number} durationMs - 从打开到结束花了多少 ms
 * @param {string} locSource - 'gps' / 'ip' / 'default'
 */
export function trackOnboardingComplete({ status = 'complete', durationMs, locSource } = {}) {
  track('onboarding_complete', {
    status,
    duration_ms: durationMs,
    location_source: locSource
  });
}

/**
 * 花事圈点赞/取消
 * @param {string|number} postId
 * @param {boolean} liked - true = 点赞, false = 取消
 * @param {number} spotId - 对应的景点 id
 */
export function trackLikePost({ postId, liked, spotId } = {}) {
  track('like_post', {
    post_id: postId,
    action: liked ? 'like' : 'unlike',
    spot_id: spotId
  });
}

/**
 * 打卡景点
 */
export function trackCheckin({ spotId, species, hasNote } = {}) {
  track('checkin_spot', {
    spot_id: spotId,
    species,
    has_note: !!hasNote
  });
}

/**
 * 加入/移出行程
 */
export function trackAddToTrip({ spotId, action = 'add', tripSize } = {}) {
  track('add_to_trip', {
    spot_id: spotId,
    action,            // 'add' or 'remove'
    trip_size: tripSize
  });
}

/**
 * 分享景点 / 分享文案 / 分享卡
 * @param {string} target - 'card' / 'text_copy' / 'amap' / 'wechat_hint'
 */
export function trackShare({ target, spotId, species } = {}) {
  track('share_spot', {
    target,
    spot_id: spotId,
    species
  });
}

/**
 * 用户提交反馈
 * @param {number} textLength
 * @param {boolean} hasContact
 */
export function trackFeedbackSubmit({ textLength, hasContact } = {}) {
  track('feedback_submit', {
    text_length: textLength,
    has_contact: !!hasContact
  });
}

/**
 * 地图跳转 · 从其他屏跳入 MapWorkspace
 * @param {string} from - 来源屏（wiki / poem / huaxin / calendar / feed / recommend 等）
 */
export function trackNavToMap({ from, spotId, speciesFilter } = {}) {
  track('navigate_to_map', {
    from,
    spot_id: spotId,
    species_filter: speciesFilter
  });
}

/**
 * 快捷花期报告（闭环数据）
 * @param {string|number} spotId
 * @param {string} bloom - 'bud' / 'early' / 'peak' / 'late' / 'past'
 * @param {string} source - 'quick' / 'checkin'
 */
export function trackBloomReport({ spotId, bloom, source } = {}) {
  track('bloom_report', {
    spot_id: spotId,
    bloom,
    source
  });
}

/* ═══ 自动事件 · 不需要业务代码额外调用 ═══ */

/**
 * 屏切换 · 在 navTo 里自动调用
 */
export function trackScreenView({ screen, prevScreen } = {}) {
  track('screen_view', {
    screen_name: screen,
    prev_screen: prevScreen
  });
  // 同时发给 GA4 的标准 page_view
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: screen,
      page_location: `${window.location.origin}/#/${screen}`
    });
  }
}

/**
 * 外链点击 · 用于 TravelTools 高德/百度/小红书等跳转
 */
export function trackOutboundClick({ url, label } = {}) {
  track('outbound_click', {
    url,
    label  // 'amap' / 'baidu' / 'xhs' / 'weather' / 'ctrip' / 'dianping' 等
  });
}
