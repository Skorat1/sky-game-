import React, { useState, useEffect } from 'react';

function sanitizeGameUrl(input) {
  if (!input) return '';
  let url = input.trim();
  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch) {
    url = iframeSrcMatch[1];
  }
  if (url.endsWith('.xml') || url.includes('.xml?')) {
    return `/game-proxy/gadgets/ifr?url=${encodeURIComponent(url)}`;
  }
  if (url.includes('opensocial.googleusercontent.com/gadgets/ifr')) {
    const subIdx = url.indexOf('/gadgets/ifr');
    if (subIdx !== -1) {
      return `/game-proxy${url.slice(subIdx)}`;
    }
  }
  if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//') && !url.startsWith('/')) {
    url = 'https://' + url;
  }
  return url;
}

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active', desc: 'Live on Website', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.35)', icon: '🟢' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Under Update', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', icon: '🟡' },
  { id: 'draft', label: 'Draft', desc: 'Hidden / Private', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.35)', icon: '⚪' }
];

export default function GameModal({ game, isOpen, onClose, onSave, categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'arcade',
    description: '',
    thumbnail: '',
    banner: '',
    gameUrl: '',
    tags: '',
    featured: false,
    status: 'active'
  });

  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title || '',
        category: game.category || 'arcade',
        description: game.description || '',
        thumbnail: game.thumbnail || '',
        banner: game.banner || '',
        gameUrl: game.gameUrl || '',
        tags: Array.isArray(game.tags) ? game.tags.join(', ') : (game.tags || ''),
        featured: Boolean(game.featured),
        status: game.status || 'active'
      });
    } else {
      setFormData({
        title: '',
        category: 'arcade',
        description: '',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        gameUrl: '',
        tags: 'Arcade, Retro, Cyber',
        featured: false,
        status: 'active'
      });
    }
  }, [game, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a game title');
      return;
    }

    const processedTags = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Game'];

    const cleanedGameUrl = sanitizeGameUrl(formData.gameUrl);

    onSave({
      ...game,
      id: game ? game.id : formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      thumbnail: formData.thumbnail.trim(),
      banner: formData.banner.trim() || formData.thumbnail.trim(),
      gameUrl: cleanedGameUrl,
      tags: processedTags,
      featured: formData.featured,
      status: formData.status,
      plays: game ? game.plays : 0,
      rating: game ? game.rating : 5.0,
      createdAt: game ? game.createdAt : new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const selectedCategoryObj = categories.find(c => c.id === formData.category) || { icon: '🎮', name: 'Arcade' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">{game ? '✏️ Edit Game' : '➕ Add New Game'}</h2>
            {game && <span className="modal-id-badge">ID: {game.id}</span>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Game Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Neon Cyber Blade"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Category & Status Themed Controls */}
            <div className="form-row">
              {/* Category Custom Selector */}
              <div className="form-group">
                <label className="form-label">
                  <span>Category</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'none' }}>
                    ({selectedCategoryObj.name})
                  </span>
                </label>
                <div className="custom-select-wrapper">
                  <select
                    className="form-select themed-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter(c => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '🎮'} {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="select-custom-arrow">▼</span>
                </div>
              </div>

              {/* Status Custom Selector */}
              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <div className="status-button-group">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = formData.status === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`status-option-btn ${isSelected ? 'active' : ''}`}
                        style={{
                          background: isSelected ? opt.bg : 'rgba(255, 255, 255, 0.03)',
                          borderColor: isSelected ? opt.border : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? opt.color : '#94a3b8'
                        }}
                        onClick={() => setFormData({ ...formData, status: opt.id })}
                      >
                        <span className="status-opt-icon">{opt.icon}</span>
                        <span className="status-opt-label">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Game URL / Embed */}
            <div className="form-group">
              <label className="form-label">Game URL / Embed Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://... or <iframe> embed code"
                value={formData.gameUrl}
                onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                required
              />
            </div>

            {/* Thumbnail URL & Tags Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  {formData.thumbnail && (
                    <img 
                      src={formData.thumbnail} 
                      alt="Thumb Preview" 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        objectFit: 'cover', 
                        borderRadius: 8, 
                        border: '1.5px solid var(--accent-cyan)',
                        flexShrink: 0
                      }} 
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Arcade, Cyber, 2 Player"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Game Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="High energy gameplay description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Featured Checkbox */}
            <div className="featured-toggle-box">
              <label className="featured-label" htmlFor="featuredCheck">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="featured-checkbox"
                />
                <span>⭐ Feature this game on Home Top Spotlight Banner</span>
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-glass)' }}>
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{game ? 'Save Changes' : 'Publish Game'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
