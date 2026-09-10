import React, { useState } from 'react';
import { Search, X, User, Gamepad2, Menu, Heart } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function PokiNavbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelectCategory,
  searchInputRef,
  games = [],
  onSelectGame,
  onOpenAuth,
  user,
  isSidebarOpen,
  onToggleSidebar,
  favoritesCount = 0,
  onOpenFavorites
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
    <header className="poki-advanced-navbar">
      <div className="poki-navbar-wrapper">
        {/* Main Row: Sidebar Toggle + Brand Logo + Search Bar + Favorites + Login */}
        <div className="poki-navbar-main-row">
          
          <div className="poki-navbar-left-group">
            {/* 1. GamePix Sidebar Menu Toggle Button */}
            <button
              className="gamepix-menu-toggle-btn"
              onClick={() => {
                sounds.playClick();
                if (onToggleSidebar) onToggleSidebar();
              }}
              title="Toggle sidebar menu"
              aria-label="Toggle sidebar menu"
            >
              <Menu size={22} />
            </button>

            {/* 2. Standalone Advanced Brand Logo */}
            <div
              className="poki-standalone-logo"
              onClick={() => {
                sounds.playClick();
                onSelectCategory('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="SkyGames Arcade - Home"
            >
              <div className="poki-logo-badge">
                <Gamepad2 size={24} className="poki-logo-badge-icon" />
                <div className="poki-logo-badge-glow" />
              </div>

              <div className="poki-logo-text-box">
                <span className="poki-text-sky">SKY</span>
                <span className="poki-text-games">GAMES</span>
                <div className="poki-logo-smile-curve" />
              </div>
            </div>
          </div>

          {/* 3. Advanced Search Input Bar */}
          <div className={`poki-advanced-search-box ${isFocused ? 'focused' : ''}`}>
            <div className="poki-search-lens-wrapper">
              <Search size={20} className="poki-search-lens-icon" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              className="poki-advanced-search-input"
              placeholder="Search 500+ games, action, racing, 2-player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            />

            {searchQuery ? (
              <button
                className="poki-search-clear-btn"
                onClick={() => {
                  sounds.playClick();
                  setSearchQuery('');
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <span className="poki-search-shortcut-tag">/</span>
            )}

            {/* Predictive Autocomplete Dropdown */}
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

          {/* 4. Action Buttons (Favorites + Login/Profile) */}
          <div className="poki-navbar-right-group">
            {/* Quick Favorites Button */}
            <button
              className="gamepix-fav-header-btn"
              onClick={() => {
                sounds.playClick();
                if (onOpenFavorites) onOpenFavorites();
              }}
              title="Saved Favorites"
            >
              <Heart size={18} className={favoritesCount > 0 ? 'fill-fav' : ''} />
              {favoritesCount > 0 && (
                <span className="gamepix-header-badge">{favoritesCount}</span>
              )}
            </button>

            {/* Separate Advanced Login / Account Button */}
            <button
              className={`poki-advanced-auth-btn ${user ? 'is-logged-in' : ''}`}
              onClick={() => {
                sounds.playClick();
                onOpenAuth();
              }}
              title={user ? `Profile: ${user.name}` : "Login or Create Account"}
            >
              {user ? (
                <>
                  <img src={user.avatar} alt={user.name} className="poki-user-auth-avatar" />
                  <div className="poki-user-auth-meta">
                    <span className="poki-user-auth-name">{user.name.split(' ')[0]}</span>
                    <span className="poki-user-auth-status">● Active</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="poki-auth-icon-circle">
                    <User size={18} />
                  </div>
                  <span className="poki-auth-btn-text">Sign In</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
