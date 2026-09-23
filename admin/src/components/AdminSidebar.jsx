import React from 'react';
import { CONFIG } from '../config';

// Professional SVG Icons
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  games: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.188 10.692a5.158 5.158 0 0 1 1.44 4.926 5.156 5.156 0 0 1-4.44 3.425 5.148 5.148 0 0 1-2.84-.988" />
      <path d="M3.312 13.308a5.158 5.158 0 0 1-1.44-4.926 5.156 5.156 0 0 1 4.44-3.425 5.148 5.148 0 0 1 2.84.988" />
      <path d="M7.395 7.968a5.138 5.138 0 0 1-1.137-2.192A5.146 5.146 0 0 1 12.001 2.5a5.156 5.156 0 0 1 5.129 2.534 5.148 5.148 0 0 1 2.071 3.609 5.163 5.163 0 0 1-3.16 5.184" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  categories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
    </svg>
  ),
  submissions: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  messages: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  portal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  external: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  blog: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  )
};

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  gamesCount = 0, 
  usersCount = 0,
  submissionsCount = 0, 
  unreadMessagesCount = 0,
  adminUser,
  onLogout,
  isOpen,
  onClose
}) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboards', icon: Icons.dashboard }
  ];

  const managementNavItems = [
    { id: 'games', label: 'Games Catalog', icon: Icons.games, badge: gamesCount > 0 ? `${gamesCount}` : null },
    { id: 'users', label: 'Users & Players', icon: Icons.users, badge: usersCount > 0 ? `${usersCount}` : null },
    { id: 'categories', label: 'Taxonomy & Tags', icon: Icons.categories },
    { id: 'blog', label: 'Blog & Content', icon: Icons.blog }
  ];

  const operationsNavItems = [
    { id: 'submissions', label: 'Dev Submissions', icon: Icons.submissions, badge: submissionsCount > 0 ? `${submissionsCount}` : null, isAlert: submissionsCount > 0 },
    { id: 'messages', label: 'Support Inbox', icon: Icons.messages, badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null, isAlert: unreadMessagesCount > 0 }
  ];

  const adminName = adminUser?.username || adminUser?.name || 'Admin';
  const adminInitial = adminName[0]?.toUpperCase() || 'A';

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-box">
          <img
            src="/thopgame-logo.svg"
            alt="ThopGames"
            className="sidebar-brand-img"
          />
        </div>
        <div className="brand-text">
          <h1>THOP<span>GAME</span></h1>
          <div className="brand-tag">
            <span className="live-dot pulse-emerald"></span>
            <span>CONTROL CENTER</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups - Techmin Layout */}
      <div className="nav-links">
        <div className="nav-section-label">MAIN</div>
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 14 }}>MANAGEMENT</div>
        {managementNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 14 }}>OPERATIONS</div>
        {operationsNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.isAlert ? 'alert' : 'success'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Website Shortcut Button */}
      <div className="sidebar-portal-box">
        <a
          href={CONFIG.PORTAL_URL}
          target="_blank"
          rel="noreferrer"
          className="portal-shortcut-link"
          title="Launch Live Gaming Website in New Tab"
        >
          <div className="portal-shortcut-left">
            <span className="portal-shortcut-icon">{Icons.portal}</span>
            <span>Gaming Portal</span>
          </div>
          <span className="portal-shortcut-arrow">{Icons.external}</span>
        </a>
      </div>

      {/* Admin Profile Footer */}
      <div className="sidebar-footer">
        <div className="admin-profile-card">
          <div className="admin-profile-left">
            <div className="avatar-admin">
              {adminInitial}
              <span className="avatar-online-dot"></span>
            </div>
            <div className="profile-info">
              <div className="user-name" title={adminName}>
                {adminName}
              </div>
              <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>{adminUser?.role ? String(adminUser.role).toUpperCase() : 'ADMIN'}</span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-admin-logout"
              title="Sign Out of Admin Console"
            >
              {Icons.logout}
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
