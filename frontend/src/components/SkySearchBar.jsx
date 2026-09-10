import React, { useRef, useState } from 'react';
import { Search, X, Gamepad2, Sparkles, Flame, Trophy, Volume2, VolumeX, Heart, User } from 'lucide-react';
import { sounds } from '../utils/audio';

const SKY_CATEGORIES = [
  { id: 'all', label: 'ALL GAMES' },
  { id: 'shooting', label: 'SHOOTING GAMES' },
  { id: 'multiplayer', label: '2 PLAYER GAMES' },
  { id: 'racing', label: 'CAR GAMES' },
  { id: 'action', label: 'ACTION GAMES' },
  { id: 'skill', label: 'SKILL GAMES' },
  { id: 'sports', label: 'SPORTS GAMES' },
  { id: 'puzzle', label: 'PUZZLE GAMES' },
  { id: 'arcade', label: 'ARCADE GAMES' },
  { id: 'casual', label: 'CASUAL GAMES' }
];

export default function SkySearchBar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelectCategory,
  searchInputRef,
  games = [],
  onSelectGame,
  onOpenAuth,
  user,
  favoritesCount = 0,
  onOpenFavorites,
  isMuted,
  onToggleMute
}) {
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = searchQuery.trim() === ''
    ? []
    : games.filter(g =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    ).slice(0, 6);

  return (
    <div className="poki-search-hero-container">
      {/* Top Bar with Minimal Tools & Clean Search Input */}
      <div className="poki-search-bar-row">
        <div className={`poki-search-input-wrapper ${isFocused ? 'focused' : ''}`}>
          {/* Left Brand Badge in input */}
          <div className="poki-search-input-logo">
            <div className="poki-input-icon-circle">
              <div className="poki-input-wave" />
            </div>
          </div>

          {/* Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            className="poki-main-search-input"
            placeholder="What are you playing today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
          />

          {/* Right Action Icons */}
          {searchQuery ? (
            <button
              className="poki-search-clear-btn"
              onClick={() => {
                sounds.playClick();
                setSearchQuery('');
              }}
              title="Clear search"
            >
              <X size={18} />
            </button>
          ) : (
            <div className="poki-search-right-icon">
              <Search size={20} />
            </div>
          )}

          {/* Autocomplete Dropdown */}
          {isFocused && searchResults.length > 0 && (
            <div className="poki-search-dropdown">
              <div className="poki-dropdown-header">
                <span>SUGGESTED GAMES ({searchResults.length})</span>
              </div>
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  className="poki-dropdown-item"
                  onMouseDown={() => {
                    sounds.playClick();
                    onSelectGame(game);
                    setSearchQuery('');
                    setIsFocused(false);
                  }}
                >
                  <img src={game.thumbnail} alt={game.title} className="poki-dropdown-thumb" />
                  <div className="poki-dropdown-info">
                    <span className="poki-dropdown-title">{game.title}</span>
                    <span className="poki-dropdown-cat">{game.category?.toUpperCase() || 'ARCADE'}</span>
                  </div>
                  <span className="poki-dropdown-play">PLAY ▶</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Right Quick Controls (Favorites & Sound) */}
        <div className="poki-top-quick-actions">
          {/* Favorites Button */}
          <button
            className="poki-quick-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenFavorites) onOpenFavorites();
            }}
            title="Saved Favorite Games"
          >
            <Heart size={20} className={favoritesCount > 0 ? "fill-crimson text-crimson" : ""} />
            {favoritesCount > 0 && <span className="poki-quick-badge">{favoritesCount}</span>}
          </button>

          {/* Audio Toggle */}
          <button
            className="poki-quick-btn"
            onClick={() => {
              sounds.playClick();
              if (onToggleMute) onToggleMute();
            }}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* User / Profile Quick Button */}
          <button
            className="poki-quick-btn user-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenAuth) onOpenAuth();
            }}
            title={user ? `Profile: ${user.name}` : "Log In / Register"}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="poki-user-tiny-avatar" />
            ) : (
              <User size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Category Pills */}
      <div className="poki-category-pills-scroll">
        {SKY_CATEGORIES.map((cat) => {
          const isActive = (activeCategory === cat.id) || (!activeCategory && cat.id === 'all');
          return (
            <button
              key={cat.id}
              className={`poki-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                onSelectCategory(cat.id === 'all' ? '' : cat.id);
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
