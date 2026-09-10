import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Zap, Shield, Flame, Crosshair, Sparkles, Cpu, Award, Rocket } from 'lucide-react';
import { sounds } from '../utils/audio';

const ICONS = [
  { name: 'zap', Icon: Zap, color: '#ffd200' },
  { name: 'shield', Icon: Shield, color: '#00f5a0' },
  { name: 'flame', Icon: Flame, color: '#f52d3a' },
  { name: 'crosshair', Icon: Crosshair, color: '#00f2fe' },
  { name: 'sparkles', Icon: Sparkles, color: '#b85df5' },
  { name: 'cpu', Icon: Cpu, color: '#ff007f' },
  { name: 'award', Icon: Award, color: '#4facfe' },
  { name: 'rocket', Icon: Rocket, color: '#ff758c' }
];

export default function MemoryMatrix() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_memory_highscore') || localStorage.getItem('thop_memory_highscore') || '0', 10);
  });
  const [gameWon, setGameWon] = useState(false);

  const initGame = () => {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ id: index, ...item }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameWon(false);
    sounds.playClick();
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    sounds.playLaser();
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].name === cards[second].name) {
        // Matched
        setTimeout(() => {
          sounds.playScore();
          setMatched(prev => {
            const next = [...prev, first, second];
            if (next.length === cards.length) {
              setGameWon(true);
              sounds.playPowerup();
            }
            return next;
          });
          setScore(s => {
            const ns = s + 100;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('sky_memory_highscore', ns.toString());
            }
            return ns;
          });
          setFlipped([]);
        }, 400);
      } else {
        // Not matched
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <span>Moves: <strong>{moves}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>Best: <strong>{highScore}</strong></span>
        </div>
        <button className="neon-icon-btn" onClick={initGame} title="Restart">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="memory-grid">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);
          const IconComp = card.Icon;

          return (
            <div
              key={card.id}
              className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front">
                  <span className="cyber-glyph">❖</span>
                </div>
                <div
                  className="memory-card-back"
                  style={{ borderColor: card.color, boxShadow: `0 0 14px ${card.color}55` }}
                >
                  <IconComp size={28} color={card.color} />
                </div>
              </div>
            </div>
          );
        })}

        {gameWon && (
          <div className="game-overlay">
            <h2 className="glow-text">🎉 MATRIX SYNCHRONIZED!</h2>
            <p>Solved in <strong>{moves}</strong> moves with <strong>{score}</strong> points!</p>
            <button className="neon-play-btn" onClick={initGame}>
              <RotateCcw size={20} /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
