import React from 'react';
import { User, Search } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function SkyBrandCard({ onOpenAuth, onFocusSearch, user }) {
  return (
    <div className="poki-brand-card-widget">
      {/* Top half: Big Logo */}
      <div 
        className="poki-brand-card-top"
        onClick={() => {
          sounds.playClick();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="SkyGames Arcade"
      >
        <div className="poki-brand-logo-large">
          <span className="poki-logo-char">s</span>
          <span className="poki-logo-char">k</span>
          <span className="poki-logo-char">y</span>
          <div className="poki-logo-dot-container">
            <span className="poki-logo-char">g</span>
            <div className="poki-logo-wave-inner" />
          </div>
          <span className="poki-logo-char">a</span>
          <span className="poki-logo-char">m</span>
          <span className="poki-logo-char">e</span>
          <span className="poki-logo-char">s</span>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="poki-brand-card-divider" />

      {/* Bottom half: Split into 👤 User and 🔍 Search */}
      <div className="poki-brand-card-bottom">
        {/* Left: People / User Profile */}
        <button
          className="poki-brand-action-btn user-action-btn"
          onClick={() => {
            sounds.playClick();
            onOpenAuth();
          }}
          title={user ? `Logged in as ${user.name}` : "Login or Register"}
          aria-label="User profile and login"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt={user.name} className="poki-btn-avatar" />
          ) : (
            <User size={24} className="poki-btn-icon user-icon" />
          )}
          {user && <span className="poki-user-online-dot" />}
        </button>

        {/* Vertical subtle divider between the two buttons */}
        <div className="poki-brand-card-subdivider" />

        {/* Right: Search */}
        <button
          className="poki-brand-action-btn search-action-btn"
          onClick={() => {
            sounds.playClick();
            onFocusSearch();
          }}
          title="Search games"
          aria-label="Search games"
        >
          <Search size={24} className="poki-btn-icon search-icon" />
        </button>
      </div>
    </div>
  );
}
