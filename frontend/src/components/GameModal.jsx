import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Star,
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
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

// Auto-detect best aspect ratio based on game metadata
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

  return { aspectRatio: '16 / 9', maxWidth: '1060px', height: 'auto' };
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

export default function GameModal({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  allGames = [],
  onSelectRelatedGame
}) {
  const [likes, setLikes] = useState(() => typeof game?.likes === 'number' ? game.likes : 0);
  const [dislikes, setDislikes] = useState(() => typeof game?.dislikes === 'number' ? game.dislikes : 0);
  const [userVote, setUserVote] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [useBuiltInEngine, setUseBuiltInEngine] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(() => detectInitialRatio(game));
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
    setAspectRatio(detectInitialRatio(game));
    const hasUrl = Boolean(game?.gameUrl && game.gameUrl.trim().length > 5);
    setUseBuiltInEngine(!hasUrl);
  }, [game?.id, game?.gameUrl]);

  // Handle ESC key to exit and prevent arrow/space scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser from scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown'].includes(e.key)) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && !document.activeElement?.isContentEditable) {
          e.preventDefault();
        }
      }

      if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

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

          const r = index === 0 ? 6 : 4;
          const px = seg.x * gridSize + 1;
          const py = seg.y * gridSize + 1;
          const psize = gridSize - 2;

          ctx.beginPath();
          ctx.roundRect(px, py, psize, psize, r);
          ctx.fill();

          if (index === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(px + 6, py + 6, 2.5, 0, Math.PI * 2);
            ctx.arc(px + psize - 6, py + 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
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
      let player = { x: width / 2, y: height - 60, vx: 0 };
      let bullets = [];
      let enemies = [];
      let currentScore = 0;
      let isDead = false;
      let lastEnemySpawn = 0;

      const keys = {};
      const handleKeyDown = (e) => { keys[e.key] = true; };
      const handleKeyUp = (e) => { keys[e.key] = false; };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      let lastShot = 0;

      const loop = (timestamp) => {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x = Math.max(30, player.x - 7);
        if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x = Math.min(width - 30, player.x + 7);
        if ((keys[' '] || keys['ArrowUp'] || keys['w']) && timestamp - lastShot > 160) {
          lastShot = timestamp;
          bullets.push({ x: player.x, y: player.y - 10 });
          if (!gameMuted) sounds.playClick();
        }

        if (timestamp - lastEnemySpawn > 900) {
          lastEnemySpawn = timestamp;
          enemies.push({
            x: Math.random() * (width - 60) + 30,
            y: -20,
            speed: Math.random() * 2 + 2,
            size: Math.random() * 10 + 16,
            color: ['#f52d7e', '#b85df5', '#00f2fe', '#ff6b6b'][Math.floor(Math.random() * 4)]
          });
        }

        bullets.forEach(b => { b.y -= 9; });
        bullets = bullets.filter(b => b.y > -20);

        enemies.forEach(e => { e.y += e.speed; });

        bullets.forEach((b, bIdx) => {
          enemies.forEach((en, eIdx) => {
            const dist = Math.hypot(b.x - en.x, b.y - en.y);
            if (dist < en.size + 6) {
              enemies.splice(eIdx, 1);
              bullets.splice(bIdx, 1);
              currentScore += 150;
              setScore(currentScore);
              if (!gameMuted) sounds.playScore();
            }
          });
        });

        enemies.forEach(en => {
          const dist = Math.hypot(player.x - en.x, player.y - en.y);
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
      } catch { }
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

  const handleShare = () => {
    sounds.playClick();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRating = (stars) => {
    sounds.playScore();
    setUserRating(stars);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  const toggleFullscreen = () => {
    sounds.playClick();
    const elem = document.getElementById('sky-game-viewport') || document.querySelector('.sky-game-modal-container');
    if (!elem) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => { });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const relatedGames = useMemo(() => {
    if (!allGames || !allGames.length) return [];
    const currentId = game?.id || game?._id;
    const currentCat = (game?.category || '').toLowerCase().trim();

    const rawTags = Array.isArray(game?.tags)
      ? game.tags
      : typeof game?.tags === 'string'
        ? game.tags.split(',')
        : [];
    const currentTags = rawTags
      .map(t => String(t).toLowerCase().trim())
      .filter(Boolean);
    const currentTagSet = new Set(currentTags);

    const candidates = allGames.filter(g => {
      if (!g) return false;
      const gId = g.id || g._id;
      return gId && gId !== currentId && g.id !== game?.id && g._id !== game?.id && g.id !== game?._id;
    });

    const scoredCandidates = candidates.map(cand => {
      let score = 0;
      const candCat = (cand.category || '').toLowerCase().trim();
      const candRawTags = Array.isArray(cand.tags)
        ? cand.tags
        : typeof cand.tags === 'string'
          ? cand.tags.split(',')
          : [];
      const candTags = candRawTags
        .map(t => String(t).toLowerCase().trim())
        .filter(Boolean);
      const candTagSet = new Set(candTags);

      // 1. Matching tags (+12 points each)
      currentTagSet.forEach(tag => {
        if (candTagSet.has(tag)) score += 12;
      });

      // 2. Matching category (+15 points exact, +6 points partial)
      if (currentCat && candCat) {
        if (currentCat === candCat) {
          score += 15;
        } else if (currentCat.includes(candCat) || candCat.includes(currentCat)) {
          score += 6;
        }
      }

      // 3. Cross matching
      if (currentCat && candTagSet.has(currentCat)) score += 8;
      if (candCat && currentTagSet.has(candCat)) score += 8;

      // 4. Rating & popularity bonus
      const rating = Number(cand.rating) || 0;
      const plays = Number(cand.plays) || 0;
      score += rating * 0.1;
      score += Math.min(plays / 100000, 1);

      return { game: cand, score };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    return scoredCandidates.map(item => item.game).slice(0, 10);
  }, [allGames, game]);

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
    <div className="sky-modal-backdrop" onClick={(e) => {
      if (e.target === e.currentTarget) {
        sounds.playClick();
        onClose();
      }
    }}>
      <div
        className={`sky-game-modal-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
        style={{
          maxWidth: isFullscreen ? '100vw' : embedDimensions.maxWidth
        }}
      >

        {/* Modern Top Header Bar */}
        <div className="sky-modal-top-bar">
          <div className="modal-bar-left">
            <button
              className="sky-modal-back-btn"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              title="Back to games (ESC)"
              aria-label="Back to games"
            >
              <ArrowLeft size={18} className="sky-modal-back-icon" />
              <span>Back</span>
            </button>

            <div className="modal-game-info-badge">
              <span className="modal-game-name">{game.title}</span>
              <span className="modal-game-cat">{(game.category || 'Arcade').toUpperCase()}</span>
              <span className="modal-game-rate">★ {game.rating || 4.9}</span>
            </div>
          </div>

          <div className="modal-bar-center">
            {/* Dynamic Aspect Ratio Switcher Pills */}
            <div className="sky-aspect-pill-group" title="Adjust Game Frame Aspect Ratio">
              <button
                className={`sky-aspect-btn ${aspectRatio === 'portrait' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setAspectRatio('portrait'); }}
                title="Mobile Portrait View (9:16)"
              >
                <Smartphone size={14} />
                <span>Mobile</span>
              </button>
              <button
                className={`sky-aspect-btn ${aspectRatio === 'landscape' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setAspectRatio('landscape'); }}
                title="Widescreen View (16:9)"
              >
                <Monitor size={14} />
                <span>16:9</span>
              </button>
              <button
                className={`sky-aspect-btn ${aspectRatio === 'classic' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setAspectRatio('classic'); }}
                title="Classic Arcade View (4:3)"
              >
                <Tv size={14} />
                <span>4:3</span>
              </button>
              <button
                className={`sky-aspect-btn ${aspectRatio === 'full' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setAspectRatio('full'); }}
                title="Full Stretch View"
              >
                <Square size={14} />
                <span>Full</span>
              </button>
            </div>

            {/* Thumbs Up / Down */}
            <div className="sky-vote-pill">
              <button
                className={`sky-vote-btn ${userVote === 'like' ? 'voted-like' : ''}`}
                onClick={handleLike}
                title="Like game"
              >
                <ThumbsUp size={14} />
                <span>{likes}</span>
              </button>
              <div className="sky-vote-divider" />
              <button
                className={`sky-vote-btn ${userVote === 'dislike' ? 'voted-dislike' : ''}`}
                onClick={handleDislike}
                title="Dislike game"
              >
                <ThumbsDown size={14} />
                <span>{dislikes}</span>
              </button>
            </div>

            {/* Favorite & Share */}
            <button
              className={`sky-action-pill-btn ${isFavorite ? 'fav-active' : ''}`}
              onClick={() => {
                sounds.playClick();
                onToggleFavorite(game.id);
              }}
              title="Save to favorites"
            >
              <Heart size={14} fill={isFavorite ? "#f52d7e" : "none"} color={isFavorite ? "#f52d7e" : "currentColor"} />
              <span>{isFavorite ? 'SAVED' : 'FAVORITE'}</span>
            </button>

            <button className="sky-action-pill-btn" onClick={handleShare} title="Copy game link">
              {copiedLink ? <Check size={14} color="#00f5a0" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'COPIED' : 'SHARE'}</span>
            </button>
          </div>

          <div className="modal-bar-right">
            {/* Mode Switcher Button */}
            {cleanUrl && (
              <button
                className="sky-mode-toggle-btn"
                onClick={() => setUseBuiltInEngine(!useBuiltInEngine)}
                title={useBuiltInEngine ? 'Switch to External URL Game' : 'Switch to Built-in Arcade Engine'}
              >
                <Gamepad2 size={15} />
                <span>{useBuiltInEngine ? 'Web Mode' : 'Arcade Mode'}</span>
              </button>
            )}

            <button
              className="sky-ctrl-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              className="sky-ctrl-icon-btn close-btn-danger"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              title="Close Player (ESC)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Center Stage Game Theater Area */}
        <div id="sky-game-viewport" className="sky-theater-viewport">
          {useBuiltInEngine || !cleanUrl ? (
            /* Built-in Interactive Arcade Game */
            <div className={`sky-arcade-theater ratio-${aspectRatio}`}>
              {/* Top Game HUD */}
              <div className="arcade-game-hud">
                <div className="hud-stat">
                  <span className="hud-lbl">SCORE</span>
                  <span className="hud-val">{score.toLocaleString()}</span>
                </div>
                <div className="hud-badge">
                  <Sparkles size={14} color="#00f2fe" />
                  <span>SKY ARCADE ENGINE</span>
                </div>
                <div className="hud-stat">
                  <span className="hud-lbl">HIGH SCORE</span>
                  <span className="hud-val gold">{highScore.toLocaleString()}</span>
                </div>
              </div>

              {/* Canvas Frame */}
              <div className="arcade-canvas-frame">
                <canvas ref={canvasRef} className="arcade-screen-canvas" />

                {/* Game Over Screen */}
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

              {/* Bottom Controls Hint */}
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
            /* External Playable Iframe with Dynamic Responsive Aspect Ratio */
            <div
              className={`sky-iframe-container ratio-${aspectRatio}`}
              style={{
                aspectRatio: embedDimensions.aspectRatio || '16 / 9'
              }}
            >
              <iframe
                src={cleanUrl}
                title={game.title}
                className="sky-game-frame"
                width="100%"
                height="100%"
                scrolling="no"
                seamless="seamless"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; cross-origin-isolated"
                allowFullScreen={true}
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  overflow: 'hidden',
                  display: 'block'
                }}
              />
            </div>
          )}
        </div>

        {/* Recommended Games Rail (sky Style Bottom Shelf) */}
        <div className="sky-bottom-games-shelf">
          <div className="shelf-header">
            <Flame size={16} color="#f52d7e" />
            <span>MORE RECOMMENDED GAMES</span>
          </div>
          <div className="shelf-games-row">
            {relatedGames.map((relGame) => (
              <div
                key={relGame.id}
                className="shelf-game-pill"
                onClick={() => {
                  sounds.playClick();
                  if (onSelectRelatedGame) onSelectRelatedGame(relGame);
                }}
              >
                <img src={relGame.thumbnail} alt={relGame.title} className="shelf-thumb" />
                <div className="shelf-info">
                  <span className="shelf-title">{relGame.title}</span>
                  <span className="shelf-cat">{relGame.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
