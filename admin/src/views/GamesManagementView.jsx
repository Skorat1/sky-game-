import React, { useState, useRef } from 'react';
import GameSandboxModal from '../components/GameSandboxModal';
import CustomSelect from '../components/CustomSelect';
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
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Spotlight</span>
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
              style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => onPlay(game)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Play Test</span>
            </button>
          </div>
        )}
      </div>

      <div className="game-card-body">
        <div className="game-card-title-row">
          <div className="game-card-title" title={game.title}>{game.title}</div>
          <div className="rating-badge-inline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{Number(game.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>

        <div className="game-card-badges-row">
          <span className="game-card-badge category">
            {game.category || 'Arcade'}
          </span>
          <span className="game-card-badge tile-size">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <span>{game.tileSize ? game.tileSize.toUpperCase() : (game.featured ? '2X2' : '1X1')}</span>
          </span>
          {rawVideo && (
            <span className="game-card-badge video">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span>Video</span>
            </span>
          )}
        </div>

        <div className="game-card-metrics-row">
          <div className="game-card-metric-item likes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            <span>{(game.likes || 0).toLocaleString()}</span>
          </div>
          <div className="game-card-metric-item plays">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <line x1="15" y1="13" x2="15.01" y2="13" />
              <line x1="18" y1="11" x2="18.01" y2="11" />
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
            <strong>{(game.plays || 0).toLocaleString()}</strong>
            <span>Plays</span>
          </div>
        </div>

        {game.tags && game.tags.length > 0 && (
          <div className="game-card-tags-list">
            {game.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="game-card-tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="game-card-actions">
          <button
            className={`game-feature-toggle-btn ${game.featured ? 'active' : ''}`}
            onClick={() => onToggleFeatured(game.id || game._id)}
            title="Toggle Featured Spotlight"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={game.featured ? '#f59e0b' : 'none'} stroke={game.featured ? '#f59e0b' : 'currentColor'} strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{game.featured ? 'Featured' : 'Feature'}</span>
          </button>

          <div className="game-card-icon-actions">
            <button
              className="icon-action-btn edit"
              title="Edit Game"
              onClick={() => onEditGame(game)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
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
      <div className="mini-stats-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-label">TOTAL TITLES</div>
          <div className="mini-stat-value">{games.length}</div>
        </div>
        <div className="mini-stat-card success">
          <div className="mini-stat-label">
            <span className="live-player-pulse-dot" style={{ width: 6, height: 6 }} />
            <span>LIVE PLAYERS</span>
          </div>
          <div className="mini-stat-value">{totalLivePlayers.toLocaleString()}</div>
        </div>
        <div className="mini-stat-card success">
          <div className="mini-stat-label">ACTIVE LIVE</div>
          <div className="mini-stat-value">{activeCount}</div>
        </div>
        <div className="mini-stat-card warning">
          <div className="mini-stat-label">SPOTLIGHT FEATURED</div>
          <div className="mini-stat-value">{featuredCount}</div>
        </div>
        <div className="mini-stat-card danger">
          <div className="mini-stat-label">MAINTENANCE</div>
          <div className="mini-stat-value">{maintenanceCount}</div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-pos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, tag, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <CustomSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: 'all', label: `All Categories (${games.length})` },
              ...categories.filter(c => c.id !== 'all').map((c) => ({
                value: c.id,
                label: c.name.charAt(0).toUpperCase() + c.name.slice(1)
              }))
            ]}
            minWidth="175px"
          />

          <CustomSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'draft', label: 'Draft' }
            ]}
            minWidth="145px"
          />

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'plays-desc', label: 'Most Played (Desc)' },
              { value: 'plays-asc', label: 'Least Played (Asc)' },
              { value: 'rating-desc', label: 'Highest Rated' },
              { value: 'title-asc', label: 'Alphabetical (A-Z)' }
            ]}
            minWidth="175px"
          />

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
              title="Refresh from Database"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
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
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem' }}>{game.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {game.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill-tag">{game.category || 'Arcade'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.74rem', background: 'var(--bg-canvas)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
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
                        {game.featured ? 'Yes' : 'No'}
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
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </button>
                        )}
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
                        <button
                          className="icon-action-btn delete"
                          title="Delete Game"
                          onClick={() => {
                            if (window.confirm(`Delete "${game.title}"?`)) {
                              onDeleteGame(game.id || game._id);
                            }
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
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
