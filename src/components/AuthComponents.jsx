import React, { useState } from 'react';
import { Icon, Seal } from '../ui/atoms.jsx';
import { read, write } from '../utils/storage.js';

/* ═══════════════════════════════════════════════════════════════
   本地登录系统（无真实后端）
   - LoginPanel: 模态登录弹窗 · 手机/邮箱/访客 三种入口
   - UserMenu: 右上角头像 · 点开展示菜单
   - 数据存 localStorage: userProfile
   ═══════════════════════════════════════════════════════════════ */

// 生成一个假 avatar 字
function getAvatarChar(name) {
  if (!name) return '游';
  return name.charAt(0);
}

// ═══════════════════════════════════════════════════════════════
// LoginPanel · 登录弹窗
// ═══════════════════════════════════════════════════════════════
export function LoginPanel({ onLogin, onClose }) {
  const [mode, setMode] = useState('choice'); // choice | phone | email
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState(1);

  const handleLogin = (profile) => {
    write('userProfile', profile);
    onLogin(profile);
    onClose();
  };

  const phoneLogin = () => {
    if (step === 1) {
      if (!/^1\d{10}$/.test(phone)) {
        alert('请输入 11 位手机号');
        return;
      }
      setStep(2);
    } else {
      if (!code || code.length < 4) {
        alert('请输入至少 4 位验证码');
        return;
      }
      handleLogin({
        id: `u-${Date.now()}`,
        type: 'phone',
        phone,
        nickname: nickname || `花客${phone.slice(-4)}`,
        joinedAt: Date.now()
      });
    }
  };

  const emailLogin = () => {
    if (!/^[\w.+-]+@[\w-]+\.\w+/.test(email)) {
      alert('邮箱格式有误');
      return;
    }
    handleLogin({
      id: `u-${Date.now()}`,
      type: 'email',
      email,
      nickname: nickname || email.split('@')[0],
      joinedAt: Date.now()
    });
  };

  const guestLogin = () => {
    handleLogin({
      id: `g-${Date.now()}`,
      type: 'guest',
      nickname: '访客',
      joinedAt: Date.now()
    });
  };

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'color-mix(in oklch, var(--ink) 60%, transparent)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-elev)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px, 4vw, 36px)',
          width: 'min(420px, 100%)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}>
        <button onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--bg-sunk)', border: 'none',
            cursor: 'pointer', color: 'var(--ink-3)',
            width: 28, height: 28, borderRadius: '50%',
            display: 'grid', placeItems: 'center'
          }}>
          <Icon.close/>
        </button>

        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="cn-caps">登 堂 入 室</div>
          <div className="serif" style={{
            fontSize: 22, letterSpacing: '0.25em',
            marginTop: 8, color: 'var(--ink)'
          }}>
            {mode === 'choice' ? '进入花信风' :
             mode === 'phone' ? '手机登录' :
             mode === 'email' ? '邮箱登录' : '登录'}
          </div>
        </div>

        {/* 模式选择 */}
        {mode === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn primary"
              onClick={() => { setMode('phone'); setStep(1); }}
              style={{ justifyContent: 'center', padding: 14, fontSize: 14 }}>
              📱 手机号登录
            </button>
            <button className="btn"
              onClick={() => setMode('email')}
              style={{ justifyContent: 'center', padding: 14, fontSize: 14 }}>
              ✉ 邮箱登录
            </button>
            <div style={{
              textAlign: 'center', padding: '6px 0',
              fontSize: 10, color: 'var(--ink-3)',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.2em'
            }}>· 或 ·</div>
            <button onClick={guestLogin}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer',
                fontSize: 13, color: 'var(--ink-2)',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '0.15em',
                padding: '8px 0'
              }}>
              以访客身份继续 →
            </button>

            <div style={{
              marginTop: 10, fontSize: 10, color: 'var(--ink-3)',
              textAlign: 'center', lineHeight: 1.8,
              fontFamily: 'var(--font-mono)'
            }}>
              当前为本地登录演示 · 数据仅存于本设备<br/>
              no real server · data stays local
            </div>
          </div>
        )}

        {/* 手机登录 */}
        {mode === 'phone' && (
          <div>
            {step === 1 && (
              <>
                <div style={{ marginBottom: 10, fontSize: 12,
                  color: 'var(--ink-3)' }}>① 手机号</div>
                <input value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="1XXXXXXXXXX"
                  style={inputStyle}/>
                <button className="btn zhusha" onClick={phoneLogin}
                  style={{ width: '100%', marginTop: 14,
                    justifyContent: 'center', padding: 12 }}>
                  获取验证码
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <div style={{ marginBottom: 10, fontSize: 12,
                  color: 'var(--ink-3)' }}>
                  ② 短信验证码已发送至 {phone}
                </div>
                <input value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="任意 4-6 位数字"
                  style={inputStyle}/>
                <div style={{ marginBottom: 10, marginTop: 14, fontSize: 12,
                  color: 'var(--ink-3)' }}>③ 昵称（可选）</div>
                <input value={nickname}
                  onChange={e => setNickname(e.target.value.slice(0, 12))}
                  placeholder="你的昵称"
                  style={inputStyle}/>
                <button className="btn zhusha" onClick={phoneLogin}
                  style={{ width: '100%', marginTop: 14,
                    justifyContent: 'center', padding: 12 }}>
                  登 录
                </button>
              </>
            )}
            <button onClick={() => { setMode('choice'); setStep(1); }}
              className="btn sm ghost"
              style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
              ← 其他登录方式
            </button>
          </div>
        )}

        {/* 邮箱登录 */}
        {mode === 'email' && (
          <div>
            <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--ink-3)' }}>
              邮箱
            </div>
            <input value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}/>
            <div style={{ marginBottom: 10, marginTop: 14, fontSize: 12, color: 'var(--ink-3)' }}>
              昵称（可选）
            </div>
            <input value={nickname}
              onChange={e => setNickname(e.target.value.slice(0, 12))}
              placeholder="你的昵称"
              style={inputStyle}/>
            <button className="btn zhusha" onClick={emailLogin}
              style={{ width: '100%', marginTop: 14,
                justifyContent: 'center', padding: 12 }}>
              登 录
            </button>
            <button onClick={() => setMode('choice')}
              className="btn sm ghost"
              style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
              ← 其他登录方式
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  outline: 'none'
};

