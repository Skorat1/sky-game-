import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    sounds.playPowerup();
    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          type: formData.subject.toLowerCase().includes('bug') ? 'Bug Report' : 'Inquiry',
          subject: formData.subject,
          message: formData.message
        })
      });
    } catch (err) {
      console.warn('Message sync offline:', err);
    }
    setSent(true);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="sky-modal-backdrop" onClick={onClose}>
      <div className="info-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div className="info-title-group">
            <Mail size={24} className="text-crimson" />
            <h2>ContactThopGames</h2>
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
          {sent ? (
            <div className="form-success-state" style={{ padding: '30px 10px' }}>
              <CheckCircle2 size={50} color="#00f5a0" />
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for reaching out, <strong>{formData.name}</strong>. Our support team will get back to you within 24 hours.</p>
              <button
                className="neon-play-btn"
                onClick={() => {
                  setSent(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="game-submit-form">
              <p className="contact-subtext">
                Have questions, partnership inquiries, or game suggestions? We'd love to hear from you!
              </p>

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
                  <label>Your Email *</label>
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
                <label>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bug report / Business Inquiry / Feedback"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="dev-submit-btn">
                <Send size={16} /> SEND MESSAGE
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
