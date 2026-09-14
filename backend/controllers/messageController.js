import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';

export async function getMessages(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ createdAt: -1 }).lean();
      if (messages) return res.json(messages);
    }
    res.json(localStore.messages);
  } catch (err) {
    res.json(localStore.messages);
  }
}

export async function createMessage(req, res) {
  try {
    const msg = { ...req.body };
    if (!msg.id) msg.id = 'msg-' + Date.now().toString().slice(-6);
    if (!msg.createdAt) msg.createdAt = new Date().toISOString();
    msg.read = false;

    localStore.messages.unshift(msg);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Message.create(msg).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('message:new', msg);
    recordActivity('message', 'New Contact Message', `Message from ${msg.name || 'User'}`);
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function markMessageRead(req, res) {
  try {
    const rawId = req.params.id;
    const idx = (localStore.messages || []).findIndex(
      m => m.id === rawId || (m._id && String(m._id) === rawId)
    );

    if (idx !== -1) {
      localStore.messages[idx].read = true;
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      await Message.findOneAndUpdate(
        { $or: [{ id: rawId }, { _id: mongoose.isValidObjectId(rawId) ? rawId : null }] },
        { $set: { read: true } },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('message:read', { id: rawId });
    res.json(localStore.messages[idx] || { id: rawId, read: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function markAllMessagesRead(req, res) {
  try {
    localStore.messages = (localStore.messages || []).map(m => ({ ...m, read: true }));
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Message.updateMany({}, { $set: { read: true } }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('message:all_read');
    res.json({ success: true, message: 'All messages marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteMessage(req, res) {
  try {
    const rawId = req.params.id;
    localStore.messages = (localStore.messages || []).filter(
      m => m.id !== rawId && (m._id ? String(m._id) !== rawId : true)
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Message.deleteMany({
        $or: [{ id: rawId }, { _id: mongoose.isValidObjectId(rawId) ? rawId : null }]
      }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('message:deleted', { id: rawId });
    res.json({ success: true, message: 'Message deleted', id: rawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
