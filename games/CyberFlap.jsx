import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CyberFlap() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_flap_highscore') || localStorage.getItem('thop_flap_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef({
    bird: { y: 200, vy: 0, gravity: 0.38, jump: -6.5, radius: 12 },
    pipes: [],
    pipeTimer: 0,
    particles: [],
    stars: []
  });

  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5
      });
    }
    stateRef.current.stars = stars;
  }, []);

  const jump = () => {
    if (!gameStarted) {
      resetGame();
      return;
    }
    if (gameOver) {
      resetGame();
      return;
    }
    sounds.playJump();
    stateRef.current.bird.vy = stateRef.current.bird.jump;

    // Jump particles
    for (let i = 0; i < 6; i++) {
      stateRef.current.particles.push({
        x: 80,
        y: stateRef.current.bird.y + 10,
        vx: (Math.random() - 0.5) * 4 - 2,
        vy: Math.random() * 3 + 1,
        life: 1,
        color: '#00f2fe'
      });
    }
  };

  const resetGame = () => {
    stateRef.current.bird = { y: 200, vy: 0, gravity: 0.38, jump: -6.5, radius: 12 };
    stateRef.current.pipes = [];
    stateRef.current.pipeTimer = 0;
    stateRef.current.particles = [];
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    sounds.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        jump();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    let animId;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const state = stateRef.current;

      // Draw cyber background
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars parallax
      state.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = 400;
        ctx.fillStyle = 'rgba(184, 93, 245, 0.4)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameStarted && !gameOver) {
        // Update bird physics
        state.bird.vy += state.bird.gravity;
        state.bird.y += state.bird.vy;

        // Ground / ceiling collision
        if (state.bird.y > 385 || state.bird.y < 12) {
          setGameOver(true);
          sounds.playGameOver();
        }

        // Spawn laser gates
        state.pipeTimer++;
        if (state.pipeTimer > 90) {
          state.pipeTimer = 0;
          const gapHeight = 110;
          const topHeight = Math.random() * (220 - 60) + 60;
          state.pipes.push({
            x: 400,
            top: topHeight,
            bottom: topHeight + gapHeight,
            width: 44,
            passed: false
          });
        }

        // Update pipes
        state.pipes = state.pipes.filter(pipe => {
          pipe.x -= 2.6;

          // Check pass
          if (!pipe.passed && pipe.x + pipe.width < 80) {
            pipe.passed = true;
            sounds.playScore();
            setScore(s => {
              const newScore = s + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('sky_flap_highscore', newScore.toString());
              }
              return newScore;
            });
          }

          // Check collision
          const bx = 80;
          const by = state.bird.y;
          const br = state.bird.radius;

          if (bx + br > pipe.x && bx - br < pipe.x + pipe.width) {
            if (by - br < pipe.top || by + br > pipe.bottom) {
              setGameOver(true);
              sounds.playExplosion();
            }
          }

          return pipe.x > -60;
        });
      }

      // Draw Laser Gates
      state.pipes.forEach(pipe => {
        // Top column
        const gradTop = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradTop.addColorStop(0, '#f52d3a');
        gradTop.addColorStop(1, '#b85df5');
        ctx.fillStyle = gradTop;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f52d3a';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

        // Bottom column
        ctx.fillRect(pipe.x, pipe.bottom, pipe.width, 400 - pipe.bottom);

        // Neon emitter cap
        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.fillRect(pipe.x - 3, pipe.top - 10, pipe.width + 6, 10);
        ctx.fillRect(pipe.x - 3, pipe.bottom, pipe.width + 6, 10);
      });

      // Draw Cyber Drone
      const bx = 80;
      const by = state.bird.y;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = '#00f2fe';

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, state.bird.vy * 0.08)));

      // Drone orb
      ctx.beginPath();
      ctx.arc(0, 0, state.bird.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cyber eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Wing glow
      ctx.strokeStyle = '#ffd200';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(2, 6);
      ctx.stroke();

      ctx.restore();

      // Draw Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) return false;

        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver, highScore]);

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <span>Gates Passed: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>Best Score: <strong>{highScore}</strong></span>
        </div>
      </div>

      <div className="canvas-wrapper" onClick={jump}>
        <canvas ref={canvasRef} width={400} height={400} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">CYBER FLAP</h2>
            <p>Click / Tap or Press Space to Thrust Upwards</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> START FLIGHT
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">DRONE CRASHED</h2>
            <p>Score: <strong>{score}</strong></p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> TRY AGAIN
            </button>
          </div>
        )}
      </div>
      <p className="game-tip-text">💡 Tap anywhere on the game canvas to jump</p>
    </div>
  );
}
