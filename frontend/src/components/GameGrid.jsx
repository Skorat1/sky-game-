import React, { useState, useMemo, memo } from 'react';
import {
  Gamepad2,
  ChevronDown
} from 'lucide-react';
import GameCard from './GameCard';
import { sounds } from '../utils/audio';

const DEFAULT_QUICK_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: '🎮' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️' },
  { id: 'action', name: 'Action', icon: '⚔️' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
  { id: 'classic', name: 'Classic', icon: '👾' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'cyber', name: 'Cyberpunk', icon: '⚡' }
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
  user,
  categories = []
}) {
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_BATCH_SIZE);

  const displayedGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    return games.slice(0, visibleLimit);
  }, [games, visibleLimit]);

  const isHomeView = activePage === 'home' && !activeCategory && !searchQuery;

  const hasMore = visibleLimit < games.length;

  const handleLoadMore = () => {
    sounds.playClick();
    setVisibleLimit(prev => prev + BATCH_INCREMENT);
  };

  const quickCatList = useMemo(() => {
    if (categories && categories.length > 0) {
      // Ensure 'all' is at the front
      const hasAll = categories.some(c => c.id === 'all' || c.id === '');
      if (!hasAll) {
        return [{ id: 'all', name: 'All Games', icon: '🎮' }, ...categories];
      }
      return categories;
    }
    return DEFAULT_QUICK_CATEGORIES;
  }, [categories]);

  return (
    <section className="gamepix-category-grid-section">
      {/* Quick Category Chips Bar */}
      <div className="quick-cat-scroll-bar">
        {quickCatList.map(cat => {
          const isAllCat = cat.id === 'all' || cat.id === '';
          const isActive = (activeCategory === cat.id) || (isAllCat && (!activeCategory || activeCategory === 'all') && isHomeView);
          
          return (
            <button
              key={cat.id || 'all'}
              className={`category-quick-pill ${isActive ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                if (onSelectCategory) onSelectCategory(isAllCat ? '' : cat.id);
              }}
            >
              <span className="pill-emoji-icon">{typeof cat.icon === 'string' ? cat.icon : '🎮'}</span>
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

      {/* Search / Filter Empty State (Categories remain accessible above) */}
      {games.length === 0 && (
        <div className="empty-grid-state" style={{ 
          padding: '50px 24px', 
          textAlign: 'center', 
          background: '#ffffff', 
          borderRadius: '24px', 
          border: '1.5px dashed #cbd5e1', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          margin: '10px 0 30px'
        }}>
          <div className="empty-icon-circle" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <Gamepad2 size={38} color="#2563eb" />
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px', fontWeight: '800' }}>
            {searchQuery 
              ? `No games found for "${searchQuery}"` 
              : activeCategory 
              ? `No games in "${activeCategory.toUpperCase()}" yet` 
              : 'No games available'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {searchQuery
              ? 'Try searching with another keyword or click any category pill above to explore more games.'
              : 'Games under this category will be available soon. Select another category above or view all games.'}
          </p>
          <button
            onClick={() => {
              sounds.playClick();
              if (onSelectCategory) onSelectCategory('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              border: 'none',
              borderRadius: '50px',
              color: '#0a1024',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 242, 254, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🎮 View All Games</span>
          </button>
        </div>
      )}
    </section>
  );
});

export default GameGrid;
