import React, { useState } from 'react';

export default function CategoriesView({ categories = [], onAddCategory, onDeleteCategory, games = [] }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎮');
  const [newCatColor, setNewCatColor] = useState('#00f2fe');

  const popularEmojis = ['🎮', '🕹️', '⚔️', '🧩', '👾', '⚽', '⚡', '🚗', '🏎️', '🎯', '🚀', '🔮', '🃏', '👑'];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (categories.some(c => c.id === id)) {
      alert('Category already exists!');
      return;
    }

    onAddCategory({
      id,
      name: newCatName.trim(),
      icon: newCatIcon,
      count: 0,
      color: newCatColor
    });

    setNewCatName('');
    setNewCatIcon('🎮');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      {/* Category List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-cyan)' }}>🏷️</span>
              <span>Active Game Taxonomy & Categories</span>
            </h2>
            <span className="panel-subtitle">Manage genres, filters, and color accents displayed in the gaming frontend</span>
          </div>

          <span className="live-indicator">
            <span>{categories.length} Categories</span>
          </span>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Theme Accent</th>
                <th>Catalog Games</th>
                <th>ID Key</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const count = cat.id === 'all' 
                  ? games.length 
                  : games.filter(g => g.category === cat.id).length;

                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>{cat.name}</div>
                          {cat.id === 'all' && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>System Default</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span 
                          style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            background: cat.color || '#00f2fe',
                            boxShadow: `0 0 10px ${cat.color || '#00f2fe'}` 
                          }} 
                        />
                        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {cat.color || '#00f2fe'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                        {count} games
                      </span>
                    </td>

                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem', color: 'var(--text-body)' }}>
                        {cat.id}
                      </code>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {cat.id !== 'all' && (
                        <button
                          className="icon-action-btn delete"
                          title="Delete Category"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Category Form */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span>➕</span>
              <span>Create Category</span>
            </h2>
            <span className="panel-subtitle">Add a new genre tag with custom branding</span>
          </div>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Battle Royale, RPG, Strategy"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Icon Emoji</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCatIcon(emoji)}
                  style={{
                    background: newCatIcon === emoji ? 'var(--grad-cyan-blue)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="form-input"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              placeholder="Or type custom emoji"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Accent Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
              />
              <input
                type="text"
                className="form-input"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Preview Badge */}
          <div style={{ padding: '14px', background: 'rgba(10, 16, 36, 0.7)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>LIVE PREVIEW BADGE</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: `${newCatColor}20`, border: `1.5px solid ${newCatColor}`, boxShadow: `0 0 12px ${newCatColor}30` }}>
              <span style={{ fontSize: '1.2rem' }}>{newCatIcon}</span>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>{newCatName || 'Category Name'}</span>
            </div>
          </div>

          <button type="submit" className="admin-btn primary" style={{ marginTop: 6 }}>
            <span>➕</span>
            <span>Create & Register Category</span>
          </button>
        </form>
      </div>
    </div>
  );
}
