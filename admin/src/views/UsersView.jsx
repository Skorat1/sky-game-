import React, { useState } from 'react';
import StatCard from '../components/StatCard';

export default function UsersView({
  users = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (u) => {
    const newStatus = u.status === 'banned' ? 'active' : 'banned';
    onUpdateUser(u.id, { status: newStatus });
  };

  const handleRoleChange = (u, newRole) => {
    onUpdateUser(u.id, { role: newRole });
  };

  return (
    <div>
      {/* Top Header & Action */}
      <div className="panel-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            👥 User Management Panel
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Manage registered players, assign admin/moderator roles, and monitor account activity in real time.
          </p>
        </div>
        <button
          className="admin-btn primary"
          onClick={handleOpenAddModal}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard
          label="Total Registered Users"
          value={totalUsers}
          trend="Real-time synchronized"
          trendUp={true}
          icon="👥"
          color="cyan"
        />
        <StatCard
          label="Active Players"
          value={activeUsers}
          trend={`${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 100}% of total`}
          trendUp={true}
          icon="🟢"
          color="emerald"
        />
        <StatCard
          label="Admins & Moderators"
          value={staffCount}
          trend="Platform Staff"
          trendUp={true}
          icon="🛡️"
          color="magenta"
        />
        <StatCard
          label="Suspended / Banned"
          value={bannedCount}
          trend={bannedCount > 0 ? 'Action Taken' : 'Zero Infractions'}
          trendUp={bannedCount === 0}
          icon="🚫"
          color="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon-pos">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            className="select-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">🎮 Players (Users)</option>
            <option value="moderator">🛡️ Moderators</option>
            <option value="admin">⚡ Administrators</option>
          </select>

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">🟢 Active</option>
            <option value="banned">🚫 Suspended / Banned</option>
          </select>

          {onRefresh && (
            <button
              className="admin-btn secondary"
              onClick={onRefresh}
              title="Refresh users list from database"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>📋 Registered Accounts</span>
            <span className="nav-badge" style={{ background: 'var(--accent-cyan)', color: '#04070d' }}>
              {filteredUsers.length} shown
            </span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
            <h3 style={{ color: '#fff', margin: '0 0 6px' }}>No Users Found</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'No users registered yet. New player registrations will appear here automatically!'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User / Player</th>
                  <th>Email Address</th>
                  <th>Auth Provider</th>
                  <th>Platform Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const avatarUrl = u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || u.name || 'gamer'}`;
                  const isStaff = u.role === 'admin' || u.role === 'moderator';
                  const isBanned = u.status === 'banned';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={avatarUrl}
                            alt={u.username || u.name}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: '#1e293b',
                              border: isStaff ? '2px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {u.username || u.name || 'Anonymous Gamer'}
                              {u.role === 'admin' && <span title="Administrator">⚡</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                              {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{u.email}</span>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#cbd5e1'
                          }}
                        >
                          {u.provider === 'google' ? '🌐 Google' :
                           u.provider === 'apple' ? '🍎 Apple' :
                           u.provider === 'microsoft' ? '🪟 Microsoft' :
                           u.provider === 'passkey' ? '🔑 Passkey' : '✉️ Email'}
                        </span>
                      </td>

                      <td>
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          style={{
                            background: u.role === 'admin' ? 'rgba(0, 242, 254, 0.15)' : u.role === 'moderator' ? 'rgba(184, 93, 245, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(0, 242, 254, 0.4)' : u.role === 'moderator' ? 'rgba(184, 93, 245, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                            color: u.role === 'admin' ? '#00f2fe' : u.role === 'moderator' ? '#b85df5' : '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="user" style={{ background: '#0f172a', color: '#fff' }}>Player (User)</option>
                          <option value="moderator" style={{ background: '#0f172a', color: '#b85df5' }}>🛡️ Moderator</option>
                          <option value="admin" style={{ background: '#0f172a', color: '#00f2fe' }}>⚡ Admin</option>
                        </select>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${isBanned ? 'pending' : 'active'}`}
                          style={isBanned ? { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' } : {}}
                        >
                          <span className="dot" />
                          {isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="icon-action-btn edit"
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit user details"
                          >
                            ✏️
                          </button>

                          <button
                            className="icon-action-btn"
                            onClick={() => handleToggleStatus(u)}
                            title={isBanned ? 'Unban user' : 'Ban / Suspend user'}
                            style={{
                              color: isBanned ? '#4ade80' : '#f87171',
                              borderColor: isBanned ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'
                            }}
                          >
                            {isBanned ? '🔓' : '🚫'}
                          </button>

                          <button
                            className="icon-action-btn delete"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete user "${u.username || u.name}"?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            title="Delete user permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span>{editingUser ? '✏️' : '➕'}</span>
                <h3 className="modal-title">
                  {editingUser ? 'Edit User Profile' : 'Create New User Account'}
                </h3>
                {editingUser && (
                  <span className="modal-id-badge">{editingUser.id}</span>
                )}
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Player Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ProGamer99"
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
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Platform Role</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="user">🎮 Player (User)</option>
                      <option value="moderator">🛡️ Moderator</option>
                      <option value="admin">⚡ Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">🟢 Active</option>
                      <option value="banned">🚫 Suspended / Banned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-glass)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
