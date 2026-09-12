import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Gamepad2,
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
  EyeOff,
  Zap,
  SmilePlus,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { socket } from '../utils/socket';
import GameCard from './GameCard';

function getSidebarPreviewVideo(game) {
  if (game?.previewVideo) return game.previewVideo;
  if (!game?.gameUrl) return null;
  const cg = game.gameUrl.match(/crazygames\.com\/(?:game|embed)\/([a-zA-Z0-9-]+)/i);
  if (cg) return `https://videos.crazygames.com/games/${cg[1]}/cover-16x9.mp4`;
  return null;
}

function SidebarGameTile({ game, onPlay, isFirst }) {
  const currentThumb = game?.thumbnail || game?.thumbnailUrl || game?.image || game?.imageUrl || game?.cover || game?.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400';
  const [imgSrc, setImgSrc] = useState(currentThumb);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  React.useEffect(() => {
    setImgSrc(currentThumb);
    setImgLoaded(false);
  }, [currentThumb]);

  const previewVideoUrl = !videoError ? getSidebarPreviewVideo(game) : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && previewVideoUrl) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        videoRef.current.currentTime = 0;
      } catch { }
    }
  };

  return (
    <div
      className={`crazy-sidebar-game-tile ${isFirst ? 'is-first-tile' : ''} ${isHovered ? 'is-hovered' : ''}`}
      onClick={() => {
        sounds.playClick();
        onPlay(game);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={game.title}
    >
      <img
        src={imgSrc}
        alt={game.title}
        loading="lazy"
        className={`crazy-sidebar-game-img ${imgLoaded ? 'is-loaded' : ''}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => {
          setImgSrc('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80');
          setImgLoaded(true);
        }}
      />

      {/* Hover Video Preview (CrazyGames Style) */}
      {previewVideoUrl && (
        <video
          ref={videoRef}
          src={previewVideoUrl}
          className={`card-hover-preview-video ${isHovered ? 'video-active' : ''}`}
          muted
          loop
          playsInline
          preload="none"
          onError={() => setVideoError(true)}
        />
      )}



      {/* Subtle Title Overlay on Hover */}
      <div className="crazy-sidebar-hover-bar">
        <span className="sidebar-hover-title">{game.title}</span>
      </div>
    </div>
  );
}

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
  const [roomPlayersCount, setRoomPlayersCount] = useState(1);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [iframeLoaded, setIframeLoaded] = useState(false);

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

  // Real-time socket room join, leave, play increment, and live reactions
  useEffect(() => {
    if (!game?.id) return;

    // Join room
    socket.emit('game:join', game.id);

    // Increment play count via API
    fetch(`http://localhost:5000/api/games/${game.id}/play`, { method: 'POST' }).catch(() => { });

    // Listen for room player counts
    const handlePlayerCount = (data) => {
      if (data?.gameId === game.id) {
        setRoomPlayersCount(data.count);
      }
    };
    socket.on('game:players:count', handlePlayerCount);

    // Listen for real-time live reactions from other players
    const handleReactionBroadcast = (data) => {
      if (data?.gameId === game.id) {
        const id = 'reac-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        const left = Math.floor(Math.random() * 70) + 15; // 15% to 85%
        setFloatingReactions(prev => [...prev.slice(-15), { id, emoji: data.emoji, left }]);
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(r => r.id !== id));
        }, 2200);
      }
    };
    socket.on('game:reaction:broadcast', handleReactionBroadcast);

    return () => {
      socket.emit('game:leave', game.id);
      socket.off('game:players:count', handlePlayerCount);
      socket.off('game:reaction:broadcast', handleReactionBroadcast);
    };
  }, [game?.id]);

  const sendReaction = (emoji) => {
    sounds.playPowerup();
    socket.emit('game:reaction', { gameId: game.id, emoji });
  };

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

  // Handle keyboard events (prevent page scrolling on Arrow/Space keys during gameplay, ESC for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser from scrolling up/down/sideways on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar', 'PageUp', 'PageDown'].includes(e.key)) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea' && !document.activeElement?.isContentEditable) {
          e.preventDefault();
        }
      }

      if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        } else if (isLightsOff) {
          setIsLightsOff(false);
        } else if (isTheaterMode) {
          setIsTheaterMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
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
        el.requestFullscreen().catch(() => { });
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  const { sideGames, moreRelatedGames } = useMemo(() => {
    if (!allGames || !allGames.length) {
      return { sideGames: [], moreRelatedGames: [] };
    }

    const currentId = game?.id || game?._id;
    const currentCat = (game?.category || '').toLowerCase().trim();

    // Parse and normalize current game tags
    const rawTags = Array.isArray(game?.tags)
      ? game.tags
      : typeof game?.tags === 'string'
        ? game.tags.split(',')
        : [];
    const currentTags = rawTags
      .map(t => String(t).toLowerCase().trim())
      .filter(Boolean);
    const currentTagSet = new Set(currentTags);

    // Candidates excluding the current game
    const candidates = allGames.filter(g => {
      if (!g) return false;
      const gId = g.id || g._id;
      return gId && gId !== currentId && g.id !== game?.id && g._id !== game?.id && g.id !== game?._id;
    });

    // Score candidates based on category, tag relevance and popularity
    const scoredCandidates = candidates.map(cand => {
      let score = 0;
      let matchedTagsCount = 0;

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

      // 1. Tag overlap (high priority: +12 points per matching tag)
      currentTagSet.forEach(tag => {
        if (candTagSet.has(tag)) {
          score += 12;
          matchedTagsCount++;
        }
      });

      // 2. Category matching
      if (currentCat && candCat) {
        if (currentCat === candCat) {
          // Exact same category (+15 points)
          score += 15;
        } else if (currentCat.includes(candCat) || candCat.includes(currentCat)) {
          // Partial category match (+6 points)
          score += 6;
        }
      }

      // 3. Cross matching: Current category matches candidate tag or candidate category matches current tag
      if (currentCat && candTagSet.has(currentCat)) {
        score += 8;
      }
      if (candCat && currentTagSet.has(candCat)) {
        score += 8;
      }

      // 4. Quality & Popularity tie-breaker
      const rating = Number(cand.rating) || 0;
      const plays = Number(cand.plays) || 0;
      score += rating * 0.1;
      score += Math.min(plays / 100000, 1);

      return {
        game: cand,
        score,
        matchedTagsCount,
        categoryMatch: Boolean(currentCat && candCat === currentCat)
      };
    });

    // Sort descending by relevance score
    scoredCandidates.sort((a, b) => b.score - a.score);

    const sortedGames = scoredCandidates.map(item => item.game);

    return {
      sideGames: sortedGames.slice(0, 8),
      moreRelatedGames: sortedGames.slice(8, 28)
    };
  }, [allGames, game]);

  const getCleanGameUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let finalUrl = rawUrl.trim();

    // Remove any accidental outer quotes or double protocol patterns (e.g., https://"https://...)
    finalUrl = finalUrl.replace(/^https?:\/\/"https?:\/\//i, 'https://');
    finalUrl = finalUrl.replace(/^"|"$/g, '').trim();
    finalUrl = finalUrl.replace(/&amp;/g, '&');

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

      {/* 2. Main Game Player Stage (Split: Left Main Game Player Screen + Right Recommended Games Column) */}
      <div className={`crazy-stage-wrapper ${isTheaterMode ? 'theater-expanded' : ''}`}>

        {/* Left/Center Main Game Player Column */}
        <div className="crazy-player-column">

          {/* Game Frame Viewport with Glass Glow Ambient Lighting */}
          <div
            ref={screenWrapperRef}
            className={`crazy-screen-viewport game-screen-wrapper ${isFullscreen ? 'is-fullscreen' : ''} ${isTheaterMode ? 'is-theater' : ''}`}
          >
            {/* Real-time Floating Reactions Overlay */}
            {floatingReactions.length > 0 && (
              <div className="live-reactions-floating-overlay">
                {floatingReactions.map((r) => (
                  <div
                    key={r.id}
                    className="floating-emoji-bubble"
                    style={{ left: `${r.left}%` }}
                  >
                    <span>{r.emoji}</span>
                  </div>
                ))}
              </div>
            )}

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
              <div className="crazy-iframe-container" style={{ position: 'relative' }}>
                {!iframeLoaded && (
                  <div className="skeleton iframe-skeleton-loader">
                    <div className="skeleton-loader-content">
                      <div className="skeleton-spinner"></div>
                      <span className="skeleton-text">Loading Game Environment...</span>
                    </div>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={cleanUrl}
                  title={game.title}
                  className="crazy-game-iframe"
                  width="100%"
                  height="100%"
                  scrolling="no"
                  seamless="seamless"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; gamepad; cross-origin-isolated"
                  allowFullScreen={true}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setIframeLoaded(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    overflow: 'hidden',
                    display: 'block',
                    opacity: iframeLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              </div>
            )}
          </div>

          {/* Under-Game Bottom Control Bar (Exact sky.com Style) */}
          <div className="sky-under-ctrl-bar">

            {/* Left: Game Thumbnail + Title + Developer + Live Room Count */}
            <div className="sky-ctrl-left">
              <img
                src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&q=80'}
                alt={game.title}
                className="sky-ctrl-thumb"
              />
              <div className="sky-ctrl-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 className="sky-ctrl-title">{game.title}</h2>
                  <span className="live-room-player-tag" title="Concurrent active players in this game">
                    <span className="live-pulse-dot small" /> {roomPlayersCount} playing
                  </span>
                </div>
                <span className="sky-ctrl-subtitle">
                  by {game.developer || game.author || (game.category ? game.category.toUpperCase() : 'SYBO')}
                </span>
              </div>
            </div>

            {/* Right: sky Actions + Real-time Reaction Picker + Engine Switcher + Reload + Fullscreen */}
            <div className="sky-ctrl-right">
              {/* Live Emoji Quick Reactions */}
              <div className="live-reaction-picker" title="Send live reaction to all players">
                <button className="emoji-react-btn" onClick={() => sendReaction('🔥')} title="Fire">🔥</button>
                <button className="emoji-react-btn" onClick={() => sendReaction('⚡')} title="Lightning">⚡</button>
                <button className="emoji-react-btn" onClick={() => sendReaction('👏')} title="Clap">👏</button>
                <button className="emoji-react-btn" onClick={() => sendReaction('🏆')} title="Trophy">🏆</button>
              </div>

              {/* Thumbs Up */}
              <button
                className={`sky-action-btn ${userVote === 'like' ? 'voted-like' : ''}`}
                onClick={handleLike}
                title="I like this"
              >
                <ThumbsUp size={19} className="sky-action-icon" />
                <span className="sky-action-count">{likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}</span>
              </button>

              {/* Thumbs Down */}
              <button
                className={`sky-action-btn ${userVote === 'dislike' ? 'voted-dislike' : ''}`}
                onClick={handleDislike}
                title="I dislike this"
              >
                <ThumbsDown size={19} className="sky-action-icon" />
                <span className="sky-action-count">{dislikes >= 1000 ? `${(dislikes / 1000).toFixed(1)}K` : dislikes}</span>
              </button>

              {/* Favorite / Bookmark */}
              <button
                className={`sky-action-btn ${isFavorite ? 'active-fav' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  onToggleFavorite(game.id);
                }}
                title={isFavorite ? "Saved to Favorites" : "Add to Favorites"}
              >
                <Heart size={19} className="sky-action-icon" fill={isFavorite ? "#f52d7e" : "none"} color={isFavorite ? "#f52d7e" : "currentColor"} />
              </button>

              {/* Switch Engine (Built-in Arcade vs Web URL) */}
              <button
                className={`sky-action-btn ${useBuiltInEngine ? 'active-engine' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  setUseBuiltInEngine(!useBuiltInEngine);
                }}
                title={useBuiltInEngine ? "Switch to Web Embed" : "Play Built-in Arcade Engine"}
              >
                <Gamepad2 size={19} className="sky-action-icon" />
              </button>

              {/* Reload / Restart */}
              <button
                className="sky-action-btn"
                onClick={handleRestartGame}
                title="Reload Game"
              >
                <RefreshCw size={19} className="sky-action-icon" />
              </button>

              {/* Fullscreen Trigger */}
              <button
                className="sky-action-btn sky-fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={20} className="sky-action-icon" /> : <Maximize2 size={20} className="sky-action-icon" />}
              </button>
            </div>

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

        </div>

        {/* Right Side Games Column - Play next single-column format */}
        {!isTheaterMode && sideGames.length > 0 && (
          <aside className="crazy-play-next-sidebar">
            <div className="play-next-header-row">
              <h3 className="play-next-heading">Play next</h3>
            </div>
            <div className="play-next-vertical-list custom-scrollbar">
              {sideGames.map((sideGame, idx) => (
                <SidebarGameTile
                  key={`side-${sideGame.id}`}
                  game={sideGame}
                  onPlay={onSelectRelatedGame}
                  isFirst={idx === 0}
                />
              ))}
            </div>
          </aside>
        )}

      </div>

      {/* 4. More Recommended Games Shelf */}
      {moreRelatedGames.length > 0 && (
        <div className="crazy-more-games-section">
          <div className="more-games-header">
            <div className="more-title-left">
              <div className="more-title-icon-wrapper">
                <Layers size={19} />
              </div>
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
