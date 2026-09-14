import mongoose from 'mongoose';
import { Banner } from '../models/Banner.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';
import { SEED_BANNER } from '../constants/seedData.js';

export async function getBanner(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    if (mongoose.connection.readyState === 1) {
      const b = await Banner.findOne().lean();
      if (b) return res.json(b);
    }
    res.json(localStore.banner || SEED_BANNER);
  } catch (err) {
    res.json(localStore.banner || SEED_BANNER);
  }
}

export async function updateBanner(req, res) {
  try {
    localStore.banner = { ...(localStore.banner || SEED_BANNER), ...req.body };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const b = await Banner.findOne();
      if (b) {
        await Banner.findByIdAndUpdate(b._id, { $set: req.body }, { new: true });
      } else {
        await Banner.create(req.body);
      }
    }

    const io = getIO();
    if (io) io.emit('banner:update', localStore.banner);
    recordActivity('banner_update', 'Announcement Broadcast', localStore.banner.message || 'Banner updated');
    res.json(localStore.banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteBanner(req, res) {
  try {
    localStore.banner = { active: false, message: '' };
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Banner.updateMany({}, { $set: { active: false, message: '' } }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('banner:update', localStore.banner);
    res.json({ success: true, message: 'Banner removed successfully', banner: localStore.banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
