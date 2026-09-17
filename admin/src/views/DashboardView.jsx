import React, { useState, useEffect } from 'react';
import { WEEKLY_ANALYTICS } from '../data/defaultData';
import { socket } from '../utils/socket';
import GameSandboxModal from '../components/GameSandboxModal';

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

  useEffect(() => {
    if (typeof propOnlineCount === 'number') {
      setOnlineCount(propOnlineCount);
    }
  }, [propOnlineCount]);

  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [chartMetric, setChartMetric] = useState('plays'); // 'plays' | 'players' | 'sessions'
  const [activePlayGame, setActivePlayGame] = useState(null);

  // Clean demo activities
  const defaultActivities = [
    {
      id: 'act-1',
      title: 'Game Started',
      detail: 'Cyber Runner Neon',
      category: 'game',
      icon: '🎮',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    },
    {
      id: 'act-2',
      title: 'New User Registered',
      detail: 'alex_99 joined',
      category: 'user',
      icon: '👤',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
      id: 'act-3',
      title: 'High Score',
      detail: 'Knife Clash (48,250 pts)',
      category: 'trophy',
      icon: '🏆',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 'act-4',
      title: 'Game Submitted',
      detail: 'Galactic Drift Racer',
      category: 'submission',
      icon: '🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    },
    {
      id: 'act-5',
      title: 'New Feedback',
      detail: 'Multiplayer tournament inquiry',
      category: 'support',
      icon: '💬',
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString()
    }
  ];

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

    socket.on('activities:init', (initList) => {
      if (Array.isArray(initList) && initList.length > 0) {
        setActivities(initList);
      } else {
        setActivities(defaultActivities);
      }
    });

    socket.on('activity:new', (newAct) => {
      setActivities(prev => [newAct, ...prev.slice(0, 20)]);
    });

    if (activities.length === 0) {
      setActivities(defaultActivities);
    }

    return () => {
      socket.off('online:count', handleCount);
      socket.off('activities:init');
      socket.off('activity:new');
    };
  }, []);

  const totalPlays = games.reduce((acc, g) => acc + (g.plays || 0), 0);
  const featuredGames = games.filter(g => g.featured);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const unreadMessages = messages.filter(m => !m.read);
  const activeGamersCount = users.filter(u => u.role === 'vip' || u.level > 1).length;

  const dynamicAnalytics = WEEKLY_ANALYTICS.map(item => ({
    ...item,
    sessions: Math.round(item.plays * 1.4)
  }));

  const activeMax = Math.max(...dynamicAnalytics.map(d =>
    chartMetric === 'plays' ? d.plays : chartMetric === 'players' ? d.players : d.sessions
  ));

  const categoryCounts = games.reduce((acc, g) => {
    const cat = g.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'all') return true;
    return act.category === activityFilter;
  });

  return (
    <div className="overview-container">
      {/* 6 Clean High-Impact Stat Cards */}
      <div className="stats-grid">
        {/* Card 1: Live Users */}
        <div className="stat-card stat-card-live">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Online</span>
              <span className="live-indicator">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <div className="stat-value">{onlineCount.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>⚡</span>
              <span>Active now</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-emerald">
            <span>👥</span>
          </div>
        </div>

        {/* Card 2: Registered Gamers */}
        <div className="stat-card" onClick={() => onNavigateTab('users')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Users</span>
            <div className="stat-value">{users.length.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>↑</span>
              <span>{activeGamersCount} Active</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-blue">
            <span>👤</span>
          </div>
        </div>

        {/* Card 3: Catalog Games */}
        <div className="stat-card" onClick={() => onNavigateTab('games')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Games</span>
            <div className="stat-value">{games.length}</div>
            <div className="stat-trend trend-up">
              <span>⭐</span>
              <span>{featuredGames.length} Featured</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-purple">
            <span>🎮</span>
          </div>
        </div>

        {/* Card 4: Total Plays */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Plays</span>
            <div className="stat-value">{totalPlays.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>🔥</span>
              <span>+24% Growth</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-amber">
            <span>⚡</span>
          </div>
        </div>

        {/* Card 5: Submissions */}
        <div className="stat-card" onClick={() => onNavigateTab('submissions')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Submissions</span>
            <div className="stat-value">{submissions.length}</div>
            <div className={`stat-trend ${pendingSubmissions.length > 0 ? 'trend-warn' : 'trend-up'}`}>
              <span>{pendingSubmissions.length > 0 ? '⚠️' : '✓'}</span>
              <span>{pendingSubmissions.length > 0 ? `${pendingSubmissions.length} Pending` : 'All Clear'}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-rose">
            <span>🚀</span>
          </div>
        </div>

        {/* Card 6: Messages */}
        <div className="stat-card" onClick={() => onNavigateTab('messages')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Messages</span>
            <div className="stat-value">{messages.length}</div>
            <div className={`stat-trend ${unreadMessages.length > 0 ? 'trend-warn' : 'trend-up'}`}>
              <span>📩</span>
              <span>{unreadMessages.length > 0 ? `${unreadMessages.length} Unread` : 'Inbox Clean'}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-cyan">
            <span>💬</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Analytics & System Telemetry */}
      <div className="overview-main-grid">
        {/* Left Column: Interactive Analytics Chart */}
        <div className="glass-panel chart-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-cyan)' }}>📈</span>
                <span>Traffic Analytics</span>
              </h2>
            </div>

            <div className="chart-toggle-group">
              <button
                className={`chart-toggle-btn ${chartMetric === 'plays' ? 'active' : ''}`}
                onClick={() => setChartMetric('plays')}
              >
                Plays
              </button>
              <button
                className={`chart-toggle-btn ${chartMetric === 'players' ? 'active' : ''}`}
                onClick={() => setChartMetric('players')}
              >
                Players
              </button>
              <button
                className={`chart-toggle-btn ${chartMetric === 'sessions' ? 'active' : ''}`}
                onClick={() => setChartMetric('sessions')}
              >
                Sessions
              </button>
            </div>
          </div>

          <div className="chart-container-modern">
            {dynamicAnalytics.map((item) => {
              const val = chartMetric === 'plays'
                ? item.plays
                : chartMetric === 'players'
                  ? item.players
                  : item.sessions;
              const heightPct = Math.max(14, Math.round((val / activeMax) * 100));
              const isPeak = val === activeMax;

              return (
                <div key={item.day} className="chart-bar-group-modern">
                  <div className="bar-value-tooltip">
                    {val.toLocaleString()}
                  </div>
                  <div className="bar-wrapper-modern">
                    <div
                      className={`bar-fill-modern ${isPeak ? 'peak-bar' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {isPeak && <span className="peak-badge">Peak</span>}
                    </div>
                  </div>
                  <span className="chart-label-day">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-summary-footer">
            <div className="summary-stat-box">
              <span className="summary-stat-label">Peak Traffic</span>
              <span className="summary-stat-value">Saturday (34.1k)</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Avg Session</span>
              <span className="summary-stat-value">24.5 Mins</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Retention</span>
              <span className="summary-stat-value highlight-green">78.4%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure Telemetry */}
        <div className="glass-panel telemetry-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-emerald)' }}>⚡</span>
                <span>Telemetry</span>
              </h2>
            </div>
            <span className="status-badge active">● Online</span>
          </div>

          <div className="telemetry-items">
            {/* Latency */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">Latency</span>
                <span className="meta-val highlight-green">24 ms</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-emerald" style={{ width: '24%' }} />
              </div>
            </div>

            {/* CPU Load */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">CPU Load</span>
                <span className="meta-val">14%</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-blue" style={{ width: '14%' }} />
              </div>
            </div>

            {/* RAM Memory Usage */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">Memory</span>
                <span className="meta-val">342 MB</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-purple" style={{ width: '34%' }} />
              </div>
            </div>

            {/* Database */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">Database</span>
                <span className="meta-val">8 Active Conn</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-amber" style={{ width: '22%' }} />
              </div>
            </div>
          </div>

          <div className="telemetry-quick-actions">
            <div className="quick-info-pill">
              <span>🌐</span>
              <span>Edge CDN: Active</span>
            </div>
            <div className="quick-info-pill">
              <span>🛡️</span>
              <span>Shield: Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subgrid: Live Activity & Categories */}
      <div className="overview-subgrid">
        {/* Live Activity Stream */}
        <div className="glass-panel activity-stream-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-amber)' }}>📡</span>
                <span>Live Activity</span>
              </h2>
            </div>

            <div className="chart-toggle-group">
              <button
                className={`chart-toggle-btn ${activityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActivityFilter('all')}
              >
                All
              </button>
              <button
                className={`chart-toggle-btn ${activityFilter === 'game' ? 'active' : ''}`}
                onClick={() => setActivityFilter('game')}
              >
                Games
              </button>
              <button
                className={`chart-toggle-btn ${activityFilter === 'user' ? 'active' : ''}`}
                onClick={() => setActivityFilter('user')}
              >
                Users
              </button>
            </div>
          </div>

          <div className="activity-feed-list">
            {filteredActivities.slice(0, 5).map((act) => (
              <div key={act.id || Math.random()} className="activity-feed-item">
                <div className="activity-icon-bubble">
                  {act.icon || '⚡'}
                </div>
                <div className="activity-content">
                  <div className="activity-title-text">{act.title}</div>
                  <div className="activity-detail-text">{act.detail}</div>
                </div>
                <div className="activity-time-pill">
                  {new Date(act.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-panel categories-overview-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-cyan)' }}>🏷️</span>
                <span>Categories</span>
              </h2>
            </div>
            <button className="header-btn" onClick={() => onNavigateTab('categories')}>
              Manage →
            </button>
          </div>

          <div className="category-bars-list">
            {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => {
              const pct = games.length > 0 ? Math.round((count / games.length) * 100) : 0;
              return (
                <div key={cat} className="category-bar-row">
                  <div className="category-bar-info">
                    <span className="category-name-tag">{cat}</span>
                    <span className="category-count-val">{count} ({pct}%)</span>
                  </div>
                  <div className="metric-progress-track">
                    <div className="metric-progress-bar bar-blue" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Trending Games Table */}
      <div className="glass-panel trending-games-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: '#fbbf24' }}>🏆</span>
              <span>Top Games</span>
            </h2>
          </div>

          <button className="header-btn" onClick={() => onNavigateTab('games')}>
            View All ({games.length}) →
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table modern-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Game</th>
                <th>Category</th>
                <th>Live Players</th>
                <th>Plays</th>
                <th>Share</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...games]
                .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                .slice(0, 5)
                .map((game, idx) => {
                  const playShare = totalPlays > 0 ? Math.round(((game.plays || 0) / totalPlays) * 100) : 0;
                  const rankMedals = ['🥇 #1', '🥈 #2', '🥉 #3', '#4', '#5'];
                  const gid = game.id || game._id;
                  const socketLive = activeGameCounts && (activeGameCounts[gid] || activeGameCounts[game.id] || activeGameCounts[game._id]);
                  const live = Number(socketLive || 0);

                  return (
                    <tr key={game.id || idx}>
                      <td>
                        <span className={`rank-pill rank-${idx + 1}`}>
                          {rankMedals[idx] || `#${idx + 1}`}
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
                                ⭐ Featured
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
                              🕹️
                            </button>
                          )}
                          <button
                            className="icon-action-btn edit"
                            title="Edit Game"
                            onClick={() => onEditGame(game)}
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Game Sandbox Live Display */}
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
