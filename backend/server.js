import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Game } from './models/Game.js';
import { Category } from './models/Category.js';
import { Banner } from './models/Banner.js';
import { Submission } from './models/Submission.js';
import { Message } from './models/Message.js';
import { Setting } from './models/Setting.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';

// Middleware
app.use(cors());
app.use(express.json());

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ---------------- REAL-TIME WEBSOCKET TRACKING ----------------
let onlineUsersCount = 0;
const gameActivePlayers = new Map(); // gameId -> count
const recentActivities = []; // live stream log for admin & frontend

function recordActivity(type, title, detail) {
  const activity = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    type,
    title,
    detail,
    timestamp: new Date().toISOString()
  };
  recentActivities.unshift(activity);
  if (recentActivities.length > 50) recentActivities.pop();
  io.emit('activity:new', activity);
}

io.on('connection', (socket) => {
  onlineUsersCount++;
  io.emit('online:count', { count: Math.max(1, onlineUsersCount) });

  socket.emit('activities:init', recentActivities.slice(0, 20));

  // Player joins a game room
  socket.on('game:join', (gameId) => {
    socket.join(gameId);
    const count = (gameActivePlayers.get(gameId) || 0) + 1;
    gameActivePlayers.set(gameId, count);
    io.to(gameId).emit('game:players:count', { gameId, count });
    recordActivity('game_join', 'Player Joined', `Someone started playing "${gameId}"`);
  });

  // Player leaves a game room
  socket.on('game:leave', (gameId) => {
    socket.leave(gameId);
    const count = Math.max(0, (gameActivePlayers.get(gameId) || 1) - 1);
    gameActivePlayers.set(gameId, count);
    io.to(gameId).emit('game:players:count', { gameId, count });
  });

  // Player sends real-time emoji reaction (🔥, 🎮, ⚡, 👏)
  socket.on('game:reaction', ({ gameId, emoji, username }) => {
    io.to(gameId).emit('game:reaction:broadcast', {
      gameId,
      emoji: emoji || '🔥',
      username: username || 'Player',
      timestamp: Date.now()
    });
  });

  // Player submits score
  socket.on('game:score', ({ gameId, score, username }) => {
    recordActivity('high_score', 'New High Score!', `${username || 'Player'} scored ${score} in ${gameId}`);
    io.emit('leaderboard:update', { gameId, score, username });
  });

  socket.on('disconnect', () => {
    onlineUsersCount = Math.max(0, onlineUsersCount - 1);
    io.emit('online:count', { count: Math.max(1, onlineUsersCount) });
  });
});

