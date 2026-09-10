import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { WEEKLY_ANALYTICS } from '../data/defaultData';
import { socket } from '../utils/socket';

export default function DashboardView({
  games,
  users = [],
  submissions,
  messages,
  onNavigateTab,
  onEditGame
}) {
  const [onlineCount, setOnlineCount] = useState(0);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    socket.on('online:count', (data) => {
      if (typeof data?.count === 'number') setOnlineCount(data.count);
    });

    socket.on('activities:init', (initList) => {
      setActivities(initList || []);
    });

    socket.on('activity:new', (newAct) => {
      setActivities(prev => [newAct, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.off('online:count');
      socket.off('activities:init');
      socket.off('activity:new');
    };
  }, []);

  const totalPlays = games.reduce((acc, g) => acc + (g.plays || 0), 0);
  const featuredGames = games.filter(g => g.featured);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const maxWeeklyPlays = Math.max(...WEEKLY_ANALYTICS.map(d => d.plays));

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Live Active Players"
          value={onlineCount.toLocaleString()}
          trend="Real-time WebSockets"
          trendUp={true}
          icon="🟢"
          color="emerald"
        />
        <StatCard
          label="Registered Gamers"
          value={users.length}
          trend="Verified Accounts"
          trendUp={true}
          icon="👥"
          color="cyan"
        />
        <StatCard
          label="Total Catalog Games"
          value={games.length}
          trend="+2 this month"
          trendUp={true}
          icon="🎮"
          color="cyan"
        />
        <StatCard
          label="Total Gameplay Sessions"
          value={totalPlays.toLocaleString()}
          trend="+18.4% vs last week"
          trendUp={true}
          icon="🔥"
          color="magenta"
        />
        <StatCard
          label="Pending Submissions"
          value={pendingSubmissions.length}
          trend={pendingSubmissions.length > 0 ? 'Requires Review' : 'All cleared'}
          trendUp={pendingSubmissions.length === 0}
          icon="🚀"
          color="amber"
        />
        <StatCard
          label="User Inquiries"
          value={messages.length}
          trend="Inbox active"
          trendUp={true}
          icon="📩"
          color="purple"
        />
      </div>

      {/* Analytics & Trending Row */}
      <div className="dashboard-grid">
        {/* Weekly Activity Chart */}
        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">📈 Weekly Playtime & Session Activity</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Live System Telemetry</span>
          </div>

          <div className="chart-container">
            {WEEKLY_ANALYTICS.map((item) => {
              const heightPct = Math.round((item.plays / maxWeeklyPlays) * 100);
              return (
                <div key={item.day} className="chart-bar-group">
                  <div className="bar-wrapper" title={`${item.day}: ${item.plays.toLocaleString()} plays`}>
                    <div className="bar-fill" style={{ height: `${heightPct}%` }}></div>
                  </div>
                  <span className="chart-label">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>⚡ Peak Activity: Saturday (34.1k plays)</span>
            <span>Avg. Session Duration: 24 mins</span>
          </div>
        </div>

        {/* Live Activity Stream Panel */}
        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">⚡ Live Activity Stream</h2>
            <span className="status-badge active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} /> Live WebSocket
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Waiting for player actions & telemetry...
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{act.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.detail}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Games */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2 className="panel-title">🏆 Top Trending Games</h2>
          <button className="header-btn" onClick={() => onNavigate('games')}>
            View All Games →
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Category</th>
                <th>Total Plays</th>
                <th>User Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...games]
                .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                .slice(0, 5)
                .map((game) => (
                  <tr key={game.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{game.title}</div>
                          {game.featured && <span style={{ fontSize: '0.72rem', color: 'var(--accent-amber)' }}>⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {game.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>
                        {(game.plays || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>★ {game.rating || 4.8}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${game.status || 'active'}`}>
                        {game.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-action-btn edit"
                        title="Edit Game"
                        onClick={() => onEditGame(game)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
