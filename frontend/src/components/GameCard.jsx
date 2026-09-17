import React, { useState, useRef, useEffect, memo } from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import { sounds } from '../utils/audio';
import { getGamePreviewVideo, parseVideoSource } from '../utils/videoHelper';

function formatCompactCount(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

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

export function optimizeThumbUrl(url, targetWidth = 360) {
  if (!url || typeof url !== 'string') {
    return `https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=${targetWidth}&auto=format&fit=crop&q=75`;
  }

  // Clean XML-escaped entities like &amp; commonly found in RSS / feeds
  let clean = url.replace(/&amp;/g, '&').trim();

  // Optimize Unsplash images for instant WebP delivery with small filesize
  if (clean.includes('images.unsplash.com')) {
    clean = clean.replace(/w=\d+/g, `w=${targetWidth}`);
    if (!clean.includes('auto=format')) clean += '&auto=format&fit=crop';
    if (!clean.includes('q=')) clean += '&q=75';
    return clean;
  }

  // Optimize Poki CDN dimensions & compression
  if (clean.includes('img.poki.com/cdn-cgi/image/')) {
    clean = clean
      .replace(/quality=\d+/g, 'quality=75')
      .replace(/width=\d+/g, `width=${targetWidth}`)
      .replace(/height=\d+/g, `height=${targetWidth}`);
    return clean;
  }

  return clean;
}

const GameCard = memo(function GameCard({
  game,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
  sizeVariant = '1x1',
  priority = false,
  livePlayersCount = 0
}) {
  if (!game) return null;
  const targetWidth = sizeVariant === '2x2' ? 500 : 360;
  const rawThumb = game?.thumbnail || game?.thumbnailUrl || game?.image || game?.imageUrl || game?.cover || game?.banner;
  const optimizedThumb = optimizeThumbUrl(rawThumb, targetWidth);

  // Use real socket live players count
  const computedLive = Number(livePlayersCount || 0);

  const [imgSrc, setImgSrc] = useState(optimizedThumb);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const nextThumb = optimizeThumbUrl(rawThumb, targetWidth);
    setImgSrc(nextThumb);
    // If the image was already cached in browser memory, show immediately
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setImgLoaded(true);
    } else {
      setImgLoaded(false);
    }
  }, [rawThumb, targetWidth]);

  const rawVideoUrl = getGamePreviewVideo(game);
  const videoSource = !videoError ? parseVideoSource(rawVideoUrl) : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoSource?.type === 'direct') {
      try {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } catch {}
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && videoSource?.type === 'direct') {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch {}
    }
  };

  const handleImageError = () => {
    setImgSrc(`https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=${targetWidth}&auto=format&fit=crop&q=70`);
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
        {/* Main Static Thumbnail with instant cache detection & priority loading */}
        <img
          ref={imgRef}
          src={imgSrc}
          alt={game.title}
          className="card-thumb-img"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={handleImageError}
          style={{ 
            opacity: imgLoaded ? 1 : 0.4, 
            transition: 'opacity 0.2s ease, transform 0.35s ease',
            display: 'block'
          }}
        />

        {/* Hover Video Preview (Direct MP4/WebM Video or YouTube/Vimeo iframe) */}
        {videoSource?.type === 'direct' && (
          <video
            ref={videoRef}
            src={videoSource.url}
            className={`card-hover-preview-video ${isHovered ? 'video-active' : ''}`}
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
          />
        )}

        {isHovered && (videoSource?.type === 'youtube' || videoSource?.type === 'vimeo') && (
          <iframe
            src={videoSource.embedUrl}
            title={game.title}
            className="card-hover-preview-video video-active"
            allow="autoplay; encrypted-media"
            loading="eager"
            style={{
              border: 0,
              pointerEvents: 'none',
              width: '100%',
              height: '100%',
              transform: 'scale(1.25)',
              transformOrigin: 'center center'
            }}
          />
        )}

        <div className="card-overlay-gradient"></div>

        {/* Top Badges & Favorite */}
        <div className="card-top-badges">
          <div className="card-top-left-badges">
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
          </div>

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
          <div className="card-stats-row">
            <span className="card-likes-count" title={`${(game.likes || 0).toLocaleString()} Likes`}>
              <ThumbsUp size={10} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
              <span>{formatCompactCount(game.likes || 0)}</span>
            </span>
            <span className="card-rating-stat" title={`Rating: ${Number(game.rating || 4.8).toFixed(1)} / 5.0`}>
              <span style={{ color: '#fbbf24' }}>★</span>
              <span>{Number(game.rating || 4.8).toFixed(1)}</span>
            </span>
            {(game.plays || 0) > 0 && (
              <span className="card-plays-count" title={`${game.plays.toLocaleString()} Plays`}>
                <span>🎮</span>
                <span>{formatCompactCount(game.plays)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameCard;
