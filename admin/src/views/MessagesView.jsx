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
              <span style={{ color: 'var(--accent-cyan)' }}>📩</span>
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
            <span className="search-icon-pos">🔍</span>
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
              Bugs 🐛
            </button>
            <button
              className={`chart-toggle-btn ${filterType === 'Game Request' ? 'active' : ''}`}
              onClick={() => setFilterType('Game Request')}
            >
              Requests 💡
            </button>
            <button
              className={`chart-toggle-btn ${filterType === 'Partnership' ? 'active' : ''}`}
              onClick={() => setFilterType('Partnership')}
            >
              Partners 🤝
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
                filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    style={{ 
                      cursor: 'pointer',
                      background: selectedMessage?.id === msg.id 
                        ? 'rgba(0, 242, 254, 0.08)' 
                        : !msg.read 
                          ? 'rgba(0, 242, 254, 0.03)' 
                          : 'transparent'
                    }}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.read && onRead) onRead(msg.id);
                    }}
                  >
                    <td>
                      <div>
                        <div style={{ fontWeight: msg.read ? 600 : 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {!msg.read && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>●</span>}
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
                      <span style={{ fontWeight: msg.read ? 500 : 700, color: '#fff', fontSize: '0.84rem' }}>
                        {msg.subject}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {msg.date}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
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
            <div>
              <h2 className="panel-title">
                <span>📖</span>
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
                {selectedMessage.date}
              </span>
            </div>

            <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUBJECT</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: 2 }}>{selectedMessage.subject}</div>
            </div>

            <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>MESSAGE CONTENT</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="admin-btn primary"
                style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
              >
                <span>📧</span>
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
