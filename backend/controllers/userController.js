import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';
import { hashPassword, signToken } from '../utils/crypto.js';
import { sanitizeUser } from '../utils/sanitize.js';

export async function getUsers(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      return res.json((users || []).map(sanitizeUser));
    }
    res.json((localStore.users || []).map(sanitizeUser));
  } catch (err) {
    res.json((localStore.users || []).map(sanitizeUser));
  }
}

export async function getUserById(req, res) {
  try {
    const rawId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        $or: [
          { id: rawId },
          { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
        ]
      }).lean();
      if (user) return res.json(sanitizeUser(user));
    }

    const found = (localStore.users || []).find(
      u => u.id === rawId || (u._id && String(u._id) === rawId)
    );
    if (!found) return res.status(404).json({ error: 'User not found' });
    res.json(sanitizeUser(found));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { username, email, password, role, status, name } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanUsername = String(username).trim();

    const existingUser = (localStore.users || []).find(
      u => (u.email && u.email.toLowerCase() === cleanEmail) ||
        (u.username && u.username.toLowerCase() === cleanUsername.toLowerCase())
    );

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    const userId = 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
    const hashedPassword = password ? hashPassword(password) : hashPassword('Default@123');
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`;

    const newUser = {
      id: userId,
      username: cleanUsername,
      name: name ? String(name).trim() : cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      avatar,
      provider: 'email',
      role: role || 'user',
      status: status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    if (!localStore.users) localStore.users = [];
    localStore.users.unshift(newUser);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await User.create(newUser).catch(() => { });
    }

    const token = signToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      provider: newUser.provider
    });

    const io = getIO();
    if (io) io.emit('user:registered', sanitizeUser(newUser));
    recordActivity('user_register', 'New User Created', `Admin created account "${cleanUsername}"`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const rawId = String(req.params.id || '');
    if (!rawId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    localStore.users = (localStore.users || []).filter(
      u => String(u.id || '') !== rawId && String(u._id || '') !== rawId
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      const deleteConditions = [{ id: rawId }];
      if (mongoose.isValidObjectId(rawId)) {
        deleteConditions.push({ _id: rawId });
      }
      await User.deleteMany({ $or: deleteConditions }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('user:deleted', { id: rawId });
    recordActivity('user_delete', 'User Removed', `User ID "${rawId}" was permanently deleted`);
    res.json({ success: true, message: 'User deleted successfully', id: rawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const rawId = req.params.id;
    const updates = { ...req.body };
    if (updates.password && updates.password.trim()) {
      updates.password = hashPassword(updates.password.trim());
    } else {
      delete updates.password;
    }

    const idx = (localStore.users || []).findIndex(
      u => u.id === rawId || (u._id && String(u._id) === rawId)
    );
    let updated = null;
    if (idx !== -1) {
      localStore.users[idx] = { ...localStore.users[idx], ...updates };
      updated = localStore.users[idx];
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      updated = await User.findOneAndUpdate(
        { $or: [{ id: rawId }, { _id: mongoose.isValidObjectId(rawId) ? rawId : null }] },
        { $set: updates },
        { new: true }
      ).catch(() => { });
    }

    const sanitized = sanitizeUser(updated);
    const io = getIO();
    if (io && sanitized) io.emit('user:updated', sanitized);
    recordActivity('user_update', 'User Profile Updated', `User "${sanitized?.username || rawId}" was updated by Admin`);
    res.json({ success: true, user: sanitized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Cloud Game Progress Sync & State Hydration
 */
export async function syncCloudProgress(req, res) {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required for cloud save' });
    }

    const { favorites, recent, highScores, totalXp, level, unlockedBadges, questProgress } = req.body;
    const progressData = {
      favorites: Array.isArray(favorites) ? favorites : [],
      recent: Array.isArray(recent) ? recent : [],
      highScores: highScores || {},
      totalXp: Number(totalXp) || 0,
      level: Number(level) || 1,
      unlockedBadges: Array.isArray(unlockedBadges) ? unlockedBadges : [],
      questProgress: questProgress || {},
      lastSyncedAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      await User.findOneAndUpdate(
        { $or: [{ id: userId }, { _id: mongoose.isValidObjectId(userId) ? userId : null }] },
        { $set: { cloudSave: progressData } }
      ).catch(() => {});
    }

    const idx = (localStore.users || []).findIndex(
      u => u.id === userId || (u._id && String(u._id) === userId)
    );
    if (idx !== -1) {
      localStore.users[idx].cloudSave = progressData;
      persistStore();
    }

    return res.json({ success: true, cloudSave: progressData });
  } catch (err) {
    console.error('Cloud sync error:', err);
    return res.status(500).json({ error: 'Failed to sync cloud progress' });
  }
}

export async function getCloudProgress(req, res) {
  try {
    const userId = req.user ? req.user.id : req.params.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        $or: [{ id: userId }, { _id: mongoose.isValidObjectId(userId) ? userId : null }]
      }).lean();
    }

    if (!user) {
      user = (localStore.users || []).find(
        u => u.id === userId || (u._id && String(u._id) === userId)
      );
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      cloudSave: user.cloudSave || {
        favorites: [],
        recent: [],
        highScores: {},
        totalXp: 0,
        level: 1,
        unlockedBadges: [],
        questProgress: {}
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get cloud progress' });
  }
}
