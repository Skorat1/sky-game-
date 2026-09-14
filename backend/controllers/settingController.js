import mongoose from 'mongoose';
import { Setting } from '../models/Setting.js';
import { Game } from '../models/Game.js';
import { Category } from '../models/Category.js';
import { Banner } from '../models/Banner.js';
import { Submission } from '../models/Submission.js';
import { Message } from '../models/Message.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';
import { SEED_GAMES, SEED_CATEGORIES, SEED_BANNER, SEED_SETTINGS } from '../constants/seedData.js';

export async function getSettings(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    if (mongoose.connection.readyState === 1) {
      const s = await Setting.findOne().lean();
      if (s) return res.json(s);
    }
    res.json(localStore.settings || SEED_SETTINGS);
  } catch (err) {
    res.json(localStore.settings || SEED_SETTINGS);
  }
}

export async function updateSettings(req, res) {
  try {
    localStore.settings = { ...(localStore.settings || SEED_SETTINGS), ...req.body };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const s = await Setting.findOne();
      if (s) {
        await Setting.findByIdAndUpdate(s._id, { $set: req.body }, { new: true });
      } else {
        await Setting.create(req.body);
      }
    }

    const io = getIO();
    if (io) io.emit('settings:update', localStore.settings);
    recordActivity('settings_update', 'Settings Saved', 'Admin updated platform settings');
    res.json(localStore.settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function resetDatabase(req, res) {
  try {
    localStore.games = [...SEED_GAMES];
    localStore.categories = [...SEED_CATEGORIES];
    localStore.banner = { ...SEED_BANNER };
    localStore.submissions = [];
    localStore.messages = [];
    localStore.settings = { ...SEED_SETTINGS };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Promise.all([
        Game.deleteMany({}),
        Category.deleteMany({}),
        Banner.deleteMany({}),
        Submission.deleteMany({}),
        Message.deleteMany({})
      ]).catch(() => { });

      await Game.insertMany(SEED_GAMES).catch(() => { });
      await Category.insertMany(SEED_CATEGORIES).catch(() => { });
      await Banner.create(localStore.banner).catch(() => { });
    }

    const io = getIO();
    if (io) {
      io.emit('game:all_deleted');
      io.emit('banner:update', localStore.banner);
      io.emit('settings:update', localStore.settings);
    }
    recordActivity('reset', 'System Reset', 'Admin reset database to factory defaults');
    res.json({ success: true, message: 'Database reset successfully to factory defaults', store: localStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
