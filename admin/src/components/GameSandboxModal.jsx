import React, { useState, useEffect, useRef } from 'react';

export default function GameSandboxModal({ gameUrl, gameTitle = 'Game Live Sandbox', onClose }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Lock background scroll and prevent arrow/space scrolling during live sandbox gameplay
  useEffect(() => {
    if (!gameUrl) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown'].includes(e.key)) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
        }
      }
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [gameUrl, onClose]);

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleOpenNewTab = () => {
    if (gameUrl) {
      window.open(gameUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!gameUrl) return null;

  return (
    <div className="modal-overlay sandbox-overlay" onClick={onClose}>
      <div 
        ref={containerRef}
        className={`modal-content sandbox-modal-card ${isFullscreen ? 'fullscreen-mode' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sandbox Console Header */}
        <div className="sandbox-header">
          <div className="sandbox-header-left">
            <div className="sandbox-icon-badge">
              <span className="gamepad-icon">🕹️</span>
              <span className="pulse-indicator" />
            </div>
            <div className="sandbox-title-group">
              <div className="sandbox-title-row">
                <h3 className="sandbox-title">{gameTitle}</h3>
                <span className="sandbox-live-badge">TEST RUN</span>
              </div>
              <span className="sandbox-hint">Arrow Keys • Space • Mouse to Play</span>
            </div>
          </div>

          <div className="sandbox-header-actions">
            <button 
              className="sandbox-action-btn" 
              onClick={handleReload}
              title="Restart Game"
            >
              🔄 <span className="btn-text">Restart</span>
            </button>
            <button 
              className="sandbox-action-btn" 
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
            >
              {isFullscreen ? '↙ Exit' : '⛶ Fullscreen'}
            </button>
            <button 
              className="sandbox-action-btn" 
              onClick={handleOpenNewTab}
              title="Open in New Window"
            >
              ↗ <span className="btn-text">Popout</span>
            </button>
            <button 
              className="sandbox-close-btn" 
              onClick={onClose}
              title="Close Sandbox (ESC)"
              aria-label="Close Sandbox"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Game Iframe Viewport */}
        <div className="sandbox-viewport">
          <iframe
            key={iframeKey}
            src={gameUrl}
            title={gameTitle}
            scrolling="no"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; cross-origin-isolated"
            allowFullScreen={true}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-modals"
            className="sandbox-iframe"
          />
        </div>

        {/* Sandbox Console Status Footer */}
        <div className="sandbox-footer">
          <div className="sandbox-footer-status">
            <span className="status-dot-green" />
            <span>Sandbox Active • 60 FPS Engine</span>
          </div>
          <div className="sandbox-footer-esc">
            Press <kbd>ESC</kbd> or click ✕ to return
          </div>
        </div>
      </div>
    </div>
  );
}
