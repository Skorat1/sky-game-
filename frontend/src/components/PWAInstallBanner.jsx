import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    sounds.playClick();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    sounds.playClick();
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
    setVisible(false);
  };

  if (!visible || isInstalled) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0e1424 0%, #17233e 100%)',
      borderBottom: '1px solid rgba(0, 242, 254, 0.25)',
      padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: '#fff', zIndex: 9999, position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/sky-icon.png" alt="ThopGame" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
        <div>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f1f5f9' }}>
            ⚡ Install ThopGame App
          </span>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '8px' }}>
            Instant 0ms launch & offline arcade play on your device
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={handleInstall}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            color: '#070a13', border: 'none', borderRadius: '20px', fontWeight: 900,
            fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0, 242, 254, 0.3)'
          }}
        >
          <Download size={14} />
          <span>INSTALL FREE</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
