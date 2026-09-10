import React, { useState, useMemo, memo } from 'react';
import {
  Gamepad2,
  SlidersHorizontal,
  ArrowLeft,
  Play,
  ChevronDown
} from 'lucide-react';
import GameCard from './GameCard';
import { sounds } from '../utils/audio';

const QUICK_CATEGORIES = [
  { id: '', name: 'All Games', icon: '🎮' },
  { id: 'action', name: 'Action', icon: '⚔️' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
  { id: 'racing', name: 'Racing', icon: '🚗' },
  { id: 'shooting', name: 'Shooting', icon: '🎯' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'multiplayer', name: '2-Player', icon: '👥' },
];

const INITIAL_BATCH_SIZE = 28;
const BATCH_INCREMENT = 24;

const GameGrid = memo(function GameGrid({
  title,
  games = [],
  onPlayGame,
  favorites = [],
  onToggleFavorite,
  activeCategory = '',
  onSelectCategory,
  activePage = 'home',
  searchQuery = ''
}) {
  const [sortBy, setSortBy] = useState('popular');
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_BATCH_SIZE);

  const sortedList = useMemo(() => {
    if (!games || games.length === 0) return [];
    const list = [...games];
    if (sortBy === 'popular') {
      return list.sort((a, b) => parseFloat(b.plays || 0) - parseFloat(a.plays || 0));
    } else if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01'));
    } else if (sortBy === 'az') {
      return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [games, sortBy]);

  const isHomeView = activePage === 'home' && !activeCategory && !searchQuery;

  // Find featured spotlight game if available
  const featuredGame = useMemo(() => {
    if (!isHomeView || !games || games.length === 0) return null;
    return games.find(g => g.featured) || (games.length >= 4 ? games[0] : null);
  }, [isHomeView, games]);

  // If no games exist on the platform
  if (!games || games.length === 0) {
    return (
      <div className="empty-grid-state" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: 'rgba(18, 22, 34, 0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(12px)', margin: '20px 0' }}>
        <div className="empty-icon-circle" style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(245, 45, 126, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(245, 45, 126, 0.3)', boxShadow: '0 0 30px rgba(245, 45, 126, 0.2)' }}>
          <Gamepad2 size={44} color="#f52d7e" />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>No games available</h3>
        <p style={{ color: '#94a3b8', maxWidth: '440px', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 auto 20px' }}>
          There are currently no games published. Add games through the <strong>Admin Control Panel</strong> to display them here live.
        </p>
      </div>
    );
  }

  const displayedGames = sortedList.slice(0, visibleLimit);
  const hasMore = visibleLimit < sortedList.length;

  const handleLoadMore = () => {
    sounds.playClick();
    setVisibleLimit(prev => prev + BATCH_INCREMENT);
  };

  return (
    <section className="gamepix-category-grid-section">
      {/* Featured Spotlight Banner (if on home view and a featured game exists) */}
      {featuredGame && (
        <div
          className="home-spotlight-hero"
          onClick={() => {
            sounds.playClick();
            onPlayGame(featuredGame);
          }}
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 60%, rgba(15, 23, 42, 0.4) 100%), url(${featuredGame.banner || featuredGame.thumbnail}) center/cover no-repeat`,
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ maxWidth: '520px', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                ⭐ Featured Game
              </span>
              <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                {featuredGame.category}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
              {featuredGame.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {featuredGame.description || 'Play this exciting game now on SKYGAMES!'}
            </p>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#3b82f6',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.9rem',
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
              }}
            >
              <Play size={16} fill="#ffffff" /> Play Now
            </button>
          </div>
        </div>
      )}

      {/* Quick Category Chips Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '10px', scrollbarWidth: 'none' }}>
        {QUICK_CATEGORIES.map(cat => {
          const isActive = (activeCategory === cat.id) || (!activeCategory && cat.id === '' && isHomeView);
          return (
            <button
              key={cat.id || 'all'}
              onClick={() => {
                sounds.playClick();
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: isActive ? '#3b82f6' : '#1e293b',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Header */}
      <div className="grid-header-row">
        <div className="grid-title-group">
          {!isHomeView && (
            <button
              className="gamepix-grid-back-btn"
              onClick={() => {
                sounds.playClick();
                if (onSelectCategory) onSelectCategory('');
              }}
              title="Back to all games / Home"
            >
              <ArrowLeft size={16} />
              <span>All Games</span>
            </button>
          )}

          <h2 className="grid-main-title poki-brand-heading">
            {searchQuery ? (
              <>Search Results for: <span className="highlight-text">"{searchQuery}"</span></>
            ) : (
              title || (activeCategory ? `${activeCategory.toUpperCase()} GAMES` : '🎮 All Games')
            )}
          </h2>
          <span className="grid-total-pill">{sortedList.length} GAMES</span>
        </div>

        {/* Sort Controls */}
        <div className="grid-controls-group">
          <div className="sort-dropdown-wrapper">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => {
                sounds.playClick();
                setSortBy(e.target.value);
              }}
              className="sort-select"
            >
              <option value="popular">Most Popular 🔥</option>
              <option value="rating">Top Rated ⭐</option>
              <option value="newest">New Releases ⚡</option>
              <option value="az">A to Z 🔤</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Game Cards Grid */}
      <div className="game-cards-masonry-grid">
        {displayedGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlayGame}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Load More Button if there are more games */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '20px' }}>
          <button
            onClick={handleLoadMore}
            className="gamepix-load-more-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              background: 'linear-gradient(135deg, rgba(245, 45, 126, 0.2), rgba(0, 242, 254, 0.2))',
              border: '1.5px solid rgba(0, 242, 254, 0.4)',
              borderRadius: '50px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.25s ease'
            }}
          >
            <span>Show More Games ({sortedList.length - visibleLimit} Remaining)</span>
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Search / Filter Empty State */}
      {sortedList.length === 0 && (
        <div className="empty-grid-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="empty-icon-circle" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(245, 45, 126, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Gamepad2 size={36} color="#f52d7e" />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>
            {searchQuery ? 'No games found' : 'No games in this category yet'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {searchQuery
              ? 'Try searching for another keyword or selecting a different category from the pills above.'
              : 'Add games under this category from the Admin Control Panel.'}
          </p>
        </div>
      )}
    </section>
  );
});

export default GameGrid;
