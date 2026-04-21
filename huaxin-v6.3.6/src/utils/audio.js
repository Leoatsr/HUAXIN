// 花信风 · 音频合成工具
// 使用浏览器原生 Web Audio API，零依赖

// ═══════════════════════════════════════════════════════════════
// AudioContext 单例 + 混响卷积
// ═══════════════════════════════════════════════════════════════
let _ac = null;
let _rev = null;

export function getAC() {
  if (!_ac) {
    _ac = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ac;
}

export function getRev() {
  if (!_rev) {
    const ac = getAC();
    _rev = ac.createConvolver();
    // 生成 2 秒的脉冲响应作为混响
    const len = ac.sampleRate * 2;
    const imp = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    _rev.buffer = imp;
    _rev.connect(ac.destination);
  }
  return _rev;
}

// ═══════════════════════════════════════════════════════════════
// 播放一个音符 · 带包络、chorus、立体声、混响
// freq: 频率, dur: 秒, type: oscillator 波形, vol: 音量 0-1, pan: -1~1
// ═══════════════════════════════════════════════════════════════
export function playN(freq, dur, type = 'sine', vol = 0.05, pan = 0) {
  const ac = getAC();
  const now = ac.currentTime;

  // 主振荡器
  const o = ac.createOscillator();
  const g = ac.createGain();
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null;
  o.type = type;
  o.frequency.value = freq;

  // ADSR 包络
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(vol, now + 0.02);
  g.gain.setValueAtTime(vol * 0.7, now + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);

  o.connect(g);
  if (p) {
    p.pan.value = pan;
    g.connect(p);
    p.connect(ac.destination);
    p.connect(getRev());
  } else {
    g.connect(ac.destination);
    g.connect(getRev());
  }

  o.start(now);
  o.stop(now + dur);

  // Chorus 效果：第二个失谐振荡器（方波跳过）
  if (type !== 'square') {
    const o2 = ac.createOscillator();
    const g2 = ac.createGain();
    o2.type = type;
    o2.frequency.value = freq * 1.003;
    g2.gain.setValueAtTime(0, now);
    g2.gain.linearRampToValueAtTime(vol * 0.3, now + 0.03);
    g2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
    o2.connect(g2);
    g2.connect(p || ac.destination);
    o2.start(now);
    o2.stop(now + dur);
  }
}

// ═══════════════════════════════════════════════════════════════
// 自然音生成器
// ═══════════════════════════════════════════════════════════════

// 鸟鸣 · pitch sweep
export function playBirdChirp() {
  const ac = getAC();
  const now = ac.currentTime;
  const base = 1200 + Math.random() * 2000;
  const dur = 0.08 + Math.random() * 0.15;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(base * (0.6 + Math.random() * 0.8), now + dur);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.08, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(now);
  osc.stop(now + dur);
}

// 虫鸣 · 高频脉冲
export function playCricket() {
  const ac = getAC();
  const now = ac.currentTime;
  const base = 4500 + Math.random() * 500;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = base;
  // 3 次脉冲
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.05;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  }
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

// 溪流 · 带通滤波噪声
export function playStream() {
  const ac = getAC();
  const now = ac.currentTime;
  const bufSize = ac.sampleRate * 0.3;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800 + Math.random() * 600;
  filter.Q.value = 2;
  const g = ac.createGain();
  g.gain.value = 0.04;
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(now);
}

// 风声 · 低通滤波噪声 + LFO
export function playWind() {
  const ac = getAC();
  const now = ac.currentTime;
  const bufSize = ac.sampleRate * 0.8;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300 + Math.random() * 400;
  filter.Q.value = 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.06, now + 0.3);
  g.gain.linearRampToValueAtTime(0, now + 0.8);
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(now);
}

// 细雨 · 粉噪声
export function playRain() {
  const ac = getAC();
  const now = ac.currentTime;
  const bufSize = ac.sampleRate * 0.5;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
  for (let i = 0; i < bufSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    data[i] = (b0 + b1 + b2 + b3) * 0.11;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = 0.06;
  src.connect(g);
  g.connect(ac.destination);
  src.start(now);
}

// 停止所有音频（紧急停止按钮）
export function stopAll() {
  if (_ac && _ac.state === 'running') {
    // 不完全 suspend，否则无法恢复。只降 master volume
    // 用户需要重新 new AudioContext 或触发新 sound
  }
}
