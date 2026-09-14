import mongoose from 'mongoose';
import { Submission } from '../models/Submission.js';
import { localStore, persistStore } from '../services/storeService.js';
import { getIO, recordActivity } from '../services/socketService.js';

export async function getSubmissions(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const submissions = await Submission.find().sort({ createdAt: -1 }).lean();
      if (submissions) return res.json(submissions);
    }
    res.json(localStore.submissions);
  } catch (err) {
    res.json(localStore.submissions);
  }
}

export async function createSubmission(req, res) {
  try {
    const data = { ...req.body };
    if (!data.id) data.id = 'sub-' + Date.now().toString().slice(-6);
    if (!data.createdAt) data.createdAt = new Date().toISOString();
    if (!data.status) data.status = 'pending';

    localStore.submissions.unshift(data);
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Submission.create(data).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('submission:new', data);
    recordActivity('submission', 'New Game Submission', `"${data.gameTitle || 'Game'}" submitted by ${data.developerName || 'Developer'}`);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateSubmission(req, res) {
  try {
    const rawId = req.params.id;
    const idx = (localStore.submissions || []).findIndex(
      s => s.id === rawId || (s._id && String(s._id) === rawId)
    );

    let updated = null;
    if (idx !== -1) {
      localStore.submissions[idx] = { ...localStore.submissions[idx], ...req.body };
      updated = localStore.submissions[idx];
      persistStore();
    }

    if (mongoose.connection.readyState === 1) {
      updated = await Submission.findOneAndUpdate(
        {
          $or: [
            { id: rawId },
            { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
          ]
        },
        { $set: req.body },
        { new: true }
      ).catch(() => { });
    }

    const io = getIO();
    if (io && updated) io.emit('submission:updated', updated);
    res.json(updated || { id: rawId, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteSubmission(req, res) {
  try {
    const rawId = req.params.id;
    localStore.submissions = (localStore.submissions || []).filter(
      s => s.id !== rawId && (s._id ? String(s._id) !== rawId : true)
    );
    persistStore();

    if (mongoose.connection.readyState === 1) {
      await Submission.deleteMany({
        $or: [
          { id: rawId },
          { _id: mongoose.isValidObjectId(rawId) ? rawId : null }
        ]
      }).catch(() => { });
    }

    const io = getIO();
    if (io) io.emit('submission:deleted', { id: rawId });
    res.json({ success: true, message: 'Submission deleted', id: rawId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
