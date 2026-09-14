import mongoose from 'mongoose';
import { Game } from '../models/Game.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';
import { sanitizeGameUrl } from '../utils/sanitize.js';
import { detectGameMetadata } from '../services/scraperService.js';

// Get all games (Supports filters: category, featured, search, limit)
export async function getGames(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { category, featured, search, limit } = req.query;

  try {
    let gamesList = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (category && category !== 'all') query.category = category;
      if (featured === 'true') query.featured = true;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      let mQuery = Game.find(query).sort({ createdAt: -1 });
      if (limit && !isNaN(Number(limit))) {
        mQuery = mQuery.limit(Number(limit));
      }
      gamesList = await mQuery.lean();
    }

    if (!gamesList || gamesList.length === 0) {
      gamesList = localStore.games || [];
      if (category && category !== 'all') {
        gamesList = gamesList.filter(g => g.category?.toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        gamesList = gamesList.filter(g => Boolean(g.featured));
      }
      if (search) {
        const q = search.toLowerCase();
        gamesList = gamesList.filter(g =>
          g.title?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          (Array.isArray(g.tags) && g.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
      if (limit && !isNaN(Number(limit))) {
        gamesList = gamesList.slice(0, Number(limit));
      }
    }

    res.json(gamesList);
  } catch (err) {
    res.json(localStore.games || []);
  }
}

// Get single game by ID / _id
export async function getGameById(req, res) {
  try {
    const rawId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const game = await Game.findOne({
        $or: [
          { id: rawId },
          { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
        ]
      }).lean();
      if (game) return res.json(game);
    }

    const found = (localStore.games || []).find(
      g => g.id === rawId || (g._id && String(g._id) === rawId)
    );
    if (!found) return res.status(404).json({ error: 'Game not found' });
    res.json(found);
  } catch (err) {
    const found = (localStore.games || []).find(g => g.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Game not found' });
    res.json(found);
  }
}

// Create new game
export async function createGame(req, res) {
  try {
    const gameData = { ...req.body };
    if (gameData.gameUrl) {
      gameData.gameUrl = sanitizeGameUrl(gameData.gameUrl);
    }
    if (!gameData.id) {
      gameData.id = (gameData.title || 'game')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
    }

    gameData.plays = typeof gameData.plays === 'number' ? gameData.plays : 0;
    gameData.likes = typeof gameData.likes === 'number' ? gameData.likes : 120;
    gameData.dislikes = typeof gameData.dislikes === 'number' ? gameData.dislikes : 4;

    const totalVotes = gameData.likes + gameData.dislikes;
    gameData.rating = totalVotes > 0 ? Number(((gameData.likes / totalVotes) * 5).toFixed(1)) : 4.8;
    if (!gameData.createdAt) gameData.createdAt = new Date().toISOString().split('T')[0];
    if (!Array.isArray(gameData.tags)) {
      gameData.tags = gameData.tags ? String(gameData.tags).split(',').map(t => t.trim()).filter(Boolean) : [];
    }

    // Update local store (upsert)
    const existingIdx = (localStore.games || []).findIndex(g => g.id === gameData.id);
    if (existingIdx !== -1) {
      localStore.games[existingIdx] = { ...localStore.games[existingIdx], ...gameData };
    } else {
      localStore.games.unshift(gameData);
    }
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        { id: gameData.id },
        { $set: gameData },
        { upsert: true, new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:created', gameData);
    recordActivity('game_create', 'New Game Published', `Admin published "${gameData.title}"`);
    res.status(201).json(gameData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Update game
export async function updateGame(req, res) {
  try {
    const rawId = req.params.id;
    const bodyData = { ...req.body };
    if (bodyData.gameUrl) {
      bodyData.gameUrl = sanitizeGameUrl(bodyData.gameUrl);
    }

    const idx = (localStore.games || []).findIndex(
      g => g.id === rawId || (g._id && String(g._id) === rawId)
    );

    let updated;
    if (idx !== -1) {
      const prev = localStore.games[idx];
      const likes = typeof bodyData.likes === 'number' ? bodyData.likes : (prev.likes || 120);
      const dislikes = typeof bodyData.dislikes === 'number' ? bodyData.dislikes : (prev.dislikes || 4);
      const total = likes + dislikes;
      const rating = total > 0 ? Number(((likes / total) * 5).toFixed(1)) : (prev.rating || 4.8);

      updated = {
        ...prev,
        ...bodyData,
        likes,
        dislikes,
        rating
      };
      localStore.games[idx] = updated;
    } else {
      updated = { id: rawId, ...bodyData };
      localStore.games.unshift(updated);
    }
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        {
          $or: [
            { id: rawId },
            { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
          ]
        },
        { $set: bodyData },
        { new: true, upsert: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:updated', updated);
    recordActivity('game_update', 'Game Updated', `Admin updated "${updated.title || rawId}"`);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete single game
export async function deleteGame(req, res) {
  try {
    const rawId = req.params.id;
    localStore.games = (localStore.games || []).filter(
      g => g.id !== rawId && (g._id ? String(g._id) !== rawId : true)
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.deleteMany({
        $or: [
          { id: rawId },
          { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
        ]
      }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:deleted', { id: rawId });
    recordActivity('game_delete', 'Game Deleted', `Game ID "${rawId}" was removed`);
    res.json({ success: true, message: 'Game deleted successfully', id: rawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete all games
export async function deleteAllGames(req, res) {
  try {
    localStore.games = [];
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.deleteMany({}).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:all_deleted');
    recordActivity('game_delete', 'All Games Reset', 'Admin cleared all games');
    res.json({ success: true, message: 'All games deleted from database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Toggle Featured
export async function toggleFeatured(req, res) {
  try {
    const rawId = req.params.id;
    const idx = (localStore.games || []).findIndex(
      g => g.id === rawId || (g._id && String(g._id) === rawId)
    );
    if (idx === -1) return res.status(404).json({ error: 'Game not found' });

    localStore.games[idx].featured = !localStore.games[idx].featured;
    const updated = localStore.games[idx];
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        {
          $or: [
            { id: rawId },
            { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
          ]
        },
        { $set: { featured: updated.featured } },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Increment play count
export async function recordPlay(req, res) {
  try {
    const rawId = req.params.id;
    const idx = (localStore.games || []).findIndex(
      g => g.id === rawId || (g._id && String(g._id) === rawId)
    );

    let plays = 1;
    let title = rawId;
    if (idx !== -1) {
      localStore.games[idx].plays = (localStore.games[idx].plays || 0) + 1;
      plays = localStore.games[idx].plays;
      title = localStore.games[idx].title || rawId;
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        {
          $or: [
            { id: rawId },
            { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
          ]
        },
        { $inc: { plays: 1 } },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('game:play:increment', { id: rawId, plays, title });
    recordActivity('game_play', 'Game Played', `"${title}" was launched. Total plays: ${plays.toLocaleString()}`);
    res.json({ success: true, id: rawId, plays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Cast live game vote (like / dislike)
export async function voteGame(req, res) {
  try {
    const { vote, previousVote } = req.body || {};
    const gameId = req.params.id;
    const idx = (localStore.games || []).findIndex(
      g => g.id === gameId || (g._id && String(g._id) === gameId)
    );

    if (idx === -1) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = localStore.games[idx];
    let likes = typeof game.likes === 'number' ? game.likes : 100;
    let dislikes = typeof game.dislikes === 'number' ? game.dislikes : 4;

    // Undo previous vote if any
    if (previousVote === 'like') {
      likes = Math.max(0, likes - 1);
    } else if (previousVote === 'dislike') {
      dislikes = Math.max(0, dislikes - 1);
    }

    // Apply new vote
    if (vote === 'like') {
      likes += 1;
    } else if (vote === 'dislike') {
      dislikes += 1;
    }

    const totalVotes = likes + dislikes;
    const rating = totalVotes > 0 ? Number(((likes / totalVotes) * 5).toFixed(1)) : 4.8;

    const updatedGame = {
      ...game,
      likes,
      dislikes,
      rating
    };

    localStore.games[idx] = updatedGame;
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Game.findOneAndUpdate(
        { $or: [{ id: gameId }, { _id: mongoose.isValidObjectId(gameId) ? gameId : null }] },
        { $set: { likes, dislikes, rating } },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) {
      io.emit('game:updated', updatedGame);
      io.emit('game:voted', { id: updatedGame.id, likes, dislikes, rating, vote });
    }

    if (vote === 'like') {
      recordActivity('game_like', 'Game Liked', `Someone liked "${updatedGame.title}". Total likes: ${likes.toLocaleString()}`);
    }

    res.json({
      success: true,
      game: updatedGame,
      id: updatedGame.id,
      likes,
      dislikes,
      rating,
      vote
    });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Auto-detect metadata endpoint
export async function detectMetadata(req, res) {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    const detected = await detectGameMetadata(url);
    return res.json({
      success: Boolean(detected.thumbnail || detected.title),
      data: detected
    });
  } catch (error) {
    console.error('Error detecting metadata:', error);
    res.status(500).json({ error: 'Failed to detect game metadata', details: error.message });
  }
}
