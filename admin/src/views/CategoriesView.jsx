import React, { useState } from 'react';

// Crisp Vector SVG Icon Definitions for Categories
const CategoryIcons = {
  gamepad: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3" />
      <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3" />
      <rect x="2" y="6" width="20" height="12" rx="6" />
    </svg>
  ),
  joystick: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2z" />
      <path d="M6 15v-2" />
      <path d="M12 15V9" />
      <circle cx="12" cy="6" r="3" />
    </svg>
  ),
  swords: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </svg>
  ),
  puzzle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.439 7.85c0-1.571-.944-2.85-2.109-2.85s-2.11 1.279-2.11 2.85a4.004 4.004 0 0 1-.82 2.375c-.71.93-1.63 1.58-2.67 1.775V8.5a2.5 2.5 0 0 0-5 0v3.5A3.5 3.5 0 0 0 3 15.5V19a2 2 0 0 0 2 2h3.5a3.5 3.5 0 0 0 3.5-3.5v-1.125a4.01 4.01 0 0 1 2.375-.82c1.571 0 2.85-.944 2.85-2.109s-1.279-2.11-2.85-2.11c-.83 0-1.58.33-2.125.865V8.5c0-.6.18-1.17.5-1.65.98-1.46 2.65-2.35 4.5-2.35 1.66 0 3.19.89 4.19 2.35.32.48.5 1.05.5 1.65v.85z" />
    </svg>
  ),
  classic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
    </svg>
  ),
  sports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 14.66V17c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" />
    </svg>
  ),
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  car: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  racing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  rocket: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  magic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  ),
  cards: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="18" x="3" y="3" rx="2" />
      <path d="m15 3 6 6v10a2 2 0 0 1-2 2H9" />
    </svg>
  ),
  crown: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  )
};

const SVG_ICONS_LIST = [
  { id: 'gamepad', label: 'Arcade', icon: CategoryIcons.gamepad, emoji: '🎮' },
  { id: 'joystick', label: 'Retro', icon: CategoryIcons.joystick, emoji: '🕹️' },
  { id: 'swords', label: 'Action', icon: CategoryIcons.swords, emoji: '⚔️' },
  { id: 'puzzle', label: 'Puzzle', icon: CategoryIcons.puzzle, emoji: '🧩' },
  { id: 'classic', label: 'Classic', icon: CategoryIcons.classic, emoji: '👾' },
  { id: 'sports', label: 'Sports', icon: CategoryIcons.sports, emoji: '⚽' },
  { id: 'zap', label: 'Cyber', icon: CategoryIcons.zap, emoji: '⚡' },
  { id: 'car', label: 'Cars', icon: CategoryIcons.car, emoji: '🚗' },
  { id: 'racing', label: 'Racing', icon: CategoryIcons.racing, emoji: '🏎️' },
  { id: 'target', label: 'Shooting', icon: CategoryIcons.target, emoji: '🎯' },
  { id: 'rocket', label: 'Space', icon: CategoryIcons.rocket, emoji: '🚀' },
  { id: 'magic', label: 'Adventure', icon: CategoryIcons.magic, emoji: '🔮' },
  { id: 'cards', label: 'Cards', icon: CategoryIcons.cards, emoji: '🃏' },
  { id: 'crown', label: 'Strategy', icon: CategoryIcons.crown, emoji: '👑' }
];

function getCategorySvgIcon(iconNameOrEmoji, color = '#3b82f6') {
  const match = SVG_ICONS_LIST.find(i => i.id === iconNameOrEmoji || i.emoji === iconNameOrEmoji);
  if (match) {
    return <span style={{ color, display: 'inline-flex', alignItems: 'center' }}>{match.icon}</span>;
  }
  return <span style={{ color, display: 'inline-flex', alignItems: 'center' }}>{CategoryIcons.gamepad}</span>;
}

export default function CategoriesView({ categories = [], onAddCategory, onDeleteCategory, games = [] }) {
  const [newCatName, setNewCatName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('gamepad');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (categories.some(c => c.id === id)) {
      alert('Category already exists!');
      return;
    }

    const selectedIcon = SVG_ICONS_LIST.find(i => i.id === selectedIconId);

    onAddCategory({
      id,
      name: newCatName.trim(),
      icon: selectedIcon ? selectedIcon.id : 'gamepad',
      count: 0,
      color: newCatColor
    });

    setNewCatName('');
    setSelectedIconId('gamepad');
  };

  const currentSelectedObj = SVG_ICONS_LIST.find(i => i.id === selectedIconId) || SVG_ICONS_LIST[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      {/* Category List */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
                </svg>
              </span>
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
              {(() => {
                const sortedCategories = [...categories].sort((a, b) => {
                  const aId = (a.id || a._id || '').toLowerCase();
                  const bId = (b.id || b._id || '').toLowerCase();
                  if (aId === 'all') return -1;
                  if (bId === 'all') return 1;
                  return (a.name || '').localeCompare(b.name || '');
                });

                return sortedCategories.map((cat) => {
                  const catId = cat.id || cat._id;
                  const count = catId === 'all' 
                    ? games.length 
                    : games.filter(g => (g.category === cat.id || (cat.name && g.category && g.category.toLowerCase() === cat.name.toLowerCase()))).length;

                return (
                  <tr key={catId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--bg-canvas)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: cat.color || 'var(--accent-brand)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}>
                          {getCategorySvgIcon(cat.icon || cat.id, cat.color || 'var(--accent-brand)')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.92rem' }}>{cat.name}</div>
                          {catId === 'all' && (
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
                            background: cat.color || '#3b82f6',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {cat.color || '#3b82f6'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {count} games
                      </span>
                    </td>

                    <td>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem', color: 'var(--text-body)' }}>
                        {catId}
                      </code>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {catId !== 'all' && (
                        <button
                          className="icon-action-btn delete"
                          title="Delete Category"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              onDeleteCategory(catId);
                            }
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Category Form */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
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
            <label className="form-label">Select Vector SVG Icon</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 6 }}>
              {SVG_ICONS_LIST.map((item) => {
                const isSelected = selectedIconId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIconId(item.id)}
                    title={item.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 48,
                      background: isSelected ? 'var(--accent-brand)' : 'var(--bg-canvas)',
                      border: isSelected ? '1.5px solid var(--accent-brand)' : '1px solid var(--border-color)',
                      borderRadius: 10,
                      color: isSelected ? '#ffffff' : 'var(--text-body)',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
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
          <div style={{ padding: '14px', background: 'var(--bg-canvas)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>LIVE PREVIEW BADGE</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px', borderRadius: 20, background: `${newCatColor}18`, border: `1.5px solid ${newCatColor}` }}>
              <span style={{ color: newCatColor, display: 'inline-flex', alignItems: 'center' }}>{currentSelectedObj.icon}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.88rem' }}>{newCatName || 'Category Name'}</span>
            </div>
          </div>

          <button type="submit" className="admin-btn primary" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Create & Register Category</span>
          </button>
        </form>
      </div>
    </div>
  );
}
