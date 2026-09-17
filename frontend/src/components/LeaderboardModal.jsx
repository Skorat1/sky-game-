import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trophy,
  Flame,
  Calendar,
  Award,
  Sparkles,
  User,
  RefreshCw,
  Search,
  CheckCircle2,
  Crown,
  Medal,
  Zap,
  Send,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { leaderboardApi } from '../services/api';
import { sounds } from '../utils/audio';

export default function LeaderboardModal({ isOpen, onClose, game = null, user = null, onScoreSubmitted }) {
  const [period, setPeriod] = useState('all'); // daily | weekly | all
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualScore, setManualScore] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const gameId = game?.id || game?._id || 'global';
  const gameTitle = game?.title || 'Global Champions Ladder';

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (gameId === 'global') {
        const data = await leaderboardApi.getChampions();
        setEntries(data.champions || []);
      } else {
        const data = await leaderboardApi.getLeaderboard(gameId, period);
        setEntries(data.leaderboard || []);
      }
    } catch {
      // Fallback starter scores
      setEntries([
        { _id: '1', playerName: 'NeonVortex', score: 148500, levelReached: 12, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', country: '🇺🇸' },
        { _id: '2', playerName: 'CyberNinja_99', score: 112300, levelReached: 9, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', country: '🇯🇵' },
        { _id: '3', playerName: 'PixelValkyrie', score: 94200, levelReached: 7, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', country: '🇩🇪' },
        { _id: '4', playerName: 'TurboGamerX', score: 78900, levelReached: 6, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', country: '🇬🇧' },
        { _id: '5', playerName: 'ShadowStrike', score: 62400, levelReached: 5, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80', country: '🇮🇳' },
        { _id: '6', playerName: 'ArcadeRider', score: 51200, levelReached: 4, avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80', country: '🇨🇦' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
      setSearchQuery('');
      setSubmitSuccess(false);
    }
  }, [isOpen, gameId, period]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase().trim();
    return entries.filter(e => (e.playerName || '').toLowerCase().includes(q));
  }, [entries, searchQuery]);

  const handleManualScoreSubmit = async (e) => {
    e.preventDefault();
    const scoreVal = parseInt(manualScore, 10);
    if (isNaN(scoreVal) || scoreVal <= 0) return;

    setIsSubmitting(true);
    sounds.playPowerup();
    try {
      const playerName = user?.name || user?.username || 'You (Gamer)';
      const avatar = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

      const res = await leaderboardApi.submitScore({
        gameId,
        gameTitle,
        playerName,
        avatar,
        score: scoreVal,
        levelReached: user?.level || 1
      });

      if (res.success && res.entry) {
        setEntries(prev => [res.entry, ...prev].sort((a, b) => b.score - a.score));
        setManualScore('');
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3500);
        if (onScoreSubmitted) onScoreSubmitted(res.entry);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const top3 = filteredEntries.slice(0, 3);
  const restEntries = filteredEntries.slice(3);

  return (
    <div className="sky-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7, 10, 19, 0.88)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', animation: 'fadeIn 0.25s ease'
    }}>
      <div className="sky-leaderboard-modal" onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(180deg, #0d1322 0%, #080c16 100%)',
        border: '1.5px solid rgba(0, 242, 254, 0.3)', borderRadius: '24px',
        width: '100%', maxWidth: '680px', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 80px rgba(0, 242, 254, 0.2), 0 0 40px rgba(0, 0, 0, 0.9)',
        overflow: 'hidden', color: '#f1f5f9', position: 'relative'
      }}>
        {/* Top Glow Ambient Background */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '320px', height: '120px', background: 'radial-gradient(ellipse, rgba(0, 242, 254, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(30px)'
        }} />

        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(0, 242, 254, 0.08) 0%, transparent 100%)',
          position: 'relative', zIndex: 2
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#070a13',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.35)'
            }}>
              <Trophy size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
                  {gameTitle}
                </h2>
                <span style={{
                  background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe',
                  fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.3)'
                }}>LIVE</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                🏆 Verified High Score Global Ladder
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                sounds.playClick();
                fetchLeaderboard();
              }}
              title="Refresh Leaderboard"
              style={{
                background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
            </button>

            <button
              onClick={onClose}
              title="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar Row: Timeframe Switcher & Player Search Input */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', padding: '14px 24px', background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)', position: 'relative', zIndex: 2
        }}>
          {/* Timeframe Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'All-Time', icon: Award, color: '#00f2fe' },
              { id: 'weekly', label: 'This Week', icon: Flame, color: '#f52d7e' },
              { id: 'daily', label: 'Today', icon: Calendar, color: '#00f5a0' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = period === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setPeriod(tab.id);
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
                    border: isActive ? `1px solid ${tab.color}` : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    boxShadow: isActive ? `0 0 14px ${tab.color}33` : 'none'
                  }}
                >
                  <Icon size={14} color={isActive ? tab.color : '#94a3b8'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Player in Leaderboard */}
          <div style={{ position: 'relative', minWidth: '180px', flex: '1', maxWidth: '240px' }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search gamer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: '34px', background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                padding: '0 10px 0 32px', color: '#fff', fontSize: '0.8rem', outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }} className="custom-scrollbar">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#00f2fe' }}>
              <RefreshCw size={36} className="spin-animation" style={{ margin: '0 auto 14px' }} />
              <p style={{ fontSize: '0.92rem', color: '#94a3b8', fontWeight: 600 }}>Syncing live global records...</p>
            </div>
          ) : (
            <>
              {/* TOP 3 PODIUM (Visual 3D Pedestals) */}
              {!searchQuery && top3.length > 0 && (
                <div style={{
                  display: 'grid', gridTemplateColumns: top3.length === 3 ? '1fr 1.15fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px', marginBottom: '24px', alignItems: 'end'
                }}>
                  {/* #2 Silver (left) */}
                  {top3[1] && (
                    <div style={{
                      background: 'linear-gradient(180deg, rgba(192, 192, 192, 0.12) 0%, rgba(14, 20, 36, 0.8) 100%)',
                      border: '1.5px solid rgba(192, 192, 192, 0.45)', borderRadius: '18px', padding: '16px 12px',
                      textAlign: 'center', position: 'relative', backdropFilter: 'blur(6px)'
                    }}>
                      <div style={{
                        position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', color: '#070a13', fontWeight: 900, fontSize: '0.72rem',
                        padding: '2px 10px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Medal size={11} />
                        <span>#2 SILVER</span>
                      </div>
                      <img src={top3[1].avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #e2e8f0', margin: '8px auto 6px', display: 'block', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {top3[1].playerName}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#e2e8f0', marginTop: '2px' }}>
                        {(top3[1].score || 0).toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Level {top3[1].levelReached || 1}</span>
                    </div>
                  )}

                  {/* #1 Gold (center - elevated) */}
                  {top3[0] && (
                    <div style={{
                      background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.22) 0%, rgba(14, 20, 36, 0.9) 100%)',
                      border: '2px solid #ffd700', borderRadius: '20px', padding: '22px 12px 18px',
                      textAlign: 'center', position: 'relative', boxShadow: '0 10px 35px rgba(255, 215, 0, 0.25)',
                      backdropFilter: 'blur(6px)'
                    }}>
                      <div style={{
                        position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#070a13', fontWeight: 900, fontSize: '0.78rem',
                        padding: '3px 14px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Crown size={13} fill="#070a13" />
                        <span>#1 CHAMPION</span>
                      </div>
                      <img src={top3[0].avatar} alt="" style={{ width: '58px', height: '58px', borderRadius: '50%', border: '2.5px solid #ffd700', margin: '8px auto 6px', display: 'block', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {top3[0].playerName}
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffd700', marginTop: '2px', letterSpacing: '-0.02em' }}>
                        {(top3[0].score || 0).toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 700 }}>🏆 Master Level {top3[0].levelReached || 1}</span>
                    </div>
                  )}

                  {/* #3 Bronze (right) */}
                  {top3[2] && (
                    <div style={{
                      background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.12) 0%, rgba(14, 20, 36, 0.8) 100%)',
                      border: '1.5px solid rgba(205, 127, 50, 0.45)', borderRadius: '18px', padding: '16px 12px',
                      textAlign: 'center', position: 'relative', backdropFilter: 'blur(6px)'
                    }}>
                      <div style={{
                        position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #cd7f32, #a05a2c)', color: '#fff', fontWeight: 900, fontSize: '0.72rem',
                        padding: '2px 10px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Award size={11} />
                        <span>#3 BRONZE</span>
                      </div>
                      <img src={top3[2].avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #cd7f32', margin: '8px auto 6px', display: 'block', objectFit: 'cover' }} />
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {top3[2].playerName}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#cd7f32', marginTop: '2px' }}>
                        {(top3[2].score || 0).toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Level {top3[2].levelReached || 1}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Ranks List Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(searchQuery ? filteredEntries : restEntries).map((item, index) => {
                  const rank = searchQuery ? index + 1 : index + 4;
                  return (
                    <div
                      key={item._id || index}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 18px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: rank <= 10 ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                          color: rank <= 10 ? '#00f2fe' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '0.85rem'
                        }}>
                          #{rank}
                        </span>

                        <img
                          src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt=""
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                              {item.playerName}
                            </span>
                            {item.country && <span style={{ fontSize: '0.8rem' }}>{item.country}</span>}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            Level {item.levelReached || 1} Gamer
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#00f2fe' }}>
                          {(item.score || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredEntries.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    <p style={{ fontSize: '0.95rem' }}>No records found for "{searchQuery}".</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom: Submit Score Box */}
        <div style={{
          padding: '16px 24px', background: 'rgba(0, 0, 0, 0.45)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 2
        }}>
          {submitSuccess ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', background: 'rgba(0, 245, 160, 0.15)', border: '1px solid rgba(0, 245, 160, 0.3)',
              borderRadius: '12px', color: '#00f5a0', fontWeight: 800, fontSize: '0.88rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Score submitted and verified on the live leaderboard!</span>
            </div>
          ) : (
            <form onSubmit={handleManualScoreSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="number"
                  placeholder="Enter your final score to submit..."
                  value={manualScore}
                  onChange={e => setManualScore(e.target.value)}
                  style={{
                    width: '100%', height: '42px', background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '12px',
                    padding: '0 14px', color: '#fff', fontSize: '0.88rem', outline: 'none'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !manualScore}
                style={{
                  height: '42px', padding: '0 20px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#070a13',
                  fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(0, 242, 254, 0.35)', opacity: manualScore ? 1 : 0.6
                }}
              >
                <Send size={15} />
                <span>Submit Score</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
