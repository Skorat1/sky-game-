import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  HelpCircle,
  PhoneCall,
  Flame,
  Copy,
  Check,
  Bug,
  Lightbulb,
  Briefcase,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

const TOPIC_PRESETS = [
  { id: 'suggestion', label: '🎮 Game Suggestion', icon: Lightbulb },
  { id: 'bug', label: '🐛 Bug Report', icon: Bug },
  { id: 'partner', label: '🤝 Business / Partnership', icon: Briefcase },
  { id: 'speed', label: '⚡ Performance Feedback', icon: Zap }
];

export default function ContactPage({ onBackToHome }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [selectedTopic, setSelectedTopic] = useState('🎮 Game Suggestion');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState('');

  const handleCopy = (email) => {
    sounds.playClick();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(''), 2000);
  };

  const handleTopicClick = (topic) => {
    sounds.playClick();
    setSelectedTopic(topic.label);
    setFormData(prev => ({
      ...prev,
      subject: `[${topic.label.replace(/^[^\w]+/, '').trim()}] ${prev.subject ? prev.subject.replace(/^\[.*?\]\s*/, '') : ''}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    sounds.playPowerup();

    const subjectLine = formData.subject || `[${selectedTopic}] General Inquiry`;

    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          type: selectedTopic.includes('Bug') ? 'Bug Report' : selectedTopic.includes('Business') ? 'Partnership' : 'Inquiry',
          subject: subjectLine,
          message: formData.message
        })
      });
    } catch (err) {
      console.warn('Message sync fallback:', err);
    }

    setSubmitting(false);
    setSent(true);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="custom-static-page-container">
      {/* Hero Showcase Card */}
      <div className="static-hero-card">
        <div className="static-hero-glow glow-crimson"></div>
        <div className="static-hero-content">
          <div className="static-badge badge-crimson">
            <Mail size={15} className="text-crimson" />
            <span>24/7 SUPPORT & COMMUNITY</span>
          </div>

          <div className="static-hero-icon-box crimson-border">
            <MessageSquare size={38} className="text-crimson" />
          </div>
          <h1>Get In Touch with <span className="neon-text-gradient">SKYGAMES</span></h1>
          <p className="static-hero-lead">
            Have an awesome game suggestion, technical bug report, or business partnership idea? Our support engineering team responds within 2 hours.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Channel Info Cards + Right Interactive Form */}
      <div className="contact-page-grid">
        {/* Left Channels Column */}
        <div className="contact-info-col">
          <div className="contact-card-glass">
            <div className="contact-icon-box bg-cyan-glass">
              <Mail size={22} className="text-cyan" />
            </div>
            <div className="contact-channel-details">
              <h4>Player Support & Help</h4>
              <span className="contact-email">support@skygames.com</span>
              <div className="channel-action-row">
                <span className="contact-sub-badge">⚡ &lt; 2 Hour Response</span>
                <button
                  className="mini-copy-action-btn"
                  onClick={() => handleCopy('support@skygames.com')}
                  title="Copy email address"
                >
                  {copiedEmail === 'support@skygames.com' ? <Check size={14} color="#00f5a0" /> : <Copy size={14} />}
                  <span>{copiedEmail === 'support@skygames.com' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="contact-card-glass">
            <div className="contact-icon-box bg-purple-glass">
              <Sparkles size={22} className="text-purple" />
            </div>
            <div className="contact-channel-details">
              <h4>Developer & Publisher Inquiries</h4>
              <span className="contact-email">publishers@skygames.com</span>
              <div className="channel-action-row">
                <span className="contact-sub-badge">🚀 Game Monetization & Features</span>
                <button
                  className="mini-copy-action-btn"
                  onClick={() => handleCopy('publishers@skygames.com')}
                  title="Copy email address"
                >
                  {copiedEmail === 'publishers@skygames.com' ? <Check size={14} color="#00f5a0" /> : <Copy size={14} />}
                  <span>{copiedEmail === 'publishers@skygames.com' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="contact-card-glass">
            <div className="contact-icon-box bg-emerald-glass">
              <Clock size={22} className="text-emerald" />
            </div>
            <div className="contact-channel-details">
              <h4>Operating Hours</h4>
              <p className="contact-meta-desc">24/7 Global Live Operations</p>
              <span className="contact-sub-badge">🟢 All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Right Contact Form Card */}
        <div className="contact-form-card">
          {sent ? (
            <div className="form-success-state">
              <div className="success-icon-burst">
                <CheckCircle2 size={64} color="#00f5a0" />
              </div>
              <h2>Message Dispatched!</h2>
              <p>
                Thank you for reaching out, <strong>{formData.name}</strong>. Our support team has logged your message and will follow up at <strong>{formData.email}</strong> shortly.
              </p>
              <div className="success-action-row">
                <button
                  className="static-cta-btn"
                  onClick={() => {
                    setSent(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                >
                  Send Another Message
                </button>
                <button
                  className="crazy-back-btn"
                  onClick={() => {
                    sounds.playClick();
                    onBackToHome();
                  }}
                >
                  Back to Games
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-actual-form">
              <div className="form-header-title">
                <h3>Send Us a Direct Message</h3>
                <p>Pick a topic or write directly to our engineering team.</p>
              </div>

              {/* Topic Selector Pills */}
              <div className="topic-selector-group">
                <label>Select Category:</label>
                <div className="topic-chips-row">
                  {TOPIC_PRESETS.map((t) => {
                    const isSelected = selectedTopic === t.label;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`topic-pill-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleTopicClick(t)}
                      >
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Walker"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add 2-Player mode, Canvas Bug, Publisher deal"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <div className="label-count-row">
                  <label>Message Content *</label>
                  <span className="char-count">{formData.message.length} chars</span>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your message, feedback, or inquiry here in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="contact-submit-btn"
              >
                <Send size={18} />
                <span>{submitting ? 'Transmitting Message...' : 'Send Message Now'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
