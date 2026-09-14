import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function UsersView({
  users = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRefresh,
  isModalOpen: isModalOpenProp,
  setIsModalOpen: setIsModalOpenProp
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add / Edit
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const isModalOpen = isModalOpenProp !== undefined ? isModalOpenProp : localModalOpen;
  const setIsModalOpen = setIsModalOpenProp !== undefined ? setIsModalOpenProp : setLocalModalOpen;

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isModalOpen && !editingUser) {
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
      setFormError('');
    }
  }, [isModalOpen, editingUser]);

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status !== 'banned').length;
  const staffCount = users.filter((u) => u.role === 'admin' || u.role === 'moderator').length;
  const bannedCount = users.filter((u) => u.status === 'banned').length;

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      status: u.status || 'active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email address is required');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setFormError('Password is required for new accounts');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, formData);
      } else {
        await onAddUser(formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBan = async (u) => {
    const nextStatus = u.status === 'banned' ? 'active' : 'banned';
    const confirmMsg = nextStatus === 'banned' 
      ? `Are you sure you want to BAN user "${u.username}"?` 
      : `Unban user "${u.username}"?`;
    if (window.confirm(confirmMsg)) {
      await onUpdateUser(u.id, { status: nextStatus });
    }
  };

  return (
    <div className="glass-panel">
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ACCOUNTS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>{totalUsers}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>ACTIVE PLAYERS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{activeUsers}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>STAFF / ADMINS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc' }}>{staffCount}</div>
        </div>
        <div style={{ background: 'rgba(10, 16, 36, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 600 }}>BANNED / LOCKED</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fca5a5' }}>{bannedCount}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-pos">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="select-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Admins 👑</option>
            <option value="moderator">Moderators 🛡️</option>
            <option value="vip">VIP Gamers 💎</option>
            <option value="user">Regular Players 🎮</option>
          </select>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active 🟢</option>
            <option value="banned">Banned 🔴</option>
          </select>

          {onRefresh && (
            <button className="admin-btn secondary" onClick={onRefresh} title="Sync Users from MongoDB">
              <span>🔄</span>
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Gamer Identity</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Level / XP</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No player accounts found matching filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const userInitial = (u.username || u.name || 'U')[0].toUpperCase();
                const isStaff = u.role === 'admin' || u.role === 'moderator';

                return (
                  <tr key={u.id || u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div 
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            background: isStaff ? 'var(--grad-purple-pink)' : 'var(--grad-cyan-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            color: '#ffffff',
                            fontSize: '0.95rem',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            flexShrink: 0
                          }}
                        >
                          {userInitial}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                            {u.username || u.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            ID: {u.id || u._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ color: 'var(--text-body)', fontSize: '0.84rem' }}>{u.email}</span>
                    </td>

                    <td>
                      <span 
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          textTransform: 'uppercase',
                          background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : u.role === 'vip' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: u.role === 'admin' ? '#c084fc' : u.role === 'vip' ? '#fbbf24' : '#38bdf8',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(168, 85, 247, 0.3)' : u.role === 'vip' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                        }}
                      >
                        {u.role === 'admin' ? '👑 Admin' : u.role === 'vip' ? '💎 VIP' : u.role === 'moderator' ? '🛡️ Mod' : '🎮 Player'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        Lv. {u.level || 1} • {(u.xp || 0).toLocaleString()} XP
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${u.status === 'banned' ? 'rejected' : 'active'}`}>
                        {u.status === 'banned' ? 'Banned' : 'Active'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-action-btn"
                          title={u.status === 'banned' ? 'Unban Player' : 'Ban Player'}
                          onClick={() => handleToggleBan(u)}
                          style={{ color: u.status === 'banned' ? '#34d399' : '#f87171' }}
                        >
                          {u.status === 'banned' ? '🔓' : '🚫'}
                        </button>
                        <button
                          className="icon-action-btn edit"
                          title="Edit User"
                          onClick={() => handleOpenEditModal(u)}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-action-btn delete"
                          title="Delete User"
                          onClick={() => {
                            if (window.confirm(`Delete user "${u.username}" permanently?`)) {
                              onDeleteUser(u.id || u._id);
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

      {/* Add / Edit User Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? '✏️ Edit User Profile' : '➕ Create New User'}</h2>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.82rem' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Enter secure password'}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="user">Regular Player</option>
                      <option value="vip">VIP Gamer</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active 🟢</option>
                      <option value="banned">Banned 🔴</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingUser ? 'Update Profile' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
