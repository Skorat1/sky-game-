import React from 'react';
import { X, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="sky-modal-backdrop" onClick={onClose}>
      <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div className="info-title-group">
            <ShieldCheck size={24} className="text-purple" />
            <h2>Privacy Policy & Terms</h2>
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
          <div className="info-section-block">
            <h3>1. Information We Collect</h3>
            <p>
              ThopGames respects your privacy. We do not require personal registration or account creation to enjoy games. We may collect non-identifiable technical data such as browser type, device resolution, and anonymous gameplay statistics (high scores, favorited games) stored locally in your browser (LocalStorage).
            </p>
          </div>

          <div className="info-section-block">
            <h3>2. Cookies & Local Storage</h3>
            <p>
              We utilize browser LocalStorage solely to remember your sound preferences, theme choices, and saved favorite games so you can resume playing seamlessly.
            </p>
          </div>

          <div className="info-section-block">
            <h3>3. Third-Party Games & Content</h3>
            <p>
              Some games may be provided by licensed third-party developers or studios. All titles are audited to ensure family-friendly, safe, and malware-free execution.
            </p>
          </div>

          <div className="info-section-block">
            <h3>4. Contact Details</h3>
            <p>
              For privacy queries or DMCA removal requests, please reach out via our Contact Us portal or at <code>privacy@thopgame.com</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
