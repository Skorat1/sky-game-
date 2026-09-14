import { Server } from 'socket.io';
import { verifyToken } from '../utils/crypto.js';

export const activeVisitors = new Set();
export const gameActivePlayers = new Map();
export const recentActivities = [];

let ioInstance = null;

export function getIO() {
  return ioInstance;
}

export function broadcastOnlineCount() {
  if (!ioInstance) return;
  const count = activeVisitors.size;
  ioInstance.emit('online:count', { count });
}

export function recordActivity(type, title, detail) {
  const activity = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    type,
    title,
    detail,
    timestamp: new Date().toISOString()
  };
  recentActivities.unshift(activity);
  if (recentActivities.length > 50) recentActivities.pop();
  if (ioInstance) {
    ioInstance.emit('activity:new', activity);
  }
}

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
  });

  ioInstance = io;

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization ? socket.handshake.headers.authorization.replace('Bearer ', '') : null);

    if (!token) {
      socket.user = { isGuest: true, id: 'guest-' + socket.id };
      return next();
    }

    const decoded = verifyToken(token);
    if (decoded) {
      socket.user = decoded;
    } else {
      socket.user = { isGuest: true, id: 'guest-' + socket.id };
    }
    next();
  });

  io.on('connection', (socket) => {
    const clientType = socket.handshake.query?.clientType;
    const isAdmin = clientType === 'admin';

    if (!isAdmin) {
      // Only count frontend website visitors
      activeVisitors.add(socket.id);
      broadcastOnlineCount();
    } else {
      // Admin connected: Join admin room and send current visitor count immediately
      socket.join('admin-room');
      socket.emit('online:count', { count: activeVisitors.size });
    }

    socket.on('request:online:count', () => {
      socket.emit('online:count', { count: activeVisitors.size });
    });

    socket.emit('activities:init', recentActivities.slice(0, 20));

    // Player joins a game room
    socket.on('game:join', (gameId) => {
      if (!gameId) return;
      socket.join(gameId);
      if (!gameActivePlayers.has(gameId)) {
        gameActivePlayers.set(gameId, new Set());
      }
      gameActivePlayers.get(gameId).add(socket.id);
      const count = gameActivePlayers.get(gameId).size;
      io.to(gameId).emit('game:players:count', { gameId, count });
      recordActivity('game_join', 'Player Joined', `Someone started playing "${gameId}"`);
    });

    // Player leaves a game room
    socket.on('game:leave', (gameId) => {
      if (!gameId) return;
      socket.leave(gameId);
      if (gameActivePlayers.has(gameId)) {
        gameActivePlayers.get(gameId).delete(socket.id);
        const count = gameActivePlayers.get(gameId).size;
        io.to(gameId).emit('game:players:count', { gameId, count });
      }
    });

    // Player sends real-time emoji reaction (🔥, 🎮, ⚡, 👏)
    socket.on('game:reaction', ({ gameId, emoji, username }) => {
      io.to(gameId).emit('game:reaction:broadcast', {
        gameId,
        emoji: emoji || '🔥',
        username: username || 'Player',
        timestamp: Date.now()
      });
    });

    // Player submits score
    socket.on('game:score', ({ gameId, score, username }) => {
      recordActivity('high_score', 'New High Score!', `${username || 'Player'} scored ${score} in ${gameId}`);
      io.emit('leaderboard:update', { gameId, score, username });
    });

    socket.on('disconnect', () => {
      if (activeVisitors.has(socket.id)) {
        activeVisitors.delete(socket.id);
        broadcastOnlineCount();
      }
      // Remove from active game rooms
      for (const [gameId, playersSet] of gameActivePlayers.entries()) {
        if (playersSet.has(socket.id)) {
          playersSet.delete(socket.id);
          io.to(gameId).emit('game:players:count', { gameId, count: playersSet.size });
        }
      }
    });
  });

  return io;
}
