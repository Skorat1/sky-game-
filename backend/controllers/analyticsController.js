import mongoose from 'mongoose';
import os from 'os';
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

    // Generate simulated 7-day traffic analytics
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
    
    const weeklyAnalytics = [];
    for (let i = 0; i < 7; i++) {
      const dayName = days[(todayIndex + i) % 7];
      const basePlays = 12000 + (Math.random() * 20000); // 12k - 32k
      
      weeklyAnalytics.push({
        day: dayName,
        plays: Math.floor(basePlays),
        players: Math.floor(basePlays * 0.4)
      });
    }

    // Telemetry Collection
    const cpuLoad = os.loadavg()[0]; // 1 minute load average
    const cpuPct = Math.min(100, Math.max(1, Math.round(cpuLoad * 10)));
    const memoryMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const latency = Math.floor(Math.random() * 20) + 10; // Simulated latency 10-30ms
    const activeDbConn = mongoose.connection.readyState === 1 ? mongoose.connections.length : 0;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      weeklyAnalytics,
      telemetry: {
        cpuLoad: cpuPct,
        memoryMB,
        latency,
        activeDbConn
      },
      activities: recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
