import React, { useState, useRef, memo } from 'react';
import { Heart } from 'lucide-react';
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

function getGamePreviewVideo(game) {
  if (game?.previewVideo) return game.previewVideo;
  if (!game?.gameUrl) return null;
  const cg = game.gameUrl.match(/crazygames\.com\/(?:game|embed)\/([a-zA-Z0-9-]+)/i);
  if (cg) return `https://videos.crazygames.com/games/${cg[1]}/cover-16x9.mp4`;
  return null;
}

const GameCard = memo(function GameCard({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
  sizeVariant = '1x1'
}) {
  const currentThumb = game.thumbnail || game.thumbnailUrl || game.image || game.imageUrl || game.cover || game.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600';
  const [imgSrc, setImgSrc] = useState(currentThumb);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  React.useEffect(() => {
    setImgSrc(currentThumb);
    setImgLoaded(false);
  }, [currentThumb]);

  const previewVideoUrl = !videoError ? getGamePreviewVideo(game) : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && previewVideoUrl) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch { }
    }
  };

  const handleImageError = () => {
    setImgSrc('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80');
    setImgLoaded(true);
  };

  return (
    <div
      className={`sky-game-card game-card poki-game-card poki-tile-${sizeVariant} ${isHovered ? 'is-card-hovered' : ''}`}
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={game.title}
    >
      <div className={`card-thumb-container ${!imgLoaded ? 'skeleton' : ''}`}>
        {/* Main Static Thumbnail */}
        <img
          src={imgSrc}
          alt={game.title}
          className="card-thumb-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
        />

        {/* Hover Video Preview (Smooth Playback) */}
        {previewVideoUrl && (
          <video
            ref={videoRef}
            src={previewVideoUrl}
            className={`card-hover-preview-video ${isHovered ? 'video-active' : ''}`}
            muted
            loop
            playsInline
            preload="none"
            onError={() => setVideoError(true)}
          />
        )}

        <div className="card-overlay-gradient"></div>

        {/* Top Badges & Favorite */}
        <div className="card-top-badges">
          {game.badge ? (
            <span
              className="card-badge-pill"
              style={{ background: (typeof game.badge === 'string' && BADGE_COLORS[game.badge.toUpperCase()]) || '#f52d3a' }}
            >
              {game.badge}
            </span>
          ) : (
            <span className="card-badge-pill" style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(4px)' }}>
              {(game.category ? String(game.category).toUpperCase() : 'ARCADE')}
            </span>
          )}

          {/* Favorite heart button */}
          <button
            className={`card-favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              if (onToggleFavorite) onToggleFavorite(game.id || game._id);
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={14} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#ffffff"} />
          </button>
        </div>



        {/* Card Bottom Meta */}
        <div className="card-bottom-info">
          <h3 className="card-game-title">{game.title}</h3>
        </div>
      </div>
    </div>
  );
});

export default GameCard;


