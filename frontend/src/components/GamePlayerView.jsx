import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Gamepad2,
  Flame,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Smartphone,
  Monitor,
  Tv,
  Square,
  Users,
  Star,
  Info,
  Layers,
  Moon,
  Sun,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import GameCard from './GameCard';

// Auto-detect best aspect ratio and dimensions from embed code or game metadata
function parseEmbedDimensions(rawEmbed) {
  if (!rawEmbed) return { aspectRatio: '16 / 9', maxWidth: '1060px', height: 'auto' };
  
  const widthMatch = rawEmbed.match(/width=["']?(\d+)/i);
  const heightMatch = rawEmbed.match(/height=["']?(\d+)/i);
  
  if (widthMatch && heightMatch) {
    const w = parseInt(widthMatch[1], 10);
    const h = parseInt(heightMatch[1], 10);
    if (w > 0 && h > 0) {
      return {
        aspectRatio: `${w} / ${h}`,
        maxWidth: `${w}px`,
        height: `${h}px`
      };
    }
  }
  
  if (heightMatch && !widthMatch) {
    const h = parseInt(heightMatch[1], 10);
    return {
      aspectRatio: '16 / 9',
      maxWidth: `${Math.round(h * (16 / 9))}px`,
      height: `${h}px`
    };
  }

  return { aspectRatio: '16 / 9', maxWidth: '100%', height: 'auto' };
}

function detectInitialRatio(g) {
  if (!g) return 'landscape';
  const text = `${g.title || ''} ${g.category || ''} ${(g.tags || []).join(' ')} ${g.description || ''}`.toLowerCase();
  if (
    text.includes('portrait') ||
    text.includes('vertical') ||
    text.includes('phone')
  ) {
    return 'portrait';
  }
  return 'landscape';
}

export default function GamePlayerView({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  allGames = [],
  onSelectRelatedGame,
  onSelectCategory
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isLightsOff, setIsLightsOff] = useState(false);
  const [likes, setLikes] = useState(() => Math.floor(Math.random() * 800) + 1240);
  const [dislikes, setDislikes] = useState(() => Math.floor(Math.random() * 30) + 12);
  const [userVote, setUserVote] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [useBuiltInEngine, setUseBuiltInEngine] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(() => detectInitialRatio(game));
  const [iframeKey, setIframeKey] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(`sky_hs_${game?.id}`) || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameMuted, setGameMuted] = useState(false);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gameStateRef = useRef(null);
  const screenWrapperRef = useRef(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset states on game change
  useEffect(() => {
    setUserVote(null);
    setUserRating(0);
    setCopiedLink(false);
    setGameOver(false);
    setScore(0);
    setIframeKey(k => k + 1);
    setAspectRatio(detectInitialRatio(game));
    const hasUrl = Boolean(game?.gameUrl && game.gameUrl.trim().length > 5);
    setUseBuiltInEngine(!hasUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [game?.id, game?.gameUrl]);

  // Handle ESC key to exit fullscreen / lights off / theater
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        } else if (isLightsOff) {
          setIsLightsOff(false);
        } else if (isTheaterMode) {
          setIsTheaterMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, isLightsOff, isTheaterMode]);

  // --------------------------------------------------------------------------
  // BUILT-IN PLAYABLE HTML5 ARCADE ENGINE (Snake / Worms / Asteroids)
  // --------------------------------------------------------------------------
  const initArcadeEngine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const titleLower = (game?.title || '').toLowerCase();
    const isWormOrSnake = titleLower.includes('snack') || titleLower.includes('worm') || titleLower.includes('snake') || game?.category === 'arcade';

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    if (isWormOrSnake) {
      const gridSize = 20;
      const cols = width / gridSize;
      const rows = height / gridSize;

      let snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      let dir = { x: 1, y: 0 };
      let nextDir = { x: 1, y: 0 };
      let food = {
        x: Math.floor(Math.random() * (cols - 4)) + 2,
        y: Math.floor(Math.random() * (rows - 4)) + 2,
        color: '#00f2fe'
      };
      let foodGlow = 0;
      let currentScore = 0;
      let isDead = false;
      let lastTick = 0;
      const speedMs = 90;

      const handleKey = (e) => {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          if (dir.y === 0) nextDir = { x: 0, y: -1 };
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          if (dir.y === 0) nextDir = { x: 0, y: 1 };
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          if (dir.x === 0) nextDir = { x: -1, y: 0 };
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          if (dir.x === 0) nextDir = { x: 1, y: 0 };
        }
      };

      window.addEventListener('keydown', handleKey);

      const loop = (timestamp) => {
        if (!lastTick) lastTick = timestamp;

        if (timestamp - lastTick > speedMs && !isDead) {
          lastTick = timestamp;
          dir = nextDir;
          const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

          if (head.x < 0) head.x = cols - 1;
          if (head.x >= cols) head.x = 0;
          if (head.y < 0) head.y = rows - 1;
          if (head.y >= rows) head.y = 0;

          for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
              isDead = true;
              setGameOver(true);
              if (!gameMuted) sounds.playClick();
              break;
            }
          }

          if (!isDead) {
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
              currentScore += 100;
              setScore(currentScore);
              if (!gameMuted) sounds.playScore();
              food = {
                x: Math.floor(Math.random() * (cols - 4)) + 2,
                y: Math.floor(Math.random() * (rows - 4)) + 2,
                color: ['#00f2fe', '#f52d7e', '#ffb300', '#00f5a0'][Math.floor(Math.random() * 4)]
              };
            } else {
              snake.pop();
            }
          }
        }

        ctx.fillStyle = '#0b0216';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(184, 93, 245, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        foodGlow += 0.08;
        const glowRad = 8 + Math.sin(foodGlow) * 2;
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, glowRad, 0, Math.PI * 2);
        ctx.fill();

        snake.forEach((seg, index) => {
          ctx.shadowBlur = index === 0 ? 15 : 6;
          ctx.shadowColor = index === 0 ? '#ff007f' : '#b85df5';
          ctx.fillStyle = index === 0 ? '#ff2a8d' : `hsl(${280 + index * 4}, 90%, 65%)`;
          ctx.beginPath();
          ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
          ctx.fill();
        });

        ctx.shadowBlur = 0;

        if (!isDead) {
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animationFrameRef.current = requestAnimationFrame(loop);

      gameStateRef.current = {
        cleanup: () => {
          window.removeEventListener('keydown', handleKey);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        },
        restart: () => {
          window.removeEventListener('keydown', handleKey);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          setGameOver(false);
          setScore(0);
          initArcadeEngine();
        }
      };
    } else {
      // Space Arcade Engine
      let player = { x: width / 2, y: height - 50, speed: 7 };
      let bullets = [];
      let enemies = [];
      let keys = {};
      let isDead = false;
      let currentScore = 0;
      let lastShot = 0;
      let spawnCounter = 0;

      const handleKeyDown = (e) => {
        keys[e.key] = true;
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
        }
      };

      const handleKeyUp = (e) => {
        keys[e.key] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      const loop = (timestamp) => {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x = Math.max(30, player.x - 7);
        if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x = Math.min(width - 30, player.x + 7);

        if ((keys[' '] || keys['ArrowUp'] || keys['w'] || keys['W']) && timestamp - lastShot > 180) {
          lastShot = timestamp;
          bullets.push({ x: player.x, y: player.y - 20, speed: 12 });
          if (!gameMuted) sounds.playJump();
        }

        spawnCounter++;
        if (spawnCounter % 35 === 0) {
          enemies.push({
            x: Math.random() * (width - 60) + 30,
            y: -20,
            speed: Math.random() * 2 + 2,
            size: Math.random() * 10 + 16,
            color: ['#ff2a8d', '#00f2fe', '#b85df5', '#ffb300'][Math.floor(Math.random() * 4)]
          });
        }

        bullets.forEach(b => { b.y -= b.speed; });
        bullets = bullets.filter(b => b.y > -10);

        enemies.forEach(en => { en.y += en.speed; });

        for (let i = enemies.length - 1; i >= 0; i--) {
          const en = enemies[i];
          for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            const dist = Math.hypot(en.x - b.x, en.y - b.y);
            if (dist < en.size + 6) {
              enemies.splice(i, 1);
              bullets.splice(j, 1);
              currentScore += 150;
              setScore(currentScore);
              if (!gameMuted) sounds.playScore();
              break;
            }
          }
        }

        enemies.forEach(en => {
          const dist = Math.hypot(en.x - player.x, en.y - player.y);
          if (dist < en.size + 15) {
            isDead = true;
            setGameOver(true);
          }
        });

        ctx.fillStyle = '#0b0216';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 40; i++) {
          const sx = (i * 37 + timestamp * 0.05) % width;
          const sy = (i * 49 + timestamp * 0.1) % height;
          ctx.fillRect(sx, sy, 2, 2);
        }

        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 18);
        ctx.lineTo(player.x - 16, player.y + 16);
        ctx.lineTo(player.x, player.y + 8);
        ctx.lineTo(player.x + 16, player.y + 16);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = '#ff007f';
        ctx.fillStyle = '#ff2a8d';
        bullets.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        enemies.forEach(en => {
          ctx.shadowColor = en.color;
          ctx.fillStyle = en.color;
          ctx.beginPath();
          ctx.arc(en.x, en.y, en.size, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.shadowBlur = 0;

        if (!isDead) {
          animationFrameRef.current = requestAnimationFrame(loop);
        }
      };

      animationFrameRef.current = requestAnimationFrame(loop);

      gameStateRef.current = {
        cleanup: () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        },
        restart: () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          setGameOver(false);
          setScore(0);
          initArcadeEngine();
        }
      };
    }
  }, [game, gameMuted]);

  useEffect(() => {
    if (useBuiltInEngine) {
      initArcadeEngine();
    }
    return () => {
      if (gameStateRef.current?.cleanup) {
        gameStateRef.current.cleanup();
      }
    };
  }, [useBuiltInEngine, initArcadeEngine]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(`sky_hs_${game?.id}`, score.toString());
      } catch {}
    }
  }, [score, highScore, game?.id]);

  if (!game) return null;

  const handleLike = () => {
    sounds.playPowerup();
    if (userVote === 'like') {
      setUserVote(null);
      setLikes(l => l - 1);
    } else {
      if (userVote === 'dislike') setDislikes(d => d - 1);
      setUserVote('like');
      setLikes(l => l + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleDislike = () => {
    sounds.playClick();
    if (userVote === 'dislike') {
      setUserVote(null);
      setDislikes(d => d - 1);
    } else {
      if (userVote === 'like') setLikes(l => l - 1);
      setUserVote('dislike');
      setDislikes(d => d + 1);
    }
  };

  const handleStarRating = (stars) => {
    sounds.playScore();
    setUserRating(stars);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
  };

  const handleRestartGame = () => {
    sounds.playClick();
    if (useBuiltInEngine || !cleanUrl) {
      if (gameStateRef.current?.restart) gameStateRef.current.restart();
    } else {
      setIframeKey(k => k + 1);
    }
  };

  const handleShare = () => {
    sounds.playClick();
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const toggleFullscreen = () => {
    sounds.playClick();
    const el = screenWrapperRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const playNextGames = allGames
    .filter(g => g.id !== game.id)
    .slice(0, 3);

  const moreRelatedGames = allGames
    .filter(g => g.id !== game.id)
    .slice(3, 15);

  const getCleanGameUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let finalUrl = rawUrl.trim();
    
    // 1. Extract src from <iframe> snippet if present
    const iframeMatch = finalUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      finalUrl = iframeMatch[1];
    }
    
    // 2. Automatically wrap Google Gadget .xml files with proxy
    if (finalUrl.endsWith('.xml') || finalUrl.includes('.xml?')) {
      return `/game-proxy/gadgets/ifr?url=${encodeURIComponent(finalUrl)}`;
    }

    // 3. Route Google opensocial gadgets via backend proxy for CORS/CSP bypass
    if (finalUrl.includes('opensocial.googleusercontent.com/gadgets/ifr')) {
      const subIdx = finalUrl.indexOf('/gadgets/ifr');
      if (subIdx !== -1) {
        return `/game-proxy${finalUrl.slice(subIdx)}`;
      }
    }
    
    // 4. Add protocol if missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('//') && !finalUrl.startsWith('/')) {
      finalUrl = 'https://' + finalUrl;
    }
    return finalUrl;
  };

  const cleanUrl = getCleanGameUrl(game.gameUrl);
  const embedDimensions = parseEmbedDimensions(game?.gameUrl);

  return (
    <div className={`crazy-game-page-container ${isLightsOff ? 'lights-off-active' : ''}`}>
      
      {/* Lights-off Cinematic Dark Backdrop */}
      {isLightsOff && (
        <div
          className="crazy-lights-off-overlay"
          onClick={() => setIsLightsOff(false)}
          title="Click to turn lights back on"
        />
      )}

      {/* 1. Breadcrumb Row & Focus Controls */}
      <div className="crazy-breadcrumb-row">
        <button
          className="crazy-back-btn"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          title="Back to All Games"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="crazy-breadcrumbs">
          <span className="crumb-link" onClick={() => { sounds.playClick(); onClose(); }}>Games</span>
          <ChevronRight size={14} className="crumb-sep" />
          <span
            className="crumb-link"
            onClick={() => {
              sounds.playClick();
              if (onSelectCategory && game.category) onSelectCategory(game.category.toLowerCase());
            }}
          >
            {game.category || 'Arcade'}
          </span>
          <ChevronRight size={14} className="crumb-sep" />
          <span className="crumb-current">{game.title}</span>
        </div>
      </div>

      {/* 2. Main Game Player Stage (Split: Left Player + Right Play Next Column) */}
      <div className={`crazy-stage-wrapper ${isTheaterMode ? 'theater-expanded' : ''}`}>
        
        {/* Left/Center Game Player Column */}
        <div className="crazy-player-column">
          
          {/* Game Frame Viewport with Glass Glow Ambient Lighting */}
          <div
            ref={screenWrapperRef}
            className={`crazy-screen-viewport ${isFullscreen ? 'is-fullscreen' : ''} ${isTheaterMode ? 'is-theater' : ''}`}
          >
            {useBuiltInEngine || !cleanUrl ? (
              /* Built-in Arcade Engine */
              <div className="sky-arcade-theater">
                <div className="arcade-game-hud">
                  <div className="hud-stat">
                    <span className="hud-lbl">SCORE</span>
                    <span className="hud-val">{score.toLocaleString()}</span>
                  </div>
                  <div className="hud-badge">
                    <Sparkles size={14} color="#00f2fe" />
                    <span>ARCADE ENGINE</span>
                  </div>
                  <div className="hud-stat">
                    <span className="hud-lbl">HIGH SCORE</span>
                    <span className="hud-val gold">{highScore.toLocaleString()}</span>
                  </div>
                </div>

                <div className="arcade-canvas-frame">
                  <canvas ref={canvasRef} className="arcade-screen-canvas" />

                  {gameOver && (
                    <div className="arcade-overlay-card">
                      <h3 className="gameover-title">GAME OVER!</h3>
                      <p className="gameover-score">Final Score: <span>{score}</span></p>
                      <button
                        className="arcade-restart-btn"
                        onClick={() => {
                          sounds.playPowerup();
                          if (gameStateRef.current?.restart) gameStateRef.current.restart();
                        }}
                      >
                        <RotateCcw size={18} /> PLAY AGAIN
                      </button>
                    </div>
                  )}
                </div>

                <div className="arcade-controls-bar">
                  <span>🎮 Use [Arrows] or [W A S D] to Move</span>
                  <button
                    className="arcade-sound-btn"
                    onClick={() => setGameMuted(!gameMuted)}
                    title={gameMuted ? 'Unmute' : 'Mute'}
                  >
                    {gameMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              /* External Playable Iframe - Full 100% Width & Height */
              <div className="crazy-iframe-container">
                <iframe
                  key={iframeKey}
                  src={cleanUrl}
                  title={game.title}
                  className="crazy-game-iframe"
                  width="100%"
                  height="600"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; cross-origin-isolated"
                  allowFullScreen={true}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* Under-Game Bottom Control Bar (Exact Poki.com Style) */}
          <div className="poki-under-ctrl-bar">
            
            {/* Left: Game Thumbnail + Title + Developer */}
            <div className="poki-ctrl-left">
              <img
                src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&q=80'}
                alt={game.title}
                className="poki-ctrl-thumb"
              />
              <div className="poki-ctrl-meta">
                <h2 className="poki-ctrl-title">{game.title}</h2>
                <span className="poki-ctrl-subtitle">
                  by {game.developer || game.author || (game.category ? game.category.toUpperCase() : 'SYBO')}
                </span>
              </div>
            </div>

            {/* Right: Poki Actions (Like, Dislike, Bookmark, Fullscreen) */}
            <div className="poki-ctrl-right">
              {/* Thumbs Up */}
              <button
                className={`poki-action-btn ${userVote === 'like' ? 'voted-like' : ''}`}
                onClick={handleLike}
                title="I like this"
              >
                <ThumbsUp size={20} className="poki-action-icon" />
                <span className="poki-action-count">{likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}</span>
              </button>

              {/* Thumbs Down */}
              <button
                className={`poki-action-btn ${userVote === 'dislike' ? 'voted-dislike' : ''}`}
                onClick={handleDislike}
                title="I dislike this"
              >
                <ThumbsDown size={20} className="poki-action-icon" />
                <span className="poki-action-count">{dislikes >= 1000 ? `${(dislikes / 1000).toFixed(1)}K` : dislikes}</span>
              </button>

              {/* Favorite / Bookmark */}
              <button
                className={`poki-action-btn ${isFavorite ? 'active-fav' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  onToggleFavorite(game.id);
                }}
                title={isFavorite ? "Saved to Favorites" : "Add to Favorites"}
              >
                <Heart size={20} className="poki-action-icon" fill={isFavorite ? "#f52d7e" : "none"} color={isFavorite ? "#f52d7e" : "currentColor"} />
              </button>

              {/* Fullscreen Trigger */}
              <button
                className="poki-action-btn poki-fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={21} className="poki-action-icon" /> : <Maximize2 size={21} className="poki-action-icon" />}
              </button>
            </div>

          </div>

        </div>

        {/* Play Next Section (Clean Responsive Grid) */}
        {!isTheaterMode && playNextGames.length > 0 && (
          <div className="crazy-play-next-section">
            <div className="play-next-header">
              <Flame size={20} color="#f52d7e" />
              <h3>Play Next</h3>
            </div>

            <div className="crazy-play-next-grid">
              {playNextGames.map((nextGame) => (
                <GameCard
                  key={`next-${nextGame.id}`}
                  game={nextGame}
                  onPlay={onSelectRelatedGame}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. Sleek Minimalist Game Info Bar */}
      <div className="crazy-minimal-details-card">
        <div className="min-details-left">
          <div className="min-game-badge-row">
            <span className="min-cat-badge">{(game.category || 'Arcade').toUpperCase()}</span>
            {game.tags && game.tags.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="min-tag-pill"
                onClick={() => {
                  sounds.playClick();
                  if (onSelectCategory) onSelectCategory(tag.toLowerCase());
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          {game.description && (
            <p className="min-desc-text">
              {game.description}
            </p>
          )}
        </div>

        <div className="min-controls-pill">
          <Gamepad2 size={16} color="#00f2fe" />
          <span className="min-ctrl-text"><strong>WASD / Arrows</strong> to move • <strong>Space / Click</strong> to play</span>
        </div>
      </div>

      {/* 4. More Recommended Games Shelf */}
      {moreRelatedGames.length > 0 && (
        <div className="crazy-more-games-section">
          <div className="more-games-header">
            <div className="more-title-left">
              <Layers size={20} color="#00f2fe" />
              <h3>More Games You Might Like</h3>
            </div>
            <button
              className="view-all-btn"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="crazy-related-grid">
            {moreRelatedGames.map((relGame) => (
              <GameCard
                key={`rel-${relGame.id}`}
                game={relGame}
                onPlay={onSelectRelatedGame}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
