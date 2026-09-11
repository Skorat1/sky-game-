import React, { useState } from 'react';

export default function AdminNavbar({ 
  activeTab, 
  onOpenGameModal, 
  onOpenUserModal,
  onToggleSidebar, 
  livePlayerCount = 0, 
  adminUser, 
  onLogout,
  dbStatus,
  onSearchGlobal
}) {
  const titles = {
    dashboard: 'Platform Overview & Live Telemetry',
    games: 'Games Catalog & Asset Management',
    users: 'User & Gamer Accounts Management',
    categories: 'Game Categories & Taxonomy',
    banner: 'Sitewide Announcement Broadcast',
    submissions: 'Developer Community Submissions',
    messages: 'Inbox & User Feedback Stream',
    settings: 'Platform Configuration & Security'
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="header-btn"
          style={{ padding: '6px 10px', fontSize: '1rem', display: 'none' }}
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          id="mobileSidebarToggle"
        >
          ☰
        </button>

        <div className="page-title">
          <span>{titles[activeTab] || 'Control Center'}</span>
          <span className="live-indicator">
            <span className="live-dot"></span>
            <span>{livePlayerCount.toLocaleString()} Live Visitors</span>
          </span>
        </div>
      </div>

      <div className="header-right">
        {activeTab === 'games' && onOpenGameModal && (
          <button className="header-btn primary" onClick={() => onOpenGameModal(null)}>
            <span>➕</span>
            <span>Add New Game</span>
          </button>
        )}

        {activeTab === 'users' && onOpenUserModal && (
          <button className="header-btn primary" onClick={() => onOpenUserModal(null)}>
            <span>➕</span>
            <span>Add New User</span>
          </button>
        )}
      </div>
    </header>
  );
}
