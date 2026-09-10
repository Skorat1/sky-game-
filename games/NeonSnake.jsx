import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NeonSnake() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_snake_highscore') || localStorage.getItem('thop_snake_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  // Game state refs
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5, type: 'normal' },
    specialFood: null,
    specialFoodTimer: 0,
    particles: [],
    gridSize: 20,
    tileCount: 20,
    speed: 100,
    lastTime: 0
  });

  const spawnFood = useCallback(() => {
    const tileCount = stateRef.current.tileCount;
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: 'normal'
      };
      const hit = stateRef.current.snake.some(s => s.x === newFood.x && s.y === newFood.y);
      if (!hit) break;
    }
    stateRef.current.food = newFood;

    // Chance for golden energy core
    if (Math.random() < 0.25 && !stateRef.current.specialFood) {
      stateRef.current.specialFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: 'golden',
        timer: 150
      };
    }
  }, []);

  const createParticles = (x, y, color, count = 12) => {
    for (let i = 0; i < count; i++) {
      stateRef.current.particles.push({
        x: x * 20 + 10,
        y: y * 20 + 10,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color: color || '#f52d3a',
        size: Math.random() * 4 + 2
      });
    }
  };

  const resetGame = () => {
    stateRef.current.snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    stateRef.current.dir = { x: 0, y: -1 };
    stateRef.current.nextDir = { x: 0, y: -1 };
    stateRef.current.particles = [];
    stateRef.current.specialFood = null;
    stateRef.current.speed = 100;
    setScore(0);
    setMultiplier(1);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    spawnFood();
    sounds.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { dir, nextDir } = stateRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code) && dir.y !== 1) {
        stateRef.current.nextDir = { x: 0, y: -1 };
        e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && dir.y !== -1) {
        stateRef.current.nextDir = { x: 0, y: 1 };
        e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && dir.x !== 1) {
        stateRef.current.nextDir = { x: -1, y: 0 };
        e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && dir.x !== -1) {
        stateRef.current.nextDir = { x: 1, y: 0 };
        e.preventDefault();
      } else if (e.code === 'Space') {
        setIsPaused(p => !p);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let animId;
    let lastRender = 0;

    const gameLoop = (timestamp) => {
      animId = requestAnimationFrame(gameLoop);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const state = stateRef.current;

      // Draw background
      ctx.fillStyle = '#050a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines for neon cyber feel
      ctx.strokeStyle = 'rgba(184, 93, 245, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 400; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 400);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(400, i);
        ctx.stroke();
      }

      // Update game physics if active
      if (gameStarted && !gameOver && !isPaused) {
        if (timestamp - lastRender > state.speed) {
          lastRender = timestamp;
          state.dir = state.nextDir;

          const head = { ...state.snake[0] };
          head.x += state.dir.x;
          head.y += state.dir.y;

          // Wall collision
          if (head.x < 0 || head.x >= state.tileCount || head.y < 0 || head.y >= state.tileCount) {
            setGameOver(true);
            sounds.playGameOver();
            createParticles(state.snake[0].x, state.snake[0].y, '#f52d3a', 30);
            return;
          }

          // Self collision
          if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            setGameOver(true);
            sounds.playGameOver();
            createParticles(head.x, head.y, '#f52d3a', 30);
            return;
          }

          state.snake.unshift(head);

          // Food collision
          if (head.x === state.food.x && head.y === state.food.y) {
            sounds.playScore();
            createParticles(head.x, head.y, '#00f2fe', 16);
            setScore(s => {
              const newScore = s + 10 * multiplier;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('sky_snake_highscore', newScore.toString());
              }
              return newScore;
            });
            // Speed up slightly as snake grows
            state.speed = Math.max(60, 100 - Math.floor(state.snake.length / 2) * 2);
            spawnFood();
          } else if (state.specialFood && head.x === state.specialFood.x && head.y === state.specialFood.y) {
            sounds.playPowerup();
            createParticles(head.x, head.y, '#ffd200', 25);
            setScore(s => {
              const newScore = s + 50 * multiplier;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('sky_snake_highscore', newScore.toString());
              }
              return newScore;
            });
            setMultiplier(m => m + 1);
            state.specialFood = null;
          } else {
            state.snake.pop();
          }

          // Update special food timer
          if (state.specialFood) {
            state.specialFood.timer--;
            if (state.specialFood.timer <= 0) {
              state.specialFood = null;
            }
          }
        }
      }

      // Draw Normal Food (Neon Cyan Core)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(state.food.x * 20 + 10, state.food.y * 20 + 10, 7, 0, Math.PI * 2);
      ctx.fill();

      // Draw Special Food (Golden Pulsing Core)
      if (state.specialFood) {
        const pulse = Math.sin(Date.now() / 100) * 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffd200';
        ctx.fillStyle = '#ffd200';
        ctx.beginPath();
        ctx.arc(state.specialFood.x * 20 + 10, state.specialFood.y * 20 + 10, 8 + pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Snake Body
      state.snake.forEach((segment, idx) => {
        const isHead = idx === 0;
        if (isHead) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#f52d3a';
          ctx.fillStyle = '#f52d3a';
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#b85df5';
          const gradient = ctx.createLinearGradient(
            segment.x * 20, segment.y * 20,
            segment.x * 20 + 20, segment.y * 20 + 20
          );
          gradient.addColorStop(0, '#b85df5');
          gradient.addColorStop(1, '#f52d3a');
          ctx.fillStyle = gradient;
        }

        ctx.beginPath();
        ctx.roundRect(segment.x * 20 + 1, segment.y * 20 + 1, 18, 18, 5);
        ctx.fill();

        // Eyes on head
        if (isHead) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(segment.x * 20 + 6, segment.y * 20 + 6, 2, 0, Math.PI * 2);
          ctx.arc(segment.x * 20 + 14, segment.y * 20 + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update & Draw Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) return false;

        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameStarted, gameOver, isPaused, multiplier, highScore, spawnFood]);

  return (
    <div className="neon-game-container">
      <div className="game-stats-header">
        <div className="stat-badge">
          <Sparkles size={16} className="text-cyan" />
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>High: <strong>{highScore}</strong></span>
        </div>
        {multiplier > 1 && (
          <div className="stat-badge glow-badge">
            <span>{multiplier}x BOOST</span>
          </div>
        )}
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={400} height={400} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">CYBER SNAKE 2077</h2>
            <p>Use Arrow Keys or WASD to navigate</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">SYSTEM OVERLOAD</h2>
            <p>Final Score: <strong>{score}</strong></p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> PLAY AGAIN
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text">PAUSED</h2>
            <p>Press Space or click button to resume</p>
            <button className="neon-play-btn" onClick={() => setIsPaused(false)}>
              RESUME
            </button>
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="mobile-dpad">
        <button
          className="dpad-btn up"
          onClick={() => {
            if (stateRef.current.dir.y !== 1) stateRef.current.nextDir = { x: 0, y: -1 };
          }}
        >▲</button>
        <div className="dpad-row">
          <button
            className="dpad-btn left"
            onClick={() => {
              if (stateRef.current.dir.x !== 1) stateRef.current.nextDir = { x: -1, y: 0 };
            }}
          >◀</button>
          <button
            className="dpad-btn right"
            onClick={() => {
              if (stateRef.current.dir.x !== -1) stateRef.current.nextDir = { x: 1, y: 0 };
            }}
          >▶</button>
        </div>
        <button
          className="dpad-btn down"
          onClick={() => {
            if (stateRef.current.dir.y !== -1) stateRef.current.nextDir = { x: 0, y: 1 };
          }}
        >▼</button>
      </div>
    </div>
  );
}
