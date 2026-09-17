import React, { useState } from 'react';

export default function SettingsView({ 
  settings = {}, 
  onSaveSettings, 
  onExportData, 
  onImportData 
}) {
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImportData(parsed);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
      {/* Platform Settings */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">
              <span style={{ color: 'var(--accent-blue)' }}>⚙️</span>
              <span>General Platform Configuration</span>
            </h2>
            <span className="panel-subtitle">Metadata, SEO title, portal registrations, and maintenance status</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Platform Branding Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.platformName || ''}
              onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Meta Site Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.siteTitle || ''}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Meta Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={formData.metaDescription || ''}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            />
          </div>

          {/* SERP Search Preview */}
          <div style={{ padding: '14px', background: '#060a17', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>GOOGLE SERP PREVIEW</div>
            <div style={{ fontSize: '0.74rem', color: '#22c55e', marginBottom: 2 }}>https://skygames.io</div>
            <div style={{ fontSize: '0.98rem', color: '#60a5fa', fontWeight: 600, textDecoration: 'underline', marginBottom: 4 }}>
              {formData.siteTitle || 'THOPGAME - Next-Gen Web Gaming Arena'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {formData.metaDescription || 'Play the best high-octane cyberpunk and neon arcade games in your browser instantly.'}
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px 16px', 
              background: 'rgba(10, 16, 36, 0.7)', 
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius)' 
            }}
          >
            <input
              type="checkbox"
              id="devSubToggle"
              checked={formData.allowDevSubmissions}
              onChange={(e) => setFormData({ ...formData, allowDevSubmissions: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <label htmlFor="devSubToggle" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
              Allow Public Developer Game Submissions
            </label>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px 16px', 
              background: formData.maintenanceMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(10, 16, 36, 0.7)', 
              border: `1px solid ${formData.maintenanceMode ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glass)'}`,
              borderRadius: 'var(--radius)' 
            }}
          >
            <input
              type="checkbox"
              id="maintToggle"
              checked={formData.maintenanceMode}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-red)', cursor: 'pointer' }}
            />
            <label htmlFor="maintToggle" style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: formData.maintenanceMode ? '#f87171' : '#ffffff' }}>
              Enable Maintenance Lockdown Mode
            </label>
          </div>

          <button type="submit" className="admin-btn primary" style={{ justifyContent: 'center', marginTop: 8 }}>
            <span>💾</span>
            <span>Save & Apply Settings</span>
          </button>
        </form>
      </div>

      {/* Backup & System Maintenance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="glass-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                <span style={{ color: 'var(--accent-cyan)' }}>📦</span>
                <span>Database Backup & Snapshot</span>
              </h2>
              <span className="panel-subtitle">Export or restore full JSON snapshot of games, users & categories</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="admin-btn secondary" onClick={onExportData} style={{ justifyContent: 'center' }}>
              <span>📥</span>
              <span>Export Full Database (JSON)</span>
            </button>
            <label className="admin-btn secondary" style={{ justifyContent: 'center', cursor: 'pointer' }}>
              <span>📤</span>
              <span>Import Database JSON</span>
              <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>


      </div>
    </div>
  );
}
