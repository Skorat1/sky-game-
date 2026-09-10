import React from 'react';

export default function AdminNavbar({ activeTab, onOpenGameModal, onToggleSidebar, livePlayerCount }) {
  const titles = {
    dashboard: 'Platform Overview',
    games: 'Games Inventory & Management',
    categories: 'Game Categories & Tags',
    banner: 'Announcement & Alerts',
    submissions: 'Developer Submissions',
    messages: 'Inbox & User Feedback',
    settings: 'Platform Settings & Config'
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="header-btn" 
          style={{ display: 'none' }}
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        <div className="page-title">
          <span>{titles[activeTab] || 'Admin Dashboard'}</span>
          <span className="live-indicator">
            <span className="live-dot"></span>
            <span>{livePlayerCount.toLocaleString()} Live Players</span>
          </span>
        </div>
      </div>

      <div className="header-right">
        <a 
          href="http://localhost:5173" 
          target="_blank" 
          rel="noreferrer" 
          className="header-btn"
          title="Open Player Website"
        >
          🚀 View Main Website
        </a>

        {activeTab === 'games' && (
          <button className="header-btn primary" onClick={() => onOpenGameModal(null)}>
            ➕ Add New Game
          </button>
        )}
      </div>
    </header>
  );
}
