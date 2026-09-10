import React from 'react';
import { Play, Sparkles, Flame, Users, Trophy, Star, ShieldCheck, Zap, Dices } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function HeroBanner({ featuredGame, onPlayGame, trendingGames = [] }) {
  if (!featuredGame) return null;

  return (
    <section className="hero-banner-section">
      <div className="hero-banner-card">
        {/* Background Image with Gradient Overlay */}
        <div
          className="hero-banner-bg"
          style={{ backgroundImage: `url(${featuredGame.thumbnail})` }}
        >
          <div className="hero-gradient-overlay" />
          <div className="hero-ambient-glow" />
        </div>

        {/* Content Details */}
        <div className="hero-content">
          <div className="hero-badges-row">
            <span className="hero-badge badge-featured">
              <Sparkles size={14} /> SPOTLIGHT GAME
            </span>
            <span className="hero-badge badge-live">
              <span className="live-pulse-dot"></span> 4,820 PLAYING NOW
            </span>
          </div>

          <h1 className="hero-title">{featuredGame.title}</h1>
          <p className="hero-description">{featuredGame.description || 'Jump into high-speed arcade thrills with zero installation. Play right in your browser now!'}</p>

          {/* Meta stats */}
          <div className="hero-meta-row">
            <div className="hero-stat-item">
              <Star size={16} className="star-icon" fill="#ffd200" color="#ffd200" />
              <span><strong>{featuredGame.rating || 4.9}</strong> / 5.0 Rating</span>
            </div>
            <div className="hero-stat-item">
              <Flame size={16} className="flame-icon" color="#f52d3a" />
              <span><strong>{featuredGame.plays || '150k'}</strong> Plays</span>
            </div>
            <div className="hero-stat-item">
              <Zap size={16} className="zap-icon" color="#00f2fe" />
              <span><strong>Instant Load</strong> 60 FPS</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="hero-actions">
            <button
              className="hero-play-btn"
              onClick={() => {
                sounds.playClick();
                onPlayGame(featuredGame);
              }}
            >
              <div className="play-icon-circle">
                <Play size={20} fill="#ffffff" />
              </div>
              <span>PLAY NOW FOR FREE</span>
            </button>

            {trendingGames.length > 1 && (
              <button
                className="hero-random-btn"
                onClick={() => {
                  sounds.playClick();
                  const pool = trendingGames.filter(g => g.id !== featuredGame.id);
                  const random = pool[Math.floor(Math.random() * pool.length)] || featuredGame;
                  onPlayGame(random);
                }}
                title="Play a random trending game"
              >
                <Dices size={18} />
                <span>SURPRISE ME</span>
              </button>
            )}

            {featuredGame.tags && featuredGame.tags.length > 0 && (
              <div className="hero-tags-group">
                {featuredGame.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="hero-tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch Cards Side Rail */}
        {trendingGames.length > 0 && (
          <div className="hero-trending-rail">
            <div className="trending-rail-header">
              <Flame size={16} color="#f52d3a" />
              <span>HOT TRENDING</span>
            </div>
            <div className="trending-mini-list">
              {trendingGames.slice(0, 3).map((game, index) => (
                <div
                  key={game.id}
                  className="trending-mini-card"
                  onClick={() => {
                    sounds.playClick();
                    onPlayGame(game);
                  }}
                >
                  <div className="mini-rank">#{index + 1}</div>
                  <img src={game.thumbnail} alt={game.title} className="mini-thumb" />
                  <div className="mini-info">
                    <h4 className="mini-title">{game.title}</h4>
                    <div className="mini-meta">
                      <span className="mini-plays">{game.plays || '10k'} plays</span>
                      <span className="mini-badge">{game.badge || 'HOT'}</span>
                    </div>
                  </div>
                  <button className="mini-play-btn" aria-label={`Play ${game.title}`}>
                    <Play size={14} fill="#ffffff" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

