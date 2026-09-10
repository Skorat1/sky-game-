import React from 'react';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  gamesCount, 
  usersCount = 0,
  submissionsCount, 
  unreadMessagesCount,
  bannerActive 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'games', label: 'Games Manager', icon: '🎮', badge: gamesCount },
    { id: 'users', label: 'User Accounts', icon: '👥', badge: usersCount > 0 ? usersCount : null },
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

      <div style={{ padding: '0 12px 14px' }}>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(184, 93, 245, 0.15))',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            color: '#00f2fe',
            fontWeight: '700',
            fontSize: '0.85rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0, 242, 254, 0.15)',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #00f2fe, #b85df5)';
            e.currentTarget.style.color = '#0b0216';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(184, 93, 245, 0.15))';
            e.currentTarget.style.color = '#00f2fe';
          }}
        >
          <span>🚀</span>
          <span>Open SkyGame Site</span>
        </a>
      </div>

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
