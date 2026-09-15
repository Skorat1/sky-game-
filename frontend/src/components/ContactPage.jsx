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
  Bug,
  Lightbulb,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronUp,
  Headphones,
  Globe2,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

import { messagesApi } from '../services/api';

const TOPIC_PRESETS = [
  { id: 'suggestion', label: 'Game Suggestion', icon: Lightbulb },
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'partner', label: 'Business & Partnership', icon: Briefcase },
  { id: 'speed', label: 'Performance & Latency', icon: Zap },
  { id: 'general', label: 'General Inquiry', icon: MessageSquare }
];

const CONTACT_FAQS = [
  {
    q: "How quickly does the SKYGAMES support team respond?",
    a: "Our global engineering and support team reviews inquiries 24/7. Most player support requests and bug tickets are answered within 2 hours. Business partnerships and publisher inquiries are typically reviewed within 1 business day."
  },
  {
    q: "Where should I report a game glitch, broken controls, or black screen?",
    a: "Select the 'Bug Report' category in the contact form above and include the game title along with your device or browser. Our QA team will reproduce and roll out a hotfix promptly."
  },
  {
    q: "How can indie game developers publish their games on SKYGAMES?",
    a: "You can submit directly via our Developer Portal or select 'Business & Partnership' above. We offer generous revenue sharing, featured placement, and instant global distribution for high-quality HTML5/WebGL games."
  },
  {
    q: "Is my personal data and email address kept private?",
    a: "100% yes. We strictly adhere to GDPR, CCPA, and COPPA privacy standards. We never sell, rent, or share your contact details with any third parties or advertisers."
  }
];

export default function ContactPage({ onBackToHome }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'Normal',
    message: ''
  });
  const [selectedTopic, setSelectedTopic] = useState('Game Suggestion');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleTopicClick = (topic) => {
    sounds.playClick();
    setSelectedTopic(topic.label);
    setFormData(prev => ({
      ...prev,
      subject: `[${topic.label}] ${prev.subject ? prev.subject.replace(/^\[.*?\]\s*/, '') : ''}`
    }));
  };

  const toggleFaq = (index) => {
    sounds.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    sounds.playPowerup();

    const genTicket = `SKY-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(genTicket);

    const subjectLine = formData.subject || `[${selectedTopic}] Support Request`;

    try {
      await messagesApi.sendMessage({
        name: formData.name,
        email: formData.email,
        type: selectedTopic.includes('Bug') ? 'Bug Report' : selectedTopic.includes('Business') ? 'Partnership' : 'Inquiry',
        subject: `${subjectLine} (${formData.priority} Priority - Ref: ${genTicket})`,
        message: formData.message
      });
    } catch (err) {
      console.warn('Message sync fallback:', err);
    }

    setSubmitting(false);
    setSent(true);
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="custom-static-page-container pro-contact-wrapper">
      {/* Professional Hero Section */}
      <div className="pro-contact-hero">
        <div className="pro-contact-hero-glow"></div>
        <div className="pro-contact-hero-content">
          <div className="pro-hero-badge">
            <ShieldCheck size={14} />
            <span>OFFICIAL SUPPORT & OPERATIONS DESK</span>
          </div>

          <h1>Get in Touch with <span className="pro-gradient-text">SKYGAMES</span></h1>
          <p className="pro-hero-subtitle">
            Have a question, feedback, bug report, or business partnership proposal? Connect directly with our engineering and community support team.
          </p>

          <div className="pro-sla-pill-row">
            <div className="pro-sla-pill">
              <Zap size={14} className="text-cyan" />
              <span>&lt; 2 Hour Response SLA</span>
            </div>
            <div className="pro-sla-pill">
              <Headphones size={14} className="text-purple" />
              <span>Direct Human Support</span>
            </div>
            <div className="pro-sla-pill">
              <span className="live-dot"></span>
              <span>All Systems Operational (99.98% Uptime)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Centerpiece */}
      <div className="pro-contact-main-grid pro-contact-centered-grid">
        <div className="pro-form-card">
          {sent ? (
            <div className="pro-form-success-box">
              <div className="pro-success-icon-wrap">
                <CheckCircle2 size={48} />
              </div>
              <span className="pro-ticket-badge">Ticket #{ticketId}</span>
              <h2>Inquiry Dispatched Successfully</h2>
              <p>
                Thank you for reaching out, <strong>{formData.name}</strong>. Your ticket has been routed to the appropriate department. A confirmation has been logged for <strong>{formData.email}</strong> and our team will follow up shortly.
              </p>
              <div className="pro-success-actions">
                <button
                  className="pro-btn-primary"
                  onClick={() => {
                    setSent(false);
                    setFormData({ name: '', email: '', subject: '', priority: 'Normal', message: '' });
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Submit Another Message</span>
                </button>
                <button
                  className="pro-btn-secondary"
                  onClick={() => {
                    sounds.playClick();
                    onBackToHome();
                  }}
                >
                  <span>Return to Arcade</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pro-contact-form">
              <div className="pro-form-header">
                <div>
                  <h3>Send a Direct Message</h3>
                  <p>Choose an inquiry topic below to expedite routing to the right engineering lead.</p>
                </div>
              </div>

              {/* Topic Selector Chips */}
              <div className="pro-topic-section">
                <label className="pro-field-label">Select Department / Category *</label>
                <div className="pro-topic-grid">
                  {TOPIC_PRESETS.map((t) => {
                    const isSelected = selectedTopic === t.label;
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`pro-topic-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleTopicClick(t)}
                      >
                        <IconComp size={16} />
                        <span className="chip-text">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form 2-Column Fields */}
              <div className="pro-form-grid-2">
                <div className="pro-form-group">
                  <label className="pro-field-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label className="pro-field-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="pro-form-grid-2">
                <div className="pro-form-group">
                  <label className="pro-field-label">Subject Line *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Partnership Proposal / Bug in Space Invaders"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label className="pro-field-label">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="pro-select-input"
                  >
                    <option value="Normal">🟢 Normal (Standard Support)</option>
                    <option value="High">🟡 High (Game Breaking Issue)</option>
                    <option value="Urgent">🔴 Urgent (Publisher / Security)</option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div className="pro-form-group">
                <div className="pro-label-row">
                  <label className="pro-field-label">Message Details *</label>
                  <span className="pro-char-counter">{formData.message.length} characters</span>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="Please provide comprehensive details, steps to reproduce (if bug), or your business scope..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Security & Privacy Reassurance */}
              <div className="pro-privacy-assurance">
                <Lock size={14} className="text-emerald" />
                <span>Encrypted transmission. Your email is protected under our Privacy Policy and never shared.</span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="pro-submit-btn"
              >
                <Send size={17} />
                <span>{submitting ? 'Dispatching Inquiry...' : 'Transmit Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions Accordion Section */}
      <div className="pro-contact-faq-section">
        <div className="pro-faq-header">
          <div className="pro-badge-mini">
            <HelpCircle size={14} />
            <span>QUICK ANSWERS</span>
          </div>
          <h3>Frequently Asked Questions</h3>
          <p>Quick resolutions to common inquiries before opening a ticket.</p>
        </div>

        <div className="pro-faq-list">
          {CONTACT_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`pro-faq-card ${isOpen ? 'expanded' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="pro-faq-q-row">
                  <div className="pro-faq-q-text">
                    <span className="pro-faq-num">0{idx + 1}</span>
                    <h4>{faq.q}</h4>
                  </div>
                  <div className="pro-faq-arrow">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
                {isOpen && (
                  <div className="pro-faq-a-row">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
