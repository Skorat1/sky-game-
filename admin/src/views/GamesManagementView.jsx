import React, { useState, useRef } from 'react';
import GameSandboxModal from '../components/GameSandboxModal';
import { parseVideoSource, getGamePreviewVideo } from '../utils/videoHelper';

function AdminGameCardItem({
  game,
  onPlay,
  onToggleFeatured,
  onEditGame,
  onDeleteGame,
  livePlayersCount = 0
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const rawVideo = game.previewVideo || getGamePreviewVideo(game);
  const videoSource = parseVideoSource(rawVideo);

  const computedLive = Number(livePlayersCount || 0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoSource?.type === 'direct') {
      try {
        videoRef.current.currentTime = 0;
        const p = videoRef.current.play();
        if (p !== undefined) p.catch(() => {});
      } catch {}
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && videoSource?.type === 'direct') {
      videoRef.current.pause();
      try { videoRef.current.currentTime = 0; } catch {}
    }
  };

  return (
    <div
      className="game-admin-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="game-card-media" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
          alt={game.title}
          className="game-card-thumb"
        />

        {videoSource?.type === 'direct' && (
          <video
            ref={videoRef}
            src={videoSource.url}
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}

        {isHovered && (videoSource?.type === 'youtube' || videoSource?.type === 'vimeo') && (
          <iframe
            src={videoSource.embedUrl}
            title={game.title}
            allow="autoplay; encrypted-media"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
              pointerEvents: 'none',
              opacity: 1,
              zIndex: 1,
              transform: 'scale(1.25)',
              transformOrigin: 'center center'
            }}
          />
        )}
        
        <div className="game-card-badge-top" style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`status-badge ${game.status || 'active'}`}>
            {game.status || 'active'}
          </span>
          {game.featured && (
            <span className="featured-star-pill">
              ⭐ Spotlight
            </span>
          )}
          <span className="live-player-pulse-tag" title={`${computedLive} Active Players Right Now`}>
            <span className="live-player-pulse-dot" />
            <span>{computedLive} LIVE</span>
          </span>
        </div>

        {game.gameUrl && (
          <div className="game-card-quick-play" style={{ zIndex: 3 }}>
            <button
              className="admin-btn primary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              onClick={() => onPlay(game)}
            >
              🕹️ Play Test
            </button>
          </div>
        )}
      </div>

      <div className="game-card-body">
        <div className="game-card-title-row">
          <div className="game-card-title">{game.title}</div>
          <div className="rating-badge-inline">
            <span className="rating-star">★</span>
            <span>{game.rating || 5.0}</span>
          </div>
        </div>

        <div className="game-card-badges-row">
          <span className="game-card-badge category">
            {game.category || 'Arcade'}
          </span>
          <span className="game-card-badge tile-size">
            📐 {game.tileSize ? game.tileSize.toUpperCase() : (game.featured ? '2X2' : 'AUTO')}
          </span>
          {rawVideo && (
            <span className="game-card-badge video">
              🎥 Video
            </span>
          )}
        </div>

        <div className="game-card-metrics-row">
          <div className="game-card-metric-item likes">
            <span>👍</span>
            <span>{(game.likes || 0).toLocaleString()}</span>
          </div>
          <div className="game-card-metric-item plays">
            <span>🎮</span>
            <strong>{(game.plays || 0).toLocaleString()}</strong>
            <span>Plays</span>
          </div>
        </div>

        {game.tags && game.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {game.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="game-card-actions">
          <button
            className="header-btn"
            style={{ fontSize: '0.75rem', padding: '4px 8px', color: game.featured ? '#fbbf24' : 'var(--text-muted)' }}
            onClick={() => onToggleFeatured(game.id || game._id)}
            title="Toggle Featured Spotlight"
          >
            {game.featured ? '⭐ Featured' : '☆ Feature'}
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
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
                  onDeleteGame(game.id || game._id);
                }
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamesManagementView({
  games = [],
  categories = [],
  activeGameCounts = {},
  onEditGame,
  onDeleteGame,
  onToggleFeatured,
  onOpenAddModal,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('plays-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [activePlayGame, setActivePlayGame] = useState(null);

  // Filter and Sort Logic
  const filteredGames = games.filter((game) => {
    const q = searchQuery.trim().toLowerCase();
    const title = (game.title || '').toLowerCase();
    const desc = (game.description || '').toLowerCase();
    const gid = String(game.id || game._id || '').toLowerCase();
    const tagsStr = Array.isArray(game.tags) ? game.tags.join(' ').toLowerCase() : String(game.tags || '').toLowerCase();

    const matchesSearch = !q || title.includes(q) || desc.includes(q) || tagsStr.includes(q) || gid.includes(q);

    const gameCat = (game.category || '').toLowerCase();
    const selCat = (selectedCategory || 'all').toLowerCase();
    const matchesCategory = selCat === 'all' || gameCat === selCat;

    const gameStatus = (game.status || 'active').toLowerCase();
    const selStatus = (selectedStatus || 'all').toLowerCase();
    const matchesStatus = selStatus === 'all' || gameStatus === selStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'plays-desc') return (b.plays || 0) - (a.plays || 0);
    if (sortBy === 'plays-asc') return (a.plays || 0) - (b.plays || 0);
    if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const activeCount = games.filter(g => (g.status || 'active') === 'active').length;
  const featuredCount = games.filter(g => g.featured).length;
  const maintenanceCount = games.filter(g => g.status === 'maintenance').length;

  // Calculate live player total (Real active socket users only)
  const totalLivePlayers = games.reduce((sum, g) => {
    const gid = g.id || g._id;
    const socketLive = activeGameCounts && (activeGameCounts[gid] || activeGameCounts[g.id] || activeGameCounts[g._id]);
    const live = Number(socketLive || 0);
    return sum + live;
  }, 0);

  return (
    <div className="glass-panel">
      {/* Top Header Row with Metric Pills */}

      {/* Metric Summary Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TITLES</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>{games.length}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="live-player-pulse-dot" style={{ width: 6, height: 6 }} />
            <span>LIVE PLAYERS</span>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{totalLivePlayers.toLocaleString()}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>ACTIVE LIVE</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{activeCount}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>SPOTLIGHT FEATURED</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{featuredCount}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>MAINTENANCE</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>{maintenanceCount}</div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-pos">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, tag, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="select-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({games.length})</option>
            {categories.filter(c => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon || '🎮'} {c.name}
              </option>
            ))}
          </select>

          <select
            className="select-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active 🟢</option>
            <option value="maintenance">Maintenance 🟡</option>
            <option value="draft">Draft ⚪</option>
          </select>

          <select
            className="select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="plays-desc">Most Played (Desc)</option>
            <option value="plays-asc">Least Played (Asc)</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="title-asc">Alphabetical (A-Z)</option>
          </select>

          {/* View Mode Switcher */}
          <div className="chart-toggle-group">
            <button
              className={`chart-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              Cards
            </button>
            <button
              className={`chart-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Detailed Table View"
            >
              Table
            </button>
          </div>

          {onRefresh && (
            <button
              className="admin-btn secondary"
              onClick={onRefresh}
              title="Refresh from MongoDB"
            >
              <span>🔄</span>
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="games-cards-grid">
          {filteredGames.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No games found matching the selected criteria.
            </div>
          ) : (
            filteredGames.map((game) => {
              const gid = game.id || game._id;
              const liveCount = (activeGameCounts && (activeGameCounts[gid] || activeGameCounts[game.id] || activeGameCounts[game._id])) || 0;

              return (
                <AdminGameCardItem
                  key={game.id || game._id}
                  game={game}
                  onPlay={setActivePlayGame}
                  onToggleFeatured={onToggleFeatured}
                  onEditGame={onEditGame}
                  onDeleteGame={onDeleteGame}
                  livePlayersCount={liveCount}
                />
              );
            })
          )}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && (
        <div className="table-responsive" style={{ marginTop: 16 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game & Media</th>
                <th>Category</th>
                <th>Card Size</th>
                <th>Live Players</th>
                <th>Plays</th>
                <th>Rating</th>
                <th>Featured</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No games match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => {
                  const gid = game.id || game._id;
                  const socketLive = activeGameCounts && (activeGameCounts[gid] || activeGameCounts[game.id] || activeGameCounts[game._id]);
                  const live = Number(socketLive || 0);

                  return (
                    <tr key={game.id || game._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'}
                            alt={game.title}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 'var(--radius)',
                              objectFit: 'cover',
                              border: '1px solid var(--border-glass)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{game.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {game.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-tag">{game.category || 'Arcade'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', border: '1px solid rgba(0, 242, 254, 0.25)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                          {game.tileSize ? game.tileSize.toUpperCase() : (game.featured ? '2X2' : 'AUTO')}
                        </span>
                      </td>
                      <td>
                        <span className="live-player-pulse-tag">
                          <span className="live-player-pulse-dot" />
                          <span>{live} LIVE</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          {(game.plays || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="rating-badge-inline">
                          <span className="rating-star">★</span>
                          <span>{game.rating || 5.0}</span>
                        </div>
                      </td>
                    <td>
                      <button
                        className="header-btn"
                        style={{ fontSize: '0.75rem', padding: '4px 8px', color: game.featured ? '#fbbf24' : 'var(--text-muted)' }}
                        onClick={() => onToggleFeatured(game.id || game._id)}
                      >
                        {game.featured ? '⭐ Yes' : 'No'}
                      </button>
                    </td>
                    <td>
                      <span className={`status-badge ${game.status || 'active'}`}>
                        {game.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
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
                        <button
                          className="icon-action-btn delete"
                          title="Delete Game"
                          onClick={() => {
                            if (window.confirm(`Delete "${game.title}"?`)) {
                              onDeleteGame(game.id || game._id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      )}

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
