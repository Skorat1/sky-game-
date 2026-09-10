import React, { useState } from 'react';

export default function MessagesView({ messages, onMarkRead, onDeleteMessage }) {
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1.2fr 1fr' : '1fr', gap: 24 }}>
      {/* Message List */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2 className="panel-title">📩 Inbox & User Feedback ({messages.length})</h2>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No messages in your inbox.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    style={{ 
                      cursor: 'pointer',
                      background: msg.read ? 'transparent' : 'rgba(0, 255, 204, 0.04)' 
                    }}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.read) onMarkRead(msg.id);
                    }}
                  >
                    <td>
                      <div>
                        <div style={{ fontWeight: msg.read ? 600 : 800, color: '#fff' }}>
                          {!msg.read && <span style={{ color: 'var(--accent-cyan)', marginRight: 6 }}>●</span>}
                          {msg.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{msg.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${msg.type === 'Bug Report' ? 'featured' : 'active'}`}>
                        {msg.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: msg.read ? 500 : 700, color: '#fff' }}>
                        {msg.subject}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{msg.date}</span>
                    </td>
                    <td>
                      <div className="action-btn-group" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="icon-action-btn delete"
                          title="Delete message"
                          onClick={() => {
                            if (selectedMessage && selectedMessage.id === msg.id) setSelectedMessage(null);
                            onDeleteMessage(msg.id);
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

      {/* Message Detail Card */}
      {selectedMessage && (
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <h2 className="panel-title">📖 Message Details</h2>
            <button className="close-btn" onClick={() => setSelectedMessage(null)}>&times;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span className={`status-badge ${selectedMessage.type === 'Bug Report' ? 'featured' : 'active'}`}>
                {selectedMessage.type}
              </span>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: 10 }}>{selectedMessage.subject}</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 8, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: <strong style={{ color: '#fff' }}>{selectedMessage.name}</strong> ({selectedMessage.email})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>Date: {selectedMessage.date}</div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 8, border: '1px solid var(--border-glass)', lineHeight: 1.6, color: '#f0f4fc' }}>
              {selectedMessage.message}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="header-btn primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                ✉️ Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
