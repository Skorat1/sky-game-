import React, { useState } from 'react';
import {
  Gamepad2,
  Users,
  Globe2,
  ShieldCheck,
  Zap,
  Sparkles,
  Trophy,
  Heart,
  Flame,
  CheckCircle2,
  Layers,
  Cpu,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { STATS } from '../data/games';
import { sounds } from '../utils/audio';

const FAQ_ITEMS = [
  {
    q: "IsThopGames really 100% free to play?",
    a: "Yes! All games onThopGames are completely free to play directly in your web browser. There are zero paywalls, no subscriptions, and no hidden in-app purchases required to access any game in our catalog."
  },
  {
    q: "Do I need to download or install anything?",
    a: "No downloads or installations are ever required. Every title runs instantly using modern HTML5, WebGL, and WebAssembly technologies inside standard web browsers like Chrome, Edge, Safari, and Firefox."
  },
  {
    q: "Can independent game developers submit their games?",
    a: "Absolutely! We love indie creators. You can submit your HTML5 or WebGL game via our Developer Portal. Our curation team tests and approves quality submissions to be featured for our global player base."
  },
  {
    q: "How are high scores and game progress saved?",
    a: "Your game progress, high scores, favorite games list, and personal settings are securely saved in your browser's LocalStorage. They remain available each time you return on the same device."
  }
];

export default function AboutPage({ onBackToHome }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    sounds.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="custom-static-page-container">
      {/* Hero Showcase Card */}
      <div className="static-hero-card">
        <div className="static-hero-glow"></div>
        <div className="static-hero-content">
          <div className="static-badge">
            <Sparkles size={15} className="text-cyan" />
            <span>ABOUT PLATFORM</span>
          </div>

          <div className="static-hero-icon-box">
            <Gamepad2 size={38} className="text-cyan" />
          </div>
          <h1>Next-Gen <span className="neon-text-gradient">Browser Arcade</span></h1>
          <p className="static-hero-lead">
            <strong>THOPGAME</strong> is an ultra-fast, high-octane gaming destination delivering hundreds of handpicked instant HTML5 & WebGL 3D games directly to your screen with 0 downloads and 60 FPS performance.
          </p>

          <div className="hero-chips-row">
            <span className="hero-chip">⚡ 0ms Install Time</span>
            <span className="hero-chip">🛡️ 100% Sandbox Secure</span>
            <span className="hero-chip">🌍 Global Low-Latency CDN</span>
            <span className="hero-chip">📱 Mobile & Desktop Ready</span>
          </div>
        </div>
      </div>

      {/* Live Platform Stats Grid */}
      <div className="page-stats-grid">
        <div className="stat-glow-card">
          <div className="stat-icon-wrapper cyan-glow">
            <Users size={24} className="text-cyan" />
          </div>
          <h3>{STATS.activePlayers}</h3>
          <p>Daily Active Gamers</p>
        </div>
        <div className="stat-glow-card">
          <div className="stat-icon-wrapper purple-glow">
            <Gamepad2 size={24} className="text-purple" />
          </div>
          <h3>{STATS.totalGames}</h3>
          <p>Hand-Curated Games</p>
        </div>
        <div className="stat-glow-card">
          <div className="stat-icon-wrapper emerald-glow">
            <Globe2 size={24} className="text-emerald" />
          </div>
          <h3>{STATS.countries}</h3>
          <p>Countries Connected</p>
        </div>
        <div className="stat-glow-card">
          <div className="stat-icon-wrapper gold-glow">
            <Trophy size={24} className="text-gold" />
          </div>
          <h3>{STATS.satisfaction}</h3>
          <p>Player Rating Score</p>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <div className="static-section-heading">
        <h2>Why Gamers Love <span className="text-cyan">THOPGAME</span></h2>
        <p>Engineered from the ground up for seamless browser-based gaming excellence.</p>
      </div>

      <div className="static-content-grid">
        <div className="static-feature-card">
          <div className="feature-icon-row">
            <div className="feature-icon-circle bg-cyan-glass">
              <Zap size={22} className="text-cyan" />
            </div>
            <div>
              <h3>Ultra-Fast Instant Play</h3>
              <span className="feature-subtitle">Sub-second load times</span>
            </div>
          </div>
          <p>
            Powered by modern cloud edge networks and optimized WebAssembly pipelines. Tap any game and start playing in less than a second without eating up device disk storage.
          </p>
        </div>

        <div className="static-feature-card">
          <div className="feature-icon-row">
            <div className="feature-icon-circle bg-purple-glass">
              <Cpu size={22} className="text-purple" />
            </div>
            <div>
              <h3>Fluid 60 FPS WebGL Engine</h3>
              <span className="feature-subtitle">High-fidelity 3D graphics</span>
            </div>
          </div>
          <p>
            Hardware-accelerated rendering delivers silky-smooth framerates, high-definition particles, dynamic lighting, and immersive spatial web audio on any graphics chipset.
          </p>
        </div>

        <div className="static-feature-card">
          <div className="feature-icon-row">
            <div className="feature-icon-circle bg-emerald-glass">
              <ShieldCheck size={22} className="text-emerald" />
            </div>
            <div>
              <h3>Sandbox Isolation & Safety</h3>
              <span className="feature-subtitle">Family-safe verified titles</span>
            </div>
          </div>
          <p>
            Every submission is rigorously audited for security, family-friendliness, and malware prevention. Sandboxed permissions guarantee safe gameplay across all devices.
          </p>
        </div>

        <div className="static-feature-card">
          <div className="feature-icon-row">
            <div className="feature-icon-circle bg-crimson-glass">
              <Heart size={22} className="text-crimson" />
            </div>
            <div>
              <h3>Indie Creator Launchpad</h3>
              <span className="feature-subtitle">Empowering worldwide game devs</span>
            </div>
          </div>
          <p>
            We champion independent creators with streamlined catalog submission, real-time analytics, and instant exposure to hundreds of thousands of active gaming enthusiasts.
          </p>
        </div>
      </div>

      {/* Interactive FAQ Section */}
      <div className="static-section-heading" style={{ marginTop: '10px' }}>
        <h2>Frequently Asked <span className="text-purple">Questions</span></h2>
        <p>Everything you need to know about playing and publishing onThopGames.</p>
      </div>

      <div className="static-faq-container">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className={`faq-accordion-card ${openFaq === idx ? 'expanded' : ''}`}
            onClick={() => toggleFaq(idx)}
          >
            <div className="faq-question-row">
              <div className="faq-q-left">
                <HelpCircle size={20} className="text-cyan" />
                <h3>{item.q}</h3>
              </div>
              <div className="faq-toggle-icon">
                {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            {openFaq === idx && (
              <div className="faq-answer-row">
                <p>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tech Stack Banner */}
      <div className="static-tech-banner">
        <div className="tech-badge-title">
          <Code2 size={18} className="text-cyan" />
          <span>SUPPORTED GAME ENGINES & TECH</span>
        </div>
        <div className="tech-chips-group">
          <span className="tech-chip">WebGL 2.0</span>
          <span className="tech-chip">HTML5 Canvas</span>
          <span className="tech-chip">Unity WebGL</span>
          <span className="tech-chip">Godot Engine</span>
          <span className="tech-chip">Phaser JS</span>
          <span className="tech-chip">WebAudio API</span>
          <span className="tech-chip">Gamepad API</span>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="static-bottom-cta">
        <div className="cta-text">
          <h3>Ready to Jump Into the Action?</h3>
          <p>Browse over 500+ top rated arcade, multiplayer, driving, and puzzle games now.</p>
        </div>
        <button
          className="static-cta-btn"
          onClick={() => {
            sounds.playPowerup();
            onBackToHome();
          }}
        >
          <Flame size={18} />
          <span>Explore All Games</span>
        </button>
      </div>
    </div>
  );
}
