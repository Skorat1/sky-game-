import React from 'react';

export default function AdminNavbar({ 
  activeTab, 
  onOpenGameModal, 
  onOpenUserModal,
  onToggleSidebar, 
  livePlayerCount = 0, 
  adminUser, 
  onLogout,
  dbStatus
}) {
  const titles = {
    dashboard: 'Dashboard',
    games: 'Games Catalog',
    users: 'Users & Players',
    categories: 'Categories',
    submissions: 'Dev Submissions',
    messages: 'Support Inbox'
  };

  return (
    <header className="admin-header">
      {/* Left: Breadcrumbs */}
      <div className="header-left">
        <div className="navbar-breadcrumbs">
          <span className="breadcrumb-root">
            <span>Dashboards</span>
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-active">{titles[activeTab] || 'Dashboard'}</span>

          <span className="live-indicator" title="Live Visitors Realtime Telemetry">
            <span className="live-dot" />
            <span>{livePlayerCount.toLocaleString()} Live</span>
          </span>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="header-right">
        {activeTab === 'games' && onOpenGameModal && (
          <button className="header-btn primary" onClick={() => onOpenGameModal(null)}>
            <span>Add New Game</span>
          </button>
        )}

        {activeTab === 'users' && onOpenUserModal && (
          <button className="header-btn primary" onClick={() => onOpenUserModal(null)}>
            <span>Add New User</span>
          </button>
        )}
      </div>
    </header>
  );
}
