import React, { useState, useEffect, useRef } from 'react';
import { parseVideoSource, getGamePreviewVideo } from '../utils/videoHelper';

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

// Quick heuristic metadata & video detection
function getQuickClientMetadata(rawInput) {
  if (!rawInput) return {};
  let target = rawInput.trim();
  const iframeMatch = target.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) target = iframeMatch[1];

  // 1. YouTube & Shorts
  const ytMatch = target.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch) {
    const vidId = ytMatch[1];
    return {
      thumbnail: `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
      banner: `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`,
      previewVideo: target
    };
  }

  // 2. CrazyGames URL matching (game, embed, en_US, files, subdomains)
  const cgMatch = target.match(/crazygames\.com\/(?:game|embed|en_US)\/([a-zA-Z0-9-]+)/i) ||
                  target.match(/https?:\/\/([a-zA-Z0-9-]+)\.game-files\.crazygames\.com/i) ||
                  target.match(/https?:\/\/files\.crazygames\.com\/([a-zA-Z0-9-]+)/i);
  if (cgMatch) {
    const slug = cgMatch[1];
    const cleanTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      thumbnail: `https://images.crazygames.com/games/${slug}/cover-16x9.png`,
      banner: `https://images.crazygames.com/games/${slug}/cover-16x9.png`,
      previewVideo: `https://videos.crazygames.com/games/${slug}/cover-16x9.mp4`,
      title: cleanTitle
    };
  }

  // 3. Poki URLs
  const poki = target.match(/poki\.com\/(?:[a-zA-Z-]+\/)?g\/([a-zA-Z0-9-]+)/i);
  if (poki) {
    const slug = poki[1];
    const cleanTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      thumbnail: `https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/${slug}.png`,
      banner: `https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/${slug}.png`,
      title: cleanTitle
    };
  }

  // 4. GameMonetize
  const gm = target.match(/gamemonetize\.(?:com|co)\/([a-zA-Z0-9]+)/i) || target.match(/html5\.gamemonetize\.com\/([a-zA-Z0-9]+)/i);
  if (gm) {
    return {
      thumbnail: `https://img.gamemonetize.com/${gm[1]}/512x384.jpg`,
      banner: `https://img.gamemonetize.com/${gm[1]}/512x384.jpg`
    };
  }

  // 5. GameDistribution
  const gd = target.match(/html5\.gamedistribution\.com\/([a-zA-Z0-9]+)/i);
  if (gd) {
    return {
      thumbnail: `https://img.gamedistribution.com/${gd[1]}-512x384.jpeg`,
      banner: `https://img.gamedistribution.com/${gd[1]}-512x384.jpeg`
    };
  }

  // 6. Direct image or video
  if (/\.(png|jpg|jpeg|webp|gif)($|\?)/i.test(target)) {
    return { thumbnail: target, banner: target };
  }
  if (/\.(mp4|webm|ogg)($|\?)/i.test(target)) {
    return { previewVideo: target };
  }

  return {};
}

const TILE_SIZES = [
  { id: 'auto', label: 'Auto (Mosaic Adaptive)' },
  { id: '1x1', label: '1x1 Standard (Square App Icon)' },
  { id: '2x2', label: '2x2 Featured (Big Hero Square)' },
  { id: '2x1', label: '2x1 Wide (Landscape Banner)' },
  { id: '1x2', label: '1x2 Tall (Portrait Poster)' },
  { id: '3x2', label: '3x2 Giant (Triple Width Hero)' },
  { id: '4x2', label: '4x2 Billboard (Full Width Hero)' },
  { id: '2x3', label: '2x3 Poster (Vertical Showcase)' },
  { id: '3x3', label: '3x3 Ultra (Mega Stage)' }
];

