import React, { useState } from 'react';

export default function BannerView({ banner, onUpdateBanner }) {
  const [formData, setFormData] = React.useState({ ...banner });

  React.useEffect(() => {
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
          <h2 className="panel-title">📢 Sitewide Announcement Banner</h2>
          <span className={`status-badge ${formData.active ? 'active' : 'pending'}`}>
            {formData.active ? 'Broadcasting LIVE' : 'Disabled / Removed'}
          </span>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <input
              type="checkbox"
              id="bannerActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: 20, height: 20, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <label htmlFor="bannerActive" style={{ cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Enable Top Announcement Banner on Main Website
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Badge Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 🔥 TOURNAMENT LIVE, ⚡ NEW UPDATE, 🎁 WEEKEND EVENT"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Message *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter message for all players..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Button CTA Text</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Play Now, Join Event"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Button Target Link / Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. #arcade, /tournament, #knife-clash"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Border Accent Color</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="color"
                value={formData.borderColor || '#ff0055'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  borderColor: e.target.value,
                  bgColor: e.target.value + '25'
                })}
                style={{ width: 42, height: 42, border: 'none', background: 'transparent', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="form-input"
                value={formData.borderColor || '#ff0055'}
                onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" className="header-btn primary" style={{ flex: 1, justifyContent: 'center' }}>
              💾 Save & Broadcast Banner
            </button>
            <button 
              type="button" 
              onClick={handleRemove}
              className="header-btn danger" 
              style={{ background: 'rgba(255, 8, 68, 0.15)', border: '1px solid #ff0844', color: '#ff0844', justifyContent: 'center' }}
            >
              🗑️ Remove / Disable Banner
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2 className="panel-title">👁️ Live Banner Preview</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>As seen by players</span>
        </div>

        <div style={{ marginTop: 20 }}>
          {formData.active ? (
            <div
              style={{
                background: formData.bgColor || 'rgba(255, 0, 85, 0.15)',
                border: `1px solid ${formData.borderColor || '#ff0055'}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                boxShadow: `0 0 20px ${formData.borderColor || '#ff0055'}30`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {formData.badge && (
                  <span
                    style={{
                      background: formData.borderColor || '#ff0055',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 6,
                      letterSpacing: '1px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formData.badge}
                  </span>
                )}
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>
                  {formData.message || 'No announcement message specified.'}
                </span>
              </div>

              {formData.ctaText && (
                <button
                  style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formData.ctaText}
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: '1px dashed var(--border-glass)',
                color: 'var(--text-muted)'
              }}
            >
              Banner is currently disabled. Check the toggle above to activate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