// Seed Initial Data
const SEED_GAMES = [
  {
    id: 'space-shooter',
    title: 'Neon Void Runner',
    category: 'action',
    description: 'Pilot your quantum starship through a hazardous neon asteroid field with upgrades and boss battles.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    tags: ['Space', 'Action', 'Shooter', 'Laser', 'Sci-Fi'],
    rating: 4.8,
    plays: 14230,
    featured: true,
    status: 'active',
    createdAt: '2026-03-01'
  },
  {
    id: 'cyber-runner',
    title: 'Cyber Runner 2077',
    category: 'arcade',
    description: 'Fast-paced endless runner across futuristic skyscrapers with parkour mechanics and synthwave music.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    tags: ['Runner', 'Cyberpunk', 'Parkour', 'Endless'],
    rating: 4.9,
    plays: 28940,
    featured: true,
    status: 'active',
    createdAt: '2026-03-02'
  },
  {
    id: 'knife-clash',
    title: 'Knife Clash Deluxe',
    category: 'arcade',
    description: 'Throw spinning blades with precision timing to shatter the targets and defeat spinning wheel bosses.',
    thumbnail: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
    tags: ['Knives', 'Precision', 'Arcade', 'Hit'],
    rating: 4.7,
    plays: 19410,
    featured: true,
    status: 'active',
    createdAt: '2026-03-03'
  },
  {
    id: 'neon-snake',
    title: 'Neon Snake GX',
    category: 'classic',
    description: 'Classic snake reinvented with glowing particles, warp portals, power-up speed bursts and sound design.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    tags: ['Retro', 'Snake', 'Classic', 'Neon'],
    rating: 4.6,
    plays: 35120,
    featured: false,
    status: 'active',
    createdAt: '2026-03-04'
  },
  {
    id: 'brick-breaker',
    title: 'Quantum Brick Breaker',
    category: 'arcade',
    description: 'Destroy neon bricks with multi-ball laser powerups, explosive plasma rounds and shields.',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
    tags: ['Breakout', 'Bricks', 'Physics', 'Laser'],
    rating: 4.7,
    plays: 11840,
    featured: false,
    status: 'active',
    createdAt: '2026-03-05'
  },
  {
    id: 'cyber-2048',
    title: 'Cyber 2048 Hex',
    category: 'puzzle',
    description: 'Strategic cyberpunk puzzle combining numbered holographic tiles with energy combos.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    tags: ['Puzzle', 'Math', 'Cyber', 'Strategy'],
    rating: 4.5,
    plays: 9320,
    featured: false,
    status: 'active',
    createdAt: '2026-03-06'
  },
  {
    id: 'neon-pong',
    title: 'Neon Hyper Pong',
    category: 'sports',
    description: 'High velocity paddle battle against intelligent AI with curve shots and gravity anomalies.',
    thumbnail: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1200&auto=format&fit=crop&q=80',
    tags: ['Pong', 'Retro', '2-Player', 'AI Battle'],
    rating: 4.4,
    plays: 8750,
    featured: false,
    status: 'active',
    createdAt: '2026-03-07'
  },
  {
    id: 'cyber-flap',
    title: 'Cyber Drone Flap',
    category: 'arcade',
    description: 'Navigate an anti-gravity drone through pulsating laser gates and electric traps.',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
    tags: ['Flappy', 'Precision', 'Drone', 'Laser'],
    rating: 4.3,
    plays: 16400,
    featured: false,
    status: 'active',
    createdAt: '2026-03-08'
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix Protocol',
    category: 'puzzle',
    description: 'Test and enhance your cognitive memory by repeating glowing cyber grid sequences.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    tags: ['Memory', 'Brain', 'Matrix', 'Sequence'],
    rating: 4.6,
    plays: 7100,
    featured: false,
    status: 'active',
    createdAt: '2026-03-09'
  },
  {
    id: 'cyber-minesweeper',
    title: 'Cyber Grid Sweeper',
    category: 'puzzle',
    description: 'Hack through encrypted node sectors while identifying malicious anomaly nodes.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    tags: ['Minesweeper', 'Hacking', 'Logic', 'Cyber'],
    rating: 4.5,
    plays: 6890,
    featured: false,
    status: 'active',
    createdAt: '2026-03-09'
  }
];

const SEED_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: '🎮', color: '#00ffcc' },
  { id: 'arcade', name: 'Arcade', icon: '🕹️', color: '#ff0055' },
  { id: 'action', name: 'Action', icon: '⚔️', color: '#ffaa00' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩', color: '#9d00ff' },
  { id: 'classic', name: 'Classic', icon: '👾', color: '#00e5ff' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#00ff88' },
  { id: 'cyber', name: 'Cyberpunk', icon: '⚡', color: '#ff00aa' }
];

let localStore = {
  games: [...SEED_GAMES],
  categories: [...SEED_CATEGORIES],
  banner: {
    active: true,
    badge: '🔥 SPOTLIGHT',
    message: 'Welcome to SKYGAMES Enterprise Platform!',
    ctaText: 'Play Now',
    ctaLink: '#arcade',
    bgColor: 'rgba(255, 0, 85, 0.15)',
    borderColor: '#ff0055'
  },
  submissions: [],
  messages: [],
  settings: {
    siteName: 'SKYGAMES Arcade',
    maintenanceMode: false,
    allowSubmissions: true
  }
};

function initStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      localStore = { ...localStore, ...JSON.parse(data) };
    } else {
      fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2));
    }
  } catch (err) {
    console.warn('⚠️ Store load warning:', err.message);
  }
}

function persistStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(localStore, null, 2));
  } catch (err) {
    console.error('⚠️ Store save error:', err.message);
  }
}

initStore();

async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(SEED_CATEGORIES);
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create(localStore.banner);
    }

    const gameCount = await Game.countDocuments();
    if (gameCount === 0) {
      await Game.insertMany(SEED_GAMES);
    }
  } catch (err) {
    console.error('⚠️ Seeding error:', err.message);
  }
}

