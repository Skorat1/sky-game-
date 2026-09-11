import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Sparkles,
  Server,
  UserCheck,
  Bell,
  HelpCircle,
  Database,
  Trash2,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function PrivacyPage({ onBackToHome }) {
  const [clearedStorage, setClearedStorage] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleClearLocalStorage = () => {
    sounds.playClick();
    try {
      localStorage.removeItem('sky_recent');
      localStorage.removeItem('sky_favorites');
      setClearedStorage(true);
      setTimeout(() => setClearedStorage(false), 3000);
    } catch { }
  };

  const handleCopyEmail = () => {
    sounds.playClick();
    navigator.clipboard.writeText('privacy@skygames.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="custom-static-page-container">
      {/* Hero Showcase Card */}
      <div className="static-hero-card">
        <div className="static-hero-glow glow-purple"></div>
        <div className="static-hero-content">
          <div className="static-badge badge-purple">
            <ShieldCheck size={15} className="text-purple" />
            <span>PRIVACY & SECURITY POLICY</span>
          </div>

          <div className="static-hero-icon-box purple-border">
            <Lock size={38} className="text-purple" />
          </div>
          <h1>Your Privacy is <span className="neon-text-gradient">Our Priority</span></h1>
          <p className="static-hero-lead">
            Your privacy and digital safety are foundational to everything we build. We believe in complete transparency, zero invasive tracking, and giving you 100% control of your gameplay data.
          </p>
          <div className="policy-meta-date">
            <span>🛡️ Updated for 2026 • Compliant with GDPR, CCPA & COPPA</span>
          </div>
        </div>
      </div>

      {/* Privacy Principles Quick Highlights */}
      <div className="privacy-highlight-row">
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>No Mandatory Signups</strong>
            <span>Jump straight into playing without sharing phone or credit cards.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Local Storage Only</strong>
            <span>Game saves and preferences remain safely in your browser.</span>
          </div>
        </div>
        <div className="privacy-pill-box">
          <CheckCircle2 size={18} className="text-emerald" />
          <div>
            <strong>Sandboxed iframes</strong>
            <span>Zero third-party access to your camera, microphone, or filesystem.</span>
          </div>
        </div>
      </div>

      {/* Transparent Data Matrix Table */}
      <div className="data-matrix-card">
        <div className="matrix-card-header">
          <Database size={20} className="text-cyan" />
          <h3>Transparent Data Collection Matrix</h3>
        </div>
        <div className="matrix-table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Data Category</th>
                <th>Collected?</th>
                <th>Storage Location</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Personal Identity</strong> (Name, Phone, Credit Card)</td>
                <td><span className="status-tag tag-no">❌ NEVER</span></td>
                <td>Not stored</td>
                <td>Not required for gameplay</td>
              </tr>
              <tr>
                <td><strong>Game Saves & Favorites</strong></td>
                <td><span className="status-tag tag-yes">✅ YES</span></td>
                <td>Browser LocalStorage</td>
                <td>To restore your favorited titles and high scores</td>
              </tr>
              <tr>
                <td><strong>Sound & Theme Preferences</strong></td>
                <td><span className="status-tag tag-yes">✅ YES</span></td>
                <td>Browser LocalStorage</td>
                <td>To preserve your volume & theater mode preferences</td>
              </tr>
              <tr>
                <td><strong>Anonymous Analytics</strong> (Page hits, Game plays)</td>
                <td><span className="status-tag tag-yes">✅ YES</span></td>
                <td>Aggregated Global Server</td>
                <td>To rank trending titles and optimize server bandwidth</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Policy Sections List */}
      <div className="policy-sections-list">
        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">01</div>
            <div>
              <h3>1. Information Collection & Telemetry</h3>
              <p className="policy-subtitle">Purely anonymous performance and gameplay metrics</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              SKYGAMES does not harvest personal identifiers. When you interact with our gaming catalog, our edge load balancers collect anonymous telemetry (such as viewport resolution, approximate country region, and browser type) solely to ensure high-performance 60 FPS canvas scaling and low-latency asset streaming.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">02</div>
            <div>
              <h3>2. Cookies & HTML5 Local Storage</h3>
              <p className="policy-subtitle">Full user control over local device preferences</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              We avoid intrusive third-party cross-site advertising trackers. We utilize HTML5 LocalStorage strictly on your device to remember which games you've marked as favorites and your recent plays.
            </p>
            <div className="storage-action-box">
              <div>
                <strong>Manage Local Game Data:</strong>
                <p>You can instantly wipe your local recent games history and stored preferences at any time.</p>
              </div>
              <button
                className={`purge-storage-btn ${clearedStorage ? 'purged' : ''}`}
                onClick={handleClearLocalStorage}
              >
                <Trash2 size={16} />
                <span>{clearedStorage ? 'Local History Cleared!' : 'Clear My Local Game Data'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">03</div>
            <div>
              <h3>3. Sandboxing & Third-Party Games</h3>
              <p className="policy-subtitle">Rigorous malware audit and containerized iframes</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              Third-party and community-submitted games run in isolated browser iframes with strictly defined permission policies. Games cannot access your device camera, contacts, or internal files.
            </p>
          </div>
        </div>

        <div className="policy-section-card">
          <div className="policy-card-header">
            <div className="policy-num">04</div>
            <div>
              <h3>4. DMCA, Copyright & Data Protection Officer</h3>
              <p className="policy-subtitle">Fast 24-hour resolution for legal and privacy inquiries</p>
            </div>
          </div>
          <div className="policy-card-body">
            <p>
              If you have any questions regarding privacy, terms, or wish to submit a DMCA copyright takedown notice, contact our Data Protection and Compliance team directly:
            </p>
            <div className="email-copy-bar">
              <span className="email-text">privacy@skygames.com</span>
              <button className="copy-btn" onClick={handleCopyEmail}>
                {copiedEmail ? <Check size={16} color="#00f5a0" /> : <Copy size={16} />}
                <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
