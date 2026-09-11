import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : window.location.origin;

function getStoredToken() {
  try {
    return localStorage.getItem('sky_token') || '';
  } catch {
    return '';
  }
}

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
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
