import React from 'react';
import StatCard from '../components/StatCard';
import { WEEKLY_ANALYTICS } from '../data/defaultData';

export default function DashboardView({ 
  games, 
  submissions, 
  messages, 
  onNavigate, 
  onEditGame 
}) {
  const totalPlays = games.reduce((acc, g) => acc + (g.plays || 0), 0);
  const featuredGames = games.filter(g => g.featured);
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const maxWeeklyPlays = Math.max(...WEEKLY_ANALYTICS.map(d => d.plays));

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
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
          label="User Inquiries / Reports"
          value={messages.length}
          trend="3 new today"
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

        {/* Quick Platform Status */}
        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">🛡️ System Health</h2>
            <span className="status-badge active">Operational</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Game Engines Status</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>10/10 Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Audio Synthesis API</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>WebAudio OK</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Storage Persistence</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>LocalStorage OK</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Response Latency</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>14ms</span>
            </div>
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
