import React, { useState, useMemo, memo } from 'react';
import {
  Gamepad2,
  SlidersHorizontal,
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
  searchQuery = '',
  onOpenAuth,
  onFocusSearch,
  user
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

  // If no games exist on the platform
  if (!games || games.length === 0) {
    return (
      <div className="empty-grid-state" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', margin: '20px 0' }}>
        <div className="empty-icon-circle" style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(245, 45, 126, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(245, 45, 126, 0.25)' }}>
          <Gamepad2 size={44} color="#f52d7e" />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>No games available</h3>
        <p style={{ color: '#64748b', maxWidth: '440px', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 auto 20px' }}>
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
      {/* Quick Category Chips Bar */}
      <div className="quick-cat-scroll-bar">
        {QUICK_CATEGORIES.map(cat => {
          const isActive = (activeCategory === cat.id) || (!activeCategory && cat.id === '' && isHomeView);
          return (
            <button
              key={cat.id || 'all'}
              className={`category-quick-pill ${isActive ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
            >
              <span className="pill-emoji-icon">{cat.icon}</span>
              <span className="pill-name-text">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Header */}
      <div className="grid-header-row">
        <div className="grid-title-group">
          <h2 className="grid-main-title sky-brand-heading">
            {searchQuery ? (
              <>Search Results for: <span className="highlight-text">"{searchQuery}"</span></>
            ) : (
              title || (activeCategory ? `${activeCategory.toUpperCase()} GAMES` : '🎮 All Games')
            )}
          </h2>
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

      {/* Main Game Cards Dense Poki Mosaic Grid */}
      <div className="game-cards-masonry-grid poki-masonry-grid">
        {displayedGames.map((game, index) => {
          // Priority 1: Exact size configured in Admin (1x1, 2x2, 2x1, 1x2)
          let sizeVariant = game.tileSize;

          // Priority 2: If size is 'auto' or not set, use intelligent Poki mosaic distribution
          if (!sizeVariant || sizeVariant === 'auto') {
            if (game.featured || index === 0) {
              sizeVariant = '2x2';
            } else if (index === 5 || index === 14 || index === 25 || index === 36) {
              sizeVariant = '2x1';
            } else if (index === 8 || index === 19 || index === 31) {
              sizeVariant = '2x2';
            } else {
              sizeVariant = '1x1';
            }
          }

          return (
            <GameCard
              key={game.id || game._id || index}
              game={game}
              onPlay={onPlayGame}
              isFavorite={(favorites || []).includes(game.id || game._id)}
              onToggleFavorite={onToggleFavorite}
              sizeVariant={sizeVariant}
            />
          );
        })}
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
              background: '#ffffff',
              border: '1.5px solid #2563eb',
              borderRadius: '50px',
              color: '#2563eb',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
              transition: 'all 0.2s ease'
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
          <div className="empty-icon-circle" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(245, 45, 126, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(245, 45, 126, 0.25)' }}>
            <Gamepad2 size={36} color="#f52d7e" />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
            {searchQuery ? 'No games found' : 'No games in this category yet'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
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
