import React, { useState, useEffect, useRef } from 'react';

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
];



const CATEGORY_OPTIONS = [
  { id: 'gaming-tips', label: 'Gaming Tips' },
  { id: 'news', label: 'Game News' },
  { id: 'guides', label: 'Guides' },
  { id: 'top-lists', label: 'Top Lists' },
  { id: 'updates', label: 'Platform Updates' },
];

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  category: 'news',
  author: 'ThopGames Editorial',
  tags: '',
  gradient: GRADIENT_PRESETS[0],
  published: true,
  featured: false,
  readTime: '3 min read',
};

// ─── Post Form Modal ──────────────────────────────────────────────────────────
function PostFormModal({ post, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    post
      ? { ...EMPTY_FORM, ...post, tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '') }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const contentRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 16px', overflowY: 'auto'
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card, #1a1f2e)', borderRadius: 20, width: '100%', maxWidth: 780,
        border: '1.5px solid var(--border, #2a3042)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden', marginTop: 10
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid var(--border, #2a3042)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ color: 'var(--text-primary, #e2e8f0)', fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
              {post ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', padding: '6px 12px', fontSize: '1.1rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 16px', color: '#f87171', fontSize: '0.88rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={lbStyle}>Post Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Enter a compelling title..."
              style={inputStyle}
            />
          </div>

          {/* Row: Category + Author */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbStyle}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbStyle}>Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name..." style={inputStyle} />
            </div>
          </div>

          {/* Row: Read time + Emoji */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbStyle}>Read Time</label>
              <input value={form.readTime} onChange={e => set('readTime', e.target.value)} placeholder="e.g. 5 min read" style={inputStyle} />
            </div>
            <div>
              <label style={lbStyle}>Emoji Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    onClick={() => set('emoji', em)}
                    style={{
                      fontSize: '1.3rem', padding: '4px 8px', borderRadius: 8, cursor: 'pointer',
                      border: form.emoji === em ? '2px solid #6366f1' : '1.5px solid rgba(255,255,255,0.1)',
                      background: form.emoji === em ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)'
                    }}
                  >{em}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={lbStyle}>Tags <span style={{ color: '#64748b' }}>(comma separated)</span></label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Gaming, Tips, 2026, Browser..." style={inputStyle} />
          </div>

          {/* Gradient Picker */}
          <div>
            <label style={lbStyle}>Card Gradient</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {GRADIENT_PRESETS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => set('gradient', g)}
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: g, cursor: 'pointer',
                    border: form.gradient === g ? '2.5px solid #fff' : '2px solid transparent',
                    boxShadow: form.gradient === g ? '0 0 0 2px #6366f1' : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label style={lbStyle}>Excerpt / Summary</label>
            <textarea
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="Short description shown in the blog listing..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Content */}
          <div>
            <label style={lbStyle}>Full Article Content <span style={{ color: '#64748b' }}>(Markdown supported)</span></label>
            <textarea
              ref={contentRef}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="## Introduction&#10;&#10;Write your full article content here...&#10;&#10;### Section Header&#10;&#10;Use **bold**, *italic*, and - bullet points."
              rows={14}
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.83rem', resize: 'vertical' }}
            />
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#10b981' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Published (visible on website)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#f59e0b' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>Featured (hero card on top)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border, #2a3042)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 28px', borderRadius: 10, border: 'none',
              background: saving ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {saving ? '⏳ Saving...' : (post ? '💾 Save Changes' : '✨ Publish Post')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ post, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-card, #1a1f2e)', borderRadius: 18, padding: 32, maxWidth: 440, width: '90%', border: '1.5px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
        <h3 style={{ color: '#f87171', fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>Delete Post?</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
          "<strong style={{ color: '#e2e8f0' }}>{post.title}</strong>" will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '9px 22px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); onClose(); }}
            style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: deleting ? 'not-allowed' : 'pointer' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Row ─────────────────────────────────────────────────────────────────
function PostRow({ post, onEdit, onDelete, onTogglePublish, onToggleFeatured }) {
  const catLabel = CATEGORY_OPTIONS.find(c => c.id === post.category)?.label || post.category;
  return (
    <tr style={{ borderBottom: '1px solid var(--border, #2a3042)', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: post.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
          </div>
          <div>
            <div style={{ color: 'var(--text-primary, #e2e8f0)', fontWeight: 700, fontSize: '0.88rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
            <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: 2 }}>{post.author} · {post.readTime}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 12px' }}>
        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{catLabel}</span>
      </td>
      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
        <button
          onClick={() => onTogglePublish(post)}
          title={post.published ? 'Click to Unpublish' : 'Click to Publish'}
          style={{
            padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.73rem',
            background: post.published ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
            color: post.published ? '#34d399' : '#64748b'
          }}
        >
          {post.published ? '● Published' : '○ Draft'}
        </button>
      </td>
      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
        <button
          onClick={() => onToggleFeatured(post)}
          title={post.featured ? 'Remove from Featured' : 'Set as Featured'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem',
            opacity: post.featured ? 1 : 0.25, transition: 'opacity 0.15s'
          }}
        >⭐</button>
      </td>
      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
        {Number(post.views || 0).toLocaleString()}
      </td>
      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.78rem' }}>
        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
      </td>
      <td style={{ padding: '14px 12px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(post)} style={actionBtnStyle('#3b82f6')}>✏️ Edit</button>
          <button onClick={() => onDelete(post)} style={actionBtnStyle('#ef4444')}>🗑️</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary, #e2e8f0)',
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
};
const lbStyle = { color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
const actionBtnStyle = (color) => ({
  padding: '5px 12px', borderRadius: 8, border: `1px solid ${color}30`,
  background: `${color}15`, color: color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700
});

// ─── Main BlogView ────────────────────────────────────────────────────────────
export default function BlogView({ posts = [], onAdd, onUpdate, onDelete, onTogglePublish, onToggleFeatured, onRefresh }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'published' ? p.published : !p.published);
    return matchSearch && matchCat && matchStatus;
  });

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;
  const featuredCount = posts.filter(p => p.featured).length;

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--text-primary, #e2e8f0)', fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>
            📝 Blog Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.83rem', margin: '4px 0 0' }}>
            Create, edit, and manage blog posts for the gaming portal
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onRefresh} style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
            🔄 Refresh
          </button>
          <button
            onClick={() => { setEditingPost(null); setShowForm(true); }}
            style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Posts', value: posts.length, color: '#6366f1' },
          { label: 'Published', value: publishedCount, color: '#10b981' },
          { label: 'Drafts', value: draftCount, color: '#f59e0b' },
          { label: 'Featured', value: featuredCount, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card, #1a1f2e)', border: '1.5px solid var(--border, #2a3042)', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 140 }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search posts..."
          style={{ ...inputStyle, maxWidth: 260, flex: 1 }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, maxWidth: 180, flex: 'none' }}>
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, maxWidth: 160, flex: 'none' }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card, #1a1f2e)', border: '1.5px solid var(--border, #2a3042)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border, #2a3042)', background: 'rgba(255,255,255,0.02)' }}>
                {['Post', 'Category', 'Status', 'Featured', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Views' || h === 'Featured' || h === 'Status' ? 'center' : 'left', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: '#475569' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
                    <div style={{ fontWeight: 700 }}>No posts found</div>
                    <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Try adjusting your search or create a new post.</div>
                  </td>
                </tr>
              ) : (
                filtered.map(post => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onEdit={p => { setEditingPost(p); setShowForm(true); }}
                    onDelete={p => setDeletingPost(p)}
                    onTogglePublish={onTogglePublish}
                    onToggleFeatured={onToggleFeatured}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border, #2a3042)', color: '#64748b', fontSize: '0.78rem' }}>
            Showing {filtered.length} of {posts.length} posts
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <PostFormModal
          post={editingPost}
          onClose={() => { setShowForm(false); setEditingPost(null); }}
          onSave={editingPost ? (data) => onUpdate(editingPost.id, data) : onAdd}
        />
      )}

      {/* Delete Confirm */}
      {deletingPost && (
        <DeleteConfirmModal
          post={deletingPost}
          onClose={() => setDeletingPost(null)}
          onConfirm={() => onDelete(deletingPost.id)}
        />
      )}
    </div>
  );
}
