import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy, Component } from 'react';
import SkyNavbar from './components/SkyNavbar';
import Sidebar from './components/Sidebar';
import GameGrid from './components/GameGrid';
import GamePlayerView from './components/GamePlayerView';

// Critical auth modal imported directly for instant 0ms response
import AuthModal from './components/AuthModal';

// Code-split other non-critical pages & drawers
const FavoritesDrawer = lazy(() => import('./components/FavoritesDrawer'));
const DeveloperPortal = lazy(() => import('./components/DeveloperPortal'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPage = lazy(() => import('./components/PrivacyPage'));

import { GAMES as DEFAULT_STATIC_GAMES } from './data/games';
import { sounds } from './utils/audio';

import { socket } from './utils/socket';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f6fb',
          color: '#0f172a',
          padding: 24,
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>🎮 SkyGames Ready</h2>
          <p style={{ color: '#94a3b8', maxWidth: 460, marginBottom: 20 }}>
            An unexpected glitch was caught and safely recovered.
          </p>
          <button
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              color: '#070a13',
              fontWeight: 800,
              padding: '12px 28px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              try {
                localStorage.removeItem('sky_cached_games');
              } catch { }
              window.location.href = window.location.origin + window.location.pathname;
            }}
          >
            Reload Arcade
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API_BASE = 'http://localhost:5000/api';

function buildNavUrl(gameId, category, page, search) {
  try {
    const params = new URLSearchParams();
    if (gameId) params.set('game', gameId);
    if (category) params.set('category', category);
    if (page && page !== 'home') params.set('page', page);
    if (search && search.trim()) params.set('q', search.trim());
    const qs = params.toString();
    return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  } catch {
    return window.location.pathname;
  }
}

function parseUrlNavState() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const gameId = urlParams.get('game') || hashParams.get('game') || null;
    const category = urlParams.get('category') || hashParams.get('category') || '';
    const page = urlParams.get('page') || hashParams.get('page') || 'home';
    const search = urlParams.get('q') || '';

    return { gameId, category, page, search };
  } catch {
    return { gameId: null, category: '', page: 'home', search: '' };
  }
}

