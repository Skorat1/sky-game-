import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Gift, Zap, Shield, Trophy, Flame } from 'lucide-react';
import { gamificationApi } from '../services/api';
import { sounds } from '../utils/audio';

export default function QuestRewardsModal({
  isOpen,
  onClose,
  totalXp = 0,
  level = 1,
  onXpAwarded,
  completedQuests = {},
  unlockedBadges = []
}) {
  const [quests, setQuests] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState('quests'); // quests | badges
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    if (isOpen) {
      gamificationApi.getQuests().then(res => {
        setQuests(res.quests || []);
        setBadges(res.badges || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Level XP calculations (e.g. 100 XP per level exponent)
  const currentLevelMinXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progressPercent = Math.min(Math.max(((totalXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp || 100)) * 100, 5), 100);

  const handleClaim = async (quest) => {
    if (claiming) return;
    setClaiming(quest.id);
    sounds.playPowerup();
    try {
      const res = await gamificationApi.claimQuest(quest.id, totalXp);
      if (res.success && onXpAwarded) {
        onXpAwarded(res.newTotalXp, res.newLevel, quest.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="sky-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7, 10, 19, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="sky-quest-modal" onClick={e => e.stopPropagation()} style={{
        background: '#0e1424', border: '1px solid rgba(245, 45, 126, 0.3)', borderRadius: '24px',
        width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(245, 45, 126, 0.15)', overflow: 'hidden', color: '#fff'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(245, 45, 126, 0.1) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #f52d7e, #ff6b6b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Zap size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Daily Quests & XP Rewards</h2>
              <span style={{ fontSize: '0.8rem', color: '#f52d7e', fontWeight: 600 }}>GAMER MASTERY LADDER</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255, 255, 255, 0.06)', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', cursor: 'pointer'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Player Level & XP Bar Progress Card */}
        <div style={{ padding: '16px 24px', background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#070a13',
                padding: '3px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.85rem'
              }}>LEVEL {level}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>Gamer Profile</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#00f2fe', fontWeight: 700 }}>
              {totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
          </div>

          <div style={{
            width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #00f2fe, #f52d7e)', borderRadius: '10px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '12px', padding: '12px 24px', background: 'rgba(0,0,0,0.1)' }}>
          <button
            onClick={() => setActiveTab('quests')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.85rem',
              background: activeTab === 'quests' ? 'linear-gradient(135deg, #f52d7e, #ff6b6b)' : 'rgba(255,255,255,0.05)',
              color: '#fff'
            }}
          >
            🔥 Daily Missions (3)
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.85rem',
              background: activeTab === 'badges' ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'rgba(255,255,255,0.05)',
              color: activeTab === 'badges' ? '#070a13' : '#fff'
            }}
          >
            🏆 Badges & Trophies ({badges.length})
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scrollbar">
          {activeTab === 'quests' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quests.map(quest => {
                const isClaimed = !!completedQuests[quest.id];
                return (
                  <div key={quest.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{quest.icon}</span>
                      <div>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800 }}>{quest.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{quest.description}</p>
                      </div>
                    </div>

                    <div>
                      {isClaimed ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          color: '#00f5a0', fontWeight: 800, fontSize: '0.82rem', padding: '6px 12px',
                          background: 'rgba(0, 245, 160, 0.1)', borderRadius: '8px'
                        }}>
                          <CheckCircle2 size={14} /> Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(quest)}
                          disabled={claiming === quest.id}
                          style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #00f2fe, #4facfe)', color: '#070a13',
                            fontWeight: 800, fontSize: '0.82rem', transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0, 242, 254, 0.25)'
                          }}
                        >
                          +{quest.rewardXp} XP Claim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {badges.map(badge => {
                const isUnlocked = unlockedBadges.includes(badge.id) || level >= 3;
                return (
                  <div key={badge.id} style={{
                    padding: '14px', borderRadius: '14px', textAlign: 'center',
                    background: isUnlocked ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: isUnlocked ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    opacity: isUnlocked ? 1 : 0.5
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{badge.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isUnlocked ? '#00f2fe' : '#94a3b8' }}>{badge.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{badge.description}</div>
                    <div style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 700, marginTop: '6px' }}>+{badge.xpBonus} XP Bonus</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
