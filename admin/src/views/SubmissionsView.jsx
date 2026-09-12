import React, { useState } from 'react';
import GameSandboxModal from '../components/GameSandboxModal';

export default function SubmissionsView({ submissions = [], onApprove, onReject }) {
  const [activePreviewGame, setActivePreviewGame] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSubs = submissions.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div>
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-rose)' }}>🚀</span>
              <span>Developer Community Submissions ({submissions.length})</span>
            </h2>
            <span className="panel-subtitle">
              Review and curate HTML5 / WebGL games submitted by indie game creators & studios
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                Approved
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game Title & Studio</th>
                <th>Category</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    No game submissions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                          src={sub.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                          alt={sub.gameTitle}
                          style={{ width: 52, height: 52, borderRadius: 'var(--radius)', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{sub.gameTitle}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            by {sub.developerName} <span style={{ color: 'var(--text-muted)' }}>({sub.email})</span>
                          </div>
                          {sub.description && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 380 }}>
                              {sub.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-pill-tag">
                        {sub.category || 'Arcade'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {sub.date || 'Recent'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        {sub.gameUrl && (
                          <button
                            className="header-btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setActivePreviewGame(sub)}
                          >
                            🕹️ Test Play
                          </button>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <button
                              className="admin-btn success"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => onApprove(sub)}
                              title="Approve & automatically publish to catalog"
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="icon-action-btn delete"
                              onClick={() => onReject(sub.id)}
                              title="Reject submission"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