function App() {
  const initialNav = useMemo(() => parseUrlNavState(), []);

  // Instant 0ms cached games initialization
  const [games, setGames] = useState(() => {
    try {
      const cached = localStorage.getItem('sky_cached_games');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_STATIC_GAMES;
  });

  const [banner, setBanner] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activePage, setActivePage] = useState(initialNav.page);
  const [activeCategory, setActiveCategory] = useState(initialNav.category);
  const [searchQuery, setSearchQuery] = useState(initialNav.search);

  const searchInputRef = useRef(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingGameId, setPendingGameId] = useState(initialNav.gameId);
  const [selectedGame, setSelectedGame] = useState(null);

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('sky_favorites') || localStorage.getItem('thop_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [favoritesDrawerOpen, setFavoritesDrawerOpen] = useState(false);

  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const fetchLivePlatformData = useCallback(async () => {
    try {
      const [gamesRes, bannerRes] = await Promise.all([
        fetch(`${API_BASE}/games`),
        fetch(`${API_BASE}/banner`)
      ]);

      if (gamesRes.ok) {
        const liveGames = await gamesRes.json();
        if (Array.isArray(liveGames) && liveGames.length > 0) {
          setGames(liveGames);
          try {
            localStorage.setItem('sky_cached_games', JSON.stringify(liveGames));
          } catch { }
        }
      }

      if (bannerRes.ok) {
        const liveBanner = await bannerRes.json();
        setBanner(liveBanner);
      }
    } catch (err) {
      // Offline fallback already loaded via cache
    }
  }, []);

  useEffect(() => {
    fetchLivePlatformData();

    // Instant real-time updates via WebSockets
    const handleBannerUpdate = (newBanner) => setBanner(newBanner);
    const handleGameIncrement = (data) => {
      setGames(prev => prev.map(g => g.id === data.id ? { ...g, plays: data.plays } : g));
    };

    const handleGameCreated = (newGame) => {
      setGames(prev => [newGame, ...prev.filter(g => g.id !== newGame.id)]);
    };

    const handleGameUpdated = (updatedGame) => {
      setGames(prev => prev.map(g => (g.id === updatedGame.id || (g._id && g._id === updatedGame._id)) ? updatedGame : g));
      setSelectedGame(prev => (prev && (prev.id === updatedGame.id || prev._id === updatedGame._id)) ? updatedGame : prev);
    };

    const handleGameDeleted = (data) => {
      setGames(prev => prev.filter(g => g.id !== data.id && g._id !== data.id));
      setSelectedGame(prev => (prev && (prev.id === data.id || prev._id === data.id)) ? null : prev);
    };

    const handleAllGamesDeleted = () => {
      setGames([]);
      setSelectedGame(null);
    };

    const handleLiveUserUpdated = (updatedUser) => {
      if (!updatedUser) return;
      setUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.id === updatedUser.id || (prevUser._id && prevUser._id === updatedUser._id)) {
          const merged = { ...prevUser, ...updatedUser };
          try { localStorage.setItem('sky_user', JSON.stringify(merged)); } catch { }
          return merged;
        }
        return prevUser;
      });
    };

    const handleLiveUserDeleted = (data) => {
      if (!data) return;
      setUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.id === data.id || (prevUser._id && prevUser._id === data.id)) {
          try {
            localStorage.removeItem('sky_user');
            localStorage.removeItem('sky_token');
          } catch { }
          return null;
        }
        return prevUser;
      });
    };

    socket.on('banner:update', handleBannerUpdate);
    socket.on('game:play:increment', handleGameIncrement);
    socket.on('game:created', handleGameCreated);
    socket.on('game:updated', handleGameUpdated);
    socket.on('game:deleted', handleGameDeleted);
    socket.on('game:all_deleted', handleAllGamesDeleted);
    socket.on('user:updated', handleLiveUserUpdated);
    socket.on('user:deleted', handleLiveUserDeleted);

    return () => {
      socket.off('banner:update', handleBannerUpdate);
      socket.off('game:play:increment', handleGameIncrement);
      socket.off('game:created', handleGameCreated);
      socket.off('game:updated', handleGameUpdated);
      socket.off('game:deleted', handleGameDeleted);
      socket.off('game:all_deleted', handleAllGamesDeleted);
      socket.off('user:updated', handleLiveUserUpdated);
      socket.off('user:deleted', handleLiveUserDeleted);
    };
  }, [fetchLivePlatformData]);


  useEffect(() => {
    if (pendingGameId && games.length > 0) {
      const found = games.find(g =>
        (g.id && g.id === pendingGameId) ||
        (g._id && g._id.toString() === pendingGameId) ||
        (g.title && g.title.toLowerCase() === pendingGameId.toLowerCase())
      );
      if (found) {
        setSelectedGame(found);
      }
    } else if (!pendingGameId) {
      setSelectedGame(null);
    }
  }, [pendingGameId, games]);

  useEffect(() => {
    const handlePopState = () => {
      const state = parseUrlNavState();
      setActivePage(state.page || 'home');
      setActiveCategory(state.category || '');
      setSearchQuery(state.search || '');
      setPendingGameId(state.gameId);
      if (!state.gameId) {
        setSelectedGame(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  useEffect(() => {
    localStorage.setItem('sky_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sky_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sky_user');
    }
  }, [user]);

  useEffect(() => {
    if (games.length > 0) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(r => games.some(g => g.id === r.id));
        localStorage.setItem('sky_recent', JSON.stringify(filtered));
        return filtered;
      });
    } else {
      setRecentlyPlayed([]);
      localStorage.removeItem('sky_recent');
    }
  }, [games]);

  useEffect(() => {
    localStorage.setItem('sky_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState(
        { root: true, gameId: initialNav.gameId, category: initialNav.category, page: initialNav.page },
        '',
        window.location.href
      );
    }
  }, [initialNav]);

  const handleToggleFavorite = useCallback((gameId) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  }, []);

  const handlePlayGame = useCallback((game) => {
    const gKey = game.id || game._id || game.title;
    setSelectedGame(game);
    setPendingGameId(gKey);

    const targetUrl = buildNavUrl(gKey, activeCategory, activePage, searchQuery);
    window.history.pushState({ gameId: gKey, category: activeCategory, page: activePage }, '', targetUrl);

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(g => g.id !== game.id);
      return [game, ...filtered].slice(0, 10);
    });
  }, [activeCategory, activePage, searchQuery]);

  const handleCloseGame = useCallback(() => {
    setSelectedGame(null);
    setPendingGameId(null);
    if (window.history.state && window.history.state.gameId) {
      window.history.back();
    } else {
      const targetUrl = buildNavUrl(null, activeCategory, activePage, searchQuery);
      window.history.pushState({ gameId: null, category: activeCategory, page: activePage }, '', targetUrl);
    }
  }, [activeCategory, activePage, searchQuery]);

  const handleCategorySelect = useCallback((catId) => {
    setSelectedGame(null);
    setPendingGameId(null);
    setActiveCategory(catId);
    setActivePage('home');
    setSearchQuery('');
    const targetUrl = buildNavUrl(null, catId, 'home', '');
    window.history.pushState({ gameId: null, category: catId, page: 'home' }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRandomPlay = useCallback(() => {
    if (games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      handlePlayGame(games[randomIndex]);
    }
  }, [games, handlePlayGame]);

  const handleNavigation = useCallback((pageId) => {
    setSelectedGame(null);
    setPendingGameId(null);
    setActivePage(pageId);
    setActiveCategory('');
    setSearchQuery('');
    const targetUrl = buildNavUrl(null, '', pageId, '');
    window.history.pushState({ gameId: null, category: '', page: pageId }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const displayedGames = useMemo(() => {
    let list = Array.isArray(games) ? [...games] : [];

    list = list.filter(g => g && (!g.status || g.status === 'active'));

    if (activePage === 'trending') {
      list = list.filter(g => g && (g.badge === 'HOT' || g.badge === 'TRENDING' || g.badge === 'POPULAR' || g.featured));
    } else if (activePage === 'top-rated' || activePage === 'most-played') {
      list = list.sort((a, b) => ((b && b.plays) || 0) - ((a && a.plays) || 0));
    } else if (activePage === 'new') {
      list = list.sort((a, b) => new Date((b && b.createdAt) || '2026-01-01') - new Date((a && a.createdAt) || '2026-01-01'));
    } else if (activePage === 'recently-played') {
      return Array.isArray(recentlyPlayed) ? recentlyPlayed : [];
    }

    if (activeCategory) {
      const catKey = activeCategory.toLowerCase();
      list = list.filter(g => {
        if (!g) return false;
        const c = (g.category || '').toLowerCase();
        const tags = Array.isArray(g.tags) ? g.tags.map(t => (typeof t === 'string' ? t.toLowerCase() : '')) : [];
        return c.includes(catKey) || tags.includes(catKey) || (catKey === 'multiplayer' && (c.includes('2') || tags.includes('2-player')));
      });
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(g => {
        if (!g) return false;
        const titleMatch = g.title && typeof g.title === 'string' && g.title.toLowerCase().includes(q);
        const tagsMatch = Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
        const catMatch = g.category && typeof g.category === 'string' && g.category.toLowerCase().includes(q);
        const descMatch = g.description && typeof g.description === 'string' && g.description.toLowerCase().includes(q);
        return titleMatch || tagsMatch || catMatch || descMatch;
      });
    }

    return list;
  }, [games, activePage, activeCategory, searchQuery, recentlyPlayed]);

  return (
    <div className="sky-app-root sky-theme-root gamepix-app-layout">
      {/* Sitewide Announcement Banner */}
      {banner && banner.active === true && Boolean(banner.message?.trim()) && (
        <div className="sky-sitewide-banner">
          {banner.badge && <span className="sky-banner-badge">{banner.badge}</span>}
          <span>{banner.message}</span>
          {banner.ctaText && (
            <a href={banner.ctaLink || '#'} className="sky-banner-cta">
              {banner.ctaText}
            </a>
          )}
        </div>
      )}

      {/* SkyGames Modern Sticky Navbar */}
      <SkyNavbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        searchInputRef={searchInputRef}
        games={games}
        onSelectGame={handlePlayGame}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          try {
            localStorage.removeItem('sky_token');
            localStorage.removeItem('sky_user');
          } catch { }
          setUser(null);
        }}
        user={user}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setFavoritesDrawerOpen(true)}
        onNavigate={handleNavigation}
      />

      <div className="gamepix-body-layout">

        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activePage={activePage}
          activeCategory={activeCategory}
          onNavigate={handleNavigation}
          onSelectCategory={handleCategorySelect}
          favoritesCount={favorites.length}
          recentlyPlayedCount={recentlyPlayed.length}
          onOpenFavorites={() => setFavoritesDrawerOpen(true)}
          onRandomPlay={handleRandomPlay}
          user={user}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Right Main Content Area */}
        <div className={`gamepix-main-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
          <main className="gamepix-main-content">
            {selectedGame ? (
              <GamePlayerView
                game={selectedGame}
                onClose={handleCloseGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onToggleFavorite={handleToggleFavorite}
                allGames={games}
                onSelectRelatedGame={handlePlayGame}
                onSelectCategory={handleCategorySelect}
              />
            ) : activePage === 'developers' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <DeveloperPortal onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }} />
              </Suspense>
            ) : activePage === 'about' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <AboutPage onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }} />
              </Suspense>
            ) : activePage === 'privacy' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <PrivacyPage onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }} />
              </Suspense>
            ) : activePage === 'contact' ? (
              <Suspense fallback={<div className="loading-spinner" />}>
                <ContactPage onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }} />
              </Suspense>
            ) : (
              <GameGrid
                title={
                  activePage === 'trending' ? '🔥 Trending Now' :
                    activePage === 'most-played' ? '🏆 Most Played Games' :
                      activePage === 'top-rated' ? '⭐ Top Rated Games' :
                        activePage === 'new' ? '✨ New Game Releases' :
                          activePage === 'recently-played' ? '🕒 Recently Played' :
                            activeCategory ? `${activeCategory.toUpperCase()} GAMES` :
                              ''
                }
                games={displayedGames}
                onPlayGame={handlePlayGame}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
                activePage={activePage}
                searchQuery={searchQuery}
                recentlyPlayed={recentlyPlayed}
                onOpenAuth={() => setAuthModalOpen(true)}
                onFocusSearch={() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                user={user}
              />
            )}
          </main>
        </div>

      </div>

      {/* Critical Auth & Profile Modal - Rendered directly for instant response */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onLogin={(loggedInUser) => setUser(loggedInUser)}
        onLogout={() => {
          try {
            localStorage.removeItem('sky_token');
            localStorage.removeItem('sky_user');
          } catch { }
          setUser(null);
        }}
      />

      <Suspense fallback={null}>
        {/* Saved Favorites Sliding Drawer */}
        <FavoritesDrawer
          isOpen={favoritesDrawerOpen}
          onClose={() => setFavoritesDrawerOpen(false)}
          favorites={favorites}
          games={games}
          onPlayGame={handlePlayGame}
          onRemoveFavorite={handleToggleFavorite}
          onClearAll={() => setFavorites([])}
        />
      </Suspense>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

