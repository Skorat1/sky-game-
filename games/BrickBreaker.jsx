import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function BrickBreaker() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_brick_highscore') || localStorage.getItem('thop_brick_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelWon, setLevelWon] = useState(false);

  const stateRef = useRef({
    paddle: { x: 160, width: 80, height: 12, speed: 8 },
    ball: { x: 200, y: 350, vx: 4, vy: -4, radius: 6, stuck: true },
    bricks: [],
    particles: [],
    keys: {}
  });

  const initBricks = (lvl = 1) => {
    const rows = 4 + lvl;
    const cols = 7;
    const brickWidth = 48;
    const brickHeight = 16;
    const padding = 6;
    const offsetTop = 40;
    const offsetLeft = (400 - (cols * (brickWidth + padding) - padding)) / 2;

    const colors = ['#f52d3a', '#b85df5', '#00f2fe', '#ffd200', '#00f5a0'];
    const bricks = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          color: colors[r % colors.length],
          hp: r === 0 ? 2 : 1
        });
      }
    }
    stateRef.current.bricks = bricks;
  };

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setLevelWon(false);
    initBricks(1);
    stateRef.current.paddle.x = 160;
    stateRef.current.ball = { x: 200, y: 350, vx: 4, vy: -4, radius: 6, stuck: false };
    setGameStarted(true);
    sounds.playClick();
  };

  const nextLevel = () => {
    setLevel(l => {
      const nextLvl = l + 1;
      initBricks(nextLvl);
      return nextLvl;
    });
    setLevelWon(false);
    stateRef.current.paddle.x = 160;
    stateRef.current.ball = { x: 200, y: 350, vx: 4.5, vy: -4.5, radius: 6, stuck: false };
    sounds.playPowerup();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { stateRef.current.keys[e.code] = true; };
    const handleKeyUp = (e) => { stateRef.current.keys[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const createParticles = (x, y, color, count = 12) => {
    for (let i = 0; i < count; i++) {
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

      if (gameStarted && !gameOver && !levelWon) {
        // Paddle move
        if ((state.keys['ArrowLeft'] || state.keys['KeyA']) && state.paddle.x > 0) {
          state.paddle.x -= state.paddle.speed;
        }
        if ((state.keys['ArrowRight'] || state.keys['KeyD']) && state.paddle.x + state.paddle.width < 400) {
          state.paddle.x += state.paddle.speed;
        }

        // Ball movement
        state.ball.x += state.ball.vx;
        state.ball.y += state.ball.vy;

        // Wall collisions
        if (state.ball.x - state.ball.radius <= 0 || state.ball.x + state.ball.radius >= 400) {
          state.ball.vx = -state.ball.vx;
          sounds.playLaser();
        }
        if (state.ball.y - state.ball.radius <= 0) {
          state.ball.vy = -state.ball.vy;
          sounds.playLaser();
        }

        // Paddle Collision
        if (
          state.ball.y + state.ball.radius >= 370 &&
          state.ball.y - state.ball.radius <= 382 &&
          state.ball.x >= state.paddle.x &&
          state.ball.x <= state.paddle.x + state.paddle.width
        ) {
          const delta = (state.ball.x - (state.paddle.x + state.paddle.width / 2)) / (state.paddle.width / 2);
          state.ball.vx = delta * 6;
          state.ball.vy = -Math.abs(state.ball.vy);
          sounds.playScore();
          createParticles(state.ball.x, 370, '#00f2fe', 8);
        }

        // Bottom death
        if (state.ball.y > 410) {
          sounds.playExplosion();
          setLives(l => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameOver(true);
              sounds.playGameOver();
            } else {
              state.ball = { x: 200, y: 350, vx: 4, vy: -4, radius: 6, stuck: false };
              state.paddle.x = 160;
            }
            return nextL;
          });
        }

        // Brick collision
        for (let i = state.bricks.length - 1; i >= 0; i--) {
          const b = state.bricks[i];
          if (
            state.ball.x + state.ball.radius >= b.x &&
            state.ball.x - state.ball.radius <= b.x + b.width &&
            state.ball.y + state.ball.radius >= b.y &&
            state.ball.y - state.ball.radius <= b.y + b.height
          ) {
            state.ball.vy = -state.ball.vy;
            b.hp--;
            sounds.playScore();
            createParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 14);

            if (b.hp <= 0) {
              state.bricks.splice(i, 1);
              setScore(s => {
                const ns = s + 20;
                if (ns > highScore) {
                  setHighScore(ns);
                  localStorage.setItem('sky_brick_highscore', ns.toString());
                }
                return ns;
              });
            }

            if (state.bricks.length === 0) {
              setLevelWon(true);
              sounds.playPowerup();
            }
            break;
          }
        }
      }

      // Draw Bricks
      state.bricks.forEach(b => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();
      });

      // Draw Paddle (Neon Gradient)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2fe';
      const pGrad = ctx.createLinearGradient(state.paddle.x, 370, state.paddle.x + state.paddle.width, 370);
      pGrad.addColorStop(0, '#00f2fe');
      pGrad.addColorStop(1, '#b85df5');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(state.paddle.x, 370, state.paddle.width, state.paddle.height, 6);
      ctx.fill();

      // Draw Ball
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
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
  }, [gameStarted, gameOver, levelWon, highScore]);

  // Handle touch drag
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    stateRef.current.paddle.x = Math.max(0, Math.min(400 - stateRef.current.paddle.width, x - stateRef.current.paddle.width / 2));
  };

  const handleTouchMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    stateRef.current.paddle.x = Math.max(0, Math.min(400 - stateRef.current.paddle.width, x - stateRef.current.paddle.width / 2));
  };

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <span>Level: <strong>{level}</strong></span>
        </div>
        <div className="stat-badge">
          <span>Lives: <strong>{'❤️'.repeat(Math.max(0, lives))}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>Best: <strong>{highScore}</strong></span>
        </div>
      </div>

      <div
        className="canvas-wrapper"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <canvas ref={canvasRef} width={400} height={400} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">NEON BREAKOUT</h2>
            <p>Move mouse / fingers or use Left/Right arrows</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> START BREAKOUT
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">BALLS DEPLETED</h2>
            <p>Score: <strong>{score}</strong></p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </div>
        )}

        {levelWon && (
          <div className="game-overlay">
            <h2 className="glow-text">LEVEL {level} CLEARED! 🌟</h2>
            <button className="neon-play-btn" onClick={nextLevel}>
              NEXT LEVEL →
            </button>
          </div>
        )}
      </div>

      {/* Mobile touch paddle helper */}
      <div className="mobile-dpad" style={{ justifyContent: 'space-between', padding: '0 30px' }}>
        <button
          className="dpad-btn"
          onClick={() => { stateRef.current.paddle.x = Math.max(0, stateRef.current.paddle.x - 40); }}
        >◀</button>
        <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>Paddle Controls</span>
        <button
          className="dpad-btn"
          onClick={() => { stateRef.current.paddle.x = Math.min(320, stateRef.current.paddle.x + 40); }}
        >▶</button>
      </div>
    </div>
  );
}
