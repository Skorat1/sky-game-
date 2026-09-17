import React, { useState } from 'react';
import {
  Code2,
  DollarSign,
  Globe2,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Upload,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

import { submissionsApi } from '../services/api';

export default function DeveloperPortal({ onBackToHome, categories = [] }) {
  const availableCategories = (categories && categories.length > 0 ? categories : [
    { id: 'action', name: 'Action' },
    { id: 'arcade', name: 'Arcade' },
    { id: 'puzzle', name: 'Puzzle' },
    { id: 'classic', name: 'Classic' },
    { id: 'sports', name: 'Sports' },
    { id: 'cyber', name: 'Cyberpunk' }
  ]).filter(c => c.id !== 'all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gameTitle: '',
    gameUrl: '',
    category: availableCategories[0]?.id || 'action',
    description: '',
    engine: 'HTML5 / WebGL'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    sounds.playPowerup();
    try {
      await submissionsApi.submitGame({
        developerName: formData.name,
        email: formData.email,
        gameTitle: formData.gameTitle,
        gameUrl: formData.gameUrl,
        category: formData.category,
        description: formData.description,
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
      });
    } catch (err) {
      console.warn('API submission offline:', err);
    }
    setSubmitted(true);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="dev-portal-page">
      {/* Dev Hero */}
      <div className="dev-hero-section">
        <div className="dev-hero-badge">
          <Code2 size={16} /> FOR GAME DEVELOPERS & STUDIOS
        </div>
        <h1 className="dev-hero-title">
          Publish Your Games to <span className="gradient-highlight">Millions of Players</span>
        </h1>
        <p className="dev-hero-subtitle">
          ThopGames helps HTML5, WebGL, and Unity Web developers monetize, distribute, and grow their player base globally with 70/30 revenue share and instant SDK integration.
        </p>

        <div className="dev-stats-grid">
          <div className="dev-stat-card">
            <Globe2 size={24} className="text-cyan" />
            <h3>10M+</h3>
            <p>Monthly Active Plays</p>
          </div>
          <div className="dev-stat-card">
            <DollarSign size={24} className="text-yellow" />
            <h3>70%</h3>
            <p>Revenue Share</p>
          </div>
          <div className="dev-stat-card">
            <Rocket size={24} className="text-crimson" />
            <h3>24h</h3>
            <p>Average Review Time</p>
          </div>
          <div className="dev-stat-card">
            <ShieldCheck size={24} className="text-purple" />
            <h3>100%</h3>
            <p>Transparent Analytics</p>
          </div>
        </div>
      </div>

      {/* Submission Form & Benefits */}
      <div className="dev-form-grid">
        <div className="dev-form-container">
          <div className="form-card-header">
            <Rocket size={22} color="#f52d3a" />
            <h2>Submit Your Game</h2>
          </div>

          {submitted ? (
            <div className="form-success-state">
              <CheckCircle2 size={54} color="#00f5a0" />
              <h3>Submission Received!</h3>
              <p>
                Thank you for submitting <strong>{formData.gameTitle}</strong>! Our publishing team will review your game build within 24 hours and contact you at <strong>{formData.email}</strong>.
              </p>
              <button
                className="neon-play-btn"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    gameTitle: '',
                    gameUrl: '',
                    category: 'action',
                    description: '',
                    engine: 'HTML5 / WebGL'
                  });
                }}
              >
                Submit Another Game
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="game-submit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name / Studio *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Byte Studio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Business Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="developer@studio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Game Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Rush 2099"
                    value={formData.gameTitle}
                    onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Primary Genre *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Playable Demo URL / Zip Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourdomain.com/game-demo/ or itch.io link"
                  value={formData.gameUrl}
                  onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Game Description & Controls</label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe gameplay mechanics, controls, and unique features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button type="submit" className="dev-submit-btn">
                <Upload size={18} /> SUBMIT GAME FOR PUBLISHING
              </button>
            </form>
          )}
        </div>

        {/* Developer Benefits Checklist */}
        <div className="dev-benefits-card">
          <h3>Why Partner withThopGames?</h3>
          <ul className="benefits-list">
            <li>
              <CheckCircle2 size={18} color="#00f2fe" />
              <div>
                <strong>Zero Hosting Fees:</strong> We host and distribute your game across worldwide high-speed CDNs.
              </div>
            </li>
            <li>
              <CheckCircle2 size={18} color="#00f2fe" />
              <div>
                <strong>Lightweight SDK:</strong> Integrate rewarded ads and banners in under 10 lines of code.
              </div>
            </li>
            <li>
              <CheckCircle2 size={18} color="#00f2fe" />
              <div>
                <strong>Monthly Payouts:</strong> Automated PayPal and Wire transfers with minimum $50 threshold.
              </div>
            </li>
            <li>
              <CheckCircle2 size={18} color="#00f2fe" />
              <div>
                <strong>Featured Spotlight:</strong> High-performing games get guaranteed placement on our homepage hero banner.
              </div>
            </li>
          </ul>

          <div className="sdk-code-preview">
            <div className="code-header">
              <span>THOPGAME SDK Quickstart</span>
            </div>
            <pre className="code-block">
              <code>{`// Initialize ThopGame SDK
window.ThopSDK.init({
  gameId: 'your-game-id',
  onReady: () => {
    console.log('SDK Ready!');
  }
});

// Show Interstitial Ad between levels
window.SkySDK.showAd('level_end');`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
