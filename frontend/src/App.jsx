import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PokiNavbar from './components/PokiNavbar';
import Sidebar from './components/Sidebar';
import GameGrid from './components/GameGrid';
import GamePlayerView from './components/GamePlayerView';
import FavoritesDrawer from './components/FavoritesDrawer';
import AuthModal from './components/AuthModal';
import DeveloperPortal from './components/DeveloperPortal';
import AboutModal from './components/AboutModal';
import ContactModal from './components/ContactModal';
import PrivacyModal from './components/PrivacyModal';
import Footer from './components/Footer';

import { GAMES as DEFAULT_STATIC_GAMES } from './data/games';
import { sounds } from './utils/audio';

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

export default function App() {
  const initialNav = useMemo(() => parseUrlNavState(), []);

  const [games, setGames] = useState([]);
  const [banner, setBanner] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

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
        if (Array.isArray(liveGames)) {
          setGames(liveGames);
        }
      }

      if (bannerRes.ok) {
        const liveBanner = await bannerRes.json();
        setBanner(liveBanner);
      }
    } catch (err) {

    }
  }, []);

  useEffect(() => {
    fetchLivePlatformData();
    const interval = setInterval(fetchLivePlatformData, 5000);
    return () => clearInterval(interval);
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

  const handleToggleFavorite = (gameId) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const handlePlayGame = (game) => {
    const gKey = game.id || game._id || game.title;
    setSelectedGame(game);
    setPendingGameId(gKey);

    const targetUrl = buildNavUrl(gKey, activeCategory, activePage, searchQuery);
    window.history.pushState({ gameId: gKey, category: activeCategory, page: activePage }, '', targetUrl);

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(g => g.id !== game.id);
      return [game, ...filtered].slice(0, 10);
    });
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
    setPendingGameId(null);
    if (window.history.state && window.history.state.gameId) {
      window.history.back();
    } else {
      const targetUrl = buildNavUrl(null, activeCategory, activePage, searchQuery);
      window.history.pushState({ gameId: null, category: activeCategory, page: activePage }, '', targetUrl);
    }
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setActivePage('home');
    setSearchQuery('');
    const targetUrl = buildNavUrl(null, catId, 'home', '');
    window.history.pushState({ gameId: null, category: catId, page: 'home' }, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomPlay = () => {
    if (games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      handlePlayGame(games[randomIndex]);
    }
  };

  const handleNavigation = (pageId) => {
    if (pageId === 'about') {
      setAboutOpen(true);
    } else if (pageId === 'contact') {
      setContactOpen(true);
    } else if (pageId === 'privacy') {
      setPrivacyOpen(true);
    } else {
      setActivePage(pageId);
      setActiveCategory('');
      setSearchQuery('');
      const targetUrl = buildNavUrl(null, '', pageId, '');
      window.history.pushState({ gameId: null, category: '', page: pageId }, '', targetUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayedGames = useMemo(() => {
    let list = [...games];

    list = list.filter(g => !g.status || g.status === 'active');

    if (activePage === 'trending') {
      list = list.filter(g => g.badge === 'HOT' || g.badge === 'TRENDING' || g.badge === 'POPULAR' || g.featured);
    } else if (activePage === 'top-rated' || activePage === 'most-played') {
      list = list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (activePage === 'new') {
      list = list.sort((a, b) => new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01'));
    } else if (activePage === 'recently-played') {
      return recentlyPlayed;
    }

    if (activeCategory) {
      const catKey = activeCategory.toLowerCase();
      list = list.filter(g => {
        const c = (g.category || '').toLowerCase();
        const tags = (g.tags || []).map(t => t.toLowerCase());
        return c.includes(catKey) || tags.includes(catKey) || (catKey === 'multiplayer' && (c.includes('2') || tags.includes('2-player')));
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(g =>
        g.title.toLowerCase().includes(q) ||
        (g.tags && g.tags.some(t => t.toLowerCase().includes(q))) ||
        (g.category && g.category.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [games, activePage, activeCategory, searchQuery, recentlyPlayed]);

  return (
    <div className="sky-app-root poki-theme-root gamepix-app-layout">
      {/* Sitewide Announcement Banner */}
      {banner && banner.active === true && Boolean(banner.message?.trim()) && (
        <div className="poki-sitewide-banner">
          {banner.badge && <span className="poki-banner-badge">{banner.badge}</span>}
          <span>{banner.message}</span>
          {banner.ctaText && (
            <a href={banner.ctaLink || '#'} className="poki-banner-cta">
              {banner.ctaText}
            </a>
          )}
        </div>
      )}

      {/* GamePix Modern Sticky Navbar */}
      <PokiNavbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        searchInputRef={searchInputRef}
        games={games}
        onSelectGame={handlePlayGame}
        onOpenAuth={() => setAuthModalOpen(true)}
        user={user}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setFavoritesDrawerOpen(true)}
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
              <DeveloperPortal onBackToHome={() => { setActivePage('home'); setActiveCategory(''); }} />
            ) : (
              <GameGrid
                title={
                  activePage === 'trending' ? '🔥 Trending Now' :
                  activePage === 'most-played' ? '🏆 Most Played Games' :
                  activePage === 'top-rated' ? '⭐ Top Rated Games' :
                  activePage === 'new' ? '✨ New Game Releases' :
                  activePage === 'recently-played' ? '🕒 Recently Played' :
                  activeCategory ? `${activeCategory.toUpperCase()} GAMES` :
                  'Home Arcade'
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
              />
            )}
          </main>

          
          <Footer onNavigate={handleNavigation} />
        </div>

      </div>


      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onLogin={(loggedInUser) => setUser(loggedInUser)}
        onLogout={() => setUser(null)}
      />

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

      {/* Info Modals */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
