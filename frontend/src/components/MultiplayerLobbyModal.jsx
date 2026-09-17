import React, { useState, useEffect } from 'react';
import { X, Users, Swords, Play, Copy, Check, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { socket } from '../utils/socket';
import { sounds } from '../utils/audio';

export default function MultiplayerLobbyModal({ isOpen, onClose, user, onStartMatch }) {
  const [mode, setMode] = useState('menu'); // menu | create | join | matchmaking | room
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const playerName = user?.name || user?.username || 'Gamer_' + Math.floor(Math.random() * 900 + 100);
  const avatar = user?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80';

  useEffect(() => {
    if (!socket) return;

    // Sockets Listeners
    socket.on('multiplayer:room_created', (room) => {
      setCurrentRoom(room);
      setRoomCode(room.code);
      setMode('room');
      sounds.playPowerup();
    });

    socket.on('multiplayer:player_joined', ({ room }) => {
      setCurrentRoom(room);
      setMode('room');
      sounds.playPowerup();
    });

    socket.on('multiplayer:match_found', (room) => {
      setCurrentRoom(room);
      setMode('room');
      sounds.playPowerup();
    });

    socket.on('multiplayer:matchmaking_waiting', () => {
      setMode('matchmaking');
    });

    socket.on('multiplayer:error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    });

    return () => {
      socket.off('multiplayer:room_created');
      socket.off('multiplayer:player_joined');
      socket.off('multiplayer:match_found');
      socket.off('multiplayer:matchmaking_waiting');
      socket.off('multiplayer:error');
    };
  }, []);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    sounds.playClick();
    socket.emit('multiplayer:create_room', { playerName, avatar });
  };

  const handleJoinRoom = () => {
    if (!joinInput.trim()) return;
    sounds.playClick();
    socket.emit('multiplayer:join_room', { roomCode: joinInput.trim(), playerName, avatar });
  };

  const handleQuickMatch = () => {
    sounds.playClick();
    socket.emit('multiplayer:find_match', { playerName, avatar });
  };

  const handleCancelMatch = () => {
    sounds.playClick();
    socket.emit('multiplayer:cancel_matchmaking');
    setMode('menu');
  };

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sky-modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7, 10, 19, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="sky-multiplayer-modal" onClick={e => e.stopPropagation()} style={{
        background: '#0e1424', border: '1px solid rgba(0, 245, 160, 0.3)', borderRadius: '24px',
        width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 245, 160, 0.15)', overflow: 'hidden', color: '#fff'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, rgba(0, 245, 160, 0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f5a0, #00d2ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#070a13'
            }}>
              <Swords size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Real-Time 1v1 Arena</h2>
              <span style={{ fontSize: '0.8rem', color: '#00f5a0', fontWeight: 600 }}>MULTIPLAYER BATTLE ROOM</span>
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

        {error && (
          <div style={{ padding: '10px 24px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {mode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={handleQuickMatch}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #00f5a0, #00d2ff)', color: '#070a13',
                  fontWeight: 900, fontSize: '1rem', boxShadow: '0 8px 24px rgba(0, 245, 160, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Radio size={24} className="pulse-animation" />
                  <div style={{ textAlign: 'left' }}>
                    <div>Instant Matchmaking</div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>Quick play vs random online gamer</span>
                  </div>
                </div>
                <span>1v1 PLAY ▶</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={handleCreateRoom}
                  style={{
                    padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)', color: '#fff', cursor: 'pointer',
                    fontWeight: 800, fontSize: '0.9rem', textAlign: 'center'
                  }}
                >
                  <Users size={22} style={{ margin: '0 auto 8px', color: '#00f2fe' }} />
                  <div>Create Room</div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Generate 6-digit code</span>
                </button>

                <button
                  onClick={() => setMode('join')}
                  style={{
                    padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.04)', color: '#fff', cursor: 'pointer',
                    fontWeight: 800, fontSize: '0.9rem', textAlign: 'center'
                  }}
                >
                  <Swords size={22} style={{ margin: '0 auto 8px', color: '#f52d7e' }} />
                  <div>Join with Code</div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Enter friend's code</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0' }}>Enter 6-Digit Room Code:</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. A9B4C2"
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1, padding: '14px', background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(0, 245, 160, 0.4)', borderRadius: '12px',
                    color: '#fff', fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', letterSpacing: '4px'
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  style={{
                    padding: '0 24px', background: 'linear-gradient(135deg, #00f5a0, #00d2ff)',
                    color: '#070a13', fontWeight: 900, border: 'none', borderRadius: '12px', cursor: 'pointer'
                  }}
                >
                  JOIN
                </button>
              </div>
              <button onClick={() => setMode('menu')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                ← Back to Menu
              </button>
            </div>
          )}

          {mode === 'matchmaking' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'rgba(0, 245, 160, 0.1)', border: '2px solid #00f5a0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Radio size={32} color="#00f5a0" className="spin-animation" />
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 6px 0' }}>Searching for 1v1 Opponent...</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>Connecting to live global matchmaking pool</p>
              <button
                onClick={handleCancelMatch}
                style={{
                  padding: '10px 24px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                  border: '1px solid #ef4444', borderRadius: '12px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Cancel Search
              </button>
            </div>
          )}

          {mode === 'room' && currentRoom && (
            <div>
              {/* Room Code Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: 'rgba(0, 245, 160, 0.08)', borderRadius: '14px',
                border: '1px solid rgba(0, 245, 160, 0.3)', marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ROOM CODE</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00f5a0', letterSpacing: '2px' }}>{currentRoom.code}</div>
                </div>
                <button
                  onClick={handleCopyCode}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', background: 'rgba(255, 255, 255, 0.08)', border: 'none',
                    borderRadius: '8px', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} color="#00f5a0" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* 2 Players Slot Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {/* Player 1 */}
                <div style={{
                  padding: '16px', borderRadius: '14px', textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 242, 254, 0.3)'
                }}>
                  <img src={currentRoom.players[0]?.avatar || avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{currentRoom.players[0]?.name || 'Player 1'}</div>
                  <span style={{ fontSize: '0.72rem', color: '#00f2fe', fontWeight: 700 }}>👑 HOST (READY)</span>
                </div>

                {/* Player 2 */}
                <div style={{
                  padding: '16px', borderRadius: '14px', textAlign: 'center',
                  background: currentRoom.players[1] ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                  border: currentRoom.players[1] ? '1px solid rgba(245, 45, 126, 0.3)' : '1px dashed rgba(255, 255, 255, 0.15)'
                }}>
                  {currentRoom.players[1] ? (
                    <>
                      <img src={currentRoom.players[1].avatar} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{currentRoom.players[1].name}</div>
                      <span style={{ fontSize: '0.72rem', color: '#00f5a0', fontWeight: 700 }}>⚡ OPPONENT (READY)</span>
                    </>
                  ) : (
                    <div style={{ padding: '8px 0', color: '#64748b' }}>
                      <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.85rem' }}>Waiting for friend...</div>
                      <span style={{ fontSize: '0.72rem' }}>Share code to connect</span>
                    </div>
                  )}
                </div>
              </div>

              {currentRoom.players.length === 2 && (
                <button
                  onClick={() => {
                    sounds.playPowerup();
                    if (onStartMatch) onStartMatch(currentRoom);
                    onClose();
                  }}
                  style={{
                    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #00f5a0, #00d2ff)',
                    color: '#070a13', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '1rem',
                    cursor: 'pointer', boxShadow: '0 8px 24px rgba(0, 245, 160, 0.3)'
                  }}
                >
                  ⚔️ START 1v1 BATTLE NOW!
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
