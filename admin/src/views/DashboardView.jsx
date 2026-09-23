import React, { useState, useEffect } from 'react';
import { WEEKLY_ANALYTICS } from '../data/defaultData';
import { socket } from '../utils/socket';
import GameSandboxModal from '../components/GameSandboxModal';
import CustomSelect from '../components/CustomSelect';
import { statsApi } from '../services/api';

export default function DashboardView({
  games = [],
  users = [],
  categories = [],
  submissions = [],
  messages = [],
  onlineCount: propOnlineCount,
  activeGameCounts = {},
  onNavigateTab,
  onEditGame
}) {
  const [onlineCount, setOnlineCount] = useState(propOnlineCount ?? 0);
  const [activePlayGame, setActivePlayGame] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' | 'month' | 'year'
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (typeof propOnlineCount === 'number') {
      setOnlineCount(propOnlineCount);
    }
  }, [propOnlineCount]);

  useEffect(() => {
    statsApi.getOnlineCount()
      .then(data => {
        if (typeof data?.count === 'number') setOnlineCount(data.count);
      })
      .catch(() => { });

    const handleCount = (data) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    };

    socket.on('online:count', handleCount);
    if (socket.connected) {
      socket.emit('request:online:count');
    }

    return () => {
      socket.off('online:count', handleCount);
    };
  }, []);

  const totalPlays = games.reduce((acc, g) => acc + (g.plays || 0), 0);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const activeGamersCount = users.filter(u => u.role === 'vip' || u.level > 1).length;

  // Filtered games for bottom table
  const filteredGames = games.filter(g => {
    const matchSearch = (g.title || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
                        (g.category || '').toLowerCase().includes(tableSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || (g.status || 'active') === statusFilter;
    return matchSearch && matchStatus;
  });

  // Top 5 Games for the Merchant list
  const topGames = [...games].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);

  return (
    <div className="overview-container">
      {/* ====================================================================
          1. Techmin 4-Card Top Stat Row
          ==================================================================== */}
      <div className="stats-grid-techmin">
        {/* Card 1: Total Plays */}
        <div className="stat-card-techmin">
          <div className="stat-top-row">
            <span className="stat-title-text">Daily average plays</span>
            <span className="stat-trend-capsule up">
              <span>↗</span>
              <span>+1.33% vs last month</span>
            </span>
          </div>

          <div className="stat-value-big">
            {totalPlays > 0 ? (totalPlays >= 1000 ? `${(totalPlays / 1000).toFixed(1)}k` : totalPlays) : '125.8k'}
          </div>

          <div className="stat-bottom-row">
            <div className="stat-sparkline-wrap">
              <svg width="100%" height="32" viewBox="0 0 120 32" preserveAspectRatio="none">
                <path
                  d="M0 24 C 20 28, 35 10, 55 18 C 75 26, 95 6, 120 8"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-pastel-box pastel-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="12" x2="10" y2="12" />
                <line x1="8" y1="10" x2="8" y2="14" />
                <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3" />
                <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3" />
                <rect x="2" y="6" width="20" height="12" rx="6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Registered Gamers */}
        <div className="stat-card-techmin" onClick={() => onNavigateTab && onNavigateTab('users')} style={{ cursor: 'pointer' }}>
          <div className="stat-top-row">
            <span className="stat-title-text">Active Gamers</span>
            <span className="stat-trend-capsule up">
              <span>↗</span>
              <span>+1.22% vs last month</span>
            </span>
          </div>

          <div className="stat-value-big">
            {users.length > 0 ? users.length.toLocaleString() : '1,280'}
          </div>

          <div className="stat-bottom-row">
            <div className="stat-sparkline-wrap">
              <svg width="100%" height="28" viewBox="0 0 100 28">
                <rect x="5" y="14" width="8" height="14" rx="2" fill="#cbd5e1" />
                <rect x="20" y="8" width="8" height="20" rx="2" fill="#cbd5e1" />
                <rect x="35" y="18" width="8" height="10" rx="2" fill="#cbd5e1" />
                <rect x="50" y="4" width="8" height="24" rx="2" fill="#64748b" />
                <rect x="65" y="10" width="8" height="18" rx="2" fill="#cbd5e1" />
                <rect x="80" y="6" width="8" height="22" rx="2" fill="#475569" />
              </svg>
            </div>
            <div className="stat-pastel-box pastel-slate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Catalog Games */}
        <div className="stat-card-techmin" onClick={() => onNavigateTab && onNavigateTab('games')} style={{ cursor: 'pointer' }}>
          <div className="stat-top-row">
            <span className="stat-title-text">Booked catalog</span>
            <span className="stat-trend-capsule up">
              <span>↗</span>
              <span>+2.33% vs last month</span>
            </span>
          </div>

          <div className="stat-value-big">
            {games.length > 0 ? games.length : '180'}
          </div>

          <div className="stat-bottom-row">
            <div className="stat-sparkline-wrap">
              <svg width="100%" height="32" viewBox="0 0 120 32" preserveAspectRatio="none">
                <path
                  d="M0 20 C 25 6, 45 28, 70 12 C 95 2, 110 16, 120 4"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-pastel-box pastel-rose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Dev Submissions */}
        <div className="stat-card-techmin" onClick={() => onNavigateTab && onNavigateTab('submissions')} style={{ cursor: 'pointer' }}>
          <div className="stat-top-row">
            <span className="stat-title-text">Dev Submissions</span>
            <span className={`stat-trend-capsule ${pendingSubmissions.length > 0 ? 'down' : 'up'}`}>
              <span>{pendingSubmissions.length > 0 ? '↘' : '✓'}</span>
              <span>{pendingSubmissions.length > 0 ? '-1.33% vs last month' : 'All Clear'}</span>
            </span>
          </div>

          <div className="stat-value-big">
            {submissions.length > 0 ? submissions.length : '48'}
          </div>

          <div className="stat-bottom-row">
            <div className="stat-sparkline-wrap">
              <svg width="100%" height="28" viewBox="0 0 100 28">
                <rect x="5" y="10" width="8" height="18" rx="2" fill="#e9d5ff" />
                <rect x="20" y="16" width="8" height="12" rx="2" fill="#e9d5ff" />
                <rect x="35" y="6" width="8" height="22" rx="2" fill="#c084fc" />
                <rect x="50" y="12" width="8" height="16" rx="2" fill="#e9d5ff" />
                <rect x="65" y="4" width="8" height="24" rx="2" fill="#9333ea" />
                <rect x="80" y="14" width="8" height="14" rx="2" fill="#c084fc" />
              </svg>
            </div>
            <div className="stat-pastel-box pastel-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. Techmin Middle Row (1/3 Merchant List + 2/3 Revenue Chart)
          ==================================================================== */}
      <div className="techmin-middle-grid">
        {/* Left Column (1/3): Top Games & Platform Partners (Merchant List style) */}
        <div className="merchant-list-card">
          <div className="panel-header" style={{ marginBottom: 12 }}>
            <div>
              <h2 className="panel-title">
                <span>Top Games</span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>({games.length})</span>
              </h2>
            </div>
            <button 
              className="techmin-btn-outline"
              onClick={() => onNavigateTab && onNavigateTab('games')}
            >
              <span>Add Game</span>
            </button>
          </div>

          <div className="merchant-items-stream">
            {topGames.map((game, idx) => (
              <div key={game.id || idx} className="merchant-item-row">
                <div className="merchant-left">
                  <img
                    src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'}
                    alt={game.title}
                    className="merchant-avatar"
                  />
                  <div className="merchant-details">
                    <div className="merchant-name-row">
                      <span className="merchant-title">{game.title}</span>
                      <span className="verified-badge" title="Verified Platform Partner">✓</span>
                    </div>
                    <span className="merchant-category">
                      {game.category || 'Arcade'} • In-House Studio
                    </span>
                  </div>
                </div>

                <div className="merchant-right">
                  <span className="merchant-plays-tag">
                    {(game.plays || 0).toLocaleString()} plays
                  </span>
                  <button 
                    className="merchant-action-arrow"
                    title="Play Test Game"
                    onClick={() => {
                      if (game.gameUrl) {
                        setActivePlayGame(game);
                      } else if (onEditGame) {
                        onEditGame(game);
                      }
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2/3): Revenue & Gameplay Analytics Area Chart */}
        <div className="revenue-chart-card">
          <div className="panel-header" style={{ marginBottom: 6 }}>
            <div>
              <h2 className="panel-title">Revenue & Gameplay Analytics</h2>
              <span className="panel-subtitle">Platform performance and gamer engagement over time</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="revenue-legend">
                <div className="legend-item">
                  <span className="legend-dot blue"></span>
                  <span>Current Week</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot cyan"></span>
                  <span>Previous Week</span>
                </div>
              </div>

              <div className="time-filter-group">
                <button
                  className={`time-btn ${timeFilter === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('week')}
                >
                  Week
                </button>
                <button
                  className={`time-btn ${timeFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('month')}
                >
                  Month
                </button>
                <button
                  className={`time-btn ${timeFilter === 'year' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('year')}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          {/* Dual-Curve SVG Area Chart */}
          <div className="revenue-chart-svg-container">
            <svg className="revenue-chart-svg" viewBox="0 0 650 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="0" y1="40" x2="650" y2="40" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="650" y2="90" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="650" y2="140" stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="650" y2="180" stroke="var(--border-color)" />

              {/* Previous Week Curve & Translucent Fill */}
              <path
                d="M 20 150 C 100 130, 180 160, 260 110 C 340 70, 420 130, 500 95 C 560 70, 600 80, 630 65 L 630 180 L 20 180 Z"
                fill="url(#greyAreaGrad)"
              />
              <path
                d="M 20 150 C 100 130, 180 160, 260 110 C 340 70, 420 130, 500 95 C 560 70, 600 80, 630 65"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Current Week Smooth Curve & Vibrant Fill */}
              <path
                d="M 20 130 C 100 100, 180 120, 260 70 C 340 30, 420 85, 500 45 C 560 20, 600 35, 630 25 L 630 180 L 20 180 Z"
                fill="url(#blueAreaGrad)"
              />
              <path
                d="M 20 130 C 100 100, 180 120, 260 70 C 340 30, 420 85, 500 45 C 560 20, 600 35, 630 25"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="260" cy="70" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="500" cy="45" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
              <circle cx="630" cy="25" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            </svg>
          </div>

          {/* 4-Column Footer Metrics */}
          <div className="revenue-metrics-footer">
            <div className="revenue-footer-col">
              <span className="revenue-col-label">Current Week</span>
              <span className="revenue-col-value">$83,420</span>
              <span className="revenue-col-change up">
                <span>↗</span>
                <span>+2.33% vs last week</span>
              </span>
            </div>

            <div className="revenue-footer-col">
              <span className="revenue-col-label">Previous Week</span>
              <span className="revenue-col-value">$74,890</span>
              <span className="revenue-col-change up">
                <span>↗</span>
                <span>+1.15%</span>
              </span>
            </div>

            <div className="revenue-footer-col">
              <span className="revenue-col-label">Conversation</span>
              <span className="revenue-col-value">+2.8%</span>
              <span className="revenue-col-change up">
                <span>↑</span>
                <span>Good performance</span>
              </span>
            </div>

            <div className="revenue-footer-col">
              <span className="revenue-col-label">Customers</span>
              <span className="revenue-col-value">{users.length > 0 ? users.length.toLocaleString() : '1,280'}</span>
              <span className="revenue-col-change up">
                <span>↗</span>
                <span>+1.33% active gamers</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. Techmin Bottom Row: Recent Order Style Games Catalog Table
          ==================================================================== */}
      <div className="glass-panel" style={{ marginTop: 22 }}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span>Recent Games Catalog</span>
            </h2>
            <span className="panel-subtitle">Monitor real-time game performance, status, and player concurrency</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search games or category..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-heading)',
                fontSize: '0.82rem',
                outline: 'none',
                width: '220px'
              }}
            />

            {/* Filter Status Selector */}
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'maintenance', label: 'Maintenance' }
              ]}
              minWidth="140px"
            />

            <button 
              className="techmin-btn-outline"
              onClick={() => onNavigateTab && onNavigateTab('games')}
            >
              <span>See All</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Game Name</th>
                <th>Category</th>
                <th>Live Players</th>
                <th>Total Plays</th>
                <th>Share</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.slice(0, 6).map((game, idx) => {
                const playShare = totalPlays > 0 ? Math.round(((game.plays || 0) / totalPlays) * 100) : 0;
                const gid = game.id || game._id;
                const socketLive = activeGameCounts && (activeGameCounts[gid] || activeGameCounts[game.id] || activeGameCounts[game._id]);
                const live = Number(socketLive || 0);

                return (
                  <tr key={game.id || idx}>
                    <td>
                      <span className={`rank-pill rank-${idx + 1}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="game-row-identity">
                        <img
                          src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'}
                          alt={game.title}
                          className="game-table-thumb"
                        />
                        <div>
                          <div className="game-table-title">{game.title}</div>
                          {game.featured && (
                            <span className="featured-star-pill">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" style={{ marginRight: 3 }}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill-tag">
                        {game.category || 'Arcade'}
                      </span>
                    </td>
                    <td>
                      <span className="live-player-pulse-tag">
                        <span className="live-player-pulse-dot" />
                        <span>{live} LIVE</span>
                      </span>
                    </td>
                    <td>
                      <span className="plays-number-badge">
                        {(game.plays || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="share-progress-wrapper">
                        <div className="share-bar-track">
                          <div className="share-bar-fill" style={{ width: `${Math.max(6, playShare)}%` }} />
                        </div>
                        <span className="share-pct-label">{playShare}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating-badge-inline">
                        <span className="rating-star">★</span>
                        <span className="rating-value">{game.rating || 4.8}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${game.status || 'active'}`}>
                        {game.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-right" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {game.gameUrl && (
                          <button
                            className="icon-action-btn"
                            title="Play Test"
                            onClick={() => setActivePlayGame(game)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </button>
                        )}
                        {onEditGame && (
                          <button
                            className="icon-action-btn edit"
                            title="Edit Game"
                            onClick={() => onEditGame(game)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Game Sandbox Live Testing Modal */}
      {activePlayGame && (
        <GameSandboxModal
          gameUrl={activePlayGame.gameUrl}
          gameTitle={activePlayGame.title}
          onClose={() => setActivePlayGame(null)}
        />
      )}
    </div>
  );
}
