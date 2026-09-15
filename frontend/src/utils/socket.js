import { io } from 'socket.io-client';
import { CONFIG } from '../config';

const { SOCKET_URL, STORAGE_KEYS } = CONFIG;

function getStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
  } catch {
    return '';
  }
}

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 15,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  auth: {
    token: getStoredToken()
  },
  query: {
    clientType: 'visitor'
  }
});

export function authenticateSocket(token) {
  try {
    socket.auth = { token: token || getStoredToken() };
    if (socket.connected) {
      socket.disconnect().connect();
    } else {
      socket.connect();
    }
  } catch (err) {
    console.warn('Socket auth update error:', err);
  }
}

export default socket;