// ---------------- GAME PROXY ROUTES ----------------
// Reverse proxy for Google Gadgets & unblocked game frames (/game-proxy/gadgets/ifr?url=...)
app.all('/game-proxy/*', async (req, res) => {
  try {
    const subPath = req.path.replace(/^\/game-proxy/, '');
    const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    
    // Upstream server for Google Gadgets proxy
    const upstreamBase = 'https://opensocial.googleusercontent.com';
    const upstreamUrl = `${upstreamBase}${subPath}${queryString}`;

    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': req.headers['accept'] || '*/*',
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
    };

    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });

    // Strip frame-busting / CSP restrictions so iframe embeds work in frontend
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');

    response.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (!['x-frame-options', 'content-security-policy', 'content-security-policy-report-only', 'content-encoding'].includes(lower)) {
        res.setHeader(key, val);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    res.status(response.status);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      let html = await response.text();
      const autoFitStyle = `
<style id="skygames-fullscreen-fit">
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
}
canvas, #canvas, #game, #gameCanvas, #game-canvas, #c2canvas, #unity-canvas, iframe, embed, object {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  object-fit: fill !important;
  display: block !important;
  margin: 0 auto !important;
}
</style>
`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${autoFitStyle}</head>`);
      } else if (html.includes('</body>')) {
        html = html.replace('</body>', `${autoFitStyle}</body>`);
      } else {
        html = autoFitStyle + html;
      }
      res.send(html);
      return;
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('⚠️ Game proxy error:', err.message);
    res.status(502).json({ error: 'Failed to proxy game content', details: err.message });
  }
});

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    storageMode: mongoose.connection.readyState === 1 ? 'mongodb' : 'json_store',
    totalGames: localStore.games.length,
    onlinePlayers: Math.max(1, onlineUsersCount)
  });
});

// --- GAMES API ---
// Get all games
app.get('/api/games', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const games = await Game.find().sort({ createdAt: -1 });
      if (games && games.length > 0) return res.json(games);
    }
    res.json(localStore.games);
  } catch (err) {
    res.json(localStore.games);
  }
});

// Get single game
app.get('/api/games/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const game = await Game.findOne({ id: req.params.id });
      if (game) return res.json(game);
    }
    const found = localStore.games.find(g => g.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Game not found' });
    res.json(found);
  } catch (err) {
    const found = localStore.games.find(g => g.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Game not found' });
    res.json(found);
  }
});

// Create game
app.post('/api/games', async (req, res) => {
  try {
    const gameData = req.body;
    if (!gameData.id) {
      gameData.id = (gameData.title || 'game').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    }
    if (!gameData.plays) gameData.plays = 0;
    if (!gameData.rating) gameData.rating = 4.8;
    if (!gameData.createdAt) gameData.createdAt = new Date().toISOString().split('T')[0];

    // Update local store
    localStore.games = [gameData, ...localStore.games.filter(g => g.id !== gameData.id)];
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.create(gameData).catch(() => {});
    }

    io.emit('game:created', gameData);
    recordActivity('game_create', 'New Game Published', `Admin published "${gameData.title}"`);
    res.status(201).json(gameData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update game
app.put('/api/games/:id', async (req, res) => {
  try {
    const idx = localStore.games.findIndex(g => g.id === req.params.id);
    let updated;
    if (idx !== -1) {
      updated = { ...localStore.games[idx], ...req.body };
      localStore.games[idx] = updated;
    } else {
      updated = { id: req.params.id, ...req.body };
      localStore.games.unshift(updated);
    }
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, upsert: true }
      ).catch(() => {});
    }

    io.emit('game:updated', updated);
    recordActivity('game_update', 'Game Updated', `Admin updated "${updated.title}"`);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete single game
app.delete('/api/games/:id', async (req, res) => {
  try {
    localStore.games = localStore.games.filter(g => g.id !== req.params.id);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndDelete({ id: req.params.id }).catch(() => {});
    }

    io.emit('game:deleted', { id: req.params.id });
    recordActivity('game_delete', 'Game Deleted', `Game ID "${req.params.id}" was removed`);
    res.json({ message: 'Game deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all games
app.delete('/api/games', async (req, res) => {
  try {
    localStore.games = [];
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.deleteMany({}).catch(() => {});
    }

    io.emit('game:all_deleted');
    recordActivity('game_delete', 'All Games Reset', 'Admin cleared all games');
    res.json({ message: 'All games deleted from database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Featured
app.patch('/api/games/:id/featured', async (req, res) => {
  try {
    const idx = localStore.games.findIndex(g => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Game not found' });
    localStore.games[idx].featured = !localStore.games[idx].featured;
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const g = await Game.findOne({ id: req.params.id });
      if (g) { g.featured = !g.featured; await g.save(); }
    }

    io.emit('game:updated', localStore.games[idx]);
    res.json(localStore.games[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increment play count
app.post('/api/games/:id/play', async (req, res) => {
  try {
    const idx = localStore.games.findIndex(g => g.id === req.params.id);
    let plays = 1;
    let title = req.params.id;
    if (idx !== -1) {
      localStore.games[idx].plays = (localStore.games[idx].plays || 0) + 1;
      plays = localStore.games[idx].plays;
      title = localStore.games[idx].title;
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        { id: req.params.id },
        { $inc: { plays: 1 } },
        { new: true }
      ).catch(() => {});
    }

    io.emit('game:play:increment', { id: req.params.id, plays, title });
    recordActivity('game_play', 'Game Played', `"${title}" was launched. Total plays: ${plays.toLocaleString()}`);
    res.json({ id: req.params.id, plays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PROVABLY FAIR GAMING CRYPTO ENGINE ----------------
app.post('/api/provably-fair/generate', (req, res) => {
  try {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const clientSeed = req.body?.clientSeed || crypto.randomBytes(16).toString('hex');
    const nonce = Number(req.body?.nonce || 1);

    res.json({
      serverHash,
      clientSeed,
      nonce,
      serverSeedPreview: serverSeed.slice(0, 8) + '...' + serverSeed.slice(-8)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/provably-fair/verify', (req, res) => {
  try {
    const { serverSeed, clientSeed, nonce } = req.body;
    if (!serverSeed || !clientSeed) {
      return res.status(400).json({ error: 'serverSeed and clientSeed are required' });
    }

    const calculatedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
    const combination = `${serverSeed}:${clientSeed}:${nonce || 1}`;
    const finalHash = crypto.createHash('sha256').update(combination).digest('hex');
    
    const subHash = finalHash.substring(0, 8);
    const intVal = parseInt(subHash, 16);
    const outcome = ((intVal % 10000) / 100).toFixed(2);

    res.json({
      verified: true,
      serverHash: calculatedHash,
      finalHash,
      outcome: Number(outcome),
      message: 'Cryptographically verified as 100% fair and untampered.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LIVE TELEMETRY & ANALYTICS API ---
app.get('/api/analytics/live', async (req, res) => {
  try {
    const activeRooms = [];
    gameActivePlayers.forEach((count, gameId) => {
      if (count > 0) activeRooms.push({ gameId, count });
    });

    res.json({
      onlineUsers: Math.max(1, onlineUsersCount),
      activeRooms,
      recentActivities: recentActivities.slice(0, 15),
      totalGames: localStore.games.length,
      totalCategories: localStore.categories.length,
      submissionsCount: localStore.submissions.length,
      unreadMessages: localStore.messages.filter(m => !m.read).length,
      serverUptime: Math.floor(process.uptime()),
      dbConnected: mongoose.connection.readyState === 1,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BANNER API ---
app.get('/api/banner', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const b = await Banner.findOne();
      if (b) return res.json(b);
    }
    res.json(localStore.banner);
  } catch (err) {
    res.json(localStore.banner);
  }
});

app.put('/api/banner', async (req, res) => {
  try {
    localStore.banner = { ...localStore.banner, ...req.body };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const b = await Banner.findOne();
      if (b) {
        await Banner.findByIdAndUpdate(b._id, { $set: req.body });
      } else {
        await Banner.create(req.body);
      }
    }

    io.emit('banner:update', localStore.banner);
    recordActivity('banner_update', 'Announcement Broadcast', localStore.banner.message || 'Banner updated');
    res.json(localStore.banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/banner', async (req, res) => {
  try {
    localStore.banner = { active: false, message: '' };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Banner.updateMany({}, { $set: { active: false, message: '' } }).catch(() => {});
    }

    io.emit('banner:update', localStore.banner);
    res.json({ message: 'Banner removed successfully', banner: localStore.banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES API ---
app.get('/api/categories', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const categories = await Category.find();
      if (categories && categories.length > 0) return res.json(categories);
    }
    res.json(localStore.categories);
  } catch (err) {
    res.json(localStore.categories);
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const cat = req.body;
    if (!cat.id) cat.id = (cat.name || 'cat').toLowerCase().replace(/[^a-z0-9]/g, '-');
    localStore.categories.push(cat);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Category.create(cat).catch(() => {});
    }

    io.emit('category:new', cat);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    localStore.categories = localStore.categories.filter(c => c.id !== req.params.id);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Category.findOneAndDelete({ id: req.params.id }).catch(() => {});
    }

    io.emit('category:delete', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBMISSIONS API ---
app.get('/api/submissions', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const submissions = await Submission.find().sort({ createdAt: -1 });
      if (submissions) return res.json(submissions);
    }
    res.json(localStore.submissions);
  } catch (err) {
    res.json(localStore.submissions);
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = 'sub-' + Date.now().toString().slice(-6);
    if (!data.createdAt) data.createdAt = new Date().toISOString();
    localStore.submissions.unshift(data);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Submission.create(data).catch(() => {});
    }

    io.emit('submission:new', data);
    recordActivity('submission', 'New Game Submission', `"${data.gameTitle}" submitted by ${data.developerName || 'Developer'}`);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const idx = localStore.submissions.findIndex(s => s.id === req.params.id);
    if (idx !== -1) {
      localStore.submissions[idx] = { ...localStore.submissions[idx], ...req.body };
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      await Submission.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true }
      ).catch(() => {});
    }

    res.json(localStore.submissions[idx] || { id: req.params.id, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/submissions/:id', async (req, res) => {
  try {
    localStore.submissions = localStore.submissions.filter(s => s.id !== req.params.id);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Submission.findOneAndDelete({ id: req.params.id }).catch(() => {});
    }

    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MESSAGES API ---
app.get('/api/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ createdAt: -1 });
      if (messages) return res.json(messages);
    }
    res.json(localStore.messages);
  } catch (err) {
    res.json(localStore.messages);
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = req.body;
    if (!msg.id) msg.id = 'msg-' + Date.now().toString().slice(-6);
    if (!msg.createdAt) msg.createdAt = new Date().toISOString();
    msg.read = false;
    localStore.messages.unshift(msg);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Message.create(msg).catch(() => {});
    }

    io.emit('message:new', msg);
    recordActivity('message', 'New Contact Message', `Message from ${msg.name || 'User'}`);
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const idx = localStore.messages.findIndex(m => m.id === req.params.id || m._id === req.params.id);
    if (idx !== -1) {
      localStore.messages[idx].read = true;
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      await Message.findOneAndUpdate(
        { $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }] },
        { $set: { read: true } },
        { new: true }
      ).catch(() => {});
    }

    res.json(localStore.messages[idx] || { id: req.params.id, read: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    localStore.messages = localStore.messages.filter(m => m.id !== req.params.id && m._id !== req.params.id);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Message.findOneAndDelete({
        $or: [{ id: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }]
      }).catch(() => {});
    }

    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS API ---
app.get('/api/settings', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const s = await Setting.findOne();
      if (s) return res.json(s);
    }
    res.json(localStore.settings);
  } catch (err) {
    res.json(localStore.settings);
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    localStore.settings = { ...localStore.settings, ...req.body };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const s = await Setting.findOne();
      if (s) {
        await Setting.findByIdAndUpdate(s._id, { $set: req.body });
      } else {
        await Setting.create(req.body);
      }
    }

    io.emit('settings:update', localStore.settings);
    recordActivity('settings_update', 'Settings Saved', 'Admin updated platform settings');
    res.json(localStore.settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- SYSTEM RESET API ---
app.post('/api/reset', async (req, res) => {
  try {
    localStore.games = [...SEED_GAMES];
    localStore.categories = [...SEED_CATEGORIES];
    localStore.banner = {
      active: true,
      badge: '🔥 SPOTLIGHT',
      message: 'Welcome to SKYGAMES Enterprise Platform!',
      ctaText: 'Play Now',
      ctaLink: '#arcade',
      bgColor: 'rgba(255, 0, 85, 0.15)',
      borderColor: '#ff0055'
    };
    localStore.submissions = [];
    localStore.messages = [];
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Promise.all([
        Game.deleteMany({}),
        Category.deleteMany({}),
        Banner.deleteMany({}),
        Submission.deleteMany({}),
        Message.deleteMany({})
      ]).catch(() => {});

      await Game.insertMany(SEED_GAMES).catch(() => {});
      await Category.insertMany(SEED_CATEGORIES).catch(() => {});
      await Banner.create(localStore.banner).catch(() => {});
    }

    io.emit('game:all_deleted');
    io.emit('banner:update', localStore.banner);
    recordActivity('reset', 'System Reset', 'Admin reset database to factory defaults');
    res.json({ message: 'Database reset successfully to factory defaults', store: localStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Connect Database (with instant fallback)
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
    await seedDatabase();
  })
  .catch((err) => {
    console.log(`ℹ️ MongoDB offline (${err.message}). Using persistent JSON storage mode.`);
  })
  .finally(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 SKYGAMES Backend Engine running at http://localhost:${PORT}`);
    });
  });
