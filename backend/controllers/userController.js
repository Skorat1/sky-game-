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
    const rawId = req.params.id;
    localStore.users = (localStore.users || []).filter(
      u => u.id !== rawId && (u._id ? String(u._id) !== rawId : true)
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({
        $or: [
          { id: rawId },
          { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
        ]
      }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('user:deleted', { id: rawId });
    recordActivity('user_delete', 'User Removed', `User ID "${rawId}" was permanently deleted`);
    res.json({ success: true, message: 'User deleted successfully' });
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