// ═══════════════════════════════════════════════════════════════
// UserMenu · 右上角菜单
// ═══════════════════════════════════════════════════════════════
export function UserMenu({ user, onLogout, onShowDiary, onShowLogin }) {
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button onClick={onShowLogin}
        className="btn sm ghost">
        登录
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 30, height: 30, borderRadius: '50%',
          border: '1px solid var(--line)',
          background: user.type === 'guest' ? 'var(--bg-sunk)' : 'var(--zhusha)',
          color: user.type === 'guest' ? 'var(--ink-2)' : 'var(--paper)',
          cursor: 'pointer', padding: 0,
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-serif)', fontSize: 13,
          letterSpacing: 0
        }}>
        {getAvatarChar(user.nickname)}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}/>
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)', right: 0,
            background: 'var(--bg-elev)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100, overflow: 'hidden',
            minWidth: 200
          }}>
            <div style={{ padding: '14px 16px',
              borderBottom: '1px solid var(--line-2)',
              background: 'var(--bg-sunk)' }}>
              <div className="serif" style={{ fontSize: 14,
                color: 'var(--ink)', letterSpacing: '0.05em' }}>
                {user.nickname}
              </div>
              <div className="mono" style={{ fontSize: 10,
                color: 'var(--ink-3)', marginTop: 3 }}>
                {user.type === 'phone' ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') :
                 user.type === 'email' ? user.email :
                 '访客模式'}
              </div>
            </div>

            <button onClick={() => { onShowDiary(); setOpen(false); }}
              style={menuItemStyle}>
              <Icon.diary/> 我的花历
            </button>

            <button onClick={() => {
                if (confirm('确定要登出吗？本地数据（收藏/打卡/手札）会保留。')) {
                  onLogout();
                  setOpen(false);
                }
              }}
              style={menuItemStyle}>
              <Icon.chev d="left"/> 登 出
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '10px 16px',
  background: 'transparent', border: 'none',
  cursor: 'pointer', textAlign: 'left',
  fontFamily: 'var(--font-serif)',
  fontSize: 13, color: 'var(--ink)',
  letterSpacing: '0.08em'
};
