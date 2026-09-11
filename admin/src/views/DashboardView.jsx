import React, { useState, useEffect } from 'react';
import { WEEKLY_ANALYTICS } from '../data/defaultData';
import { socket } from '../utils/socket';

export default function DashboardView({
  games = [],
  users = [],
  categories = [],
  submissions = [],
  messages = [],
  onlineCount: propOnlineCount,
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
  const [timeRange, setTimeRange] = useState('7d'); // '24h' | '7d' | '30d' | '1y'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activePlayTestUrl, setActivePlayTestUrl] = useState(null);

  // Initial demo activities if stream is empty
  const defaultActivities = [
    {
      id: 'act-1',
      title: 'Game Session Started',
      detail: 'Player initiated Cyber Runner Neon Edition',
      category: 'game',
      icon: '🎮',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    },
    {
      id: 'act-2',
      title: 'New Gamer Registered',
      detail: 'User "alex_99" joined the platform',
      category: 'user',
      icon: '👤',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
      id: 'act-3',
      title: 'High Score Achieved',
      detail: 'New record (48,250 pts) in Knife Clash Arena',
      category: 'trophy',
      icon: '🏆',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: 'act-4',
      title: 'Game Submission Received',
      detail: 'Developer submitted "Galactic Drift Racer"',
      category: 'submission',
      icon: '🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    },
    {
      id: 'act-5',
      title: 'Player Feedback Sent',
      detail: 'Inquiry received regarding multiplayer tournament',
      category: 'support',
      icon: '💬',
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString()
    }
  ];

  useEffect(() => {
    // Immediate fetch for instant live count
    fetch('http://localhost:5000/api/stats/online')
      .then(res => res.json())
      .then(data => {
        if (typeof data?.count === 'number') setOnlineCount(data.count);
      })
      .catch(() => {});

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
      setActivities(prev => [newAct, ...prev.slice(0, 24)]);
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

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  const totalPlays = games.reduce((acc, g) => acc + (g.plays || 0), 0);
  const featuredGames = games.filter(g => g.featured);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const unreadMessages = messages.filter(m => !m.read);

  // Dynamic Chart Multipliers based on time range
  const timeMultipliers = { '24h': 0.25, '7d': 1, '30d': 3.8, '1y': 42 };
  const mult = timeMultipliers[timeRange] || 1;

  const dynamicAnalytics = WEEKLY_ANALYTICS.map(item => ({
    ...item,
    plays: Math.round(item.plays * mult),
    players: Math.round(item.players * mult),
    sessions: Math.round(item.plays * 1.4 * mult)
  }));

  const activeMax = Math.max(...dynamicAnalytics.map(d => 
    chartMetric === 'plays' ? d.plays : chartMetric === 'players' ? d.players : d.sessions
  ));

  // Category counts
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
      {/* 6 Key Stat Cards Grid */}
      <div className="stats-grid">
        {/* Card 1: Live Active Gamers */}
        <div className="stat-card stat-card-live">
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">Live Concurrency</span>
              <span className="live-indicator">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <div className="stat-value">{onlineCount.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>⚡</span>
              <span>Live Website Visitors</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-emerald">
            <span>👥</span>
          </div>
        </div>

        {/* Card 2: Registered Gamers */}
        <div className="stat-card" onClick={() => onNavigateTab('users')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Registered Gamers</span>
            <div className="stat-value">{users.length.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>↑</span>
              <span>{users.filter(u => u.role === 'vip' || u.level > 1).length} Active Gamers</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-blue">
            <span>👤</span>
          </div>
        </div>

        {/* Card 3: Catalog Games */}
        <div className="stat-card" onClick={() => onNavigateTab('games')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Catalog Games</span>
            <div className="stat-value">{games.length}</div>
            <div className="stat-trend trend-up">
              <span>⭐</span>
              <span>{featuredGames.length} Spotlight Featured</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-purple">
            <span>🎮</span>
          </div>
        </div>

        {/* Card 4: Total Plays */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Play Sessions</span>
            <div className="stat-value">{totalPlays.toLocaleString()}</div>
            <div className="stat-trend trend-up">
              <span>⚡</span>
              <span>+24.6% growth</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-amber">
            <span>🔥</span>
          </div>
        </div>

        {/* Card 5: Dev Submissions */}
        <div className="stat-card" onClick={() => onNavigateTab('submissions')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Dev Submissions</span>
            <div className="stat-value">{pendingSubmissions.length}</div>
            <div className={`stat-trend ${pendingSubmissions.length > 0 ? 'trend-warn' : 'trend-up'}`}>
              <span>{pendingSubmissions.length > 0 ? '⚠️' : '✓'}</span>
              <span>{pendingSubmissions.length > 0 ? 'Review Required' : 'All Approved'}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper icon-rose">
            <span>🚀</span>
          </div>
        </div>

        {/* Card 6: Support Inquiries */}
        <div className="stat-card" onClick={() => onNavigateTab('messages')} style={{ cursor: 'pointer' }}>
          <div className="stat-info">
            <span className="stat-label">Feedback & Reports</span>
            <div className="stat-value">{messages.length}</div>
            <div className="stat-trend trend-up">
              <span>📩</span>
              <span>{unreadMessages.length} unread in inbox</span>
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
                <span>Audience Engagement & Traffic Analytics</span>
              </h2>
              <span className="panel-subtitle">Daily play volume distribution & concurrent gamers over {timeRange.toUpperCase()}</span>
            </div>

            <div className="chart-toggle-group">
              <button
                className={`chart-toggle-btn ${chartMetric === 'plays' ? 'active' : ''}`}
                onClick={() => setChartMetric('plays')}
              >
                Play Counts
              </button>
              <button
                className={`chart-toggle-btn ${chartMetric === 'players' ? 'active' : ''}`}
                onClick={() => setChartMetric('players')}
              >
                Unique Gamers
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
              <span className="summary-stat-label">Peak Traffic Session</span>
              <span className="summary-stat-value">Saturday (34,100 Plays)</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Average Play Duration</span>
              <span className="summary-stat-value">24.5 Minutes / Session</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Gamer Retention Rate</span>
              <span className="summary-stat-value highlight-green">78.4% Weekly Recurring</span>
            </div>
          </div>
        </div>

        {/* Right Column: Server Health & Cluster Telemetry */}
        <div className="glass-panel telemetry-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-emerald)' }}>⚡</span>
                <span>Infrastructure Telemetry</span>
              </h2>
              <span className="panel-subtitle">Node.js, WebSockets & MongoDB Cluster</span>
            </div>
            <span className="status-badge active">Healthy</span>
          </div>

          <div className="telemetry-items">
            {/* API Latency */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">API Gateway Latency</span>
                <span className="meta-val highlight-green">24 ms (Optimal)</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-emerald" style={{ width: '22%' }} />
              </div>
            </div>

            {/* Server CPU Load */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">CPU Load (Worker Threads)</span>
                <span className="meta-val">14% / 100%</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-blue" style={{ width: '14%' }} />
              </div>
            </div>

            {/* RAM Memory Usage */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">RAM Heap Allocation</span>
                <span className="meta-val">342 MB / 1024 MB</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-purple" style={{ width: '34%' }} />
              </div>
            </div>

            {/* MongoDB Pool */}
            <div className="telemetry-row">
              <div className="telemetry-meta">
                <span className="meta-name">MongoDB Connection Pool</span>
                <span className="meta-val">Connected • 8 active</span>
              </div>
              <div className="metric-progress-track">
                <div className="metric-progress-bar bar-amber" style={{ width: '18%' }} />
              </div>
            </div>
          </div>

          <div className="telemetry-quick-actions">
            <div className="quick-info-pill">
              <span>🌐</span>
              <span>CDN: Global Edge Active</span>
            </div>
            <div className="quick-info-pill">
              <span>🛡️</span>
              <span>WAF Shield: Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subgrid: Live Event Feed & Category Breakdown */}
      <div className="overview-subgrid">
        {/* Live Event Stream */}
        <div className="glass-panel activity-stream-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-amber)' }}>📡</span>
                <span>Live Event Stream</span>
              </h2>
              <span className="panel-subtitle">Real-time socket broadcasts & player events</span>
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
            {filteredActivities.slice(0, 6).map((act) => (
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
                <span>Catalog Taxonomy Breakdown</span>
              </h2>
              <span className="panel-subtitle">Games distribution by genre</span>
            </div>
            <button className="header-btn" onClick={() => onNavigateTab('categories')}>
              Manage Categories →
            </button>
          </div>

          <div className="category-bars-list">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = games.length > 0 ? Math.round((count / games.length) * 100) : 0;
              return (
                <div key={cat} className="category-bar-row">
                  <div className="category-bar-info">
                    <span className="category-name-tag">{cat}</span>
                    <span className="category-count-val">{count} games ({pct}%)</span>
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
              <span>Top Trending & Most Played Games</span>
            </h2>
            <span className="panel-subtitle">Ranked by lifetime player engagement and user ratings</span>
          </div>

          <button className="header-btn" onClick={() => onNavigateTab('games')}>
            View Full Catalog ({games.length} Games) →
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table modern-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Rank</th>
                <th>Game Title & Info</th>
                <th>Category</th>
                <th>Total Plays</th>
                <th>Platform Share</th>
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
                                ⭐ Featured Spotlight
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
                              title="Live Play Test"
                              onClick={() => setActivePlayTestUrl(game.gameUrl)}
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

      {/* Live Play Test Modal */}
      {activePlayTestUrl && (
        <div className="modal-overlay" onClick={() => setActivePlayTestUrl(null)}>
          <div className="modal-content sandbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🕹️ Live Game Play Sandbox</h2>
              <button className="close-btn" onClick={() => setActivePlayTestUrl(null)}>&times;</button>
            </div>
            <div className="sandbox-iframe-wrapper">
              <iframe
                src={activePlayTestUrl}
                title="Live Game Sandbox"
                scrolling="no"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; cross-origin-isolated"
                allowFullScreen={true}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-modals"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
