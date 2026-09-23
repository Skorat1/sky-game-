import React, { useState, useEffect, useMemo, memo } from 'react';
import { Search, X, Gamepad2, Menu } from 'lucide-react';
import { sounds } from '../utils/audio';
import { socket } from '../utils/socket';

const SkyNavbar = memo(function SkyNavbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  onSelectCategory,
  searchInputRef,
  games = [],
  onSelectGame,
  onOpenAuth,
  user,
  onToggleSidebar,
  onOpenSidebar,
  onOpenMultiplayer,
  level = 1
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    socket.on('online:count', (data) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    });
    return () => {
      socket.off('online:count');
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return games.filter(g =>
      (g.title || '').toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);
  }, [searchQuery, games]);

  return (
    <header className="sky-advanced-navbar">
      <div className="sky-navbar-wrapper">
        {/* Main Row: Sidebar Toggle + Brand Logo + Search Bar + Login/Profile */}
        <div className="sky-navbar-main-row">

          <div className="sky-navbar-left-group">
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
              className="sky-standalone-logo"
              onClick={() => {
                sounds.playClick();
                onSelectCategory('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="ThopGame Arcade - Home"
            >
              <img
                src="/thopgame-logo.png"
                alt="ThopGames Logo"
                className="sky-logo-badge-icon-img"
              />
              <div className="sky-logo-text-box">
                <span className="sky-text-sky">Thop</span>
                <span className="sky-text-games">Games</span>
              </div>
            </div>
          </div>

          {/* 3. Advanced Search Input Bar */}
          <div className={`sky-advanced-search-box ${isFocused ? 'focused' : ''}`}>
            <div className="sky-search-lens-wrapper">
              <Search size={20} className="sky-search-lens-icon" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              className="sky-advanced-search-input"
              placeholder="Search 500+ games, action, racing, 2-player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              aria-label="Search games"
            />

            {searchQuery ? (
              <button
                className="sky-search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  if (searchInputRef?.current) searchInputRef.current.focus();
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            ) : (
              <span className="sky-search-shortcut-tag" title="Search shortcut">/</span>
            )}

            {/* Predictive Autocomplete Search Dropdown */}
            {isFocused && searchResults.length > 0 && (
              <div className="sky-search-dropdown">
                <div className="sky-dropdown-header">
                  <span>Quick Results ({searchResults.length})</span>
                </div>
                {searchResults.map((game) => (
                  <div
                    key={game.id || game._id}
                    className="sky-dropdown-item"
                    onMouseDown={() => {
                      sounds.playClick();
                      if (onSelectGame) onSelectGame(game);
                      setSearchQuery('');
                    }}
                  >
                    <img
                      src={game.thumbnail || game.thumbnailUrl || game.thumb || game.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'}
                      alt={game.title}
                      className="sky-dropdown-thumb"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="sky-dropdown-info">
                      <span className="sky-dropdown-title">{game.title}</span>
                      <span className="sky-dropdown-cat">{game.category || 'Arcade'}</span>
                    </div>
                    <span className="sky-dropdown-play">PLAY ▶</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
});

export default SkyNavbar;
