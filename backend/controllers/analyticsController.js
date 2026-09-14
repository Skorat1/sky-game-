import mongoose from 'mongoose';
import { localStore } from '../services/storeService.js';
import { activeVisitors, gameActivePlayers, recentActivities } from '../services/socketService.js';
import { Stats } from 'fs';

export function getHealth(req, res) {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    storageMode: mongoose.connection.readyState === 1 ? 'mongodb' : 'json_store',
    totalGames: localStore.games.length,
    totalUsers: (localStore.users || []).length,
    onlinePlayers: activeVisitors.size
  });
}

export function getOnlineStats(req, res) {
  res.json({ count: activeVisitors.size });
}

export async function getLiveAnalytics(req, res) {
  try {
    const activeRooms = [];
    gameActivePlayers.forEach((count, gameId) => {
      if (count > 0) activeRooms.push({ gameId, count });
    });

    res.json({
      status: 'ok',
      message: 'api run success',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
