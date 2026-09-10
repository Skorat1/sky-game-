import React, { useState } from 'react';

export default function GamesManagementView({
  games,
  categories,
  onEditGame,
  onDeleteGame,
  onToggleFeatured,
  onOpenAddModal,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (game.tags && game.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || (game.status || 'active') === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="glass-panel">

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-pos">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search games by title, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            className="select-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <select
            className="select-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="draft">Draft</option>
          </select>

          {onRefresh && (
            <button
              className="admin-btn secondary"
              onClick={onRefresh}
              title="Refresh games from database"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Game Title & Info</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Plays</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No games match the selected filters.
                </td>
              </tr>
            ) : (
              filteredGames.map((game) => (
                <tr key={game.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '1px solid var(--border-glass)'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>{game.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {game.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {game.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 180 }}>
                      {(game.tags || []).slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>
                      {(game.plays || 0).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onToggleFeatured(game.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        filter: game.featured ? 'none' : 'grayscale(1) opacity(0.3)'
                      }}
                      title={game.featured ? 'Remove from Featured' : 'Set as Featured'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td>
                    <span className={`status-badge ${game.status || 'active'}`}>
                      {game.status === 'maintenance' ? '🔧 Maintenance' : (game.status || 'active')}
                    </span>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      {game.gameUrl && (
                        <a
                          href={game.gameUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="icon-action-btn"
                          title="Test / Preview URL"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          🔗
                        </a>
                      )}
                      <button
                        className="icon-action-btn edit"
                        title="Edit Game"
                        onClick={() => onEditGame(game)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-action-btn delete"
                        title="Delete Game"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${game.title}"?`)) {
                            onDeleteGame(game.id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
