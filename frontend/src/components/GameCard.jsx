import React, { useState } from 'react';
import { Play, Star, Heart, Flame, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameCard({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite
}) {
  const [imgSrc, setImgSrc] = useState(game.thumbnail);

  const badgeColors = {
    'HOT': 'linear-gradient(135deg, #ff0844, #ffb199)',
    'POPULAR': 'linear-gradient(135deg, #b85df5, #f52d3a)',
    'TRENDING': 'linear-gradient(135deg, #00f2fe, #4facfe)',
    'NEW': 'linear-gradient(135deg, #00f5a0, #00d9f5)',
    'TOP RATED': 'linear-gradient(135deg, #ffd200, #ff6b00)',
    '2 PLAYER': 'linear-gradient(135deg, #b85df5, #8a2be2)',
    'CASUAL': 'linear-gradient(135deg, #ff758c, #ff7eb3)',
    'STRATEGY': 'linear-gradient(135deg, #43e97b, #38f9d7)',
    'FEATURED': 'linear-gradient(135deg, #00f2fe, #b85df5)'
  };

  const handleImageError = () => {
    // Elegant fallback SVG thumbnail if the external image fails to load
    setImgSrc(`https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80`);
  };

  return (
    <div
      className="sky-game-card"
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
    >
      <div className="card-thumb-container">
        <img
          src={imgSrc}
          alt={game.title}
          className="card-thumb-img"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="card-overlay-gradient"></div>

        {/* Top Badges */}
        <div className="card-top-badges">
          {game.badge ? (
            <span
              className="card-badge-pill"
              style={{ background: badgeColors[game.badge.toUpperCase()] || '#f52d3a' }}
            >
              {game.badge}
            </span>
          ) : (
            <span className="card-badge-pill" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
              {game.category.toUpperCase()}
            </span>
          )}

          {/* Favorite heart button */}
          <button
            className={`card-favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              if (onToggleFavorite) onToggleFavorite(game.id);
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={15} fill={isFavorite ? "#f52d3a" : "none"} color={isFavorite ? "#f52d3a" : "#ffffff"} />
          </button>
        </div>

        {/* Hover Center Play Icon */}
        <div className="card-play-hover-circle">
          <Play size={22} fill="#ffffff" color="#ffffff" />
        </div>

        {/* Card Bottom Meta */}
        <div className="card-bottom-info">
          <div className="card-stats-row">
            <span className="card-rating">
              <Star size={12} fill="#ffd200" color="#ffd200" /> {game.rating || 4.8}
            </span>
            <span className="card-plays-count">
              <Flame size={12} color="#f52d3a" /> {game.plays || '1.2k'}
            </span>
          </div>
          <h3 className="card-game-title">{game.title}</h3>
          <span className="card-category-tag">{game.category.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

