import React, { useState } from 'react';
import { X, Fingerprint, Mail, CheckCircle2, Gamepad2, User, Lock, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function AuthModal({ isOpen, onClose, user, onLogin, onLogout }) {
  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [authMethod, setAuthMethod] = useState('social'); // 'social' | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = (provider) => {
    sounds.playPowerup();
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        name: `${provider} Gamer`,
        provider: provider,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`,
        email: `gamer@${provider.toLowerCase()}.com`
      };
      onLogin(mockUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sounds.playPowerup();
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        name: username || email.split('@')[0] || 'SkyGamer',
        provider: 'Email',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username || email}`,
        email: email
      };
      onLogin(mockUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="poki-auth-overlay" onClick={onClose}>
      <div className="poki-auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="poki-auth-close-btn"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Brand Logo Header */}
        <div className="poki-auth-logo-row">
          <div className="poki-auth-logo">
            <span className="poki-logo-text">SKY</span>
            <div className="poki-logo-circle">
              <div className="poki-logo-wave" />
            </div>
            <span className="poki-logo-text">GAMES</span>
          </div>
        </div>

        {/* If user is already logged in, show user profile view */}
        {user ? (
          <div className="poki-logged-in-view">
            <img src={user.avatar} alt={user.name} className="poki-user-avatar-large" />
            <h3 className="poki-auth-title">Welcome back, {user.name}!</h3>
            <p className="poki-auth-subtitle">Signed in with {user.provider || 'SkyGames ID'}</p>

            <div className="poki-user-stats-card">
              <div className="poki-stat-item">
                <span className="stat-num">🎮 Active</span>
                <span className="stat-lbl">Status</span>
              </div>
              <div className="poki-stat-item">
                <span className="stat-num">⭐ Level 5</span>
                <span className="stat-lbl">Arcade Rank</span>
              </div>
            </div>

            <button
              className="poki-social-btn with-email"
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            {/* Tabs: Register | Login */}
            <div className="poki-auth-tabs">
              <button
                className={`poki-auth-tab ${tab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setTab('register');
                }}
              >
                Register
              </button>
              <button
                className={`poki-auth-tab ${tab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setTab('login');
                }}
              >
                Login
              </button>
            </div>

            {/* Title */}
            <h2 className="poki-auth-title">
              {tab === 'register' ? 'Create a SkyGames Account' : 'Log in to SkyGames'}
            </h2>

            {authMethod === 'social' ? (
              <div className="poki-social-list">
                {/* With Apple */}
                <button
                  className="poki-social-btn with-apple"
                  onClick={() => handleSocialLogin('Apple')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.55.63-1.03 1.68-.9 2.7.99.08 2.01-.48 2.59-1.19z" />
                  </svg>
                  <span>With Apple</span>
                </button>

                {/* With Google */}
                <button
                  className="poki-social-btn with-google"
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" width="22" height="22">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>With Google</span>
                </button>

                {/* With Microsoft */}
                <button
                  className="poki-social-btn with-microsoft"
                  onClick={() => handleSocialLogin('Microsoft')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                    <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                    <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
                    <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
                    <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
                  </svg>
                  <span>With Microsoft</span>
                </button>

                {/* With passkey */}
                <button
                  className="poki-social-btn with-passkey"
                  onClick={() => handleSocialLogin('Passkey')}
                  disabled={loading}
                >
                  <Fingerprint size={22} className="social-icon text-cyan" />
                  <span>With passkey</span>
                </button>

                {/* Alternate Email Button */}
                <div className="poki-divider-row">
                  <span>OR</span>
                </div>

                <button
                  className="poki-email-toggle-btn"
                  onClick={() => {
                    sounds.playClick();
                    setAuthMethod('email');
                  }}
                >
                  <Mail size={16} />
                  <span>Continue with Email & Password</span>
                </button>
              </div>
            ) : (
              /* Custom Email Form */
              <form onSubmit={handleEmailSubmit} className="poki-email-form">
                {tab === 'register' && (
                  <div className="poki-input-group">
                    <label>Player Name</label>
                    <div className="poki-input-box">
                      <User size={18} />
                      <input
                        type="text"
                        placeholder="Choose username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="poki-input-group">
                  <label>Email Address</label>
                  <div className="poki-input-box">
                    <Mail size={18} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="poki-input-group">
                  <label>Password</label>
                  <div className="poki-input-box">
                    <Lock size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="poki-submit-auth-btn" disabled={loading}>
                  <span>{loading ? 'Authenticating...' : tab === 'register' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="poki-back-to-social"
                  onClick={() => {
                    sounds.playClick();
                    setAuthMethod('social');
                  }}
                >
                  ← Back to Quick Login
                </button>
              </form>
            )}

            {/* Footer Disclaimer */}
            <div className="poki-auth-footer">
              <p>
                By creating an account, you acknowledge that you have read the information in the{' '}
                <a href="#privacy" onClick={(e) => { e.preventDefault(); }}>
                  Privacy Center
                </a>{' '}
                and agree to the rules included therein.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
