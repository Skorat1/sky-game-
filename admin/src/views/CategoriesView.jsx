import React, { useState } from 'react';

export default function CategoriesView({ categories, onAddCategory, onDeleteCategory, games }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎮');
  const [newCatColor, setNewCatColor] = useState('#00ffcc');

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
          <h2 className="panel-title">🏷️ Active Game Categories</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{categories.length} Total</span>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Theme Accent</th>
                <th>Games Count</th>
                <th>ID Key</th>
                <th>Action</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span 
                          style={{ 
                            width: 14, 
                            height: 14, 
                            borderRadius: '50%', 
                            background: cat.color || '#00ffcc',
                            boxShadow: `0 0 8px ${cat.color || '#00ffcc'}` 
                          }} 
                        />
                        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                          {cat.color || '#00ffcc'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>
                        {count} games
                      </span>
                    </td>
                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, fontSize: '0.8rem' }}>
                        {cat.id}
                      </code>
                    </td>
                    <td>
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
          <h2 className="panel-title">➕ Add Category</h2>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Strategy, RPG, Racing"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emoji Icon</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 🏎️, 🎯, 🧙‍♂️"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: 42, height: 42, border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="form-input"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <button type="submit" className="header-btn primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
}
