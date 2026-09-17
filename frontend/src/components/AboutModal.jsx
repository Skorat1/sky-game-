import React from 'react';
import { X, Gamepad2, Heart, Users, Globe2, ShieldCheck, Zap } from 'lucide-react';
import { STATS } from '../data/games';
import { sounds } from '../utils/audio';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="sky-modal-backdrop" onClick={onClose}>
      <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div className="info-title-group">
            <Gamepad2 size={24} className="text-cyan" />
            <h2>About ThopGame</h2>
          </div>
          <button
            className="modal-tool-btn close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="info-modal-body">
          <p className="info-lead">
            <strong>ThopGame.com</strong> is your ultimate premier destination for free online games directly in your web browser. No downloads, no installations, and no paywalls — just pure instant gaming entertainment anytime, anywhere!
          </p>

          <div className="about-stats-grid">
            <div className="about-stat-item">
              <h3>{STATS.activePlayers}</h3>
              <p>Active Daily Players</p>
            </div>
            <div className="about-stat-item">
              <h3>{STATS.totalGames}</h3>
              <p>Handpicked Games</p>
            </div>
            <div className="about-stat-item">
              <h3>{STATS.countries}</h3>
              <p>Countries Connected</p>
            </div>
            <div className="about-stat-item">
              <h3>{STATS.satisfaction}</h3>
              <p>Player Satisfaction</p>
            </div>
          </div>

          <div className="info-section-block">
            <h3>🚀 Our Mission</h3>
            <p>
              We believe great gaming should be universally accessible to everyone on any device — whether on a school Chromebook, office desktop, tablet, or smartphone. We hand-select high quality indie titles, retro arcade classics, and cutting-edge WebGL 3D experiences.
            </p>
          </div>

          <div className="info-section-block">
            <h3>❤️ Made with Passion in India</h3>
            <p>
              Built by passionate game developers and engineers with love for the global gaming community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
