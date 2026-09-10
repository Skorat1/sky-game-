import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Crosshair,
  Car,
  Users,
  Swords,
  Puzzle,
  Gamepad2,
  Clock,
  Trophy,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import GameCard from './GameCard';
import { sounds } from '../utils/audio';

export default function GameGrid({
  title,
  games = [],
  onPlayGame,
  favorites = [],
  onToggleFavorite,
  activeCategory = '',
  onSelectCategory,
  activePage = 'home',
  searchQuery = '',
  recentlyPlayed = []
}) {
  const [sortBy, setSortBy] = useState('popular');

  const getSortedGames = (list) => {
    let result = [...list];
    if (sortBy === 'popular') {
      return result.sort((a, b) => parseFloat(b.plays || 0) - parseFloat(a.plays || 0));
    } else if (sortBy === 'rating') {
      return result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (sortBy === 'newest') {
      return result.sort((a, b) => new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01'));
    } else if (sortBy === 'az') {
      return result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  };

  // Helper for category shelf
  const renderGamePixShelf = (shelfTitle, shelfIcon, shelfCategory, shelfGames) => {
    if (!shelfGames || shelfGames.length === 0) return null;
    const Icon = shelfIcon;

    return (
      <div className="gamepix-shelf-section" key={shelfTitle}>
        <div className="gamepix-shelf-header">
          <div className="shelf-title-left">
            <div className="shelf-icon-wrapper">
              <Icon size={22} className="shelf-icon" />
            </div>
            <h3 className="shelf-main-title">{shelfTitle}</h3>
          </div>

          {shelfCategory && (
            <button
              className="shelf-view-more-btn"
              onClick={() => {
                sounds.playClick();
                if (onSelectCategory) onSelectCategory(shelfCategory);
              }}
            >
              <span>View more</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Shelf Grid Row */}
        <div className="gamepix-shelf-grid">
          {shelfGames.slice(0, 6).map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={onPlayGame}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    );
  };

  // Check if we should render Home Categorized Shelves
  const isHomeView = activePage === 'home' && !activeCategory && !searchQuery;

  if (isHomeView) {
    // Categorize games for GamePix shelves
    const mostPlayedGames = [...games].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    const trendingGames = games.filter(g => g.featured || g.badge === 'HOT' || g.badge === 'TRENDING');
    const shootingGames = games.filter(g => (g.category || '').toLowerCase() === 'shooting');
    const carGames = games.filter(g => (g.category || '').toLowerCase() === 'racing');
    const twoPlayerGames = games.filter(g => (g.category || '').toLowerCase() === 'multiplayer');
    const actionGames = games.filter(g => (g.category || '').toLowerCase() === 'action' || (g.category || '').toLowerCase() === 'arcade');
    const puzzleGames = games.filter(g => (g.category || '').toLowerCase() === 'puzzle');

    return (
      <div className="gamepix-home-shelves-container">
        {/* 1. Recently Played Shelf (if any) */}
        {recentlyPlayed.length > 0 && (
          <div className="gamepix-shelf-section">
            <div className="gamepix-shelf-header">
              <div className="shelf-title-left">
                <div className="shelf-icon-wrapper recent-icon">
                  <Clock size={22} />
                </div>
                <h3 className="shelf-main-title">Recently Played</h3>
              </div>
            </div>

            <div className="gamepix-recent-scroll-row">
              {recentlyPlayed.slice(0, 8).map((game) => (
                <div
                  key={`recent-${game.id}`}
                  className="gamepix-recent-card"
                  onClick={() => {
                    sounds.playClick();
                    onPlayGame(game);
                  }}
                  title={`Play: ${game.title}`}
                >
                  <img src={game.thumbnail} alt={game.title} className="gamepix-recent-img" />
                  <div className="gamepix-recent-info">
                    <span className="recent-card-title">{game.title}</span>
                    <span className="recent-card-cat">{game.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Most Played Games */}
        {renderGamePixShelf('Most Played Games', Trophy, '', mostPlayedGames)}

        {/* 3. Trending & Hot Hits */}
        {renderGamePixShelf('Trending Now', Flame, 'trending', trendingGames.length > 0 ? trendingGames : mostPlayedGames.slice(6, 12))}

        {/* 4. Shooting Games */}
        {renderGamePixShelf('Shooting Games', Crosshair, 'shooting', shootingGames.length > 0 ? shootingGames : games.filter(g => (g.tags || []).includes('Shooter')))}

        {/* 5. Car & Racing Games */}
        {renderGamePixShelf('Car & Racing Games', Car, 'racing', carGames.length > 0 ? carGames : games.filter(g => (g.tags || []).includes('Car')))}

        {/* 6. 2 Player Games */}
        {renderGamePixShelf('2 Player Games', Users, 'multiplayer', twoPlayerGames.length > 0 ? twoPlayerGames : games.filter(g => (g.tags || []).includes('2-Player')))}

        {/* 7. Action & Arcade Games */}
        {renderGamePixShelf('Action Games', Swords, 'action', actionGames)}

        {/* 8. Puzzle & Brain Games */}
        {renderGamePixShelf('Puzzle Games', Puzzle, 'puzzle', puzzleGames)}
      </div>
    );
  }

  // Single Category or Search Results Full Grid View
  const sortedList = getSortedGames(games);

  return (
    <section className="gamepix-category-grid-section">
      {/* Category / Search Grid Header */}
      <div className="grid-header-row">
        <div className="grid-title-group">
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

          <h2 className="grid-main-title poki-brand-heading">
            {searchQuery ? (
              <>Search Results for: <span className="highlight-text">"{searchQuery}"</span></>
            ) : (
              title || (activeCategory ? `${activeCategory.toUpperCase()} GAMES` : 'Games')
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

      {/* Game Cards Grid */}
      <div className="game-cards-masonry-grid">
        {sortedList.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={onPlayGame}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {sortedList.length === 0 && (
        <div className="empty-grid-state">
          <div className="empty-icon-circle">
            <Gamepad2 size={48} color="#f52d7e" />
          </div>
          <h3>{searchQuery ? 'No games found' : 'No games in this category yet'}</h3>
          <p>
            {searchQuery
              ? 'Try searching for another keyword or selecting a different category from the sidebar.'
              : 'Add games from the Admin Control Panel to display them here.'}
          </p>
        </div>
      )}
    </section>
  );
}
