import React, { useState, memo } from 'react';
import { Play, Star, Heart, Flame } from 'lucide-react';
import { sounds } from '../utils/audio';

const BADGE_COLORS = {
  'HOT': '#ef4444',
  'POPULAR': '#3b82f6',
  'TRENDING': '#06b6d4',
  'NEW': '#10b981',
  'TOP RATED': '#f59e0b',
  '2 PLAYER': '#8b5cf6',
  'CASUAL': '#ec4899',
  'STRATEGY': '#14b8a6',
  'FEATURED': '#6366f1'
};

const GameCard = memo(function GameCard({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite
}) {
  const [imgSrc, setImgSrc] = useState(game.thumbnail);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleImageError = () => {
    setImgSrc('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80');
    setImgLoaded(true);
  };

  return (
    <div
      className="sky-game-card game-card"
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
    >
      <div className={`card-thumb-container ${!imgLoaded ? 'skeleton' : ''}`}>
        <img
          src={imgSrc}
          alt={game.title}
          className="card-thumb-img"
          loading="lazy"
          decoding="async"
          width="260"
          height="180"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
        />
        <div className="card-overlay-gradient"></div>

        {/* Top Badges */}
        <div className="card-top-badges">
          {game.badge ? (
            <span
              className="card-badge-pill"
              style={{ background: BADGE_COLORS[game.badge.toUpperCase()] || '#f52d3a' }}
            >
              {game.badge}
            </span>
          ) : (
            <span className="card-badge-pill" style={{ background: 'rgba(255, 255, 255, 0.15)' }}>
              {game.category?.toUpperCase() || 'ARCADE'}
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
          <span className="card-category-tag">{game.category?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
});

export default GameCard;

