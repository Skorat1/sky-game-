import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  Gamepad2,
  Heart,
  Volume2,
  VolumeX,
  Code2,
  Flame,
  Star,
  Sparkles,
  Users
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  favoritesCount = 0,
  onOpenFavorites,
  isMuted = false,
  onToggleMute,
  games = [],
  onSelectGame,
  activePage,
  onNavigate
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [onlineCount, setOnlineCount] = useState(14820);

  // Subtle simulated player counter fluctuation for live arcade feel
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 7) - 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const searchResults = searchQuery.trim() === ''
    ? []
    : games.filter(g =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    ).slice(0, 6);

  return (
    <header className="sky-navbar">
      <div className="navbar-container">
        {/* Left: Menu Toggle & Brand Logo */}
        <div className="navbar-left">
          <button
            className="navbar-btn menu-toggle-btn"
            onClick={() => {
              sounds.playClick();
              setSidebarOpen(!sidebarOpen);
            }}
            aria-label="Toggle navigation menu"
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a
            href="#home"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              sounds.playClick();
              if (onNavigate) onNavigate('home');
            }}
          >
            <img
              src="/skygames-logo.png"
              alt="SkyGames"
              style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px 6px' }}
            />
          </a>
        </div>

        {/* Center: Search Bar with Autocomplete */}
        <div className="navbar-center">
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search games, genres, action, racing... (Press /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown Live Search Results */}
            {searchFocused && searchResults.length > 0 && (
              <div className="search-dropdown-menu">
                <div className="search-dropdown-header">
                  <span>FOUND {searchResults.length} MATCHING GAMES</span>
                </div>
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    className="search-result-item"
                    onMouseDown={() => {
                      sounds.playClick();
                      onSelectGame(game);
                      setSearchQuery('');
                      setSearchFocused(false);
                    }}
                  >
                    <img src={game.thumbnail} alt={game.title} className="search-thumb" />
                    <div className="search-info">
                      <h4 className="search-title">{game.title}</h4>
                      <div className="search-meta">
                        <span className="search-cat">{game.category.toUpperCase()}</span>
                        <span className="search-rating">★ {game.rating || 4.8}</span>
                      </div>
                    </div>
                    <span className="search-play-badge">PLAY ▶</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="navbar-right">
          {/* Audio Equalizer Toggle */}
          <button
            className={`navbar-action-btn ${isMuted ? 'muted' : 'unmuted'}`}
            onClick={() => {
              sounds.playClick();
              if (onToggleMute) onToggleMute();
            }}
            title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span className="btn-label-desktop">{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>

          {/* Favorites Drawer Toggle */}
          <button
            className="navbar-action-btn fav-action-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenFavorites) onOpenFavorites();
            }}
            title="View saved favorite games"
          >
            <Heart size={18} className={favoritesCount > 0 ? "fill-crimson text-crimson" : ""} />
            <span className="btn-label-desktop">Favorites</span>
            {favoritesCount > 0 && (
              <span className="navbar-badge fav-badge">{favoritesCount}</span>
            )}
          </button>

          {/* Dev Submission Link */}
          <button
            className={`navbar-action-btn dev-action-btn ${activePage === 'developers' ? 'active' : ''}`}
            onClick={() => {
              sounds.playClick();
              if (onNavigate) onNavigate('developers');
            }}
            title="Developer Portal - Submit your game"
          >
            <Code2 size={18} />
            <span className="btn-label-desktop">Devs</span>
          </button>
        </div>
      </div>
    </header>
  );
}

