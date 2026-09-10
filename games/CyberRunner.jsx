import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CyberRunner() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_runner_highscore') || localStorage.getItem('thop_runner_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef({
    runner: { y: 280, vy: 0, gravity: 0.7, jumpForce: -13, isGrounded: true, isSliding: false, slideTimer: 0 },
    obstacles: [],
    coins: [],
    obstacleTimer: 0,
    gameSpeed: 5,
    distance: 0,
    particles: []
  });

  const jump = () => {
    const r = stateRef.current.runner;
    if (r.isGrounded && !r.isSliding) {
      r.vy = r.jumpForce;
      r.isGrounded = false;
      sounds.playJump();
    }
  };

  const slide = () => {
    const r = stateRef.current.runner;
    if (r.isGrounded && !r.isSliding) {
      r.isSliding = true;
      r.slideTimer = 25;
      sounds.playLaser();
    }
  };

  const resetGame = () => {
    stateRef.current.runner = { y: 280, vy: 0, gravity: 0.7, jumpForce: -13, isGrounded: true, isSliding: false, slideTimer: 0 };
    stateRef.current.obstacles = [];
    stateRef.current.coins = [];
    stateRef.current.obstacleTimer = 0;
    stateRef.current.gameSpeed = 5;
    stateRef.current.distance = 0;
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
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        slide();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let animId;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const state = stateRef.current;
      const r = state.runner;

      // Dark city background
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber grid ground
      ctx.strokeStyle = '#b85df5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.lineTo(400, 320);
      ctx.stroke();

      // Moving ground grid lines
      state.distance += state.gameSpeed;
      const offset = (state.distance % 30);
      for (let x = -offset; x < 400; x += 30) {
        ctx.strokeStyle = 'rgba(184, 93, 245, 0.25)';
        ctx.beginPath();
        ctx.moveTo(x, 320);
        ctx.lineTo(x - 20, 400);
        ctx.stroke();
      }

      if (gameStarted && !gameOver) {
        // Update Runner
        if (!r.isGrounded) {
          r.vy += r.gravity;
          r.y += r.vy;
          if (r.y >= 280) {
            r.y = 280;
            r.vy = 0;
            r.isGrounded = true;
          }
        }

        if (r.isSliding) {
          r.slideTimer--;
          if (r.slideTimer <= 0) r.isSliding = false;
        }

        // Distance score
        setScore(s => {
          const ns = s + 1;
          if (ns > highScore) {
            setHighScore(ns);
            localStorage.setItem('sky_runner_highscore', ns.toString());
          }
          if (ns % 250 === 0) state.gameSpeed = Math.min(10, state.gameSpeed + 0.5);
          return ns;
        });

        // Spawn Obstacles
        state.obstacleTimer++;
        if (state.obstacleTimer > 75) {
          state.obstacleTimer = 0;
          const isHigh = Math.random() < 0.35; // Overhead laser barrier requires slide
          state.obstacles.push({
            x: 420,
            y: isHigh ? 245 : 290,
            width: isHigh ? 35 : 24,
            height: isHigh ? 20 : 30,
            isHigh,
            color: isHigh ? '#ffd200' : '#f52d3a'
          });
        }

        // Update Obstacles
        state.obstacles = state.obstacles.filter(obs => {
          obs.x -= state.gameSpeed;

          // Hitbox
          const rx = 60;
          const ry = r.isSliding ? r.y + 16 : r.y;
          const rw = 24;
          const rh = r.isSliding ? 18 : 38;

          if (
            rx < obs.x + obs.width &&
            rx + rw > obs.x &&
            ry < obs.y + obs.height &&
            ry + rh > obs.y
          ) {
            setGameOver(true);
            sounds.playGameOver();
          }

          return obs.x > -50;
        });
      }

      // Draw Obstacles
      state.obstacles.forEach(obs => {
        ctx.shadowBlur = 12;
        ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });

      // Draw Runner (Cyber Avatar)
      if (gameStarted && !gameOver) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f2fe';
        ctx.fillStyle = '#00f2fe';

        const rx = 60;
        if (r.isSliding) {
          ctx.fillRect(rx, r.y + 18, 32, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + 24, r.y + 20, 4, 4);
        } else {
          ctx.fillRect(rx, r.y, 22, 36);
          // Cyber visor
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + 12, r.y + 6, 8, 4);
        }
      }

      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver, highScore]);

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <span>Distance: <strong>{score}m</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>Record: <strong>{highScore}m</strong></span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={400} height={400} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">CYBER RUNNER</h2>
            <p>Jump: Space / Up Arrow | Slide: Down Arrow</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> RUN NOW
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">RUN TERMINATED</h2>
            <p>Distance Reached: <strong>{score}m</strong></p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> RUN AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile action buttons */}
      <div className="mobile-dpad" style={{ justifyContent: 'center', gap: '20px' }}>
        <button className="dpad-btn" style={{ width: '80px', background: '#b85df5' }} onClick={slide}>
          SLIDE ▼
        </button>
        <button className="dpad-btn" style={{ width: '80px', background: '#00f2fe', color: '#000' }} onClick={jump}>
          JUMP ▲
        </button>
      </div>
    </div>
  );
}
