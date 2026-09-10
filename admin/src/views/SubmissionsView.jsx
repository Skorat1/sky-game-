import React, { useState } from 'react';

export default function SubmissionsView({ submissions, onApprove, onReject }) {
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);

  return (
    <div>
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">🚀 Developer Game Submissions ({submissions.length})</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Review HTML5 / WebGL games submitted by game creators and indie developers.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game & Creator</th>
                <th>Category</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No pending submissions at this time.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <img
                          src={sub.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                          alt={sub.gameTitle}
                          style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{sub.gameTitle}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                            by {sub.developerName} ({sub.email})
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {sub.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        {sub.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.date}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        {sub.gameUrl && (
                          <button
                            className="header-btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => setActivePreviewUrl(sub.gameUrl)}
                          >
                            🕹️ Test Play
                          </button>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <button
                              className="header-btn primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => onApprove(sub)}
                              title="Approve & publish to catalog"
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

      {/* Test Play Modal */}
      {activePreviewUrl && (
        <div className="modal-overlay" onClick={() => setActivePreviewUrl(null)}>
          <div className="modal-content" style={{ maxWidth: 850, height: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🕹️ Developer Game Live Test</h2>
              <button className="close-btn" onClick={() => setActivePreviewUrl(null)}>&times;</button>
            </div>
            <div style={{ flex: 1, background: '#000' }}>
              <iframe
                src={activePreviewUrl}
                title="Game Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
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
