import React, { useState } from 'react';
import GameSandboxModal from '../components/GameSandboxModal';

export default function SubmissionsView({ 
  submissions = [], 
  onApprove, 
  onReject, 
  onDeleteSubmission 
}) {
  const [activePreviewGame, setActivePreviewGame] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubs = submissions.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch = 
      !searchQuery ||
      (s.gameTitle && s.gameTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.developerName && s.developerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  return (
    <div className="glass-panel">
      {/* Metrics Row */}
      <div className="mini-stats-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-label">TOTAL SUBMISSIONS</div>
          <div className="mini-stat-value">{submissions.length}</div>
        </div>
        <div className="mini-stat-card warning">
          <div className="mini-stat-label">PENDING REVIEW</div>
          <div className="mini-stat-value">{pendingCount}</div>
        </div>
        <div className="mini-stat-card success">
          <div className="mini-stat-label">APPROVED & LIVE</div>
          <div className="mini-stat-value">{approvedCount}</div>
        </div>
        <div className="mini-stat-card danger">
          <div className="mini-stat-label">REJECTED</div>
          <div className="mini-stat-value">{rejectedCount}</div>
        </div>
      </div>

      {/* Header & Filter Bar */}
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
            placeholder="Search game title, developer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chart-toggle-group">
          <button
            className={`chart-toggle-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({submissions.length})
          </button>
          <button
            className={`chart-toggle-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`chart-toggle-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            className={`chart-toggle-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Game Title & Studio</th>
              <th>Category</th>
              <th>Description</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                  No game submissions match the selected filter.
                </td>
              </tr>
            ) : (
              filteredSubs.map((sub) => {
                const subId = sub.id || sub._id;
                const formattedDate = sub.date || (sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '');

                return (
                  <tr key={subId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={sub.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'}
                          alt={sub.gameTitle}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-sm)',
                            objectFit: 'cover',
                            border: '1px solid var(--border-glass)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem' }}>
                            {sub.gameTitle}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            by {sub.developerName || 'Unknown Developer'} {sub.email ? `(${sub.email})` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-tag">{sub.category || 'Arcade'}</span>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-body)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {sub.description || 'No description provided.'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formattedDate}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${sub.status === 'approved' ? 'active' : sub.status === 'rejected' ? 'rejected' : 'maintenance'}`}>
                        {String(sub.status || 'pending').toUpperCase()}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end', gap: 6 }}>
                        {sub.gameUrl && (
                          <button
                            className="admin-btn secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            onClick={() => setActivePreviewGame({ gameUrl: sub.gameUrl, title: sub.gameTitle })}
                            title="Test play inside sandbox iframe"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span>Test Play</span>
                          </button>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <button
                              className="admin-btn success"
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              onClick={() => onApprove(sub)}
                              title="Approve & automatically publish to catalog"
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="icon-action-btn delete"
                              onClick={() => onReject(subId)}
                              title="Reject submission"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {onDeleteSubmission && (
                          <button
                            className="icon-action-btn delete"
                            onClick={() => {
                              if (window.confirm(`Delete submission for "${sub.gameTitle}"?`)) {
                                onDeleteSubmission(subId);
                              }
                            }}
                            title="Delete submission record"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Game Sandbox Live Display */}
      {activePreviewGame && (
        <GameSandboxModal
          gameUrl={activePreviewGame.gameUrl}
          gameTitle={activePreviewGame.title}
          onClose={() => setActivePreviewGame(null)}
        />
      )}
    </div>
  );
}
