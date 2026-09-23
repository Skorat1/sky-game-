import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import CustomSelect from '../components/CustomSelect';

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
        await onUpdateUser(editingUser.id || editingUser._id, formData);
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
      await onUpdateUser(u.id || u._id, { status: nextStatus });
    }
  };

  return (
    <div className="glass-panel">
      {/* Metrics Row */}
      <div className="mini-stats-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-label">TOTAL ACCOUNTS</div>
          <div className="mini-stat-value">{totalUsers}</div>
        </div>
        <div className="mini-stat-card success">
          <div className="mini-stat-label">ACTIVE PLAYERS</div>
          <div className="mini-stat-value">{activeUsers}</div>
        </div>
        <div className="mini-stat-card purple">
          <div className="mini-stat-label">STAFF / ADMINS</div>
          <div className="mini-stat-value">{staffCount}</div>
        </div>
        <div className="mini-stat-card danger">
          <div className="mini-stat-label">BANNED / LOCKED</div>
          <div className="mini-stat-value">{bannedCount}</div>
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
            placeholder="Search by username, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <CustomSelect
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: 'all', label: `All Roles (${users.length})` },
              { value: 'admin', label: 'Admins' },
              { value: 'moderator', label: 'Moderators' }
            ]}
            minWidth="155px"
          />

          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'banned', label: 'Banned' }
            ]}
            minWidth="145px"
          />

          {onRefresh && (
            <button className="admin-btn secondary" onClick={onRefresh} title="Sync Users from Database">
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
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.9rem' }}>
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
                        {u.role === 'admin' ? 'Admin' : u.role === 'vip' ? 'VIP' : u.role === 'moderator' ? 'Mod' : 'Player'}
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
                          {u.status === 'banned' ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          )}
                        </button>
                        <button
                          className="icon-action-btn edit"
                          title="Edit User"
                          onClick={() => handleOpenEditModal(u)}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
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

      {/* Add / Edit User Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? 'Edit User Profile' : 'Create New User'}</h2>
              <button type="button" className="close-btn" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: '0.84rem', fontWeight: 600 }}>
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'moderator', label: 'Moderator' },
                        { id: 'admin', label: 'Administrator' }
                      ].map(r => {
                        const isSel = formData.role === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, role: r.id })}
                            style={{
                              flex: 1,
                              padding: '9px 8px',
                              borderRadius: '8px',
                              border: isSel ? '1.5px solid var(--accent-brand)' : '1px solid var(--border-color)',
                              background: isSel ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-canvas)',
                              color: isSel ? 'var(--accent-brand)' : 'var(--text-muted)',
                              fontWeight: isSel ? 700 : 500,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem' }}>{r.icon}</span>
                            <span>{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Status</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { id: 'active', label: 'Active', icon: '●', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.1)', border: '#16a34a' },
                        { id: 'banned', label: 'Banned', icon: '●', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', border: '#dc2626' }
                      ].map(s => {
                        const isSel = formData.status === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, status: s.id })}
                            style={{
                              flex: 1,
                              padding: '9px 8px',
                              borderRadius: '8px',
                              border: isSel ? `1.5px solid ${s.border}` : '1px solid var(--border-color)',
                              background: isSel ? s.bg : 'var(--bg-canvas)',
                              color: isSel ? s.color : 'var(--text-muted)',
                              fontWeight: isSel ? 700 : 500,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '0.5rem', color: isSel ? s.color : '#94a3b8' }}>{s.icon}</span>
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
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
