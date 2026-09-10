import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { Game } from './models/Game.js';
import { Category } from './models/Category.js';
import { Banner } from './models/Banner.js';
import { Submission } from './models/Submission.js';
import { Message } from './models/Message.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skygames';

// Middleware
app.use(cors());
app.use(express.json());

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

async function seedDatabase() {
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany(SEED_CATEGORIES);
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create({
        active: false,
        badge: '🔥 TOURNAMENT LIVE',
        message: 'Welcome to SKYGAMES!',
        ctaText: 'Play Now',
        ctaLink: '#arcade',
        bgColor: 'rgba(255, 0, 85, 0.15)',
        borderColor: '#ff0055'
      });
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
  res.json({ status: 'ok', dbConnected: mongoose.connection.readyState === 1 });
});

// --- GAMES API ---
// Get all games
app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single game
app.get('/api/games/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create game
app.post('/api/games', async (req, res) => {
  try {
    const gameData = req.body;
    if (!gameData.id) {
      gameData.id = (gameData.title || 'game').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    }
    const newGame = await Game.create(gameData);
    res.status(201).json(newGame);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update game
app.put('/api/games/:id', async (req, res) => {
  try {
    const updated = await Game.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete single game
app.delete('/api/games/:id', async (req, res) => {
  try {
    const deleted = await Game.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Game not found' });
    res.json({ message: 'Game deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all games
app.delete('/api/games', async (req, res) => {
  try {
    await Game.deleteMany({});
    res.json({ message: 'All games deleted from database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Featured
app.patch('/api/games/:id/featured', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    game.featured = !game.featured;
    await game.save();
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increment play count
app.post('/api/games/:id/play', async (req, res) => {
  try {
    const game = await Game.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { plays: 1 } },
      { new: true }
    );
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- BANNER API ---
app.get('/api/banner', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) {
      banner = await Banner.create({ active: false, message: '' });
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/banner', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (banner) {
      banner = await Banner.findByIdAndUpdate(banner._id, { $set: req.body }, { new: true });
    } else {
      banner = await Banner.create(req.body);
    }
    res.json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/banner', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (banner) {
      banner.active = false;
      banner.message = '';
      await banner.save();
    }
    res.json({ message: 'Banner removed successfully', banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES API ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBMISSIONS API ---
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = 'sub-' + Date.now().toString().slice(-6);
    const sub = await Submission.create(data);
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/submissions/:id', async (req, res) => {
  try {
    const sub = await Submission.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- MESSAGES API ---
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    res.json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Connect Database
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB at', MONGODB_URI);
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`SKYGAMES Backend API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    // Still start Express server so fallback/alerts can report status
    app.listen(PORT, () => {
      console.log(`Backend API running in offline/unconnected mode on port ${PORT}`);
    });
  });
