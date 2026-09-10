import React, { useState } from 'react';

export default function SettingsView({ 
  settings, 
  onSaveSettings, 
  onExportData, 
  onImportData, 
  onResetData 
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
          <h2 className="panel-title">⚙️ General Platform Settings</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Platform Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.platformName}
              onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Meta Site Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Meta Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <input
              type="checkbox"
              id="devSubToggle"
              checked={formData.allowDevSubmissions}
              onChange={(e) => setFormData({ ...formData, allowDevSubmissions: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <label htmlFor="devSubToggle" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Allow Public Developer Submissions (via Developer Portal)
            </label>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,0,85,0.08)', borderRadius: 8, border: '1px solid rgba(255,0,85,0.2)' }}>
            <input
              type="checkbox"
              id="maintToggle"
              checked={formData.maintenanceMode}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-magenta)', cursor: 'pointer' }}
            />
            <label htmlFor="maintToggle" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-magenta)' }}>
              Enable Maintenance Lockdown Mode
            </label>
          </div>

          <button type="submit" className="header-btn primary" style={{ justifyContent: 'center', marginTop: 10 }}>
            💾 Save Settings
          </button>
        </form>
      </div>

      {/* Backup & System Maintenance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">📦 Data Backup & Export</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Download full platform database (games, categories, banner configs, submissions) as JSON.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="header-btn" onClick={onExportData} style={{ justifyContent: 'center' }}>
              📥 Export Platform Data (JSON)
            </button>
            <label className="header-btn" style={{ justifyContent: 'center', cursor: 'pointer' }}>
              📤 Import Backup JSON
              <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h2 className="panel-title" style={{ color: 'var(--accent-magenta)' }}>⚠️ Factory Reset</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Reset all admin panel data and catalog back to default state.
          </p>
          <button 
            className="header-btn" 
            style={{ borderColor: 'var(--accent-magenta)', color: 'var(--accent-magenta)', justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all data back to factory defaults?')) {
                onResetData();
              }
            }}
          >
            🔄 Reset Database to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
