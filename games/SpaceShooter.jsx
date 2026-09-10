import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Shield, Zap } from 'lucide-react';
import { sounds } from '../frontend/src/utils/audio';

export default function SpaceShooter() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('sky_space_highscore') || localStorage.getItem('thop_space_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef({
    player: { x: 200, y: 340, width: 28, height: 32, speed: 6 },
    bullets: [],
    enemies: [],
    stars: [],
    particles: [],
    powerups: [],
    keys: {},
    lastShot: 0,
    tripleShot: false,
    tripleShotTimer: 0,
    shield: false,
    shieldTimer: 0,
    enemySpawnTimer: 0,
    enemySpawnInterval: 60
  });

  // Initialize starfield
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.8 + 0.2
      });
    }
    stateRef.current.stars = stars;
  }, []);

  const resetGame = () => {
    stateRef.current.player = { x: 200, y: 340, width: 28, height: 32, speed: 6 };
    stateRef.current.bullets = [];
    stateRef.current.enemies = [];
    stateRef.current.particles = [];
    stateRef.current.powerups = [];
    stateRef.current.tripleShot = false;
    stateRef.current.tripleShotTimer = 0;
    stateRef.current.shield = false;
    stateRef.current.shieldTimer = 0;
    stateRef.current.enemySpawnTimer = 0;
    stateRef.current.enemySpawnInterval = 60;
    setScore(0);
    setLives(3);
    setWave(1);
    setGameOver(false);
    setGameStarted(true);
    sounds.playClick();
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

  const createExplosion = (x, y, color, count = 16) => {
    for (let i = 0; i < count; i++) {
      stateRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color: color || '#f52d3a',
        size: Math.random() * 3 + 1.5
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

      // Dark space background
      ctx.fillStyle = '#02050e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw & update Starfield
      state.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > 400) {
          star.y = 0;
          star.x = Math.random() * 400;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameStarted && !gameOver) {
        // Player movement
        if ((state.keys['ArrowLeft'] || state.keys['KeyA']) && state.player.x > 20) {
          state.player.x -= state.player.speed;
        }
        if ((state.keys['ArrowRight'] || state.keys['KeyD']) && state.player.x < 380) {
          state.player.x += state.player.speed;
        }

        // Shooting
        const now = Date.now();
        if ((state.keys['Space'] || state.keys['KeyW'] || state.keys['ArrowUp']) && now - state.lastShot > 160) {
          state.lastShot = now;
          sounds.playLaser();
          if (state.tripleShot) {
            state.bullets.push(
              { x: state.player.x, y: state.player.y - 15, vx: 0, vy: -9 },
              { x: state.player.x - 10, y: state.player.y - 10, vx: -2, vy: -8 },
              { x: state.player.x + 10, y: state.player.y - 10, vx: 2, vy: -8 }
            );
          } else {
            state.bullets.push({ x: state.player.x, y: state.player.y - 15, vx: 0, vy: -9 });
          }
        }

        // Powerup timers
        if (state.tripleShot) {
          state.tripleShotTimer--;
          if (state.tripleShotTimer <= 0) state.tripleShot = false;
        }
        if (state.shield) {
          state.shieldTimer--;
          if (state.shieldTimer <= 0) state.shield = false;
        }

        // Spawn enemies
        state.enemySpawnTimer++;
        if (state.enemySpawnTimer >= state.enemySpawnInterval) {
          state.enemySpawnTimer = 0;
          const enemyType = Math.random() > 0.75 ? 'heavy' : 'drone';
          state.enemies.push({
            x: Math.random() * 340 + 30,
            y: -20,
            type: enemyType,
            width: enemyType === 'heavy' ? 36 : 24,
            height: enemyType === 'heavy' ? 30 : 20,
            speed: enemyType === 'heavy' ? 1.5 : 2.5 + Math.random() * 1.5,
            hp: enemyType === 'heavy' ? 3 : 1,
            color: enemyType === 'heavy' ? '#ff0844' : '#b85df5'
          });
        }

        // Update Bullets
        state.bullets = state.bullets.filter(b => {
          b.x += b.vx;
          b.y += b.vy;
          return b.y > -20 && b.x > 0 && b.x < 400;
        });

        // Update Enemies
        state.enemies = state.enemies.filter(enemy => {
          enemy.y += enemy.speed;

          // Check collision with player
          const distToPlayer = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
          if (distToPlayer < 24) {
            createExplosion(enemy.x, enemy.y, enemy.color, 20);
            if (state.shield) {
              state.shield = false;
              sounds.playPowerup();
            } else {
              sounds.playExplosion();
              setLives(l => {
                const nextLives = l - 1;
                if (nextLives <= 0) {
                  setGameOver(true);
                  sounds.playGameOver();
                }
                return nextLives;
              });
            }
            return false;
          }

          // Check collision with bullets
          for (let i = state.bullets.length - 1; i >= 0; i--) {
            const b = state.bullets[i];
            const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
            if (dist < 20) {
              state.bullets.splice(i, 1);
              enemy.hp--;
              createExplosion(b.x, b.y, '#00f2fe', 6);
              if (enemy.hp <= 0) {
                sounds.playExplosion();
                createExplosion(enemy.x, enemy.y, enemy.color, 18);

                // Chance to drop powerup
                if (Math.random() < 0.2) {
                  state.powerups.push({
                    x: enemy.x,
                    y: enemy.y,
                    type: Math.random() > 0.5 ? 'triple' : 'shield',
                    vy: 2
                  });
                }

                setScore(s => {
                  const gained = enemy.type === 'heavy' ? 50 : 20;
                  const newScore = s + gained;
                  if (newScore > highScore) {
                    setHighScore(newScore);
                    localStorage.setItem('sky_space_highscore', newScore.toString());
                  }
                  if (newScore > 500 && state.enemySpawnInterval > 30) {
                    state.enemySpawnInterval = 40;
                    setWave(2);
                  }
                  if (newScore > 1200 && state.enemySpawnInterval > 20) {
                    state.enemySpawnInterval = 25;
                    setWave(3);
                  }
                  return newScore;
                });
                return false;
              }
            }
          }

          return enemy.y < 420;
        });

        // Update Powerups
        state.powerups = state.powerups.filter(pow => {
          pow.y += pow.vy;
          const dist = Math.hypot(pow.x - state.player.x, pow.y - state.player.y);
          if (dist < 24) {
            sounds.playPowerup();
            if (pow.type === 'triple') {
              state.tripleShot = true;
              state.tripleShotTimer = 350;
            } else {
              state.shield = true;
              state.shieldTimer = 300;
            }
            return false;
          }
          return pow.y < 420;
        });
      }

      // Draw Bullets (Glowing Neon Cyan)
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f2fe';
      ctx.fillStyle = '#00f2fe';
      state.bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 8, 4, 12);
      });

      // Draw Powerups
      state.powerups.forEach(pow => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = pow.type === 'triple' ? '#ffd200' : '#00f5a0';
        ctx.fillStyle = pow.type === 'triple' ? '#ffd200' : '#00f5a0';
        ctx.beginPath();
        ctx.arc(pow.x, pow.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Enemies
      state.enemies.forEach(enemy => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = enemy.color;
        ctx.fillStyle = enemy.color;

        ctx.beginPath();
        if (enemy.type === 'heavy') {
          // Heavy Hexagonal alien ship
          ctx.moveTo(enemy.x, enemy.y + 16);
          ctx.lineTo(enemy.x - 18, enemy.y - 10);
          ctx.lineTo(enemy.x, enemy.y - 16);
          ctx.lineTo(enemy.x + 18, enemy.y - 10);
        } else {
          // Fast drone triangle
          ctx.moveTo(enemy.x, enemy.y + 12);
          ctx.lineTo(enemy.x - 12, enemy.y - 12);
          ctx.lineTo(enemy.x, enemy.y - 6);
          ctx.lineTo(enemy.x + 12, enemy.y - 12);
        }
        ctx.closePath();
        ctx.fill();
      });

      // Draw Player Ship
      if (gameStarted && !gameOver) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#00f2fe';

        // Ship body
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.moveTo(state.player.x, state.player.y - 18);
        ctx.lineTo(state.player.x - 14, state.player.y + 14);
        ctx.lineTo(state.player.x, state.player.y + 8);
        ctx.lineTo(state.player.x + 14, state.player.y + 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Engine flame
        ctx.shadowColor = '#f52d3a';
        ctx.fillStyle = '#f52d3a';
        ctx.beginPath();
        ctx.moveTo(state.player.x - 6, state.player.y + 10);
        ctx.lineTo(state.player.x, state.player.y + 18 + Math.random() * 6);
        ctx.lineTo(state.player.x + 6, state.player.y + 10);
        ctx.closePath();
        ctx.fill();

        // Shield Bubble
        if (state.shield) {
          ctx.shadowColor = '#00f5a0';
          ctx.strokeStyle = '#00f5a0';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(state.player.x, state.player.y, 22, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

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
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
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
          <span>Score: <strong>{score}</strong></span>
        </div>
        <div className="stat-badge">
          <span>Wave: <strong>{wave}</strong></span>
        </div>
        <div className="stat-badge">
          <span>Lives: <strong>{'❤️'.repeat(Math.max(0, lives))}</strong></span>
        </div>
        <div className="stat-badge">
          <Trophy size={16} className="text-yellow" />
          <span>High: <strong>{highScore}</strong></span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={400} height={400} className="game-canvas" />

        {!gameStarted && (
          <div className="game-overlay">
            <h2 className="glow-text">GALAXY VANGUARD</h2>
            <p>Move: Left/Right Arrows or A/D | Shoot: Space or W</p>
            <button className="neon-play-btn" onClick={resetGame}>
              <Play size={20} /> LAUNCH MISSION
            </button>
          </div>
        )}

        {gameOver && (
          <div className="game-overlay">
            <h2 className="glow-text-red">MISSION FAILED</h2>
            <p>Final Score: <strong>{score}</strong></p>
            <button className="neon-play-btn" onClick={resetGame}>
              <RotateCcw size={20} /> RETRY MISSION
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="mobile-dpad" style={{ justifyContent: 'space-between', padding: '0 20px' }}>
        <button
          className="dpad-btn"
          onTouchStart={() => { stateRef.current.keys['ArrowLeft'] = true; }}
          onTouchEnd={() => { stateRef.current.keys['ArrowLeft'] = false; }}
          onClick={() => { stateRef.current.player.x = Math.max(20, stateRef.current.player.x - 30); }}
        >◀</button>
        <button
          className="dpad-btn"
          style={{ width: '90px', background: 'linear-gradient(135deg, #f52d3a, #b85df5)' }}
          onTouchStart={() => { stateRef.current.keys['Space'] = true; }}
          onTouchEnd={() => { stateRef.current.keys['Space'] = false; }}
          onClick={() => {
            sounds.playLaser();
            stateRef.current.bullets.push({ x: stateRef.current.player.x, y: stateRef.current.player.y - 15, vx: 0, vy: -9 });
          }}
        >🔥 FIRE</button>
        <button
          className="dpad-btn"
          onTouchStart={() => { stateRef.current.keys['ArrowRight'] = true; }}
          onTouchEnd={() => { stateRef.current.keys['ArrowRight'] = false; }}
          onClick={() => { stateRef.current.player.x = Math.min(380, stateRef.current.player.x + 30); }}
        >▶</button>
      </div>
    </div>
  );
}
