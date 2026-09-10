import React from 'react';
import {
  Home,
  Clock,
  Flame,
  Zap,
  Sparkles,
  Dices,
  Heart,
  Users,
  Car,
  Swords,
  Crosshair,
  Puzzle,
  Trophy,
  Gamepad2,
  Code2,
  ChevronRight,
  Info,
  Shield,
  Mail,
  Rocket
} from 'lucide-react';
import { sounds } from '../utils/audio';

export const GAMEPIX_CATEGORIES = [
  { id: 'multiplayer', name: '2 Player', icon: Users, color: '#b85df5' },
  { id: 'racing', name: 'Car Games', icon: Car, color: '#00f2fe' },
  { id: 'action', name: 'Action', icon: Swords, color: '#f52d7e' },
  { id: 'shooting', name: 'Shooting', icon: Crosshair, color: '#ff4b4b' },
  { id: 'puzzle', name: 'Puzzle', icon: Puzzle, color: '#4facfe' },
  { id: 'sports', name: 'Sports', icon: Trophy, color: '#00f5a0' },
  { id: 'arcade', name: 'Arcade', icon: Gamepad2, color: '#ffd200' },
  { id: 'snake', name: 'Snake', icon: Sparkles, color: '#00f5a0' },
  { id: 'casual', name: 'Casual', icon: Zap, color: '#ff758c' },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
  activePage = 'home',
  activeCategory = '',
  onNavigate,
  onSelectCategory,
  favoritesCount = 0,
  recentlyPlayedCount = 0,
  onOpenFavorites,
  onRandomPlay
}) {
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home, color: '#00f2fe' },
    { id: 'most-played', label: 'Most played', icon: Trophy, color: '#ffd200' },
    { id: 'trending', label: 'Trending', icon: Flame, color: '#f52d7e', badge: 'HOT' },
    { id: 'new', label: 'New', icon: Sparkles, color: '#00f5a0' },
    {
      id: 'random',
      label: 'Surprise me',
      icon: Dices,
      color: '#ffb300',
      isAction: true,
      action: () => {
        sounds.playPowerup();
        if (onRandomPlay) onRandomPlay();
      }
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      color: '#f52d7e',
      badge: favoritesCount > 0 ? favoritesCount : null,
      isAction: true,
      action: () => {
        sounds.playClick();
        if (onOpenFavorites) onOpenFavorites();
      }
    }
  ];

  const handleNavClick = (item) => {
    sounds.playClick();
    if (item.isAction && item.action) {
      item.action();
    } else {
      onNavigate(item.id);
    }
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleCategoryClick = (catId) => {
    sounds.playClick();
    onSelectCategory(catId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleFooterLinkClick = (pageId) => {
    sounds.playClick();
    if (onNavigate) onNavigate(pageId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="gamepix-sidebar-backdrop"
          onClick={() => {
            sounds.playClick();
            setIsOpen(false);
          }}
        />
      )}

      {/* GamePix Sticky Left Sidebar */}
      <aside className={`gamepix-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="gamepix-sidebar-inner custom-scrollbar">
          
          {/* Main Navigation Section */}
          <div className="gamepix-side-section">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id && !activeCategory && !item.isAction;

              return (
                <button
                  key={item.id}
                  className={`gamepix-side-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <div className="gamepix-side-icon-box" style={{ color: item.color }}>
                    <Icon size={20} className={item.id === 'favorites' && favoritesCount > 0 ? 'fill-fav' : ''} />
                  </div>
                  <span className="gamepix-side-label">{item.label}</span>
                  {item.badge && (
                    <span className={`gamepix-side-badge ${item.id === 'trending' ? 'badge-hot' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="gamepix-side-divider" />

          {/* Categories & Tags Section */}
          <div className="gamepix-side-section">
            <div className="gamepix-section-title">
              <span>CATEGORIES</span>
            </div>

            {GAMEPIX_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  className={`gamepix-side-item category-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  title={cat.name}
                >
                  <div className="gamepix-side-icon-box" style={{ color: cat.color }}>
                    <Icon size={19} />
                  </div>
                  <span className="gamepix-side-label">{cat.name}</span>
                  <ChevronRight size={14} className="gamepix-side-chevron" />
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="gamepix-side-divider" />

          {/* Integrated Sidebar Footer Section (Developer + Legal + Live Status) */}
          <div className="sidebar-footer-block">
            {/* Developer Button */}
            <button
              className={`sidebar-dev-action-btn ${activePage === 'developers' ? 'active' : ''}`}
              onClick={() => handleFooterLinkClick('developers')}
              title="Publish Your Game"
            >
              <Rocket size={17} className="text-cyan" />
              <span>Submit Game</span>
            </button>

            {/* Quick Links Row */}
            <div className="sidebar-links-group">
              <button onClick={() => handleFooterLinkClick('about')} className="sidebar-mini-link">
                <Info size={13} /> <span>About</span>
              </button>
              <span className="sidebar-link-dot">•</span>
              <button onClick={() => handleFooterLinkClick('privacy')} className="sidebar-mini-link">
                <Shield size={13} /> <span>Privacy</span>
              </button>
              <span className="sidebar-link-dot">•</span>
              <button onClick={() => handleFooterLinkClick('contact')} className="sidebar-mini-link">
                <Mail size={13} /> <span>Contact</span>
              </button>
            </div>

            {/* Server Status Indicator */}
            <div className="sidebar-status-indicator">
              <span className="status-live-ping"></span>
              <span>60 FPS • Operational</span>
            </div>

            {/* Mini Copyright */}
            <div className="sidebar-copyright-text">
              © {new Date().getFullYear()} SKYGAMES Platform
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
