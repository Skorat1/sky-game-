import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO } from '../services/socketService.js';

export async function getCategories(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    let catList = [];
    if (mongoose.connection.readyState === 1) {
      catList = await Category.find().lean();
    }
    if (!catList || catList.length === 0) {
      catList = localStore.categories || [];
      if (mongoose.connection.readyState === 1 && catList.length > 0) {
        Category.insertMany(catList).catch(() => {});
      }
    }
    res.json(catList || []);
  } catch (err) {
    res.json(localStore.categories || []);
  }
}

export async function createCategory(req, res) {
  try {
    const cat = { ...req.body };
    if (!cat.id) {
      cat.id = (cat.name || 'cat')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const idx = (localStore.categories || []).findIndex(c => c.id === cat.id);
    if (idx !== -1) {
      localStore.categories[idx] = { ...localStore.categories[idx], ...cat };
    } else {
      localStore.categories.push(cat);
    }
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Category.findOneAndUpdate(
        { id: cat.id },
        { $set: cat },
        { upsert: true, new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('category:new', cat);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const rawId = String(req.params.id || '');
    const updates = { ...req.body };

    const idx = (localStore.categories || []).findIndex(
      c => String(c.id || '') === rawId || String(c._id || '') === rawId
    );

    let updated = null;
    if (idx !== -1) {
      localStore.categories[idx] = { ...localStore.categories[idx], ...updates };
      updated = localStore.categories[idx];
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      const updateConditions = [{ id: rawId }];
      if (mongoose.isValidObjectId(rawId)) {
        updateConditions.push({ _id: rawId });
      }
      updated = await Category.findOneAndUpdate(
        { $or: updateConditions },
        { $set: updates },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io && updated) io.emit('category:update', updated);
    res.json(updated || { id: rawId, ...updates });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const rawId = String(req.params.id || '');
    if (!rawId) {
      return res.status(400).json({ error: 'Category ID required' });
    }

    localStore.categories = (localStore.categories || []).filter(
      c => String(c.id || '') !== rawId && String(c._id || '') !== rawId
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const deleteConditions = [{ id: rawId }];
      if (mongoose.isValidObjectId(rawId)) {
        deleteConditions.push({ _id: rawId });
      }
      await Category.deleteMany({ $or: deleteConditions }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('category:delete', rawId);
    res.json({ success: true, message: 'Category deleted', id: rawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
