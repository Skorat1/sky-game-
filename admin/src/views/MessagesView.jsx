import React, { useState } from 'react';

export default function MessagesView({ messages = [], onRead, onMarkAllRead, onDeleteMessage }) {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter((msg) => {
    const matchesType = filterType === 'all' || msg.type === filterType;
    const matchesSearch = 
      (msg.name && msg.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.email && msg.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.message && msg.message.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1.2fr 1fr' : '1fr', gap: 24 }}>
      {/* Message List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span>Player Inbox & Support Stream ({messages.length})</span>
            </h2>
            <span className="panel-subtitle">Feedback, bug reports, and partnership inquiries from the player community</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                className="header-btn"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                onClick={onMarkAllRead}
                title="Mark all inquiries as read"
              >
                ✓ Mark All Read
              </button>
            )}
            <span className="live-indicator">
              <span>{unreadCount} Unread</span>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
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
              placeholder="Search sender, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="chart-toggle-group">
            <button
              className={`chart-toggle-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All ({messages.length})
            </button>
            <button
              className={`chart-toggle-btn ${filterType === 'Bug Report' ? 'active' : ''}`}
              onClick={() => setFilterType('Bug Report')}
            >
              Bugs
            </button>
            <button
              className={`chart-toggle-btn ${filterType === 'Game Request' ? 'active' : ''}`}
              onClick={() => setFilterType('Game Request')}
            >
              Requests
            </button>
            <button
              className={`chart-toggle-btn ${filterType === 'Partnership' ? 'active' : ''}`}
              onClick={() => setFilterType('Partnership')}
            >
              Partners
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sender</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    No messages found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const msgId = msg.id || msg._id;
                  const isSelected = selectedMessage && (selectedMessage.id === msgId || selectedMessage._id === msgId);
                  const displayDate = msg.date || (msg.createdAt ? new Date(msg.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '');

                  return (
                    <tr 
                      key={msgId} 
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected 
                          ? 'rgba(59, 130, 246, 0.12)' 
                          : !msg.read 
                            ? 'rgba(59, 130, 246, 0.04)' 
                            : 'transparent'
                      }}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.read && onRead) onRead(msgId);
                      }}
                    >
                      <td>
                        <div>
                          <div style={{ fontWeight: msg.read ? 600 : 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {!msg.read && <span style={{ color: 'var(--accent-brand)', fontSize: '0.8rem' }}>●</span>}
                            <span>{msg.name}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{msg.email}</div>
                        </div>
                      </td>

                      <td>
                        <span className={`status-badge ${msg.type === 'Bug Report' ? 'rejected' : 'active'}`}>
                          {msg.type}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: msg.read ? 500 : 700, color: 'var(--text-heading)', fontSize: '0.84rem' }}>
                          {msg.subject}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {displayDate}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group" style={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="icon-action-btn delete"
                            title="Delete message"
                            onClick={() => {
                              if (isSelected) setSelectedMessage(null);
                              onDeleteMessage(msgId);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      </div>

      {/* Message Detail Card */}
      {selectedMessage && (
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <div>
              <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span>Inquiry Details</span>
              </h2>
              <span className="panel-subtitle">Received from {selectedMessage.email}</span>
            </div>
            <button className="close-btn" onClick={() => setSelectedMessage(null)}>&times;</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`status-badge ${selectedMessage.type === 'Bug Report' ? 'rejected' : 'active'}`}>
                {selectedMessage.type}
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {selectedMessage.date || (selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '')}
              </span>
            </div>

            <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUBJECT</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>{selectedMessage.subject}</div>
            </div>

            <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>MESSAGE CONTENT</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="admin-btn primary"
                style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