export default function GameModal({ game, isOpen, onClose, onSave, categories = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'arcade',
    description: '',
    thumbnail: '',
    banner: '',
    previewVideo: '',
    gameUrl: '',
    tags: '',
    featured: false,
    tileSize: 'auto',
    status: 'active'
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState(null);
  const [isModalHovered, setIsModalHovered] = useState(false);
  const modalVideoRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setDetectStatus(null);
    setIsModalHovered(false);
    if (game) {
      setFormData({
        title: game.title || '',
        category: game.category || 'arcade',
        description: game.description || '',
        thumbnail: game.thumbnail || '',
        banner: game.banner || '',
        previewVideo: game.previewVideo || '',
        gameUrl: game.gameUrl || '',
        tags: Array.isArray(game.tags) ? game.tags.join(', ') : (game.tags || ''),
        featured: Boolean(game.featured),
        tileSize: game.tileSize || (game.featured ? '2x2' : 'auto'),
        status: game.status || 'active'
      });
    } else {
      setFormData({
        title: '',
        category: 'arcade',
        description: '',
        thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
        previewVideo: '',
        gameUrl: '',
        tags: 'Arcade, Retro, Cyber',
        featured: false,
        tileSize: 'auto',
        status: 'active'
      });
    }
  }, [game, isOpen]);

  const handleAutoDetectImage = async (urlInput) => {
    const raw = (urlInput !== undefined ? urlInput : formData.gameUrl || '').trim();
    if (!raw) {
      setDetectStatus({ type: 'warning', text: 'Please enter a Game URL first' });
      setTimeout(() => setDetectStatus(null), 3000);
      return;
    }

    const quick = getQuickClientMetadata(raw);
    if (quick.thumbnail || quick.previewVideo || quick.title) {
      setFormData(prev => ({
        ...prev,
        thumbnail: quick.thumbnail || prev.thumbnail,
        banner: quick.banner || quick.thumbnail || prev.banner,
        previewVideo: quick.previewVideo || prev.previewVideo,
        title: (!prev.title || prev.title.trim() === '' || prev.title.startsWith('New Game')) && quick.title ? quick.title : prev.title
      }));
      setDetectStatus({ type: 'success', text: 'Details auto-detected!' });
    }

    setIsDetecting(true);
    try {
      const adminToken = localStorage.getItem('sky_admin_token') || '';
      const res = await fetch(`${API_BASE}/api/games/detect-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ url: raw })
      });

      const json = await res.json();
      if (json?.success && json?.data) {
        const { thumbnail, banner, previewVideo, title, description } = json.data;
        setFormData(prev => ({
          ...prev,
          thumbnail: thumbnail || quick.thumbnail || prev.thumbnail,
          banner: banner || thumbnail || quick.banner || prev.banner,
          previewVideo: previewVideo || quick.previewVideo || prev.previewVideo || '',
          title: (!prev.title || prev.title.trim() === '' || prev.title.startsWith('New Game')) && title ? title : prev.title,
          description: (!prev.description || prev.description.trim() === '') && description ? description : prev.description
        }));
        setDetectStatus({ type: 'success', text: 'Game details & video auto-detected!' });
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsDetecting(false);
      setTimeout(() => setDetectStatus(null), 4000);
    }
  };

  const handleGameUrlChange = (e) => {
    const val = e.target.value;
    const quick = getQuickClientMetadata(val);
    setFormData(prev => ({
      ...prev,
      gameUrl: val,
      thumbnail: quick.thumbnail || prev.thumbnail,
      banner: quick.banner || quick.thumbnail || prev.banner,
      previewVideo: quick.previewVideo || prev.previewVideo,
      title: (!prev.title || prev.title.trim() === '' || prev.title.startsWith('New Game')) && quick.title ? quick.title : prev.title
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (val.trim().length > 10) {
      debounceTimerRef.current = setTimeout(() => {
        handleAutoDetectImage(val);
      }, 600);
    }
  };

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
      previewVideo: formData.previewVideo || '',
      gameUrl: cleanedGameUrl,
      tags: processedTags,
      featured: formData.featured,
      tileSize: formData.tileSize || (formData.featured ? '2x2' : '1x1'),
      status: formData.status,
      plays: game ? game.plays : 0,
      rating: game ? game.rating : 5.0,
      createdAt: game ? game.createdAt : new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '720px', width: '95%', borderRadius: '18px' }}
      >
        {/* Clean Header */}
        <div className="modal-header" style={{ padding: '16px 22px' }}>
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>{game ? '✏️' : '🎮'}</span>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {game ? 'Edit Game' : 'Add New Game'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Publish or update game source, thumbnail, and Poki tile options
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        {/* Clean Normal Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
            
            {/* Row 1: Title & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Game Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Subway Surfers, Temple Run 2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ cursor: 'pointer', background: '#0a1126', color: '#fff' }}
                >
                  {categories.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon || '🎮'} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Playable Game URL / Embed */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.82rem' }}>
                  Playable Game URL / Embed Link *
                </label>
                <button
                  type="button"
                  onClick={() => handleAutoDetectImage()}
                  disabled={isDetecting || !formData.gameUrl.trim()}
                  style={{
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.35)',
                    color: '#00f2fe',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: (isDetecting || !formData.gameUrl.trim()) ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: (!formData.gameUrl.trim() && !isDetecting) ? 0.5 : 1
                  }}
                >
                  <span>✨</span>
                  <span>{isDetecting ? 'Detecting...' : 'Auto-Detect Details'}</span>
                </button>
              </div>

              <input
                type="text"
                className="form-input"
                placeholder="Paste game link (e.g. https://poki.com/... or crazygames.com/...)"
                value={formData.gameUrl}
                onChange={handleGameUrlChange}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text') || '';
                  if (pasted.trim()) handleAutoDetectImage(pasted);
                }}
                required
              />

              {detectStatus && (
                <div style={{
                  marginTop: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  background: detectStatus.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(0, 242, 254, 0.12)',
                  color: detectStatus.type === 'success' ? '#22c55e' : '#00f2fe',
                  border: `1px solid ${detectStatus.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(0, 242, 254, 0.3)'}`
                }}>
                  {detectStatus.text}
                </div>
              )}
            </div>

            {/* Row 3: Media (Thumb, Video, Tags) + Live Poki Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    🖼️ Thumbnail Image URL *
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://... (PNG, JPG, WebP)"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🎥 Hover Video URL</span>
                    <span style={{ fontSize: '0.68rem', color: '#00f2fe' }}>Optional (MP4, WebM, YouTube, Shorts, Vimeo)</span>
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="e.g. https://...mp4 or https://youtube.com/shorts/..."
                    value={formData.previewVideo}
                    onChange={(e) => setFormData({ ...formData, previewVideo: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Game Tags</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Arcade, 3D, Runner"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              {(() => {
                const activeVideoUrl = formData.previewVideo || getGamePreviewVideo({ gameUrl: formData.gameUrl, previewVideo: formData.previewVideo });
                const modalVideoSrc = parseVideoSource(activeVideoUrl);
                return (
                  <div style={{
                    background: 'rgba(10, 16, 36, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      🕹️ Live Card Preview (Hover to Test)
                    </div>

                    <div
                      onMouseEnter={() => {
                        setIsModalHovered(true);
                        if (modalVideoRef.current && modalVideoSrc?.type === 'direct') {
                          try {
                            modalVideoRef.current.currentTime = 0;
                            const p = modalVideoRef.current.play();
                            if (p !== undefined) p.catch(() => {});
                          } catch {}
                        }
                      }}
                      onMouseLeave={() => {
                        setIsModalHovered(false);
                        if (modalVideoRef.current && modalVideoSrc?.type === 'direct') {
                          modalVideoRef.current.pause();
                          try { modalVideoRef.current.currentTime = 0; } catch {}
                        }
                      }}
                      style={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '2px solid rgba(0, 242, 254, 0.4)',
                        background: '#000000',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={formData.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400'; }}
                      />

                      {modalVideoSrc?.type === 'direct' && (
                        <video
                          ref={modalVideoRef}
                          src={modalVideoSrc.url}
                          muted
                          loop
                          playsInline
                          preload="auto"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isModalHovered ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                            pointerEvents: 'none',
                            zIndex: 2
                          }}
                        />
                      )}

                      {isModalHovered && (modalVideoSrc?.type === 'youtube' || modalVideoSrc?.type === 'vimeo') && (
                        <iframe
                          src={modalVideoSrc.embedUrl}
                          title="Video preview"
                          allow="autoplay; encrypted-media"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                            pointerEvents: 'none',
                            opacity: 1,
                            zIndex: 2,
                            transform: 'scale(1.25)',
                            transformOrigin: 'center center'
                          }}
                        />
                      )}
                    </div>

                    <span style={{ fontSize: '0.68rem', color: activeVideoUrl ? '#22c55e' : '#94a3b8' }}>
                      {activeVideoUrl
                        ? (modalVideoSrc?.type === 'youtube'
                            ? '● YouTube video on hover'
                            : modalVideoSrc?.type === 'vimeo'
                            ? '● Vimeo video on hover'
                            : '● Video active on hover (CrazyGames style)')
                        : '○ Static thumbnail'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Row 4: Card Size & Publication Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📐 Website Card Size </span>
                  <span style={{ fontSize: '0.72rem', color: '#00f2fe', fontWeight: 600 }}>{formData.tileSize || 'auto'}</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { id: '1x1', label: '1x1 Normal', desc: 'Square' },
                    { id: '2x2', label: '2x2 Hero', desc: 'Big Square' },
                    { id: '2x1', label: '2x1 Wide', desc: 'Banner' },
                    { id: '1x2', label: '1x2 Tall', desc: 'Poster' }
                  ].map(ts => {
                    const isSel = (formData.tileSize || 'auto') === ts.id;
                    return (
                      <button
                        key={ts.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, tileSize: ts.id })}
                        style={{
                          padding: '6px 4px',
                          borderRadius: '8px',
                          border: isSel ? '1.5px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: isSel ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSel ? '#00f2fe' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>{ts.label}</div>
                        <div style={{ fontSize: '0.62rem', color: isSel ? '#67e8f9' : '#94a3b8' }}>{ts.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <select
                  className="form-input"
                  value={formData.tileSize}
                  onChange={(e) => setFormData({ ...formData, tileSize: e.target.value })}
                  style={{ cursor: 'pointer', background: '#0a1126', color: '#fff' }}
                >
                  {TILE_SIZES.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Status</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'active', label: 'Active', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                    { id: 'maintenance', label: 'Maint.', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                    { id: 'draft', label: 'Draft', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' }
                  ].map(st => {
                    const isSelected = formData.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: st.id })}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: isSelected ? `1.5px solid ${st.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? st.bg : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? st.color : '#94a3b8',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 5: Description & Spotlight Featured Checkbox */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Description</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Short game description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '10px'
            }}>
              <input
                type="checkbox"
                id="featCheckbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: '#fbbf24', cursor: 'pointer' }}
              />
              <label htmlFor="featCheckbox" style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.84rem', color: formData.featured ? '#fbbf24' : '#e2e8f0' }}>
                ⭐ Mark as Spotlight / Featured Game
              </label>
            </div>

          </div>

          {/* Clean Footer */}
          <div className="modal-footer" style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-glass)' }}>
            <button type="button" className="admin-btn secondary" onClick={onClose} style={{ padding: '8px 18px' }}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" style={{ padding: '8px 22px', fontWeight: 800 }}>
              {game ? 'Save Changes' : 'Publish Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
