import React from 'react';
import {
  Gamepad2,
  Sparkles,
  Zap,
  Shield,
  Smartphone,
  ChevronUp,
  FileText,
  Mail,
  HelpCircle
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    sounds.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="sky-footer">
      {/* Footer Top Highlights Feature Row */}
      <div className="footer-highlights-bar">
        <div className="footer-highlight-item">
          <div className="highlight-icon-box">
            <Gamepad2 size={20} className="text-cyan" />
          </div>
          <div className="highlight-text">
            <strong>100+ Free HTML5 Games</strong>
            <span>Instant Play • No Downloads</span>
          </div>
        </div>

        <div className="footer-highlight-item">
          <div className="highlight-icon-box">
            <Zap size={20} className="text-yellow" />
          </div>
          <div className="highlight-text">
            <strong>Ultra-Fast 60 FPS</strong>
            <span>Optimized WebGL Gaming Engine</span>
          </div>
        </div>

        <div className="footer-highlight-item">
          <div className="highlight-icon-box">
            <Smartphone size={20} className="text-green" />
          </div>
          <div className="highlight-text">
            <strong>Mobile & Desktop Ready</strong>
            <span>Touch Controls & Keyboard Support</span>
          </div>
        </div>

        <div className="footer-highlight-item">
          <div className="highlight-icon-box">
            <Shield size={20} className="text-purple" />
          </div>
          <div className="highlight-text">
            <strong>100% Safe & Free</strong>
            <span>No Signup Required to Play</span>
          </div>
        </div>
      </div>

      <div className="footer-top-grid footer-two-col">
        {/* Brand Col */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <div className="logo-icon-wrapper">
              <Gamepad2 size={24} className="logo-icon" />
              <span className="logo-glow"></span>
            </div>
            <div className="logo-text-group">
              <span className="logo-title">
                SKY<span className="gradient-highlight">GAMES</span>
              </span>
              <span className="logo-badge">PLAY FREE</span>
            </div>
          </div>
          <p className="footer-desc">
            Play premier arcade, action, shooting, racing, puzzle, and multiplayer 2-player games right in your browser. Engineered with next-gen WebGL physics, neon aesthetics, and zero installation needed!
          </p>
          <div className="footer-india-badge">
            <span>Made with ❤️ in India for Global Gamers</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <Sparkles size={14} className="text-purple" /> NAVIGATION & LINKS
          </h4>
          <ul className="footer-links footer-links-grid">
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('home'); }}>
                🎮 Home Arcade
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('trending'); }}>
                🔥 Trending Games
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('top-rated'); }}>
                ⭐ Top Rated Hits
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('developers'); }}>
                🚀 Developer Portal
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('about'); }}>
                ℹ️ About Us
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('privacy'); }}>
                🛡️ Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => { sounds.playClick(); onNavigate('contact'); }}>
                📬 Contact & Support
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <p className="copyright-text">
            © {new Date().getFullYear()} <strong>SKYGAMES</strong>. Built with React & Web Audio API. All games are property of their respective creators.
          </p>
          <button className="back-to-top-btn" onClick={scrollToTop} title="Back to top">
            <span>Back to Top</span>
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
