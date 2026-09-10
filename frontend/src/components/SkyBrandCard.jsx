import React from 'react';
import { User, Search } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function SkyBrandCard({ onOpenAuth, onFocusSearch, user }) {
  return (
    <div className="sky-brand-card-widget">
      {/* Top half: Big Logo */}
      <div
        className="sky-brand-card-top"
        onClick={() => {
          sounds.playClick();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        title="SkyGames Arcade"
      >
        <div className="sky-brand-logo-large">
          <span className="sky-logo-char">s</span>
          <span className="sky-logo-char">k</span>
          <span className="sky-logo-char">y</span>
          <div className="sky-logo-dot-container">
            <span className="sky-logo-char">g</span>
            <div className="sky-logo-wave-inner" />
          </div>
          <span className="sky-logo-char">a</span>
          <span className="sky-logo-char">m</span>
          <span className="sky-logo-char">e</span>
          <span className="sky-logo-char">s</span>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="sky-brand-card-divider" />

      {/* Bottom half: Split into 👤 User and 🔍 Search */}
      <div className="sky-brand-card-bottom">
        {/* Left: People / User Profile */}
        <button
          className="sky-brand-action-btn user-action-btn"
          onClick={() => {
            try { sounds.playClick(); } catch (err) { }
            if (typeof onOpenAuth === 'function') onOpenAuth();
          }}
          title={user ? `Logged in as ${user.name}` : "Login or Register"}
          aria-label="User profile and login"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt={user.name} className="sky-btn-avatar" />
          ) : (
            <User size={24} className="sky-btn-icon user-icon" />
          )}
          {user && <span className="sky-user-online-dot" />}
        </button>

        {/* Vertical subtle divider between the two buttons */}
        <div className="sky-brand-card-subdivider" />

        {/* Right: Search */}
        <button
          className="sky-brand-action-btn search-action-btn"
          onClick={() => {
            sounds.playClick();
            onFocusSearch();
          }}
          title="Search games"
          aria-label="Search games"
        >
          <Search size={24} className="sky-btn-icon search-icon" />
        </button>
      </div>
    </div>
  );
}
