import React, { useState, useEffect } from 'react';

export default function BannerView({ banner, onUpdateBanner }) {
  const [formData, setFormData] = useState({ ...banner });
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  useEffect(() => {
    if (banner) {
      setFormData({ ...banner });
    }
  }, [banner]);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateBanner(formData);
  };

  const handleRemove = () => {
    const disabledState = {
      ...formData,
      active: false,
      message: ''
    };
    setFormData(disabledState);
    onUpdateBanner(disabledState);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
      {/* Configuration Form */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-rose)' }}>📢</span>
              <span>Announcement Banner Broadcast</span>
            </h2>
            <span className="panel-subtitle">
              Display high-priority notifications, tournament alerts, and promo alerts to all active players
            </span>
          </div>

          <span className={`status-badge ${formData.active ? 'active' : 'draft'}`}>
            {formData.active ? 'Broadcasting LIVE' : 'Disabled'}
          </span>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Active Switch */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14, 
              padding: '14px 18px', 
              background: formData.active ? 'rgba(0, 242, 254, 0.08)' : 'rgba(10, 16, 36, 0.7)', 
              border: `1px solid ${formData.active ? 'rgba(0, 242, 254, 0.3)' : 'var(--border-glass)'}`,
              borderRadius: 'var(--radius)' 
            }}
          >
            <input
              type="checkbox"
              id="bannerActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <label htmlFor="bannerActive" style={{ cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              Broadcast Top Announcement Banner on Live Website
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Badge Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 🔥 TOURNAMENT LIVE, ⚡ NEW UPDATE, 🎁 WEEKEND EVENT"
              value={formData.badge || ''}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Message *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter message text displayed to all players..."
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Button CTA Text</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Play Now, Join Championship"
                value={formData.ctaText || ''}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Link / Route</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. #arcade, /tournament"
                value={formData.ctaLink || ''}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Border Accent Color</label>
            <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
              <input
                type="color"
                value={formData.borderColor || '#00f2fe'}
                onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                style={{ width: 44, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
              />
              <input
                type="text"
                className="form-input"
                value={formData.borderColor || '#00f2fe'}
                onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" className="admin-btn primary" style={{ flex: 1 }}>
              <span>🚀</span>
              <span>Publish & Broadcast Live</span>
            </button>
            {formData.active && (
              <button 
                type="button" 
                className="admin-btn danger" 
                onClick={handleRemove}
                title="Deactivate and take down banner"
              >
                <span>✕</span>
                <span>Turn Off</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Live Preview Simulator */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span>🖥️</span>
              <span>Live Player Simulation</span>
            </h2>
            <span className="panel-subtitle">Real-time preview of banner on user screen</span>
          </div>

          <div className="chart-toggle-group">
            <button
              className={`chart-toggle-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
              onClick={() => setPreviewDevice('desktop')}
            >
              Desktop
            </button>
            <button
              className={`chart-toggle-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
              onClick={() => setPreviewDevice('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>

        <div 
          style={{
            background: '#060a17',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius)',
            padding: previewDevice === 'mobile' ? '16px' : '24px',
            maxWidth: previewDevice === 'mobile' ? '320px' : '100%',
            margin: '0 auto',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
          }}
        >
          {/* Simulated Browser Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
              https://skygames.io
            </span>
          </div>

          {/* Banner Box */}
          {formData.active ? (
            <div
              style={{
                background: formData.bgColor || 'rgba(0, 242, 254, 0.1)',
                border: `1.5px solid ${formData.borderColor || 'var(--accent-cyan)'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                boxShadow: `0 0 15px ${formData.borderColor || 'var(--accent-cyan)'}40`,
                display: 'flex',
                flexDirection: previewDevice === 'mobile' ? 'column' : 'row',
                alignItems: previewDevice === 'mobile' ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {formData.badge && (
                  <span
                    style={{
                      background: 'var(--grad-cyan-blue)',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      letterSpacing: 0.5
                    }}
                  >
                    {formData.badge}
                  </span>
                )}
                <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 600 }}>
                  {formData.message || 'No announcement message specified.'}
                </span>
              </div>

              {formData.ctaText && (
                <button
                  style={{
                    background: 'var(--grad-cyan-blue)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formData.ctaText} →
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Announcement banner is currently disabled. Toggle active to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
