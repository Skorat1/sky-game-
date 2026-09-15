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

import { GAMES as DEFAULT_STATIC_GAMES, CATEGORIES as DEFAULT_STATIC_CATEGORIES } from './data/games';
import { sounds } from './utils/audio';
import { socket } from './utils/socket';
import { CONFIG } from './config';
import { gamesApi, categoriesApi, bannerApi } from './services/api';

const { STORAGE_KEYS } = CONFIG;

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
                localStorage.removeItem(STORAGE_KEYS.CACHED_GAMES);
                localStorage.removeItem(STORAGE_KEYS.CACHED_CATEGORIES);
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
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_GAMES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_STATIC_GAMES;
  });

  // Dynamic live categories from backend/admin
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_CATEGORIES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_STATIC_CATEGORIES;
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
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingGameId, setPendingGameId] = useState(initialNav.gameId);
  const [selectedGame, setSelectedGame] = useState(null);

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
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
      const [liveGames, liveBanner, liveCats] = await Promise.all([
        gamesApi.getLiveGames().catch(() => null),
        bannerApi.getLiveBanner().catch(() => null),
        categoriesApi.getLiveCategories().catch(() => null)
      ]);

      if (Array.isArray(liveGames) && liveGames.length > 0) {
        setGames(liveGames);
        try {
          localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(liveGames));
        } catch { }
      }

      if (liveBanner) {
        setBanner(liveBanner);
      }

      if (Array.isArray(liveCats) && liveCats.length > 0) {
        setCategories(liveCats);
        try {
          localStorage.setItem(STORAGE_KEYS.CACHED_CATEGORIES, JSON.stringify(liveCats));
        } catch { }
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
      setGames(prev => {
        const next = [newGame, ...prev.filter(g => g.id !== newGame.id)];
        try { localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(next)); } catch { }
        return next;
      });
    };

    const handleGameUpdated = (updatedGame) => {
      setGames(prev => {
        const next = prev.map(g => (g.id === updatedGame.id || (g._id && g._id === updatedGame._id)) ? updatedGame : g);
        try { localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(next)); } catch { }
        return next;
      });
      setSelectedGame(prev => (prev && (prev.id === updatedGame.id || prev._id === updatedGame._id)) ? updatedGame : prev);
    };

    const handleGameDeleted = (data) => {
      setGames(prev => {
        const next = prev.filter(g => g.id !== data.id && g._id !== data.id);
        try { localStorage.setItem(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(next)); } catch { }
        return next;
      });
      setSelectedGame(prev => (prev && (prev.id === data.id || prev._id === data.id)) ? null : prev);
    };

    const handleAllGamesDeleted = () => {
      setGames([]);
      try { localStorage.removeItem(STORAGE_KEYS.CACHED_GAMES); } catch { }
      setSelectedGame(null);
    };

    const handleLiveUserUpdated = (updatedUser) => {
      if (!updatedUser) return;
      setUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.id === updatedUser.id || (prevUser._id && prevUser._id === updatedUser._id)) {
          const merged = { ...prevUser, ...updatedUser };
          try { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged)); } catch { }
          return merged;
        }
        return prevUser;
      });
    };

    const handleLiveUserDeleted = (data) => {
      const deletedId = typeof data === 'object' ? (data.id || data._id) : data;
      setUser(prevUser => {
        if (!prevUser) return null;
        if (prevUser.id === deletedId || prevUser._id === deletedId) {
          try {
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
          } catch { }
          return null;
        }
        return prevUser;
      });
    };

    // Category Live WebSockets synchronization
    const handleCategoryNew = (newCat) => {
      if (!newCat) return;
      setCategories(prev => {
        if (prev.some(c => c.id === newCat.id)) return prev;
        const next = [...prev, newCat];
        try { localStorage.setItem(STORAGE_KEYS.CACHED_CATEGORIES, JSON.stringify(next)); } catch { }
        return next;
      });
    };

    const handleCategoryUpdate = (updatedCat) => {
      if (!updatedCat) return;
      setCategories(prev => {
        const next = prev.map(c => (c.id === updatedCat.id || (c._id && c._id === updatedCat._id)) ? { ...c, ...updatedCat } : c);
        try { localStorage.setItem(STORAGE_KEYS.CACHED_CATEGORIES, JSON.stringify(next)); } catch { }
        return next;
      });
    };

    const handleCategoryDelete = (catId) => {
      if (!catId) return;
      setCategories(prev => {
        const next = prev.filter(c => c.id !== catId && c._id !== catId);
        try { localStorage.setItem(STORAGE_KEYS.CACHED_CATEGORIES, JSON.stringify(next)); } catch { }
        return next;
      });
      setActiveCategory(prev => (prev === catId ? '' : prev));
    };

    socket.on('banner:update', handleBannerUpdate);
    socket.on('game:play:increment', handleGameIncrement);
    socket.on('game:created', handleGameCreated);
    socket.on('game:updated', handleGameUpdated);
    socket.on('game:deleted', handleGameDeleted);
    socket.on('game:all_deleted', handleAllGamesDeleted);
    socket.on('user:updated', handleLiveUserUpdated);
    socket.on('user:deleted', handleLiveUserDeleted);
    socket.on('category:new', handleCategoryNew);
    socket.on('category:update', handleCategoryUpdate);
    socket.on('category:delete', handleCategoryDelete);

    return () => {
      socket.off('banner:update', handleBannerUpdate);
      socket.off('game:play:increment', handleGameIncrement);
      socket.off('game:created', handleGameCreated);
      socket.off('game:updated', handleGameUpdated);
      socket.off('game:deleted', handleGameDeleted);
      socket.off('game:all_deleted', handleAllGamesDeleted);
      socket.off('user:updated', handleLiveUserUpdated);
      socket.off('user:deleted', handleLiveUserDeleted);
      socket.off('category:new', handleCategoryNew);
      socket.off('category:update', handleCategoryUpdate);
      socket.off('category:delete', handleCategoryDelete);
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
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    if (games.length > 0) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(r => games.some(g => g.id === r.id));
        localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(filtered));
        return filtered;
      });
    } else {
      setRecentlyPlayed([]);
      localStorage.removeItem(STORAGE_KEYS.RECENT);
    }
  }, [games]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentlyPlayed));
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
      const is2p = catKey === 'multiplayer' || catKey === '2-player' || catKey === '2player';
      list = list.filter(g => {
        if (!g) return false;
        const c = (g.category || '').toLowerCase();
        const tags = Array.isArray(g.tags) ? g.tags.map(t => (typeof t === 'string' ? t.toLowerCase() : '')) : [];
        const matches2p = is2p && (
          c.includes('2') || c.includes('multiplayer') || c.includes('two') ||
          tags.some(t => t.includes('2') || t.includes('multiplayer') || t.includes('two'))
        );
        return c === catKey || c.includes(catKey) || tags.some(t => t.includes(catKey)) || matches2p;
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
          categories={categories}
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
                <DeveloperPortal 
                  onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }}
                  categories={categories}
                />
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
                categories={categories}
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

