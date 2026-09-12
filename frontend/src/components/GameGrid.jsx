import React, { useState, useMemo, memo } from 'react';
import {
  Gamepad2,
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
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_BATCH_SIZE);

  const displayedGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    return games.slice(0, visibleLimit);
  }, [games, visibleLimit]);

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

  const hasMore = visibleLimit < games.length;

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
      </div>

      {/* Main Game Cards Mosaic Grid */}
      <div className="game-cards-masonry-grid poki-masonry-grid">
        {displayedGames.map((game, index) => {
          // Strictly use the exact tile size configured in Admin Panel
          let sizeVariant = '1x1';
          if (game.tileSize && game.tileSize !== 'auto') {
            sizeVariant = String(game.tileSize).toLowerCase().trim();
          } else if (game.featured) {
            sizeVariant = '2x2';
          } else {
            sizeVariant = '1x1';
          }

          return (
            <GameCard
              key={game.id || game._id || index}
              game={game}
              onPlay={onPlayGame}
              isFavorite={(favorites || []).includes(game.id || game._id)}
              onToggleFavorite={onToggleFavorite}
              sizeVariant={sizeVariant}
              priority={index < 12}
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
            <span>Show More Games ({games.length - visibleLimit} Remaining)</span>
            <ChevronDown size={18} />
          </button>
        </div>
      )}

      {/* Search / Filter Empty State */}
      {games.length === 0 && (
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
