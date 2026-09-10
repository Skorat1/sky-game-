import React from 'react';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  gamesCount, 
  submissionsCount, 
  unreadMessagesCount,
  bannerActive 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'games', label: 'Games Manager', icon: '🎮', badge: gamesCount },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'banner', label: 'Banner Alerts', icon: '📢', badge: bannerActive ? 'ON' : null },
    { id: 'submissions', label: 'Dev Submissions', icon: '🚀', badge: submissionsCount > 0 ? submissionsCount : null },
    { id: 'messages', label: 'Inbox / Reports', icon: '📩', badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">⚡</div>
        <div className="brand-text">
          <h1>SKY ADMIN</h1>
          <div className="brand-tag">Master Control</div>
        </div>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="avatar-admin">SA</div>
          <div className="profile-info">
            <div className="user-name">Super Administrator</div>
            <div className="user-role">Full Access</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
