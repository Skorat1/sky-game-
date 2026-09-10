import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Users, Bot, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NeonPong() {
  const canvasRef = useRef(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [mode, setMode] = useState('ai'); // 'ai' or '2p'
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);

  const stateRef = useRef({
    p1: { y: 130, height: 75, width: 10, speed: 6 },
    p2: { y: 130, height: 75, width: 10, speed: 5.5 },
    ball: { x: 250, y: 160, vx: 5, vy: 3, radius: 7 },
    particles: [],
    keys: {},
    trail: []
  });

  const resetGame = () => {
    setScore1(0);
    setScore2(0);
    setWinner(null);
    stateRef.current.ball = { x: 250, y: 160, vx: Math.random() > 0.5 ? 5 : -5, vy: (Math.random() - 0.5) * 6, radius: 7 };
    stateRef.current.p1.y = 130;
    stateRef.current.p2.y = 130;
    stateRef.current.trail = [];
    setGameStarted(true);
    sounds.playClick();
  };

  const resetBall = (scorer) => {
    stateRef.current.ball = {
      x: 250,
      y: 160,
      vx: scorer === 1 ? -5 : 5,
      vy: (Math.random() - 0.5) * 6,
      radius: 7
    };
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      stateRef.current.keys[e.code] = true;
    };
    const handleKeyUp = (e) => {
      stateRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createBounceParticles = (x, y, color) => {
    for (let i = 0; i < 10; i++) {
      stateRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color
      });
    }
  };

  useEffect(() => {
    let animId;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const state = stateRef.current;

      // Dark background
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center divider
      ctx.strokeStyle = 'rgba(184, 93, 245, 0.25)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(250, 0);
      ctx.lineTo(250, 320);
      ctx.stroke();
      ctx.setLineDash([]);

      if (gameStarted && !winner) {
        // Player 1 controls (W/S)
        if (state.keys['KeyW'] && state.p1.y > 0) state.p1.y -= state.p1.speed;
        if (state.keys['KeyS'] && state.p1.y + state.p1.height < 320) state.p1.y += state.p1.speed;

        // Player 2 controls or AI
        if (mode === '2p') {
          if (state.keys['ArrowUp'] && state.p2.y > 0) state.p2.y -= state.p2.speed;
          if (state.keys['ArrowDown'] && state.p2.y + state.p2.height < 320) state.p2.y += state.p2.speed;
        } else {
          // AI tracking
          const targetY = state.ball.y - state.p2.height / 2;
          if (state.p2.y < targetY - 4) state.p2.y += state.p2.speed;
          else if (state.p2.y > targetY + 4) state.p2.y -= state.p2.speed;
          state.p2.y = Math.max(0, Math.min(320 - state.p2.height, state.p2.y));
        }

        // Ball movement
        state.ball.x += state.ball.vx;
        state.ball.y += state.ball.vy;

        // Ball trail
        state.trail.push({ x: state.ball.x, y: state.ball.y, life: 1 });
        if (state.trail.length > 8) state.trail.shift();

        // Top/bottom wall bounce
        if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > 320) {
          state.ball.vy = -state.ball.vy;
          sounds.playLaser();
          createBounceParticles(state.ball.x, state.ball.y, '#00f2fe');
        }

        // P1 Paddle Bounce (Left: x=16)
        if (
          state.ball.x - state.ball.radius <= 26 &&
          state.ball.x + state.ball.radius >= 14 &&
          state.ball.y >= state.p1.y &&
          state.ball.y <= state.p1.y + state.p1.height
        ) {
          const deltaY = (state.ball.y - (state.p1.y + state.p1.height / 2)) / (state.p1.height / 2);
          state.ball.vx = Math.min(10, Math.abs(state.ball.vx) * 1.05);
          state.ball.vy = deltaY * 7;
          sounds.playScore();
          createBounceParticles(26, state.ball.y, '#f52d3a');
        }

        // P2 Paddle Bounce (Right: x=474)
        if (
          state.ball.x + state.ball.radius >= 474 &&
          state.ball.x - state.ball.radius <= 486 &&
          state.ball.y >= state.p2.y &&
          state.ball.y <= state.p2.y + state.p2.height
        ) {
          const deltaY = (state.ball.y - (state.p2.y + state.p2.height / 2)) / (state.p2.height / 2);
          state.ball.vx = -Math.min(10, Math.abs(state.ball.vx) * 1.05);
          state.ball.vy = deltaY * 7;
          sounds.playScore();
          createBounceParticles(474, state.ball.y, '#00f2fe');
        }

        // Scoring P1
        if (state.ball.x > 515) {
          sounds.playPowerup();
          setScore1(s => {
            const next = s + 1;
            if (next >= 5) setWinner('Player 1 Wins! 🏆');
            return next;
          });
          resetBall(1);
        }

        // Scoring P2
        if (state.ball.x < -15) {
          sounds.playExplosion();
          setScore2(s => {
            const next = s + 1;
            if (next >= 5) setWinner(mode === 'ai' ? 'AI Mainframe Wins! 🤖' : 'Player 2 Wins! 🏆');
            return next;
          });
          resetBall(2);
        }
      }

      // Draw Ball Trail
      state.trail.forEach((t, i) => {
        ctx.fillStyle = `rgba(0, 242, 254, ${i / 10})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, state.ball.radius * (i / 8), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Ball
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw P1 Paddle (Neon Red)
      ctx.shadowColor = '#f52d3a';
      ctx.fillStyle = '#f52d3a';
      ctx.beginPath();
      ctx.roundRect(16, state.p1.y, state.p1.width, state.p1.height, 4);
      ctx.fill();

      // Draw P2 Paddle (Neon Cyan)
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.roundRect(474, state.p2.y, state.p2.width, state.p2.height, 4);
      ctx.fill();

      // Draw Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) return false;

        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, winner, mode]);

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge" style={{ borderColor: '#f52d3a' }}>
          <span>P1: <strong style={{ color: '#f52d3a' }}>{score1}</strong></span>
        </div>
        <div className="game-mode-toggle">
          <button
            className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
            onClick={() => { setMode('ai'); resetGame(); }}
          >
            <Bot size={14} /> VS AI
          </button>
          <button
            className={`mode-btn ${mode === '2p' ? 'active' : ''}`}
            onClick={() => { setMode('2p'); resetGame(); }}
          >
            <Users size={14} /> 2 PLAYER
          </button>
        </div>
        <div className="stat-badge" style={{ borderColor: '#00f2fe' }}>
          <span>{mode === 'ai' ? 'AI' : 'P2'}: <strong style={{ color: '#00f2fe' }}>{score2}</strong></span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={500} height={320} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">NEON HYPER PONG</h2>
            <p>P1: W/S Keys | P2: Up/Down Keys (or Play VS AI)</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> START MATCH
            </button>
          </div>
        )}

        {winner && (
          <div className="game-overlay">
            <h2 className="glow-text">{winner}</h2>
            <p>Score: {score1} - {score2}</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> PLAY REMATCH
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mobile-dpad">
        <div className="dpad-row">
          <button
            className="dpad-btn"
            onClick={() => { stateRef.current.p1.y = Math.max(0, stateRef.current.p1.y - 35); }}
          >▲</button>
          <button
            className="dpad-btn"
            onClick={() => { stateRef.current.p1.y = Math.min(250, stateRef.current.p1.y + 35); }}
          >▼</button>
        </div>
      </div>
    </div>
  );
}
