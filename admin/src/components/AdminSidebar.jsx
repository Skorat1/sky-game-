import React from 'react';
import { CONFIG } from '../config';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  gamesCount = 0, 
  usersCount = 0,
  submissionsCount = 0, 
  unreadMessagesCount = 0,
  bannerActive = false,
  adminUser,
  onLogout,
  isOpen,
  onClose
}) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Overview & Telemetry', icon: '📊' },
    { id: 'games', label: 'Games Catalog', icon: '🎮' },
    { id: 'users', label: 'User & Player Accounts', icon: '👥' },
    { id: 'categories', label: 'Game Categories', icon: '🏷️' }
  ];

  const opsNavItems = [
    { id: 'banner', label: 'Banner Broadcast', icon: '📢', badge: bannerActive ? 'LIVE' : null, isLive: bannerActive },
    { id: 'submissions', label: 'Dev Submissions', icon: '🚀', badge: submissionsCount > 0 ? submissionsCount : null },
    { id: 'messages', label: 'Support & Inquiries', icon: '📩', badge: unreadMessagesCount > 0 ? unreadMessagesCount : null }
  ];

  const adminInitial = (adminUser?.username || adminUser?.name || 'A')[0].toUpperCase();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Sidebar Top Header */}
      <div className="sidebar-header">
        <img
          src="/sky-icon.png"
          alt="ThopGame"
          style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '10px', background: '#fff', padding: '2px' }}
        />
        <div className="brand-text">
          <h1>THOP<span>GAME</span></h1>
          <div className="brand-tag">
            <span className="live-dot" style={{ width: 5, height: 5 }}></span>
            <span>CONTROL CENTER</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="nav-links">
        <div className="nav-section-label">Main Console</div>
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
            <span>{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.isLive ? 'live' : ''}`}>{item.badge}</span>
            )}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>Operations & Feed</div>
        {opsNavItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span className={`nav-badge ${item.isLive ? 'live' : ''}`}>{item.badge}</span>
            )}
          </button>
        ))}
      </div>


      {/* Main Website Shortcut Button */}
      <div style={{ padding: '0 12px 10px' }}>
        <a
          href={CONFIG.PORTAL_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            color: '#38bdf8',
            fontWeight: '700',
            fontSize: '0.84rem',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #00f2fe 0%, #2563eb 100%)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 242, 254, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)';
            e.currentTarget.style.color = '#38bdf8';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
        >
          <span>🚀</span>
          <span>Open Main Gaming Portal</span>
        </a>
      </div>

      {/* Admin Profile Footer */}
      <div className="sidebar-footer">
        <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div className="avatar-admin">{adminInitial}</div>
            <div className="profile-info" style={{ overflow: 'hidden' }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminUser?.username || adminUser?.name || 'SuperAdmin'}
              </div>
              <div className="user-role">
                ⚡ {adminUser?.role ? String(adminUser.role).toUpperCase() : 'ADMIN'}
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '5px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.color = '#f87171';
              }}
            >
              Exit
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
