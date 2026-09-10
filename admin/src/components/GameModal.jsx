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

export default function GameModal({ game, isOpen, onClose, onSave, categories }) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content game-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">{game ? '✏️ Edit Game' : '➕ Add Game'}</h2>
            {game && <span className="modal-id-badge">ID: {game.id}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
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
              />
            </div>

            {/* Category & Status Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active (Live)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Game URL / Embed */}
            <div className="form-group">
              <label className="form-label">Game URL / Embed Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://... or <iframe> code"
                value={formData.gameUrl}
                onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
              />
            </div>

            {/* Thumbnail URL & Tags Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                      alt="Thumb" 
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-glass)' }} 
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Arcade, Cyber, Action"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Short description of the game..."
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
                <span>⭐ Feature this game on Home Top Banner</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="header-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="header-btn primary">
              {game ? '💾 Save Changes' : '🚀 Publish Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
